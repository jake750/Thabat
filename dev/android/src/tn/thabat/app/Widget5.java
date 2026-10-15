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

/** Ayah of the day widget. */
public class Widget5 extends AppWidgetProvider {
    @Override
    public void onUpdate(Context c, AppWidgetManager m, int[] ids) { render(c); }

    static void render(Context c) {
        try {
            AppWidgetManager m = AppWidgetManager.getInstance(c);
            int[] ids = m.getAppWidgetIds(new ComponentName(c, Widget5.class));
            if (ids == null || ids.length == 0) return;
            SharedPreferences sp = c.getSharedPreferences("thabat", 0);
            JSONObject o = Widget4.data(sp);
            JSONObject ay = o.optJSONObject("ayah");
            RemoteViews v = new RemoteViews(c.getPackageName(), Widget.rid(c, "thabat_widget5", "layout"));
            v.setTextViewText(Widget.rid(c, "w5_text", "id"), ay == null ? "﴿ أَلَا بِذِكْرِ ٱللَّهِ تَطْمَئِنُّ ٱلْقُلُوبُ ﴾" : ay.optString("t"));
            v.setTextViewText(Widget.rid(c, "w5_ref", "id"), ay == null ? "الرعد 28" : ay.optString("ref"));
            Intent open = new Intent(c, MainActivity.class); open.addFlags(0x10000000 | 0x20000000);
            if (open != null) { open.putExtra("open", ay == null ? "quran" : "ayah:" + ay.optString("k")); v.setOnClickPendingIntent(Widget.rid(c, "w5_root", "id"), PendingIntent.getActivity(c, 7871, open, Widget.FLAGS)); }
            m.updateAppWidget(ids, v);
        } catch (Throwable t) {}
    }
}
