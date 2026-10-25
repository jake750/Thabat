/* ============ 3.123 eleventh list F (board): search inside a board, layers, a board as a template, all comments in one list, colours of your own per board (arrow labels, elbow arrows and alignment guides already existed) ============ */
function wbTextOf(e){return[e.text,e.title,e.tt,(e.cells||[]).flat().join(' '),(e.cm||[]).map(c=>c.t).join(' ')].filter(Boolean).join(' ')}
function wbCenterOn(id){const e=wbFind(id),wr=$('#bwrap');if(!e||!wr)return;const b=wbBox(e),r=wr.getBoundingClientRect(),v=wbView();if(!r.width)return;v.x=r.width/2-(b.x+b.w/2)*v.z;v.y=r.height/2-(b.y+b.h/2)*v.z;wbApplyView()}

/* 11th-58: search inside the board (Ctrl+F on the board, or «⋯»): matches light up, Enter / ↓ ↑ move between them */
const WBS={q:'',hits:[],i:0};
function wbsOpen(){let b=$('#wbsBar');if(!b){const wr=$('#bwrap');if(!wr)return;wr.insertAdjacentHTML('beforeend',`<div id="wbsBar" class="wbsbar"><input class="in" id="wbsQ" placeholder="${esc(t('wbs.ph'))}" dir="auto"><small id="wbsN"></small><button class="btn sm ghost" data-s="-1" aria-label="↑">↑</button><button class="btn sm ghost" data-s="1" aria-label="↓">↓</button><button class="btn sm ghost" data-s="x" aria-label="✕">✕</button></div>`);b=$('#wbsBar');
    $('#wbsQ').oninput=()=>wbsRun($('#wbsQ').value);$('#wbsQ').onkeydown=e=>{if(e.key==='Enter'||e.key==='ArrowDown'){e.preventDefault();wbsStep(e.shiftKey?-1:1)}else if(e.key==='ArrowUp'){e.preventDefault();wbsStep(-1)}else if(e.key==='Escape')wbsClose()};
    b.querySelectorAll('[data-s]').forEach(x=>x.onclick=()=>{const s=x.dataset.s;if(s==='x')wbsClose();else wbsStep(+s)});['pointerdown','wheel'].forEach(ev=>b.addEventListener(ev,e=>e.stopPropagation()))}
  const q=$('#wbsQ');q.focus();q.select();if(WBS.q)wbsRun(WBS.q)}
function wbsRun(q){WBS.q=q;$$('#bworld .wbhit,#bworld .wbhit1').forEach(n=>n.classList.remove('wbhit','wbhit1'));const s=lshNorm(q.trim());WBS.hits=s?wbEls().filter(e=>lshNorm(wbTextOf(e)).includes(s)).map(e=>e.id):[];WBS.i=0;
  WBS.hits.forEach(id=>WB.nodes[id]?.classList.add('wbhit'));const n=$('#wbsN');if(n)n.textContent=s?(WBS.hits.length?`1/${WBS.hits.length}`:t('wbs.none')):'';if(WBS.hits.length)wbsShow()}
function wbsShow(){const id=WBS.hits[WBS.i];$$('#bworld .wbhit1').forEach(n=>n.classList.remove('wbhit1'));WB.nodes[id]?.classList.add('wbhit1');wbCenterOn(id);const n=$('#wbsN');if(n)n.textContent=`${WBS.i+1}/${WBS.hits.length}`}
function wbsStep(d){if(!WBS.hits.length)return;WBS.i=(WBS.i+d+WBS.hits.length)%WBS.hits.length;wbsShow()}
function wbsClose(){$('#wbsBar')?.remove();$$('#bworld .wbhit,#bworld .wbhit1').forEach(n=>n.classList.remove('wbhit','wbhit1'));WBS.hits=[]}
document.addEventListener('keydown',e=>{if(!(e.ctrlKey||e.metaKey)||e.key.toLowerCase()!=='f'||curView()!=='boards'||!$('#bwrap')||$('.modal.on')||$('#bkReader.on'))return;const a=document.activeElement;if(a&&/INPUT|TEXTAREA/.test(a.tagName)&&a.id!=='wbsQ')return;if(!$('#bwrap').offsetParent)return;e.preventDefault();e.stopPropagation();wbsOpen()},true);

