/* ============ v3.156.0 thirteenth list C1: Quran — khatma schedule, memorised this month, review schedule, hifz calendar, recitation to a sheikh, next page at the goal ============ */
/* 54 qc1KhOpen: each day of the khatma plan (S.quran.kStart → S.quran.target, else at the wird pace) with its pages and what was read.
   55 cells of pages memorised this month (S.quran.memAt) get .qc1mo. 58 qc1RvOpen: the next 7 days of review from page strength and S.quran.rvLast.
   59 qc1Cal: a year map of days with new memorisation (memAt, hplan.log lines, the hifz tick). 60–62 S.quran.tsm=[{id,d,who,ps:[pages],gr,nt}]:
   recitations to a sheikh; the page footer shows the last one, map cells get .qc1ts, a share line under the map. 66 S.quran.rpNext: in memorisation mode
   (page unit) reaching the goal moves to the next page. */
const QC1={end:null};
function qc1Pg(n){return((qStart()-1+n-1)%604+604)%604+1}
function qc1Rng(ps){const a=[...new Set(ps)].sort((x,y)=>x-y),out=[];let s=null,p=null;a.forEach(x=>{if(s==null){s=p=x}else if(x===p+1)p=x;else{out.push(s===p?s:s+'–'+p);s=p=x}});if(s!=null)out.push(s===p?s:s+'–'+p);return out.join('، ')}
function qc1Day(k){const d=keyToDate(k);return L().sdays[d.getDay()]+' '+gShort(d)}
{hookFn('openInfo',()=>openInfo,f=>{openInfo=f},'pre',function(){try{const b=$('#infoBox');if(b)b.classList.remove('qc1box')}catch(e){}})}

/* ---- 54 the khatma schedule ---- */
function qc1KhPlan(){const Q=S.quran,tk=todayKey(),st=Q.kStart&&Q.kStart<=tk?Q.kStart:tk;let days;
  if(Q.target&&Q.target>=st)days=daysBetween(st,Q.target)+1;else days=Math.ceil(604/Math.max(1,+Q.wird||5));
  days=Math.max(1,Math.min(days,1500));const rows=[];let prev=0,cum=0;
  for(let i=0;i<days;i++){const k=dKey(addDays(keyToDate(st),i)),pc=Math.round(604*(i+1)/days),past=k<=tk,n=past?qygN(k):0;cum+=n;
    rows.push({k,from:prev+1,to:pc,n,cum,past,today:k===tk});prev=pc}
  return{st,days,rows}}
function qc1KhOpen(){const Q=S.quran,tk=todayKey(),P=qc1KhPlan(),cov=qCovered(Q.page),td=P.rows.find(r=>r.today),plan=td?td.to:(P.rows.length&&tk>P.rows[P.rows.length-1].k?604:0),diff=cov-plan;
  const left=604-cov,dl=Q.target&&Q.target>=tk?daysBetween(tk,Q.target)+1:0;
  const head=`<p class="qc1s">${esc(Q.target?t('qc1.khSubT',left,dl,dl?Math.ceil(left/dl):left):t('qc1.khSubW',left,+Q.wird||5))}</p>`+
    (td?`<p class="qc1st ${diff>=0?'ok':'bad'}">${esc(diff>=0?(diff?t('qc1.ahead',diff):t('qc1.onPlan')):t('qc1.behind',-diff))}</p>`:'');
  const rows=P.rows.map(r=>{const a=qc1Pg(r.from),b=qc1Pg(r.to),ok=r.past&&cov>=r.to,cls=r.today?'td':r.past?(ok?'ok':'bad'):'fu';
    return`<button class="qc1kr ${cls}" data-qc1go="${r.today?Q.page%604+1:a}"><span class="qc1kd">${esc(qc1Day(r.k))}</span><span class="qc1kp">${esc(t('q.pageS'))} <bdi>${a===b?a:a+'–'+b}</bdi></span><span class="qc1kn">${r.past?esc(t('qc1.read',r.n)):''}</span><i>${r.today?esc(t('qc1.readNow')):r.past?(ok?'✓':'·'):''}</i></button>`}).join('');
  openInfo('📋 '+esc(t('qc1.khT')),head+`<div class="qc1kl">${rows}</div><p class="qc1s">${esc(t('qc1.khHint'))}</p>`);
  const box=$('#infoBox');box.classList.add('qc1box');box.querySelector('.qc1kl').onclick=e=>{const b=e.target.closest('[data-qc1go]');if(!b)return;closeInfo2();if(curView()!=='quran')showView('quran');qShow(+b.dataset.qc1go)};
  const cur=box.querySelector('.qc1kr.td');if(cur)setTimeout(()=>cur.scrollIntoView({block:'center'}),60)}
