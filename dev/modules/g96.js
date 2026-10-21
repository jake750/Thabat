/* ============ v3.81.0: playlist downloads finish (fix 4): a job that does not depend on the dialog, retries, a reason for each failure, resume after a reload ============ */
/* Before: the loop wrote into the dialog, so any other window opening there stopped it silently; SoundCloud tracks after the fifth were refused
   by the helper (api-v2 addresses); the helper answered nothing else during a download. Now each item is a helper background job (/ytjob),
   polled every second, retried, and the job is kept in localStorage['thabat.auJob'] until it ends. */
const AUJ={job:null},AUJ_NOFIX=['private','members','age','geo','gone'];
function aujSave(){try{const j=AUJ.job;if(!j||j.done){localStorage.removeItem('thabat.auJob');return}
  localStorage.setItem('thabat.auJob',JSON.stringify({u:j.u,title:j.title,mk:j.mk,items:j.items.map(x=>({u:x.u,t:x.t,d:x.d,st:x.st,why:x.why,id:x.id}))}))}catch(e){}}
function aujMeta(h){try{return h?JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(h),c=>c.charCodeAt(0)))):{}}catch(e){return{}}}
/* one item: a background job on the helper; an older helper (404) falls back to the old /yt */
async function aujOne(x,onp){let r;try{r=await fetch(HELPER+'/ytjob?u='+encodeURIComponent(x.u),{cache:'no-store'})}catch(e){return{why:'helper'}}
  if(r.status===404){try{const o=await auOne(x.u,x);return o.id?{id:o.id}:{why:o.setup?'setup':'other'}}catch(e){return{why:'helper'}}}
  if(r.status===428)return{why:'setup'};if(r.status===429)return{why:'busy'};if(!r.ok)return{why:'other'};
  const id=(await r.json()).id;
  for(;;){if(AUJ.job&&AUJ.job.stop){fetch(HELPER+'/ytjob/cancel?id='+id,{cache:'no-store'}).catch(()=>{});return{why:'stop'}}
    await sleepMs(1000);let st;
    try{st=await (await fetch(HELPER+'/ytjob/state?id='+id,{cache:'no-store'})).json()}catch(e){if(!await helperWait(60000))return{why:'helper'};continue}
    if(st.s==='run'){onp(st.p||0);continue}
    if(st.s==='none')return{why:'helper'};
    if(st.s==='err')return{why:st.why||'other',msg:st.msg||''};
    if(st.s==='ok'){let g;try{g=await fetch(HELPER+'/ytjob/get?id='+id,{cache:'no-store'})}catch(e){return{why:'helper'}}if(!g.ok)return{why:'other'};
      const m=aujMeta(g.headers.get('X-Meta')),blob=await g.blob();
      const rid=await rcSave(blob,{title:m.title||x.t||x.u,reciter:m.uploader||'',dur:Math.round(+m.duration||x.d||0)||undefined,url:x.u,src:/soundcloud/i.test(x.u)?'SoundCloud':'YouTube',ext:m.ext});return{id:rid}}}}
/* the run: three tries per item; after three failures in a row yt-dlp is updated once and the failed items are tried again */
async function aujRun(){const j=AUJ.job;if(!j||j.running)return;j.running=true;j.halt='';j.stop=false;let fails=0,updated=false;aujPaint();
  try{for(let k=0;k<j.items.length;k++){const x=j.items[k];if(x.st!=='wait')continue;if(j.stop)break;j.i=k;j.p=0;aujPaint();
      let res={why:'other'};for(let tr=0;tr<3;tr++){res=await aujOne(x,p=>{j.p=p;aujPaint()}).catch(()=>({why:'helper'}));
        if(res.id||['stop','setup','bot'].includes(res.why)||AUJ_NOFIX.includes(res.why))break;
        if(res.why==='helper'&&!await helperWait(60000))break;
        j.retry=tr+1;aujPaint();await sleepMs(tr?15000:4000);j.retry=0}
      if(res.why==='stop')break;
      if(res.id){x.st='ok';x.id=res.id;fails=0}else{x.st='fail';x.why=res.why;x.msg=res.msg||'';fails++}
      aujSave();
      if(res.why==='setup'||res.why==='bot'||res.why==='helper'){j.halt=res.why;break}
      if(fails>=3&&!updated){updated=true;j.upd=1;aujPaint();try{await fetch(HELPER+'/ytsetup?update=1',{cache:'no-store'})}catch(e){}j.upd=0;
        j.items.forEach(y=>{if(y.st==='fail'&&!AUJ_NOFIX.includes(y.why)){y.st='wait';y.why=''}});fails=0;k=-1}}}
  finally{j.running=false}aujFinish()}
/* the playlist keeps the list's order; downloading the same list again adds to it */
function aujFinish(){const j=AUJ.job;if(!j)return;const ids=j.items.filter(x=>x.st==='ok'&&x.id).map(x=>x.id);
  if(j.mk&&ids.length){const A=AUD();let p=A.pl.find(q=>q.n===j.title&&q.src===j.u);if(!p){p={id:uid(),n:j.title,items:[],src:j.u};A.pl.push(p)}ids.forEach(i=>{if(!p.items.includes(i))p.items.push(i)});j.pid=p.id;save()}
  const left=j.items.filter(x=>x.st==='wait').length;j.done=!left||j.stop;if(j.stop)j.items.forEach(x=>{if(x.st==='wait')x.st='skip'});aujSave();aujPaint();try{renderLib()}catch(e){}}
