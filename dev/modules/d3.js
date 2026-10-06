/* ============ v3.3 productivity: task menu (frog, time, note, doing), what-now, kanban, distractions, gaps, best hours, block to next prayer, project deadlines, ICS import, paste tasks, light day, monthly review, yearly goals ============ */
/* task menu */
function tkMenu(btn,k,id){const d=day(k),x=d.tasks.find(q=>q.id===id);if(!x)return;const r=btn.getBoundingClientRect();
  const p=qPopAt(`<div class="aymh">${esc(x.text.slice(0,40))}</div>
    <button data-tm="frog">🐸 ${x.frog?t('tk3.unfrog'):t('tk3.frog')}</button>
    <button data-tm="doing">🔄 ${x.doing?t('tk3.undoing'):t('tk3.doing')}</button>
    <button data-tm="at">⏰ ${x.at?t('tk3.atIs',x.at):t('tk3.at')}</button>
    <button data-tm="note">📝 ${x.note?t('tk3.openNote'):t('tk3.note')}</button>`,r.left+r.width/2,r.bottom-8,'aymenu');
  const on=(k2,f)=>{const b=p.querySelector(`[data-tm=${k2}]`);if(b)b.onclick=()=>{closePP();f()}};
  on('frog',()=>{d.tasks.forEach(q=>{if(q!==x)q.frog=false});x.frog=!x.frog;save();renderTasks();if(x.frog)toast(t('tk3.frogSet'))});
  on('doing',()=>{x.doing=!x.doing;save();renderTasks()});
  on('at',()=>{const v=prompt(t('tk3.atAsk'),x.at||'');if(v==null)return;const m=v.trim().match(/^(\d{1,2})[:.](\d{2})$/);x.at=m?String(+m[1]).padStart(2,'0')+':'+m[2]:'';save();renderTasks();if(ANDROID)setTimeout(androidSchedule,100)});
  on('note',()=>{const n=x.note&&NOTES().find(q=>q.id===x.note);if(n){openNote(n.id);return}openNote(null,k);NE.title=x.text;NE.task=x.id;renderNoteEd();const sv=setInterval(()=>{if(!$('#noteModal').classList.contains('on')){clearInterval(sv);const nn=NOTES().slice().sort((a,b)=>(b.created||0)-(a.created||0))[0];if(nn&&nn.title===x.text&&!x.note){x.note=nn.id;save();renderTasks()}}},500)})}
{const _rt3=renderTasks;renderTasks=function(){_rt3();const tk=todayKey(),d=day(tk);
  $$('#tasks .task').forEach(li=>{const x=d.tasks.find(q=>q.id===li.dataset.id);if(!x)return;
    const tb=li.querySelector('.tb');if(tb){let b='';if(x.frog)b+=`<span class="tk3 frog">🐸</span>`;if(x.doing&&!x.done)b+=`<span class="tk3 doing">🔄 ${t('tk3.doingB')}</span>`;if(x.at)b+=`<span class="tk3">⏰ ${x.at}</span>`;if(x.note)b+=`<span class="tk3 nt" data-nt>📝</span>`;if(b)tb.insertAdjacentHTML('beforeend',`<div class="tk3row">${b}</div>`);const nb=tb.querySelector('[data-nt]');if(nb)nb.onclick=e=>{e.stopPropagation();openNote(x.note)}}
    if(!li.querySelector('.tkm')){const del=li.querySelector('.del');if(del)del.insertAdjacentHTML('beforebegin',`<button class="tkm" title="${t('tk3.more')}">⋯</button>`);const m=li.querySelector('.tkm');if(m)m.onclick=e=>{e.stopPropagation();tkMenu(m,tk,x.id)}}
    if(x.frog&&!x.done)li.classList.add('isfrog')});
  /* frog first among open tasks */
  const ul=$('#tasks'),fr=ul&&ul.querySelector('.task.isfrog');if(fr&&ul.firstElementChild!==fr)ul.prepend(fr);
  renderKanban()}}
