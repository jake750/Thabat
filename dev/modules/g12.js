/* ============ v3.10: a batch of everyday improvements (touch, sheets, tasks, trash, recap, cards, PC) ============ */
/* ---- phone: dialogs open as bottom sheets; drag one down to close it ---- */
const UX_NOSHEET=new Set(['cmdk','noteModal','setupModal','pinModal']),UX_NOSWIPE=new Set(['modal','cmdk','noteModal','setupModal','pinModal']);
function uxSheetClose(m){m.dispatchEvent(new MouseEvent('click',{bubbles:true}));if(!m.classList.contains('on'))return;
  const x=m.querySelector('.box [id$="X"],.box [data-i18n="ev.cancel"],.box [data-i18n="cancel"]');if(x){x.click();if(!m.classList.contains('on'))return}m.classList.remove('on')}
function uxGrab(m){const b=m.querySelector(':scope>.box');if(!b||UX_NOSHEET.has(m.id))return;if(!(b.firstElementChild&&b.firstElementChild.classList.contains('uxgrab'))){const g=document.createElement('div');g.className='uxgrab';g.setAttribute('aria-hidden','true');b.prepend(g)}}
$$('.modal').forEach(m=>{if(UX_NOSHEET.has(m.id))return;m.classList.add('uxsheet');const b=m.querySelector(':scope>.box');if(!b)return;
  new MutationObserver(()=>{if(m.classList.contains('on'))uxGrab(m)}).observe(m,{attributes:true,attributeFilter:['class']});
  new MutationObserver(()=>{if(m.classList.contains('on'))uxGrab(m)}).observe(b,{childList:true});
  if(UX_NOSWIPE.has(m.id))return;let y0=0,x0=0,dy=0,on=false,lock=null;
  b.addEventListener('touchstart',e=>{if(!MOB.matches||e.touches.length!==1)return;const tg=e.target;if(tg.closest('input,textarea,select,[contenteditable],input[type=range],.hrs,.chips,.scrollx'))return;
    let s=tg;while(s&&s!==b){if(s.scrollHeight>s.clientHeight+2&&s.scrollTop>0)return;s=s.parentElement}if(b.scrollTop>0)return;y0=e.touches[0].clientY;x0=e.touches[0].clientX;dy=0;on=true;lock=null},{passive:true});
  b.addEventListener('touchmove',e=>{if(!on)return;const y=e.touches[0].clientY-y0,x=e.touches[0].clientX-x0;if(lock===null&&(Math.abs(y)>8||Math.abs(x)>8))lock=y>0&&y>Math.abs(x)?'y':'n';if(lock!=='y'){if(lock==='n')on=false;return}
    dy=Math.max(0,y);b.style.transition='none';b.style.transform=`translateY(${dy}px)`;if(e.cancelable)e.preventDefault()},{passive:false});
  b.addEventListener('touchend',()=>{if(!on)return;on=false;b.style.transition='transform .2s';if(lock==='y'&&dy>110){b.style.transform='translateY(100%)';setTimeout(()=>{b.style.transform='';b.style.transition='';uxSheetClose(m)},180)}else{b.style.transform='';setTimeout(()=>b.style.transition='',220)}},{passive:true})});

/* ---- phone: swipe on the calendar grid changes the month ---- */
(()=>{const c=$('#cal');if(!c)return;let sx=0,sy=0,st=0,ok=false;
  c.addEventListener('touchstart',e=>{ok=MOB.matches&&e.touches.length===1;sx=e.touches[0].clientX;sy=e.touches[0].clientY;st=Date.now()},{passive:true});
  c.addEventListener('touchmove',e=>{if(ok&&Math.abs(e.touches[0].clientX-sx)>12)e.stopPropagation()},{passive:true});
  c.addEventListener('touchend',e=>{if(!ok)return;const t0=e.changedTouches[0],dx=t0.clientX-sx,dy=t0.clientY-sy;if(Math.abs(dx)<60||Math.abs(dy)>50||Date.now()-st>700)return;e.stopPropagation();
    const rtl=document.documentElement.dir==='rtl',nx=(dx<0)!==rtl;const b=$(nx?'#calNext':'#calPrev');if(b){b.click();vib(8)}},{passive:true})})();

/* ---- each page keeps its scroll position; optionally open on the last page ---- */
const UX_POS={};
{const _sv=showView;showView=function(v,...a){const m=$('main'),was=curView();if(m&&was&&was!==v)UX_POS[was]=m.scrollTop;const r=_sv(v,...a);if(m&&was!==v){const p=UX_POS[v]||0;setTimeout(()=>{if(curView()===v&&m.scrollTop===0)m.scrollTop=p},30)}
  try{if(v!=='set')localStorage.setItem('thabat.lastView',v)}catch(e){}return r}}
setTimeout(()=>{try{const v=localStorage.getItem('thabat.lastView');if(S.settings.openLast&&v&&v!=='today'&&$('#v-'+v)&&curView()==='today')showView(v)}catch(e){}},700);

