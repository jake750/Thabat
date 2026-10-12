/* ============ v3.29: the library — other video formats (made into MP4 once on the PC), the player lists every lesson of the folder, a clearer folder chooser, a guide to what the library does ============ */
/* ---------- video formats: AVI, WMV, FLV, MPEG… are converted once by the library server (ffmpeg); MKV/MOV are tried as they are and offered conversion when they do not play ---------- */
const LCV={t:0,run:null};
const LCV_EXT=/\.(avi|wmv|flv|mpg|mpeg|ts|m2ts|mts|3gp|vob|f4v|asf|divx|rmvb)$/i;
async function lcvState(id){try{const r=await libFetch(libU('/cv/state?id='+id),5000);return r.ok?await r.json():null}catch(e){return null}}
function lcvExt(n){const m=/\.([^.]+)$/.exec(n||'');return m?m[1].toUpperCase():''}
{const _lp=libPlay;libPlay=function(id,...a){const r=_lp(id,...a);try{lcvHook(id)}catch(e){console.error(e)}return r}}
function lcvHook(id){const it=LIB.cur,v=$('#lvV');if(!it||it.id!==id||!v||it.k!=='v')return;clearTimeout(LCV.t);const need=LCV_EXT.test(it.n||'');
  if(need){v.removeAttribute('src');try{v.load()}catch(e){}}
  lcvState(id).then(st=>{if(!LIB.cur||LIB.cur.id!==id)return;const s=st&&st.st&&st.st.s;if(s==='ok'){lcvUse(id);return}if(need||s==='run')lcvBox(id,st)});
  if(need)return;
  v.addEventListener('error',()=>{if(LIB.cur&&LIB.cur.id===id&&!v.dataset.cv&&v.error&&v.error.code>=3)lcvBox(id)},{once:true});
  v.addEventListener('loadedmetadata',()=>{if(LIB.cur&&LIB.cur.id===id&&!v.dataset.cv&&v.videoWidth===0)lcvBox(id,null,'nov')},{once:true});
  const chk=()=>{if(v.currentTime<4)return;v.removeEventListener('timeupdate',chk);if(LIB.cur&&LIB.cur.id===id&&!v.dataset.cv&&!v.muted&&v.volume>0&&'webkitAudioDecodedByteCount' in v&&v.webkitAudioDecodedByteCount===0)toastAct(t('lcv.noAudio'),t('lcv.fix'),()=>lcvBox(id,null,'aud'),12000)};v.addEventListener('timeupdate',chk)}
function lcvUse(id){const v=$('#lvV');if(!v||!LIB.cur||LIB.cur.id!==id)return;const t0=v.dataset.cv?0:v.currentTime;v.dataset.cv='1';const bx=$('#lcvBox');if(bx)bx.remove();
  v.addEventListener('loadedmetadata',()=>{const p=LIBS().prog[id],s=t0>1?t0:(p&&!p.done&&p.p>5&&p.p<v.duration-5?p.p:0);if(s)v.currentTime=s;v.playbackRate=LIBS().speed||1;v.play().catch(()=>{})},{once:true});
  v.src=libU('/f?cv=1&id='+id);lcvNext(id)}
/* after one lesson is ready, the next one in the list is prepared too (one at a time) */
async function lcvNext(id){const it=LIB.cur;if(!it||!it.list)return;const i=it.list.findIndex(x=>x.id===id),nx=it.list[i+1];if(!nx||!LCV_EXT.test(nx.n||''))return;const st=await lcvState(nx.id);if(st&&st.ff&&st.st&&st.st.s==='none')libFetch(libU('/cv/start?id='+nx.id),5000).catch(()=>{})}
function lcvBox(id,st,why){const wrap=$('#libPlayer .lbvw');if(!wrap||!LIB.cur||LIB.cur.id!==id)return;let bx=$('#lcvBox');if(!bx){wrap.insertAdjacentHTML('beforeend',`<div class="lcv" id="lcvBox" role="dialog"></div>`);bx=$('#lcvBox')}
  const ext=lcvExt(LIB.cur.n),s=st&&st.st?st.st.s:null;
  const head=`<b>🎞 ${esc(t(why==='nov'?'lcv.tNov':why==='aud'?'lcv.tAud':'lcv.t',ext))}</b>`;
  if(s==='run'){bx.innerHTML=`${head}<p id="lcvTx">${t('lcv.run',Math.round(st.st.p||0))}</p><div class="trxprog lcvp"><i id="lcvBar" style="width:${Math.round(st.st.p||0)}%"></i></div><p class="muted">${t('lcv.runNote')}</p><div class="lcvact"><button class="btn sm ghost" id="lcvStop">${t('lcv.stop')}</button></div>`;
    $('#lcvStop').onclick=async()=>{await libFetch(libU('/cv/cancel?id='+id),5000).catch(()=>{});clearTimeout(LCV.t);bx.remove()};lcvPoll(id);return}
  if(s==='err'){bx.innerHTML=`${head}<p class="trxerr">${t('lcv.err')}</p><div class="lcvact"><button class="btn sm pri" id="lcvGo">↻ ${t('lcv.again')}</button><button class="btn sm ghost" id="lcvX">${t('lcv.close')}</button></div>`}
  else if(st&&!st.ff){bx.innerHTML=`${head}<p>${t('lcv.noFf')}</p><div class="lcvact"><button class="btn sm ghost" id="lcvX">${t('lcv.close')}</button></div>`}
  else if(!st&&why==null&&LCV_EXT.test(LIB.cur.n||'')){bx.innerHTML=`${head}<p>${t('lcv.old')}</p><div class="lcvact"><button class="btn sm ghost" id="lcvX">${t('lcv.close')}</button></div>`}
  else bx.innerHTML=`${head}<p>${t(why==='nov'?'lcv.subNov':why==='aud'?'lcv.subAud':'lcv.sub')}</p><div class="lcvact"><button class="btn sm pri" id="lcvGo">🎞 ${t('lcv.go')}</button><button class="btn sm ghost" id="lcvX">${t('lcv.close')}</button></div><p class="muted">${t('lcv.note')}</p>`;
  const go=$('#lcvGo');if(go)go.onclick=()=>lcvStart(id);const x=$('#lcvX');if(x)x.onclick=()=>bx.remove()}
