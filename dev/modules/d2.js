/* ============ v3.3 mushaf: edge taps, pinch zoom, line marks on scans, sepia, sajdah, athman index, real-speed ETA, wird report, listening time, hifz position ============ */
/* 18. tap the page edge to turn (phone, single page) */
{const m=$('#mushaf');let tx=0,ty=0,tt=0,moved=false;
  m.addEventListener('touchstart',e=>{if(e.touches.length!==1)return;tx=e.touches[0].clientX;ty=e.touches[0].clientY;tt=Date.now();moved=false},{passive:true});
  m.addEventListener('touchmove',e=>{const t0=e.touches[0];if(Math.abs(t0.clientX-tx)>10||Math.abs(t0.clientY-ty)>10)moved=true},{passive:true});
  m.addEventListener('touchend',e=>{if(moved||Date.now()-tt>350||QZ.s>1.01)return;if(S.settings.qEdgeTap===false)return;const sp=$('#spread');if(!sp||!sp.classList.contains('one'))return;if(e.target.closest('button,a,.qbtn,.mp span[data-a],.qmark'))return;
    const r=sp.getBoundingClientRect(),x=e.changedTouches[0].clientX,y=e.changedTouches[0].clientY;if(y<r.top||y>r.bottom)return;const w=r.width*.18;
    if(x<r.left+w){e.preventDefault();qStep(1)}else if(x>r.right-w){e.preventDefault();qStep(-1)}},{passive:false})}
/* 19. pinch / double-tap zoom on the current page */
const QZ={s:1,x:0,y:0};
function qzEl(){return $('#spread .strack .sslide:nth-child(2) .qimg')||$('#spread .qimg')}
function qzApply(){const el=qzEl();if(!el)return;el.style.transformOrigin='0 0';el.style.transform=QZ.s>1.01?`translate(${QZ.x}px,${QZ.y}px) scale(${QZ.s})`:'';el.classList.toggle('qzoom',QZ.s>1.01);const tr=$('#spread .strack');if(tr)tr.style.touchAction=QZ.s>1.01?'none':''}
function qzReset(){QZ.s=1;QZ.x=0;QZ.y=0;$$('#spread .qimg').forEach(e=>{e.style.transform='';e.classList.remove('qzoom')})}
{const m=$('#mushaf');let P=null,pan=null,lastTap=0;
  const dist=t=>Math.hypot(t[0].clientX-t[1].clientX,t[0].clientY-t[1].clientY);
  m.addEventListener('touchstart',e=>{const el=qzEl();if(!el)return;
    if(e.touches.length===2){const r=el.parentElement.getBoundingClientRect();P={d:dist(e.touches),s:QZ.s,x:QZ.x,y:QZ.y,cx:(e.touches[0].clientX+e.touches[1].clientX)/2-r.left,cy:(e.touches[0].clientY+e.touches[1].clientY)/2-r.top};e.stopImmediatePropagation()}
    else if(e.touches.length===1){const n=Date.now();if(n-lastTap<300){const r=el.parentElement.getBoundingClientRect(),cx=e.touches[0].clientX-r.left,cy=e.touches[0].clientY-r.top;if(QZ.s>1.01)qzReset();else{QZ.s=2.2;QZ.x=-cx*1.2;QZ.y=-cy*1.2;qzApply()}lastTap=0;e.stopImmediatePropagation();return}lastTap=n;
      if(QZ.s>1.01){pan={x:e.touches[0].clientX,y:e.touches[0].clientY,ox:QZ.x,oy:QZ.y};e.stopImmediatePropagation()}}},{passive:true,capture:true});
  m.addEventListener('touchmove',e=>{if(P&&e.touches.length===2){e.preventDefault();e.stopImmediatePropagation();const s=Math.max(1,Math.min(4,P.s*dist(e.touches)/P.d)),k=s/P.s;QZ.s=s;QZ.x=P.cx-(P.cx-P.x)*k;QZ.y=P.cy-(P.cy-P.y)*k;qzApply()}
    else if(pan&&e.touches.length===1){e.preventDefault();e.stopImmediatePropagation();QZ.x=pan.ox+e.touches[0].clientX-pan.x;QZ.y=pan.oy+e.touches[0].clientY-pan.y;qzApply()}},{passive:false,capture:true});
  m.addEventListener('touchend',e=>{if(P&&e.touches.length<2){P=null;if(QZ.s<1.05)qzReset();e.stopImmediatePropagation()}if(pan&&!e.touches.length){pan=null;e.stopImmediatePropagation()}},{passive:true,capture:true});
  /* desktop: ctrl + wheel */
  m.addEventListener('wheel',e=>{if(!e.ctrlKey)return;e.preventDefault();const el=qzEl();if(!el)return;const r=el.parentElement.getBoundingClientRect(),cx=e.clientX-r.left,cy=e.clientY-r.top,s=Math.max(1,Math.min(4,QZ.s*(e.deltaY<0?1.15:1/1.15))),k=s/QZ.s;QZ.x=cx-(cx-QZ.x)*k;QZ.y=cy-(cy-QZ.y)*k;QZ.s=s;if(s<1.03)qzReset();else qzApply()},{passive:false})}
{const _rq=renderQuran;renderQuran=function(){qzReset();_rq()}}
{const _qsc=qSlideCommit;qSlideCommit=function(d){qzReset();_qsc(d);qMarksDraw()}}
/* 16. mark a line on scanned pages (long-press) */
function QLMK(){return S.quran.lmarks||(S.quran.lmarks={})}
function qMarksDraw(){const R=RIWAYAT[S.quran.riwaya];if(!R||R.kind!=='img')return;const M=QLMK();$$('#spread img[data-p]').forEach(im=>{const p=+im.dataset.p,box=im.parentElement;box.querySelectorAll('.qmark').forEach(x=>x.remove());box.style.position='relative';
  (M[S.quran.riwaya+':'+p]||[]).forEach((y,i)=>{const b=document.createElement('i');b.className='qmark';b.style.top=(y*100)+'%';b.title=t('lm.del');b.onclick=e=>{e.stopPropagation();const L_=M[S.quran.riwaya+':'+p];L_.splice(i,1);if(!L_.length)delete M[S.quran.riwaya+':'+p];save();qMarksDraw()};box.append(b)})})}
