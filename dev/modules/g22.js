/* ============ v3.16: audio in the library — your recordings (recitations and others) with folders, sub-folders and playlists; whole playlists downloaded from SoundCloud or YouTube ============ */
/* S.audio = {f:[{id,n,parent,items:[recId]}], pl:[{id,n,items:[recId]}]} (synced); recordings stay in S.recits, their sound in IndexedDB 'aud:<id>' (this device only) */
function AUD(){const A=S.audio||(S.audio={});A.f=A.f||[];A.pl=A.pl||[];return A}
if(!SY_SIMPLE.includes('audio'))SY_SIMPLE.push('audio');
const AUX={q:'',dl:null};
const auRec=id=>RCL().find(r=>r.id===id);
const auF=id=>AUD().f.find(f=>f.id===id),auP=id=>AUD().pl.find(p=>p.id===id);
function auKids(pid){return AUD().f.filter(f=>(f.parent||null)===(pid||null)).sort((a,b)=>a.n.localeCompare(b.n,undefined,{numeric:true}))}
function auAll(fid,seen){seen=seen||new Set();if(seen.has(fid))return[];seen.add(fid);const f=auF(fid);if(!f)return[];return[...(f.items||[]),...auKids(fid).flatMap(k=>auAll(k.id,seen))].filter((x,i,a)=>a.indexOf(x)===i&&auRec(x))}
function auDur(ids){return ids.reduce((s,id)=>s+((auRec(id)||{}).dur||0),0)}
function auPlaced(){const s=new Set();AUD().f.forEach(f=>(f.items||[]).forEach(i=>s.add(i)));return s}
/* playing: a queue (a playlist, a folder or a list) that «next» follows */
function auPlay(ids,start,shuffle){let q=ids.filter(auRec);if(!q.length)return;if(shuffle){q=q.slice();for(let i=q.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[q[i],q[j]]=[q[j],q[i]]}}RCX.queue=q;RCX.auto=true;rcPlay(start&&q.includes(start)?start:q[0])}
{const _rn=rcNext;rcNext=function(){const q=RCX.queue;if(q&&q.length){const i=q.indexOf(RCX.cur);if(i>=0&&i<q.length-1){rcPlay(q[i+1]);return}if(i===q.length-1){RCX.queue=null;rcUI();return}}return _rn()}}
{const _ru=rcUI;rcUI=function(){_ru();try{$$('#libBox .aurow').forEach(r=>{const on=r.dataset.rid===RCX.cur,b=r.querySelector('.aupp');r.classList.toggle('on',on);if(b)b.textContent=on&&RCX.el&&!RCX.el.paused?'⏸':'▶'})}catch(e){}}}
/* a recording row */
function auRow(r,ctx,i,n){const P=ctx&&ctx.startsWith('p:');return`<div class="aurow${RCX.cur===r.id?' on':''}" data-rid="${r.id}"><button class="aupp" data-aplay="${r.id}">${RCX.cur===r.id&&RCX.el&&!RCX.el.paused?'⏸':'▶'}</button><span class="aut"><b dir="auto">${esc(r.title)}</b><small dir="auto">${[r.reciter,r.dur?rcFmt(r.dur):'',r.size?(r.size/1048576).toFixed(1)+' MB':'',r.src].filter(Boolean).map(esc).join(' · ')}</small></span>
  ${P?`<button class="lshm" data-up="${i}" ${i?'':'disabled'} aria-label="↑">↑</button><button class="lshm" data-dn="${i}" ${i<n-1?'':'disabled'} aria-label="↓">↓</button>`:''}<button class="lshm" data-am="${r.id}" aria-label="⋯">⋯</button></div>`}
