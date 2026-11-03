/* ============ v3.161.0 thirteenth list F2: notes (plain-text copy, Markdown files into a folder, tag by dragging, latest edits, checklist to tasks, last reading place, my tags tree, folder icons, move a folder's notes) ============ */
const N15={pend:null,jump:null,pos:'thabat.nrpos',hov:null,imp:''};
function n15Get(id){return NOTES().find(x=>x.id===id)}

/* 139: copy as plain text, without Markdown marks */
function n15Plain(title,body){let s=mdPlain(body||'').split('\n').map(l=>l.replace(/^\s*#{1,6}\s+/,'').replace(/^\s*>\s?/,'').replace(/\{\{bg:[a-z]\}\}\s*/g,'').replace(/\{\{[a-z]\|([^}]*)\}\}/g,'$1').replace(/~~([^~]+)~~/g,'$1').replace(/(^|[^*])\*([^*\n]+)\*/g,'$1$2').replace(/__([^_]+)__/g,'$1').replace(/`([^`]*)`/g,'$1').replace(/^\s*```.*$/,'').replace(/^(\s*)[-*+] (?!\[)/,'$1• ').replace(/\[\^[^\]]+\]/g,'')).join('\n').replace(/\n{3,}/g,'\n\n').trim();
  return (title?title.trim()+'\n\n':'')+s}

/* 143: where a note was last changed (first changed line), kept with the note; 147: the place read last, kept on this device */
function n15FirstDiff(a,b){const A=String(a||'').split('\n'),B=String(b||'').split('\n');let i=0;while(i<A.length&&i<B.length&&A[i]===B[i])i++;return Math.min(i,Math.max(0,B.length-1))}
function n15PosAll(){try{return JSON.parse(localStorage.getItem(N15.pos)||'{}')}catch(e){return{}}}
function n15SavePos(){try{const pv=$('#nePrev'),nb=$('#noteBox');if(!NE||NE._new||!pv||pv.hidden||!nb)return;const m=n15PosAll();if(nb.scrollHeight<nb.clientHeight*1.8||nb.scrollTop<80){delete m[NE.id]}else{const top=nb.getBoundingClientRect().top+40;const el=[...pv.querySelectorAll('[data-l]')].find(x=>!x.closest('.nsync')&&x.getBoundingClientRect().bottom>top);if(el)m[NE.id]={l:+el.dataset.l,at:Date.now()}}
  const ks=Object.keys(m);if(ks.length>300)ks.sort((a,b)=>m[a].at-m[b].at).slice(0,ks.length-300).forEach(k=>delete m[k]);localStorage.setItem(N15.pos,JSON.stringify(m))}catch(e){}}
function n15LineEl(l){const pv=$('#nePrev');if(!pv)return null;let best=null,bl=-1;pv.querySelectorAll('[data-l]').forEach(x=>{if(x.closest('.nsync'))return;const v=+x.dataset.l;if(v<=l&&v>bl){bl=v;best=x}});return best}
function n15GoLine(l,flash){const el=n15LineEl(l);if(!el)return false;let h=el;while(h&&h.classList&&h.classList.contains('nfdh'))h=h.previousElementSibling;if(el.classList.contains('nfdh')){const hd=el.previousElementSibling&&[...el.parentElement.children].slice(0,[...el.parentElement.children].indexOf(el)).reverse().find(x=>x.classList.contains('nfdx'));if(hd)hd.click()}
  el.scrollIntoView({block:'start'});if(flash){el.classList.add('ntflash');setTimeout(()=>el.classList.remove('ntflash'),1500)}return true}
{hookFn('closeNote',()=>closeNote,f=>{closeNote=f},'pre',function(saveIt){try{if(!NE)return;n15SavePos();N15.pend=null;if(saveIt&&!NE._new){neRead();const o=n15Get(NE.id);if(o&&o.body!==NE.body)N15.pend={id:NE.id,l:n15FirstDiff(o.body,NE.body)}}}catch(e){}})}
{hookFn('closeNote',()=>closeNote,f=>{closeNote=f},'post',function(){try{const p=N15.pend;N15.pend=null;if(!p)return;const n=n15Get(p.id);if(n){n.edL=p.l;n.edAt=Date.now();save()}}catch(e){}})}
{hookFn('openNote',()=>openNote,f=>{openNote=f},'post',function(id){try{if(!id)return;const j=N15.jump;N15.jump=null;setTimeout(()=>{try{if(!NE||NE.id!==id)return;const pv=$('#nePrev');if(!pv||pv.hidden)return;
  if(j!=null){n15GoLine(j,true);return}const p=n15PosAll()[id];if(!p||p.l<3)return;const nb=$('#noteBox');if(!nb||nb.scrollHeight<nb.clientHeight*1.8)return;if(n15GoLine(p.l,false))toastAct(t('n15.resumed'),t('n15.top'),()=>{const b=$('#noteBox');if(b)b.scrollTop=0})}catch(e){}},260)}catch(e){}})}
function n15EdOpen(){const k=todayKey(),st=keyToDate(k).getTime();const L_=NOTES().filter(n=>!n.arc&&!(n.lock&&!notesUnlocked())&&Math.max(n.edAt||0,n.updated||0)>=st).sort((a,b)=>Math.max(b.edAt||0,b.updated||0)-Math.max(a.edAt||0,a.updated||0));
  const tm=ms=>new Date(ms).toLocaleTimeString(document.documentElement.lang||'ar',{hour:'2-digit',minute:'2-digit'});
  openInfo(esc(t('n15.edT')),L_.length?`<small class="muted">${esc(t('n15.edSub'))}</small><div class="nnpl n15ed">${L_.map(n=>{const ln=n.edL!=null&&n.edAt>=st?String(n.body||'').split('\n')[n.edL]||'':'';return`<button type="button" class="nnpr" data-n15ed="${n.id}">${nsbIco(n,14)}<span dir="auto"><b>${esc(n.title||mdPlain(n.body||'').slice(0,40)||t('notes.untitled'))}</b>${ln.trim()?`<small dir="auto">${esc(mdPlain(ln).trim().slice(0,90))}</small>`:''}</span><small>${tm(Math.max(n.edAt||0,n.updated||0))}</small></button>`}).join('')}</div>`:`<p class="muted">${esc(t('n15.ed0'))}</p>`);
  $$('[data-n15ed]').forEach(b=>b.onclick=()=>{const n=n15Get(b.dataset.n15ed);closeInfo2();if(!n)return;if(n.edL!=null&&(n.edAt||0)>=st)N15.jump=n.edL;if(curView()!=='boards'){nbMode='notes';showView('boards')}openNote(n.id)})}

/* 146: the unticked ☐ lines of a note become tasks on their @date (or today); the same line is never added twice */
function n15ChkLines(body){const out=[];String(body||'').split('\n').forEach((l,i)=>{const m=l.match(/^\s*[-*+] \[ \]\s+(.+)$/);if(!m)return;let tx=m[1],k=todayKey();const d=tx.match(/@(\d{4}-\d{2}-\d{2})(?![\d-])/);if(d&&!isNaN(keyToDate(d[1]))){k=d[1];tx=tx.replace(d[0],' ')}tx=tx.replace(/\s+/g,' ').trim();if(tx)out.push({i,tx,k:k<todayKey()?todayKey():k,late:k<todayKey()})});return out}
function n15ToTasks(){if(!NE)return;neRead();const L_=n15ChkLines(NE.body);if(!L_.length){toast(t('n15.chk0'));return}const nid=NE.id;
  const rows=L_.map(o=>{const id='ntk-'+bkHash(nid+'|'+o.tx);const has=day(o.k).tasks.some(x=>x.id===id);return{...o,id,has}});const fresh=rows.filter(r=>!r.has);
  openInfo(esc(t('n15.chkT')),`<small class="muted">${esc(t('n15.chkSub'))}</small><div class="n15ck">${rows.map(r=>`<div class="n15cr${r.has?' had':''}"><span dir="auto">${esc(r.tx)}</span><small>${r.has?esc(t('n15.had')):esc(r.k===todayKey()?t('n15.today'):gShort(keyToDate(r.k)))}${r.late?' · '+esc(t('n15.late')):''}</small></div>`).join('')}</div><div class="evact"><button class="btn" id="n15CkX">${esc(t('lt.cancel'))}</button><button class="btn pri" id="n15CkGo"${fresh.length?'':' disabled'}>${esc(t('n15.chkGo',fresh.length))}</button></div>`);
  $('#infoBox>.evact')?.remove();$('#n15CkX').onclick=()=>closeInfo2();$('#n15CkGo').onclick=()=>{const made=[];fresh.forEach(r=>{day(r.k).tasks.push({id:r.id,text:r.tx.slice(0,200),done:false,created:Date.now(),note:nid});made.push([r.k,r.id])});save();closeInfo2();try{renderTasks()}catch(e){}
    toastAct(t('n15.chkDone',made.length),t('undo'),()=>{made.forEach(([k,id])=>{const d=day(k);d.tasks=d.tasks.filter(x=>x.id!==id)});save();try{renderTasks()}catch(e){}},8000)}}

/* the note «⋯» */
{hookFn('nteMenu',()=>nteMenu,f=>{nteMenu=f},'post',function(){try{const p=$('#ppPop');if(!p||!NE||p.querySelector('[data-n15]'))return;const add=(lab,fn)=>{const b=document.createElement('button');b.dataset.n15=1;b.innerHTML=lab;b.onclick=e=>{e.stopPropagation();closePP();fn()};p.append(b)};
  add(`📋 ${esc(t('n15.plain'))}`,()=>{neRead();const s=n15Plain(NE.title,NE.body);qCopyText(s).then(ok=>toast(ok?t('n15.plainOk'):t('n15.plainNo')))});
  if(/^\s*[-*+] \[ \]\s+\S/m.test(NE.body||''))add(`☑ ${esc(t('n15.chkM'))}`,n15ToTasks)}catch(e){console.error(e)}})}

/* 148: «وسومي» — every tag as a tree with how many notes sit under it */
function n15TagTree(){const M=new Map();NOTES().filter(n=>!n.arc).forEach(n=>noteTags(n).forEach(tg=>{const k=String(tg);if(!M.has(k))M.set(k,new Set());M.get(k).add(n.id)}));
  const keys=[...M.keys()].sort((a,b)=>a.localeCompare(b,document.documentElement.lang||'ar'));if(!keys.length){openInfo(esc(t('n15.tgT')),`<p class="muted">${esc(t('n15.tg0'))}</p>`);return}
  const kids=p=>keys.filter(k=>{const i=k.lastIndexOf('/');return(i<0?'':k.slice(0,i))===p}),rows=[];const walk=(p,dep)=>kids(p).forEach(k=>{const sub=kids(k).length;rows.push(`<div class="n15tr" style="--d:${dep}" data-n15p="${esc(p)}"><button type="button" class="n15tt" data-n15tf="${esc(k)}"${sub?'':' disabled'} aria-label="${esc(t('n15.fold'))}">${sub?'▾':''}</button><button type="button" class="n15tg" data-n15tg="${esc(k)}"><span class="ntag" data-tag="${esc(k)}" dir="auto">#${esc(k.slice(k.lastIndexOf('/')+1))}</span><small>${M.get(k).size}</small></button></div>`);walk(k,dep+1)});walk('',0);
  openInfo(esc(t('n15.tgT')),`<small class="muted">${esc(t('n15.tgSub',keys.length))}</small><div class="n15tree">${rows.join('')}</div>`);
  const fold=new Set(),paint=()=>$$('.n15tree .n15tr').forEach(r=>{const p=r.dataset.n15p;r.hidden=[...fold].some(f=>p===f||p.startsWith(f+'/'))});
  $$('[data-n15tf]').forEach(b=>b.onclick=()=>{const k=b.dataset.n15tf;if(fold.has(k))fold.delete(k);else fold.add(k);b.textContent=fold.has(k)?(document.documentElement.dir==='rtl'?'◂':'▸'):'▾';paint()});
  $$('[data-n15tg]').forEach(b=>b.onclick=()=>{closeInfo2();if(curView()!=='boards'){nbMode='notes';showView('boards')}const q=$('#nSearch');if(q){q.value='#'+b.dataset.n15tg;renderNotes()}})}

/* 142: a chip row of the most used tags; dragging a note card onto one adds that tag */
function n15TopTags(){const M=new Map();NOTES().filter(n=>!n.arc).forEach(n=>noteTags(n).forEach(tg=>{if(String(tg).includes('/'))return;M.set(tg,(M.get(tg)||0)+1)}));return[...M].sort((a,b)=>b[1]-a[1]).slice(0,12)}
function n15TagRow(){const w=$('#notesWrap');if(!w)return;w.querySelector('#n15Tags')?.remove();const q=(($('#nSearch')||{}).value||'').trim();if(NF.arc)return;const L_=n15TopTags();if(!L_.length)return;
  const bar=document.createElement('div');bar.id='n15Tags';bar.className='n15tags';bar.innerHTML=`<small>${esc(t('n15.tags'))}</small>${L_.map(([g,c])=>`<button class="ntag n15chip${q==='#'+g?' on':''}" data-tag="${esc(g)}" data-n15c="${esc(g)}" dir="auto">#${esc(g)} <small>${c}</small></button>`).join('')}<button class="btn sm ghost" id="n15TreeB">${esc(t('n15.tgB'))}</button>`;
  const grid=$('#notesGrid');if(grid&&grid.parentElement===w)grid.before(bar);else w.append(bar);
  bar.querySelectorAll('[data-n15c]').forEach(b=>b.onclick=()=>{const qi=$('#nSearch');if(!qi)return;const v='#'+b.dataset.n15c;qi.value=qi.value.trim()===v?'':v;renderNotes()});$('#n15TreeB').onclick=n15TagTree}
function n15AddTag(id,tg){const n=n15Get(id);if(!n)return;if(noteTags(n).includes(tg)){toast(t('n15.tagHas',tg));return}const old=n.body||'';n.body=old.replace(/\s+$/,'')+(old.trim()?'\n\n':'')+'#'+tg;n.updated=Date.now();save();notesChanged();
  toastAct(t('n15.tagAdd',tg),t('undo'),()=>{const m=n15Get(id);if(m){m.body=old;m.updated=Date.now();save();notesChanged()}})}
window.addEventListener('pointermove',e=>{const dg=document.querySelector('#notesGrid .ncard.ndrag');if(!dg){if(N15.hov){N15.hov.classList.remove('n15over');N15.hov=null}return}const el=document.elementFromPoint(e.clientX,e.clientY),tg=el&&el.closest('#n15Tags [data-n15c]');if(tg!==N15.hov){if(N15.hov)N15.hov.classList.remove('n15over');N15.hov=tg;if(tg)tg.classList.add('n15over')}},{passive:true});
{const _o=notesDropOrder;notesDropOrder=function(root,d){const h=N15.hov;N15.hov=null;if(h){h.classList.remove('n15over');const id=d.c.dataset.note,tg=h.dataset.n15c;setTimeout(()=>n15AddTag(id,tg),0)}return _o(root,d)}}

/* 149: a folder may show one of Thabat's icons; 150: move every note of a folder to another folder */
function n15IcKeys(){return[...new Set(CAT_ICONS.concat(['star','heart','flag','home','bag','check','calendar','clock','link','pin','folder','sun','moon','fire','gift','idea','book','pen','note','music','globe','camera','code','chart','leaf'].filter(k=>UIC_P[k])))].filter(k=>UIC_P[k])}
function n15FolderIc(id){const f=nfGet(id);if(!f)return;openInfo(esc(t('n15.icT')),`<div class="nicg n15icg">${n15IcKeys().map(k=>`<button type="button" data-n15ic="${k}" class="${f.ic===k?'on':''}" aria-label="${esc(k)}">${uicSvg(k,'')}</button>`).join('')}</div>${f.ic?`<button class="btn sm ghost" id="n15IcX" style="margin-top:8px">✕ ${esc(t('n15.icX'))}</button>`:''}`);
  $$('[data-n15ic]').forEach(b=>b.onclick=()=>{f.ic=b.dataset.n15ic;save();closeInfo2();nfRefresh()});const x=$('#n15IcX');if(x)x.onclick=()=>{delete f.ic;save();closeInfo2();nfRefresh()}}
function n15IcPaint(){$$('#nfGrid .nfcard[data-nf]').forEach(c=>{const f=nfGet(c.dataset.nf),ic=c.querySelector('.nfic');if(!f||!ic)return;if(f.ic&&UIC_P[f.ic]){ic.innerHTML=uicSvg(f.ic,'');ic.classList.add('n15fi')}});
  $$('#nfBar button[data-nfgo]').forEach(b=>{const f=nfGet(b.dataset.nfgo),dot=b.querySelector('.nfpdot');if(f&&f.ic&&UIC_P[f.ic]&&dot&&!dot.classList.contains('n15fd')){dot.classList.add('n15fd');dot.innerHTML=uicSvg(f.ic,'')}})}
{hookFn('nfMenu',()=>nfMenu,f=>{nfMenu=f},'post',function(anchor,id){try{const p=$('#ppPop'),f=nfGet(id);if(!p||!f||p.querySelector('[data-n15f]'))return;const del=p.querySelector('[data-a="del"]');const mk=(lab,fn)=>{const b=document.createElement('button');b.dataset.n15f=1;b.innerHTML=lab;b.onclick=e=>{e.stopPropagation();closePP();fn()};if(del)del.before(b);else p.append(b)};
  mk(`🎨 ${esc(t(f.ic?'n15.icChg':'n15.ic'))}`,()=>n15FolderIc(id));
  const own=NOTES().filter(n=>n.fd===id&&!n.arc).map(n=>n.id);if(own.length)mk(`📁 ${esc(t('n15.mvAll',own.length))}`,()=>nfPick(t('n15.mvAllT',f.n),to=>{if((to||null)===id)return;nfMoveNotes(own,to)},{cur:id}))}catch(e){console.error(e)}})}

/* 140: any Markdown files can go into a chosen notes folder (the import window gets a folder choice) */
{hookFn('openObsImport',()=>openObsImport,f=>{openObsImport=f},'post',function(){try{const st=$('#obsSt');if(!st||$('#n15ImpF'))return;const rows=[];const walk=(pid,dep)=>nfKids(pid).forEach(f=>{rows.push(`<option value="${f.id}">${'· '.repeat(dep)}${esc(f.n)}</option>`);walk(f.id,dep+1)});walk(null,0);
  st.insertAdjacentHTML('beforebegin',`<label class="n15impf"><span>${esc(t('n15.impF'))}</span><select class="in" id="n15ImpF"><option value="">${esc(t('notes.title'))}</option>${typeof NF!=='undefined'&&NF.cur?'':''}${rows.join('')}<option value="+">＋ ${esc(t('nfd.new'))}…</option></select></label><small class="muted n15imph">${esc(t('n15.impH'))}</small>`);
  const s=$('#n15ImpF');s.value=(typeof NF!=='undefined'&&NF.cur&&nfGet(NF.cur))?NF.cur:'';N15.imp=s.value;s.onchange=()=>{if(s.value==='+'){nfAsk(t('nfd.new'),'',n=>{const f=nfMk(n,null);s.insertAdjacentHTML('beforeend',`<option value="${f.id}">${esc(f.n)}</option>`);s.value=f.id;N15.imp=f.id;$('#ltModal').classList.add('on')});return}N15.imp=s.value}}catch(e){console.error(e)}})}
{const _i=obsImport;obsImport=async function(...a){const before=new Set(NOTES().map(n=>n.id)),to=N15.imp&&nfGet(N15.imp)?N15.imp:null;const r=await _i(...a);try{if(to){const fresh=NOTES().filter(n=>!before.has(n.id));fresh.forEach(n=>n.fd=to);if(fresh.length){save();nfRefresh()}}}catch(e){console.error(e)}N15.imp='';return r}}

/* the notes «⋯» tools and the chip row after each render */
NX_MORE.push(['n15EdB','n15.edD'],['n15TgB','n15.tgD']);
{hookFn('renderNotes',()=>renderNotes,f=>{renderNotes=f},'post',function(){try{const tl=$('#nTools');if(tl&&!$('#n15EdB')){tl.insertAdjacentHTML('beforeend',`<button class="btn sm ghost nxhid" id="n15EdB">${esc(t('n15.edT'))}</button><button class="btn sm ghost nxhid" id="n15TgB">${esc(t('n15.tgT'))}</button>`);$('#n15EdB').onclick=n15EdOpen;$('#n15TgB').onclick=n15TagTree}}catch(e){console.error(e)}
  try{n15TagRow()}catch(e){console.error(e)}try{n15IcPaint()}catch(e){console.error(e)}})}
{const _cc=cmdCommands;cmdCommands=function(...a){const L_=_cc(...a);try{L_.push({icon:'🕘',label:t('n15.edT'),run:()=>{n15EdOpen()},kw:'notes edits today تعديلات'},{icon:'🏷',label:t('n15.tgT'),run:()=>{n15TagTree()},kw:'tags tree وسوم'})}catch(e){}return L_}}

