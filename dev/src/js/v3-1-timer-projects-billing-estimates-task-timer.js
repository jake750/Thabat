/* ============ v3.1 timer: projects, billing, estimates, task timer, prayer-tied tasks, deep work, noise, focus rating, active break, water, floating timer, app detection ============ */
function PJ(){return S.projects||(S.projects=[])}
function pjOf(id){return PJ().find(p=>p.id===id)}
function billOn(){return!!S.settings.billing}
function estOn(){return!!S.settings.estOn}
function rateOn(){return S.settings.rateOn!==false}
function abrkOn(){return S.settings.abrk!==false}
function wtCfg(){const s=S.settings;if(s.water&&typeof s.water==='object'){s.waterCfg=Object.assign({},s.waterCfg||{},s.water);s.water=null}return Object.assign({on:true,goal:8},s.waterCfg||{})}
function waterOn(){return wtCfg().on}
function waterN(k){const d=S.days[k||todayKey()];return(d&&d.water)||0}
function money(v,cur){return(Math.round(v*100)/100).toFixed(2).replace(/\.00$/,'')+' '+(cur||S.settings.billCur||'TND')}
function pjFor(cat){const top=topOf(cat);return PJ().filter(p=>!p.arch&&topOf(p.cat)===top)}
function pjMs(id,keys){let ms=0;(keys||Object.keys(S.days)).forEach(k=>{const d=S.days[k];if(d)d.sessions.forEach(s=>{if(s.proj===id)ms+=s.end-s.start})});const T=S.timer;if(!keys&&T.mode==='work'&&T.proj===id&&T.start)ms+=Date.now()-T.start;return ms}
function taskMs(id){let ms=0;Object.values(S.days).forEach(d=>(d.sessions||[]).forEach(s=>{if(s.task===id)ms+=s.end-s.start}));const T=S.timer;if(T.mode==='work'&&T.task&&T.task.id===id&&T.start)ms+=Date.now()-T.start;return ms}
/* sessions made by the timer carry the project and the task */
{const _as=addSession;addSession=function(cat,start,end,extra){const T=S.timer;let fromTimer=false;
  if(!extra&&T&&T.start===start&&T.cat===cat){fromTimer=true;const x={};if(T.proj)x.proj=T.proj;if(T.task){x.task=T.task.id;x.note=T.task.text}if(T.deep)x.deep=1;if(Object.keys(x).length)extra=x}
  _as(cat,start,end,extra);if(fromTimer&&rateOn()&&end-start>=15*6e4){const d=S.days[keyOf(end-1)],s=d&&d.sessions[d.sessions.length-1];if(s)setTimeout(()=>rateAsk(keyOf(end-1),s.id),400)}}}
