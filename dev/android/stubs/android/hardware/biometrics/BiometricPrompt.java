package android.hardware.biometrics; public class BiometricPrompt {
 public void authenticate(android.os.CancellationSignal c, java.util.concurrent.Executor e, AuthenticationCallback cb){}
 public static class Builder { public Builder(android.content.Context c){} public Builder setTitle(CharSequence t){return this;} public Builder setSubtitle(CharSequence t){return this;} public Builder setDeviceCredentialAllowed(boolean b){return this;} public BiometricPrompt build(){return null;} }
 public static class AuthenticationResult {}
 public abstract static class AuthenticationCallback { public void onAuthenticationError(int code, CharSequence s){} public void onAuthenticationSucceeded(AuthenticationResult r){} public void onAuthenticationFailed(){} } }