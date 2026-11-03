/* ============ v3.163.0 thirteenth list G2 (board): rulers and guides, grid step snapping, a frame moved to another board, smooth zoom between frames, eyedropper, a parametric Islamic star, isometric background ============ */
/* 163 (Shift keeps the ratio while resizing) and 167 (Shift draws a straight pen line) already existed. */
const WB17={pdr:null,anim:0,pick:null};

/* ---- 165: snapping to a grid step (board().gs = 8 | 16 | 32) and 162: to the ruler guides ---- */
function wb17Gs(){const b=board&&board();return b&&+b.gs||0}
function wb17RulOn(){return!!(S.wbUi||{}).rul}
function wb17Guides(){const b=board();return wb17RulOn()?(b.gd||[]):[]}
/* one coordinate: a guide within 8 screen px wins, else the grid */
function wb17V(v,ax){const th=8/(wbView().z||1);for(const g of wb17Guides())if(g.a===ax&&Math.abs(g.v-v)<=th)return g.v;const s=wb17Gs();return s?Math.round(v/s)*s:v}
/* a move: the box of what is moved snaps by its edges and centre to guides, its top-left corner to the grid */
function wb17Snap(o,D){try{if(!o||!o.ids)return D;const s=wb17Gs(),gd=wb17Guides();if(!s&&!gd.length)return D;
  if(!o.b17){let a=1e9,b=1e9,c=-1e9,d=-1e9;for(const id of o.ids){const or=o.orig&&o.orig[id];if(!or||or.type==='arrow')continue;const q=wbBox(or);a=Math.min(a,q.x);b=Math.min(b,q.y);c=Math.max(c,q.x+q.w);d=Math.max(d,q.y+q.h)}if(a>=1e9)return D;o.b17={x:a,y:b,w:c-a,h:d-b}}
  const B=o.b17,th=8/(wbView().z||1),out=D.slice();
  [['x',0,B.x,B.w],['y',1,B.y,B.h]].forEach(([ax,i,p0,sz])=>{let best=null;for(const g of gd){if(g.a!==ax)continue;for(const off of[0,sz/2,sz]){const dv=g.v-(p0+D[i]+off);if(Math.abs(dv)<=th&&(!best||Math.abs(dv)<Math.abs(best)))best=dv}}
    if(best!=null)out[i]=D[i]+best;else if(s)out[i]=Math.round((p0+D[i])/s)*s-p0});
  return out}catch(e){return D}}
function wb17Rs(el,nw,nh,lock){try{const s=wb17Gs();if(!s||lock||!el||el.pts)return[nw,nh];const x2=Math.round((el.x+nw)/s)*s,y2=Math.round((el.y+nh)/s)*s;return[Math.max(s,x2-el.x),Math.max(s,y2-el.y)]}catch(e){return[nw,nh]}}
function wb17GsSet(n){const b=board();if(n)b.gs=n;else delete b.gs;save();wbBgPaint();toast(n?t('wb17.gsOn',n):t('wb17.gsOff'))}
function wb17GsMenu(btn){const cur=wb17Gs();wbMenu(btn,[[(cur?'':'✓ ')+t('wb17.gs0'),()=>wb17GsSet(0)],...[8,16,32].map(n=>[(cur===n?'✓ ':'')+t('wb17.gsN',n),()=>wb17GsSet(n)])])}

