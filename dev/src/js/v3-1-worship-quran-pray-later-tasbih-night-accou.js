/* ============ v3.1 worship & quran: pray-later, tasbih, night accounting, sleep adhkar, qiyam log, virtuous days, recitation tools, hifz plan, surah page, topics ============ */
/* "I'll pray now" → check after 30 minutes */
function prayLaterGo(){const P=S.prayPop;if(!P)return;const now=Date.now();adhanStop();S.prayLater={k:P.k,dk:P.dk||todayKey(),at:now,due:now+30*6e4};S.prayPop=null;save();$('#prayModal').classList.remove('on');document.title=t('app');quietFlush();
  if(ANDROID){try{window.ThabatAndroid.remind&&window.ThabatAndroid.remind(8800,String(S.prayLater.due),t('pl2.qT',t('pr.'+P.k)),t('pl2.qB'),'praycheck')}catch(e){}}
  renderTimerBtns();renderTimer();renderTodayEv();toast(t('pl2.toast',t('pr.'+P.k)))}
{hookFn('showPrayPop',()=>showPrayPop,f=>{showPrayPop=f},'post',function(){const b=$('#pLater');if(b){b.textContent='⏳ '+t('pl2.btn');b.onclick=prayLaterGo}})}
function prayLaterAsk(force){const L_=S.prayLater;if(!L_)return;if(!force&&Date.now()<L_.due)return;if(!force&&$$('.modal.on,.praymodal.on').length)return;const box=$('#plBox');
  box.innerHTML=`<h2 style="font-size:20px">🕌 ${t('pl2.qT',t('pr.'+L_.k))}</h2><p style="color:var(--muted);font-size:13px;margin:6px 0 14px">${t('pl2.qSub',fmtT(L_.at))}</p><div class="evact"><button class="btn sm ghost" id="plcLater">⏳ ${t('pl2.snooze')}</button><span style="flex:1"></span><button class="btn sm pri" id="plcYes">✓ ${t('pray.done')}</button></div>`;
  $('#plcYes').onclick=()=>{const d=day(L_.dk);(d.prayed=d.prayed||{})[L_.k]=L_.at;S.prayLater=null;const T=S.timer;if(T.mode==='pray'){T.mode='work';T.start=Date.now();T.prayStart=null}save();$('#plModal').classList.remove('on');if(ANDROID){try{window.ThabatAndroid.cancelRemind&&window.ThabatAndroid.cancelRemind(8800)}catch(e){}}renderTimerBtns();renderTimer();renderPrayers();toastAct(t('pray.accepted'),t('adx.prayer'),()=>{ADHXSEL='prayer';openAdhkar('x')})};
  $('#plcLater').onclick=()=>{L_.due=Date.now()+15*6e4;save();$('#plModal').classList.remove('on');if(ANDROID){try{window.ThabatAndroid.remind&&window.ThabatAndroid.remind(8800,String(L_.due),t('pl2.qT',t('pr.'+L_.k)),t('pl2.qB'),'praycheck')}catch(e){}}};
  $('#plModal').classList.add('on')}
