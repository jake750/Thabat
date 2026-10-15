/* ============ v3.61 Today layouts (cards / the day's line between the prayers / bento / three columns) and the geometric style ============ */
/* the Islamic geometric look is a style choice (any colour), next to minimal and glass; the «mosque» colour keeps it too */
STYLES.geo={ar:'هندسي إسلامي',en:'Islamic geometric'};
{hookFn('applyTheme',()=>applyTheme,f=>{applyTheme=f},'post',function(){const st=S.settings,geo=st.style==='geo',on=geo,h=document.documentElement;h.classList.toggle('st-geo',geo);h.classList.toggle('th-masjid',on);
  let b=$('#msjBg');if(on&&!b){b=document.createElement('div');b.id='msjBg';b.setAttribute('aria-hidden','true');const a=$('#aurora');if(a)a.insertAdjacentElement('afterend',b);else document.body.prepend(b)}else if(!on&&b)b.remove()})}
/* layouts */
const TDL_K=['cards','line','bento','cols'];
try{if(SGA_MAIN['set.look']&&!SGA_MAIN['set.look'].includes('tdl.set'))SGA_MAIN['set.look'].push('tdl.set')}catch(e){}
function tdl(){const v=S.settings.tdLayout;return TDL_K.includes(v)?v:'cards'}
function tdlWideOk(){return!MOB.matches&&innerWidth/(uiZoom()||1)>=1100}
function tdlApply(){const v=tdl(),h=document.documentElement;TDL_K.forEach(k=>h.classList.toggle('tdl-'+k,k===v&&k!=='cards'));h.classList.toggle('tdl-colsw',v==='cols'&&tdlWideOk());
  if(v!=='cards'){h.classList.remove('wide3');if($('#uxCol3'))try{uxUnbalance()}catch(e){}}
  if(v!=='bento')$$('#v-today .bxo').forEach(c=>{c.classList.remove('bxo');c.style.gridRow=''});
  if(v==='line')tdlLine();else $('#tdLine')?.remove();if(v==='cols')tdsRender();else tdsHome();if(v==='bento'){bntPrep();bntSums()}}
/* three columns on wide windows would fight the other layouts */
{const _f=uxWide;uxWide=function(...a){if(tdl()!=='cards'){document.documentElement.classList.remove('wide3');if($('#uxCol3'))try{uxUnbalance()}catch(e){}document.documentElement.classList.toggle('tdl-colsw',tdl()==='cols'&&tdlWideOk());return}return _f(...a)}}
{hookFn('renderToday',()=>renderToday,f=>{renderToday=f},'post',function(){try{tdlApply()}catch(e){console.error(e)}})}
{hookFn('renderTasks',()=>renderTasks,f=>{renderTasks=f},'post',function(){try{const v=tdl();if(v==='line')tdlLine();else if(v==='cols')tdsRender();else if(v==='bento')bntSums()}catch(e){}})}
setInterval(()=>{try{if(curView()==='today'&&!document.hidden){const v=tdl();if(v==='line')tdlLine();else if(v==='cols')tdsRender()}}catch(e){}},60000);
addEventListener('resize',()=>{clearTimeout(tdlApply.rt);tdlApply.rt=setTimeout(()=>{try{document.documentElement.classList.toggle('tdl-colsw',tdl()==='cols'&&tdlWideOk())}catch(e){}},150)});
/* 2 · the day's line between the prayers */
function tdlItems(k,slot,last){const d=day(k),out=[];
  d.tasks.forEach(x=>{const a=pdlAt(k,x);if(a!=null){if(a>=slot.t0&&(a<slot.t1||last))out.push({k:'t',x,at:a})}else if(x.after===slot.p)out.push({k:'t',x,at:null})});
  evsOn(k).forEach(e=>{if(!e.time||!/^\d\d?:\d\d/.test(e.time))return;const [h,m]=e.time.split(':').map(Number),D=keyToDate(k);D.setHours(h,m,0,0);const a=D.getTime();if(a>=slot.t0&&(a<slot.t1||last))out.push({k:'e',e,at:a})});
  return out.sort((A,B)=>(A.at==null?1:0)-(B.at==null?1:0)||(A.at||0)-(B.at||0)||(A.x&&A.x.done?1:0)-(B.x&&B.x.done?1:0))}