/* 46. kanban view of today's tasks */
function renderKanban(){const box=$('#tasks');if(!box)return;const on=!!S.settings.tkKanban;box.classList.toggle('hiddenk',on);let kb=$('#tkKan');if(!on){if(kb)kb.remove();return}
  if(!kb){box.insertAdjacentHTML('afterend','<div class="tkkan" id="tkKan"></div>');kb=$('#tkKan')}const d=day(todayKey()),cols=[['todo',d.tasks.filter(x=>!x.done&&!x.doing)],['doing',d.tasks.filter(x=>!x.done&&x.doing)],['done',d.tasks.filter(x=>x.done)]];
  kb.innerHTML=cols.map(([c,L_])=>`<div class="kcol" data-col="${c}"><h4>${t('kb3.'+c)} <small>${L_.length}</small></h4>${L_.map(x=>`<div class="kcard" draggable="true" data-id="${x.id}" dir="auto">${x.frog?'🐸 ':''}${esc(x.text)}</div>`).join('')}</div>`).join('');
  const move=(id,col)=>{const x=d.tasks.find(q=>q.id===id);if(!x)return;x.done=col==='done';x.doneAt=x.done?(x.doneAt||Date.now()):null;x.doing=col==='doing';save();renderTasks();if(x.done)chimeSoft()};
  kb.querySelectorAll('.kcard').forEach(c=>{c.ondragstart=e=>{e.dataTransfer.setData('text/plain',c.dataset.id)};c.onclick=()=>{const x=d.tasks.find(q=>q.id===c.dataset.id);const nx=x.done?'todo':x.doing?'done':'doing';move(c.dataset.id,nx)}});
  kb.querySelectorAll('.kcol').forEach(col=>{col.ondragover=e=>e.preventDefault();col.ondrop=e=>{e.preventDefault();move(e.dataTransfer.getData('text/plain'),col.dataset.col)}})}
{const th=$('#taskCount');if(th&&!$('#kanBtn')){th.insertAdjacentHTML('beforebegin',`<button class="chip sm" id="nowBtn" title="">🎯</button><button class="chip sm" id="kanBtn">▦</button><button class="chip sm" id="lightTg">🍃</button>`);$('#lightTg').onclick=lightToggle;
  $('#kanBtn').onclick=()=>{S.settings.tkKanban=!S.settings.tkKanban;save();renderTasks()};$('#nowBtn').onclick=whatNow}}
/* 42. what should I do now? */
function whatNow(){const d=day(todayKey()),open=d.tasks.filter(x=>!x.done);if(!open.length){toast(t('wn3.none'));return}
  const nowHM=new Date().toTimeString().slice(0,5);let pick=open.find(x=>x.frog)||open.filter(x=>x.at&&x.at<=nowHM).sort((a,b)=>a.at.localeCompare(b.at))[0]||open.find(x=>x.doing)||open.slice().sort((a,b)=>(b.carry||0)-(a.carry||0)||(a.created||0)-(b.created||0))[0];
  const nx=nextPrayer(),mins=nx?Math.max(0,Math.round((nx.t-Date.now())/6e4)):null;
  openInfo('🎯 '+t('wn3.t'),`<div class="wn3"><b dir="auto">${pick.frog?'🐸 ':''}${esc(pick.text)}</b>${mins!=null?`<small>${t('wn3.until',t('pr.'+nx.k),fmtHM(mins*6e4))}</small>`:''}</div><p class="muted">${t(pick.frog?'wn3.whyFrog':pick.doing?'wn3.whyDoing':'wn3.why')}</p><button class="btn pri" id="wnGo">▶ ${t('wn3.go')}</button>`);
  $('#wnGo').onclick=()=>{$$('.modal.on').forEach(m=>m.classList.remove('on'));pick.doing=true;save();renderTasks();try{const tb=[...$$('#tasks .task')].find(li=>li.dataset.id===pick.id);const pl=tb&&tb.querySelector('.tplay,.tstart,[data-start]');if(pl){pl.click();return}}catch(e){}if(S.timer.mode!=='work'){const sb=$('#tBtns .btn.pri');if(sb)sb.click()}}}
