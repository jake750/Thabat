/* ============ v3.178.0 performance (2026-11-20, his picks 1–10 of the performance list) ============ */
/* (1) «تلقائي» steps down by itself: after a page switch the next 0.7 s of frames are timed; when, over the last five switches,
       the middle one had 30 % or more of its frames late (over 34 ms), the tier drops one step (full → balanced → light)
       and stays there for 14 days. Choosing a mode by hand forgets it. The first switch after start-up is not counted. */
const PFW={n:0,s:[],on:0};
function perfSample(){if(perfGet()!=='auto'||window.LOWP_===true||document.hidden||PFW.on||apmRM()||perfTier()==='lite')return;
  if(++PFW.n<2)return;PFW.on=1;let last=0;const fr=[],end=performance.now()+700;
  const f=t=>{if(last)fr.push(t-last);last=t;if(t<end&&!document.hidden)requestAnimationFrame(f);else{PFW.on=0;perfJudge(fr)}};requestAnimationFrame(f)}
function perfJudge(fr){if(fr.length<8||document.hidden)return;PFW.s.push(fr.filter(x=>x>34).length/fr.length);if(PFW.s.length>5)PFW.s.shift();
  if(PFW.s.length<5||[...PFW.s].sort((a,b)=>a-b)[2]<.3)return;PFW.s=[];
  try{localStorage.setItem('thabat.perfDown',JSON.stringify({n:Math.min(2,perfDown()+1),at:Date.now()}))}catch(e){}
  applyTheme();if(curView()==='set')try{renderSettings()}catch(e){}}
{hookFn('showView',()=>showView,f=>{showView=f},'post',function(){try{perfSample()}catch(e){}})}
{hookFn('perfSet',()=>perfSet,f=>{perfSet=f},'post',function(){try{localStorage.removeItem('thabat.perfDown')}catch(e){}PFW.s=[]})}

/* (5) the system's «reduce motion» switched while the app is open */
try{RM_SYS.addEventListener('change',()=>{try{lkApply()}catch(e){}})}catch(e){}

/* (3) nothing moves when nobody can see it: the app hidden (another app, a minimised window) pauses every CSS animation;
       an endless animation scrolled out of sight (waves, sky, shimmer, spinners) pauses until it comes back. */
document.addEventListener('visibilitychange',()=>document.documentElement.classList.toggle('pghid',document.hidden));
const PFO={io:null,seen:new WeakSet()};
function perfOffscan(){if(!window.IntersectionObserver||!document.getAnimations)return;
  if(!PFO.io)PFO.io=new IntersectionObserver(es=>{for(const e of es)e.target.classList.toggle('pfoff',!e.isIntersecting)});
  for(const a of document.getAnimations()){const ef=a.effect,el=ef&&ef.target;
    if(!el||el.nodeType!==1||PFO.seen.has(el)||el===document.documentElement||el===document.body||el.closest('#aurora,.toast,#thSplash'))continue;
    const tm=ef.getTiming&&ef.getTiming();if(!tm||tm.iterations!==Infinity)continue;PFO.seen.add(el);PFO.io.observe(el)}}
{const ric=window.requestIdleCallback||(f=>setTimeout(f,1));hookFn('showView',()=>showView,f=>{showView=f},'post',function(){setTimeout(()=>ric(()=>{try{perfOffscan()}catch(e){}},{timeout:3000}),900)})}
setTimeout(()=>{try{perfOffscan()}catch(e){}},2500);

/* (7) start-up and every animation: apmCurve read a variable from <html>'s computed style each time it was called
       (once per animation, which forces the browser to work out styles in the middle of a click); it is read once and kept,
       and read again only after the look changes. */
{const _ac=apmCurve,C={};apmCurve=function(n){return C[n]||(C[n]=_ac(n))};
  const clr=()=>{for(const k in C)delete C[k]};
  hookFn('applyTheme',()=>applyTheme,f=>{applyTheme=f},'post',clr);try{hookFn('lkApply',()=>lkApply,f=>{lkApply=f},'post',clr)}catch(e){}}

/* (7, 9) the Today event strip measured itself (scroll width + computed direction) up to three times per Today redraw and on
       every resize: now once per frame at most, when the browser lays out anyway */
{const _ep=evfPaint;let q=0;evfPaint=function(){if(q)return;q=requestAnimationFrame(()=>{q=0;_ep()})}}
