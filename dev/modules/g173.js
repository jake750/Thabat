/* ============ v3.146 g173: UX list D — calendar and Summary ============ */
const UX4={rec:null,tm:0,hv:null};
function ux4Hover(){return matchMedia('(hover:hover) and (pointer:fine)').matches&&!MOB.matches}
/* 42. the day's fill as a bar along the bottom of the cell (an option) */
function ux4FbApply(){document.documentElement.classList.toggle('ux4fb',!!S.settings.calFillBar)}
function ux4FbToggle(){S.settings.calFillBar=!S.settings.calFillBar;save();ux4FbApply();toast(t(S.settings.calFillBar?'ux4.fbOn':'ux4.fbOff'))}
ux4FbApply();
{const _l=calLegend;calLegend=function(btn,...a){const r=_l(btn,...a);try{const p=$('#ppPop');if(p&&p.classList.contains('callg')&&!p.querySelector('.ux4fbr')){p.insertAdjacentHTML('beforeend',`<label class="ux4fbr"><input type="checkbox" ${S.settings.calFillBar?'checked':''}> <span>${esc(t('ux4.fb'))}</span></label>`);p.querySelector('.ux4fbr input').onchange=()=>{ux4FbToggle();renderCal()}}}catch(e){}return r}}
/* month cells: 46 goal days in the header, 47 Hijri occasions and Hijri-yearly events, 50 «log what you did» on empty past days */
function ux4Cells(){const box=$('#cal');if(!box||box.classList.contains('calwk'))return;const tk=todayKey(),y=calM.getFullYear(),m=calM.getMonth(),n=new Date(y,m+1,0).getDate();
  let gd=0,el=0;for(let d=1;d<=n;d++){const k=dKey(new Date(y,m,d));if(k>tk)break;el++;const {tot}=totals(k);if(tot>0&&tot>=goalMs(k))gd++}
  const sub=$('#calSub');if(sub&&el){sub.querySelector('.ux4gd')?.remove();sub.insertAdjacentHTML('beforeend',`<span class="ux4gd" title="${esc(t('ux4.gdT',gd,n))}"> · ✦ <b>${gd}</b> / ${n} ${esc(t('ux4.gdU'))}</span>`)}
  box.querySelectorAll('.cell[data-k]').forEach(c=>{const k=c.dataset.k,date=keyToDate(k);
    const evs=evsOn(k),big=evs.filter(e=>e.big);c.querySelectorAll('.cevt').forEach((s,i)=>{const e=big[i];if(e&&e.rep==='hyearly')s.classList.add('ux4hy')});
    const h=hNum(date),oc=(typeof OCC_BI!=='undefined'?OCC_BI:[]).find(([mm,dd])=>h.m===mm&&h.d===dd);
    if(oc&&!c.querySelector('.ux4occ'))c.insertAdjacentHTML('beforeend',`<span class="ux4occ" title="${esc(t(oc[2]))}">${ICON_MOON}<em>${esc(t(oc[2]))}</em></span>`);
    if(k<tk&&!c.classList.contains('out')&&!totals(k).tot&&!evs.length&&!c.querySelector('.ux4log')){c.classList.add('ux4emp');c.insertAdjacentHTML('beforeend',`<span class="ux4log" role="button" tabindex="0">＋ ${esc(t('ux4.log'))}</span>`)}});
  box.querySelectorAll('.ux4log').forEach(b=>b.onclick=e=>{e.stopPropagation();const c=b.closest('.cell');selKey=c.dataset.k;renderCal();setTimeout(()=>{const a=$('#detail [data-add="act"]');if(a)a.click()},40)})}
