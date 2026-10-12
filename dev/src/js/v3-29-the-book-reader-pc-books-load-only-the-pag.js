/* ============ v3.29: the book reader — PC books load only the pages being read, covers from the first page, pinch / Ctrl+wheel zoom, a page-turn mode (two pages side by side on a wide screen), a night mode that keeps pictures as they are, finished books, progress, hiding and deleting ============ */
/* synced: S.lib.bk[key].done (time finished), .dir ('rtl'|'ltr', page-turn direction), S.lib.bkMode ('scroll'|'flip'), S.lib.bkSpread (false = one page), S.lib.bkHide {key:1} (PC books hidden from the shelf; the files stay on the PC)
   device only: covers in IndexedDB 'bcov:<key>' (a small JPEG of page 1) */
const BK2={q:new Set(),act:0,tasks:new Map(),cov:{},covQ:[],covRun:false,fail:{},wheelT:0,rrT:0,filter:'all'};
function bkMode(){return LIBS().bkMode==='flip'?'flip':'scroll'}
function bkHid(){const L_=LIBS();return L_.bkHide||(L_.bkHide={})}
/* where the PDF comes from: a book on this device from IndexedDB; a PC book through range requests (only the parts a page needs), else in one piece */
async function bkSource(b,L){
  if(b.local){const data=await idbGet('book:'+b.id);if(!data)throw new Error('gone');return{data:new Uint8Array(data)}}
  if(!LIB.base){try{await libConnect()}catch(e){}}if(!LIB.base)throw new Error('off');
  const url=libU('/f?id='+b.id),len=+b.s||0;
  if(len>0&&L.PDFDataRangeTransport){const tr=new L.PDFDataRangeTransport(len,null);
    const get=(a,z,tries)=>libFetch(url,90000,{headers:{Range:`bytes=${a}-${z-1}`}}).then(r=>{if(r.status!==206&&r.status!==200)throw new Error('http');return r.arrayBuffer()}).then(buf=>{const u=new Uint8Array(buf);tr.onDataRange(a,u.length>z-a?u.subarray(a,z):u)}).catch(e=>{if(tries<2)setTimeout(()=>get(a,z,tries+1),800);else toast(t('lb.netErr'))});
    tr.requestDataRange=(a,z)=>get(a,z,0);return{range:tr,rangeChunkSize:262144}}
  const r=await libFetch(url,300000);if(!r.ok)throw new Error('gone');return{data:new Uint8Array(await r.arrayBuffer())}}
function bkDocOpts(src){return{...src,isEvalSupported:false,enableXfa:false,disableAutoFetch:true,disableStream:true,standardFontDataUrl:'pdfjs/standard_fonts/'}}
bkOpen=async function(b){let ov=$('#bkReader');if(!ov){ov=document.createElement('div');ov.id='bkReader';ov.className='bkr';document.body.append(ov)}
  ov.innerHTML=`<div class="bkload">⏳ ${t('bk.opening')}</div>`;ov.classList.add('on');document.documentElement.classList.add('bkr-on');
  try{const L=await bkLoadLib(),src=await bkSource(b,L),doc=await L.getDocument(bkDocOpts(src)).promise;if(!$('#bkReader.on')){try{doc.destroy()}catch(e){}return}
    BK2.q.clear();BK2.tasks.clear();BK2.act=0;
    const st=BKS(),r=st[b.key]||(st[b.key]={});r.t=b.n;r.n=doc.numPages;r.at=Date.now();r.bm=r.bm||[];r.hl=r.hl||{};r.nt=r.nt||{};
    Object.assign(BK,{key:b.key,doc,title:b.n,zoom:1,hl:false,read:0,lastAct:Date.now(),rendered:new Set(),cur:Math.min(doc.numPages,r.pg||1),dir:r.dir||''});
    BK.night=LIBS().bkNight===true?'night':(LIBS().bkNight||'');bkBuild(ov,r.pg||1);clearInterval(BK.tick);BK.tick=setInterval(bkTick,15000)}
  catch(e){console.warn(e);ov.innerHTML=`<div class="bkload">⚠ ${t(e.message==='off'?'lb.off':e.message==='gone'?'lb.gone':'bk.fail')}<br><button class="btn sm" id="bkX0">${t('cancel')}</button></div>`;$('#bkX0').onclick=bkClose}}
/* the page direction: Arabic text → pages turn to the left side like a printed Arabic book */
async function bkDirOf(){const r=BKS()[BK.key];if(r&&r.dir)return r.dir;let ar=0,la=0;const doc=BK.doc;
  for(let n=1;n<=Math.min(4,doc.numPages);n++){try{const tc=await(await doc.getPage(n)).getTextContent();tc.items.forEach(i=>{const s=i.str||'';ar+=(s.match(/[؀-ۿ]/g)||[]).length;la+=(s.match(/[A-Za-z]/g)||[]).length})}catch(e){}}
  return ar>la?'rtl':la>ar?'ltr':(LANG==='ar'?'rtl':'ltr')}
