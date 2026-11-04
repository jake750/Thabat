/* ============ v3.167.0 thirteenth list J: Android ============ */
/* 216 the «tasks of this period» widget, 219 transparent widgets, 221 the timer notification names the task and category,
   224/225/229 PDFs shared to Thabat or opened with it become device books under a short name, 226 the library player side by side
   on a phone turned sideways (CSS), 227 widget text size, 228 «snooze everything an hour» from any reminder, 233 «the next lesson»
   at the lesson-of-the-day time, 235 the book reader at night lowers the screen brightness. Bridge version 14 (shell 46). */
function an8On(){return ANDROID&&andV()>=14}
function an8NoE(s){return String(s||'').replace(/[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}]️?/gu,'').replace(/\s{2,}/g,' ').trim()}

/* 216: the undone tasks of the current prayer period (or, before Fajr, the tasks tied to no prayer) */
const AN8={ptk:'',dim:null,timer:0};
function an8PtkData(){const k=todayKey(),now=Date.now(),p=pdlSlotOf(k,now),d=S.days[k]||{tasks:[]};
  const L_=(d.tasks||[]).filter(x=>!x.done&&!x.pp&&!x.dismissed&&(p?x.after===p:!x.after));
  return{lbl:p?t('an8.wHd',t('pr.'+p)):t('an8.wHd0'),n:L_.length,none:t('an8.wNone'),items:L_.slice(0,4).map(x=>({id:x.id,t:an8NoE(x.text)}))}}
function an8PtkPush(){if(!an8On())return;try{const js=JSON.stringify(an8PtkData());if(js===AN8.ptk)return;AN8.ptk=js;window.ThabatAndroid.ptkWidget(js)}catch(e){}}
{hookFn('renderTasks',()=>renderTasks,f=>{renderTasks=f},'post',function(){setTimeout(an8PtkPush,60)})}
setInterval(an8PtkPush,120000);setTimeout(an8PtkPush,2600);

/* 219/227: the widget look sends two more fields: tr (no background) and fs (text size step) */
const AN8_FS={s:.86,m:1,l:1.18};
wthPush=function(){if(!ANDROID||andV()<9)return;try{const cs=getComputedStyle(document.documentElement),g=k=>barHex(cs.getPropertyValue(k).trim()||'#000');const panel=g('--panel').slice(1),W=S.settings.wLook||{};
  const o={acc:g('--accent'),bg:'#F0'+panel,text:g('--text'),muted:g('--muted'),on:g('--onAccent')};if(andV()>=14){o.tr=!!W.tr;o.fs=AN8_FS[W.fs]||1}
  const js=JSON.stringify(o);if(wthPush.last===js)return;wthPush.last=js;window.ThabatAndroid.widgetTheme(js)}catch(e){}}
function an8WRows(){try{if(!an8On()||$('#an8WRow'))return;const host=$('#wopRow');if(!host)return;const W0=()=>S.settings.wLook||(S.settings.wLook={}),W=W0();
  host.insertAdjacentHTML('afterend',`<div class="field andonly" id="an8WRow"><div><label>${t('an8.wTr')}</label><small>${t('an8.wTrS')}</small></div><button class="sw-toggle ${W.tr?'on':''}" id="an8WTr"></button></div>
    <div class="field andonly" id="an8WfRow"><div><label>${t('an8.wFs')}</label><small>${t('an8.wFsS')}</small></div><select class="in" id="an8WFs">${['s','m','l'].map(v=>`<option value="${v}" ${(W.fs||'m')===v?'selected':''}>${t('an8.fs.'+v)}</option>`).join('')}</select></div>`);
  $('#an8WTr').onclick=e=>{const w=W0();w.tr=!w.tr;e.currentTarget.classList.toggle('on',w.tr);save();wthPush()};
  $('#an8WFs').onchange=e=>{W0().fs=e.target.value;save();wthPush()}}catch(e){}}
{hookFn('andRows',()=>andRows,f=>{andRows=f},'post',an8WRows)}
{hookFn('renderSettings',()=>renderSettings,f=>{renderSettings=f},'post',function(){setTimeout(an8WRows,0)})}

/* 221: the timer's notification: the task as the title, the category (and project, and time against the estimate) under it */
timerNotifPush=function(){if(!ANDROID||!window.ThabatAndroid.timerNotif)return;const T=S.timer,c=catOf(T.cat),pj=T.proj&&pjOf(T.proj);
  let title=t('tn.work',an8NoE(catName(c))),text='';
  if(T.task){title=an8NoE(T.task.text);const x=(S.days[T.task.k]||{tasks:[]}).tasks.find(q=>q.id===T.task.id);
    text=[an8NoE(catName(c)),pj?an8NoE(pj.name):'',x&&x.est?t('an8.tnEst',x.est):''].filter(Boolean).join(' · ')}
  else text=pj?an8NoE(pj.name):t('tn.sub');
  const o={on:tnOn(),mode:T.mode,base:T.mode==='work'?T.start:(T.brkStart||Date.now()),end:T.mode==='brk'&&T.brkDur?T.brkStart+T.brkDur*6e4:0,title,text,
    brkTitle:t('tn.brk'),brkText:t('tn.brkB',an8NoE(catName(c))),chName:t('timer.title'),lbl:{brk5:t('an8.brk',5),brk15:t('an8.brk',15),stop:an8NoE(t('btn.end')).replace(/^■\s*/,''),resume:an8NoE(t('btn.resume'))}};
  const js=JSON.stringify(o);if(js===TN_LAST)return;TN_LAST=js;try{window.ThabatAndroid.timerNotif(js)}catch(e){}}

