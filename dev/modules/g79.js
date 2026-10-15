/* ============ v3.67.0 interaction (fourth list, group D: 59 63 64 65 69 70 71 72 75) ============ */
/* 64. deletions that can be undone no longer ask «are you sure?»: they happen, and a toast offers «undo» (a snapshot of the data; pictures of a deleted note wait until the toast is gone) */
const UDO_KEYS=['notes.delQ','ev.delQ','hb.delQ','cat.delQ','board.delQ','lt.delQ','cr.delQ','gk.delQ','au.delGQ','nfd.delQ','lsh.delQ','ics.rmQ','lfg.rmQ','draw.clearQ'];
const UDO={snap:null,imgs:[],tm:null};
function udoRe(k){const M=String.fromCharCode(1),src=String(t(k,M,M,M,M));let s='';for(const ch of src)s+=ch===M?'[^]*?':('.*+?^${}()|[]\\/'.includes(ch)?'\\'+ch:ch);return new RegExp('^'+s+'$')}
{const _cf=window.confirm.bind(window);window.confirm=function(msg){try{if(!S.settings.askDel){const m=String(msg||'');if(UDO_KEYS.some(k=>udoRe(k).test(m))){udoTake();setTimeout(udoToast,30);return true}}}catch(e){}return _cf(msg)}}
function udoTake(){udoFlush();try{UDO.snap=structuredClone(S)}catch(e){UDO.snap=JSON.parse(JSON.stringify(S))}UDO.view=curView()}
function udoFlush(){clearTimeout(UDO.tm);const ids=UDO.imgs;UDO.imgs=[];UDO.snap=null;if(ids.length)try{UDO_DROP(ids)}catch(e){}}
let UDO_DROP=null;{UDO_DROP=dropImgs;dropImgs=function(ids){if(UDO.snap&&ids&&ids.length){UDO.imgs.push(...ids);return}return UDO_DROP(ids)}}
function udoToast(){if(!UDO.snap)return;clearTimeout(UDO.tm);toastAct(t('udo.del'),t('undo'),()=>{const s=UDO.snap;UDO.snap=null;UDO.imgs=[];clearTimeout(UDO.tm);if(!s)return;Object.keys(S).forEach(k=>{if(!(k in s))delete S[k]});Object.assign(S,s);save();try{renderAll()}catch(e){}try{showView(curView())}catch(e){}toast(t('udo.back'))},8000);UDO.tm=setTimeout(udoFlush,8200)}

/* 65. toasts: at most three at once; the same text again replaces the old one */
{const box=$('#toasts');if(box)new MutationObserver(()=>{const L_=[...box.children];const seen=new Map();L_.forEach(el=>{const k=el.textContent;if(seen.has(k)&&!el.classList.contains('act')){seen.get(k).remove()}seen.set(k,el)});const live=[...box.children];if(live.length>3)live.slice(0,live.length-3).forEach(e=>{if(!e.classList.contains('act')||live.filter(x=>x.classList.contains('act')).length>1)e.remove()})}).observe(box,{childList:true})}

/* 63. phones: tall sheets open at about half the screen; drag the handle up (or tap it) for the full height */
function uxHalfCheck(m){if(!MOB.matches)return;const b=m.querySelector(':scope>.box');if(!b||!m.classList.contains('uxsheet'))return;b.classList.remove('uxfull');b.classList.toggle('uxhalf',b.scrollHeight>innerHeight*.7)}
new MutationObserver(ms=>ms.forEach(r=>{const m=r.target;if(r.attributeName==='class'&&m.classList&&m.classList.contains('modal')&&m.classList.contains('on')&&!r.oldValue?.includes(' on')&&!/\bon\b/.test(r.oldValue||''))setTimeout(()=>uxHalfCheck(m),30)})).observe(document.body,{attributes:true,attributeOldValue:true,subtree:true,attributeFilter:['class']});
{let g=null;document.addEventListener('touchstart',e=>{const h=e.target.closest&&e.target.closest('.uxgrab');if(!h)return;const b=h.closest('.box');if(!b||!b.classList.contains('uxhalf'))return;g={b,y:e.touches[0].clientY}},{passive:true,capture:true});
  document.addEventListener('touchend',e=>{if(!g)return;const dy=(e.changedTouches[0]||{}).clientY-g.y;if(dy<-30||Math.abs(dy)<6){g.b.classList.remove('uxhalf');g.b.classList.add('uxfull')}g=null},{passive:true,capture:true})}