/* ---- 170: isometric background (board().bgp = 'iso'), and the grid background follows the snapping step ---- */
function wb17IsoUrl(){const c=getComputedStyle(document.documentElement).getPropertyValue('--line').trim()||'#888',d=28,h=+(2*d*Math.tan(Math.PI/6)).toFixed(3),
  s=`<svg xmlns="http://www.w3.org/2000/svg" width="${d}" height="${h}" viewBox="0 0 ${d} ${h}"><g stroke="${c}" stroke-width="1" fill="none" opacity=".9"><path d="M0 0V${h}M0 0L${d} ${h/2}M0 ${h/2}L${d} ${h}M0 ${h/2}L${d} 0M0 ${h}L${d} ${h/2}"/></g></svg>`;
  return{u:`url("data:image/svg+xml,${encodeURIComponent(s)}")`,d,h}}
{hookFn('wbBgPaint',()=>wbBgPaint,f=>{wbBgPaint=f},'post',function(){try{const w=$('#bwrap');if(!w)return;const b=board()||{},k=b.bgp||'',v=wbView();
  w.classList.toggle('wbbg-iso',k==='iso');if(k==='iso'){if(WB17.isoC!==document.documentElement.className){WB17.isoC=document.documentElement.className;WB17.iso=wb17IsoUrl()}const I=WB17.iso;
    w.style.setProperty('--wiso',I.u);w.style.setProperty('--wisoW',I.d+'px');w.style.setProperty('--wisoH',I.h+'px');w.style.setProperty('--wz',v.z);w.style.setProperty('--wx',v.x+'px');w.style.setProperty('--wy',v.y+'px')}
  const s=wb17Gs();w.classList.toggle('wb17gs',!!s&&(k==='grid'||k==='dots'));if(s)w.style.setProperty('--wgs',(s<16?s*2:s)+'px')}catch(e){}})}

/* ---- 162: rulers on the top and left edges; drag from one to make a guide, drag a guide back onto it to remove it ---- */
function wb17RulToggle(){S.wbUi=S.wbUi||{};S.wbUi.rul=!S.wbUi.rul;save();wb17RulPaint();if(S.wbUi.rul&&!(board().gd||[]).length)toast(t('wb17.rulTip'))}
function wb17RulPaint(){const w=$('#bwrap');if(!w)return;let H=$('#wb17Rh'),V=$('#wb17Rv'),C=$('#wb17Rc'),L=$('#wb17Gl');const on=wb17RulOn()&&!WB.present&&curView()==='boards';
  if(!on){[H,V,C,L].forEach(x=>x&&x.remove());w.classList.remove('wb17ron');return}
  w.classList.add('wb17ron');
  if(!H){H=document.createElement('canvas');H.id='wb17Rh';H.className='wb17r wb17rh';w.append(H);wb17RulBind(H,'y')}
  if(!V){V=document.createElement('canvas');V.id='wb17Rv';V.className='wb17r wb17rv';w.append(V);wb17RulBind(V,'x')}
  if(!C){C=document.createElement('div');C.id='wb17Rc';C.className='wb17rc';C.title=t('wb17.rulOff');C.onclick=e=>{e.stopPropagation();wb17RulToggle()};w.append(C)}
  if(!L){L=document.createElement('div');L.id='wb17Gl';L.className='wb17gl';w.append(L)}
  const v=wbView(),W=w.clientWidth,Hh=w.clientHeight,dpr=window.devicePixelRatio||1,cs=getComputedStyle(document.documentElement),mu=cs.getPropertyValue('--muted').trim()||'#888',bg=cs.getPropertyValue('--panel').trim()||'#222';
  let st=10;for(const s of[5,10,20,25,50,100,200,250,500,1000,2000,5000]){st=s;if(s*v.z>=56)break}
  const draw=(cv,len,horiz)=>{const th=20;cv.width=Math.max(1,Math.round(len*dpr));cv.height=Math.round(th*dpr);if(!horiz){cv.width=Math.round(th*dpr);cv.height=Math.max(1,Math.round(len*dpr))}
    const x=cv.getContext('2d');x.setTransform(dpr,0,0,dpr,0,0);x.fillStyle=bg;x.globalAlpha=.94;x.fillRect(0,0,horiz?len:th,horiz?th:len);x.globalAlpha=1;x.strokeStyle=mu;x.fillStyle=mu;x.lineWidth=1;x.font='9.5px system-ui,sans-serif';
    const o=horiz?v.x:v.y,a0=Math.floor((-o/v.z)/st)*st,a1=(len-o)/v.z;x.beginPath();
    for(let a=a0;a<=a1;a+=st/5){const p=Math.round(o+a*v.z)+.5,big=Math.abs(a/st-Math.round(a/st))<1e-6,L2=big?th*.62:th*.25;if(p<th&&big)continue;
      if(horiz){x.moveTo(p,th);x.lineTo(p,th-L2)}else{x.moveTo(th,p);x.lineTo(th-L2,p)}
      if(big){const s=String(Math.round(a));if(horiz)x.fillText(s,p+3,9);else{x.save();x.translate(9,p-3);x.rotate(-Math.PI/2);x.fillText(s,0,0);x.restore()}}}
    x.stroke()};
  draw(H,W,true);draw(V,Hh,false);
  const gd=board().gd||[];L.innerHTML=gd.map(g=>{const p=g.a==='x'?v.x+g.v*v.z:v.y+g.v*v.z;return`<div class="wb17g wb17g${g.a}" data-g="${g.id}" style="${g.a==='x'?'left':'top'}:${p.toFixed(1)}px" title="${esc(t('wb17.gTip'))}"></div>`}).join('');
  L.querySelectorAll('[data-g]').forEach(n=>n.onpointerdown=e=>{e.stopPropagation();e.preventDefault();const g=gd.find(x=>x.id===n.dataset.g);if(g)wb17GDrag(e,g,n)})}
