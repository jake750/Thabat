/* ============ v3.85.0: library group, part 1 — chapters inside a video, a frame into the lesson note, lesson rating and «important», searching the lesson notes, time left at your pace, a reminder for an idle course ============ */
/* S.lib.meta[lessonId]: chp = [[seconds, name]], stars = 1..5, imp = 1 (all synced with S.lib) */
function lxMeta(id){const L_=LIBS();if(!L_.meta)L_.meta={};return L_.meta[id]||(L_.meta[id]={})}
function lxGet(id){return(LIBS().meta||{})[id]||{}}

/* item 106: named chapters (timestamps) in a lesson, shown as chips under the title and gold marks on the timeline */
function lxcList(id){return(lxGet(id).chp||[]).slice().sort((a,b)=>a[0]-b[0])}
function lxcAt(id,sec){let c=null;for(const x of lxcList(id)){if(x[0]<=sec+.5)c=x;else break}return c}
function lxcAdd(){const v=$('#lvV'),it=LIB.cur;if(!v||!it)return;const sec=Math.floor(v.currentTime||0),was=!v.paused;v.pause();
  const n=prompt(t('lxc.name',fmtTC(sec)),'');if(was)v.play().catch(()=>{});if(n==null||!n.trim())return;
  const m=lxMeta(it.id);m.chp=(m.chp||[]).filter(c=>c[0]!==sec);m.chp.push([sec,n.trim().slice(0,80)]);save();lxcPaint();toast(t('lxc.added',fmtTC(sec)))}
function lxcDel(sec){const it=LIB.cur;if(!it)return;const m=lxMeta(it.id),old=(m.chp||[]).slice();m.chp=old.filter(c=>c[0]!==sec);save();lxcPaint();toastAct(t('lxc.deleted'),t('undo'),()=>{lxMeta(it.id).chp=old;save();lxcPaint()})}
function lxcPaint(){const it=LIB.cur,col=$('#libPlayer .lpvinfo');if(!it||!col)return;const L_=lxcList(it.id),v=$('#lvV');let s=col.querySelector('.lxchs');
  if(!L_.length){if(s)s.remove()}else{if(!s){s=document.createElement('div');s.className='lxchs';col.querySelector('.lpvttl').after(s);
      s.addEventListener('click',e=>{const x=e.target.closest('[data-cx]');if(x){e.stopPropagation();lxcDel(+x.dataset.cx);return}const b=e.target.closest('[data-cs]');if(b&&v){v.currentTime=+b.dataset.cs;v.play().catch(()=>{})}})}
    s.innerHTML=L_.map(([sec,n])=>`<span class="lxch" data-ct="${sec}"><button data-cs="${sec}"><i dir="ltr">${fmtTC(sec)}</i> <b dir="auto">${esc(n)}</b></button><button class="lxchx" data-cx="${sec}" aria-label="${esc(t('lxc.del'))}" title="${esc(t('lxc.del'))}">✕</button></span>`).join('');lxcNow()}
  const tl=$('#libPlayer .lpvmarks');if(tl){let mk=tl.parentElement.querySelector('.lxchm');if(!mk){mk=document.createElement('div');mk.className='lxchm';tl.after(mk)}const d=v&&v.duration;
    mk.innerHTML=d&&isFinite(d)?L_.filter(c=>c[0]<=d).map(([sec,n])=>`<i style="left:${sec/d*100}%" title="${esc(fmtTC(sec)+' · '+n)}"></i>`).join(''):''}}
function lxcNow(){const it=LIB.cur,v=$('#lvV'),s=$('#libPlayer .lxchs');if(!it||!v||!s)return;const c=lxcAt(it.id,v.currentTime||0);s.querySelectorAll('.lxch').forEach(x=>x.classList.toggle('on',!!c&&+x.dataset.ct===c[0]))}

