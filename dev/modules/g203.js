/* ============ v3.170.0 thirteenth list M: data and speed (264, 265, 282, 286, 289) ============ */
/* 264 the prayer map of a year as a picture: drawn on a canvas from the same values the window shows, in the theme's colours */
function m16Val(k,tab){let v=0,mx=5;
  if(tab==='on')PRAYERS.forEach(p=>{const s=plStatus(k,p);if(s==='on'||s==='auto')v++});
  else if(tab==='jm')PRAYERS.forEach(p=>{if(jmHas(k,p))v++});
  else if(tab==='nf'){mx=20;v=nflRk(k)}else{mx=12;Object.keys(RAWATIB).forEach(p=>{v+=snCount(k,p)})}
  return{v,mx}}
function m16Css(sel,prop){const i=document.createElement('i');i.className=sel;i.style.cssText='position:absolute;visibility:hidden';const host=document.createElement('div');host.className='pmap';host.style.cssText='position:absolute;left:-9999px';host.append(i);document.body.append(host);const v=getComputedStyle(i)[prop];host.remove();return v}
async function m16MapPng(tab){tab=tab||'on';const end=keyToDate(todayKey()),start=addDays(end,-364),wd0=start.getDay(),cells=[];
  for(let i=0;i<365;i++){const dt=addDays(start,i),k=dKey(dt),o=m16Val(k,tab);cells.push({dt,k,...o})}
  const lv=c=>c.v<=0?0:Math.min(4,Math.ceil(c.v/c.mx*4)),cs=getComputedStyle(document.documentElement),V=n=>cs.getPropertyValue(n).trim();
  const col=[0,1,2,3,4].map(l=>m16Css('l'+l,'backgroundColor')),bg=V('--panel')||'#1d1f24',tx=V('--text')||'#eee',mu=V('--muted')||'#999',ac=V('--accent')||'#d8b35a';
  const C=18,G=4,weeks=Math.ceil((wd0+365)/7),PX=48,W=PX*2+weeks*(C+G)-G,H=330,cv=document.createElement('canvas'),sc=2;cv.width=W*sc;cv.height=H*sc;const x=cv.getContext('2d');x.scale(sc,sc);
  const ff=getComputedStyle(document.body).fontFamily,rtl=document.documentElement.dir==='rtl';
  x.fillStyle=bg;x.fillRect(0,0,W,H);x.direction=rtl?'rtl':'ltr';x.textAlign=rtl?'right':'left';const ex=rtl?W-PX:PX;
  const tot=cells.reduce((a,c)=>a+c.v,0),days=cells.filter(c=>tab==='nf'?c.v>0:c.v>=c.mx).length,tn={on:'pm.on',jm:'pm.jm',sn:'pm.sn',nf:'pm.nf'}[tab];
  x.fillStyle=tx;x.font=`700 24px ${ff}`;x.fillText(t('pm.t')+' · '+t(tn),ex,48);
  x.fillStyle=mu;x.font=`15px ${ff}`;x.fillText(hStr(start)+' – '+hStr(end)+'   ·   '+gStr(start)+' – '+gStr(end),ex,76);
  x.fillStyle=ac;x.font=`700 20px ${ff}`;x.fillText(`${tot} ${t(tab==='sn'||tab==='nf'?'pm.rk':'pm.prayers')}   ·   ${days} ${t(tab==='nf'?'pm.nfd':'pm.full')}`,ex,110);
  const top=150;x.font=`12px ${ff}`;x.textAlign='left';x.direction='ltr';let lastM=-1;
  cells.forEach((c,i)=>{const n=wd0+i,w=Math.floor(n/7),d=n%7,cx=PX+w*(C+G),cy=top+d*(C+G);x.fillStyle=col[lv(c)];m16Rr(x,cx,cy,C,C,4);x.fill();
    if(d===0||i===0){const m=c.dt.getMonth();if(m!==lastM&&c.dt.getDate()<=7){lastM=m;x.fillStyle=mu;x.fillText(L().months[m].slice(0,6),cx,top-8)}}});
  const ly=top+7*(C+G)+22;x.fillStyle=mu;x.font=`13px ${ff}`;let lx=PX;x.fillText(t('pm.less'),lx,ly+12);lx+=x.measureText(t('pm.less')).width+8;
  col.forEach(c=>{x.fillStyle=c;m16Rr(x,lx,ly,14,14,3);x.fill();lx+=18});x.fillStyle=mu;x.fillText(t('pm.more'),lx+4,ly+12);
  x.textAlign='right';x.fillStyle=mu;x.globalAlpha=.8;x.fillText('ثبات · Thabat',W-PX,ly+12);x.globalAlpha=1;
  return new Promise(r=>cv.toBlob(r,'image/png'))}
