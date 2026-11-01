/* ============ v3.155.0 thirteenth list B (worship): 12 Hijri months of prayers on time, congregation per prayer, sleep and Fajr, six of Shawwal,
   the day of Arafah, «before sleep», the week of prayers in 35 dots, a quiet congregation line in the weekly review, the Ramadan summary,
   the Eid prayer, the kind of tomorrow's fast, nawafil against the same Hijri month last year, the eclipse prayer ============ */
const W13={eclK:'',ecl:null};
function w13On(s){return s==='on'||s==='auto'}
function w13Nt(n){if(LANG!=='ar')return t('w13.nights',n);return n===1?'ليلة واحدة':n===2?'ليلتان':n<=10?n+' ليالٍ':n+' ليلة'}
function w13Pct(a,b){return b?Math.round(a/b*100):0}
function w13Bar(lbl,v,sub,cls){return`<div class="w13r${cls?' '+cls:''}"><span>${esc(lbl)}</span><i><b style="width:${Math.max(0,Math.min(100,v))}%"></b></i><em>${sub}</em></div>`}
/* 13th-29: the last twelve Hijri months, share of prayers on time */
function w13Months(){const tk=todayKey(),out=[],seen={};let d=keyToDate(tk);
  for(let i=0;i<380;i++){const k=dKey(d),h=hNum(d),id=h.y+'-'+h.m;if(!seen[id]){if(out.length>=12)break;seen[id]={y:h.y,m:h.m,on:0,all:0};out.push(seen[id])}
    const M=seen[id];if(k>=plSince())PRAYERS.forEach(p=>{const s=plStatus(k,p);if(!s||s==='q')return;M.all++;if(w13On(s))M.on++});d=addDays(d,-1)}
  return out.reverse()}
function w13MonthsHTML(){const M=w13Months().filter(x=>x.all);if(!M.length)return'';const N=HMN11[LANG==='ar'?'ar':'en'];
  return`<h4 class="w13h">${esc(t('w13.mT'))}</h4><div class="w13bars w13mo">${M.map(x=>{const p=w13Pct(x.on,x.all);return w13Bar(N[x.m-1]+(x.y!==hNum(new Date()).y?' '+x.y:''),p,p+'% · '+x.on+'/'+x.all,p>=90?'hi':p<60?'lo':'')}).join('')}</div>`}
/* 13th-36: congregation share per prayer, last 365 days */
function w13JmHTML(){const tk=todayKey(),end=keyToDate(tk),R={};PRAYERS.forEach(p=>R[p]={j:0,n:0});
  for(let i=0;i<365;i++){const k=dKey(addDays(end,-i));if(k<plSince())break;PRAYERS.forEach(p=>{const s=plStatus(k,p);if(s&&s!=='q'&&s!=='miss'){R[p].n++;if(jmHas(k,p))R[p].j++}})}
  if(!PRAYERS.some(p=>R[p].n))return'';
  return`<h4 class="w13h">${esc(t('w13.jmT'))}</h4><div class="w13bars">${PRAYERS.map(p=>w13Bar(t('pr.'+p),w13Pct(R[p].j,R[p].n),w13Pct(R[p].j,R[p].n)+'% · '+R[p].j+'/'+R[p].n)).join('')}</div>`}
/* 13th-39: bedtime of the night before against Fajr on time, last 60 days */
function w13Bed(k){const d=S.days[k];if(!d)return null;const P=slPeriods(d);if(!P.length)return null;let best=P[0];P.forEach(p=>{if(slMins(p)>slMins(best))best=p});
  const[a,b]=best.f.split(':').map(Number);let m=a*60+b;if(m<12*60)m+=1440;return m}
function w13SleepHTML(){const tk=todayKey(),end=keyToDate(tk),B=[{l:'w13.b1',n:0,on:0},{l:'w13.b2',n:0,on:0},{l:'w13.b3',n:0,on:0},{l:'w13.b4',n:0,on:0}];let n=0;
  for(let i=0;i<60;i++){const k=dKey(addDays(end,-i)),m=w13Bed(k);if(m==null)continue;const s=plStatus(k,'fajr');if(!s||s==='q')continue;
    const x=B[m<22*60?0:m<23*60?1:m<24*60?2:3];x.n++;n++;if(w13On(s))x.on++}
  if(n<5)return`<h4 class="w13h">${esc(t('w13.slT'))}</h4><p class="muted w13s">${esc(t('w13.slNone'))}</p>`;
  return`<h4 class="w13h">${esc(t('w13.slT'))}</h4><p class="muted w13s">${esc(t('w13.slSub',w13Nt(n)))}</p><div class="w13bars">${B.filter(x=>x.n).map(x=>w13Bar(t(x.l),w13Pct(x.on,x.n),w13Pct(x.on,x.n)+'% · '+w13Nt(x.n))).join('')}</div>`}
{hookFn('openPrayMap',()=>openPrayMap,f=>{openPrayMap=f},'post',function(tab){try{tab=tab||'on';const seg=$('#infoBox .pmseg');if(!seg)return;const w=seg.parentElement;if(w.querySelector('.w13pm'))return;
  const h=tab==='on'?w13MonthsHTML()+w13SleepHTML():tab==='jm'?w13JmHTML():'';if(h)w.insertAdjacentHTML('beforeend',`<div class="w13pm">${h}</div>`)}catch(e){console.error(e)}})}