/* the existing long-press / click menu on a scanned page gets a "mark this line" action */
{const _qpam=qPageAyahMenu;qPageAyahMenu=async function(pg,x,y){const pr=_qpam(pg,x,y);const pop=$('#ppPop');if(pop){const im=[...$$('#spread img[data-p]')].find(i=>+i.dataset.p===pg&&i.getBoundingClientRect().width>0&&i.getBoundingClientRect().left<x&&i.getBoundingClientRect().right>x)||[...$$('#spread img[data-p]')].find(i=>+i.dataset.p===pg);
  if(im){const r=im.getBoundingClientRect(),fy=(y-r.top)/r.height;if(fy>=0&&fy<=1){const hd=pop.querySelector('.aymh');hd.insertAdjacentHTML('afterend',`<button class="lmbtn" data-lm>🖍 ${t('lm.mark')}</button>`);pop.querySelector('[data-lm]').onclick=()=>{closePP();const k=S.quran.riwaya+':'+pg,M=QLMK();(M[k]=M[k]||[]).push(Math.round(fy*1000)/1000);save();qMarksDraw();toast(t('lm.added'))}}}}return pr}}
{const _qh=qHydrate;qHydrate=function(root){_qh(root);setTimeout(qMarksDraw,50)}}
/* 30. sepia reading mode: light → sepia → dark */
{const b=$('#qDark');if(b){b.onclick=()=>{const Q=S.quran;if(!Q.dark&&!Q.sepia){Q.sepia=true}else if(Q.sepia){Q.sepia=false;Q.dark=true}else{Q.dark=false}save();renderQuran()}}}
{const _rq2=renderQuran;renderQuran=function(){_rq2();const Q=S.quran;$('#mushaf').classList.toggle('sepia',!!Q.sepia&&!Q.dark);const b=$('#qDark');if(b)b.textContent=Q.dark?'☀ '+t('sp.light'):Q.sepia?'☾ '+t('sp.dark'):'📜 '+t('sp.sepia');const fd=$('#qFsDark');if(fd)fd.textContent=Q.dark?'☀':Q.sepia?'☾':'📜'}}
/* 31. sajdah ayahs */
const SAJDA=[[7,206],[13,15],[16,50],[17,109],[19,58],[22,18],[22,77,1],[25,60],[27,26],[32,15],[38,24],[41,38],[53,62,1],[84,21,1],[96,19,1]];
function sajdaOnPage(p){const r=S.quran.riwaya,R=RIWAYAT[r]||{};const B=R.kind==='text'&&QB[r]?QB[r]:QB.hafs;if(!B||!B.pages[p])return null;return SAJDA.find(([s,a])=>B.pages[p].ay.some(x=>x.s===s&&x.a===a&&!x.cont))||null}
{const _qpe2=qPageEl;qPageEl=function(p,side){let h=_qpe2(p,side);try{const sj=sajdaOnPage(p);if(sj)h=h.replace('<div class="qh"><span>',`<div class="qh"><span><b class="sjd" title="${esc(t(sj[2]?'sj.khilaf':'sj.t'))}">۩ ${t('sj.t')}${sj[2]?'*':''}</b> `)}catch(e){}return h}}
/* 29. index of ahzab and athman */
function openQIndex(){const A=qAthman(),rows=[];for(let h=0;h<60;h++){rows.push(`<div class="qixr"><b>${t('q.hizb')} ${h+1}</b><span>${Array.from({length:8},(_,j)=>{const x=A[h*8+j];const p=x?x[0]:1;return`<button data-qp="${p}" title="${t('q.pageS')} ${p}">${j===0?'●':j===4?'◐':'·'}<small>${p}</small></button>`}).join('')}</span></div>`)}
  openInfo('🗂 '+t('qix.t'),`<p class="muted" style="margin:0 0 8px">${t('qix.sub')}</p><div class="qix">${rows.join('')}</div>`);$$('[data-qp]').forEach(b=>b.onclick=()=>{$$('.modal.on').forEach(m=>m.classList.remove('on'));showView('quran');qShow(+b.dataset.qp)})}
