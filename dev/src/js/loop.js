/* ============ loop ============ */
function renderAll(){renderToday();const v=curView();if(v==='quran')renderQuran();if(v==='cal')renderCal();if(v==='brief')renderBrief();if(v==='boards')renderBoardsView();if(v==='set')renderSettings();if($('#adhSheet').classList.contains('on'))renderAdhkar()}
applyTheme();applyI18n();rollover();renderToday();
let lastMin=-1;
setInterval(()=>{rollover();if(todayKey()!==curKey)renderToday();renderTimer();
  const mi=new Date().getMinutes();if(mi!==lastMin){lastMin=mi;renderPrayers();renderGlass();renderHeader();renderAdhBtn();widgetPush();if(S.timer.mode==='work'){if(curView()==='cal')renderCal();if(curView()==='brief')renderBrief()}}
  else if(S.timer.mode==='work'&&new Date().getSeconds()%10===0)renderGlass();
  checkPrayers();checkQuran();checkAdhRem()},1000);
setTimeout(()=>autoBackup(),8000);setInterval(()=>autoBackup(),6*36e5);maybeTour();takeOpen();
setInterval(()=>folderBackup(),5*6e4);
