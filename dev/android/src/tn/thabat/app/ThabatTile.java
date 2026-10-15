package tn.thabat.app;

import android.app.PendingIntent;
import android.content.Intent;
import android.os.Build;
import android.service.quicksettings.Tile;
import android.service.quicksettings.TileService;
import org.json.JSONArray;
import org.json.JSONObject;

/** 3.26: a Quick Settings tile — the next prayer under its name; a tap opens Thabat and starts a work session (or shows the one running). */
public class ThabatTile extends TileService {
    String str(String n) { try { return getString(getResources().getIdentifier(n, "string", getPackageName())); } catch (Throwable t) { return ""; } }

    @Override
    public void onStartListening() { refresh(); }

    @Override
    public void onTileAdded() { refresh(); }

    void refresh() {
        try {
            Tile t = getQsTile();
            if (t == null) return;
            android.content.SharedPreferences p = getSharedPreferences("thabat", 0);
            String sub = "";
            String js = p.getString("widget", null);
            if (js != null) {
                JSONObject o = new JSONObject(js);
                JSONArray pr = o.optJSONArray("pr");
                long now = System.currentTimeMillis();
                if (pr != null) for (int i = 0; i < pr.length(); i++) { JSONObject x = pr.getJSONObject(i); if (x.getLong("t") > now) { sub = x.optString("n", "") + " " + x.optString("s", ""); break; } }
            }
            boolean running = false;
            String tn = p.getString("tn", null);
            if (tn != null) { String m = new JSONObject(tn).optString("mode", "idle"); running = m.equals("work") || m.equals("brk"); }
            t.setLabel(str(running ? "tile_running" : "tile_label"));
            if (Build.VERSION.SDK_INT >= 29) t.setSubtitle(sub);
            t.setState(running ? Tile.STATE_ACTIVE : Tile.STATE_INACTIVE);
            t.updateTile();
        } catch (Throwable e) {}
    }

    @Override
    public void onClick() {
        try {
            Intent i = new Intent(this, MainActivity.class);
            i.addFlags(0x10000000 | 0x20000000);
            i.putExtra("open", "timer");
            i.setAction("tn.thabat.app.OPEN.timer");
            if (Build.VERSION.SDK_INT >= 34) startActivityAndCollapse(PendingIntent.getActivity(this, 7901, i, 0x08000000 | 0x04000000));
            else startActivityAndCollapse(i);
        } catch (Throwable e) {}
    }
}
