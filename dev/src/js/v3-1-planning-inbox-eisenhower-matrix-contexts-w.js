/* ============ v3.1 planning: inbox, Eisenhower matrix, contexts, weekly review, monthly & yearly goals ============ */
function INB(){return S.inbox||(S.inbox=[])}
function inboxAdd(text,quiet){text=String(text||'').trim();if(!text)return;INB().push({id:uid(),text,at:Date.now()});save();renderInbBtn();if(!quiet)toast(t('ib.added'))}
function renderInbBtn(){const b=$('#inbBtn');if(!b)return;const n=INB().length;b.textContent='📥'+(n?' '+n:'');b.classList.toggle('on',n>0);b.title=t('ib.t')}
function openInbox(){renderInbox();$('#ibModal').classList.add('on');setTimeout(()=>{const i=$('#ibIn');if(i&&!MOB.matches)i.focus()},60)}
function ibWhen(at){return keyOf(at)===todayKey()?fmtT(at):gShort(new Date(at))}
function renderInbox(){$('#ibBox').innerHTML=`<h2 style="font-size:20px">📥 ${t('ib.t')}</h2><small class="muted">${t('ib.sub')}</small>
  <div class="ibadd"><input class="in" id="ibIn" placeholder="${esc(t('ib.ph'))}" dir="auto"><button class="btn pri sm" id="ibGo">${t('add')}</button></div>
  <div class="iblist">${INB().map(x=>`<div class="ibit" data-id="${x.id}"><div class="ibt"><span dir="auto">${esc(x.text)}</span><small>${ibWhen(x.at)}</small></div><div class="iba"><button data-a="today">☑ ${t('tk.today')}</button><button data-a="tom">↷ ${t('tk.tomorrow')}</button><button data-a="note">📝 ${t('ib.toNote')}</button><button data-a="del" title="${esc(t('del'))}">✕</button></div></div>`).join('')||`<div class="empty">${t('ib.empty')}</div>`}</div>
  <div class="evact"><span style="flex:1"></span><button class="btn sm" id="ibX">${t('ok')}</button></div>`;
  const add=()=>{const v=$('#ibIn').value;if(!v.trim())return;inboxAdd(v,true);renderInbox();$('#ibIn').focus()};$('#ibGo').onclick=add;$('#ibIn').onkeydown=e=>{if(e.key==='Enter')add()};
  $$('#ibBox .ibit').forEach(r=>{const x=INB().find(q=>q.id===r.dataset.id);r.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{const a=b.dataset.a,tk=todayKey();
    if(a==='today'||a==='tom'){const k=a==='today'?tk:dKey(addDays(keyToDate(tk),1));day(k).tasks.push({id:uid(),text:x.text,done:false,created:Date.now()})}
    else if(a==='note')NOTES().push({id:uid(),title:x.text.split('\n')[0].slice(0,80),body:x.text.includes('\n')?x.text:'',day:tk,imgs:[],created:Date.now(),updated:Date.now()});
    const i=INB().indexOf(x);INB().splice(i,1);save();renderInbox();renderInbBtn();renderTasks();if(a==='del')toastAct(t('ib.deleted'),t('undo'),()=>{INB().splice(i,0,x);save();renderInbox();renderInbBtn()},6000);else toast(t('ib.moved'))})})
  $('#ibX').onclick=()=>$('#ibModal').classList.remove('on')}
