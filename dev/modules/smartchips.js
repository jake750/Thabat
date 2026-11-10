/* ============ Today chips, option A (owner's pick 2026-11-10): one short strip that follows the time of day ============
   Events, the big context chips (before sleep, Arafah, Eid, fasting…) always show. Of the rest, only the few that fit the hour
   show (morning: intention, energy, challenge; evening: muhasaba, tomorrow, the day in a word…); done ones and the rest wait
   behind «المزيد N», which opens them in place. The chips are only hidden, never re-made, so their own clicks keep working.
   For now in the web demo only; the owner wants it in the app later (CLAUDE.md, Active). */
Object.assign(I18N.ar,{'scx.more':'المزيد {0}','scx.less':'أقل'});Object.assign(I18N.en,{'scx.more':'More {0}','scx.less':'Less'});
let SCX_OPEN=false;const SCX_MAX=4;
function scxSlot(){const pt=prayerTimes(new Date()),now=Date.now();return now<pt.fajr?'e':now<pt.dhuhr?'m':now<pt.maghrib?'d':'e'}
function scxOrder(){return{m:['ny','en','ch','tsb','kahf','qaw','hb','pjd','fc'],d:['ch','tsb','hb','pjd','qaw','fc','ny','en'],e:['mh','tmr','mw','nflc','bed','tsb','hb','qaw','pjd']}[scxSlot()]}
function scxKey(c){for(const k of Object.keys(c.dataset))return k;return''}
function scxPinned(c){return c.matches('.big,.jm,.fast,[data-ev],[data-fsn],[data-w13s6],[data-w13rm],[data-w13eidx],[data-w13ecl],[data-ram3],[data-tr3],[data-eid]')}
function scxDone(c){return c.matches('.done,.ok')||/✓/.test(c.textContent)}
function scxApply(){const box=$('#todayEv');if(!box)return;box.querySelectorAll('.scxm').forEach(b=>b.remove());
  const L_=[...box.children].filter(c=>c.classList.contains('evchip'));box.classList.add('scx');L_.forEach(c=>c.classList.remove('scx-h'));
  const ord=scxOrder(),rank=c=>{if(scxDone(c))return 900;const i=ord.indexOf(scxKey(c));return i<0?(c.classList.contains('rmdc')?800:500):i};
  const rest=L_.filter(c=>!scxPinned(c)).sort((a,b)=>rank(a)-rank(b)),hide=rest.filter((c,i)=>i>=SCX_MAX||rank(c)>=800);
  hide.forEach(c=>c.classList.add('scx-h'));box.classList.toggle('scx-open',SCX_OPEN);
  if(!hide.length)return;const b=document.createElement('button');b.type='button';b.className='evchip scxm';
  b.innerHTML=`<svg class="uic" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="19" cy="12" r="1.8"/></svg><span>${esc(SCX_OPEN?t('scx.less'):t('scx.more',hide.length))}</span>`;
  b.onclick=e=>{e.stopPropagation();SCX_OPEN=!SCX_OPEN;scxApply()};box.append(b)}
{hookFn('renderTodayEv',()=>renderTodayEv,f=>{renderTodayEv=f},'post',function(){try{scxApply()}catch(e){console.error('scx',e)}})}
{const st=document.createElement('style');st.textContent=`#todayEv.scx .evchip>i{display:none}
#todayEv.scx .evchip.scx-h{display:none}#todayEv.scx.scx-open .evchip.scx-h{display:inline-flex}
#todayEv.scx .scxm{background:none;border-style:dashed;color:var(--muted);order:99}#todayEv.scx .scxm:hover{color:var(--text);border-color:var(--muted)}
#todayEv.scx .scxm .uic{width:15px;height:15px}`;document.head.append(st)}
try{renderTodayEv()}catch(e){}
