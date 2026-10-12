/* ============ v3.21: the recordings pill gets previous/next and can be dragged anywhere; «watched & listened» can show only what counted toward productivity, or only what did not; books and project files move into library folders like everything else ============ */
/* ---- the recordings pill ---- */
function rcSeq(){const q=RCX.queue;return q&&q.includes(RCX.cur)?q.filter(auRec):RCL().map(r=>r.id)}
function rcStep(dir){const a=RCX.el;if(!a||!RCX.cur)return;if(dir<0&&a.currentTime>3){a.currentTime=0;return}const L_=rcSeq(),i=L_.indexOf(RCX.cur),j=i+dir;if(i<0||j<0||j>=L_.length){toast(t(dir<0?'rcp.first':'rcp.last'));return}rcPlay(L_[j])}
/* the pill is built once per recording and only its texts change while it plays, so a click never lands on a button that was just replaced */
function rcPillUI(){const a=RCX.el,r=RCL().find(x=>x.id===RCX.cur),pill=$('#rcPill');if(!pill)return;const show=!!r&&!$('#rcModal').classList.contains('on');pill.hidden=!show;if(!show)return;
  const L_=rcSeq(),i=L_.indexOf(RCX.cur),sig=r.id+'|'+LANG+'|'+r.title;
  if(pill.dataset.sig!==sig){pill.dataset.sig=sig;pill.innerHTML=`<span class="rcpgrip" aria-hidden="true">⠿</span><span class="rcpctl" dir="ltr"><button data-p="prev" aria-label="${esc(t('rcp.prev'))}" title="${esc(t('rcp.prev'))}">⏮</button><button class="rcppp" data-p="pp" aria-label="${esc(t('lpv.play'))}"></button><button data-p="next" aria-label="${esc(t('rcp.next'))}" title="${esc(t('rcp.next'))}">⏭</button></span><span class="rcpt" dir="auto" data-p="open">🎙 ${esc(r.title)}</span><small dir="ltr"></small><button data-p="x" aria-label="✕">✕</button>`;
    pill.querySelectorAll('[data-p]').forEach(b=>b.onclick=e=>{if(Date.now()-RCPD.moved<350){e.preventDefault();return}const p=b.dataset.p;if(p==='pp')a.paused?a.play():a.pause();else if(p==='x')rcStop();else if(p==='prev')rcStep(-1);else if(p==='next')rcStep(1);else openRecits()})}
  pill.querySelector('.rcppp').textContent=a.paused?'▶':'⏸';pill.querySelector('small').textContent=rcFmt(a.currentTime);pill.querySelector('[data-p="next"]').disabled=i<0||i>=L_.length-1;rcPillPlace()}
/* dragging: anywhere on the pill except its buttons; the place is kept per device */
const RCPD={moved:0};
function rcPillPos(){try{return JSON.parse(localStorage.getItem('thabat.rcPill')||'null')}catch(e){return null}}
function rcPillPlace(){const pill=$('#rcPill'),p=rcPillPos();if(!pill||pill.hidden)return;if(!p){pill.classList.remove('rcpfree');pill.style.left=pill.style.top='';return}
  const z=uiZoom(),W=innerWidth/z,H=innerHeight/z,w=pill.offsetWidth,h=pill.offsetHeight;pill.classList.add('rcpfree');pill.style.left=Math.max(4,Math.min(W-w-4,p.x*W-w/2))+'px';pill.style.top=Math.max(4,Math.min(H-h-4,p.y*H-h/2))+'px'}
{const pill=$('#rcPill');if(pill){
  pill.addEventListener('pointerdown',e=>{if(e.button>0||e.target.closest('button'))return;const z=uiZoom(),r=pill.getBoundingClientRect(),x0=e.clientX,y0=e.clientY,dx=x0-(r.left+r.width/2),dy=y0-(r.top+r.height/2);let on=false;
    const mv=ev=>{if(!on&&Math.hypot(ev.clientX-x0,ev.clientY-y0)<6)return;if(!on){on=true;pill.classList.add('rcpdrag');try{pill.setPointerCapture(e.pointerId)}catch(_){}}ev.preventDefault();
      const cx=(ev.clientX-dx),cy=(ev.clientY-dy);try{localStorage.setItem('thabat.rcPill',JSON.stringify({x:Math.max(0,Math.min(1,cx/innerWidth)),y:Math.max(0,Math.min(1,cy/innerHeight))}))}catch(_){}rcPillPlace()};
    const up=()=>{pill.removeEventListener('pointermove',mv);pill.removeEventListener('pointerup',up);pill.removeEventListener('pointercancel',up);if(on){RCPD.moved=Date.now();pill.classList.remove('rcpdrag')}};
    pill.addEventListener('pointermove',mv);pill.addEventListener('pointerup',up);pill.addEventListener('pointercancel',up)});
  pill.addEventListener('click',e=>{if(Date.now()-RCPD.moved<350){e.preventDefault();e.stopPropagation()}},true);
  /* double click / double tap on the grip puts it back in its corner */
  pill.addEventListener('dblclick',e=>{if(e.target.closest('button'))return;try{localStorage.removeItem('thabat.rcPill')}catch(_){}rcPillPlace()});
  addEventListener('resize',()=>rcPillPlace())}}
