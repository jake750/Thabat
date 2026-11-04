/* ============ v3.170.3 (his request 2026-11-04): the tasbih ring fills slowly with each count ============ */
const TSRG={last:{}};
function tsRingPaint(){const el=document.getElementById('tsTap');if(!el)return;const L_=TSB(),c=L_.find(x=>x.id===TSC)||L_[0];if(!c)return;
  const n=tsbCount(c.id),g=Math.max(1,+c.goal||1),p=Math.min(1,n/g),C=2*Math.PI*105;
  const prev=TSRG.last[c.id]!=null?TSRG.last[c.id]:p;TSRG.last[c.id]=p;
  el.classList.add('tsfillw');
  el.insertAdjacentHTML('afterbegin',`<svg class="tsfill" viewBox="0 0 220 220" aria-hidden="true"><circle cx="110" cy="110" r="105" pathLength="${C}" style="stroke-dasharray:${C};stroke-dashoffset:${C*(1-prev)}"/></svg>`);
  const ci=el.querySelector('.tsfill circle');void ci.getBoundingClientRect();
  requestAnimationFrame(()=>{ci.style.strokeDashoffset=C*(1-p)});setTimeout(()=>{ci.style.strokeDashoffset=C*(1-p)},40);
  if(p>prev){el.classList.remove('tsbump');void el.offsetWidth;el.classList.add('tsbump')}}
hookFn('renderTasbih',()=>renderTasbih,f=>{renderTasbih=f},'post',function(){try{tsRingPaint()}catch(e){}});
/* v3.170.3 (his screenshot 2026-11-04): «هـ» stays on the line of the year: a no-break space before the suffix and between the year and it */
{const _f=hStr;hStr=function(...a){const r=_f.apply(this,a);return typeof r==='string'?r.replace(/ (\d+) (هـ|AH)$/,'\u00a0$1\u00a0$2').replace(/ (هـ|AH)$/,'\u00a0$1'):r}}
{const _t=t;t=function(...a){const r=_t.apply(this,a);return typeof r==='string'&&r.indexOf(' هـ')>=0?r.replace(/ هـ/g,'\u00a0هـ'):r}}
