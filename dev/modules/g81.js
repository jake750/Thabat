/* ============ v3.69.0 states and alerts (fourth list, group F: 94 97 98 99 102 103 105) ============ */
/* 94. a small «saved ✓» after an edit you made (not after background saves) */
const SVD={act:0,last:0};['pointerdown','keydown','change'].forEach(ev=>document.addEventListener(ev,()=>{SVD.act=Date.now()},true));
{hookFn('save',()=>save,f=>{save=f},'post',function(){const n=Date.now();if(n-SVD.act>1500||n-SVD.last<2500||S.settings.noSavedTick)return;SVD.last=n;let el=$('#svdPill');if(!el){el=document.createElement('div');el.id='svdPill';el.className='svdpill';el.setAttribute('role','status');document.body.append(el)}
  el.textContent='✓ '+t('svd.ok');el.classList.remove('on');void el.offsetWidth;el.classList.add('on');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('on'),1300)})}

/* 97. features that need the internet say so when there is no connection (instead of failing silently) */
{const _f=window.fetch;const NET={at:0};const remote=u=>{try{const x=new URL(String(u&&u.url||u),location.href);return/^https?:$/.test(x.protocol)&&!/^(127\.0\.0\.1|localhost|\[::1\])$/.test(x.hostname)&&!/^(10|192\.168|100)\./.test(x.hostname)}catch(e){return false}};
  const tell=k=>{if(Date.now()-NET.at<20000)return;NET.at=Date.now();toast('📡 '+t(k))};
  window.fetch=function(u,...a){if(remote(u)&&navigator.onLine===false){tell('net.off');return Promise.reject(new TypeError('offline'))}const p=_f.call(this,u,...a);return remote(u)?p.catch(e=>{if(e&&e.name!=='AbortError'&&navigator.onLine===false)tell('net.off');else if(e&&e.name==='TypeError'&&/fetch|network/i.test(e.message))tell('net.fail');throw e}):p}}

/* 98. while the library connects: grey placeholder cards instead of an empty page */
{hookFn('renderLib',()=>renderLib,f=>{renderLib=f},'post',function(){try{const box=$('#libBox');if(!box)return;const want=typeof LIB!=='undefined'&&LIB.busy&&!LIB.tree;let sk=box.querySelector('.skelgrid');if(!want){if(sk)sk.remove();return}if(sk)return;
  sk=document.createElement('div');sk.className='skelgrid';sk.setAttribute('aria-hidden','true');sk.innerHTML=Array.from({length:6},()=>'<div class="skelc"><i class="skel skimg"></i><i class="skel skl1"></i><i class="skel skl2"></i></div>').join('');box.append(sk)}catch(e){}})}

/* 99. a count of what is selected in every selection mode: tasks (Shift-click / «تحديد») and the whiteboard */
function selCount(){try{const b=$('#uxSel');if(b&&typeof UXT!=='undefined'){let c=b.querySelector('.selcnt');if(!c){c=document.createElement('b');c.className='selcnt';b.prepend(c)}c.textContent=t('sel.n',UXT.sel.size);c.hidden=!UXT.sel.size}}catch(e){}
  try{if(typeof WB!=='undefined'&&WB&&WB.sel){const n=(WB.sel.size!=null?WB.sel.size:WB.sel.length)||0;let c=$('#wbSelCnt');const host=$('#bwrap');if(!host)return;if(n<2){if(c)c.remove();return}if(!c){c=document.createElement('div');c.id='wbSelCnt';c.className='wbselcnt';host.append(c)}c.textContent=t('sel.n',n)}}catch(e){}}
document.addEventListener('click',()=>setTimeout(selCount,30),true);document.addEventListener('keyup',()=>setTimeout(selCount,30),true);document.addEventListener('pointerup',()=>setTimeout(selCount,40),true);

