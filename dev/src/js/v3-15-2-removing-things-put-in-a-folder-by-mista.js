/* ============ v3.15.2: removing things put in a folder by mistake — any lesson (even one inside a whole course), whole courses, several at once, with undo ============ */
/* a lesson that came inside a whole PC course is hidden from that folder only: f.hide = [media ids]. Files on the PC are never touched */
{const _lm=lshMedia;lshMedia=function(id,seen){const hide=new Set(((lshGet(id)||{}).hide)||[]);return _lm(id,seen).filter(x=>!hide.has(x.id))}}
/* the folder (this one or one inside it) that holds a lesson, directly or through a whole course */
function lshHolder(rootId,mediaId){const walk=fid=>{const f=lshGet(fid);if(!f)return null;for(const r of f.items||[]){if(r.t==='m'&&r.id===mediaId)return{f,direct:true};if(r.t==='d'){const n=libFind(r.id);if(n&&libMedia(n).some(x=>x.id===mediaId))return{f,direct:false}}}for(const k of lshKids(fid)){const h=walk(k.id);if(h)return h}return null};return walk(rootId)}
function lshSnap(){return JSON.stringify(LSH())}
function lshUndo(snap,n){toastAct(t('lsh.removed',n),t('lsh.undo'),()=>{const L_=LIBS();L_.shelf=JSON.parse(snap);save();renderLib()},8000)}
function lshRemove(rootId,refs){const snap=lshSnap();let n=0;
  refs.forEach(r=>{if(r.t==='d'){const f=lshGet(rootId);if(f&&(f.items||[]).some(x=>x.id===r.id)){f.items=f.items.filter(x=>x.id!==r.id);n++}return}
    const h=lshHolder(rootId,r.id);if(!h)return;if(h.direct)h.f.items=h.f.items.filter(x=>x.id!==r.id);else{h.f.hide=h.f.hide||[];if(!h.f.hide.includes(r.id))h.f.hide.push(r.id)}n++});
  if(n){save();LIBX.sel=null;renderLib();lshUndo(snap,n)}}
/* the «⋯» on a lesson: «remove from this folder» now works for every lesson in the folder */
{const _im=lshItemMenu;lshItemMenu=function(anchor,ref,inFolder){const fid=inFolder||(LIB.open&&String(LIB.open).startsWith('f:')?String(LIB.open).slice(2):null);_im(anchor,ref,fid);
  const p=$('#ppPop'),rm=p&&p.querySelector('[data-rm]');if(rm)rm.onclick=()=>{closePP();lshRemove(fid,[ref])}}}
/* «select» mode in a folder: tick lessons and courses, then remove them together */
{const _fv=lshFolderView;lshFolderView=function(id){let h=_fv(id);const f=lshGet(id);if(!f)return h;const ed=!!(LIBX.sel&&LIBX.sel.f===id);
  const bar=ed?`<div class="lshselbar" id="lshSelBar"><span id="lshSelN">${t('lsh.selN',LIBX.sel.ids.size)}</span><button class="btn sm ghost" id="lshSelAll">${t('lsh.selAll')}</button><button class="btn sm" id="lshSelRm" ${LIBX.sel.ids.size?'':'disabled'}>✕ ${t('lsh.removeSel')}</button></div>`:'';
  /* the select button sits with the folder's buttons; its bar comes right under them */
  h=h.replace('<button class="btn sm ghost" id="lshMore">⋯</button></div>',`<button class="btn sm ${ed?'pri':'ghost'}" id="lshEd">✎ ${ed?t('lsh.done'):t('lsh.select')}</button><button class="btn sm ghost" id="lshMore">⋯</button></div>${bar}`);
  return h}}
{const _bb=lshBindBody;lshBindBody=function(b){_bb(b);const id=LIB.open&&String(LIB.open).startsWith('f:')?String(LIB.open).slice(2):null,f=id&&lshGet(id);if(!f||!b)return;
  const own=new Set((f.items||[]).filter(r=>r.t==='d').map(r=>r.id)),ed=!!(LIBX.sel&&LIBX.sel.f===id);
  /* an ✕ on each whole course placed in this folder */
  b.querySelectorAll('.lshc[data-card^="d:"]').forEach(c=>{const cid=c.dataset.card.slice(2);if(!own.has(cid))return;
    c.insertAdjacentHTML('beforeend',ed?`<label class="lshpick1"><input type="checkbox" data-sel="d:${cid}" ${LIBX.sel.ids.has('d:'+cid)?'checked':''}></label>`:`<button class="lshunl" data-unl="${cid}" title="${esc(t('lsh.remove'))}" aria-label="${esc(t('lsh.remove'))}">✕</button>`)});
  b.querySelectorAll('[data-unl]').forEach(x=>x.onclick=e=>{e.stopPropagation();lshRemove(id,[{t:'d',id:x.dataset.unl}])});
  if(ed){b.querySelectorAll('.lbl[data-play]').forEach(r=>{const mid=r.dataset.play;r.insertAdjacentHTML('afterbegin',`<label class="lshpick1 inrow"><input type="checkbox" data-sel="m:${mid}" ${LIBX.sel.ids.has('m:'+mid)?'checked':''}></label>`);r.classList.add('lshsel')});
    const upd=()=>{$('#lshSelN').textContent=t('lsh.selN',LIBX.sel.ids.size);$('#lshSelRm').disabled=!LIBX.sel.ids.size};
    b.querySelectorAll('[data-sel]').forEach(cb=>{cb.onclick=e=>e.stopPropagation();cb.onchange=()=>{cb.checked?LIBX.sel.ids.add(cb.dataset.sel):LIBX.sel.ids.delete(cb.dataset.sel);upd()}});
    /* in select mode a tap on a row ticks it instead of playing */
    b.querySelectorAll('.lbl.lshsel,.lshc[data-card^="d:"]').forEach(r=>{r.onclick=e=>{if(e.target.closest('input'))return;e.stopPropagation();e.preventDefault();const cb=r.querySelector('[data-sel]');if(cb){cb.checked=!cb.checked;cb.onchange()}}});
    $('#lshSelAll').onclick=()=>{const all=[...b.querySelectorAll('[data-sel]')],on=!all.every(c=>c.checked);all.forEach(c=>{c.checked=on;on?LIBX.sel.ids.add(c.dataset.sel):LIBX.sel.ids.delete(c.dataset.sel)});upd()};
    $('#lshSelRm').onclick=()=>{const refs=[...LIBX.sel.ids].map(s=>{const [tt,i]=s.split(':');return{t:tt,id:i}});lshRemove(id,refs)}}
  const eb=$('#lshEd');if(eb)eb.onclick=()=>{LIBX.sel=ed?null:{f:id,ids:new Set()};renderLib()}}}
/* leaving the folder ends select mode */
{const _rl=renderLib;renderLib=function(){if(LIBX.sel&&LIB.open!=='f:'+LIBX.sel.f)LIBX.sel=null;return _rl()}}