/* item 109: the picture under the playhead goes into the lesson's note, with its minute */
async function lxsFrame(v){const draw=src=>{const w=Math.min(1600,src.videoWidth||0),h=Math.round(w*(src.videoHeight||0)/(src.videoWidth||1));if(!w||!h)throw new Error('size');const c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(src,0,0,w,h);return c.toDataURL('image/jpeg',.84)};
  try{return draw(v)}catch(e){}
  /* the playing video may not allow reading its pixels: a hidden copy that does (the library server allows it) seeks to the same moment */
  return await new Promise((res,rej)=>{const h=document.createElement('video');h.muted=true;h.preload='auto';h.crossOrigin='anonymous';h.playsInline=true;const tm=setTimeout(()=>{h.removeAttribute('src');rej(new Error('timeout'))},12000);
    h.onloadedmetadata=()=>{h.currentTime=v.currentTime||0};h.onseeked=()=>{clearTimeout(tm);try{res(draw(h))}catch(e){rej(e)}finally{h.removeAttribute('src');h.load()}};h.onerror=()=>{clearTimeout(tm);rej(new Error('load'))};h.src=v.currentSrc||v.src})}
async function lxsShot(){const v=$('#lvV'),it=LIB.cur;if(!v||!it)return;const sec=v.currentTime||0;let d;try{d=await lxsFrame(v)}catch(e){toast(t('lxs.fail'));return}
  const iid=uid();try{await idbSet('nimg:'+iid,d)}catch(e){toast(t('toast.saveFail'));return}if(typeof nImgMem!=='undefined')nImgMem[iid]=d;
  const n=lpvAddNote(it.id,sec,'📷 '+t('lxs.line'));n.imgs=(n.imgs||[]).concat(iid);n.updated=Date.now();save();try{lpvMarksPaint();lpvSide()}catch(e){}
  try{const f=$('#libPlayer .lpvmain');if(f){f.classList.remove('lxsflash');void f.offsetWidth;f.classList.add('lxsflash')}}catch(e){}toast(t('lxs.saved',fmtTC(sec)))}

/* item 112: rating 1–5 and «important», in the player and the lesson «⋯»; marks on lesson rows; important lessons on the library home */
function lxrSet(id,k,v){const m=lxMeta(id);if(k==='stars')m.stars=m.stars===v?0:v;else m.imp=m.imp?0:1;if(!m.stars)delete m.stars;if(!m.imp)delete m.imp;save();lxrPaint();try{lxrRows()}catch(e){}}
function lxrHTML(id){const m=lxGet(id),s=m.stars||0;return`<span class="lxrs" role="group" aria-label="${esc(t('lxr.rate'))}">${[1,2,3,4,5].map(i=>`<button data-lxr="${i}" class="${i<=s?'on':''}" aria-label="${i}" title="${esc(t('lxr.rate'))} ${i}/5">★</button>`).join('')}</span><button class="lpva lxrimp${m.imp?' on':''}" data-lxi="1" aria-pressed="${!!m.imp}">❗ <span>${esc(t(m.imp?'lxr.impOn':'lxr.imp'))}</span></button>`}
function lxrPaint(){const it=LIB.cur,a=$('#libPlayer .lpvacts');if(!it||!a)return;let r=a.querySelector('.lxrbox');if(!r){r=document.createElement('span');r.className='lxrbox';a.append(r);
    r.addEventListener('click',e=>{const b=e.target.closest('[data-lxr],[data-lxi]');if(!b||!LIB.cur)return;if(b.dataset.lxr)lxrSet(LIB.cur.id,'stars',+b.dataset.lxr);else lxrSet(LIB.cur.id,'imp')})}
  r.innerHTML=lxrHTML(it.id)}
function lxrRows(){$$('#libBox .lbl[data-play]').forEach(el=>{const m=lxGet(el.dataset.play);let b=el.querySelector(':scope>.lxrb');const h=(m.imp?'❗':'')+(m.stars?'★'+m.stars:'');
  if(!h){if(b)b.remove();return}if(!b){b=document.createElement('span');b.className='lxrb';el.append(b)}b.textContent=h;b.title=(m.imp?t('lxr.impOn')+' ':'')+(m.stars?t('lxr.rate')+' '+m.stars+'/5':'')})}
