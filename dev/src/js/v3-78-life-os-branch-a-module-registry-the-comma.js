/* ============ v3.78 (Life OS branch): a module registry, the Command Center at the top of Today, navigation by category, persona modes ============ */
/* Every tool of Thabat is registered once as a module: {id, cat, ic, lbl, run, view?, area?, adv?, hub?, kw?}.
   - cat: one of LOS_CATS (worship, work, know, well, review); the nav shows one button per category and a menu of its modules.
   - area: an «أقسام ثبات» key (AREAS); when that area is off the module leaves the nav, the hub and Ctrl+K.
   - adv: an advanced tool, listed under «أدوات أخرى» in its category menu (progressive disclosure).
   - hub(): a snapshot for the Command Center → {v (main value), s (second line), on (highlight), act ({ic,run} small button)} or null to hide.
   A module that throws is skipped (and logged); the core never depends on a module. Other code can add or remove modules with
   ThabatOS.register(m) / ThabatOS.unregister(id); S.settings.losHub[id]===false hides a module's hub tile. */
const LOS_CATS=[{k:'worship',ic:'🕌',re:/quran|mushaf|adhkar|dua|qibla|qada|zakat|khatma|hifz|fast|wird|topics|قرآن|مصحف|أذكار|ذكر|دعاء|قبلة|قضاء|زكاة|ختمة|حفظ|صيام|ورد/i},
  {k:'work',ic:'💼',re:/task|timer|calendar|event|agenda|inbox|matrix|goal|project|student|tomorrow|مهمة|مؤقت|تقويم|حدث|صندوق|مصفوفة|أهداف|مشاريع|طالب|غد/i},
  {k:'know',ic:'📚',re:/note|library|studio|flashcard|letter|recitation|book|ملاحظ|مكتبة|استوديو|بطاقات|رسالة|صوتيات|كتب/i},
  {k:'well',ic:'🌿',re:/health|workout|headache|mood|media|sleep|water|صحة|تمرين|صداع|مزاج|نوم|ماء|استماع/i},
  {k:'review',ic:'📊',re:/summary|review|badge|harvest|quarter|90 plan|stats|ملخص|مراجعة|أوسمة|حصاد|ربع|خطة/i}];
const LOS_MODS=[];
const LOS={pop:null,cat:null};
/* persona modes: the order of the categories in the nav, the hub tiles, and which Ctrl+K commands come first */
const LOS_PZ={bal:{cats:['worship','work','know','well','review'],hub:['prayer','tasks','timer','wird','events','water','score','sleep']},
  work:{cats:['work','worship','know','review','well'],hub:['prayer','timer','tasks','events','score','wird','lesson']},
  relax:{cats:['worship','well','know','review','work'],hub:['prayer','wird','adhkar','water','sleep','score','lesson']}};
function losPz(){const p=S.settings.persona;return LOS_PZ[p]?p:'bal'}
function losOn(){return S.settings.losNav!==false}
function losHubOn(){return S.settings.losHubOn!==false}
function losReg(m){if(!m||!m.id||!LOS_CATS.some(c=>c.k===m.cat))return false;const i=LOS_MODS.findIndex(x=>x.id===m.id);if(i>=0)LOS_MODS[i]=m;else LOS_MODS.push(m);return true}
function losUnreg(id){const i=LOS_MODS.findIndex(x=>x.id===id);if(i>=0)LOS_MODS.splice(i,1);try{losNavPaint();losHubRender()}catch(e){}}
function losLive(m){return!(m.area&&typeof areaOff==='function'&&areaOff(m.area))}
function losMods(cat){return LOS_MODS.filter(m=>(!cat||m.cat===cat)&&losLive(m))}
function losLbl(m){try{return typeof m.lbl==='function'?m.lbl():t(m.lbl)}catch(e){return m.id}}
function losRun(m){try{losClose();m.run()}catch(e){console.error('module '+m.id,e)}}
function losCatOf(v){const m=LOS_MODS.find(x=>x.view===v);return m?m.cat:null}
window.ThabatOS={register:m=>{const r=losReg(m);try{losNavPaint();losHubRender()}catch(e){}return r},unregister:losUnreg,modules:()=>LOS_MODS.slice(),cats:()=>LOS_CATS.map(c=>c.k),persona:losPz};
/* small helpers for snapshots */
function losTd(){return day(todayKey())}
function losUndone(){return losTd().tasks.filter(x=>!x.done&&!x.dismissed)}
function losTopTask(){const L_=losUndone();return L_.slice().sort((a,b)=>(a.pri||2)-(b.pri||2))[0]}
function losCard(sel){const el=$(sel);const c=el&&el.closest('.card');if(c){c.scrollIntoView({behavior:'smooth',block:'start'});c.classList.add('losflash');setTimeout(()=>c.classList.remove('losflash'),1400)}}
function losToday(sel){showView('today');setTimeout(()=>losCard(sel),60)}

