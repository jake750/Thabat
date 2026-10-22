/* ============ v3.89.0: worship — a Ramadan plan (goals and the month at a glance), your mosque's Jumu'ah time on Fridays, a log of nawafil with a weekly count ============ */
/* old 33: S.rmPlan[hijriYear] = {kh: khatmas, qy: tarawih nights, sd: charity days, goals:[{id,t,done}]} (synced). The month grid reads the daily tracker day.ram (3.3). */
try{if(Array.isArray(SY_SIMPLE)&&!SY_SIMPLE.includes('rmPlan'))SY_SIMPLE.push('rmPlan')}catch(e){}
const RMP={days:{}};
function rmpYear(){const h=hNum(keyToDate(todayKey()));return h.m<=9?h.y:h.y+1}
function rmpDays(hy){if(RMP.days[hy])return RMP.days[hy];const out=[],t0=keyToDate(todayKey());for(let i=-400;i<=420;i++){const d=addDays(t0,i),h=hNum(d);if(h.y===hy&&h.m===9)out.push(dKey(d));else if(out.length)break}return RMP.days[hy]=out}
function rmpCfg(hy){if(!S.rmPlan)S.rmPlan={};return S.rmPlan[hy]||(S.rmPlan[hy]={kh:1,qy:30,sd:10,goals:[]})}
function rmpPages(k){const q=S.days[k]&&S.days[k].quran;return q?Math.max(+q.read||0,(q.pgs||[]).length):0}
const RMP_ROWS=[['fast','rm3.fast'],['tar','rm3.tar'],['juz','rmp.juz'],['sad','rm3.sad'],['dua','rm3.dua'],['iftar','rm3.iftar']];
function rmpOpen(hy){hy=hy||rmpYear();const C=rmpCfg(hy),D=rmpDays(hy),tk=todayKey();if(!D.length){toast(t('rmp.none'));return}
  const cnt=k=>D.filter(d=>S.days[d]&&S.days[d].ram&&S.days[d].ram[k]).length,pages=D.reduce((s,d)=>s+rmpPages(d),0),pgGoal=604*(+C.kh||0);
  const tgt={tar:+C.qy||0,sad:+C.sd||0,fast:D.length},cell=(d,on,cls='')=>`<i class="${on?'on ':''}${d===tk?'td ':''}${cls}" title="${esc(gShort(keyToDate(d)))}"></i>`;
  const ix=D.indexOf(tk),started=ix>=0||tk>D[D.length-1],head=ix>=0?t('rm3.t',ix+1):tk<D[0]?t('rmp.in',Math.round((keyToDate(D[0])-keyToDate(tk))/864e5)):t('rmp.past');
  openInfo('🌙 '+esc(t('rmp.t',hy)),`<div class="rmpw" data-hy="${hy}"><p class="muted rmpsub">${esc(gShort(keyToDate(D[0])))} – ${esc(gShort(keyToDate(D[D.length-1])))} · ${esc(head)}</p>
    <h4>${esc(t('rmp.goals'))}</h4><div class="rmpg">
      <label>${esc(t('rmp.kh'))}<select class="in" data-rmp="kh">${[0,1,2,3,4].map(n=>`<option value="${n}"${+C.kh===n?' selected':''}>${n||'—'}</option>`).join('')}</select><small>${C.kh?esc(t('rmp.perDay',Math.ceil(604*C.kh/D.length))):''}</small></label>
      <label>${esc(t('rmp.qy'))}<input class="in num" type="number" min="0" max="30" value="${+C.qy||0}" data-rmp="qy"></label>
      <label>${esc(t('rmp.sd'))}<input class="in num" type="number" min="0" max="30" value="${+C.sd||0}" data-rmp="sd"></label></div>
    <div class="rmpgl">${C.goals.map(g=>`<label class="rmpgi"><input type="checkbox" data-rmg="${g.id}"${g.done?' checked':''}><span dir="auto">${esc(g.t)}</span><button class="btn sm ghost" data-rmx="${g.id}" aria-label="✕">✕</button></label>`).join('')}
      <div class="rmpadd"><input class="in" id="rmpN" dir="auto" placeholder="${esc(t('rmp.goalPh'))}"><button class="btn sm" id="rmpA">${esc(t('rmp.add'))}</button></div></div>
    ${started?`<h4>${esc(t('rmp.month'))}</h4><div class="rmpgrid" style="--n:${D.length}">${RMP_ROWS.map(([k,l])=>`<b>${esc(t(l,'').replace(/\s*\{0\}|\s+$/g,''))}</b><span class="rmpc">${D.map((d,i)=>cell(d,S.days[d]&&S.days[d].ram&&S.days[d].ram[k],i>=20?'l10':'')).join('')}</span><em>${cnt(k)}${tgt[k]?' / '+tgt[k]:''}</em>`).join('')}
      <b>${esc(t('rmp.pages'))}</b><span class="rmpc">${D.map((d,i)=>{const p=rmpPages(d);return`<i class="${p?'p'+Math.min(4,1+Math.floor(p/10)):''}${d===tk?' td':''}${i>=20?' l10':''}" title="${esc(gShort(keyToDate(d))+' · '+p)}"></i>`}).join('')}</span><em>${pages}${pgGoal?' / '+pgGoal:''}</em></div>
      <p class="muted rmpl10">${esc(t('rmp.l10'))}</p>`:`<p class="muted">${esc(t('rmp.before'))}</p>`}</div>`);
  const box=$('#infoBox');box.classList.add('rmpbox');const w=box.querySelector('.rmpw');
  w.addEventListener('change',e=>{const x=e.target;if(x.dataset.rmp){C[x.dataset.rmp]=Math.max(0,Math.min(x.dataset.rmp==='kh'?4:30,Math.round(+x.value||0)));save();rmpOpen(hy)}else if(x.dataset.rmg){const g=C.goals.find(y=>y.id===x.dataset.rmg);if(g){g.done=x.checked?1:0;save()}}});
  w.addEventListener('click',e=>{const b=e.target.closest('[data-rmx]');if(b){e.preventDefault();C.goals=C.goals.filter(g=>g.id!==b.dataset.rmx);save();rmpOpen(hy)}});
  const add=()=>{const v=($('#rmpN').value||'').trim();if(!v)return;C.goals.push({id:uid(),t:v.slice(0,140),done:0});save();rmpOpen(hy)};$('#rmpA').onclick=add;$('#rmpN').onkeydown=e=>{if(e.key==='Enter')add()}}
{const _o=openRamadan;openRamadan=function(...a){const r=_o(...a);try{const b=$('#infoBox');if(b&&!b.querySelector('#rmpB')){b.querySelector('.pmstat')?.insertAdjacentHTML('afterend',`<button class="btn sm" id="rmpB">📋 ${esc(t('rmp.btn'))}</button>`);const x=$('#rmpB');if(x)x.onclick=()=>rmpOpen()}}catch(e){}return r}}

