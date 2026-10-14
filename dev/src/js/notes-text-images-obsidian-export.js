/* ============ notes (text + images, Obsidian export) ============ */
function NOTES(){return S.notes||(S.notes=[])}
const nImgMem={};
async function nImg(id){if(nImgMem[id])return nImgMem[id];const d=await idbGet('nimg:'+id);if(d)nImgMem[id]=d;return d||null}
function noteCard(n){const cover=(n.imgs||[])[0],nImgs=(n.imgs||[]).length;return`<button class="ncard" data-note="${n.id}"><span class="npin${n.pin?' on':''}" data-pin="${n.id}" title="${esc(t('notes.pin'))}">📌</span>${cover?`<div class="ncover"><img data-img="${cover}" alt=""><span class="nzoom" data-zoom="${n.id}" title="${esc(t('lb.view'))}">⤢</span></div>`:''}<div class="nbody"><b dir="auto">${esc(n.title||t('notes.untitled'))}</b>${n.body?`<p dir="auto">${esc(mdPlain(n.body).slice(0,180))}</p>`:''}<small>${gShort(keyToDate(n.day))}${nImgs>1?' · 🖼 '+nImgs:''}${noteBadges(n)}</small></div></button>`}
async function hydrateNoteImgs(root){if(!root)return;for(const im of root.querySelectorAll('img[data-img]')){const d=await nImg(im.dataset.img);if(d)im.src=d;else{const c=im.closest('.ncover,.neimg');if(c)c.classList.add('miss')}}}
function bindNoteCards(root){if(!root)return;root.querySelectorAll('[data-zoom]').forEach(z=>z.onclick=e=>{e.stopPropagation();e.preventDefault();const n=NOTES().find(x=>x.id===z.dataset.zoom);if(n&&(n.imgs||[]).length)lbOpen(n.imgs,0,n.title)});root.querySelectorAll('[data-pin]').forEach(p=>p.onclick=e=>{e.stopPropagation();e.preventDefault();const n=NOTES().find(x=>x.id===p.dataset.pin);if(!n)return;n.pin=!n.pin;if(!n.pin)delete n.pin;n.updated=n.updated||Date.now();save();toast(t(n.pin?'notes.pinned':'notes.unpinned'));notesChanged()});root.querySelectorAll('[data-note]').forEach(b=>b.onclick=()=>{if(Date.now()-(window._ndragAt||0)<450)return;openNote(b.dataset.note)});if(root.id==='notesGrid')notesDrag(root);root.querySelectorAll('[data-newnote]').forEach(b=>b.onclick=()=>openNote(null,b.dataset.newnote));hydrateNoteImgs(root)}
function sortNotes(a){const anyOrd=NOTES().some(n=>n.ord!=null),v=n=>n.ord!=null?n.ord:(n.updated||n.created);return a.sort((x,y)=>(y.pin?1:0)-(x.pin?1:0)||(anyOrd?v(y)-v(x):(y.day.localeCompare(x.day)||(y.updated||y.created)-(x.updated||x.created))))}
function renderDayNotes(el,k){if(!el)return;const L_=sortNotes(NOTES().filter(n=>n.day===k));el.innerHTML=L_.map(noteCard).join('')+`<button class="ncard nadd" data-newnote="${k}">＋<span>${t('notes.new')}</span></button>`;bindNoteCards(el)}
let nbMode='notes';
function renderBoardsView(){$$('#nbSeg button').forEach(b=>b.classList.toggle('on',b.dataset.k===nbMode));$('#notesWrap').hidden=nbMode!=='notes';$('#boardsWrap').hidden=nbMode!=='boards';$('#nTools').hidden=nbMode!=='notes';
  if(nbMode==='notes')renderNotes();else renderBoards()}
$$('#nbSeg button').forEach(b=>b.onclick=()=>{nbMode=b.dataset.k;renderBoardsView()});
function renderNotes(){const q=($('#nSearch').value||'').trim().toLowerCase();let L_=sortNotes(NOTES().slice());if(q)L_=L_.filter(n=>(n.title+' '+(n.lock&&!notesUnlocked()?'':n.body)).toLowerCase().includes(q));if(nTag)L_=L_.filter(n=>noteTags(n).includes(nTag));renderNTags();
  $('#notesGrid').innerHTML=L_.length?L_.map(noteCard).join(''):`<div class="empty">${t(q?'notes.none':'notes.empty')}</div>`;notesMasonry($('#notesGrid'));bindNoteCards($('#notesGrid'))}
