/* ============ v3.32: calendar day panel — tick past tasks, Quran for any day, edit and delete sessions; mushaf filter fix ============ */
/* a page image pre-filtered for one reading light (paper/night) must not stay when the light changes */
function qPreFix(){const r=S.quran.riwaya;$$('#spread .qimg img[data-p].pre').forEach(im=>{im.classList.remove('pre');const f=qFilterOf(im);if((im.dataset.pf||'')===f){im.classList.add('pre');return}delete im.dataset.pf;qLoadImg(im,+im.dataset.p,r)})}
{hookFn('renderQuran',()=>renderQuran,f=>{renderQuran=f},'post',function(...a){try{qPreFix()}catch(e){}})}

/* tasks of any past day can be ticked or unticked */
function dtToggle(k,id){const d=S.days[k],x=d&&d.tasks.find(q=>q.id===id);if(!x)return;x.done=!x.done;x.doneAt=x.done?(k===todayKey()?Date.now():keyToDate(k).getTime()+20*36e5):null;save();if(x.done)chimeSoft();renderCal();if(k===todayKey())renderTasks()}

/* Quran of a day: wird, memorizing and review can be set for a past day too */
function dqToggle(k,kind){if(k===todayKey()){qToggle(kind);renderCal();return}const q=qDay(k),Q=S.quran;
  if(kind==='wird')q.wird=!qWirdDone(q);
  else if(kind==='hifz')q.hifz=!q.hifz;
  else if(kind==='review'){if(!q.review){if(!qMem().length)return;q.rv=qReviewSuggest();Q.reviewPtr+=q.rv.length;q.review=true}else{Q.reviewPtr=Math.max(0,Q.reviewPtr-(q.rv?q.rv.length:0));q.review=false;q.rv=null}}
  if(kind!=='wird'||q.wird)chimeSoft(1175);save();renderQAll();renderCal()}
function dqHTML(k){const d=S.days[k],q=(d&&d.quran)||{},g=qPgsOf(k),w=qWirdDone(q),mem=qMem().length;
  const row=(kind,on,lab,sub)=>`<div class="dq-r"><button class="dq-ck ${on?'on':''}" data-dq="${kind}" aria-pressed="${on}" title="${esc(on?t('dq.unmark'):t('dq.mark'))}">${ICON_CHECK}</button><div class="dq-t"><span>${lab}</span>${sub?`<small>${sub}</small>`:''}</div></div>`;
  return`<div class="sec dq43"><b>${t('d.quran')}</b>`+
   row('wird',w,t('dq.wird'),(S.quran.wirdU==='min'?t('wm.sub',qWirdMinOf(q),+S.quran.wirdM||20):t('dq.wirdS',q.read||0,S.quran.wird)))+
   row('hifz',!!q.hifz,t('d.qHifz'),q.hifzPages&&q.hifzPages.length?t('q.pageS')+' '+rangesStr(q.hifzPages):'')+
   (mem||q.review?row('review',!!q.review,t('d.qReview'),q.rv&&q.rv.length?t('q.pageS')+' '+rangesStr(q.rv):''):'')+
   (g.length?`<div class="dq-pg"><span>${t('dq.pages',g.length)}</span><small dir="auto">${rangesStr(g)}</small></div>`:'')+`</div>`}

/* sessions of a day: list by category, edit (category, from, to, note) and delete with undo */
function dsAfter(k){save();renderCal();if(k===todayKey()){try{renderGlass();renderLog();renderMedia()}catch(e){}}}
function dsDel(k,id){const d=day(k),s=d.sessions.find(x=>x.id===id);if(!s)return;d.sessions=d.sessions.filter(x=>x.id!==id);if(s.mediaId){const m=(d.media||[]).find(x=>x.id===s.mediaId);if(m)m.counted=false}
  dsAfter(k);toastAct(t('undo.sess'),t('undo'),()=>{const dd=day(k);dd.sessions.push(s);dd.sessions.sort((a,b)=>a.start-b.start);dsAfter(k);if(DSX.cat!=null)dsOpen(k,DSX.cat)},10000)}
