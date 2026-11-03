/* ============ v3.162.0 thirteenth list G1: board — snapping connectors, frames that hold their items, measure, fitting sticky notes, element order, SVG import, gradients, shadows ============ */
const WB16={cur:null,exp:'',pend:null,ctx:null,defs:{},gi:0,shd:false,hov:null,msq:0,svT:0};
const WB16L={on:false};

/* ---- 151: a connector end snaps to the nearest side of an element and follows it ---- */
function wb16Box(e){return wbBox(e)}
function wb16AncPt(el,s){const b=wb16Box(el),o=4;return s==='t'?[b.x+b.w/2,b.y-o]:s==='b'?[b.x+b.w/2,b.y+b.h+o]:s==='l'?[b.x-o,b.y+b.h/2]:[b.x+b.w+o,b.y+b.h/2]}
function wb16Side(el,pt,other,m){const b=wb16Box(el),S_={t:[[b.x,b.y],[b.x+b.w,b.y]],b:[[b.x,b.y+b.h],[b.x+b.w,b.y+b.h]],l:[[b.x,b.y],[b.x,b.y+b.h]],r:[[b.x+b.w,b.y],[b.x+b.w,b.y+b.h]]};
  const d={};for(const k in S_)d[k]=wbDistSeg(pt,S_[k][0],S_[k][1]);const best=Object.keys(d).sort((a,c)=>d[a]-d[c])[0];
  const inside=pt[0]>b.x&&pt[0]<b.x+b.w&&pt[1]>b.y&&pt[1]<b.y+b.h;
  if(inside&&d[best]>(m||20)&&other){const dx=(other[0]-b.x-b.w/2)/(b.w||1),dy=(other[1]-b.y-b.h/2)/(b.h||1);return Math.abs(dx)>=Math.abs(dy)?(dx>0?'r':'l'):(dy>0?'b':'t')}
  return best}
function wb16Near(pt,m,not){const c=wbEls().filter(el=>!['stroke','arrow'].includes(el.type)&&el.id!==not&&!(el.ly&&wb16LyHidden(el))).filter(el=>{const b=wb16Box(el);return pt[0]>b.x-m&&pt[0]<b.x+b.w+m&&pt[1]>b.y-m&&pt[1]<b.y+b.h+m}).reverse();
  return c.find(el=>el.type!=='frame')||c[0]||null}
function wb16LyHidden(el){try{const L_=board().layers||[];const l=L_.find(q=>q.id===el.ly);return!!(l&&l.hide)}catch(x){return false}}
{const _f=wbArrowPts;wbArrowPts=function(e){const r=_f.apply(this,arguments);try{if(e&&(e.fa||e.ta)){const A=e.fa&&e.from&&wbFind(e.from),B=e.ta&&e.to&&wbFind(e.to);if(A)r[0]=wb16AncPt(A,e.fa);if(B)r[1]=wb16AncPt(B,e.ta)}}catch(x){}return r}}
{const _f=wbShapeFromOp;wbShapeFromOp=function(o,final){const r=_f.apply(this,arguments);try{if(r&&r.type==='arrow')wb16Snap(r,final)}catch(x){console.error(x)}return r}}
function wb16Snap(r,final){const m=26/(wbView().z||1),p=[r.x1,r.y1],q=[r.x2,r.y2];
  let A=r.from&&wbFind(r.from);if(!A){A=wb16Near(p,m,null);if(A)r.from=A.id}
  let B=r.to&&wbFind(r.to);if(!B){B=wb16Near(q,m,r.from);if(B)r.to=B.id}
  if(A)r.fa=wb16Side(A,p,B?wbCenter(B):q,m);if(B)r.ta=wb16Side(B,q,A?wbCenter(A):p,m);
  wb16AncShow(final?null:B,B?r.ta:null)}
function wb16AncShow(el,on){const w=$('#bworld');let n=$('#wb16Anc');if(!el||!w){n&&n.remove();return}
  if(!n){n=document.createElement('div');n.id='wb16Anc';n.className='wb16anc';w.append(n)}
  const z=wbView().z||1;n.innerHTML=['t','r','b','l'].map(s=>{const p=wb16AncPt(el,s);return`<i class="${s===on?'on':''}" style="left:${p[0]}px;top:${p[1]}px;transform:translate(-50%,-50%) scale(${1/z})"></i>`}).join('')}
document.addEventListener('pointerup',()=>setTimeout(()=>{if(!WB.op||WB.op.k!=='shape')wb16AncShow(null)},30),true);
function wb16ArrowSnapAll(on){const a=[...WB.sel].map(wbFind).filter(e=>e&&e.type==='arrow'&&(e.from||e.to));if(!a.length)return;wbSnap();
  a.forEach(e=>{const A=e.from&&wbFind(e.from),B=e.to&&wbFind(e.to);if(on){const[p,q]=wbArrowPts(e);if(A)e.fa=wb16Side(A,p,B?wbCenter(B):q,1e9);if(B)e.ta=wb16Side(B,q,A?wbCenter(A):p,1e9)}else{delete e.fa;delete e.ta}});
  save();wbRefresh(a.map(e=>e.id));toast(t(on?'wb16.snapOn':'wb16.snapOff'))}