/* ---- the modules ---- */
[
  /* worship */
  {id:'prayer',cat:'worship',ic:'🕌',lbl:()=>t('los.m.prayer'),run:()=>losToday('#nextLine'),
    hub:()=>{const n=nextPrayer();if(!n)return null;return{v:t('pr.'+n.k),s:t('los.in',fmtHM(n.t-Date.now())),on:n.t-Date.now()<15*6e4}}},
  {id:'quran',cat:'worship',ic:'📖',view:'quran',lbl:()=>t('nav.quran'),run:()=>showView('quran')},
  {id:'wird',cat:'worship',ic:'📿',lbl:()=>t('los.m.wird'),run:()=>showView('quran'),
    hub:()=>{const q=qDay(todayKey()),w=S.quran.wird||0;if(!w)return null;const done=qWirdDone(q);return{v:done?'✓':(q.read||0)+' / '+w,s:t('los.pages'),on:!done}}},
  {id:'adhkar',cat:'worship',ic:'☀',lbl:()=>t('los.m.adhkar'),run:()=>{showView('today');openAdhkar()},
    hub:()=>{const k=adhPeriodNow();return{v:t('adh.'+k),s:t('los.open'),act:null}}},
  {id:'duas',cat:'worship',ic:'🤲',lbl:()=>t('los.m.duas'),run:()=>openDuas()},
  {id:'hifz',cat:'worship',ic:'🎯',lbl:()=>t('hz.btn'),run:()=>{showView('quran');openHz()},adv:1},
  {id:'qibla',cat:'worship',ic:'🧭',lbl:()=>t('los.m.qibla'),run:()=>openQibla(),adv:1},
  {id:'fasts',cat:'worship',ic:'🌙',lbl:()=>t('los.m.fasts'),run:()=>fyOpen(),adv:1},
  {id:'qada',cat:'worship',ic:'🕰',area:'wextra',lbl:()=>t('los.m.qada'),run:()=>openQada(),adv:1},
  {id:'zakat',cat:'worship',ic:'💰',area:'wextra',lbl:()=>t('los.m.zakat'),run:()=>openZakat(),adv:1},
  {id:'gkhatma',cat:'worship',ic:'👥',area:'wextra',lbl:()=>t('los.m.gk'),run:()=>openGroupK(),adv:1},
  /* work */
  {id:'tasks',cat:'work',ic:'☑',lbl:()=>t('los.m.tasks'),run:()=>{losToday('#taskIn');setTimeout(()=>{const i=$('#taskIn');if(i)i.focus()},400)},
    hub:()=>{const all=losTd().tasks.filter(x=>!x.dismissed),u=losUndone(),top=losTopTask();return{v:(all.length-u.length)+' / '+all.length,s:top?top.text:t('los.allDone'),on:!!top&&top.pri===1}}},
  {id:'timer',cat:'work',ic:'⏱',lbl:()=>t('los.m.timer'),run:()=>losToday('#manualBtn'),
    hub:()=>{const T=S.timer;if(T.mode==='work'&&T.start)return{v:fmtHM(Date.now()-T.start),s:catName(T.cat)||t('los.working'),on:true,act:{ic:'⏸',lbl:t('btn.endSession'),run:()=>timerAct('stop')}};
      return{v:fmtHM(totals(todayKey()).tot),s:t('los.focusToday'),act:{ic:'▶',lbl:t('btn.start'),run:()=>timerAct('start')}}}},
  {id:'cal',cat:'work',ic:'📅',view:'cal',lbl:()=>t('nav.cal'),run:()=>showView('cal'),
    hub:()=>{const L_=evsOn(todayKey());if(!L_.length)return null;const e=L_[0];return{v:String(L_.length),s:(e.time?e.time+' ':'')+e.title}}},
  {id:'agenda',cat:'work',ic:'📋',lbl:()=>t('los.m.agenda'),run:()=>{showView('cal');openAgenda()}},
  {id:'inbox',cat:'work',ic:'📥',area:'inbox',lbl:()=>t('los.m.inbox'),run:()=>openInbox()},
  {id:'goals',cat:'work',ic:'🎯',area:'goals',lbl:()=>t('gl.t'),run:()=>openGoals()},
  {id:'projects',cat:'work',ic:'📁',area:'goals',lbl:()=>t('los.m.projects'),run:()=>openProjects(),adv:1},
  {id:'arrange',cat:'work',ic:'🗓',lbl:()=>t('los.m.arrange'),run:()=>{showView('today');setTimeout(()=>{const b=$('#arrBtn');if(b&&!b.hidden)b.click();else losCard('#pdlCard')},80)},adv:1},
  {id:'student',cat:'work',ic:'🎓',lbl:()=>t('los.m.student'),run:()=>stuOpen(),adv:1},
  /* knowledge */
  {id:'notes',cat:'know',ic:'📝',view:'boards',lbl:()=>t('nav.notes'),run:()=>{showView('boards');nbMode='notes';renderBoardsView()}},
  {id:'lib',cat:'know',ic:'🎬',view:'lib',area:'lib',lbl:()=>t('nav.lib'),run:()=>showView('lib')},
  {id:'lesson',cat:'know',ic:'🎓',area:'lib',lbl:()=>t('los.m.lesson'),run:()=>showView('lib'),
    hub:()=>{const x=losTd().tasks.find(z=>z.lod&&!z.done);return x?{v:'▶',s:x.text,act:{ic:'▶',lbl:t('los.open'),run:()=>lodPlay(x)}}:null}},
  {id:'studio',cat:'know',ic:'🎨',area:'studio',lbl:()=>t('los.m.studio'),run:()=>{nbMode='studio';showView('boards')},adv:1},
  {id:'letters',cat:'know',ic:'✉',area:'letters',lbl:()=>t('los.m.letters'),run:()=>openLetters('list'),adv:1},
  /* wellbeing */
  {id:'health',cat:'well',ic:'💪',area:'health',lbl:()=>t('los.m.health'),run:()=>openHealth3()},
  {id:'water',cat:'well',ic:'💧',lbl:()=>t('los.m.water'),run:()=>losToday('#planBtn'),
    hub:()=>{if(!waterOn())return null;const n=waterN(),g=wtCfg().goal;return{v:n+' / '+g,s:t('los.glasses'),act:{ic:'＋',lbl:t('los.addGlass'),run:()=>waterAdd()}}}},
  {id:'sleep',cat:'well',ic:'🌙',lbl:()=>t('los.m.sleep'),run:()=>typeof bedOpen==='function'?bedOpen():openHealth3(),
    hub:()=>{const s=losTd().sleep3;return s&&s.h?{v:s.h+' '+t('u.h'),s:t('los.slept')}:null}},
  {id:'workout',cat:'well',ic:'🏋',lbl:()=>t('los.m.workout'),run:()=>wkpOpen()},
  {id:'mood',cat:'well',ic:'💬',lbl:()=>t('los.m.mood'),run:()=>moodWord(),adv:1},
  {id:'media',cat:'well',ic:'🎧',area:'media',lbl:()=>t('mlog.title'),run:()=>{showView('today');$('#mediaLogBtn').click()},adv:1},
  /* review */
  {id:'brief',cat:'review',ic:'📊',view:'brief',lbl:()=>t('nav.brief'),run:()=>showView('brief')},
  {id:'score',cat:'review',ic:'📈',lbl:()=>t('los.m.score'),run:()=>showView('brief'),
    hub:()=>{const r=tdaScore();return{v:Math.round((r.v||0)*100)+'%',s:t('los.scoreS',r.td,r.tt,r.pd,r.pp)}}},
  {id:'week',cat:'review',ic:'📝',lbl:()=>t('los.m.week'),run:()=>openWeekReview()},
  {id:'quarter',cat:'review',ic:'🧭',lbl:()=>t('los.m.quarter'),run:()=>qtrOpen(),adv:1},
  {id:'p90',cat:'review',ic:'🗺',lbl:()=>t('los.m.p90'),run:()=>p90Open(),adv:1},
  {id:'badges',cat:'review',ic:'🏅',area:'badges',lbl:()=>t('los.m.badges'),run:()=>openBadges(),adv:1},
].forEach(losReg);