function tdlFocus(k,slot){let ms=0;pdlSegs(k).forEach(s=>{const a=Math.max(s.t0,slot.t0),b=Math.min(s.t1,slot.t1);if(b>a)ms+=b-a});return ms}
function tdlLine(){const grid=$('#v-today .grid');if(!grid)return;let L_=$('#tdLine');if(!L_){L_=document.createElement('div');L_.id='tdLine';L_.className='card';grid.prepend(L_)}
  const k=todayKey(),d=day(k),now=Date.now(),slots=pdlSlots(k),pt=prayerTimes(keyToDate(k));
  const rows=slots.map((s,i)=>{const st=plStatus(k,s.p),cur=now>=s.t0&&now<s.t1,past=now>=s.t1,it=tdlItems(k,s,i===4),fm=tdlFocus(k,s),pc=cur?Math.round((now-s.t0)/(s.t1-s.t0)*100):past?100:0;
    return`<div class="tdlp ${cur?'cur':''} ${past?'past':''}" data-p="${s.p}"><div class="tdln"><i class="tdld ${st||''}"></i><b>${t('pr.'+s.p)}</b><span class="tdlt">${fmtT(s.t0)}</span>${fm?`<span class="tdlf">${t('tdl.focus',fmtHM(fm))}</span>`:''}</div>
     ${s.sun?`<div class="tdlsun">${t('tdl.sun',fmtT(s.sun))}</div>`:''}
     ${cur?`<div class="tdlnow"><div class="tdlbar"><i style="width:${pc}%"></i></div><span>${t('tdl.left',fmtHM(s.t1-now),t('pr.'+(slots[i+1]?slots[i+1].p:'fajr')))}</span>${S.timer.mode!=='work'?`<button class="btn sm pri" data-tdlgo>▶ ${t('tdl.start')}</button>`:''}</div>`:''}
     <div class="tdli">${it.map(o=>o.k==='t'?`<div class="tdlr ${o.x.done?'done':''}" data-id="${o.x.id}"><button class="tdlck" aria-label="✓">${o.x.done?'✓':''}</button><span class="tdlx" dir="auto">${esc(o.x.text)}</span>${o.at!=null?`<span class="tdlt">${fmtT(o.at)}</span>`:''}</div>`
       :`<div class="tdlr ev"><i style="background:${esc(o.e.col||o.e.color||'var(--water)')}"></i><span class="tdlx" dir="auto">${esc(o.e.title||'')}</span><span class="tdlt">${esc(o.e.time)}</span></div>`).join('')||(cur?`<div class="tdle">${t('tdl.empty')}</div>`:'')}</div></div>`}).join('');
  const free=d.tasks.filter(x=>!x.after&&pdlAt(k,x)==null&&!x.done);
  L_.innerHTML=`<h3><span>${t('tdl.title')}</span><small class="muted">${t('tdl.done',d.tasks.filter(x=>x.done).length,d.tasks.length)}</small></h3><div class="tdlw">${rows}</div>${free.length?`<div class="tdlfree"><small>${t('tdl.free')}</small>${free.map(x=>`<button class="chip sm" data-fid="${x.id}" dir="auto">${esc(x.text)}</button>`).join('')}</div>`:''}`;
  L_.querySelectorAll('.tdlr[data-id] .tdlck').forEach(b=>b.onclick=()=>{const x=d.tasks.find(q=>q.id===b.closest('.tdlr').dataset.id);if(!x)return;x.done=!x.done;x.doneAt=x.done?Date.now():null;save();renderTasks();if(x.done){try{chimeSoft()}catch(e){}}});
  L_.querySelectorAll('.tdlr[data-id] .tdlx').forEach(s=>s.onclick=()=>{const x=d.tasks.find(q=>q.id===s.closest('.tdlr').dataset.id);if(x)try{pdlTimeMenu(s,k,x)}catch(e){}});
  L_.querySelectorAll('[data-fid]').forEach(b=>b.onclick=()=>{const x=d.tasks.find(q=>q.id===b.dataset.fid);if(x)try{pdlTimeMenu(b,k,x)}catch(e){}});
  const go=L_.querySelector('[data-tdlgo]');if(go)go.onclick=()=>timerAct('start')}