/* 69. select several notes or several events */
const NSEL={on:false,ids:new Set()};
function nselBar(){let b=$('#nselBar');if(!NSEL.on){if(b)b.remove();$$('.ncard.nsel').forEach(c=>c.classList.remove('nsel'));document.documentElement.classList.remove('nsel-on');return}
  document.documentElement.classList.add('nsel-on');if(!b){b=document.createElement('div');b.id='nselBar';b.className='selbar';document.body.append(b)}
  b.innerHTML=`<b>${t('sel.n',NSEL.ids.size)}</b><button class="btn sm" data-a="mv">📁 ${t('sel.move')}</button><button class="btn sm" data-a="arc">🗄 ${t('sel.arc')}</button><button class="btn sm ghost" data-a="del">🗑 ${t('sel.del')}</button><button class="btn sm ghost" data-a="x">✕</button>`;
  b.querySelectorAll('[data-a]').forEach(x=>x.onclick=()=>{const a=x.dataset.a,ids=[...NSEL.ids];if(a==='x'){NSEL.on=false;NSEL.ids.clear();nselBar();return}if(!ids.length){toast(t('sel.none'));return}
    if(a==='mv'){nfPick(t('nfd.mvNote'),to=>{nfMoveNotes(ids,to);NSEL.on=false;NSEL.ids.clear();nselBar()},{})}
    else{udoTake();if(a==='arc')NOTES().forEach(n=>{if(NSEL.ids.has(n.id))n.arc=Date.now()});else{NOTES().filter(n=>NSEL.ids.has(n.id)).forEach(n=>trashPut('note',n));S.notes=NOTES().filter(n=>!NSEL.ids.has(n.id))}save();NSEL.on=false;NSEL.ids.clear();nselBar();try{notesChanged()}catch(e){renderNotes()}udoToast()}});
  $$('.ncard[data-note]').forEach(c=>c.classList.toggle('nsel',NSEL.ids.has(c.dataset.note)))}
document.addEventListener('click',e=>{if(!NSEL.on)return;const c=e.target.closest&&e.target.closest('.ncard[data-note]');if(!c)return;e.preventDefault();e.stopPropagation();const id=c.dataset.note;NSEL.ids.has(id)?NSEL.ids.delete(id):NSEL.ids.add(id);nselBar()},true);
{hookFn('renderNotes',()=>renderNotes,f=>{renderNotes=f},'post',function(){try{const bar=$('#nfBar');if(bar&&!bar.querySelector('#nselBtn')){bar.insertAdjacentHTML('beforeend',`<button class="btn sm ghost" id="nselBtn" type="button">☑ ${t('sel.t')}</button>`);$('#nselBtn').onclick=()=>{NSEL.on=!NSEL.on;NSEL.ids.clear();nselBar()}}if(NSEL.on)nselBar()}catch(e){}})}
const ESEL={on:false,ids:new Set(),k:null};
function eselPaint(){const det=$('#detail');if(!det)return;const sec=det.querySelector('.evsec');if(!sec)return;const row=sec.querySelector('.evaddrow');if(row&&!row.querySelector('#eselBtn')&&sec.querySelector('.evli[data-ev]:not([data-ev^="ics:"])')){row.insertAdjacentHTML('beforeend',`<button class="btn sm ghost" id="eselBtn" type="button">☑ ${t('sel.t')}</button>`);row.querySelector('#eselBtn').onclick=()=>{ESEL.on=!ESEL.on;ESEL.ids.clear();eselPaint()}}
  sec.classList.toggle('esel-on',ESEL.on);sec.querySelectorAll('.evli[data-ev]').forEach(li=>li.classList.toggle('esel',ESEL.ids.has(li.dataset.ev)));let b=sec.querySelector('.eselbar');
  if(!ESEL.on){if(b)b.remove();return}if(!b){b=document.createElement('div');b.className='eselbar';sec.append(b)}
  b.innerHTML=`<b>${t('sel.n',ESEL.ids.size)}</b><input type="date" class="in" id="eselD" value="${esc(ESEL.k||todayKey())}"><button class="btn sm" data-a="mv">${t('sel.toDay')}</button><button class="btn sm ghost" data-a="del">🗑 ${t('sel.del')}</button><button class="btn sm ghost" data-a="x">✕</button>`;
  b.querySelectorAll('[data-a]').forEach(x=>x.onclick=()=>{const a=x.dataset.a;if(a==='x'){ESEL.on=false;ESEL.ids.clear();eselPaint();return}if(!ESEL.ids.size){toast(t('sel.none'));return}udoTake();
    if(a==='del')S.events=EVS().filter(e=>!ESEL.ids.has(e.id));else{const d=$('#eselD').value;if(!d)return;let skip=0;EVS().forEach(e=>{if(!ESEL.ids.has(e.id))return;if(e.rep&&e.rep!=='none'){skip++;return}e.date=d});if(skip)toast(t('sel.rep',skip))}
    save();ESEL.on=false;ESEL.ids.clear();try{evRefresh()}catch(e){try{renderCal()}catch(x){}}udoToast()})}
document.addEventListener('click',e=>{if(!ESEL.on)return;const li=e.target.closest&&e.target.closest('#detail .evli[data-ev]');if(!li)return;e.preventDefault();e.stopPropagation();const id=li.dataset.ev;if(/^ics:/.test(id))return;ESEL.ids.has(id)?ESEL.ids.delete(id):ESEL.ids.add(id);eselPaint()},true);
{hookFn('renderDetail',()=>renderDetail,f=>{renderDetail=f},'post',function(k){try{if(ESEL.k!==k){ESEL.on=false;ESEL.ids.clear()}ESEL.k=k;eselPaint()}catch(e){}})}

