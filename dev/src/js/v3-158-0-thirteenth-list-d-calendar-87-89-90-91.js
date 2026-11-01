/* ============ v3.158.0 thirteenth list D: calendar (87 89 90 91 93 94 95 97 99 101 102 103 105, 88 Hijri month view) ============ */
const CD13={busy:0,anc:null,alt:null};
function cd13Own(e){return e&&!String(e.id).startsWith('ics:')}
function cd13Pad(n){return String(n).padStart(2,'0')}
function cd13HM(ms){const d=new Date(ms);return cd13Pad(d.getHours())+':'+cd13Pad(d.getMinutes())}
function cd13Min(s){const m=/^(\d{1,2}):(\d{2})$/.exec(s||'');return m?+m[1]*60+ +m[2]:null}
/* 91: every working day (Monday to Friday) */
{const _o=evOccurs;evOccurs=function(e,k){if(e&&e.rep==='wkdays'){if(k<e.date||(e.until&&k>e.until))return false;const g=keyToDate(k).getDay();return g>=1&&g<=5}return _o(e,k)}}
/* 93: an event tied to a prayer moves with it; 95: yearly events carry the age */
function cd13PrTime(e,k){const P=e.pr;if(!P||!P.k)return null;const d=keyToDate(k);let base=null;
  if(P.k==='jumua'){const j=jumTime();if(j){base=cd13Min(j)}else{try{base=cd13Min(cd13HM(prayerTimes(d).dhuhr))}catch(x){}}}
  else{try{const v=prayerTimes(d)[P.k];if(v!=null)base=cd13Min(cd13HM(v))}catch(x){}}
  if(base==null)return null;const m=Math.max(0,Math.min(1439,base+(+P.off||0)));return cd13Pad(Math.floor(m/60))+':'+cd13Pad(m%60)}
{const _e=evsOn;evsOn=function(k){const L_=_e(k);return L_.map(e=>{if(!e||!e.pr||!e.pr.k)return e;const tm=cd13PrTime(e,k);if(!tm)return e;
  const a=cd13Min(e.time),b=cd13Min(e.end),dur=a!=null&&b!=null&&b>a?b-a:null,o=Object.assign({},e,{time:tm});if(dur!=null){const m=Math.min(1439,cd13Min(tm)+dur);o.end=cd13Pad(Math.floor(m/60))+':'+cd13Pad(m%60)}return o})}}
const CD13_PR=['fajr','dhuhr','asr','maghrib','isha','jumua'];
function cd13PrName(k){return k==='jumua'?t('cd13.jum'):t('pr.'+k)}
{hookFn('renderEvEd',()=>renderEvEd,f=>{renderEvEd=f},'post',function(){try{const box=$('#evBox');if(!box||$('#cd13Pr'))return;const rep=$('#evRep');
  if(rep&&!rep.querySelector('[value="wkdays"]')){const o=document.createElement('option');o.value='wkdays';o.textContent=t('ev.rep.wkdays');const ref=rep.querySelector('[value="weekly"]');ref?ref.after(o):rep.append(o);if(EVE.rep==='wkdays')rep.value='wkdays'}
  const P=EVE.pr||{},tm=$('#evTm'),row=tm&&tm.closest('.evrow');if(!row)return;
  row.insertAdjacentHTML('afterend',`<div class="cd13pr" id="cd13Pr"><span>${esc(t('cd13.prL'))}</span><select class="in" id="cd13PrK"><option value="">${esc(t('cd13.prNone'))}</option>${CD13_PR.map(k=>`<option value="${k}" ${P.k===k?'selected':''}>${esc(t('cd13.after',cd13PrName(k)))}</option>`).join('')}</select><span class="cd13off" ${P.k?'':'hidden'}><input class="in" type="number" id="cd13Off" min="-120" max="300" step="5" value="${+P.off||15}"><span>${esc(t('cd13.min'))}</span></span><small id="cd13PrH"></small></div>`);
  const sel=$('#cd13PrK'),off=$('#cd13Off'),hint=$('#cd13PrH');
  const sh=()=>{const k=sel.value,on=!!k;box.querySelector('.cd13off').hidden=!on;tm.disabled=on;if(on){const tt=cd13PrTime({pr:{k,off:+off.value||0}},$('#evD').value||todayKey());if(tt)tm.value=tt;hint.textContent=t('cd13.prH',tt||'—')}else hint.textContent=''};
  sel.onchange=sh;off.oninput=sh;sh();
  const sv=$('#evSave'),o=sv&&sv.onclick;if(sv)sv.onclick=()=>{const id=EVE.id,k=sel.value,of=+off.value||0;o&&o();const e=EVS().find(x=>x.id===id);if(!e)return;if(k)e.pr={k,off:of};else delete e.pr;save();try{evRefresh()}catch(x){}}}catch(e){console.error(e)}})}
