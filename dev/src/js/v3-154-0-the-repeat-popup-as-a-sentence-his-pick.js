/* ============ v3.154.0 the repeat popup as a sentence (his pick «ج»): quick choices, then «repeat it every [n] [day|week|month|year] …»,
   «every day except …» (here and in the smart input), and «every n» for days, weeks, months and years ============ */
const RC13={open:false,c:null};
function rc13Days(){return[6,0,1,2,3,4,5]}
function rc13Dn(i){return LANG==='ar'?L().days[i].replace(/^ال/,''):L().days[i]}
function rc13N(n,u){const A={d:['يوم','يومين','أيام','يومًا'],w:['أسبوع','أسبوعين','أسابيع','أسبوعًا'],m:['شهر','شهرين','أشهر','شهرًا'],y:['سنة','سنتين','سنوات','سنة']},E={d:'day',w:'week',m:'month',y:'year'};
  if(LANG!=='ar')return n===1?E[u]:n+' '+E[u]+'s';const a=A[u];return n===1?a[0]:n===2?a[1]:n<=10?n+' '+a[2]:n+' '+a[3]}
/* every n: outermost check */
function rc13Ix(k){const[y,m,d]=k.split('-').map(Number);return Math.floor(Date.UTC(y,m-1,d)/864e5)}
{const _m=rcMatch;rcMatch=function(r,k,...a){if(!_m(r,k,...a))return false;const n=+(r&&r.every)||1;if(n<2)return true;const s=r.start||k;
  if(r.rule==='daily'||(r.rule==='wd'&&r.ev==='d'))return((rc13Ix(k)-rc13Ix(s))%n+n)%n===0;
  if(r.rule==='wd'){const mon=x=>{const i=rc13Ix(x);return i-((new Date(i*864e5).getUTCDay()+6)%7)};return(((mon(k)-mon(s))/7)%n+n)%n===0}
  if(r.rule==='monthly'||r.rule==='mwd'){const mi=x=>+x.slice(0,4)*12+ +x.slice(5,7);return((mi(k)-mi(s))%n+n)%n===0}
  if(r.rule==='yearly')return((+k.slice(0,4)- +s.slice(0,4))%n+n)%n===0;
  if(r.rule==='hy'||r.rule==='hm'){const a2=hNum(keyToDate(k)),b2=hNum(keyToDate(s));const v=r.rule==='hy'?a2.y-b2.y:(a2.y*12+a2.m)-(b2.y*12+b2.m);return(v%n+n)%n===0}return true}}
{const _d=rcDesc;rcDesc=function(r){try{if(r&&r.rule==='wd'&&r.days){const ds=r.days;if(ds.length===7)return rc13Ev(r,t('rc.daily'));
  if(ds.length>=4){const ex=[0,1,2,3,4,5,6].filter(i=>!ds.includes(i));return rc13Ev(r,t('rc13.ex',ex.map(rc13Dn).join(LANG==='ar'?' و':' and ')))}}
  return rc13Ev(r,_d(r))}catch(e){return _d(r)}}}
function rc13Ev(r,s){const n=+(r&&r.every)||1;if(n<2)return s;const u=r.rule==='daily'||(r.rule==='wd'&&r.ev==='d')?'d':r.rule==='wd'?'w':r.rule==='monthly'||r.rule==='mwd'||r.rule==='hm'?'m':'y';
  return t('rc13.every',rc13N(n,u))+(r.rule==='daily'?'':' · '+s)}
