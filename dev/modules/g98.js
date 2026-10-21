/* ============ v3.83.0: Quran group — the riwaya keeps your place, named bookmarks, khatma ring in the bar, a year of reading, repeat history, a surah goal, the hifz map by repeats ============ */
/* A place that survives a change of riwaya: the surah and how far into it (0..1) the page's first ayah sits. Ayah numbers differ
   between riwayat (Qalun's 2:255 is Hafs's 2:256), so the fraction is used, not the number. Scanned riwayat have no ayah data:
   they go through the Hafs page table (their pages are close to Hafs, not identical). */
const QAN={pend:null,cnt:{},last:null}; /* last: the place of the last switch, reused while the page has not changed (a two-page spread would drift otherwise) */
function qanCount(r,s){const B=QB[r];if(!B)return QAC[s-1]||1;const c=QAN.cnt[r]||(QAN.cnt[r]={});if(c[s])return c[s];let m=0;
  for(let p=1;p<B.pages.length;p++){const g=B.pages[p];if(!g||!g.ay)continue;for(const x of g.ay)if(x.s===s&&x.a>m)m=x.a}return c[s]=m||QAC[s-1]||1}
function qanText(r){const R=RIWAYAT[r];return!!(R&&R.kind==='text'&&QB[r]&&QB[r].pages)}
function qanOf(r,p){p=Math.max(1,Math.min(604,p||1));
  if(qanText(r)){const g=QB[r].pages[p];const x=g&&g.ay&&(g.ay.find(y=>!y.cont)||g.ay[0]);if(x)return{s:x.s,f:(x.a-1)/qanCount(r,x.s)}}
  if(qanText('hafs')){const g=QB.hafs.pages[p];const x=g&&g.ay&&(g.ay.find(y=>!y.cont)||g.ay[0]);if(x)return{s:x.s,f:(x.a-1)/(QAC[x.s-1]||1)}}
  const i=qSurahIdx(p),a=QS[i][2],b=QS[i][3]||a;return{s:i+1,f:b>a?(p-a)/(b-a+1):0}}
function qanPage(r,an){if(!an||!an.s)return 0;const s=an.s;
  if(qanText(r)){const n=qanCount(r,s),a=Math.max(1,Math.min(n,Math.round(an.f*n)+1)),B=QB[r];let first=0;
    for(let p=1;p<B.pages.length;p++){const g=B.pages[p];if(!g||!g.ay)continue;if(g.ay.some(x=>x.s===s&&x.a===a&&!x.cont))return p;if(!first&&g.ay.some(x=>x.s===s))first=p}
    for(let p=1;p<B.pages.length;p++){const g=B.pages[p];if(g&&g.ay&&g.ay.some(x=>x.s===s&&x.a===a))return p}if(first)return first}
  const i=s-1,n=QAC[i]||1,a=Math.max(1,Math.min(n,Math.round(an.f*n)+1));
  if(qanText('hafs')||(typeof QIX!=='undefined'&&QIX&&QIX.map))return qPageOf(s,a);
  const p0=QS[i][2],p1=QS[i][3]||p0;return Math.round(p0+an.f*(p1-p0))}
/* item 49: switching the riwaya opens the same place in the new one */
{const _f=qSetRiwaya;qSetRiwaya=function(r){const old=S.quran.riwaya;try{if(r!==old&&RIWAYAT[r]){const ps=qVisPages(),L_=QAN.last,an=L_&&L_.v===S.quran.view&&L_.pv===S.quran.pv?L_.an:qanOf(old,ps[0]||S.quran.view||1);QAN.pend={r,an,at:Date.now()}}}catch(e){QAN.pend=null}
  _f(r);try{qanApply()}catch(e){console.error(e)}}}
function qanApply(){const P=QAN.pend;if(!P)return;if(S.quran.riwaya!==P.r||Date.now()-P.at>30000){QAN.pend=null;return}
  const R=RIWAYAT[P.r];if(R.kind==='text'&&!qanText(P.r))return; /* the pack is still loading: the render after it loads tries again */
  QAN.pend=null;const p=qanPage(P.r,P.an);if(p&&!qVisPages().includes(p)){qShowSilent(p);save();renderQuran()}QAN.last={an:P.an,v:S.quran.view,pv:S.quran.pv}}
{hookFn('renderQuran',()=>renderQuran,f=>{renderQuran=f},'post',function(){try{if(QAN.pend)setTimeout(qanApply,0)}catch(e){}})}

