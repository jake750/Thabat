package tn.thabat.app;

import android.content.ContentResolver;
import android.content.ContentValues;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.provider.MediaStore;
import android.util.Base64;
import android.webkit.JavascriptInterface;
import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;

public class Bridge {
    final MainActivity a;
    Bridge(MainActivity a) { this.a = a; }

    @JavascriptInterface
    public String version() { return "8"; }

    /* 3.59: the next prayer as an ongoing notification; the month widget */
    @JavascriptInterface
    public void prayerNotif(String json) { Ongoing.prayer(a.getApplicationContext(), json); }

    @JavascriptInterface
    public void calWidget(String json) { try { a.getSharedPreferences("thabat", 0).edit().putString("calw", json).apply(); Widget7.render(a.getApplicationContext()); } catch (Throwable t) {} }

    /* 3.48: update the app from inside it (download from Thabat's GitHub releases, check, open the system installer) */
    @JavascriptInterface
    public void apkUpdate(String url) { ApkUpd.start(a, url); }

    @JavascriptInterface
    public void apkInstall() { ApkUpd.install(a); }

    @JavascriptInterface
    public boolean apkReady() { try { return ApkUpd.file(a).exists() && ApkUpd.check(a, ApkUpd.file(a)) == null; } catch (Throwable t) { return false; } }

    /* 3.26 */
    @JavascriptInterface
    public void mediaState(String json) { MediaSvc.state(a.getApplicationContext(), json); }

    @JavascriptInterface
    public String sysColors() {
        try {
            if (Build.VERSION.SDK_INT < 31) return "";
            int[] ids = { android.R.color.system_accent1_200, android.R.color.system_accent1_400, android.R.color.system_accent1_600, android.R.color.system_accent2_400, android.R.color.system_neutral1_900 };
            StringBuilder s = new StringBuilder();
            for (int id : ids) { if (s.length() > 0) s.append(','); s.append(String.format("#%06X", a.getResources().getColor(id, null) & 0xFFFFFF)); }
            return s.toString();
        } catch (Throwable t) { return ""; }
    }

    @JavascriptInterface
    public void setWidgetOpen(String page) { a.getSharedPreferences("thabat", 0).edit().putString("wopen", page == null ? "" : page).apply(); Widget.render(a.getApplicationContext()); }

    @JavascriptInterface
    public String takeTaskActs() { android.content.SharedPreferences p = a.getSharedPreferences("thabat", 0); String v = p.getString("tkacts", "[]"); p.edit().putString("tkacts", "[]").apply(); return v; }

    @JavascriptInterface
    public void schedule(String json) { Sched.apply(a.getApplicationContext(), json); }

    @JavascriptInterface
    public void openUrl(final String url) { a.openExternal(url); }

    @JavascriptInterface
    public void share(String title, String text) { a.share(title, text); }