/* 13th-37: the week of prayers in one line of 35 dots under the chips (an option) */
function w13WeekHTML(){const tk=todayKey(),end=keyToDate(tk),now=Date.now();let g='';
  for(let i=6;i>=0;i--){const dt=addDays(end,-i),k=dKey(dt),pt=prayerTimes(dt);
    g+=`<span title="${esc(dayLabel?dayLabel(k):gStr(dt))}">${PRAYERS.map(p=>{if(k===tk&&now<pt[p])return'<i class="fu"></i>';const s=plStatus(k,p);return`<i class="${w13On(s)?'on':s==='late'?'late':s==='miss'?'miss':''}"></i>`}).join('')}</span>`}
  return g}
function w13WeekPaint(){const ps=$('#prayers');let b=$('#w13wk');if(!S.settings.pw35||!ps){if(b)b.remove();return}
  if(!b){ps.insertAdjacentHTML('afterend','<div id="w13wk" class="w13wk"></div>');b=$('#w13wk')}b.innerHTML=w13WeekHTML()}
{hookFn('renderPrayers',()=>renderPrayers,f=>{renderPrayers=f},'post',function(){try{w13WeekPaint()}catch(e){}})}
{hookFn('renderSettings',()=>renderSettings,f=>{renderSettings=f},'post',function(){try{if($('#pw35Row'))return;const a=$('#jum2Row')||$('#acrRow');if(!a)return;
  a.insertAdjacentHTML('afterend',`<div class="field" id="pw35Row"><div><label data-i18n="w13.wkL">${t('w13.wkL')}</label><small>${t('w13.wkS')}</small></div><button class="tog ${S.settings.pw35?'on':''}" id="pw35T" role="switch" aria-checked="${!!S.settings.pw35}"></button></div>`);
  $('#pw35T').onclick=e=>{S.settings.pw35=!S.settings.pw35;save();e.currentTarget.classList.toggle('on',!!S.settings.pw35);e.currentTarget.setAttribute('aria-checked',!!S.settings.pw35);w13WeekPaint()}}catch(e){}})}

/* 13th-45: the chip of tomorrow's fast names its kind (Monday, Thursday, white day, Ashura…) */
{const _ft=fsnTomorrow;fsnTomorrow=function(){const r=_ft(),tm=addDays(keyToDate(todayKey()),1);if(r){r.lab=fastLabel(tm);return r}
  const ks=fastKinds(tm);if(!ks.length||eidOf(tm))return null;return{k:ks[0],dk:dKey(tm),lab:fastLabel(tm)}}}

/* Today chips: six of Shawwal (32), Arafah (33), before sleep (34), the Ramadan summary (42), the Eid prayer (44), the eclipse prayer (49) */
function w13S6(){const tk=todayKey(),h=hNum(keyToDate(tk));if(h.m!==10||h.d<2)return null;let n=0;hmKeysOf(keyToDate(tk)).forEach(k=>{if(k<=tk&&hNum(keyToDate(k)).d>=2&&S.days[k]&&S.days[k].fast)n++});return n}
function w13S6Chip(){const n=w13S6();if(n==null)return'';const f=!!(S.days[todayKey()]&&S.days[todayKey()].fast);
  return`<span class="evchip w13c" data-w13s6 style="--c:#14b8a6"><i></i>🌙 ${esc(t('w13.s6'))}<em class="w13dots">${Array.from({length:6},(_,i)=>`<b class="${i<n?'on':''}"></b>`).join('')}</em>${Math.min(6,n)}/6${n>=6?' ✓':f?'':`<button class="btn sm" data-w13s6b>${esc(t('w13.s6b'))}</button>`}</span>`}
