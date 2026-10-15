/* ============ v3.55 whiteboard for motion work: colours from an image, thirds/16:9 guides, motion path, timecodes, before/after, a moodboard from the library, round crops, a frame in 4K, a voice note on an element, three templates, sizes in pixels, a locked reference image ============ */
const WBY={guides:false};
function wbySel(){return[...WB.sel].map(wbFind).filter(Boolean)}
/* 91: five colours from an image (k-means on a small copy), placed as swatches with their hex beside it */
async function wbyPalette(e){const d=await nImg(e.img);if(!d)return;const im=await wbxImgSize(d),c=document.createElement('canvas'),W=80,H=Math.max(1,Math.round(80*im.naturalHeight/im.naturalWidth));c.width=W;c.height=H;const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(im,0,0,W,H);const px=x.getImageData(0,0,W,H).data,P=[];for(let i=0;i<px.length;i+=4)P.push([px[i],px[i+1],px[i+2]]);
  const d2=(a,b)=>(a[0]-b[0])**2+(a[1]-b[1])**2+(a[2]-b[2])**2;let C=[P[Math.floor(P.length/2)].slice()];while(C.length<5){let bi=0,bd=-1;for(let i=0;i<P.length;i+=3){const m=Math.min(...C.map(q=>d2(P[i],q)));if(m>bd){bd=m;bi=i}}C.push(P[bi].slice())}for(let it=0;it<12;it++){const S_=C.map(()=>[0,0,0,0]);P.forEach(p=>{let bi=0,bd=1e9;C.forEach((q,i)=>{const dd=(p[0]-q[0])**2+(p[1]-q[1])**2+(p[2]-q[2])**2;if(dd<bd){bd=dd;bi=i}});const s=S_[bi];s[0]+=p[0];s[1]+=p[1];s[2]+=p[2];s[3]++});C=C.map((q,i)=>S_[i][3]?[S_[i][0]/S_[i][3],S_[i][1]/S_[i][3],S_[i][2]/S_[i][3]]:q)}
  const hex=q=>'#'+q.map(v=>Math.round(v).toString(16).padStart(2,'0')).join(''),L_=C.map(hex).sort(),add=[],sz=Math.min(90,e.w/5.4),y0=e.y+e.h+18;
  L_.forEach((h,i)=>{const x0=e.x+i*(sz+10);add.push({id:uid(),type:'rect',x:x0,y:y0,w:sz,h:sz,color:h,fc:h,fo:1,sw:0,rx:10},{id:uid(),type:'text',x:x0-6,y:y0+sz+4,w:sz+12,h:24,text:h.toUpperCase(),fs:12,color:'auto',ta:'center',ff:'mono'})});
  wbSnap();wbEls().push(...add);save();wbRender();toast(t('wby.palDone'))}
/* 92: thirds and 16:9 guides over frames (on screen only) */
function wbyGuides(on){WBY.guides=on==null?!WBY.guides:on;const w=$('#bwrap');if(w)w.classList.toggle('wbyg',WBY.guides);try{localStorage.setItem('thabat.wbGuides',WBY.guides?'1':'0')}catch(e){}}
/* 93: a motion path — a curved arrow with numbered key points along it */
function wbyPath(){const[cx,cy]=wbViewCenter(),A={id:uid(),type:'arrow',x1:cx-260,y1:cy+80,x2:cx+260,y2:cy-60,color:'accent',sw:3,route:'curve',bend:.35,dash:true,head:'end'},add=[A];
  const p=[cx-260,cy+80],q=[cx+260,cy-60],dx=q[0]-p[0],dy=q[1]-p[1],L=Math.hypot(dx,dy),k=.35*L,c=[(p[0]+q[0])/2-dy/L*k,(p[1]+q[1])/2+dx/L*k];
  [0,.33,.66,1].forEach((tt,i)=>{const x=(1-tt)**2*p[0]+2*(1-tt)*tt*c[0]+tt*tt*q[0],y=(1-tt)**2*p[1]+2*(1-tt)*tt*c[1]+tt*tt*q[1];add.push({id:uid(),type:'ellipse',x:x-17,y:y-17,w:34,h:34,color:'accent',fc:'accent',fo:1,sw:0,text:String(i+1),fs:14})});
  wbSnap();wbEls().push(...add);save();wbRender();wbSetSel(add.map(e=>e.id))}