function aujStart(u,title,items,mk){if(AUJ.job&&AUJ.job.running){toast(t('auj.busy'));return}
  AUJ.job={u,title,mk,items:items.map(x=>({u:x.u,t:x.t||'',d:x.d||0,st:'wait'})),i:0,p:0};aujSave();aujRun()}
function aujCounts(j){const c={ok:0,fail:0,wait:0,skip:0};j.items.forEach(x=>c[x.st]=(c[x.st]||0)+1);return c}
/* the floating pill (and the dialog's bar, when that dialog is still open) */
function aujPaint(){const j=AUJ.job;let el=$('#aujPill');if(!j){if(el)el.remove();return}const c=aujCounts(j),n=j.items.length,cur=j.items[j.i]||{};
  if(!el){document.body.insertAdjacentHTML('beforeend','<div class="aujpill" id="aujPill" role="status"></div>');el=$('#aujPill');el.addEventListener('click',aujClick)}
  let tx,btns,pc;
  if(j.running){pc=((c.ok+c.fail)+(j.p||0)/100)/n*100;tx=`⤓ ${esc(j.title)} · ${c.ok+c.fail+1}/${n}`+(j.upd?` · ${esc(t('auj.upd'))}`:j.retry?` · ${esc(t('auj.retry',j.retry))}`:j.p?` · ${Math.floor(j.p)}%`:'');btns=`<button class="btn sm ghost" data-aj="stop">${esc(t('cancel'))}</button>`}
  else{pc=100;tx=(j.halt?'⚠ ':c.wait?'⏸ ':'✓ ')+esc(t('auj.done',c.ok,n))+(c.fail?` · ⚠ ${c.fail}`:'')+(j.halt?` · ${esc(t('auj.w.'+j.halt))}`:'');
    btns=(c.wait?`<button class="btn sm pri" data-aj="go">${esc(t('auj.cont',c.wait))}</button>`:'')+(c.fail||j.halt?`<button class="btn sm ghost" data-aj="info">${esc(t('auj.info'))}</button>`:'')+(j.pid?`<button class="btn sm ghost" data-aj="open">${esc(t('auj.open'))}</button>`:'')+`<button class="btn sm ghost" data-aj="x" aria-label="✕">✕</button>`}
  el.innerHTML=`<span class="ajtx" title="${esc(cur.t||'')}">${tx}</span><i><b style="width:${pc.toFixed(1)}%"></b></i>${btns}`;
  const pb=$('#auPB'),pt=$('#auPT');if(pb&&pt&&$('#infoBox .auli')){pb.style.width=pc.toFixed(1)+'%';pt.textContent=j.running?t('au.prog',c.ok+c.fail+1,n,cur.t||''):t('auj.done',c.ok,n)}}
function aujClick(e){const b=e.target.closest('[data-aj]');if(!b)return;const a=b.dataset.aj,j=AUJ.job;if(!j)return;
  if(a==='stop'){j.stop=true;aujPaint()}
  else if(a==='go'){if(j.halt==='setup')auSetup(()=>aujRun());else aujRun()}
  else if(a==='info')aujInfo();
  else if(a==='open'){LIB.open='au:p:'+j.pid;showView('lib');renderLib()}
  else if(a==='x'){if(!j.running){AUJ.job=null;try{localStorage.removeItem('thabat.auJob')}catch(x){}aujPaint()}}}
function aujInfo(){const j=AUJ.job;if(!j)return;const f=j.items.filter(x=>x.st==='fail'||x.st==='wait');
  openInfo('🎶 '+esc(j.title),`${j.halt?`<p>⚠ ${esc(t('auj.w.'+j.halt))}</p>`:''}<div class="ajlist">${f.map(x=>`<div class="ajrow"><span dir="auto">${esc(x.t||x.u)}</span><small>${esc(x.st==='wait'?t('auj.left'):t('auj.w.'+(x.why||'other')))}</small></div>`).join('')}</div>`)}
/* the dialog's «download» button starts the job; the dialog may be closed at once, the pill carries on */
{hookFn('auListDialog',()=>auListDialog,f=>{auListDialog=f},'post',function(u,jl){try{const items=(jl&&jl.items)||[],title=(jl&&jl.title)||t('au.newP'),go=$('#auLGo');if(!go)return;
  go.onclick=()=>{const s=$$('#infoBox [data-li]').filter(x=>x.checked).map(x=>items[+x.dataset.li]);if(!s.length)return;const mk=$('#auLMk')?$('#auLMk').checked:true;
    go.disabled=true;$$('#infoBox input').forEach(x=>x.disabled=true);const pr=$('#auProg');if(pr)pr.hidden=false;
    const x=$('#infoX');if(x){x.textContent=t('auj.hide');x.onclick=()=>$('#infoModal').classList.remove('on')}
    aujStart(u,title,s,mk);const ui=$('#auUrl');if(ui)ui.value=''}}catch(e){console.error(e)}})}
/* after a reload: offer to continue an unfinished list (PC only) */
setTimeout(()=>{try{if(ANDROID||MAC||AUJ.job)return;const o=JSON.parse(localStorage.getItem('thabat.auJob')||'null');if(!o||!o.items)return;
  const left=o.items.filter(x=>x.st==='wait').length;if(!left){localStorage.removeItem('thabat.auJob');return}
  AUJ.job=Object.assign(o,{i:0,p:0,halt:'',running:false});aujPaint()}catch(e){}},6000);