function qc1KhBtn(){const k=$('#qKhatma');if(!k||$('#qc1KhB'))return;const g=$('#qygBtn');const h=`<button class="btn sm ghost" id="qc1KhB">📋 ${esc(t('qc1.khB'))}</button>`;if(g)g.insertAdjacentHTML('afterend',h);else{const rs=k.querySelectorAll('.row'),row=rs[rs.length-1];if(!row)return;row.insertAdjacentHTML('beforeend',h)}$('#qc1KhB').onclick=()=>qc1KhOpen()}
{hookFn('renderQSide',()=>renderQSide,f=>{renderQSide=f},'post',function(){try{qc1KhBtn()}catch(e){}})}

/* ---- 60–62 recitation to a sheikh ---- */
function qc1Ts(){const Q=S.quran;if(!Array.isArray(Q.tsm))Q.tsm=[];return Q.tsm}
function qc1TsLast(){const m={};qc1Ts().slice().sort((a,b)=>a.d<b.d?-1:1).forEach(e=>(e.ps||[]).forEach(p=>{m[p]=e}));return m}
function qc1Share(){const M=new Set(S.quran.memorized||[]),L_=qc1TsLast();let n=0;M.forEach(p=>{if(L_[p])n++});return{n,m:M.size,pc:M.size?Math.round(n/M.size*100):0}}
const QC1_GR=['ex','vg','g','rp'];
function qc1TsOpen(ps){const Q=S.quran,tk=todayKey(),sh=qc1Share(),L_=qc1Ts(),who=[...new Set(L_.map(e=>e.who).filter(Boolean))].slice(-8);
  ps=(ps&&ps.length?ps:qVisPages()).slice().sort((a,b)=>a-b);const a=ps[0]||1,b=ps[ps.length-1]||a;
  const list=L_.slice().sort((x,y)=>x.d<y.d?1:x.d>y.d?-1:(y.at||0)-(x.at||0)).map(e=>`<div class="qc1tr"><div><b>${esc(gStr(keyToDate(e.d)))}</b>${e.who?` · ${esc(e.who)}`:''} · ${esc(t('q.pageS'))}${esc(qc1Rng(e.ps||[]))}${e.gr?` <span class="qc1gr g-${e.gr}">${esc(t('qc1.gr.'+e.gr))}</span>`:''}${e.nt?`<small>${esc(e.nt)}</small>`:''}</div><button class="btn sm ghost" data-qc1del="${e.id}" aria-label="${esc(t('del'))}">✕</button></div>`).join('')||`<p class="qc1s">${esc(t('qc1.tsNone'))}</p>`;
  openInfo('🎓 '+esc(t('qc1.tsT')),`<p class="qc1st">${esc(sh.m?t('qc1.share',sh.n,sh.m,sh.pc):t('qc1.shareNone'))}</p>
   <div class="qc1tf"><label>${esc(t('qc1.date'))}<input class="in" type="date" id="qc1D" value="${tk}" max="${tk}"></label>
   <label>${esc(t('qc1.who'))}<input class="in" id="qc1W" list="qc1WL" value="${esc(who[who.length-1]||'')}" placeholder="${esc(t('qc1.whoPh'))}"><datalist id="qc1WL">${who.map(w=>`<option value="${esc(w)}">`).join('')}</datalist></label>
   <label>${esc(t('qc1.from'))}<input class="in num" type="number" min="1" max="604" id="qc1A" value="${a}"></label><label>${esc(t('qc1.to'))}<input class="in num" type="number" min="1" max="604" id="qc1B" value="${b}"></label>
   <div class="qc1grs" role="group" aria-label="${esc(t('qc1.grade'))}">${QC1_GR.map(g=>`<button class="btn sm" data-qc1g="${g}">${esc(t('qc1.gr.'+g))}</button>`).join('')}</div>
   <textarea class="in" id="qc1N" rows="2" placeholder="${esc(t('qc1.notePh'))}"></textarea>
   <button class="btn pri" id="qc1Add">${esc(t('qc1.add'))}</button></div>
   <h4 class="qc1h">${esc(t('qc1.log'))}</h4><div class="qc1tl">${list}</div>`);
  const box=$('#infoBox');box.classList.add('qc1box');let gr='';
  box.querySelector('.qc1grs').onclick=e=>{const x=e.target.closest('[data-qc1g]');if(!x)return;gr=gr===x.dataset.qc1g?'':x.dataset.qc1g;box.querySelectorAll('[data-qc1g]').forEach(y=>y.classList.toggle('on',y.dataset.qc1g===gr))};
  $('#qc1Add').onclick=()=>{let A=Math.round(+$('#qc1A').value||0),B=Math.round(+$('#qc1B').value||0);if(A<1||A>604){toast(t('qc1.bad'));return}if(!(B>=1&&B<=604))B=A;if(B<A)[A,B]=[B,A];if(B-A>59){toast(t('qc1.tooMany'));return}
    const d=$('#qc1D').value||tk,pp=[];for(let p=A;p<=B;p++)pp.push(p);
    qc1Ts().push({id:'ts'+Date.now().toString(36),d:d>tk?tk:d,who:$('#qc1W').value.trim().slice(0,60),ps:pp,gr,nt:$('#qc1N').value.trim().slice(0,400),at:Date.now()});
    save();toast(t('qc1.added',qc1Rng(pp)));qc1Refresh();qc1TsOpen(pp)};
  box.querySelector('.qc1tl').onclick=e=>{const x=e.target.closest('[data-qc1del]');if(!x)return;const L2=qc1Ts(),i=L2.findIndex(y=>y.id===x.dataset.qc1del);if(i<0)return;const [old]=L2.splice(i,1);save();qc1Refresh();qc1TsOpen(ps);
    toastAct(t('qc1.deleted'),t('undo'),()=>{qc1Ts().splice(i,0,old);save();qc1Refresh();if($('#infoModal.on #qc1Add'))qc1TsOpen(ps)})}}