/* ---- tasks: understand «غدًا بعد العصر …», «يوم الخميس», «كل جمعة» ---- */
const UX_WD=[['الأحد|الاحد|احد','sun(day)?'],['الإثنين|الاثنين|اثنين|الإثنين','mon(day)?'],['الثلاثاء|الثلاثا|ثلاثاء','tue(s|sday)?'],['الأربعاء|الاربعاء|اربعاء','wed(nesday)?'],['الخميس|خميس','thu(rs|rsday)?'],['الجمعة|الجمعه|جمعة|جمعه','fri(day)?'],['السبت|سبت','sat(urday)?']];
const UX_PR=[['fajr','الفجر|الصبح','fajr|fajer|fadjr|subh'],['dhuhr','الظهر','dhuhr|zuhr|duhr|dhuhur|zohr'],['asr','العصر','asr'],['maghrib','المغرب','maghrib|maghreb'],['isha','العشاء|العشا','isha|ishaa']];
function uxParse(raw){let s=' '+raw+' ';const out={};const B='(?<=\\s)',E='(?=\\s)';const take=re=>{const m=s.match(re);if(!m)return null;s=s.replace(re,' ');return m};let m;
  if(m=take(new RegExp(B+'(كل يوم|يوميا|يومياً|every ?day|daily)'+E,'i')))out.rec={rule:'daily'};
  else if(m=take(new RegExp(B+'(كل شهر|شهريا|شهرياً|every month|monthly)'+E,'i')))out.rec={rule:'monthly'};
  else for(let i=0;i<7&&!out.rec;i++){const re=new RegExp(B+'(?:كل (?:يوم )?(?:'+UX_WD[i][0]+')|every (?:'+UX_WD[i][1]+'))'+E,'i');if(take(re))out.rec={rule:'wd',days:[i]}}
  if(!out.rec){if(take(new RegExp(B+'(بعد غد[اًا]?|بعد غدوة|بعد غدوه|day after tomorrow)'+E,'i')))out.d=2;
    else if(take(new RegExp(B+'(غد[اًا]?|غدوة|غدوه|بكرة|بكره|tomorrow|tmrw)'+E,'i')))out.d=1;
    else if(m=take(new RegExp(B+'(?:بعد|in) (\\d+) (?:أيام|ايام|يوم|days?)'+E,'i')))out.d=+m[1];
    else for(let i=0;i<7&&out.d==null;i++){const re=new RegExp(B+'(?:يوم (?:'+UX_WD[i][0]+')|(?:on|next) (?:'+UX_WD[i][1]+'))'+E,'i');if(take(re)){const td=keyToDate(todayKey()).getDay();out.d=((i-td+7)%7)||7}}}
  for(const [k,a,e] of UX_PR){if(take(new RegExp(B+'(?:بعد (?:صلاة )?(?:'+a+')|after (?:'+e+'))'+E,'i'))){out.after=k;break}}
  out.text=s.replace(/\s+/g,' ').trim();return out.text&&(out.rec||out.d||out.after)?out:null}
function uxParseLabel(p){const L_=[];if(p.rec)L_.push('🔁 '+(p.rec.rule==='daily'?t('rc.daily'):p.rec.rule==='monthly'?t('rc.monthlyN',keyToDate(todayKey()).getDate()):t('rc.weekly',L().days[p.rec.days[0]])));
  if(p.d)L_.push('📅 '+dayLabel(dKey(addDays(keyToDate(todayKey()),p.d))));if(p.after)L_.push('🕌 '+tpaLabel(p.after));return L_.join(' · ')}
function uxPreview(){const i=$('#taskIn');if(!i)return;let el=$('#uxParse');if(!el){el=document.createElement('div');el.id='uxParse';el.className='uxparse';i.closest('.addtask').after(el)}
  const p=$('#ltOpts').hidden?uxParse(i.value):null;el.hidden=!p;if(p)el.innerHTML=`<span>${t('ux.parse')}</span> <b>${esc(uxParseLabel(p))}</b> <span class="uxpt" dir="auto">«${esc(p.text)}»</span>`}
$('#taskIn').addEventListener('input',uxPreview);
{const _at=addTask;addTask=function(){const i=$('#taskIn'),p=$('#ltOpts').hidden?uxParse(i.value):null;if(!p)return _at();
  if(p.rec){const tk=todayKey(),rule={id:uid(),text:p.text,start:tk,rule:p.rec.rule};if(p.rec.rule==='monthly')rule.dom=keyToDate(tk).getDate();if(p.rec.days)rule.days=p.rec.days;RC().push(rule);ensureRecur();if(p.after){const x=day(tk).tasks.find(q=>q.recurId===rule.id);if(x)x.after=p.after}toast(t('rc.saved',rcDesc(rule)))}
  else{const k=p.d?dKey(addDays(keyToDate(todayKey()),p.d)):todayKey(),x={id:uid(),text:p.text,done:false,created:Date.now()};if(p.after)x.after=p.after;day(k).tasks.push(x);if(p.d)toast(t('ux.addedTo',dayLabel(k)))}
  i.value='';save();renderTasks();if(curView()==='cal')renderCal();uxPreview()};$('#taskAdd').onclick=addTask;$('#taskIn').onkeydown=e=>{if(e.key==='Enter')addTask()}}

