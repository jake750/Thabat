/* ============ v3.164.0 thirteenth list H1: library — weekly lesson goal and finishing date, «needs a rewatch», the lesson's snapshots in order, lessons by length, stopped courses with a reason, archive, automatic covers ============ */
const LH1={lf:'',cq:[],cbusy:false,cov:{}};
function lh1L(){const L_=LIBS();if(!L_.meta)L_.meta={};return L_}
function lh1Wk0(){const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-((d.getDay()+6)%7));return d.getTime()}
/* 172/173: lessons a week per course, done this week, and the date you finish at that pace */
function lh1Goal(cid){return((lh1L().wkG||{})[cid])||0}
function lh1Info(cid){const node=lupNode(cid);if(!node)return null;const P=LIBS().prog,m=libMedia(node).filter(x=>x.k==='v'||x.k==='a'||!x.k),w0=lh1Wk0();
  const left=m.filter(x=>!(P[x.id]&&P[x.id].done)).length,wk=m.filter(x=>P[x.id]&&P[x.id].done&&(P[x.id].at||0)>=w0).length,g=lh1Goal(cid);
  let end=null;if(g&&left){const rest=Math.max(0,left-Math.max(0,g-wk)),d=new Date(w0);d.setDate(d.getDate()+7*Math.ceil(rest/g)+6);end=d}
  return{n:m.length,left,wk,g,end}}
function lh1GoalSet(cid){const g=lh1Goal(cid),v=prompt(t('lh1.gAsk'),g||3);if(v===null)return;const n=Math.max(0,Math.min(50,parseInt(String(v).replace(/[٠-٩]/g,c=>'٠١٢٣٤٥٦٧٨٩'.indexOf(c)),10)||0));const L_=lh1L();L_.wkG=L_.wkG||{};if(n)L_.wkG[cid]=n;else delete L_.wkG[cid];save();renderLib()}
function lh1WkHTML(cid){const i=lh1Info(cid);if(!i)return'';if(!i.g)return`<div class="lh1wk" id="lh1Wk"><span>${t('lh1.gNone')}</span><button class="btn sm" data-lh1g="1">${t('lh1.gSet')}</button></div>`;
  const pct=Math.min(100,Math.round(i.wk/i.g*100));return`<div class="lh1wk" id="lh1Wk"><div class="lh1wt"><b>${t('lh1.gLine',i.wk,i.g)}</b>${i.left?`<small>${t('lh1.eta',esc(gShort(i.end)+' '+i.end.getFullYear()),lxN(i.left))}</small>`:`<small>${t('lh1.allDone')}</small>`}</div><span class="lh1wb"><i style="width:${pct}%"></i></span><button class="btn sm ghost" data-lh1g="1" title="${esc(t('lh1.gSet'))}">✎</button></div>`}
/* 177: «needs a rewatch» */
function lh1Rw(id){return!!((lh1L().meta[id]||{}).rw)}
function lh1RwSet(id,on){const M=lh1L().meta,me=M[id]||(M[id]={});if(on)me.rw=Date.now();else delete me.rw;save();renderLib();toast(on?t('lh1.rwOn'):t('lh1.rwOff'))}
function lh1RwList(){const M=lh1L().meta;return Object.keys(M).filter(id=>M[id]&&M[id].rw).map(id=>({id,at:M[id].rw,it:libItem(id)})).filter(x=>x.it).sort((a,b)=>b.at-a.at)}
/* 196/197: stopped courses with a reason, and the archive */
function lh1Stop(cid){const L_=lh1L(),cur=(L_.stop||{})[cid];if(cur){delete L_.stop[cid];save();renderLib();toast(t('lh1.resumed'));return}
  const v=prompt(t('lh1.whyAsk'),'');if(v===null)return;L_.stop=L_.stop||{};L_.stop[cid]={why:v.trim().slice(0,200),at:Date.now()};save();renderLib();toast(t('lh1.stopped'))}
