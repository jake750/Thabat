/* ============ v3.46 library and books: picture preview on the timeline, lesson and course lengths, phone swipes on the video, the book's outline, trimming white margins, turning a page ============ */
/* 104: a picture of the moment under the pointer on the timeline (a hidden second video seeks there; frames are kept per 5 s) */
const LPVT={v:null,id:null,q:null,busy:false,cache:new Map()};
function lpvtFrame(sec){const k=Math.round(sec/5)*5;if(LPVT.cache.has(k))return Promise.resolve(LPVT.cache.get(k));LPVT.q=k;if(LPVT.busy)return Promise.resolve(null);LPVT.busy=true;
  return new Promise(res=>{const v=LPVT.v;if(!v){LPVT.busy=false;return res(null)}const go=t=>{const done=()=>{v.removeEventListener('seeked',done);clearTimeout(tm);try{const c=document.createElement('canvas'),w=176,h=Math.round(w*(v.videoHeight||9)/(v.videoWidth||16));c.width=w;c.height=h;c.getContext('2d').drawImage(v,0,0,w,h);const d=c.toDataURL('image/jpeg',.7);LPVT.cache.set(t,d);if(LPVT.cache.size>160)LPVT.cache.delete(LPVT.cache.keys().next().value)}catch(e){}
      if(LPVT.q!=null&&LPVT.q!==t&&!LPVT.cache.has(LPVT.q)){const n=LPVT.q;go(n)}else{LPVT.busy=false;res(LPVT.cache.get(t)||null);lpvtShow()}};const tm=setTimeout(done,2500);v.addEventListener('seeked',done);try{v.currentTime=Math.max(0,Math.min((v.duration||1e9)-.2,t))}catch(e){done()}};go(k)})}
