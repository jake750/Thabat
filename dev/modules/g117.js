/* ============ v3.97.0: live sync with an Obsidian vault folder (group 8, old pick 158) ============ */
/* The vault folder is chosen once with the browser's folder access (the same as the backup folder; Chrome on Windows and Mac).
   Thabat writes its notes as Markdown files into a sub-folder of the vault (default «ثبات»), following its note folders, each with
   a front matter (thabat-id, title, created, updated); changes made in Obsidian come back. Kept per device (handles cannot sync):
   IDB obs:dir (the handle), obs:map {noteId:{f:path,h:hash,m:file time,u:note time}}. Rules: a file changed since the last sync and
   newer than the note wins, else the note wins; a new .md file becomes a note; a note deleted (or locked) here moves its file to the
   vault's .trash/ (an archived note keeps its file); a file deleted in the vault archives its note (nothing is lost). Pictures stay in Thabat (text only). */
const OBS={dir:null,map:null,run:false,at:0,t:null,last:null};
const obsSub=()=>(S.settings.obsSub||'ثبات').replace(/[\\/:*?"<>|]/g,'-').trim()||'ثبات';
function obsSafe(s){return String(s||'').replace(/[\\/:*?"<>|#^[\]\r\n\t]/g,'-').replace(/\s+/g,' ').trim().slice(0,80).replace(/^\.+/,'')||'note'}
function obsFolderPath(n){const L_=[],F=NFOLD();let f=n.fd&&F.find(x=>x.id===n.fd),g=0;while(f&&g++<20){L_.unshift(obsSafe(f.n));f=f.parent&&F.find(x=>x.id===f.parent)}return L_}
function obsMd(n){const iso=x=>new Date(x||Date.now()).toISOString().slice(0,19);
  return`---\nthabat-id: ${n.id}\ntitle: "${String(n.title||'').replace(/"/g,'”').replace(/\s+/g,' ')}"\ncreated: ${iso(n.created)}\nupdated: ${iso(n.updated)}\n---\n${String(n.body||'').replace(/\r\n/g,'\n')}\n`}
async function obsDirGet(){if(OBS.dir)return OBS.dir;try{OBS.dir=await idbGet('obs:dir')}catch(e){}return OBS.dir}
async function obsPerm(h,ask){if(!h)return'none';if(!h.queryPermission)return'granted';try{let p=await h.queryPermission({mode:'readwrite'});if(p!=='granted'&&ask)p=await h.requestPermission({mode:'readwrite'});return p}catch(e){return'denied'}}
async function obsWalk(dir,pre,out){for await(const [name,h] of dir.entries()){if(name.startsWith('.'))continue;const p=pre?pre+'/'+name:name;
  if(h.kind==='directory')await obsWalk(h,p,out);else if(/\.md$/i.test(name))out[p]=h}return out}
async function obsDirOf(root,parts,create){let d=root;for(const p of parts)d=await d.getDirectoryHandle(p,{create});return d}
async function obsWrite(root,path,text){const parts=path.split('/'),name=parts.pop(),d=await obsDirOf(root,parts,true),fh=await d.getFileHandle(name,{create:true}),w=await fh.createWritable();await w.write(text);await w.close();return(await fh.getFile()).lastModified}
async function obsRemove(root,path){const parts=path.split('/'),name=parts.pop();try{const d=await obsDirOf(root,parts,false);await d.removeEntry(name)}catch(e){}}
/* one sync pass; root = the vault folder handle */
async function obsSync(root,quiet){if(OBS.run||!root)return;OBS.run=true;const st={out:0,in:0,nw:0,arc:0,tr:0};
  try{const base=await root.getDirectoryHandle(obsSub(),{create:true});const map=(await idbGet('obs:map'))||{},files=await obsWalk(base,'',{}),used=new Set(Object.keys(files));
    const notes=NOTES().filter(n=>!n.lock&&!n._demo),byId=new Map(notes.map(n=>[n.id,n]));
    /* files first: changes made in Obsidian */
    for(const [path,fh] of Object.entries(files)){const f=await fh.getFile();const ent=Object.entries(map).find(([id,m])=>m.f===path);
      if(ent){const [id,m]=ent;if(f.lastModified===m.m)continue;const txt=(await f.text()).replace(/\r\n/g,'\n'),h=bkHash(txt);if(h===m.h){m.m=f.lastModified;continue}
        const n=byId.get(id);if(!n)continue;const {fm,body}=obsFront(txt);
        if((n.updated||0)>(m.u||0)&&(n.updated||0)>f.lastModified)continue;/* changed here later: the note wins below */
        n.body=body.replace(/\n$/,'');if(fm.title)n.title=fm.title;n.updated=Date.now();m.h=bkHash(obsMd(n));m.m=f.lastModified;m.u=n.updated;st.in++}
      else{const txt=(await f.text()).replace(/\r\n/g,'\n'),{fm,body}=obsFront(txt);let n=fm['thabat-id']&&byId.get(fm['thabat-id']);
        if(n){map[n.id]={f:path,h:bkHash(txt),m:f.lastModified,u:n.updated||0};continue}
        n={id:uid(),title:fm.title||path.split('/').pop().replace(/\.md$/i,''),body:body.replace(/\n$/,''),imgs:[],created:f.lastModified,updated:Date.now(),day:dKey(new Date(f.lastModified)),obs:1};
        NOTES().push(n);byId.set(n.id,n);const tx=obsMd(n);const lm=await obsWrite(base,path,tx);map[n.id]={f:path,h:bkHash(tx),m:lm,u:n.updated};st.nw++}}
    /* files deleted in the vault: archive their notes */
    for(const [id,m] of Object.entries(map)){if(files[m.f])continue;const n=byId.get(id);if(n&&!n.arc&&(n.updated||0)<=(m.u||0)){n.arc=Date.now();st.arc++;delete map[id]}else if(!n)delete map[id]}
    /* notes: new or changed here → written */
    for(const n of NOTES().filter(x=>!x.lock&&!x._demo&&!x.arc)){const m=map[n.id];const want=[...obsFolderPath(n),obsSafe(n.title)].join('/');
      if(m&&(n.updated||0)<=(m.u||0)&&files[m.f])continue;
      let path=m&&m.f;if(!path||path.replace(/( \(\d+\))?\.md$/,'')!==want){let p=want+'.md',i=2;while(used.has(p)&&(!m||m.f!==p))p=`${want} (${i++}).md`;if(m&&m.f&&m.f!==p&&files[m.f])await obsRemove(base,m.f);path=p}
      const tx=obsMd(n);const lm=await obsWrite(base,path,tx);used.add(path);map[n.id]={f:path,h:bkHash(tx),m:lm,u:n.updated||0};st.out++}
    /* notes deleted here → their files go to the vault's .trash (archived notes keep theirs) */
    for(const [id,m] of Object.entries(map)){const n=byId.get(id);if(n)continue;if(files[m.f]){try{const f=await files[m.f].getFile(),tr=await root.getDirectoryHandle('.trash',{create:true}),fh=await tr.getFileHandle(m.f.split('/').pop(),{create:true}),w=await fh.createWritable();await w.write(await f.text());await w.close();await obsRemove(base,m.f);st.tr++}catch(e){}}delete map[id]}
    await idbSet('obs:map',map);OBS.at=Date.now();OBS.last=st;try{localStorage.setItem('thabat.obsAt',String(OBS.at))}catch(e){}
    if(st.in||st.nw||st.arc){save();try{notesChanged();if(curView()==='boards')renderNotes()}catch(e){}}
    if(!quiet)toast(t('obs2.done',st.out,st.in+st.nw));}
  catch(e){console.error(e);if(!quiet)toast(t('obs2.err'))}finally{OBS.run=false;obsPaint()}}
async function obsTick(quiet){if(!S.settings.obsLive)return;const h=await obsDirGet();if(!h)return;if(await obsPerm(h,false)!=='granted'){obsPaint();return}await obsSync(h,quiet!==false)}
/* live: every minute while Thabat is open, a few seconds after a note is saved, and when the window comes back */
setInterval(()=>obsTick(true),60000);setTimeout(()=>obsTick(true),15000);
window.addEventListener('focus',()=>{if(Date.now()-OBS.at>20000)obsTick(true)});
{hookFn('notesChanged',()=>notesChanged,f=>{notesChanged=f},'post',function(){if(OBS.run)return;clearTimeout(OBS.t);OBS.t=setTimeout(()=>obsTick(true),5000)})}
/* the window */
async function obsOpen(){openInfo(t('obs2.t'),`<div id="obsBox" class="obsbox"><div class="spin"></div></div>`);await obsPaint()}
async function obsPaint(){const box=$('#obsBox');if(!box)return;const h=await obsDirGet(),perm=h?await obsPerm(h,false):'none',at=+(localStorage.getItem('thabat.obsAt')||0),st=OBS.last;
  const can=!!window.showDirectoryPicker;
  box.innerHTML=`<p class="muted">${esc(t('obs2.sub'))}</p>
   ${!can?`<p class="tsmtop warn">${esc(t('obs2.noApi'))}</p>`:''}
   <div class="field"><div><label>${esc(t('obs2.vault'))}</label><small>${h?esc(h.name)+' › '+esc(obsSub()):esc(t('obs2.noVault'))}</small></div><button class="btn sm" data-ob="pick" ${can?'':'disabled'}>${esc(t(h?'obs2.change':'obs2.pick'))}</button></div>
   <div class="field"><div><label>${esc(t('obs2.subL'))}</label><small>${esc(t('obs2.subS'))}</small></div><input class="in" id="obsSubIn" dir="auto" style="width:130px" value="${esc(obsSub())}"></div>
   <div class="field"><div><label>${esc(t('obs2.live'))}</label><small>${esc(t('obs2.liveS'))}</small></div><button class="sw-toggle ${S.settings.obsLive?'on':''}" data-ob="live" aria-label="${esc(t('obs2.live'))}"></button></div>
   ${h&&perm!=='granted'?`<div class="tsmtop warn"><span>${esc(t('obs2.perm'))}</span><button class="btn sm pri" data-ob="perm">${esc(t('obs2.allow'))}</button></div>`:''}
   <div class="obsst">${OBS.run?esc(t('obs2.running')):at?esc(t('obs2.last',new Date(at).toLocaleTimeString(LANG==='ar'?'ar':'en',{hour:'2-digit',minute:'2-digit'})))+(st?' · '+esc(t('obs2.stat',st.out,st.in+st.nw,st.arc,st.tr)):''):esc(t('obs2.never'))}</div>
   <div class="row" style="justify-content:flex-start"><button class="btn pri" data-ob="now" ${h?'':'disabled'}>${esc(t('obs2.now'))}</button></div>
   <p class="muted" style="font-size:12px">${esc(t('obs2.rules'))}</p>`;
  box.querySelectorAll('[data-ob]').forEach(b=>b.onclick=async()=>{const a=b.dataset.ob;
    if(a==='pick'){try{const d=await window.showDirectoryPicker({mode:'readwrite',id:'thabatObs'});OBS.dir=d;await idbSet('obs:dir',d);await idbSet('obs:map',{});S.settings.obsLive=true;save();await obsSync(d,false)}catch(e){}obsPaint()}
    if(a==='live'){S.settings.obsLive=!S.settings.obsLive;save();obsPaint();if(S.settings.obsLive)obsTick(false)}
    if(a==='perm'){const d=await obsDirGet();if(await obsPerm(d,true)==='granted')await obsSync(d,false);obsPaint()}
    if(a==='now'){const d=await obsDirGet();if(await obsPerm(d,true)==='granted')await obsSync(d,false);else obsPaint()}});
  const si=$('#obsSubIn');if(si)si.onchange=async()=>{const v=si.value.trim();if(!v||v===obsSub())return;S.settings.obsSub=v;await idbSet('obs:map',{});save();toast(t('obs2.subSet'));obsPaint()}}
{const _cc=cmdCommands;cmdCommands=function(){const L_=_cc();L_.push({icon:'🔄',label:t('obs2.t'),run:()=>obsOpen(),kw:'obsidian vault sync markdown مزامنة أوبسيديان'});return L_}}
{hookFn('renderSettings',()=>renderSettings,f=>{renderSettings=f},'post',function(){try{const pf=$('#pickFolder'),fd=pf&&pf.closest('.field');if(!fd||$('#obsRow'))return;
  fd.insertAdjacentHTML('afterend',`<div class="field" id="obsRow"><div><label data-i18n="obs2.t">${esc(t('obs2.t'))}</label><small>${esc(t('obs2.rowS'))}</small></div><button class="btn sm" id="obsRowB">${esc(t('obs2.open'))}</button></div>`);$('#obsRowB').onclick=()=>obsOpen()}catch(e){}})}
/* the notes «⋯» menu gets the same entry */
{hookFn('renderNotes',()=>renderNotes,f=>{renderNotes=f},'post',function(){try{const imp=$('#nObsIn');if(!imp||$('#nObsLive'))return;imp.insertAdjacentHTML('beforebegin',`<button class="btn sm ghost" id="nObsLive">🔄 ${esc(t('obs2.t'))}</button>`);$('#nObsLive').onclick=()=>obsOpen()}catch(e){}})}

/* his report on 3.96 («why are the pages empty?»): the first page of a just-downloaded Taysir mushaf takes some seconds (the file is
   opened, page 1 is found, the page is drawn) and nothing showed meanwhile; now the page box shows a spinner and a line until it is there */
{const _l=qLoadImg;qLoadImg=function(im,p,r){const R=RIWAYAT[r];if(!R||!R.ts)return _l(im,p,r);const box=im.parentElement;if(box){box.classList.add('tsl');box.dataset.tsl=t('tsl.draw')}
  const r0=_l(im,p,r);if(box){const t0=Date.now(),iv=setInterval(()=>{const gone=!box.contains(im),ok=im.complete&&im.naturalWidth>0;if(gone||ok||Date.now()-t0>90000||!box.isConnected){box.classList.remove('tsl');clearInterval(iv)}},300)}return r0}}
/* PC: a cut Taysir page gets a box of its own shape, as tall as the mushaf allows and no wider than half the column */
function tsFit(im){try{if(MOB.matches||document.documentElement.classList.contains('qfs-one'))return;const box=im.parentElement;if(!box||!im.naturalWidth)return;const ratio=im.naturalWidth/im.naturalHeight;
  box.style.width='';box.style.height='';box.style.aspectRatio='';const H0=box.clientHeight,sp=$('#mushaf'),navs=$$('#mushaf>.qnav').reduce((s,e)=>s+e.offsetWidth+12,0);
  const pages=Math.max(1,$$('#spread>.qpage').length),avail=(sp?sp.clientWidth-navs:900)/pages-34;let H=H0,W=H*ratio;if(W>avail){W=avail;H=W/ratio}
  box.style.aspectRatio='auto';box.style.height=Math.round(H)+'px';box.style.width=Math.round(W)+'px'}catch(e){}}
{const _l=qLoadImg;qLoadImg=function(im,p,r){const R=RIWAYAT[r];const r0=_l(im,p,r);if(R&&R.ts){const f=()=>{if(im.classList.contains('tsfr'))tsFit(im)};im.addEventListener('load',f)}return r0}}
window.addEventListener('resize',()=>{clearTimeout(TSF.rt);TSF.rt=setTimeout(()=>$$('#spread img.tsfr').forEach(tsFit),200)});
