/* ============ v3.27: library group 4 — «lesson of the day» tasks from a course on the days you choose, and learning time per course and book in the Summary ============ */
/* S.lib.lod = [{ref:'d:<PC course id>'|'f:<course folder id>', n:<name>, days:[0..6 (Sunday=0)], after:'asr'}] */
function LOD(){const L_=LIBS();return L_.lod||(L_.lod=[])}
function lodLessons(ref){if(!ref)return[];const [k,id]=[ref.slice(0,1),ref.slice(2)];try{if(k==='d'){const n=libFind(id);return n?libMedia(n):[]}if(k==='f')return lshMedia(id)}catch(e){}return[]}
function lodNext(ref){const P=LIBS().prog;return lodLessons(ref).find(x=>!(P[x.id]&&P[x.id].done))||null}
const lodId=(ref,k)=>'lod-'+bkHash(ref)+'-'+k;
/* today's task for each course whose day it is; a fixed id, so two devices never make two */
function ensureLod(){try{const k=todayKey(),wd=keyToDate(k).getDay(),d=day(k);let ch=false;
  LOD().forEach(o=>{if(!(o.days||[]).includes(wd))return;const id=lodId(o.ref,k);if(d.tasks.some(x=>x.id===id))return;const nx=lodNext(o.ref);
    if(LIB.tree&&LIB.tree.length&&!nx&&lodLessons(o.ref).length)return; /* the course is finished */
    d.tasks.push({id,text:nx?t('lod.task',lrnName(nx.id)||libTitle(nx.n)):t('lod.taskC',o.n),done:false,created:Date.now(),auto:'lod',lod:o.ref,lodN:o.n,...(nx?{lib:nx.id}:{}),...(o.after?{after:o.after}:{})});ch=true});
  if(ch){save();try{renderTasks()}catch(e){}}}catch(e){console.error(e)}}
/* a lesson of that course finished today ticks the task */
function lodCheck(){try{const k=todayKey(),d=S.days[k];if(!d||!d.tasks)return;const t0=keyToDate(k).getTime(),P=LIBS().prog;let ch=false;
  d.tasks.forEach(x=>{if(x.auto!=='lod'||x.done)return;const ids=new Set(lodLessons(x.lod).map(z=>z.id));
    const hit=Object.entries(P).some(([id,p])=>p&&p.done&&p.at>=t0&&(ids.size?ids.has(id):(x.lod.startsWith('d:')&&p.c===x.lodN)));if(hit){x.done=true;x.doneAt=Date.now();ch=true}});
  if(ch){save();try{renderTasks()}catch(e){}}}catch(e){}}