/* ---- 153: an item dropped into a frame belongs to it (and moves with it even when it sticks out) ---- */
function wb16FrameOf(e,ids){const c=wbCenter(e);let best=null,ba=1e18;wbEls().forEach(f=>{if(f.type!=='frame'||f.id===e.id)return;if(c[0]>f.x&&c[0]<f.x+f.w&&c[1]>f.y&&c[1]<f.y+f.h){const a=f.w*f.h;if(a<ba){ba=a;best=f}}});return best}
function wb16FrameDrop(ids){let inF=null,out=0,ch=0;
  for(const id of ids){const e=wbFind(id);if(!e||e.type==='frame'||e.type==='arrow')continue;if(e.pf&&ids.includes(e.pf))continue;
    const f=wb16FrameOf(e);if(f&&e.pf!==f.id){e.pf=f.id;ch++;if(!ids.includes(f.id))inF=f}else if(!f&&e.pf){delete e.pf;out++}}
  if(!ch&&!out)return;save();if(inF){wb16Flash(inF.id);toast(t('wb16.inF',inF.title||t('wb.frame')))}else if(out)toast(t('wb16.outF'))}
function wb16Flash(id){const n=WB.nodes[id];if(!n)return;n.classList.remove('wb16fl');void n.offsetWidth;n.classList.add('wb16fl');setTimeout(()=>n.classList.remove('wb16fl'),900)}
{hookFn('wbTaskDrop',()=>wbTaskDrop,f=>{wbTaskDrop=f},'post',function(ids){try{wb16FrameDrop(ids||[])}catch(x){console.error(x)}})}
{const _f=wbClone;wbClone=function(list,...a){const r=_f.call(this,list,...a);try{const m={};list.forEach((e,i)=>{if(r[i])m[e.id]=r[i].id});r.forEach(c=>{if(c.pf){if(m[c.pf])c.pf=m[c.pf];else delete c.pf}if(c.lockF)delete c.lockF;if(c.from===null)delete c.fa;if(c.to===null)delete c.ta})}catch(x){}return r}}

/* ---- 154: locking a frame locks what is in it; unlocking it frees them again ---- */
function wb16LockKids(){const els=wbEls();let n=0,un=0;
  els.filter(f=>f.type==='frame'&&WB.sel.has(f.id)).forEach(f=>{
    if(f.lock){els.forEach(o=>{if(o.id===f.id||o.type==='frame'||o.lock)return;if(o.pf===f.id||wbInside(o,f)){o.lock=true;o.lockF=f.id;n++}})}
    else els.forEach(o=>{if(o.lockF===f.id){delete o.lock;delete o.lockF;un++}})});
  if(!n&&!un)return;save();const s=[...WB.sel];wbRender();wbSetSel(s);toast(t(n?'wb16.lockK':'wb16.unlockK',n||un))}
{hookFn('wbLockToggle',()=>wbLockToggle,f=>{wbLockToggle=f},'post',function(){try{wb16LockKids()}catch(x){console.error(x)}})}

/* ---- 156: measure the space between two items (two selected, or one selected and the pointer over another) ---- */
function wb16MsOn(){return!!(S.wbUi||{}).meas}
function wb16MsQ(){if(!wb16MsOn()&&!$('#wb16Ms'))return;if(WB16.msq)return;WB16.msq=1;setTimeout(()=>{WB16.msq=0;try{wb16MsPaint()}catch(x){console.error(x)}},16)}
function wb16Union(list){let a=1e9,b=1e9,c=-1e9,d=-1e9;list.forEach(e=>{const q=wb16Box(e);a=Math.min(a,q.x);b=Math.min(b,q.y);c=Math.max(c,q.x+q.w);d=Math.max(d,q.y+q.h)});return{x:a,y:b,w:c-a,h:d-b}}
function wb16Gaps(A,B){const L_=[],G=[],ax2=A.x+A.w,ay2=A.y+A.h,bx2=B.x+B.w,by2=B.y+B.h,oy=[Math.max(A.y,B.y),Math.min(ay2,by2)],ox=[Math.max(A.x,B.x),Math.min(ax2,bx2)];
  const sepX=B.x>=ax2||bx2<=A.x,sepY=B.y>=ay2||by2<=A.y;
  if(sepX){const l=B.x>=ax2?ax2:bx2,r=B.x>=ax2?B.x:A.x,y=oy[0]<oy[1]?(oy[0]+oy[1])/2:A.y+A.h/2;L_.push([l,y,r,y]);if(!(oy[0]<oy[1])){const bx=B.x>=ax2?B.x:bx2,by=y<B.y?B.y:by2;G.push([bx,by,bx,y])}}
  if(sepY){const tp=B.y>=ay2?ay2:by2,bt=B.y>=ay2?B.y:A.y,x=ox[0]<ox[1]?(ox[0]+ox[1])/2:A.x+A.w/2;L_.push([x,tp,x,bt]);if(!(ox[0]<ox[1])){const by=B.y>=ay2?B.y:by2,bx=x<B.x?B.x:bx2;G.push([bx,by,x,by])}}
  if(!sepX&&!sepY){const[I,O]=(B.w*B.h<=A.w*A.h)?[B,A]:[A,B],cx=I.x+I.w/2,cy=I.y+I.h/2;
    L_.push([O.x,cy,I.x,cy],[I.x+I.w,cy,O.x+O.w,cy],[cx,O.y,cx,I.y],[cx,I.y+I.h,cx,O.y+O.h])}
  return{L:L_.filter(l=>Math.hypot(l[2]-l[0],l[3]-l[1])>=.5),G}}
