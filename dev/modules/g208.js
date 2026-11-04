/* ============ v3.172.0 thirteenth list N: letters on Hijri dates, a Gregorian year ago today, a simple countdown, hidden achievements, the Gregorian year review ============ */
/* 292 letters: open on the next Ramadan, the next Hijri new year, or the same Hijri day next year */
function n17HFind(fn,max){let d=addDays(keyToDate(todayKey()),1);for(let i=0;i<(max||400);i++){const h=hNum(d);if(fn(h))return dKey(d);d=addDays(d,1)}return null}
function n17LtrHtml(){const h=hNum(keyToDate(todayKey()));const O=[['ram',n17HFind(x=>x.m===9&&x.d===1)],['muh',n17HFind(x=>x.m===1&&x.d===1)],['hyr',n17HFind(x=>x.y===h.y+1&&x.m===h.m&&x.d>=Math.min(h.d,29))]].filter(o=>o[1]);
  return O.map(([k,d])=>`<button class="chip sm n17lw" data-n17d="${d}" title="${esc(gStr(keyToDate(d)))}">${esc(t('n17.l.'+k))}</button>`).join('')}
{hookFn('renderLetters',()=>renderLetters,f=>{renderLetters=f},'post',function(){try{if(LTV!=='new')return;const w=$('#ltrBox .ltrwhen'),inp=$('#ltrD');if(!w||!inp||w.querySelector('.n17lw'))return;
  inp.insertAdjacentHTML('beforebegin',n17LtrHtml());w.querySelectorAll('[data-n17d]').forEach(b=>b.onclick=()=>{w.querySelectorAll('[data-m],[data-n17d]').forEach(x=>x.classList.toggle('on',x===b));inp.value=b.dataset.n17d;inp.dispatchEvent(new Event('input',{bubbles:true}))})}catch(e){console.error(e)}})}
function n17LtrLine(){const L_=(S.letters||[]),tk=todayKey(),sealed=L_.filter(l=>!l.read&&l.open>tk).sort((a,b)=>a.open<b.open?-1:1);
  return`<div class="n17ltr"><span>✉</span><div><b>${esc(t('n17.ltT'))}</b><small>${sealed.length?esc(t('n17.ltN',sealed.length,gStr(keyToDate(sealed[0].open)))):esc(t('n17.lt0'))}</small></div><button class="btn sm" data-n17lt>${esc(t('lt2.new'))}</button></div>`}
function n17LtrBind(box,openK){const b=box&&box.querySelector('[data-n17lt]');if(!b)return;b.onclick=()=>{try{$('#infoModal').classList.remove('on')}catch(e){}openLetters('new');if(openK)setTimeout(()=>{const i=$('#ltrD');if(i&&openK>todayKey()){i.value=openK;$('#ltrBox').querySelectorAll('[data-m]').forEach(x=>x.classList.remove('on'))}},30)}}

/* 293 this day a Gregorian year ago */
function n17AgoKey(){const d=keyToDate(todayKey()),y=new Date(d.getFullYear()-1,d.getMonth(),d.getDate());if(y.getMonth()!==d.getMonth())y.setDate(0);return dKey(y)}
function n17AgoData(k){const d=S.days[k]||{},ms=totals(k).tot,q=d.quran,pg=q?Math.max(+q.read||0,(q.pgs||[]).length):0,td=(d.tasks||[]).filter(x=>x.done).length,
  nt=(S.notes||[]).filter(n=>!n.arc&&(n.day===k||(n.created&&keyOf(n.created)===k))),pr=k>=plSince()?PRAYERS.filter(p=>{const s=plStatus(k,p);return s==='on'||s==='auto'}).length:0;return{ms,pg,td,nt,pr}}
