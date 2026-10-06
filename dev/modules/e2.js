/* ============ v3.3.1: tarawih program, sleep periods on the day strip, after-prayer chip off ============ */
/* the after-prayer adhkar chip is off on the home page (it can be turned back on in Settings) */
if(!S.v331aa){S.v331aa=1;S.settings.adhAfterOn=false;save()}
/* ---- tarawih: a portion of the Quran per rak'ah, night by night ---- */
const TAR_UNITS=[[1,'tr.u1'],[2,'tr.u2'],[4,'tr.u4'],[8,'tr.u8']];
function TAR(){return S.quran.tar||(S.quran.tar={plan:[{n:22,r:10,u:2},{n:4,r:10,u:1}]})}
function tarAthman(){return qAthman()}
/* the (page, line) where each sajdah ayah sits, in the current riwaya when we can, otherwise Hafs */
function tarSajdaPos(){const r=S.quran.riwaya,R=RIWAYAT[r]||{},B=R.kind==='text'&&QB[r]?QB[r]:QB.hafs;if(!B)return[];const out=[];
  SAJDA.forEach(([s,a,kh])=>{for(let p=1;p<=604;p++){const x=B.pages[p].ay.find(q=>q.s===s&&q.a===a&&!q.cont);if(x){out.push({s,a,kh:!!kh,p,l:x.ls});break}}});return out}
const tarCmp=(p1,l1,p2,l2)=>p1!==p2?p1-p2:l1-l2;
function tarThumnOf(A,p,l){let j=0;for(let i=0;i<A.length;i++){if(tarCmp(A[i][0],A[i][1],p,l)<=0)j=i;else break}return j}
function tarLabel(i,u){const h=Math.floor(i/8)+1,j=i%8;if(u>=8||j===0)return t('tr.hz',h);if(u>=4&&j===4)return t('tr.half',h);if(u>=2&&j%2===0)return t('tr.rub',h,j/2+1);return t('tr.thumn',h,j+1)}
function tarSchedule(){const T=TAR(),A=tarAthman(),nights=[];let i=0,night=0;
  T.plan.forEach(seg=>{for(let n=0;n<(+seg.n||0);n++){night++;const rk=[];for(let r=0;r<(+seg.r||0);r++){if(i>=480){rk.push(null);continue}const a=i,b=Math.min(480,i+(+seg.u||1));rk.push({a,b,u:+seg.u||1});i=b}nights.push({n:night,rk})}});
  const SP=tarSajdaPos(),sj=[];SP.forEach(x=>{const th=tarThumnOf(A,x.p,x.l);nights.forEach(N=>N.rk.forEach((R,ri)=>{if(R&&th>=R.a&&th<R.b)sj.push({night:N.n,rk:ri+1,s:x.s,a:x.a,kh:x.kh})}))});
  return{nights,used:i,sj}}
