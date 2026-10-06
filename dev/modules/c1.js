/* ============ v3.2 launch readiness: welcome, simple mode, tips, privacy, what's new, bug report, updates, storage safety, backups, data health, sync ============ */
S.installedAt=S.installedAt||Date.now();
/* sync every newer list too (events, tasbih, courses… were local only) */
['badges','courses','events','goals','inbox','later','letters','mnotes','projects','recits','recur','reviews','studio','tasbih','noteTpls','habits','duas','qada','gkhatma','dayTpls','expr','learnM','plSince','installedAt'].forEach(k=>{if(!SY_SIMPLE.includes(k))SY_SIMPLE.push(k)});
/* --- 1. welcome --- */
const WC=[['🕌','wc.1t','wc.1b'],['⏱','wc.2t','wc.2b'],['📖','wc.3t','wc.3b'],['📿','wc.4t','wc.4b'],['🎨','wc.5t','wc.5b']];
let WCI=0,WC_DONE=null;
function openWelcome(done){WCI=0;WC_DONE=done;renderWelcome();$('#wcModal').classList.add('on')}
function renderWelcome(){const [ic,tt,bb]=WC[WCI]||[],last=WCI===WC.length;
  $('#wcBox').innerHTML=last?`<div class="wcic">✨</div><h2>${t('wc.modeT')}</h2><p>${t('wc.modeB')}</p><div class="wcmodes"><button class="wcm" data-m="simple"><b>🌱 ${t('wc.simple')}</b><small>${t('wc.simpleB')}</small></button><button class="wcm" data-m="full"><b>🚀 ${t('wc.full')}</b><small>${t('wc.fullB')}</small></button></div>`
   :`<div class="wcic">${ic}</div><h2>${t(tt)}</h2><p>${t(bb)}</p><div class="wcdots">${WC.map((_,i)=>`<i class="${i===WCI?'on':''}"></i>`).join('')}<i></i></div><div class="evact"><button class="btn sm ghost" id="wcSkip">${t('wc.skip')}</button><span style="flex:1"></span><button class="btn pri" id="wcNext">${t('next')} ›</button></div>`;
  const fin=m=>{S.welcomed=1;S.settings.simple=m==='simple';save();applySimple();$('#wcModal').classList.remove('on');if(WC_DONE)WC_DONE()};
  if(last)$$('#wcBox [data-m]').forEach(b=>b.onclick=()=>fin(b.dataset.m));else{$('#wcNext').onclick=()=>{WCI++;renderWelcome()};$('#wcSkip').onclick=()=>{WCI=WC.length;renderWelcome()}}}
{const _os=openSetup;openSetup=function(first){if(first&&!S.welcomed){openWelcome(()=>_os(first));return}_os(first)}}
/* --- 2. simple mode --- */
function applySimple(){document.body.classList.toggle('simple',!!S.settings.simple)}
applySimple();
/* --- 4. one feature tip at a time --- */
const TIPS=[['📥','tip.inbox',()=>openInbox()],['🎯','tip.deep',()=>{showView('today')}],['⊞','tip.mx',()=>{S.settings.tmx=true;save();showView('today');renderTasks()}],['🎙','tip.rc',()=>openRecits()],['🗂','tip.fc',()=>{nbMode='studio';STAB='fc';showView('boards')}],['🏅','tip.bd',()=>openBadges()],['✉','tip.ltr',()=>openLetters('new')],['🔍','tip.cmd',()=>cmdOpen()],['📝','tip.wr',()=>openWeekReview()],['🎨','tip.pal',()=>{nbMode='studio';STAB='pal';showView('boards')}],['📿','tip.tsb',()=>openTasbih()],['⌨','tip.keys',()=>openKeys()],['🧭','tip.qibla',()=>openQibla()],['🌱','tip.habit',()=>openHabits()],['📊','tip.year',()=>openHarvest()]];
function renderTip(){const el=$('#tipBar');if(!el)return;const seen=S.tipsSeen||(S.tipsSeen={}),now=Date.now();if(S.settings.tipsOff||now-S.installedAt<2*864e5||(S.tipLast&&now-S.tipLast<2*864e5&&S.tipCur==null)){el.hidden=true;return}
  let i=S.tipCur;if(i==null){i=TIPS.findIndex((x,j)=>!seen[x[1]]);if(i<0){el.hidden=true;return}S.tipCur=i;save()}const [ic,k,go]=TIPS[i];el.hidden=false;
  el.innerHTML=`<span class="tpic">${ic}</span><span>${t(k)}</span><button class="btn sm" data-tg>${t('tip.try')}</button><button class="link" data-tx>✕</button>`;
  const done=()=>{seen[k]=1;S.tipCur=null;S.tipLast=Date.now();save();el.hidden=true};el.querySelector('[data-tg]').onclick=()=>{done();go()};el.querySelector('[data-tx]').onclick=done}
{const _rtd2=renderToday;renderToday=function(){_rtd2();try{renderTip()}catch(e){}}}
/* --- 5. privacy, 6. what's new --- */
function openInfo(title,html){$('#infoBox').innerHTML=`<h2 style="font-size:20px">${title}</h2><div class="infob">${html}</div><div class="evact"><span style="flex:1"></span><button class="btn sm pri" id="infoX">${t('ok')}</button></div>`;$('#infoModal').classList.add('on');$('#infoX').onclick=()=>$('#infoModal').classList.remove('on')}
$('#infoModal').onclick=e=>{if(e.target.id==='infoModal')$('#infoModal').classList.remove('on')};
function openPrivacy(){openInfo('🔒 '+t('pv.t'),t('pv.body'))}
const CHANGES={'3.2':'chg.32'};
function openWhatsNew(){openInfo('🎉 '+t('chg.t',APP_VER),t(CHANGES[APP_VER]||'chg.32'))}
if(PRE_UPD&&!FIRST_RUN)setTimeout(()=>{if(!$('.modal.on'))openWhatsNew()},2500);
/* --- 7. error log + bug report --- */
const ERRK='thabat.errlog';
function errPush(m){try{const L_=JSON.parse(localStorage.getItem(ERRK)||'[]');L_.push({at:Date.now(),v:APP_VER,m:String(m).slice(0,400)});localStorage.setItem(ERRK,JSON.stringify(L_.slice(-60)))}catch(e){}}
window.addEventListener('error',e=>errPush((e.message||'')+' @'+(e.lineno||'')+':'+(e.colno||'')));window.addEventListener('unhandledrejection',e=>errPush('promise: '+(e.reason&&e.reason.message||e.reason)));
function bugInfo(){const L_=JSON.parse(localStorage.getItem(ERRK)||'[]').slice(-10);return['Thabat '+APP_VER+(ANDROID?' (Android)':' (PC)'),'UA: '+navigator.userAgent,'Screen: '+screen.width+'×'+screen.height+' @'+devicePixelRatio,'Lang: '+LANG+' · simple: '+!!S.settings.simple,'Days: '+Object.keys(S.days).length+' · notes: '+NOTES().length,'Open time: '+(S.perfOpen||'?')+' ms','Errors:',...L_.map(x=>new Date(x.at).toISOString().slice(0,16)+' ['+x.v+'] '+x.m)].join('\n')}
function openBug(){$('#infoBox').innerHTML=`<h2 style="font-size:20px">🐞 ${t('bug.t')}</h2><small class="muted">${t('bug.sub')}</small><textarea class="in" id="bugTx" rows="4" dir="auto" placeholder="${esc(t('bug.ph'))}" style="width:100%;margin:10px 0"></textarea><details><summary class="muted" style="cursor:pointer;font-size:13px">${t('bug.info')}</summary><pre class="bugpre" dir="ltr">${esc(bugInfo())}</pre></details>
  <div class="evact"><button class="btn sm ghost" id="bugLog">⤓ ${t('bug.log')}</button><span style="flex:1"></span><button class="btn sm ghost" id="infoX">${t('cancel')}</button><button class="btn sm" id="bugCopy">📋 ${t('bug.copy')}</button><button class="btn sm pri" id="bugMail">✉ ${t('bug.mail')}</button></div>`;$('#infoModal').classList.add('on');
  const txt=()=>($('#bugTx').value.trim()||'—')+'\n\n----\n'+bugInfo();$('#infoX').onclick=()=>$('#infoModal').classList.remove('on');$('#bugCopy').onclick=()=>copyTxt(txt());
  $('#bugMail').onclick=()=>{const u='mailto:?subject='+encodeURIComponent('Thabat '+APP_VER+' — '+t('bug.t'))+'&body='+encodeURIComponent(txt().slice(0,1800));if(ANDROID)window.ThabatAndroid.openUrl(u);else location.href=u};
  $('#bugLog').onclick=()=>saveBytes('thabat-errors-'+todayKey()+'.txt','text/plain',new Blob([bugInfo()+'\n\nFull log:\n'+localStorage.getItem(ERRK)],{type:'text/plain'}))}