function wb16MsPaint(){const w=$('#bworld');let s=$('#wb16Ms');if(!w)return;let A=null,B=null;
  if(wb16MsOn()&&curView()==='boards'){const sel=[...WB.sel].map(wbFind).filter(Boolean),h=WB16.hov&&!WB.sel.has(WB16.hov)&&wbFind(WB16.hov);
    if(sel.length&&h){A=wb16Union(sel);B=wb16Box(h)}else if(sel.length===2){A=wb16Box(sel[0]);B=wb16Box(sel[1])}
    else if(sel.length>2){const g={};sel.forEach(e=>{const k=e.gid||e.id;(g[k]=g[k]||[]).push(e)});const ks=Object.keys(g);if(ks.length===2){A=wb16Union(g[ks[0]]);B=wb16Union(g[ks[1]])}}}
  if(!A||!B){s&&s.remove();return}
  if(!s){s=document.createElementNS('http://www.w3.org/2000/svg','svg');s.id='wb16Ms';s.setAttribute('class','wb16ms');w.append(s)}
  const z=wbView().z||1,sw=1.3/z,fz=11.5/z,{L:L_,G}=wb16Gaps(A,B);
  const lab=(x1,y1,x2,y2)=>{const v=Math.round(Math.hypot(x2-x1,y2-y1)),tx=String(v),mx=(x1+x2)/2,my=(y1+y2)/2,tw=(tx.length*7+10)/z,th=17/z;return`<rect x="${mx-tw/2}" y="${my-th/2}" width="${tw}" height="${th}" rx="${4/z}" class="wb16msb"/><text x="${mx}" y="${my+fz*.36}" font-size="${fz}" text-anchor="middle">${tx}</text>`};
  const tick=(x1,y1,x2,y2)=>{const hz=Math.abs(y2-y1)<.01,k=4/z;return hz?`<path d="M${x1} ${y1-k}V${y1+k}M${x2} ${y2-k}V${y2+k}"/>`:`<path d="M${x1-k} ${y1}H${x1+k}M${x2-k} ${y2}H${x2+k}"/>`};
  s.innerHTML=`<g stroke-width="${sw}">${G.map(g=>`<path class="wb16msg" d="M${g[0]} ${g[1]}L${g[2]} ${g[3]}" stroke-dasharray="${4/z} ${3/z}"/>`).join('')}${L_.map(l=>`<path d="M${l[0]} ${l[1]}L${l[2]} ${l[3]}"/>${tick(...l)}`).join('')}</g>${L_.map(l=>lab(...l)).join('')}`}
document.addEventListener('pointermove',e=>{if(!wb16MsOn()||curView()!=='boards'||e.pointerType==='touch')return;const n=e.target&&e.target.closest&&e.target.closest('#bworld .bel'),id=n&&n.dataset.id||null;if(id!==WB16.hov){WB16.hov=id;wb16MsQ()}else if(WB.op&&WB.op.k==='move')wb16MsQ()},{passive:true});
{hookFn('wbSetSel',()=>wbSetSel,f=>{wbSetSel=f},'post',function(){wb16MsQ();if(WB16L.on)wb16LpMark()})}
{hookFn('wbApplyView',()=>wbApplyView,f=>{wbApplyView=f},'post',function(){wb16MsQ()})}
{hookFn('wbRender',()=>wbRender,f=>{wbRender=f},'post',function(){try{WB16.hov=null;wb16MsQ();if(WB16L.on)wb16LpPaint()}catch(x){console.error(x)}})}
function wb16MsToggle(){S.wbUi=Object.assign({},S.wbUi||{},{meas:!wb16MsOn()});save();wb16MsQ();toast(t(wb16MsOn()?'wb16.msOn':'wb16.msOff'))}

/* ---- 157: a sticky note whose height follows its text (new sticky notes start like that; resizing it by hand fixes its size) ---- */
function wb16Fit(node,e){const tx=node.querySelector('.tx');if(!tx)return;const h=Math.max(100,Math.ceil(tx.scrollHeight+30));if(Math.abs(h-e.h)>1){e.h=h;node.style.height=h+'px';wbRefreshArrows([e.id]);clearTimeout(WB16.svT);WB16.svT=setTimeout(save,1200)}}
{hookFn('wbPlace',()=>wbPlace,f=>{wbPlace=f},'post',function(node,e){try{if(e&&e.type==='sticky'&&e.fit&&node&&node.isConnected){const o=WB.op;if(o&&o.k==='resize'&&o.id===e.id){delete e.fit;node.classList.remove('wb16fit');return}node.classList.add('wb16fit');wb16Fit(node,e)}wb16MsQ()}catch(x){}})}
{hookFn('wbAdd',()=>wbAdd,f=>{wbAdd=f},'pre',function(e){if(e&&e.type==='sticky'&&e.fit===undefined)e.fit=1})}
document.addEventListener('input',ev=>{const n=ev.target&&ev.target.closest&&ev.target.closest('#bworld .bel.b-sticky.editing');if(!n)return;const e=wbFind(n.dataset.id);if(e&&e.fit)wb16Fit(n,e)},true);
function wb16FitToggle(){const s=[...WB.sel].map(wbFind).filter(e=>e&&e.type==='sticky');if(!s.length)return;wbSnap();const on=!s.every(e=>e.fit);s.forEach(e=>{if(on)e.fit=1;else delete e.fit});save();wbRefresh(s.map(e=>e.id));toast(t(on?'wb16.fitOn':'wb16.fitOff'))}

/* ---- 160/161: gradient fill and shadow on shapes (and a shadow on pictures) — on the board, in PNG/PDF and in SVG ---- */
const WB16_SHF='<filter id="wb16s" x="-25%" y="-25%" width="150%" height="170%"><feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#000" flood-opacity=".35"/></filter>';
function wb16GradDef(id,g,c1,c2){const st=`<stop offset="0" style="stop-color:${c1}"/><stop offset="1" style="stop-color:${c2}"/>`;
  return g.k==='rad'?`<radialGradient id="${id}" cx=".5" cy=".5" r=".62">${st}</radialGradient>`:`<linearGradient id="${id}" gradientTransform="rotate(${+g.a||0} .5 .5)">${st}</linearGradient>`}