function wb17RulBind(cv,ax){cv.addEventListener('pointerdown',e=>{e.stopPropagation();e.preventDefault();const b=board();b.gd=b.gd||[];const w=wbToWorld(e.clientX,e.clientY),g={id:uid().slice(0,8),a:ax,v:Math.round(ax==='x'?w[0]:w[1])};b.gd.push(g);wb17RulPaint();const n=$(`#wb17Gl [data-g="${g.id}"]`);wb17GDrag(e,g,n,cv)})}
function wb17GDrag(e,g,n,cap){const el=cap||n;try{el.setPointerCapture(e.pointerId)}catch(x){}n&&n.classList.add('on');
  const mv=ev=>{const w=wbToWorld(ev.clientX,ev.clientY),s=wb17Gs();let v=g.a==='x'?w[0]:w[1];v=s?Math.round(v/s)*s:Math.round(v);g.v=v;const vw=wbView(),nn=$(`#wb17Gl [data-g="${g.id}"]`);if(nn)nn.style[g.a==='x'?'left':'top']=((g.a==='x'?vw.x:vw.y)+v*vw.z).toFixed(1)+'px';wb17Tip(ev,Math.round(v))};
  const up=ev=>{el.removeEventListener('pointermove',mv);el.removeEventListener('pointerup',up);el.removeEventListener('pointercancel',up);$('#wb17Tp')&&$('#wb17Tp').remove();
    const r=$('#bwrap').getBoundingClientRect(),z=uiZoom()||1,lx=(ev.clientX-r.left)/z,ly=(ev.clientY-r.top)/z,b=board();
    if((g.a==='x'?lx:ly)<22){b.gd=(b.gd||[]).filter(x=>x.id!==g.id)}save();wb17RulPaint()};
  el.addEventListener('pointermove',mv);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up)}
function wb17Tip(ev,v){let p=$('#wb17Tp');if(!p){p=document.createElement('div');p.id='wb17Tp';p.className='wb17tp';document.body.append(p)}const z=uiZoom()||1;p.textContent=v;p.style.left=(ev.clientX/z+12)+'px';p.style.top=(ev.clientY/z+12)+'px'}
function wb17GClear(){const b=board();if(!(b.gd||[]).length)return;const old=b.gd;delete b.gd;save();wb17RulPaint();toastAct(t('wb17.gCleared'),t('wb17.undo'),()=>{board().gd=old;save();wb17RulPaint()})}
{hookFn('wbApplyView',()=>wbApplyView,f=>{wbApplyView=f},'post',function(){if(wb17RulOn())wb17RulPaint()})}
{hookFn('wbRender',()=>wbRender,f=>{wbRender=f},'post',function(){try{wb17RulPaint()}catch(e){console.error(e)}})}
window.addEventListener('resize',()=>{if(wb17RulOn()&&$('#wb17Rh'))wb17RulPaint()});

