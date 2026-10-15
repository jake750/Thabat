package tn.thabat.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.os.SystemClock;
import android.widget.RemoteViews;
import org.json.JSONArray;
import org.json.JSONObject;

/** Small widget: the next prayer with a live countdown. */
public class Widget2 extends AppWidgetProvider {
    @Override
    public void onUpdate(Context c, AppWidgetManager m, int[] ids) { render(c); }

    @Override
    public void onEnabled(Context c) { render(c); }

    static void render(Context c) {
        try {
            AppWidgetManager m = AppWidgetManager.getInstance(c);
            int[] ids = m.getAppWidgetIds(new ComponentName(c, Widget2.class));
            if (ids == null || ids.length == 0) return;
            RemoteViews v = new RemoteViews(c.getPackageName(), Widget.rid(c, "thabat_widget2", "layout"));
            String js = c.getSharedPreferences("thabat", 0).getString("widget", null);
            long now = System.currentTimeMillis(), at = 0;
            String name = "-", time = "";
            if (js != null) {
                JSONObject o = new JSONObject(js);
                JSONArray pr = o.optJSONArray("pr");
                if (pr != null) for (int i = 0; i < pr.length(); i++) {
                    JSONObject p = pr.getJSONObject(i);
                    if (p.getLong("t") > now) { name = p.optString("n", ""); time = p.optString("s", ""); at = p.getLong("t"); break; }
                }
                v.setTextViewText(Widget.rid(c, "w2_title", "id"), o.optString("nextLbl", ""));
            }
            v.setTextViewText(Widget.rid(c, "w2_name", "id"), name);
            v.setTextViewText(Widget.rid(c, "w2_time", "id"), time);
            int cd = Widget.rid(c, "w2_cd", "id");
            if (at > now) {
                v.setChronometer(cd, SystemClock.elapsedRealtime() + (at - now), null, true);
                try { v.setChronometerCountDown(cd, true); } catch (Throwable t) {}
            }
            v.setOnClickPendingIntent(Widget.rid(c, "w2_root", "id"), Widget.openPi(c, 103));
            WTheme.apply(c, v, 2);
            m.updateAppWidget(ids, v);
        } catch (Throwable t) {}
    }
}
