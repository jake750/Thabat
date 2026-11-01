/* ============ v3.157.0 thirteenth list C2: Quran — surah/juz/hizb index, recent searches, coloured bookmarks, half of the wird, khatma by hizbs, behind-plan chip, monthly chart, time per memorised page, night brightness ============ */
/* 69/70 qc2IxOpen: tabs surahs (khatma read % + memorised %), juz', hizbs (start page and surah). 71 S.quran.qsH recent searches as chips under #qSrch.
   72 bookmarks carry c = r|g|b (a dot cycles it), filter chips in qbmOpen. 76 the page at the middle of today's wird gets .qc2half in its footer.
   77 S.quran.khHz: the khatma schedule (qc1KhOpen) shows hizbs instead of pages. 78 a Today chip when the khatma is > 20 pages behind its plan.
   80 qc2MoOpen: recitation / new hifz / review pages per month (6 months). 81/82 S.quran.rpTm={page:sec} while memorisation mode shows a page;
   the average for pages memorised this month. 84 S.quran.nBr: brightness of scanned pages at night (slider in the Quran «⋯» sheet). */
const QC2={tab:'s',bmf:''};
{hookFn('openInfo',()=>openInfo,f=>{openInfo=f},'pre',function(){try{const b=$('#infoBox');if(b)b.classList.remove('qc2box')}catch(e){}})}
function qc2HzStart(h){try{const A=qAthman();if(A&&A[h*8])return A[h*8][0]}catch(e){}return QR[h*4]||1}
function qc2HzAt(p){let h=1;for(let i=0;i<60;i++){if(qc2HzStart(i)<=p)h=i+1;else break}return h}
function qc2Bar(pc,cls){return`<i class="qc2b ${cls||''}"><b style="width:${Math.max(0,Math.min(100,pc)).toFixed(1)}%"></b></i>`}

/* ---- 69/70 the index ---- */
function qc2IxOpen(tab){if(tab)QC2.tab=tab;const Q=S.quran,M=new Set(Q.memorized||[]),cov=Q.page?qCovered(Q.page):0,cur=Q.page||0;let body='';
  if(QC2.tab==='s'){body=QS.map((s,i)=>{const a=s[2],b=Math.max(a,s[3]),n=b-a+1;let rd=0,mm=0;for(let p=a;p<=b;p++){if(cov&&qCovered(p)<=cov)rd++;if(M.has(p))mm++}
      const r=Math.round(rd/n*100),m=Math.round(mm/n*100);
      return`<button class="qc2r${cur>=a&&cur<=b?' cur':''}" data-qc2go="${a}"><span class="qc2n">${i+1}</span><span class="qc2t"><b>${esc(LANG==='ar'?s[0]:s[1])}</b><small>${esc(t('q.pageS'))} ${a}</small></span><span class="qc2v">${qc2Bar(r)}<em>${r}%</em></span><span class="qc2v">${qc2Bar(m,'mm')}<em>${m}%</em></span></button>`}).join('');
    body=`<div class="qc2hd"><span></span><span></span><span>${esc(t('qc2.rd'))}</span><span>${esc(t('qc2.mm'))}</span></div>`+body}
  else{const N=QC2.tab==='j'?30:60,st=i=>QC2.tab==='j'?QJ[i]:qc2HzStart(i);
    body=Array.from({length:N},(_,i)=>{const a=st(i),b=(i<N-1?st(i+1):605)-1,s=qSurahAt(a);let mm=0;for(let p=a;p<=b;p++)if(M.has(p))mm++;const m=Math.round(mm/Math.max(1,b-a+1)*100);
      return`<button class="qc2r${cur>=a&&cur<=b?' cur':''}" data-qc2go="${a}"><span class="qc2n">${i+1}</span><span class="qc2t"><b>${esc(s.name)}</b><small>${esc(t('q.pageS'))} ${a}</small></span><span class="qc2v">${qc2Bar(m,'mm')}<em>${m}%</em></span></button>`}).join('');
    body=`<div class="qc2hd j"><span></span><span></span><span>${esc(t('qc2.mm'))}</span></div>`+body}
  openInfo('🗂 '+esc(t('qc2.ixT')),`<div class="qc2tabs" role="tablist">${['s','j','h'].map(k=>`<button class="btn sm${QC2.tab===k?' on':''}" role="tab" aria-selected="${QC2.tab===k}" data-qc2t="${k}">${esc(t('qc2.tab.'+k))}</button>`).join('')}</div><div class="qc2l ${QC2.tab==='s'?'s':'j'}">${body}</div>`);
  const box=$('#infoBox');box.classList.add('qc2box');
  box.querySelector('.qc2tabs').onclick=e=>{const b=e.target.closest('[data-qc2t]');if(b)qc2IxOpen(b.dataset.qc2t)};
  box.querySelector('.qc2l').onclick=e=>{const b=e.target.closest('[data-qc2go]');if(!b)return;closeInfo2();if(curView()!=='quran')showView('quran');qShow(+b.dataset.qc2go)};
  const c=box.querySelector('.qc2r.cur');if(c)setTimeout(()=>c.scrollIntoView({block:'center'}),60)}
