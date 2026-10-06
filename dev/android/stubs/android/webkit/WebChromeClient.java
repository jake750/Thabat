package android.webkit; public class WebChromeClient { public void onGeolocationPermissionsShowPrompt(String o,GeolocationPermissions.Callback cb){}
 public boolean onShowFileChooser(WebView w,ValueCallback<android.net.Uri[]> cb,FileChooserParams p){return false;}
 public void onPermissionRequest(PermissionRequest r){}
 public static abstract class FileChooserParams { public abstract android.content.Intent createIntent(); public abstract int getMode(); public static android.net.Uri[] parseResult(int r,android.content.Intent d){return null;} } }