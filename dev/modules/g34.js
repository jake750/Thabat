/* ============ v3.26: Android and reminders — task reminders (with ✓ / later buttons on Android), the morning plan after Fajr, the Fajr wake-up alarm, recordings on the lock screen and in the background, the phone's own colour, the page the prayer widgets open, a «new task» shortcut and a Quick Settings tile ============ */
function andV(){try{return ANDROID&&window.ThabatAndroid&&window.ThabatAndroid.version?+window.ThabatAndroid.version()||0:0}catch(e){return 0}}
function remHash(s){let h=0;s=String(s);for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))|0;return Math.abs(h)}
/* ---------- task reminders (pick 3) ---------- */
function remTasks(fromKey,days){const out=[],td=keyToDate(fromKey||todayKey());for(let i=0;i<days;i++){const k=dKey(addDays(td,i)),d=S.days[k];if(d&&d.tasks)d.tasks.forEach(x=>out.push({k,x}))}return out}
function remPop(anchor,k,id){const x=(day(k).tasks||[]).find(q=>q.id===id);if(!x)return;const now=Date.now(),at=x.at?atTime(keyToDate(k),x.at):0;
  const cur=x.rem&&x.rem>now?new Date(x.rem):new Date(Math.max(now+36e5,keyToDate(k).getTime()+9*36e5));const hm=pad(cur.getHours())+':'+pad(cur.getMinutes());
  const opts=[['+30',now+30*6e4,t('rem.in30')],['+60',now+60*6e4,t('rem.in60')],...(at>now+10*6e4?[['b10',at-10*6e4,t('rem.before10')]]:[]),...(at>now?[['at',at,t('rem.atTime')]]:[]),['tm',atTime(addDays(keyToDate(todayKey()),1),'09:00'),t('rem.tom9')]];
  const r=anchor.getBoundingClientRect(),p=qPopAt(`<div class="aymh">⏰ ${t('rem.t')}</div><div class="remq">${opts.map(o=>`<button data-r="${o[1]}">${o[2]}</button>`).join('')}</div><div class="pdlt-row remrow"><input type="date" class="in" id="remD" value="${dKey(cur)}"><input type="time" class="in" id="remT" step="300" value="${hm}"></div><div class="pdlt-act"><button class="btn sm pri" id="remOk">${t('pdl.save')}</button>${x.rem?`<button class="btn sm ghost" id="remNo">${t('rem.off')}</button>`:''}</div>`,r.left+r.width/2,r.bottom-6,'aymenu pdltm');
  const set=ts=>{closePP();if(ts&&ts<=Date.now()){toast(t('rem.past'));return}if(ts){x.rem=ts}else delete x.rem;delete x.remN;save();renderTasks();remPush();if(ts)toast(t('rem.set',fmtT(ts),dayLabel(dKey(new Date(ts)))))};
  p.querySelectorAll('[data-r]').forEach(b=>b.onclick=()=>set(+b.dataset.r));
  p.querySelector('#remOk').onclick=()=>{const dv=p.querySelector('#remD').value,tv=p.querySelector('#remT').value;if(!dv||!tv)return;set(atTime(keyToDate(dv),tv))};
  const no=p.querySelector('#remNo');if(no)no.onclick=()=>set(0)}
