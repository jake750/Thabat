package tn.thabat.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.res.AssetFileDescriptor;
import android.media.AudioAttributes;
import android.media.MediaPlayer;
import android.os.Build;
import android.os.IBinder;

/** Plays the adhan in the foreground. Stops on the notification's button, at the end, or (optionally) when a volume key is pressed. */
public class AdhanService extends Service {
    static final String STOP = "tn.thabat.app.ADHAN_STOP", SNOOZE = "tn.thabat.app.WAKE_SNOOZE";
    Intent wakeSrc;
    android.os.Handler h;
    static final int NID = 7700;
    MediaPlayer mp;
    VolRx vol;
    long startedAt;
    String duaT, duaB;

    @Override
    public IBinder onBind(Intent i) { return null; }

    @Override
    public int onStartCommand(Intent in, int flags, int id) {
        if (in != null && STOP.equals(in.getAction())) { finish(); return 2; }
        if (in != null && SNOOZE.equals(in.getAction())) {
            int m = 5; try { m = Integer.parseInt(in.getStringExtra("snz")); } catch (Throwable t) {}
            Sched.again(this, in, 9690, System.currentTimeMillis() + m * 60000L);
            finish(); return 2;
        }
        if (in != null && "1".equals(in.getStringExtra("wake"))) { wake(in); return 2; }
        try {
            String title = in != null ? in.getStringExtra("title") : null;
            String body = in != null ? in.getStringExtra("body") : null;
            String stopLbl = in != null ? in.getStringExtra("stopLbl") : null;
            boolean volStop = in == null || in.getBooleanExtra("volStop", true);
            String mode = in != null ? in.getStringExtra("mode") : null;
            String volS = in != null ? in.getStringExtra("vol") : null;
            int fade = 0; try { fade = Math.max(0, Math.min(120, Integer.parseInt(in.getStringExtra("fade")))); } catch (Throwable t) {}
            boolean fajr = in != null && "1".equals(in.getStringExtra("fajr"));
            duaT = in != null ? in.getStringExtra("duaT") : null;
            duaB = in != null ? in.getStringExtra("duaB") : null;
            float v = 1f;
            try { if (volS != null) v = Math.max(0.05f, Math.min(1f, Integer.parseInt(volS) / 100f)); } catch (Throwable t) {}
            NotificationManager nm = (NotificationManager) getSystemService("notification");
            NotificationChannel ch = new NotificationChannel("adhan", "Adhan", 4);
            ch.setSound(null, null);
            ch.enableVibration(false);
            nm.createNotificationChannel(ch);
            Intent open = new Intent(this, MainActivity.class);
            open.addFlags(0x10000000 | 0x20000000);
            PendingIntent po = PendingIntent.getActivity(this, 7701, open, 0x08000000 | 0x04000000);
            Intent stop = new Intent(this, AdhanService.class);
            stop.setAction(STOP);
            PendingIntent ps = PendingIntent.getService(this, 7702, stop, 0x08000000 | 0x04000000);
            Notification.Builder nb = new Notification.Builder(this, "adhan");
            String pk = in != null ? in.getStringExtra("pk") : null;
            if (pk != null && pk.length() > 0) nb.addAction(0, in.getStringExtra("laterLbl"), Sched.laterPi(this, in, 8802));
            Notification n = nb
                    .setSmallIcon(getApplicationInfo().icon)
                    .setContentTitle(title == null ? "Thabat" : title)
                    .setContentText(body == null ? "" : body)
                    .setContentIntent(po)
                    .setDeleteIntent(ps)
                    .addAction(0, stopLbl == null ? "Stop" : stopLbl, ps)
                    .setColor(0xFFFDDB00)
                    .setCategory("alarm")
                    .setVisibility(1)
                    .setOngoing(true)
                    .build();
            if (Build.VERSION.SDK_INT >= 29) startForeground(NID, n, 2); else startForeground(NID, n);
            if (mp != null) { try { mp.stop(); mp.release(); } catch (Throwable t) {} mp = null; }
            mp = new MediaPlayer();
            mp.setAudioAttributes(new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_MEDIA).setContentType(AudioAttributes.CONTENT_TYPE_MUSIC).build());
            java.io.File custom = new java.io.File(getFilesDir(), "adhan_fajr.audio");
            if (fajr && custom.exists() && custom.length() > 0) {
                mp.setDataSource(custom.getAbsolutePath());
            } else {
                int rid = getResources().getIdentifier("takbir".equals(mode) ? "adhan_takbir" : "adhan", "raw", getPackageName());
                AssetFileDescriptor afd = getResources().openRawResourceFd(rid);
                mp.setDataSource(afd.getFileDescriptor(), afd.getStartOffset(), afd.getLength());
                afd.close();
            }
            mp.setVolume(fade > 0 ? v * 0.12f : v, fade > 0 ? v * 0.12f : v);
            mp.setOnCompletionListener(new Done(this));
            mp.prepare();
            mp.start();
            startedAt = System.currentTimeMillis();
            if (fade > 0) fadeIn(mp, v, fade * 1000L);
            if (volStop && vol == null) {
                vol = new VolRx(this);
                try { if (Build.VERSION.SDK_INT >= 33) registerReceiver(vol, new IntentFilter("android.media.VOLUME_CHANGED_ACTION"), 2); else registerReceiver(vol, new IntentFilter("android.media.VOLUME_CHANGED_ACTION")); } catch (Throwable t) { vol = null; }
            }
        } catch (Throwable t) { finish(); }
        return 2;
    }

    /* 3.44: the adhan starts quiet and grows to its volume over `ms` */
    void fadeIn(final MediaPlayer p, final float target, final long ms) {
        if (h == null) h = new android.os.Handler(android.os.Looper.getMainLooper());
        final long t0 = System.currentTimeMillis();
        h.post(new Runnable() { public void run() {
            if (mp != p) return;
            float k = Math.min(1f, (System.currentTimeMillis() - t0) / (float) ms);
            float vv = target * (0.12f + 0.88f * k * k);
            try { p.setVolume(vv, vv); } catch (Throwable t) { return; }
            if (k < 1f) h.postDelayed(this, 250);
        } });
    }

    /* 3.26: the Fajr wake-up alarm */
    void wake(Intent in) {
        try {
            wakeSrc = new Intent(in);
            NotificationManager nm = (NotificationManager) getSystemService("notification");
            NotificationChannel ch = new NotificationChannel("wake", "Fajr alarm", 4);
            ch.setSound(null, null); ch.enableVibration(true); ch.setBypassDnd(true);
            nm.createNotificationChannel(ch);
            Intent open = new Intent(this, MainActivity.class);
            open.addFlags(0x10000000 | 0x20000000);
            PendingIntent po = PendingIntent.getActivity(this, 7711, open, 0x08000000 | 0x04000000);
            Intent stop = new Intent(this, AdhanService.class); stop.setAction(STOP);
            PendingIntent ps = PendingIntent.getService(this, 7712, stop, 0x08000000 | 0x04000000);
            Intent snz = new Intent(this, AdhanService.class); snz.putExtras(in); snz.setAction(SNOOZE);
            PendingIntent pz = PendingIntent.getService(this, 7713, snz, 0x08000000 | 0x04000000);
            Notification n = new Notification.Builder(this, "wake")
                    .setSmallIcon(getApplicationInfo().icon)
                    .setContentTitle(in.getStringExtra("title") == null ? "Thabat" : in.getStringExtra("title"))
                    .setContentText(in.getStringExtra("body") == null ? "" : in.getStringExtra("body"))
                    .setContentIntent(po).setFullScreenIntent(po, true)
                    .addAction(0, in.getStringExtra("stopLbl") == null ? "Stop" : in.getStringExtra("stopLbl"), ps)
                    .addAction(0, in.getStringExtra("snzLbl") == null ? "Snooze" : in.getStringExtra("snzLbl"), pz)
                    .setColor(0xFFFDDB00).setCategory("alarm").setVisibility(1).setOngoing(true)
                    .build();
            if (Build.VERSION.SDK_INT >= 29) startForeground(NID, n, 2); else startForeground(NID, n);
            if (mp != null) { try { mp.stop(); mp.release(); } catch (Throwable t) {} mp = null; }
            mp = new MediaPlayer();
            mp.setAudioAttributes(new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_ALARM).setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION).build());
            if ("adhan".equals(in.getStringExtra("snd"))) {
                java.io.File custom = new java.io.File(getFilesDir(), "adhan_fajr.audio");
                if (custom.exists() && custom.length() > 0) mp.setDataSource(custom.getAbsolutePath());
                else { AssetFileDescriptor afd = getResources().openRawResourceFd(getResources().getIdentifier("adhan", "raw", getPackageName())); mp.setDataSource(afd.getFileDescriptor(), afd.getStartOffset(), afd.getLength()); afd.close(); }
            } else {
                android.net.Uri u = android.media.RingtoneManager.getActualDefaultRingtoneUri(this, android.media.RingtoneManager.TYPE_ALARM);
                if (u == null) u = android.media.RingtoneManager.getDefaultUri(android.media.RingtoneManager.TYPE_ALARM);
                mp.setDataSource(this, u);
            }
            float v = 1f; try { v = Math.max(0.05f, Math.min(1f, Integer.parseInt(in.getStringExtra("vol")) / 100f)); } catch (Throwable t) {}
            mp.setVolume(v, v);
            mp.setLooping(true);
            mp.prepare();
            mp.start();
            startedAt = System.currentTimeMillis();
            /* rings at most ten minutes */
            h = new android.os.Handler(getMainLooper());
            h.postDelayed(new Runnable() { public void run() { finish(); } }, 10 * 60000L);
        } catch (Throwable t) { finish(); }
    }

    void finish() {
        try { if (h != null) h.removeCallbacksAndMessages(null); } catch (Throwable t) {}
        h = null;
        boolean was = mp != null;
        try { if (mp != null) { mp.stop(); mp.release(); } } catch (Throwable t) {}
        mp = null;
        try { if (vol != null) unregisterReceiver(vol); } catch (Throwable t) {}
        vol = null;
        try { stopForeground(true); } catch (Throwable t) {}
        if (was) showDua();
        stopSelf();
    }

    /* the dua after the adhan, as a quiet notification */
    void showDua() {
        try {
            if (duaB == null || duaB.length() == 0) return;
            NotificationManager nm = (NotificationManager) getSystemService("notification");
            Intent open = new Intent(this, MainActivity.class);
            open.addFlags(0x10000000 | 0x20000000);
            PendingIntent po = PendingIntent.getActivity(this, 7703, open, 0x08000000 | 0x04000000);
            Notification n = new Notification.Builder(this, "adhan")
                    .setSmallIcon(getApplicationInfo().icon)
                    .setContentTitle(duaT == null ? "" : duaT)
                    .setContentText(duaB)
                    .setStyle(new Notification.BigTextStyle().bigText(duaB))
                    .setContentIntent(po)
                    .setAutoCancel(true)
                    .setColor(0xFFFDDB00)
                    .build();
            nm.notify(NID + 1, n);
        } catch (Throwable t) {}
        duaB = null;
    }

    @Override
    public void onDestroy() { try { if (mp != null) { mp.stop(); mp.release(); } } catch (Throwable t) {} mp = null; try { if (vol != null) unregisterReceiver(vol); } catch (Throwable t) {} vol = null; }

    static class Done implements MediaPlayer.OnCompletionListener {
        final AdhanService s;
        Done(AdhanService s) { this.s = s; }
        public void onCompletion(MediaPlayer m) { s.finish(); }
    }

    static class VolRx extends BroadcastReceiver {
        final AdhanService s;
        VolRx(AdhanService s) { this.s = s; }
        @Override
        public void onReceive(Context c, Intent i) {
            /* ignore the burst Android may send right as playback starts */
            if (System.currentTimeMillis() - s.startedAt > 700) s.finish();
        }
    }
}