/* 11th-60: layers board().layers=[{id,n,hide,lock}], e.ly = layer id */
function wbLayers(){const b=board();return b.layers||(b.layers=[])}
function wbLyPaint(){const L_=wbLayers();if(!WB||!WB.nodes)return;const H=new Set(L_.filter(l=>l.hide).map(l=>l.id)),K=new Set(L_.filter(l=>l.lock).map(l=>l.id));wbEls().forEach(e=>{const n=WB.nodes[e.id];if(!n)return;n.classList.toggle('wbly-h',!!e.ly&&H.has(e.ly));n.classList.toggle('wbly-l',!!e.ly&&K.has(e.ly))})}
function wbLyOk(e){if(!e||!e.ly)return true;const l=wbLayers().find(x=>x.id===e.ly);return!l||(!l.hide&&!l.lock)}
function wbLyOpen(){const L_=wbLayers(),cnt=id=>wbEls().filter(e=>(e.ly||'')===id).length;
  openInfo(t('wbl.t'),`<div class="wbl"><div class="wblr base"><b>${esc(t('wbl.base'))}</b><small>${cnt('')}</small></div>${L_.map(l=>`<div class="wblr" data-l="${l.id}"><b dir="auto">${esc(l.n)}</b><small>${cnt(l.id)}</small><button class="btn sm ghost ${l.hide?'':'on'}" data-a="hide">${esc(l.hide?t('wbl.show'):t('wbl.hide'))}</button><button class="btn sm ghost ${l.lock?'on':''}" data-a="lock">${esc(l.lock?t('wbl.unlock'):t('wbl.lock'))}</button><button class="btn sm ghost" data-a="sel">${esc(t('wbl.sel'))}</button><button class="btn sm ghost" data-a="ren">✎</button><button class="btn sm ghost" data-a="del" aria-label="${esc(t('del'))}">✕</button></div>`).join('')}
    <button class="btn" id="wblAdd">＋ ${esc(t('wbl.add'))}</button><p class="muted" style="font-size:12px">${esc(t('wbl.hint'))}</p></div>`);
  $('#wblAdd').onclick=()=>{const n=(prompt(t('wbl.name'),t('wbl.def',L_.length+1))||'').trim();if(!n)return;L_.push({id:uid(),n:n.slice(0,40)});save();wbLyOpen()};
  $$('#infoBox .wblr[data-l] [data-a]').forEach(b=>b.onclick=()=>{const l=L_.find(x=>x.id===b.closest('[data-l]').dataset.l);if(!l)return;const a=b.dataset.a;
    if(a==='hide')l.hide=!l.hide;if(a==='lock')l.lock=!l.lock;if(a==='ren'){const n=(prompt(t('wbl.name'),l.n)||'').trim();if(n)l.n=n.slice(0,40)}
    if(a==='del'){wbEls().forEach(e=>{if(e.ly===l.id)delete e.ly});L_.splice(L_.indexOf(l),1)}
    if(a==='sel'){l.hide=false;l.lock=false;save();wbLyPaint();$$('.modal.on').forEach(m=>m.classList.remove('on'));wbSetSel(wbEls().filter(e=>e.ly===l.id).map(e=>e.id));return}
    if(l.hide||l.lock)wbSetSel([...WB.sel].filter(id=>wbLyOk(wbFind(id))));save();wbLyPaint();wbLyOpen()})}
function wbLyMove(ids){const L_=wbLayers();const p=qPopAt(`<button data-ly="">${esc(t('wbl.base'))}</button>`+L_.map(l=>`<button data-ly="${l.id}">${esc(l.n)}</button>`).join('')+`<button data-ly="+">＋ ${esc(t('wbl.add'))}</button>`,innerWidth/2,innerHeight/2,'aymenu');
  p.querySelectorAll('[data-ly]').forEach(b=>b.onclick=()=>{closePP();let id=b.dataset.ly;if(id==='+'){const n=(prompt(t('wbl.name'),t('wbl.def',L_.length+1))||'').trim();if(!n)return;id=uid();L_.push({id,n:n.slice(0,40)})}wbSnap();ids.forEach(x=>{const e=wbFind(x);if(!e)return;if(id)e.ly=id;else delete e.ly});save();wbLyPaint();toast(t('wbl.moved'))})}
{hookFn('wbSetSel',()=>wbSetSel,f=>{wbSetSel=f},'pre',function(ids){try{if(Array.isArray(ids)&&wbLayers().some(l=>l.hide||l.lock)){const ok=ids.filter(id=>wbLyOk(wbFind(id)));if(ok.length!==ids.length){ids.length=0;ok.forEach(x=>ids.push(x))}}}catch(e){}})}
{const _x=wbExportSet;wbExportSet=function(...a){const r=_x(...a);try{const H=new Set(wbLayers().filter(l=>l.hide).map(l=>l.id));return H.size?r.filter(e=>!e.ly||!H.has(e.ly)):r}catch(e){return r}}}

