/* ============ v3.174.0 his request 2026-11-08: a start-up screen and a lighter start ============ */
/* The look (html classes and colours, direction, language) is kept small in localStorage['thabat.boot'] so head.html can paint
   the start-up screen (body.html, #thSplash) and the page in the right colours before the app script runs. */
function bootSave(){try{const de=document.documentElement,TR=typeof M16_TR!=='undefined'?M16_TR:[];
  const j=JSON.stringify({cls:[...de.classList].filter(k=>!TR.includes(k)).join(' '),st:de.getAttribute('style')||'',dir:de.dir,lang:de.lang});
  if(localStorage.getItem('thabat.boot')!==j)localStorage.setItem('thabat.boot',j)}catch(e){}}
function bootSoon(){clearTimeout(bootSoon.t);bootSoon.t=setTimeout(bootSave,700)}
hookFn('applyTheme',()=>applyTheme,f=>{applyTheme=f},'post',bootSoon);
hookFn('applyI18n',()=>applyI18n,f=>{applyI18n=f},'post',bootSoon);
addEventListener('pagehide',bootSave);
