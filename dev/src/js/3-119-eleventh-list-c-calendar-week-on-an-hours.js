/* ============ 3.119 eleventh list C (calendar): week on an hours axis, copy an event to days, event templates, marked periods (travel, exams), drag across days for a multi-day event, multi-day bars in the month, a Hijri date picker ============ */
const hm2m=s=>{const m=String(s||'').match(/^(\d{1,2}):(\d{2})/);return m?+m[1]*60+ +m[2]:null};
const m2hm=m=>String(Math.floor(m/60)%24).padStart(2,'0')+':'+String(m%60).padStart(2,'0');

/* 11th-29: the week view on an hours axis (S.settings.calWkH) */
function cwhPaint(){if(!calWkOn()||!S.settings.calWkH)return;const cols=$$('#cal .wkc[data-k]');if(!cols.length)return;const H=44;
  const data=cols.map(c=>{const k=c.dataset.k,its=[];evsOn(k).forEach(e=>{if(e.d2&&(!e.rep||e.rep==='none'))return;const a=hm2m(e.time);if(a==null)return;const b=hm2m(e.end);its.push({a,b:b!=null&&b>a?b:a+30,tx:e.title||'',c:e.color||'',ev:e.id})});
    ((S.days[k]||{}).tasks||[]).forEach(x=>{const a=hm2m(x.at);if(a!=null)its.push({a,b:a+(+x.est||30),tx:x.text,tk:1,done:x.done})});
    try{(typeof stuToday==='function'?stuToday(k):[]).forEach(s=>{const a=hm2m(s.a),b=hm2m(s.b);if(a!=null)its.push({a,b:b>a?b:a+45,tx:s.n,cls:1})})}catch(e){}
    let pt={};try{const T=prayerTimes(keyToDate(k));PRAYERS.forEach(p=>{const d=new Date(T[p]);pt[p]=d.getHours()*60+d.getMinutes()})}catch(e){}return{c,k,its,pt}});
  let lo=6*60,hi=23*60;data.forEach(d=>{d.its.forEach(x=>{lo=Math.min(lo,x.a);hi=Math.max(hi,Math.min(24*60,x.b))});Object.values(d.pt).forEach(v=>{lo=Math.min(lo,v-30);hi=Math.max(hi,v+30)})});lo=Math.max(0,Math.floor(lo/60)*60);hi=Math.min(24*60,Math.ceil(hi/60)*60);
  const nowM=(()=>{const n=new Date();return n.getHours()*60+n.getMinutes()})(),tk=todayKey();
  data.forEach(({c,k,its,pt},ci)=>{c.classList.add('wkhr');c.querySelectorAll('.wkl .wki').forEach(w=>{if(!w.classList.contains('mds')&&!w.classList.contains('mdm')&&!w.classList.contains('mde'))w.remove()});
    its.sort((x,y)=>x.a-y.a||y.b-x.b);const lanes=[];its.forEach(x=>{let l=lanes.findIndex(e=>e<=x.a);if(l<0){l=lanes.length;lanes.push(0)}lanes[l]=x.b;x.l=l});const nl=Math.max(1,lanes.length);
    let g=`<div class="wkg" style="height:${(hi-lo)/60*H}px">`;for(let m=lo;m<=hi;m+=60)g+=`<i class="wkgl" style="top:${(m-lo)/60*H}px">${ci===0?`<em>${m2hm(m).replace(/:00$/,'')}</em>`:''}</i>`;
    Object.entries(pt).forEach(([p,v])=>{if(v>=lo&&v<=hi)g+=`<b class="wkgp" style="top:${(v-lo)/60*H}px" title="${esc(t('pr.'+p))}"></b>`});
    if(k===tk&&nowM>=lo&&nowM<=hi)g+=`<b class="wkgn" style="top:${(nowM-lo)/60*H}px"></b>`;
    its.forEach(x=>{const top=(x.a-lo)/60*H,h=Math.max(16,(x.b-x.a)/60*H-2);g+=`<div class="wkgi ${x.tk?'tk':''} ${x.cls?'cls':''} ${x.done?'done':''}"${x.ev?` data-ev="${esc(x.ev)}"`:''} style="top:${top}px;height:${h}px;inset-inline-start:${x.l/nl*100}%;width:calc(${100/nl}% - 2px)${x.c?`;--c:${esc(x.c)}`:''}" title="${esc(m2hm(x.a)+' '+x.tx)}"><time>${m2hm(x.a)}</time><span dir="auto">${esc(x.tx)}</span></div>`});
    g+='</div>';const old=c.querySelector('.wkg');if(old)old.remove();(c.querySelector('.wkt')||c.lastElementChild).insertAdjacentHTML('beforebegin',g)});
  $$('#cal .wkgi[data-ev]').forEach(el=>el.onclick=e=>{e.stopPropagation();openEv(el.dataset.ev)})}
