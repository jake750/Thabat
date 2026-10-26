/* ============ 3.131 twelfth list B (worship + Quran): «I'll fast» the day before Arafah/Ashura, the adhkar year map, the Ramadan chip counts what is left,
   congregation this month vs last, the khatma in N days, the hizb bar (hizb/athman division), hizbs read this month, a gentle note after three days away, the khatma by surahs ============ */
/* 12th-12: the day before Arafah, Tasu'a or Ashura: a chip «tomorrow is …» with «I'll fast» → day(tomorrow).niyya; on the day the fast is logged by itself (one undo) */
function fsnTomorrow(){const tm=addDays(keyToDate(todayKey()),1),v=virtDay(tm);return v&&v.fast?{k:v.k,dk:dKey(tm)}:null}
function fsnChip(){const T=fsnTomorrow();if(!T)return'';const pt=prayerTimes(keyToDate(todayKey()));if(Date.now()<pt.dhuhr)return'';const on=!!(S.days[T.dk]&&S.days[T.dk].niyya);
  return`<span class="evchip big fsn" data-fsn style="--c:#14b8a6">🌙 ${esc(t('fsn.tom',t('fast.'+T.k)))}${on?`<b class="fsnok">✓ ${esc(t('fsn.on'))}</b>`:`<button class="btn sm" data-fsnb>${esc(t('fsn.b'))}</button>`}</span>`}
{hookFn('renderTodayEv',()=>renderTodayEv,f=>{renderTodayEv=f},'post',function(){try{const box=$('#todayEv');if(!box||box.querySelector('[data-fsn]'))return;const h=fsnChip();if(!h)return;box.insertAdjacentHTML('afterbegin',h);
  const b=box.querySelector('[data-fsnb]');if(b)b.onclick=e=>{e.stopPropagation();const T=fsnTomorrow();if(!T)return;day(T.dk).niyya=1;save();renderTodayEv();toast(t('fsn.saved'))}}catch(e){console.error(e)}})}
function fsnLog(){const k=todayKey(),d=S.days[k];if(!d||!d.niyya||d.fast||d.niyyaDone)return;d.fast=1;d.niyyaDone=1;save();setTimeout(()=>{try{toastAct(t('fsn.logged'),t('undo'),()=>{d.fast=0;save();try{renderToday()}catch(e){}})}catch(e){}},1200)}
{hookFn('renderToday',()=>renderToday,f=>{renderToday=f},'pre',function(){try{fsnLog()}catch(e){}})}

/* 12th-16: morning and evening adhkar over a whole year (S.adhkar[date].m / .e) */
function adyLv(dk){const A=S.adhkar&&S.adhkar[dk];if(!A)return 0;let full=0,part=0;['m','e'].forEach(k=>{const st=A[k]||{},it=adhItems(k);if(!it.length)return;const n=it.filter(a=>(st[a.key]||0)>=a.n).length;if(n>=it.length)full++;else if(Object.keys(st).length)part++});
  return full===2?4:full===1?(part?3:2):part?1:0}
function adyOpen(end){const today=logicalDate(Date.now());end=end||today;if(end>today)end=today;
  const start=addDays(end,-364-end.getDay()),cells=[],months=[];let both=0,one=0,run=0,best=0,lastM=-1;
  for(let d=new Date(start),i=0;d<=end;d=addDays(d,1),i++){const k=dKey(d),lv=adyLv(k);if(lv===4){both++;run++;if(run>best)best=run}else run=0;if(lv===2||lv===3)one++;
    if(d.getDate()<=7&&d.getDay()===0&&d.getMonth()!==lastM){lastM=d.getMonth();months.push([Math.floor(i/7),L().months[d.getMonth()]])}
    cells.push(`<i class="l${lv}" data-k="${k}" title="${esc(gStr(d)+' · '+t('ady.l'+lv))}"></i>`)}
  const cols=Math.ceil(cells.length/7),canNext=dKey(end)!==dKey(today);
  openInfo('📿 '+esc(t('ady.t')),`<div class="qygnav"><button class="btn sm ghost" data-ad="prev">‹</button><b>${gShort(start)} ${start.getFullYear()} – ${gShort(end)} ${end.getFullYear()}</b><button class="btn sm ghost" data-ad="next"${canNext?'':' disabled'}>›</button></div>
    <div class="qygst ady3"><span><b>${both}</b>${esc(t('ady.both'))}</span><span><b>${one}</b>${esc(t('ady.one'))}</span><span><b>${best}</b>${esc(t('ady.best'))}</span></div>
    <div class="qygsc"><div class="qygm" style="--c:${cols}">${months.map(([c,n])=>`<span style="grid-column:${c+1}">${esc(n)}</span>`).join('')}</div><div class="qygg" style="--c:${cols}">${cells.join('')}</div></div>
    <div class="qyglg"><span>${esc(t('qyg.less'))}</span><i class="l0"></i><i class="l1"></i><i class="l2"></i><i class="l3"></i><i class="l4"></i><span>${esc(t('qyg.more'))}</span><small>${esc(t('ady.lvl'))}</small></div>`);
  const box=$('#infoBox');box.classList.add('qygbox');const sc=box.querySelector('.qygsc');if(sc)sc.scrollLeft=document.documentElement.dir==='rtl'?-sc.scrollWidth:sc.scrollWidth;
  box.querySelector('.qygnav').onclick=e=>{const b=e.target.closest('[data-ad]');if(!b||b.disabled)return;adyOpen(addDays(end,b.dataset.ad==='prev'?-365:365))};
  box.querySelector('.qygg').onclick=e=>{const c=e.target.closest('[data-k]');if(c)toast(c.title)}}
{hookFn('renderAdhkar',()=>renderAdhkar,f=>{renderAdhkar=f},'post',function(){try{const fb=$('#adhFocusBtn');if(!fb||$('#adyBtn'))return;fb.insertAdjacentHTML('beforebegin',`<button class="btn sm ghost" id="adyBtn" title="${esc(t('ady.t'))}">📅 ${esc(t('ady.b'))}</button>`);$('#adyBtn').onclick=()=>{$('#adhSheet').classList.remove('on');adyOpen()}}catch(e){}})}

