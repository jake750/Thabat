package tn.thabat.app;

import android.app.Activity;
import android.content.ClipData;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.webkit.GeolocationPermissions;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class MainActivity extends Activity {
    static final int REQ_NOTIF = 1, REQ_LOC = 2, REQ_FILE = 3, REQ_MIC = 4, REQ_DICT = 5;
    android.webkit.PermissionRequest micReq;
    WebView web;
    android.view.View rootView;
    boolean fsOn;
    static MainActivity live;
    /** 3.26: stays set while the activity exists (live is cleared on pause) */
    static MainActivity inst;
    String pendingOpen;
    String geoOrigin;
    GeolocationPermissions.Callback geoCb;
    ValueCallback<Uri[]> fileCb;

    @Override
    protected void onCreate(Bundle b) {
        super.onCreate(b);
        inst = this;
        readOpen(getIntent());
        readShare(getIntent());
        try { getWindow().setStatusBarColor(0xFF0F1115); getWindow().setNavigationBarColor(0xFF0F1115); } catch (Throwable t) {}
        web = new WebView(this);
        web.setBackgroundColor(0xFF0F1115);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(true);
        s.setAllowFileAccessFromFileURLs(true);
        s.setAllowUniversalAccessFromFileURLs(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setGeolocationEnabled(true);
        s.setTextZoom(100);
        s.setSupportZoom(false);
        web.setWebViewClient(new Client(this));
        web.setWebChromeClient(new Chrome(this));
        web.addJavascriptInterface(new Bridge(this), "ThabatAndroid");
        android.widget.FrameLayout root = new android.widget.FrameLayout(this);
        root.setBackgroundColor(0xFF0F1115);
        root.addView(web);
        root.setOnApplyWindowInsetsListener(new InsetPad(this));
        web.addOnLayoutChangeListener(new LayoutWatch(this));
        rootView = root;
        setContentView(root);
        try { getWindow().getDecorView().setSystemUiVisibility(0); if (Build.VERSION.SDK_INT >= 30) getWindow().setDecorFitsSystemWindows(true); } catch (Throwable t) {}
        /* Android 13+: the back gesture (predictive back) — on Android 16 onBackPressed is no longer called */
        try { if (Build.VERSION.SDK_INT >= 33) getOnBackInvokedDispatcher().registerOnBackInvokedCallback(0, new BackCb(this)); } catch (Throwable t) {}
        web.loadUrl("file:///android_asset/www/Thabat.html");
        if (Build.VERSION.SDK_INT >= 33 && checkSelfPermission("android.permission.POST_NOTIFICATIONS") != 0) {
            try { requestPermissions(new String[]{"android.permission.POST_NOTIFICATIONS"}, REQ_NOTIF); } catch (Throwable t) {}
        }
    }

    void readOpen(Intent i) {
        try { if (i != null) { String o = i.getStringExtra("open"); if (o != null && o.length() > 0) pendingOpen = o; } } catch (Throwable t) {}
    }

    /* 3.106: «share to Thabat» — text and up to four pictures from another app wait here until the page takes them (Bridge.takeShare) */
    static String pendingShare = null;
    void readShare(Intent i) {
        try {
            if (i == null) return;
            String act = i.getAction();
            if (!Intent.ACTION_SEND.equals(act) && !Intent.ACTION_SEND_MULTIPLE.equals(act)) return;
            org.json.JSONObject o = new org.json.JSONObject();
            CharSequence tx = i.getCharSequenceExtra(Intent.EXTRA_TEXT);
            if (tx != null && tx.length() > 0) o.put("text", tx.toString());
            String sub = i.getStringExtra(Intent.EXTRA_SUBJECT);
            if (sub != null && sub.length() > 0) o.put("subject", sub);
            java.util.ArrayList<android.net.Uri> us = new java.util.ArrayList<android.net.Uri>();
            if (Intent.ACTION_SEND.equals(act)) { android.net.Uri u = (android.net.Uri) i.getParcelableExtra(Intent.EXTRA_STREAM); if (u != null) us.add(u); }
            else { java.util.ArrayList<android.os.Parcelable> L = i.getParcelableArrayListExtra(Intent.EXTRA_STREAM); if (L != null) for (android.os.Parcelable p : L) if (p instanceof android.net.Uri) us.add((android.net.Uri) p); }
            org.json.JSONArray im = new org.json.JSONArray();
            for (android.net.Uri u : us) { if (im.length() >= 4) break; String d = imgData(u); if (d != null) im.put(d); }
            if (im.length() > 0) o.put("imgs", im);
            if (o.length() > 0) pendingShare = o.toString();
            i.setAction(null);
        } catch (Throwable t) {}
    }

    String imgData(android.net.Uri u) {
        try {
            String mt = getContentResolver().getType(u);
            if (mt != null && !mt.startsWith("image/")) return null;
            android.graphics.BitmapFactory.Options op = new android.graphics.BitmapFactory.Options(); op.inJustDecodeBounds = true;
            java.io.InputStream in = getContentResolver().openInputStream(u); android.graphics.BitmapFactory.decodeStream(in, null, op); in.close();
            int s = 1; while (Math.max(op.outWidth, op.outHeight) / s > 3200) s *= 2;
            android.graphics.BitmapFactory.Options op2 = new android.graphics.BitmapFactory.Options(); op2.inSampleSize = s;
            in = getContentResolver().openInputStream(u); android.graphics.Bitmap b = android.graphics.BitmapFactory.decodeStream(in, null, op2); in.close();
            if (b == null) return null;
            int w = b.getWidth(), h = b.getHeight(), m = Math.max(w, h);
            if (m > 1600) { float k = 1600f / m; b = android.graphics.Bitmap.createScaledBitmap(b, Math.round(w * k), Math.round(h * k), true); }
            java.io.ByteArrayOutputStream bo = new java.io.ByteArrayOutputStream();
            b.compress(android.graphics.Bitmap.CompressFormat.JPEG, 82, bo);
            return "data:image/jpeg;base64," + android.util.Base64.encodeToString(bo.toByteArray(), android.util.Base64.NO_WRAP);
        } catch (Throwable t) { return null; }
    }

    @Override
    protected void onNewIntent(Intent i) {
        super.onNewIntent(i);
        setIntent(i);
        readOpen(i);
        readShare(i);
    }

    static class BackCb implements android.window.OnBackInvokedCallback {
        final MainActivity a;
        BackCb(MainActivity a) { this.a = a; }
        public void onBackInvoked() { a.evalBack(); }
    }

    @Override
    public void onBackPressed() {
        evalBack();
    }

    @SuppressWarnings({"rawtypes","unchecked"})
    void evalBack() {
        ValueCallback cb = new BackCallback(this);
        web.evaluateJavascript("(function(){try{return !!(window.thabatBack&&window.thabatBack())}catch(e){return false}})()", cb);
    }

    /** Keep the page clear of the status bar and the phone's navigation buttons (except in full screen). */
    static class InsetPad implements android.view.View.OnApplyWindowInsetsListener {
        final MainActivity a;
        InsetPad(MainActivity a) { this.a = a; }
        public android.view.WindowInsets onApplyWindowInsets(android.view.View v, android.view.WindowInsets i) {
            if (a.fsOn) v.setPadding(0, 0, 0, 0);
            else v.setPadding(i.getSystemWindowInsetLeft(), i.getSystemWindowInsetTop(), i.getSystemWindowInsetRight(), i.getSystemWindowInsetBottom() + a.extraB);
            a.measureNav();
            return i.consumeSystemWindowInsets();
        }
    }

    /** Measure how much of the page is really hidden behind the phone's navigation bar and push the page up by exactly that much. */
    int lastOv = -1;
    int extraB = 0;
    void measureNav() {
        try { web.postDelayed(new NavMeasure(this), 150); web.postDelayed(new NavMeasure(this), 1000); } catch (Throwable t) {}
    }
    static class NavMeasure implements Runnable {
        final MainActivity a;
        NavMeasure(MainActivity a) { this.a = a; }
        public void run() {
            try {
                if (a.fsOn) { if (a.extraB != 0) { a.extraB = 0; a.rootView.requestApplyInsets(); } return; }
                android.view.View d = a.getWindow().getDecorView();
                float den = a.getResources().getDisplayMetrics().density; if (den <= 0) den = 1;
                android.view.WindowInsets wi = d.getRootWindowInsets();
                int nb = wi == null ? 0 : wi.getSystemWindowInsetBottom();
                int[] dl = new int[2]; d.getLocationOnScreen(dl);
                int limit = dl[1] + d.getHeight() - nb;
                android.graphics.Rect r = new android.graphics.Rect(); d.getWindowVisibleDisplayFrame(r);
                if (r.bottom > 0 && r.bottom < limit && limit - r.bottom < 80 * den) limit = r.bottom;
                int[] wl = new int[2]; a.web.getLocationOnScreen(wl);
                int ov = wl[1] + a.web.getHeight() - limit;
                int cap = Math.round(72 * den);
                int ne = a.extraB;
                if (ov > 0 && ov <= cap) ne = Math.min(cap, a.extraB + ov);
                else if (ov < 0 && a.extraB > 0) ne = Math.max(0, a.extraB + ov);
                if (ne != a.extraB) { a.extraB = ne; a.rootView.requestApplyInsets(); a.measureNav(); }
                int px = Math.round(a.extraB / den);
                int vis = Math.min(wl[1] + a.web.getHeight(), limit) - wl[1];
                int wh = Math.round(vis / den);
                int key = px * 10000 + wh;
                if (key != a.lastOv) { a.lastOv = key; a.web.evaluateJavascript("(function(s){s.setProperty('--andfix','" + px + "px');s.setProperty('--webh','" + wh + "px');window.ANDNAV={fix:" + px + ",webh:" + wh + ",nb:" + Math.round(nb / den) + ",ov:" + Math.round(ov / den) + "}})(document.documentElement.style)", null); }
            } catch (Throwable t) {}
        }
    }
    static class LayoutWatch implements android.view.View.OnLayoutChangeListener {
        final MainActivity a;
        LayoutWatch(MainActivity a) { this.a = a; }
        public void onLayoutChange(android.view.View v, int l, int t, int r, int b, int ol, int ot, int or, int ob) {
            if (b - t != ob - ot || r - l != or - ol) { a.lastOv = -1; a.measureNav(); }
        }
    }

    void applyFullscreen(boolean on) {
        fsOn = on;
        try { if (rootView != null) rootView.requestApplyInsets(); } catch (Throwable t) {}
        try {
            if (on) {
                getWindow().addFlags(0x400 | 0x80);
                getWindow().getDecorView().setSystemUiVisibility(0x1000 | 0x4 | 0x2 | 0x400 | 0x200 | 0x100);
            } else {
                getWindow().clearFlags(0x400 | 0x80);
                getWindow().getDecorView().setSystemUiVisibility(0);
            }
        } catch (Throwable t) {}
    }

    void superBack() {
        moveTaskToBack(true);
    }

    void askLocation(String origin, GeolocationPermissions.Callback cb) {
        if (checkSelfPermission("android.permission.ACCESS_FINE_LOCATION") == 0 || checkSelfPermission("android.permission.ACCESS_COARSE_LOCATION") == 0) {
            cb.invoke(origin, true, false);
            return;
        }
        geoOrigin = origin;
        geoCb = cb;
        requestPermissions(new String[]{"android.permission.ACCESS_FINE_LOCATION", "android.permission.ACCESS_COARSE_LOCATION"}, REQ_LOC);
    }

    @Override
    public void onRequestPermissionsResult(int code, String[] perms, int[] res) {
        if (code == REQ_MIC && micReq != null) {
            boolean ok = res.length > 0; for (int x : res) if (x != 0) ok = false;
            try { if (ok) micReq.grant(micReq.getResources()); else micReq.deny(); } catch (Throwable t) {}
            micReq = null;
            return;
        }
        if (code == REQ_LOC && geoCb != null) {
            boolean ok = false;
            for (int r : res) if (r == 0) ok = true;
            geoCb.invoke(geoOrigin, ok, false);
            geoCb = null;
        }
    }

    void askMic(android.webkit.PermissionRequest r) {
        /* 3.60: the camera too (scanning the PC's transfer code) */
        java.util.ArrayList<String> res = new java.util.ArrayList<>(), need = new java.util.ArrayList<>();
        for (String x : r.getResources()) {
            if (android.webkit.PermissionRequest.RESOURCE_AUDIO_CAPTURE.equals(x)) { res.add(x); if (checkSelfPermission("android.permission.RECORD_AUDIO") != 0) need.add("android.permission.RECORD_AUDIO"); }
            else if (android.webkit.PermissionRequest.RESOURCE_VIDEO_CAPTURE.equals(x)) { res.add(x); if (checkSelfPermission("android.permission.CAMERA") != 0) need.add("android.permission.CAMERA"); }
        }
        if (res.isEmpty()) { r.deny(); return; }
        if (need.isEmpty()) { r.grant(res.toArray(new String[0])); return; }
        micReq = r;
        requestPermissions(need.toArray(new String[0]), REQ_MIC);
    }

    boolean pickFile(ValueCallback<Uri[]> cb, WebChromeClient.FileChooserParams p) {
        if (fileCb != null) fileCb.onReceiveValue(null);
        fileCb = cb;
        try {
            Intent i = p.createIntent();
            try { if (p.getMode() == 1) i.putExtra("android.intent.extra.ALLOW_MULTIPLE", true); } catch (Throwable t) {}
            startActivityForResult(i, REQ_FILE);
        } catch (Throwable t) {
            fileCb = null;
            return false;
        }
        return true;
    }

    /** Something changed from a notification or widget: let the page pick it up now if it is open. */
    static void poke() {
        final MainActivity a = live;
        if (a == null || a.web == null) return;
        a.runOnUiThread(new Poke(a));
    }

    static class Poke implements Runnable {
        final MainActivity a;
        Poke(MainActivity a) { this.a = a; }
        public void run() { try { a.web.evaluateJavascript("window.thabatPoll&&window.thabatPoll()", null); } catch (Throwable t) {} }
    }

    /** Fingerprint / face / screen lock before showing the app. */
    void bioAuth(String title, String sub) {
        try {
            if (Build.VERSION.SDK_INT < 29) { bioResult("unsupported"); return; }
            android.hardware.biometrics.BiometricPrompt.Builder b = new android.hardware.biometrics.BiometricPrompt.Builder(this).setTitle(title);
            if (sub != null && sub.length() > 0) b.setSubtitle(sub);
            b.setDeviceCredentialAllowed(true);
            b.build().authenticate(new android.os.CancellationSignal(), getMainExecutor(), new BioCb(this));
        } catch (Throwable t) { bioResult("error"); }
    }

    void bioResult(String r) {
        if (web == null) return;
        web.evaluateJavascript("window.thabatBio&&window.thabatBio(" + org.json.JSONObject.quote(r) + ")", null);
    }

    static class BioCb extends android.hardware.biometrics.BiometricPrompt.AuthenticationCallback {
        final MainActivity a;
        BioCb(MainActivity a) { this.a = a; }
        @Override public void onAuthenticationSucceeded(android.hardware.biometrics.BiometricPrompt.AuthenticationResult r) { a.bioResult("ok"); }
        @Override public void onAuthenticationError(int code, CharSequence s) { a.bioResult("err:" + code); }
    }

    static class BioRun implements Runnable {
        final MainActivity a; final String t, s;
        BioRun(MainActivity a, String t, String s) { this.a = a; this.t = t; this.s = s; }
        public void run() { a.bioAuth(t, s); }
    }

    /** Speech to text through the phone's own recognizer (Google voice typing etc). */
    void dictate(String lang, String prompt) {
        try {
            Intent i = new Intent("android.speech.action.RECOGNIZE_SPEECH");
            i.putExtra("android.speech.extra.LANGUAGE_MODEL", "free_form");
            if (lang != null && lang.length() > 0) { i.putExtra("android.speech.extra.LANGUAGE", lang); i.putExtra("android.speech.extra.LANGUAGE_PREFERENCE", lang); }
            if (prompt != null) i.putExtra("android.speech.extra.PROMPT", prompt);
            startActivityForResult(i, REQ_DICT);
        } catch (Throwable t) { dictResult(null, "none"); }
    }

    void dictResult(String text, String err) {
        if (web == null) return;
        String js = "window.thabatDictated&&window.thabatDictated(" + (text == null ? "null" : org.json.JSONObject.quote(text)) + "," + org.json.JSONObject.quote(err == null ? "" : err) + ")";
        web.evaluateJavascript(js, null);
    }

    @Override
    protected void onActivityResult(int req, int res, Intent data) {
        if (req == REQ_DICT) {
            String txt = null;
            try { if (res == RESULT_OK && data != null) { java.util.ArrayList<String> r = data.getStringArrayListExtra("android.speech.extra.RESULTS"); if (r != null && r.size() > 0) txt = r.get(0); } } catch (Throwable t) {}
            dictResult(txt, txt == null ? "cancel" : "");
            return;
        }
        if (req == REQ_FILE && fileCb != null) {
            Uri[] out = null;
            try {
                if (res == RESULT_OK && data != null) {
                    ClipData cd = data.getClipData();
                    if (cd != null && cd.getItemCount() > 0) {
                        out = new Uri[cd.getItemCount()];
                        for (int i = 0; i < cd.getItemCount(); i++) out[i] = cd.getItemAt(i).getUri();
                    } else if (data.getData() != null) {
                        out = new Uri[]{data.getData()};
                    }
                }
                if (out == null) out = WebChromeClient.FileChooserParams.parseResult(res, data);
            } catch (Throwable t) { out = null; }
            fileCb.onReceiveValue(out);
            fileCb = null;
        }
    }

    @Override
    protected void onDestroy() {
        if (inst == this) inst = null;
        super.onDestroy();
    }

    @Override
    protected void onPause() {
        live = null;
        if (web != null) web.evaluateJavascript("window.thabatFlush&&window.thabatFlush()", null);
        super.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        live = this;
        if (web != null) web.evaluateJavascript("window.thabatResume&&window.thabatResume()", null);
        if (web != null) { lastOv = -1; measureNav(); }
    }

    void openExternal(String url) {
        try {
            Intent i = new Intent("android.intent.action.VIEW", Uri.parse(url));
            i.addFlags(0x10000000);
            startActivity(i);
        } catch (Throwable t) {}
    }

    void share(String title, String text) {
        try {
            Intent i = new Intent("android.intent.action.SEND");
            i.setType("text/plain");
            i.putExtra("android.intent.extra.SUBJECT", title);
            i.putExtra("android.intent.extra.TEXT", text);
            Intent c = Intent.createChooser(i, title);
            c.addFlags(0x10000000);
            startActivity(c);
        } catch (Throwable t) {}
    }

    @SuppressWarnings({"rawtypes","unchecked"})
    static class BackCallback implements ValueCallback {
        final MainActivity a;
        BackCallback(MainActivity a) { this.a = a; }
        public void onReceiveValue(Object v) { if (!"true".equals(v)) a.superBack(); }
    }

    static class Client extends WebViewClient {
        final MainActivity a;
        Client(MainActivity a) { this.a = a; }
        @Override
        public boolean shouldOverrideUrlLoading(WebView v, String url) {
            if (url == null || url.startsWith("file:") || url.startsWith("javascript:")) return false;
            a.openExternal(url);
            return true;
        }
        @Override
        public void onPageFinished(WebView v, String u) { a.lastOv = -1; a.measureNav(); }
    }

    static class Chrome extends WebChromeClient {
        final MainActivity a;
        Chrome(MainActivity a) { this.a = a; }
        @Override
        public void onGeolocationPermissionsShowPrompt(String origin, GeolocationPermissions.Callback cb) { a.askLocation(origin, cb); }
        @Override
        public boolean onShowFileChooser(WebView w, ValueCallback<Uri[]> cb, WebChromeClient.FileChooserParams p) { return a.pickFile(cb, p); }
        @Override
        public void onPermissionRequest(android.webkit.PermissionRequest r) { a.askMic(r); }
    }
}
