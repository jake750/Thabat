/* ============ v3.12: video library — videos and project files kept on the PC, watched from the PC or the phone (same Wi-Fi or Tailscale) ============ */
const LIB={base:'',via:'',tree:null,open:null,err:'',busy:false,thq:[],thBusy:false,cur:null,watch:0,lastTick:0,lastSave:0};
function LIBS(){const L_=S.lib||(S.lib={});L_.port=L_.port||47815;L_.prog=L_.prog||{};L_.order=L_.order||{};return L_}
if(!SY_SIMPLE.includes('lib'))SY_SIMPLE.push('lib');
const LIB_LOCAL='http://127.0.0.1:47815',LIB_HELPER='http://127.0.0.1:47813';
async function libFetch(url,ms=2500,opt){const c=new AbortController(),tm=setTimeout(()=>c.abort(),ms);try{const r=await fetch(url,Object.assign({signal:c.signal,cache:'no-store'},opt||{}));clearTimeout(tm);return r}catch(e){clearTimeout(tm);throw e}}
const libU=(path,extra)=>`${LIB.base}${path}${path.includes('?')?'&':'?'}t=${encodeURIComponent(LIBS().token||'')}${extra||''}`;
/* find the PC: this computer first, then each saved address (Wi-Fi, then Tailscale 100.x) */
async function libConnect(){const L_=LIBS();LIB.err='';LIB.base='';
  if(!ANDROID){try{let r=await libFetch(LIB_LOCAL+'/cfg',1500).catch(()=>null);if(!r&&!MAC){await helperCall('/libstart');await new Promise(z=>setTimeout(z,2200));r=await libFetch(LIB_LOCAL+'/cfg',2500).catch(()=>null)}
    if(r&&r.ok){const c=await r.json();const ch=JSON.stringify([L_.hosts,L_.token,L_.name,L_.roots])!==JSON.stringify([c.ips,c.token,c.name,c.roots]);L_.hosts=c.ips||[];L_.token=c.token;L_.name=c.name;L_.roots=c.roots||[];if(ch)save();LIB.base=LIB_LOCAL;LIB.via='pc';return true}}catch(e){}}
  if(!L_.token||!(L_.hosts||[]).length){LIB.err='setup';return false}
  const hs=[...L_.hosts].sort((a,b)=>(a.startsWith('100.')?1:0)-(b.startsWith('100.')?1:0));
  for(const h of hs){try{const r=await libFetch(`http://${h}:${L_.port}/ping?t=${encodeURIComponent(L_.token)}`,h.startsWith('100.')?4500:2500);if(r.ok){const j=await r.json();if(j.auth){LIB.base=`http://${h}:${L_.port}`;LIB.via=h.startsWith('100.')?'ts':'lan';return true}}}catch(e){}}
  LIB.err='off';return false}
async function helperCall(p){try{const r=await libFetch(LIB_HELPER+p,p.startsWith('/libpick')?120000:4000);return r.ok?await r.json().catch(()=>({ok:true})):null}catch(e){return null}}
async function libLoad(force){if(LIB.busy)return;LIB.busy=true;renderLib();try{if(force||!LIB.base)await libConnect();if(LIB.base){const r=await libFetch(libU('/list'),20000);if(r.ok){const j=await r.json();LIB.tree=j.roots||[];try{localStorage.setItem('thabat.libTree',JSON.stringify(LIB.tree))}catch(e){}}else LIB.err='off'}}catch(e){LIB.err='off'}LIB.busy=false;renderLib()}
if(!LIB.tree)try{LIB.tree=JSON.parse(localStorage.getItem('thabat.libTree')||'null')}catch(e){}

