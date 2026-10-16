/* ============ deadline tasks & vacation ============ */
const ICON_CLOCK='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0"/><path class="ih-clh" d="M12 7v5l3 3"/></svg>';
const ICON_UP='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V6M6 11l6-6 6 6"/></svg>';
const dDiff=(a,b)=>Math.round((keyToDate(b)-keyToDate(a))/864e5);
function LT(){return S.ltasks||(S.ltasks=[])}
function isVac(k){return!!(S.vac&&S.vac[k])}
function ltOn(k,id){return!!(S.vacOn&&S.vacOn[k]&&S.vacOn[k][id])}
function ltPct(x){const cps=x.cps||[],p=x.prog||{};if(!cps.length)return Math.min(1,(p.pct||0)/100);const N=cps.length;if((p.ch||0)>=N)return 1;const c=p.ch||0,inCh=cps[c]>0?Math.min(1,(p.pj||0)/cps[c]):Math.min(1,(p.pct||0)/100);return(c+inCh)/N}
function ltMeta(x){const cps=x.cps||[],p=x.prog||{};if(!cps.length)return'';const N=cps.length,c=p.ch||0;if(c>=N)return t('lt.allCh',N);let r=t('lt.chOf',c+1,N);if(cps[c]>0)r+=' · '+t('lt.pjOf',p.pj||0,cps[c]);return r}
function parseCps(n,str){n=parseInt(n)||0;if(n<=0)return[];const a=String(str||'').split(/[,،\s]+/).map(v=>parseInt(v)).filter(v=>v>=0&&!isNaN(v));if(!a.length)return Array(n).fill(0);const r=[];for(let i=0;i<n;i++)r.push(a[Math.min(i,a.length-1)]);return r}
function ltRing(x,k){const tot=Math.max(1,dDiff(x.start,x.deadline)),left=dDiff(k,x.deadline),late=left<0,fr=late?1:Math.max(0,Math.min(1,left/tot)),R=13,C=2*Math.PI*R;
  return`<button class="ltring ${late?'late':left<=2?'soon':''}" title="${esc(t('lt.deadlineOn',gStr(keyToDate(x.deadline))))}"><svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="${R}" class="tr"/><circle cx="16" cy="16" r="${R}" class="fg" stroke-dasharray="${(C*fr).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 16 16)"/></svg><span dir="ltr">${left}</span></button>`}
function ltForDay(k){return LT().filter(x=>x.start<=k&&(x.status==='active'||x.endK===k))}
function renderLt(){const k=todayKey(),vac=isVac(k),list=ltForDay(k);
  $('#vacBtn').textContent=t('vac.btn');$('#vacBtn').classList.toggle('on',vac);$('#vacNote').textContent=vac?t('vac.on'):'';
  $('#dlBtn').innerHTML=ICON_CLOCK+`<span>${t('lt.dlBtn')}</span>`;$('#dlBtn').classList.toggle('on',!$('#ltOpts').hidden);
  $('#ltList').innerHTML=list.map(x=>{const lg=x.log&&x.log[k],fin=x.status!=='active',v=vac&&!ltOn(k,x.id)&&!lg&&!fin,pct=ltPct(x),over=x.status==='active'&&k>x.deadline&&!x.late;
    const meta=[ltMeta(x),Math.round(pct*100)+'%',lg&&lg.type==='prog'?t('lt.progToday'):'',x.status==='done'?t('lt.doneT'):'',x.status==='withdrawn'?t('lt.wdT'):''].filter(Boolean).join(' · ');
    return`<li class="task lt ${lg&&lg.type==='prog'?'prog':''} ${x.status==='done'?'done':''} ${x.status==='withdrawn'?'wd':''} ${v?'vac':''}" data-lt="${x.id}"><button class="ck">${lg&&lg.type==='prog'?ICON_UP:ICON_CHECK}</button><div class="tb"><span class="tx" dir="auto">${esc(x.text)}</span><div class="ltbar"><i style="width:${(pct*100).toFixed(1)}%"></i></div><small class="tmeta">${esc(meta)}</small>${over?`<div class="ltlate"><span>${t('lt.overdue')}</span><button class="btn sm" data-ext>${t('lt.extend')}</button><button class="btn sm" data-late>${t('lt.goLate')}</button><button class="btn sm ghost danger" data-wd>${t('lt.withdraw')}</button></div>`:''}${v?`<button class="link vacon" data-von>${t('lt.workAnyway')}</button>`:''}</div>${fin?'':ltRing(x,k)}</li>`}).join('');
  $$('#ltList .lt').forEach(li=>{const x=LT().find(q=>q.id===li.dataset.lt);
    li.querySelector('.ck').onclick=()=>openLt(x,'check');li.querySelector('.tx').onclick=()=>openLt(x,'edit');
    const r=li.querySelector('.ltring');if(r)r.onclick=()=>openLt(x,'edit');
    const q=s=>li.querySelector(s);if(q('[data-ext]')){q('[data-ext]').onclick=()=>openLt(x,'extend');q('[data-late]').onclick=()=>{x.late=true;save();renderLt()};q('[data-wd]').onclick=()=>ltWithdraw(x)}
    if(q('[data-von]'))q('[data-von]').onclick=()=>{S.vacOn=S.vacOn||{};(S.vacOn[k]=S.vacOn[k]||{})[x.id]=1;save();renderLt()}});
  list.forEach(x=>{if(x.status==='active'&&k>x.deadline&&!x.late&&!S.notified['lt-'+k+'-'+x.id]){S.notified['lt-'+k+'-'+x.id]=1;save();setTimeout(()=>alertUser(t('lt.overdueT'),t('lt.overdueB',x.text),ICON_CLOCK),800)}})}
