/* ============ 3.125 eleventh list H: pause a habit, tasks tied to a goal, split a session, «Open with Thabat» for PDFs, thabat:// links, the «continue» widget, the screen kept on in the mushaf ============ */
/* 11th-81: h.pause={to:date}: paused days neither break nor add to the streak; long press / right click on a habit chip */
function hbPaused(h,k){return!!(h&&h.pause&&h.pause.to&&k<=h.pause.to&&k>=(h.pause.from||'0'))}
{const _s=hbStreak;hbStreak=function(h,...a){try{if(!h||!h.pause)return _s(h,...a);let n=0,d=keyToDate(todayKey());if(!hbDone(h,dKey(d)))d=addDays(d,-1);for(let i=0;i<2000;i++){const k=dKey(d);if(hbPaused(h,k)){d=addDays(d,-1);continue}if(!hbDone(h,k))break;n++;d=addDays(d,-1)}return n}catch(e){return _s(h,...a)}}}
document.addEventListener('contextmenu',e=>{const c=e.target.closest&&e.target.closest('.hbchip[data-hb]');if(!c)return;const h=HB().find(x=>x.id===c.dataset.hb);if(!h)return;e.preventDefault();e.stopPropagation();const tk=todayKey(),on=hbPaused(h,tk);
  const r=c.getBoundingClientRect(),p=qPopAt(on?`<button data-hp="x">▶ ${esc(t('hbp.resume'))}</button>`:[1,3,7,14,30].map(n=>`<button data-hp="${n}">⏸ ${esc(t('hbp.days',n))}</button>`).join(''),r.left+r.width/2,r.bottom-6,'aymenu');
  p.querySelectorAll('[data-hp]').forEach(b=>b.onclick=()=>{closePP();if(b.dataset.hp==='x')delete h.pause;else h.pause={from:tk,to:dKey(addDays(keyToDate(tk),+b.dataset.hp-1))};save();try{renderToday()}catch(x){}toast(h.pause?t('hbp.on',dayLabel(h.pause.to)):t('hbp.off'))})},true);
{hookFn('renderToday',()=>renderToday,f=>{renderToday=f},'post',function(){try{const tk=todayKey();$$('.hbchip[data-hb]').forEach(c=>{const h=HB().find(x=>x.id===c.dataset.hb);c.classList.toggle('hbpz',hbPaused(h,tk));if(hbPaused(h,tk))c.title=t('hbp.on',dayLabel(h.pause.to))})}catch(e){}})}

/* 11th-82: a task tied to a goal: x.goal = 'p90' | 'lf:<life goal id>' */
function gtGoals(){const L_=[];const P=p90();if(P&&P.goal)L_.push({id:'p90',n:t('gt.p90')+': '+P.goal});LIFE().forEach(g=>{if(g.t)L_.push({id:'lf:'+g.id,n:g.t})});return L_}
function gtTasks(gid){const out=[];Object.values(S.days).forEach(d=>(d.tasks||[]).forEach(x=>{if(x.goal===gid&&!(x.pp||[]).length)out.push(x)}));return out}
function gtLine(gid){const L_=gtTasks(gid);if(!L_.length)return'';const dn=L_.filter(x=>x.done).length;return`<div class="gtl"><b>${esc(t('gt.line',dn,L_.length))}</b><i><em style="width:${Math.round(dn/L_.length*100)}%"></em></i></div>`}
{const _ux=uxMenuExtras;uxMenuExtras=function(k,id,...a){const r=_ux(k,id,...a);try{const p=$('#ppPop'),x=day(k).tasks.find(q=>q.id===id);if(!p||!x||p.querySelector('[data-gt]'))return r;const G=gtGoals();if(!G.length&&!x.goal)return r;
  const b=document.createElement('button');b.dataset.gt=1;b.innerHTML=`🎯 ${esc(x.goal?t('gt.change'):t('gt.tie'))}`;b.onclick=e=>{e.stopPropagation();closePP();const pp=qPopAt(G.map(g=>`<button data-g="${esc(g.id)}" class="${x.goal===g.id?'on':''}" dir="auto">${esc(g.n)}</button>`).join('')+(x.goal?`<button data-g="">✕ ${esc(t('gt.untie'))}</button>`:''),innerWidth/2,innerHeight/3,'aymenu');
    pp.querySelectorAll('[data-g]').forEach(q=>q.onclick=()=>{closePP();if(q.dataset.g)x.goal=q.dataset.g;else delete x.goal;save();renderTasks();toast(x.goal?t('gt.tied'):t('gt.untied'))})};p.append(b)}catch(e){}return r}}
{hookFn('renderTasks',()=>renderTasks,f=>{renderTasks=f},'post',function(){try{const d=day(todayKey());$$('#tasks .task[data-id]').forEach(li=>{const x=d.tasks.find(q=>q.id===li.dataset.id);li.querySelector('.tkgoal')?.remove();if(!x||!x.goal)return;const g=gtGoals().find(z=>z.id===x.goal);li.querySelector('.tx')?.insertAdjacentHTML('afterend',`<span class="tkgoal" title="${esc(g?g.n:'')}">🎯</span>`)})}catch(e){}})}
{hookFn('p90Open',()=>p90Open,f=>{p90Open=f},'post',function(){try{const b=$('#infoBox');if(b&&!b.querySelector('.gtl'))b.querySelector('h3,h4,p')?.insertAdjacentHTML('beforebegin',gtLine('p90'))}catch(e){}})}
{hookFn('lfgOpen',()=>lfgOpen,f=>{lfgOpen=f},'post',function(){try{const b=$('#infoBox');if(!b||b.querySelector('.gtls'))return;const rows=LIFE().map(g=>{const h=gtLine('lf:'+g.id);return h?`<div class="gtlr"><span dir="auto">${esc(g.t)}</span>${h}</div>`:''}).join('');if(rows)b.insertAdjacentHTML('beforeend',`<div class="gtls"><h4>${esc(t('gt.h'))}</h4>${rows}</div>`)}catch(e){}})}

