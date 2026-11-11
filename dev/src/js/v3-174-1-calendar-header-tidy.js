/* ============ v3.174.1 calendar header on phones: every tool gets an icon and a short label (shown only in the phone tile grid) ============ */
function chtSvg(p){return`<svg class="uic cht-i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`}
function chtPaint(){const tb=$('#calTools3');if(!tb)return;
  const wk=$('#calWkBtn');if(wk&&!wk.querySelector('.cht-i'))wk.insertAdjacentHTML('afterbegin',chtSvg(UIC_P.calendar||''));
  const cl=$('#clBtn');if(cl&&!cl.querySelector('.cht-l'))cl.insertAdjacentHTML('beforeend',`<span class="cht-l" data-i18n="cht.ly">${esc(t('cht.ly'))}</span>`);
  const em=$('#emtBtn');if(em&&!em.dataset.cht){em.dataset.cht='1';em.innerHTML=`<span class="cht-g">⧉ </span>${chtSvg('<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>')}<span data-i18n="emt.b">${esc(t('emt.b'))}</span>`}
  const mb=$('#cd13More');if(mb&&!mb.querySelector('.cht-i')){[...mb.childNodes].forEach(n=>{if(n.nodeType===3&&n.data.trim()==='⋯'){const g=document.createElement('span');g.className='cht-g';g.textContent='⋯';n.replaceWith(g)}});mb.insertAdjacentHTML('beforeend',chtSvg('<circle cx="5" cy="12" r="1.3" fill="currentColor"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/><circle cx="19" cy="12" r="1.3" fill="currentColor"/>')+`<span class="cht-l" data-i18n="cht.more">${esc(t('cht.more'))}</span>`)}}
{hookFn('renderCal',()=>renderCal,f=>{renderCal=f},'post',function(){try{chtPaint()}catch(e){}})}
