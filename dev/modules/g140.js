/* ============ 3.120 eleventh list D (Summary): a toast on a new record, the hour work starts, tasks done vs added, a category's sessions from the legend, compare any two ranges ============ */
/* 11th-37: today beats the best day or the longest session (once each per day; day.recT) */
const REC11={at:0};
function rec11Check(){const now=Date.now();if(now-REC11.at<12e4)return;REC11.at=now;const tk=todayKey(),d=day(tk),flag=d.recT=d.recT||{};let bestDay=0,bestS=0;
  Object.keys(S.days).forEach(k=>{if(k>=tk)return;try{bestDay=Math.max(bestDay,totals(k).tot)}catch(e){}(S.days[k].sessions||[]).forEach(s=>{bestS=Math.max(bestS,s.end-s.start)})});
  const tot=totals(tk).tot,ls=Math.max(0,...(d.sessions||[]).map(s=>s.end-s.start));
  if(!flag.day&&bestDay>=36e5&&tot>bestDay){flag.day=1;save();toast(t('rec11.day',fmtHM(tot)))}
  else if(!flag.s&&bestS>=18e5&&ls>bestS){flag.s=1;save();toast(t('rec11.s',fmtHM(ls)))}}
{hookFn('renderToday',()=>renderToday,f=>{renderToday=f},'post',function(){try{rec11Check()}catch(e){}})}

/* 11th-39: the hour work starts (first session of the day) in the shown period; 11th-40: tasks done vs added per week (8 weeks) */
function stHour(k){const ss=((S.days[k]||{}).sessions||[]).filter(s=>s.end-s.start>=3e5);if(!ss.length)return null;const d=new Date(Math.min(...ss.map(s=>s.start)));return d.getHours()*60+d.getMinutes()}
function sum11Cards(){const host=$('#bLate')||$('#bNfl')||$('#bPray');if(!host)return;const tk=todayKey(),A=periodKeys(bMode,bAnchor).filter(k=>k<=tk),hm=A.map(k=>[k,stHour(k)]).filter(x=>x[1]!=null);
  let c=$('#bStart');if(hm.length){if(!c){host.insertAdjacentHTML('afterend','<div class="card" id="bStart" style="margin-bottom:18px"></div>');c=$('#bStart')}const avg=Math.round(hm.reduce((a,x)=>a+x[1],0)/hm.length),mn=Math.min(...hm.map(x=>x[1])),mx=Math.max(...hm.map(x=>x[1]));
    const lo=Math.floor(mn/60)*60,hi=Math.max(lo+60,Math.ceil(mx/60)*60);
    c.innerHTML=`<h3>${esc(t('bst.t'))}</h3><div class="bst"><div><small>${esc(t('bst.avg'))}</small><b>${m2hm(avg)}</b></div><div><small>${esc(t('bst.min'))}</small><b>${m2hm(mn)}</b></div><div><small>${esc(t('bst.max'))}</small><b>${m2hm(mx)}</b></div></div><div class="bstl">${A.map(k=>{const v=stHour(k),d=keyToDate(k);return`<span title="${esc(gShort(d)+(v!=null?' '+m2hm(v):''))}"><i style="${v!=null?`bottom:${((v-lo)/(hi-lo)*100).toFixed(0)}%`:'display:none'}"></i><small>${d.getDate()}</small></span>`}).join('')}</div><p class="muted" style="font-size:11.5px;margin:4px 0 0">${esc(t('bst.axis',m2hm(lo),m2hm(hi)))}</p>`}else if(c)c.remove();
  let w=$('#bTk2');const wk=[];let a=periodKeys('week',bAnchor)[0];for(let i=0;i<8;i++){const ks=periodKeys('week',keyToDate(a)),s0=keyToDate(ks[0]).getTime(),s1=addDays(keyToDate(ks[6]),1).getTime();let add=0,dn=0;
    Object.values(S.days).forEach(dd=>(dd.tasks||[]).forEach(x=>{if(x.fromId)return;if(x.created>=s0&&x.created<s1)add++;if(x.done&&x.doneAt>=s0&&x.doneAt<s1)dn++}));wk.unshift({k:ks[0],add,dn});a=dKey(addDays(keyToDate(a),-7))}
  if(!wk.some(x=>x.add||x.dn)){if(w)w.remove();return}if(!w){($('#bStart')||host).insertAdjacentHTML('afterend','<div class="card" id="bTk2" style="margin-bottom:18px"></div>');w=$('#bTk2')}const mx2=Math.max(1,...wk.map(x=>Math.max(x.add,x.dn))),last=wk[wk.length-1];
  w.innerHTML=`<h3>${esc(t('btk.t'))}</h3><p class="muted" style="margin:0 0 6px">${esc(last.dn>=last.add?t('btk.ok',last.dn,last.add):t('btk.behind',last.dn,last.add))}</p><div class="btk">${wk.map(x=>`<span title="${esc(gShort(keyToDate(x.k))+': '+t('btk.tip',x.dn,x.add))}"><b style="height:${x.add/mx2*100}%"></b><i style="height:${x.dn/mx2*100}%"></i><small>${keyToDate(x.k).getDate()}/${keyToDate(x.k).getMonth()+1}</small></span>`).join('')}</div><div class="btkl"><span><b></b>${esc(t('btk.add'))}</span><span><i></i>${esc(t('btk.done'))}</span></div>`}