/* 44. week view: today's column wider, with a line at the current time */
function ux4Week(){const box=$('#cal');if(!box||!box.classList.contains('calwk'))return;const cols=[...box.querySelectorAll('.wkc')],ti=cols.findIndex(c=>c.classList.contains('today'));
  box.style.gridTemplateColumns=!MOB.matches&&ti>=0?cols.map((c,i)=>i===ti?'minmax(0,1.5fr)':'minmax(0,1fr)').join(' '):'';
  box.querySelectorAll('.ux4now').forEach(x=>x.remove());if(ti<0||S.settings.calWkH)return;
  const l=cols[ti].querySelector('.wkl');if(!l)return;const now=new Date(),hm=pad(now.getHours())+':'+pad(now.getMinutes());
  const nx=[...l.querySelectorAll('.wki')].find(x=>{const tm=(x.querySelector('time')||{}).textContent||'';return tm&&tm>hm});
  const ln=`<div class="ux4now"><i></i><span>${hm}</span></div>`;if(nx)nx.insertAdjacentHTML('beforebegin',ln);else l.insertAdjacentHTML('beforeend',ln)}
{hookFn('renderCal',()=>renderCal,f=>{renderCal=f},'post',function(){try{ux4Cells();ux4Week()}catch(e){console.error(e)}})}
setInterval(()=>{try{if(typeof curView==='function'&&curView()==='cal'&&calWkOn())ux4Week()}catch(e){}},6e4);
/* 45. a new event starts on the day you are looking at */
{const _o=openEv;openEv=function(id,k,...a){try{if(!id&&typeof curView==='function'&&curView()==='cal'&&selKey)k=selKey}catch(e){}return _o.call(this,id,k,...a)}}
/* 48. PC: hovering a day shows a small card */
function ux4CardHTML(k){const date=keyToDate(k),tk=todayKey(),{tot}=totals(k),g=goalMs(k),d=S.days[k]||{};
  const pr=k<=tk&&k>=plSince()?`<div class="ux4hp">${PRAYERS.map(p=>`<i class="wkp ${plStatus(k,p)||''}" title="${esc(t('pr.'+p))}"></i>`).join('')}</div>`:'';
  const evs=evsOn(k).slice(0,3).map(e=>`<li style="--c:${esc(e.color||'var(--accent)')}"><i></i><span dir="auto">${esc((e.time&&!e.big?e.time+' ':'')+(e.title||''))}</span></li>`).join('');
  const tk2=(d.tasks||[]).filter(x=>!x.pp),dn=tk2.filter(x=>x.done).length;
  return`<b>${esc(L().days[date.getDay()])} ${esc(gShort(date))}</b><small>${esc(hStr(date))}</small>${k<=tk?`<div class="ux4hw"><span>${esc(fmtHM(tot))}</span><em>${g?Math.floor(tot/g*100):0}%</em></div><div class="minibar"><i style="width:${Math.min(100,g?tot/g*100:0)}%"></i></div>`:''}${pr}${evs?`<ul>${evs}</ul>`:''}${tk2.length?`<div class="ux4ht">${esc(t('ux4.tasks',dn,tk2.length))}</div>`:''}`}
function ux4CardHide(){clearTimeout(UX4.tm);$('#ux4Hc')?.remove();UX4.hv=null}
document.addEventListener('mouseover',e=>{const c=e.target.closest&&e.target.closest('#cal .cell[data-k]');if(!c){if(UX4.hv&&!(e.target.closest&&e.target.closest('#ux4Hc')))ux4CardHide();return}
  if(!ux4Hover()||UX4.hv===c)return;ux4CardHide();UX4.hv=c;UX4.tm=setTimeout(()=>{if(UX4.hv!==c||!c.isConnected)return;const z=uiZoom(),r=c.getBoundingClientRect(),el=document.createElement('div');el.id='ux4Hc';el.className='ux4hc';el.innerHTML=ux4CardHTML(c.dataset.k);document.body.appendChild(el);
    const W=innerWidth/z,H=innerHeight/z,w=el.offsetWidth,h=el.offsetHeight,rtl=document.documentElement.dir==='rtl';let x=rtl?r.left/z-w-8:r.right/z+8;if(x<6||x+w>W-6)x=rtl?r.right/z+8:r.left/z-w-8;x=Math.max(6,Math.min(W-w-6,x));let y=Math.max(6,Math.min(H-h-6,r.top/z));el.style.left=x+'px';el.style.top=y+'px'},380)},{passive:true});