/* project / task line under the category chips */
function tSplit(){const T=S.timer;if(T.mode==='work'&&T.start){addSession(T.cat,T.start,Date.now());T.start=Date.now()}}
function renderTProj(){const el=$('#tProj');if(!el)return;const T=S.timer,L_=pjFor(T.cat);if(T.proj&&!L_.some(p=>p.id===T.proj))T.proj=null;
  let h='';if(L_.length)h+=`<span class="pjl">📁</span><select class="in" id="tPjSel"><option value="">${esc(t('pj.none'))}</option>${L_.map(p=>`<option value="${p.id}" ${T.proj===p.id?'selected':''}>${esc(p.name)}</option>`).join('')}</select>`;
  h+=`<button class="link pjm" id="tPjMan">${L_.length?'⚙':'＋ '+esc(t('pj.add'))}</button>`;
  if(T.task)h+=`<span class="ttask" title="${esc(T.task.text)}">▶ <b dir="auto">${esc(T.task.text)}</b>${estOn()?(()=>{const x=(S.days[T.task.k]||{tasks:[]}).tasks.find(q=>q.id===T.task.id);return x&&x.est?` · ${fmtHM(taskMs(x.id))} / ${fmtHM(x.est*6e4)}`:''})():''}<button class="link" id="tTaskX">✕</button></span>`;
  el.innerHTML=h;const s=$('#tPjSel');if(s)s.onchange=()=>{tSplit();T.proj=s.value||null;save();renderLog();renderGlass()};
  $('#tPjMan').onclick=()=>openProjects(topOf(T.cat));const x=$('#tTaskX');if(x)x.onclick=()=>{tSplit();T.task=null;save();renderTProj();renderLog();renderTasks()}}
{const _rcc=renderCatChips;renderCatChips=function(){_rcc();renderTProj()}}
/* projects manager */
let PJF=null;
function openProjects(cat){PJF=cat||null;renderProjects();$('#pjModal').classList.add('on')}
function renderProjects(){const mk=todayKey().slice(0,7),monthKeys=Object.keys(S.days).filter(k=>k.slice(0,7)===mk),L_=PJ().filter(p=>!PJF||topOf(p.cat)===PJF).sort((a,b)=>(a.arch?1:0)-(b.arch?1:0));
  $('#pjBox').innerHTML=`<h2 style="font-size:20px">📁 ${t('pj.title')}${PJF?` — ${esc(catName(catOf(PJF)))}`:''}</h2><small class="muted">${t('pj.sub')}</small>
   <div class="pjlist">${L_.map(p=>{const all=pjMs(p.id),mo=pjMs(p.id,monthKeys),c=catOf(p.cat);
     const est=estOn()&&p.est?`<div class="pjest ${all>p.est*36e5?'over':''}"><i style="width:${Math.min(100,all/(p.est*36e5)*100)}%"></i></div><small class="muted">${t('est.of',fmtHM(all),fmtHM(p.est*36e5))}</small>`:'';
     return`<div class="pjrow ${p.arch?'arch':''}" data-id="${p.id}"><div class="pjh"><i style="background:${c.color}"></i><input class="in" data-f="name" value="${esc(p.name)}" dir="auto"><select class="in" data-f="cat">${catOptions(p.cat)}</select></div>
      <div class="pjm2"><span>${t('pj.total')}: <b>${fmtHM(all)}</b></span><span>${t('pj.month')}: <b>${fmtHM(mo)}</b></span>${billOn()&&p.rate?`<span>💰 <b>${money(mo/36e5*p.rate,p.cur)}</b></span>`:''}</div>${est}
      <div class="pjo">${billOn()?`<label>${t('bill.rate')} <input class="in num" type="number" min="0" step="any" data-f="rate" value="${p.rate||''}"> <input class="in cur" data-f="cur" value="${esc(p.cur||S.settings.billCur||'TND')}" dir="ltr"></label>`:''}${estOn()?`<label>${t('est.h')} <input class="in num" type="number" min="0" step="0.5" data-f="est" value="${p.est||''}"></label>`:''}
       <label class="ck"><input type="checkbox" data-f="arch" ${p.arch?'checked':''}> ${t('pj.arch')}</label><span style="flex:1"></span>${billOn()?`<button class="btn sm" data-inv>🧾 ${t('bill.inv')}</button>`:''}<button class="btn sm ghost" data-del>🗑</button></div></div>`}).join('')||`<div class="empty">${t('pj.empty')}</div>`}</div>
   <div class="pjadd"><input class="in" id="pjNew" placeholder="${esc(t('pj.newPh'))}" dir="auto"><select class="in" id="pjNewCat">${catOptions(PJF||S.timer.cat)}</select><button class="btn pri sm" id="pjAddGo">${t('add')}</button></div>
   <div class="evact"><span style="flex:1"></span><button class="btn sm" id="pjX">${t('ok')}</button></div>`;
  $$('#pjBox .pjrow').forEach(r=>{const p=pjOf(r.dataset.id);
    r.querySelectorAll('[data-f]').forEach(i=>i.onchange=()=>{const f=i.dataset.f;if(f==='arch')p.arch=i.checked||undefined;else if(f==='rate'||f==='est')p[f]=+i.value||undefined;else if(f==='name'){const v=i.value.trim();if(v)p.name=v}else{p[f]=i.value;if(f==='cur')S.settings.billCur=i.value}save();renderProjects();renderTProj()});
    const inv=r.querySelector('[data-inv]');if(inv)inv.onclick=()=>openInvoice(p);
    r.querySelector('[data-del]').onclick=()=>{const i=PJ().indexOf(p);PJ().splice(i,1);save();renderProjects();renderTProj();toastAct(t('pj.deleted',p.name),t('undo'),()=>{PJ().splice(i,0,p);save();renderProjects();renderTProj()},8000)}});
  const add=()=>{const v=$('#pjNew').value.trim();if(!v)return;PJ().push({id:uid(),name:v,cat:$('#pjNewCat').value,created:Date.now()});save();renderProjects();renderTProj()};
  $('#pjAddGo').onclick=add;$('#pjNew').onkeydown=e=>{if(e.key==='Enter')add()};$('#pjX').onclick=()=>$('#pjModal').classList.remove('on')}
$('#pjModal').onclick=e=>{if(e.target.id==='pjModal')$('#pjModal').classList.remove('on')};
/* invoice (optional) */
function ivRows(p,mk){const by={};Object.keys(S.days).filter(k=>k.slice(0,7)===mk).sort().forEach(k=>S.days[k].sessions.forEach(s=>{if(s.proj!==p.id)return;const r=by[k]=by[k]||{k,ms:0,notes:[]};r.ms+=s.end-s.start;if(s.note&&!r.notes.includes(s.note))r.notes.push(s.note)}));return Object.values(by)}
function openInvoice(p){const mk=todayKey().slice(0,7);
  $('#pjBox').innerHTML=`<h2 style="font-size:20px">🧾 ${t('bill.inv')} — ${esc(p.name)}</h2><div class="form ivform"><label>${t('bill.month')}<input class="in" type="month" id="ivM" value="${mk}"></label><label>${t('bill.client')}<input class="in" id="ivC" dir="auto" value="${esc(p.client||'')}"></label><label>${t('bill.from')}<input class="in" id="ivF" dir="auto" value="${esc(S.settings.billName||'')}"></label></div><div class="ivprev" id="ivPrev"></div>
   <div class="evact"><button class="btn sm ghost" id="ivBack">‹ ${t('pj.title')}</button><span style="flex:1"></span><button class="btn pri sm" id="ivGo">📄 PDF</button></div>`;
  const prev=()=>{const R=ivRows(p,$('#ivM').value),ms=R.reduce((a,r)=>a+r.ms,0);$('#ivPrev').innerHTML=R.length?`${t('bill.days',R.length)} · <b>${fmtHM(ms)}</b> × ${p.rate||0} = <b>${money(ms/36e5*(p.rate||0),p.cur)}</b>`:t('bill.none')};
  $('#ivM').onchange=prev;prev();$('#ivBack').onclick=renderProjects;
  $('#ivGo').onclick=()=>{p.client=$('#ivC').value.trim();S.settings.billName=$('#ivF').value.trim();save();const R=ivRows(p,$('#ivM').value);if(!R.length){toast(t('bill.none'));return}invoicePdf(p,$('#ivM').value,R)}}
