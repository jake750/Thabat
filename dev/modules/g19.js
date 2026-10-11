/* ============ v3.14: library shelves — your own folders inside the app, course cards, search, sorting, covers ============ */
/* S.lib.shelf: [{id,n,parent,course,items:[{t:'d'|'m',id}]}] — references only; files on the PC never move.
   S.lib.meta[id]: {cover:dataURL, stars, note} for a PC course or a shelf folder. S.lib.sort, S.lib.hideDone, S.lib.showAll */
function LSH(){const L_=LIBS();L_.shelf=L_.shelf||[];L_.meta=L_.meta||{};return L_.shelf}
const LIBX={q:'',ctx:null};
function lshGet(id){return LSH().find(f=>f.id===id)}
function lshKids(pid){return LSH().filter(f=>(f.parent||null)===(pid||null)).sort((a,b)=>a.n.localeCompare(b.n,undefined,{numeric:true}))}
function lshPath(id){const out=[];let f=lshGet(id),g=0;while(f&&g++<30){out.unshift(f);f=f.parent?lshGet(f.parent):null}return out}
/* every lesson under a shelf folder, in order: its own items, then its sub-folders */
function lshMedia(id,seen){seen=seen||new Set();if(seen.has(id))return[];seen.add(id);const f=lshGet(id);if(!f)return[];const out=[];
  (f.items||[]).forEach(r=>{const n=libFind(r.id);if(!n)return;if(r.t==='d')libMedia(n).forEach(x=>out.push({...x,ch:n.n+(x.ch?' › '+x.ch:'')}));else if(n.k==='v'||n.k==='a')out.push({...n,ch:''})});
  lshKids(id).forEach(k=>lshMedia(k.id,seen).forEach(x=>out.push({...x,ch:k.n+(x.ch?' › '+x.ch:'')})));
  const ids=new Set();return out.filter(x=>!ids.has(x.id)&&ids.add(x.id))}
function lshProg(list){const P=LIBS().prog,done=list.filter(x=>P[x.id]&&P[x.id].done).length,last=Math.max(0,...list.map(x=>(P[x.id]&&P[x.id].at)||0));return{n:list.length,done,first:list[0],next:list.find(x=>!(P[x.id]&&P[x.id].done)),last,pct:list.length?Math.round(done/list.length*100):0}}
function lshPlaced(){const s=new Set();LSH().forEach(f=>(f.items||[]).forEach(r=>{s.add(r.id);if(r.t==='d'){const n=libFind(r.id);if(n)libMedia(n).forEach(x=>s.add(x.id))}}));return s}
function lshMeta(id){return LIBS().meta[id]||{}}
const lshDoneIn=d=>`<i>${d?'✓':'○'}</i><span>${d?t('lb.watched'):t('lsh.notYet')}</span>`;
function lshSort(arr,prog){const m=LIBS().sort||'recent';return arr.sort((a,b)=>m==='name'?String(a.n).localeCompare(String(b.n),undefined,{numeric:true}):m==='prog'?(prog(b).pct-prog(a).pct):(prog(b).last-prog(a).last))}
/* the course card: cover (chosen image or a frame of the first lesson), completion ring, lessons, stars, «continue» */
function lshCard(kind,id,name,pr){const me=lshMeta(id),R=16,C=2*Math.PI*R,cover=me.cover?`<img src="${me.cover}" alt="">`:LIB.base&&pr.first&&pr.first.k==='v'?`<img loading="lazy" data-th="${pr.first.id}" alt="">`:'';
  return`<div class="lshc" data-card="${kind}:${id}"><span class="lshcv">${cover}<i>🎬</i><svg class="lshring" viewBox="0 0 40 40"><circle cx="20" cy="20" r="${R}"/><circle class="v" cx="20" cy="20" r="${R}" stroke-dasharray="${(C*pr.pct/100).toFixed(1)} ${C.toFixed(1)}"/><text x="20" y="24">${pr.pct}%</text></svg></span>
    <b dir="auto">${esc(name)}</b><small>${t('lb.done',pr.done,pr.n)}${me.stars?' · '+'★'.repeat(me.stars):''}</small><span class="lbpb"><i style="width:${pr.pct}%"></i></span>
    ${pr.next?`<button class="btn sm pri lshgo" data-play="${pr.next.id}" data-ctx="${kind}:${id}">▶ ${pr.done?t('lb.cont'):t('lb.start')}</button>`:pr.n?`<span class="lshok">✓ ${t('lsh.finished')}</span>`:''}</div>`}
