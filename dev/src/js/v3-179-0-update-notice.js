/* ============ v3.179.0 the update notice (his request 2026-11-20 «يقولّي ان في تحديث و اقدر احمله من التطبيق مباشرة») ============ */
/* The GitHub release is checked every time the app opens (12 s after start, at most once an hour: GitHub allows 60 checks an hour).
   A newer version is remembered in S.updNew {ver,apk,win,mac,page}: the notice still pops up on every check that finds it, and after
   it is gone a row stays in Settings («تحديث جاهز») with the same button, and a small dot sits on the Settings button.
   Both disappear once the app runs that version or newer. A custom address (S.settings.updUrl) and the Play build keep the old behaviour. */
function updHave(){const n=S.updNew;return n&&n.ver&&verGt(n.ver,APP_VER)?n:null}
function updPaint(){const n=updHave();if(!n&&S.updNew){S.updNew=null;save()}
  document.querySelectorAll('.navbtn[data-v=set]').forEach(b=>{let d=b.querySelector('.upd9dot');if(n&&!d){d=document.createElement('i');d.className='upd9dot';d.setAttribute('aria-hidden','true');b.append(d)}else if(!n&&d)d.remove()});
  const f=$('#updNow')&&$('#updNow').closest('.field');if(!f)return;let r=$('#upd9Row');
  if(!n){if(r)r.remove();return}
  if(!r){r=document.createElement('div');r.className='field upd9row';r.id='upd9Row';f.after(r)}
  const lbl=t(ANDROID||MAC?'upd.get':'upd.now');
  r.innerHTML=`<div><label>${esc(t('upd.avail',n.ver))}</label><small>${esc(t('upd.availSub'))}</small></div><div class="inline"><button class="btn sm pri" id="upd9Btn">${uicSvg('download','')}<span>${esc(lbl)}</span></button></div>`;
  $('#upd9Btn').onclick=()=>{const L=updHave();if(L)updApply(L)}}
{const _uc=updCheck;updCheck=async function(force){
  if((S.settings.updUrl||'').trim()||ANDROID&&THABAT_PLAY)return _uc(force);
  if(!force&&S.updAt&&Date.now()-S.updAt<36e5){updPaint();return}
  S.updAt=Date.now();save();
  try{const L=await updLatest();
    if(L.ver&&verGt(L.ver,APP_VER)){S.updNew=L;save();updPaint();toastAct(t('upd.new',L.ver),ANDROID||MAC?t('upd.get'):t('upd.now'),()=>updApply(L),30000)}
    else{if(S.updNew){S.updNew=null;save()}updPaint();if(force)toast(t('upd.latest',APP_VER))}}
  catch(e){updPaint();if(force)toast(t('upd.fail'))}}}
{hookFn('renderSettings',()=>renderSettings,f=>{renderSettings=f},'post',function(){try{updPaint()}catch(e){}})}
setTimeout(()=>{try{updPaint()}catch(e){}},1500);