/* --- 14. update check (from the address where the web version lives) --- */
function verGt(a,b){const x=String(a).split('.').map(Number),y=String(b).split('.').map(Number);for(let i=0;i<Math.max(x.length,y.length);i++){if((x[i]||0)!==(y[i]||0))return(x[i]||0)>(y[i]||0)}return false}
async function updCheck(force){const u=(S.settings.updUrl||'').trim().replace(/\/+$/,'');if(!u)return force&&toast(t('upd.noUrl'));if(!force&&S.updAt&&Date.now()-S.updAt<3*864e5)return;S.updAt=Date.now();save();
  try{const r=await fetch(u+'/version.json?'+Date.now(),{cache:'no-store'});const j=await r.json();if(j.ver&&verGt(j.ver,APP_VER)){const link=ANDROID?(j.apk||u):(j.zip||u);toastAct(t('upd.new',j.ver),t('upd.get'),()=>openExt(link.startsWith('http')?link:u+'/'+link),20000)}else if(force)toast(t('upd.latest',APP_VER))}catch(e){if(force)toast(t('upd.fail'))}}
setTimeout(()=>updCheck(),12000);
/* --- 17/23. storage safety: a second copy in IndexedDB, used if the browser storage is full or older --- */
let idbT=null;
function idbMirror(){clearTimeout(idbT);idbT=setTimeout(()=>{try{S._savedAt=Date.now();idbSet('state',JSON.stringify(S))}catch(e){}},1500)}
{const _fs=flushSave;flushSave=function(){S._savedAt=Date.now();clearTimeout(lsT);lsT=null;try{localStorage.setItem(KEY,JSON.stringify(S));if(localStorage.getItem('thabat.full')){localStorage.removeItem('thabat.full')}}catch(e){try{localStorage.setItem('thabat.full','1')}catch(x){}if(!window._fullWarned){window._fullWarned=1;toast(t('st.full'))}}idbMirror()};window.thabatFlush=()=>{lockAway();flushSave()}}
{const _sv=save;save=function(){_sv();idbMirror()}}
(async()=>{try{const raw=await idbGet('state');if(!raw)return;const o=JSON.parse(raw);if(o&&o.days&&(o._savedAt||0)>(S._savedAt||0)+2000){S=o;LANG=S.settings.lang||LANG;renderAll();toast(t('st.recovered'))}}catch(e){}})();
/* --- 18/19/20. lighter work when hidden, open-time measure --- */
{const _rg=renderGlass;renderGlass=function(){if(document.hidden)return;_rg()}}
document.addEventListener('visibilitychange',()=>{if(!document.hidden)try{renderGlass();renderPrayers()}catch(e){}});
requestAnimationFrame(()=>setTimeout(()=>{S.perfOpen=Math.round(performance.now());save()},0));
/* --- 21. weekly dated backups --- */
async function weeklyBackup(force){const wk=wkStart();if(!force&&S.wkBk===wk)return;const txt=JSON.stringify(S);
  try{if(dirHandle&&await dirHandle.queryPermission({mode:'readwrite'})==='granted'){const dir=await dirHandle.getDirectoryHandle(LANG==='ar'?'نسخ أسبوعية':'weekly',{create:true});const fh=await dir.getFileHandle('thabat-'+todayKey()+'.json',{create:true});const ws=await fh.createWritable();await ws.write(txt);await ws.close();
      const names=[];for await(const [n] of dir.entries())if(/^thabat-\d{4}-\d\d-\d\d\.json$/.test(n))names.push(n);names.sort().slice(0,-8).forEach(n=>dir.removeEntry(n).catch(()=>{}));S.wkBk=wk;save();return true}
    if(ANDROID&&S.settings.andBk!==false){await saveBytes('thabat-backup-'+todayKey()+'.json','application/json',new Blob([txt],{type:'application/json'}));S.wkBk=wk;save();return true}}catch(e){console.warn(e)}return false}
