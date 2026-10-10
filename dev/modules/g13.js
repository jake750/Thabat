/* ============ v3.11: Mulk before sleep, prayer delay reasons, flexible repeats, stuck tasks, lighter-day postpone, Ramadan countdown, focus by prayer period ============ */
/* ---- Surat al-Mulk before sleep: one task a day after Isha (fixed id so synced devices do not duplicate it) ---- */
function ensureMulk(){if(S.settings.mulk===false)return;const k=todayKey(),d=day(k);if(d.mulk)return;d.mulk=1;const id='mulk-'+k;if(!d.tasks.some(x=>x.id===id))d.tasks.push({id,text:t('mlk.task'),done:false,created:Date.now(),auto:'mulk',after:'isha'});save()}
{const _ek=ensureKahf;ensureKahf=function(){_ek();try{ensureMulk()}catch(e){console.error(e)}}}

/* ---- why was a prayer late? asked once when it is logged late ---- */
const LATE_WHY=['sleep','work','forgot','travel','other'];
function lateAsk(dk,k){const d=day(dk);if((d.lateWhy||{})[k])return;const z=uiZoom(),x=innerWidth/2,y=innerHeight/3;
  const p=qPopAt(`<div class="aymh">${t('lw.q',t('pr.'+k))}</div>${LATE_WHY.map(w=>`<button data-w="${w}">${t('lw.'+w)}</button>`).join('')}`,x,y,'aymenu');
  p.querySelectorAll('[data-w]').forEach(b=>b.onclick=()=>{closePP();(d.lateWhy=d.lateWhy||{})[k]=b.dataset.w;save()})}
{const _ps=plSet;plSet=function(dk,k,v){_ps(dk,k,v);try{if(v==='late')setTimeout(()=>lateAsk(dk,k),250);else if(S.days[dk]&&S.days[dk].lateWhy)delete S.days[dk].lateWhy[k]}catch(e){}}}
{const _pd=prayDone;prayDone=function(...a){const P=S.prayPop;const r=_pd(...a);try{if(P){const dk=P.dk||todayKey();setTimeout(()=>{if(plStatus(dk,P.k)==='late')lateAsk(dk,P.k)},900)}}catch(e){}return r}}
function lateStats(keys){const c={};keys.forEach(k=>{const w=(S.days[k]||{}).lateWhy;if(w)Object.values(w).forEach(v=>c[v]=(c[v]||0)+1)});return Object.entries(c).sort((a,b)=>b[1]-a[1])}
{const _rbp=renderBriefPray;renderBriefPray=function(){_rbp();try{const box=$('#bPray');if(!box)return;const L_=lateStats(periodKeys(bMode,bAnchor));if(!L_.length)return;box.insertAdjacentHTML('beforeend',`<div class="lwst">${t('lw.st')} ${L_.map(([w,n])=>`<span>${t('lw.'+w)} <b>${n}</b></span>`).join(' · ')}</div>`)}catch(e){console.error(e)}}}