/* old 38: Jumu'ah at your mosque — your own time, or the time on your Mawaqit page; shown instead of Dhuhr on Fridays, with a reminder */
function jumCfg(){return Object.assign({t:'',rem:30,on:true},S.settings.jum2||{})}
function jumTime(){const c=jumCfg(),P=S.settings.prayer||{};return c.t||(P.mqJum&&P.mqJum.t)||''}
function jumIsFri(k){return keyToDate(k||todayKey()).getDay()===5}
{const _g=mqGet;mqGet=async function(url,text,...a){const r=await _g(url,text,...a);try{if(text&&/mawaqit\.net/.test(url)&&typeof r==='string'){const m=r.match(/jumua&quot;:&quot;(\d{1,2}:\d{2})|"jumua"\s*:\s*"(\d{1,2}:\d{2})"/),m2=r.match(/jumua2&quot;:&quot;(\d{1,2}:\d{2})|"jumua2"\s*:\s*"(\d{1,2}:\d{2})"/);
  if(m){S.settings.prayer.mqJum={t:m[1]||m[2],t2:m2?(m2[1]||m2[2]):null,at:Date.now()};save()}}}catch(e){}return r}}
setTimeout(async()=>{try{const P=S.settings.prayer,dw=keyToDate(todayKey()).getDay();if(P.source!=='mawaqit'||!P.mq||!P.mq.slug||jumCfg().t)return;if(dw!==4&&dw!==5)return;if(P.mqJum&&Date.now()-P.mqJum.at<3*864e5)return;if(!ANDROID&&!await helperWait(3000))return;await mqGet('https://mawaqit.net/ar/'+P.mq.slug,true)}catch(e){}},11000);
function jumPaint(){if(!jumIsFri()||!jumCfg().on)return;const jt=jumTime(),dn=t('pr.dhuhr');
  $$('#v-today .pr').forEach(c=>{const b=c.querySelector('b');if(!b||b.textContent.trim()!==dn)return;const s=c.querySelector('span');b.textContent=t('jum2.name');if(jt&&s){c.title=t('jum2.tip',s.textContent.trim());s.textContent=jt}c.classList.add('jumpr')});
  const nl=$('#nextLine b');if(nl&&nl.textContent.trim()===dn){nl.textContent=t('jum2.name');if(jt&&!$('#nextLine .jumat'))nl.insertAdjacentHTML('afterend',` <span class="jumat">· ${esc(t('jum2.at',jt))}</span>`)}}
{hookFn('renderToday',()=>renderToday,f=>{renderToday=f},'post',function(){try{jumPaint()}catch(e){}})}
{hookFn('extraSched',()=>extraSched,f=>{extraSched=f},'post',function(out,now){try{const c=jumCfg(),jt=jumTime();if(!jt||!(+c.rem>0))return;const td=keyToDate(todayKey());
  for(let i=0;i<8;i++){const d=addDays(td,i);if(d.getDay()!==5)continue;const at=atTime(d,jt)-c.rem*6e4;if(at>now)out.push({id:9480+i,t:at,title:'🕌 '+t('jum2.remT',c.rem),body:t('jum2.remB',jt),open:'today'})}}catch(e){}})}
