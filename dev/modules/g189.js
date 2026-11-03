/* ============ v3.159.0 thirteenth list E: Summary cards (Quran this week, moments, light days, tags, books and lessons, records log, Ramadan worship, goal ETA) ============ */
const SM13={};
function sm13Keys(){return periodKeys(bMode,bAnchor).filter(k=>k<=todayKey())}
function sm13PrevKeys(){const a=bMode==='week'?addDays(bAnchor,-7):brPrevAnchor(bAnchor);return periodKeys(bMode,a)}
function sm13Card(id,after){let c=$('#'+id);if(!c){const h=after.map(x=>$('#'+x)).find(Boolean);if(!h)return null;h.insertAdjacentHTML('afterend',`<div class="card sm13c" id="${id}" style="margin-bottom:18px"></div>`);c=$('#'+id)}return c}
function sm13Day(k){return gShort(keyToDate(k))}
/* 110: Quran this week in one line */
function sm13Quran(keys){const m=qc1CalMap(),rv={},L_=S.quran.rvLast||{};for(const p in L_){const k=L_[p];rv[k]=(rv[k]||0)+1}const ks=new Set(keys);let r=0,h=0,v=0,ts=0,tsp=0;
  keys.forEach(k=>{r+=qygN(k);h+=m[k]||0;const q=S.days[k]&&S.days[k].quran;v+=Math.max(rv[k]||0,q&&q.review&&Array.isArray(q.rv)?q.rv.length:0)});
  (S.quran.tsm||[]).forEach(x=>{if(ks.has(x.d)){ts++;tsp+=(x.ps||[]).length}});return{r,h:Math.round(h*10)/10,v,ts,tsp}}
function sm13QCard(){const c=sm13Card('bQw',['bQh','bRec']);if(!c)return;const A=sm13Quran(sm13Keys()),B=sm13Quran(sm13PrevKeys().filter(k=>k<=todayKey()));
  const it=(ic,lab,n)=>`<span class="sm13q"><span class="sm13qi">${ic}</span><b>${n}</b><small>${esc(lab)}</small></span>`;
  c.innerHTML=`<h3 class="crh">📖 ${esc(t(bMode==='week'?'sm13.qwT':'sm13.qmT'))}</h3><div class="sm13ql">${it('📖',t('sm13.read'),t('sm13.pg',A.r))}${it('🧠',t('sm13.hifz'),t('sm13.pg',A.h))}${it('🔁',t('sm13.rev'),t('sm13.pg',A.v))}${it('🎙',t('sm13.tsm'),t('sm13.tms',A.ts))}</div>`+
  `<p class="crsub sm13prev">${esc(t(bMode==='week'?'sm13.prevW':'sm13.prevM'))}: ${esc([t('sm13.read')+' '+B.r,t('sm13.hifz')+' '+B.h,t('sm13.rev')+' '+B.v,t('sm13.tsm')+' '+B.ts].join(' · '))}</p>`}
/* 116: moments of the period */
function sm13MCard(){const c=sm13Card('bMom',['bQw','bQh']);if(!c)return;const keys=sm13Keys();let ls=null,es=null,mq=null,bd=null,mt=null;
  keys.forEach(k=>{const d=S.days[k];if(!d)return;const ss=d.sessions||[];ss.forEach(s=>{const v=s.end-s.start;if(!ls||v>ls.v)ls={v,k};if(v>=3e5){const dt=new Date(s.start),m=dt.getHours()*60+dt.getMinutes();if(!es||m<es.v)es={v:m,k}}});
    const q=qygN(k);if(q&&(!mq||q>mq.v))mq={v:q,k};const tt=totals(k).tot;if(tt&&(!bd||tt>bd.v))bd={v:tt,k};const td=(d.tasks||[]).filter(x=>x.done).length;if(td&&(!mt||td>mt.v))mt={v:td,k}});
  const row=(ic,lab,val,o)=>o?`<button class="sm13m" data-crk="${o.k}"><span class="sm13qi">${ic}</span><span>${esc(lab)}</span><b>${esc(val)}</b><small>${esc(L().sdays[keyToDate(o.k).getDay()]+' '+sm13Day(o.k))}</small></button>`:'';
  const rows=[row('⏱',t('sm13.mLong'),ls?fmtHM(ls.v):'',ls),row('🌅',t('sm13.mEarly'),es?pad(Math.floor(es.v/60))+':'+pad(es.v%60):'',es),row('📖',t('sm13.mQuran'),mq?t('sm13.pg',mq.v):'',mq),row('🏆',t('sm13.mBest'),bd?fmtHM(bd.v):'',bd),row('✓',t('sm13.mTasks'),mt?t('sm13.tk',mt.v):'',mt)].join('');
  c.innerHTML=`<h3 class="crh">✨ ${esc(t(bMode==='week'?'sm13.momW':'sm13.momM'))}</h3>`+(rows?`<div class="sm13ml">${rows}</div>`:`<p class="crsub">${esc(t('sm13.none'))}</p>`);
  c.querySelectorAll('[data-crk]').forEach(b=>b.onclick=()=>crNav(b.dataset.crk))}
