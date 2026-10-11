/* ============ v3.2: favourite recitations (my recordings) ============ */
function RCL(){return S.recits||(S.recits=[])}
const RCX={el:null,cur:null,loop:false};
function rcFmt(s){s=Math.max(0,Math.round(s||0));const h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=s%60;return(h?h+':'+pad(m):m)+':'+pad(x)}
function rcAudio(){if(!RCX.el){const a=new Audio();a.preload='metadata';a.ontimeupdate=rcUI;a.onplay=rcUI;a.onpause=rcUI;a.onloadedmetadata=()=>{const r=RCL().find(x=>x.id===RCX.cur);if(r&&!r.dur&&isFinite(a.duration)){r.dur=Math.round(a.duration);save()}rcUI()};a.onended=()=>{if(RCX.loop){a.currentTime=0;a.play()}else rcNext()};RCX.el=a}return RCX.el}
async function rcPlay(id){const r=RCL().find(x=>x.id===id);if(!r)return;const a=rcAudio();if(RCX.cur===id&&a.src){a.paused?a.play():a.pause();return}
  try{if(typeof qStop==='function'&&QA&&QA.playing)qStop()}catch(e){}const b=await idbGet('aud:'+id);if(!b){toast(t('rc.missing'));return}if(RCX.url)URL.revokeObjectURL(RCX.url);RCX.url=URL.createObjectURL(b);RCX.cur=id;a.src=RCX.url;a.playbackRate=RCX.rate||1;
  try{await a.play()}catch(e){}r.plays=(r.plays||0)+1;r.last=Date.now();save();rcMediaSession(r);rcUI()}
function rcNext(){const L_=RCL(),i=L_.findIndex(x=>x.id===RCX.cur);if(RCX.auto&&i>=0&&i<L_.length-1)rcPlay(L_[i+1].id);else rcUI()}
function rcStop(){if(RCX.el){RCX.el.pause();RCX.el.removeAttribute('src');RCX.el.load()}RCX.cur=null;rcUI()}
function rcMediaSession(r){try{if(!('mediaSession' in navigator))return;navigator.mediaSession.metadata=new MediaMetadata({title:r.title,artist:r.reciter||t('app')});navigator.mediaSession.setActionHandler('play',()=>RCX.el.play());navigator.mediaSession.setActionHandler('pause',()=>RCX.el.pause());navigator.mediaSession.setActionHandler('seekbackward',()=>{RCX.el.currentTime-=10});navigator.mediaSession.setActionHandler('seekforward',()=>{RCX.el.currentTime+=10})}catch(e){}}
function rcUI(){const a=RCX.el,r=RCL().find(x=>x.id===RCX.cur),pill=$('#rcPill');
  if(pill){const show=!!r&&!$('#rcModal').classList.contains('on');pill.hidden=!show;if(show)pill.innerHTML=`<button data-p="pp">${a.paused?'▶':'⏸'}</button><span dir="auto" data-p="open">🎙 ${esc(r.title)}</span><small dir="ltr">${rcFmt(a.currentTime)}</small><button data-p="x">✕</button>`,pill.querySelectorAll('[data-p]').forEach(b=>b.onclick=()=>{const p=b.dataset.p;if(p==='pp')a.paused?a.play():a.pause();else if(p==='x')rcStop();else openRecits()})}
  const bar=$('#rcBar');if(!bar)return;if(!r){bar.hidden=true;$$('#rcBox .rcit').forEach(x=>x.classList.remove('on'));return}bar.hidden=false;
  $('#rcbT').textContent=r.title;$('#rcbPP').textContent=a.paused?'▶':'⏸';const d=isFinite(a.duration)?a.duration:(r.dur||0);$('#rcbTime').textContent=rcFmt(a.currentTime)+' / '+rcFmt(d);const sk=$('#rcbSeek');if(!sk.matches(':active')){sk.max=Math.max(1,Math.round(d));sk.value=Math.round(a.currentTime)}
  $('#rcbLoop').classList.toggle('on',RCX.loop);$('#rcbAuto').classList.toggle('on',!!RCX.auto);$$('#rcBox .rcit').forEach(x=>{const on=x.dataset.id===RCX.cur;x.classList.toggle('on',on);const b=x.querySelector('.rcpp');if(b)b.textContent=on&&!a.paused?'⏸':'▶'})}