function auCard(kind,o){const ids=kind==='p'?o.items.filter(auRec):auAll(o.id),hue=parseInt(bkHash(o.id),36)%360;
  return`<div class="lshfc aucard" data-ao="${kind}:${o.id}" style="--fh:${hue}"><span class="lshfcv"><span class="lshfci0">${kind==='p'?'🎶':'📁'}</span><span class="lshfcov"><b dir="auto">${esc(o.n)}</b><small>${t('au.count',ids.length)}${ids.length?' · '+rcFmt(auDur(ids)):''}</small></span>${ids.length?`<button class="lshfcb auplay" data-aall="${kind}:${o.id}" aria-label="▶">▶</button>`:''}</span></div>`}
/* the audio pages: home «🎧 audio», a folder, a playlist */
function auAddBar(){return`<div class="auadd"><input class="in" id="auUrl" dir="ltr" placeholder="${esc(t('au.urlPh'))}"><button class="btn sm pri" id="auGet">⤓ ${t('rc.get')}</button><button class="btn sm" id="auFileB">📁 ${t('rc.file')}</button><input type="file" id="auFile" accept="audio/*,.mp3,.m4a,.ogg,.opus,.wav,.webm,.aac" multiple hidden></div><div class="rcst" id="auSt"></div>`}
function auView(){const A=AUD(),rtl=document.documentElement.dir==='rtl',o=String(LIB.open),rest=o.slice(3);let crumbs,body;
  const q=AUX.q.trim().toLowerCase(),match=r=>!q||(r.title+' '+(r.reciter||'')).toLowerCase().includes(q);
  if(rest.startsWith('f:')){const f=auF(rest.slice(2));if(!f){LIB.open='au:';return auView()}const kids=auKids(f.id),own=(f.items||[]).map(auRec).filter(Boolean).filter(match);
    crumbs=`<div class="lbbar"><button class="btn sm ghost" id="auUp">${rtl?'›':'‹'} ${f.parent?esc(auF(f.parent).n):t('au.t')}</button><b dir="auto">${esc(f.n)}</b></div>
      <div class="lshacts"><button class="btn sm pri" id="auPlayAll">▶ ${t('au.playAll')}</button><button class="btn sm ghost" id="auShuf">🔀 ${t('au.shuffle')}</button><button class="btn sm ghost" id="auSubF">📁 ${t('lsh.newSub')}</button><button class="btn sm ghost" id="auFM">⋯</button></div>`;
    body=`${kids.length?`<div class="lshfs">${kids.map(k=>auCard('f',k)).join('')}</div>`:''}<div class="aulist">${own.map(r=>auRow(r,'f:'+f.id)).join('')||(kids.length?'':`<p class="muted lshhint">${t('au.emptyF')}</p>`)}</div>`}
  else if(rest.startsWith('p:')){const p=auP(rest.slice(2));if(!p){LIB.open='au:';return auView()}const recs=p.items.map(auRec).filter(Boolean);
    crumbs=`<div class="lbbar"><button class="btn sm ghost" id="auUp">${rtl?'›':'‹'} ${t('au.t')}</button><b dir="auto">🎶 ${esc(p.n)}</b><span class="lbpr">${t('au.count',recs.length)} · ${rcFmt(auDur(p.items))}</span></div>
      <div class="lshacts"><button class="btn sm pri" id="auPlayAll">▶ ${t('au.playAll')}</button><button class="btn sm ghost" id="auShuf">🔀 ${t('au.shuffle')}</button><button class="btn sm ghost" id="auPM">⋯</button></div>`;
    body=`<div class="aulist">${recs.map((r,i)=>auRow(r,'p:'+p.id,i,recs.length)).join('')||`<p class="muted lshhint">${t('au.emptyP')}</p>`}</div>`}
  else{const placed=auPlaced(),loose=RCL().filter(r=>(AUX.all||!placed.has(r.id))&&match(r));
    crumbs=`<div class="lbbar"><button class="btn sm ghost" id="auUp">${rtl?'›':'‹'} ${t('lb.all')}</button><b>🎧 ${t('au.t')}</b><span class="lbpr">${t('au.count',RCL().length)}</span></div>${auAddBar()}`;
    body=`<div class="lshh"><h4 class="lbfh">🎶 ${t('au.playlists')}</h4><button class="btn sm" id="auNewP">＋ ${t('au.newP')}</button></div>${A.pl.length?`<div class="lshfs">${A.pl.map(p=>auCard('p',p)).join('')}</div>`:`<p class="muted lshhint">${t('au.noP')}</p>`}
      <div class="lshh"><h4 class="lbfh">📁 ${t('au.folders')}</h4><button class="btn sm" id="auNewF">＋ ${t('lsh.newFolder')}</button></div>${auKids(null).length?`<div class="lshfs">${auKids(null).map(f=>auCard('f',f)).join('')}</div>`:`<p class="muted lshhint">${t('au.noF')}</p>`}
      <div class="lshh"><h4 class="lbfh">🎙 ${AUX.all?t('au.allRecs'):t('au.loose')}</h4><button class="btn sm ghost" id="auAll">${AUX.all?t('lsh.showNew'):t('lsh.showAll')}</button></div>
      <div class="aulist">${loose.map(r=>auRow(r,'')).join('')||`<p class="muted lshhint">${RCL().length?t('au.allPlaced'):t('rc.empty')}</p>`}</div>`}
  return`<div class="lshsearch"><input class="in" id="auQ" type="search" dir="auto" placeholder="🔍 ${esc(t('au.search'))}" value="${esc(AUX.q)}"></div>`+crumbs+body}
