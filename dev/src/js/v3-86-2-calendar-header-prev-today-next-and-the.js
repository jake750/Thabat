/* ============ v3.86.2: calendar header — prev, today, next and the agenda in one row; the colour legend behind an «i» beside the month title ============ */
/* 3.73's cal4Legend looked up #calLeg, the id of the legend button, so it filled the button with the legend and the header broke into rows.
   The legend now lives in the window the «i» opens (calLegend), and the button is moved next to the title. */
const CLG_I='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v6"/><circle cx="12" cy="7.6" r=".6" fill="currentColor"/></svg>';
function clgHTML(){return`<div class="calleg">${['lf:clg.fill','lg:clg.gold','lm:clg.msb','lq:clg.q','le:clg.ev','lt:clg.today'].map(x=>{const[c,k]=x.split(':');return`<span><i class="${c}"></i>${esc(t(k))}</span>`}).join('')}</div>`}
cal4Legend=function(){};
function clgPaint(){const b=$('#calLeg');if(!b)return;if(b.dataset.clg!=='1'){b.dataset.clg='1';b.className='btn sm ghost clgi';const ttl=$('#calTtl');if(ttl&&b.parentElement!==ttl.parentElement)ttl.after(b)}
  b.innerHTML=CLG_I;b.setAttribute('aria-label',t('lg.title'));b.title=t('lg.title')}
{hookFn('renderCal',()=>renderCal,f=>{renderCal=f},'post',function(){try{clgPaint()}catch(e){}})}
{const _l=calLegend;calLegend=function(btn,...a){const r=_l(btn,...a);try{const p=$('#ppPop');if(p&&p.classList.contains('callg')&&!p.querySelector('.calleg'))p.insertAdjacentHTML('afterbegin',clgHTML())}catch(e){}return r}}