function wb16CanvasGrad(x,e,c1,c2){const w=e.w,h=e.h;let g;
  if(e.grad.k==='rad')g=x.createRadialGradient(w/2,h/2,0,w/2,h/2,Math.max(w,h)*.62);
  else{const a=(+e.grad.a||0)*Math.PI/180,cx=w/2,cy=h/2,L_=(Math.abs(w*Math.cos(a))+Math.abs(h*Math.sin(a)))/2;g=x.createLinearGradient(cx-Math.cos(a)*L_,cy-Math.sin(a)*L_,cx+Math.cos(a)*L_,cy+Math.sin(a)*L_)}
  g.addColorStop(0,c1);g.addColorStop(1,c2);return g}
function wb16Shd(x,on){if(!x)return;if(on){const sc=x.getTransform?x.getTransform().a:1;x.shadowColor='rgba(0,0,0,.35)';x.shadowBlur=12*sc;x.shadowOffsetX=0;x.shadowOffsetY=6*sc}else{x.shadowColor='transparent';x.shadowBlur=0;x.shadowOffsetY=0}}
{const _f=wbNodeHTML;wbNodeHTML=function(e){WB16.cur=e;let h=_f.apply(this,arguments);try{if(e&&wbIsShape(e))h=wb16Deco(e,h)}catch(x){}return h}}
function wb16Deco(e,h){const fc=wbGet(e,'fc');
  if(e.grad&&fc){const id='wb16g-'+e.id;h=h.replace(/<path d="([^"]*)" fill="[^"]*"/,(m,d)=>`<defs>${wb16GradDef(id,e.grad,wbCol(fc),wbCol(e.grad.c2||'#ffffff'))}</defs><path d="${d}" fill="url(#${id})"`)}
  if(e.type==='svgp'&&e.fr==='evenodd')h=h.replace('<path d=','<path fill-rule="evenodd" d=');
  return h}
{const _f=wbNodeCls;wbNodeCls=function(e){let c=_f.apply(this,arguments);if(e){if(e.shd&&(wbIsShape(e)||e.type==='image'))c+=' wb16shd';if(e.type==='sticky'&&e.fit)c+=' wb16fit'}return c}}
{const _g=wbGet;wbGet=function(e,k){if(k==='rx'&&e){WB16.cur=e;if(WB16.exp){WB16.pend=e;if(WB16.exp==='png')wb16Shd(WB16.ctx,!!e.shd&&wbIsShape(e))}}return _g.apply(this,arguments)}}
{const _f=wbColRes;wbColRes=function(c){const r=_f.apply(this,arguments);const e=WB16.pend;
  if(WB16.exp&&e&&e.grad&&wbIsShape(e)&&c===wbGet(e,'fc')){WB16.pend=null;const c2=_f(e.grad.c2||'#ffffff');
    if(WB16.exp==='svg'){const id='wb16x'+(++WB16.gi);WB16.defs[id]=wb16GradDef(id,e.grad,r,c2);return`url(#${id})`}
    if(WB16.exp==='png'&&WB16.ctx)return wb16CanvasGrad(WB16.ctx,e,r,c2)}
  return r}}
{const _f=wbShapeD;wbShapeD=function(t,w,h,sw,rx){let d;const e=WB16.cur;
  if(t==='svgp')d=e&&e.type==='svgp'?wb16SvgD(e,w,h,sw):_f.call(this,'rect',w,h,sw,0);else d=_f.apply(this,arguments);
  if(WB16.exp==='svg'&&e&&e.shd&&e.type===t){WB16.shd=true;d+='" filter="url(#wb16s)'}
  return d}}
{const _f=wbTextLayout;wbTextLayout=function(...a){if(WB16.exp==='png')wb16Shd(WB16.ctx,false);return _f.apply(this,a)}}
{const _f=nImg;nImg=async function(id){const d=await _f.apply(this,arguments);try{if(WB16.exp&&d){const e=wbEls().find(x=>x.type==='image'&&x.img===id);
  if(WB16.exp==='svg'&&e&&e.shd){WB16.shd=true;return d+'" filter="url(#wb16s)'}if(WB16.exp==='png')wb16Shd(WB16.ctx,!!(e&&e.shd))}}catch(x){}return d}}
{const _f=wbExportPng;wbExportPng=async function(...a){const gc=HTMLCanvasElement.prototype.getContext;WB16.exp='png';WB16.pend=null;WB16.ctx=null;
  HTMLCanvasElement.prototype.getContext=function(...b){const c=gc.apply(this,b);if(b[0]==='2d')WB16.ctx=c;return c};
  try{return await _f.apply(this,a)}finally{HTMLCanvasElement.prototype.getContext=gc;WB16.exp='';WB16.ctx=null;WB16.pend=null}}}
{const _f=wbExportSvg;wbExportSvg=async function(...a){const sb=saveBytes;WB16.exp='svg';WB16.defs={};WB16.shd=false;WB16.pend=null;
  saveBytes=function(name,mime,bytes,...r){try{if(/svg/.test(mime||'')){const ks=Object.keys(WB16.defs);if(ks.length||WB16.shd){let s=new TextDecoder().decode(bytes);s=s.replace(/(<svg[^>]*>)/,'$1<defs>'+ks.map(k=>WB16.defs[k]).join('')+(WB16.shd?WB16_SHF:'')+'</defs>');bytes=new TextEncoder().encode(s)}}}catch(x){console.error(x)}return sb.call(this,name,mime,bytes,...r)};
  try{return await _f.apply(this,a)}finally{saveBytes=sb;WB16.exp='';WB16.pend=null}}}
