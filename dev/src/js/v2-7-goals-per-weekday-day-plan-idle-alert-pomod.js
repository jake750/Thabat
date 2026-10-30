/* ============ v2.7: goals per weekday, day plan, idle alert, pomodoro, distractions, undo, session notes, day timeline, brief insights ============ */
function toastAct(msg,label,fn,ms=8000){const el=document.createElement('div');el.className='toast act';el.innerHTML=`<span>${esc(msg)}</span><button class="btn sm pri">${esc(label)}</button>`;$('#toasts').append(el);const tm=setTimeout(()=>el.remove(),ms);el.querySelector('button').onclick=()=>{clearTimeout(tm);el.remove();fn()}}
/* session log with notes and undo */
function sessNoteEdit(li,s){if(typeof dsOpen==='function'){dsOpen(todayKey(),'note:'+s.id,s.id);return}li.innerHTML=`<i style="background:${catOf(s.cat).color}"></i><input class="in" dir="auto" placeholder="${esc(t('sess.notePh'))}" value="${esc(s.note||'')}">`;const inp=li.querySelector('input');inp.focus();
  const done=ok=>{if(ok){const v=inp.value.trim();if(v)s.note=v;else delete s.note;save()}renderLog()};inp.onkeydown=e=>{if(e.key==='Enter')done(true);if(e.key==='Escape')done(false)};inp.onblur=()=>done(true)}
renderLog=function(){const k=todayKey(),d=S.days[k];const ss=d?[...d.sessions].reverse():[];
  $('#sessLog').innerHTML=ss.map(s=>{const c=catOf(s.cat);return`<li data-sid="${s.id}"><i style="background:${c.color}"></i><b>${esc(catName(c))}</b> <span dir="ltr">${fmtT(s.start)} – ${fmtT(s.end)}</span> · ${fmtHM(s.end-s.start)}${s.note?` · <span class="sn" dir="auto">${esc(s.note)}</span>`:''}<button class="x link sne" title="${esc(t('sess.note'))}">✎</button><button class="x link sdel">${t('del')}</button></li>`}).join('');
  $$('#sessLog li').forEach(li=>{const dd=day(k),s=dd.sessions.find(x=>x.id===li.dataset.sid);if(!s)return;
    li.querySelector('.sne').onclick=()=>sessNoteEdit(li,s);
    li.querySelector('.sdel').onclick=()=>{dd.sessions=dd.sessions.filter(x=>x!==s);let m=null;if(s.mediaId){m=dd.media.find(x=>x.id===s.mediaId);if(m)m.counted=false}save();renderLog();renderGlass();renderMedia();
      toastAct(t('undo.sess'),t('undo'),()=>{const d2=day(k);d2.sessions.push(s);d2.sessions.sort((a,b)=>a.start-b.start);if(m)m.counted=true;save();renderLog();renderGlass();renderMedia()},10000)}})};
/* pomodoro + note prompt after a session */
function pomoCfg(){return Object.assign({on:false,work:25,brk:5,long:15,every:4},S.settings.pomo||{})}
{const _ta=timerAct;timerAct=function(a){const wasWork=S.timer.mode==='work';_ta(a);const T=S.timer;if(a==='start'||a==='resume'){T.pomoAlerted=false;save()}
  if(a==='stop'&&wasWork){const d=S.days[todayKey()],last=d&&d.sessions[d.sessions.length-1];if(last&&!last.note)toastAct(t('sess.ended',fmtHM(last.end-last.start)),t('sess.addNote'),()=>{const li=$(`#sessLog [data-sid="${last.id}"]`);if(li)sessNoteEdit(li,last)})}}}
{const _rt=renderTimer;renderTimer=function(){_rt();const P=pomoCfg(),T=S.timer;if(!P.on||T.mode!=='work'||!T.start)return;if(T.pomoDay!==todayKey()){T.pomoDay=todayKey();T.pomoN=0}
  const left=P.work*6e4-(Date.now()-T.start);$('#tState').textContent+=` · 🍅 ${(T.pomoN||0)+1} · ${left>0?fmtClock(left).slice(3):'00:00'}`;
  if(left<=0&&!T.pomoAlerted){T.pomoAlerted=true;T.pomoN=(T.pomoN||0)+1;const d=day(todayKey());d.pomo=(d.pomo||0)+1;const long=T.pomoN%Math.max(2,P.every)===0,mins=long?P.long:P.brk;save();startBreak(mins);alertUser(t('pomo.doneT',T.pomoN),t(long?'pomo.longB':'pomo.brkB',minW(mins)),ICON_CUP)}}}
