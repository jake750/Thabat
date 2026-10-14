/* ============ v3.42 tasks, habits, timer: repeat N days after done, #tags with the filter bar, task → daily habit, habits with quantities or from the timer, weekly goal per category ============ */
/* 28: «every N days after it was last done» */
function rcLastDone(r,upto){let d=keyToDate(upto);for(let i=0;i<800;i++){const x=S.days[dKey(d)];if(x&&x.tasks&&x.tasks.some(q=>q.recurId===r.id&&q.done))return dKey(d);d=addDays(d,-1)}return null}
{const _m=rcMatch;rcMatch=function(r,k){if(r.rule!=='after')return _m(r,k);if(r.start&&k<r.start)return false;const dd=S.days[k];if(dd&&dd.tasks&&dd.tasks.some(q=>q.recurId===r.id))return true;if(k>todayKey())return false;
  const n=Math.max(1,+r.n||1),last=rcLastDone(r,dKey(addDays(keyToDate(k),-1)));if(!last)return true;return k>=dKey(addDays(keyToDate(last),n))}}
{const _d=rcDesc;rcDesc=function(r){return r.rule==='after'?t('rca.desc',r.n||1):_d(r)}}
{const rb=$('#rcBtn');if(rb){const _oc=rb.onclick;rb.onclick=e=>{_oc&&_oc(e);setTimeout(()=>{const p=$('#ppPop'),txt=$('#taskIn').value.trim();if(!p||!txt||p.querySelector('#rcaN'))return;const anchor=p.querySelector('.rcnw')||p.querySelector('[data-r="monthly"]');if(!anchor)return;
  anchor.insertAdjacentHTML('afterend',`<div class="rcaft"><span>⏳ ${t('rca.l1')}</span><input class="in num" type="number" min="1" max="365" value="3" id="rcaN" aria-label="${esc(t('rca.l1'))}"><span>${t('rca.l2')}</span><button class="btn sm" id="rcaGo">${t('add')}</button></div>`);
  const go=()=>{const n=Math.max(1,Math.min(365,parseInt($('#rcaN').value)||1)),rule={id:uid(),text:txt,start:todayKey(),rule:'after',n};RC().push(rule);$('#taskIn').value='';closePP();ensureRecur();save();renderTasks();toast(t('rc.saved',rcDesc(rule)))};
  $('#rcaGo').onclick=go;$('#rcaN').onkeydown=ev=>{if(ev.key==='Enter')go()};$('#rcaN').onclick=ev=>ev.stopPropagation()},60)}}}