function openRecits(){renderRecits();$('#rcModal').classList.add('on');rcUI()}
function renderRecits(){const L_=RCL();
  $('#rcBox').innerHTML=`<h2 style="font-size:20px">🎙 ${t('rc.t')}</h2><small class="muted">${t('rc.sub')}</small>
   <div class="rcadd"><input class="in" id="rcUrl" dir="ltr" placeholder="${esc(t('rc.urlPh'))}"><button class="btn pri sm" id="rcGet">⤓ ${t('rc.get')}</button><button class="btn sm" id="rcFileB">📁 ${t('rc.file')}</button></div><div class="rcst" id="rcSt"></div>
   <div class="rclist">${L_.map(r=>`<div class="rcit" data-id="${r.id}"><button class="rcpp">▶</button><div class="rcb"><b dir="auto">${esc(r.title)}</b><small dir="auto">${esc(r.reciter||'')}${r.dur?' · '+rcFmt(r.dur):''}${r.size?' · '+(r.size/1048576).toFixed(1)+' MB':''}${r.src?' · '+esc(r.src):''}</small></div><button class="link" data-a="edit" title="${esc(t('edit'))}">✎</button><button class="link" data-a="dl" title="${esc(t('rc.save'))}">⤓</button><button class="link" data-a="del">✕</button></div>`).join('')||`<div class="empty">${t('rc.empty')}</div>`}</div>
   <div class="rcbar" id="rcBar" hidden><div class="rcbh"><b id="rcbT" dir="auto"></b><small id="rcbTime" dir="ltr"></small></div><input type="range" id="rcbSeek" min="0" value="0"><div class="rcbc"><button class="btn sm ghost" id="rcbBack">⟲ 10</button><button class="btn sm pri" id="rcbPP">▶</button><button class="btn sm ghost" id="rcbFwd">10 ⟳</button><select class="in" id="rcbRate">${[.75,1,1.25,1.5,1.75,2].map(v=>`<option value="${v}" ${(RCX.rate||1)===v?'selected':''}>${v}×</option>`).join('')}</select><button class="btn sm ghost" id="rcbLoop" title="${esc(t('rc.loop'))}">🔁</button><button class="btn sm ghost" id="rcbAuto" title="${esc(t('rc.auto'))}">⏭</button></div></div>
   <div class="evact"><small class="muted" style="flex:1">${t(ANDROID||MAC?'rc.noteA':'rc.noteP')}</small><button class="btn sm" id="rcX">${t('ok')}</button></div><input type="file" id="rcFile" accept="audio/*,.mp3,.m4a,.ogg,.opus,.wav,.webm,.aac" multiple hidden>`;
  $('#rcX').onclick=()=>{$('#rcModal').classList.remove('on');rcUI()};$('#rcFileB').onclick=()=>$('#rcFile').click();$('#rcFile').onchange=async e=>{const fs=[...e.target.files];e.target.value='';for(const f of fs)await rcSave(f,{title:f.name.replace(/\.[a-z0-9]+$/i,'').replace(/[_-]+/g,' '),src:t('rc.local')});renderRecits();rcUI()};
  $('#rcGet').onclick=()=>rcFromUrl($('#rcUrl').value.trim());$('#rcUrl').onkeydown=e=>{if(e.key==='Enter')$('#rcGet').click()};
  $$('#rcBox .rcit').forEach(row=>{const r=L_.find(x=>x.id===row.dataset.id);row.querySelector('.rcpp').onclick=()=>rcPlay(r.id);row.querySelector('.rcb').onclick=()=>rcPlay(r.id);
    row.querySelectorAll('[data-a]').forEach(b=>b.onclick=async()=>{const a=b.dataset.a;
      if(a==='edit'){row.querySelector('.rcb').innerHTML=`<input class="in" data-f="title" dir="auto" value="${esc(r.title)}"><input class="in" data-f="reciter" dir="auto" placeholder="${esc(t('rc.reciter'))}" value="${esc(r.reciter||'')}">`;row.querySelector('.rcb').onclick=null;const ins=row.querySelectorAll('input');ins[0].focus();const done=()=>{r.title=ins[0].value.trim()||r.title;r.reciter=ins[1].value.trim();save();renderRecits();rcUI()};ins.forEach(i=>i.onkeydown=e=>{if(e.key==='Enter')done()});b.textContent='✓';b.onclick=done}
      else if(a==='dl'){const bl=await idbGet('aud:'+r.id);if(bl)saveBytes(safeName(r.title)+'.'+(r.ext||'mp3'),bl.type||'audio/mpeg',bl)}
      else{if(!confirm(t('rc.delQ',r.title)))return;if(RCX.cur===r.id)rcStop();S.recits=RCL().filter(x=>x!==r);await idbSet('aud:'+r.id,null);save();renderRecits()}})});
  const a=rcAudio();$('#rcbPP').onclick=()=>{if(!RCX.cur)return;a.paused?a.play():a.pause()};$('#rcbBack').onclick=()=>{a.currentTime=Math.max(0,a.currentTime-10)};$('#rcbFwd').onclick=()=>{a.currentTime+=10};$('#rcbSeek').oninput=e=>{a.currentTime=+e.target.value};
  $('#rcbRate').onchange=e=>{RCX.rate=+e.target.value;a.playbackRate=RCX.rate};$('#rcbLoop').onclick=()=>{RCX.loop=!RCX.loop;rcUI()};$('#rcbAuto').onclick=()=>{RCX.auto=!RCX.auto;rcUI()}}