function jumRow(){const a=$('[data-i18n="set.jumua"]'),f=a&&a.closest('.field');if(!f||$('#jum2Row'))return;const c=jumCfg(),P=S.settings.prayer||{},mq=P.mqJum&&P.mqJum.t;
  f.insertAdjacentHTML('afterend',`<div class="field" id="jum2Row"><div><label data-i18n="jum2.set">${t('jum2.set')}</label><small>${esc(mq?t('jum2.fromMq',mq):t('jum2.setSub'))}</small></div><div class="inline jum2c"><input class="in" type="time" id="jum2T" value="${esc(c.t)}" aria-label="${esc(t('jum2.set'))}"><select class="in" id="jum2R" aria-label="${esc(t('jum2.rem'))}">${[0,15,30,45,60,90].map(n=>`<option value="${n}"${+c.rem===n?' selected':''}>${n?esc(t('jum2.remN',n)):esc(t('jum2.remOff'))}</option>`).join('')}</select></div></div>`);
  const sv=()=>{S.settings.jum2=Object.assign(jumCfg(),{t:$('#jum2T').value||'',rem:+$('#jum2R').value||0});save();try{androidSchedule&&androidSchedule()}catch(e){}};$('#jum2T').onchange=sv;$('#jum2R').onchange=sv}