function qc2IxBtn(){const k=$('#qixBtn');if(!k||$('#qc2IxB'))return;k.insertAdjacentHTML('beforebegin',`<button class="btn sm ghost" id="qc2IxB">📑 ${esc(t('qc2.ixB'))}</button>`);$('#qc2IxB').onclick=()=>qc2IxOpen()}

/* ---- 71 recent searches ---- */
function qc2SH(){const Q=S.quran;if(!Array.isArray(Q.qsH))Q.qsH=[];return Q.qsH}
function qc2SHAdd(v){v=(v||'').trim();if(v.length<2)return;let L_=qc2SH().filter(x=>x!==v&&!v.startsWith(x));L_.unshift(v);S.quran.qsH=L_.slice(0,8);save()}
function qc2SHPaint(){const inp=$('#qSrch');if(!inp)return;let row=$('#qc2SH');const L_=qc2SH();
  if(!row){row=document.createElement('div');row.id='qc2SH';row.className='qc2sh';inp.after(row);row.onclick=e=>{const b=e.target.closest('[data-qc2s]');if(!b)return;if(b.dataset.qc2s==='x'){S.quran.qsH=[];save();qc2SHPaint();return}const i=$('#qSrch');i.value=b.dataset.qc2s;i.dispatchEvent(new Event('input',{bubbles:true}));i.focus()}}
  row.hidden=!L_.length||!!inp.value.trim();row.innerHTML=L_.length?`<small>${esc(t('qc2.recent'))}</small>`+L_.map(v=>`<button class="btn sm ghost" data-qc2s="${esc(v)}" dir="auto">${esc(v)}</button>`).join('')+`<button class="btn sm ghost" data-qc2s="x" aria-label="${esc(t('qc2.clr'))}" title="${esc(t('qc2.clr'))}">✕</button>`:''}
{const _so=qSearchOpen;qSearchOpen=async function(...a){const pr=_so(...a);try{const inp=$('#qSrch');if(inp&&!inp._qc2){inp._qc2=1;let tm;
  inp.addEventListener('input',()=>{clearTimeout(tm);qc2SHPaint();tm=setTimeout(()=>qc2SHAdd(inp.value),1500)});inp.addEventListener('keydown',e=>{if(e.key==='Enter')qc2SHAdd(inp.value)});qc2SHPaint()}}catch(e){}return pr}}