/* 224/225/229: PDFs from the share sheet or «Open with»: read in 4 MB pieces, then saved as a device book under the name you choose */
shrCheck=function(){if(!andShare())return;let s='';try{s=window.ThabatAndroid.takeShare()||''}catch(e){}if(!s)return;let o;try{o=JSON.parse(s)}catch(e){return}if(!o)return;
  const P=o.pdfs||[];if(P.length)an8PdfQueue(P,!!o.open);
  if(o.text||o.subject||(o.imgs||[]).length)shrOpen(o)}
async function an8PdfQueue(P,open){for(const p of P){try{await an8PdfOne(p,open&&P.length===1)}catch(e){toast(t('bk.addFail'))}}}
async function an8PdfRead(f,size){const out=new Uint8Array(size);let at=0;const N=4*1024*1024;
  while(at<size){const b=window.ThabatAndroid.inRead(f,at,N);if(!b)break;const bin=atob(b);for(let i=0;i<bin.length;i++)out[at+i]=bin.charCodeAt(i);at+=bin.length;await new Promise(r=>setTimeout(r,0))}
  if(at<size)throw new Error('short');return out.buffer}
async function an8PdfOne(p,open){toast(t('an8.pdfRd'));const buf=await an8PdfRead(p.f,+p.s||0);try{window.ThabatAndroid.inDel(p.f)}catch(e){}
  await an8BkSave(buf,p.n||'book.pdf',+p.s||buf.byteLength,open)}
function an8Short(n){let s=String(n||'').replace(/\.pdf$/i,'').replace(/[_]+/g,' ').replace(/\s+/g,' ').trim();if(s.length>48)s=s.slice(0,48).trim()+'…';return s||t('an8.book')}
function an8BkSave(buf,fname,size,open){return new Promise(res=>{const id=bkHash(fname+'|'+size),list=bkLocal(),old=list.find(b=>b.id===id);
  const done=async name=>{try{await idbSet('book:'+id,buf);const L_=bkLocal();let b=L_.find(x=>x.id===id);if(b)b.n=name;else{b={id,n:name,s:size,at:Date.now()};L_.unshift(b)}bkLocalSave(L_);
      toast(t(old?'an8.pdfSame':'bk.added'));if(curView()==='lib')renderLib();if(open){const x=bkAll().find(q=>q.key==='l:'+id);if(x){showView('lib');setTimeout(()=>bkOpen(x),200)}}}catch(e){toast(t('bk.addFail'))}res()};
  an8NameAsk(old?old.n:an8Short(fname),fname,done,()=>res())})}
function an8NameAsk(def,fname,ok,cancel){openInfo(t('an8.nmT'),`<div class="an8nm"><small dir="auto">${esc(fname)}</small><input class="in" id="an8Nm" dir="auto" maxlength="80" value="${esc(def)}" placeholder="${esc(t('an8.nmPh'))}"><small>${t('an8.nmS')}</small>
    <div class="row an8nmb"><button class="btn" id="an8NmX">${t('cancel')}</button><button class="btn pri" id="an8NmOk">${t('an8.nmOk')}</button></div></div>`);
  const box=$('#infoBox');if(box)box.classList.add('an8nmbox');let sent=false;const go=v=>{if(sent)return;sent=true;closeInfo2();v==null?cancel&&cancel():ok(v)};
  const i=$('#an8Nm');setTimeout(()=>{try{i.focus();i.select()}catch(e){}},80);
  $('#an8NmOk').onclick=()=>go(($('#an8Nm').value||'').trim()||def);$('#an8NmX').onclick=()=>go(null);i.onkeydown=e=>{if(e.key==='Enter')$('#an8NmOk').click()}}
/* the picker of «add a book» goes through the same short name */
bkAdd=function(){const i=document.createElement('input');i.type='file';i.accept='application/pdf,.pdf';i.onchange=async()=>{const f=i.files[0];if(!f)return;if(!/\.pdf$/i.test(f.name)&&f.type!=='application/pdf'){toast(t('bk.notPdf'));return}
  try{const buf=await f.arrayBuffer();await an8BkSave(buf,f.name,f.size,false)}catch(e){toast(t('bk.addFail'))}};i.click()}
