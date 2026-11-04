/* ============ v3.166.0 thirteenth list I: health and habits — habits N times a week, habits tied to a prayer period, order by dragging, a year map per habit, reasons for missing, sleep debt, sport minutes against a goal, walking distance, a weekly health card, ready challenges and «again», «get up» that waits for the prayer ============ */
const HB7={drag:null};
function hb7W0(k){const d=keyToDate(k||todayKey());d.setDate(d.getDate()-((d.getDay()+6)%7));return d}
function hb7Week(h,k){const w0=hb7W0(k);let n=0;for(let i=0;i<7;i++){const kk=dKey(addDays(w0,i));if(kk>todayKey())break;if(hbDone(h,kk))n++}return n}
/* 201: a habit done N times a week keeps its streak in weeks */
{const _s=hbStreak;hbStreak=function(h,...a){try{if(h&&h.wk){let n=0,w=hb7W0();if(hb7Week(h,dKey(w))<h.wk)w=addDays(w,-7);for(let i=0;i<260;i++){if(hb7Week(h,dKey(w))>=h.wk){n++;w=addDays(w,-7)}else break}return n}}catch(e){}return _s(h,...a)}}
/* 215: «get up» and the walk reminder wait from 5 minutes before an adhan until 15 minutes after it */
function hb7NearPray(ts){ts=ts||Date.now();try{const P=prayerTimes(new Date(ts));return['fajr','dhuhr','asr','maghrib','isha'].some(k=>P[k]&&ts>=P[k]-5*6e4&&ts<P[k]+15*6e4)}catch(e){return false}}
{const _w=wlkTick;wlkTick=function(...a){if(hb7NearPray())return;return _w(...a)}}
/* Today: period habits only in their period, «n/N this week», drag to reorder (PC) */
{hookFn('renderTodayEv',()=>renderTodayEv,f=>{renderTodayEv=f},'post',function(){try{const k=todayKey(),now=Date.now();let slot=null;try{slot=pdlSlotOf(k,now)}catch(e){}
  $$('#todayEv .hbchip[data-hb]').forEach(c=>{const h=HB().find(x=>x.id===c.dataset.hb);if(!h)return;
    if(h.after&&h.after!==slot&&!hbDone(h,k))c.classList.add('hb7off');
    if(h.wk&&!c.querySelector('.hb7wk')){const n=hb7Week(h);c.insertAdjacentHTML('beforeend',`<small class="hb7wk">${t('hb7.wkN',n,h.wk)}</small>`);if(n>=h.wk)c.classList.add('done')}
    if(!MOB.matches&&!c.draggable){c.draggable=true;c.addEventListener('dragstart',e=>{HB7.drag=h.id;e.dataTransfer.effectAllowed='move';try{e.dataTransfer.setData('text/plain','hb:'+h.id)}catch(x){}c.classList.add('hb7dg')});c.addEventListener('dragend',()=>{c.classList.remove('hb7dg');HB7.drag=null});
      c.addEventListener('dragover',e=>{if(HB7.drag&&HB7.drag!==h.id){e.preventDefault();c.classList.add('hb7ov')}});c.addEventListener('dragleave',()=>c.classList.remove('hb7ov'));
      c.addEventListener('drop',e=>{c.classList.remove('hb7ov');if(!HB7.drag||HB7.drag===h.id)return;e.preventDefault();hb7Move(HB7.drag,h.id);HB7.drag=null})}})}catch(e){console.error(e)}})}