/* the full player window gets ⏮ ⏭ too */
{const _rr=renderRecits;renderRecits=function(...x){const r=_rr(...x);try{const pp=$('#rcbPP');if(pp&&!$('#rcbPrev')){pp.insertAdjacentHTML('beforebegin',`<button class="btn sm ghost" id="rcbPrev" aria-label="${esc(t('rcp.prev'))}" title="${esc(t('rcp.prev'))}">⏮</button>`);pp.insertAdjacentHTML('afterend',`<button class="btn sm ghost" id="rcbNext" aria-label="${esc(t('rcp.next'))}" title="${esc(t('rcp.next'))}">⏭</button>`);$('#rcbPrev').onclick=()=>rcStep(-1);$('#rcbNext').onclick=()=>rcStep(1)}}catch(e){console.error(e)}return r}}
try{if('mediaSession' in navigator){navigator.mediaSession.setActionHandler('previoustrack',()=>{if(RCX.cur)rcStep(-1)});navigator.mediaSession.setActionHandler('nexttrack',()=>{if(RCX.cur)rcStep(1)})}}catch(e){}

/* ---- «watched & listened»: all / counted toward productivity / not counted ---- */
const MF={use:false};
function mfCounted(m,dk){if(m.counted)return true;const d=S.days[dk];return!!(d&&(d.sessions||[]).some(s=>s.mediaId===m.id))}
function mfMode(){const v=S.settings.mFilter;return v==='prod'||v==='free'?v:'all'}
function mfOk(m,dk){if(!MF.use)return true;const f=mfMode();return f==='all'||(f==='prod')===mfCounted(m,dk)}
function mfBar(keys,id){const c={all:[0,0],prod:[0,0],free:[0,0]};keys.forEach(k=>((S.days[k]||{}).media||[]).forEach(m=>{const g=mfCounted(m,k)?'prod':'free';c[g][0]++;c[g][1]+=m.minutes||0;c.all[0]++;c.all[1]+=m.minutes||0}));
  const f=mfMode();return`<div class="mfbar" id="${id}" role="group" aria-label="${esc(t('mf.label'))}">${['all','prod','free'].map(k=>`<button class="${f===k?'on':''}" data-mf="${k}" aria-pressed="${f===k}">${t('mf.'+k)} <small>${c[k][0]?c[k][0]+' · '+fmtHM(c[k][1]*6e4):'0'}</small></button>`).join('')}</div>`}
function mfBind(id,re){const b=$('#'+id);if(b)b.querySelectorAll('[data-mf]').forEach(x=>x.onclick=()=>{S.settings.mFilter=x.dataset.mf;save();re()})}
function mfRerender(){try{renderMedia()}catch(e){}try{if($('#bMedia'))renderBrief()}catch(e){}try{if($('#mlogSheet.on')&&mlTab==='log')renderMlog()}catch(e){}}
/* the grouping functions skip what the filter hides, but only while one of these lists is drawn (search and other users stay complete) */
{const _vg=vcGroups;vcGroups=function(keys,...x){if(!MF.use)return _vg(keys,...x);const bak={};keys.forEach(k=>{const d=S.days[k];if(d&&d.media){bak[k]=d.media;d.media=d.media.filter(m=>mfOk(m,k))}});try{return _vg(keys,...x)}finally{for(const k in bak)S.days[k].media=bak[k]}}}
{const _mg=mlogGroups;mlogGroups=function(...x){if(!MF.use)return _mg(...x);const bak={};for(const k in S.days){const d=S.days[k];if(d&&d.media&&d.media.length){bak[k]=d.media;d.media=d.media.filter(m=>mfOk(m,k))}}try{return _mg(...x)}finally{for(const k in bak)S.days[k].media=bak[k]}}}
/* Today */
{const _rm=renderMedia;renderMedia=function(...x){const r=_rm(...x);try{const ul=$('#mediaList');if(!ul)return r;const k=todayKey(),d=day(k);let bar=$('#mfToday');if(bar)bar.remove();
  if(d.media.length){ul.insertAdjacentHTML('beforebegin',mfBar([k],'mfToday'));mfBind('mfToday',mfRerender);const f=mfMode();
    if(f!=='all'){const ok=new Set(d.media.filter(m=>(f==='prod')===mfCounted(m,k)).map(m=>m.id));ul.querySelectorAll('.mitem').forEach(li=>{const b=li.querySelector('[data-id]');if(b&&!ok.has(b.dataset.id))li.remove()});if(!ul.querySelector('.mitem'))ul.insertAdjacentHTML('beforeend',`<div class="empty">${t('mf.none')}</div>`)}
    else ul.querySelectorAll('.mitem').forEach(li=>{const b=li.querySelector('[data-id]'),m=b&&d.media.find(z=>z.id===b.dataset.id);if(m&&mfCounted(m,k)&&!li.querySelector('.mfp'))li.querySelector('.mt b').insertAdjacentHTML('afterbegin',`<span class="mfp" title="${esc(t('mf.prod'))}">⏱</span> `)})}}catch(e){console.error(e)}return r}}