/* 94: timecodes under the storyboard frames (frames in reading order; each shot N seconds) */
function wbyTimecodes(){const fr=wbEls().filter(e=>e.type==='frame').sort((a,b)=>Math.abs(a.y-b.y)>a.h/2?a.y-b.y:(document.documentElement.dir==='rtl'?b.x-a.x:a.x-b.x));if(!fr.length){toast(t('wby.noFr'));return}
  const v=prompt(t('wby.tcQ'),'3');if(v==null)return;const sec=Math.max(.5,+v||3);wbSnap();const b=board();b.els=b.els.filter(e=>!e.tc);let tm=0;const f=s=>String(Math.floor(s/60)).padStart(2,'0')+':'+String(Math.floor(s%60)).padStart(2,'0')+(s%1?'.'+String(Math.round((s%1)*10)):'');
  fr.forEach((e,i)=>{b.els.push({id:uid(),type:'text',x:e.x,y:e.y-26,w:e.w,h:22,text:`⏱ ${f(tm)} – ${f(tm+sec)}`,fs:12,color:'auto',ta:document.documentElement.dir==='rtl'?'end':'start',ff:'mono',tc:1});tm+=sec});save();wbRender();toast(t('wby.tcDone',fr.length,f(tm)))}
/* 95: before / after — two images compared with a sliding divider */
async function wbyBA(a,b){const[da,db]=await Promise.all([nImg(a.img),nImg(b.img)]);if(!da||!db)return;openInfo('⇆ '+t('wby.ba'),`<div class="wbyba" id="wbyBA"><img src="${da}" alt=""><div class="wbybb" id="wbyBB"><img src="${db}" alt=""></div><i id="wbyBL"></i></div><input type="range" min="0" max="100" value="50" id="wbyBR" aria-label="${esc(t('wby.ba'))}" style="width:100%"><small class="muted">${t('wby.baSub')}</small>`);
  $('#infoBox').classList.add('wbxbox');const set=v=>{$('#wbyBB').style.clipPath=`inset(0 0 0 ${v}%)`;$('#wbyBL').style.left=v+'%'};set(50);$('#wbyBR').oninput=e=>set(+e.target.value);
  const w=$('#wbyBA');w.onpointermove=e=>{if(e.buttons||e.pointerType==='mouse'){const r=w.getBoundingClientRect(),v=Math.max(0,Math.min(100,(e.clientX-r.left)/r.width*100));$('#wbyBR').value=v;set(v)}}}
/* 96: a moodboard from a folder of pictures in the PC library */
function wbyImgDirs(){const out=[],walk=(L_,path)=>(L_||[]).forEach(x=>{if(x.k==='d'){const imgs=(x.c||[]).filter(f=>f.k!=='d'&&/\.(jpe?g|png|webp|gif)$/i.test(f.n||''));if(imgs.length)out.push({id:x.id,n:(path?path+' / ':'')+x.n,imgs});walk(x.c,(path?path+' / ':'')+x.n)}});walk(LIB.tree,'');return out}
async function wbyMood(){if(!LIB.base){try{await libConnect()}catch(e){}}if(!LIB.base){toast(t('lb.off'));return}if(!LIB.tree){try{await libLoad(true)}catch(e){}}const D=wbyImgDirs();if(!D.length){toast(t('wby.noImg'));return}
  openInfo('🖼 '+t('wby.mood'),`<p class="crsub">${t('wby.moodSub')}</p><div class="nfpk">${D.map((d,i)=>`<button class="nfpr" data-md="${i}"><span dir="auto">📁 ${esc(d.n)}</span><small>${d.imgs.length}</small></button>`).join('')}</div>`);
  $$('#infoBox [data-md]').forEach(b=>b.onclick=async()=>{const d=D[+b.dataset.md];$('#infoModal').classList.remove('on');toast(t('wby.moodIng',Math.min(24,d.imgs.length)));const[cx,cy]=wbViewCenter(),add=[],W=240,G=16,cols=4;let i=0;
    for(const f of d.imgs.slice(0,24)){try{const r=await libFetch(libU('/f?id='+encodeURIComponent(f.id)),30000);const bl=await r.blob(),du=await shrinkImage(new File([bl],f.n,{type:bl.type||'image/jpeg'}),1400),id=uid();await idbSet('nimg:'+id,du);nImgMem[id]=du;const im=await wbxImgSize(du),h=W*im.naturalHeight/im.naturalWidth;
      add.push({id:uid(),type:'image',x:cx-(cols*(W+G))/2+(i%cols)*(W+G),y:cy+Math.floor(i/cols)*(W*.8+G),w:W,h,img:id});i++}catch(e){}}
    if(!add.length){toast(t('wby.noImg'));return}let col=Array(cols).fill(cy);add.forEach((e,j)=>{const c=j%cols;e.y=col[c];col[c]+=e.h+G});
    add.unshift({id:uid(),type:'frame',x:cx-(cols*(W+G))/2-24,y:cy-60,w:cols*(W+G)+32,h:Math.max(...col)-cy+90,title:'🖼 '+d.n.split(' / ').pop(),color:'accent'});wbSnap();wbEls().push(...add);save();wbRender();wbFit()})}
