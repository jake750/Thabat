/* ============ v3.65.0 navigation (fourth list, group B: 22 28 31 32 33 36) ============ */
/* 22. phones: the bottom bar slides away while scrolling down and returns when scrolling up */
{const m=$('main');let y0=0,acc=0;if(m)m.addEventListener('scroll',()=>{if(!MOB.matches||S.settings.navStay){document.documentElement.classList.remove('navhide');return}const y=m.scrollTop,dy=y-y0;y0=y;
  if(y<60){acc=0;document.documentElement.classList.remove('navhide');return}acc=(Math.sign(acc)===Math.sign(dy))?acc+dy:dy;
  if(acc>40)document.documentElement.classList.add('navhide');else if(acc<-24)document.documentElement.classList.remove('navhide')},{passive:true});
  {const _sv=showView;showView=function(...a){document.documentElement.classList.remove('navhide');return _sv(...a)}}}

/* 28. phones: a swipe in from the screen edge goes back inside the library, a notes folder or a settings group */
function nvbSub(){const v=curView();if($('.modal.on')||$('#ppPop')||$('#bkReader.on')||$('#libPlayer.on'))return false;
  if(v==='lib')return typeof LNAV!=='undefined'&&LNAV.back.length>0;if(v==='boards')return typeof NF!=='undefined'&&nbMode==='notes'&&!!(NF.cur||NF.arc);if(v==='set')return typeof SG!=='undefined'&&!!SG.cur;return false}
function nvbBack(){const v=curView();if(v==='set'){SG.cur=null;sgApply();$('main').scrollTop=0;return}try{window.thabatBack()}catch(e){}}
{let E=null,hint=null;const W=22;
  addEventListener('touchstart',e=>{E=null;if(!MOB.matches||e.touches.length!==1)return;const p=e.touches[0];const left=p.clientX<=W,right=p.clientX>=innerWidth-W;if(!left&&!right||!nvbSub())return;E={x:p.clientX,y:p.clientY,from:left?1:-1,go:false};e.stopPropagation()},{capture:true,passive:true});
  addEventListener('touchmove',e=>{if(!E)return;const p=e.touches[0],dx=(p.clientX-E.x)*E.from,dy=Math.abs(p.clientY-E.y);if(dy>60){E=null;if(hint)hint.classList.remove('on');return}
    if(!hint){hint=document.createElement('div');hint.className='nvbhint';hint.textContent='↩';document.body.append(hint)}hint.style.top=(p.clientY/(uiZoom()||1)-22)+'px';hint.classList.toggle('rt',E.from<0);hint.style.setProperty('--p',Math.max(0,Math.min(1,dx/80)));hint.classList.add('on');E.go=dx>=80},{capture:true,passive:true});
  addEventListener('touchend',()=>{if(!E)return;const go=E.go;E=null;if(hint)hint.classList.remove('on');if(go){nvbBack();try{vib(8)}catch(x){}}},{capture:true,passive:true});
  addEventListener('touchcancel',()=>{E=null;if(hint)hint.classList.remove('on')},{capture:true,passive:true})}

/* 31. Ctrl+K: «did you know?» — one feature you have not used, when the search box is empty */
const DYK=[
  {k:'pageEd',run:()=>{showView('today');openPageEd()}},
  {k:'cardDrag',pc:1,run:()=>{showView('today')}},
  {k:'tkGroup',run:()=>{showView('today');S.settings.tkGroup=true;save();renderTasks()}},
  {k:'arr',run:()=>{showView('today');const b=$('#arrBtn');if(b&&!b.hidden)b.click();else toast(t('dyk.arrNone'))}},
  {k:'qtr',run:()=>qtrOpen()},{k:'p90',run:()=>p90Open()},{k:'fy',run:()=>fyOpen()},{k:'ver',run:()=>openVersions()},
  {k:'pins',run:()=>pinOpen()},{k:'wkp',run:()=>wkpOpen()},{k:'sto',run:()=>stoRun()},{k:'life',run:()=>lfgOpen()},
  {k:'stu',run:()=>stuOpen()},{k:'undo',run:()=>openUndoHist()},{k:'keys',pc:1,run:()=>nvbKeys()}];