/* ---- trash: deleted tasks and notes stay 30 days ---- */
function TRASH(){return S.trash||(S.trash=[])}
function trashPut(kind,item,k){TRASH().unshift({id:uid(),kind,item,k,at:Date.now()});if(TRASH().length>300)S.trash.length=300}
function trashDrop(x){if(x.kind!=='note')return;try{if(x.item.imgs)dropImgs(x.item.imgs)}catch(e){}(x.item.auds||[]).forEach(a=>{try{idbSet('naud:'+a.id,null)}catch(e){}})}
function trashPurge(){const lim=Date.now()-30*864e5,old=TRASH().filter(x=>x.at<lim);if(!old.length)return;old.forEach(trashDrop);S.trash=TRASH().filter(x=>x.at>=lim);save()}
function trashRestore(id){const x=TRASH().find(q=>q.id===id);if(!x)return;S.trash=TRASH().filter(q=>q!==x);
  if(x.kind==='task'){const d=day(x.k);if(!d.tasks.some(q=>q.id===x.item.id))d.tasks.push(x.item);renderTasks();if(curView()==='cal')renderCal()}
  else if(x.kind==='note'){if(!NOTES().some(q=>q.id===x.item.id))NOTES().push(x.item);notesChanged()}save();toast(t('tr.restored'))}
function openTrash(){const L_=TRASH();
  openInfo('🗑 '+t('tr.t'),`<p class="muted" style="margin:0 0 10px">${t('tr.sub')}</p>${L_.length?`<div class="uxtr">${L_.map(x=>`<div class="uxtrr" data-id="${x.id}"><span class="uxtri">${x.kind==='note'?'📝':'☑'}</span><span class="uxtrt" dir="auto">${esc((x.kind==='note'?(x.item.title||t('notes.untitled')):x.item.text)||'')}<small>${esc(x.kind==='task'?dayLabel(x.k):'')} · ${t('tr.deleted',gShort(new Date(x.at)))}</small></span><button class="btn sm" data-r>${t('tr.restore')}</button></div>`).join('')}</div><button class="btn sm ghost danger" id="trEmpty" style="margin-top:10px">${t('tr.empty')}</button>`:`<div class="empty">${t('tr.none')}</div>`}`);
  $$('.uxtrr [data-r]').forEach(b=>b.onclick=()=>{trashRestore(b.closest('.uxtrr').dataset.id);openTrash()});
  const e=$('#trEmpty');if(e)e.onclick=()=>{if(!confirm(t('tr.emptyQ')))return;TRASH().forEach(trashDrop);S.trash=[];save();openTrash()}}
setTimeout(trashPurge,4000);
/* notes: deleting moves the note to the trash (its images are kept until it is purged) */
{const _rne=renderNoteEd;renderNoteEd=function(...a){const r=_rne(...a);try{const del=$('#neDel');if(del)del.onclick=()=>{if(!confirm(t('notes.delQ')))return;const n0=NOTES().find(x=>x.id===NE.id);S.notes=NOTES().filter(x=>x.id!==NE.id);
  if(n0){trashPut('note',n0);const keep=new Set(n0.imgs||[]);dropImgs((NE._added||[]).filter(i=>!keep.has(i)))}else dropImgs(NE._added);NE=null;save();$('#noteModal').classList.remove('on');notesChanged();if(n0)toastAct(t('tr.noteDel'),t('undo'),()=>{const x=TRASH().find(q=>q.kind==='note'&&q.item.id===n0.id);if(x)trashRestore(x.id)})}}catch(e){console.error(e)}return r}}

/* ---- today's tasks: undo after delete, drag to reorder or onto a prayer, menu, multi-select, all to tomorrow ---- */
const UXT={sel:new Set(),selMode:false,drag:null,lp:null,lpFired:false};
function uxDelTask(k,id){const d=day(k),i=d.tasks.findIndex(q=>q.id===id);if(i<0)return;const x=d.tasks[i];d.tasks.splice(i,1);
  if(x.from){const o=S.days[x.from]&&S.days[x.from].tasks.find(q=>q.id===x.fromId);if(o&&o.pp)o.pp=o.pp.filter(q=>q.id!==x.id)}trashPut('task',x,k);UXT.sel.delete(id);return{x,i}}