/* rendering: a queue, nearest page first, two at a time; a new canvas replaces the old one when ready (no blank flash while zooming) */
bkRender=function(n){if(!BK.doc||BK.rendered.has(n)||!BK.pages[n-1])return;if(bkMode()==='flip'&&Math.abs(n-BK.cur)>3)return;BK2.q.add(n);bkPump()};
function bkPump(){while(BK2.act<2&&BK2.q.size){let best=null,bd=1e9;BK2.q.forEach(n=>{const d=Math.abs(n-BK.cur)+(n<BK.cur?.5:0);if(d<bd){bd=d;best=n}});BK2.q.delete(best);if(!BK.doc||BK.rendered.has(best))continue;BK2.act++;bkDraw(best).finally(()=>{BK2.act=Math.max(0,BK2.act-1);bkPump()})}}
async function bkDraw(n){const el=BK.pages[n-1],doc=BK.doc,key=BK.key;if(!el||!doc)return;BK.rendered.add(n);
  try{const pg=await doc.getPage(n);if(doc!==BK.doc||!BK.rendered.has(n))return;
    const dpr=Math.min(2,window.devicePixelRatio||1),v1=pg.getViewport({scale:1}),w=parseFloat(el.style.width)||BK.w||600;let sc=w*dpr/v1.width;const mx=14e6;if(v1.width*v1.height*sc*sc>mx)sc=Math.sqrt(mx/(v1.width*v1.height));
    const vp=pg.getViewport({scale:sc}),c=document.createElement('canvas');c.width=Math.floor(vp.width);c.height=Math.floor(vp.height);
    const task=pg.render({canvasContext:c.getContext('2d',{alpha:false}),viewport:vp});BK2.tasks.set(n,task);await task.promise;BK2.tasks.delete(n);
    if(n===1&&BK2.cov[key]==null)bkCovFromCanvas(key,c);
    if(BK.night==='night'){await bkNightPaint(c,pg,vp);c.dataset.n='1'}
    if(doc!==BK.doc||!BK.rendered.has(n)){c.width=c.height=0;return}
    const old=el.querySelector('canvas');if(old){old.replaceWith(c);old.width=old.height=0}else el.prepend(c);el.classList.add('ok')}
  catch(e){BK2.tasks.delete(n);BK.rendered.delete(n)}}
bkFree=function(n,force){BK2.q.delete(n);const el=BK.pages[n-1];if(!el||!BK.rendered.has(n))return;if(!force&&BK.rendered.size<10)return;
  const tk=BK2.tasks.get(n);if(tk){try{tk.cancel()}catch(e){}BK2.tasks.delete(n)}BK.rendered.delete(n);
  /* a forced free (zoom, night) keeps the old picture until the new one is drawn, except far pages */
  if(!force||Math.abs(n-BK.cur)>3){const c=el.querySelector('canvas');if(c){c.width=c.height=0}el.classList.remove('ok')}};
function bkRerender(){[...BK.rendered].forEach(n=>bkFree(n,true));if(bkMode()==='flip'){bkFlipShow();return}const v=$('#bkV');if(!v)return;const vr=v.getBoundingClientRect();BK.pages.forEach(p=>{const r=p.getBoundingClientRect();if(r.bottom>vr.top-900&&r.top<vr.bottom+900)bkRender(+p.dataset.p)})}
/* layout: scroll = a column of pages; flip = one page (or two side by side) fitted to the screen */
function bkSpread(){const v=$('#bkV');return bkMode()==='flip'&&LIBS().bkSpread!==false&&!!v&&v.clientWidth>=900&&v.clientWidth>v.clientHeight*1.15}
bkLayout=function(){const v=$('#bkV');if(!v||!BK.ratio)return;const flip=bkMode()==='flip';v.classList.toggle('flip',flip);let w;
  if(!flip)w=Math.min(v.clientWidth-16,900)*BK.zoom;else{const sp=bkSpread(),aw=v.clientWidth-(MOB.matches?26:110),ah=v.clientHeight-(MOB.matches?44:60);w=Math.min(sp?(aw-14)/2:aw,ah/BK.ratio)*BK.zoom}
  BK.w=w;BK.pages.forEach(p=>{p.style.width=w+'px';p.style.height=(w*BK.ratio)+'px'});if(flip)bkFlipShow()};