function qc1Refresh(){try{if(curView()==='quran'){renderQMap();qc1Foot()}}catch(e){}}
/* 60: the last recitation in each page footer */
function qc1Foot(){const L_=qc1TsLast();$$('#spread .qpage').forEach(pg=>{const b=pg.querySelector('[data-bm]'),f=pg.querySelector('.qf');if(!b||!f)return;const p=+b.dataset.bm,e=L_[p];let s=f.querySelector('.qc1pm');
  if(!e){if(s)s.remove();return}const tt=t('qc1.pm',gStr(keyToDate(e.d)),e.who||t('qc1.sheikh'))+(e.gr?' · '+t('qc1.gr.'+e.gr):'');
  if(!s){s=document.createElement('button');s.className='qc1pm';s.onclick=ev=>{ev.stopPropagation();qc1TsOpen([p])};f.append(s)}
  const h='🎓<em>'+esc(e.who||gShort(keyToDate(e.d)))+'</em>';if(s.title!==tt){s.title=tt;s.setAttribute('aria-label',tt)}if(s._h!==h){s._h=h;s.innerHTML=h}})}
/* pages are drawn lazily: watch the mushaf (qc1Foot changes nothing once the marks are in place) */
const QC1MO=new MutationObserver(()=>{clearTimeout(QC1.mt);QC1.mt=setTimeout(()=>{try{qc1Foot()}catch(e){}},150)});
{hookFn('renderQuran',()=>renderQuran,f=>{renderQuran=f},'post',function(){try{const m=$('#mushaf');if(m&&!m._qc1){m._qc1=1;QC1MO.observe(m,{childList:true,subtree:true})}qc1Foot()}catch(e){}})}
{hookFn('qBarUpdate',()=>qBarUpdate,f=>{qBarUpdate=f},'post',function(){try{setTimeout(qc1Foot,30)}catch(e){}})}