/* 12th-19: in Ramadan the chip also says how many days are left and where the last ten are */
function rmLeft(){const td=keyToDate(todayKey());let n=0;for(let i=1;i<=31;i++){if(hNum(addDays(td,i)).m!==9)break;n++}return n}
{const _nc=nightChips;nightChips=function(...a){let r=_nc(...a);try{const h=hNum(keyToDate(todayKey()));if(h.m!==9)return r;const n=rmLeft(),x=h.d>=21?t('rm2.l10in',h.d-20):t('rm2.l10',21-h.d);
  r=r.replace(/<\/span>/,` · ${esc(n?t('rm2.left',n):t('rm2.last'))} · ${esc(x)}</span>`)}catch(e){}return r}}

/* 12th-20: congregation prayers this month vs the month before (Summary prayers card) */
function jmMonth(ym){let n=0;const tk=todayKey();Object.keys(S.days).forEach(dk=>{if(dk.slice(0,7)!==ym||dk>tk)return;PRAYERS.forEach(p=>{if(jmHas(dk,p))n++})});return n}
{hookFn('renderBriefPray',()=>renderBriefPray,f=>{renderBriefPray=f},'post',function(){try{const box=$('#bPray');if(!box||box.querySelector('.jmm'))return;const a=keyToDate(dKey(bAnchor||new Date())),ym=dKey(a).slice(0,7),pv=dKey(new Date(a.getFullYear(),a.getMonth()-1,1)).slice(0,7),n=jmMonth(ym),p=jmMonth(pv);if(!n&&!p)return;
  const df=n-p;box.insertAdjacentHTML('beforeend',`<p class="jmm">👥 ${esc(t('jmm.l',n,L().months[a.getMonth()]))} <small>${esc(t('jmm.prev',p))}${df?` <b class="${df>0?'up':'dn'}">${df>0?'▲':'▼'}${Math.abs(df)}</b>`:''}</small></p>`)}catch(e){console.error(e)}})}

/* 12th-22: the khatma in N days (sets the existing finish date, so the daily wird is worked out by qAutoWird) · 12th-28: hizbs read this month vs last · 12th-31: the khatma by surahs */
function qPgsOn(dk){const q=S.days[dk]&&S.days[dk].quran;return q?Math.max(+q.read||0,(q.pgs||[]).length):0}
function qhzMonth(ym){let n=0;Object.keys(S.days).forEach(dk=>{if(dk.slice(0,7)===ym)n+=qPgsOn(dk)});return Math.round(n/(604/60)*10)/10}
{hookFn('renderQSide',()=>renderQSide,f=>{renderQSide=f},'post',function(){try{const box=$('#qKhatma'),kt=box&&box.querySelector('.ktarget'),Q=S.quran;if(!kt||box.querySelector('.ktn'))return;
  kt.insertAdjacentHTML('afterend',`<div class="ktn"><span>${esc(t('ktn.l'))}</span>${[30,60,90].map(n=>`<button class="btn sm ghost" data-ktn="${n}">${esc(t('ktn.d',n))}</button>`).join('')}<button class="btn sm ghost" data-ktn="x">${esc(t('ktn.other'))}</button></div>`);
  box.querySelectorAll('[data-ktn]').forEach(b=>b.onclick=()=>{let n=b.dataset.ktn;if(n==='x'){n=parseInt(prompt(t('ktn.ask'),'40'),10);if(!(n>0&&n<=3650))return}Q.target=dKey(addDays(keyToDate(todayKey()),+n-1));Q.wirdCalc=null;save();renderQAll();toast(t('ktn.set',+n,Q.wird))});
  const now=new Date(),ym=dKey(now).slice(0,7),pv=dKey(new Date(now.getFullYear(),now.getMonth()-1,1)).slice(0,7),a=qhzMonth(ym),p=qhzMonth(pv);
  box.querySelector('.ktn').insertAdjacentHTML('afterend',`<div class="qhzm"><span>${esc(t('qhzm.l',fmtN1(a)))}</span><small>${esc(t('qhzm.prev',fmtN1(p)))}</small><button class="btn sm ghost" id="kmapBtn">${esc(t('kmap.b'))}</button></div>`);$('#kmapBtn').onclick=kmapOpen}catch(e){console.error(e)}})}
