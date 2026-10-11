/* ============ sync between devices (private GitHub Gist) ============ */
const SYNC_KEY='thabat.sync',GH='https://api.github.com';
let SY={};try{SY=JSON.parse(localStorage.getItem(SYNC_KEY))||{}}catch(e){SY={}}
function sySave(){try{localStorage.setItem(SYNC_KEY,JSON.stringify(SY))}catch(e){}}
let SYBASE=null;function syBase(){if(SYBASE)return SYBASE;try{SYBASE=JSON.parse(localStorage.getItem(SYNC_KEY+'.base'))||{}}catch(e){SYBASE={}}return SYBASE}
function syBaseSave(b){const t_=JSON.stringify(b);SYBASE=JSON.parse(t_);try{localStorage.setItem(SYNC_KEY+'.base',t_)}catch(e){}}
const isObjV=v=>v!==null&&typeof v==='object'&&!Array.isArray(v),JS_=v=>JSON.stringify(v);
const isPrim=v=>v===null||['string','number','boolean'].includes(typeof v);
function merge3(b,l,r,pr){
  if(JS_(l)===JS_(r))return l;
  if(l===undefined)return(b!==undefined&&JS_(b)===JS_(r))?undefined:r;
  if(r===undefined)return(b!==undefined&&JS_(b)===JS_(l))?undefined:l;
  if(b!==undefined){if(JS_(b)===JS_(l))return r;if(JS_(b)===JS_(r))return l}
  else{const em=v=>v===''||v===null||v===false||v===0||(Array.isArray(v)&&!v.length)||(isObjV(v)&&!Object.keys(v).length);if(em(r)&&!em(l))return l;if(em(l)&&!em(r))return r}
  if(isObjV(l)&&isObjV(r)){const o={},bb=isObjV(b)?b:{};for(const k of new Set([...Object.keys(l),...Object.keys(r)])){const v=merge3(bb[k],l[k],r[k],pr);if(v!==undefined)o[k]=v}return o}
  if(Array.isArray(l)&&Array.isArray(r)){
    const withId=a=>a.every(x=>isObjV(x)&&x.id!=null);
    if(withId(l)&&withId(r)){const bm=new Map((Array.isArray(b)?b:[]).filter(x=>isObjV(x)&&x.id!=null).map(x=>[x.id,x])),lm=new Map(l.map(x=>[x.id,x])),rm=new Map(r.map(x=>[x.id,x]));
      const ids=[...l.map(x=>x.id),...r.map(x=>x.id).filter(id=>!lm.has(id))],out=[];for(const id of ids){const v=merge3(bm.get(id),lm.get(id),rm.get(id),pr);if(v!==undefined)out.push(v)}return out}
    if(l.every(isPrim)&&r.every(isPrim)){const ba=Array.isArray(b)?b:[],rl=new Set(ba.filter(x=>!l.includes(x))),rr=new Set(ba.filter(x=>!r.includes(x)));return[...new Set([...l,...r])].filter(x=>!rl.has(x)&&!rr.has(x))}}
  return pr?r:l}
/* records = the syncable pieces of the state */
const SY_SIMPLE=['settings','quran','ltasks','adhCustom','adhHidden','vac','vacOn','boards','notes'];
function syRecs(){const R={};for(const k of SY_SIMPLE){let v=S[k];if(v===undefined)continue;if(k==='quran'){v={...v};delete v.view;delete v.pv;delete v.dl}if(k==='settings'){v={...v};delete v.perf}R[k]=v}
  for(const k in S.days)R['d:'+k]=S.days[k];for(const k in S.adhkar)R['a:'+k]=S.adhkar[k];return JSON.parse(JSON.stringify(R))}
function sySetRec(k,v){if(v!==undefined)v=JSON.parse(JSON.stringify(v));if(k.startsWith('d:')){const d=k.slice(2);if(v===undefined)delete S.days[d];else S.days[d]=v;return}
  if(k.startsWith('a:')){const d=k.slice(2);if(v===undefined)delete S.adhkar[d];else S.adhkar[d]=v;return}
  if(v===undefined)return;if(k==='quran'){S.quran=Object.assign(v,{view:S.quran.view,pv:S.quran.pv,dl:S.quran.dl});return}S[k]=v}
/* track which records changed locally (for "newest wins" on true conflicts) */
let syHash={};function syHashAll(){const R=syRecs(),h={};for(const k in R)h[k]=JS_(R[k]);return h}
function syTrack(){const h=syHashAll(),now=Date.now();SY.meta=SY.meta||{};let ch=false;for(const k in h){if(syHash[k]!==h[k]){if(syHash[k]!==undefined||!SY.meta[k])SY.meta[k]=now;ch=true}}for(const k in syHash)if(!(k in h)){SY.meta[k]=now;ch=true}syHash=h;if(ch){SY.dirty=true;sySave()}return ch}
let syT1,syT2;function syncTouched(){if(!SY.token)return;clearTimeout(syT1);syT1=setTimeout(()=>{if(syTrack()){clearTimeout(syT2);syT2=setTimeout(()=>syncNow(),8000)}},1500)}
window.syncTouched=syncTouched;
async function ghFetch(path,opt={}){const r=await fetch(GH+path,{...opt,cache:'no-store',headers:{'Authorization':'token '+SY.token,'Accept':'application/vnd.github+json',...(opt.body?{'Content-Type':'application/json'}:{})}});
  if(r.status===401)throw new Error('auth');if(!r.ok)throw new Error('http '+r.status);return r.status===204?null:r.json()}
