/* ============ loop ============ */
function renderAll(){renderToday();const v=curView();if(v==='quran')renderQuran();if(v==='cal')renderCal();if(v==='brief')renderBrief();if(v==='boards')renderBoardsView();if(v==='set')renderSettings();if($('#adhSheet').classList.contains('on'))renderAdhkar()}
applyTheme();applyI18n();rollover();renderToday();
let lastMin=-1;
setInterval(()=>{rollover();if(todayKey()!==curKey)renderToday();renderTimer();
  const mi=new Date().getMinutes();if(mi!==lastMin){lastMin=mi;renderPrayers();renderGlass();renderHeader();renderAdhBtn();widgetPush();if(S.timer.mode==='work'){if(curView()==='cal')renderCal();if(curView()==='brief')renderBrief()}}
  else if(S.timer.mode==='work'&&new Date().getSeconds()%10===0)renderGlass();
  checkPrayers();checkQuran();checkAdhRem()},1000);
setTimeout(()=>autoBackup(),8000);setInterval(()=>autoBackup(),6*36e5);maybeTour();takeOpen();
setInterval(()=>folderBackup(),5*6e4);
</script>
<script>/* 3.36: the loader. The app above is not run by the browser directly (type="text/x-thabat"): this runs it at once, the same as before,
   unless the browser storage only holds the short start copy (its meta says slim) — then the full data is first read from IndexedDB
   (at most 4 s; on failure the app starts from the short copy and joins the rest when it can). */
(function(){var go=function(){var m=document.getElementById('thMain');if(!m||m.dataset.ran)return;m.dataset.ran='1';var s=document.createElement('script');s.textContent=m.textContent;m.textContent='';document.body.appendChild(s)};
  var meta=null;try{meta=JSON.parse(localStorage.getItem('thabat.v1.meta')||'null')}catch(e){}
  if(!meta||!meta.slim||localStorage.getItem('thabat.idb2')!=='1'||!window.indexedDB){go();return}
  var done=false,fin=function(o){if(done)return;done=true;if(o)window.__THABAT_BOOT=o;go()};setTimeout(function(){fin(null)},4000);
  try{var rq=indexedDB.open('thabat',1);rq.onupgradeneeded=function(){rq.result.createObjectStore('kv')};rq.onerror=function(){fin(null)};
    rq.onsuccess=function(){try{var all={},c=rq.result.transaction('kv').objectStore('kv').openCursor(IDBKeyRange.bound('v2:','v2:￿'));
      c.onerror=function(){fin(null)};c.onsuccess=function(){var r=c.result;if(r){all[r.key]=r.value;r.continue();return}
        try{var mt=JSON.parse(all['v2:meta']||'null');if(!mt||!all['v2:core'])return fin(null);var o=JSON.parse(all['v2:core']);o._savedAt=mt.at||0;o.notes=JSON.parse(all['v2:notes']||'[]');o.days={};
          for(var i=0;i<mt.months.length;i++){var raw=all['v2:m:'+mt.months[i]];if(raw==null)return fin(null);var d=JSON.parse(raw);for(var k in d)o.days[k]=d[k]}fin({o:o,meta:mt})}catch(e){fin(null)}}}catch(e){fin(null)}}}catch(e){fin(null)}})();