function w13Arf(){const d=S.days[todayKey()]||{};return d.arf||{}}
function w13ArfChip(){const h=hNum(keyToDate(todayKey()));if(h.m!==12||h.d!==9)return'';const d=S.days[todayKey()]||{},a=d.arf||{},it=[['fast',!!d.fast],['dua',!!a.dua],['dk',!!a.dk]];
  return`<span class="evchip big w13c w13arf" style="--c:#d97706">🤲 ${esc(t('w13.arf'))}<em class="w13ck">${it.map(([k,v])=>`<button class="btn sm ${v?'on':'ghost'}" data-w13arf="${k}">${v?'✓ ':''}${esc(t('w13.arf.'+k))}</button>`).join('')}</em></span>`}
function w13SlpAdh(){const it=ADHX.map((a,i)=>({key:'x'+i,g:a.g,n:a.n})).filter(a=>a.g==='sleep'),st=((S.adhkar[todayKey()]||{}).x)||{};return{done:it.filter(a=>(st[a.key]||0)>=a.n).length,total:it.length}}
function w13BedChip(){const tk=todayKey(),pt=prayerTimes(keyToDate(tk)),now=Date.now();if(!(now>=pt.isha||prmLate()))return'';
  const d=S.days[tk]||{},mk=(d.tasks||[]).find(x=>x.id==='mulk-'+tk),mulk=mk?!!mk.done:!!(d.bed13&&d.bed13.mulk),witr=!!(d.nfl&&+d.nfl.witr),A=w13SlpAdh(),adh=A.total&&A.done>=A.total;
  return`<span class="evchip big w13c w13bed" style="--c:#6366f1">🌙 ${esc(t('w13.bed'))}<em class="w13ck"><button class="btn sm ${mulk?'on':'ghost'}" data-w13bed="mulk">${mulk?'✓ ':''}${esc(t('w13.bed.mulk'))}</button><button class="btn sm ${witr?'on':'ghost'}" data-w13bed="witr">${witr?'✓ ':''}${esc(t('w13.bed.witr'))}</button><button class="btn sm ${adh?'on':'ghost'}" data-w13bed="adh">${adh?'✓ ':''}${esc(t('w13.bed.adh'))}${A.total&&!adh?` ${A.done}/${A.total}`:''}</button></em></span>`}
function w13RmHy(){const h=hNum(keyToDate(todayKey()));return h.m>=10?h.y:h.y-1}
function w13RmChip(){const h=hNum(keyToDate(todayKey()));if(h.m!==10||h.d>15)return'';const hy=h.y,seen=S.settings.rm13Seen||{};if(seen[hy])return'';if(!rmpDays(hy).some(k=>S.days[k]))return'';
  return`<span class="evchip w13c" data-w13rm style="--c:#a855f7"><i></i>🌙 ${esc(t('w13.rmChip'))}</span>`}
function w13Rm(hy){hy=hy||w13RmHy();const K=rmpDays(hy).filter(k=>k<=todayKey());if(!K.length){toast(t('rmp.none'));return}S.settings.rm13Seen=Object.assign({},S.settings.rm13Seen,{[hy]:1});save();
  let fast=0,tar=0,qy=0,pg=0,sad=0,juz=0,on=0,all=0;K.forEach(k=>{const d=S.days[k];if(!d)return;const r=d.ram||{},n=d.nfl||{},q=d.quran||{};
    if(d.fast||r.fast)fast++;if(r.tar||+n.tar)tar++;if(+n.qiyam||(d.qiyam&&+d.qiyam.rk))qy++;if(r.sad)sad++;if(r.juz)juz++;pg+=Math.max(+q.read||0,(q.pgs||[]).length);
    PRAYERS.forEach(p=>{const s=plStatus(k,p);if(s&&s!=='q'){all++;if(w13On(s))on++}})});
  const kh=(S.quran.khatmas||[]).filter(x=>K.includes(x.end)).length,T=(v,l)=>`<div><b>${v}</b><small>${esc(l)}</small></div>`;
  openInfo('🌙 '+esc(t('w13.rmT',hy)),`<p class="muted">${esc(t('w13.rmSub',K.length))}</p><div class="w13tiles">${T(fast+'/'+K.length,t('w13.rm.fast'))}${T(tar,t('w13.rm.tar'))}${T(qy,t('w13.rm.qy'))}${T(kh,t('w13.rm.kh'))}${T(pg,t('w13.rm.pg'))}${T(all?w13Pct(on,all)+'%':'—',t('w13.rm.pr'))}${sad?T(sad,t('w13.rm.sad')):''}</div>
    ${(()=>{const P=rmpDays(hy-1).filter(k=>S.days[k]);if(!P.length)return'';let f2=0,t2=0;P.forEach(k=>{const d=S.days[k],r=d.ram||{},n=d.nfl||{};if(d.fast||r.fast)f2++;if(r.tar||+n.tar)t2++});return`<p class="muted w13s">${esc(t('w13.rmPrev',hy-1,f2,w13Nt(t2)))}</p>`})()}`);
  try{renderTodayEv()}catch(e){}}
