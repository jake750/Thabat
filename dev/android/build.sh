set -e
cd "$(dirname "$0")"
rm -rf cls dex && mkdir -p cls dex
javac --release 8 -nowarn -cp stubcls -d cls $(find src -name '*.java') 2>&1 | grep -v "^Picked\|^Note" || true
(cd cls && jar cf ../app.jar .)
java -XX:+UnlockDiagnosticVMOptions -XX:-BytecodeVerificationRemote -XX:-BytecodeVerificationLocal -cp /tmp/apkt/d8-fixed.jar com.android.tools.r8.D8 --release --min-api 26 --lib stubs.jar --output dex app.jar 2>&1 | grep -v JAVA_TOOL || true
ls -la dex
