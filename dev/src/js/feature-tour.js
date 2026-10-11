/* ============ feature tour ============ */
const TOUR=[['🌱','tour.1'],['🧱','tour.2'],['🌙','tour.3'],['🕌','tour.4'],['📖','tour.5'],['📿','tour.6'],['📅','tour.7'],['✅','tour.8'],['🗒️','tour.9'],['☁️','tour.10']];
let tourI=0;
function openTour(){tourI=0;let m=$('#tourModal');if(!m){m=document.createElement('div');m.className='modal tourm';m.id='tourModal';m.innerHTML='<div class="box tourbox" id="tourBox"></div>';document.body.append(m);
    m.onclick=e=>{if(e.target===m)endTour()};let sx=0;m.addEventListener('pointerdown',e=>sx=e.clientX);m.addEventListener('pointerup',e=>{const dx=e.clientX-sx;if(Math.abs(dx)>60&&!e.target.closest('button')){const rtl=document.documentElement.dir==='rtl';tourGo(tourI+((dx<0)!==rtl?1:-1))}})}
  m.classList.add('on');renderTour()}
function renderTour(anim){const [ic,k]=TOUR[tourI],last=tourI===TOUR.length-1;
  $('#tourBox').innerHTML=`<button class="iconx tourx" id="tourSkip" title="${esc(t('tour.skip'))}">✕</button><div class="tourslide ${anim||''}"><div class="tourico">${ic}</div><h2>${t(k+'.t')}</h2><p>${t(k+'.b')}</p></div>
    <div class="tourdots">${TOUR.map((_,i)=>`<i class="${i===tourI?'on':''}" data-i="${i}"></i>`).join('')}</div>
    <div class="touract"><button class="btn ghost" id="tourSkip2">${t('tour.skip')}</button><span class="grow"></span>${tourI?`<button class="btn" id="tourPrev">${t('prev')}</button>`:''}<button class="btn pri" id="tourNext">${last?t('tour.start'):t('next')}</button></div>`;
  $('#tourSkip').onclick=endTour;$('#tourSkip2').onclick=endTour;$('#tourNext').onclick=()=>last?endTour():tourGo(tourI+1);if($('#tourPrev'))$('#tourPrev').onclick=()=>tourGo(tourI-1);
  $$('#tourBox .tourdots i').forEach(d=>d.onclick=()=>tourGo(+d.dataset.i))}
function tourGo(i){if(i<0||i>=TOUR.length)return;const d=i>tourI?'sl':'sr';tourI=i;renderTour(d)}
function endTour(){const m=$('#tourModal');if(m)m.classList.remove('on');if(!S.tourDone){S.tourDone=true;save()}}
function maybeTour(){if(S.setupDone&&!S.tourDone&&!$('#setupModal').classList.contains('on'))setTimeout(()=>{if(!S.tourDone&&!$('#setupModal').classList.contains('on'))openTour()},700)}
document.addEventListener('keydown',e=>{const m=$('#tourModal');if(!m||!m.classList.contains('on'))return;const rtl=document.documentElement.dir==='rtl';
  if(e.key==='Escape')endTour();else if(e.key==='ArrowLeft')tourGo(tourI+(rtl?1:-1));else if(e.key==='ArrowRight')tourGo(tourI+(rtl?-1:1));else if(e.key==='Enter')$('#tourNext').click()});
(function(){const b=document.createElement('button');b.className='helpbtn';b.id='helpBtn';b.textContent='!';b.onclick=openTour;document.body.append(b);b.title=t('tour.again')})();