/* ---- 164: move a frame (with what is inside it and the arrows between them) to another board, keeping its ids so links to it still work ---- */
function wb17MoveMenu(btn){const fr=[...WB.sel].map(wbFind).filter(e=>e&&e.type==='frame');const bs=S.boards.filter(b=>b.id!==board().id);
  if(!bs.length){toast(t('wb17.mvNone'));return}wbMenu(btn,[...bs.map(b=>['▦ '+esc(boardName(b)),()=>wb17MoveTo(b.id)]),null,['＋ '+t('wb17.mvNew'),()=>wb17MoveTo('+')]])}
function wb17MoveTo(tid){const src=board(),set=wbCopySet();if(!set.some(e=>e.type==='frame'))return;
  if(tid==='+'){const b={id:uid(),name:(set.find(e=>e.type==='frame').title||t('wb.frame')),els:[],view:{x:40,y:40,z:1}};S.boards.push(b);tid=b.id}
  const tb=S.boards.find(b=>b.id===tid);if(!tb)return;wbMigrate(tb);
  const ids=new Set(set.map(e=>e.id)),snapS=JSON.stringify(src.els),snapT=JSON.stringify(tb.els);
  wbSnap();(WB.hist[tb.id]=WB.hist[tb.id]||[]).push(snapT);WB.redo[tb.id]=[];
  /* arrows from outside keep their place but lose the end that left */
  src.els.forEach(a=>{if(a.type!=='arrow'||ids.has(a.id))return;if((a.from&&ids.has(a.from))||(a.to&&ids.has(a.to))){const[p,q]=wbArrowPts(a);if(a.from&&ids.has(a.from)){a.x1=p[0];a.y1=p[1];a.from=null;delete a.fa}if(a.to&&ids.has(a.to)){a.x2=q[0];a.y2=q[1];a.to=null;delete a.ta}}});
  const mv=set.map(e=>JSON.parse(JSON.stringify(e)));
  let a=1e9,b=1e9;mv.forEach(e=>{if(e.type==='arrow')return;const q=wbBox(e);a=Math.min(a,q.x);b=Math.min(b,q.y)});
  let c=-1e9,top=1e9;tb.els.forEach(e=>{const q=e.type==='arrow'?{x:Math.min(e.x1||0,e.x2||0),y:Math.min(e.y1||0,e.y2||0),w:Math.abs((e.x2||0)-(e.x1||0)),h:0}:wbBox(e);c=Math.max(c,q.x+q.w);top=Math.min(top,q.y)});
  const dx=c>-1e9?c+120-a:0,dy=c>-1e9?top-b:0;const taken=new Set(tb.els.map(e=>e.id));
  mv.forEach(e=>{if(taken.has(e.id))e.id=uid();wbShift(e,e,dx,dy);delete e.pf});
  src.els=src.els.filter(e=>!ids.has(e.id));tb.els.push(...mv);
  WB.sel.clear();save();wbRender();
  const fid=mv.find(e=>e.type==='frame').id;
  toastAct(t('wb17.mvDone',boardName(tb)),t('wb17.mvGo'),()=>wb17GoFrame(tb.id,fid));
  WB17.mvUndo={s:src.id,t:tb.id,ss:snapS,st:snapT}}