/* 95: age on yearly events in the month cells and on Today */
function cd13Age(e,k){try{const y=evYears(e,k);return y>0?y:0}catch(x){return 0}}
/* 99: today's finished events faded in the day panel; 97 move all; 102 copy from Google */
{hookFn('renderDetail',()=>renderDetail,f=>{renderDetail=f},'post',function(k){try{const box=$('#detail');if(!box)return;const tk=todayKey(),now=new Date(),nm=now.getHours()*60+now.getMinutes();
  if(k===tk){const L_=evsOn(k);box.querySelectorAll('.evli[data-ev]').forEach(el=>{const e=L_.find(x=>x.id===el.dataset.ev);if(!e||!e.time)return;const end=cd13Min(e.end)??(cd13Min(e.time)+30);el.classList.toggle('cd13past',end<=nm)})}
  box.querySelectorAll('.evli[data-ev],.evbig[data-ev]').forEach(el=>{const e=evsOn(k).find(x=>x.id===el.dataset.ev);if(!e)return;if(e.pr&&e.pr.k&&!el.querySelector('.cd13prb'))el.insertAdjacentHTML('beforeend',`<span class="cd13prb">${esc(t('cd13.after',cd13PrName(e.pr.k)))}</span>`)});
  const own=EVS().filter(e=>cd13Own(e)&&(!e.rep||e.rep==='none')&&e.date===k),row=box.querySelector('.evaddrow');
  if(row&&own.length>=1&&!$('#cd13Mv')){row.insertAdjacentHTML('beforeend',`<button class="btn sm" id="cd13Mv" title="${esc(t('cd13.mvT'))}">⇢ ${esc(t('cd13.mv',own.length))}</button>`);$('#cd13Mv').onclick=()=>cd13MoveDay(k)}
  const bd=box.querySelector('.evbig[data-ev]');if(bd)box.querySelectorAll('.evbig[data-ev]').forEach(el=>{el.title=t('cd13.dragT')})}catch(e){console.error(e)}})}
