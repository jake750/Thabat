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
            /* 3.135: the book's cover beside it (a small JPEG in base64), hidden when there is none */
            int cid = Widget.rid(c, "w8_cover", "id");
            String img = o.optString("img", "");
            boolean shown = false;
            if (cid != 0 && img.length() > 0) {
                try { byte[] b = android.util.Base64.decode(img, 0); android.graphics.Bitmap bm = android.graphics.BitmapFactory.decodeByteArray(b, 0, b.length); if (bm != null) { v.setImageViewBitmap(cid, bm); shown = true; } } catch (Throwable t) {}
            }
            if (cid != 0) v.setViewVisibility(cid, shown ? 0 : 8);
            v.setOnClickPendingIntent(Widget.rid(c, "w8_root", "id"), Ongoing.open(c, "cont", 7891));
            WTheme.apply(c, v, 8);
            m.updateAppWidget(ids, v);
        } catch (Throwable t) {}
    }
}
