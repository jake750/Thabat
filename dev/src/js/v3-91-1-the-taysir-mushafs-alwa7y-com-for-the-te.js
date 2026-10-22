/* ============ v3.91.1: the Taysir mushafs (alwa7y.com) for the ten readings, in place of the Islamweb scans (his pick «ب») ============ */
/* Their site gives one PDF per reading or riwaya (~80–100 MB) and does not let a page read it, so the library server on the PC keeps
   a copy (/tsr/get → %LOCALAPPDATA%\Thabat\tayseer\) and serves it with Range (/tsr?id=, token). A page is drawn from the PDF with
   pdf.js, kept as a picture in IDB qimg:<riwaya>:<page> (so pages already seen, or «download the whole mushaf», work without the PC). */
/* the archive's page images cannot be read by fetch (no CORS), so a copy for this device is taken from its IIIF server (3.91.0) */
function iwIiif(item){return p=>'https://iiif.archive.org/iiif/'+item+'$'+(p-1)+'/full/1000,/0/default.jpg'}
RIWAYAT.khalaf.fetchUrl=iwIiif('20201025_20201025_0144');
const TS18=[['kaloon','قالون عن نافع','Qalun ʿan Nafiʿ',86],['warsh','ورش عن نافع','Warsh ʿan Nafiʿ',92],['asbhany','ورش من طريق الأصبهاني','Warsh via al-Asbahani',104],
  ['kathir','قراءة ابن كثير (البزّي وقنبل)','Ibn Kathir (al-Bazzi, Qunbul)',89],['dory','الدوري عن أبي عمرو','al-Duri ʿan Abi ʿAmr',95],['sosy','السوسي عن أبي عمرو','al-Susi ʿan Abi ʿAmr',94],
  ['hesham','هشام عن ابن عامر','Hisham ʿan Ibn ʿAmir',98],['thakwan','ابن ذكوان عن ابن عامر','Ibn Dhakwan ʿan Ibn ʿAmir',99],['asem','قراءة عاصم (شعبة وحفص)','ʿAsim (Shuʿba, Hafs)',84],
  ['hafs','حفص عن عاصم','Hafs ʿan ʿAsim',80],['hafskasr','حفص بقصر المنفصل','Hafs, short separated madd',82],['khalaf','خلف عن حمزة','Khalaf ʿan Hamza',99],
  ['khalaft','خلف عن حمزة من طريق الطيّبة','Khalaf ʿan Hamza via the Tayyibah',94],['khallad','خلّاد عن حمزة','Khallad ʿan Hamza',100],['kesay','قراءة الكسائي (أبو الحارث والدوري)','al-Kisaʾi (Abu al-Harith, al-Duri)',89],
  ['jafar','قراءة أبي جعفر (ابن وردان وابن جمّاز)','Abu Jaʿfar (Ibn Wardan, Ibn Jammaz)',88],['yakob','قراءة يعقوب (رويس وروح)','Yaʿqub (Ruways, Rawh)',93],['khalaf10','قراءة خلف العاشر (إسحاق وإدريس)','Khalaf al-ʿAshir (Ishaq, Idris)',87]];
TS18.forEach(([id,ar,en,mb])=>{RIWAYAT['ts_'+id]={ar:ar+' · التيسير',en:en+' · Taysir',kind:'img',ts:id,mb,cache:true,local:'mushaf/ts-'+id+'/',ext:'.jpg',remote:()=>'data:,'}});
/* which riwayat each Taysir mushaf covers (for the «your own scans» chooser) */
const TS_COV={qaloon:'kaloon',warsh:'warsh',bazzi:'kathir',qumbul:'kathir',doori:'dory',soosi:'sosy',hisham:'hesham',dhakwan:'thakwan',shouba:'asem',hafs:'hafs',
  khalaf:'khalaf',khallad:'khallad',harith:'kesay',doorik:'kesay',wardan:'jafar',jammaz:'jafar',ruways:'yakob',rawh:'yakob',ishaq:'khalaf10',idris:'khalaf10'};
/* 3.91.0's Islamweb choices move to the Taysir mushaf of the same riwaya; their saved pictures are dropped */
{const mv=r=>typeof r==='string'&&r.startsWith('iw_')?('ts_'+(TS_COV[r.slice(3)]||'hafs')):r;const Q=S.quran||{};let ch=false;
  if(mv(Q.riwaya)!==Q.riwaya){Q.riwaya=mv(Q.riwaya);ch=true}(Q.bms||[]).forEach(b=>{if(mv(b.r)!==b.r){b.r=mv(b.r);ch=true}});if(Q.dl)Object.keys(Q.dl).forEach(k=>{if(k.startsWith('iw_')){delete Q.dl[k];ch=true}});
  if(ch)try{save()}catch(e){}
  setTimeout(async()=>{try{if(localStorage.getItem('thabat.iwGone'))return;const ks=await idbKeys();for(const k of ks)if(String(k).startsWith('qimg:iw_'))await idbDel(k);localStorage.setItem('thabat.iwGone','1')}catch(e){}},20000)}