function n17AgoOpen(k){const o=n17AgoData(k),by=rollBy(totals(k).by||{}),cats=Object.entries(by).filter(e=>e[1]>=6e4).sort((a,b)=>b[1]-a[1]).slice(0,4);
  const tile=(ic,v,l)=>`<div><small>${ic} ${esc(l)}</small><b>${v}</b></div>`;
  openInfo('📆 '+esc(t('n17.agoT')),`<p class="muted">${esc(gStr(keyToDate(k)))} · ${esc(hStr?hStr(keyToDate(k)):'')}</p><div class="hyrt">${tile('⏱',o.ms?fmtHM(o.ms):'—',t('n17.h'))}${tile('📖',o.pg||'—',t('n17.pg'))}${tile('☑',o.td||'—',t('n17.td'))}${tile('🕌',o.pr?o.pr+' / 5':'—',t('n17.pr'))}</div>
    ${cats.length?`<div class="n17cats">${cats.map(([c,v])=>{const o=S.settings.categories.find(x=>x.id===c)||{id:c,name:c};return`<span><i style="background:${esc(o.color||'var(--accent)')}"></i>${esc(catName(o))} · ${fmtHM(v)}</span>`}).join('')}</div>`:''}
    ${o.nt.length?`<h4 class="n17h4">📝 ${esc(t('n17.nt',o.nt.length))}</h4><div class="n17nts">${o.nt.slice(0,8).map(n=>`<button class="btn sm ghost" data-n17n="${esc(n.id)}" dir="auto">${esc(n.title||t('n17.untitled'))}</button>`).join('')}</div>`:''}
    <div class="row"><button class="btn sm" id="n17AgoCal">${esc(t('n17.agoCal'))}</button></div>`);
  const b=$('#infoBox');b.classList.add('hyrbox');b.querySelectorAll('[data-n17n]').forEach(x=>x.onclick=()=>{$('#infoModal').classList.remove('on');showView('boards');setTimeout(()=>openNote(x.dataset.n17n),60)});
  $('#n17AgoCal').onclick=()=>{$('#infoModal').classList.remove('on');selKey=k;calM=new Date(keyToDate(k).getFullYear(),keyToDate(k).getMonth(),1);showView('cal')}}
{hookFn('renderTodayEv',()=>renderTodayEv,f=>{renderTodayEv=f},'post',function(){try{const box=$('#todayEv');if(!box||box.querySelector('[data-n17ago]'))return;const k=n17AgoKey();if(!S.days[k]&&!(S.notes||[]).some(n=>n.day===k))return;
  const o=n17AgoData(k),parts=[o.ms>=6e4?fmtHM(o.ms):'',o.pg?t('n17.pgN',o.pg):'',o.nt.length?t('n17.nt',o.nt.length):''].filter(Boolean);if(!parts.length)return;
  box.insertAdjacentHTML('beforeend',`<span class="evchip n17ago" data-n17ago style="--c:#38bdf8" title="${esc(gStr(keyToDate(k)))}"><i></i>📆 ${esc(t('n17.agoC'))}: ${esc(parts.join(' · '))}</span>`);box.querySelector('[data-n17ago]').onclick=()=>n17AgoOpen(k)}catch(e){console.error(e)}})}

/* 296 a simple countdown from the Today title (no work session) */
const N17T={k:'thabat.ctd17',iv:0};
function n17TGet(){try{return JSON.parse(localStorage.getItem(N17T.k)||'null')}catch(e){return null}}
function n17TSet(o){try{o?localStorage.setItem(N17T.k,JSON.stringify(o)):localStorage.removeItem(N17T.k)}catch(e){}n17TSched();n17TPaint()}
function n17TLeft(o){return o.pz!=null?o.pz:Math.max(0,o.end-Date.now())}
function n17TFmt(ms){const s=Math.ceil(ms/1000),m=Math.floor(s/60);return String(m).padStart(2,'0')+':'+String(s%60).padStart(2,'0')}
function n17TStart(min){if(!(min>0))return;n17TSet({end:Date.now()+min*6e4,dur:min*6e4,pz:null,at:Date.now()});toast(t('n17.tmOn',min))}
function n17TSched(){try{if(ANDROID)androidSchedule()}catch(e){}try{if(typeof pcnPush==='function')pcnPush(true)}catch(e){}}
function n17TPaint(){const o=n17TGet();let p=$('#n17Pill');if(!o){if(p)p.remove();clearInterval(N17T.iv);N17T.iv=0;const b=$('#n17TmB');if(b)b.classList.remove('on');return}
  if(!p){document.body.insertAdjacentHTML('beforeend',`<div class="n17pill" id="n17Pill" role="timer"><span class="n17pi">⏱</span><b id="n17PT"></b><button type="button" data-n17t="pz" aria-label="${esc(t('n17.pz'))}"></button><button type="button" data-n17t="p5" dir="ltr">+5</button><button type="button" data-n17t="x" aria-label="${esc(t('n17.stop'))}">✕</button></div>`);p=$('#n17Pill');
    p.onclick=e=>{const b=e.target.closest('[data-n17t]');if(!b)return;const o=n17TGet();if(!o)return;const a=b.dataset.n17t;
      if(a==='x'){n17TSet(null);return}if(a==='p5'){if(o.pz!=null)o.pz+=3e5;else o.end+=3e5;o.dur+=3e5;n17TSet(o);return}
      if(a==='pz'){if(o.pz!=null){o.end=Date.now()+o.pz;o.pz=null}else o.pz=Math.max(0,o.end-Date.now());n17TSet(o)}}}
  const left=n17TLeft(o);$('#n17PT').textContent=n17TFmt(left);p.querySelector('[data-n17t="pz"]').textContent=o.pz!=null?'▶':'⏸';p.classList.toggle('pz',o.pz!=null);p.style.setProperty('--n17p',Math.min(1,1-left/(o.dur||1)));
  const b=$('#n17TmB');if(b)b.classList.add('on');if(!N17T.iv)N17T.iv=setInterval(n17TTick,500)}