function lshFolderTile(f){const kids=lshKids(f.id).length,n=(f.items||[]).length;return`<button class="lshf" data-folder="${f.id}"><span>📁</span><b dir="auto">${esc(f.n)}</b><small>${t('lsh.count',kids+n)}</small></button>`}
/* one lesson row, shared by every list */
function lshRow(x,P,inFolder){const p=P[x.id]||{},pct=p.d?Math.min(100,p.p/p.d*100):0;
  return`<div class="lbl ${p.done?'done':''}" data-play="${x.id}"><span class="lbth">${LIB.base&&x.k==='v'?`<img loading="lazy" data-th="${x.id}" alt="">`:''}<i>${x.k==='a'?'🎧':'▶'}</i></span><span class="lbt"><b dir="auto">${esc(libTitle(x.n))}</b><small>${p.d?fmtTC(p.d):fmtSz(x.s)}${!p.done&&pct>2?' · '+Math.round(pct)+'%':''}${x.ch?' · <span dir="auto">'+esc(x.ch)+'</span>':''}</small><span class="lbpb"><i style="width:${p.done?100:pct}%"></i></span></span>
    <button class="lshdone ${p.done?'on':''}" data-done="${x.id}" title="${esc(p.done?t('lb.watched'):t('lsh.notYet'))}">${lshDoneIn(p.done)}</button><button class="lshm" data-lm="${x.id}" ${inFolder?`data-inf="${inFolder}"`:''} aria-label="⋯">⋯</button></div>`}
function lshTop(){const L_=LIBS(),P=L_.prog,cs=libCourses(),placed=lshPlaced(),showAll=!!L_.showAll;
  const pcs=lshSort(cs.filter(c=>showAll||!placed.has(c.id)).map(c=>({...c,_p:libCourseProg(c)})).map(c=>({...c,_p:{...c._p,pct:c._p.n?Math.round(c._p.done/c._p.n*100):0,last:Math.max(0,...libMedia(c).map(x=>(P[x.id]&&P[x.id].at)||0))}})),c=>c._p).filter(c=>!(L_.hideDone&&c._p.n&&c._p.done===c._p.n));
  const top=lshKids(null),courses=lshSort(top.filter(f=>f.course).map(f=>({...f,_p:lshProg(lshMedia(f.id))})),f=>f._p).filter(f=>!(L_.hideDone&&f._p.n&&f._p.done===f._p.n)),plain=top.filter(f=>!f.course);
  const cont=Object.entries(P).filter(([id,p])=>!p.done&&p.p>10).sort((a,b)=>b[1].at-a[1].at).slice(0,4);
  const tools=`<div class="lshtools"><select class="in" id="lshSort">${['recent','name','prog'].map(k=>`<option value="${k}" ${(L_.sort||'recent')===k?'selected':''}>${t('lsh.sort.'+k)}</option>`).join('')}</select><label class="lshck"><input type="checkbox" id="lshHide" ${L_.hideDone?'checked':''}> ${t('lsh.hideDone')}</label></div>`;
  return`${cont.length?`<h4 class="lbfh">⏯ ${t('lb.continue')}</h4><div class="lbcw">${cont.map(([id,p])=>`<button class="lbcwi" data-play="${id}"><b dir="auto">${esc(p.n||'')}</b><small dir="auto">${esc(p.c||'')}</small><span class="lbpb"><i style="width:${p.d?Math.min(100,p.p/p.d*100):0}%"></i></span></button>`).join('')}</div>`:''}
    <div class="lshh"><h4 class="lbfh">🗂 ${t('lsh.mine')}</h4><button class="btn sm" id="lshNew">＋ ${t('lsh.newFolder')}</button></div>
    ${courses.length||plain.length?`${courses.length?`<div class="lshgrid">${courses.map(f=>lshCard('f',f.id,f.n,f._p)).join('')}</div>`:''}${plain.length?`<div class="lshfs">${plain.map(lshFolderTile).join('')}</div>`:''}`:`<p class="muted lshhint">${t('lsh.hint')}</p>`}
    ${cs.length?`<div class="lshh"><h4 class="lbfh">💻 ${showAll?t('lsh.pcAll'):t('lsh.pcNew')}</h4><button class="btn sm ghost" id="lshAll">${showAll?t('lsh.showNew'):t('lsh.showAll')}</button></div>${tools}
      ${pcs.length?`<div class="lshgrid">${pcs.map(c=>lshCard('d',c.id,c.loose?t('lb.loose',c.n):c.n,c._p)).join('')}</div>`:`<p class="muted lshhint">${t('lsh.allPlaced')}</p>`}`:''}`}