const DSX={k:null,cat:null};
function dsHM(ms){const d=new Date(ms);return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')}
function dsRowHTML(s){const c=catOf(s.cat);return`<div class="ds-r" data-sid="${s.id}"><i class="dot" style="background:${c.color}"></i><div class="ds-t"><b>${esc(s.note||kidName(catRaw(s.cat)||c))}</b><small><span dir="ltr">${fmtT(s.start)} – ${fmtT(s.end)}</span> · ${fmtHM(s.end-s.start)}${s.note?' · '+esc(kidName(catRaw(s.cat)||c)):''}</small></div><button class="btn sm ghost ds-b" data-dse="${s.id}" title="${esc(t('edit'))}">✎</button><button class="btn sm ghost ds-b ds-del" data-dsd="${s.id}" title="${esc(t('del'))}">✕</button></div>`}
function dsFormHTML(s){return`<div class="ds-f" data-sid="${s.id}"><label>${t('ds.cat')}<select class="in" data-f="cat">${catOptions(s.cat)}</select></label><div class="ds-ft"><label>${t('ds.from')}<input class="in" type="time" data-f="a" value="${dsHM(s.start)}"></label><label>${t('ds.to')}<input class="in" type="time" data-f="b" value="${dsHM(s.end)}"></label></div><label>${t('ds.note')}<input class="in" data-f="n" dir="auto" value="${esc(s.note||'')}"></label><div class="ds-fa"><button class="btn sm" data-dsc>${t('cancel')}</button><button class="btn sm pri" data-dss="${s.id}">${t('ds.save')}</button></div></div>`}
function dsSave(k,id,box){const d=day(k),s=d.sessions.find(x=>x.id===id);if(!s)return;const v=n=>box.querySelector(`[data-f="${n}"]`).value;
  const at=(hm,base)=>{const [h,m]=hm.split(':').map(Number);const x=new Date(base);x.setHours(h||0,m||0,0,0);return x.getTime()};
  let a=at(v('a'),s.start),b=at(v('b'),s.start);if(b<=a)b+=864e5;
  if(b-a<6e4||b-a>18*36e5){toast(t('ds.bad'));return}
  const bak=JSON.parse(JSON.stringify(s));s.cat=v('cat');s.start=a;s.end=b;const n=v('n').trim();if(n)s.note=n;else delete s.note;
  const nk=keyOf(a);if(nk!==k){d.sessions=d.sessions.filter(x=>x.id!==id);day(nk).sessions.push(s);day(nk).sessions.sort((x,y)=>x.start-y.start)}else d.sessions.sort((x,y)=>x.start-y.start);
  dsAfter(k);if(nk!==k)dsAfter(nk);
  toastAct(t('ds.saved'),t('undo'),()=>{[k,nk].forEach(q=>{const dd=day(q);dd.sessions=dd.sessions.filter(x=>x.id!==id)});day(k).sessions.push(bak);day(k).sessions.sort((x,y)=>x.start-y.start);dsAfter(k);if(nk!==k)dsAfter(nk);if(DSX.cat!=null)dsOpen(k,DSX.cat)},10000);
  if(DSX.cat!=null)dsOpen(k,DSX.cat)}
/* cat: a top category id (all its sub-categories), 'sub:<id>' one sub-category, or 'note:<session id>' one activity */
function dsOpen(k,cat,editId){DSX.k=k;DSX.cat=cat;const d=S.days[k];let ss=d?d.sessions.slice():[];let title;
  if(cat.startsWith('note:')){const id=cat.slice(5);ss=ss.filter(x=>x.id===id);title=t('d.acts')}
  else if(cat.startsWith('sub:')){const id=cat.slice(4);ss=ss.filter(x=>x.cat===id);title=esc(kidName(catRaw(id)||catOf(id)))}
  else{ss=ss.filter(x=>topOf(x.cat)===cat);title=esc(kidName(catRaw(cat)||catOf(cat)))}
  ss.sort((a,b)=>a.start-b.start);
  openInfo(`${title} <small class="ds-day">${gStr(keyToDate(k))}</small>`,ss.length?`<div class="ds-list">${ss.map(s=>s.id===editId?dsFormHTML(s):dsRowHTML(s)).join('')}</div><p class="ds-hint">${t('ds.hint')}</p>`:`<div class="empty">${t('ds.none')}</div>`);
  const box=$('#infoBox');box.classList.add('dsbox');const off=()=>{box.classList.remove('dsbox')};$('#infoX').addEventListener('click',off,{once:true});
  box.querySelectorAll('[data-dse]').forEach(b=>b.onclick=()=>dsOpen(k,cat,b.dataset.dse));
  box.querySelectorAll('[data-dsd]').forEach(b=>b.onclick=()=>{dsDel(k,b.dataset.dsd);if(cat.startsWith('note:'))$('#infoModal').classList.remove('on');else dsOpen(k,cat)});
  box.querySelectorAll('[data-dsc]').forEach(b=>b.onclick=()=>dsOpen(k,cat));
  box.querySelectorAll('[data-dss]').forEach(b=>b.onclick=()=>dsSave(k,b.dataset.dss,b.closest('.ds-f')));
  if(editId){const f=box.querySelector('.ds-f select');if(f)f.focus()}}

{const _rd=renderDetail;renderDetail=function(k){const r=_rd(k);try{const det=$('#detail');if(!det)return r;
  /* Quran: one clear section, shown for today and past days even when nothing was logged */
  const secs=[...det.querySelectorAll('.sec')],qs=secs.find(s=>{const b=s.querySelector(':scope>b');return b&&b.textContent.trim()===t('d.quran')});
  const old=det.querySelector('.qrdsec');if(old)old.remove();
  if(k<=todayKey()){const html=dqHTML(k);if(qs)qs.outerHTML=html;else{const tsk=secs.find(s=>s.querySelector('.dtask'))||det.querySelector('.addday')||det.querySelector('.vacrow');if(tsk)tsk.insertAdjacentHTML('beforebegin',html);else det.insertAdjacentHTML('beforeend',html)}}
  else if(qs)qs.remove();
  det.querySelectorAll('[data-dq]').forEach(b=>b.onclick=()=>dqToggle(k,b.dataset.dq));
  det.querySelectorAll('[data-tck]').forEach(b=>b.onclick=e=>{e.stopPropagation();dtToggle(k,b.dataset.tck)});
  det.querySelectorAll('[data-dcat]').forEach(li=>{li.classList.add('ds-open');li.tabIndex=0;li.title=t('ds.open');const go=()=>dsOpen(k,li.dataset.dcat);li.onclick=go;li.onkeydown=e=>{if(e.key==='Enter')go()}});
  det.querySelectorAll('[data-edits]').forEach(b=>b.onclick=e=>{e.stopPropagation();dsOpen(k,'note:'+b.dataset.edits,b.dataset.edits)});
 }catch(e){console.error(e)}return r}}