function bkPair(n){if(!bkSpread())return[n];const a=n<=1?1:(n%2===0?n:n-1);return a===1?[1]:[a,a+1].filter(x=>x<=BK.pages.length)}
function bkFlipShow(){const v=$('#bkV'),ps=$('#bkPs');if(!v||!ps||bkMode()!=='flip')return;const vis=bkPair(BK.cur);ps.dir=BK.dir||'rtl';
  BK.pages.forEach((p,i)=>p.classList.toggle('fon',vis.includes(i+1)));vis.forEach(n=>bkRender(n));
  const last=vis[vis.length-1];[...bkPair(Math.min(BK.pages.length,last+1)),...bkPair(Math.max(1,vis[0]-1))].forEach(n=>bkRender(n));
  [...BK.rendered].forEach(n=>{if(Math.abs(n-BK.cur)>5)bkFree(n,false)});bkTrack()}
bkTrack=function(){const v=$('#bkV');if(!v||!BK.pages.length)return;let cur=BK.cur||1;
  if(bkMode()!=='flip'){const mid=v.scrollTop+v.clientHeight*0.35;cur=1;for(const p of BK.pages){if(p.offsetTop<=mid)cur=+p.dataset.p;else break}BK.cur=cur}
  const r=BKS()[BK.key],N=BK.pages.length,vis=bkMode()==='flip'?bkPair(cur):[cur],far=vis[vis.length-1];
  if(r&&r.pg!==far){r.pg=far;r.at=Date.now();if(far>=N&&!r.done&&N>1)bkAskDone();clearTimeout(bkTrack._s);bkTrack._s=setTimeout(save,1500)}
  const lab=$('#bkPg');if(lab)lab.textContent=`${t('bk.pages',vis.join('–'),N)} · ${r&&r.done?'✓':Math.round(far/N*100)+'%'}${r&&r.bm.includes(cur)?' · 🔖':''}${r&&r.nt[cur]?' · 📝':''}`;
  const bm=$('#bkBm');if(bm)bm.classList.toggle('on',!!(r&&r.bm.includes(cur)));const sl=$('#bk2Sl');if(sl&&document.activeElement!==sl)sl.value=cur;const sn=$('#bk2SlN');if(sn)sn.textContent=cur};
function bkGoPage(n){const N=BK.pages.length;n=Math.max(1,Math.min(N,Math.round(+n)||1));const v=$('#bkV');if(!v)return;if(bkMode()==='flip'){BK.cur=n;bkFlipShow();return}const el=BK.pages[n-1];if(el){v.scrollTop=el.offsetTop-8;BK.cur=n;bkTrack()}}
function bkStep(d){const v=$('#bkV');if(!v||!BK.doc)return;if(bkMode()!=='flip'){v.scrollBy({top:d*v.clientHeight*.9,behavior:'smooth'});return}
  const vis=bkPair(BK.cur),n=d>0?vis[vis.length-1]+1:bkPair(Math.max(1,vis[0]-1))[0];if(n<1||n>BK.pages.length||vis.includes(n))return;
  const ps=$('#bkPs');if(ps&&!document.documentElement.classList.contains('lite')){const fwd=(d>0)===((BK.dir||'rtl')==='rtl');ps.style.setProperty('--bkdx',(fwd?-1:1)*28+'px');ps.classList.remove('bkturn');void ps.offsetWidth;ps.classList.add('bkturn')}
  BK.lastAct=Date.now();bkGoPage(n);if(BK.zoom>1.01)v.scrollTop=0}
/* zoom with the anchor under the finger / pointer kept in place */
function bkZoomTo(z,cx,cy){const v=$('#bkV');if(!v||!BK.doc)return;z=Math.max(.5,Math.min(4,Math.round(z*100)/100));if(Math.abs(z-BK.zoom)<.005)return;const vr=v.getBoundingClientRect();if(cx==null){cx=vr.left+vr.width/2;cy=vr.top+vr.height/2}
  const ox=v.scrollLeft+(cx-vr.left),oy=v.scrollTop+(cy-vr.top),f=z/BK.zoom;BK.zoom=z;bkLayout();v.scrollLeft=ox*f-(cx-vr.left);v.scrollTop=oy*f-(cy-vr.top);
  bkZoomLab();clearTimeout(BK2.rrT);BK2.rrT=setTimeout(bkRerender,160)}
