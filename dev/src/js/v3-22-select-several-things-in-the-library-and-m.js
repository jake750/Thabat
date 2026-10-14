/* ============ v3.22: select several things in the library and move them together — «☑ تحديد» on every library page (or Ctrl/Shift-click on PC), then «📁 انقل إلى…» or drag any selected item: all of them go ============ */
const LSEL={on:false,ids:new Map(),page:null};
const lselKey=s=>s.t+':'+s.id;
function lselClear(){LSEL.on=false;LSEL.ids.clear();lselPaint()}
function lselItems(){return[...LSEL.ids.values()]}
/* everything that can be dragged on this page can be selected */
function lselAllOnPage(){const out=[];$$('#v-lib .ldable').forEach(el=>{const s=ldSource(el);if(s&&s.el===el&&!out.some(x=>lselKey(x)===lselKey(s)))out.push(s)});return out}
function lselToggle(s){const k=lselKey(s);if(LSEL.ids.has(k))LSEL.ids.delete(k);else LSEL.ids.set(k,{t:s.t,id:s.id});lselPaint()}
function lselPaint(){const v=$('#v-lib');if(!v)return;v.classList.toggle('lselmode',LSEL.on);$$('#v-lib .lselon').forEach(e=>e.classList.remove('lselon'));
  if(LSEL.on)$$('#v-lib .ldable').forEach(el=>{const s=ldSource(el);if(s&&s.el===el&&LSEL.ids.has(lselKey(s)))el.classList.add('lselon')});
  const b=$('#lselBtn');if(b){b.classList.toggle('pri',LSEL.on);b.classList.toggle('ghost',!LSEL.on);b.textContent=(LSEL.on?'✓ '+t('lsh.done'):'☑ '+t('lsh.select'))}
  let bar=$('#lselBar');if(!LSEL.on||curView()!=='lib'){if(bar)bar.remove();return}
  if(!bar){document.body.insertAdjacentHTML('beforeend',`<div class="lselbar" id="lselBar" role="toolbar"><b id="lselN"></b><button class="btn sm ghost" id="lselAll"></button><button class="btn sm pri" id="lselMv"></button><button class="btn sm ghost" id="lselX">✕</button></div>`);bar=$('#lselBar');
    $('#lselAll').onclick=()=>{const all=lselAllOnPage(),every=all.length&&all.every(s=>LSEL.ids.has(lselKey(s)));if(every)all.forEach(s=>LSEL.ids.delete(lselKey(s)));else all.forEach(s=>LSEL.ids.set(lselKey(s),{t:s.t,id:s.id}));lselPaint()};
    $('#lselMv').onclick=e=>lselMoveMenu(e.currentTarget);$('#lselX').onclick=()=>lselClear()}
  const n=LSEL.ids.size,all=lselAllOnPage();$('#lselN').textContent=t('lsel.n',n);$('#lselAll').textContent=all.length&&all.every(s=>LSEL.ids.has(lselKey(s)))?t('lsel.none'):t('lsh.selAll');$('#lselX').setAttribute('aria-label',t('cancel'));
  const mv=$('#lselMv');mv.textContent='📁 '+t('lsel.move');mv.disabled=!n}
/* moving: one snapshot, one repaint, one undo for the whole group */
function lselMove(g){LSEL.batch=true;const list=lselItems().filter(s=>ldOk(s,g));if(!list.length){LSEL.batch=false;toast(t('lsel.cant'));return 0}
  const snap=JSON.stringify({sh:LSH(),au:AUD()}),_r=renderLib,_ta=toastAct;renderLib=()=>{};toastAct=()=>{};
  try{list.forEach(s=>{if(ldOk(s,g))ldDo(s,g)})}finally{renderLib=_r;toastAct=_ta;LSEL.batch=false}
  const skipped=LSEL.ids.size-list.length;LSEL.ids.clear();save();renderLib();
  toastAct(t('lsel.moved',list.length,ldGName(g))+(skipped?' · '+t('lsel.skip',skipped):''),t('lsh.undo'),()=>{const x=JSON.parse(snap);LIBS().shelf=x.sh;S.audio=x.au;save();renderLib()},10000);return list.length}
