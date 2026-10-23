/* ============ whiteboard (infinite canvas) ============ */
const NOTE_COLORS=['#fde68a','#bbf7d0','#bfdbfe','#fbcfe8','#ddd6fe','#fed7aa','#e5e7eb'];
const WB_COLORS=['auto','accent','#ef4444','#3b82f6','#22c55e','#f59e0b','#a855f7'];
const WB_SHAPES=['rect','ellipse','tri','diamond','star','bubble'];
const wbIsShape=e=>WB_SHAPES.includes(e&&e.type!==undefined?e.type:e);
const WB_FONTS={sans:'"IBM Plex Sans Arabic",Tahoma,sans-serif',naskh:'"Amiri","Noto Naskh Arabic","Traditional Arabic","Times New Roman",serif',hand:'"Segoe Print","Comic Sans MS","Aref Ruqaa",cursive',mono:'"Cascadia Mono",Consolas,"Courier New",monospace'};
const WB_TXT=['fw','fi','ta','ff'];
const WB_DEF={pen:{color:'auto',sw:3,op:1,auto:false},hl:{color:'#f59e0b',sw:18,op:.4},
  shape:{color:'auto',sw:2,op:1,fc:null,fo:.25,fs:16,rx:10,fw:600,fi:false,ta:'center',ff:'sans'},
  arrow:{color:'auto',sw:2,op:1,head:'end',route:'straight',dash:false,fs:14},line:{color:'auto',sw:2,op:1,head:'none',route:'straight',dash:false,fs:14},
  text:{color:'auto',fs:20,fw:400,fi:false,ta:'start',ff:'sans'},sticky:{fs:15,fw:400,fi:false,ta:'start',ff:'sans'},frame:{color:'accent',fs:14},erase:{mode:'part',size:18}};
const WB_PROPS={pen:['color','sw','op'],hl:['color','sw','op'],shape:['color','sw','op','fc','fo','fs','rx',...WB_TXT],arrow:['color','sw','op','head','route','dash','fs'],text:['color','fs',...WB_TXT],sticky:['fc','fs',...WB_TXT],frame:['color','fs']};
WB_PROPS.line=WB_PROPS.arrow;
const WB_TK={pen:'pen',hl:'hl',arrow:'arrow',line:'line',text:'text',sticky:'sticky',frame:'frame',erase:'erase'};WB_SHAPES.forEach(s=>WB_TK[s]='shape');
function wbSt(k){S.wbSt=S.wbSt||{};return S.wbSt[k]=Object.assign({},WB_DEF[k]||{},S.wbSt[k]||{})}
function wbKind(e){return e.type==='stroke'?(e.hl?'hl':'pen'):wbIsShape(e)?'shape':e.type}
function wbGet(e,k){const d=WB_DEF[wbKind(e)]||{};
  if(e.type==='sticky'&&k==='fc')return e.color||NOTE_COLORS[0];
  if(k==='fc'&&e.fc===undefined)return e.fill?(e.color||'auto'):null;
  if(k==='fo'&&e.fo===undefined)return e.fill?.22:d.fo;
  if(k==='op'&&e.op===undefined)return e.hl?.38:1;
  return e[k]!==undefined?e[k]:d[k]}
function wbPut(e,k,v){if(e.type==='sticky'&&k==='fc'){e.color=v||NOTE_COLORS[0];return}
  if((k==='fc'||k==='fo')&&e.fill!==undefined){if(e.fc===undefined)e.fc=e.fill?(e.color||'auto'):null;if(e.fo===undefined)e.fo=.22;delete e.fill}e[k]=v}
const board=()=>S.boards.find(b=>b.id===S.activeBoard)||S.boards[0];
let WB={tool:'select',shape:'rect',lock:false,sel:new Set(),hist:{},redo:{},nodes:{},space:false,op:null,ptrs:new Map(),edit:null,clip:null,pasteN:0,present:null,gl:[]};
function wbCol(c){if(!c||c==='auto')return'var(--text)';if(c==='accent')return'var(--accent)';return c}
function wbColRes(c){const cs=getComputedStyle(document.documentElement);if(!c||c==='auto')return cs.getPropertyValue('--text').trim()||'#e8e8e8';if(c==='accent')return cs.getPropertyValue('--accent').trim()||'#fddb00';return c}
function wbMigrate(b){if(b.els)return;b.els=[];
  (b.notes||[]).forEach(n=>b.els.push({id:n.id||uid(),type:'sticky',x:n.x||0,y:n.y||0,w:n.w||220,h:n.h||150,text:n.text||'',color:n.color||NOTE_COLORS[0]}));
  if(b.drawing){const id=uid(),el={id:uid(),type:'image',x:0,y:0,w:2600,h:1800,img:id};idbSet('nimg:'+id,b.drawing);nImgMem[id]=b.drawing;b.els.unshift(el);wbTrim(b,el,b.drawing)}
  delete b.notes;delete b.drawing;b.view=b.view||{x:40,y:40,z:1}}
function wbTrim(b,el,src){const im=new Image();im.onload=()=>{try{const W=im.naturalWidth,H=im.naturalHeight,c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');x.drawImage(im,0,0);const d=x.getImageData(0,0,W,H).data;let a=W,b_=H,cc=-1,dd=-1;
  for(let y=0;y<H;y++)for(let i=0;i<W;i++)if(d[(y*W+i)*4+3]>8){if(i<a)a=i;if(i>cc)cc=i;if(y<b_)b_=y;if(y>dd)dd=y}
  if(cc<0){b.els=b.els.filter(e=>e!==el)}else{const w=cc-a+9,h=dd-b_+9,o=document.createElement('canvas');o.width=w;o.height=h;o.getContext('2d').drawImage(im,a-4,b_-4,w,h,0,0,w,h);const url=o.toDataURL('image/png');idbSet('nimg:'+el.img,url);nImgMem[el.img]=url;const k=el.w/W;el.x=(a-4)*k;el.y=(b_-4)*k;el.w=w*k;el.h=h*k}
  save();if(board()===b&&$('#bworld'))wbRender()}catch(e){}};im.src=src}
function wbEls(){const b=board();wbMigrate(b);return b.els}
function wbView(){const b=board();return b.view||(b.view={x:40,y:40,z:1})}
function wbFind(id){return wbEls().find(e=>e.id===id)}
/* ---- history ---- */
function wbSnap(){const b=board();(WB.hist[b.id]=WB.hist[b.id]||[]).push(JSON.stringify(b.els));if(WB.hist[b.id].length>80)WB.hist[b.id].shift();WB.redo[b.id]=[]}
function wbUndo(){const b=board(),h=WB.hist[b.id];if(!h||!h.length)return;(WB.redo[b.id]=WB.redo[b.id]||[]).push(JSON.stringify(b.els));b.els=JSON.parse(h.pop());WB.sel.clear();save();wbRender()}
function wbRedo(){const b=board(),r=WB.redo[b.id];if(!r||!r.length)return;(WB.hist[b.id]=WB.hist[b.id]||[]).push(JSON.stringify(b.els));b.els=JSON.parse(r.pop());WB.sel.clear();save();wbRender()}
/* ---- geometry ---- */
const F1=v=>Math.round(v*10)/10;
function wbArrowGeom(e){const[p,q]=wbArrowPts(e),r=e.route||'straight',sw=e.sw||2;let d,poly,a0,a1,mid;
  if(r==='curve'){const dx=q[0]-p[0],dy=q[1]-p[1],L=Math.hypot(dx,dy)||1,k=(e.bend??.28)*L,c=[(p[0]+q[0])/2-dy/L*k,(p[1]+q[1])/2+dx/L*k];
    d=`M${F1(p[0])} ${F1(p[1])}Q${F1(c[0])} ${F1(c[1])} ${F1(q[0])} ${F1(q[1])}`;poly=[];for(let i=0;i<=16;i++){const t=i/16,u=1-t;poly.push([u*u*p[0]+2*u*t*c[0]+t*t*q[0],u*u*p[1]+2*u*t*c[1]+t*t*q[1]])}
    a1=Math.atan2(q[1]-c[1],q[0]-c[0]);a0=Math.atan2(p[1]-c[1],p[0]-c[0]);mid=poly[8]}
  else if(r==='elbow'){const hz=Math.abs(q[0]-p[0])>=Math.abs(q[1]-p[1]),mx=(p[0]+q[0])/2,my=(p[1]+q[1])/2;poly=hz?[p,[mx,p[1]],[mx,q[1]],q]:[p,[p[0],my],[q[0],my],q];
    d='M'+poly.map(v=>F1(v[0])+' '+F1(v[1])).join('L');a1=Math.atan2(q[1]-poly[2][1],q[0]-poly[2][0]);a0=Math.atan2(p[1]-poly[1][1],p[0]-poly[1][0]);mid=[(poly[1][0]+poly[2][0])/2,(poly[1][1]+poly[2][1])/2]}
  else{poly=[p,q];d=`M${F1(p[0])} ${F1(p[1])}L${F1(q[0])} ${F1(q[1])}`;a1=Math.atan2(q[1]-p[1],q[0]-p[0]);a0=a1+Math.PI;mid=[(p[0]+q[0])/2,(p[1]+q[1])/2]}
  const s=9+sw*1.7,hd=(pt,a)=>`M${F1(pt[0]-s*Math.cos(a-.45))} ${F1(pt[1]-s*Math.sin(a-.45))}L${F1(pt[0])} ${F1(pt[1])}L${F1(pt[0]-s*Math.cos(a+.45))} ${F1(pt[1]-s*Math.sin(a+.45))}`;
  const head=wbGet(e,'head');let hp='';if(head==='end'||head==='both')hp+=hd(q,a1);if(head==='both')hp+=hd(p,a0);
  return{p,q,d,poly,hp,mid}}
function wbBox(e){if(e.type==='stroke'){let a=1e9,b_=1e9,c=-1e9,d=-1e9;for(const pt of e.pts){const x=pt[0],y=pt[1];if(x<a)a=x;if(y<b_)b_=y;if(x>c)c=x;if(y>d)d=y}const p=(e.sw||2)/2+2;return{x:a-p,y:b_-p,w:c-a+2*p,h:d-b_+2*p}}
  if(e.type==='arrow'){const g=wbArrowGeom(e),m=12+(e.sw||2);let a=1e9,b_=1e9,c=-1e9,d=-1e9;for(const[x,y]of g.poly){if(x<a)a=x;if(y<b_)b_=y;if(x>c)c=x;if(y>d)d=y}return{x:a-m,y:b_-m,w:c-a+2*m,h:d-b_+2*m}}
  return{x:e.x,y:e.y,w:e.w,h:e.h}}
function wbHitArrow(e,w,r){const P=wbArrowGeom(e).poly;for(let i=1;i<P.length;i++)if(wbDistSeg(w,P[i-1],P[i])<r+(e.sw||2)/2)return true;return false}
function wbCenter(e){const b=wbBox(e);return[b.x+b.w/2,b.y+b.h/2]}
function wbEdge(e,toward){const b=wbBox(e),cx=b.x+b.w/2,cy=b.y+b.h/2;let dx=toward[0]-cx,dy=toward[1]-cy;if(!dx&&!dy)return[cx,cy];
  const tx=dx?(b.w/2+4)/Math.abs(dx):1e9,ty=dy?(b.h/2+4)/Math.abs(dy):1e9,k=Math.min(tx,ty);return[cx+dx*k,cy+dy*k]}
function wbArrowPts(e){let p=[e.x1,e.y1],q=[e.x2,e.y2];const A=e.from&&wbFind(e.from),B=e.to&&wbFind(e.to);
  if(A)p=wbCenter(A);if(B)q=wbCenter(B);if(A)p=wbEdge(A,B?wbCenter(B):q);if(B)q=wbEdge(B,A?wbCenter(A):p);return[p,q]}
function wbSmooth(pts){if(!pts.length)return'';if(pts.length<3)return'M'+pts.map(p=>p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' L');
  let d='M'+pts[0][0].toFixed(1)+' '+pts[0][1].toFixed(1);for(let i=1;i<pts.length-1;i++){const mx=(pts[i][0]+pts[i+1][0])/2,my=(pts[i][1]+pts[i+1][1])/2;d+=` Q${pts[i][0].toFixed(1)} ${pts[i][1].toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`}
  const l=pts[pts.length-1];return d+` L${l[0].toFixed(1)} ${l[1].toFixed(1)}`}
function wbRdp(pts,eps){if(pts.length<3)return pts;const[a,b]=[pts[0],pts[pts.length-1]];let md=0,mi=0;const dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy)||1;
  for(let i=1;i<pts.length-1;i++){const d=Math.abs(dy*pts[i][0]-dx*pts[i][1]+b[0]*a[1]-b[1]*a[0])/L;if(d>md){md=d;mi=i}}
  if(md>eps){const l=wbRdp(pts.slice(0,mi+1),eps),r=wbRdp(pts.slice(mi),eps);return l.slice(0,-1).concat(r)}return[a,b]}
function wbDistSeg(p,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],l=dx*dx+dy*dy;let t=l?((p[0]-a[0])*dx+(p[1]-a[1])*dy)/l:0;t=Math.max(0,Math.min(1,t));return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy)}
function wbHitStroke(e,p,r){const pts=e.pts;if(pts.length===1)return Math.hypot(p[0]-pts[0][0],p[1]-pts[0][1])<r+(e.sw||2);for(let i=1;i<pts.length;i++)if(wbDistSeg(p,pts[i-1],pts[i])<r+(e.sw||2)/2)return true;return false}
function wbShapeD(t,w,h,sw,rx){const i=sw/2,W=Math.max(1,w-sw),H=Math.max(1,h-sw),x0=i,y0=i,x1=i+W,y1=i+H,cx=i+W/2,cy=i+H/2,F=v=>+v.toFixed(2);
  if(t==='ellipse')return`M${F(x0)} ${F(cy)}A${F(W/2)} ${F(H/2)} 0 1 0 ${F(x1)} ${F(cy)}A${F(W/2)} ${F(H/2)} 0 1 0 ${F(x0)} ${F(cy)}Z`;
  if(t==='tri')return`M${F(cx)} ${F(y0)}L${F(x1)} ${F(y1)}L${F(x0)} ${F(y1)}Z`;
  if(t==='diamond')return`M${F(cx)} ${F(y0)}L${F(x1)} ${F(cy)}L${F(cx)} ${F(y1)}L${F(x0)} ${F(cy)}Z`;
  if(t==='star'){const ry=H/(1+Math.cos(Math.PI/5)),rX=W/2/Math.sin(2*Math.PI/5),sy=y0+ry;let d='';for(let k=0;k<10;k++){const a=-Math.PI/2+k*Math.PI/5,m=k%2?.45:1;d+=(k?'L':'M')+F(cx+Math.cos(a)*rX*m)+' '+F(sy+Math.sin(a)*ry*m)}return d+'Z'}
  if(t==='bubble'){const hb=H*.8,yb=y0+hb,r=Math.max(0,Math.min(rx??14,W/4,hb/3));return`M${F(x0+r)} ${F(y0)}H${F(x1-r)}A${F(r)} ${F(r)} 0 0 1 ${F(x1)} ${F(y0+r)}V${F(yb-r)}A${F(r)} ${F(r)} 0 0 1 ${F(x1-r)} ${F(yb)}H${F(x0+W*.38)}L${F(x0+W*.14)} ${F(y1)}L${F(x0+W*.2)} ${F(yb)}H${F(x0+r)}A${F(r)} ${F(r)} 0 0 1 ${F(x0)} ${F(yb-r)}V${F(y0+r)}A${F(r)} ${F(r)} 0 0 1 ${F(x0+r)} ${F(y0)}Z`}
  const r=Math.max(0,Math.min(rx||0,W/2,H/2));if(!r)return`M${F(x0)} ${F(y0)}H${F(x1)}V${F(y1)}H${F(x0)}Z`;
  return`M${F(x0+r)} ${F(y0)}H${F(x1-r)}A${F(r)} ${F(r)} 0 0 1 ${F(x1)} ${F(y0+r)}V${F(y1-r)}A${F(r)} ${F(r)} 0 0 1 ${F(x1-r)} ${F(y1)}H${F(x0+r)}A${F(r)} ${F(r)} 0 0 1 ${F(x0)} ${F(y1-r)}V${F(y0+r)}A${F(r)} ${F(r)} 0 0 1 ${F(x0+r)} ${F(y0)}Z`}
/* pressure outline */
function wbOutline(pts,sw){if(pts.length<2){const p=pts[0],r=sw*(.2+.9*(p[2]??.5))/2;return`M${F1(p[0]-r)} ${F1(p[1])}a${F1(r)} ${F1(r)} 0 1 0 ${F1(2*r)} 0a${F1(r)} ${F1(r)} 0 1 0 ${F1(-2*r)} 0Z`}
  const Lf=[],Rt=[];for(let i=0;i<pts.length;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)];let dx=b[0]-a[0],dy=b[1]-a[1];const l=Math.hypot(dx,dy)||1;dx/=l;dy/=l;const p=pts[i][2]??.5,r=Math.max(.35,sw*(.2+.9*p)/2);Lf.push([pts[i][0]-dy*r,pts[i][1]+dx*r]);Rt.push([pts[i][0]+dy*r,pts[i][1]-dx*r])}
  return wbSmooth(Lf)+wbSmooth(Rt.reverse()).replace(/^M/,'L')+'Z'}

