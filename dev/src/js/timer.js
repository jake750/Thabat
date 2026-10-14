/* ============ timer ============ */
function catOptions(sel){return topCats().map(c=>`<option value="${c.id}" ${c.id===sel?'selected':''}>${esc(kidName(c))}</option>`+kidsOf(c.id).map(k=>`<option value="${k.id}" ${k.id===sel?'selected':''}>\u2003— ${esc(kidName(k))}</option>`).join('')).join('')}
function renderCatChips(){const cur=S.timer.cat,top=topOf(cur);
  let h=topCats().map(c=>`<button class="chip ${top===c.id?'on':''}" style="--c:${c.color}" data-c="${c.id}"><i style="background:${c.color}"></i>${esc(kidName(c))}</button>`).join('');
  const ks=kidsOf(top);if(ks.length){const pc=catOf(top).color;h+=`<div class="subchips">`+[{id:top,gen:1},...ks].map(k=>`<button class="chip sm ${cur===k.id?'on':''}" style="--c:${pc}" data-c="${k.id}">${k.gen?t('cat.general'):esc(kidName(k))}</button>`).join('')+'</div>'}
  $('#catChips').innerHTML=h;
  $$('#catChips .chip').forEach(b=>b.onclick=()=>{const T=S.timer;if(b.dataset.c===T.cat)return;if(T.mode==='work'){addSession(T.cat,T.start,Date.now());T.start=Date.now()}T.cat=b.dataset.c;save();renderCatChips();renderTimer();renderGlass()});
  $('#manCat').innerHTML=catOptions(S.timer.cat);$('#mCat').innerHTML=catOptions($('#mCat').value||'course');}
function renderTimerBtns(){const m=S.timer.mode;let h='';
  if(m==='idle')h=`<button class="btn pri" data-a="start">${t('btn.start')}</button>`;
  else if(m==='work')h=`<button class="btn pri" data-a="brk">${t('btn.break')}</button><button class="btn" data-a="stop">${t('btn.endSession')}</button>`;
  else if(m==='pray')h=`<button class="btn pri" data-a="prayed">✓ ${t('pray.done')}</button><button class="btn" data-a="stop">${t('btn.end')}</button>`;
  else h=`<button class="btn pri" data-a="resume">${t('btn.resume')}</button><button class="btn" data-a="stop">${t('btn.end')}</button>`;
  $('#tBtns').innerHTML=h;$('#brkPop').classList.remove('on');
  $$('#tBtns .btn').forEach(b=>b.onclick=()=>timerAct(b.dataset.a));}
function timerAct(a){const T=S.timer,now=Date.now();
  if(a==='start'){T.mode='work';T.start=now}
  else if(a==='brk'){$('#brkPop').classList.toggle('on');return}
  else if(a==='resume'){T.mode='work';T.start=now;T.brkStart=null}
  else if(a==='prayed'){prayDone();return}
  else if(a==='stop'){if(T.mode==='work')addSession(T.cat,T.start,now);T.mode='idle';T.start=null;T.brkStart=null;T.prayStart=null}
  save();renderTimerBtns();renderTimer();renderGlass();renderLog()}
function startBreak(min){const T=S.timer,now=Date.now();if(T.mode==='work')addSession(T.cat,T.start,now);T.mode='brk';T.start=null;T.brkStart=now;T.brkDur=min;T.brkAlerted=false;save();renderTimerBtns();renderTimer();renderGlass();renderLog();toast(min?t('toast.brk',minW(min)):t('toast.brkOpen'))}
function renderBrkChips(){$('#brkChips').innerHTML=[5,10,15,20,30].map(m=>`<button class="chip" data-m="${m}">${m} ${t('u.m')}</button>`).join('');
  $$('#brkChips .chip').forEach(b=>b.onclick=()=>startBreak(+b.dataset.m));}
$('#brkCustomGo').onclick=()=>{const v=+$('#brkCustom').value;if(v>0)startBreak(v)};
$('#brkOpen').onclick=()=>startBreak(null);
$('#manualBtn').onclick=()=>{const p=$('#manPop');p.classList.toggle('on');if(p.classList.contains('on')){$('#manDate').value=todayKey();$('#manDate').max=todayKey();$('#manCat').value=S.timer.cat;$('#manNote').focus()}};
$('#manCancel').onclick=()=>{$('#manPop').classList.remove('on');dayModalDone()};
function startOf(k,tm,dur){let start;
  if(tm){const [h,m]=tm.split(':').map(Number);const b=keyToDate(k);start=new Date(b.getFullYear(),b.getMonth(),b.getDate(),h,m).getTime();if(h<S.settings.dayStart)start+=DAYMS}
  else start=(k===todayKey()?Date.now():keyToDate(k).getTime()+12*36e5)-dur;return start}
$('#manGo').onclick=()=>{const mins=(+$('#manH').value||0)*60+(+$('#manMin').value||0);if(!(mins>0)){toast(t('toast.needDur'));return}
  const k=$('#manDate').value||todayKey(),dur=mins*6e4,start=startOf(k,$('#manTime').value,dur);
  day(k).sessions.push({id:uid(),cat:$('#manCat').value,start,end:start+dur,manual:true,note:$('#manNote').value.trim()});
  day(k).sessions.sort((a,b)=>a.start-b.start);save();
  ['manNote','manH','manMin','manTime'].forEach(i=>$('#'+i).value='');$('#manPop').classList.remove('on');
  renderGlass();renderLog();dayModalDone();toast(k!==todayKey()?t('toast.addedTo',fmtHM(dur),gStr(keyToDate(k))):t('toast.added',fmtHM(dur)))};
$('#manNote').onkeydown=e=>{if(e.key==='Enter')$('#manGo').click()};
function renderTimer(){const T=S.timer,now=Date.now(),st=$('#tState');st.className='timer-state';
  if(T.mode==='work'){$('#tDisp').textContent=fmtClock(now-T.start);st.textContent=t('timer.working',catName(catOf(T.cat)))}
  else if(T.mode==='brk'){const el=now-T.brkStart;
    if(T.brkDur){const left=T.brkDur*6e4-el;if(left>=0){$('#tDisp').textContent=fmtClock(left);st.textContent=t('timer.brkLeft');st.classList.add('brk')}
      else{$('#tDisp').textContent='+'+fmtClock(-left);st.textContent=t('timer.brkOver');st.classList.add('over');if(!T.brkAlerted){T.brkAlerted=true;save();alertUser(t('al.brk'),t('al.brkB',catName(catOf(T.cat))),ICON_CUP)}}}
    else{$('#tDisp').textContent=fmtClock(el);st.textContent=t('timer.brkOpen');st.classList.add('brk')}}
  else if(T.mode==='pray'){$('#tDisp').textContent=fmtClock(now-T.prayStart);st.textContent=t('timer.pray');st.classList.add('brk')}
  else{$('#tDisp').textContent='00:00:00';st.textContent=t('timer.ready')}}
var renderLog;

