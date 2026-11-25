/* ============ v3.182.0 card headers on two rows when the title no longer fits (his picks 1-4 of 2026-11-25) ============ */
/* 1+2: any card header whose title breaks or whose buttons wrap gets the wall's layout: title and «…» on row 1, the rest on row 2. Set inline (like wallHdFit), measured in the one-row state each time */
function hd2Lines(el){const r=document.createRange();r.selectNodeContents(el);const tops=new Set();for(const q of r.getClientRects())if(q.width>1)tops.add(Math.round(q.top/4));return tops.size}
function hd2Clear(h){[h,...h.children].forEach(c=>{if(c._hd2){c._hd2.forEach(k=>c.style.removeProperty(k));c._hd2=null}});const br=h.querySelector(':scope>.hd2br');if(br)br.style.display='none';h.classList.remove('hd2')}
function hd2Set(el,o){el._hd2=Object.keys(o);for(const k in o)el.style.setProperty(k,o[k],'important')}
function hd2Need(h){const tt=h.firstElementChild;if(hd2Lines(tt)>1)return true;
  const kids=[...h.children].filter(c=>c.offsetWidth&&!c.classList.contains('hd2br')&&!/absolute|fixed/.test(getComputedStyle(c).position)),R=kids.map(c=>c.getBoundingClientRect());if(!R.length)return false;
  const H=h.getBoundingClientRect();if(R.some(r=>r.left<H.left-2||r.right>H.right+2))return true;
  const bot=Math.min(...R.map(r=>r.bottom));if(R.some(r=>r.top>=bot-1))return true;
  return kids.some((c,i)=>{const f=c.firstElementChild;return c.children.length>1&&f&&f.offsetWidth&&R[i].height>f.getBoundingClientRect().height*1.8})}
function hd2Fit(h){if(!h.offsetWidth||h.children.length<2)return;hd2Clear(h);if(!hd2Need(h))return;
  let br=h.querySelector(':scope>.hd2br');if(!br){br=document.createElement('i');br.className='hd2br';br.setAttribute('aria-hidden','true');h.appendChild(br)}
  const geo=document.documentElement.classList.contains('st-geo');h.classList.add('hd2');
  hd2Set(h,{'flex-wrap':'wrap','justify-content':geo?'center':'flex-start','row-gap':'8px','column-gap':'8px'});
  hd2Set(br,{'display':'block','flex':'0 0 100%','width':'100%','height':'0','order':'2'});
  [...h.children].forEach((c,i)=>{if(c===br)return;
    if(i===0)hd2Set(c,{'order':'0','flex':'1 1 auto','min-width':'0','white-space':'normal'});
    else if(c.classList.contains('uxcm'))hd2Set(c,geo?{'order':'1'}:{'order':'1','margin-inline-start':'auto'});
    else hd2Set(c,{'order':'3','margin-inline-start':'0'})})}
function hd2Heads(){return[...document.querySelectorAll('.card>h3:not(.wallh):not(.foldh)')].filter(h=>{const f=h.firstElementChild;return f&&f.tagName==='SPAN'&&h.children.length>1})}
let hd2T=0;const hd2Q=new Set();
function hd2Later(h){hd2Q.add(h);clearTimeout(hd2T);hd2T=setTimeout(()=>{const a=[...hd2Q];hd2Q.clear();a.forEach(x=>{try{hd2Fit(x)}catch(e){}})},60)}
const hd2RO=typeof ResizeObserver==='function'?new ResizeObserver(es=>es.forEach(e=>{const h=e.target,w=Math.round(e.contentRect.width);if(w&&w!==h._hd2w){h._hd2w=w;hd2Later(h)}})):null;
function hd2Scan(){hd2Heads().forEach(h=>{if(!h._hd2o){h._hd2o=new MutationObserver(()=>hd2Later(h));h._hd2o.observe(h,{childList:true,subtree:true,characterData:true});if(hd2RO)hd2RO.observe(h)}hd2Later(h)})}
addEventListener('resize',()=>{try{hd2Scan()}catch(e){}});
hookFn('showView',()=>showView,f=>{showView=f},'post',function(){try{hd2Scan()}catch(e){}});
hookFn('applyTheme',()=>applyTheme,f=>{applyTheme=f},'post',function(){try{hd2Scan()}catch(e){}});
setTimeout(()=>{try{hd2Scan()}catch(e){}},0);setTimeout(()=>{try{hd2Scan()}catch(e){}},1200);
/* 3: the wall's download button gets the app's own icon instead of the «⤓» character */
function wiIcon(){const b=$('#wallImg');if(!b)return;if(!b.querySelector('svg'))b.innerHTML=uicSvg('download','⤓');b.setAttribute('aria-label',t('wi.btn'))}
/* 4: before the goal the badge shows what is left, in a quiet colour (wallHdFit picks the colour from .gl-left) */
hookFn('renderGlass',()=>renderGlass,f=>{renderGlass=f},'post',function(){try{wiIcon();const k=todayKey(),{tot}=totals(k),g=goalMs(k),gl=$('#goalLbl');if(!gl)return;const left=g>0&&tot<g;gl.classList.toggle('gl-left',left);if(left)gl.textContent=t('glass.left',fmtHM(Math.max(6e4,g-tot)));wallHdFit()}catch(e){}});
setTimeout(()=>{try{wiIcon()}catch(e){}},0);
