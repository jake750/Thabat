/* ============ calendar ============ */
let calM=new Date();calM.setDate(1);let selKey=null;
function hRange(a,b){const h1=hijri(a),h2=hijri(b);if(h1.month===h2.month)return h1.month+' '+h1.year+' '+t('hijriSuffix');return h1.month+(h1.year!==h2.year?' '+h1.year:'')+' – '+h2.month+' '+h2.year+' '+t('hijriSuffix')}
function renderCal(){const y=calM.getFullYear(),m=calM.getMonth();const first=new Date(y,m,1),last=new Date(y,m+1,0);
  $('#calTtl').textContent=L().months[m]+' '+y;$('#calSub').textContent=hRange(first,last);
  const lead=(first.getDay()+6)%7;const tk=todayKey();const cells=[];
  [1,2,3,4,5,6,0].forEach(n=>cells.push(`<div class="dow">${L().days[n]}</div>`));
  for(let i=0;i<42;i++){const d=new Date(y,m,1-lead+i);if(i>=35&&d.getMonth()!==m&&d.getDay()===1)break;const k=dKey(d),hh=hijri(d),{tot}=totals(k),p=Math.min(1,tot/goalMs(k));
    const fut=k>tk,gm=!fut&&tot>=goalMs(k),g4=gm&&tot-goalMs(k)>=4*36e5;cells.push(`<button class="cell ${d.getMonth()!==m?'out':''} ${k===tk?'today':''} ${k===selKey?'sel':''} ${fut?'fut':''} ${gm?'gold':''} ${fut?'':['','q1','q2','q3'][qGlow(k)]} ${isVac(k)?'vac':''} ${!fut&&p>=.45?'fl':''}" style="--p:${p}" data-k="${k}">${isVac(k)?`<span class="vtag">${t('vac.tag')}</span>`:''}${LT().some(x=>x.deadline===k&&x.status==='active')?`<span class="dlm" title="${esc(LT().filter(x=>x.deadline===k&&x.status==='active').map(x=>x.text).join('، '))}">${ICON_CLOCK}</span>`:''}${!fut&&S.days[k]&&adhLvl(S.days[k].adh)?`<span class="msb l${adhLvl(S.days[k].adh)}" title="${t('adh.lvl'+adhLvl(S.days[k].adh))}">${ICON_MISBAHA}</span>`:''}<div class="gd">${d.getDate()}</div><div class="hd">${hh.day===1?`<b title="${esc(hh.month)}">1<span class="hmn"> ${hh.month}</span></b>`:hh.day}</div>${calEvHTML(k,d)}${tot>0?`<span class="pc">${Math.floor(tot/goalMs(k)*100)}%</span>`:''}</button>`)}
  $('#cal').innerHTML=cells.join('');
  {const mk=[];for(let d=1;d<=last.getDate();d++)mk.push(dKey(new Date(y,m,d)));$('#calCount').hidden=overBricks();$('#calCount').innerHTML=`<span class="skl">${t('sky.month')}</span>${skyLine(skyCount(mk))}<span class="sep"></span><span class="skl">${t('sky.year',y)}</span>${skyLine(skyCount(yearKeys(y)))}`;$('#calCount').title=t('sky.sub')}
  requestAnimationFrame(placeCalSky);
  $$('#cal .cell').forEach(c=>c.onclick=()=>{selKey=c.dataset.k;renderCal()});
  renderDetail(selKey||tk);}
