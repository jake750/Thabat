/* ============ v3.169.0 thirteenth list L: the look ============ */
/* All choices live in the look sheet (S.settings.lk, LK_D got txs rad orn bar mag; shape got 'bare'):
   267 txs = text size apart from the interface size; 271 rad = card and button corners; 273 orn = ornament under page titles;
   274 shape 'bare' = cards without a frame; 279 bar = progress bars thin / thick / rounded; 280 mag = long press on small text (phones).
   278 ready themes in the theme editor (L15TH). 272 (icon weight) was already in the sheet. */
const L15={h:new Map(),r:new Map(),round:null};
function l15Rules(){const out=[];const walk=list=>{for(const r of list){if(r.cssRules&&!r.selectorText)walk(r.cssRules);else if(r.style&&r.selectorText)out.push(r)}};
  for(const sh of document.styleSheets){try{if(sh.href)continue;walk(sh.cssRules)}catch(e){}}return out}
const L15_BAR=/\.[a-z0-9-]*bar(?![\w-])[^\s>+~,]*$/i,L15_NOBAR=/nav|tool|sel|search|tab|side|top|act|thumb|scroll|grab|lpv|wb|bk|qb/i;
function l15Pass(){const L_=LK(),k=+L_.txs||1,rad=L_.rad||'',bar=L_.bar||'';
  l15Rules().forEach(r=>{const st=r.style,sel=r.selectorText,o=LKP.orig.get(r);
    /* 267: lkPass has just put every px font size back to its base; scale the ones it handles */
    if(k!==1&&o&&o.fs&&/^\d+(\.\d+)?px$/.test(o.fs)&&!LK_FSKIP.test(sel)){const v=parseFloat(o.fs),b=L_.tscale?lkSnap(v):v;st.setProperty('font-size',(Math.round(b*k*2)/2)+'px',o.fsp)}
    /* 271: corners; lkPass resets the px ones each time, so the current value is the base */
    if(o&&o.br&&/^\d+(\.\d+)?px$/.test(o.br)&&rad){const v=parseFloat(st.getPropertyValue('border-radius'));if(v>0&&v<40){const n=rad==='sq'?Math.min(v,3):Math.round(v*.5);st.setProperty('border-radius',n+'px',o.brp)}}
    /* 279: progress tracks = a «…bar» class, 2–12 px high */
    const last=sel.split(',').pop().trim();
    if(L15_BAR.test(last)&&!L15_NOBAR.test(last)){let h=L15.h.get(r);if(!h){const hv=st.getPropertyValue('height');if(!/^\d+(\.\d+)?px$/.test(hv)||st.getPropertyValue('cursor')||st.getPropertyValue('padding'))return;const n=parseFloat(hv);if(n<2||n>12)return;
        h={h:hv,hp:st.getPropertyPriority('height'),br:st.getPropertyValue('border-radius'),brp:st.getPropertyPriority('border-radius')};L15.h.set(r,h)}
      const n=parseFloat(h.h);st.setProperty('height',bar==='thin'?Math.max(2,Math.round(n*.55))+'px':bar==='thick'?Math.min(16,Math.round(n*1.6))+'px':h.h,h.hp);
      if(bar==='round')st.setProperty('border-radius','99px',h.brp);else if(h.br)st.setProperty('border-radius',h.br,h.brp);else st.removeProperty('border-radius')}});
  /* rounded fills inside the tracks */
  let el=$('#l15Css');if(!el){el=document.createElement('style');el.id='l15Css';document.head.append(el)}
  el.textContent=bar==='round'?[...L15.h.keys()].map(r=>r.selectorText.split(',').map(s=>s.trim()+'>*').join(',')+'{border-radius:99px}').join('\n'):''}
function l15Apply(){const L_=LK(),h=document.documentElement;h.classList.toggle('cs-bare',L_.shape==='bare');
  ['star','line'].forEach(x=>h.classList.toggle('l15o-'+x,L_.orn===x));h.style.setProperty('--l15t',+L_.txs||1);if(L_.rad==='sq')h.style.setProperty('--radius','4px');else if(L_.rad==='less')h.style.setProperty('--radius','11px');else h.style.removeProperty('--radius');
  try{l15Pass()}catch(e){console.error(e)}}
{hookFn('applyTheme',()=>applyTheme,f=>{applyTheme=f},'post',function(){try{l15Apply()}catch(e){console.error(e)}})}
try{l15Apply()}catch(e){}

