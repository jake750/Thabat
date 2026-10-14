/* ============ v3.1 phone: timer notification, tasbih widget, wird notification, prayer Do-Not-Disturb, app lock ============ */
function tnOn(){return S.settings.timerNotif!==false}
let TN_LAST='';
function timerNotifPush(){if(!ANDROID||!window.ThabatAndroid.timerNotif)return;const T=S.timer,c=catOf(T.cat),pj=T.proj&&pjOf(T.proj);
  const o={on:tnOn(),mode:T.mode,base:T.mode==='work'?T.start:(T.brkStart||Date.now()),end:T.mode==='brk'&&T.brkDur?T.brkStart+T.brkDur*6e4:0,title:t('tn.work',catName(c)),text:[pj?'📁 '+pj.name:'',T.task?'▶ '+T.task.text:''].filter(Boolean).join(' · ')||t('tn.sub'),
    brkTitle:'☕ '+t('tn.brk'),brkText:t('tn.brkB',catName(c)),chName:t('timer.title'),lbl:{brk5:'☕ 5',brk15:'☕ 15',stop:'■ '+t('btn.end'),resume:'▶ '+t('btn.resume')}};
  const js=JSON.stringify(o);if(js===TN_LAST)return;TN_LAST=js;try{window.ThabatAndroid.timerNotif(js)}catch(e){}}
function timerActsApply(){if(!ANDROID||!window.ThabatAndroid.takeTimerActs)return;let L_=[];try{L_=JSON.parse(window.ThabatAndroid.takeTimerActs()||'[]')}catch(e){}if(!L_.length)return;const T=S.timer;
  L_.forEach(([a,ts])=>{if(a==='stop'){if(T.mode==='work'&&T.start)addSession(T.cat,T.start,ts);T.mode='idle';T.start=null;T.brkStart=null;T.task=null;if(T.deep)T.deep=null}
    else if(String(a).startsWith('brk')){const m=+String(a).slice(3)||5;if(T.mode==='work'&&T.start)addSession(T.cat,T.start,ts);T.mode='brk';T.start=null;T.brkStart=ts;T.brkDur=m;T.brkAlerted=false;T.brkTip=Math.floor(Math.random()*12)}
    else if(a==='resume'&&(T.mode==='brk'||T.mode==='idle')){T.mode='work';T.start=ts;T.brkStart=null;T.pomoAlerted=false}});
  save();TN_LAST='';renderTimerBtns();renderTimer();renderGlass();renderLog()}
{hookFn('renderTimerBtns',()=>renderTimerBtns,f=>{renderTimerBtns=f},'post',function(){timerNotifPush()})}
{hookFn('renderCatChips',()=>renderCatChips,f=>{renderCatChips=f},'post',function(){timerNotifPush()})}
/* tasbih widget */
let TSW_LAST='';
function tsbWidgetPush(){if(!ANDROID||!window.ThabatAndroid.tsbWidget)return;const js=JSON.stringify({date:dKey(new Date()),list:TSB().map(x=>({id:x.id,text:x.text,goal:x.goal,count:tsbCount(x.id)}))});if(js===TSW_LAST)return;TSW_LAST=js;try{window.ThabatAndroid.tsbWidget(js)}catch(e){}}
function tsbTake(){if(!ANDROID||!window.ThabatAndroid.takeTsb)return;let L_=[];try{L_=JSON.parse(window.ThabatAndroid.takeTsb()||'[]')}catch(e){}if(!L_.length)return;
  L_.forEach(e=>{if(!TSB().some(x=>x.id===e.id))return;const k=e.d===dKey(new Date())?todayKey():e.d,d=day(k);d.tsb=d.tsb||{};d.tsb[e.id]=(d.tsb[e.id]||0)+(+e.n||0)});save();TSW_LAST='';tsbWidgetPush();renderTodayEv();if($('#tsModal').classList.contains('on'))renderTasbih()}
{hookFn('renderTasbih',()=>renderTasbih,f=>{renderTasbih=f},'post',function(){tsbWidgetPush()})}
/* wird notification */
function wnOn(){return!!S.settings.wirdNotif}
let WN_LAST='';
function wirdNotifPush(){if(!ANDROID||!window.ThabatAndroid.wirdNotif)return;const q=qDay(todayKey()),o={on:wnOn()&&!q.wird,done:q.read||0,target:S.quran.wird||1,title:'📖 '+t('wn.title'),unit:t('wn.pages'),addLbl:'+1 '+t('wn.page'),openLbl:t('wn.open'),chName:t('wn.title')};
  const js=JSON.stringify(o);if(js===WN_LAST)return;WN_LAST=js;try{window.ThabatAndroid.wirdNotif(js)}catch(e){}}
