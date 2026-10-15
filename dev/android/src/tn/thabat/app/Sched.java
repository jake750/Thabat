package tn.thabat.app;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import org.json.JSONArray;
import org.json.JSONObject;

public class Sched {
    static final int FLAGS = 0x08000000 | 0x04000000; // UPDATE_CURRENT | IMMUTABLE

    static PendingIntent pi(Context c, int id, String title, String body) { return pi(c, id, title, body, null); }

    static PendingIntent pi(Context c, int id, String title, String body, String open) { return pi(c, id, title, body, open, null); }

    static PendingIntent pi(Context c, int id, String title, String body, String open, JSONObject o) {
        Intent i = new Intent(c, AlarmReceiver.class);
        i.putExtra("id", id);
        if (o != null && o.optInt("adhan", 0) == 1) { i.putExtra("adhan", "1"); i.putExtra("volStop", o.optInt("volStop", 1) == 1 ? "1" : "0"); i.putExtra("stopLbl", o.optString("stopLbl", "Stop"));
            i.putExtra("mode", o.optString("mode", "full")); i.putExtra("vol", String.valueOf(o.optInt("vol", 100))); i.putExtra("fade", String.valueOf(o.optInt("fade", 0))); i.putExtra("fajr", o.optInt("fajr", 0) == 1 ? "1" : "0"); i.putExtra("duaT", o.optString("duaT", "")); i.putExtra("duaB", o.optString("duaB", "")); }
        if (o != null && o.optInt("wake", 0) == 1) { i.putExtra("wake", "1"); i.putExtra("snz", String.valueOf(o.optInt("snz", 5))); i.putExtra("snzLbl", o.optString("snzLbl", "Snooze")); i.putExtra("stopLbl", o.optString("stopLbl", "Stop")); i.putExtra("snd", o.optString("snd", "alarm")); i.putExtra("vol", String.valueOf(o.optInt("vol", 100))); }
        if (o != null && o.optString("tk", "").length() > 0) { i.putExtra("tk", o.optString("tk")); i.putExtra("doneLbl", o.optString("doneLbl", "Done")); i.putExtra("tkLaterLbl", o.optString("tkLaterLbl", "Later")); }
        if (o != null && o.optInt("quiet", 0) == 1) i.putExtra("quiet", "1");
        if (o != null && o.optString("tone", "").length() > 0) { i.putExtra("tone", o.optString("tone")); i.putExtra("ch", o.optString("ch", "other")); i.putExtra("chName", o.optString("chName", "Thabat")); }
        if (o != null && o.optInt("dnd", 0) > 0) i.putExtra("dnd", String.valueOf(o.optInt("dnd", 20)));
        if (o != null && o.optString("pk", "").length() > 0) { i.putExtra("pk", o.optString("pk")); i.putExtra("laterLbl", o.optString("laterLbl", "Later")); i.putExtra("laterT", o.optString("laterT", "")); i.putExtra("laterB", o.optString("laterB", "")); }
        if (open != null && open.length() > 0) i.putExtra("open", open);
        if (title != null) i.putExtra("title", title);
        if (body != null) i.putExtra("body", body);
        return PendingIntent.getBroadcast(c, id, i, FLAGS);
    }

    /** One-off reminder (e.g. "did you pray?" 30 min after "I'll pray now"). */
    static void remind(Context c, int id, long at, String title, String body, String open) {
        try {
            AlarmManager am = (AlarmManager) c.getSystemService("alarm");
            PendingIntent x = pi(c, id, title, body, open);
            try { am.setExactAndAllowWhileIdle(0, at, x); } catch (Throwable e) { am.setAndAllowWhileIdle(0, at, x); }
        } catch (Throwable t) {}
    }