$('#nSearch').oninput=()=>renderNotes();$('#nLetter').onclick=()=>openLetters('list');$('#nNew').onclick=()=>openNote(null,todayKey());$('#nObs').onclick=()=>exportObsidian();
let NE=null;
function openNote(id,dayK){const n=id?NOTES().find(x=>x.id===id):null;NE=n?JSON.parse(JSON.stringify(n)):{id:uid(),title:'',body:'',day:dayK||todayKey(),imgs:[],created:Date.now()};NE._new=!n;NE._orig=n?(n.imgs||[]).slice():[];NE._added=[];renderNoteEd();$('#noteModal').classList.add('on');if(NE._new)setTimeout(()=>$('#neTitle')&&$('#neTitle').focus(),50)}
function neRead(){if(!NE)return;const a=$('#neTitle'),b=$('#neBody'),c=$('#neDay');if(a)NE.title=a.value;if(b)NE.body=b.value;if(c&&c.value)NE.day=c.value}
function renderNoteEd(){const n=NE,rtl=document.documentElement.dir==='rtl',earlier=rtl?'▶':'◀',later=rtl?'◀':'▶';
  $('#noteBox').innerHTML=`<div class="nehead"><input class="in netitle" id="neTitle" dir="auto" placeholder="${esc(t('notes.titlePh'))}" value="${esc(n.title)}"><input type="date" class="in" id="neDay" value="${n.day}"></div>
   <div class="neimgs" id="neImgs">${n.imgs.map((id,i)=>`<div class="neimg" draggable="true" data-i="${i}"><img data-img="${id}" alt="">${i===0?`<span class="ncov">${t('notes.cover')}</span>`:''}<div class="neact">${i>0?`<button data-mv="-1" title="${esc(t('notes.earlier'))}">${earlier}</button>`:''}<button data-del title="${esc(t('del'))}">✕</button>${i<n.imgs.length-1?`<button data-mv="1" title="${esc(t('notes.later'))}">${later}</button>`:''}</div></div>`).join('')}<label class="neadd"><b>＋</b><span>${t('notes.addImg')}</span><input type="file" accept="image/*" multiple hidden id="neFile"></label></div>
   ${n.imgs.length>1?`<small class="nehint">${t('notes.orderHint')}</small>`:''}
   <textarea class="in nebody" id="neBody" dir="auto" placeholder="${esc(t('notes.bodyPh'))}">${esc(n.body)}</textarea>
   <div class="neft">${n._new?'':`<button class="btn ghost danger" id="neDel">${t('del')}</button>`}<span class="nesp"></span><button class="btn" id="neCancel">${t('lt.cancel')}</button><button class="btn pri" id="neSave">${t('q.save')}</button></div>`;
  hydrateNoteImgs($('#neImgs'));
  const mv=(i,j)=>{neRead();if(j<0||j>=NE.imgs.length)return;const [x]=NE.imgs.splice(i,1);NE.imgs.splice(j,0,x);renderNoteEd()};
  $$('#neImgs .neimg').forEach(el=>{const i=+el.dataset.i;
    el.querySelectorAll('[data-mv]').forEach(b=>b.onclick=e=>{e.preventDefault();mv(i,i+ +b.dataset.mv)});
    el.querySelector('[data-del]').onclick=e=>{e.preventDefault();neRead();NE.imgs.splice(i,1);renderNoteEd()};
    el.onclick=e=>{if(e.target.closest('button,[data-mv],[data-del]'))return;neRead();lbOpen(NE.imgs.slice(),i,NE.title)};
    el.ondragstart=e=>{e.dataTransfer.setData('text/plain',String(i));el.classList.add('drag')};el.ondragend=()=>el.classList.remove('drag');
    el.ondragover=e=>{e.preventDefault();el.classList.add('over')};el.ondragleave=()=>el.classList.remove('over');
    el.ondrop=e=>{e.preventDefault();const from=+e.dataTransfer.getData('text/plain');if(!isNaN(from)&&from!==i)mv(from,i)}});
  $('#neFile').onchange=async e=>{neRead();const files=[...e.target.files];e.target.value='';if(!files.length)return;let bad=0,heic=0;for(const f of files){try{const d=await shrinkImage(f);const id=uid();await idbSet('nimg:'+id,d);nImgMem[id]=d;NE.imgs.push(id);NE._added.push(id)}catch(x){bad++;if(x&&x.message==='heic')heic++}}if(bad)toast(t(heic?'notes.imgHeic':'notes.imgErr'));renderNoteEd()};
  $('#neCancel').onclick=()=>closeNote(false);$('#neSave').onclick=()=>closeNote(true);
  const del=$('#neDel');if(del)del.onclick=()=>{if(!confirm(t('notes.delQ')))return;const n0=NOTES().find(x=>x.id===NE.id);S.notes=NOTES().filter(x=>x.id!==NE.id);if(n0)dropImgs(n0.imgs||[]);dropImgs(NE._added);NE=null;save();$('#noteModal').classList.remove('on');notesChanged()};
  const ta=$('#neBody');const grow=()=>{ta.style.height='auto';ta.style.height=Math.min(ta.scrollHeight+4,window.innerHeight*.55)+'px'};ta.oninput=grow;grow()}