/* distraction button while working */
{const _rtb=renderTimerBtns;renderTimerBtns=function(){_rtb();if(S.timer.mode!=='work')return;const d=day(todayKey()),n=(d.distract||[]).length;const b=document.createElement('button');b.className='btn ghost sm dstr';b.title=t('dst.tip');b.textContent='😵 '+t('dst.btn')+(n?' · '+n:'');
  b.onclick=()=>{d.distract=(d.distract||[]).concat(Date.now());save();vib(12);const m=d.distract.length;b.textContent='😵 '+t('dst.btn')+' · '+m;toast(t('dst.logged',m))};$('#tBtns').append(b)}}
/* idle alert */
function idleCfg(){return Object.assign({on:false,from:'09:00',to:'18:00',min:60},S.settings.idle||{})}
function idleCheck(){const I=idleCfg();if(!I.on||S.timer.mode!=='idle'||S.prayPop)return;const k=todayKey();if(typeof isVac==='function'&&isVac(k))return;const now=Date.now(),td=keyToDate(k),f=atTime(td,I.from),to=atTime(td,I.to);if(now<f||now>to)return;
  const d=S.days[k],lastEnd=Math.max(f,...((d&&d.sessions)||[]).map(s=>s.end),S.timer.brkStart||0,S.idleAt||0);if(now-lastEnd<I.min*6e4)return;S.idleAt=now;save();alertUser(t('idle.t'),t('idle.b',minW(Math.round((now-lastEnd)/6e4))),ICON_CLOCK)}
setInterval(idleCheck,6e4);
/* day plan */
function openPlan(){const k=todayKey(),d=day(k),P=d.plan||{};$('#planBox').innerHTML=`<h2 style="font-size:18px">${t('plan.t')}</h2><p style="color:var(--muted);font-size:12.5px">${t('plan.p')}</p><div class="plgrid">${topCats().map(c=>`<label><i style="background:${c.color}"></i><b>${esc(kidName(c))}</b><input class="in num" type="number" min="0" step="0.25" data-c="${c.id}" value="${P[c.id]||''}" placeholder="0"><span>${t('u.h')}</span></label>`).join('')}</div><small id="planSum" style="color:var(--muted)"></small>
  <div class="evact">${d.plan?`<button class="btn sm ghost danger" id="planClr">${t('plan.clear')}</button>`:''}<span style="flex:1"></span><button class="btn sm ghost" id="planX">${t('ev.cancel')}</button><button class="btn sm pri" id="planOk">${t('ev.save')}</button></div>`;
  const sum=()=>{let h=0;$$('#planBox [data-c]').forEach(x=>h+=+x.value||0);$('#planSum').textContent=t('plan.sum',fnum(h),goalMs(k)/36e5)};$$('#planBox [data-c]').forEach(x=>x.oninput=sum);sum();
  $('#planX').onclick=()=>$('#planModal').classList.remove('on');const c=$('#planClr');if(c)c.onclick=()=>{delete d.plan;save();$('#planModal').classList.remove('on');renderGlass()};
  $('#planOk').onclick=()=>{const p={};$$('#planBox [data-c]').forEach(x=>{const v=+x.value;if(v>0)p[x.dataset.c]=v});if(Object.keys(p).length)d.plan=p;else delete d.plan;save();$('#planModal').classList.remove('on');renderGlass()};
  $('#planModal').classList.add('on')}
$('#planBtn').onclick=openPlan;$('#planModal').onclick=e=>{if(e.target.id==='planModal')$('#planModal').classList.remove('on')};
/* day timeline (fajr → isha) */
function renderDayTL(){const box=$('#dayTL');if(!box)return;const k=todayKey(),segs=timeline(k),pt=prayerTimes(keyToDate(k)),now=Date.now();
  const first=segs.length?segs[0].t0:pt.fajr,lastE=segs.length?Math.max(...segs.map(x=>x.t0+x.ms)):0;let a=Math.min(pt.fajr,first),b=Math.max(pt.isha+36e5,lastE,Math.min(now,pt.isha+3*36e5));const W=b-a;if(W<=0){box.innerHTML='';return}
  const x=v=>((v-a)/W*100).toFixed(2)+'%',rtl=document.documentElement.dir==='rtl',side=rtl?'right':'left';
  box.innerHTML=`<h4>${t('dtl.t')}</h4><div class="bar">${segs.map(s=>`<i style="${side}:${x(s.t0)};width:${(s.ms/W*100).toFixed(2)}%;background:${catOf(s.cat).color}" title="${esc(catName(catOf(s.cat)))} ${fmtT(s.t0)}–${fmtT(s.t0+s.ms)}"></i>`).join('')}${now>a&&now<b?`<i class="nw" style="${side}:${x(now)}"></i>`:''}</div>
   <div class="pts">${['fajr','dhuhr','asr','maghrib','isha'].map(p=>`<span style="${side}:${x(pt[p])};${rtl?'transform:translateX(50%)':''}">${t('pr.'+p)}<br>${fmtT(pt[p])}</span>`).join('')}</div>`}