function lh1Arch(cid){const L_=lh1L();L_.arch=L_.arch||{};const was=L_.arch[cid];if(was)delete L_.arch[cid];else L_.arch[cid]=Date.now();save();if(!was&&LIB.open===cid)LIB.open=null;renderLib();
  toastAct(was?t('lh1.unarch'):t('lh1.arched'),t('lsh.undo'),()=>{if(was)L_.arch[cid]=was;else delete L_.arch[cid];save();renderLib()})}
function lh1Name(cid){const n=lupNode(cid);return n?(lrnName(cid)||n.n):cid}
/* the course «⋯» on a PC course page */
{const _lm=lshMenu;lshMenu=function(anchor,html,...a){const p=_lm(anchor,html,...a);try{if(anchor&&anchor.id==='lshPcM'&&p&&!p.querySelector('[data-lh1]')&&LIB.open){const cid=LIB.open,L_=lh1L(),st=(L_.stop||{})[cid],ar=(L_.arch||{})[cid];
  p.insertAdjacentHTML('beforeend',`<button data-lh1="g">🎯 ${t('lh1.gSet')}</button><button data-lh1="s">⏸ ${st?t('lh1.resume'):t('lh1.stop')}</button><button data-lh1="a">📦 ${ar?t('lh1.unarchB'):t('lh1.archB')}</button>`);
  p.querySelectorAll('[data-lh1]').forEach(b=>b.onclick=()=>{closePP();const k=b.dataset.lh1;if(k==='g')lh1GoalSet(cid);else if(k==='s')lh1Stop(cid);else lh1Arch(cid)})}}catch(e){console.error(e)}return p}}
/* the lesson «⋯» */
{const _m=lshItemMenu;lshItemMenu=function(anchor,ref,...a){const p=_m(anchor,ref,...a);try{const pp=$('#ppPop');if(pp&&ref&&ref.t==='m'&&!pp.querySelector('[data-lh1rw]')){const on=lh1Rw(ref.id);pp.insertAdjacentHTML('beforeend',`<button data-lh1rw="1">↺ ${on?t('lh1.rwX'):t('lh1.rwB')}</button>`);pp.querySelector('[data-lh1rw]').onclick=()=>{closePP();lh1RwSet(ref.id,!on)}}}catch(e){}return p}}
/* 180: lessons of the course by length */
const LH1_LF={s:[0,600],m:[600,1800],l:[1800,1e9]};
function lh1LfPaint(box){const rows=[...box.querySelectorAll('.lbl[data-play]')];if(rows.length<4){const b=$('#lh1Lf');if(b)b.remove();return}
  let bar=$('#lh1Lf');if(!bar){const first=$('#ldurBar')||rows[0];first.insertAdjacentHTML('beforebegin',`<div class="lh1lf" id="lh1Lf" role="group" aria-label="${esc(t('lh1.lf'))}"></div>`);bar=$('#lh1Lf')}
  const cnt=k=>rows.filter(r=>{const d=ldurOf(r.dataset.play);return d&&d>=LH1_LF[k][0]&&d<LH1_LF[k][1]}).length;
  bar.innerHTML=`<small>${t('lh1.lf')}</small>`+['','s','m','l'].map(k=>`<button class="chip${LH1.lf===k?' on':''}" data-lh1lf="${k}">${t('lh1.lf'+(k||'A'))}${k?` <small>${cnt(k)}</small>`:''}</button>`).join('');
  bar.querySelectorAll('[data-lh1lf]').forEach(b=>b.onclick=()=>{LH1.lf=b.dataset.lh1lf;lh1LfPaint(box)});
  rows.forEach(r=>{let hide=false;if(LH1.lf){const d=ldurOf(r.dataset.play),R=LH1_LF[LH1.lf];hide=!d||d<R[0]||d>=R[1]}r.classList.toggle('lh1hid',hide)});
  box.querySelectorAll('.lbch').forEach(h=>{let n=h.nextElementSibling,any=false;while(n&&!n.classList.contains('lbch')){if(n.matches('.lbl[data-play]')&&!n.classList.contains('lh1hid'))any=true;n=n.nextElementSibling}h.classList.toggle('lh1hid',!!LH1.lf&&!any)})}
