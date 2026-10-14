/* ============ v3.45 whiteboard: a larger shapes library, Islamic ornaments and symbols, cropping images, motion storyboards ============ */
/* each new shape draws inside the element box (x0,y0)-(x1,y1); like the old ones it is one SVG path, so fill, stroke, text, export PNG/SVG all work as before */
const WBX={};
{const P=(pts,F)=>'M'+pts.map(p=>F(p[0])+' '+F(p[1])).join('L')+'Z',star=(n,ri)=>(x0,y0,W,H,F)=>{const cx=x0+W/2,cy=y0+H/2,pts=[];for(let k=0;k<2*n;k++){const a=-Math.PI/2+k*Math.PI/n,m=k%2?ri:1;pts.push([cx+Math.cos(a)*W/2*m,cy+Math.sin(a)*H/2*m])}return P(pts,F)};
  const circ=(cx,cy,rx,ry,F)=>`M${F(cx-rx)} ${F(cy)}A${F(rx)} ${F(ry)} 0 1 0 ${F(cx+rx)} ${F(cy)}A${F(rx)} ${F(ry)} 0 1 0 ${F(cx-rx)} ${F(cy)}Z`;
  Object.assign(WBX,{
  arrR:(x0,y0,W,H,F)=>P([[x0,y0+H*.28],[x0+W*.62,y0+H*.28],[x0+W*.62,y0],[x0+W,y0+H/2],[x0+W*.62,y0+H],[x0+W*.62,y0+H*.72],[x0,y0+H*.72]],F),
  arrL:(x0,y0,W,H,F)=>P([[x0+W,y0+H*.28],[x0+W*.38,y0+H*.28],[x0+W*.38,y0],[x0,y0+H/2],[x0+W*.38,y0+H],[x0+W*.38,y0+H*.72],[x0+W,y0+H*.72]],F),
  arrU:(x0,y0,W,H,F)=>P([[x0+W*.28,y0+H],[x0+W*.28,y0+H*.38],[x0,y0+H*.38],[x0+W/2,y0],[x0+W,y0+H*.38],[x0+W*.72,y0+H*.38],[x0+W*.72,y0+H]],F),
  arrD:(x0,y0,W,H,F)=>P([[x0+W*.28,y0],[x0+W*.28,y0+H*.62],[x0,y0+H*.62],[x0+W/2,y0+H],[x0+W,y0+H*.62],[x0+W*.72,y0+H*.62],[x0+W*.72,y0]],F),
  arr2:(x0,y0,W,H,F)=>P([[x0,y0+H/2],[x0+W*.25,y0],[x0+W*.25,y0+H*.28],[x0+W*.75,y0+H*.28],[x0+W*.75,y0],[x0+W,y0+H/2],[x0+W*.75,y0+H],[x0+W*.75,y0+H*.72],[x0+W*.25,y0+H*.72],[x0+W*.25,y0+H]],F),
  chev:(x0,y0,W,H,F)=>P([[x0,y0],[x0+W*.7,y0],[x0+W,y0+H/2],[x0+W*.7,y0+H],[x0,y0+H],[x0+W*.3,y0+H/2]],F),
  hex:(x0,y0,W,H,F)=>P([[x0+W*.25,y0],[x0+W*.75,y0],[x0+W,y0+H/2],[x0+W*.75,y0+H],[x0+W*.25,y0+H],[x0,y0+H/2]],F),
  pent:(x0,y0,W,H,F)=>{const pts=[];for(let k=0;k<5;k++){const a=-Math.PI/2+k*2*Math.PI/5;pts.push([x0+W/2+Math.cos(a)*W/2,y0+H*.53+Math.sin(a)*H*.53])}return P(pts.map(p=>[p[0],Math.min(y0+H,p[1])]),F)},
  oct:(x0,y0,W,H,F)=>{const a=.29;return P([[x0+W*a,y0],[x0+W*(1-a),y0],[x0+W,y0+H*a],[x0+W,y0+H*(1-a)],[x0+W*(1-a),y0+H],[x0+W*a,y0+H],[x0,y0+H*(1-a)],[x0,y0+H*a]],F)},
  para:(x0,y0,W,H,F)=>P([[x0+W*.22,y0],[x0+W,y0],[x0+W*.78,y0+H],[x0,y0+H]],F),
  trap:(x0,y0,W,H,F)=>P([[x0+W*.2,y0],[x0+W*.8,y0],[x0+W,y0+H],[x0,y0+H]],F),
  plus:(x0,y0,W,H,F)=>{const a=.33,b=.67;return P([[x0+W*a,y0],[x0+W*b,y0],[x0+W*b,y0+H*a],[x0+W,y0+H*a],[x0+W,y0+H*b],[x0+W*b,y0+H*b],[x0+W*b,y0+H],[x0+W*a,y0+H],[x0+W*a,y0+H*b],[x0,y0+H*b],[x0,y0+H*a],[x0+W*a,y0+H*a]],F)},
  heart:(x0,y0,W,H,F)=>`M${F(x0+W/2)} ${F(y0+H)}C${F(x0+W*.1)} ${F(y0+H*.72)} ${F(x0-W*.02)} ${F(y0+H*.36)} ${F(x0+W*.12)} ${F(y0+H*.14)}C${F(x0+W*.27)} ${F(y0-H*.06)} ${F(x0+W*.46)} ${F(y0+H*.04)} ${F(x0+W/2)} ${F(y0+H*.22)}C${F(x0+W*.54)} ${F(y0+H*.04)} ${F(x0+W*.73)} ${F(y0-H*.06)} ${F(x0+W*.88)} ${F(y0+H*.14)}C${F(x0+W*1.02)} ${F(y0+H*.36)} ${F(x0+W*.9)} ${F(y0+H*.72)} ${F(x0+W/2)} ${F(y0+H)}Z`,
  cloud:(x0,y0,W,H,F)=>{const hb=H*.82,A=(x,y)=>F(x0+W*x)+' '+F(y0+hb*y);return`M${A(.18,.9)}A${F(W*.16)} ${F(hb*.2)} 0 0 1 ${A(.1,.52)}A${F(W*.17)} ${F(hb*.22)} 0 0 1 ${A(.3,.2)}A${F(W*.2)} ${F(hb*.25)} 0 0 1 ${A(.62,.12)}A${F(W*.18)} ${F(hb*.22)} 0 0 1 ${A(.9,.42)}A${F(W*.14)} ${F(hb*.2)} 0 0 1 ${A(.84,.9)}Z`+circ(x0+W*.2,y0+H*.92,W*.045,H*.04,F)+circ(x0+W*.1,y0+H*.985,W*.025,H*.015+.5,F)},
  burst:star(12,.72),
  callout:(x0,y0,W,H,F)=>{const hb=H*.78;return P([[x0,y0],[x0+W,y0],[x0+W,y0+hb],[x0+W*.62,y0+hb],[x0+W*.5,y0+H],[x0+W*.42,y0+hb],[x0,y0+hb]],F)},
  cyl:(x0,y0,W,H,F)=>{const e=Math.min(H*.12,W*.18);return`M${F(x0)} ${F(y0+e)}A${F(W/2)} ${F(e)} 0 0 1 ${F(x0+W)} ${F(y0+e)}V${F(y0+H-e)}A${F(W/2)} ${F(e)} 0 0 1 ${F(x0)} ${F(y0+H-e)}Z M${F(x0)} ${F(y0+e)}A${F(W/2)} ${F(e)} 0 0 0 ${F(x0+W)} ${F(y0+e)}`},
  /* ornaments */
  rub:(x0,y0,W,H,F)=>{const cx=x0+W/2,cy=y0+H/2,pts=[],ri=Math.cos(Math.PI/4)/Math.cos(Math.PI/8);for(let k=0;k<16;k++){const a=-Math.PI/2+k*Math.PI/8,m=k%2?ri:1;pts.push([cx+Math.cos(a)*W/2*m,cy+Math.sin(a)*H/2*m])}return P(pts,F)+circ(cx,cy,W*.17,H*.17,F)},
  star8:star(8,.56),star6:star(6,.577),star12:star(12,.78),
  cres:(x0,y0,W,H,F)=>`M${F(x0+W*.62)} ${F(y0)}A${F(W/2)} ${F(H/2)} 0 1 0 ${F(x0+W*.62)} ${F(y0+H)}A${F(W*.4)} ${F(H*.44)} 0 1 1 ${F(x0+W*.62)} ${F(y0)}Z`,
  arch:(x0,y0,W,H,F)=>{const ys=y0+Math.min(H*.42,W*.62);return`M${F(x0)} ${F(y0+H)}V${F(ys)}A${F(W*.92)} ${F(ys-y0+W*.15)} 0 0 1 ${F(x0+W/2)} ${F(y0)}A${F(W*.92)} ${F(ys-y0+W*.15)} 0 0 1 ${F(x0+W)} ${F(ys)}V${F(y0+H)}Z`},
  mihrab:(x0,y0,W,H,F)=>{const o=WBX.arch(x0,y0,W,H,F),m=Math.min(W,H)*.1;return o+WBX.arch(x0+m,y0+m*1.6,W-2*m,H-m*1.6,F)},
  dome:(x0,y0,W,H,F)=>{const b=y0+H*.72;return`M${F(x0)} ${F(y0+H)}V${F(b)}H${F(x0+W*.08)}C${F(x0+W*.02)} ${F(y0+H*.42)} ${F(x0+W*.3)} ${F(y0+H*.3)} ${F(x0+W*.46)} ${F(y0+H*.13)}V${F(y0+H*.03)}H${F(x0+W*.54)}V${F(y0+H*.13)}C${F(x0+W*.7)} ${F(y0+H*.3)} ${F(x0+W*.98)} ${F(y0+H*.42)} ${F(x0+W*.92)} ${F(b)}H${F(x0+W)}V${F(y0+H)}Z`},
  lantern:(x0,y0,W,H,F)=>P([[x0+W*.46,y0],[x0+W*.54,y0],[x0+W*.54,y0+H*.06],[x0+W*.78,y0+H*.2],[x0+W*.66,y0+H*.24],[x0+W*.9,y0+H*.45],[x0+W*.9,y0+H*.68],[x0+W*.66,y0+H*.86],[x0+W*.62,y0+H*.94],[x0+W*.56,y0+H],[x0+W*.44,y0+H],[x0+W*.38,y0+H*.94],[x0+W*.34,y0+H*.86],[x0+W*.1,y0+H*.68],[x0+W*.1,y0+H*.45],[x0+W*.34,y0+H*.24],[x0+W*.22,y0+H*.2],[x0+W*.46,y0+H*.06]],F),
  rosette:(x0,y0,W,H,F)=>{const cx=x0+W/2,cy=y0+H/2,n=8,R=W/2,Ry=H/2;let d='';for(let k=0;k<n;k++){const a1=-Math.PI/2+k*2*Math.PI/n,a2=a1+2*Math.PI/n,p1=[cx+Math.cos(a1)*R*.62,cy+Math.sin(a1)*Ry*.62],p2=[cx+Math.cos(a2)*R*.62,cy+Math.sin(a2)*Ry*.62],am=(a1+a2)/2,c=[cx+Math.cos(am)*R*1.18,cy+Math.sin(am)*Ry*1.18];d+=(k?'':'M'+F(p1[0])+' '+F(p1[1]))+'Q'+F(c[0])+' '+F(c[1])+' '+F(p2[0])+' '+F(p2[1])}return d+'Z'+circ(cx,cy,W*.2,H*.2,F)}})}
