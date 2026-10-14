/* ============ v2.6: prayer log, fasting, situational adhkar, surah download, calendar events ============ */
/* ---- prayer log: on time / late / missed ---- */
const PNEXT={fajr:'sunrise',dhuhr:'asr',asr:'maghrib',maghrib:'isha'};
function plWinEnd(k,dk){const date=keyToDate(dk),pt=prayerTimes(date);if(PNEXT[k])return pt[PNEXT[k]];return prayerTimes(addDays(date,1)).fajr}
function plSince(){if(!S.plSince){S.plSince=todayKey();save()}return S.plSince}
function plStatus(dk,k){const d=S.days[dk],L_=(d&&d.prayLog)||{};if(L_[k])return L_[k];const pd=d&&d.prayed&&d.prayed[k],we=plWinEnd(k,dk);if(pd)return pd<=we?'on':'late';if(Date.now()<we)return null;if(dk<plSince())return null;return S.settings.prayer.unlogged==='ask'?'q':'auto'}
const PLICON={on:'✓',auto:'✓',late:'◷',miss:'✕',q:'?'};
function plMark(dk,k){const st=plStatus(dk,k);return st?`<i class="plm s-${st}">${PLICON[st]}${snHas(dk,k)?'⁺':''}</i>`:''}
function plSet(dk,k,v){const d=day(dk);d.prayLog=d.prayLog||{};if(v)d.prayLog[k]=v;else delete d.prayLog[k];save()}
function bindPrayChips(){$$('#prayers [data-pk]').forEach(c=>c.onclick=e=>{const k=c.dataset.pk,dk=todayKey(),r=c.getBoundingClientRect();
  const p=qPopAt(`<div class="aymh"><b>${t('pr.'+k)}</b></div>${['on','late','miss'].map(v=>`<button data-v="${v}">${PLICON[v]} ${t('pl.'+v)}</button>`).join('')}<button data-v="">↺ ${t('pl.clear')}</button>${RAWATIB[k]?`<button data-sn>${snCount(dk,k)>=RAWATIB[k]?'☑':snCount(dk,k)?'◐':'☐'} ${t('sn.lbl')} <small>(${snCount(dk,k)?t('sn.rk',snCount(dk,k),RAWATIB[k]):t('sn.'+k)})</small></button>`:''}`,r.left+r.width/2,r.bottom-8,'aymenu');
  {const sb=p.querySelector('[data-sn]');if(sb)sb.onclick=()=>{closePP();if(RAWATIB[k]<=2){snToggle(dk,k);renderPrayers();return}setTimeout(()=>snPick(dk,k,r.left+r.width/2,r.bottom-8,renderPrayers),20)}}
  p.querySelectorAll('[data-v]').forEach(b=>b.onclick=()=>{closePP();plSet(dk,k,b.dataset.v);renderPrayers();if(curView()==='brief')renderBrief()})})}
function plPending(){if(S.settings.prayer.unlogged!=='ask')return[];const now=Date.now(),out=[],A=S.plAsked||{};for(const dk of [dKey(addDays(keyToDate(todayKey()),-1)),todayKey()]){for(const k of PRAYERS){if(plStatus(dk,k)!=='q')continue;if(now<plWinEnd(k,dk)+20*6e4||A[dk+k])continue;out.push([dk,k])}}return out}
function plCheckAsk(force){if(S.prayPop||(S.plSnooze||0)>Date.now()&&!force)return;if($$('.modal.on,.praymodal.on').length)return;const L_=plPending();if(!L_.length)return;openPlAsk(L_)}
function openPlAsk(L_){const box=$('#plBox');
  const draw=()=>{box.innerHTML=`<h2 style="font-size:18px">${t('pl.askT')}</h2><p style="color:var(--muted);font-size:13px;margin:4px 0 10px">${t('pl.askP')}</p>`+L_.map(([dk,k])=>{const v=((S.days[dk]||{}).prayLog||{})[k];return`<div class="plrow"><b>${t('pr.'+k)} <small>${dk===todayKey()?t('pl.today'):t('pl.yday')}</small></b>${['on','late','miss'].map(x=>`<button class="btn sm ${v===x?'on':''}" data-d="${dk}" data-k="${k}" data-v="${x}">${PLICON[x]} ${t('pl.'+x)}</button>`).join('')}</div>`}).join('')+`<div class="evact"><button class="btn sm ghost" id="plLater">${t('pl.later')}</button><span style="flex:1"></span><button class="btn sm pri" id="plOk">${t('ok')}</button></div>`;
    box.querySelectorAll('[data-v]').forEach(b=>b.onclick=()=>{plSet(b.dataset.d,b.dataset.k,b.dataset.v);draw()});
    $('#plLater').onclick=()=>{S.plSnooze=Date.now()+2*36e5;save();$('#plModal').classList.remove('on')};
    $('#plOk').onclick=()=>{S.plAsked=S.plAsked||{};L_.forEach(([dk,k])=>{if(!(((S.days[dk]||{}).prayLog||{})[k]))S.plAsked[dk+k]=1});for(const x in S.plAsked){if(keyToDate(x.slice(0,10)).getTime()<Date.now()-5*864e5)delete S.plAsked[x]}save();$('#plModal').classList.remove('on');renderPrayers()}};
  draw();$('#plModal').classList.add('on')}