setInterval(()=>prayLaterAsk(),3e4);setTimeout(()=>prayLaterAsk(),3000);
{const _to=thabatOpen;thabatOpen=function(w){if(w==='praycheck'){showView('today');setTimeout(()=>prayLaterAsk(true),200);return}_to(w)};window.thabatOpen=thabatOpen}
function takePrayLater(){if(!ANDROID||!window.ThabatAndroid.takePrayLater)return;try{const v=window.ThabatAndroid.takePrayLater();if(!v)return;const [k,at]=v.split('|');if(!PRAYERS.includes(k))return;S.prayLater={k,dk:keyOf(+at),at:+at,due:+at+30*6e4};if(S.prayPop&&S.prayPop.k===k){S.prayPop=null;$('#prayModal').classList.remove('on')}save();renderTodayEv()}catch(e){}}
setTimeout(takePrayLater,1500);document.addEventListener('visibilitychange',()=>{if(!document.hidden)takePrayLater()});
/* after "I prayed": offer the after-prayer adhkar */
{hookFn('prayDone',()=>prayDone,f=>{prayDone=f},'post',function(){if(adhExtraOn())setTimeout(()=>toastAct(t('pl2.after'),t('adx.prayer'),()=>{ADHXSEL='prayer';openAdhkar('x')},7000),600)})}
/* tasbih counters */
function TSB(){return S.tasbih||(S.tasbih=[{id:'t1',text:'أستغفر الله',goal:100}])}
function tsbCount(id,k){return(((S.days[k||todayKey()]||{}).tsb)||{})[id]||0}
let TSC=null;
function openTasbih(id){TSC=id||TSB()[0].id;$('#tsModal').classList.add('on');renderTasbih()}
function renderTasbih(){const L_=TSB(),c=L_.find(x=>x.id===TSC)||L_[0];if(!c)return;const n=tsbCount(c.id),done=n>=c.goal;
  $('#tsBox').innerHTML=`<div class="tslist">${L_.map(x=>`<button class="chip ${x.id===c.id?'on':''}" data-ts="${x.id}">${esc(x.text)} · ${tsbCount(x.id)}/${x.goal}</button>`).join('')}</div><h2 style="font-size:24px;margin-top:12px" dir="rtl">${esc(c.text)}</h2><div class="tsring ${done?'done':''}" id="tsTap">${n}</div><p style="color:var(--muted);font-size:13px">${done?t('ts.done'):t('ts.left',c.goal-n)}</p><div class="evact"><button class="btn sm ghost" id="tsUndo">${t('adh.undo')}</button><span style="flex:1"></span><button class="btn sm" id="tsX">${t('ok')}</button></div>`;
  $$('#tsBox [data-ts]').forEach(b=>b.onclick=()=>{TSC=b.dataset.ts;renderTasbih()});
  const add=dv=>{const d=day(todayKey());d.tsb=d.tsb||{};d.tsb[c.id]=Math.max(0,(d.tsb[c.id]||0)+dv);save();vib(dv>0?8:4);if(dv>0&&d.tsb[c.id]===c.goal){chimeSoft(1175);vib(40)}renderTasbih();renderTodayEv()};
  $('#tsTap').onclick=()=>add(1);$('#tsUndo').onclick=()=>add(-1);$('#tsX').onclick=()=>$('#tsModal').classList.remove('on')}
$('#tsModal').onclick=e=>{if(e.target.id==='tsModal')$('#tsModal').classList.remove('on')};
function tsbEdit(){const box=$('#tsBox'),L_=TSB();box.innerHTML=`<h2 style="font-size:18px">📿 ${t('set.tsb')}</h2><div class="plgrid">${L_.map((x,i)=>`<label><input class="in" dir="rtl" data-tt="${i}" value="${esc(x.text)}" style="flex:1;width:auto"><input class="in num" type="number" min="1" data-tg="${i}" value="${x.goal}"><button class="btn sm ghost" data-tx="${i}">✕</button></label>`).join('')}</div><div class="evact"><button class="btn sm ghost" id="tsAdd">＋ ${t('ts.add')}</button><span style="flex:1"></span><button class="btn sm pri" id="tsOk">${t('ev.save')}</button></div>`;
  const read=()=>{$$('#tsBox [data-tt]').forEach(i=>L_[+i.dataset.tt].text=i.value.trim()||L_[+i.dataset.tt].text);$$('#tsBox [data-tg]').forEach(i=>L_[+i.dataset.tg].goal=Math.max(1,+i.value||100))};
  $('#tsAdd').onclick=()=>{read();L_.push({id:uid(),text:'سبحان الله وبحمده',goal:100});tsbEdit()};$$('#tsBox [data-tx]').forEach(b=>b.onclick=()=>{read();L_.splice(+b.dataset.tx,1);if(!L_.length)L_.push({id:uid(),text:'أستغفر الله',goal:100});tsbEdit()});
  $('#tsOk').onclick=()=>{read();save();$('#tsModal').classList.remove('on');renderTodayEv()};$('#tsModal').classList.add('on')}
