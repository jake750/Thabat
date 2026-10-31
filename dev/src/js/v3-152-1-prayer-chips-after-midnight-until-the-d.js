/* ============ v3.152.1 prayer chips after midnight: until the day starts (dayStart) the five of the day still open are all past and can be logged ============ */
function prmLate(){const ld=logicalDate(Date.now()),n=new Date();return ld.toDateString()!==n.toDateString()}
{hookFn('renderPrayers',()=>renderPrayers,f=>{renderPrayers=f},'post',function(){try{if(!prmLate())return;const ks=['fajr','sunrise','dhuhr','asr','maghrib','isha'];
  $$('#prayers .pr').forEach((c,i)=>{const k=ks[i];if(!k||k==='sunrise')return;c.classList.add('past');c.dataset.pk=k});
  bindPrayChips();try{ux3Fold()}catch(e){}}catch(e){console.error(e)}})}

