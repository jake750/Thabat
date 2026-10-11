/* ============ v3.13: the day in hours — «your day between the prayers» in three views: strips (default), an hour column, an agenda ============ */
/* a task may carry a start time (x.at = 'HH:MM'); its length is its estimate (x.est, minutes) or 30 minutes */
const PDLV=['strip','hours','agenda'],PDL_CLK='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';
function pdlView(){const v=S.settings.pdlView;return PDLV.includes(v)?v:'strip'}
function pdlAt(k,x){if(!x||!x.at||!/^\d\d?:\d\d$/.test(x.at))return null;const [h,m]=x.at.split(':').map(Number),D=keyToDate(k);D.setHours(h,m,0,0);return D.getTime()}
function pdlDur(x){return Math.max(15,+x.est||30)*6e4}
function pdlSlotOf(k,ts){const s=pdlSlots(k).find(s=>ts>=s.t0&&ts<s.t1);return s?s.p:null}
function pdlSetAt(k,x,hm){if(!x)return;if(hm){x.at=hm;const p=pdlSlotOf(k,pdlAt(k,x));if(p)x.after=p}else delete x.at;delete x.afterShown;save();renderTasks()}
function pdlEvs(k){return evsOn(k).filter(e=>e.time&&/^\d\d?:\d\d/.test(e.time)).map(e=>{const [h,m]=e.time.split(':').map(Number),x=keyToDate(k);x.setHours(h,m,0,0);return{e,at:x.getTime(),dur:30*6e4}})}
function pdlHM(ts){return fmtT(ts)}
function pdlNextQuarter(){const d=new Date();d.setSeconds(0,0);d.setMinutes(Math.ceil((d.getMinutes()+1)/15)*15);return pdlHM(d.getTime())}
/* the time menu: start time, length, done, no time */
function pdlTimeMenu(anchor,k,x){const r=anchor.getBoundingClientRect(),cur=x.at||pdlNextQuarter(),est=+x.est||0;
  const p=qPopAt(`<div class="aymh">⏰ ${t('pdl.at')}</div><div class="pdlt-row"><input type="time" class="in" id="pdltIn" value="${esc(cur)}" step="300"></div>
    <div class="pdlt-l">${t('pdl.dur')}</div><div class="estg pdlt-d">${[15,30,45,60,90,120].map(m=>`<button data-m="${m}" class="${est===m||(!est&&m===30)?'on':''}">${fmtHM(m*6e4)}</button>`).join('')}</div>
    <div class="pdlt-act"><button class="btn sm pri" id="pdltOk">${t('pdl.save')}</button>${x.at?`<button class="btn sm ghost" id="pdltNo">${t('pdl.noTime')}</button>`:''}<button class="btn sm ghost" id="pdltDone">${x.done?t('pdl.undone'):'✓ '+t('pdl.done')}</button></div>`,r.left+r.width/2,r.bottom-6,'aymenu pdltm');
  let m=est||30;p.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{m=+b.dataset.m;p.querySelectorAll('[data-m]').forEach(q=>q.classList.toggle('on',q===b))});
  p.querySelector('#pdltOk').onclick=()=>{const v=p.querySelector('#pdltIn').value;closePP();x.est=m;pdlSetAt(k,x,v||null)};
  const no=p.querySelector('#pdltNo');if(no)no.onclick=()=>{closePP();pdlSetAt(k,x,null)};
  p.querySelector('#pdltDone').onclick=()=>{closePP();x.done=!x.done;x.doneAt=x.done?Date.now():null;save();renderTasks();if(x.done)chimeSoft()}}
