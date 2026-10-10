/* ============ v3.12.4: the compact Quran bar on PC too — position · riwaya · full screen · ⋯, the sheets open as dropdowns ============ */
function qbPlace(id){const s=$('#'+id);if(!s)return;const box=s.querySelector('.qbshbox');if(!box)return;s.classList.toggle('qbpop',!MOB.matches);box.style.left=box.style.top='';if(MOB.matches)return;
  const a=$(id==='qbNav'?'#qbPos':'#qbMore');if(!a)return;const z=uiZoom(),r=a.getBoundingClientRect(),W=innerWidth/z,H=innerHeight/z,w=box.offsetWidth;
  let left=document.documentElement.dir==='rtl'?r.right/z-w:r.left/z;left=Math.max(8,Math.min(W-w-8,left));box.style.left=left+'px';box.style.top=(r.bottom/z+6)+'px';box.style.maxHeight=Math.max(200,H-r.bottom/z-20)+'px'}
{const _qo=qbOpen;qbOpen=function(id){_qo(id);try{qbPlace(id)}catch(e){}}}
addEventListener('resize',()=>{if(!MOB.matches)qbClose()});
