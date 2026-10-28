/* ============ v3.136.2: phones — the line being typed stays above the keyboard (the 3.71 check looked at the whole field, so a tall note box never moved) ============ */
function kbCaretY(a){try{if(a.tagName==='TEXTAREA')return taCaret(a,a.selectionEnd||0).y;if(a.isContentEditable){const s=getSelection();if(!s.rangeCount)return null;const r=s.getRangeAt(0).cloneRange();r.collapse(false);let b=r.getBoundingClientRect();if(!b.height){const p=(r.startContainer.nodeType===1?r.startContainer:r.startContainer.parentElement);b=p.getBoundingClientRect()}return b.bottom}return a.getBoundingClientRect().bottom}catch(e){return null}}
function kbScroller(a){for(let p=a.parentElement;p&&p!==document.body;p=p.parentElement){const o=getComputedStyle(p).overflowY;if((o==='auto'||o==='scroll')&&p.scrollHeight>p.clientHeight+2)return p}return document.scrollingElement}
function kbKeep(){const a=document.activeElement;if(!a||!MOB.matches||!(a.tagName==='TEXTAREA'||a.isContentEditable||a.tagName==='INPUT'))return;const vv=window.visualViewport,bot=(vv?vv.offsetTop+vv.height:innerHeight)-20,top=(vv?vv.offsetTop:0)+56;let y=kbCaretY(a);if(y==null)return;if(a.tagName==='TEXTAREA'){const r=a.getBoundingClientRect();y=Math.max(r.top+24,Math.min(y,r.bottom))}
  let d=y>bot?y-bot:(y<top+20?y-top-20:0);if(!d)return;
  const sc=kbScroller(a);sc.scrollTop+=d/(uiZoom()||1)}
{let tm=null;const go=ms=>{clearTimeout(tm);tm=setTimeout(kbKeep,ms)};
  document.addEventListener('input',e=>{if(MOB.matches&&e.target===document.activeElement)go(30)},true);
  document.addEventListener('selectionchange',()=>{if(MOB.matches)go(80)});
  document.addEventListener('focusin',()=>{if(MOB.matches)go(420)});
  if(window.visualViewport)visualViewport.addEventListener('resize',()=>{if(MOB.matches)go(160)})}
