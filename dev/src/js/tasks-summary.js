/* ============ tasks & summary ============ */
const ICON_PP='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="13" height="15" rx="2"/><path d="M3 10h13M7 3v4M12 3v4M15 16h6M18 13l3 3-3 3"/></svg>';
function dayLabel(k){const tk=todayKey();if(k===tk)return t('tk.today');if(k===dKey(addDays(keyToDate(tk),1)))return t('tk.tomorrow');if(k===dKey(addDays(keyToDate(tk),-1)))return t('tk.yesterday');const d=keyToDate(k);return L().days[d.getDay()]+' '+gShort(d)}
function taskMeta(x){const m=[];if(x.from)m.push(t('tk.from',dayLabel(x.from)));
  if(x.pp&&x.pp.length)m.push(t('tk.ppd',x.pp.map(q=>{const c=S.days[q.k]&&S.days[q.k].tasks.find(y=>y.id===q.id);return dayLabel(q.k)+(c&&c.done?' ✓':'')}).join('، ')));
  if(x.recurId)m.push('🔁 '+t('rc.badge'));if(x.carryN)m.push(t('tk.carryN',x.carryN));
  return m.length?`<small class="tmeta">${esc(m.join(' · '))}</small>`:''}
function postponeTask(fromK,id,toK){const o=S.days[fromK]&&S.days[fromK].tasks.find(x=>x.id===id);if(!o||!toK||toK===fromK)return;
  if((o.pp||[]).some(q=>q.k===toK)){toast(t('tk.already'));return}
  const c={id:uid(),text:o.text,done:false,created:Date.now(),from:fromK,fromId:id};day(toK).tasks.push(c);(o.pp=o.pp||[]).push({k:toK,id:c.id});
  save();renderTasks();if(curView()==='cal')renderCal();toast(t('tk.copied',dayLabel(toK)))}
function closePP(){const p=$('#ppPop');if(p)p.remove();document.querySelectorAll('.ahl').forEach(x=>x.classList.remove('ahl'));document.removeEventListener('mousedown',ppOut,true)}
function ppOut(e){if(Date.now()<(window._ppGuard||0))return;const p=$('#ppPop');if(p&&!p.contains(e.target))closePP()}
function openPP(btn,fromK,id){closePP();const tk=todayKey(),nx=dKey(addDays(keyToDate(fromK),1)),base=nx<tk?tk:nx;
  const p=document.createElement('div');p.className='pppop';p.id='ppPop';
  p.innerHTML=`<b>${t('tk.ppTo')}</b><button class="btn sm pri" data-q>${esc(dayLabel(base))}</button><small>${t('tk.pick')}</small><div class="row"><input type="date" class="in" min="${tk}" value="${dKey(addDays(keyToDate(base),1))}"><button class="btn sm" data-go>${t('tk.copy')}</button></div><small class="hint">${t('tk.ppHint')}</small>`;
  document.body.append(p);const r=btn.getBoundingClientRect(),w=p.offsetWidth,h=p.offsetHeight;
  let x=document.documentElement.dir==='rtl'?r.left:r.right-w;x=Math.max(8,Math.min(innerWidth-w-8,x));let y=r.bottom+6;if(y+h>innerHeight-8)y=r.top-h-6;p.style.left=x+'px';p.style.top=y+'px';
  p.querySelector('[data-q]').onclick=()=>{closePP();postponeTask(fromK,id,base)};
  p.querySelector('[data-go]').onclick=()=>{const v=p.querySelector('input').value;if(!v||v<tk||v===fromK)return;closePP();postponeTask(fromK,id,v)};
  setTimeout(()=>document.addEventListener('mousedown',ppOut,true),0)}
document.addEventListener('keydown',e=>{if(e.key==='Escape')closePP()});
function missedTasks(){const tk=todayKey(),out=[];for(let i=14;i>=1;i--){const k=dKey(addDays(keyToDate(tk),-i)),d=S.days[k];if(!d)continue;d.tasks.forEach(x=>{if(!x.done&&!(x.pp&&x.pp.length)&&!x.dismissed)out.push({k,x})})}return out}

