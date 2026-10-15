package tn.thabat.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.media.MediaMetadata;
import android.media.session.MediaSession;
import android.media.session.PlaybackState;
import android.os.Build;
import android.os.IBinder;
import org.json.JSONObject;

/** 3.26: the recording being played (recitations, lessons' audio) shows in the notification shade and on the lock screen
 *  with previous / play-pause / next, and the app keeps playing with the screen off. The page owns the audio;
 *  this service only shows it and passes the buttons back (window.thabatMedia). */
public class MediaSvc extends Service {
    static final int NID = 7850;
    static final int FLAGS = 0x08000000 | 0x04000000;
    static MediaSession ms;

    @Override
    public IBinder onBind(Intent i) { return null; }

    static void send(final String a) {
        final MainActivity x = MainActivity.inst;
        if (x == null || x.web == null) return;
        x.runOnUiThread(new Runnable() { public void run() { try { x.web.evaluateJavascript("window.thabatMedia&&window.thabatMedia('" + a + "')", null); } catch (Throwable t) {} } });
    }

    PendingIntent btn(String a, int req) {
        Intent i = new Intent(this, MediaSvc.class);
        i.putExtra("a", a);
        i.setAction("tn.thabat.app.MEDIA." + a);
        return PendingIntent.getService(this, req, i, FLAGS);
    }

    @Override
    public int onStartCommand(Intent in, int flags, int id) {
        try {
            String a = in != null ? in.getStringExtra("a") : null;
            if (a != null) {
                if (a.equals("close")) { send("pause"); end(); return 2; }
                send(a);
                return 2;
            }
            String js = getSharedPreferences("thabat", 0).getString("media", null);
            if (js == null) { end(); return 2; }
            JSONObject o = new JSONObject(js);
            if (!o.optBoolean("on", true)) { end(); return 2; }
            boolean playing = o.optBoolean("playing", false);
            if (ms == null) {
                ms = new MediaSession(this, "thabat");
                ms.setCallback(new MediaSession.Callback() {
                    @Override public void onPlay() { send("play"); }
                    @Override public void onPause() { send("pause"); }
                    @Override public void onSkipToNext() { send("next"); }
                    @Override public void onSkipToPrevious() { send("prev"); }
                    @Override public void onStop() { send("pause"); }
                    @Override public void onSeekTo(long pos) { send("seek:" + pos); }
                });
            }
            android.graphics.Bitmap art = null;
            try { String a64 = o.optString("art", ""); if (a64.length() > 0) { byte[] by = android.util.Base64.decode(a64, 0); art = android.graphics.BitmapFactory.decodeByteArray(by, 0, by.length); } } catch (Throwable t) {}
            MediaMetadata.Builder mb = new MediaMetadata.Builder();
            if (art != null) mb.putBitmap(MediaMetadata.METADATA_KEY_ART, art);
            ms.setMetadata(mb
                    .putString(MediaMetadata.METADATA_KEY_TITLE, o.optString("title", "Thabat"))
                    .putString(MediaMetadata.METADATA_KEY_ARTIST, o.optString("artist", ""))
                    .putLong(MediaMetadata.METADATA_KEY_DURATION, o.optLong("dur", 0))
                    .build());
            ms.setPlaybackState(new PlaybackState.Builder()
                    .setActions(PlaybackState.ACTION_PLAY | PlaybackState.ACTION_PAUSE | PlaybackState.ACTION_PLAY_PAUSE | PlaybackState.ACTION_SKIP_TO_NEXT | PlaybackState.ACTION_SKIP_TO_PREVIOUS | PlaybackState.ACTION_SEEK_TO | PlaybackState.ACTION_STOP)
                    .setState(playing ? PlaybackState.STATE_PLAYING : PlaybackState.STATE_PAUSED, o.optLong("pos", 0), playing ? (float) o.optDouble("rate", 1) : 0f)
                    .build());
            ms.setActive(true);
            NotificationManager nm = (NotificationManager) getSystemService("notification");
            try { NotificationChannel ch = new NotificationChannel("media", o.optString("chName", "Audio"), 2); ch.setSound(null, null); ch.enableVibration(false); ch.setShowBadge(false); nm.createNotificationChannel(ch); } catch (Throwable t) {}
            Intent open = new Intent(this, MainActivity.class);
            open.addFlags(0x10000000 | 0x20000000);
            open.putExtra("open", "recits");
            open.setAction("tn.thabat.app.OPEN.recits");
            Notification.Builder nbx = new Notification.Builder(this, "media");
            if (art != null) nbx.setLargeIcon(art);
            Notification n = nbx
                    .setSmallIcon(getApplicationInfo().icon)
                    .setContentTitle(o.optString("title", "Thabat"))
                    .setContentText(o.optString("artist", ""))
                    .setContentIntent(PendingIntent.getActivity(this, 7851, open, FLAGS))
                    .setDeleteIntent(btn("close", 7856))
                    .addAction(android.R.drawable.ic_media_previous, o.optString("prevLbl", "Previous"), btn("prev", 7852))
                    .addAction(playing ? android.R.drawable.ic_media_pause : android.R.drawable.ic_media_play, playing ? o.optString("pauseLbl", "Pause") : o.optString("playLbl", "Play"), btn(playing ? "pause" : "play", 7853))
                    .addAction(android.R.drawable.ic_media_next, o.optString("nextLbl", "Next"), btn("next", 7854))
                    .setStyle(new Notification.MediaStyle().setMediaSession(ms.getSessionToken()).setShowActionsInCompactView(0, 1, 2))
                    .setColor(0xFFFDDB00).setVisibility(1).setShowWhen(false).setOngoing(playing)
                    .build();
            if (playing) { if (Build.VERSION.SDK_INT >= 29) startForeground(NID, n, 2); else startForeground(NID, n); }
            else { try { stopForeground(2); } catch (Throwable t) {} nm.notify(NID, n); }
        } catch (Throwable t) {}
        return 2;
    }

    void end() {
        try { stopForeground(true); } catch (Throwable t) {}
        try { ((NotificationManager) getSystemService("notification")).cancel(NID); } catch (Throwable t) {}
        try { if (ms != null) { ms.setActive(false); ms.release(); } } catch (Throwable t) {}
        ms = null;
        stopSelf();
    }

    @Override
    public void onDestroy() { try { if (ms != null) { ms.setActive(false); ms.release(); } } catch (Throwable t) {} ms = null; }

    /** Called by the page: the recording, whether it plays, its position. */
    static void state(Context c, String json) {
        try {
            c.getSharedPreferences("thabat", 0).edit().putString("media", json).apply();
            JSONObject o = new JSONObject(json);
            Intent s = new Intent(c, MediaSvc.class);
            if (!o.optBoolean("on", true)) { c.startService(s); return; }
            if (o.optBoolean("playing", false)) c.startForegroundService(s); else c.startService(s);
        } catch (Throwable t) {}
    }
}