/* «move to…»: every folder (and playlist for recordings) that takes at least one of the selected items */
function lselTargets(){const it=lselItems(),o=String(LIB.open||''),out=[];if(!it.length)return out;const lib=it.some(s=>['sf','d','m','b','f'].includes(s.t)),aud=it.some(s=>s.t==='af'||s.t==='r');
  if(lib){out.push({k:'sf',id:null,n:'🗂 '+t('lsh.mine')});LSH().forEach(f=>out.push({k:'sf',id:f.id,n:'📁 '+lshPath(f.id).map(x=>x.n).join(' › ')}))}
  if(aud){out.push({k:'af',id:null,n:'🎧 '+t('au.t')});AUD().f.forEach(f=>out.push({k:'af',id:f.id,n:'📁 '+f.n}));AUD().pl.forEach(p=>out.push({k:'pl',id:p.id,n:'🎶 '+p.n}))}
  return out.filter(g=>it.some(s=>ldOk(s,g)))}
var lselMoveMenu;
/* dragging a selected item carries the whole selection */
{const _d=ldDo;ldDo=function(s,g){if(!LSEL.batch&&LSEL.ids.size>1&&s&&LSEL.ids.has(lselKey(s)))return lselMove(g)>0;return _d(s,g)}}
{const _ok=ldOk;ldOk=function(s,g){if(!LSEL.batch&&LSEL.ids.size>1&&s&&LSEL.ids.has(lselKey(s)))return lselItems().some(x=>_ok(x,g));return _ok(s,g)}}
{const _n=ldName;ldName=function(s){if(!LSEL.batch&&LSEL.ids.size>1&&s&&LSEL.ids.has(lselKey(s)))return t('lsel.n',LSEL.ids.size);return _n(s)}}
/* in select mode a click (or tap) on an item ticks it instead of opening it; on PC Ctrl/Shift-click starts selecting from anywhere */
document.addEventListener('click',e=>{if(LORD.on||!e.target.closest)return;const v=e.target.closest('#v-lib');if(!v||e.target.closest('#lpath,.lselbar,#lselBtn,#lordBtn'))return;
  const s=ldSource(e.target);if(!s||!s.el.classList.contains('ldable'))return;
  if(!LSEL.on&&!(e.ctrlKey||e.metaKey||e.shiftKey))return;
  e.preventDefault();e.stopPropagation();if(!LSEL.on){LSEL.on=true;LSEL.page=String(LIB.open||'')}
  if(e.shiftKey&&LSEL.last){const all=lselAllOnPage(),i=all.findIndex(x=>lselKey(x)===LSEL.last),j=all.findIndex(x=>lselKey(x)===lselKey(s));if(i>=0&&j>=0){all.slice(Math.min(i,j),Math.max(i,j)+1).forEach(x=>LSEL.ids.set(lselKey(x),{t:x.t,id:x.id}));lselPaint();return}}
  LSEL.last=lselKey(s);lselToggle(s)},true);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&LSEL.on&&curView()==='lib'&&!$('.modal.on')&&!$('#ppPop')){e.preventDefault();e.stopPropagation();lselClear()}},true);
/* the button: on every library page, next to «⇅ ترتيب» (it replaces the older «✎ تحديد», which could only remove) */
function lselButton(){if($('#lselBtn'))return;const o=String(LIB.open||'');let host=$('#lordBtn')||$('#lshNew')||$('#lshSub')||$('#auNewP')||$('#auSubF')||$('#libBox .lbbar .lbpr');
  const old=$('#lshEd');if(old){host=old;}if(!host||!$('#v-lib .ldable'))return;
  host.insertAdjacentHTML(old?'afterend':'beforebegin',`<button class="btn sm ${LSEL.on?'pri':'ghost'}" id="lselBtn">${LSEL.on?'✓ '+t('lsh.done'):'☑ '+t('lsh.select')}</button>`);if(old)old.remove();
  $('#lselBtn').onclick=e=>{e.stopPropagation();if(LSEL.on)lselClear();else{LORD.on=false;LSEL.on=true;LSEL.page=o;toast(t('lsel.tip'));renderLib()}}}
{const _rl=renderLib;renderLib=function(...x){const o=String(LIB.open||'');if(LSEL.on&&LSEL.page!==o){LSEL.on=false;LSEL.ids.clear()}if(LORD.on&&LSEL.on){LSEL.on=false;LSEL.ids.clear()}const r=_rl(...x);try{if(curView()==='lib'||$('#v-lib.on')){lselButton();lselPaint()}}catch(e){console.error(e)}return r}}
{const _sv=showView;showView=function(v,...a){if(v!=='lib'&&LSEL.on)lselClear();return _sv(v,...a)}}