function cwhBtn(){const tb=$('#calTools3'),wb=$('#calWkBtn');if(!tb||!wb)return;let b=$('#calWkHBtn');if(!calWkOn()){if(b)b.remove();return}
  if(!b){wb.insertAdjacentHTML('afterend','<button class="btn sm ghost" id="calWkHBtn"></button>');b=$('#calWkHBtn');b.onclick=()=>{S.settings.calWkH=!S.settings.calWkH;save();renderCal()}}b.textContent=S.settings.calWkH?t('cwh.list'):t('cwh.hours');b.classList.toggle('on',!!S.settings.calWkH)}

/* 11th-33: marked periods S.calMarks=[{id,k:'travel'|'exams'|'rest'|'other',n,from,to}] as bands in the month and the week */
const CMK_C={travel:'#0ea5e9',exams:'#f43f5e',rest:'#22c55e',other:'#a78bfa'};
function cmkOn(k){return(S.calMarks||[]).filter(m=>k>=m.from&&k<=m.to)}
function cmkName(m){return m.n||t('cmk.'+m.k)}
function cmkPaint(){$$('#cal .cell[data-k]').forEach(c=>{c.querySelectorAll('.cmk').forEach(x=>x.remove());const L_=cmkOn(c.dataset.k);if(L_.length)c.insertAdjacentHTML('beforeend',`<span class="cmk" style="--c:${CMK_C[L_[0].k]||CMK_C.other}" title="${esc(L_.map(cmkName).join(' · '))}"></span>`)});
  $$('#cal .wkc[data-k]').forEach(c=>{c.querySelectorAll('.cmkw').forEach(x=>x.remove());const L_=cmkOn(c.dataset.k);if(L_.length)c.querySelector('.wkh')?.insertAdjacentHTML('afterend',L_.map(m=>`<div class="cmkw" style="--c:${CMK_C[m.k]||CMK_C.other}" dir="auto">${esc(cmkName(m))}</div>`).join(''))})}
function cmkOpen(){const L_=S.calMarks||[],tk=todayKey();
  openInfo(t('cmk.t'),`<div class="cmkf">${L_.length?L_.slice().sort((a,b)=>a.from.localeCompare(b.from)).map(m=>`<div class="cmkr" style="--c:${CMK_C[m.k]||CMK_C.other}"><i></i><b dir="auto">${esc(cmkName(m))}</b><small>${esc(gShort(keyToDate(m.from)))} → ${esc(gShort(keyToDate(m.to)))}</small><button class="btn sm ghost" data-cmx="${m.id}" aria-label="${esc(t('del'))}">✕</button></div>`).join(''):`<p class="muted">${esc(t('cmk.none'))}</p>`}
    <h4>${esc(t('cmk.add'))}</h4><div class="cmka"><select class="in" id="cmkK">${['travel','exams','rest','other'].map(k=>`<option value="${k}">${esc(t('cmk.'+k))}</option>`).join('')}</select><input class="in" id="cmkN" placeholder="${esc(t('cmk.nameP'))}" dir="auto"><input type="date" class="in" id="cmkF" value="${selKey||tk}"><input type="date" class="in" id="cmkT" value="${selKey||tk}"><button class="btn pri" id="cmkGo">${esc(t('add'))}</button></div></div>`);
  $$('#infoBox [data-cmx]').forEach(b=>b.onclick=()=>{S.calMarks=(S.calMarks||[]).filter(m=>m.id!==b.dataset.cmx);save();renderCal();cmkOpen()});
  $('#cmkGo').onclick=()=>{let f=$('#cmkF').value,to=$('#cmkT').value;if(!f)return;if(!to||to<f)to=f;(S.calMarks=S.calMarks||[]).push({id:uid(),k:$('#cmkK').value,n:$('#cmkN').value.trim().slice(0,40),from:f,to});save();renderCal();cmkOpen()}}