$('#ibModal').onclick=e=>{if(e.target.id==='ibModal')$('#ibModal').classList.remove('on')};
$('#inbBtn').onclick=openInbox;
{const _cs=cmdSearch;cmdSearch=function(q){const r=_cs(q);const v=q.trim();if(v){let i=0;while(i<r.length&&r[i].g==='cmd')i++;r.splice(i,0,{g:'cmd',sc:0,icon:'📥',label:t('ib.cmd',v),run:()=>inboxAdd(v)})}return r}}
{const _cc=cmdCommands;cmdCommands=function(){const c=(icon,label,run,kw)=>({icon,label,run,kw:kw||''});return _cc().concat([c('📥',t('ib.t'),openInbox,'inbox صندوق'),c('⊞',t('mx.t'),()=>{showView('today');S.settings.tmx=true;save();renderTasks()},'matrix eisenhower مصفوفة'),c('🎯',t('gl.t'),()=>openGoals(),'goals أهداف'),c('📝',t('wr.t'),()=>openWeekReview(),'weekly review مراجعة'),c('📁',t('pj.title'),()=>openProjects(),'projects مشاريع')])}}
{const _to=thabatOpen;thabatOpen=function(w){if(w==='inbox'){showView('today');openInbox();return}if(w==='review'){openWeekReview();return}return _to(w)}}
/* Eisenhower matrix + @contexts */
const MXQ=[['q1',true,true],['q2',true,false],['q3',false,true],['q4',false,false]];
function mxOf(x){if(x.imp==null&&x.urg==null)return null;return MXQ.find(q=>q[1]===!!x.imp&&q[2]===!!x.urg)[0]}
function mxSet(x,q){if(!q){delete x.imp;delete x.urg}else{const Q=MXQ.find(z=>z[0]===q);x.imp=Q[1];x.urg=Q[2]}save()}
function ctxOf(text){return[...String(text).matchAll(/(?:^|\s)@([\p{L}\p{N}_-]+)/gu)].map(m=>'@'+m[1])}
let CTX=null;
function mxMenu(anchor,x){const r=anchor.getBoundingClientRect(),cur=mxOf(x);const p=qPopAt(`<div class="aymh">⊞ ${t('mx.t')}</div>${MXQ.map(([q])=>`<button data-q="${q}" class="${cur===q?'on':''}"><i class="mxd ${q}"></i>${t('mx.'+q)} <small style="color:var(--muted)">${t('mx.'+q+'s')}</small></button>`).join('')}${cur?`<button data-q="">✕ ${t('mx.none')}</button>`:''}`,r.left+r.width/2,r.bottom-10,'aymenu');
  p.querySelectorAll('[data-q]').forEach(b=>b.onclick=()=>{closePP();mxSet(x,b.dataset.q||null);renderTasks()})}
{const _tm2=taskMeta;taskMeta=function(x){const h=_tm2(x),q=mxOf(x);return q&&!S.settings.tmx?h.replace(/^/,`<small class="tmeta"><span class="mxtag ${q}" data-mx>${t('mx.'+q)}</span></small>`):h}}
function renderMatrix(){const k=todayKey(),d=day(k),el=$('#tasks');const L_=d.tasks.filter(x=>!x.done&&(!CTX||ctxOf(x.text).includes(CTX)));const un=L_.filter(x=>!mxOf(x)),dn=d.tasks.filter(x=>x.done).length;
  const item=x=>`<li class="mxit" draggable="true" data-id="${x.id}"><button class="ck">${ICON_CHECK}</button><span dir="auto">${esc(x.text)}</span></li>`;
  el.innerHTML=`<div class="mx">${MXQ.map(([q])=>`<div class="mxq ${q}" data-q="${q}"><div class="mxh"><b>${t('mx.'+q)}</b><small>${t('mx.'+q+'s')}</small></div><ul>${L_.filter(x=>mxOf(x)===q).map(item).join('')}</ul></div>`).join('')}</div>${un.length?`<div class="mxq mxun" data-q=""><div class="mxh"><b>${t('mx.un')}</b><small>${t('mx.unS')}</small></div><ul>${un.map(item).join('')}</ul></div>`:''}${dn?`<small class="muted mxdn">✓ ${t('mx.done',dn)}</small>`:''}`;
  $$('#tasks .mxit').forEach(li=>{const x=d.tasks.find(q=>q.id===li.dataset.id);li.querySelector('.ck').onclick=()=>{x.done=true;x.doneAt=Date.now();save();chimeSoft();renderTasks()};li.querySelector('span').onclick=e=>mxMenu(e.currentTarget,x);
    li.ondragstart=e=>{e.dataTransfer.setData('text/plain',x.id);li.classList.add('drag')};li.ondragend=()=>li.classList.remove('drag')});
  $$('#tasks .mxq').forEach(z=>{z.ondragover=e=>{e.preventDefault();z.classList.add('over')};z.ondragleave=()=>z.classList.remove('over');z.ondrop=e=>{e.preventDefault();z.classList.remove('over');const x=d.tasks.find(q=>q.id===e.dataTransfer.getData('text/plain'));if(x){mxSet(x,z.dataset.q||null);renderTasks()}}})}
