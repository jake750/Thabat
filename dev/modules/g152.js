/* ============ 3.130 twelfth list A (tasks): a «someday» list for undated ideas, hide a task until a date, a repeating task's count this month ============ */
/* 12th-2: S.someday=[{id,text,at}] — no date; shown in the weekly review (step 4), from the task «⋯», the inbox, Ctrl+K */
function SDY(){return S.someday||(S.someday=[])}
try{if(Array.isArray(SY_SIMPLE)){if(!SY_SIMPLE.includes('someday'))SY_SIMPLE.push('someday');if(!SY_SIMPLE.includes('snz'))SY_SIMPLE.push('snz')}}catch(e){}
function sdyAdd(text){text=String(text||'').trim().slice(0,300);if(!text)return null;const it={id:uid(),text,at:Date.now()};SDY().unshift(it);save();return it}
function sdyToDay(id,k){const i=SDY().findIndex(q=>q.id===id);if(i<0)return;const it=SDY()[i];SDY().splice(i,1);day(k||todayKey()).tasks.push({id:uid(),text:it.text.slice(0,200),done:false,created:Date.now(),sdy:1});save();try{renderTasks()}catch(e){}}
function sdyDel(id,after){const i=SDY().findIndex(q=>q.id===id);if(i<0)return;const it=SDY()[i];SDY().splice(i,1);save();after&&after();toastAct(t('sdy.del'),t('undo'),()=>{SDY().splice(Math.min(i,SDY().length),0,it);save();after&&after()})}
function sdyRows(max){const L_=SDY().slice(0,max||999);return L_.map(x=>`<div class="sdyr" data-sdy="${x.id}"><span dir="auto">${esc(x.text)}</span><small>${esc(gShort(new Date(x.at)))}</small><button class="btn sm" data-a="td">☑ ${esc(t('sdy.today'))}</button><button class="btn sm ghost" data-a="del" title="${esc(t('del'))}">✕</button></div>`).join('')}
function sdyBind(root,again){root.querySelectorAll('[data-sdy] [data-a]').forEach(b=>b.onclick=e=>{e.stopPropagation();const id=b.closest('[data-sdy]').dataset.sdy;if(b.dataset.a==='td'){sdyToDay(id);toast(t('sdy.moved'));again()}else sdyDel(id,again)})}
function sdyOpen(){const paint=()=>{const box=$('#sdyList');if(!box)return;box.innerHTML=SDY().length?sdyRows():`<div class="empty">${esc(t('sdy.none'))}</div>`;sdyBind(box,paint);const h=$('#infoBox h2');if(h)h.textContent=t('sdy.t')+(SDY().length?' ('+SDY().length+')':'')};
  openInfo(esc(t('sdy.t')),`<div class="sdyw"><small class="muted">${esc(t('sdy.sub'))}</small><div class="sdyadd"><input class="in" id="sdyIn" dir="auto" placeholder="${esc(t('sdy.ph'))}"><button class="btn pri" id="sdyAddB">${esc(t('add'))}</button></div><div id="sdyList"></div></div>`);
  $('#infoBox').classList.add('sdybox');const go=()=>{const i=$('#sdyIn');if(sdyAdd(i.value)){i.value='';paint()}i.focus()};$('#sdyAddB').onclick=go;$('#sdyIn').onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();go()}};paint()}
function tkToSdy(k,id){const d=day(k),i=d.tasks.findIndex(q=>q.id===id);if(i<0)return;const x=d.tasks[i];d.tasks.splice(i,1);const it=sdyAdd(x.text);try{renderTasks()}catch(e){}
  toastAct(t('sdy.sent'),t('undo'),()=>{d.tasks.splice(Math.min(i,d.tasks.length),0,x);const j=SDY().indexOf(it);if(j>=0)SDY().splice(j,1);save();try{renderTasks()}catch(e){}})}
/* weekly review, step 4 (the inbox step): the someday list under it */
{hookFn('renderWR',()=>renderWR,f=>{renderWR=f},'post',function(){try{if(!WR||WR.step!==3)return;const b=$('#wrBox .wrbody');if(!b||$('#wrSdy'))return;const n=SDY().length;
  b.insertAdjacentHTML('beforeend',`<div id="wrSdy" class="wrsdy"><h4>${esc(t('sdy.t'))}${n?' ('+n+')':''}</h4>${n?`<small class="muted">${esc(t('sdy.wr'))}</small><div class="sdyl">${sdyRows(8)}</div>${n>8?`<button class="btn sm ghost" id="wrSdyAll">${esc(t('sdy.all',n))}</button>`:''}`:`<small class="muted">${esc(t('sdy.none'))}</small>`}</div>`);
  const W=$('#wrSdy');sdyBind(W,()=>{W.remove();renderWR()});const a=$('#wrSdyAll');if(a)a.onclick=()=>{$('#wrModal').classList.remove('on');sdyOpen()}}catch(e){console.error(e)}})}
