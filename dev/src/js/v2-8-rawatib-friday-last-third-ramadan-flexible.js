/* ============ v2.8: rawatib, friday, last third, ramadan, flexible wird, khatma history, hifz test, smart review ============ */
const RAWATIB={fajr:2,dhuhr:6,maghrib:2,isha:2};
function snCount(dk,k){const d=S.days[dk],v=d&&d.sunnah&&d.sunnah[k];if(!v)return 0;return v===1&&RAWATIB[k]>1?RAWATIB[k]:Math.min(RAWATIB[k]||0,+v)}
function snHas(dk,k){return snCount(dk,k)>0}
function snSet(dk,k,n){const d=day(dk);d.sunnah=d.sunnah||{};if(n>0)d.sunnah[k]=n;else delete d.sunnah[k];save()}
function snToggle(dk,k){snSet(dk,k,snHas(dk,k)?0:RAWATIB[k])}
function snPick(dk,k,x,y,done){const mx=RAWATIB[k],cur=snCount(dk,k),opts=[];for(let i=0;i<=mx;i+=2)opts.push(i);const p=qPopAt(`<div class="aymh">${t('sn.lbl')} — ${t('pr.'+k)} <small>(${t('sn.'+k)})</small></div>${opts.map(n=>`<button data-n="${n}" class="${cur===n?'on':''}">${n?t('sn.rk',n,mx):t('sn.none')}</button>`).join('')}`,x,y,'aymenu');p.querySelectorAll('[data-n]').forEach(b=>b.onclick=()=>{closePP();snSet(dk,k,+b.dataset.n);done&&done()})}
{const _sp=showPrayPop;showPrayPop=function(){_sp();const P=S.prayPop,b=$('#pSunnah');if(!P||!b)return;b.hidden=!RAWATIB[P.k];const draw=()=>{const n=snCount(P.dk||todayKey(),P.k),mx=RAWATIB[P.k];b.classList.toggle('on',n>0);b.textContent=(n>=mx?'☑ ':n?'◐ ':'☐ ')+t('sn.lbl')+' — '+(n?t('sn.rk',n,mx):t('sn.'+P.k))};draw();b.onclick=()=>{if(RAWATIB[P.k]<=2){snToggle(P.dk||todayKey(),P.k);draw();return}const r=b.getBoundingClientRect();snPick(P.dk||todayKey(),P.k,r.left+r.width/2,r.top-120,draw)}}}
{const _rbp=renderBriefPray;renderBriefPray=function(){_rbp();const box=$('#bPray');if(!box)return;const keys=periodKeys(bMode,bAnchor).filter(k=>k<=todayKey()&&k>=plSince());let n=0,m=0;keys.forEach(k=>Object.keys(RAWATIB).forEach(p=>{m+=RAWATIB[p];n+=snCount(k,p)}));void 0/* 3.98: in the nawafil card #bNfl */}}
/* friday */
function jumuaOn(){return S.settings.jumua!==false}
function isFri(k){return keyToDate(k).getDay()===5}
function jumuaChip(){const k=todayKey();if(!jumuaOn()||!isFri(k))return'';const J=(S.days[k]&&S.days[k].jumua)||{};return`<span class="evchip jm">🕌 ${t('jm.t')}${['ghusl','early','sal'].map(x=>`<button class="btn sm ${J[x]?'on':''}" data-jm="${x}">${J[x]?'✓ ':''}${t('jm.'+x)}</button>`).join('')}</span>`}
function bindJumua(box){box.querySelectorAll('[data-jm]').forEach(b=>b.onclick=e=>{e.stopPropagation();const d=day(todayKey());d.jumua=d.jumua||{};d.jumua[b.dataset.jm]=d.jumua[b.dataset.jm]?0:1;save();renderTodayEv()})}
/* last third of the night, ramadan */
function lastThird(dk){const d=keyToDate(dk),a=prayerTimes(d).maghrib,f=prayerTimes(addDays(d,1)).fajr;return f-(f-a)/3}
function qiyamCfg(){return Object.assign({on:false,off:0},S.settings.qiyam||{})}
function ramCfg(){return Object.assign({suhoor:true,min:45},S.settings.ramadan||{})}
function daysToRamadan(){const td=keyToDate(todayKey());for(let i=1;i<=40;i++){const h=hNum(addDays(td,i));if(h.m===9&&h.d===1)return i}return 0}
function nightChips(){const k=todayKey(),now=Date.now(),pt=prayerTimes(keyToDate(k)),h=hNum(keyToDate(k)),out=[];
  if(h.m===9){const ift=pt.maghrib,ims=pt.fajr-10*6e4;let x=`🌙 ${t('rm.day',h.d)}`;if(now<ims)x+=` · ${t('rm.imsak')} ${fmtT(ims)}`;else if(now<ift){const m=Math.round((ift-now)/6e4);x+=` · ${t('rm.iftar')} ${fmtT(ift)} (${m>=60?t('dur.hm',Math.floor(m/60),m%60):minW(m)})`}else x+=` · ${t('rm.tom',fmtT(prayerTimes(addDays(keyToDate(k),1)).fajr-10*6e4))}`;out.push(`<span class="evchip big" style="--c:#a855f7">${x}</span>`)}
  else if(h.m===8||(h.m===7&&h.d>=20)){const n=daysToRamadan();if(n)out.push(`<span class="evchip" style="--c:#a855f7"><i></i>${t('rm.left',n)}</span>`)}
  if(qiyamCfg().on||h.m===9){const yk=dKey(addDays(keyToDate(k),-1)),lt=now<pt.fajr?lastThird(yk):lastThird(k);if(now>pt.isha||now<pt.fajr)out.push(`<span class="evchip" style="--c:#6366f1"><i></i>${t('qy.chip',fmtT(lt))}</span>`)}
  return out.join('')}
{const _rte=renderTodayEv;renderTodayEv=function(){_rte();const box=$('#todayEv');if(!box)return;box.insertAdjacentHTML('afterbegin',nightChips()+jumuaChip());bindJumua(box)}}
function prayExtraCheck(){const now=Date.now(),k=todayKey(),pt=prayerTimes(keyToDate(k));
  if(jumuaOn()&&isFri(k)){const at=pt.sunrise+36e5,nk=k+'jumua';if(now>=at&&now<at+4*36e5&&!S.notified[nk]){S.notified[nk]=1;save();alertUser(t('jm.remT'),t('jm.remB'),ICON_MOSQUE)}}
  const Q=qiyamCfg();if(Q.on){const yk=dKey(addDays(keyToDate(k),-1)),lt=lastThird(yk)+Q.off*6e4,nk=k+'qiyam';if(now>=lt&&now<pt.fajr&&!S.notified[nk]){S.notified[nk]=1;save();alertUser(t('qy.remT'),t('qy.remB',fmtT(pt.fajr)),ICON_MOON)}}
  const R=ramCfg(),h=hNum(keyToDate(k));if(R.suhoor&&(h.m===9)){const at=pt.fajr-R.min*6e4,nk=k+'suhoor';if(now>=at&&now<pt.fajr&&!S.notified[nk]){S.notified[nk]=1;save();alertUser(t('rm.suhT'),t('rm.suhB',fmtT(pt.fajr)),ICON_MOON)}}}