function ltSnap(x){return JSON.parse(JSON.stringify(x.prog||{ch:0,pj:0,pct:0}))}
function ltFinish(x){const k=todayKey();x.log=x.log||{};const before=x.log[k]?x.log[k].before:ltSnap(x);if(x.cps&&x.cps.length)x.prog={ch:x.cps.length,pj:0,pct:0};else x.prog={pct:100};
  x.status='done';x.endK=k;x.log[k]={type:'done',before,pa:ltPct({cps:x.cps,prog:before})};save();closeLt();renderLt();chime(1);toast(t('lt.finishedToast',x.text));if(curView()==='cal')renderCal()}
function ltWithdraw(x){if(!confirm(t('lt.wdQ',x.text,Math.round(ltPct(x)*100)+'%')))return;const k=todayKey();x.status='withdrawn';x.endK=k;x.log=x.log||{};x.log[k]=Object.assign({},x.log[k]||{},{type:'wd',at:ltPct(x)});save();closeLt();renderLt();if(curView()==='cal')renderCal()}
function closeLt(){$('#ltModal').classList.remove('on')}
$('#ltModal').onclick=e=>{if(e.target.id==='ltModal')closeLt()};
function ltEditor(x){const cps=x.cps||[],p=ltSnap(x);
  if(!cps.length)return`<div class="ltf"><label>${t('lt.pctAll')} <b id="lpV">${Math.round(p.pct||0)}%</b></label><input type="range" id="lpPct" min="0" max="100" step="1" value="${Math.round(p.pct||0)}"></div>`;
  return`<div class="ltf"><label>${t('lt.chDone')}</label><div class="stp"><button data-d="-1" data-f="ch">−</button><b id="lpCh">${p.ch||0}</b><span>/ ${cps.length}</span><button data-d="1" data-f="ch">+</button></div></div><div class="ltf" id="lpIn"></div>`}
function wireEditor(x){const cps=x.cps||[],p=ltSnap(x);x._draft=p;
  if(!cps.length){const r=$('#lpPct');r.oninput=()=>{p.pct=+r.value;$('#lpV').textContent=r.value+'%'};return}
  const inner=()=>{const c=p.ch||0,el=$('#lpIn');if(c>=cps.length){el.innerHTML=`<small class="muted">${t('lt.allCh',cps.length)}</small>`;return}
    if(cps[c]>0){p.pj=Math.min(p.pj||0,cps[c]);el.innerHTML=`<label>${t('lt.pjDone',c+1)}</label><div class="stp"><button data-d="-1" data-f="pj">−</button><b>${p.pj||0}</b><span>/ ${cps[c]}</span><button data-d="1" data-f="pj">+</button></div>`}
    else el.innerHTML=`<label>${t('lt.pctIn',c+1)} <b id="lpV">${Math.round(p.pct||0)}%</b></label><input type="range" id="lpPct" min="0" max="100" value="${Math.round(p.pct||0)}">`;
    el.querySelectorAll('[data-d]').forEach(b=>b.onclick=step);const r=$('#lpPct');if(r)r.oninput=()=>{p.pct=+r.value;$('#lpV').textContent=r.value+'%'}};
  const step=e=>{const b=e.currentTarget,d=+b.dataset.d;if(b.dataset.f==='ch'){const n=Math.max(0,Math.min(cps.length,(p.ch||0)+d));if(n!==p.ch){p.ch=n;p.pj=0;p.pct=0}$('#lpCh').textContent=p.ch}else{p.pj=Math.max(0,Math.min(cps[p.ch],(p.pj||0)+d))}inner()};
  $$('#ltBox .ltf [data-f=ch]').forEach(b=>b.onclick=step);inner()}
