/* ============ v3.28: tasks — priority, links to a lesson / book / note (and a note line → task), the archive of done tasks, task templates per prayer period, Hijri repeats, a countdown on timed tasks, and a light day suggested after a heavy day or a short night ============ */
/* ---------- priority (2): x.pri 1 high · (none) normal · 3 low; setting it keeps the list grouped high → normal → low ---------- */
function priSet(k,x,v){const d=day(k);if(v===2)delete x.pri;else x.pri=v;const rank=q=>q.pri||2;const und=d.tasks.filter(q=>!q.done),dn=d.tasks.filter(q=>q.done);und.sort((a,b)=>rank(a)-rank(b));d.tasks=[...und,...dn];save();renderTasks()}
/* ---------- links (5, 6) ---------- */
function linkPickLib(anchor,k,x){const L_=[];try{libCourses().forEach(c=>libMedia(c).forEach(m=>L_.push({t:'l',id:m.id,n:lrnName(m.id)||libTitle(m.n),s:c.n})))}catch(e){}try{bkAll().forEach(b=>L_.push({t:'b',id:b.key,n:b.n,s:b.local?t('bk.onDevice'):(b.ch||'')}))}catch(e){}
  if(!L_.length){toast(t('lnk.noLib'));return}const r=anchor.getBoundingClientRect();
  const p=qPopAt(`<div class="aymh">🎬 ${t('lnk.lib')}</div><input class="in" id="lnkQ" type="search" dir="auto" placeholder="🔍 ${esc(t('lsh.search'))}"><div class="lnkl" id="lnkL"></div>`,r.left+r.width/2,r.bottom-6,'aymenu pdltm lnkpop');
  const draw=()=>{const q=lshNorm(p.querySelector('#lnkQ').value.trim());const hits=L_.filter(o=>!q||lshNorm(o.n+' '+o.s).includes(q)).slice(0,40);
    p.querySelector('#lnkL').innerHTML=hits.map((o,i)=>`<button data-i="${L_.indexOf(o)}"><b dir="auto">${o.t==='b'?'📖':'🎬'} ${esc(o.n)}</b><small dir="auto">${esc(o.s)}</small></button>`).join('')||`<p class="muted">${t('lsh.noHits')}</p>`;
    p.querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>{const o=L_[+b.dataset.i];closePP();delete x.lib;delete x.bk;if(o.t==='b')x.bk=o.id;else x.lib=o.id;save();renderTasks();toast(t('lnk.done'))})};
  p.querySelector('#lnkQ').oninput=draw;draw();setTimeout(()=>p.querySelector('#lnkQ').focus(),50)}