function invoicePdf(p,mk,R){const W=1190,H=1684,cv=document.createElement('canvas');cv.width=W;cv.height=H;const g=cv.getContext('2d'),rtl=LANG==='ar',ff=getComputedStyle(document.documentElement).fontFamily;
  g.fillStyle='#fff';g.fillRect(0,0,W,H);g.fillStyle='#111';g.direction=rtl?'rtl':'ltr';const M=90,X=v=>rtl?W-v:v,al=a=>rtl?(a==='left'?'right':a==='right'?'left':a):a;
  const txt=(s,x,y,size,w,a,col)=>{g.font=`${w||400} ${size}px ${ff}`;g.textAlign=al(a||'left');g.fillStyle=col||'#111';g.fillText(s,X(x),y)};
  txt(t('bill.inv'),M,150,54,700);txt(p.name,M,205,28,500,'left','#555');
  const [yy,mm]=mk.split('-').map(Number),mName=L().months?L().months[mm-1]:mm;txt(`${t('bill.month')}: ${mName} ${yy}`,W-M,150,24,400,'right','#555');txt(`${t('bill.date')}: ${gStr(new Date())}`,W-M,190,24,400,'right','#555');
  let y=290;if(S.settings.billName){txt(t('bill.from')+':',M,y,22,700);txt(S.settings.billName,M+170,y,22)}if(p.client){txt(t('bill.client')+':',W/2,y,22,700);txt(p.client,W/2+150,y,22)}
  y=380;g.fillStyle='#f2f2f2';g.fillRect(M,y-40,W-2*M,58);txt(t('bill.day'),M+20,y,22,700);txt(t('bill.work'),M+330,y,22,700);txt(t('bill.hours'),W-M-20,y,22,700,'right');y+=60;
  let tot=0;R.forEach((r,i)=>{tot+=r.ms;const d=keyToDate(r.k);txt(gShort(d),M+20,y,21);let n=r.notes.join('، ');g.font=`400 20px ${ff}`;while(n&&g.measureText(n).width>W-2*M-520)n=n.slice(0,-2);if(n!==r.notes.join('، '))n+='…';txt(n||'—',M+330,y,20,400,'left','#444');txt(fmtHM(r.ms),W-M-20,y,21,500,'right');
    g.strokeStyle='#e5e5e5';g.lineWidth=1;g.beginPath();g.moveTo(M,y+18);g.lineTo(W-M,y+18);g.stroke();y+=44});
  y+=30;const amt=tot/36e5*(p.rate||0);txt(t('bill.totalH'),W-M-330,y,24,700,'right');txt(fmtHM(tot)+' · '+(tot/36e5).toFixed(2),W-M-20,y,24,500,'right');y+=48;
  txt(t('bill.rate'),W-M-330,y,24,700,'right');txt(money(p.rate||0,p.cur),W-M-20,y,24,500,'right');y+=60;g.fillStyle='#fddb00';g.fillRect(rtl?M:W-M-560,y-44,560,66);txt(t('bill.amount'),W-M-330,y,30,700,'right');txt(money(amt,p.cur),W-M-20,y,30,700,'right');
  txt(t('app'),M,H-70,18,400,'left','#aaa');
  saveBytes(safeName(p.name+' '+mk)+'.pdf','application/pdf',new Blob([jpegPdf(cv.toDataURL('image/jpeg',.9),W,H,595,842)],{type:'application/pdf'}))}
/* task timer, estimates, prayer-tied tasks */
function taskStart(k,x){const T=S.timer,now=Date.now();if(T.mode==='pray'){toast(t('tt.prayFirst'));return}if(T.mode==='work'&&T.start)addSession(T.cat,T.start,now);
  T.task={id:x.id,k,text:x.text};if(x.proj&&pjOf(x.proj)){T.proj=x.proj;T.cat=pjOf(x.proj).cat}T.mode='work';T.start=now;T.brkStart=null;save();renderTimerBtns();renderTimer();renderCatChips();renderGlass();renderLog();renderTasks();toast(t('tt.started',x.text))}
{const _ta3=timerAct;timerAct=function(a){_ta3(a);if(a==='stop'&&S.timer.task){S.timer.task=null;save();renderTProj();renderTasks()}renderTTools()}}
let TPA=null;
function tpaLabel(k){return t('tp2.after',t('pr.'+k))}
function renderTpBtn(){const b=$('#tpBtn');if(!b)return;b.textContent=TPA?'🕌 '+t('pr.'+TPA):'🕌';b.classList.toggle('on',!!TPA);b.title=t('tp2.tip')}
function tpMenu(anchor,cur,set){const r=anchor.getBoundingClientRect();const p=qPopAt(`<div class="aymh">🕌 ${t('tp2.tip')}</div>${['fajr','dhuhr','asr','maghrib','isha'].map(k=>`<button data-k="${k}" class="${cur===k?'on':''}">${cur===k?'✓ ':''}${esc(tpaLabel(k))}</button>`).join('')}${cur?`<button data-k="">✕ ${t('tp2.none')}</button>`:''}`,r.left+r.width/2,r.bottom-10,'aymenu');
  p.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{closePP();set(b.dataset.k||null)})}
{const _at=addTask;addTask=function(){const d=day(todayKey()),n=d.tasks.length;_at();if(TPA&&d.tasks.length>n){d.tasks[d.tasks.length-1].after=TPA;TPA=null;renderTpBtn();save();renderTasks()}};$('#taskAdd').onclick=addTask;$('#taskIn').onkeydown=e=>{if(e.key==='Enter')addTask()}}
$('#tpBtn').onclick=e=>tpMenu(e.currentTarget,TPA,v=>{TPA=v;renderTpBtn();$('#taskIn').focus()});
{const _tm=taskMeta;taskMeta=function(x){let h=_tm(x);const m=[];if(x.after)m.push(`<span class="tpr" data-tpr>🕌 ${esc(tpaLabel(x.after))}</span>`);
  if(estOn()&&(x.est||taskMs(x.id))){const ms=taskMs(x.id);m.push(`<span class="tes ${x.est&&ms>x.est*6e4?'over':''}">⏱ ${fmtHM(ms)}${x.est?' / '+fmtHM(x.est*6e4):''}</span>`)}else if(taskMs(x.id))m.push(`<span class="tes">⏱ ${fmtHM(taskMs(x.id))}</span>`);
  return h+(m.length?`<small class="tmeta tm2">${m.join(' ')}</small>`:'')}}
