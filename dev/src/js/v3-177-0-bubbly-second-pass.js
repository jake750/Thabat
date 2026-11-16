/* ============ v3.177.0 bubbly motion, second pass (2026-11-16): the last things that still snapped ============ */
/* (1) folding sections (<details>: weekly review, Quran lists, archives, history…): opening brings the contents in one after another
       (45 ms apart, eight at most); closing first sends them up and out (quicker, the other way), then folds. A tap during the close keeps it open.
   (2) a part of the page that appears after a tap (hidden → shown: extra options, a form, a list) springs in, four per tap at most;
       not when something around it is already moving (a window opening, a tab change), not inside notices or fixed bars.
   (3) a ticked box or a chosen round option pops.
   All of it uses the shared tokens (apmCurve, --bub-out), translate/scale/opacity only, nothing when «تقليل الحركة» is on;
   opacity is never animated on a piece that holds a card (its glass blur would break). */
const BUB_OUT='cubic-bezier(.36,0,.66,-.56)';
function bubKids(d){return[...d.children].filter(c=>c.tagName!=='SUMMARY'&&c.offsetWidth).slice(0,8)}
function bubDetOpen(d){if(apmRM())return;bubKids(d).forEach((c,i)=>{const g=c.querySelector('.card')||c.classList.contains('card');
  apmAnim(c,g?[{translate:'0px -8px',scale:.97},{translate:'0px 0px',scale:1}]:[{opacity:0,translate:'0px -8px',scale:.96},{opacity:1,translate:'0px 0px',scale:1}],{duration:420,delay:i*45,easing:apmCurve('bouncy'),fill:'backwards'})})}
/* what follows the section (its next siblings, six at most) slides from where it was to where it is now, instead of jumping (FLIP, transform only) */
function bubFollow(d,h0){if(apmRM())return;const dy=h0-d.getBoundingClientRect().height;if(Math.abs(dy)<4)return;let n=d.nextElementSibling,i=0;
  for(;n&&i<6;n=n.nextElementSibling){if(!n.getClientRects().length)continue;i++;apmAnim(n,[{translate:'0px '+dy+'px'},{translate:'0px 0px'}],{duration:440,easing:apmCurve('smooth')})}}
document.addEventListener('click',ev=>{const s=ev.target&&ev.target.closest&&ev.target.closest('details>summary');if(!s||ev.defaultPrevented)return;const d=s.parentElement;
  if(d._bubA){ev.preventDefault();d._bubA.forEach(a=>{try{a.reverse()}catch(e){}});d._bubA=null;return}   /* tapped again while closing: it comes back */
  if(!d.open){const h0=d.getBoundingClientRect().height;setTimeout(()=>{if(d.open){bubFollow(d,h0);bubDetOpen(d)}},0);return}
  if(apmRM())return;const k=bubKids(d).reverse();if(!k.length)return;ev.preventDefault();
  const as=k.map((c,i)=>apmAnim(c,[{opacity:1,translate:'0px 0px',scale:1},{opacity:0,translate:'0px -6px',scale:.97}],{duration:170,delay:i*18,easing:BUB_OUT,fill:'forwards'})).filter(Boolean);
  if(!as.length){d.open=false;return}d._bubA=as;
  Promise.all(as.map(a=>a.finished.catch(()=>null))).then(()=>{if(d._bubA!==as)return;d._bubA=null;const h0=d.getBoundingClientRect().height;d.open=false;bubFollow(d,h0);as.forEach(a=>{try{a.cancel()}catch(e){}})})});

const BRV={t:0,n:0};
addEventListener('pointerup',()=>{BRV.t=performance.now();BRV.n=0},true);
addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){BRV.t=performance.now();BRV.n=0}},true);
function bubBusy(el){for(let p=el,i=0;p&&i<6;p=p.parentElement,i++){if(p.getAnimations&&p.getAnimations().some(a=>a.playState==='running'&&a.effect&&a.effect.target===p))return true}return false}
function bubReveal(el){if(BRV.n>=4||apmRM()||document.documentElement.classList.contains('lite'))return;
  if(!el.offsetWidth||el.closest('.toast,.navpill,.pgt,.bworld,#thSplash,.apmghost,.modal:not(.on)')||bubBusy(el))return;
  const cs=getComputedStyle(el);if(cs.position==='fixed')return;const r=el.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight||r.height<8)return;
  BRV.n++;const g=el.querySelector('.card')||el.classList.contains('card');
  apmAnim(el,g?[{translate:'0px -10px',scale:.97},{translate:'0px 0px',scale:1}]:[{opacity:0,translate:'0px -10px',scale:.95},{opacity:1,translate:'0px 0px',scale:1}],{duration:440,easing:apmCurve('bouncy')})}
new MutationObserver(ms=>{if(performance.now()-BRV.t>700)return;for(const m of ms){const el=m.target;if(el.nodeType===1&&!el.hidden&&m.oldValue!==null&&el.isConnected)bubReveal(el)}})
  .observe(document.body,{subtree:true,attributes:true,attributeFilter:['hidden'],attributeOldValue:true});

document.addEventListener('change',ev=>{const i=ev.target;if(!i||i.tagName!=='INPUT'||!/^(checkbox|radio)$/.test(i.type)||!i.checked||apmRM()||i.closest('.sw-toggle'))return;
  apmAnim(i,[{scale:.55},{scale:1}],{duration:460,easing:apmCurve('bouncy')})},true);