bkZoom=function(f){bkZoomTo(BK.zoom*f)};
function bkZoomLab(){const b=$('#bk2Z');if(b)b.textContent=Math.round(BK.zoom*100)+'%';const v=$('#bkV');if(v)v.classList.toggle('zoomed',BK.zoom>1.01)}
/* night: the page is inverted to light text on dark paper with the colours' hue kept, then the pictures are drawn back as they were (a little dimmer); scanned books are inverted whole */
async function bkImgRects(pg,vp){const L=window.pdfjsLib||window['pdfjs-dist/build/pdf'];if(!L)return[];const O=L.OPS,U=L.Util;let ops;try{ops=await pg.getOperatorList()}catch(e){return[]}
  let m=[1,0,0,1,0,0];const st=[],out=[],img=new Set([O.paintImageXObject,O.paintInlineImageXObject,O.paintJpegXObject,O.paintImageXObjectRepeat].filter(x=>x!=null));
  for(let i=0;i<ops.fnArray.length;i++){const f=ops.fnArray[i],a=ops.argsArray[i];
    if(f===O.save)st.push(m);else if(f===O.restore)m=st.pop()||m;else if(f===O.transform)m=U.transform(m,a);
    else if(f===O.paintFormXObjectBegin){st.push(m);if(a&&a[0])m=U.transform(m,a[0])}else if(f===O.paintFormXObjectEnd)m=st.pop()||m;
    else if(img.has(f)){const T=U.transform(vp.transform,m),pts=[[0,0],[1,0],[0,1],[1,1]].map(p=>U.applyTransform(p,T)),xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]);out.push([Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)])}}
  return out}
async function bkNightPaint(c,pg,vp){try{if(typeof bkxLoad==='function'){await bkxLoad();await bkxIsScanned()}}catch(e){}
  const scan=typeof BKX!=='undefined'&&!!BKX.scanned,W=c.width,H=c.height,x=c.getContext('2d');
  let rects=scan?[]:await bkImgRects(pg,vp);rects=rects.map(r=>[Math.max(0,r[0]),Math.max(0,r[1]),Math.min(W,r[2]),Math.min(H,r[3])]).filter(r=>r[2]-r[0]>6&&r[3]-r[1]>6);
  const o=document.createElement('canvas');o.width=W;o.height=H;o.getContext('2d').drawImage(c,0,0);
  x.save();x.globalCompositeOperation='difference';x.fillStyle=scan?'#dedad2':'#e4e1da';x.fillRect(0,0,W,H);x.globalCompositeOperation='hue';x.drawImage(o,0,0);x.globalCompositeOperation='source-over';
  if(rects.length){try{x.filter='brightness(.84)'}catch(e){}rects.forEach(r=>{const w=r[2]-r[0],h=r[3]-r[1];x.drawImage(o,r[0],r[1],w,h,r[0],r[1],w,h)})}
  x.restore();o.width=o.height=0}
/* finishing a book */
function bkSetDone(key,on){const r=BKS()[key]||(BKS()[key]={});if(on){r.done=Date.now();if(r.n)r.pg=r.n}else delete r.done;r.at=Date.now();save();if(BK.key===key)bkTrack();if(curView()==='lib'&&!BK.doc)renderLib();if(on){toast('✓ '+t('bk2.doneT',r.t||''));}}
function bkAskDone(){const key=BK.key;if(!key||bkAskDone._k===key)return;bkAskDone._k=key;toastAct(t('bk2.lastPage'),'✓ '+t('bk2.done'),()=>bkSetDone(key,true),10000)}
function bkSetProgress(key){const r=BKS()[key]||{},N=r.n||0,v=prompt(N?t('bk2.progQ',N):t('bk2.progQ0'),N?String(r.pg||1):'');if(v==null)return;const s=v.trim();let pg=null;
  if(/%$/.test(s)||(!N&&s)){const p=parseFloat(s);if(isFinite(p)&&N)pg=Math.round(Math.max(0,Math.min(100,p))/100*N);else if(isFinite(p)&&!N){toast(t('bk2.openFirst'));return}}else{const n=parseInt(s,10);if(isFinite(n))pg=n}
  if(pg==null||!N){toast(t('bk2.progBad'));return}pg=Math.max(1,Math.min(N,pg));const st=BKS()[key]||(BKS()[key]={});st.pg=pg;st.at=Date.now();if(pg>=N)st.done=st.done||Date.now();else delete st.done;save();if(BK.key===key)bkGoPage(pg);else renderLib();toast(t('bk2.progSet',Math.round(pg/N*100)))}