/* ---- 72 bookmark colours ---- */
const QC2_BC=['','r','g','b'];
{hookFn('qbmOpen',()=>qbmOpen,f=>{qbmOpen=f},'post',function(){try{const box=$('#infoBox'),l=box&&box.querySelector('.qbml');if(!l)return;const L_=qbmList();
  l.querySelectorAll('[data-qbm]').forEach(r=>{const b=L_.find(x=>x.id===r.dataset.qbm);if(!b)return;r.dataset.qc2c=b.c||'';r.insertAdjacentHTML('afterbegin',`<button class="qc2dot c-${b.c||'n'}" data-qc2c="1" aria-label="${esc(t('qc2.col'))}" title="${esc(t('qc2.col'))}"></button>`);if(QC2.bmf&&(b.c||'')!==QC2.bmf)r.hidden=true});
  if(L_.some(b=>b.c)||QC2.bmf){l.insertAdjacentHTML('beforebegin',`<div class="qc2bf">${['','r','g','b'].map(c=>`<button class="btn sm${QC2.bmf===c?' on':''}" data-qc2f="${c}">${c?`<i class="qc2dot c-${c}"></i>`:''}${esc(t('qc2.bf.'+(c||'all')))}</button>`).join('')}</div>`);box.querySelector('.qc2bf').onclick=e=>{const b=e.target.closest('[data-qc2f]');if(!b)return;QC2.bmf=b.dataset.qc2f;qbmOpen()}}
  l.addEventListener('click',e=>{const d=e.target.closest('[data-qc2c]');if(!d||d.tagName!=='BUTTON')return;e.stopPropagation();const r=d.closest('[data-qbm]'),b=qbmList().find(x=>x.id===r.dataset.qbm);if(!b)return;b.c=QC2_BC[(QC2_BC.indexOf(b.c||'')+1)%4];if(!b.c)delete b.c;save();qbmOpen()},true)}catch(e){console.error(e)}})}

/* ---- 76 half of today's wird ---- */
function qc2Half(){const Q=S.quran;if(!Q.page||Q.wirdU==='min')return 0;const w=+Q.wird||0;if(w<2)return 0;const q=qDay(todayKey()),cov=qCovered(Q.page),st=cov-(+q.read||0),mid=st+Math.ceil(w/2);if(mid<1||mid>604)return 0;return qc1Pg(mid)}
function qc2HalfPaint(){const hp=qc2Half();$$('#spread .qpage').forEach(pg=>{const b=pg.querySelector('[data-bm]'),f=pg.querySelector('.qf');if(!b||!f)return;let s=f.querySelector('.qc2half');const on=+b.dataset.bm===hp;
  if(!on){if(s)s.remove();return}if(!s){s=document.createElement('span');s.className='qc2half';s.textContent=t('qc2.half');s.title=t('qc2.halfT');f.append(s)}})}
{const mo=new MutationObserver(()=>{clearTimeout(QC2.ht);QC2.ht=setTimeout(()=>{try{qc2HalfPaint()}catch(e){}},160)});
 hookFn('renderQuran',()=>renderQuran,f=>{renderQuran=f},'post',function(){try{const m=$('#mushaf');if(m&&!m._qc2){m._qc2=1;mo.observe(m,{childList:true,subtree:true})}qc2HalfPaint();qc2IxBtn();qc2NbRow()}catch(e){}})}

/* ---- 77 the khatma schedule by hizbs: each day ends on a hizb boundary (only when the khatma starts at page 1 and the plan has ≤ 60 days) ---- */
function qc2KhHz(P){return !!S.quran.khHz&&qStart()===1&&P.days<=60}
{const _p=qc1KhPlan;qc1KhPlan=function(){const P=_p();if(!qc2KhHz(P))return P;let prev=0;
  P.rows.forEach((r,i)=>{const hb=Math.max(1,Math.min(60,Math.round(60*(i+1)/P.days))),to=hb>=60?604:Math.max(prev+1,qc2HzStart(hb)-1);r.ha=qc2HzAt(prev+1);r.hb=hb;r.from=prev+1;r.to=to;prev=to});return P}}
{hookFn('qc1KhOpen',()=>qc1KhOpen,f=>{qc1KhOpen=f},'post',function(){try{const box=$('#infoBox'),l=box&&box.querySelector('.qc1kl');if(!l)return;const hz=!!S.quran.khHz,P=qc1KhPlan();
  l.insertAdjacentHTML('beforebegin',`<div class="qc2tabs"><button class="btn sm${hz?'':' on'}" data-qc2k="0">${esc(t('qc2.byPg'))}</button><button class="btn sm${hz?' on':''}" data-qc2k="1">${esc(t('qc2.byHz'))}</button></div>`+(hz&&!qc2KhHz(P)?`<p class="qc1s">${esc(t(qStart()!==1?'qc2.hzStart':'qc2.hzLong'))}</p>`:''));
  box.querySelector('[data-qc2k]').parentElement.onclick=e=>{const b=e.target.closest('[data-qc2k]');if(!b)return;S.quran.khHz=b.dataset.qc2k==='1';save();qc1KhOpen()};
  if(!qc2KhHz(P))return;const sp=l.querySelectorAll('.qc1kp');P.rows.forEach((r,i)=>{const s=sp[i];if(!s)return;s.innerHTML=esc(t('qc2.hz'))+' <bdi>'+(r.ha===r.hb?r.hb:r.ha+'–'+r.hb)+'</bdi>';s.title=t('q.pageS')+' '+r.from+'–'+r.to})}catch(e){console.error(e)}})}