function uxUndoDel(k,list){toastAct(list.length>1?t('ux.delN',list.length):t('ux.del1'),t('undo'),()=>{const d=day(k);list.slice().sort((a,b)=>a.i-b.i).forEach(({x,i})=>{if(!d.tasks.some(q=>q.id===x.id))d.tasks.splice(Math.min(i,d.tasks.length),0,x);S.trash=TRASH().filter(q=>!(q.kind==='task'&&q.item.id===x.id))});save();renderTasks()},7000)}
function uxTomorrow(ids){const tk=todayKey(),tm=dKey(addDays(keyToDate(tk),1)),d=day(tk);let n=0;ids.forEach(id=>{const o=d.tasks.find(q=>q.id===id);if(!o||o.done||(o.pp||[]).some(q=>q.k===tm))return;
  const c={id:uid(),text:o.text,done:false,created:Date.now(),from:tk,fromId:id};if(o.after)c.after=o.after;day(tm).tasks.push(c);(o.pp=o.pp||[]).push({k:tm,id:c.id});n++});if(n){save();renderTasks();toast(t('ux.toTm',n))}return n}
function uxTaskMenu(li){const m=li.querySelector('.tkm');vib(12);tkMenu(m||li,todayKey(),li.dataset.id)}
/* the existing «⋯» task menu also gets: edit, to tomorrow, prayer, project, select, delete */
function uxMenuExtras(k,id){const p=$('#ppPop'),d=day(k),x=d.tasks.find(q=>q.id===id);if(!p||!x)return;const li=$(`#tasks .task[data-id="${id}"]`);
  const row=c=>li&&li.querySelector(c),mob=MOB.matches&&li?[...(row('.tplay')&&!x.done?[['▶','ux.play']]:[]),...(row('.sadd')?[['＋','ux.sub']]:[]),...(row('.tmx')?[['▦','ux.mx']]:[]),...(row('.pp')?[['📅','tk.pp']]:[])]:[];
  const items=[['✏️','ux.edit'],...(x.done?[]:[['➡️','ux.tomorrow'],['🕌','tp2.tip']]),...mob,...(PJ().some(q=>!q.arch)?[['📁','ux.proj']]:[]),['☑','ux.select'],['🗑','ux.delete']];
  p.insertAdjacentHTML('beforeend',`<div class="uxmsep"></div>${items.map(([i,kk],j)=>`<button data-ux="${j}">${i} ${t(kk)}</button>`).join('')}`);
  const r=(li||p).getBoundingClientRect();
  p.querySelectorAll('[data-ux]').forEach(b=>b.onclick=()=>{const kk=items[+b.dataset.ux][1];closePP();
    if(kk==='ux.play'||kk==='ux.sub'||kk==='ux.mx'||kk==='tk.pp'){const el=row({'ux.play':'.tplay','ux.sub':'.sadd','ux.mx':'.tmx','tk.pp':'.pp'}[kk]);if(el)setTimeout(()=>el.click(),30)}
    else if(kk==='ux.edit'){const tx=li&&li.querySelector('.tx');if(tx){tx.focus();const rg=document.createRange();rg.selectNodeContents(tx);const s=getSelection();s.removeAllRanges();s.addRange(rg)}}
    else if(kk==='ux.tomorrow')uxTomorrow([x.id]);
    else if(kk==='tp2.tip')tpMenu(li||p,x.after,v=>{if(v)x.after=v;else delete x.after;delete x.afterShown;save();renderTasks()});
    else if(kk==='ux.proj'){const q=qPopAt(`<div class="aymh">📁 ${t('ux.proj')}</div>${PJ().filter(z=>!z.arch).map(z=>`<button data-p="${z.id}" class="${x.proj===z.id?'on':''}">${x.proj===z.id?'✓ ':''}${esc(z.name)}</button>`).join('')}${x.proj?`<button data-p="">✕ ${t('pj.none')}</button>`:''}`,r.left+r.width/2,r.bottom-10,'aymenu');q.querySelectorAll('[data-p]').forEach(b2=>b2.onclick=()=>{closePP();if(b2.dataset.p)x.proj=b2.dataset.p;else delete x.proj;save();renderTasks()})}
    else if(kk==='ux.select'){UXT.selMode=true;UXT.sel.add(x.id);uxTasksDecorate()}
    else if(kk==='ux.delete'){const rr=uxDelTask(k,x.id);save();renderTasks();if(rr)uxUndoDel(k,[rr])}});
  try{ppFit(p,...(p._xy||[r.left+r.width/2,r.bottom]))}catch(e){}}
{const _tm=tkMenu;tkMenu=function(btn,k,id){const r=_tm(btn,k,id);try{if(k===todayKey())uxMenuExtras(k,id)}catch(e){console.error(e)}return r}}
function uxSelBar(){const card=$('#tasks')&&$('#tasks').closest('.card');if(!card)return;let bar=$('#uxSel');const n=UXT.sel.size;if(!n){if(bar)bar.remove();UXT.selMode=false;card.classList.remove('uxselm');return}
  card.classList.add('uxselm');if(!bar){bar=document.createElement('div');bar.id='uxSel';bar.className='uxsel';$('#tasks').before(bar)}
  bar.innerHTML=`<b>${t('ux.selN',n)}</b><span style="flex:1"></span><button class="btn sm" data-a="done">✓ ${t('ux.done')}</button><button class="btn sm" data-a="tm">➡️ ${t('ux.tomorrow')}</button><button class="btn sm ghost danger" data-a="del">🗑</button><button class="btn sm ghost" data-a="x" aria-label="✕">✕</button>`;
  bar.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{const a=b.dataset.a,tk=todayKey(),d=day(tk),ids=[...UXT.sel];
    if(a==='done'){ids.forEach(id=>{const x=d.tasks.find(q=>q.id===id);if(x&&!x.done){x.done=true;x.doneAt=Date.now()}});chimeSoft()}
    else if(a==='tm')uxTomorrow(ids);
    else if(a==='del'){const L_=ids.map(id=>uxDelTask(tk,id)).filter(Boolean);if(L_.length)uxUndoDel(tk,L_)}
    UXT.sel.clear();UXT.selMode=false;save();renderTasks()})}