/* 118: light days and what follows them */
function sm13LCard(){const c=sm13Card('bLtd',['bMom','bQh']);if(!c)return;const keys=sm13Keys(),n=keys.filter(k=>S.days[k]&&S.days[k].light).length,tk=todayKey();let a=0,an=0,b=0,bn=0,ln=0;
  for(let i=1;i<=90;i++){const k=dKey(addDays(keyToDate(tk),-i));const d=S.days[k];if(!d||d.light)continue;const y=S.days[dKey(addDays(keyToDate(k),-1))],tt=totals(k).tot;if(!tt)continue;if(y&&y.light){a+=tt;an++}else{b+=tt;bn++}}
  for(let i=0;i<90;i++){const d=S.days[dKey(addDays(keyToDate(tk),-i))];if(d&&d.light)ln++}
  let eff='';if(an&&bn){const A=a/an,B=b/bn,pc=B?Math.round((A-B)/B*100):0;eff=`<p class="crsub">${esc(t('sm13.ltAfter',fmtHM(A),fmtHM(B)))} <i class="crd ${pc>=0?'up':'dn'}">${pc>=0?'▲':'▼'} ${Math.abs(pc)}%</i></p>`}
  else if(ln)eff=`<p class="crsub">${esc(t('sm13.ltFew'))}</p>`;
  c.innerHTML=`<h3 class="crh">🍃 ${esc(t('sm13.ltT'))}</h3><p class="sm13big">${esc(n?t(bMode==='week'?'sm13.ltNw':'sm13.ltNm',t('sm13.days',n)):t(bMode==='week'?'sm13.lt0w':'sm13.lt0m'))}</p>${eff}<p class="crsub">${esc(t('sm13.lt90',t('sm13.days',ln)))}</p>`}