let LPVT_F=0,LPVT_X=null;
function lpvtShow(){const tl=$('#lpvTl'),box=$('#lpvThumb');if(!tl||!box||LPVT_X==null)return;const v=$('#lvV'),d=v&&v.duration;if(!d||!isFinite(d))return;const sec=LPVT_F*d,k=Math.round(sec/5)*5,im=LPVT.cache.get(k);box.style.left=(LPVT_F*100)+'%';if(im){box.querySelector('img').src=im;box.hidden=false}else lpvtFrame(sec)}
{hookFn('lpvBuild',()=>lpvBuild,f=>{lpvBuild=f},'post',function(id){try{const v=$('#lvV'),tl=$('#lpvTl');if(!v||!tl)return;
  if(LPVT.id!==id){LPVT.cache.clear();LPVT.id=id;if(LPVT.v){LPVT.v.removeAttribute('src');LPVT.v.load()}LPVT.v=null}
  const mk=()=>{if(LPVT.v||!v.currentSrc)return;const h=document.createElement('video');h.muted=true;h.preload='auto';h.playsInline=true;h.crossOrigin='anonymous';h.src=v.currentSrc;LPVT.v=h};
  if(!tl.querySelector('#lpvThumb'))tl.insertAdjacentHTML('beforeend','<span class="lpvthumb" id="lpvThumb" hidden><img alt=""></span>');
  const box=$('#lpvThumb'),at=e=>{const r=tl.getBoundingClientRect();return Math.max(0,Math.min(1,(e.clientX-r.left)/r.width))};
  tl.addEventListener('pointermove',e=>{if(e.pointerType==='touch'&&!tl.classList.contains('drag'))return;mk();LPVT_F=at(e);LPVT_X=1;lpvtShow()});tl.addEventListener('pointerleave',()=>{LPVT_X=null;box.hidden=true});tl.addEventListener('pointerup',e=>{if(e.pointerType==='touch'){LPVT_X=null;box.hidden=true}});
  /* 106: keep this lesson's length */
  const keep=()=>{if(isFinite(v.duration)&&v.duration>0){const D=LIBS().dur||(LIBS().dur={});if(Math.round(D[id]||0)!==Math.round(v.duration)){D[id]=Math.round(v.duration)}}};v.addEventListener('loadedmetadata',keep);
  /* 107: phone swipes on the picture — sideways = seek, up/down on the right = volume, on the left = brightness */
  const vw=$('#libPlayer .lbvw');if(vw&&!vw._g107&&matchMedia('(pointer:coarse)').matches){vw._g107=1;let G=null;
    vw.addEventListener('touchstart',e=>{if(e.touches.length!==1||e.target.closest('.lpvctl,.lpvbig,.lpvspm,.lpvside'))return;const v=$('#lvV');if(!v)return;const t0=e.touches[0],r=vw.getBoundingClientRect();G={v,x:t0.clientX,y:t0.clientY,r,mode:null,t:v.currentTime,vol:v.muted?0:v.volume,br:+(v.dataset.br||1)}},{passive:true});
    vw.addEventListener('touchmove',e=>{if(!G)return;const v=G.v,t1=e.touches[0],dx=t1.clientX-G.x,dy=t1.clientY-G.y;if(!G.mode){if(Math.hypot(dx,dy)<14)return;G.mode=Math.abs(dx)>Math.abs(dy)?'seek':((G.x-G.r.left)/G.r.width>.5?'vol':'br')}
      if(e.cancelable)e.preventDefault();if(G.mode==='seek'){const d=v.duration||0,s=Math.max(0,Math.min(d,G.t+dx/G.r.width*Math.min(180,d*.5)));G.to=s;lpvFlash((s>=G.t?'+':'−')+fmtTC(Math.abs(s-G.t))+'  ·  '+fmtTC(s))}
      else if(G.mode==='vol'){const nv=Math.max(0,Math.min(1,G.vol-dy/(G.r.height*.7)));v.muted=nv===0;v.volume=nv;lpvFlash('🔊 '+Math.round(nv*100)+'%')}
      else{const nb=Math.max(.3,Math.min(1.6,G.br-dy/(G.r.height*.8)));v.dataset.br=nb;v.style.filter=nb===1?'':`brightness(${nb.toFixed(2)})`;lpvFlash('☀ '+Math.round(nb*100)+'%')}},{passive:false});
    vw.addEventListener('touchend',()=>{if(G&&G.mode==='seek'&&G.to!=null)G.v.currentTime=G.to;if(G&&G.mode){vw._gAt=Date.now()}G=null},{passive:true});
    vw.addEventListener('click',e=>{if(Date.now()-(vw._gAt||0)<400){e.stopPropagation();e.preventDefault()}},true)}}catch(e){console.error(e)}})}
/* 106: lengths of lessons not watched yet (read once from the file's header, one at a time) and of the whole course */
const LDUR={q:[],busy:false,dirty:0};
function ldurRun(){if(LDUR.busy||!LDUR.q.length||!LIB.base)return;LDUR.busy=true;const id=LDUR.q.shift(),v=document.createElement('video');v.preload='metadata';v.muted=true;let fin=false;
  const end=d=>{if(fin)return;fin=true;clearTimeout(tm);v.removeAttribute('src');try{v.load()}catch(e){}if(d>0){(LIBS().dur||(LIBS().dur={}))[id]=Math.round(d);LDUR.dirty++;ldurPaint()}LDUR.busy=false;if(LDUR.dirty>=8){LDUR.dirty=0;save()}if(LDUR.q.length)setTimeout(ldurRun,60);else if(LDUR.dirty){LDUR.dirty=0;save()}};
  const tm=setTimeout(()=>end(0),9000);v.onloadedmetadata=()=>end(isFinite(v.duration)?v.duration:0);v.onerror=()=>end(0);v.src=libU('/f?id='+id)}
