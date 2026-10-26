/* ============ 3.132 twelfth list C (calendar + Summary): an event every N days, event types with a filter, a month of events as a template, a colour picker for each
   Google calendar, the best weekday per category in a sentence, this week against the 8 before, two Hijri months compared ============ */
/* 12th-34: e.rep==='nday' with e.every (2–365) */
{const _o=evOccurs;evOccurs=function(e,k){if(e&&e.rep==='nday'){if(k<e.date)return false;if(e.until&&k>e.until)return false;const n=Math.max(2,+e.every||2);return Math.round((keyToDate(k)-keyToDate(e.date))/864e5)%n===0}return _o(e,k)}}
/* 12th-35: types S.evTypes=[{id,n,c}] (defaults until edited), e.typ; S.settings.evtOff={id:1} hides a type in the calendar only (reminders and Today keep every event) */
function EVT(){return S.evTypes||[{id:'study',n:t('evt.study'),c:'#2563eb'},{id:'family',n:t('evt.family'),c:'#16a34a'},{id:'work',n:t('evt.work'),c:'#d97706'}]}
try{if(Array.isArray(SY_SIMPLE)){['evTypes','evMTpl'].forEach(k=>{if(!SY_SIMPLE.includes(k))SY_SIMPLE.push(k)})}}catch(e){}
const EVTF={on:0};
{const _e=evsOn;evsOn=function(k,...a){const r=_e(k,...a);if(!EVTF.on)return r;const off=S.settings.evtOff||{};return Object.keys(off).length?r.filter(e=>!(e.typ&&off[e.typ])):r}}
{hookFn('renderCal',()=>renderCal,f=>{renderCal=f},'pre',function(){EVTF.on++;setTimeout(()=>{EVTF.on=0},0)});hookFn('renderDetail',()=>renderDetail,f=>{renderDetail=f},'pre',function(){EVTF.on++});hookFn('renderDetail',()=>renderDetail,f=>{renderDetail=f},'post',function(){EVTF.on=Math.max(0,EVTF.on-1)})}
{hookFn('renderEvEd',()=>renderEvEd,f=>{renderEvEd=f},'post',function(){try{const box=$('#evBox');if(!box||$('#evTyp'))return;const rep=$('#evRep');
  if(rep&&!rep.querySelector('[value="nday"]')){const o=document.createElement('option');o.value='nday';o.textContent=t('evn.opt');rep.append(o);if(EVE.rep==='nday')rep.value='nday'}
  const lab=rep&&rep.closest('label');if(lab){lab.insertAdjacentHTML('afterend',`<label id="evEvL"><span>${esc(t('evn.every'))}</span><input class="in" type="number" min="2" max="365" id="evEvery" value="${+EVE.every||3}"></label>`);
    const sh=()=>{$('#evEvL').hidden=rep.value!=='nday'};rep.addEventListener('change',sh);sh()}
  const cols=box.querySelector('.evcols');(cols||box.querySelector('#evN')).insertAdjacentHTML('beforebegin',`<div class="evtrow" id="evTyp"><span>${esc(t('evt.l'))}</span>${EVT().map(x=>`<button type="button" class="evtc ${EVE.typ===x.id?'on':''}" data-typ="${x.id}" style="--c:${x.c}"><i></i>${esc(x.n)}</button>`).join('')}<button type="button" class="evtc ${!EVE.typ?'on':''}" data-typ="">${esc(t('evt.none'))}</button></div>`);
  box.querySelectorAll('[data-typ]').forEach(b=>b.onclick=()=>{EVE.typ=b.dataset.typ||undefined;box.querySelectorAll('[data-typ]').forEach(x=>x.classList.toggle('on',x===b));const T=EVT().find(x=>x.id===EVE.typ);if(T){EVE.color=T.c;box.querySelectorAll('.evcols [data-c]').forEach(x=>x.classList.toggle('on',x.dataset.c===T.c))}});
  const sv=$('#evSave'),o=sv&&sv.onclick;if(sv)sv.onclick=()=>{const id=EVE.id,typ=EVE.typ,ev=+($('#evEvery')?.value||0),isN=rep&&rep.value==='nday';if(isN)rep.value='none';o&&o();const e=EVS().find(x=>x.id===id);if(!e)return;
    if(isN){e.rep='nday';e.every=Math.max(2,Math.min(365,ev||3))}else delete e.every;if(typ)e.typ=typ;else delete e.typ;save();evRefresh()}}catch(e){console.error(e)}})}
