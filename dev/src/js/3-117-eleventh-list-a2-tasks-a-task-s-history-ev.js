/* ============ 3.117 eleventh list A2 (tasks): a task's history, every repeat rule in one window, pause a repeat, a repeat that ends, the current period first, process the inbox one by one, Hijri dates in the smart input ============ */
/* 11th-10/11: r.pauseTo (date: no instance up to it), r.until (last date), r.times (stop after N instances) */
const RCN={at:-1,c:{}};
function rcCount(rid,k){if(RCN.at!==S._savedAt){RCN.c={};RCN.at=S._savedAt}const key=rid+'|'+k;if(key in RCN.c)return RCN.c[key];let n=0;for(const dk in S.days){if(dk<k&&(S.days[dk].tasks||[]).some(q=>q.recurId===rid))n++}return RCN.c[key]=n}
{const _m=rcMatch;rcMatch=function(r,k,...a){if(r){if(r.pauseTo&&k<=r.pauseTo)return false;if(r.until&&k>r.until)return false;if(r.times&&rcCount(r.id,k)>=r.times&&!(S.days[k]&&(S.days[k].tasks||[]).some(q=>q.recurId===r.id)))return false}return _m(r,k,...a)}}
function rcState(r){const tk=todayKey();if(r.pauseTo&&tk<=r.pauseTo)return t('rcw.paused',dayLabel(r.pauseTo));if(r.until)return r.until<tk?t('rcw.ended'):t('rcw.until',dayLabel(r.until));if(r.times){const n=rcCount(r.id,dKey(addDays(keyToDate(tk),1)));return n>=r.times?t('rcw.ended'):t('rcw.times',n,r.times)}return''}
/* 11th-9: every repeat rule in one window */
function rcwOpen(){const L_=RC();
  openInfo(t('rcw.t'),L_.length?`<div class="rcw">${L_.map(r=>{let d='';try{d=rcDesc(r)}catch(e){}const st=rcState(r);return`<div class="rcwr" data-r="${r.id}"><div><b dir="auto">${esc(r.text||'')}</b><small>${esc(d)}${st?' · '+esc(st):''}</small></div><span class="row" style="gap:4px;flex-wrap:wrap"><button class="btn sm ghost" data-a="ed">${esc(t('rcw.edit'))}</button><button class="btn sm ghost" data-a="pause">${esc(r.pauseTo&&r.pauseTo>=todayKey()?t('rcw.resume'):t('rcw.pause'))}</button><button class="btn sm ghost" data-a="end">${esc(t('rcw.end'))}</button><button class="btn sm ghost danger" data-a="del" aria-label="${esc(t('del'))}">✕</button></span></div>`}).join('')}</div>`:`<p class="muted">${esc(t('rcw.none'))}</p>`);
  $$('#infoBox .rcwr [data-a]').forEach(b=>b.onclick=()=>{const id=b.closest('[data-r]').dataset.r,r=RC().find(q=>q.id===id);if(!r)return;const a=b.dataset.a;
    if(a==='ed'){const v=(prompt(t('rcw.editQ'),r.text)||'').trim();if(v){r.text=v;const td=day(todayKey()).tasks.find(q=>q.recurId===id&&!q.done);if(td)td.text=v}}
    if(a==='pause'){if(r.pauseTo&&r.pauseTo>=todayKey())delete r.pauseTo;else{const n=+prompt(t('rcw.pauseQ'),'7');if(!(n>0))return;r.pauseTo=dKey(addDays(keyToDate(todayKey()),Math.min(365,Math.round(n))-1));const d=day(todayKey());d.tasks=d.tasks.filter(q=>!(q.recurId===id&&!q.done))}}
    if(a==='end'){rcwEnd(r);return}
    if(a==='del'){const i=RC().indexOf(r);RC().splice(i,1);save();rcwOpen();toastAct(t('rcw.deleted'),t('undo'),()=>{RC().splice(i,0,r);save();try{renderTasks()}catch(e){}},8000);try{renderTasks()}catch(e){}return}
    save();try{renderTasks()}catch(e){}rcwOpen()})}
function rcwEnd(r){openInfo(t('rcw.end'),`<div class="rcwe"><label><input type="radio" name="rce" value="none" ${!r.until&&!r.times?'checked':''}> ${esc(t('rcw.never'))}</label>
  <label><input type="radio" name="rce" value="date" ${r.until?'checked':''}> ${esc(t('rcw.onDate'))} <input type="date" class="in" id="rceD" value="${r.until||''}"></label>
  <label><input type="radio" name="rce" value="times" ${r.times?'checked':''}> ${esc(t('rcw.after'))} <input type="number" class="in" id="rceN" min="1" value="${r.times||10}" style="width:90px"> ${esc(t('rcw.timesW'))}</label>
  <button class="btn pri" id="rceOk">${esc(t('tdu.save'))}</button></div>`);
  $('#rceOk').onclick=()=>{const v=($('input[name="rce"]:checked')||{}).value;delete r.until;delete r.times;if(v==='date'&&$('#rceD').value)r.until=$('#rceD').value;if(v==='times'&&+$('#rceN').value>0)r.times=Math.round(+$('#rceN').value);save();try{renderTasks()}catch(e){}rcwOpen()}}