/* plan bars + week progress + timeline after the wall renders */
function weekGoal(){return+(S.settings.weekGoal||0)}
{const _rg=renderGlass;renderGlass=function(){_rg();try{const k=todayKey(),d=S.days[k],P=d&&d.plan;
  if(P&&Object.keys(P).length){const {by}=totals(k),top=rollBy(by);$('#catBars').innerHTML=topCats().map(c=>{const ms=top[c.id]||0,pl=(P[c.id]||0)*36e5;if(!pl&&!ms)return'';const den=pl||goalMs(k);return`<div class="catrow ${pl&&ms>=pl?'met':''}"><span>${esc(kidName(c))}</span><div class="bar"><i style="width:${Math.min(100,ms/den*100)}%;background:${c.color}"></i></div><em>${fmtHM(ms)}${pl?`<span class="pl"> / ${fmtHM(pl)}</span>`:''}${pl&&ms>=pl?' ✓':''}</em></div>`}).join('')}
  $('#planBtn').textContent=P?'📋 '+t('plan.edit'):'📋 '+t('plan.btn');
  const wg=weekGoal();if(wg){const keys=periodKeys('week',keyToDate(k));const tot=keys.reduce((a,x)=>a+totals(x).tot,0);$('#glWeek').textContent=t('wg.line',fmtHM(tot),wg,Math.round(tot/(wg*36e5)*100))}else $('#glWeek').textContent='';
  renderDayTL()}catch(e){}}}
