/* ============ 3.109 tenth list C: the week view gets the class timetable, multi-day pieces and event dragging; reminders a week or two before; the Hijri year in review; the Summary by Hijri months ============ */
/* 10th-28 / 29 (his pick «ب»: a piece in each day column, rounded only at the event's first and last day) are drawn by cwkPaint itself (g115, changed in place):
   class items .wki.cls from stuToday(k), multi-day pieces .wki.mds / .mdm / .mde with «2/3» on the later pieces */
/* 10th-30: PC — drag an event (not a repeating or a Google one) to another day column of the week view; one undo */
function wkdAttach(){const box=$('#cal');if(!box||!box.classList.contains('calwk')||MOB.matches)return;
  box.querySelectorAll('.wki.ev[data-ev]').forEach(el=>{const e=EVS().find(x=>x.id===el.dataset.ev);if(!e||String(e.id).startsWith('ics:')||(e.rep&&e.rep!=='none'))return;el.draggable=true;el.classList.add('wkdrag');
    el.ondragstart=ev=>{ev.dataTransfer.setData('text/thabat-ev',e.id+'|'+el.closest('.wkc').dataset.k);ev.dataTransfer.effectAllowed='move';el.classList.add('wkdragging')};el.ondragend=()=>el.classList.remove('wkdragging')});
  box.querySelectorAll('.wkc').forEach(c=>{c.ondragover=ev=>{if([...ev.dataTransfer.types].includes('text/thabat-ev')){ev.preventDefault();c.classList.add('wkdrop')}};c.ondragleave=()=>c.classList.remove('wkdrop');
    c.ondrop=ev=>{c.classList.remove('wkdrop');const v=ev.dataTransfer.getData('text/thabat-ev');if(!v)return;ev.preventDefault();const [id,from]=v.split('|'),to=c.dataset.k;if(from===to)return;
      const e=EVS().find(x=>x.id===id);if(!e)return;const dd=Math.round((keyToDate(to)-keyToDate(from))/864e5),old={date:e.date,d2:e.d2};
      e.date=dKey(addDays(keyToDate(e.date),dd));if(e.d2)e.d2=dKey(addDays(keyToDate(e.d2),dd));save();evRefresh();
      toastAct(t('wkd.moved',e.title||'',gStr(keyToDate(e.date))),t('undo'),()=>{e.date=old.date;if(old.d2)e.d2=old.d2;else delete e.d2;save();evRefresh()},8000)}})}
{hookFn('cwkPaint',()=>cwkPaint,f=>{cwkPaint=f},'post',function(){try{wkdAttach()}catch(e){}})}

/* 10th-33: event reminders a week or two before (the PC checks up to 16 days ahead, Android schedules them natively) */
EVR_OPTS.push(10080,20160);
{const _l=evRemLabel;evRemLabel=function(m,...a){m=+m;if(m===10080)return t('evw.1');if(m===20160)return t('evw.2');return _l(m,...a)}}
function evwCheck(){const now=Date.now(),td=keyToDate(todayKey());for(let i=3;i<=16;i++){const k=dKey(addDays(td,i));for(const e of evsOn(k)){if(e.rem==null||+e.rem<4320)continue;const at=evAlarmAt(e,k),nk=k+'ev'+e.id;
  if(now>=at&&now<at+30*6e4&&!S.notified[nk]){S.notified[nk]=1;save();alertUser(e.title,gStr(keyToDate(k))+' · '+evWhen(e)+(e.notes?' — '+e.notes:''),ICON_CLOCK)}}}}
setInterval(evwCheck,6e4);setTimeout(evwCheck,5000);
{hookFn('extraSched',()=>extraSched,f=>{extraSched=f},'post',function(out,now){try{if(!Array.isArray(out))return;now=now||Date.now();const td=keyToDate(todayKey());let n=0;
  for(let i=8;i<=16;i++){const k=dKey(addDays(td,i));for(const e of evsOn(k)){if(e.rem==null||+e.rem<4320)continue;const at=evAlarmAt(e,k);if(at>now&&n<40)out.push({id:7300+n++,t:at,title:e.title,body:gStr(keyToDate(k))+' · '+evWhen(e)})}}}catch(e){}})}

/* 10th-40: the Summary by Hijri months (S.settings.brHijri; only the month view changes) */
const brHij=()=>!!S.settings.brHijri&&bMode==='month';
function brPrevAnchor(a){return brHij()?addDays(keyToDate(hmKeysOf(a)[0]),-1):new Date(a.getFullYear(),a.getMonth()-1,1)}
{const _p=periodKeys;periodKeys=function(mode,anchor){if(mode==='month'&&S.settings.brHijri)return hmKeysOf(anchor);return _p(mode,anchor)}}
{const _s=shiftAnchor;shiftAnchor=function(dir){if(!brHij())return _s(dir);const ks=hmKeysOf(bAnchor);bAnchor=dir>0?addDays(keyToDate(ks[ks.length-1]),1):addDays(keyToDate(ks[0]),-1)}}
{hookFn('renderBrief',()=>renderBrief,f=>{renderBrief=f},'post',function(){try{const seg=$('#bSeg');if(seg&&!$('#bHijB')){seg.insertAdjacentHTML('afterend',`<button class="btn sm ghost" id="bHijB" title="${esc(t('brh.tip'))}">${esc(t('brh.b'))}</button><button class="btn sm ghost" id="hyrB" title="${esc(t('hyr.t'))}">${esc(t('hyr.b'))}</button>`);
    $('#bHijB').onclick=()=>{S.settings.brHijri=!S.settings.brHijri;if(S.settings.brHijri)bAnchor=new Date();save();renderBrief()};$('#hyrB').onclick=()=>hyrOpen()}
  const b=$('#bHijB');if(b){b.classList.toggle('on',!!S.settings.brHijri);b.hidden=bMode!=='month'}
  if(brHij()){const ks=periodKeys(bMode,bAnchor),h=hijri(keyToDate(ks[Math.floor(ks.length/2)]));$('#bTtl').textContent=`${h.month} ${h.year}`}}catch(e){console.error(e)}})}

