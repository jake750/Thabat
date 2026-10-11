/* ============ header & prayers ============ */
let curKey;
function renderHeader(){const ld=logicalDate(Date.now());$('#dateH').textContent=L().days[ld.getDay()]+' '+hStr(ld);$('#dateG').textContent=gStr(ld)}
function nextPrayer(){const now=Date.now();for(let i=0;i<2;i++){const d=new Date();d.setDate(d.getDate()+i);const pt=prayerTimes(d);for(const k of PRAYERS)if(pt[k]>now)return{k,t:pt[k]}}}
function renderPrayers(){if(ANDROID)setTimeout(androidSchedule,300);const pt=prayerTimes(new Date()),now=Date.now(),nx=nextPrayer();
  $('#prayers').innerHTML=['fajr','sunrise','dhuhr','asr','maghrib','isha'].map(k=>`<div class="pr ${nx&&nx.k===k&&new Date(nx.t).toDateString()===new Date().toDateString()?'next':''} ${pt[k]<now?'past':''}" ${k!=='sunrise'&&pt[k]<now?`data-pk="${k}"`:''}>${k!=='sunrise'?plMark(todayKey(),k):''}<b>${t('pr.'+k)}</b><span>${fmtT(pt[k])}</span></div>`).join('');bindPrayChips();renderTodayEv();
  if(nx){const m=Math.ceil((nx.t-now)/6e4);$('#nextLine').innerHTML=t('next.in',t('pr.'+nx.k),m>=60?t('dur.hm',Math.floor(m/60),m%60):minW(m))}}