/* ---- 58 the review schedule for the next week ---- */
function qc1Iv(p){const h=qhsGet(p),l=typeof mlvOf==='function'?mlvOf(p):'';if(h===1||l==='weak'||l==='lost')return 2;if(h===2||l==='fair')return 5;if(h===3)return 14;return 8}
function qc1RvPlan(){const Q=S.quran,M=(Q.memorized||[]).slice(),L_=Q.rvLast||{},t0=keyToDate(todayKey()),cap=Math.max(1,+Q.review||5),out=[];
  const st=M.map(p=>{const iv=qc1Iv(p),l=L_[p];return{p,iv,due:+(l?addDays(keyToDate(l),iv):t0)}});
  for(let i=0;i<7;i++){const d=addDays(t0,i),dd=+d,cand=st.filter(x=>x.due<=dd).sort((a,b)=>a.due-b.due||a.iv-b.iv||a.p-b.p),pick=cand.slice(0,cap);
    pick.forEach(x=>{x.due=+addDays(d,x.iv)});out.push({k:dKey(d),ps:pick.map(x=>x.p).sort((a,b)=>a-b),more:cand.length-pick.length})}
  return{out,cap}}
function qc1RvOpen(){const Q=S.quran,tk=todayKey(),M=Q.memorized||[];
  if(!M.length){openInfo('🗓 '+esc(t('qc1.rvT')),`<p class="qc1s">${esc(t('qc1.rvNone'))}</p>`);return}
  const {out,cap}=qc1RvPlan(),L_=Q.rvLast||{},done=M.filter(p=>L_[p]===tk);
  const rows=out.map((r,i)=>`<div class="qc1rv${i?'':' td'}"><b>${esc(i?qc1Day(r.k):t('qc1.today'))}</b><div class="qc1rp">${r.ps.length?r.ps.map(p=>`<button class="btn sm h${qhsGet(p)}" data-qc1go="${p}">${p}</button>`).join(''):`<span class="qc1s">${esc(t('qc1.rvFree'))}</span>`}</div>${r.more>0?`<small>${esc(t('qc1.rvMore',r.more))}</small>`:''}${!i&&done.length?`<small>${esc(t('qc1.rvDone',qc1Rng(done)))}</small>`:''}</div>`).join('');
  openInfo('🗓 '+esc(t('qc1.rvT')),`<p class="qc1s">${esc(t('qc1.rvSub',cap))}</p>${rows}`);
  const box=$('#infoBox');box.classList.add('qc1box');box.querySelector('.infob').onclick=e=>{const b=e.target.closest('[data-qc1go]');if(!b)return;closeInfo2();if(curView()!=='quran')showView('quran');qShow(+b.dataset.qc1go)}}

/* ---- 59 the hifz calendar ---- */
function qc1CalMap(){const Q=S.quran,m={},A=Q.memAt||{},M=new Set(Q.memorized||[]);for(const p in A)if(M.has(+p)){const k=A[p];m[k]=(m[k]||0)+1}
  const hp=(Q.hplan&&Q.hplan.log)||{};for(const k in hp){const v=Math.round((+hp[k]||0)/15*10)/10;if(v>(m[k]||0))m[k]=v}return m}
