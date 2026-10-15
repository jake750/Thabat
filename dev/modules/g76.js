/* ============ v3.64.0 the Today page (fourth list, group A: 4 6 8 9 10 11 14 15 18 19 20) ============ */
const TDA={open:null};
function tdaName(c){const h=c.querySelector(':scope>h3');if(!h)return tmvKey(c);const sp=h.querySelector('span');return((sp&&sp.textContent)||(h.firstChild&&h.firstChild.textContent)||h.textContent).replace(/\s+/g,' ').trim().slice(0,32)||tmvKey(c)}

/* 4. «edit the page»: every card in one list — drag to reorder, density, fold, hide */
function openPageEd(){const L_=S.settings.home3||(S.settings.home3={}),cs=homeCards().filter(c=>c.id!=='tdLine').sort((a,b)=>(+(L_[cardKey(a)]||{}).o||0)-(+(L_[cardKey(b)]||{}).o||0));
  const zb=(o,z)=>`<button type="button" data-z="${z}" class="${(o.z||'')===z?'on':''}">${t('tda.z'+(z||'n'))}</button>`;
  openInfo('🧩 '+t('tda.ed'),`<p class="muted" style="margin:0 0 8px">${t(tmvMode()?'tda.edSubPc':'tda.edSub')}</p><div class="pelist">${cs.map(c=>{const k=cardKey(c),o=L_[k]||{};return`<div class="perow ${o.h?'off':''}" data-k="${esc(k)}"><span class="pegrip" aria-label="${esc(t('tmv.grip'))}">⠿</span><span class="pen">${esc(tdaName(c))}</span><span class="seg pez">${zb(o,'c')}${zb(o,'')}${zb(o,'r')}</span><button type="button" class="btn sm ghost" data-f>${o.c?t('ux.unfold'):t('ux.fold')}</button><button type="button" class="btn sm ${o.h?'':'ghost'}" data-h>${o.h?t('hl3.show'):t('hl3.hide')}</button></div>`}).join('')}</div>
   <div class="row" style="gap:6px;flex-wrap:wrap;margin-top:10px"><button class="btn sm ghost" id="peReset">${t('hl3.reset')}</button>${tmvMode()?`<button class="btn sm ghost" id="peAuto">⊞ ${t('tmv.auto')}</button>`:''}</div>`);
  const box=$('#infoBox')||document;box.classList&&box.classList.add('pebox');const rows=()=>[...$$('.pelist .perow')];
  const persist=()=>{rows().forEach((r,i)=>{(L_[r.dataset.k]=L_[r.dataset.k]||{}).o=i});save();homeApply()};const o_=r=>L_[r.dataset.k]||(L_[r.dataset.k]={});
  rows().forEach(r=>{r.querySelectorAll('[data-z]').forEach(b=>b.onclick=()=>{const o=o_(r);if(b.dataset.z)o.z=b.dataset.z;else delete o.z;save();homeApply();r.querySelectorAll('[data-z]').forEach(x=>x.classList.toggle('on',x===b))});
    r.querySelector('[data-f]').onclick=e=>{const o=o_(r);o.c=!o.c;save();homeApply();try{uxRebalance()}catch(x){}e.currentTarget.textContent=o.c?t('ux.unfold'):t('ux.fold')};
    r.querySelector('[data-h]').onclick=e=>{const o=o_(r);o.h=!o.h;save();homeApply();try{uxRebalance()}catch(x){}r.classList.toggle('off',o.h);e.currentTarget.textContent=o.h?t('hl3.show'):t('hl3.hide');e.currentTarget.classList.toggle('ghost',!o.h)};
    const g=r.querySelector('.pegrip');g.onpointerdown=e=>{e.preventDefault();try{g.setPointerCapture(e.pointerId)}catch(x){}r.classList.add('pedrag');
      g.onpointermove=ev=>{const others=rows().filter(x=>x!==r);const nx=others.find(x=>{const b=x.getBoundingClientRect();return b.top+b.height/2>ev.clientY});const par=r.parentElement;const before=nx||null;if(before!==r.nextElementSibling){const r0=new Map(others.map(x=>[x,x.getBoundingClientRect().top]));before?par.insertBefore(r,before):par.append(r);others.forEach(x=>{const d=(r0.get(x)-x.getBoundingClientRect().top)/(uiZoom()||1);if(d)try{x.animate([{transform:`translateY(${d}px)`},{transform:'none'}],{duration:150})}catch(y){}})}};
      g.onpointerup=g.onpointercancel=()=>{g.onpointermove=null;r.classList.remove('pedrag');persist()}}});
  $('#peReset').onclick=()=>{S.settings.home3={};save();homeApply();try{uxRebalance()}catch(x){}openPageEd()};const pa=$('#peAuto');if(pa)pa.onclick=()=>{tmvAuto();openPageEd()}}
