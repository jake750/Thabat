/* ============ v3.11: Mulk before sleep, prayer delay reasons, flexible repeats, stuck tasks, lighter-day postpone, Ramadan countdown, focus by prayer period ============ */
/* ---- Surat al-Mulk before sleep: one task a day after Isha (fixed id so synced devices do not duplicate it) ---- */
function ensureMulk(){if(S.settings.mulk===false)return;const k=todayKey(),d=day(k);if(d.mulk)return;d.mulk=1;const id='mulk-'+k;if(!d.tasks.some(x=>x.id===id))d.tasks.push({id,text:t('mlk.task'),done:false,created:Date.now(),auto:'mulk',after:'isha'});save()}
{hookFn('ensureKahf',()=>ensureKahf,f=>{ensureKahf=f},'post',function(){try{ensureMulk()}catch(e){console.error(e)}})}

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
{hookFn('timerAct',()=>timerAct,f=>{timerAct=f},'post',function(...a){setTimeout(wakeSync,50)})}
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
{hookFn('renderSettings',()=>renderSettings,f=>{renderSettings=f},'post',function(){try{toggle($('#mulkT'),S.settings.mulk!==false,v=>{S.settings.mulk=v;if(v)ensureMulk();renderTasks()});toggle($('#wakeT'),S.settings.wakeWork!==false,v=>{S.settings.wakeWork=v;wakeSync()})}catch(e){console.error(e)}})}
try{ensureMulk();renderTodayEv()}catch(e){console.error(e)}/* 3.12.8: the task list is drawn once, by renderToday at the end of start-up */


/* ---- Ctrl+K understands commands with values: «جلسة 50 دراسة», «مهمة غدًا …», «ملاحظة …», «استراحة 10» ---- */
function catByWord(w){const W=AR_NORM(w||'');if(!W)return null;return S.settings.categories.find(c=>AR_NORM(kidName(c)).startsWith(W)||W.startsWith(AR_NORM(kidName(c))))||null}
let CMD_TO=null;
function cmdArgs(q){const s=q.trim(),out=[];let m;
  if(m=s.match(/^(?:جلسة|جلسه|session|focus)\s*(\d{1,3})?\s*(?:(?:دقيقة|دقائق|د|min|m)(?=\s|$))?\s*(.*)$/i)){const n=+(m[1]||0),c=catByWord(m[2]);
    out.push({g:'cmd',sc:9,icon:'▶',label:t('ca.sess',n?t('ca.min',n):'',c?kidName(c):''),run:()=>{showView('today');if(S.timer.mode==='work')timerAct('stop');if(c)S.timer.cat=c.id;timerAct('start');renderCatChips();clearTimeout(CMD_TO);if(n)CMD_TO=setTimeout(()=>{if(S.timer.mode==='work')alertUser(t('ca.doneT',n),t('ca.doneB'),ICON_CLOCK)},n*6e4);toast(t('ca.started',n?t('ca.min',n):''))}})}
  if(m=s.match(/^(?:مهمة|مهمه|task|todo)\s+(.+)$/i)){const txt=m[1],p=uxParse(txt);out.push({g:'cmd',sc:9,icon:'☑',label:t('ca.task',p?p.text:txt)+(p?' · '+uxParseLabel(p):''),run:()=>{showView('today');$('#taskIn').value=txt;addTask()}})}
  if(m=s.match(/^(?:ملاحظة|ملاحظه|note)\s+(.+)$/i)){const txt=m[1];out.push({g:'cmd',sc:9,icon:'📝',label:t('ca.note',txt),run:()=>{thabatOpen('note');setTimeout(()=>{if(NE){NE.title=txt;try{renderNoteEd()}catch(e){}}},120)}})}
  if(m=s.match(/^(?:استراحة|استراحه|break)\s*(\d{1,3})?/i)){const n=+(m[1]||5);out.push({g:'cmd',sc:9,icon:'☕',label:t('ca.brk',n),run:()=>{showView('today');if(S.timer.mode==='work')startBreak(n)}})}
  return out}
{const _cs=cmdSearch;cmdSearch=function(q){const out=_cs(q);try{const a=cmdArgs(q);if(a.length)return a.concat(out)}catch(e){console.error(e)}return out}}