/* 11th-41: the chart legend opens a category's sessions in the shown period */
function catFind(name){return(S.settings.categories||[]).find(c=>{try{return catName(c)===name}catch(e){return false}})}
function catSessOpen(cid){const cats=S.settings.categories||[],c=cats.find(x=>x.id===cid);if(!c)return;const tk=todayKey(),A=periodKeys(bMode,bAnchor).filter(k=>k<=tk),inC=s=>{if(s.cat===cid)return true;const q=cats.find(x=>x.id===s.cat);return!!(q&&q.parent===cid)};
  const L_=[];A.forEach(k=>((S.days[k]||{}).sessions||[]).forEach(s=>{if(inC(s))L_.push({k,s})}));L_.sort((a,b)=>b.s.start-a.s.start);const tot=L_.reduce((a,x)=>a+x.s.end-x.s.start,0);
  const tm=ms=>new Date(ms).toLocaleTimeString(LANG==='ar'?'ar':'en',{hour:'2-digit',minute:'2-digit'});
  openInfo(catName(c),`<p class="muted">${esc(t('cses.sum',L_.length,fmtHM(tot)))}</p><div class="cses">${L_.slice(0,200).map(({k,s})=>{const sub=s.cat!==cid?cats.find(x=>x.id===s.cat):null;return`<div class="csesr"><span>${esc(gShort(keyToDate(k)))}</span><span>${tm(s.start)}–${tm(s.end)}</span><b>${esc(fmtHM(s.end-s.start))}</b>${sub||s.note?`<small dir="auto">${esc([sub?catName(sub):'',s.note||''].filter(Boolean).join(' · '))}</small>`:''}</div>`}).join('')||`<p class="muted">${esc(t('cses.none'))}</p>`}</div>`)}
function legPaint(){$$('#bLegend span').forEach(sp=>{if(sp.dataset.cid)return;const c=catFind(sp.textContent.trim());if(!c)return;sp.dataset.cid=c.id;sp.classList.add('legb');sp.title=t('cses.tip');sp.onclick=()=>catSessOpen(c.id)})}

/* 11th-42: compare any two ranges (from … to …) */
function rngKeys(a,b){const out=[];if(!a||!b)return out;if(b<a)[a,b]=[b,a];let d=keyToDate(a);for(let i=0;i<1100;i++){const k=dKey(d);if(k>b)break;out.push(k);d=addDays(d,1)}return out}
function crRange(a1,a2,b1,b2){const tk=todayKey();a2=a2||tk;a1=a1||dKey(addDays(keyToDate(a2),-29));b2=b2||dKey(addDays(keyToDate(a1),-1));b1=b1||dKey(addDays(keyToDate(b2),-(rngKeys(a1,a2).length-1)));
  const A=crSum(rngKeys(a1,a2)),B=crSum(rngKeys(b1,b2));
  openInfo('⇆ '+t('crr.t'),`<div class="crwk crr"><div><b>${esc(t('crx.wkA'))}</b><input type="date" class="in" id="crr1" value="${a1}"><input type="date" class="in" id="crr2" value="${a2}"><small>${esc(t('crr.days',rngKeys(a1,a2).length))}</small></div><div><b>${esc(t('crx.wkB'))}</b><input type="date" class="in" id="crr3" value="${b1}"><input type="date" class="in" id="crr4" value="${b2}"><small>${esc(t('crr.days',rngKeys(b1,b2).length))}</small></div></div><p class="muted" style="font-size:12px">${esc(t('crr.note'))}</p><table class="crt2"><thead><tr><th></th><th>${t('crx.wkA')}</th><th>${t('crx.wkB')}</th><th></th></tr></thead><tbody>${crRows(A,B)}</tbody></table>`);
  ['#crr1','#crr2','#crr3','#crr4'].forEach(s=>$(s).onchange=()=>crRange($('#crr1').value,$('#crr2').value,$('#crr3').value,$('#crr4').value))}

{hookFn('renderBrief',()=>renderBrief,f=>{renderBrief=f},'post',function(){try{sum11Cards();legPaint();crrBtnPaint()}catch(e){console.error(e)}})}
function crrBtnPaint(){const w=$('#crWkBtn');if(!w||$('#crrBtn'))return;w.insertAdjacentHTML('afterend',`<button class="btn sm ghost" id="crrBtn">⇆ ${esc(t('crr.t'))}</button>`);$('#crrBtn').onclick=()=>crRange()}
{hookFn('btPanel',()=>btPanel,f=>{btPanel=f},'post',function(){try{crrBtnPaint()}catch(e){}})}
{const _cc=cmdCommands;cmdCommands=function(...a){const L_=_cc(...a);try{L_.push({icon:'⇆',label:t('crr.t'),run:()=>crRange(),kw:'compare range period قارن فترتين'})}catch(e){}return L_}}