/* night accounting (muhasaba) */
function mhCfg(){return Object.assign({on:true,at:'22:30'},S.settings.muhasaba||{})}
function openMuhasaba(k){k=k||todayKey();const d=day(k),M=d.muhasaba||{},q=qDay(k),a=d.adh||{};
  const st=PRAYERS.map(p=>[p,plStatus(k,p)]),ok=v=>v?`<span class="ok">✓</span>`:`<span class="no">✗</span>`;
  $('#mhBox').innerHTML=`<h2 style="font-size:19px">🌙 ${t('mh.t')}</h2><p style="color:var(--muted);font-size:12.5px;margin-bottom:8px">${gStr(keyToDate(k))}</p>
   <div class="mhrow"><b>${t('mh.prayers')}</b><span>${st.map(([p,v])=>`${t('pr.'+p)} ${v==='on'||v==='auto'?'✓':v==='late'?'◷':v==='miss'?'✗':'?'}`).join(' · ')}</span></div>
   <div class="mhrow"><b>${t('q.wird')}</b>${ok(qWirdDone(q))}</div><div class="mhrow"><b>${t('adh.m')}</b>${ok(a.m)}<b style="margin-inline-start:12px">${t('adh.e')}</b>${ok(a.e)}</div>
   ${qiyamOn()?`<div class="mhrow"><b>${t('qy2.t')}</b><input class="in num" type="number" min="0" max="40" step="2" id="mhRk" value="${(d.qiyam||{}).rk||''}" placeholder="0"><span>${t('qy2.rk')}</span><label class="chk"><input type="checkbox" id="mhW" ${(d.qiyam||{}).witr?'checked':''}><span>${t('qy2.witr')}</span></label></div>`:''}
   <label style="font-size:13px;color:var(--muted);display:block;margin-top:8px">${t('mh.thanks')}<textarea class="in" id="mh1" dir="auto">${esc(M.thanks||'')}</textarea></label>
   <label style="font-size:13px;color:var(--muted);display:block;margin-top:8px">${t('mh.fix')}<textarea class="in" id="mh2" dir="auto">${esc(M.fix||'')}</textarea></label>
   <label style="font-size:13px;color:var(--muted);display:block;margin-top:8px">${t('mh.tom')}<textarea class="in" id="mh3" dir="auto">${esc(M.tom||'')}</textarea></label>
   <div class="evact"><span style="flex:1"></span><button class="btn sm ghost" id="mhX">${t('ev.cancel')}</button><button class="btn sm pri" id="mhOk">${t('ev.save')}</button></div>`;
  $('#mhX').onclick=()=>$('#mhModal').classList.remove('on');
  $('#mhOk').onclick=()=>{d.muhasaba={thanks:$('#mh1').value.trim(),fix:$('#mh2').value.trim(),tom:$('#mh3').value.trim(),at:Date.now()};if(qiyamOn()){const rk=+($('#mhRk').value||0),w=$('#mhW').checked;if(rk||w)d.qiyam={rk,witr:w};else delete d.qiyam}save();$('#mhModal').classList.remove('on');toast(t('mh.saved'));renderTodayEv()};
  $('#mhModal').classList.add('on')}
