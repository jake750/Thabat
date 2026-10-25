/* ============ v3.125.1 (g146): every <select> opens Thabat's own list instead of the browser's ============ */
/* The closed select stays a real <select> (value, change events, keyboard arrows); a click, a tap, Enter, Space or Alt+↓ opens #rpk:
   a dropdown under the field on PC, a bottom sheet on phones, with group headings, a search box for long lists and ✓ on the current item.
   Choosing sets the value and fires input + change. data-native on a select (or S.settings.nativeSel) keeps the browser's list. */
const RPK={sel:null,el:null,items:[],act:-1,lastT:0};
function rpkSkip(s){return !s||s.tagName!=='SELECT'||s.multiple||(s.size>1)||s.disabled||s.dataset.native!=null||(window.S&&S.settings&&S.settings.nativeSel)}
function rpkLabel(s){const a=s.getAttribute('aria-label')||s.title;if(a)return a;
  const f=s.closest('.field,label,.row');const l=f&&f.querySelector('label');return l&&!l.contains(s)?l.textContent.trim():''}
function rpkSplit(s,txt){/* the riwaya lists: «قالون» big, «عن نافع المدني» under it */
  if(!/^qRiw/.test(s.id||''))return [txt,''];const m=txt.match(/^(.+?) (عن|from|ʿan) (.+)$/);return m?[m[1],m[2]+' '+m[3]]:[txt,'']}
function rpkBuild(s){const out=[];let grp=null;
  const add=(o,g)=>{if(o.hidden)return;out.push({o,g,txt:(o.textContent||'').trim()})};
  [...s.children].forEach(c=>{if(c.tagName==='OPTGROUP'){grp={lab:c.label||''};const os=[...c.children].filter(o=>o.tagName==='OPTION');
      /* a common « · X» suffix inside a group repeats its heading: drop it */
      const suf=os.length>1&&os.every(o=>/ · [^·]+$/.test(o.textContent))?os[0].textContent.match(/ · [^·]+$/)[0]:'';
      os.forEach(o=>{add(o,grp);const it=out[out.length-1];if(it&&it.o===o&&suf&&os.every(x=>x.textContent.endsWith(suf)))it.txt=it.txt.slice(0,-suf.length)})}
    else if(c.tagName==='OPTION')add(c,null)});
  return out}
function rpkClose(){if(!RPK.el)return;const s=RPK.sel;RPK.el.remove();RPK.el=null;RPK.sel=null;RPK.items=[];document.documentElement.classList.remove('rpkon');try{s&&s.focus({preventScroll:true})}catch(e){}}
function rpkPick(i){const it=RPK.items[i];if(!it||it.o.disabled)return;const s=RPK.sel;rpkClose();
  if(s.value!==it.o.value){s.value=it.o.value;s.dispatchEvent(new Event('input',{bubbles:true}));s.dispatchEvent(new Event('change',{bubbles:true}))}}
function rpkPaint(q){const box=RPK.el.querySelector('.rpkl');const n=q?lshNorm(q):'';let h='',last=null,first=-1;
  RPK.items.forEach((it,i)=>{if(n&&!lshNorm(it.txt+' '+(it.g?it.g.lab:'')).includes(n))return;
    if(it.g!==last){last=it.g;if(it.g&&it.g.lab)h+=`<div class="rpkg">${esc(it.g.lab)}</div>`}
    if(first<0&&!it.o.disabled)first=i;const [a,b]=rpkSplit(RPK.sel,it.txt);const on=it.o.selected;
    h+=`<button type="button" class="rpki${on?' on':''}" data-i="${i}" role="option" aria-selected="${on}"${it.o.disabled?' disabled':''}><span class="rpkt"><b>${esc(a)}</b>${b?`<small>${esc(b)}</small>`:''}</span>${on?'<i class="rpkc">✓</i>':''}</button>`});
  box.innerHTML=h||`<div class="rpke">${esc(t('rpk.none'))}</div>`;
  const cur=box.querySelector('.rpki.on');RPK.act=n?first:(cur?+cur.dataset.i:first);rpkAct(false);if(!n&&cur)cur.scrollIntoView({block:'center'})}
function rpkAct(scroll){RPK.el.querySelectorAll('.rpki.act').forEach(b=>b.classList.remove('act'));const b=RPK.el.querySelector(`.rpki[data-i="${RPK.act}"]`);if(b){b.classList.add('act');if(scroll)b.scrollIntoView({block:'nearest'})}}
function rpkMove(d){const bs=[...RPK.el.querySelectorAll('.rpki:not([disabled])')];if(!bs.length)return;let k=bs.findIndex(b=>+b.dataset.i===RPK.act);k=k<0?0:Math.max(0,Math.min(bs.length-1,k+d));RPK.act=+bs[k].dataset.i;rpkAct(true)}
function rpkPlace(){const el=RPK.el,s=RPK.sel;if(!el||!s)return;const box=el.querySelector('.rpkbox');
  if(MOB.matches){box.style.cssText='';return}
  const z=uiZoom(),r=s.getBoundingClientRect(),W=innerWidth/z,H=innerHeight/z;
  const w=Math.min(W-16,Math.max(r.width/z,240,Math.min(380,box.scrollWidth)));box.style.width=w+'px';
  let left=document.documentElement.dir==='rtl'?r.right/z-w:r.left/z;left=Math.max(8,Math.min(W-w-8,left));
  const below=H-r.bottom/z-14,above=r.top/z-14,up=below<240&&above>below;
  box.style.left=left+'px';box.style.maxHeight=Math.min(520,up?above:below)+'px';
  if(up){box.style.top='';box.style.bottom=(H-r.top/z+6)+'px'}else{box.style.bottom='';box.style.top=(r.bottom/z+6)+'px'}}
