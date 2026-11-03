/* ============ v3.160.0 thirteenth list F1: notes (sortable tables, nested numbers, important notes on Today, this week's notes, heading links, side preview, two notes side by side, sorting, the contents follow the reading) ============ */
const N14={on:0,pv:null,n2:null,swap:0,ok:'thabat.nopen',tm:0};
function n14Wide(){return !MOB.matches&&innerWidth/(uiZoom()||1)>=1100}
function n14Get(id){return NOTES().find(x=>x.id===id)}
function n14Title(n){return n.title||mdPlain(n.body||'').slice(0,40)||t('notes.untitled')}
function n14Locked(n){return n.lock&&!notesUnlocked()}
function n14Norm(s){return lshNorm(String(s||'').trim().toLowerCase())}

/* 136: sort by last opened, title or length (pins stay first); the time a note was opened stays on this device */
function n14Opened(){try{return JSON.parse(localStorage.getItem(N14.ok)||'{}')}catch(e){return{}}}
{hookFn('openNote',()=>openNote,f=>{openNote=f},'post',function(id){if(!id)return;try{const m=n14Opened();m[id]=Date.now();const ks=Object.keys(m);if(ks.length>500)ks.sort((a,b)=>m[a]-m[b]).slice(0,ks.length-500).forEach(k=>delete m[k]);localStorage.setItem(N14.ok,JSON.stringify(m))}catch(e){}})}
{const _s=sortNotes;sortNotes=function(a){const r=_s(a);const k=N14.on&&S.settings.nSort;if(!k)return r;const op=k==='open'?n14Opened():null,lang=document.documentElement.lang||'ar',tm=n=>n.updated||n.created||0;
  return r.sort((x,y)=>(y.pin?1:0)-(x.pin?1:0)||(k==='open'?((op[y.id]||0)-(op[x.id]||0))||tm(y)-tm(x):k==='title'?n14Title(x).localeCompare(n14Title(y),lang,{numeric:true}):(y.body||'').length-(x.body||'').length))}}
{hookFn('renderNotes',()=>renderNotes,f=>{renderNotes=f},'pre',function(){N14.on=1})}
const N14_SO=[['','n14.soDef'],['open','n14.soOpen'],['title','n14.soTitle'],['len','n14.soLen']];
function n14SoMenu(btn){const r=btn.getBoundingClientRect(),cur=S.settings.nSort||'';const p=qPopAt(N14_SO.map(([k,l])=>`<button data-n14so="${k}"${k===cur?' class="on"':''}>${k===cur?'✓ ':''}${esc(t(l))}</button>`).join(''),r.left+r.width/2,r.bottom+4,'aymenu');
  p.querySelectorAll('[data-n14so]').forEach(b=>b.onclick=e=>{e.stopPropagation();closePP();const k=b.dataset.n14so;if(k)S.settings.nSort=k;else delete S.settings.nSort;save();renderNotes()})}

/* 129: notes created or edited this week, at the top of the notes page */
function n14WeekStart(){const d=keyToDate(todayKey());d.setDate(d.getDate()-((d.getDay()+6)%7));d.setHours(0,0,0,0);return d.getTime()}
function n14Week(){const ws=n14WeekStart();return NOTES().filter(n=>!n.arc&&!n14Locked(n)&&Math.max(n.created||0,n.updated||0)>=ws).sort((a,b)=>Math.max(b.updated||0,b.created||0)-Math.max(a.updated||0,a.created||0))}
function n14WeekBar(){const w=$('#notesWrap');if(!w)return;w.querySelector('#n14Wk')?.remove();const q=(($('#nSearch')||{}).value||'').trim();if(q||(typeof nTag!=='undefined'&&nTag)||NF.arc||NF.cur)return;const L_=n14Week();if(!L_.length)return;const ws=n14WeekStart();
  const bar=document.createElement('div');bar.id='n14Wk';bar.className='nrcbar n14wk';bar.innerHTML=`<small>${esc(t('n14.wk',L_.length))}</small>${L_.slice(0,10).map(n=>`<button class="nrcc" data-n14wk="${n.id}">${nsbIco(n,13)}<span dir="auto">${esc(n14Title(n))}</span>${(n.created||0)>=ws?`<i class="n14new">${esc(t('n14.new'))}</i>`:''}</button>`).join('')}${L_.length>10?`<small>+${L_.length-10}</small>`:''}`;
  const rc=$('#nrcBar'),grid=$('#nfGrid');if(rc)rc.before(bar);else if(grid&&grid.parentElement===w)grid.after(bar);else w.prepend(bar);bar.querySelectorAll('[data-n14wk]').forEach(b=>b.onclick=()=>openNote(b.dataset.n14wk))}