function qiyamOn(){return!!S.settings.qiyamLog}
/* sleep adhkar reminder */
function slCfg(){return Object.assign({on:true,at:'23:00'},S.settings.sleepAdh||{})}
function nightChecks(){const now=Date.now(),k=todayKey(),td=keyToDate(k);const M=mhCfg();if(M.on){const at=atTime(logicalDate(now),M.at),nk=k+'mh';if(now>=at&&now<at+3*36e5&&!S.notified[nk]&&!(S.days[k]||{}).muhasaba){S.notified[nk]=1;save();alertUser(t('mh.remT'),t('mh.remB'),ICON_MOON);const b=$('#mOk'),old=b.onclick;b.onclick=()=>{b.onclick=old;$('#modal').classList.remove('on');openMuhasaba(k)}}}
  const L_=slCfg();if(L_.on&&adhExtraOn()){const at=atTime(logicalDate(now),L_.at),nk=k+'sleep';if(now>=at&&now<at+3*36e5&&!S.notified[nk]){S.notified[nk]=1;save();alertUser(t('sl.remT'),t('sl.remB'),ICON_MOON);const b=$('#mOk'),old=b.onclick;b.onclick=()=>{b.onclick=old;$('#modal').classList.remove('on');ADHXSEL='sleep';openAdhkar('x')}}}}
setInterval(nightChecks,6e4);setTimeout(nightChecks,7000);
/* virtuous days */
function virtOn(){return S.settings.virt!==false}
function virtDay(date){if(!virtOn())return null;const h=hNum(date);
  if(h.m===12&&h.d===9)return{k:'arafah',fast:1};if(h.m===12&&h.d>=1&&h.d<=8)return{k:'dhul10'};if(h.m===12&&h.d===10)return{k:'adha'};if(h.m===12&&h.d>=11&&h.d<=13)return{k:'tashreeq'};
  if(h.m===1&&h.d===9)return{k:'tasua',fast:1};if(h.m===1&&h.d===10)return{k:'ashura',fast:1};if(h.m===9&&h.d>=21)return{k:'last10'};if(h.m===10&&h.d===1)return{k:'fitr'};if(h.m===10&&h.d>=2)return{k:'shawwal'};return null}
{const _fk2=fastKinds;fastKinds=function(date){const r=_fk2(date),v=virtDay(date);if(v&&v.fast&&!r.includes(v.k))r.push(v.k);return r}}
{const _fl=fastLabel;fastLabel=function(date){const ks=fastKinds(date);return ks.map(k=>k==='white'?t('fast.white',hNum(date).d):t('fast.'+k)).join(' · ')}}
function virtChip(){const k=todayKey(),v=virtDay(keyToDate(k));if(!v)return'';let x=t('vd.'+v.k);if(v.k==='shawwal'){const h=hNum(keyToDate(k));let n=0;for(let i=0;i<h.d+1;i++){const dk=dKey(addDays(keyToDate(k),-i));if(hNum(keyToDate(dk)).m===10&&S.days[dk]&&S.days[dk].fast)n++}x+=' · '+t('vd.sixN',Math.min(6,n))}return`<span class="evchip" style="--c:#14b8a6"><i></i>✨ ${esc(x)}</span>`}
function tsbChip(){const L_=TSB();return`<span class="evchip" data-tsb style="--c:#a855f7"><i></i>📿 ${L_.map(x=>`${esc(x.text.split(' ').slice(0,2).join(' '))} ${tsbCount(x.id)}/${x.goal}`).join(' · ')}</span>`}
function laterChip(){const L_=S.prayLater;if(!L_)return'';return`<span class="evchip big" style="--c:#f59e0b">⏳ ${t('pl2.chip',t('pr.'+L_.k))}<button class="btn sm" data-plc>✓ ${t('pray.done')}</button></span>`}
function qiyamChip(){if(!qiyamOn())return'';const k=todayKey(),pt=prayerTimes(keyToDate(k)),now=Date.now();if(now<pt.isha&&now>pt.fajr+36e5)return'';const q=(S.days[k]||{}).qiyam;return`<span class="evchip" data-qy style="--c:#6366f1"><i></i>🌌 ${t('qy2.t')}${q?`: ${q.rk||0} ${t('qy2.rk')}${q.witr?' + '+t('qy2.witr'):''}`:''}</span>`}
function mhChip(){const M=mhCfg(),now=Date.now(),k=todayKey();if(!M.on)return'';const at=atTime(logicalDate(now),M.at)-36e5;if(now<at)return'';const done=!!(S.days[k]||{}).muhasaba;return`<span class="evchip" data-mh style="--c:#64748b"><i></i>🌙 ${t('mh.t')}${done?' ✓':''}</span>`}
{const _rte2=renderTodayEv;renderTodayEv=function(){_rte2();const box=$('#todayEv');if(!box)return;box.insertAdjacentHTML('afterbegin',laterChip()+virtChip());box.insertAdjacentHTML('beforeend',tsbChip()+qiyamChip()+mhChip());
  const c=box.querySelector('[data-plc]');if(c)c.onclick=e=>{e.stopPropagation();prayLaterAsk(true);setTimeout(()=>{const y=$('#plcYes');if(y)y.click()},30)};
  const tb=box.querySelector('[data-tsb]');if(tb)tb.onclick=()=>openTasbih();const qy=box.querySelector('[data-qy]');if(qy)qy.onclick=()=>openMuhasaba();const mh=box.querySelector('[data-mh]');if(mh)mh.onclick=()=>openMuhasaba()}}
{const _rbp2=renderBriefPray;renderBriefPray=function(){_rbp2();const box=$('#bPray');if(!box||!qiyamOn())return;const keys=periodKeys(bMode,bAnchor).filter(k=>k<=todayKey());const n=keys.filter(k=>S.days[k]&&S.days[k].qiyam).length,rk=keys.reduce((a,k)=>a+(((S.days[k]||{}).qiyam||{}).rk||0),0);if(n)box.insertAdjacentHTML('beforeend',`<div class="bpcorr">🌌 ${t('qy2.brief',n,rk)}</div>`)}}
/* recitation: speed, compare two reciters, repeat a passage */
{const _pc=qPlayCur;qPlayCur=function(){QA.cmpDone=false;_pc();const r=qAud().rate||1;if(QA.el){QA.el.defaultPlaybackRate=r;QA.el.playbackRate=r;QA.el.onplay=()=>{QA.el.playbackRate=qAud().rate||1}}}}
{const _na=qNextAud;qNextAud=function(){const A=qAud(),it=QA.q[QA.i];if(A.cmp&&it&&!QA.cmpDone){QA.cmpDone=true;QA.el.src=qAyUrlR(A.cmp,it[0],it[1]);QA.el.play().catch(()=>{});return}QA.cmpDone=false;
  if(QA.rangeLeft&&QA.i+1>=QA.q.length&&QA.rep+1>=(A.rep||1)){if(QA.rangeLeft>1){QA.rangeLeft--;QA.rep=0;QA.i=0;qPlayCur();return}QA.rangeLeft=0}_na()}}