function linkPickNote(anchor,k,x){const N=NOTES().slice().sort((a,b)=>(b.updated||b.created||0)-(a.updated||a.created||0));if(!N.length){toast(t('lnk.noNotes'));return}const r=anchor.getBoundingClientRect();
  const p=qPopAt(`<div class="aymh">📝 ${t('lnk.note')}</div><input class="in" id="lnkQ" type="search" dir="auto" placeholder="🔍 ${esc(t('lsh.search'))}"><div class="lnkl" id="lnkL"></div>`,r.left+r.width/2,r.bottom-6,'aymenu pdltm lnkpop');
  const draw=()=>{const q=lshNorm(p.querySelector('#lnkQ').value.trim());const hits=N.filter(n=>!q||lshNorm((n.title||'')+' '+(n.body||'')).includes(q)).slice(0,40);
    p.querySelector('#lnkL').innerHTML=hits.map(n=>`<button data-n="${esc(n.id)}"><b dir="auto">${esc(n.title||t('notes.untitled'))}</b><small dir="auto">${esc(String(n.body||'').replace(/\s+/g,' ').slice(0,70))}</small></button>`).join('')||`<p class="muted">${t('lsh.noHits')}</p>`;
    p.querySelectorAll('[data-n]').forEach(b=>b.onclick=()=>{closePP();x.note=b.dataset.n;save();renderTasks();toast(t('lnk.done'))})};
  p.querySelector('#lnkQ').oninput=draw;draw();setTimeout(()=>p.querySelector('#lnkQ').focus(),50)}
{const _ux=uxMenuExtras;uxMenuExtras=function(k,id,...a){const r=_ux(k,id,...a);try{const p=$('#ppPop'),x=day(k).tasks.find(q=>q.id===id);if(!p||!x)return r;const an=()=>document.querySelector(`#tasks .task[data-id="${id}"]`)||p;
  const row=document.createElement('div');row.className='prirow';row.innerHTML=`<span>${t('pri.t')}</span>${[[1,'pri.h'],[2,'pri.n'],[3,'pri.l']].map(([v,l])=>`<button data-pri="${v}" class="${(x.pri||2)===v?'on':''}">${t(l)}</button>`).join('')}`;
  row.querySelectorAll('[data-pri]').forEach(b=>b.onclick=e=>{e.stopPropagation();closePP();priSet(k,x,+b.dataset.pri)});p.append(row);
  const bl=document.createElement('button');bl.innerHTML=`🎬 ${x.lib||x.bk?t('lnk.libChange'):t('lnk.lib')}`;bl.onclick=e=>{e.stopPropagation();const el=an();closePP();linkPickLib(el,k,x)};p.append(bl);
  const bn=document.createElement('button');bn.innerHTML=`🔗 ${x.note?t('lnk.noteChange'):t('lnk.note')}`;bn.onclick=e=>{e.stopPropagation();const el=an();closePP();linkPickNote(el,k,x)};p.append(bn);
  if(x.lib||x.bk||x.note){const bu=document.createElement('button');bu.innerHTML=`✕ ${t('lnk.off')}`;bu.onclick=e=>{e.stopPropagation();closePP();delete x.lib;delete x.bk;delete x.note;save();renderTasks()};p.append(bu)}}catch(e){console.error(e)}return r}}
{const _tm=taskMeta;taskMeta=function(x,...a){let h=_tm(x,...a);try{if(!x)return h;if(x.pri===1)h=`<span class="tpri hi" title="${esc(t('pri.h'))}">⚑ ${t('pri.h')}</span>`+h;else if(x.pri===3)h+=`<span class="tpri lo" title="${esc(t('pri.l'))}">${t('pri.l')}</span>`;
  if(!x.done&&x.bk)h+=`<button class="tklib" data-bkp="${esc(x.id)}">📖 ${t('lnk.book')}</button>`;
  if(x.note&&NOTES().some(n=>n.id===x.note))h+=`<button class="tklib" data-ntp="${esc(x.id)}">📝 ${t('lnk.noteBtn')}</button>`;
  if(!x.done&&x.at&&!x.rec){h+=`<span class="tcd" data-tid="${esc(x.id)}"></span>`}}catch(e){}return h}}
{const _rt=renderTasks;renderTasks=function(...a){const r=_rt(...a);try{const d=day(todayKey());
  $$('#tasks [data-bkp]').forEach(b=>b.onclick=e=>{e.stopPropagation();const x=d.tasks.find(q=>q.id===b.dataset.bkp),bk=x&&bkAll().find(z=>z.key===x.bk);if(bk)bkOpen(bk);else toast(t('lb.off'))});
  $$('#tasks [data-ntp]').forEach(b=>b.onclick=e=>{e.stopPropagation();const x=d.tasks.find(q=>q.id===b.dataset.ntp);if(x&&x.note)openNote(x.note)});tcdTick()}catch(e){}return r}}
/* a lesson's «⋯»: a task for this lesson today */
{const _im=lshItemMenu;lshItemMenu=function(anchor,ref,...a){const r=_im(anchor,ref,...a);try{const p=$('#ppPop');if(p&&ref&&ref.t==='m'){const b=document.createElement('button');b.innerHTML=`☑ ${t('lnk.taskFor')}`;b.onclick=()=>{closePP();const n=libFind(ref.id);day(todayKey()).tasks.push({id:uid(),text:'🎬 '+(lrnName(ref.id)||(n?libTitle(n.n):'')),done:false,created:Date.now(),lib:ref.id});save();renderTasks();toast(t('lnk.taskAdded'))};p.prepend(b)}}catch(e){}return r}}
/* a note line → a task (the line where the cursor is, or the selected text) */
{const _rn=renderNoteEd;renderNoteEd=function(...a){const r=_rn(...a);try{const tp=$('#neTplSave');if(tp&&!$('#neToTask')){tp.insertAdjacentHTML('beforebegin',`<button class="btn sm ghost" id="neToTask" title="${esc(t('lnk.lineTask'))}">☑</button>`);
  $('#neToTask').onclick=()=>{const ta=$('#neBody');if(!ta)return;const v=ta.value,s=ta.selectionStart,e=ta.selectionEnd;let line=s!==e?v.slice(s,e):v.slice(v.lastIndexOf('\n',s-1)+1,(v.indexOf('\n',s)+1||v.length+1)-1);
    line=line.replace(/^\s*(?:[-*+]|\d+[.)])\s+(?:\[[ xX]\]\s*)?/,'').trim();if(!line){toast(t('lnk.noLine'));return}day(todayKey()).tasks.push({id:uid(),text:line.slice(0,200),done:false,created:Date.now(),note:NE.id});save();try{renderTasks()}catch(_){}toast(t('lnk.lineDone'))}}}catch(e){console.error(e)}return r}}