/* the look sheet preview */
{hookFn('lkPreview',()=>lkPreview,f=>{lkPreview=f},'post',function(P){try{const el=$('#lkPv');if(!el)return;const L_=P.lk;
  el.style.setProperty('--l15t',+L_.txs||1);el.classList.toggle('cs-bare',L_.shape==='bare');
  ['rd-less','rd-sq','pb-thin','pb-thick','pb-round','po-star','po-line'].forEach(c=>el.classList.remove(c));
  if(L_.rad)el.classList.add('rd-'+L_.rad);if(L_.bar)el.classList.add('pb-'+L_.bar);if(L_.orn)el.classList.add('po-'+L_.orn)}catch(e){console.error(e)}})}

/* 278: ready themes in the theme editor */
const L15TH={desert:{acc:'#d9a441',water:'#e0814a',sh:34,font:'plex'},night:{acc:'#9aaeff',water:'#62c9e8',sh:228,font:'plex'},olive:{acc:'#a3b64a',water:'#6fbf8a',sh:78,font:'plex'},sea:{acc:'#3fbcd6',water:'#4f8cff',sh:198,font:'plex'}};
function l15ThHTML(T){return`<div class="l15th"><span class="muted">${esc(t('l15.th'))}</span>${Object.keys(L15TH).map(k=>{const x=L15TH[k],on=T&&T.acc===x.acc&&+T.sh===x.sh;
  return`<button type="button" class="l15thb${on?' on':''}" data-l15p="${k}"><i style="background:${x.acc}"></i><i style="background:${x.water}"></i><i style="background:hsl(${x.sh} 18% 13%)"></i>${esc(t('l15.th.'+k))}</button>`}).join('')}</div>`}

/* 280: long press on small text on a phone shows it large for a moment */
const L15M={t:null,x:0,y:0,el:null,hide:null};
const L15_MSKIP='input,textarea,select,[contenteditable],button,a,label,li.task,.task,.ncard,.lbl,.ldable,[data-play],#mushaf,#spread,.qimg,#bwrap,#bkReader,.lbvw,.cell,.cevt,.hbchip,#prayers,[data-pk],.tkh,.uxgrab,.navpill,nav,.wkc,.rpk,.tpk,#l15Mag,svg,img,canvas,video';
function l15Own(el){for(let i=0;el&&i<4;i++,el=el.parentElement){if(el.nodeType!==1)continue;for(const n of el.childNodes)if(n.nodeType===3&&n.textContent.trim().length>1)return el}return null}
function l15MagHide(){const m=$('#l15Mag');if(m)m.remove();if(L15M.el)L15M.el.classList.remove('l15hl');L15M.el=null;clearTimeout(L15M.hide)}
function l15MagShow(el){const tx=(el.innerText||'').replace(/\s+/g,' ').trim();if(!tx||tx.length>500)return;l15MagHide();
  const m=document.createElement('div');m.id='l15Mag';m.dir='auto';m.textContent=tx;document.body.append(m);L15M.el=el;el.classList.add('l15hl');
  try{navigator.vibrate&&navigator.vibrate(12)}catch(e){}setTimeout(()=>{try{getSelection().removeAllRanges()}catch(e){}},30);L15M.hide=setTimeout(l15MagHide,8000)}
document.addEventListener('touchstart',e=>{clearTimeout(L15M.t);if($('#l15Mag')){l15MagHide();return}
  if(!LK().mag||!MOB.matches||e.touches.length!==1)return;const tg=e.target;if(!tg||!tg.closest||tg.closest(L15_MSKIP))return;
  const el=l15Own(tg);if(!el||el.closest(L15_MSKIP))return;const fs=parseFloat(getComputedStyle(el).fontSize)||16;if(fs>=16)return;
  L15M.x=e.touches[0].clientX;L15M.y=e.touches[0].clientY;L15M.t=setTimeout(()=>l15MagShow(el),460)},{passive:true});
document.addEventListener('touchmove',e=>{if(!L15M.t)return;const p=e.touches[0];if(Math.abs(p.clientX-L15M.x)>10||Math.abs(p.clientY-L15M.y)>10){clearTimeout(L15M.t);L15M.t=null}},{passive:true});
document.addEventListener('touchend',()=>{clearTimeout(L15M.t);L15M.t=null},{passive:true});
document.addEventListener('contextmenu',e=>{if($('#l15Mag'))e.preventDefault()},true);

