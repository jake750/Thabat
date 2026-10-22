package tn.thabat.app;

import android.util.Base64;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.RandomAccessFile;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;
import org.json.JSONObject;

/** 3.93: the Taysir mushafs (alwa7y.com) kept on the phone itself, so they work without the PC.
 *  Only the 18 fixed file names on www.alwa7y.com can be fetched (the id picks the name); redirects may only stay on that host.
 *  The copy lives in the app's private files (files/tayseer/<id>.pdf); the page reads byte ranges through tsRead (base64). */
public class TsDl {
    static final Map<String, String> NAMES = new HashMap<String, String>();
    static {
        String[] a = { "kaloon", "TayseerKaloon", "warsh", "TayseerWarsh", "asbhany", "TayseerWarshAsbhany", "kathir", "TayseerKathir", "dory", "TayseerDoryBasry",
            "sosy", "TayseerSosy", "hesham", "TayseerHesham", "thakwan", "TayseerThakwan", "asem", "TayseerAsem", "hafs", "TayseerHafs", "hafskasr", "TayseerHafsKasr",
            "khalaf", "TayseerKhalafHamza", "khalaft", "TayseerKhalafHamzaTayeba", "khallad", "TayseerKhallad", "kesay", "TayseerKesay", "jafar", "TayseerJafar",
            "yakob", "TayseerYakob", "khalaf10", "TayseerKhalaf10" };
        for (int i = 0; i < a.length; i += 2) NAMES.put(a[i], a[i + 1]);
    }
    static final Map<String, long[]> RUN = new HashMap<String, long[]>();   /* id -> {got, len} */
    static final Map<String, Boolean> STOP = new HashMap<String, Boolean>();
    static final Map<String, Boolean> ERR = new HashMap<String, Boolean>();

    static File dir(android.content.Context c) { File d = new File(c.getFilesDir(), "tayseer"); d.mkdirs(); return d; }
    static File pdf(android.content.Context c, String id) { return new File(dir(c), id + ".pdf"); }

    static void js(final MainActivity a, final String id, final String kind, final String val) {
        if (a == null) return;
        a.runOnUiThread(new Runnable() { public void run() { try { a.web.evaluateJavascript("window.thabatTs&&window.thabatTs(" + JSONObject.quote(id) + "," + JSONObject.quote(kind) + "," + JSONObject.quote(val) + ")", null); } catch (Throwable t) {} } });
    }

    static synchronized String state(android.content.Context c) {
        try {
            JSONObject o = new JSONObject();
            for (String id : NAMES.keySet()) {
                JSONObject s = new JSONObject(); File f = pdf(c, id);
                if (f.exists()) { s.put("s", "ok"); s.put("n", f.length()); }
                else if (RUN.containsKey(id)) { long[] r = RUN.get(id); s.put("s", "run"); s.put("got", r[0]); s.put("len", r[1]); }
                else s.put("s", ERR.containsKey(id) ? "err" : "none");
                o.put(id, s);
            }
            return o.toString();
        } catch (Throwable t) { return "{}"; }
    }

    static synchronized void start(final MainActivity a, final String id) {
        if (!NAMES.containsKey(id) || RUN.containsKey(id) || pdf(a, id).exists()) return;
        if (RUN.size() >= 2) { js(a, id, "err", "busy"); return; }
        RUN.put(id, new long[] { 0, 0 }); ERR.remove(id); STOP.remove(id);
        new Thread(new Runnable() { public void run() {
            File out = pdf(a, id), part = new File(out.getPath() + ".part");
            try {
                String u = "https://www.alwa7y.com/downloads/" + NAMES.get(id) + ".pdf"; HttpURLConnection c = null;
                for (int hop = 0; hop < 6; hop++) {
                    c = (HttpURLConnection) new URL(u).openConnection();
                    c.setInstanceFollowRedirects(false); c.setConnectTimeout(20000); c.setReadTimeout(30000); c.setRequestProperty("User-Agent", "Mozilla/5.0");
                    int code = c.getResponseCode();
                    if (code >= 300 && code < 400) {
                        String loc = c.getHeaderField("Location"); c.disconnect();
                        if (loc == null) throw new Exception("redirect");
                        URL nu = new URL(new URL(u), loc);
                        if (!"www.alwa7y.com".equals(nu.getHost()) || !(nu.getProtocol().equals("http") || nu.getProtocol().equals("https"))) throw new Exception("host");
                        u = nu.toString(); continue;
                    }
                    if (code != 200) throw new Exception("http " + code);
                    break;
                }
                long len = c.getContentLengthLong(), got = 0; int last = -1;
                synchronized (TsDl.class) { RUN.get(id)[1] = len; }
                InputStream in = c.getInputStream(); FileOutputStream fo = new FileOutputStream(part);
                byte[] buf = new byte[65536]; int n;
                try {
                    while ((n = in.read(buf)) > 0) {
                        if (STOP.containsKey(id)) throw new Exception("stop");
                        fo.write(buf, 0, n); got += n;
                        synchronized (TsDl.class) { RUN.get(id)[0] = got; }
                        if (len > 0) { int p = (int) (got * 100 / len); if (p != last) { last = p; js(a, id, "p", String.valueOf(p)); } }
                    }
                } finally { fo.close(); in.close(); c.disconnect(); }
                RandomAccessFile rf = new RandomAccessFile(part, "r"); byte[] h = new byte[5]; rf.readFully(h); long size = rf.length(); rf.close();
                if (!"%PDF-".equals(new String(h, "US-ASCII")) || size < 5000000 || (len > 0 && size != len)) throw new Exception("bad");
                if (!part.renameTo(out)) throw new Exception("rename");
                synchronized (TsDl.class) { RUN.remove(id); }
                js(a, id, "ok", String.valueOf(size));
            } catch (Throwable t) {
                part.delete();
                boolean stopped = STOP.containsKey(id);
                synchronized (TsDl.class) { RUN.remove(id); if (!stopped) ERR.put(id, true); STOP.remove(id); }
                js(a, id, stopped ? "stop" : "err", stopped ? "" : "net");
            }
        } }).start();
    }

    static void stop(String id) { if (RUN.containsKey(id)) STOP.put(id, true); }

    static synchronized void del(android.content.Context c, String id) { if (!NAMES.containsKey(id)) return; stop(id); pdf(c, id).delete(); ERR.remove(id); }

    /* a byte range of the kept copy, as base64 ("" when there is no copy) */
    static String read(android.content.Context c, String id, long start, int n) {
        if (!NAMES.containsKey(id) || n <= 0 || n > 4194304) return "";
        try {
            File f = pdf(c, id); if (!f.exists()) return "";
            RandomAccessFile rf = new RandomAccessFile(f, "r");
            try {
                long len = rf.length(); if (start < 0 || start >= len) return "";
                int m = (int) Math.min(n, len - start); byte[] b = new byte[m]; rf.seek(start); rf.readFully(b);
                return Base64.encodeToString(b, Base64.NO_WRAP);
            } finally { rf.close(); }
        } catch (Throwable t) { return ""; }
    }
}
