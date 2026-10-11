/* ============ import from Obsidian ============ */
async function unzipFiles(file){const buf=new Uint8Array(await file.arrayBuffer()),dv=new DataView(buf.buffer),dec=new TextDecoder();let e=buf.length-22;while(e>=0&&dv.getUint32(e,true)!==0x06054b50)e--;if(e<0)throw new Error('zip');
  const n=dv.getUint16(e+10,true);let o=dv.getUint32(e+16,true);const out=[];
  for(let i=0;i<n;i++){if(dv.getUint32(o,true)!==0x02014b50)break;const meth=dv.getUint16(o+10,true),csz=dv.getUint32(o+20,true),nl=dv.getUint16(o+28,true),xl=dv.getUint16(o+30,true),cl=dv.getUint16(o+32,true),lo=dv.getUint32(o+42,true);
    const name=dec.decode(buf.subarray(o+46,o+46+nl));o+=46+nl+xl+cl;if(name.endsWith('/'))continue;
    const lnl=dv.getUint16(lo+26,true),lxl=dv.getUint16(lo+28,true),start=lo+30+lnl+lxl,raw=buf.subarray(start,start+csz);
    out.push({path:name,get:async()=>{if(meth===0)return new Blob([raw]);if(meth===8){const ds=new DecompressionStream('deflate-raw');return await new Response(new Blob([raw]).stream().pipeThrough(ds)).blob()}throw new Error('method')}})}
  return out}
const OBS_IMG=/\.(png|jpe?g|gif|webp|bmp|avif)$/i;
function obsFront(txt){const m=txt.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);if(!m)return{fm:{},body:txt};const fm={};m[1].split('\n').forEach(l=>{const x=l.match(/^([\w-]+)\s*:\s*(.*)$/);if(x)fm[x[1].toLowerCase()]=x[2].replace(/^["']|["']$/g,'').trim()});return{fm,body:txt.slice(m[0].length)}}
function obsDate(fm,name,lm){for(const v of [fm.date,fm.created,fm.day,name]){const m=String(v||'').match(/(\d{4})-(\d{2})-(\d{2})/);if(m)return m[0]}return dKey(new Date(lm||Date.now()))}
async function obsImport(fileList){const items=[];
  for(const f of fileList){const path=f.webkitRelativePath||f.name;if(/\.zip$/i.test(f.name)){try{(await unzipFiles(f)).forEach(z=>items.push(z))}catch(e){toast(t('obs.zipErr'))}}else items.push({path,file:f,get:async()=>f})}
  const clean=items.filter(x=>!/(^|\/)(\.obsidian|\.trash|\.git)\//.test(x.path));
  const mds=clean.filter(x=>/\.(md|markdown)$/i.test(x.path)),imgs={};clean.filter(x=>OBS_IMG.test(x.path)).forEach(x=>{imgs[x.path.split('/').pop().toLowerCase()]=x});
  if(!mds.length){toast(t('obs.none'));return}
  let added=0,updated=0,pics=0,skipped=0;const status=$('#obsSt');
  for(let i=0;i<mds.length;i++){const it=mds[i];if(status)status.textContent=t('obs.prog',i+1,mds.length);
    let txt='';try{txt=await (await it.get()).text()}catch(e){continue}
    const {fm,body}=obsFront(txt.replace(/\r\n/g,'\n'));const tags=String(fm.tags||'');if(/thabat\/daily/.test(tags)){skipped++;continue}
    const fname=it.path.split('/').pop().replace(/\.(md|markdown)$/i,'');let b=body;
    let title=fm.title||'';const h=b.match(/^\s*#\s+(.+)\n?/);if(!title&&h){title=h[1].trim();b=b.replace(h[0],'')}if(!title)title=fname;
    const embeds=[];b=b.replace(/!\[\[([^\]|#]+)(?:[|#][^\]]*)?\]\]/g,(m0,f)=>{embeds.push(f.trim());return''}).replace(/!\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g,(m0,f)=>{if(/^https?:/i.test(f))return m0;embeds.push(decodeURIComponent(f));return''});
    b=b.replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g,'$2').replace(/\[\[([^\]]+)\]\]/g,'$1').replace(/^—\s*\d{4}-\d{2}-\d{2}\s*$/m,'').replace(/\n{3,}/g,'\n\n').trim();
    const pp=it.path.split('/'),day=obsDate(fm,fname,it.file&&it.file.lastModified),src='obs:'+(pp.length>1?pp.slice(1):pp).join('/');
    const ids=[];for(const e of embeds){const x=imgs[e.split('/').pop().toLowerCase()];if(!x)continue;try{const d=await shrinkImage(await x.get());const id=uid();await idbSet('nimg:'+id,d);nImgMem[id]=d;ids.push(id);pics++}catch(er){}}
    const ex=NOTES().find(n=>n.src===src)||NOTES().find(n=>n.title===title&&n.day===day&&n.body===b);
    if(ex){if(ex.body!==b||ex.title!==title||(ids.length&&!(ex.imgs||[]).length)){ex.body=b;ex.title=title;ex.day=day;if(ids.length){const old=ex.imgs||[];ex.imgs=ids;dropImgs(old)}ex.updated=Date.now();ex.src=src;updated++}else{dropImgs(ids);skipped++}}
    else{NOTES().push({id:uid(),title,body:b,day,imgs:ids,created:Date.now(),updated:Date.now(),src});added++}}
  save();notesChanged();closeLt();
  toast(t('obs.done',added,updated,pics));if(curView()!=='boards'){nbMode='notes';showView('boards')}}
function openObsImport(){const box=$('#ltBox');box.innerHTML=`<h2>${t('obs.import')}</h2><p class="ltsub" style="line-height:1.8">${t('obs.how')}</p>
   <div class="suopts">${ANDROID?'':`<label class="btn pri" style="justify-content:center">📁 ${t('obs.folder')}<input type="file" id="obsDir" webkitdirectory multiple hidden></label>`}<label class="btn ${ANDROID?'pri':''}" style="justify-content:center">📄 ${t('obs.files')}<input type="file" id="obsFiles" multiple accept=".md,.markdown,.zip,.txt,image/*" hidden></label></div>
   <small class="sunote" id="obsSt">${t('obs.note')}</small><div class="ltact"><button class="btn ghost" id="obsX">${t('lt.cancel')}</button></div>`;
  $('#ltModal').classList.add('on');$('#obsX').onclick=closeLt;
  const go=e=>{const fl=[...e.target.files];if(fl.length)obsImport(fl)};const d=$('#obsDir');if(d)d.onchange=go;$('#obsFiles').onchange=go}
$('#nObsIn').onclick=()=>openObsImport();