/* the notes bar: sort and side preview buttons */
function n14Bar(){const bar=$('#nfBar');if(!bar)return;const sp=bar.querySelector('.nfsp');if(!sp)return;
  if(!bar.querySelector('#n14SoB')){const cur=N14_SO.find(x=>x[0]===(S.settings.nSort||''));sp.insertAdjacentHTML('afterend',`<button class="btn sm ghost${S.settings.nSort?' n14act':''}" id="n14SoB" title="${esc(t('n14.so'))}">⇅ ${esc(t(cur?cur[1]:'n14.soDef'))}</button>`);bar.querySelector('#n14SoB').onclick=e=>{e.stopPropagation();n14SoMenu(e.currentTarget)}}
  if(n14Wide()&&!bar.querySelector('#n14PvB')){bar.querySelector('#n14SoB').insertAdjacentHTML('afterend',`<button class="btn sm ghost${S.settings.nPv?' n14act':''}" id="n14PvB" aria-pressed="${!!S.settings.nPv}">${esc(t('n14.pvB'))}</button>`);bar.querySelector('#n14PvB').onclick=()=>{S.settings.nPv=!S.settings.nPv;if(!S.settings.nPv){delete S.settings.nPv;N14.pv=null}save();renderNotes()}}}

/* 134: preview a note in a side panel on PC (a click shows it, a double click or «edit» opens the editor) */
function n14PvOn(){return!!S.settings.nPv&&n14Wide()&&typeof nbMode!=='undefined'&&nbMode==='notes'}
function n14PvPaint(){const w=$('#notesWrap');if(!w)return;let box=$('#n14Pv');const on=n14PvOn();w.classList.toggle('n14pvon',on);if(!on){box?.remove();return}
  if(!box){box=document.createElement('aside');box.id='n14Pv';box.className='n14pv';w.append(box)}
  const n=N14.pv&&n14Get(N14.pv);if(N14.pv&&!n)N14.pv=null;$$('#notesGrid .ncard.n14sel').forEach(c=>c.classList.remove('n14sel'));
  if(!n){box.innerHTML=`<div class="n14pvin"><p class="n14pvh">${esc(t('n14.pvHint'))}</p></div>`;return}
  $(`#notesGrid .ncard[data-note="${n.id}"]`)?.classList.add('n14sel');
  box.innerHTML=`<div class="n14pvin"><div class="n14pvt">${nsbIco(n,16)}<b dir="auto">${esc(n14Title(n))}</b><button class="btn sm pri" id="n14PvE">${esc(t('n14.edit'))}</button><button class="btn sm ghost" id="n14PvX" aria-label="${esc(t('n14.close'))}">✕</button></div><small class="n14pvd">${esc(gShort(keyToDate(n.day)))}${n.imp?' · ★ '+esc(t('n14.imp')):''}</small>${n14Locked(n)?`<p class="n14pvh">${esc(t('n14.locked'))}</p>`:`<div class="neprev n14rd" dir="auto">${n.body?mdLite(n.body):`<p class="n14pvh">${esc(t('n14.empty'))}</p>`}</div>`}</div>`;
  $('#n14PvE').onclick=()=>openNote(n.id);$('#n14PvX').onclick=()=>{N14.pv=null;n14PvPaint()};
  const rd=box.querySelector('.n14rd');if(rd)n14Enhance(rd,n,{side:1,pv:1})}
document.addEventListener('click',e=>{try{if(!n14PvOn())return;const c=e.target.closest&&e.target.closest('#notesGrid .ncard[data-note]');if(!c||e.target.closest('[data-pin],[data-zoom]'))return;if(typeof NSEL!=='undefined'&&NSEL.on)return;if(Date.now()-(window._ndragAt||0)<450)return;
  e.preventDefault();e.stopPropagation();N14.pv=c.dataset.note;n14PvPaint()}catch(x){console.error(x)}},true);
document.addEventListener('dblclick',e=>{try{if(!n14PvOn())return;const c=e.target.closest&&e.target.closest('#notesGrid .ncard[data-note]');if(c&&!e.target.closest('[data-pin],[data-zoom]'))openNote(c.dataset.note)}catch(x){}},true);