/* 198: a cover from the middle of the first lesson, kept on this device */
async function lh1CovGet(cid){if(cid in LH1.cov)return LH1.cov[cid];let d=null;try{d=await idbGet('lh1cov:'+cid)}catch(e){}LH1.cov[cid]=d||null;return d}
function lh1CovQ(cid){if(LH1.cq.includes(cid))return;LH1.cq.push(cid);lh1CovRun()}
async function lh1CovRun(){if(LH1.cbusy||!LH1.cq.length||!LIB.base)return;LH1.cbusy=true;const cid=LH1.cq.shift();try{const node=lupNode(cid),first=node&&libMedia(node).find(x=>x.k==='v');if(first){
  const d=await new Promise(res=>{const v=document.createElement('video');v.muted=true;v.preload='auto';v.crossOrigin='anonymous';v.playsInline=true;let done=false;const fin=x=>{if(done)return;done=true;clearTimeout(tm);v.removeAttribute('src');v.load();res(x)};const tm=setTimeout(()=>fin(null),20000);
    v.onloadedmetadata=()=>{try{v.currentTime=(isFinite(v.duration)&&v.duration>0?v.duration:20)/2}catch(e){fin(null)}};v.onseeked=()=>{try{const c=document.createElement('canvas');c.width=480;c.height=270;const x=c.getContext('2d'),r=Math.max(480/(v.videoWidth||16),270/(v.videoHeight||9)),w=(v.videoWidth||16)*r,h=(v.videoHeight||9)*r;x.fillStyle='#000';x.fillRect(0,0,480,270);x.drawImage(v,(480-w)/2,(270-h)/2,w,h);fin(c.toDataURL('image/jpeg',.8))}catch(e){fin(null)}};v.onerror=()=>fin(null);v.src=libU('/f?id='+first.id)});
  if(d){LH1.cov[cid]=d;try{await idbSet('lh1cov:'+cid,d)}catch(e){}lh1CovPaint()}else{LH1.cov[cid]='';try{await idbSet('lh1cov:'+cid,'')}catch(e){}}}}catch(e){}LH1.cbusy=false;if(LH1.cq.length)setTimeout(lh1CovRun,400)}
function lh1CovPaint(){$$('#libBox [data-card^="d:"]').forEach(async c=>{const cid=c.dataset.card.slice(2);if((lshMeta(cid)||{}).cover)return;const cv=c.querySelector('.lshcv');if(!cv||cv.querySelector('img.lh1cv'))return;const d=await lh1CovGet(cid);
  if(d){const old=cv.querySelector('img');if(old)old.remove();cv.insertAdjacentHTML('afterbegin',`<img class="lh1cv" src="${d}" alt="">`)}else if(d===null&&LIB.base)lh1CovQ(cid)})}