function w13EidChip(){const tk=todayKey(),dt=keyToDate(tk),e=eidOf(dt);if(!e)return'';const pt=prayerTimes(dt);if(Date.now()<pt.sunrise)return'';const d=S.days[tk]||{},v=d.eidP&&d.eidP.w;
  if(v)return`<span class="evchip w13c" data-w13eidx style="--c:#22c55e"><i></i>🕌 ${esc(t('w13.eidDone',t('w13.eid.'+e),t('w13.eidW.'+v)))}</span>`;
  return`<span class="evchip big w13c" style="--c:#22c55e">🕌 ${esc(t('w13.eidQ',t('w13.eid.'+e)))}<em class="w13ck">${['mus','msj','home'].map(w=>`<button class="btn sm ghost" data-w13eid="${w}">${esc(t('w13.eidW.'+w))}</button>`).join('')}</em></span>`}
function w13EclToday(){const tk=todayKey();if(W13.eclK===tk)return W13.ecl;W13.eclK=tk;W13.ecl=null;try{const P=S.settings.prayer,lat=+P.lat,lng=+P.lng;if(!isFinite(lat)||!isFinite(lng))return null;
  const hit=e=>e&&e.vis&&[e.c1,e.c4].some(x=>x&&dKey(logicalDate(x))===tk);
  for(const r of ECL_SE){const e=eclSolar(r,lat,lng);if(hit(e)){W13.ecl=e;break}}if(!W13.ecl)for(const r of ECL_LE){const e=eclLunar(r);if(hit(e)){W13.ecl=e;break}}}catch(e){}return W13.ecl}
function w13EclChip(){const e=w13EclToday();if(!e)return'';if(Date.now()<e.c1-3*36e5)return'';const s=e.kind==='s'?'s':'l',on=!!(S.days[todayKey()]&&S.days[todayKey()].eclP);
  return`<span class="evchip w13c" data-w13ecl style="--c:#64748b"><i></i>🌘 ${esc(t(on?'w13.eclDone.'+s:'w13.ecl.'+s))}${on?'':`<button class="btn sm" data-w13eclb>${esc(t('w13.eclB'))}</button>`}</span>`}
{hookFn('renderTodayEv',()=>renderTodayEv,f=>{renderTodayEv=f},'post',function(){try{const box=$('#todayEv');if(!box||box.querySelector('[data-w13]'))return;
  const h=[w13EclChip(),w13EidChip(),w13ArfChip(),w13S6Chip(),w13BedChip(),w13RmChip()].filter(Boolean).join('');if(!h)return;box.insertAdjacentHTML('beforeend',`<span data-w13 hidden></span>`+h);
  const tk=todayKey(),D=()=>day(tk),re=()=>{try{renderTodayEv()}catch(e){}};
  box.querySelectorAll('[data-w13s6b]').forEach(b=>b.onclick=e=>{e.stopPropagation();const d=D();d.fast=1;save();re();toastAct(t('w13.s6ok',w13S6()),t('undo'),()=>{d.fast=0;save();re()})});
  box.querySelectorAll('[data-w13arf]').forEach(b=>b.onclick=e=>{e.stopPropagation();const k=b.dataset.w13arf,d=D();if(k==='fast')d.fast=d.fast?0:1;else{d.arf=d.arf||{};d.arf[k]=d.arf[k]?0:1}save();re()});
  box.querySelectorAll('[data-w13bed]').forEach(b=>b.onclick=e=>{e.stopPropagation();const k=b.dataset.w13bed,d=D();
    if(k==='adh'){ADHXSEL='sleep';openAdhkar('x');return}
    if(k==='witr'){const n=nflDay(tk);n.witr=+n.witr?0:1;if(!n.witr)delete n.witr;nflChanged(tk);re();return}
    const mk=(d.tasks||[]).find(x=>x.id==='mulk-'+tk);if(mk){mk.done=!mk.done;if(mk.done)mk.doneAt=Date.now();else delete mk.doneAt;save();try{renderTasks()}catch(x){}}else{d.bed13=d.bed13||{};d.bed13.mulk=d.bed13.mulk?0:1;save()}re()});
  box.querySelectorAll('[data-w13rm]').forEach(b=>b.onclick=()=>w13Rm(hNum(keyToDate(tk)).y));
  box.querySelectorAll('[data-w13eid]').forEach(b=>b.onclick=e=>{e.stopPropagation();D().eidP={w:b.dataset.w13eid,at:Date.now()};save();re();vib(15)});
  box.querySelectorAll('[data-w13eidx]').forEach(b=>b.onclick=()=>{const d=D(),old=d.eidP;delete d.eidP;save();re();toastAct(t('w13.eidClr'),t('undo'),()=>{D().eidP=old;save();re()})});
  box.querySelectorAll('[data-w13eclb]').forEach(b=>b.onclick=e=>{e.stopPropagation();D().eclP=1;save();re();vib(15)});
  box.querySelectorAll('[data-w13ecl]').forEach(b=>b.onclick=e=>{if(e.target.closest('[data-w13eclb]'))return;const d=D();if(!d.eclP){eclOpen();return}delete d.eclP;save();re()});
}catch(e){console.error(e)}})}
/* the calendar day panel shows the Eid and eclipse prayers of that day */
{hookFn('renderDetail',()=>renderDetail,f=>{renderDetail=f},'post',function(k){try{const d=S.days[k],box=$('#detail');if(!d||!box||box.querySelector('.w13dl'))return;const L_=[];
  if(d.eidP&&d.eidP.w){const e=eidOf(keyToDate(k));if(e)L_.push('🕌 '+t('w13.eidDone',t('w13.eid.'+e),t('w13.eidW.'+d.eidP.w)))}
  if(d.eclP)L_.push('🌘 '+t('w13.eclLog'));if(d.arf&&(d.arf.dua||d.arf.dk))L_.push('🤲 '+t('w13.arf')+': '+['dua','dk'].filter(x=>d.arf[x]).map(x=>t('w13.arf.'+x)).join('، '));
  if(L_.length)box.insertAdjacentHTML('beforeend',`<div class="w13dl">${L_.map(x=>`<div>${esc(x)}</div>`).join('')}</div>`)}catch(e){}})}

