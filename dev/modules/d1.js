/* ============ v3.3 worship: prayer map, end-of-time alert, jamaah, Friday last hour, Ramadan, niyyah, travel, per-prayer adhan ============ */
const W3=()=>S.settings.w3||(S.settings.w3={endOn:true,endMin:20,friLast:true,friSal:true,niyya:true,travel:false,adhPer:{}});
/* 14. adhan per prayer: full / takbir / off */
function adhPK(k){const m=(W3().adhPer||{})[k];return m||adhanCfg().mode}
/* 3. prayed in congregation */
function jmHas(dk,k){const d=S.days[dk];return!!(d&&d.jama&&d.jama[k])}
function jmToggle(dk,k){const d=day(dk);d.jama=d.jama||{};if(d.jama[k])delete d.jama[k];else d.jama[k]=1;save()}
{const _bpc=bindPrayChips;bindPrayChips=function(){_bpc();$$('#prayers [data-pk]').forEach(c=>{const o=c.onclick;c.onclick=e=>{o(e);const p=$('#ppPop');if(!p)return;const k=c.dataset.pk,dk=todayKey();
  p.insertAdjacentHTML('beforeend',`<button data-jm3>${jmHas(dk,k)?'☑':'☐'} 🕌 ${t('jm3.lbl')}</button>`);p.querySelector('[data-jm3]').onclick=()=>{closePP();jmToggle(dk,k);renderPrayers();toast(jmHas(dk,k)?t('jm3.on'):t('jm3.off'))}}});
  $$('#prayers [data-pk]').forEach(c=>{if(jmHas(todayKey(),c.dataset.pk))c.classList.add('jm3')})}}
/* 1 + 4. prayer map for the year, congregation and rawatib */
function openPrayMap(tab){tab=tab||'on';const tk=todayKey(),end=keyToDate(tk),start=addDays(end,-364),wd0=start.getDay(),cells=[];
  for(let i=0;i<365;i++){const dt=addDays(start,i),k=dKey(dt);let v=0,mx=5;
    if(tab==='on')PRAYERS.forEach(p=>{const s=plStatus(k,p);if(s==='on'||s==='auto')v++});
    else if(tab==='jm')PRAYERS.forEach(p=>{if(jmHas(k,p))v++});
    else{mx=12;Object.keys(RAWATIB).forEach(p=>{v+=snCount(k,p)})}
    cells.push({k,v,mx,dt})}
  const lv=c=>c.v<=0?0:Math.min(4,Math.ceil(c.v/c.mx*4));
  const grid=`<div class="pmap" dir="ltr">${Array(wd0).fill('<i class="e"></i>').join('')}${cells.map(c=>`<i class="l${lv(c)}" title="${gStr(c.dt)} · ${c.v}"></i>`).join('')}</div>`;
  const keys=cells.map(c=>c.k),tot=cells.reduce((a,c)=>a+c.v,0),days=cells.filter(c=>c.v>=c.mx).length;
  /* last 8 weeks bars */
  const wk=[];for(let w=7;w>=0;w--){let v=0;for(let i=0;i<7;i++){const c=cells[364-w*7-i];if(c)v+=c.v}wk.push(v)}const wm=Math.max(1,...wk);
  const bars=`<div class="pmbars">${wk.map((v,i)=>`<div><b style="height:${Math.round(v/wm*60)+2}px"></b><small>${v}</small></div>`).join('')}</div><small class="muted">${t('pm.weeks')}</small>`;
  openInfo('🕌 '+t('pm.t'),`<div class="seg pmseg">${[['on','pm.on'],['jm','pm.jm'],['sn','pm.sn']].map(([k,l])=>`<button data-pm="${k}" class="${tab===k?'on':''}">${t(l)}</button>`).join('')}</div>
    <div class="pmstat"><div><b>${tot}</b><small>${t(tab==='sn'?'pm.rk':'pm.prayers')}</small></div><div><b>${days}</b><small>${t('pm.full')}</small></div></div>${grid}
    <div class="pmleg">${t('pm.less')} <i class="l0"></i><i class="l1"></i><i class="l2"></i><i class="l3"></i><i class="l4"></i> ${t('pm.more')}</div>${bars}`);
  $$('[data-pm]').forEach(b=>b.onclick=()=>openPrayMap(b.dataset.pm))}
{const rv=$('#rvBtn');if(rv&&!$('#pmBtn')){rv.insertAdjacentHTML('beforebegin',`<button class="btn sm ghost" id="pmBtn">🕌 <span>${t('pm.btn')}</span></button>`);$('#pmBtn').onclick=()=>openPrayMap()}}
{const _rbP=renderBrief;renderBrief=function(){_rbP();const b=$('#pmBtn');if(b)b.querySelector('span').textContent=t('pm.btn')}}
/* 2. the prayer time is about to end and it is not logged */
function endCheck(){const W=W3();if(!W.endOn)return;const now=Date.now(),dk=todayKey(),A=S.endAsk||(S.endAsk={});
  for(const k of PRAYERS){const s=plStatus(dk,k);const d=S.days[dk];if((d&&d.prayed&&d.prayed[k])||(s&&s!=='q'&&s!=='auto'))continue;const pt=prayerTimes(keyToDate(dk))[k];if(now<pt)continue;const we=plWinEnd(k,dk),at=we-(+W.endMin||20)*6e4;
    if(now>=at&&now<we&&!A[dk+k]){A[dk+k]=1;save();toastAct(t('end.t',t('pr.'+k),Math.max(1,Math.round((we-now)/6e4))),t('pray.done'),()=>{plSet(dk,k,'on');const dd=day(dk);(dd.prayed=dd.prayed||{})[k]=Date.now();save();renderPrayers()},60000);try{chime(1)}catch(e){}}}
  Object.keys(A).forEach(x=>{if(x.slice(0,10)<dk)delete A[x]})}