/* 11th-84: split a session in two: the first part keeps its category, the rest goes to another one */
{const _r=dsRowHTML;dsRowHTML=function(s,...a){return _r(s,...a).replace('<button class="btn sm ghost ds-b" data-dse=',`<button class="btn sm ghost ds-b" data-dsp="${s.id}" title="${esc(t('dsp.t'))}">⇆</button><button class="btn sm ghost ds-b" data-dse=`)}}
{hookFn('dsOpen',()=>dsOpen,f=>{dsOpen=f},'post',function(k,cat){try{$$('#infoBox [data-dsp]').forEach(b=>b.onclick=()=>dspOpen(k,cat,b.dataset.dsp))}catch(e){}})}
function dspOpen(k,cat,sid){const d=S.days[k],s=d&&d.sessions.find(x=>x.id===sid);if(!s)return;const dur=s.end-s.start;
  openInfo(t('dsp.t'),`<div class="dspw"><p class="muted">${esc(fmtT(s.start)+' – '+fmtT(s.end)+' · '+fmtHM(dur))}</p><label>${esc(t('dsp.to'))}<select class="in" id="dspC">${catOptions(topCats().find(c=>c.id!==s.cat)?.id)}</select></label><label>${esc(t('dsp.share'))} <b id="dspV">50%</b><input type="range" id="dspR" min="5" max="95" step="5" value="50"></label><button class="btn pri" id="dspGo">${esc(t('dsp.go'))}</button></div>`);
  $('#dspR').oninput=e=>{$('#dspV').textContent=e.target.value+'%'};
  $('#dspGo').onclick=()=>{const c2=$('#dspC').value,sh=+$('#dspR').value/100;if(!c2)return;const cut=Math.round(s.start+dur*(1-sh)),old=s.end;s.end=cut;const n={id:uid(),cat:c2,start:cut,end:old};if(s.src)n.src=s.src;d.sessions.push(n);save();try{renderGlass();renderLog();renderToday()}catch(e){}
    $$('.modal.on').forEach(m=>m.classList.remove('on'));toastAct(t('dsp.done'),t('undo'),()=>{s.end=old;d.sessions=d.sessions.filter(x=>x.id!==n.id);save();try{renderGlass();renderLog();renderToday()}catch(e){}},8000)}}