/* 3 · bento: tiles; on phones small tiles that open in place when tapped */
function bntPrep(){$$('#v-today .grid .stack>.card').forEach(c=>{if(c.dataset.bnt)return;c.dataset.bnt='1';const b=document.createElement('button');b.className='bntx';b.type='button';b.setAttribute('aria-label',t('bnt.close'));b.textContent='⤡';b.onclick=e=>{e.stopPropagation();bntClose(c)};c.appendChild(b);BNT_RO.observe(c)})}
function bntSum(c){const tx=s=>{const e=c.querySelector(s);return e?e.textContent.trim():''},k=todayKey(),d=day(k);
  if(c.querySelector('#glPct'))return[tx('#glPct'),tx('#glSub')];if(c.querySelector('#tDisp'))return[tx('#tDisp'),tx('#tState')];
  if(c.querySelector('#tasks')){const n=d.tasks.length,dn=d.tasks.filter(x=>x.done).length;const nx=d.tasks.find(x=>!x.done);return[n?dn+' / '+n:'0',nx?nx.text:t('tasks.empty')]}
  if(c.id==='pdlCard'){const now=Date.now(),sl=pdlSlots(k),i=sl.findIndex(x=>now>=x.t0&&now<x.t1),s=sl[i];return s?[t('pr.'+s.p),t('tdl.left',fmtHM(s.t1-now),t('pr.'+(sl[i+1]?sl[i+1].p:'fajr')))]:['','']}
  if(c.querySelector('#mediaList'))return[String(c.querySelectorAll('#mediaList>li').length),''];if(c.querySelector('#summary')){const v=$('#summary').value.trim();return['',v?v.slice(0,70):t('sum.title')]}
  const parts=[],w=document.createTreeWalker(c,NodeFilter.SHOW_TEXT);let n;while((n=w.nextNode())&&parts.length<14){if(n.parentElement.closest('h3,.bntsum,.bntx,button,script,style'))continue;const v=n.nodeValue.replace(/\s+/g,' ').trim();if(v)parts.push(v)}return['',parts.join(' · ').slice(0,90)]}
function bntSums(){if(tdl()!=='bento')return;$$('#v-today .grid .stack>.card').forEach(c=>{let s=c.querySelector(':scope>.bntsum');if(!s){s=document.createElement('div');s.className='bntsum';const h=c.querySelector(':scope>h3');if(h)h.after(s);else c.prepend(s)}try{const [a,b]=bntSum(c);s.innerHTML=`${a?`<b>${esc(a)}</b>`:''}${b?`<small dir="auto">${esc(b)}</small>`:''}`}catch(e){}})}
function bntOpen(c){$$('#v-today .bxo').forEach(o=>{if(o!==c)bntClose(o)});c.classList.add('bxo');bntFit(c);
  setTimeout(()=>{try{c.scrollIntoView({block:'nearest',behavior:'smooth'})}catch(e){}},30)}
