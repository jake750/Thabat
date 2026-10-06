/* ============ v3.4.1: macOS (no helper): skip Mawaqit search, use calculated times ============ */
if(MAC){
  const _sm=suMosques;suMosques=function(retry){if(!MAC)return _sm(retry);SU.method=CC_METHOD[SU.cc]||'mwl';suPickCalc()};
  const _rs=renderSetup;renderSetup=function(){_rs();$$('#setupBox p').forEach(e=>{if(e.textContent.trim()===t('su.intro'))e.textContent=t('su.introMac')});const q=$('#suMq');if(!q)return;const row=q.closest('.surow');if(!row)return;const lb=row.previousElementSibling,ls=row.nextElementSibling;
    if(lb&&lb.classList.contains('sul'))lb.remove();if(ls&&ls.classList.contains('sulist'))ls.remove();row.remove()}}
/* ---- sleep chip opens the multi-period sleep log (night + naps), not the hours picker ---- */
{const _ha=hbAsk;hbAsk=function(h,anchor){if(h&&h.id==='sleep'&&h.type==='hours'){openSleep();return}_ha(h,anchor)}}
{const _os=openSleep;openSleep=function(){_os();const x=$('#infoX'),a=x&&x.closest('.evact');if(a)a.remove()}}