/* B — strips: the existing card, plus a lane with the timed tasks and events under each period's focus bar */
function pdlStripExtras(box,k,d){const rtl=document.documentElement.dir==='rtl',side=rtl?'right':'left',slots=pdlSlots(k),evs=pdlEvs(k);
  box.querySelectorAll('.pdl-s').forEach(row=>{const s=slots.find(z=>z.p===row.dataset.p);if(!s)return;const W=s.t1-s.t0;
    const items=[...d.tasks.map(x=>({x,a:pdlAt(k,x)})).filter(o=>o.a!=null&&o.a>=s.t0&&o.a<s.t1).map(o=>({kind:'t',x:o.x,a:o.a,b:o.a+pdlDur(o.x)})),...evs.filter(v=>v.at>=s.t0&&v.at<s.t1).map(v=>({kind:'e',e:v.e,a:v.at,b:v.at+v.dur}))];
    /* overlapping items stack in lines, so their names never run into each other */
    const bar=row.querySelector('.pdl-bar');if(bar&&items.length){const L=pdlLanes(items),n=Math.max(...L.map(o=>o.lane))+1;bar.insertAdjacentHTML('afterend',`<div class="pdl-lane" style="height:${n*21}px">${L.map(o=>{const st=((o.a-s.t0)/W*100),w=Math.max(4,Math.min(100-st,(o.b-o.a)/W*100)),pos=`${side}:${st.toFixed(2)}%;width:${w.toFixed(2)}%;top:${o.lane*21}px`;
      return o.kind==='t'?`<span class="pdlb${o.x.done?' done':''}" data-tid="${o.x.id}" style="${pos}" title="${esc(fmtT(o.a)+' '+o.x.text)}">${esc(o.x.text)}</span>`:`<span class="pdlb ev" data-ev="${o.e.id}" style="${pos}" title="${esc(fmtT(o.a)+' '+o.e.title)}">${esc(o.e.title)}</span>`}).join('')}</div>`)}
    /* the time in front of timed tasks, timed ones first and in order, and a clock button on every task */
    const ul=row.querySelector('.pdl-tk');if(ul){const lis=[...ul.children];lis.sort((A,B)=>{const a=pdlAt(k,d.tasks.find(q=>q.id===A.dataset.id)),b=pdlAt(k,d.tasks.find(q=>q.id===B.dataset.id));return(a==null)-(b==null)||(a||0)-(b||0)}).forEach(li=>ul.append(li));
      lis.forEach(li=>{const x=d.tasks.find(q=>q.id===li.dataset.id);if(!x)return;const a=pdlAt(k,x);if(a!=null)li.querySelector('.tx').insertAdjacentHTML('beforebegin',`<span class="pdl-at">${fmtT(a)}</span>`);li.insertAdjacentHTML('beforeend',`<button class="pdl-clk" data-clk="${x.id}" title="${esc(t('pdl.setAt'))}" aria-label="${esc(t('pdl.setAt'))}">${PDL_CLK}</button>`)})}});
  box.querySelectorAll('.pdl-lane [data-tid],[data-clk]').forEach(el=>el.onclick=e=>{e.stopPropagation();const x=d.tasks.find(q=>q.id===(el.dataset.tid||el.dataset.clk));if(x)pdlTimeMenu(el,k,x)});
  box.querySelectorAll('.pdl-lane [data-ev]').forEach(el=>el.onclick=()=>openEv(el.dataset.ev,k))}
/* A — the hour column */
function pdlLanes(items){items.sort((a,b)=>a.a-b.a||b.b-a.b);let cl=[],end=-1;const out=[];
  const flush=()=>{const lanes=[];cl.forEach(o=>{let i=lanes.findIndex(e=>e<=o.a);if(i<0){i=lanes.length;lanes.push(0)}lanes[i]=o.b;o.lane=i});cl.forEach(o=>o.n=lanes.length);out.push(...cl);cl=[]};
  items.forEach(o=>{if(cl.length&&o.a>=end){flush();end=-1}cl.push(o);end=Math.max(end,o.b)});if(cl.length)flush();return out}
function pdlHoursHTML(k,d){const slots=pdlSlots(k),now=Date.now(),D0=keyToDate(k);D0.setHours(0,0,0,0);const H=MOB.matches?44:48;
  const h0=Math.max(0,new Date(slots[0].t0).getHours()-1),h1=Math.min(24,new Date(slots[4].t0).getHours()+3),T0=D0.getTime()+h0*36e5,T1=D0.getTime()+h1*36e5,y=ts=>((ts-T0)/36e5*H).toFixed(1);
  const items=pdlLanes([...d.tasks.map(x=>({x,a:pdlAt(k,x)})).filter(o=>o.a!=null).map(o=>({kind:'t',x:o.x,a:o.a,b:o.a+pdlDur(o.x)})),...pdlEvs(k).map(v=>({kind:'e',e:v.e,a:v.at,b:v.at+v.dur}))].filter(o=>o.b>T0&&o.a<T1));
  let h='';for(let i=h0;i<=h1;i++)h+=`<div class="pdh-hl" style="top:${(i-h0)*H}px"></div><span class="pdh-hn" style="top:${(i-h0)*H}px">${i%24}</span>`;
  slots.forEach(s=>{if(s.t0>=T0&&s.t0<=T1)h+=`<div class="pdh-pr" style="top:${y(s.t0)}px"></div><span class="pdh-pl" style="top:${y(s.t0)}px">${esc(t('pr.'+s.p))} ${fmtT(s.t0)}</span>`});
  pdlSegs(k).forEach(g=>{const a=Math.max(g.t0,T0),b=Math.min(g.t1,T1);if(b>a)h+=`<i class="pdh-fc" style="top:${y(a)}px;height:${Math.max(2,(b-a)/36e5*H).toFixed(1)}px;background:${catOf(g.cat).color}"></i>`});
  items.forEach(o=>{const top=y(Math.max(o.a,T0)),ht=Math.max(20,(Math.min(o.b,T1)-Math.max(o.a,T0))/36e5*H-2).toFixed(1),pos=`top:${top}px;height:${ht}px;--ln:${o.lane};--n:${o.n}`;
    h+=o.kind==='t'?`<div class="pdh-b${o.x.done?' done':''}" data-tid="${o.x.id}" draggable="true" style="${pos}"><b>${fmtT(o.a)}</b> <span dir="auto">${esc(o.x.text)}</span></div>`:`<div class="pdh-b ev" data-ev="${o.e.id}" style="${pos}"><b>${esc(o.e.time)}</b> <span dir="auto">${esc(o.e.title)}</span></div>`});
  if(k===todayKey()&&now>T0&&now<T1)h+=`<div class="pdh-now" style="top:${y(now)}px"></div>`;
  const un=d.tasks.filter(x=>!x.done&&!x.lt&&pdlAt(k,x)==null);
  return`${un.length?`<div class="pdl-free pdh-un"><small>${t('pdl.untimed')}</small><div class="pdl-fl">${un.map(x=>`<span class="pdl-chip" data-tid="${x.id}" draggable="true" dir="auto">${esc(x.text)}</span>`).join('')}</div></div>`:''}
    <div class="pdh-wrap"><div class="pdh" data-h0="${h0}" data-hh="${H}" style="height:${(h1-h0)*H}px">${h}</div></div>`}