function uxTmBtn(){const ms=$('#missed');if(!ms)return;let b=$('#uxTmAll');const d=day(todayKey()),tm=dKey(addDays(keyToDate(todayKey()),1)),n=d.tasks.filter(x=>!x.done&&!(x.pp||[]).some(q=>q.k===tm)).length;
  if(!b){b=document.createElement('button');b.id='uxTmAll';b.className='btn sm ghost uxtmall';ms.before(b);b.onclick=()=>{const L_=day(todayKey()).tasks.filter(x=>!x.done).map(x=>x.id);uxTomorrow(L_)}}
  b.hidden=!n;b.textContent='➡️ '+t('ux.allTm');b.title=t('ux.allTmT',n)}
{const _rt=renderTasks;renderTasks=function(){_rt();try{uxTasksDecorate()}catch(e){console.error(e)}}}
function uxTasksDecorate(){const tk=todayKey(),d=day(tk),ids=new Set(d.tasks.map(x=>x.id));[...UXT.sel].forEach(id=>{if(!ids.has(id))UXT.sel.delete(id)});
  $$('#tasks .task').forEach(li=>{const id=li.dataset.id,x=d.tasks.find(q=>q.id===id);if(!x)return;
    const del=li.querySelector('.del');if(del)del.onclick=()=>{const r=uxDelTask(tk,id);save();renderTasks();if(r)uxUndoDel(tk,[r])};
    if(!x.done&&!li.querySelector('.tkh')){const h=document.createElement('span');h.className='tkh';h.textContent='⠿';h.title=t('ux.dragT');h.draggable=true;li.prepend(h)}
    li.classList.toggle('uxs',UXT.sel.has(id))});
  uxSelBar();uxTmBtn()}