/* Summary */
{const _rb=renderBrief;renderBrief=function(...x){MF.use=true;let r;try{r=_rb(...x)}finally{MF.use=false}try{const box=$('#bMedia');if(box&&box.querySelector('.mtiles')){const keys=periodKeys(bMode,bAnchor);box.querySelector('.mtiles').insertAdjacentHTML('afterend',mfBar(keys,'mfBrief'));mfBind('mfBrief',mfRerender);
    const vb=$('#vcMore');if(vb&&!vcAll){MF.use=true;const nf=vcGroups(keys).length;MF.use=false;vb.textContent=t('mf.showAll',nf)}
    if(box.querySelector('.vcg')&&!box.querySelector('.vcard'))box.querySelector('.vcg').outerHTML=`<div class="empty">${t('mf.none')}</div>`}}catch(e){console.error(e)}return r}}
/* the log sheet */
{const _ml=renderMlog;renderMlog=function(...x){MF.use=true;let r;try{r=_ml(...x)}finally{MF.use=false}try{const b=$('#mlogBody');if(b){b.insertAdjacentHTML('afterbegin',mfBar(Object.keys(S.days),'mfLog'));mfBind('mfLog',mfRerender)}}catch(e){console.error(e)}return r}}

/* ---- the library: books and project files go into folders too ---- */
/* folder items: {t:'b',id:<book key>} (a PC PDF 'p:<id>' or a book on this device 'l:<id>') and {t:'f',id:<PC file id>} */
function lxBook(key){return bkAll().find(b=>b.key===key)}
function lxFileSrc(row){const b=row.querySelector('[data-open],[data-dl]');if(!b)return null;const id=b.dataset.open||b.dataset.dl,n=libFind(id);if(n&&/\.pdf$/i.test(n.n))return{t:'b',id:'p:'+id};return{t:'f',id}}
function lxFolderExtras(fid){const f=lshGet(fid);if(!f)return'';const its=f.items||[],bks=its.filter(r=>r.t==='b').map(r=>lxBook(r.id)).filter(Boolean),fls=its.filter(r=>r.t==='f').map(r=>libFind(r.id)).filter(Boolean),st=BKS();
  return(bks.length?`<h4 class="lbfh">📚 ${t('bk.books')}</h4><div class="bkgrid lxbk">${bks.map(b=>bkCard(b,true)).join('')}</div>`:'')
   +(fls.length?`<h4 class="lbfh">📎 ${t('lb.files')}</h4><div class="lbfs lxfs">${fls.map(n=>`<div class="lbf" data-file="${n.id}"><span dir="auto">${esc(n.n)}<small>${fmtSz(n.s)}</small></span>${LIB.via==='pc'?`<button class="btn sm" data-open="${n.id}">${t('lb.open')}</button><button class="btn sm ghost" data-reveal="${n.id}">📂</button>`:LIB.base?`<button class="btn sm" data-dl="${n.id}" data-n="${esc(n.n)}" data-s="${n.s}">⤓ ${t('lb.dl')}</button>`:''}<button class="lshm" data-lxrm="${n.id}" title="${esc(t('lx.rm'))}" aria-label="${esc(t('lx.rm'))}">✕</button></div>`).join('')}</div>`:'')}
{const _fv=lshFolderView;lshFolderView=function(id,...x){const h=_fv(id,...x);try{const ex=lxFolderExtras(id);if(!ex)return h;return h.replace(`<p class="muted lshhint">${t('lsh.empty')}</p>`,'')+ex}catch(e){console.error(e);return h}}}
{const _bb=lshBindBody;lshBindBody=function(b,...x){const r=_bb(b,...x);try{if(!b)return r;const fid=LIB.open&&String(LIB.open).startsWith('f:')?String(LIB.open).slice(2):null;
  b.querySelectorAll('.lxfs [data-open]').forEach(x=>x.onclick=()=>libFetch(libU('/open?id='+x.dataset.open)).catch(()=>{}));
  b.querySelectorAll('.lxfs [data-reveal]').forEach(x=>x.onclick=()=>libFetch(libU('/open?folder=1&id='+x.dataset.reveal)).catch(()=>{}));
  b.querySelectorAll('.lxfs [data-dl]').forEach(x=>x.onclick=()=>libDownload(x.dataset.dl,x.dataset.n,+x.dataset.s));
  b.querySelectorAll('[data-lxrm]').forEach(x=>x.onclick=e=>{e.stopPropagation();const f=fid&&lshGet(fid);if(!f)return;const snap=JSON.stringify(LSH());f.items=(f.items||[]).filter(r=>r.id!==x.dataset.lxrm);save();renderLib();toastAct(t('lx.removed'),t('lsh.undo'),()=>{LIBS().shelf=JSON.parse(snap);save();renderLib()},8000)})}catch(e){console.error(e)}return r}}
