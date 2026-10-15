package tn.thabat.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.widget.RemoteViews;
import org.json.JSONObject;

/** 3.59: the daily Quran wird with a «+1 page» button (works with the app closed; the app picks the pages up on its next start). */
public class Widget6 extends AppWidgetProvider {
    @Override
    public void onUpdate(Context c, AppWidgetManager m, int[] ids) { render(c); }

    static void render(Context c) {
        try {
            AppWidgetManager m = AppWidgetManager.getInstance(c);
            int[] ids = m.getAppWidgetIds(new ComponentName(c, Widget6.class));
            if (ids == null || ids.length == 0) return;
            SharedPreferences sp = c.getSharedPreferences("thabat", 0);
            JSONObject o; try { o = new JSONObject(sp.getString("wn", "{}")); } catch (Throwable t) { o = new JSONObject(); }
            int done = o.optInt("done", 0) + sp.getInt("wadd", 0), target = Math.max(1, o.optInt("target", 1));
            RemoteViews v = new RemoteViews(c.getPackageName(), Widget.rid(c, "thabat_widget6", "layout"));
            v.setTextViewText(Widget.rid(c, "w6_title", "id"), o.optString("title", "Wird"));
            v.setTextViewText(Widget.rid(c, "w6_count", "id"), done + " / " + target + " " + o.optString("unit", ""));
            v.setProgressBar(Widget.rid(c, "w6_bar", "id"), target, Math.min(done, target), false);
            v.setTextViewText(Widget.rid(c, "w6_add", "id"), o.optString("addLbl", "+1"));
            v.setOnClickPendingIntent(Widget.rid(c, "w6_add", "id"), Ongoing.act(c, ActReceiver.WADD, null, 7881));
            v.setOnClickPendingIntent(Widget.rid(c, "w6_root", "id"), Ongoing.open(c, "quran", 7882));
            m.updateAppWidget(ids, v);
        } catch (Throwable t) {}
    }
}
