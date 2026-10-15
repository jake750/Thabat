/* ============ v3.62.2 matrix view: ✕ and the task menu on every task; no second Mulk task after «all to tomorrow» ============ */
/* renderMatrix had only a check and the quadrant menu, so a task could not be deleted while the matrix was on */
{hookFn('renderMatrix',()=>renderMatrix,f=>{renderMatrix=f},'post',function(){const k=todayKey();
  $$('#tasks .mxit').forEach(li=>{const id=li.dataset.id;if(li.querySelector('.mxdel'))return;
    li.insertAdjacentHTML('beforeend',`<button class="mxdel" title="${esc(t('ux.delete'))}" aria-label="${esc(t('ux.delete'))}">✕</button>`);
    li.querySelector('.mxdel').onclick=e=>{e.stopPropagation();const rr=uxDelTask(k,id);save();renderTasks();if(rr)uxUndoDel(k,[rr])};
    li.oncontextmenu=e=>{e.preventDefault();tkMenu(li,k,id)};
    let lp=0;li.addEventListener('touchstart',()=>{clearTimeout(lp);lp=setTimeout(()=>{li._lp=1;tkMenu(li,k,id)},520)},{passive:true});
    ['touchend','touchmove','touchcancel'].forEach(ev=>li.addEventListener(ev,()=>clearTimeout(lp),{passive:true}));
    li.addEventListener('click',e=>{if(li._lp){li._lp=0;e.stopPropagation();e.preventDefault()}},true)})})}
/* «all to tomorrow» / postpone copied yesterday's Mulk task (without its auto mark), then ensureMulk added today's own: two of the same */
function mlkDedup(k){const d=S.days[k];if(!d||!d.tasks)return false;const own=d.tasks.some(x=>x.id==='mulk-'+k);if(!own)return false;const n=d.tasks.length;
  d.tasks=d.tasks.filter(x=>x.done||!(x.fromId&&/^mulk-/.test(x.fromId)));return d.tasks.length!==n}
{hookFn('renderTasks',()=>renderTasks,f=>{renderTasks=f},'pre',()=>{try{if(mlkDedup(todayKey()))save()}catch(e){}})}
{const _pp=postponeTask;postponeTask=function(fromK,id,toK,...a){const o=S.days[fromK]&&S.days[fromK].tasks.find(x=>x.id===id);if(o&&(o.auto==='mulk'||/^mulk-/.test(id))&&S.settings.mulk!==false){toast(t('mlk2.auto'));return}return _pp(fromK,id,toK,...a)}}
{const _ut=uxTomorrow;uxTomorrow=function(ids,...a){if(S.settings.mulk!==false&&Array.isArray(ids))ids=ids.filter(id=>!/^mulk-/.test(id));return _ut(ids,...a)}}

