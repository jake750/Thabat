/* ============ 3.135 twelfth list F (library): the book cover in the «تابع» widget, books in your own order, named bookmarks,
   courses filtered by the time left to finish them, a skip length you choose instead of 10 seconds ============ */
/* 12th-71: the «تابع» widget shows the book's cover (a 160-px JPEG from IDB bcov:<key>) beside its page; shell 45 draws it (older shells ignore «img») */
const CONTC={};
async function contCov(key){if(key in CONTC)return CONTC[key];let out='';try{const u=await idbGet('bcov:'+key);if(u){const im=new Image();await new Promise((ok,no)=>{im.onload=ok;im.onerror=no;im.src=typeof u==='string'?u:URL.createObjectURL(u)});
  const k=Math.min(1,160/Math.max(im.naturalWidth,im.naturalHeight)),c=document.createElement('canvas');c.width=Math.round(im.naturalWidth*k);c.height=Math.round(im.naturalHeight*k);c.getContext('2d').drawImage(im,0,0,c.width,c.height);out=c.toDataURL('image/jpeg',.72).split(',')[1]||''}}catch(e){}CONTC[key]=out;return out}
{const _cp=contPush;contPush=function(...a){try{if(!ANDROID||andV()<12)return _cp(...a);const c=contItem();if(!c||c.k!=='book')return _cp(...a);
  contCov(c.id).then(img=>{try{const o={lbl:t('cont.book'),title:c.title,sub:c.sub,pct:c.pct,img},js=JSON.stringify(o);if(js===CONT.last)return;CONT.last=js;window.ThabatAndroid.contWidget(js)}catch(e){}})}catch(e){return _cp(...a)}}}

/* 12th-72: books in your own order — S.lib.bkOrd=[keys]; while the library is in «⇅ ترتيب» the book cards get ‹ › (or ↑ ↓) and the whole shelf shows */
const BKO={on:0};
{const _b=BKS;BKS=function(...a){const r=_b(...a);if(!BKO.on)return r;const O=LIBS().bkOrd;if(!O||!O.length)return r;const c={},N=O.length;for(const k in r)c[k]=r[k];O.forEach((k,i)=>{c[k]=Object.assign({},r[k]||{},{at:1e15+(N-i)})});return c}}
{const _h=bkShelfHTML;bkShelfHTML=function(...a){BKO.on=1;try{return _h(...a)}finally{BKO.on=0}}}
function bkoMove(key,d){const L_=LIBS();if(!L_.bkOrd||!L_.bkOrd.length){const st=BKS(),at=k=>(st[k]||{}).at||0;L_.bkOrd=bkAll().map(b=>b.key).sort((x,y)=>(!!(st[x]||{}).done-!!(st[y]||{}).done)||at(y)-at(x))}
  const O=L_.bkOrd;if(!O.includes(key))O.push(key);const i=O.indexOf(key),j=Math.max(0,Math.min(O.length-1,i+d));if(i===j)return;O.splice(i,1);O.splice(j,0,key);save();renderLib()}
function bkoPaint(){const g=$('#libBox .bkgrid');if(!g)return;g.querySelectorAll('.bkom').forEach(x=>x.remove());if(!LORD.on)return;LIBX.allBooks=true;
  const one=getComputedStyle(g).gridTemplateColumns.split(' ').length<2,rtl=document.documentElement.dir==='rtl';
  g.querySelectorAll('[data-book]').forEach(c=>{if(c.closest('.bkgrp'))return;const k=c.dataset.book;c.insertAdjacentHTML('beforeend',`<span class="bkom"><button data-bko="-1" aria-label="${esc(t('bko.up'))}">${one?'↑':rtl?'›':'‹'}</button><button data-bko="1" aria-label="${esc(t('bko.down'))}">${one?'↓':rtl?'‹':'›'}</button></span>`);
    c.querySelectorAll('[data-bko]').forEach(b=>b.onclick=e=>{e.stopPropagation();e.preventDefault();bkoMove(k,+b.dataset.bko)})});
  const fs=$('#libBox .bk2fs');if(fs&&LIBS().bkOrd&&!fs.querySelector('#bkoRst')){fs.insertAdjacentHTML('beforeend',`<button class="bk2f" id="bkoRst">↺ ${esc(t('bko.auto'))}</button>`);$('#bkoRst').onclick=()=>{delete LIBS().bkOrd;save();renderLib()}}}
{hookFn('renderLib',()=>renderLib,f=>{renderLib=f},'post',function(){try{bkoPaint();lxdPaint();lxkPaint()}catch(e){console.error(e)}})}