function qCmpPick(btn){const A=qAud(),r=btn.getBoundingClientRect();const p=qPopAt(`<div class="aymh">${t('cmp.t')}</div>${A.cmp?`<button data-c="">✕ ${t('cmp.off')}</button>`:''}${RECITERS.filter(([f])=>f!==A.r).map(([f,k])=>`<button data-c="${f}" class="${A.cmp===f?'on':''}">${t(k)}</button>`).join('')}`,r.left+r.width/2,r.top-10,'aymenu');
  p.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{closePP();A.cmp=b.dataset.c||null;save();qPlayerUI()})}
document.addEventListener('change',e=>{if(e.target&&e.target.id==='qpRate'){const A=qAud();A.rate=+e.target.value;save();if(QA.el){QA.el.defaultPlaybackRate=A.rate;QA.el.playbackRate=A.rate}}});
const QAC=[7,286,200,176,120,165,206,75,129,109,123,111,43,52,99,128,111,110,98,135,112,78,118,64,77,227,93,88,69,60,34,30,73,54,45,83,182,88,75,85,54,53,89,59,37,35,38,29,18,45,60,49,62,55,78,96,29,22,24,13,14,11,11,18,12,12,30,52,52,44,28,28,20,56,40,31,50,40,46,42,29,19,36,25,22,17,19,26,30,20,15,21,11,8,8,19,5,8,8,11,11,8,3,9,5,4,7,3,6,3,5,4,5,6];function qAyahCount(s){return QAC[s-1]||0}
function qRangeMenu(s,a,x,y){const n=qAyahCount(s)||a;const p=qPopAt(`<div class="aymh">🔁 ${t('rg.t',qSurahName(s),a)}</div><div style="padding:6px 10px;display:flex;gap:6px;align-items:center;flex-wrap:wrap;font-size:13px"><span>${t('rg.to')}</span><select class="in" id="rgTo">${Array.from({length:n-a+1},(_,i)=>a+i).map(v=>`<option value="${v}" ${v===Math.min(n,a+4)?'selected':''}>${v}</option>`).join('')}</select><span>${t('rg.times')}</span><select class="in" id="rgN">${[2,3,5,7,10,20].map(v=>`<option value="${v}" ${v===3?'selected':''}>×${v}</option>`).join('')}</select></div><button id="rgGo">▶ ${t('rg.go')}</button>`,x,y,'aymenu');
  $('#rgGo').onclick=async()=>{const to=+$('#rgTo').value,nn=+$('#rgN').value;closePP();try{await qIndex()}catch(e){return}const L_=QIX.list.filter(o=>o.s===s&&o.a>=a&&o.a<=to);if(!L_.length)return;QA.q=L_.map(o=>[o.s,o.a,o.p]);QA.i=0;QA.rep=0;QA.rangeLeft=nn;$('#qPlayer').hidden=false;qPlayCur();toast(t('rg.toast',a,to,nn))}}