openHomeLayout=openPageEd;

/* 11. density per card; 15. folded cards gather in a bar under the page */
{hookFn('homeApply',()=>homeApply,f=>{homeApply=f},'post',function(){try{const L_=S.settings.home3||{};homeCards().forEach(c=>{const z=(L_[cardKey(c)]||{}).z;c.classList.toggle('cdz-c',z==='c');c.classList.toggle('cdz-r',z==='r')});tdaFoldBar()}catch(e){}})}
function tdaFoldBar(){const v=$('#v-today');if(!v)return;const fl=homeCards().filter(c=>c.classList.contains('uxfold')&&!c.classList.contains('hhide'));let b=$('#tdFoldBar');
  if(!fl.length){if(b)b.remove();return}if(!b){b=document.createElement('div');b.id='tdFoldBar';b.className='tdfold'}const g=$('#v-today .grid');if(g&&b.previousElementSibling!==g)g.after(b);
  b.innerHTML=`<small>${t('tda.folded')}</small>`+fl.map(c=>`<button type="button" class="chip sm" data-k="${esc(cardKey(c))}">▾ ${esc(tdaName(c))}</button>`).join('');
  b.querySelectorAll('[data-k]').forEach(x=>x.onclick=()=>{const L_=S.settings.home3||{},o=L_[x.dataset.k];if(o){o.c=false;save();homeApply();try{uxRebalance()}catch(e){}const c=homeCards().find(q=>cardKey(q)===x.dataset.k);if(c)setTimeout(()=>c.scrollIntoView({block:'nearest',behavior:'smooth'}),60)}})}

/* the card «⋯» menu: + density, + «group by prayer» on the tasks card, «edit the page» */
uxCardMenu=function(c,btn){const L_=S.settings.home3||(S.settings.home3={}),k=cardKey(c),o=L_[k]||(L_[k]={}),r=btn.getBoundingClientRect(),isT=!!c.querySelector('#tasks');
  const p=qPopAt(`<button data-a="fold">${o.c?'▾ '+t('ux.unfold'):'▴ '+t('ux.fold')}</button><div class="aymh">${t('tda.dens')}</div><div class="seg pez" style="margin:0 6px 6px">${['c','','r'].map(z=>`<button data-z="${z}" class="${(o.z||'')===z?'on':''}">${t('tda.z'+(z||'n'))}</button>`).join('')}</div>${isT?`<button data-a="grp">${S.settings.tkGroup?'✓ ':''}${t('tda.grp')}</button>`:''}<button data-a="up">↑ ${t('ux.up')}</button><button data-a="dn">↓ ${t('ux.down')}</button><button data-a="hide">🙈 ${t('hl3.hide')}</button><button data-a="all">🧩 ${t('tda.ed')}</button>`,r.left+r.width/2,r.bottom-10,'aymenu');
  p.querySelectorAll('[data-z]').forEach(b=>b.onclick=()=>{if(b.dataset.z)o.z=b.dataset.z;else delete o.z;save();homeApply();closePP();try{uxEvenCheck()}catch(e){}});
  p.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{const a=b.dataset.a;closePP();
    if(a==='fold'){o.c=!o.c;save();homeApply();uxRebalance()}
    else if(a==='grp'){S.settings.tkGroup=!S.settings.tkGroup;save();renderTasks()}
    else if(a==='hide'){o.h=true;save();homeApply();uxRebalance();toastAct(t('ux.hidden'),t('undo'),()=>{o.h=false;save();homeApply();uxRebalance()})}
    else if(a==='all')openPageEd();
    else{const sib=[...c.parentElement.children].filter(x=>x.classList.contains('card')&&!x.classList.contains('hhide')).sort((a,b)=>(+a.style.order||0)-(+b.style.order||0)||[...a.parentElement.children].indexOf(a)-[...b.parentElement.children].indexOf(b));
      const i=sib.indexOf(c),j=a==='up'?i-1:i+1;if(j<0||j>=sib.length)return;if(tmvSaved(tmvMode()||'')){j<i?sib[j].before(c):sib[j].after(c);const m=tmvMode();S.settings.tdPlace[m]=tmvCols(m).map(col=>[...col.children].filter(x=>x.classList.contains('card')).map(tmvKey));save();return}
      [sib[i],sib[j]]=[sib[j],sib[i]];sib.forEach((x,n)=>{const kk=cardKey(x);(L_[kk]=L_[kk]||{}).o=n});save();homeApply();c.scrollIntoView({block:'nearest',behavior:'smooth'})}})};