function ldurOf(id){const L_=LIBS(),p=L_.prog[id];return(p&&p.d)||(L_.dur||{})[id]||0}
function ldurPaint(){const box=$('#libBox');if(!box)return;const rows=[...box.querySelectorAll('.lbl[data-play]')];if(!rows.length)return;let tot=0,left=0,known=0;const L_=LIBS();
  rows.forEach(r=>{const id=r.dataset.play,d=ldurOf(id),p=L_.prog[id]||{};if(d){known++;tot+=d;left+=p.done?0:Math.max(0,d-(p.p||0));const sm=r.querySelector('.lbt small');if(sm&&!(p&&p.d)&&!sm.dataset.dur){sm.dataset.dur=1;sm.innerHTML=sm.innerHTML.replace(/^[^·]*/,fmtTC(d)+' ')}}});
  let bar=$('#ldurBar');if(rows.length<2||!known){if(bar)bar.remove();return}const first=rows[0],host=first.parentElement;if(!bar||bar.parentElement!==host){if(bar)bar.remove();first.insertAdjacentHTML('beforebegin','<div class="ldurbar" id="ldurBar"></div>');bar=$('#ldurBar')}
  bar.innerHTML=`⏱ ${t('ldur.tot',fmtHM(tot*1000))}${known<rows.length?` <small>(${t('ldur.part',known,rows.length)})</small>`:''} · ${t('ldur.left',fmtHM(left*1000))}`}
{hookFn('renderLib',()=>renderLib,f=>{renderLib=f},'post',function(){try{const box=$('#libBox');if(!box||!LIB.base)return;const need=[...box.querySelectorAll('.lbl[data-play]')].map(r=>r.dataset.play).filter(id=>!ldurOf(id)&&!LDUR.q.includes(id));
  const it=id=>{try{const x=libItem(id);return x&&x.k}catch(e){return null}};need.forEach(id=>{const k=it(id);if(k==null||k==='v'||k==='a')LDUR.q.push(id)});ldurPaint();ldurRun()}catch(e){}})}
/* 111: the book's own outline (table of contents) */
async function bkxOutline(){const p=$('#bkPanel');if(!p||!BK.doc)return;let ol=null;try{ol=await BK.doc.getOutline()}catch(e){}
  const flat=[];const walk=(L_,dep)=>(L_||[]).forEach(o=>{flat.push({o,dep});if(dep<4)walk(o.items,dep+1)});walk(ol,0);
  p.innerHTML=`<div class="bkph"><b>${t('bkol.t')}</b><button class="btn sm ghost" id="bkPx">✕</button></div>${flat.length?`<div class="bkol">${flat.slice(0,600).map((x,i)=>`<button class="bkoli" data-oi="${i}" style="padding-inline-start:${10+x.dep*16}px" dir="auto">${esc(x.o.title||'—')}<small data-op="${i}"></small></button>`).join('')}</div>`:`<p class="muted" style="padding:8px">${t('bkol.none')}</p>`}`;p.hidden=false;$('#bkPx').onclick=()=>p.hidden=true;
  const pageOf=async o=>{try{let d=o.dest;if(typeof d==='string')d=await BK.doc.getDestination(d);if(!d||!d[0])return null;return(typeof d[0]==='object'?await BK.doc.getPageIndex(d[0]):+d[0])+1}catch(e){return null}};
  p.querySelectorAll('[data-oi]').forEach(b=>b.onclick=async()=>{const n=await pageOf(flat[+b.dataset.oi].o);if(n){bkGoPage(n);if(MOB.matches)p.hidden=true}else toast(t('bkol.noDest'))});
  for(let i=0;i<Math.min(flat.length,150);i++){const n=await pageOf(flat[i].o);const s=p.querySelector(`[data-op="${i}"]`);if(!s)break;if(n)s.textContent=n}}
/* 119 + 120: trim white margins (per book) and turn a page (per page); both are display only — while highlighting the page shows as it is so new highlights land in the right place */
function bkxRec(){return(BKS()[BK.key]||{})}
function bkxBox(c){try{const W=160,H=Math.max(8,Math.round(W*c.height/c.width)),s=document.createElement('canvas');s.width=W;s.height=H;const x=s.getContext('2d',{willReadFrequently:true});x.drawImage(c,0,0,W,H);const d=x.getImageData(0,0,W,H).data,px=(i,j)=>{const k=(j*W+i)*4;return[d[k],d[k+1],d[k+2]]};
  const corners=[px(1,1),px(W-2,1),px(1,H-2),px(W-2,H-2)],bg=corners.map(c=>c[0]+c[1]+c[2]).sort((a,b)=>a-b)[2];let x0=W,y0=H,x1=-1,y1=-1;
  for(let j=0;j<H;j++)for(let i=0;i<W;i++){const k=(j*W+i)*4;if(Math.abs(d[k]+d[k+1]+d[k+2]-bg)>70){if(i<x0)x0=i;if(i>x1)x1=i;if(j<y0)y0=j;if(j>y1)y1=j}}
  if(x1<0)return null;const pad=.015;return{x:Math.max(0,x0/W-pad),y:Math.max(0,y0/H-pad),w:Math.min(1,(x1-x0+1)/W+2*pad),h:Math.min(1,(y1-y0+1)/H+2*pad)}}catch(e){return null}}