function n17TTick(){const o=n17TGet();if(!o){n17TPaint();return}if(o.pz==null&&Date.now()>=o.end){n17TSet(null);const m=Math.round((o.dur||0)/6e4);
  try{chimeSoft(880);setTimeout(()=>chimeSoft(988),380)}catch(e){}try{navigator.vibrate&&navigator.vibrate([200,120,200])}catch(e){}
  if(!ANDROID||!document.hidden)try{alertUser(t('n17.tmEnd'),t('n17.tmEndB',m))}catch(e){toast(t('n17.tmEnd'))}return}n17TPaint()}
function n17TMenu(e){const b=e.currentTarget.getBoundingClientRect(),o=n17TGet();
  qPopAt(`<div class="aymh">${esc(t('n17.tmT'))}</div><small class="muted n17tms">${esc(t('n17.tmS'))}</small><div class="n17tmo">${[5,10,20,30,45,60].map(m=>`<button class="chip sm" data-n17m="${m}">${esc(t('n17.min',m))}</button>`).join('')}<button class="chip sm" data-n17m="c">${esc(t('n17.other'))}</button></div>${o?`<button class="btn sm ghost" data-n17m="x">${esc(t('n17.stop'))}</button>`:''}`,b.left+b.width/2,b.bottom-10,'aymenu n17tmp');
  const p=$('#ppPop');if(p)p.querySelectorAll('[data-n17m]').forEach(x=>x.onclick=()=>{const v=x.dataset.n17m;closePP();if(v==='x'){n17TSet(null);return}if(v==='c'){const r=prompt(t('n17.ask'),'15');const n=parseFloat(String(r||'').replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)));if(n>0&&n<=600)n17TStart(n);return}n17TStart(+v)})}
function n17TBtn(){const h=$('#v-today>.pgt');if(!h||$('#n17TmB'))return;const b=document.createElement('button');b.type='button';b.id='n17TmB';b.className='n17tmb';b.title=t('n17.tmT');b.setAttribute('aria-label',t('n17.tmT'));b.textContent='⏱';const r=$('#tdaRing');r&&r.parentNode===h?h.insertBefore(b,r):h.append(b);b.onclick=n17TMenu;if(n17TGet())b.classList.add('on')}
{hookFn('renderToday',()=>renderToday,f=>{renderToday=f},'post',function(){try{n17TBtn()}catch(e){console.error(e)}})}
{hookFn('renderTasks',()=>renderTasks,f=>{renderTasks=f},'post',function(){try{n17TBtn()}catch(e){}})}
setTimeout(()=>{try{const h=$('#v-today>.pgt');if(h)new MutationObserver(()=>{if(!$('#n17TmB'))setTimeout(n17TBtn,0)}).observe(h,{childList:true})}catch(e){}},900);
{const _es=extraSched;extraSched=function(out,now){_es(out,now);try{const o=n17TGet();if(o&&o.pz==null&&o.end>now)out.push({id:9995,t:o.end,title:t('n17.tmEnd'),body:t('n17.tmEndB',Math.round(o.dur/6e4)),open:'today'})}catch(e){}}}
setTimeout(()=>{try{n17TBtn();n17TPaint()}catch(e){}},800);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)try{n17TTick()}catch(e){}});

