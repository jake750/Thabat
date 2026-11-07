/* ============ v3.173.0 his request 2026-11-07: Apple-style motion everywhere («butter smooth») ============ */
/* With the CSS part: (1) every older transition and animation in the app is retimed once to Apple's springs
   (apmRetime walks the style sheets: no overshoot, decelerating curves, exits shorter than entrances, «all» narrowed to cheap properties);
   (2) JS animations without a curve (they ran linear) get the spring; (3) windows and menus grow from the point you tapped;
   (4) task and note lists slide rows to their new place, new rows fade in, removed rows fade where they were;
   (5) the month in the calendar slides the way you went; (6) the picture viewer grows out of the tapped picture and back.
   «أقل حركة» (html.rmotion) is left as it was: plain fades. */
const APM={pt:null,fl:{},seen:new WeakSet(),cal:null,na:Element.prototype.animate};
const apmRM=()=>document.documentElement.classList.contains('rmotion');
function apmCurve(n){return(getComputedStyle(document.documentElement).getPropertyValue('--apm-'+n)||'').trim()||'cubic-bezier(.22,1,.36,1)'}
function apmAnim(el,kf,o){try{return APM.na.call(el,kf,Object.assign({easing:APM.sm||apmCurve('smooth')},o))}catch(e){try{return APM.na.call(el,kf,{duration:o.duration,fill:o.fill})}catch(x){}}}

