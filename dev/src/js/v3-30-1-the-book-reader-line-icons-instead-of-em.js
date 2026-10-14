/* ============ v3.30.1: the book reader — line icons instead of emoji (each button shows its current state), undo for highlights, and night reading that finds pictures by their pixels too (scanned books, images the PDF draws in pieces) ============ */
const BKI={x:'<path d="M6 6l12 12M18 6L6 18"/>',minus:'<path d="M5 12h14"/>',plus:'<path d="M12 5v14M5 12h14"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"/>',
  moon:'<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  paper:'<path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4M9 11h7M9 14.5h7M9 18h4"/>',
  pen:'<path d="M15 4l5 5-9.5 9.5H5.5v-5z"/><path d="M13 6l5 5M4 21h16"/>',
  mark:'<path d="M7 3h10v18l-5-4-5 4z"/>',note:'<path d="M5 4h14v12l-4 4H5z"/><path d="M15 20v-4h4M8.5 9h7M8.5 12.5h5"/>',
  search:'<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',list:'<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="18" r="1"/>',
  more:'<circle cx="5.5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="18.5" cy="12" r="1.3"/>',
  undo:'<path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  book:'<path d="M12 6.5C10 5 7 4.5 3.5 5v13c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5c-3.5-.5-6.5 0-8.5 1.5z"/><path d="M12 6.5v13"/>',
  scroll:'<rect x="6" y="2.5" width="12" height="8" rx="1.5"/><rect x="6" y="13.5" width="12" height="8" rx="1.5"/>',
  left:'<path d="M15 5l-7 7 7 7"/>',right:'<path d="M9 5l7 7-7 7"/>'};
function bkIco(k){return`<svg class="bkico" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${BKI[k]||''}</svg>`}
function bkSetIco(id,k,title){const b=$('#'+id);if(!b)return;b.innerHTML=bkIco(k);if(title){b.title=title;b.setAttribute('aria-label',title)}}
/* each button shows what is on now: the light (day / paper / night) and the layout (pages / scroll) */
function bkIcons(){bkSetIco('bkX','x');bkSetIco('bkZo','minus',t('bk2.zoomOut'));bkSetIco('bkZi','plus',t('bk2.zoomIn'));
  const n=BK.night;bkSetIco('bkNi',n==='night'?'moon':n==='sepia'?'paper':'sun',t(n==='night'?'bk3.lNight':n==='sepia'?'bk3.lPaper':'bk3.lDay')+' — '+t('bk3.tapNext',bkNiNext()));
  bkSetIco('bkHl','pen',t('bk.hl'));bkSetIco('bkBm','mark',t('bk.bm'));bkSetIco('bkNt','note',t('bk.note'));bkSetIco('bkSr','search',t('bkx.t'));bkSetIco('bkLs','list',t('bk.list'));bkSetIco('bk2More','more',t('bk2.menu'));
  const f=bkMode()==='flip';bkSetIco('bk2Md',f?'book':'scroll',t(f?'bk3.mFlip':'bk3.mScroll')+' — '+t(f?'bk2.toScroll':'bk2.toFlip'));bkSetIco('bk2Pv','left');bkSetIco('bk2Nx','right');
  const ni=$('#bkNi');if(ni)ni.classList.toggle('on',!!n)}
{hookFn('bkModeBtn',()=>bkModeBtn,f=>{bkModeBtn=f},'post',function(...a){try{bkIcons()}catch(e){}})}
/* highlights: every change can be undone (the bar button, the floating bar while highlighting, Ctrl+Z) */
const BKH={snap:{},undo:[]};
{const _d=bkDrawHl;bkDrawHl=function(n,...a){try{const r=BKS()[BK.key];if(r){const cur=JSON.stringify(r.hl[n]||[]),k=BK.key+'|'+n;if(BKH.snap[k]!=null&&BKH.snap[k]!==cur&&!BKH.busy){BKH.undo.push({key:BK.key,n,prev:BKH.snap[k]});if(BKH.undo.length>80)BKH.undo.shift()}BKH.snap[k]=cur}}catch(e){}const r=_d(n,...a);bkHlBar();return r}}
function bkHlUndo(){const u=BKH.undo.pop();if(!u||u.key!==BK.key){if(u)BKH.undo.length=0;toast(t('bk3.noUndo'));bkHlBar();return}const r=BKS()[BK.key],prev=JSON.parse(u.prev);if(prev.length)r.hl[u.n]=prev;else delete r.hl[u.n];save();BKH.busy=1;bkDrawHl(u.n);BKH.busy=0;BKH.snap[BK.key+'|'+u.n]=u.prev;
  if(bkMode()==='flip'&&!bkPair(BK.cur).includes(u.n))bkGoPage(u.n);bkHlBar();toast(t('bk3.undone'))}