function ltSaveProg(x){const k=todayKey();x.log=x.log||{};const before=x.log[k]&&x.log[k].before?x.log[k].before:ltSnap(x);x.prog=x._draft;delete x._draft;
  const note=($('#lpNote')||{}).value||'';if(ltPct(x)>=1){ltFinish(x);return}
  x.log[k]={type:'prog',before,pa:ltPct({cps:x.cps,prog:before}),pb:ltPct(x),note:note.trim()};save();closeLt();renderLt();chimeSoft(1175);if(curView()==='cal')renderCal()}
function openLt(x,mode){const k=todayKey(),box=$('#ltBox'),lg=x.log&&x.log[k];let h=`<h2 dir="auto">${esc(x.text)}</h2><div class="ltsub">${esc([ltMeta(x),Math.round(ltPct(x)*100)+'%',t('lt.deadlineOn',gStr(keyToDate(x.deadline)))].filter(Boolean).join(' · '))}</div>`;
  if(mode==='check'){
    if(x.status==='done'){h+=`<p>${t('lt.doneTodayQ')}</p><div class="ltact"><button class="btn" id="lReopen">${t('lt.reopen')}</button><button class="btn ghost" id="lCancel">${t('lt.cancel')}</button></div>`}
    else if(x.status==='withdrawn'){h+=`<p>${t('lt.wdT')}</p><div class="ltact"><button class="btn" id="lReopen">${t('lt.reopen')}</button><button class="btn ghost" id="lCancel">${t('lt.cancel')}</button></div>`}
    else if(lg&&lg.type==='prog'){h+=`<p>${t('lt.loggedToday')}</p>${ltEditor(x)}<input class="in" id="lpNote" dir="auto" placeholder="${esc(t('lt.note'))}" value="${esc(lg.note||'')}"><div class="ltact"><button class="btn pri" id="lSave">${t('lt.save')}</button><button class="btn" id="lFin">✓ ${t('lt.finished')}</button><button class="btn ghost danger" id="lUnlog">${t('lt.unlog')}</button></div>`}
    else h+=`<p class="ltq">${t('lt.q')}</p><div class="ltchoice"><button class="btn" id="lFin">✓ ${t('lt.finished')}</button><button class="btn pri" id="lProg">${ICON_UP} ${t('lt.progressed')}</button></div><div id="lpWrap" hidden>${ltEditor(x)}<input class="in" id="lpNote" dir="auto" placeholder="${esc(t('lt.note'))}"><div class="ltact"><button class="btn pri" id="lSave">${t('lt.save')}</button><button class="btn ghost" id="lCancel">${t('lt.cancel')}</button></div></div>`}
  else if(mode==='extend'){h+=`<p>${t('lt.extT')}</p><div class="ltf"><label>${t('lt.newDl')}</label><input type="date" class="in" id="lNewDl" min="${k}" value="${dKey(addDays(keyToDate(x.deadline<k?k:x.deadline),7))}"></div><div class="ltact"><button class="btn pri" id="lExt">${t('lt.extend')}</button><button class="btn ghost" id="lCancel">${t('lt.cancel')}</button></div>`}
  else{const cps=x.cps||[],uni=cps.length&&cps.every(v=>v===cps[0]);h+=`<div class="ltform"><label>${t('lt.name')}<input class="in" id="eTx" dir="auto" value="${esc(x.text)}"></label><label>${t('lt.dl')}<input type="date" class="in" id="eDl" value="${x.deadline}"></label><label>${t('lt.chN')}<input type="number" class="in" id="eCh" min="0" max="500" value="${cps.length||''}"></label><label>${t('lt.pj')}<input class="in" id="ePj" dir="ltr" value="${cps.length?(uni?cps[0]:cps.join(',')):''}"></label></div><div class="ltact"><button class="btn pri" id="eSave">${t('q.save')}</button>${x.status==='active'?`<button class="btn" id="eWd">${t('lt.withdraw')}</button>`:''}<button class="btn ghost danger" id="eDel">${t('lt.del')}</button></div>`}
  box.innerHTML=h;$('#ltModal').classList.add('on');
  const on=(id,f)=>{const e=$('#'+id);if(e)e.onclick=f};
  on('lCancel',closeLt);on('lFin',()=>ltFinish(x));
  on('lProg',()=>{$('#lpWrap').hidden=false;$('.ltchoice').hidden=true;wireEditor(x)});
  if(lg&&lg.type==='prog'&&mode==='check'&&x.status==='active')wireEditor(x);
  on('lSave',()=>ltSaveProg(x));
  on('lUnlog',()=>{x.prog=lg.before||x.prog;delete x.log[k];save();closeLt();renderLt()});
  on('lReopen',()=>{if(lg&&lg.before&&x.status==='done')x.prog=lg.before;x.status='active';delete x.endK;if(lg&&(lg.type==='done'||lg.type==='wd'))delete x.log[k];save();closeLt();renderLt()});
  on('lExt',()=>{const v=$('#lNewDl').value;if(!v||v<k)return;(x.ext=x.ext||[]).push({from:x.deadline,to:v,at:k});x.deadline=v;x.late=false;save();closeLt();renderLt();toast(t('lt.extended',gStr(keyToDate(v))))});
  on('eSave',()=>{const tx=$('#eTx').value.trim(),dl=$('#eDl').value;if(tx)x.text=tx;if(dl){if(dl!==x.deadline&&dl>x.deadline)x.late=false;x.deadline=dl}
    const nc=parseCps($('#eCh').value,$('#ePj').value);if(JSON.stringify(nc)!==JSON.stringify(x.cps||[])){const old=ltPct(x);x.cps=nc;const p=x.prog||{};if(nc.length){p.ch=Math.min(p.ch||0,nc.length);if(nc[p.ch]>0)p.pj=Math.min(p.pj||0,nc[p.ch])}else p.pct=Math.round(old*100);x.prog=p}
    save();closeLt();renderLt()});
  on('eWd',()=>ltWithdraw(x));
  on('eDel',()=>{if(!confirm(t('lt.delQ')))return;S.ltasks=LT().filter(q=>q!==x);save();closeLt();renderLt();if(curView()==='cal')renderCal()});}