/* ---- text formatting ---- */
function wbFmtIn(s){return s.replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').replace(/(^|[^*])\*(?![\s*])(.+?)\*(?!\*)/g,'$1<i>$2</i>').replace(/~~(.+?)~~/g,'<s>$1</s>')}
function wbFmt(txt){if(!txt)return'';return String(txt).split('\n').map((l,i)=>{let m;
    if((m=l.match(/^\s*(?:[-•*]\s+)?\[( |x|X)\]\s?(.*)$/))){const on=m[1]!==' ';return`<div class="wl ck${on?' on':''}" data-ln="${i}"><span class="cb">${on?'☑':'☐'}</span><span>${wbFmtIn(esc(m[2]))}</span></div>`}
    if((m=l.match(/^\s*[-•*]\s+(.*)$/)))return`<div class="wl"><span class="bu">•</span><span>${wbFmtIn(esc(m[1]))}</span></div>`;
    if((m=l.match(/^\s*(\d+)[.)]\s+(.*)$/)))return`<div class="wl"><span class="bu">${m[1]}.</span><span>${wbFmtIn(esc(m[2]))}</span></div>`;
    return`<div>${l?wbFmtIn(esc(l)):'<br>'}</div>`}).join('')}
function wbPlain(txt){return String(txt||'').split('\n').map(l=>l.replace(/^\s*(?:[-•*]\s+)?\[( |x|X)\]\s?/,(a,b)=>b===' '?'☐ ':'☑ ').replace(/^\s*[-•*]\s+/,'• ').replace(/\*\*(.+?)\*\*/g,'$1').replace(/~~(.+?)~~/g,'$1')).join('\n')}
function wbTxStyle(e){const ff=WB_FONTS[wbGet(e,'ff')]||WB_FONTS.sans;return`font-weight:${wbGet(e,'fw')};font-style:${wbGet(e,'fi')?'italic':'normal'};text-align:${wbGet(e,'ta')};font-family:${ff}`}
function wbToggleCk(id,ln){const e=wbFind(id);if(!e)return;const L_=String(e.text||'').split('\n');if(!L_[ln])return;wbSnap();L_[ln]=L_[ln].replace(/\[( |x|X)\]/,m=>m==='[ ]'?'[x]':'[ ]');e.text=L_.join('\n');save();wbRefresh([id])}
/* ---- rendering ---- */
function wbLinkLabel(l){if(!l)return'';if(l.t==='board'){const b=S.boards.find(x=>x.id===l.id);return'🗂 '+(b?boardName(b):'?')}if(l.t==='day')return'📅 '+gStr(keyToDate(l.k));return'🌐 '+l.u}
function wbNodeHTML(e){const esc2=esc;
  switch(e.type){
    case'sticky':case'text':return`<div class="tx" dir="auto" style="${wbTxStyle(e)}">${wbFmt(e.text)}</div>`;
    case'frame':return`<div class="flabel" dir="auto">${esc2(e.title||t('wb.frame'))}</div>`;
    case'image':return`<img data-img="${e.img}" alt="" draggable="false">`;
    case'stroke':{const b=wbBox(e),op=wbGet(e,'op');
      return`<svg width="${b.w}" height="${b.h}" viewBox="${b.x} ${b.y} ${b.w} ${b.h}"><path class="hit" d="${wbSmooth(e.pts)}" stroke-width="${(e.sw||2)+14}"/>${e.pr?`<path d="${wbOutline(e.pts,e.sw||2)}" fill="${wbCol(e.color)}" fill-opacity="${op}"/>`:`<path d="${wbSmooth(e.pts)}" fill="none" stroke="${wbCol(e.color)}" stroke-width="${e.sw||2}" stroke-linecap="round" stroke-linejoin="round" stroke-opacity="${op}"/>`}</svg>`}
    case'arrow':{const b=wbBox(e),g=wbArrowGeom(e),sw=e.sw||2,col=wbCol(e.color),dash=wbGet(e,'dash')?` stroke-dasharray="${sw*3} ${sw*2.4}"`:'';
      return`<svg width="${b.w}" height="${b.h}" viewBox="${b.x} ${b.y} ${b.w} ${b.h}" style="opacity:${wbGet(e,'op')}"><path class="hit" d="${g.d}" stroke-width="${sw+14}"/><path d="${g.d}" fill="none" stroke="${col}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"${dash}/>${g.hp?`<path d="${g.hp}" fill="none" stroke="${col}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>`:''}</svg><div class="tx alb" dir="auto" style="left:${F1(g.mid[0]-b.x)}px;top:${F1(g.mid[1]-b.y)}px;font-size:${wbGet(e,'fs')}px">${esc2(e.text||'')}</div>`}
    case'ayah':return`<div class="ayc"><div class="ayt" dir="rtl">${esc(e.text||'')}</div>${e.tfs?`<div class="ayf" dir="rtl">${esc(e.tfs)}</div>`:''}<small>📖 ${esc(qSurahName(e.s))} · ${e.a}${e.src?' · '+esc(tfsName(e.src)):''}</small></div>`;
    case'noteref':{const n=NOTES().find(x=>x.id===e.note);if(!n)return`<div class="nrmiss">${t('wb.noteGone')}</div>`;const cover=(n.imgs||[])[0];
      return e.mode==='text'?`<div class="nrtxt"><b dir="auto">${esc2(n.title||t('notes.untitled'))}</b><div dir="auto">${esc2(n.body||'')}</div></div>`
        :`${cover?`<div class="nrcov"><img data-img="${cover}" alt="" draggable="false"></div>`:''}<div class="nrbody"><b dir="auto">${esc2(n.title||t('notes.untitled'))}</b>${n.body?`<p dir="auto">${esc2(n.body.slice(0,220))}</p>`:''}<small>📝 ${gShort(keyToDate(n.day))}</small></div>`}
    case'taskref':{const x=LT().find(q=>q.id===e.task);if(!x)return`<div class="nrmiss">${t('wb.taskGone')}</div>`;const pct=Math.round(ltPct(x)*100),left=dDiff(todayKey(),x.deadline);
      return`<div class="trb"><b dir="auto">${x.status==='done'?'✓ ':''}${esc2(x.text)}</b><div class="ltbar"><i style="width:${pct}%"></i></div><small>${pct}% · ${x.status==='done'?t('lt.doneT'):x.status==='withdrawn'?t('lt.wdT'):left>=0?t('wb.daysLeft',left):t('wb.daysLate',-left)}</small></div>`}}
  if(wbIsShape(e)){const sw=wbGet(e,'sw')??2,fc=wbGet(e,'fc');
    return`<svg width="100%" height="100%" viewBox="0 0 ${e.w} ${e.h}" preserveAspectRatio="none"><path d="${wbShapeD(e.type,e.w,e.h,sw,wbGet(e,'rx'))}" fill="${fc?wbCol(fc):'none'}" fill-opacity="${wbGet(e,'fo')}" stroke="${sw>0?wbCol(e.color):'none'}" stroke-opacity="${wbGet(e,'op')}" stroke-width="${sw}" stroke-linejoin="round"/></svg><div class="tx lbl" dir="auto" style="font-size:${wbGet(e,'fs')}px;${wbTxStyle(e)}">${wbFmt(e.text)}</div>`}
  return''}
function wbInner(e){return wbNodeHTML(e)+(e.link?`<button class="blink" title="${esc(wbLinkLabel(e.link))}">🔗</button>`:'')+(e.lock?'<i class="block">🔒</i>':'')+(e.type==='arrow'||e.lock?'':'<i class="bh"></i>')}
function wbPlace(node,e){wbPlace0(node,e);if(e.type==='text'&&node.isConnected&&node.offsetHeight)e.h=node.offsetHeight}
function wbPlace0(node,e){if(e.type==='stroke'||e.type==='arrow'){const b=wbBox(e);node.style.cssText=`left:${b.x}px;top:${b.y}px;width:${b.w}px;height:${b.h}px`;return}
  node.style.cssText=`left:${e.x}px;top:${e.y}px;width:${e.w}px;height:${e.h}px;${e.type==='sticky'?`--nc:${e.color||NOTE_COLORS[0]};font-size:${wbGet(e,'fs')}px;`:''}${e.type==='text'?`color:${wbCol(e.color)};font-size:${e.fs||20}px;height:auto;min-height:${Math.round((e.fs||20)*1.4)}px;`:''}${e.type==='frame'?`--fc:${wbCol(e.color==='auto'||!e.color?'accent':e.color)};--ffs:${wbGet(e,'fs')}px;`:''}${wbIsShape(e)?`color:${wbCol(e.color)};`:''}`}
function wbNodeCls(e){return'bel b-'+e.type+(wbIsShape(e)?' b-shape':'')+(WB.sel.has(e.id)?' sel':'')+(e.lock?' locked':'')}
function wbLoadImgs(n){n.querySelectorAll('img[data-img]').forEach(async im=>{const d=await nImg(im.dataset.img);if(d)im.src=d})}
function wbMakeNode(e){const n=document.createElement('div');n.className=wbNodeCls(e);n.dataset.id=e.id;n.innerHTML=wbInner(e);wbPlace(n,e);return n}
function wbRender(){const w=$('#bworld');if(!w)return;const els=wbEls();w.innerHTML='';WB.nodes={};WB.gl=[];
  const order=[...els.filter(e=>e.type==='frame'),...els.filter(e=>e.type!=='frame')];
  for(const e of order){const n=wbMakeNode(e);WB.nodes[e.id]=n;w.append(n)}
  order.forEach(e=>{if(e.type==='text')wbPlace(WB.nodes[e.id],e)});wbLoadImgs(w);
  wbApplyView();wbToolbar()}
function wbRefresh(ids){for(const id of ids){const e=wbFind(id),n=WB.nodes[id];if(!e||!n)continue;n.className=wbNodeCls(e);n.innerHTML=wbInner(e);wbPlace(n,e);wbLoadImgs(n)}}
function wbRefreshArrows(movedIds){const s=new Set(movedIds);wbEls().forEach(e=>{if(e.type==='arrow'&&(s.has(e.from)||s.has(e.to)||s.has(e.id)))wbRefresh([e.id])})}
function wbApplyView(){const v=wbView(),w=$('#bworld'),wrap=$('#bwrap');if(!w)return;w.style.transform=`translate(${v.x}px,${v.y}px) scale(${v.z})`;
  let g=24*v.z;while(g<10)g*=4;wrap.style.backgroundSize=`${g}px ${g}px`;wrap.style.backgroundPosition=`${v.x}px ${v.y}px`;const zl=$('#bZoom');if(zl)zl.textContent=Math.round(v.z*100)+'%';wbMini()}
function wbToWorld(cx,cy){const r=$('#bwrap').getBoundingClientRect(),v=wbView();return[(cx-r.left-v.x)/v.z,(cy-r.top-v.y)/v.z]}
function wbZoomAt(cx,cy,f){const v=wbView(),r=$('#bwrap').getBoundingClientRect(),px=cx-r.left,py=cy-r.top,nz=Math.max(.1,Math.min(5,v.z*f));v.x=px-(px-v.x)*nz/v.z;v.y=py-(py-v.y)*nz/v.z;v.z=nz;wbApplyView();clearTimeout(wbZoomAt._t);wbZoomAt._t=setTimeout(save,500)}
function wbFit(){const els=wbEls(),r=$('#bwrap').getBoundingClientRect(),v=wbView();if(!els.length){v.x=40;v.y=40;v.z=1;wbApplyView();save();return}
  let a=1e9,b=1e9,c=-1e9,d=-1e9;els.forEach(e=>{const q=wbBox(e);a=Math.min(a,q.x);b=Math.min(b,q.y);c=Math.max(c,q.x+q.w);d=Math.max(d,q.y+q.h)});
  const z=Math.max(.1,Math.min(2,Math.min((r.width-60)/(c-a||1),(r.height-60)/(d-b||1))));v.z=z;v.x=(r.width-(c-a)*z)/2-a*z;v.y=(r.height-(d-b)*z)/2-b*z;wbApplyView();save()}
function wbViewCenter(){const r=$('#bwrap').getBoundingClientRect();return wbToWorld(r.left+r.width/2,r.top+r.height/2)}
/* ---- selection ---- */
function wbExpand(ids){const s=new Set(ids),els=wbEls(),g=new Set(els.filter(e=>s.has(e.id)&&e.gid).map(e=>e.gid));if(g.size)els.forEach(e=>{if(e.gid&&g.has(e.gid))s.add(e.id)});return[...s]}
function wbInside(o,f){const[c1,c2]=wbCenter(o);return c1>f.x&&c1<f.x+f.w&&c2>f.y&&c2<f.y+f.h}
function wbSetSel(ids){WB.sel=new Set(ids);Object.entries(WB.nodes).forEach(([id,n])=>n.classList.toggle('sel',WB.sel.has(id)));wbToolbar()}
function wbDelete(){if(!WB.sel.size)return;const b=board(),gone=new Set([...WB.sel].filter(id=>{const e=wbFind(id);return e&&!e.lock}));if(!gone.size){toast(t('wb.isLocked'));return}wbSnap();
  b.els.forEach(e=>{if(e.type==='arrow'&&!gone.has(e.id)){const[p,q]=wbArrowPts(e);if(gone.has(e.from)){e.x1=p[0];e.y1=p[1];e.from=null}if(gone.has(e.to)){e.x2=q[0];e.y2=q[1];e.to=null}}});
  b.els=b.els.filter(e=>!gone.has(e.id));WB.sel=new Set();save();wbRender()}
function wbShift(el,o,dx,dy){if(o.pts)el.pts=o.pts.map(p=>{const q=p.slice();q[0]+=dx;q[1]+=dy;return q});else if(el.type==='arrow'){el.x1=(o.x1||0)+dx;el.y1=(o.y1||0)+dy;el.x2=(o.x2||0)+dx;el.y2=(o.y2||0)+dy}else{el.x=o.x+dx;el.y=o.y+dy}}
function wbClone(list,dx,dy){const idm={},gm={};list.forEach(e=>idm[e.id]=uid());
  return list.map(e=>{const c=JSON.parse(JSON.stringify(e));c.id=idm[e.id];if(c.gid)c.gid=gm[c.gid]||(gm[c.gid]=uid());delete c.lock;
    if(c.type==='arrow'){const[p,q]=wbArrowPts(e);if(e.from&&idm[e.from])c.from=idm[e.from];else{c.x1=p[0];c.y1=p[1];c.from=null}if(e.to&&idm[e.to])c.to=idm[e.to];else{c.x2=q[0];c.y2=q[1];c.to=null}}
    wbShift(c,c,dx,dy);return c})}
function wbCopySet(){const ids=new Set(wbExpand([...WB.sel])),els=wbEls();els.forEach(f=>{if(f.type==='frame'&&ids.has(f.id))els.forEach(o=>{if(o.id!==f.id&&o.type!=='arrow'&&wbInside(o,f))ids.add(o.id)})});
  els.forEach(a=>{if(a.type==='arrow'&&a.from&&a.to&&ids.has(a.from)&&ids.has(a.to))ids.add(a.id)});return els.filter(e=>ids.has(e.id))}
function wbDup(){if(!WB.sel.size)return;wbSnap();const nw=wbClone(wbCopySet(),24,24);wbEls().push(...nw);save();wbRender();wbSetSel(nw.map(e=>e.id))}
function wbCopy(cut){if(!WB.sel.size)return;const list=wbClone(wbCopySet(),0,0);WB.clip=JSON.stringify(list);WB.pasteN=0;
  try{localStorage.setItem('thabat.wbclip',WB.clip)}catch(e){}try{navigator.clipboard&&navigator.clipboard.writeText('thabat-wb:'+WB.clip).catch(()=>{})}catch(e){}
  if(cut)wbDelete();toast(t(cut?'wb.cutDone':'wb.copied',list.length))}
function wbPaste(json){let list;try{list=JSON.parse(json||WB.clip||localStorage.getItem('thabat.wbclip')||'[]')}catch(e){list=[]}if(!list.length){toast(t('wb.clipEmpty'));return}
  let a=1e9,b=1e9,c=-1e9,d=-1e9;list.forEach(e=>{let q;if(e.type==='arrow'){if(e.from||e.to)return;q={x:Math.min(e.x1,e.x2),y:Math.min(e.y1,e.y2),w:Math.abs(e.x2-e.x1),h:Math.abs(e.y2-e.y1)}}else q=wbBox(e);a=Math.min(a,q.x);b=Math.min(b,q.y);c=Math.max(c,q.x+q.w);d=Math.max(d,q.y+q.h)});
  const[vx,vy]=wbViewCenter(),n=WB.pasteN++,dx=a<1e9?vx-(a+c)/2+n*24:0,dy=a<1e9?vy-(b+d)/2+n*24:0;
  wbSnap();const nw=wbClone(list,dx,dy);wbEls().push(...nw);save();wbRender();wbSetSel(nw.map(e=>e.id))}
function wbSelFor(k){return[...WB.sel].map(wbFind).filter(e=>e&&(WB_PROPS[wbKind(e)]||[]).includes(k))}
function wbSetProp(k,v,live){const sel=wbSelFor(k),kinds=sel.length?[...new Set(sel.map(wbKind))]:[WB_TK[WB.tool]].filter(Boolean);
  kinds.forEach(kd=>{if((WB_PROPS[kd]||[]).includes(k))wbSt(kd)[k]=v});
  if(sel.length){if(!WB._ls)wbSnap();sel.forEach(e=>wbPut(e,k,v));const ids=sel.map(e=>e.id);wbRefresh(ids);wbRefreshArrows(ids)}
  WB._ls=!!live;clearTimeout(WB._lt);if(live)WB._lt=setTimeout(save,500);else save()}
function wbFront(back){if(!WB.sel.size)return;wbSnap();const b=board(),s=b.els.filter(e=>WB.sel.has(e.id)),o=b.els.filter(e=>!WB.sel.has(e.id));b.els=back?[...s,...o]:[...o,...s];save();wbRender()}
function wbGroup(){const s=[...WB.sel];if(s.length<2)return;wbSnap();const g=uid();s.forEach(id=>{const e=wbFind(id);if(e)e.gid=g});save();wbToolbar();toast(t('wb.grouped'))}
function wbUngroup(){const s=[...WB.sel].map(wbFind).filter(e=>e&&e.gid);if(!s.length)return;wbSnap();s.forEach(e=>delete e.gid);save();wbToolbar();toast(t('wb.ungrouped'))}
function wbLockToggle(){const s=[...WB.sel].map(wbFind).filter(Boolean);if(!s.length)return;wbSnap();const on=!s.every(e=>e.lock);s.forEach(e=>{if(on)e.lock=true;else delete e.lock});save();wbRender();wbSetSel(s.map(e=>e.id));toast(t(on?'wb.lockedT':'wb.unlockedT'))}
function wbAlign(k){const s=[...WB.sel].map(wbFind).filter(e=>e&&!e.lock&&!(e.type==='arrow'&&(e.from||e.to)));if(s.length<2)return;wbSnap();const bs=s.map(wbBox);
  const X0=Math.min(...bs.map(q=>q.x)),X1=Math.max(...bs.map(q=>q.x+q.w)),Y0=Math.min(...bs.map(q=>q.y)),Y1=Math.max(...bs.map(q=>q.y+q.h));
  if(k==='dh'||k==='dv'){const h=k==='dh',ix=s.map((e,i)=>i).sort((i,j)=>h?bs[i].x-bs[j].x:bs[i].y-bs[j].y),tot=ix.reduce((a,i)=>a+(h?bs[i].w:bs[i].h),0),gap=((h?X1-X0:Y1-Y0)-tot)/(s.length-1);let pos=h?X0:Y0;
    ix.forEach(i=>{const q=bs[i];if(h)wbShift(s[i],s[i],pos-q.x,0);else wbShift(s[i],s[i],0,pos-q.y);pos+=(h?q.w:q.h)+gap})}
  else s.forEach((e,i)=>{const q=bs[i];const dx=k==='l'?X0-q.x:k==='r'?X1-q.x-q.w:k==='c'?(X0+X1)/2-q.x-q.w/2:0,dy=k==='t'?Y0-q.y:k==='b'?Y1-q.y-q.h:k==='m'?(Y0+Y1)/2-q.y-q.h/2:0;wbShift(e,e,dx,dy)});
  const sel=[...WB.sel];save();wbRender();wbSetSel(sel)}
/* ---- editing text ---- */
function wbEdit(id){const e=wbFind(id),n=WB.nodes[id];if(!e||!n)return;
  if(e.type==='ayah'){if(e.src)TF.src=e.src;openTafsir(e.s,e.a);return}if(e.type==='noteref'){openNote(e.note);return}if(e.type==='taskref'){const x=LT().find(q=>q.id===e.task);if(x)openLt(x,'edit');return}
  if(e.lock){toast(t('wb.isLocked'));return}
  const tx=n.querySelector(e.type==='frame'?'.flabel':'.tx');if(!tx)return;WB.edit=id;n.classList.add('editing');if(e.type!=='frame')tx.innerText=e.text||'';tx.contentEditable='true';tx.focus();
  const r=document.createRange();r.selectNodeContents(tx);const s_=getSelection();s_.removeAllRanges();s_.addRange(r);
  tx.onblur=()=>{tx.contentEditable='false';n.classList.remove('editing');const v=tx.innerText.replace(/\n$/,'');const k=e.type==='frame'?'title':'text';if((e[k]||'')!==v){wbSnap();e[k]=v;save()}WB.edit=null;
    if(e.type==='text'&&!v.trim()){board().els=board().els.filter(x=>x!==e);save();wbRender();return}wbRefresh([id]);if(e.type==='arrow')wbRefresh([id])}
  tx.onkeydown=ev=>{if(ev.key==='Escape'){tx.blur()}const mod=ev.ctrlKey||ev.metaKey,k=ev.key.toLowerCase();
    if(mod&&(k==='b'||k==='i')&&e.type!=='frame'){ev.preventDefault();const s2=getSelection(),txt=s2.toString(),m=k==='b'?'**':'*';document.execCommand('insertText',false,m+txt+m)}ev.stopPropagation()}}
/* ---- create ---- */
function wbNudge(e){let k=0;while(k<30&&wbEls().some(o=>o.x!=null&&Math.abs(o.x-e.x)<24&&Math.abs(o.y-e.y)<24)){e.x+=32;e.y+=32;k++}return e}
function wbAdd(e,select=true){wbSnap();wbEls().push(e);save();const n=wbMakeNode(e);WB.nodes[e.id]=n;$('#bworld').append(n);wbPlace(n,e);n.querySelectorAll('img[data-img]').forEach(async im=>{const d=await nImg(im.dataset.img);if(d)im.src=d});if(select)wbSetSel([e.id]);return e}
async function wbAddImages(files,at){const c=at||wbViewCenter();let dx=0;for(const f of files){if(!/^image\//.test(f.type))continue;try{const d=await shrinkImage(f,1800);const id=uid();await idbSet('nimg:'+id,d);nImgMem[id]=d;
    const im=await new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.src=d});let w=im.naturalWidth,h=im.naturalHeight;const k=Math.min(1,420/Math.max(w,h));w*=k;h*=k;
    wbAdd({id:uid(),type:'image',x:c[0]-w/2+dx,y:c[1]-h/2+dx,w,h,img:id});dx+=30}catch(x){toast(t('notes.imgErr'))}}}