/* 25 + 23. real-speed ETA and monthly wird report */
function qSpeed(){const tk=todayKey();let n=0,sum=0;for(let i=1;i<=14;i++){const d=S.days[dKey(addDays(keyToDate(tk),-i))];const r=d&&d.quran?d.quran.read||0:0;sum+=r;n++}return sum/n}
function openWirdReport(){const now=new Date(),y=now.getFullYear(),mo=now.getMonth(),dn=new Date(y,mo+1,0).getDate(),vals=[];for(let i=1;i<=dn;i++){const k=dKey(new Date(y,mo,i)),d=S.days[k];vals.push(d&&d.quran?d.quran.read||0:0)}
  const mx=Math.max(1,...vals),tot=vals.reduce((a,b)=>a+b,0),days=vals.filter(v=>v>0).length,wd=vals.filter((v,i)=>{const d=S.days[dKey(new Date(y,mo,i+1))];return d&&qWirdDone(d.quran)}).length;
  const hrs=Array(24).fill(0);Object.keys(S.days).filter(k=>k.slice(0,7)===dKey(now).slice(0,7)).forEach(k=>(S.days[k].sessions||[]).forEach(s=>{const c=catRaw(s.cat);if(s.cat==='quran'||(c&&c.parent==='quran'))hrs[new Date(s.start).getHours()]+=s.end-s.start}));const bh=hrs.indexOf(Math.max(...hrs));
  openInfo('📖 '+t('wr3.t',L().months[mo]),`<div class="pmstat"><div><b>${tot}</b><small>${t('wr3.pages')}</small></div><div><b>${days}</b><small>${t('wr3.days')}</small></div><div><b>${wd}</b><small>${t('wr3.wird')}</small></div></div>
   <div class="pmbars wr3" dir="ltr">${vals.map((v,i)=>`<div title="${i+1}: ${v}"><b style="height:${Math.round(v/mx*60)+(v?3:1)}px;${v?'':'opacity:.25'}"></b><small>${(i+1)%5===0||i===0?i+1:''}</small></div>`).join('')}</div>
   ${hrs[bh]>0?`<p style="margin-top:12px">⏰ ${t('wr3.best',String(bh).padStart(2,'0')+':00')}</p>`:''}<p class="muted">${t('wr3.speed',Math.round(qSpeed()*10)/10)}</p>`)}
{const _rqs=renderQSide;renderQSide=function(){_rqs();try{const Q=S.quran,c=qCovered(Q.page),k=$('#qKhatma');if(!k)return;const sp=qSpeed(),rem=604-c;let h='<div class="qx3">';
  if(Q.page&&c<604&&sp>0.2){const days=Math.ceil(rem/sp);h+=`<small>⚡ ${t('eta3',Math.round(sp*10)/10,gShort(addDays(logicalDate(Date.now()),days)))}</small>`}
  if(Q.hifzAt){const [s,a]=Q.hifzAt.split(':').map(Number);h+=`<button class="btn sm ghost" id="hzAtBtn">📍 ${t('hz3.at',qSurahName(s),a)}</button>`}
  h+=`<div class="row" style="gap:6px;flex-wrap:wrap"><button class="btn sm ghost" id="qixBtn">🗂 ${t('qix.btn')}</button><button class="btn sm ghost" id="wr3Btn">📊 ${t('wr3.btn')}</button></div></div>`;
  k.insertAdjacentHTML('beforeend',h);$('#qixBtn').onclick=openQIndex;$('#wr3Btn').onclick=openWirdReport;const hb=$('#hzAtBtn');if(hb)hb.onclick=()=>{const [s,a]=Q.hifzAt.split(':').map(Number);qGoAyah(s,a)}}catch(e){console.error(e)}}}
