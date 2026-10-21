/* ============ v3.77.6: «go to» in the Quran tools sheet; the position button keeps its room on phones; grace pill at the top on phones ============ */
{hookFn('qbLayout',()=>qbLayout,f=>{qbLayout=f},'post',function(){try{const tb=$('#qbTools .qbshb');if(!tb||$('#qbGoTo'))return;
  tb.insertAdjacentHTML('afterbegin',`<button class="btn sm ghost qbtool" id="qbGoTo" data-qbl="1">🧭<small>${esc(t('qx.nav'))}</small></button>`);
  $('#qbGoTo').onclick=()=>setTimeout(()=>qbOpen('qbNav'),20)}catch(e){console.error(e)}})}
/* the grace pill sits in the page flow under the juz' bar on the phone's Quran page (fixed, it covered the bottom of the mushaf page) */
{hookFn('qfgPaint',()=>qfgPaint,f=>{qfgPaint=f},'post',function(){try{const el=$('#qfgPill');if(!el)return;
  const inQ=MOB.matches&&curView()==='quran',at=$('#qjBar')||$('.qbar');
  if(inQ&&at){el.classList.add('qfgin');if(el.previousElementSibling!==at)at.after(el)}
  else if(el.parentElement!==document.body){el.classList.remove('qfgin');document.body.append(el)}}catch(e){}})}
{hookFn('showView',()=>showView,f=>{showView=f},'post',function(){try{if($('#qfgPill'))qfgPaint()}catch(e){}})}
