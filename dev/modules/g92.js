/* ============ v3.78.0: a shooting star in the wall's sky once the day passes 16 hours of work ============ */
const MET_MS=16*36e5,MET_HTML='<div class="skymet" aria-hidden="true"><i></i></div>';
{hookFn('renderSky',()=>renderSky,f=>{renderSky=f},'post',function(k,tot,g){try{const sky=$('#gscene .sky');if(!sky)return;const on=tot>=MET_MS&&!overBricks();let m=sky.querySelector('.skymet');
  if(on&&!m){sky.insertAdjacentHTML('beforeend',MET_HTML);m=sky.querySelector('.skymet');m.title=t('met.tip')}else if(!on&&m)m.remove()}catch(e){}})}
{const _f=sceneHTML;sceneHTML=function(k,big){const h=_f(k,big);try{if(overBricks()||totals(k).tot<MET_MS)return h;return h.replace('<div class="skystars">',MET_HTML+'<div class="skystars">')}catch(e){return h}}}