function estMenu(anchor,x){const r=anchor.getBoundingClientRect();const p=qPopAt(`<div class="aymh">⏱ ${t('est.ask')}</div><div class="estg">${[15,30,45,60,90,120,180].map(m=>`<button data-m="${m}" class="${x.est===m?'on':''}">${fmtHM(m*6e4)}</button>`).join('')}</div><div style="display:flex;gap:6px;padding:6px 8px"><input class="in num" type="number" min="1" id="estIn" placeholder="${esc(t('u.m'))}" style="flex:1"><button id="estGo">✓</button>${x.est?`<button data-m="0">✕</button>`:''}</div>`,r.left+r.width/2,r.bottom-10,'aymenu');
  const set=m=>{closePP();if(m>0)x.est=m;else delete x.est;save();renderTasks()};p.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>set(+b.dataset.m));$('#estGo').onclick=()=>set(+$('#estIn').value)}
{const _rtk2=renderTasks;renderTasks=function(){_rtk2();const k=todayKey(),d=day(k),T=S.timer;
  if(T.task&&T.task.k===k){const x=d.tasks.find(q=>q.id===T.task.id);if(!x||x.done){tSplit();T.task=null;save();renderTProj();if(x)toast(t('tt.doneT'))}}
  $$('#tasks .task').forEach(li=>{const x=d.tasks.find(q=>q.id===li.dataset.id);if(!x||x.done)return;const del=li.querySelector('.del');if(!del)return;const run=T.task&&T.task.id===x.id&&T.mode==='work';li.classList.toggle('running',!!run);
    del.insertAdjacentHTML('beforebegin',`${estOn()?`<button class="test" title="${esc(t('est.ask'))}">⏱</button>`:''}<button class="tplay ${run?'on':''}" title="${esc(t('tt.start'))}">${run?'⏸':'▶'}</button>`);
    li.querySelector('.tplay').onclick=()=>{if(run){tSplit();T.task=null;timerAct('stop')}else taskStart(k,x)};const eb=li.querySelector('.test');if(eb)eb.onclick=e=>estMenu(e.currentTarget,x);
    const tp=li.querySelector('[data-tpr]');if(tp)tp.onclick=e=>tpMenu(e.currentTarget,x.after,v=>{if(v)x.after=v;else delete x.after;delete x.afterShown;save();renderTasks()})})}}
function tpCheck(){const k=todayKey(),d=S.days[k];if(!d)return;const pt=prayerTimes(keyToDate(k)),now=Date.now();
  ['fajr','dhuhr','asr','maghrib','isha'].forEach(p=>{const L_=d.tasks.filter(x=>x.after===p&&!x.done&&!x.afterShown);if(!L_.length)return;const prayed=d.prayed&&d.prayed[p];if(!prayed&&now<pt[p]+25*6e4)return;if(S.prayPop)return;
    L_.forEach(x=>x.afterShown=1);save();chimeSoft(880);toastAct(t('tp2.now',t('pr.'+p),L_.map(x=>x.text).join('، ')),t('tt.start'),()=>taskStart(k,L_[0]),15000)})}
setInterval(tpCheck,3e4);setTimeout(tpCheck,5000);
{const _pd2=prayDone;prayDone=function(){_pd2();setTimeout(tpCheck,1500)}}
/* timer tools row: deep work, background sound, water, floating window */
function renderTTools(){const el=$('#tTools');if(!el)return;const T=S.timer;
  el.innerHTML=`<button class="tt ${T.deep?'on':''}" id="ttDeep">🎯 ${t('dw.btn')}</button><button class="tt ${NZ.src?'on':''}" id="ttNoise">🎧 ${NZ.src?t('nz.'+NZ.type):t('nz.btn')}</button>${waterOn()?`<button class="tt" id="ttWater" title="${esc(t('wt.tip'))}">💧 ${waterN()}/${wtCfg().goal}</button>`:''}${pipOk()?`<button class="tt ${PIP.w?'on':''}" id="ttPip" title="${esc(t('pip.tip'))}">⧉ ${t('pip.btn')}</button>`:''}`;
  $('#ttDeep').onclick=e=>T.deep?deepEnd():deepMenu(e.currentTarget);$('#ttNoise').onclick=e=>nzMenu(e.currentTarget);const w=$('#ttWater');if(w)w.onclick=waterAdd;const pp=$('#ttPip');if(pp)pp.onclick=pipOpen}
{const _rtb3=renderTimerBtns;renderTimerBtns=function(){_rtb3();renderTTools();renderTProj()}}
function waterAdd(){const d=day(todayKey());d.water=(d.water||0)+1;d.waterAt=Date.now();save();vib(10);renderTTools();const n=d.water,g=wtCfg().goal;toastAct(n>=g&&n-1<g?t('wt.goal',n):t('wt.added',n,g),t('undo'),()=>{d.water=Math.max(0,(d.water||1)-1);save();renderTTools()},5000)}
/* deep work */
function deepMenu(anchor){const r=anchor.getBoundingClientRect();const p=qPopAt(`<div class="aymh">🎯 ${t('dw.t')}</div><small style="display:block;padding:0 12px 6px;color:var(--muted)">${t('dw.sub')}</small>${[25,50,90,0].map(m=>`<button data-m="${m}">${m?fmtHM(m*6e4):t('dw.open')}</button>`).join('')}`,r.left+r.width/2,r.bottom-10,'aymenu');p.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{closePP();deepStart(+b.dataset.m)})}
function deepStart(min){const T=S.timer;if(T.mode==='pray'){toast(t('tt.prayFirst'));return}if(T.mode!=='work')timerAct(T.mode==='brk'?'resume':'start');tSplit();T.deep={start:Date.now(),min,q:[]};save();
  $('#deepOv').classList.add('on');document.body.classList.add('deep');try{if(ANDROID)window.ThabatAndroid.setFullscreen(true);else if(document.documentElement.requestFullscreen&&!document.fullscreenElement)document.documentElement.requestFullscreen().catch(()=>{})}catch(e){}
  if(!NZ.src&&S.settings.nzLast&&S.settings.nzDeep!==false)nzPlay(S.settings.nzLast);deepRender();renderTTools()}