/* 6. a small ring beside the Today title: tasks done + prayers prayed, out of today's tasks + prayers whose time came */
function tdaScore(){const k=todayKey(),d=day(k),ts=d.tasks.filter(x=>!x.dismissed),td=ts.filter(x=>x.done).length,now=Date.now(),pt=prayerTimes(new Date());let pp=0,pd=0;
  PDL_P.forEach(p=>{if(pt[p]&&pt[p]<=now){pp++;const st=plStatus(k,p);if(st&&!/miss|no|qada/.test(st))pd++}});const den=ts.length+pp;return{td,tt:ts.length,pd,pp,v:den?(td+pd)/den:0,den}}
function tdaRing(){const h=$('#v-today>.pgt');if(!h)return;let r=$('#tdaRing');if(!r){r=document.createElement('button');r.type='button';r.id='tdaRing';r.className='tdaring';h.append(r);r.onclick=e=>{const s=tdaScore(),b=e.currentTarget.getBoundingClientRect();qPopAt(`<div class="aymh">${t('tda.ring')}</div><div class="tdarp"><span>${t('tda.rT')}</span><b>${s.td} / ${s.tt}</b></div><div class="tdarp"><span>${t('tda.rP')}</span><b>${s.pd} / ${s.pp}</b></div>`,b.left+b.width/2,b.bottom-10,'aymenu')}}
  const s=tdaScore(),pc=Math.round(s.v*100),C=2*Math.PI*11;r.hidden=!s.den;r.title=t('tda.ringT',pc);r.setAttribute('aria-label',t('tda.ringT',pc));
  r.innerHTML=`<svg viewBox="0 0 28 28" aria-hidden="true"><circle cx="14" cy="14" r="11" class="bg"/><circle cx="14" cy="14" r="11" class="fg" stroke-dasharray="${(C*s.v).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 14 14)"/></svg><span>${pc}%</span>`;r.classList.toggle('full',pc>=100)}

