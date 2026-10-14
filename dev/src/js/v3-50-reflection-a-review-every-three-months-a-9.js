/* ============ v3.50 reflection: a review every three months, a 90-day plan for one goal ============ */
["hmRev","qRev","p90","p90old","season"].forEach(k=>{if(!SY_SIMPLE.includes(k))SY_SIMPLE.push(k)});
/* 195: the quarter (Jan–Mar, Apr–Jun, …) against the one before, three questions to answer; a Today chip in the first week of a new quarter */
function qtrOf(d){d=d||keyToDate(todayKey());return{y:d.getFullYear(),q:Math.floor(d.getMonth()/3)+1}}
function qtrKeys(y,q){const out=[];let d=new Date(y,(q-1)*3,1);const e=new Date(y,q*3,1);while(d<e){out.push(dKey(d));d=addDays(d,1)}return out}
function qtrPrev(y,q){return q>1?{y,q:q-1}:{y:y-1,q:4}}
function qtrName(y,q){return t('qtr.name',q,y)}
function qtrOpen(y,q){if(y==null){const c=qtrOf(),td=keyToDate(todayKey());const p=td.getDate()<=7&&td.getMonth()%3===0?qtrPrev(c.y,c.q):c;y=p.y;q=p.q}
  const pv=qtrPrev(y,q),A=crSum(qtrKeys(y,q)),B=crSum(qtrKeys(pv.y,pv.q)),id=y+'-Q'+q,R=(S.qRev=S.qRev||{})[id]||{},ask=['good','change','focus'];
  openInfo('🧭 '+t('qtr.t',qtrName(y,q)),`<div class="qrnav"><button class="btn sm ghost" id="qrPrev">‹ ${esc(qtrName(pv.y,pv.q))}</button>${(y<qtrOf().y||(y===qtrOf().y&&q<qtrOf().q))?`<button class="btn sm ghost" id="qrNext">${esc(qtrName(q<4?y:y+1,q<4?q+1:1))} ›</button>`:''}</div>
   <div class="hmtiles"><div><b>${fmtHM(A.tot)}</b><small>${t('crx.work')}</small></div><div><b>${A.gold}</b><small>${t('crx.gold')}</small></div><div><b>${A.prN?Math.round(A.prOk/A.prN*100):0}%</b><small>${t('crx.prOn')}</small></div><div><b>${A.pg}</b><small>${t('crx.pages')}</small></div><div><b>${A.td}</b><small>${t('crx.tasks')}</small></div><div><b>${A.fast}</b><small>${t('hm.fast')}</small></div></div>
   <table class="crt2"><thead><tr><th></th><th>${esc(qtrName(y,q))}</th><th>${esc(qtrName(pv.y,pv.q))}</th><th></th></tr></thead><tbody>${crRows(A,B)}</tbody></table>
   ${ask.map(k=>`<label class="hmnote">${t('qtr.q.'+k)}<textarea class="in" data-qr="${k}" rows="2" dir="auto" placeholder="${esc(t('qtr.ph.'+k))}">${esc(R[k]||'')}</textarea></label>`).join('')}${S.p90&&S.p90.goal?'':`<button class="btn sm" id="qrP90" style="margin-top:10px">🗺 ${t('p90.start')}</button>`}`);
  S.qRev[id]=Object.assign({},R,{seen:Date.now()});save();$$('#infoBox [data-qr]').forEach(x=>x.oninput=()=>{S.qRev[id][x.dataset.qr]=x.value;save()});
  $('#qrPrev').onclick=()=>qtrOpen(pv.y,pv.q);const nx=$('#qrNext');if(nx)nx.onclick=()=>qtrOpen(q<4?y:y+1,q<4?q+1:1);const sp=$('#qrP90');if(sp)sp.onclick=()=>p90Open();try{renderTodayEv()}catch(e){}}