/* 10th-39: the Hijri year in review (from the last days of Dhul-Hijjah; a Today chip in the first ten days of Muharram until it is opened) */
function hyKeys(hy){let d=keyToDate(todayKey()),g=0;while(hNum(d).y!==hy&&g++<40)d=addDays(d,(hNum(d).y>hy?-1:1)*20);if(hNum(d).y!==hy)return[];
  let s=d;while(hNum(addDays(s,-1)).y===hy)s=addDays(s,-1);const out=[];let x=s;while(hNum(x).y===hy&&out.length<360){out.push(dKey(x));x=addDays(x,1)}return out}
function hyStats(hy){const tk=todayKey(),ks=hyKeys(hy).filter(k=>k<=tk),r={days:ks.length,ms:0,pr:0,prN:0,pg:0,nf:0,fast:0,goal:0,mon:{}};
  ks.forEach(k=>{const d=S.days[k];const tot=totals(k).tot;r.ms+=tot;const g=goalMs(k);if(g&&tot>=g)r.goal++;const m=hNum(keyToDate(k)).m;r.mon[m]=(r.mon[m]||0)+tot;
    if(k>=plSince()){PRAYERS.forEach(p=>{const s=plStatus(k,p);r.prN++;if(s==='on'||s==='auto')r.pr++})}
    if(d){const q=d.quran;if(q)r.pg+=Math.max(+q.read||0,(q.pgs||[]).length);try{r.nf+=nflRk(k)}catch(e){}if(d.fast)r.fast++}});return r}
function hyrOpen(hy){const h=hNum(keyToDate(todayKey()));hy=hy||(h.m===1&&h.d<=10?h.y-1:h.y);const A=hyStats(hy),B=hyStats(hy-1);(S.hyRev=S.hyRev||{})[hy]=Date.now();save();
  const cmp=(a,b,f)=>`<b>${f(a)}</b>${b?`<i class="${a>=b?'up':'dn'}">${a>=b?'▲':'▼'} ${f(Math.abs(a-b))}</i>`:''}`,pct=(a,n)=>n?Math.round(a/n*100):0;
  const best=Object.entries(A.mon).sort((x,y)=>y[1]-x[1])[0],mName=m=>{const ks=hyKeys(hy).find(k=>hNum(keyToDate(k)).m===+m);return ks?hijri(keyToDate(ks)).month:m};
  openInfo(t('hyr.t2',hy),`<div class="hyr"><p class="muted">${esc(t('hyr.sub',hy-1))}</p><div class="hyrt">
    <div><small>${esc(t('hyr.hours'))}</small>${cmp(Math.round(A.ms/36e5),Math.round(B.ms/36e5),String)}</div>
    <div><small>${esc(t('hyr.goal'))}</small>${cmp(A.goal,B.goal,String)}</div>
    <div><small>${esc(t('hyr.pr'))}</small>${cmp(pct(A.pr,A.prN),pct(B.pr,B.prN),v=>v+'٪')}</div>
    <div><small>${esc(t('hyr.pg'))}</small>${cmp(A.pg,B.pg,String)}</div>
    <div><small>${esc(t('hyr.nf'))}</small>${cmp(A.nf,B.nf,String)}</div>
    <div><small>${esc(t('hyr.fast'))}</small>${cmp(A.fast,B.fast,String)}</div></div>
    ${best&&best[1]?`<p>${esc(t('hyr.best',mName(best[0]),fmtHM(best[1])))}</p>`:''}
    <div class="row" style="justify-content:space-between"><button class="btn sm ghost" id="hyrP">‹ ${hy-1}</button>${hy<h.y?`<button class="btn sm ghost" id="hyrN">${hy+1} ›</button>`:''}</div></div>`);
  const b=$('#infoBox');if(b)b.classList.add('hyrbox');$('#hyrP').onclick=()=>hyrOpen(hy-1);const n=$('#hyrN');if(n)n.onclick=()=>hyrOpen(hy+1)}
{hookFn('openInfo',()=>openInfo,f=>{openInfo=f},'pre',function(){try{const b=$('#infoBox');if(b)b.classList.remove('hyrbox')}catch(e){}})}
{hookFn('renderTodayEv',()=>renderTodayEv,f=>{renderTodayEv=f},'post',function(){try{const box=$('#todayEv');if(!box||box.querySelector('[data-hyrc]'))return;const h=hNum(keyToDate(todayKey()));
  const hy=h.m===1&&h.d<=10?h.y-1:h.m===12&&h.d>=25?h.y:0;if(!hy||(S.hyRev||{})[hy])return;
  box.insertAdjacentHTML('beforeend',`<span class="evchip" data-hyrc style="--c:#a855f7"><i></i>📜 ${esc(t('hyr.chip',hy))}</span>`);box.querySelector('[data-hyrc]').onclick=()=>{hyrOpen(hy);try{renderTodayEv()}catch(e){}}}catch(e){}})}
{const _cc=cmdCommands;cmdCommands=function(...a){const L_=_cc(...a);try{L_.push({icon:'📜',label:t('hyr.t'),run:()=>hyrOpen(),kw:'hijri year review السنة الهجرية حصاد'})}catch(e){}return L_}}

