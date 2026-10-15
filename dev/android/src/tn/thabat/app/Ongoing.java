package tn.thabat.app;

import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import org.json.JSONArray;
import org.json.JSONObject;

/** Ongoing notifications (timer, daily wird) and prayer-time Do Not Disturb. */
public class Ongoing {
    static final int NID_T = 7801, NID_W = 7802, NID_P = 7803;
    static final int FLAGS = 0x08000000 | 0x04000000;

    static SharedPreferences p(Context c) { return c.getSharedPreferences("thabat", 0); }
    static NotificationManager nm(Context c) { return (NotificationManager) c.getSystemService("notification"); }

    static void channel(Context c, String id, String name) {
        try { NotificationChannel ch = new NotificationChannel(id, name, 2); ch.setSound(null, null); ch.enableVibration(false); ch.setShowBadge(false); nm(c).createNotificationChannel(ch); } catch (Throwable t) {}
    }

    static PendingIntent open(Context c, String what, int req) {
        Intent o = new Intent(c, MainActivity.class);
        o.addFlags(0x10000000 | 0x20000000);
        if (what != null) { o.putExtra("open", what); o.setAction("tn.thabat.app.OPEN." + what); }
        return PendingIntent.getActivity(c, req, o, FLAGS);
    }

    static PendingIntent act(Context c, String action, String a, int req) {
        Intent i = new Intent(c, ActReceiver.class);
        i.setAction(action);
        if (a != null) i.putExtra("a", a);
        return PendingIntent.getBroadcast(c, req, i, FLAGS);
    }

    /* ---------- timer ---------- */
    static void timer(Context c, String json) {
        try {
            p(c).edit().putString("tn", json).apply();
            JSONObject o = new JSONObject(json);
            String mode = o.optString("mode", "idle");
            if (!o.optBoolean("on", true) || !(mode.equals("work") || mode.equals("brk"))) { nm(c).cancel(NID_T); return; }
            channel(c, "timer", o.optString("chName", "Timer"));
            boolean brk = mode.equals("brk");
            Notification.Builder b = new Notification.Builder(c, "timer")
                    .setSmallIcon(c.getApplicationInfo().icon)
                    .setContentTitle(brk ? o.optString("brkTitle", "Break") : o.optString("title", "Thabat"))
                    .setContentText(brk ? o.optString("brkText", "") : o.optString("text", ""))
                    .setOngoing(true).setOnlyAlertOnce(true).setShowWhen(true).setUsesChronometer(true)
                    .setColor(0xFFFDDB00).setCategory("progress").setVisibility(1)
                    .setContentIntent(open(c, "today", 7811));
            long end = o.optLong("end", 0);
            if (brk && end > 0) { b.setWhen(end); try { b.setChronometerCountDown(true); } catch (Throwable t) {} }
            else b.setWhen(o.optLong("base", System.currentTimeMillis()));
            JSONObject L = o.optJSONObject("lbl");
            if (L == null) L = new JSONObject();
            if (brk) {
                b.addAction(0, L.optString("resume", "Resume"), act(c, ActReceiver.TACT, "resume", 7821));
                b.addAction(0, L.optString("stop", "Stop"), act(c, ActReceiver.TACT, "stop", 7822));
            } else {
                b.addAction(0, L.optString("brk5", "Break 5"), act(c, ActReceiver.TACT, "brk5", 7823));
                b.addAction(0, L.optString("brk15", "Break 15"), act(c, ActReceiver.TACT, "brk15", 7824));
                b.addAction(0, L.optString("stop", "Stop"), act(c, ActReceiver.TACT, "stop", 7825));
            }
            nm(c).notify(NID_T, b.build());
        } catch (Throwable t) {}
        finally { try { android.service.quicksettings.TileService.requestListeningState(c, new android.content.ComponentName(c, ThabatTile.class)); } catch (Throwable t) {} }
    }

    /** A button was pressed while the app may be closed: queue it and update the notification by itself. */
    static void timerAct(Context c, String a) {
        long now = System.currentTimeMillis();
        try {
            SharedPreferences sp = p(c);
            JSONArray q = new JSONArray(sp.getString("tacts", "[]"));
            JSONArray it = new JSONArray(); it.put(a); it.put(now); q.put(it);
            sp.edit().putString("tacts", q.toString()).apply();
            String js = sp.getString("tn", null);
            if (js == null) return;
            JSONObject o = new JSONObject(js);
            if (a.equals("stop")) o.put("mode", "idle");
            else if (a.startsWith("brk")) { int m = 5; try { m = Integer.parseInt(a.substring(3)); } catch (Throwable t) {} o.put("mode", "brk"); o.put("end", now + m * 60000L); o.put("base", now); }
            else if (a.equals("resume")) { o.put("mode", "work"); o.put("base", now); o.put("end", 0); }
            timer(c, o.toString());
        } catch (Throwable t) {}
    }