function qtrDue(){const td=keyToDate(todayKey());if(td.getDate()>7||td.getMonth()%3!==0)return null;const c=qtrOf(td),p=qtrPrev(c.y,c.q);if(S.qRev&&S.qRev[p.y+'-Q'+p.q]&&S.qRev[p.y+'-Q'+p.q].seen)return null;if(!qtrKeys(p.y,p.q).some(k=>S.days[k]))return null;return p}
/* 196: one goal for 90 days — why, a weekly target, three milestones (day 30, 60, 90) and a short weekly check-in */
function p90(){return S.p90||null}
function p90Day(P){return Math.max(1,Math.min(90,Math.floor((keyToDate(todayKey())-keyToDate(P.start))/864e5)+1))}
function p90Week(P){return Math.min(13,Math.ceil(p90Day(P)/7))}
function p90WeekMs(P,w){if(!P.cat)return 0;let ms=0;for(let i=0;i<7;i++){const k=dKey(addDays(keyToDate(P.start),(w-1)*7+i));if(k>todayKey())break;const r=rollBy(totals(k).by);ms+=r[P.cat]!=null?r[P.cat]:(totals(k).by[P.cat]||0)}return ms}
function p90Open(){const P=p90();if(!P||!P.goal){p90Edit();return}const d=p90Day(P),w=p90Week(P),ended=keyToDate(todayKey())>addDays(keyToDate(P.start),89),c=P.cat&&catRaw(P.cat);
  const wk=Array.from({length:13},(_,i)=>i+1).map(i=>{const ms=p90WeekMs(P,i),ok=P.hrs&&ms>=P.hrs*36e5,ci=(P.ci||{})[i];return`<i class="p90w${i===w?' cur':''}${i>w?' fut':''}${ok?' ok':''}${ci?' ci':''}" title="${esc(t('p90.wk',i))}${P.cat?' · '+esc(fmtHM(ms)):''}"></i>`}).join('');
  openInfo('🗺 '+t('p90.t'),`<div class="p90h"><b dir="auto">${esc(P.goal)}</b>${P.why?`<small dir="auto">${esc(P.why)}</small>`:''}</div><div class="p90bar"><i style="width:${d/90*100}%"></i></div><small class="muted">${ended?t('p90.ended'):t('p90.day',d,w)}</small>
   <div class="p90ws">${wk}</div>${P.cat?`<small class="muted">${t('p90.cat',c?kidName(c):'—',P.hrs||0,fmtHM(p90WeekMs(P,w)))}</small>`:''}
   <div class="p90ms">${[30,60,90].map((n,i)=>{const m=(P.ms||[])[i]||{};return`<label class="p90m${m.done?' on':''}"><input type="checkbox" data-pm="${i}" ${m.done?'checked':''}><span><b>${t('p90.by',n)} · ${esc(gShort(addDays(keyToDate(P.start),n-1)))}</b><small dir="auto">${esc(m.t||'—')}</small></span></label>`}).join('')}</div>
   <label class="hmnote">${t('p90.ci',w)}<textarea class="in" id="p90Ci" rows="2" dir="auto" placeholder="${esc(t('p90.ciPh'))}">${esc((P.ci||{})[w]||'')}</textarea></label>
   <div class="evact" style="margin-top:10px"><button class="btn sm ghost" id="p90Ed">✎ ${t('p90.edit')}</button>${ended?`<button class="btn sm ghost" id="p90New">＋ ${t('p90.new')}</button>`:''}<span style="flex:1"></span></div>`);
  $$('#infoBox [data-pm]').forEach(x=>x.onchange=()=>{const i=+x.dataset.pm;P.ms=P.ms||[];P.ms[i]=Object.assign({},P.ms[i]||{},{done:x.checked?Date.now():0});save();x.closest('.p90m').classList.toggle('on',x.checked);if(x.checked)vib(15)});
  $('#p90Ci').oninput=e=>{P.ci=P.ci||{};P.ci[w]=e.target.value;save()};$('#p90Ed').onclick=()=>p90Edit(P);const nw=$('#p90New');if(nw)nw.onclick=()=>{(S.p90old=S.p90old||[]).push(P);S.p90=null;save();p90Edit()}}
