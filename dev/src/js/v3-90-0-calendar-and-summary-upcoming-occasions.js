/* ============ v3.90.0: calendar and Summary — upcoming occasions, two months side by side, the same Hijri month last year, numeric goals, a one-category report, the consistency index ============ */
function catMs(k,cat){try{return rollBy(totals(k).by)[cat]||0}catch(e){return 0}}

/* old 63 (yearly Hijri events already existed as «every Hijri year»): the occasions of the coming 12 months — the main Islamic dates and your own yearly Hijri events */
const OCC_BI=[[1,1,'occ.ny'],[1,10,'occ.ashura'],[9,1,'occ.ram'],[10,1,'occ.fitr'],[12,9,'occ.arafah'],[12,10,'occ.adha']];
function occList(){const td=keyToDate(todayKey()),out=[];for(let i=0;i<=365;i++){const d=addDays(td,i),k=dKey(d),h=hNum(d);
    OCC_BI.forEach(([m,dd,key])=>{if(h.m===m&&h.d===dd)out.push({k,n:t(key),i,bi:1})});
    try{EVS().filter(e=>e.rep==='hyearly'&&evOccurs(e,k)).forEach(e=>out.push({k,n:e.title||'',i,ev:1}))}catch(x){}}return out}
function occOpen(){const L_=occList();openInfo('🗓 '+esc(t('occ.t')),`<p class="crsub">${esc(t('occ.sub'))}</p><div class="occl">${L_.map(o=>{const d=keyToDate(o.k);return`<button class="occr${o.ev?' own':''}" data-k="${o.k}"><b dir="auto">${esc(o.n)}</b><small>${esc(hStr(d))} · ${esc(gStr(d))}</small><span>${o.i?esc(t('occ.in',o.i)):esc(t('occ.today'))}</span></button>`}).join('')||`<p class="muted">—</p>`}</div><p class="muted occh">${esc(t('occ.how'))}</p>`);
  const b=$('#infoBox');b.classList.add('occbox');b.querySelector('.occl').onclick=e=>{const r=e.target.closest('[data-k]');if(!r)return;$('#infoModal').classList.remove('on');selKey=r.dataset.k;calM=keyToDate(r.dataset.k);calM.setDate(1);showView('cal');renderCal()}}

/* old 66: two months side by side (PC) / one under the other (phone): S.settings.cal2. The second grid is the calendar's own render of the next month, copied. */
const CAL2={busy:false};
function cal2Paint(){const wrap=$('#calSkyWrap');if(!wrap)return;let box=$('#cal2Box');const on=!!S.settings.cal2;document.documentElement.classList.toggle('cal2on',on);
  if(!on){if(box)box.remove();return}if(CAL2.busy)return;
  /* the next month is drawn by the calendar itself (then the current month again), only when the month or the data changed; a day click reuses it */
  const ck=calM.getFullYear()+'-'+calM.getMonth()+'|'+(S._savedAt||0)+'|'+LANG;
  if(CAL2.key!==ck){CAL2.busy=true;const cm=calM,sel=selKey;try{calM=new Date(cm.getFullYear(),cm.getMonth()+1,1);renderCal();CAL2.html=$('#cal').innerHTML;CAL2.ttl=$('#calTtl').textContent}finally{calM=cm;selKey=sel;renderCal();CAL2.busy=false}CAL2.key=ck}
  if(!box){box=document.createElement('div');box.id='cal2Box';box.className='cal2box';const col=wrap.parentElement;(col&&col.parentElement&&col.parentElement.classList.contains('calwrap')?col:wrap).after(box);box.addEventListener('click',e=>{const c=e.target.closest('.cell[data-k]');if(!c)return;selKey=c.dataset.k;renderCal()})}
  box.innerHTML=`<div class="cal2t">${esc(CAL2.ttl||'')}</div><div class="cal cal2">${CAL2.html||''}</div>`;box.querySelectorAll('.cmetc').forEach(x=>x.remove());box.querySelectorAll('.cell').forEach(c=>c.classList.toggle('sel',c.dataset.k===selKey))}