/* item 42: named bookmarks — S.quran.bms = [{id,n,r,p,an,at}] (synced with S.quran) */
function qbmList(){const Q=S.quran;if(!Array.isArray(Q.bms))Q.bms=[];return Q.bms}
function qbmHere(){const ps=qVisPages();return ps[0]||S.quran.view||1}
function qbmDef(p){return qSurahAt(p).name+' · '+t('q.pageS')+p}
function qbmAdd(n){const p=qbmHere(),r=S.quran.riwaya;qbmList().unshift({id:uid(),n:(n||'').trim()||qbmDef(p),r,p,an:qanOf(r,p),at:Date.now()});save();toast(t('qbm.added'));qbmOpen()}
function qbmGo(id){const b=qbmList().find(x=>x.id===id);if(!b)return;const r=S.quran.riwaya;let p=b.p;if(b.r!==r){const q=qanPage(r,b.an);if(q)p=q}
  $('#infoModal').classList.remove('on');showView('quran');qShow(p)}
function qbmOpen(){const L_=qbmList(),r=S.quran.riwaya,p=qbmHere();
  openInfo('🔖 '+esc(t('qbm.t')),`<div class="qbmadd"><input class="in" id="qbmN" dir="auto" placeholder="${esc(qbmDef(p))}" aria-label="${esc(t('qbm.name'))}"><button class="btn pri" id="qbmA">${esc(t('qbm.add'))}</button></div>
    <div class="qbml">${L_.length?L_.map(b=>`<div class="qbmr" data-qbm="${b.id}"><button class="qbmgo" data-qa="go"><b dir="auto">${esc(b.n)}</b><small>${esc(qSurahAt(b.p).name)} · ${t('q.pageS')}${b.p}${b.r!==r?' · '+esc(riwName(b.r)):''} · ${gShort(new Date(b.at))}</small></button><button class="btn sm ghost" data-qa="ren" aria-label="${esc(t('qbm.ren'))}" title="${esc(t('qbm.ren'))}">✎</button><button class="btn sm ghost" data-qa="del" aria-label="${esc(t('qbm.del'))}" title="${esc(t('qbm.del'))}">✕</button></div>`).join(''):`<div class="empty">${esc(t('qbm.none'))}</div>`}</div>`);
  const box=$('#infoBox');box.classList.add('qbmbox');
  $('#qbmA').onclick=()=>qbmAdd($('#qbmN').value);$('#qbmN').onkeydown=e=>{if(e.key==='Enter')qbmAdd(e.target.value)};
  box.querySelector('.qbml').onclick=e=>{const b=e.target.closest('[data-qa]'),row=e.target.closest('[data-qbm]');if(!b||!row)return;const id=row.dataset.qbm,L2=qbmList(),i=L2.findIndex(x=>x.id===id);if(i<0)return;
    if(b.dataset.qa==='go')qbmGo(id);
    else if(b.dataset.qa==='ren'){const v=prompt(t('qbm.name'),L2[i].n);if(v!=null&&v.trim()){L2[i].n=v.trim();save();qbmOpen()}}
    else if(b.dataset.qa==='del'){const it=L2.splice(i,1)[0];save();qbmOpen();toastAct(t('qbm.deleted'),t('undo'),()=>{qbmList().splice(i,0,it);save();if($('#infoBox.qbmbox'))qbmOpen()})}}}
{hookFn('openInfo',()=>openInfo,f=>{openInfo=f},'pre',function(){try{const b=$('#infoBox');if(b)b.classList.remove('qbmbox','qygbox')}catch(e){}})}
{hookFn('qbLayout',()=>qbLayout,f=>{qbLayout=f},'post',function(){try{const tb=$('#qbTools .qbshb');if(!tb||$('#qbmBtn'))return;const g=$('#qbGoTo');
  const h=`<button class="btn sm ghost qbtool" id="qbmBtn" data-qbl="1">🔖<small>${esc(t('qbm.t'))}</small></button>`;if(g)g.insertAdjacentHTML('afterend',h);else tb.insertAdjacentHTML('afterbegin',h);
  $('#qbmBtn').onclick=()=>setTimeout(qbmOpen,20)}catch(e){console.error(e)}})}

/* item 10: the khatma's progress as a small ring in the position button */
function qkrPaint(){const b=$('#qbPos');if(!b)return;const Q=S.quran,c=qCovered(Q.page),pc=c/604,n=(Q.khatmas||[]).length+1;let r=b.querySelector('.qkr');
  if(!r){b.insertAdjacentHTML('afterbegin','<b class="qkr" aria-hidden="true"><svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="8"/><circle class="qkra" cx="10" cy="10" r="8" pathLength="100"/></svg></b>');r=b.querySelector('.qkr')}
  r.querySelector('.qkra').style.strokeDasharray=(pc*100).toFixed(1)+' 100';b.title=t('qkr.tip',n,Math.floor(pc*1000)/10,c)}
{hookFn('qbSummary',()=>qbSummary,f=>{qbSummary=f},'post',function(){try{qkrPaint()}catch(e){}})}
{hookFn('renderQSide',()=>renderQSide,f=>{renderQSide=f},'post',function(){try{qkrPaint();qygBtn()}catch(e){}})}