/* a ▶ on tasks that point to a lesson (lesson of the day, or any task linked to one) */
function lodPlay(x){const go=async()=>{if(!LIB.base){try{await libConnect()}catch(e){}}if(!LIB.base){toast(t('lb.off'));return}let id=x.lib;const nx=x.lod?lodNext(x.lod):null;if(nx)id=nx.id;if(!id){showView('lib');return}showView('lib');if(x.lod&&x.lod.startsWith('f:'))LIBX.ctx=x.lod.slice(2);libPlay(id)};go()}
{const _tm=taskMeta;taskMeta=function(x,...a){let h=_tm(x,...a);try{if(x&&!x.done&&(x.lib||x.lod))h+=`<button class="tklib" data-lodp="${esc(x.id)}" title="${esc(t('lod.play'))}">▶ ${t('lod.play')}</button>`}catch(e){}return h}}
{const _rt=renderTasks;renderTasks=function(...a){const r=_rt(...a);try{const d=day(todayKey());$$('#tasks [data-lodp]').forEach(b=>b.onclick=e=>{e.stopPropagation();const x=d.tasks.find(q=>q.id===b.dataset.lodp);if(x)lodPlay(x)})}catch(e){}return r}}
/* the setting: a 📅 button on a PC course page and on a course folder */
function lodPop(anchor,ref,name){const o=LOD().find(z=>z.ref===ref)||{ref,n:name,days:[],after:'asr'},days=new Set(o.days),wd=[6,0,1,2,3,4,5];
  const r=anchor.getBoundingClientRect(),p=qPopAt(`<div class="aymh">📅 ${t('lod.t')}</div><p class="muted lodp">${t('lod.sub')}</p><div class="lodd">${wd.map(i=>`<button data-wd="${i}" class="${days.has(i)?'on':''}">${esc((LOC[LANG]||LOC.ar).sdays[i])}</button>`).join('')}</div>
    <div class="pdlt-row"><span class="muted">${t('lod.after')}</span><select class="in" id="lodA">${['fajr','dhuhr','asr','maghrib','isha'].map(q=>`<option value="${q}" ${o.after===q?'selected':''}>${esc(tpaLabel(q))}</option>`).join('')}</select></div>
    <div class="pdlt-act"><button class="btn sm pri" id="lodOk">${t('pdl.save')}</button>${LOD().some(z=>z.ref===ref)?`<button class="btn sm ghost" id="lodNo">${t('lod.off')}</button>`:''}</div>`,r.left+r.width/2,r.bottom-6,'aymenu pdltm');
  p.querySelectorAll('[data-wd]').forEach(b=>b.onclick=()=>{const i=+b.dataset.wd;days.has(i)?days.delete(i):days.add(i);b.classList.toggle('on',days.has(i))});
  p.querySelector('#lodOk').onclick=()=>{closePP();const L=LOD().filter(z=>z.ref!==ref);if(days.size)L.push({ref,n:name,days:[...days].sort(),after:p.querySelector('#lodA').value});LIBS().lod=L;save();ensureLod();renderLib();toast(days.size?t('lod.on',days.size):t('lod.offT'))};
  const no=p.querySelector('#lodNo');if(no)no.onclick=()=>{closePP();LIBS().lod=LOD().filter(z=>z.ref!==ref);save();renderLib();toast(t('lod.offT'))}}
{const _rl=renderLib;renderLib=function(...a){const r=_rl(...a);try{const o=String(LIB.open||'');let host=null,ref=null,name='';
  if(o&&!o.startsWith('f:')&&!o.startsWith('au:')&&libFind(o)){host=$('#libBox .lbbar #lshPcM');ref='d:'+o;name=(libFind(o)||{}).n||''}
  else if(o.startsWith('f:')){const f=lshGet(o.slice(2));if(f){host=$('#lshMore');ref=o;name=f.n}}
  if(host&&!$('#lodBtn')){const on=LOD().some(z=>z.ref===ref);host.insertAdjacentHTML('beforebegin',`<button class="btn sm ${on?'pri':'ghost'}" id="lodBtn" title="${esc(t('lod.t'))}">📅${on?' '+t('lod.onShort'):''}</button>`);$('#lodBtn').onclick=e=>{e.stopPropagation();lodPop(e.currentTarget,ref,name)}}}catch(e){console.error(e)}return r}}
{const _rt2=renderToday;renderToday=function(...a){try{ensureLod();lodCheck()}catch(e){}return _rt2(...a)}}
{const _ls=libSave;libSave=function(...a){const r=_ls(...a);try{if(a[2]||(LIB.cur&&LIBS().prog[LIB.cur.id]&&LIBS().prog[LIB.cur.id].done))lodCheck()}catch(e){}return r}}
setTimeout(()=>{ensureLod();lodCheck()},2500);
/* ---------- learning time in the Summary (L5) ---------- */
function learnStats(keys){const C={},B={},t0=keyToDate(keys[0]).getTime(),t1=keyToDate(keys[keys.length-1]).getTime()+864e5,P=LIBS().prog;
  keys.forEach(k=>((S.days[k]||{}).media||[]).forEach(m=>{if(!m.lib)return;if(String(m.lib).startsWith('bk:')){const b=B[m.title]||(B[m.title]={n:m.title,min:0});b.min+=m.minutes||0}else{const cn=String(m.title||'').split(' — ')[0];const c=C[cn]||(C[cn]={n:cn,min:0,done:0});c.min+=m.minutes||0}}));
  Object.values(P).forEach(p=>{if(p&&p.done&&p.at>=t0&&p.at<t1&&p.c){const c=C[p.c]||(C[p.c]={n:p.c,min:0,done:0});c.done++}});
  return{courses:Object.values(C).sort((a,b)=>b.min-a.min),books:Object.values(B).sort((a,b)=>b.min-a.min)}}
{const _rb=renderBrief;renderBrief=function(...a){const r=_rb(...a);try{let card=$('#bLearn');const media=$('#bMedia');if(!media)return r;
  if(!card){media.closest('.card').insertAdjacentHTML('afterend',`<div class="card" id="bLearn" style="margin-bottom:18px"></div>`);card=$('#bLearn')}
  const L=learnStats(periodKeys(bMode,bAnchor)),all=[...L.courses,...L.books],mx=Math.max(1,...all.map(x=>x.min)),tot=all.reduce((s,x)=>s+x.min,0);
  if(!all.length){card.innerHTML=`<h3>📚 ${t('ls.t')}</h3><div class="empty">${t('ls.none')}</div>`;return r}
  const row=(x,ic)=>`<div class="brow lsr"><span class="nm" dir="auto">${ic} ${esc(x.n)}</span><span class="bar"><i style="width:${x.min/mx*100}%;background:var(--accent)"></i></span><span class="tm">${fmtHM(x.min*6e4)}</span><span class="pc">${x.done?t('ls.done',x.done):''}</span></div>`;
  card.innerHTML=`<h3><span>📚 ${t('ls.t')}</span><span style="font-size:12px;color:var(--muted)">${fmtHM(tot*6e4)}</span></h3>${L.courses.length?`<div class="lsh">${t('ls.courses')}</div>${L.courses.map(x=>row(x,'🎬')).join('')}`:''}${L.books.length?`<div class="lsh">${t('ls.books')}</div>${L.books.map(x=>row(x,'📖')).join('')}`:''}`}catch(e){console.error(e)}return r}}