function m16Rr(x,a,b,w,h,r){x.beginPath();x.moveTo(a+r,b);x.arcTo(a+w,b,a+w,b+h,r);x.arcTo(a+w,b+h,a,b+h,r);x.arcTo(a,b+h,a,b,r);x.arcTo(a,b,a+w,b,r);x.closePath()}
async function m16MapSave(tab){try{const b=await m16MapPng(tab);if(!b)return toast(t('m16.fail'));await saveBytes(`thabat-prayer-map-${todayKey()}.png`,'image/png',b)}catch(e){console.error(e);toast(t('m16.fail'))}}
{const _o=openPrayMap;openPrayMap=function(tab,...a){const r=_o(tab,...a);try{const lg=$('#infoBox .pmleg');if(lg&&!$('#m16Ex')){lg.insertAdjacentHTML('afterend',`<div class="row m16exr"><button class="btn sm" id="m16Ex">⬇ ${esc(t('m16.ex'))}</button></div>`);$('#m16Ex').onclick=e=>{e.target.disabled=true;m16MapSave(tab||'on').finally(()=>{e.target.disabled=false})}}}catch(e){}return r}}

/* 265 the largest notes (text + their pictures on this device), each with «compress its pictures» */
async function m16NoteSize(n){let img=0,big=0;const ids=[...(n.imgs||[]),...(n.cov&&typeof n.cov==='string'&&!n.cov.startsWith('data:')?[n.cov]:[])];
  for(const id of ids){let d=nImgMem[id];if(!d){try{d=await idbGet('nimg:'+id)}catch(e){}}if(typeof d==='string'){img+=Math.round(d.length*.75);if(d.length>=180000)big++}}
  const tx=new Blob([String(n.title||''),String(n.body||'')]).size;return{n,tx,img,all:tx+img,cnt:ids.length,big}}
async function m16BigList(lim){const out=[];for(const n of NOTES()){if(n.lock&&!notesUnlocked())continue;out.push(await m16NoteSize(n))}return out.sort((a,b)=>b.all-a.all).slice(0,lim||15)}
async function m16Shrink(n){let before=0,after=0,c=0;for(const id of(n.imgs||[])){try{const d=await idbGet('nimg:'+id);if(!d||typeof d!=='string'||d.length<180000)continue;const o=await imzImg(d);if(o&&o.length<d.length){before+=d.length;after+=o.length;await idbSet('nimg:'+id,o);nImgMem[id]=o;c++}}catch(e){}}
  return{c,saved:Math.round((before-after)*.75)}}
async function m16BigOpen(){openInfo(t('m16.bigT'),`<div class="empty">⏳</div>`);const L_=await m16BigList(15);const box=$('#infoBox .infob');if(!box)return;
  if(!L_.length||!L_[0].all){box.innerHTML=`<p class="muted">${esc(t('m16.bigNone'))}</p>`;return}const mx=L_[0].all||1;
  box.innerHTML=`<p class="muted">${esc(t('m16.bigSub'))}</p><div class="m16bl">${L_.map((o,i)=>`<div class="m16br"><div class="m16bt"><button class="m16bn" data-m16o="${o.n.id}" dir="auto">${esc(o.n.title||mdPlain(o.n.body||'').slice(0,50)||t('notes.untitled'))}</button><b>${stoFmt(o.all)}</b></div>
    <div class="m16bb"><i style="width:${Math.max(2,Math.round(o.all/mx*100))}%"></i></div><small class="muted">${esc(o.cnt?t('m16.parts',stoFmt(o.tx),o.cnt,stoFmt(o.img)):t('m16.txOnly',stoFmt(o.tx)))}</small>
    ${o.big?`<button class="btn sm" data-m16z="${i}">🗜 ${esc(t('m16.zip',o.big))}</button>`:''}</div>`).join('')}</div>`;
  box.querySelectorAll('[data-m16o]').forEach(b=>b.onclick=()=>{$$('.modal.on').forEach(m=>m.classList.remove('on'));showView('boards');setTimeout(()=>openNote(b.dataset.m16o),80)});
  box.querySelectorAll('[data-m16z]').forEach(b=>b.onclick=async()=>{const o=L_[+b.dataset.m16z];b.disabled=true;b.textContent='⏳';const r=await m16Shrink(o.n);toast(r.c?t('imz.done',r.c,stoFmt(r.saved)):t('imz.none'));m16BigOpen()})}

