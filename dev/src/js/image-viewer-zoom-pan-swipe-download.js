/* ============ image viewer: zoom, pan, swipe, download ============ */
const LB={ids:[],i:0,title:'',s:1,x:0,y:0,w:0,h:0,pts:new Map(),pinch:null,drag:null};
async function lbOpen(ids,i,title){if(!ids||!ids.length)return;LB.ids=ids;LB.i=i||0;LB.title=title||'';$('#lbox').classList.add('on');await lbShow()}
async function lbShow(){const id=LB.ids[LB.i],img=$('#lbImg');$('#lbN').textContent=LB.ids.length>1?(LB.i+1)+' / '+LB.ids.length:'';$('#lbT').textContent=LB.title;
  $('#lbPrev').hidden=$('#lbNext').hidden=LB.ids.length<2;img.style.opacity='0';const d=await nImg(id);if(!d){img.removeAttribute('src');toast(t('lb.miss'));return}
  img.onload=()=>{LB.w=img.naturalWidth;LB.h=img.naturalHeight;lbFit();img.style.opacity='1'};img.src=d}
function lbBase(){const W=innerWidth,H=innerHeight;return Math.min(W/LB.w,H/LB.h,1)}
function lbFit(){const W=innerWidth,H=innerHeight,b=lbBase();LB.s=b;LB.x=(W-LB.w*b)/2;LB.y=(H-LB.h*b)/2;lbApply()}
function lbClamp(){const W=innerWidth,H=innerHeight,w=LB.w*LB.s,h=LB.h*LB.s;LB.x=w<=W?(W-w)/2:Math.min(0,Math.max(W-w,LB.x));LB.y=h<=H?(H-h)/2:Math.min(0,Math.max(H-h,LB.y))}
function lbApply(){const img=$('#lbImg');img.style.width=LB.w+'px';img.style.height=LB.h+'px';img.style.maxWidth='none';img.style.maxHeight='none';img.style.transform=`translate(${LB.x}px,${LB.y}px) scale(${LB.s})`}
function lbZoom(f,cx,cy){const b=lbBase(),ns=Math.max(b,Math.min(b*8,LB.s*f));cx=cx??innerWidth/2;cy=cy??innerHeight/2;LB.x=cx-(cx-LB.x)*ns/LB.s;LB.y=cy-(cy-LB.y)*ns/LB.s;LB.s=ns;lbClamp();lbApply()}
function lbGo(d){if(LB.ids.length<2)return;LB.i=(LB.i+d+LB.ids.length)%LB.ids.length;lbShow()}
function lbClose(){$('#lbox').classList.remove('on');LB.pts.clear();LB.pinch=LB.drag=null}
async function lbDownload(){const d=await nImg(LB.ids[LB.i]);if(!d)return;const mime=(d.match(/^data:([^;]+)/)||[])[1]||'image/jpeg',ext=mime.split('/')[1].replace('jpeg','jpg'),base=(LB.title||'thabat').replace(/[\\/:*?"<>|]+/g,' ').trim().slice(0,40)||'thabat',name=`${base}-${LB.i+1}.${ext}`;
  if(ANDROID){try{const r=window.ThabatAndroid.saveFile(name,mime,d.split(',')[1]);toast(r?t('lb.saved',r):t('toast.saveFail'))}catch(e){toast(t('toast.saveFail'))}return}
  const a=document.createElement('a');a.href=d;a.download=name;document.body.append(a);a.click();a.remove();toast(t('lb.dl',name))}
{const st=$('#lbStage');
  st.addEventListener('wheel',e=>{e.preventDefault();lbZoom(e.deltaY<0?1.15:1/1.15,e.clientX,e.clientY)},{passive:false});
  st.addEventListener('dblclick',e=>{const b=lbBase();if(LB.s>b*1.05)lbFit();else lbZoom(2.5,e.clientX,e.clientY)});
  let lastTap=0;
  st.addEventListener('pointerdown',e=>{st.setPointerCapture(e.pointerId);LB.pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(LB.pts.size===2){const [a,b]=[...LB.pts.values()];LB.pinch={d:Math.hypot(a.x-b.x,a.y-b.y),s:LB.s,cx:(a.x+b.x)/2,cy:(a.y+b.y)/2};LB.drag=null}
    else if(LB.pts.size===1){LB.drag={x:e.clientX,y:e.clientY,ox:LB.x,oy:LB.y,t:Date.now()};st.classList.add('drag');
      if(e.pointerType!=='mouse'){const now=Date.now();if(now-lastTap<300){const b=lbBase();if(LB.s>b*1.05)lbFit();else lbZoom(2.5,e.clientX,e.clientY);LB.drag=null}lastTap=now}}});
  st.addEventListener('pointermove',e=>{if(!LB.pts.has(e.pointerId))return;LB.pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(LB.pinch&&LB.pts.size>=2){const [a,b]=[...LB.pts.values()],d=Math.hypot(a.x-b.x,a.y-b.y),f=(LB.pinch.s*d/LB.pinch.d)/LB.s;lbZoom(f,LB.pinch.cx,LB.pinch.cy);return}
    if(LB.drag){const b=lbBase();if(LB.s>b*1.02){LB.x=LB.drag.ox+e.clientX-LB.drag.x;LB.y=LB.drag.oy+e.clientY-LB.drag.y;lbClamp();lbApply()}}});
  const up=e=>{const D=LB.drag;LB.pts.delete(e.pointerId);if(LB.pts.size<2)LB.pinch=null;st.classList.remove('drag');
    if(D&&LB.pts.size===0){const dx=e.clientX-D.x,dy=e.clientY-D.y,b=lbBase();if(LB.s<=b*1.02&&Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.3&&Date.now()-D.t<700){const rtl=document.documentElement.dir==='rtl';lbGo((dx<0)!==rtl?1:-1)}
      else if(LB.s<=b*1.02&&dy>110&&Math.abs(dy)>Math.abs(dx)*1.5)lbClose()}LB.drag=null};
  st.addEventListener('pointerup',up);st.addEventListener('pointercancel',up)}
$('#lbX').onclick=lbClose;$('#lbIn').onclick=()=>lbZoom(1.4);$('#lbOut').onclick=()=>lbZoom(1/1.4);$('#lbFit').onclick=lbFit;$('#lbDl').onclick=lbDownload;$('#lbPrev').onclick=()=>lbGo(-1);$('#lbNext').onclick=()=>lbGo(1);
document.addEventListener('keydown',e=>{if(!$('#lbox').classList.contains('on'))return;e.stopPropagation();if(e.key==='Escape')lbClose();else if(e.key==='ArrowLeft')lbGo(-1);else if(e.key==='ArrowRight')lbGo(1);else if(e.key==='+'||e.key==='=')lbZoom(1.4);else if(e.key==='-')lbZoom(1/1.4);else if(e.key==='0')lbFit()},true);
addEventListener('resize',()=>{if($('#lbox').classList.contains('on')&&LB.w)lbFit()});

