/* ============ 3.112 tenth list F (library): a speed kept per course, progress per chapter, course tags, a lesson tied to a book page, the course's PDF beside the video ============ */
/* 10th-63: S.lib.cspd={courseId:rate}; a course without its own speed keeps the general one */
const LXS={lock:false};
function lxsCid(){try{return LIB.cur&&LIB.cur.course&&LIB.cur.course.id||null}catch(e){return null}}
{hookFn('lpvBuild',()=>lpvBuild,f=>{lpvBuild=f},'post',function(){try{const v=$('#lvV');if(!v)return;const cid=lxsCid();LXS.lock=true;{const sp0=(LIBS().cspd||{})[cid];if(sp0){v.defaultPlaybackRate=sp0;v.playbackRate=sp0}}
  const apply=()=>setTimeout(()=>{const sp=(LIBS().cspd||{})[cid];if(sp&&Math.abs(v.playbackRate-sp)>.01)v.playbackRate=sp;setTimeout(()=>{LXS.lock=false},400)},60);
  if(v.readyState>=1)apply();else v.addEventListener('loadedmetadata',apply,{once:true});
  if(!v.dataset.cspd){v.dataset.cspd=1;v.addEventListener('ratechange',()=>{if(LXS.lock)return;const c=lxsCid();if(!c)return;const L_=LIBS(),m=L_.cspd=L_.cspd||{},r=Math.round(v.playbackRate*100)/100;if(m[c]===r)return;m[c]=r;save()})}
  lxbBtn()}catch(e){console.error(e)}})}

/* 10th-66: on a course page (PC course or course folder) each chapter heading shows done/all and a small bar */
function lchPaint(){const P=LIBS().prog;$$('#libBox .lbch').forEach(h=>{let n=0,d=0,el=h.nextElementSibling;while(el&&!el.classList.contains('lbch')){const id=el.classList.contains('lbl')&&el.dataset.play;if(id){n++;if((P[id]||{}).done)d++}el=el.nextElementSibling}
  if(!n)return;let s=h.querySelector('.lchp');if(!s){h.insertAdjacentHTML('beforeend','<span class="lchp"><small></small><i><b></b></i></span>');s=h.querySelector('.lchp')}
  s.querySelector('small').textContent=d+'/'+n;s.querySelector('b').style.width=Math.round(d/n*100)+'%';h.classList.toggle('lchdone',d===n)})}

