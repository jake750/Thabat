/* ============ v3.80.0: PC recordings play on the phone (fix 2) and recordings / library lessons can be kept on or removed from this device (fix 3) ============ */
/* The PC app copies each recording's sound (IndexedDB aud:<id>) to the library server's audio\ folder (/aud/put: this PC + key);
   a device without the sound streams it from /aud (token). Lessons kept on a device: bytes in IndexedDB lkeep:<id>,
   what is kept in localStorage['thabat.lkeep'] = {id:{n,s,at,k}} (this device only, never synced). */
const AUDSY={busy:false,at:0},AUDR={ids:null,at:0},DK={job:null,keys:null,kat:0};
const AUD_EXT=['mp3','m4a','aac','ogg','opus','wav','webm','flac'];
function audExtOf(r,b){let e=String((r&&r.ext)||'').toLowerCase();if(e==='mp4')e='m4a';if(AUD_EXT.includes(e))return e;const ty=(b&&b.type)||'';return/mp4|m4a/.test(ty)?'m4a':/webm/.test(ty)?'webm':/ogg|opus/.test(ty)?'opus':/wav/.test(ty)?'wav':/flac/.test(ty)?'flac':'mp3'}
/* ---- PC: copy recordings to the library server, drop copies of recordings that were deleted ---- */
function audSyOk(){return!ANDROID&&!MAC&&!!LIBS().token&&!S._slim&&!S._demo}
async function audSync(){if(AUDSY.busy||!audSyOk())return;AUDSY.busy=true;try{
  const tk=encodeURIComponent(LIBS().token),r=await libFetch(LIB_LOCAL+'/aud/list?t='+tk,2500).catch(()=>null);if(!r||!r.ok)return;
  const have=(await r.json()).ids||{},recs=RCL(),ids=new Set(recs.map(x=>x.id));let n=0;
  for(const rc of recs){const b=await idbGet('aud:'+rc.id).catch(()=>null);if(!b||!b.size||have[rc.id]===b.size)continue;
    try{const p=await libFetch(`${LIB_LOCAL}/aud/put?t=${tk}&id=${encodeURIComponent(rc.id)}&e=${audExtOf(rc,b)}`,600000,{method:'POST',body:b});if(p.ok)n++}catch(e){}}
  if(recs.length)for(const id of Object.keys(have))if(!ids.has(id))await libFetch(`${LIB_LOCAL}/aud/del?t=${tk}&id=${encodeURIComponent(id)}`,4000).catch(()=>{});
  AUDR.ids=null;return n}finally{AUDSY.busy=false;AUDSY.at=Date.now()}}
setTimeout(()=>{audSync().catch(()=>{})},25000);setInterval(()=>{audSync().catch(()=>{})},10*6e4);
{hookFn('rcSave',()=>rcSave,f=>{rcSave=f},'post',function(){setTimeout(()=>{audSync().catch(()=>{})},3000)})}
/* ---- any device: which recordings the PC holds a copy of ---- */
async function audRemoteIds(force){if(!force&&AUDR.ids&&Date.now()-AUDR.at<120000)return AUDR.ids;
  if(!LIB.base){try{await libConnect()}catch(e){}}if(!LIB.base)return null;
  try{const r=await libFetch(libU('/aud/list'),5000);if(!r.ok)return null;AUDR.ids=(await r.json()).ids||{};AUDR.at=Date.now();return AUDR.ids}catch(e){return null}}
async function audRemoteUrl(id){const L_=await audRemoteIds();return L_&&L_[id]?libU('/aud?id='+encodeURIComponent(id)):null}
/* play: the device's own copy first, else the PC's copy (streamed), else the old message */
{const _p=rcPlay;rcPlay=async function(id,...a){const r=RCL().find(x=>x.id===id),el=rcAudio();if(!r||(RCX.cur===id&&el.src))return _p(id,...a);
  const b=await idbGet('aud:'+id).catch(()=>null);if(b)return _p(id,...a);
  const url=await audRemoteUrl(id);if(!url){toast(t(LIB.base?'dk.notYet':'dk.noPc'));return}
  try{if(typeof qStop==='function'&&QA&&QA.playing)qStop()}catch(e){}if(RCX.url){URL.revokeObjectURL(RCX.url);RCX.url=null}
  RCX.cur=id;el.src=url;el.playbackRate=RCX.rate||1;try{await el.play()}catch(e){}r.plays=(r.plays||0)+1;r.last=Date.now();save();try{rcMediaSession(r)}catch(e){}rcUI()}}