function deepEnd(quiet){const T=S.timer;if(!T.deep)return;const q=T.deep.q||[];const ms=Date.now()-T.deep.start;if(T.mode==='work')tSplit();T.deep=null;save();$('#deepOv').classList.remove('on');document.body.classList.remove('deep');
  try{if(ANDROID){if(!S.quran.fs)window.ThabatAndroid.setFullscreen(false)}else if(document.fullscreenElement)document.exitFullscreen().catch(()=>{})}catch(e){}
  if(!quiet){toast(t('dw.end',fmtHM(ms))+(q.length?' · '+t('dw.missed',q.length):''));if(q.length)setTimeout(()=>q.slice(-3).forEach(x=>toast('🔔 '+x)),800)}renderTTools();renderLog()}
function deepRender(){const T=S.timer,D=T.deep;if(!D)return;if(T.mode!=='work'){deepEnd(T.mode==='pray');return}const el=Date.now()-D.start,tot=D.min*6e4;
  $('#dpClk').textContent=fmtClock(D.min?Math.max(0,tot-el):el);const c=catOf(T.cat),pj=T.proj&&pjOf(T.proj);$('#dpCat').innerHTML=`<i style="background:${c.color}"></i>${esc(catName(c))}${pj?' · 📁 '+esc(pj.name):''}`;$('#dpTask').textContent=T.task?T.task.text:'';
  const pc=D.min?Math.min(1,el/tot):(el%36e5)/36e5;$('#dpRing').style.strokeDashoffset=String(817*(1-pc));$('#dpNoise').textContent='🎧 '+(NZ.src?t('nz.'+NZ.type):t('nz.btn'));
  if(D.min&&el>=tot&&!D.done){D.done=1;save();chimeSoft(784);$('#dpDone').hidden=false;vib([60,80,60])}}
$('#dpExit').onclick=()=>deepEnd();$('#dpBrk').onclick=()=>{deepEnd(true);startBreak(pomoCfg().brk||5)};$('#dpNoise').onclick=e=>nzMenu(e.currentTarget);
$('#dpMore').onclick=()=>{const D=S.timer.deep;if(!D)return;D.min=(D.min||0)+25;D.done=0;$('#dpDone').hidden=true;save();deepRender()};
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&S.timer.deep&&$('#deepOv').classList.contains('on'))deepEnd()});

{const _au=alertUser;alertUser=function(title,body,icon){const D=S.timer&&S.timer.deep;if(D&&S.timer.mode==='work'&&!PRAYERS.some(k=>String(title).includes(t('pr.'+k)))){D.q=(D.q||[]).concat(String(title));save();return}return _au(title,body,icon)}}
/* background sound, synthesized (no files) */
const NZ={src:null,g:null,type:null,lfo:null};const NZT=['rain','brown','pink','white','waves','fan'];
function nzVol(){return(S.settings.nzVol==null?.5:S.settings.nzVol)*.7}
function nzBuf(c,type){const n=c.sampleRate*5,b=c.createBuffer(2,n,c.sampleRate);for(let ch=0;ch<2;ch++){const d=b.getChannelData(ch);let l=0,b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
  for(let i=0;i<n;i++){const w=Math.random()*2-1;if(type==='white')d[i]=w*.22;else if(type==='brown'){l=(l+.02*w)/1.02;d[i]=l*3.2}else{b0=.99886*b0+w*.0555179;b1=.99332*b1+w*.0750759;b2=.969*b2+w*.153852;b3=.8665*b3+w*.3104856;b4=.55*b4+w*.5329522;b5=-.7616*b5-w*.016898;d[i]=(b0+b1+b2+b3+b4+b5+b6+w*.5362)*.1;b6=w*.115926}}
  const f=Math.min(4000,n/4);for(let i=0;i<f;i++){const a=i/f;d[i]=d[i]*a+d[n-f+i]*(1-a)}}return b}
function nzPlay(type){nzStop(true);try{const c=ac(),s=c.createBufferSource();s.buffer=nzBuf(c,type==='rain'?'pink':type==='fan'||type==='waves'?'brown':type);s.loop=true;let node=s;
  if(type==='rain'){const f=c.createBiquadFilter();f.type='highpass';f.frequency.value=500;node.connect(f);node=f}
  if(type==='fan'){const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=380;node.connect(f);node=f}
  const g=c.createGain();g.gain.value=nzVol();node.connect(g);
  if(type==='waves'){const lfo=c.createOscillator(),lg=c.createGain();lfo.frequency.value=.09;lg.gain.value=nzVol()*.55;g.gain.value=nzVol()*.6;lfo.connect(lg);lg.connect(g.gain);lfo.start();NZ.lfo=lfo}
  g.connect(c.destination);s.start();Object.assign(NZ,{src:s,g,type});S.settings.nzLast=type;save()}catch(e){}renderTTools();if(S.timer.deep)deepRender()}