/* ---- repeats «3 times a week»: a task appears each day until it is done that many times in the week ---- */
function rcWeekDone(r,k){const ks=periodKeys('week',keyToDate(k));let n=0;ks.forEach(x=>{if(x>k)return;const d=S.days[x];if(d)d.tasks.forEach(q=>{if(q.recurId===r.id&&q.done&&(x<k||true))n++})});return n}
{const _m=rcMatch;rcMatch=function(r,k){if(r.rule!=='nw')return _m(r,k);if(r.start&&k<r.start)return false;const d=S.days[k],has=d&&d.tasks.some(q=>q.recurId===r.id);if(has)return true;return rcWeekDone(r,k)<(r.n||3)}}
{const _d=rcDesc;rcDesc=function(r){return r.rule==='nw'?t('rc.nw',r.n||3):_d(r)}}
{const _p=uxParse;uxParse=function(raw){const m=(' '+raw+' ').match(/(?<=\s)(\d+) ?(?:مرات|مرّات|مرة|مرّة|times?|x) ?(?:في|بال|a|per|\/) ?(?:الأسبوع|الاسبوع|أسبوع|اسبوع|week|wk)(?=\s)/i);
  if(m){const rest=(' '+raw+' ').replace(m[0],' ').replace(/\s+/g,' ').trim(),o=_p(rest)||{text:rest};if(!o.text)return null;delete o.d;o.rec={rule:'nw',n:Math.max(1,Math.min(7,+m[1]))};return o}return _p(raw)}}
{const _l=uxParseLabel;uxParseLabel=function(p){if(p.rec&&p.rec.rule==='nw'){const q=Object.assign({},p,{rec:null});const rest=_l(q);return'🔁 '+t('rc.nw',p.rec.n)+(rest?' · '+rest:'')}return _l(p)}}
/* the 🔁 button gets «N times a week» too */
{const rb=$('#rcBtn');if(rb){const _oc=rb.onclick;rb.onclick=e=>{_oc&&_oc(e);setTimeout(()=>{const p=$('#ppPop'),txt=$('#taskIn').value.trim();if(!p||!txt||p.querySelector('[data-nw]'))return;const anchor=p.querySelector('[data-r="monthly"]');if(!anchor)return;
  anchor.insertAdjacentHTML('afterend',`<div class="wdch rcnw">${[2,3,4,5].map(n=>`<button data-nw="${n}">${t('rc.nw',n)}</button>`).join('')}</div>`);
  p.querySelectorAll('[data-nw]').forEach(b=>b.onclick=()=>{const rule={id:uid(),text:txt,start:todayKey(),rule:'nw',n:+b.dataset.nw};RC().push(rule);$('#taskIn').value='';closePP();ensureRecur();save();renderTasks();toast(t('rc.saved',rcDesc(rule)))})},30)}}}

/* ---- stuck tasks: carried or postponed three times or more → split or drop ---- */
function tkChain(x){let n=x.carryN||0,k=0,cur=x;while(cur&&cur.from&&k<20){const p=S.days[cur.from]&&S.days[cur.from].tasks.find(q=>q.id===cur.fromId);if(!p)break;n+=1+(p.carryN||0);cur=p;k++}return n}
{const _rt=renderTasks;renderTasks=function(){_rt();try{const tk=todayKey(),d=day(tk);$$('#tasks .task:not(.done)').forEach(li=>{const x=d.tasks.find(q=>q.id===li.dataset.id);if(!x||x.stuckOk||tkChain(x)<3)return;const tb=li.querySelector('.tb');if(!tb||tb.querySelector('.stk'))return;
  tb.insertAdjacentHTML('beforeend',`<div class="stk">🪨 ${t('stk.t',tkChain(x))} <button data-a="split">${t('stk.split')}</button><button data-a="drop">${t('stk.drop')}</button><button data-a="keep">${t('stk.keep')}</button></div>`);
  tb.querySelectorAll('.stk [data-a]').forEach(b=>b.onclick=e=>{e.stopPropagation();const a=b.dataset.a;if(a==='split'){const s=li.querySelector('.sadd');if(s)s.click()}else if(a==='drop'){const r=uxDelTask(tk,x.id);save();renderTasks();if(r)uxUndoDel(tk,[r])}else{x.stuckOk=1;save();renderTasks()}})})}catch(e){console.error(e)}}}

/* ---- postpone to the lightest day of the coming week ---- */
function lightDay(){const tk=todayKey();let best=null;for(let i=1;i<=7;i++){const k=dKey(addDays(keyToDate(tk),i));if(typeof isVac==='function'&&isVac(k))continue;const d=S.days[k],n=(d?d.tasks.filter(q=>!q.done).length:0)+evsOn(k).length*1.5;if(!best||n<best.n)best={k,n}}return best&&best.k}
{const _ux=uxMenuExtras;uxMenuExtras=function(k,id){_ux(k,id);try{const p=$('#ppPop'),x=day(k).tasks.find(q=>q.id===id);if(!p||!x||x.done)return;const lk=lightDay();if(!lk)return;const tm=p.querySelector('[data-ux]');const b=document.createElement('button');b.innerHTML=`🪶 ${t('ld.btn',dayLabel(lk))}`;b.onclick=()=>{closePP();postponeTask(k,id,lk)};
  const after=[...p.querySelectorAll('[data-ux]')].find(z=>z.textContent.includes(t('ux.tomorrow')));if(after)after.after(b);else if(tm)tm.before(b)}catch(e){console.error(e)}}}

