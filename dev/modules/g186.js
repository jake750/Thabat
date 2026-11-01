/* ============ v3.157.1 the Today chip row on PC: no scrollbar, edge fades, drag to scroll ============ */
function evfPaint(){try{const b=$('#todayEv');if(!b)return;const max=b.scrollWidth-b.clientWidth,pos=Math.abs(b.scrollLeft),rtl=getComputedStyle(b).direction==='rtl';
  const st=max>2&&pos>2,en=max>2&&pos<max-2;b.classList.toggle('evfL',rtl?en:st);b.classList.toggle('evfR',rtl?st:en)}catch(e){}}
const EVF={b:null,d:null};
function evfBind(){const b=$('#todayEv');if(!b||EVF.b===b)return;EVF.b=b;
  b.addEventListener('scroll',evfPaint,{passive:true});
  b.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.button!==0||b.scrollWidth<=b.clientWidth+2)return;EVF.d={x:e.clientX,s:b.scrollLeft,m:false}});
  window.addEventListener('pointermove',e=>{const d=EVF.d;if(!d)return;const dx=(e.clientX-d.x)/uiZoom();if(!d.m&&Math.abs(dx)<6)return;if(!d.m){d.m=true;b.classList.add('evfdrag')}b.scrollLeft=d.s-dx});
  window.addEventListener('pointerup',()=>{const d=EVF.d;EVF.d=null;b.classList.remove('evfdrag');if(d&&d.m){const sw=ev=>{ev.stopPropagation();ev.preventDefault()};window.addEventListener('click',sw,{capture:true,once:true});setTimeout(()=>window.removeEventListener('click',sw,true),60)}});
  if(window.ResizeObserver)new ResizeObserver(evfPaint).observe(b)}
{hookFn('renderTodayEv',()=>renderTodayEv,f=>{renderTodayEv=f},'post',function(){evfBind();evfPaint();setTimeout(evfPaint,60)})}
setTimeout(()=>{evfBind();evfPaint()},300);
