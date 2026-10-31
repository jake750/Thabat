/* ============ v3.147 g174b: the board scrolls by itself while selecting or dragging near its edge ============ */
const WBAP={x:0,y:0,id:null,t:0};
window.addEventListener('pointermove',e=>{WBAP.x=e.clientX;WBAP.y=e.clientY;WBAP.id=e.pointerId;WBAP.pt=e.pointerType},true);
function wbAutoPan(){const o=typeof WB!=='undefined'&&WB.op,wrap=$('#bwrap');
  if(!o||!wrap||!['marq','lasso','move','shape','resize'].includes(o.k)||!WB.ptrs||!WB.ptrs.has(WBAP.id)){WBAP.t=0;return}
  const r=wrap.getBoundingClientRect(),E=48,sp=d=>Math.round(4+18*Math.min(1,Math.max(0,(E-d)/E)));
  let dx=0,dy=0;const l=WBAP.x-r.left,ri=r.right-WBAP.x,tp=WBAP.y-r.top,bt=r.bottom-WBAP.y;
  if(l<E)dx=sp(l);else if(ri<E)dx=-sp(ri);if(tp<E)dy=sp(tp);else if(bt<E)dy=-sp(bt);
  if(!dx&&!dy){WBAP.t=0;return}
  if(!WBAP.t){WBAP.t=Date.now();return}if(Date.now()-WBAP.t<120)return;
  const v=wbView();v.x+=dx;v.y+=dy;wbApplyView();
  try{wrap.dispatchEvent(new PointerEvent('pointermove',{pointerId:WBAP.id,pointerType:WBAP.pt||'mouse',clientX:WBAP.x,clientY:WBAP.y,bubbles:true,isPrimary:true}))}catch(x){}}
setInterval(wbAutoPan,16);
/* the board's tool bar stays on screen: the board fits the window at any interface size, and the bar follows the visible bottom when the page is scrolled */
function wbBarKeep(){const w=$('#bwrap'),b=$('#btbar');if(!w||!b||!w.offsetParent)return;const z=uiZoom()||1,r=w.getBoundingClientRect(),vb=(window.visualViewport?visualViewport.offsetTop+visualViewport.height:innerHeight);
  if(!w.classList.contains('present')){const m=w.closest('main'),top=r.top+(m?m.scrollTop:0),h=Math.max(MOB.matches?300:360,Math.round((vb-top)/z-(MOB.matches?86:14)))+'px';if(w.style.height!==h){w.style.height=h;try{wbApplyView()}catch(e){}}}
  const over=Math.max(0,r.bottom-vb),px=over>0?Math.min(over,r.height-80)/z:0;const v=px?`${12+px}px`:'';
  [b,$('#bmini')].forEach(el=>{if(el&&el.style.bottom!==v)el.style.bottom=v})}
['scroll','resize'].forEach(ev=>window.addEventListener(ev,()=>requestAnimationFrame(wbBarKeep),{capture:true,passive:true}));
if(window.visualViewport)visualViewport.addEventListener('resize',()=>wbBarKeep());
{hookFn('showView',()=>showView,f=>{showView=f},'post',function(){setTimeout(wbBarKeep,320)})}
setInterval(wbBarKeep,1500);