function wbInsertNote(mode){const q=$('#wbPickQ')?$('#wbPickQ').value:'';const box=$('#ltBox');
  const list=sortNotes(NOTES().slice()).filter(n=>!q||(n.title+' '+n.body).toLowerCase().includes(q.toLowerCase()));
  box.innerHTML=`<h2>${t('wb.pickNote')}</h2><div class="seg" id="wbPickMode"><button data-m="card" class="${mode!=='text'?'on':''}">${t('wb.asCard')}</button><button data-m="text" class="${mode==='text'?'on':''}">${t('wb.asText')}</button></div>
   <input class="in" id="wbPickQ" placeholder="${esc(t('notes.search'))}" value="${esc(q)}" style="width:100%;margin:10px 0"><div class="wbpick">${list.length?list.map(n=>`<button class="suitem" data-n="${n.id}"><b dir="auto">${esc(n.title||t('notes.untitled'))}</b><small dir="auto">${esc((n.body||'').slice(0,90))} · ${gShort(keyToDate(n.day))}</small></button>`).join(''):`<div class="empty">${t('notes.empty')}</div>`}</div><div class="ltact"><button class="btn ghost" id="wbPickX">${t('lt.cancel')}</button></div>`;
  $('#ltModal').classList.add('on');$('#wbPickX').onclick=closeLt;
  $$('#wbPickMode button').forEach(b=>b.onclick=()=>wbInsertNote(b.dataset.m));$('#wbPickQ').oninput=()=>{const v=$('#wbPickQ').value;wbInsertNote(mode);const i=$('#wbPickQ');i.focus();i.setSelectionRange(v.length,v.length)};
  $$('.wbpick [data-n]').forEach(b=>b.onclick=()=>{closeLt();const c=wbViewCenter(),n=NOTES().find(x=>x.id===b.dataset.n),card=mode!=='text';wbAdd(wbNudge({id:uid(),type:'noteref',note:n.id,mode:card?'card':'text',x:c[0]-130,y:c[1]-(card&&(n.imgs||[]).length?160:90),w:260,h:card?((n.imgs||[]).length?320:170):220}))})}
function wbInsertTask(){const box=$('#ltBox'),list=LT().filter(x=>x.status==='active').concat(LT().filter(x=>x.status!=='active'));
  box.innerHTML=`<h2>${t('wb.pickTask')}</h2><div class="wbpick">${list.length?list.map(x=>`<button class="suitem" data-t="${x.id}"><b dir="auto">${esc(x.text)}</b><small>${Math.round(ltPct(x)*100)}% · ${t('lt.deadlineOn',gStr(keyToDate(x.deadline)))}</small></button>`).join(''):`<div class="empty">${t('wb.noTasks')}</div>`}</div><div class="ltact"><button class="btn ghost" id="wbPickX">${t('lt.cancel')}</button></div>`;
  $('#ltModal').classList.add('on');$('#wbPickX').onclick=closeLt;
  $$('.wbpick [data-t]').forEach(b=>b.onclick=()=>{closeLt();const c=wbViewCenter();wbAdd(wbNudge({id:uid(),type:'taskref',task:b.dataset.t,x:c[0]-120,y:c[1]-45,w:240,h:92}))})}
/* ---- templates ---- */
function wbTemplate(kind){const[cx,cy]=wbViewCenter(),add=[],rtl=document.documentElement.dir==='rtl',M=(i,n)=>rtl?n-1-i:i,F=(x,y,w,h,title,extra={})=>({id:uid(),type:'frame',x,y,w,h,title,color:'accent',...extra}),T=(x,y,w,h,text,fs=16)=>({id:uid(),type:'text',x,y,w,h,text,fs,color:'auto'});
  if(kind==='story'){const W=320,H=180,G=36,cols=3,rows=2,x0=cx-(cols*W+(cols-1)*G)/2,y0=cy-(rows*(H+80)+(rows-1)*G)/2;let n=1;
    for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const x=x0+M(c,cols)*(W+G),y=y0+r*(H+80+G);add.push(F(x,y,W,H,t('wb.scene',n),{kind:'sb'}));add.push(T(x,y+H+8,W,62,t('wb.sceneDesc'),14));n++}}
  if(kind==='kanban'){const W=300,H=560,G=28,x0=cx-(3*W+2*G)/2,y0=cy-H/2;[['todo','wb.kTodo'],['doing','wb.kDoing'],['done','wb.kDone']].forEach(([k,l],i)=>add.push(F(x0+M(i,3)*(W+G),y0,W,H,t(l),{kind:k,color:k==='done'?'#22c55e':k==='doing'?'#f59e0b':'accent'})));
    add.push({id:uid(),type:'sticky',x:x0+M(0,3)*(W+G)+20,y:y0+50,w:260,h:110,text:t('wb.kCard'),color:NOTE_COLORS[0]})}
  if(kind==='mind'){const C={id:uid(),type:'ellipse',x:cx-120,y:cy-55,w:240,h:110,text:t('wb.mCenter'),color:'accent',sw:3,fc:'accent',fo:.22,fs:18};add.push(C);
    [[-380,-190],[260,-190],[-380,150],[260,150]].forEach(([dx,dy],i)=>{const R={id:uid(),type:'rect',x:cx+dx,y:cy+dy,w:170,h:70,text:t('wb.mBranch',i+1),color:WB_COLORS[3+i%4],sw:2,fc:WB_COLORS[3+i%4],fo:.22};add.push(R);add.push({id:uid(),type:'arrow',from:C.id,to:R.id,x1:0,y1:0,x2:0,y2:0,color:'auto',sw:2})})}
  if(kind==='week'){const W=250,H=330,G=18,d0=addDays(keyToDate(todayKey()),-((keyToDate(todayKey()).getDay()+6)%7)),x0=cx-(7*W+6*G)/2,y0=cy-H/2;
    for(let i=0;i<7;i++){const d=addDays(d0,i);add.push(F(x0+M(i,7)*(W+G),y0,W,H,L().days[d.getDay()]+' '+gShort(d),{kind:'day'}))}}
  if(!add.length)return;wbSnap();wbEls().push(...add);save();wbSetSel([]);wbRender();wbFit()}
/* ---- export PNG / SVG ---- */
function wbExportSet(){return WB.sel.size?wbCopySet():wbEls()}
function wbBounds(els){let a=1e9,b=1e9,c=-1e9,d=-1e9;els.forEach(e=>{const q=wbBox(e);a=Math.min(a,q.x);b=Math.min(b,q.y);c=Math.max(c,q.x+q.w);d=Math.max(d,q.y+q.h)});
  els.filter(e=>e.type==='frame').forEach(e=>{b=Math.min(b,e.y-wbGet(e,'fs')*1.6)});return{a,b,c,d}}
let wbMeasCtx=null;
function wbLines(txt,w,font){const x=wbMeasCtx||(wbMeasCtx=document.createElement('canvas').getContext('2d'));x.font=font;const out=[];
  for(const para of String(txt||'').split('\n')){let line='';for(const word of para.split(' ')){const tr=line?line+' '+word:word;if(x.measureText(tr).width>w&&line){out.push(line);line=word}else line=tr}out.push(line)}return out}
const wbAr=s=>/[֐-ࣿ]/.test(s);
function wbFont(e,fs,fw){const ff=WB_FONTS[e?wbGet(e,'ff'):'sans']||WB_FONTS.sans;return`${e&&wbGet(e,'fi')?'italic ':''}${fw||(e?wbGet(e,'fw'):400)} ${fs}px ${ff}`}
/* text layout shared by PNG and SVG: returns [{s,x,y,anchor}] */
function wbTextLayout(txt,X,Y,w,fs,lh,font,ta,vcenter,h){const lines=wbLines(wbPlain(txt),w,font);let y0=Y+fs;if(vcenter)y0=Y+(h-lines.length*lh)/2+fs*.85;
  return lines.map((s,i)=>{const rtl=wbAr(s);let al=ta||'start';if(al==='start')al=rtl?'right':'left';else if(al==='end')al=rtl?'left':'right';
    return{s,y:y0+i*lh,x:al==='center'?X+w/2:al==='right'?X+w:X,anchor:al==='center'?'middle':al==='right'?'end':'start'}})}