/* 120: tags most done (monthly) */
function sm13TCard(){let c=$('#bTgs');if(bMode!=='month'){if(c)c.remove();return}c=sm13Card('bTgs',['bLtd','bQh']);if(!c)return;const M={};
  sm13Keys().forEach(k=>{((S.days[k]||{}).tasks||[]).forEach(x=>{if(!x.done)return;new Set(tk13Tags(x.text)).forEach(g=>{M[g]=(M[g]||0)+1})})});
  const L_=Object.entries(M).sort((a,b)=>b[1]-a[1]).slice(0,8),mx=L_.length?L_[0][1]:1;
  c.innerHTML=`<h3 class="crh"># ${esc(t('sm13.tgT'))}</h3>`+(L_.length?`<div class="sm13tg">${L_.map(([g,n])=>`<button class="sm13tr" data-sm13tg="${esc(g)}"><span dir="auto">#${esc(g)}</span><i><u style="width:${(n/mx*100).toFixed(1)}%"></u></i><b>${esc(t('sm13.tk',n))}</b></button>`).join('')}</div>`:`<p class="crsub">${esc(t('sm13.tg0'))}</p>`);
  c.querySelectorAll('[data-sm13tg]').forEach(b=>b.onclick=()=>{try{showView('today');CTX='#'+b.dataset.sm13tg;renderTasks()}catch(e){}})}
/* 121: books and lessons of the month */
function sm13LibOf(m){const P=LIBS().prog||{};if(m.lib.startsWith('bk:')){const k=m.lib.slice(3);return{id:'b:'+k,n:(BKS()[k]||{}).t||String(m.title||'').replace(/^.*?—\s*/,''),b:k}}const p=P[m.lib];const cn=(p&&p.c)||String(m.title||'').split(' — ')[0];return{id:'c:'+cn,n:cn,c:cn}}
function sm13RCard(){let c=$('#bLrn');if(bMode!=='month'){if(c)c.remove();return}c=sm13Card('bLrn',['bLearn','bTgs','bQh']);if(!c)return;
  const keys=periodKeys(bMode,bAnchor),k0=keys[0],k1=keys[keys.length-1],t0=keyToDate(k0).getTime(),t1=addDays(keyToDate(k1),1).getTime(),P=LIBS().prog||{},B=BKS();
  const first={},inM={},prevM={},nm={},pk=dKey(addDays(keyToDate(k0),-31));
  for(let d=addDays(keyToDate(k0),-400),e=keyToDate(k1>todayKey()?todayKey():k1);d<=e;d=addDays(d,1)){const k=dKey(d),D=S.days[k];if(!D||!D.media)continue;D.media.forEach(m=>{if(!m.lib)return;const o=sm13LibOf(m);nm[o.id]=o;if(!first[o.id])first[o.id]=k;if(k>=k0)inM[o.id]=1;else if(k>=pk)prevM[o.id]=1})}
  const fin=[],cDone={};for(const id in P){const p=P[id];if(p.done&&p.at>=t0&&p.at<t1){const cn=p.c||'';cDone[cn]=(cDone[cn]||0)+1}}
  for(const cn in cDone)fin.push({n:cn||t('sm13.lesson'),s:t('sm13.lsn',cDone[cn])});
  for(const k in B){const r=B[k];if(r.done&&r.done>=t0&&r.done<t1)fin.push({n:r.t||k,s:t('sm13.book'),b:1})}
  const started=Object.keys(first).filter(id=>first[id]>=k0).map(id=>nm[id]);
  const cFin=cn=>{const ls=Object.values(P).filter(p=>p.c===cn);return ls.length&&ls.every(p=>p.done)};
  const stopped=Object.keys(prevM).filter(id=>!inM[id]).map(id=>nm[id]).filter(o=>o.b?!(B[o.b]&&B[o.b].done):!cFin(o.c));
  const ul=(L_,f)=>L_.length?`<ul class="sm13ul">${L_.slice(0,10).map(f).join('')}${L_.length>10?`<li class="muted">+${L_.length-10}</li>`:''}</ul>`:`<p class="crsub">—</p>`;
  const ic=o=>o.b?'📖':'🎬';
  c.innerHTML=`<h3 class="crh">📚 ${esc(t('sm13.lrT'))}</h3><div class="sm13lr"><div><b>✓ ${esc(t('sm13.lrFin'))} (${fin.length})</b>${ul(fin,o=>`<li><span dir="auto">${o.b?'📖':'🎬'} ${esc(o.n)}</span><small>${esc(o.s)}</small></li>`)}</div>`+
  `<div><b>▶ ${esc(t('sm13.lrNew'))} (${started.length})</b>${ul(started,o=>`<li><span dir="auto">${ic(o)} ${esc(o.n)}</span></li>`)}</div>`+
  `<div><b>⏸ ${esc(t('sm13.lrStop'))} (${stopped.length})</b>${ul(stopped,o=>`<li><span dir="auto">${ic(o)} ${esc(o.n)}</span></li>`)}</div></div>`}
{hookFn('renderBrief',()=>renderBrief,f=>{renderBrief=f},'post',function(){[sm13QCard,sm13MCard,sm13LCard,sm13TCard,sm13RCard,sm13RecBtn].forEach(f=>{try{f()}catch(e){console.error(e)}})})}
/* 123: the whole records log, with the date of each record and what it beat */
function sm13RecBtn(){const h=$('#bRec h3');if(!h||$('#sm13RecB'))return;h.insertAdjacentHTML('beforeend',`<button class="btn sm ghost" id="sm13RecB">${esc(t('sm13.log'))}</button>`);$('#sm13RecB').onclick=sm13RecLog}
function sm13RecHist(){const ks=Object.keys(S.days).filter(k=>k<=todayKey()).sort(),H={day:[],week:[],month:[],run:[],pr:[],sess:[],pg:[]},W={},M={},Wo=[],Mo=[];
  const push=(a,v,k)=>{const p=a[a.length-1];if(!p||v>p.v)a.push({v,k,p:p||null})};let run=0,pr=0,prev=null,rk=null,pk=null;const runEnd=(a,n,k)=>{if(n)push(a,n,k)};
  ks.forEach(k=>{const tot=totals(k).tot,d=S.days[k];if(tot)push(H.day,tot,k);
    const wk=periodKeys('week',keyToDate(k))[0];if(!(wk in W))Wo.push(wk);W[wk]=(W[wk]||0)+tot;const mo=k.slice(0,7);if(!(mo in M))Mo.push(mo);M[mo]=(M[mo]||0)+tot;
    const cont=prev&&dKey(addDays(keyToDate(prev),1))===k;if(!cont){runEnd(H.run,run,rk);runEnd(H.pr,pr,pk);run=0;pr=0}
    if(tot>=goalMs(k)&&tot>0){run++;rk=k}else{runEnd(H.run,run,rk);run=0}
    let all=true;PRAYERS.forEach(p=>{const s=plStatus(k,p);if(s!=='on'&&s!=='auto')all=false});if(all&&k>=plSince()){pr++;pk=k}else{runEnd(H.pr,pr,pk);pr=0}
    (d.sessions||[]).forEach(s=>push(H.sess,s.end-s.start,k));const pg=qPgsOf(k).length||((d.quran&&d.quran.read)||0);if(pg)push(H.pg,pg,k);prev=k});
  runEnd(H.run,run,rk);runEnd(H.pr,pr,pk);Wo.forEach(w=>{if(W[w])push(H.week,W[w],w)});Mo.forEach(m=>{if(M[m])push(H.month,M[m],m)});return H}
function sm13RecLog(){const H=sm13RecHist(),ds=k=>k?sm13Day(k):'',wl=k=>gShort(keyToDate(k))+' – '+gShort(addDays(keyToDate(k),6)),ml=m=>L().months[+m.slice(5)-1]+' '+m.slice(0,4);
  const K=[['day','📅','crx.bestDay',fmtHM,ds],['week','🗓','crx.bestWeek',fmtHM,wl],['month','📆','crx.bestMonth',fmtHM,ml],['run','🔥','crx.run',crxDays,ds],['pr','🕌','crx.prRun',crxDays,ds],['sess','⏱','crx.longSess',fmtHM,ds],['pg','📖','crx.mostPg',v=>t('sm13.pg',v),ds]];
  const sec=K.map(([k,ic,lab,fv,fd])=>{const a=H[k].slice().reverse().slice(0,12);if(!a.length)return'';return`<div class="sm13rl"><h4>${ic} ${esc(t(lab))} <small>(${H[k].length})</small></h4><ol>${a.map((r,i)=>`<li${i===0?' class="on"':''}><b>${esc(fv(r.v))}</b><span>${esc(fd(r.k))}</span><small>${r.p?esc(t('sm13.before',fv(r.p.v),fd(r.p.k))):esc(t('sm13.first'))}</small></li>`).join('')}</ol></div>`}).join('');
  openInfo('🏆 '+esc(t('sm13.logT')),`<p class="crsub">${esc(t('sm13.logSub'))}</p>${sec||`<p class="crsub">${esc(t('sm13.none'))}</p>`}`);const b=$('#infoBox');if(b)b.classList.add('sm13rbox')}
{hookFn('openInfo',()=>openInfo,f=>{openInfo=f},'pre',function(){const b=$('#infoBox');if(b)b.classList.remove('sm13rbox')})}
/* 112: Ramadan this year vs last in worship and Quran, not hours only */
function sm13Rm(keys){const o={jm:0,nfl:0,tar:0,adh:0,fast:0,sad:0,kh:0};const ks=new Set(keys);keys.forEach(k=>{if(k>todayKey())return;const d=S.days[k];if(!d)return;PRAYERS.forEach(p=>{if(jmHas(k,p))o.jm++});o.nfl+=nflRk(k);const r=d.ram||{};if(r.tar||(d.nfl&&+d.nfl.tar))o.tar++;if(adhLvl(d.adh)===3)o.adh++;if(d.fast||r.fast)o.fast++;if(r.sad)o.sad++});
  (S.quran.khatmas||[]).forEach(x=>{const e=typeof x.end==='number'?dKey(new Date(x.end)):x.end;if(ks.has(e))o.kh++});return o}
{hookFn('rmCompare',()=>rmCompare,f=>{rmCompare=f},'post',function(){try{const tb=$('#infoBox table.crt2 tbody');if(!tb)return;const h=hNum(keyToDate(todayKey())),y1=h.m>=9?h.y:h.y-1,A=sm13Rm(rmKeys(y1)),B=sm13Rm(rmKeys(y1-1));
  const dl=(a,b)=>a===b?'<i class="crd">=</i>':`<i class="crd ${a>b?'up':'dn'}">${a>b?'▲':'▼'} ${Math.abs(a-b)}</i>`;
  const R=[['sm13.rFast','fast'],['sm13.rTar','tar'],['sm13.rJm','jm'],['sm13.rNfl','nfl'],['sm13.rAdh','adh'],['sm13.rSad','sad'],['sm13.rKh','kh']];
  tb.insertAdjacentHTML('afterbegin',`<tr class="sm13rh"><th colspan="4">${esc(t('sm13.rH'))}</th></tr>`+R.map(([l,k])=>`<tr><th>${esc(t(l))}</th><td>${A[k]}</td><td>${B[k]}</td><td>${dl(A[k],B[k])}</td></tr>`).join('')+`<tr class="sm13rh"><th colspan="4">${esc(t('sm13.rH2'))}</th></tr>`)}catch(e){console.error(e)}})}
/* 119: hour goals show when they will be reached at your pace */
function sm13NgEta(){const c=$('#bNg');if(!c)return;const tk=todayKey();c.querySelectorAll('.ngr[data-ng]').forEach(r=>{const g=ngList().find(x=>x.id===r.dataset.ng);const s=r.querySelector('.ngs');if(!g||!s||s.querySelector('.sm13eta'))return;const tg=g.h*36e5;let txt='',late=false;
  if(tk<g.from)return;let ms=0,hit=null;for(let d=keyToDate(g.from),end=keyToDate(g.to);d<=end;d=addDays(d,1)){const k=dKey(d);if(k>tk)break;ms+=g.cat?catMs(k,g.cat):(S.days[k]?totals(k).tot:0);if(!hit&&ms>=tg)hit=k}
  if(hit)txt=t('sm13.ngHit',sm13Day(hit));else{const el=Math.max(1,Math.round((keyToDate(tk<g.to?tk:g.to)-keyToDate(g.from))/864e5)+1),pace=ms/el;if(pace<=0)txt=t('sm13.ngNo');else{const n=Math.ceil((tg-ms)/pace),eta=dKey(addDays(keyToDate(tk),n));late=eta>g.to;txt=t('sm13.ngEta',sm13Day(eta))+(late?' · '+t('sm13.ngLate'):'')}}
  s.insertAdjacentHTML('beforeend',` · <span class="sm13eta${late?' late':''}">${esc(txt)}</span>`)})}
{hookFn('ngCard',()=>ngCard,f=>{ngCard=f},'post',function(){try{sm13NgEta()}catch(e){}})}
