/* ============ v3.93.0: the phone keeps a Taysir mushaf itself (sixth list 3; shell 40, bridge 10: TsDl.java) ============ */
/* The Android app downloads the PDF into its own private files (only the 18 fixed names on www.alwa7y.com), and the page reads
   byte ranges from it through the bridge (base64), so a mushaf on the phone works without the PC or the internet. */
const andTs=()=>ANDROID&&andV()>=10&&!!(window.ThabatAndroid&&window.ThabatAndroid.tsState);
function tsDevState(){if(!andTs())return{};try{return JSON.parse(window.ThabatAndroid.tsState())||{}}catch(e){return{}}}
function tsB64(s){const b=atob(s),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u}
/* the phone's copy first; else the PC as before */
{const _d=tsDoc;tsDoc=function(id){if(TSR.doc[id])return TSR.doc[id];const ds=tsDevState()[id];if(!ds||ds.s!=='ok')return _d(id);
  TSR.doc[id]=(async()=>{const L=await bkLoadLib(),tr=new L.PDFDataRangeTransport(ds.n,null);
    tr.requestDataRange=(a,z)=>setTimeout(()=>{try{const s=window.ThabatAndroid.tsRead(id,a,z-a);if(s)tr.onDataRange(a,tsB64(s))}catch(e){}},0);
    const doc=await L.getDocument(bkDocOpts({range:tr,rangeChunkSize:262144})).promise;
    let mem={};try{mem=JSON.parse(localStorage.getItem('thabat.tsOff')||'{}')}catch(e){}
    if(mem[id]&&mem[id].n===ds.n)TSR.off[id]=mem[id].o;else{const has=async(n,v)=>{try{return(await (await doc.getPage(n)).getTextContent()).items.some(i=>i.str.trim()===String(v))}catch(e){return false}};
      let o=4;for(let n=1;n<=16&&n<doc.numPages;n++){if(await has(n,1)&&await has(n+1,2)){o=n-1;break}}TSR.off[id]=o;mem[id]={n:ds.n,o};try{localStorage.setItem('thabat.tsOff',JSON.stringify(mem))}catch(e){}}
    return doc})();
  TSR.doc[id].catch(()=>{delete TSR.doc[id]});return TSR.doc[id]}}
/* the box shown instead of a page: on the phone, also «download it to this phone» */
{const _f=tsFailBox;tsFailBox=function(im,p,r,code){const R=RIWAYAT[r];_f(im,p,r,code);if(!andTs()||!R||!R.ts)return;
  $$('.tsfail:not([data-tsid])').forEach(d=>{d.dataset.tsid=R.ts;const ds=tsDevState()[R.ts]||{};
    if(ds.s==='run'){const sp=d.querySelector('span');if(sp)sp.textContent=t('tsd.run',ds.len?Math.floor(ds.got/ds.len*100):0);d.querySelectorAll('button').forEach(b=>b.remove());return}
    d.insertAdjacentHTML('beforeend',`<button class="btn sm pri" data-tsdev="${R.ts}">${esc(t('tsd.get',R.mb))}</button>`);
    d.querySelector('[data-tsdev]').onclick=e=>{e.currentTarget.disabled=true;tsDevGet(R.ts)}})}}
function tsDevGet(id){try{window.ThabatAndroid.tsGet(id);toast(t('tsd.start'))}catch(e){}setTimeout(()=>{$$(`.tsfail[data-tsid="${id}"] span`).forEach(s=>s.textContent=t('tsd.run',0));if($('#tsmList'))tsMinePaint()},300)}
window.thabatTs=function(id,kind,val){try{
  if(kind==='p'){$$(`.tsfail[data-tsid="${id}"] span`).forEach(s=>s.textContent=t('tsd.run',val));const c=$(`#tsmList [data-tsdp="${id}"]`);if(c)c.textContent=t('tsd.run',val);return}
  if(kind==='ok'){delete TSR.doc[id];toast(t('tsd.ok'));const R=RIWAYAT[S.quran.riwaya];if(R&&R.ts===id&&curView()==='quran')renderQuran()}
  if(kind==='err')toast(t(val==='busy'?'tsd.busy':'tsd.err'));
  if($('#tsmList'))tsMinePaint()}catch(e){}};
/* «مصاحفي»: a third line for the file on this phone */
{const _m=tsMinePaint;tsMinePaint=async function(...a){const res=await _m(...a);try{if(!andTs())return res;const dev=tsDevState(),rows=$$('#tsmList .tsmr');
  TS18.forEach(([id,ar,en,mb],i)=>{const row=rows[i];if(!row||row.querySelector('[data-tsdp]'))return;const s=dev[id]||{s:'none'};
    const txt=s.s==='ok'?t('tsd.have',Math.round(s.n/1e6)):s.s==='run'?t('tsd.run',s.len?Math.floor(s.got/s.len*100):0):t('tsd.none',mb);
    row.querySelector('.tsmst').insertAdjacentHTML('beforeend',`<span>${esc(t('tsd.file'))}</span><span data-tsdp="${id}" class="${s.s==='ok'?'tsmok':s.s==='run'?'':'muted'}">${esc(txt)}</span>`);
    const b=row.querySelector('.tsmb');if(s.s==='ok'){const sv=b.querySelector('[data-tsma="save"]');if(sv)sv.remove()}
    if(s.s==='ok')b.insertAdjacentHTML('beforeend',`<button class="btn sm ghost dng" data-tsdd="${id}">${esc(t('tsd.del'))}</button>`);
    else if(s.s==='run')b.insertAdjacentHTML('beforeend',`<button class="btn sm ghost" data-tsds="${id}">${esc(t('tsm.stop'))}</button>`);
    else b.insertAdjacentHTML('beforeend',`<button class="btn sm" data-tsdg="${id}">${esc(t('tsd.get',mb))}</button>`)});
  $$('#tsmList [data-tsdg]').forEach(x=>x.onclick=()=>{x.disabled=true;tsDevGet(x.dataset.tsdg)});
  $$('#tsmList [data-tsds]').forEach(x=>x.onclick=()=>{try{window.ThabatAndroid.tsStop(x.dataset.tsds)}catch(e){}setTimeout(tsMinePaint,600)});
  $$('#tsmList [data-tsdd]').forEach(x=>x.onclick=()=>{if(!confirm(t('tsd.delQ')))return;try{window.ThabatAndroid.tsDel(x.dataset.tsdd)}catch(e){}delete TSR.doc[x.dataset.tsdd];tsMinePaint()})}catch(e){console.error(e)}return res}}
/* with the whole file on the phone, pages are drawn from it each time instead of being stored a second time as pictures */
{const _c=tsCache;tsCache=async function(r,p){const R=RIWAYAT[r],ds=R&&tsDevState()[R.ts];if(!ds||ds.s!=='ok')return _c(r,p);try{const have=await idbGet(qImgKey(r,p));if(have)return have}catch(e){}return tsPage(R.ts,p)}}