/* tree helpers: a course is a folder under a chosen folder; its sub-folders are chapters */
const libNat=(a,b)=>a.n.localeCompare(b.n,undefined,{numeric:true,sensitivity:'base'});
const libTitle=n=>n.replace(/\.[^.]+$/,'').replace(/[_]+/g,' ').trim();
function libCourses(){const out=[];(LIB.tree||[]).forEach(r=>{const loose=[];(r.c||[]).forEach(x=>{if(x.k==='d')out.push(x);else loose.push(x)});if(loose.length)out.push({n:r.n,id:r.id,k:'d',c:loose,loose:1})});return out}
function libFind(id,nodes){for(const n of nodes||LIB.tree||[]){if(n.id===id)return n;if(n.c){const f=libFind(id,n.c);if(f)return f}}return null}
function libMedia(node){const out=[];const walk=(n,path)=>{const kids=(n.c||[]).slice().sort(libNat),ord=LIBS().order[n.id];if(ord)kids.sort((a,b)=>{const i=ord.indexOf(a.id),j=ord.indexOf(b.id);return(i<0?1e9:i)-(j<0?1e9:j)});kids.forEach(k=>{if(k.k==='d')walk(k,path.concat(k.n));else if(k.k==='v'||k.k==='a')out.push({...k,ch:path.join(' › ')})})};walk(node,[]);return out}
function libFiles(node){const out=[];const walk=(n,path)=>{(n.c||[]).forEach(k=>{if(k.k==='d')walk(k,path.concat(k.n));else if(k.k==='f')out.push({...k,ch:path.join(' › ')})})};walk(node,[]);return out.sort(libNat)}
function libCourseProg(node){const m=libMedia(node),P=LIBS().prog,done=m.filter(x=>P[x.id]&&P[x.id].done).length;return{n:m.length,done,first:m[0],next:m.find(x=>!(P[x.id]&&P[x.id].done))}}
const libThumb=id=>LIB.base?libU('/thumb?id='+id):'';
const fmtSz=b=>b>1e9?(b/1e9).toFixed(1)+' GB':b>1e6?Math.round(b/1e6)+' MB':Math.max(1,Math.round(b/1e3))+' KB';

