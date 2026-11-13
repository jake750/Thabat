/* ============ v3.174.5 «يومك بكلمة» and «نيّة اليوم» ask inside the app instead of the browser's file:// prompt ============ */
function uiAsk(title,val,cb,o){o=o||{};openInfo(esc(title),`<input class="in uia-in" id="uiaIn" dir="auto" maxlength="${o.max||60}" value="${esc(val||'')}" placeholder="${esc(o.ph||'')}" autocomplete="off">`);
  const box=$('#infoBox');box.className='box infobox uiabox';const i=$('#uiaIn'),ok=$('#infoX');ok.textContent=t('pdl.save');ok.insertAdjacentHTML('beforebegin',`<button class="btn sm ghost" id="uiaX">${esc(t('lt.cancel'))}</button>`);
  const close=()=>$('#infoModal').classList.remove('on'),go=()=>{const v=i.value.trim();close();cb(v)};ok.onclick=go;$('#uiaX').onclick=close;i.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();go()}};setTimeout(()=>{i.focus();i.select()},60)}
moodWord=function(){const d=day(todayKey());uiAsk(t('mwd.q'),d.moodW||'',v=>{if(!v)return;d.moodW=v.slice(0,30);save();renderTodayEv();toast(t('mwd.ok'))},{max:30,ph:t('mwd.ph')})};
niyyaAsk=function(){const d=day(todayKey());uiAsk(t('ny.ask'),d.niyya||'',v=>{d.niyya=v;save();renderTodayEv();if(d.niyya)toast(t('ny.saved'))},{max:120,ph:t('ny.ph')})};
