/* ============ v3.183.0 lighter app, sections that open at once (2026-11-25, Qalun mushaf plan, phases 0–1) ============ */
/* 0. one clock for the glass light: every rim's orbitA/orbitB starts at time 0 of the page, so all rims show the same light.
      New cards (a redraw) and rims that were paused off screen are put back on the clock a moment later. */
function orbSync(root){const h=document.documentElement;if(!h.classList.contains('st-glass'))return;
  const list=root?root.getAnimations({subtree:true}):document.getAnimations?document.getAnimations():[];
  for(const a of list){const n=a.animationName;if((n==='orbitA'||n==='orbitB')&&a.playState==='running'&&a.startTime!==0)try{a.startTime=0}catch(e){}}}
/*    only the cards a redraw adds are looked at (a full scan every 2 s cost 270 ms of script per 3 s on the PC); a full pass runs
      when the app comes back to the screen and after scrolling, where the browser may have restarted rims it had paused */
{const add=new Set();let t=0,full=false;const run=()=>{t=0;const f=full,ns=[...add];full=false;add.clear();
    (window.requestIdleCallback||(f=>f()))(()=>{try{if(f)orbSync();else ns.forEach(n=>n.isConnected&&orbSync(n))}catch(e){}},{timeout:800})};
  const later=all=>{if(all)full=true;if(!t)t=setTimeout(run,250)};
  new MutationObserver(ms=>{for(const m of ms)for(const n of m.addedNodes)if(n.nodeType===1)add.add(n);if(add.size>200)full=true;later()}).observe(document.body,{childList:true,subtree:true});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)later(true)});addEventListener('scrollend',()=>later(true),{capture:true,passive:true});setTimeout(()=>later(true),600)}

/* 1. opening «القرآن» or «التقويم» redrew the whole section every time (the mushaf: 185–310 ms on the PC, 0.7–0.9 s on a phone).
      Now the redraw is skipped when nothing it shows has changed since it was last drawn: no save since then, same day, language,
      window size, theme classes, riwaya (and its text pack loaded) or calendar month, and less than five minutes ago.
      Only the opening goes through here; every other redraw (a page turn, a setting) still draws as before. */
/*    A save counts when it comes within 3 s of something you did (a tap, a key, a change; taps on the section buttons themselves
      do not count, nor saves made while switching): timed background saves (weather, calendar feed, update check) do not touch
      what these sections show. Anything that redraws everything (renderAll: language, sync) counts too. When in doubt it redraws. */
const SEC={n:0,rz:0,sv:0,inp:-1e9,quran:null,cal:null};
['pointerdown','keydown','input','change'].forEach(ev=>addEventListener(ev,e=>{if(!(e.target&&e.target.closest&&e.target.closest('.navbtn')))SEC.inp=performance.now()},{capture:true,passive:true}));
hookFn('showView',()=>showView,f=>{showView=f},'pre',function(){SEC.sv++});
hookFn('showView',()=>showView,f=>{showView=f},'post',function(){SEC.sv=Math.max(0,SEC.sv-1)});
hookFn('save',()=>save,f=>{save=f},'post',function(){if(!SEC.sv&&performance.now()-SEC.inp<3000)SEC.n++});
hookFn('renderAll',()=>renderAll,f=>{renderAll=f},'pre',function(){SEC.n++});
addEventListener('resize',()=>{SEC.rz++});   /* reading the window size right after a view switch forced a layout (37 ms on a phone) */
function secSig(v){const h=document.documentElement,Q=S.quran||{};
  return[SEC.n,SEC.rz,LANG,todayKey(),MOB.matches,h.className.replace(/\b(pghid|ux8sh|apm\S*|bub\S*)\b/g,'').replace(/\s+/g,' ').trim(),
    v==='quran'?JSON.stringify(Q)+JSON.stringify(qDay(todayKey()))+':'+!!(typeof QB==='object'&&QB[Q.riwaya]):+calM].join('|')}
function secMark(v){SEC[v]={sig:secSig(v),at:Date.now()}}
hookFn('renderQuran',()=>renderQuran,f=>{renderQuran=f},'post',function(){secMark('quran')});
hookFn('renderCal',()=>renderCal,f=>{renderCal=f},'post',function(){secMark('cal')});
function secFresh(v){const m=SEC[v];if(!m||Date.now()-m.at>3e5||m.sig!==secSig(v))return false;
  if(v==='quran'){const sp=$('#spread');if(!sp||!sp.firstElementChild||sp.querySelector('.fail,.qload'))return false}
  if(v==='cal'&&!($('#cal')&&$('#cal').firstElementChild))return false;return true}
secRender=function(v){if(secFresh(v))return;if(v==='quran')renderQuran();else if(v==='cal')renderCal()};

/* 1b. a page that came from the saved copy on this device kept a new blob address for every redraw, so the browser decoded it again
       each time (and never freed the old address): the address of the last 12 pages is kept and reused. */
const QURL=new Map();
function qurlKeep(k,u){if(QURL.get(k)===u)return;QURL.delete(k);QURL.set(k,u);while(QURL.size>12){const [k0,u0]=QURL.entries().next().value;QURL.delete(k0);try{URL.revokeObjectURL(u0)}catch(e){}}}
{const _ql=qLoadImg;qLoadImg=function(im,p,r){const k=r+':'+p,u=QURL.get(k);
  if(u&&!qFilterOf(im)){im.decoding='async';im.onerror=()=>{im.onerror=null;QURL.delete(k);_ql(im,p,r)};im.src=u;return}
  _ql(im,p,r);im.addEventListener('load',function h(){if(im.src.startsWith('blob:')&&!im.classList.contains('pre')){im.removeEventListener('load',h);qurlKeep(k,im.src)}})}}