function ramStart(){const td=keyToDate(todayKey());for(let k=-31;k<400;k++){const d=addDays(td,k),h=hNum(d);if(h.m===9&&h.d===1)return d}return null}
function tarNightDate(n){const r=ramStart();return r?addDays(r,n-2):null}
function tarTonight(){const h=hNum(addDays(keyToDate(todayKey()),1));return h.m===9?h.d:0}
function tarStartText(R){const A=tarAthman(),p=A[R.a]?A[R.a][0]:1;return`${tarLabel(R.a,R.u)} · ${qSurahName(qSurahIdx(p)+1)} · ${t('q.pageS')} ${p}`}
function openTarawih(){const T=TAR(),S2=tarSchedule(),tn=tarTonight();
  const units=u=>TAR_UNITS.map(([v,l])=>`<option value="${v}" ${+u===v?'selected':''}>${t(l)}</option>`).join('');
  const planH=T.plan.map((g,i)=>`<div class="trrow" data-i="${i}"><label>${t('tr.nights')}<input class="in num" type="number" min="1" max="30" data-f="n" value="${g.n}"></label><label>${t('tr.rak')}<input class="in num" type="number" min="2" max="40" step="2" data-f="r" value="${g.r}"></label><label>${t('tr.each')}<select class="in" data-f="u">${units(g.u)}</select></label><button class="btn sm ghost" data-del="${i}" title="${t('del')}">✕</button></div>`).join('');
  const left=480-S2.used,last=S2.nights.length,fin=left<=0?(()=>{for(const N of S2.nights){if(N.rk.some(R=>R&&R.b>=480))return N.n}return last})():0;
  const status=left>0?`<span class="bad">${t('tr.left',left)}</span>`:`<span class="ok">${t('tr.done',fin)}</span>`;
  const sjH=S2.sj.length?`<ul class="trsj">${S2.sj.map(x=>{const d=tarNightDate(x.night);return`<li>۩ ${t('tr.sjIn',x.night,x.rk)} — ${qSurahName(x.s)} ${x.a}${d?` <small>(${gShort(d)})</small>`:''}${x.kh?` <small class="muted">${t('tr.kh')}</small>`:''}</li>`}).join('')}</ul>`:`<p class="muted">${t('tr.sjLoad')}</p>`;
  const nightsH=S2.nights.map(N=>{const d=tarNightDate(N.n),sj=S2.sj.filter(x=>x.night===N.n);if(N.rk.every(R=>!R))return'';
    return`<details class="trn ${N.n===tn?'now':''}" ${N.n===tn?'open':''}><summary><b>${t('tr.night',N.n)}</b>${d?` <small>${gShort(d)}</small>`:''}${sj.length?` <span class="sjd">۩ ${sj.map(x=>t('tr.rkN',x.rk)).join('، ')}</span>`:''}${N.n===tn?` <span class="trnow">${t('tr.tonight')}</span>`:''}</summary>
      <ol>${N.rk.map((R,ri)=>R?`<li>${tarStartText(R)}${sj.some(x=>x.rk===ri+1)?' <b class="sjd">۩</b>':''}</li>`:`<li class="muted">—</li>`).join('')}</ol></details>`}).join('');
  openInfo('🌙 '+t('tr.t'),`<p class="muted" style="margin:0 0 8px">${t('tr.sub')}</p><div class="trplan">${planH}</div><div class="row" style="gap:6px;margin:6px 0 10px;flex-wrap:wrap"><button class="btn sm ghost" id="trAdd">+ ${t('tr.addSeg')}</button><button class="btn sm ghost" id="trTn">${t('tr.tunis')}</button>${status}</div>
    <h4 style="margin:10px 0 4px">${t('tr.sjT')}</h4>${sjH}<h4 style="margin:12px 0 4px">${t('tr.nightsT')}</h4><div class="trlist">${nightsH}</div>`);
  const redraw=()=>{save();openTarawih()};
  $$('.trrow').forEach(row=>{const g=T.plan[+row.dataset.i];row.querySelectorAll('[data-f]').forEach(inp=>inp.onchange=()=>{const v=+inp.value;if(v>0){g[inp.dataset.f]=v;redraw()}});row.querySelector('[data-del]').onclick=()=>{if(T.plan.length>1){T.plan.splice(+row.dataset.i,1);redraw()}}});
  $('#trAdd').onclick=()=>{T.plan.push({n:1,r:10,u:1});redraw()};$('#trTn').onclick=()=>{T.plan=[{n:22,r:10,u:2},{n:4,r:10,u:1}];redraw()};
  if(!QB.hafs)qLoadPack('hafs').then(()=>{if($('.trlist'))openTarawih()}).catch(()=>{})}
/* tonight's portion on the home page during Ramadan */
{const _rte12=renderTodayEv;renderTodayEv=function(){_rte12();const box=$('#todayEv');if(!box||S.settings.tarChip===false)return;const n=tarTonight();if(!n)return;const S2=tarSchedule(),N=S2.nights.find(x=>x.n===n);if(!N)return;const rk=N.rk.filter(Boolean);if(!rk.length)return;
  const sj=S2.sj.filter(x=>x.night===n);box.insertAdjacentHTML('afterbegin',`<span class="evchip big" data-tr3 style="--c:#8b5cf6"><i></i>🕌 ${t('tr.chip',tarLabel(rk[0].a,rk[0].u))}${sj.length?' · ۩ '+sj.map(x=>t('tr.rkN',x.rk)).join('، '):''}</span>`);box.querySelector('[data-tr3]').onclick=openTarawih}}