function cmkBtn(){const tb=$('#calTools3');if(!tb||$('#cmkBtn'))return;tb.insertAdjacentHTML('beforeend',`<button class="btn sm ghost" id="cmkBtn" title="${esc(t('cmk.t'))}">⛳ <span>${esc(t('cmk.b'))}</span></button>`);$('#cmkBtn').onclick=cmkOpen}

/* 11th-35: multi-day events as connected pieces in the month cells */
function cmbPaint(){const cells=$$('#cal .cell[data-k]');if(!cells.length)return;const evs=EVS().filter(e=>e.d2&&(!e.rep||e.rep==='none')&&e.d2>e.date);cells.forEach(c=>c.querySelectorAll('.cmb').forEach(x=>x.remove()));if(!evs.length)return;
  let prevTop=null;cells.forEach((c,i)=>{const k=c.dataset.k,top=c.offsetTop,rowStart=prevTop==null||top!==prevTop;prevTop=top;const on=evs.filter(e=>k>=e.date&&k<=e.d2).slice(0,2);
    on.forEach((e,j)=>{const pos=k===e.date?'s':k===e.d2?'e':'m';c.insertAdjacentHTML('beforeend',`<span class="cmb cmb${pos}" data-ev="${esc(e.id)}" style="--c:${esc(e.color||'var(--accent)')};--j:${j}" title="${esc(e.title||'')}">${pos==='s'||rowStart?`<em dir="auto">${esc(e.title||'')}</em>`:''}</span>`)})})}

/* 11th-34: drag across month days (mouse) to make an event spanning them */
const CMDG={a:null,b:null,on:false,sw:false};
function cmdClear(){$$('#cal .cell.cmdsel').forEach(c=>c.classList.remove('cmdsel'))}
function cmdMark(){cmdClear();if(!CMDG.a||!CMDG.b)return;const[x,y]=[CMDG.a,CMDG.b].sort();$$('#cal .cell[data-k]').forEach(c=>{if(c.dataset.k>=x&&c.dataset.k<=y)c.classList.add('cmdsel')})}
document.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.button!==0||calWkOn())return;const c=e.target.closest&&e.target.closest('#cal .cell[data-k]');if(!c||e.target.closest('button,.cmb'))return;CMDG.a=CMDG.b=c.dataset.k;CMDG.on=true},true);
document.addEventListener('pointermove',e=>{if(!CMDG.on)return;const el=document.elementFromPoint(e.clientX,e.clientY),c=el&&el.closest&&el.closest('#cal .cell[data-k]');if(c&&c.dataset.k!==CMDG.b){CMDG.b=c.dataset.k;cmdMark()}},true);
document.addEventListener('pointerup',()=>{if(!CMDG.on)return;CMDG.on=false;const[x,y]=[CMDG.a,CMDG.b].sort();cmdClear();if(!x||x===y)return;CMDG.sw=true;setTimeout(()=>{CMDG.sw=false},300);openEv(null,x);EVE.d2=y;renderEvEd()},true);
document.addEventListener('click',e=>{if(CMDG.sw&&e.target.closest&&e.target.closest('#cal')){e.stopPropagation();e.preventDefault()}},true);

