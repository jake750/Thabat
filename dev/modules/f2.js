/* ============ v3.4.1: macOS (no helper): skip Mawaqit search, use calculated times ============ */
if(MAC){
  const _sm=suMosques;suMosques=function(retry){if(!MAC)return _sm(retry);SU.method=CC_METHOD[SU.cc]||'mwl';suPickCalc()};
  const _rs=renderSetup;renderSetup=function(){_rs();$$('#setupBox p').forEach(e=>{if(e.textContent.trim()===t('su.intro'))e.textContent=t('su.introMac')});const q=$('#suMq');if(!q)return;const row=q.closest('.surow');if(!row)return;const lb=row.previousElementSibling,ls=row.nextElementSibling;
    if(lb&&lb.classList.contains('sul'))lb.remove();if(ls&&ls.classList.contains('sulist'))ls.remove();row.remove()}}