/* surah page: notes, tadabbur, marks, topics in one place */
function qTopicsOn(){return!!S.quran.topicsOn}
function TOP(){return S.quran.topics||(S.quran.topics={})}
function openSurahPage(s){const M=qMarks(),notes=NOTES().filter(n=>n.ay&&+n.ay.split(':')[0]===s).sort((a,b)=>+a.ay.split(':')[1]-+b.ay.split(':')[1]),marks=Object.keys(M).filter(k=>+k.split(':')[0]===s).sort((a,b)=>+a.split(':')[1]-+b.split(':')[1]);
  const tops=Object.entries(TOP()).map(([tp,L_])=>[tp,L_.filter(k=>+k.split(':')[0]===s)]).filter(x=>x[1].length);const ay=k=>{const [x,y]=k.split(':').map(Number);return esc(qAyahText(x,y,'hafs'))};
  $('#snBox').innerHTML=`<h2 style="font-size:20px">📒 ${t('sn2.t',qSurahName(s))}</h2>
   <div class="snsec"><h4>${t('sn2.notes')} (${notes.length})</h4>${notes.length?notes.map(n=>`<div class="snitem" data-n="${n.id}"><small>${t('q.ayahN',n.ay.split(':')[1])}</small><span class="ay">${ay(n.ay)}</span><b dir="auto">${esc(n.title||'')}</b> <span dir="auto">${esc(mdPlain(n.body).slice(0,200))}</span></div>`).join(''):`<div class="empty" style="padding:4px 0">—</div>`}</div>
   <div class="snsec"><h4>${t('q.marksT')} (${marks.length})</h4>${marks.map(k=>`<div class="snitem" data-k="${k}"><i class="mkdot" style="background:${QMK[M[k]]}"></i> <small>${t('q.ayahN',k.split(':')[1])} · ${t('q.mk.'+M[k])}</small><span class="ay">${ay(k)}</span></div>`).join('')||`<div class="empty" style="padding:4px 0">—</div>`}</div>
   ${qTopicsOn()?`<div class="snsec"><h4>🏷 ${t('tp.list')}</h4>${tops.map(([tp,L_])=>`<div class="snitem"><b>${esc(tp)}</b> <small>${L_.map(k=>t('q.ayahN',k.split(':')[1])).join('، ')}</small></div>`).join('')||`<div class="empty" style="padding:4px 0">—</div>`}</div>`:''}
   <div class="evact"><span style="flex:1"></span><button class="btn sm" id="snX">${t('ok')}</button></div>`;
  $$('#snBox [data-n]').forEach(b=>b.onclick=()=>{$('#snModal').classList.remove('on');openNote(b.dataset.n)});$$('#snBox [data-k]').forEach(b=>b.onclick=()=>{$('#snModal').classList.remove('on');const [x,y]=b.dataset.k.split(':').map(Number);const L_=(QIX&&QIX.list||[]).find(o=>o.s===x&&o.a===y);if(L_)qShow(L_.p)});
  $('#snX').onclick=()=>$('#snModal').classList.remove('on');$('#snModal').classList.add('on')}