/* 11th-8: a task's history in its «⋯»; and «repeat rules» there for a repeating task */
function tkHist(k,x){const L_=[];if(x.created)L_.push(t('thi.made',gShort(new Date(x.created))));let n=0,q=x,g=0;const map=new Map();Object.values(S.days).forEach(d=>(d.tasks||[]).forEach(z=>map.set(z.id,z)));while(q&&q.fromId&&g++<60){n++;q=map.get(q.fromId)}
  if(q&&q!==x&&q.created)L_[0]=t('thi.made',gShort(new Date(q.created)));if(n)L_.push(t('thi.pp',n));if(x.done&&x.doneAt)L_.push(t('thi.done',gShort(new Date(x.doneAt))+' '+new Date(x.doneAt).toLocaleTimeString(LANG==='ar'?'ar':'en',{hour:'2-digit',minute:'2-digit'})));return L_.join(' · ')}
{const _ux=uxMenuExtras;uxMenuExtras=function(k,id,...a){const r=_ux(k,id,...a);try{const p=$('#ppPop'),x=day(k).tasks.find(q=>q.id===id);if(!p||!x||p.querySelector('.thist'))return r;
  if(x.recurId){const b=document.createElement('button');b.innerHTML=`🔁 ${esc(t('rcw.t'))}`;b.onclick=e=>{e.stopPropagation();closePP();rcwOpen()};p.append(b)}
  const h=tkHist(k,x);if(h)p.insertAdjacentHTML('beforeend',`<div class="thist">${esc(h)}</div>`)}catch(e){console.error(e)}return r}}

/* 11th-12: the current period's undone tasks first (S.settings.tkNowTop) */
{hookFn('renderTasks',()=>renderTasks,f=>{renderTasks=f},'post',function(){try{if(!S.settings.tkNowTop)return;const box=$('#tasks');if(!box)return;const k=todayKey(),p=pdlSlotOf(k,Date.now());if(!p)return;const d=day(k);
  const lis=[...box.querySelectorAll(':scope>.task[data-id]')].filter(li=>{const x=d.tasks.find(q=>q.id===li.dataset.id);return x&&!x.done&&x.after===p});if(!lis.length)return;const first=box.querySelector(':scope>li');
  lis.reverse().forEach(li=>{li.classList.add('tknow2');box.insertBefore(li,box.querySelector(':scope>li'))});void first}catch(e){}})}

/* 11th-13: process the inbox one item at a time */
function ibStep(){const L_=INB();if(!L_.length){$$('.modal.on').forEach(m=>m.classList.remove('on'));toast(t('ibs.empty'));try{renderInbBtn()}catch(e){}return}const it=L_[0];
  openInfo(t('ibs.t'),`<div class="ibs"><small class="muted">${esc(t('ibs.left',L_.length))}</small><textarea class="in" id="ibsT" rows="3" dir="auto">${esc(it.text)}</textarea>
    <div class="ibsb"><button class="btn pri" data-a="td">☑ ${esc(t('ibs.today'))}</button><button class="btn" data-a="tm">☑ ${esc(t('ibs.tom'))}</button><button class="btn" data-a="note">📝 ${esc(t('ibs.note'))}</button><button class="btn" data-a="ev">📅 ${esc(t('ibs.ev'))}</button><button class="btn ghost" data-a="skip">${esc(t('ibs.skip'))}</button><button class="btn ghost danger" data-a="del">🗑 ${esc(t('del'))}</button></div></div>`);
  $$('#infoBox .ibsb [data-a]').forEach(b=>b.onclick=()=>{const a=b.dataset.a,txt=$('#ibsT').value.trim()||it.text,rm=()=>{const i=INB().indexOf(it);if(i>=0)INB().splice(i,1)};
    if(a==='td'||a==='tm'){const k=a==='td'?todayKey():dKey(addDays(keyToDate(todayKey()),1));day(k).tasks.push({id:uid(),text:txt.slice(0,200),done:false,created:Date.now()});rm()}
    if(a==='note'){const now=Date.now();NOTES().push({id:uid(),title:txt.split('\n')[0].slice(0,80),body:txt,imgs:[],created:now,updated:now,day:todayKey()});rm();try{notesChanged()}catch(e){}}
    if(a==='ev'){rm();save();try{renderInbBtn()}catch(e){}$$('.modal.on').forEach(m=>m.classList.remove('on'));openEv(null,todayKey());EVE.title=txt.split('\n')[0].slice(0,120);renderEvEd();$('#evModal')?.classList.add('on');return}
    if(a==='skip'){INB().push(INB().shift())}
    if(a==='del')rm();save();try{renderTasks();renderInbBtn()}catch(e){}ibStep()})}
{hookFn('renderInbox',()=>renderInbox,f=>{renderInbox=f},'post',function(){try{const box=$('#ibBox');if(!box||!INB().length||$('#ibsGo'))return;box.querySelector('small')?.insertAdjacentHTML('afterend',`<div><button class="btn sm pri" id="ibsGo">▶ ${esc(t('ibs.go',INB().length))}</button></div>`);$('#ibsGo').onclick=()=>{$('#ibModal').classList.remove('on');ibStep()}}catch(e){}})}