async function lcvStart(id){const bx=$('#lcvBox');if(bx)bx.innerHTML=`<p>⏳ ${t('lcv.starting')}</p>`;let st=null;
  try{const r=await libFetch(libU('/cv/start?id='+id),8000);st=r.status===428?{ff:false,st:{s:'none'}}:r.ok?await r.json():null}catch(e){}
  if(!st){if(bx)bx.innerHTML=`<p class="trxerr">${t('lcv.old')}</p>`;return}if(st.st&&st.st.s==='ok'){lcvUse(id);return}lcvBox(id,st)}
function lcvPoll(id){clearTimeout(LCV.t);LCV.t=setTimeout(async()=>{if(!LIB.cur||LIB.cur.id!==id||!$('#lcvBox'))return;const st=await lcvState(id);if(!LIB.cur||LIB.cur.id!==id)return;const s=st&&st.st&&st.st.s;
  if(s==='ok'){toast(t('lcv.ready'));lcvUse(id);return}if(s==='run'){const p=Math.round(st.st.p||0),tx=$('#lcvTx'),b=$('#lcvBar');if(tx)tx.textContent=t('lcv.run',p);if(b)b.style.width=p+'%';lcvPoll(id);return}lcvBox(id,st)},1500)}
{const _lc=libClose;libClose=function(...a){clearTimeout(LCV.t);return _lc(...a)}}
/* ---------- the player's list: every lesson of the folder on the PC, not only the one played from a folder of yours ---------- */
function lpvCourseList(id){for(const c of libCourses()){const m=libMedia(c);if(m.some(x=>x.id===id)){const cn=lrnName(c.id);return{c:cn?{...c,n:cn}:c,list:m.map(x=>({...x,course:c}))}}}return null}
{const _li=libItem;libItem=function(id){const it=_li(id);if(!it)return it;try{const pc=lpvCourseList(id);if(!pc||pc.list.length<2)return it;const same=it.list.length===pc.list.length&&it.list.every((x,i)=>x.id===pc.list[i].id);if(same)return it;
  if(it.list.length<2||LPV.scope==='pc'){it.fList=it.list.length>1?it.list:null;it.fName=it.course.n;it.list=pc.list;it.course=pc.c}else{it.pcList=pc.list;it.pcName=pc.c.n}}catch(e){console.error(e)}return it}}
{const _s=lpvSide;lpvSide=function(...a){const r=_s(...a);try{const it=LIB.cur,body=$('#lpvBody');if(!it||!body||LPV.tab!=='les')return r;const onPc=!!it.fList||(!it.pcList&&!!it.fName),fl=it.fList||(!onPc?it.list:null),pl=it.pcList||(onPc?it.list:null);if(!fl||!pl)return r;
  body.insertAdjacentHTML('afterbegin',`<div class="lpvsc" role="tablist"><button data-sc="f" class="${onPc?'':'on'}" dir="auto">📁 ${esc(onPc?it.fName:it.course.n)} · ${fl.length}</button><button data-sc="pc" class="${onPc?'on':''}" dir="auto">💻 ${esc(onPc?it.course.n:it.pcName)} · ${pl.length}</button></div>`);
  body.querySelectorAll('[data-sc]').forEach(b=>b.onclick=()=>{if(b.classList.contains('on'))return;LPV.scope=b.dataset.sc;const v=$('#lvV');if(v)libSave(v,true);libPlay(it.id)})}catch(e){console.error(e)}return r}}