function wb17GoFrame(bid,fid){if(!S.boards.some(b=>b.id===bid))return;S.activeBoard=bid;WB.sel.clear();save();renderBoards();setTimeout(()=>{wbCenterOn(fid);wbSetSel([fid])},60)}
/* a link to a frame that now lives on another board opens that board */
{const _f=wbFollow;wbFollow=function(e,...a){try{const l=e&&e.link;if(l&&l.t==='frame'&&!wbFind(l.id)){const b=S.boards.find(x=>(x.els||[]).some(o=>o.id===l.id));if(b){wb17GoFrame(b.id,l.id);return}}}catch(x){}return _f(e,...a)}}

/* ---- 166: the presentation flies between frames: zooms out a little, travels, zooms in ---- */
{hookFn('wbPresGo',()=>wbPresGo,f=>{wbPresGo=f},'pre',function(i,instant){WB17.pv0=WB.present&&!instant?Object.assign({},wbView()):null})}
{hookFn('wbPresGo',()=>wbPresGo,f=>{wbPresGo=f},'post',function(i,instant){const v0=WB17.pv0;WB17.pv0=null;if(!v0||instant||document.documentElement.classList.contains('rmotion'))return;
  const w=$('#bworld'),wr=$('#bwrap');if(!w||!wr)return;const v=wbView(),v1=Object.assign({},v);if(Math.abs(v1.x-v0.x)<1&&Math.abs(v1.y-v0.y)<1&&Math.abs(v1.z-v0.z)<1e-3)return;
  clearTimeout(w._t);w.classList.remove('anim');const W=wr.clientWidth,H=wr.clientHeight;
  const c0=[(W/2-v0.x)/v0.z,(H/2-v0.y)/v0.z],c1=[(W/2-v1.x)/v1.z,(H/2-v1.y)/v1.z],dist=Math.hypot(c1[0]-c0[0],c1[1]-c0[1]),zm=Math.min(v0.z,v1.z);
  const dip=Math.min(.55,dist*zm/(Math.max(W,H)*1.6)),l0=Math.log(v0.z),l1=Math.log(v1.z),T=dip>.08?1050:750,t0=performance.now(),id=++WB17.anim;
  const ease=x=>x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2,step=now=>{if(id!==WB17.anim||!WB.present)return;let p=Math.min(1,(now-t0)/T);const e=ease(p),z=Math.exp(l0+(l1-l0)*e)*(1-dip*Math.sin(Math.PI*p)),
    cx=c0[0]+(c1[0]-c0[0])*e,cy=c0[1]+(c1[1]-c0[1])*e;v.z=z;v.x=W/2-cx*z;v.y=H/2-cy*z;wbApplyView();if(p<1)(window.requestAnimationFrame||(f=>setTimeout(()=>f(performance.now()),16)))(step);else{Object.assign(v,v1);wbApplyView()}};
  v.z=v0.z;v.x=v0.x;v.y=v0.y;wbApplyView();(window.requestAnimationFrame||(f=>setTimeout(()=>f(performance.now()),16)))(step)})}

/* ---- 168: an eyedropper in the colour pops: the screen picker on PC Chrome, else a tap on a picture on the board ---- */
{hookFn('wbColorPop',()=>wbColorPop,f=>{wbColorPop=f},'post',function(btn,k){try{const p=$('#ppPop');if(!p||p.querySelector('.wb17ed'))return;
  const b=document.createElement('button');b.type='button';b.className='btn sm wb17ed';b.innerHTML=`<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4.5l5 5M17 2.5a2.1 2.1 0 0 1 3 3l-3 3-3-3z"/><path d="M14 6l-9.5 9.5L4 20l4.5-.5L18 10"/></svg> ${esc(t('wb17.ed'))}`;
  b.onclick=()=>{closePP();wb17Drop(k)};p.append(b)}catch(e){console.error(e)}})}
async function wb17Drop(k){if(window.EyeDropper){try{const r=await new EyeDropper().open();if(r&&r.sRGBHex){wb17Apply(k,r.sRGBHex)}}catch(e){}return}
  WB17.pick=k;$('#bwrap')&&$('#bwrap').classList.add('wb17pk');toast(t('wb17.edTap'))}