const SY_DESC='Thabat sync — ثبات';
async function syFindGist(){for(let pg=1;pg<=5;pg++){const L=await ghFetch('/gists?per_page=100&page='+pg);const g=L.find(x=>x.description===SY_DESC&&x.files&&x.files['thabat-core.json']);if(g)return g.id;if(L.length<100)break}return null}
function syFiles(R,meta){const files={},core={v:1,meta},months={};
  for(const k in R){if(k==='boards')continue;if(k.startsWith('d:')||k.startsWith('a:')){const m='thabat-days-'+k.slice(2,9)+'.json';(months[m]=months[m]||{d:{},a:{}})[k[0]][k.slice(2)]=R[k]}else core[k]=R[k]}
  files['thabat-core.json']=core;if(R.boards)files['thabat-boards.json']={boards:R.boards};Object.assign(files,months);return files}
function syUnfiles(F){const R={};let meta={};for(const fn in F){const o=F[fn];if(!o)continue;
    if(fn==='thabat-core.json'){meta=o.meta||{};for(const k in o)if(k!=='v'&&k!=='meta')R[k]=o[k]}
    else if(fn==='thabat-boards.json'){if(o.boards)R.boards=o.boards}
    else if(fn.startsWith('thabat-days-')){for(const d in (o.d||{}))R['d:'+d]=o.d[d];for(const d in (o.a||{}))R['a:'+d]=o.a[d]}}return{R,meta}}
async function syReadGist(id){const g=await ghFetch('/gists/'+id),F={},raw={};
  for(const fn in g.files){const f=g.files[fn];let txt=f.content;if(f.truncated&&f.raw_url){txt=await (await fetch(f.raw_url,{cache:'no-store'})).text()}raw[fn]=txt;try{F[fn]=JSON.parse(txt)}catch(e){}}return{F,raw}}
let syBusy=false;
const SY_IMG_DESC='Thabat images — ثبات';
async function syImages(){const ids=new Set();NOTES().forEach(n=>(n.imgs||[]).forEach(i=>ids.add(i)));(S.boards||[]).forEach(b=>(b.els||[]).forEach(e=>{if(e.img)ids.add(e.img)}));stImgIds().forEach(i=>ids.add(i));if(!ids.size)return false;
  const up=new Set(SY.imgUp||[]),toUp=[],missing=[];
  for(const id of ids){const d=await idbGet('nimg:'+id);if(d){if(!up.has(id))toUp.push([id,d])}else missing.push(id)}
  if(!toUp.length&&!missing.length)return false;
  if(!SY.imgGist){for(let pg=1;pg<=5&&!SY.imgGist;pg++){const L_=await ghFetch('/gists?per_page=100&page='+pg);const g=L_.find(x=>x.description===SY_IMG_DESC);if(g)SY.imgGist=g.id;if(L_.length<100)break}}
  let got=false;
  if(missing.length&&SY.imgGist){const g=await ghFetch('/gists/'+SY.imgGist);for(const id of missing){const f=g.files['img-'+id+'.txt'];if(!f)continue;let txt=f.content;if(f.truncated&&f.raw_url)txt=await(await fetch(f.raw_url,{cache:'no-store'})).text();if(txt&&txt.startsWith('data:')){await idbSet('nimg:'+id,txt);nImgMem[id]=txt;up.add(id);got=true}}}
  for(let i=0;i<toUp.length;i+=6){const batch=toUp.slice(i,i+6),files={};for(const [id,d] of batch)files['img-'+id+'.txt']={content:await syShrink(d)};
    if(!SY.imgGist){const g=await ghFetch('/gists',{method:'POST',body:JSON.stringify({description:SY_IMG_DESC,public:false,files})});SY.imgGist=g.id}
    else await ghFetch('/gists/'+SY.imgGist,{method:'PATCH',body:JSON.stringify({files})});batch.forEach(([id])=>up.add(id));SY.imgUp=[...up];sySave()}
  SY.imgUp=[...up];sySave();return got}