/* inbox: «someday» as one of the choices, and a button to the list */
{hookFn('ibStep',()=>ibStep,f=>{ibStep=f},'post',function(){try{const r=$('#infoBox .ibsb');if(!r||r.querySelector('[data-a="sdy"]'))return;const it=INB()[0];if(!it)return;
  const b=document.createElement('button');b.className='btn';b.dataset.a='sdy';b.innerHTML='💭 '+esc(t('sdy.b'));r.querySelector('[data-a="skip"]')?.before(b);
  b.onclick=()=>{const txt=($('#ibsT')?.value||'').trim()||it.text;sdyAdd(txt);const i=INB().indexOf(it);if(i>=0)INB().splice(i,1);save();try{renderInbBtn()}catch(e){}ibStep()}}catch(e){}})}
{hookFn('renderInbox',()=>renderInbox,f=>{renderInbox=f},'post',function(){try{const box=$('#ibBox');if(!box||$('#ibSdy'))return;box.insertAdjacentHTML('beforeend',`<div class="ibsdy"><button class="btn sm ghost" id="ibSdy">💭 ${esc(t('sdy.t'))}${SDY().length?' ('+SDY().length+')':''}</button></div>`);$('#ibSdy').onclick=()=>{$('#ibModal').classList.remove('on');sdyOpen()}}catch(e){}})}

/* 12th-5: hide a task until a date — S.snz=[{x:task,to,from}]; it leaves the day now and comes back to Today on that date */
function SNZ(){return S.snz||(S.snz=[])}
function snzHide(k,id,to){const d=day(k),i=d.tasks.findIndex(q=>q.id===id);if(i<0||!to)return;const x=d.tasks[i];d.tasks.splice(i,1);const it={x,to,from:k,at:Date.now()};SNZ().push(it);save();try{renderTasks()}catch(e){}
  toastAct(t('snz.done',gShort(keyToDate(to))),t('undo'),()=>{const j=SNZ().indexOf(it);if(j>=0)SNZ().splice(j,1);d.tasks.splice(Math.min(i,d.tasks.length),0,x);save();try{renderTasks()}catch(e){}})}
function snzAsk(k,id){const base=keyToDate(todayKey()),opt=[[3,'snz.d3'],[7,'snz.w1'],[14,'snz.w2'],[30,'snz.m1']];
  openInfo(esc(t('snz.t')),`<div class="snzw"><small class="muted">${esc(t('snz.sub'))}</small><div class="snzb">${opt.map(([n,l])=>`<button class="btn" data-n="${n}">${esc(t(l))}<small>${esc(gShort(addDays(base,n)))}</small></button>`).join('')}</div><div class="snzd"><input type="date" class="in" id="snzD" min="${dKey(addDays(base,1))}"><button class="btn pri" id="snzGo">${esc(t('snz.go'))}</button></div></div>`);
  $$('#infoBox .snzb [data-n]').forEach(b=>b.onclick=()=>{closeInfo2();snzHide(k,id,dKey(addDays(base,+b.dataset.n)))});
  $('#snzGo').onclick=()=>{const v=$('#snzD').value;if(!v||v<=todayKey()){toast(t('snz.pick'));return}closeInfo2();snzHide(k,id,v)}}
