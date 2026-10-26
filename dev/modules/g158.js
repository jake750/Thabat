/* ============ 3.136 twelfth list G (health): a walk reminder in long work sessions, a daily steps goal with a month map,
   sleep against work hours each week, day challenges with a number goal (pages, repetitions) ============ */
/* 12th-78: S.settings.walkRem={on,min} — after «min» minutes of work in a row (S.timer.mode==='work'), a gentle alert; «مشيت» restarts the count */
function wlkCfg(){return Object.assign({on:false,min:50},S.settings.walkRem||{})}
const WLK={from:0,told:0};
function wlkTick(){const C=wlkCfg(),T=S.timer;if(!C.on||!T||T.mode!=='work'||!T.start){WLK.from=0;WLK.told=0;return}const now=Date.now();if(!WLK.from||WLK.from<T.start)WLK.from=T.start;
  if(now-WLK.from>=C.min*6e4&&now-WLK.told>C.min*6e4){WLK.told=now;try{alertUser(t('wlk.t'),t('wlk.b',C.min))}catch(e){}toastAct(t('wlk.t'),t('wlk.did'),()=>{WLK.from=Date.now();WLK.told=0},20000)}}
setInterval(()=>{try{wlkTick()}catch(e){}},60000);

/* 12th-79: S.settings.steps={on,goal}; day.steps (typed by hand); a Today chip and a month map */
function stpCfg(){return Object.assign({on:false,goal:8000},S.settings.steps||{})}
function stpAsk(k){k=k||todayKey();const d=day(k),v=prompt(t('stp.ask',gShort(keyToDate(k))),d.steps||'');if(v===null)return;const n=Math.max(0,Math.min(200000,parseInt(String(v).replace(/[^\d٠-٩]/g,'').replace(/[٠-٩]/g,c=>'٠١٢٣٤٥٦٧٨٩'.indexOf(c)),10)||0));if(n)d.steps=n;else delete d.steps;save();try{renderTodayEv()}catch(e){}}
{hookFn('renderTodayEv',()=>renderTodayEv,f=>{renderTodayEv=f},'post',function(){try{const C=stpCfg(),box=$('#todayEv');if(!C.on||!box||box.querySelector('[data-stp]'))return;const n=(S.days[todayKey()]||{}).steps||0;
  box.insertAdjacentHTML('beforeend',`<span class="evchip stpc" data-stp style="--c:#22c55e"><i></i>🚶 ${esc(t('stp.chip',n.toLocaleString(LANG==='ar'?'ar-EG':'en'),C.goal.toLocaleString(LANG==='ar'?'ar-EG':'en')))}${n>=C.goal?' ✓':''}<button class="stpm" aria-label="${esc(t('stp.map'))}">▦</button></span>`);
  const c=box.querySelector('[data-stp]');c.onclick=e=>{if(e.target.closest('.stpm')){e.stopPropagation();stpMap();return}stpAsk()}}catch(e){}})}
