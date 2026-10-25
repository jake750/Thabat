/* ============ 3.114 tenth list H: import a Notion export (Markdown) into notes with its folders, several note lines into tasks at once ============ */
/* 10th-97: Notion «Export → Markdown & CSV» gives a .zip (sometimes zips inside it): «Title <32 hex>.md» pages, a folder «Title <hex>/» for a page's sub-pages and pictures.
   Folders become note folders, pages become notes (fixed ids ntn-<hash of path>, so a second import adds only new pages), links to other pages become [[title]], pictures go into the note's pictures; CSV tables are skipped. */
const NTN_HX=/\s+[0-9a-f]{32}$/i;
function ntnName(seg){return decodeURIComponent(String(seg)).replace(/\.(md|csv)$/i,'').replace(NTN_HX,'').trim()||'—'}
async function ntnEntries(file){const out=[];const walk=async(f,depth)=>{for(const e of await unzipFiles(f)){if(/\.zip$/i.test(e.path)&&depth<2){try{await walk(await e.get(),depth+1)}catch(x){}}else out.push(e)}};await walk(file,0);return out}
function ntnOpen(){const inp=document.createElement('input');inp.type='file';inp.accept='.zip,application/zip';inp.style.display='none';document.body.append(inp);
  inp.onchange=async()=>{const f=inp.files[0];inp.remove();if(!f)return;let es;try{es=await ntnEntries(f)}catch(e){toast(t('ntn.bad'));return}
    const md=es.filter(e=>/\.md$/i.test(e.path)),csv=es.filter(e=>/\.csv$/i.test(e.path)).length,img=es.filter(e=>/\.(png|jpe?g|gif|webp|bmp)$/i.test(e.path));
    if(!md.length){toast(t('ntn.none'));return}const have=new Set(NOTES().map(n=>n.id)),fresh=md.filter(e=>!have.has('ntn-'+bkHash(e.path))).length;
    openInfo(t('ntn.t'),`<div class="ntnw"><p>${esc(t('ntn.found',md.length,img.length))}</p>${csv?`<p class="muted">${esc(t('ntn.csv',csv))}</p>`:''}${fresh<md.length?`<p class="muted">${esc(t('ntn.dup',md.length-fresh))}</p>`:''}
      <label class="row" style="gap:8px"><input type="checkbox" id="ntnIn" checked> ${esc(t('ntn.inOne'))}</label><button class="btn pri" id="ntnGo" ${fresh?'':'disabled'}>${esc(t('ntn.go',fresh))}</button><p class="muted" id="ntnSt"></p></div>`);
    $('#ntnGo').onclick=()=>ntnRun(es,$('#ntnIn').checked)};inp.click()}