function nzStop(keep){try{if(NZ.src)NZ.src.stop();if(NZ.lfo)NZ.lfo.stop()}catch(e){}NZ.src=NZ.g=NZ.lfo=null;NZ.type=null;if(!keep){renderTTools();if(S.timer.deep)deepRender()}}
function nzMenu(anchor){const r=anchor.getBoundingClientRect(),v=S.settings.nzVol==null?.5:S.settings.nzVol;const p=qPopAt(`<div class="aymh">🎧 ${t('nz.t')}</div>${NZT.map(k=>`<button data-n="${k}" class="${NZ.type===k?'on':''}">${NZ.type===k?'✓ ':''}${t('nz.'+k)}</button>`).join('')}${NZ.src?`<button data-n="">■ ${t('nz.off')}</button>`:''}<div style="padding:6px 12px;display:flex;gap:8px;align-items:center">🔈<input type="range" id="nzV" min="0.05" max="1" step="0.05" value="${v}" style="flex:1">🔊</div>`,r.left+r.width/2,r.bottom-10,'aymenu');
  p.querySelectorAll('[data-n]').forEach(b=>b.onclick=()=>{closePP();if(b.dataset.n)nzPlay(b.dataset.n);else nzStop()});$('#nzV').oninput=e=>{S.settings.nzVol=+e.target.value;save();if(NZ.g){try{NZ.g.gain.value=nzVol()*(NZ.type==='waves'?.6:1)}catch(x){}}}}
/* focus rating after a session */
function rateAsk(k,id){const d=S.days[k],s=d&&d.sessions.find(x=>x.id===id);if(!s||s.focus)return;const el=document.createElement('div');el.className='toast act rate';
  el.innerHTML=`<span>${esc(t('rt.q',fmtHM(s.end-s.start)))}</span><span class="rts">${['😫','😕','😐','🙂','🤩'].map((f,i)=>`<button data-r="${i+1}" title="${i+1}/5">${f}</button>`).join('')}</span>`;$('#toasts').append(el);const tm=setTimeout(()=>el.remove(),15000);
  el.querySelectorAll('[data-r]').forEach(b=>b.onclick=()=>{clearTimeout(tm);el.remove();s.focus=+b.dataset.r;save();renderLog();vib(8)})}
{const _rl3=renderLog;renderLog=function(){_rl3();const d=S.days[todayKey()];if(!d)return;$$('#sessLog li[data-sid]').forEach(li=>{const s=d.sessions.find(x=>x.id===li.dataset.sid);if(!s)return;const ref=li.querySelector('.sne');if(!ref)return;let h='';
  if(s.proj&&pjOf(s.proj))h+=`<span class="slp">📁 ${esc(pjOf(s.proj).name)}</span>`;if(s.deep)h+=`<span class="slp">🎯</span>`;if(s.focus)h+=`<span class="slf" title="${s.focus}/5">${['😫','😕','😐','🙂','🤩'][s.focus-1]}</span>`;if(h)ref.insertAdjacentHTML('beforebegin',h)})}}
/* active break tips */
const ABRK={ar:['🧘 قف ومدّ ظهرك وذراعيك للأعلى ٣٠ ثانية','👀 قاعدة ٢٠-٢٠-٢٠: انظر لشيء بعيد ٢٠ ثانية','🚶 امشِ قليلاً — ولو داخل الغرفة','🤲 حرّك كتفيك ورقبتك ببطء في دوائر','🌬 تنفّس بعمق: شهيق ٤، حبس ٤، زفير ٦ — خمس مرات','✋ مدّ أصابعك ومعصميك بعد الكتابة الطويلة','🪟 افتح النافذة وغيّر الهواء','📿 استغفر أو سبّح خلال الاستراحة','🦵 عشر قرفصاءات خفيفة تنشّط الدورة الدموية','🧹 رتّب مكتبك دقيقة واحدة','😌 أغمض عينيك دقيقة وأرحهما من الشاشة','🍎 تناول شيئاً خفيفاً بدل الحلويات'],
  en:['🧘 Stand up and stretch your back and arms for 30s','👀 20-20-20: look at something far away for 20s','🚶 Walk a little — even around the room','🤲 Roll your shoulders and neck slowly','🌬 Breathe: in 4, hold 4, out 6 — five times','✋ Stretch your fingers and wrists after long typing','🪟 Open the window for fresh air','📿 Do some dhikr during the break','🦵 Ten light squats to wake the body up','🧹 Tidy your desk for one minute','😌 Close your eyes for a minute away from the screen','🍎 A light snack instead of sweets']};
{const _sb=startBreak;startBreak=function(min){_sb(min);const T=S.timer;T.brkTip=Math.floor(Math.random()*12);save();renderTimer()}}
/* every-second updates */
{const _rt3=renderTimer;renderTimer=function(){_rt3();const T=S.timer,tip=$('#brkTip');
  if(tip){let h='';if(T.mode==='brk'&&abrkOn()){h=(ABRK[LANG]||ABRK.ar)[(T.brkTip||0)%12];if(waterOn()){const d=S.days[todayKey()],last=d&&d.waterAt;if(!last||Date.now()-last>60*6e4)h+=' · '+t('wt.brk')}}tip.hidden=!h;if(tip.textContent!==h)tip.textContent=h}
  if(NZ.src&&T.mode!=='work'&&(T.mode==='pray'||S.settings.nzAuto!==false))nzStop();
  if(T.deep)deepRender();else if($('#deepOv').classList.contains('on'))$('#deepOv').classList.remove('on');pipRender()}}