let detailWeek=[];
function renderDetail(k){const d=S.days[k],date=keyToDate(k),{tot,by}=totals(k),g=goalMs(k);
  let h=`<h4>${L().days[date.getDay()]} ${gStr(date)}</h4><div class="g">${hStr(date)}</div>`+evDetailHTML(k);
  h+=`<button class="dswrap" id="dScene" title="${esc(t('d.sceneOpen'))}">${sceneHTML(k)}</button>`;
  h+=`<div style="display:flex;justify-content:space-between;font-size:13px"><span>${t('glass.of',fmtHM(tot),g/36e5)}</span><b>${Math.floor(tot/g*100)}%</b></div><div class="minibar"><i style="width:${Math.min(100,tot/g*100)}%"></i></div>`;
  const cats=Object.entries(rollBy(by)).filter(([,v])=>v>0);
  if(cats.length)h+=`<div class="sec"><b>${t('d.dist')}</b><ul>${cats.map(([c,v])=>`<li><i class="dot" style="background:${catOf(c).color}"></i>${esc(kidName(catOf(c)))}<span class="end">${fmtHM(v)}</span></li>`+kidsOf(c).filter(k=>by[k.id]>0).map(k=>`<li class="sub"><i class="dot" style="background:${catOf(c).color}"></i>${esc(kidName(k))}<span class="end">${fmtHM(by[k.id])}</span></li>`).join('')).join('')}</ul></div>`;
  const notes=d?d.sessions.filter(x=>x.note&&!x.mediaId):[];
  if(notes.length)h+=`<div class="sec"><b>${t('d.acts')}</b><ul>${notes.map(x=>`<li><i class="dot" style="background:${catOf(x.cat).color}"></i><span>${esc(x.note)}</span><span class="end">${fmtHM(x.end-x.start)}</span><button class="x" data-dels="${x.id}">✕</button></li>`).join('')}</ul></div>`;
  const media=d&&d.media?d.media:[];
  if(media.length)h+=`<div class="sec"><b>${t('media.title')}</b><ul>${media.map(x=>`<li><span style="color:var(--accent);display:inline-flex;width:14px">${MICON[x.how].replace('<svg','<svg style="width:14px;height:14px"')}</span><span>${esc(x.title)}</span><span class="end">${fmtHM(x.minutes*6e4)}</span><button class="x" data-editm="${x.id}">✎</button><button class="x" data-delm="${x.id}">✕</button></li>`).join('')}</ul></div>`;
  const qq=d&&d.quran;if(qq&&(qq.read||qq.wird||qq.hifz||qq.review)){h+=`<div class="sec"><b>${t('d.quran')}</b><ul><li>${qWirdDone(qq)?'✓':'○'} ${t('d.qRead',qq.read,S.quran.wird)}</li>${qq.hifz?`<li>✓ ${t('d.qHifz')}${qq.hifzPages&&qq.hifzPages.length?` <span class="end">${t('q.pageS')} ${rangesStr(qq.hifzPages)}</span>`:''}</li>`:''}${qq.review?`<li>✓ ${t('d.qReview')}${qq.rv?` <span class="end">${t('q.pageS')} ${rangesStr(qq.rv)}</span>`:''}</li>`:''}</ul></div>`}
  const done=d?d.tasks.filter(x=>x.done):[],undone=d?d.tasks.filter(x=>!x.done):[];
  const hasSum=d&&d.summary&&d.summary.trim();
  if(hasSum&&k>todayKey())h+=`<div class="sec"><b>${t('d.sum')}</b><div class="sumtext">${esc(d.summary)}</div></div>`;
  if(done.length)h+=`<div class="sec"><b>${hasSum?t('d.done'):t('d.doneOnly')}</b><ul>${done.map(x=>`<li class="dtask">✓ <div class="tb"><span>${esc(x.text)}</span>${taskMeta(x)}</div></li>`).join('')}</ul></div>`;
  if(undone.length){const past=k<todayKey();h+=`<div class="sec"><b>${past?t('tk.not'):k===todayKey()?t('d.undone'):t('tk.planned')}</b><ul>${undone.map(x=>`<li class="dtask ${past?'nd':''}">${past?`<span class="nt">${t('tk.not')}</span>`:'○'} <div class="tb"><span>${esc(x.text)}</span>${taskMeta(x)}</div><button class="x" data-pp="${x.id}" title="${t('tk.pp')}">${ICON_PP}</button></li>`).join('')}</ul></div>`}
  h+=ltDayHTML(k);
  h+=`<div class="sec"><b>${t('notes.title')}</b><div class="dnotes" id="calNotes"></div></div>`;
  {const wk0=addDays(date,-((date.getDay()+6)%7)),wk=[...Array(7)].map((_,i)=>dKey(addDays(wk0,i))),wOn=wk.every(isVac);h+=`<div class="sec vacrow"><button class="btn sm ${isVac(k)?'on':''}" data-vd>${isVac(k)?t('vac.dayOff'):t('vac.day')}</button><button class="btn sm ${wOn?'on':''}" data-vw>${wOn?t('vac.weekOff'):t('vac.week')}</button></div>`;h+='';detailWeek=wk}
  if(!d||(!tot&&!d.tasks.length&&!d.summary&&!media.length))h+=`<div class="sec" style="color:var(--muted);font-size:13px">${t('d.empty')}</div>`;
  if(k<=todayKey())h+=`<div class="sec addday"><b>${t('d.addTitle')}</b><div class="row" style="justify-content:flex-start"><button class="btn sm" data-add="act">+ ${t('d.addAct')}</button><button class="btn sm" data-add="media">+ ${t('d.addMedia')}</button></div>
   <div class="addtask" style="margin:0"><input class="in" id="dTaskIn" dir="auto" placeholder="${esc(t('d.addTaskPh'))}"><button class="btn sm" id="dTaskAdd">${t('add')}</button></div>
   <textarea class="in" id="dSum" dir="auto" placeholder="${esc(t('d.sumPh'))}">${esc((d&&d.summary)||'')}</textarea></div>`;
  $('#detail').innerHTML=h;bindEvDetail(k);
  $$('#detail [data-dels]').forEach(b=>b.onclick=()=>{const dd=day(k),bak=dd.sessions.find(x=>x.id===b.dataset.dels);dd.sessions=dd.sessions.filter(x=>x.id!==b.dataset.dels);save();if(bak)toastAct(t('undo.sess'),t('undo'),()=>{day(k).sessions.push(bak);day(k).sessions.sort((a,b)=>a.start-b.start);save();renderCal();if(k===todayKey()){renderGlass();renderLog()}},10000);renderCal();if(k===todayKey()){renderGlass();renderLog()}});
  $$('#detail [data-delm]').forEach(b=>b.onclick=()=>{const dd=day(k);dd.media=dd.media.filter(x=>x.id!==b.dataset.delm);dd.sessions=dd.sessions.filter(x=>x.mediaId!==b.dataset.delm);save();renderCal();if(k===todayKey()){renderGlass();renderLog();renderMedia()}});
  $$('#detail [data-add]').forEach(b=>b.onclick=()=>openDayAdd(k,b.dataset.add));
  $$('#detail [data-pp]').forEach(b=>b.onclick=()=>openPP(b,k,b.dataset.pp));
  renderDayNotes($('#calNotes'),k);
  $('#detail [data-vd]').onclick=()=>setVacRange([k],!isVac(k));$('#detail [data-vw]').onclick=()=>setVacRange(detailWeek,!detailWeek.every(isVac));
  $$('#detail [data-editm]').forEach(b=>b.onclick=()=>openMediaEdit(k,b.dataset.editm));
  const dsc=$('#dScene');if(dsc)dsc.onclick=()=>openDayScene(k);
  const ti=$('#dTaskIn');if(ti){const addT=()=>{const v=ti.value.trim();if(!v)return;day(k).tasks.push({id:uid(),text:v,done:true,doneAt:keyToDate(k).getTime()+12*36e5,created:Date.now()});save();renderCal();if(k===todayKey())renderTasks()};$('#dTaskAdd').onclick=addT;ti.onkeydown=e=>{if(e.key==='Enter')addT()}}
  const ds=$('#dSum');if(ds)ds.oninput=()=>{day(k).summary=ds.value;save();if(k===todayKey())$('#summary').value=ds.value};}