/* the page */
function renderLib(){const v=$('#v-lib');if(!v)return;let box=$('#libBox');if(!box){box=document.createElement('div');box.id='libBox';v.append(box)}const L_=LIBS();
  const st=LIB.busy?`<span class="lbst">⏳ ${t('lb.connecting')}</span>`:LIB.base?`<span class="lbst ok">🟢 ${t('lb.via.'+LIB.via,L_.name||'PC')}</span>`:LIB.err==='setup'?`<span class="lbst">⚪ ${t('lb.nosetup')}</span>`:LIB.err?`<span class="lbst bad">🔴 ${t('lb.off')}</span>`:'';
  const head=`<div class="lbhead">${st}<span style="flex:1"></span><button class="btn sm ghost" id="lbRe" title="${esc(t('lb.refresh'))}">⟳</button><button class="btn sm" id="lbSet">⚙ ${t('lb.setup')}</button></div>`;
  let body='';
  if(LIB.open){const c=libFind(LIB.open)||{n:'',c:[]},m=libMedia(c),fs=libFiles(c),P=L_.prog,pr=libCourseProg(c);let lastCh=null;
    body=`<div class="lbbar"><button class="btn sm ghost" id="lbBack">${document.documentElement.dir==='rtl'?'›':'‹'} ${t('lb.all')}</button><b dir="auto">${esc(c.n)}</b><span class="lbpr">${t('lb.done',pr.done,pr.n)}</span></div>
      ${pr.next?`<button class="btn pri lbcont" data-play="${pr.next.id}">▶ ${pr.done?t('lb.cont'):t('lb.start')}: <span dir="auto">${esc(libTitle(pr.next.n))}</span></button>`:''}
      <div class="lbles">${m.map((x,i)=>{const p=P[x.id]||{},pct=p.d?Math.min(100,p.p/p.d*100):0,ch=x.ch!==lastCh?(lastCh=x.ch,`<div class="lbch">${esc(x.ch||c.n)}</div>`):'';
        return ch+`<div class="lbl ${p.done?'done':''}" data-play="${x.id}"><span class="lbth">${LIB.base&&x.k==='v'?`<img loading="lazy" data-th="${x.id}" alt="">`:''}<i>${x.k==='a'?'🎧':'▶'}</i></span><span class="lbt"><b dir="auto">${esc(libTitle(x.n))}</b><small>${p.d?fmtTC(p.d):fmtSz(x.s)}${p.done?' · ✓':pct>2?' · '+Math.round(pct)+'%':''}</small><span class="lbpb"><i style="width:${p.done?100:pct}%"></i></span></span><button class="lbdone" data-done="${x.id}" title="${esc(t('lb.mark'))}">${p.done?'✓':'○'}</button></div>`}).join('')||`<div class="empty">${t('lb.novid')}</div>`}</div>
      ${fs.length?`<h4 class="lbfh">📎 ${t('lb.files')}</h4><div class="lbfs">${fs.map(f=>`<div class="lbf"><span dir="auto">${esc(f.n)}<small>${esc(f.ch||'')} · ${fmtSz(f.s)}</small></span>${LIB.via==='pc'?`<button class="btn sm" data-open="${f.id}">${t('lb.open')}</button><button class="btn sm ghost" data-reveal="${f.id}">📂</button>`:`<button class="btn sm" data-dl="${f.id}" data-n="${esc(f.n)}" data-s="${f.s}">⤓ ${t('lb.dl')}</button>`}</div>`).join('')}</div>`:''}`}
  else{const cs=libCourses(),P=L_.prog,cont=Object.entries(P).filter(([id,p])=>!p.done&&p.p>10).sort((a,b)=>b[1].at-a[1].at).slice(0,4);
    body=`${cont.length?`<h4 class="lbfh">⏯ ${t('lb.continue')}</h4><div class="lbcw">${cont.map(([id,p])=>`<button class="lbcwi" data-play="${id}"><b dir="auto">${esc(p.n||'')}</b><small dir="auto">${esc(p.c||'')}</small><span class="lbpb"><i style="width:${p.d?Math.min(100,p.p/p.d*100):0}%"></i></span></button>`).join('')}</div>`:''}
      ${cs.length?`<div class="lbgrid">${cs.map(c=>{const pr=libCourseProg(c);return`<button class="lbc" data-course="${c.id}"><span class="lbcth">${LIB.base&&pr.first&&pr.first.k==='v'?`<img loading="lazy" data-th="${pr.first.id}" alt="">`:''}<i>🎬</i></span><b dir="auto">${esc(c.loose?t('lb.loose',c.n):c.n)}</b><small>${t('lb.done',pr.done,pr.n)}</small><span class="lbpb"><i style="width:${pr.n?pr.done/pr.n*100:0}%"></i></span></button>`}).join('')}</div>`
      :`<div class="lbempty"><div style="font-size:38px">🎬</div><p>${LIB.err==='setup'||!L_.token?t(ANDROID||MAC?'lb.emptyPh':'lb.emptyPc'):LIB.err?t('lb.offHelp'):t('lb.noCourses')}</p><button class="btn pri" id="lbSet2">⚙ ${t('lb.setup')}</button></div>`}`}
  box.innerHTML=head+body;
  $('#lbRe').onclick=()=>libLoad(true);$('#lbSet').onclick=openLibSetup;const s2=$('#lbSet2');if(s2)s2.onclick=openLibSetup;const bk=$('#lbBack');if(bk)bk.onclick=()=>{LIB.open=null;renderLib()};
  box.querySelectorAll('[data-course]').forEach(b=>b.onclick=()=>{LIB.open=b.dataset.course;renderLib();$('main').scrollTop=0});
  box.querySelectorAll('[data-play]').forEach(b=>b.onclick=e=>{if(e.target.closest('[data-done]'))return;libPlay(b.dataset.play)});
  box.querySelectorAll('[data-done]').forEach(b=>b.onclick=e=>{e.stopPropagation();const id=b.dataset.done,P=LIBS().prog,p=P[id]||(P[id]={p:0,d:0,at:Date.now()});p.done=!p.done;p.at=Date.now();save();renderLib()});
  box.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>libFetch(libU('/open?id='+b.dataset.open)).catch(()=>{}));
  box.querySelectorAll('[data-reveal]').forEach(b=>b.onclick=()=>libFetch(libU('/open?folder=1&id='+b.dataset.reveal)).catch(()=>{}));
  box.querySelectorAll('[data-dl]').forEach(b=>b.onclick=()=>libDownload(b.dataset.dl,b.dataset.n,+b.dataset.s));
  box.querySelectorAll('img[data-th]').forEach(im=>{const id=im.dataset.th;im.onerror=()=>{im.remove();if(LIB.via==='pc')libThumbQ(id)};im.src=libThumb(id)})}
{const _sv=showView;showView=function(v,...a){const r=_sv(v,...a);if(v==='lib'){renderLib();if(!LIB.base&&!LIB.busy)libLoad(true)}return r}}
/* thumbnails: made on the PC from a frame of the video, stored by the server for the phone */
function libThumbQ(id){if(LIB.thq.includes(id))return;LIB.thq.push(id);libThumbRun()}
async function libThumbRun(){if(LIB.thBusy||!LIB.thq.length)return;LIB.thBusy=true;const id=LIB.thq.shift();try{await new Promise(res=>{const v=document.createElement('video');v.muted=true;v.preload='auto';v.crossOrigin='anonymous';v.src=libU('/f?id='+id);let done=false;const fin=()=>{if(done)return;done=true;v.removeAttribute('src');v.load();res()};
  v.onloadedmetadata=()=>{try{v.currentTime=Math.min(30,(v.duration||10)*0.15)}catch(e){fin()}};v.onseeked=()=>{try{const c=document.createElement('canvas'),w=320,h=Math.round(w*(v.videoHeight||9)/(v.videoWidth||16));c.width=w;c.height=h;c.getContext('2d').drawImage(v,0,0,w,h);c.toBlob(async b=>{try{if(b)await libFetch(libU('/thumb?id='+id),8000,{method:'POST',body:b});const img=document.createElement('img');img.src=libThumb(id)+'&r='+Date.now();img.dataset.th=id;$$(`#libBox .lbl[data-play="${id}"] .lbth, #libBox .lbc .lbcth`).forEach(x=>{if(x.closest('[data-play]')&&x.closest('[data-play]').dataset.play===id&&!x.querySelector('img'))x.prepend(img.cloneNode())})}catch(e){}fin()},'image/jpeg',.72)}catch(e){fin()}};v.onerror=fin;setTimeout(fin,20000)})}catch(e){}LIB.thBusy=false;setTimeout(libThumbRun,150)}