async function syncNow(opts={}){if(!SY.token||syBusy)return;if(!opts.force){const a=document.activeElement;if(a&&/INPUT|TEXTAREA/.test(a.tagName)&&a.closest('main')&&!a.closest('#syncBox')){clearTimeout(syT2);syT2=setTimeout(()=>syncNow(),15000);return}}
  syBusy=true;SY.state='busy';renderSync();
  try{syTrack();
    if(!SY.gist){SY.gist=await syFindGist();sySave()}
    const local=syRecs(),lmeta=SY.meta||{};let remote={R:{},meta:{}},raw={};
    if(SY.gist){try{const rg=await syReadGist(SY.gist);remote=syUnfiles(rg.F);raw=rg.raw}catch(e){if(String(e.message).includes('404')){SY.gist=null}else throw e}}
    const first=!SY.linked,base=first?{}:syBase(),merged={},mmeta={...remote.meta};
    for(const k of new Set([...Object.keys(local),...Object.keys(remote.R),...Object.keys(base)])){
      const pr=first?true:((remote.meta[k]||0)>(lmeta[k]||0));const v=merge3(base[k],local[k],remote.R[k],pr);if(!first)syConf(k,base[k],local[k],remote.R[k],v);
      if(v!==undefined){merged[k]=v;mmeta[k]=Math.max(lmeta[k]||0,remote.meta[k]||0)}}
    /* apply to local state */
    let changed=false;for(const k of new Set([...Object.keys(local),...Object.keys(merged)])){if(JS_(local[k])!==JS_(merged[k])){sySetRec(k,merged[k]);changed=true}}
    if(changed){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
    /* upload what differs from the gist */
    const files=syFiles(merged,mmeta),up={};
    for(const fn in files){const txt=JSON.stringify(files[fn]);if(raw[fn]!==txt)up[fn]={content:txt}}
    for(const fn in raw)if(!(fn in files)&&fn.startsWith('thabat-days-'))up[fn]=null;
    if(!SY.gist){const g=await ghFetch('/gists',{method:'POST',body:JSON.stringify({description:SY_DESC,public:false,files:up})});SY.gist=g.id}
    else if(Object.keys(up).length){await ghFetch('/gists/'+SY.gist,{method:'PATCH',body:JSON.stringify({files:up})})}
    syBaseSave(merged);SY.meta=mmeta;SY.linked=true;SY.dirty=false;SY.last=Date.now();SY.state='ok';SY.err='';syHash=syHashAll();sySave();
    if(changed){applyTheme();applyI18n();renderAll();if(first)toast(t('sync.merged'))}
    try{if(await syImages())notesChanged()}catch(e){}
  }catch(e){SY.state='err';SY.err=e.message==='auth'?t('sync.errAuth'):(e.message||'').startsWith('http')?t('sync.errHttp',e.message):t('sync.errNet');sySave()}
  finally{syBusy=false;renderSync()}}
function renderSync(){const b=$('#syncBox');if(!b)return;
  const on=!!SY.token,st=SY.state==='busy'?t('sync.busy'):SY.state==='err'?'⚠ '+SY.err:SY.last?t('sync.last',fmtT(SY.last)+(keyOf(SY.last)!==todayKey()?' · '+gShort(keyToDate(keyOf(SY.last))):'')):'';
  b.innerHTML=`<div class="syhead"><div><label>${t('sync.title')}</label><small>${t(on?'sync.onSub':'sync.sub')}</small></div><span class="sydot ${on?(SY.state==='err'?'err':'ok'):''}">${on?(SY.user?'@'+esc(SY.user):t('sync.on')):t('sync.off')}</span></div>
    ${on?`<div class="syrow"><small class="systat ${SY.state==='err'?'err':''}">${esc(st)}</small><button class="btn sm" id="syNow">${t('sync.now')}</button><button class="btn sm ghost danger" id="syOff">${t('sync.unlink')}</button></div>`
      :`<ol class="syhow"><li>${t('sync.step1')} <a href="https://github.com/settings/tokens/new?scopes=gist&description=Thabat" target="_blank" rel="noopener">${t('sync.link')}</a></li><li>${t('sync.step2')}</li><li>${t('sync.step3')}</li></ol>
       <div class="syrow"><input class="in" id="syTok" type="password" autocomplete="off" spellcheck="false" dir="ltr" placeholder="ghp_…"><button class="btn sm pri" id="syLink">${t('sync.connect')}</button></div>${SY.state==='err'&&SY.err?`<small class="systat err">⚠ ${esc(SY.err)}</small>`:''}`}`;
  const n=$('#syNow');if(n)n.onclick=()=>syncNow({force:true});
  const o=$('#syOff');if(o)o.onclick=()=>{if(!confirm(t('sync.unlinkQ')))return;SY={};sySave();syBaseSave({});renderSync()};
  const l=$('#syLink');if(l)l.onclick=async()=>{const tok=$('#syTok').value.trim();if(!tok)return;SY={token:tok,state:'busy'};renderSync();
    try{const u=await ghFetch('/user');SY.user=u.login;sySave();syHash={};await syncNow({force:true});if(SY.state==='ok')toast(t('sync.done'))}catch(e){const m=e.message==='auth'?t('sync.errAuth'):t('sync.errNet');SY={state:'err',err:m};sySave();renderSync()}}}
if(SY.token){syHash=syHashAll();setTimeout(()=>syncNow(),2500);setInterval(()=>{if(!document.hidden)syncNow()},3*6e4);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)syncNow();else if(SY.dirty)syncNow({force:true})})}


