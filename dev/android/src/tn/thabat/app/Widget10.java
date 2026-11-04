package tn.thabat.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.widget.RemoteViews;
import org.json.JSONArray;
import org.json.JSONObject;

/** 3.167: the tasks of the current prayer period, each with a ✓ that ticks it even while the app is closed. */
public class Widget10 extends AppWidgetProvider {
    static final int ROWS = 4;

    @Override
    public void onUpdate(Context c, AppWidgetManager m, int[] ids) { render(c); }

    /** ✓ pressed: queue it for the page (Bridge.takeTaskActs) and drop the row at once */
    static void done(Context c, String id) {
        try {
            android.content.SharedPreferences sp = c.getSharedPreferences("thabat", 0);
            JSONArray q = new JSONArray(sp.getString("tkacts", "[]"));
            JSONArray it = new JSONArray(); it.put(id); it.put("done"); it.put(System.currentTimeMillis()); q.put(it);
            JSONObject o; try { o = new JSONObject(sp.getString("ptk", "{}")); } catch (Throwable t) { o = new JSONObject(); }
            JSONArray L = o.optJSONArray("items"), N = new JSONArray();
            if (L != null) for (int i = 0; i < L.length(); i++) { JSONObject x = L.getJSONObject(i); if (!id.equals(x.optString("id"))) N.put(x); }
            o.put("items", N); o.put("n", Math.max(0, o.optInt("n", 0) - 1));
            sp.edit().putString("tkacts", q.toString()).putString("ptk", o.toString()).apply();
        } catch (Throwable t) {}
        render(c);
    }

    static void render(Context c) {
        try {
            AppWidgetManager m = AppWidgetManager.getInstance(c);
            int[] ids = m.getAppWidgetIds(new ComponentName(c, Widget10.class));
            if (ids == null || ids.length == 0) return;
            JSONObject o; try { o = new JSONObject(c.getSharedPreferences("thabat", 0).getString("ptk", "{}")); } catch (Throwable t) { o = new JSONObject(); }
            JSONArray L = o.optJSONArray("items");
            RemoteViews v = new RemoteViews(c.getPackageName(), Widget.rid(c, "thabat_widget10", "layout"));
            v.setTextViewText(Widget.rid(c, "w10_title", "id"), o.optString("lbl", ""));
            int n = o.optInt("n", L == null ? 0 : L.length());
            v.setTextViewText(Widget.rid(c, "w10_count", "id"), n > 0 ? String.valueOf(n) : "");
            int shown = 0;
            for (int i = 0; i < ROWS; i++) {
                int row = Widget.rid(c, "w10_r" + i, "id"), tx = Widget.rid(c, "w10_t" + i, "id"), ck = Widget.rid(c, "w10_c" + i, "id");
                if (L != null && i < L.length()) {
                    JSONObject x = L.getJSONObject(i);
                    v.setViewVisibility(row, 0);
                    v.setTextViewText(tx, x.optString("t", ""));
                    Intent d = new Intent(c, ActReceiver.class); d.setAction(ActReceiver.W10_DONE); d.putExtra("tk", x.optString("id")); d.setData(android.net.Uri.parse("thabat-w10://" + i + "/" + x.optString("id").hashCode()));
                    v.setOnClickPendingIntent(ck, PendingIntent.getBroadcast(c, 7930 + i, d, Widget.FLAGS));
                    shown++;
                } else v.setViewVisibility(row, 8);
            }
            v.setTextViewText(Widget.rid(c, "w10_empty", "id"), shown == 0 ? o.optString("none", "") : "");
            v.setViewVisibility(Widget.rid(c, "w10_empty", "id"), shown == 0 ? 0 : 8);
            v.setOnClickPendingIntent(Widget.rid(c, "w10_root", "id"), Ongoing.open(c, "today", 7893));
            WTheme.apply(c, v, 10);
            m.updateAppWidget(ids, v);
        } catch (Throwable t) {}
    }
}