function wb16Sub(btn,items){const r=btn.getBoundingClientRect();setTimeout(()=>wbMenu({id:'',dataset:{},getBoundingClientRect:()=>r},items),0)}
function wb16ShapesSel(){return[...WB.sel].map(wbFind).filter(e=>e&&wbIsShape(e)&&!e.lock)}
function wb16GradSet(k,a,c2){const s=wb16ShapesSel();if(!s.length)return;wbSnap();s.forEach(e=>{if(!k){delete e.grad;return}
  if(!wbGet(e,'fc'))e.fc=e.color&&e.color!=='auto'?e.color:'accent';if(wbGet(e,'fo')<.6)e.fo=1;e.grad={k,a:a||0,c2:c2||(e.grad&&e.grad.c2)||'#ffffff'}});save();wbRefresh(s.map(e=>e.id))}
function wb16GradMenu(btn){const s=wb16ShapesSel();if(!s.length)return;const g=s[0].grad||{},cur=g.k?(g.k==='rad'?'rad':'l'+(g.a||0)):'';
  const mk=(id,lab,fn)=>[(cur===id?'● ':'')+lab,fn];
  const cols=['#ffffff','#000000','accent','#ef4444','#f59e0b','#22c55e','#3b82f6','#a855f7','#ec4899','#0ea5e9'];
  wb16Sub(btn,[mk('',t('wb16.gNone'),()=>wb16GradSet(null)),mk('l0',t('wb16.gH'),()=>wb16GradSet('lin',0)),mk('l90',t('wb16.gV'),()=>wb16GradSet('lin',90)),mk('l45',t('wb16.gD'),()=>wb16GradSet('lin',45)),mk('rad',t('wb16.gR'),()=>wb16GradSet('rad',0)),null,
    [t('wb16.gC2'),()=>wb16Sub(btn,cols.map(c=>[`<i class="wb16sw" style="background:${wbCol(c)}"></i>${esc(c==='accent'?t('wb16.acc'):c)}`,()=>{const s2=wb16ShapesSel();if(!s2.length)return;const k=(s2[0].grad||{}).k||'lin',a=(s2[0].grad||{}).a||0;wb16GradSet(k,a,c)}]))]])}
function wb16ShdToggle(){const s=[...WB.sel].map(wbFind).filter(e=>e&&(wbIsShape(e)||e.type==='image'));if(!s.length)return;wbSnap();const on=!s.every(e=>e.shd);s.forEach(e=>{if(on)e.shd=1;else delete e.shd});save();wbRefresh(s.map(e=>e.id))}

/* ---- 158: the order of the items (top first); drag a row to move an item above or below the others ---- */
function wb16Label(e){const k='wb16.k.'+(wbIsShape(e)&&e.type!=='svgp'?'shape':e.type),sk='wb.sh.'+e.type,nm=wbIsShape(e)&&e.type!=='svgp'&&t(sk)!==sk?t(sk):t(k)===k?t('wb16.k.x'):t(k);let s=String(e.title||e.text||e.tt||'').replace(/\s+/g,' ').trim();
  if(e.type==='noteref'){const n=NOTES().find(x=>x.id===e.note);s=n?(n.title||''):''}if(e.type==='taskref'){const x=LT().find(q=>q.id===e.task);s=x?x.text:''}
  return s?nm+' · '+s.slice(0,40):nm}
function wb16LpPaint(){const w=$('#bwrap');if(!w)return;let p=$('#wb16Lp');if(!WB16L.on){p&&p.remove();w.classList.remove('wb16lpon');return}
  if(!p){w.insertAdjacentHTML('beforeend',`<aside class="wbfp wb16lp" id="wb16Lp"><div class="wbfph"><b>${esc(t('wb16.lp'))}</b><button class="btn sm ghost" data-x aria-label="${esc(t('nfnd.x'))}">✕</button></div><p class="wb16lph">${esc(t('wb16.lpH'))}</p><div class="wbfpl"></div></aside>`);p=$('#wb16Lp');
    p.querySelector('[data-x]').onclick=()=>{WB16L.on=false;wb16LpPaint()};['pointerdown','wheel','touchstart','dblclick'].forEach(ev=>p.addEventListener(ev,e=>e.stopPropagation(),{passive:true}))}
  w.classList.add('wb16lpon');const els=wbEls(),l=p.querySelector('.wbfpl');
  l.innerHTML=els.length?els.slice().reverse().map(e=>`<div class="wbfpr wb16lr${WB.sel.has(e.id)?' on':''}${e.type==='frame'?' wb16lf':''}${e.lock?' wb16ll':''}" data-l="${e.id}"><span class="wb16lg" aria-label="${esc(t('wb16.drag'))}">⠿</span><span class="wb16lt" dir="auto">${esc(wb16Label(e))}</span></div>`).join(''):`<p class="muted">${esc(t('wb16.lp0'))}</p>`;
  l.querySelectorAll('[data-l]').forEach(r=>wb16LpRow(r,l))}
