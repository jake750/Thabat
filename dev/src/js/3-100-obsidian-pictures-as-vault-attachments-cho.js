/* ============ 3.100 Obsidian: pictures as vault attachments, choosing the note folders, conflict copies ============ */
/* pictures: <sub>/مرفقات/<id>.<ext>, listed after the text under a marker line; an image embed typed or pasted in Obsidian
   (anywhere in the text, or added under the marker) is read into the note's pictures; a line removed under the marker drops that picture */
const OBS_ATT='مرفقات',OBS_MK='<!-- thabat-imgs -->';
function obsExt(id){const d=(typeof nImgMem!=='undefined'&&nImgMem[id])||'';return/^data:image\/png/.test(d)?'png':/^data:image\/webp/.test(d)?'webp':/^data:image\/gif/.test(d)?'gif':'jpg'}
function obsImgBlock(n){const L_=(n.imgs||[]).filter(Boolean);if(!L_.length)return'';return`\n${OBS_MK}\n`+L_.map(id=>`![[${obsSub()}/${OBS_ATT}/${id}.${obsExt(id)}]]`).join('\n')+'\n'}
function obsDataBlob(d){const m=String(d).match(/^data:([^;,]+)(;base64)?,(.*)$/);if(!m)return null;const raw=m[2]?atob(m[3]):decodeURIComponent(m[3]),u=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)u[i]=raw.charCodeAt(i);return new Blob([u],{type:m[1]})}
/* write the note's pictures that the vault does not have yet */
async function obsAtt(base,n){const L_=(n.imgs||[]).filter(Boolean);if(!L_.length)return;let dir;try{dir=await base.getDirectoryHandle(OBS_ATT,{create:true})}catch(e){return}
  for(const id of L_){let d=nImgMem[id];if(!d){try{d=await idbGet('nimg:'+id)}catch(e){}if(!d)continue;nImgMem[id]=d}const name=id+'.'+obsExt(id);
    try{await dir.getFileHandle(name);continue}catch(e){}try{const b=obsDataBlob(d);if(!b)continue;const fh=await dir.getFileHandle(name,{create:true}),w=await fh.createWritable();await w.write(b);await w.close()}catch(e){}}}
/* find a picture in the vault: by its path from the vault root, else by its file name anywhere (Obsidian resolves embeds by name) */
async function obsImgIdx(root){if(OBS.imgIdx)return OBS.imgIdx;const idx={};async function obsIw(d,depth){if(depth>8)return;for await(const [nm,h] of d.entries()){if(nm.startsWith('.'))continue;if(h.kind==='directory')await obsIw(h,depth+1);else if(/\.(png|jpe?g|gif|webp|bmp)$/i.test(nm)&&!idx[nm.toLowerCase()])idx[nm.toLowerCase()]=h}}
  try{await obsIw(root,0)}catch(e){}return OBS.imgIdx=idx}
async function obsImgImport(root,ref){try{let fh=null;const parts=ref.split('/').filter(Boolean);
    try{let d=root;for(const p of parts.slice(0,-1))d=await d.getDirectoryHandle(p);fh=await d.getFileHandle(parts[parts.length-1])}catch(e){}
    if(!fh)fh=(await obsImgIdx(root))[parts[parts.length-1].toLowerCase()];if(!fh)return null;
    const f=await fh.getFile(),data=await shrinkImage(f),id=uid();await idbSet('nimg:'+id,data);nImgMem[id]=data;return id}catch(e){return null}}
async function obsBodyIn(n,body,root){let imgs=(n.imgs||[]).slice(),b=body;const i=b.indexOf(OBS_MK);
  if(i>=0){const blk=b.slice(i),refs=[...blk.matchAll(/!\[\[([^\]|]+)/g)].map(x=>x[1].trim()),ids=refs.map(r=>r.split('/').pop().replace(/\.\w+$/,''));b=b.slice(0,i).replace(/\n+$/,'\n');
    const known=new Set(imgs);imgs=imgs.filter(id=>ids.includes(id));for(let j=0;j<refs.length;j++){if(known.has(ids[j]))continue;const id=await obsImgImport(root,refs[j]);if(id)imgs.push(id)}}
  let out=b;for(const x of [...b.matchAll(/!\[\[([^\]|]+\.(?:png|jpe?g|gif|webp|bmp))(?:\|[^\]]*)?\]\]\n?/gi)]){const id=await obsImgImport(root,x[1].trim());if(id){imgs.push(id);out=out.replace(x[0],'')}}
  return{body:out,imgs}}
{hookFn('obsSync',()=>obsSync,f=>{obsSync=f},'pre',function(){OBS.imgIdx=null})}