bkPct=function(key){const r=BKS()[key];if(!r)return 0;if(r.done)return 100;return r.n?Math.round((r.pg||1)/r.n*100):0};
/* covers: page 1 drawn small, kept on this device */
function bkCovPut(key,u){BK2.cov[key]=u;$$(`[data-book="${CSS.escape(key)}"] .bkcv`).forEach(cv=>{if(cv.querySelector('img'))return;const i=cv.querySelector('i');if(i)i.remove();cv.insertAdjacentHTML('afterbegin',`<img src="${u}" alt="" loading="lazy">`);cv.classList.add('has')})}
function bkCovFromCanvas(key,c){try{const w=300,h=Math.round(c.height*w/c.width),o=document.createElement('canvas');o.width=w;o.height=h;const x=o.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,w,h);x.drawImage(c,0,0,w,h);const u=o.toDataURL('image/jpeg',.72);o.width=o.height=0;BK2.cov[key]=u;idbSet('bcov:'+key,u).catch(()=>{})}catch(e){}}
async function bkCovGet(key){if(BK2.cov[key]!==undefined)return BK2.cov[key];try{BK2.cov[key]=(await idbGet('bcov:'+key))||null}catch(e){BK2.cov[key]=null}return BK2.cov[key]}
function bkCovers(){const cards=$$('#libBox [data-book]');if(!cards.length)return;cards.forEach(async c=>{const key=c.dataset.book;const u=await bkCovGet(key);if(u)bkCovPut(key,u);else if(!BK2.fail[key]&&!BK2.covQ.includes(key)){BK2.covQ.push(key);bkCovPump()}})}
async function bkCovPump(){if(BK2.covRun)return;BK2.covRun=true;try{while(BK2.covQ.length){if(curView()!=='lib')break;if(BK.doc){await sleepMs(2000);continue}const key=BK2.covQ.shift();if(BK2.cov[key])continue;
    try{const u=await bkCovMake(key);if(u){BK2.cov[key]=u;await idbSet('bcov:'+key,u).catch(()=>{});bkCovPut(key,u)}else BK2.fail[key]=1}catch(e){BK2.fail[key]=1}await sleepMs(120)}}finally{BK2.covRun=false}}
async function bkCovMake(key){const b=bkAll().find(x=>x.key===key);if(!b||(!b.local&&!LIB.base))return null;const L=await bkLoadLib(),doc=await L.getDocument(bkDocOpts(await bkSource(b,L))).promise;
  try{const pg=await doc.getPage(1),v1=pg.getViewport({scale:1}),vp=pg.getViewport({scale:300/v1.width}),c=document.createElement('canvas');c.width=Math.round(vp.width);c.height=Math.round(vp.height);const x=c.getContext('2d',{alpha:false});x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);
    await pg.render({canvasContext:x,viewport:vp}).promise;const u=c.toDataURL('image/jpeg',.72);c.width=c.height=0;return u}finally{try{doc.destroy()}catch(e){}}}
/* the book card (shelf, folders) and its «⋯» menu */
function bkCard(b,rm){const r=BKS()[b.key]||{},pct=bkPct(b.key),cov=BK2.cov[b.key];
  return`<div class="bkc${r.done?' bkdone':''}" data-book="${esc(b.key)}"><span class="bkcv${cov?' has':''}">${cov?`<img src="${cov}" alt="" loading="lazy">`:'<i>📖</i>'}${r.done?`<em class="bk2ok">✓ ${t('bk2.doneS')}</em>`:pct?`<em>${pct}%</em>`:''}</span><b dir="auto">${esc(b.n)}</b><small>${b.local?'📱 '+t('bk.onDevice'):'💻 '+esc(b.ch||'')}${r.n?' · '+t('bk.pages',r.pg||1,r.n):''}</small><span class="lbpb"><i style="width:${pct}%"></i></span>
    <span class="bkacts"><button class="lshm" data-bkm="${esc(b.key)}" title="${esc(t('bk2.menu'))}" aria-label="${esc(t('bk2.menu'))}">⋯</button>${rm?`<button class="lshm" data-lxrm="${esc(b.key)}" title="${esc(t('lx.rm'))}" aria-label="${esc(t('lx.rm'))}">✕</button>`:''}</span></div>`}
function bkMenu(anchor,key){const b=bkAll().find(x=>x.key===key);if(!b)return;const r=BKS()[key]||{},hid=!!bkHid()[key];
  const p=lshMenu(anchor,`<div class="aymh" dir="auto">📖 ${esc(b.n)}</div><button data-a="open">📖 ${t(r.pg>1?'bk2.cont':'bk.read')}</button><button data-a="done">${r.done?'↺ '+t('bk2.undone'):'✓ '+t('bk2.done')}</button><button data-a="prog">📊 ${t('bk2.prog')}</button>
    ${b.local?'':`<button data-a="keep">⤓ ${t('bk.keep')}</button>`}<button data-a="cov">🖼 ${t('bk2.cov')}</button>${b.local?`<button data-a="del" class="dng">🗑 ${t('bk2.del')}</button>`:`<button data-a="hide">${hid?'👁 '+t('bk2.show'):'🙈 '+t('bk2.hide')}</button>`}`);
  p.querySelectorAll('[data-a]').forEach(x=>x.onclick=()=>{closePP();const a=x.dataset.a;
    if(a==='open')bkOpen(b);else if(a==='done')bkSetDone(key,!r.done);else if(a==='prog')bkSetProgress(key);else if(a==='keep')bkKeep(b);
    else if(a==='cov'){delete BK2.cov[key];delete BK2.fail[key];idbSet('bcov:'+key,null).catch(()=>{});BK2.covQ.unshift(key);renderLib();bkCovPump()}
    else if(a==='del')bkRemove(b);
    else if(a==='hide'){const H=bkHid();if(hid)delete H[key];else H[key]=1;save();renderLib();if(!hid)toastAct(t('bk2.hidden'),t('lsh.undo'),()=>{delete bkHid()[key];save();renderLib()})}})}