/* ---- the Command Center (top of Today) ---- */
function losHubTiles(){const H=S.settings.losHub||{},ord=LOS_PZ[losPz()].hub,out=[];
  const mods=losMods().filter(m=>m.hub&&H[m.id]!==false).sort((a,b)=>{const ia=ord.indexOf(a.id),ib=ord.indexOf(b.id);return(ia<0?99:ia)-(ib<0?99:ib)});
  for(const m of mods){let r=null;try{r=m.hub()}catch(e){console.warn('hub '+m.id,e)}if(r)out.push({m,r})}return out}
function losHubRender(){const host=$('#v-today');if(!host)return;let box=$('#losHub');
  if(!losHubOn()){if(box)box.remove();return}
  if(!box){box=document.createElement('div');box.id='losHub';box.className='card loshub';const g=host.querySelector('.grid');if(g)g.before(box);else host.append(box)}
  const pz=losPz(),tiles=losHubTiles(),max=MOB.matches?6:8;
  box.innerHTML=`<div class="loshd"><b>🧭 ${t('los.hub')}</b><div class="seg lospz" role="group" aria-label="${esc(t('los.pz'))}">${Object.keys(LOS_PZ).map(k=>`<button type="button" data-pz="${k}" class="${k===pz?'on':''}" aria-pressed="${k===pz}">${t('los.pz.'+k)}</button>`).join('')}</div><button type="button" class="btn sm ghost loscfg" aria-label="${esc(t('los.cfg'))}" title="${esc(t('los.cfg'))}">⋯</button></div>
  <div class="losgrid">${tiles.slice(0,max).map(({m,r},i)=>`<div class="lostile ${r.on?'on':''}" role="button" tabindex="0" data-los="${m.id}"><span class="losti">${m.ic}</span><span class="lostx"><small>${esc(losLbl(m))}</small><b dir="auto">${esc(r.v)}</b><em dir="auto">${esc(r.s||'')}</em></span>${r.act?`<button type="button" class="losact" data-act="${i}" aria-label="${esc(r.act.lbl||'')}" title="${esc(r.act.lbl||'')}">${r.act.ic}</button>`:''}</div>`).join('')}</div>`;
  const sh=tiles.slice(0,max);
  box.querySelectorAll('.lostile').forEach(el=>{const m=LOS_MODS.find(x=>x.id===el.dataset.los);el.onclick=e=>{if(e.target.closest('.losact'))return;losRun(m)};el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();losRun(m)}}});
  box.querySelectorAll('.losact').forEach(b=>b.onclick=e=>{e.stopPropagation();const x=sh[+b.dataset.act];try{x.r.act.run()}catch(er){console.error(er)}setTimeout(losHubRender,60)});
  box.querySelectorAll('[data-pz]').forEach(b=>b.onclick=()=>losSetPz(b.dataset.pz));
  box.querySelector('.loscfg').onclick=losCfg;losHubCols(box,sh.length)}