/* 12th-73: named bookmarks — S.lib.bk[key].bmn={page:name}; adding one offers «سمِّها», the list shows the names with ✎ */
function bkmName(key,n){const r=BKS()[key];if(!r)return;const cur=(r.bmn||{})[n]||'',v=prompt(t('bkm.ask',n),cur);if(v===null)return;r.bmn=r.bmn||{};const s=v.trim().slice(0,60);if(s)r.bmn[n]=s;else delete r.bmn[n];save();try{bkTrack()}catch(e){}}
{hookFn('bkPanel',()=>bkPanel,f=>{bkPanel=f},'post',function(){try{const p=$('#bkPanel'),r=BKS()[BK.key];if(!p||p.hidden||!r)return;const N=r.bmn||{};
  p.querySelectorAll('.bkpi[data-go]').forEach(b=>{const n=+b.dataset.go;if(!r.bm.includes(n))return;const nm=N[n];if(nm)b.querySelector('b')?.insertAdjacentHTML('afterend',` <span class="bkmn" dir="auto">${esc(nm)}</span>`);
    const ed=document.createElement('span');ed.className='bkme';ed.setAttribute('role','button');ed.title=t('bkm.ren');ed.textContent='✎';ed.onclick=e=>{e.stopPropagation();bkmName(BK.key,n);p.hidden=true;bkPanel()};b.append(ed)})}catch(e){console.error(e)}})}
document.addEventListener('click',e=>{const b=e.target.closest('#bkBm');if(!b||!BK||!BK.key)return;setTimeout(()=>{const r=BKS()[BK.key],n=BK.cur;if(r&&r.bm.includes(n)&&!(r.bmn||{})[n])toastAct(t('bk.bmAdded',n),t('bkm.name'),()=>bkmName(BK.key,n))},0)});

/* 12th-74: courses by the time left to finish them (unwatched lessons' length minus what was watched) */
function lxLeft(c){const P=LIBS().prog||{},m=c.c?libMedia(c):lshMedia(c.id);let s=0,known=false;m.forEach(x=>{const d=ldurOf(x.id);if(!d)return;known=true;const p=P[x.id];if(p&&p.done)return;s+=Math.max(0,d-((p&&p.p)||0))});return known?s:-1}
{const _s=lshSort;lshSort=function(arr,prog,...a){const L_=LIBS(),f=L_.durF;if(!f||!/^r/.test(f))return _s(arr,prog,...a);L_.durF='all';let r;try{r=_s(arr,prog,...a)}finally{L_.durF=f}
  return r.filter(c=>{const s=lxLeft(c);if(s<0)return false;const h=s/3600;return f==='r1'?h>0&&h<1:f==='r5'?h>=1&&h<=5:h>5})}}
function lxdPaint(){const so=$('#lxDurF');if(!so||so.querySelector('[value="r1"]'))return;const g=document.createElement('optgroup');g.label=t('lxd.g');[['r1','lxd.r1'],['r5','lxd.r5'],['rl','lxd.rl']].forEach(([v,k])=>{const o=document.createElement('option');o.value=v;o.textContent=t(k);g.append(o)});so.append(g);so.value=LIBS().durF||'all'}

/* 12th-76: the skip length — S.lib.skip (5/10/15/30/60 s) for the buttons, J/L, the side double tap and ←/→ */
function lxSkip(){return+(LIBS().skip||10)}
function lxkBind(){const ov=$('#libPlayer');if(!ov)return;const v=$('#lvV'),C=c=>ov.querySelector(`[data-c="${c}"]`),n=lxSkip(),b=C('b10'),f=C('f10');if(!v||!b||!f)return;
  b.onclick=()=>{v.currentTime=Math.max(0,v.currentTime-n);lpvFlash('−'+n)};f.onclick=()=>{v.currentTime=Math.min(v.duration||1e9,v.currentTime+n);lpvFlash('+'+n)};
  b.title=`−${n} (J)`;b.setAttribute('aria-label','−'+n);f.title=`+${n} (L)`;f.setAttribute('aria-label','+'+n)}
function lxkPaint(){const fb=$('#lxfB');if(!fb)return;let b=$('#lxkB');if(!b){fb.insertAdjacentHTML('afterend','<button class="btn sm ghost" id="lxkB"></button>');b=$('#lxkB');b.onclick=e=>{const r=e.currentTarget.getBoundingClientRect(),z=uiZoom();
  const p=qPopAt(`<div class="aymh">${esc(t('lxk.t'))}</div>${[5,10,15,30,60].map(s=>`<button data-sk="${s}">${lxSkip()===s?'● ':''}${esc(t('lxk.s',s))}</button>`).join('')}`,r.left/z,r.bottom/z+4);
  p.querySelectorAll('[data-sk]').forEach(x=>x.onclick=ev=>{ev.stopPropagation();LIBS().skip=+x.dataset.sk;save();closePP();lxkBind();lxkPaint()})}}
  b.innerHTML=`⏩ <span>${esc(t('lxk.s',lxSkip()))}</span>`;b.title=t('lxk.t')}
{const _lp=libPlay;libPlay=function(...a){const r=_lp(...a);try{setTimeout(()=>{lxkBind();lxkPaint()},0)}catch(e){}return r}}
window.addEventListener('keydown',e=>{if(e.key!=='ArrowLeft'&&e.key!=='ArrowRight')return;const ov=$('#libPlayer'),v=$('#lvV');if(!ov||!ov.classList.contains('on')||!v||e.target===v||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)||e.ctrlKey||e.metaKey||e.altKey)return;
  if(lxSkip()===10)return;e.preventDefault();e.stopImmediatePropagation();const n=lxSkip(),back=e.key==='ArrowLeft';v.currentTime=back?Math.max(0,v.currentTime-n):Math.min(v.duration||1e9,v.currentTime+n);try{lpvFlash((back?'−':'+')+n);lpvWake()}catch(x){}},true);

