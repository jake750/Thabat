/* ============ v3.87.1: the month in the Summary fits a phone screen (his pick «أ»): thin bars, day numbers every five days, tap a bar for its day ============ */
/* The Summary grid column took the cards' widest content (a header row that never wrapped and 31 day numbers side by side), so on a phone it was wider
   than the screen, the page scrolled sideways and a sideways drag turned the page to Notes. */
function bxmPaint(){const x=$('#bX');if(!x)return;const on=MOB.matches&&x.children.length>14;x.classList.toggle('bxm',on);if(!on)return;
  [...x.children].forEach((s,i)=>{const d=i+1,keep=d===1||d%5===0||s.classList.contains('today');s.classList.toggle('bxh',!keep)})}
{hookFn('renderBrief',()=>renderBrief,f=>{renderBrief=f},'post',function(){try{bxmPaint()}catch(e){}})}