$('#snModal').onclick=e=>{if(e.target.id==='snModal')$('#snModal').classList.remove('on')};
function qTopicMenu(s,a,x,y){const k=s+':'+a,T=TOP(),base=['الصبر','الرزق','الدعاء','التوكل','الشكر','التوبة','الجنة','الأسرة'];const all=[...new Set([...base,...Object.keys(T)])];
  const p=qPopAt(`<div class="aymh">🏷 ${t('tp.btn')}</div>${all.map(tp=>`<button data-tp="${esc(tp)}" class="${(T[tp]||[]).includes(k)?'on':''}">${(T[tp]||[]).includes(k)?'✓ ':''}${esc(tp)}</button>`).join('')}<div style="display:flex;gap:6px;padding:6px 8px"><input class="in" id="tpNew" placeholder="${esc(t('tp.new'))}" style="flex:1;padding:5px 8px"><button id="tpAdd">＋</button></div>`,x,y,'aymenu');
  const tog=tp=>{const L_=T[tp]=T[tp]||[];const i=L_.indexOf(k);if(i>=0)L_.splice(i,1);else L_.push(k);if(!L_.length)delete T[tp];save()};
  p.querySelectorAll('[data-tp]').forEach(b=>b.onclick=()=>{tog(b.dataset.tp);closePP();toast(t('tp.saved'))});$('#tpAdd').onclick=()=>{const v=$('#tpNew').value.trim();if(!v)return;tog(v);closePP();toast(t('tp.saved'))}}
{const _qam=qAyahMenu;qAyahMenu=function(s,a,x,y,w){_qam(s,a,x,y,w);const p=$('#ppPop');if(!p)return;const on=(k,f)=>{const b=p.querySelector(`[data-x=${k}]`);if(b)b.onclick=()=>{closePP();setTimeout(f,20)}};
  on('rng',()=>qRangeMenu(s,a,x,y));on('sn',()=>openSurahPage(s));on('topic',()=>qTopicMenu(s,a,x,y))}}