/* 11th-14: Hijri dates in the smart task line: «15 رمضان», «أول شعبان», «1 shawwal» → the next such day */
const HPM=[['محرم|المحرم|muharram'],['صفر|safar'],['ربيع الأول|ربيع الاول|rabi al-awwal|rabi i'],['ربيع الآخر|ربيع الاخر|ربيع الثاني|rabi al-thani|rabi ii'],['جمادى الأولى|جمادى الاولى|جمادي الاولى|jumada al-ula|jumada i'],['جمادى الآخرة|جمادى الاخرة|جمادى الثانية|jumada al-akhira|jumada ii'],['رجب|rajab'],['شعبان|shaban|sha\'ban'],['رمضان|ramadan'],['شوال|shawwal'],['ذو القعدة|ذي القعدة|dhul qadah|dhu al-qadah'],['ذو الحجة|ذي الحجة|dhul hijjah|dhu al-hijjah']];
function hpParse(raw){const s=' '+raw+' ';for(let m=0;m<12;m++){const re=new RegExp('(?<=\\s)(?:(\\d{1,2}|[٠-٩]{1,2})|(أول|اول|غرة|غرّة|first))\\s+(?:من\\s+)?(?:شهر\\s+)?(?:'+HPM[m][0]+')(?=\\s)','i'),x=s.match(re);if(!x)continue;
    const dd=x[1]?+String(x[1]).replace(/[٠-٩]/g,c=>'٠١٢٣٤٥٦٧٨٩'.indexOf(c)):1;if(dd<1||dd>30)continue;let d=keyToDate(todayKey());for(let i=0;i<400;i++){const h=hNum(d);if(h.m===m+1&&h.d===dd)return{d:i,text:s.replace(re,' ').replace(/\s+/g,' ').trim()};d=addDays(d,1)}}return null}
{const _p=uxParse;uxParse=function(raw,...a){const h=hpParse(String(raw||''));if(!h||!h.text)return _p(raw,...a);const r=_p(h.text,...a)||{text:h.text};if(r.d==null&&!r.rec)r.d=h.d;if(!r.d&&!r.rec&&!r.after)r.d=h.d||0;return r.text?r:null}}

/* settings rows: the current period first; every repeat rule; Ctrl+K */
{hookFn('renderSettings',()=>renderSettings,f=>{renderSettings=f},'post',function(){try{const r=$('#tkfRow');if(!r||$('#tknRow'))return;r.insertAdjacentHTML('afterend',`<div class="field" id="tknRow"><div><label data-i18n="tkn.set">${esc(t('tkn.set'))}</label><small>${esc(t('tkn.setS'))}</small></div><button class="sw-toggle ${S.settings.tkNowTop?'on':''}" id="tknT"></button></div><div class="field" id="rcwRow"><div><label data-i18n="rcw.t">${esc(t('rcw.t'))}</label><small>${esc(t('rcw.rowS'))}</small></div><button class="btn sm" id="rcwB">${esc(t('obs2.open'))}</button></div>`);
  $('#tknT').onclick=e=>{S.settings.tkNowTop=!S.settings.tkNowTop;e.currentTarget.classList.toggle('on',!!S.settings.tkNowTop);save();try{renderTasks()}catch(x){}};$('#rcwB').onclick=rcwOpen}catch(e){}})}
{const _cc=cmdCommands;cmdCommands=function(...a){const L_=_cc(...a);try{L_.push({icon:'🔁',label:t('rcw.t'),run:rcwOpen,kw:'repeat rules recurring تكرار المهام المتكررة'},{icon:'📥',label:t('ibs.t'),run:ibStep,kw:'inbox process الوارد'})}catch(e){}return L_}}

