package tn.thabat.app;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.RectF;
import android.graphics.Typeface;
import android.widget.RemoteViews;
import org.json.JSONArray;
import org.json.JSONObject;

/** 3.59: the month with its gold days, drawn as a picture from what the app sends (prefs «calw»). */
public class Widget7 extends AppWidgetProvider {
    @Override
    public void onUpdate(Context c, AppWidgetManager m, int[] ids) { render(c); }

    static void render(Context c) {
        try {
            AppWidgetManager m = AppWidgetManager.getInstance(c);
            int[] ids = m.getAppWidgetIds(new ComponentName(c, Widget7.class));
            if (ids == null || ids.length == 0) return;
            SharedPreferences sp = c.getSharedPreferences("thabat", 0);
            JSONObject o; try { o = new JSONObject(sp.getString("calw", "{}")); } catch (Throwable t) { o = new JSONObject(); }
            int W = 720, H = 640, top = 96, cols = 7;
            Bitmap b = Bitmap.createBitmap(W, H, Bitmap.Config.ARGB_8888);
            Canvas cv = new Canvas(b);
            Paint p = new Paint(Paint.ANTI_ALIAS_FLAG);
            p.setColor(0xF0141518); cv.drawRoundRect(new RectF(0, 0, W, H), 36, 36, p);
            p.setColor(0xFFF3F0E6); p.setTextSize(34); p.setTypeface(Typeface.DEFAULT_BOLD); p.setTextAlign(Paint.Align.CENTER);
            cv.drawText(o.optString("title", ""), W / 2f, 52, p);
            JSONArray wk = o.optJSONArray("wk"); boolean rtl = o.optBoolean("rtl", true);
            p.setTypeface(Typeface.DEFAULT); p.setTextSize(22); p.setColor(0xFF9A968C);
            float cw = (W - 32) / (float) cols;
            for (int i = 0; i < cols; i++) { int col = rtl ? cols - 1 - i : i; cv.drawText(wk != null ? wk.optString(i, "") : "", 16 + cw * col + cw / 2, top - 14, p); }
            JSONArray d = o.optJSONArray("d"); if (d == null) d = new JSONArray();
            int rows = (int) Math.ceil(d.length() / 7.0); float ch = (H - top - 16) / (float) Math.max(5, rows);
            for (int i = 0; i < d.length(); i++) {
                JSONObject x = d.optJSONObject(i); if (x == null) continue;
                int r = i / 7, k = i % 7, col = rtl ? cols - 1 - k : k;
                RectF cell = new RectF(16 + cw * col + 4, top + ch * r + 4, 16 + cw * (col + 1) - 4, top + ch * (r + 1) - 4);
                boolean out = x.optInt("o", 0) == 1, gold = x.optInt("g", 0) == 1, today = x.optInt("t", 0) == 1; double pc = x.optDouble("p", 0);
                p.setStyle(Paint.Style.FILL); p.setColor(out ? 0x10FFFFFF : 0x22FFFFFF); cv.drawRoundRect(cell, 14, 14, p);
                if (!out && pc > 0) { float h = (float) Math.min(1, pc) * cell.height(); p.setColor(gold ? 0xCCFDDB00 : 0x66FDDB00); cv.drawRoundRect(new RectF(cell.left, cell.bottom - h, cell.right, cell.bottom), 14, 14, p); }
                if (today) { p.setStyle(Paint.Style.STROKE); p.setStrokeWidth(4); p.setColor(0xFFFDDB00); cv.drawRoundRect(cell, 14, 14, p); p.setStyle(Paint.Style.FILL); }
                p.setTextSize(28); p.setTypeface(Typeface.DEFAULT_BOLD); p.setColor(out ? 0x55F3F0E6 : (gold ? 0xFF1A1400 : 0xFFF3F0E6));
                cv.drawText(String.valueOf(x.optInt("n", 0)), cell.centerX(), cell.centerY() + 10, p);
            }
            RemoteViews v = new RemoteViews(c.getPackageName(), Widget.rid(c, "thabat_widget7", "layout"));
            v.setImageViewBitmap(Widget.rid(c, "w7_img", "id"), b);
            v.setOnClickPendingIntent(Widget.rid(c, "w7_root", "id"), Ongoing.open(c, "cal", 7891));
            m.updateAppWidget(ids, v);
        } catch (Throwable t) {}
    }
}
