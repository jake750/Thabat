/* ============ v3.37: lighter file (root data on demand, dead code out), the lesson «⋯» menu back, open time in data health ============ */
/* the root index lives in Thabat-Roots.js beside the page (also in the APK); if it is missing (an older Windows update), it comes from the release on GitHub */
let QRL=null;
function qRootLoad(){if(window.QROOT_GZ)return Promise.resolve(window.QROOT_GZ);if(QRL)return QRL;
  const one=src=>new Promise((res,rej)=>{const s=document.createElement('script');s.src=src;s.onload=()=>window.QROOT_GZ?res(window.QROOT_GZ):rej(new Error('empty'));s.onerror=()=>{s.remove();rej(new Error('load'))};document.head.appendChild(s)});
  QRL=one('Thabat-Roots.js').catch(()=>one('https://cdn.jsdelivr.net/gh/jake750/Thabat@main/dev/data/Thabat-Roots.js')).catch(e=>{QRL=null;throw e});return QRL}

/* 3.29.0 replaced the lesson «⋯» with the folder chooser, so rename, watch later, «a task for this lesson» and «remove from this folder» were lost; they are back,
   and «add to a folder…» opens the chooser */
const LIM_PICK=lshItemMenu;
lshItemMenu=function(anchor,ref,inFolder){if(!ref||ref.t!=='m'||!anchor)return LIM_PICK(anchor,ref,inFolder);
  const fid=inFolder||(LIB.open&&String(LIB.open).startsWith('f:')?String(LIB.open).slice(2):null),later=lpvLaterHas(ref.id);
  LRN.next=ref;
  const p=lshMenu(anchor,`<button data-lim="add">📁 ${t('lsh.addTo')}…</button><button data-lim="later">${later?'✓ '+t('lpv.inLater'):'🕒 '+t('lpv.later')}</button><button data-lim="task">☑ ${t('lnk.taskFor')}</button>${fid?`<button data-lim="rm">✕ ${t('lsh.remove')}</button>`:''}`);
  LRN.next=null;if(!p)return p;
  p.querySelectorAll('[data-lim]').forEach(b=>b.onclick=()=>{closePP();const a=b.dataset.lim;
    if(a==='add')LIM_PICK(anchor,ref,null);
    else if(a==='later'){const f=libItem(ref.id);lpvLaterToggle(ref.id,f?libTitle(f.n):'',f?f.course.n:'');renderLib()}
    else if(a==='task'){const n=libFind(ref.id);day(todayKey()).tasks.push({id:uid(),text:'🎬 '+(lrnName(ref.id)||(n?libTitle(n.n):'')),done:false,created:Date.now(),lib:ref.id});save();renderTasks();toast(t('lnk.taskAdded'))}
    else if(a==='rm')lshRemove(fid,[ref])});
  return p};

/* data health: how long the app took to open on this device */
{hookFn('openHealth',()=>openHealth,f=>{openHealth=f},'post',function(){let n=0;const go=()=>{const b=$('#infoBox .v2st');if(b){if(!$('#infoBox .opnt')){const T=window.__TH_T||{};b.insertAdjacentHTML('afterend',`<div class="v2st opnt">⏱ ${t('opn.t',(()=>{try{return Math.round(performance.getEntriesByType('navigation')[0].domContentLoadedEventEnd)||'—'}catch(e){return'—'}})(),T.b?Math.round(T.b-T.a):'—')}</div>`)}return}if(++n<40)setTimeout(go,100)};go()})}