setInterval(prayExtraCheck,6e4);setTimeout(prayExtraCheck,6000);setInterval(()=>{if(curView()==='today')renderTodayEv()},6e4);
{const _es=extraSched;extraSched=function(out,now){_es(out,now);try{const td=keyToDate(todayKey());for(let i=0;i<4;i++){const d=addDays(td,i),k=dKey(d),pt=prayerTimes(d);
  if(jumuaOn()&&d.getDay()===5){const at=pt.sunrise+36e5;if(at>now)out.push({id:6950+i,t:at,title:t('jm.remT'),body:t('jm.remB')})}
  const Q=qiyamCfg();if(Q.on){const at=lastThird(k)+Q.off*6e4;if(at>now)out.push({id:6960+i,t:at,title:t('qy.remT'),body:t('qy.remB',fmtT(prayerTimes(addDays(d,1)).fajr))})}
  const R=ramCfg();if(R.suhoor&&hNum(d).m===9){const at=pt.fajr-R.min*6e4;if(at>now)out.push({id:6970+i,t:at,title:t('rm.suhT'),body:t('rm.suhB',fmtT(pt.fajr))})}}}catch(e){}}}
/* fasting button on ramadan days too */
{const _fk=fastKinds;fastKinds=function(date){const r=_fk(date);if(hNum(date).m===9&&!r.includes('ram'))r.push('ram');return r}}
/* flexible wird: finish the khatma by a date */
function daysBetween(a,b){return Math.round((keyToDate(b)-keyToDate(a))/864e5)}
function qAutoWird(){const Q=S.quran;if(!Q.target)return;const tk=todayKey();if(Q.wirdCalc===tk)return;const left=Math.max(0,604-qCovered(Q.page)+(qDay(tk).read||0)),days=Math.max(1,daysBetween(tk,Q.target)+1);Q.wird=Math.max(1,Math.ceil(left/days));Q.wirdCalc=tk;save()}
{hookFn('renderQAll',()=>renderQAll,f=>{renderQAll=f},'pre',function(){qAutoWird()})}
{const _rqs=renderQSide;renderQSide=function(){qAutoWird();_rqs();const box=$('#qKhatma'),Q=S.quran;if(!box)return;
  box.insertAdjacentHTML('beforeend',`<div class="ktarget"><span>🎯 ${t('kt.lbl')}</span><input class="in" type="date" id="qTarget" min="${todayKey()}" value="${Q.target||''}">${Q.target?`<small style="color:var(--accent)">${t('kt.need',Q.wird,daysBetween(todayKey(),Q.target)+1)}</small><button class="link" id="qTargetX">✕</button>`:''}</div>`+(Q.khatmas.length?`<details class="khist"><summary>${t('kh.title',Q.khatmas.length)}</summary><ol>${Q.khatmas.map((x,i)=>`<li><b>${t('kh.n',i+1)}</b> <small>${x.start?gShort(keyToDate(x.start))+' → ':''}${gStr(keyToDate(x.end))}${x.start?' · '+t('kh.days',daysBetween(x.start,x.end)+1):''}</small></li>`).join('')}</ol></details>`:''));
  $('#qTarget').onchange=e=>{Q.target=e.target.value||null;Q.wirdCalc=null;if(!Q.target)delete Q.target;save();renderQAll()};const x=$('#qTargetX');if(x)x.onclick=()=>{delete Q.target;Q.wirdCalc=null;save();renderQAll()}}}