function qc1CalN(m,k){const n=m[k]||0;if(n)return n;const q=S.days[k]&&S.days[k].quran;return q&&q.hifz?0.01:0}
function qc1Lv(n){return!n?0:n<1?1:n<2?2:n<5?3:4}
function qc1Cal(end){const today=logicalDate(Date.now());end=end||QC1.end||today;if(end>today)end=today;QC1.end=end;const m=qc1CalMap();
  const start=addDays(end,-364-end.getDay()),cells=[],months=[];let tot=0,days=0,best=0,run=0,lastM=-1;
  for(let d=new Date(start),i=0;d<=end;d=addDays(d,1),i++){const k=dKey(d),n=qc1CalN(m,k);if(n>=1)tot+=n;if(n){days++;run++;if(run>best)best=run}else run=0;
    if(d.getDate()<=7&&d.getDay()===0&&d.getMonth()!==lastM){lastM=d.getMonth();months.push([Math.floor(i/7),L().months[d.getMonth()]])}
    cells.push(`<i class="l${qc1Lv(n)}" data-k="${k}" title="${esc(gStr(d)+' · '+(n>=1?t('qc1.calPg',Math.round(n*10)/10):n?t('qc1.calTick'):t('qc1.calNone')))}"></i>`)}
  let cur=0;for(let d=new Date(today);;d=addDays(d,-1)){const k=dKey(d),n=qc1CalN(m,k);if(n)cur++;else if(k!==dKey(today))break;if(cur>4000)break}
  const cols=Math.ceil(cells.length/7),canNext=dKey(end)!==dKey(today);
  openInfo('🧠 '+esc(t('qc1.calT')),`<div class="qygnav"><button class="btn sm ghost" data-qc1y="prev" aria-label="${esc(t('qyg.prev'))}">‹</button><b>${gShort(start)} ${start.getFullYear()} – ${gShort(end)} ${end.getFullYear()}</b><button class="btn sm ghost" data-qc1y="next" aria-label="${esc(t('qyg.next'))}"${canNext?'':' disabled'}>›</button></div>
    <div class="qygst"><span><b>${Math.round(tot*10)/10}</b>${esc(t('qc1.cPages'))}</span><span><b>${days}</b>${esc(t('qc1.cDays'))}</span><span><b>${best}</b>${esc(t('qyg.sBest'))}</span><span><b>${cur}</b>${esc(t('qyg.sCur'))}</span></div>
    <div class="qygsc"><div class="qygm" style="--c:${cols}">${months.map(([c,n])=>`<span style="grid-column:${c+1}">${esc(n)}</span>`).join('')}</div><div class="qygg qc1g" style="--c:${cols}">${cells.join('')}</div></div>
    <div class="qyglg"><span>${esc(t('qyg.less'))}</span><i class="l0"></i><i class="l1"></i><i class="l2"></i><i class="l3"></i><i class="l4"></i><span>${esc(t('qyg.more'))}</span><small>${esc(t('qc1.calLv'))}</small></div>`);
  const box=$('#infoBox');box.classList.add('qygbox','qc1box');const sc=box.querySelector('.qygsc');if(sc)sc.scrollLeft=document.documentElement.dir==='rtl'?-sc.scrollWidth:sc.scrollWidth;
  box.querySelector('.qygnav').onclick=e=>{const b=e.target.closest('[data-qc1y]');if(!b||b.disabled)return;qc1Cal(addDays(QC1.end,b.dataset.qc1y==='prev'?-365:365))};
  box.querySelector('.qygg').onclick=e=>{const c=e.target.closest('[data-k]');if(c)toast(c.title)}}

