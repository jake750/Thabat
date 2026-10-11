/* ============ Android widget ============ */
let widgetLast='';
function widgetPush(){if(!ANDROID)return;try{if(!window.ThabatAndroid.widget)return;const pr=[];for(let d=0;d<2;d++){const date=new Date();date.setDate(date.getDate()+d);const pt=prayerTimes(date);PRAYERS.forEach(k=>pr.push({n:t('pr.'+k),t:pt[k],s:fmtT(pt[k])}))}
  const k=todayKey(),{tot}=totals(k),g=goalMs(k),pct=Math.floor(tot/g*100),m=adhProgress('m'),e=adhProgress('e'),lvl=adhLvl((S.days[k]||{}).adh);
  const o={pr,nextLbl:t('w.next'),prog:t('w.prog',pct,fmtHM(tot)),pct:Math.min(100,pct),adhLbl:'📿 '+t('adh.title')+(lvl?' · '+'●'.repeat(lvl):''),none:t('w.none')},js=JSON.stringify(o);
  if(js===widgetLast)return;widgetLast=js;window.ThabatAndroid.widget(js)}catch(e){}}