/* drag sources, names and moves */
{const _s=ldSource;ldSource=function(el){if(el&&el.closest&&el.closest('#v-lib')&&!el.closest('#lpath')){const bk=el.closest('[data-book]');if(bk)return{t:'b',id:bk.dataset.book,el:bk};const fr=el.closest('.lbf');if(fr){const s=fr.dataset.file?(()=>{const n=libFind(fr.dataset.file);return n&&/\.pdf$/i.test(n.n)?{t:'b',id:'p:'+n.id}:{t:'f',id:fr.dataset.file}})():lxFileSrc(fr);if(s)return{...s,el:fr}}}return _s(el)}}
{const _ok=ldOk;ldOk=function(s,g){if(s&&(s.t==='b'||s.t==='f'))return _ok({...s,t:'m'},g);return _ok(s,g)}}
{const _n=ldName;ldName=function(s){if(s.t==='b'){const b=lxBook(s.id);return b?b.n:''}if(s.t==='f'){const n=libFind(s.id);return n?n.n:''}return _n(s)}}
{const _d=ldDo;ldDo=function(s,g){if(!s||(s.t!=='b'&&s.t!=='f'))return _d(s,g);if(!ldOk(s,g))return false;const snap=JSON.stringify({sh:LSH(),au:AUD()}),o=String(LIB.open||''),nm=ldName(s),cur=o.startsWith('f:')?o.slice(2):null;
  if(g.id){const f=lshGet(g.id);f.items=f.items||[];f.items.push({t:s.t,id:s.id})}if(cur){const f=lshGet(cur);if(f)f.items=(f.items||[]).filter(r=>r.id!==s.id)}
  save();renderLib();toastAct(t('ld.moved',nm,ldGName(g)),t('lsh.undo'),()=>{const x=JSON.parse(snap);LIBS().shelf=x.sh;S.audio=x.au;save();renderLib()},8000);return true}}
{const _dc=ldDecorate;ldDecorate=function(...x){const r=_dc(...x);try{if(LORD.on)return r;$$('#v-lib .lbf').forEach(row=>{if(!row.dataset.file){const s=lxFileSrc(row);if(s)row.dataset.file=s.t==='b'?s.id.slice(2):s.id}});$$('#v-lib [data-book],#v-lib .lbf[data-file]').forEach(e=>{e.setAttribute('draggable','true');e.classList.add('ldable')})}catch(e){console.error(e)}return r}}
/* while something is held, a dock of every folder appears, so it can go anywhere (also from a PC course page, which has no folders of its own) */
function lxDock(){const s=LDND.drag;if(!s||$('#ldDock'))return;let opts=[];
  if(['sf','d','m','b','f'].includes(s.t))opts=LSH().map(f=>({k:'sf',id:f.id,n:lshPath(f.id).map(x=>x.n).join(' › '),i:'📁'}));
  else if(s.t==='af'||s.t==='r'){const A=AUD();opts=(A.f||[]).map(f=>({k:'af',id:f.id,n:f.n,i:'📁'}));if(s.t==='r')opts=opts.concat((A.pl||[]).map(p=>({k:'pl',id:p.id,n:p.n,i:'🎶'})))}
  opts=opts.filter(o=>ldOk(s,{k:o.k,id:o.id})).sort((a,b)=>a.n.localeCompare(b.n));if(!opts.length)return;
  document.body.insertAdjacentHTML('beforeend',`<div class="lddock" id="ldDock"><small>${t('lx.dock')}</small><div>${opts.map(o=>`<span class="lddi" data-dock="${o.k}:${o.id}" dir="auto">${o.i} ${esc(o.n)}</span>`).join('')}</div></div>`)}
{const _t=ldTarget;ldTarget=function(el){const d=el&&el.closest&&el.closest('#ldDock [data-dock]');if(d){const i=d.dataset.dock.indexOf(':');return{k:d.dataset.dock.slice(0,i),id:d.dataset.dock.slice(i+1),el:d}}return _t(el)}}
{const _c=ldClear;ldClear=function(...x){const k=$('#ldDock');if(k)k.remove();return _c(...x)}}
{const _l=ldLift;ldLift=function(...x){const r=_l(...x);try{lxDock()}catch(e){}return r}}
document.addEventListener('dragstart',()=>{if(LDND.drag&&!LORD.on)setTimeout(()=>{try{lxDock()}catch(e){}},0)});
/* «⇅ arrange»: books and files inside a folder, and the lessons of a PC course */
{const _sc=lordScopes;lordScopes=function(){const out=_sc(),o=String(LIB.open||'');
  if(o.startsWith('f:')){const fid=o.slice(2);$$('#lshBody > .lxbk, #lshBody > .lxfs').forEach(g=>out.push({el:g,scope:'items:'+fid}))}
  else if(o&&!o.startsWith('au:')&&libFind(o))$$('#libBox > .lbles').forEach(g=>out.push({el:g,scope:'pcl:'+o}));
  return out}}
{const _id=lordId;lordId=function(el){return el.dataset.book||el.dataset.file||_id(el)}}
{const _sv=lordSave;lordSave=function(scope,ids){if(!scope.startsWith('pcl:'))return _sv(scope,ids);const c=libFind(scope.slice(4));if(!c)return;const L_=LIBS();L_.order=L_.order||{};
  /* lessons keep their chapter: each folder of the course gets its own order, with its sub-folders where they were */
  const walk=n=>{const kids=n.c||[];if(!kids.length)return;const ord=L_.order[n.id],sorted=kids.slice().sort(libNat);if(ord)sorted.sort((a,b)=>{const i=ord.indexOf(a.id),j=ord.indexOf(b.id);return(i<0?1e9:i)-(j<0?1e9:j)});
    const mine=new Set(sorted.filter(k=>k.k==='v'||k.k==='a').map(k=>k.id)),seq=ids.filter(id=>mine.has(id));if(seq.length){let i=0;L_.order[n.id]=sorted.map(k=>mine.has(k.id)?seq[i++]:k.id)}sorted.forEach(k=>{if(k.k==='d')walk(k)})};
  walk(c);save()}}