/* the popup */
function rc13State(){const td=keyToDate(todayKey()),h=hNum(td);return{mode:'s',n:1,u:'w',days:[td.getDay()],ex:[],mm:'dom',dom:td.getDate(),nth:Math.min(4,Math.ceil(td.getDate()/7)),wd:td.getDay(),yy:'g',hd:h.d,hm:h.m,an:3,nw:3}}
function rc13Rule(c,txt){const tk=todayKey(),r={id:uid(),text:txt,start:tk};
  if(c.mode==='after')return Object.assign(r,{rule:'after',n:c.an});
  if(c.mode==='nw')return Object.assign(r,{rule:'nw',n:c.nw});
  if(c.mode==='hm')return Object.assign(r,{rule:'hm',hd:c.hd});
  if(c.mode==='hw')return Object.assign(r,{rule:'hw'});
  if(c.u==='d'){if(c.ex.length)Object.assign(r,{rule:'wd',days:[0,1,2,3,4,5,6].filter(i=>!c.ex.includes(i)),ev:'d'});else r.rule='daily'}
  else if(c.u==='w'){if(!c.days.length)return null;Object.assign(r,{rule:'wd',days:[...c.days].sort()})}
  else if(c.u==='m'){if(c.mm==='dom')Object.assign(r,{rule:'monthly',dom:c.dom});else Object.assign(r,{rule:'mwd',n:c.nth,wd:c.wd})}
  else{if(c.yy==='g')Object.assign(r,{rule:'yearly',md:tk.slice(5)});else Object.assign(r,{rule:'hy',hd:c.hd,hm:c.hm,hmn:hMonthName(c.hm)})}
  if(c.n>1&&c.mode==='s')r.every=c.n;return r}
function rc13Save(rule){if(!rule)return;RC().push(rule);$('#taskIn').value='';try{uxPreview()}catch(e){}closePP();ensureRecur();save();renderTasks();toast(t('rc.saved',rcDesc(rule)))}
function rc13Html(txt){const c=RC13.c,td=keyToDate(todayKey()),wd=td.getDay(),sel=(o,v,lab)=>`<option value="${v}" ${o==v?'selected':''}>${esc(lab)}</option>`;
  const chips=(arr,key,cls)=>`<div class="rc13d">${rc13Days().map(i=>`<button type="button" data-${key}="${i}" class="${arr.includes(i)?'on '+(cls||''):''}">${esc(rc13Dn(i).slice(0,LANG==='ar'?6:3))}</button>`).join('')}</div>`;
  let h=`<div class="rc13q">${[['daily',t('rc.daily')],['wd1',t('rc.weekly',LANG==='ar'?L().days[wd].replace(/^ال/,''):L().days[wd])],['monthly',t('rc.monthlyN',td.getDate())],['custom',t('rc13.custom')]].map(([k,l])=>`<button type="button" data-q="${k}" class="${k==='custom'&&RC13.open?'on':''}">${esc(l)}</button>`).join('')}</div>`;
  if(RC13.open){const s=c.mode;h+=`<div class="rc13s">`;
    if(s==='s'){h+=`<div class="rc13l">${esc(t('rc13.rep'))} <select class="in" data-k="n">${Array.from({length:12},(_,i)=>sel(c.n,i+1,String(i+1))).join('')}</select> <select class="in" data-k="u">${['d','w','m','y'].map(u=>sel(c.u,u,rc13N(c.n,u).replace(/^\d+\s*/,''))).join('')}</select></div>`;
      if(c.u==='d')h+=`<div class="rc13l">${esc(t('rc13.except'))}</div>${chips(c.ex,'x','ex')}`;
      else if(c.u==='w')h+=`<div class="rc13l">${esc(t('rc13.on'))}</div>${chips(c.days,'w')}`;
      else if(c.u==='m')h+=`<div class="rc13l">${esc(t('rc13.on'))} <select class="in" data-k="mm">${sel(c.mm,'dom',t('rc13.dom',c.dom))}${[1,2,3,4,-1].map(n=>sel(c.mm,'n'+n,t('rc13.nth'+(n>0?n:'L')))).join('')}</select>${c.mm!=='dom'?` <select class="in" data-k="wd">${rc13Days().map(i=>sel(c.wd,i,rc13Dn(i))).join('')}</select>`:''}</div>`;
      else h+=`<div class="rc13l">${esc(t('rc13.on'))} <select class="in" data-k="yy">${sel(c.yy,'g',gShort(td))}${sel(c.yy,'h',c.hd+' '+hMonthName(c.hm))}</select></div>`}
    else if(s==='after')h+=`<div class="rc13l">${esc(t('rc13.after1'))} <select class="in" data-k="an">${[1,2,3,4,5,6,7,10,14,21,30,60,90].map(n=>sel(c.an,n,rc13N(n,'d'))).join('')}</select> ${esc(t('rc13.after2'))}</div>`;
    else if(s==='nw')h+=`<div class="rc13l"><select class="in" data-k="nw">${[1,2,3,4,5,6].map(n=>sel(c.nw,n,String(n))).join('')}</select> ${esc(t('rc13.nwL'))}</div>`;
    else if(s==='hm')h+=`<div class="rc13l">${esc(t('rc13.hm1'))} <select class="in" data-k="hd">${Array.from({length:30},(_,i)=>sel(c.hd,i+1,String(i+1))).join('')}</select> ${esc(t('rc13.hm2'))}</div>`;
    else if(s==='hw')h+=`<div class="rc13l">${esc(t('rc13.hwD'))}</div>`;
    h+=`<div class="rc13or">${esc(t('rc13.or'))} ${[['s',t('rc13.mS')],['after',t('rc13.mA')],['hm',t('rc13.mH')],['nw',t('rc13.mN')],['hw',t('rc13.hw')]].filter(([k])=>k!==s).map(([k,l])=>`<button type="button" data-mode="${k}">${esc(l)}</button>`).join(' · ')}</div>`;
    const r=rc13Rule(c,txt);h+=`<div class="rc13sum ${r?'':'bad'}">${esc(r?rcDesc(r):t('rc13.pick'))}</div><button type="button" class="btn sm pri rc13go" data-save ${r?'':'disabled'}>${esc(t('rc13.save'))}</button></div>`}
  return h}