function lshFolderView(id){const f=lshGet(id);if(!f){LIB.open=null;return lshTop()}const P=LIBS().prog,path=lshPath(id),kids=lshKids(id),list=lshMedia(id),pr=lshProg(list),me=lshMeta(id),rtl=document.documentElement.dir==='rtl';
  const own=(f.items||[]).map(r=>({r,n:libFind(r.id)})).filter(o=>o.n);
  const crumbs=`<div class="lbbar lshbar"><button class="btn sm ghost" id="lshUp">${rtl?'›':'‹'} ${f.parent?esc(lshGet(f.parent).n):t('lb.all')}</button><b dir="auto">${path.map(x=>esc(x.n)).join(' › ')}</b>${f.course?`<span class="lbpr">${t('lb.done',pr.done,pr.n)} · ${pr.pct}%</span>`:''}</div>`;
  const acts=`<div class="lshacts"><label class="lshck"><input type="checkbox" id="lshIsC" ${f.course?'checked':''}> 🎓 ${t('lsh.isCourse')}</label><button class="btn sm" id="lshAdd">＋ ${t('lsh.add')}</button><button class="btn sm ghost" id="lshSub">📁 ${t('lsh.newSub')}</button><button class="btn sm ghost" id="lshMore">⋯</button></div>`;
  const head=f.course?`<div class="lshhero">${lshCard('f',id,f.n,pr)}${me.note?`<p class="lshnote" dir="auto">${esc(me.note)}</p>`:''}</div>`:'';
  const sub=kids.length?`<div class="lshfs">${kids.map(k=>k.course?'':lshFolderTile(k)).join('')}</div>${kids.some(k=>k.course)?`<div class="lshgrid">${kids.filter(k=>k.course).map(k=>lshCard('f',k.id,k.n,lshProg(lshMedia(k.id)))).join('')}</div>`:''}`:'';
  const linked=own.filter(o=>o.r.t==='d').map(o=>{const c=o.n;return lshCard('d',c.id,c.n,{...libCourseProg(c),pct:(()=>{const q=libCourseProg(c);return q.n?Math.round(q.done/q.n*100):0})()})}).join('');
  const singles=own.filter(o=>o.r.t==='m').map(o=>lshRow(o.n,P,id)).join('');
  /* a course folder lists all its lessons in order, with chapter headings; a plain folder shows cards */
  if(f.course&&list.length){let lastCh=null;const rows=list.map(x=>{const ch=x.ch!==lastCh?(lastCh=x.ch,x.ch?`<div class="lbch" dir="auto">${esc(x.ch)}</div>`:''):'';return ch+lshRow({...x,ch:''},P,own.some(o=>o.r.id===x.id)?id:'')}).join('');
    return crumbs+acts+head+(kids.some(k=>!k.course)?`<div class="lshfs">${kids.filter(k=>!k.course).map(lshFolderTile).join('')}</div>`:'')+`<div class="lbles">${rows}</div>`}
  return crumbs+acts+head+sub+(linked?`<div class="lshgrid">${linked}</div>`:'')+(singles?`<div class="lbles">${singles}</div>`:'')+(!kids.length&&!own.length?`<p class="muted lshhint">${t('lsh.empty')}</p>`:'')}
