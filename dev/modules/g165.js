/* ============ v3.139.1 the book title in the middle of the reader bar ============ */
/* .bkt fills the space between ✕ and the buttons, so its text sat beside ✕. bkCenter pads the side
   nearer the bar's edge so the text box is centred on the whole bar; the pad shrinks when a long title
   needs the room. A ResizeObserver (border box, so the padding itself does not re-trigger it) keeps it right. */
var BKC={ro:null};
function bkCenter(){const bar=$('.bkbar'),tt=bar&&bar.querySelector('.bkt');if(!tt)return;
  tt.style.paddingLeft=tt.style.paddingRight='';
  const z=uiZoom()||1,B=bar.getBoundingClientRect(),T=tt.getBoundingClientRect();
  const gl=(T.left-B.left)/z,gr=(B.right-T.right)/z,need=Math.max(...[...tt.children].map(c=>c.scrollWidth||0),0);
  const room=Math.max(0,tt.clientWidth-need-8),pad=Math.min(Math.abs(gl-gr),room);
  if(pad<1)return;
  if(gl>gr)tt.style.paddingRight=pad+'px';else tt.style.paddingLeft=pad+'px'}
{const _b=bkBuild;bkBuild=async function(...a){const r=await _b(...a);try{const tt=$('.bkbar .bkt');if(tt){
  if(BKC.ro)BKC.ro.disconnect();BKC.ro=new ResizeObserver(()=>bkCenter());
  BKC.ro.observe(tt,{box:'border-box'});BKC.ro.observe(tt.parentNode,{box:'border-box'});
  [...tt.children].forEach(c=>BKC.ro.observe(c,{box:'border-box'}));bkCenter()}}catch(e){}return r}}