function wb17Apply(k,hex){const h=/^rgb/i.test(hex)?'#'+hex.match(/\d+/g).slice(0,3).map(x=>(+x).toString(16).padStart(2,'0')).join(''):hex;wbSetProp(k,h);wbToolbar();toast(t('wb17.edOk',h))}
document.addEventListener('pointerdown',async e=>{if(!WB17.pick)return;const wr=e.target&&e.target.closest&&e.target.closest('#bwrap');const k=WB17.pick;WB17.pick=null;$('#bwrap')&&$('#bwrap').classList.remove('wb17pk');
  if(!wr)return;e.preventDefault();e.stopPropagation();const n=e.target.closest('.bel'),el=n&&wbFind(n.dataset.id);
  if(!el||el.type!=='image'){toast(t('wb17.edNo'));return}
  try{const src=await nImg(el.img);if(!src){toast(t('wb17.edNo'));return}const im=new Image();im.onload=()=>{const r=n.getBoundingClientRect(),fx=Math.max(0,Math.min(.999,(e.clientX-r.left)/r.width)),fy=Math.max(0,Math.min(.999,(e.clientY-r.top)/r.height)),cv=document.createElement('canvas');cv.width=cv.height=1;
    const x=cv.getContext('2d');x.drawImage(im,Math.floor(fx*im.naturalWidth),Math.floor(fy*im.naturalHeight),1,1,0,0,1,1);const d=x.getImageData(0,0,1,1).data;wb17Apply(k,'#'+[d[0],d[1],d[2]].map(v=>v.toString(16).padStart(2,'0')).join(''))};im.src=src}catch(x){toast(t('wb17.edNo'))}},true);

/* ---- 169: a parametric Islamic star: points (5–16) and depth (how deep the points cut in) ---- */
function wb17StarD(n,dp,w,h,sw){const i=sw/2,W=Math.max(1,w-sw),H=Math.max(1,h-sw),cx=i+W/2,cy=i+H/2,rx=W/2,ry=H/2,rin=Math.max(.12,1-dp*.85),F=v=>+v.toFixed(2);let d='';
  for(let k=0;k<2*n;k++){const a=-Math.PI/2+k*Math.PI/n,m=k%2?rin:1;d+=(k?'L':'M')+F(cx+Math.cos(a)*rx*m)+' '+F(cy+Math.sin(a)*ry*m)}return d+'Z'}
{const _f=wbShapeD;wbShapeD=function(t,w,h,sw,rx){if(t==='istar'){const e=WB16.cur&&WB16.cur.type==='istar'?WB16.cur:null;return wb17StarD(e&&e.np||8,e&&e.dp!=null?e.dp:.42,w,h,sw)}return _f.apply(this,arguments)}}
if(!WB_SHAPES.includes('istar'))WB_SHAPES.push('istar');WB_TK.istar='shape';WB_ICONS.istar=`<path transform="translate(3 3)" d="${wb17StarD(8,.42,18,18,0)}"/>`;
function wb17StarNew(){const ss=wbSt('shape'),c=wbViewCenter();wbSnap();const e={id:uid(),type:'istar',x:c[0]-90,y:c[1]-90,w:180,h:180,np:8,dp:.42,color:ss.color,sw:ss.sw,op:ss.op,fc:ss.fc||'accent',fo:ss.fo,fs:ss.fs};
  wbEls().push(e);save();wbRender();wbSetSel([e.id]);setTimeout(()=>wb17StarEdit(),60)}
