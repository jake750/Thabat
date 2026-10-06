set -e
cd /tmp/aab && rm -rf play && mkdir play && cp -r /tmp/apkt/apk play/apk
python3 - <<'P'
p='/tmp/aab/play/apk/assets/www/Thabat.html'
s=open(p,encoding='utf-8').read();assert s.count('const THABAT_PLAY=false;')==1
open(p,'w',encoding='utf-8').write(s.replace('const THABAT_PLAY=false;','const THABAT_PLAY=true;'))
P
java -jar /tmp/apkt/package/lib/apktool.jar b play/apk -o play/unsigned.apk 2>&1 | grep -v JAVA_TOOL | tail -1
./prebuilt/linux/aapt2_64 convert --output-format proto -o play/proto.apk play/unsigned.apk
cd play && rm -rf mod && mkdir mod && cd mod && unzip -q ../proto.apk && mkdir -p manifest dex root && mv AndroidManifest.xml manifest/ && mv classes*.dex dex/
for f in *; do case "$f" in manifest|dex|res|assets|lib|root|resources.pb) ;; *) mv "$f" root/ ;; esac; done
rm -rf root/META-INF; zip -q -r ../base.zip . ; cd ..
java -jar ../bundletool.jar build-bundle --modules=base.zip --output=thabat.aab --overwrite 2>&1 | grep -v JAVA_TOOL | tail -2 || true
jarsigner -keystore /tmp/apkt/thabat.keystore -storepass:env THABAT_KS_PASS -keypass:env THABAT_KS_PASS -sigalg SHA256withRSA -digestalg SHA-256 thabat.aab thabat 2>&1 | grep -iv "warning\|self-signed\|re-run\|JAVA_TOOL" || true
cp thabat.aab /home/claude/app/Thabat-Play.aab