function pdlHoursBind(box,k,d){const col=box.querySelector('.pdh');if(!col)return;const H=+col.dataset.hh,h0=+col.dataset.h0;
  box.querySelectorAll('[data-tid]').forEach(el=>{el.onclick=e=>{e.stopPropagation();const x=d.tasks.find(q=>q.id===el.dataset.tid);if(x)pdlTimeMenu(el,k,x)};
    el.ondragstart=e=>{PDL.drag=el.dataset.tid;e.dataTransfer.setData('text/plain','pdl:'+el.dataset.tid);el.classList.add('drag')};el.ondragend=()=>{PDL.drag=null;el.classList.remove('drag')}});
  box.querySelectorAll('.pdh [data-ev]').forEach(el=>el.onclick=()=>openEv(el.dataset.ev,k));
  col.ondragover=e=>{if(PDL.drag){e.preventDefault();col.classList.add('dropon')}};col.ondragleave=e=>{if(!col.contains(e.relatedTarget))col.classList.remove('dropon')};
  col.ondrop=e=>{e.preventDefault();col.classList.remove('dropon');const x=d.tasks.find(q=>q.id===PDL.drag);if(!x)return;const z=uiZoom(),r=col.getBoundingClientRect(),min=Math.max(0,Math.round(((e.clientY-r.top)/z)/H*60/15)*15)+h0*60;pdlSetAt(k,x,pad(Math.floor(min/60)%24)+':'+pad(min%60))};
  /* open near now (or the first item) the first time it is drawn */
  const w=box.querySelector('.pdh-wrap');if(w&&!pdlHoursBind._k){pdlHoursBind._k=1;const n=col.querySelector('.pdh-now')||col.querySelector('.pdh-b');if(n)w.scrollTop=Math.max(0,parseFloat(n.style.top)-H)}}