setTimeout(()=>weeklyBackup(),20000);
/* --- 22. restore with a preview --- */
function bkSummary(d){const ks=Object.keys(d.days||{}).sort(),hrs=ks.reduce((a,k)=>a+((d.days[k].sessions)||[]).reduce((x,s)=>x+s.end-s.start,0),0);return{days:ks.length,from:ks[0],to:ks[ks.length-1],notes:(d.notes||[]).length,tasks:ks.reduce((a,k)=>a+((d.days[k].tasks)||[]).length,0),hrs:Math.round(hrs/36e5),at:d._savedAt}}
$('#importIn').onchange=async e=>{const f=e.target.files[0];e.target.value='';if(!f)return;let d;try{d=JSON.parse(await f.text());if(!d.days)throw 0}catch(x){toast(t('toast.badFile'));return}const a=bkSummary(d),b=bkSummary(S);
  const row=(l,x,y)=>`<tr><td>${l}</td><td><b>${x}</b></td><td>${y}</td></tr>`;
  $('#infoBox').innerHTML=`<h2 style="font-size:20px">♻ ${t('rs.t')}</h2><small class="muted">${esc(f.name)}${a.at?' · '+gStr(new Date(a.at)):''}</small><table class="rstab"><tr><th></th><th>${t('rs.file')}</th><th>${t('rs.now')}</th></tr>${row(t('rs.days'),a.days,b.days)}${row(t('rs.range'),a.from?gShort(keyToDate(a.from))+' – '+gShort(keyToDate(a.to)):'—',b.from?gShort(keyToDate(b.from))+' – '+gShort(keyToDate(b.to)):'—')}${row(t('rs.hours'),a.hrs,b.hrs)}${row(t('rs.tasks'),a.tasks,b.tasks)}${row(t('rs.notes'),a.notes,b.notes)}</table>
   <p class="muted" style="font-size:12px">${t('rs.safe')}</p><div class="evact"><button class="btn sm ghost" id="infoX">${t('cancel')}</button><span style="flex:1"></span><button class="btn sm" id="rsMerge">${t('rs.merge')}</button><button class="btn sm pri" id="rsRep">${t('rs.replace')}</button></div>`;$('#infoModal').classList.add('on');$('#infoX').onclick=()=>$('#infoModal').classList.remove('on');
  const apply=async m=>{await idbSet('preRestore',JSON.stringify(S));if(m==='rep')S=deepMerge(structuredClone(DEF),d);else{const keep=S.days;S=deepMerge(S,d);for(const k in keep)if(!d.days[k])S.days[k]=keep[k]}LANG=S.settings.lang||'ar';save();flushSave();applyTheme();applyI18n();renderAll();$('#infoModal').classList.remove('on');toastAct(t('toast.imported'),t('undo'),undoRestore,15000)};
  $('#rsRep').onclick=()=>apply('rep');$('#rsMerge').onclick=()=>apply('merge')};