/* 37. tasks with a time: reminder */
{const _ex3=extraSched;extraSched=function(out,now){_ex3(out,now);try{const k=todayKey();(day(k).tasks||[]).forEach((x,i)=>{if(x.done||!x.at)return;const at=atTime(keyToDate(k),x.at);if(at>now)out.push({id:6600+i,t:at,title:'⏰ '+x.text,body:t('tk3.atRem'),open:'today'})})}catch(e){}}}
setInterval(()=>{if(ANDROID)return;const k=todayKey(),hm=new Date().toTimeString().slice(0,5),A=S.atFired||(S.atFired={});(day(k).tasks||[]).forEach(x=>{if(x.done||!x.at||x.at!==hm||A[k+x.id])return;A[k+x.id]=1;save();alertUser('⏰ '+x.text,t('tk3.atRem'))})},20000);
/* 49. paste several lines → several tasks */
{const ti=$('#taskIn');if(ti)ti.addEventListener('paste',e=>{const tx=(e.clipboardData||window.clipboardData).getData('text');const lines=tx.split(/\r?\n/).map(s=>s.replace(/^\s*([-*•▪◦]|\d+[.)]|\[ ?[xX]?\])\s*/,'').trim()).filter(Boolean);if(lines.length<2)return;e.preventDefault();const d=day(todayKey());lines.forEach(v=>d.tasks.push({id:uid(),text:v,done:false,created:Date.now()}));save();renderTasks();toast(t('ps3.added',lines.length))})}
/* 43. distractions during a work session */
function distrAdd(){const T=S.timer;if(T.mode!=='work')return;T.distr=(T.distr||0)+1;const d=day(todayKey());d.distr=(d.distr||0)+1;save();vib(10);toast(t('ds3.added',d.distr));renderDistrBtn()}
function renderDistrBtn(){let b=$('#distrBtn');const on=S.timer&&S.timer.mode==='work'&&S.settings.distrOn!==false;if(!on){if(b)b.parentElement.remove();return}
  if(!b){const anchor=$('#tState');if(!anchor)return;anchor.insertAdjacentHTML('afterend',`<div class="distrw"><button class="btn sm ghost" id="distrBtn"></button></div>`);b=$('#distrBtn');b.onclick=distrAdd}
  b.textContent='⚡ '+t('ds3.btn')+((S.days[todayKey()]||{}).distr?' · '+S.days[todayKey()].distr:'')}
setInterval(renderDistrBtn,3000);
/* 34 + 44. best focus hours and unlogged gaps (brief) */
function bestHours(){const H=Array(24).fill(0),tk=todayKey();for(let i=0;i<30;i++){const d=S.days[dKey(addDays(keyToDate(tk),-i))];(d&&d.sessions||[]).forEach(s=>{let a=s.start;while(a<s.end){const h=new Date(a).getHours(),nx=Math.min(s.end,new Date(a).setMinutes(60,0,0));H[h]+=nx-a;a=nx}})}
  let best=-1,bv=0;for(let h=0;h<23;h++){const v=H[h]+H[h+1];if(v>bv){bv=v;best=h}}return bv>36e5?best:-1}
