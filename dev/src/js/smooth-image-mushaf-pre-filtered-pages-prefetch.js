/* ============ smooth image mushaf: pre-filtered pages, prefetch, keep screen on ============ */
const QPRE=new Map();
function qFilterOf(im){try{const f=getComputedStyle(im).filter;return f&&f!=='none'?f:''}catch(e){return''}}
function qPreproc(im,key,f,src,tries){src=src||im;if(!im.isConnected||!src.naturalWidth||im.classList.contains('pre'))return;{const cf=qFilterOf(im);if(cf!==f){if(!cf)return;key=key.split(':').slice(0,2).join(':')+':'+cf;f=cf}}try{const sc=Math.min(1,1200/src.naturalWidth),c=document.createElement('canvas');c.width=Math.round(src.naturalWidth*sc);c.height=Math.round(src.naturalHeight*sc);const x=c.getContext('2d');if(!('filter' in x))return;x.filter=f;x.drawImage(src,0,0,c.width,c.height);
  c.toBlob(b=>{if(!b)return;const u=URL.createObjectURL(b);QPRE.set(key,u);if(QPRE.size>24){const k0=QPRE.keys().next().value;URL.revokeObjectURL(QPRE.get(k0));QPRE.delete(k0)}if(im.isConnected&&!im.classList.contains('pre')){im.classList.add('pre');im.dataset.pf=f;im.src=u}},'image/webp',0.92)}catch(e){/* first load from the internet can't be read back: use the saved copy once it exists */const [r,p]=key.split(':');if((tries||0)<4)setTimeout(async()=>{try{const b=await idbGet(qImgKey(r,+p));if(!b){qPreproc(im,key,f,null,(tries||0)+1);return}const u=typeof b==='string'?b:URL.createObjectURL(b),t2=new Image();t2.onload=()=>{qPreproc(im,key,f,t2,9);if(typeof b!=='string')setTimeout(()=>URL.revokeObjectURL(u),3000)};t2.src=u}catch(x){}},1500)}}
{const _ql=qLoadImg;qLoadImg=function(im,p,r){im.decoding='async';const f=qFilterOf(im),key=r+':'+p+':'+f;
  if(f&&QPRE.has(key)){im.classList.add('pre');im.dataset.pf=f;im.src=QPRE.get(key);return}
  _ql(im,p,r);if(!f)return;const h=()=>{if(im.classList.contains('pre'))return;im.removeEventListener('load',h);(window.requestIdleCallback||(g=>setTimeout(g,60)))(()=>qPreproc(im,key,f),{timeout:900})};im.addEventListener('load',h)}}
function qPrefetch(np,dir){const r=S.quran.riwaya,R=RIWAYAT[r];if(!R||R.kind!=='img'||!R.cache||!R.remote)return;(window.requestIdleCallback||(g=>setTimeout(g,300)))(()=>{[np+2*(dir||1),np+3*(dir||1)].filter(p=>p>=1&&p<=604).forEach(p=>{const t0=new Image();t0.src=R.local+pad3(p)+R.ext;t0.onerror=()=>qCacheImg(r,p)})},{timeout:2000})}
/* keep the screen awake while reading full screen */
let QWL=null;
async function qWake(on){try{if(on&&!QWL&&navigator.wakeLock){QWL=await navigator.wakeLock.request('screen');QWL.addEventListener('release',()=>{QWL=null})}else if(!on&&QWL){await QWL.release();QWL=null}}catch(e){}}
{const _qf=qFs;qFs=function(on){_qf(on);if(!ANDROID)qWake(on)}}
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&document.documentElement.classList.contains('qfs')&&!ANDROID)qWake(true)});