(()=>{const el=$('#tasks');if(!el)return;const LI=e=>e.target.closest&&e.target.closest('#tasks .task');
  /* right click (PC) or long press (phone) opens the task menu */
  el.addEventListener('contextmenu',e=>{const li=LI(e);if(!li)return;if(e.target.closest('.tx')&&document.activeElement===e.target.closest('.tx'))return;e.preventDefault();UXT.lpFired=true;uxTaskMenu(li)});
  el.addEventListener('touchstart',e=>{const li=LI(e);clearTimeout(UXT.lp);UXT.lpFired=false;if(!li||e.touches.length!==1||e.target.closest('.ck,.del,.pp,.tkh,button'))return;const t0=e.touches[0],x0=t0.clientX,y0=t0.clientY;
    UXT.lp=setTimeout(()=>{if(UXT.lpFired)return;UXT.lpFired=true;uxTaskMenu(li)},560);UXT.lpXY=[x0,y0]},{passive:true});
  el.addEventListener('touchmove',e=>{if(!UXT.lpXY)return;const t0=e.touches[0];if(Math.abs(t0.clientX-UXT.lpXY[0])>8||Math.abs(t0.clientY-UXT.lpXY[1])>8)clearTimeout(UXT.lp)},{passive:true});
  el.addEventListener('touchend',e=>{clearTimeout(UXT.lp);if(UXT.lpFired&&e.cancelable)e.preventDefault()},{passive:false});
  /* shift+click (PC) or the select mode picks several tasks */
  el.addEventListener('mousedown',e=>{if(e.shiftKey&&LI(e))e.preventDefault()});
  el.addEventListener('click',e=>{const li=LI(e);if(!li||e.target.closest('.ck,.del,.pp,.tkh,.tpr,.tkm,.sadd,.tplay,.tmx'))return;if(e.shiftKey||UXT.selMode){e.preventDefault();e.stopPropagation();const id=li.dataset.id;if(UXT.sel.has(id))UXT.sel.delete(id);else UXT.sel.add(id);if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();uxTasksDecorate()}},true);
  /* PC: drag the ⠿ handle to reorder, or onto a prayer in «your day between the prayers» */
  el.addEventListener('dragstart',e=>{const h=e.target.closest&&e.target.closest('.tkh');if(!h)return;const li=h.closest('.task');UXT.drag=li.dataset.id;PDL.drag=li.dataset.id;e.dataTransfer.setData('text/plain','pdl:'+li.dataset.id);e.dataTransfer.effectAllowed='move';try{e.dataTransfer.setDragImage(li,20,20)}catch(x){}li.classList.add('drag')});
  el.addEventListener('dragend',()=>{UXT.drag=null;PDL.drag=null;$$('#tasks .task').forEach(l=>l.classList.remove('drag','dropb','dropa'))});
  el.addEventListener('dragover',e=>{if(!UXT.drag)return;const li=LI(e);if(!li||li.dataset.id===UXT.drag)return;e.preventDefault();const r=li.getBoundingClientRect(),after=e.clientY>r.top+r.height/2;$$('#tasks .task').forEach(l=>l.classList.remove('dropb','dropa'));li.classList.add(after?'dropa':'dropb')});
  el.addEventListener('drop',e=>{if(!UXT.drag)return;const li=LI(e);if(!li)return;e.preventDefault();uxMove(UXT.drag,li.dataset.id,li.classList.contains('dropa'))});
  /* phone: hold the ⠿ handle and move */
  let tdrag=null;
  el.addEventListener('touchstart',e=>{const h=e.target.closest&&e.target.closest('.tkh');if(!h||e.touches.length!==1)return;const li=h.closest('.task');tdrag={li,id:li.dataset.id,y0:e.touches[0].clientY};li.classList.add('tdrag');vib(10)},{passive:true});
  el.addEventListener('touchmove',e=>{if(!tdrag)return;if(e.cancelable)e.preventDefault();const y=e.touches[0].clientY;tdrag.li.style.transform=`translateY(${(y-tdrag.y0)/uiZoom()}px)`;
    const others=$$('#tasks .task').filter(l=>l!==tdrag.li&&!l.classList.contains('done'));others.forEach(l=>l.classList.remove('dropb','dropa'));const tg=others.find(l=>{const r=l.getBoundingClientRect();return y>=r.top&&y<=r.bottom});if(tg){const r=tg.getBoundingClientRect();tg.classList.add(y>r.top+r.height/2?'dropa':'dropb');tdrag.tg=tg}else tdrag.tg=null},{passive:false});
  el.addEventListener('touchend',()=>{if(!tdrag)return;const D=tdrag;tdrag=null;D.li.style.transform='';D.li.classList.remove('tdrag');if(D.tg)uxMove(D.id,D.tg.dataset.id,D.tg.classList.contains('dropa'));else $$('#tasks .task').forEach(l=>l.classList.remove('dropb','dropa'))},{passive:true})})();
function uxMove(id,toId,after){const d=day(todayKey()),a=d.tasks.findIndex(q=>q.id===id);if(a<0||id===toId)return;const [x]=d.tasks.splice(a,1);let b=d.tasks.findIndex(q=>q.id===toId);if(b<0){d.tasks.splice(a,0,x);return}d.tasks.splice(after?b+1:b,0,x);save();renderTasks()}

/* ---- «your day in a few lines» after Isha ---- */
function uxRecap(){const old=$('#uxRecap');const k=todayKey(),pt=prayerTimes(keyToDate(k)),now=Date.now();let off=false;try{off=localStorage.getItem('thabat.recapX')===k}catch(e){}
  if(now<pt.isha+20*6e4||off||S.settings.recapOff){if(old)old.remove();return}
  const d=day(k),st=PDL_P.map(p=>plStatus(k,p)),onT=st.filter(s=>s==='on'||s==='auto').length,late=st.filter(s=>s==='late').length;
  const ms=timeline(k).reduce((a,s)=>a+s.ms,0),tk=d.tasks.filter(x=>!x.lt),dn=tk.filter(x=>x.done).length,q=qDay(k),tm=dKey(addDays(keyToDate(k),1)),left=tk.filter(x=>!x.done&&!(x.pp||[]).some(z=>z.k===tm)).length;
  const html=`<div class="uxrc-h"><b>🌙 ${t('rc2.t')}</b><button class="uxrc-x" aria-label="✕">✕</button></div><div class="uxrc-g">
    <div><span>🕌</span><b>${onT}/5</b><small>${t('rc2.pr')}${late?' · '+t('rc2.late',late):''}</small></div>
    <div><span>⏱</span><b>${fmtHM(ms)}</b><small>${t('rc2.focus')}</small></div>
    <div><span>☑</span><b>${dn}/${tk.length}</b><small>${t('rc2.tasks')}</small></div>
    <div><span>📖</span><b>${q.read||0}</b><small>${t('rc2.pages')}${q.wird?' ✓':''}</small></div></div>
    ${onT===5&&dn===tk.length&&tk.length?`<div class="uxrc-m">${t('rc2.great')}</div>`:''}
    ${left?`<button class="btn sm pri uxrc-tm">➡️ ${t('rc2.move',left)}</button>`:''}`;
  let c=old;if(!c){c=document.createElement('div');c.id='uxRecap';c.className='card uxrecap';const top=$('#v-today .tdtop');if(top)top.after(c);else return}c.innerHTML=html;
  c.querySelector('.uxrc-x').onclick=()=>{try{localStorage.setItem('thabat.recapX',k)}catch(e){}c.remove()};
  const mv=c.querySelector('.uxrc-tm');if(mv)mv.onclick=()=>{uxTomorrow(day(k).tasks.filter(x=>!x.done).map(x=>x.id));uxRecap()}}
{const _rt=renderTasks;renderTasks=function(){_rt();try{uxRecap()}catch(e){console.error(e)}}}
setInterval(()=>{if(curView()==='today'&&!document.hidden)try{uxRecap()}catch(e){}},5*6e4);