function rc13Paint(txt){const box=$('#rc13');if(!box)return;box.innerHTML=rc13Html(txt);const c=RC13.c;
  box.querySelectorAll('[data-q]').forEach(b=>b.onclick=e=>{e.stopPropagation();const k=b.dataset.q,td=keyToDate(todayKey()),r={id:uid(),text:txt,start:todayKey()};
    if(k==='custom'){RC13.open=!RC13.open;rc13Paint(txt);return}
    if(k==='daily')r.rule='daily';else if(k==='wd1')Object.assign(r,{rule:'wd',days:[td.getDay()]});else Object.assign(r,{rule:'monthly',dom:td.getDate()});rc13Save(r)});
  box.querySelectorAll('select[data-k]').forEach(s=>{s.onclick=e=>e.stopPropagation();s.onchange=()=>{const k=s.dataset.k,v=s.value;c[k]=['u','mm','yy'].includes(k)?v:+v;if(k==='mm'&&v!=='dom')c.nth=+v.slice(1);rc13Paint(txt)}});
  box.querySelectorAll('[data-w]').forEach(b=>b.onclick=e=>{e.stopPropagation();const i=+b.dataset.w;c.days=c.days.includes(i)?c.days.filter(x=>x!==i):[...c.days,i];rc13Paint(txt)});
  box.querySelectorAll('[data-x]').forEach(b=>b.onclick=e=>{e.stopPropagation();const i=+b.dataset.x;c.ex=c.ex.includes(i)?c.ex.filter(x=>x!==i):[...c.ex,i];if(c.ex.length>6)c.ex.pop();rc13Paint(txt)});
  box.querySelectorAll('[data-mode]').forEach(b=>b.onclick=e=>{e.stopPropagation();c.mode=b.dataset.mode;rc13Paint(txt)});
  const sv=box.querySelector('[data-save]');if(sv)sv.onclick=e=>{e.stopPropagation();rc13Save(rc13Rule(c,txt))}}