function auBind(b){const A=AUD(),o=String(LIB.open).slice(3),fid=o.startsWith('f:')?o.slice(2):null,pid=o.startsWith('p:')?o.slice(2):null;
  const up=$('#auUp');if(up)up.onclick=()=>{const f=fid&&auF(fid);LIB.open=f&&f.parent?'au:f:'+f.parent:fid||pid?'au:':null;AUX.q='';renderLib()};
  const q=$('#auQ');if(q)q.oninput=()=>{AUX.q=q.value;const pos=q.selectionStart;renderLib();const n=$('#auQ');if(n){n.focus();n.setSelectionRange(pos,pos)}};
  b.querySelectorAll('[data-ao]').forEach(c=>c.onclick=e=>{if(e.target.closest('[data-aall]'))return;LIB.open='au:'+c.dataset.ao;AUX.q='';renderLib();$('main').scrollTop=0});
  b.querySelectorAll('[data-aall]').forEach(x=>x.onclick=e=>{e.stopPropagation();const [k,id]=x.dataset.aall.split(':');auPlay(k==='p'?auP(id).items:auAll(id))});
  const list=()=>pid?auP(pid).items:fid?auAll(fid):[...b.querySelectorAll('.aurow')].map(r=>r.dataset.rid);
  b.querySelectorAll('[data-aplay]').forEach(x=>x.onclick=()=>{const id=x.dataset.aplay;if(RCX.cur===id&&RCX.el&&RCX.el.src){RCX.el.paused?RCX.el.play():RCX.el.pause();return}auPlay(list(),id)});
  b.querySelectorAll('.aurow .aut').forEach(x=>x.onclick=()=>x.parentElement.querySelector('[data-aplay]').click());
  b.querySelectorAll('[data-am]').forEach(x=>x.onclick=e=>{e.stopPropagation();auRecMenu(x,x.dataset.am,fid,pid)});
  if(pid){const p=auP(pid);b.querySelectorAll('[data-up],[data-dn]').forEach(x=>x.onclick=()=>{const i=+(x.dataset.up??x.dataset.dn),j=x.dataset.up!=null?i-1:i+1,its=p.items.filter(auRec);[its[i],its[j]]=[its[j],its[i]];p.items=its;save();renderLib()})}
  const pa=$('#auPlayAll');if(pa)pa.onclick=()=>auPlay(list());const sh=$('#auShuf');if(sh)sh.onclick=()=>auPlay(list(),null,true);
  const nf=$('#auNewF');if(nf)nf.onclick=()=>auNewFolder(null);const sf=$('#auSubF');if(sf)sf.onclick=()=>auNewFolder(fid);
  const np=$('#auNewP');if(np)np.onclick=()=>{const n=prompt(t('au.pName'));if(!n||!n.trim())return;const p={id:uid(),n:n.trim(),items:[]};A.pl.push(p);save();LIB.open='au:p:'+p.id;renderLib()};
  const al=$('#auAll');if(al)al.onclick=()=>{AUX.all=!AUX.all;renderLib()};
  const fm=$('#auFM');if(fm)fm.onclick=()=>auGroupMenu(fm,'f',auF(fid));const pm=$('#auPM');if(pm)pm.onclick=()=>auGroupMenu(pm,'p',auP(pid));
  const g=$('#auGet');if(g){const go=()=>{const u=$('#auUrl').value.trim();if(u)auFromUrl(u)};g.onclick=go;$('#auUrl').onkeydown=e=>{if(e.key==='Enter')go()}}
  const fb=$('#auFileB');if(fb){fb.onclick=()=>$('#auFile').click();$('#auFile').onchange=async e=>{const fs=[...e.target.files];e.target.value='';for(const f of fs)await rcSave(f,{title:f.name.replace(/\.[a-z0-9]+$/i,'').replace(/[_-]+/g,' '),src:t('rc.local')});renderLib()}}}