/* C — the agenda */
function pdlAgendaHTML(k,d){const slots=pdlSlots(k),now=Date.now(),evs=pdlEvs(k);let cur=slots.findIndex(s=>now>=s.t0&&now<s.t1);
  return slots.map((s,i)=>{const st=i===cur?'now':now>=s.t1?'past':'next',open=st!=='past'||PDL.open[s.p];
    const timed=[...d.tasks.map(x=>({x,a:pdlAt(k,x)})).filter(o=>o.a!=null&&o.a>=s.t0&&o.a<s.t1).map(o=>({kind:'t',x:o.x,a:o.a,b:o.a+pdlDur(o.x)})),...evs.filter(v=>v.at>=s.t0&&v.at<s.t1).map(v=>({kind:'e',e:v.e,a:v.at,b:v.at+v.dur}))].sort((a,b)=>a.a-b.a);
    const untimed=d.tasks.filter(x=>x.after===s.p&&pdlAt(k,x)==null);
    let rows='',last=st==='now'?Math.max(s.t0,now):s.t0;
    timed.forEach(o=>{if(st!=='past'&&o.a-last>=30*6e4)rows+=`<div class="pda-gap">${t('pdl.gap',fmtHM(o.a-last))}</div>`;last=Math.max(last,o.b);
      rows+=o.kind==='t'?`<div class="pda-r${o.x.done?' done':''}" data-id="${o.x.id}"><b>${fmtT(o.a)}</b><button class="ck" aria-label="✓">${ICON_CHECK}</button><span class="tx" dir="auto" data-tid="${o.x.id}">${esc(o.x.text)}</span></div>`:`<div class="pda-r ev" data-ev="${o.e.id}"><b>${esc(o.e.time)}</b><span>📅</span><span class="tx" dir="auto">${esc(o.e.title)}</span></div>`});
    if(st!=='past'&&timed.length&&s.t1-last>=30*6e4)rows+=`<div class="pda-gap">${t('pdl.gap',fmtHM(s.t1-last))}</div>`;
    untimed.forEach(x=>rows+=`<div class="pda-r${x.done?' done':''}" data-id="${x.id}"><b class="pda-nt">—</b><button class="ck" aria-label="✓">${ICON_CHECK}</button><span class="tx" dir="auto" data-tid="${x.id}">${esc(x.text)}</span></div>`);
    const n=timed.length+untimed.length;
    return`<div class="pda-s s-${st}" data-p="${s.p}"><div class="pda-h" ${st==='past'?'data-tog':''}><b>${esc(tpaLabel(s.p))}</b>${plMark(k,s.p)}<span class="pdl-tm">${fmtT(s.t0)} – ${fmtT(s.t1)}</span>${st==='now'?`<span class="pdl-now">${t('pdl.now')}</span>`:''}${st==='past'?`<span class="pdl-ch">${n?n+' · ':''}${open?'▴':'▾'}</span>`:''}</div>${open?rows||`<div class="pda-gap">${t('pdl.gap',fmtHM(s.t1-Math.max(s.t0,st==='now'?now:s.t0)))}</div>`:''}</div>`}).join('')+
    (()=>{const free=d.tasks.filter(x=>!x.done&&!x.after&&!x.lt&&pdlAt(k,x)==null);return free.length?`<div class="pdl-free"><small>${t('pdl.free')}</small><div class="pdl-fl">${free.map(x=>`<span class="pdl-chip" data-tid="${x.id}" dir="auto">${esc(x.text)}</span>`).join('')}</div></div>`:''})()}
function pdlAgendaBind(box,k,d){box.querySelectorAll('[data-tog]').forEach(h=>h.onclick=()=>{const p=h.closest('.pda-s').dataset.p;PDL.open[p]=!PDL.open[p];pdlRender()});
  box.querySelectorAll('.pda-r[data-id] .ck').forEach(b=>b.onclick=()=>{const x=d.tasks.find(q=>q.id===b.closest('.pda-r').dataset.id);if(!x)return;x.done=!x.done;x.doneAt=x.done?Date.now():null;save();renderTasks();if(x.done)chimeSoft()});
  box.querySelectorAll('[data-tid]').forEach(el=>el.onclick=e=>{e.stopPropagation();const x=d.tasks.find(q=>q.id===el.dataset.tid);if(x)pdlTimeMenu(el,k,x)});
  box.querySelectorAll('.pda-r[data-ev]').forEach(el=>el.onclick=()=>openEv(el.dataset.ev,k))}
{const _pr=pdlRender;pdlRender=function(){const box=$('#pdlCard');if(!box)return _pr();const v=pdlView();box.dataset.view=v;
  if(v==='strip'){_pr();try{pdlStripExtras(box,todayKey(),day(todayKey()))}catch(e){console.error(e)}return}
  const k=todayKey(),d=day(k);
  box.innerHTML=`<h3><span>${t('pdl.t')}</span><span class="pdl-hint" title="${esc(t('pdl.tip'))}">ⓘ</span></h3>`+(v==='hours'?pdlHoursHTML(k,d):`<div class="pda">${pdlAgendaHTML(k,d)}</div>`);
  if(v==='hours')pdlHoursBind(box,k,d);else pdlAgendaBind(box,k,d)}}
/* the setting: which view */
function pdlvSeg(){const g=$('#pdlvSeg');if(!g)return;g.innerHTML=PDLV.map(v=>`<button data-v="${v}" class="${pdlView()===v?'on':''}">${t('pdlv.'+v)}</button>`).join('');
  g.querySelectorAll('button').forEach(b=>b.onclick=()=>{S.settings.pdlView=b.dataset.v;save();pdlvSeg();pdlHoursBind._k=0;pdlRender()})}
{const _rs=renderSettings;renderSettings=function(){_rs();try{pdlvSeg()}catch(e){console.error(e)}}}
try{pdlRender()}catch(e){}