function evtMenu(btn){const off=S.settings.evtOff||(S.settings.evtOff={}),r=btn.getBoundingClientRect(),z=uiZoom();
  const p=qPopAt(`<div class="aymh">${esc(t('evt.t'))}</div>${EVT().map(x=>`<button data-tf="${x.id}"><i class="evtd" style="background:${x.c}"></i>${off[x.id]?'☐':'☑'} ${esc(x.n)}</button>`).join('')}<hr><button data-ta="add">＋ ${esc(t('evt.add'))}</button><button data-ta="ed">✎ ${esc(t('evt.edit'))}</button>`,r.left/z,r.bottom/z+4);
  p.querySelectorAll('[data-tf]').forEach(b=>b.onclick=e=>{e.stopPropagation();const k=b.dataset.tf;if(off[k])delete off[k];else off[k]=1;save();closePP();renderCal();evtMenu(btn)});
  p.querySelector('[data-ta="add"]').onclick=e=>{e.stopPropagation();closePP();const n=(prompt(t('evt.ask'))||'').trim();if(!n)return;const L_=EVT().slice();L_.push({id:'t'+uid().slice(0,6),n:n.slice(0,30),c:EVCOLS[L_.length%EVCOLS.length]});S.evTypes=L_;save();renderCal()};
  p.querySelector('[data-ta="ed"]').onclick=e=>{e.stopPropagation();closePP();evtEdit()}}
function evtEdit(){const paint=()=>{const L_=EVT();$('#evtList').innerHTML=L_.map((x,i)=>`<div class="evtr" data-i="${i}"><input class="in" value="${esc(x.n)}" data-n><span class="evtcs">${EVCOLS.map(c=>`<button type="button" data-c="${c}" class="${x.c===c?'on':''}" style="background:${c}"></button>`).join('')}</span><button class="btn sm ghost" data-del title="${esc(t('del'))}">✕</button></div>`).join('');
    $$('#evtList .evtr').forEach(r=>{const i=+r.dataset.i,L2=()=>{S.evTypes=EVT().map(x=>({...x}));return S.evTypes};r.querySelector('[data-n]').onchange=e=>{const v=e.target.value.trim();if(v){L2()[i].n=v.slice(0,30);save()}};
      r.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{L2()[i].c=b.dataset.c;save();paint()});r.querySelector('[data-del]').onclick=()=>{const L_=L2(),x=L_[i];L_.splice(i,1);save();paint();toastAct(t('sdy.del'),t('undo'),()=>{S.evTypes.splice(i,0,x);save();paint()})}})};
  openInfo(esc(t('evt.t')),`<small class="muted">${esc(t('evt.sub'))}</small><div id="evtList" class="evtl"></div>`);$('#infoBox').classList.add('sdybox');paint()}
