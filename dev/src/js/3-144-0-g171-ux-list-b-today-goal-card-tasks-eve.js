/* ============ 3.144.0 (g171): UX list B — Today goal card, tasks, event form ============ */
/* 1 near the goal: «بقي 35 د» · 2 the week in seven pieces · 3 the golden run at risk after Isha · 4 the time the goal was reached */
const UXB={run:{},started:{},hold:null};
function uxbRunBefore(k){const c=UXB.run;if(c.k===k&&c.at===S._savedAt)return c.v;let n=0,d=keyToDate(k);for(let i=0;i<400;i++){d=addDays(d,-1);const q=dKey(d);if(!S.days[q])break;const tt=totals(q).tot;if(tt>0&&tt>=goalMs(q))n++;else break}UXB.run={k,at:S._savedAt,v:n};return n}
function uxbGoalAt(k,g,tot){const d=S.days[k];if(!d)return null;if(d.goalAt)return d.goalAt;if(tot<g)return null;let cum=0,at=null;
  for(const s of [...(d.sessions||[])].sort((a,b)=>a.end-b.end)){const len=s.end-s.start;if(cum+len>=g){at=s.start+(g-cum);break}cum+=len}
  if(!at)at=Date.now()-(tot-g);d.goalAt=Math.round(at);save();return d.goalAt}
function uxbGlass(){try{const k=todayKey(),{tot}=totals(k),g=goalMs(k),pc=$('#glPct');if(!pc||!g)return;const p=tot/g;
  pc.classList.toggle('glnear',p>=.8&&p<1);if(p>=.8&&p<1){pc.textContent=t('uxb.left',fmtHM(g-tot));pc.title=Math.floor(p*100)+'%'}else pc.title='';
  let at=$('#glAt');const ga=p>=1?uxbGoalAt(k,g,tot):null;
  if(ga){if(!at){pc.insertAdjacentHTML('afterend','<div class="glat" id="glAt"></div>');at=$('#glAt')}at.textContent=t('uxb.at',fmtT(ga))}else if(at){at.remove();at=null}
  /* the week in seven pieces */
  const wk=$('#glWeek');if(wk){let w7=$('#glWk7');if(!w7){wk.insertAdjacentHTML('afterend','<div class="glwk7" id="glWk7" aria-hidden="true"></div>');w7=$('#glWk7')}
    const ks=periodKeys('week',keyToDate(k));const h=ks.map(q=>{const gg=goalMs(q),tt=q>k?0:totals(q).tot,f=gg?Math.min(1,tt/gg):0,ok=tt>0&&f>=1;
      return`<i class="${ok?'ok':q===k?'now':q>k?'fut':'miss'}" title="${esc(dayLabel(q))} · ${fmtHM(tt)}"><b style="width:${(ok?100:q===k?f*100:0).toFixed(0)}%"></b></i>`}).join('');if(w7.innerHTML!==h)w7.innerHTML=h}
  /* the golden run at risk */
  let rk=$('#glRisk');const pt=prayerTimes(keyToDate(k)),run=uxbRunBefore(k);
  if(p<1&&run>=2&&Date.now()>=pt.isha){const txt=t('uxb.risk',run,fmtHM(g-tot));if(!rk){(at||pc).insertAdjacentHTML('afterend','<div class="glrisk" id="glRisk"></div>');rk=$('#glRisk')}if(rk.textContent!==txt)rk.textContent=txt}else if(rk)rk.remove()}catch(e){console.error(e)}}
hookFn('renderGlass',()=>renderGlass,f=>{renderGlass=f},'post',uxbGlass);

/* 6 a task you started the timer on stays at the top of its period with «بدأتها» */
function uxbStarted(){const c=UXB.started,tid=S.timer.task&&S.timer.task.id;const sk=S._savedAt+'|'+(((S.days[todayKey()]||{}).sessions||[]).length);if(c.at===sk&&c.t===tid)return c.v;const v=new Set(),tk=todayKey();let d=keyToDate(tk);
  for(let i=0;i<14;i++){const q=dKey(d);((S.days[q]||{}).sessions||[]).forEach(s=>{if(s.task)v.add(s.task)});d=addDays(d,-1)}
  if(tid&&S.timer.mode==='work')v.add(tid);UXB.started={at:sk,t:tid,v};return v}
function uxbTasks(){try{const d=day(todayKey()),st=uxbStarted(),ul=$('#tasks');if(!ul)return;
  [...ul.querySelectorAll('.task')].reverse().forEach(li=>{const x=d.tasks.find(q=>q.id===li.dataset.id);if(!x||x.done||!st.has(x.id))return;const tb=li.querySelector('.tb');
    if(tb&&!tb.querySelector('.tkst'))tb.insertAdjacentHTML('beforeend',`<span class="tkst">${esc(t('uxb.started'))}</span>`);
    let h=li.previousElementSibling;while(h&&!h.classList.contains('tkgh'))h=h.previousElementSibling;
    const first=h?h.nextElementSibling:ul.firstElementChild;if(first===li)return;if(!h&&first&&first.classList.contains('isfrog')){first.after(li);return}if(h)h.after(li);else ul.prepend(li)});
  uxbHoldPlace()}catch(e){console.error(e)}}