function cd13MoveDay(k){const own=EVS().filter(e=>cd13Own(e)&&(!e.rep||e.rep==='none')&&e.date===k);if(!own.length)return;
  openInfo(t('cd13.mvH'),`<p style="margin:0 0 10px;color:var(--muted)">${esc(t('cd13.mvP',own.length,dayLabel(k)))}</p><input class="in" type="date" id="cd13MvD" value="${dKey(addDays(keyToDate(k),1))}"><div class="row" style="margin-top:12px;justify-content:flex-end"><button class="btn pri" id="cd13MvGo">${esc(t('cd13.mvGo'))}</button></div>`);
  $('#cd13MvGo').onclick=()=>{const to=$('#cd13MvD').value;if(!to||to===k)return;const delta=Math.round((keyToDate(to)-keyToDate(k))/864e5),bak=own.map(e=>[e,e.date,e.d2]);
    own.forEach(e=>{e.date=to;if(e.d2)e.d2=dKey(addDays(keyToDate(e.d2),delta))});save();closeInfo2();selKey=to;try{renderCal()}catch(x){}try{evRefresh()}catch(x){}
    toastAct(t('cd13.mvDone',own.length,dayLabel(to)),t('undo'),()=>{bak.forEach(([e,d,d2])=>{e.date=d;if(d2)e.d2=d2});save();selKey=k;try{renderCal()}catch(x){}try{evRefresh()}catch(x){}})}}
{const _oe=openEv;openEv=function(id,k){if(id&&String(id).startsWith('ics:')){const e=evsOn(k||selKey||todayKey()).find(x=>x.id===id)||(S.icsEv||[]).find(x=>x.id===id);if(e){cd13IcsView(e,k||e.date);return}}return _oe(id,k)}}
function cd13IcsView(e,k){openInfo(esc(e.title),`<p style="margin:0 0 6px">${esc(gStr(keyToDate(k)))} · ${esc(evWhen(e))}</p>${e.notes?`<p style="color:var(--muted);white-space:pre-wrap">${esc(String(e.notes).slice(0,600))}</p>`:''}<p style="color:var(--muted);font-size:13px">${esc(t('ics.ro'))}</p><div class="row" style="justify-content:flex-end;margin-top:10px"><button class="btn pri" id="cd13IcsCp">${esc(t('cd13.icsCp'))}</button></div>`);
  $('#cd13IcsCp').onclick=()=>{const n={id:uid(),title:e.title,date:k,time:e.time||'',end:e.end||'',color:e.color||EVCOLS[0],rep:'none',rem:e.rem??null,notes:e.notes||'',big:false};EVS().push(n);save();closeInfo2();try{evRefresh()}catch(x){}toast(t('cd13.icsDone'));setTimeout(()=>openEv(n.id,k),150)}}
/* 105: drag an event in the month to another day, Ctrl copies it */
window.addEventListener('drop',e=>{try{const c=e.target.closest&&e.target.closest('#cal .cell[data-k]');if(!c||!e.ctrlKey)return;const d=e.dataTransfer.getData('text/plain');if(!d||!d.startsWith('ev:'))return;
  e.preventDefault();e.stopImmediatePropagation();c.classList.remove('dropon');const[,id,from]=d.split(':'),ev=EVS().find(x=>x.id===id),to=c.dataset.k;if(!ev||!to)return;
  const delta=Math.round((keyToDate(to)-keyToDate(from))/864e5),n=Object.assign(JSON.parse(JSON.stringify(ev)),{id:uid(),date:dKey(addDays(keyToDate(ev.date),delta)),rep:'none'});if(n.d2)n.d2=dKey(addDays(keyToDate(n.d2),delta));delete n.until;
  EVS().push(n);save();selKey=to;renderCal();toastAct(t('cd13.copied',dayLabel(to)),t('undo'),()=>{S.events=EVS().filter(x=>x.id!==n.id);save();renderCal()})}catch(x){}},true);
window.addEventListener('dragover',e=>{if(e.ctrlKey&&e.target.closest&&e.target.closest('#cal .cell[data-k]')){try{e.dataTransfer.dropEffect='copy'}catch(x){}}},true);
function cd13CellDrag(){$$('#cal .cell[data-k]').forEach(c=>{const k=c.dataset.k,L_=evsOn(k);c.querySelectorAll('.cevt').forEach(sp=>{const e=L_.find(x=>x.title===sp.title&&cd13Own(x)&&(!x.rep||x.rep==='none'));
  const a=L_.find(x=>x.title===sp.title);const ag=a?cd13Age(a,k):0;if(ag&&!sp.querySelector('.cd13ag'))sp.insertAdjacentHTML('beforeend',` <b class="cd13ag">${ag}</b>`);
  if(!e)return;sp.draggable=true;sp.dataset.ev=e.id;sp.classList.add('cd13dr');sp.ondragstart=ev=>{ev.stopPropagation();ev.dataTransfer.setData('text/plain','ev:'+e.id+':'+k);ev.dataTransfer.effectAllowed='copyMove'}})})}
