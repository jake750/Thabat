/* ============ v3.9: the day between the prayers; settings in Ctrl+K; swipe hint; compact Today (preview) ============ */
/* ---- «your day between the prayers»: one row per prayer with its tasks, focus time and events ---- */
const PDL={open:{},drag:null,addP:null};
const PDL_P=['fajr','dhuhr','asr','maghrib','isha'];
function pdlSlots(k){const D=keyToDate(k),pt=prayerTimes(D),nx=prayerTimes(addDays(D,1));
  return PDL_P.map((p,i)=>({p,t0:pt[p],t1:i<4?pt[PDL_P[i+1]]:nx.fajr,sun:p==='fajr'?pt.sunrise:0}))}
function pdlSegs(k){const segs=timeline(k).map(s=>({cat:s.cat,t0:s.t0,t1:s.t0+s.ms}));const T=S.timer;if(k===todayKey()&&T.mode==='work'&&T.start)segs.push({cat:T.cat,t0:T.start,t1:Date.now(),live:1});return segs}
function pdlRender(){const box=$('#pdlCard');if(!box)return;const k=todayKey(),d=day(k),now=Date.now(),slots=pdlSlots(k),segs=pdlSegs(k),rtl=document.documentElement.dir==='rtl',side=rtl?'right':'left';
  let cur=slots.findIndex(s=>now>=s.t0&&now<s.t1);if(cur<0&&now<slots[0].t0)cur=-1;
  const evs=evsOn(k).filter(e=>e.time&&/^\d\d?:\d\d/.test(e.time)).map(e=>{const [h,m]=e.time.split(':').map(Number),x=keyToDate(k);x.setHours(h,m,0,0);return{e,at:x.getTime()}});
  const rows=slots.map((s,i)=>{const st=i===cur?'now':(i<cur||(cur<0&&false))||now>=s.t1?'past':'next',open=st!=='past'||PDL.open[s.p];
    const tk=d.tasks.filter(x=>x.after===s.p),dn=tk.filter(x=>x.done).length;
    const my=segs.map(g=>({...g,a:Math.max(g.t0,s.t0),b:Math.min(g.t1,s.t1)})).filter(g=>g.b>g.a),ms=my.reduce((a,g)=>a+g.b-g.a,0),W=s.t1-s.t0;
    const ev=evs.filter(x=>x.at>=s.t0&&x.at<s.t1);
    let note='';if(st==='now'){const left=s.t1-now,n=Math.floor(left/18e5);note=`<span class="pdl-now">${t('pdl.now')} · ${t('pdl.left',fmtHM(left))}</span>`}
    const bar=`<div class="pdl-bar">${my.map(g=>`<i class="${g.live?'lv':''}" style="${side}:${((g.a-s.t0)/W*100).toFixed(2)}%;width:${Math.max(.8,(g.b-g.a)/W*100).toFixed(2)}%;background:${catOf(g.cat).color}" title="${esc(catName(catOf(g.cat)))} ${fmtT(g.a)}–${fmtT(g.b)}"></i>`).join('')}${st==='now'?`<i class="nw" style="${side}:${((now-s.t0)/W*100).toFixed(2)}%"></i>`:''}</div>`;
    const sum=[tk.length?t('pdl.tasks',dn,tk.length):'',ms>=6e4?t('pdl.focus',fmtHM(ms)):''].filter(Boolean).join(' · ');
    const body=open?`${bar}${tk.length?`<ul class="pdl-tk">${tk.map(x=>`<li class="${x.done?'done':''}" data-id="${x.id}" draggable="true"><button class="ck" aria-label="✓">${ICON_CHECK}</button><span class="tx" dir="auto">${esc(x.text)}</span></li>`).join('')}</ul>`:''}
      ${ev.map(x=>`<div class="pdl-ev" data-ev="${x.e.id}">📅 <b>${esc(x.e.time)}</b> <span dir="auto">${esc(x.e.title)}</span></div>`).join('')}
      ${st==='now'?`<div class="pdl-cap"><span>${Math.floor((s.t1-now)/18e5)>0?t('blk3',Math.floor((s.t1-now)/18e5)):''}</span>${S.timer.mode==='work'?`<span class="pdl-run">⏱ ${t('pdl.running')}</span>`:S.timer.mode==='idle'?`<button class="btn sm pri" data-start>▶ ${t('pdl.start')}</button>`:''}</div>`:''}
      ${PDL.addP===s.p?`<div class="pdl-addf"><input class="in" id="pdlIn" dir="auto" placeholder="${esc(t('pdl.ph',t('pr.'+s.p)))}"><button class="btn sm pri" id="pdlGo">${t('add')}</button></div>`:st!=='past'?`<button class="pdl-add" data-add>＋ ${t('pdl.add')}</button>`:''}`:'';
    return`<div class="pdl-s s-${st}${open?' open':''}" data-p="${s.p}"><div class="pdl-m"><i></i></div><div class="pdl-b"><div class="pdl-h" ${st==='past'?'data-tog':''}><b>${esc(tpaLabel(s.p))}</b>${plMark(k,s.p)}<span class="pdl-tm">${fmtT(s.t0)} – ${fmtT(s.t1)}</span>${note}${!open&&sum?`<span class="pdl-sum">${sum}</span>`:''}${st==='past'?`<span class="pdl-ch">${open?'▴':'▾'}</span>`:''}</div>${body}</div></div>`}).join('');
  const free=d.tasks.filter(x=>!x.done&&!x.after&&!x.lt);
  box.innerHTML=`<h3><span>${t('pdl.t')}</span><span class="pdl-hint" title="${esc(t('pdl.tip'))}">ⓘ</span></h3>${cur<0?`<div class="pdl-pre">${t('pdl.pre',fmtT(slots[0].t0))}</div>`:''}<div class="pdl">${rows}</div>
    ${free.length?`<div class="pdl-free"><small>${t('pdl.free')}</small><div class="pdl-fl">${free.map(x=>`<span class="pdl-chip" data-id="${x.id}" draggable="true" dir="auto">${esc(x.text)}</span>`).join('')}</div></div>`:''}`;
  pdlBind(box,k,d)}
