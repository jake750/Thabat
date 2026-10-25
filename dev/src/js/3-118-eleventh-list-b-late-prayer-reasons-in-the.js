/* ============ 3.118 eleventh list B: late-prayer reasons in the Summary, the last places in the mushaf, memorised share per surah, time per page, hifz-plan days off, khatma history, the khatma in thirty juz' ============ */
/* 11th-17: a Summary card «أسباب التأخير» (day.lateWhy = {prayer: reason}) for the shown period */
function lwCard(){const host=$('#bNfl')||$('#bPray');if(!host)return;let c=$('#bLate');const tk=todayKey(),A=periodKeys(bMode,bAnchor).filter(k=>k<=tk),cnt={},per={};let n=0;
  A.forEach(k=>{const w=(S.days[k]||{}).lateWhy;if(!w)return;Object.entries(w).forEach(([p,r])=>{if(!r)return;n++;cnt[r]=(cnt[r]||0)+1;(per[r]=per[r]||{})[p]=(per[r][p]||0)+1})});
  if(!n){if(c)c.remove();return}if(!c){host.insertAdjacentHTML('afterend','<div class="card" id="bLate" style="margin-bottom:18px"></div>');c=$('#bLate')}
  const max=Math.max(...Object.values(cnt));c.innerHTML=`<h3>${esc(t('lwc.t'))} <small class="muted">${esc(t('lwc.n',n))}</small></h3><div class="lwc">${Object.entries(cnt).sort((a,b)=>b[1]-a[1]).map(([r,v])=>`<div class="lwcr"><span>${esc(t('lw.'+r))}</span><i><b style="width:${v/max*100}%"></b></i><small>${v}</small><em>${Object.entries(per[r]).sort((a,b)=>b[1]-a[1]).map(([p,m])=>esc(t('pr.'+p))+' '+m).join(' · ')}</em></div>`).join('')}</div>`}
{hookFn('renderBrief',()=>renderBrief,f=>{renderBrief=f},'post',function(){try{lwCard()}catch(e){console.error(e)}})}

/* 11th-22: the last ten places opened in the mushaf (S.quran.qhist=[{p,r,at}]) */
{const _s=qShowSilent;qShowSilent=function(p,...a){try{const Q=S.quran,old=Q.pv||Q.view;if(old&&old!==p){const H=Q.qhist=(Q.qhist||[]).filter(x=>!(x.p===old&&x.r===Q.riwaya));H.unshift({p:old,r:Q.riwaya,at:Date.now()});H.length=Math.min(H.length,10)}}catch(e){}return _s(p,...a)}}
function qhOpen(btn){const H=(S.quran.qhist||[]);if(!H.length){toast(t('qh.none'));return}
  const html=H.map((x,i)=>{let s='';try{const si=QS.findIndex((q,j)=>x.p>=q[2]&&x.p<=q[3]);s=si>=0?(LANG==='ar'?QS[si][0]:QS[si][1]):''}catch(e){}return`<button data-qh="${i}">${esc(t('q.pageS'))} ${x.p}${s?' · '+esc(s):''}${x.r!==S.quran.riwaya?` <small>${esc((RIWAYAT[x.r]||{}).name||x.r)}</small>`:''}</button>`}).join('');
  const r=(btn||$('#qbTop')).getBoundingClientRect(),p=qPopAt(html,r.left+r.width/2,r.bottom-6,'aymenu qhpop');
  p.querySelectorAll('[data-qh]').forEach(b=>b.onclick=()=>{closePP();const x=H[+b.dataset.qh];if(!x)return;try{if(x.r&&x.r!==S.quran.riwaya&&RIWAYAT[x.r])qSetRiwaya(x.r)}catch(e){}setTimeout(()=>qShow(x.p),x.r!==S.quran.riwaya?400:0)})}

