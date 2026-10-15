package tn.thabat.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/** Buttons on the ongoing notifications. */
public class ActReceiver extends BroadcastReceiver {
    static final String TACT = "tn.thabat.app.TIMER_ACT", WADD = "tn.thabat.app.WIRD_ADD", DND_END = "tn.thabat.app.DND_END", TK_DONE = "tn.thabat.app.TASK_DONE", TK_LATER = "tn.thabat.app.TASK_LATER", PNEXT = "tn.thabat.app.PRAYER_NEXT";

    @Override
    public void onReceive(Context c, Intent in) {
        try {
            String a = in.getAction();
            if (TACT.equals(a)) Ongoing.timerAct(c, in.getStringExtra("a"));
            else if (WADD.equals(a)) Ongoing.wirdAdd(c);
            else if (DND_END.equals(a)) Ongoing.dndEnd(c);
            else if (PNEXT.equals(a)) { Ongoing.prayerTick(c); return; }
            else if (TK_DONE.equals(a) || TK_LATER.equals(a)) {
                boolean done = TK_DONE.equals(a);
                int nid = in.getIntExtra("nid", 0);
                try { ((android.app.NotificationManager) c.getSystemService("notification")).cancel(nid); } catch (Throwable t) {}
                android.content.SharedPreferences sp = c.getSharedPreferences("thabat", 0);
                org.json.JSONArray q = new org.json.JSONArray(sp.getString("tkacts", "[]"));
                org.json.JSONArray it = new org.json.JSONArray(); it.put(in.getStringExtra("tk")); it.put(done ? "done" : "later"); it.put(System.currentTimeMillis()); q.put(it);
                sp.edit().putString("tkacts", q.toString()).apply();
                if (!done) Sched.again(c, in, 9700 + (nid % 200), System.currentTimeMillis() + 15 * 60000L);
            }
            MainActivity.poke();
        } catch (Throwable t) {}
    }
}
