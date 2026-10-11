/* ============ v3.12.9: updates straight from the GitHub releases — Windows updates itself through the helper, the phone and the Mac download the new file ============ */
const UPD_GH='https://api.github.com/repos/jake750/Thabat/releases/latest';
async function updLatest(){const c=new AbortController(),tm=setTimeout(()=>c.abort(),15000);
  try{const r=await fetch(UPD_GH,{cache:'no-store',signal:c.signal});if(!r.ok)throw new Error('HTTP '+r.status);const j=await r.json(),a=n=>{const x=(j.assets||[]).find(y=>y.name===n);return x&&x.browser_download_url};
    return{ver:String(j.tag_name||'').replace(/^v/,''),apk:a('Thabat.apk'),win:a('Thabat-Windows.zip'),mac:a('Thabat-Mac.zip'),page:j.html_url||'https://github.com/jake750/Thabat/releases/latest'}}finally{clearTimeout(tm)}}
/* Windows: the helper downloads the release zip and replaces the program files; an older helper without /selfupdate gets the zip link instead */
async function updApply(L){
  if(ANDROID){if(L.apk)openExt(L.apk);else openExt(L.page);return}
  if(MAC){openExt(L.mac||L.page);return}
  if(!(await helperOk())){openExt(L.win||L.page);return}
  toast(t('upd.ing'));
  try{const c=new AbortController(),tm=setTimeout(()=>c.abort(),300000);const r=await fetch(HELPER+'/selfupdate',{cache:'no-store',signal:c.signal});clearTimeout(tm);
    if(r.status===404){openExt(L.win||L.page);return}
    const j=await r.json();if(!j.ok)throw new Error('update');
    try{flushSave()}catch(e){}toast(t('upd.done',j.ver||L.ver));setTimeout(()=>location.reload(),1800)}
  catch(e){toastAct(t('upd.failWin'),t('upd.get'),()=>openExt(L.win||L.page),20000)}}
{const _uc=updCheck;updCheck=async function(force){
  if((S.settings.updUrl||'').trim())return _uc(force);           // a custom address keeps the old behaviour
  if(ANDROID&&THABAT_PLAY)return;                                   // the Play build is updated by the store
  if(!force&&S.updAt&&Date.now()-S.updAt<864e5)return;S.updAt=Date.now();save();
  try{const L=await updLatest();if(L.ver&&verGt(L.ver,APP_VER))toastAct(t('upd.new',L.ver),ANDROID||MAC?t('upd.get'):t('upd.now'),()=>updApply(L),30000);else if(force)toast(t('upd.latest',APP_VER))}
  catch(e){if(force)toast(t('upd.fail'))}}}

