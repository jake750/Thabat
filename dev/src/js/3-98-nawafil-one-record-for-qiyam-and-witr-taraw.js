/* ============ 3.98 nawafil: one record for qiyam and witr, tarawih, the prayer map, the Summary card, the week view and the day panel ============ */
/* tarawih (rak'at) joins the nawafil; its row shows in Ramadan or when it has a value */
NFL.splice(4,0,['tar','🌌','nfl.tar',2,'nfl.rk']);
function nflShow(x,k,W,P){if(x!=='tar')return true;const n=S.days[k||todayKey()]&&S.days[k||todayKey()].nfl;return isRamadan(keyToDate(k||todayKey()))||!!(n&&+n.tar)||!!(W&&(W.o.tar||P.o.tar))}
/* a day's nawafil rak'at: duha, qiyam, tarawih, two for each tahiyya and sunnat al-wudu, and the rawatib (witr is logged in times) */
function nflRk(k){const n=(S.days[k]&&S.days[k].nfl)||{};return(+n.duha||0)+(+n.qiyam||0)+(+n.tar||0)+2*((+n.tah||0)+(+n.wudu||0))+nflRw(k)}
/* the evening self-accounting keeps d.qiyam={rk,witr}; d.nfl is the record and d.qiyam mirrors it */
function nflMirror(k){const d=S.days[k];if(!d)return;const n=d.nfl||{},rk=+n.qiyam||0,w=+n.witr||0;if(rk||w)d.qiyam={rk,witr:!!w};else delete d.qiyam;
  if(n.tar!==undefined&&isRamadan(keyToDate(k))){d.ram=d.ram||{};if(+n.tar)d.ram.tar=1;else delete d.ram.tar}}
function nflFromQy(k){const d=S.days[k];if(!d)return;const q=d.qiyam,n=d.nfl||(d.nfl={});
  if(q&&q.rk)n.qiyam=+q.rk;else delete n.qiyam;if(q&&q.witr){if(!+n.witr)n.witr=1}else delete n.witr;if(!Object.keys(n).length)delete d.nfl}
/* once: join what was logged in either place */
(function(){try{if(S.settings.nflQy1)return;Object.keys(S.days).forEach(k=>{const d=S.days[k],q=d.qiyam,n=d.nfl;if(!q&&!(n&&(+n.qiyam||+n.witr)))return;
  const m=d.nfl||(d.nfl={});if(q){if(+q.rk>(+m.qiyam||0))m.qiyam=+q.rk;if(q.witr&&!+m.witr)m.witr=1}nflMirror(k)});S.settings.nflQy1=1;save()}catch(e){console.error(e)}})();
function nflChanged(k){nflMirror(k);save();try{if(k===todayKey())renderTodayEv()}catch(e){}try{if(ANDROID)androidSchedule()}catch(e){}}
/* duha: the reminder offers «I prayed it» (+2), and stays quiet once duha is logged */
function nflDuhaAsk(){const k=todayKey();toastAct(t('nfl.duhaQ'),t('nfl.did'),()=>{const d=nflDay(k);d.duha=(+d.duha||0)+2;nflChanged(k);toast(t('nfl.duhaOk'))},60000)}
/* native reminders (Android): today's duha / witr are dropped once logged */
{hookFn('extraSched',()=>extraSched,f=>{extraSched=f},'post',function(out){try{if(!Array.isArray(out))return;const n=(S.days[todayKey()]||{}).nfl||{},q=(S.days[todayKey()]||{}).qiyam||{};
  for(let i=out.length-1;i>=0;i--){const id=out[i]&&out[i].id;if((id===9200&&+n.duha)||(id===9210&&(+n.witr||q.witr)))out.splice(i,1)}}catch(e){}})}
/* a link to the year map from the sheet */
{hookFn('nflOpen',()=>nflOpen,f=>{nflOpen=f},'post',function(){try{const w=$('#infoBox .nflw');if(!w||w.querySelector('.nflmap'))return;w.insertAdjacentHTML('beforeend',`<button class="btn sm ghost nflmap">🕌 ${esc(t('nfl.map'))}</button>`);w.querySelector('.nflmap').onclick=e=>{e.stopPropagation();openPrayMap('nf')}}catch(e){}})}