setInterval(endCheck,60000);setTimeout(endCheck,8000);
/* 6. Friday: last hour before Maghrib + salawat reminders */
function friItems(out,now){const W=W3();const td=keyToDate(todayKey());for(let i=0;i<7;i++){const d=addDays(td,i);if(d.getDay()!==5)continue;const pt=prayerTimes(d);
  if(W.friLast){const at=pt.maghrib-60*6e4;if(at>now)out.push({id:6800+i,t:at,title:t('fri.lastT'),body:t('fri.lastB'),open:'today'})}
  if(W.friSal)[10,14,17].forEach((h,j)=>{const at=atTime(d,h+':00');if(at>now&&at<pt.maghrib)out.push({id:6810+i*3+j,t:at,title:t('fri.salT'),body:t('fri.salB'),open:'today'})})}}
{const _ex=extraSched;extraSched=function(out,now){_ex(out,now);try{friItems(out,now);endItems(out,now)}catch(e){}}}
function endItems(out,now){const W=W3();if(!W.endOn)return;const dk=todayKey();PRAYERS.forEach((k,i)=>{const d=S.days[dk];if(d&&d.prayed&&d.prayed[k])return;const s=plStatus(dk,k);if(s&&s!=='q'&&s!=='auto')return;const at=plWinEnd(k,dk)-(+W.endMin||20)*6e4;if(at>now)out.push({id:6790+i,t:at,title:t('end.nT',t('pr.'+k)),body:t('end.nB',+W.endMin||20),open:'today'})})}
setInterval(()=>{if(ANDROID||!W3().friLast&&!W3().friSal)return;const out=[],now=Date.now();friItems(out,now);const A=S.friFired||(S.friFired={});out.forEach(x=>{if(Math.abs(x.t-now)<60000&&!A[x.id+'_'+todayKey()]){A[x.id+'_'+todayKey()]=1;save();toast(x.title+' — '+x.body)}})},30000);
/* 10. Ramadan dashboard */
function ramInfo(){const h=hNum(new Date());if(h.m!==9)return null;return{d:h.d,juz:Math.min(30,h.d)}}
function openRamadan(){const R=ramInfo();if(!R)return;const dk=todayKey(),d=day(dk),r=d.ram||(d.ram={});const items=[['fast','rm3.fast'],['tar','rm3.tar'],['juz','rm3.juz'],['sad','rm3.sad'],['dua','rm3.dua'],['iftar','rm3.iftar']];
  let done=0,tot=0;for(let i=1;i<=R.d;i++){const x=S.days[dKey(addDays(keyToDate(dk),-(R.d-i)))];if(x&&x.ram){tot++;if(x.ram.tar)done++}}
  openInfo('🌙 '+t('rm3.t',R.d),`<p class="muted" style="margin:0 0 10px">${t('rm3.sub',R.juz)}</p><div class="rmlist">${items.map(([k,l])=>`<label class="rmit"><input type="checkbox" data-rm="${k}" ${r[k]?'checked':''}> ${t(l,R.juz)}</label>`).join('')}</div>
   <div class="pmstat"><div><b>${30-R.d}</b><small>${t('rm3.left')}</small></div><div><b>${done}</b><small>${t('rm3.tarN')}</small></div></div>`);
  $$('[data-rm]').forEach(c=>c.onchange=()=>{r[c.dataset.rm]=c.checked?1:0;if(c.dataset.rm==='fast'&&c.checked){d.fast=d.fast||1}save();renderTodayEv()})}