function auNewFolder(parent){const n=prompt(t('lsh.folderName'));if(!n||!n.trim())return;const f={id:uid(),n:n.trim(),parent:parent||null,items:[]};AUD().f.push(f);save();LIB.open='au:f:'+f.id;renderLib()}
function auRecMenu(anchor,rid,fid,pid){const A=AUD(),r=auRec(rid);if(!r)return;const fp=f=>{const out=[];let x=f,g=0;while(x&&g++<20){out.unshift(x.n);x=x.parent?auF(x.parent):null}return out.join(' › ')};
  const p=lshMenu(anchor,`<div class="aymh">${t('lsh.addTo')}</div>${A.f.map(f=>`<button data-tf="${f.id}">📁 <span dir="auto">${esc(fp(f))}</span></button>`).join('')}<button data-tf="new">＋ ${t('lsh.newFolder')}</button>
    <div class="aymh">${t('au.addToP')}</div>${A.pl.map(x=>`<button data-tp="${x.id}">🎶 <span dir="auto">${esc(x.n)}</span></button>`).join('')}<button data-tp="new">＋ ${t('au.newP')}</button>
    <div class="aymh"></div><button data-a="ren">✏ ${t('lsh.rename')}</button><button data-a="dl">⤓ ${t('rc.save')}</button>${fid||pid?`<button data-a="rm">✕ ${t(pid?'au.rmP':'lsh.remove')}</button>`:''}<button data-a="del">🗑 ${t('au.del')}</button>`);
  p.querySelectorAll('[data-tf]').forEach(b=>b.onclick=()=>{closePP();let f;if(b.dataset.tf==='new'){const n=prompt(t('lsh.folderName'));if(!n||!n.trim())return;f={id:uid(),n:n.trim(),parent:null,items:[]};A.f.push(f)}else f=auF(b.dataset.tf);if(!f.items.includes(rid))f.items.push(rid);save();toast(t('lsh.added',f.n));renderLib()});
  p.querySelectorAll('[data-tp]').forEach(b=>b.onclick=()=>{closePP();let x;if(b.dataset.tp==='new'){const n=prompt(t('au.pName'));if(!n||!n.trim())return;x={id:uid(),n:n.trim(),items:[]};A.pl.push(x)}else x=auP(b.dataset.tp);if(!x.items.includes(rid))x.items.push(rid);save();toast(t('lsh.added',x.n));renderLib()});
  p.querySelectorAll('[data-a]').forEach(b=>b.onclick=async()=>{closePP();const a=b.dataset.a;
    if(a==='ren'){const n=prompt(t('lsh.rename'),r.title);if(n&&n.trim()){r.title=n.trim();save();renderLib()}}
    else if(a==='dl'){const bl=await idbGet('aud:'+r.id);if(bl)saveBytes(safeName(r.title)+'.'+(r.ext||'mp3'),bl.type||'audio/mpeg',bl);else toast(t('rc.missing'))}
    else if(a==='rm'){const snap=JSON.stringify(AUD());if(pid){const x=auP(pid);x.items=x.items.filter(i=>i!==rid)}else{const f=auF(fid);f.items=f.items.filter(i=>i!==rid)}save();renderLib();toastAct(t('lsh.removed',1),t('lsh.undo'),()=>{S.audio=JSON.parse(snap);save();renderLib()},8000)}
    else if(a==='del'){if(!confirm(t('rc.delQ',r.title)))return;if(RCX.cur===r.id)rcStop();S.recits=RCL().filter(x=>x!==r);A.f.forEach(f=>f.items=f.items.filter(i=>i!==rid));A.pl.forEach(x=>x.items=x.items.filter(i=>i!==rid));await idbSet('aud:'+r.id,null);save();renderLib()}})}