/* his request 2026-11-04: a template put on a board that already has content no longer lands on top of it.
   He chooses: next to what is there (an empty spot), a place he taps, or instead of what is there (one undo brings it back). */
const L15W={busy:false,place:null};
function l15WBox(els){let a=1e9,b=1e9,c=-1e9,d=-1e9;els.forEach(e=>{try{const r=wbBox(e);if(!r||!isFinite(r.x))return;a=Math.min(a,r.x);b=Math.min(b,r.y);c=Math.max(c,r.x+r.w);d=Math.max(d,r.y+r.h)}catch(x){}});return a<1e9?{x:a,y:b,w:c-a,h:d-b}:null}
function l15WShift(els,dx,dy){els.forEach(e=>wbShift(e,JSON.parse(JSON.stringify(e)),dx,dy))}
function l15WShow(bx){const wr=$('#bwrap');if(!wr||!bx)return;const r=wr.getBoundingClientRect(),v=wbView();if(!r.width)return;
  const z=Math.max(.05,Math.min(v.z,(r.width/uiZoom())*.9/Math.max(1,bx.w),(r.height/uiZoom())*.9/Math.max(1,bx.h)));v.z=z;v.x=r.width/uiZoom()/2-(bx.x+bx.w/2)*z;v.y=r.height/uiZoom()/2-(bx.y+bx.h/2)*z;try{wbApplyView()}catch(e){}}
function l15WRun(run,mode){const before=new Set(wbEls().map(e=>e.id));L15W.busy=true;let r;try{r=run()}finally{L15W.busy=false}
  const b=board(),neu=b.els.filter(e=>!before.has(e.id)),old=b.els.filter(e=>before.has(e.id));if(!neu.length)return r;
  if(mode==='replace'){const keep=new Set(neu.map(e=>e.id));b.els=b.els.filter(e=>keep.has(e.id));WB.sel.clear();save();wbRender();toastAct(t('l15w.replaced'),t('undo'),()=>wbUndo());return r}
  const nb=l15WBox(neu),ob=l15WBox(old);if(!nb)return r;
  if(mode==='beside'&&ob){const rtl=document.documentElement.dir==='rtl',gap=160;const dx=rtl?(ob.x-gap)-(nb.x+nb.w):(ob.x+ob.w+gap)-nb.x;l15WShift(neu,dx,ob.y-nb.y);save();wbRender();l15WShow(l15WBox(neu));toast(t('l15w.beside'))}
  if(mode==='pick'){L15W.place={ids:neu.map(e=>e.id)};try{WB.sel.clear();neu.forEach(e=>WB.sel.add(e.id))}catch(e){}save();wbRender();toast(t('l15w.tap'))}
  return r}
function l15WAsk(run){const b=board&&board();if(L15W.busy||!b||!(b.els||[]).length)return run();
  openInfo(t('l15w.t'),`<p class="muted">${esc(t('l15w.sub'))}</p><div class="l15wb"><button class="btn pri" data-l15w="beside">${esc(t('l15w.o1'))}</button><button class="btn" data-l15w="pick">${esc(t('l15w.o2'))}</button><button class="btn" data-l15w="replace">${esc(t('l15w.o3'))}</button><button class="btn ghost" data-l15w="x">${esc(t('cancel'))}</button></div>`);
  const box=$('#infoBox');if(box){box.classList.add('l15wbox');const ea=box.querySelector('.evact');if(ea)ea.hidden=true;
    box.querySelectorAll('[data-l15w]').forEach(x=>x.onclick=()=>{const m=x.dataset.l15w;closeInfo2();if(m!=='x')setTimeout(()=>l15WRun(run,m),30)})}}
{hookFn('openInfo',()=>openInfo,f=>{openInfo=f},'pre',function(){try{const b=$('#infoBox');if(b){b.classList.remove('l15wbox');const ea=b.querySelector('.evact');if(ea)ea.hidden=false}}catch(e){}})}
{const _a=wbTemplate;wbTemplate=function(...a){return l15WAsk(()=>_a(...a))}}
{const _b=wbTpl3;wbTpl3=function(...a){return l15WAsk(()=>_b(...a))}}
{const _c=wbTplUse;wbTplUse=function(...a){return l15WAsk(()=>_c(...a))}}
/* «a place you tap»: the next press on the board moves the new template there (its middle under the finger); Esc leaves it in the middle */
document.addEventListener('pointerdown',e=>{if(!L15W.place)return;const wr=$('#bwrap');if(!wr||!wr.contains(e.target)||e.target.closest('#btbar,#bmini,.wbs,.wbdock'))return;
  e.preventDefault();e.stopPropagation();const ids=new Set(L15W.place.ids);L15W.place=null;const els=wbEls().filter(x=>ids.has(x.id)),bx=l15WBox(els);if(!bx)return;
  const[px,py]=wbToWorld(e.clientX,e.clientY);l15WShift(els,px-(bx.x+bx.w/2),py-(bx.y+bx.h/2));save();wbRender()},true);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&L15W.place)L15W.place=null},true);