function lshSearch(q){const P=LIBS().prog,s=q.toLowerCase(),all=libCourses().flatMap(c=>libMedia(c).map(x=>({...x,ch:c.n+(x.ch?' › '+x.ch:'')}))),
  vids=all.filter(x=>libTitle(x.n).toLowerCase().includes(s)||x.ch.toLowerCase().includes(s)).slice(0,60),
  fol=LSH().filter(f=>f.n.toLowerCase().includes(s)),cs=libCourses().filter(c=>c.n.toLowerCase().includes(s)),
  files=libCourses().flatMap(c=>libFiles(c).map(f=>({...f,ch:c.n}))).filter(f=>f.n.toLowerCase().includes(s)).slice(0,30);
  if(!vids.length&&!fol.length&&!cs.length&&!files.length)return`<p class="muted lshhint">${t('lsh.noHits')}</p>`;
  return`${fol.length?`<div class="lshfs">${fol.map(lshFolderTile).join('')}</div>`:''}${cs.length?`<div class="lshgrid">${cs.map(c=>{const q=libCourseProg(c);return lshCard('d',c.id,c.n,{...q,pct:q.n?Math.round(q.done/q.n*100):0})}).join('')}</div>`:''}
    ${vids.length?`<div class="lbles">${vids.map(x=>lshRow(x,P)).join('')}</div>`:''}${files.length?`<h4 class="lbfh">📎 ${t('lb.files')}</h4><div class="lbfs">${files.map(f=>`<div class="lbf"><span dir="auto">${esc(f.n)}<small>${esc(f.ch||'')} · ${fmtSz(f.s)}</small></span></div>`).join('')}</div>`:''}`}
/* the page: the original head and the PC-course view stay; the home, folders and search are new */
{const _rl=renderLib;renderLib=function(){const isPc=LIB.open&&!String(LIB.open).startsWith('f:');if(isPc){_rl();lshPcCourseExtras();return}
  _rl();const box=$('#libBox');if(!box||!LIBS().token&&!LIB.tree)return;const head=box.querySelector('.lbhead');if(!head)return;
  if(!(LIB.tree||[]).length&&!LSH().length)return; // the original empty state (setup help) stays
  [...box.children].forEach(c=>{if(c!==head)c.remove()});
  head.insertAdjacentHTML('afterend',`<div class="lshsearch"><input class="in" id="lshQ" type="search" dir="auto" placeholder="🔍 ${esc(t('lsh.search'))}" value="${esc(LIBX.q)}"></div><div id="lshBody">${LIBX.q.trim()?lshSearch(LIBX.q.trim()):LIB.open?lshFolderView(String(LIB.open).slice(2)):lshTop()}</div>`);
  lshBind(box)}}
function lshBind(box){const L_=LIBS();
  const q=$('#lshQ');if(q){q.oninput=()=>{LIBX.q=q.value;const b=$('#lshBody');b.innerHTML=LIBX.q.trim()?lshSearch(LIBX.q.trim()):LIB.open?lshFolderView(String(LIB.open).slice(2)):lshTop();lshBindBody(b)}}
  $('#lbRe').onclick=()=>libLoad(true);$('#lbSet').onclick=openLibSetup;lshBindBody($('#lshBody'))}