async function rcSave(blob,meta){const id=uid(),ext=(meta.ext||(blob.name||'').split('.').pop()||(/mp4|m4a/.test(blob.type)?'m4a':/webm/.test(blob.type)?'webm':/ogg|opus/.test(blob.type)?'opus':'mp3')).toLowerCase().slice(0,5);
  await idbSet('aud:'+id,blob instanceof File?new Blob([blob],{type:blob.type||'audio/mpeg'}):blob);RCL().unshift(Object.assign({id,added:Date.now(),size:blob.size,ext},meta));save();return id}
function rcSt(h){const s=$('#rcSt');if(s)s.innerHTML=h}
async function rcFromUrl(u){if(!/^https:\/\/((www|m|music)\.)?(youtube\.com|youtu\.be|soundcloud\.com|on\.soundcloud\.com)\//i.test(u)){toast(t('rc.badUrl'));return}
  if(ANDROID){rcSt(`⚠ ${t('rc.andNo')}`);return}
  rcSt('⏳ '+t('rc.helper'));if(!await helperOk()){rcSt(`⚠ ${t('rc.noHelper')}`);return}
  const run=async()=>{rcSt('⏳ '+t('rc.dl'));$('#rcGet').disabled=true;try{const r=await fetch(HELPER+'/yt?u='+encodeURIComponent(u),{cache:'no-store'});
      if(r.status===428){rcSt(`${t('rc.setupQ')} <button class="btn sm pri" id="rcSetup">${t('rc.setupGo')}</button>`);$('#rcSetup').onclick=async()=>{rcSt('⏳ '+t('rc.setupIng'));const s=await fetch(HELPER+'/ytsetup',{cache:'no-store'}).catch(()=>null);if(s&&s.ok)run();else rcSt('⚠ '+t('rc.setupFail'))};return}
      if(!r.ok){rcSt(`⚠ ${t('rc.fail')} <button class="btn sm" id="rcUpd">${t('rc.update')}</button>`);$('#rcUpd').onclick=async()=>{rcSt('⏳ '+t('rc.setupIng'));const s=await fetch(HELPER+'/ytsetup?update=1',{cache:'no-store'}).catch(()=>null);if(s&&s.ok)run();else rcSt('⚠ '+t('rc.setupFail'))};return}
      let m={};try{const x=r.headers.get('X-Meta');if(x)m=JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(x),c=>c.charCodeAt(0))))}catch(e){}
      const blob=await r.blob(),src=/soundcloud/i.test(u)?'SoundCloud':'YouTube';await rcSave(blob,{title:m.title||u,reciter:m.uploader||'',dur:Math.round(+m.duration||0)||undefined,url:u,src,ext:m.ext});renderRecits();rcUI();rcSt('✓ '+t('rc.done'))}
    catch(e){rcSt('⚠ '+t('rc.fail'))}finally{const g=$('#rcGet');if(g)g.disabled=false}};run()}
$('#rcModal').onclick=e=>{if(e.target.id==='rcModal'){$('#rcModal').classList.remove('on');rcUI()}};
$('#rcBtnQ').onclick=openRecits;
{const _cc5=cmdCommands;cmdCommands=function(){const c=(icon,label,run,kw)=>({icon,label,run,kw:kw||''});return _cc5().concat([c('🎙',t('rc.t'),openRecits,'recitation tilawa تلاوات تسجيلات')])}}
/* notes: the tag bar is gone; a tag inside a note searches for it instead */
renderNTags=function(){const b=$('#nTags');if(b)b.innerHTML='';nTag=null};