    /** Saves a file (base64 content) to the phone's Downloads folder. Returns a short location text or "" on failure. */
    @JavascriptInterface
    public String saveFile(String name, String mime, String b64) {
        try {
            byte[] data = Base64.decode(b64, 0);
            if (Build.VERSION.SDK_INT >= 29) {
                ContentResolver cr = a.getContentResolver();
                ContentValues v = new ContentValues();
                v.put("_display_name", name);
                v.put("mime_type", mime);
                v.put("relative_path", "Download/Thabat");
                Uri u = cr.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, v);
                OutputStream os = cr.openOutputStream(u);
                os.write(data);
                os.close();
                return "Download/Thabat/" + name;
            } else {
                File dir = a.getExternalFilesDir("Download");
                File f = new File(dir, name);
                FileOutputStream os = new FileOutputStream(f);
                os.write(data);
                os.close();
                return f.getAbsolutePath();
            }
        } catch (Throwable t) {
            return "";
        }
    }

    /** Saves a custom fajr adhan (base64) in the app's private folder; empty string removes it. */
    @JavascriptInterface
    public boolean saveAdhanFile(String b64) {
        try {
            File f = new File(a.getFilesDir(), "adhan_fajr.audio");
            if (b64 == null || b64.length() == 0) { f.delete(); return true; }
            byte[] data = Base64.decode(b64, 0);
            FileOutputStream os = new FileOutputStream(f);
            os.write(data);
            os.close();
            return true;
        } catch (Throwable t) { return false; }
    }

    /** Plays the adhan now with the given options (settings "test" button). */
    @JavascriptInterface
    public void testAdhan(String mode, int vol, boolean fajr, String title, String stopLbl) {
        try {
            Intent s = new Intent(a, AdhanService.class);
            s.putExtra("title", title); s.putExtra("body", ""); s.putExtra("stopLbl", stopLbl);
            s.putExtra("volStop", true); s.putExtra("mode", mode); s.putExtra("vol", String.valueOf(vol)); s.putExtra("fajr", fajr ? "1" : "0");
            a.startForegroundService(s);
        } catch (Throwable t) {}
    }

    /** Ends the prayer quiet time (set when the adhan alarm fires). */
    @JavascriptInterface
    public void setQuiet(String untilMs) {
        try { a.getSharedPreferences("thabat", 0).edit().putLong("quietUntil", Long.parseLong(untilMs)).apply(); } catch (Throwable t) {}
    }

    /** Battery level, charging and power-saver state as JSON. */
    @JavascriptInterface
    public String power() {
        try {
            Intent b = a.registerReceiver(null, new android.content.IntentFilter("android.intent.action.BATTERY_CHANGED"));
            int lvl = b == null ? -1 : b.getIntExtra("level", -1), sc = b == null ? 100 : b.getIntExtra("scale", 100), pl = b == null ? 0 : b.getIntExtra("plugged", 0);
            android.os.PowerManager pm = (android.os.PowerManager) a.getSystemService("power");
            boolean saver = pm != null && pm.isPowerSaveMode();
            int pct = lvl < 0 ? -1 : Math.round(lvl * 100f / Math.max(1, sc));
            return "{\"lvl\":" + pct + ",\"plug\":" + (pl != 0) + ",\"saver\":" + saver + "}";
        } catch (Throwable t) { return "{}"; }
    }

    @JavascriptInterface
    public void remind(int id, String atMs, String title, String body, String open) { try { Sched.remind(a.getApplicationContext(), id, Long.parseLong(atMs), title, body, open); } catch (Throwable t) {} }

    @JavascriptInterface
    public void cancelRemind(int id) { Sched.cancelRemind(a.getApplicationContext(), id); }

    @JavascriptInterface
    public String takePrayLater() { android.content.SharedPreferences p = a.getSharedPreferences("thabat", 0); String v = p.getString("prayLater", ""); if (v.length() > 0) p.edit().remove("prayLater").apply(); return v; }

    @JavascriptInterface
    public void stopAdhan() { try { Intent s = new Intent(a, AdhanService.class); s.setAction(AdhanService.STOP); a.startService(s); } catch (Throwable t) {} }

    @JavascriptInterface
    public String takeOpen() { String o = a.pendingOpen; a.pendingOpen = null; return o == null ? "" : o; }

    @JavascriptInterface
    public void widget(String json) {
        try { a.getSharedPreferences("thabat", 0).edit().putString("widget", json).apply(); Widget.render(a.getApplicationContext()); } catch (Throwable t) {}
    }

    @JavascriptInterface
    public void widgetX(String json) {
        try { a.getSharedPreferences("thabat", 0).edit().putString("wx", json).apply(); Widget4.render(a.getApplicationContext()); Widget5.render(a.getApplicationContext()); } catch (Throwable t) {}
    }

    @JavascriptInterface
    public String takeWx() { android.content.SharedPreferences p = a.getSharedPreferences("thabat", 0); String v = p.getString("wxDone", "[]"); p.edit().putString("wxDone", "[]").apply(); return v; }

    @JavascriptInterface
    public void setFullscreen(final boolean on) {
        a.runOnUiThread(new FsRun(a, on));
    }

    @JavascriptInterface
    public void timerNotif(String json) { Ongoing.timer(a.getApplicationContext(), json); }

    @JavascriptInterface
    public String takeTimerActs() { android.content.SharedPreferences p = a.getSharedPreferences("thabat", 0); String v = p.getString("tacts", "[]"); p.edit().putString("tacts", "[]").apply(); return v; }

    @JavascriptInterface
    public void wirdNotif(String json) { a.getSharedPreferences("thabat", 0).edit().putInt("wadd", 0).apply(); Ongoing.wird(a.getApplicationContext(), json); }

    @JavascriptInterface
    public int takeWird() { android.content.SharedPreferences p = a.getSharedPreferences("thabat", 0); int v = p.getInt("wadd", 0); p.edit().putInt("wadd", 0).apply(); return v; }

    @JavascriptInterface
    public void tsbWidget(String json) { a.getSharedPreferences("thabat", 0).edit().putString("tsbCfg", json).apply(); Widget3.render(a.getApplicationContext()); }

    @JavascriptInterface
    public String takeTsb() { android.content.SharedPreferences p = a.getSharedPreferences("thabat", 0); String v = p.getString("tsbTaps", "[]"); p.edit().putString("tsbTaps", "[]").apply(); return v; }

    @JavascriptInterface
    public boolean dndGranted() { try { return Ongoing.nm(a).isNotificationPolicyAccessGranted(); } catch (Throwable t) { return false; } }

    @JavascriptInterface
    public void dndOpen() { try { Intent i = new Intent("android.settings.NOTIFICATION_POLICY_ACCESS_SETTINGS"); i.addFlags(0x10000000); a.startActivity(i); } catch (Throwable t) {} }

    @JavascriptInterface
    public void dndEnd() { Ongoing.dndEnd(a.getApplicationContext()); }

    @JavascriptInterface
    public String bioAvail() { try { if (Build.VERSION.SDK_INT < 29) return "old"; android.app.KeyguardManager k = (android.app.KeyguardManager) a.getSystemService("keyguard"); return k != null && k.isDeviceSecure() ? "ok" : "nolock"; } catch (Throwable t) { return "error"; } }

    @JavascriptInterface
    public void bioAuth(String title, String sub) { a.runOnUiThread(new MainActivity.BioRun(a, title, sub)); }

    @JavascriptInterface
    public void dictate(String lang, String prompt) { a.runOnUiThread(new DictRun(a, lang, prompt)); }

    static class DictRun implements Runnable {
        final MainActivity a; final String lang, prompt;
        DictRun(MainActivity a, String lang, String prompt) { this.a = a; this.lang = lang; this.prompt = prompt; }
        public void run() { a.dictate(lang, prompt); }
    }

    static class FsRun implements Runnable {
        final MainActivity a; final boolean on;
        FsRun(MainActivity a, boolean on) { this.a = a; this.on = on; }
        public void run() { a.applyFullscreen(on); }
    }

    /* 3.71: the status and navigation bars take the page's colour; light pages get dark icons */
    @JavascriptInterface
    public void barColors(String status, String nav, boolean light) { a.runOnUiThread(new BarRun(a, status, nav, light)); }

    static class BarRun implements Runnable {
        final MainActivity a; final String s, n; final boolean light;
        BarRun(MainActivity a, String s, String n, boolean light) { this.a = a; this.s = s; this.n = n; this.light = light; }
        public void run() {
            try {
                android.view.Window w = a.getWindow();
                w.setStatusBarColor(android.graphics.Color.parseColor(s));
                w.setNavigationBarColor(android.graphics.Color.parseColor(n));
                android.view.View d = w.getDecorView();
                int f = d.getSystemUiVisibility();
                if (Build.VERSION.SDK_INT >= 23) f = light ? (f | android.view.View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR) : (f & ~android.view.View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR);
                if (Build.VERSION.SDK_INT >= 26) f = light ? (f | android.view.View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR) : (f & ~android.view.View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR);
                d.setSystemUiVisibility(f);
            } catch (Throwable t) {}
        }
    }
}