function dropImgs(ids){const used=new Set();NOTES().forEach(n=>(n.imgs||[]).forEach(i=>used.add(i)));(S.boards||[]).forEach(b=>(b.els||[]).forEach(e=>{if(e.img)used.add(e.img)}));stImgIds().forEach(i=>used.add(i));ids.forEach(id=>{if(!used.has(id)){idbSet('nimg:'+id,null);delete nImgMem[id]}})}
function closeNote(saveIt){if(!NE)return;neRead();const n=NE;
  if(saveIt&&(n.title.trim()||n.body.trim()||n.imgs.length||(n.auds||[]).length)){const rec={id:n.id,title:n.title.trim(),body:n.body.replace(/\s+$/,''),day:n.day||todayKey(),imgs:n.imgs,created:n.created,updated:Date.now(),...(n.ay?{ay:n.ay}:{}),...(n.src?{src:n.src}:{}),...(n.pin?{pin:1}:{}),...((n.auds||[]).length?{auds:n.auds}:{}),...(n.lock?{lock:1}:{}),...(n.ord!=null?{ord:n.ord}:(n._new&&NOTES().some(x=>x.ord!=null)?{ord:Date.now()}:{}))};
    const i=NOTES().findIndex(x=>x.id===n.id);if(i>=0)S.notes[i]=rec;else NOTES().push(rec);dropImgs(n._orig.filter(x=>!n.imgs.includes(x)));save()}
  else dropImgs(n._added);
  NE=null;$('#noteModal').classList.remove('on');notesChanged()}
function notesChanged(){if(curView()==='quran')try{qApplyMarks()}catch(e){}renderDayNotes($('#todayNotes'),todayKey());if(curView()==='boards'&&nbMode==='notes')renderNotes();if(curView()==='cal'&&$('#calNotes'))renderCal()}
$('#noteModal').onclick=e=>{if(e.target.id==='noteModal')closeNote(true)};
function shrinkImage(file,max=1600,q=.82){return new Promise((res,rej)=>{const url=URL.createObjectURL(file);const im=new Image();im.onload=()=>{let w=im.naturalWidth,h=im.naturalHeight;const k=Math.min(1,max/Math.max(w,h));w=Math.round(w*k);h=Math.round(h*k);
  const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,w,h);x.drawImage(im,0,0,w,h);URL.revokeObjectURL(url);res(c.toDataURL('image/jpeg',q))};im.onerror=async()=>{URL.revokeObjectURL(url);
    /* fallback: some phones give files the <img> decoder refuses; try the bitmap decoder, then a data URL */
    try{const bm=await createImageBitmap(file);let w=bm.width,h=bm.height;const k=Math.min(1,max/Math.max(w,h));w=Math.round(w*k);h=Math.round(h*k);const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,w,h);x.drawImage(bm,0,0,w,h);res(c.toDataURL('image/jpeg',q));return}catch(e){}
    try{const du=await new Promise((ok,no)=>{const fr=new FileReader();fr.onload=()=>ok(fr.result);fr.onerror=no;fr.readAsDataURL(file)});const im2=new Image();im2.onload=()=>{let w=im2.naturalWidth,h=im2.naturalHeight;const k=Math.min(1,max/Math.max(w,h));w=Math.round(w*k);h=Math.round(h*k);const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,w,h);x.drawImage(im2,0,0,w,h);res(c.toDataURL('image/jpeg',q))};im2.onerror=()=>rej(new Error(/hei[cf]/i.test(file.type+file.name)?'heic':'img'));im2.src=du}catch(e){rej(new Error('img'))}};im.src=url})}