function remPush(){try{androidSchedule()}catch(e){}try{pcnPush&&pcnPush()}catch(e){}}
{const _ux=uxMenuExtras;uxMenuExtras=function(k,id,...a){const r=_ux(k,id,...a);try{const p=$('#ppPop'),x=day(k).tasks.find(q=>q.id===id);if(!p||!x||x.done)return r;const b=document.createElement('button');b.innerHTML=`⏰ ${x.rem&&x.rem>Date.now()?t('rem.edit',fmtT(x.rem)):t('rem.t')}`;b.onclick=e=>{e.stopPropagation();const an=document.querySelector(`#tasks .task[data-id="${id}"]`)||p;closePP();remPop(an,k,id)};p.append(b)}catch(e){console.error(e)}return r}}
{const _tm=taskMeta;taskMeta=function(x,...a){let h=_tm(x,...a);try{if(x&&x.rem&&!x.done&&x.rem>Date.now()-6e4){const d=dKey(new Date(x.rem));h+=`<span class="trem" title="${esc(t('rem.t'))}">⏰ ${fmtT(x.rem)}${d!==todayKey()?' · '+esc(dayLabel(d)):''}</span>`}}catch(e){}return h}}
/* ---------- what goes into the phone's / PC's schedule ---------- */
{const _es=extraSched;extraSched=function(out,now,...a){_es(out,now,...a);try{
  /* task reminders: today and the next 7 days; a reminder snoozed from the notification is already scheduled by the phone */
  remTasks(todayKey(),8).forEach(({k,x})=>{if(x.done||!x.rem||x.rem<=now||x.remN)return;out.push({id:6000+remHash(x.id)%400,t:x.rem,title:'⏰ '+x.text,body:t('rem.body',dayLabel(k)),open:'today',...(andV()>=4?{tk:x.id,doneLbl:'✓ '+t('rem.done'),tkLaterLbl:t('rem.later')}:{})})});
  /* the morning plan after Fajr */
  const M=S.settings.mPlan||{};if(M.on){for(let i=0;i<2;i++){const d=addDays(keyToDate(todayKey()),i),k=dKey(d),pt=prayerTimes(d),at=pt.fajr+(+M.after||15)*6e4;if(at<=now)continue;
    const tk=((S.days[k]||{}).tasks||[]).filter(x=>!x.done),ev=evsOn(k).filter(e=>e.time),bits=[];if(tk.length)bits.push(t('mp.tasks',tk.length)+': '+tk.slice(0,3).map(x=>x.text).join('، ')+(tk.length>3?'…':''));if(ev.length)bits.push('📅 '+ev.slice(0,2).map(e=>e.time+' '+e.title).join('، '));
    out.push({id:5910+i,t:at,title:'☀ '+t('mp.title'),body:bits.join(' · ')||t('mp.none'),open:'today'})}}
  /* the Fajr wake-up alarm (Android only: an alarm clock that rings until you stop it) */
  const W=S.settings.wakeF||{};if(W.on&&andV()>=4){for(let i=0;i<3;i++){const d=addDays(keyToDate(todayKey()),i),f=prayerTimes(d).fajr,at=f-(+W.before||0)*6e4;if(at<=now)continue;
    out.push({id:5900+i,t:at,wake:1,title:'🌅 '+t('wk.title'),body:t('wk.body',fmtT(f)),snz:+W.snz||5,snzLbl:t('wk.snz',+W.snz||5),stopLbl:t('wk.stop'),snd:W.snd||'alarm',vol:100})}}
}catch(e){console.error(e)}}}
/* the buttons pressed on a task reminder while the app was closed */
function remActs(){if(andV()<4||!window.ThabatAndroid.takeTaskActs)return;let L=[];try{L=JSON.parse(window.ThabatAndroid.takeTaskActs()||'[]')}catch(e){}if(!L.length)return;let ch=false;
  const all=[];for(const k in S.days)((S.days[k]||{}).tasks||[]).forEach(x=>all.push(x));
  L.forEach(([id,a,ts])=>{const x=all.find(q=>q.id===id);if(!x)return;if(a==='done'){x.done=true;x.doneAt=ts||Date.now();delete x.rem;delete x.remN}else{x.rem=(ts||Date.now())+15*6e4;x.remN=1}ch=true});
  if(ch){save();try{renderTasks()}catch(e){}remPush()}}
{const _p=window.thabatPoll;window.thabatPoll=(...a)=>{try{_p&&_p(...a)}catch(e){}try{remActs()}catch(e){}}}
setTimeout(remActs,1800);
/* ---------- recordings on the lock screen and in the background (picks 145, 146) ---------- */
const MED={t:0,last:''};
function medPush(){if(andV()<4||!window.ThabatAndroid.mediaState)return;const a=RCX.el,r=RCL().find(x=>x.id===RCX.cur);let o;
  if(!a||!r)o={on:false};else o={on:true,title:r.title,artist:r.reciter||t('app'),playing:!a.paused,pos:Math.round((a.currentTime||0)*1000),dur:Math.round((isFinite(a.duration)?a.duration:(r.dur||0))*1000),rate:a.playbackRate||1,prevLbl:t('rcp.prev'),nextLbl:t('rcp.next'),playLbl:t('med.play'),pauseLbl:t('med.pause'),chName:t('rc.t')};
  const js=JSON.stringify(o);MED.t=Date.now();if(js===MED.last)return;MED.last=js;try{window.ThabatAndroid.mediaState(js)}catch(e){}}
{const _ra=rcAudio;rcAudio=function(...x){const a=_ra(...x);if(a&&!a._med){a._med=1;['play','pause','ended','loadedmetadata','ratechange','seeked'].forEach(ev=>a.addEventListener(ev,medPush));a.addEventListener('timeupdate',()=>{if(Date.now()-MED.t>15000)medPush()})}return a}}
{const _rs=rcStop;rcStop=function(...x){const r=_rs(...x);medPush();return r}}
window.thabatMedia=a=>{const el=RCX.el;if(!el)return;a=String(a||'');if(a==='play')el.play().catch(()=>{});else if(a==='pause')el.pause();else if(a==='next')rcStep(1);else if(a==='prev')rcStep(-1);else if(a.startsWith('seek:')){el.currentTime=(+a.slice(5)||0)/1000;medPush()}};
/* ---------- the phone's own colour (Android 12+, pick 143) ---------- */
(function(){if(andV()<4||!window.ThabatAndroid.sysColors)return;let c='';try{c=window.ThabatAndroid.sysColors()||''}catch(e){}const P=c.split(',');if(P.length<3)return;
  const hx=P[1].replace('#',''),R=parseInt(hx.slice(0,2),16)/255,G=parseInt(hx.slice(2,4),16)/255,B=parseInt(hx.slice(4,6),16)/255,mx=Math.max(R,G,B),mn=Math.min(R,G,B);let h=0;if(mx!==mn){const d=mx-mn;h=mx===R?((G-B)/d)%6:mx===G?(B-R)/d+2:(R-G)/d+4;h=Math.round(h*60);if(h<0)h+=360}
  COLORS.sys={n:{ar:'لون الهاتف',en:'Phone colour'},d:P[0],l:P[2],sh:h};if(S.settings.color==='sys')try{applyTheme()}catch(e){}})();