/* 102. the alerts you may have missed, in one list (this device): 🔔 at the top of the page */
const NCL_K='thabat.ncl';function nclList(){try{return JSON.parse(localStorage.getItem(NCL_K)||'[]')}catch(e){return[]}}
function nclAdd(tt,b){if(!tt)return;const L_=nclList();L_.unshift({t:String(tt).slice(0,140),b:String(b||'').slice(0,240),at:Date.now()});try{localStorage.setItem(NCL_K,JSON.stringify(L_.slice(0,80)))}catch(e){}nclBadge()}
{const _au=alertUser;alertUser=function(title,body,...a){try{if(!SOLO)nclAdd(title,body)}catch(e){}return _au(title,body,...a)}}
function nclUnseen(){const seen=+(localStorage.getItem(NCL_K+'.seen')||0);return nclList().filter(x=>x.at>seen).length}
function nclBadge(){let b=$('#nclBtn');if(!b){b=document.createElement('button');b.id='nclBtn';b.type='button';b.className='helpbtn nclbtn';b.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg><i></i>';b.onclick=nclOpen;document.body.append(b)}
  const n=nclUnseen();b.title=t('ncl.t');b.setAttribute('aria-label',t('ncl.t')+(n?' ('+n+')':''));b.querySelector('i').textContent=n>9?'9+':n||'';b.classList.toggle('has',!!n)}
function nclOpen(){const L_=nclList();localStorage.setItem(NCL_K+'.seen',String(Date.now()));nclBadge();
  const byDay={};L_.forEach(x=>{const k=dKey(new Date(x.at));(byDay[k]=byDay[k]||[]).push(x)});
  openInfo('🔔 '+t('ncl.t'),L_.length?Object.keys(byDay).map(k=>`<div class="nclday">${esc(dayLabel(k))}</div>`+byDay[k].map(x=>`<div class="nclit"><span class="ncltm">${fmtT(x.at)}</span><div><b dir="auto">${esc(x.t)}</b>${x.b?`<small dir="auto">${esc(x.b)}</small>`:''}</div></div>`).join('')).join('')+`<button class="btn sm ghost" id="nclClr" style="margin-top:10px">${t('ncl.clr')}</button>`:`<p class="muted">${t('ncl.none')}</p>`);
  const c=$('#nclClr');if(c)c.onclick=()=>{localStorage.removeItem(NCL_K);nclBadge();document.querySelectorAll('.modal.on').forEach(m=>m.classList.remove('on'))}}
setTimeout(()=>{try{if(!SOLO)nclBadge()}catch(e){}},700);
{const _cc=cmdCommands;cmdCommands=function(){const L_=_cc();L_.push({icon:'🔔',label:t('ncl.t'),run:nclOpen,kw:'notifications alerts missed تنبيهات إشعارات فاتتك'});return L_}}

/* 103. leaving with an unsaved note or event asks first */
addEventListener('beforeunload',e=>{try{const ne=$('#noteModal.on')&&typeof NE!=='undefined'&&NE&&(String(($('#neTitle')||{}).value||'').trim()||String(($('#neBody')||{}).value||'').trim());const ev=$('#evModal.on')&&String(($('#evT')||{}).value||'').trim();if(ne||ev){e.preventDefault();e.returnValue=''}}catch(x){}});

/* 105. «new» on new features until you open them once */
const NEWB={'#lkBtn':'lk','#nselBtn':'nsel','#eselBtn':'esel','#navMiniB':'navmini','#tdaRing':'ring','#nteWin':'solo'};
function newbSeen(){try{return JSON.parse(localStorage.getItem('thabat.newb')||'{}')}catch(e){return{}}}
function newbPaint(){const S0=newbSeen();if(!S0._since){S0._since=Date.now();try{localStorage.setItem('thabat.newb',JSON.stringify(S0))}catch(e){}}if(Date.now()-S0._since>30*864e5)return;
  Object.entries(NEWB).forEach(([sel,k])=>{const el=$(sel);if(!el)return;el.classList.toggle('newb',!S0[k])})}
document.addEventListener('click',e=>{const hit=Object.keys(NEWB).find(sel=>e.target.closest&&e.target.closest(sel));if(!hit)return;const S0=newbSeen();S0[NEWB[hit]]=Date.now();try{localStorage.setItem('thabat.newb',JSON.stringify(S0))}catch(x){}const el=$(hit);if(el)el.classList.remove('newb')},true);
{let q=null;new MutationObserver(()=>{if(q)return;q=setTimeout(()=>{q=null;try{newbPaint()}catch(e){}},400)}).observe(document.body,{childList:true,subtree:true})}