/* ---- the hifz map: 55 this month, 60/62 recited pages and the share, buttons ---- */
function qc1MapPaint(){const hm=$('#hmap');if(!hm)return;const A=S.quran.memAt||{},mo=todayKey().slice(0,7),M=new Set(S.quran.memorized||[]),L_=qc1TsLast();let nMo=0;
  hm.querySelectorAll('.hc[data-p]').forEach(c=>{const p=+c.dataset.p,m=M.has(p)&&String(A[p]||'').slice(0,7)===mo;if(m)nMo++;c.classList.toggle('qc1mo',m);c.classList.toggle('qc1ts',!!(L_[p]&&M.has(p)))});
  const lg=$('#qMap .hlegend');if(lg&&!lg.querySelector('.qc1lg'))lg.insertAdjacentHTML('beforeend',`<span class="qc1lg"><i class="qc1mo"></i>${esc(t('qc1.lgMo',nMo))}</span><span class="qc1lg"><i class="qc1ts"></i>${esc(t('qc1.lgTs'))}</span>`);
  if(lg&&!$('#qc1Bar')){const sh=qc1Share();lg.insertAdjacentHTML('afterend',`<div class="qc1bar" id="qc1Bar"><button class="btn sm ghost" data-qc1="rv">🗓 ${esc(t('qc1.rvB'))}</button><button class="btn sm ghost" data-qc1="cal">📅 ${esc(t('qc1.calB'))}</button><button class="btn sm ghost" data-qc1="ts">🎓 ${esc(t('qc1.tsB'))}</button>${sh.m?`<span class="qc1sh">${esc(t('qc1.share',sh.n,sh.m,sh.pc))}</span>`:''}</div>`);
    $('#qc1Bar').onclick=e=>{const b=e.target.closest('[data-qc1]');if(!b)return;const a=b.dataset.qc1;if(a==='rv')qc1RvOpen();else if(a==='cal'){QC1.end=null;qc1Cal()}else qc1TsOpen(typeof qSel!=='undefined'&&qSel.size?[...qSel]:null)}}
  const sb=$('#qSelBar');if(sb&&!$('#qc1SelTs')){sb.insertAdjacentHTML('beforeend',`<button class="btn sm" id="qc1SelTs">🎓 ${esc(t('qc1.selTs'))}</button>`);$('#qc1SelTs').onclick=()=>qc1TsOpen([...qSel])}}
{hookFn('renderQMap',()=>renderQMap,f=>{renderQMap=f},'post',function(){try{qc1MapPaint()}catch(e){console.error(e)}})}

/* ---- 66 next page when the repetition goal is reached ---- */
{hookFn('qrpPlus',()=>qrpPlus,f=>{qrpPlus=f},'post',function(d){try{const Q=S.quran;if(!(d>0)||!Q.rpNext||!qrpOn()||Q.rpU==='r')return;const u=qrpUnit(),n=(Q.rpS[u.k]||{})[u.id]||0,g=qrpGoal();if(!g||n!==g)return;
  const ps=qVisPages(),p=qrpPage();
  if(ps.length>1&&QRP.pick<ps.length-1){setTimeout(()=>{QRP.pick++;qrpPaint();toast(t('qc1.nextP',qrpPage()))},700);return}
  if(p>=604)return;setTimeout(()=>{QRP.pick=0;qShow(p+1);toastAct(t('qc1.nextP',p+1),t('undo'),()=>qShow(p))},900)}catch(e){console.error(e)}})}
{hookFn('qrpPaint',()=>qrpPaint,f=>{qrpPaint=f},'post',function(){try{const ed=$('#qrpBox .qrped');if(!ed||ed.querySelector('.qc1nx')||S.quran.rpU==='r')return;
  ed.insertAdjacentHTML('beforeend',`<label class="qc1nx"><input type="checkbox" id="qc1Nx"${S.quran.rpNext?' checked':''}> ${esc(t('qc1.nxL'))}</label>`);
  $('#qc1Nx').onchange=e=>{S.quran.rpNext=e.target.checked;save()}}catch(e){}})}

/* Ctrl+K */
{const _cc=cmdCommands;cmdCommands=function(){const c=(icon,label,run,kw)=>({icon,label,run,kw:kw||''});return _cc().concat([
  c('📋',t('qc1.khT'),()=>{showView('quran');qc1KhOpen()},'khatma plan ختمة جدول'),
  c('🗓',t('qc1.rvT'),()=>{showView('quran');qc1RvOpen()},'review schedule مراجعة'),
  c('📅',t('qc1.calT'),()=>{showView('quran');QC1.end=null;qc1Cal()},'hifz calendar حفظ'),
  c('🎓',t('qc1.tsT'),()=>{showView('quran');qc1TsOpen()},'sheikh recitation تسميع شيخ')])}}