function bkHlBar(){const ov=$('#bkReader');if(!ov||!BK.doc)return;let b=$('#bk3Hl');if(!BK.hl){if(b)b.remove();return}
  if(!b){ov.insertAdjacentHTML('beforeend',`<div class="bk3hl" id="bk3Hl" role="toolbar"><span>${bkIco('pen')}<b>${t('bk3.hlOn')}</b></span><button class="bk3b" id="bk3Un">${bkIco('undo')}<span>${t('bk3.undo')}</span></button><button class="bk3b pri" id="bk3Dn">${bkIco('check')}<span>${t('bk3.done')}</span></button></div>`);b=$('#bk3Hl');
    $('#bk3Un').onclick=bkHlUndo;$('#bk3Dn').onclick=()=>{const h=$('#bkHl');if(h&&BK.hl)h.click()}}
  const can=BKH.undo.some(u=>u.key===BK.key);$('#bk3Un').disabled=!can}
document.addEventListener('keydown',e=>{if(BK.doc&&$('#bkReader.on')&&(e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'&&!/INPUT|TEXTAREA/.test(e.target.tagName)){e.preventDefault();e.stopPropagation();bkHlUndo()}},true);
/* night: besides the image boxes the PDF reports, tiles of the page that look like a photo (many mid tones or strong colours, little white paper) keep their colours; this also covers scanned books */
function bkPhotoTiles(c){const W=c.width,H=c.height;if(W<50||H<50)return{};let d;try{d=c.getContext('2d').getImageData(0,0,W,H).data}catch(e){return{}}
  const T=Math.max(14,Math.round(Math.min(W,H)/48)),gw=Math.ceil(W/T),gh=Math.ceil(H/T),ph=new Uint8Array(gw*gh),st=Math.max(2,Math.round(T/9));
  for(let ty=0;ty<gh;ty++)for(let tx=0;tx<gw;tx++){let n=0,mid=0,col=0,white=0;const x1=Math.min(W,(tx+1)*T),y1=Math.min(H,(ty+1)*T);
    for(let y=ty*T;y<y1;y+=st)for(let x=tx*T;x<x1;x+=st){const i=(y*W+x)*4,r=d[i],g=d[i+1],b=d[i+2],mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(r*3+g*6+b)/10;n++;if(l>225&&mx-mn<25)white++;else{if(mx-mn>55&&l>35)col++;if(l>55&&l<200)mid++}}
    ph[ty*gw+tx]=n&&white/n<.45&&(mid+col)/n>.42?1:0}
  /* keep tiles with photo neighbours (lines of text alone do not pass), fill small holes inside a picture, then the ring around it is decided pixel by pixel */
  const keep=new Uint8Array(gw*gh),at=(x,y)=>x>=0&&y>=0&&x<gw&&y<gh;for(let y=0;y<gh;y++)for(let x=0;x<gw;x++){if(!ph[y*gw+x])continue;let k=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if((dx||dy)&&at(x+dx,y+dy)&&ph[(y+dy)*gw+x+dx])k++}if(k>=3)keep[y*gw+x]=1}
  for(let pass=0;pass<2;pass++){for(let y=0;y<gh;y++){let last=-1;for(let x=0;x<gw;x++)if(keep[y*gw+x]){if(last>=0&&x-last>1&&x-last<=4)for(let z=last+1;z<x;z++)keep[y*gw+z]=1;last=x}}
    for(let x=0;x<gw;x++){let last=-1;for(let y=0;y<gh;y++)if(keep[y*gw+x]){if(last>=0&&y-last>1&&y-last<=4)for(let z=last+1;z<y;z++)keep[z*gw+x]=1;last=y}}}
  const core=[],ring=[];for(let y=0;y<gh;y++){let x=0;while(x<gw){if(!keep[y*gw+x]){x++;continue}let x2=x;while(x2+1<gw&&keep[y*gw+x2+1])x2++;core.push([x*T,y*T,Math.min(W,(x2+1)*T),Math.min(H,(y+1)*T)]);x=x2+1}}
  for(let y=0;y<gh;y++)for(let x=0;x<gw;x++){if(keep[y*gw+x])continue;let near=false;for(let dy=-1;dy<=1&&!near;dy++)for(let dx=-1;dx<=1&&!near;dx++)if(at(x+dx,y+dy)&&keep[(y+dy)*gw+x+dx])near=true;if(near)ring.push([x*T,y*T,Math.min(W,(x+1)*T),Math.min(H,(y+1)*T)])}
  return{core,ring}}
/* the ring tiles: the picture's own pixels go back, the paper around it stays dark */
function bkRingPaint(x,o,ring){const ox=o.getContext('2d');ring.forEach(r=>{const w=r[2]-r[0],h=r[3]-r[1];if(w<1||h<1)return;let a,b;try{a=x.getImageData(r[0],r[1],w,h);b=ox.getImageData(r[0],r[1],w,h)}catch(e){return}const A=a.data,B=b.data;
  for(let i=0;i<A.length;i+=4){const R=B[i],G=B[i+1],Bl=B[i+2],mx=Math.max(R,G,Bl),mn=Math.min(R,G,Bl),l=(R*3+G*6+Bl)/10;if(l<212||mx-mn>28){A[i]=R*.86;A[i+1]=G*.86;A[i+2]=Bl*.86}}x.putImageData(a,r[0],r[1])})}
bkNightPaint=async function(c,pg,vp){try{if(typeof bkxLoad==='function'){await bkxLoad();await bkxIsScanned()}}catch(e){}
  const scan=typeof BKX!=='undefined'&&!!BKX.scanned,W=c.width,H=c.height,x=c.getContext('2d');
  let rects=(await bkImgRects(pg,vp)).map(r=>[Math.max(0,r[0]),Math.max(0,r[1]),Math.min(W,r[2]),Math.min(H,r[3])]).filter(r=>r[2]-r[0]>6&&r[3]-r[1]>6);
  /* a page-sized image is the scan itself: look inside it instead of keeping it whole */
  const big=r=>(r[2]-r[0])*(r[3]-r[1])>W*H*.55;if(scan||rects.some(big))rects=rects.filter(r=>!big(r));
  const PT=bkPhotoTiles(c);rects=rects.concat(PT.core||[]);
  const o=document.createElement('canvas');o.width=W;o.height=H;o.getContext('2d').drawImage(c,0,0);
  x.save();x.globalCompositeOperation='difference';x.fillStyle=scan?'#dedad2':'#e4e1da';x.fillRect(0,0,W,H);x.globalCompositeOperation='hue';x.drawImage(o,0,0);x.globalCompositeOperation='source-over';
  if(rects.length){try{x.filter='brightness(.86)'}catch(e){}rects.forEach(r=>{const w=r[2]-r[0],h=r[3]-r[1];if(w>0&&h>0)x.drawImage(o,r[0],r[1],w,h,r[0],r[1],w,h)})}
  x.restore();if(PT.ring&&PT.ring.length)bkRingPaint(x,o,PT.ring);o.width=o.height=0};
/* after the reader is built: icons, the highlight bar, the night button repaints its icon */
{const _b=bkBuild;bkBuild=async function(...a){const r=await _b(...a);try{bkIcons();const ni=$('#bkNi');if(ni)ni.addEventListener('click',()=>setTimeout(bkIcons,0));const hl=$('#bkHl');if(hl)hl.addEventListener('click',()=>setTimeout(bkHlBar,0))}catch(e){console.error(e)}return r}}
{hookFn('bkClose',()=>bkClose,f=>{bkClose=f},'pre',function(...a){const b=$('#bk3Hl');if(b)b.remove()})}