/* PC: one even row when the tiles fit (≥185 px each), else two even rows */
function losHubCols(box,n){const g=box.querySelector('.losgrid');if(!g)return;if(MOB.matches||!n){g.style.gridTemplateColumns='';return}const w=g.clientWidth;let c=n;if(w/c<185)c=Math.ceil(n/2);if(w/c<185)c=Math.max(1,Math.floor(w/185));g.style.gridTemplateColumns=`repeat(${c},minmax(0,1fr))`}
function losSetPz(k){S.settings.persona=k;save();losApply();toast(t('los.pzOk',t('los.pz.'+k)))}
function losCfg(){const H=S.settings.losHub||(S.settings.losHub={});
  openInfo('🧭 '+t('los.hub'),`<p class="muted" style="margin:0 0 10px">${t('los.cfgSub')}</p><div class="arlist">${losMods().filter(m=>m.hub).map(m=>`<div class="arrow"><span class="aric">${m.ic}</span><div class="artx"><b>${esc(losLbl(m))}</b><small>${t('los.c.'+m.cat)}</small></div><button class="sw-toggle ${H[m.id]===false?'':'on'}" data-lh="${m.id}" aria-pressed="${H[m.id]!==false}" aria-label="${esc(losLbl(m))}"></button></div>`).join('')}</div>
  <div class="row" style="gap:8px;margin-top:12px;flex-wrap:wrap"><button class="btn sm" id="losAreas">🧩 ${t('ar.t')}</button></div>`);
  $$('#infoBox [data-lh]').forEach(b=>b.onclick=()=>{const k=b.dataset.lh,on=!b.classList.contains('on');if(on)delete H[k];else H[k]=false;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on);save();losHubRender()});
  const a=$('#losAreas');if(a)a.onclick=()=>openAreas()}

