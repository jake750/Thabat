/* ---- popups re-fit the screen whenever their content grows (e.g. the ayah list of a scanned page loads after the popup opens) ---- */
function ppFit(p,x,y){if(!p||!p.isConnected)return;p.style.maxHeight='';const W=innerWidth,H=innerHeight,w=p.offsetWidth;let h=p.offsetHeight;
  if(h>H-16){p.style.maxHeight=(H-16)+'px';p.style.overflowY='auto';h=H-16}
  let top=y+16;if(top+h>H-8){top=y-h-16;if(top<8)top=Math.max(8,H-h-8)}
  p.style.left=Math.max(8,Math.min(W-w-8,x-w/2))+'px';p.style.top=top+'px'}
{const _qp=qPopAt;qPopAt=function(html,x,y,cls){const p=_qp(html,x,y,cls);p._xy=[x,y];try{ppFit(p,x,y);const mo=new MutationObserver(()=>{if(!p.isConnected){mo.disconnect();return}ppFit(p,x,y)});mo.observe(p,{childList:true,subtree:true});if(window.ResizeObserver){const ro=new ResizeObserver(()=>{if(!p.isConnected){ro.disconnect();return}ppFit(p,x,y)});ro.observe(p)}}catch(e){}return p}}
window.addEventListener('resize',()=>{const p=$('#ppPop');if(p&&p._xy)ppFit(p,p._xy[0],p._xy[1])});
