/* ============ v3.157.2 event editor: extra buttons go into one «⋯» menu so the row fits ============ */
const EVX_KEEP=['evDel','evCancel','evSave','evxMore'];
function evxTidy(){try{const row=$('#evBox .evact');if(!row)return;
  const extra=[...row.querySelectorAll('button')].filter(b=>!EVX_KEEP.includes(b.id));
  extra.forEach(b=>b.classList.add('evxh'));
  let m=$('#evxMore');
  if(!extra.length){if(m)m.remove();return}
  if(!m){m=document.createElement('button');m.type='button';m.id='evxMore';m.className='btn sm ghost';m.textContent='⋯ '+t('evx.more');m.title=t('evx.more');row.prepend(m);
    m.onclick=()=>{const xs=[...row.querySelectorAll('button.evxh')];wbMenu(m,xs.map(b=>[b.innerHTML,()=>b.click()]));const p=$('#ppPop');if(p){const z=uiZoom()||1,r=m.getBoundingClientRect(),w=p.offsetWidth,h=p.offsetHeight,W=innerWidth/z,H=innerHeight/z;let x=document.documentElement.dir==='rtl'?r.right/z-w:r.left/z;x=Math.max(8,Math.min(W-w-8,x));let y=r.top/z-h-6;if(y<8)y=r.bottom/z+6;p.style.left=x+'px';p.style.top=y+'px';p.classList.add('evxpop')}}}
  else row.prepend(m)}catch(e){}}
{hookFn('renderEvEd',()=>renderEvEd,f=>{renderEvEd=f},'post',function(){evxTidy();setTimeout(evxTidy,0)})}
{hookFn('openEv',()=>openEv,f=>{openEv=f},'post',function(){setTimeout(evxTidy,0);setTimeout(evxTidy,120)})}