document.addEventListener('mousedown',ux4CardHide,{capture:true,passive:true});
/* Summary: 51 the top sentence, 52 chart marks, 53 the reference in words, 54 order by change (option), 56 new records, 57 category colours, 58 rounded month numbers, 59 prayers as counts */
function ux4Prev(){return bMode==='week'?t('brief.prevW'):t('brief.prevM')}
function ux4Top(){const keys=periodKeys(bMode,bAnchor),prevA=bMode==='week'?addDays(bAnchor,-7):brPrevAnchor(bAnchor),st=periodStats(keys),pv=periodStats(periodKeys(bMode,prevA)),a=rollBy(st.by),b=rollBy(pv.by);
  let best=null;new Set([...Object.keys(a),...Object.keys(b)]).forEach(id=>{const d=(a[id]||0)-(b[id]||0);if(Math.abs(d)>=15*6e4&&(!best||Math.abs(d)>Math.abs(best.d)))best={id,d}});
  let html='';if(best){const c=catOf(best.id),pc=b[best.id]?Math.round(best.d/b[best.id]*100):null;html=t(best.d>0?'ux4.topUp':'ux4.topDn',`<i class="ux4cd" style="background:${c.color}"></i><b>${esc(catName(c))}</b>`,`<b class="${best.d>0?'up':'dn'}">${esc(fmtHM(Math.abs(best.d)))}${pc!=null&&isFinite(pc)?` (${Math.abs(pc)}%)`:''}</b>`,esc(ux4Prev()))}
  else if(pv.tot>0)html=esc(t('ux4.topSame',ux4Prev()));
  let el=$('#ux4Top');if(!el){$('#bTiles').insertAdjacentHTML('beforebegin','<div class="ux4top" id="ux4Top"></div>');el=$('#ux4Top')}
  el.innerHTML=`<span class="ux4tx">${html}</span><button class="btn sm ghost ux4ob ${S.settings.brOrd?'on':''}" id="ux4OrdB">${esc(t(S.settings.brOrd?'ux4.pin':'ux4.ord'))}</button>`;el.classList.toggle('ux4e',!html);
  $('#ux4OrdB').onclick=()=>{S.settings.brOrd=!S.settings.brOrd;save();renderBrief()}}
function ux4Chart(){const plot=$('#bPlot');if(!plot)return;const g=plot.querySelector('.goal');const gp=g?parseFloat(g.style.bottom)||0:0;const tk=todayKey(),keys=periodKeys(bMode,bAnchor);
  plot.querySelectorAll('.col[data-i]').forEach(c=>{const k=keys[+c.dataset.i];if(k>tk&&!c.querySelector('.ux4fu'))c.insertAdjacentHTML('beforeend',`<i class="ux4fu" style="height:${gp}%"></i>`)})}
function ux4Refs(){const w=t('ux4.vs',ux4Prev());$$('#v-brief .cmpd').forEach(x=>{if(!x.querySelector('.ux4ref'))x.insertAdjacentHTML('beforeend',`<i class="ux4ref">${esc(w)}</i>`)})}
function ux4Rec(){const c=$('#bRec');if(!c)return;const R=UX4.rec||crRecords(),tiles=c.querySelectorAll('.crt'),tk=todayKey(),wk=dKey(addDays(keyToDate(tk),-6));
  const nw=[R.day&&R.day.k>=wk,R.week&&R.week.k>=dKey(addDays(keyToDate(tk),-13)),R.month&&R.month.k===tk.slice(0,7),R.runEnd&&R.runEnd>=wk,R.prEnd&&R.prEnd>=wk,R.sess&&R.sess.k>=wk,R.pg&&R.pg.k>=wk];
  tiles.forEach((b,i)=>{if(nw[i]&&!b.querySelector('.ux4new'))b.insertAdjacentHTML('afterbegin',`<span class="ux4new">${esc(t('ux4.new'))}</span>`)})}
{const _r=crRecords;crRecords=function(...a){return UX4.rec=_r.apply(this,a)}}
function ux4Cols(){const w=$('#bWd .wds');if(w&&!w.dataset.ux4){const {M,cnt}=wdStats(),cats=topCats().filter(x=>M[x.id]&&M[x.id].some(v=>v>0)).slice(0,6);if(cats.length){w.dataset.ux4=1;w.innerHTML='✦ '+cats.map(x=>{const av=[0,1,2,3,4,5,6].map(d=>cnt[d]?M[x.id][d]/cnt[d]:0),d=av.indexOf(Math.max(...av));return`<i class="ux4cd" style="background:${x.color}"></i>`+esc(t('wds.p',kidName(x),L().days[d]))}).join(esc(t('wds.sep')))}}}
function ux4Round(){if(bMode!=='month')return;const rd=ms=>ms>=10*36e5?fnum(Math.round(ms/36e5))+' '+t('u.h'):null;
  const keys=periodKeys(bMode,bAnchor),st=periodStats(keys),v0=$('#bTiles .tile .v');const mk=(el,ms)=>{const r=rd(ms);if(!el||!r||el.dataset.ux4x)return;el.dataset.ux4x=el.innerHTML;el.innerHTML=r;el.classList.add('ux4rd');el.title=t('ux4.exact');el.onclick=()=>{const on=el.classList.toggle('ux4ex');el.innerHTML=on?el.dataset.ux4x:r}};
  mk(v0,st.tot);const by=rollBy(st.by);$$('#bCats .brow:not(.sub)').forEach(row=>{const nm=row.querySelector('.nm'),tm=row.querySelector('.tm');if(!nm||!tm)return;const c=S.settings.categories.find(x=>catName(x)===nm.textContent.trim());if(c)mk(tm,by[c.id]||0);else if(row===$$('#bCats .brow').pop())mk(tm,st.tot)})}