    /** 3.26: a snoozed Fajr alarm or task reminder, rescheduled from the notification itself (works with the app closed). */
    static void again(Context c, Intent src, int id, long at) {
        try {
            Intent i = new Intent(c, AlarmReceiver.class);
            i.putExtras(src);
            i.putExtra("id", id);
            PendingIntent x = PendingIntent.getBroadcast(c, id, i, FLAGS);
            AlarmManager am = (AlarmManager) c.getSystemService("alarm");
            if ("1".equals(src.getStringExtra("wake"))) { Intent oi = new Intent(c, MainActivity.class); oi.addFlags(0x10000000); am.setAlarmClock(new AlarmManager.AlarmClockInfo(at, PendingIntent.getActivity(c, id + 50000, oi, FLAGS)), x); }
            else try { am.setExactAndAllowWhileIdle(0, at, x); } catch (Throwable e) { am.setAndAllowWhileIdle(0, at, x); }
        } catch (Throwable t) {}
    }

    static void cancelRemind(Context c, int id) {
        try { ((AlarmManager) c.getSystemService("alarm")).cancel(pi(c, id, null, null)); ((android.app.NotificationManager) c.getSystemService("notification")).cancel(id); } catch (Throwable t) {}
    }

    /** "I'll pray now" pressed on the adhan / prayer notification. */
    static void prayLater(Context c, String pk, String title, String body) {
        long now = System.currentTimeMillis();
        c.getSharedPreferences("thabat", 0).edit().putString("prayLater", pk + "|" + now).apply();
        remind(c, 8800, now + 30 * 60000L, title, body, "praycheck");
        try { Intent s = new Intent(c, AdhanService.class); s.setAction(AdhanService.STOP); c.startService(s); } catch (Throwable t) {}
    }

    static PendingIntent laterPi(Context c, Intent src, int req) {
        Intent l = new Intent(c, AlarmReceiver.class);
        l.setAction(AlarmReceiver.LATER);
        l.putExtra("pk", src.getStringExtra("pk"));
        l.putExtra("laterT", src.getStringExtra("laterT"));
        l.putExtra("laterB", src.getStringExtra("laterB"));
        l.putExtra("nid", src.getIntExtra("id", 0));
        return PendingIntent.getBroadcast(c, req, l, FLAGS);
    }

    static synchronized void apply(Context c, String json) {
        try {
            AlarmManager am = (AlarmManager) c.getSystemService("alarm");
            SharedPreferences p = c.getSharedPreferences("thabat", 0);
            String old = p.getString("ids", "");
            if (old != null && old.length() > 0) {
                for (String s : old.split(",")) {
                    if (s.length() == 0) continue;
                    try { am.cancel(pi(c, Integer.parseInt(s), null, null)); } catch (Throwable t) {}
                }
            }
            StringBuilder ids = new StringBuilder();
            JSONArray arr = new JSONArray(json);
            long now = System.currentTimeMillis();
            for (int k = 0; k < arr.length(); k++) {
                JSONObject o = arr.getJSONObject(k);
                long t = o.getLong("t");
                if (t < now - 1000) continue;
                int id = o.getInt("id");
                PendingIntent x = pi(c, id, o.optString("title", "Thabat"), o.optString("body", ""), o.optString("open", ""), o);
                if (o.optInt("wake", 0) == 1) {
                    try { Intent oi = new Intent(c, MainActivity.class); oi.addFlags(0x10000000); am.setAlarmClock(new AlarmManager.AlarmClockInfo(t, PendingIntent.getActivity(c, id + 50000, oi, FLAGS)), x); }
                    catch (Throwable e) { try { am.setExactAndAllowWhileIdle(0, t, x); } catch (Throwable e2) { am.setAndAllowWhileIdle(0, t, x); } }
                } else try {
                    am.setExactAndAllowWhileIdle(0, t, x);
                } catch (Throwable e) {
                    am.setAndAllowWhileIdle(0, t, x);
                }
                if (ids.length() > 0) ids.append(',');
                ids.append(id);
            }
            p.edit().putString("ids", ids.toString()).putString("json", json).apply();
        } catch (Throwable t) {}
    }
}