/* floating timer window (PC, Document Picture-in-Picture) */
const PIP={w:null};
function pipOk(){return!ANDROID&&'documentPictureInPicture' in window}
async function pipOpen(){if(PIP.w){PIP.w.close();PIP.w=null;renderTTools();return}try{const w=await documentPictureInPicture.requestWindow({width:250,height:140});PIP.w=w;const cs=getComputedStyle(document.documentElement),v=n=>cs.getPropertyValue(n);
  const st=w.document.createElement('style');st.textContent=`body{margin:0;background:${v('--bg')};color:${v('--text')};font-family:${cs.fontFamily};display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;gap:4px;user-select:none;overflow:hidden}#c{font-size:40px;font-weight:700;font-variant-numeric:tabular-nums;letter-spacing:1px}#c.w{color:${v('--accent')}}#s{font-size:12px;color:${v('--muted')};max-width:94vw;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#b{display:flex;gap:6px;margin-top:4px}button{background:${v('--panel2')};color:inherit;border:1px solid ${v('--line')};border-radius:9px;padding:4px 12px;cursor:pointer;font:inherit;font-size:13px}button:hover{border-color:${v('--accent')}}`;
  w.document.head.append(st);w.document.documentElement.dir=document.documentElement.dir;w.document.title=t('app');w.document.body.innerHTML='<div id="c"></div><div id="s"></div><div id="b"></div>';
  w.addEventListener('pagehide',()=>{PIP.w=null;renderTTools()});pipRender();renderTTools()}catch(e){toast(t('pip.fail'))}}
function pipRender(){const w=PIP.w;if(!w)return;try{const d=w.document,T=S.timer,c=d.getElementById('c');c.textContent=$('#tDisp').textContent;c.className=T.mode==='work'?'w':'';d.getElementById('s').textContent=$('#tState').textContent+(T.task?' · '+T.task.text:'');
  const B=T.mode==='work'?[['b5','☕ 5'],['b15','☕ 15'],['stop','■']]:T.mode==='brk'?[['resume','▶'],['stop','■']]:T.mode==='idle'?[['start','▶']]:[];const b=d.getElementById('b'),sig=B.map(x=>x[0]).join();
  if(b.dataset.sig!==sig){b.dataset.sig=sig;b.innerHTML=B.map(x=>`<button data-a="${x[0]}">${x[1]}</button>`).join('');b.querySelectorAll('button').forEach(x=>x.onclick=()=>{const a=x.dataset.a;if(a==='b5')startBreak(5);else if(a==='b15')startBreak(15);else timerAct(a)})}}catch(e){}}
/* active app detection through the PC helper */
function fgCfg(){return Object.assign({on:false,auto:false,rules:[]},S.settings.fg||{})}
const FG={seen:{},streak:{},cool:{},ok:null};
async function fgPoll(){const C=fgCfg();if(!C.on||ANDROID)return;let j;try{const c=new AbortController(),tm=setTimeout(()=>c.abort(),1500);const r=await fetch(HELPER+'/fg',{cache:'no-store',signal:c.signal});clearTimeout(tm);if(!r.ok)throw 0;j=await r.json();FG.ok=true}catch(e){FG.ok=false;return}
  if(!j||!j.p)return;const p=String(j.p),ttl=String(j.t||'');if(/^(ApplicationFrameHost|SearchHost|ShellExperienceHost|LockApp|explorer|StartMenuExperienceHost)$/i.test(p)&&!ttl)return;if(/ثبات|Thabat/.test(ttl))return;
  FG.seen[p]=ttl;const hay=(p+' '+ttl).toLowerCase(),R=C.rules.find(r=>r.m&&hay.includes(r.m.toLowerCase()));if(!R){FG.streak={};return}
  FG.streak={[R.m]:(FG.streak[R.m]||0)+1};if(FG.streak[R.m]<2)return;const T=S.timer,now=Date.now(),cool=k=>{if((FG.cool[k]||0)>now)return true;FG.cool[k]=now+10*6e4;return false};
  if(R.c==='__dist'){if(T.mode==='work'&&!cool('d'+R.m)){chimeSoft(660);toastAct(t('fg.dist',p),t('dst.btn'),()=>{const d=day(todayKey());d.distract=(d.distract||[]).concat(Date.now());save();renderTimerBtns()},10000)}return}
  if(!catRaw(R.c))return;const sw=()=>{tSplit();T.cat=R.c;if(R.pj&&pjOf(R.pj))T.proj=R.pj;save();renderCatChips();renderTimer();renderGlass();renderLog()};
  if(T.mode==='work'&&T.cat!==R.c&&topOf(T.cat)!==R.c){if(C.auto){sw();toast(t('fg.switched',catName(catOf(R.c)),p))}else if(!cool('s'+R.m))toastAct(t('fg.ask',p,catName(catOf(R.c))),t('fg.switch'),sw,12000)}
  else if(T.mode==='idle'&&!cool('i'+R.m))toastAct(t('fg.idle',p,catName(catOf(R.c))),t('btn.start'),()=>{T.cat=R.c;if(R.pj&&pjOf(R.pj))T.proj=R.pj;timerAct('start');renderCatChips()},12000)}
setInterval(fgPoll,30000);setTimeout(fgPoll,8000);
function renderFgRules(){const box=$('#fgRules');if(!box)return;const C=fgCfg();
  box.innerHTML=`<div class="fgst">${FG.ok===false?'⚠ '+t('fg.noHelper'):FG.ok?'✓ '+t('fg.okHelper'):''}</div>${C.rules.map((r,i)=>`<div class="fgr" data-i="${i}"><input class="in" data-f="m" value="${esc(r.m)}" dir="ltr" placeholder="AfterFX / YouTube"><span>→</span><select class="in" data-f="c"><option value="__dist" ${r.c==='__dist'?'selected':''}>😵 ${t('fg.distOpt')}</option>${catOptions(r.c)}</select><button class="link" data-x>✕</button></div>`).join('')}
   <div class="fgadd"><button class="btn sm" id="fgAdd">＋ ${t('fg.addRule')}</button>${Object.keys(FG.seen).length?`<span class="muted" style="font-size:12px">${t('fg.seen')}</span>${Object.keys(FG.seen).slice(-8).map(p=>`<button class="chip sm" data-p="${esc(p)}" title="${esc(FG.seen[p])}">${esc(p)}</button>`).join('')}`:''}</div>`;
  const setR=L_=>{S.settings.fg=Object.assign(fgCfg(),{rules:L_});save();renderFgRules()};
  box.querySelectorAll('.fgr').forEach(r=>{const i=+r.dataset.i;r.querySelectorAll('[data-f]').forEach(x=>x.onchange=()=>{const L_=fgCfg().rules;L_[i][x.dataset.f]=x.value.trim();setR(L_)});r.querySelector('[data-x]').onclick=()=>{const L_=fgCfg().rules;L_.splice(i,1);setR(L_)}});
  $('#fgAdd').onclick=()=>setR(fgCfg().rules.concat({m:'',c:S.timer.cat}));box.querySelectorAll('[data-p]').forEach(b=>b.onclick=()=>setR(fgCfg().rules.concat({m:b.dataset.p,c:S.timer.cat})))}