function bntClose(c){c.classList.remove('bxo');c.style.gridRow=''}
document.addEventListener('click',e=>{if(tdl()!=='bento')return;const c=e.target.closest('#v-today .grid .stack>.card');if(!c||c.classList.contains('bxo')||e.target.closest('.bntx'))return;e.preventDefault();e.stopPropagation();bntOpen(c)},true);
/* an open tile grows when its content grows (a task added, a list opened) */
function bntFit(c){if(!c.classList.contains('bxo'))return;const g=$('#v-today .grid'),cs=getComputedStyle(g),rh=parseFloat(cs.gridAutoRows)||150,gap=parseFloat(cs.rowGap)||10;c.style.gridRow='span '+Math.max(1,Math.ceil((c.scrollHeight+gap)/(rh+gap)))}
const BNT_RO=new ResizeObserver(es=>es.forEach(en=>{const c=en.target;if(c.classList.contains('bxo')&&!c._bntR){c._bntR=1;setTimeout(()=>{c._bntR=0;bntFit(c)},60)}}));
/* 4 · three columns on the PC: the day | the work | details of what you pick (no windows) */
const TDS={sel:null};
document.addEventListener('click',e=>{if(tdl()!=='cols'||!document.documentElement.classList.contains('tdl-colsw'))return;const li=e.target.closest('#tasks .task');if(!li||e.target.closest('.ck,.del,.pp,button'))return;TDS.sel=li.dataset.id;tdsRender()},true);
function tdsHome(){const pc=$('#pdlCard'),W=$('#tdCol3');if(pc&&W&&pc.parentNode===W){const h=TDS.home;if(h&&h.p&&h.p.isConnected)h.p.insertBefore(pc,h.n&&h.n.parentNode===h.p?h.n:null);else{const s=$('#v-today .grid>.stack');if(s)s.appendChild(pc)}}if(W)W.remove();$('#tdSide')?.remove()}
function tdsRender(){const grid=$('#v-today .grid');if(!grid)return;if(!document.documentElement.classList.contains('tdl-colsw')){tdsHome();return}let W=$('#tdCol3');if(!W){W=document.createElement('div');W.id='tdCol3';grid.appendChild(W)}else if(W.parentNode!==grid||W!==grid.lastElementChild)grid.appendChild(W);
  let P=$('#tdSide');if(!P){P=document.createElement('aside');P.id='tdSide';P.className='card'}if(P.parentNode!==W)W.prepend(P);const pc=$('#pdlCard');if(pc&&pc.parentNode!==W){TDS.home={p:pc.parentNode,n:pc.nextSibling};W.appendChild(pc)}
  const k=todayKey(),d=day(k),x=TDS.sel&&d.tasks.find(q=>q.id===TDS.sel);$$('#tasks .task').forEach(li=>li.classList.toggle('tdsel',!!x&&li.dataset.id===x.id));
  if(!x){TDS.sel=null;const now=Date.now(),slots=pdlSlots(k),nx=slots.find(s=>s.t0>now),up=[];d.tasks.forEach(q=>{const a=pdlAt(k,q);if(a!=null&&a>now-30*6e4&&!q.done)up.push({a,n:q.text})});
    evsOn(k).forEach(e=>{if(!e.time||!/^\d\d?:\d\d/.test(e.time))return;const [h,m]=e.time.split(':').map(Number),D=keyToDate(k);D.setHours(h,m,0,0);if(D.getTime()>now-30*6e4)up.push({a:D.getTime(),n:e.title||''})});up.sort((a,b)=>a.a-b.a);
    P.innerHTML=`<h3>${t('tds.t')}</h3>${nx?`<div class="tdsnx"><small>${t('tds.next')}</small><b>${t('pr.'+nx.p)} · ${fmtT(nx.t0)}</b><span>${t('tds.in',fmtHM(nx.t0-now))}</span></div>`:''}
     <small class="muted">${t('tds.up')}</small><div class="tdsul">${up.slice(0,6).map(o=>`<div><span>${fmtT(o.a)}</span><span dir="auto">${esc(o.n)}</span></div>`).join('')||`<div class="empty">${t('tds.none')}</div>`}</div><p class="muted tdshint">${t('tds.hint')}</p>`;return}
  const sel=v=>v?'selected':'';P.innerHTML=`<h3><span>${t('tds.task')}</span><button class="btn sm ghost" id="tdsX" aria-label="✕">✕</button></h3>
   <textarea class="in" id="tdsT" dir="auto" rows="2">${esc(x.text)}</textarea><label class="tdsck"><input type="checkbox" id="tdsD" ${x.done?'checked':''}> ${t('tds.done')}</label>
   <label class="eidr"><span>${t('tds.after')}</span><select class="in" id="tdsA"><option value="">—</option>${PDL_P.map(p=>`<option value="${p}" ${sel(x.after===p)}>${t('pr.'+p)}</option>`).join('')}</select></label>
   <label class="eidr"><span>${t('tds.at')}</span><input class="in" type="time" id="tdsAt" value="${esc(x.at||'')}"></label>
   <label class="eidr"><span>${t('tds.est')}</span><input class="in num" type="number" min="5" max="600" step="5" id="tdsE" value="${x.est||''}" placeholder="30"></label>
   <label class="eidr"><span>${t('tds.pri')}</span><select class="in" id="tdsP"><option value="1" ${sel(x.pri===1)}>${t('tds.p1')}</option><option value="2" ${sel(!x.pri)}>${t('tds.p2')}</option><option value="3" ${sel(x.pri===3)}>${t('tds.p3')}</option></select></label>
   <div class="row" style="gap:6px;flex-wrap:wrap"><button class="btn sm" id="tdsM">⋯ ${t('tds.more')}</button><button class="btn sm ghost" id="tdsDel">✕ ${t('tds.del')}</button></div>`;
  $('#tdsX').onclick=()=>{TDS.sel=null;tdsRender()};$('#tdsT').onchange=e=>{const v=e.target.value.trim();if(v){x.text=v;save();renderTasks()}};$('#tdsD').onchange=e=>{x.done=e.target.checked;x.doneAt=x.done?Date.now():null;save();renderTasks()};
  $('#tdsA').onchange=e=>{if(e.target.value)x.after=e.target.value;else delete x.after;save();renderTasks()};$('#tdsAt').onchange=e=>pdlSetAt(k,x,e.target.value||null);
  $('#tdsE').onchange=e=>{const v=+e.target.value;if(v>0)x.est=v;else delete x.est;save();renderTasks()};$('#tdsP').onchange=e=>priSet(k,x,+e.target.value);
  $('#tdsM').onclick=e=>tkMenu(e.currentTarget,k,x.id);$('#tdsDel').onclick=()=>{const li=$(`#tasks .task[data-id="${x.id}"] .del`);TDS.sel=null;if(li)li.click();else tdsRender()}}