/* smart review (spaced) */
function qSmart(){return S.quran.smart!==false}
function hzStat(p){return(S.quran.hz||{})[p]||{ok:0,bad:0}}
function qWeak(p){const h=hzStat(p);return h.bad>0&&h.bad>=h.ok}
{const _rs=qReviewSuggest;qReviewSuggest=function(){if(!qSmart())return _rs();const M=qMem();if(!M.length)return[];const Q=S.quran,L_=Q.rvLast||{},tk=todayKey(),n=Math.min(Q.review,M.length);
  const sc=M.map(p=>{const last=L_[p],days=last?Math.max(0,daysBetween(last,tk)):60,h=hzStat(p),w=Math.max(0,h.bad-h.ok*0.5);return[p,days*(1+w*0.6)+w*3]});
  sc.sort((a,b)=>b[1]-a[1]||a[0]-b[0]);return sc.slice(0,n).map(x=>x[0]).sort((a,b)=>a-b)}}
{const _qt=qToggle;qToggle=function(kind){_qt(kind);if(kind==='review'){const q=qDay(todayKey()),Q=S.quran;if(q.review&&q.rv){Q.rvLast=Q.rvLast||{};q.rv.forEach(p=>Q.rvLast[p]=todayKey());save()}}}}
{const _rqm=renderQMap;renderQMap=function(){_rqm();const box=$('#qMap');if(!box)return;$$('#qMap .hc[data-p]').forEach(c=>{if(qWeak(+c.dataset.p))c.classList.add('weak')});
  const h3=box.querySelector('h3');if(h3&&!box.querySelector('.hzbar'))h3.insertAdjacentHTML('afterend',`<div class="hzbar"><button class="btn sm" id="hzBtn" ${qMem().length?'':'disabled'}>🎯 ${t('hz.btn')}</button>${(()=>{const w=qMem().filter(qWeak).length;return w?`<small style="color:#f87171;align-self:center">${t('hz.weakN',w)}</small>`:''})()}</div>`);const b=$('#hzBtn');if(b)b.onclick=()=>openHz()}}
/* memorization test */
const HZ={scope:'all',cur:null,ok:0,bad:0};
async function openHz(){$('#hzModal').classList.add('on');$('#hzBox').innerHTML=`<div class="qload"><div class="spin"></div></div>`;try{await qLoadPack('hafs')}catch(e){$('#hzBox').innerHTML=`<div class="empty">${t('q.tfsFail')}</div>`;return}HZ.ok=HZ.bad=0;hzNext()}
function hzPool(){const M=qMem();if(HZ.scope==='review'){const q=qDay(todayKey());const r=(q.rv&&q.rv.length?q.rv:qReviewSuggest());return r.length?r:M}if(HZ.scope==='weak'){const w=M.filter(qWeak);return w.length?w:M}return M}
function hzNext(){const pool=hzPool();if(!pool.length){$('#hzBox').innerHTML=`<div class="empty">${t('q.noMem')}</div>`;return}
  let tries=0,p,ay;do{p=pool[Math.floor(Math.random()*pool.length)];ay=qPageAyat(p);tries++}while(ay.length<2&&tries<20);if(ay.length<2){$('#hzBox').innerHTML=`<div class="empty">${t('q.tfsFail')}</div>`;return}
  const j=Math.floor(Math.random()*(ay.length-1)),[s,a]=ay[j],[s2,a2]=ay[j+1],full=qAyahText(s,a,'hafs'),words=full.split(' '),cue=words.slice(0,Math.min(4,Math.max(2,Math.ceil(words.length/4)))).join(' ');
  HZ.cur={p,s,a,s2,a2};renderHz(cue,false)}
