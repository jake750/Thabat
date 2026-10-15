package tn.thabat.app;

import android.content.Intent;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.Signature;
import android.net.Uri;
import android.os.Build;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Arrays;

/** 3.48: download the new Thabat.apk from Thabat's GitHub releases only, check that it is Thabat signed with the same key,
 *  then hand it to the system installer (the user confirms there). Progress goes back to window.thabatApk(kind, value). */
public class ApkUpd {
    static volatile boolean busy;

    static void js(final MainActivity a, final String kind, final String val) {
        if (a == null) return;
        a.runOnUiThread(new Runnable() { public void run() { try { a.web.evaluateJavascript("window.thabatApk&&window.thabatApk(" + org.json.JSONObject.quote(kind) + "," + org.json.JSONObject.quote(val) + ")", null); } catch (Throwable t) {} } });
    }

    static File file(android.content.Context c) { File d = new File(c.getCacheDir(), "upd"); d.mkdirs(); return new File(d, "Thabat.apk"); }

    static boolean allowed(String u) {
        return u != null && (u.startsWith("https://github.com/jake750/Thabat/releases/download/") || u.equals("https://github.com/jake750/Thabat/releases/latest/download/Thabat.apk"));
    }

    static void start(final MainActivity a, final String url) {
        if (busy) return;
        if (!allowed(url)) { js(a, "err", "url"); return; }
        busy = true;
        new Thread(new Runnable() { public void run() {
            File out = file(a), part = new File(out.getPath() + ".part");
            try {
                String u = url; HttpURLConnection c = null;
                for (int hop = 0; hop < 6; hop++) {
                    c = (HttpURLConnection) new URL(u).openConnection();
                    c.setInstanceFollowRedirects(false); c.setConnectTimeout(20000); c.setReadTimeout(30000); c.setRequestProperty("User-Agent", "Thabat-Android");
                    int code = c.getResponseCode();
                    if (code >= 300 && code < 400) { String loc = c.getHeaderField("Location"); c.disconnect(); if (loc == null || !loc.startsWith("https://")) throw new Exception("redirect"); u = loc; continue; }
                    if (code != 200) throw new Exception("http " + code);
                    break;
                }
                long len = c.getContentLengthLong(), got = 0; int last = -1;
                InputStream in = c.getInputStream(); FileOutputStream fo = new FileOutputStream(part);
                byte[] buf = new byte[65536]; int n;
                while ((n = in.read(buf)) > 0) { fo.write(buf, 0, n); got += n; if (len > 0) { int p = (int) (got * 100 / len); if (p != last) { last = p; js(a, "p", String.valueOf(p)); } } }
                fo.close(); in.close(); c.disconnect();
                if (out.exists()) out.delete();
                if (!part.renameTo(out)) throw new Exception("rename");
                String why = check(a, out);
                if (why != null) { out.delete(); js(a, "err", why); busy = false; return; }
                js(a, "ready", "");
                install(a);
            } catch (Throwable t) { part.delete(); js(a, "err", "net"); }
            busy = false;
        } }).start();
    }

    /* the file must be tn.thabat.app, newer than this app, and signed with the same certificate */
    static String check(MainActivity a, File f) {
        try {
            PackageManager pm = a.getPackageManager();
            int fl = Build.VERSION.SDK_INT >= 28 ? PackageManager.GET_SIGNING_CERTIFICATES : PackageManager.GET_SIGNATURES;
            PackageInfo nw = pm.getPackageArchiveInfo(f.getPath(), fl), me = pm.getPackageInfo(a.getPackageName(), fl);
            if (nw == null || !a.getPackageName().equals(nw.packageName)) return "pkg";
            long vn = Build.VERSION.SDK_INT >= 28 ? nw.getLongVersionCode() : nw.versionCode, vm = Build.VERSION.SDK_INT >= 28 ? me.getLongVersionCode() : me.versionCode;
            if (vn < vm) return "old";
            Signature[] s1 = sigs(nw), s2 = sigs(me);
            if (s1 == null || s2 == null || s1.length == 0) return "sig";
            for (Signature x : s1) { boolean ok = false; for (Signature y : s2) if (Arrays.equals(x.toByteArray(), y.toByteArray())) ok = true; if (!ok) return "sig"; }
            return null;
        } catch (Throwable t) { return "check"; }
    }

    static Signature[] sigs(PackageInfo p) {
        if (Build.VERSION.SDK_INT >= 28) { if (p.signingInfo == null) return null; return p.signingInfo.hasMultipleSigners() ? p.signingInfo.getApkContentsSigners() : p.signingInfo.getSigningCertificateHistory(); }
        return p.signatures;
    }

    /* opens the system installer; if Thabat may not install apps yet, opens that setting first (the app asks again on return) */
    static void install(final MainActivity a) {
        a.runOnUiThread(new Runnable() { public void run() {
            try {
                File f = file(a); if (!f.exists()) { js(a, "err", "missing"); return; }
                if (Build.VERSION.SDK_INT >= 26 && !a.getPackageManager().canRequestPackageInstalls()) {
                    Intent s = new Intent("android.settings.MANAGE_UNKNOWN_APP_SOURCES", Uri.parse("package:" + a.getPackageName()));
                    s.addFlags(0x10000000); a.startActivity(s); js(a, "perm", ""); return;
                }
                Intent i = new Intent(Intent.ACTION_VIEW);
                i.setDataAndType(Uri.parse("content://" + ApkProvider.AUTH + "/Thabat.apk"), "application/vnd.android.package-archive");
                i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | 0x10000000);
                a.startActivity(i); js(a, "opened", "");
            } catch (Throwable t) { js(a, "err", "install"); }
        } });
    }
}
