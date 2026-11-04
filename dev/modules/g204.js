/* ============ v3.169.3 his report 2026-11-04: «⋯» menus open and close smoothly ============ */
/* Every small menu (#ppPop .pppop: card ⋯, task ⋯, board menus…) had only 3.150's .2-s pop, which 3.66's reduce-motion rule cut to nothing,
   and closePP removed it at once. Now it opens with the windows' curve, and closePP leaves a copy (no ids, no pointer) that fades out. */
function ppGhost(p){if(!p||!p.isConnected||p.classList.contains('ppout'))return;const g=p.cloneNode(true);g.removeAttribute('id');g.querySelectorAll('[id]').forEach(x=>x.removeAttribute('id'));
  g.classList.add('ppout');g.setAttribute('aria-hidden','true');g.style.pointerEvents='none';g.scrollTop=p.scrollTop;p.after(g);setTimeout(()=>g.remove(),document.documentElement.classList.contains('rmotion')?200:240)}
hookFn('closePP',()=>closePP,f=>{closePP=f},'pre',function(){try{ppGhost(document.getElementById('ppPop'))}catch(e){}});
/* the own lists and the time/date picker (.rpk, 3.125.1/3.125.2) were removed at once too */
function fxGhost(el,ms){if(!el||!el.isConnected||el.classList.contains('fxout'))return;const g=el.cloneNode(true);g.removeAttribute('id');g.querySelectorAll('[id]').forEach(x=>x.removeAttribute('id'));
  g.classList.add('fxout');g.setAttribute('aria-hidden','true');g.style.pointerEvents='none';el.after(g);setTimeout(()=>g.remove(),ms||280)}
hookFn('rpkClose',()=>rpkClose,f=>{rpkClose=f},'pre',function(){try{fxGhost(RPK.el)}catch(e){}});
hookFn('tpkClose',()=>tpkClose,f=>{tpkClose=f},'pre',function(){try{fxGhost(TPK.el)}catch(e){}});