function dayGaps(k){const ss=(S.days[k]&&S.days[k].sessions||[]).slice().sort((a,b)=>a.start-b.start);if(ss.length<2)return 0;const pt=prayerTimes(keyToDate(k));let g=0;for(let i=1;i<ss.length;i++){let gap=ss[i].start-ss[i-1].end;if(gap<=0)continue;PRAYERS.forEach(p=>{if(pt[p]>=ss[i-1].end&&pt[p]<=ss[i].start)gap-=25*6e4});if(gap>15*6e4)g+=gap}return Math.max(0,g)}
{const _rbI=renderBrief;renderBrief=function(){_rbI();try{const box=$('#bHours')||$('#v-brief .card');if(!box||$('#insight3'))return;const bh=bestHours(),keys=periodKeys(bMode,bAnchor).filter(k=>k<=todayKey()),gaps=keys.reduce((a,k)=>a+dayGaps(k),0),dis=keys.reduce((a,k)=>a+((S.days[k]||{}).distr||0),0);
  let h='';if(bh>=0)h+=`<div>⏰ ${t('bh3',String(bh).padStart(2,'0')+':00',String(bh+2).padStart(2,'0')+':00')}</div>`;if(gaps>30*6e4)h+=`<div>🕳 ${t('gp3',fmtHM(gaps))}</div>`;if(dis)h+=`<div>⚡ ${t('ds3.brief',dis)}</div>`;
  if(h)box.insertAdjacentHTML('afterend',`<div class="card insight3" id="insight3"><h3>${t('in3.t')}</h3>${h}</div>`)}catch(e){console.error(e)}}}
/* 35. the block until the next prayer */
{const _rpB=renderPrayers;renderPrayers=function(){_rpB();try{const nx=nextPrayer();if(!nx)return;const m=Math.round((nx.t-Date.now())/6e4);if(m<20||m>360)return;const ses=Math.floor(m/30),nl=$('#nextLine');if(nl&&!nl.querySelector('.blk3'))nl.insertAdjacentHTML('beforeend',` <span class="blk3">· ${t('blk3',ses)}</span>`)}catch(e){}}}
/* 45. project deadlines */
function pjDue(){return PJ().filter(p=>!p.arch&&p.due).map(p=>({p,days:Math.round((keyToDate(p.due)-keyToDate(todayKey()))/864e5)})).filter(x=>x.days>=0&&x.days<=21).sort((a,b)=>a.days-b.days)}
{const _rte9=renderTodayEv;renderTodayEv=function(){_rte9();const box=$('#todayEv');if(!box)return;const L_=pjDue();if(!L_.length)return;box.insertAdjacentHTML('beforeend',L_.slice(0,3).map(x=>`<span class="evchip ${x.days<=3?'big':''}" style="--c:${x.days<=3?'#ef4444':'#64748b'}" data-pjd="${x.p.id}"><i></i>📁 ${esc(x.p.name)} · ${x.days?t('pd3.in',x.days):t('pd3.today')}</span>`).join(''));box.querySelectorAll('[data-pjd]').forEach(c=>c.onclick=()=>openProjects())}}
function openPjDue(){const L_=PJ().filter(p=>!p.arch);if(!L_.length){toast(t('pj.empty'));return}openInfo('📁 '+t('pd3.t'),`<p class="muted" style="margin:0 0 8px">${t('pd3.sub')}</p>${L_.map(p=>`<div class="field"><div><label>${esc(p.name)}</label></div><input class="in" type="date" data-pd="${p.id}" value="${p.due||''}" style="width:160px"></div>`).join('')}`);
  $$('[data-pd]').forEach(i=>i.onchange=()=>{const p=pjOf(i.dataset.pd);if(p){p.due=i.value||null;save();renderTodayEv()}})}
/* 48. import events from an .ics file */
function icsUnfold3(s){return s.replace(/\r?\n[ \t]/g,'')}
function icsParse3(txt){const out=[];const ev=icsUnfold3(txt).split(/BEGIN:VEVENT/).slice(1);ev.forEach(b=>{const g=k=>{const m=b.match(new RegExp('^'+k+'(?:;[^:\\n]*)?:(.*)$','m'));return m?m[1].trim():''};const ds=g('DTSTART');if(!ds)return;const m=ds.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2}))?(Z)?/);if(!m)return;let date=`${m[1]}-${m[2]}-${m[3]}`,time='';
  if(m[4]){if(m[6]){const d=new Date(Date.UTC(+m[1],+m[2]-1,+m[3],+m[4],+m[5]));date=dKey(d);time=d.toTimeString().slice(0,5)}else time=`${m[4]}:${m[5]}`}
  const rr=g('RRULE');const rep=/FREQ=YEARLY/.test(rr)?'yearly':/FREQ=WEEKLY/.test(rr)?'weekly':/FREQ=MONTHLY/.test(rr)?'monthly':/FREQ=DAILY/.test(rr)?'daily':'';
  out.push({title:g('SUMMARY').replace(/\\,/g,',').replace(/\\n/g,' ')||'—',date,time,notes:g('DESCRIPTION').replace(/\\n/g,'\n').replace(/\\,/g,',').slice(0,500),rep})});return out}
