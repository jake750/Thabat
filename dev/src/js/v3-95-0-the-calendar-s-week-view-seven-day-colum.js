/* ============ v3.95.0: the calendar's week view — seven day columns (his pick «أ», 2026-10-22) ============ */
/* S.settings.calView='w' (button in the calendar tools). The week of the chosen day (Monday first, like the month grid): each column
   has the day, its Hijri day, the share of the goal, the five prayers as dots, timed items (events and tasks with a time) in order,
   then the tasks without a time. A tap on a column chooses that day (the day panel follows); ‹ › move a week. Phones scroll sideways. */
const calWkOn=()=>S.settings.calView==='w';
function cwkStart(k){const d=keyToDate(k);d.setDate(d.getDate()-((d.getDay()+6)%7));return d}
function cwkDays(k){const s=cwkStart(k);return Array.from({length:7},(_,i)=>{const d=new Date(s);d.setDate(s.getDate()+i);return d})}
function cwkPaint(){const box=$('#cal');if(!box||CAL2.busy)return;const html=document.documentElement;html.classList.toggle('calwkon',calWkOn());box.classList.toggle('calwk',calWkOn());if(!calWkOn())return;
  const tk=todayKey(),sel=selKey||tk,days=cwkDays(sel),a=days[0],z=days[6];
  $('#calTtl').textContent=a.getMonth()===z.getMonth()?`${a.getDate()} – ${z.getDate()} ${L().months[z.getMonth()]} ${z.getFullYear()}`:`${a.getDate()} ${L().months[a.getMonth()]} – ${z.getDate()} ${L().months[z.getMonth()]} ${z.getFullYear()}`;
  $('#calSub').textContent=hRange(a,z);
  box.innerHTML=days.map(d=>{const k=dKey(d),day=S.days[k]||{},{tot}=totals(k),g=goalMs(k),p=Math.min(1,g?tot/g:0),fut=k>tk,h=hijri(d);
    const pr=PRAYERS.map(pk=>{const s=fut?null:plStatus(k,pk);return`<i class="wkp ${s||''}" title="${esc(t('pr.'+pk))}"></i>`}).join('');
    const items=[];evsOn(k).forEach(e=>items.push({tm:e.time||'',tx:e.title||e.t||'',c:e.color||'',ev:1}));(day.tasks||[]).forEach(x=>{if(x.at)items.push({tm:x.at,tx:x.text,done:x.done})});
    items.sort((x,y)=>String(x.tm||'99').localeCompare(String(y.tm||'99')));
    const loose=(day.tasks||[]).filter(x=>!x.at);
    return`<div class="wkc ${k===tk?'today':''} ${k===sel?'sel':''} ${fut?'fut':''}" data-k="${k}">
      <button class="wkh" data-wk="${k}"><span>${esc(L().days[d.getDay()])}</span><b>${d.getDate()}</b><small>${h.day} ${esc(h.month)}</small></button>
      <div class="wkbar" title="${esc(fmtHM(tot))}"><i style="width:${(p*100).toFixed(0)}%"></i></div><div class="wkm"><span>${fut?'':esc(fmtHM(tot))}</span><span class="wkps">${pr}</span></div>
      <div class="wkl">${items.map(x=>`<div class="wki ${x.ev?'ev':''} ${x.done?'done':''}"${x.c?` style="--c:${esc(x.c)}"`:''}><time>${esc(x.tm||'')}</time><span dir="auto">${esc(x.tx)}</span></div>`).join('')}
      ${loose.length?`<div class="wkt">${loose.slice(0,6).map(x=>`<span class="${x.done?'done':''}" dir="auto">${esc(x.text)}</span>`).join('')}${loose.length>6?`<small>+${loose.length-6}</small>`:''}</div>`:''}
      ${!items.length&&!loose.length?`<div class="wke">—</div>`:''}</div></div>`}).join('');
  box.querySelectorAll('.wkc').forEach(c=>c.onclick=()=>{selKey=c.dataset.k;renderCal()});
  const cur=box.querySelector('.wkc.sel')||box.querySelector('.wkc.today');if(cur&&MOB.matches)requestAnimationFrame(()=>{try{cur.scrollIntoView({inline:'center',block:'nearest'})}catch(e){}})}
{hookFn('renderCal',()=>renderCal,f=>{renderCal=f},'post',function(){try{cwkPaint();cwkBtn()}catch(e){console.error(e)}})}
/* ‹ today › move a week while the week view is on */
{const pv=$('#calPrev'),nx=$('#calNext'),td=$('#calToday');const op=pv&&pv.onclick,on=nx&&nx.onclick,ot=td&&td.onclick;
  const mv=n=>{const d=keyToDate(selKey||todayKey());d.setDate(d.getDate()+n);selKey=dKey(d);calM=new Date(d);calM.setDate(1);renderCal()};
  if(pv)pv.onclick=e=>calWkOn()?mv(-7):op&&op.call(pv,e);if(nx)nx.onclick=e=>calWkOn()?mv(7):on&&on.call(nx,e);
  if(td)td.onclick=e=>{if(calWkOn()){selKey=todayKey();calM=new Date();calM.setDate(1);renderCal()}else ot&&ot.call(td,e)}}
/* phones: in the week view a sideways swipe scrolls the columns; the month swipe of the grid (3.10) must not also move a week */
window.addEventListener('touchend',e=>{try{if(calWkOn()&&e.target.closest&&e.target.closest('#cal'))e.stopPropagation()}catch(x){}},{capture:true,passive:true});
function cwkBtn(){const tb=$('#calTools3');if(!tb)return;let b=$('#calWkBtn');if(!b){tb.insertAdjacentHTML('afterbegin',`<button class="btn sm" id="calWkBtn"></button>`);b=$('#calWkBtn');
    b.onclick=()=>{S.settings.calView=calWkOn()?'m':'w';save();renderCal()}}
  b.textContent=t(calWkOn()?'cwk.month':'cwk.week');b.classList.toggle('on',calWkOn());b.title=t(calWkOn()?'cwk.toMonth':'cwk.toWeek')}

