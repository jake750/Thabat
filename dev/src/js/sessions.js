/* ============ sessions ============ */
function addSession(cat,start,end,extra){while(end-start>=1000){const b=Math.min(end,dayBoundaryAfter(start));day(keyOf(start)).sessions.push(Object.assign({id:uid(),cat,start,end:b},extra||{}));start=b}save()}
function totals(k){const d=S.days[k],by={};let tot=0;
  if(d)for(const s of d.sessions){const ms=s.end-s.start;by[s.cat]=(by[s.cat]||0)+ms;tot+=ms}
  const T=S.timer;if(T.mode==='work'&&T.start){let st=T.start;const now=Date.now();while(st<now){const b=Math.min(now,dayBoundaryAfter(st));if(keyOf(st)===k){by[T.cat]=(by[T.cat]||0)+(b-st);tot+=b-st}st=b}}
  return{tot,by}}
function goalMs(k){return((S.days[k]&&S.days[k].goal)||wdGoal(k))*36e5}
function wdGoal(k){const G=S.settings.goalWd;if(G&&k){const v=G[keyToDate(k).getDay()];if(v!=null&&v!==''&&+v>0)return Math.max(0.5,+v)}return S.settings.goalHours}
const catRaw=id=>S.settings.categories.find(c=>c.id===id);
const catOf=id=>{const c=catRaw(id);if(!c)return{id,name:t('other'),color:'#888'};if(c.parent){const p=catRaw(c.parent);return Object.assign({},c,{color:p?p.color:c.color||'#888'})}return c};
const topOf=id=>{const c=catRaw(id);return c&&c.parent&&catRaw(c.parent)?c.parent:id};
const topCats=()=>S.settings.categories.filter(c=>!c.parent);
const kidsOf=id=>S.settings.categories.filter(c=>c.parent===id);
function rollBy(by){const r={};for(const id in by){const q=topOf(id);r[q]=(r[q]||0)+by[id]}return r}
function catRowsHTML(by,g){const top=rollBy(by);return topCats().map(c=>{const ms=top[c.id]||0;let h=`<div class="catrow"><span>${esc(kidName(c))}</span><div class="bar"><i style="width:${Math.min(100,ms/g*100)}%;background:${c.color}"></i></div><em>${fmtHM(ms)}</em></div>`;
  kidsOf(c.id).forEach(k=>{const m=by[k.id]||0;if(m>0)h+=`<div class="catrow sub"><span>${esc(kidName(k))}</span><div class="bar"><i style="width:${Math.min(100,m/g*100)}%;background:${c.color}"></i></div><em>${fmtHM(m)}</em></div>`});return h}).join('')}