/* 12th-37: S.evMTpl=[{id,n,items:[{dd,title,time,end,color,typ,notes,rem,big}]}] — a month's own one-off events saved and laid onto another month */
function emtOpen(){const m0=selKey?selKey.slice(0,7):dKey(calM).slice(0,7),L_=S.evMTpl||(S.evMTpl=[]);
  const own=EVS().filter(e=>!String(e.id).startsWith('ics:')&&(!e.rep||e.rep==='none')&&e.date.slice(0,7)===m0);
  const name=d=>L().months[+d.slice(5,7)-1]+' '+d.slice(0,4);
  openInfo('⧉ '+esc(t('emt.t')),`<div class="emtw"><div class="emts"><b>${esc(t('emt.save',name(m0+'-01')))}</b><small class="muted">${esc(t('emt.n',own.length))}</small><div class="snzd"><input class="in" id="emtN" dir="auto" value="${esc(name(m0+'-01'))}"><button class="btn pri" id="emtSv"${own.length?'':' disabled'}>${esc(t('emt.sv'))}</button></div></div>
    <div class="emtl">${L_.length?L_.map(x=>`<div class="sdyr emtr" data-emt="${x.id}"><span dir="auto">${esc(x.n)}</span><small>${esc(t('emt.n',x.items.length))}</small><span class="emta"><input type="month" class="in" value="${dKey(addDays(keyToDate(m0+'-01'),32)).slice(0,7)}"><button class="btn sm pri" data-a="go">${esc(t('emt.go'))}</button></span><button class="btn sm ghost" data-a="del">✕</button></div>`).join(''):`<div class="empty">${esc(t('emt.none'))}</div>`}</div></div>`);
  $('#infoBox').classList.add('sdybox');
  $('#emtSv').onclick=()=>{L_.push({id:uid(),n:($('#emtN').value.trim()||name(m0+'-01')).slice(0,60),items:own.map(e=>({dd:+e.date.slice(8),title:e.title,time:e.time||'',end:e.end||'',color:e.color,typ:e.typ,notes:e.notes||'',rem:e.rem??null,big:!!e.big}))});save();toast(t('emt.saved'));emtOpen()};
  $$('#infoBox [data-emt]').forEach(r=>{const x=L_.find(q=>q.id===r.dataset.emt);r.querySelector('[data-a="del"]').onclick=()=>{const i=L_.indexOf(x);L_.splice(i,1);save();emtOpen();toastAct(t('sdy.del'),t('undo'),()=>{L_.splice(i,0,x);save()})};
    r.querySelector('[data-a="go"]').onclick=()=>{const ym=r.querySelector('input[type=month]').value;if(!ym)return;const y=+ym.slice(0,4),m=+ym.slice(5,7),last=new Date(y,m,0).getDate(),ids=[];
      x.items.forEach(it=>{const rec={id:uid(),title:it.title,date:`${ym}-${String(Math.min(it.dd,last)).padStart(2,'0')}`,time:it.time,end:it.end,color:it.color,rep:'none',rem:it.rem,notes:it.notes,big:it.big};if(it.typ)rec.typ=it.typ;EVS().push(rec);ids.push(rec.id)});
      save();$$('.modal.on').forEach(mm=>mm.classList.remove('on'));calM=new Date(y,m-1,1);selKey=null;evRefresh();try{renderCal()}catch(e){}
      toastAct(t('emt.done',ids.length),t('undo'),()=>{S.events=EVS().filter(e=>!ids.includes(e.id));save();evRefresh()})}})}
