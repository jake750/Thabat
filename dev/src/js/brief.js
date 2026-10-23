/* ============ brief ============ */
let bMode='week',bAnchor=logicalDate(Date.now());
function periodKeys(mode,anchor){const a=new Date(anchor.getFullYear(),anchor.getMonth(),anchor.getDate());let s,n;
  if(mode==='week'){s=addDays(a,-((a.getDay()+6)%7));n=7}else{s=new Date(a.getFullYear(),a.getMonth(),1);n=new Date(a.getFullYear(),a.getMonth()+1,0).getDate()}
  return Array.from({length:n},(_,i)=>dKey(addDays(s,i)))}
function shiftAnchor(dir){if(bMode==='week')bAnchor=addDays(bAnchor,7*dir);else bAnchor=new Date(bAnchor.getFullYear(),bAnchor.getMonth()+dir,1)}
function periodStats(keys){const tk=todayKey();const r={gold:0,run:0,bestRun:0,keys,tot:0,by:{},days:[],elapsed:0,goalDays:0,goalTot:0,tasksDone:0,tasksAll:0,media:[],mHow:{watch:0,listen:0,read:0},mHowN:{watch:0,listen:0,read:0},mType:{},q:{read:0,wird:0,hifz:0,review:0}};
  keys.forEach(k=>{const {tot,by}=totals(k),g=goalMs(k),past=k<=tk,d=S.days[k];
    r.days.push({k,tot,by,g,past});if(past){r.elapsed++;r.goalTot+=g;r.goalDays+=Math.min(1,tot/g);if(tot>=g){r.gold++;r.run++;r.bestRun=Math.max(r.bestRun,r.run)}else r.run=0}
    r.tot+=tot;for(const c in by)r.by[c]=(r.by[c]||0)+by[c];
    if(d&&d.quran&&past){const qq=d.quran;r.q.read+=qq.read||0;r.q.wird+=qWirdDone(qq)?1:Math.min(1,(qq.read||0)/Math.max(1,S.quran.wird));if(qq.hifz)r.q.hifz++;if(qq.review)r.q.review++}
    if(d){r.tasksDone+=d.tasks.filter(x=>x.done).length;r.tasksAll+=d.tasks.length;
      (d.media||[]).forEach(m=>{r.media.push(Object.assign({k},m));const ms=m.minutes*6e4;r.mHow[m.how]=(r.mHow[m.how]||0)+ms;r.mHowN[m.how]=(r.mHowN[m.how]||0)+1;const ty=r.mType[m.type]||(r.mType[m.type]={n:0,ms:0});ty.n++;ty.ms+=ms})}});
  return r}