function closeInfo2(){try{$('#infoModal')?.classList.remove('on')}catch(e){}$$('.modal.on').forEach(m=>{if(m.querySelector('#infoBox'))m.classList.remove('on')})}
function snzWake(){const L_=SNZ();if(!L_.length)return;const tk=todayKey(),back=L_.filter(it=>it.to<=tk);if(!back.length)return;const d=day(tk);
  back.forEach(it=>{if(!d.tasks.some(q=>q.id===it.x.id))d.tasks.push({...it.x,done:false,snzBack:it.from});L_.splice(L_.indexOf(it),1)});save();setTimeout(()=>{try{toast(t('snz.back',back.length))}catch(e){}},900)}
{hookFn('renderToday',()=>renderToday,f=>{renderToday=f},'pre',function(){try{snzWake()}catch(e){console.error(e)}})}
function snzList(){const paint=()=>{const box=$('#snzList');if(!box)return;const L_=SNZ().slice().sort((a,b)=>a.to<b.to?-1:1);
    box.innerHTML=L_.length?L_.map(it=>`<div class="sdyr" data-snz="${it.x.id}"><span dir="auto">${esc(it.x.text)}</span><small>${esc(t('snz.until',gShort(keyToDate(it.to))))}</small><button class="btn sm" data-a="now">${esc(t('snz.now'))}</button><button class="btn sm ghost" data-a="del" title="${esc(t('del'))}">✕</button></div>`).join(''):`<div class="empty">${esc(t('snz.none'))}</div>`;
    box.querySelectorAll('[data-snz] [data-a]').forEach(b=>b.onclick=()=>{const id=b.closest('[data-snz]').dataset.snz,i=SNZ().findIndex(q=>q.x.id===id);if(i<0)return;const it=SNZ()[i];SNZ().splice(i,1);
      if(b.dataset.a==='now'){day(todayKey()).tasks.push({...it.x,done:false});save()}else{save();toastAct(t('sdy.del'),t('undo'),()=>{SNZ().push(it);save();paint();try{renderTasks()}catch(e){}})}paint();try{renderTasks()}catch(e){}})};
  openInfo(esc(t('snz.lt')),`<div id="snzList" class="sdyw"></div>`);$('#infoBox').classList.add('sdybox');paint()}
/* the task «⋯»: «someday» and «hide until…» (not for repeating instances: those have «pause» since 3.117) */
{const _ux=uxMenuExtras;uxMenuExtras=function(k,id,...a){const r=_ux(k,id,...a);try{const p=$('#ppPop'),x=day(k).tasks.find(q=>q.id===id);if(!p||!x||x.done||x.recurId||p.querySelector('[data-tk12]'))return r;
  const add=(ic,lab,fn)=>{const b=document.createElement('button');b.dataset.tk12=1;b.innerHTML=`${ic} ${esc(lab)}`;b.onclick=e=>{e.stopPropagation();closePP();fn()};p.append(b)};
  if(k>=todayKey())add('💤',t('snz.b'),()=>snzAsk(k,id));add('💭',t('sdy.to'),()=>tkToSdy(k,id))}catch(e){console.error(e)}return r}}

/* 12th-7: a repeating task — instances done this month beside its streak; and the hidden tasks line under the list */
function tkMonthN(rid,k){const m=k.slice(0,7);let n=0;Object.keys(S.days).forEach(dk=>{if(dk.slice(0,7)!==m||dk>k)return;const x=(S.days[dk].tasks||[]).find(q=>q.recurId===rid);if(x&&x.done)n++});return n}
{hookFn('renderTasks',()=>renderTasks,f=>{renderTasks=f},'post',function(){try{const k=todayKey(),d=day(k),box=$('#tasks');if(!box)return;const mc={};
  box.querySelectorAll('.task[data-id]').forEach(li=>{const x=d.tasks.find(q=>q.id===li.dataset.id);li.querySelector('.tkmon')?.remove();if(!x||!x.recurId)return;const n=mc[x.recurId]??(mc[x.recurId]=tkMonthN(x.recurId,k));if(n<1)return;
    const at=li.querySelector('.tkstk')||li.querySelector('.tx');at&&at.insertAdjacentHTML('afterend',`<span class="tkmon" title="${esc(t('tkm.tip'))}">${esc(t('tkm.n',n))}</span>`)});
  $('#snzLine')?.remove();const n=SNZ().length;if(n)box.insertAdjacentHTML('afterend',`<button class="snzline" id="snzLine" type="button">💤 ${esc(t('snz.line',n))}</button>`),$('#snzLine').onclick=snzList}catch(e){console.error(e)}})}
{const _cc=cmdCommands;cmdCommands=function(){const c=(icon,label,run,kw)=>({icon,label,run,kw:kw||''});return _cc().concat([c('💭',t('sdy.t'),sdyOpen,'someday later ideas يوما ما أفكار'),c('💤',t('snz.lt'),snzList,'hidden snooze مخفية')])}}
{hookFn('openInfo',()=>openInfo,f=>{openInfo=f},'pre',function(){try{$('#infoBox')?.classList.remove('sdybox')}catch(e){}})}