/* 89: Alt + drag over days counts the days, without making an event */
window.addEventListener('pointerdown',e=>{if(!e.altKey||e.pointerType!=='mouse'||e.button!==0)return;const c=e.target.closest&&e.target.closest('#cal .cell[data-k]');if(!c)return;
  e.preventDefault();e.stopImmediatePropagation();CD13.alt={a:c.dataset.k,b:c.dataset.k};cd13AltMark()},true);
window.addEventListener('pointermove',e=>{if(!CD13.alt)return;const el=document.elementFromPoint(e.clientX,e.clientY),c=el&&el.closest&&el.closest('#cal .cell[data-k]');if(c&&c.dataset.k!==CD13.alt.b){CD13.alt.b=c.dataset.k;cd13AltMark()}},true);
window.addEventListener('pointerup',e=>{if(!CD13.alt)return;const A=CD13.alt;CD13.alt=null;const sw=ev=>{ev.stopPropagation();ev.preventDefault()};window.addEventListener('click',sw,{capture:true,once:true});setTimeout(()=>window.removeEventListener('click',sw,true),80);
  const[x,y]=[A.a,A.b].sort(),n=Math.round((keyToDate(y)-keyToDate(x))/864e5);toast(t('cd13.cnt',n,n+1));setTimeout(()=>$$('#cal .cd13cnt').forEach(c=>c.classList.remove('cd13cnt')),2500)},true);
function cd13AltMark(){const A=CD13.alt;if(!A)return;const[x,y]=[A.a,A.b].sort();$$('#cal .cell[data-k]').forEach(c=>c.classList.toggle('cd13cnt',c.dataset.k>=x&&c.dataset.k<=y));
  const n=Math.round((keyToDate(y)-keyToDate(x))/864e5);let tip=$('#cd13Tip');if(!tip){tip=document.createElement('div');tip.id='cd13Tip';document.body.append(tip)}tip.textContent=t('cd13.cnt',n,n+1);clearTimeout(CD13.tt);CD13.tt=setTimeout(()=>tip.remove(),2600)}
/* 90: copy this week's events to next week */
function cd13WeekKeys(k){const d=keyToDate(k),m=addDays(d,-((d.getDay()+6)%7));return[...Array(7)].map((_,i)=>dKey(addDays(m,i)))}
function cd13CopyWeek(){const wk=cd13WeekKeys(selKey||todayKey()),L_=EVS().filter(e=>cd13Own(e)&&(!e.rep||e.rep==='none')&&wk.includes(e.date));
  if(!L_.length){toast(t('cd13.wkNone'));return}if(!confirm(t('cd13.wkQ',L_.length)))return;
  const add=L_.map(e=>{const n=Object.assign(JSON.parse(JSON.stringify(e)),{id:uid(),date:dKey(addDays(keyToDate(e.date),7))});if(n.d2)n.d2=dKey(addDays(keyToDate(n.d2),7));return n});
  add.forEach(n=>EVS().push(n));save();renderCal();try{evRefresh()}catch(x){}const ids=new Set(add.map(n=>n.id));toastAct(t('cd13.wkDone',add.length),t('undo'),()=>{S.events=EVS().filter(x=>!ids.has(x.id));save();renderCal()})}
