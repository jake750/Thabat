/* ============ v3.48 Android: download the new version and install it from inside the app (shell 35: ApkUpd + ApkProvider) ============ */
const APKU={on:false};
function apkuBox(html){let b=$('#apkuBox');if(!b){document.body.insertAdjacentHTML('beforeend','<div class="apkubox" id="apkuBox" role="status"></div>');b=$('#apkuBox')}b.innerHTML=html;b.hidden=false;return b}
function apkuHide(){const b=$('#apkuBox');if(b)b.hidden=true;APKU.on=false}
window.thabatApk=function(kind,val){try{
  if(kind==='p'){apkuBox(`<b>⬇ ${t('apku.dl')}</b><div class="apkubar"><i style="width:${+val||0}%"></i></div><small>${+val||0}%</small>`);return}
  if(kind==='ready'){apkuBox(`<b>✓ ${t('apku.ready')}</b><small>${t('apku.readySub')}</small>`);return}
  if(kind==='perm'){apkuBox(`<b>🔐 ${t('apku.perm')}</b><small>${t('apku.permSub')}</small><div class="apkuact"><button class="btn sm pri" id="apkuGo">${t('apku.again')}</button><button class="btn sm ghost" id="apkuX">${t('lt.cancel')}</button></div>`);$('#apkuGo').onclick=()=>{try{window.ThabatAndroid.apkInstall()}catch(e){}};$('#apkuX').onclick=apkuHide;APKU.perm=1;return}
  if(kind==='opened'){apkuBox(`<b>📦 ${t('apku.opened')}</b><small>${t('apku.openedSub')}</small><div class="apkuact"><button class="btn sm ghost" id="apkuGo">${t('apku.again')}</button><button class="btn sm ghost" id="apkuX">${t('ok')}</button></div>`);$('#apkuGo').onclick=()=>{try{window.ThabatAndroid.apkInstall()}catch(e){}};$('#apkuX').onclick=apkuHide;APKU.perm=0;return}
  if(kind==='err'){APKU.on=false;apkuBox(`<b>⚠ ${t('apku.err')}</b><small>${t('apku.err.'+val)}</small><div class="apkuact"><button class="btn sm ghost" id="apkuLink">${t('apku.link')}</button><button class="btn sm ghost" id="apkuX">${t('ok')}</button></div>`);$('#apkuLink').onclick=()=>{apkuHide();openExt('https://github.com/jake750/Thabat/releases/latest/download/Thabat.apk')};$('#apkuX').onclick=apkuHide}}catch(e){console.error(e)}};
/* back from the «install unknown apps» setting: try the installer again */
{const _r=window.thabatResume;window.thabatResume=function(...a){try{if(APKU.perm&&andV()>=5){APKU.perm=0;setTimeout(()=>{try{window.ThabatAndroid.apkInstall()}catch(e){}},400)}}catch(e){}return _r?_r.apply(this,a):undefined}}
{const _ua=updApply;updApply=async function(L,...a){if(ANDROID&&andV()>=5&&L&&L.apk){if(APKU.on)return;APKU.on=true;try{flushSave()}catch(e){}apkuBox(`<b>⬇ ${t('apku.dl')}</b><div class="apkubar"><i style="width:0%"></i></div><small>0%</small>`);try{window.ThabatAndroid.apkUpdate(L.apk)}catch(e){APKU.on=false;return _ua(L,...a)}return}return _ua(L,...a)}}

