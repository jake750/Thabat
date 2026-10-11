/* ============ v3.17: drag and drop in the library — put folders, courses, lessons and recordings inside a folder by dropping them on it; drop on «‹ back» to take them out. PC: mouse drag; phone: long press, then drag ============ */
const LDND={drag:null,timer:0,noClick:0};
/* what can be dragged: shelf folders, PC courses, lessons, audio folders, recordings */
function ldSource(el){if(!el||!el.closest)return null;const v=el.closest('#v-lib');if(!v)return null;
  const fo=el.closest('[data-folder]');if(fo)return{t:'sf',id:fo.dataset.folder,el:fo};
  const c=el.closest('[data-card]');if(c){const[k,id]=c.dataset.card.split(':');return k==='f'?{t:'sf',id,el:c}:k==='d'?{t:'d',id,el:c}:null}
  const row=el.closest('.lbl[data-play]');if(row)return{t:'m',id:row.dataset.play,el:row};
  const ao=el.closest('[data-ao]');if(ao){const[k,id]=ao.dataset.ao.split(':');return k==='f'?{t:'af',id,el:ao}:null}
  const r=el.closest('[data-rid]');if(r)return{t:'r',id:r.dataset.rid,el:r};return null}
/* where it can be dropped: a shelf folder, an audio folder or playlist, or the «‹ back» button of the page */
function ldTarget(el){if(!el||!el.closest||!el.closest('#v-lib'))return null;const o=String(LIB.open||'');
  const fo=el.closest('[data-folder]');if(fo)return{k:'sf',id:fo.dataset.folder,el:fo};
  const c=el.closest('[data-card^="f:"]');if(c)return{k:'sf',id:c.dataset.card.slice(2),el:c};
  const ao=el.closest('[data-ao]');if(ao){const[k,id]=ao.dataset.ao.split(':');return{k:k==='f'?'af':'pl',id,el:ao}}
  const up=el.closest('#lshUp');if(up&&o.startsWith('f:')){const f=lshGet(o.slice(2));return{k:'sf',id:f&&f.parent||null,el:up,up:true}}
  const aup=el.closest('#auUp');if(aup&&o.startsWith('au:f:')){const f=auF(o.slice(5));return{k:'af',id:f&&f.parent||null,el:aup,up:true}}
  return null}
function ldUnder(src,id,kids,get){/* is folder id inside src (or src itself)? */let x=id;const seen=new Set();while(x&&!seen.has(x)){if(x===src)return true;seen.add(x);const f=get(x);x=f&&f.parent}return false}
function ldOk(s,g){if(!s||!g)return false;const o=String(LIB.open||'');
  if(s.t==='sf'){if(g.k!=='sf')return false;const f=lshGet(s.id);if(!f||(f.parent||null)===(g.id||null))return false;return!(g.id&&ldUnder(s.id,g.id,lshKids,lshGet))}
  if(s.t==='d'||s.t==='m'){if(g.k!=='sf')return false;if(!g.id)return o.startsWith('f:');const cur=o.startsWith('f:')?o.slice(2):null;if(g.id===cur)return false;const f=lshGet(g.id);return!!f&&!(f.items||[]).some(r=>r.id===s.id)}
  if(s.t==='af'){if(g.k!=='af')return false;const f=auF(s.id);if(!f||(f.parent||null)===(g.id||null))return false;return!(g.id&&ldUnder(s.id,g.id,auKids,auF))}
  if(s.t==='r'){if(g.k==='pl'){const p=auP(g.id);return!!p&&!p.items.includes(s.id)}if(g.k!=='af')return false;const cur=o.startsWith('au:f:')?o.slice(5):null;if(!g.id)return!!cur;if(g.id===cur)return false;const f=auF(g.id);return!!f&&!(f.items||[]).includes(s.id)}
  return false}
function ldName(s){if(s.t==='sf')return(lshGet(s.id)||{}).n||'';if(s.t==='af')return(auF(s.id)||{}).n||'';if(s.t==='r')return(auRec(s.id)||{}).title||'';const n=libFind(s.id);return n?libTitle(n.n):''}
function ldGName(g){if(g.k==='sf')return g.id?(lshGet(g.id)||{}).n:t('lsh.mine');if(g.k==='pl')return(auP(g.id)||{}).n;return g.id?(auF(g.id)||{}).n:t('au.t')}
function ldDo(s,g){if(!ldOk(s,g))return false;const snap=JSON.stringify({sh:LSH(),au:AUD()}),o=String(LIB.open||''),nm=ldName(s);
  if(s.t==='sf')lshGet(s.id).parent=g.id||null;
  else if(s.t==='d'||s.t==='m'){const cur=o.startsWith('f:')?o.slice(2):null;
    if(g.id){const f=lshGet(g.id);f.items=f.items||[];f.items.push({t:s.t,id:s.id})}
    if(cur){if(s.t==='d'){const f=lshGet(cur);if(f)f.items=(f.items||[]).filter(r=>r.id!==s.id)}else{const h=lshHolder(cur,s.id);if(h){if(h.direct)h.f.items=h.f.items.filter(r=>r.id!==s.id);else{h.f.hide=h.f.hide||[];if(!h.f.hide.includes(s.id))h.f.hide.push(s.id)}}}}}
  else if(s.t==='af')auF(s.id).parent=g.id||null;
  else if(s.t==='r'){if(g.k==='pl')auP(g.id).items.push(s.id);else{const cur=o.startsWith('au:f:')?o.slice(5):null;if(g.id){const f=auF(g.id);f.items=f.items||[];f.items.push(s.id)}if(cur){const f=auF(cur);if(f)f.items=(f.items||[]).filter(x=>x!==s.id)}}}
  save();renderLib();
  toastAct(t('ld.moved',nm,ldGName(g)),t('lsh.undo'),()=>{const x=JSON.parse(snap);LIBS().shelf=x.sh;S.audio=x.au;save();renderLib()},8000);return true}