/* 11th-62: a board saved as a template (S.wbTpls=[{id,n,els}]); inserting it gives new ids and keeps arrows connected */
function wbTplSave(){const els=wbEls();if(!els.length){toast(t('notes.nothing'));return}const n=(prompt(t('wbt.name'),boardName(board()))||'').trim();if(!n)return;(S.wbTpls=S.wbTpls||[]).push({id:uid(),n:n.slice(0,40),els:JSON.parse(JSON.stringify(els.map(e=>{const c=Object.assign({},e);delete c.cm;delete c.ly;return c})))});save();toast(t('wbt.saved'))}
function wbTplUse(id){const T=(S.wbTpls||[]).find(x=>x.id===id);if(!T)return;const map={},els=JSON.parse(JSON.stringify(T.els));els.forEach(e=>{map[e.id]=uid()});let a=1e9,b=1e9,c=-1e9,d=-1e9;els.forEach(e=>{const q=wbBox(e);a=Math.min(a,q.x);b=Math.min(b,q.y);c=Math.max(c,q.x+q.w);d=Math.max(d,q.y+q.h)});
  const[cx,cy]=wbViewCenter(),dx=cx-(a+c)/2,dy=cy-(b+d)/2;els.forEach(e=>{e.id=map[e.id];if(e.from)e.from=map[e.from]||e.from;if(e.to)e.to=map[e.to]||e.to;if(e.gid)e.gid=(map[e.gid]=map[e.gid]||uid());if(e.x!=null)e.x+=dx;if(e.y!=null)e.y+=dy;if(e.x1!=null){e.x1+=dx;e.y1+=dy;e.x2+=dx;e.y2+=dy}if(e.pts)e.pts=e.pts.map(p=>[p[0]+dx,p[1]+dy,...p.slice(2)])});
  wbSnap();wbEls().push(...els);save();wbSetSel([]);wbRender();wbFit()}
function wbTplManage(){const L_=S.wbTpls||[];openInfo(t('wbt.mine'),L_.length?`<div class="wbl">${L_.map(x=>`<div class="wblr" data-t="${x.id}"><b dir="auto">${esc(x.n)}</b><small>${x.els.length}</small><button class="btn sm ghost" data-a="ren">✎</button><button class="btn sm ghost" data-a="del" aria-label="${esc(t('del'))}">✕</button></div>`).join('')}</div>`:`<p class="muted">${esc(t('wbt.none'))}</p>`);
  $$('#infoBox [data-t] [data-a]').forEach(b=>b.onclick=()=>{const x=L_.find(q=>q.id===b.closest('[data-t]').dataset.t);if(!x)return;if(b.dataset.a==='del')L_.splice(L_.indexOf(x),1);else{const n=(prompt(t('wbt.name'),x.n)||'').trim();if(n)x.n=n.slice(0,40)}save();wbTplManage()})}