    /* ---------- daily wird ---------- */
    static void wird(Context c, String json) {
        try {
            p(c).edit().putString("wn", json).apply();
            JSONObject o = new JSONObject(json);
            int done = o.optInt("done", 0) + p(c).getInt("wadd", 0), target = Math.max(1, o.optInt("target", 1));
            Widget6.render(c);
            if (!o.optBoolean("on", false) || done >= target) { nm(c).cancel(NID_W); return; }
            channel(c, "wird", o.optString("chName", "Wird"));
            Notification.Builder b = new Notification.Builder(c, "wird")
                    .setSmallIcon(c.getApplicationInfo().icon)
                    .setContentTitle(o.optString("title", "Wird"))
                    .setContentText(done + " / " + target + " " + o.optString("unit", ""))
                    .setProgress(target, done, false)
                    .setOngoing(true).setOnlyAlertOnce(true).setShowWhen(false).setColor(0xFFEB6834)
                    .setContentIntent(open(c, "quran", 7812));
            b.addAction(0, o.optString("addLbl", "+1"), act(c, ActReceiver.WADD, null, 7831));
            b.addAction(0, o.optString("openLbl", "Open"), open(c, "quran", 7832));
            nm(c).notify(NID_W, b.build());
        } catch (Throwable t) {}
    }

    static void wirdAdd(Context c) {
        SharedPreferences sp = p(c);
        sp.edit().putInt("wadd", sp.getInt("wadd", 0) + 1).apply();
        String js = sp.getString("wn", null);
        if (js != null) wird(c, js);
    }

    /* ---------- 3.59: the next prayer, always in the notification shade, counting down ---------- */
    static void prayer(Context c, String json) {
        try { p(c).edit().putString("pn", json).apply(); } catch (Throwable t) {}
        prayerTick(c);
    }

    static void prayerTick(Context c) {
        try {
            String js = p(c).getString("pn", null);
            if (js == null) { nm(c).cancel(NID_P); return; }
            JSONObject o = new JSONObject(js);
            if (!o.optBoolean("on", false)) { nm(c).cancel(NID_P); return; }
            JSONArray L = o.optJSONArray("list"); if (L == null) { nm(c).cancel(NID_P); return; }
            long now = System.currentTimeMillis(); JSONObject nx = null;
            for (int i = 0; i < L.length(); i++) { JSONObject x = L.optJSONObject(i); if (x != null && x.optLong("t", 0) > now) { nx = x; break; } }
            if (nx == null) { nm(c).cancel(NID_P); return; }
            channel(c, "pnext", o.optString("chName", "Next prayer"));
            Notification.Builder b = new Notification.Builder(c, "pnext")
                    .setSmallIcon(c.getApplicationInfo().icon)
                    .setContentTitle(nx.optString("n", "") + " · " + nx.optString("s", ""))
                    .setContentText(o.optString("sub", ""))
                    .setOngoing(true).setOnlyAlertOnce(true).setShowWhen(true).setUsesChronometer(true)
                    .setWhen(nx.optLong("t")).setColor(0xFFFDDB00).setVisibility(1)
                    .setContentIntent(open(c, "today", 7813));
            try { b.setChronometerCountDown(true); } catch (Throwable t) {}
            nm(c).notify(NID_P, b.build());
            AlarmManager am = (AlarmManager) c.getSystemService("alarm");
            PendingIntent pi = act(c, ActReceiver.PNEXT, null, 7842);
            long at = nx.optLong("t") + 2000;
            try { am.setExactAndAllowWhileIdle(0, at, pi); } catch (Throwable e) { am.setAndAllowWhileIdle(0, at, pi); }
        } catch (Throwable t) {}
    }

    /* ---------- Do Not Disturb during prayer ---------- */
    static void dndStart(Context c, int min) {
        try {
            NotificationManager n = nm(c);
            if (!n.isNotificationPolicyAccessGranted()) return;
            if (n.getCurrentInterruptionFilter() == 1) { n.setInterruptionFilter(2); p(c).edit().putBoolean("dndOurs", true).apply(); }
            AlarmManager am = (AlarmManager) c.getSystemService("alarm");
            PendingIntent pi = act(c, ActReceiver.DND_END, null, 7841);
            long at = System.currentTimeMillis() + Math.max(5, min) * 60000L;
            try { am.setExactAndAllowWhileIdle(0, at, pi); } catch (Throwable e) { am.setAndAllowWhileIdle(0, at, pi); }
        } catch (Throwable t) {}
    }

    static void dndEnd(Context c) {
        try {
            SharedPreferences sp = p(c);
            if (!sp.getBoolean("dndOurs", false)) return;
            NotificationManager n = nm(c);
            if (n.isNotificationPolicyAccessGranted() && n.getCurrentInterruptionFilter() == 2) n.setInterruptionFilter(1);
            sp.edit().remove("dndOurs").apply();
        } catch (Throwable t) {}
    }
}
