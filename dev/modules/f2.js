/* ============ v3.4.1: macOS (no helper): skip Mawaqit search, use calculated times ============ */
if(MAC){
  const _sm=suMosques;suMosques=function(retry){if(!MAC)return _sm(retry);SU.method=CC_METHOD[SU.cc]||'mwl';suPickCalc()};
  const _rs=renderSetup;renderSetup=function(){_rs();$$('#setupBox p').forEach(e=>{if(e.textContent.trim()===t('su.intro'))e.textContent=t('su.introMac')});const q=$('#suMq');if(!q)return;const row=q.closest('.surow');if(!row)return;const lb=row.previousElementSibling,ls=row.nextElementSibling;
    if(lb&&lb.classList.contains('sul'))lb.remove();if(ls&&ls.classList.contains('sulist'))ls.remove();row.remove()}}
/* ---- sleep chip opens the multi-period sleep log (night + naps), not the hours picker ---- */
{const _ha=hbAsk;hbAsk=function(h,anchor){if(h&&h.id==='sleep'&&h.type==='hours'){openSleep();return}_ha(h,anchor)}}
{const _os=openSleep;openSleep=function(k){_os(k);const x=$('#infoX'),a=x&&x.closest('.evact');if(a)a.remove()}}
/* ---- sleep for any day: a sleep section in the calendar day panel ---- */
{const _rd=renderDetail;renderDetail=function(k){_rd(k);try{if(k>todayKey())return;const mb=$('#detail .minibar');if(!mb)return;const P=slPeriods(S.days[k]),tot=P.reduce((a,p)=>a+slMins(p),0);
  mb.insertAdjacentHTML('afterend',`<div class="sec sl5"><b>😴 ${t('sl3.t')}${P.length?` <span class="end">${fmtHM(tot*6e4)}</span>`:''}</b><ul>${P.map(p=>`<li><span dir="ltr">${p.f} – ${p.t}</span><span class="end">${fmtHM(slMins(p)*6e4)}</span></li>`).join('')}</ul><button class="btn sm ghost" id="dSleep">${P.length?'✎ '+t('sl5.edit'):'+ '+t('sl5.add')}</button></div>`);
  $('#dSleep').onclick=()=>openSleep(k)}catch(e){console.error(e)}}}
