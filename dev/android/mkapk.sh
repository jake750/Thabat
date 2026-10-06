set -e
cd /tmp/apkt
bash proj/build.sh >/dev/null
cp proj/dex/classes.dex apk/classes.dex
rm -rf apk/assets/www && mkdir -p apk/assets/www
cp /home/claude/app/Thabat/Thabat.html /home/claude/app/Thabat/LICENSE.txt apk/assets/www/
cp -r /home/claude/app/Thabat/mushaf apk/assets/www/
cp -r /home/claude/app/Thabat/tafsir apk/assets/www/
rm -f thabat-unsigned.apk thabat-aligned.apk thabat.apk
java -jar package/lib/apktool.jar b apk -o thabat-unsigned.apk 2>&1 | grep -v JAVA_TOOL | tail -1
python3 zipalign.py thabat-unsigned.apk thabat-aligned.apk
java -jar package/lib/apksigner.jar sign --ks thabat.keystore --ks-pass env:THABAT_KS_PASS --key-pass env:THABAT_KS_PASS --ks-key-alias thabat --min-sdk-version 26 --out thabat.apk thabat-aligned.apk 2>&1 | grep -v JAVA_TOOL || true
java -jar package/lib/apksigner.jar verify thabat.apk 2>&1 | grep -v JAVA_TOOL && echo VERIFIED
mkdir -p /home/claude/app/android && cp thabat.apk /home/claude/app/Thabat.apk && cp thabat.keystore /home/claude/app/android/thabat-signing.keystore
ls -la /home/claude/app/Thabat.apk