function p90Edit(P){P=P||{start:todayKey(),ms:[{},{},{}]};openInfo('🗺 '+t('p90.t'),`<p class="crsub">${t('p90.sub')}</p>
  <label class="hmnote">${t('p90.goal')}<input class="in" id="p9G" dir="auto" value="${esc(P.goal||'')}" placeholder="${esc(t('p90.goalPh'))}"></label><label class="hmnote">${t('p90.why')}<input class="in" id="p9W" dir="auto" value="${esc(P.why||'')}"></label>
  <label class="eidr"><span>${t('p90.from')}</span><input type="date" class="in" id="p9S" value="${P.start}"></label>
  <label class="eidr"><span>${t('p90.catL')}</span><select class="in" id="p9C"><option value="">—</option>${catOptions(P.cat||'')}</select></label><label class="eidr"><span>${t('p90.hrsL')}</span><input class="in num" type="number" min="0" max="80" step="0.5" id="p9H" value="${P.hrs||''}"></label>
  ${[30,60,90].map((n,i)=>`<label class="hmnote">${t('p90.by',n)}<input class="in" data-p9m="${i}" dir="auto" value="${esc(((P.ms||[])[i]||{}).t||'')}" placeholder="${esc(t('p90.msPh'))}"></label>`).join('')}`);
  const ok=$('#infoX');ok.textContent=t('pdl.save');ok.onclick=()=>{const g=$('#p9G').value.trim();if(!g){$('#p9G').focus();return}const ms=[0,1,2].map(i=>Object.assign({},(P.ms||[])[i]||{},{t:$(`[data-p9m="${i}"]`).value.trim()}));
    S.p90=Object.assign({},P,{goal:g,why:$('#p9W').value.trim(),start:$('#p9S').value||todayKey(),cat:$('#p9C').value||null,hrs:+$('#p9H').value||0,ms});save();$('#infoModal').classList.remove('on');try{renderTodayEv()}catch(e){}setTimeout(p90Open,80)}}
{hookFn('renderTodayEv',()=>renderTodayEv,f=>{renderTodayEv=f},'post',function(){try{const box=$('#todayEv');if(!box)return;let h='';const q=qtrDue();if(q)h+=`<span class="evchip" data-qrv style="--c:#0ea5a4"><i></i>🧭 ${esc(t('qtr.chip',qtrName(q.y,q.q)))}</span>`;
  const P=p90();if(P&&P.goal&&keyToDate(todayKey())<=addDays(keyToDate(P.start),92)&&todayKey()>=P.start)h+=`<span class="evchip" data-p90 style="--c:#c9a227"><i></i>🗺 <span dir="auto">${esc(P.goal.slice(0,28))}</span> · ${t('p90.chip',p90Day(P))}</span>`;
  if(!h)return;box.insertAdjacentHTML('beforeend',h);const a=box.querySelector('[data-qrv]');if(a)a.onclick=()=>qtrOpen(q.y,q.q);const b=box.querySelector('[data-p90]');if(b)b.onclick=p90Open}catch(e){console.error(e)}})}
BT_GROUPS.find(g=>g[0]==='review')[1].push('qrBtn');BT_GROUPS.find(g=>g[0]==='goals')[1].push('p90Btn');Object.assign(BT_INFO,{qrBtn:'qtr.i',p90Btn:'p90.i'});
{hookFn('renderBrief',()=>renderBrief,f=>{renderBrief=f},'pre',function(){try{const ctl=$('#v-brief .bctl');if(!ctl||$('#qrBtn'))return;ctl.insertAdjacentHTML('beforeend',`<button class="btn sm ghost" id="qrBtn">🧭 ${t('qtr.btn')}</button><button class="btn sm ghost" id="p90Btn">🗺 ${t('p90.t')}</button>`);$('#qrBtn').onclick=()=>qtrOpen();$('#p90Btn').onclick=p90Open}catch(e){console.error(e)}})}
{const _cc=cmdCommands;cmdCommands=function(...a){const L_=_cc(...a);L_.push({icon:'🧭',label:t('qtr.btn'),run:()=>qtrOpen(),kw:'quarter review مراجعة ربع'},{icon:'🗺',label:t('p90.t'),run:()=>p90Open(),kw:'90 plan goal خطة هدف'});return L_}}