function lxrImpList(){const M=LIBS().meta||{},out=[];if(!LIB.tree)return out;Object.keys(M).forEach(id=>{if(!M[id].imp)return;const it=libItem(id);if(it)out.push(it)});return out}
{const _m=lshItemMenu;lshItemMenu=function(anchor,ref,...a){const p=_m(anchor,ref,...a);try{const pp=$('#ppPop'),it=ref&&libItem(ref.id);
  if(pp&&it&&(it.k==='v'||it.k==='a')&&!pp.querySelector('.lxrm')){pp.insertAdjacentHTML('afterbegin',`<div class="lxrm">${lxrHTML(ref.id)}</div><div class="aymh"></div>`);
    pp.querySelector('.lxrm').addEventListener('click',e=>{const b=e.target.closest('[data-lxr],[data-lxi]');if(!b)return;e.stopPropagation();if(b.dataset.lxr)lxrSet(ref.id,'stars',+b.dataset.lxr);else lxrSet(ref.id,'imp');pp.querySelector('.lxrm').innerHTML=lxrHTML(ref.id)})}}catch(e){}return p}}

/* item 113: the library search also finds lines of the lesson notes («- [m:ss] text») and opens the lesson at that minute */
function lxnHits(q){const s=lshNorm(q).trim();if(s.length<2)return[];const out=[];for(const n of NOTES()){if(!n.lib)continue;const lines=String(n.body||'').split('\n');
  for(const l of lines){LPV_RE.lastIndex=0;const m=LPV_RE.exec(l);if(!m)continue;if(lshNorm(m[2]).includes(s))out.push({id:n.lib,sec:lpvSec(m[1]),ts:m[1],tx:m[2],les:String(n.title||'').replace(/^🎬\s*/,''),c:n.libC||''});if(out.length>=60)return out}}return out}
{const _ls=lshSearch;lshSearch=function(q,...a){const h=_ls(q,...a);try{const H=lxnHits(q);if(!H.length)return h;
  return h+`<div class="lxnh"><h4>📝 ${esc(t('lxn.t',H.length))}</h4>${H.map(x=>`<button class="lxnr" data-lxn="${esc(x.id)}" data-lxs="${x.sec}"><i dir="ltr">${esc(x.ts)}</i><span><b dir="auto">${esc(x.tx)}</b><small dir="auto">${esc(x.les)}${x.c?' · '+esc(x.c):''}</small></span></button>`).join('')}</div>`}catch(e){return h}}}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-lxn]');if(!b)return;e.preventDefault();e.stopPropagation();lpvOpenAt(b.dataset.lxn,+b.dataset.lxs)},true);

/* item 111: «at your pace» — the minutes you watched of these lessons in the last 14 days against the time still left */
function lxpPace(ids){const S_=new Set(ids),today=logicalDate(Date.now());let min=0,days=0;for(let i=0;i<14;i++){const k=dKey(addDays(today,-i)),d=S.days[k];if(!d||!d.media)continue;let got=0;d.media.forEach(m=>{if(m.lib&&S_.has(m.lib))got+=+m.minutes||0});if(got){min+=got;days++}}return{min,days}}
{hookFn('ldurPaint',()=>ldurPaint,f=>{ldurPaint=f},'post',function(){try{const bar=$('#ldurBar');if(!bar||bar.querySelector('.lxp'))return;const box=$('#libBox'),ids=[...box.querySelectorAll('.lbl[data-play]')].map(r=>r.dataset.play),L_=LIBS();
  let left=0;ids.forEach(id=>{const d=ldurOf(id),p=L_.prog[id]||{};if(d&&!p.done)left+=Math.max(0,d-(p.p||0))});if(!left)return;const{min,days}=lxpPace(ids);
  const tx=min>=5?t('lxp.pace',Math.max(1,Math.ceil(left/60/(min/14))),fmtHM(min/14*6e4)):t('lxp.none');bar.insertAdjacentHTML('beforeend',` <span class="lxp" title="${esc(t('lxp.tip',days))}">· ${esc(tx)}</span>`)}catch(e){}})}

/* item 110: a course you started and left for a week gets a chip on Today (one at a time; tapping opens it; «later» hides it for a week) */
function lxiIdle(){if(!LIB.tree)return null;const P=LIBS().prog,now=Date.now(),seen=lxiSeen();let best=null;
  for(const c of lxCourseAll()){const m=libMedia(c).filter(x=>x.k==='v'||x.k==='a');if(!m.length)continue;const st=m.filter(x=>P[x.id]&&(P[x.id].done||P[x.id].p>10));if(!st.length)continue;
    const done=m.filter(x=>P[x.id]&&P[x.id].done).length;if(done===m.length)continue;const last=Math.max(...m.map(x=>(P[x.id]&&P[x.id].at)||0));const age=(now-last)/864e5;
    if(!last||age<7||age>60)continue;if(seen[c.id]&&now-seen[c.id]<7*864e5)continue;if(!best||last>best.last)best={id:c.id,n:c.n,last,days:Math.floor(age),pct:Math.round(done/m.length*100)}}return best}