function pdlBind(box,k,d){const find=id=>d.tasks.find(q=>q.id===id),move=(x,p)=>{if(!x)return;if(p)x.after=p;else delete x.after;delete x.afterShown;save();renderTasks()};
  box.querySelectorAll('[data-tog]').forEach(h=>h.onclick=()=>{const p=h.closest('.pdl-s').dataset.p;PDL.open[p]=!PDL.open[p];pdlRender()});
  box.querySelectorAll('.pdl-tk li').forEach(li=>{const x=find(li.dataset.id);if(!x)return;
    li.querySelector('.ck').onclick=()=>{x.done=!x.done;x.doneAt=x.done?Date.now():null;save();renderTasks();if(x.done)chimeSoft()};
    li.querySelector('.tx').onclick=e=>tpMenu(e.currentTarget,x.after,v=>move(x,v))});
  box.querySelectorAll('.pdl-chip').forEach(c=>c.onclick=e=>tpMenu(e.currentTarget,null,v=>move(find(c.dataset.id),v)));
  box.querySelectorAll('[draggable]').forEach(el=>{el.ondragstart=e=>{PDL.drag=el.dataset.id;e.dataTransfer.setData('text/plain','pdl:'+el.dataset.id);el.classList.add('drag')};el.ondragend=()=>{PDL.drag=null;el.classList.remove('drag');box.querySelectorAll('.dropon').forEach(z=>z.classList.remove('dropon'))}});
  box.querySelectorAll('.pdl-s').forEach(s=>{s.ondragover=e=>{if(!PDL.drag)return;e.preventDefault();s.classList.add('dropon')};s.ondragleave=e=>{if(!s.contains(e.relatedTarget))s.classList.remove('dropon')};s.ondrop=e=>{e.preventDefault();s.classList.remove('dropon');move(find(PDL.drag),s.dataset.p)}});
  box.querySelectorAll('[data-ev]').forEach(el=>el.onclick=()=>openEv(el.dataset.ev,k));
  const sb=box.querySelector('[data-start]');if(sb)sb.onclick=()=>timerAct('start');
  box.querySelectorAll('[data-add]').forEach(b=>b.onclick=()=>{PDL.addP=b.closest('.pdl-s').dataset.p;pdlRender();const i=$('#pdlIn');if(i)i.focus()});
  const inp=$('#pdlIn');if(inp){const add=()=>{const v=inp.value.trim(),p=PDL.addP;if(v){d.tasks.push({id:uid(),text:v,done:false,created:Date.now(),after:p});save()}PDL.addP=v?p:null;renderTasks();if(v)setTimeout(()=>{const n=$('#pdlIn');if(n)n.focus()},0)};
    $('#pdlGo').onclick=add;inp.onkeydown=e=>{if(e.key==='Enter')add();if(e.key==='Escape'){PDL.addP=null;pdlRender()}};inp.onblur=()=>setTimeout(()=>{if(PDL.addP&&!inp.value.trim()&&document.activeElement!==$('#pdlGo')){PDL.addP=null;pdlRender()}},150)}}
function pdlEnsure(){if($('#pdlCard'))return;const st=$('#v-today .grid .stack');if(!st)return;const c=document.createElement('div');c.className='card pdlcard';c.id='pdlCard';st.prepend(c)}
{const _rt=renderTasks;renderTasks=function(){_rt();try{pdlRender()}catch(e){console.error(e)}}}
{const _rg=renderGlass;renderGlass=function(){_rg();try{pdlRender()}catch(e){console.error(e)}}}
{const _ta=timerAct;timerAct=function(...a){const r=_ta(...a);try{pdlRender()}catch(e){}return r}}
{const _ri=applyI18n;applyI18n=function(){_ri();try{pdlRender()}catch(e){}}}
setInterval(()=>{if(curView()==='today'&&!document.hidden&&!(document.activeElement&&document.activeElement.id==='pdlIn'))pdlRender()},6e4);
try{pdlEnsure();pdlRender();if(typeof homeApply==='function')homeApply()}catch(e){console.error(e)}