/* ---- tiny zip writer (stored, UTF-8 names) ---- */
const CRC_T=(()=>{const t_=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t_[n]=c>>>0}return t_})();
function crc32(b){let c=0xFFFFFFFF;for(let i=0;i<b.length;i++)c=CRC_T[(c^b[i])&255]^(c>>>8);return(c^0xFFFFFFFF)>>>0}
function makeZip(files){const enc=new TextEncoder(),parts=[],cen=[];let off=0;const d=new Date(),dt=((d.getHours()<<11)|(d.getMinutes()<<5)|(d.getSeconds()>>1)),dd=(((d.getFullYear()-1980)<<9)|((d.getMonth()+1)<<5)|d.getDate());
  for(const f of files){const nm=enc.encode(f.name),data=f.data,crc=crc32(data);const h=new DataView(new ArrayBuffer(30));
    h.setUint32(0,0x04034b50,true);h.setUint16(4,20,true);h.setUint16(6,0x0800,true);h.setUint16(8,0,true);h.setUint16(10,dt,true);h.setUint16(12,dd,true);h.setUint32(14,crc,true);h.setUint32(18,data.length,true);h.setUint32(22,data.length,true);h.setUint16(26,nm.length,true);h.setUint16(28,0,true);
    parts.push(new Uint8Array(h.buffer),nm,data);
    const c=new DataView(new ArrayBuffer(46));c.setUint32(0,0x02014b50,true);c.setUint16(4,20,true);c.setUint16(6,20,true);c.setUint16(8,0x0800,true);c.setUint16(10,0,true);c.setUint16(12,dt,true);c.setUint16(14,dd,true);c.setUint32(16,crc,true);c.setUint32(20,data.length,true);c.setUint32(24,data.length,true);c.setUint16(28,nm.length,true);c.setUint32(42,off,true);
    cen.push(new Uint8Array(c.buffer),nm);off+=30+nm.length+data.length}
  const cs=cen.reduce((a,b)=>a+b.length,0),e=new DataView(new ArrayBuffer(22));e.setUint32(0,0x06054b50,true);e.setUint16(8,files.length,true);e.setUint16(10,files.length,true);e.setUint32(12,cs,true);e.setUint32(16,off,true);
  return new Blob([...parts,...cen,new Uint8Array(e.buffer)],{type:'application/zip'})}
function b64Bytes(b64){const s_=atob(b64),u=new Uint8Array(s_.length);for(let i=0;i<s_.length;i++)u[i]=s_.charCodeAt(i);return u}
async function saveBytes(name,mime,data){const blob=data instanceof Blob?data:new Blob([data],{type:mime});
  if(ANDROID&&window.ThabatAndroid.saveFile){const buf=new Uint8Array(await blob.arrayBuffer());let bin='';for(let i=0;i<buf.length;i+=0x8000)bin+=String.fromCharCode.apply(null,buf.subarray(i,i+0x8000));
    const where=window.ThabatAndroid.saveFile(name,mime,btoa(bin));toast(where?t('toast.savedTo',where):t('toast.saveFail'));return}
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.append(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},4000)}
async function exportObsidian(){toast(t('notes.exporting'));const enc=new TextEncoder(),files=[],root='Thabat/',safe=x=>String(x||'').replace(/[\\/:*?"<>|#^\[\]\n\r]/g,' ').replace(/\s+/g,' ').trim().slice(0,90);
  const iso=ms=>new Date(ms||Date.now()).toISOString().slice(0,19);const used=new Set(),names={},byDay={};
  for(const n of sortNotes(NOTES().slice()).reverse()){let base=safe(n.title)||(n.day+' '+t('notes.note'));let nm=base,i=2;while(used.has(nm.toLowerCase()))nm=base+' '+(i++);used.add(nm.toLowerCase());names[n.id]=nm;(byDay[n.day]=byDay[n.day]||[]).push(nm)}
  for(const n of NOTES()){const emb=[];for(const id of n.imgs||[]){const d=await nImg(id);if(!d)continue;files.push({name:root+'attachments/'+id+'.jpg',data:b64Bytes(d.split(',')[1])});emb.push('![['+id+'.jpg]]')}
    const md=`---\ndate: ${n.day}\ncreated: ${iso(n.created)}\nupdated: ${iso(n.updated||n.created)}\ntags: [thabat]\n---\n\n${n.title?'# '+n.title+'\n\n':''}${emb.length?emb.join('\n')+'\n\n':''}${n.body||''}\n\n— [[${n.day}]]\n`;
    files.push({name:root+t('notes.folder')+'/'+names[n.id]+'.md',data:enc.encode(md)})}
  for(const k of [...new Set([...Object.keys(S.days),...Object.keys(byDay)])].sort()){const d=S.days[k]||{};const has=(d.sessions||[]).length||(d.tasks||[]).length||(d.summary||'').trim()||(d.media||[]).length||byDay[k];if(!has)continue;
    let md=`---\ndate: ${k}\ntags: [thabat/daily]\n---\n\n`+(S.days[k]?dayMarkdown(k):`# ${gStr(keyToDate(k))}\n`);if(byDay[k])md+=`\n## ${t('notes.title')}\n`+byDay[k].map(x=>`- [[${x}]]`).join('\n')+'\n';
    files.push({name:root+t('notes.daily')+'/'+k+'.md',data:enc.encode(md)})}
  if(!files.length){toast(t('notes.nothing'));return}
  await saveBytes('Thabat-Obsidian-'+todayKey()+'.zip','application/zip',makeZip(files))}