/* ---- 78 behind the plan ---- */
function qc2Behind(){const Q=S.quran;if(!Q.kStart||!Q.page)return 0;const P=qc1KhPlan(),td=P.rows.find(r=>r.today);if(!td)return 0;return td.to-qCovered(Q.page)}
{hookFn('renderTodayEv',()=>renderTodayEv,f=>{renderTodayEv=f},'post',function(){try{const box=$('#todayEv');if(!box||box.querySelector('[data-qc2b]'))return;const tk=todayKey();if(localStorage['thabat.qc2b']===tk)return;const n=qc2Behind();if(n<=20)return;
  box.insertAdjacentHTML('beforeend',`<div class="evchip qc2bh" data-qc2b="1"><span>📖 ${esc(t('qc2.behind',n))}</span><button class="btn sm ghost" data-qc2b="x" aria-label="${esc(t('qc2.hide'))}" title="${esc(t('qc2.hide'))}">✕</button></div>`);
  box.querySelector('.qc2bh').onclick=e=>{if(e.target.closest('[data-qc2b="x"]')){localStorage['thabat.qc2b']=tk;e.currentTarget.remove();return}showView('quran');qc1KhOpen()}}catch(e){}})}

/* ---- 80 the monthly chart ---- */
function qc2MoData(n){const m=qc1CalMap(),rv={},L_=S.quran.rvLast||{};for(const p in L_){const k=L_[p];rv[k]=(rv[k]||0)+1}
  const out=[],now=keyToDate(todayKey());for(let i=n-1;i>=0;i--){const d=new Date(now.getFullYear(),now.getMonth()-i,1),y=d.getFullYear(),mo=d.getMonth(),last=new Date(y,mo+1,0).getDate();let r=0,h=0,v=0;
    for(let x=1;x<=last;x++){const k=dKey(new Date(y,mo,x));r+=qygN(k);h+=(m[k]>=1?m[k]:0);const q=S.days[k]&&S.days[k].quran;v+=Math.max(rv[k]||0,q&&q.review&&Array.isArray(q.rv)?q.rv.length:0)}
    out.push({lb:L().months[mo],y,r,h:Math.round(h*10)/10,v})}return out}
function qc2MoOpen(){const D=qc2MoData(6),mx=Math.max(1,...D.map(x=>Math.max(x.r,x.h,x.v)));
  const cols=D.map(x=>`<div class="qc2mc"><div class="qc2mb">${[['r',x.r],['h',x.h],['v',x.v]].map(([k,v])=>`<i class="k-${k}" style="height:${(v/mx*100).toFixed(1)}%" title="${esc(t('qc2.s.'+k)+': '+v)}"><em>${v||''}</em></i>`).join('')}</div><span>${esc(x.lb)}</span></div>`).join('');
  const tot=k=>D.reduce((a,x)=>a+x[k],0);
  openInfo('📊 '+esc(t('qc2.moT')),`<div class="qc2lg">${['r','h','v'].map(k=>`<span><i class="k-${k}"></i>${esc(t('qc2.s.'+k))} · ${Math.round(tot(k)*10)/10}</span>`).join('')}</div><div class="qc2mch">${cols}</div><p class="qc1s">${esc(t('qc2.moSub'))}</p>`);
  $('#infoBox').classList.add('qc2box')}
