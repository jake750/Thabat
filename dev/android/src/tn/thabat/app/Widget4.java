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

/** Current task widget: shows the task to do now; the check marks it done (the app applies it when opened). */
public class Widget4 extends AppWidgetProvider {
    static final String DONE = "tn.thabat.app.TASK_DONE";

    @Override
    public void onUpdate(Context c, AppWidgetManager m, int[] ids) { render(c); }

    @Override
    public void onReceive(Context c, Intent in) {
        if (DONE.equals(in.getAction())) { done(c); return; }
        super.onReceive(c, in);
    }

    static JSONObject data(SharedPreferences sp) {
        try { return new JSONObject(sp.getString("wx", "{}")); } catch (Throwable t) { return new JSONObject(); }
    }

    static void done(Context c) {
        try {
            SharedPreferences sp = c.getSharedPreferences("thabat", 0);
            JSONObject o = data(sp);
            JSONObject tk = o.optJSONObject("task");
            if (tk == null) return;
            JSONArray q = new JSONArray(sp.getString("wxDone", "[]"));
            JSONObject e = new JSONObject(); e.put("k", tk.optString("k")); e.put("id", tk.optString("id")); e.put("at", System.currentTimeMillis());
            q.put(e);
            JSONArray rest = o.optJSONArray("next");
            if (rest != null && rest.length() > 0) { o.put("task", rest.getJSONObject(0)); JSONArray r2 = new JSONArray(); for (int i = 1; i < rest.length(); i++) r2.put(rest.getJSONObject(i)); o.put("next", r2); }
            else o.put("task", (Object) null);
            sp.edit().putString("wxDone", q.toString()).putString("wx", o.toString()).apply();
            render(c);
            MainActivity.poke();
        } catch (Throwable t) {}
    }

    static void render(Context c) {
        try {
            AppWidgetManager m = AppWidgetManager.getInstance(c);
            int[] ids = m.getAppWidgetIds(new ComponentName(c, Widget4.class));
            if (ids == null || ids.length == 0) return;
            SharedPreferences sp = c.getSharedPreferences("thabat", 0);
            JSONObject o = data(sp);
            JSONObject tk = o.optJSONObject("task");
            RemoteViews v = new RemoteViews(c.getPackageName(), Widget.rid(c, "thabat_widget4", "layout"));
            v.setTextViewText(Widget.rid(c, "w4_lbl", "id"), o.optString("lbl", "الآن"));
            v.setTextViewText(Widget.rid(c, "w4_text", "id"), tk == null ? o.optString("none", "لا مهام مفتوحة 🌿") : tk.optString("text"));
            v.setTextViewText(Widget.rid(c, "w4_sub", "id"), o.optString("sub", ""));
            v.setTextViewText(Widget.rid(c, "w4_done", "id"), tk == null ? "" : "✓");
            Intent d = new Intent(c, Widget4.class); d.setAction(DONE);
            v.setOnClickPendingIntent(Widget.rid(c, "w4_done", "id"), PendingIntent.getBroadcast(c, 7861, d, Widget.FLAGS));
            Intent open = new Intent(c, MainActivity.class); open.addFlags(0x10000000 | 0x20000000);
            if (open != null) { open.putExtra("open", "today"); v.setOnClickPendingIntent(Widget.rid(c, "w4_text", "id"), PendingIntent.getActivity(c, 7862, open, Widget.FLAGS)); }
            WTheme.apply(c, v, 4);
            m.updateAppWidget(ids, v);
        } catch (Throwable t) {}
    }
}
