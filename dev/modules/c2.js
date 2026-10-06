/* ============ v3.2 usability: settings search & folding, shortcuts, calendar drag, undo, contrast, font size, a11y, swipe, quick add, page tips ============ */
/* no alerts before the first setup is finished */
{const _au2=alertUser;alertUser=function(a,b,c){if(!S.setupDone)return;return _au2(a,b,c)}}
/* 26/27. settings search + collapsible cards */
function setCards(){return $$('#v-set .card')}
function applySetFold(){const C=S.settings.setCol||{},q=($('#setQ')&&$('#setQ').value||'').trim();setCards().forEach((c,i)=>{const h=c.querySelector('h3');if(!h)return;c.classList.toggle('fold',!q&&!!C[h.dataset.i18n||i])})}
function setSearch(){const q=AR_NORM(($('#setQ').value||'').trim());setCards().forEach(c=>{let any=false;const h=c.querySelector('h3');const hit0=q&&h&&AR_NORM(h.textContent).includes(q);c.querySelectorAll('.field').forEach(f=>{const m=!q||hit0||AR_NORM(f.textContent).includes(q);f.classList.toggle('sqhide',!m);if(m)any=true});c.hidden=!!q&&!any&&!hit0});applySetFold()}
{const _rs13=renderSettings;renderSettings=function(){_rs13();try{const v=$('#v-set');if(!$('#setQ')){v.insertAdjacentHTML('afterbegin',`<div class="setq"><input class="in" id="setQ" dir="auto" placeholder="🔍 ${esc(t('sq.ph'))}"></div>`);$('#setQ').oninput=setSearch}
  setCards().forEach((c,i)=>{const h=c.querySelector('h3');if(!h||h._fold)return;h._fold=1;h.classList.add('foldh');h.onclick=e=>{if(e.target.closest('button,input,select'))return;const C=S.settings.setCol||(S.settings.setCol={}),k=h.dataset.i18n||i;C[k]=!C[k];save();applySetFold()}});setSearch()}catch(e){console.error(e)}}}
/* 28. keyboard shortcuts */
const KEYS=[['T','ks.timer',()=>{showView('today');timerAct(S.timer.mode==='work'?'stop':S.timer.mode==='brk'?'resume':'start')}],['B','ks.brk',()=>{if(S.timer.mode==='work')startBreak(5)}],['D','ks.deep',()=>{if(S.timer.deep)deepEnd();else deepStart(50)}],['N','ks.note',()=>thabatOpen('note')],['I','ks.inbox',()=>openInbox()],['A','ks.task',()=>{showView('today');setTimeout(()=>$('#taskIn').focus(),60)}],
  ['1','nav.today',()=>showView('today')],['2','nav.quran',()=>showView('quran')],['3','nav.cal',()=>showView('cal')],['4','nav.brief',()=>showView('brief')],['5','nav.notes',()=>showView('boards')],['/','cmd.ph',()=>cmdOpen()],['?','ks.t',()=>openKeys()]];
function openKeys(){openInfo('⌨ '+t('ks.t'),`<div class="kslist">${KEYS.map(([k,l])=>`<div><kbd>${k}</kbd><span>${t(l)}</span></div>`).join('')}<div><kbd>Ctrl+K</kbd><span>${t('cmd.ph')}</span></div><div><kbd>Ctrl+Z</kbd><span>${t('ks.undo')}</span></div><div><kbd>Esc</kbd><span>${t('d.close')}</span></div></div>`)}
document.addEventListener('keydown',e=>{if(e.ctrlKey||e.metaKey||e.altKey)return;const tg=e.target;if(tg&&(/INPUT|TEXTAREA|SELECT/.test(tg.tagName)||tg.isContentEditable))return;if($('.modal.on')||LOCKED||(curView()==='boards'&&nbMode==='boards')||curView()==='quran'&&/^[a-z]$/i.test(e.key)&&false)return;
  const K=KEYS.find(x=>x[0].toLowerCase()===e.key.toLowerCase());if(K){e.preventDefault();K[2]()}});