function dykPick(){let U={};try{U=JSON.parse(localStorage.getItem('thabat.dyk')||'{}')}catch(e){}const ok=DYK.filter(d=>(!d.pc||!MOB.matches)&&!U[d.k]&&(d.k!=='undo'||typeof openUndoHist==='function'));if(!ok.length)return null;return ok[Math.floor(Date.now()/864e5)%ok.length]}
{hookFn('cmdRender',()=>cmdRender,f=>{cmdRender=f},'post',function(){try{if(($('#cmdIn').value||'').trim())return;const d=dykPick();if(!d)return;const r=$('#cmdRes');if(!r||r.querySelector('.dyk'))return;
  r.insertAdjacentHTML('afterbegin',`<div class="dyk"><b>💡 ${t('dyk.t')}</b><span>${t('dyk.'+d.k)}</span><div class="row"><button type="button" class="btn sm" data-go>${t('dyk.try')}</button><button type="button" class="btn sm ghost" data-no>${t('dyk.no')}</button></div></div>`);
  const mark=()=>{try{const U=JSON.parse(localStorage.getItem('thabat.dyk')||'{}');U[d.k]=Date.now();localStorage.setItem('thabat.dyk',JSON.stringify(U))}catch(e){}};
  r.querySelector('.dyk [data-go]').onclick=()=>{mark();cmdClose();setTimeout(()=>{try{d.run()}catch(e){console.error(e)}},40)};r.querySelector('.dyk [data-no]').onclick=()=>{mark();cmdRender()}}catch(e){}})}
function nvbKeys(){const K=[['Ctrl+K',t('dyk.kK')],['1 … 5',t('dyk.k15')],['Ctrl + / − / 0',t('dyk.kZ')],['Alt+← / →',t('dyk.kAlt')],['Ctrl+Shift+H',t('dyk.kH')],['Esc',t('d.close')]];
  openInfo('⌨ '+t('dyk.keysT'),`<div class="nvbkeys">${K.map(([a,b])=>`<div><kbd>${a}</kbd><span>${esc(b)}</span></div>`).join('')}</div>`)}

/* 32. settings: the bar of an open group becomes a path like the library's: ⚙ Settings › group */
{hookFn('sgApply',()=>sgApply,f=>{sgApply=f},'post',function(){try{const bar=$('#sgBar'),b=$('#sgBack');if(!bar||!b)return;bar.classList.add('crumbs');b.textContent='⚙ '+t('nav.set');let s=bar.querySelector('.crs');if(!s){s=document.createElement('span');s.className='crs';s.textContent=document.documentElement.dir==='rtl'?'‹':'›';b.after(s)}}catch(e){}})}