const WBX_BASIC=['arrR','arrL','arrU','arrD','arr2','chev','hex','pent','oct','para','trap','plus','heart','cloud','burst','callout','cyl'],WBX_ORN=['rub','star8','star6','star12','rosette','cres','arch','mihrab','dome','lantern'];
WB_SHAPES.push(...WBX_BASIC,...WBX_ORN);
{const _d=wbShapeD;wbShapeD=function(t,w,h,sw,rx){const f=WBX[t];if(!f)return _d(t,w,h,sw,rx);const i=sw/2,F=v=>+v.toFixed(2);return f(i,i,Math.max(1,w-sw),Math.max(1,h-sw),F)}}
[...WBX_BASIC,...WBX_ORN].forEach(s=>{WB_ICONS[s]=`<path transform="translate(3 3)" d="${wbShapeD(s,18,18,0,3)}"/>`;WB_TK[s]='shape'});
/* the shape picker: basic shapes, then the ornaments and a row of symbols that go on the board as text */
const WBX_SYM=['﷽','۞','ﷺ','ﷻ','۩','﴾ ﴿','✦','❁'];
wbShapePop=function(btn){const one=s=>`<button class="tool ${WB.shape===s?'on':''}" data-s="${s}" title="${esc(t('wb.sh.'+s))}" aria-label="${esc(t('wb.sh.'+s))}">${wbIco(s)}</button>`;
  const p=wbPop(btn,`<div class="wbxsec">${t('wbx.basic')}</div><div class="wbshp wbxg">${['rect','ellipse','tri','diamond','star','bubble',...WBX_BASIC].map(one).join('')}</div><div class="wbxsec">${t('wbx.orn')}</div><div class="wbshp wbxg">${WBX_ORN.map(one).join('')}</div><div class="wbxsec">${t('wbx.sym')}</div><div class="wbxsym">${WBX_SYM.map(s=>`<button data-sym="${esc(s)}" title="${esc(s)}">${esc(s)}</button>`).join('')}</div>`,'wbcpop wbxpop');
  p.querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>{closePP();WB.shape=b.dataset.s;WB.tool=WB.shape;wbSetSel([]);wbToolbar()});
  p.querySelectorAll('[data-sym]').forEach(b=>b.onclick=()=>{closePP();const[cx,cy]=wbViewCenter(),s=b.dataset.sym,w=s.length>2?220:120;wbAdd({id:uid(),type:'text',x:cx-w/2,y:cy-50,w,h:100,text:s,fs:s==='﷽'?54:72,color:'auto',ta:'center',ff:'naskh'})})};
