/* ============ theme ============ */
function themeAccent(){const st=S.settings,C=COLORS[st.color]||COLORS.yellow;return st.mode==='light'?C.l:C.d}
/* 3.178: three tiers. full = everything; mid «متوازن» = all the motion, glass blur only on floating surfaces, the light rim still;
   lite = no moving effects, no blur. «تلقائي» starts from the device (very weak → lite, phones and 4-core/4 GB → mid, else full)
   and steps down by itself when page switches stutter (perfDown, forgotten after 14 days). Low battery still forces lite. */
var RM_SYS=window.matchMedia?matchMedia('(prefers-reduced-motion: reduce)'):{matches:false,addEventListener(){}};
function perfHint(){const c=navigator.hardwareConcurrency||8,m=navigator.deviceMemory||8;return c<=2||m<=2?'lite':ANDROID||c<=4||m<=4?'mid':'full'}
function perfDown(){try{const o=JSON.parse(localStorage.getItem('thabat.perfDown')||'null');return o&&Date.now()-o.at<14*864e5?Math.min(2,o.n|0):0}catch(e){return 0}}
function perfTier(){const v=perfGet();if(window.LOWP_===true||v==='lite')return'lite';if(v==='full'||v==='mid')return v;
  let t=perfHint();for(let i=perfDown();i>0;i--)t=t==='full'?'mid':'lite';return t}
function weakDevice(){return perfHint()!=='full'}
function perfGet(){try{return localStorage.getItem('thabat.perf')||'auto'}catch(e){return'auto'}}
function perfSet(v){try{localStorage.setItem('thabat.perf',v)}catch(e){}}
function isLite(){return perfTier()==='lite'}
function applyTheme(){const st=S.settings,C=COLORS[st.color]||COLORS.yellow,sf=surfaces(st.mode,C.sh),r=document.documentElement.style;
  for(const k in sf)r.setProperty('--'+k,sf[k]);
  const acc=st.accent||themeAccent(),wat=(typeof st.water==='string'&&st.water)||themeAccent();r.setProperty('--accent',acc);r.setProperty('--water',wat);
  r.setProperty('--onAccent',lum(acc)>0.33?'#0b0e13':'#ffffff');
  document.documentElement.classList.toggle('st-glass',st.style==='glass');document.documentElement.classList.toggle('lite',isLite());document.documentElement.classList.toggle('pmid',perfTier()==='mid');document.documentElement.classList.toggle('mode-light',st.mode==='light');
  document.body.style.colorScheme=st.mode==='light'?'light':'dark';}