function stpMap(ym){const td=todayKey();ym=ym||td.slice(0,7);const y=+ym.slice(0,4),m=+ym.slice(5,7),first=new Date(y,m-1,1),last=new Date(y,m,0).getDate(),C=stpCfg(),lead=(first.getDay()+6)%7;let sum=0,days=0,hit=0;
  const cells=Array.from({length:lead},()=>'<i class="stpx"></i>').join('')+Array.from({length:last},(_,i)=>{const k=`${ym}-${String(i+1).padStart(2,'0')}`,n=(S.days[k]||{}).steps||0;if(n){sum+=n;days++;if(n>=C.goal)hit++}const p=Math.min(1,n/C.goal);
    return`<button class="stpd${n>=C.goal?' hit':''}${k===td?' today':''}" data-k="${k}" ${k>td?'disabled':''} style="--p:${p}" title="${esc(gShort(keyToDate(k))+' · '+n)}"><b>${i+1}</b>${n?`<small>${n>=1000?(Math.round(n/100)/10)+'k':n}</small>`:''}</button>`}).join('');
  const prev=dKey(new Date(y,m-2,1)).slice(0,7),next=dKey(new Date(y,m,1)).slice(0,7);
  openInfo('🚶 '+esc(t('stp.t')),`<div class="qygnav"><button class="btn sm ghost" data-sm="${prev}">‹</button><b>${esc(L().months[m-1]+' '+y)}</b><button class="btn sm ghost" data-sm="${next}"${next>td.slice(0,7)?' disabled':''}>›</button></div>
    <div class="qygst ady3"><span><b>${hit}</b>${esc(t('stp.hit'))}</span><span><b>${days?Math.round(sum/days).toLocaleString():0}</b>${esc(t('stp.avg'))}</span><span><b>${C.goal.toLocaleString()}</b>${esc(t('stp.goal'))}</span></div>
    <div class="stpw">${(L().sdays||L().days).slice(1).concat([(L().sdays||L().days)[0]]).map(d=>`<em>${esc(String(d).slice(0,LANG==='ar'?3:2))}</em>`).join('')}</div><div class="stpg">${cells}</div><small class="muted">${esc(t('stp.tap'))}</small>`);
  $('#infoBox').classList.add('sdybox');$$('#infoBox [data-sm]').forEach(b=>b.onclick=()=>stpMap(b.dataset.sm));$$('#infoBox .stpd[data-k]').forEach(b=>b.onclick=()=>{stpAsk(b.dataset.k);stpMap(ym)})}

/* settings rows after the day-challenge row: walk reminder (on + minutes) and steps (on + goal) */
{hookFn('renderSettings',()=>renderSettings,f=>{renderSettings=f},'post',function(){try{const r=$('#c30Row');if(!r||$('#wlkRow'))return;const W=wlkCfg(),P=stpCfg();
  r.insertAdjacentHTML('afterend',`<div class="field" id="wlkRow"><div><label data-i18n="wlk.set">${esc(t('wlk.set'))}</label><small>${esc(t('wlk.setS'))}</small></div><input class="in" type="number" id="wlkM" min="15" max="180" value="${W.min}" style="width:80px"><button class="sw-toggle ${W.on?'on':''}" id="wlkT"></button></div>
    <div class="field" id="stpRow"><div><label data-i18n="stp.set">${esc(t('stp.set'))}</label><small>${esc(t('stp.setS'))}</small></div><input class="in" type="number" id="stpG" min="1000" max="50000" step="500" value="${P.goal}" style="width:100px"><button class="sw-toggle ${P.on?'on':''}" id="stpT"></button></div>`);
  $('#wlkT').onclick=e=>{S.settings.walkRem=Object.assign(wlkCfg(),{on:!wlkCfg().on});e.currentTarget.classList.toggle('on',S.settings.walkRem.on);save()};
  $('#wlkM').onchange=e=>{S.settings.walkRem=Object.assign(wlkCfg(),{min:Math.max(15,Math.min(180,+e.target.value||50))});save()};
  $('#stpT').onclick=e=>{S.settings.steps=Object.assign(stpCfg(),{on:!stpCfg().on});e.currentTarget.classList.toggle('on',S.settings.steps.on);save();try{renderTodayEv()}catch(x){}};
  $('#stpG').onchange=e=>{S.settings.steps=Object.assign(stpCfg(),{goal:Math.max(1000,Math.min(50000,+e.target.value||8000))});save();try{renderTodayEv()}catch(x){}}}catch(e){console.error(e)}})}