/* ---------- countdown on timed tasks (14) ---------- */
function tcdTick(){const now=Date.now(),d=day(todayKey());$$('#tasks .tcd').forEach(el=>{const x=d.tasks.find(q=>q.id===el.dataset.tid);if(!x||!x.at){el.textContent='';return}const a=atTime(keyToDate(todayKey()),x.at),dur=(+x.est||30)*6e4;
  if(now<a&&a-now<=6*36e5){el.textContent=t('tcd.in',fmtHM(Math.max(6e4,a-now)));el.className='tcd soon'}else if(now>=a&&now<a+dur){el.textContent=t('tcd.now');el.className='tcd now'}else el.textContent=''})}
setInterval(tcdTick,30000);
/* ---------- the archive of done tasks (8) ---------- */
function openArchive(){const all=[];for(const k in S.days)((S.days[k]||{}).tasks||[]).forEach(x=>{if(x.done)all.push({k,x})});all.sort((a,b)=>(b.x.doneAt||keyToDate(b.k).getTime())-(a.x.doneAt||keyToDate(a.k).getTime()));
  openInfo('📦 '+t('arc.t'),`<div class="arcbar"><input class="in" id="arcQ" type="search" dir="auto" placeholder="🔍 ${esc(t('arc.ph'))}"><select class="in" id="arcP"><option value="7">${t('arc.week')}</option><option value="31" selected>${t('arc.month')}</option><option value="366">${t('arc.year')}</option><option value="0">${t('arc.all')}</option></select></div><p class="muted" id="arcN"></p><div class="arcl" id="arcL"></div>`);
  const draw=()=>{const q=lshNorm($('#arcQ').value.trim()),days=+$('#arcP').value,from=days?dKey(addDays(keyToDate(todayKey()),-days+1)):'';const L_=all.filter(o=>(!from||o.k>=from)&&(!q||lshNorm(o.x.text).includes(q)));
    $('#arcN').textContent=t('arc.n',L_.length);let last='';
    $('#arcL').innerHTML=L_.slice(0,400).map(o=>{const h=o.k!==last?(last=o.k,`<div class="arch">${esc(dayLabel(o.k))} · ${hijri(keyToDate(o.k)).day} ${esc(hijri(keyToDate(o.k)).month)}</div>`):'';return h+`<button class="arci" data-k="${o.k}"><span dir="auto">✓ ${esc(o.x.text)}</span>${o.x.doneAt?`<small>${fmtT(o.x.doneAt)}</small>`:''}</button>`}).join('')||`<p class="muted">${t('lsh.noHits')}</p>`;
    $$('#arcL [data-k]').forEach(b=>b.onclick=()=>{$('#infoModal').classList.remove('on');selKey=b.dataset.k;showView('cal')})};
  $('#arcQ').oninput=draw;$('#arcP').onchange=draw;draw();$('#infoBox').classList.add('arcbox')}
{const _rc=renderCtxBar;renderCtxBar=function(...a){const r=_rc(...a);try{const bar=$('#ctxBar');if(bar&&!bar.querySelector('#arcBtn')){bar.insertAdjacentHTML('beforeend',`<button class="chip" id="arcBtn" title="${esc(t('arc.t'))}">📦 ${t('arc.short')}</button>`);$('#arcBtn').onclick=openArchive}}catch(e){}return r}}
/* ---------- task templates per prayer period (11): added each day with a fixed id ---------- */
function PTPL(){return S.settings.ptpl||(S.settings.ptpl={})}
function ensurePtpl(){try{const k=todayKey(),d=day(k),T=PTPL();let ch=false;PDL_P.forEach(p=>(T[p]||[]).forEach(txt=>{const id='ptpl-'+p+'-'+bkHash(txt)+'-'+k;if(!d.tasks.some(x=>x.id===id)){d.tasks.push({id,text:txt,done:false,created:Date.now(),after:p,auto:'ptpl'});ch=true}}));if(ch)save()}catch(e){}}
function ptplPop(anchor){const T=PTPL(),r=anchor.getBoundingClientRect();
  const p=qPopAt(`<div class="aymh">📋 ${t('ptpl.t')}</div><p class="muted lodp">${t('ptpl.sub')}</p>${PDL_P.map(q=>`<label class="ptplr"><b>${esc(tpaLabel(q))}</b><textarea class="in" rows="2" dir="auto" data-p="${q}" placeholder="${esc(t('ptpl.ph'))}">${esc((T[q]||[]).join('\n'))}</textarea></label>`).join('')}<div class="pdlt-act"><button class="btn sm pri" id="ptplOk">${t('pdl.save')}</button></div>`,r.left+r.width/2,r.bottom-6,'aymenu pdltm ptplpop');
  p.querySelector('#ptplOk').onclick=()=>{const N={};p.querySelectorAll('textarea[data-p]').forEach(ta=>{const L_=ta.value.split('\n').map(s=>s.trim()).filter(Boolean).slice(0,12);if(L_.length)N[ta.dataset.p]=L_});S.settings.ptpl=N;closePP();ensurePtpl();save();renderTasks();toast(t('ptpl.saved'))}}
{const _pr=pdlRender;pdlRender=function(...a){const r=_pr(...a);try{const h=$('#pdlCard h3');if(h&&!h.querySelector('#ptplBtn')){const before=h.querySelector('#arrBtn')||h.querySelector('.pdl-hint')||h.lastElementChild;before.insertAdjacentHTML('beforebegin',`<button class="btn sm ghost" id="ptplBtn" title="${esc(t('ptpl.t'))}" aria-label="${esc(t('ptpl.t'))}">📋</button>`);$('#ptplBtn').onclick=e=>{e.stopPropagation();ptplPop(e.currentTarget)}}}catch(e){}return r}}
{const _rtd=renderToday;renderToday=function(...a){try{ensurePtpl()}catch(e){}return _rtd(...a)}}
/* ---------- Hijri repeats (12): «every 13th of the Hijri month», «every year on 1 Ramadan» ---------- */
const HNUMF={};function hNum(date){if(!HNUMF.f)HNUMF.f=new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn',{day:'numeric',month:'numeric',year:'numeric'});const d=new Date(date);d.setDate(d.getDate()+(S.settings.hijriAdj||0));d.setHours(12);const p=HNUMF.f.formatToParts(d),g=x=>+((p.find(q=>q.type===x)||{}).value||'0').replace(/\D/g,'');return{d:g('day'),m:g('month'),y:g('year')}}
{const _m=rcMatch;rcMatch=function(r,k){if(r.rule==='hm'||r.rule==='hy'){if(r.start&&k<r.start)return false;const h=hNum(keyToDate(k));return r.rule==='hm'?h.d===r.hd:(h.m===r.hm&&h.d===r.hd)}return _m(r,k)}}
{const _d=rcDesc;rcDesc=function(r){if(r.rule==='hm')return t('rch.m',r.hd);if(r.rule==='hy')return t('rch.y',r.hd,r.hmn||'');return _d(r)}}
{const _rco=$('#rcBtn').onclick;$('#rcBtn').onclick=e=>{_rco(e);try{const p=$('#ppPop'),txt=$('#taskIn').value.trim();if(!p||!txt)return;const anchor=p.querySelector('[data-ry]')||p.querySelector('[data-r=monthly]');if(!anchor)return;const h=hNum(keyToDate(todayKey())),hm=hijri(keyToDate(todayKey())).month;
  anchor.insertAdjacentHTML('afterend',`<button data-rh="hm">🌙 ${t('rch.m',h.d)}</button><button data-rh="hy">🌙 ${t('rch.y',h.d,hm)}</button>`);
  p.querySelectorAll('[data-rh]').forEach(b=>b.onclick=()=>{const rule={id:uid(),text:txt,start:todayKey(),rule:b.dataset.rh,hd:h.d,...(b.dataset.rh==='hy'?{hm:h.m,hmn:hm}:{})};RC().push(rule);$('#taskIn').value='';closePP();ensureRecur();save();renderTasks();toast(t('rc.saved',rcDesc(rule)))})}catch(err){console.error(err)}}}
/* ---------- a light day after a heavy day or a short night (22) ---------- */
function lightSuggest(){try{const k=todayKey(),d=day(k);if(d.light||d.lightAsked)return;const y=S.days[dKey(addDays(keyToDate(k),-1))];
  const sleep=+((d.sleep3&&d.sleep3.h)||(d.hb&&d.hb.sleep)||0),ms=y&&y.sessions?y.sessions.reduce((s,q)=>s+((q.end||0)-(q.start||0)),0):0,goal=y?goalMs(dKey(addDays(keyToDate(k),-1))):0;
  let why='';if(sleep&&sleep<5.5)why=t('ls2.sleep',sleep);else if(goal&&ms>goal*1.5&&ms>6*36e5)why=t('ls2.heavy',fmtHM(ms));if(!why)return;
  d.lightAsked=1;save();setTimeout(()=>toastAct(why+' '+t('ls2.q'),'🍃 '+t('ls2.btn'),()=>{try{lightToggle()}catch(e){}},14000),1500)}catch(e){}}
setTimeout(lightSuggest,4000);
{const _rtd2=renderToday;let lsDay='';renderToday=function(...a){const r=_rtd2(...a);if(lsDay!==todayKey()){lsDay=todayKey();setTimeout(lightSuggest,2500)}return r}}