function ldClear(){$$('.ldover').forEach(x=>x.classList.remove('ldover'));$$('.ldsrc').forEach(x=>x.classList.remove('ldsrc'));const g=$('#ldGhost');if(g)g.remove();clearInterval(LDND.scr);LDND.drag=null}
function ldHover(el){$$('.ldover').forEach(x=>x.classList.remove('ldover'));const g=ldTarget(el);if(g&&ldOk(LDND.drag,g)){g.el.classList.add('ldover');return g}return null}
/* every draggable item gets draggable=true (outside «⇅ arrange», which has its own drag) */
function ldDecorate(){if(LORD.on)return;$$('#v-lib [data-folder],#v-lib [data-card],#v-lib .lbl[data-play],#v-lib [data-ao^="f:"],#v-lib [data-rid]').forEach(e=>{e.setAttribute('draggable','true');e.classList.add('ldable')});$$('#v-lib .ldable img').forEach(i=>i.setAttribute('draggable','false'))}
{const _rl=renderLib;renderLib=function(){const r=_rl();try{ldDecorate();if(curView()==='lib'&&!localStorage.getItem('thabat.ldTip')&&$('#v-lib .ldable')){localStorage.setItem('thabat.ldTip','1');toast(t('ld.tip'))}}catch(e){console.error(e)}return r}}
/* PC: HTML5 drag */
document.addEventListener('dragstart',e=>{if(LORD.on)return;const s=ldSource(e.target);if(!s)return;LDND.drag=s;s.el.classList.add('ldsrc');try{e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',ldName(s))}catch(_){}});
document.addEventListener('dragover',e=>{if(!LDND.drag||LORD.on)return;if(ldHover(e.target)){e.preventDefault();e.dataTransfer.dropEffect='move'}});
document.addEventListener('drop',e=>{if(!LDND.drag||LORD.on)return;const g=ldTarget(e.target),s=LDND.drag;if(g&&ldOk(s,g)){e.preventDefault();e.stopPropagation();ldClear();ldDo(s,g)}},true);
document.addEventListener('dragend',()=>{if(LDND.drag)ldClear()});
/* phone: a long press picks the item up, then it follows the finger; scrolling is blocked only while something is held */
function ldTouchMove(e){const d=LDND.drag;if(!d)return;e.preventDefault();const p=e.touches[0],gh=$('#ldGhost');if(gh){gh.style.left=(p.clientX/uiZoom())+'px';gh.style.top=(p.clientY/uiZoom())+'px'}LDND.pt=[p.clientX,p.clientY];
  const el=document.elementFromPoint(p.clientX,p.clientY);LDND.over=ldHover(el)}
function ldTouchEnd(e){document.removeEventListener('touchmove',ldTouchMove,{passive:false});document.removeEventListener('touchend',ldTouchEnd);document.removeEventListener('touchcancel',ldTouchEnd);
  const s=LDND.drag,g=LDND.over;LDND.over=null;ldClear();LDND.noClick=Date.now();if(e.type==='touchend'&&s&&g)ldDo(s,g)}
function ldLift(s,x,y){LDND.drag=s;LDND.over=null;s.el.classList.add('ldsrc');try{navigator.vibrate&&navigator.vibrate(25)}catch(_){}
  document.body.insertAdjacentHTML('beforeend',`<div class="ldghost" id="ldGhost" dir="auto">${s.t==='sf'||s.t==='af'?'📁':s.t==='r'?'🎧':'🎬'} ${esc(ldName(s))}</div>`);const gh=$('#ldGhost');gh.style.left=(x/uiZoom())+'px';gh.style.top=(y/uiZoom())+'px';LDND.pt=[x,y];
  document.addEventListener('touchmove',ldTouchMove,{passive:false});document.addEventListener('touchend',ldTouchEnd);document.addEventListener('touchcancel',ldTouchEnd);
  /* scroll the page when the finger rests near the top or bottom */
  LDND.scr=setInterval(()=>{const m=$('main'),p=LDND.pt;if(!m||!p)return;const h=innerHeight;if(p[1]<90&&!(LDND.over&&LDND.over.el.closest('#lpath')))m.scrollTop-=14;else if(p[1]>h-110)m.scrollTop+=14},30)}
document.addEventListener('touchstart',e=>{if(LORD.on||LDND.drag||e.touches.length>1)return;const s=ldSource(e.target);if(!s||e.target.closest('button,input,select,a'))return;const p=e.touches[0],x0=p.clientX,y0=p.clientY;clearTimeout(LDND.timer);
  const cancel=ev=>{const q=ev.touches&&ev.touches[0];if(ev.type!=='touchmove'||!q||Math.hypot(q.clientX-x0,q.clientY-y0)>10){clearTimeout(LDND.timer);s.el.removeEventListener('touchmove',cancel);s.el.removeEventListener('touchend',cancel)}};
  s.el.addEventListener('touchmove',cancel,{passive:true});s.el.addEventListener('touchend',cancel,{passive:true});
  LDND.timer=setTimeout(()=>{s.el.removeEventListener('touchmove',cancel);s.el.removeEventListener('touchend',cancel);ldLift(s,x0,y0)},450)},{passive:true});
document.addEventListener('contextmenu',e=>{if(LDND.drag||(e.target.closest&&e.target.closest('#v-lib .ldable')&&matchMedia('(pointer:coarse)').matches))e.preventDefault()});
document.addEventListener('click',e=>{if(Date.now()-LDND.noClick<450&&e.target.closest&&e.target.closest('#v-lib')){e.preventDefault();e.stopPropagation()}},true);