/* 203: order = the order of S.habits */
function hb7Move(id,beforeId){const L_=HB(),i=L_.findIndex(x=>x.id===id);if(i<0)return;const [h]=L_.splice(i,1);let j=L_.findIndex(x=>x.id===beforeId);if(j<0)j=L_.length;L_.splice(j,0,h);save();try{renderTodayEv()}catch(e){}if($('#hbGrid'))openHabits()}
{hookFn('openHabits',()=>openHabits,f=>{openHabits=f},'post',function(){try{const g=$('#hbGrid');if(!g)return;g.querySelectorAll('.hbrow[data-id]').forEach(r=>{if(r.querySelector('.hb7h'))return;const h=HB().find(x=>x.id===r.dataset.id);
    r.insertAdjacentHTML('afterbegin',`<span class="hb7h" title="${esc(t('hb7.drag'))}" aria-hidden="true">⠿</span>`);const del=r.querySelector('[data-del]');if(del)del.insertAdjacentHTML('beforebegin',`<button class="link hb7e" data-hb7e title="${esc(t('hb7.edit'))}" aria-label="${esc(t('hb7.edit'))}">⚙</button>`);
    const sm=r.querySelector('.hbn small');if(sm&&h){const x=[];if(h.wk)x.push(t('hb7.wkS',h.wk));if(h.after)x.push(t('hb7.afS',t('pr.'+h.after)));if(x.length)sm.insertAdjacentHTML('beforeend',' · '+esc(x.join(' · ')))}
    r.querySelector('[data-hb7e]').onclick=()=>hb7Edit(h)});
  /* pointer drag on the handle */
  g.querySelectorAll('.hb7h').forEach(hd=>hd.onpointerdown=e=>{e.preventDefault();const row=hd.closest('.hbrow');row.classList.add('hb7dg');hd.setPointerCapture&&hd.setPointerCapture(e.pointerId);
    const mv=ev=>{const rows=[...g.querySelectorAll('.hbrow[data-id]')].filter(x=>x!==row);const y=ev.clientY;const nx=rows.find(x=>{const b=x.getBoundingClientRect();return y<b.top+b.height/2});if(nx)g.insertBefore(row,nx);else g.append(row)};
    const up=()=>{hd.removeEventListener('pointermove',mv);hd.removeEventListener('pointerup',up);hd.removeEventListener('pointercancel',up);row.classList.remove('hb7dg');const ids=[...g.querySelectorAll('.hbrow[data-id]')].map(x=>x.dataset.id),L_=HB();L_.sort((a,b)=>ids.indexOf(a.id)-ids.indexOf(b.id));save();try{renderTodayEv()}catch(x){}};
    hd.addEventListener('pointermove',mv);hd.addEventListener('pointerup',up);hd.addEventListener('pointercancel',up)})}catch(e){console.error(e)}})}
/* 201/202/204/205: one window per habit */
const HB7_WHY=['tired','forgot','time','travel','sick','other'];
function hb7Whys(h,days){const out={};const tk=keyToDate(todayKey());for(let i=0;i<(days||365);i++){const d=S.days[dKey(addDays(tk,-i))];const w=d&&d.hbWhy&&d.hbWhy[h.id];if(w){const k=HB7_WHY.includes(w)?w:'other';out[k]=(out[k]||0)+1}}return out}
function hb7Edit(h){const W=hb7Whys(h),tot=Object.values(W).reduce((s,n)=>s+n,0),mx=Math.max(1,...Object.values(W));
  openInfo(esc(h.icon+' '+h.name),`<div class="hb7f"><label class="eidr"><span>${t('hb7.freq')}</span><select class="in" id="hb7Wk"><option value="0">${t('hb7.daily')}</option>${[1,2,3,4,5,6].map(n=>`<option value="${n}" ${h.wk===n?'selected':''}>${t('hb7.wkS',n)}</option>`).join('')}</select></label>
    <label class="eidr"><span>${t('hb7.per')}</span><select class="in" id="hb7Af"><option value="">${t('hb7.any')}</option>${['fajr','dhuhr','asr','maghrib','isha'].map(p=>`<option value="${p}" ${h.after===p?'selected':''}>${t('hb7.afS',t('pr.'+p))}</option>`).join('')}</select></label>
    <small class="muted">${t('hb7.perH')}</small></div>
    <button class="btn sm" id="hb7Yr">📅 ${t('hb7.yr')}</button>
    <h4 class="hb7wh">${t('hb7.whyT',tot)}</h4>${tot?`<div class="hb7wl">${HB7_WHY.filter(k=>W[k]).sort((a,b)=>W[b]-W[a]).map(k=>`<div class="hb7wr"><span>${t('hb7.w.'+k)}</span><i style="--p:${(W[k]/mx*100).toFixed(0)}%"></i><b>${W[k]}</b></div>`).join('')}</div>`:`<small class="muted">${t('hb7.why0')}</small>`}`);
  $('#hb7Yr').onclick=()=>hb7Year(h);const ok=$('#infoX');ok.textContent=t('pdl.save');ok.onclick=()=>{const w=+$('#hb7Wk').value,a=$('#hb7Af').value;if(w)h.wk=w;else delete h.wk;if(a)h.after=a;else delete h.after;save();$('#infoModal').classList.remove('on');try{renderTodayEv()}catch(e){}toast(t('hb7.saved'))}}
