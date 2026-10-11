/* ============ prayer time pause ============ */
const ICON_MOSQUE='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c-3 2.2-5 4.1-5 6.5h10C17 7.1 15 5.2 12 3z"/><path d="M5 21V12.5h14V21M3 21h18M10 21v-3.5a2 2 0 0 1 4 0V21M20.5 21V8.5M20.5 8.5l-1 1.5h2z"/><path d="M12 1.5v1.5"/></svg>';
let ADH=null;
function adhanOn(){return S.settings.prayer.adhan!==false}
async function adhanPlay(k,force){if(!adhanOn()&&!force)return;if(ANDROID)return;try{$('#pDua').hidden=true;$('#pMute').hidden=false;$('#pMute').textContent='🔇 '+t('pray.mute');const c=adhanCfg();if(k&&adhPK(k)==='off')return;let src=(k?adhPK(k):c.mode)==='takbir'?'adhan_takbir.mp3':'adhan.mp3';if(k==='fajr'){const f=await fajrSrc();if(f)src=f}
  if(!ADH){ADH=new Audio();ADH.preload='auto'}if(ADH._s!==src){ADH.src=src;ADH._s=src}ADH.onended=adhanEnded;ADH.currentTime=0;ADH.volume=c.vol/100;const p=ADH.play();if(p)p.catch(()=>{})}catch(e){}}
function adhanStop(){const was=ADH&&!ADH.paused;try{if(ADH)ADH.pause()}catch(e){}if(ANDROID){try{window.ThabatAndroid.stopAdhan&&window.ThabatAndroid.stopAdhan()}catch(e){}}const b=$('#pMute');if(b)b.hidden=true;if(S.prayPop)showDua()}
function adhanEnded(){const b=$('#pMute');if(b)b.hidden=true;if(S.prayPop)showDua()}
document.addEventListener('pointerdown',()=>{if(ADH||ANDROID)return;try{ADH=new Audio('adhan.mp3');ADH.preload='auto';ADH.muted=true;ADH.play().then(()=>{ADH.pause();ADH.muted=false;ADH.currentTime=0}).catch(()=>{ADH.muted=false})}catch(e){}},{once:true});
function prayNow(k,tt){const T=S.timer,now=Date.now();let paused=false;
  if(T.mode==='work'){const end=Math.max(T.start,Math.min(now,tt));addSession(T.cat,T.start,end);T.mode='pray';T.start=null;T.prayStart=end;paused=true}
  S.prayPop={k,at:tt,dk:todayKey(),paused};save();renderTimerBtns();renderTimer();renderGlass();renderLog();showPrayPop();if(adhanOn()&&!ANDROID&&now-tt<5*6e4)adhanPlay(k);else{chime();showDua()}
  try{if('Notification'in window&&Notification.permission==='granted')new Notification(t('al.at',t('pr.'+k)),{body:t('pray.body'),requireInteraction:true,silent:true})}catch(e){}}
function showPrayPop(){const P=S.prayPop;if(!P)return;const m=$('#prayModal');
  $('#pIc').innerHTML=ICON_MOSQUE;$('#pSub').textContent=fmtT(P.at);$('#pT').textContent=t('al.at',t('pr.'+P.k));$('#pP').textContent=t('pray.body');
  $('#pDone').textContent='✓ '+t('pray.done');$('#pNote').textContent=[P.paused?t('pray.paused'):'',prayQuiet()?t('pray.quietNote'):''].filter(Boolean).join(' · ');m.classList.add('on');if(ANDROID||!(ADH&&!ADH.paused))showDua();
  clearInterval(showPrayPop._f);let f=0;showPrayPop._f=setInterval(()=>{if(!S.prayPop){clearInterval(showPrayPop._f);document.title=t('app');return}document.title=(f++%2)?t('app'):'🕌 '+t('pr.'+S.prayPop.k)},1200)}
function prayDone(){const P=S.prayPop,T=S.timer,now=Date.now();
  if(P){const d=day(P.dk||todayKey());(d.prayed=d.prayed||{})[P.k]=now}
  if(T.mode==='pray'){T.mode='work';T.start=now;T.prayStart=null}
  S.prayPop=null;save();$('#prayModal').classList.remove('on');document.title=t('app');adhanStop();quietFlush();
  renderTimerBtns();renderTimer();renderGlass();renderLog();toast(t('pray.accepted'))}
$('#pDone').onclick=prayDone;$('#pMute').onclick=()=>{adhanStop();toast(t('pray.muted'))};
if(S.prayPop)setTimeout(showPrayPop,300);
function checkPrayers(){const P=S.settings.prayer;if(!P.enabled&&!P.atTime&&P.pause===false)return;const now=Date.now(),pt=prayerTimes(new Date()),dk=dKey(new Date());
  for(const k of PRAYERS){const tt=pt[k];
    const k1=dk+k+'-pre';if(P.enabled&&now>=tt-P.remind*6e4&&now<tt&&!S.notified[k1]){S.notified[k1]=1;save();const m=Math.ceil((tt-now)/6e4);alertUser(t('al.pre',t('pr.'+k),minW(m)),t('al.preB',fmtT(tt)))}
    const k2=dk+k+'-at';if(P.pause!==false){if(now>=tt&&now<tt+30*6e4&&!S.notified[k2]&&!S.prayPop){S.notified[k2]=1;prayNow(k,tt)}}
    else if(P.atTime&&now>=tt&&now<tt+5*6e4&&!S.notified[k2]){S.notified[k2]=1;save();alertUser(t('al.at',t('pr.'+k)),t('al.atB'));adhanPlay(k);const b=$('#mOk'),old=b.onclick;b.onclick=()=>{adhanStop();b.onclick=old;$('#modal').classList.remove('on')}}}}