function lshBindBody(b){if(!b)return;const L_=LIBS();
  b.querySelectorAll('[data-card]').forEach(c=>c.onclick=e=>{if(e.target.closest('[data-play]'))return;const [k,id]=c.dataset.card.split(':');LIB.open=k==='f'?'f:'+id:id;LIBX.q='';renderLib();$('main').scrollTop=0});
  b.querySelectorAll('[data-folder]').forEach(c=>c.onclick=()=>{LIB.open='f:'+c.dataset.folder;LIBX.q='';renderLib();$('main').scrollTop=0});
  b.querySelectorAll('[data-play]').forEach(x=>x.onclick=e=>{if(e.target.closest('[data-done],[data-lm]'))return;e.stopPropagation();const ctx=x.dataset.ctx||(LIB.open&&String(LIB.open).startsWith('f:')?'f:'+String(LIB.open).slice(2):null);LIBX.ctx=ctx&&ctx.startsWith('f:')?ctx.slice(2):null;libPlay(x.dataset.play)});
  b.querySelectorAll('[data-done]').forEach(x=>x.onclick=e=>{e.stopPropagation();const id=x.dataset.done,P=L_.prog,p=P[id]||(P[id]={p:0,d:0,at:Date.now()});p.done=!p.done;p.at=Date.now();save();renderLib()});
  b.querySelectorAll('[data-lm]').forEach(x=>x.onclick=e=>{e.stopPropagation();lshItemMenu(x,{t:'m',id:x.dataset.lm},x.dataset.inf)});
  b.querySelectorAll('img[data-th]').forEach(im=>{const id=im.dataset.th;im.onerror=()=>{im.remove();if(LIB.via==='pc')libThumbQ(id)};im.src=libThumb(id)});
  const nw=$('#lshNew');if(nw)nw.onclick=()=>lshNewFolder(null);
  const so=$('#lshSort');if(so)so.onchange=()=>{L_.sort=so.value;save();renderLib()};
  const hd=$('#lshHide');if(hd)hd.onchange=()=>{L_.hideDone=hd.checked;save();renderLib()};
  const al=$('#lshAll');if(al)al.onclick=()=>{L_.showAll=!L_.showAll;save();renderLib()};
  const id=LIB.open&&String(LIB.open).startsWith('f:')?String(LIB.open).slice(2):null,f=id&&lshGet(id);
  if(f){$('#lshUp').onclick=()=>{LIB.open=f.parent?'f:'+f.parent:null;renderLib()};
    $('#lshIsC').onchange=e=>{f.course=e.target.checked;save();renderLib()};
    $('#lshAdd').onclick=()=>lshPicker(f);$('#lshSub').onclick=()=>lshNewFolder(f.id);$('#lshMore').onclick=e=>lshFolderMenu(e.currentTarget,f)}}
function lshNewFolder(parent){const n=prompt(t('lsh.folderName'));if(!n||!n.trim())return;const f={id:uid(),n:n.trim(),parent:parent||null,course:false,items:[]};LSH().push(f);save();LIB.open='f:'+f.id;renderLib()}
/* menus */
function lshMenu(anchor,html){const r=anchor.getBoundingClientRect();return qPopAt(html,r.left+r.width/2,r.bottom-6,'aymenu lshmenu')}
function lshFolderPick(exclude){const opts=LSH().filter(f=>f.id!==exclude).map(f=>({f,p:lshPath(f.id).map(x=>x.n).join(' › ')})).sort((a,b)=>a.p.localeCompare(b.p));return opts}
function lshItemMenu(anchor,ref,inFolder){const opts=lshFolderPick();const p=lshMenu(anchor,`<div class="aymh">${t('lsh.addTo')}</div>${opts.map(o=>`<button data-to="${o.f.id}">📁 <span dir="auto">${esc(o.p)}</span></button>`).join('')}<button data-to="new">＋ ${t('lsh.newFolder')}</button>${inFolder?`<button data-rm="1">✕ ${t('lsh.remove')}</button>`:''}`);
  p.querySelectorAll('[data-to]').forEach(b=>b.onclick=()=>{closePP();let f;if(b.dataset.to==='new'){const n=prompt(t('lsh.folderName'));if(!n||!n.trim())return;f={id:uid(),n:n.trim(),parent:null,course:ref.t==='d',items:[]};LSH().push(f)}else f=lshGet(b.dataset.to);if(!f)return;f.items=f.items||[];if(!f.items.some(r=>r.id===ref.id))f.items.push(ref);save();toast(t('lsh.added',f.n));renderLib()});
  const rm=p.querySelector('[data-rm]');if(rm)rm.onclick=()=>{closePP();const f=lshGet(inFolder);if(f){f.items=(f.items||[]).filter(r=>r.id!==ref.id);save();renderLib()}}}
