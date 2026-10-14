/* ============ glass ============ */

const XH=4; /* hours per extra glass */

function goalMet(k){const {tot}=totals(k);return tot>=goalMs(k)}
function streakNow(){let d=keyToDate(todayKey()),n=0;if(!goalMet(dKey(d)))d=addDays(d,-1);for(let i=0;i<400;i++){if(!S.days[dKey(d)]||!goalMet(dKey(d)))break;n++;d=addDays(d,-1)}return n}
let dropT;

function renderGlass(){const k=todayKey(),{tot,by}=totals(k),g=goalMs(k),p=Math.min(1,tot/g),over=Math.max(0,tot-g),oh=over/36e5;
  renderWall(k,tot,g);renderSky(k,tot,g);
  $('#glPct').textContent=Math.floor(tot/g*100)+'%';
  $('#glSub').textContent=t('glass.of',fmtHM(tot),g/36e5)+(over>=6e4?' · +'+fmtHM(over):'');
  $('#goalLbl').textContent=p>=1?(over>=36e5?t('glass.over',fmtHM(over)):t('glass.full')):'';
  const st=streakNow();$('#glStreak').textContent=st>=2?t('glass.streak',st):'';
  $('#catBars').innerHTML=catRowsHTML(by,g);
  if(p>=1&&!S.notified['full-'+k]){S.notified['full-'+k]=1;save();alertUser(t('al.full'),t('al.fullB'),ICON_WALL)}
  milestones(k,oh,tot);
}

