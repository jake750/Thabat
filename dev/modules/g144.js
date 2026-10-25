/* ============ 3.124 eleventh list G (library): frame stepping and frame timecode, fold finished chapters, a chapter watched in one tap, the book page beside a lesson remembered, volumes of one work grouped, search filters (option), the Mac library uploads and converts ============ */
/* 11th-68/69: , and . step one frame (paused); time in frames hh:mm:ss:ff (S.lib.fps = 24/25/30/60 or off) */
function lxfFps(){return+(LIBS().fps||0)}
function lxfTC(s,fps){s=Math.max(0,s||0);const f=Math.floor((s%1)*fps+1e-6),x=Math.floor(s),h=Math.floor(x/3600),m=Math.floor(x/60)%60,ss=x%60,p=n=>String(n).padStart(2,'0');return(h?h+':'+p(m):m)+':'+p(ss)+':'+p(f)}
function lxfPaint(){const v=$('#lvV'),fps=lxfFps();if(!v||!fps)return;const a=$('#lpvTime'),n=$('#lpvNow');if(a)a.textContent=lxfTC(v.currentTime,fps)+' / '+lxfTC(v.duration||0,fps);if(n)n.textContent=lxfTC(v.currentTime,fps)}
window.addEventListener('keydown',e=>{if(e.key!==','&&e.key!=='.'&&e.key!=='،')return;if(!$('#libPlayer.on'))return;const a=document.activeElement;if(a&&/INPUT|TEXTAREA|SELECT/.test(a.tagName)||a&&a.isContentEditable)return;const v=$('#lvV');if(!v)return;
  e.preventDefault();e.stopPropagation();v.pause();const fps=lxfFps()||30;v.currentTime=Math.max(0,Math.min((v.duration||1e9)-.01,v.currentTime+(e.key==='.'?1:-1)/fps));setTimeout(lxfPaint,30);try{lpvFlash((e.key==='.'?'+1':'−1')+' '+t('lxf.fr'))}catch(x){}},true);
function lxfMenu(btn){const cur=lxfFps(),p=qPopAt([0,24,25,30,60].map(f=>`<button data-f="${f}" class="${f===cur?'on':''}">${f?t('lxf.fps',f):t('lxf.off')}</button>`).join('')+`<div class="lxfh">${esc(t('lxf.keys'))}</div>`,btn.getBoundingClientRect().left+20,btn.getBoundingClientRect().bottom-6,'aymenu');
  p.querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>{closePP();const f=+b.dataset.f;if(f)LIBS().fps=f;else delete LIBS().fps;save();lxfPaint();lxfBtn();if(!f){const v=$('#lvV');if(v)v.dispatchEvent(new Event('timeupdate'))}})}
function lxfBtn(){const a=$('#lxbB')||$('#lxsB');if(!a)return;let b=$('#lxfB');if(!b){a.insertAdjacentHTML('afterend',`<button class="lpva" id="lxfB"></button>`);b=$('#lxfB');b.onclick=e=>lxfMenu(e.currentTarget)}b.innerHTML=`⏱ <span>${esc(lxfFps()?t('lxf.fps',lxfFps()):t('lxf.btn'))}</span>`;b.title=t('lxf.keys')}
{hookFn('lpvBuild',()=>lpvBuild,f=>{lpvBuild=f},'post',function(){try{lxfBtn();const v=$('#lvV');if(v&&!v.dataset.lxf){v.dataset.lxf=1;['timeupdate','seeked','loadedmetadata'].forEach(ev=>v.addEventListener(ev,lxfPaint))}}catch(e){}})}

/* 11th-70: finished chapters fold on a course page (a tap on a chapter opens or folds it); 11th-71: «✓» marks every lesson of the chapter watched (again: unwatched) */
const LCH={open:new Set(),shut:new Set()};
function lchRows(h){const out=[];let el=h.nextElementSibling;while(el&&!el.classList.contains('lbch')){if(el.classList.contains('lbl')&&el.dataset.play)out.push(el);el=el.nextElementSibling}return out}
function lchFold(){$$('#libBox .lbch').forEach(h=>{const rows=lchRows(h);if(!rows.length)return;const key=(LIB.open||'')+'|'+h.firstChild?.textContent;const done=h.classList.contains('lchdone'),shut=LCH.shut.has(key)||(done&&!LCH.open.has(key));
  rows.forEach(r=>r.classList.toggle('lchh',shut));h.classList.toggle('lchshut',shut);h.classList.add('lchtg');
  h.onclick=e=>{if(e.target.closest('.lchm'))return;if(shut){LCH.shut.delete(key);LCH.open.add(key)}else{LCH.open.delete(key);LCH.shut.add(key)}lchFold()};
  if(!h.querySelector('.lchm')){h.insertAdjacentHTML('beforeend',`<button class="lchm" title="${esc(done?t('lchm.undo'):t('lchm.do'))}">${done?'↺':'✓'}</button>`);h.querySelector('.lchm').onclick=e=>{e.stopPropagation();lchMark(rows.map(r=>r.dataset.play),!done)}}})}
function lchMark(ids,on){const P=LIBS().prog,back={};ids.forEach(id=>{back[id]=P[id]?Object.assign({},P[id]):null;const p=P[id]=P[id]||{p:0,d:0};if(on){p.done=true;p.at=Date.now()}else delete p.done});save();renderLib();
  toastAct(t(on?'lchm.done':'lchm.undone',ids.length),t('undo'),()=>{Object.entries(back).forEach(([id,v])=>{if(v)P[id]=v;else delete P[id]});save();renderLib()},8000)}