/* 11. intention of the day */
function niyyaAsk(){const d=day(todayKey());const v=prompt(t('ny.ask'),d.niyya||'');if(v==null)return;d.niyya=v.trim();save();renderTodayEv();if(d.niyya)toast(t('ny.saved'))}
/* 13. travel mode */
function travelOn(){const W=W3();if(!W.travel)return false;if(W.travelUntil&&todayKey()>W.travelUntil){W.travel=false;save();return false}return true}
{const _rte8=renderTodayEv;renderTodayEv=function(){_rte8();const box=$('#todayEv');if(!box)return;const d=S.days[todayKey()]||{},hr=new Date().getHours();let h='';
  const R=ramInfo();if(R){const r=d.ram||{},n=['fast','tar','juz','sad','dua','iftar'].filter(k=>r[k]).length;h+=`<span class="evchip big" data-ram3 style="--c:#8b5cf6"><i></i>🌙 ${t('rm3.chip',R.d,R.juz)} · ${n}/6</span>`}
  if(W3().niyya!==false){if(d.niyya)h+=`<span class="evchip" data-ny style="--c:#10b981"><i></i>✍ ${esc(d.niyya.length>34?d.niyya.slice(0,34)+'…':d.niyya)}</span>`;else if(hr<14)h+=`<span class="evchip" data-ny style="--c:#10b981"><i></i>✍ ${t('ny.chip')}</span>`}
  if(travelOn())h+=`<span class="evchip" data-trv style="--c:#0ea5e9"><i></i>✈ ${t('trv.chip')}</span>`;
  if(new Date().getDay()===5&&W3().friLast){const pt=prayerTimes(new Date()),now=Date.now();if(now>=pt.maghrib-60*6e4&&now<pt.maghrib)h+=`<span class="evchip big" style="--c:#f59e0b"><i></i>🤲 ${t('fri.chip')}</span>`}
  if(!h)return;box.insertAdjacentHTML('afterbegin',h);
  const a=box.querySelector('[data-ram3]');if(a)a.onclick=openRamadan;const n=box.querySelector('[data-ny]');if(n)n.onclick=niyyaAsk;const tv=box.querySelector('[data-trv]');if(tv)tv.onclick=()=>openInfo('✈ '+t('trv.t'),`<p>${t('trv.info')}</p>`)}}
/* travel: shortened prayers shown on the prayer chips */
{const _rp3=renderPrayers;renderPrayers=function(){_rp3();if(!travelOn())return;['dhuhr','asr','isha'].forEach(k=>{const c=$(`#prayers .pr:nth-child(${['fajr','sunrise','dhuhr','asr','maghrib','isha'].indexOf(k)+1}) b`);if(c&&!c.querySelector('.qsr'))c.insertAdjacentHTML('beforeend','<small class="qsr">²</small>')})}}
/* per-prayer adhan in the phone schedule and the PC */
/* settings */
function renderW3Set(){const W=W3(),box=$('#w3Box');if(!box)return;
  toggle($('#endT'),!!W.endOn,v=>{W.endOn=v});const em=$('#endMin');em.value=W.endMin||20;em.onchange=()=>{W.endMin=Math.max(5,Math.min(60,+em.value||20));save()};
  toggle($('#friLastT'),W.friLast!==false,v=>{W.friLast=v;if(ANDROID)setTimeout(androidSchedule,100)});toggle($('#friSalT'),W.friSal!==false,v=>{W.friSal=v;if(ANDROID)setTimeout(androidSchedule,100)});
  toggle($('#nyT'),W.niyya!==false,v=>{W.niyya=v;renderTodayEv()});
  toggle($('#trvT'),!!W.travel,v=>{W.travel=v;if(v&&!W.travelUntil){}renderPrayers();renderTodayEv()});const tu=$('#trvUntil');tu.value=W.travelUntil||'';tu.onchange=()=>{W.travelUntil=tu.value||null;save()};
  $('#adhPerBox').innerHTML=PRAYERS.map(k=>`<label class="adp"><span>${t('pr.'+k)}</span><select class="in" data-adp="${k}">${['full','takbir','off'].map(m=>`<option value="${m}" ${adhPK(k)===m?'selected':''}>${t('adp.'+m)}</option>`).join('')}</select></label>`).join('');
  $$('[data-adp]').forEach(s=>s.onchange=()=>{W.adhPer=W.adhPer||{};W.adhPer[s.dataset.adp]=s.value;save();if(ANDROID)setTimeout(androidSchedule,100);PCN_LAST=''})}
{const _rs20=renderSettings;renderSettings=function(){_rs20();try{renderW3Set()}catch(e){console.error(e)}}}