/* 8. task details open under the row; 9. late / current edges; 10. grouped by prayer period; 19. PC: the row's buttons show on hover */
const TDA_BTN='.pp,.sadd,.tplay,.tmx,.tkm,.tkxb,.del';
function tdaTasks(){if(S.settings.tmx)return;const k=todayKey(),d=day(k),ul=$('#tasks');if(!ul)return;const now=Date.now();
  ul.querySelectorAll('.tkgh,.tkxp').forEach(x=>x.remove());
  const rows=[...ul.querySelectorAll(':scope>li.task')];
  rows.forEach(li=>{const x=d.tasks.find(q=>q.id===li.dataset.id);if(!x)return;
    const a=pdlAt(k,x),e=a!=null?a+(+x.est||30)*6e4:null;li.classList.toggle('tklate',!x.done&&a!=null&&now>e);li.classList.toggle('tknow',!x.done&&a!=null&&now>=a&&now<=e);
    if(!x.done&&!li.querySelector('.tkxb')){const m=li.querySelector('.tkm')||li.querySelector('.del');if(m)m.insertAdjacentHTML('beforebegin',`<button class="tkxb" type="button" title="${esc(t('tda.det'))}" aria-label="${esc(t('tda.det'))}">⌄</button>`);const b=li.querySelector('.tkxb');if(b)b.onclick=ev=>{ev.stopPropagation();TDA.open=TDA.open===x.id?null:x.id;tdaTasks()}}
    const xb=li.querySelector('.tkxb');if(xb)xb.classList.toggle('on',TDA.open===x.id);
    if(TDA_HOVER.matches&&!li.querySelector(':scope>.tkbar')){const bs=[...li.querySelectorAll(':scope>'+TDA_BTN.split(',').join(',:scope>'))];if(bs.length){const bar=document.createElement('span');bar.className='tkbar';bs.forEach(b=>bar.append(b));li.append(bar)}}});
  /* 10 */
  if(S.settings.tkGroup){const und=rows.filter(li=>!li.classList.contains('done')),per=li=>{const x=d.tasks.find(q=>q.id===li.dataset.id);if(!x)return'';if(x.after&&PDL_P.includes(x.after))return x.after;const a=pdlAt(k,x);return a!=null?(pdlSlotOf(k,a)||''):''};
    const first=rows.find(li=>li.classList.contains('done'))||null;['',...PDL_P].map(p=>[p,und.filter(li=>per(li)===p)]).sort((A,B)=>(A[0]===''?1:0)-(B[0]===''?1:0)).forEach(([p,ls])=>{if(!ls.length)return;const h=document.createElement('li');h.className='tkgh';h.textContent=p?t('tda.after',t('pr.'+p)):t('tda.noP');ul.insertBefore(h,first);ls.forEach(li=>ul.insertBefore(li,first))})}
  /* 8 */
  const x=TDA.open&&d.tasks.find(q=>q.id===TDA.open&&!q.done),li=x&&ul.querySelector(`li.task[data-id="${CSS.escape(x.id)}"]`);if(!x||!li){TDA.open=null;return}
  const sel=v=>v?'selected':'',p=document.createElement('li');p.className='tkxp';
  p.innerHTML=`<label><span>${t('tds.after')}</span><select class="in" data-f="after"><option value="">—</option>${PDL_P.map(q=>`<option value="${q}" ${sel(x.after===q)}>${t('pr.'+q)}</option>`).join('')}</select></label>
   <label><span>${t('tds.at')}</span><input class="in" type="time" data-f="at" value="${esc(x.at||'')}"></label>
   <label><span>${t('tds.est')}</span><input class="in num" type="number" min="5" max="600" step="5" data-f="est" value="${x.est||''}" placeholder="30"></label>
   <label><span>${t('tds.pri')}</span><select class="in" data-f="pri"><option value="1" ${sel(x.pri===1)}>${t('tds.p1')}</option><option value="2" ${sel(!x.pri)}>${t('tds.p2')}</option><option value="3" ${sel(x.pri===3)}>${t('tds.p3')}</option></select></label>
   <div class="tkxa"><button type="button" class="btn sm ghost" data-a="sub">＋ ${t('st.ph')}</button><button type="button" class="btn sm ghost" data-a="more">⋯ ${t('tds.more')}</button></div>`;
  li.after(p);
  p.querySelector('[data-f="after"]').onchange=e=>{if(e.target.value)x.after=e.target.value;else delete x.after;save();renderTasks()};p.querySelector('[data-f="at"]').onchange=e=>pdlSetAt(k,x,e.target.value||null);
  p.querySelector('[data-f="est"]').onchange=e=>{const v=+e.target.value;if(v>0)x.est=v;else delete x.est;save();renderTasks()};p.querySelector('[data-f="pri"]').onchange=e=>priSet(k,x,+e.target.value);
  p.querySelector('[data-a="sub"]').onclick=()=>{const b=li.querySelector('.sadd');if(b)b.click()};p.querySelector('[data-a="more"]').onclick=e=>tkMenu(e.currentTarget,k,x.id)}
const TDA_HOVER=matchMedia('(hover:hover) and (pointer:fine)');
/* phones: no ⌄ button (the row is already full); a tap on the row outside the text and the buttons opens the details */
document.addEventListener('click',e=>{if(!MOB.matches||S.settings.tmx)return;const li=e.target.closest&&e.target.closest('#tasks li.task:not(.done)');if(!li||e.target.closest('button,.tx,input,a,.tkh,.subt,.tmeta [data-mx]'))return;TDA.open=TDA.open===li.dataset.id?null:li.dataset.id;tdaTasks()});
{hookFn('renderTasks',()=>renderTasks,f=>{renderTasks=f},'post',function(){try{tdaTasks();tdaRing()}catch(e){console.error(e)}})}