$('#rcBtn').onclick=()=>{const b=$('#rcBtn'),r=b.getBoundingClientRect(),txt=$('#taskIn').value.trim();RC13.c=rc13State();RC13.open=false;
  const list=RC();const p=qPopAt(`<div class="aymh"><b>🔁 ${esc(t('rc.title'))}</b></div>${txt?'<div id="rc13"></div>':`<div class="rc13hint">${esc(t('rc.typeFirst'))}</div>`}
    ${list.length?`<details class="rc13mine"><summary>${esc(t('rc13.mine',list.length))}</summary>${list.map(x=>`<div class="rc13r"><span dir="auto">${esc(x.text)}</span><small>${esc(rcDesc(x))}</small><button type="button" data-rx="${esc(x.id)}" title="${esc(t('rc.removed'))}">✕</button></div>`).join('')}<button type="button" class="rc13all" data-rman>${esc(t('rc13.manage'))}</button></details>`:''}`,r.left+r.width/2,r.bottom,'aymenu rcpop rc13pop');
  if(txt)rc13Paint(txt);
  p.querySelectorAll('[data-rx]').forEach(x=>x.onclick=e=>{e.stopPropagation();const id=x.dataset.rx;S.recur=RC().filter(q=>q.id!==id);const d=day(todayKey());d.tasks=d.tasks.filter(q=>!(q.recurId===id&&!q.done));save();closePP();renderTasks();toast(t('rc.removed'))});
  const man=p.querySelector('[data-rman]');if(man)man.onclick=()=>{closePP();rcwOpen()};
  p.querySelector('summary')&&p.querySelector('summary').addEventListener('click',e=>e.stopPropagation())};