/* 100: export one frame (and what is inside it) 3840 px wide */
async function wby4K(f){const els=[f,...wbEls().filter(o=>o!==f&&o.type!=='frame'&&wbInside(o,f))];window.WB_SC=3840/(f.w+80);try{await wbExportPng(els)}finally{window.WB_SC=0}}
/* 101: a voice note pinned to an element (recorded here, kept on this device like note recordings) */
let WBV=null;
async function wbyVoice(e){if(WBV){try{WBV.mr.stop()}catch(x){}return}if(!navigator.mediaDevices||!window.MediaRecorder){toast(t('ne.recNo'));return}let st;try{st=await navigator.mediaDevices.getUserMedia({audio:true})}catch(x){toast(t('ne.recDenied'));return}
  const mr=new MediaRecorder(st),ch=[],t0=Date.now();WBV={mr};toast(t('wby.rec'));mr.ondataavailable=ev=>{if(ev.data&&ev.data.size)ch.push(ev.data)};
  mr.onstop=async()=>{st.getTracks().forEach(x=>x.stop());WBV=null;if(!ch.length)return;const id=uid();try{await idbSet('naud:'+id,new Blob(ch,{type:mr.mimeType||'audio/webm'}))}catch(x){toast(t('toast.saveFail'));return}wbSnap();e.vn={id,ms:Date.now()-t0};save();wbRender();toast(t('wby.recDone'))};mr.start(1000)}
{const _h=wbNodeHTML;wbNodeHTML=function(e){let h=_h(e);try{if(e&&e.vn)h+=`<button class="wbvn" data-vn="${e.vn.id}" title="${esc(t('wby.play'))}">🎙 ${fmtSec(e.vn.ms||0)}</button>`}catch(x){}return h}}
document.addEventListener('pointerdown',e=>{if(e.target.closest&&e.target.closest('.wbvn'))e.stopPropagation()},true);
document.addEventListener('click',async e=>{const b=e.target.closest&&e.target.closest('.wbvn');if(!b)return;e.stopPropagation();e.preventDefault();try{const bl=await idbGet('naud:'+b.dataset.vn);if(!bl){toast(t('lb.miss'));return}if(WBY.au){WBY.au.pause();if(WBY.au._id===b.dataset.vn){WBY.au=null;return}}const a=new Audio(URL.createObjectURL(bl));a._id=b.dataset.vn;WBY.au=a;a.play().catch(()=>{});a.onended=()=>{WBY.au=null}}catch(x){}},true);
/* 104: a reference image — sent to the back, locked and faded; again to undo */
function wbyRef(e){wbSnap();if(e.ref){delete e.ref;delete e.lock;delete e.op}else{e.ref=1;e.lock=true;e.op=.55;const b=board();b.els=[e,...b.els.filter(x=>x!==e)]}save();wbRender();toast(t(e.ref?'wby.refOn':'wby.refOff'))}
{const _h=wbNodeCls;wbNodeCls=function(e){let c=_h(e);if(e&&e.ref)c+=' wbyref';return c}}
/* 102: templates — brand identity, scene analysis, short-video plan */
{const _t=wbTemplate;wbTemplate=function(kind){const[cx,cy]=wbViewCenter(),F=(x,y,w,h,title)=>({id:uid(),type:'frame',x,y,w,h,title,color:'accent'}),T=(x,y,w,h,text,fs=14)=>({id:uid(),type:'text',x,y,w,h,text,fs,color:'auto'}),St=(x,y,text,ci)=>({id:uid(),type:'sticky',x,y,w:220,h:110,text,color:NOTE_COLORS[ci%NOTE_COLORS.length]}),add=[];
  if(kind==='brand'){const W=300,H=260,G=24,secs=['logo','colors','type','voice','imagery','donts'],x0=cx-(3*W+2*G)/2,y0=cy-(2*H+G)/2;secs.forEach((s,i)=>{const x=x0+(i%3)*(W+G),y=y0+Math.floor(i/3)*(H+G);add.push(F(x,y,W,H,t('wby.br.'+s)),T(x+14,y+40,W-28,H-60,t('wby.br.'+s+'H'),13))})}
  else if(kind==='scene'){const W=420,H=240;add.push(F(cx-W-20,cy-H/2,W,H,t('wby.sc.ref')));['shot','camera','timing','color','sound','learn'].forEach((s,i)=>add.push(St(cx+20+(i%2)*236,cy-H/2+Math.floor(i/2)*124,t('wby.sc.'+s),i)))}
  else if(kind==='video'){const W=250,H=360,G=18,cols=['hook','problem','idea','proof','cta'],x0=cx-(cols.length*W+(cols.length-1)*G)/2;cols.forEach((s,i)=>{const x=x0+i*(W+G);add.push(F(x,cy-H/2,W,H,(i+1)+'. '+t('wby.vd.'+s)),T(x+12,cy-H/2+40,W-24,H-60,t('wby.vd.'+s+'H'),13))})}
  else return _t(kind);wbSnap();wbEls().push(...add);save();wbSetSel([]);wbRender();wbFit()}}