/* phones: if prev / today / next / agenda do not fit one row (a larger interface size), they keep only their icons */
function calTight(){const r=$('.calhead .row');if(!r)return;r.classList.remove('caltight');if(!MOB.matches)return;const out=()=>{const b=[...r.querySelectorAll('button')].filter(x=>x.offsetParent).map(x=>x.getBoundingClientRect());return r.scrollWidth>r.clientWidth+2||b.some(q=>q.left<-1||q.right>innerWidth+1)};if(out())r.classList.add('caltight')}
{hookFn('renderCal',()=>renderCal,f=>{renderCal=f},'post',function(){try{if(CAL2.busy)return;cal2Paint();cal2Btn();calTight()}catch(e){console.error(e)}})}
const OCC_I='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M8 3v4M16 3v4M3.5 10h17"/><path d="M12 12.6l1 2 2.2.3-1.6 1.5.4 2.2-2-1-2 1 .4-2.2-1.6-1.5 2.2-.3z"/></svg>';
function cal2Btn(){const tb=$('#calTools3');if(!tb||$('#cal2Btn'))return;tb.insertAdjacentHTML('beforeend',`<button class="btn sm${S.settings.cal2?' on':''}" id="cal2Btn" title="${esc(t('cal2.t'))}" aria-pressed="${!!S.settings.cal2}">${esc(t('cal2.btn'))}</button>`);
  /* phones: the header row keeps prev / today / next / agenda; the occasions open from an icon beside the «i» at the month title */
  const ttlCol=$('#calTtl')&&$('#calTtl').parentElement;if(MOB.matches&&ttlCol)ttlCol.insertAdjacentHTML('beforeend',`<button class="btn sm ghost clgi occi" id="occBtn" title="${esc(t('occ.t'))}" aria-label="${esc(t('occ.t'))}">${OCC_I}</button>`);
  else tb.insertAdjacentHTML('beforeend',`<button class="btn sm ghost" id="occBtn" title="${esc(t('occ.t'))}">${OCC_I} ${esc(t('occ.btn'))}</button>`);
  $('#cal2Btn').onclick=()=>{S.settings.cal2=!S.settings.cal2;save();const b=$('#cal2Btn');b.classList.toggle('on',!!S.settings.cal2);b.setAttribute('aria-pressed',!!S.settings.cal2);renderCal()};$('#occBtn').onclick=occOpen}

/* old 78: the Hijri-month review compares with the month before or with the same month last year */
function hmLastYear(first){const h=hNum(first);for(let i=-370;i<=-340;i++){const d=addDays(first,i),q=hNum(d);if(q.y===h.y-1&&q.m===h.m)return hmKeysOf(d)}return null}
{const _r=hmReview;hmReview=function(anyDate,...a){const r=_r(anyDate,...a);try{const box=$('#infoBox'),tb=box&&box.querySelector('table.crt2');if(!tb||box.querySelector('.hmcmp'))return r;const ks=hmKeysOf(anyDate),first=keyToDate(ks[0]),ly=hmLastYear(first);
  tb.insertAdjacentHTML('beforebegin',`<div class="hmcmp seg" role="group"><button class="on" data-hc="prev">${esc(t('hmc.prev'))}</button><button data-hc="year"${ly?'':' disabled'}>${esc(t('hmc.year'))}</button></div>`);
  box.querySelector('.hmcmp').onclick=e=>{const b=e.target.closest('[data-hc]');if(!b||b.disabled)return;box.querySelectorAll('.hmcmp button').forEach(x=>x.classList.toggle('on',x===b));
    const pk=b.dataset.hc==='year'?ly:hmKeysOf(addDays(first,-1)),A=crSum(ks),B=crSum(pk),hp=hijri(keyToDate(pk[0])),h=hijri(first);
    tb.querySelector('thead').innerHTML=`<tr><th></th><th>${esc(h.month+(b.dataset.hc==='year'?' '+h.year:''))}</th><th>${esc(hp.month+(b.dataset.hc==='year'?' '+hp.year:''))}</th><th></th></tr>`;tb.querySelector('tbody').innerHTML=crRows(A,B)}}catch(e){console.error(e)}return r}}