BK.tb=BK.tb||{};
function bkxApply(n){const el=BK.pages&&BK.pages[n-1];if(!el)return;const c=el.querySelector('canvas'),hl=el.querySelector('.bkhl'),r=bkxRec(),rot=((r.rot||{})[n]||0)%360;let tf='',org='';
  if(rot){const ra=el.clientWidth&&el.clientHeight?el.clientHeight/el.clientWidth:(BK.ratio||1.414),s=rot%180?Math.min(ra,1/ra):1;tf=`rotate(${rot}deg) scale(${s.toFixed(4)})`;org='50% 50%'}
  else if(r.trim&&c&&c.width>8){let b=BK.tb[BK.key+':'+n];if(!b){b=bkxBox(c);BK.tb[BK.key+':'+n]=b||{x:0,y:0,w:1,h:1}}if(b&&(b.w<.97||b.h<.97)){const k=Math.min(1/b.w,1/b.h),ox=(1-b.w*k)/2,oy=(1-b.h*k)/2;tf=`translate(${(ox*100).toFixed(2)}%,${(oy*100).toFixed(2)}%) scale(${k.toFixed(4)}) translate(${(-b.x*100).toFixed(2)}%,${(-b.y*100).toFixed(2)}%)`;org='0 0'}}
  [c,hl].forEach(x=>{if(!x)return;x.style.transform=tf;x.style.transformOrigin=org});el.classList.toggle('bkxt',!!tf)}
function bkxApplyAll(){(BK.pages||[]).forEach((el,i)=>{if(el.classList.contains('ok')||el.querySelector('canvas'))bkxApply(i+1)})}
{const _d=bkDraw;bkDraw=async function(n,...a){const r=await _d(n,...a);try{delete BK.tb[BK.key+':'+n];bkxApply(n)}catch(e){}return r}}
function bkxRotate(n){const r=BKS()[BK.key];if(!r)return;r.rot=r.rot||{};r.rot[n]=(((r.rot[n]||0)+90)%360);if(!r.rot[n])delete r.rot[n];save();bkxApply(n);toast(t('bkx2.rotated',n,r.rot[n]||0))}
function bkxTrim(){const r=BKS()[BK.key];if(!r)return;r.trim=!r.trim;if(!r.trim)delete r.trim;save();bkxApplyAll();toast(t(r.trim?'bkx2.trimOn':'bkx2.trimOff'))}
{hookFn('bkReaderMenu',()=>bkReaderMenu,f=>{bkReaderMenu=f},'post',function(){try{const p=$('#ppPop');if(!p||p.querySelector('[data-bkx]'))return;const r=bkxRec(),n=BK.cur||1;
  p.insertAdjacentHTML('beforeend',`<button data-bkx="ol">📑 ${t('bkol.t')}</button><button data-bkx="trim">✂ ${t(r.trim?'bkx2.trimX':'bkx2.trim')}</button><button data-bkx="rot">⟳ ${t('bkx2.rot',n)}</button>`);
  p.querySelector('[data-bkx="ol"]').onclick=()=>{closePP();bkxOutline()};p.querySelector('[data-bkx="trim"]').onclick=()=>{closePP();bkxTrim()};p.querySelector('[data-bkx="rot"]').onclick=()=>{closePP();bkxRotate(n)}}catch(e){console.error(e)}})}