/* ---- navigation by category ---- */
function losNavCats(){return LOS_PZ[losPz()].cats.filter(k=>losMods(k).length)}
function losNavPaint(){const pill=$('nav.side .navpill');if(!pill)return;document.documentElement.classList.toggle('losnav',losOn());
  pill.querySelectorAll('.losc').forEach(b=>b.remove());if(!losOn())return;
  const cats=losNavCats(),mob=MOB.matches,shown=mob?cats.slice(0,3):cats,rest=mob?cats.slice(3):[];
  const mk=(k,ic,lbl)=>{const b=document.createElement('button');b.type='button';b.className='navbtn losc';b.dataset.c=k;b.setAttribute('aria-haspopup','menu');b.setAttribute('aria-expanded','false');b.innerHTML=`<i class="losni">${ic}</i><span>${esc(lbl)}</span>`;b.onclick=e=>{e.stopPropagation();losMenu(b,k==='more'?rest:[k])};return b};
  shown.forEach(k=>pill.append(mk(k,LOS_CATS.find(c=>c.k===k).ic,t('los.c.'+k))));
  pill.append(mk('more','⋯',t('los.more')));losNavOn()}
function losNavOn(){const c=losCatOf(curView());$$('nav.side .losc').forEach(b=>{const own=b.dataset.c==='more'?false:b.dataset.c===c;b.classList.toggle('on',own)});
  const mb=$('nav.side .losc[data-c=more]');if(mb&&c&&!$('nav.side .losc.on'))mb.classList.add('on')}
