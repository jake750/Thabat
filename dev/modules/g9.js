/* ============ v3.8.1: notes toolbar in two tidy rows — sections · ⋯ · new note, then search ============ */
const NX_MORE=[['nLetter','lt2.sub'],['nObsIn','nx.obsIn'],['nObs','nx.obs']];
function nxLayout(){const bar=$('#v-boards .nbar'),tools=$('#nTools'),seg=$('#nbSeg'),nw=$('#nNew');if(!bar||!tools||!seg||!nw)return;
  let act=$('#nxAct');if(!act){seg.insertAdjacentHTML('afterend',`<div class="nxact" id="nxAct"><button class="btn sm" id="nxMore" aria-label="${esc(t('nx.more'))}" title="${esc(t('nx.more'))}">⋯</button></div>`);act=$('#nxAct');
    $('#nxMore').onclick=e=>{const r=e.currentTarget.getBoundingClientRect();const p=qPopAt(`<div class="aymh">${t('nx.more')}</div>${NX_MORE.map(([id,k])=>{const b=$('#'+id);return b?`<button class="nxitem" data-nx="${id}"><b>${esc(b.textContent.trim())}</b><small>${esc(t(k))}</small></button>`:''}).join('')}`,r.left+r.width/2,r.bottom-8,'aymenu nxmenu');
      p.querySelectorAll('[data-nx]').forEach(x=>x.onclick=()=>{closePP();const o=$('#'+x.dataset.nx);if(o)o.click()})};
    new MutationObserver(()=>{act.hidden=tools.hidden}).observe(tools,{attributes:true,attributeFilter:['hidden']})}
  if(nw.parentElement!==act)act.append(nw);act.hidden=tools.hidden;NX_MORE.forEach(([id])=>{const b=$('#'+id);if(b)b.classList.add('nxhid')})}
{const _sv=showView;showView=function(n,...a){const r=_sv(n,...a);try{if(n==='boards')nxLayout()}catch(e){console.error(e)}return r}}
try{nxLayout()}catch(e){}