/* 14. the next-prayer card grows in the last 15 minutes before the adhan */
function tdaSoon(){const c=$('#v-today .tdpr');if(!c)return;const n=nextPrayer(),left=n?n.t-Date.now():1e9;c.classList.toggle('npsoon',left>0&&left<=15*6e4)}

/* 18. hover over the wall: minutes per category */
function tdaWallTip(on,ev){let tp=$('#tdaWallTip');if(!on){if(tp)tp.remove();return}const k=todayKey(),{tot,by}=totals(k),top=rollBy(by),rows=topCats().map(c=>({c,ms:top[c.id]||0})).filter(o=>o.ms>=6e4).sort((a,b)=>b.ms-a.ms);
  if(!tp){tp=document.createElement('div');tp.id='tdaWallTip';tp.className='tdawt';document.body.append(tp)}
  tp.innerHTML=`<b>${t('tda.wall')} · ${fmtHM(tot)}</b>`+(rows.length?rows.map(o=>`<div><i style="background:${o.c.color}"></i><span>${esc(kidName(o.c))}</span><em>${fmtHM(o.ms)}</em><small>${tot?Math.round(o.ms/tot*100):0}%</small></div>`).join(''):`<div class="muted">${t('tda.wallNone')}</div>`);
  const z=uiZoom()||1,w=tp.offsetWidth,hgt=tp.offsetHeight;let x=ev.clientX/z+14,y=ev.clientY/z+14;if(x+w>innerWidth/z-8)x=ev.clientX/z-w-14;if(y+hgt>innerHeight/z-8)y=ev.clientY/z-hgt-14;tp.style.left=Math.max(8,x)+'px';tp.style.top=Math.max(8,y)+'px'}
document.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse')return;const w=e.target.closest&&e.target.closest('#wall,#gscene');if(w&&!TMV.d)tdaWallTip(true,e);else if($('#tdaWallTip'))tdaWallTip(false)},{passive:true});

/* 20. a look at tomorrow under the page */
function tdaTomorrow(){const v=$('#v-today'),g=$('#v-today .grid');if(!v||!g)return;const tk=dKey(addDays(keyToDate(todayKey()),1)),dd=S.days[tk],ts=dd?dd.tasks.filter(x=>!x.done):[],ev=evsOn(tk);
  let b=$('#tmrPeek');if(!b){b=document.createElement('div');b.id='tmrPeek';b.className='card tmrpeek'}const fb=$('#tdFoldBar');const after=fb&&fb.isConnected?fb:g;if(b.previousElementSibling!==after)after.after(b);
  const it=[...ev.slice(0,3).map(e=>`<li><span class="tmt">${esc(e.time||t('tda.allDay'))}</span><span dir="auto">${esc(e.title||'')}</span></li>`),...ts.slice(0,3).map(x=>`<li><span class="tmt">${x.at?esc(x.at):x.after?t('tda.afterS',t('pr.'+x.after)):'☐'}</span><span dir="auto">${esc(x.text)}</span></li>`)];
  const more=Math.max(0,ev.length-3)+Math.max(0,ts.length-3);
  b.innerHTML=`<h3><span>${t('tda.tmr')} · ${esc(gStr(keyToDate(tk)))}</span></h3>${it.length?`<ul>${it.join('')}</ul>`:`<p class="muted" style="margin:0 0 6px">${t('tda.tmrNone')}</p>`}${more?`<small class="muted">${t('tda.more',more)}</small>`:''}<div class="tmradd"><input class="in" id="tmrIn" dir="auto" placeholder="${esc(t('tda.tmrPh'))}"><button class="btn sm" id="tmrGo">${t('add')}</button></div>`;
  const go=()=>{const i=$('#tmrIn'),s=i.value.trim();if(!s)return;day(tk).tasks.push({id:uid(),text:s,done:false,created:Date.now()});i.value='';save();tdaTomorrow();toast(t('tda.tmrOk'))};$('#tmrGo').onclick=go;$('#tmrIn').onkeydown=e=>{if(e.key==='Enter')go()}}

