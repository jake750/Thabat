/* ============ v3.180.0 the colour picker (his report 2026-11-22 «الشكل قبيح جدا هنا لما اجي اضيف فئه جديده») ============ */
/* Every <input type=color> (category colours, accent, water, theme editor…) opened the system chooser: on Android a grey dialog with
   eight pure colours and RGB sliders. A tap on any of them now opens the app's own small picker (the usual #ppPop menu, so it closes
   on an outside tap, Esc and the back button): 18 calm colours that sit well on the dark and light looks, then a shade square,
   a hue strip and the hex code. Colours apply live ('input' events, at most one per 50 ms); 'change' fires once when it closes. */
const CPK_SW=['#e5534b','#f0883e','#e3b341','#a8c256','#57ab5a','#2f9e7a','#39c5bb','#4fa8e8','#7dcfff','#6c8cf5','#8e7bef','#c76fd6','#e06c9f','#9b3d5b','#b0875c','#c9a227','#8b95a5','#dfe3ea'];
let CPK=null;
function cpkHex(h){h=String(h||'').trim().toLowerCase();if(/^#?[0-9a-f]{3}$/.test(h))h=h.replace('#','').split('').map(c=>c+c).join('');h=h.replace('#','');return /^[0-9a-f]{6}$/.test(h)?'#'+h:null}
function cpkToHsv(hex){const n=parseInt(hex.slice(1),16),r=(n>>16&255)/255,g=(n>>8&255)/255,b=(n&255)/255,mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn;
  let h=0;if(d){h=mx===r?((g-b)/d)%6:mx===g?(b-r)/d+2:(r-g)/d+4;h*=60;if(h<0)h+=360}return{h,s:mx?d/mx:0,v:mx}}
function cpkFromHsv(h,s,v){const f=k=>{const x=(k+h/60)%6;return v-v*s*Math.max(0,Math.min(x,4-x,1))};return'#'+[f(5),f(3),f(1)].map(x=>Math.round(x*255).toString(16).padStart(2,'0')).join('')}
function cpkSend(type){const c=CPK;if(!c||!c.inp)return;c.inp.value=c.hex;c.inp.dispatchEvent(new Event(type,{bubbles:true}))}
function cpkPaint(from){const c=CPK;if(!c)return;const p=c.p,{h,s,v}=c.hsv;
  p.style.setProperty('--cpkh',`hsl(${h} 100% 50%)`);p.style.setProperty('--cpkc',c.hex);
  const sv=p.querySelector('.cpksv'),hu=p.querySelector('.cpkhue');
  sv.querySelector('i').style.cssText=`left:${s*100}%;top:${(1-v)*100}%`;hu.querySelector('i').style.left=(h/360*100)+'%';
  if(from!=='hex'){const x=p.querySelector('.cpkhex');if(x)x.value=c.hex.slice(1).toUpperCase()}
  p.querySelectorAll('.cpksw button').forEach(b=>b.classList.toggle('on',b.dataset.c===c.hex));
  if(from!=='init'&&!c.tm)c.tm=setTimeout(()=>{if(CPK)CPK.tm=0;cpkSend('input')},50)}
function cpkSet(hex,from){const c=CPK;if(!c)return;c.hex=hex;c.hsv=cpkToHsv(hex);cpkPaint(from)}
function cpkDrag(el,fn){el.addEventListener('pointerdown',e=>{e.preventDefault();try{el.setPointerCapture(e.pointerId)}catch(_){}
  const at=ev=>{const r=el.getBoundingClientRect();fn(Math.max(0,Math.min(1,(ev.clientX-r.left)/r.width)),Math.max(0,Math.min(1,(ev.clientY-r.top)/r.height)))};
  at(e);const mv=ev=>at(ev),up=()=>{el.removeEventListener('pointermove',mv);el.removeEventListener('pointerup',up);el.removeEventListener('pointercancel',up)};
  el.addEventListener('pointermove',mv);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up)})}
function cpkOpen(inp){closePP();const start=cpkHex(inp.value)||'#7dcfff';
  const p=document.createElement('div');p.className='pppop cpk';p.id='ppPop';p.setAttribute('role','dialog');
  p.innerHTML=`<div class="cpksw">${CPK_SW.map(c=>`<button type="button" data-c="${c}" style="--c:${c}" aria-label="${c}"></button>`).join('')}</div>
   <div class="cpkcu" dir="ltr"><div class="cpksv"><i></i></div><div class="cpkhue"><i></i></div></div>
   <div class="cpkft"><span class="cpkcur"></span><label class="cpkhx" dir="ltr"><b>#</b><input class="cpkhex" maxlength="6" spellcheck="false" autocomplete="off" inputmode="text" aria-label="hex"></label><button type="button" class="btn sm pri cpkok">${esc(t('cpk.done'))}</button></div>`;
  document.body.append(p);CPK={inp,p,hex:start,hsv:cpkToHsv(start),start,tm:0};
  const z=typeof uiZoom==='function'?uiZoom():1,r=inp.getBoundingClientRect(),W=innerWidth/z,H=innerHeight/z,w=p.offsetWidth,h=p.offsetHeight;
  let x,y;if(!r.width&&!r.height){x=(W-w)/2;y=(H-h)/2}else{const L=r.left/z,R=r.right/z,T=r.top/z,B=r.bottom/z;x=document.documentElement.dir==='rtl'?R-w:L;y=B+8;if(y+h>H-8)y=T-h-8;if(y<8)y=Math.max(8,(H-h)/2)}
  x=Math.max(8,Math.min(W-w-8,x));p.style.left=x+'px';p.style.top=y+'px';
  p.querySelectorAll('.cpksw button').forEach(b=>b.onclick=()=>cpkSet(b.dataset.c));
  cpkDrag(p.querySelector('.cpksv'),(fx,fy)=>{const c=CPK;if(!c)return;c.hsv={h:c.hsv.h,s:fx,v:1-fy};c.hex=cpkFromHsv(c.hsv.h,fx,1-fy);cpkPaint()});
  cpkDrag(p.querySelector('.cpkhue'),fx=>{const c=CPK;if(!c)return;const h=Math.min(359.9,fx*360);c.hsv={...c.hsv,h};if(c.hsv.s<.05&&c.hsv.v>.95)c.hsv.s=.6;if(c.hsv.v<.2)c.hsv.v=.75;c.hex=cpkFromHsv(h,c.hsv.s,c.hsv.v);cpkPaint()});
  const hx=p.querySelector('.cpkhex');hx.oninput=()=>{const v=cpkHex(hx.value);if(v){CPK.hex=v;CPK.hsv=cpkToHsv(v);cpkPaint('hex')}};
  hx.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();closePP()}};
  p.querySelector('.cpkok').onclick=()=>closePP();
  cpkPaint('init');
  setTimeout(()=>{document.addEventListener('mousedown',ppOut,true);document.addEventListener('keydown',cpkKey,true)},0)}
function cpkKey(e){if(e.key==='Escape'&&CPK){e.preventDefault();e.stopPropagation();closePP()}}
hookFn('closePP',()=>closePP,f=>{closePP=f},'pre',function(){const c=CPK;if(!c)return;CPK=null;document.removeEventListener('keydown',cpkKey,true);
  clearTimeout(c.tm);if(c.hex!==c.start&&c.inp){c.inp.value=c.hex;c.inp.dispatchEvent(new Event('input',{bubbles:true}));c.inp.dispatchEvent(new Event('change',{bubbles:true}))}});
document.addEventListener('click',e=>{const inp=e.target&&e.target.closest&&e.target.closest('input[type=color]');if(!inp||inp.disabled)return;
  e.preventDefault();if(CPK&&CPK.inp===inp){closePP();return}cpkOpen(inp)},true);
