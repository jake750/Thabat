/* ============ v3.150 UX list H: the look (one primary button, spacing scale, card titles, PC width, shrinking phone titles, numbers, placeholders, toast timing, unique icons, light motion) ============ */
const UX8={pend:0};

/* 100. toasts: plain ones 3 s, with an action 6 s; held while the pointer or a finger is on them; a short exit */
function ux8Tm(el,ms){let left=ms,t0=Date.now(),id=0,done=false;
  const out=()=>{if(done)return;done=true;el.classList.add('ux8out');setTimeout(()=>el.remove(),220)};
  const go=()=>{t0=Date.now();clearTimeout(id);id=setTimeout(out,left)};
  const hold=()=>{clearTimeout(id);left=Math.max(1200,left-(Date.now()-t0))};
  el.addEventListener('mouseenter',hold);el.addEventListener('mouseleave',go);
  el.addEventListener('touchstart',hold,{passive:true});el.addEventListener('touchend',go,{passive:true});
  go();return{stop(){done=true;clearTimeout(id)}}}
function ux8Ms(ms){ms=+ms||0;return ms>=3000&&ms<=12000?6000:ms}

/* 91. one filled primary button per window: the last one (the action row) stays filled */
function ux8Pri(){UX8.pend=0;
  document.querySelectorAll('.modal.on>.box,.modal.on .sheet-box,#setupModal.on .box').forEach(box=>{
    const all=[...box.querySelectorAll('.btn.pri')].filter(b=>!b.closest('.toast')&&b.offsetParent!==null);
    all.forEach(b=>b.classList.remove('ux8sec'));
    if(all.length>1)all.slice(0,-1).forEach(b=>b.classList.add('ux8sec'))})}