/* 29. drag tasks between calendar days */
{const _rd=renderDetail;renderDetail=function(k){_rd(k);try{const d=S.days[k];$$('#detail li.dtask').forEach(li=>{const b=li.querySelector('[data-pp]');if(!b||!d)return;li.draggable=true;li.title=t('dd.tip');li.ondragstart=e=>{e.dataTransfer.setData('text/plain',JSON.stringify({k,id:b.dataset.pp}));li.classList.add('drag')};li.ondragend=()=>li.classList.remove('drag')})}catch(e){}}}
function moveTask(from,id,to){if(from===to)return;const a=S.days[from],x=a&&a.tasks.find(q=>q.id===id);if(!x)return;a.tasks=a.tasks.filter(q=>q!==x);day(to).tasks.push(x);save();renderCal();renderDetail(selKey);if(from===todayKey()||to===todayKey())renderTasks();toastAct(t('dd.moved',dayLabel(to)),t('undo'),()=>{day(to).tasks=day(to).tasks.filter(q=>q!==x);day(from).tasks.push(x);save();renderCal();renderDetail(selKey);renderTasks()},8000)}
{const _rc=renderCal;renderCal=function(){_rc();$$('#cal .cell[data-k]').forEach(c=>{c.ondragover=e=>{e.preventDefault();c.classList.add('dropon')};c.ondragleave=()=>c.classList.remove('dropon');c.ondrop=e=>{e.preventDefault();c.classList.remove('dropon');try{const o=JSON.parse(e.dataTransfer.getData('text/plain'));moveTask(o.k,o.id,c.dataset.k)}catch(x){}}})}}
/* 30. global undo / redo */
const UNDO={st:[],rd:[],last:null,busy:false,t:null};
function undoSnap(){if(UNDO.busy)return;clearTimeout(UNDO.t);UNDO.t=setTimeout(()=>{const j=JSON.stringify(S);if(j===UNDO.last)return;if(UNDO.last)UNDO.st.push(UNDO.last);if(UNDO.st.length>15)UNDO.st.shift();UNDO.last=j;UNDO.rd=[]},900)}
{const _sv2=save;save=function(){_sv2();undoSnap()}}
setTimeout(()=>{UNDO.last=JSON.stringify(S)},3000);
function undoGo(redo){const from=redo?UNDO.rd:UNDO.st,to=redo?UNDO.st:UNDO.rd;if(!from.length){toast(t(redo?'un.noRedo':'un.none'));return}to.push(UNDO.last);const j=from.pop();UNDO.busy=true;S=JSON.parse(j);UNDO.last=j;save();renderAll();UNDO.busy=false;toast(t(redo?'un.redone':'un.done'))}
document.addEventListener('keydown',e=>{if(!(e.ctrlKey||e.metaKey)||e.key.toLowerCase()!=='z')return;const tg=e.target;if(tg&&(/INPUT|TEXTAREA/.test(tg.tagName)||tg.isContentEditable))return;if(curView()==='boards'&&nbMode==='boards')return;e.preventDefault();undoGo(e.shiftKey)});
/* 31/32/34. contrast, font size, colour-blind safe */
function applyLook2(){const h=document.documentElement,st=S.settings;h.classList.toggle('hc',!!st.hc);h.classList.toggle('cbsafe',!!st.cb);document.body.style.zoom=st.zoom&&st.zoom!==1?st.zoom:''}
applyLook2();
/* 33. accessible names for icon buttons */
function a11yPass(root){(root||document).querySelectorAll('button:not([aria-label]),[role=button]:not([aria-label])').forEach(b=>{const tx=(b.textContent||'').replace(/[^\p{L}\p{N}]/gu,'');if(tx.length>1)return;const l=b.title||b.dataset.tip||'';if(l)b.setAttribute('aria-label',l)})}
let A11Y_T=null;new MutationObserver(()=>{clearTimeout(A11Y_T);A11Y_T=setTimeout(()=>a11yPass(),600)}).observe(document.body,{childList:true,subtree:true});
/* 35. swipe between pages on the phone */
(()=>{const ORDER=['today','cal','brief','boards'];let sx=0,sy=0,st=0,ok=false;const m=$('main');if(!m)return;
  m.addEventListener('touchstart',e=>{const tg=e.target;ok=MOB.matches&&e.touches.length===1&&ORDER.includes(curView())&&!(curView()==='boards'&&nbMode==='boards')&&!tg.closest('input,textarea,select,.hrs,.bwrap,.mushaf,.sttabs,.chips,.ctxbar,.rclist,.dtl,.scrollx,[contenteditable],.modal')&&!S.settings.noSwipe;sx=e.touches[0].clientX;sy=e.touches[0].clientY;st=Date.now()},{passive:true});
  m.addEventListener('touchend',e=>{if(!ok)return;const t0=e.changedTouches[0],dx=t0.clientX-sx,dy=t0.clientY-sy;if(Math.abs(dx)<90||Math.abs(dy)>45||Date.now()-st>600)return;const rtl=document.documentElement.dir==='rtl',i=ORDER.indexOf(curView()),dir=(dx<0)!==rtl?1:-1,n=ORDER[i+dir];if(n){if(n==='boards')nbMode=nbMode==='boards'?'notes':nbMode;showView(n)}},{passive:true})})();