/* 286 task links that point to nothing: a deleted note, a removed device book, a PC book or lesson gone from the library */
function m16LinkScan(){const notes=new Set(NOTES().map(n=>n.id)),dev=new Set(bkLocal().map(b=>'l:'+b.id)),tree=!!(LIB.tree&&LIB.tree.length);
  let pc=null,les=null;if(tree){pc=new Set(bkPcBooks().map(b=>b.key));les=new Set();try{libCourses().forEach(c=>libMedia(c).forEach(m=>les.add(m.id)))}catch(e){les=null}}
  const out=[],from=dKey(addDays(keyToDate(todayKey()),-90));
  Object.keys(S.days).sort().forEach(k=>{if(k<from)return;(S.days[k].tasks||[]).forEach(x=>{if(x.done||x.pp)return;const bad=[];
    if(x.note&&!notes.has(x.note))bad.push('note');
    if(x.bk){const b=String(x.bk);if(b.startsWith('l:')?!dev.has(b):(pc&&b.startsWith('p:')&&!pc.has(b)))bad.push('bk')}
    if(x.lib&&les&&!les.has(x.lib))bad.push('lib');
    if(bad.length)out.push({k,x,bad})})});return{out,tree}}
function m16LinkOpen(){const R=m16LinkScan(),L_=R.out,F={note:'note',bk:'bk',lib:'lib'};
  openInfo(t('m16.lkT'),`${R.tree?'':`<p class="muted m16ln">${esc(t('m16.lkTree'))}</p>`}${L_.length?`<p class="muted">${esc(t('m16.lkSub',L_.length))}</p><div class="m16ll">${L_.map((o,i)=>`<div class="m16lr"><small class="muted">${esc(gShort(keyToDate(o.k)))}</small><span dir="auto">${esc(String(o.x.text||'').slice(0,80))}</span><em>${o.bad.map(b=>esc(t('m16.lk.'+b))).join(' · ')}</em><button class="btn sm ghost" data-m16u="${i}">${esc(t('m16.unlink'))}</button></div>`).join('')}</div>
    <div class="row" style="justify-content:flex-end"><button class="btn pri" id="m16UnAll">${esc(t('m16.unAll',L_.length))}</button></div>`:`<p class="muted">✓ ${esc(t('m16.lkNone'))}</p>`}`);
  const drop=list=>{const old=list.map(o=>({x:o.x,v:o.bad.map(b=>[F[b],o.x[F[b]]])}));list.forEach(o=>o.bad.forEach(b=>{delete o.x[F[b]]}));save();try{renderTasks()}catch(e){}
    toastAct(t('m16.unDone',list.length),t('undo'),()=>{old.forEach(o=>o.v.forEach(([f,v])=>{o.x[f]=v}));save();try{renderTasks()}catch(e){}},12000)};
  $$('#infoBox [data-m16u]').forEach(b=>b.onclick=()=>{drop([L_[+b.dataset.m16u]]);m16LinkOpen()});
  const a=$('#m16UnAll');if(a)a.onclick=()=>{drop(L_);$$('.modal.on').forEach(m=>m.classList.remove('on'))}}