/* ---- Today chips: Ramadan countdown (the existing chip covers the last 40 days; this one starts at 120) and «this day a year ago» (Hijri) ---- */
function ramadanIn(){const h=hNum(new Date());if(h.m===9)return 0;const base=new Date();base.setHours(12,0,0,0);for(let i=1;i<=360;i++){const d=addDays(base,i),x=hNum(d);if(x.m===9&&x.d===1)return i}return null}
function hYearAgoKey(){const h=hNum(new Date()),base=new Date();base.setHours(12,0,0,0);for(let i=350;i<=360;i++){const d=addDays(base,-i),x=hNum(d);if(x.y===h.y-1&&x.m===h.m&&x.d===h.d)return dKey(d)}return null}
{const _re=renderTodayEv;renderTodayEv=function(){_re();try{const box=$('#todayEv');if(!box)return;
  const n=ramadanIn();if(n&&n>40&&n<=120&&!box.querySelector('.rmdc'))box.insertAdjacentHTML('afterbegin',`<span class="evchip rmdc">🌙 ${t('rmd.in',n)}</span>`);
  const yk=hYearAgoKey(),d=yk&&S.days[yk];if(d){const ms=totals(yk).tot,dn=(d.tasks||[]).filter(q=>q.done).length,pr=PDL_P.filter(p=>{const s=plStatus(yk,p);return s==='on'||s==='auto'}).length;if(ms>=6e4||dn){const c=document.createElement('span');c.className='evchip yago';c.innerHTML=`📜 ${t('yago.t')}: ${[ms>=6e4?fmtHM(ms):'',dn?t('yago.tasks',dn):'',pr?t('yago.pr',pr):''].filter(Boolean).join(' · ')}`;c.title=gShort(keyToDate(yk));c.style.cursor='pointer';c.onclick=()=>{selKey=yk;calM=new Date(keyToDate(yk).getFullYear(),keyToDate(yk).getMonth(),1);showView('cal')};box.append(c)}}}catch(e){console.error(e)}}}

/* ---- bedtime for seven hours before Fajr, in the evening recap ---- */
function bedtimeFor(){const tm=addDays(keyToDate(todayKey()),1),f=prayerTimes(tm).fajr,need=(+(S.settings.sleepGoal||7))*36e5;return f-need-15*6e4}
{const _rc=uxRecap;uxRecap=function(){_rc();try{const c=$('#uxRecap');if(!c||c.querySelector('.bedt'))return;const b=bedtimeFor();c.insertAdjacentHTML('beforeend',`<div class="bedt">🛏 ${t('bed.t',fmtT(b),+(S.settings.sleepGoal||7))}</div>`)}catch(e){}}}

/* ---- year goals: where this pace ends ---- */
{const _oy=openYearGoals;openYearGoals=function(...a){const r=_oy(...a);try{const L_=YG(),now=new Date(),y0=new Date(now.getFullYear(),0,1),day=Math.max(1,(now-y0)/864e5),len=(new Date(now.getFullYear()+1,0,1)-y0)/864e5;
  $$('#infoBox .yg').forEach((el,i)=>{const g=L_[i];if(!g||!g.target)return;const proj=Math.round(g.done/day*len);let s;if(g.done>=g.target)s=t('yp.done');else if(!g.done)s=t('yp.none');else{const when=new Date(y0.getTime()+g.target/(g.done/day)*864e5);s=when.getFullYear()===now.getFullYear()?t('yp.when',L().months?L().months[when.getMonth()]:gShort(when)):t('yp.end',proj,g.target)}el.insertAdjacentHTML('beforeend',`<small class="ygp">📈 ${s}</small>`)})}catch(e){console.error(e)}return r}}