function losClose(){if(LOS.pop){LOS.pop.remove();LOS.pop=null;$$('nav.side .losc').forEach(b=>b.setAttribute('aria-expanded','false'));document.removeEventListener('pointerdown',losOut,true)}}
function losOut(e){if(LOS.pop&&!LOS.pop.contains(e.target)&&!e.target.closest('.losc'))losClose()}
function losMenu(btn,cats){const same=LOS.pop&&LOS.pop.dataset.for===btn.dataset.c;losClose();if(same)return;
  const p=document.createElement('div');p.className='lospop card';p.dataset.for=btn.dataset.c;p.setAttribute('role','menu');
  const more=btn.dataset.c==='more';let h='';
  const row=m=>`<button type="button" role="menuitem" class="losrow" data-m="${m.id}"><span class="losri">${m.ic}</span><span>${esc(losLbl(m))}</span>${m.view&&m.view===curView()?'<i class="losdot"></i>':''}</button>`;
  cats.forEach(k=>{const L_=losMods(k),core=L_.filter(m=>!m.adv),adv=L_.filter(m=>m.adv);
    h+=`<div class="loshd2">${LOS_CATS.find(c=>c.k===k).ic} ${t('los.c.'+k)}</div>${core.map(row).join('')}`;
    if(adv.length)h+=`<details class="losadv"${more?' open':''}><summary>${t('los.adv',adv.length)}</summary>${adv.map(row).join('')}</details>`});
  if(more){const allAdv=LOS_CATS.filter(c=>!cats.includes(c.k)).flatMap(c=>losMods(c.k).filter(m=>m.adv));
    if(allAdv.length)h+=`<details class="losadv"><summary>${t('los.advAll',allAdv.length)}</summary>${allAdv.map(row).join('')}</details>`;
    h+=`<div class="losft"><button type="button" class="btn sm ghost" data-x="pz">🧭 ${t('los.pz')}: ${t('los.pz.'+losPz())}</button><button type="button" class="btn sm ghost" data-x="areas">🧩 ${t('ar.t')}</button><button type="button" class="btn sm ghost" data-x="k">⌕ Ctrl+K</button></div>`}
  p.innerHTML=h;document.body.append(p);LOS.pop=p;btn.setAttribute('aria-expanded','true');
  p.querySelectorAll('.losrow').forEach(b=>b.onclick=()=>losRun(LOS_MODS.find(m=>m.id===b.dataset.m)));
  p.querySelectorAll('[data-x]').forEach(b=>b.onclick=()=>{const x=b.dataset.x;losClose();if(x==='areas')openAreas();else if(x==='k')cmdOpen();else{const ks=Object.keys(LOS_PZ);losSetPz(ks[(ks.indexOf(losPz())+1)%ks.length])}});
  p.onkeydown=e=>{if(e.key==='Escape'){losClose();btn.focus()}};
  losPlace(p,btn);document.addEventListener('pointerdown',losOut,true);const f=p.querySelector('.losrow');if(f&&!MOB.matches)f.focus()}
function losPlace(p,btn){const z=typeof uiZoom==='function'?uiZoom():1,r=btn.getBoundingClientRect(),W=innerWidth/z,Hh=innerHeight/z;
  if(MOB.matches){p.classList.add('lossheet');const pr=(btn.closest('.navpill')||btn).getBoundingClientRect();p.style.bottom=Math.max(10,Hh-pr.top/z+10)+'px';return}
  const x0=r.left/z,x1=r.right/z,y=r.top/z,pw=p.offsetWidth,ph=p.offsetHeight;const rtl=document.documentElement.dir==='rtl';
  let left=rtl?x0-pw-10:x1+10;if(left<8)left=x1+10;if(left+pw>W-8)left=Math.max(8,x0-pw-10);
  p.style.left=left+'px';p.style.top=Math.max(8,Math.min(Hh-ph-8,y-8))+'px'}

