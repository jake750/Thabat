/* ============ calendar legend ============ */
function calLegend(btn){closePP();const p=document.createElement('div');p.className='pppop callg';p.id='ppPop';
  const R=(ic,tx)=>`<div class="lgr"><span class="lgi">${ic}</span><span>${tx}</span></div>`;
  p.innerHTML=`<b>${t('lg.title')}</b>`+R(`<span class="lgcell gold"></span>`,t('lg.gold'))+R(`<span class="lgcell q3"></span>`,t('lg.glow'))+R(`<span class="msb l1">${ICON_MISBAHA}</span><span class="msb l2">${ICON_MISBAHA}</span><span class="msb l3">${ICON_MISBAHA}</span>`,t('lg.msb'))
    +R(ICO_STAR,t('lg.star'))+R(ICO_CRES,t('lg.cres'))+R(ICO_MOON,t('lg.moon'))+R(`<span class="lgclk">${ICON_CLOCK}</span>`,t('lg.dl'))+R(`<span class="lgvac">${t('vac.tag')}</span>`,t('lg.vac'))+R('<span class="lgpc">45%</span>',t('lg.pc'))+`<small>${t('lg.tap')}</small>`;
  document.body.append(p);const r=btn.getBoundingClientRect(),w=p.offsetWidth;p.style.left=Math.max(8,Math.min(innerWidth-w-8,r.left+r.width/2-w/2))+'px';p.style.top=(r.bottom+8)+'px';setTimeout(()=>document.addEventListener('mousedown',ppOut,true),0)}