/* 12th-80: Summary card — sleep and work hours for each day of the shown week */
function slwCard(){let c=$('#bSlw');const host=$('#bBal')||$('#bWd');if(!host)return;if(!c){host.insertAdjacentHTML('afterend','<div class="card" id="bSlw" style="margin-bottom:18px"></div>');c=$('#bSlw')}
  const ks=periodKeys('week',bAnchor),tk=todayKey(),rows=ks.map(k=>{const sl=k>tk?0:(+hbVal('sleep',k)||((S.days[k]||{}).sleep3||{}).h||0),wk=k>tk?0:totals(k).tot/36e5;return{k,sl,wk}}),mx=Math.max(8,...rows.map(r=>Math.max(r.sl,r.wk)));
  const avg=a=>{const v=rows.filter(r=>r.k<=tk&&r[a]>0);return v.length?Math.round(v.reduce((s,r)=>s+r[a],0)/v.length*10)/10:0};
  c.innerHTML=`<h3 class="crh">🌙 ${esc(t('slw.t'))}</h3><p class="crsub">${esc(t('slw.sub',avg('sl'),avg('wk')))}</p><div class="slwg">${rows.map(r=>`<div class="slwc${r.k===tk?' today':''}" title="${esc(gShort(keyToDate(r.k))+' · '+t('slw.tip',Math.round(r.sl*10)/10,Math.round(r.wk*10)/10))}"><div class="slwb"><i class="s" style="height:${r.sl/mx*100}%"></i><i class="w" style="height:${r.wk/mx*100}%"></i></div><small>${esc(String(L().days[keyToDate(r.k).getDay()]).slice(0,LANG==='ar'?3:2))}</small></div>`).join('')}</div>
    <div class="fyleg"><span><i class="slws"></i>${esc(t('slw.sl'))}</span><span><i class="slww"></i>${esc(t('slw.wk'))}</span></div>`}
{hookFn('renderBrief',()=>renderBrief,f=>{renderBrief=f},'post',function(){try{if(bMode==='week')slwCard();else $('#bSlw')?.remove()}catch(e){console.error(e)}})}

/* 12th-81: a day challenge may count a number instead (c.ng goal, c.nu unit, c.vals={date:n}); a tap on a day asks the number */
{const _d=c30Done;c30Done=function(c,k){if(c&&c.ng)return(+((c.vals||{})[k])||0)>=c.ng;return _d(c,k)}}
{hookFn('c30List',()=>c30List,f=>{c30List=f},'post',function(){try{const m=$('#c30M');if(!m||$('#c30Ng'))return;m.closest('label').insertAdjacentHTML('afterend',`<label>${esc(t('c3n.goal'))}<span class="c3nr"><input class="in" id="c30Ng" type="number" min="1" max="100000" placeholder="—"><input class="in" id="c30Nu" dir="auto" placeholder="${esc(t('c3n.unitPh'))}"></span></label>`);
  const go=$('#c30Go'),o=go.onclick;go.onclick=()=>{const ng=+$('#c30Ng').value||0,nu=$('#c30Nu').value.trim().slice(0,20),before=CH30().length;o&&o();const L_=CH30();if(ng>0&&L_.length>before){const c=L_[L_.length-1];c.ng=ng;if(nu)c.nu=nu;delete c.cat;delete c.min;save();try{c30Open(c.id)}catch(e){}}}}catch(e){console.error(e)}})}
{hookFn('c30Open',()=>c30Open,f=>{c30Open=f},'post',function(id){try{const c=CH30().find(x=>x.id===id);if(!c||!c.ng)return;
  $$('#infoBox [data-c30]').forEach(b=>{const k=b.dataset.c30,v=+((c.vals||{})[k])||0;if(v)b.insertAdjacentHTML('beforeend',`<small class="c3nv">${v}</small>`);
    b.onclick=()=>{const x=prompt(t('c3n.ask',gShort(keyToDate(k)),c.nu||''),v||'');if(x===null)return;const n=Math.max(0,parseInt(x,10)||0);c.vals=c.vals||{};if(n)c.vals[k]=n;else delete c.vals[k];save();c30Open(c.id);try{renderToday()}catch(e){}}});
  $('#infoBox .c30top')?.insertAdjacentHTML('afterend',`<p class="muted c3ng">${esc(t('c3n.line',c.ng,c.nu||''))}</p>`)}catch(e){console.error(e)}})}
{const _cc=cmdCommands;cmdCommands=function(){const c=(icon,label,run,kw)=>({icon,label,run,kw:kw||''});return _cc().concat([c('🚶',t('stp.t'),()=>stpMap(),'steps خطوات')])}}