/* the library pages */
{hookFn('renderLib',()=>renderLib,f=>{renderLib=f},'post',function(){try{const box=$('#libBox');if(!box)return;const L_=lh1L(),M=L_.meta,st=L_.stop||{},ar=L_.arch||{};
  /* rows: the «rewatch» mark */
  box.querySelectorAll('.lbl[data-play]').forEach(r=>{if(lh1Rw(r.dataset.play)&&!r.querySelector('.lh1rwb')){const tb=r.querySelector('.lbt b')||r.querySelector('.lbt');if(tb)tb.insertAdjacentHTML('afterend',`<span class="lh1rwb">↺ ${t('lh1.rw')}</span>`)}});
  const cid=LIB.open;
  if(cid&&!String(cid).includes(':')&&lupNode(cid)){
    if(!$('#lh1Wk')){const anc=$('#lxFin')||$('#lpath');if(anc){anc.insertAdjacentHTML('afterend',lh1WkHTML(cid));const b=$('#lh1Wk');if(b)b.querySelectorAll('[data-lh1g]').forEach(x=>x.onclick=()=>lh1GoalSet(cid))}}
    if(st[cid]&&!$('#lh1StB')){const w=$('#lh1Wk')||$('#lpath');if(w)w.insertAdjacentHTML('afterend',`<div class="lh1stb" id="lh1StB"><span>⏸ ${t('lh1.stopSince',esc(gShort(new Date(st[cid].at))))}${st[cid].why?` — <i dir="auto">${esc(st[cid].why)}</i>`:''}</span><button class="btn sm" id="lh1Res">${t('lh1.resume')}</button></div>`);const rb=$('#lh1Res');if(rb)rb.onclick=()=>lh1Stop(cid)}
    if(ar[cid]&&!$('#lh1ArB')){const w=$('#lpath');if(w)w.insertAdjacentHTML('afterend',`<div class="lh1stb" id="lh1ArB"><span>📦 ${t('lh1.inArch')}</span><button class="btn sm" id="lh1Ua">${t('lh1.unarchB')}</button></div>`);const ub=$('#lh1Ua');if(ub)ub.onclick=()=>lh1Arch(cid)}
    lh1LfPaint(box)}else LH1.lf='';
  if(!LIB.open){
    /* archived courses leave the home; stopped ones leave «paused» */
    box.querySelectorAll('[data-card^="d:"],[data-course]').forEach(c=>{const id=c.dataset.course||String(c.dataset.card).slice(2);if(ar[id])c.classList.add('lh1hid')});
    $$('#lxPaused [data-lxk="c"]').forEach(b=>{if(st[b.dataset.lxi]||ar[b.dataset.lxi])b.remove()});const lp=$('#lxPaused');if(lp&&!lp.querySelector('[data-lxk]'))lp.remove();
    const anchor=box.querySelector('.lshh');
    const S_=Object.keys(st).filter(id=>!ar[id]&&lupNode(id));if(S_.length&&anchor&&!$('#lh1St')){anchor.insertAdjacentHTML('beforebegin',`<div id="lh1St"><h4 class="lbfh">⏸ ${t('lh1.stT',S_.length)}</h4><div class="lbcw">${S_.map(id=>`<button class="lbcwi lh1sti" data-lh1o="${esc(id)}"><b dir="auto">🎬 ${esc(lh1Name(id))}</b><small dir="auto">${st[id].why?esc(st[id].why):t('lh1.noWhy')}</small><small>${t('lx.since',crxDays(Math.max(0,Math.floor((Date.now()-st[id].at)/864e5))))}</small></button>`).join('')}</div></div>`)}
    const R=lh1RwList();if(R.length&&anchor&&!$('#lh1Rw')){anchor.insertAdjacentHTML('beforebegin',`<div id="lh1Rw"><h4 class="lbfh">↺ ${t('lh1.rwT',R.length)}</h4><div class="lbcw">${R.slice(0,12).map(x=>`<span class="lh1rwi"><button class="lbcwi" data-play="${x.id}"><b dir="auto">${esc(lrnName(x.id)||libTitle(x.it.n||''))}</b><small dir="auto">${esc(lh1Name(x.it.course&&x.it.course.id))}</small></button><button class="lh1rwx" data-lh1rx="${x.id}" title="${esc(t('lh1.rwX'))}" aria-label="${esc(t('lh1.rwX'))}">✕</button></span>`).join('')}</div></div>`)}
    const A=Object.keys(ar).filter(id=>lupNode(id));if(A.length&&!$('#lh1Ar')){const host=box.querySelector('.lshh:last-of-type')||anchor;const tail=host?host.parentElement:box;tail.insertAdjacentHTML('beforeend',`<details id="lh1Ar" class="lxarc"><summary>📦 ${t('lh1.arT',A.length)}</summary><div class="lxarcl">${A.map(id=>`<button class="lxarci" data-lh1o="${esc(id)}"><b dir="auto">${esc(lh1Name(id))}</b><small>${t('lh1.archAt',esc(gShort(new Date(ar[id]))))}</small></button>`).join('')}</div></details>`)}
    box.querySelectorAll('[data-lh1o]').forEach(b=>b.onclick=()=>{LIB.open=b.dataset.lh1o;renderLib()});
    box.querySelectorAll('[data-lh1rx]').forEach(b=>b.onclick=e=>{e.stopPropagation();lh1RwSet(b.dataset.lh1rx,false)});
    lh1CovPaint()}
  }catch(e){console.error(e)}})}