/* ---- keeping on this device ---- */
function dkMeta(){try{return JSON.parse(localStorage.getItem('thabat.lkeep')||'{}')||{}}catch(e){return{}}}
function dkMetaSet(o){try{localStorage.setItem('thabat.lkeep',JSON.stringify(o))}catch(e){}}
function dkMB(b){return b>=1073741824?(b/1073741824).toFixed(2)+' GB':(b/1048576).toFixed(b<10485760?1:0)+' MB'}
/* idbSet(k,null) keeps the key with a null value, so each recording's value is checked (a Blob handle is cheap to read) */
async function dkLocalRecs(){if(DK.keys&&Date.now()-DK.kat<20000)return DK.keys;const out=new Set();for(const r of RCL()){const b=await idbGet('aud:'+r.id).catch(()=>null);if(b&&b.size)out.add(r.id)}DK.keys=out;DK.kat=Date.now();return out}
function dkPill(){let el=$('#dkPill');const j=DK.job;if(!j){if(el)el.remove();return}
  if(!el){document.body.insertAdjacentHTML('beforeend','<div class="dkpill" id="dkPill" role="status"><span id="dkTx"></span><i><b id="dkBar"></b></i><button class="btn sm ghost" id="dkX"></button></div>');el=$('#dkPill');$('#dkX').onclick=()=>{if(DK.job&&DK.job.ac)DK.job.ac.abort()}}
  $('#dkX').textContent=t('cancel');$('#dkTx').textContent=t('dk.dling',j.n)+(j.tot?' · '+Math.floor(j.got/j.tot*100)+'%':' · '+dkMB(j.got));$('#dkBar').style.width=(j.tot?j.got/j.tot*100:0).toFixed(1)+'%'}
/* download a URL to a Blob with progress; one at a time */
async function dkFetch(url,name,size){if(DK.job){toast(t('dk.busy'));return null}
  try{const e=await navigator.storage.estimate();if(size&&e&&e.quota&&e.quota-e.usage<size*1.1){toast(t('dk.space',dkMB(size),dkMB(e.quota-e.usage)));return null}}catch(e){}
  const ac=new AbortController();DK.job={n:name,got:0,tot:size||0,ac};dkPill();
  try{const r=await fetch(url,{signal:ac.signal,cache:'no-store'});if(!r.ok)throw new Error('HTTP '+r.status);DK.job.tot=+r.headers.get('content-length')||DK.job.tot;
    const rd=r.body.getReader(),ch=[];let last=0;for(;;){const{done,value}=await rd.read();if(done)break;ch.push(value);DK.job.got+=value.length;if(Date.now()-last>400){last=Date.now();dkPill()}}
    return new Blob(ch,{type:r.headers.get('content-type')||'application/octet-stream'})}
  catch(e){if(e&&e.name==='AbortError')toast(t('dk.cancelled'));else toast(t('lb.off'));return null}finally{DK.job=null;dkPill()}}
async function dkKeepRec(id){const r=RCL().find(x=>x.id===id);if(!r)return;const url=await audRemoteUrl(id);if(!url){toast(t('dk.noPc'));return}
  const b=await dkFetch(url,r.title,(AUDR.ids||{})[id]);if(!b)return;try{await idbSet('aud:'+id,b)}catch(e){toast(t('toast.saveFail'));return}DK.keys=null;toast(t('dk.kept',r.title));try{renderLib()}catch(e){}}
async function dkDropRec(id){const r=RCL().find(x=>x.id===id);if(!r)return;const L_=await audRemoteIds(true);if(!L_||!L_[id]){toast(t('dk.onlyCopy'));return}
  if(RCX.cur===id&&RCX.url){try{rcStop()}catch(e){}}await idbSet('aud:'+id,null);DK.keys=null;toast(t('dk.dropped',r.title));try{renderLib()}catch(e){}}