function uxbHoldPlace(){const H=UXB.hold,ul=$('#tasks');if(!H||!ul)return;const li=ul.querySelector(`.task[data-id="${H.id}"]`);if(!li)return;li.classList.add('uxbjust');
  const nx=H.next&&ul.querySelector(`.task[data-id="${H.next}"]`),pv=H.prev&&ul.querySelector(`.task[data-id="${H.prev}"]`);
  if(nx&&nx!==li){if(li.nextElementSibling!==nx)ul.insertBefore(li,nx)}else if(pv&&pv!==li){if(li.previousElementSibling!==pv)pv.after(li)}}
hookFn('renderTasks',()=>renderTasks,f=>{renderTasks=f},'post',uxbTasks);

/* 20 a ticked task stays two seconds where it was, then slides down */
document.addEventListener('click',e=>{const ck=e.target.closest&&e.target.closest('#tasks .task .ck');if(!ck||document.documentElement.classList.contains('rmotion'))return;const li=ck.closest('.task');if(li.classList.contains('done'))return;
  const sib=(el,dir)=>{let s=el[dir];while(s&&!(s.classList.contains('task')&&!s.classList.contains('done')))s=s[dir];return s&&s.dataset.id};
  clearTimeout(UXB.hT);UXB.hold={id:li.dataset.id,next:sib(li,'nextElementSibling'),prev:sib(li,'previousElementSibling')};uxbHoldObs();setTimeout(uxbHoldPlace,0);
  UXB.hT=setTimeout(()=>{const ul=$('#tasks');UXB.hold=null;if(!ul)return;const before=new Map([...ul.children].filter(c=>c.dataset.id).map(c=>[c.dataset.id,c.getBoundingClientRect().top]));renderTasks();
    const z=uiZoom();[...$('#tasks').children].forEach(c=>{const y=before.get(c.dataset.id);if(y==null)return;const dy=(y-c.getBoundingClientRect().top)/z;if(Math.abs(dy)>1&&c.animate)c.animate([{transform:`translateY(${dy}px)`},{transform:'none'}],{duration:340,easing:'cubic-bezier(.2,.8,.2,1)'})})},2000)},true);

function uxbHoldObs(){const ul=$('#tasks');if(!ul||UXB.mo)return;UXB.mo=new MutationObserver(()=>{if(UXB.hold&&!UXB.mv){UXB.mv=true;try{uxbHoldPlace()}finally{UXB.mv=false}}});UXB.mo.observe(ul,{childList:true})}
/* 7 «يومك في سطور»: what you did first, then a quiet line of what was missed */
hookFn('uxRecap',()=>uxRecap,f=>{uxRecap=f},'post',function(){try{const c=$('#uxRecap');if(!c)return;const k=todayKey(),miss=PDL_P.filter(p=>plStatus(k,p)==='miss').map(p=>t('pr.'+p)),d=day(k),left=d.tasks.filter(x=>!x.lt&&!x.done).length;
  let el=c.querySelector('.uxrc-miss');const parts=[];if(miss.length)parts.push(miss.join('، '));if(left)parts.push(t('uxb.tl',left));
  if(!parts.length){if(el)el.remove();return}const html=`<span>${esc(t('uxb.missed'))}</span> ${esc(parts.join(' · '))}`;
  if(!el){const tm=c.querySelector('.uxrc-tm');if(tm)tm.insertAdjacentHTML('beforebegin','<div class="uxrc-miss"></div>');else c.insertAdjacentHTML('beforeend','<div class="uxrc-miss"></div>');el=c.querySelector('.uxrc-miss')}el.innerHTML=html}catch(e){}});

/* 9 a task typed during a prayer period goes «after» that prayer (shown in the preview, removable) */
const UXB9={off:false};
function uxbCurSlot(){try{const p=pdlSlotOf(todayKey(),Date.now());return p&&PDL_P.includes(p)?p:null}catch(e){return null}}
function uxbPreview(){const i=$('#taskIn');if(!i)return;let el=$('#uxbSlot');const lt=$('#ltOpts'),plain=!lt||lt.hidden,v=i.value.trim(),p=uxbCurSlot(),ps=v&&plain?uxParse(i.value):null;
  const show=v&&p&&!UXB9.off&&plain&&!(ps&&(ps.after||ps.d||ps.rec));
  if(!show){if(el)el.remove();return}if(!el){const box=i.closest('.addtask');if(!box)return;const after=$('#uxParse')||box;after.insertAdjacentHTML('afterend','<div class="uxparse uxbslot" id="uxbSlot"></div>');el=$('#uxbSlot')}
  el.innerHTML=`<span>${esc(t('uxb.slot'))}</span> <b>${esc(tpaLabel(p))}</b> <button type="button" class="uxbx" aria-label="${esc(t('uxb.slotX'))}" title="${esc(t('uxb.slotX'))}">✕</button>`;
  el.querySelector('.uxbx').onclick=()=>{UXB9.off=true;el.remove();i.focus()}}