/* settings: one row under «compact Today» */
{hookFn('renderSettings',()=>renderSettings,f=>{renderSettings=f},'post',function(){try{const host=$('#pdlvRow');if(!host||$('#tdlRow'))return;const v=tdl();
  host.insertAdjacentHTML('afterend',`<div class="field" id="tdlRow"><div><label data-i18n="tdl.set">${t('tdl.set')}</label><small>${t('tdl.setS')}</small></div><div class="seg tdlseg">${TDL_K.map(k=>`<button data-tdl="${k}" class="${v===k?'on':''}">${t('tdl.k.'+k)}</button>`).join('')}</div></div>`);
  $$('#tdlRow [data-tdl]').forEach(b=>b.onclick=()=>{S.settings.tdLayout=b.dataset.tdl;save();$$('#tdlRow [data-tdl]').forEach(x=>x.classList.toggle('on',x===b));tdlApply();try{uxWide()}catch(e){}toast(t('tdl.ok',t('tdl.k.'+b.dataset.tdl)))})}catch(e){console.error(e)}})}
{const _cc=cmdCommands;cmdCommands=function(...a){const L_=_cc(...a);TDL_K.forEach(k=>L_.push({icon:'▦',label:t('tdl.set')+': '+t('tdl.k.'+k),run:()=>{S.settings.tdLayout=k;save();showView('today');tdlApply();try{uxWide()}catch(e){}},kw:'layout تخطيط '+k}));return L_}}
setTimeout(()=>{try{tdlApply()}catch(e){}},300);
{hookFn('pdlRender',()=>pdlRender,f=>{pdlRender=f},'post',function(){try{bntSums()}catch(e){}})}
setInterval(()=>{try{if(tdl()==='bento'&&MOB.matches&&curView()==='today'&&!document.hidden)bntSums()}catch(e){}},5000);
