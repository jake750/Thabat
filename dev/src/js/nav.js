/* ============ nav ============ */
function curView(){const v=$('.view.on');return v?v.id.slice(2):'today'}
function showView(v){$('main').scrollTop=0;$$('.navbtn').forEach(x=>x.classList.toggle('on',x.dataset.v===v));$$('.view').forEach(x=>x.classList.toggle('on',x.id==='v-'+v));
  if(v==='quran')renderQuran();if(v==='cal')renderCal();if(v==='brief')renderBrief();if(v==='boards')renderBoardsView();if(v==='set')renderSettings();}
$$('.navbtn').forEach(b=>b.onclick=()=>showView(b.dataset.v));
function setLang(l){LANG=l;S.settings.lang=l;save();applyI18n();renderAll();}