/* ---- your own keyboard shortcuts ---- */
const KEYS_DEF=KEYS.map(k=>k[0]);
function keysApply(){const M=S.settings.keymap||{};KEYS.forEach((k,i)=>{k[0]=M[i]||KEYS_DEF[i]})}
keysApply();
openKeys=function(){openInfo('⌨ '+t('ks.t'),`<p class="muted" style="margin:0 0 8px">${t('ck.sub')}</p><div class="kslist">${KEYS.map(([k,l],i)=>`<div><kbd class="ckk" data-i="${i}" role="button" tabindex="0">${esc(k)}</kbd><span>${t(l)}</span></div>`).join('')}<div><kbd>Ctrl+K</kbd><span>${t('cmd.ph')}</span></div><div><kbd>Ctrl+Z</kbd><span>${t('ks.undo')}</span></div><div><kbd>Esc</kbd><span>${t('d.close')}</span></div></div><button class="btn sm ghost" id="ckReset" style="margin-top:10px">${t('ck.reset')}</button>`);
  $$('.ckk').forEach(el=>el.onclick=()=>{$$('.ckk').forEach(x=>x.classList.remove('rec'));el.classList.add('rec');el.textContent=t('ck.press');const h=e=>{e.preventDefault();e.stopPropagation();document.removeEventListener('keydown',h,true);if(e.key==='Escape'){openKeys();return}
    const key=e.key.length===1?e.key.toUpperCase():null;if(!key||/\s/.test(key)){toast(t('ck.bad'));openKeys();return}const i=+el.dataset.i,clash=KEYS.findIndex((k,j)=>j!==i&&k[0].toLowerCase()===key.toLowerCase());if(clash>=0){toast(t('ck.clash',t(KEYS[clash][1])));openKeys();return}
    (S.settings.keymap=S.settings.keymap||{})[i]=key;save();keysApply();openKeys()};document.addEventListener('keydown',h,true)});
  $('#ckReset').onclick=()=>{S.settings.keymap={};save();keysApply();openKeys()}};

/* ---- phone: pull Today down to sync now ---- */
(()=>{const m=$('main');if(!m)return;let y0=0,x0=0,on=false,dy=0,el=null;const hint=()=>{if(!el){el=document.createElement('div');el.className='ptr3';document.body.append(el)}return el};
  m.addEventListener('touchstart',e=>{on=MOB.matches&&e.touches.length===1&&m.scrollTop<=0&&curView()==='today'&&!e.target.closest('.modal,input,textarea,[contenteditable]');y0=e.touches[0].clientY;x0=e.touches[0].clientX;dy=0},{passive:true});
  m.addEventListener('touchmove',e=>{if(!on)return;const y=e.touches[0].clientY-y0,x=e.touches[0].clientX-x0;if(m.scrollTop>0||Math.abs(x)>Math.abs(y)){on=false;if(el)el.classList.remove('on');return}dy=Math.max(0,y);if(dy<10)return;const h=hint();h.classList.add('on');h.classList.toggle('go',dy>=90);h.style.setProperty('--p',Math.min(1,dy/90));h.textContent=dy>=90?t('ptr.rel'):t('ptr.pull')},{passive:true});
  m.addEventListener('touchend',()=>{if(!on)return;on=false;if(el)el.classList.remove('on','go');if(dy<90)return;vib(10);if(SY.token){toast(t('sync.busy'));syncNow({force:true})}else{renderAll();toast(t('ptr.noSync'))}},{passive:true})})();

/* ---- pages slide in from the side you are heading to ---- */
const NAV_ORD=['today','quran','cal','brief','boards','lib','set'];
{const _sv=showView;showView=function(v,...a){const was=curView();const r=_sv(v,...a);try{if(was&&was!==v&&!document.documentElement.classList.contains('lite')&&!matchMedia('(prefers-reduced-motion: reduce)').matches){const el=$('#v-'+v),fw=NAV_ORD.indexOf(v)>NAV_ORD.indexOf(was);if(el){el.classList.remove('uxsl-f','uxsl-b');void el.offsetWidth;el.classList.add(fw?'uxsl-f':'uxsl-b');setTimeout(()=>el.classList.remove('uxsl-f','uxsl-b'),320)}}}catch(e){}return r}}

