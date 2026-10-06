package android.webkit; public class WebView extends android.widget.AbsoluteLayout { public WebView(android.content.Context c){}
 public WebSettings getSettings(){return null;} public void setWebViewClient(WebViewClient c){} public void setWebChromeClient(WebChromeClient c){}
 public void addJavascriptInterface(Object o,String n){} public void loadUrl(String u){} public void evaluateJavascript(String s,ValueCallback<String> cb){}
 public boolean canGoBack(){return false;} public void goBack(){} public static void setWebContentsDebuggingEnabled(boolean b){} }