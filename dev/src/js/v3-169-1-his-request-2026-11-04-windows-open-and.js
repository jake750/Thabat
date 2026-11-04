/* ============ v3.169.1 his request 2026-11-04: windows open and close smoothly ============ */
/* Opening had a small pop only without «reduce motion» (his Windows may have it on), and closing was instant.
   Now every .modal / .praymodal fades its backdrop in, and when «on» is removed (by any of the many close paths)
   a MutationObserver puts .mdxout on it for ~0.2 s, so the backdrop and the box fade out before it hides.
   With reduce motion only the opacity changes (no movement). Opening again during the fade cancels it. */
const MDX={t:new WeakMap(),seen:new WeakSet()};
function mdxMs(){return document.documentElement.classList.contains('rmotion')?150:220}
function mdxOut(m){clearTimeout(MDX.t.get(m));m.classList.add('mdxout');MDX.t.set(m,setTimeout(()=>m.classList.remove('mdxout'),mdxMs()))}
{const mo=new MutationObserver(rs=>{for(const r of rs){const m=r.target,was=/(^|\s)on(\s|$)/.test(r.oldValue||''),now=m.classList.contains('on');
   if(was&&!now&&m.isConnected&&!m.classList.contains('mdxout'))mdxOut(m);
   else if(now&&m.classList.contains('mdxout')){clearTimeout(MDX.t.get(m));m.classList.remove('mdxout')}}});
 const watch=el=>{if(el&&el.classList&&(el.classList.contains('modal')||el.classList.contains('praymodal'))&&!MDX.seen.has(el)){MDX.seen.add(el);mo.observe(el,{attributes:true,attributeFilter:['class'],attributeOldValue:true})}};
 document.querySelectorAll('.modal,.praymodal').forEach(watch);
 new MutationObserver(rs=>{for(const r of rs)r.addedNodes.forEach(watch)}).observe(document.body,{childList:true})}