/* 289 «full check»: every check of Data health at once, one line each with its result and a button to open it */
async function m16AllOpen(){openInfo('🩺 '+t('m16.allT'),`<div class="empty">⏳ ${esc(t('m16.running'))}</div>`);const rows=[];
  const add=(ok,label,val,run)=>rows.push({ok,label,val,run});
  try{const H=await healthScan(),n=H.issues.reduce((a,x)=>a+x.n,0);add(!n,t('m16.c.health'),n?H.issues.map(x=>t('hl.'+x.k,x.n)).join(' · '):t('m16.ok'),()=>openHealth())}catch(e){}
  try{const D=dupScan(),n=D.reduce((s,x)=>s+x.drop.length,0);add(!n,t('dup.t'),n?t('m16.n',n):t('m16.ok'),()=>dupOpen())}catch(e){}
  try{const D=dnScan(),n=D.reduce((s,x)=>s+x.drop.length,0);add(!n,t('dn.t'),n?t('m16.n',n):t('m16.ok'),()=>dnOpen())}catch(e){}
  try{const D=nblScan(),n=D.reduce((s,x)=>s+x.miss.length,0);add(!n,t('nbl.t'),n?t('m16.n',n):t('m16.ok'),()=>nblOpen())}catch(e){}
  try{const R=m16LinkScan(),n=R.out.length;add(!n,t('m16.lkT'),n?t('m16.n',n):t('m16.ok')+(R.tree?'':' · '+t('m16.lkPart')),()=>m16LinkOpen())}catch(e){}
  try{const L_=await m16BigList(200),big=L_.reduce((a,o)=>a+o.big,0);add(!big,t('m16.bigT'),big?t('m16.zipN',big):t('m16.ok'),()=>m16BigOpen())}catch(e){}
  try{const o=await stwCheck();if(o)add(o.pc<=.8,t('m16.c.store'),t('stw.line',stwFmt(o.u),o.q?stwFmt(o.q):'—',Math.round(o.pc*100)),()=>openHealth())}catch(e){}
  try{const at=bk7Last(),d=at?Math.floor((Date.now()-at)/864e5):-1;add(d>=0&&d<=7,t('m16.c.bk'),d<0?t('m16.bkNone'):d===0?t('m16.bkToday'):t('m16.bkDays',d),()=>{$$('.modal.on').forEach(m=>m.classList.remove('on'));showView('set')})}catch(e){}
  try{const m=v2Migrated();add(m,t('m16.c.v2'),m?t('m16.ok'):t('m16.v2No'),()=>openHealth())}catch(e){}
  const bad=rows.filter(r=>!r.ok).length,box=$('#infoBox .infob');if(!box)return;
  box.innerHTML=`<div class="m16sum ${bad?'bad':''}">${bad?esc(t('m16.sumBad',bad,rows.length)):'✓ '+esc(t('m16.sumOk',rows.length))}</div><div class="m16al">${rows.map((r,i)=>`<div class="m16ar ${r.ok?'ok':'bad'}"><i>${r.ok?'✓':'!'}</i><div><b>${esc(r.label)}</b><small>${esc(r.val)}</small></div><button class="btn sm ${r.ok?'ghost':''}" data-m16a="${i}">${esc(t('m16.open'))}</button></div>`).join('')}</div>
    <div class="row" style="justify-content:flex-end"><button class="btn sm ghost" id="m16Again">↻ ${esc(t('m16.again'))}</button></div>`;
  box.querySelectorAll('[data-m16a]').forEach(b=>b.onclick=()=>rows[+b.dataset.m16a].run());$('#m16Again').onclick=m16AllOpen}