qRiwOptions=function(){const g=(lab,ks)=>ks.length?`<optgroup label="${esc(lab)}">${ks.map(k=>`<option value="${k}">${esc(riwName(k))}</option>`).join('')}</optgroup>`:'';const K=Object.keys(RIWAYAT);
  return g(t('rw.text'),K.filter(k=>RIWAYAT[k].kind==='text'))+g(t('ts.grp'),K.filter(k=>RIWAYAT[k].ts))+g(t('rw.img'),K.filter(k=>RIWAYAT[k].kind==='img'&&!RIWAYAT[k].custom&&!RIWAYAT[k].ts))+g(t('rw.mine'),K.filter(k=>RIWAYAT[k].custom))};
const TSR={doc:{},off:{},st:null,stAt:0,poll:null,fail:{}};
/* the PC's copies: {id:{s:'ok'|'run'|'none'|'err', n, got, len}} */
async function tsList(force){if(!force&&TSR.st&&Date.now()-TSR.stAt<15000)return TSR.st;if(!LIB.base){try{await libConnect()}catch(e){}}if(!LIB.base)throw Object.assign(new Error('off'),{code:'off'});
  const r=await libFetch(libU('/tsr/list'),6000).catch(()=>null);if(!r||!r.ok)throw Object.assign(new Error('old'),{code:r&&r.status===404?'old':'off'});TSR.st=(await r.json()).ts||{};TSR.stAt=Date.now();return TSR.st}
function tsDoc(id){if(TSR.doc[id])return TSR.doc[id];
  TSR.doc[id]=(async()=>{const st=(await tsList())[id]||{s:'none'};if(st.s!=='ok')throw Object.assign(new Error(st.s),{code:st.s});
    const L=await bkLoadLib(),url=libU('/tsr?id='+id),tr=new L.PDFDataRangeTransport(st.n,null);
    const get=(a,z,n)=>libFetch(url,90000,{headers:{Range:`bytes=${a}-${z-1}`}}).then(r=>{if(r.status!==206&&r.status!==200)throw new Error('http');return r.arrayBuffer()}).then(b=>{const u=new Uint8Array(b);tr.onDataRange(a,u.length>z-a?u.subarray(a,z):u)}).catch(()=>{if(n<2)setTimeout(()=>get(a,z,n+1),800)});
    tr.requestDataRange=(a,z)=>get(a,z,0);const doc=await L.getDocument(bkDocOpts({range:tr,rangeChunkSize:262144})).promise;
    /* where page 1 of the mushaf sits in the PDF (the cover and introductions come first): the first page whose printed number is 1,
       followed by a page numbered 2; kept per file size, so a new edition is measured again */
    let mem={};try{mem=JSON.parse(localStorage.getItem('thabat.tsOff')||'{}')}catch(e){}
    if(mem[id]&&mem[id].n===st.n)TSR.off[id]=mem[id].o;else{const has=async(n,v)=>{try{return(await (await doc.getPage(n)).getTextContent()).items.some(i=>i.str.trim()===String(v))}catch(e){return false}};
      let o=4;for(let n=1;n<=16&&n<doc.numPages;n++){if(await has(n,1)&&await has(n+1,2)){o=n-1;break}}TSR.off[id]=o;mem[id]={n:st.n,o};try{localStorage.setItem('thabat.tsOff',JSON.stringify(mem))}catch(e){}}
    return doc})();
  TSR.doc[id].catch(()=>{delete TSR.doc[id]});return TSR.doc[id]}
/* one mushaf page as a JPEG blob */
async function tsPage(id,p){const doc=await tsDoc(id),pg=await doc.getPage(Math.min(doc.numPages,p+(TSR.off[id]||0))),v=pg.getViewport({scale:1}),w=MOB.matches?1100:1300,vp=pg.getViewport({scale:w/v.width});
  const c=document.createElement('canvas');c.width=Math.round(vp.width);c.height=Math.round(vp.height);const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);
  await pg.render({canvasContext:x,viewport:vp}).promise;const b=await new Promise(z=>c.toBlob(z,'image/jpeg',.84));c.width=c.height=0;return b}