function wb16LpMark(){const p=$('#wb16Lp');if(!p)return;p.querySelectorAll('[data-l]').forEach(r=>r.classList.toggle('on',WB.sel.has(r.dataset.l)))}
function wb16LpRow(r,l){r.addEventListener('pointerdown',ev=>{if(ev.button)return;const id=r.dataset.l,sy=ev.clientY;let drag=false,to=null;
    const rows=()=>[...l.querySelectorAll('[data-l]')];
    const mv=e2=>{if(!drag&&Math.abs(e2.clientY-sy)<6)return;if(!drag){drag=true;r.classList.add('wb16drag');try{r.setPointerCapture(ev.pointerId)}catch(x){}}
      e2.preventDefault();const R=rows();let k=R.length;for(let i=0;i<R.length;i++){const b=R[i].getBoundingClientRect();if(e2.clientY<b.top+b.height/2){k=i;break}}to=k;
      R.forEach((q,i)=>{q.classList.toggle('wb16ia',i===k);q.classList.toggle('wb16ib',k===R.length&&i===R.length-1)});
      const lb=l.getBoundingClientRect();if(e2.clientY<lb.top+24)l.scrollTop-=8;else if(e2.clientY>lb.bottom-24)l.scrollTop+=8};
    const up=()=>{r.removeEventListener('pointermove',mv);r.removeEventListener('pointerup',up);r.removeEventListener('pointercancel',up);
      if(!drag){wbSetSel(wbExpand([id]));wbCenterOn(id);return}
      const vis=rows().map(q=>q.dataset.l),from=vis.indexOf(id);if(to===null||to===from||to===from+1){wb16LpPaint();return}
      vis.splice(from,1);vis.splice(to>from?to-1:to,0,id);const b=board(),m={};b.els.forEach(e=>m[e.id]=e);wbSnap();b.els=vis.slice().reverse().map(i=>m[i]).filter(Boolean);save();wbRender();toast(t('wb16.lpMoved'))};
    r.addEventListener('pointermove',mv);r.addEventListener('pointerup',up);r.addEventListener('pointercancel',up)})}
function wb16LpOpen(){WB16L.on=!WB16L.on;wb16LpPaint()}

/* ---- 159: an SVG file becomes board items (rectangles, ellipses, lines and text stay what they are; other drawings become editable shapes), grouped together ---- */
function wb16SvgD(e,w,h,sw){const i=(sw||0)/2,W=Math.max(1,w-sw),H=Math.max(1,h-sw),F=v=>+(v).toFixed(1);let d='';
  (e.sp||[]).forEach((p,k)=>{if(!p.length)return;d+='M'+p.map(q=>F(i+q[0]*W)+' '+F(i+q[1]*H)).join('L')+((e.z||[])[k]?'Z':'')});return d||`M${i} ${i}`}