function wirdTake(){if(!ANDROID||!window.ThabatAndroid.takeWird)return;let n=0;try{n=+window.ThabatAndroid.takeWird()||0}catch(e){}if(n>0){qSetPage(S.quran.page+n);WN_LAST=''}}
{hookFn('widgetPush',()=>widgetPush,f=>{widgetPush=f},'post',function(){try{wirdTake();wirdNotifPush();tsbWidgetPush()}catch(e){}})}
{const _qsp=qSetPage;qSetPage=function(np){_qsp(np);try{if(ANDROID)wirdNotifPush()}catch(e){}}}
/* Do Not Disturb at prayer time */
function dndCfg(){return Object.assign({on:false,min:20},S.settings.prayer.dnd||{})}
{hookFn('prayDone',()=>prayDone,f=>{prayDone=f},'post',function(){try{if(ANDROID&&window.ThabatAndroid.dndEnd)window.ThabatAndroid.dndEnd()}catch(e){}})}
/* changes pushed or pressed outside the page */
window.thabatPoll=()=>{try{timerActsApply();tsbTake();wirdTake();wirdNotifPush()}catch(e){}};
{const _tr=window.thabatResume;window.thabatResume=()=>{try{window.thabatPoll()}catch(e){}_tr&&_tr();try{lockResume()}catch(e){}}}
setTimeout(()=>{window.thabatPoll();timerNotifPush();tsbWidgetPush()},1800);
/* app lock: fingerprint / face / screen lock on the phone, PIN on the computer */
function lockCfg(){return Object.assign({on:false,after:1},S.settings.lock||{})}
let LOCKED=false,AWAY_AT=0;
function lockShow(){if(!lockCfg().on||LOCKED)return;if(!ANDROID&&!S.notesPin)return;LOCKED=true;const ov=$('#lockOv');ov.classList.add('on');
  ov.innerHTML=`<div class="lkin"><div class="lkic">🔒</div><div class="lklogo">${t('app')}</div>${ANDROID?`<button class="btn pri" id="lkBio">🔓 ${t('lk.unlock')}</button>`:`<input class="in" id="lkPin" type="password" inputmode="numeric" placeholder="${esc(t('lk.pin'))}" autocomplete="off" maxlength="12"><button class="btn pri" id="lkGo">🔓 ${t('lk.unlock')}</button><button class="link lkf" id="lkForgot">${t('pin.forgot')}</button>`}<small id="lkMsg"></small></div>`;
  if(ANDROID){const ask=()=>{try{window.ThabatAndroid.bioAuth(t('lk.title'),t('lk.sub'))}catch(e){}};$('#lkBio').onclick=ask;setTimeout(ask,300)}
  else{const go=async()=>{const v=$('#lkPin').value.trim();if(v&&await pinHash(v)===S.notesPin){window._nUnlock=Date.now()+5*6e4;lockHide()}else{$('#lkMsg').textContent=t('pin.wrong');$('#lkPin').value=''}};$('#lkGo').onclick=go;$('#lkPin').onkeydown=e=>{if(e.key==='Enter')go()};setTimeout(()=>{const i=$('#lkPin');if(i)i.focus()},80);
    $('#lkForgot').onclick=()=>{if(!confirm(t('lk.resetQ')))return;delete S.notesPin;NOTES().forEach(n=>delete n.lock);S.settings.lock=Object.assign(lockCfg(),{on:false});save();lockHide();toast(t('pin.resetDone'))}}}