async function dkKeepLesson(id){const it=libItem(id);if(!it)return;if(!LIB.base){toast(t('lb.off'));return}
  const b=await dkFetch(libU('/f?id='+encodeURIComponent(id)),libTitle(it.n),it.s);if(!b)return;try{await idbSet('lkeep:'+id,b)}catch(e){toast(t('dk.space',dkMB(b.size),'?'));return}
  const m=dkMeta();m[id]={n:it.n,s:b.size,at:Date.now(),k:it.k};dkMetaSet(m);toast(t('dk.kept',libTitle(it.n)));try{renderLib()}catch(e){}}
async function dkDropLesson(id){const m=dkMeta(),x=m[id];await idbSet('lkeep:'+id,null);delete m[id];dkMetaSet(m);toast(t('dk.dropped',x?libTitle(x.n):''));try{renderLib()}catch(e){}}
/* a kept lesson plays from the device, also when the PC is off */
/* the copy is read first, then the player is built and its source swapped in the same tick, before any request to the PC starts
   (its own «loadedmetadata» listener then resumes from the saved minute) */
{const _lp=libPlay;libPlay=function(id,...a){if(!dkMeta()[id])return _lp(id,...a);
  (async()=>{const b=await idbGet('lkeep:'+id).catch(()=>null);if(!b){if(LIB.base)_lp(id,...a);else toast(t('lb.off'));return}
    const off=!LIB.base;if(off)LIB.base='http://0.0.0.0:9';try{_lp(id,...a)}finally{if(off)LIB.base=''}
    const v=$('#lvV');if(!v)return;if(DK.url)URL.revokeObjectURL(DK.url);DK.url=URL.createObjectURL(b);v.src=DK.url})()}}
/* menus: a lesson «⋯» and a recording «⋯» */
function dkHere(){return ANDROID||LIB.via!=='pc'}
{const _m=lshItemMenu;lshItemMenu=function(anchor,ref,...a){const p=_m(anchor,ref,...a);try{const pp=$('#ppPop'),it=ref&&libItem(ref.id);
  if(pp&&it&&(it.k==='v'||it.k==='a')&&dkHere()&&!pp.querySelector('[data-dk]')){const kept=!!dkMeta()[ref.id];
    pp.insertAdjacentHTML('beforeend',`<div class="aymh"></div>`+(kept?`<button data-dk="drop">📱 ${esc(t('dk.dropL'))}</button>`:`<button data-dk="keep">⬇ ${esc(t('dk.keepL'))}${it.s?' · '+dkMB(it.s):''}</button>`));
    pp.querySelector('[data-dk]').onclick=()=>{closePP();kept?dkDropLesson(ref.id):dkKeepLesson(ref.id)}}}catch(e){}return p}}
{hookFn('auRecMenu',()=>auRecMenu,f=>{auRecMenu=f},'post',function(anchor,rid){(async()=>{const pp=$('#ppPop');if(!pp||pp.querySelector('[data-dk]'))return;
  const loc=(await dkLocalRecs()).has(rid);if(!loc){const L_=await audRemoteIds();if(!L_||!L_[rid]||!$('#ppPop'))return;
    pp.insertAdjacentHTML('beforeend',`<div class="aymh"></div><button data-dk="keep">⬇ ${esc(t('dk.keepR'))} · ${dkMB(L_[rid])}</button>`)}
  else{if(!dkHere())return;const L_=await audRemoteIds();if(!L_||!L_[rid]||!$('#ppPop'))return;pp.insertAdjacentHTML('beforeend',`<div class="aymh"></div><button data-dk="drop">📱 ${esc(t('dk.dropR'))}</button>`)}
  pp.querySelector('[data-dk]').onclick=e=>{closePP();e.currentTarget.dataset.dk==='keep'?dkKeepRec(rid):dkDropRec(rid)}})().catch(()=>{})})}