/* ---- presentation mode: blur private text when sharing the screen (Ctrl+Shift+H) ---- */
function privToggle(on){on=on==null?!document.documentElement.classList.contains('privm'):on;document.documentElement.classList.toggle('privm',on);toast(t(on?'pv3.on':'pv3.off'))}
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.shiftKey&&(e.key==='H'||e.key==='h'||e.code==='KeyH')){e.preventDefault();privToggle()}},true);

/* ---- one-time guide to the phone gestures ---- */
function gestGuide(force){if(!force&&(S.gestSeen||!MOB.matches||!S.setupDone))return;S.gestSeen=1;save();
  openInfo('👆 '+t('gs.t'),`<div class="gsl">${[['↔️','gs.swipe'],['⬇️','gs.pull'],['✋','gs.long'],['⠿','gs.drag'],['📅','gs.cal'],['⬇','gs.sheet']].map(([i,k])=>`<div><span>${i}</span><p>${t(k)}</p></div>`).join('')}</div>`)}
setTimeout(()=>{try{if(!$('.modal.on'))gestGuide()}catch(e){}},6000);

/* ---- comfortable reading: more space between lines and larger text in long passages ---- */
function comfyApply(){document.documentElement.classList.toggle('comfy',!!S.settings.comfy)}comfyApply();

/* ---- choose and order the pages in the navigation ---- */
function navApply(){const pill=$('nav.side .navpill');if(!pill)return;const C=S.settings.navCfg||{},o0=C.order||[],ord=[...new Set(o0.concat(NAV_ORD.filter(v=>v!=='set')))];
  ord.forEach(v=>{const b=pill.querySelector(`.navbtn[data-v="${v}"]`);if(b)pill.append(b)});pill.querySelectorAll('.navbtn').forEach(b=>{b.hidden=b.dataset.v!=='today'&&(C.hide||[]).includes(b.dataset.v)});try{navKeyTips()}catch(e){}}
function openNavCfg(){const C=S.settings.navCfg||(S.settings.navCfg={}),ord=(C.order=[...new Set((C.order||[]).concat(NAV_ORD.filter(v=>v!=='set')))]);C.hide=C.hide||[];
  openInfo('🧭 '+t('nv.t'),`<p class="muted" style="margin:0 0 8px">${t('nv.sub')}</p><div class="hlist">${ord.map(v=>`<div class="hlrow" data-v="${v}"><span>${t(v==='boards'?'nav.notes':'nav.'+v)}</span><span class="row"><button class="btn sm ghost" data-up>↑</button><button class="btn sm ghost" data-dn>↓</button>${v==='today'?'':`<button class="btn sm ${C.hide.includes(v)?'':'ghost'}" data-hd>${C.hide.includes(v)?t('hl3.show'):t('hl3.hide')}</button>`}</span></div>`).join('')}</div><button class="btn sm ghost" id="nvReset">${t('hl3.reset')}</button>`);
  const persist=()=>{C.order=[...$$('.hlist .hlrow')].map(r=>r.dataset.v);save();navApply()};
  $$('.hlist .hlrow').forEach(r=>{r.querySelector('[data-up]').onclick=()=>{const p=r.previousElementSibling;if(p)p.before(r);persist()};r.querySelector('[data-dn]').onclick=()=>{const n=r.nextElementSibling;if(n)n.after(r);persist()};const h=r.querySelector('[data-hd]');if(h)h.onclick=()=>{const v=r.dataset.v;C.hide=C.hide.includes(v)?C.hide.filter(x=>x!==v):C.hide.concat(v);save();navApply();openNavCfg()}});
  $('#nvReset').onclick=()=>{S.settings.navCfg={};save();navApply();openNavCfg()}}
setTimeout(navApply,300);

/* ---- undo history: the last changes with their time; pick a point to go back to ---- */
UNDO.tm=UNDO.tm||[];{const st=UNDO.st;st.push=function(...a){a.forEach(()=>UNDO.tm.push(Date.now()));return Array.prototype.push.apply(this,a)};st.shift=function(){UNDO.tm.shift();return Array.prototype.shift.call(this)};st.pop=function(){UNDO.tm.pop();return Array.prototype.pop.call(this)}}
function undoDiff(j){try{const o=JSON.parse(j),cnt=s=>{let tk=0,ss=0;Object.values(s.days||{}).forEach(d=>{tk+=(d.tasks||[]).length;ss+=(d.sessions||[]).length});return{tk,ss,nt:(s.notes||[]).length,ev:(s.events||[]).length}},a=cnt(o),b=cnt(S),L_=[];
  [['tk','uh.tasks'],['ss','uh.sess'],['nt','uh.notes'],['ev','uh.events']].forEach(([k,lab])=>{const d=b[k]-a[k];if(d)L_.push(t(lab,(d>0?'+':'')+d))});return L_.join(' · ')||t('uh.small')}catch(e){return''}}
