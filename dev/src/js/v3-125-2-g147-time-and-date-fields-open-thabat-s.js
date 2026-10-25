/* ============ v3.125.2 (g147): time and date fields open Thabat's own picker instead of the browser's ============ */
/* <input type=time> → two columns (hours, minutes) + «now», «clear», «done»; <input type=date> → a month grid (Monday first) with the Hijri
   day under each date, ‹ ›, «today», «clear». PC: a dropdown under the field (typing into the field still works; typing closes it);
   phones: a bottom sheet (the Android time/date dialogs never open). Values go back with input events, and one change when it closes.
   data-native on the input (or S.settings.nativeSel) keeps the browser's picker. The native ⏱/📅 icon stays but no longer opens anything. */
const TPK={inp:null,el:null,v0:'',ym:null,lastT:0};
const tpkPad=n=>String(n).padStart(2,'0');
function tpkSkip(i){return !i||i.tagName!=='INPUT'||!/^(time|date)$/.test(i.type)||i.disabled||i.readOnly||i.dataset.native!=null||(window.S&&S.settings&&S.settings.nativeSel)}
function tpkSet(v){const i=TPK.inp;if(!i||i.value===v)return;i.value=v;i.dispatchEvent(new Event('input',{bubbles:true}))}
function tpkClose(){if(!TPK.el)return;const i=TPK.inp;TPK.el.remove();TPK.el=null;TPK.inp=null;
  if(i&&i.value!==TPK.v0)i.dispatchEvent(new Event('change',{bubbles:true}))}
function tpkPlace(){const el=TPK.el,i=TPK.inp;if(!el||!i)return;const box=el.querySelector('.rpkbox');if(MOB.matches){box.style.cssText='';return}
  const z=uiZoom(),r=i.getBoundingClientRect(),W=innerWidth/z,H=innerHeight/z,w=box.offsetWidth;
  let left=document.documentElement.dir==='rtl'?r.right/z-w:r.left/z;left=Math.max(8,Math.min(W-w-8,left));
  box.style.maxHeight='';const below=H-r.bottom/z-14,above=r.top/z-14,up=below<box.offsetHeight&&above>below;box.style.left=left+'px';box.style.maxHeight=Math.max(200,up?above:below)+'px';
  if(up){box.style.top='';box.style.bottom=(H-r.top/z+6)+'px'}else{box.style.bottom='';box.style.top=(r.bottom/z+6)+'px'}}
function tpkShell(inner){const i=TPK.inp,el=document.createElement('div');el.id='tpk';el.className='rpk tpk'+(MOB.matches?' mob':'');
  const f=i.closest('.field,label,.row'),l=f&&f.querySelector('label');const lab=i.getAttribute('aria-label')||i.title||(l&&!l.contains(i)?l.textContent.trim():'');
  el.innerHTML=`<div class="rpkbox">${MOB.matches?`<div class="rpkgrab"></div>${lab?`<div class="rpkh">${esc(lab)}</div>`:''}`:''}${inner}</div>`;
  document.body.appendChild(el);TPK.el=el;
  el.addEventListener('click',e=>{if(!e.target.closest('.rpkbox'))tpkClose()});
  if(MOB.matches){const box=el.querySelector('.rpkbox');let y0=null,dy=0;
    box.addEventListener('touchstart',e=>{y0=e.target.closest('.rpkgrab,.rpkh,.tpkd')?e.touches[0].clientY:null;dy=0},{passive:true});
    box.addEventListener('touchmove',e=>{if(y0==null)return;dy=e.touches[0].clientY-y0;if(dy>0){box.style.transform=`translateY(${dy/uiZoom()}px)`;box.style.transition='none'}},{passive:true});
    box.addEventListener('touchend',()=>{if(y0==null)return;box.style.transition='';if(dy>90)tpkClose();else box.style.transform='';y0=null},{passive:true})}
  return el}
/* ---- time ---- */
function tpkTime(){const i=TPK.inp,[h,m]=(i.value||'').split(':').map(x=>+x);const has=/^\d\d:\d\d/.test(i.value||'');
  const col=(n,cur,k)=>`<div class="tpkc" data-k="${k}">${Array.from({length:n},(_,x)=>`<button type="button" class="tpki${has&&x===cur?' on':''}" data-v="${x}">${tpkPad(x)}</button>`).join('')}</div>`;
  const el=tpkShell(`<div class="tpkd" dir="ltr"><b>${has?tpkPad(h):'--'}</b>:<b>${has?tpkPad(m):'--'}</b></div><div class="tpkcols" dir="ltr">${col(24,h,'h')}${col(60,m,'m')}</div>
    <div class="tpka"><button type="button" class="btn ghost" data-a="now">${esc(t('tpk.now'))}</button>${i.required?'':`<button type="button" class="btn ghost" data-a="clr">${esc(t('tpk.clr'))}</button>`}<button type="button" class="btn pri" data-a="ok">${esc(t('tpk.ok'))}</button></div>`);
  const paint=()=>{const v=i.value||'',ok=/^\d\d:\d\d/.test(v),[a,b]=v.split(':').map(x=>+x);const d=el.querySelectorAll('.tpkd b');d[0].textContent=ok?tpkPad(a):'--';d[1].textContent=ok?tpkPad(b):'--';
    el.querySelectorAll('.tpkc').forEach(c=>{const cur=c.dataset.k==='h'?a:b;c.querySelectorAll('.tpki').forEach(x=>x.classList.toggle('on',ok&&+x.dataset.v===cur))})};
  el.addEventListener('click',e=>{const b=e.target.closest('.tpki');if(b){const k=b.closest('.tpkc').dataset.k,v=+b.dataset.v,[a0,b0]=(i.value||'').split(':').map(x=>+x);
      const ok=/^\d\d:\d\d/.test(i.value||'');let hh=ok?a0:(k==='h'?v:new Date().getHours()),mm=ok?b0:0;if(k==='h')hh=v;else mm=v;tpkSet(tpkPad(hh)+':'+tpkPad(mm));paint();tpkScroll(true);return}
    const a=e.target.closest('[data-a]');if(!a)return;const x=a.dataset.a;
    if(x==='now'){const d=new Date();tpkSet(tpkPad(d.getHours())+':'+tpkPad(d.getMinutes()));paint();tpkScroll(true)}
    else if(x==='clr'){tpkSet('');tpkClose()}else tpkClose()});
  tpkPlace();tpkScroll(false)}