function renderLtOpts(){const o=$('#ltOpts'),tk=todayKey();o.innerHTML=`<div class="ltform in3"><label>${t('lt.dl')}<input type="date" class="in" id="nDl" min="${tk}" value="${dKey(addDays(keyToDate(tk),14))}"></label><label>${t('lt.chN')}<input type="number" class="in" id="nCh" min="0" max="500" placeholder="—"></label><label>${t('lt.pj')}<input class="in" id="nPj" dir="ltr" placeholder="3 / 3,2,4"></label></div><small>${t('lt.optsHint')}</small>`}
$('#dlBtn').onclick=()=>{const o=$('#ltOpts');o.hidden=!o.hidden;if(!o.hidden)renderLtOpts();renderLt();$('#taskIn').focus()};
$('#vacBtn').onclick=()=>{const k=todayKey();S.vac=S.vac||{};if(S.vac[k])delete S.vac[k];else S.vac[k]=1;save();renderLt();if(curView()==='cal')renderCal()};
function ltAddFromForm(text){const dl=$('#nDl').value,tk=todayKey();if(!dl||dl<tk){toast(t('lt.needDl'));return false}
  LT().push({id:uid(),text,start:tk,deadline:dl,status:'active',cps:parseCps($('#nCh').value,$('#nPj').value),prog:{ch:0,pj:0,pct:0},log:{},created:Date.now()});
  $('#ltOpts').hidden=true;save();renderLt();toast(t('lt.added',gStr(keyToDate(dl))));return true}