async function undoRestore(){const r=await idbGet('preRestore');if(!r)return;S=JSON.parse(r);save();flushSave();applyI18n();renderAll();toast(t('rs.undone'))}
/* --- 24. shrink old note images --- */
async function shrinkData(d,max,q){return new Promise(res=>{const im=new Image();im.onload=()=>{const k=Math.min(1,max/Math.max(im.naturalWidth,im.naturalHeight)),c=document.createElement('canvas');c.width=Math.round(im.naturalWidth*k);c.height=Math.round(im.naturalHeight*k);c.getContext('2d').drawImage(im,0,0,c.width,c.height);const o=c.toDataURL('image/jpeg',q);res(o.length<d.length?o:d)};im.onerror=()=>res(d);im.src=d})}
async function imgDiet(){if(S.dietAt&&Date.now()-S.dietAt<7*864e5)return;S.dietAt=Date.now();save();const old=dKey(addDays(keyToDate(todayKey()),-60));let n=0;
  for(const no of NOTES()){if(n>=12)break;if(!no.day||no.day>old)continue;for(const id of no.imgs||[]){const d=await idbGet('nimg:'+id);if(!d||d.length<450e3||/^data:image\/png/.test(d)&&d.length<900e3)continue;const s2=await shrinkData(d,1400,.78);if(s2!==d){await idbSet('nimg:'+id,s2);nImgMem[id]=s2;n++}}}}