/* 11th-93: thabat:// links — thabat://quran/301, thabat://note/<id>, thabat://lesson/<id>?t=<s>, thabat://book/<key>?p=<page>, thabat://day/<date> */
function thLink(u){try{const m=String(u).match(/^thabat:\/\/([a-z]+)\/([^?#]*)(?:\?([^#]*))?/i);if(!m)return;const k=m[1].toLowerCase(),v=decodeURIComponent(m[2]),q=new URLSearchParams(m[3]||'');
  if(k==='quran'){showView('quran');const r=q.get('r');if(r&&RIWAYAT[r]&&r!==S.quran.riwaya){try{qSetRiwaya(r)}catch(e){}}setTimeout(()=>qShow(Math.max(1,Math.min(604,+v||1))),r?400:60);return}
  if(k==='note'){showView('boards');setTimeout(()=>openNote(v),120);return}
  if(k==='lesson'){showView('lib');(async()=>{try{if(!LIB.base)await libConnect()}catch(e){}const s=+q.get('t')||0;if(s&&typeof lpvOpenAt==='function')lpvOpenAt(v,s);else libPlay(v)})();return}
  if(k==='book'){showView('lib');setTimeout(()=>nteBkOpen(v,+q.get('p')||1),200);return}
  if(k==='day'&&/^\d{4}-\d{2}-\d{2}$/.test(v)){showView('cal');selKey=v;try{renderCal();renderDetail()}catch(e){}}}catch(e){console.error(e)}}
function thCopy(u){qCopyText(u).then(ok=>toast(ok?t('thl.copied'):u))}
{const _to=thabatOpen;thabatOpen=function(w,...a){if(typeof w==='string'&&w.startsWith('url:'))return thLink(w.slice(4));if(w==='cont')return contOpen();return _to(w,...a)};window.thabatOpen=thabatOpen}
/* copy-link entries: the note «⋯», the Quran «⋯» sheet, a lesson «⋯» */
{hookFn('nteMenu',()=>nteMenu,f=>{nteMenu=f},'post',function(){try{const p=$('#ppPop');if(!p||!NE||p.querySelector('[data-thl]'))return;p.insertAdjacentHTML('beforeend',`<button data-thl="1">🔗 ${esc(t('thl.b'))}</button>`);p.querySelector('[data-thl]').onclick=()=>{closePP();neRead();thCopy('thabat://note/'+NE.id)}}catch(e){}})}
function thQBtn(){const m=$('#qhBtn')||$('#qbmBtn');if(!m||$('#qlnkBtn'))return;m.insertAdjacentHTML('afterend',`<button class="btn sm ghost" id="qlnkBtn">🔗 ${esc(t('thl.b'))}</button>`);$('#qlnkBtn').onclick=()=>{const Q=S.quran;thCopy('thabat://quran/'+(Q.pv||Q.view||1)+(Q.riwaya&&Q.riwaya!=='hafs'?'?r='+encodeURIComponent(Q.riwaya):''))}}
{hookFn('renderQuran',()=>renderQuran,f=>{renderQuran=f},'post',function(){try{thQBtn()}catch(e){}})}
{const _m=lshItemMenu;lshItemMenu=function(anchor,ref,...a){const r=_m(anchor,ref,...a);try{const p=$('#ppPop');if(p&&ref&&ref.id&&!p.querySelector('[data-thl]')){p.insertAdjacentHTML('beforeend',`<button data-thl="1">🔗 ${esc(t('thl.b'))}</button>`);p.querySelector('[data-thl]').onclick=()=>{closePP();thCopy('thabat://lesson/'+encodeURIComponent(ref.id))}}}catch(e){}return r}}

/* 11th-92: the «continue» widget (Android shell 42): the newest unfinished lesson or book */
function contItem(){let best=null;try{Object.entries(LIBS().prog||{}).forEach(([id,p])=>{if(p&&!p.done&&(p.p||0)>10&&p.at&&(!best||p.at>best.at))best={k:'lesson',id,at:p.at,title:p.n||(typeof libItem==='function'&&LIB.tree&&libItem(id)?libTitle(libItem(id).n):id),sub:p.c||'',pct:p.d?Math.round(p.p/p.d*100):0}})}catch(e){}
  try{Object.entries(BKS()||{}).forEach(([key,r])=>{if(r&&!r.done&&r.at&&(r.pg||1)>1&&(!best||r.at>best.at)){const b=(bkAll()||[]).find(x=>x.key===key);best={k:'book',id:key,at:r.at,title:(b&&b.n)||r.t||key,sub:t('bk.pages',r.pg||1,r.n||'?'),pct:r.n?Math.round((r.pg||1)/r.n*100):0,pg:r.pg||1}}})}catch(e){}return best}
const CONT={last:''};
function contPush(){if(!ANDROID||andV()<12)return;try{const c=contItem(),o=c?{lbl:t(c.k==='book'?'cont.book':'cont.lesson'),title:c.title,sub:c.sub,pct:c.pct}:{lbl:t('cont.none'),title:'',sub:'',pct:0},js=JSON.stringify(o);if(js===CONT.last)return;CONT.last=js;window.ThabatAndroid.contWidget(js)}catch(e){}}
function contOpen(){const c=contItem();if(!c){showView('lib');return}if(c.k==='book'){showView('lib');setTimeout(()=>nteBkOpen(c.id,c.pg),200)}else thLink('thabat://lesson/'+encodeURIComponent(c.id))}
{hookFn('renderToday',()=>renderToday,f=>{renderToday=f},'post',function(){try{contPush()}catch(e){}})}
setInterval(()=>{try{contPush()}catch(e){}},120000);

/* 11th-90: the screen stays on while the mushaf is open (S.settings.qKeepOn, default on) */
function qkoApply(){const on=curView()==='quran'&&S.settings.qKeepOn!==false&&!document.hidden;try{if(ANDROID){if(andV()>=12)window.ThabatAndroid.keepOn(on)}else if(typeof qWake==='function')qWake(on||document.documentElement.classList.contains('qfs'))}catch(e){}}
{hookFn('showView',()=>showView,f=>{showView=f},'post',function(){qkoApply()})}
document.addEventListener('visibilitychange',qkoApply);
{hookFn('renderSettings',()=>renderSettings,f=>{renderSettings=f},'post',function(){try{const r=$('#wmRow');if(!r||$('#qkoRow'))return;r.insertAdjacentHTML('afterend',`<div class="field" id="qkoRow"><div><label data-i18n="qko.set">${esc(t('qko.set'))}</label><small>${esc(t('qko.setS'))}</small></div><button class="sw-toggle ${S.settings.qKeepOn!==false?'on':''}" id="qkoT"></button></div>`);$('#qkoT').onclick=e=>{S.settings.qKeepOn=S.settings.qKeepOn===false;e.currentTarget.classList.toggle('on',S.settings.qKeepOn!==false);save();qkoApply()}}catch(e){}})}

/* 11th-87 (Windows): «Open with Thabat» for PDF files and thabat:// links on the PC, registered by the helper (/assoc); opened files arrive through the automation queue */
{const _a=autoApply;autoApply=function(L_,...a){try{const rest=[];(L_||[]).forEach(x=>{if(x&&x.t==='pdf'&&x.p)assocPdf(x.p);else if(x&&x.t==='open'&&x.u)thLink(x.u);else rest.push(x)});if(!rest.length)return;return _a(rest,...a)}catch(e){return _a(L_,...a)}}}
async function assocPdf(p){try{const r=await fetch(HELPER+'/lfile?p='+encodeURIComponent(p),{cache:'no-store'});if(!r.ok)throw 0;const buf=await r.arrayBuffer(),n=String(p).split(/[\\/]/).pop().replace(/\.pdf$/i,''),id=bkHash(n+'.pdf|'+buf.byteLength),list=bkLocal();
  await idbSet('book:'+id,buf);if(!list.some(b=>b.id===id)){list.unshift({id,n,s:buf.byteLength,at:Date.now()});bkLocalSave(list)}showView('lib');setTimeout(()=>nteBkOpen('l:'+id,(BKS()['l:'+id]||{}).pg||1),250)}catch(e){toast(t('asc.fail'))}}
{hookFn('renderSettings',()=>renderSettings,f=>{renderSettings=f},'post',function(){try{if(ANDROID||MAC)return;const r=$('#autoRow');if(!r||$('#ascRow'))return;helperCall('/assoc').then(st=>{if(!st||$('#ascRow'))return;r.insertAdjacentHTML('afterend',`<div class="field" id="ascRow"><div><label>${esc(t('asc.set'))}</label><small>${esc(t('asc.setS'))}</small></div><button class="sw-toggle ${st.on?'on':''}" id="ascT"></button></div>`);
  $('#ascT').onclick=async e=>{const b=e.currentTarget,on=!b.classList.contains('on'),x=await helperCall('/assoc?on='+(on?1:0));if(x&&x.ok){b.classList.toggle('on',!!x.on);toast(x.on?t('asc.on'):t('asc.off'))}else toast(t('asc.fail'))}})}catch(e){}})}