function icsImport(){const inp=document.createElement('input');inp.type='file';inp.accept='.ics,text/calendar';inp.onchange=async()=>{const f=inp.files[0];if(!f)return;const L_=icsParse3(await f.text());let n=0;const ex=new Set(EVS().map(e=>e.title+'|'+e.date+'|'+e.time));
  L_.forEach(e=>{if(ex.has(e.title+'|'+e.date+'|'+e.time))return;EVS().push({id:uid(),title:e.title,date:e.date,time:e.time,end:'',color:'#0ea5e9',rep:e.rep||'none',rem:null,notes:e.notes,big:false});n++});save();toast(t('ics3.done',n));try{renderCal()}catch(x){}renderTodayEv()};inp.click()}
/* 50. a light day: half the goal, the streak is kept */
{const _gm=goalMs;goalMs=function(k){const v=_gm(k);return S.days[k]&&S.days[k].light?v/2:v}}
function lightToggle(){const d=day(todayKey());d.light=!d.light;save();toast(d.light?t('lt3.on'):t('lt3.off'));try{renderGlass();renderToday()}catch(e){}}
{const _rte10=renderTodayEv;renderTodayEv=function(){_rte10();const box=$('#todayEv');if(!box)return;const d=S.days[todayKey()]||{};if(d.light){box.insertAdjacentHTML('afterbegin',`<span class="evchip" data-lt3 style="--c:#22c55e"><i></i>🍃 ${t('lt3.chip')}</span>`);box.querySelector('[data-lt3]').onclick=lightToggle}}}
/* 51. monthly review */
function openMonthReview(ym){const now=new Date();ym=ym||dKey(new Date(now.getFullYear(),now.getMonth()-(now.getDate()<8?1:0),1)).slice(0,7);const [y,m]=ym.split('-').map(Number),keys=periodKeys('month',new Date(y,m-1,1)),st=periodStats(keys),R=(S.mrev=S.mrev||{})[ym]||{};
  openInfo('🗓 '+t('mr3.t',L().months[m-1]+' '+y),`<div class="pmstat"><div><b>${fmtHM(st.tot)}</b><small>${t('mr3.work')}</small></div><div><b>${st.gold}</b><small>${t('mr3.gold')}</small></div><div><b>${st.tasksDone}</b><small>${t('mr3.tasks')}</small></div><div><b>${onTimePct(keys)??'—'}%</b><small>${t('mr3.pray')}</small></div></div>
   ${['win','lesson','next'].map(q=>`<div class="field" style="flex-direction:column;align-items:stretch"><label>${t('mr3.'+q)}</label><textarea class="in" rows="2" data-mr="${q}" dir="auto">${esc(R[q]||'')}</textarea></div>`).join('')}`);
  $$('[data-mr]').forEach(a=>a.oninput=()=>{const o=S.mrev[ym]||(S.mrev[ym]={});o[a.dataset.mr]=a.value;o.at=Date.now();save()})}