/* ---- a «⋯» menu on every Today card: fold, move, hide ---- */
function uxCardMenu(c,btn){const L_=S.settings.home3||(S.settings.home3={}),k=cardKey(c),o=L_[k]||(L_[k]={}),r=btn.getBoundingClientRect();
  const p=qPopAt(`<button data-a="fold">${o.c?'▾ '+t('ux.unfold'):'▴ '+t('ux.fold')}</button><button data-a="up">↑ ${t('ux.up')}</button><button data-a="dn">↓ ${t('ux.down')}</button><button data-a="hide">🙈 ${t('hl3.hide')}</button><button data-a="all">🧩 ${t('hl3.t')}</button>`,r.left+r.width/2,r.bottom-10,'aymenu');
  p.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{const a=b.dataset.a;closePP();
    if(a==='fold'){o.c=!o.c;save();homeApply()}
    else if(a==='hide'){o.h=true;save();homeApply();toastAct(t('ux.hidden'),t('undo'),()=>{o.h=false;save();homeApply()})}
    else if(a==='all')openHomeLayout();
    else{const sib=[...c.parentElement.children].filter(x=>x.classList.contains('card')&&!x.classList.contains('hhide')).sort((a,b)=>(+a.style.order||0)-(+b.style.order||0)||[...a.parentElement.children].indexOf(a)-[...b.parentElement.children].indexOf(b));
      const i=sib.indexOf(c),j=a==='up'?i-1:i+1;if(j<0||j>=sib.length)return;[sib[i],sib[j]]=[sib[j],sib[i]];sib.forEach((x,n)=>{const kk=cardKey(x);(L_[kk]=L_[kk]||{}).o=n});save();homeApply();c.scrollIntoView({block:'nearest',behavior:'smooth'})}})}
function uxCardBtns(){homeCards().forEach(c=>{const h=c.querySelector(':scope>h3');if(!h)return;let b=h.querySelector(':scope>.uxcm');if(!b){b=document.createElement('button');b.className='uxcm';b.type='button';b.innerHTML=UX_DOTS;b.setAttribute('aria-label',t('ux.cardMenu'));h.append(b);
    b.onclick=e=>{e.stopPropagation();uxCardMenu(c,b)}}b.title=t('ux.cardMenu')})}
{const _ha=homeApply;homeApply=function(){_ha();try{const L_=S.settings.home3||{};homeCards().forEach(c=>{const o=L_[cardKey(c)]||{};c.classList.toggle('uxfold',!!o.c)});uxCardBtns()}catch(e){console.error(e)}}}
document.addEventListener('click',e=>{const h=e.target.closest&&e.target.closest('#v-today .card.uxfold>h3');if(!h||e.target.closest('button,a,input'))return;const c=h.parentElement,L_=S.settings.home3||{},o=L_[cardKey(c)];if(o){o.c=false;save();homeApply()}});
{const _rp=pdlRender;pdlRender=function(){_rp();try{uxCardBtns()}catch(e){}}}

/* ---- PC: Ctrl + / Ctrl − / Ctrl 0 change the interface size ---- */
document.addEventListener('keydown',e=>{if(!(e.ctrlKey||e.metaKey)||e.altKey||ANDROID)return;const k=e.key;let z=+(S.settings.zoom||1);
  if(k==='='||k==='+')z=Math.min(1.3,Math.round((z+.05)*100)/100);else if(k==='-'||k==='_')z=Math.max(.85,Math.round((z-.05)*100)/100);else if(k==='0')z=1;else return;
  e.preventDefault();S.settings.zoom=z;applyLook2();save();toast(t('ux.zoom',Math.round(z*100)));const zi=$('#zoomIn');if(zi){zi.value=z;const zv=$('#zoomV');if(zv)zv.textContent=Math.round(z*100)+'%'}},true);

