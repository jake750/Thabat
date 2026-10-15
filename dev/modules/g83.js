/* ============ v3.71.0 the phone (fourth list, group H: 119 121 122 126 128 129 131) ============ */
/* 131. Android: the status and navigation bars take the page's colour (shell 38, bridge 8) */
function barHex(c){try{const x=document.createElement('canvas').getContext('2d');x.fillStyle='#000';x.fillStyle=c;let v=x.fillStyle;if(/^rgba?\(/.test(v)){const m=v.match(/[\d.]+/g).map(Number);v='#'+[0,1,2].map(i=>Math.round(m[i]).toString(16).padStart(2,'0')).join('')}return v}catch(e){return'#0f1115'}}
function barLum(h){const n=parseInt(h.slice(1),16),r=(n>>16)&255,g=(n>>8)&255,b=n&255;return(.2126*r+.7152*g+.0722*b)/255}
function barPaint(){if(!ANDROID||andV()<8)return;try{const h=document.documentElement,cs=getComputedStyle(h);let top=cs.getPropertyValue('--bg').trim()||'#0f1115',bot=top;
  if(h.classList.contains('qfs'))top=bot='#000000';else if(curView()==='quran'){const sp=$('#spread .qpage,#spread .page,#mushaf');const bg=sp&&getComputedStyle(sp).backgroundColor;if(bg&&!/rgba\(0, 0, 0, 0\)|transparent/.test(bg))top=bg}
  if($('#bkReader.on')){const v=$('#bkV');const bg=v&&getComputedStyle(v).backgroundColor;if(bg&&!/rgba\(0, 0, 0, 0\)/.test(bg))top=bot=bg}
  const s=barHex(top),n=barHex(bot),key=s+n;if(barPaint.last===key)return;barPaint.last=key;window.ThabatAndroid.barColors(s,n,barLum(s)>.6)}catch(e){}}
if(ANDROID){{hookFn('applyTheme',()=>applyTheme,f=>{applyTheme=f},'post',function(){setTimeout(barPaint,60)})}
  {const _sv=showView;showView=function(...a){const r=_sv(...a);setTimeout(barPaint,80);return r}}
  new MutationObserver(()=>setTimeout(barPaint,60)).observe(document.documentElement,{attributes:true,attributeFilter:['class']});setTimeout(barPaint,1200)}

/* 121. phones: a field you type in scrolls above the keyboard */
{let tm=null;const keep=()=>{const a=document.activeElement;if(!a||!MOB.matches||!/INPUT|TEXTAREA|SELECT/.test(a.tagName)&&!a.isContentEditable)return;const vv=window.visualViewport;const r=a.getBoundingClientRect();const vh=vv?vv.height:innerHeight;
  if(r.bottom>vh-12||r.top<8)a.scrollIntoView({block:'center',behavior:'smooth'})};
  document.addEventListener('focusin',()=>{clearTimeout(tm);tm=setTimeout(keep,350)});if(window.visualViewport)visualViewport.addEventListener('resize',()=>{clearTimeout(tm);tm=setTimeout(keep,120)})}

/* 129. phones: a sheet scrolled to its top closes when dragged down from its content (not only from the handle) */
{let G=null;document.addEventListener('touchstart',e=>{G=null;if(!MOB.matches||e.touches.length!==1)return;const b=e.target.closest&&e.target.closest('.modal.uxsheet.on>.box');if(!b||e.target.closest('input,textarea,select,[contenteditable],.uxgrab,canvas,input[type=range]'))return;
    let s=e.target,sc=false;while(s&&s!==b){if(s.scrollHeight>s.clientHeight+2&&/(auto|scroll)/.test(getComputedStyle(s).overflowY)&&s.scrollTop>0){sc=true;break}s=s.parentElement}if(sc||b.scrollTop>0)return;G={b,y:e.touches[0].clientY,x:e.touches[0].clientX,dy:0}},{passive:true,capture:true});
  document.addEventListener('touchmove',e=>{if(!G)return;const p=e.touches[0],dy=p.clientY-G.y,dx=Math.abs(p.clientX-G.x);if(dx>40||dy<-10){G.b.style.transform='';G=null;return}G.dy=dy;if(dy>0&&G.b.scrollTop<=0){G.b.style.transition='none';G.b.style.transform=`translateY(${Math.min(dy,400)/(uiZoom()||1)}px)`}},{passive:true,capture:true});
  document.addEventListener('touchend',()=>{if(!G)return;const b=G.b,dy=G.dy;G=null;b.style.transition='transform .2s';if(dy>110){b.style.transform='';try{uxSheetClose(b.parentElement)}catch(e){b.parentElement.classList.remove('on')}}else b.style.transform='';setTimeout(()=>{b.style.transition=''},220)},{passive:true,capture:true})}

/* 126. phones: note cards show a small copy of their picture (made once, kept on the device) */
const NTH=new Map();
async function nthOf(src){if(NTH.has(src))return NTH.get(src);const key='nth:'+bkHash(src.length+'|'+src.slice(-200));let v=null;try{v=await idbGet(key)}catch(e){}
  if(!v){v=await new Promise(res=>{const im=new Image();im.onload=()=>{try{const W=360,sc=Math.min(1,W/im.naturalWidth),c=document.createElement('canvas');c.width=Math.max(1,Math.round(im.naturalWidth*sc));c.height=Math.max(1,Math.round(im.naturalHeight*sc));c.getContext('2d').drawImage(im,0,0,c.width,c.height);res(c.toDataURL('image/jpeg',.72))}catch(e){res(null)}};im.onerror=()=>res(null);im.src=src});if(v)try{idbSet(key,v)}catch(e){}}
  if(v)NTH.set(src,v);return v}
function nthPaint(){if(!MOB.matches)return;$$('.ncard img').forEach(async img=>{const s=img.getAttribute('src')||'';if(!s.startsWith('data:image')||s.length<60000||img.dataset.nth)return;img.dataset.nth='1';const v=await nthOf(s);if(v&&img.isConnected)img.src=v})}
{hookFn('renderNotes',()=>renderNotes,f=>{renderNotes=f},'post',function(){setTimeout(nthPaint,30)})}

/* 128. phones: a visible «back» inside a notes folder (the library and settings already have one) */
{hookFn('renderNotes',()=>renderNotes,f=>{renderNotes=f},'post',function(){try{const bar=$('#nfBar');if(!bar)return;let b=bar.querySelector('#nfBack');const inF=typeof NF!=='undefined'&&(NF.cur||NF.arc);if(!inF){if(b)b.remove();return}
  if(!b){b=document.createElement('button');b.type='button';b.id='nfBack';b.className='btn sm ghost nfback';bar.prepend(b)}b.textContent=(document.documentElement.dir==='rtl'?'› ':'‹ ')+t('ph.back');b.onclick=()=>nfGo(NF.arc?null:((nfGet(NF.cur)||{}).parent||null))}catch(e){}})}

/* 119. phones: the save / cancel buttons of a sheet stay at the bottom, within the thumb's reach */
function thumbBars(){if(!MOB.matches)return;$$('.modal.on>.box').forEach(b=>{const rows=[...b.querySelectorAll(':scope .evact,:scope .lkact,:scope>.row:last-child,:scope .infob>.row:last-child')].filter(r=>r.querySelector('.btn.pri,.btn:not(.ghost)'));rows.forEach(r=>r.classList.add('thumbbar'))})}
new MutationObserver(ms=>{if(MOB.matches&&ms.some(m=>m.target.classList&&m.target.classList.contains('modal')))setTimeout(thumbBars,40)}).observe(document.body,{attributes:true,subtree:true,attributeFilter:['class']});
