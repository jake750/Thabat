/* ============ v3.16: your own order in the library — folders, courses, folder contents, playlists and audio folders; arrows everywhere, drag on PC ============ */
/* S.lib.ord[scope] = [ids]: 'k:<parent|root>' shelf folders, 'pc' PC courses, 'ak:<parent|root>' audio folders. Folder contents and playlists keep their order in their own arrays */
function lordGet(scope){const L_=LIBS();L_.ord=L_.ord||{};return L_.ord[scope]||[]}
function lordApply(scope,arr,idOf){const o=lordGet(scope);if(!o.length)return arr;const pos=new Map(o.map((id,i)=>[id,i]));return arr.map((x,i)=>[x,i]).sort((a,b)=>{const pa=pos.has(idOf(a[0]))?pos.get(idOf(a[0])):1e6+a[1],pb=pos.has(idOf(b[0]))?pos.get(idOf(b[0])):1e6+b[1];return pa-pb}).map(x=>x[0])}
{const _k=lshKids;lshKids=function(pid){return lordApply('k:'+(pid||'root'),_k(pid),f=>f.id)}}
{const _k=auKids;auKids=function(pid){return lordApply('ak:'+(pid||'root'),_k(pid),f=>f.id)}}
{const _c=libCourses;libCourses=function(){const cs=_c();return LIBS().sort==='manual'?lordApply('pc',cs,c=>c.id):cs}}
{const _s=lshSort;lshSort=function(arr,prog){return LIBS().sort==='manual'?arr:_s(arr,prog)}}
/* the «my order» option in the sort menu */
{const _t=lshTop;lshTop=function(){return _t().replace(/(<select class="in" id="lshSort">[\s\S]*?)(<\/select>)/,(m,a,b)=>a+`<option value="manual" ${LIBS().sort==='manual'?'selected':''}>${t('lord.manual')}</option>`+b)}}
/* arrange mode: which containers can be ordered, and how a move is saved */
const LORD={on:false};
function lordScopes(){const o=String(LIB.open||''),out=[];
  if(!o){const mine=[...$$('#lshBody > .lshgrid, #lshBody > .lshfs')].filter(g=>{let p=g.previousElementSibling;while(p&&!p.classList.contains('lshh'))p=p.previousElementSibling;return p&&p.querySelector('#lshNew')});mine.forEach(g=>out.push({el:g,scope:'k:root'}));
    const pcH=$('#lshAll'),pcG=pcH&&pcH.closest('.lshh').nextElementSibling&&pcH.closest('.lshh').nextElementSibling.nextElementSibling;if(pcG&&pcG.classList.contains('lshgrid'))out.push({el:pcG,scope:'pc'})}
  else if(o.startsWith('f:')){const fid=o.slice(2);$$('#lshBody > .lshfs').forEach(g=>out.push({el:g,scope:'k:'+fid}));$$('#lshBody > .lshgrid').forEach(g=>{if(g.querySelector('[data-card^="d:"]'))out.push({el:g,scope:'items:'+fid})});$$('#lshBody > .lbles').forEach(g=>{if(!lshGet(fid).course)out.push({el:g,scope:'items:'+fid})})}
  else if(o==='au:'){$$('#lshBody > .lshfs').forEach(g=>{const c=g.querySelector('[data-ao]');if(c)out.push({el:g,scope:c.dataset.ao.startsWith('p:')?'apl':'ak:root'})})}
  else if(o.startsWith('au:f:')){const fid=o.slice(5);$$('#lshBody > .lshfs').forEach(g=>out.push({el:g,scope:'ak:'+fid}));$$('#lshBody > .aulist').forEach(g=>out.push({el:g,scope:'aitems:'+fid}))}
  return out}