/* 11th-30 copy an event to days, 11th-31 templates, 11th-36 Hijri date picker: all in the event editor */
const EVT_B=[{id:'b1',k:'evt.class',dur:90,rem:10},{id:'b2',k:'evt.meet',dur:60,rem:15},{id:'b3',k:'evt.appt',dur:30,rem:60}];
const HMN11={ar:['محرم','صفر','ربيع الأول','ربيع الآخر','جمادى الأولى','جمادى الآخرة','رجب','شعبان','رمضان','شوال','ذو القعدة','ذو الحجة'],en:['Muharram','Safar','Rabi I','Rabi II','Jumada I','Jumada II','Rajab','Shaban','Ramadan','Shawwal','Dhul-Qadah','Dhul-Hijjah']};
function dayMulti(title,cb){const sel=new Set(),base=keyToDate(todayKey());let off=0;
  const draw=()=>{const m0=new Date(base.getFullYear(),base.getMonth()+off,1),n=new Date(m0.getFullYear(),m0.getMonth()+1,0).getDate(),lead=(m0.getDay()+6)%7,tk=todayKey();
    let h=`<div class="tcph"><button class="btn sm ghost" data-m="-1">‹</button><b>${esc(L().months[m0.getMonth()]+' '+m0.getFullYear())}</b><button class="btn sm ghost" data-m="1">›</button></div><div class="tcpg">`+[1,2,3,4,5,6,0].map(i=>`<i>${esc((L().sdays||L().days)[i])}</i>`).join('')+'<span></span>'.repeat(lead);
    for(let d=1;d<=n;d++){const dk=dKey(new Date(m0.getFullYear(),m0.getMonth(),d));h+=`<button data-k="${dk}" class="${sel.has(dk)?'on':''} ${dk===tk?'tdy':''}">${d}</button>`}
    h+=`</div><button class="btn pri" id="dmGo" ${sel.size?'':'disabled'}>${esc(t('tcp.go',sel.size))}</button>`;$('#dmBox').innerHTML=h;
    $$('#dmBox [data-m]').forEach(b=>b.onclick=()=>{off=Math.max(-1,Math.min(23,off+ +b.dataset.m));draw()});$$('#dmBox [data-k]').forEach(b=>b.onclick=()=>{const v=b.dataset.k;sel.has(v)?sel.delete(v):sel.add(v);draw()});$('#dmGo').onclick=()=>{$$('.modal.on').forEach(m=>m.classList.remove('on'));cb([...sel].sort())}};
  openInfo(title,`<div id="dmBox" class="tcpbox"></div>`);draw()}
function evCopyDays(id){const e=EVS().find(x=>x.id===id);if(!e)return;dayMulti(t('evc.t'),ks=>{const made=ks.map(k=>{const c=Object.assign({},e,{id:uid(),date:k,rep:'none'});delete c.d2;delete c._new;if(e.d2){const span=Math.round((keyToDate(e.d2)-keyToDate(e.date))/864e5);if(span>0)c.d2=dKey(addDays(keyToDate(k),span))}EVS().push(c);return c.id});save();renderCal();try{renderDetail()}catch(x){}
  toastAct(t('tcp.done',made.length),t('undo'),()=>{S.events=EVS().filter(x=>!made.includes(x.id));save();renderCal()},8000)})}
function evtApply(tp){const tm=$('#evTm'),en=$('#evEnd'),ti=$('#evT');if(ti&&!ti.value.trim())ti.value=tp.title||t(tp.k||'')||'';if(tm&&!tm.value){const n=new Date();tm.value=m2hm((n.getHours()+1)*60)}
  const a=hm2m(tm&&tm.value);if(en&&a!=null&&tp.dur)en.value=m2hm(Math.min(24*60-1,a+tp.dur));const r=$('#evRem');if(r&&tp.rem!=null){if(![...r.options].some(o=>+o.value===tp.rem))r.insertAdjacentHTML('beforeend',`<option value="${tp.rem}">${tp.rem}</option>`);r.value=String(tp.rem)}
  if(tp.color){EVE.color=tp.color;$$('#evBox [data-c]').forEach(x=>x.classList.toggle('on',x.dataset.c===tp.color))}toast(t('evt.used'))}
