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

public class Widget extends AppWidgetProvider {
    static final int FLAGS = 0x08000000 | 0x04000000;

    @Override
    public void onUpdate(Context c, AppWidgetManager m, int[] ids) { render(c); }

    @Override
    public void onEnabled(Context c) { render(c); }

    /** 3.26: the page a tap on the prayer widgets opens (chosen in the app's settings) */
    static PendingIntent openPi(Context c, int req) {
        Intent open = new Intent(c, MainActivity.class);
        open.addFlags(0x10000000 | 0x20000000);
        String w = c.getSharedPreferences("thabat", 0).getString("wopen", "");
        if (w != null && w.length() > 0) { open.putExtra("open", w); open.setAction("tn.thabat.app.OPEN." + w); }
        return PendingIntent.getActivity(c, req, open, FLAGS);
    }

    static int rid(Context c, String n, String t) { return c.getResources().getIdentifier(n, t, c.getPackageName()); }

    static void render(Context c) {
        try {
            AppWidgetManager m = AppWidgetManager.getInstance(c);
            int[] ids = m.getAppWidgetIds(new ComponentName(c, Widget.class));
            if (ids == null || ids.length == 0) { Widget2.render(c); return; }
            RemoteViews v = new RemoteViews(c.getPackageName(), rid(c, "thabat_widget", "layout"));
            String js = c.getSharedPreferences("thabat", 0).getString("widget", null);
            if (js != null) {
                JSONObject o = new JSONObject(js);
                JSONArray pr = o.optJSONArray("pr");
                long now = System.currentTimeMillis();
                String name = o.optString("none", "-"), time = "";
                if (pr != null) {
                    for (int i = 0; i < pr.length(); i++) {
                        JSONObject p = pr.getJSONObject(i);
                        if (p.getLong("t") > now) { name = p.optString("n", ""); time = p.optString("s", ""); break; }
                    }
                }
                v.setTextViewText(rid(c, "w_title", "id"), o.optString("nextLbl", ""));
                v.setTextViewText(rid(c, "w_prayer", "id"), name);
                v.setTextViewText(rid(c, "w_time", "id"), time);
                v.setTextViewText(rid(c, "w_prog", "id"), o.optString("prog", ""));
                v.setProgressBar(rid(c, "w_bar", "id"), 100, o.optInt("pct", 0), false);
                v.setTextViewText(rid(c, "w_adh", "id"), o.optString("adhLbl", ""));
            }
            v.setOnClickPendingIntent(rid(c, "w_root", "id"), openPi(c, 101));
            Intent adh = new Intent(c, MainActivity.class);
            adh.setAction("tn.thabat.app.ADHKAR");
            adh.putExtra("open", "adhkar");
            adh.addFlags(0x10000000 | 0x20000000);
            v.setOnClickPendingIntent(rid(c, "w_adh", "id"), PendingIntent.getActivity(c, 102, adh, FLAGS));
            WTheme.apply(c, v, 1);
            m.updateAppWidget(ids, v);
        } catch (Throwable t) {}
        Widget2.render(c);
    }
}
