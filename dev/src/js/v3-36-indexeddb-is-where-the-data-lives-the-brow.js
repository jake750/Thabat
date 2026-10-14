/* ============ v3.36: IndexedDB is where the data lives; the browser storage (localStorage) is a quick start copy ============ */
/* Records in the «thabat» database, store «kv»:
     v2:core      everything except days and notes        v2:notes   the notes
     v2:m:YYYY-MM the days of one month                   v2:meta    {at, months, cnt, ver} — written last, in the same transaction
   One transaction per save, so a save is all or nothing. Only records whose text changed are written.
   localStorage keeps the full copy while it fits (instant start); when it is full a short copy (settings, recent days) is kept
   there with «thabat.v1.meta».slim=1, and the loader at the end of the page builds the full data from IndexedDB before the app starts.
   The move happens once («thabat.idb2»), after a safety copy (v2:before), and is checked record by record before it counts. */
const V2_SLIM_AT=3e6;
const V2={last:{},busy:false,again:false,t:null,ok:false,err:null,writes:0,lastAt:0};
function v2Migrated(){try{return localStorage.getItem('thabat.idb2')==='1'}catch(e){return false}}
function v2Records(o){const R={},core={};for(const k in o)if(k!=='days'&&k!=='notes'&&k!=='_savedAt')core[k]=o[k];R['v2:core']=JSON.stringify(core);R['v2:notes']=JSON.stringify(o.notes||[]);
  const M={};for(const k in (o.days||{})){const ym=k.slice(0,7);(M[ym]=M[ym]||{})[k]=o.days[k]}for(const ym in M)R['v2:m:'+ym]=JSON.stringify(M[ym]);return{R,months:Object.keys(M).sort()}}
function v2Tx(fn){return idb().then(db=>new Promise((res,rej)=>{const tx=db.transaction('kv','readwrite');fn(tx.objectStore('kv'));tx.oncomplete=()=>res();tx.onerror=()=>rej(tx.error);tx.onabort=()=>rej(tx.error||new Error('abort'))}))}
async function v2ReadAll(){const db=await idb();return new Promise((res,rej)=>{const out={},tx=db.transaction('kv'),st=tx.objectStore('kv'),rq=st.openCursor(IDBKeyRange.bound('v2:','v2:￿'));rq.onsuccess=()=>{const c=rq.result;if(c){out[c.key]=c.value;c.continue()}else res(out)};rq.onerror=()=>rej(rq.error)})}
/* the full data from the records (null when there is no complete set) */
function v2Assemble(all){try{const meta=JSON.parse(all['v2:meta']||'null');if(!meta||!all['v2:core'])return null;const o=JSON.parse(all['v2:core']);o._savedAt=meta.at||0;o.notes=JSON.parse(all['v2:notes']||'[]');o.days={};
  for(const ym of meta.months){const raw=all['v2:m:'+ym];if(raw==null)return null;Object.assign(o.days,JSON.parse(raw))}return{o,meta}}catch(e){return null}}
async function v2Write(){if(V2.busy){V2.again=true;return}if(S._slim){V2.err='slim';return}V2.busy=true;
  try{const {R,months}=v2Records(S),meta={at:S._savedAt||Date.now(),months,cnt:stCount(S),ver:APP_VER},ch=Object.keys(R).filter(k=>V2.last[k]!==R[k]),gone=Object.keys(V2.last).filter(k=>k.startsWith('v2:m:')&&!(k in R));
    if(ch.length||gone.length||!V2.lastAt){await v2Tx(st=>{ch.forEach(k=>st.put(R[k],k));gone.forEach(k=>st.delete(k));st.put(JSON.stringify(meta),'v2:meta')});ch.forEach(k=>V2.last[k]=R[k]);gone.forEach(k=>delete V2.last[k]);V2.writes++}
    V2.lastAt=Date.now();V2.ok=true;V2.err=null}catch(e){V2.ok=false;V2.err=String(e&&e.message||e)}
  finally{V2.busy=false;if(V2.again){V2.again=false;v2Soon(300)}}}
function v2Soon(ms){clearTimeout(V2.t);V2.t=setTimeout(v2Write,ms==null?800:ms)}
/* the start copy in localStorage: full when it fits, else short (settings, everything but notes, the last 60 days and the future) */
function v2Slim(){const o={},cut=dKey(addDays(new Date(),-60));for(const k in S)if(k!=='days'&&k!=='notes')o[k]=S[k];o.days={};for(const k in S.days)if(k>=cut)o.days[k]=S.days[k];o.notes=[];o._slim=1;return o}
function v2Meta(slim){try{localStorage.setItem('thabat.v1.meta',JSON.stringify({at:S._savedAt||0,slim:slim?1:0}))}catch(e){}}

/* saving: after the move, IndexedDB records replace the old single «state» copy */
{const _im=idbMirror;idbMirror=function(){if(v2Migrated())return v2Soon();return _im()}}
{const _fs=flushSave;flushSave=function(){if(!v2Migrated())return _fs();
  S._savedAt=Date.now();clearTimeout(lsT);lsT=null;
  if(S._slim){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}v2Meta(true);return}
  /* past ~3 million characters the full copy makes every save slow (and Chrome stops at about 5): keep the short one */
  let full=true;try{const js=JSON.stringify(S);if(js.length>V2_SLIM_AT)throw new Error('big');localStorage.setItem(KEY,js)}catch(e){full=false;try{localStorage.setItem(KEY,JSON.stringify(v2Slim()))}catch(x){}if(e.message!=='big'&&!window._fullWarned){window._fullWarned=1;toast(t('st.full'))}}
  v2Meta(!full);v2Soon(0)};window.thabatFlush=()=>{try{lockAway()}catch(e){}flushSave()}}