function lxiSeen(){try{return JSON.parse(localStorage.getItem('thabat.lxIdle')||'{}')||{}}catch(e){return{}}}
function lxiHide(id){const o=lxiSeen();o[id]=Date.now();try{localStorage.setItem('thabat.lxIdle',JSON.stringify(o))}catch(e){}}
{hookFn('renderTodayEv',()=>renderTodayEv,f=>{renderTodayEv=f},'post',function(){try{const box=$('#todayEv');if(!box||box.querySelector('[data-lxi]'))return;const c=lxiIdle();if(!c)return;
  box.insertAdjacentHTML('beforeend',`<span class="evchip lxichip" data-lxi="${esc(c.id)}" style="--c:#7c6cf0" title="${esc(t('lxi.tip',c.pct))}"><i></i>🎬 ${esc(t('lxi.chip',libTitle(c.n),c.days))}<button class="lxix" data-lxix="1" aria-label="${esc(t('lxi.later'))}" title="${esc(t('lxi.later'))}">✕</button></span>`);
  const el=box.querySelector('[data-lxi]');el.onclick=e=>{if(e.target.closest('[data-lxix]')){e.stopPropagation();lxiHide(c.id);el.remove();return}lxiHide(c.id);LIB.open=c.id;showView('lib');try{renderLib()}catch(x){}}}catch(e){}})}

/* the player: chapter and snapshot buttons, the rating; chapters follow the playhead */
{hookFn('lpvBuild',()=>lpvBuild,f=>{lpvBuild=f},'post',function(){try{const a=$('#libPlayer .lpvacts');if(!a)return;
  if(!a.querySelector('#lxcB')){$('#lpvNoteB').insertAdjacentHTML('afterend',`<button class="lpva" id="lxcB" title="${esc(t('lxc.add'))}">🏷 <span>${esc(t('lxc.btn'))}</span></button><button class="lpva" id="lxsB" title="${esc(t('lxs.btn'))}">📷 <span>${esc(t('lxs.btn'))}</span></button>`);
    $('#lxcB').onclick=lxcAdd;$('#lxsB').onclick=lxsShot}
  lxrPaint();lxcPaint();const v=$('#lvV');if(v&&!v._lxc){v._lxc=1;v.addEventListener('timeupdate',lxcNow);v.addEventListener('loadedmetadata',lxcPaint);v.addEventListener('durationchange',lxcPaint)}}catch(e){console.error(e)}})}
{hookFn('lpvMarksPaint',()=>lpvMarksPaint,f=>{lpvMarksPaint=f},'post',function(){try{lxcPaint()}catch(e){}})}
{hookFn('renderLib',()=>renderLib,f=>{renderLib=f},'post',function(){try{lxrRows();
  if(!LIB.open&&LIB.tree){const L_=lxrImpList(),box=$('#libBox');let h=$('#lxrImpBox');if(!L_.length){if(h)h.remove();return}if(!box)return;
    const html=`<h3 class="lxrh">❗ ${esc(t('lxr.impT',L_.length))}</h3><div class="lxril">${L_.slice(0,12).map(it=>`<button class="lxri" data-lxplay="${esc(it.id)}"><b dir="auto">${esc(libTitle(it.n))}</b><small dir="auto">${esc(libTitle(it.course.n))}${lxGet(it.id).stars?' · ★'+lxGet(it.id).stars:''}</small></button>`).join('')}</div>`;
    if(!h){h=document.createElement('section');h.id='lxrImpBox';h.className='lxrimpbox';const anchor=box.querySelector('#lxPaused')||box.querySelector('.lcw')||null;if(anchor)anchor.before(h);else{const lp=$('#lpath');(lp&&lp.parentElement===box?lp:box.firstElementChild||box).after(h)}
      h.addEventListener('click',e=>{const b=e.target.closest('[data-lxplay]');if(b)libPlay(b.dataset.lxplay)})}h.innerHTML=html}}catch(e){}})}