/* ---------- settings rows (Android) ---------- */
function andRows(){const tn=$('#tnT');if(!tn||$('#wakeRow')||andV()<4)return;const host=tn.closest('.field');if(!host)return;
  const W=S.settings.wakeF||(S.settings.wakeF={on:false,before:0,snd:'alarm',snz:5}),M=S.settings.mPlan||(S.settings.mPlan={on:false,after:15});
  host.insertAdjacentHTML('afterend',`<div class="field andonly" id="wakeRow"><div><label>🌅 ${t('wk.set')}</label><small>${t('wk.setSub')}</small></div><button class="sw-toggle ${W.on?'on':''}" id="wakeT"></button></div>
    <div class="field andonly wkopts" id="wakeOpts" ${W.on?'':'hidden'}><select class="in" id="wakeB">${[0,10,15,20,30,45,60].map(m=>`<option value="${m}" ${(+W.before||0)===m?'selected':''}>${m?t('wk.before',m):t('wk.atAdhan')}</option>`).join('')}</select><select class="in" id="wakeS"><option value="alarm" ${W.snd!=='adhan'?'selected':''}>${t('wk.sndAlarm')}</option><option value="adhan" ${W.snd==='adhan'?'selected':''}>${t('wk.sndAdhan')}</option></select><select class="in" id="wakeZ">${[5,10,15].map(m=>`<option value="${m}" ${(+W.snz||5)===m?'selected':''}>${t('wk.snz',m)}</option>`).join('')}</select></div>
    <div class="field" id="mpRow"><div><label>☀ ${t('mp.set')}</label><small>${t('mp.setSub')}</small></div><button class="sw-toggle ${M.on?'on':''}" id="mpT"></button></div>
    <div class="field andonly" id="wopRow"><div><label>📱 ${t('wo.set')}</label><small>${t('wo.setSub')}</small></div><select class="in" id="wopS">${[['',t('nav.today')],['quran',t('nav.quran')],['cal',t('nav.cal')],['timer',t('wo.timer')],['adhkar',t('wo.adhkar')]].map(([v,l])=>`<option value="${v}" ${(S.settings.wOpen||'')===v?'selected':''}>${esc(l)}</option>`).join('')}</select></div>`);
  const sv=()=>{save();try{androidSchedule()}catch(e){}};
  $('#wakeT').onclick=e=>{W.on=!W.on;e.currentTarget.classList.toggle('on',W.on);$('#wakeOpts').hidden=!W.on;sv();if(W.on)toast(t('wk.on',fmtT(prayerTimes(addDays(new Date(),new Date().getHours()>12?1:0)).fajr-(+W.before||0)*6e4)))};
  $('#wakeB').onchange=e=>{W.before=+e.target.value;sv()};$('#wakeS').onchange=e=>{W.snd=e.target.value;sv()};$('#wakeZ').onchange=e=>{W.snz=+e.target.value;sv()};
  $('#mpT').onclick=e=>{M.on=!M.on;e.currentTarget.classList.toggle('on',M.on);sv();remPush()};
  $('#wopS').onchange=e=>{S.settings.wOpen=e.target.value;save();try{window.ThabatAndroid.setWidgetOpen(S.settings.wOpen)}catch(_){}}}
/* the morning plan also works on the PC (with PC notifications on): show its row there too */
function pcRows(){if(ANDROID||$('#mpRow'))return;const pn=$('#pcnT')||document.querySelector('[data-i18n="set.pcNotif"]');const host=pn&&pn.closest('.field');if(!host)return;const M=S.settings.mPlan||(S.settings.mPlan={on:false,after:15});
  host.insertAdjacentHTML('afterend',`<div class="field" id="mpRow"><div><label>☀ ${t('mp.set')}</label><small>${t('mp.setSub')}</small></div><button class="sw-toggle ${M.on?'on':''}" id="mpT"></button></div>`);
  $('#mpT').onclick=e=>{M.on=!M.on;e.currentTarget.classList.toggle('on',M.on);save();remPush()}}
{const _sv=showView;showView=function(v,...a){const r=_sv(v,...a);if(v==='set')setTimeout(()=>{try{andRows();pcRows()}catch(e){console.error(e)}},50);return r}}
/* ---------- the «new task» shortcut, the recordings from the media notification ---------- */
{const _to=thabatOpen;thabatOpen=function(w,...a){if(w==='task'){showView('today');setTimeout(()=>{const i=$('#taskIn');if(i){i.scrollIntoView({block:'center'});i.focus()}},250);return}if(w==='recits'){showView('lib');try{LIB.open='au:';renderLib()}catch(e){}return}return _to(w,...a)}}
setTimeout(()=>{if(andV()>=4&&S.settings.wOpen!=null)try{window.ThabatAndroid.setWidgetOpen(S.settings.wOpen)}catch(e){}},2500);