/* «every day except Friday» in the smart input */
function rc13ExParse(raw){const m=String(raw).match(/(^|\s)(كل\s+يوم|يوميًا|يوميا|every\s*day|daily)\s+(?:ما\s*عدا|ماعدا|عدا|إلا|الا|غير|except|but)\s+/i);if(!m)return null;
  const head=raw.slice(0,m.index+m[1].length),rest=raw.slice(m.index+m[0].length).split(/\s+/);const ex=[];let i=0;
  for(;i<rest.length;i++){let w=rest[i].replace(/[،,]+$/,'');if(!w||/^(و|and|يوم|يومي)$/i.test(w))continue;let d=tk13DayIdx(w);if(d<0&&/^و/.test(w))d=tk13DayIdx(w.slice(1));if(d<0)break;if(!ex.includes(d))ex.push(d)}
  if(!ex.length||ex.length>6)return null;return{ex,text:(head+' '+rest.slice(i).join(' ')).replace(/\s+/g,' ').trim()}}
{const _p=uxParse;uxParse=function(raw,...a){const X=rc13ExParse(raw);if(!X)return _p(raw,...a);const o=_p(X.text,...a)||{text:X.text};if(!o.text)return null;delete o.d;o.rec={rule:'wd',days:[0,1,2,3,4,5,6].filter(i=>!X.ex.includes(i))};return o}}
{const _l=uxParseLabel;uxParseLabel=function(p){if(p&&p.rec&&p.rec.rule==='wd'&&p.rec.days&&p.rec.days.length>1){const q=Object.assign({},p,{rec:null}),rest=_l(q);return'🔁 '+rcDesc({rule:'wd',days:p.rec.days})+(rest?' · '+rest:'')}return _l(p)}}
/* ---- thirteenth list A2 ---- */
/* 19 «every Friday night» (Thursday, after Maghrib) and «every white day» (13–15 of the Hijri month) */
{const _m=rcMatch;rcMatch=function(r,k,...a){if(r&&r.rule==='hw'){if(r.start&&k<r.start)return false;const d=hNum(keyToDate(k)).d;return d>=13&&d<=15}return _m(r,k,...a)}}
{const _d=rcDesc;rcDesc=function(r){return r&&r.rule==='hw'?t('rc13.hw'):_d(r)}}
{const _p=uxParse;uxParse=function(raw,...a){const s=' '+(raw||'')+' ';let m=s.match(/\s(كل\s+ليلة\s+(?:ال)?جمعة|every\s+friday\s+night|every\s+thursday\s+night)\s/i);
  if(m){const rest=s.replace(m[0],' ').replace(/\s+/g,' ').trim(),o=_p(rest,...a)||{text:rest};if(!o.text)return null;delete o.d;o.rec={rule:'wd',days:[4]};if(!o.after)o.after='maghrib';return o}
  m=s.match(/\s(كل\s+(?:يوم\s+أبيض|يوم\s+ابيض|الأيام\s+البيض|الايام\s+البيض|أيام\s+البيض|ايام\s+البيض)|every\s+white\s+days?)\s/i);
  if(m){const rest=s.replace(m[0],' ').replace(/\s+/g,' ').trim(),o=_p(rest,...a)||{text:rest};if(!o.text)return null;delete o.d;o.rec={rule:'hw'};return o}return _p(raw,...a)}}
{const _l=uxParseLabel;uxParseLabel=function(p,...a){if(p&&p.rec&&p.rec.rule==='hw'){const rest=_l(Object.assign({},p,{rec:null}),...a);return t('rc13.hw')+(rest?' · '+rest:'')}return _l(p,...a)}}
/* 20 a task that is not carried over */
function tk13Nc(x){return!!(x&&(x.nc||x.pinId))}
{hookFn('carryRun',()=>carryRun,f=>{carryRun=f},'pre',function(){try{Object.values(S.days).forEach(d=>(d.tasks||[]).forEach(o=>{if(tk13Nc(o)&&!o.dismissed){o.dismissed=1;o._ncD=1}}))}catch(e){}})}
{hookFn('carryRun',()=>carryRun,f=>{carryRun=f},'post',function(){try{Object.values(S.days).forEach(d=>(d.tasks||[]).forEach(o=>{if(o._ncD){delete o._ncD;delete o.dismissed}}))}catch(e){}})}
{const _f=uxTomorrow;uxTomorrow=function(ids,...a){if(!Array.isArray(ids))return _f(ids,...a);const d=day(todayKey());return _f(ids.filter(id=>!tk13Nc(d.tasks.find(q=>q.id===id))),...a)}}
{const _f=tk13Left;tk13Left=function(...a){return _f(...a).filter(o=>!tk13Nc(o.x))}}
/* 21 tags as short chips on the row; a tap filters the list by that tag */
{const _tm=taskMeta;taskMeta=function(x,...a){let h=_tm(x,...a);try{if(!x)return h;const tg=tk13Tags(x.text||''),bits=[];
  tg.slice(0,4).forEach(g=>bits.push(`<button type="button" class="ntag tk13tg" data-tag="${esc(g)}" data-tagc="${esc(g)}" data-tk13tg="${esc(g)}" dir="auto">#${esc(g.length>14?g.slice(0,13)+'…':g)}</button>`));
  if(x.nc)bits.push(`<span class="tk13nc">${esc(t('tk13.ncB'))}</span>`);if(x.pinId)bits.push(`<span class="tk13pn">${esc(t('tk13.pinB'))}</span>`);
  if(bits.length)h+=`<span class="tk13row tk13tgr">${bits.join('')}</span>`}catch(e){}return h}}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-tk13tg]');if(!b)return;e.preventDefault();e.stopPropagation();const v='#'+b.dataset.tk13tg;CTX=CTX===v?null:v;renderTasks();try{renderCtxBar()}catch(er){}},true);
/* 22 pinned tasks: one task kept at the top of every day until it is done */
function PINT(){return S.pinTk||(S.pinTk=[])}
try{if(!SY_SIMPLE.includes('pinTk'))SY_SIMPLE.push('pinTk')}catch(e){}
function tk13PinEnsure(){try{const k=todayKey(),d=day(k);let ch=false;PINT().forEach(p=>{if(d.tasks.some(q=>q.pinId===p.id))return;d.tasks.unshift({id:'pin-'+p.id+'-'+k,text:p.text,done:false,created:Date.now(),pinId:p.id});ch=true});if(ch)save()}catch(e){}}
{hookFn('renderToday',()=>renderToday,f=>{renderToday=f},'pre',tk13PinEnsure)}
function tk13PinDone(){const d=S.days[todayKey()];if(!d||!d.tasks)return;let ch=false;d.tasks.forEach(x=>{if(x.pinId&&x.done&&PINT().some(p=>p.id===x.pinId)){S.pinTk=PINT().filter(p=>p.id!==x.pinId);ch=true;toast(t('tk13.pinDone'))}});if(ch)save()}
{hookFn('renderTasks',()=>renderTasks,f=>{renderTasks=f},'post',function(){try{tk13PinDone();const ul=$('#tasks');if(!ul)return;const d=day(todayKey());
  [...ul.querySelectorAll(':scope>li[data-id]')].reverse().forEach(li=>{const x=d.tasks.find(q=>q.id===li.dataset.id);if(x&&x.pinId&&!x.done){li.classList.add('tk13pin');ul.prepend(li)}})}catch(e){}})}
