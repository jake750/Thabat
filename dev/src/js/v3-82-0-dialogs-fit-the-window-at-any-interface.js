/* ============ v3.82.0: dialogs fit the window at any interface size; Gregorian month names to choose; the shooting star in the calendar sky ============ */
/* month names: Maghrebi stays the default; the Levantine and Mashriqi lists are options (Arabic only) */
const GMN={mg:['جانفي','فيفري','مارس','أفريل','ماي','جوان','جويلية','أوت','سبتمبر','أكتوبر','نوفمبر','ديسمبر'],
  ms:['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'],
  lv:['كانون الثاني','شباط','آذار','نيسان','أيار','حزيران','تموز','آب','أيلول','تشرين الأول','تشرين الثاني','كانون الأول']};
function gmnApply(){try{LOC.ar.months=(GMN[S.settings.gMon]||GMN.mg).slice()}catch(e){}}
gmnApply();
{hookFn('renderSettings',()=>renderSettings,f=>{renderSettings=f},'post',function(){try{let r=$('#gmnRow');
  if(!r){const a=$('#digField');if(!a)return;a.insertAdjacentHTML('afterend',`<div class="field" id="gmnRow" style="padding:12px 0 0"><div><label data-i18n="gmn.t">${t('gmn.t')}</label><small>${t('gmn.s')}</small></div><select class="in" id="gmnIn" aria-label="${esc(t('gmn.t'))}">${['mg','ms','lv'].map(k=>`<option value="${k}">${esc(t('gmn.'+k))}</option>`).join('')}</select></div>`);r=$('#gmnRow');
    $('#gmnIn').onchange=e=>{S.settings.gMon=e.target.value==='mg'?undefined:e.target.value;gmnApply();save();try{renderAll()}catch(x){}}}
  r.hidden=LANG!=='ar';$('#gmnIn').value=S.settings.gMon||'mg'}catch(e){console.error(e)}})}

/* the shooting star: a day of 16 hours or more (MET_MS, as on the wall) gets one inside its own day cell, drawn over the fill so it is seen on phones too (3.86.1) */
function cmtPlace(){const sky=$('#calSky');if(sky)sky.querySelectorAll('.cmet').forEach(e=>e.remove());$$('#cal .cmetc').forEach(e=>e.remove());if(overBricks())return;const tk=todayKey();
  $$('#cal .cell[data-k]').forEach(c=>{const k=c.dataset.k;if(k>tk||!S.days[k])return;const tot=totals(k).tot;if(tot<MET_MS)return;
    c.insertAdjacentHTML('beforeend',`<i class="cmetc" aria-hidden="true" title="${esc(t('cmt.tip',gStr(keyToDate(k)),fmtHM(tot)))}"></i>`);c.classList.add('hasmet')})}
{hookFn('placeCalSky',()=>placeCalSky,f=>{placeCalSky=f},'post',function(){try{cmtPlace()}catch(e){console.error(e)}})}
{hookFn('renderCal',()=>renderCal,f=>{renderCal=f},'post',function(){try{cmtPlace()}catch(e){}})}