function qc2MoBtn(){const g=$('#qc1KhB')||$('#qygBtn');if(!g||$('#qc2MoB'))return;g.insertAdjacentHTML('afterend',`<button class="btn sm ghost" id="qc2MoB">📊 ${esc(t('qc2.moB'))}</button>`);$('#qc2MoB').onclick=()=>qc2MoOpen()}
{hookFn('renderQSide',()=>renderQSide,f=>{renderQSide=f},'post',function(){try{qc2MoBtn()}catch(e){}})}

/* ---- 81/82 time per memorised page ---- */
function qc2Tm(){const Q=S.quran;if(!Q.rpTm||typeof Q.rpTm!=='object')Q.rpTm={};return Q.rpTm}
function qc2Avg(){const A=S.quran.memAt||{},mo=todayKey().slice(0,7),T=qc2Tm(),v=Object.keys(A).filter(p=>String(A[p]).slice(0,7)===mo&&T[p]>=60).map(p=>T[p]);return v.length?{n:v.length,m:Math.round(v.reduce((a,b)=>a+b,0)/v.length/60)}:null}
function qc2Min(s){return Math.max(0,Math.round((s||0)/60))}
setInterval(()=>{try{if(!qrpOn()||document.hidden||curView()!=='quran'||S.quran.rpU==='r')return;const p=qrpPage(),T=qc2Tm();T[p]=(T[p]||0)+5;QC2.tk=(QC2.tk||0)+1;if(QC2.tk%6===0){save();qc2TmPaint()}}catch(e){}},5000);
function qc2TmPaint(){const el=$('#qrpBox .qrpst');if(!el||S.quran.rpU==='r')return;let s=el.querySelector('.qc2tm');if(!s){s=document.createElement('div');s.className='qc2tm qrpl2';el.append(s)}
  const a=qc2Avg(),tx=t('qc2.tmP',qc2Min(qc2Tm()[qrpPage()]))+(a?' · '+t('qc2.tmAvg',a.m,a.n):'');if(s.textContent!==tx)s.textContent=tx}
{hookFn('qrpPaint',()=>qrpPaint,f=>{qrpPaint=f},'post',function(){try{qc2TmPaint()}catch(e){}})}

/* ---- 84 night brightness of scanned pages ---- */
function qc2NbApply(){const v=+S.quran.nBr||1;document.documentElement.style.setProperty('--qnb',String(v))}
function qc2NbRow(){const sh=$('#qbTools');if(!sh||$('#qc2Nb'))return;const box=sh.querySelector('.qbshb')||sh;const v=+S.quran.nBr||1;
  box.insertAdjacentHTML('beforeend',`<label class="qc2nb" id="qc2Nb"><span>${esc(t('qc2.nb'))}</span><input type="range" min="0.5" max="1.4" step="0.05" value="${v}" aria-label="${esc(t('qc2.nb'))}"><em>${Math.round(v*100)}%</em></label>`);
  const r=$('#qc2Nb input');r.oninput=()=>{S.quran.nBr=+r.value;qc2NbApply();$('#qc2Nb em').textContent=Math.round(r.value*100)+'%'};r.onchange=()=>save()}
qc2NbApply();
{hookFn('qbLayout',()=>qbLayout,f=>{qbLayout=f},'post',function(){try{qc2NbRow()}catch(e){}})}

/* Ctrl+K */
{const _cc=cmdCommands;cmdCommands=function(){const c=(icon,label,run,kw)=>({icon,label,run,kw:kw||''});return _cc().concat([
  c('📑',t('qc2.ixT'),()=>{showView('quran');qc2IxOpen()},'index surah juz hizb فهرس سورة جزء حزب'),
  c('📊',t('qc2.moT'),()=>{showView('quran');qc2MoOpen()},'monthly quran chart شهر تلاوة حفظ مراجعة')])}}