/* downloading one project file to the phone */
async function libDownload(id,name,size){if(size>60e6&&ANDROID){toast(t('lb.big'));return}toast(t('lb.dling'));try{const r=await libFetch(libU('/f?dl=1&id='+id),180000);const b=await r.blob();saveBytes(name,b.type||'application/octet-stream',b)}catch(e){toast(t('lb.dlFail'))}}

/* the player */
function libItem(id){const all=libCourses().flatMap(c=>libMedia(c).map(x=>({...x,course:c})));const i=all.findIndex(x=>x.id===id);return i<0?null:{...all[i],list:all.filter(x=>x.course.id===all[i].course.id)}}
function libPlay(id){if(!LIB.base){toast(t('lb.off'));libLoad(true);return}const it=libItem(id);if(!it){toast(t('lb.gone'));return}const L_=LIBS();LIB.cur=it;LIB.watch=0;LIB.lastTick=0;
  let ov=$('#libPlayer');if(!ov){ov=document.createElement('div');ov.id='libPlayer';ov.className='lbpl';document.body.append(ov)}ov.classList.add('on');document.documentElement.classList.add('lbpl-on');
  const sp=L_.speed||1,i=it.list.findIndex(x=>x.id===id),prev=it.list[i-1],next=it.list[i+1];
  ov.innerHTML=`<div class="lbpt"><button class="lbx" id="lvX" aria-label="✕">✕</button><span class="lbpn"><b dir="auto">${esc(libTitle(it.n))}</b><small dir="auto">${esc(it.course.n)}${it.ch?' · '+esc(it.ch):''}</small></span><button class="lbx" id="lvFs" title="⛶">⛶</button></div>
    <div class="lbvw"><video id="lvV" controls playsinline preload="metadata" ${it.k==='a'?'':'poster=""'}></video></div>
    <div class="lbpc"><button class="btn sm ghost" id="lvPrev" ${prev?'':'disabled'}>⏮</button><button class="btn sm ghost" id="lvB10">−10</button><div class="lbsp">${[0.75,1,1.25,1.5,1.75,2,2.5,3].map(x=>`<button data-sp="${x}" class="${x===sp?'on':''}">${x}×</button>`).join('')}</div><button class="btn sm ghost" id="lvF10">+10</button><button class="btn sm ghost" id="lvNext" ${next?'':'disabled'}>⏭</button><button class="btn sm" id="lvDone">${(L_.prog[id]||{}).done?'✓ '+t('lb.watched'):t('lb.mark')}</button></div>`;
  const v=$('#lvV');if(ANDROID)v.setAttribute('controlsList','nofullscreen');v.src=libU('/f?id='+id);v.playbackRate=sp;v.defaultPlaybackRate=sp;const p=L_.prog[id];
  v.addEventListener('loadedmetadata',()=>{if(p&&!p.done&&p.p>5&&p.p<v.duration-5)v.currentTime=p.p;v.playbackRate=L_.speed||1;v.play().catch(()=>{})},{once:true});
  v.addEventListener('timeupdate',()=>libTick(v));v.addEventListener('pause',()=>libSave(v,true));v.addEventListener('ended',()=>{libSave(v,true,true);if(next&&L_.autoNext!==false)setTimeout(()=>libPlay(next.id),600)});
  v.addEventListener('error',()=>{const e=v.error&&v.error.code;toast(e===4?t('lb.codec'):t('lb.netErr'))});
  ov.querySelectorAll('[data-sp]').forEach(b=>b.onclick=()=>{const x=+b.dataset.sp;v.playbackRate=x;L_.speed=x;ov.querySelectorAll('[data-sp]').forEach(z=>z.classList.toggle('on',z===b));save()});
  $('#lvB10').onclick=()=>{v.currentTime=Math.max(0,v.currentTime-10)};$('#lvF10').onclick=()=>{v.currentTime=Math.min(v.duration||1e9,v.currentTime+10)};
  $('#lvPrev').onclick=()=>prev&&(libSave(v,true),libPlay(prev.id));$('#lvNext').onclick=()=>next&&(libSave(v,true),libPlay(next.id));
  $('#lvDone').onclick=()=>{const P=L_.prog,q=P[id]||(P[id]={p:v.currentTime,d:v.duration||0});q.done=!q.done;q.at=Date.now();q.n=libTitle(it.n);q.c=it.course.n;save();$('#lvDone').textContent=q.done?'✓ '+t('lb.watched'):t('lb.mark')};
  $('#lvX').onclick=libClose;$('#lvFs').onclick=()=>{const el=ov;if(!document.fullscreenElement&&el.requestFullscreen&&!ANDROID)el.requestFullscreen().catch(()=>{});else if(document.fullscreenElement)document.exitFullscreen();else ov.classList.toggle('max')}}
