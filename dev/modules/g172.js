/* ============ 3.145.0 g172: UX list C — prayers and Quran (21–23, 27–32, 36–39) ============ */
/* 21. a tap on a prayer chip logs it «on time» at once (with undo); a long press or right click opens the full menu.
   Only when nothing was logged by hand yet; a logged prayer opens the menu as before. */
function ux3Hand(dk,k){const d=S.days[dk];return !!(d&&((d.prayLog&&d.prayLog[k])||(d.prayed&&d.prayed[k])))}
function ux3Tap(c){const k=c.dataset.pk,dk=todayKey();if(ux3Hand(dk,k)){prxOpen(c);return}
  plSet(dk,k,'on');vib(12);renderPrayers();try{if(curView()==='brief')renderBrief()}catch(e){}
  toastAct(t('ux3.onT',t('pr.'+k)),t('undo'),()=>{plSet(dk,k,'');renderPrayers()},6000);
  try{if(!localStorage['thabat.ux3tip']){localStorage['thabat.ux3tip']=1;setTimeout(()=>toast(t('ux3.tip')),900)}}catch(e){}}
function ux3Bind(){$$('#prayers [data-pk]').forEach(c=>{c.title=t('ux3.title');c.onclick=e=>{if(c._ux3f){c._ux3f=0;return}ux3Tap(c)};if(c._ux3)return;c._ux3=1;let lp=null;
  c.addEventListener('contextmenu',e=>{e.preventDefault();prxOpen(c)});
  c.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse')return;c._ux3f=0;clearTimeout(lp);lp=setTimeout(()=>{c._ux3f=1;vib(18);prxOpen(c)},480)});
  ['pointerup','pointercancel','pointerleave'].forEach(ev=>c.addEventListener(ev,()=>clearTimeout(lp)));
  c.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse'&&(Math.abs(e.movementX)>4||Math.abs(e.movementY)>4))clearTimeout(lp)})})}
{hookFn('bindPrayChips',()=>bindPrayChips,f=>{bindPrayChips=f},'post',function(){try{ux3Bind()}catch(e){console.error(e)}})}

/* 22. once the five are logged on time, the prayer row folds into one line; a tap opens it again for the day */
const UX3={open:''};
function ux3Fold(){const ps=$('#prayers');if(!ps)return;const dk=todayKey(),all=ps.querySelectorAll('[data-pk]').length>=5&&PRAYERS.every(k=>plStatus(dk,k)==='on');
  const fold=all&&UX3.open!==dk;ps.classList.toggle('ux3fold',fold);let ln=$('#ux3Line');
  if(!fold){if(ln)ln.remove();return}
  if(!ln){ln=document.createElement('button');ln.id='ux3Line';ln.type='button';ln.className='ux3line';ln.onclick=()=>{UX3.open=todayKey();ux3Fold()}}
  if(ln.nextElementSibling!==ps)ps.before(ln);
  ln.innerHTML=`<i class="ux3ok">✓</i><b>${esc(t('ux3.five'))}</b><small>${esc(t('ux3.open'))}</small>`}
{hookFn('renderPrayers',()=>renderPrayers,f=>{renderPrayers=f},'post',function(){try{ux3Fold()}catch(e){console.error(e)}})}

/* 23. the adhkar chip carries a ring of the current period's progress */
function ux3AdhRing(){const b=$('#adhkarBtn');if(!b)return;const k=adhPeriodNow(),p=adhProgress(k),f=p.total?p.done/p.total:0,ic=b.querySelector('svg');if(!ic)return;
  let r=b.querySelector('.ux3ring');if(!r){r=document.createElement('span');r.className='ux3ring';ic.before(r);r.append(ic)}
  r.style.setProperty('--f',(f*100).toFixed(1)+'%');r.classList.toggle('full',f>=1);r.title=t('adh.prog',p.done,p.total)}
{hookFn('renderAdhBtn',()=>renderAdhBtn,f=>{renderAdhBtn=f},'post',function(){try{ux3AdhRing()}catch(e){}})}

/* 27. in Ramadan, a strip of its days under the Ramadan chip: logged days filled, today ringed */
/* 30. the bedtime chip after Isha says how long you would sleep if you slept now */
function ux3Dur(ms){const m=Math.max(0,Math.round(ms/6e4));return m>=60?t('dur.hm',Math.floor(m/60),m%60):minW(m)}
{hookFn('renderTodayEv',()=>renderTodayEv,f=>{renderTodayEv=f},'post',function(){try{
  const bd=$('#todayEv [data-bed]');if(bd&&!bd.querySelector('.ux3bed')){const f=prayerTimes(addDays(keyToDate(todayKey()),1)).fajr,ms=f-10*6e4-Date.now();
    if(ms>0)bd.insertAdjacentHTML('beforeend',` <small class="ux3bed">· ${esc(t('ux3.bed',ux3Dur(ms)))}</small>`)}
  const rc=$('#todayEv [data-ram3]'),old=$('#ux3Rm');if(old)old.remove();if(!rc)return;
  const h=hNum(keyToDate(todayKey()));if(h.m!==9)return;const ks=rmpDays(h.y),tk=todayKey();if(!ks.length)return;
  const cells=ks.map((k,i)=>{const r=(S.days[k]||{}).ram||{},n=['fast','tar','juz','sad','dua','iftar'].filter(x=>r[x]).length;
    return`<i class="${k===tk?'td ':''}${k>tk?'fut':n?'on':''}" style="--n:${n}" title="${i+1} · ${n}/6"></i>`}).join('');
  const done=ks.filter(k=>k<=tk&&Object.keys((S.days[k]||{}).ram||{}).length).length;
  rc.insertAdjacentHTML('afterend',`<button type="button" id="ux3Rm" class="ux3rm" aria-label="${esc(t('ux3.rm',done,ks.length))}"><span class="ux3rmg" style="--c:${ks.length}">${cells}</span><small>${esc(t('ux3.rm',done,ks.length))}</small></button>`);
  $('#ux3Rm').onclick=()=>{try{openRamadan()}catch(e){}}}catch(e){console.error(e)}})}

/* 28. the prayer map starts with this month's on-time count, big */
{hookFn('openPrayMap',()=>openPrayMap,f=>{openPrayMap=f},'post',function(tab){try{if(tab&&tab!=='on')return;const box=$('#infoBox .infob');if(!box)return;
  const tk=todayKey(),d0=keyToDate(tk.slice(0,8)+'01');let on=0,all=0;
  for(let dt=d0;dKey(dt)<=tk;dt=addDays(dt,1)){const k=dKey(dt);PRAYERS.forEach(p=>{const s=plStatus(k,p);if(!s||s==='q')return;all++;if(s==='on'||s==='auto')on++})}
  box.insertAdjacentHTML('afterbegin',`<div class="ux3pm"><b>${on}</b><span>${esc(t('ux3.pmOf',all))}</span><small>${esc(t('ux3.pmT',L().months[d0.getMonth()]))}</small></div>`)}catch(e){console.error(e)}})}

/* 31. near the end of a juz' the bar says how many pages are left to the next one */
{hookFn('qjBar',()=>qjBar,f=>{qjBar=f},'post',function(){try{const el=$('#qjBar');if(!el)return;const p=+S.quran.page||1,j=qJuzAt(p),b=(QJ[j]||605)-1,n=b-p+1;
  let s=el.querySelector('.ux3jn');const show=j<30&&n>=1&&n<=3;el.classList.toggle('ux3near',show);
  if(!show){if(s)s.remove();return}if(!s){s=document.createElement('em');s.className='ux3jn';el.append(s)}s.textContent=t(n===1?'ux3.jn1':'ux3.jn',n,j+1)}catch(e){}})}

/* 32. a quiet gold dot on the Quran nav button once today's wird is done */
function ux3Nav(){try{const on=qWirdDone((S.days[todayKey()]||{}).quran);$$('.navbtn[data-v="quran"]').forEach(b=>{let d=b.querySelector('.ux3dot');if(on&&!d){d=document.createElement('i');d.className='ux3dot';b.append(d)}else if(!on&&d)d.remove();if(d)d.title=t('ux3.wird')})}catch(e){}}
{hookFn('renderToday',()=>renderToday,f=>{renderToday=f},'post',ux3Nav)}
{hookFn('renderQuran',()=>renderQuran,f=>{renderQuran=f},'post',ux3Nav)}
{hookFn('save',()=>save,f=>{save=f},'post',function(){clearTimeout(UX3.nt);UX3.nt=setTimeout(ux3Nav,400)})}

/* 36. the khatma card names the next milestone: the end of this juz', a quarter, the half, three quarters or the khatma */
function ux3Mile(){const p=+S.quran.page||1,cov=qCovered(p),j=qJuzAt(p),b=(QJ[j]||605)-1,c=[];
  c.push({n:b-p+1,l:t('ux3.mJ',j)});[[151,'ux3.mQ'],[302,'ux3.mH'],[453,'ux3.m3'],[604,'ux3.mK']].forEach(([f,l])=>{if(cov<f)c.push({n:f-cov,l:t(l)})});
  c.sort((a,b)=>a.n-b.n);return c[0]}
{hookFn('khjPaint',()=>khjPaint,f=>{khjPaint=f},'post',function(){try{const g=document.querySelector('.khj');if(!g)return;const m=ux3Mile();let el=g.parentElement.querySelector('.ux3mile');
  if(!el){el=document.createElement('div');el.className='ux3mile';g.after(el)}
  el.innerHTML=`<span>${esc(t('ux3.next'))}</span> <b>${esc(m.l)}</b> · ${esc(t(m.n===1?'ux3.pg1':'ux3.pgs',m.n))}`}catch(e){}})}

/* 38. test mode: a double tap on a word marks it as a mistake; marked words stay underlined, in and out of test mode */
function ux3Mis(){const Q=S.quran;Q.qmis=Q.qmis||{};const r=Q.riwaya||'hafs';return Q.qmis[r]||(Q.qmis[r]=[])}
function ux3MisPaint(){let L_;try{L_=new Set((S.quran.qmis||{})[S.quran.riwaya||'hafs']||[])}catch(e){return}
  document.querySelectorAll('#spread .ml span[data-k]').forEach(sp=>{const on=L_.size&&L_.has(qwrId(sp));sp.classList.toggle('ux3mis',!!on)})}
{const D={id:'',at:0};
window.addEventListener('click',e=>{if(!S.quran.hide)return;const w=e.target.closest&&e.target.closest('#spread .ml span[data-k]');if(!w||e.target.closest('.aen'))return;
  const id=qwrId(w),now=Date.now();
  if(D.id===id&&now-D.at<380){e.stopImmediatePropagation();e.preventDefault();D.id='';
    const L_=ux3Mis(),i=L_.indexOf(id);if(i>=0)L_.splice(i,1);else{L_.push(id);QWR.add(id)}
    save();qApplyMarks();vib([10,40,10]);toast(t(i>=0?'ux3.misOff':'ux3.misOn'));return}
  D.id=id;D.at=now},true)}
{hookFn('qApplyMarks',()=>qApplyMarks,f=>{qApplyMarks=f},'post',function(){try{ux3MisPaint()}catch(e){}})}
{let pend=0;const m=$('#mushaf');if(m)new MutationObserver(()=>{if(pend)return;pend=1;setTimeout(()=>{pend=0;ux3MisPaint()},30)}).observe(m,{childList:true,subtree:true})}
{const _hs=qHideSet;qHideSet=function(on){const r=_hs(on);try{if(on&&!localStorage['thabat.ux3mis']){localStorage['thabat.ux3mis']=1;setTimeout(()=>toast(t('ux3.misTip')),600)}}catch(e){}return r}}

/* 39. the riwaya list shows your riwaya first, big */
{hookFn('rpkPaint',()=>rpkPaint,f=>{rpkPaint=f},'post',function(q){try{if(q||!RPK.el||!/^qRiw/.test((RPK.sel&&RPK.sel.id)||''))return;const box=RPK.el.querySelector('.rpkl'),cur=box&&box.querySelector('.rpki.on');if(!cur)return;
  const cl=cur.cloneNode(true);cl.classList.add('ux3mine');cl.removeAttribute('id');
  box.insertAdjacentHTML('afterbegin',`<div class="rpkg ux3mineh">${esc(t('ux3.mine'))}</div>`);box.children[0].after(cl);box.scrollTop=0}catch(e){}})}
try{renderPrayers();renderAdhBtn();ux3Nav()}catch(e){}