/* settings */
function renderV33Set(){const st=S.settings;$('#pjManage').onclick=()=>openProjects();
  toggle($('#billT'),billOn(),v=>{st.billing=v});toggle($('#estT'),estOn(),v=>{st.estOn=v;setTimeout(renderTasks,0)});toggle($('#rateT'),rateOn(),v=>{st.rateOn=v});toggle($('#abrkT'),abrkOn(),v=>{st.abrk=v});
  const W=wtCfg();toggle($('#waterT'),W.on,v=>{st.waterCfg=Object.assign(wtCfg(),{on:v});setTimeout(renderTTools,0)});$('#waterG').value=W.goal;$('#waterG').onchange=e=>{st.waterCfg=Object.assign(wtCfg(),{goal:Math.max(1,+e.target.value||8)});save();renderTTools()};
  toggle($('#nzAutoT'),st.nzAuto!==false,v=>{st.nzAuto=v});
  const F=fgCfg();$('#fgField').hidden=ANDROID;$('#fgBox').hidden=ANDROID||!F.on;toggle($('#fgT'),F.on,v=>{st.fg=Object.assign(fgCfg(),{on:v});$('#fgBox').hidden=!v;if(v)setTimeout(()=>{fgPoll().then(renderFgRules)},50)});toggle($('#fgAutoT'),F.auto,v=>{st.fg=Object.assign(fgCfg(),{auto:v})});renderFgRules()}
{const _rs7=renderSettings;renderSettings=function(){_rs7();try{renderV33Set()}catch(e){console.error(e)}}}
/* brief: focus, estimates, projects, water */
{const _rb4=renderBrief;renderBrief=function(){_rb4();try{const keys=periodKeys(bMode,bAnchor).filter(k=>k<=todayKey()),box=$('#bHours');if(!box)return;const SS=keys.flatMap(k=>(S.days[k]&&S.days[k].sessions)||[]);
  const rated=SS.filter(s=>s.focus),deep=SS.filter(s=>s.deep),stat=box.querySelector('.bhstat');let h='';
  if(rated.length){const av=rated.reduce((a,s)=>a+s.focus,0)/rated.length;const byH={};rated.forEach(s=>{const hh=new Date(s.start).getHours();(byH[hh]=byH[hh]||[]).push(s.focus)});const best=Object.entries(byH).filter(x=>x[1].length>=2).map(([hh,L_])=>[hh,L_.reduce((a,b)=>a+b,0)/L_.length]).sort((a,b)=>b[1]-a[1])[0];
    h+=`<span>🎯 ${t('rt.avg')}: <b>${av.toFixed(1)}/5</b>${best?` · ${t('rt.best',pad(+best[0])+':00')}`:''}</span>`}
  const dms=deep.reduce((a,s)=>a+s.end-s.start,0);if(dms>=6e4)h+=`<span>🧠 ${t('dw.brief')}: <b>${fmtHM(dms)}</b></span>`;
  if(waterOn()){const wd=keys.filter(k=>S.days[k]&&S.days[k].water);if(wd.length)h+=`<span>💧 ${t('wt.avg')}: <b>${(wd.reduce((a,k)=>a+S.days[k].water,0)/wd.length).toFixed(1)}</b></span>`}
  if(estOn()){const done=keys.flatMap(k=>(S.days[k]&&S.days[k].tasks)||[]).filter(x=>x.est&&x.done);const acc=done.map(x=>taskMs(x.id)/(x.est*6e4)).filter(r=>r>0);if(acc.length){const r=acc.reduce((a,b)=>a+b,0)/acc.length;h+=`<span>⏱ ${t('est.acc')}: <b>${r>=1?'+':''}${Math.round((r-1)*100)}%</b></span>`}}
  if(stat&&h)stat.insertAdjacentHTML('beforeend',h);
  const pj={};SS.forEach(s=>{if(s.proj)pj[s.proj]=(pj[s.proj]||0)+s.end-s.start});const top=Object.entries(pj).filter(x=>pjOf(x[0])).sort((a,b)=>b[1]-a[1]).slice(0,6);
  if(top.length){const mx=top[0][1];box.insertAdjacentHTML('beforeend',`<div class="bproj"><h4>📁 ${t('pj.title')}</h4>${top.map(([id,ms])=>{const p=pjOf(id),c=catOf(p.cat);return`<div class="bpjr"><span dir="auto">${esc(p.name)}</span><i><b style="width:${ms/mx*100}%;background:${c.color}"></b></i><span>${fmtHM(ms)}${billOn()&&p.rate?' · '+money(ms/36e5*p.rate,p.cur):''}</span></div>`}).join('')}</div>`)}}catch(e){console.error(e)}}}
renderTpBtn();renderTTools();renderTProj();
if(S.timer.deep){$('#deepOv').classList.add('on');document.body.classList.add('deep')}