/* 13th-41: a quiet line in the weekly review when no congregation prayer was logged for a while */
function w13NoJm(){const tk=todayKey(),end=keyToDate(tk);for(let i=0;i<365;i++){const k=dKey(addDays(end,-i));if(PRAYERS.some(p=>jmHas(k,p)))return i}return-1}
{hookFn('renderWR',()=>renderWR,f=>{renderWR=f},'post',function(){try{if(WR.step!==0)return;const n=w13NoJm(),st=$('#wrBox .wrstats');if(!st||n<3||st.parentElement.querySelector('.w13wr'))return;
  st.insertAdjacentHTML('afterend',`<p class="w13wr">${esc(t('w13.noJm',n))}</p>`)}catch(e){}})}

/* 13th-48: nawafil this Hijri month against the same month a year ago */
function w13NflCmp(){const tk=todayKey(),K=hmKeysOf(keyToDate(tk)),idx=K.indexOf(tk),cur=K.slice(0,idx+1).reduce((a,k)=>a+nflRk(k),0),P=hmLastYear(keyToDate(K[0]));
  if(!P)return'';const same=P.slice(0,idx+1).reduce((a,k)=>a+nflRk(k),0),full=P.reduce((a,k)=>a+nflRk(k),0);if(!cur&&!full)return'';const h=hNum(keyToDate(tk)),N=HMN11[LANG==='ar'?'ar':'en'][h.m-1];
  return`<p class="w13nf">${esc(t('w13.nfl',N,cur,h.y-1,same,full))}${cur!==same?` <i class="${cur>same?'up':'dn'}">${cur>same?'▲':'▼'}${Math.abs(cur-same)}</i>`:''}</p>`}
{hookFn('nflOpen',()=>nflOpen,f=>{nflOpen=f},'post',function(){try{const w=$('#infoBox .nflw');if(!w||w.querySelector('.w13nf'))return;const h=w13NflCmp();if(h)w.insertAdjacentHTML('beforeend',h)}catch(e){}})}

{const _cc=cmdCommands;cmdCommands=function(){const c=(icon,label,run,kw)=>({icon,label,run,kw:kw||''});return _cc().concat([c('🌙',t('w13.rmT',w13RmHy()),()=>w13Rm(),'ramadan summary رمضان ملخص صيام تراويح'),c('🕌',t('w13.wkL'),()=>{S.settings.pw35=!S.settings.pw35;save();w13WeekPaint()},'prayer week dots صلاة أسبوع نقاط')])}}
