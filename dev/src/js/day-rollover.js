/* ============ day rollover ============ */
function rollover(){const k=todayKey();if(S.lastDay&&S.lastDay!==k&&S.settings.carry){const prev=S.days[S.lastDay];if(prev){const undone=prev.tasks.filter(x=>!x.done&&!x.auto&&!x.recurId);if(undone.length){const d=day(k);undone.forEach(x=>{if(!d.tasks.some(q=>q.carriedFrom===x.id))d.tasks.push({id:uid(),text:x.text,done:false,created:Date.now(),carriedFrom:x.id,carryN:(x.carryN||0)+1,...(x.subs?{subs:x.subs.map(q=>Object.assign({},q))}:{})})});toast(t('toast.carried',undone.length))}}}
  if(S.lastDay!==k){S.lastDay=k;day(k);
    const cut=Date.now()-3*DAYMS;for(const n in S.notified){const m=n.match(/^(\d{4}-\d\d-\d\d)/);if(m&&keyToDate(m[1]).getTime()<cut)delete S.notified[n]}
    for(const a in S.adhkar){if(keyToDate(a).getTime()<Date.now()-7*DAYMS)delete S.adhkar[a]}
    save();folderBackup(true)}}
var ensureKahf;
function renderToday(){curKey=todayKey();ensureKahf();setTimeout(()=>renderDayNotes($('#todayNotes'),todayKey()),0);renderHeader();renderPrayers();renderAdhBtn();renderCatChips();renderBrkChips();renderTimerBtns();renderTimer();renderGlass();renderLog();renderTasks();renderMedia();renderQCard();$('#summary').value=day(curKey).summary||''}