/* 298 hidden achievements, found by reaching them; shown in «your journey» */
function n17Gold(k){const tt=totals(k).tot,g=goalMs(k);return tt>0&&g>0&&tt>=g}
function n17Tot(f){let s=0;Object.keys(S.days||{}).forEach(k=>{try{s+=+f(k,S.days[k])||0}catch(e){}});return s}
function n17Run(pred){try{return bestRun(pred)}catch(e){return 0}}
function n17RamFull(){const by={};Object.keys(S.days||{}).forEach(k=>{if(!/^\d{4}-/.test(k)||!S.days[k].fast)return;const h=hNum(keyToDate(k));if(h.m===9)by[h.y]=(by[h.y]||0)+1});return Object.values(by).some(n=>n>=29)}
const N17A=[
 {id:'kh1',ic:'🏁',v:()=>((S.quran||{}).khatmas||[]).length>=1},
 {id:'kh5',ic:'🏁',v:()=>((S.quran||{}).khatmas||[]).length>=5},
 {id:'g1',ic:'✦',v:()=>Object.keys(S.days||{}).some(n17Gold)},
 {id:'g100',ic:'✦',v:()=>Object.keys(S.days||{}).filter(n17Gold).length>=100},
 {id:'g7r',ic:'🔥',v:()=>n17Run(n17Gold)>=7},
 {id:'h100',ic:'⏱',v:()=>n17Tot(k=>totals(k).tot)>=100*36e5},
 {id:'h1000',ic:'⏱',v:()=>n17Tot(k=>totals(k).tot)>=1000*36e5},
 {id:'fj40',ic:'🌅',v:()=>n17Run(k=>k>=plSince()&&plStatus(k,'fajr')==='on')>=40},
 {id:'pr30',ic:'🕌',v:()=>n17Run(k=>k>=plSince()&&PRAYERS.every(p=>plStatus(k,p)==='on'))>=30},
 {id:'ram',ic:'🌙',v:n17RamFull},
 {id:'pg604',ic:'📖',v:()=>n17Tot((k,d)=>{const q=d.quran;return q?Math.max(+q.read||0,(q.pgs||[]).length):0})>=604},
 {id:'hz20',ic:'🧠',v:()=>qMem().length>=20},
 {id:'hzAll',ic:'🧠',v:()=>qMem().length>=604},
 {id:'td1k',ic:'☑',v:()=>n17Tot((k,d)=>(d.tasks||[]).filter(x=>x.done).length)>=1000},
 {id:'nt100',ic:'📝',v:()=>(S.notes||[]).length>=100},
 {id:'bk1',ic:'📚',v:()=>Object.values((S.lib||{}).bk||{}).some(b=>b&&b.done)},
 {id:'ltr',ic:'✉',v:()=>(S.letters||[]).some(l=>l.read)},
 {id:'yr1',ic:'🧭',v:()=>{const ks=Object.keys(S.days||{}).filter(k=>/^\d{4}-\d\d-\d\d$/.test(k)).sort();return ks.length&&(keyToDate(todayKey())-keyToDate(ks[0]))/864e5>=365}}];