function hb7Year(h,end){const today=keyToDate(todayKey());end=end||today;if(end>today)end=today;const start=addDays(end,-364-end.getDay()),cells=[],months=[];let n=0,lastM=-1;
  for(let d=new Date(start),i=0;d<=end;d=addDays(d,1),i++){const k=dKey(d),v=hbVal(h.id,k),done=hbDone(h,k),why=(S.days[k]||{}).hbWhy&&(S.days[k].hbWhy||{})[h.id];if(done)n++;if(d.getDate()<=7&&d.getDay()===0&&d.getMonth()!==lastM){lastM=d.getMonth();months.push([Math.floor(i/7),L().months[d.getMonth()]])}
    const lv=done?4:v!=null?2:0;cells.push(`<i class="l${lv}${why&&!done?' hb7why':''}" title="${esc(gStr(d)+(v!=null?' · '+v:'')+(why&&!done?' · '+(HB7_WHY.includes(why)?t('hb7.w.'+why):why):''))}"></i>`)}
  const cols=Math.ceil(cells.length/7),canNext=dKey(end)!==todayKey();
  openInfo('📅 '+esc(h.icon+' '+h.name),`<div class="qygnav"><button class="btn sm ghost" data-hb7y="-1" aria-label="${esc(t('qyg.prev'))}">‹</button><b>${gShort(start)} ${start.getFullYear()} – ${gShort(end)} ${end.getFullYear()}</b><button class="btn sm ghost" data-hb7y="1" aria-label="${esc(t('qyg.next'))}"${canNext?'':' disabled'}>›</button></div>
    <div class="qygst"><span><b>${n}</b>${esc(t('hb7.dDone'))}</span><span><b>${hbStreak(h)}</b>${esc(h.wk?t('hb7.wRun'):t('hb7.dRun'))}</span></div>
    <div class="qygsc"><div class="qygm" style="--c:${cols}">${months.map(([c,m])=>`<span style="grid-column:${c+1}">${esc(m)}</span>`).join('')}</div><div class="qygg" style="--c:${cols}">${cells.join('')}</div></div>
    <div class="qyglg"><i class="l0"></i><span>${esc(t('hb7.lg0'))}</span><i class="l2"></i><span>${esc(t('hb7.lg2'))}</span><i class="l4"></i><span>${esc(t('hb7.lg4'))}</span><i class="l0 hb7why"></i><span>${esc(t('hb7.lgW'))}</span></div>`);
  const box=$('#infoBox');box.classList.add('qygbox');const sc=box.querySelector('.qygsc');if(sc)sc.scrollLeft=document.documentElement.dir==='rtl'?-sc.scrollWidth:sc.scrollWidth;
  box.querySelectorAll('[data-hb7y]').forEach(b=>b.onclick=()=>hb7Year(h,addDays(end,365*+b.dataset.hb7y)))}
