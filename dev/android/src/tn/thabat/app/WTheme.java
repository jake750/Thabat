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
        { {"w6_root"}, {"w6_count"}, {"w6_title"}, {}, {"w6_add"}, {"w6_bar"} },
        { {}, {}, {}, {}, {}, {} },
        { {"w8_root"}, {"w8_lbl"}, {"w8_title"}, {"w8_sub"}, {}, {"w8_bar"} },
        { {"w9_root"}, {}, {"w9_title"}, {"w9_unit", "w9_sub", "w9_more"}, {}, {} },
        { {"w10_root"}, {"w10_title", "w10_c0", "w10_c1", "w10_c2", "w10_c3"}, {"w10_t0", "w10_t1", "w10_t2", "w10_t3"}, {"w10_count", "w10_empty"}, {}, {} }
    };
    /* 3.167: each layout's text sizes (px), read once from the layout itself, so a size step scales them all */
    static final java.util.HashMap<Integer, java.util.ArrayList<float[]>> SZ = new java.util.HashMap<>();

    static java.util.ArrayList<float[]> sizes(Context c, int widget) {
        java.util.ArrayList<float[]> L = SZ.get(widget);
        if (L != null) return L;
        L = new java.util.ArrayList<>();
        try {
            int lay = Widget.rid(c, widget == 1 ? "thabat_widget" : "thabat_widget" + widget, "layout");
            android.view.View root = android.view.LayoutInflater.from(c).inflate(lay, null);
            walk(root, L);
        } catch (Throwable t) {}
        SZ.put(widget, L);
        return L;
    }

    static void walk(android.view.View x, java.util.ArrayList<float[]> L) {
        if (x instanceof android.widget.TextView && x.getId() != android.view.View.NO_ID) L.add(new float[]{x.getId(), ((android.widget.TextView) x).getTextSize()});
        if (x instanceof android.view.ViewGroup) { android.view.ViewGroup g = (android.view.ViewGroup) x; for (int i = 0; i < g.getChildCount(); i++) walk(g.getChildAt(i), L); }
    }

    static void apply(Context c, RemoteViews v, int widget) {
        try {
            if (widget < 1 || widget > W.length) return;
            String js = c.getSharedPreferences("thabat", 0).getString("wtheme", null);
            if (js == null) return;
            JSONObject o = new JSONObject(js);
            int acc = Color.parseColor(o.getString("acc")), bg = Color.parseColor(o.getString("bg")),
                txt = Color.parseColor(o.getString("text")), mut = Color.parseColor(o.getString("muted")), on = Color.parseColor(o.getString("on"));
            String[][] w = W[widget - 1];
            double fs = o.optDouble("fs", 1);
            if (fs > 0.5 && fs < 2 && Math.abs(fs - 1) > 0.01) for (float[] z : sizes(c, widget)) try { v.setTextViewTextSize((int) z[0], android.util.TypedValue.COMPLEX_UNIT_PX, (float) (z[1] * fs)); } catch (Throwable t) {}
            boolean tr = o.optBoolean("tr", false);
            if (tr) for (String n : w[0]) { int id = Widget.rid(c, n, "id"); if (id != 0) try { v.setInt(id, "setBackgroundColor", 0); } catch (Throwable t) {} }
            for (String n : w[1]) text(c, v, n, acc);
            for (String n : w[2]) text(c, v, n, txt);
            for (String n : w[3]) text(c, v, n, mut);
            for (String n : w[4]) text(c, v, n, on);
            if (Build.VERSION.SDK_INT >= 31) {
                if (!tr) for (String n : w[0]) tint(c, v, n, "setBackgroundTintList", bg);
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
        try { Widget8.render(c); } catch (Throwable t) {}
        try { Widget9.render(c); } catch (Throwable t) {}
        try { Widget10.render(c); } catch (Throwable t) {}
    }
}