function renderCtxBar(){const d=day(todayKey()),all=[...new Set(d.tasks.filter(x=>!x.done).flatMap(x=>ctxOf(x.text)))];if(CTX&&!all.includes(CTX))CTX=null;let bar=$('#ctxBar');
  if(!bar){bar=document.createElement('div');bar.id='ctxBar';bar.className='ctxbar';$('#tasks').before(bar)}
  const mx=!!S.settings.tmx;bar.innerHTML=`<button class="chip sm mxbtn ${mx?'on':''}" id="mxBtn" title="${esc(t('mx.t'))}">⊞ ${t('mx.short')}</button>${all.length?`<span class="ctxsep"></span><button class="chip sm ${!CTX?'on':''}" data-c="">${t('ctx.all')}</button>${all.map(c=>`<button class="chip sm ${CTX===c?'on':''}" data-c="${esc(c)}">${esc(c)}</button>`).join('')}`:''}`;
  bar.hidden=!d.tasks.length;$('#mxBtn').onclick=()=>{S.settings.tmx=!S.settings.tmx;save();renderTasks()};bar.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{CTX=b.dataset.c||null;renderTasks()})}
{const _rtk3=renderTasks;renderTasks=function(){_rtk3();renderInbBtn();renderCtxBar();renderWeekFocus();if(S.settings.tmx&&day(todayKey()).tasks.length){renderMatrix();return}
  const d=day(todayKey());$$('#tasks .task').forEach(li=>{const x=d.tasks.find(q=>q.id===li.dataset.id);if(!x)return;if(CTX&&!ctxOf(x.text).includes(CTX))li.style.display='none';const m=li.querySelector('[data-mx]');if(m)m.onclick=e=>mxMenu(e.currentTarget,x);
    if(!x.done&&!li.querySelector('.tmx')){const del=li.querySelector('.del');if(del)del.insertAdjacentHTML('beforebegin',`<button class="tmx" title="${esc(t('mx.t'))}">⊞</button>`);const b=li.querySelector('.tmx');if(b)b.onclick=e=>mxMenu(e.currentTarget,x)}})}}