function libTick(v){const now=performance.now();if(!v.paused&&LIB.lastTick&&now-LIB.lastTick<3000)LIB.watch+=(now-LIB.lastTick)/1000;LIB.lastTick=v.paused?0:now;if(Date.now()-LIB.lastSave>8000)libSave(v,Date.now()-LIB.lastSave>30000)}
function libSave(v,persist,ended){const it=LIB.cur;if(!it||!v)return;LIB.lastSave=Date.now();const P=LIBS().prog,p=P[it.id]||(P[it.id]={});p.p=ended?v.duration:v.currentTime;p.d=v.duration||p.d||0;p.at=Date.now();p.n=libTitle(it.n);p.c=it.course.n;if(ended||(p.d&&p.p/p.d>0.92))p.done=true;if(persist)save()}
function libLog(){const it=LIB.cur,sec=LIB.watch;LIB.watch=0;if(!it||sec<60)return;const k=todayKey(),d=day(k),title=`${it.course.n} — ${libTitle(it.n)}`,mins=Math.round(sec/60);const ex=d.media.find(m=>m.lib===it.id);if(ex){ex.minutes+=mins;ex.at=Date.now()}else d.media.push({id:uid(),type:'lesson',how:it.k==='a'?'listen':'watch',title,minutes:mins,at:Date.now(),counted:false,url:'',from:null,to:null,lib:it.id});save();try{renderMedia()}catch(e){}}
function libClose(){const ov=$('#libPlayer'),v=$('#lvV');if(v){libSave(v,true);v.pause();v.removeAttribute('src');v.load()}libLog();if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});if(ov){ov.classList.remove('on','max');ov.innerHTML=''}document.documentElement.classList.remove('lbpl-on');LIB.cur=null;if(curView()==='lib')renderLib()}
document.addEventListener('keydown',e=>{const ov=$('#libPlayer');if(!ov||!ov.classList.contains('on'))return;const v=$('#lvV');if(!v||/INPUT|TEXTAREA/.test(e.target.tagName))return;
  if(e.key==='Escape'){e.preventDefault();libClose()}else if(e.key===' '&&e.target!==v){e.preventDefault();v.paused?v.play():v.pause()}else if(e.key==='ArrowLeft'||e.key==='ArrowRight'){if(e.target===v)return;e.preventDefault();const back=(e.key==='ArrowLeft')!==(document.documentElement.dir==='rtl');v.currentTime=Math.max(0,v.currentTime+(back?-10:10))}
  else if(e.key===']'||e.key==='['){const L_=[0.75,1,1.25,1.5,1.75,2,2.5,3],i=L_.indexOf(v.playbackRate),n=L_[Math.max(0,Math.min(L_.length-1,(i<0?1:i)+(e.key===']'?1:-1)))];v.playbackRate=n;LIBS().speed=n;$$('#libPlayer [data-sp]').forEach(z=>z.classList.toggle('on',+z.dataset.sp===n))}},true);