/* item 57: a year of reading — pages read each day (the page timer's pages or the counted wird, whichever is larger) */
const QYG={end:null};
function qygN(k){const q=S.days[k]&&S.days[k].quran;if(!q)return 0;return Math.max(+q.read||0,(q.pgs||[]).length)}
function qygLv(n){return!n?0:n<5?1:n<10?2:n<20?3:4}
function qygBtn(){const k=$('#qKhatma');if(!k||$('#qygBtn'))return;const rs=k.querySelectorAll('.row'),row=rs[rs.length-1];if(!row)return;row.insertAdjacentHTML('beforeend',`<button class="btn sm ghost" id="qygBtn">📅 ${esc(t('qyg.btn'))}</button>`);$('#qygBtn').onclick=()=>qygOpen()}
function qygOpen(end){const today=logicalDate(Date.now());end=end||QYG.end||today;if(end>today)end=today;QYG.end=end;
  const start=addDays(end,-364-end.getDay()),cells=[],months=[];let tot=0,days=0,best=0,run=0,lastM=-1;
  for(let d=new Date(start),i=0;d<=end;d=addDays(d,1),i++){const k=dKey(d),n=qygN(k);tot+=n;if(n){days++;run++;if(run>best)best=run}else run=0;
    if(d.getDate()<=7&&d.getDay()===0&&d.getMonth()!==lastM){lastM=d.getMonth();months.push([Math.floor(i/7),L().months[d.getMonth()]])}
    cells.push(`<i class="l${qygLv(n)}" data-k="${k}" data-n="${n}" title="${esc(gStr(d)+' · '+t('qyg.pages',n))}"></i>`)}
  let cur=0;for(let d=new Date(today);qygN(dKey(d))||dKey(d)===dKey(today);d=addDays(d,-1)){if(qygN(dKey(d)))cur++;else if(dKey(d)!==dKey(today))break;if(cur>4000)break}
  const cols=Math.ceil(cells.length/7),canNext=dKey(end)!==dKey(today);
  openInfo('📅 '+esc(t('qyg.t')),`<div class="qygnav"><button class="btn sm ghost" data-qy="prev" aria-label="${esc(t('qyg.prev'))}">‹</button><b>${gShort(start)} ${start.getFullYear()} – ${gShort(end)} ${end.getFullYear()}</b><button class="btn sm ghost" data-qy="next" aria-label="${esc(t('qyg.next'))}"${canNext?'':' disabled'}>›</button></div>
    <div class="qygst"><span><b>${tot}</b>${esc(t('qyg.sPages'))}</span><span><b>${days}</b>${esc(t('qyg.sDays'))}</span><span><b>${best}</b>${esc(t('qyg.sBest'))}</span><span><b>${cur}</b>${esc(t('qyg.sCur'))}</span></div>
    <div class="qygsc"><div class="qygm" style="--c:${cols}">${months.map(([c,n])=>`<span style="grid-column:${c+1}">${esc(n)}</span>`).join('')}</div><div class="qygg" style="--c:${cols}">${cells.join('')}</div></div>
    <div class="qyglg"><span>${esc(t('qyg.less'))}</span><i class="l0"></i><i class="l1"></i><i class="l2"></i><i class="l3"></i><i class="l4"></i><span>${esc(t('qyg.more'))}</span><small>${esc(t('qyg.lvl'))}</small></div>`);
  const box=$('#infoBox');box.classList.add('qygbox');const sc=box.querySelector('.qygsc');if(sc)sc.scrollLeft=document.documentElement.dir==='rtl'?-sc.scrollWidth:sc.scrollWidth;
  box.querySelector('.qygnav').onclick=e=>{const b=e.target.closest('[data-qy]');if(!b||b.disabled)return;qygOpen(addDays(QYG.end,b.dataset.qy==='prev'?-365:365))};
  box.querySelector('.qygg').onclick=e=>{const c=e.target.closest('[data-k]');if(c)toast(c.title)}}