/* 10th-68: tags for courses (S.lib.meta[id].tags) and a filter on the library home */
const LCT={tag:''};
function lctOf(id){return(lshMeta(id).tags||[])}
function lctEdit(id){const cur=lctOf(id).join('، ');const v=prompt(t('lct.ask'),cur);if(v===null)return;const tags=[...new Set(v.split(/[,،\n]/).map(s=>s.trim().replace(/^#/,'')).filter(Boolean))].slice(0,12);
  const L_=LIBS(),m=L_.meta[id]=L_.meta[id]||{};if(tags.length)m.tags=tags;else delete m.tags;save();renderLib();toast(t('lct.saved'))}
function lctPaint(){if(LIB.open)return;const cards=$$('#libBox .lshc[data-card]');if(!cards.length)return;const all=new Map();
  cards.forEach(c=>{const id=c.dataset.card.split(':').slice(1).join(':'),tg=lctOf(id);let row=c.querySelector('.lctc');if(tg.length&&!row){c.querySelector('small')?.insertAdjacentHTML('afterend',`<span class="lctc">${tg.map(x=>`<i dir="auto">${esc(x)}</i>`).join('')}</span>`)}
    tg.forEach(x=>all.set(x,(all.get(x)||0)+1));c.classList.toggle('lcthide',!!LCT.tag&&!tg.includes(LCT.tag))});
  let bar=$('#lctBar');if(!all.size){if(bar)bar.remove();LCT.tag='';cards.forEach(c=>c.classList.remove('lcthide'));return}
  if(!bar){const g=cards[0].closest('.lshgrid')||cards[0].parentElement;g.insertAdjacentHTML('beforebegin','<div id="lctBar" class="lctbar"></div>');bar=$('#lctBar')}
  bar.innerHTML=`<span class="muted">🏷</span><button class="chip ${LCT.tag?'':'on'}" data-lct="">${esc(t('lct.all'))}</button>`+[...all].sort((a,b)=>b[1]-a[1]).map(([x,n])=>`<button class="chip ${LCT.tag===x?'on':''}" data-lct="${esc(x)}" dir="auto">${esc(x)} <small>${n}</small></button>`).join('');
  bar.querySelectorAll('[data-lct]').forEach(b=>b.onclick=()=>{LCT.tag=b.dataset.lct;lctPaint()})}
{hookFn('renderLib',()=>renderLib,f=>{renderLib=f},'post',function(){try{lchPaint();lctPaint()}catch(e){console.error(e)}})}
{const _lm=lshMenu;lshMenu=function(anchor,html,...a){const p=_lm(anchor,html,...a);try{let id=null;if(anchor&&anchor.id==='lshPcM'&&LIB.open)id=LIB.open;else if(anchor&&anchor.id==='lshMore'&&String(LIB.open||'').startsWith('f:')){const f=(LIBS().shelf||[]).find(x=>'f:'+x.id===LIB.open);if(f&&f.course)id=f.id}
  if(id&&p&&!p.querySelector('[data-lct2]')){p.insertAdjacentHTML('beforeend',`<button data-lct2="1">🏷 ${esc(t('lct.t'))}${lctOf(id).length?' ('+lctOf(id).length+')':''}</button>`);p.querySelector('[data-lct2]').onclick=()=>{closePP();lctEdit(id)}}}catch(e){}return p}}

/* 10th-71 + 73: in the player «📎 الكتاب والملفات»: the book page tied to this lesson (S.lib.meta[lesson].bk={key,pg}), the course's PDF files (those of the lesson's own chapter first); they open beside the video (html.lxside) */
function lxbBtn(){if($('#lxbB'))return;const anchor=$('#lxsB')||$('#lxcB')||$('#lpvNoteB');if(!anchor)return;anchor.insertAdjacentHTML('afterend',`<button class="lpva" id="lxbB" title="${esc(t('lxb.t'))}">📎 <span>${esc(t('lxb.btn'))}</span></button>`);$('#lxbB').onclick=lxbMenu}
function lxbPdfs(){const it=LIB.cur;if(!it||!it.course)return[];const fs=libFiles(it.course).filter(f=>/\.pdf$/i.test(f.n)),stem=libTitle(it.n).toLowerCase().replace(/\.[^.]+$/,'');
  const sc=f=>(f.n.toLowerCase().replace(/\.pdf$/i,'')===stem?0:f.ch===(it.ch||'')?1:2);return fs.sort((a,b)=>sc(a)-sc(b)).slice(0,30)}
function lxbMenu(){const it=LIB.cur;if(!it)return;const me=lshMeta(it.id),bk=me.bk,b=bk&&(()=>{try{return bkAll().find(x=>x.key===bk.key)}catch(e){return null}})(),fs=lxbPdfs();
  let h='';if(bk)h+=`<button data-lxo="${esc(bk.key)}" data-pg="${bk.pg||1}">📖 <span dir="auto">${esc(b?b.n:t('lxb.gone'))}</span> · ${esc(t('lxb.pg',bk.pg||1))}</button>`;
  h+=fs.map(f=>`<button data-lxo="p:${esc(f.id)}" data-pg="1">📄 <span dir="auto">${esc(f.n.replace(/\.pdf$/i,''))}</span>${f.ch?` <small dir="auto">${esc(f.ch)}</small>`:''}</button>`).join('');
  if(!bk&&!fs.length)h+=`<p class="muted" style="padding:6px 10px;margin:0">${esc(t('lxb.none'))}</p>`;
  h+=`<hr><button data-lxl="1">🔗 ${esc(bk?t('lxb.relink'):t('lxb.link'))}</button>`+(bk?`<button data-lxd="1">✕ ${esc(t('lxb.unlink'))}</button>`:'');
  const p=lshMenu($('#lxbB'),h);if(!p)return;p.classList.add('lxbpop');
  p.querySelectorAll('[data-lxo]').forEach(x=>x.onclick=()=>{closePP();lxbOpen(x.dataset.lxo,+x.dataset.pg||1)});
  const l=p.querySelector('[data-lxl]');if(l)l.onclick=()=>{closePP();lxbLink()};const d=p.querySelector('[data-lxd]');if(d)d.onclick=()=>{closePP();const m=LIBS().meta[it.id];if(m){delete m.bk;save()}toast(t('lxb.unl'))}}
async function lxbOpen(key,pg){document.documentElement.classList.add('lxside');try{await nteBkOpen(key,pg)}catch(e){console.error(e)}
  if(!$('#bkReader.on')){document.documentElement.classList.remove('lxside');return}setTimeout(()=>dispatchEvent(new Event('resize')),120)}
function lxbLink(){const it=LIB.cur;if(!it)return;let books=[];try{books=bkAll()}catch(e){}if(!books.length){toast(t('lxb.nob'));return}const cur=lshMeta(it.id).bk||{},fs=new Set(lxbPdfs().map(f=>'p:'+f.id));
  books.sort((a,b)=>(fs.has(b.key)-fs.has(a.key))||String(a.n).localeCompare(String(b.n)));const nowPg=(BK&&BK.key&&$('#bkReader.on'))?BK.cur:0;
  openInfo(t('lxb.link'),`<div class="lxbf"><label>${esc(t('lxb.book'))}<select class="in" id="lxbS">${books.map(b=>`<option value="${esc(b.key)}" ${b.key===(cur.key||(BK&&BK.key))?'selected':''}>${esc(b.n)}</option>`).join('')}</select></label>
    <label>${esc(t('lxb.page'))}<input class="in" id="lxbP" type="number" min="1" value="${cur.pg||nowPg||1}"></label><button class="btn pri" id="lxbGo">${esc(t('lxb.save'))}</button></div>`);
  $('#lxbGo').onclick=()=>{const L_=LIBS(),m=L_.meta[it.id]=L_.meta[it.id]||{};m.bk={key:$('#lxbS').value,pg:Math.max(1,+$('#lxbP').value||1)};save();$$('.modal.on').forEach(x=>x.classList.remove('on'));toast(t('lxb.ok'))}}
{hookFn('bkClose',()=>bkClose,f=>{bkClose=f},'post',function(){document.documentElement.classList.remove('lxside')})}
{hookFn('libClose',()=>libClose,f=>{libClose=f},'post',function(){if(document.documentElement.classList.contains('lxside')){document.documentElement.classList.remove('lxside');setTimeout(()=>dispatchEvent(new Event('resize')),120)}})}
