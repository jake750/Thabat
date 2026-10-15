package tn.thabat.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.widget.RemoteViews;
import org.json.JSONArray;
import org.json.JSONObject;

/** Tasbih widget: tap to count, the app adds the taps to the day's tasbih when opened. */
public class Widget3 extends AppWidgetProvider {
    static final String TAP = "tn.thabat.app.TSB_TAP", NEXT = "tn.thabat.app.TSB_NEXT";

    @Override
    public void onUpdate(Context c, AppWidgetManager m, int[] ids) { render(c); }

    @Override
    public void onReceive(Context c, Intent in) {
        String a = in.getAction();
        if (TAP.equals(a)) { tap(c); return; }
        if (NEXT.equals(a)) { next(c); return; }
        super.onReceive(c, in);
    }

    static String today() { java.util.Calendar k = java.util.Calendar.getInstance(); return String.format(java.util.Locale.US, "%04d-%02d-%02d", k.get(1), k.get(2) + 1, k.get(5)); }

    static JSONArray list(SharedPreferences sp) {
        try { JSONObject o = new JSONObject(sp.getString("tsbCfg", "{}")); JSONArray L = o.optJSONArray("list"); return L == null ? new JSONArray() : L; } catch (Throwable t) { return new JSONArray(); }
    }

    static void tap(Context c) {
        try {
            SharedPreferences sp = c.getSharedPreferences("thabat", 0);
            JSONArray L = list(sp);
            if (L.length() == 0) return;
            int idx = Math.max(0, Math.min(L.length() - 1, sp.getInt("tsbIdx", 0)));
            String id = L.getJSONObject(idx).optString("id");
            JSONArray q = new JSONArray(sp.getString("tsbTaps", "[]"));
            String d = today();
            boolean found = false;
            for (int i = 0; i < q.length(); i++) { JSONObject e = q.getJSONObject(i); if (d.equals(e.optString("d")) && id.equals(e.optString("id"))) { e.put("n", e.optInt("n") + 1); found = true; break; } }
            if (!found) { JSONObject e = new JSONObject(); e.put("d", d); e.put("id", id); e.put("n", 1); q.put(e); }
            sp.edit().putString("tsbTaps", q.toString()).apply();
            render(c);
            MainActivity.poke();
        } catch (Throwable t) {}
    }

    static void next(Context c) {
        SharedPreferences sp = c.getSharedPreferences("thabat", 0);
        int n = list(sp).length();
        if (n > 0) sp.edit().putInt("tsbIdx", (sp.getInt("tsbIdx", 0) + 1) % n).apply();
        render(c);
    }

    static void render(Context c) {
        try {
            AppWidgetManager m = AppWidgetManager.getInstance(c);
            int[] ids = m.getAppWidgetIds(new ComponentName(c, Widget3.class));
            if (ids == null || ids.length == 0) return;
            SharedPreferences sp = c.getSharedPreferences("thabat", 0);
            RemoteViews v = new RemoteViews(c.getPackageName(), Widget.rid(c, "thabat_widget3", "layout"));
            JSONObject cfg = new JSONObject(sp.getString("tsbCfg", "{}"));
            JSONArray L = list(sp);
            String text = "سبحان الله", sub = "";
            int count = 0, goal = 0;
            if (L.length() > 0) {
                int idx = Math.max(0, Math.min(L.length() - 1, sp.getInt("tsbIdx", 0)));
                JSONObject it = L.getJSONObject(idx);
                String id = it.optString("id"), d = today();
                text = it.optString("text", text); goal = it.optInt("goal", 0);
                if (d.equals(cfg.optString("date"))) count = it.optInt("count", 0);
                JSONArray q = new JSONArray(sp.getString("tsbTaps", "[]"));
                for (int i = 0; i < q.length(); i++) { JSONObject e = q.getJSONObject(i); if (d.equals(e.optString("d")) && id.equals(e.optString("id"))) count += e.optInt("n"); }
                sub = L.length() > 1 ? (idx + 1) + "/" + L.length() + "  ⟳" : "";
            }
            v.setTextViewText(Widget.rid(c, "w3_text", "id"), text);
            v.setTextViewText(Widget.rid(c, "w3_count", "id"), String.valueOf(count));
            v.setTextViewText(Widget.rid(c, "w3_goal", "id"), goal > 0 ? "/ " + goal + (count >= goal ? "  ✓" : "") : "");
            v.setTextViewText(Widget.rid(c, "w3_next", "id"), sub);
            Intent tap = new Intent(c, Widget3.class); tap.setAction(TAP);
            v.setOnClickPendingIntent(Widget.rid(c, "w3_root", "id"), PendingIntent.getBroadcast(c, 7851, tap, Widget.FLAGS));
            Intent nx = new Intent(c, Widget3.class); nx.setAction(NEXT);
            v.setOnClickPendingIntent(Widget.rid(c, "w3_next", "id"), PendingIntent.getBroadcast(c, 7852, nx, Widget.FLAGS));
            m.updateAppWidget(ids, v);
        } catch (Throwable t) {}
    }
}