/* 94: the year of golden days */
function cd13Year(y){y=y||(+(selKey||todayKey()).slice(0,4));const tk=todayKey();let gold=0,h='';
  for(let m=0;m<12;m++){const f=new Date(y,m,1),n=new Date(y,m+1,0).getDate(),lead=(f.getDay()+6)%7;let c='';for(let i=0;i<lead;i++)c+='<i class="e"></i>';
    for(let d=1;d<=n;d++){const k=dKey(new Date(y,m,d));let cls='';if(k<=tk){const{tot}=totals(k),g=goalMs(k);if(g&&tot>=g){gold++;cls=tot-g>=4*36e5?'g2':'g1'}else if(tot>0)cls='p'}else cls='f';c+=`<i class="${cls}" data-k="${k}" title="${esc(gStr(keyToDate(k)))}"></i>`}
    h+=`<div class="cd13ym"><b>${esc(L().months[m])}</b><div class="cd13yg">${c}</div></div>`}
  openInfo(t('cd13.yrH',y),`<div class="cd13yhd"><button class="btn sm" data-cy="${y-1}">‹</button><span>${esc(t('cd13.yrN',gold))}</span><button class="btn sm" data-cy="${y+1}">›</button></div><div class="cd13yr">${h}</div><div class="cd13yl"><i class="g1"></i>${esc(t('cd13.yG'))} <i class="g2"></i>${esc(t('cd13.yG4'))} <i class="p"></i>${esc(t('cd13.yP'))}</div>`);
  const ib=$('#infoBox');if(ib)ib.classList.add('cd13ybox');
  $$('#infoBox [data-cy]').forEach(b=>b.onclick=()=>cd13Year(+b.dataset.cy));
  $$('#infoBox .cd13yg i[data-k]').forEach(i=>i.onclick=()=>{selKey=i.dataset.k;calM=new Date(keyToDate(selKey).getFullYear(),keyToDate(selKey).getMonth(),1);closeInfo2();renderCal()})}
{hookFn('openInfo',()=>openInfo,f=>{openInfo=f},'pre',function(){const ib=$('#infoBox');if(ib)ib.classList.remove('cd13ybox')})}
/* 103: go to a Hijri date */
function cd13HijriGo(){const h=hNum(keyToDate(selKey||todayKey())),N=HMN11[LANG==='ar'?'ar':'en'];
  openInfo(t('cd13.hgH'),`<div class="cd13hg"><input class="in" type="number" id="cd13Hd" min="1" max="30" value="${h.d}"><select class="in" id="cd13Hm">${N.map((n,i)=>`<option value="${i+1}" ${i+1===h.m?'selected':''}>${esc(n)}</option>`).join('')}</select><input class="in" type="number" id="cd13Hy" min="1300" max="1600" value="${h.y}"></div><div class="row" style="justify-content:flex-end;margin-top:12px"><button class="btn pri" id="cd13HgGo">${esc(t('cd13.hgGo'))}</button></div>`);
  $('#cd13HgGo').onclick=()=>{const d=+$('#cd13Hd').value,m=+$('#cd13Hm').value,y=+$('#cd13Hy').value;if(!d||!m||!y)return;const k=cd13FromHijri(y,m,d);if(!k){toast(t('cd13.hgNo'));return}
    selKey=k;const g=keyToDate(k);calM=new Date(g.getFullYear(),g.getMonth(),1);CD13.anc=k;closeInfo2();renderCal()}}
function cd13FromHijri(y,m,d){const est=new Date(622,6,16);const days=Math.round((y-1)*354.36667+(m-1)*29.5306+(d-1));const base=addDays(est,days);
  for(let i=0;i<=20;i++)for(const s of i?[i,-i]:[0]){const g=addDays(base,s),h=hNum(g);if(h.y===y&&h.m===m&&h.d===d)return dKey(g)}return null}