/* 128: an «important» note shows in a card on Today */
{const _nc=noteCard;noteCard=function(n){let h=_nc(n);try{if(n.imp){const i=h.lastIndexOf('</small>');if(i>0)h=h.slice(0,i)+`<span class="n14st" title="${esc(t('n14.imp'))}">★</span>`+h.slice(i)}}catch(e){}return h}}
function n14SetImp(id,on){const n=n14Get(id);if(n){if(on)n.imp=1;else delete n.imp;n.updated=n.updated||Date.now()}if(NE&&NE.id===id){if(on)NE.imp=1;else delete NE.imp}save();try{notesChanged()}catch(e){}try{n14ImpCard()}catch(e){}}
function n14ImpCard(){const g=$('#v-today .grid');if(!g)return;const L_=NOTES().filter(n=>n.imp&&!n.arc).sort((a,b)=>(b.updated||b.created||0)-(a.updated||a.created||0));let c=$('#n14Imp');if(!L_.length){c?.remove();return}
  if(!c){const st=(typeof uxStacks==='function'&&uxStacks()[1])||g.querySelector('.stack');if(!st)return;c=document.createElement('div');c.id='n14Imp';c.className='card n14imp';st.append(c);try{c.dataset.uxp=uxStacks().indexOf(st);c.dataset.uxi=998}catch(e){}}
  c.innerHTML=`<h3><span>📝 ${esc(t('n14.impT'))}</span><small>${L_.length}</small></h3><div class="n14il">${L_.slice(0,6).map(n=>`<div class="n14ir"><button class="n14io" data-n14io="${n.id}">${nsbIco(n,14)}<span dir="auto"><b>${esc(n14Title(n))}</b>${n14Locked(n)||!n.body?'':`<small>${esc(mdPlain(n.body).replace(/\s+/g,' ').slice(0,90))}</small>`}</span></button><button class="n14ix" data-n14ix="${n.id}" title="${esc(t('n14.unImp'))}" aria-label="${esc(t('n14.unImp'))}">✕</button></div>`).join('')}${L_.length>6?`<small class="muted">+${L_.length-6}</small>`:''}</div>`;
  c.querySelectorAll('[data-n14io]').forEach(b=>b.onclick=()=>openNote(b.dataset.n14io));
  c.querySelectorAll('[data-n14ix]').forEach(b=>b.onclick=()=>{const id=b.dataset.n14ix;n14SetImp(id,false);toastAct(t('n14.unImpD'),t('lsh.undo'),()=>n14SetImp(id,true))})}
{hookFn('renderToday',()=>renderToday,f=>{renderToday=f},'post',function(){try{n14ImpCard()}catch(e){console.error(e)}})}

/* the note «⋯»: important, a heading link, open another note beside it */
{hookFn('nteMenu',()=>nteMenu,f=>{nteMenu=f},'post',function(){try{const p=$('#ppPop');if(!p||!NE||p.querySelector('[data-n14]'))return;const add=(lab,fn)=>{const b=document.createElement('button');b.dataset.n14=1;b.innerHTML=lab;b.onclick=e=>{e.stopPropagation();closePP();fn()};p.append(b)};
  add(`★ ${esc(t(NE.imp?'n14.unImp':'n14.mkImp'))}`,()=>{neRead();const on=!NE.imp;if(NE._new){if(on)NE.imp=1;else delete NE.imp;toast(t(on?'n14.impOn':'n14.impOff'));return}n14SetImp(NE.id,on);toast(t(on?'n14.impOn':'n14.impOff'))});
  if(nteHeads(NE.body).length)add(`🔗 ${esc(t('n14.hlM'))}`,n14HeadPick);
  if(n14Wide())add(`⧉ ${esc(t('n14.two'))}`,()=>{neRead();nnPick(t('n14.two'),id=>{if(!id||id==='+')return;N14.n2=id;n14Side()},{skip:[NE.id]})})}catch(e){console.error(e)}})}

/* 131: a link to a heading inside the note ([[note#heading]]) */
function n14HeadLink(head){if(!NE)return;neRead();const ti=(NE.title||'').trim();if(!ti){toast(t('n14.noTitle'));return}const s=`[[${ti}#${String(head).replace(/[\[\]|#]/g,' ').trim()}]]`;qCopyText(s).then(ok=>toast(ok?t('n14.hlC',s):s))}
function n14HeadPick(){if(!NE)return;const hs=nteHeads(NE.body);const p=$('#ppPop')||null;void p;
  openInfo(esc(t('n14.hlM')),`<div class="n14hp">${hs.map((h,j)=>`<button type="button" class="nnpr lv${h.lv}" data-n14hp="${j}" dir="auto">${esc(h.t)}</button>`).join('')}</div>`);
  $$('[data-n14hp]').forEach(b=>b.onclick=()=>{const h=hs[+b.dataset.n14hp];closeInfo2();n14HeadLink(h.t)})}