/* 11th-23: the memorised share of each surah (by its pages) */
function qsmOpen(){const M=new Set(S.quran.memorized||[]);
  const rows=QS.map((q,i)=>{const a=q[2],b=Math.max(q[2],q[3]);let n=0;for(let p=a;p<=b;p++)if(M.has(p))n++;return{i,name:LANG==='ar'?q[0]:q[1],a,pct:Math.round(n/(b-a+1)*100)}});
  const full=rows.filter(r=>r.pct===100).length,some=rows.filter(r=>r.pct>0&&r.pct<100).length;
  openInfo(t('qsm.t'),`<p class="muted">${esc(t('qsm.sum',full,some))}</p><div class="qsm">${rows.map(r=>`<button class="qsmr ${r.pct===100?'full':r.pct?'part':''}" data-qsp="${r.a}"><small>${r.i+1}</small><span dir="auto">${esc(r.name)}</span><i><b style="width:${r.pct}%"></b></i><em>${r.pct}%</em></button>`).join('')}</div>`);
  $$('#infoBox [data-qsp]').forEach(b=>b.onclick=()=>{$$('.modal.on').forEach(m=>m.classList.remove('on'));showView('quran');qShow(+b.dataset.qsp)})}

/* 11th-25: time per page — the mushaf's reading time (sessions src:'mushaf') against the pages read those days */
function qtpStats(days){const tk=todayKey(),out=[];for(let i=0;i<days;i++){const k=dKey(addDays(keyToDate(tk),-i)),d=S.days[k];if(!d)continue;const ms=(d.sessions||[]).filter(s=>s.src==='mushaf').reduce((a,s)=>a+(s.end-s.start),0),pg=((d.quran||{}).pgs||[]).length;if(ms>=6e4&&pg)out.push({k,ms,pg})}return out}
function qtpOpen(){const L_=qtpStats(60);if(!L_.length){toast(t('qtp.none'));return}const ms=L_.reduce((a,x)=>a+x.ms,0),pg=L_.reduce((a,x)=>a+x.pg,0),sp=ms/pg/1e3;
  openInfo(t('qtp.t'),`<div class="qtp"><div class="qtpt"><div><small>${esc(t('qtp.avg'))}</small><b>${qtpSec(sp)}</b></div><div><small>${esc(t('qtp.ppm'))}</small><b>${(pg/(ms/6e4)).toFixed(2)}</b></div><div><small>${esc(t('qtp.days'))}</small><b>${L_.length}</b></div></div>
    <div class="qtpl">${L_.slice(0,20).map(x=>`<div><span>${esc(gShort(keyToDate(x.k)))}</span><span>${esc(t('qtp.row',x.pg,fmtHM(x.ms)))}</span><b>${qtpSec(x.ms/x.pg/1e3)}</b></div>`).join('')}</div><p class="muted" style="font-size:12px">${esc(t('qtp.note'))}</p></div>`)}
function qtpSec(s){s=Math.round(s);const m=Math.floor(s/60),r=s%60;return m?t('qtp.ms',m,r):t('qtp.s',r)}

/* 11th-26: hifz-plan days off (S.quran.hplan.off={date:1}) push the finishing date */
{const _f=hplFinish;hplFinish=function(...a){try{const H=S.quran.hplan,off=H.off||{},days=H.days&&H.days.length?H.days:[0,1,2,3,4,5,6];let left=hplLeft(),d=keyToDate(todayKey()),g=0;if(!left)return todayKey();
  if((H.log||{})[todayKey()])d=addDays(d,1);while(left>0&&g++<4000){const k=dKey(d);if(days.includes(d.getDay())&&!off[k])left-=H.lines;if(left>0)d=addDays(d,1)}return dKey(d)}catch(e){return _f(...a)}}}
{hookFn('hplOpen',()=>hplOpen,f=>{hplOpen=f},'post',function(){try{const H=S.quran.hplan,w=$('#infoBox .hplw');if(!H||!w||$('#hplOff'))return;const off=H.off||{},tk=todayKey(),n=Object.keys(off).filter(k=>k>=tk).length;
  w.insertAdjacentHTML('beforeend',`<div class="hploff"><button class="btn sm ghost" id="hplOff">${esc(t('hpo.b'))}</button>${n?`<small class="muted">${esc(t('hpo.n',n))}</small><button class="btn sm ghost" id="hplOffX">${esc(t('hpo.clear'))}</button>`:''}</div>`);
  $('#hplOff').onclick=()=>{const v=+prompt(t('hpo.q'),'1');if(!(v>0))return;const o=H.off=H.off||{};for(let i=0;i<Math.min(60,v);i++)o[dKey(addDays(keyToDate(tk),i))]=1;Object.keys(o).forEach(k=>{if(k<tk)delete o[k]});save();hplOpen();try{renderToday()}catch(e){}};
  const x=$('#hplOffX');if(x)x.onclick=()=>{H.off={};save();hplOpen()}}catch(e){console.error(e)}})}
{hookFn('renderTodayEv',()=>renderTodayEv,f=>{renderTodayEv=f},'post',function(){try{const H=S.quran.hplan;if(H&&(H.off||{})[todayKey()])$$('#todayEv [data-hplc]').forEach(e=>e.remove())}catch(e){}})}

