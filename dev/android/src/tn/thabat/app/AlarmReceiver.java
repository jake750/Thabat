package tn.thabat.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

public class AlarmReceiver extends BroadcastReceiver {
    static final String LATER = "tn.thabat.app.PRAY_LATER";
    @Override
    public void onReceive(Context c, Intent in) {
        try {
            String action = in.getAction();
            if (action != null && (action.equals("android.intent.action.BOOT_COMPLETED") || action.equals("android.intent.action.MY_PACKAGE_REPLACED"))) {
                String json = c.getSharedPreferences("thabat", 0).getString("json", null);
                if (json != null) Sched.apply(c, json);
                return;
            }
            NotificationManager nm = (NotificationManager) c.getSystemService("notification");
            if (LATER.equals(action)) {
                Sched.prayLater(c, in.getStringExtra("pk"), in.getStringExtra("laterT"), in.getStringExtra("laterB"));
                try { nm.cancel(in.getIntExtra("nid", 0)); } catch (Throwable t) {}
                return;
            }
            NotificationChannel ch = new NotificationChannel("prayer", "Thabat", 4);
            ch.setDescription("Prayer and Quran reminders");
            ch.enableVibration(true);
            nm.createNotificationChannel(ch);
            Widget.render(c);
            android.content.SharedPreferences sp = c.getSharedPreferences("thabat", 0);
            long now = System.currentTimeMillis();
            if ("1".equals(in.getStringExtra("wake"))) {
                Intent s = new Intent(c, AdhanService.class);
                s.putExtras(in);
                try { c.startForegroundService(s); } catch (Throwable t) {}
                return;
            }
            String dnd = in.getStringExtra("dnd");
            if (dnd != null) { try { Ongoing.dndStart(c, Integer.parseInt(dnd)); } catch (Throwable t) {} }
            if ("1".equals(in.getStringExtra("quiet"))) sp.edit().putLong("quietUntil", now + 20 * 60000L).apply();
            else if (!"1".equals(in.getStringExtra("adhan"))) {
                long qu = sp.getLong("quietUntil", 0);
                if (qu > now) {
                    /* prayer quiet time: postpone this reminder until it ends */
                    android.app.AlarmManager am = (android.app.AlarmManager) c.getSystemService("alarm");
                    PendingIntent later = Sched.pi(c, in.getIntExtra("id", 0), in.getStringExtra("title"), in.getStringExtra("body"), in.getStringExtra("open"));
                    try { am.setExactAndAllowWhileIdle(0, qu + 5000, later); } catch (Throwable e) { am.setAndAllowWhileIdle(0, qu + 5000, later); }
                    return;
                }
            }
            if ("1".equals(in.getStringExtra("adhan"))) {
                Intent s = new Intent(c, AdhanService.class);
                s.putExtra("title", in.getStringExtra("title"));
                s.putExtra("body", in.getStringExtra("body"));
                s.putExtra("stopLbl", in.getStringExtra("stopLbl"));
                s.putExtra("volStop", !"0".equals(in.getStringExtra("volStop")));
                s.putExtra("mode", in.getStringExtra("mode"));
                s.putExtra("vol", in.getStringExtra("vol"));
                s.putExtra("fade", in.getStringExtra("fade"));
                s.putExtra("fajr", in.getStringExtra("fajr"));
                s.putExtra("duaT", in.getStringExtra("duaT"));
                s.putExtra("duaB", in.getStringExtra("duaB"));
                s.putExtra("pk", in.getStringExtra("pk"));
                s.putExtra("laterLbl", in.getStringExtra("laterLbl"));
                s.putExtra("laterT", in.getStringExtra("laterT"));
                s.putExtra("laterB", in.getStringExtra("laterB"));
                try { c.startForegroundService(s); return; } catch (Throwable t) {}
            }
            Intent open = new Intent(c, MainActivity.class);
            open.addFlags(0x10000000 | 0x20000000);
            String what = in.getStringExtra("open");
            if (what != null && what.length() > 0) { open.putExtra("open", what); open.setAction("tn.thabat.app.OPEN." + what); }
            PendingIntent pi = PendingIntent.getActivity(c, in.getIntExtra("id", 0), open, 0x08000000 | 0x04000000);
            String title = in.getStringExtra("title");
            String body = in.getStringExtra("body");
            String tone = in.getStringExtra("tone"), chId = "prayer";
            if (tone != null && tone.length() > 0) {
                chId = "r_" + in.getStringExtra("ch") + "_" + tone;
                try {
                    NotificationChannel ct = new NotificationChannel(chId, in.getStringExtra("chName") == null ? "Thabat" : in.getStringExtra("chName"), tone.equals("none") ? 2 : 4);
                    android.media.AudioAttributes aa = new android.media.AudioAttributes.Builder().setUsage(android.media.AudioAttributes.USAGE_NOTIFICATION).build();
                    if (tone.equals("alarm")) ct.setSound(android.media.RingtoneManager.getDefaultUri(android.media.RingtoneManager.TYPE_ALARM), aa);
                    else if (tone.equals("none") || tone.equals("vib")) ct.setSound(null, null);
                    ct.enableVibration(!tone.equals("none"));
                    if (tone.equals("vib")) ct.setVibrationPattern(new long[]{0, 90, 70, 90});
                    nm.createNotificationChannel(ct);
                } catch (Throwable t) { chId = "prayer"; }
            }
            Notification.Builder nb = new Notification.Builder(c, chId);
            String pk = in.getStringExtra("pk");
            if (pk != null && pk.length() > 0) nb.addAction(0, in.getStringExtra("laterLbl"), Sched.laterPi(c, in, 8801));
            String tk = in.getStringExtra("tk");
            if (tk != null && tk.length() > 0) {
                int nid = in.getIntExtra("id", 1);
                Intent dn = new Intent(c, ActReceiver.class); dn.setAction(ActReceiver.TK_DONE); dn.putExtras(in); dn.putExtra("nid", nid);
                Intent lt = new Intent(c, ActReceiver.class); lt.setAction(ActReceiver.TK_LATER); lt.putExtras(in); lt.putExtra("nid", nid);
                nb.addAction(0, in.getStringExtra("doneLbl"), PendingIntent.getBroadcast(c, nid * 2 + 60001, dn, 0x08000000 | 0x04000000));
                nb.addAction(0, in.getStringExtra("tkLaterLbl"), PendingIntent.getBroadcast(c, nid * 2 + 60002, lt, 0x08000000 | 0x04000000));
            }
            Notification n = nb
                    .setSmallIcon(c.getApplicationInfo().icon)
                    .setContentTitle(title == null ? "Thabat" : title)
                    .setContentText(body == null ? "" : body)
                    .setContentIntent(pi)
                    .setAutoCancel(true)
                    .setColor(0xFFFDDB00)
                    .setShowWhen(true)
                    .setCategory("reminder")
                    .build();
            nm.notify(in.getIntExtra("id", 1), n);
        } catch (Throwable t) {}
    }
}