if($('#taskIn'))$('#taskIn').addEventListener('input',()=>{if(!$('#taskIn').value.trim())UXB9.off=false;uxbPreview()});
{const _at=addTask;addTask=function(...a){const k=todayKey(),p=uxbCurSlot(),before=new Set(day(k).tasks.map(x=>x.id)),off=UXB9.off,lt=$('#ltOpts'),plain=!lt||lt.hidden,ps=plain?uxParse($('#taskIn').value):null;const r=_at(...a);
  try{if(p&&!off&&plain&&!(ps&&(ps.after||ps.d||ps.rec))){let ch=false;day(k).tasks.forEach(x=>{if(!before.has(x.id)&&!x.after&&!x.at&&!x.recurId){x.after=p;ch=true}});if(ch){save();renderTasks()}}}catch(e){}
  UXB9.off=false;const el=$('#uxbSlot');if(el)el.remove();return r};$('#taskAdd').onclick=addTask;$('#taskIn').onkeydown=e=>{if(e.key==='Enter')addTask()}}

/* 11 the task box shows rotating examples of the smart input */
setInterval(()=>{const i=$('#taskIn');if(!i||i.value||document.activeElement===i||document.hidden)return;const ex=t('uxb.ex').split('|');UXB.exI=((UXB.exI||0)+1)%ex.length;i.placeholder=ex[UXB.exI]},7000);

/* 12 new event: the extra fields fold under «المزيد»; 13 its time = the first free half hour; 14 a reminder per type */
const UXB_TREM={study:15,work:30,family:60};
hookFn('renderEvEd',()=>renderEvEd,f=>{renderEvEd=f},'post',function(){try{const box=$('#evBox');if(!box||!EVE||!EVE._new||box.querySelector('.evmore'))return;
  const parts=[$('#evRep')&&$('#evRep').closest('.evrow'),$('#evTyp'),box.querySelector('.evcols'),$('#evN')].filter(Boolean);if(!parts.length)return;
  const det=document.createElement('details');det.className='evmore';det.innerHTML=`<summary>${esc(t('uxb.more'))}</summary><div class="evmorein"></div>`;parts[0].before(det);const inn=det.querySelector('.evmorein');parts.forEach(x=>inn.append(x));
  const hint=$('#evHint');if(hint)inn.prepend(hint);
  box.querySelectorAll('[data-typ]').forEach(b=>b.addEventListener('click',()=>{const m=(S.settings.evTypRem||{})[b.dataset.typ]??UXB_TREM[b.dataset.typ];const s=$('#evRem');if(m==null||!s||s.dataset.uxbt==='man')return;if(s.querySelector(`option[value="${m}"]`)){s.value=String(m);s.dispatchEvent(new Event('change'))}}));
  const s=$('#evRem');if(s)s.addEventListener('change',e=>{if(e.isTrusted)s.dataset.uxbt='man'});
  const sv=$('#evSave'),o=sv&&sv.onclick;if(sv)sv.onclick=(...a)=>{const typ=EVE.typ,r=$('#evRem'),man=r&&r.dataset.uxbt==='man',v=r&&r.value;o&&o(...a);if(typ&&man&&v!==''&&v!=null){(S.settings.evTypRem=S.settings.evTypRem||{})[typ]=+v;save()}}}catch(e){console.error(e)}});