/* brief: 4-period average, week goal, best hours, prayer ↔ productivity */
function hoursHist(keys){const h=Array(24).fill(0);for(const k of keys){for(const s of timeline(k)){let a=s.t0;const e=s.t0+s.ms;while(a<e){const d=new Date(a),nx=new Date(d.getFullYear(),d.getMonth(),d.getDate(),d.getHours()+1).getTime(),b=Math.min(e,nx);h[d.getHours()]+=b-a;a=b}}}return h}
function renderBriefExtra(){const keys=periodKeys(bMode,bAnchor),tk=todayKey(),st=periodStats(keys);
  {const prev=[];for(let i=1;i<=(bMode==='week'?4:3);i++){const an=bMode==='week'?addDays(bAnchor,-7*i):new Date(bAnchor.getFullYear(),bAnchor.getMonth()-i,1);prev.push(periodStats(periodKeys(bMode,an)).tot)}
   const n=prev.filter(x=>x>0).length,avg=n?prev.reduce((a,b)=>a+b,0)/n:0,tile=$('#bTiles .tile .s');if(tile&&avg>0){const pc=Math.round((st.tot-avg)/avg*100);tile.insertAdjacentHTML('beforeend',`<div>${t(bMode==='week'?'brief.avg4w':'brief.avg3m',fmtHM(avg),`<span class="${pc>=0?'up':'dn'}">${pc>=0?'▲':'▼'} ${Math.abs(pc)}%</span>`)}</div>`)}
   const wg=weekGoal();if(wg&&bMode==='week'&&tile)tile.insertAdjacentHTML('beforeend',`<div>${t('wg.brief',wg,Math.round(st.tot/(wg*36e5)*100))}</div>`)}
  const box=$('#bHours');if(box){const H=hoursHist(keys),mx=Math.max(...H),ord=H.map((v,i)=>[v,i]).filter(x=>x[0]>0).sort((a,b)=>b[0]-a[0]).slice(0,3).map(x=>x[1]),past=keys.filter(k=>k<=tk);
    const dist=past.reduce((a,k)=>a+((S.days[k]&&S.days[k].distract)||[]).length,0),pomo=past.reduce((a,k)=>a+((S.days[k]&&S.days[k].pomo)||0),0),notes=past.reduce((a,k)=>a+((S.days[k]&&S.days[k].sessions)||[]).filter(x=>x.note).length,0);
    box.innerHTML=`<h3><span>${t('bh.title')}</span><span style="font-size:13px;color:var(--muted)">${ord.length?t('bh.best',ord.sort((a,b)=>a-b).map(h=>pad(h)+':00').join('، ')):''}</span></h3>`+(mx>0?`<div class="hrs">${H.map((v,i)=>`<i class="${ord.includes(i)?'top':''}" style="height:${Math.max(2,v/mx*100)}%" title="${pad(i)}:00 · ${fmtHM(v)}"></i>`).join('')}</div><div class="hrx">${H.map((_,i)=>`<span>${i%3===0?i:''}</span>`).join('')}</div>`:`<div class="empty" style="padding:6px 0">${t('bh.none')}</div>`)+`<div class="bhstat"><span>😵 ${t('bh.dist')}: <b>${dist}</b></span>${pomo?`<span>🍅 ${t('bh.pomo')}: <b>${pomo}</b></span>`:''}<span>✎ ${t('bh.notes')}: <b>${notes}</b></span></div>`}
  const bp=$('#bPray');if(bp){const ks=keys.filter(k=>k<=tk&&k>=plSince()&&k<tk);const good=[],other=[];ks.forEach(k=>{const all=PRAYERS.every(p=>['on','auto'].includes(plStatus(k,p)));(all?good:other).push(totals(k).tot)});
    if(good.length&&other.length){const av=a=>a.reduce((x,y)=>x+y,0)/a.length;bp.insertAdjacentHTML('beforeend',`<div class="bpcorr">${t('bp.corr',`<b>${fmtHM(av(good))}</b>`,`<b>${fmtHM(av(other))}</b>`,good.length,other.length)}</div>`)}}}
{hookFn('renderBrief',()=>renderBrief,f=>{renderBrief=f},'post',function(){try{renderBriefExtra()}catch(e){console.error(e)}})}
/* settings for this block */
function renderV27Set(){const st=S.settings;
  toggle($('#goalWdT'),!!st.goalWd,v=>{st.goalWd=v?Array(7).fill(null).map(()=>st.goalHours):null;setTimeout(()=>{renderV27Set();wdApply()},0)});
  $('#goalWdRow').hidden=!st.goalWd;if(st.goalWd){$('#goalWdIn').innerHTML=[1,2,3,4,5,6,0].map(i=>`<label>${L().days[i].slice(0,LANG==='ar'?6:3)}<input class="in num" type="number" min="0.5" step="0.5" data-wd="${i}" value="${st.goalWd[i]??st.goalHours}"></label>`).join('');$$('#goalWdIn [data-wd]').forEach(x=>x.onchange=()=>{st.goalWd[+x.dataset.wd]=Math.max(0.5,+x.value||st.goalHours);save();wdApply()})}
  $('#weekGoalIn').value=st.weekGoal||'';$('#weekGoalIn').onchange=e=>{st.weekGoal=Math.max(0,+e.target.value||0);save();renderGlass()};
  const P=pomoCfg();toggle($('#pomoT'),P.on,v=>{st.pomo=Object.assign(pomoCfg(),{on:v});setTimeout(renderV27Set,0)});$('#pomoRow').hidden=!P.on;
  [['#pomoW','work'],['#pomoB','brk'],['#pomoL','long'],['#pomoE','every']].forEach(([id,f])=>{$(id).value=P[f];$(id).onchange=e=>{const v=Math.max(1,+e.target.value||P[f]);st.pomo=Object.assign(pomoCfg(),{[f]:v});save()}});
  const I=idleCfg();toggle($('#idleT'),I.on,v=>{st.idle=Object.assign(idleCfg(),{on:v});setTimeout(renderV27Set,0)});$('#idleRow').hidden=!I.on;
  [['#idleF','from'],['#idleTo','to'],['#idleM','min']].forEach(([id,f])=>{$(id).value=I[f];$(id).onchange=e=>{st.idle=Object.assign(idleCfg(),{[f]:f==='min'?Math.max(15,+e.target.value||60):e.target.value||I[f]});save()}})}
function wdApply(){const tk=todayKey();for(const k in S.days){if(k>=tk&&!S.days[k].goalManual)S.days[k].goal=wdGoal(k)}save();renderGlass()}
{hookFn('renderSettings',()=>renderSettings,f=>{renderSettings=f},'post',function(){try{renderV27Set()}catch(e){console.error(e)}})}