/* folders: S.settings.obsEx = note-folder ids left out ('_root' = notes outside any folder); a left-out note's file stays in the vault untouched */
function obsIn(n){const ex=S.settings.obsEx;if(!ex||!ex.length)return true;if(!n.fd)return!ex.includes('_root');const F=NFOLD();let f=F.find(x=>x.id===n.fd),g=0;while(f&&g++<20){if(ex.includes(f.id))return false;f=f.parent&&F.find(x=>x.id===f.parent)}return true}
function obsFdPaint(){const box=$('#obsBox');if(!box||box.querySelector('.obsfd'))return;const F=NFOLD(),ex=S.settings.obsEx||[],kids=p=>F.filter(f=>(f.parent||null)===p&&!f.arc);
  const rows=[];const add=(f,d)=>{rows.push(`<label class="chk obsfr" style="padding-inline-start:${d*18}px"><input type="checkbox" data-obf="${f.id}" ${ex.includes(f.id)?'':'checked'}><span>${esc(f.n||'')}</span></label>`);kids(f.id).forEach(k=>add(k,d+1))};kids(null).forEach(f=>add(f,0));
  const on=F.filter(f=>!ex.includes(f.id)).length+(ex.includes('_root')?0:1),all=F.length+1;
  const html=`<details class="obsfd"><summary>${esc(t('obs3.fd',on,all))}</summary><p class="muted">${esc(t('obs3.fdS'))}</p><label class="chk obsfr"><input type="checkbox" data-obf="_root" ${ex.includes('_root')?'':'checked'}><span>${esc(t('obs3.root'))}</span></label>${rows.join('')}</details>`;
  const live=box.querySelector('[data-ob="live"]'),fld=live&&live.closest('.field');if(fld)fld.insertAdjacentHTML('afterend',html);else box.insertAdjacentHTML('beforeend',html);
  box.querySelectorAll('[data-obf]').forEach(c=>c.onchange=()=>{const s=new Set(S.settings.obsEx||[]);if(c.checked)s.delete(c.dataset.obf);else s.add(c.dataset.obf);S.settings.obsEx=[...s];if(!S.settings.obsEx.length)delete S.settings.obsEx;save();
    const sm=box.querySelector('.obsfd summary'),E=S.settings.obsEx||[];if(sm)sm.textContent=t('obs3.fd',F.filter(f=>!E.includes(f.id)).length+(E.includes('_root')?0:1),all)})}
{const _p=obsPaint;obsPaint=async function(...a){const r=await _p(...a);try{obsFdPaint()}catch(e){console.error(e)}return r}}

/* conflicts: when a note changed on both sides since the last sync, the losing version is kept as «<title> (تعارض …).md» beside it,
   without the thabat-id line, so the next pass brings it into Thabat as a note of its own */
async function obsConflict(base,path,txt){try{const d=new Date(),p2=n=>String(n).padStart(2,'0'),stamp=`${d.getFullYear()}-${p2(d.getMonth()+1)}-${p2(d.getDate())} ${p2(d.getHours())}-${p2(d.getMinutes())}`;
  const {fm,body}=obsFront(txt),title=(fm.title||path.split('/').pop().replace(/\.md$/i,''))+' ('+t('obs3.cfw')+')';
  const out=`---\ntitle: "${title.replace(/"/g,'”')}"\ncreated: ${fm.created||new Date().toISOString().slice(0,19)}\nupdated: ${new Date().toISOString().slice(0,19)}\n---\n${body}`;
  await obsWrite(base,path.replace(/\.md$/i,'')+` (${t('obs3.cfw')} ${stamp}).md`,out)}catch(e){console.error(e)}}

