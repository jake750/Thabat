/* ============ v3.2 devices & motivation: PC alerts through the helper, accountability friend, Ramadan badge, ayah of the day, month celebration, streak freeze, Arabic digits, travel, beta ============ */
const BETA=true;
/* 89. notifications on the PC even with the app closed (the helper shows Windows notifications) */
function pcnOn(){return!ANDROID&&!!S.settings.pcNotif}
let PCN_LAST='';
async function pcnPush(force){if(!pcnOn())return;const now=Date.now(),out=[],P=S.settings.prayer;for(let d=0;d<2;d++){const date=addDays(new Date(),d),pt=prayerTimes(date);PRAYERS.forEach(k=>{if(k==='sunrise')return;const tt=pt[k];if(tt>now)out.push([tt,t('al.at',t('pr.'+k)),t('pray.body'),adhanOn()?1:0]);if(P.enabled&&tt-P.remind*6e4>now)out.push([tt-P.remind*6e4,t('al.pre',t('pr.'+k),minW(P.remind)),t('al.preB',fmtT(tt)),0])})}
  try{const ex=[];extraSched(ex,now);ex.filter(x=>x.t<now+36*36e5).forEach(x=>out.push([x.t,x.title,x.body||'',0]))}catch(e){}
  const L_=out.filter(x=>x[0]>now).sort((a,b)=>a[0]-b[0]).slice(0,40),js=JSON.stringify({v:1,adhan:adhanCfg().mode==='takbir'?'adhan_takbir.mp3':'adhan.mp3',vol:adhanCfg().vol||100,items:L_});if(js===PCN_LAST&&!force)return;
  try{const b=btoa(unescape(encodeURIComponent(js))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');const r=await fetch(HELPER+'/sched?d='+b,{cache:'no-store'});if(r.ok)PCN_LAST=js}catch(e){}}
async function pcnAlive(){if(!pcnOn())return;try{await fetch(HELPER+'/alive',{cache:'no-store'})}catch(e){}}
setInterval(()=>{pcnAlive();pcnPush()},45e3);setTimeout(()=>pcnPush(true),6000);
/* 91. accountability friend */
function weekShareText(){const keys=periodKeys('week',keyToDate(todayKey())).filter(k=>k<=todayKey()),st=periodStats(keys),pr=onTimePct(keys),f=S.settings.friend||'';
  return[(f?t('fr.hi',f)+'\n':'')+t('fr.head'),'⏱ '+t('fr.hours',fmtHM(st.tot)),'⭐ '+t('fr.gold',st.gold,st.elapsed),'✅ '+t('fr.tasks',st.tasksDone,st.tasksAll),pr!=null?'🕌 '+t('fr.pray',pr):'','📖 '+t('fr.quran',st.q.read),(REV()[keys[0]]&&REV()[keys[0]].focus||[]).length?'🎯 '+t('fr.focus')+' '+REV()[keys[0]].focus.join('، '):'','— '+t('app')].filter(Boolean).join('\n')}
function shareWeek(){const tx=weekShareText();if(ANDROID&&window.ThabatAndroid.share){window.ThabatAndroid.share(t('fr.title'),tx);return}if(navigator.share){navigator.share({text:tx}).catch(()=>copyTxt(tx));return}copyTxt(tx)}
{const _rb9=renderBrief;renderBrief=function(){_rb9();try{if(bMode==='week'&&!$('#frBtn')){$('#rvBtn').insertAdjacentHTML('afterend',`<button class="btn sm ghost" id="frBtn">↗ ${t('fr.btn')}</button>`);$('#frBtn').onclick=shareWeek}else if(bMode!=='week'){const x=$('#frBtn');if(x)x.remove()}}catch(e){}}}
setInterval(()=>{const f=S.settings.friend;if(!f||!S.settings.friendDay)return;const k=todayKey(),d=keyToDate(k);if(d.getDay()!==+S.settings.friendDay||new Date().getHours()<20)return;const dd=day(k);if(dd.frAsk)return;dd.frAsk=1;save();toastAct(t('fr.remind',f),t('fr.btn'),shareWeek,30000)},6e4);
/* 92. Ramadan badge */
BADGES.push({id:'ramadan',ic:'🌙',g:'w',tiers:[10,20,30],v:()=>{const by={};Object.keys(S.days).forEach(k=>{try{const h=hNum(keyToDate(k));if(h.m!==9)return;const d=S.days[k];if(d.fast||qWirdDone(d.quran))by[h.y]=(by[h.y]||0)+1}catch(e){}});return Math.max(0,...Object.values(by))},u:'days'});
/* 93. ayah of the day */
const AYD=['2:286','94:5','13:28','65:3','2:152','39:53','3:139','2:186','20:114','29:69','8:46','16:128','40:60','2:153','93:5','12:87','65:2','3:200','17:80','28:24','21:87','7:56','14:7','2:45','33:41','18:46','47:7','9:51','11:88','25:63'];
function aydRef(){const n=Math.floor(keyToDate(todayKey()).getTime()/864e5);return AYD[(n*7)%AYD.length]}
async function renderAyd(){const el=$('#aydBox');if(!el)return;if(S.settings.aydOff){el.hidden=true;return}try{await qLoadPack('hafs')}catch(e){el.hidden=true;return}const [s,a]=aydRef().split(':').map(Number),tx=qAyahText(s,a,'hafs');if(!tx){el.hidden=true;return}
  el.hidden=false;el.innerHTML=`<span class="aydt" dir="rtl">${esc(tx)}</span><small>﴿ ${esc(qSurahName(s))} ${a} ﴾</small>`;el.onclick=()=>qGoAyah(s,a)}
{const _rtd4=renderToday;renderToday=function(){_rtd4();if(!renderToday._ayd||renderToday._ayd!==todayKey()){renderToday._ayd=todayKey();setTimeout(renderAyd,400)}}}
/* 94. end-of-month celebration */
setTimeout(()=>{try{const k=todayKey(),mk=k.slice(0,7);if(!S.setupDone||S.moCel===mk)return;const pm=new Date(keyToDate(k).getFullYear(),keyToDate(k).getMonth()-1,1),keys=periodKeys('month',pm);if(!keys.some(x=>S.days[x]&&(S.days[x].sessions||[]).length)){S.moCel=mk;save();return}
  S.moCel=mk;save();const st=periodStats(keys);celebrate('🎉 '+t('mc.t',L().months[pm.getMonth()]),t('mc.b',fmtHM(st.tot),st.gold,st.tasksDone,st.q.read),t('mc.c'))}catch(e){}},9000);
/* 95. one streak freeze per week */
function frozenRun(keys,pred){let run=0,best=0,usedWk={};keys.forEach(k=>{if(pred(k)){run++;best=Math.max(best,run)}else if(k===todayKey()){}else{const wk=wkStart(keyToDate(k));if(S.settings.freeze!==false&&run>0&&!usedWk[wk]){usedWk[wk]=1}else run=0}});return{run,best}}
bestRun=function(pred){return frozenRun(allDayKeys(),pred).best};
{const _ps=periodStats;periodStats=function(keys){const r=_ps(keys);try{if(S.settings.freeze!==false){const tk=todayKey(),f=frozenRun(keys.filter(k=>k<=tk),k=>{const tt=totals(k).tot;return tt>0&&tt>=goalMs(k)});r.run=f.run;r.bestRun=Math.max(r.bestRun,f.best)}}catch(e){}return r}}
/* 97. Eastern Arabic digits (optional) */
const DIG='٠١٢٣٤٥٦٧٨٩';let DIG_ON=false;
function digConv(root){if(!DIG_ON)return;const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>{const p=n.parentElement;if(!p||!/\d/.test(n.nodeValue))return 2;if(p.closest('input,textarea,pre,code,script,style,.ltrnum,[contenteditable],#chkjs,.excard,.bugpre,kbd,.rcadd'))return 2;return 1}});const L_=[];while(w.nextNode())L_.push(w.currentNode);L_.forEach(n=>{n.nodeValue=n.nodeValue.replace(/\d/g,d=>DIG[d])})}
const digObs=new MutationObserver(ms=>{if(!DIG_ON)return;digObs.disconnect();ms.forEach(m=>{if(m.type==='characterData')digConv(m.target.parentElement||document.body);else m.addedNodes.forEach(n=>{if(n.nodeType===3)digConv(n.parentElement||document.body);else if(n.nodeType===1)digConv(n)})});digObs.observe(document.body,{childList:true,subtree:true,characterData:true})});
function applyDigits(){DIG_ON=LANG==='ar'&&!!S.settings.arDigits;digObs.disconnect();if(DIG_ON){digConv(document.body);digObs.observe(document.body,{childList:true,subtree:true,characterData:true})}}
setTimeout(applyDigits,500);
/* 98. travel: time zone changed */
setTimeout(()=>{try{const tz=Intl.DateTimeFormat().resolvedOptions().timeZone,off=new Date().getTimezoneOffset(),st=S.settings;if(!st.tzLast){st.tzLast={tz,off};save();return}if(st.tzLast.tz!==tz||st.tzLast.off!==off){const was=st.tzLast.tz;st.tzLast={tz,off};save();toastAct(t('tv.t',tz),t('tv.go'),()=>{showView('set');setTimeout(()=>{const b=$('#locChange');if(b)b.click()},300)},25000)}}catch(e){}},5000);
/* 100. beta tag */
{const _rv=renderV38Set;renderV38Set=function(){_rv();if(BETA){const a=$('#aboutV');if(a)a.insertAdjacentHTML('beforeend',` <span class="betatag">${t('beta.tag')}</span>`)}}}
function renderV43Set(){const st=S.settings;$('#pcnField').hidden=ANDROID;toggle($('#pcnT'),!!st.pcNotif,v=>{st.pcNotif=v;PCN_LAST='';setTimeout(()=>{if(v)pcnPush(true);else fetch(HELPER+'/sched?d=',{cache:'no-store'}).catch(()=>{})},0)});
  const fi=$('#frName');fi.value=st.friend||'';fi.onchange=()=>{st.friend=fi.value.trim();save()};const fd=$('#frDay');fd.innerHTML=`<option value="">—</option>`+L().days.map((d,i)=>`<option value="${i}" ${String(st.friendDay)===String(i)?'selected':''}>${d}</option>`).join('');fd.onchange=()=>{st.friendDay=fd.value;save()};
  toggle($('#aydT'),!st.aydOff,v=>{st.aydOff=!v;setTimeout(renderAyd,0)});toggle($('#frzT'),st.freeze!==false,v=>{st.freeze=v});$('#digField').hidden=LANG!=='ar';toggle($('#digT'),!!st.arDigits,v=>{st.arDigits=v;setTimeout(()=>{applyDigits();if(!v)renderAll()},0)})}
{const _rs17=renderSettings;renderSettings=function(){_rs17();try{renderV43Set()}catch(e){console.error(e)}}}