/* 179: snapshots keep their second, and the lesson note shows them in time order */
{const _s=lxsShot;lxsShot=async function(...a){const it=LIB.cur,v=$('#lvV'),sec=v?v.currentTime||0:0,before=it&&lpvNoteOf(it.id)?(lpvNoteOf(it.id).imgs||[]).slice():[];const r=await _s(...a);
  try{const n=it&&lpvNoteOf(it.id);if(n){const nw=(n.imgs||[]).filter(x=>!before.includes(x));if(nw.length){n.shotT=n.shotT||{};nw.forEach(id=>n.shotT[id]=Math.round(sec));save()}}}catch(e){}return r}}
function lh1Shots(n){const T=n.shotT||{},ids=(n.imgs||[]).slice();const timed=[],rest=[];
  /* older snapshots without a stored second: the k-th «📷» line goes with the k-th untimed picture */
  const lines=[];String(n.body||'').replace(LPV_RE,(m,tc,tx)=>{if(/📷/.test(tx)){const p=tc.split(':').map(Number);lines.push(p.length===3?p[0]*3600+p[1]*60+p[2]:p[0]*60+p[1])}return m});LPV_RE.lastIndex=0;
  const untimed=ids.filter(id=>!(id in T));const lt=lines.slice(0);
  ids.forEach(id=>{if(id in T)timed.push({id,s:T[id]})});
  const usedSec=new Set(timed.map(x=>x.s));const freeLines=lt.filter(s=>!usedSec.has(s));untimed.forEach((id,i)=>{if(i<freeLines.length)timed.push({id,s:freeLines[i]});else rest.push({id,s:-1})});
  return timed.sort((a,b)=>a.s-b.s).concat(rest)}
{hookFn('neShowMode',()=>neShowMode,f=>{neShowMode=f},'post',function(){try{const old=$('#lh1Gal');if(old)old.remove();if(!NE._view)return;const n=NOTES().find(x=>x.id===NE.id);if(!n||!n.lib||!(n.imgs||[]).length)return;const pv=$('#nePrev');if(!pv)return;
  const S_=lh1Shots(n);if(!S_.length)return;pv.insertAdjacentHTML('afterbegin',`<div class="lh1gal" id="lh1Gal"><h4>📷 ${t('lh1.galT',S_.length)}</h4><div class="lh1gg">${S_.map((x,i)=>`<figure class="lh1gf"><button class="lh1gi" data-lh1i="${i}" aria-label="${esc(t('lh1.galOpen'))}"><img alt="" data-lh1im="${x.id}"></button><figcaption>${x.s>=0?`<button class="lh1gt" data-lh1s="${x.s}" title="${esc(t('lh1.galGo'))}">▶ ${fmtTC(x.s)}</button>`:''}</figcaption></figure>`).join('')}</div></div>`);
  const g=$('#lh1Gal');g.querySelectorAll('img[data-lh1im]').forEach(async im=>{const id=im.dataset.lh1im;let d=(typeof nImgMem!=='undefined'&&nImgMem[id])||null;if(!d){try{d=await idbGet('nimg:'+id)}catch(e){}if(d&&typeof nImgMem!=='undefined')nImgMem[id]=d}if(d)im.src=d});
  g.querySelectorAll('[data-lh1i]').forEach(b=>b.onclick=()=>lbOpen(S_.map(x=>x.id),+b.dataset.lh1i,n.title||''));
  g.querySelectorAll('[data-lh1s]').forEach(b=>b.onclick=()=>lpvOpenAt(n.lib,+b.dataset.lh1s))}catch(e){console.error(e)}})}