function calTools12(){const tb=$('#calTools3');if(!tb||$('#evtBtn'))return;tb.insertAdjacentHTML('beforeend',`<button class="btn sm${Object.keys(S.settings.evtOff||{}).length?' on':''}" id="evtBtn" title="${esc(t('evt.t'))}">🏷 ${esc(t('evt.b'))}</button><button class="btn sm" id="emtBtn" title="${esc(t('emt.t'))}">⧉ ${esc(t('emt.b'))}</button>`);
  $('#evtBtn').onclick=e=>evtMenu(e.currentTarget);$('#emtBtn').onclick=emtOpen}
{hookFn('renderCal',()=>renderCal,f=>{renderCal=f},'post',function(){try{calTools12()}catch(e){}EVTF.on=Math.max(0,EVTF.on-1)})}
/* 12th-39: each linked Google calendar — the colour dot opens a palette instead of cycling */
{hookFn('icsBoxPaint',()=>icsBoxPaint,f=>{icsBoxPaint=f},'post',function(){try{const box=$('#icsBox');if(!box)return;box.querySelectorAll('[data-icc]').forEach(b=>{b.onclick=e=>{e.stopPropagation();const i=+b.dataset.icc,L=icsList(),c=L[i];if(!c)return;const r=b.getBoundingClientRect(),z=uiZoom(),P=[...new Set(ICS_COLS.concat(EVCOLS))];
  const p=qPopAt(`<div class="aymh">${esc(t('icc.t'))}</div><div class="icpal">${P.map(x=>`<button data-pc="${x}" class="${c.c===x?'on':''}" style="background:${x}"></button>`).join('')}</div>`,r.left/z,r.bottom/z+4);
  p.querySelectorAll('[data-pc]').forEach(q=>q.onclick=ev=>{ev.stopPropagation();c.c=q.dataset.pc;(S.icsEv||[]).forEach(x=>{if(String(x.id).startsWith('ics:'+i+':'))x.color=c.c});save();closePP();icsBoxPaint();try{renderTodayEv();if(curView()==='cal')renderCal()}catch(x){}})}})}catch(e){}})}

/* 12th-41: one sentence — the best weekday for each category (same 12 weeks as the table) */
{hookFn('wdCard',()=>wdCard,f=>{wdCard=f},'post',function(){try{const c=$('#bWd');if(!c||c.querySelector('.wds'))return;const {M,cnt}=wdStats(),cats=topCats().filter(x=>M[x.id]&&M[x.id].some(v=>v>0)).slice(0,6);if(!cats.length)return;
  const parts=cats.map(x=>{const av=[0,1,2,3,4,5,6].map(d=>cnt[d]?M[x.id][d]/cnt[d]:0),mx=Math.max(...av),d=av.indexOf(mx);return t('wds.p',kidName(x),L().days[d])});
  c.querySelector('.crsub')?.insertAdjacentHTML('afterend',`<p class="wds">✦ ${esc(parts.join(t('wds.sep')))}</p>`)}catch(e){}})}