function rpkOpen(s){if(RPK.el)rpkClose();RPK.sel=s;RPK.items=rpkBuild(s);if(!RPK.items.length){RPK.sel=null;return}
  const lab=rpkLabel(s),many=RPK.items.length>=12;
  const el=document.createElement('div');el.id='rpk';el.className='rpk'+(MOB.matches?' mob':'');
  el.innerHTML=`<div class="rpkbox" role="listbox" aria-label="${esc(lab)}">${MOB.matches?`<div class="rpkgrab"></div>${lab?`<div class="rpkh">${esc(lab)}</div>`:''}`:''}${many?`<input class="rpks" type="search" placeholder="${esc(t('rpk.q'))}" aria-label="${esc(t('rpk.q'))}">`:''}<div class="rpkl"></div></div>`;
  document.body.appendChild(el);RPK.el=el;document.documentElement.classList.add('rpkon');
  rpkPaint('');rpkPlace();
  el.addEventListener('click',e=>{const b=e.target.closest('.rpki');if(b){rpkPick(+b.dataset.i);return}if(!e.target.closest('.rpkbox'))rpkClose()});
  el.addEventListener('pointermove',e=>{const b=e.target.closest('.rpki:not([disabled])');if(b&&+b.dataset.i!==RPK.act){RPK.act=+b.dataset.i;rpkAct(false)}});
  const q=el.querySelector('.rpks');if(q){q.oninput=()=>rpkPaint(q.value.trim());if(!MOB.matches)setTimeout(()=>q.focus({preventScroll:true}),0)}
  /* phones: drag the sheet down to close it */
  if(MOB.matches){const box=el.querySelector('.rpkbox'),l=el.querySelector('.rpkl');let y0=null,dy=0;
    box.addEventListener('touchstart',e=>{if(e.target.closest('.rpks'))return;y0=(l.scrollTop<=0||e.target.closest('.rpkgrab,.rpkh'))?e.touches[0].clientY:null;dy=0},{passive:true});
    box.addEventListener('touchmove',e=>{if(y0==null)return;dy=e.touches[0].clientY-y0;if(dy>0){box.style.transform=`translateY(${dy/uiZoom()}px)`;box.style.transition='none'}},{passive:true});
    box.addEventListener('touchend',()=>{if(y0==null)return;box.style.transition='';if(dy>90)rpkClose();else box.style.transform='';y0=null},{passive:true})}}
/* open on click / tap instead of the browser's list */
document.addEventListener('mousedown',e=>{const s=e.target.closest&&e.target.closest('select');if(rpkSkip(s)||e.button!==0)return;e.preventDefault();
  if(Date.now()-RPK.lastT<700)return;RPK.lastT=Date.now();if(RPK.sel===s){rpkClose();return}rpkOpen(s)},true);
document.addEventListener('touchend',e=>{const s=e.target.closest&&e.target.closest('select');if(rpkSkip(s))return;e.preventDefault();RPK.lastT=Date.now();rpkOpen(s)},{capture:true,passive:false});
document.addEventListener('click',e=>{const s=e.target.closest&&e.target.closest('select');if(!rpkSkip(s))e.preventDefault()},true);
document.addEventListener('keydown',e=>{
  if(RPK.el){const k=e.key;
    if(k==='Escape'){e.preventDefault();e.stopPropagation();rpkClose();return}
    if(k==='ArrowDown'||k==='ArrowUp'){e.preventDefault();e.stopPropagation();rpkMove(k==='ArrowDown'?1:-1);return}
    if(k==='Enter'){e.preventDefault();e.stopPropagation();rpkPick(RPK.act);return}
    if(k==='Tab'){rpkClose();return}
    return}
  const s=e.target;if(rpkSkip(s))return;
  if(e.key==='Enter'||e.key===' '||(e.altKey&&(e.key==='ArrowDown'||e.key==='ArrowUp'))||e.key==='F4'){e.preventDefault();e.stopPropagation();rpkOpen(s)}},true);
addEventListener('resize',()=>{if(RPK.el&&!MOB.matches)rpkClose()});
document.addEventListener('scroll',e=>{if(RPK.el&&!MOB.matches&&!(e.target&&e.target.closest&&e.target.closest('.rpk')))rpkPlace()},true);