/* the move, once: a safety copy, all records, read back and compared, then the flag */
async function v2Migrate(){if(v2Migrated()||S._slim)return;try{
  await idbSet('v2:before',JSON.stringify(S));S._savedAt=S._savedAt||Date.now();
  const {R,months}=v2Records(S),meta={at:S._savedAt,months,cnt:stCount(S),ver:APP_VER,from:'localStorage',movedAt:Date.now()};
  await v2Tx(st=>{for(const k in R)st.put(R[k],k);st.put(JSON.stringify(meta),'v2:meta')});
  const all=await v2ReadAll(),bad=Object.keys(R).filter(k=>all[k]!==R[k]),A=v2Assemble(all);
  if(bad.length||!A||stLess(stCount(A.o),stCount(S))||stLess(stCount(S),stCount(A.o))){V2.err='verify:'+bad.length;return}
  for(const k in R)V2.last[k]=R[k];V2.lastAt=Date.now();V2.ok=true;
  localStorage.setItem('thabat.idb2','1');localStorage.setItem('thabat.idb2at',String(Date.now()));v2Meta(false);
  try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist()}catch(e){}}catch(e){V2.err='migrate:'+(e&&e.message||e)}}
/* after the move: fill the «last written» cache from what is stored, and adopt a newer complete copy (another window, or a short start copy) */
async function v2Start(){if(!v2Migrated()){setTimeout(v2Migrate,2500);return}
  try{const all=await v2ReadAll();for(const k in all)if(k.startsWith('v2:')&&k!=='v2:meta'&&k!=='v2:before')V2.last[k]=all[k];V2.lastAt=Date.now();V2.ok=true;
    const A=v2Assemble(all);if(!A)return;
    if(S._slim){/* started from the short copy (the loader could not read IndexedDB): keep what was changed since, add the rest */
      const o=A.o;for(const k in S)if(k!=='days'&&k!=='notes'&&k!=='_slim')o[k]=S[k];for(const k in S.days)o.days[k]=S.days[k];const ids=new Set((S.notes||[]).map(n=>n.id));o.notes=(o.notes||[]).filter(n=>!ids.has(n.id)).concat(S.notes||[]);
      S=deepMerge(structuredClone(DEF),o);delete S._slim;LANG=S.settings.lang||LANG;flushSave();renderAll();return}
    if((A.meta.at||0)>(S._savedAt||0)+2000){const a=stCount(S),b=stCount(A.o);
      const use=async()=>{try{await idbSet('state.before',JSON.stringify(S))}catch(e){}S=deepMerge(structuredClone(DEF),A.o);LANG=S.settings.lang||LANG;flushSave();renderAll();toast(t('st.recovered'))};
      if(!stLess(b,a)){await use();return}
      toastAct(t('st.altKept',b.d,b.tk,a.d,a.tk),t('st.altUse'),()=>{if(confirm(t('st.altQ',b.d,b.tk,a.d,a.tk)))use()},20000)}
    try{if(+localStorage.getItem('thabat.idb2at')<Date.now()-30*864e5)idbSet('v2:before',null)}catch(e){}}catch(e){V2.err='start:'+(e&&e.message||e)}}
/* the loader's full data was used for S at start (see state.js); it is not needed any more */
window.__THABAT_BOOT=null;
setTimeout(v2Start,1200);
/* another window saved a short copy: take the full data from IndexedDB instead */
window.addEventListener('storage',e=>{if(e.key!==KEY||!e.newValue||!v2Migrated())return;let o;try{o=JSON.parse(e.newValue)}catch(x){return}if(!o||!o._slim)return;
  e.stopImmediatePropagation();if((o._savedAt||0)<=(S._savedAt||0))return;let n=0;const tryAdopt=async()=>{try{const A=v2Assemble(await v2ReadAll());if(A&&(A.meta.at||0)>=(o._savedAt||0)){clearTimeout(lsT);lsT=null;S=deepMerge(structuredClone(DEF),A.o);delete S._slim;renderAll();return}}catch(x){}if(++n<15)setTimeout(tryAdopt,300)};setTimeout(tryAdopt,200)},true);

/* data health shows where the data lives */
function v2Status(){const mig=v2Migrated();let meta=null;try{meta=JSON.parse(localStorage.getItem('thabat.v1.meta')||'null')}catch(e){}
  return`<div class="v2st">🗄 ${mig?t('v2.on',new Set(Object.keys(S.days).map(k=>k.slice(0,7))).size,S._savedAt?fmtT(S._savedAt):'—'):t('v2.off')}${mig?`<br><small>${meta&&meta.slim?t('v2.slim'):t('v2.full')}${V2.err?' · ⚠ '+esc(V2.err):''}</small>`:''}</div>`}
{hookFn('openHealth',()=>openHealth,f=>{openHealth=f},'post',function(){let n=0;const go=()=>{const b=$('#infoBox .hlsize');if(b){if(!$('#infoBox .v2st'))b.insertAdjacentHTML('afterend',v2Status());return}if(++n<40)setTimeout(go,100)};go()})}