/* (1) retime the style sheets */
const APM_KEEP=/\.bworld|\.ih-|html\.rmotion|\.lpvtl|\.lpvbuf|\.lpvplayed/;      /* the board camera, icon hovers, «less motion» rules, the player timeline */
const APM_BOUNCY={starpop:1,lay:1};                                        /* celebrations only (a star on the goal, a brick laid) */
const APM_ALL='transform,opacity,background-color,border-color,color,box-shadow,filter,fill,stroke,outline-color,width,height';
function apmSec(s){s=String(s).trim();return s.endsWith('ms')?parseFloat(s)/1000:parseFloat(s)||0}
function apmList(v){const o=[];let d=0,cur='';for(const ch of String(v)){if(ch==='(')d++;else if(ch===')')d--;if(ch===','&&!d){o.push(cur.trim());cur=''}else cur+=ch}if(cur.trim())o.push(cur.trim());return o}
function apmPick(tf,dur,exit){                                             /* → [curve, seconds] or null to keep */
  if(!tf||/^(linear|steps|step-)/.test(tf)||/var\(|linear\(/.test(tf))return null;
  if(exit)return[APM.out,Math.min(dur,.24)];
  if(dur<=.2)return[APM.out,dur];
  return[APM.sm,Math.min(1.2,dur>.6?dur:dur*1.4)]}
function apmRetime(){if(!APM.sm)return;const kf={};
  const walkK=rules=>{for(const r of rules){if(r instanceof CSSKeyframesRule)kf[r.name]=r.cssRules.length;else if(r.cssRules&&!(r instanceof CSSStyleRule))try{walkK(r.cssRules)}catch(e){}}};
  const walk=rules=>{for(const r of rules){
    if(r instanceof CSSStyleRule){if(APM.seen.has(r))continue;APM.seen.add(r);const st=r.style,sel=r.selectorText||'';if(APM_KEEP.test(sel))continue;
      /* transitions */
      if(st.transitionProperty&&st.transitionDuration){let P=apmList(st.transitionProperty),D=apmList(st.transitionDuration),T=apmList(st.transitionTimingFunction||'ease'),Y=apmList(st.transitionDelay||'0s');
        const n=P.length,g=(a,i)=>a[i%a.length];let ch=false;const nd=[],nt=[],ny=[];let np=P.slice();
        if(n===1&&P[0]==='all'&&apmSec(D[0])<=.3&&!/::?(before|after)/.test(sel)){np=APM_ALL.split(',');ch=true}
        np.forEach((p,i)=>{const j=P.length===1?0:i,d=apmSec(g(D,j)),t=g(T,j),k=apmPick(t,d,false);ny.push(g(Y,j));if(k&&d>0){nt.push(k[0]);nd.push(k[1]+'s');ch=true}else{nt.push(t);nd.push(g(D,j))}});
        if(ch)try{st.transitionProperty=np.join(',');st.transitionDuration=nd.join(',');st.transitionTimingFunction=nt.join(',');st.transitionDelay=ny.join(',')}catch(e){}}
      /* animations */
      if(st.animationName&&st.animationName!=='none'&&st.animationDuration){const N=apmList(st.animationName),D=apmList(st.animationDuration),T=apmList(st.animationTimingFunction||'ease'),I=apmList(st.animationIterationCount||'1');
        let ch=false;const nd=[],nt=[];N.forEach((nm,i)=>{const d=apmSec(D[i%D.length]),t=T[i%T.length],it=I[i%I.length];
          let k=null;if(it==='1'&&d>0&&d<=1&&kf[nm]!=null&&(kf[nm]<=2||APM_BOUNCY[nm])&&!/^ih/.test(nm)){
            if(APM_BOUNCY[nm]&&!/var\(|linear\(/.test(t))k=[APM.bo,Math.max(d,.8)];
            else k=apmPick(t,d,/(out|o|down)$/.test(nm))}
          if(k){nt.push(k[0]);nd.push(k[1]+'s');ch=true}else{nt.push(t);nd.push(D[i%D.length])}});
        if(ch)try{st.animationDuration=nd.join(',');st.animationTimingFunction=nt.join(',')}catch(e){}}
    }else if(r.cssRules)try{walk(r.cssRules)}catch(e){}}};
  for(const s of document.styleSheets){try{walkK(s.cssRules)}catch(e){}}
  for(const s of document.styleSheets){try{walk(s.cssRules)}catch(e){}}}
function apmInit(){APM.sm=apmCurve('smooth');APM.out=apmCurve('out');APM.bo=apmCurve('bouncy');APM.sn=apmCurve('snappy');
  const go=()=>{const t0=performance.now();try{apmRetime()}catch(e){console.error(e)}APM.ms=Math.round(performance.now()-t0)};
  if(window.requestIdleCallback)requestIdleCallback(go,{timeout:1200});else setTimeout(go,300)}   /* after the first paint: start-up stays as fast as before (~50 ms of work) */
apmInit();
hookFn('applyTheme',()=>applyTheme,f=>{applyTheme=f},'post',function(){if(APM.ms!=null)try{apmRetime()}catch(e){}});   /* rules added later (look sheet, languages) */

/* (2) JS animations: a missing curve meant linear; the app's own UI curves become the spring (and a little longer, as a spring settles) */
{const UI=/^(ease|ease-out|ease-in-out|cubic-bezier\(\.2, ?\.[78], ?\.[23], ?1\))$/;
 Element.prototype.animate=function(kf,o){if(!apmRM()&&APM.sm){let p=typeof o==='number'?{duration:o}:o;
   if(p&&typeof p==='object'&&p.iterations!==Infinity){const d=+p.duration||0,e=p.easing;
     if(d>0&&d<=900&&(e==null||UI.test(String(e).replace(/0\./g,'.')))){const q=Object.assign({},p,{easing:APM.sm,duration:Math.round(d<=200?d*1.3:d*1.4)});try{return APM.na.call(this,kf,q)}catch(x){}}}}
   return APM.na.call(this,kf,o)}}

/* (3) windows and menus grow from where you tapped (keyboard: from the focused control) */
document.addEventListener('pointerdown',e=>{APM.pt={x:e.clientX,y:e.clientY,t:performance.now(),el:e.target}},true);
document.addEventListener('keydown',e=>{if(e.key!=='Enter'&&e.key!==' ')return;const a=document.activeElement;if(!a||a===document.body||/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)||a.isContentEditable)return;const r=a.getBoundingClientRect();APM.pt={x:r.left+r.width/2,y:r.top+r.height/2,t:performance.now()}},true);
function apmOrigin(el,lo,hi){if(!el||!el.style)return;const p=APM.pt;if(!p||performance.now()-p.t>1200){el.style.removeProperty('--apm-ox');el.style.removeProperty('--apm-oy');return}
  const r=el.getBoundingClientRect();if(!r.width||!r.height)return;const c=v=>Math.max(lo,Math.min(hi,v)).toFixed(1)+'%';
  el.style.setProperty('--apm-ox',c((p.x-r.left)/r.width*100));el.style.setProperty('--apm-oy',c((p.y-r.top)/r.height*100))}
{const mo=new MutationObserver(rs=>{for(const r of rs){const m=r.target;if(m.classList.contains('on')&&!/(^|\s)on(\s|$)/.test(r.oldValue||'')){const b=m.querySelector(':scope>.box');if(b)apmOrigin(b,-25,125)}}});
 const watch=el=>{if(el&&el.classList&&el.classList.contains('modal')&&!el._apmw){el._apmw=1;mo.observe(el,{attributes:true,attributeFilter:['class'],attributeOldValue:true})}};
 document.querySelectorAll('.modal').forEach(watch);
 const menu=el=>{if(!el||!el.classList)return;if(el.classList.contains('pppop')&&!el.classList.contains('ppout'))apmOrigin(el,0,100);
   else if(el.classList.contains('rpk')&&!el.classList.contains('mob')&&!el.classList.contains('fxout'))apmOrigin(el.querySelector('.rpkbox'),0,100)};
 new MutationObserver(rs=>{for(const r of rs)r.addedNodes.forEach(n=>{watch(n);menu(n)})}).observe(document.body,{childList:true})}
/* drop-downs that live inside the page (.qbpop, .lshmenu, board sub-menus): set when they become visible after a tap */
function apmMenus(){document.querySelectorAll('.qbpop,.lshmenu,.wbsmsub').forEach(el=>{const vis=el.getClientRects().length>0;if(vis&&!el._apmv){el._apmv=1;apmOrigin(el,0,100)}else if(!vis)el._apmv=0})}
document.addEventListener('click',()=>{queueMicrotask(apmMenus);setTimeout(apmMenus,40)});

/* (4) lists: rows slide to their new place, new rows fade in, removed rows fade out where they were */
function apmFlip(name,get,set,cont,item,key){
  hookFn(name,get,set,'pre',function(){APM.fl[name]=null;if(apmRM())return;const c=document.querySelector(cont);if(!c||!c.getClientRects().length)return;
    const els=c.querySelectorAll(item);if(!els.length||els.length>160)return;const m=new Map();
    els.forEach(el=>{const k=el.getAttribute(key);if(k&&!m.has(k)){const r=el.getBoundingClientRect();if(r.height)m.set(k,{r,el})}});APM.fl[name]={c,m,n0:m.size,cr:c.getBoundingClientRect()}});
  hookFn(name,get,set,'post',function(){const F=APM.fl[name];APM.fl[name]=null;if(!F)return;const c=document.querySelector(cont);if(!c||!c.getClientRects().length)return;
    const z=uiZoom()||1,vh=innerHeight,c0=c.getBoundingClientRect(),sx=c0.left-F.cr.left,sy=c0.top-F.cr.top;let fresh=0;   /* the list itself moving (a scroll bar appearing) is not a row moving */
    c.querySelectorAll(item).forEach(el=>{const k=el.getAttribute(key);if(!k)return;const r=el.getBoundingClientRect();if(!r.height)return;const o=F.m.get(k);
      if(o){F.m.delete(k);const dx=(o.r.left+sx-r.left)/z,dy=(o.r.top+sy-r.top)/z;if((Math.abs(dx)>1||Math.abs(dy)>1)&&(r.bottom>0&&r.top<vh||o.r.bottom>0&&o.r.top<vh)&&!el.getAnimations().length)
        apmAnim(el,[{transform:`translate(${dx}px,${dy}px)`},{transform:'none'}],{duration:560})}
      else if(F.n0&&fresh++<8&&r.top<vh)apmAnim(el,[{opacity:0,transform:'translateY(-6px) scale(.98)'},{opacity:1,transform:'none'}],{duration:520})});
    if(!F.m.size||F.m.size>6)return;const cr=c.getBoundingClientRect();if(getComputedStyle(c).position==='static')c.classList.add('apmrel');
    F.m.forEach(({r,el})=>{if(el.isConnected||r.bottom<0||r.top>vh)return;const g=el;g.removeAttribute('id');g.removeAttribute(key);g.querySelectorAll('[id],['+key+']').forEach(x=>{x.removeAttribute('id');x.removeAttribute(key)});
      g.classList.add('apmghost');g.setAttribute('aria-hidden','true');g.style.left=((r.left+sx-cr.left)/z-c.clientLeft+c.scrollLeft)+'px';g.style.top=((r.top+sy-cr.top)/z-c.clientTop+c.scrollTop)+'px';g.style.width=(r.width/z)+'px';g.style.height=(r.height/z)+'px';
      c.append(g);const a=APM.na.call(g,[{opacity:1,transform:'none'},{opacity:0,transform:'scale(.96)'}],{duration:220,easing:APM.out,fill:'forwards'});const rm=()=>g.remove();if(a&&a.finished)a.finished.then(rm,rm);setTimeout(rm,400)})})}
apmFlip('renderTasks',()=>renderTasks,f=>{renderTasks=f},'#tasks','#tasks>li[data-id]','data-id');
apmFlip('renderNotes',()=>renderNotes,f=>{renderNotes=f},'#notesGrid','#notesGrid .ncard[data-note]','data-note');

/* (5) the calendar month slides in from the side you went to (the sky moves with it, so stars stay on their gaps) */
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('#calPrev,#calNext');if(b)APM.cal={d:b.id==='calNext'?1:-1,t:performance.now()}},true);
hookFn('renderCal',()=>renderCal,f=>{renderCal=f},'post',function(){const D=APM.cal;APM.cal=null;if(!D||performance.now()-D.t>600||apmRM())return;
  const w=$('#calSkyWrap')||$('#cal');if(!w||!w.getClientRects().length)return;const x=D.d*(document.documentElement.dir==='rtl'?-1:1)*28;
  apmAnim(w,[{opacity:0,transform:`translateX(${x}px)`},{opacity:1,transform:'none'}],{duration:520})});

/* (6) the picture viewer opens out of the picture you tapped and closes back into it */
function apmLbSrc(){const p=APM.pt;if(!p||performance.now()-p.t>1500)return null;let el=p.el&&p.el.isConnected?p.el:document.elementFromPoint(p.x,p.y);if(!el||!el.querySelector)return null;
  let img=el.tagName==='IMG'?el:null;for(let i=0,x=el;!img&&x&&x!==document.body&&i<4;i++,x=x.parentElement)img=x.querySelector('img');
  if(!img||img.id==='lbImg'||!img.getClientRects().length)return null;return img}
{const _o=lbOpen;lbOpen=async function(...a){const lb=$('#lbox'),img=$('#lbImg'),src=apmRM()?null:apmLbSrc();APM.lbSrc=src;
  if(lb){clearTimeout(APM.lbT);if(lb.classList.contains('apmclosing')){lb.classList.remove('apmclosing');lb.getAnimations({subtree:true}).forEach(x=>x.cancel())}}
  if(img&&!apmRM()){const go=()=>setTimeout(()=>{if(!lb.classList.contains('on')||!LB.w)return;apmLbFly(true)},0);img.addEventListener('load',go,{once:true})}
  if(lb&&!apmRM())apmAnim(lb,[{backgroundColor:'rgba(5,5,6,0)'},{backgroundColor:'#050506'}],{duration:340,easing:APM.out});
  return _o.apply(this,a)}}
function apmLbRect(){const s=APM.lbSrc;if(!s||!s.isConnected||!s.getClientRects().length)return null;const r=s.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight||!r.width)return null;const z=uiZoom()||1;return{x:r.left/z,y:r.top/z,w:r.width/z,h:r.height/z}}
function apmLbFly(open){const img=$('#lbImg');if(!img||!LB.w)return null;const R=apmLbRect(),end=`translate(${LB.x}px,${LB.y}px) scale(${LB.s})`;let from;
  if(R){const s=Math.max(R.w/LB.w,R.h/LB.h),tx=R.x+R.w/2-LB.w*s/2,ty=R.y+R.h/2-LB.h*s/2;from=`translate(${tx}px,${ty}px) scale(${s})`}
  else from=`translate(${LB.x+LB.w*LB.s*.04}px,${LB.y+LB.h*LB.s*.04}px) scale(${LB.s*.92})`;
  const kf=open?[{transform:from,opacity:R?1:0},{transform:end,opacity:1}]:[{transform:end,opacity:1},{transform:from,opacity:0}];
  return apmAnim(img,kf,open?{duration:560}:{duration:300,easing:APM.out,fill:'forwards'})}
{const _c=lbClose;lbClose=function(...a){const lb=$('#lbox');if(!lb||!lb.classList.contains('on')||apmRM()||lb.classList.contains('apmclosing')||!LB.w)return _c.apply(this,a);
  lb.classList.add('apmclosing');apmLbFly(false);apmAnim(lb,[{backgroundColor:'#050506'},{backgroundColor:'rgba(5,5,6,0)'}],{duration:300,easing:APM.out,fill:'forwards'});
  const bar=lb.querySelector('.lbbar');if(bar)apmAnim(bar,[{opacity:1},{opacity:0}],{duration:160,easing:APM.out,fill:'forwards'});
  clearTimeout(APM.lbT);APM.lbT=setTimeout(()=>{lb.classList.remove('apmclosing');lb.getAnimations({subtree:true}).forEach(x=>x.cancel());_c.apply(this,a)},290)}}

/* (7) settings: opening a group pushes it in from the trailing side like a phone's settings, «back» brings the list from the leading side */
APM.sg=typeof SG!=='undefined'?SG.cur||null:null;   /* the group shown at the last sgApply (SG.cur is already the new one when it runs) */
hookFn('sgApply',()=>sgApply,f=>{sgApply=f},'post',function(){try{const cur=SG.cur||null,was=APM.sg||null;APM.sg=cur;if(cur===was||apmRM()||curView()!=='set')return;
  const x=(cur?1:-1)*(document.documentElement.dir==='rtl'?-1:1)*28;
  [$('#sgList'),$('#v-set .set')].forEach(el=>{if(el&&el.getClientRects().length)apmAnim(el,[{opacity:0,transform:`translateX(${x}px)`},{opacity:1,transform:'none'}],{duration:500})})}catch(e){}});