/* 205: the chip's right-click / long-press menu gets «why not today» */
document.addEventListener('contextmenu',e=>{const c=e.target.closest&&e.target.closest('.hbchip[data-hb]');if(!c)return;setTimeout(()=>{const p=$('#ppPop'),h=HB().find(x=>x.id===c.dataset.hb);if(!p||!h||p.querySelector('[data-hb7w]'))return;const k=todayKey(),cur=((S.days[k]||{}).hbWhy||{})[h.id];
  p.insertAdjacentHTML('beforeend',`<div class="aymh">${t('hb7.whyQ')}</div>${HB7_WHY.map(w=>`<button data-hb7w="${w}" class="${cur===w||(w==='other'&&cur&&!HB7_WHY.includes(cur))?'on':''}">${t('hb7.w.'+w)}</button>`).join('')}${cur?`<button data-hb7w="">✕ ${t('hb7.whyX')}</button>`:''}<button data-hb7w="@">⚙ ${t('hb7.edit')}</button>`);
  p.querySelectorAll('[data-hb7w]').forEach(b=>b.onclick=()=>{closePP();const w=b.dataset.hb7w;if(w==='@'){hb7Edit(h);return}let v=w;if(w==='other'){const s=prompt(t('hb7.whyP'),cur&&!HB7_WHY.includes(cur)?cur:'');if(s===null)return;v=s.trim().slice(0,80)||'other'}
    const d=day(k);d.hbWhy=d.hbWhy||{};if(v)d.hbWhy[h.id]=v;else delete d.hbWhy[h.id];save();try{renderTodayEv()}catch(x){}toast(v?t('hb7.whyOk'):t('hb7.whyX'))})},0)},true);
/* 208/210/211/214: the health card of the period in the Summary */
function hb7Sleep(k){const d=S.days[k]||{};const v=hbVal('sleep',k);const h=v!=null&&v!==''?+v:(d.sleep3&&d.sleep3.h!=null?+d.sleep3.h:null);return h!=null&&!isNaN(h)?h:null}
function hb7SleepGoal(){return +(S.settings.sleepGoal||((HB().find(x=>x.id==='sleep')||{}).goal)||7)}
function hb7SpMin(k){return((S.days[k]||{}).sport3||[]).reduce((s,x)=>s+(+x.min||0),0)}
function hb7Card(){if(typeof sm13Card!=='function')return;const c=sm13Card('hb7Hc',['bSlw','bBal','bQw','bRec']);if(!c)return;const ks=periodKeys(bMode,bAnchor).filter(k=>k<=todayKey()),G=hb7SleepGoal();
  let sl=0,sn=0,debt=0,wa=0,wn=0,sp=0,st=0,km=0;ks.forEach(k=>{const h=hb7Sleep(k);if(h!=null){sl+=h;sn++;debt+=Math.max(0,G-h)}const d=S.days[k]||{};if(d.water){wa+=+d.water;wn++}sp+=hb7SpMin(k);st+=+(d.steps||0);km+=+(d.walkKm||0)});
  const spG=+(S.settings.spWk||150)*(bMode==='week'?1:ks.length/7),pct=spG?Math.min(100,Math.round(sp/spG*100)):0,ym=todayKey().slice(0,7);let kmM=0;Object.keys(S.days).forEach(k=>{if(k.startsWith(ym))kmM+=+(S.days[k].walkKm||0)});
  const it=(ic,lab,n,sub)=>`<span class="sm13q"><span class="sm13qi">${ic}</span><b>${n}</b><small>${esc(lab)}</small>${sub?`<small class="hb7sub">${sub}</small>`:''}</span>`;
  c.innerHTML=`<h3 class="crh">💪 ${esc(t(bMode==='week'?'hb7.hcW':'hb7.hcM'))}</h3><div class="sm13ql hb7ql">${it('😴',t('hb7.sl'),sn?(Math.round(sl/sn*10)/10)+t('u.h'):'—',sn?esc(t('hb7.debt',Math.round(debt*10)/10)):'')}${it('💧',t('hb7.wa'),wn?Math.round(wa/wn*10)/10:'—',esc(t('hb7.waS')))}
    ${it('💪',t('hb7.sp'),sp+t('u.m'),`<span class="hb7bar"><i style="width:${pct}%"></i></span>${esc(t('hb7.spG',Math.round(spG)))}`)}${it('🚶',t('hb7.st'),st?st.toLocaleString(LANG==='ar'?'ar-u-nu-latn':'en'):'—','')}${it('📍',t('hb7.km'),(Math.round(km*10)/10)+' '+t('hb7.kmU'),esc(t('hb7.kmM',Math.round(kmM*10)/10)))}</div>
    <div class="hb7act"><button class="btn sm" id="hb7KmB">＋ ${t('hb7.kmAdd')}</button><button class="btn sm ghost" id="hb7SpB">🎯 ${t('hb7.spSet')}</button></div>`;
  $('#hb7KmB').onclick=()=>hb7KmAsk();$('#hb7SpB').onclick=()=>{const v=prompt(t('hb7.spAsk'),S.settings.spWk||150);if(v===null)return;const n=Math.max(10,Math.min(3000,parseInt(v,10)||150));S.settings.spWk=n;save();renderBrief()}}
