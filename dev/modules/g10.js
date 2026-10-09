/* ============ v3.8.2: one Friday al-Kahf task; phone Quran bar: centred «⋯» and full screen beside it ============ */
/* al-Kahf: a fixed id per date (two synced devices create the same task) and duplicates are folded into one */
function kahfDedupe(d){if(!d||!d.tasks)return false;const L_=d.tasks.filter(x=>x.auto==='kahf');if(L_.length<2)return false;const keep=L_.find(x=>x.done)||L_[0];d.tasks=d.tasks.filter(x=>x.auto!=='kahf'||x===keep);return true}
ensureKahf=function(){const k=todayKey();if(keyToDate(k).getDay()!==5)return;const d=day(k);let ch=kahfDedupe(d);
  if(!d.kahf){d.kahf=1;if(!d.tasks.some(x=>x.auto==='kahf'))d.tasks.unshift({id:'kahf-'+k,text:t('kahf.task'),done:false,created:Date.now(),auto:'kahf'});ch=true}if(ch)save()};
try{let ch=false;for(const k in S.days)if(kahfDedupe(S.days[k]))ch=true;if(ch)save()}catch(e){}
/* phone Quran bar: an icon «⋯» drawn centred, and the full-screen button out of the sheet, next to it */
const QB_DOTS='<svg class="qbdots" viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>',
  QB_FS='<svg class="qbfsi" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>';
{const _ql=qbLayout;qbLayout=function(){_ql();const top=$('#qbTop'),more=$('#qbMore'),fs=$('#qFsBtn');if(!top||!more||!fs||!MOB.matches)return;
  if(!more.querySelector('.qbdots'))more.innerHTML=QB_DOTS;if(fs.parentElement!==top)top.insertBefore(fs,more);if(!fs.querySelector('.qbfsi'))fs.insertAdjacentHTML('afterbegin',QB_FS);fs.title=t('q.fs');fs.setAttribute('aria-label',t('q.fs'))}}