function setVacRange(keys,on){S.vac=S.vac||{};keys.forEach(k=>{if(on)S.vac[k]=1;else delete S.vac[k]});save();renderCal();renderLt()}
function ltDayHTML(k){const rows=[];LT().forEach(x=>{const lg=x.log&&x.log[k];
    if(lg){if(lg.type==='prog')rows.push(`<li class="ltlog"><span>↑</span><div>${esc(t('lt.logProg',x.text,Math.round((lg.pa||0)*100),Math.round((lg.pb||0)*100)))}${lg.note?`<small class="tmeta" dir="auto">${esc(lg.note)}</small>`:''}</div></li>`);
      else if(lg.type==='done')rows.push(`<li>✓ ${esc(t('lt.logDone',x.text))}</li>`);else if(lg.type==='wd')rows.push(`<li>⤫ ${esc(t('lt.logWd',x.text,Math.round((lg.at||0)*100)))}</li>`)}
    if(x.deadline===k&&x.status==='active')rows.push(`<li>⏱ ${esc(t('lt.dueHere',x.text))}</li>`)});
  return rows.length?`<div class="sec"><b>${t('lt.sec')}</b><ul>${rows.join('')}</ul></div>`:''}
function renderTasks(){renderLt();const tk=todayKey(),d=day(tk),el=$('#tasks');const list=[...d.tasks.filter(x=>!x.done),...d.tasks.filter(x=>x.done)];
  el.innerHTML=list.length?list.map(x=>`<li class="task ${x.done?'done':''}" data-id="${x.id}"><button class="ck">${ICON_CHECK}</button><div class="tb"><span class="tx" contenteditable="true" spellcheck="false" dir="auto">${esc(x.text)}</span>${taskMeta(x)}</div>${x.done&&x.doneAt?`<span class="t">${fmtT(x.doneAt)}</span>`:''}${x.done?'':`<button class="pp" title="${t('tk.pp')}">${ICON_PP}</button>`}<button class="del">✕</button></li>`).join(''):`<div class="empty">${t('tasks.empty')}</div>`;
  const dn=d.tasks.filter(x=>x.done).length;$('#taskCount').textContent=d.tasks.length?dn+' / '+d.tasks.length:'';
  $$('#tasks .task').forEach(li=>{const x=d.tasks.find(q=>q.id===li.dataset.id);
    li.querySelector('.ck').onclick=()=>{x.done=!x.done;x.doneAt=x.done?Date.now():null;save();renderTasks();if(x.done)chimeSoft()};
    li.querySelector('.del').onclick=()=>{d.tasks=d.tasks.filter(q=>q!==x);if(x.from){const o=S.days[x.from]&&S.days[x.from].tasks.find(q=>q.id===x.fromId);if(o&&o.pp)o.pp=o.pp.filter(q=>q.id!==x.id)}save();renderTasks()};
    const pb=li.querySelector('.pp');if(pb)pb.onclick=()=>openPP(pb,tk,x.id);
    const tx=li.querySelector('.tx');tx.onblur=()=>{const v=tx.textContent.trim();if(v){x.text=v;save()}else tx.textContent=x.text};
    tx.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();tx.blur()}};});
  const ms=missedTasks(),mEl=$('#missed');
  mEl.innerHTML=ms.length?`<div class="mh">${t('tk.missed')} <span>${ms.length}</span></div><ul>${ms.map(({k,x})=>`<li data-k="${k}" data-id="${x.id}"><span class="nt">${t('tk.not')}</span><div class="tb"><span class="tx" dir="auto">${esc(x.text)}</span><small class="tmeta">${esc(dayLabel(k))}</small></div><button class="btn sm" data-pp>${ICON_PP}${t('tk.pp')}</button><button class="del" data-dis title="${t('tk.dismiss')}">✕</button></li>`).join('')}</ul>`:'';
  mEl.querySelectorAll('li').forEach(li=>{const k=li.dataset.k,id=li.dataset.id;li.querySelector('[data-pp]').onclick=e=>openPP(e.currentTarget,k,id);
    li.querySelector('[data-dis]').onclick=()=>{const x=S.days[k].tasks.find(q=>q.id===id);if(x){x.dismissed=true;save();renderTasks()}}});}
function addTask(){const v=$('#taskIn').value.trim();if(!v)return;if(!$('#ltOpts').hidden){if(ltAddFromForm(v))$('#taskIn').value='';return}day(todayKey()).tasks.push({id:uid(),text:v,done:false,created:Date.now()});$('#taskIn').value='';save();renderTasks()}
$('#taskAdd').onclick=addTask;$('#taskIn').onkeydown=e=>{if(e.key==='Enter')addTask()};
$('#summary').oninput=e=>{day(todayKey()).summary=e.target.value;save()};