function niceStep(maxH){return maxH<=4?1:maxH<=8?2:maxH<=16?4:6}
function renderBrief(){
  const keys=periodKeys(bMode,bAnchor),st=periodStats(keys);st.byRaw=st.by;st.by=rollBy(st.by);st.days.forEach(d=>{d.byRaw=d.by;d.by=rollBy(d.by)});
  const prevAnchor=bMode==='week'?addDays(bAnchor,-7):brPrevAnchor(bAnchor);
  const pv=periodStats(periodKeys(bMode,prevAnchor));
  const s=keyToDate(keys[0]),e=keyToDate(keys[keys.length-1]);
  $$('#bSeg button').forEach(b=>b.classList.toggle('on',b.dataset.m===bMode));
  $('#bTtl').textContent=bMode==='week'?(s.getMonth()===e.getMonth()?s.getDate()+' – '+gStr(e):gShort(s)+' – '+gStr(e)):L().months[s.getMonth()]+' '+s.getFullYear();
  $('#bSub').textContent=(bMode==='week'?t('brief.wTitle'):t('brief.mTitle'))+' · '+(bMode==='week'?(()=>{const h1=hijri(s),h2=hijri(e);return h1.month===h2.month?h1.day+' – '+h2.day+' '+h2.month+' '+h2.year+' '+t('hijriSuffix'):h1.day+' '+h1.month+' – '+h2.day+' '+h2.month+' '+h2.year+' '+t('hijriSuffix')})():hRange(s,e));
  /* tiles */
  let delta='';if(pv.tot>0){const pc=Math.round((st.tot-pv.tot)/pv.tot*100);delta=t('brief.vsPrev',`<span class="${pc>=0?'up':'dn'}">${pc>=0?'▲':'▼'} ${Math.abs(pc)}%</span>`,bMode==='week'?t('brief.prevW'):t('brief.prevM'))}else delta=t('brief.noPrev');
  const avg=st.elapsed?st.tot/st.elapsed:0;
  $('#bTiles').innerHTML=`
   <div class="tile"><div class="k">${t('brief.total')}</div><div class="v">${fmtHM(st.tot)}</div><div class="s">${delta}</div></div>
   <div class="tile"><div class="k">${t('brief.avg')}</div><div class="v">${fmtHM(avg)}</div><div class="s">${st.goalTot?t('brief.ofGoal',Math.round(st.tot/st.goalTot*100)):'—'}</div></div>
   <div class="tile"><div class="k">${t('brief.goalDays')}</div><div class="v">${fnum(st.goalDays)}<small> / ${st.elapsed}</small></div><div class="s">${t('brief.fracHint')}</div></div>
   <div class="tile"><div class="k">${t('brief.gold')}</div><div class="v"><span class="gdot">✦</span> ${st.gold}<small> / ${st.elapsed}</small></div><div class="s">${t('brief.bestRun',st.bestRun)}</div></div>
   ${overBricks()?bricksTile(keys):`<div class="tile skytile" title="${esc(t('sky.sub'))}"><div class="k">${t('sky.title')}</div><div class="v skyv">${skyLine(skyCount(keys))}</div><div class="s">${t('sky.year',s.getFullYear())}: ${skyLine(skyCount(yearKeys(s.getFullYear())))}</div></div>
   <div class="tile"><div class="k">${t('brief.tasks')}</div><div class="v">${st.tasksDone}</div><div class="s">${t('brief.tasksSub',st.tasksAll)}</div></div>`}`;
  /* legend */
  const used=S.settings.categories.filter(c=>(st.by[c.id]||0)>0);const extra=Object.keys(st.by).filter(id=>st.by[id]>0&&!S.settings.categories.some(c=>c.id===id)).map(catOf);
  const series=[...used,...extra];
  $('#bLegend').innerHTML=series.map(c=>`<span><i style="background:${c.color}"></i>${esc(catName(c))}</span>`).join('');
  /* chart */
  const goalH=S.settings.goalHours,maxDay=Math.max(0,...st.days.map(d=>d.tot))/36e5,maxH=Math.max(goalH,maxDay,1),step=niceStep(maxH);let top=Math.ceil(maxH/step)*step;if(top-maxH<step*0.35)top+=step;
  let y='',gl='';for(let v=0;v<=top;v+=step){const pc=v/top*100;y+=`<span style="bottom:${pc}%">${v}${t('u.h')}</span>`;gl+=`<div class="gl" style="bottom:${pc}%"></div>`}
  $('#bY').innerHTML=y;
  const tk=todayKey();
  const cols=st.days.map((d,i)=>{const segs=series.map(c=>{const ms=d.by[c.id]||0;return ms>0?`<div class="sg" style="height:${ms/36e5/top*220}px;background:${c.color}"></div>`:''}).join('');
    const ov=d.past&&d.tot>d.g?`<div class="over" style="bottom:${d.g/36e5/top*220}px;height:${(d.tot-d.g)/36e5/top*220}px"></div>`:'';
    return`<div class="col ${d.k===tk?'today':''}" data-i="${i}"><div class="stk">${segs}</div>${ov}</div>`}).join('');
  $('#bPlot').innerHTML=gl+`<div class="goal" style="bottom:${goalH/top*100}%"><span>${t('brief.goal',goalH+t('u.h'))}</span></div><div class="cols">${cols}</div><div class="tip" id="bTip"></div>`;
  $('#bX').innerHTML=st.days.map(d=>{const dt=keyToDate(d.k);return`<span class="${d.k===tk?'today':''} ${d.past?'':'fut'}">${bMode==='week'?L().sdays[dt.getDay()]+' '+dt.getDate():dt.getDate()}</span>`}).join('');
  const tip=$('#bTip'),plot=$('#bPlot');
  $$('#bPlot .col').forEach(c=>{c.onmouseenter=()=>{const d=st.days[+c.dataset.i],dt=keyToDate(d.k);if(!d.past)return;
      const rows=series.filter(x=>(d.by[x.id]||0)>0).map(x=>`<div><span><i style="background:${x.color}"></i>${esc(catName(x))}</span>${fmtHM(d.by[x.id])}</div>`+kidsOf(x.id).filter(k=>(d.byRaw[k.id]||0)>0).map(k=>`<div class="sub"><span>${esc(kidName(k))}</span>${fmtHM(d.byRaw[k.id])}</div>`).join('')).join('');
      tip.innerHTML=`<b>${L().days[dt.getDay()]} ${gShort(dt)}</b>${rows}<div class="tt"><span>${t('brief.total2')}</span>${fmtHM(d.tot)} · ${Math.floor(d.tot/d.g*100)}%</div>`;
      tip.style.display='block';const pr=plot.getBoundingClientRect(),cr=c.getBoundingClientRect();let x=cr.left-pr.left+cr.width/2-tip.offsetWidth/2;x=Math.max(0,Math.min(pr.width-tip.offsetWidth,x));tip.style.left=x+'px';tip.style.top='4px'};
    c.onmouseleave=()=>tip.style.display='none'});
  const best=st.days.reduce((a,d)=>d.tot>(a?a.tot:0)?d:a,null);
  $('#bBest').innerHTML=best?t('brief.best',L().days[keyToDate(best.k).getDay()]+' '+gShort(keyToDate(best.k)),fmtHM(best.tot)):'';
  /* categories */
  $('#bCats').innerHTML=st.tot>0?series.map(c=>{const ms=st.by[c.id]||0;return`<div class="brow"><span class="nm"><i style="background:${c.color}"></i>${esc(catName(c))}</span><span class="bar"><i style="width:${ms/st.tot*100}%;background:${c.color}"></i></span><span class="tm">${fmtHM(ms)}</span><span class="pc">${Math.round(ms/st.tot*100)}%</span></div>`+kidsOf(c.id).filter(k=>(st.byRaw[k.id]||0)>0).map(k=>{const m=st.byRaw[k.id];return`<div class="brow sub"><span class="nm"><i style="background:${c.color}"></i>${esc(kidName(k))}</span><span class="bar"><i style="width:${m/st.tot*100}%;background:${c.color}"></i></span><span class="tm">${fmtHM(m)}</span><span class="pc">${Math.round(m/st.tot*100)}%</span></div>`}).join('')}).join('')+`<div class="brow"><span class="nm" style="font-weight:600">${t('brief.total2')}</span><span></span><span class="tm" style="font-weight:600">${fmtHM(st.tot)}</span><span class="pc">100%</span></div>`:`<div class="empty">${t('brief.none')}</div>`;
  renderBriefQuran(st);renderBriefAdh(keys);
  /* media */
  if(!st.media.length){$('#bMedia').innerHTML=`<div class="empty">${t('brief.none')}</div>`}else{
    const tiles=MHOW.map(h=>`<div class="mtile"><div class="k">${MICON[h]}${t('how.'+h)}</div><div class="v">${fmtHM(st.mHow[h]||0)}</div><div class="s">${t('brief.items',st.mHowN[h]||0)}</div></div>`).join('');
    const chips=MTYPES.filter(x=>st.mType[x]).map(x=>`<span>${t('type.'+x)} · <b>${st.mType[x].n}</b> · ${fmtHM(st.mType[x].ms)}</span>`).join('');
    const list=[...st.media].sort((a,b)=>b.k.localeCompare(a.k)||b.at-a.at);const shown=list.slice(0,14);
    $('#bMedia').innerHTML=`<div class="mtiles">${tiles}</div><div class="tchips">${chips}</div><ul class="mlist bml">${shown.map(m=>`<li class="mitem"><span class="mic">${MICON[m.how]}</span><span class="mt"><b dir="auto">${esc(m.title)}</b><span>${t('type.'+m.type)} · ${t('how.'+m.how)} · ${gShort(keyToDate(m.k))}</span></span><span class="md">${fmtHM(m.minutes*6e4)}</span></li>`).join('')}</ul>${list.length>shown.length?`<div class="empty">${t('brief.more',list.length-shown.length)}</div>`:''}`}
}
function renderBriefQuran(st){const mem=qMem().length;
  $('#bQuran').innerHTML=`<div class="qtiles">
   <div class="mtile"><div class="k">${ICON_BOOK}${t('brief.qPages')}</div><div class="v">${st.q.read}</div><div class="s">${t('brief.qPagesSub',Math.round(st.q.read/20*10)/10)}</div></div>
   <div class="mtile"><div class="k">${t('brief.qWird')}</div><div class="v">${fnum(st.q.wird)}<small style="font-size:13px;color:var(--muted)"> / ${st.elapsed}</small></div><div class="s">${t('q.wird')}: ${S.quran.wird} ${t('set.pages')}</div></div>
   <div class="mtile"><div class="k">${t('brief.qHifz')}</div><div class="v">${st.q.hifz}<small style="font-size:13px;color:var(--muted)"> / ${st.elapsed}</small></div><div class="s">&nbsp;</div></div>
   <div class="mtile"><div class="k">${t('brief.qReview')}</div><div class="v">${st.q.review}<small style="font-size:13px;color:var(--muted)"> / ${st.elapsed}</small></div><div class="s">&nbsp;</div></div>
   <div class="mtile"><div class="k">${t('brief.qMem')}</div><div class="v">${mem}</div><div class="s">${t('brief.qMemSub',Math.round(mem/604*1000)/10)}</div></div></div>`}
$$('#bSeg button').forEach(b=>b.onclick=()=>{bMode=b.dataset.m;renderBrief()});
$('#bPrev').onclick=()=>{shiftAnchor(-1);renderBrief()};
$('#bNext').onclick=()=>{shiftAnchor(1);renderBrief()};
$('#bNow').onclick=()=>{bAnchor=logicalDate(Date.now());renderBrief()};