function n14HeadText(h){const c=h.cloneNode(true);c.querySelectorAll('button,.ndh').forEach(x=>x.remove());return c.textContent.trim()}
function n14JumpHead(root,head){const want=n14Norm(head);if(!root||!want)return false;const h=[...root.querySelectorAll('.nh1,.nh2,.nh3,.nh4')].find(x=>n14Norm(n14HeadText(x))===want);if(!h)return false;if(h.classList.contains('nfdx'))h.click();
  let el=h;while(el&&el.classList&&el.classList.contains('nfdh')){el=el.previousElementSibling}
  h.scrollIntoView({block:'start',behavior:'smooth'});h.classList.add('ntflash');setTimeout(()=>h.classList.remove('ntflash'),1400);return true}
function n14LinkParse(raw){const [nm,alias]=String(raw).split('|'),i=nm.indexOf('#');return{title:(i<0?nm:nm.slice(0,i)).trim(),head:i<0?'':nm.slice(i+1).trim(),alias:(alias||'').trim()}}
function n14Follow(raw,from){const L_=n14LinkParse(raw),tgt=L_.title?NOTES().find(x=>(x.title||'').trim().toLowerCase()===L_.title.toLowerCase()):(NE||null);
  if(from==='pv'){if(tgt){N14.pv=tgt.id;n14PvPaint();if(L_.head)setTimeout(()=>n14JumpHead($('#n14Pv .n14rd'),L_.head),60)}else toast(t('n14.noNote',L_.title));return}
  if(from==='side'){if(tgt){N14.n2=tgt.id;n14Side();if(L_.head)setTimeout(()=>n14JumpHead($('#n14Side .n14rd'),L_.head),60)}else toast(t('n14.noNote',L_.title));return}
  if(!L_.title||(NE&&tgt&&tgt.id===NE.id)){n14JumpHead($('#nePrev'),L_.head);return}
  if(!tgt){toast(t('n14.noNote',L_.title));return}
  closeNote(true);openNote(tgt.id);if(L_.head)setTimeout(()=>n14JumpHead($('#nePrev'),L_.head),220)}