/* weekly review */
function wrCfg(){return Object.assign({on:true,wd:4,at:'21:00'},S.settings.wreview||{})}
function REV(){return S.reviews||(S.reviews={})}
function wkStart(date){return periodKeys('week',date||keyToDate(todayKey()))[0]}
let WR=null;
function openWeekReview(wk){wk=wk||wkStart();const keys=periodKeys('week',keyToDate(wk)),old=REV()[wk]||{};WR={wk,keys,step:0,good:old.good||'',improve:old.improve||'',focus:(old.focus||['','','']).concat(['','','']).slice(0,3)};renderWR();$('#wrModal').classList.add('on')}
function wrUnfinished(){const tk=todayKey();return WR.keys.filter(k=>k<=tk).flatMap(k=>((S.days[k]&&S.days[k].tasks)||[]).filter(x=>!x.done&&!x.dismissed&&!(x.pp&&x.pp.length)).map(x=>({k,x})))}
function renderWR(){const W=WR,st=periodStats(W.keys.filter(k=>k<=todayKey())),N=5;const steps=[
  ()=>{const wg=weekGoal(),pr=W.keys.filter(k=>k<=todayKey()&&k>=plSince());let on=0,all=0;pr.forEach(k=>PRAYERS.forEach(p=>{if(k===todayKey()&&Date.now()<prayerTimes(keyToDate(k))[p])return;all++;if(['on','auto'].includes(plStatus(k,p)))on++}));
    const best=W.keys.map(k=>[k,totals(k).tot]).sort((a,b)=>b[1]-a[1])[0];
    return`<h3>${t('wr.s1')}</h3><div class="wrstats"><div><b>${fmtHM(st.tot)}</b><small>${t('wr.hours')}${wg?' · '+t('wr.ofGoal',Math.round(st.tot/(wg*36e5)*100)):''}</small></div><div><b>${st.tasksDone}/${st.tasksAll}</b><small>${t('wr.tasks')}</small></div><div><b>${all?on+'/'+all:'—'}</b><small>${t('wr.prayers')}</small></div><div><b>${best&&best[1]?L().days[keyToDate(best[0]).getDay()]:'—'}</b><small>${t('wr.best')}</small></div></div>`},
  ()=>`<h3>${t('wr.s2')}</h3><label class="wrl">${t('wr.good')}<textarea class="in" id="wrGood" dir="auto" rows="3">${esc(W.good)}</textarea></label><label class="wrl">${t('wr.improve')}<textarea class="in" id="wrImp" dir="auto" rows="3">${esc(W.improve)}</textarea></label>`,
  ()=>{const U=wrUnfinished();return`<h3>${t('wr.s3')}</h3>${U.length?`<small class="muted">${t('wr.s3s')}</small><div class="wrun">${U.map(({k,x})=>`<div class="wru" data-k="${k}" data-id="${x.id}"><span dir="auto">${esc(x.text)}</span><small>${esc(dayLabel(k))}</small><button class="btn sm" data-a="next">↷ ${t('wr.next')}</button><button class="btn sm ghost" data-a="drop">✕ ${t('wr.drop')}</button></div>`).join('')}</div>`:`<div class="empty">${t('wr.noUn')} 👏</div>`}`},
  ()=>`<h3>${t('wr.s4')}</h3>${INB().length?`<p>${t('wr.inb',INB().length)}</p><button class="btn" id="wrInb">📥 ${t('ib.t')}</button>`:`<div class="empty">${t('wr.inb0')} ✓</div>`}${goalsFor('month',todayKey().slice(0,7)).length?`<div class="wrgl">${goalsHtml('month',todayKey().slice(0,7),true)}</div>`:''}`,
  ()=>`<h3>${t('wr.s5')}</h3><small class="muted">${t('wr.s5s')}</small>${W.focus.map((f,i)=>`<input class="in wrf" data-i="${i}" dir="auto" value="${esc(f)}" placeholder="${i+1}. ${esc(t('wr.focusPh'))}">`).join('')}`];
  const grab=()=>{const g=$('#wrGood');if(g){W.good=g.value;W.improve=$('#wrImp').value}$$('#wrBox .wrf').forEach(i=>W.focus[+i.dataset.i]=i.value)};
  $('#wrBox').innerHTML=`<div class="wrtop"><h2>📝 ${t('wr.t')}</h2><small>${gShort(keyToDate(W.keys[0]))} – ${gShort(keyToDate(W.keys[6]))}</small></div><div class="wrdots">${Array.from({length:N},(_,i)=>`<i class="${i===W.step?'on':i<W.step?'dn':''}"></i>`).join('')}</div><div class="wrbody">${steps[W.step]()}</div>
   <div class="evact">${W.step?`<button class="btn sm ghost" id="wrPrev">‹ ${t('prev')}</button>`:''}<span style="flex:1"></span><button class="btn sm ghost" id="wrLater">${t('wr.later')}</button><button class="btn sm pri" id="wrNext">${W.step<N-1?t('next')+' ›':'✓ '+t('wr.finish')}</button></div>`;
  if($('#wrPrev'))$('#wrPrev').onclick=()=>{grab();W.step--;renderWR()};$('#wrLater').onclick=()=>{grab();$('#wrModal').classList.remove('on')};
  $('#wrNext').onclick=()=>{grab();if(W.step<N-1){W.step++;renderWR();return}REV()[W.wk]={good:W.good.trim(),improve:W.improve.trim(),focus:W.focus.map(s=>s.trim()).filter(Boolean),at:Date.now()};save();$('#wrModal').classList.remove('on');renderTasks();renderTodayEv();toast(t('wr.saved'));chimeSoft(1046)};
  $$('#wrBox .wru').forEach(r=>{const k=r.dataset.k,x=S.days[k].tasks.find(q=>q.id===r.dataset.id);r.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{if(b.dataset.a==='drop')x.dismissed=true;else{const nk=dKey(addDays(keyToDate(W.keys[6]),1)),target=nk>todayKey()?nk:todayKey(),nx={id:uid(),text:x.text,done:false,created:Date.now(),from:k,fromId:x.id};day(target).tasks.push(nx);x.pp=(x.pp||[]).concat({k:target,id:nx.id})}save();renderWR()})});
  const ib=$('#wrInb');if(ib)ib.onclick=()=>{grab();openInbox()};bindGoals($('#wrBox'))}