async function tsCache(r,p){const k=qImgKey(r,p);try{const have=await idbGet(k);if(have)return have}catch(e){}const b=await tsPage(RIWAYAT[r].ts,p);try{await idbSet(k,b)}catch(e){}return b}
{const _c=qCacheImg;qCacheImg=async function(r,p){const R=RIWAYAT[r];if(!R||!R.ts)return _c(r,p);try{await tsCache(r,p);return true}catch(e){return false}}}
{const _p=qPrefetch;qPrefetch=function(np,dir){const r=S.quran.riwaya,R=RIWAYAT[r];if(!R||!R.ts)return _p(np,dir);
  (window.requestIdleCallback||(g=>setTimeout(g,600)))(()=>{[np+(dir||1),np+2*(dir||1)].filter(p=>p>=1&&p<=604).forEach(p=>{tsCache(r,p).catch(()=>{})})})}}
/* the page: the saved picture, else drawn from the PDF; when the PC has no copy yet, a box with what to do */
{const _l=qLoadImg;qLoadImg=function(im,p,r){const R=RIWAYAT[r];if(!R||!R.ts)return _l(im,p,r);im.onerror=null;
  tsCache(r,p).then(b=>{im.src=typeof b==='string'?b:URL.createObjectURL(b)}).catch(e=>tsFailBox(im,p,r,e&&e.code||'off'))}}
function tsFailBox(im,p,r,code){const R=RIWAYAT[r],d=document.createElement('div');d.className='fail tsfail';d.dir=LANG==='ar'?'rtl':'ltr';
  const st=TSR.st&&TSR.st[R.ts]||{};const mb=R.mb;
  let msg,btn='';
  if(code==='run'){const pc=st.len?Math.floor(st.got/st.len*100):0;msg=t('ts.run',pc);tsPollStart()}
  else if(code==='none'||code==='err'){msg=(code==='err'?t('ts.err')+' ':'')+t('ts.none',mb);btn=`<button class="btn sm" data-tsget="${R.ts}">${esc(t('ts.get'))}</button>`}
  else if(code==='old'){msg=t('ts.old')}
  else{msg=MAC&&!LIB.base?t('ts.mac'):t('ts.off');btn=`<button class="btn sm ghost" data-tsre="1">${esc(t('ts.retry'))}</button>`}
  d.innerHTML=`<b>${esc(riwName(r))}</b><span>${esc(msg)}</span>${btn}`;im.replaceWith(d);
  const g=d.querySelector('[data-tsget]');if(g)g.onclick=async()=>{g.disabled=true;try{const res=await libFetch(libU('/tsr/get?id='+R.ts),8000);if(res.status===429){toast(t('ts.busy'));g.disabled=false;return}TSR.stAt=0;tsPollStart();renderQuran()}catch(e){toast(t('ts.off'));g.disabled=false}};
  const re=d.querySelector('[data-tsre]');if(re)re.onclick=async()=>{re.disabled=true;TSR.stAt=0;try{await libConnect()}catch(e){}renderQuran()}}
/* while the PC fetches a copy: refresh the progress every 3 s, then draw the pages */
function tsPollStart(){if(TSR.poll)return;TSR.poll=setInterval(async()=>{const R=RIWAYAT[S.quran.riwaya];if(!R||!R.ts||curView()!=='quran'){clearInterval(TSR.poll);TSR.poll=null;return}
  try{const st=(await tsList(true))[R.ts]||{};if(st.s==='run'){const pc=st.len?Math.floor(st.got/st.len*100):0;$$('.tsfail span').forEach(e=>e.textContent=t('ts.run',pc))}else{clearInterval(TSR.poll);TSR.poll=null;delete TSR.doc[R.ts];renderQuran()}}catch(e){}},3000)}
/* the first time: what these mushafs are and where they come from */
{hookFn('qSetRiwaya',()=>qSetRiwaya,f=>{qSetRiwaya=f},'post',function(r){try{if(RIWAYAT[r]&&RIWAYAT[r].ts&&!localStorage.getItem('thabat.tsTold')){localStorage.setItem('thabat.tsTold','1');
  openInfo(t('ts.t'),`<p>${esc(t('ts.p1'))}</p><p>${esc(t('ts.p2'))}</p><p class="muted">${esc(t('ts.p3'))} <a href="https://www.alwa7y.com/downloads/" target="_blank" rel="noopener">alwa7y.com</a></p>`)}}catch(e){}})}
/* the «your own scans» chooser marks the riwayat a Taysir mushaf already covers */
{const _o=openCustomMushaf;openCustomMushaf=function(...a){const r=_o.apply(this,a);try{$$('#infoBox option[value], .modal.on option[value]').forEach(o=>{if(TS_COV[o.value]&&!o.disabled&&!/✓$/.test(o.textContent)){o.textContent+=' · '+t('ts.has')}})}catch(e){}return r}}
try{const q=$('#qRiw');if(q){q.innerHTML=qRiwOptions();q.value=S.quran.riwaya}}catch(e){}

