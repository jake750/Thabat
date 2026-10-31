/* ============ v3.152.1 prayer chips after midnight: until the day starts (dayStart) the five of the day still open are all past and can be logged ============ */
function prmLate(){const ld=logicalDate(Date.now()),n=new Date();return ld.toDateString()!==n.toDateString()}
{hookFn('renderPrayers',()=>renderPrayers,f=>{renderPrayers=f},'post',function(){try{if(!prmLate())return;const ks=['fajr','sunrise','dhuhr','asr','maghrib','isha'];
  $$('#prayers .pr').forEach((c,i)=>{const k=ks[i];if(!k||k==='sunrise')return;c.classList.add('past');c.dataset.pk=k});
  bindPrayChips();try{ux3Fold()}catch(e){}}catch(e){console.error(e)}})}
/* v3.152.2 «your day in lines» counts the prayers again whenever a prayer is logged from its chip (it waited for the next full render) */
{hookFn('renderPrayers',()=>renderPrayers,f=>{renderPrayers=f},'post',function(){try{if($('#uxRecap'))uxRecap()}catch(e){console.error(e)}})}
/* v3.152.3 the folded «five on time» line: logging the fifth no longer folds the row at once (8 s, and never while its menu is open,
   so congregation / mosque can still be set), and an opened row gets «اطوِها» to fold it again */
UX3.hold=0;
{const _f=ux3Fold;ux3Fold=function(){const ps=$('#prayers');if(!ps)return _f();const dk=todayKey(),all=ps.querySelectorAll('[data-pk]').length>=5&&PRAYERS.every(k=>plStatus(dk,k)==='on');
  const wait=all&&UX3.open!==dk&&(PRX.on||Date.now()<UX3.hold),sv=UX3.open;if(wait)UX3.open=dk;const r=_f();if(wait)UX3.open=sv;
  let b=$('#ux3Re');const show=all&&UX3.open===dk&&!wait;
  if(!show){if(b)b.remove();return r}
  if(!b){b=document.createElement('button');b.id='ux3Re';b.type='button';b.className='ux3re';b.onclick=()=>{UX3.open='';UX3.hold=0;ux3Fold()}}
  if(b.previousElementSibling!==ps)ps.after(b);b.innerHTML=`<i class="ux3ok">✓</i>${esc(t('ux3.fold'))}`;return r}}
{const _t=ux3Tap;ux3Tap=function(c){UX3.hold=Date.now()+8000;setTimeout(()=>{try{ux3Fold()}catch(e){}},8100);return _t(c)}}
{hookFn('closePP',()=>closePP,f=>{closePP=f},'post',function(){setTimeout(()=>{try{ux3Fold()}catch(e){}},0)})}