setTimeout(()=>{(window.requestIdleCallback||setTimeout)(()=>imgDiet())},40000);
/* --- 25. data health --- */
async function idbKeys(){const db=await idb();return new Promise(r=>{const out=[];const q=db.transaction('kv').objectStore('kv').openKeyCursor();q.onsuccess=()=>{const c=q.result;if(c){out.push(c.key);c.continue()}else r(out)};q.onerror=()=>r(out)})}
async function healthScan(){const I=[],D=S.days;for(const k in D){const d=D[k],ss=d.sessions||[];const bad=ss.filter(s=>!(s.end>s.start)||s.end-s.start>20*36e5);if(bad.length)I.push({k:'sess',n:bad.length,fix:()=>{for(const x in S.days)S.days[x].sessions=(S.days[x].sessions||[]).filter(s=>s.end>s.start&&s.end-s.start<=20*36e5)}});
    const seen={};(d.tasks||[]).forEach(x=>{const key=x.text.trim()+'|'+x.done;seen[key]=(seen[key]||0)+1});const dup=Object.values(seen).filter(v=>v>1).reduce((a,v)=>a+v-1,0);if(dup)I.push({k:'dup',n:dup,day:k,fix:()=>{const dd=S.days[k],s2=new Set();dd.tasks=dd.tasks.filter(x=>{const key=x.text.trim()+'|'+x.done;if(s2.has(key))return false;s2.add(key);return true})}});
    if(!(d.sessions||[]).length&&!(d.tasks||[]).length&&!(d.media||[]).length&&!d.summary&&!d.quran&&!d.prayed&&!d.tsb&&!d.fast&&k<todayKey()&&Object.keys(d).length<=4)I.push({k:'empty',n:1,day:k,fix:()=>{delete S.days[k]}})}
  const merged=[];I.forEach(x=>{const m=merged.find(y=>y.k===x.k&&(x.k==='sess'));if(m)return;merged.push(x)});
  const used=new Set([...NOTES().flatMap(n=>n.imgs||[]),...(S.boards||[]).flatMap(b=>(b.els||[]).map(e=>e.img).filter(Boolean)),...stImgIds()]),recs=new Set(RCL().map(r=>r.id));let orph=[];try{orph=(await idbKeys()).filter(k=>(typeof k==='string')&&((k.startsWith('nimg:')&&!used.has(k.slice(5)))||(k.startsWith('aud:')&&!recs.has(k.slice(4)))))}catch(e){}
  if(orph.length)merged.push({k:'orph',n:orph.length,fix:async()=>{for(const k of orph)await idbSet(k,null)}});
  let est=null;try{est=await navigator.storage.estimate()}catch(e){}return{issues:merged,ls:(localStorage.getItem(KEY)||'').length,est}}
async function openHealth(){$('#infoBox').innerHTML=`<h2 style="font-size:20px">🩺 ${t('hl.t')}</h2><div class="empty">⏳</div>`;$('#infoModal').classList.add('on');const H=await healthScan();const groups={};H.issues.forEach(x=>{(groups[x.k]=groups[x.k]||[]).push(x)});
  $('#infoBox').innerHTML=`<h2 style="font-size:20px">🩺 ${t('hl.t')}</h2><div class="hlsize">💾 ${t('hl.size',(H.ls/1048576).toFixed(2),H.est?(H.est.usage/1048576).toFixed(0):'?',H.est&&H.est.quota?(H.est.quota/1073741824).toFixed(1):'?')}</div>
   ${Object.keys(groups).length?Object.entries(groups).map(([k,L_])=>`<div class="hlit"><span>${t('hl.'+k,L_.reduce((a,x)=>a+x.n,0))}</span><button class="btn sm" data-k="${k}">${t('hl.fix')}</button></div>`).join(''):`<div class="empty">✓ ${t('hl.ok')}</div>`}
   <div class="evact"><span style="flex:1"></span><button class="btn sm pri" id="infoX">${t('ok')}</button></div>`;$('#infoX').onclick=()=>$('#infoModal').classList.remove('on');
  $$('#infoBox [data-k]').forEach(b=>b.onclick=async()=>{await idbSet('preHealth',JSON.stringify(S));for(const x of groups[b.dataset.k])await x.fix();save();renderAll();toast(t('hl.fixed'));openHealth()})}