/* ---- wide PC windows: tasks beside the timer ---- */
const UX_DOTS='<svg class="uxdots" viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>';
function uxWide(){const w=innerWidth/(uiZoom()||1),on=!MOB.matches&&w>=1450&&S.settings.wide3!==false;document.documentElement.classList.toggle('wide3',on);const tc=$('#tasks')&&$('#tasks').closest('.card');if(tc)tc.classList.add('uxtkcard');
  /* the other cards of that column go into their own column, so a long task list leaves no gaps beside it */
  const st=tc&&tc.parentElement;let col=$('#uxCol');
  if(on&&st&&st.classList.contains('stack')&&st.id!=='uxCol'){if(!col){[...st.children].forEach((c,i)=>c.dataset.uxi=i);col=document.createElement('div');col.className='stack uxcol';col.id='uxCol';st.prepend(col)}[...st.children].filter(c=>c!==col&&c!==tc&&c.classList.contains('card')).forEach(c=>col.append(c))}
  else if(!on&&col){const p=col.parentElement;[...col.children].forEach(c=>p.insertBefore(c,col));col.remove();[...p.children].sort((a,b)=>(+a.dataset.uxi||0)-(+b.dataset.uxi||0)).forEach(c=>p.append(c))}
  try{uxKeyTips()}catch(e){}}
addEventListener('resize',uxWide);{const _al=applyLook2;applyLook2=function(...a){const r=_al(...a);try{uxWide()}catch(e){}return r}}
try{uxWide()}catch(e){}
{const _rt=renderToday;renderToday=function(...a){const r=_rt(...a);try{uxWide()}catch(e){}return r}}
/* the notes «⋯» button: a drawn icon, centred in any font */
function uxDotsFix(){const b=$('#nxMore');if(b&&!b.querySelector('.uxdots'))b.innerHTML=UX_DOTS}
{const _rb=renderBoardsView;renderBoardsView=function(...a){const r=_rb(...a);try{uxDotsFix()}catch(e){}return r}}
setTimeout(()=>{try{uxDotsFix()}catch(e){}},900);

/* ---- PC: each button shows its keyboard shortcut ---- */
function uxKeyTips(){if(MOB.matches)return;const set=(el,l,k)=>{if(el)el.title=l+'  ('+k+')'};
  $$('#tBtns [data-a]').forEach(b=>{const a=b.dataset.a;if(a==='start'||a==='stop'||a==='resume')set(b,b.textContent.trim(),'T');if(a==='brk')set(b,b.textContent.trim(),'B')});
  set($('#taskIn'),t('tasks.ph'),'A');set($('#taskAdd'),t('add'),'A');set($('#inbBtn'),t('ib.t'),'I');
  $$('#tTools button').forEach(b=>{if(/deep|عميق/i.test(b.textContent))set(b,b.textContent.trim(),'D')});
  $$('#v-boards button').forEach(b=>{if(b.textContent.trim()===t('notes.new')||b.textContent.trim().endsWith(t('notes.new')))set(b,t('notes.new'),'N')})}
{const _rb=renderTimerBtns;renderTimerBtns=function(){_rb();try{uxKeyTips()}catch(e){}}}
{const _rtt=renderTTools;renderTTools=function(...a){const r=_rtt(...a);try{uxKeyTips()}catch(e){}return r}}
setTimeout(()=>{try{uxKeyTips()}catch(e){}},1200);

/* ---- offline: say that changes are kept and will sync later ---- */
function uxNet(){let b=$('#uxNet');if(navigator.onLine){if(b)b.remove();return}if(!b){b=document.createElement('div');b.id='uxNet';b.className='uxnet';document.body.append(b)}b.textContent='📡 '+t(SY.token?'ux.offS':'ux.off')}
addEventListener('offline',uxNet);addEventListener('online',()=>{const was=!!$('#uxNet');uxNet();if(was){toast(t('ux.on'));if(SY.token)setTimeout(()=>syncNow({force:true}),800)}});
setTimeout(uxNet,1500);

/* ---- commands and settings for the new pieces ---- */
{const _cc=cmdCommands;cmdCommands=function(){const L_=_cc();L_.push({icon:'🗑',label:t('tr.t'),run:()=>openTrash(),kw:'trash deleted محذوفات سلة'});L_.push({icon:'➡️',label:t('ux.allTm'),run:()=>{showView('today');uxTomorrow(day(todayKey()).tasks.filter(x=>!x.done).map(x=>x.id))},kw:'tomorrow move غد'});return L_}}
{const _rs=renderSettings;renderSettings=function(){_rs();try{toggle($('#openLastT'),!!S.settings.openLast,v=>{S.settings.openLast=v});toggle($('#wide3T'),S.settings.wide3!==false,v=>{S.settings.wide3=v;uxWide()});toggle($('#recapT'),!S.settings.recapOff,v=>{S.settings.recapOff=!v;uxRecap()});const b=$('#trashBtn');if(b)b.onclick=openTrash}catch(e){console.error(e)}}}
try{homeApply();renderTasks()}catch(e){console.error(e)}
