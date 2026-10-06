/* ============ v3.3 health, interface and data: movement & eyes, sleep & sport logs, meals, screen time, quit-habits, correlations, mood map, weather water, widgets, home layout, themes, vibration, swipe tasks, ayah search, LAN transfer, story images ============ */
const HL=()=>S.settings.hl3||(S.settings.hl3={move:true,moveMin:50,eye:false,meals:{on:false,b:'08:00',l:'13:00',d:'20:00'},vibP:'normal'});
/* 65 + 66. move and rest your eyes while working */
setInterval(()=>{const T=S.timer;if(!T||T.mode!=='work'||!T.start)return;const H=HL(),mins=(Date.now()-T.start)/6e4,A=S.hlFired||(S.hlFired={}),key=String(T.start);
  if(H.move&&mins>=(+H.moveMin||50)){const n=Math.floor(mins/(+H.moveMin||50));if((A.mv||{})[key]!==n){A.mv={[key]:n};save();toast('🚶 '+t('mv3.t'));vibT('rem')}}
  if(H.eye&&mins>=20){const n=Math.floor(mins/20);if((A.ey||{})[key]!==n){A.ey={[key]:n};save();toast('👀 '+t('ey3.t'))}}},30000);
/* 83. vibration patterns */
const VIBP={normal:{pray:[400,200,400],rem:[150],task:[60,40,60]},soft:{pray:[200],rem:[60],task:[40]},strong:{pray:[700,250,700,250,700],rem:[300,150,300],task:[120,60,120]},off:{pray:[],rem:[],task:[]}};
function vibT(kind){const p=(VIBP[HL().vibP]||VIBP.normal)[kind];if(p&&p.length)try{navigator.vibrate&&navigator.vibrate(p)}catch(e){}}
/* 67 + 68. sleep and sport logs (they also fill the existing habits) */
function hbFind(id){return HB().find(h=>h.id===id)}
function openSleep(){const d=day(todayKey()),s=d.sleep3||{};openInfo('😴 '+t('sl3.t'),`<div class="field"><div><label>${t('sl3.bed')}</label></div><input class="in" type="time" id="slBed" value="${s.bed||'23:00'}"></div><div class="field"><div><label>${t('sl3.wake')}</label></div><input class="in" type="time" id="slWake" value="${s.wake||'06:00'}"></div><p id="slH" class="muted"></p><button class="btn pri" id="slSave">${t('ev.save')}</button>`);
  const calc=()=>{const [bh,bm]=$('#slBed').value.split(':').map(Number),[wh,wm]=$('#slWake').value.split(':').map(Number);let m=(wh*60+wm)-(bh*60+bm);if(m<=0)m+=1440;return Math.round(m/6)/10};const upd=()=>{$('#slH').textContent=t('sl3.h',calc())};$('#slBed').oninput=upd;$('#slWake').oninput=upd;upd();
  $('#slSave').onclick=()=>{const h=calc();d.sleep3={bed:$('#slBed').value,wake:$('#slWake').value,h};const hb=hbFind('sleep');if(hb&&hb.type==='hours')hbSet(hb,h);else save();$$('.modal.on').forEach(m=>m.classList.remove('on'));toast(t('sl3.saved',h));renderTodayEv()}}
const SPORTS=['🏃','🚶','🏋️','🚴','🏊','⚽','🧘','🤸'];
function openSport(){const d=day(todayKey()),L_=d.sport3||[];openInfo('🏃 '+t('sp3.t'),`${L_.length?`<div class="cmlist">${L_.map(x=>`<div class="cmrow"><span>${x.ic} ${x.min} ${t('u.m')}</span></div>`).join('')}</div>`:''}<div class="spk">${SPORTS.map((s,i)=>`<button class="${i?'':'on'}" data-sp="${s}">${s}</button>`).join('')}</div><div class="field"><div><label>${t('sp3.min')}</label></div><input class="in num" id="spMin" type="number" min="5" step="5" value="30" style="width:80px"></div><button class="btn pri" id="spSave">${t('ev.save')}</button><p class="muted">${t('sp3.streak',sportStreak())}</p>`);
  let ic=SPORTS[0];$$('[data-sp]').forEach(b=>b.onclick=()=>{ic=b.dataset.sp;$$('[data-sp]').forEach(x=>x.classList.toggle('on',x===b))});
  $('#spSave').onclick=()=>{const m=+$('#spMin').value||0;if(m<=0)return;(d.sport3=d.sport3||[]).push({ic,min:m});const hb=hbFind('sport');if(hb&&hb.type==='check')hbSet(hb,true);else save();$$('.modal.on').forEach(x=>x.classList.remove('on'));toast(t('sp3.saved',m))}}