/* 88: the Hijri month view (optional) */
function cd13HOn(){return !!S.settings.calHij&&!calWkOn()}
function cd13HMonth(k){const h=hNum(keyToDate(k));let s=keyToDate(k);for(let i=0;i<31;i++){const p=addDays(s,-1);if(hNum(p).m!==h.m)break;s=p}const ks=[];let d=s;for(let i=0;i<31;i++){const hh=hNum(d);if(hh.m!==h.m)break;ks.push(dKey(d));d=addDays(d,1)}return{h,ks}}
function cd13HPaint(){if(CD13.busy||!cd13HOn())return;const box=$('#cal');if(!box)return;const anc=CD13.anc||selKey||todayKey(),{h,ks}=cd13HMonth(anc),cells={};
  const grab=()=>box.querySelectorAll('.cell[data-k]').forEach(c=>{if(ks.includes(c.dataset.k)&&!cells[c.dataset.k])cells[c.dataset.k]=c.outerHTML});
  const save0=calM,g0=keyToDate(ks[0]),g1=keyToDate(ks[ks.length-1]);CD13.busy=1;
  try{calM=new Date(g0.getFullYear(),g0.getMonth(),1);renderCal();grab();if(g1.getMonth()!==g0.getMonth()){calM=new Date(g1.getFullYear(),g1.getMonth(),1);renderCal();grab()}}finally{CD13.busy=0;calM=new Date(g0.getFullYear(),g0.getMonth(),1)}
  const dows=[...box.querySelectorAll('.dow')].map(x=>x.outerHTML).join(''),lead=(g0.getDay()+6)%7;
  box.innerHTML=dows+'<div class="cell out cd13blank"></div>'.repeat(lead)+ks.map(k=>(cells[k]||'').replace(/\bout\b/,'')).join('');box.classList.add('cd13hm');
  $('#calTtl').textContent=HMN11[LANG==='ar'?'ar':'en'][h.m-1]+' '+h.y+' '+t('hijriSuffix');$('#calSub').textContent=gStr(g0)+' – '+gStr(g1);
  box.querySelectorAll('.cell[data-k]').forEach(c=>c.onclick=()=>{selKey=c.dataset.k;renderCal()});try{cd13CellDrag()}catch(x){}try{requestAnimationFrame(placeCalSky)}catch(x){}}
document.addEventListener('click',e=>{if(!cd13HOn())return;const b=e.target.closest&&e.target.closest('#calPrev,#calNext,#calToday');if(!b)return;e.stopImmediatePropagation();e.preventDefault();
  const{ks}=cd13HMonth(CD13.anc||selKey||todayKey());CD13.anc=b.id==='calToday'?todayKey():b.id==='calPrev'?dKey(addDays(keyToDate(ks[0]),-1)):dKey(addDays(keyToDate(ks[ks.length-1]),1));if(b.id==='calToday')selKey=todayKey();renderCal()},true);
/* 87: a small month in the week view to jump to any week */
function cd13MiniMonth(btn,m0){const base=m0||(()=>{const d=keyToDate(selKey||todayKey());return new Date(d.getFullYear(),d.getMonth(),1)})(),y=base.getFullYear(),m=base.getMonth(),lead=(base.getDay()+6)%7,n=new Date(y,m+1,0).getDate(),wk=cd13WeekKeys(selKey||todayKey()),tk=todayKey();
  let c=[1,2,3,4,5,6,0].map(i=>`<b>${esc(L().sdays?L().sdays[i]:L().days[i].slice(0,2))}</b>`).join('')+'<i></i>'.repeat(lead);
  for(let d=1;d<=n;d++){const k=dKey(new Date(y,m,d));c+=`<button type="button" data-mk="${k}" class="${wk.includes(k)?'wk':''} ${k===tk?'td':''}">${d}</button>`}
  closePP();const p=document.createElement('div');p.className='pppop cd13mm';p.id='ppPop';p.innerHTML=`<div class="cd13mmh"><button type="button" data-mm="-1">‹</button><span>${esc(L().months[m]+' '+y)}</span><button type="button" data-mm="1">›</button></div><div class="cd13mmg">${c}</div>`;document.body.append(p);
  const z=uiZoom()||1,r=btn.getBoundingClientRect(),w=p.offsetWidth;let x=document.documentElement.dir==='rtl'?r.right/z-w:r.left/z;x=Math.max(8,Math.min(innerWidth/z-w-8,x));p.style.left=x+'px';p.style.top=(r.bottom/z+6)+'px';
  p.querySelectorAll('[data-mm]').forEach(b=>b.onclick=ev=>{ev.stopPropagation();cd13MiniMonth(btn,new Date(y,m+(+b.dataset.mm),1))});
  p.querySelectorAll('[data-mk]').forEach(b=>b.onclick=()=>{selKey=b.dataset.mk;closePP();renderCal()});setTimeout(()=>document.addEventListener('mousedown',ppOut,true),0)}
