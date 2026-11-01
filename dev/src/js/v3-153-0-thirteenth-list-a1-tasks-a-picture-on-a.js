/* ============ v3.153.0 thirteenth list A1 (tasks): a picture on a task, links in a task as buttons, a reminder when a task's prayer period starts,
   «from Sunday to Thursday» in the smart input, a #tag tied to a category, the week's leftovers, done tasks per tag this month,
   task → event and event → task, book and lesson tasks that tick themselves ============ */
const TK13={};
try{if(!SY_SIMPLE.includes('tagCat'))SY_SIMPLE.push('tagCat')}catch(e){}
function tk13Tags(s){return[...String(s||'').matchAll(/(?:^|\s)#([\p{L}\p{N}_\/-]+)/gu)].map(m=>m[1])}
function tk13Urls(s){return[...String(s||'').matchAll(/https?:\/\/[^\s<>"']+/g)].map(m=>m[0].replace(/[.,،؛)\]]+$/,''))}
function tk13Host(u){try{return new URL(u).hostname.replace(/^www\./,'')}catch(e){return u.slice(0,24)}}
/* 1 + 2 + 15 on the row */
{const _tm=taskMeta;taskMeta=function(x,...a){let h0=_tm(x,...a),h='';try{if(!x)return h0;
  if(x.img&&x.img.length)h+=`<button class="tk13b" data-tk13="img" data-id="${esc(x.id)}" title="${esc(t('tk13.img'))}">🖼 ${x.img.length>1?x.img.length:''}</button>`;
  tk13Urls(x.text).slice(0,3).forEach(u=>{h+=`<button class="tk13b" data-tk13="url" data-u="${esc(u)}" title="${esc(u)}">🔗 <bdi dir="ltr">${esc(tk13Host(u))}</bdi></button>`});
  if(x.bk){const n=tk13BkToday(x.bk),g=tk13BkGoal(x.text);if(n||g)h+=`<span class="tk13p ${g&&n>=g?'ok':''}">📖 ${esc(g?t('tk13.pgG',n,g):t('tk13.pg',n))}</span>`}}catch(e){}return h0+(h?`<span class="tk13row">${h}</span>`:'')}}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-tk13]');if(!b)return;e.preventDefault();e.stopPropagation();const k=b.dataset.tk13;
  if(k==='url')openExt(b.dataset.u);
  else if(k==='img'){const x=tk13Find(b.dataset.id);if(x&&x.img)lbOpen(x.img,0,x.text)}},true);
function tk13Find(id){for(const k of [todayKey(),...Object.keys(S.days).sort().reverse()]){const d=S.days[k];const x=d&&d.tasks&&d.tasks.find(q=>q.id===id);if(x)return x}return null}
function tk13ImgAdd(k,id){const x=day(k).tasks.find(q=>q.id===id);if(!x)return;const inp=document.createElement('input');inp.type='file';inp.accept='image/*';inp.multiple=true;inp.style.display='none';document.body.append(inp);
  inp.onchange=async()=>{const fs=[...inp.files].slice(0,6);inp.remove();if(!fs.length)return;x.img=x.img||[];
    for(const f of fs){try{const u=await shrinkImage(f,1600,.82),iid='tk'+uid();await idbSet('nimg:'+iid,u);x.img.push(iid)}catch(er){console.error(er)}}
    save();renderTasks();toast(t('tk13.imgOk'))};inp.click()}
function tk13ImgDrop(k,id){const x=day(k).tasks.find(q=>q.id===id);if(!x||!x.img)return;const old=x.img;delete x.img;save();renderTasks();toastAct(t('tk13.imgGone'),t('undo'),()=>{x.img=old;save();renderTasks()})}
/* 15 pages of a book read today (a page counts after 15 s on it) */
const TK13B={key:'',pg:0,at:0};
function tk13BkToday(key){const d=S.days[todayKey()];return d&&d.bkpg&&d.bkpg[key]?d.bkpg[key].length:0}
function tk13BkGoal(s){const m=String(s||'').match(/([0-9٠-٩]+)\s*(?:صفحة|صفحات|ص\b|pages?|pp?\b)/i);return m?+m[1].replace(/[٠-٩]/g,c=>'٠١٢٣٤٥٦٧٨٩'.indexOf(c)):0}
function tk13BkCount(){try{const key=BK&&BK.key,pg=BK&&BK.cur;if(!key||!pg||!$('#bkReader')||!$('#bkReader').classList.contains('on')&&!$('#bkReader').offsetParent){TK13B.key='';return}
  const now=Date.now();if(TK13B.key===key&&TK13B.pg===pg){if(now-TK13B.at>=15000)tk13BkMark(key,pg);return}TK13B.key=key;TK13B.pg=pg;TK13B.at=now}catch(e){}}
function tk13BkMark(key,pg){const d=day(todayKey());d.bkpg=d.bkpg||{};const a=d.bkpg[key]||(d.bkpg[key]=[]);if(a.includes(pg))return;a.push(pg);
  let ch=false;(d.tasks||[]).forEach(x=>{if(x.bk!==key||x.done)return;const g=tk13BkGoal(x.text);if(g&&a.length>=g){x.done=true;x.doneAt=Date.now();ch=true;toast(t('tk13.bkDone',x.text))}});save();if(ch)try{renderTasks()}catch(e){}}
setInterval(tk13BkCount,3000);
{hookFn('bkTrack',()=>bkTrack,f=>{bkTrack=f},'post',function(){tk13BkCount()})}
/* 16 a task tied to a lesson ticks itself when the lesson is watched */
function tk13LibCheck(){try{const k=todayKey(),d=S.days[k];if(!d||!d.tasks)return;const P=LIBS().prog;let ch=false;
  d.tasks.forEach(x=>{if(x.done||!x.lib||x.auto==='lod')return;const p=P[x.lib];if(p&&p.done){x.done=true;x.doneAt=Date.now();ch=true;toast(t('tk13.libDone',x.text))}});if(ch){save();try{renderTasks()}catch(e){}}}catch(e){}}
{hookFn('libSave',()=>libSave,f=>{libSave=f},'post',function(){tk13LibCheck()})}
{hookFn('renderToday',()=>renderToday,f=>{renderToday=f},'pre',function(){tk13LibCheck()})}
/* 6 reminder when a task's prayer period starts */
function tk13Per(){return Object.assign({on:false,min:10},S.settings.tkPer||{})}
function tk13PerList(k,p){const d=S.days[k];return d&&d.tasks?d.tasks.filter(x=>!x.done&&x.after===p&&!(x.pp&&x.pp.length)):[]}
function tk13PerCheck(){try{const c=tk13Per();if(!c.on)return;const k=todayKey(),d=day(k),pt=prayerTimes(keyToDate(k)),now=Date.now();d.tkPerF=d.tkPerF||{};
  PRAYERS.forEach(p=>{const at=pt[p]+c.min*6e4;if(d.tkPerF[p]||now<at||now>at+20*6e4)return;const L_=tk13PerList(k,p);if(!L_.length)return;d.tkPerF[p]=1;save();
    if(!ANDROID)alertUser(t('tk13.perT',t('pr.'+p)),L_.slice(0,5).map(x=>'• '+x.text).join('\n'))})}catch(e){}}
setInterval(tk13PerCheck,60000);setTimeout(tk13PerCheck,8000);
{hookFn('extraSched',()=>extraSched,f=>{extraSched=f},'post',function(out,now){try{const c=tk13Per();if(!c.on)return;const td=keyToDate(todayKey());let n=0;
  for(let i=0;i<2;i++){const dt=addDays(td,i),k=dKey(dt),pt=prayerTimes(dt);PRAYERS.forEach(p=>{const L_=tk13PerList(k,p),at=pt[p]+c.min*6e4;if(!L_.length||at<=now)return;
    out.push({id:9520+n++,t:at,title:t('tk13.perT',t('pr.'+p)),body:L_.slice(0,4).map(x=>x.text).join(' · '),open:'today'})})}}catch(e){}})}
function tk13PerOpen(){const c=tk13Per();openInfo('🕌 '+esc(t('tk13.perS')),`<p class="muted" style="font-size:13px">${esc(t('tk13.perH'))}</p>
  <div class="tk13opts">${[0,5,10,15,20,30].map(m=>`<button class="chip ${c.on&&c.min===m?'on':''}" data-m="${m}">${esc(m?t('tk13.perM',m):t('tk13.perAt'))}</button>`).join('')}<button class="chip ${c.on?'':'on'}" data-m="off">${esc(t('tk13.off'))}</button></div>`);
  $$('#infoBox [data-m]').forEach(b=>b.onclick=()=>{const v=b.dataset.m;S.settings.tkPer=v==='off'?Object.assign(c,{on:false}):{on:true,min:+v};save();if(ANDROID)try{androidSchedule()}catch(e){}tk13PerOpen();tk13SetRow()})}
function tk13SetRow(){const r=$('#tk13PerR');if(!r)return;const c=tk13Per();r.querySelector('small').textContent=c.on?t('tk13.perOn',c.min):t('tk13.perH')}
{hookFn('renderSettings',()=>renderSettings,f=>{renderSettings=f},'post',function(){try{const r=$('#tkfRow')||$('#acrRow');if(!r||$('#tk13PerR'))return;
  r.insertAdjacentHTML('afterend',`<div class="field" id="tk13PerR"><div><label data-i18n="tk13.perS">${esc(t('tk13.perS'))}</label><small></small></div><button class="btn sm" id="tk13PerB">${esc(t('tk13.set'))}</button></div>`);
  $('#tk13PerB').onclick=tk13PerOpen;tk13SetRow()}catch(e){}})}
/* 7 «من الأحد إلى الخميس» makes the task on each of those days */
function tk13DayIdx(w){w=String(w).trim().toLowerCase().replace(/^ال/,'').replace(/^يوم\s*/,'');const ar=['احد','اثنين','ثلاثاء','اربعاء','خميس','جمعة','سبت'],ar2=['أحد','إثنين','ثلاثاء','أربعاء','خميس','جمعة','سبت'],en=['sun','mon','tue','wed','thu','fri','sat'];
  const n=w.replace(/[أإآ]/g,'ا').replace(/ة$/,'ة');for(let i=0;i<7;i++){if(n===ar[i]||w===ar2[i]||n==='ال'+ar[i]||w.startsWith(en[i]))return i}if(n==='اتنين'||n==='الاتنين')return 1;return -1}
const TK13_RG=/(?:^|\s)(?:من|from)\s+(?:يوم\s+)?([\p{L}]+)\s+(?:إلى|الى|حتى|لين|to|till|until|-)\s+(?:يوم\s+)?([\p{L}]+)(?=\s|$)/iu;
function tk13Range(s){const m=String(s).match(TK13_RG);if(!m)return null;const a=tk13DayIdx(m[1]),b=tk13DayIdx(m[2]);if(a<0||b<0)return null;
  const td=keyToDate(todayKey());let st=(a-td.getDay()+7)%7;const len=(b-a+7)%7;const keys=[];for(let i=0;i<=len;i++)keys.push(dKey(addDays(td,st+i)));return{keys,text:s.replace(m[0],' ').replace(/\s+/g,' ').trim()}}
{const _f=addTask;addTask=function(...a){const inp=$('#taskIn'),v=inp?inp.value:'';const R=v&&tk13Range(v);if(!R||!R.text)return _f(...a);
  const tk=todayKey(),d=day(tk),before=new Set(d.tasks.map(x=>x.id));inp.value=R.text;const r=_f(...a);
  const fresh=day(tk).tasks.filter(x=>!before.has(x.id));if(!fresh.length)return r;
  R.keys.forEach(k=>{if(k===tk)return;fresh.forEach(x=>{const c=Object.assign({},x,{id:uid(),created:Date.now()});delete c.done;delete c.doneAt;c.done=false;day(k).tasks.push(c)})});
  if(!R.keys.includes(tk))d.tasks=d.tasks.filter(x=>!fresh.includes(x));save();renderTasks();toast(t('tk13.rng',R.keys.length));return r}}
{hookFn('renderTasks',()=>renderTasks,f=>{renderTasks=f},'post',function(){try{const inp=$('#taskIn');if(!inp||inp._tk13)return;inp._tk13=1;
  inp.addEventListener('input',()=>{const R=tk13Range(inp.value);let el=$('#tk13Rp');if(!R){if(el)el.remove();return}
    if(!el){el=document.createElement('div');el.id='tk13Rp';el.className='tk13rp';(inp.closest('.addtask')||inp).after(el)}
    el.textContent='📅 '+t('tk13.rngP',R.keys.map(k=>L().days[keyToDate(k).getDay()]).join('، '))})}catch(e){}})}
/* 8 a #tag tied to a category: starting the timer on such a task counts it there */
function tk13TagCat(){return S.tagCat||(S.tagCat={})}
{hookFn('taskStart',()=>taskStart,f=>{taskStart=f},'post',function(k,x){try{const M=tk13TagCat(),tg=tk13Tags(x&&x.text).find(g=>M[g]&&catRaw(M[g]));if(!tg)return;S.timer.cat=M[tg];save();renderCatChips();renderTimer();renderGlass();toast(t('tk13.tcOn','#'+tg,catName(catOf(M[tg]))))}catch(e){}})}
function tk13AllTags(){const M=new Map();Object.entries(S.days).forEach(([k,d])=>(d.tasks||[]).forEach(x=>tk13Tags(x.text).forEach(g=>M.set(g,(M.get(g)||0)+1))));Object.keys(tk13TagCat()).forEach(g=>{if(!M.has(g))M.set(g,0)});return[...M.entries()].sort((a,b)=>b[1]-a[1])}
function tk13TcOpen(){const M=tk13TagCat(),tags=tk13AllTags(),cs=S.settings.categories||[];
  openInfo('🏷 '+esc(t('tk13.tcT')),`<p class="muted" style="font-size:13px">${esc(t('tk13.tcH'))}</p>${tags.length?`<div class="tk13tc">${tags.map(([g,n])=>`<label><span class="ntag" data-tag="${esc(g)}" dir="auto">#${esc(g)}</span><small>${n}</small><select class="in" data-tg="${esc(g)}"><option value="">${esc(t('tk13.tcNone'))}</option>${cs.map(c=>`<option value="${esc(c.id)}" ${M[g]===c.id?'selected':''}>${esc(catName(c))}</option>`).join('')}</select></label>`).join('')}</div>`:`<div class="empty">${esc(t('tk13.tcEmpty'))}</div>`}`);
  $$('#infoBox select[data-tg]').forEach(s=>s.onchange=()=>{if(s.value)M[s.dataset.tg]=s.value;else delete M[s.dataset.tg];save()})}
/* 9 the week's leftovers */
const TK13_AUTO=/^(mulk-|ptpl-|lod-|exam-|kahf-)/;
function tk13Left(){const td=keyToDate(todayKey()),out=[];for(let i=1;i<=7;i++){const k=dKey(addDays(td,-i)),d=S.days[k];if(!d||!d.tasks)continue;
  d.tasks.forEach(x=>{if(x.done||(x.pp&&x.pp.length)||x.recurId||x.auto||TK13_AUTO.test(x.id)||x.tk13Skip)return;out.push({k,x})})}return out}
function tk13LeftOpen(){const L_=tk13Left(),tk=todayKey();
  openInfo('🧺 '+esc(t('tk13.lfT')),L_.length?`<p class="muted" style="font-size:13px">${esc(t('tk13.lfH'))}</p><div class="tk13lf">${L_.map(({k,x})=>`<div class="tk13lr"><span dir="auto">${esc(x.text)}</span><small>${esc(dayLabel(k))}</small><button class="btn sm" data-lmv="${esc(k)}|${esc(x.id)}">${esc(t('tk13.lfTo'))}</button><button class="btn sm ghost" data-lsk="${esc(k)}|${esc(x.id)}" title="${esc(t('tk13.lfSkip'))}">✕</button></div>`).join('')}</div><button class="btn sm pri" id="tk13LfAll">${esc(t('tk13.lfAll',L_.length))}</button>`:`<div class="empty">${esc(t('tk13.lfNone'))}</div>`);
  const mv=(k,ids)=>dmvMove(k,tk,ids);
  $$('#infoBox [data-lmv]').forEach(b=>b.onclick=()=>{const[k,id]=b.dataset.lmv.split('|');mv(k,[id]);save();renderTasks();tk13LeftOpen()});
  $$('#infoBox [data-lsk]').forEach(b=>b.onclick=()=>{const[k,id]=b.dataset.lsk.split('|');const x=S.days[k].tasks.find(q=>q.id===id);if(x)x.tk13Skip=1;save();tk13LeftOpen();tk13LeftLine()});
  const all=$('#tk13LfAll');if(all)all.onclick=()=>{const by={};L_.forEach(({k,x})=>(by[k]=by[k]||[]).push(x.id));let n=0;Object.entries(by).forEach(([k,ids])=>n+=mv(k,ids)||0);save();renderTasks();$('#infoModal').classList.remove('on');toast(t('tk13.lfMoved',L_.length))}}
function tk13LeftLine(){const box=$('#tasks');if(!box)return;let el=$('#tk13Lf');const n=tk13Left().length;if(!n){if(el)el.remove();return}
  if(!el){el=document.createElement('button');el.id='tk13Lf';el.type='button';el.className='tk13lfl';el.onclick=tk13LeftOpen}
  const anchor=$('#snzLine')||$('#obtBox')||box;if(el.previousElementSibling!==anchor)anchor.after(el);el.textContent='🧺 '+t('tk13.lfL',n)}
{hookFn('renderTasks',()=>renderTasks,f=>{renderTasks=f},'post',function(){try{tk13LeftLine()}catch(e){}})}
/* 11 done tasks per #tag this month, in the tag stats window */
{hookFn('tgsOpen',()=>tgsOpen,f=>{tgsOpen=f},'post',function(){try{const td=keyToDate(todayKey()),pre=dKey(td).slice(0,7),M=new Map();
  Object.entries(S.days).forEach(([k,d])=>{if(!k.startsWith(pre))return;(d.tasks||[]).forEach(x=>{if(!x.done)return;tk13Tags(x.text).forEach(g=>M.set(g,(M.get(g)||0)+1))})});
  const L_=[...M.entries()].sort((a,b)=>b[1]-a[1]),mx=L_.length?L_[0][1]:1,box=$('#infoBox .infob');if(!box)return;
  box.insertAdjacentHTML('beforeend',`<h3 class="tk13h">${esc(t('tk13.tgM'))}</h3>${L_.length?`<div class="tgsl">${L_.map(([g,n])=>`<div class="tgsr"><span dir="auto" class="ntag" data-tag="${esc(g)}">#${esc(g)}</span><i style="--w:${Math.round(n/mx*100)}%"></i><b>${n}</b><small>${esc(t('tk13.tgDone'))}</small></div>`).join('')}</div>`:`<div class="empty">${esc(t('tk13.tgNone'))}</div>`}`)}catch(e){}})}
/* 13 task → event */
function tk13ToEv(k,id){const d=day(k),i=d.tasks.findIndex(q=>q.id===id);if(i<0)return;const x=d.tasks[i],e={id:uid(),title:x.text,date:k,time:x.at||'',end:'',color:EVCOLS[0],rep:'none',rem:null,notes:'',big:false};
  if(x.at){const[h,m]=x.at.split(':').map(Number),e2=h*60+m+(x.est||30);if(e2<24*60)e.end=String(Math.floor(e2/60)).padStart(2,'0')+':'+String(e2%60).padStart(2,'0')}
  EVS().push(e);d.tasks.splice(i,1);save();renderTasks();try{renderTodayEv()}catch(er){}
  toastAct(t('tk13.toEvOk'),t('undo'),()=>{S.events=EVS().filter(q=>q.id!==e.id);d.tasks.splice(Math.min(i,d.tasks.length),0,x);save();renderTasks();try{renderTodayEv()}catch(er){}})}
/* 14 event → task (in the calendar day panel) */
function tk13FromEv(id,k){const e=EVS().find(q=>q.id===id);if(!e)return;const d=day(k),x={id:uid(),text:e.title,done:false,created:Date.now()};
  if(e.time){x.at=e.time;const p=pdlSlotOf(k,atTime(keyToDate(k),e.time));if(p)x.after=p;if(e.end){const hm=v=>{const m=String(v||'').match(/^(\d+):(\d+)/);return m?+m[1]*60+ +m[2]:null},a=hm(e.time),b=hm(e.end);if(a!=null&&b>a)x.est=b-a}}
  d.tasks.push(x);save();try{renderTasks()}catch(er){}toastAct(t('tk13.fromEvOk',dayLabel(k)),t('undo'),()=>{d.tasks=d.tasks.filter(q=>q.id!==x.id);save();try{renderTasks()}catch(er){}})}
{hookFn('renderDetail',()=>renderDetail,f=>{renderDetail=f},'post',function(k){try{$$('#detail .evli[data-ev],#detail .evbig[data-ev]').forEach(el=>{if(el.querySelector('.tk13et'))return;
  const b=document.createElement('button');b.type='button';b.className='tk13et';b.title=t('tk13.fromEv');b.textContent='☑';b.onclick=ev=>{ev.stopPropagation();tk13FromEv(el.dataset.ev,k)};el.append(b)})}catch(e){}})}
/* task «⋯» rows */
{const _ux=uxMenuExtras;uxMenuExtras=function(k,id,...a){const r=_ux(k,id,...a);try{const p=$('#ppPop'),x=day(k).tasks.find(q=>q.id===id);if(!p||!x||p.querySelector('[data-tk13m]'))return r;
  const add=(ic,lab,fn)=>{const b=document.createElement('button');b.dataset.tk13m=1;b.innerHTML=`${ic} ${esc(lab)}`;b.onclick=e=>{e.stopPropagation();closePP();fn()};p.append(b)};
  add('🖼',t('tk13.imgAdd'),()=>tk13ImgAdd(k,id));if(x.img&&x.img.length)add('✕',t('tk13.imgDel'),()=>tk13ImgDrop(k,id));
  if(!x.done)add('📅',t('tk13.toEv'),()=>tk13ToEv(k,id));if(tk13Tags(x.text).length)add('🏷',t('tk13.tcB'),tk13TcOpen)}catch(e){console.error(e)}return r}}
{const _c=cmdCommands;cmdCommands=function(...a){const L_=_c(...a);try{L_.push({icon:'🏷',label:t('tk13.tcT'),run:tk13TcOpen,kw:'tag category وسم فئة'},{icon:'🧺',label:t('tk13.lfT'),run:tk13LeftOpen,kw:'leftovers week بقايا الأسبوع'},{icon:'🕌',label:t('tk13.perS'),run:tk13PerOpen,kw:'reminder period تذكير فترة'})}catch(e){}return L_}}