/* what every reading view gets: sortable tables (126), nested numbers (127), heading links (131), [[note#heading]] links */
function n14Enhance(root,n,o){o=o||{};if(!root)return;const body=String((n&&n.body)||'');
  try{n14Ol(root,body)}catch(e){console.error(e)}
  try{n14Tables(root)}catch(e){console.error(e)}
  try{root.querySelectorAll('a.nlink[data-nl]').forEach(a=>{const raw=a.dataset.nl,L_=n14LinkParse(raw);if(!/[#|]/.test(raw)&&!o.side&&!o.pv)return;if(/[#|]/.test(raw))a.textContent=L_.alias||(L_.title?L_.title+(L_.head?' › '+L_.head:''):'› '+L_.head);
    a.onclick=e=>{e.preventDefault();e.stopPropagation();n14Follow(raw,o.side?(o.pv?'pv':'side'):'')}})}catch(e){console.error(e)}
  if(!o.side)try{root.querySelectorAll('.nh1,.nh2,.nh3,.nh4').forEach(h=>{if(h.closest('.nsync')||h.querySelector('.n14hl'))return;const b=document.createElement('button');b.type='button';b.className='n14hl';b.title=t('n14.hlB');b.setAttribute('aria-label',t('n14.hlB'));b.innerHTML='<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></svg>';b.onclick=e=>{e.stopPropagation();e.preventDefault();n14HeadLink(n14HeadText(h))};h.append(b)})}catch(e){console.error(e)}
  if(o.side){root.querySelectorAll('input[type=checkbox]').forEach(i=>i.disabled=true);try{nimgFill&&nimgFill(root)}catch(e){}try{lnkPaint&&lnkPaint(root)}catch(e){}}}

/* 127: numbered lines indented under each other read 1, 1.1, 1.2, 2 … */
function n14Ol(root,body){const lines=body.split('\n');root.querySelectorAll('ol').forEach(ol=>{if(ol.closest('.nsync')||ol.classList.contains('nfn'))return;const lis=[...ol.children].filter(li=>li.tagName==='LI'&&li.dataset.l!=null);if(lis.length<2)return;
  const lv=lis.map(li=>{const m=(lines[+li.dataset.l]||'').match(/^([ \t]*)\d+[.)] /);if(!m)return -1;const s=m[1].replace(/\t/g,'  ').length;return Math.floor(s/2)});if(lv.some(x=>x<0)||!lv.some(x=>x>0))return;
  let c=[],prev=-1;lis.forEach((li,i)=>{let l=Math.min(lv[i],prev+1);if(l<0)l=0;c.length=l+1;c[l]=(c[l]||0)+1;prev=l;li.querySelector(':scope>.n14oln')?.remove();li.style.setProperty('--n14l',l);li.classList.add('n14oli');li.insertAdjacentHTML('afterbegin',`<span class="n14oln">${c.join('.')}.</span>`)});ol.classList.add('n14ol')})}
/* the editor: Tab / Shift+Tab move a list line in or out */
document.addEventListener('keydown',e=>{try{if(e.key!=='Tab'||e.ctrlKey||e.altKey||e.metaKey)return;const ta=e.target;if(!ta||ta.id!=='neBody')return;const v=ta.value,a=ta.selectionStart,b=ta.selectionEnd,ls=v.lastIndexOf('\n',a-1)+1;let le=v.indexOf('\n',b);if(le<0)le=v.length;
  const seg=v.slice(ls,le),rows=seg.split('\n');if(!rows.every(r=>/^\s*(\d+[.)]|[-*•]|[-*] \[[ xX]\]) /.test(r)||!r.trim()))return;e.preventDefault();
  let d0=0,dt=0;const out=rows.map((r,i)=>{if(!r.trim())return r;if(e.shiftKey){const m=r.match(/^( {1,2}|\t)/);if(!m)return r;if(i===0)d0=-m[1].length;dt-=m[1].length;return r.slice(m[1].length)}if(i===0)d0=2;dt+=2;return'  '+r}).join('\n');
  ta.setRangeText(out,ls,le,'preserve');ta.setSelectionRange(Math.max(ls,a+d0),Math.max(ls,b+dt));ta.dispatchEvent(new Event('input',{bubbles:true}))}catch(x){console.error(x)}},true);

/* 126: a click on a table heading in the reading view orders its rows (the note's text is not changed) */
function n14Cell(td){const s=(td.textContent||'').trim().replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)),c=s.replace(/[٫,](?=\d)/g,'.').replace(/[\s%]/g,'');return{s,x:/^-?\d+(\.\d+)?$/.test(c)?parseFloat(c):NaN}}
function n14Tables(root){root.querySelectorAll('table.ntbl').forEach(tb=>{const th=[...tb.querySelectorAll('thead th, thead td')],tbody=tb.tBodies[0];if(!th.length||!tbody||tbody.rows.length<2||tb.dataset.n14)return;tb.dataset.n14=1;
  const orig=[...tbody.rows];th.forEach((h,ci)=>{h.classList.add('n14th');h.tabIndex=0;h.title=t('n14.sortT');const go=()=>{const st=tb._n14||{c:-1,d:0};let d=st.c===ci?(st.d===1?-1:st.d===-1?0:1):1;tb._n14={c:ci,d};
    th.forEach(x=>x.removeAttribute('aria-sort'));if(!d){orig.forEach(r=>tbody.append(r));return}h.setAttribute('aria-sort',d>0?'ascending':'descending');const lang=document.documentElement.lang||'ar';
    const rows=[...tbody.rows].map((r,i)=>({r,i,v:n14Cell(r.cells[ci]||{textContent:''})}));const num=rows.filter(o=>!isNaN(o.v.x)).length>=rows.filter(o=>o.v.s).length*.6;
    rows.sort((p,q)=>{if(!p.v.s&&q.v.s)return 1;if(p.v.s&&!q.v.s)return -1;const k=num&&!isNaN(p.v.x)&&!isNaN(q.v.x)?p.v.x-q.v.x:p.v.s.localeCompare(q.v.s,lang,{numeric:true});return k*d||p.i-q.i});rows.forEach(o=>tbody.append(o.r))};
    h.onclick=go;h.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go()}}})})}
{hookFn('neShowMode',()=>neShowMode,f=>{neShowMode=f},'post',function(){try{const pv=$('#nePrev');if(pv&&!pv.hidden&&NE)n14Enhance(pv,NE)}catch(e){console.error(e)}try{n14TocHi()}catch(e){}})}