function tk13Pin(k,id){const d=day(k),x=d.tasks.find(q=>q.id===id);if(!x)return;if(x.pinId){S.pinTk=PINT().filter(p=>p.id!==x.pinId);delete x.pinId;save();renderTasks();toast(t('tk13.unpinned'));return}
  const p={id:uid().slice(0,8),text:x.text,at:Date.now()};PINT().push(p);x.pinId=p.id;save();renderTasks();toast(t('tk13.pinned'))}
/* 23 a chip that shows only linked tasks (lesson, book, note, picture, link) */
function tk13Linked(x){return!!(x&&(x.lib||x.lod||x.bk||x.note||(x.img&&x.img.length)||tk13Urls(x.text||'').length))}
{hookFn('renderCtxBar',()=>renderCtxBar,f=>{renderCtxBar=f},'post',function(){try{const bar=$('#ctxBar');if(!bar||bar.querySelector('#tk13Lk'))return;const d=day(todayKey());if(!TK13.lnk&&!d.tasks.some(x=>!x.done&&tk13Linked(x)))return;
  bar.hidden=false;bar.insertAdjacentHTML('beforeend',`<button class="chip ${TK13.lnk?'on':''}" id="tk13Lk">🔗 ${esc(t('tk13.lnkF'))}</button>`);$('#tk13Lk').onclick=()=>{TK13.lnk=!TK13.lnk;renderTasks();try{renderCtxBar()}catch(e){}}}catch(e){}})}
{hookFn('renderTasks',()=>renderTasks,f=>{renderTasks=f},'post',function(){try{const d=day(todayKey());$$('#tasks>li[data-id]').forEach(li=>{const x=d.tasks.find(q=>q.id===li.dataset.id);li.classList.toggle('tk13hid',!!(TK13.lnk&&x&&!tk13Linked(x)))});const c=$('#tk13Lk');if(c)c.classList.toggle('on',!!TK13.lnk)}catch(e){}})}
/* 24 how many tasks are left in each prayer period, on the prayer chips */
function tk13PcPaint(){try{const d=S.days[todayKey()];$$('#prayers [data-pk]').forEach(c=>{const k=c.dataset.pk;let b=c.querySelector('.tk13pc');
  const n=d&&d.tasks?d.tasks.filter(x=>!x.done&&x.after===k&&!x.pp).length:0;if(!n){if(b)b.remove();return}
  if(!b){b=document.createElement('span');b.className='tk13pc';c.append(b)}b.textContent=n;b.title=t('tk13.pcT',n)})}catch(e){}}
{hookFn('renderPrayers',()=>renderPrayers,f=>{renderPrayers=f},'post',tk13PcPaint)}
{hookFn('renderTasks',()=>renderTasks,f=>{renderTasks=f},'post',tk13PcPaint)}
/* 25 «move to after a prayer…» with the day, in the selection bar */
function tk13SelMove(btn){const ids=[...UXT.sel];if(!ids.length)return;const r=btn.getBoundingClientRect(),td=keyToDate(todayKey());let dk=0,pr='';
  const days=[[0,t('tk13.smD0')],[1,t('tk13.smD1')],[2,t('tk13.smD2')]];
  const paint=()=>{const p=$('#ppPop');if(!p)return;p.querySelector('.tk13sm').innerHTML=`<div class="rc13l">${esc(t('tk13.smDay'))}</div><div class="rc13q">${days.map(([v,l])=>`<button type="button" data-sd="${v}" class="${dk===v?'on':''}">${esc(l)}</button>`).join('')}<input type="date" class="in" data-native data-sdd value="${dk>2?dKey(addDays(td,dk)):''}" min="${todayKey()}"></div>
    <div class="rc13l">${esc(t('tk13.smPr'))}</div><div class="rc13q">${PRAYERS.map(k=>`<button type="button" data-sp="${k}" class="${pr===k?'on':''}">${esc(t('pr.'+k))}</button>`).join('')}<button type="button" data-sp="" class="${pr===''?'on':''}">${esc(t('tk13.smNone'))}</button></div>
    <button type="button" class="btn sm pri rc13go" data-smgo>${esc(t('tk13.smGo',ids.length))}</button>`;
    p.querySelectorAll('[data-sd]').forEach(b=>b.onclick=e=>{e.stopPropagation();dk=+b.dataset.sd;paint()});
    const di=p.querySelector('[data-sdd]');di.onclick=e=>e.stopPropagation();di.onchange=()=>{if(di.value){dk=Math.max(0,Math.round((keyToDate(di.value)-td)/864e5));paint()}};
    p.querySelectorAll('[data-sp]').forEach(b=>b.onclick=e=>{e.stopPropagation();pr=b.dataset.sp;paint()});
    p.querySelector('[data-smgo]').onclick=e=>{e.stopPropagation();const tk=todayKey(),to=dKey(addDays(td,dk));let moved=ids;
      if(dk>0){const before=new Set(day(to).tasks.map(q=>q.id));dmvMove(tk,to,ids);moved=day(to).tasks.filter(q=>!before.has(q.id)).map(q=>q.id)}
      const dst=day(to);moved.forEach(id=>{const x=dst.tasks.find(q=>q.id===id);if(!x)return;if(pr){x.after=pr;delete x.at}else delete x.after});
      UXT.sel.clear();save();closePP();renderTasks();try{uxSelBar()}catch(er){}toast(t('tk13.smOk',moved.length))}};
  qPopAt(`<div class="aymh"><b>${esc(t('tk13.smT'))}</b></div><div class="tk13sm"></div>`,r.left+r.width/2,r.bottom,'aymenu rcpop rc13pop');paint()}
{hookFn('uxSelBar',()=>uxSelBar,f=>{uxSelBar=f},'post',function(){try{const bar=$('#uxSel');if(!bar||!UXT.sel.size||bar.querySelector('#tk13Sm'))return;
  bar.insertAdjacentHTML('beforeend',`<button class="btn sm" id="tk13Sm">🕌 ${esc(t('tk13.smB'))}</button>`);$('#tk13Sm').onclick=e=>{e.stopPropagation();tk13SelMove(e.currentTarget)}}catch(e){}})}
/* task «⋯»: pin, not carried */
{const _ux=uxMenuExtras;uxMenuExtras=function(k,id,...a){const r=_ux(k,id,...a);try{const p=$('#ppPop'),x=day(k).tasks.find(q=>q.id===id);if(!p||!x||p.querySelector('[data-tk13n]'))return r;
  const add=(ic,lab,fn)=>{const b=document.createElement('button');b.dataset.tk13n=1;b.innerHTML=`${ic} ${esc(lab)}`;b.onclick=e=>{e.stopPropagation();closePP();fn()};p.append(b)};
  if(!x.done&&!x.recurId)add('📌',x.pinId?t('tk13.unpin'):t('tk13.pin'),()=>tk13Pin(k,id));
  add('⏹',x.nc?t('tk13.ncOff'):t('tk13.ncOn'),()=>{if(x.nc)delete x.nc;else x.nc=1;save();renderTasks();toast(x.nc?t('tk13.ncOk'):t('tk13.ncNo'))})}catch(e){console.error(e)}return r}}

