/* ============ 3.99 Taysir: the mushaf's introduction pages; phone downloads on Wi-Fi only ============ */
/* the PDF's pages drawn lazily into #infoBox (as the appendix does) */
function tsPdfPages(doc,from,to,num){const html=`<div class="tsap">${Array.from({length:to-from+1},(_,i)=>`<div class="tsapg" data-n="${from+i}"><span>${num(from+i)}</span></div>`).join('')}</div>`;return{html,run(){
  const io=new IntersectionObserver(es=>es.forEach(async en=>{if(!en.isIntersecting)return;const el=en.target;io.unobserve(el);
    try{const pg=await doc.getPage(+el.dataset.n),v=pg.getViewport({scale:1}),vp=pg.getViewport({scale:Math.min(2,900/v.width)}),c=document.createElement('canvas');c.width=vp.width;c.height=vp.height;
      await pg.render({canvasContext:c.getContext('2d'),viewport:vp}).promise;el.innerHTML='';el.append(c)}catch(e){}}),{rootMargin:'600px'});
  $$('#infoBox .tsapg').forEach(el=>io.observe(el))}}}
/* 7th-6: «مقدّمة المصحف» = the pages before page 1 (the cover, the key to the colours, the riwaya's rules), straight from the mushaf's own file */
async function tsIntro(id){let doc;try{doc=await tsDoc(id)}catch(e){toast(t(e&&e.code==='none'?'tsa.none':'ts.off'));return}
  const z=Math.min(TSR.off[id]||0,doc.numPages);if(z<1){toast(t('tsi.empty'));return}
  const P_=tsPdfPages(doc,1,z,n=>n);openInfo(t('tsi.t',riwName('ts_'+id)),`<p class="muted">${esc(t('tsi.sub'))}</p>`+P_.html);const b=$('#infoBox');if(b)b.classList.add('tsabox');P_.run()}
{hookFn('qbLayout',()=>qbLayout,f=>{qbLayout=f},'post',function(){try{const a=$('#tsaBtn');if(!a||$('#tsiBtn'))return;
  a.insertAdjacentHTML('beforebegin',`<button class="btn sm ghost qbtool" id="tsiBtn" data-qbl="1">📜<small>${esc(t('tsi.b'))}</small></button>`);
  $('#tsiBtn').onclick=()=>{const R=RIWAYAT[S.quran.riwaya];if(R&&R.ts)setTimeout(()=>tsIntro(R.ts),20)};tsBtns()}catch(e){console.error(e)}})}
{hookFn('tsBtns',()=>tsBtns,f=>{tsBtns=f},'post',function(){try{const e=$('#tsiBtn');if(e)e.hidden=!(RIWAYAT[S.quran.riwaya]||{}).ts}catch(x){}})}

/* 7th-7: on the phone, «Wi-Fi only» (the same device switch as the library lessons, localStorage['thabat.dkOpt'].wifi) also holds Taysir downloads:
   on mobile data a download waits in localStorage['thabat.tsWait']; one that is running stops (the phone cannot resume a file, so it starts again on Wi-Fi) */
const TSW={q:[]};try{TSW.q=JSON.parse(localStorage.getItem('thabat.tsWait')||'[]')||[]}catch(e){}
function tswSave(){try{localStorage.setItem('thabat.tsWait',JSON.stringify(TSW.q))}catch(e){}}
{const _g=tsDevGet;tsDevGet=function(id){if(dkqBlocked()){if(!TSW.q.includes(id)){TSW.q.push(id);tswSave()}toast(t('tsw.wait'));setTimeout(()=>{if($('#tsmList'))tsMinePaint()},100);return}
  TSW.q=TSW.q.filter(x=>x!==id);tswSave();return _g(id)}}
function tswPump(){if(!andTs()||dkqBlocked()||!TSW.q.length)return;const st=tsDevState(),run=Object.values(st).filter(s=>s.s==='run').length;
  let free=Math.max(0,2-run);while(free>0&&TSW.q.length){const id=TSW.q[0];if(st[id]&&st[id].s==='ok'){TSW.q.shift();tswSave();continue}tsDevGet(id);free--}}
function tswNet(){if(!andTs())return;if(dkqBlocked()){const st=tsDevState(),run=Object.keys(st).filter(id=>st[id].s==='run');if(!run.length)return;
    run.forEach(id=>{try{window.ThabatAndroid.tsStop(id)}catch(e){}if(!TSW.q.includes(id))TSW.q.push(id)});tswSave();toast(t('tsw.paused'));setTimeout(()=>{if($('#tsmList'))tsMinePaint()},700)}
  else if(TSW.q.length){toast(t('tsw.resume'));tswPump()}}
try{navigator.connection&&navigator.connection.addEventListener('change',tswNet)}catch(e){}
setTimeout(()=>{try{tswPump()}catch(e){}},6000);
{const _ts=window.thabatTs;window.thabatTs=function(id,kind,val){const r=_ts&&_ts(id,kind,val);if(kind==='ok'||kind==='err'||kind==='stop')setTimeout(()=>{try{tswPump()}catch(e){}},800);return r}}
/* «مصاحفي»: the switch at the top, and «waiting for Wi-Fi» on queued mushafs */
{const _m=tsMinePaint;tsMinePaint=async function(...a){const r=await _m(...a);try{if(!andTs())return r;const L_=$('#tsmList');if(!L_)return r;
  if(!$('#tswRow')){L_.insertAdjacentHTML('beforebegin',`<div class="field" id="tswRow"><div><label>${esc(t('tsw.opt'))}</label><small>${esc(t('tsw.optS'))}</small></div><button class="sw-toggle" id="tswT" role="switch"></button></div>`);
    const b=$('#tswT'),paint=()=>{const on=!!dkqOpt().wifi;b.classList.toggle('on',on);b.setAttribute('aria-checked',on)};paint();b.onclick=()=>{dkqOptSet('wifi',!dkqOpt().wifi);paint();tswNet()}}
  TSW.q.forEach(id=>{const sp=L_.querySelector(`[data-tsdp="${id}"]`);if(!sp)return;sp.textContent=t('tsw.queued');sp.className='';const row=sp.closest('.tsmr'),g=row&&row.querySelector(`[data-tsdg="${id}"]`);
    if(g){g.outerHTML=`<button class="btn sm ghost" data-tswx="${id}">${esc(t('tsw.cancel'))}</button>`;row.querySelector('[data-tswx]').onclick=()=>{TSW.q=TSW.q.filter(x=>x!==id);tswSave();tsMinePaint()}}})}catch(e){console.error(e)}return r}}