function auGroupMenu(anchor,kind,o){if(!o)return;const A=AUD();const p=lshMenu(anchor,`<button data-a="ren">✏ ${t('lsh.rename')}</button>${kind==='f'?`<button data-a="move">📂 ${t('lsh.move')}</button>`:''}<button data-a="del">🗑 ${t(kind==='f'?'lsh.delete':'au.delP')}</button>`);
  p.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{closePP();const a=b.dataset.a;
    if(a==='ren'){const n=prompt(t('lsh.rename'),o.n);if(n&&n.trim()){o.n=n.trim();save();renderLib()}}
    else if(a==='move'){const bad=new Set(),walk=id=>{bad.add(id);auKids(id).forEach(k=>walk(k.id))};walk(o.id);const q=lshMenu(anchor,`<div class="aymh">${t('lsh.move')}</div><button data-to="">🏠 ${t('au.t')}</button>${A.f.filter(f=>!bad.has(f.id)).map(f=>`<button data-to="${f.id}">📁 <span dir="auto">${esc(f.n)}</span></button>`).join('')}`);q.querySelectorAll('[data-to]').forEach(x=>x.onclick=()=>{closePP();o.parent=x.dataset.to||null;save();renderLib()})}
    else if(a==='del'){if(!confirm(t('au.delGQ',o.n)))return;if(kind==='f'){auKids(o.id).forEach(k=>k.parent=o.parent||null);A.f=A.f.filter(f=>f!==o);LIB.open=o.parent?'au:f:'+o.parent:'au:'}else{A.pl=A.pl.filter(x=>x!==o);LIB.open='au:'}save();renderLib()}})}
/* downloading: one link, or a whole playlist in stages — read its contents, choose, download one by one, make a playlist */
const auIsList=u=>/soundcloud\.com\/[^/]+\/sets\//i.test(u)||/[?&]list=/i.test(u)||/youtube\.com\/playlist/i.test(u);
function auSt(h){const s=$('#auSt');if(s)s.innerHTML=h}
async function auSetup(retry){auSt('⏳ '+t('rc.setupIng'));const s=await fetch(HELPER+'/ytsetup',{cache:'no-store'}).catch(()=>null);if(s&&s.ok)retry();else auSt('⚠ '+t('rc.setupFail'))}
async function auOne(u,meta){const r=await fetch(HELPER+'/yt?u='+encodeURIComponent(u),{cache:'no-store'});if(r.status===428)return{setup:1};if(!r.ok)return{fail:1};let m={};try{const x=r.headers.get('X-Meta');if(x)m=JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(x),c=>c.charCodeAt(0))))}catch(e){}
  const blob=await r.blob();const id=await rcSave(blob,{title:m.title||(meta&&meta.t)||u,reciter:m.uploader||'',dur:Math.round(+m.duration||(meta&&meta.d)||0)||undefined,url:u,src:/soundcloud/i.test(u)?'SoundCloud':'YouTube',ext:m.ext});return{id}}