function lordId(el){return el.dataset.folder||(el.dataset.card&&el.dataset.card.split(':')[1])||(el.dataset.ao&&el.dataset.ao.split(':')[1])||el.dataset.play||el.dataset.rid}
function lordSave(scope,ids){const L_=LIBS();L_.ord=L_.ord||{};
  if(scope.startsWith('items:')){const f=lshGet(scope.slice(6));if(f){const pos=new Map(ids.map((id,i)=>[id,i]));const seen=f.items.filter(r=>pos.has(r.id)).sort((a,b)=>pos.get(a.id)-pos.get(b.id));let k=0;f.items=f.items.map(r=>pos.has(r.id)?seen[k++]:r)}}
  else if(scope.startsWith('aitems:')){const f=auF(scope.slice(7));if(f){const pos=new Map(ids.map((id,i)=>[id,i]));const seen=f.items.filter(id=>pos.has(id)).sort((a,b)=>pos.get(a)-pos.get(b));let k=0;f.items=f.items.map(id=>pos.has(id)?seen[k++]:id)}}
  else if(scope==='apl'){const A=AUD(),pos=new Map(ids.map((id,i)=>[id,i]));A.pl.sort((a,b)=>(pos.has(a.id)?pos.get(a.id):1e6)-(pos.has(b.id)?pos.get(b.id):1e6))}
  else{const old=L_.ord[scope]||[],keep=old.filter(id=>!ids.includes(id));L_.ord[scope]=[...ids,...keep];if(scope==='pc')L_.sort='manual'}
  if(scope==='k:root')L_.sort='manual';save()}
function lordDecorate(){const sc=lordScopes(),rtl=document.documentElement.dir==='rtl';
  sc.forEach(({el,scope})=>{const kids=[...el.children].filter(c=>lordId(c));if(kids.length<2)return;el.classList.add('lordon');
    /* one column (phones, lists): ↑ ↓; a grid: ‹ › */
    const cs=getComputedStyle(el),vert=cs.display.includes('grid')?cs.gridTemplateColumns.trim().split(/\s+/).length===1:cs.flexDirection==='column',pv=vert?'↑':rtl?'›':'‹',nx=vert?'↓':rtl?'‹':'›';if(vert)el.classList.add('lordv');
    kids.forEach((c,i)=>{c.classList.add('lorditem');c.setAttribute('draggable','true');c.insertAdjacentHTML('beforeend',`<span class="lordbtns"><button data-lmv="-1" ${i?'':'disabled'} aria-label="${esc(t('lord.before'))}">${pv}</button><button data-lmv="1" ${i<kids.length-1?'':'disabled'} aria-label="${esc(t('lord.after'))}">${nx}</button></span>`);
      c.querySelectorAll('[data-lmv]').forEach(b=>b.onclick=e=>{e.stopPropagation();e.preventDefault();const ids=kids.map(lordId),i0=ids.indexOf(lordId(c)),j=i0+(+b.dataset.lmv);if(j<0||j>=ids.length)return;[ids[i0],ids[j]]=[ids[j],ids[i0]];lordSave(scope,ids);renderLib()});
      c.ondragstart=e=>{LORD.drag={el:c,scope};e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain','lord');c.classList.add('lorddrag')};
      c.ondragend=()=>{c.classList.remove('lorddrag');$$('.lordover').forEach(x=>x.classList.remove('lordover'));LORD.drag=null};
      c.ondragover=e=>{if(!LORD.drag||LORD.drag.scope!==scope||LORD.drag.el===c)return;e.preventDefault();c.classList.add('lordover')};
      c.ondragleave=()=>c.classList.remove('lordover');
      c.ondrop=e=>{if(!LORD.drag||LORD.drag.scope!==scope)return;e.preventDefault();const ids=kids.map(lordId),from=ids.indexOf(lordId(LORD.drag.el)),to=ids.indexOf(lordId(c));ids.splice(to,0,ids.splice(from,1)[0]);lordSave(scope,ids);LORD.drag=null;renderLib()}})})}
/* the «⇅ arrange» button on every library page that has something to order */
function lordButton(){const o=String(LIB.open||'');let host=null;
  if(!o)host=$('#lshNew');else if(o.startsWith('f:'))host=$('#lshSub');else if(o==='au:')host=$('#auNewP');else if(o.startsWith('au:f:'))host=$('#auSubF');
  if(!host||$('#lordBtn'))return;host.insertAdjacentHTML('beforebegin',`<button class="btn sm ${LORD.on?'pri':'ghost'}" id="lordBtn">⇅ ${LORD.on?t('lsh.done'):t('lord.btn')}</button>`);
  $('#lordBtn').onclick=e=>{e.stopPropagation();LORD.on=!LORD.on;if(LORD.on)toast(t('lord.tip'));renderLib()}}
{const _rl=renderLib;renderLib=function(){const r=_rl();try{if(!$('#v-lib.on')&&curView()!=='lib')return r;lordButton();if(LORD.on)lordDecorate()}catch(e){console.error(e)}return r}}
{const _sv=showView;showView=function(v,...a){if(v!=='lib')LORD.on=false;return _sv(v,...a)}}