/* old 40: nawafil beyond the rawatib — day.nfl = {duha: rak'at, tah: times, wudu: times, qiyam: rak'at, witr: times}; a Today chip, a sheet with this week vs last week */
const NFL=[['duha','🌤','nfl.duha',2,'nfl.rk'],['tah','🕌','nfl.tah',1,'nfl.tm'],['wudu','💧','nfl.wudu',1,'nfl.tm'],['qiyam','✨','nfl.qiyam',2,'nfl.rk'],['witr','🌙','nfl.witr',1,'nfl.tm']];
function nflDay(k){const d=day(k||todayKey());return d.nfl||(d.nfl={})}
function nflRw(k){return Object.keys(RAWATIB).reduce((s,p)=>s+snCount(k,p),0)}
function nflSum(k){const n=S.days[k]&&S.days[k].nfl;return n?NFL.reduce((s,[x])=>s+(n[x]?1:0),0):0}
function nflWeek(off){const td=keyToDate(todayKey()),o={rw:0};NFL.forEach(([x])=>o[x]=0);let days=0;for(let i=0;i<7;i++){const k=dKey(addDays(td,-(i+off*7))),n=S.days[k]&&S.days[k].nfl,rw=nflRw(k);o.rw+=rw;if(rw||n&&Object.values(n).some(v=>v))days++;NFL.forEach(([x])=>{o[x]+=n&&+n[x]||0})}return{o,days}}
function nflOpen(){const n=nflDay(),W=nflWeek(0),P=nflWeek(1);
  openInfo('🤲 '+esc(t('nfl.t')),`<div class="nflw"><p class="muted">${esc(t('nfl.sub'))}</p>${NFL.filter(r=>nflShow(r[0])).map(([k,ic,l,st,u])=>`<div class="nflr"><span>${ic} ${esc(t(l))}</span><button class="btn sm ghost" data-nfl="${k}" data-d="-${st}" aria-label="−">−</button><b>${+n[k]||0}</b><button class="btn sm" data-nfl="${k}" data-d="${st}" aria-label="+">+${st}</button><small>${esc(t(u))}</small></div>`).join('')}
    <div class="nflr nflrw"><span>📿 ${esc(t('nfl.rw'))}</span><div class="nflrwb">${Object.keys(RAWATIB).map(p=>{const v=snCount(todayKey(),p);return`<button class="btn sm ${v?'':'ghost'}" data-nrw="${p}">${esc(t('pr.'+p))} ${v}</button>`}).join('')}</div><b>${nflRw(todayKey())}</b><small>${esc(t('nfl.rk'))}</small></div>
    <p class="nfltot">${esc(t('nfl.tot',nflRk(todayKey())))}${+n.witr?' '+esc(t('nfl.totW',+n.witr)):''}</p>
    <h4>${esc(t('nfl.week'))}</h4><div class="nflwk">${[['rw','📿','nfl.rw']].concat(NFL.filter(r=>nflShow(r[0],null,W,P))).map(([k,ic,l])=>{const a=W.o[k],b=P.o[k];return`<div><span>${ic}</span><b>${a}</b><small>${esc(t(l))}</small>${a!==b?`<i class="${a>b?'up':'dn'}">${a>b?'▲':'▼'}${Math.abs(a-b)}</i>`:''}</div>`}).join('')}</div>
    <p class="muted">${esc(t('nfl.days',W.days,P.days))}</p></div>`);
  const box=$('#infoBox');box.classList.add('nflbox');box.querySelector('.nflw').addEventListener('click',e=>{const rb=e.target.closest('[data-nrw]');if(rb){const p=rb.dataset.nrw,mx=RAWATIB[p],v=snCount(todayKey(),p);snSet(todayKey(),p,v>=mx?0:mx<=2?mx:v+2);try{renderPrayers()}catch(x){}nflOpen();try{renderTodayEv()}catch(x){}return}const b=e.target.closest('[data-nfl]');if(!b)return;const d=nflDay(),k=b.dataset.nfl;d[k]=Math.max(0,(+d[k]||0)+(+b.dataset.d));if(!d[k])delete d[k];nflChanged(todayKey());nflOpen();})}
{hookFn('renderTodayEv',()=>renderTodayEv,f=>{renderTodayEv=f},'post',function(){try{const box=$('#todayEv');if(!box||box.querySelector('[data-nflc]'))return;
  const n=S.days[todayKey()]&&S.days[todayKey()].nfl,c=(n?NFL.filter(([x])=>+n[x]).length:0)+(nflRw(todayKey())?1:0);box.insertAdjacentHTML('beforeend',`<span class="evchip" data-nflc style="--c:#10b981"><i></i>🤲 ${esc(t('nfl.chip'))}${c?' · '+c:''}</span>`);box.querySelector('[data-nflc]').onclick=nflOpen;
  const h=hNum(keyToDate(todayKey())),hy=h.y+1;if(h.m===8&&h.d>=10&&!(S.rmPlan&&S.rmPlan[hy])){box.insertAdjacentHTML('beforeend',`<span class="evchip" data-rmpc style="--c:#8b5cf6"><i></i>🌙 ${esc(t('rmp.chip'))}</span>`);box.querySelector('[data-rmpc]').onclick=()=>rmpOpen(hy)}}catch(e){console.error(e)}})}

/* settings (season row) and Ctrl+K */
{hookFn('renderSettings',()=>renderSettings,f=>{renderSettings=f},'post',function(){try{jumRow();const r=$('#ssnSet .ssnbtns');if(r&&!$('#rmpSetB')){r.insertAdjacentHTML('beforeend',`<button class="btn sm ghost" id="rmpSetB">🌙 ${esc(t('rmp.btn'))}</button><button class="btn sm ghost" id="nflSetB">🤲 ${esc(t('nfl.t'))}</button>`);$('#rmpSetB').onclick=()=>rmpOpen();$('#nflSetB').onclick=nflOpen}}catch(e){console.error(e)}})}
{const _c=cmdCommands;cmdCommands=function(...a){const L_=_c(...a);try{const c=(icon,label,run,kw)=>({icon,label,run,kw:kw||''});return L_.concat([c('🌙',t('rmp.btn'),()=>rmpOpen(),'ramadan plan رمضان خطة ختمة'),c('🤲',t('nfl.t'),nflOpen,'nawafil duha witr qiyam نوافل الضحى الوتر قيام')])}catch(e){return L_}}}
{hookFn('openInfo',()=>openInfo,f=>{openInfo=f},'pre',function(){try{const b=$('#infoBox');if(b)b.classList.remove('rmpbox','nflbox')}catch(e){}})}