function hb7KmAsk(k){k=k||todayKey();const d=day(k),v=prompt(t('hb7.kmAsk',gShort(keyToDate(k))),d.walkKm||'');if(v===null)return;const n=Math.max(0,Math.min(200,parseFloat(String(v).replace(',','.').replace(/[٠-٩]/g,c=>'٠١٢٣٤٥٦٧٨٩'.indexOf(c)))||0));if(n)d.walkKm=Math.round(n*100)/100;else delete d.walkKm;save();if(curView()==='brief')renderBrief();toast(t('hb7.kmOk',d.walkKm||0))}
{hookFn('renderBrief',()=>renderBrief,f=>{renderBrief=f},'post',function(){try{hb7Card()}catch(e){console.error(e)}})}
/* 212/213: ready challenges, and «again» once one ended */
const HB7_CH=[{k:'msj',len:40},{k:'wird',len:30},{k:'adhkar',len:40},{k:'qiyam',len:21},{k:'duha',len:30},{k:'phone',len:30},{k:'walk',len:30,cat:0}];
{hookFn('c30List',()=>c30List,f=>{c30List=f},'post',function(){try{const nw=$('#infoBox .c30new');if(!nw||nw.querySelector('.hb7pre'))return;const b=nw.querySelector('b');
  (b||nw).insertAdjacentHTML(b?'afterend':'afterbegin',`<div class="hb7pre"><small>${t('hb7.preT')}</small>${HB7_CH.map((c,i)=>`<button class="chip" data-hb7p="${i}">${t('hb7.ch.'+c.k)} <small>${c.len}</small></button>`).join('')}</div>`);
  nw.querySelectorAll('[data-hb7p]').forEach(x=>x.onclick=()=>{const c=HB7_CH[+x.dataset.hb7p],N=$('#c30N'),L_=$('#c30L');N.value=t('hb7.ch.'+c.k);if(L_){if(![...L_.options].some(o=>+o.value===c.len))L_.insertAdjacentHTML('beforeend',`<option value="${c.len}">${c.len}</option>`);L_.value=String(c.len)}nw.querySelectorAll('[data-hb7p]').forEach(y=>y.classList.toggle('on',y===x));N.focus()})}catch(e){console.error(e)}})}
{hookFn('c30Open',()=>c30Open,f=>{c30Open=f},'post',function(id){try{const c=CH30().find(x=>x.id===id);if(!c)return;const st=c30Stat(c);if(!st.over||$('#hb7Ag'))return;const top=$('#infoBox .c30top');if(!top)return;
  top.insertAdjacentHTML('afterend',`<button class="btn pri sm" id="hb7Ag">↻ ${t('hb7.again')}</button>`);$('#hb7Ag').onclick=()=>{const n={...c,id:uid(),start:todayKey(),done:{},at:Date.now()};delete n.vals;CH30().push(n);save();c30Open(n.id);try{renderToday()}catch(e){}toast(t('hb7.againOk'))}}catch(e){console.error(e)}})}