function ux4Pray(){const box=$('#bPray');if(!box)return;const keys=periodKeys(bMode,bAnchor).filter(k=>k<=todayKey()&&k>=plSince());let ok=0,n=0;
  const rows=PRAYERS.map(p=>{let o=0,m=0;keys.forEach(dk=>{const s=plStatus(dk,p);if(s){m++;if(s==='on'||s==='auto')o++}});ok+=o;n+=m;return{o,m}});if(!n)return;
  const sp=box.querySelector('h3>span:last-child'),fast=keys.filter(k=>S.days[k]&&S.days[k].fast).length;if(sp&&!sp.querySelector('.ux4pc'))sp.innerHTML=`<span class="ux4pc">${esc(t('ux4.prOf',ok,n))}</span> · ${Math.round(ok/n*100)}%${fast?' · 🌙 '+esc(t('bp.fast',fast)):''}`;
  box.querySelectorAll('.bprow').forEach((r,i)=>{const s=r.querySelector('small'),x=rows[i];if(s&&x&&x.m&&!s.dataset.ux4){s.dataset.ux4=1;s.innerHTML=`${x.o}/${x.m} · `+s.innerHTML}});
  const C={'#4ade80':'var(--pOn)','#4ade8088':'color-mix(in srgb,var(--pOn) 55%,transparent)','#fbbf24':'var(--pLate)','#f87171':'var(--pMiss)'};box.querySelectorAll('[style*="background:#"]').forEach(i=>{const m=(i.getAttribute('style')||'').match(/background:(#[0-9a-f]+)/i);if(m&&C[m[1].toLowerCase()])i.style.background=C[m[1].toLowerCase()]})}
function ux4Order(){const v=$('#v-brief');if(!v)return;const on=!!S.settings.brOrd;v.classList.toggle('ux4ord',on);const kids=[...v.children];
  if(!on){kids.forEach(c=>c.style.order='');return}
  const sc=c=>{let m=-1;(c.textContent.match(/[▲▼]\s?\d+%/g)||[]).forEach(s=>{m=Math.max(m,+s.replace(/\D/g,''))});return m};
  const fixed=new Set([...v.querySelectorAll(':scope>.bhead,:scope>#ux4Top,:scope>.tiles,:scope>.bgrid')]);let i=0;
  const cards=kids.filter(c=>!fixed.has(c)).map(c=>({c,s:sc(c)}));cards.filter(o=>o.s>=0).sort((a,b)=>b.s-a.s).forEach(o=>o.c.style.order=10+(i++));cards.filter(o=>o.s<0).forEach(o=>o.c.style.order=500);
  kids.forEach(c=>{if(fixed.has(c))c.style.order=c.classList.contains('bgrid')?5:c.id==='ux4Top'?1:c.classList.contains('tiles')?2:0})}
{hookFn('renderBrief',()=>renderBrief,f=>{renderBrief=f},'post',function(){try{ux4Top();ux4Chart();ux4Refs();ux4Rec();ux4Cols();ux4Round();ux4Pray();ux4Order()}catch(e){console.error(e)}})}
/* commands */
{const _c=cmdCommands;cmdCommands=function(...a){const r=_c.apply(this,a);try{r.push({icon:'📅',label:t('ux4.fb'),kw:'calendar fill bar تقويم امتلاء شريط',run:()=>{ux4FbToggle();if(curView()==='cal')renderCal()}})}catch(e){}return r}}