const N17={last:0};
function n17Check(quiet){const now=Date.now();if(!quiet&&now-N17.last<10*6e4)return;N17.last=now;if(S._demo)return;const A=S.ach17||(S.ach17={}),first=!S.ach17init,won=[];
  N17A.forEach(a=>{if(A[a.id])return;let v=false;try{v=a.v()}catch(e){}if(v){A[a.id]=first?1:now;won.push(a)}});
  if(first){S.ach17init=1;save();return}if(!won.length)return;save();const a=won[won.length-1];toastAct(t('n17.found',t('n17.a.'+a.id)),t('n17.see'),jrnOpen,9000)}
{hookFn('renderToday',()=>renderToday,f=>{renderToday=f},'post',function(){const run=()=>{try{n17Check()}catch(e){console.error(e)}};window.requestIdleCallback?requestIdleCallback(run,{timeout:4000}):setTimeout(run,1500)})}
function n17AchHtml(){const A=S.ach17||{},got=N17A.filter(a=>A[a.id]),hid=N17A.length-got.length;
  return`<h4 class="n17h4">${esc(t('n17.achT',got.length))}</h4>${got.length?`<div class="n17ach">${got.map(a=>`<div class="n17a" title="${esc(t('n17.d.'+a.id))}"><span class="n17ai">${a.ic}</span><b>${esc(t('n17.a.'+a.id))}</b><small>${A[a.id]>1?esc(gShort(new Date(A[a.id]))):esc(t('n17.before'))}</small></div>`).join('')}</div>`:`<small class="muted">${esc(t('n17.ach0'))}</small>`}
    ${hid?`<div class="n17hid">${'<i></i>'.repeat(Math.min(hid,12))}<small>${esc(t('n17.hid',hid))}</small></div>`:''}`}
{hookFn('jrnOpen',()=>jrnOpen,f=>{jrnOpen=f},'post',function(){try{n17Check(true);const b=$('#infoBox .infob');if(!b)return;const ft=b.querySelector('.jrnft');const h=`<div class="n17jr">${n17AchHtml()}${n17LtrLine()}</div>`;ft?ft.insertAdjacentHTML('beforebegin',h):b.insertAdjacentHTML('beforeend',h);n17LtrBind(b)}catch(e){console.error(e)}})}

/* 300 «my year»: the Gregorian year review */
function gyKeys(y){const tk=todayKey(),out=[];let d=new Date(y,0,1);while(d.getFullYear()===y){const k=dKey(d);if(k>tk)break;out.push(k);d=addDays(d,1)}return out}
function gyYearOf(v){if(!v)return 0;if(typeof v==='string')return+v.slice(0,4)||0;const d=new Date(v);return isNaN(d)?0:d.getFullYear()}
function gyStats(y){const ks=gyKeys(y),r={days:0,ms:0,pr:0,prN:0,pg:0,nf:0,fast:0,goal:0,td:0,mon:{},run:0,best:null,nt:0,kh:0,bk:0};let run=0;
  ks.forEach(k=>{const d=S.days[k];const tot=totals(k).tot;if(tot>0||d)r.days++;r.ms+=tot;const g=goalMs(k),gd=g&&tot>=g&&tot>0;if(gd){r.goal++;run++;r.run=Math.max(r.run,run)}else if(k!==todayKey())run=0;
    const m=+k.slice(5,7);r.mon[m]=(r.mon[m]||0)+tot;if(tot>0&&(!r.best||tot>r.best[1]))r.best=[k,tot];
    if(k>=plSince()){PRAYERS.forEach(p=>{const s=plStatus(k,p);r.prN++;if(s==='on'||s==='auto')r.pr++})}
    if(d){const q=d.quran;if(q)r.pg+=Math.max(+q.read||0,(q.pgs||[]).length);try{r.nf+=nflRk(k)}catch(e){}if(d.fast)r.fast++;r.td+=(d.tasks||[]).filter(x=>x.done).length}});
  r.nt=(S.notes||[]).filter(n=>gyYearOf(n.created||n.day)===y).length;r.kh=((S.quran||{}).khatmas||[]).filter(x=>gyYearOf(x.end)===y).length;
  r.bk=Object.values((S.lib||{}).bk||{}).filter(b=>b&&typeof b.done==='number'&&b.done>1e11&&gyYearOf(b.done)===y).length;r.ach=Object.values(S.ach17||{}).filter(v=>v>1&&gyYearOf(v)===y).length;return r}