/* ---- keep the screen on while a focus session runs ---- */
let WK3=null;async function wakeSync(){try{const on=S.timer.mode==='work'&&S.settings.wakeWork!==false&&!document.hidden;if(on&&!WK3&&navigator.wakeLock){WK3=await navigator.wakeLock.request('screen');WK3.addEventListener('release',()=>{WK3=null})}else if(!on&&WK3){await WK3.release();WK3=null}}catch(e){WK3=null}}
{const _ta=timerAct;timerAct=function(...a){const r=_ta(...a);setTimeout(wakeSync,50);return r}}
document.addEventListener('visibilitychange',()=>setTimeout(wakeSync,100));setTimeout(wakeSync,2000);

/* ---- Summary: in which period between the prayers you focus most ---- */
function periodFocus(keys){const tot={};PDL_P.forEach(p=>tot[p]=0);keys.forEach(k=>{const sl=pdlSlots(k),segs=timeline(k).map(s=>({a:s.t0,b:s.t0+s.ms}));sl.forEach(s=>segs.forEach(g=>{const a=Math.max(g.a,s.t0),b=Math.min(g.b,s.t1);if(b>a)tot[s.p]+=b-a}))});return tot}
{const _rb=renderBrief;renderBrief=function(...a){const r=_rb(...a);try{let box=$('#bPeriods');if(!box){const pr=$('#bPray');if(!pr)return r;box=document.createElement('div');box.className='card';box.id='bPeriods';box.style.marginBottom='18px';pr.after(box)}
  const tot=periodFocus(periodKeys(bMode,bAnchor).filter(k=>k<=todayKey())),mx=Math.max(...Object.values(tot)),all=Object.values(tot).reduce((x,y)=>x+y,0);
  if(all<6e4){box.innerHTML=`<h3>${t('pf.t')}</h3><div class="empty">${t('pf.none')}</div>`;return r}const best=PDL_P.find(p=>tot[p]===mx);
  box.innerHTML=`<h3>${t('pf.t')}</h3><p class="pfb">${t('pf.best',tpaLabel(best),Math.round(mx/all*100))}</p>${PDL_P.map(p=>`<div class="catrow ${p===best?'met':''}"><span>${esc(tpaLabel(p))}</span><div class="bar"><i style="width:${mx?tot[p]/mx*100:0}%;background:var(--accent)"></i></div><em>${fmtHM(tot[p])}</em></div>`).join('')}`}catch(e){console.error(e)}return r}}

/* ---- what goes with good days: Fajr on time ---- */
{const _c=corr;corr=function(){const out=_c();try{const tk=todayKey(),A=[],B=[];for(let i=1;i<=60;i++){const k=dKey(addDays(keyToDate(tk),-i));if(!S.days[k])continue;const s=plStatus(k,'fajr'),w=totals(k).tot/36e5;if(s==='on'||s==='auto')A.push(w);else if(s==='late'||s==='miss')B.push(w)}
  if(A.length>=4&&B.length>=4){const a=A.reduce((x,y)=>x+y,0)/A.length,b=B.reduce((x,y)=>x+y,0)/B.length;if(b>0.2&&a/b>=1.15)out.unshift(t('fj.corr',Math.round(a/b*10)/10))}}catch(e){}return out}}
{const _rs=renderSettings;renderSettings=function(){_rs();try{toggle($('#mulkT'),S.settings.mulk!==false,v=>{S.settings.mulk=v;if(v)ensureMulk();renderTasks()});toggle($('#wakeT'),S.settings.wakeWork!==false,v=>{S.settings.wakeWork=v;wakeSync()})}catch(e){console.error(e)}}}
try{ensureMulk();renderTasks();renderTodayEv()}catch(e){console.error(e)}