function sportStreak(){let n=0;const tk=todayKey();for(let i=0;i<400;i++){const d=S.days[dKey(addDays(keyToDate(tk),-i))];const ok=d&&((d.sport3||[]).length||(d.hb&&d.hb.sport));if(ok)n++;else if(i>0)break}return n}
/* 70. screen time (entered by hand) */
function openScreen(){const d=day(todayKey());const v=prompt(t('sc3.ask'),d.screen3!=null?String(Math.round(d.screen3/60*10)/10):'');if(v==null)return;const h=parseFloat(String(v).replace(',','.'));if(isNaN(h))return;d.screen3=Math.round(h*60);save();toast(t('sc3.saved',h))}
/* 71. quit-habits: a day you kept away counts */
function addQuitHabit(){const n=prompt(t('qh3.ask'));if(!n||!n.trim())return;HB().push({id:'q'+uid(),name:n.trim(),icon:'🚫',type:'check',quit:true});save();renderTodayEv();toast(t('qh3.added'))}
/* 69. meal reminders */
function mealItems(out,now){const M=HL().meals;if(!M||!M.on)return;const td=keyToDate(todayKey());for(let i=0;i<2;i++){const d=addDays(td,i);[['b','ml3.b'],['l','ml3.l'],['d','ml3.d']].forEach(([k,l],j)=>{if(!M[k])return;const at=atTime(d,M[k]);if(at>now)out.push({id:6700+i*3+j,t:at,title:'🍽 '+t(l),body:t('ml3.body'),open:'today'})})}}
{const _ex4=extraSched;extraSched=function(out,now){_ex4(out,now);try{mealItems(out,now)}catch(e){}}}
setInterval(()=>{if(ANDROID)return;const out=[],now=Date.now();mealItems(out,now);const A=S.mlFired||(S.mlFired={});out.forEach(x=>{const k=x.id+'_'+todayKey();if(Math.abs(x.t-now)<45000&&!A[k]){A[k]=1;save();toast(x.title+' — '+x.body)}})},30000);
/* 74. water goal follows the weather (needs the location and internet) */
async function wxTemp(){const P=S.settings.prayer||{},lat=P.lat,lng=P.lng||P.lon;if(lat==null||lng==null)return null;const k=todayKey(),C=S.wx3||{};if(C.k===k)return C.t;try{const r=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max&timezone=auto&forecast_days=1`);if(!r.ok)return null;const j=await r.json();const tmax=j.daily.temperature_2m_max[0];S.wx3={k,t:tmax};save();return tmax}catch(e){return null}}
function wxExtra(){const C=S.wx3;if(!C||C.k!==todayKey()||S.settings.wxWater===false)return 0;return C.t>=35?3:C.t>=30?2:C.t>=26?1:0}
{const _wc=wtCfg;wtCfg=function(){const c=_wc();const x=wxExtra();return x?Object.assign({},c,{goal:c.goal+x,wx:x}):c}}
setTimeout(()=>{if(S.settings.wxWater!==false&&waterOn&&waterOn())wxTemp().then(v=>{if(v!=null){try{renderToday()}catch(e){}}})},6000);
/* 72 + 73. what goes together, and a mood map */
function corr(){const tk=todayKey(),rows=[];for(let i=1;i<=60;i++){const k=dKey(addDays(keyToDate(tk),-i)),d=S.days[k];if(!d)continue;const w=totals(k).tot/36e5;const sl=d.sleep3?d.sleep3.h:(d.hb&&+d.hb.sleep)||null;rows.push({w,sl,sp:!!((d.sport3||[]).length||(d.hb&&d.hb.sport)),en:d.energy,sc:d.screen3})}
  const avg=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:null,out=[];
  const cmp=(f,lab)=>{const A=rows.filter(f[0]).map(r=>r.w),B=rows.filter(f[1]).map(r=>r.w);if(A.length<4||B.length<4)return;const a=avg(A),b=avg(B);if(b>0.2&&a/b>=1.15)out.push(t(lab,Math.round(a/b*10)/10))};
  cmp([r=>r.sl!=null&&r.sl>=7,r=>r.sl!=null&&r.sl<7],'cr3.sleep');cmp([r=>r.sp,r=>!r.sp],'cr3.sport');cmp([r=>r.sc!=null&&r.sc<=120,r=>r.sc!=null&&r.sc>120],'cr3.screen');cmp([r=>r.en>=4,r=>r.en!=null&&r.en<=2],'cr3.energy');return out}
function moodGrid(){const tk=todayKey(),cells=[];for(let i=34;i>=0;i--){const k=dKey(addDays(keyToDate(tk),-i)),e=(S.days[k]||{}).energy;cells.push(`<i class="m${e||0}" title="${gShort(keyToDate(k))}"></i>`)}return`<div class="mdg" dir="ltr">${cells.join('')}</div><div class="pmleg">😫 <i class="m1"></i><i class="m2"></i><i class="m3"></i><i class="m4"></i><i class="m5"></i> 🤩</div>`}
/* the health hub */
function openHealth3(){const d=S.days[todayKey()]||{},H=HL(),c=corr();const sl=d.sleep3?t('sl3.h',d.sleep3.h):'—',sp=(d.sport3||[]).reduce((a,x)=>a+x.min,0);
  openInfo('💪 '+t('hh3.t'),`<div class="hhgrid"><button data-hh="sleep">😴<b>${sl}</b><small>${t('sl3.t')}</small></button><button data-hh="sport">🏃<b>${sp?sp+' '+t('u.m'):'—'}</b><small>${t('sp3.t')}</small></button><button data-hh="screen">📱<b>${d.screen3!=null?fmtHM(d.screen3*6e4):'—'}</b><small>${t('sc3.t')}</small></button><button data-hh="quit">🚫<b>+</b><small>${t('qh3.t')}</small></button></div>
   <h4 style="margin:14px 0 6px">${t('md3.t')}</h4>${moodGrid()}${c.length?`<h4 style="margin:14px 0 6px">${t('cr3.t')}</h4><ul class="crl">${c.map(x=>`<li>${x}</li>`).join('')}</ul>`:`<p class="muted">${t('cr3.none')}</p>`}${S.wx3&&S.wx3.k===todayKey()?`<p class="muted">🌡 ${t('wx3.note',Math.round(S.wx3.t),wxExtra())}</p>`:''}`);
  const f={sleep:openSleep,sport:openSport,screen:()=>{$$('.modal.on').forEach(m=>m.classList.remove('on'));openScreen()},quit:()=>{$$('.modal.on').forEach(m=>m.classList.remove('on'));addQuitHabit()}};$$('[data-hh]').forEach(b=>b.onclick=()=>f[b.dataset.hh]())}
{const rv=$('#rvBtn');if(rv&&!$('#hhBtn')){rv.insertAdjacentHTML('beforebegin',`<button class="btn sm ghost" id="hhBtn">💪 <span>${t('hh3.btn')}</span></button>`);$('#hhBtn').onclick=openHealth3}}
{const _rte11=renderTodayEv;renderTodayEv=function(){_rte11();const box=$('#todayEv');if(!box)return;const d=S.days[todayKey()]||{},hr=new Date().getHours();if(S.settings.sleepAsk!==false&&hr>=4&&hr<12&&!d.sleep3){box.insertAdjacentHTML('beforeend',`<span class="evchip" data-sl3 style="--c:#6366f1"><i></i>😴 ${t('sl3.chip')}</span>`);box.querySelector('[data-sl3]').onclick=openSleep}}}
/* 75 + 76. phone widgets: the task to do now, and the ayah of the day */
function wxPush(){if(!ANDROID||!window.ThabatAndroid.widgetX)return;try{const k=todayKey(),d=day(k),open=d.tasks.filter(x=>!x.done),nowHM=new Date().toTimeString().slice(0,5);
  const order=open.slice().sort((a,b)=>(b.frog?1:0)-(a.frog?1:0)||(b.doing?1:0)-(a.doing?1:0)||((a.at&&a.at<=nowHM)?0:1)-((b.at&&b.at<=nowHM)?0:1)||(a.created||0)-(b.created||0));
  const L_=order.map(x=>({k,id:x.id,text:(x.frog?'🐸 ':'')+x.text}));const nx=nextPrayer();const o={lbl:t('wg3.lbl'),none:t('wn3.none'),sub:nx?t('wn3.until',t('pr.'+nx.k),fmtHM(Math.max(0,nx.t-Date.now()))):'',task:L_[0]||null,next:L_.slice(1,6)};
  try{const [s,a]=aydRef().split(':').map(Number),tx=QB.hafs?qAyahText(s,a,'hafs'):null;if(tx)o.ayah={t:'﴿ '+tx+' ﴾',ref:qSurahName(s)+' '+a,k:s+':'+a}}catch(e){}
  const js=JSON.stringify(o);if(js===wxPush._l)return;wxPush._l=js;window.ThabatAndroid.widgetX(js)}catch(e){}}
function wxTakeDone(){if(!ANDROID||!window.ThabatAndroid.takeWx)return;try{const L_=JSON.parse(window.ThabatAndroid.takeWx()||'[]');let n=0;L_.forEach(e=>{const d=S.days[e.k];const x=d&&d.tasks.find(q=>q.id===e.id);if(x&&!x.done){x.done=true;x.doneAt=e.at||Date.now();n++}});if(n){save();renderTasks();toast(t('wg3.done',n))}}catch(e){}}
{const _tp=window.thabatPoll;window.thabatPoll=()=>{try{_tp&&_tp()}catch(e){}wxTakeDone();wxPush()}}
{const _rt4=renderTasks;renderTasks=function(){_rt4();setTimeout(wxPush,200)}}
if(ANDROID){setTimeout(()=>{wxTakeDone();wxPush()},2500);setInterval(wxPush,5*6e4);setTimeout(()=>{qLoadPack('hafs').then(wxPush).catch(()=>{})},5000)}
{const _to=thabatOpen;thabatOpen=function(o){if(String(o).startsWith('ayah:')){const [s,a]=String(o).slice(5).split(':').map(Number);qLoadPack('hafs').catch(()=>{}).then(()=>qGoAyah(s,a));return}return _to(o)}}
/* 78. arrange and hide the home cards */
function homeCards(){return $$('#v-today .grid .stack>.card, #v-today .grid>.card')}
function cardKey(c){if(!c.dataset.hk){const h=c.querySelector('h3,.ch,.card-h,header');c.dataset.hk=(c.id||(h&&h.textContent.trim().slice(0,24))||'c'+[...c.parentElement.children].indexOf(c))}return c.dataset.hk}
function homeApply(){const L_=S.settings.home3||{};homeCards().forEach(c=>{const k=cardKey(c),o=L_[k]||{};c.style.order=o.o!=null?o.o:'';c.classList.toggle('hhide',!!o.h)})}
function openHomeLayout(){const L_=S.settings.home3||(S.settings.home3={}),cs=homeCards().slice().sort((a,b)=>(+a.style.order||0)-(+b.style.order||0));
  const name=c=>{const h=c.querySelector('h3');if(!h)return cardKey(c);const sp=h.querySelector('span');return((sp&&sp.textContent)||(h.firstChild&&h.firstChild.textContent)||h.textContent).trim().slice(0,30)};
  openInfo('🧩 '+t('hl3.t'),`<p class="muted" style="margin:0 0 8px">${t('hl3.sub')}</p><div class="hlist">${cs.map(c=>{const k=cardKey(c),o=L_[k]||{};return`<div class="hlrow" data-k="${esc(k)}"><span>${esc(name(c))}</span><span class="row"><button class="btn sm ghost" data-up>↑</button><button class="btn sm ghost" data-dn>↓</button><button class="btn sm ${o.h?'':'ghost'}" data-hd>${o.h?t('hl3.show'):t('hl3.hide')}</button></span></div>`}).join('')}</div><button class="btn sm ghost" id="hlReset">${t('hl3.reset')}</button>`);
  const rows=()=>[...$$('.hlist .hlrow')];const persist=()=>{rows().forEach((r,i)=>{const o=L_[r.dataset.k]||(L_[r.dataset.k]={});o.o=i});save();homeApply()};
  $$('.hlist .hlrow').forEach(r=>{r.querySelector('[data-up]').onclick=()=>{const p=r.previousElementSibling;if(p)p.before(r);persist()};r.querySelector('[data-dn]').onclick=()=>{const n=r.nextElementSibling;if(n)n.after(r);persist()};r.querySelector('[data-hd]').onclick=()=>{const o=L_[r.dataset.k]||(L_[r.dataset.k]={});o.h=!o.h;save();homeApply();openHomeLayout()}});
  $('#hlReset').onclick=()=>{S.settings.home3={};save();homeApply();openHomeLayout()}}
{const _rtd5=renderToday;renderToday=function(){_rtd5();homeApply()}}setTimeout(homeApply,600);
/* 79. three more themes */
Object.assign(COLORS,{masjid:{n:{ar:'مسجدي',en:'Masjid'},d:'#34d399',l:'#047857',sh:158},desert:{n:{ar:'صحراوي',en:'Desert'},d:'#e0b07a',l:'#9a6a2f',sh:32},night:{n:{ar:'ليلي',en:'Night'},d:'#a5b4fc',l:'#4f46e5',sh:232}});
/* 87. swipe a task: towards the start = done, towards the end = tomorrow */
{const el=$('#tasks');let sx=0,sy=0,li=null,dx=0,lock=null;
  el.addEventListener('touchstart',e=>{const l=e.target.closest('.task');if(!l||e.target.closest('[contenteditable],button'))return;li=l;sx=e.touches[0].clientX;sy=e.touches[0].clientY;dx=0;lock=null},{passive:true});
  el.addEventListener('touchmove',e=>{if(!li)return;const x=e.touches[0].clientX-sx,y=e.touches[0].clientY-sy;if(lock===null&&(Math.abs(x)>8||Math.abs(y)>8))lock=Math.abs(x)>Math.abs(y)*1.3?'x':'y';if(lock!=='x')return;dx=x;li.style.transform=`translateX(${x}px)`;li.style.background=`color-mix(in srgb,${(document.documentElement.dir==='rtl'?x>0:x<0)?'#22c55e':'#6366f1'} ${Math.min(30,Math.abs(x)/3)}%,transparent)`},{passive:true});
  el.addEventListener('touchend',()=>{if(!li)return;const l=li;li=null;l.style.transition='transform .2s';l.style.transform='';setTimeout(()=>{l.style.transition='';l.style.background=''},220);if(lock!=='x'||Math.abs(dx)<80)return;
    const d=day(todayKey()),x=d.tasks.find(q=>q.id===l.dataset.id);if(!x)return;const toStart=document.documentElement.dir==='rtl'?dx>0:dx<0;
    if(toStart){x.done=!x.done;x.doneAt=x.done?Date.now():null;save();renderTasks();if(x.done){chimeSoft();vibT('task')}}
    else{const tm=dKey(addDays(keyToDate(todayKey()),1)),dd=day(tm);if(!dd.tasks.some(q=>q.fromId===x.id)){dd.tasks.push({id:uid(),text:x.text,done:false,created:Date.now(),from:todayKey(),fromId:x.id});x.pp=(x.pp||[]).concat([{id:dd.tasks[dd.tasks.length-1].id,k:tm}]);save();renderTasks();toast(t('tk.ppd',t('tk.tomorrow')))}}},{passive:true})}
/* 86. search ayahs from the command palette */
{const _cs=cmdSearch;cmdSearch=function(q){const out=_cs(q);try{if(q&&q.trim().length>=3&&QB.hafs){const n=qNorm(q.trim())[0],res=[];for(let p=1;p<=604&&res.length<6;p++){for(const x of QB.hafs.pages[p].ay){if(x.cont)continue;const tx=qAyahText(x.s,x.a,'hafs')||'';if(qNorm(tx)[0].includes(n)){res.push({g:'ayah',sc:1,icon:'۝',label:tx.slice(0,70),sub:qSurahName(x.s)+' '+x.a,run:()=>qGoAyah(x.s,x.a)});if(res.length>=6)break}}}return out.concat(res)}else if(q&&q.trim().length>=3)qLoadPack('hafs').catch(()=>{})}catch(e){}return out}}
/* 89. transfer over the local network (PC helper ↔ phone) */
const LANCH=60000;
function b64u(s){return btoa(unescape(encodeURIComponent(s))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
function unb64u(s){s=s.replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';return decodeURIComponent(escape(atob(s)))}
async function lanApply(js){const d=JSON.parse(js);if(!d||!d.days||!d.settings)throw new Error('bad');if(!confirm(t('ln3.replaceQ')))return false;await autoBackup(true);S=deepMerge(structuredClone(DEF),d);LANG=S.settings.lang||'ar';save();applyTheme();applyI18n();renderAll();toast(t('toast.imported'));return true}
async function lanPcOpen(){let r;try{r=await (await fetch(HELPER+'/lanopen',{cache:'no-store'})).json()}catch(e){toast(t('ln3.noHelper'));return}if(!r||!r.ok){toast(t('ln3.noHelper'));return}
  const enc=b64u(JSON.stringify(S)),n=Math.ceil(enc.length/LANCH);for(let i=0;i<n;i++){await fetch(`${HELPER}/lanstage?i=${i}&n=${n}&d=${enc.slice(i*LANCH,(i+1)*LANCH)}`,{cache:'no-store'})}
  openInfo('📶 '+t('ln3.t'),`<p>${t('ln3.pcSteps')}</p><div class="lnbox"><div><small>${t('ln3.addr')}</small><b dir="ltr">${(r.ips||[]).join(' / ')||'—'}</b></div><div><small>${t('ln3.code')}</small><b dir="ltr">${r.code}</b></div></div><p class="muted" id="lnSt">${t('ln3.wait')}</p><button class="btn sm ghost" id="lnClose">${t('ln3.close')}</button>`);
  $('#lnClose').onclick=()=>{fetch(HELPER+'/lanclose').catch(()=>{});$$('.modal.on').forEach(m=>m.classList.remove('on'))};
  const poll=setInterval(async()=>{if(!$('#lnSt')){clearInterval(poll);return}try{const i=await (await fetch(HELPER+'/laninfo',{cache:'no-store'})).json();if(i.ph>0&&i.got>=i.ph){clearInterval(poll);$('#lnSt').textContent=t('ln3.got');let s='';for(let k=0;k<i.ph;k++)s+=await (await fetch(HELPER+'/lanpull?i='+k,{cache:'no-store'})).text();fetch(HELPER+'/lanclose').catch(()=>{});await lanApply(unb64u(s))}}catch(e){}},2000)}
async function lanPhone(dir){const ip=($('#lnIp').value||'').trim(),code=($('#lnCode').value||'').trim();if(!/^[\d.]+$/.test(ip)||!/^\d{6}$/.test(code)){toast(t('ln3.need'));return}S.lanIp=ip;save();const base=`http://${ip}:47814/lan`,st=$('#lnSt2');
  try{const info=await (await fetch(`${base}/info?c=${code}`,{cache:'no-store'})).json();
    if(dir==='get'){if(!info.pc){toast(t('ln3.empty'));return}let s='';for(let i=0;i<info.pc;i++){st.textContent=t('ln3.prog',i+1,info.pc);s+=await (await fetch(`${base}/get?c=${code}&i=${i}`,{cache:'no-store'})).text()}st.textContent='';await lanApply(unb64u(s))}
    else{const enc=b64u(JSON.stringify(S)),n=Math.ceil(enc.length/LANCH);for(let i=0;i<n;i++){st.textContent=t('ln3.prog',i+1,n);await fetch(`${base}/put?c=${code}&i=${i}&n=${n}&d=${enc.slice(i*LANCH,(i+1)*LANCH)}`,{cache:'no-store'})}st.textContent=t('ln3.sent')}}
  catch(e){toast(t('ln3.fail'))}}
function openLan(){if(!ANDROID&&!MOB.matches){lanPcOpen();return}
  openInfo('📶 '+t('ln3.t'),`<p class="muted">${t('ln3.phSteps')}</p><div class="field"><div><label>${t('ln3.addr')}</label></div><input class="in" id="lnIp" dir="ltr" inputmode="decimal" placeholder="192.168.1.10" value="${esc(S.lanIp||'')}" style="width:160px"></div><div class="field"><div><label>${t('ln3.code')}</label></div><input class="in" id="lnCode" dir="ltr" inputmode="numeric" maxlength="6" style="width:110px"></div>
   <div class="row" style="gap:6px;flex-wrap:wrap"><button class="btn" id="lnGet">⬇ ${t('ln3.get')}</button><button class="btn ghost" id="lnPut">⬆ ${t('ln3.put')}</button></div><p class="muted" id="lnSt2"></p>`);$('#lnGet').onclick=()=>lanPhone('get');$('#lnPut').onclick=()=>lanPhone('put')}
/* 91 + 95. story images (1080×1920) for the week and the year */
async function storyImg(kind){try{await document.fonts.ready}catch(e){}const W=1080,H=1920,c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d'),acc=themeAccent();
  const grd=g.createLinearGradient(0,0,0,H);grd.addColorStop(0,'#0d1015');grd.addColorStop(1,'#1a1f29');g.fillStyle=grd;g.fillRect(0,0,W,H);
  g.fillStyle=acc;g.globalAlpha=.12;g.beginPath();g.arc(W*.85,H*.12,360,0,7);g.fill();g.globalAlpha=1;
  const F=(w,s)=>`${w} ${s}px "IBM Plex Sans Arabic","Segoe UI",Tahoma,sans-serif`;g.direction=LANG==='ar'?'rtl':'ltr';g.textAlign='center';
  const keys=kind==='year'?(()=>{const y=new Date().getFullYear(),o=[];for(let d=new Date(y,0,1);dKey(d)<=todayKey();d=addDays(d,1))o.push(dKey(d));return o})():periodKeys('week',keyToDate(todayKey())).filter(k=>k<=todayKey());let st;try{st=periodStats(keys)}catch(e){st={tot:keys.reduce((a,k)=>a+totals(k).tot,0),gold:0,tasksDone:0,q:{read:0}}}
  const pr=onTimePct(keys);g.fillStyle='#e6e9ef';g.font=F(700,64);g.fillText(kind==='year'?t('st3.year',new Date().getFullYear()):t('st3.week'),W/2,260);g.fillStyle='#8b95a5';g.font=F(400,36);g.fillText(gShort(keyToDate(keys[0]))+' — '+gShort(keyToDate(keys[keys.length-1])),W/2,330);
  const tiles=[['⏱',fmtHM(st.tot),t('st3.work')],['⭐',String(st.gold||0),t('st3.gold')],['✅',String(st.tasksDone||0),t('st3.tasks')],['🕌',pr!=null?pr+'%':'—',t('st3.pray')],['📖',String((st.q&&st.q.read)||0),t('st3.quran')]];
  tiles.forEach(([ic,v,l],i)=>{const y=470+i*250;g.fillStyle='rgba(255,255,255,.05)';g.beginPath();g.roundRect?g.roundRect(120,y,W-240,200,36):g.rect(120,y,W-240,200);g.fill();g.font=F(400,72);g.fillStyle='#fff';g.fillText(ic,W/2,y+80);g.fillStyle=acc;g.font=F(700,64);g.fillText(v,W/2,y+150);g.fillStyle='#8b95a5';g.font=F(400,30);g.fillText(l,W/2,y+190)});
  g.fillStyle='#8b95a5';g.font=F(400,32);g.fillText(t('app')+' · created by jake750_',W/2,H-90);
  const url=c.toDataURL('image/png'),name=`thabat-${kind}-${todayKey()}.png`;
  if(ANDROID&&window.ThabatAndroid.saveFile){try{window.ThabatAndroid.saveFile(name,'image/png',url.split(',')[1]);toast(t('st3.saved'));return}catch(e){}}
  try{const b=await (await fetch(url)).blob(),f=new File([b],name,{type:'image/png'});if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f]});return}}catch(e){}
  const a=document.createElement('a');a.href=url;a.download=name;a.click()}