function gyrOpen(y){const now=keyToDate(todayKey());y=y||(now.getMonth()===0&&now.getDate()<=10?now.getFullYear()-1:now.getFullYear());const A=gyStats(y),B=gyStats(y-1);(S.gyRev=S.gyRev||{})[y]=Date.now();save();
  const cmp=(a,b,f)=>`<b>${f(a)}</b>${b?`<i class="${a>=b?'up':'dn'}">${a>=b?'▲':'▼'} ${f(Math.abs(a-b))}</i>`:''}`,pct=(a,n)=>n?Math.round(a/n*100):0,I=v=>String(Math.round(v));
  const tl=(k,a,b,f)=>`<div><small>${esc(t(k))}</small>${cmp(a,b,f||I)}</div>`;const bm=Object.entries(A.mon).sort((x,z)=>z[1]-x[1])[0];
  const lines=[bm&&bm[1]?t('n17.yBestM',L().months[+bm[0]-1],fmtHM(bm[1])):'',A.best?t('n17.yBestD',gStr(keyToDate(A.best[0])),fmtHM(A.best[1])):'',A.run>1?t('n17.yRun',A.run):'',A.kh?t('n17.yKh',A.kh):'',A.bk?t('n17.yBk',A.bk):'',A.ach?t('n17.yAch',A.ach):''].filter(Boolean);
  openInfo('🗓 '+esc(t('n17.yT',y)),`<div class="hyr"><p class="muted">${esc(t('n17.ySub',y-1))}</p><div class="hyrt">
    ${tl('hyr.hours',A.ms/36e5,B.ms/36e5)}${tl('hyr.goal',A.goal,B.goal)}${tl('hyr.pr',pct(A.pr,A.prN),pct(B.pr,B.prN),v=>v+'٪')}${tl('hyr.pg',A.pg,B.pg)}${tl('hyr.nf',A.nf,B.nf)}${tl('hyr.fast',A.fast,B.fast)}${tl('n17.yTd',A.td,B.td)}${tl('n17.yNt',A.nt,B.nt)}</div>
    ${lines.length?`<ul class="n17yl">${lines.map(l=>`<li>${esc(l)}</li>`).join('')}</ul>`:''}
    ${n17LtrLine()}
    <div class="row" style="justify-content:space-between"><button class="btn sm ghost" id="gyrP">‹ ${y-1}</button>${y<now.getFullYear()?`<button class="btn sm ghost" id="gyrN">${y+1} ›</button>`:''}</div></div>`);
  const b=$('#infoBox');b.classList.add('hyrbox');$('#gyrP').onclick=()=>gyrOpen(y-1);const n=$('#gyrN');if(n)n.onclick=()=>gyrOpen(y+1);
  const nk=dKey(new Date(y+1,11,31));n17LtrBind(b,nk)}
{hookFn('renderBrief',()=>renderBrief,f=>{renderBrief=f},'post',function(){try{const h=$('#hyrB');if(h&&!$('#gyrB')){h.insertAdjacentHTML('afterend',`<button class="btn sm ghost" id="gyrB" title="${esc(t('n17.yTip'))}">${esc(t('n17.yB'))}</button>`);$('#gyrB').onclick=()=>gyrOpen()}}catch(e){console.error(e)}})}
{hookFn('renderTodayEv',()=>renderTodayEv,f=>{renderTodayEv=f},'post',function(){try{const box=$('#todayEv');if(!box||box.querySelector('[data-gyrc]'))return;const d=keyToDate(todayKey()),m=d.getMonth(),dd=d.getDate();
  const y=m===11&&dd>=20?d.getFullYear():m===0&&dd<=10?d.getFullYear()-1:0;if(!y||(S.gyRev||{})[y]||!Object.keys(S.days||{}).some(k=>k.startsWith(y+'-')))return;
  box.insertAdjacentHTML('beforeend',`<span class="evchip" data-gyrc style="--c:#f59e0b"><i></i>🗓 ${esc(t('n17.yChip',y))}</span>`);box.querySelector('[data-gyrc]').onclick=()=>{gyrOpen(y);try{renderTodayEv()}catch(e){}}}catch(e){console.error(e)}})}
{const _cc=cmdCommands;cmdCommands=function(...a){const L_=_cc(...a);try{L_.push({icon:'🗓',label:t('n17.yB'),run:()=>gyrOpen(),kw:'year review gregorian سنتي السنة الميلادية حصاد'},{icon:'⏱',label:t('n17.tmT'),run:()=>{showView('today');setTimeout(()=>{const b=$('#n17TmB');b&&b.click()},200)},kw:'timer countdown مؤقت عداد'},{icon:'📆',label:t('n17.agoT'),run:()=>n17AgoOpen(n17AgoKey()),kw:'year ago قبل سنة'})}catch(e){}return L_}}