setTimeout(()=>plCheckAsk(),4000);setInterval(()=>plCheckAsk(),6e4);
function renderBriefPray(){const box=$('#bPray');if(!box)return;const keys=periodKeys(bMode,bAnchor).filter(k=>k<=todayKey()&&k>=plSince());
  const rows=PRAYERS.map(k=>{const c={on:0,auto:0,late:0,miss:0,q:0};keys.forEach(dk=>{const st=plStatus(dk,k);if(st)c[st]++});const n=c.on+c.auto+c.late+c.miss+c.q;return{k,c,n}});
  const all=rows.reduce((a,r)=>({ok:a.ok+r.c.on+r.c.auto,n:a.n+r.n}),{ok:0,n:0}),fast=keys.filter(k=>S.days[k]&&S.days[k].fast).length;
  const seg=(v,n,col)=>n&&v?`<i style="width:${v/n*100}%;background:${col}"></i>`:'';
  box.innerHTML=`<h3><span>${t('bp.title')}</span><span style="font-size:13px;color:var(--muted)">${all.n?t('bp.overall',Math.round(all.ok/all.n*100)):''}${fast?' · 🌙 '+t('bp.fast',fast):''}</span></h3>`+(all.n?`<div class="bpr">${rows.map(r=>`<div class="bprow"><b>${t('pr.'+r.k)}</b><div class="bar">${seg(r.c.on,r.n,'#4ade80')}${seg(r.c.auto,r.n,'#4ade8088')}${seg(r.c.late,r.n,'#fbbf24')}${seg(r.c.miss,r.n,'#f87171')}${seg(r.c.q,r.n,'#8884')}</div><small>${r.n?Math.round((r.c.on+r.c.auto)/r.n*100)+'%':'—'}${r.c.late?' · ◷'+r.c.late:''}${r.c.miss?' · ✕'+r.c.miss:''}</small></div>`).join('')}<div class="bpleg"><span><i style="background:#4ade80"></i>${t('pl.on')}</span><span><i style="background:#4ade8088"></i>${t('pl.auto')}</span><span><i style="background:#fbbf24"></i>${t('pl.late')}</span><span><i style="background:#f87171"></i>${t('pl.miss')}</span></div></div>`:`<div class="empty" style="padding:6px 0">${t('bp.none')}</div>`)}
{hookFn('renderBrief',()=>renderBrief,f=>{renderBrief=f},'post',function(){try{renderBriefPray()}catch(e){}})}
/* ---- fasting: white days (on), Monday/Thursday (optional) ---- */
const HNF=(()=>{const o={day:'numeric',month:'numeric',year:'numeric'};try{return new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn',o)}catch(e){return new Intl.DateTimeFormat('en-u-ca-islamic-nu-latn',o)}})();const HNC={};
function hNum(date){const key=dKey(date)+'|'+S.settings.hijriAdj;if(HNC[key])return HNC[key];const d=new Date(date);d.setDate(d.getDate()+S.settings.hijriAdj);d.setHours(12);const p=HNF.formatToParts(d),g=x=>+(((p.find(q=>q.type===x)||{}).value)||'0').replace(/\D/g,'');return HNC[key]={d:g('day'),m:g('month'),y:g('year')}}
function fastCfg(){return Object.assign({white:true,monthu:false,at:'21:00'},S.settings.fast||{})}
function fastKinds(date){const F=fastCfg(),h=hNum(date),out=[];if(h.m===9)return out;const eid=(h.m===10&&h.d===1)||(h.m===12&&h.d>=10&&h.d<=13);if(F.white&&[13,14,15].includes(h.d)&&!eid)out.push('white');const wd=date.getDay();if(F.monthu&&(wd===1||wd===4)&&!eid)out.push(wd===1?'mon':'thu');return out}
function fastLabel(date){const ks=fastKinds(date);return ks.map(k=>k==='white'?t('fast.white',hNum(date).d):t('fast.'+k)).join(' · ')}
function atTime(date,hhmm){const [h,m]=String(hhmm||'21:00').split(':').map(Number);const d=new Date(date);d.setHours(h||0,m||0,0,0);return d.getTime()}
function fastCheck(){const now=Date.now(),td=keyToDate(todayKey()),tm=addDays(td,1);if(!fastKinds(tm).filter(x=>x!=='ram').length)return;const at=atTime(td,fastCfg().at),nk=todayKey()+'fast';if(now>=at&&now<at+3*36e5&&!S.notified[nk]){S.notified[nk]=1;save();alertUser(t('fast.remT'),t('fast.remB',fastLabel(tm)),ICON_MOON)}}
setInterval(fastCheck,6e4);setTimeout(fastCheck,5000);
/* ---- situational adhkar (optional section), grouped ---- */
const ADHXG=['sleep','wake','prayer','out','home','travel'];let ADHXSEL=null;
function adhXGroup(){if(ADHXSEL)return ADHXSEL;const pt=prayerTimes(new Date()),now=Date.now();return(now>=pt.isha||now<pt.fajr)?'sleep':now<pt.sunrise+36e5?'wake':'prayer'}
function adhXChips(){const box=$('#adhXg'),L_=$('#adhList');if(!box)return;box.hidden=adhK!=='x';if(adhK!=='x')return;const g=adhXGroup(),st=(S.adhkar[todayKey()]||{}).x||{};
  box.innerHTML=ADHXG.map(x=>{const items=ADHX.map((a,i)=>[a,i]).filter(([a])=>a.g===x),done=items.length&&items.every(([a,i])=>(st['x'+i]||0)>=a.n);return`<button class="chip ${x===g?'on':''}" data-g="${x}">${t('adx.'+x)}${done?' ✓':''}</button>`}).join('');
  if(L_)L_.querySelectorAll('.adel').forEach(x=>x.remove());const ab=$('#adhAddBtn');if(ab)ab.hidden=true;
  box.querySelectorAll('[data-g]').forEach(b=>b.onclick=e=>{e.stopPropagation();ADHXSEL=b.dataset.g;adhFI=null;renderAdhkar()})}
{hookFn('renderAdhkar',()=>renderAdhkar,f=>{renderAdhkar=f},'post',function(){try{const ab=$('#adhAddBtn');if(ab&&adhK!=='x')ab.hidden=false;adhXChips()}catch(e){}})}
function adhExtraOn(){return S.settings.adhExtra!==false}
const ADHX=[
 {g:'sleep',x:'باسمك ربي وضعت جنبي، وبك أرفعه، إن أمسكت نفسي فارحمها، وإن أرسلتها فاحفظها بما تحفظ به عبادك الصالحين.',n:1,src:'البخاري ومسلم'},
 {g:'sleep',x:'أعوذ بالله من الشيطان الرجيم\nالله لا إله إلا هو الحي القيوم، لا تأخذه سنة ولا نوم، له ما في السماوات وما في الأرض، من ذا الذي يشفع عنده إلا بإذنه، يعلم ما بين أيديهم وما خلفهم، ولا يحيطون بشيء من علمه إلا بما شاء، وسع كرسيه السماوات والأرض، ولا يئوده حفظهما، وهو العلي العظيم.',n:1,src:'آية الكرسي — البخاري'},
 {g:'sleep',x:'آمن الرسول بما أنزل إليه من ربه والمؤمنون، كل آمن بالله وملائكته وكتبه ورسله لا نفرق بين أحد من رسله، وقالوا سمعنا وأطعنا غفرانك ربنا وإليك المصير. لا يكلف الله نفسا إلا وسعها، لها ما كسبت وعليها ما اكتسبت، ربنا لا تؤاخذنا إن نسينا أو أخطأنا، ربنا ولا تحمل علينا إصرا كما حملته على الذين من قبلنا، ربنا ولا تحملنا ما لا طاقة لنا به، واعف عنا واغفر لنا وارحمنا، أنت مولانا فانصرنا على القوم الكافرين.',n:1,src:'خواتيم البقرة — البخاري ومسلم'},
 {g:'sleep',x:'قل هو الله أحد · قل أعوذ برب الفلق · قل أعوذ برب الناس\nيجمع كفيه وينفث فيهما ويقرأ، ثم يمسح بهما ما استطاع من جسده.',n:3,src:'البخاري'},
 {g:'sleep',x:'اللهم قني عذابك يوم تبعث عبادك.',n:3,src:'أبو داود والترمذي'},
 {g:'sleep',x:'باسمك اللهم أموت وأحيا.',n:1,src:'البخاري'},
 {g:'sleep',x:'سبحان الله.',n:33,src:'البخاري ومسلم'},{g:'sleep',x:'الحمد لله.',n:33,src:'البخاري ومسلم'},{g:'sleep',x:'الله أكبر.',n:34,src:'البخاري ومسلم'},
 {g:'wake',x:'الحمد لله الذي أحيانا بعد ما أماتنا وإليه النشور.',n:1,src:'البخاري'},
 {g:'prayer',x:'أستغفر الله، أستغفر الله، أستغفر الله.\nاللهم أنت السلام ومنك السلام، تباركت يا ذا الجلال والإكرام.',n:1,src:'مسلم'},
 {g:'prayer',x:'سبحان الله.',n:33,src:'مسلم'},{g:'prayer',x:'الحمد لله.',n:33,src:'مسلم'},{g:'prayer',x:'الله أكبر.',n:33,src:'مسلم'},
 {g:'prayer',x:'لا إله إلا الله وحده لا شريك له، له الملك وله الحمد، وهو على كل شيء قدير.',n:1,src:'تمام المئة — مسلم'},
 {g:'prayer',x:'أعوذ بالله من الشيطان الرجيم\nالله لا إله إلا هو الحي القيوم، لا تأخذه سنة ولا نوم، له ما في السماوات وما في الأرض، من ذا الذي يشفع عنده إلا بإذنه، يعلم ما بين أيديهم وما خلفهم، ولا يحيطون بشيء من علمه إلا بما شاء، وسع كرسيه السماوات والأرض، ولا يئوده حفظهما، وهو العلي العظيم.',n:1,src:'آية الكرسي — النسائي'},
 {g:'out',x:'بسم الله، توكلت على الله، ولا حول ولا قوة إلا بالله.',n:1,src:'أبو داود والترمذي'},
 {g:'home',x:'بسم الله ولجنا، وبسم الله خرجنا، وعلى ربنا توكلنا.',n:1,src:'أبو داود'},
 {g:'travel',x:'الله أكبر، الله أكبر، الله أكبر. سبحان الذي سخر لنا هذا وما كنا له مقرنين، وإنا إلى ربنا لمنقلبون. اللهم إنا نسألك في سفرنا هذا البر والتقوى، ومن العمل ما ترضى، اللهم هون علينا سفرنا هذا واطو عنا بعده، اللهم أنت الصاحب في السفر، والخليفة في الأهل.',n:1,src:'مسلم'}
];
/* ---- download a surah's recitation for offline listening ---- */
function audDl(){try{return JSON.parse(localStorage.getItem('thabat.audDl')||'{}')}catch(e){return{}}}
function audDlSet(o){try{localStorage.setItem('thabat.audDl',JSON.stringify(o))}catch(e){}}
function audHas(r,s){return!!(audDl()[r]||{})[s]}
const AUDURL={};let AUDJOB=null;
const qAyUrlR=(r,s,a)=>`https://everyayah.com/data/${r}/${String(s).padStart(3,'0')}${String(a).padStart(3,'0')}.mp3`;
async function qSrc(s,a){const r=qAud().r;if(audHas(r,s)){const key='au:'+r+':'+s+':'+a;if(AUDURL[key])return AUDURL[key];try{const b=await idbGet(key);if(b)return AUDURL[key]=URL.createObjectURL(b)}catch(e){}}return qAyUrlR(r,s,a)}
async function audFetch(url){const get=async u=>{const r=await fetch(u,{cache:'no-store'});if(!r.ok)throw new Error('http');const b=await r.blob();if(b.size<500)throw new Error('small');return b};
  try{return await get(url)}catch(e){if(ANDROID)throw e;return await get(HELPER+'/au?u='+encodeURIComponent(url))}}
function qDlBtn(it){if(!it)return'';const r=qAud().r,s=it[0];if(AUDJOB)return`<button class="qpb" data-p="dl" title="${esc(t('q.dlT'))}">${AUDJOB.s===s?Math.floor(AUDJOB.done/AUDJOB.n*100)+'%':'⏳'}</button>`;return`<button class="qpb ${audHas(r,s)?'on':''}" data-p="dl" title="${esc(audHas(r,s)?t('q.dlHave'):t('q.dlT'))}">${audHas(r,s)?'✓':'⬇'}</button>`}
function audUpd(){const b=$('#qPlayer [data-p=dl]');if(b&&AUDJOB)b.textContent=Math.floor(AUDJOB.done/AUDJOB.n*100)+'%';const x=$('#audProg');if(x&&AUDJOB)x.textContent=`${qSurahName(AUDJOB.s)} — ${AUDJOB.done}/${AUDJOB.n}`}
async function audDownload(s){if(AUDJOB){toast(t('q.dlBusy'));return}const r=qAud().r;try{await qIndex()}catch(e){toast(t('q.tfsFail'));return}
  const ay=QIX.list.filter(o=>o.s===s).map(o=>o.a);AUDJOB={s,r,done:0,n:ay.length,fail:0};qPlayerUI();renderAudDl();toast(t('q.dlStart',qSurahName(s)));
  const work=async()=>{while(ay.length&&AUDJOB.fail<6){const a=ay.shift(),key='au:'+r+':'+s+':'+a;try{if(!(await idbGet(key)))await idbSet(key,await audFetch(qAyUrlR(r,s,a)))}catch(e){AUDJOB.fail++}AUDJOB.done++;audUpd()}};
  await Promise.all([work(),work(),work()]);const J=AUDJOB;AUDJOB=null;
  if(J.fail||J.done<J.n){toast(t('q.dlFail'));if(!ANDROID&&!MAC&&!(await helperOk()))setTimeout(()=>toast(t('q.dlHelper')),400)}else{const o=audDl();(o[r]=o[r]||{})[s]=Date.now();audDlSet(o);toast(t('q.dlDone',qSurahName(s)))}qPlayerUI();renderAudDl()}
async function audRemove(r,s){try{await qIndex()}catch(e){}const ay=(QIX&&QIX.list||[]).filter(o=>o.s===s).map(o=>o.a);for(const a of ay){const key='au:'+r+':'+s+':'+a;try{await idbSet(key,null)}catch(e){}if(AUDURL[key]){URL.revokeObjectURL(AUDURL[key]);delete AUDURL[key]}}const o=audDl();if(o[r]){delete o[r][s];if(!Object.keys(o[r]).length)delete o[r]}audDlSet(o);renderAudDl();qPlayerUI()}
function openAudDl(){$('#audModal').classList.add('on');renderAudDl()}
function renderAudDl(){const box=$('#audBox');if(!box||!$('#audModal').classList.contains('on'))return;const o=audDl(),A=qAud(),cur=QA.q[QA.i];const rows=[];for(const r in o)for(const s in o[r])rows.push([r,+s]);
  box.innerHTML=`<h2 style="font-size:18px">${t('q.dlTitle')}</h2><p style="color:var(--muted);font-size:12.5px;margin:4px 0 10px">${t('q.dlSub')}</p>
   <div class="evrow"><label><span>${t('q.dlSurah')}</span><select class="in" id="audS">${QS.map((q,i)=>`<option value="${i+1}" ${(cur?cur[0]:1)===i+1?'selected':''}>${i+1}. ${esc(LANG==='ar'?q[0]:q[1])}</option>`).join('')}</select></label><label><span>${t('q.dlRec')}</span><select class="in" id="audR">${RECITERS.map(([f,k])=>`<option value="${f}" ${A.r===f?'selected':''}>${t(k)}</option>`).join('')}</select></label></div>
   <div class="evact" style="margin-top:8px"><small id="audProg" style="color:var(--accent)">${AUDJOB?`${qSurahName(AUDJOB.s)} — ${AUDJOB.done}/${AUDJOB.n}`:''}</small><span style="flex:1"></span><button class="btn sm pri" id="audGo" ${AUDJOB?'disabled':''}>⬇ ${t('q.dlBtn')}</button></div>
   <div style="margin-top:12px">${rows.length?rows.map(([r,s])=>`<div class="audli"><b>${s}. ${esc(qSurahName(s))}</b><small>${t((RECITERS.find(x=>x[0]===r)||[0,'q.dlRec'])[1])}</small><button class="btn sm ghost" data-rm="${r}|${s}">${t('del')}</button></div>`).join(''):`<div class="empty" style="padding:6px 0">${t('q.dlNone')}</div>`}</div>
   <div class="evact"><span style="flex:1"></span><button class="btn sm" id="audClose">${t('ok')}</button></div>`;
  $('#audGo').onclick=()=>{const r=$('#audR').value;if(r!==A.r){A.r=r;save()}audDownload(+$('#audS').value)};
  $('#audClose').onclick=()=>$('#audModal').classList.remove('on');
  box.querySelectorAll('[data-rm]').forEach(b=>b.onclick=()=>{const [r,s]=b.dataset.rm.split('|');audRemove(r,+s)})}
$('#audModal').onclick=e=>{if(e.target.id==='audModal')$('#audModal').classList.remove('on')};
/* ---- calendar events ---- */
const EVCOLS=['#4f8cff','#22c55e','#f59e0b','#ef4444','#a855f7','#ec4899','#14b8a6','#94a3b8'];
function EVS(){return S.events||(S.events=[])}
function evOccurs(e,k){if(k<e.date)return false;if(e.until&&k>e.until)return false;
  switch(e.rep){case'yearly':{const a=e.date.slice(5),b=k.slice(5);if(a===b)return true;const y=+k.slice(0,4);return a==='02-29'&&b==='02-28'&&!(y%4===0&&(y%100!==0||y%400===0))}
    case'hyearly':{const a=hNum(keyToDate(e.date)),b=hNum(keyToDate(k));return a.d===b.d&&a.m===b.m}
    case'monthly':return k.slice(8)===e.date.slice(8);case'weekly':return keyToDate(k).getDay()===keyToDate(e.date).getDay();default:return k===e.date}}
function evsOn(k){return EVS().filter(e=>evOccurs(e,k)).sort((a,b)=>(b.big?1:0)-(a.big?1:0)||(a.time?1:0)-(b.time?1:0)||String(a.time).localeCompare(String(b.time)))}
function evYears(e,k){if(e.rep==='yearly')return(+k.slice(0,4))-(+e.date.slice(0,4));if(e.rep==='hyearly')return hNum(keyToDate(k)).y-hNum(keyToDate(e.date)).y;return 0}
function evWhen(e){return e.time?(e.end?e.time+'–'+e.end:e.time):t('ev.allDay')}
function calEvHTML(k,date){const L_=evsOn(k),big=L_.filter(e=>e.big),rest=L_.filter(e=>!e.big),d=S.days[k],fk=fastKinds(date);
  return(L_.length?`<div class="cevs">${big.slice(0,2).map(e=>`<span class="cevt" style="--c:${e.color}" title="${esc(e.title)}">${esc(e.title)}</span>`).join('')}${rest.length?`<span class="cevd">${rest.slice(0,4).map(e=>`<i style="--c:${e.color}" title="${esc(evWhen(e)+' '+e.title)}"></i>`).join('')}</span>`:''}</div>`:'')+(d&&d.fast?`<span class="cfast" title="${esc(t('fast.done'))}">🌙</span>`:fk.length&&k>=todayKey()?`<span class="cfast up" title="${esc(fastLabel(date))}">🌙</span>`:'')}
function evDetailHTML(k){const L_=evsOn(k),date=keyToDate(k),fk=fastKinds(date),d=S.days[k];
  return`<div class="evsec">${L_.filter(e=>e.big).map(e=>`<div class="evbig" style="--c:${e.color}" data-ev="${e.id}">${esc(e.title)}${evYears(e,k)>0?` <small style="font-weight:500;color:var(--muted)">· ${t('ev.years',evYears(e,k))}</small>`:''}</div>`).join('')}
   ${L_.filter(e=>!e.big).map(e=>`<div class="evli" style="--c:${e.color}" data-ev="${e.id}"><i></i><span class="tm">${esc(evWhen(e))}</span><span dir="auto">${esc(e.title)}</span>${e.rep!=='none'?`<span class="rp">🔁 ${t('ev.rep.'+e.rep)}${evYears(e,k)>0?' · '+t('ev.years',evYears(e,k)):''}</span>`:''}</div>`).join('')}
   <div class="evaddrow"><button class="btn sm" data-evnew>＋ ${t('ev.add')}</button>${fk.length||(d&&d.fast)||k<=todayKey()?`<button class="btn sm ${d&&d.fast?'on':''}" data-fast>🌙 ${d&&d.fast?t('fast.done'):fk.length?fastLabel(date):t('fast.mark')}</button>`:''}</div></div>`}
function bindEvDetail(k){$$('#detail [data-ev]').forEach(b=>b.onclick=()=>openEv(b.dataset.ev,k));const n=$('#detail [data-evnew]');if(n)n.onclick=()=>openEv(null,k);
  const f=$('#detail [data-fast]');if(f)f.onclick=()=>{const d=day(k);d.fast=d.fast?0:1;if(!d.fast)delete d.fast;save();renderCal();if(k===todayKey())renderTodayEv()}}
function renderTodayEv(){const box=$('#todayEv');if(!box)return;const k=todayKey(),L_=evsOn(k),fk=fastKinds(keyToDate(k)),d=S.days[k];
  box.innerHTML=L_.map(e=>`<span class="evchip ${e.big?'big':''}" style="--c:${e.color}" data-ev="${e.id}"><i></i>${e.big?'':`<small>${esc(evWhen(e))}</small>`}<span dir="auto">${esc(e.title)}</span></span>`).join('')+(fk.length?`<span class="evchip fast">🌙 ${esc(fastLabel(keyToDate(k)))}<button class="btn sm ${d&&d.fast?'on':''}" data-fastt>${d&&d.fast?'✓ '+t('fast.fasting'):t('fast.iFast')}</button></span>`:'');
  box.querySelectorAll('[data-ev]').forEach(b=>b.onclick=()=>openEv(b.dataset.ev,k));const ft=box.querySelector('[data-fastt]');if(ft)ft.onclick=e=>{e.stopPropagation();const dd=day(k);dd.fast=dd.fast?0:1;if(!dd.fast)delete dd.fast;save();renderTodayEv()}}
let EVE=null;
function openEv(id,k){const e=id?EVS().find(x=>x.id===id):null;EVE=e?Object.assign({},e):{id:uid(),title:'',date:k||todayKey(),time:'',end:'',color:EVCOLS[0],rep:'none',rem:null,notes:'',big:false,_new:true};renderEvEd();$('#evModal').classList.add('on');setTimeout(()=>{const x=$('#evT');if(x&&EVE._new)x.focus()},60)}
function evHint(){const d=$('#evD').value,r=$('#evRep').value,h=$('#evHint');if(!d){h.textContent='';return}const dt=keyToDate(d);
  h.textContent=r==='yearly'?t('ev.hint.yearly',dt.getDate()+' '+L().months[dt.getMonth()]):r==='hyearly'?t('ev.hint.hyearly',hijri(dt).day+' '+hijri(dt).month):r==='monthly'?t('ev.hint.monthly',dt.getDate()):r==='weekly'?t('ev.hint.weekly',L().days[dt.getDay()]):''}
function renderEvEd(){const e=EVE;$('#evBox').innerHTML=`<h2>${t(e._new?'ev.new':'ev.edit')}</h2>
  <div class="evf"><input class="in" id="evT" dir="auto" placeholder="${esc(t('ev.titlePh'))}" value="${esc(e.title)}">
   <label class="chk"><input type="checkbox" id="evBig" ${e.big?'checked':''}><span>${t('ev.big')}</span></label>
   <div class="evrow"><label><span>${t('ev.date')}</span><input class="in" type="date" id="evD" value="${e.date}"></label><label><span>${t('ev.time')}</span><input class="in" type="time" id="evTm" value="${e.time||''}"></label><label><span>${t('ev.end')}</span><input class="in" type="time" id="evEnd" value="${e.end||''}"></label></div>
   <div class="evrow"><label><span>${t('ev.rep')}</span><select class="in" id="evRep">${['none','weekly','monthly','yearly','hyearly'].map(r=>`<option value="${r}" ${e.rep===r?'selected':''}>${t('ev.rep.'+r)}</option>`).join('')}</select></label><label><span>${t('ev.rem')}</span><select class="in" id="evRem">${['','0','10','30','60','1440'].map(v=>`<option value="${v}" ${String(e.rem??'')===v?'selected':''}>${t('ev.rem.'+(v||'none'))}</option>`).join('')}</select></label></div>
   <small class="evhint" id="evHint"></small>
   <div class="evcols">${EVCOLS.map(c=>`<button class="evc ${e.color===c?'on':''}" data-c="${c}" style="background:${c}"></button>`).join('')}</div>
   <textarea class="in" id="evN" dir="auto" placeholder="${esc(t('ev.notesPh'))}">${esc(e.notes||'')}</textarea></div>
  <div class="evact">${e._new?'':`<button class="btn sm ghost danger" id="evDel">${t('del')}</button>`}<span style="flex:1"></span><button class="btn sm ghost" id="evCancel">${t('ev.cancel')}</button><button class="btn sm pri" id="evSave">${t('ev.save')}</button></div>`;
  $$('#evBox [data-c]').forEach(b=>b.onclick=()=>{EVE.color=b.dataset.c;$$('#evBox [data-c]').forEach(x=>x.classList.toggle('on',x===b))});
  $('#evD').onchange=evHint;$('#evRep').onchange=evHint;evHint();
  $('#evCancel').onclick=()=>$('#evModal').classList.remove('on');
  $('#evSave').onclick=()=>{const title=$('#evT').value.trim();if(!title){toast(t('ev.needTitle'));$('#evT').focus();return}const date=$('#evD').value||todayKey();
    const rec={id:EVE.id,title,date,time:$('#evTm').value||'',end:$('#evTm').value?($('#evEnd').value||''):'',color:EVE.color,rep:$('#evRep').value,rem:$('#evRem').value===''?null:+$('#evRem').value,notes:$('#evN').value.trim(),big:$('#evBig').checked};
    const i=EVS().findIndex(x=>x.id===rec.id);if(i>=0)S.events[i]=rec;else EVS().push(rec);save();$('#evModal').classList.remove('on');evRefresh();toast(t('ev.saved'))};
  const del=$('#evDel');if(del)del.onclick=()=>{if(!confirm(t('ev.delQ',EVE.title)))return;S.events=EVS().filter(x=>x.id!==EVE.id);save();$('#evModal').classList.remove('on');evRefresh()}}
$('#evModal').onclick=e=>{if(e.target.id==='evModal')$('#evModal').classList.remove('on')};
function evRefresh(){renderTodayEv();if(curView()==='cal')renderCal();if(ANDROID)setTimeout(androidSchedule,0)}
function evAlarmAt(e,k){const base=e.time?atTime(keyToDate(k),e.time):atTime(keyToDate(k),'09:00');return base-(e.rem||0)*6e4}
function evCheck(){const now=Date.now(),td=keyToDate(todayKey());for(let i=0;i<3;i++){const k=dKey(addDays(td,i));for(const e of evsOn(k)){if(e.rem==null)continue;const at=evAlarmAt(e,k),nk=k+'ev'+e.id;if(now>=at&&now<at+30*6e4&&!S.notified[nk]){S.notified[nk]=1;save();alertUser(e.title,(i===0?t('ev.today'):i===1?t('ev.tomorrow'):gStr(keyToDate(k)))+' · '+evWhen(e)+(e.notes?' — '+e.notes:''),ICON_CLOCK)}}}}
setInterval(evCheck,3e4);setTimeout(evCheck,3000);
/* extra items for the phone's scheduler */
function extraSched(out,now){try{const td=keyToDate(todayKey());let n=0;
  for(let i=0;i<8;i++){const k=dKey(addDays(td,i));for(const e of evsOn(k)){if(e.rem==null)continue;const at=evAlarmAt(e,k);if(at>now&&n<120)out.push({id:7000+n++,t:at,title:e.title,body:(i===0?t('ev.today'):i===1?t('ev.tomorrow'):gStr(keyToDate(k)))+' · '+evWhen(e),open:'cal'})}}
  for(let i=0;i<4;i++){const d=addDays(td,i),tm=addDays(d,1);if(fastKinds(tm).filter(x=>x!=='ram').length){const at=atTime(d,fastCfg().at);if(at>now)out.push({id:6900+i,t:at,title:t('fast.remT'),body:t('fast.remB',fastLabel(tm))})}}}catch(e){}}
/* settings for this block */
function renderV26Set(){const P=S.settings.prayer,F=fastCfg();
  $('#unlogSeg').innerHTML=[['ontime','set.unlog.ontime'],['ask','set.unlog.ask']].map(([k,l])=>`<button data-k="${k}" class="${(P.unlogged||'ontime')===k?'on':''}">${t(l)}</button>`).join('');
  $$('#unlogSeg button').forEach(b=>b.onclick=()=>{P.unlogged=b.dataset.k;plSince();save();renderV26Set();renderPrayers()});
  toggle($('#fastWhiteT'),F.white,v=>{S.settings.fast=Object.assign(fastCfg(),{white:v});setTimeout(()=>{renderTodayEv();if(ANDROID)androidSchedule()},0)});
  toggle($('#fastMTT'),F.monthu,v=>{S.settings.fast=Object.assign(fastCfg(),{monthu:v});setTimeout(()=>{renderTodayEv();if(ANDROID)androidSchedule()},0)});
  $('#fastAtIn').value=F.at;$('#fastAtIn').onchange=e=>{S.settings.fast=Object.assign(fastCfg(),{at:e.target.value||'21:00'});save();if(ANDROID)androidSchedule()};
  toggle($('#adhExtraT'),adhExtraOn(),v=>{S.settings.adhExtra=v})}
{hookFn('renderSettings',()=>renderSettings,f=>{renderSettings=f},'post',function(){try{renderV26Set()}catch(e){}})}
plSince();

