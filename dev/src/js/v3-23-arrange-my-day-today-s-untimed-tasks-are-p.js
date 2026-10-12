/* ============ v3.23: «arrange my day» — today's untimed tasks are placed in the free time between the prayers (prayer time kept clear, appointments and timed tasks respected), as a proposal you edit before applying ============ */
const ARR={pray:20,gap:5,end:120};
try{Object.assign(ARR,JSON.parse(localStorage.getItem('thabat.arr')||'{}'))}catch(e){}
function arrSave(){try{localStorage.setItem('thabat.arr',JSON.stringify({pray:ARR.pray,gap:ARR.gap,end:ARR.end}))}catch(e){}}
const ARR5=ts=>Math.ceil(ts/3e5)*3e5;
/* busy time: each prayer (a little before the adhan to the chosen minutes after), timed tasks, timed appointments */
function arrBusy(k,d){const D=keyToDate(k),pt=prayerTimes(D),out=[];
  PDL_P.forEach(p=>out.push({a:pt[p]-5*6e4,b:pt[p]+ARR.pray*6e4,p:1}));
  d.tasks.forEach(x=>{const a=pdlAt(k,x);if(a!=null&&!x.done)out.push({a,b:a+pdlDur(x)})});
  evsOn(k).forEach(e=>{if(!e.time||!/^\d\d?:\d\d/.test(e.time))return;const [h,m]=e.time.split(':').map(Number),s=keyToDate(k);s.setHours(h,m,0,0);let b=s.getTime()+30*6e4;
    if(e.end&&/^\d\d?:\d\d/.test(e.end)){const [h2,m2]=e.end.split(':').map(Number),z=keyToDate(k);z.setHours(h2,m2,0,0);if(z.getTime()>s.getTime())b=z.getTime()}out.push({a:s.getTime(),b})});
  return out.sort((x,y)=>x.a-y.a)}
/* the order tasks get placed in: the hardest one (frog) and the one in progress first, then those tied to an earlier prayer, then the order they were written */
function arrOrder(list){const pi=x=>{const i=PDL_P.indexOf(x.after);return i<0?9:i};return list.map((x,i)=>({x,i})).sort((A,B)=>(B.x.frog?1:0)-(A.x.frog?1:0)||(B.x.doing?1:0)-(A.x.doing?1:0)||pi(A.x)-pi(B.x)||A.i-B.i).map(o=>o.x)}
function arrPlan(k){const d=day(k),D=keyToDate(k),pt=prayerTimes(D),isT=k===todayKey();
  const start=isT?ARR5(Date.now()+60e3):pt.fajr+ARR.pray*6e4,end=pt.isha+ARR.end*6e4;
  const busy=arrBusy(k,d).map(z=>({...z}));
  const todo=arrOrder(d.tasks.filter(x=>!x.done&&!x.lt&&pdlAt(k,x)==null));
  const placed=[],left=[];
  const fits=(a,dur)=>!busy.some(z=>a<z.b&&a+dur>z.a);
  const nextFree=a=>{let moved=true;while(moved){moved=false;for(const z of busy)if(a>=z.a&&a<z.b){a=ARR5(z.b);moved=true}}return a};
  todo.forEach(x=>{const dur=pdlDur(x);let from=start;
    /* a task tied to a prayer starts looking in that prayer's period */
    if(x.after&&PDL_P.includes(x.after)){const s=pdlSlots(k).find(z=>z.p===x.after);if(s)from=Math.max(start,s.t0)}
    let a=nextFree(ARR5(from)),ok=null;
    while(a+dur<=end){if(fits(a,dur)){ok=a;break}a=nextFree(a+3e5)}
    if(ok==null&&x.after){a=nextFree(ARR5(start));while(a+dur<=end){if(fits(a,dur)){ok=a;break}a=nextFree(a+3e5)}}
    if(ok==null){left.push(x);return}
    placed.push({x,a:ok,dur});busy.push({a:ok,b:ok+dur+ARR.gap*6e4})});
  return{placed:placed.sort((p,q)=>p.a-q.a),left,start,end}}