/* old 79: numeric goals that fill from your sessions — S.ngoal = [{id, n, cat, h (hours), from, to}] (synced) */
try{if(Array.isArray(SY_SIMPLE)&&!SY_SIMPLE.includes('ngoal'))SY_SIMPLE.push('ngoal')}catch(e){}
function ngList(){return S.ngoal||(S.ngoal=[])}
function ngDone(g){let ms=0;for(let d=keyToDate(g.from),end=keyToDate(g.to),tk=todayKey();d<=end;d=addDays(d,1)){const k=dKey(d);if(k>tk)break;ms+=g.cat?catMs(k,g.cat):(S.days[k]?totals(k).tot:0)}return ms}
function ngCard(){const host=$('#bQh')||$('#bRec');if(!host)return;let c=$('#bNg');if(!c){host.insertAdjacentHTML('afterend','<div class="card" id="bNg" style="margin-bottom:18px"></div>');c=$('#bNg')}const L_=ngList(),tk=todayKey();
  c.innerHTML=`<h3><span>🎯 ${esc(t('ng.t'))}</span><button class="btn sm ghost" id="ngAdd">＋ ${esc(t('ng.add'))}</button></h3>`+(L_.length?L_.map(g=>{const ms=ngDone(g),tg=g.h*36e5,pc=Math.min(100,ms/tg*100),left=Math.max(0,Math.round((keyToDate(g.to)-keyToDate(tk))/864e5)+1),need=left&&ms<tg?(tg-ms)/left:0,cat=g.cat&&S.settings.categories.find(x=>x.id===g.cat);
    return`<div class="ngr" data-ng="${g.id}"><div class="ngh"><b dir="auto">${esc(g.n)}</b><small>${cat?esc(catName(cat))+' · ':''}${esc(gShort(keyToDate(g.from)))} – ${esc(gShort(keyToDate(g.to)))}</small><button class="btn sm ghost" data-ngx="${g.id}" aria-label="✕" title="${esc(t('ng.del'))}">✕</button></div>
      <div class="ngbar${pc>=100?' ok':''}"><i style="width:${pc.toFixed(1)}%;${cat&&cat.color?'background:'+cat.color:''}"></i></div><small class="ngs">${esc(t('ng.prog',fmtHM(ms),g.h,Math.floor(pc)))}${pc>=100?' · ✓':left?' · '+esc(t('ng.need',fmtHM(need),left)):' · '+esc(t('ng.ended'))}</small></div>`}).join(''):`<p class="muted">${esc(t('ng.none'))}</p>`);
  $('#ngAdd').onclick=ngNew;c.querySelectorAll('[data-ngx]').forEach(b=>b.onclick=()=>{const L2=ngList(),i=L2.findIndex(g=>g.id===b.dataset.ngx);if(i<0)return;const g=L2.splice(i,1)[0];save();ngCard();toastAct(t('ng.deleted'),t('undo'),()=>{ngList().splice(i,0,g);save();ngCard()})})}
function ngNew(){const tk=todayKey(),end=dKey(addDays(keyToDate(tk),89));
  openInfo('🎯 '+esc(t('ng.add')),`<div class="ngf"><label>${esc(t('ng.name'))}<input class="in" id="ngN" dir="auto" placeholder="${esc(t('ng.namePh'))}"></label>
    <label>${esc(t('ng.cat'))}<select class="in" id="ngC"><option value="">${esc(t('ng.all'))}</option>${topCats().map(c=>`<option value="${c.id}">${esc(kidName(c))}</option>`).join('')}</select></label>
    <label>${esc(t('ng.hours'))}<input class="in num" type="number" id="ngH" min="1" max="5000" value="50"></label>
    <div class="ngd"><label>${esc(t('ng.from'))}<input class="in" type="date" id="ngF" value="${tk}"></label><label>${esc(t('ng.to'))}<input class="in" type="date" id="ngT" value="${end}"></label></div>
    <p class="crsub" id="ngE"></p><button class="btn pri" id="ngGo">${esc(t('ng.save'))}</button></div>`);
  $('#infoBox').classList.add('ngbox');$('#ngGo').onclick=()=>{const n=$('#ngN').value.trim(),h=+$('#ngH').value,f=$('#ngF').value,to=$('#ngT').value;if(!n){$('#ngE').textContent=t('ng.errN');return}if(!(h>0)||!f||!to||to<f){$('#ngE').textContent=t('ng.errD');return}
    ngList().push({id:uid(),n:n.slice(0,80),cat:$('#ngC').value||'',h:Math.round(h),from:f,to});save();$('#infoModal').classList.remove('on');ngCard()}}

/* old 82: the consistency index (ثبات) over the last 28 days — work days that reached half the goal (50 %), prayers on time (30 %), days with Quran reading (20 %) */
function consScore(endK){const end=keyToDate(endK);let wd=0,prOk=0,prN=0,qd=0;for(let i=0;i<28;i++){const k=dKey(addDays(end,-i)),d=S.days[k];if(d){const tot=totals(k).tot;if(tot>=goalMs(k)*.5)wd++;const q=d.quran;if(q&&(+q.read||(q.pgs||[]).length))qd++}
    PRAYERS.forEach(p=>{const s=plStatus(k,p);if(s){prN++;if(s==='on'||s==='auto')prOk++}})}
  const w=wd/28,p=prN?prOk/prN:0,q=qd/28;return{v:Math.round((w*.5+p*.3+q*.2)*100),w:Math.round(w*100),p:Math.round(p*100),q:Math.round(q*100),wd,qd}}