/* 70. the add forms keep what you typed when closed by mistake (new event, goals) */
const DRF={ev:{m:'#evModal',ok:()=>typeof EVE!=='undefined'&&EVE&&EVE._new,save:'#evSave'},gl:{m:'#glModal',ok:()=>true,save:'.pri,[data-add],.gladd'}};
function drfVals(m){const o={};m.querySelectorAll('input[id],textarea[id],select[id]').forEach(i=>{if(i.type==='checkbox'||i.type==='radio')o[i.id]=i.checked;else o[i.id]=i.value});return o}
Object.entries(DRF).forEach(([k,D])=>{const m=$(D.m);if(!m)return;let start=null,saved=false;
  m.addEventListener('click',e=>{if(e.target.closest(D.save))saved=true},true);
  new MutationObserver(()=>{const on=m.classList.contains('on');if(on&&!start){saved=false;setTimeout(()=>{if(!D.ok())return;start=drfVals(m);let dr=null;try{dr=JSON.parse(localStorage.getItem('thabat.drf.'+k)||'null')}catch(e){}
      if(dr&&Date.now()-dr.at<36e5){Object.entries(dr.v).forEach(([id,v])=>{const i=m.querySelector('#'+CSS.escape(id));if(!i)return;if(i.type==='checkbox')i.checked=v;else if(i.value!==v){i.value=v;i.dispatchEvent(new Event('input',{bubbles:true}));i.dispatchEvent(new Event('change',{bubbles:true}))}});localStorage.removeItem('thabat.drf.'+k);
        const st=start;toastAct(t('drf.back'),t('drf.clear'),()=>{Object.entries(st).forEach(([id,v])=>{const i=m.querySelector('#'+CSS.escape(id));if(i){if(i.type==='checkbox')i.checked=v;else i.value=v}})},6000)}},60)}
    else if(!on&&start){const now=drfVals(m),changed=Object.keys(now).some(id=>{const i=m.querySelector('#'+CSS.escape(id));return i&&(i.type==='text'||i.tagName==='TEXTAREA'||i.type==='number')&&now[id]!==start[id]&&String(now[id]).trim()});if(!saved&&changed)try{localStorage.setItem('thabat.drf.'+k,JSON.stringify({at:Date.now(),v:now}))}catch(e){}else localStorage.removeItem('thabat.drf.'+k);start=null}}).observe(m,{attributes:true,attributeFilter:['class']})});

/* 71. moving to a page from a card on Today: the card grows into the page (View Transitions, where the browser has them) */
{const _sv=showView;let SRC=null;document.addEventListener('click',e=>{const c=e.target.closest&&e.target.closest('#v-today .card');SRC=c?{c,at:Date.now()}:null},true);
  showView=function(v,...a){const go=()=>_sv(v,...a);if(!document.startViewTransition||document.documentElement.classList.contains('rmotion')||curView()===v||MOB.matches&&isLite()){return go()}
    const c=SRC&&Date.now()-SRC.at<600&&curView()==='today'?SRC.c:null;SRC=null;if(!c)return go();let r;c.style.viewTransitionName='thx';
    try{const tr=document.startViewTransition(()=>{c.style.viewTransitionName='';r=go();const tv=$('#v-'+v);if(tv)tv.style.viewTransitionName='thx'});tr.finished.finally(()=>{const tv=$('#v-'+v);if(tv)tv.style.viewTransitionName=''})}catch(e){c.style.viewTransitionName='';r=go()}return r}}

/* 72. a small ✓ beside a setting once its change is saved */
document.addEventListener('change',e=>{const i=e.target;if(!i.closest||!i.closest('#v-set')||!/INPUT|SELECT|TEXTAREA/.test(i.tagName))return;setTimeout(()=>svOk(i),120)},true);
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#v-set .seg button,#v-set .tog,#v-set [role=switch],#v-set .switch');if(b)setTimeout(()=>svOk(b),120)},true);
function svOk(el){const row=el.closest('.field,.row')||el.parentElement;if(!row)return;let m=row.querySelector(':scope>.svok');if(!m){m=document.createElement('span');m.className='svok';m.textContent='✓';m.setAttribute('aria-hidden','true');row.append(m)}m.classList.remove('on');void m.offsetWidth;m.classList.add('on');clearTimeout(m._t);m._t=setTimeout(()=>m.classList.remove('on'),1400)}

/* 75. long press on the page number under a mushaf page opens «go to» */
{let tm=null;const start=e=>{const f=e.target.closest&&e.target.closest('#mushaf .qf');if(!f)return;clearTimeout(tm);tm=setTimeout(()=>{tm=null;const b=$('#qbPos');if(b){try{vib(10)}catch(x){}b.click()}},520)};const stop=()=>{clearTimeout(tm);tm=null};
  document.addEventListener('pointerdown',start,true);['pointerup','pointercancel','pointermove'].forEach(ev=>document.addEventListener(ev,e=>{if(ev==='pointermove'&&!(Math.abs(e.movementX)+Math.abs(e.movementY)>6))return;stop()},true))}