setTimeout(()=>{try{const now=new Date();if(now.getDate()>3||!S.setupDone||S.settings.mrevOn===false)return;const ym=dKey(new Date(now.getFullYear(),now.getMonth()-1,1)).slice(0,7);if((S.mrev||{})[ym]||S.mrevAsked===ym)return;S.mrevAsked=ym;save();toastAct(t('mr3.ask'),t('mr3.open'),()=>openMonthReview(ym),30000)}catch(e){}},15000);
/* 52. yearly goals broken into quarters and months */
function YG(){const y=String(new Date().getFullYear());S.ygoals=S.ygoals||{};return S.ygoals[y]||(S.ygoals[y]=[])}
function openYearGoals(){const L_=YG(),now=new Date(),frac=(now.getMonth()+now.getDate()/31)/12;
  const row=g=>{const exp=Math.round(g.target*frac),pct=Math.min(100,Math.round(g.done/g.target*100)),ok=g.done>=exp;return`<div class="yg"><div class="ygh"><b dir="auto">${esc(g.name)}</b><span>${g.done} / ${g.target} ${esc(g.unit||'')}</span></div><div class="ybar"><i style="width:${pct}%"></i><s style="inset-inline-start:${Math.round(frac*100)}%"></s></div>
    <small class="${ok?'ok':'bad'}">${ok?t('yg3.ahead'):t('yg3.behind',exp-g.done)} · ${t('yg3.per',Math.ceil(g.target/12),Math.ceil(g.target/4))}</small><div class="row" style="gap:6px"><button class="btn sm" data-yp="${g.id}">+1</button><button class="btn sm ghost" data-ym="${g.id}">−1</button><button class="btn sm ghost" data-yd="${g.id}">${t('del')}</button></div></div>`};
  openInfo('🎯 '+t('yg3.t',now.getFullYear()),`${L_.map(row).join('')||`<p class="muted">${t('yg3.empty')}</p>`}<div class="row" style="gap:6px;margin-top:10px;flex-wrap:wrap"><input class="in" id="ygN" placeholder="${t('yg3.name')}" dir="auto" style="flex:2;min-width:140px"><input class="in num" id="ygT" type="number" min="1" placeholder="${t('yg3.target')}" style="width:90px"><input class="in" id="ygU" placeholder="${t('yg3.unit')}" style="width:90px"><button class="btn" id="ygAdd">+</button></div>`);
  const f=(a,fn)=>$$(`[${a}]`).forEach(b=>b.onclick=()=>{const g=L_.find(x=>x.id===b.getAttribute(a));if(g){fn(g);save();openYearGoals()}});
  f('data-yp',g=>g.done++);f('data-ym',g=>g.done=Math.max(0,g.done-1));f('data-yd',g=>L_.splice(L_.indexOf(g),1));
  $('#ygAdd').onclick=()=>{const n=$('#ygN').value.trim(),tg=+$('#ygT').value;if(!n||!(tg>0)){toast(t('yg3.need'));return}L_.push({id:uid(),name:n,target:tg,unit:$('#ygU').value.trim(),done:0});save();openYearGoals()}}
{const gl=$('#glBtn');if(gl&&!$('#ygBtn')){gl.insertAdjacentHTML('afterend',`<button class="btn sm ghost" id="ygBtn">🗓 <span>${t('yg3.btn')}</span></button><button class="btn sm ghost" id="mrBtn">📅 <span>${t('mr3.btn')}</span></button>`);$('#ygBtn').onclick=openYearGoals;$('#mrBtn').onclick=()=>openMonthReview()}}
/* settings */
function renderD3Set(){const st=S.settings;const a=$('#distrT');if(a)toggle(a,st.distrOn!==false,v=>{st.distrOn=v});const b=$('#mrevT');if(b)toggle(b,st.mrevOn!==false,v=>{st.mrevOn=v});
  const ib=$('#icsImpBtn');if(ib)ib.onclick=icsImport;const pb=$('#pjDueBtn');if(pb)pb.onclick=openPjDue;const lb=$('#lightBtn');if(lb){lb.textContent=(S.days[todayKey()]||{}).light?t('lt3.off2'):t('lt3.on2');lb.onclick=()=>{lightToggle();renderD3Set()}}}
{const _rs22=renderSettings;renderSettings=function(){_rs22();try{renderD3Set()}catch(e){console.error(e)}}}