/* --- 86. lighter image sync, 87. conflict log --- */
async function syShrink(d){try{if(typeof d==='string'&&d.length>350e3&&d.startsWith('data:image'))return await shrinkData(d,1400,.76)}catch(e){}return d}
function syConf(k,b,l,r,v){try{if(b===undefined||l===undefined)return;const jb=JS_(b),jl=JS_(l);if(jl===jb||JS_(r)===jb||JS_(v)===jl)return;const L_=S.syConf||(S.syConf=[]);L_.unshift({k,at:Date.now(),lost:l});S.syConf=L_.slice(0,25)}catch(e){}}
function confLabel(k){if(k.startsWith('d:'))return t('cf.day',gStr(keyToDate(k.slice(2))));if(k.startsWith('a:'))return t('cf.adh',gShort(keyToDate(k.slice(2))));return t('cf.key',k)}
function openConflicts(){const L_=S.syConf||[];$('#infoBox').innerHTML=`<h2 style="font-size:20px">⇄ ${t('cf.t')}</h2><small class="muted">${t('cf.sub')}</small><div class="cflist">${L_.map((c,i)=>`<div class="hlit"><span><b>${esc(confLabel(c.k))}</b><small class="muted"> · ${fmtT(c.at)} ${gShort(new Date(c.at))}</small></span><button class="btn sm" data-i="${i}">${t('cf.restore')}</button></div>`).join('')||`<div class="empty">✓ ${t('cf.none')}</div>`}</div><div class="evact">${L_.length?`<button class="btn sm ghost" id="cfClr">${t('cf.clear')}</button>`:''}<span style="flex:1"></span><button class="btn sm pri" id="infoX">${t('ok')}</button></div>`;$('#infoModal').classList.add('on');
  $('#infoX').onclick=()=>$('#infoModal').classList.remove('on');const c=$('#cfClr');if(c)c.onclick=()=>{S.syConf=[];save();openConflicts()};
  $$('#infoBox [data-i]').forEach(b=>b.onclick=()=>{const x=L_[+b.dataset.i];sySetRec(x.k,x.lost);L_.splice(+b.dataset.i,1);save();renderAll();toast(t('cf.done'));openConflicts()})}
/* settings rows */
function renderV38Set(){toggle($('#simpleT'),!!S.settings.simple,v=>{S.settings.simple=v;setTimeout(applySimple,0)});toggle($('#tipsT'),!S.settings.tipsOff,v=>{S.settings.tipsOff=!v});
  $('#pvBtn').onclick=openPrivacy;$('#wnBtn').onclick=openWhatsNew;$('#bugBtn').onclick=openBug;$('#hlBtn').onclick=openHealth;$('#cfBtn').onclick=openConflicts;$('#cfBtn').textContent=t('cf.t')+((S.syConf||[]).length?' ('+S.syConf.length+')':'');
  const u=$('#updUrl');u.value=S.settings.updUrl||'';u.onchange=()=>{S.settings.updUrl=u.value.trim();save()};$('#updNow').onclick=()=>updCheck(true);$('#wkBkNow').onclick=async()=>toast(await weeklyBackup(true)?t('bk.done'):t('bk.noFolder'));
  $('#aboutV').textContent=`${t('app')} ${APP_VER} · ${t('ab.open',S.perfOpen||'?')}`}
{const _rs12=renderSettings;renderSettings=function(){_rs12();try{renderV38Set()}catch(e){console.error(e)}}}