function wb17StarEdit(){const sel=[...WB.sel].map(wbFind).filter(e=>e&&e.type==='istar');if(!sel.length)return;const e0=sel[0];wbSnap();
  const n0=e0.np||8,d0=e0.dp!=null?e0.dp:.42;
  openInfo(esc(t('wb17.stT')),`<div class="wb17st"><svg class="wb17pv" viewBox="0 0 120 120"><path d="${wb17StarD(n0,d0,120,120,4)}"/></svg>
   <label>${esc(t('wb17.stN'))} <b id="wb17Nv">${n0}</b><input type="range" id="wb17N" min="5" max="16" step="1" value="${n0}"></label>
   <label>${esc(t('wb17.stD'))} <b id="wb17Dv">${Math.round(d0*100)}%</b><input type="range" id="wb17D" min="5" max="95" step="1" value="${Math.round(d0*100)}"></label>
   <div class="wb17pre">${[[8,.42],[8,.6],[10,.5],[12,.55],[16,.62],[6,.5]].map(([n,d])=>`<button class="btn sm" data-sp="${n},${d}"><svg viewBox="0 0 40 40"><path d="${wb17StarD(n,d,40,40,2)}"/></svg></button>`).join('')}</div></div>`);
  const box=$('#infoBox');box.classList.add('wb17box');
  const set=()=>{const n=+$('#wb17N').value,d=+$('#wb17D').value/100;$('#wb17Nv').textContent=n;$('#wb17Dv').textContent=Math.round(d*100)+'%';box.querySelector('.wb17pv path').setAttribute('d',wb17StarD(n,d,120,120,4));sel.forEach(e=>{e.np=n;e.dp=d});save();wbRefresh(sel.map(e=>e.id))};
  $('#wb17N').oninput=set;$('#wb17D').oninput=set;box.querySelectorAll('[data-sp]').forEach(b=>b.onclick=()=>{const[n,d]=b.dataset.sp.split(',').map(Number);$('#wb17N').value=n;$('#wb17D').value=Math.round(d*100);set()})}
{hookFn('openInfo',()=>openInfo,f=>{openInfo=f},'pre',function(){const b=$('#infoBox');if(b)b.classList.remove('wb17box')})}
/* double-click / double tap on a star opens its editor instead of its text */
{const _e=wbEdit;wbEdit=function(id,...a){const e=wbFind(id);if(e&&e.type==='istar'&&!(window.event&&window.event.altKey)){wbSetSel([id]);wb17StarEdit();return}return _e.call(this,id,...a)}}

/* ---- menus ---- */
{const _m=wbMenu;wbMenu=function(btn,items,...a){try{
  if(btn&&btn.dataset&&btn.dataset.a==='more'&&!items.some(i=>i&&i.wb17)){const sel=[...WB.sel].map(wbFind).filter(Boolean),add=[];
    if(sel.some(e=>e.type==='istar'))add.push(['✶ '+t('wb17.stE'),wb17StarEdit]);
    if(sel.some(e=>e.type==='frame'))add.push(['⇄ '+t('wb17.mv')+' …',()=>wb17MoveMenu(btn)]);
    if(add.length){items=[...items,null,...add];items[items.length-1].wb17=1}}
  if(btn&&btn.id==='wbMore'&&!items.some(i=>i&&i.wb17)){const b=board()||{},iso=b.bgp==='iso',gs=wb17Gs();
    items=[...items,null,Object.assign([(wb17RulOn()?'☑ ':'☐ ')+'📏 '+t('wb17.rul'),wb17RulToggle],{wb17:1}),['▦ '+t('wb17.gs')+' · '+(gs?gs:t('wb17.gs0'))+' …',()=>wb17GsMenu(btn)],[(iso?'✓ ':'')+'◇ '+t('wb17.iso'),()=>wbBgSet(iso?'':'iso')]];
    if((b.gd||[]).length)items.push(['✕ '+t('wb17.gClr',(b.gd||[]).length),wb17GClear])}
  if(btn&&btn.id==='wbIns'&&!items.some(i=>i&&i.wb17))items=[...items,null,Object.assign(['✶ '+t('wb17.star'),wb17StarNew],{wb17:1})];
  }catch(e){console.error(e)}return _m(btn,items,...a)}}