function lshFolderMenu(anchor,f){const p=lshMenu(anchor,`<button data-a="ren">✏ ${t('lsh.rename')}</button><button data-a="move">📂 ${t('lsh.move')}</button><button data-a="cover">🖼 ${t('lsh.cover')}</button><button data-a="rate">★ ${t('lsh.rate')}</button><button data-a="del">🗑 ${t('lsh.delete')}</button>`);
  p.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{closePP();const a=b.dataset.a;
    if(a==='ren'){const n=prompt(t('lsh.folderName'),f.n);if(n&&n.trim()){f.n=n.trim();save();renderLib()}}
    else if(a==='move'){const bad=new Set(),walk=id=>{bad.add(id);lshKids(id).forEach(k=>walk(k.id))};walk(f.id);const q=lshMenu(anchor,`<div class="aymh">${t('lsh.move')}</div><button data-to="">🏠 ${t('lsh.mine')}</button>${lshFolderPick().filter(o=>!bad.has(o.f.id)).map(o=>`<button data-to="${o.f.id}">📁 <span dir="auto">${esc(o.p)}</span></button>`).join('')}`);
      q.querySelectorAll('[data-to]').forEach(x=>x.onclick=()=>{closePP();f.parent=x.dataset.to||null;save();renderLib()})}
    else if(a==='cover')lshCoverPick(f.id);else if(a==='rate')lshRate(anchor,f.id);
    else if(a==='del'){if(!confirm(t('lsh.delQ',f.n)))return;const sh=LSH();lshKids(f.id).forEach(k=>k.parent=f.parent||null);sh.splice(sh.indexOf(f),1);save();LIB.open=f.parent?'f:'+f.parent:null;renderLib()}})}
/* the PC course page gets the same tools: add to a folder, cover, stars and a note */
function lshPcCourseExtras(){const bar=$('#libBox .lbbar');if(!bar||bar.querySelector('.lshm'))return;const id=LIB.open;
  bar.insertAdjacentHTML('beforeend',`<button class="lshm" id="lshPcM" aria-label="⋯">⋯</button>`);
  $('#lshPcM').onclick=e=>{const p=lshMenu(e.currentTarget,`<button data-a="add">📁 ${t('lsh.addTo')}</button><button data-a="cover">🖼 ${t('lsh.cover')}</button><button data-a="rate">★ ${t('lsh.rate')}</button>`);
    p.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{closePP();if(b.dataset.a==='add')lshItemMenu(bar.querySelector('#lshPcM'),{t:'d',id});else if(b.dataset.a==='cover')lshCoverPick(id);else lshRate(bar.querySelector('#lshPcM'),id)})};
  /* the clearer watched toggle and the «⋯» on every lesson */
  $$('#libBox .lbl .lbdone').forEach(b=>{const id=b.dataset.done,done=!!(LIBS().prog[id]||{}).done;b.className='lshdone'+(done?' on':'');b.innerHTML=lshDoneIn(done);b.title=done?t('lb.watched'):t('lsh.notYet');b.insertAdjacentHTML('afterend',`<button class="lshm" data-lm="${id}" aria-label="⋯">⋯</button>`)});
  $$('#libBox .lbl [data-lm]').forEach(x=>x.onclick=e=>{e.stopPropagation();lshItemMenu(x,{t:'m',id:x.dataset.lm})});
  const me=lshMeta(id);if(me.note||me.stars)bar.insertAdjacentHTML('afterend',`<p class="lshnote" dir="auto">${me.stars?'★'.repeat(me.stars)+' ':''}${esc(me.note||'')}</p>`)}