/* ---------- the folder chooser: a large sheet with the folder tree, search, covers and «new folder» ---------- */
function fpClose(){const e=$('#fpk');if(e)e.remove();document.removeEventListener('keydown',fpKey,true)}
function fpKey(e){if(e.key==='Escape'&&$('#fpk')){e.preventDefault();e.stopPropagation();fpClose()}}
/* o = {title, sub, items:[{id,n,ic,depth,meta,cover,path,dis,here,sec}], onPick(item), onNew(name) → item, extra:[{l,cls,fn}]} */
function fpOpen(o){fpClose();const el=document.createElement('div');el.id='fpk';el.className='fpk';
  el.innerHTML=`<div class="fpkb" role="dialog" aria-modal="true" aria-label="${esc(o.title)}"><div class="fpkh"><b>${esc(o.title)}</b><button class="lbx" id="fpX" aria-label="✕">✕</button></div>${o.sub?`<p class="fpks" dir="auto">${esc(o.sub)}</p>`:''}
    ${o.items.filter(x=>!x.sec).length>6?`<input class="in fpq" id="fpQ" type="search" placeholder="${esc(t('fp.search'))}" dir="auto">`:''}<div class="fpl" id="fpL"></div>
    <div class="fpf">${o.onNew?`<div class="fpnew"><input class="in" id="fpN" placeholder="${esc(t('fp.newPh'))}" dir="auto"><button class="btn sm" id="fpNb">＋ ${t('lsh.newFolder')}</button></div>`:''}${(o.extra||[]).map((x,i)=>`<button class="btn sm ${x.cls||'ghost'}" data-fx="${i}">${x.l}</button>`).join('')}</div></div>`;
  document.body.append(el);el.onclick=e=>{if(e.target===el)fpClose()};$('#fpX').onclick=fpClose;document.addEventListener('keydown',fpKey,true);
  const paint=q=>{const nq=lshNorm(q||'');const its=o.items.map((x,i)=>({x,i})).filter(({x})=>!nq?true:!x.sec&&lshNorm(x.n+' '+(x.path||'')).includes(nq));
    $('#fpL').innerHTML=its.length?its.map(({x,i})=>x.sec?`<div class="fpsec">${esc(x.n)}</div>`:`<button class="fpi${x.here?' here':''}" data-i="${i}" style="--d:${nq?0:x.depth||0}" ${x.dis?'disabled':''}><span class="fpic">${x.cover?`<img src="${x.cover}" alt="">`:x.ic||'📁'}</span><span class="fpt"><b dir="auto">${esc(x.n)}</b>${(nq?x.path:x.meta)?`<small dir="auto">${esc(nq?x.path:x.meta)}</small>`:''}</span>${x.here?`<em>✓ ${t('fp.here')}</em>`:x.dis?`<em>${t('fp.cant')}</em>`:'<i class="fpgo" aria-hidden="true">›</i>'}</button>`).join(''):`<p class="muted fpnone">${t('fp.none')}</p>`;
    $$('#fpL .fpi').forEach(b=>b.onclick=()=>{const x=o.items[+b.dataset.i];if(!x||x.dis)return;fpClose();o.onPick(x)})};
  paint('');const q=$('#fpQ');if(q){q.oninput=()=>paint(q.value);if(!MOB.matches)q.focus()}
  const nb=$('#fpNb');if(nb){const mk=()=>{const n=$('#fpN').value.trim();if(!n){$('#fpN').focus();return}fpClose();const x=o.onNew(n);if(x)o.onPick(x)};nb.onclick=mk;$('#fpN').onkeydown=e=>{if(e.key==='Enter')mk()}}
  el.querySelectorAll('[data-fx]').forEach(b=>b.onclick=()=>{fpClose();o.extra[+b.dataset.fx].fn()})}
function fpShelf(bad,has){const out=[],M=LIBS().meta||{};const walk=(p,d)=>lshKids(p).forEach(f=>{const m=M[f.id]||M['f:'+f.id]||{},n=(f.items||[]).length+lshKids(f.id).length;
  out.push({id:f.id,n:f.n,ic:f.course?'🎓':'📁',depth:d,meta:t('fp.items',n),cover:m.cover,path:lshPath(f.id).map(x=>x.n).join(' › '),dis:!!(bad&&bad.has(f.id)),here:!!(has&&has(f))});walk(f.id,d+1)});walk(null,0);return out}