function consCard(){const host=$('#bNg')||$('#bQh')||$('#bRec');if(!host)return;let c=$('#bCons');if(!c){host.insertAdjacentHTML('beforebegin','<div class="card" id="bCons" style="margin-bottom:18px"></div>');c=$('#bCons')}
  const tk=todayKey(),A=consScore(tk),B=consScore(dKey(addDays(keyToDate(tk),-28))),dv=A.v-B.v,bar=(v,l)=>`<div class="consb"><span>${esc(l)}</span><i><b style="width:${v}%"></b></i><em>${v}%</em></div>`;
  c.innerHTML=`<h3><span>🧭 ${esc(t('cons.t'))}</span><small class="muted">${esc(t('cons.sub'))}</small></h3><div class="consw"><div class="consv"><b>${A.v}</b><small>/ 100</small>${dv?`<i class="${dv>0?'up':'dn'}">${dv>0?'▲':'▼'} ${Math.abs(dv)}</i>`:''}</div><div class="consl">${bar(A.w,t('cons.w',A.wd))}${bar(A.p,t('cons.p'))}${bar(A.q,t('cons.q',A.qd))}</div></div>`}
{hookFn('renderBrief',()=>renderBrief,f=>{renderBrief=f},'post',function(){try{ngCard();consCard()}catch(e){console.error(e)}})}

/* old 80: one category's report — 12 weeks, weekdays, sessions */
function crcOpen(cat){const cs=topCats();if(!cs.length)return;cat=cat||(cs[0]&&cs[0].id);const c=cs.find(x=>x.id===cat)||cs[0],td=keyToDate(todayKey());
  const wk=[];for(let w=11;w>=0;w--){let ms=0;for(let i=0;i<7;i++){const k=dKey(addDays(td,-(w*7+i)));ms+=catMs(k,c.id)}wk.push(ms)}
  const wdS=[0,0,0,0,0,0,0],wdN=[0,0,0,0,0,0,0];let tot=0,best=null,ns=0,sl=0,days=0;
  for(let i=0;i<84;i++){const d=addDays(td,-i),k=dKey(d),ms=catMs(k,c.id);wdS[d.getDay()]+=ms;wdN[d.getDay()]++;tot+=ms;if(ms)days++;if(ms&&(!best||ms>best.ms))best={k,ms};
    ((S.days[k]&&S.days[k].sessions)||[]).forEach(s=>{if(s&&s.cat&&topOf(s.cat)===c.id&&s.e&&s.s){ns++;sl+=s.e-s.s}})}
  const mx=Math.max(1,...wk),wmx=Math.max(1,...wdS.map((v,i)=>v/Math.max(1,wdN[i]))),order=[6,0,1,2,3,4,5];
  openInfo('📈 '+esc(t('crc.t')),`<div class="crcw"><select class="in" id="crcSel" aria-label="${esc(t('crc.cat'))}">${cs.map(x=>`<option value="${x.id}"${x.id===c.id?' selected':''}>${esc(kidName(x))}</option>`).join('')}</select>
    <div class="hmtiles"><div><b>${fmtHM(tot)}</b><small>${esc(t('crc.tot'))}</small></div><div><b>${fmtHM(tot/12)}</b><small>${esc(t('crc.avgW'))}</small></div><div><b>${days}</b><small>${esc(t('crc.days'))}</small></div><div><b>${ns?fmtHM(sl/ns):'—'}</b><small>${esc(t('crc.sess',ns))}</small></div></div>
    ${best?`<p class="crsub">${esc(t('crc.best',gShort(keyToDate(best.k)),fmtHM(best.ms)))}</p>`:''}
    <h4>${esc(t('crc.weeks'))}</h4><div class="crcbars">${wk.map((v,i)=>`<i title="${esc(fmtHM(v))}" style="height:${Math.max(v?4:1,v/mx*100).toFixed(0)}%;background:${c.color||'var(--accent)'}"></i>`).join('')}</div>
    <h4>${esc(t('crc.wd'))}</h4><div class="crcwd">${order.map(i=>{const v=wdS[i]/Math.max(1,wdN[i]);return`<div><span>${esc(L().sdays[i])}</span><i><b style="width:${(v/wmx*100).toFixed(0)}%;background:${c.color||'var(--accent)'}"></b></i><em>${fmtHM(v)}</em></div>`}).join('')}</div></div>`);
  $('#infoBox').classList.add('crcbox');$('#crcSel').onchange=e=>crcOpen(e.target.value)}
BT_GROUPS.find(g=>g[0]==='review')[1].push('crcBtn');Object.assign(BT_INFO,{crcBtn:'crc.i'});
{hookFn('renderBrief',()=>renderBrief,f=>{renderBrief=f},'pre',function(){try{const ctl=$('#v-brief .bctl');if(!ctl||$('#crcBtn'))return;ctl.insertAdjacentHTML('beforeend',`<button class="btn sm ghost" id="crcBtn">📈 ${esc(t('crc.t'))}</button>`);$('#crcBtn').onclick=()=>crcOpen()}catch(e){}})}
{hookFn('openInfo',()=>openInfo,f=>{openInfo=f},'pre',function(){try{const b=$('#infoBox');if(b)b.classList.remove('occbox','ngbox','crcbox')}catch(e){}})}