/* 12th-42: this week per category against the average of the eight weeks before (week view of the Summary) */
function a8Card(){let c=$('#bAvg8');const host=$('#bWd')||$('#bQh')||$('#bLearn');if(bMode!=='week'){c&&c.remove();return}if(!host)return;if(!c){host.insertAdjacentHTML('beforebegin','<div class="card" id="bAvg8" style="margin-bottom:18px"></div>');c=$('#bAvg8')}
  const ks=periodKeys('week',bAnchor),cur={},avg={},tk=todayKey();ks.forEach(k=>{if(k>tk)return;const r=rollBy(totals(k).by);for(const id in r)cur[id]=(cur[id]||0)+r[id]});
  for(let w=1;w<=8;w++){periodKeys('week',addDays(keyToDate(ks[0]),-7*w)).forEach(k=>{const r=rollBy(totals(k).by);for(const id in r)avg[id]=(avg[id]||0)+r[id]/8})}
  const cats=topCats().filter(x=>cur[x.id]||avg[x.id]).slice(0,8),part=ks.filter(k=>k<=tk).length<7;
  c.innerHTML=`<h3 class="crh">📊 ${esc(t('a8.t'))}</h3><p class="crsub">${esc(t('a8.sub'))}${part?' · '+esc(t('a8.part')):''}</p>${cats.length?`<div class="a8l">${cats.map(x=>{const a=cur[x.id]||0,b=avg[x.id]||0,mx=Math.max(a,b,1),d=b?Math.round((a-b)/b*100):0;
    return`<div class="a8r"><span dir="auto"><i style="background:${x.color}"></i>${esc(kidName(x))}</span><div class="a8b"><i class="cur" style="width:${a/mx*100}%;background:${x.color}"></i><i class="avg" style="inset-inline-start:${b/mx*100}%"></i></div><b>${esc(fmtHM(a))}</b><small>${esc(t('a8.avg',fmtHM(b)))}${b?` <em class="${d>=0?'up':'dn'}">${d>=0?'▲':'▼'}${Math.abs(d)}%</em>`:''}</small></div>`}).join('')}</div>`:`<p class="crsub">${esc(t('wdc.none'))}</p>`}`}
{hookFn('renderBrief',()=>renderBrief,f=>{renderBrief=f},'post',function(){try{a8Card()}catch(e){console.error(e)}})}
/* 12th-48: two Hijri months of your choice side by side (crSum/crRows like the other comparisons) */
function hmFind(y,m){const td=keyToDate(todayKey()),h=hNum(td);let d=addDays(td,Math.round(((y-h.y)*12+(m-h.m))*29.53));for(let i=0;i<40;i++){const x=hNum(d);if(x.y===y&&x.m===m)return hmKeysOf(d);const diff=(x.y-y)*12+(x.m-m);d=addDays(d,diff>0?-8:8)}return[]}
function hm2Open(a,b){const h=hNum(keyToDate(todayKey()));a=a||{y:h.y,m:h.m};b=b||(h.m>1?{y:h.y,m:h.m-1}:{y:h.y-1,m:12});
  const sel=(id,v)=>`<select class="in" id="${id}m">${Array.from({length:12},(_,i)=>`<option value="${i+1}" ${v.m===i+1?'selected':''}>${esc(hMonthName(i+1))}</option>`).join('')}</select><input class="in" type="number" id="${id}y" value="${v.y}" min="1400" max="1500">`;
  const KA=hmFind(a.y,a.m),KB=hmFind(b.y,b.m),A=crSum(KA),B=crSum(KB),lab=v=>hMonthName(v.m)+' '+v.y;
  openInfo('⇆ '+esc(t('hm2.t')),`<div class="crwk crr"><div><b>${esc(t('crx.wkA'))}</b>${sel('hmA',a)}<small>${esc(t('crr.days',KA.length))}</small></div><div><b>${esc(t('crx.wkB'))}</b>${sel('hmB',b)}<small>${esc(t('crr.days',KB.length))}</small></div></div><table class="crt2"><thead><tr><th></th><th>${esc(lab(a))}</th><th>${esc(lab(b))}</th><th></th></tr></thead><tbody>${crRows(A,B)}</tbody></table>`);
  ['#hmAm','#hmAy','#hmBm','#hmBy'].forEach(s=>$(s).onchange=()=>hm2Open({y:+$('#hmAy').value,m:+$('#hmAm').value},{y:+$('#hmBy').value,m:+$('#hmBm').value}))}
function hMonthName(m){const L_=HMN11[LANG]||HMN11.ar;return L_[m-1]||String(m)}
function hm2Btn(){const w=$('#crrBtn');if(!w||$('#hm2Btn'))return;w.insertAdjacentHTML('afterend',`<button class="btn sm ghost" id="hm2Btn">⇆ ${esc(t('hm2.t'))}</button>`);$('#hm2Btn').onclick=()=>hm2Open()}
{hookFn('renderBrief',()=>renderBrief,f=>{renderBrief=f},'post',function(){try{hm2Btn()}catch(e){}})}
{hookFn('btPanel',()=>btPanel,f=>{btPanel=f},'post',function(){try{hm2Btn()}catch(e){}})}
{const _cc=cmdCommands;cmdCommands=function(){const c=(icon,label,run,kw)=>({icon,label,run,kw:kw||''});return _cc().concat([c('🏷',t('evt.t'),evtEdit,'event types أنواع الأحداث'),c('⧉',t('emt.t'),()=>{showView('cal');emtOpen()},'month template قالب شهر'),c('⇆',t('hm2.t'),()=>hm2Open(),'hijri months compare شهرين هجريين')])}}