/* 11th-27: khatma history; 11th-28: the current khatma as thirty juz' tiles */
function khhOpen(){const L_=(S.quran.khatmas||[]).slice().reverse();
  openInfo(t('khh.t'),L_.length?`<div class="khh">${L_.map((x,i)=>{const n=Math.max(1,Math.round((keyToDate(x.end)-keyToDate(x.start||x.end))/864e5)+1);return`<div class="khhr"><b>${esc(t('q.khatmaN',L_.length-i))}</b><span>${esc(gShort(keyToDate(x.start||x.end)))} → ${esc(gShort(keyToDate(x.end)))}</span><small>${esc(t('khh.days',n))}${x.riwaya&&RIWAYAT[x.riwaya]?' · '+esc(RIWAYAT[x.riwaya].name||x.riwaya):''}</small></div>`}).join('')}</div>`:`<p class="muted">${esc(t('khh.none'))}</p>`)}
function khjPaint(){const b=$('#qygBtn');if(!b)return;const card=b.closest('.card')||b.parentElement;if(!card)return;
  if(!$('#khhBtn'))b.insertAdjacentHTML('afterend',`<button class="btn sm ghost" id="khhBtn">${esc(t('khh.t'))} (${(S.quran.khatmas||[]).length})</button>`),$('#khhBtn').onclick=khhOpen;
  const cov=qCovered(S.quran.page),st=qStart();let g=card.querySelector('.khj');if(!g){g=document.createElement('div');g.className='khj';b.closest('.row')?.before(g)}if(!g.parentElement)return;
  g.innerHTML=Array.from({length:30},(_,j)=>{const a=QJ[j],e=(QJ[j+1]||605)-1;let n=0;for(let p=a;p<=e;p++){if(((p-st+604)%604)+1<=cov)n++}const f=n/(e-a+1);return`<i class="${f>=1?'full':f>0?'part':''}" style="--f:${Math.round(f*100)}%" title="${esc(t('khj.tip',j+1,Math.round(f*100)))}">${j+1}</i>`}).join('')}

/* buttons: the «⋯» sheet (last places), the hifz-map title (by surah, time per page) */
function qb11Paint(){const m=$('#qbmBtn');if(m&&!$('#qhBtn')){m.insertAdjacentHTML('afterend',`<button class="btn sm ghost" id="qhBtn">🕘 ${esc(t('qh.t'))}</button>`);$('#qhBtn').onclick=e=>qhOpen(e.currentTarget)}
  const s=$('#qhsBtn');if(s&&!$('#qsmBtn')){s.insertAdjacentHTML('afterend',` <button class="btn sm ghost qmrb" id="qsmBtn">${esc(t('qsm.b'))}</button> <button class="btn sm ghost qmrb" id="qtpBtn">${esc(t('qtp.b'))}</button>`);$('#qsmBtn').onclick=qsmOpen;$('#qtpBtn').onclick=qtpOpen}
  khjPaint()}
{hookFn('renderQuran',()=>renderQuran,f=>{renderQuran=f},'post',function(){try{qb11Paint()}catch(e){console.error(e)}})}
{hookFn('qbLayout',()=>qbLayout,f=>{qbLayout=f},'post',function(){try{qb11Paint()}catch(e){}})}
{const _cc=cmdCommands;cmdCommands=function(...a){const L_=_cc(...a);try{L_.push({icon:'📖',label:t('qsm.t'),run:()=>{showView('quran');qsmOpen()},kw:'surah memorised حفظ السور'},{icon:'📖',label:t('khh.t'),run:()=>{showView('quran');khhOpen()},kw:'khatma history الختمات'},{icon:'⏱',label:t('qtp.t'),run:qtpOpen,kw:'time per page وقت الصفحة'})}catch(e){}return L_}}

