/* ============ v3.20.2: keeping your data safe — two windows stay in step, and the start-up recovery never swaps in a copy with less in it ============ */
/* how much a saved copy holds: days, tasks and notes */
function stCount(o){let d=0,tk=0;const D=(o&&o.days)||{};for(const k in D){d++;tk+=((D[k]&&D[k].tasks)||[]).length}return{d,tk,n:((o&&o.notes)||[]).length}}
function stLess(b,a){return b.d<a.d||b.tk<a.tk||b.n<a.n}
/* another Thabat window (or tab) saved: take its newer data instead of overwriting it later with ours */
window.addEventListener('storage',e=>{if(e.key!==KEY||!e.newValue)return;try{const o=JSON.parse(e.newValue);if(!o||!o.days||!o.settings||o._slim)return;if((o._savedAt||0)<=(S._savedAt||0))return;
  clearTimeout(lsT);lsT=null;S=o;if(S.settings.lang&&S.settings.lang!==LANG){LANG=S.settings.lang;try{applyI18n()}catch(x){}}try{renderAll()}catch(x){}}catch(x){}});
/* speed: within one drawing of Today, prayer times are computed once per day (they were computed ~39 times) and «your day between the prayers» is drawn once (it was drawn twice) */
let RT_PASS=null;
{const _pt=prayerTimes;prayerTimes=function(date,...a){if(!RT_PASS||a.length||!(date instanceof Date))return _pt(date,...a);const k=date.getFullYear()+'-'+date.getMonth()+'-'+date.getDate();let v=RT_PASS.pt.get(k);if(!v){v=_pt(date);RT_PASS.pt.set(k,v)}return v&&typeof v==='object'?{...v}:v}}
{const _pr=pdlRender;pdlRender=function(...a){if(RT_PASS&&!a.length){const c=document.getElementById('pdlCard');if(RT_PASS.pdl&&c&&c.isConnected)return;RT_PASS.pdl=1}return _pr(...a)}}
{const _rt=renderToday;renderToday=function(...a){if(RT_PASS)return _rt(...a);RT_PASS={pt:new Map(),pdl:0};try{return _rt(...a)}finally{RT_PASS=null}}}

