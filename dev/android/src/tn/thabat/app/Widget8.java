package tn.thabat.app;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.SharedPreferences;
import android.widget.RemoteViews;
import org.json.JSONObject;

/** 3.125: «continue» — the library lesson or the book being followed, one tap opens it. */
public class Widget8 extends AppWidgetProvider {
    @Override
    public void onUpdate(Context c, AppWidgetManager m, int[] ids) { render(c); }

    static void render(Context c) {
        try {
            AppWidgetManager m = AppWidgetManager.getInstance(c);
            int[] ids = m.getAppWidgetIds(new ComponentName(c, Widget8.class));
            if (ids == null || ids.length == 0) return;
            SharedPreferences sp = c.getSharedPreferences("thabat", 0);
            JSONObject o; try { o = new JSONObject(sp.getString("cont", "{}")); } catch (Throwable t) { o = new JSONObject(); }
            RemoteViews v = new RemoteViews(c.getPackageName(), Widget.rid(c, "thabat_widget8", "layout"));
            v.setTextViewText(Widget.rid(c, "w8_lbl", "id"), o.optString("lbl", ""));
            v.setTextViewText(Widget.rid(c, "w8_title", "id"), o.optString("title", ""));
            v.setTextViewText(Widget.rid(c, "w8_sub", "id"), o.optString("sub", ""));
            v.setProgressBar(Widget.rid(c, "w8_bar", "id"), 100, Math.max(0, Math.min(100, o.optInt("pct", 0))), false);
            v.setOnClickPendingIntent(Widget.rid(c, "w8_root", "id"), Ongoing.open(c, "cont", 7891));
            WTheme.apply(c, v, 8);
            m.updateAppWidget(ids, v);
        } catch (Throwable t) {}
    }
}