bkRemove=async function(b){if(!confirm(t('bk2.delQ',b.n)))return;bkLocalSave(bkLocal().filter(x=>x.id!==b.id));try{await idbSet('book:'+b.id,null);await idbSet('bcov:'+b.key,null)}catch(e){}delete BK2.cov[b.key];
  const L_=LIBS();(L_.shelf||[]).forEach(f=>{if(f.items)f.items=f.items.filter(z=>!(z.t==='b'&&z.id===b.key))});save();toast(t('bk2.deleted'));renderLib()};
/* the shelf: filters, finished books last, hidden PC books apart */
bkShelfHTML=function(){const H=bkHid(),st=BKS(),all=bkAll(),hidN=all.filter(b=>H[b.key]).length,F=BK2.filter;
  let list=all.filter(b=>F==='hid'?H[b.key]:!H[b.key]);if(F==='read')list=list.filter(b=>!(st[b.key]||{}).done&&((st[b.key]||{}).pg||0)>0);else if(F==='done')list=list.filter(b=>(st[b.key]||{}).done);
  const at=b=>(st[b.key]||{}).at||0;list.sort((a,b)=>(!!(st[a.key]||{}).done-!!(st[b.key]||{}).done)||at(b)-at(a));
  const doneN=all.filter(b=>!H[b.key]&&(st[b.key]||{}).done).length,chip=(k,l)=>`<button class="bk2f${F===k?' on':''}" data-bkf="${k}">${l}</button>`;
  return`<div class="lshh"><h4 class="lbfh">📚 ${t('bk.books')}</h4><button class="btn sm" id="bkAddB">＋ ${t('bk.add')}</button></div>
    ${all.length?`<div class="bk2fs">${chip('all',t('bk2.fAll'))}${chip('read',t('bk2.fRead'))}${chip('done',t('bk2.fDone',doneN))}${hidN?chip('hid',t('bk2.fHid',hidN)):''}</div>`:''}
    ${list.length?`<div class="bkgrid">${list.slice(0,LIBX.allBooks?999:8).map(b=>bkCard(b)).join('')}</div>${list.length>8&&!LIBX.allBooks?`<button class="btn sm ghost" id="bkMore">${t('bk.more',list.length-8)}</button>`:''}`:`<p class="muted lshhint">${all.length?t('bk2.fNone'):t('bk.empty')}</p>`}`};
bkBind=function(root){if(!root)return;const all=bkAll(),find=k=>all.find(b=>b.key===k);
  const a=$('#bkAddB');if(a)a.onclick=bkAdd;const m=$('#bkMore');if(m)m.onclick=()=>{LIBX.allBooks=1;renderLib()};
  root.querySelectorAll('[data-bkf]').forEach(x=>x.onclick=()=>{BK2.filter=x.dataset.bkf;renderLib()});
  root.querySelectorAll('[data-book]').forEach(c=>c.onclick=e=>{if(e.target.closest('[data-bkm],[data-lxrm]'))return;const b=find(c.dataset.book);if(b)bkOpen(b)});
  root.querySelectorAll('[data-bkm]').forEach(x=>x.onclick=e=>{e.stopPropagation();bkMenu(x,x.dataset.bkm)})};
{const _rl=renderLib;renderLib=function(...a){const r=_rl(...a);try{setTimeout(bkCovers,50)}catch(e){}return r}}
/* the reader: new buttons, gestures and keys */
{const _b=bkBuild;bkBuild=async function(ov,startPg,...x){const r=await _b(ov,startPg,...x);try{const v=$('#bkV');if(!v)return r;v.classList.add('nx');
  BK.dir=await bkDirOf();const st=BKS()[BK.key];if(st&&!st.dir)st.dir=BK.dir;
  const zo=$('#bkZo');if(zo&&!$('#bk2Z'))zo.insertAdjacentHTML('afterend',`<button class="bkb bk2z" id="bk2Z" title="${esc(t('bk2.zoomReset'))}">100%</button>`);
  const ni=$('#bkNi');if(ni&&!$('#bk2Md')){ni.insertAdjacentHTML('beforebegin',`<button class="bkb" id="bk2Md"></button>`);ni.addEventListener('click',()=>setTimeout(bkRerender,0))}
  const ls=$('#bkLs');if(ls&&!$('#bk2More'))ls.insertAdjacentHTML('afterend',`<button class="bkb" id="bk2More" title="${esc(t('bk2.menu'))}" aria-label="${esc(t('bk2.menu'))}">⋯</button>`);
  const N=BK.pages.length;ov.insertAdjacentHTML('beforeend',`<button class="bk2nav prev" id="bk2Pv" aria-label="‹"></button><button class="bk2nav next" id="bk2Nx" aria-label="›"></button><div class="bk2sl"><input type="range" id="bk2Sl" min="1" max="${N}" value="${BK.cur||1}" aria-label="${esc(t('bk.goto'))}" dir="${BK.dir==='rtl'?'rtl':'ltr'}"><b id="bk2SlN">${BK.cur||1}</b></div>`);
  $('#bk2Z').onclick=()=>bkZoomTo(1);$('#bk2Md').onclick=()=>bkSetMode(bkMode()==='flip'?'scroll':'flip');$('#bk2More').onclick=e=>bkReaderMenu(e.currentTarget);
  $('#bk2Pv').onclick=()=>bkStep((BK.dir||'rtl')==='rtl'?1:-1);$('#bk2Nx').onclick=()=>bkStep((BK.dir||'rtl')==='rtl'?-1:1);
  const sl=$('#bk2Sl');sl.oninput=()=>{$('#bk2SlN').textContent=sl.value};sl.onchange=()=>bkGoPage(+sl.value);
  bkModeBtn();bkGestures(v);bkLayout();bkZoomLab();bkGoPage(startPg||BK.cur||1)}catch(e){console.error(e)}return r}}
