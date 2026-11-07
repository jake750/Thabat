/* ============ v3.172.1 (his screenshots 2026-11-07): notes like a phone notes app, smoother pictures in a note, the phone back button closes the picture viewer, no «saved» pill on each dhikr, tidier number steppers ============ */

/* 1. notes: always the two-column grid (like a phone's notes app). The month timeline sorted by date only, so the sort button did nothing there. */
ntlOn=function(){return false};

/* 2. a tap on the tasbih (or its undo / its dhikr chips) is not «an edit you made»: no «✓ saved» pill on each count */
document.addEventListener('pointerdown',e=>{try{if(e.target.closest&&e.target.closest('#tsTap,#tsUndo,#tsBox [data-ts]'))SVD.act=0}catch(x){}},true);

/* 3. a number stepper (− field +) stays on one line even inside a label laid out as a column (the memorisation segment picker stacked them) */
hookFn('frmStep',()=>frmStep,f=>{frmStep=f},'post',function(i){try{const a=i.previousElementSibling,b=i.nextElementSibling,p=i.parentElement;
  if(!p||p.classList.contains('nstepw')||!a||!b||!a.classList.contains('nsb')||!b.classList.contains('nsb'))return;const w=document.createElement('span');w.className='nstepw';i.before(w);w.append(a,i,b)}catch(e){}});

/* 4. the phone back button closes the picture viewer first (it went back to Today behind it) */
{const _tb=window.thabatBack;window.thabatBack=function(){const lb=$('#lbox');if(lb&&lb.classList.contains('on')){lbClose();return true}return _tb?_tb():false}}

/* 5. pictures in a note: drag to reorder with the finger (press and hold) or the mouse; the other pictures slide aside, nothing redraws until you let go;
      the note keeps its scroll position when it redraws (the arrows used to jump it back to the top) */
const NIMD={st:null,id:null,at:0};
hookFn('renderNoteEd',()=>renderNoteEd,f=>{renderNoteEd=f},'pre',function(){try{const m=$('#noteModal'),bx=m&&m.querySelector('.notebox');NIMD.st=(m&&bx&&m.classList.contains('on')&&NE&&NIMD.id===NE.id)?bx.scrollTop:null}catch(e){NIMD.st=null}});
hookFn('renderNoteEd',()=>renderNoteEd,f=>{renderNoteEd=f},'post',function(){try{NIMD.id=NE?NE.id:null;const bx=$('#noteModal .notebox');if(NIMD.st!=null&&bx)bx.scrollTop=NIMD.st;NIMD.st=null;nimDragBind()}catch(e){console.error(e)}});
function nimDragBind(){const box=$('#neImgs');if(!box||box._nimd)return;box._nimd=1;
  box.addEventListener('click',e=>{if(Date.now()-NIMD.at<450){e.stopPropagation();e.preventDefault()}},true);
  box.addEventListener('contextmenu',e=>{if(e.target.closest('.neimg'))e.preventDefault()});
  box.querySelectorAll('.neimg').forEach(el=>{el.removeAttribute('draggable');el.ondragstart=el.ondragover=el.ondrop=null;el.addEventListener('pointerdown',e=>nimDown(e,el,box))})}
function nimDown(e,el,box){if(e.button>0||e.target.closest('button,input,label'))return;const touch=e.pointerType!=='mouse',x0=e.clientX,y0=e.clientY,r0=el.getBoundingClientRect(),ox=x0-r0.left,oy=y0-r0.top,first=[...box.querySelectorAll('.neimg')];
  let on=false,tm=null,busy=0;
  const tiles=()=>[...box.querySelectorAll('.neimg')];
  const place=ev=>{const z=uiZoom()||1;el.style.transform='';const r=el.getBoundingClientRect();el.style.transform=`translate(${(ev.clientX-ox-r.left)/z}px,${(ev.clientY-oy-r.top)/z}px) scale(1.06)`};
  const start=()=>{on=true;el.classList.add('nimdrag');box.classList.add('nimdragging');try{vib(12)}catch(_){}};
  const over=ev=>{if(busy)return;const z0=uiZoom()||1,L_=tiles(),T=L_.find(t=>{if(t===el)return false;const r=t.getBoundingClientRect();let mx=0,my=0;try{const m=new DOMMatrixReadOnly(getComputedStyle(t).transform);mx=m.m41*z0;my=m.m42*z0}catch(_){}
    /* where the tile rests, not where its slide is right now */const l=r.left-mx,tp=r.top-my;return ev.clientX>=l&&ev.clientX<=l+r.width&&ev.clientY>=tp&&ev.clientY<=tp+r.height});if(!T)return;
    const before=new Map(L_.filter(t=>t!==el).map(t=>[t,t.getBoundingClientRect()]));const z=uiZoom()||1;
    if(L_.indexOf(el)>L_.indexOf(T))T.before(el);else T.after(el);
    before.forEach((r,t)=>{const n=t.getBoundingClientRect(),dx=(r.left-n.left)/z,dy=(r.top-n.top)/z;if(!dx&&!dy)return;t.style.transition='none';t.style.transform=`translate(${dx}px,${dy}px)`;void t.offsetWidth;t.style.transition='transform .2s cubic-bezier(.2,.8,.2,1)';t.style.transform=''});
    busy=1;setTimeout(()=>{busy=0},40);place(ev)};
  const mv=ev=>{if(ev.pointerId!==e.pointerId)return;const d=Math.hypot(ev.clientX-x0,ev.clientY-y0);
    if(!on){if(touch){if(d>8)nimFin()}else if(d>6)start();if(!on)return}
    ev.preventDefault();place(ev);over(ev)};
  const tmv=ev=>{if(on)ev.preventDefault()};
  const up=ev=>{if(ev&&ev.pointerId!==e.pointerId)return;nimFin(on)};
  function nimFin(commit){clearTimeout(tm);removeEventListener('pointermove',mv);removeEventListener('pointerup',up);removeEventListener('pointercancel',up);removeEventListener('touchmove',tmv);
    if(!on)return;on=false;NIMD.at=Date.now();el.classList.remove('nimdrag');box.classList.remove('nimdragging');el.style.transform='';tiles().forEach(t=>{t.style.transition='';t.style.transform=''});
    const L_=tiles();if(!commit||!NE||L_.every((t,k)=>t===first[k]))return;const ids=L_.map(t=>(NE.imgs||[])[+t.dataset.i]).filter(Boolean);if(ids.length!==(NE.imgs||[]).length)return;
    neRead();NE.imgs=ids;renderNoteEd()}
  if(touch)tm=setTimeout(start,280);
  addEventListener('pointermove',mv,{passive:false});addEventListener('pointerup',up);addEventListener('pointercancel',up);addEventListener('touchmove',tmv,{passive:false})}