function tpkScroll(smooth){TPK.el&&TPK.el.querySelectorAll('.tpkc').forEach(c=>{const b=c.querySelector('.tpki.on')||c.querySelector(c.dataset.k==='h'?`.tpki[data-v="${new Date().getHours()}"]`:'.tpki');
  if(b)c.scrollTo({top:b.offsetTop-c.clientHeight/2+b.offsetHeight/2,behavior:smooth?'smooth':'auto'})})}
/* ---- date ---- */
function tpkDate(){const i=TPK.inp;const v=/^\d{4}-\d\d-\d\d$/.test(i.value)?i.value:todayKey();TPK.ym=v.slice(0,7);const rtl=document.documentElement.dir==='rtl';
  const el=tpkShell(`<div class="dpkh"><button type="button" class="dpkn" data-a="prev" aria-label="${esc(t('tpk.prev'))}">${rtl?'›':'‹'}</button><b class="dpkt"></b><button type="button" class="dpkn" data-a="next" aria-label="${esc(t('tpk.next'))}">${rtl?'‹':'›'}</button></div><div class="dpkg"></div>
    <div class="tpka"><button type="button" class="btn ghost" data-a="today">${esc(t('tpk.today'))}</button>${i.required?'':`<button type="button" class="btn ghost" data-a="clr">${esc(t('tpk.clr'))}</button>`}</div>`);
  el.addEventListener('click',e=>{const d=e.target.closest('.dpkd');if(d&&!d.disabled){tpkSet(d.dataset.k);tpkClose();return}
    const a=e.target.closest('[data-a]');if(!a)return;const x=a.dataset.a;
    if(x==='prev'||x==='next'){const [y,m]=TPK.ym.split('-').map(Number);const dt=new Date(y,m-1+(x==='next'?1:-1),1);TPK.ym=dt.getFullYear()+'-'+tpkPad(dt.getMonth()+1);tpkDPaint()}
    else if(x==='today'){tpkSet(todayKey());tpkClose()}else if(x==='clr'){tpkSet('');tpkClose()}});
  tpkDPaint();tpkPlace()}
function tpkDPaint(){const el=TPK.el,i=TPK.inp;if(!el)return;const [y,m]=TPK.ym.split('-').map(Number),Lc=L();
  el.querySelector('.dpkt').textContent=Lc.months[m-1]+' '+y;
  const first=new Date(y,m-1,1),off=(first.getDay()+6)%7,n=new Date(y,m,0).getDate(),tk=todayKey(),mn=i.min||'',mx=i.max||'';
  let h=[1,2,3,4,5,6,0].map(d=>`<span class="dpkw">${esc(Lc.sdays[d])}</span>`).join('')+'<i></i>'.repeat(off);
  for(let d=1;d<=n;d++){const k=y+'-'+tpkPad(m)+'-'+tpkPad(d);let hd='';try{hd=hNum(new Date(y,m-1,d,12)).d}catch(e){}
    const dis=(mn&&k<mn)||(mx&&k>mx);h+=`<button type="button" class="dpkd${k===i.value?' on':''}${k===tk?' td':''}" data-k="${k}"${dis?' disabled':''}><b>${d}</b><small>${hd||''}</small></button>`}
  el.querySelector('.dpkg').innerHTML=h;tpkPlace()}
function tpkOpen(i){if(TPK.el)tpkClose();if(window.RPK&&RPK.el)rpkClose();TPK.inp=i;TPK.v0=i.value;if(i.type==='time')tpkTime();else tpkDate()}
/* open on tap / click; the browser's own picker never opens */
document.addEventListener('touchend',e=>{const i=e.target.closest&&e.target.closest('input');if(tpkSkip(i))return;e.preventDefault();TPK.lastT=Date.now();tpkOpen(i)},{capture:true,passive:false});
document.addEventListener('click',e=>{const i=e.target.closest&&e.target.closest('input');if(tpkSkip(i))return;
  if(Date.now()-TPK.lastT<700){e.preventDefault();return}e.preventDefault();if(TPK.inp!==i)tpkOpen(i)},true);
document.addEventListener('pointerdown',e=>{if(TPK.el&&!e.target.closest('#tpk')&&e.target!==TPK.inp)tpkClose()},true);
document.addEventListener('keydown',e=>{const i=e.target;
  if(TPK.el&&e.key==='Escape'){e.preventDefault();e.stopPropagation();tpkClose();return}
  if(tpkSkip(i))return;
  if((e.altKey&&e.key==='ArrowDown')||e.key==='F4'||(i.type==='date'&&e.key===' ')){e.preventDefault();e.stopPropagation();tpkOpen(i);return}
  if(TPK.el&&TPK.inp===i&&/^[0-9]$|^Backspace$|^Delete$/.test(e.key))tpkClose()},true);
addEventListener('resize',()=>{if(TPK.el&&!MOB.matches)tpkClose()});
document.addEventListener('scroll',e=>{if(TPK.el&&!MOB.matches&&!(e.target&&e.target.closest&&e.target.closest('#tpk')))tpkPlace()},true);