/* memorization plan */
{const _sm=qSetMem;qSetMem=function(pages,on){const Q=S.quran;if(on){Q.memAt=Q.memAt||{};pages.forEach(p=>{if(!Q.memorized.includes(p))Q.memAt[p]=todayKey()})}_sm(pages,on)}}
function hplan(){return S.quran.hplan||null}
function hplanStats(){const P=hplan();if(!P)return null;const Q=S.quran,wk=periodKeys('week',keyToDate(todayKey())),A=Q.memAt||{};const thisW=Object.values(A).filter(k=>wk.includes(k)).length,left=Math.max(0,(P.target||604)-qMem().length),weeks=P.ppw?Math.ceil(left/P.ppw):0;return{P,thisW,left,weeks,eta:weeks?gStr(addDays(keyToDate(todayKey()),weeks*7)):''}}
function openHplan(){const P=hplan()||{ppw:3,target:604};$('#hzBox').innerHTML=`<h2 style="font-size:18px">🗓 ${t('hp.t')}</h2><div class="evrow" style="margin-top:10px"><label><span>${t('hp.ppw')}</span><input class="in num" type="number" min="0.5" step="0.5" id="hpW" value="${P.ppw}"></label><label><span>${t('hp.target')}</span><input class="in num" type="number" min="1" max="604" id="hpT" value="${P.target}"></label></div><p style="color:var(--muted);font-size:12.5px;margin-top:8px">${t('hp.hint',qMem().length)}</p>
  <div class="evact">${hplan()?`<button class="btn sm ghost danger" id="hpDel">${t('del')}</button>`:''}<span style="flex:1"></span><button class="btn sm ghost" id="hpX">${t('ev.cancel')}</button><button class="btn sm pri" id="hpOk">${t('ev.save')}</button></div>`;$('#hzModal').classList.add('on');
  $('#hpX').onclick=()=>$('#hzModal').classList.remove('on');const dl=$('#hpDel');if(dl)dl.onclick=()=>{delete S.quran.hplan;save();$('#hzModal').classList.remove('on');renderQMap()};
  $('#hpOk').onclick=()=>{S.quran.hplan={ppw:Math.max(.5,+$('#hpW').value||3),target:Math.min(604,Math.max(1,+$('#hpT').value||604))};save();$('#hzModal').classList.remove('on');renderQMap()}}
{const _rqm2=renderQMap;renderQMap=function(){_rqm2();const bar=$('#qMap .hzbar');if(!bar)return;const H=hplanStats();bar.insertAdjacentHTML('beforeend',`<button class="btn sm ghost" id="hpBtn">🗓 ${H?t('hp.status',H.thisW,H.P.ppw):t('hp.t')}</button>${H&&H.left?`<small style="color:var(--muted);align-self:center">${t('hp.eta',H.left,H.eta)}</small>`:''}`);$('#hpBtn').onclick=openHplan}}
function hplanCheck(){const H=hplanStats();if(!H)return;const d=keyToDate(todayKey());if(d.getDay()!==4)return;const nk=todayKey()+'hplan';if(S.notified[nk])return;const pt=prayerTimes(d);if(Date.now()<pt.asr)return;S.notified[nk]=1;save();if(H.thisW<H.P.ppw)alertUser(t('hp.remT'),t('hp.remB',H.thisW,H.P.ppw),ICON_BOOK)}
setInterval(hplanCheck,10*6e4);
/* settings */
function renderV32Set(){const st=S.settings;toggle($('#qiyamLogT'),qiyamOn(),v=>{st.qiyamLog=v});
  const M=mhCfg();toggle($('#mhT'),M.on,v=>{st.muhasaba=Object.assign(mhCfg(),{on:v})});$('#mhAt').value=M.at;$('#mhAt').onchange=e=>{st.muhasaba=Object.assign(mhCfg(),{at:e.target.value||'22:30'});save()};
  const L_=slCfg();toggle($('#slT'),L_.on,v=>{st.sleepAdh=Object.assign(slCfg(),{on:v})});$('#slAt').value=L_.at;$('#slAt').onchange=e=>{st.sleepAdh=Object.assign(slCfg(),{at:e.target.value||'23:00'});save()};
  toggle($('#virtT'),virtOn(),v=>{st.virt=v;setTimeout(renderTodayEv,0)});$('#tsbEdit').onclick=tsbEdit;toggle($('#topicsT'),qTopicsOn(),v=>{S.quran.topicsOn=v})}
{hookFn('renderSettings',()=>renderSettings,f=>{renderSettings=f},'post',function(){try{renderV32Set()}catch(e){console.error(e)}})}
