/* ============ theme ============ */
function themeAccent(){const st=S.settings,C=COLORS[st.color]||COLORS.yellow;return st.mode==='light'?C.l:C.d}
function weakDevice(){return ANDROID||(navigator.hardwareConcurrency||8)<=4||(navigator.deviceMemory||8)<=4}
function perfGet(){try{return localStorage.getItem('thabat.perf')||'auto'}catch(e){return'auto'}}
function perfSet(v){try{localStorage.setItem('thabat.perf',v)}catch(e){}}
function isLite(){const v=perfGet();return v==='lite'||(v==='auto'&&weakDevice())||window.LOWP_===true}
function applyTheme(){const st=S.settings,C=COLORS[st.color]||COLORS.yellow,sf=surfaces(st.mode,C.sh),r=document.documentElement.style;
  for(const k in sf)r.setProperty('--'+k,sf[k]);
  const acc=st.accent||themeAccent(),wat=(typeof st.water==='string'&&st.water)||themeAccent();r.setProperty('--accent',acc);r.setProperty('--water',wat);
  r.setProperty('--onAccent',lum(acc)>0.33?'#0b0e13':'#ffffff');
  document.documentElement.classList.toggle('st-glass',st.style==='glass');document.documentElement.classList.toggle('lite',isLite());document.documentElement.classList.toggle('mode-light',st.mode==='light');
  document.body.style.colorScheme=st.mode==='light'?'light':'dark';}