let dayAdd=null;
function openDayAdd(k,kind){const pop=kind==='act'?$('#manPop'):$('#mediaPop');dayAdd={pop,parent:pop.parentElement,next:pop.nextSibling,k};
  $('#dmT').textContent=(kind==='act'?t('d.addAct'):t('d.addMedia'))+' — '+gStr(keyToDate(k));$('#dmBody').append(pop);pop.classList.add('on');
  if(kind==='act'){$('#manDate').value=k;$('#manDate').max=todayKey();$('#manCat').value=S.timer.cat;$('#manNote').focus()}
  else{$('#mDate').value=k;$('#mDate').max=todayKey();$('#mStat').textContent='';renderMediaForm();$('#mUrl').focus()}
  $('#dayModal').classList.add('on')}
function dayModalDone(){if(!dayAdd)return;if(mEdit)mFormReset();const {pop,parent,next}=dayAdd;pop.classList.remove('on');parent.insertBefore(pop,next);dayAdd=null;$('#dayModal').classList.remove('on');if(curView()==='cal')renderCal()}
$('#dayModal').onclick=e=>{if(e.target.id==='dayModal')dayModalDone()};
$('#calPrev').onclick=()=>{calM.setMonth(calM.getMonth()-1);renderCal()};
$('#calNext').onclick=()=>{calM.setMonth(calM.getMonth()+1);renderCal()};
$('#calLeg').onclick=e=>calLegend(e.currentTarget);$('#calLeg').title=t('lg.title');
$('#calToday').onclick=()=>{calM=new Date();calM.setDate(1);selKey=null;renderCal()};