$('#wrModal').onclick=e=>{if(e.target.id==='wrModal')$('#wrModal').classList.remove('on')};
function wrDue(){const C=wrCfg();if(!C.on)return false;const now=new Date(),k=todayKey();return keyToDate(k).getDay()===C.wd&&Date.now()>=atTime(keyToDate(k),C.at)&&!REV()[wkStart()]}
function wrCheck(){if(!wrDue())return;const wk=wkStart();S.wrAsked=S.wrAsked||{};if(S.wrAsked[wk])return;S.wrAsked[wk]=1;save();alertUser(t('wr.t'),t('wr.remind'));renderTodayEv()}
setInterval(wrCheck,6e4);setTimeout(wrCheck,7000);
function renderWeekFocus(){const el=$('#wkFocus'),R=Object.values(REV()).filter(r=>r.at>Date.now()-10*864e5).sort((a,b)=>b.at-a.at)[0],F=R&&R.focus&&R.focus.length?R.focus:null;if(!el)return;el.hidden=!F;if(F)el.innerHTML=`<b>🎯 ${t('wr.focusT')}</b>${F.map(f=>`<span dir="auto">${esc(f)}</span>`).join('')}`}
{const _rte3=renderTodayEv;renderTodayEv=function(){_rte3();const box=$('#todayEv');if(!box||!wrDue())return;box.insertAdjacentHTML('afterbegin',`<span class="evchip" data-wr style="--c:#22c55e"><i></i>📝 ${t('wr.t')}</span>`);box.querySelector('[data-wr]').onclick=()=>openWeekReview()}}
/* goals: monthly & yearly */
function GOALS(){return S.goals||(S.goals=[])}
function goalsFor(scope,per){return GOALS().filter(g=>g.scope===scope&&g.per===per)}
function perKeys(scope,per){return Object.keys(S.days).filter(k=>k.startsWith(per))}
function gProg(g){if(g.type==='check')return[g.done?1:0,1];if(g.type==='count')return[g.prog||0,g.target||1];let ms=0;perKeys(g.scope,g.per).forEach(k=>{const tt=totals(k);Object.entries(tt.by).forEach(([c,v])=>{if(!g.cat||topOf(c)===g.cat||c===g.cat)ms+=v})});return[ms/36e5,g.target||1]}
function goalsHtml(scope,per,compact){const L_=goalsFor(scope,per);return L_.map(g=>{const [v,tg]=gProg(g),pc=Math.min(100,v/tg*100),done=v>=tg;
  return`<div class="glit ${done?'done':''}" data-id="${g.id}">${g.type==='check'?`<input type="checkbox" data-gck ${g.done?'checked':''}>`:`<span class="glpc">${Math.round(pc)}%</span>`}<div class="glb"><span dir="auto">${esc(g.text)}</span>${g.type!=='check'?`<div class="glbar"><i style="width:${pc}%"></i></div><small>${g.type==='hours'?`${v.toFixed(1)} / ${tg} ${t('u.h')}${g.cat&&catRaw(g.cat)?' · '+esc(catName(catOf(g.cat))):''}`:`${v} / ${tg}`}</small>`:''}</div>${g.type==='count'?`<button class="btn sm ghost" data-gm>−</button><button class="btn sm" data-gp>＋</button>`:''}${compact?'':`<button class="link" data-gdel>✕</button>`}</div>`}).join('')}