/* 92. send a backup to Google Drive (or anywhere) through the share sheet */
async function shareBackup(){const js=JSON.stringify(S),name='thabat-backup-'+todayKey()+'.json';try{if(ANDROID&&window.ThabatAndroid.saveFile){window.ThabatAndroid.saveFile(name,'application/json',btoa(unescape(encodeURIComponent(js))));toast(t('db3.saved'));return}const f=new File([js],name,{type:'application/json'});if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],title:name});return}}catch(e){}saveBytes(name,'application/json',new TextEncoder().encode(js));toast(t('db3.pc'))}
/* brief buttons for the stories */
{const _rbS=renderBrief;renderBrief=function(){_rbS();try{if(!$('#stBtn')){const a=$('#bdBtn');if(a)a.insertAdjacentHTML('beforebegin',`<button class="btn sm ghost" id="stBtn">📸</button>`);const b=$('#stBtn');if(b)b.onclick=e=>{const r=b.getBoundingClientRect();const p=qPopAt(`<div class="aymh">📸 ${t('st3.t')}</div><button data-st="week">${t('st3.week')}</button><button data-st="year">${t('st3.yearB')}</button>`,r.left+r.width/2,r.bottom-8,'aymenu');p.querySelectorAll('[data-st]').forEach(x=>x.onclick=()=>{closePP();storyImg(x.dataset.st)})}}}catch(e){}}}
/* settings for this block */
function renderD4Set(){const H=HL(),st=S.settings;
  const tg=(id,get,set)=>{const e=$(id);if(e)toggle(e,get(),set)};tg('#mvT',()=>!!H.move,v=>{H.move=v});tg('#eyT',()=>!!H.eye,v=>{H.eye=v});tg('#mlT',()=>!!H.meals.on,v=>{H.meals.on=v;if(ANDROID)setTimeout(androidSchedule,100)});tg('#wxwT',()=>st.wxWater!==false,v=>{st.wxWater=v});tg('#slaT',()=>st.sleepAsk!==false,v=>{st.sleepAsk=v});
  const mm=$('#mvMin');if(mm){mm.value=H.moveMin||50;mm.onchange=()=>{H.moveMin=Math.max(20,Math.min(120,+mm.value||50));save()}}
  ['b','l','d'].forEach(k=>{const e=$('#ml_'+k);if(e){e.value=H.meals[k]||'';e.onchange=()=>{H.meals[k]=e.value;save();if(ANDROID)setTimeout(androidSchedule,100)}}});
  const vp=$('#vibSel');if(vp){vp.innerHTML=['normal','soft','strong','off'].map(k=>`<option value="${k}" ${H.vibP===k?'selected':''}>${t('vb3.'+k)}</option>`).join('');vp.onchange=()=>{H.vibP=vp.value;save();vibT('pray')}}
  const b1=$('#homeLayBtn');if(b1)b1.onclick=openHomeLayout;const b2=$('#lanBtn');if(b2)b2.onclick=openLan;const b3=$('#drvBtn');if(b3)b3.onclick=shareBackup}
{const _rs23=renderSettings;renderSettings=function(){_rs23();try{renderD4Set()}catch(e){console.error(e)}}}