/* 94: motion storyboards — 16:9 panels with shot, duration, camera, transition and sound; and a 9:16 one for reels */
{const _t=wbTemplate;wbTemplate=function(kind){if(kind!=='motion'&&kind!=='motionV')return _t(kind);const[cx,cy]=wbViewCenter(),rtl=document.documentElement.dir==='rtl',M=(i,n)=>rtl?n-1-i:i,add=[],V=kind==='motionV';
  const W=V?180:320,H=V?320:180,cols=V?6:4,rows=V?1:2,G=34,TH=118,x0=cx-(cols*W+(cols-1)*G)/2,y0=cy-(rows*(H+TH)+(rows-1)*G)/2-40;
  add.push({id:uid(),type:'text',x:x0,y:y0-74,w:cols*W+(cols-1)*G,h:60,text:'**'+t('wbx.mProj')+'**\n'+t('wbx.mHead',V?'9:16':'16:9'),fs:16,color:'auto'});let n=1;
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const x=x0+M(c,cols)*(W+G),y=y0+r*(H+TH+G);add.push({id:uid(),type:'frame',x,y,w:W,h:H,title:t('wbx.shot',n),color:'accent',kind:'sb'});add.push({id:uid(),type:'text',x,y:y+H+8,w:W,h:TH-12,text:t('wbx.shotTx'),fs:12.5,color:'auto'});n++}
  wbSnap();wbEls().push(...add);save();wbSetSel([]);wbRender();wbFit()}}
{const _m=wbMenu;wbMenu=function(btn,items){if(btn&&btn.id==='wbTpl'&&!items.some(i=>i&&i.wbx))items=[...items.slice(0,1),Object.assign(['🎞 '+t('wbx.tMotion'),()=>wbTemplate('motion')],{wbx:1}),['📱 '+t('wbx.tMotionV'),()=>wbTemplate('motionV')],...items.slice(1)];return _m(btn,items)}}
/* 90: crop an image — the cropped picture replaces it; the original is kept (e.orig) so it can be cropped again or restored */
function wbxImgSize(d){return new Promise((r,j)=>{const i=new Image();i.onload=()=>r(i);i.onerror=j;i.src=d})}
async function wbxCrop(id){const e=wbFind(id);if(!e||e.type!=='image')return;const src=await nImg(e.orig||e.img);if(!src){toast(t('lb.miss'));return}const im=await wbxImgSize(src),NW=im.naturalWidth,NH=im.naturalHeight;
  let R=e.oc?Object.assign({},e.oc):{x:0,y:0,w:1,h:1},asp=0;
  openInfo('✂ '+t('wbx.crop'),`<div class="wbxcw" id="wbxCw"><img src="${src}" alt="" draggable="false" id="wbxCi"><div class="wbxcr" id="wbxCr"><i data-h="nw"></i><i data-h="ne"></i><i data-h="sw"></i><i data-h="se"></i></div></div><div class="wbxasp">${[['0',t('wbx.free')],['1','1:1'],['1.7778','16:9'],['0.5625','9:16'],['1.3333','4:3']].map(([v,l])=>`<button class="chip sm${v==='0'?' on':''}" data-asp="${v}">${l}</button>`).join('')}</div><div class="evact" style="margin-top:10px">${e.orig?`<button class="btn sm ghost" id="wbxRst">${t('wbx.reset')}</button>`:''}<span style="flex:1"></span><button class="btn sm ghost" id="wbxX">${t('lt.cancel')}</button><button class="btn sm pri" id="wbxOk">${t('wbx.apply')}</button></div>`);
  const box=$('#infoBox');box.classList.add('wbxbox');const ok0=$('#infoX');if(ok0)ok0.remove();const wrap=$('#wbxCw'),cr=$('#wbxCr'),ci=$('#wbxCi'),close=()=>{box.classList.remove('wbxbox');$('#infoModal').classList.remove('on')};
  const paint=()=>{cr.style.left=R.x*100+'%';cr.style.top=R.y*100+'%';cr.style.width=R.w*100+'%';cr.style.height=R.h*100+'%'};
  const fixAsp=()=>{if(!asp)return;const a=asp*NH/NW;let w=R.w,h=w/a;if(h>1){h=1;w=h*a}if(w>1){w=1;h=w/a}R.w=w;R.h=h;R.x=Math.min(R.x,1-w);R.y=Math.min(R.y,1-h)};paint();
  let D=null;cr.onpointerdown=ev=>{ev.preventDefault();cr.setPointerCapture(ev.pointerId);D={h:ev.target.dataset.h||'mv',x:ev.clientX,y:ev.clientY,r:Object.assign({},R)}};
  cr.onpointermove=ev=>{if(!D)return;const rc=ci.getBoundingClientRect(),dx=(ev.clientX-D.x)/rc.width,dy=(ev.clientY-D.y)/rc.height,o=D.r,mn=.04;let x=o.x,y=o.y,w=o.w,h=o.h;
    if(D.h==='mv'){x=Math.max(0,Math.min(1-w,o.x+dx));y=Math.max(0,Math.min(1-h,o.y+dy))}else{if(D.h.includes('w')){x=Math.max(0,Math.min(o.x+o.w-mn,o.x+dx));w=o.x+o.w-x}if(D.h.includes('e'))w=Math.max(mn,Math.min(1-o.x,o.w+dx));if(D.h.includes('n')){y=Math.max(0,Math.min(o.y+o.h-mn,o.y+dy));h=o.y+o.h-y}if(D.h.includes('s'))h=Math.max(mn,Math.min(1-o.y,o.h+dy));
      if(asp){const a=asp*NH/NW;h=w/a;if(y+h>1){h=1-y;w=h*a}if(D.h.includes('n'))y=o.y+o.h-h;if(D.h.includes('w'))x=o.x+o.w-w}}R={x,y,w,h};paint()};
  cr.onpointerup=()=>{D=null};$$('#infoBox [data-asp]').forEach(b=>b.onclick=()=>{$$('#infoBox [data-asp]').forEach(x=>x.classList.toggle('on',x===b));asp=+b.dataset.asp;fixAsp();paint()});
  $('#wbxX').onclick=close;const rs=$('#wbxRst');if(rs)rs.onclick=async()=>{const cur=await nImg(e.img),ci2=cur?await wbxImgSize(cur):null,k=ci2?e.w/ci2.naturalWidth:1;wbSnap();e.img=e.orig;delete e.orig;delete e.oc;e.w=NW*k;e.h=NH*k;save();close();wbRender()};
  $('#wbxOk').onclick=async()=>{const sx=Math.round(R.x*NW),sy=Math.round(R.y*NH),sw=Math.max(1,Math.round(R.w*NW)),sh=Math.max(1,Math.round(R.h*NH)),c=document.createElement('canvas');c.width=sw;c.height=sh;const x=c.getContext('2d');x.drawImage(im,sx,sy,sw,sh,0,0,sw,sh);
    const png=/^data:image\/png/.test(src),d=c.toDataURL(png?'image/png':'image/jpeg',.9),nid=uid();await idbSet('nimg:'+nid,d);nImgMem[nid]=d;const cur=await nImg(e.img),ci2=cur?await wbxImgSize(cur):null,k=ci2?e.w/ci2.naturalWidth:e.w/NW;
    wbSnap();e.orig=e.orig||e.img;e.img=nid;e.oc=R;e.w=sw*k;e.h=sh*k;save();close();wbRender();wbSetSel([e.id]);wbToolbar()}}
{hookFn('wbToolbar',()=>wbToolbar,f=>{wbToolbar=f},'post',function(){try{const sel=[...WB.sel].map(wbFind).filter(Boolean),bar=$('#btbar .wbs');if(sel.length!==1||sel[0].type!=='image'||!bar||bar.querySelector('[data-wbxc]'))return;const dup=bar.querySelector('[data-a="dup"]');
  const h=`<button class="tool" data-wbxc="1" title="${esc(t('wbx.crop'))}" aria-label="${esc(t('wbx.crop'))}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2v14a2 2 0 0 0 2 2h14M18 22V8a2 2 0 0 0-2-2H2"/></svg></button>`;if(dup)dup.insertAdjacentHTML('beforebegin',h);else bar.insertAdjacentHTML('beforeend',h);bar.querySelector('[data-wbxc]').onclick=()=>wbxCrop(sel[0].id)}catch(e){console.error(e)}})}