async function wbExportPng(els){els=els||wbExportSet();if(!els.length){toast(t('notes.nothing'));return}const{a,b,c,d}=wbBounds(els);
  const M=40,W=c-a+2*M,H=d-b+2*M,sc=window.WB_SC||Math.min(2,6000/Math.max(W,H));const cv=document.createElement('canvas');cv.width=Math.ceil(W*sc);cv.height=Math.ceil(H*sc);const x=cv.getContext('2d');x.scale(sc,sc);x.translate(M-a,M-b);
  const cs=getComputedStyle(document.documentElement),bg=cs.getPropertyValue('--bg').trim()||'#111',fg=wbColRes('auto'),muted=cs.getPropertyValue('--muted').trim()||'#999';if(!window.WB_TR){x.fillStyle=bg;x.fillRect(a-M,b-M,W,H)}
  const txt=(L_,font,col)=>{x.font=font;x.fillStyle=col;L_.forEach(l=>{x.textAlign=l.anchor==='middle'?'center':l.anchor==='end'?'right':'left';x.direction=wbAr(l.s)?'rtl':'ltr';x.fillText(l.s,l.x,l.y)})};
  const rr=(X,Y,w,h,r)=>{x.beginPath();x.roundRect?x.roundRect(X,Y,w,h,r):x.rect(X,Y,w,h)};
  const loadImg=async id=>{const dd=await nImg(id);if(!dd)return null;return await new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.onerror=()=>r(null);i.src=dd})};
  for(const e of [...els.filter(e=>e.type==='frame'),...els.filter(e=>e.type!=='frame')]){x.save();x.globalAlpha=1;
    if(e.type==='frame'){const col=wbColRes(e.color&&e.color!=='auto'?e.color:'accent'),fz=wbGet(e,'fs');x.fillStyle=col+'14';x.strokeStyle=col;x.setLineDash([8,6]);x.lineWidth=1.5;rr(e.x,e.y,e.w,e.h,14);x.fill();x.stroke();x.setLineDash([]);
      const f=wbFont(null,fz,600);txt(wbTextLayout(e.title||'',e.x+8,e.y-fz*1.45,e.w-16,fz,fz*1.3,f,'start'),f,col)}
    else if(wbIsShape(e)){const sw=wbGet(e,'sw')??2,fc=wbGet(e,'fc'),fz=wbGet(e,'fs'),p=new Path2D(wbShapeD(e.type,e.w,e.h,sw,wbGet(e,'rx')));x.translate(e.x,e.y);x.lineJoin='round';
      if(fc){x.globalAlpha=wbGet(e,'fo');x.fillStyle=wbColRes(fc);x.fill(p)}if(sw>0){x.globalAlpha=wbGet(e,'op');x.strokeStyle=wbColRes(e.color);x.lineWidth=sw;x.stroke(p)}x.globalAlpha=1;x.translate(-e.x,-e.y);
      if(e.text){const f=wbFont(e,fz),top=e.type==='tri'?e.h*.3:0,bot=e.type==='bubble'?e.h*.2:0;txt(wbTextLayout(e.text,e.x+10,e.y+top,e.w-20,fz,fz*1.35,f,wbGet(e,'ta'),true,e.h-top-bot),f,fg)}}
    else if(e.type==='stroke'){const col=wbColRes(e.color);x.globalAlpha=wbGet(e,'op');if(e.pr){x.fillStyle=col;x.fill(new Path2D(wbOutline(e.pts,e.sw||2)))}else{x.strokeStyle=col;x.lineWidth=e.sw||2;x.lineCap=x.lineJoin='round';x.stroke(new Path2D(wbSmooth(e.pts)))}}
    else if(e.type==='arrow'){const g=wbArrowGeom(e),col=wbColRes(e.color),sw=e.sw||2;x.globalAlpha=wbGet(e,'op');x.strokeStyle=col;x.lineWidth=sw;x.lineCap=x.lineJoin='round';if(wbGet(e,'dash'))x.setLineDash([sw*3,sw*2.4]);x.stroke(new Path2D(g.d));x.setLineDash([]);if(g.hp)x.stroke(new Path2D(g.hp));
      if(e.text){x.globalAlpha=1;const fz=wbGet(e,'fs'),f=wbFont(null,fz,500);x.font=f;const L_=wbLines(e.text,240,f),tw=Math.max(...L_.map(l=>x.measureText(l).width))+14,th=L_.length*fz*1.3+8;x.fillStyle=bg;rr(g.mid[0]-tw/2,g.mid[1]-th/2,tw,th,6);x.fill();
        txt(L_.map((s,i)=>({s,x:g.mid[0],y:g.mid[1]-th/2+4+fz+i*fz*1.3,anchor:'middle'})),f,fg)}}
    else if(e.type==='sticky'){x.fillStyle=e.color||NOTE_COLORS[0];x.shadowColor='rgba(0,0,0,.3)';x.shadowBlur=14;x.shadowOffsetY=5;rr(e.x,e.y,e.w,e.h,12);x.fill();x.shadowColor='transparent';x.save();rr(e.x,e.y,e.w,e.h,12);x.clip();const fz=wbGet(e,'fs'),f=wbFont(e,fz);txt(wbTextLayout(e.text,e.x+14,e.y+12,e.w-28,fz,fz*1.55,f,wbGet(e,'ta')),f,'#1b1d22');x.restore()}
    else if(e.type==='text'){const fz=e.fs||20,f=wbFont(e,fz);txt(wbTextLayout(e.text,e.x,e.y,e.w,fz,fz*1.4,f,wbGet(e,'ta')),f,wbColRes(e.color))}
    else if(e.type==='image'){const im=await loadImg(e.img);if(im)x.drawImage(im,e.x,e.y,e.w,e.h)}
    else if(e.type==='ayah'){x.fillStyle=cs.getPropertyValue('--panel').trim()||'#1b1d22';x.strokeStyle=wbColRes('accent');rr(e.x,e.y,e.w,e.h,14);x.fill();x.stroke();const f1=`400 19px "Q_hafs","IBM Plex Sans Arabic",serif`,L1=wbTextLayout(e.text,e.x+14,e.y+10,e.w-28,19,34,f1,'center');txt(L1,f1,fg);let yy=e.y+16+L1.length*34;if(e.tfs){const f2=wbFont(null,13);txt(wbTextLayout(e.tfs,e.x+14,yy,e.w-28,13,20,f2,'start').filter(l=>l.y<e.y+e.h-24),f2,muted)}const f3=wbFont(null,11);txt([{s:qSurahName(e.s)+' · '+e.a,x:e.x+e.w/2,y:e.y+e.h-10,anchor:'middle'}],f3,muted)}
    else if(e.type==='noteref'||e.type==='taskref'){x.fillStyle=cs.getPropertyValue('--panel').trim()||'#1b1d22';x.strokeStyle='rgba(128,128,128,.4)';rr(e.x,e.y,e.w,e.h,14);x.fill();x.stroke();let yy=e.y+8;
      if(e.type==='noteref'){const n=NOTES().find(q=>q.id===e.note);if(n){if(e.mode!=='text'&&(n.imgs||[])[0]){const im=await loadImg(n.imgs[0]);if(im){const h=Math.min(e.h*.5,e.w*.66);x.save();rr(e.x,e.y,e.w,h,14);x.clip();const k=Math.max(e.w/im.width,h/im.height);x.drawImage(im,e.x+(e.w-im.width*k)/2,e.y+(h-im.height*k)/2,im.width*k,im.height*k);x.restore();yy=e.y+h+6}}
        const f1=wbFont(null,15,600),f2=wbFont(null,13);txt(wbTextLayout(n.title||'',e.x+14,yy,e.w-28,15,20,f1,'start'),f1,fg);x.save();x.beginPath();x.rect(e.x,yy+26,e.w,Math.max(0,e.y+e.h-yy-32));x.clip();txt(wbTextLayout(n.body||'',e.x+14,yy+26,e.w-28,13,19,f2,'start'),f2,muted);x.restore()}}
      else{const t_=LT().find(q=>q.id===e.task);if(t_){const f1=wbFont(null,15,600);txt(wbTextLayout(t_.text,e.x+14,yy+4,e.w-28,15,20,f1,'start'),f1,fg);const pc=ltPct(t_);x.fillStyle='rgba(128,128,128,.3)';rr(e.x+14,e.y+e.h-30,e.w-28,6,3);x.fill();x.fillStyle=wbColRes('accent');rr(e.x+14,e.y+e.h-30,(e.w-28)*pc,6,3);x.fill()}}}
    x.restore()}
  if(window._wbPdf){window._wbPdf=0;saveBytes(safeName(boardName(board()))+'.pdf','application/pdf',new Blob([jpegPdf(cv.toDataURL('image/jpeg',.92),cv.width,cv.height,W*.75,H*.75)],{type:'application/pdf'}));return}
  cv.toBlob(bl=>saveBytes(safeName(boardName(board()))+'.png','image/png',bl),'image/png')}