/* 7th-4: a nawafil card in the Summary, after the prayers card (it replaces the rawatib and qiyam lines there) */
function nflCard(){const host=$('#bPray');if(!host)return;let c=$('#bNfl');if(!c){host.insertAdjacentHTML('afterend','<div class="card" id="bNfl" style="margin-bottom:18px"></div>');c=$('#bNfl')}
  const tk=todayKey(),prevA=bMode==='week'?addDays(bAnchor,-7):brPrevAnchor(bAnchor),A=periodKeys(bMode,bAnchor).filter(k=>k<=tk),B=periodKeys(bMode,prevA).filter(k=>k<=tk);
  const sum=(ks,x)=>ks.reduce((s,k)=>s+(x==='rw'?nflRw(k):+(((S.days[k]||{}).nfl||{})[x])||0),0),days=ks=>ks.filter(k=>nflRk(k)||+(((S.days[k]||{}).nfl||{}).witr)).length,rk=ks=>ks.reduce((s,k)=>s+nflRk(k),0);
  const rows=[['rw','📿','nfl.rw','nfl.rk']].concat(NFL.map(([k,ic,l,,u])=>[k,ic,l,u])).map(([x,ic,l,u])=>{const a=sum(A,x),b=sum(B,x);if(!a&&!b)return'';
    return`<div class="nfcr"><span>${ic} ${esc(t(l))}</span><b>${a}</b><small>${esc(t(u))}</small>${a!==b?`<i class="${a>b?'up':'dn'}">${a>b?'▲':'▼'}${Math.abs(a-b)}</i>`:'<i></i>'}</div>`}).join('');
  const ra=rk(A),rb=rk(B),dv=ra-rb;
  c.innerHTML=`<h3><span>🤲 ${esc(t('nfl.t'))}</span><small class="muted">${esc(t('nfc.sub'))}</small></h3>${rows?`<div class="nfcv"><b>${ra}</b><small>${esc(t('nfl.rk'))}</small>${dv?`<i class="${dv>0?'up':'dn'}">${dv>0?'▲':'▼'}${Math.abs(dv)}</i>`:''}<span class="muted">${esc(t('nfc.days',days(A)))}</span></div><div class="nfcl">${rows}</div>`:`<p class="muted">${esc(t('nfc.none'))}</p>`}
  <button class="btn sm ghost" data-nfco>🤲 ${esc(t('nfc.open'))}</button>`;
  c.querySelector('[data-nfco]').onclick=nflOpen}
{hookFn('renderBrief',()=>renderBrief,f=>{renderBrief=f},'post',function(){try{nflCard()}catch(e){console.error(e)}})}

/* 8th-4: the week view shows each day's nawafil rak'at */
{hookFn('cwkPaint',()=>cwkPaint,f=>{cwkPaint=f},'post',function(){try{$$('#cal .wkc[data-k]').forEach(c=>{if(c.querySelector('.wknf'))return;const k=c.dataset.k,v=nflRk(k),w=+(((S.days[k]||{}).nfl||{}).witr)||0;if(!v&&!w)return;
  const ps=c.querySelector('.wkps');const h=`<span class="wknf" title="${esc(t('nfl.t'))}">📿 ${v?esc(t('nfl.tot2',v)):''}${w?(v?' · ':'')+esc(t('nfl.witr')):''}</span>`;if(ps)ps.insertAdjacentHTML('afterend',h);else c.insertAdjacentHTML('beforeend',h)})}catch(e){}})}

/* 8th-5: the calendar day panel gets a nawafil section, for today and past days */
function dnfHTML(k){const n=(S.days[k]&&S.days[k].nfl)||{};
  return`<div class="sec dnfl" data-k="${k}"><b>🤲 ${esc(t('nfl.t'))} <small class="muted">${esc(t('nfl.tot2',nflRk(k)))}</small></b>
    <div class="dnfr"><span>📿 ${esc(t('nfl.rw'))}</span><div class="nflrwb">${Object.keys(RAWATIB).map(p=>{const v=snCount(k,p);return`<button class="btn sm ${v?'':'ghost'}" data-dnr="${p}">${esc(t('pr.'+p))} ${v}</button>`}).join('')}</div></div>
    ${NFL.filter(r=>nflShow(r[0],k)).map(([x,ic,l,st,u])=>`<div class="dnfr"><span>${ic} ${esc(t(l))}</span><span class="dnfc"><button class="btn sm ghost" data-dnf="${x}" data-d="-${st}" aria-label="−">−</button><b>${+n[x]||0}</b><button class="btn sm ghost" data-dnf="${x}" data-d="${st}" aria-label="+">+</button><small>${esc(t(u))}</small></span></div>`).join('')}</div>`}
function dnfPaint(k){const det=$('#detail');if(!det||k>todayKey())return;const old=det.querySelector('.dnfl');const html=dnfHTML(k);
  if(old)old.outerHTML=html;else{const q=det.querySelector('.dq43');if(q)q.insertAdjacentHTML('afterend',html);else det.insertAdjacentHTML('beforeend',html)}
  const s=det.querySelector('.dnfl');uicPass(s);s.onclick=e=>{const r=e.target.closest('[data-dnr]'),b=e.target.closest('[data-dnf]');if(!r&&!b)return;e.stopPropagation();
    if(r){const p=r.dataset.dnr,mx=RAWATIB[p],v=snCount(k,p);snSet(k,p,v>=mx?0:mx<=2?mx:v+2);if(k===todayKey())try{renderPrayers()}catch(x){}}
    else{const d=nflDay(k),x=b.dataset.dnf;d[x]=Math.max(0,(+d[x]||0)+(+b.dataset.d));if(!d[x])delete d[x];if(!Object.keys(d).length)delete day(k).nfl}
    nflChanged(k);dnfPaint(k)}}
{hookFn('renderDetail',()=>renderDetail,f=>{renderDetail=f},'post',function(k){try{dnfPaint(k)}catch(e){console.error(e)}})}