/* the proposal: grouped by period, each line with its own time, length and a box to leave it out */
function arrOpen(k){k=k||todayKey();const d=day(k),P=arrPlan(k),slots=pdlSlots(k);ARR.k=k;ARR.P=P;
  if(!P.placed.length&&!P.left.length){toast(t('arr.none'));return}
  const durs=[15,30,45,60,90,120];
  const row=o=>`<div class="arrr" data-id="${o.x.id}"><input type="checkbox" checked aria-label="${esc(t('arr.keep'))}"><input type="time" class="in" step="300" value="${fmtHMs(o.a)}" aria-label="${esc(t('pdl.at'))}"><select class="in" aria-label="${esc(t('pdl.dur'))}">${durs.map(m=>`<option value="${m}" ${Math.round(o.dur/6e4)===m?'selected':''}>${fmtHM(m*6e4)}</option>`).join('')}${durs.includes(Math.round(o.dur/6e4))?'':`<option value="${Math.round(o.dur/6e4)}" selected>${fmtHM(o.dur)}</option>`}</select><span class="arrt" dir="auto">${o.x.frog?'🐸 ':''}${esc(o.x.text)}</span></div>`;
  const groups=slots.map(s=>{const L=P.placed.filter(o=>o.a>=s.t0&&o.a<s.t1);return L.length?`<div class="arrg"><b>${esc(tpaLabel(s.p))}</b> <small>${fmtT(s.t0)} – ${fmtT(s.t1)}</small></div>${L.map(row).join('')}`:''}).join('');
  const opts=`<div class="arro"><label>${t('arr.pray')} <select class="in" id="arrPray">${[10,15,20,30,40].map(m=>`<option value="${m}" ${ARR.pray===m?'selected':''}>${t('arr.min',m)}</option>`).join('')}</select></label><label>${t('arr.gap')} <select class="in" id="arrGap">${[0,5,10,15].map(m=>`<option value="${m}" ${ARR.gap===m?'selected':''}>${t('arr.min',m)}</option>`).join('')}</select></label><label>${t('arr.end')} <select class="in" id="arrEnd">${[60,90,120,150,180].map(m=>`<option value="${m}" ${ARR.end===m?'selected':''}>${fmtHM(m*6e4)}</option>`).join('')}</select></label></div>`;
  openInfo('🗓 '+t('arr.t'),`<p class="muted arrp">${t('arr.sub')}</p>${opts}<div class="arrl">${groups||`<p class="muted">${t('arr.noFit')}</p>`}</div>${P.left.length?`<div class="arrleft"><b>${t('arr.left',P.left.length)}</b><div>${P.left.map(x=>`<span class="pdl-chip" dir="auto">${esc(x.text)}</span>`).join('')}</div></div>`:''}<div class="arra"><button class="btn sm pri" id="arrGo">✓ ${t('arr.apply')}</button><button class="btn sm ghost" id="arrRe">↻ ${t('arr.again')}</button></div>`);
  const box=$('#infoBox');box.classList.add('arrbox');
  const re=()=>{ARR.pray=+$('#arrPray').value;ARR.gap=+$('#arrGap').value;ARR.end=+$('#arrEnd').value;arrSave();arrOpen(k)};
  ['arrPray','arrGap','arrEnd'].forEach(i=>$('#'+i).onchange=re);$('#arrRe').onclick=re;
  $('#arrGo').onclick=()=>{const snap=d.tasks.map(x=>({id:x.id,at:x.at,after:x.after,est:x.est}));let n=0;
    box.querySelectorAll('.arrr').forEach(r=>{if(!r.querySelector('input[type=checkbox]').checked)return;const x=d.tasks.find(q=>q.id===r.dataset.id),hm=r.querySelector('input[type=time]').value;if(!x||!hm)return;
      x.at=hm;x.est=+r.querySelector('select').value;const p=pdlSlotOf(k,pdlAt(k,x));if(p)x.after=p;delete x.afterShown;n++});
    $('#infoModal').classList.remove('on');box.classList.remove('arrbox');if(!n)return;save();renderTasks();
    toastAct(t('arr.done',n),t('lsh.undo'),()=>{snap.forEach(s=>{const x=d.tasks.find(q=>q.id===s.id);if(!x)return;['at','after','est'].forEach(f=>{if(s[f]===undefined)delete x[f];else x[f]=s[f]})});save();renderTasks()},10000)};
  const ok=$('#infoX');if(ok){ok.textContent=t('cancel');ok.classList.remove('pri');ok.onclick=()=>{$('#infoModal').classList.remove('on');box.classList.remove('arrbox')}}}
function fmtHMs(ts){const d=new Date(ts);return pad(d.getHours())+':'+pad(d.getMinutes())}
/* the button sits in the card's title row */
{const _pr=pdlRender;pdlRender=function(...a){const r=_pr(...a);try{const h=$('#pdlCard h3');if(h&&!h.querySelector('#arrBtn')){const k=todayKey(),d=day(k);if(d.tasks.some(x=>!x.done&&!x.lt&&pdlAt(k,x)==null)){const hint=h.querySelector('.pdl-hint');(hint||h.lastElementChild).insertAdjacentHTML('beforebegin',`<button class="btn sm ghost" id="arrBtn" title="${esc(t('arr.tip'))}">🗓 ${t('arr.btn')}</button>`);$('#arrBtn').onclick=e=>{e.stopPropagation();arrOpen(k)}}}}catch(e){console.error(e)}return r}}