async function ntnRun(es,inOne){const btn=$('#ntnGo');if(btn)btn.disabled=true;const st=$('#ntnSt'),before=JSON.stringify({n:NOTES().map(n=>n.id),f:NFOLD().map(x=>x.id)});
  const files=new Map(es.map(e=>[e.path,e])),md=es.filter(e=>/\.md$/i.test(e.path)),have=new Set(NOTES().map(n=>n.id)),fmap=new Map(),made=[],mkF=[];
  const root=inOne?nfMk('Notion',null):null;if(root)mkF.push(root.id);
  const folderOf=dir=>{if(!dir)return root?root.id:null;if(fmap.has(dir))return fmap.get(dir);const segs=dir.split('/'),parent=folderOf(segs.slice(0,-1).join('/')),f=nfMk(ntnName(segs[segs.length-1]),parent);mkF.push(f.id);fmap.set(dir,f.id);return f.id};
  const titleOf=p=>ntnName(p.split('/').pop());let i=0,pics=0;
  for(const e of md){i++;if(st)st.textContent=t('ntn.prog',i,md.length);const id='ntn-'+bkHash(e.path);if(have.has(id))continue;
    let body='';try{body=await (await e.get()).text()}catch(x){continue}const dir=e.path.split('/').slice(0,-1).join('/'),title=titleOf(e.path);
    body=body.replace(/^﻿/,'').replace(/^#\s+(.+)\n+/,(m,h)=>h.trim()===title?'':m);
    const imgs=[];body=await (async()=>{const re=/!\[([^\]]*)\]\(([^)]+)\)/g;let out='',last=0,m;while((m=re.exec(body))){out+=body.slice(last,m.index);last=re.lastIndex;const src=m[2].trim();
      if(/^https?:/i.test(src)){out+=m[0];continue}const p=(dir?dir+'/':'')+decodeURIComponent(src).replace(/^\.\//,'');const fe=files.get(p);
      if(fe){try{const d=await shrinkImage(await fe.get());const iid=uid();await idbSet('nimg:'+iid,d);imgs.push(iid);pics++;continue}catch(x){}}out+=m[0]}return out+body.slice(last)})();
    body=body.replace(/\[([^\]]+)\]\(([^)]+?\.md)\)/g,(m,tx,href)=>/^https?:/i.test(href)?m:`[[${ntnName(decodeURIComponent(href).split('/').pop())}]]`).replace(/\n{3,}/g,'\n\n').trim();
    const now=Date.now(),fd=folderOf(dir),n={id,title:title.slice(0,200),body,imgs,created:now,updated:now,day:todayKey(),ntn:1};if(fd)n.fd=fd;NOTES().push(n);made.push(id)}
  /* folders that got no notes and no sub-folders with notes are dropped */
  const used=new Set(NOTES().filter(n=>n.fd).map(n=>n.fd));let changed=true;while(changed){changed=false;NFOLD().forEach(x=>{if(x.parent&&used.has(x.id)&&!used.has(x.parent)){used.add(x.parent);changed=true}})}
  S.nfold=NFOLD().filter(x=>!mkF.includes(x.id)||used.has(x.id));save();try{notesChanged()}catch(e){}$$('.modal.on').forEach(m=>m.classList.remove('on'));
  const keepF=new Set(JSON.parse(before).f),keepN=new Set(JSON.parse(before).n);
  toastAct(t('ntn.done',made.length,pics),t('undo'),()=>{S.notes=NOTES().filter(n=>keepN.has(n.id));S.nfold=NFOLD().filter(x=>keepF.has(x.id));save();try{notesChanged()}catch(e){}},12000)}
{hookFn('renderNotes',()=>renderNotes,f=>{renderNotes=f},'post',function(){try{const imp=$('#nObsIn');if(!imp||$('#ntnB'))return;imp.insertAdjacentHTML('afterend',`<button class="btn sm ghost" id="ntnB">⬇ ${esc(t('ntn.t'))}</button>`);$('#ntnB').onclick=ntnOpen}catch(e){}})}

/* 10th-100: ☑ in the note editor with a selection of several lines makes one task per line (list marks and checkboxes dropped, ticked lines skipped), one undo */
function ntkLines(txt){return txt.split('\n').filter(l=>!/^\s*(?:[-*+]|\d+[.)])\s+\[[xX]\]/.test(l)).map(l=>l.replace(/^\s*(?:[-*+]|\d+[.)])\s+(?:\[[ ]\]\s*)?/,'').replace(/^#+\s+/,'').trim()).filter(Boolean)}
{hookFn('renderNoteEd',()=>renderNoteEd,f=>{renderNoteEd=f},'post',function(){try{const b=$('#neToTask');if(!b||b.dataset.ntk)return;b.dataset.ntk=1;const one=b.onclick;
  b.onclick=ev=>{const ta=$('#neBody');if(!ta)return one&&one(ev);const s=ta.selectionStart,e=ta.selectionEnd,sel=ta.value.slice(s,e);if(s===e||!sel.includes('\n'))return one&&one(ev);
    const L_=ntkLines(sel);if(!L_.length){toast(t('lnk.noLine'));return}const d=day(todayKey()),ids=L_.map(()=>uid());L_.forEach((x,i)=>d.tasks.push({id:ids[i],text:x.slice(0,200),done:false,created:Date.now(),note:NE.id}));save();try{renderTasks()}catch(_){}
    toastAct(t('ntk.done',L_.length),t('undo'),()=>{const dd=day(todayKey());dd.tasks=dd.tasks.filter(x=>!ids.includes(x.id));save();try{renderTasks()}catch(_){}},8000)};
  b.title=t('ntk.tip')}catch(e){}})}
{const _cc=cmdCommands;cmdCommands=function(...a){const L_=_cc(...a);try{L_.push({icon:'⬇',label:t('ntn.t'),run:()=>{showView('notes');ntnOpen()},kw:'notion import استيراد'})}catch(e){}return L_}}