function wb16Hex(c){if(!c||c==='none'||c==='transparent')return null;const m=String(c).match(/rgba?\(([^)]+)\)/);if(!m)return/^#/.test(c)?c:null;const v=m[1].split(/[\s,\/]+/).filter(Boolean).map(parseFloat);if(v.length>3&&v[3]===0)return null;return'#'+v.slice(0,3).map(n=>Math.max(0,Math.min(255,Math.round(n))).toString(16).padStart(2,'0')).join('')}
function wb16Hx(c){const h=wb16Hex(c);return h==='#000000'?'auto':h}
function wb16Alpha(c){const m=String(c||'').match(/rgba?\(([^)]+)\)/);if(!m)return 1;const v=m[1].split(/[\s,\/]+/).filter(Boolean);return v.length>3?parseFloat(v[3]):1}
function wb16Paint(svg,el,cs,k){let v=cs[k];if(/^url\(/.test(v||'')){const id=(v.match(/#([^"')]+)/)||[])[1];const g=id&&svg.querySelector('#'+CSS.escape(id));const st=g&&g.querySelector('stop');v=st?getComputedStyle(st).stopColor:'#888888'}return v}
function wb16Op(el,root){let o=1;for(let n=el;n&&n!==root.parentNode;n=n.parentNode){if(n.nodeType!==1)break;const v=parseFloat(getComputedStyle(n).opacity);if(!isNaN(v))o*=v}return o}
function wb16Clean(root){root.querySelectorAll('script,foreignObject,image,iframe,audio,video,animate,animateTransform,animateMotion,set,feImage,a').forEach(n=>{if(n.nodeName.toLowerCase()==='a'){while(n.firstChild)n.parentNode.insertBefore(n.firstChild,n);n.remove()}else n.remove()});
  [root,...root.querySelectorAll('*')].forEach(n=>[...n.attributes].forEach(a=>{const nm=a.name.toLowerCase();if(nm.startsWith('on')||((nm==='href'||nm.endsWith(':href'))&&!/^#/.test(a.value.trim()))||(nm==='style'&&/url\(\s*['"]?(?!#)/i.test(a.value)))n.removeAttribute(a.name)}));
  root.querySelectorAll('style').forEach(s=>{s.textContent=s.textContent.replace(/@import[^;]*;?/gi,'').replace(/url\(\s*(['"]?)(?!#)[^)]*\)/gi,'none')})}
function wb16Pick(){const inp=document.createElement('input');inp.type='file';inp.accept='.svg,image/svg+xml';inp.hidden=true;document.body.append(inp);
  inp.onchange=()=>{const f=inp.files&&inp.files[0];inp.remove();if(f)wb16SvgImport(f)};inp.click();setTimeout(()=>{if(inp.isConnected&&!inp.files.length)inp.remove()},120000)}
async function wb16SvgImport(file,at){let txt='';try{txt=await file.text()}catch(x){}if(txt.length>4e6){toast(t('wb16.svgBig'));return 0}
  const doc=new DOMParser().parseFromString(txt,'image/svg+xml'),root=doc.documentElement;if(!root||root.nodeName.toLowerCase()!=='svg'||doc.querySelector('parsererror')){toast(t('wb16.svgBad'));return 0}
  wb16Clean(root);const vb=(root.getAttribute('viewBox')||'').trim().split(/[\s,]+/).map(Number),pw=v=>v&&!/%/.test(v)?parseFloat(v):0;
  if(vb.length===4&&vb[2]>0&&vb[3]>0){if(!pw(root.getAttribute('width')))root.setAttribute('width',vb[2]);if(!pw(root.getAttribute('height')))root.setAttribute('height',vb[3])}else{if(!pw(root.getAttribute('width')))root.setAttribute('width',1000);if(!pw(root.getAttribute('height')))root.setAttribute('height',1000)}
  const host=document.createElement('div');host.style.cssText='position:fixed;left:-40000px;top:0;opacity:0;pointer-events:none;overflow:hidden;width:10px;height:10px';const svg=document.importNode(root,true);host.append(svg);document.body.append(host);
  let out=[];try{out=wb16SvgRead(svg)}catch(x){console.error(x)}finally{host.remove()}
  if(!out.length){toast(t('wb16.svg0'));return 0}
  let a=1e9,b=1e9,c=-1e9,d=-1e9;out.forEach(o=>{a=Math.min(a,o.x);b=Math.min(b,o.y);c=Math.max(c,o.x+o.w);d=Math.max(d,o.y+o.h)});
  const k=Math.max(.02,Math.min(40,480/Math.max(c-a,d-b,1))),[vx,vy]=at||wbViewCenter(),ox=vx-(c-a)*k/2,oy=vy-(d-b)*k/2,gid=out.length>1?uid():undefined,X=v=>+(ox+(v-a)*k).toFixed(1),Y=v=>+(oy+(v-b)*k).toFixed(1);
  const els=out.map(o=>{const sw=o.sw?Math.max(.5,+(o.sw*k).toFixed(1)):0,base={id:uid(),gid};
    if(o.t==='line')return{...base,type:'arrow',x1:X(o.x1),y1:Y(o.y1),x2:X(o.x2),y2:Y(o.y2),from:null,to:null,head:'none',color:o.st||'auto',sw:Math.max(1,sw||2),op:o.op};
    if(o.t==='text')return{...base,type:'text',x:X(o.x)-2,y:Y(o.y)-2,w:Math.max(40,+(o.w*k+16).toFixed(0)),h:Math.max(20,+(o.h*k).toFixed(0)),text:o.s,fs:Math.max(8,Math.round(o.fs*k)),color:o.fc||'auto',fw:o.fw>=600?700:400};
    const e={...base,type:o.t,x:X(o.x),y:Y(o.y),w:Math.max(2,+(o.w*k+sw).toFixed(1)),h:Math.max(2,+(o.h*k+sw).toFixed(1)),color:o.st||'auto',sw,op:o.sop*o.op,fc:o.fc||null,fo:o.fc?o.fop*o.op:.25,fs:16,text:''};
    e.x=+(e.x-sw/2).toFixed(1);e.y=+(e.y-sw/2).toFixed(1);if(o.t==='rect')e.rx=+(o.rx*k).toFixed(1);if(o.t==='svgp'){e.sp=o.sp;e.z=o.z;if(o.fr==='evenodd')e.fr='evenodd'}return e});
  wbSnap();wbEls().push(...els);save();wbRender();wbSetSel(els.map(e=>e.id));toast(t('wb16.svgOk',els.length));return els.length}
function wb16SvgRead(svg){const out=[],skip='defs,clipPath,mask,symbol,marker,pattern,linearGradient,radialGradient,filter';let budget=60000;
  const list=[...svg.querySelectorAll('path,rect,circle,ellipse,line,polyline,polygon,text')].filter(el=>!el.closest(skip)).slice(0,600);
  for(const el of list){const cs=getComputedStyle(el);if(cs.display==='none'||cs.visibility==='hidden')continue;const m=el.getCTM();if(!m)continue;
    const tp=(x,y)=>[m.a*x+m.c*y+m.e,m.b*x+m.d*y+m.f],rot=Math.abs(m.b)>1e-6||Math.abs(m.c)>1e-6,sc=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))||1,op=wb16Op(el,svg),tag=el.nodeName.toLowerCase();
    const fill=wb16Paint(svg,el,cs,'fill'),strk=wb16Paint(svg,el,cs,'stroke'),fc=wb16Hx(fill),st=wb16Hx(strk),sw=st?(parseFloat(cs.strokeWidth)||1)*sc:0,fop=(isNaN(parseFloat(cs.fillOpacity))?1:parseFloat(cs.fillOpacity))*wb16Alpha(fill),sop=(isNaN(parseFloat(cs.strokeOpacity))?1:parseFloat(cs.strokeOpacity))*wb16Alpha(strk);
    if(tag==='text'){const s=(el.textContent||'').trim();if(!s)continue;const bb=el.getBBox(),p=tp(bb.x,bb.y);out.push({t:'text',x:p[0],y:p[1],w:bb.width*sc,h:bb.height*sc,s,fs:(parseFloat(cs.fontSize)||16)*sc,fc:fc,fw:parseFloat(cs.fontWeight)||400});continue}
    if(!fc&&!st)continue;
    let bb;try{bb=el.getBBox()}catch(x){continue}
    if(tag==='line'){if(!st)continue;const p=tp(+el.getAttribute('x1')||0,+el.getAttribute('y1')||0),q=tp(+el.getAttribute('x2')||0,+el.getAttribute('y2')||0);out.push({t:'line',x:Math.min(p[0],q[0]),y:Math.min(p[1],q[1]),w:Math.abs(q[0]-p[0]),h:Math.abs(q[1]-p[1]),x1:p[0],y1:p[1],x2:q[0],y2:q[1],st,sw,op:op*sop});continue}
    const base={st,sw,fc,fop,sop,op};
    if(!rot&&(tag==='rect'||tag==='circle'||tag==='ellipse')){const p=tp(bb.x,bb.y),q=tp(bb.x+bb.width,bb.y+bb.height);
      out.push({...base,t:tag==='rect'?'rect':'ellipse',x:Math.min(p[0],q[0]),y:Math.min(p[1],q[1]),w:Math.abs(q[0]-p[0]),h:Math.abs(q[1]-p[1]),rx:tag==='rect'?(parseFloat(el.getAttribute('rx')||el.getAttribute('ry'))||0)*Math.abs(m.a):0});continue}
    let L_=0;try{L_=el.getTotalLength()}catch(x){}if(!(L_>0))continue;
    const Lpx=L_*sc,N=Math.max(24,Math.min(1600,Math.round(Lpx/1.2),budget));budget-=N;const step=Lpx/N,subs=[[]];let prev=null;
    for(let i=0;i<=N;i++){const pt=el.getPointAtLength(L_*i/N),p=tp(pt.x,pt.y);if(prev&&Math.hypot(p[0]-prev[0],p[1]-prev[1])>step*3+1)subs.push([]);subs[subs.length-1].push(p);prev=p}
    const sp=subs.filter(s=>s.length>1);if(!sp.length)continue;let a=1e9,b=1e9,c=-1e9,d=-1e9;sp.forEach(s=>s.forEach(p=>{a=Math.min(a,p[0]);b=Math.min(b,p[1]);c=Math.max(c,p[0]);d=Math.max(d,p[1])}));
    const W=Math.max(c-a,1e-6),H=Math.max(d-b,1e-6),closed=tag==='polygon'||tag==='rect'||tag==='circle'||tag==='ellipse';
    const eps=Math.max(W,H)/2400,simp=sp.map(s=>wbRdp(s,eps));
    out.push({...base,t:'svgp',x:a,y:b,w:c-a,h:d-b,fr:cs.fillRule,sp:simp.map(s=>s.map(p=>[+((p[0]-a)/W).toFixed(4),+((p[1]-b)/H).toFixed(4)])),z:simp.map(s=>closed||Math.hypot(s[0][0]-s[s.length-1][0],s[0][1]-s[s.length-1][1])<Math.max(1.5,step*2))});
    if(budget<=0)break}
  return out}
if(!WB_SHAPES.includes('svgp'))WB_SHAPES.push('svgp');

/* ---- menus: selection «⋯», board «⋯» and «＋» ---- */
{const _m=wbMenu;wbMenu=function(btn,items,...a){try{
  if(btn&&btn.dataset&&btn.dataset.a==='more'&&!items.some(i=>i&&i.wb16)){const sel=[...WB.sel].map(wbFind).filter(Boolean),add=[];
    const sh=sel.filter(e=>wbIsShape(e)),im=sel.filter(e=>e.type==='image'),st=sel.filter(e=>e.type==='sticky'),ar=sel.filter(e=>e.type==='arrow'&&(e.from||e.to));
    if(sh.length)add.push(['🎨 '+t('wb16.grad')+' …',()=>wb16GradMenu(btn)]);
    if(sh.length||im.length){const on=[...sh,...im].every(e=>e.shd);add.push([(on?'☑ ':'☐ ')+t('wb16.shd'),wb16ShdToggle])}
    if(st.length){const on=st.every(e=>e.fit);add.push([(on?'☑ ':'☐ ')+t('wb16.fit'),wb16FitToggle])}
    if(ar.length){add.push(['🔗 '+t('wb16.snap'),()=>wb16ArrowSnapAll(true)]);if(ar.some(e=>e.fa||e.ta))add.push(['↕ '+t('wb16.unsnap'),()=>wb16ArrowSnapAll(false)])}
    add.push(['🗂 '+t('wb16.lp'),wb16LpOpen]);
    items=[...items,null,...add];items[items.length-1].wb16=1}
  if(btn&&btn.id==='wbMore'&&!items.some(i=>i&&i.wb16)){items=[...items,null,Object.assign(['🗂 '+t('wb16.lp'),wb16LpOpen],{wb16:1}),[(wb16MsOn()?'☑ ':'☐ ')+'📐 '+t('wb16.ms'),wb16MsToggle]]}
  if(btn&&btn.id==='wbIns'&&!items.some(i=>i&&i.wb16))items=[...items,null,Object.assign(['⬆ '+t('wb16.svg'),wb16Pick],{wb16:1})];
  }catch(e){console.error(e)}return _m(btn,items,...a)}}
/* SVG files dropped on the board are imported as items, not as pictures */
document.addEventListener('drop',ev=>{const w=ev.target&&ev.target.closest&&ev.target.closest('#bwrap');if(!w)return;const f=[...((ev.dataTransfer||{}).files||[])].filter(x=>/svg/i.test(x.type)||/\.svg$/i.test(x.name));if(!f.length)return;ev.preventDefault();ev.stopPropagation();f.forEach(x=>wb16SvgImport(x,wbToWorld(ev.clientX,ev.clientY)))},true);
