/* ============ 3.116 eleventh list A1 (tasks): «!» priority, streak of repeating tasks, bulk period/priority/tag, a due date, fold done tasks, copy to several days, «after the next prayer» ============ */
function tkAllIds(){const s=new Set();Object.values(S.days).forEach(d=>(d.tasks||[]).forEach(x=>s.add(x.id)));return s}
function tkPopAt(el,html){const r=el.getBoundingClientRect();return qPopAt(html,r.left+r.width/2,r.bottom-6,'aymenu tk11menu')}

/* 11th-1: a lone «!» (or «!!») in the task line = high priority */
{const _at=addTask;addTask=function(...a){const i=$('#taskIn');if(!i||!$('#ltOpts').hidden)return _at(...a);const v=i.value,re=/(^|\s)[!！]{1,2}(?=\s|$)/;if(!re.test(v))return _at(...a);
  const before=tkAllIds();i.value=v.replace(re,' ').replace(/\s+/g,' ').trim();const r=_at(...a);const k=todayKey();
  Object.entries(S.days).forEach(([dk,d])=>(d.tasks||[]).forEach(x=>{if(!before.has(x.id)){try{priSet(dk,x,1)}catch(e){x.pri=1}}}));save();try{renderTasks()}catch(e){}return r}}

/* 11th-2: a repeating task's streak (its instances done in a row, days without an instance skipped); 11th-4: due date x.due */
function tkStreak(rid,k){let n=0;const today=day(k).tasks.find(x=>x.recurId===rid);if(today&&today.done)n++;let d=addDays(keyToDate(k),-1);for(let i=0;i<400;i++){const dk=dKey(d),dd=S.days[dk];const x=dd&&(dd.tasks||[]).find(q=>q.recurId===rid);if(x){if(x.done)n++;else break}d=addDays(d,-1)}return n}
const TKD={at:-1,map:null};
function tkDueOf(x){if(!x||x.dueX)return null;if(x.due)return x.due;if(!x.fromId)return null;if(TKD.at!==S._savedAt||!TKD.map){TKD.map=new Map();Object.values(S.days).forEach(d=>(d.tasks||[]).forEach(q=>TKD.map.set(q.id,q)));TKD.at=S._savedAt}
  let q=x,g=0;while(q&&q.fromId&&!q.due&&g++<40)q=TKD.map.get(q.fromId);return q&&q.due||null}
function tkDueTxt(due,k){const n=Math.round((keyToDate(due)-keyToDate(k))/864e5);return n>1?t('tdu.left',n):n===1?t('tdu.tom'):n===0?t('tdu.today'):t('tdu.late',-n)}
function tkPaint(){const k=todayKey(),d=day(k),box=$('#tasks');if(!box)return;const sc={};
  box.querySelectorAll('.task[data-id]').forEach(li=>{const x=d.tasks.find(q=>q.id===li.dataset.id);if(!x)return;li.querySelectorAll('.tkstk,.tkdue').forEach(e=>e.remove());const tx=li.querySelector('.tx');if(!tx)return;let h='';
    if(x.recurId){const n=sc[x.recurId]??(sc[x.recurId]=tkStreak(x.recurId,k));if(n>=2)h+=`<span class="tkstk" title="${esc(t('tks.tip'))}">${esc(t('tks.n',n))}</span>`}
    const due=!x.done&&tkDueOf(x);if(due){const late=due<k;h+=`<span class="tkdue ${late?'late':due===k?'now':''}" title="${esc(t('tdu.t')+': '+due)}">${esc(tkDueTxt(due,k))}</span>`}
    if(h)tx.insertAdjacentHTML('afterend',h)});tkFoldPaint()}
{hookFn('renderTasks',()=>renderTasks,f=>{renderTasks=f},'post',function(){try{tkPaint()}catch(e){console.error(e)}})}

/* 11th-5: fold today's done tasks into one line (S.settings.tkFoldDone) */
const TKF={show:false};
function tkFoldPaint(){const box=$('#tasks');if(!box)return;box.querySelector('.tkfold')?.remove();const dn=[...box.querySelectorAll('.task.done[data-id]')];dn.forEach(li=>li.classList.remove('tkfh'));
  if(!S.settings.tkFoldDone||dn.length<2)return;if(!TKF.show)dn.forEach(li=>li.classList.add('tkfh'));
  const l=document.createElement('li');l.className='tkfold';l.innerHTML=`<button type="button">${esc(TKF.show?t('tkf.hide'):t('tkf.n',dn.length))}</button>`;l.querySelector('button').onclick=()=>{TKF.show=!TKF.show;tkFoldPaint()};
  (TKF.show?dn[dn.length-1]:dn[0]).after(l)}