{hookFn('renderToday',()=>renderToday,f=>{renderToday=f},'post',function(){try{tdaRing();tdaSoon();tdaFoldBar();tdaTomorrow()}catch(e){console.error(e)}})}
setInterval(()=>{try{if(curView()==='today'&&!document.hidden){tdaSoon();tdaRing();if(!document.activeElement||!document.activeElement.closest('.tkxp'))tdaTasks()}}catch(e){}},30000);
setTimeout(()=>{try{tdaRing();tdaSoon();homeApply();tdaTomorrow();tdaTasks()}catch(e){}},1200);
{const _cc=cmdCommands;cmdCommands=function(){const L_=_cc();L_.push({icon:'🧩',label:t('tda.ed'),run:()=>{showView('today');openPageEd()},kw:'edit page cards layout تحرير الصفحة البطاقات ترتيب'});return L_}}
/* his request (3.64.0): in the cards layout «ملخّص اليوم» sits at the bottom of the left column; the balance checks measure the cards themselves (a stretched column would read as even) */
function tdaColH(s){const r=s.getBoundingClientRect(),l=[...s.children].filter(c=>c.offsetParent).pop();return l?(l.getBoundingClientRect().bottom-r.top)/(uiZoom()||1):0}
const TDA_SM={c:null};
{hookFn('uxBalance',()=>uxBalance,f=>{uxBalance=f},'pre',function(){try{TDA_SM.c=null;if(tmvSaved('cards'))return;const sm=$('#summary')&&$('#summary').closest('.card');if(!sm)return;const s=sm.parentElement,S0=uxStacks();if(sm.dataset.uxp==null&&S0.includes(s)){sm.dataset.uxp=S0.indexOf(s);sm.dataset.uxi=[...s.children].indexOf(sm)}if(sm.dataset.uxp==null)return;TDA_SM.c=sm;sm.remove()}catch(e){}})}
{hookFn('uxBalance',()=>uxBalance,f=>{uxBalance=f},'post',function(){try{const sm=TDA_SM.c;TDA_SM.c=null;if(!sm)return;const c3=$('#uxCol3')||uxStacks()[+sm.dataset.uxp];if(!c3)return;c3.append(sm);if(!$('#uxCol3'))return;
  /* place the other movable cards again, tallest first into the shortest column, now that the summary's height is known */
  const cols=[...uxStacks().slice(0,2),c3],rest=cols.flatMap(s=>[...s.children]).filter(c=>c.classList.contains('card')&&!c.classList.contains('uxanchor')&&c!==sm&&!c.classList.contains('hhide')&&c.offsetParent),hs=new Map(rest.map(c=>[c,c.offsetHeight]));
  rest.forEach(c=>c.remove());const H=cols.map(s=>s.offsetHeight),gap=14;rest.sort((x,y)=>hs.get(y)-hs.get(x)).forEach(c=>{let i=0;H.forEach((h,j)=>{if(h<H[i])i=j});i===2?c3.insertBefore(c,sm):cols[i].append(c);H[i]+=hs.get(c)+gap})}catch(e){}})}
uxEvenCheck=function(){if(tmvSaved('cards')||tdl()!=='cards'||!$('#uxCol3')||!document.documentElement.classList.contains('wide3'))return;const a=document.activeElement;if(a&&a.closest&&a.closest('#v-today .grid')&&(/INPUT|TEXTAREA/.test(a.tagName)||a.isContentEditable))return;
  const hs=[...uxStacks(),$('#uxCol3')].map(tdaColH);if(Math.max(...hs)-Math.min(...hs)>260&&Date.now()-(uxEvenCheck.at||0)>4000){uxEvenCheck.at=Date.now();try{uxRebalance()}catch(e){}}};
tmvEven=function(){if(tmvMode()!=='cols'||tmvSaved('cols')||TMV.d)return;const a=document.activeElement;if(a&&a.closest&&a.closest('#v-today .grid')&&(/INPUT|TEXTAREA/.test(a.tagName)||a.isContentEditable))return;
  const hs=tmvCols().map(tdaColH);if(Math.abs(hs[0]-hs[1])>260&&Date.now()-(tmvEven.at||0)>4000){tmvEven.at=Date.now();tmvBalance(tmvCols())}};
