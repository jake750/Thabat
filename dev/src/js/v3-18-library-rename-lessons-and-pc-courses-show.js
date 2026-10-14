/* ============ v3.18: library — rename lessons and PC courses (shown name only; files on the PC keep their names), back/forward between the pages, and the full path on top that you can drop things on ============ */
/* names: S.lib.meta[id].n; the tree keeps the real names, so the order of lessons (sorted by file name) never changes */
function lrnName(id){const m=LIBS().meta[id];return m&&m.n||''}
function lrnAsk(id){const node=libFind(id);if(!node)return;const isDir=node.k==='d',orig=isDir?node.n:libTitle(node.n),cur=lrnName(id)||orig;
  const v=prompt(t('lrn.ask',orig),cur);if(v===null)return;const n=v.trim(),L_=LIBS();L_.meta[id]=L_.meta[id]||{};
  if(!n||n===orig)delete L_.meta[id].n;else L_.meta[id].n=n;save();renderLib();toast(n&&n!==orig?t('lrn.done'):t('lrn.reset'))}
/* the player, «continue», saved progress and the media log read their names from libItem */
{const _li=libItem;libItem=function(id){const it=_li(id);if(!it)return it;const n=lrnName(it.id);if(n)it.n=n+(/\.[^.]+$/.exec(it.n)||['.x'])[0];const cn=lrnName(it.course.id);if(cn)it.course={...it.course,n:cn};return it}}
function lrnPaint(){const box=$('#v-lib');if(!box)return;const meta=LIBS().meta||{};
  box.querySelectorAll('.lbl[data-play]').forEach(r=>{const n=meta[r.dataset.play]&&meta[r.dataset.play].n,b=r.querySelector('.lbt b');if(n&&b)b.textContent=n});
  box.querySelectorAll('.lbcont[data-play]').forEach(r=>{const n=meta[r.dataset.play]&&meta[r.dataset.play].n,s=r.querySelector('span');if(n&&s)s.textContent=n});
  box.querySelectorAll('[data-card^="d:"]').forEach(c=>{const n=lrnName(c.dataset.card.slice(2)),b=c.querySelector(':scope > b');if(n&&b)b.textContent=n});
  box.querySelectorAll('[data-course]').forEach(c=>{const n=lrnName(c.dataset.course),b=c.querySelector('b');if(n&&b)b.textContent=n});
  const o=String(LIB.open||'');if(o&&!o.startsWith('f:')&&!o.startsWith('au:')){const n=lrnName(o),b=box.querySelector('.lbbar > b');if(n&&b)b.textContent=n}}
/* «✏ rename» at the top of the «⋯» menu of a lesson and of a PC course */
const LRN={next:null};
{const _im=lshItemMenu;lshItemMenu=function(anchor,ref,inF){LRN.next=ref;try{return _im(anchor,ref,inF)}finally{LRN.next=null}}}
{const _m=lshMenu;lshMenu=function(a,html){const r=LRN.next;LRN.next=null;if(r&&(r.t==='m'||r.t==='d')&&libFind(r.id))html=`<button data-lrn="1">✏ ${t('lsh.rename')}</button>`+html;const p=_m(a,html);const b=p&&p.querySelector('[data-lrn]');if(b)b.onclick=()=>{closePP();lrnAsk(r.id)};return p}}
{hookFn('lshPcCourseExtras',()=>lshPcCourseExtras,f=>{lshPcCourseExtras=f},'post',function(){const b=$('#lshPcM');if(b&&!b.dataset.lrn){b.dataset.lrn=1;const h=b.onclick;b.onclick=e=>{LRN.next={t:'d',id:LIB.open};h(e)}}})}
/* back / forward: every change of LIB.open is a step */
const LNAV={back:[],fwd:[],cur:undefined,jump:false};
function lnavGo(d){const from=d<0?LNAV.back:LNAV.fwd,to=d<0?LNAV.fwd:LNAV.back;if(!from.length)return;to.push(LNAV.cur||'');const o=from.pop();LNAV.jump=true;LIB.open=o||null;LIBX.q='';try{renderLib()}finally{LNAV.jump=false}const m=$('main');if(m)m.scrollTop=0}
/* the path: Library › folder › sub-folder …, or Library › 💻 PC › course, or Library › 🎧 Audio › folder … */
function lpathSegs(){const o=String(LIB.open||''),segs=[{n:'🎬 '+t('nav.lib'),k:'root'}];
  if(o.startsWith('f:'))lshPath(o.slice(2)).forEach(f=>segs.push({n:'📁 '+f.n,k:'f:'+f.id}));
  else if(o.startsWith('au:')){segs.push({n:'🎧 '+t('au.t'),k:'au:'});const r=o.slice(3);
    if(r.startsWith('f:')){const ch=[];let f=auF(r.slice(2)),g=0;while(f&&g++<30){ch.unshift(f);f=f.parent?auF(f.parent):null}ch.forEach(x=>segs.push({n:'📁 '+x.n,k:'au:f:'+x.id}))}
    else if(r.startsWith('p:')){const p=auP(r.slice(2));if(p)segs.push({n:'🎶 '+p.n,k:'au:p:'+p.id})}}
  else if(o){const walk=(nodes,acc)=>{for(const n of nodes||[]){if(n.id===o)return acc.concat(n);if(n.c){const r=walk(n.c,acc.concat(n));if(r)return r}}return null};const ch=walk(LIB.tree,[])||[];
    ch.forEach((n,i)=>segs.push({n:(i?'':'💻 ')+(lrnName(n.id)||n.n),k:i===ch.length-1?o:'',pc:1}))}
  return segs}