function openUndoHist(){const L_=UNDO.st.map((j,i)=>({i,j,at:UNDO.tm[i]})).reverse();
  openInfo('↶ '+t('uh.t'),L_.length?`<p class="muted" style="margin:0 0 8px">${t('uh.sub')}</p><div class="uxtr">${L_.map((x,n)=>`<div class="uxtrr"><span class="uxtrt">${x.at?fmtT(x.at):'—'}<small>${esc(t('uh.since'))} ${esc(undoDiff(x.j))}</small></span><button class="btn sm" data-n="${n+1}">${t('uh.go')}</button></div>`).join('')}</div>`:`<div class="empty">${t('un.none')}</div>`);
  $$('#infoBox [data-n]').forEach(b=>b.onclick=()=>{const n=+b.dataset.n;for(let k=0;k<n;k++)undoGo(false);$('#infoModal').classList.remove('on')})}

/* ---- features you have not used lately (counted on this device only) ---- */
const USE_F={adhkar:'openAdhkar',tasbih:'openTasbih',habits:'openHabits',inbox:'openInbox',goals:'openYearGoals',trash:'openTrash',keys:'openKeys'};
function useMark(k){try{const U=JSON.parse(localStorage.getItem('thabat.use')||'{}');U[k]=Date.now();if(!U._since)U._since=Date.now();localStorage.setItem('thabat.use',JSON.stringify(U))}catch(e){}}
Object.entries(USE_F).forEach(([k,f])=>{let _f;try{_f=eval(f)}catch(e){return}if(typeof _f!=='function')return;const w=function(...a){useMark(k);return _f.apply(this,a)};try{eval(f+'=w')}catch(e){}});
{const _sv=showView;showView=function(v,...a){useMark('v:'+v);return _sv(v,...a)}}
useMark('_boot');
function mediaRecent(){const tk=todayKey();for(let i=0;i<30;i++){const d=S.days[dKey(addDays(keyToDate(tk),-i))];if(d&&d.media&&d.media.length)return true}return false}
function openUnused(){let U={};try{U=JSON.parse(localStorage.getItem('thabat.use')||'{}')}catch(e){}const lim=Date.now()-30*864e5,young=(U._since||Date.now())>Date.now()-14*864e5;
  const views=['quran','cal','brief','boards'].filter(v=>!(U['v:'+v]>lim)).map(v=>({l:t(v==='boards'?'nav.notes':'nav.'+v),v}));
  const feats=Object.keys(USE_F).filter(k=>!(U[k]>lim)).map(k=>t('uu.'+k));
  const tk=todayKey(),L3=S.settings.home3||{},cards=homeCards().filter(c=>!c.classList.contains('hhide')).filter(c=>{if(c.id==='qCard'){for(let i=0;i<30;i++){const d=S.days[dKey(addDays(keyToDate(tk),-i))];if(d&&d.quran&&(d.quran.read||d.quran.wird))return false}return true}if(c.querySelector('#mediaList'))return!mediaRecent();return false});
  openInfo('🧹 '+t('uu.t'),`${young?`<p class="muted">${t('uu.young')}</p>`:''}<p class="muted" style="margin:0 0 8px">${t('uu.sub')}</p>${cards.length?`<h4 class="uuh">${t('uu.cards')}</h4>${cards.map(c=>`<div class="uxtrr"><span class="uxtrt">${esc((c.querySelector('h3 span')||c.querySelector('h3')).textContent.trim().slice(0,30))}</span><button class="btn sm" data-hide="${esc(cardKey(c))}">${t('hl3.hide')}</button></div>`).join('')}`:''}
    ${views.length?`<h4 class="uuh">${t('uu.pages')}</h4>${views.map(x=>`<div class="uxtrr"><span class="uxtrt">${esc(x.l)}</span><button class="btn sm" data-nav="${x.v}">${t('hl3.hide')}</button></div>`).join('')}`:''}
    ${feats.length?`<h4 class="uuh">${t('uu.feats')}</h4><p class="muted">${feats.map(esc).join('، ')}</p>`:''}${!cards.length&&!views.length&&!feats.length?`<div class="empty">${t('uu.none')}</div>`:''}`);
  $$('#infoBox [data-hide]').forEach(b=>b.onclick=()=>{const k=b.dataset.hide;(L3[k]=L3[k]||{}).h=true;S.settings.home3=L3;save();homeApply();try{uxRebalance()}catch(e){}openUnused()});
  $$('#infoBox [data-nav]').forEach(b=>b.onclick=()=>{const C=S.settings.navCfg||(S.settings.navCfg={});C.hide=(C.hide||[]).concat(b.dataset.nav);save();navApply();openUnused()})}