function bindGoals(root){root.querySelectorAll('.glit').forEach(r=>{const g=GOALS().find(x=>x.id===r.dataset.id);if(!g)return;const re=()=>{save();if($('#glModal').classList.contains('on'))renderGoals();if(WR&&$('#wrModal').classList.contains('on'))renderWR();if(curView()==='brief')renderBrief()};
  const ck=r.querySelector('[data-gck]');if(ck)ck.onchange=()=>{g.done=ck.checked;if(g.done)chimeSoft(1046);re()};const p=r.querySelector('[data-gp]');if(p)p.onclick=()=>{g.prog=(g.prog||0)+1;if(g.prog===g.target)chimeSoft(1046);re()};const m=r.querySelector('[data-gm]');if(m)m.onclick=()=>{g.prog=Math.max(0,(g.prog||0)-1);re()};
  const d=r.querySelector('[data-gdel]');if(d)d.onclick=()=>{const i=GOALS().indexOf(g);GOALS().splice(i,1);re();toastAct(t('gl.deleted'),t('undo'),()=>{GOALS().splice(i,0,g);re()},6000)}})}
let GL={scope:'month',per:null};
function glPer(scope,off){const tk=todayKey();if(scope==='year')return String(+tk.slice(0,4)+(off||0));const d=new Date(+tk.slice(0,4),+tk.slice(5,7)-1+(off||0),1);return d.getFullYear()+'-'+pad(d.getMonth()+1)}
function glLabel(scope,per){return scope==='year'?per:L().months[+per.slice(5,7)-1]+' '+per.slice(0,4)}
function openGoals(scope){GL.scope=scope||GL.scope;GL.per=glPer(GL.scope);renderGoals();$('#glModal').classList.add('on')}
function renderGoals(){const sc=GL.scope,per=GL.per;$('#glBox').innerHTML=`<h2 style="font-size:20px">🎯 ${t('gl.t')}</h2><div class="glhead"><div class="seg" id="glSeg"><button data-s="month" class="${sc==='month'?'on':''}">${t('gl.month')}</button><button data-s="year" class="${sc==='year'?'on':''}">${t('gl.year')}</button></div><div class="row"><button class="btn sm" id="glP">‹</button><b>${glLabel(sc,per)}</b><button class="btn sm" id="glN">›</button></div></div>
  <div class="gllist">${goalsHtml(sc,per)||`<div class="empty">${t('gl.empty')}</div>`}</div>
  <div class="gladd"><input class="in" id="glIn" dir="auto" placeholder="${esc(t('gl.ph'))}"><select class="in" id="glType"><option value="check">${t('gl.tCheck')}</option><option value="count">${t('gl.tCount')}</option><option value="hours">${t('gl.tHours')}</option></select><input class="in num" type="number" min="1" id="glTg" placeholder="${esc(t('gl.target'))}" hidden><select class="in" id="glCat" hidden><option value="">${t('gl.allCats')}</option>${topCats().map(c=>`<option value="${c.id}">${esc(kidName(c))}</option>`).join('')}</select><button class="btn pri sm" id="glGo">${t('add')}</button></div>
  <div class="evact"><span style="flex:1"></span><button class="btn sm" id="glX">${t('ok')}</button></div>`;
  $$('#glSeg button').forEach(b=>b.onclick=()=>{GL.scope=b.dataset.s;GL.per=glPer(GL.scope);renderGoals()});
  const shift=n=>{if(sc==='year')GL.per=String(+per+n);else{const d=new Date(+per.slice(0,4),+per.slice(5,7)-1+n,1);GL.per=d.getFullYear()+'-'+pad(d.getMonth()+1)}renderGoals()};$('#glP').onclick=()=>shift(-1);$('#glN').onclick=()=>shift(1);
  const ty=$('#glType');ty.onchange=()=>{$('#glTg').hidden=ty.value==='check';$('#glCat').hidden=ty.value!=='hours';$('#glTg').placeholder=t(ty.value==='hours'?'gl.targetH':'gl.target')};
  const add=()=>{const v=$('#glIn').value.trim();if(!v)return;const g={id:uid(),text:v,scope:sc,per,type:ty.value,created:Date.now()};if(g.type!=='check'){g.target=Math.max(1,+$('#glTg').value||0);if(!+$('#glTg').value){$('#glTg').focus();return}}if(g.type==='hours'&&$('#glCat').value)g.cat=$('#glCat').value;GOALS().push(g);save();renderGoals()};
  $('#glGo').onclick=add;$('#glIn').onkeydown=e=>{if(e.key==='Enter')add()};$('#glX').onclick=()=>$('#glModal').classList.remove('on');bindGoals($('#glBox'))}