/* 11th-3: the selection bar sets the period, priority or a tag of every selected task */
{hookFn('uxSelBar',()=>uxSelBar,f=>{uxSelBar=f},'post',function(){try{const bar=$('#uxSel');if(!bar||bar.querySelector('[data-a="per"]'))return;const x=bar.querySelector('[data-a="del"]');if(!x)return;
  x.insertAdjacentHTML('beforebegin',`<button class="btn sm ghost" data-a="per">🕌 ${esc(t('tkb.per'))}</button><button class="btn sm ghost" data-a="pri">${esc(t('tkb.pri'))}</button><button class="btn sm ghost" data-a="tag"># ${esc(t('tkb.tag'))}</button>`);
  const ids=()=>[...UXT.sel],k=todayKey(),done=()=>{UXT.sel.clear();UXT.selMode=false;save();renderTasks()};
  bar.querySelector('[data-a="per"]').onclick=e=>{e.stopPropagation();const p=tkPopAt(e.currentTarget,PRAYERS.map(q=>`<button data-p="${q}">${esc(t('pr.'+q))}</button>`).join('')+`<button data-p="">${esc(t('tkb.noPer'))}</button>`);
    p.querySelectorAll('[data-p]').forEach(b=>b.onclick=()=>{closePP();const d=day(k);ids().forEach(id=>{const q=d.tasks.find(z=>z.id===id);if(!q)return;if(b.dataset.p){q.after=b.dataset.p;delete q.at}else delete q.after});done()})};
  bar.querySelector('[data-a="pri"]').onclick=e=>{e.stopPropagation();const p=tkPopAt(e.currentTarget,[[1,'pri.h'],[2,'pri.n'],[3,'pri.l']].map(([v,l])=>`<button data-v="${v}">${esc(t(l))}</button>`).join(''));
    p.querySelectorAll('[data-v]').forEach(b=>b.onclick=()=>{closePP();const d=day(k);ids().forEach(id=>{const q=d.tasks.find(z=>z.id===id);if(q)priSet(k,q,+b.dataset.v)});done()})};
  bar.querySelector('[data-a="tag"]').onclick=()=>{const v=(prompt(t('tkb.tagQ'))||'').trim().replace(/^#/,'').replace(/\s+/g,'_');if(!v)return;const d=day(k);ids().forEach(id=>{const q=d.tasks.find(z=>z.id===id);if(q&&!new RegExp('(^|\\s)#'+v.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(\\s|$)').test(q.text))q.text=(q.text+' #'+v).trim()});done()}}catch(e){console.error(e)}})}

/* 11th-6 copy to days, 11th-7 after the next prayer, 11th-4 due date: three rows in the task «⋯» */
function tkCopyDays(k,id){const x=day(k).tasks.find(q=>q.id===id);if(!x)return;const sel=new Set(),base=keyToDate(todayKey());let off=0;
  const draw=()=>{const m0=new Date(base.getFullYear(),base.getMonth()+off,1),days=new Date(m0.getFullYear(),m0.getMonth()+1,0).getDate(),lead=(m0.getDay()+6)%7,tk=todayKey();
    let h=`<div class="tcph"><button class="btn sm ghost" data-m="-1">‹</button><b>${esc(L().months[m0.getMonth()]+' '+m0.getFullYear())}</b><button class="btn sm ghost" data-m="1">›</button></div><div class="tcpg">`+(L().sdays?[1,2,3,4,5,6,0].map(i=>`<i>${esc(L().sdays[i])}</i>`).join(''):'')+'<span></span>'.repeat(lead);
    for(let dd=1;dd<=days;dd++){const dk=dKey(new Date(m0.getFullYear(),m0.getMonth(),dd));h+=`<button data-k="${dk}" class="${sel.has(dk)?'on':''} ${dk===tk?'tdy':''}" ${dk<tk?'disabled':''}>${dd}</button>`}
    h+=`</div><button class="btn pri" id="tcpGo" ${sel.size?'':'disabled'}>${esc(t('tcp.go',sel.size))}</button>`;$('#tcpBox').innerHTML=h;
    $$('#tcpBox [data-m]').forEach(b=>b.onclick=()=>{off=Math.max(0,Math.min(11,off+ +b.dataset.m));draw()});$$('#tcpBox [data-k]').forEach(b=>b.onclick=()=>{const v=b.dataset.k;sel.has(v)?sel.delete(v):sel.add(v);draw()});
    $('#tcpGo').onclick=()=>{const made=[];sel.forEach(dk=>{const c={id:uid(),text:x.text,done:false,created:Date.now()};['after','at','est','pri','note','lib','bk','due'].forEach(f=>{if(x[f]!=null)c[f]=x[f]});day(dk).tasks.push(c);made.push([dk,c.id])});save();renderTasks();$$('.modal.on').forEach(m=>m.classList.remove('on'));
      toastAct(t('tcp.done',made.length),t('undo'),()=>{made.forEach(([dk,cid])=>{const d=day(dk);d.tasks=d.tasks.filter(q=>q.id!==cid)});save();renderTasks()},8000)}};
  openInfo(t('tcp.t'),`<p class="muted" dir="auto">${esc(x.text)}</p><div id="tcpBox" class="tcpbox"></div>`);draw()}
function tkNextPrayer(k,id){const d=day(k),x=d.tasks.find(q=>q.id===id);if(!x)return;const now=Date.now(),T=prayerTimes(keyToDate(k));const nx=k===todayKey()?PRAYERS.find(p=>T[p]>now):PRAYERS[0];
  if(nx){x.after=nx;delete x.at;save();renderTasks();toast(t('tnp.ok',t('pr.'+nx)));return}
  const tm=dKey(addDays(keyToDate(k),1));dmvMove(k,tm,[id]);const c=day(tm).tasks.slice().reverse().find(q=>q.text===x.text&&!q.done);if(c){c.after='fajr';delete c.at}save();renderTasks();toast(t('tnp.tom'))}
function tkDueSet(k,id){const x=day(k).tasks.find(q=>q.id===id);if(!x)return;const cur=tkDueOf(x)||'';
  openInfo(t('tdu.t'),`<div class="tdubox"><input type="date" class="in" id="tduIn" value="${cur}" min="${todayKey()}"><div class="row" style="gap:6px"><button class="btn pri" id="tduOk">${esc(t('tdu.save'))}</button>${cur?`<button class="btn ghost" id="tduX">${esc(t('tdu.clear'))}</button>`:''}</div></div>`);
  $('#tduOk').onclick=()=>{const v=$('#tduIn').value;if(v)x.due=v;else delete x.due;save();renderTasks();$$('.modal.on').forEach(m=>m.classList.remove('on'))};const c=$('#tduX');if(c)c.onclick=()=>{delete x.due;x.dueX=1;save();renderTasks();$$('.modal.on').forEach(m=>m.classList.remove('on'))}}
{const _ux=uxMenuExtras;uxMenuExtras=function(k,id,...a){const r=_ux(k,id,...a);try{const p=$('#ppPop'),x=day(k).tasks.find(q=>q.id===id);if(!p||!x||p.querySelector('[data-tk11]'))return r;
  const add=(ic,lab,fn)=>{const b=document.createElement('button');b.dataset.tk11=1;b.innerHTML=`${ic} ${esc(lab)}`;b.onclick=e=>{e.stopPropagation();closePP();fn()};p.append(b)};
  if(!x.done)add('🕌',t('tnp.b'),()=>tkNextPrayer(k,id));add('📅',tkDueOf(x)?t('tdu.change'):t('tdu.b'),()=>tkDueSet(k,id));add('⧉',t('tcp.b'),()=>tkCopyDays(k,id))}catch(e){console.error(e)}return r}}

/* settings: fold done tasks (after «autoCarry») */
{hookFn('renderSettings',()=>renderSettings,f=>{renderSettings=f},'post',function(){try{const r=$('#acrRow');if(!r||$('#tkfRow'))return;r.insertAdjacentHTML('afterend',`<div class="field" id="tkfRow"><div><label data-i18n="tkf.set">${esc(t('tkf.set'))}</label><small>${esc(t('tkf.setS'))}</small></div><button class="sw-toggle ${S.settings.tkFoldDone?'on':''}" id="tkfT"></button></div>`);
  $('#tkfT').onclick=e=>{S.settings.tkFoldDone=!S.settings.tkFoldDone;e.currentTarget.classList.toggle('on',!!S.settings.tkFoldDone);save();try{renderTasks()}catch(x){}}}catch(e){}})}