addEventListener('pagehide',()=>{const v=$('#lvV');if(v&&LIB.cur){libSave(v,true);libLog()}});

/* setup: folders (on the PC), the pairing code, Tailscale */
function libCode(){const L_=LIBS();try{return btoa(unescape(encodeURIComponent(JSON.stringify({h:L_.hosts,p:L_.port,t:L_.token,n:L_.name}))))}catch(e){return''}}
async function openLibSetup(){const L_=LIBS(),pc=!ANDROID&&!MAC;let roots=L_.roots||[],stOn=null;if(pc){await libConnect();roots=LIBS().roots||[];const si=await helperCall('/startupinfo');if(si)stOn=si}
  openInfo('🎬 '+t('lb.setup'),`${pc?`<h4 class="uuh">📁 ${t('lb.folders')}</h4><p class="muted" style="margin:0 0 6px">${t('lb.foldersSub')}</p><div class="uxtr">${roots.map((r,i)=>`<div class="uxtrr"><span class="uxtrt" dir="ltr">${esc(r)}</span><button class="btn sm ghost" data-rm="${i}">✕</button></div>`).join('')||`<div class="empty">${t('lb.noFolders')}</div>`}</div>
      <div class="row" style="gap:6px;margin-top:8px;flex-wrap:wrap"><button class="btn sm pri" id="lbPick">＋ ${t('lb.pick')}</button><input class="in" id="lbPath" dir="ltr" placeholder="D:\\Courses" style="flex:1;min-width:160px"><button class="btn sm" id="lbAddP">${t('add')}</button></div>
      ${stOn?`<div class="field"><div><label>${t('lb.autostart')}</label><small>${t('lb.autostartS')}</small></div><button class="sw-toggle ${stOn.lib?'on':''}" id="lbAuto"></button></div><div class="field"><div><label>${t('ws.l')}</label><small>${t('ws.s')}</small></div><button class="sw-toggle ${stOn.app?'on':''}" id="lbApp"></button></div>`:`<p class="muted">${t('lb.needHelper')}</p>`}`:''}
    <h4 class="uuh">🔗 ${t('lb.pair')}</h4>${pc&&L_.token?`<p class="muted" style="margin:0 0 6px">${t('lb.pairPc')}</p><div class="row" style="gap:6px"><input class="in" id="lbCode" readonly value="${esc(libCode())}" style="flex:1;font-size:11px" dir="ltr"><button class="btn sm" id="lbCopy">${t('wb.copy')}</button></div><p class="muted" style="font-size:11.5px">${t('lb.addrs')}: <span dir="ltr">${esc((L_.hosts||[]).join(', '))}</span></p>`
      :`<p class="muted" style="margin:0 0 6px">${t('lb.pairPh')}</p><div class="row" style="gap:6px"><input class="in" id="lbPaste" dir="ltr" placeholder="${esc(t('lb.pastePh'))}" style="flex:1"><button class="btn sm pri" id="lbUse">${t('lb.use')}</button></div>`}
    <h4 class="uuh">🌍 ${t('lb.ts')}</h4><ol class="lbts"><li>${t('lb.ts1')}</li><li>${t('lb.ts2')}</li><li>${t('lb.ts3')}</li><li>${t('lb.ts4')}</li></ol><p><a href="https://tailscale.com/download" target="_blank" rel="noopener">tailscale.com/download</a></p>
    <h4 class="uuh">ℹ ${t('lb.notes')}</h4><ul class="lbts"><li>${t('lb.n1')}</li><li>${t('lb.n2')}</li><li>${t('lb.n3')}</li></ul>`);
  const setRoots=async list=>{const d=btoa(unescape(encodeURIComponent(JSON.stringify(list)))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');const r=await libFetch(LIB_LOCAL+'/roots?d='+d,5000).catch(()=>null);if(!r||!r.ok){toast(t('lb.off'));return}await libLoad(true);openLibSetup()};
  $$('#infoBox [data-rm]').forEach(b=>b.onclick=()=>setRoots(roots.filter((x,i)=>i!==+b.dataset.rm)));
  const pk=$('#lbPick');if(pk)pk.onclick=async()=>{toast(t('lb.picking'));const r=await helperCall('/libpick');if(r&&r.path)setRoots(roots.concat(r.path));else if(!r)toast(t('lb.needHelper'))};
  const ap=$('#lbAddP');if(ap)ap.onclick=()=>{const v=$('#lbPath').value.trim();if(v)setRoots(roots.concat(v))};
  const au=$('#lbAuto');if(au)au.onclick=async()=>{const on=!au.classList.contains('on');const r=await helperCall('/libstartup?on='+(on?1:0));if(r&&r.ok)au.classList.toggle('on',on)};
  const aa=$('#lbApp');if(aa)aa.onclick=async()=>{const on=!aa.classList.contains('on');const r=await helperCall('/appstartup?on='+(on?1:0));if(r&&r.ok)aa.classList.toggle('on',on)};
  const cp=$('#lbCopy');if(cp)cp.onclick=async()=>{if(await qCopyText($('#lbCode').value))toast(t('q.copied'))};
  const us=$('#lbUse');if(us)us.onclick=()=>{try{const o=JSON.parse(decodeURIComponent(escape(atob($('#lbPaste').value.trim()))));if(!o.t||!o.h)throw 0;Object.assign(LIBS(),{hosts:o.h,port:o.p||47815,token:o.t,name:o.n||'PC'});save();$('#infoModal').classList.remove('on');libLoad(true)}catch(e){toast(t('lb.badCode'))}}}
/* keep the PC's addresses fresh (and synced) whenever the app opens on Windows */
if(!ANDROID&&!MAC)setTimeout(()=>{libFetch(LIB_LOCAL+'/cfg',1500).then(r=>r.ok&&r.json()).then(c=>{if(!c)return;const L_=LIBS();if(JSON.stringify([L_.hosts,L_.token])!==JSON.stringify([c.ips,c.token])){L_.hosts=c.ips||[];L_.token=c.token;L_.name=c.name;L_.roots=c.roots||[];save()}}).catch(()=>{})},4000);
{const _cc=cmdCommands;cmdCommands=function(){const L_=_cc();L_.push({icon:'🎬',label:t('nav.lib'),run:()=>showView('lib'),kw:'library video courses مكتبة فيديو دورات'});return L_}}
PGT.lib='nav.lib';try{pgtEnsure()}catch(e){}