function fpNewShelf(n,parent,course){const f={id:uid(),n,parent:parent||null,course:!!course,items:[]};LSH().push(f);save();return{id:f.id,n:f.n}}
/* «add to a folder» on lessons, courses, books */
lshItemMenu=function(anchor,ref,inFolder){const items=fpShelf(null,f=>(f.items||[]).some(r=>r.id===ref.id));
  fpOpen({title:t('lsh.addTo'),sub:t('fp.addSub'),items,onNew:n=>fpNewShelf(n,null,ref.t==='d'),
    onPick:x=>{const f=lshGet(x.id);if(!f)return;f.items=f.items||[];if(!f.items.some(r=>r.id===ref.id))f.items.push(ref);save();toast(t('lsh.added',f.n));renderLib()},
    extra:inFolder?[{l:'✕ '+t('lsh.remove'),fn:()=>{const f=lshGet(inFolder);if(f){f.items=(f.items||[]).filter(r=>r.id!==ref.id);save();renderLib()}}}]:[]})};
/* moving a folder */
function fpMoveFolder(f){const bad=new Set(),walk=id=>{bad.add(id);lshKids(id).forEach(k=>walk(k.id))};walk(f.id);
  fpOpen({title:t('fp.moveT',f.n),items:[{id:'',n:t('lsh.mine'),ic:'🏠',depth:0,meta:t('fp.top'),here:!f.parent},...fpShelf(bad,g=>g.id===f.parent).map(x=>({...x,depth:x.depth+1}))],
    onNew:n=>fpNewShelf(n,null),onPick:x=>{f.parent=x.id||null;save();renderLib();toast(t('fp.moved',f.n))}})}
/* moving a selection (☑ تحديد) */
lselMoveMenu=function(anchor){const T=lselTargets();if(!T.length){toast(t('lsel.cant'));return}const items=[];let sec='';
  T.forEach((g,i)=>{const s=g.k==='sf'?'lib':'aud';if(s!==sec){sec=s;items.push({sec:1,n:s==='lib'?'🎬 '+t('nav.lib'):'🎧 '+t('au.t')})}
    const f=g.k==='sf'&&g.id?lshGet(g.id):null,af=g.k==='af'&&g.id?AUD().f.find(z=>z.id===g.id):null,pl=g.k==='pl'?AUD().pl.find(z=>z.id===g.id):null;
    items.push({gi:i,n:f?f.n:af?af.n:pl?pl.n:String(g.n).replace(/^\S+\s/,''),ic:!g.id?(g.k==='sf'?'🗂':'🎧'):g.k==='pl'?'🎶':'📁',depth:f?lshPath(f.id).length:g.id?1:0,path:f?lshPath(f.id).map(x=>x.n).join(' › '):'',meta:f?t('fp.items',(f.items||[]).length+lshKids(f.id).length):pl?t('fp.items',(pl.items||[]).length):''})});
  fpOpen({title:t('lsel.moveTo',LSEL.ids.size),items,onPick:x=>lselMove(T[x.gi])})};
{const _bk=window.thabatBack;window.thabatBack=function(){if($('#fpk')){fpClose();return true}return _bk?_bk():false}}
/* ---------- the guide: what the library does and where to find it ---------- */
const LGUIDE=[['🎬','c'],['📁','f'],['☑','s'],['▶','p'],['🎞','v'],['🗒','tr'],['📅','d'],['📖','b'],['🎧','a'],['📱','m']];
function libGuide(){openInfo('💡 '+t('lg.t'),`<p class="muted">${t('lg.sub')}</p><div class="lgl">${LGUIDE.map(([ic,k])=>`<div class="lgi"><span class="lgic">${ic}</span><span><b>${t('lg.'+k)}</b><small>${t('lg.'+k+'S')}</small></span></div>`).join('')}</div>`);try{localStorage.setItem('thabat.libGuide','1')}catch(e){}const b=$('#lgBan');if(b)b.remove()}
{const _rl=renderLib;renderLib=function(...a){const r=_rl(...a);try{const lp=$('#lpath');if(lp&&!$('#lgBtn')){($('#lpFwd')||lp.firstElementChild).insertAdjacentHTML('afterend',`<button class="lpnav lggd" id="lgBtn" title="${esc(t('lg.t'))}" aria-label="${esc(t('lg.t'))}">💡<span>${t('lg.btn')}</span></button>`);$('#lgBtn').onclick=libGuide}
  let seen='1';try{seen=localStorage.getItem('thabat.libGuide')}catch(e){}if(!seen&&!LIB.open&&lp&&!$('#lgBan')){lp.insertAdjacentHTML('afterend',`<div class="lgban" id="lgBan"><span>💡 ${t('lg.ban')}</span><button class="btn sm pri" id="lgOpen">${t('lg.open')}</button><button class="lshm" id="lgNo" aria-label="✕">✕</button></div>`);$('#lgOpen').onclick=libGuide;$('#lgNo').onclick=()=>{try{localStorage.setItem('thabat.libGuide','1')}catch(e){}$('#lgBan').remove()}}}catch(e){console.error(e)}return r}}