/* a PC lesson stays in its chapter (its folder on the PC): no arrow across a chapter heading */
{const _ld=lordDecorate;lordDecorate=function(...x){const r=_ld(...x);try{const o=String(LIB.open||'');if(o&&!o.startsWith('f:')&&!o.startsWith('au:'))$$('#libBox > .lbles > .lorditem').forEach(c=>{const p=c.previousElementSibling,n=c.nextElementSibling;if(!p||p.classList.contains('lbch'))c.querySelector('[data-lmv="-1"]').disabled=true;if(!n||n.classList.contains('lbch'))c.querySelector('[data-lmv="1"]').disabled=true})}catch(e){console.error(e)}return r}}
{const _b=lordButton;lordButton=function(){const r=_b();try{const o=String(LIB.open||'');if(o&&!o.startsWith('f:')&&!o.startsWith('au:')&&!$('#lordBtn')&&$$('#libBox > .lbles .lbl').length>1){const host=$('#libBox .lbbar .lbpr');if(host){host.insertAdjacentHTML('beforebegin',`<button class="btn sm ${LORD.on?'pri':'ghost'}" id="lordBtn">⇅ ${LORD.on?t('lsh.done'):t('lord.btn')}</button>`);$('#lordBtn').onclick=e=>{e.stopPropagation();LORD.on=!LORD.on;if(LORD.on)toast(t('lord.tip'));renderLib()}}}}catch(e){console.error(e)}return r}}