function bkModeBtn(){const b=$('#bk2Md');if(!b)return;const f=bkMode()==='flip';b.textContent=f?'📜':'📖';b.title=t(f?'bk2.toScroll':'bk2.toFlip');b.setAttribute('aria-label',b.title);const nv=$$('.bk2nav');nv.forEach(x=>x.hidden=!f);const ar=(BK.dir||'rtl')==='rtl';const pv=$('#bk2Pv'),nx=$('#bk2Nx');if(pv)pv.textContent='‹';if(nx)nx.textContent='›';if(pv)pv.title=t(ar?'bk2.next':'bk2.prev');if(nx)nx.title=t(ar?'bk2.prev':'bk2.next')}
function bkSetMode(m){const cur=BK.cur||1;LIBS().bkMode=m;save();BK.zoom=1;[...BK.rendered].forEach(n=>bkFree(n,true));bkLayout();bkModeBtn();bkZoomLab();bkGoPage(cur);if(m==='scroll')bkRerender();toast(t(m==='flip'?'bk2.flipOn':'bk2.scrollOn'))}
function bkReaderMenu(anchor){const r=BKS()[BK.key]||{},f=bkMode()==='flip',mob=MOB.matches;
  const p=lshMenu(anchor,`${mob?`<button data-a="zi">＋ ${t('bk2.zoomIn')}</button><button data-a="zo">－ ${t('bk2.zoomOut')}</button><button data-a="hl">🖍 ${t('bk.hl')}</button><button data-a="nt">📝 ${t('bk.note')}</button>`:''}
    <button data-a="done">${r.done?'↺ '+t('bk2.undone'):'✓ '+t('bk2.done')}</button><button data-a="prog">📊 ${t('bk2.prog')}</button>
    <button data-a="mode">${f?'📜 '+t('bk2.toScroll'):'📖 '+t('bk2.toFlip')}</button>${f&&!mob?`<button data-a="sp">${LIBS().bkSpread===false?'📖 '+t('bk2.spOn'):'📄 '+t('bk2.spOff')}</button>`:''}
    <button data-a="dir">⇄ ${t(BK.dir==='rtl'?'bk2.dirLtr':'bk2.dirRtl')}</button>`);
  p.querySelectorAll('[data-a]').forEach(x=>x.onclick=()=>{closePP();const a=x.dataset.a;
    if(a==='zi')bkZoomTo(BK.zoom*1.25);else if(a==='zo')bkZoomTo(BK.zoom/1.25);else if(a==='hl')$('#bkHl').click();else if(a==='nt')$('#bkNt').click();
    else if(a==='done')bkSetDone(BK.key,!r.done);else if(a==='prog')bkSetProgress(BK.key);else if(a==='mode')bkSetMode(f?'scroll':'flip');
    else if(a==='sp'){LIBS().bkSpread=LIBS().bkSpread===false?true:false;save();BK.rendered.forEach(n=>bkFree(n,true));bkLayout()}
    else if(a==='dir'){BK.dir=BK.dir==='rtl'?'ltr':'rtl';const s=BKS()[BK.key];if(s)s.dir=BK.dir;save();const sl=$('#bk2Sl');if(sl)sl.dir=BK.dir;bkModeBtn();bkFlipShow()}})}