function hpkOpen(btn){const h=hNum(keyToDate($('#evD').value||todayKey())),N=HMN11[LANG==='ar'?'ar':'en'];
  const r=btn.getBoundingClientRect(),p=qPopAt(`<div class="hpk"><select class="in" id="hpkD">${Array.from({length:30},(_,i)=>`<option ${i+1===h.d?'selected':''}>${i+1}</option>`).join('')}</select><select class="in" id="hpkM">${N.map((m,i)=>`<option value="${i+1}" ${i+1===h.m?'selected':''}>${esc(m)}</option>`).join('')}</select><select class="in" id="hpkY">${[h.y-1,h.y,h.y+1,h.y+2].map(y=>`<option ${y===h.y?'selected':''}>${y}</option>`).join('')}</select><button class="btn sm pri" id="hpkGo">${esc(t('hpk.go'))}</button></div>`,r.left+r.width/2,r.bottom-6,'aymenu hpkpop');
  p.querySelector('#hpkGo').onclick=()=>{const D=+$('#hpkD').value,M=+$('#hpkM').value,Y=+$('#hpkY').value;let d=addDays(keyToDate(todayKey()),-420);for(let i=0;i<1700;i++){const x=hNum(d);if(x.y===Y&&x.m===M&&x.d===D){const v=dKey(d);$('#evD').value=v;$('#evD').dispatchEvent(new Event('input',{bubbles:true}));$('#evD').dispatchEvent(new Event('change',{bubbles:true}));closePP();return}d=addDays(d,1)}toast(t('hpk.none'))}}
{hookFn('renderEvEd',()=>renderEvEd,f=>{renderEvEd=f},'post',function(){try{const e=EVE,box=$('#evBox');if(!e||!box)return;
  const d=$('#evD');if(d&&!$('#hpkB')){d.insertAdjacentHTML('afterend',`<button type="button" class="btn sm ghost" id="hpkB" title="${esc(t('hpk.t'))}">${esc(t('hpk.b'))}</button>`);$('#hpkB').onclick=ev=>{ev.stopPropagation();hpkOpen(ev.currentTarget)}}
  if(e._new&&!$('#evtRow')){const L_=[...EVT_B,...(S.evTpl||[])];box.querySelector('h2')?.insertAdjacentHTML('afterend',`<div class="evtrow" id="evtRow"><small>${esc(t('evt.t'))}</small>${L_.map(x=>`<button type="button" class="chip" data-evt="${x.id}" dir="auto">${esc(x.n||t(x.k))}</button>`).join('')}</div>`);
    $$('#evtRow [data-evt]').forEach(b=>{b.onclick=()=>evtApply(L_.find(x=>x.id===b.dataset.evt));const u=(S.evTpl||[]).find(x=>x.id===b.dataset.evt);if(u)b.oncontextmenu=ev=>{ev.preventDefault();if(confirm(t('evt.delQ',u.n))){S.evTpl=S.evTpl.filter(x=>x.id!==u.id);save();renderEvEd()}}})}
  const act=$('#evDel')||$('#evCancel');if(!e._new&&act&&!$('#evCopyB')){act.insertAdjacentHTML('beforebegin',`<button type="button" class="btn ghost" id="evCopyB">⧉ ${esc(t('evc.b'))}</button><button type="button" class="btn ghost" id="evTplB">${esc(t('evt.save'))}</button>`);
    $('#evCopyB').onclick=()=>{const id=e.id;$('#evModal').classList.remove('on');evCopyDays(id)};
    $('#evTplB').onclick=()=>{const n=(prompt(t('evt.nameQ'),$('#evT').value.trim())||'').trim();if(!n)return;const a=hm2m($('#evTm').value),b=hm2m($('#evEnd').value);(S.evTpl=S.evTpl||[]).push({id:uid(),n:n.slice(0,30),title:$('#evT').value.trim(),dur:a!=null&&b!=null&&b>a?b-a:60,rem:$('#evRem')&&$('#evRem').value!==''?+$('#evRem').value:null,color:e.color});save();toast(t('evt.saved'))}}}catch(x){console.error(x)}})}

{hookFn('renderCal',()=>renderCal,f=>{renderCal=f},'post',function(){try{if(typeof CAL2!=='undefined'&&CAL2.busy)return;cwhBtn();cmkBtn();cwhPaint();cmbPaint();cmkPaint()}catch(e){console.error(e)}})}