/* entry points: the Quran side panel and the Ramadan board */
{const _rqs2=renderQSide;renderQSide=function(){_rqs2();try{const r=$('.qx3 .row');if(r&&!$('#trBtn')){r.insertAdjacentHTML('beforeend',`<button class="btn sm ghost" id="trBtn">🌙 ${t('tr.btn')}</button>`);$('#trBtn').onclick=openTarawih}}catch(e){}}}
{const _or=openRamadan;openRamadan=function(){_or();const b=$('#infoBox .infob');if(b)b.insertAdjacentHTML('beforeend',`<button class="btn sm" id="trFromRam" style="margin-top:10px">🌙 ${t('tr.btn')}</button>`);const x=$('#trFromRam');if(x)x.onclick=openTarawih}}
/* ---- sleep in several periods, from–to, shown on the day strip ---- */
function slPeriods(d){const s=d&&d.sleep3;if(!s)return[];if(s.p)return s.p;if(s.bed&&s.wake)return[{f:s.bed,t:s.wake}];return[]}
function slMins(p){const [a,b]=p.f.split(':').map(Number),[c,e]=p.t.split(':').map(Number);let m=(c*60+e)-(a*60+b);if(m<=0)m+=1440;return m}
function slSpans(k){const d=S.days[k],day0=keyToDate(k).getTime();return slPeriods(d).map(p=>{const m=slMins(p),[c,e]=p.t.split(':').map(Number);const end=day0+(c*60+e)*6e4;return{t0:end-m*6e4,t1:end,p}})}
openSleep=function(){const k=todayKey(),d=day(k);let L_=slPeriods(d).map(x=>({...x}));if(!L_.length)L_=[{f:'23:00',t:'06:00'}];
  const draw=()=>{const tot=L_.reduce((a,p)=>a+slMins(p),0);$('#infoBox .infob').innerHTML=`<p class="muted" style="margin:0 0 8px">${t('sl4.sub')}</p><div class="slrows">${L_.map((p,i)=>`<div class="slrow" data-i="${i}"><label>${t('sl4.from')}<input class="in" type="time" data-f="f" value="${p.f}"></label><label>${t('sl4.to')}<input class="in" type="time" data-f="t" value="${p.t}"></label><small>${fmtHM(slMins(p)*6e4)}</small><button class="btn sm ghost" data-del="${i}">✕</button></div>`).join('')}</div>
    <div class="row" style="gap:6px;margin:8px 0"><button class="btn sm ghost" id="slAdd">+ ${t('sl4.add')}</button><span style="flex:1"></span><b>${t('sl4.total',fmtHM(tot*6e4))}</b></div><button class="btn pri" id="slSave">${t('ev.save')}</button>`;
    $$('.slrow').forEach(r=>{const p=L_[+r.dataset.i];r.querySelectorAll('[data-f]').forEach(inp=>inp.onchange=()=>{if(inp.value){p[inp.dataset.f]=inp.value;draw()}});r.querySelector('[data-del]').onclick=()=>{L_.splice(+r.dataset.i,1);draw()}});
    $('#slAdd').onclick=()=>{L_.push({f:'14:00',t:'14:30'});draw()};
    $('#slSave').onclick=()=>{const tot=L_.reduce((a,p)=>a+slMins(p),0),h=Math.round(tot/6)/10;if(L_.length)d.sleep3={p:L_,h};else delete d.sleep3;const hb=hbFind('sleep');if(hb&&hb.type==='hours')hbSet(hb,L_.length?h:null);else save();$$('.modal.on').forEach(m=>m.classList.remove('on'));if(L_.length)toast(t('sl3.saved',h));renderTodayEv();renderDayTL()}};
  openInfo('😴 '+t('sl3.t'),'');draw()};
{const _rdt=renderDayTL;renderDayTL=function(){_rdt();try{const box=$('#dayTL'),bar=box&&box.querySelector('.bar');if(!bar)return;const k=todayKey(),sp=slSpans(k);if(!sp.length)return;
  const segs=timeline(k),pt=prayerTimes(keyToDate(k)),now=Date.now(),first=segs.length?segs[0].t0:pt.fajr,lastE=segs.length?Math.max(...segs.map(x=>x.t0+x.ms)):0;
  let a=Math.min(pt.fajr,first),b=Math.max(pt.isha+36e5,lastE,Math.min(now,pt.isha+3*36e5));const a2=Math.min(a,Math.max(Math.min(...sp.map(x=>x.t0)),keyToDate(k).getTime()-3*36e5));
  if(a2<a){/* re-render with a wider range */const W=b-a2,x=v=>((v-a2)/W*100).toFixed(2)+'%',rtl=document.documentElement.dir==='rtl',side=rtl?'right':'left';
    box.innerHTML=`<h4>${t('dtl.t')}</h4><div class="bar">${segs.map(s=>`<i style="${side}:${x(s.t0)};width:${(s.ms/W*100).toFixed(2)}%;background:${catOf(s.cat).color}" title="${esc(catName(catOf(s.cat)))} ${fmtT(s.t0)}–${fmtT(s.t0+s.ms)}"></i>`).join('')}${now>a2&&now<b?`<i class="nw" style="${side}:${x(now)}"></i>`:''}</div><div class="pts">${['fajr','dhuhr','asr','maghrib','isha'].map(p=>`<span style="${side}:${x(pt[p])};${rtl?'transform:translateX(50%)':''}">${t('pr.'+p)}<br>${fmtT(pt[p])}</span>`).join('')}</div>`;a=a2}
  const W=b-a,x=v=>((v-a)/W*100).toFixed(2)+'%',side=document.documentElement.dir==='rtl'?'right':'left',br=box.querySelector('.bar');
  sp.forEach(s=>{const t0=Math.max(a,s.t0),t1=Math.min(b,s.t1);if(t1<=t0)return;br.insertAdjacentHTML('afterbegin',`<i class="slp" style="${side}:${x(t0)};width:${((t1-t0)/W*100).toFixed(2)}%" title="😴 ${s.p.f}–${s.p.t}"></i>`)});
  if(!box.querySelector('.slleg'))box.insertAdjacentHTML('beforeend',`<div class="slleg"><i></i> ${t('sl4.leg')}</div>`)}catch(e){console.error(e)}}}
function renderE2Set(){const st=S.settings;const a=$('#tarChipT');if(a)toggle(a,st.tarChip!==false,v=>{st.tarChip=v});const b=$('#tarOpenBtn');if(b)b.onclick=openTarawih}
{const _rs24=renderSettings;renderSettings=function(){_rs24();try{renderE2Set()}catch(e){console.error(e)}}}
