package tn.thabat.app;

import android.content.Context;
import android.content.res.ColorStateList;
import android.graphics.Color;
import android.os.Build;
import android.widget.RemoteViews;
import org.json.JSONObject;

/* 3.75: home-screen widgets take the app's theme colours (accent, surface, text); background tints need Android 12+ */
final class WTheme {
    static final String[][][] W = {
        /* root, accent texts, main texts, muted texts, buttons, bars */
        { {"w_root"}, {"w_prayer"}, {"w_time"}, {"w_title", "w_prog"}, {"w_adh"}, {"w_bar"} },
        { {"w2_root"}, {"w2_name"}, {"w2_cd"}, {"w2_title", "w2_time"}, {}, {} },
        { {"w3_root"}, {"w3_count"}, {"w3_text"}, {"w3_goal", "w3_next"}, {}, {} },
        { {"w4_root"}, {"w4_lbl"}, {"w4_text"}, {"w4_sub"}, {"w4_done"}, {} },
        { {"w5_root"}, {"w5_ref"}, {"w5_text"}, {}, {}, {} },
        { {"w6_root"}, {"w6_count"}, {"w6_title"}, {}, {"w6_add"}, {"w6_bar"} }
    };

    static void apply(Context c, RemoteViews v, int widget) {
        try {
            if (widget < 1 || widget > W.length) return;
            String js = c.getSharedPreferences("thabat", 0).getString("wtheme", null);
            if (js == null) return;
            JSONObject o = new JSONObject(js);
            int acc = Color.parseColor(o.getString("acc")), bg = Color.parseColor(o.getString("bg")),
                txt = Color.parseColor(o.getString("text")), mut = Color.parseColor(o.getString("muted")), on = Color.parseColor(o.getString("on"));
            String[][] w = W[widget - 1];
            for (String n : w[1]) text(c, v, n, acc);
            for (String n : w[2]) text(c, v, n, txt);
            for (String n : w[3]) text(c, v, n, mut);
            for (String n : w[4]) text(c, v, n, on);
            if (Build.VERSION.SDK_INT >= 31) {
                for (String n : w[0]) tint(c, v, n, "setBackgroundTintList", bg);
                for (String n : w[4]) tint(c, v, n, "setBackgroundTintList", acc);
                for (String n : w[5]) tint(c, v, n, "setProgressTintList", acc);
            }
        } catch (Throwable t) {}
    }

    static void text(Context c, RemoteViews v, String n, int col) {
        int id = Widget.rid(c, n, "id");
        if (id != 0) try { v.setTextColor(id, col); } catch (Throwable t) {}
    }

    static void tint(Context c, RemoteViews v, String n, String m, int col) {
        int id = Widget.rid(c, n, "id");
        if (id != 0) try { v.setColorStateList(id, m, ColorStateList.valueOf(col)); } catch (Throwable t) {}
    }

    static void renderAll(Context c) {
        try { Widget.render(c); } catch (Throwable t) {}
        try { Widget2.render(c); } catch (Throwable t) {}
        try { Widget3.render(c); } catch (Throwable t) {}
        try { Widget4.render(c); } catch (Throwable t) {}
        try { Widget5.render(c); } catch (Throwable t) {}
        try { Widget6.render(c); } catch (Throwable t) {}
    }
}