/* marks: ☁ on recordings that are only on the PC, 📱 on lessons kept here; and the «on this device» button in the library path */
{hookFn('renderLib',()=>renderLib,f=>{renderLib=f},'post',function(){(async()=>{const m=dkMeta();
  $$('#libBox .lbl[data-play]').forEach(el=>{const on=!!m[el.dataset.play];let b=el.querySelector(':scope>.dkb');if(on&&!b)el.insertAdjacentHTML('beforeend',`<span class="dkb" title="${esc(t('dk.onDev'))}">📱</span>`);else if(!on&&b)b.remove()});
  const rows=$$('#libBox .aurow[data-rid]');if(rows.length){const loc=await dkLocalRecs();rows.forEach(el=>{const off=!loc.has(el.dataset.rid);el.classList.toggle('dkcloud',off);let b=el.querySelector('.dkc');if(off&&!b){const tt=el.querySelector('.aut b');if(tt)tt.insertAdjacentHTML('afterend',`<span class="dkc" title="${esc(t('dk.onPc'))}">☁</span>`)}else if(!off&&b)b.remove()})}
  const lp=$('#lpath');if(lp&&!$('#dkBtn')&&(dkHere()||Object.keys(m).length)){lp.insertAdjacentHTML('beforeend',`<button class="btn sm ghost" id="dkBtn" title="${esc(t('dk.t'))}">📱 <span>${Object.keys(m).length||''}</span></button>`);$('#dkBtn').onclick=dkOpen}
  else if($('#dkBtn'))$('#dkBtn span').textContent=Object.keys(m).length||''})().catch(()=>{})})}
/* «on this device»: everything kept here, its size, the free space, remove one or all */
async function dkOpen(){const m=dkMeta(),loc=await dkLocalRecs(),L_=await audRemoteIds().catch(()=>null)||{};let est=null;try{est=await navigator.storage.estimate()}catch(e){}
  const recs=RCL().filter(r=>loc.has(r.id)&&L_[r.id]),ls=Object.entries(m).sort((a,b)=>b[1].at-a[1].at);let tot=ls.reduce((s,[,x])=>s+(x.s||0),0)+recs.reduce((s,r)=>s+(L_[r.id]||0),0);
  const row=(k,id,n,s)=>`<div class="dkrow"><span dir="auto">${esc(n)}</span><small>${s?dkMB(s):''}</small><button class="btn sm ghost" data-dkx="${k}:${esc(id)}" aria-label="${esc(t('dk.drop'))}">✕</button></div>`;
  openInfo(`<div class="dkbox"><h3>📱 ${esc(t('dk.t'))}</h3><p class="dksub">${esc(t('dk.sub'))}</p><div class="dkst"><b>${dkMB(tot)}</b> ${esc(t('dk.used'))}${est&&est.quota?` · ${esc(t('dk.free',dkMB(Math.max(0,est.quota-est.usage))))}`:''}</div>`+
    (ls.length?`<h4>🎬 ${esc(t('dk.lessons'))} (${ls.length})</h4>`+ls.map(([id,x])=>row('l',id,libTitle(x.n),x.s)).join(''):'')+
    (recs.length?`<h4>🎧 ${esc(t('dk.recs'))} (${recs.length})</h4>`+recs.map(r=>row('r',r.id,r.title,L_[r.id])).join(''):'')+
    (!ls.length&&!recs.length?`<p class="dksub">${esc(t('dk.none'))}</p>`:`<button class="btn sm" data-dkx="all">${esc(t('dk.dropAll'))}</button>`)+`</div>`);
  const box=$('#infoBox .dkbox');if(!box)return;box.addEventListener('click',async e=>{const b=e.target.closest('[data-dkx]');if(!b)return;const v=b.dataset.dkx;
    if(v==='all'){if(!confirm(t('dk.dropAllQ')))return;for(const[id]of ls)await dkDropLesson(id);for(const r of recs)await dkDropRec(r.id)}
    else{const k=v[0],id=v.slice(2);if(k==='l')await dkDropLesson(id);else await dkDropRec(id)}dkOpen()})}