function ux8PriSoon(){if(UX8.pend)return;UX8.pend=setTimeout(ux8Pri,140)}
{const mo=new MutationObserver(ms=>{for(const m of ms){const n=m.target;if(n&&n.closest&&(n.closest('.modal')||(n.classList&&n.classList.contains('modal')))){ux8PriSoon();return}}});
  mo.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']})}

/* 92. one spacing scale: gaps everywhere and card padding snap to 4 / 8 / 12 / 16 / 24 */
const UX8_SC=[4,8,12,16,24];
const UX8_SKIP=/qimg|mushaf|\.ml\b|\.aen|#cal\b|\.cell|calsky|\.msb|wb|board|#bwrap|bkp|bkv|lpv|tpk|rpk|\.uic|svg|\.navpill|kbd|\.qcov|\.hm|tdaring|\.pez|qyg|\.c30g|\.ndbt|chart|#bPlot|\.bx|\.inline\b/i;
function ux8Snap(v){if(v<=4||v>28)return v;let b=UX8_SC[0];for(const s of UX8_SC)if(Math.abs(s-v)<Math.abs(b-v)||(Math.abs(s-v)===Math.abs(b-v)&&s>b))b=s;return b}
const UX8O=new Map();
function ux8Space(){const on=S.settings.ux8Space!==false,rules=[];
  const walk=l=>{for(const r of l){if(r.cssRules&&!r.selectorText)walk(r.cssRules);else if(r.style&&r.selectorText)rules.push(r)}};
  for(const sh of document.styleSheets){try{if(sh.href)continue;walk(sh.cssRules)}catch(e){}}
  rules.forEach(r=>{const st=r.style,sel=r.selectorText;if(UX8_SKIP.test(sel))return;
    let o=UX8O.get(r);if(!o){o={};['gap','row-gap','column-gap','padding'].forEach(p=>{const v=st.getPropertyValue(p);if(v)o[p]=[v,st.getPropertyPriority(p)]});UX8O.set(r,o)}
    for(const p in o){const [v,pr]=o[p];
      if(p==='padding'&&!/(^|[\s,>])\.card\b|\.modal \.box|\.sheet-box/.test(sel))continue;
      if(!on){st.setProperty(p,v,pr);continue}
      const nv=v.split(/\s+/).map(x=>{const m=/^(\d+(?:\.\d+)?)px$/.exec(x);return m?ux8Snap(parseFloat(m[1]))+'px':x}).join(' ');
      if(nv!==v)st.setProperty(p,nv,pr)}})}
{hookFn('applyTheme',()=>applyTheme,f=>{applyTheme=f},'post',function(){try{ux8Space()}catch(e){console.error(e)}})}
try{ux8Space()}catch(e){console.error(e)}

/* (c) every icon unique: emoji that meant different things no longer share one drawing */
const UX8_P={
  u8refresh:'<path d="M20 11a8 8 0 0 0-14.6-4.4L4 8"/><path d="M4 3.5V8h4.5"/><path d="M4 13a8 8 0 0 0 14.6 4.4L20 16"/><path d="M20 20.5V16h-4.5"/>',
  u8recycle:'<path d="M7.5 19.5H5a2 2 0 0 1-1.7-3l2.2-3.8"/><path d="m2.6 13.9 2.9-1.2 1.1 2.9"/><path d="M10.4 4.6 11.6 2.5a2 2 0 0 1 3.4 0l2.4 4.1"/><path d="m18.6 4.4-1.2 2.9-2.9-1"/><path d="M15 19.5h4.2a2 2 0 0 0 1.7-3L19 13.2"/><path d="m13 17.5 2 2-2 2"/>',
  u8outline:'<path d="M9 6h11M12 12h8M12 18h8"/><circle cx="5" cy="6" r="1.2"/><circle cx="8" cy="12" r="1.2"/><circle cx="8" cy="18" r="1.2"/>',
  u8notepad:'<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 2.5v3M12 2.5v3M15 2.5v3M8.5 11h7M8.5 15h5"/>',
  u8scroll:'<path d="M8 3h10a2 2 0 0 1 2 2v12"/><path d="M8 3a2 2 0 0 0-2 2v13a3 3 0 0 0 3 3h10a3 3 0 0 0 0-6h-9v3a3 3 0 0 1-3 3"/><path d="M10 8h6M10 11.5h5"/>',
  u8receipt:'<path d="M6 3v18l2-1.3 2 1.3 2-1.3 2 1.3 2-1.3 2 1.3V3l-2 1.3L14 3l-2 1.3L10 3 8 4.3z"/><path d="M9.5 9h5M9.5 13h5"/>',
  u8finish:'<path d="M5 21V3.5"/><path d="M5 4h14v9H5"/><path d="M9.7 4v4.5H5M14.3 4v4.5H9.7M19 8.5h-4.7v4.5M9.7 8.5V13"/>',
  u8arm:'<path d="M6.5 20.5c-2-3-2.6-7.4-1-11.4L7.5 4h3.5l-.8 3.2 2.3 1.3"/><path d="M6.5 20.5h8.3c3 0 5.2-2.1 5.2-5 0-2.6-2-4.4-4.6-4.4-2 0-3.4 1-4.2 2.6"/>',
  u8thought:'<path d="M7.5 15.5a4 4 0 0 1-.6-7.9A5.5 5.5 0 0 1 17 6.9a4.3 4.3 0 0 1 .4 8.6z"/><circle cx="7" cy="19.3" r="1.4"/><circle cx="4" cy="22" r=".8"/>',
  u8trayin:'<path d="M4 13v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6"/><path d="M4 13h4.2l1.5 2.5h4.6l1.5-2.5H20"/><path d="M12 3v8.5M8.8 8.3 12 11.5l3.2-3.2"/>',
  u8strip:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7.5 4v16M16.5 4v16M3 8h4.5M3 12h4.5M3 16h4.5M16.5 8H21M16.5 12H21M16.5 16H21"/>',
  u8write:'<path d="M3 21c2.5-.4 4-1.6 5-3.4"/><path d="m14.5 4.5 5 5L10 19l-5.5.5L5 14z"/><path d="m12.5 6.5 5 5"/>',
  u8ledger:'<path d="M6 3h12a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M8 3v18M4 7.5h4M4 12h4M4 16.5h4M11.5 8h4.5"/>'};
const UX8_E={'🔄':'u8refresh','♻':'u8recycle','📑':'u8outline','🗒':'u8notepad','📜':'u8scroll','🧾':'u8receipt','🏁':'u8finish','💪':'u8arm','💭':'u8thought','📥':'u8trayin','🎞':'u8strip','✍':'u8write','📒':'u8ledger','👏':'party'};
function ux8Icons(){Object.assign(UIC_P,UX8_P);Object.assign(UIC_E,UX8_E);for(const k in UIC_TPL)delete UIC_TPL[k];
  document.querySelectorAll('svg.uic').forEach(s=>{const d=s.querySelector('desc');if(!d)return;const e=d.textContent,n=UX8_E[e.replace(/️/g,'')];if(n)s.replaceWith(uicNode(n,e))})}
try{ux8Icons()}catch(e){console.error(e)}

/* 97. phones: the page title becomes a small bar at the top once the page scrolls */
function ux8Title(){const m=$('main');if(!m)return;const on=MOB.matches&&m.scrollTop>56;document.documentElement.classList.toggle('ux8sh',on)}
{const m=$('main');if(m)m.addEventListener('scroll',ux8Title,{passive:true})}
{hookFn('showView',()=>showView,f=>{showView=f},'post',function(){try{ux8Title();
  /* (e) the page's cards come in softly when you open it */
  const v=document.querySelector('.view.on');if(v&&!document.documentElement.classList.contains('rmotion')){v.classList.remove('ux8enter');void v.offsetWidth;v.classList.add('ux8enter');clearTimeout(UX8.vt);UX8.vt=setTimeout(()=>v.classList.remove('ux8enter'),520)}}catch(e){}})}

/* 99. Mawaqit / OpenStreetMap search: the list's shape first */
{hookFn('renderSetup',()=>renderSetup,f=>{renderSetup=f},'post',function(){try{if(typeof SU==='undefined'||SU.step!=='mosques'||!SU.loading||(SU.mosques&&SU.mosques.length))return;
  const l=document.querySelector('#setupModal .sulist.tall');if(!l||l.querySelector('.ux8skr'))return;const sp=l.querySelector('.sunote');
  const h=Array.from({length:4},()=>'<div class="ux8skr" aria-hidden="true"><i class="skel"></i><i class="skel s2"></i></div>').join('');
  if(sp)sp.insertAdjacentHTML('afterend',h);else l.insertAdjacentHTML('afterbegin',h)}catch(e){}})}