/* item 6: the last two weeks of repeats for the counted page or passage, under the counter */
function qrhPaint(){const el=$('#qrpBox');if(!el||!qrpOn())return;const u=qrpUnit(),today=logicalDate(Date.now()),v=[];
  for(let i=13;i>=0;i--){const d=addDays(today,-i),k=dKey(d),q=S.days[k]&&S.days[k].quran,n=(q&&q.rpt&&q.rpt[u.k]&&q.rpt[u.k][u.id])||0;v.push([d,n])}
  const mx=Math.max(1,...v.map(x=>x[1])),act=v.filter(x=>x[1]).length;let h=el.querySelector('.qrph');if(!h){h=document.createElement('div');h.className='qrph';const r2=el.querySelector('.qrpr2');(r2||el).after(h)}
  h.innerHTML=`<div class="qrphb" role="img" aria-label="${esc(t('qrh.t',act))}">${v.map(([d,n])=>`<i title="${esc(gShort(d)+' · '+n)}" style="--h:${n?Math.max(10,n/mx*100).toFixed(0):0}%"${n?'':' class="z"'}></i>`).join('')}</div><small>${esc(t('qrh.t',act))}</small>`}

/* item 9: a repeat goal for the whole surah (this session), next to the page/passage goal */
function qrgGoal(){return Math.max(0,+S.quran.rpGoalS||0)}
function qrgPaint(){const el=$('#qrpBox');if(!el)return;const ed=el.querySelector('.qrped');
  if(ed&&!ed.querySelector('[data-qrg]'))ed.insertAdjacentHTML('beforeend',`<label>${esc(t('qrg.goal'))}<input class="in num" type="number" min="0" max="999" value="${qrgGoal()}" data-qrg="1"></label>`);
  const r3=el.querySelector('.qrpr3'),g=qrgGoal();if(r3&&g){const s=qrpSurah(),n=((S.quran.rpS||{}).s||{})[s]||0;r3.insertAdjacentHTML('beforeend',`<span class="qrgp${n>=g?' ok':''}"><i style="width:${Math.min(100,n/g*100).toFixed(1)}%"></i><em>${n}/${g}</em></span>`)}
  if(!el._qrg){el._qrg=1;el.addEventListener('change',e=>{if(!e.target.dataset||!e.target.dataset.qrg)return;S.quran.rpGoalS=Math.max(0,Math.min(999,Math.round(+e.target.value||0)));save();qrpPaint()})}}
{hookFn('qrpPaint',()=>qrpPaint,f=>{qrpPaint=f},'post',function(){try{qrgPaint();qrhPaint()}catch(e){console.error(e)}})}
{hookFn('qrpPlusS',()=>qrpPlusS,f=>{qrpPlusS=f},'post',function(){try{const g=qrgGoal();if(!g)return;const s=qrpSurah(),n=((S.quran.rpS||{}).s||{})[s]||0;if(n===g){vib([30,60,30]);toast(t('qrg.done',qrpSName(s),g))}}catch(e){}})}

/* item 8 (an option): colour the hifz map by how many times each page was repeated */
function qmrLv(n){return!n?0:n<5?1:n<10?2:n<20?3:4}
{hookFn('renderQMap',()=>renderQMap,f=>{renderQMap=f},'post',function(){try{const box=$('#qMap'),hm=$('#hmap');if(!box||!hm)return;const on=!!S.quran.mapRep,h3=box.querySelector('h3 span');
  if(h3&&!$('#qmrBtn')){h3.insertAdjacentHTML('beforeend',` <button class="btn sm ghost qmrb${on?' on':''}" id="qmrBtn" aria-pressed="${on}" title="${esc(t('qmr.tip'))}">🔁 ${esc(t('qmr.btn'))}</button>`);$('#qmrBtn').onclick=()=>{S.quran.mapRep=!S.quran.mapRep;save();renderQMap()}}
  hm.classList.toggle('hmrep',on);if(!on)return;const P=(S.quran.rpt&&S.quran.rpt.p)||{};
  hm.querySelectorAll('.hc[data-p]').forEach(c=>{const n=P[c.dataset.p]||0,l=qmrLv(n);if(l)c.dataset.rl=l;else delete c.dataset.rl;if(n)c.title+=' · '+t('qmr.n',n)});
  const lg=box.querySelector('.hlegend');if(lg)lg.innerHTML=`<span><i class="qmrk" data-rl="1"></i>1–4</span><span><i class="qmrk" data-rl="2"></i>5–9</span><span><i class="qmrk" data-rl="3"></i>10–19</span><span><i class="qmrk" data-rl="4"></i>20+</span><span><i style="outline:1.5px solid var(--text)"></i>${t('q.lgCur')}</span>`}catch(e){console.error(e)}})}