/* ---- commands and settings for these ---- */
{const _cc=cmdCommands;cmdCommands=function(){const L_=_cc();L_.push({icon:'↶',label:t('uh.t'),run:openUndoHist,kw:'undo history تراجع سجل'},{icon:'🙈',label:t('pv3.cmd'),run:()=>privToggle(),kw:'privacy present hide عرض اخفاء'},{icon:'🧭',label:t('nv.t'),run:openNavCfg,kw:'navigation pages تنقل'},{icon:'🧹',label:t('uu.t'),run:openUnused,kw:'unused features ميزات'},{icon:'👆',label:t('gs.t'),run:()=>gestGuide(true),kw:'gestures ايماءات'});return L_}}
{hookFn('renderSettings',()=>renderSettings,f=>{renderSettings=f},'post',function(){try{toggle($('#comfyT'),!!S.settings.comfy,v=>{S.settings.comfy=v;comfyApply()});const m={navCfgBtn:openNavCfg,unusedBtn:openUnused,undoHBtn:openUndoHist,gestBtn:()=>gestGuide(true),privBtn:()=>privToggle()};Object.entries(m).forEach(([id,f])=>{const b=$('#'+id);if(b)b.onclick=f})}catch(e){console.error(e)}})}


/* ---- notes: backlinks («notes that point here»), nested tags, share as image or PDF ---- */
function noteBacklinks(n){if(!n||!n.title)return[];const T=n.title.trim().toLowerCase();return NOTES().filter(x=>x.id!==n.id&&!(x.lock&&!notesUnlocked())&&String(x.body||'').toLowerCase().includes('[['+T+']]'))}
noteTags=function(n){if(n.lock&&!notesUnlocked())return[];const out=new Set();for(const m of String((n.title||'')+'\n'+(n.body||'')).matchAll(/(^|\s)#([\p{L}\p{N}_]+(?:\/[\p{L}\p{N}_]+)*)/gu)){const parts=m[2].split('/');for(let i=1;i<=parts.length;i++)out.add(parts.slice(0,i).join('/'))}return[...out]};
function noteCanvas(n){const W=1080,P=72,cv=document.createElement('canvas'),g=cv.getContext('2d'),rtl=/[؀-ۿ]/.test((n.title||'')+(n.body||''))||document.documentElement.dir==='rtl',font=getComputedStyle(document.body).fontFamily;
  const wrap=(txt,size,bold)=>{g.font=`${bold?700:400} ${size}px ${font}`;const out=[];String(txt||'').split('\n').forEach(par=>{if(!par.trim()){out.push('');return}let line='';par.split(/\s+/).forEach(w=>{const tr=line?line+' '+w:w;if(g.measureText(tr).width>W-2*P&&line){out.push(line);line=w}else line=tr});out.push(line)});return out};
  const tl=wrap(n.title,52,true),bl=wrap(n.body,32,false),H=Math.min(12000,P*2+tl.length*70+(tl.length?30:0)+bl.length*50+90);cv.width=W;cv.height=H;
  const css=getComputedStyle(document.documentElement);g.fillStyle=css.getPropertyValue('--bg').trim()||'#111';g.fillRect(0,0,W,H);g.fillStyle=css.getPropertyValue('--accent').trim()||'#fddb00';g.fillRect(0,0,W,10);
  g.direction=rtl?'rtl':'ltr';g.textAlign=rtl?'right':'left';const x=rtl?W-P:P;let y=P+40;g.fillStyle=css.getPropertyValue('--text').trim()||'#fff';
  g.font=`700 52px ${font}`;tl.forEach(l=>{g.fillText(l,x,y);y+=70});if(tl.length)y+=30;g.font=`400 32px ${font}`;g.fillStyle=css.getPropertyValue('--text').trim()||'#eee';bl.forEach(l=>{if(y<H-90)g.fillText(l,x,y);y+=50});
  g.font=`400 24px ${font}`;g.fillStyle=css.getPropertyValue('--muted').trim()||'#999';g.textAlign=rtl?'left':'right';g.fillText(t('app')+' · '+gShort(keyToDate(n.day||todayKey())),rtl?P:W-P,H-40);return cv}
function noteShare(n,kind){const cv=noteCanvas(n),name=safeName((n.title||t('notes.untitled')).slice(0,40));
  if(kind==='png')cv.toBlob(b=>saveBytes(name+'.png','image/png',b),'image/png');
  else{const W=595,H=Math.round(cv.height*W/cv.width);saveBytes(name+'.pdf','application/pdf',new Blob([jpegPdf(cv.toDataURL('image/jpeg',.92),cv.width,cv.height,W,H)],{type:'application/pdf'}))}}
{const _r=renderNoteEd;renderNoteEd=function(...a){const r=_r(...a);try{const n=NE,ft=$('#noteBox .neft');if(!n||!ft)return r;
  if(!n._new){const sb=document.createElement('button');sb.className='btn ghost';sb.textContent='↗ '+t('ns.share');sb.onclick=()=>{const rc=sb.getBoundingClientRect();const p=qPopAt(`<button data-k="png">🖼 ${t('ns.png')}</button><button data-k="pdf">📄 ${t('ns.pdf')}</button>`,rc.left+rc.width/2,rc.top-10,'aymenu');p.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{closePP();const cur=Object.assign({},n,{title:($('#neTitle')||{}).value||n.title,body:($('#neBody')||{}).value||n.body});noteShare(cur,b.dataset.k)})};const sp=ft.querySelector('.nesp');if(sp)sp.before(sb)}
  const bl=noteBacklinks(n);if(bl.length){ft.insertAdjacentHTML('beforebegin',`<div class="nebl"><small>🔗 ${t('nb.t',bl.length)}</small>${bl.map(x=>`<button data-bl="${x.id}" dir="auto">${esc(x.title||t('notes.untitled'))}</button>`).join('')}</div>`);$$('#noteBox [data-bl]').forEach(b=>b.onclick=()=>{const id=b.dataset.bl;closeNote(true);setTimeout(()=>openNote(id),60)})}}catch(e){console.error(e)}return r}}

/* ---- Quran: an ayah as a picture to share ---- */
async function ayahCard(s,a){try{const r=S.quran.riwaya,R=RIWAYAT[r]||RIWAYAT.hafs,rr=R.kind==='text'?r:'hafs';await qLoadPack(rr);const tx=qAyahText(s,a,rr);if(!tx){toast(t('ac.none'));return}
  try{await document.fonts.load(`48px Q_${rr}`)}catch(e){}const W=1080,P=90,cv=document.createElement('canvas'),g=cv.getContext('2d');const ff=`'Q_${rr}'`;let size=tx.length>420?40:tx.length>220?48:58;
  const lines=()=>{g.font=`${size}px ${ff}`;const out=[];let line='';tx.split(/\s+/).forEach(w=>{const tr=line?line+' '+w:w;if(g.measureText(tr).width>W-2*P&&line){out.push(line);line=w}else line=tr});if(line)out.push(line);return out};
  let L_=lines();while(L_.length*size*1.9>1300&&size>30){size-=4;L_=lines()}const lh=size*1.9,H=Math.max(1080,P*2+L_.length*lh+200);cv.width=W;cv.height=H;
  const grd=g.createLinearGradient(0,0,0,H);grd.addColorStop(0,'#0f1115');grd.addColorStop(1,'#1b1d24');g.fillStyle=grd;g.fillRect(0,0,W,H);g.strokeStyle='rgba(253,219,0,.55)';g.lineWidth=3;g.strokeRect(40,40,W-80,H-80);
  g.direction='rtl';g.textAlign='center';g.fillStyle='#f5f1e6';g.font=`${size}px ${ff}`;let y=(H-L_.length*lh)/2+size*.7-40;L_.forEach(l=>{g.fillText(l,W/2,y);y+=lh});
  g.font=`500 34px ${getComputedStyle(document.body).fontFamily}`;g.fillStyle='#fddb00';g.fillText(`﴿ ${qSurahName(s)} · ${a} ﴾`,W/2,H-150);if(rr!=='hafs'){const Rn=RIWAYAT[rr];g.font=`400 26px ${getComputedStyle(document.body).fontFamily}`;g.fillStyle='rgba(253,219,0,.75)';g.fillText(t('ac.riw',Rn[LANG]||Rn.ar),W/2,H-112)}g.font=`400 24px ${getComputedStyle(document.body).fontFamily}`;g.fillStyle='rgba(255,255,255,.45)';g.fillText(t('app'),W/2,H-70);
  cv.toBlob(b=>saveBytes(safeName(qSurahName(s)+' '+a)+'.png','image/png',b),'image/png')}catch(e){console.error(e);toast(t('toast.saveFail'))}}
{const _am=qAyahMenu;qAyahMenu=function(s,a,x,y,w){const r=_am(s,a,x,y,w);try{const grid=$('#ppPop .aygrid');if(grid){const b=document.createElement('button');b.textContent='🖼 '+t('ac.btn');b.onclick=()=>{closePP();ayahCard(s,a)};grid.append(b)}}catch(e){}return r}}

/* ---- calendar: an agenda of the next 14 days ---- */
function openAgenda(){const tk=todayKey(),rows=[];for(let i=0;i<14;i++){const k=dKey(addDays(keyToDate(tk),i)),d=S.days[k],ev=evsOn(k),tks=d?d.tasks.filter(x=>!x.done):[],due=(typeof pjDue==='function'?pjDue():[]).filter(x=>x.p&&x.p.due===k);
  if(!ev.length&&!tks.length&&!due.length)continue;const dt=keyToDate(k);rows.push(`<div class="agd"><div class="agh"><b>${i===0?t('ev.today'):i===1?t('ev.tomorrow'):L().days[dt.getDay()]}</b><span>${hStr(dt)} · ${gShort(dt)}</span></div>${ev.map(e=>`<div class="agi ev" data-ev="${e.id}" data-k="${k}"><i style="background:${e.color||'var(--accent)'}"></i>${e.time?`<b>${esc(e.time)}</b>`:''}<span dir="auto">${esc(e.title)}</span></div>`).join('')}${tks.map(x=>`<div class="agi"><i></i>${x.after?`<b>🕌 ${t('pr.'+x.after)}</b>`:''}<span dir="auto">${esc(x.text)}</span></div>`).join('')}${due.map(p=>`<div class="agi"><i style="background:#ef4444"></i><b>⏳</b><span dir="auto">${esc(p.p.name||'')}</span></div>`).join('')}</div>`)}
  openInfo('📋 '+t('ag.t'),rows.length?`<div class="agl">${rows.join('')}</div>`:`<div class="empty">${t('ag.none')}</div>`);$$('#infoBox .agi.ev').forEach(el=>el.onclick=()=>{$('#infoModal').classList.remove('on');openEv(el.dataset.ev,el.dataset.k)})}

/* ---- calendar layers: show or hide events, the productivity fill, stars and moons, fasting marks ---- */
function calLayers(){const L_=S.settings.calLayers||{},v=$('#v-cal');if(!v)return;['ev','fill','sky','fast'].forEach(k=>v.classList.toggle('cl-no-'+k,L_[k]===false))}
function calTools(){const head=$('#v-cal .calhead');if(!head||$('#calTools3'))return;const row=head.querySelector('.row')||head;const w=document.createElement('span');w.id='calTools3';w.className='caltools3';
  w.innerHTML=`<button class="btn sm ghost" id="agBtn">📋 ${t('ag.btn')}</button><button class="btn sm ghost" id="clBtn" title="${esc(t('cl.t'))}">🗂</button>`;row.append(w);
  $('#agBtn').onclick=openAgenda;$('#clBtn').onclick=e=>{const L_=S.settings.calLayers||(S.settings.calLayers={}),r=e.currentTarget.getBoundingClientRect();const p=qPopAt(`<div class="aymh">🗂 ${t('cl.t')}</div>${['ev','fill','sky','fast'].map(k=>`<button data-l="${k}">${L_[k]===false?'☐':'☑'} ${t('cl.'+k)}</button>`).join('')}`,r.left+r.width/2,r.bottom-8,'aymenu');
    p.querySelectorAll('[data-l]').forEach(b=>b.onclick=ev=>{ev.stopPropagation();const k=b.dataset.l;L_[k]=L_[k]===false;save();calLayers();b.textContent=(L_[k]===false?'☐ ':'☑ ')+t('cl.'+k)})}}

/* ---- calendar: drag an event from the day panel onto another day (PC) ---- */
{const _rd=renderDetail;renderDetail=function(k){_rd(k);try{$$('#detail .evli[data-ev]').forEach(el=>{el.draggable=true;el.title=t('evd.tip');el.ondragstart=e=>{e.dataTransfer.setData('text/plain','ev:'+el.dataset.ev+':'+k);el.classList.add('drag')};el.ondragend=()=>el.classList.remove('drag')})}catch(e){}}}
{const _rc=renderCal;renderCal=function(...a){const r=_rc(...a);try{calTools();calLayers();$$('#cal .cell[data-k]').forEach(c=>{if(c._evd)return;c._evd=1;c.addEventListener('drop',e=>{const d=e.dataTransfer.getData('text/plain');if(!d||!d.startsWith('ev:'))return;e.preventDefault();e.stopImmediatePropagation();c.classList.remove('dropon');
  const [,id,from]=d.split(':'),ev=EVS().find(x=>x.id===id),to=c.dataset.k;if(!ev||from===to)return;const old=ev.date,delta=Math.round((keyToDate(to)-keyToDate(from))/864e5);ev.date=dKey(addDays(keyToDate(ev.date),delta));save();selKey=to;renderCal();renderDetail(to);
  toastAct(t('evd.moved',dayLabel(to)),t('undo'),()=>{ev.date=old;save();renderCal();renderDetail(selKey)})},true)})}catch(e){console.error(e)}return r}}

/* ---- PC: drop a file or text on Today ---- */
(()=>{const v=$('#v-today');if(!v)return;let over=0;
  v.addEventListener('dragover',e=>{if(!e.dataTransfer||![...e.dataTransfer.types].includes('Files'))return;e.preventDefault();v.classList.add('dropfile')});
  v.addEventListener('dragleave',e=>{if(!v.contains(e.relatedTarget))v.classList.remove('dropfile')});
  v.addEventListener('drop',async e=>{const fs=[...(e.dataTransfer&&e.dataTransfer.files||[])];v.classList.remove('dropfile');if(!fs.length)return;e.preventDefault();
    const imgs=fs.filter(f=>/^image\//.test(f.type)),txts=fs.filter(f=>/\.(txt|md|markdown)$/i.test(f.name)||/^text\//.test(f.type));
    if(imgs.length){thabatOpen('note');setTimeout(()=>{const inp=$('#neFile');if(!inp)return;const dt=new DataTransfer();imgs.forEach(f=>dt.items.add(f));inp.files=dt.files;inp.dispatchEvent(new Event('change',{bubbles:true}))},250);return}
    if(txts.length){const tx=await txts[0].text(),lines=tx.split(/\r?\n/).map(s=>s.replace(/^\s*(?:[-*•]|\d+[.)]|\[[ xX]\])\s*/,'').trim()).filter(Boolean);
      const rc={left:innerWidth/2,top:innerHeight/3};const p=qPopAt(`<div class="aymh">📄 ${esc(txts[0].name)}</div><button data-k="note">📝 ${t('df.note')}</button>${lines.length>1&&lines.length<=60?`<button data-k="tasks">☑ ${t('df.tasks',lines.length)}</button>`:''}`,rc.left,rc.top,'aymenu');
      p.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{closePP();if(b.dataset.k==='tasks'){const d=day(todayKey());lines.forEach(l=>d.tasks.push({id:uid(),text:l,done:false,created:Date.now()}));save();renderTasks();toast(t('ps3.added',lines.length))}else{thabatOpen('note');setTimeout(()=>{if(!NE)return;NE.title=txts[0].name.replace(/\.[^.]+$/,'');NE.body=tx;renderNoteEd()},150)}})}})})();

{const _cc=cmdCommands;cmdCommands=function(){const L_=_cc();L_.push({icon:'📋',label:t('ag.t'),run:()=>{showView('cal');openAgenda()},kw:'agenda upcoming جدول الاعمال القادمة'});return L_}}
try{if(curView()==='cal')renderCal()}catch(e){}

