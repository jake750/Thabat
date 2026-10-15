/* ============ v3.62.1 a deleted task stays deleted: repeating, period-template, exam, lesson-of-the-day and Mulk tasks no longer come back the same day ============ */
/* day.tdel = ids deleted that day, plus 'r:<recurId>' for a repeating task's instance (the repeat rule itself is kept) */
{hookFn('uxDelTask',()=>uxDelTask,f=>{uxDelTask=f},'pre',function(k,id){try{const d=day(k),x=d.tasks.find(q=>q.id===id);if(!x)return;const L_=d.tdel=d.tdel||[];delete x.tdelBack;if(!L_.includes(id))L_.push(id);if(x.recurId&&!L_.includes('r:'+x.recurId))L_.push('r:'+x.recurId)}catch(e){}})}
/* the undo (and a restore from the trash) puts the same object back: it carries tdelBack, so it is kept and its marks are dropped */
{const _u=uxUndoDel;uxUndoDel=function(k,list,...a){try{list.forEach(o=>{if(o&&o.x)o.x.tdelBack=1})}catch(e){}return _u(k,list,...a)}}
function tdelSweep(k){const d=S.days[k];if(!d||!d.tdel||!d.tdel.length)return false;let ch=false;
  d.tasks.forEach(x=>{if(x.tdelBack){d.tdel=d.tdel.filter(e=>e!==x.id&&e!=='r:'+x.recurId);delete x.tdelBack;ch=true}});
  const set=new Set(d.tdel),n=d.tasks.length;d.tasks=d.tasks.filter(x=>!(set.has(x.id)||(x.recurId&&set.has('r:'+x.recurId))));return ch||d.tasks.length!==n}
function tdelAfter(k){try{if(tdelSweep(typeof k==='string'&&/^\d{4}-\d\d-\d\d$/.test(k)?k:todayKey()))save()}catch(e){}}
{hookFn('ensureRecur',()=>ensureRecur,f=>{ensureRecur=f},'post',tdelAfter)}
{hookFn('ensurePtpl',()=>ensurePtpl,f=>{ensurePtpl=f},'post',()=>tdelAfter())}
{hookFn('ensureLod',()=>ensureLod,f=>{ensureLod=f},'post',()=>tdelAfter())}
{hookFn('ensureExam',()=>ensureExam,f=>{ensureExam=f},'post',()=>tdelAfter())}
{hookFn('ensureMulk',()=>ensureMulk,f=>{ensureMulk=f},'post',()=>tdelAfter())}
{hookFn('renderTasks',()=>renderTasks,f=>{renderTasks=f},'pre',()=>tdelAfter())}

