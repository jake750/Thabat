/* ============ glass ============ */
function glassSVG(x=''){const water=x?'color-mix(in oklch,var(--water),var(--gold) 55%)':'var(--water)';return`<svg viewBox="0 0 150 190"><defs><clipPath id="gc${x}"><path d="M14 8 L136 8 L122 178 Q121 184 115 184 L35 184 Q29 184 28 178 Z"/></clipPath></defs>
<g clip-path="url(#gc${x})"><g id="wg${x}" style="transition:transform 1s cubic-bezier(.4,1.4,.5,1)">
<path class="wave2" id="wv2${x}" fill="${water}" d="M0 6 Q18.75 0 37.5 6 T75 6 T112.5 6 T150 6 T187.5 6 T225 6 T262.5 6 T300 6 V260 H0Z"/>
<path class="wave" id="wv1${x}" fill="${water}" opacity=".85" d="M0 8 Q18.75 2 37.5 8 T75 8 T112.5 8 T150 8 T187.5 8 T225 8 T262.5 8 T300 8 V260 H0Z"/></g></g>
<path d="M14 8 L136 8 L122 178 Q121 184 115 184 L35 184 Q29 184 28 178 Z" fill="none" stroke="var(--muted)" stroke-opacity=".55" stroke-width="2.5" stroke-linejoin="round"/></svg>`}
const XH=4; /* hours per extra glass */
function setGlass(x,p){const wg=$('#wg'+x);if(!wg)return;const top=184-(176*p)-6;wg.style.transform=`translateY(${p<=0?200:top}px)`;
  $('#wv1'+x).setAttribute('opacity',(0.32+0.68*p).toFixed(3));$('#wv2'+x).setAttribute('opacity',(0.14+0.36*p).toFixed(3));wg.style.filter=`saturate(${(0.55+0.65*p).toFixed(2)}) brightness(${(1.12-0.14*p).toFixed(2)})`}
function goalMet(k){const {tot}=totals(k);return tot>=goalMs(k)}
function streakNow(){let d=keyToDate(todayKey()),n=0;if(!goalMet(dKey(d)))d=addDays(d,-1);for(let i=0;i<400;i++){if(!S.days[dKey(d)]||!goalMet(dKey(d)))break;n++;d=addDays(d,-1)}return n}
let dropT;
function placeDrops(from,to){const sc=$('#gscene').getBoundingClientRect(),a=from.getBoundingClientRect(),b=to.getBoundingClientRect();
  const sx=a.left-sc.left+a.width*0.1,sy=a.top-sc.top+a.height*0.05,tx=b.left-sc.left+b.width*0.55,ty=b.top-sc.top+b.height*0.22;
  const d=$('#drops');d.style.setProperty('--sx',sx+'px');d.style.setProperty('--sy',sy+'px');d.style.setProperty('--dx',(tx-sx)+'px');d.style.setProperty('--dy',(ty-sy)+'px')}
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