function fmtN1(x){return String(x).replace(/\.0$/,'')}
function kmapOpen(){const N=604,cov=qCovered(+S.quran.page||0),rd=p=>qCovered(p)<=cov&&cov>0;let done=0,part=0;
  const tiles=QS.map((s,i)=>{let n=0;const a=s[2],b=Math.max(a,s[3]);for(let p=a;p<=b;p++)if(rd(p))n++;const f=n/(b-a+1);if(f>=1)done++;else if(f>0)part++;
    return`<div class="kmt ${f>=1?'full':f>0?'part':''}" style="--f:${Math.round(f*100)}%" title="${esc((LANG==='ar'?s[0]:s[1])+' · '+Math.round(f*100)+'%')}"><b>${i+1}</b><span>${esc(LANG==='ar'?s[0]:s[1])}</span></div>`}).join('');
  openInfo('🗺 '+esc(t('kmap.t')),`<div class="kmw"><small class="muted">${esc(t('kmap.sub',qStartLabel()))}</small><div class="qygst ady3"><span><b>${done}</b>${esc(t('kmap.done'))}</span><span><b>${part}</b>${esc(t('kmap.part'))}</span><span><b>${114-done-part}</b>${esc(t('kmap.left'))}</span></div><div class="kmg">${tiles}</div></div>`);
  $('#infoBox').classList.add('qygbox')}

/* 12th-25: with the hizb/athman division (S.quran.div==='hizb') the reading bar follows the hizb and its eight athman */
{hookFn('qjBar',()=>qjBar,f=>{qjBar=f},'post',function(){try{const el=$('#qjBar');if(!el)return;const on=S.quran.div==='hizb'&&typeof qAthman==='function';el.classList.toggle('qhz',on);let tk=el.querySelector('.qhzt');
  if(!on){tk&&tk.remove();return}const p=+S.quran.page||1,h=qHizbAt(p),a=qHizbStart(h-1),b=(h<60?qHizbStart(h):605)-1,th=qThumnIdx(p)%8+1,pc=Math.max(0,Math.min(1,(p-a+1)/(b-a+1)));
  el.querySelector('i>b').style.width=(pc*100).toFixed(1)+'%';el.querySelector('span').textContent=t('qhz.l',h,th);el.title=t('qhz.t',h,th,Math.round(pc*100));
  if(!tk){tk=document.createElement('u');tk.className='qhzt';el.querySelector('i').append(tk)}tk.innerHTML=Array.from({length:7},(_,i)=>`<s style="inset-inline-start:${((i+1)/8*100).toFixed(2)}%"></s>`).join('')}catch(e){}})}

/* 12th-30: three days or more without the mushaf → a gentle chip on Today (✕ hides it for the day) */
function qAwayDays(){const td=keyToDate(todayKey());for(let i=0;i<=60;i++){const dk=dKey(addDays(td,-i));const q=S.days[dk]&&S.days[dk].quran;if(qPgsOn(dk)||(q&&(q.wird||q.hifz||q.rev)))return i}return 61}
{hookFn('renderTodayEv',()=>renderTodayEv,f=>{renderTodayEv=f},'post',function(){try{const box=$('#todayEv');if(!box||box.querySelector('[data-qaw]'))return;if(localStorage['thabat.qaw']===todayKey())return;
  const n=qAwayDays();if(n<3||n>60)return;box.insertAdjacentHTML('beforeend',`<span class="evchip qaw" data-qaw style="--c:#10b981"><i></i>📖 ${esc(t('qaw.l',n))}<button class="qawx" aria-label="${esc(t('qaw.x'))}">✕</button></span>`);
  const c=box.querySelector('[data-qaw]');c.onclick=e=>{if(e.target.closest('.qawx')){e.stopPropagation();try{localStorage['thabat.qaw']=todayKey()}catch(x){}c.remove();return}showView('quran')}}catch(e){}})}

{const _cc=cmdCommands;cmdCommands=function(){const c=(icon,label,run,kw)=>({icon,label,run,kw:kw||''});return _cc().concat([c('📿',t('ady.t'),()=>adyOpen(),'adhkar map year خريطة الأذكار'),c('🗺',t('kmap.t'),kmapOpen,'khatma surahs map خريطة الختمة السور')])}}