/* 32: #tags work like @contexts: they appear in the bar above the tasks and filter them */
ctxOf=function(text){return[...String(text).matchAll(/(?:^|\s)([@#])([\p{L}\p{N}_-]+)/gu)].map(m=>m[1]+m[2])};
/* 41: a task becomes a daily habit in one tap */
{hookFn('uxMenuExtras',()=>uxMenuExtras,f=>{uxMenuExtras=f},'post',function(k,id){try{const p=$('#ppPop'),d=day(k),x=d.tasks.find(q=>q.id===id);if(!p||!x||p.querySelector('[data-hb2]'))return;
  p.insertAdjacentHTML('beforeend',`<button data-hb2="1">🌱 ${t('hb2.fromTask')}</button>`);p.querySelector('[data-hb2]').onclick=()=>{closePP();hbFromTask(k,id)}}catch(e){console.error(e)}})}
function hbFromTask(k,id){const d=day(k),x=d.tasks.find(q=>q.id===id);if(!x)return;const name=(x.text.replace(/(^|\s)[#@][\p{L}\p{N}_-]+/gu,' ').replace(/\s+/g,' ').trim()||x.text).slice(0,40);
  const sT=JSON.stringify(d.tasks),sR=JSON.stringify(RC()),sH=JSON.stringify(HB()),sOn=S.settings.habitsOn;const h={id:uid(),name,icon:'🌱',type:'check'};HB().push(h);
  if(x.done){const td=day(todayKey());td.hb=td.hb||{};td.hb[h.id]=true}d.tasks=d.tasks.filter(q=>q.id!==id);if(x.recurId)S.recur=RC().filter(r=>r.id!==x.recurId);if(S.settings.habitsOn===false)S.settings.habitsOn=true;save();renderTasks();renderTodayEv();
  toastAct(t('hb2.made',name),t('lsh.undo'),()=>{d.tasks=JSON.parse(sT);S.recur=JSON.parse(sR);S.habits=JSON.parse(sH);S.settings.habitsOn=sOn;const td=S.days[todayKey()];if(td&&td.hb)delete td.hb[h.id];save();renderTasks();renderTodayEv()})}
/* 130: habits with a quantity and a unit, or counted from the timer (minutes of a category) */
function hbCatMin(h,k){const T=totals(k||todayKey()),top=rollBy(T.by),ms=top[h.cat]!=null?top[h.cat]:(T.by[h.cat]||0);return Math.round(ms/6e4)}
{const _v=hbVal;hbVal=function(id,k){const h=S.habits&&S.habits.find(x=>x.id===id);if(h&&h.cat){const m=hbCatMin(h,k);return m>0?m:undefined}return _v(id,k)}}
function hbUnit(h){return h.type==='hours'?t('u.h'):h.type==='min'?t('u.m'):(h.unit?' '+h.unit:'')}
hbChips=function(){const k=todayKey();return HB().filter(h=>!h.off).map(h=>{const v=hbVal(h.id),done=hbDone(h,k),q=h.type!=='check';const val=q&&v!=null?' '+v+(h.goal&&!done?'/'+h.goal:'')+hbUnit(h):done?' ✓':'';
  return`<span class="evchip hbchip ${done?'done':''}${q&&h.goal&&v!=null&&!done?' part':''}" data-hb="${h.id}" style="--c:${done?'#22c55e':'#64748b'}${q&&h.goal?';--hp:'+Math.min(100,Math.round((+v||0)/h.goal*100))+'%':''}"><i></i>${h.icon} ${esc(h.name)}${val}</span>`}).join('')};
{const _a=hbAsk;hbAsk=function(h,anchor){if(h&&h.cat){const c=catRaw(h.cat);toast(t('hb2.auto',c?kidName(c):'—',hbCatMin(h)+t('u.m')+(h.goal?' / '+h.goal+t('u.m'):'')));return}_a(h,anchor);
  try{if(!h||(h.type!=='count'&&h.type!=='min'))return;const p=$('#ppPop'),g=p&&p.querySelector('.estg');if(!g||p.querySelector('.hbinc'))return;const cur=+hbVal(h.id)||0;
    g.insertAdjacentHTML('beforebegin',`<div class="hbinc"><span>${t('hb2.now',cur+hbUnit(h))}</span>${[1,5,10].map(n=>`<button data-inc="${n}">+${n}</button>`).join('')}</div>`);
    p.querySelectorAll('[data-inc]').forEach(b=>b.onclick=()=>{closePP();hbSet(h,cur+ +b.dataset.inc);vib(10)})}catch(e){console.error(e)}}}
{hookFn('openHabits',()=>openHabits,f=>{openHabits=f},'post',function(){try{const box=$('#infoBox .ibadd'),ty=$('#hbType');if(!box||!ty||$('#hbUnit'))return;
  ty.insertAdjacentHTML('beforeend',`<option value="min">${t('hb.type.min')}</option>`);
  $('#hbGoal').insertAdjacentHTML('afterend',`<input class="in" id="hbUnit" dir="auto" placeholder="${esc(t('hb2.unitPh'))}" style="width:96px"><select class="in" id="hbCat" hidden><option value="">${t('hb2.manual')}</option>${topCats().map(c=>`<option value="${c.id}">${esc(kidName(c))}</option>`).join('')}</select>`);
  const sync=()=>{const v=ty.value;$('#hbUnit').hidden=v!=='count';$('#hbCat').hidden=v!=='min';$('#hbGoal').placeholder=v==='min'?t('hb2.goalMin'):t('hb.goalPh')};ty.onchange=sync;sync();
  $('#hbAdd').onclick=()=>{const n=$('#hbName').value.trim();if(!n)return;const type=ty.value,h={id:uid(),name:n,icon:$('#hbIcon').value.trim()||'🌱',type,goal:+$('#hbGoal').value||undefined};if(type==='count'&&$('#hbUnit').value.trim())h.unit=$('#hbUnit').value.trim();if(type==='min'&&$('#hbCat').value)h.cat=$('#hbCat').value;HB().push(h);save();openHabits();renderTodayEv()};
  $$('#hbGrid .hbrow').forEach(r=>{const h=HB().find(x=>x.id===r.dataset.id);if(!h)return;const sm=r.querySelector('.hbn small');if(sm&&h.cat){const c=catRaw(h.cat);sm.insertAdjacentHTML('beforeend',` · ⏱ ${esc(c?kidName(c):'')}`)}else if(sm&&h.unit)sm.insertAdjacentHTML('beforeend',` · ${esc(h.unit)}`)})}catch(e){console.error(e)}})}
/* 44: a weekly goal per category (hours), shown under the week line on Today and set from Settings or that line */
function cwgGoals(){return S.settings.catWk||{}}
function cwgWeek(){const keys=periodKeys('week',keyToDate(todayKey())),by={};keys.forEach(k=>{if(k>todayKey())return;const r=rollBy(totals(k).by);for(const c in r)by[c]=(by[c]||0)+r[c]});return by}
function cwgPaint(){const wk=$('#glWeek');if(!wk)return;let box=$('#cwgBox');const G=cwgGoals(),ids=topCats().filter(c=>+G[c.id]>0);if(!ids.length){if(box)box.remove();return}
  if(!box){wk.insertAdjacentHTML('afterend','<div class="cwg" id="cwgBox"></div>');box=$('#cwgBox')}const by=cwgWeek();
  box.innerHTML=`<div class="cwgh"><span>🎯 ${t('cwg.t')}</span><button class="link" id="cwgEd" aria-label="${esc(t('cwg.edit'))}" title="${esc(t('cwg.edit'))}">✎</button></div>`+ids.map(c=>{const ms=by[c.id]||0,g=+G[c.id]*36e5,ok=ms>=g;return`<div class="cwgr${ok?' met':''}"><span dir="auto">${esc(kidName(c))}</span><div class="bar"><i style="width:${Math.min(100,ms/g*100)}%;background:${c.color}"></i></div><em>${fmtHM(ms)} / ${+G[c.id]}${t('u.h')}${ok?' ✓':''}</em></div>`}).join('');
  $('#cwgEd').onclick=cwgOpen}
function cwgOpen(){const G=Object.assign({},cwgGoals()),by=cwgWeek();openInfo('🎯 '+t('cwg.t'),`<p class="muted" style="margin:0 0 10px;font-size:13px">${t('cwg.sub')}</p><div class="cwgset">${topCats().map(c=>`<label><span class="dot" style="background:${c.color}"></span><span dir="auto">${esc(kidName(c))}</span><small>${fmtHM(by[c.id]||0)}</small><input class="in num" type="number" min="0" max="120" step="0.5" data-cw="${c.id}" value="${G[c.id]||''}" placeholder="0" aria-label="${esc(kidName(c))}"><span>${t('u.h')}</span></label>`).join('')}</div>`);
  $$('#infoBox [data-cw]').forEach(i=>i.onchange=()=>{const v=Math.max(0,+i.value||0);const o=S.settings.catWk=Object.assign({},cwgGoals());if(v)o[i.dataset.cw]=v;else delete o[i.dataset.cw];save();try{renderGlass()}catch(e){}})}
{hookFn('renderGlass',()=>renderGlass,f=>{renderGlass=f},'post',function(){try{cwgPaint()}catch(e){console.error(e)}})}
{hookFn('renderSettings',()=>renderSettings,f=>{renderSettings=f},'post',function(){try{const wi=$('#weekGoalIn'),fd=wi&&wi.closest('.field');if(!fd||$('#cwgSet'))return;fd.insertAdjacentHTML('afterend',`<div class="field" id="cwgSet"><div><label data-i18n="cwg.t">${t('cwg.t')}</label><small>${t('cwg.setSub')}</small></div><div class="inline"><button class="btn sm" id="cwgSetB">🎯 ${t('cwg.edit')}</button></div></div>`);$('#cwgSetB').onclick=cwgOpen}catch(e){console.error(e)}})}
