/* ============ v3.162.1 board menus stay inside the window ============ */
/* wbMenu/wbPop placed the menu in screen pixels while the body is zoomed, and a long menu (the templates) ran past the top. */
function wbPopFit(p,btn,up){if(!p||!btn)return;const z=uiZoom()||1,r=btn.getBoundingClientRect(),W=innerWidth/z,H=innerHeight/z,
  bt=r.top/z,bb=r.bottom/z,bl=r.left/z,br=r.right/z;p.style.maxHeight='';p.style.overflowY='';
  const w=p.offsetWidth,h=p.scrollHeight,below=H-bb-14,above=bt-14;
  let x=p.classList.contains('wbmenu')?(document.documentElement.dir==='rtl'?br-w:bl):(bl+(br-bl)/2-w/2);x=Math.max(8,Math.min(W-w-8,x));
  let atUp=up?(h<=above||above>=below):!(h<=below||below>=above);const room=atUp?above:below;let y,hh=h;
  if(h<=room)y=atUp?bt-h-6:bb+6;
  else{/* neither side holds it: use the whole height, scrolling only when even that is too short */
    const full=H-16;if(h>full){hh=full;p.style.maxHeight=full+'px';p.style.overflowY='auto';p.style.overscrollBehavior='contain'}
    y=atUp?bt-hh-6:bb+6}
  y=Math.max(8,Math.min(H-hh-8,y));
  p.style.left=x+'px';p.style.top=y+'px'}