function renderHz(cue,shown){const c=HZ.cur,box=$('#hzBox');
  box.innerHTML=`<h2 style="font-size:18px;display:flex;align-items:center;gap:8px">🎯 ${t('hz.t')}<span class="hzscore">${HZ.ok+HZ.bad?`✓ ${HZ.ok} · ✗ ${HZ.bad}`:''}</span></h2>
   <div class="seg" id="hzScope" style="margin:8px 0">${['all','review','weak'].map(x=>`<button data-k="${x}" class="${HZ.scope===x?'on':''}">${t('hz.sc.'+x)}</button>`).join('')}</div>
   <div class="hzmeta">${esc(qSurahName(c.s))} · ${t('q.ayahN',c.a)} · ${t('q.pageS')} ${c.p}</div>
   <div class="hzq" dir="rtl">${shown?esc(qAyahText(c.s,c.a,'hafs'))+`<span class="nx">${esc(qAyahText(c.s2,c.a2,'hafs'))}</span>`:esc(cue)+' …'}</div>
   <p class="hzmeta">${t(shown?'hz.judge':'hz.recite')}</p>
   <div class="evact">${shown?`<button class="btn sm" data-r="bad" style="color:#f87171">✗ ${t('hz.bad')}</button><button class="btn sm pri" data-r="ok">✓ ${t('hz.ok')}</button>`:`<button class="btn sm pri" id="hzShow">${t('hz.show')}</button>`}<span style="flex:1"></span><button class="btn sm ghost" id="hzSkip">${t('hz.skip')}</button><button class="btn sm ghost" id="hzClose">${t('ok')}</button></div>`;
  $$('#hzScope button').forEach(b=>b.onclick=()=>{HZ.scope=b.dataset.k;hzNext()});
  const sh=$('#hzShow');if(sh)sh.onclick=()=>renderHz(cue,true);
  box.querySelectorAll('[data-r]').forEach(b=>b.onclick=()=>{const Q=S.quran;Q.hz=Q.hz||{};const h=Q.hz[c.p]||(Q.hz[c.p]={ok:0,bad:0});h[b.dataset.r]++;h.last=todayKey();HZ[b.dataset.r]++;save();hzNext()});
  $('#hzSkip').onclick=hzNext;$('#hzClose').onclick=()=>{$('#hzModal').classList.remove('on');if(curView()==='quran')renderQMap()}}
$('#hzModal').onclick=e=>{if(e.target.id==='hzModal'){$('#hzModal').classList.remove('on');if(curView()==='quran')renderQMap()}};
/* settings */
function renderV28Set(){const st=S.settings;toggle($('#jumuaT'),jumuaOn(),v=>{st.jumua=v;setTimeout(()=>{renderTodayEv();if(ANDROID)androidSchedule()},0)});
  const Q=qiyamCfg();toggle($('#qiyamT'),Q.on,v=>{st.qiyam=Object.assign(qiyamCfg(),{on:v});if(ANDROID)setTimeout(androidSchedule,0)});
  $('#qiyamOff').innerHTML=[0,15,30,45,60].map(m=>`<option value="${m}" ${Q.off===m?'selected':''}>${m?t('qy.after',m):t('qy.start')}</option>`).join('');$('#qiyamOff').onchange=e=>{st.qiyam=Object.assign(qiyamCfg(),{off:+e.target.value});save();if(ANDROID)androidSchedule()};
  const R=ramCfg();toggle($('#suhoorT'),R.suhoor,v=>{st.ramadan=Object.assign(ramCfg(),{suhoor:v});if(ANDROID)setTimeout(androidSchedule,0)});$('#suhoorM').value=R.min;$('#suhoorM').onchange=e=>{st.ramadan=Object.assign(ramCfg(),{min:Math.max(10,+e.target.value||45)});save();if(ANDROID)androidSchedule()};
  toggle($('#qSmartT'),qSmart(),v=>{S.quran.smart=v});
  const wi=$('#qWirdIn');if(wi){wi.disabled=!!S.quran.target;wi.title=S.quran.target?t('kt.lock'):''}}
{hookFn('renderSettings',()=>renderSettings,f=>{renderSettings=f},'post',function(){try{renderV28Set()}catch(e){console.error(e)}})}