function wbXml(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
async function wbExportSvg(els){els=els||wbExportSet();if(!els.length){toast(t('notes.nothing'));return}const{a,b,c,d}=wbBounds(els);const M=40,X0=a-M,Y0=b-M,W=c-a+2*M,H=d-b+2*M;
  const cs=getComputedStyle(document.documentElement),bg=cs.getPropertyValue('--bg').trim()||'#111',panel=cs.getPropertyValue('--panel').trim()||'#1b1d22',fg=wbColRes('auto'),muted=cs.getPropertyValue('--muted').trim()||'#999';
  const T=(L_,fz,col,e,fw)=>L_.map(l=>`<text x="${F1(l.x)}" y="${F1(l.y)}" font-family="${wbXml(WB_FONTS[e?wbGet(e,'ff'):'sans']||WB_FONTS.sans)}" font-size="${fz}" font-weight="${fw||(e?wbGet(e,'fw'):400)}"${e&&wbGet(e,'fi')?' font-style="italic"':''} fill="${col}" text-anchor="${wbAr(l.s)?({start:'end',end:'start'}[l.anchor]||'middle'):l.anchor}"${wbAr(l.s)?' direction="rtl"':''}>${wbXml(l.s)}</text>`).join('');
  let o=`<rect x="${X0}" y="${Y0}" width="${W}" height="${H}" fill="${bg}"/>`;
  for(const e of [...els.filter(e=>e.type==='frame'),...els.filter(e=>e.type!=='frame')]){
    if(e.type==='frame'){const col=wbColRes(e.color&&e.color!=='auto'?e.color:'accent'),fz=wbGet(e,'fs');o+=`<rect x="${e.x}" y="${e.y}" width="${e.w}" height="${e.h}" rx="14" fill="${col}" fill-opacity=".08" stroke="${col}" stroke-width="1.5" stroke-dasharray="8 6"/>`+T(wbTextLayout(e.title||'',e.x+8,e.y-fz*1.45,e.w-16,fz,fz*1.3,wbFont(null,fz,600),'start'),fz,col,null,600)}
    else if(wbIsShape(e)){const sw=wbGet(e,'sw')??2,fc=wbGet(e,'fc'),fz=wbGet(e,'fs');o+=`<path transform="translate(${F1(e.x)} ${F1(e.y)})" d="${wbShapeD(e.type,e.w,e.h,sw,wbGet(e,'rx'))}" fill="${fc?wbColRes(fc):'none'}" fill-opacity="${wbGet(e,'fo')}" stroke="${sw>0?wbColRes(e.color):'none'}" stroke-opacity="${wbGet(e,'op')}" stroke-width="${sw}" stroke-linejoin="round"/>`;
      if(e.text){const top=e.type==='tri'?e.h*.3:0,bot=e.type==='bubble'?e.h*.2:0;o+=T(wbTextLayout(e.text,e.x+10,e.y+top,e.w-20,fz,fz*1.35,wbFont(e,fz),wbGet(e,'ta'),true,e.h-top-bot),fz,fg,e)}}
    else if(e.type==='stroke'){const col=wbColRes(e.color),op=wbGet(e,'op');o+=e.pr?`<path d="${wbOutline(e.pts,e.sw||2)}" fill="${col}" fill-opacity="${op}"/>`:`<path d="${wbSmooth(e.pts)}" fill="none" stroke="${col}" stroke-width="${e.sw||2}" stroke-linecap="round" stroke-linejoin="round" stroke-opacity="${op}"/>`}
    else if(e.type==='arrow'){const g=wbArrowGeom(e),col=wbColRes(e.color),sw=e.sw||2;o+=`<g opacity="${wbGet(e,'op')}" fill="none" stroke="${col}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"><path d="${g.d}"${wbGet(e,'dash')?` stroke-dasharray="${sw*3} ${sw*2.4}"`:''}/>${g.hp?`<path d="${g.hp}"/>`:''}</g>`;
      if(e.text){const fz=wbGet(e,'fs'),f=wbFont(null,fz,500),L_=wbLines(e.text,240,f),x=wbMeasCtx;x.font=f;const tw=Math.max(...L_.map(l=>x.measureText(l).width))+14,th=L_.length*fz*1.3+8;
        o+=`<rect x="${F1(g.mid[0]-tw/2)}" y="${F1(g.mid[1]-th/2)}" width="${F1(tw)}" height="${F1(th)}" rx="6" fill="${bg}"/>`+T(L_.map((s,i)=>({s,x:g.mid[0],y:g.mid[1]-th/2+4+fz+i*fz*1.3,anchor:'middle'})),fz,fg,null,500)}}
    else if(e.type==='sticky'){const fz=wbGet(e,'fs');o+=`<rect x="${e.x}" y="${e.y}" width="${e.w}" height="${e.h}" rx="12" fill="${e.color||NOTE_COLORS[0]}"/>`+T(wbTextLayout(e.text,e.x+14,e.y+12,e.w-28,fz,fz*1.55,wbFont(e,fz),wbGet(e,'ta')),fz,'#1b1d22',e)}
    else if(e.type==='text'){const fz=e.fs||20;o+=T(wbTextLayout(e.text,e.x,e.y,e.w,fz,fz*1.4,wbFont(e,fz),wbGet(e,'ta')),fz,wbColRes(e.color),e)}
    else if(e.type==='image'){const dd=await nImg(e.img);if(dd)o+=`<image x="${F1(e.x)}" y="${F1(e.y)}" width="${F1(e.w)}" height="${F1(e.h)}" preserveAspectRatio="none" href="${dd}"/>`}
    else if(e.type==='ayah'){o+=`<rect x="${e.x}" y="${e.y}" width="${e.w}" height="${e.h}" rx="14" fill="${panel}" stroke="${wbColRes('accent')}"/>`+T(wbTextLayout(e.text,e.x+14,e.y+10,e.w-28,19,34,wbFont(null,19),'center'),19,fg)+T([{s:qSurahName(e.s)+' · '+e.a,x:e.x+e.w/2,y:e.y+e.h-10,anchor:'middle'}],11,muted)}
    else if(e.type==='noteref'||e.type==='taskref'){o+=`<rect x="${e.x}" y="${e.y}" width="${e.w}" height="${e.h}" rx="14" fill="${panel}" stroke="#8886"/>`;
      if(e.type==='noteref'){const n=NOTES().find(q=>q.id===e.note);if(n)o+=T(wbTextLayout(n.title||'',e.x+14,e.y+10,e.w-28,15,20,wbFont(null,15,600),'start'),15,fg,null,600)+T(wbTextLayout((n.body||'').slice(0,300),e.x+14,e.y+38,e.w-28,13,19,wbFont(null,13),'start').filter(l=>l.y<e.y+e.h-8),13,muted)}
      else{const t_=LT().find(q=>q.id===e.task);if(t_)o+=T(wbTextLayout(t_.text,e.x+14,e.y+12,e.w-28,15,20,wbFont(null,15,600),'start'),15,fg,null,600)+`<rect x="${e.x+14}" y="${e.y+e.h-30}" width="${e.w-28}" height="6" rx="3" fill="#8884"/><rect x="${e.x+14}" y="${e.y+e.h-30}" width="${F1((e.w-28)*ltPct(t_))}" height="6" rx="3" fill="${wbColRes('accent')}"/>`}}}
  const svg=`<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="${F1(X0)} ${F1(Y0)} ${F1(W)} ${F1(H)}" width="${Math.round(W)}" height="${Math.round(H)}">${o}</svg>`;
  await saveBytes(safeName(boardName(board()))+'.svg','image/svg+xml',new TextEncoder().encode(svg))}
function safeName(s){return String(s||'board').replace(/[\\/:*?"<>|]/g,' ').trim()||'board'}
/* ---- Obsidian Canvas ---- */
const OBS_COLORS={'1':'#ef4444','2':'#f59e0b','3':'#eab308','4':'#22c55e','5':'#06b6d4','6':'#a855f7'};
function wbObsColor(c){const map={'#fde68a':'3','#bbf7d0':'4','#bfdbfe':'5','#fbcfe8':'1','#ddd6fe':'6','#fed7aa':'2','#ef4444':'1','#f59e0b':'2','#22c55e':'4','#3b82f6':'5','#a855f7':'6'};return map[String(c||'').toLowerCase()]}
async function wbExportCanvas(){const els=wbEls(),nodes=[],edges=[],files=[],R=v=>Math.round(v);
  const side=(a,b)=>{const[ax,ay]=wbCenter(a),[bx,by]=wbCenter(b),dx=bx-ax,dy=by-ay;return Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'bottom':'top')};
  for(const e of els){const base={id:e.id,x:R(e.x||0),y:R(e.y||0),width:R(e.w||200),height:R(e.h||100)};const col=wbObsColor(e.color);if(col)base.color=col;
    if(e.type==='sticky'||e.type==='text')nodes.push({...base,type:'text',text:e.text||''});
    else if(wbIsShape(e))nodes.push({...base,type:'text',text:e.text||''});
    else if(e.type==='frame')nodes.push({...base,type:'group',label:e.title||''});
    else if(e.type==='image'){const d=await nImg(e.img);if(d){files.push({name:'Thabat/attachments/'+e.img+'.jpg',data:b64Bytes(d.split(',')[1])});nodes.push({...base,type:'file',file:'Thabat/attachments/'+e.img+'.jpg'})}}
    else if(e.type==='ayah')nodes.push({...base,type:'text',text:e.text+'\n\n— '+qSurahName(e.s)+' '+e.a+(e.tfs?'\n\n'+e.tfs:'')});
    else if(e.type==='noteref'){const n=NOTES().find(q=>q.id===e.note);if(n)nodes.push({...base,type:'text',text:(n.title?'# '+n.title+'\n\n':'')+(n.body||'')})}
    else if(e.type==='taskref'){const x=LT().find(q=>q.id===e.task);if(x)nodes.push({...base,type:'text',text:`- [${x.status==='done'?'x':' '}] ${x.text} (${Math.round(ltPct(x)*100)}%)`})}}
  els.filter(e=>e.type==='arrow'&&e.from&&e.to).forEach(e=>{const A=wbFind(e.from),B=wbFind(e.to);if(A&&B&&nodes.some(n=>n.id===A.id)&&nodes.some(n=>n.id===B.id))edges.push({id:e.id,fromNode:A.id,fromSide:side(A,B),toNode:B.id,toSide:side(B,A),toEnd:wbGet(e,'head')==='none'?'none':'arrow',...(wbGet(e,'head')==='both'?{fromEnd:'arrow'}:{}),...(e.text?{label:e.text}:{})})});
  const json=new TextEncoder().encode(JSON.stringify({nodes,edges},null,'\t')),name=safeName(boardName(board()));
  if(files.length){files.push({name:'Thabat/'+name+'.canvas',data:json});await saveBytes(name+'-canvas.zip','application/zip',makeZip(files))}else await saveBytes(name+'.canvas','application/json',json);
  if(els.some(e=>e.type==='stroke'))toast(t('wb.canvasNoInk'))}
async function wbImportCanvas(fileList){const items=[];for(const f of fileList){if(/\.zip$/i.test(f.name)){try{(await unzipFiles(f)).forEach(z=>items.push(z))}catch(e){toast(t('obs.zipErr'))}}else items.push({path:f.name,get:async()=>f})}
  const cvs=items.filter(x=>/\.canvas$/i.test(x.path)),imgs={};items.filter(x=>OBS_IMG.test(x.path)).forEach(x=>imgs[x.path.split('/').pop().toLowerCase()]=x);
  if(!cvs.length){toast(t('wb.noCanvas'));return}
  for(const cf of cvs){let data;try{data=JSON.parse(await (await cf.get()).text())}catch(e){toast(t('wb.badCanvas'));continue}
    const b={id:uid(),name:cf.path.split('/').pop().replace(/\.canvas$/i,''),els:[],view:{x:40,y:40,z:1}},idm={};
    for(const n of data.nodes||[]){const id=uid();idm[n.id]=id;const col=n.color?(OBS_COLORS[n.color]||n.color):null,g={id,x:n.x||0,y:n.y||0,w:n.width||250,h:n.height||60};
      if(n.type==='group')b.els.push({...g,type:'frame',title:n.label||'',color:col||'accent'});
      else if(n.type==='text')b.els.push(col?{...g,type:'sticky',text:n.text||'',color:NOTE_COLORS[['1','2','3','4','5','6'].indexOf(String(n.color))]||NOTE_COLORS[0]}:{...g,type:'text',text:n.text||'',fs:16,color:'auto'});
      else if(n.type==='file'&&OBS_IMG.test(n.file||'')){const x=imgs[(n.file||'').split('/').pop().toLowerCase()];if(x){try{const d=await shrinkImage(await x.get(),1800);const im=uid();await idbSet('nimg:'+im,d);nImgMem[im]=d;b.els.push({...g,type:'image',img:im})}catch(e){}}
        else b.els.push({...g,type:'sticky',text:'🖼 '+n.file,color:NOTE_COLORS[6]})}
      else if(n.type==='file')b.els.push({...g,type:'sticky',text:'📄 '+(n.file||'').split('/').pop().replace(/\.md$/i,''),color:NOTE_COLORS[2]});
      else if(n.type==='link')b.els.push({...g,type:'sticky',text:'🔗 '+(n.url||''),color:NOTE_COLORS[2]})}
    b.els.sort((p,q)=>(p.type==='frame'?0:1)-(q.type==='frame'?0:1));
    for(const e of data.edges||[]){if(idm[e.fromNode]&&idm[e.toNode])b.els.push({id:uid(),type:'arrow',from:idm[e.fromNode],to:idm[e.toNode],x1:0,y1:0,x2:0,y2:0,color:e.color?(OBS_COLORS[e.color]||e.color):'auto',sw:2,head:e.toEnd==='none'?(e.fromEnd==='arrow'?'end':'none'):(e.fromEnd==='arrow'?'both':'end'),text:e.label||undefined})}
    S.boards.push(b);S.activeBoard=b.id}
  closeLt();save();renderBoards();setTimeout(wbFit,50);toast(t('wb.imported'))}
function wbOpenCanvasImport(){$('#ltBox').innerHTML=`<h2>${t('wb.canvasIn')}</h2><p class="ltsub" style="line-height:1.8">${t('wb.canvasHow')}</p><div class="suopts"><label class="btn pri" style="justify-content:center">📄 ${t('obs.files')}<input type="file" id="wbCvIn" multiple accept=".canvas,.zip,.json,image/*" hidden></label></div><div class="ltact"><button class="btn ghost" id="wbCvX">${t('lt.cancel')}</button></div>`;
  $('#ltModal').classList.add('on');$('#wbCvX').onclick=closeLt;$('#wbCvIn').onchange=e=>{const fl=[...e.target.files];if(fl.length)wbImportCanvas(fl)}}
/* ---- menus ---- */
function wbMenu(btn,items){closePP();const p=document.createElement('div');p.className='pppop wbmenu';p.id='ppPop';p.innerHTML=items.map((it,i)=>it?`<button data-i="${i}">${it[0]}</button>`:'<hr>').join('');document.body.append(p);
  const r=btn.getBoundingClientRect(),w=p.offsetWidth,h=p.offsetHeight;let x=document.documentElement.dir==='rtl'?r.right-w:r.left;x=Math.max(8,Math.min(innerWidth-w-8,x));let y=r.bottom+6;if(y+h>innerHeight-8)y=r.top-h-6;p.style.left=x+'px';p.style.top=y+'px';
  p.querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>{closePP();items[+b.dataset.i][1]()});setTimeout(()=>document.addEventListener('mousedown',ppOut,true),0)}
/* ---- toolbar ---- */
const WB_ICONS={select:'<path d="M5 3l14 8-6 2-2 6z"/>',lasso:'<path d="M8.5 17.5C5 16.6 3 14.4 3 11.5 3 7.4 7 4 12 4s9 3.4 9 7.5-4 7.5-9 7.5c-.9 0-1.8-.1-2.6-.3"/><path d="M9 17.5c0 2-1.3 3.5-3 3.5"/><circle cx="9" cy="17.5" r="1.6"/>',hand:'<path d="M7 11V6a1.5 1.5 0 0 1 3 0v4M10 10V4.5a1.5 1.5 0 0 1 3 0V10M13 10V5.5a1.5 1.5 0 0 1 3 0V11M16 11V8.5a1.5 1.5 0 0 1 3 0V14a7 7 0 0 1-7 7h-1a6 6 0 0 1-5-3l-2.5-4a1.5 1.5 0 0 1 2.5-1.6L7 14"/>',pen:'<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',hl:'<path d="M9 11l-6 6v3h9l3-3M22 12l-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4"/>',erase:'<path d="M20 20H7L3 16l10-10 7 7-7 7M9 10l6 6"/>',
  rect:'<rect x="4" y="5" width="16" height="14" rx="2"/>',ellipse:'<ellipse cx="12" cy="12" rx="9" ry="7"/>',tri:'<path d="M12 4l9 16H3z"/>',diamond:'<path d="M12 3l9 9-9 9-9-9z"/>',star:'<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',bubble:'<path d="M4 5h16v11H10l-4 4v-4H4z"/>',
  line:'<path d="M5 19L19 5"/>',arrow:'<path d="M5 19L19 5M10 5h9v9"/>',text:'<path d="M5 6V4h14v2M12 4v16M9 20h6"/>',sticky:'<path d="M5 3h14v12l-6 6H5z"/><path d="M13 21v-6h6"/>',frame:'<path d="M3 7h18M3 17h18M7 3v18M17 3v18"/>',
  img:'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/>',more:'<circle cx="12" cy="5" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="12" cy="19" r="1.4"/>',
  taS:'<path d="M4 6h16M4 12h10M4 18h13"/>',taC:'<path d="M4 6h16M7 12h10M5.5 18h13"/>',taE:'<path d="M4 6h16M10 12h10M7 18h13"/>'};
const wbIco=k=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${WB_ICONS[k]}</svg>`;
const WB_FILLS=[null,'auto','accent','#ef4444','#3b82f6','#22c55e','#f59e0b','#a855f7','#ffffff','#111111'];
function wbSwatch(c){return c?`<i style="background:${wbCol(c)}"></i>`:'<i class="none"></i>'}
function wbPop(btn,html,cls){closePP();const p=document.createElement('div');p.className='pppop '+(cls||'');p.id='ppPop';p.innerHTML=html;document.body.append(p);
  const r=btn.getBoundingClientRect(),w=p.offsetWidth,h=p.offsetHeight;let x=Math.max(8,Math.min(innerWidth-w-8,r.left+r.width/2-w/2)),y=r.top-h-8;if(y<8)y=r.bottom+8;p.style.left=x+'px';p.style.top=y+'px';
  setTimeout(()=>document.addEventListener('mousedown',ppOut,true),0);return p}
function wbColorPop(btn,k,cur){const fcs=wbSelFor('fc'),stickyOnly=k==='fc'&&(fcs.length?fcs.every(e=>e.type==='sticky'):WB.tool==='sticky');
  const list=stickyOnly?NOTE_COLORS:k==='fc'?WB_FILLS:WB_COLORS.concat(['#ffffff','#111111']);
  const p=wbPop(btn,`<div class="wbcgrid">${list.map((c,i)=>`<button class="cdot ${c===cur?'on':''}" data-i="${i}" title="${c||t('wb.none')}">${wbSwatch(c)}</button>`).join('')}</div><label class="wbcust">🎨 ${t('wb.custom')}<input type="color" value="${/^#[0-9a-f]{6}$/i.test(cur||'')?cur:'#3b82f6'}"></label>`,'wbcpop');
  p.querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>{closePP();wbSetProp(k,list[+b.dataset.i]);wbToolbar()});
  const ci=p.querySelector('input');ci.oninput=()=>wbSetProp(k,ci.value,true);ci.onchange=()=>{wbSetProp(k,ci.value);closePP();wbToolbar()}}
function wbShapePop(btn){const p=wbPop(btn,`<div class="wbshp">${WB_SHAPES.map(s=>`<button class="tool ${WB.shape===s?'on':''}" data-s="${s}" title="${esc(t('wb.sh.'+s))}">${wbIco(s)}</button>`).join('')}</div>`,'wbcpop');
  p.querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>{closePP();WB.shape=b.dataset.s;WB.tool=WB.shape;wbSetSel([]);wbToolbar()})}
function wbFontPop(btn,cur){const p=wbPop(btn,`<div class="wbfonts">${Object.keys(WB_FONTS).map(f=>`<button class="${f===cur?'on':''}" data-f="${f}" style="font-family:${WB_FONTS[f]}">${t('wb.f.'+f)}</button>`).join('')}</div>`,'wbmenu');
  p.querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>{closePP();wbSetProp('ff',b.dataset.f);wbToolbar()})}
function wbSelMenu(btn){const sel=[...WB.sel].map(wbFind).filter(Boolean),n=sel.length,allL=sel.every(e=>e.lock),grp=sel.some(e=>e.gid),oneGrp=n>1&&sel[0].gid&&sel.every(e=>e.gid===sel[0].gid);
  const it=[];if(n>1)it.push(['⬌ '+t('wb.align')+' …',()=>wbMenu(btn,[['⇤ '+t('wb.aL'),()=>wbAlign('l')],['⇹ '+t('wb.aC'),()=>wbAlign('c')],['⇥ '+t('wb.aR'),()=>wbAlign('r')],null,['⤒ '+t('wb.aT'),()=>wbAlign('t')],['⇳ '+t('wb.aM'),()=>wbAlign('m')],['⤓ '+t('wb.aB'),()=>wbAlign('b')],...(n>2?[null,['↔ '+t('wb.dH'),()=>wbAlign('dh')],['↕ '+t('wb.dV'),()=>wbAlign('dv')]]:[])])]);
  if(n>1&&!oneGrp)it.push(['▣ '+t('wb.group')+'  (Ctrl+G)',wbGroup]);if(grp)it.push(['▢ '+t('wb.ungroup'),wbUngroup]);
  {const tx=sel.map(e=>String(e.text||'').trim()).filter(Boolean);if(tx.length)it.push(['☑ '+t('wb.toTask'),()=>wbToTasks(tx)])}it.push([(allL?'🔓 '+t('wb.unlock'):'🔒 '+t('wb.lockEl')),wbLockToggle],['🔗 '+t('wb.link')+' …',wbLinkDlg],null,['⤒ '+t('wb.front'),()=>wbFront(false)],['⤓ '+t('wb.back'),()=>wbFront(true)],null,['⎘ '+t('wb.copy')+'  (Ctrl+C)',()=>wbCopy(false)],['✂ '+t('wb.cut'),()=>wbCopy(true)],null,['🖼 '+t('wb.pngSel'),()=>wbExportPng()],['✒ '+t('wb.svgSel'),()=>wbExportSvg()]);
  wbMenu(btn,it)}
function wbToolbar(){const tb=$('#btbar');if(!tb)return;$('#bwrap').dataset.tool=WB.tool;wbCursor();const sel=[...WB.sel].map(wbFind).filter(Boolean);
  const tools=['select','lasso','hand','pen','hl','erase','shape','line','arrow','text','sticky','frame'];
  const kinds=sel.length?[...new Set(sel.map(wbKind))]:[WB_TK[WB.tool]].filter(Boolean);
  const has=k=>kinds.some(kd=>(WB_PROPS[kd]||[]).includes(k));
  const val=k=>{const e=wbSelFor(k)[0];if(e)return wbGet(e,k);const kd=kinds.find(kd=>(WB_PROPS[kd]||[]).includes(k));return kd?wbSt(kd)[k]:null};
  const rng=(k,min,max,step,v,lab,fmt)=>`<label class="wbr" title="${esc(lab)}"><span>${lab}</span><input type="range" data-r="${k}" min="${min}" max="${max}" step="${step}" value="${v}"><output>${fmt?fmt(v):v}</output></label>`;
  const pc=v=>Math.round(v*100)+'%',B=(attr,on,title,inner)=>`<button class="swb ${on?'on':''}" ${attr} title="${esc(title)}">${inner}</button>`;let st='';
  if(WB.tool==='erase'&&!sel.length){const es=wbSt('erase');st+=`<div class="wbseg"><button data-em="part" class="${es.mode==='part'?'on':''}">${t('wb.erPart')}</button><button data-em="stroke" class="${es.mode==='stroke'?'on':''}">${t('wb.erWhole')}</button></div>`+rng('size',4,120,1,es.size,t('wb.size'))}
  if(WB.tool==='pen'&&!sel.length)st+=B('data-auto',wbSt('pen').auto,t('wb.autoShape'),'✨')+'<span class="wbsep"></span>';
  if(has('color')){const shp=has('fc')&&kinds.includes('shape');st+=`<button class="swt" data-pick="color" title="${esc(t(shp?'wb.stroke':'wb.color'))}">${wbSwatch(val('color'))}<small>${t(shp?'wb.stroke':'wb.color')}</small></button>`}
  if(has('sw'))st+=rng('sw',kinds.includes('shape')?0:1,kinds.includes('hl')?60:30,1,val('sw'),t('wb.width'));
  if(has('op'))st+=rng('op',.05,1,.05,val('op'),t('wb.opacity'),pc);
  if(has('head')){const h=val('head'),r=val('route');st+='<span class="wbsep"></span>'+B('data-head',false,t('wb.head'),{end:'⟶',both:'⟷',none:'—'}[h]||'⟶')+B('data-route',false,t('wb.route'),{straight:'╱',curve:'⌒',elbow:'⌐'}[r]||'╱')+B('data-dash',val('dash'),t('wb.dash'),'┄')}
  if(has('fc')){const f=val('fc');st+=`<span class="wbsep"></span><button class="swt" data-pick="fc" title="${esc(t('wb.fill'))}">${wbSwatch(f)}<small>${t('wb.fill')}</small></button>`;if(has('fo')&&f)st+=rng('fo',.05,1,.05,val('fo'),t('wb.opacity'),pc)}
  if(has('rx')&&(sel.length?sel.some(e=>e.type==='rect'||e.type==='bubble'):WB.tool==='rect'||WB.tool==='bubble'))st+=B('data-rx',val('rx')>0,t('wb.round'),'▢');
  if(has('fs'))st+=`<span class="wbsep"></span>`+rng('fs',8,120,1,val('fs'),'Aa');
  if(has('fw')){const ta=val('ta');st+=B('data-fw',val('fw')>=600,t('wb.bold'),'<b>B</b>')+B('data-fi',val('fi'),t('wb.italic'),'<i style="font-family:serif">I</i>')+B('data-ta',false,t('wb.alignT'),wbIco(ta==='center'?'taC':(ta==='end')===(document.documentElement.dir==='rtl')?'taS':'taE'))+B('data-ff',false,t('wb.font'),`<span style="font-family:${WB_FONTS[val('ff')]||WB_FONTS.sans}">${t('wb.f.'+(val('ff')||'sans')).slice(0,4)}</span>`)}
  if(kinds.includes('shape')||WB_SHAPES.includes(WB.tool)||WB.tool==='frame')st+=B('data-lock',WB.lock,t('wb.lock'),'⛶');
  if(sel.length)st+=`<span class="wbsep"></span><button class="tool" data-a="dup" title="${esc(t('wb.dup'))}">⧉</button><button class="tool" data-a="more" title="${esc(t('wb.more'))}">${wbIco('more')}</button><button class="tool danger" data-a="del" title="${esc(t('del'))}">✕</button>`;
  tb.innerHTML=`<div class="wbt">${tools.map(k=>k==='shape'?`<button class="tool shp ${WB_SHAPES.includes(WB.tool)?'on':''}" data-t="shape" title="${esc(t('wb.t.shape'))}">${wbIco(WB.shape)}<i class="car"></i></button>`:`<button class="tool ${WB.tool===k?'on':''}" data-t="${k}" title="${esc(t('wb.t.'+k))}">${wbIco(k)}</button>`).join('')}
    <button class="tool" data-a="img" title="${esc(t('wb.img'))}">${wbIco('img')}</button></div>${st?`<div class="wbt wbs">${st}</div>`:''}`;
  tb.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{const k=b.dataset.t;if(k==='shape'){const was=WB_SHAPES.includes(WB.tool);WB.tool=WB.shape;wbSetSel([]);wbToolbar();if(was)wbShapePop(tb.querySelector('[data-t=shape]'));return}
    WB.tool=k;if(k!=='select'&&k!=='lasso')wbSetSel([]);wbToolbar()});
  tb.querySelectorAll('[data-pick]').forEach(b=>b.onclick=()=>wbColorPop(b,b.dataset.pick,val(b.dataset.pick)));
  tb.querySelectorAll('[data-r]').forEach(r=>{const k=r.dataset.r,o=r.nextElementSibling;
    r.oninput=()=>{o.textContent=(k==='op'||k==='fo')?pc(+r.value):r.value;if(k==='size'){wbSt('erase').size=+r.value;return}wbSetProp(k,+r.value,true)};
    r.onchange=()=>{if(k==='size'){save();return}wbSetProp(k,+r.value)}});
  tb.querySelectorAll('[data-em]').forEach(b=>b.onclick=()=>{wbSt('erase').mode=b.dataset.em;save();wbToolbar()});
  const on=(sel_,f)=>{const b=tb.querySelector(sel_);if(b)b.onclick=f};
  on('[data-auto]',()=>{const p=wbSt('pen');p.auto=!p.auto;save();wbToolbar();toast(t(p.auto?'wb.autoOn':'wb.autoOff'))});
  on('[data-rx]',()=>{wbSetProp('rx',val('rx')>0?0:10);wbToolbar()});on('[data-lock]',()=>{WB.lock=!WB.lock;wbToolbar()});
  on('[data-head]',()=>{const L_=['end','both','none'];wbSetProp('head',L_[(L_.indexOf(val('head'))+1)%3]);wbToolbar()});
  on('[data-route]',()=>{const L_=['straight','curve','elbow'];wbSetProp('route',L_[(L_.indexOf(val('route'))+1)%3]);wbToolbar()});
  on('[data-dash]',()=>{wbSetProp('dash',!val('dash'));wbToolbar()});
  on('[data-fw]',()=>{wbSetProp('fw',val('fw')>=600?400:700);wbToolbar()});on('[data-fi]',()=>{wbSetProp('fi',!val('fi'));wbToolbar()});
  on('[data-ta]',()=>{const L_=['start','center','end'];wbSetProp('ta',L_[(L_.indexOf(val('ta'))+1)%3]);wbToolbar()});
  on('[data-ff]',()=>wbFontPop(tb.querySelector('[data-ff]'),val('ff')));
  tb.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{const a=b.dataset.a;if(a==='img')$('#wbImgIn').click();if(a==='del')wbDelete();if(a==='dup')wbDup();if(a==='more')wbSelMenu(b)})}
function wbCursor(){const c=$('#bcur');if(c&&WB.tool!=='erase')c.hidden=true}
function wbBoardMenu(btn){const u=S.wbUi||{};wbMenu(btn,[['▶ '+t('wb.present'),wbPresent],null,['🖼 '+t('wb.png'),()=>wbExportPng(wbEls())],['📄 PDF',()=>{window._wbPdf=1;wbExportPng(wbEls())}],['✒ '+t('wb.svg'),()=>wbExportSvg(wbEls())],['⇪ '+t('wb.canvasOut'),()=>wbExportCanvas()],['⇩ '+t('wb.canvasIn'),()=>wbOpenCanvasImport()],null,
  ['📋 '+t('wb.paste'),()=>wbPaste()],[(wbMiniOn()?'☑ ':'☐ ')+t('wb.minimap'),()=>{S.wbUi=Object.assign({},u,{mini:!wbMiniOn()});save();wbMini()}],[(wbSnapOn()?'☑ ':'☐ ')+t('wb.snap'),()=>{S.wbUi=Object.assign({},S.wbUi||{},{snap:!wbSnapOn()});save()}],null,
  ['✎ '+t('board.name'),()=>{const n=prompt(t('board.name'),boardName(board()));if(n){board().name=n.trim()||board().name;save();renderBoards()}}],['🧹 '+t('wb.clear'),()=>{if(confirm(t('draw.clearQ'))){wbSnap();board().els=[];save();wbRender()}}],['🗑 '+t('board.del'),()=>{if(S.boards.length<2){toast(t('board.keepOne'));return}if(confirm(t('board.delQ',boardName(board())))){S.boards=S.boards.filter(b=>b!==board());S.activeBoard=S.boards[0].id;save();renderBoards()}}]])}
function wbSnapOn(){return(S.wbUi||{}).snap!==false}
function renderBoards(){S.boards.forEach(wbMigrate);const tabs=S.boards.map(b=>`<button class="btab ${b.id===board().id?'on':''}" data-id="${b.id}" title="${t('board.rename')}">${esc(boardName(b))}</button>`).join('');
  $('#boardTabs').innerHTML=tabs+`<button class="btab" id="bAdd">+</button><div class="tools wbtop">
    <button class="btn sm" id="wbIns">＋ ${t('wb.insert')}</button><button class="btn sm" id="wbTpl">▦ ${t('wb.template')}</button>
    <button class="tool" id="wbUndo" title="Ctrl+Z">↶</button><button class="tool" id="wbRedo" title="Ctrl+Y">↷</button>
    <button class="tool" id="wbZo">−</button><button class="btn sm ghost" id="bZoom">100%</button><button class="tool" id="wbZi">+</button><button class="btn sm ghost" id="wbFit" title="${esc(t('wb.fit'))}">⤢<span class="wbl"> ${t('wb.fit')}</span></button>
    <button class="btn sm ghost" id="wbPres" title="${esc(t('wb.present'))}">▶<span class="wbl"> ${t('wb.presentS')}</span></button><button class="btn sm ghost" id="wbMore">⋯</button></div>`;
  $$('.btab[data-id]').forEach(x=>{x.onclick=()=>{if(S.activeBoard===x.dataset.id)return;S.activeBoard=x.dataset.id;WB.sel.clear();save();renderBoards()};x.ondblclick=()=>{const n=prompt(t('board.name'),boardName(board()));if(n){board().name=n.trim()||board().name;save();renderBoards()}}});
  $('#bAdd').onclick=()=>{const b={id:uid(),name:t('board.new',S.boards.length+1),els:[],view:{x:40,y:40,z:1}};S.boards.push(b);S.activeBoard=b.id;save();renderBoards()};
  $('#wbUndo').onclick=wbUndo;$('#wbRedo').onclick=wbRedo;$('#wbFit').onclick=wbFit;$('#wbPres').onclick=wbPresent;$('#bZoom').onclick=()=>{const v=wbView(),r=$('#bwrap').getBoundingClientRect();wbZoomAt(r.left+r.width/2,r.top+r.height/2,1/v.z)};
  $('#wbZi').onclick=()=>{const r=$('#bwrap').getBoundingClientRect();wbZoomAt(r.left+r.width/2,r.top+r.height/2,1.25)};$('#wbZo').onclick=()=>{const r=$('#bwrap').getBoundingClientRect();wbZoomAt(r.left+r.width/2,r.top+r.height/2,.8)};
  $('#wbIns').onclick=e=>wbMenu(e.currentTarget,[[ '🖼 '+t('wb.img'),()=>$('#wbImgIn').click()],['📝 '+t('wb.noteCard'),()=>wbInsertNote('card')],['📄 '+t('wb.noteText'),()=>wbInsertNote('text')],['✅ '+t('wb.task'),()=>wbInsertTask()],null,['📋 '+t('wb.paste'),()=>wbPaste()]]);
  $('#wbTpl').onclick=e=>wbMenu(e.currentTarget,[['🎬 '+t('wb.tStory'),()=>wbTemplate('story')],['🗂 '+t('wb.tKanban'),()=>wbTemplate('kanban')],['🧠 '+t('wb.tMind'),()=>wbTemplate('mind')],['📅 '+t('wb.tWeek'),()=>wbTemplate('week')]]);
  $('#wbMore').onclick=e=>wbBoardMenu(e.currentTarget);
  wbRender()}
$('#wbImgIn').onchange=e=>{const f=[...e.target.files];e.target.value='';wbAddImages(f)};
/* ---- links ---- */
function wbFollow(e){const l=e&&e.link;if(!l)return;
  if(l.t==='board'){if(!S.boards.some(b=>b.id===l.id)){toast(t('wb.linkGone'));return}S.activeBoard=l.id;WB.sel.clear();save();renderBoards();setTimeout(wbFit,40)}
  else if(l.t==='day'){selKey=l.k;calM=keyToDate(l.k);calM.setDate(1);showView('cal');renderCal()}
  else if(l.t==='url'){const u=/^[a-z]+:/i.test(l.u)?l.u:'https://'+l.u;if(ANDROID){try{window.ThabatAndroid.openUrl(u)}catch(x){}}else window.open(u,'_blank','noopener')}}
function wbLinkDlg(){const s=[...WB.sel].map(wbFind).filter(Boolean);if(!s.length)return;const cur=s[0].link;
  $('#ltBox').innerHTML=`<h2>🔗 ${t('wb.link')}</h2><p class="ltsub">${t('wb.linkHow')}</p>
   <b class="wblh">${t('wb.linkBoard')}</b><div class="wbpick">${S.boards.filter(b=>b.id!==board().id).map(b=>`<button class="suitem" data-b="${b.id}"><b>🗂 ${esc(boardName(b))}</b></button>`).join('')||'<div class="empty">—</div>'}</div>
   <b class="wblh">${t('wb.linkDay')}</b><div class="row"><input class="in" type="date" id="wbLkD" value="${cur&&cur.t==='day'?cur.k:todayKey()}"><button class="btn sm" id="wbLkDo">${t('wb.linkSet')}</button></div>
   <b class="wblh">${t('wb.linkUrl')}</b><div class="row"><input class="in" id="wbLkU" dir="ltr" placeholder="https://" value="${cur&&cur.t==='url'?esc(cur.u):''}"><button class="btn sm" id="wbLkUo">${t('wb.linkSet')}</button></div>
   <div class="ltact">${cur?`<button class="btn ghost" id="wbLkX">${t('wb.linkDel')}</button>`:''}<button class="btn ghost" id="wbLkC">${t('lt.cancel')}</button></div>`;
  $('#ltModal').classList.add('on');const set=l=>{wbSnap();s.forEach(e=>{if(l)e.link=l;else delete e.link});save();closeLt();wbRefresh(s.map(e=>e.id));toast(t(l?'wb.linkDone':'wb.linkRemoved'))};
  $$('#ltBox [data-b]').forEach(b=>b.onclick=()=>set({t:'board',id:b.dataset.b}));
  $('#wbLkDo').onclick=()=>{const v=$('#wbLkD').value;if(v)set({t:'day',k:v})};$('#wbLkUo').onclick=()=>{const v=$('#wbLkU').value.trim();if(v)set({t:'url',u:v})};
  $('#wbLkC').onclick=closeLt;if($('#wbLkX'))$('#wbLkX').onclick=()=>set(null)}
/* ---- minimap ---- */
function wbMiniOn(){const u=S.wbUi||{};return u.mini??(innerWidth>700)}
let wbMiniRaf=0;function wbMini(){if(wbMiniRaf)return;wbMiniRaf=requestAnimationFrame(()=>{wbMiniRaf=0;wbMiniDraw()})}
function wbMiniDraw(){const cv=$('#bmini');if(!cv||!$('#bwrap').offsetParent)return;const on=wbMiniOn()&&!WB.present&&wbEls().length>0;cv.hidden=!on;if(!on)return;
  const els=wbEls(),r=$('#bwrap').getBoundingClientRect(),v=wbView(),vp={x:-v.x/v.z,y:-v.y/v.z,w:r.width/v.z,h:r.height/v.z};let a=vp.x,b=vp.y,c=vp.x+vp.w,d=vp.y+vp.h;
  els.forEach(e=>{const q=wbBox(e);a=Math.min(a,q.x);b=Math.min(b,q.y);c=Math.max(c,q.x+q.w);d=Math.max(d,q.y+q.h)});
  const W=cv.clientWidth,H=cv.clientHeight,dpr=devicePixelRatio||1;if(!W)return;cv.width=W*dpr;cv.height=H*dpr;const x=cv.getContext('2d');x.scale(dpr,dpr);
  const pad=6,k=Math.min((W-2*pad)/(c-a||1),(H-2*pad)/(d-b||1)),ox=pad+((W-2*pad)-(c-a)*k)/2-a*k,oy=pad+((H-2*pad)-(d-b)*k)/2-b*k;cv._m={k,ox,oy};
  for(const e of els){const q=wbBox(e);x.globalAlpha=.85;
    if(e.type==='stroke'){x.strokeStyle=wbColRes(e.color);x.lineWidth=1;x.beginPath();e.pts.forEach((p,i)=>i?x.lineTo(ox+p[0]*k,oy+p[1]*k):x.moveTo(ox+p[0]*k,oy+p[1]*k));x.stroke();continue}
    if(e.type==='arrow'){const g=wbArrowGeom(e);x.strokeStyle=wbColRes(e.color);x.lineWidth=1;x.beginPath();g.poly.forEach((p,i)=>i?x.lineTo(ox+p[0]*k,oy+p[1]*k):x.moveTo(ox+p[0]*k,oy+p[1]*k));x.stroke();continue}
    if(e.type==='frame'){x.globalAlpha=.6;x.strokeStyle=wbColRes(e.color==='auto'?'accent':e.color||'accent');x.lineWidth=1;x.strokeRect(ox+q.x*k,oy+q.y*k,q.w*k,q.h*k);continue}
    x.fillStyle=e.type==='sticky'?(e.color||NOTE_COLORS[0]):e.type==='image'?'#8a8f99':e.type==='text'?wbColRes('auto'):wbIsShape(e)?wbColRes(wbGet(e,'fc')||e.color):'#5b6270';x.globalAlpha=e.type==='text'?.5:.85;x.fillRect(ox+q.x*k,oy+q.y*k,Math.max(1.5,q.w*k),Math.max(1.5,e.type==='text'?2:q.h*k))}
  x.globalAlpha=1;x.strokeStyle=wbColRes('accent');x.lineWidth=1.5;x.strokeRect(ox+vp.x*k,oy+vp.y*k,vp.w*k,vp.h*k)}
/* ---- presentation ---- */
function wbFs(on){if(ANDROID){try{window.ThabatAndroid.setFullscreen(on)}catch(e){}return}try{if(on&&!document.fullscreenElement)document.documentElement.requestFullscreen().catch(()=>{});if(!on&&document.fullscreenElement)document.exitFullscreen().catch(()=>{})}catch(e){}}
function wbPresent(){if(WB.present)return;const fr=wbEls().filter(e=>e.type==='frame');if(!wbEls().length){toast(t('notes.nothing'));return}
  WB.present={i:0,list:fr.length?fr.map(f=>f.id):[null],view:Object.assign({},wbView())};wbSetSel([]);closePP();$('#bwrap').classList.add('present');document.documentElement.classList.add('wbpres');wbFs(true);
  if(!fr.length)toast(t('wb.noFrames'));wbPresGo(0);setTimeout(()=>WB.present&&wbPresGo(WB.present.i,true),350)}
function wbPresGo(i,instant){const P=WB.present;if(!P)return;P.i=Math.max(0,Math.min(P.list.length-1,i));const f=P.list[P.i]&&wbFind(P.list[P.i]),r=$('#bwrap').getBoundingClientRect(),v=wbView();
  let bx;if(f)bx={x:f.x,y:f.y,w:f.w,h:f.h};else{const q=wbBounds(wbEls());bx={x:q.a,y:q.b,w:q.c-q.a,h:q.d-q.b}}
  const z=Math.min(r.width/bx.w,r.height/bx.h)*.92;v.z=z;v.x=(r.width-bx.w*z)/2-bx.x*z;v.y=(r.height-bx.h*z)/2-bx.y*z;
  const w=$('#bworld');if(!instant){w.classList.add('anim');clearTimeout(w._t);w._t=setTimeout(()=>w.classList.remove('anim'),700)}wbApplyView();
  wbEls().forEach(o=>{const n=WB.nodes[o.id];if(n)n.classList.toggle('poff',!!f&&o.id!==f.id&&!(o.type==='arrow'?(()=>{const g=wbArrowGeom(o);return wbInside({type:'x',x:g.p[0],y:g.p[1],w:0,h:0},f)&&wbInside({type:'x',x:g.q[0],y:g.q[1],w:0,h:0},f)})():wbInside(o,f)))});
  $('#bpresN').textContent=`${P.i+1} / ${P.list.length}`;$('#bpresT').textContent=f?(f.title||''):''}
function wbPresStep(d){const P=WB.present;if(!P)return;if(P.i+d>=P.list.length){wbPresEnd();return}if(P.i+d<0)return;wbPresGo(P.i+d)}
function wbPresEnd(){const P=WB.present;if(!P)return;WB.present=null;$('#bwrap').classList.remove('present');document.documentElement.classList.remove('wbpres');Object.assign(wbView(),P.view);Object.values(WB.nodes).forEach(n=>n.classList.remove('poff'));wbFs(false);wbApplyView();setTimeout(wbApplyView,120)}
addEventListener('resize',()=>{if(WB.present)wbPresGo(WB.present.i,true);else wbMini()});
/* ---- shape recognition ---- */
function wbRecognize(pts,st){if(pts.length<4)return null;let a=1e9,b=1e9,c=-1e9,d=-1e9,len=0;pts.forEach((p,i)=>{a=Math.min(a,p[0]);b=Math.min(b,p[1]);c=Math.max(c,p[0]);d=Math.max(d,p[1]);if(i)len+=Math.hypot(p[0]-pts[i-1][0],p[1]-pts[i-1][1])});
  const W=c-a,H=d-b,S_=Math.max(W,H);if(S_<24)return null;const f=pts[0],l=pts[pts.length-1],gap=Math.hypot(l[0]-f[0],l[1]-f[1]);
  const base={id:uid(),color:st.color,sw:Math.max(1,Math.min(st.sw,8)),op:st.op};
  if(gap>S_*.25){if(gap/len>.92)return{...base,type:'arrow',head:'none',x1:f[0],y1:f[1],x2:l[0],y2:l[1],from:null,to:null};return null}
  if(Math.min(W,H)<S_*.18)return null;
  const cx=(a+c)/2,cy=(b+d)/2,rx=W/2,ry=H/2,m=Math.max(12,Math.min(W,H));let eE=0,rE=0;
  pts.forEach(p=>{eE+=Math.abs(Math.hypot((p[0]-cx)/rx,(p[1]-cy)/ry)-1);rE+=Math.min(Math.abs(p[0]-a),Math.abs(p[0]-c),Math.abs(p[1]-b),Math.abs(p[1]-d))/m});eE/=pts.length;rE/=pts.length;
  let simp=wbRdp(pts,S_*.12);if(simp.length>2&&Math.hypot(simp[0][0]-simp[simp.length-1][0],simp[0][1]-simp[simp.length-1][1])<S_*.25)simp=simp.slice(0,-1);const n=simp.length;
  let type=null;if(n===3&&rE>.06)type='tri';else if(n===4&&rE>.12&&eE>.1)type='diamond';else if(eE<.13&&eE<rE*1.6)type='ellipse';else if(rE<.09)type='rect';else if(eE<.18)type='ellipse';
  if(!type)return null;let w=W,h=H;if(Math.abs(W-H)/S_<.12&&type!=='tri')w=h=(W+H)/2;
  return{...base,type,x:cx-w/2,y:cy-h/2,w,h,fc:null,fo:.25,fs:16,rx:type==='rect'?10:undefined}}
/* ---- guides ---- */
function wbClearGuides(){(WB.gl||[]).forEach(g=>g.remove());WB.gl=[]}
function wbGuides(o,D){wbClearGuides();const z=wbView().z,thr=7/z;let a=1e9,b=1e9,c=-1e9,d=-1e9;
  for(const id of o.ids){const e=o.orig[id];if(!e||e.type==='arrow')continue;const q=wbBox(e);a=Math.min(a,q.x);b=Math.min(b,q.y);c=Math.max(c,q.x+q.w);d=Math.max(d,q.y+q.h)}
  if(a>c)return D;const mx=[a,(a+c)/2,c].map(v=>v+D[0]),my=[b,(b+d)/2,d].map(v=>v+D[1]),ids=new Set(o.ids);let bx=null,by=null;
  for(const e of wbEls()){if(ids.has(e.id)||e.type==='arrow'||e.type==='stroke')continue;const q=wbBox(e),tx=[q.x,q.x+q.w/2,q.x+q.w],ty=[q.y,q.y+q.h/2,q.y+q.h];
    for(const m of mx)for(const t_ of tx){const df=t_-m;if(Math.abs(df)<thr&&(!bx||Math.abs(df)<Math.abs(bx.df)))bx={df,v:t_,q}}
    for(const m of my)for(const t_ of ty){const df=t_-m;if(Math.abs(df)<thr&&(!by||Math.abs(df)<Math.abs(by.df)))by={df,v:t_,q}}}
  const nD=[D[0]+(bx?bx.df:0),D[1]+(by?by.df:0)],w=$('#bworld'),lw=1.2/z,G=(css)=>{const g=document.createElement('i');g.className='bguide';g.style.cssText=css;w.append(g);WB.gl.push(g)};
  if(bx){const y0=Math.min(b+nD[1],bx.q.y)-10/z,y1=Math.max(d+nD[1],bx.q.y+bx.q.h)+10/z;G(`left:${bx.v-lw/2}px;top:${y0}px;width:${lw}px;height:${y1-y0}px`)}
  if(by){const x0=Math.min(a+nD[0],by.q.x)-10/z,x1=Math.max(c+nD[0],by.q.x+by.q.w)+10/z;G(`left:${x0}px;top:${by.v-lw/2}px;width:${x1-x0}px;height:${lw}px`)}
  return nD}
function wbPip(p,poly){let ins=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const[xi,yi]=poly[i],[xj,yj]=poly[j];if((yi>p[1])!==(yj>p[1])&&p[0]<(xj-xi)*(p[1]-yi)/(yj-yi)+xi)ins=!ins}return ins}
/* ---- pointer interaction ---- */
(function(){const wrap=$('#bwrap');
  const cur=document.createElement('div');cur.id='bcur';cur.className='bcur';cur.hidden=true;wrap.append(cur);
  const mini=document.createElement('canvas');mini.id='bmini';mini.className='bmini';mini.hidden=true;wrap.append(mini);
  const pres=document.createElement('div');pres.className='bpres';pres.innerHTML=`<button data-p="-1">‹</button><span id="bpresN"></span><button data-p="1">›</button><b id="bpresT"></b><button data-p="x">✕</button>`;wrap.append(pres);
  pres.querySelectorAll('[data-p]').forEach(b=>b.onclick=ev=>{ev.stopPropagation();const p=b.dataset.p;if(p==='x')wbPresEnd();else{const rtl=document.documentElement.dir==='rtl';wbPresStep(rtl?-+p:+p)}});
  const miniMove=e=>{const m=mini._m;if(!m)return;const r=mini.getBoundingClientRect(),wx=(e.clientX-r.left-m.ox)/m.k,wy=(e.clientY-r.top-m.oy)/m.k,v=wbView(),wr=wrap.getBoundingClientRect();v.x=wr.width/2-wx*v.z;v.y=wr.height/2-wy*v.z;wbApplyView()};
  mini.addEventListener('pointerdown',e=>{e.stopPropagation();try{mini.setPointerCapture(e.pointerId)}catch(x){}mini._d=true;miniMove(e)});
  mini.addEventListener('pointermove',e=>{if(mini._d)miniMove(e)});mini.addEventListener('pointerup',e=>{mini._d=false;save()});
  const moveCur=e=>{if(WB.tool!=='erase'||(e.pointerType==='touch'&&!WB.ptrs.has(e.pointerId))){cur.hidden=true;return}const r=wrap.getBoundingClientRect(),s=wbSt('erase').size;cur.hidden=false;cur.style.cssText=`width:${s}px;height:${s}px;left:${e.clientX-r.left-s/2}px;top:${e.clientY-r.top-s/2}px`};
  wrap.addEventListener('pointermove',moveCur);wrap.addEventListener('pointerdown',moveCur);wrap.addEventListener('pointerleave',()=>cur.hidden=true);
  const skip=el=>el.closest('.btbar,.bmini,.bpres,.blink');
  const pinch=()=>{const p=[...WB.ptrs.values()];return{d:Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y),cx:(p[0].x+p[1].x)/2,cy:(p[0].y+p[1].y)/2}};
  const cancelOp=()=>{const o=WB.op;if(o&&o.temp){o.temp.remove()}wbClearGuides();WB.op=null};
  const startMove=(ids0,w,id,pt)=>{const moving=new Set(ids0.filter(i=>{const e=wbFind(i);return e&&!e.lock}));wbEls().forEach(f=>{if(f.type==='frame'&&moving.has(f.id))wbEls().forEach(o=>{if(o.id!==f.id&&o.type!=='arrow'&&!o.lock&&wbInside(o,f))moving.add(o.id)})});
    const ids=[...moving],orig={};ids.forEach(i=>orig[i]=JSON.parse(JSON.stringify(wbFind(i))));WB.op={k:'move',ids,orig,sx:w[0],sy:w[1],moved:false,id,pt}};
  wrap.addEventListener('pointerdown',e=>{if(skip(e.target))return;
    if(WB.present){if(e.button===0||e.pointerType!=='mouse'){const r=wrap.getBoundingClientRect(),rtl=document.documentElement.dir==='rtl',z=e.clientX<r.left+r.width*.25?'L':e.clientX>r.left+r.width*.75?'R':'C';wbPresStep(z==='C'?1:(z==='L')===rtl?1:-1)}return}
    if(WB.edit&&e.target.closest('.editing'))return;if(WB.edit)document.activeElement&&document.activeElement.blur();
    WB.ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(WB.ptrs.size===2){cancelOp();const p=pinch(),v=wbView();WB.op={k:'pinch',d0:p.d,z0:v.z,vx:v.x,vy:v.y,cx:p.cx,cy:p.cy};return}
    if(WB.ptrs.size>2)return;
    try{wrap.setPointerCapture(e.pointerId)}catch(x){}
    const w=wbToWorld(e.clientX,e.clientY),node=e.target.closest('.bel'),id=node&&node.dataset.id,el=id&&wbFind(id),v=wbView(),touch=e.pointerType==='touch',tool=WB.tool;
    if(e.button===1||tool==='hand'||WB.space||(tool==='select'&&!el&&touch)){WB.op={k:'pan',sx:e.clientX,sy:e.clientY,vx:v.x,vy:v.y,tap:tool==='select'&&!el};wrap.classList.add('panning');return}
    if(tool==='select'){
      if(el){const ck=e.target.closest('.ck');if(ck&&!WB.edit&&!e.shiftKey){wbToggleCk(id,+ck.dataset.ln);return}
        if(e.target.classList.contains('bh')&&!el.lock){wbSnap();const bx=wbBox(el);WB.op={k:'resize',id,sx:w[0],sy:w[1],w0:bx.w,h0:bx.h,b0:bx,pts0:el.pts?el.pts.map(p=>p.slice()):null,img:el.type==='image'};return}
        if(e.shiftKey){const s=new Set(WB.sel),grp=wbExpand([id]);grp.forEach(g=>s.has(id)?s.delete(g):s.add(g));wbSetSel([...s]);return}
        if(el.lock){wbSetSel([id]);WB.op={k:'pan',sx:e.clientX,sy:e.clientY,vx:v.x,vy:v.y};wrap.classList.add('panning');return}
        if(!WB.sel.has(id))wbSetSel(wbExpand([id]));startMove([...WB.sel],w,id,e.pointerType);return}
      wbSetSel([]);const m=document.createElement('div');m.className='bmarq';$('#bworld').append(m);WB.op={k:'marq',sx:w[0],sy:w[1],temp:m};return}
    if(tool==='lasso'){const hit=[...WB.sel].map(wbFind).find(q=>{if(!q)return false;const b=wbBox(q);return w[0]>b.x&&w[0]<b.x+b.w&&w[1]>b.y&&w[1]<b.y+b.h});
      if(hit){startMove([...WB.sel],w,hit.id,e.pointerType);return}
      wbSetSel([]);const n=document.createElementNS('http://www.w3.org/2000/svg','svg');n.setAttribute('class','blasso');n.innerHTML='<path/>';$('#bworld').append(n);WB.op={k:'lasso',pts:[w],temp:n};return}
    if(tool==='pen'||tool==='hl'){const ps=wbSt(tool),pr=tool==='pen'&&e.pointerType==='pen';const n=document.createElement('div');n.className='bel b-stroke drawing';$('#bworld').append(n);
      WB.op={k:'draw',pts:[pr?[w[0],w[1],e.pressure||.5]:w],col:ps.color,sw:ps.sw,op:ps.op,pr,hl:tool==='hl',auto:tool==='pen'&&ps.auto,temp:n};return}
    if(tool==='erase'){wbSnap();WB.op={k:'erase',hit:false};wbEraseAt(w);return}
    if(WB_SHAPES.includes(tool)||['frame','arrow','line'].includes(tool)){const n=document.createElement('div');n.className='bel b-'+(tool==='line'?'arrow':tool)+(WB_SHAPES.includes(tool)?' b-shape':'')+' drawing';$('#bworld').append(n);
      const hf=(tool==='arrow'||tool==='line')?wbHitEl(w):null;WB.op={k:'shape',t:tool,sx:w[0],sy:w[1],ex:w[0],ey:w[1],from:hf?hf.id:null,temp:n};return}
    if(tool==='text'){const ts=wbSt('text'),e2=wbAdd({id:uid(),type:'text',x:w[0],y:w[1]-14,w:260,h:40,text:'',fs:ts.fs,color:ts.color,fw:ts.fw,fi:ts.fi,ta:ts.ta,ff:ts.ff});WB.tool='select';wbToolbar();setTimeout(()=>wbEdit(e2.id),30);return}
    if(tool==='sticky'){const ss=wbSt('sticky'),e2=wbAdd({id:uid(),type:'sticky',x:w[0]-110,y:w[1]-70,w:220,h:150,text:'',fs:ss.fs,color:NOTE_COLORS[wbEls().filter(x=>x.type==='sticky').length%NOTE_COLORS.length]});WB.tool='select';wbToolbar();setTimeout(()=>wbEdit(e2.id),30);return}});
  wrap.addEventListener('pointermove',e=>{if(!WB.ptrs.has(e.pointerId))return;WB.ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});const o=WB.op;if(!o)return;const v=wbView();
    if(o.k==='pinch'&&WB.ptrs.size>=2){const p=pinch(),r=wrap.getBoundingClientRect(),nz=Math.max(.1,Math.min(5,o.z0*p.d/o.d0));const px=o.cx-r.left,py=o.cy-r.top;v.z=nz;v.x=px-(px-o.vx)*nz/o.z0+(p.cx-o.cx);v.y=py-(py-o.vy)*nz/o.z0+(p.cy-o.cy);wbApplyView();return}
    if(o.k==='pan'){v.x=o.vx+e.clientX-o.sx;v.y=o.vy+e.clientY-o.sy;wbApplyView();return}
    const w=wbToWorld(e.clientX,e.clientY);
    if(o.k==='move'){if(!o.moved){if(Math.hypot(w[0]-o.sx,w[1]-o.sy)*v.z<3)return;wbSnap();o.moved=true}let D=[w[0]-o.sx,w[1]-o.sy];if(wbSnapOn()&&!e.altKey)D=wbGuides(o,D);else wbClearGuides();
      for(const id of o.ids){const el=wbFind(id),or=o.orig[id];if(!el||!or)continue;wbShift(el,or,D[0],D[1]);const n=WB.nodes[id];if(n){if(el.pts||el.type==='arrow')wbRefresh([id]);else wbPlace(n,el)}}
      wbRefreshArrows(o.ids);return}
    if(o.k==='resize'){const el=wbFind(o.id);if(!el)return;let nw=Math.max(o.pts0?6:30,o.w0+w[0]-o.sx),nh=Math.max(o.pts0?6:24,o.h0+w[1]-o.sy);const lock=o.img||e.shiftKey||(WB.lock&&(wbIsShape(el)||['frame','stroke'].includes(el.type)));if(lock){const k=Math.max(nw/o.w0,nh/o.h0);nw=o.w0*k;nh=o.h0*k}
      if(o.pts0){const kx=nw/o.w0,ky=nh/o.h0,b=o.b0;el.pts=o.pts0.map(p=>{const q=p.slice();q[0]=b.x+(p[0]-b.x)*kx;q[1]=b.y+(p[1]-b.y)*ky;return q})}else{el.w=nw;el.h=nh}wbRefresh([o.id]);wbRefreshArrows([o.id]);return}
    if(o.k==='marq'){const x=Math.min(o.sx,w[0]),y=Math.min(o.sy,w[1]);o.temp.style.cssText=`left:${x}px;top:${y}px;width:${Math.abs(w[0]-o.sx)}px;height:${Math.abs(w[1]-o.sy)}px`;o.ex=w[0];o.ey=w[1];return}
    if(o.k==='lasso'){const l=o.pts[o.pts.length-1];if(Math.hypot(w[0]-l[0],w[1]-l[1])*v.z<3)return;o.pts.push(w);o.temp.firstChild.setAttribute('d','M'+o.pts.map(p=>F1(p[0])+' '+F1(p[1])).join('L')+'Z');o.temp.firstChild.setAttribute('stroke-width',1.5/v.z);return}
    if(o.k==='draw'){const wp=o.pr?[w[0],w[1],e.pressure||.5]:w;if(e.shiftKey){o.pts=[o.pts[0],wp]}else{const l=o.pts[o.pts.length-1];if(Math.hypot(w[0]-l[0],w[1]-l[1])*v.z<1.6)return;if(o.str)o.pts=[o.pts[0]];o.pts.push(wp)}o.str=e.shiftKey;
      const tmp={type:'stroke',pts:o.pts,sw:o.sw,color:o.col,hl:o.hl,op:o.op,pr:o.pr};o.temp.innerHTML=wbNodeHTML(tmp);wbPlace(o.temp,tmp);return}
    if(o.k==='erase'){wbEraseAt(w);return}
    if(o.k==='shape'){o.ex=w[0];o.ey=w[1];o.shift=e.shiftKey||WB.lock;const tmp=wbShapeFromOp(o);o.temp.innerHTML=wbNodeHTML(tmp);wbPlace(o.temp,tmp)}});
  const end=e=>{WB.ptrs.delete(e.pointerId);if(e.pointerType==='touch')cur.hidden=true;const o=WB.op;if(!o)return;if(o.k==='pinch'){if(WB.ptrs.size<2){WB.op=null;save()}return}
    WB.op=null;wrap.classList.remove('panning');
    if(o.k==='pan'){if(o.tap&&Math.hypot(e.clientX-o.sx,e.clientY-o.sy)<6)wbSetSel([]);save();return}
    if(o.k==='move'){wbClearGuides();if(o.moved){save();wbTaskDrop(o.ids)}else if(o.pt!=='mouse'){const now=Date.now();if(WB.tap&&WB.tap.id===o.id&&now-WB.tap.t<450){WB.tap=null;wbEdit(o.id)}else WB.tap={id:o.id,t:now}}return}
    if(o.k==='resize'){save();return}
    if(o.k==='marq'){o.temp.remove();const x1=Math.min(o.sx,o.ex??o.sx),x2=Math.max(o.sx,o.ex??o.sx),y1=Math.min(o.sy,o.ey??o.sy),y2=Math.max(o.sy,o.ey??o.sy);if(x2-x1<3&&y2-y1<3)return;
      wbSetSel(wbExpand(wbEls().filter(el=>{if(el.lock)return false;const b=wbBox(el);return b.x<x2&&b.x+b.w>x1&&b.y<y2&&b.y+b.h>y1}).map(el=>el.id)));return}
    if(o.k==='lasso'){o.temp.remove();if(o.pts.length<3)return;wbSetSel(wbExpand(wbEls().filter(el=>{if(el.lock)return false;if(el.pts)return el.pts.some(p=>wbPip(p,o.pts));if(el.type==='arrow'){const g=wbArrowGeom(el);return wbPip(g.p,o.pts)&&wbPip(g.q,o.pts)}return wbPip(wbCenter(el),o.pts)}).map(el=>el.id)));return}
    if(o.k==='draw'){o.temp.remove();const eps=.6/wbView().z;const pts=wbRdp(o.pts,o.pr?eps*.5:eps).map(p=>p.length>2?[F1(p[0]),F1(p[1]),Math.round(p[2]*100)/100]:[F1(p[0]),F1(p[1])]);
      if(o.auto){const sh=wbRecognize(o.pts,{color:o.col,sw:o.sw,op:o.op});if(sh){wbAdd(sh,false);return}}
      wbAdd({id:uid(),type:'stroke',pts,color:o.col,sw:o.sw,op:o.op,hl:o.hl||undefined,pr:o.pr||undefined},false);return}
    if(o.k==='erase'){if(!o.hit){const b=board(),h=WB.hist[b.id];if(h)h.pop()}else save();return}
    if(o.k==='shape'){o.temp.remove();const el=wbShapeFromOp(o,true);if(!el)return;wbAdd(el);if(el.type==='frame')setTimeout(()=>wbEdit(el.id),30);WB.tool='select';wbToolbar()}};
  wrap.addEventListener('pointerup',end);wrap.addEventListener('pointercancel',end);
  wrap.addEventListener('click',e=>{const bl=e.target.closest('.blink');if(bl){e.stopPropagation();const n=bl.closest('.bel');if(n)wbFollow(wbFind(n.dataset.id))}});
  wrap.addEventListener('dblclick',e=>{if(skip(e.target)||WB.present)return;const node=e.target.closest('.bel');if(node){wbEdit(node.dataset.id);return}if(WB.tool==='select'){const w=wbToWorld(e.clientX,e.clientY),ts=wbSt('text');const e2=wbAdd({id:uid(),type:'text',x:w[0],y:w[1]-14,w:260,h:40,text:'',fs:ts.fs,color:ts.color,fw:ts.fw,fi:ts.fi,ta:ts.ta,ff:ts.ff});setTimeout(()=>wbEdit(e2.id),30)}});
  wrap.addEventListener('wheel',e=>{if(e.target.closest('.wbt')&&!e.ctrlKey)return;e.preventDefault();if(WB.present)return;if(e.ctrlKey||e.metaKey){wbZoomAt(e.clientX,e.clientY,Math.exp(-e.deltaY*.0022))}else{const v=wbView();v.x-=e.deltaX;v.y-=e.deltaY;wbApplyView();clearTimeout(wrap._t);wrap._t=setTimeout(save,500)}},{passive:false});
  wrap.addEventListener('dragover',e=>{e.preventDefault()});wrap.addEventListener('drop',e=>{e.preventDefault();const f=[...(e.dataTransfer.files||[])];if(f.length)wbAddImages(f,wbToWorld(e.clientX,e.clientY))});
  document.addEventListener('paste',e=>{if(curView()!=='boards'||nbMode!=='boards'||WB.edit||WB.present)return;const tg=e.target;if(tg&&(/INPUT|TEXTAREA/.test(tg.tagName)||tg.isContentEditable))return;
    const f=[...(e.clipboardData.files||[])].filter(x=>/^image\//.test(x.type));if(f.length){e.preventDefault();wbAddImages(f);return}
    const tx=e.clipboardData.getData('text')||'';e.preventDefault();if(tx.startsWith('thabat-wb:')){wbPaste(tx.slice(10));return}
    if(tx.trim()){const c=wbViewCenter(),ts=wbSt('text');wbAdd({id:uid(),type:'text',x:c[0]-160,y:c[1]-20,w:320,h:40,text:tx.trim(),fs:ts.fs,color:ts.color,fw:ts.fw,fi:ts.fi,ta:ts.ta,ff:ts.ff});return}
    if(WB.clip||localStorage.getItem('thabat.wbclip'))wbPaste()});
  document.addEventListener('keydown',e=>{if(curView()!=='boards'||nbMode!=='boards')return;
    if(WB.present){const k=e.key,rtl=document.documentElement.dir==='rtl';if(k==='Escape'){e.preventDefault();wbPresEnd()}else if(k===' '||k==='PageDown'||k==='ArrowDown'||k===(rtl?'ArrowLeft':'ArrowRight')){e.preventDefault();wbPresStep(1)}else if(k==='PageUp'||k==='ArrowUp'||k===(rtl?'ArrowRight':'ArrowLeft')){e.preventDefault();wbPresStep(-1)}return}
    if(WB.edit||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)||e.target.isContentEditable||$('#ltModal').classList.contains('on'))return;
    const k=e.key.toLowerCase(),mod=e.ctrlKey||e.metaKey;
    if(mod&&k==='z'){e.preventDefault();e.shiftKey?wbRedo():wbUndo();return}if(mod&&k==='y'){e.preventDefault();wbRedo();return}if(mod&&k==='d'){e.preventDefault();wbDup();return}if(mod&&k==='a'){e.preventDefault();wbSetSel(wbEls().filter(x=>!x.lock).map(x=>x.id));return}
    if(mod&&k==='c'){if(WB.sel.size){wbCopy(false)}return}if(mod&&k==='x'){if(WB.sel.size){e.preventDefault();wbCopy(true)}return}if(mod&&k==='v')return;
    if(mod&&k==='g'){e.preventDefault();e.shiftKey?wbUngroup():wbGroup();return}if(mod&&e.shiftKey&&k==='l'){e.preventDefault();wbLockToggle();return}
    if(mod&&(k==='b'||k==='i')&&WB.sel.size){e.preventDefault();if(k==='b'){const e0=wbSelFor('fw')[0];if(e0)wbSetProp('fw',wbGet(e0,'fw')>=600?400:700)}else{const e0=wbSelFor('fi')[0];if(e0)wbSetProp('fi',!wbGet(e0,'fi'))}wbToolbar();return}
    if(k==='enter'&&WB.sel.size===1){e.preventDefault();wbEdit([...WB.sel][0]);return}
    if(k==='delete'||k==='backspace'){wbDelete();return}if(k===' '){WB.space=true;$('#bwrap').classList.add('grab');e.preventDefault();return}
    if(k==='escape'){wbSetSel([]);return}
    if(k.startsWith('arrow')&&WB.sel.size){e.preventDefault();const st=e.shiftKey?10:1,dx=k==='arrowleft'?-st:k==='arrowright'?st:0,dy=k==='arrowup'?-st:k==='arrowdown'?st:0;const s=[...WB.sel].map(wbFind).filter(x=>x&&!x.lock);if(!s.length)return;
      if(!WB._nudge)wbSnap();clearTimeout(WB._nudge);WB._nudge=setTimeout(()=>{WB._nudge=null},600);s.forEach(x=>wbShift(x,x,dx,dy));wbRefresh(s.map(x=>x.id));wbRefreshArrows(s.map(x=>x.id));save();return}
    const map={v:'select',q:'lasso',h:'hand',p:'pen',m:'hl',e:'erase',r:'rect',o:'ellipse',l:'line',a:'arrow',t:'text',n:'sticky',f:'frame'};if(!mod&&!e.altKey&&map[k]){WB.tool=map[k];if(WB_SHAPES.includes(WB.tool))WB.shape=WB.tool;if(WB.tool!=='select'&&WB.tool!=='lasso')wbSetSel([]);wbToolbar()}
    if(!mod&&(k==='+'||k==='=')){const r=$('#bwrap').getBoundingClientRect();wbZoomAt(r.left+r.width/2,r.top+r.height/2,1.2)}if(!mod&&k==='-'){const r=$('#bwrap').getBoundingClientRect();wbZoomAt(r.left+r.width/2,r.top+r.height/2,1/1.2)}if(k==='0'&&!mod)wbFit()});
  document.addEventListener('keyup',e=>{if(e.key===' '){WB.space=false;$('#bwrap').classList.remove('grab')}})})();
function wbHitEl(w,not){const ins=el=>{const b=wbBox(el);return w[0]>b.x&&w[0]<b.x+b.w&&w[1]>b.y&&w[1]<b.y+b.h};const c=wbEls().filter(el=>!['stroke','arrow'].includes(el.type)&&el.id!==not&&ins(el)).reverse();return c.find(el=>el.type!=='frame')||c[0]||null}
function wbShapeFromOp(o,final){let ex=o.ex,ey=o.ey;const isLine=o.t==='arrow'||o.t==='line';
  if(o.shift){const dx=ex-o.sx,dy=ey-o.sy;if(isLine){const L_=Math.hypot(dx,dy),an=Math.round(Math.atan2(dy,dx)/(Math.PI/12))*(Math.PI/12);ex=o.sx+L_*Math.cos(an);ey=o.sy+L_*Math.sin(an)}else{const m=Math.max(Math.abs(dx),Math.abs(dy));ex=o.sx+(dx<0?-m:m);ey=o.sy+(dy<0?-m:m)}}
  const x=Math.min(o.sx,ex),y=Math.min(o.sy,ey);let w=Math.abs(ex-o.sx),h=Math.abs(ey-o.sy);
  if(isLine){if(final&&Math.hypot(ex-o.sx,ey-o.sy)<8)return null;let to=null;if(final){const hit=wbHitEl([ex,ey],o.from);if(hit)to=hit.id}const as=wbSt(o.t);
    return{id:final?uid():'tmp',type:'arrow',x1:o.sx,y1:o.sy,x2:ex,y2:ey,from:o.from,to,color:as.color,sw:as.sw,op:as.op,head:as.head,route:as.route,dash:as.dash||undefined,fs:as.fs}}
  const ss=o.t==='frame'?wbSt('frame'):wbSt('shape'),sty=o.t==='frame'?{color:ss.color,fs:ss.fs,title:t('wb.frame')}:{color:ss.color,sw:ss.sw,op:ss.op,fc:ss.fc,fo:ss.fo,fs:ss.fs,fw:ss.fw,fi:ss.fi,ta:ss.ta,ff:ss.ff,rx:(o.t==='rect'||o.t==='bubble')?ss.rx:undefined};
  if(final&&w<6&&h<6){w=o.t==='frame'?420:160;h=o.t==='frame'?300:(o.shift||['star','tri','diamond'].includes(o.t))?160:100;return{id:uid(),type:o.t,x:o.sx-w/2,y:o.sy-h/2,w,h,...sty}}
  return{id:final?uid():'tmp',type:o.t,x,y,w:Math.max(w,2),h:Math.max(h,2),...sty}}
function wbResample(pts,step){const out=[pts[0]];for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/step));for(let j=1;j<=n;j++){const t_=j/n,p=[a[0]+(b[0]-a[0])*t_,a[1]+(b[1]-a[1])*t_];if(a.length>2)p.push(a[2]+((b[2]??a[2])-a[2])*t_);out.push(p)}}return out}
function wbEraseAt(w){const es=wbSt('erase'),z=wbView().z,r=es.size/2/z,b=board(),part=es.mode==='part',out=[];let hit=false;
  for(const el of b.els){let h=false;if(!el.lock){if(el.type==='stroke')h=wbHitStroke(el,w,r);else if(el.type==='arrow')h=wbHitArrow(el,w,r)}
    if(!h){out.push(el);continue}hit=true;const node=WB.nodes[el.id];delete WB.nodes[el.id];
    if(part&&el.type==='stroke'){const rr=r+(el.sw||2)/2,segs=[];let cur=[];for(const p of wbResample(el.pts,Math.max(.5,r/4))){if(Math.hypot(p[0]-w[0],p[1]-w[1])<rr){if(cur.length>1)segs.push(cur);cur=[]}else cur.push(p)}if(cur.length>1)segs.push(cur);
      for(const sg of segs){const c={...el,id:uid(),pts:wbRdp(sg,.35/z).map(p=>p.length>2?[F1(p[0]),F1(p[1]),Math.round(p[2]*100)/100]:[F1(p[0]),F1(p[1])])};delete c.gid;out.push(c);const n=wbMakeNode(c);WB.nodes[c.id]=n;if(node)node.before(n);else $('#bworld').append(n)}}
    if(node)node.remove()}
  if(hit){b.els=out;if(WB.op)WB.op.hit=true}}
function wbTaskDrop(ids){for(const id of ids){const el=wbFind(id);if(!el||el.type!=='taskref')continue;const x=LT().find(q=>q.id===el.task);if(!x||x.status!=='active')continue;const[cx,cy]=wbCenter(el);
    const fr=wbEls().find(f=>f.type==='frame'&&f.kind==='done'&&cx>f.x&&cx<f.x+f.w&&cy>f.y&&cy<f.y+f.h);if(fr&&confirm(t('wb.markDone',x.text))){ltFinish(x);wbRefresh([id])}}}