/* the buttons in Data health: the full check first, then the two new tools next to the older ones (and those, if a settings render never added them) */
{hookFn('openHealth',()=>openHealth,f=>{openHealth=f},'post',function(){let n=0;const go=()=>{const z=$('#imzBtn');if(!z){if(++n<60)setTimeout(go,100);return}
  try{if(!$('#dupBtn')){z.insertAdjacentHTML('afterend',`<button class="btn sm ghost" id="dupBtn">🧹 ${esc(t('dup.t'))}</button>`);$('#dupBtn').onclick=dupOpen}
    if(!$('#dnBtn')){$('#dupBtn').insertAdjacentHTML('afterend',`<button class="btn sm ghost" id="dnBtn">🧹 ${esc(t('dn.t'))}</button>`);$('#dnBtn').onclick=dnOpen}
    if(!$('#m16BigB')){$('#dnBtn').insertAdjacentHTML('afterend',`<button class="btn sm ghost" id="m16BigB">📊 ${esc(t('m16.bigT'))}</button><button class="btn sm ghost" id="m16LkB">🔗 ${esc(t('m16.lkT'))}</button>`);$('#m16BigB').onclick=m16BigOpen;$('#m16LkB').onclick=m16LinkOpen}
    const h=$('#infoBox h2');if(h&&!$('#m16AllB')){h.insertAdjacentHTML('afterend',`<button class="btn pri m16allb" id="m16AllB">🩺 ${esc(t('m16.allB'))}</button>`);$('#m16AllB').onclick=m16AllOpen}}catch(e){console.error(e)}};go()})}
{const _cc=cmdCommands;cmdCommands=function(...a){const L_=_cc(...a);try{L_.push({icon:'🩺',label:t('m16.allT'),run:()=>{m16AllOpen()},kw:'check health data فحص شامل صحة البيانات'},{icon:'🔗',label:t('m16.lkT'),run:()=>{m16LinkOpen()},kw:'broken links tasks روابط مكسورة'},{icon:'📊',label:t('m16.bigT'),run:()=>{m16BigOpen()},kw:'largest notes size حجم ملاحظات'})}catch(e){}return L_}}

/* 282 Today at once: after each Today render a copy of the page (ids renamed, nothing clickable) and the theme are kept in this browser;
   the loader in tail.html shows it and lets it paint before the app script runs, and the first real render below removes it.
   Not kept while the app lock is on, in presentation mode, in a demo or a solo window. */
const M16S={t:0},M16_TR=['navhide','ux8sh','lkscr','qread','privm','qfs','qfs-one','solo','qnote','lxside'];
function m16SnapOk(){try{return!lockCfg().on&&!S._demo&&!document.documentElement.classList.contains('privm')&&!document.documentElement.classList.contains('solo')&&S.settings.tdSnap!==false}catch(e){return false}}
function m16SnapSave(){try{if(!m16SnapOk()){localStorage.removeItem('thabat.tdSnap');return}const v=$('#v-today');if(!v||curView()!=='today'||$('#tdSnap'))return;
  const c=v.cloneNode(true);c.querySelectorAll('script,canvas,video,audio,iframe,input,textarea,select').forEach(e=>{if(/^(INPUT|TEXTAREA|SELECT)$/.test(e.tagName)){const s=document.createElement('span');s.className='m16fld';s.textContent=e.value||e.placeholder||'';e.replaceWith(s)}else e.remove()});
  c.querySelectorAll('[id]').forEach(e=>e.removeAttribute('id'));c.querySelectorAll('img').forEach(e=>{if(/^blob:/.test(e.getAttribute('src')||''))e.remove()});let h=c.innerHTML.replace(/\son\w+="[^"]*"/g,'');if(h.length>600000)return;
  const de=document.documentElement;const cls=[...de.classList].filter(k=>!M16_TR.includes(k)).join(' ');localStorage.setItem('thabat.tdSnap',JSON.stringify({at:Date.now(),d:new Date().toDateString(),h,cls,st:de.getAttribute('style')||'',bst:document.body.getAttribute('style')||'',dir:de.dir,lang:de.lang}))}catch(e){try{localStorage.removeItem('thabat.tdSnap')}catch(x){}}}
function m16SnapSoon(){clearTimeout(M16S.t);M16S.t=setTimeout(()=>{(window.requestIdleCallback||setTimeout)(m16SnapSave)},1800)}
function m16SnapDrop(){const s=document.getElementById('tdSnap');if(s){s.remove();const v=$('#v-today');if(v)v.classList.remove('m16snap')}}
{hookFn('renderToday',()=>renderToday,f=>{renderToday=f},'post',function(){m16SnapDrop();m16SnapSoon()})}
addEventListener('pagehide',m16SnapSave);document.addEventListener('visibilitychange',()=>{if(document.hidden)m16SnapSave()});
setTimeout(m16SnapDrop,0);