function lockHide(){LOCKED=false;$('#lockOv').classList.remove('on');$('#lockOv').innerHTML=''}
window.thabatBio=r=>{if(r==='ok'){lockHide();return}const m=$('#lkMsg');if(m)m.textContent=r==='unsupported'?t('lk.old'):/err:(10|13|5)$/.test(r)?'':t('lk.fail')};
function lockAway(){AWAY_AT=Date.now()}
function lockResume(){const C=lockCfg();if(C.on&&!LOCKED&&AWAY_AT&&Date.now()-AWAY_AT>=C.after*6e4)lockShow();AWAY_AT=0}
document.addEventListener('visibilitychange',()=>{if(document.hidden)lockAway();else lockResume()});
{const _fl=window.thabatFlush;window.thabatFlush=()=>{lockAway();return _fl&&_fl()}}
document.addEventListener('keydown',e=>{if(LOCKED&&!e.target.closest('#lockOv')){e.stopPropagation();e.preventDefault()}},true);
if(lockCfg().on)lockShow();
/* settings */
function renderV37Set(){const st=S.settings;
  toggle($('#tnT'),tnOn(),v=>{st.timerNotif=v;TN_LAST='';setTimeout(timerNotifPush,0)});toggle($('#wnT'),wnOn(),v=>{st.wirdNotif=v;WN_LAST='';setTimeout(wirdNotifPush,0)});
  const D=dndCfg(),dst=$('#dndSt'),gr=()=>{try{return window.ThabatAndroid.dndGranted()}catch(e){return false}};if(ANDROID&&dst)dst.textContent=D.on?(gr()?'✓ '+t('dnd.ok'):'⚠ '+t('dnd.need')):'';
  toggle($('#dndT'),D.on,v=>{st.prayer.dnd=Object.assign(dndCfg(),{on:v});andSchedLast='';setTimeout(androidSchedule,0);if(v&&ANDROID&&!gr()){toast(t('dnd.need'));try{window.ThabatAndroid.dndOpen()}catch(e){}}setTimeout(renderV37Set,0)});
  $('#dndMin').value=D.min;$('#dndMin').onchange=e=>{st.prayer.dnd=Object.assign(dndCfg(),{min:Math.max(5,Math.min(90,+e.target.value||20))});save();andSchedLast='';androidSchedule()};
  const L_=lockCfg(),sel=$('#lockAfter');sel.innerHTML=[[0,'lk.now'],[1,'lk.m1'],[5,'lk.m5'],[15,'lk.m15']].map(([v,k])=>`<option value="${v}" ${L_.after===v?'selected':''}>${t(k)}</option>`).join('');sel.onchange=()=>{st.lock=Object.assign(lockCfg(),{after:+sel.value});save()};
  $('#lockSub').textContent=t(ANDROID?'lk.subA':'lk.subP');const lt=$('#lockT');lt.classList.toggle('on',L_.on);
  lt.onclick=()=>{const on=lockCfg().on;if(on){st.lock=Object.assign(lockCfg(),{on:false});save();lt.classList.remove('on');return}
    if(ANDROID){let a='error';try{a=window.ThabatAndroid.bioAvail()}catch(e){}if(a!=='ok'){toast(t(a==='nolock'?'lk.noLock':'lk.old'));return}st.lock=Object.assign(lockCfg(),{on:true});save();lt.classList.add('on');toast(t('lk.on'))}
    else{const en=()=>{st.lock=Object.assign(lockCfg(),{on:true});save();lt.classList.add('on');toast(t('lk.on'))};if(S.notesPin)en();else pinAsk('set',en)}}}
{hookFn('renderSettings',()=>renderSettings,f=>{renderSettings=f},'post',function(){try{renderV37Set()}catch(e){console.error(e)}})}