/* 11th-72: the book page last opened beside a lesson is remembered (meta[lesson].bkl={key,pg}) */
{hookFn('bkClose',()=>bkClose,f=>{bkClose=f},'pre',function(){try{if(document.documentElement.classList.contains('lxside')&&LIB.cur&&BK.key&&BK.cur){const L_=LIBS(),m=L_.meta[LIB.cur.id]=L_.meta[LIB.cur.id]||{};m.bkl={key:BK.key,pg:BK.cur};save()}}catch(e){}})}
{const _o=lxbOpen;lxbOpen=function(key,pg,...a){try{const m=LIB.cur&&lshMeta(LIB.cur.id);if(m&&m.bkl&&m.bkl.key===key&&m.bkl.pg>1)pg=m.bkl.pg}catch(e){}return _o(key,pg,...a)}}

/* 11th-73: volumes of one work (… ج 2، المجلد 3، vol. 4) grouped on the book shelf with a total progress */
const BKG={open:new Set()};
function bkVol(n){const m=String(n||'').match(/^(.*?)[\s\-–_(]*(?:ج|جـ|الجزء|جزء|المجلد|مجلد|م|vol\.?|volume|v|part|pt\.?)?[\s.]*(\d{1,3}|[٠-٩]{1,3})\s*\)?\s*$/i);if(!m||!m[1].trim()||m[1].trim().length<2)return null;return{base:m[1].trim().replace(/[\s\-–_(]+$/,''),n:+String(m[2]).replace(/[٠-٩]/g,c=>'٠١٢٣٤٥٦٧٨٩'.indexOf(c))}}
function bkGroupPaint(){const PIX=new Map(),cards=$$('#libBox .bkc[data-book]');if(cards.length<2)return;$$('#libBox .bkgrp').forEach(x=>x.remove());const G=new Map();
  cards.forEach(c=>{c.classList.remove('bkgh');const n=c.querySelector('b')?.textContent||'',v=bkVol(n);if(!v)return;const par=c.parentElement;if(!PIX.has(par))PIX.set(par,PIX.size+1);const k=lshNorm(v.base)+'|'+PIX.get(par);(G.get(k)||G.set(k,{base:v.base,L:[]}).get(k)).L.push({c,n:v.n,key:c.dataset.book})});
  G.forEach(g=>{if(g.L.length<2)return;g.L.sort((a,b)=>a.n-b.n);const pct=Math.round(g.L.reduce((s,x)=>s+(BKS()[x.key]&&BKS()[x.key].done?100:bkPct(x.key)||0),0)/g.L.length),open=BKG.open.has(g.base);
    g.L[0].c.insertAdjacentHTML('beforebegin',`<button class="bkc bkgrp ${open?'on':''}" data-bkg="${esc(g.base)}"><span class="bkcv"><i>📚</i><em>${pct}%</em></span><b dir="auto">${esc(g.base)}</b><small>${esc(t('bkg.n',g.L.length))}</small><span class="lbpb"><i style="width:${pct}%"></i></span></button>`);
    if(!open)g.L.forEach(x=>x.c.classList.add('bkgh'))});
  $$('#libBox [data-bkg]').forEach(b=>b.onclick=()=>{const k=b.dataset.bkg;BKG.open.has(k)?BKG.open.delete(k):BKG.open.add(k);bkGroupPaint()})}

/* 11th-75 (an option: S.lib.srchF): filter chips over the library search results */
const LSF={k:''};
function lsfPaint(){const b=$('#lshBody');if(!b)return;b.querySelector('.lsfbar')?.remove();if(!LIBS().srchF||!(LIBX.q||'').trim()){b.removeAttribute('data-sf');return}
  b.insertAdjacentHTML('afterbegin',`<div class="lsfbar">${[['',t('lct.all')],['v',t('lsf.v')],['b',t('lsf.b')],['n',t('lsf.n')]].map(([k,l])=>`<button class="chip ${LSF.k===k?'on':''}" data-lsf="${k}">${esc(l)}</button>`).join('')}</div>`);
  if(LSF.k)b.dataset.sf=LSF.k;else b.removeAttribute('data-sf');b.querySelectorAll('[data-lsf]').forEach(x=>x.onclick=()=>{LSF.k=x.dataset.lsf;lsfPaint()})}
const LSF_MO=new MutationObserver(()=>{const b=$('#lshBody');if(b&&!b.querySelector('.lsfbar')&&LIBS().srchF&&(LIBX.q||'').trim()){LSF_MO.disconnect();lsfPaint();lsfWatch()}});
function lsfWatch(){const b=$('#lshBody');if(b)LSF_MO.observe(b,{childList:true})}

{hookFn('renderLib',()=>renderLib,f=>{renderLib=f},'post',function(){try{lchFold();bkGroupPaint();lsfWatch();lsfPaint()}catch(e){console.error(e)}})}
/* the search-filter option lives in the library settings window */
{const _o=openLibSetup;openLibSetup=async function(...a){const r=await _o(...a);try{const box=$('#infoBox');if(box&&!$('#lsfRow')){const h=box.querySelectorAll('h4.uuh');(h[h.length-1]||box.lastElementChild).insertAdjacentHTML('beforebegin',`<div class="field" id="lsfRow"><div><label>${esc(t('lsf.set'))}</label><small>${esc(t('lsf.setS'))}</small></div><button class="sw-toggle ${LIBS().srchF?'on':''}" id="lsfT"></button></div>`);$('#lsfT').onclick=e=>{const L_=LIBS();L_.srchF=!L_.srchF;e.currentTarget.classList.toggle('on',!!L_.srchF);save()}}}catch(e){}return r}}