async function auFromUrl(u){if(!/^https:\/\/((www|m|music|on)\.)?(youtube\.com|youtu\.be|soundcloud\.com)\//i.test(u)){toast(t('rc.badUrl'));return}
  if(ANDROID){auSt(`⚠ ${t('rc.andNo')}`);return}if(MAC){auSt(`⚠ ${t('rc.noHelper')}`);return}
  auSt('⏳ '+t('rc.helper'));if(!await helperOk()){auSt(`⚠ ${t('rc.noHelper')}`);return}
  if(!auIsList(u)){auSt('⏳ '+t('rc.dl'));try{const r=await auOne(u);if(r.setup){auSt(`${t('rc.setupQ')} <button class="btn sm pri" id="auSetupB">${t('rc.setupGo')}</button>`);$('#auSetupB').onclick=()=>auSetup(()=>auFromUrl(u));return}if(r.fail){auSt('⚠ '+t('rc.fail'));return}auSt('✓ '+t('rc.done'));$('#auUrl').value='';renderLib()}catch(e){auSt('⚠ '+t('rc.fail'))}return}
  /* stage 1: read the playlist without downloading */
  auSt('⏳ '+t('au.reading'));let j;try{const r=await fetch(HELPER+'/ytlist?u='+encodeURIComponent(u),{cache:'no-store'});
    if(r.status===428){auSt(`${t('rc.setupQ')} <button class="btn sm pri" id="auSetupB">${t('rc.setupGo')}</button>`);$('#auSetupB').onclick=()=>auSetup(()=>auFromUrl(u));return}
    if(r.status===404){auSt('⚠ '+t('au.oldHelper'));return}if(!r.ok){auSt('⚠ '+t('au.listFail'));return}j=await r.json()}catch(e){auSt('⚠ '+t('au.listFail'));return}
  auSt('');auListDialog(u,j)}
function auListDialog(u,j){const items=j.items||[],title=j.title||t('au.newP'),had=new Set(RCL().map(r=>r.url).filter(Boolean));
  const est=ids=>Math.round(ids.reduce((s,i)=>s+(items[i].d||240),0)/60);
  openInfo('🎶 '+esc(title),`<p class="muted" style="margin:0 0 6px">${t('au.listInfo',items.length,rcFmt(items.reduce((s,x)=>s+(x.d||0),0)))}</p>
    <label class="lshck"><input type="checkbox" id="auLAll" checked> ${t('lsh.selAll')}</label>
    <div class="auli">${items.map((x,i)=>`<label class="aulr"><input type="checkbox" data-li="${i}" ${had.has(x.u)?'':'checked'}><span dir="auto">${esc(x.t||x.u)}</span><small>${x.d?rcFmt(x.d):''}${had.has(x.u)?' · ✓ '+t('au.have'):''}</small></label>`).join('')}</div>
    <label class="lshck" style="margin-top:8px"><input type="checkbox" id="auLMk" checked> ${t('au.makeP',esc(title))}</label>
    <div class="auprog" id="auProg" hidden><div class="lbpb"><i id="auPB" style="width:0%"></i></div><small id="auPT"></small></div>
    <div class="evact"><small class="muted" id="auEst" style="flex:1"></small><button class="btn sm ghost" id="infoX">${t('cancel')}</button><button class="btn sm pri" id="auLGo">⤓ ${t('au.dlSel')}</button></div>`);
  const sel=()=>$$('#infoBox [data-li]').filter(x=>x.checked).map(x=>+x.dataset.li),upd=()=>{const s=sel();$('#auEst').textContent=t('au.est',s.length,est(s));$('#auLGo').disabled=!s.length};upd();
  $$('#infoBox [data-li]').forEach(x=>x.onchange=upd);$('#auLAll').onchange=e=>{$$('#infoBox [data-li]').forEach(x=>x.checked=e.target.checked);upd()};
  $('#infoX').onclick=()=>{if(AUX.dl)AUX.dl.stop=true;$('#infoModal').classList.remove('on')};
  /* stages 2–3: download one by one with progress; a failed item is skipped and reported; then the playlist */
  $('#auLGo').onclick=async()=>{const s=sel(),mk=$('#auLMk').checked;$('#auLGo').disabled=true;$$('#infoBox input').forEach(x=>x.disabled=true);$('#auProg').hidden=false;const st=AUX.dl={stop:false},ids=[],fails=[];
    for(let k=0;k<s.length;k++){if(st.stop)break;const x=items[s[k]];$('#auPT').textContent=t('au.prog',k+1,s.length,x.t||'');$('#auPB').style.width=(k/s.length*100)+'%';
      try{const r=await auOne(x.u,x);if(r.id)ids.push(r.id);else fails.push(x.t||x.u)}catch(e){fails.push(x.t||x.u)}}
    AUX.dl=null;$('#auPB').style.width='100%';
    let pid=null;if(mk&&ids.length){const old=AUD().pl.find(p=>p.n===title&&p.src===u);if(old){ids.forEach(i=>{if(!old.items.includes(i))old.items.push(i)});pid=old.id}else{const p={id:uid(),n:title,items:ids,src:u};AUD().pl.push(p);pid=p.id}save()}
    $('#auPT').innerHTML=t('au.doneN',ids.length,s.length)+(fails.length?`<br>⚠ ${t('au.failed')}: ${fails.map(esc).join('، ')}`:'');
    $('#infoX').textContent=t('ok');$('#infoX').onclick=()=>{$('#infoModal').classList.remove('on');if(pid)LIB.open='au:p:'+pid;renderLib()};const ui=$('#auUrl');if(ui)ui.value='';renderLib()}}
/* the library: an «audio» shelf on the home, and its own pages */
function auShelfHTML(){const A=AUD(),n=RCL().length;const cards=[...A.pl.slice(0,3).map(p=>auCard('p',p)),...auKids(null).slice(0,3-Math.min(3,A.pl.length)).map(f=>auCard('f',f))];
  return`<div class="lshh"><h4 class="lbfh">🎧 ${t('au.t')}</h4><button class="btn sm" id="auOpen">${t('au.open',n)}</button></div>${cards.length?`<div class="lshfs">${cards.join('')}</div>`:`<p class="muted lshhint">${t('au.homeHint')}</p>`}`}
{const _top=lshTop;lshTop=function(){const h=_top(),i=h.indexOf('<div class="lshh"><h4 class="lbfh">💻');const a=auShelfHTML();return i<0?h+a:h.slice(0,i)+a+h.slice(i)}}
{const _bb=lshBindBody;lshBindBody=function(b){_bb(b);if(!b)return;const o=$('#auOpen');if(o)o.onclick=()=>{LIB.open='au:';AUX.q='';renderLib();$('main').scrollTop=0};if(!String(LIB.open||'').startsWith('au:'))try{auBind(b)}catch(e){console.error(e)}}}
{const _rl=renderLib;renderLib=function(){if(!String(LIB.open||'').startsWith('au:'))return _rl();
  const v=$('#v-lib');if(!v)return;let box=$('#libBox');if(!box){box=document.createElement('div');box.id='libBox';v.append(box)}
  box.innerHTML=`<div id="lshBody">${auView()}</div>`;try{auBind(box)}catch(e){console.error(e)}}}
/* the old «my recitations» window points to the library */
{const _rr=renderRecits;renderRecits=function(){_rr();const h=$('#rcBox h2');if(h&&!$('#rcToLib'))h.insertAdjacentHTML('afterend',`<button class="btn sm" id="rcToLib" style="float:inline-end;margin-top:-34px">🎧 ${t('au.inLib')}</button>`);const b=$('#rcToLib');if(b)b.onclick=()=>{$('#rcModal').classList.remove('on');LIB.open='au:';showView('lib')}}}