function bkGestures(v){let T=null,tap=0;
  v.addEventListener('wheel',e=>{if(e.ctrlKey||e.metaKey){e.preventDefault();bkZoomTo(BK.zoom*Math.exp(-e.deltaY*.0022),e.clientX,e.clientY);return}
    if(bkMode()==='flip'&&BK.zoom<=1.01&&Math.abs(e.deltaY)>Math.abs(e.deltaX)){e.preventDefault();const now=Date.now();if(now-BK2.wheelT<380)return;BK2.wheelT=now;bkStep(e.deltaY>0?1:-1)}},{passive:false});
  v.addEventListener('touchstart',e=>{if(BK.hl)return;if(e.touches.length===2){const[a,b]=e.touches;T={pinch:1,d0:Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY),cx:(a.clientX+b.clientX)/2,cy:(a.clientY+b.clientY)/2,s:1};const ps=$('#bkPs'),pr=ps.getBoundingClientRect();ps.style.transformOrigin=`${T.cx-pr.left}px ${T.cy-pr.top}px`}
    else if(e.touches.length===1)T={x:e.touches[0].clientX,y:e.touches[0].clientY,t:Date.now()}},{passive:true});
  v.addEventListener('touchmove',e=>{if(!T||!T.pinch||e.touches.length!==2)return;e.preventDefault();const[a,b]=e.touches;T.s=Math.max(.5/BK.zoom,Math.min(4/BK.zoom,Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY)/T.d0));$('#bkPs').style.transform=`scale(${T.s})`},{passive:false});
  v.addEventListener('touchend',e=>{if(!T)return;const ps=$('#bkPs');
    if(T.pinch){if(e.touches.length)return;ps.style.transform='';ps.style.transformOrigin='';const s=T.s,cx=T.cx,cy=T.cy;T=null;if(Math.abs(s-1)>.03)bkZoomTo(BK.zoom*s,cx,cy);return}
    const c=e.changedTouches[0],dx=c.clientX-T.x,dy=c.clientY-T.y,dt=Date.now()-T.t;T=null;
    if(bkMode()==='flip'&&BK.zoom<=1.01&&Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)*1.4&&dt<700){bkStep(((BK.dir||'rtl')==='rtl')===(dx>0)?1:-1);tap=0;return}
    if(Math.abs(dx)<10&&Math.abs(dy)<10&&dt<300){const now=Date.now(),vr=v.getBoundingClientRect(),fx=(c.clientX-vr.left)/vr.width;
      if(fx>.3&&fx<.7&&now-tap<320){tap=0;bkZoomTo(BK.zoom>1.05?1:2,c.clientX,c.clientY);return}tap=now}});
  v.addEventListener('click',e=>{if(bkMode()!=='flip'||BK.hl||BK.zoom>1.01||e.target.closest('button,.bkhl i'))return;const vr=v.getBoundingClientRect(),fx=(e.clientX-vr.left)/vr.width;if(fx<.28)bkStep((BK.dir||'rtl')==='rtl'?1:-1);else if(fx>.72)bkStep((BK.dir||'rtl')==='rtl'?-1:1)})}
addEventListener('keydown',e=>{if(!BK.doc||!$('#bkReader.on')||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;const k=e.key,rtl=(BK.dir||'rtl')==='rtl';
  if((e.ctrlKey||e.metaKey)&&(k==='='||k==='+'||k==='-'||k==='0')){e.preventDefault();e.stopPropagation();bkZoomTo(k==='0'?1:BK.zoom*(k==='-'?1/1.2:1.2));return}
  if(bkMode()!=='flip')return;let d=0;if(k==='ArrowLeft')d=rtl?1:-1;else if(k==='ArrowRight')d=rtl?-1:1;else if(k==='PageDown'||k===' '||(k==='ArrowDown'&&BK.zoom<=1.01))d=1;else if(k==='PageUp'||(k==='ArrowUp'&&BK.zoom<=1.01))d=-1;else if(k==='Home'){e.preventDefault();e.stopPropagation();bkGoPage(1);return}else if(k==='End'){e.preventDefault();e.stopPropagation();bkGoPage(BK.pages.length);return}
  if(d){e.preventDefault();e.stopPropagation();bkStep(d)}},true);
{const _c=bkClose;bkClose=function(...a){BK2.q.clear();BK2.tasks.forEach(tk=>{try{tk.cancel()}catch(e){}});BK2.tasks.clear();BK2.act=0;bkAskDone._k=null;return _c(...a)}}