/* ---- Ctrl+K also finds settings ---- */
function cmdSetHits(q){const Q=AR_NORM(q.trim());if(Q.length<2)return[];const out=[],seen=new Set();
  $$('#v-set .card:not(.sgsec)').forEach(c=>{const h=c.querySelector('h3'),grp=h?h.textContent.replace('▾','').trim():'';
    c.querySelectorAll('.field').forEach(f=>{const l=f.querySelector('label');if(!l)return;const s=l.textContent.trim(),sm=(f.querySelector('small')||{}).textContent||'';if(!s||seen.has(s))return;
      const x=AR_NORM(s),y=AR_NORM(sm),sc=x.startsWith(Q)?3:x.includes(Q)?2:y.includes(Q)?1:0;if(!sc)return;seen.add(s);
      out.push({g:'set',sc,icon:'⚙',label:s,sub:grp,run:()=>{showView('set');setTimeout(()=>{f.scrollIntoView({block:'center'});f.classList.remove('cmdflash');void f.offsetWidth;f.classList.add('cmdflash')},60)}})})});
  return out.sort((a,b)=>b.sc-a.sc).slice(0,6)}
{const _cs=cmdSearch;cmdSearch=function(q){const out=_cs(q);try{return out.concat(cmdSetHits(q))}catch(e){return out}}}

/* ---- phone: a hint at the edge while swiping between pages ---- */
(()=>{const ORDER=['today','cal','brief','boards'],m=$('main');if(!m)return;let sx=0,sy=0,ok=false,el=null;
  const hint=()=>{if(!el){el=document.createElement('div');el.className='swphint';document.body.append(el)}return el};
  const hide=()=>{if(el){el.classList.remove('on','go')}};
  m.addEventListener('touchstart',e=>{const tg=e.target;ok=MOB.matches&&e.touches.length===1&&ORDER.includes(curView())&&!(curView()==='boards'&&nbMode==='boards')&&!tg.closest('input,textarea,select,.hrs,.bwrap,.mushaf,.sttabs,.chips,.ctxbar,.rclist,.dtl,.scrollx,[contenteditable],.modal,.task,.pdl-fl')&&!S.settings.noSwipe;sx=e.touches[0].clientX;sy=e.touches[0].clientY},{passive:true});
  m.addEventListener('touchmove',e=>{if(!ok)return;const p=e.touches[0],dx=p.clientX-sx,dy=p.clientY-sy;if(Math.abs(dy)>45){ok=false;hide();return}if(Math.abs(dx)<24){hide();return}
    const rtl=document.documentElement.dir==='rtl',i=ORDER.indexOf(curView()),dir=(dx<0)!==rtl?1:-1,n=ORDER[i+dir];if(!n){hide();return}
    const h=hint();h.textContent=(dx>0?'‹ ':'')+t(n==='boards'?'nav.notes':'nav.'+n)+(dx<0?' ›':'');h.style.left=dx>0?'10px':'auto';h.style.right=dx<0?'10px':'auto';h.style.setProperty('--p',Math.min(1,Math.abs(dx)/90));h.classList.add('on');h.classList.toggle('go',Math.abs(dx)>=90)},{passive:true});
  m.addEventListener('touchend',hide,{passive:true});m.addEventListener('touchcancel',hide,{passive:true})})();

/* ---- PC: the shortcut number in each page button's tooltip ---- */
function navKeyTips(){$$('nav.side .navpill .navbtn').forEach((b,i)=>{const sp=b.querySelector('span'),n=sp?sp.textContent.trim():'';if(n)b.title=MOB.matches?n:n+'  ('+(i+1)+')'})}
{const _ai=applyI18n;applyI18n=function(){_ai();try{navKeyTips()}catch(e){}}}
try{navKeyTips()}catch(e){}

/* ---- compact Today (on by default): one header card, the full ayah, chips in one row; on PC date | ayah | prayers ---- */
function tdcApply(){const on=S.settings.tdCompact!==false;document.documentElement.classList.toggle('tdc',on);const ev=$('#todayEv');if(ev)ev.classList.toggle('scrollx',on&&MOB.matches)}
{const _at=applyTheme;applyTheme=function(...a){const r=_at(...a);try{tdcApply()}catch(e){}return r}}
{const _rs=renderSettings;renderSettings=function(){_rs();try{toggle($('#tdcT'),S.settings.tdCompact!==false,v=>{S.settings.tdCompact=v;tdcApply()})}catch(e){console.error(e)}}}
try{tdcApply()}catch(e){}