/* menus: insert, templates, the selection «⋯» */
{const _m=wbMenu;wbMenu=function(btn,items,...a){try{const sel=wbySel();
  if(btn&&btn.id==='wbIns'&&!items.some(i=>i&&i.wby))items=[...items,null,Object.assign(['🖼 '+t('wby.mood'),wbyMood],{wby:1}),['〰 '+t('wby.path'),wbyPath]];
  if(btn&&btn.id==='wbTpl'&&!items.some(i=>i&&i.wby))items=[...items,null,Object.assign(['🎨 '+t('wby.tBrand'),()=>wbTemplate('brand')],{wby:1}),['🎬 '+t('wby.tScene'),()=>wbTemplate('scene')],['📱 '+t('wby.tVideo'),()=>wbTemplate('video')],null,['⏱ '+t('wby.tc'),wbyTimecodes],[(WBY.guides?'✓ ':'')+'▦ '+t('wby.guides'),()=>wbyGuides()]];
  if(btn&&btn.dataset&&btn.dataset.a==='more'&&sel.length&&!items.some(i=>i&&i.wby)){const ex=[],imgs=sel.filter(e=>e.type==='image');
    if(imgs.length===1)ex.push(Object.assign(['🎨 '+t('wby.pal'),()=>wbyPalette(imgs[0])],{wby:1}),[(imgs[0].ref?'📌 '+t('wby.refX'):'📌 '+t('wby.ref')),()=>wbyRef(imgs[0])]);
    if(imgs.length===2)ex.push(Object.assign(['⇆ '+t('wby.ba'),()=>wbyBA(imgs[0],imgs[1])],{wby:1}));
    if(sel.length===1&&sel[0].type==='frame')ex.push(Object.assign(['⬇ '+t('wby.k4'),()=>wby4K(sel[0])],{wby:1}));
    if(sel.length===1)ex.push(Object.assign([(sel[0].vn?'🎙 '+t('wby.recAgain'):'🎙 '+t('wby.voice')),()=>wbyVoice(sel[0])],{wby:1}),...(sel[0].vn?[['✕ '+t('wby.voiceX'),()=>{wbSnap();delete sel[0].vn;save();wbRender()}]]:[]));
    if(ex.length)items=[...ex,null,...items]}}catch(e){console.error(e)}return _m(btn,items,...a)}}
/* 103: size in pixels of the selected element, shown under it */
function wbyDim(){let d=$('#wbyDim');const s=wbySel(),w=$('#bwrap');if(!w){return}if(s.length!==1||s[0].type==='arrow'||s[0].type==='stroke'){if(d)d.hidden=true;return}const b=wbBox(s[0]),v=wbView();if(!d){w.insertAdjacentHTML('beforeend','<span class="wbydim" id="wbyDim"></span>');d=$('#wbyDim')}
  d.hidden=false;d.textContent=`${Math.round(b.w)} × ${Math.round(b.h)} px · x ${Math.round(b.x)} y ${Math.round(b.y)}`;d.style.left=(b.x*v.z+v.x)+'px';d.style.top=((b.y+b.h)*v.z+v.y+8)+'px'}
{hookFn('wbSetSel',()=>wbSetSel,f=>{wbSetSel=f},'post',function(){try{wbyDim()}catch(e){}})}
{hookFn('wbRefresh',()=>wbRefresh,f=>{wbRefresh=f},'post',function(){try{wbyDim()}catch(e){}})}
{hookFn('wbApplyView',()=>wbApplyView,f=>{wbApplyView=f},'post',function(){try{wbyDim()}catch(e){}})}
{hookFn('wbRender',()=>wbRender,f=>{wbRender=f},'post',function(){try{wbyDim();const w=$('#bwrap');if(w&&!w._wby){w._wby=1;let g='0';try{g=localStorage.getItem('thabat.wbGuides')||'0'}catch(e){}if(g==='1')wbyGuides(true)}}catch(e){}})}