/* 135: another note beside the one being edited (PC) */
function n14Side(){const m=$('#noteModal');if(!m)return;let box=$('#n14Side');const n=N14.n2&&n14Get(N14.n2);if(!n||!m.classList.contains('on')||!n14Wide()){box?.remove();m.classList.remove('n14two');N14.n2=null;return}
  if(!box){box=document.createElement('div');box.id='n14Side';box.className='box notebox n14side';m.append(box)}m.classList.add('n14two');
  box.innerHTML=`<div class="n14pvt">${nsbIco(n,16)}<b dir="auto">${esc(n14Title(n))}</b><button class="btn sm" id="n14SdE" title="${esc(t('n14.swapT'))}">⇄ ${esc(t('n14.swap'))}</button><button class="btn sm ghost" id="n14SdX" aria-label="${esc(t('n14.close'))}">✕</button></div><small class="n14pvd">${esc(gShort(keyToDate(n.day)))}</small>${n14Locked(n)?`<p class="n14pvh">${esc(t('n14.locked'))}</p>`:`<div class="neprev n14rd" dir="auto">${n.body?mdLite(n.body):`<p class="n14pvh">${esc(t('n14.empty'))}</p>`}</div>`}`;
  $('#n14SdX').onclick=()=>{N14.n2=null;n14Side()};
  $('#n14SdE').onclick=()=>{if(!NE)return;const cur=NE._new?null:NE.id,other=n.id;N14.swap=1;closeNote(true);N14.swap=0;openNote(other);N14.n2=cur;setTimeout(n14Side,30)};
  const rd=box.querySelector('.n14rd');if(rd)n14Enhance(rd,n,{side:1})}
{hookFn('closeNote',()=>closeNote,f=>{closeNote=f},'post',function(){try{if(N14.swap)return;setTimeout(()=>{if(!NE||!$('#noteModal.on')){N14.n2=null;n14Side()}},0)}catch(e){}})}
window.addEventListener('resize',()=>{clearTimeout(N14.rz);N14.rz=setTimeout(()=>{try{if(N14.n2)n14Side();if($('#notesWrap'))n14PvPaint()}catch(e){}},200)});

/* 138: the contents list marks the heading being read (reading view: by scroll; edit mode: the line under the caret) */
function n14TocHi(){const box=$('#nteToc');if(!box||box.hidden||!NE)return;const bs=[...box.querySelectorAll('[data-ti]')];if(!bs.length)return;let act=-1;const pv=$('#nePrev'),ta=$('#neBody');
  if(pv&&!pv.hidden){const hs=[...pv.querySelectorAll('.nh1,.nh2,.nh3')].filter(h=>!h.closest('.nsync,.nfdh'));const nb=$('#noteBox'),top=(nb?nb.getBoundingClientRect().top:0)+90;hs.forEach((h,j)=>{if(h.getBoundingClientRect().top<=top)act=j});if(act<0&&hs.length)act=0;
    if(nb&&nb.scrollTop+nb.clientHeight>=nb.scrollHeight-4&&hs.length){const vis=hs.map((h,j)=>[h,j]).filter(([h])=>h.getBoundingClientRect().top<innerHeight/(uiZoom()||1));if(vis.length)act=vis[vis.length-1][1]}}
  else if(ta&&!ta.hidden){const line=ta.value.slice(0,ta.selectionStart).split('\n').length-1;bs.forEach((b,j)=>{if(+b.dataset.ln<=line)act=j})}
  bs.forEach((b,j)=>{b.classList.toggle('n14act',j===act);if(j===act)b.setAttribute('aria-current','true');else b.removeAttribute('aria-current')})}
function n14TocSoon(){clearTimeout(N14.tm);N14.tm=setTimeout(()=>{try{n14TocHi()}catch(e){}},70)}
{hookFn('nteToc',()=>nteToc,f=>{nteToc=f},'post',function(){n14TocSoon()})}
document.addEventListener('scroll',e=>{if(NE&&e.target&&e.target.closest&&e.target.closest('#noteModal'))n14TocSoon()},true);
document.addEventListener('selectionchange',()=>{const a=document.activeElement;if(a&&a.id==='neBody')n14TocSoon()});

/* after each notes render */
{hookFn('renderNotes',()=>renderNotes,f=>{renderNotes=f},'post',function(){N14.on=0;try{n14Bar()}catch(e){console.error(e)}try{n14WeekBar()}catch(e){console.error(e)}try{n14PvPaint()}catch(e){console.error(e)}})}