/* rename a device book later from its «⋯» */
{const _m=bkMenu;bkMenu=function(anchor,key,...a){const r=_m(anchor,key,...a);try{const p=$('#ppPop');if(p&&key.startsWith('l:')&&!p.querySelector('[data-an8rn]')){p.insertAdjacentHTML('beforeend',`<button data-an8rn="1">✎ ${t('an8.ren')}</button>`);
  p.querySelector('[data-an8rn]').onclick=()=>{closePP();const id=key.slice(2),L_=bkLocal(),b=L_.find(x=>x.id===id);if(!b)return;an8NameAsk(b.n,b.n,v=>{b.n=v;bkLocalSave(L_);toast(t('an8.renOk'));try{renderLib()}catch(e){}})}}}catch(e){}return r}}

/* 228: «snooze everything an hour» on every Thabat reminder; the app's own alerts pause too */
{const _tt=toneTag;toneTag=function(x){const r=_tt(x);try{if(an8On()&&r&&!r.adhan&&!r.wake&&!r.quiet)return Object.assign({},r,{saLbl:t('an8.snzAll')})}catch(e){}return r}}
function an8SnzTake(){if(!an8On()||!window.ThabatAndroid.takeSnz)return;let v='';try{v=window.ThabatAndroid.takeSnz()}catch(e){}if(!v)return;const until=+v;if(!(until>Date.now()))return;
  S.settings.pauseUntil=Math.max(+S.settings.pauseUntil||0,until);save();toast(t('an8.snzOk',fmtT(until)))}
{const _p=window.thabatPoll;window.thabatPoll=(...a)=>{try{_p&&_p(...a)}catch(e){}try{an8SnzTake()}catch(e){}}}
{const _r=window.thabatResume;window.thabatResume=function(...a){let r;try{r=_r&&_r.apply(this,a)}catch(e){}setTimeout(an8SnzTake,300);return r}}
setTimeout(an8SnzTake,2000);

/* 233: a notification with the next lesson at the time of «a lesson every day» (its prayer + 10 min) */
{hookFn('extraSched',()=>extraSched,f=>{extraSched=f},'post',function(out,now){try{if(!LOD().length)return;let n=0;
  for(let d=0;d<2;d++){const date=addDays(new Date(),d),k=dKey(date),wd=date.getDay(),pt=prayerTimes(date);
    LOD().forEach(o=>{if(n>=12||!(o.days||[]).includes(wd))return;const at=pt[o.after||'asr']+10*6e4;if(!(at>now))return;
      const tk=d===0&&((S.days[k]||{}).tasks||[]).find(x=>x.id===lodId(o.ref,k));if(tk&&tk.done)return;
      const nx=lodNext(o.ref);out.push({id:9600+n++,t:at,title:t('an8.lodT',an8NoE(o.n||'')),body:nx?an8NoE(lrnName(nx.id)||libTitle(nx.n)):t('an8.lodB'),open:'lod'})})}}catch(e){}})}
{const _to=thabatOpen;thabatOpen=function(w,...a){if(w==='lod'){const d=S.days[todayKey()]||{tasks:[]},x=(d.tasks||[]).find(q=>q.auto==='lod'&&!q.done);if(x)return lodPlay(x);showView('lib');return}return _to(w,...a)};window.thabatOpen=thabatOpen}

/* 235: the book reader in night or amber light dims this window (a share of the phone's brightness), back when it closes */
function an8DimWant(){try{return an8On()&&LIBS().bkDim!==false&&!!$('#bkReader.on')&&(BK.night==='night'||BK.night==='amber')}catch(e){return false}}
function an8DimTick(){if(!an8On())return;const k=an8DimWant()?(+LIBS().bkDimK||.5):0;if(k===AN8.dim)return;AN8.dim=k;try{window.ThabatAndroid.dim(k)}catch(e){}}
if(ANDROID)setInterval(an8DimTick,1200);
{hookFn('bkClose',()=>bkClose,f=>{bkClose=f},'post',function(){setTimeout(an8DimTick,30)})}
{hookFn('bkReaderMenu',()=>bkReaderMenu,f=>{bkReaderMenu=f},'post',function(){try{if(!an8On())return;const p=$('#ppPop');if(!p||p.querySelector('[data-an8d]'))return;const on=LIBS().bkDim!==false,k=+LIBS().bkDimK||.5;
  p.insertAdjacentHTML('beforeend',`<button data-an8d="t">${on?'☾ '+t('an8.dimOff'):'☾ '+t('an8.dimOn')}</button>${on?`<button data-an8d="k">◐ ${t('an8.dimK',Math.round(k*100))}</button>`:''}`);
  p.querySelectorAll('[data-an8d]').forEach(b=>b.onclick=()=>{closePP();const L_=LIBS();if(b.dataset.an8d==='t'){L_.bkDim=!on;toast(t(L_.bkDim?'an8.dimY':'an8.dimN'))}else{const st=[.7,.5,.35,.2],i=st.indexOf(k);L_.bkDimK=st[(i+1)%st.length];toast(t('an8.dimK',Math.round(L_.bkDimK*100)))}save();AN8.dim=null;an8DimTick()})}catch(e){}})}