/* 36. quick add button on the phone */
function fabMenu(){const b=$('#fab').getBoundingClientRect();const p=qPopAt(`${[['☑','fab.task',()=>{showView('today');setTimeout(()=>{$('#taskIn').focus();$('#taskIn').scrollIntoView({block:'center'})},80)}],['📥','ib.t',openInbox],['📝','notes.new',()=>thabatOpen('note')],['⏱',S.timer.mode==='work'?'btn.endSession':'btn.start',()=>{showView('today');timerAct(S.timer.mode==='work'?'stop':'start')}],['📅','ev.new',()=>openEv(null,todayKey())],['📿','fab.tsb',()=>openTasbih()],['🌱','hb.t',()=>openHabits()]].map(([i,k],j)=>`<button data-j="${j}">${i} ${t(k)}</button>`).join('')}`,b.left+b.width/2,b.top-10,'aymenu fabmenu');
  const acts=[()=>{showView('today');setTimeout(()=>{$('#taskIn').focus();$('#taskIn').scrollIntoView({block:'center'})},80)},openInbox,()=>thabatOpen('note'),()=>{showView('today');timerAct(S.timer.mode==='work'?'stop':'start')},()=>openEv(null,todayKey()),()=>openTasbih(),()=>openHabits()];p.querySelectorAll('[data-j]').forEach(x=>x.onclick=()=>{closePP();acts[+x.dataset.j]()})}
$('#fab').onclick=fabMenu;
/* 40. one short guide the first time each page is opened */
const PG_TIPS={quran:['pg.q1','pg.q2','pg.q3'],cal:['pg.c1','pg.c2','pg.c3'],brief:['pg.b1','pg.b2','pg.b3'],boards:['pg.n1','pg.n2','pg.n3'],set:['pg.s1','pg.s2','pg.s3']};
{const _sv3=showView;showView=function(v){_sv3(v);try{const seen=S.pageTips||(S.pageTips={});if(!S.setupDone||seen[v]||!PG_TIPS[v]||S.settings.tipsOff)return;const sec=$('#v-'+v);if(!sec||sec.querySelector('.pgtip'))return;
  sec.insertAdjacentHTML('afterbegin',`<div class="pgtip"><b>💡 ${t('pg.t.'+v)}</b><ul>${PG_TIPS[v].map(k=>`<li>${t(k)}</li>`).join('')}</ul><button class="btn sm" data-pgx>${t('pg.ok')}</button></div>`);sec.querySelector('[data-pgx]').onclick=e=>{seen[v]=1;save();e.target.closest('.pgtip').remove()}}catch(e){}}}
function renderV39Set(){const st=S.settings;toggle($('#hcT'),!!st.hc,v=>{st.hc=v;setTimeout(applyLook2,0)});toggle($('#cbT'),!!st.cb,v=>{st.cb=v;setTimeout(applyLook2,0)});toggle($('#swT'),!st.noSwipe,v=>{st.noSwipe=!v});
  const z=$('#zoomIn');z.value=st.zoom||1;$('#zoomV').textContent=Math.round((st.zoom||1)*100)+'%';z.oninput=()=>{$('#zoomV').textContent=Math.round(z.value*100)+'%'};z.onchange=()=>{st.zoom=+z.value;save();applyLook2()};$('#ksBtn').onclick=openKeys}
{const _rs14=renderSettings;renderSettings=function(){_rs14();try{renderV39Set()}catch(e){console.error(e)}}}
