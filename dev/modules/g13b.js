
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
const NAV_ORD=['today','quran','cal','brief','boards','set'];
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
function navApply(){const pill=$('nav.side .navpill');if(!pill)return;const C=S.settings.navCfg||{},ord=C.order||NAV_ORD.slice(0,5);
  ord.forEach(v=>{const b=pill.querySelector(`.navbtn[data-v="${v}"]`);if(b)pill.append(b)});pill.querySelectorAll('.navbtn').forEach(b=>{b.hidden=b.dataset.v!=='today'&&(C.hide||[]).includes(b.dataset.v)});try{navKeyTips()}catch(e){}}
function openNavCfg(){const C=S.settings.navCfg||(S.settings.navCfg={}),ord=C.order||(C.order=NAV_ORD.slice(0,5));C.hide=C.hide||[];
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
{const _rs=renderSettings;renderSettings=function(){_rs();try{toggle($('#comfyT'),!!S.settings.comfy,v=>{S.settings.comfy=v;comfyApply()});const m={navCfgBtn:openNavCfg,unusedBtn:openUnused,undoHBtn:openUndoHist,gestBtn:()=>gestGuide(true),privBtn:()=>privToggle()};Object.entries(m).forEach(([id,f])=>{const b=$('#'+id);if(b)b.onclick=f})}catch(e){console.error(e)}}}