/* tools: one menu in the calendar head, and the mini month in the week view */
function cd13Tools(){const tb=$('#calTools3');if(!tb)return;
  let mb=$('#cd13More');if(!mb){tb.insertAdjacentHTML('beforeend',`<button class="btn sm" id="cd13More" title="${esc(t('cd13.more'))}">⋯</button>`);mb=$('#cd13More');
    mb.onclick=ev=>{ev.stopPropagation();wbMenu(mb,[[(S.settings.calHij?'✓ ':'')+esc(t('cd13.hm')),()=>{S.settings.calHij=!S.settings.calHij;CD13.anc=selKey||todayKey();save();renderCal()}],[esc(t('cd13.hg')),cd13HijriGo],[esc(t('cd13.yr')),()=>cd13Year()],null,[esc(t('cd13.wk')),cd13CopyWeek]]);
      const p=$('#ppPop');if(p){const z=uiZoom()||1,r=mb.getBoundingClientRect(),w=p.offsetWidth;let x=document.documentElement.dir==='rtl'?r.right/z-w:r.left/z;x=Math.max(8,Math.min(innerWidth/z-w-8,x));p.style.left=x+'px';p.style.top=(r.bottom/z+6)+'px'}}}
  let mm=$('#cd13MmB');if(calWkOn()){if(!mm){tb.insertAdjacentHTML('afterbegin',`<button class="btn sm" id="cd13MmB" title="${esc(t('cd13.mm'))}">▦</button>`);mm=$('#cd13MmB');mm.onclick=ev=>{ev.stopPropagation();cd13MiniMonth(mm)}}}else if(mm)mm.remove()}
{hookFn('renderCal',()=>renderCal,f=>{renderCal=f},'post',function(){if(CD13.busy)return;try{cd13Tools()}catch(e){}const box=$('#cal');if(box)box.classList.remove('cd13hm');if(cd13HOn())cd13HPaint();else try{cd13CellDrag()}catch(e){}})}
/* 101: days left to the first exam of a marked exams period */
function cd13Exam(){const tk=todayKey(),L_=(S.calMarks||[]).filter(m=>m.k==='exams'&&m.to>=tk).sort((a,b)=>a.from<b.from?-1:1);return L_[0]||null}
{hookFn('renderTodayEv',()=>renderTodayEv,f=>{renderTodayEv=f},'post',function(){try{const box=$('#todayEv');if(!box||box.querySelector('[data-cd13x]'))return;const m=cd13Exam();if(!m)return;const tk=todayKey(),n=Math.round((keyToDate(m.from)-keyToDate(tk))/864e5);if(n>60)return;
  const txt=n>0?t('cd13.exIn',n,m.n||t('cd13.exams')):t('cd13.exOn',Math.round((keyToDate(tk)-keyToDate(m.from))/864e5)+1,Math.round((keyToDate(m.to)-keyToDate(m.from))/864e5)+1,m.n||t('cd13.exams'));
  box.insertAdjacentHTML('beforeend',`<span class="evchip" data-cd13x style="--c:#ef4444"><i></i>📚 ${esc(txt)}</span>`);box.querySelector('[data-cd13x]').onclick=()=>{try{cmkOpen()}catch(e){}}}catch(e){}})}