/* 33. PC: a note or a book in a window of its own (?solo=note:<id> / ?solo=book:<key>) */
const SOLO=(()=>{try{const v=new URLSearchParams(location.search).get('solo');return v&&/^(note|book):/.test(v)?{k:v.split(':')[0],id:v.slice(v.indexOf(':')+1)}:null}catch(e){return null}})();
function soloOpen(kind,id){if(MOB.matches||ANDROID)return;const u=location.href.split(/[?#]/)[0]+'?solo='+kind+':'+encodeURIComponent(id);const w=window.open(u,'thabat-'+kind+'-'+id,'popup,width='+(kind==='book'?1100:900)+',height=860');if(!w)toast(t('solo.blocked'))}
if(SOLO){document.documentElement.classList.add('solo');/* the main window keeps the adhan and the alerts; this one stays quiet */try{if(typeof adhanPlay==='function')adhanPlay=function(){};if(typeof alertUser==='function')alertUser=function(){}}catch(e){}setTimeout(()=>{try{const id=decodeURIComponent(SOLO.id);if(SOLO.k==='note'){openNote(id);const n=NOTES().find(x=>x.id===id);document.title=(n&&n.title||t('nav.notes'))+' · '+t('app')}else{nteBkOpen(id,null);document.title=t('nav.lib')+' · '+t('app')}}catch(e){console.error(e)}},500)}
if(SOLO&&SOLO.k==='note'){const _cn=closeNote;closeNote=function(...a){const r=_cn(...a);setTimeout(()=>{try{flushSave()}catch(e){}window.close()},150);return r}}
if(SOLO&&SOLO.k==='book'){setInterval(()=>{if(!$('#bkReader.on')){try{flushSave()}catch(e){}window.close()}},1500)}
function soloNoteBtn(){if(MOB.matches||ANDROID||SOLO)return;const m=$('#nteMore');if(!m||$('#nteWin'))return;m.insertAdjacentHTML('beforebegin',`<button class="btn sm ghost" id="nteWin" type="button" title="${esc(t('solo.note'))}" aria-label="${esc(t('solo.note'))}">⧉</button>`);
  $('#nteWin').onclick=e=>{e.preventDefault();const id=NE&&NE.id;if(!id)return;try{closeNote(true)}catch(x){}setTimeout(()=>soloOpen('note',id),200)}}
{hookFn('openNote',()=>openNote,f=>{openNote=f},'post',function(){try{soloNoteBtn()}catch(e){}})}
{hookFn('bkReaderMenu',()=>bkReaderMenu,f=>{bkReaderMenu=f},'post',function(){try{if(MOB.matches||ANDROID||SOLO)return;const p=$('#ppPop');if(!p||p.querySelector('[data-solo]'))return;p.insertAdjacentHTML('beforeend',`<button data-solo="1">⧉ ${t('solo.book')}</button>`);p.querySelector('[data-solo]').onclick=()=>{closePP();const k=BK.key;try{bkClose()}catch(x){}setTimeout(()=>soloOpen('book',k),200)}}catch(e){}})}

/* 36. PC: fold the side bar to icons only */
function navMiniApply(){document.documentElement.classList.toggle('navmini',!!S.settings.navMini&&!MOB.matches);const b=$('#navMiniB');if(b){b.title=t(S.settings.navMini?'nvb.open':'nvb.mini');b.setAttribute('aria-label',b.title);b.textContent=(S.settings.navMini?'»':'«')}}
function navMiniBtn(){const nav=$('nav.side');if(!nav||$('#navMiniB'))return;const b=document.createElement('button');b.type='button';b.id='navMiniB';b.className='navminib';nav.append(b);b.onclick=()=>{S.settings.navMini=!S.settings.navMini;save();navMiniApply();try{uxWide()}catch(e){}};navMiniApply()}
setTimeout(()=>{try{navMiniBtn();navMiniApply()}catch(e){}},300);addEventListener('resize',()=>{try{navMiniApply()}catch(e){}});
{hookFn('applyI18n',()=>applyI18n,f=>{applyI18n=f},'post',function(){try{navMiniApply()}catch(e){}})}
{const _cc=cmdCommands;cmdCommands=function(){const L_=_cc();L_.push({icon:'«',label:t('nvb.toggle'),run:()=>{S.settings.navMini=!S.settings.navMini;save();navMiniApply()},kw:'sidebar collapse icons menu طي الشريط الجانبي القائمة'},{icon:'⌨',label:t('dyk.keysT'),run:nvbKeys,kw:'shortcuts keys اختصارات لوحة المفاتيح'});return L_}}
document.addEventListener('keydown',e=>{if(e.key==='?'&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!/INPUT|TEXTAREA|SELECT/.test((document.activeElement||{}).tagName||'')&&!(document.activeElement&&document.activeElement.isContentEditable)&&!$('.modal.on')){e.preventDefault();nvbKeys()}});