/* 28. listening to the Quran counts as productivity */
const QLS={start:0,last:0};
setInterval(()=>{const on=QA.playing&&QA.el&&!QA.el.paused,n=Date.now();if(on){if(!QLS.start)QLS.start=n;QLS.last=n;return}
  if(QLS.start&&n-QLS.last>20000){const s=QLS.start,e=QLS.last;QLS.start=0;if(S.settings.qListenTime===false||e-s<6e4)return;if(S.timer&&S.timer.mode==='work')return;addSession(qftCat(),s,e,{src:'listen'});save();try{renderGlass();renderLog()}catch(x){}toast(t('ql.saved',fmtHM(e-s)))}},5000);
/* settings for this block */
function renderD2Set(){const st=S.settings;const a=$('#qEdgeT');if(a)toggle(a,st.qEdgeTap!==false,v=>{st.qEdgeTap=v});const b=$('#qlT');if(b)toggle(b,st.qListenTime!==false,v=>{st.qListenTime=v})}
{const _rs21=renderSettings;renderSettings=function(){_rs21();try{renderD2Set()}catch(e){console.error(e)}}}
/* a double-tap zoom must not also open the page menu */
{const sp=$('#spread');let guardUntil=0;$('#mushaf').addEventListener('touchstart',e=>{if(e.touches.length>1)guardUntil=Date.now()+600},{passive:true,capture:true});
  const _qz=qzApply;qzApply=function(){guardUntil=Date.now()+600;_qz()};const _qr=qzReset;qzReset=function(){guardUntil=Date.now()+600;_qr()};
  sp.addEventListener('click',e=>{if(Date.now()<guardUntil){e.stopImmediatePropagation();e.preventDefault()}},true)}