function uxbHm(s){const [h,m]=String(s).split(':').map(Number);return(h||0)*60+(m||0)}
function uxbFreeSlot(k){const now=new Date();let m=k===todayKey()?Math.ceil((now.getHours()*60+now.getMinutes()+1)/30)*30:9*60;
  const busy=evsOn(k).filter(e=>e.time).map(e=>{const a=uxbHm(e.time),b=e.end?uxbHm(e.end):a+30;return[a,b>a?b:a+30]});
  for(;m<=23*60;m+=30){if(!busy.some(([a,b])=>m<b&&m+30>a))return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0')}return''}
hookFn('openEv',()=>openEv,f=>{openEv=f},'post',function(){try{if(!EVE||!EVE._new||EVE.time||EVE.date<todayKey())return;const tm=uxbFreeSlot(EVE.date);if(!tm)return;EVE.time=tm;const i=$('#evTm');if(i){i.value=tm;i.dispatchEvent(new Event('input',{bubbles:true}))}}catch(e){}});

/* 15 the task «⋯»: the four commands you use most come first */
function uxbMKey(b){for(const a of b.attributes)if(a.name.startsWith('data-'))return a.name+'='+a.value;return'tx:'+b.textContent.trim().slice(0,24)}
function uxbUse(){try{return JSON.parse(localStorage.getItem('thabat.tkmUse')||'{}')}catch(e){return{}}}
hookFn('tkMenu',()=>tkMenu,f=>{tkMenu=f},'post',function(){setTimeout(()=>{const p=$('#ppPop');if(!p||p.dataset.uxb)return;p.dataset.uxb=1;const U=uxbUse();
  const bs=[...p.querySelectorAll(':scope>button')],top=bs.filter(b=>(U[uxbMKey(b)]||0)>=2).sort((a,b)=>(U[uxbMKey(b)]||0)-(U[uxbMKey(a)]||0)).slice(0,4);
  if(top.length){const h=p.querySelector(':scope>.aymh'),sep=document.createElement('div');sep.className='tkmsep';if(h)h.after(sep);else p.prepend(sep);top.forEach(b=>sep.before(b))}
  p.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||b.parentNode!==p)return;const U2=uxbUse(),k=uxbMKey(b);U2[k]=(U2[k]||0)+1;try{localStorage.setItem('thabat.tkmUse',JSON.stringify(U2))}catch(x){}},true)},0)});

/* 17 the selection bar says what a button will do before you press it */
hookFn('uxSelBar',()=>uxSelBar,f=>{uxSelBar=f},'post',function(){const bar=$('#uxSel');if(!bar)return;let h=bar.querySelector('.uxselh');if(!h){bar.insertAdjacentHTML('beforeend','<small class="uxselh" aria-live="polite"></small>');h=bar.querySelector('.uxselh')}
  bar.querySelectorAll('button').forEach(b=>{if(b.dataset.uxbh)return;b.dataset.uxbh=1;const lab=()=>(b.getAttribute('aria-label')||b.title||b.textContent).replace(/\s+/g,' ').trim();
    const on=()=>{const L_=lab();if(L_&&L_!=='✕')h.textContent=t('uxb.selh',L_,UXT.sel.size)},off=()=>{h.textContent=''};b.addEventListener('pointerenter',on);b.addEventListener('focus',on);b.addEventListener('pointerleave',off);b.addEventListener('blur',off)})});

/* 19 phone: quick chips above the keyboard while typing a task */
function uxbChips(){const ar=LANG==='ar',now=Date.now(),pt=prayerTimes(keyToDate(todayKey()));const nx=PDL_P.find(p=>pt[p]>now);
  return[[ar?'غدًا':'tomorrow',t('uxb.c.tm')],nx?[(ar?'بعد ':'after ')+t('pr.'+nx),t('uxb.c.after',t('pr.'+nx))]:null,[ar?'30د':'30m','30'],['!',t('uxb.c.pri')]].filter(Boolean)}
function uxbChipBar(){const i=$('#taskIn');let bar=$('#tqch');if(!MOB.matches||!i||document.activeElement!==i){if(bar)bar.remove();return}
  if(!bar){document.body.insertAdjacentHTML('beforeend','<div class="tqch" id="tqch" role="toolbar"></div>');bar=$('#tqch');
    bar.addEventListener('pointerdown',e=>e.preventDefault());bar.addEventListener('mousedown',e=>e.preventDefault());
    bar.addEventListener('click',e=>{const b=e.target.closest('[data-tq]');if(!b)return;const v=b.dataset.tq;i.value=(i.value.replace(/\s+$/,'')+' '+v+' ').replace(/^\s+/,'');i.dispatchEvent(new Event('input',{bubbles:true}));i.focus()})}
  bar.innerHTML=uxbChips().map(([v,l])=>`<button type="button" data-tq="${esc(v)}" title="${esc(l)}">${esc(v)}</button>`).join('');uxbChipPlace()}
function uxbChipPlace(){const bar=$('#tqch');if(!bar)return;const vv=window.visualViewport,z=uiZoom(),bottom=vv?vv.offsetTop+vv.height:innerHeight;bar.style.top=Math.max(0,(bottom-bar.offsetHeight*z-6)/z)+'px'}
if($('#taskIn')){$('#taskIn').addEventListener('focus',()=>setTimeout(uxbChipBar,60));$('#taskIn').addEventListener('blur',()=>setTimeout(uxbChipBar,120))}
if(window.visualViewport){visualViewport.addEventListener('resize',uxbChipPlace);visualViewport.addEventListener('scroll',uxbChipPlace)}

