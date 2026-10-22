/* ============ v3.87.0: a YouTube playlist as a course (item 114, both ways as he asked): links that open in YouTube with progress, or downloaded into a library folder ============ */
/* S.lib.ytc = [{id, n, src, mode:'link'|'dl', ri (library root index, dl only), items:[{u,t,d,done,at,dl,why}], at}] — synced with S.lib.
   «dl»: the helper writes each video (≤720p mp4) as «NNN - title.mp4» into <root>/<course name>/ (/ytjob?u=&r=&d=&n=), so it becomes an ordinary PC course. */
const YTC={run:null};
function ytcList(){const L_=LIBS();return L_.ytc||(L_.ytc=[])}
function ytcGet(id){return ytcList().find(c=>c.id===id)}
function ytcPc(){return!ANDROID&&!MAC}
function ytcDirName(n){return String(n||'').replace(/[\\/:*?"<>|\x00-\x1f]/g,'_').trim().replace(/^\.+/,'').replace(/[. ]+$/,'').slice(0,120).trim()}
function ytcNode(c){if(!LIB.tree||c.mode!=='dl')return null;const r=LIB.tree[c.ri];if(!r||!r.c)return null;const n=ytcDirName(c.n);return r.c.find(x=>x.k==='d'&&x.n===n)||null}
function ytcStat(c){const n=c.items.length,done=c.items.filter(x=>x.done).length,dl=c.items.filter(x=>x.dl).length,dur=c.items.reduce((s,x)=>s+(+x.d||0),0);let pd=done;
  if(c.mode==='dl'){const node=ytcNode(c);if(node){const P=LIBS().prog,m=libMedia(node);pd=m.filter(x=>P[x.id]&&P[x.id].done).length}}return{n,done:pd,dl,dur}}

/* new course: the link, a name, and the way */
function ytcNew(){if(!ytcPc()){toast(t('ytc.pcOnly'));return}const roots=(LIB.tree||[]).map((r,i)=>[i,r.n]);
  openInfo('📺 '+esc(t('ytc.newT')),`<div class="ytcf"><label>${esc(t('ytc.url'))}<input class="in" id="ytcU" dir="ltr" placeholder="https://www.youtube.com/playlist?list=…"></label>
    <label>${esc(t('ytc.name'))}<input class="in" id="ytcN" dir="auto" placeholder="${esc(t('ytc.nameAuto'))}"></label>
    <div class="ytcmodes" role="radiogroup"><label class="ytcmode"><input type="radio" name="ytcM" value="link" checked><span><b>🔗 ${esc(t('ytc.mLink'))}</b><small>${esc(t('ytc.mLinkS'))}</small></span></label>
    <label class="ytcmode${roots.length?'':' off'}"><input type="radio" name="ytcM" value="dl"${roots.length?'':' disabled'}><span><b>⬇ ${esc(t('ytc.mDl'))}</b><small>${esc(roots.length?t('ytc.mDlS'):t('ytc.mDlNo'))}</small></span></label></div>
    ${roots.length?`<label class="ytcroot" hidden>${esc(t('ytc.root'))}<select class="in" id="ytcR">${roots.map(([i,n])=>`<option value="${i}">${esc(n)}</option>`).join('')}</select></label>`:''}
    <div class="ytcst" id="ytcSt"></div><div class="row"><button class="btn pri" id="ytcGo">${esc(t('ytc.go'))}</button></div></div>`);
  const box=$('#infoBox');box.classList.add('ytcbox');box.querySelectorAll('[name=ytcM]').forEach(r=>r.onchange=()=>{const w=box.querySelector('.ytcroot');if(w)w.hidden=box.querySelector('[name=ytcM]:checked').value!=='dl'});
  $('#ytcGo').onclick=()=>ytcCreate()}
async function ytcCreate(){const u=($('#ytcU').value||'').trim(),st=$('#ytcSt'),say=h=>{if(st)st.innerHTML=h};
  if(!/^https:\/\/((www|m|music)\.)?(youtube\.com|youtu\.be)\//i.test(u)){say('⚠ '+esc(t('ytc.badUrl')));return}
  const mode=$('#infoBox [name=ytcM]:checked').value,ri=mode==='dl'?+($('#ytcR')||{}).value||0:undefined;
  say('⏳ '+esc(t('au.reading')));if(!await helperOk()){say('⚠ '+esc(t('rc.noHelper')));return}
  let j;try{const r=await fetch(HELPER+'/ytlist?u='+encodeURIComponent(u),{cache:'no-store'});
    if(r.status===428){say(`${esc(t('rc.setupQ'))} <button class="btn sm pri" id="ytcSetup">${esc(t('rc.setupGo'))}</button>`);$('#ytcSetup').onclick=()=>auSetup(()=>ytcCreate());return}
    if(!r.ok)throw 0;j=await r.json()}catch(e){say('⚠ '+esc(t('ytc.listFail')));return}
  const items=(j.items||[]).filter(x=>x&&x.u).map(x=>({u:x.u,t:x.t||'',d:Math.round(+x.d||0)}));if(!items.length){say('⚠ '+esc(t('ytc.listFail')));return}
  const name=(($('#ytcN').value||'').trim()||j.title||t('ytc.untitled')).slice(0,120),c={id:uid(),n:name,src:u,mode,items,at:Date.now()};if(mode==='dl')c.ri=ri;
  ytcList().unshift(c);save();try{renderLib()}catch(e){}ytcOpen(c.id);if(mode==='dl')ytcRun(c.id)}

/* the course window */
function ytcOpen(id){const c=ytcGet(id);if(!c)return;const s=ytcStat(c),nx=c.mode==='link'?c.items.find(x=>!x.done):null,node=ytcNode(c),running=YTC.run&&YTC.run.id===id,left=c.items.filter(x=>!x.dl).length;
  const row=(x,i)=>`<div class="ytcr${x.done?' done':''}${x.at&&!x.done?' seen':''}" data-i="${i}"><span class="ytcn">${i+1}</span><span class="ytct"><b dir="auto">${esc(x.t||x.u)}</b><small>${x.d?fmtTC(x.d):''}${c.mode==='dl'?' · '+(x.dl?'✓ '+esc(t('ytc.got')):running&&YTC.run.i===i?'⏳ '+(YTC.run.p?Math.floor(YTC.run.p)+'%':''):x.why?'⚠ '+esc(t('auj.w.'+x.why)):esc(t('ytc.wait'))):''}</small></span>`+
    (c.mode==='link'?`<button class="btn sm ghost" data-ya="play" aria-label="${esc(t('ytc.open'))}" title="${esc(t('ytc.open'))}">▶</button><button class="btn sm ${x.done?'pri':'ghost'}" data-ya="done" aria-pressed="${!!x.done}" aria-label="${esc(t('ytc.mark'))}" title="${esc(t('ytc.mark'))}">✓</button>`:'')+`</div>`;
  openInfo('📺 '+esc(c.n),`<div class="ytcw" data-ytc="${esc(id)}"><div class="ytchd"><span class="ytcmd">${c.mode==='link'?'🔗 '+esc(t('ytc.mLink')):'⬇ '+esc(t('ytc.mDl'))}</span><span>${esc(t('ytc.prog',s.done,s.n))}${s.dur?' · '+fmtHM(s.dur*1000):''}</span><button class="btn sm ghost" data-ya="menu" aria-label="⋯">⋯</button></div>
    <div class="ytcbar"><i style="width:${s.n?(s.done/s.n*100).toFixed(1):0}%"></i></div>
    <div class="ytcacts">${nx?`<button class="btn pri" data-ya="next">▶ ${esc(t('ytc.next'))}: <span dir="auto">${esc((nx.t||'').slice(0,60))}</span></button>`:''}
    ${c.mode==='dl'&&node?`<button class="btn pri" data-ya="lib">🎬 ${esc(t('ytc.openLib'))}</button>`:''}
    ${c.mode==='dl'&&left&&ytcPc()&&!running?`<button class="btn" data-ya="run">⬇ ${esc(t('ytc.cont',left))}</button>`:''}
    ${c.mode==='dl'&&running?`<button class="btn" data-ya="stop">${esc(t('cancel'))}</button>`:''}
    ${c.mode==='dl'&&!ytcPc()&&left?`<small class="muted">${esc(t('ytc.dlOnPc'))}</small>`:''}</div>
    <div class="ytcl">${c.items.map(row).join('')}</div></div>`);
  const box=$('#infoBox');box.classList.add('ytcbox');box.querySelector('.ytcw').onclick=e=>ytcAct(e,id)}
function ytcAct(e,id){const b=e.target.closest('[data-ya]');if(!b)return;const c=ytcGet(id);if(!c)return;const a=b.dataset.ya,r=b.closest('[data-i]'),x=r&&c.items[+r.dataset.i];
  if(a==='play'&&x){x.at=Date.now();save();openExt(x.u);ytcOpen(id)}
  else if(a==='done'&&x){x.done=!x.done;if(x.done)x.at=x.at||Date.now();save();ytcOpen(id);try{renderLib()}catch(e){}if(x.done&&c.items.every(y=>y.done))toast(t('ytc.finished',c.n))}
  else if(a==='next'){const n=c.items.find(y=>!y.done);if(n){n.at=Date.now();save();openExt(n.u);ytcOpen(id)}}
  else if(a==='lib'){const node=ytcNode(c);if(node){$('#infoModal').classList.remove('on');LIB.open=node.id;showView('lib');renderLib()}}
  else if(a==='run')ytcRun(id);
  else if(a==='stop'){if(YTC.run)YTC.run.stop=true}
  else if(a==='menu')ytcMenu(b,id)}
function ytcMenu(anchor,id){const c=ytcGet(id);if(!c)return;const p=lshMenu(anchor,`<button data-ym="ren">✏ ${esc(t('lsh.rename'))}</button>`+(ytcPc()?`<button data-ym="ref">↻ ${esc(t('ytc.refresh'))}</button>`:'')+
    (c.mode==='link'&&ytcPc()&&LIB.tree&&LIB.tree.length?`<button data-ym="todl">⬇ ${esc(t('ytc.toDl'))}</button>`:'')+(c.mode==='dl'?`<button data-ym="tolink">🔗 ${esc(t('ytc.toLink'))}</button>`:'')+`<button data-ym="del" class="dng">🗑 ${esc(t('ytc.del'))}</button>`);
  p.querySelectorAll('[data-ym]').forEach(b=>b.onclick=async()=>{closePP();const a=b.dataset.ym;
    if(a==='ren'){const v=prompt(t('lsh.rename'),c.n);if(v&&v.trim()){if(c.mode==='dl'&&c.items.some(x=>x.dl)){toast(t('ytc.renDl'))}else{c.n=v.trim().slice(0,120);save();ytcOpen(id);renderLib()}}}
    else if(a==='ref')ytcRefresh(id);
    else if(a==='todl'){c.mode='dl';c.ri=0;save();ytcOpen(id);ytcRun(id)}
    else if(a==='tolink'){c.mode='link';save();ytcOpen(id);renderLib()}
    else if(a==='del'){const L_=ytcList(),i=L_.indexOf(c);if(i<0)return;L_.splice(i,1);save();$('#infoModal').classList.remove('on');renderLib();toastAct(t('ytc.deleted'),t('undo'),()=>{ytcList().splice(i,0,c);save();renderLib()})}})}
async function ytcRefresh(id){const c=ytcGet(id);if(!c)return;toast(t('au.reading'));try{const r=await fetch(HELPER+'/ytlist?u='+encodeURIComponent(c.src),{cache:'no-store'});if(!r.ok)throw 0;const j=await r.json();
  const have=new Set(c.items.map(x=>x.u));let n=0;(j.items||[]).forEach(x=>{if(x&&x.u&&!have.has(x.u)){c.items.push({u:x.u,t:x.t||'',d:Math.round(+x.d||0)});n++}});save();toast(t('ytc.added',n));ytcOpen(id);if(n&&c.mode==='dl')ytcRun(id)}catch(e){toast(t('ytc.listFail'))}}

/* downloading into the library, one video at a time (three tries, the same reasons as list downloads) */
async function ytcOneDl(c,i,x){let r;try{r=await fetch(HELPER+'/ytjob?u='+encodeURIComponent(x.u)+'&r='+c.ri+'&d='+encodeURIComponent(c.n)+'&n='+(i+1),{cache:'no-store'})}catch(e){return{why:'helper'}}
  if(r.status===404)return{why:'old'};if(r.status===428)return{why:'setup'};if(r.status===429)return{why:'busy'};if(!r.ok)return{why:'other'};const jid=(await r.json()).id;
  for(;;){if(YTC.run&&YTC.run.stop){fetch(HELPER+'/ytjob/cancel?id='+jid,{cache:'no-store'}).catch(()=>{});return{why:'stop'}}await sleepMs(1500);let st;
    try{st=await (await fetch(HELPER+'/ytjob/state?id='+jid,{cache:'no-store'})).json()}catch(e){if(!await helperWait(60000))return{why:'helper'};continue}
    if(st.s==='run'){YTC.run.p=st.p||0;ytcPaint();continue}
    fetch(HELPER+'/ytjob/cancel?id='+jid,{cache:'no-store'}).catch(()=>{});
    if(st.s==='ok')return{ok:1};if(st.s==='none')return{why:'helper'};return{why:st.why||'other'}}}
async function ytcRun(id){const c=ytcGet(id);if(!c||c.mode!=='dl'||!ytcPc())return;if(YTC.run){toast(t('auj.busy'));return}if(!await helperOk()){toast(t('rc.noHelper'));return}
  YTC.run={id,i:0,p:0,stop:false};let got=0,halt='';ytcPaint();
  try{for(let i=0;i<c.items.length;i++){const x=c.items[i];if(x.dl)continue;if(YTC.run.stop)break;YTC.run.i=i;YTC.run.p=0;ytcPaint();let res={why:'other'};
      for(let tr=0;tr<3;tr++){res=await ytcOneDl(c,i,x).catch(()=>({why:'helper'}));if(res.ok||['stop','setup','bot','old','helper'].includes(res.why)||AUJ_NOFIX.includes(res.why))break;await sleepMs(tr?15000:4000)}
      if(res.why==='stop')break;if(res.ok){x.dl=1;delete x.why;got++}else{x.why=res.why}save();
      if(['setup','bot','old','helper'].includes(res.why)){halt=res.why;break}}}
  finally{YTC.run=null;ytcPaint()}
  if(halt==='old')toast(t('ytc.oldHelper'));else if(halt==='setup')auSetup(()=>ytcRun(id));else if(halt)toast(t('auj.w.'+halt));
  else if(got)toast(t('ytc.dlDone',c.n,got));try{await libLoad(true)}catch(e){}try{renderLib()}catch(e){}if($('#infoBox.ytcbox [data-ytc="'+id+'"]'))ytcOpen(id)}
function ytcPaint(){let el=$('#ytcPill');const R=YTC.run;if(!R){if(el)el.remove();return}const c=ytcGet(R.id);if(!c)return;
  if(!el){document.body.insertAdjacentHTML('beforeend','<div class="aujpill ytcpill" id="ytcPill" role="status"><span class="ajtx"></span><i><b></b></i><button class="btn sm ghost" data-yp="open"></button><button class="btn sm ghost" data-yp="stop"></button></div>');el=$('#ytcPill');
    el.onclick=e=>{const b=e.target.closest('[data-yp]');if(!b||!YTC.run)return;if(b.dataset.yp==='stop')YTC.run.stop=true;else ytcOpen(YTC.run.id)}}
  const n=c.items.length,dn=c.items.filter(x=>x.dl).length,pc=(dn+(R.p||0)/100)/n*100;el.querySelector('.ajtx').textContent=`⬇ ${c.n} · ${Math.min(n,dn+1)}/${n}${R.p?' · '+Math.floor(R.p)+'%':''}`;el.querySelector('b').style.width=pc.toFixed(1)+'%';
  el.querySelector('[data-yp=open]').textContent=t('auj.info');el.querySelector('[data-yp=stop]').textContent=t('cancel');
  const w=$('#infoBox.ytcbox [data-ytc="'+R.id+'"]');if(w&&!w._p){w._p=1;setTimeout(()=>{w._p=0;if($('#infoBox.ytcbox [data-ytc="'+R.id+'"]'))ytcOpen(R.id)},2000)}}

/* the library home: a «YouTube courses» row */
{hookFn('renderLib',()=>renderLib,f=>{renderLib=f},'post',function(){try{if(LIB.open)return;const box=$('#libBox');if(!box)return;const L_=ytcList();let h=$('#ytcBox');
  if(!L_.length&&!ytcPc()){if(h)h.remove();return}
  if(!h){h=document.createElement('section');h.id='ytcBox';h.className='ytchome';const a=$('#lxrImpBox')||$('#lpath');if(a&&a.parentElement===box)a.after(h);else box.prepend(h);
    h.addEventListener('click',e=>{const b=e.target.closest('[data-ytco]');if(b){ytcOpen(b.dataset.ytco);return}if(e.target.closest('#ytcAdd'))ytcNew()})}
  h.innerHTML=`<div class="ytch"><h3>📺 ${esc(t('ytc.t'))}${L_.length?` <small>(${L_.length})</small>`:''}</h3>${ytcPc()?`<button class="btn sm" id="ytcAdd">＋ ${esc(t('ytc.add'))}</button>`:''}</div>`+
    (L_.length?`<div class="ytcg">${L_.map(c=>{const s=ytcStat(c),pc=s.n?Math.round(s.done/s.n*100):0;return`<button class="ytcc" data-ytco="${esc(c.id)}"><b dir="auto">${esc(c.n)}</b><small>${c.mode==='link'?'🔗':'⬇'} ${esc(t('ytc.prog',s.done,s.n))}${c.mode==='dl'&&s.dl<s.n?' · 📥 '+s.dl+'/'+s.n:''}</small><i class="ytcbar"><i style="width:${pc}%"></i></i></button>`}).join('')}</div>`:`<p class="muted lshhint">${esc(t('ytc.none'))}</p>`)}catch(e){console.error(e)}})}
{hookFn('openInfo',()=>openInfo,f=>{openInfo=f},'pre',function(){try{const b=$('#infoBox');if(b)b.classList.remove('ytcbox')}catch(e){}})}
