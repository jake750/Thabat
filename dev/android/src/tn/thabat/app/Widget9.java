package tn.thabat.app;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.graphics.Color;
import android.widget.RemoteViews;
import java.util.Calendar;
import org.json.JSONArray;
import org.json.JSONObject;

/** 3.128: countdowns — the nearest pinned one with its days left, the next two under it; tap opens the countdowns. */
public class Widget9 extends AppWidgetProvider {
    @Override
    public void onUpdate(Context c, AppWidgetManager m, int[] ids) { render(c); }

    static long dayStart(long ms) { Calendar k = Calendar.getInstance(); k.setTimeInMillis(ms); k.set(Calendar.HOUR_OF_DAY, 0); k.set(Calendar.MINUTE, 0); k.set(Calendar.SECOND, 0); k.set(Calendar.MILLISECOND, 0); return k.getTimeInMillis(); }
    static long days(long ms) { return Math.round((dayStart(ms) - dayStart(System.currentTimeMillis())) / 86400000.0); }

    static void render(Context c) {
        try {
            AppWidgetManager m = AppWidgetManager.getInstance(c);
            int[] ids = m.getAppWidgetIds(new ComponentName(c, Widget9.class));
            if (ids == null || ids.length == 0) return;
            JSONObject o; try { o = new JSONObject(c.getSharedPreferences("thabat", 0).getString("cdn", "{}")); } catch (Throwable t) { o = new JSONObject(); }
            JSONArray it = o.optJSONArray("items"); JSONObject L = o.optJSONObject("lbl"); if (L == null) L = new JSONObject();
            RemoteViews v = new RemoteViews(c.getPackageName(), Widget.rid(c, "thabat_widget9", "layout"));
            int first = -1;
            if (it != null) for (int i = 0; i < it.length(); i++) { JSONObject x = it.getJSONObject(i); if (days(x.optLong("ms")) >= 0) { first = i; break; } }
            if (first < 0 && it != null && it.length() > 0) first = 0;
            if (first < 0) {
                v.setTextViewText(Widget.rid(c, "w9_title", "id"), L.optString("empty", ""));
                v.setTextViewText(Widget.rid(c, "w9_num", "id"), "");
                v.setTextViewText(Widget.rid(c, "w9_unit", "id"), "");
                v.setTextViewText(Widget.rid(c, "w9_sub", "id"), "");
                v.setTextViewText(Widget.rid(c, "w9_more", "id"), "");
            } else {
                JSONObject x = it.getJSONObject(first); long d = days(x.optLong("ms"));
                v.setTextViewText(Widget.rid(c, "w9_title", "id"), x.optString("n", ""));
                v.setTextViewText(Widget.rid(c, "w9_num", "id"), d == 0 ? L.optString("today", "") : String.valueOf(Math.abs(d)));
                v.setTextViewText(Widget.rid(c, "w9_unit", "id"), d == 0 ? "" : d > 0 ? L.optString("d", "") : L.optString("ago", ""));
                v.setTextViewText(Widget.rid(c, "w9_sub", "id"), x.optString("w", ""));
                try { v.setTextColor(Widget.rid(c, "w9_num", "id"), Color.parseColor(x.optString("col", "#F5C400"))); } catch (Throwable t) {}
                StringBuilder sb = new StringBuilder(); int n = 0;
                for (int i = 0; it != null && i < it.length() && n < 2; i++) {
                    if (i == first) continue; JSONObject y = it.getJSONObject(i); long e = days(y.optLong("ms")); if (e < 0) continue;
                    if (sb.length() > 0) sb.append("\n");
                    sb.append(y.optString("n", "")).append(" · ").append(e == 0 ? L.optString("today", "") : e + " " + L.optString("d", "")); n++;
                }
                v.setTextViewText(Widget.rid(c, "w9_more", "id"), sb.toString());
            }
            v.setOnClickPendingIntent(Widget.rid(c, "w9_root", "id"), Ongoing.open(c, "cdn", 7892));
            WTheme.apply(c, v, 9);
            m.updateAppWidget(ids, v);
        } catch (Throwable t) {}
    }
}