/* 11th-63: every comment of the board in one list; «تم» marks a comment done (c.done), the badge counts open ones */
function wbCmAll(){const L_=[];wbEls().forEach(e=>(e.cm||[]).forEach(c=>L_.push({e,c})));L_.sort((a,b)=>(!!a.c.done-!!b.c.done)||b.c.at-a.c.at);const open=L_.filter(x=>!x.c.done).length;
  openInfo(t('wbca.t',open),L_.length?`<div class="wbca">${L_.map(({e,c})=>`<div class="wbcar ${c.done?'done':''}" data-e="${e.id}" data-c="${c.id}"><button class="wbcae" data-a="go"><small dir="auto">${esc((wbTextOf(Object.assign({},e,{cm:[]}))||t('wbca.el')).slice(0,60))}</small><span dir="auto">${esc(c.t)}</span></button><button class="btn sm ghost" data-a="done">${esc(c.done?t('wbca.reopen'):t('wbca.done'))}</button></div>`).join('')}</div>`:`<p class="muted">${esc(t('wbca.none'))}</p>`);
  $$('#infoBox .wbcar [data-a]').forEach(b=>b.onclick=()=>{const r=b.closest('.wbcar'),e=wbFind(r.dataset.e),c=e&&(e.cm||[]).find(x=>x.id===r.dataset.c);if(!c)return;if(b.dataset.a==='go'){$$('.modal.on').forEach(m=>m.classList.remove('on'));wbCenterOn(e.id);wbSetSel([e.id]);return}c.done=!c.done;save();try{wbCmPaint()}catch(x){}wbCmAll()})}

/* 11th-64: colours of your own per board (board().pal), shown first in every colour menu */
{hookFn('wbColorPop',()=>wbColorPop,f=>{wbColorPop=f},'post',function(btn,k,cur){try{const p=[...$$('.wbcpop')].pop();if(!p||p.querySelector('.wbpal'))return;const pal=board().pal=board().pal||[];
  p.insertAdjacentHTML('afterbegin',`<div class="wbpal"><small>${esc(t('wbp2.t'))}</small><div class="wbcgrid">${pal.map((c,i)=>`<button class="cdot ${c===cur?'on':''}" data-pi="${i}" title="${c}">${wbSwatch(c)}</button>`).join('')}${/^#[0-9a-f]{6}$/i.test(cur||'')&&!pal.includes(cur)?`<button class="cdot wbpadd" data-padd="1" title="${esc(t('wbp2.add'))}">＋</button>`:''}</div></div>`);
  p.querySelectorAll('[data-pi]').forEach(b=>{b.onclick=()=>{closePP();wbSetProp(k,pal[+b.dataset.pi]);wbToolbar()};b.oncontextmenu=e=>{e.preventDefault();pal.splice(+b.dataset.pi,1);save();closePP();toast(t('wbp2.rm'))}});
  const ad=p.querySelector('[data-padd]');if(ad)ad.onclick=()=>{pal.push(cur);if(pal.length>16)pal.shift();save();closePP();toast(t('wbp2.added'))}}catch(e){console.error(e)}})}

/* menus: «⋯» (search, layers, comments, save as template), templates (mine), selection «⋯» (move to a layer) */
{const _m=wbMenu;wbMenu=function(btn,items,...a){try{
  if(btn&&btn.id==='wbMore'&&!items.some(i=>i&&i.wb11)){const nc=wbEls().reduce((s,e)=>s+(e.cm||[]).filter(c=>!c.done).length,0);items=[Object.assign(['🔍 '+t('wbs.t'),wbsOpen],{wb11:1}),['▤ '+t('wbl.t')+(wbLayers().length?` (${wbLayers().length})`:''),wbLyOpen],['💬 '+t('wbca.t',nc),wbCmAll],['💾 '+t('wbt.save'),wbTplSave],null,...items]}
  if(btn&&btn.id==='wbTpl'&&!items.some(i=>i&&i.wbt)){const L_=S.wbTpls||[];if(L_.length)items=[...items,null,...L_.map((x,i)=>Object.assign(['💾 '+x.n,()=>wbTplUse(x.id)],i?{}:{wbt:1})),['⚙ '+t('wbt.mine'),wbTplManage]]}
  if(btn&&btn.dataset&&btn.dataset.a==='more'&&!items.some(i=>i&&i.wbly)){const sel=[...WB.sel];if(sel.length)items=[...items,null,Object.assign(['▤ '+t('wbl.move'),()=>wbLyMove(sel)],{wbly:1})]}
  }catch(e){}return _m(btn,items,...a)}}
{hookFn('wbRender',()=>wbRender,f=>{wbRender=f},'post',function(){try{wbLyPaint();if(WBS.hits.length)WBS.hits.forEach(id=>WB.nodes[id]?.classList.add('wbhit'))}catch(e){}})}
{hookFn('wbRefresh',()=>wbRefresh,f=>{wbRefresh=f},'post',function(){try{wbLyPaint()}catch(e){}})}