function lpathHTML(){const segs=lpathSegs(),rtl=document.documentElement.dir==='rtl',cur=String(LIB.open||'');
  return`<div class="lpath" id="lpath"><button class="lpnav" id="lpBack" ${LNAV.back.length?'':'disabled'} title="${esc(t('lp.back'))} (Alt+${rtl?'→':'←'})" aria-label="${esc(t('lp.back'))}">${rtl?'→':'←'}</button><button class="lpnav" id="lpFwd" ${LNAV.fwd.length?'':'disabled'} title="${esc(t('lp.fwd'))} (Alt+${rtl?'←':'→'})" aria-label="${esc(t('lp.fwd'))}">${rtl?'←':'→'}</button>
    <nav class="lpsegs" aria-label="${esc(t('lp.where'))}">${segs.map((s,i)=>{const last=i===segs.length-1;return(i?`<span class="lpsep" aria-hidden="true">${rtl?'‹':'›'}</span>`:'')+(s.k&&!last?`<button class="lpseg" data-lpath="${esc(s.k)}" dir="auto">${esc(s.n)}</button>`:`<span class="lpseg ${last?'cur':''}" ${s.k&&s.k===cur||last?`data-lpath="${esc(s.k||'')}"`:''} dir="auto" ${last?'aria-current="page"':''}>${esc(s.n)}</span>`)}).join('')}</nav></div>`}
function lpathMount(){const box=$('#libBox');if(!box)return;const old=$('#lpath');if(old)old.remove();box.insertAdjacentHTML('afterbegin',lpathHTML());
  $('#lpBack').onclick=()=>lnavGo(-1);$('#lpFwd').onclick=()=>lnavGo(1);
  $$('#lpath button[data-lpath]').forEach(b=>b.onclick=()=>{const k=b.dataset.lpath;LIB.open=k==='root'?null:k;LIBX.q='';renderLib();const m=$('main');if(m)m.scrollTop=0});
  const sg=$('#lpath .lpsegs');if(sg)sg.scrollLeft=document.documentElement.dir==='rtl'?-sg.scrollWidth:sg.scrollWidth}
/* outermost renderLib: record the step, apply names, draw the path */
{const _rl=renderLib;renderLib=function(){const o=String(LIB.open||'');if(LNAV.cur!==undefined&&o!==LNAV.cur&&!LNAV.jump){LNAV.back.push(LNAV.cur);if(LNAV.back.length>60)LNAV.back.shift();LNAV.fwd=[]}LNAV.cur=o;
  const r=_rl();try{lrnPaint();lpathMount()}catch(e){console.error(e)}return r}}
/* path segments are drop targets: a shelf folder, the library root, the audio home, an audio folder or a playlist */
{const _tg=ldTarget;ldTarget=function(el){const s=el&&el.closest&&el.closest('#lpath [data-lpath]');if(s){const k=s.dataset.lpath;
    if(k==='root')return{k:'sf',id:null,el:s};if(k.startsWith('f:'))return{k:'sf',id:k.slice(2),el:s};if(k==='au:')return{k:'af',id:null,el:s};if(k.startsWith('au:f:'))return{k:'af',id:k.slice(5),el:s};if(k.startsWith('au:p:'))return{k:'pl',id:k.slice(5),el:s};return null}
  return _tg(el)}}
/* keys and mouse buttons: Alt+←/→ and the mouse back/forward buttons while the library is open */
document.addEventListener('keydown',e=>{if(!e.altKey||curView()!=='lib'||e.target.closest&&e.target.closest('input,textarea'))return;const rtl=document.documentElement.dir==='rtl';
  if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();lnavGo((e.key==='ArrowLeft')!==rtl?-1:1)}});
document.addEventListener('mouseup',e=>{if(curView()!=='lib'||(e.button!==3&&e.button!==4))return;e.preventDefault();lnavGo(e.button===3?-1:1)});
/* Android back: one step back in the library before leaving it */
{const _tb=window.thabatBack;window.thabatBack=function(){if(curView()==='lib'&&LNAV.back.length&&!$('.modal.on')&&!$('#bkReader.on')&&!$('#libPlayer.on')&&!$('#ppPop')){lnavGo(-1);return true}return _tb?_tb():false}}