$('#glModal').onclick=e=>{if(e.target.id==='glModal')$('#glModal').classList.remove('on')};
$('#glBtn').onclick=()=>openGoals(bMode==='month'?'month':'month');
/* brief: goals + weekly review card */
{const _rb5=renderBrief;renderBrief=function(){_rb5();try{const old=$('#bPlan');if(old)old.remove();const keys=periodKeys(bMode,bAnchor),mk=keys[Math.floor(keys.length/2)].slice(0,7),yk=mk.slice(0,4);let h='';
  const gm=goalsFor('month',mk),gy=goalsFor('year',yk);if(gm.length||gy.length)h+=`<div class="card bgl"><h3><span>🎯 ${t('gl.t')}</span><button class="btn sm ghost" data-glopen>${t('gl.manage')}</button></h3>${gm.length?`<h4>${glLabel('month',mk)}</h4>${goalsHtml('month',mk,true)}`:''}${gy.length?`<h4>${yk}</h4>${goalsHtml('year',yk,true)}`:''}</div>`;
  if(bMode==='week'){const R=REV()[keys[0]];if(R)h+=`<div class="card bwr"><h3><span>📝 ${t('wr.t')}</span><button class="btn sm ghost" data-wropen>${t('wr.edit')}</button></h3>${R.good?`<p><b>${t('wr.good')}</b> <span dir="auto">${esc(R.good)}</span></p>`:''}${R.improve?`<p><b>${t('wr.improve')}</b> <span dir="auto">${esc(R.improve)}</span></p>`:''}${R.focus&&R.focus.length?`<p><b>${t('wr.focusT')}</b> ${R.focus.map(esc).join(' · ')}</p>`:''}</div>`;
    else if(keys[0]<=todayKey())h+=`<div class="card bwr"><h3><span>📝 ${t('wr.t')}</span><button class="btn sm" data-wropen>${t('wr.start')}</button></h3></div>`}
  if(!h)return;$('#bTiles').insertAdjacentHTML('afterend',`<div class="bplan" id="bPlan">${h}</div>`);const P=$('#bPlan');bindGoals(P);const go=P.querySelector('[data-glopen]');if(go)go.onclick=()=>{GL.per=null;openGoals('month')};const wo=P.querySelector('[data-wropen]');if(wo)wo.onclick=()=>openWeekReview(keys[0])}catch(e){console.error(e)}}}
function renderV34Set(){const C=wrCfg(),st=S.settings;toggle($('#wrT'),C.on,v=>{st.wreview=Object.assign(wrCfg(),{on:v})});const sel=$('#wrWd');sel.innerHTML=L().days.map((d,i)=>`<option value="${i}" ${i===C.wd?'selected':''}>${d}</option>`).join('');sel.onchange=()=>{st.wreview=Object.assign(wrCfg(),{wd:+sel.value});save()};$('#wrAt').value=C.at;$('#wrAt').onchange=e=>{st.wreview=Object.assign(wrCfg(),{at:e.target.value||'21:00'});save()}}
{const _rs8=renderSettings;renderSettings=function(){_rs8();try{renderV34Set()}catch(e){console.error(e)}}}
renderInbBtn();