/* his report 2026-11-04: the board's undo/redo looked the wrong way round in Arabic, and gave no sign when there was nothing to undo.
   In RTL redo comes first in the row (so undo ↶ sits on the left, redo ↷ on the right); each is faded while its history is empty. */
function l15UR(){const u=$('#wbUndo'),r=$('#wbRedo');if(!u||!r)return;
  if(document.documentElement.dir==='rtl'){if(u.nextElementSibling===r)u.before(r)}else if(r.nextElementSibling===u)r.before(u);
  let b=null;try{b=board()}catch(e){}const hu=!!(b&&(WB.hist[b.id]||[]).length),hr=!!(b&&(WB.redo[b.id]||[]).length);
  u.classList.toggle('l15off',!hu);r.classList.toggle('l15off',!hr);u.setAttribute('aria-disabled',String(!hu));r.setAttribute('aria-disabled',String(!hr))}
['wbSnap','wbUndo','wbRedo','wbRender'].forEach(n=>{try{if(n==='wbSnap')hookFn('wbSnap',()=>wbSnap,f=>{wbSnap=f},'post',()=>{try{l15UR()}catch(e){}});
  if(n==='wbUndo')hookFn('wbUndo',()=>wbUndo,f=>{wbUndo=f},'post',()=>{try{l15UR()}catch(e){}});if(n==='wbRedo')hookFn('wbRedo',()=>wbRedo,f=>{wbRedo=f},'post',()=>{try{l15UR()}catch(e){}});
  if(n==='wbRender')hookFn('wbRender',()=>wbRender,f=>{wbRender=f},'post',()=>{try{l15UR()}catch(e){}})}catch(e){console.error(e)}});
setTimeout(()=>{try{l15UR()}catch(e){}},1200);

/* his request 2026-11-04: moving between the main pages feels smoother — the highlight slides from the old page's button to the new one */
function l15NavPaint(){const pill=$('.navpill');if(!pill)return;const on=pill.querySelector('.navbtn.on');let ind=$('#l15Nav');
  if(!on||!on.offsetWidth){if(ind)ind.style.opacity='0';return}
  if(!ind){ind=document.createElement('i');ind.id='l15Nav';ind.setAttribute('aria-hidden','true');pill.prepend(ind);document.documentElement.classList.add('l15nav');ind.style.transition='none';requestAnimationFrame(()=>{ind.style.transition=''})}
  ind.style.opacity='1';ind.style.width=on.offsetWidth+'px';ind.style.height=on.offsetHeight+'px';ind.style.transform=`translate(${on.offsetLeft}px,${on.offsetTop}px)`}
{hookFn('showView',()=>showView,f=>{showView=f},'post',function(){try{l15NavPaint()}catch(e){}})}
{const pill=$('.navpill');if(pill){new MutationObserver(()=>{try{l15NavPaint()}catch(e){}}).observe(pill,{subtree:true,attributes:true,attributeFilter:['class']});
  try{new ResizeObserver(()=>{try{l15NavPaint()}catch(e){}}).observe(pill)}catch(e){}}}
addEventListener('resize',()=>{try{l15NavPaint()}catch(e){}});setTimeout(()=>{try{l15NavPaint()}catch(e){}},800);

/* found while testing: a note without its «day» (seen on a lesson note) stopped the whole notes page (keyToDate(undefined)); give it the day it was made */
function l15NoteDays(){(S.notes||[]).forEach(n=>{if(n&&typeof n.day!=='string'){try{n.day=keyOf(n.created||n.updated||Date.now())}catch(e){n.day=todayKey()}}})}
{hookFn('renderNotes',()=>renderNotes,f=>{renderNotes=f},'pre',function(){try{l15NoteDays()}catch(e){}})}
try{l15NoteDays()}catch(e){}