/* ---- persona: classes, nav order, hub; Ctrl+K ranks the persona's categories first ---- */
function losApply(){const h=document.documentElement;Object.keys(LOS_PZ).forEach(k=>h.classList.toggle('pz-'+k,losPz()===k));losClose();losNavPaint();losHubRender()}
function losCmdCat(c){const s=(c.label||'')+' '+(c.kw||'');const x=LOS_CATS.find(z=>z.re.test(s));return x?x.k:null}
{const _cc=cmdCommands;cmdCommands=function(...a){let L_=_cc(...a);try{const have=new Set(L_.map(c=>c.label));
  losMods().forEach(m=>{const l=losLbl(m);if(!have.has(l))L_.push({icon:m.ic,label:l,run:()=>losRun(m),kw:m.id+' '+t('los.c.'+m.cat)})});
  Object.keys(LOS_PZ).forEach(k=>L_.push({icon:'🧭',label:t('los.pz')+': '+t('los.pz.'+k),run:()=>losSetPz(k),kw:'persona mode work relax وضع عمل راحة'}));
  L_.push({icon:'🧭',label:t('los.hub'),run:()=>{showView('today');setTimeout(()=>{const b=$('#losHub');if(b)b.scrollIntoView({block:'start'})},60)},kw:'hub command center dashboard مركز القيادة'});
  if(losPz()!=='bal'){const ord=LOS_PZ[losPz()].cats,rk=c=>{const k=losCmdCat(c);return k?ord.indexOf(k):2.5};
    L_=L_.map((c,i)=>({c,i,r:rk(c)})).sort((a,b)=>a.r-b.r||a.i-b.i).map(x=>x.c)}}catch(e){console.error(e)}return L_}}

/* ---- settings: a row after the Today layout row ---- */
function losRow(){const host=$('#tdlRow')||$('#pdlvRow');if(!host||$('#losRow'))return;
  host.insertAdjacentHTML('afterend',`<div class="field" id="losRow"><div><label data-i18n="los.set">${t('los.set')}</label><small>${t('los.setS')}</small></div><div class="row" style="gap:8px;flex-wrap:wrap;align-items:center"><span class="muted" style="font-size:12px">${t('los.hub')}</span><button class="sw-toggle" id="losHubT" aria-label="${esc(t('los.hub'))}"></button><span class="muted" style="font-size:12px">${t('los.navCat')}</span><button class="sw-toggle" id="losNavT" aria-label="${esc(t('los.navCat'))}"></button></div></div>
  <div class="field" id="losPzRow"><div><label data-i18n="los.pz">${t('los.pz')}</label><small>${t('los.pzS')}</small></div><div class="seg">${Object.keys(LOS_PZ).map(k=>`<button data-pzs="${k}" class="${losPz()===k?'on':''}">${t('los.pz.'+k)}</button>`).join('')}</div></div>`);
  toggle($('#losHubT'),losHubOn(),v=>{S.settings.losHubOn=v;losHubRender()});
  toggle($('#losNavT'),losOn(),v=>{S.settings.losNav=v;losNavPaint()});
  $$('#losPzRow [data-pzs]').forEach(b=>b.onclick=()=>{losSetPz(b.dataset.pzs);$$('#losPzRow [data-pzs]').forEach(x=>x.classList.toggle('on',x===b))})}
try{SGA_MAIN['set.look'].push('los.set','los.pz')}catch(e){}

/* ---- hooks ---- */
{hookFn('renderToday',()=>renderToday,f=>{renderToday=f},'post',function(){try{losHubRender()}catch(e){console.error(e)}})}
{hookFn('showView',()=>showView,f=>{showView=f},'post',function(){try{losClose();losNavOn()}catch(e){}})}
{hookFn('renderSettings',()=>renderSettings,f=>{renderSettings=f},'post',function(){try{losRow()}catch(e){console.error(e)}})}
{hookFn('areasApply',()=>areasApply,f=>{areasApply=f},'post',function(){try{losNavPaint();losHubRender()}catch(e){}})}
{hookFn('setLang',()=>setLang,f=>{setLang=f},'pre',function(){try{losClose()}catch(e){}})}
MOB.addEventListener&&MOB.addEventListener('change',()=>{try{losNavPaint();losHubRender()}catch(e){}});
addEventListener('resize',()=>{if(LOS.pop&&!MOB.matches)losClose()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&LOS.pop)losClose()});
setInterval(()=>{if(!document.hidden&&curView()==='today')try{losHubRender()}catch(e){}},3e4);
losApply();setTimeout(()=>{try{losRow();losApply()}catch(e){}},600);