function lshCoverPick(id){const i=document.createElement('input');i.type='file';i.accept='image/*';i.onchange=()=>{const f=i.files[0];if(!f)return;const img=new Image(),u=URL.createObjectURL(f);img.onload=()=>{const w=360,h=202,c=document.createElement('canvas');c.width=w;c.height=h;const s=Math.max(w/img.width,h/img.height),dw=img.width*s,dh=img.height*s;c.getContext('2d').drawImage(img,(w-dw)/2,(h-dh)/2,dw,dh);URL.revokeObjectURL(u);const L_=LIBS();(L_.meta[id]=L_.meta[id]||{}).cover=c.toDataURL('image/jpeg',.72);save();renderLib()};img.src=u};i.click()}
function lshRate(anchor,id){const L_=LIBS(),me=L_.meta[id]||(L_.meta[id]={});const p=lshMenu(anchor,`<div class="aymh">${t('lsh.rate')}</div><div class="lshstars">${[1,2,3,4,5].map(n=>`<button data-st="${n}" class="${(me.stars||0)>=n?'on':''}">★</button>`).join('')}</div><textarea class="in" id="lshNote" rows="3" dir="auto" placeholder="${esc(t('lsh.notePh'))}">${esc(me.note||'')}</textarea><div style="padding:6px 10px"><button class="btn sm pri" id="lshNoteOk">${t('pdl.save')}</button></div>`);
  let st=me.stars||0;p.querySelectorAll('[data-st]').forEach(b=>b.onclick=()=>{st=+b.dataset.st===st?0:+b.dataset.st;p.querySelectorAll('[data-st]').forEach(x=>x.classList.toggle('on',+x.dataset.st<=st))});
  p.querySelector('#lshNoteOk').onclick=()=>{me.stars=st;me.note=p.querySelector('#lshNote').value.trim();closePP();save();renderLib()}}
/* «add» inside a folder: pick whole PC folders or single lessons */
function lshPicker(f){const cs=libCourses(),has=new Set((f.items||[]).map(r=>r.id));
  openInfo('＋ '+t('lsh.add'),`<p class="muted" style="margin:0 0 8px">${t('lsh.pickHint')}</p><input class="in" id="lshPQ" type="search" dir="auto" placeholder="🔍 ${esc(t('lsh.search'))}" style="width:100%;margin-bottom:8px"><div class="lshpick">${cs.map(c=>`<details class="lshpc" data-n="${esc(c.n.toLowerCase())}"><summary><label><input type="checkbox" data-ref="d:${c.id}" ${has.has(c.id)?'checked':''}> 🎬 <b dir="auto">${esc(c.loose?t('lb.loose',c.n):c.n)}</b> <small>(${libMedia(c).length})</small></label></summary>${libMedia(c).map(x=>`<label class="lshpv" data-n="${esc(libTitle(x.n).toLowerCase())}"><input type="checkbox" data-ref="m:${x.id}" ${has.has(x.id)?'checked':''}> <span dir="auto">${esc(libTitle(x.n))}</span>${x.ch?` <small dir="auto">${esc(x.ch)}</small>`:''}</label>`).join('')}</details>`).join('')||`<div class="empty">${t('lb.noCourses')}</div>`}</div>
    <div class="evact"><span style="flex:1"></span><button class="btn sm ghost" id="infoX">${t('cancel')}</button><button class="btn sm pri" id="lshPOk">${t('pdl.save')}</button></div>`);
  $('#infoX').onclick=()=>$('#infoModal').classList.remove('on');
  $('#lshPQ').oninput=e=>{const s=e.target.value.trim().toLowerCase();$$('#infoBox .lshpc').forEach(d=>{let any=d.dataset.n.includes(s);d.querySelectorAll('.lshpv').forEach(v=>{const m=!s||v.dataset.n.includes(s)||d.dataset.n.includes(s);v.hidden=!m;if(m&&s)any=true});d.hidden=!!s&&!any;if(s&&any)d.open=true})};
  $('#lshPOk').onclick=()=>{const refs=$$('#infoBox [data-ref]').filter(x=>x.checked).map(x=>{const [tt,id]=x.dataset.ref.split(':');return{t:tt,id}});const keep=(f.items||[]).filter(r=>!libFind(r.id));f.items=keep.concat(refs);save();$('#infoModal').classList.remove('on');renderLib()}}
/* playing from a shelf folder: «previous» and «next» follow the folder */
{const _li=libItem;libItem=function(id){const it=_li(id);if(!it||!LIBX.ctx)return it;const f=lshGet(LIBX.ctx);if(!f)return it;const list=lshMedia(f.id);if(!list.some(x=>x.id===id))return it;return{...it,list:list.map(x=>({...x,course:{n:f.n,id:'f:'+f.id}})),course:{...it.course,n:f.n}}}}
{const _lc=libClose;libClose=function(){_lc();LIBX.ctx=null}}
