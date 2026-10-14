/* ============ v3.41 notes: folders inside the notes page (nested, a colour or a cover), split at headings, word count, contents, links to a book page, coloured highlights, archive ============ */
if(!SY_SIMPLE.includes('nfold'))SY_SIMPLE.push('nfold');
function NFOLD(){return S.nfold||(S.nfold=[])}
var NF={cur:null,arc:false,hov:null,dragF:null};
const NF_COLS=['#e0b43a','#4fb0a5','#6f8fe0','#d77a61','#b07ad6','#5fae5a','#d2648f','#8a8f98'];
function nfGet(id){return id?NFOLD().find(f=>f.id===id)||null:null}
function nfKids(pid){return NFOLD().filter(f=>pid?f.parent===pid:(!f.parent||!nfGet(f.parent))).sort((a,b)=>(a.at||0)-(b.at||0))}
function nfOf(n){return n.fd&&nfGet(n.fd)?n.fd:null}
function nfPath(id){const p=[];let f=nfGet(id),g=0;while(f&&g++<60){p.unshift(f);f=nfGet(f.parent)}return p}
function nfDesc(id){const s=new Set([id]);let ch=true;while(ch){ch=false;NFOLD().forEach(f=>{if(f.parent&&s.has(f.parent)&&!s.has(f.id)){s.add(f.id);ch=true}})}return s}
function nfCount(id){const s=nfDesc(id);return NOTES().filter(n=>!n.arc&&n.fd&&s.has(n.fd)).length}
function nfHue(id){let h=0;for(const c of String(id))h=(h*31+c.charCodeAt(0))%360;return h}
function nfColor(f){return f.col||`hsl(${nfHue(f.id)} 45% 52%)`}
function nfSwatch(f){return f.cov?`background:url(${f.cov}) center/cover`:`--c:${nfColor(f)}`}
function nfSnap(){return{f:JSON.stringify(NFOLD()),n:NOTES().map(n=>[n.id,n.fd||null,n.arc||0]),cur:NF.cur}}
function nfRestore(s){S.nfold=JSON.parse(s.f);const m=new Map(s.n.map(x=>[x[0],x]));NOTES().forEach(n=>{const x=m.get(n.id);if(!x)return;if(x[1])n.fd=x[1];else delete n.fd;if(x[2])n.arc=x[2];else delete n.arc;n.updated=Date.now()});NF.cur=s.cur;save();nfRefresh()}
function nfUndo(s,msg){toastAct(msg,t('lsh.undo'),()=>nfRestore(s))}
function nfRefresh(){try{if(curView()==='boards'&&nbMode==='notes')renderNotes()}catch(e){console.error(e)}try{renderDayNotes($('#todayNotes'),todayKey())}catch(e){}}
function nfGo(id,arc){NF.cur=id||null;NF.arc=!!arc;renderNotes();const w=$('#notesWrap');if(w&&w.getBoundingClientRect().top<0)w.scrollIntoView({block:'start'})}
function nfMk(name,parent){const f={id:uid(),n:name,...(parent?{parent}:{}),col:NF_COLS[NFOLD().length%NF_COLS.length],at:Date.now()};NFOLD().push(f);save();return f}
function nfAsk(title,val,cb){openInfo(title,`<input class="in" id="nfdIn" dir="auto" maxlength="60" value="${esc(val||'')}" placeholder="${esc(t('nfd.namePh'))}" style="width:100%;box-sizing:border-box">`);const i=$('#nfdIn'),ok=$('#infoX');ok.textContent=t('pdl.save');ok.insertAdjacentHTML('beforebegin',`<button class="btn sm ghost" id="nfdX">${t('lt.cancel')}</button>`);
  const close=()=>$('#infoModal').classList.remove('on'),go=()=>{const v=i.value.trim();close();if(v)cb(v)};ok.onclick=go;$('#nfdX').onclick=close;i.onkeydown=e=>{if(e.key==='Enter')go()};setTimeout(()=>{i.focus();i.select()},60)}
function nfNew(parent){nfAsk(t('nfd.new'),'',n=>{nfMk(n,parent);nfRefresh()})}
function nfMoveNotes(ids,fd){fd=fd||null;ids=ids.filter(id=>{const n=NOTES().find(x=>x.id===id);return n&&nfOf(n)!==fd});if(!ids.length)return;const s=nfSnap();ids.forEach(id=>{const n=NOTES().find(x=>x.id===id);if(fd)n.fd=fd;else delete n.fd;n.updated=Date.now()});save();nfRefresh();const f=nfGet(fd);nfUndo(s,t('nfd.moved',f?f.n:t('notes.title')))}
function nfMoveFolder(id,to){to=to||null;const f=nfGet(id);if(!f||(f.parent||null)===to)return;if(to&&nfDesc(id).has(to)){toast(t('nfd.noSelf'));return}const s=nfSnap();if(to)f.parent=to;else delete f.parent;save();nfRefresh();const g=nfGet(to);nfUndo(s,t('nfd.moved',g?g.n:t('notes.title')))}
function nfDel(id){const f=nfGet(id);if(!f)return;const s=nfSnap(),par=nfGet(f.parent)?f.parent:null;NFOLD().forEach(g=>{if(g.parent===id){if(par)g.parent=par;else delete g.parent}});NOTES().forEach(n=>{if(n.fd===id){if(par)n.fd=par;else delete n.fd;n.updated=Date.now()}});S.nfold=NFOLD().filter(g=>g.id!==id);if(NF.cur===id)NF.cur=par;save();nfRefresh();nfUndo(s,t('nfd.deleted',f.n))}
function nfCoverPick(id){const i=document.createElement('input');i.type='file';i.accept='image/*';i.style.display='none';document.body.append(i);i.onchange=()=>{const f=i.files[0];i.remove();if(f)nfCoverSet(id,f)};i.click()}
function nfCoverSet(id,file){const img=new Image(),u=URL.createObjectURL(file);img.onerror=()=>{URL.revokeObjectURL(u);toast(t('lsh.coverFail'))};
  img.onload=()=>{const w=480,h=270,c=document.createElement('canvas');c.width=w;c.height=h;const s=Math.max(w/img.width,h/img.height),dw=img.width*s,dh=img.height*s;c.getContext('2d').drawImage(img,(w-dw)/2,(h-dh)/2,dw,dh);URL.revokeObjectURL(u);const f=nfGet(id);if(!f)return;f.cov=c.toDataURL('image/jpeg',.72);save();toast(t('lsh.coverOk'));nfRefresh()};img.src=u}
/* folder chooser: the whole tree, indented; «new folder» inside it */
function nfPick(title,cb,o){o=o||{};const ex=o.exclude?nfDesc(o.exclude):new Set(),rows=[];const walk=(pid,dep)=>nfKids(pid).forEach(f=>{if(ex.has(f.id))return;rows.push(`<button class="nfpr${f.id===o.cur?' on':''}" data-fd="${f.id}" style="padding-inline-start:${10+dep*20}px"><span class="nfpdot" style="${nfSwatch(f)}"></span><span dir="auto">${esc(f.n)}</span><small>${nfCount(f.id)||''}</small></button>`);walk(f.id,dep+1)});walk(null,0);
  openInfo(title,`<div class="nfpk"><button class="nfpr${!o.cur?' on':''}" data-fd=""><span class="nfpdot nfroot">📝</span><span>${t('notes.title')}</span></button>${rows.join('')}</div><button class="btn sm ghost" id="nfpNew" style="margin-top:8px">＋ ${t('nfd.new')}</button>`);
  $$('#infoBox [data-fd]').forEach(b=>b.onclick=()=>{$('#infoModal').classList.remove('on');cb(b.dataset.fd||null)});
  $('#nfpNew').onclick=()=>nfAsk(t('nfd.new'),'',n=>{const f=nfMk(n,null);cb(f.id)})}
function nfMenu(anchor,id){const f=nfGet(id);if(!f)return;const r=anchor.getBoundingClientRect();
  const p=qPopAt(`<div class="aymh" dir="auto">${esc(f.n)}</div><button data-a="open">📂 ${t('nfd.open')}</button><button data-a="ren">✏ ${t('nfd.ren')}</button><div class="nfsw" role="group" aria-label="${esc(t('nfd.col'))}">${NF_COLS.map(c=>`<button data-c="${c}" style="--c:${c}" class="${f.col===c&&!f.cov?'on':''}" aria-label="${esc(t('nfd.col'))} ${c}"></button>`).join('')}</div><button data-a="cov">🖼 ${t(f.cov?'nfd.covChg':'nfd.cov')}</button>${f.cov?`<button data-a="covx">✕ ${t('nfd.covX')}</button>`:''}<button data-a="sub">＋ ${t('nfd.sub')}</button><button data-a="mv">📁 ${t('nfd.mv')}</button><button data-a="del" class="nfdanger">🗑 ${t('nfd.del')}</button>`,r.left+r.width/2,r.bottom+4,'aymenu nfmenu');
  p.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{f.col=b.dataset.c;delete f.cov;save();closePP();nfRefresh()});
  p.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{const a=b.dataset.a;closePP();
    if(a==='open')nfGo(id);else if(a==='ren')nfAsk(t('nfd.ren'),f.n,v=>{f.n=v;save();nfRefresh()});else if(a==='cov')nfCoverPick(id);else if(a==='covx'){delete f.cov;save();nfRefresh()}
    else if(a==='sub')nfNew(id);else if(a==='mv')nfPick(t('nfd.mv'),to=>nfMoveFolder(id,to),{exclude:id,cur:f.parent||null});else if(a==='del'){if(confirm(t('nfd.delQ',f.n)))nfDel(id)}})}
/* the bar (path + buttons) and the folder cards above the notes */
function nfBar(filt){const w=$('#notesWrap');if(!w)return;let bar=$('#nfBar'),g=$('#nfGrid');if(!bar){w.insertAdjacentHTML('afterbegin','<div class="nfbar" id="nfBar"></div><div class="nfgrid" id="nfGrid"></div>');bar=$('#nfBar');g=$('#nfGrid')}
  const path=NF.cur?nfPath(NF.cur):[],nArc=NOTES().filter(n=>n.arc).length,sep='<span class="nfsep">›</span>';
  bar.innerHTML=`<nav class="nfpath"><button class="nfseg${!path.length&&!NF.arc?' on':''}" data-nfgo="">📝 ${t('notes.title')}</button>${path.map((f,i)=>sep+`<button class="nfseg${i===path.length-1?' on':''}" data-nfgo="${f.id}" dir="auto"><span class="nfpdot" style="${nfSwatch(f)}"></span>${esc(f.n)}</button>`).join('')}${NF.arc?sep+`<span class="nfseg on">🗄 ${t('nfd.arc')}</span>`:''}</nav><span class="nfsp"></span>${!NF.arc&&!filt?`<button class="btn sm ghost" id="nfNew">＋ ${t('nfd.new')}</button>`:''}${NF.cur&&!filt?`<button class="btn sm ghost nfmore" id="nfMore" aria-label="${esc(t('nfd.opts'))}">⋯</button>`:''}${!NF.cur&&!NF.arc&&nArc&&!filt?`<button class="btn sm ghost" id="nfArc">🗄 ${t('nfd.arc')} (${nArc})</button>`:''}`;
  const kids=filt||NF.arc?[]:nfKids(NF.cur);
  g.innerHTML=kids.map(f=>{const c=nfCount(f.id),sub=NFOLD().filter(x=>x.parent===f.id).length;return`<div class="nfcard${f.cov?' cov':''}" data-nf="${f.id}" draggable="${MOB.matches?'false':'true'}" role="button" tabindex="0" style="${nfSwatch(f)}"><span class="nfic">📁</span><div class="nfmeta"><b dir="auto">${esc(f.n)}</b><small>${t('nfd.cnt',c)}${sub?' · '+t('nfd.subs',sub):''}</small></div><button class="nfdots" data-nfm="${f.id}" aria-label="${esc(t('nfd.opts'))}">⋯</button></div>`}).join('');g.hidden=!kids.length;
  bar.querySelectorAll('[data-nfgo]').forEach(b=>{if(b.tagName==='BUTTON')b.onclick=()=>nfGo(b.dataset.nfgo||null)});
  const nb=$('#nfNew');if(nb)nb.onclick=()=>nfNew(NF.cur);const mo=$('#nfMore');if(mo)mo.onclick=()=>nfMenu(mo,NF.cur);const ab=$('#nfArc');if(ab)ab.onclick=()=>nfGo(null,true);
  g.querySelectorAll('.nfcard').forEach(c=>{const id=c.dataset.nf;c.onclick=e=>{if(e.target.closest('[data-nfm]'))return;nfGo(id)};c.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();nfGo(id)}};c.oncontextmenu=e=>{e.preventDefault();nfMenu(c,id)}});
  g.querySelectorAll('[data-nfm]').forEach(b=>b.onclick=e=>{e.stopPropagation();nfMenu(b,b.dataset.nfm)})}
renderNotes=function(){const q=($('#nSearch').value||'').trim().toLowerCase(),filt=!!(q||nTag);if(NF.cur&&!nfGet(NF.cur))NF.cur=null;
  let L_=sortNotes(NOTES().filter(n=>NF.arc?n.arc:!n.arc));if(q)L_=L_.filter(n=>(n.title+' '+(n.lock&&!notesUnlocked()?'':n.body)).toLowerCase().includes(q));if(nTag)L_=L_.filter(n=>noteTags(n).includes(nTag));if(!filt&&!NF.arc)L_=L_.filter(n=>nfOf(n)===NF.cur);
  renderNTags();nfBar(filt);NF.showFd=filt||NF.arc;
  $('#notesGrid').innerHTML=L_.length?L_.map(noteCard).join(''):(NF.cur&&nfKids(NF.cur).length?'':`<div class="empty">${t(q?'notes.none':NF.arc?'nfd.arcNone':NOTES().length?'nfd.empty':'notes.empty')}</div>`);NF.showFd=false;notesMasonry($('#notesGrid'));bindNoteCards($('#notesGrid'))};
{const _nc=noteCard;noteCard=function(n){let h=_nc(n);try{const f=NF.showFd&&nfGet(n.fd);if(f){const i=h.lastIndexOf('</small>');if(i>0)h=h.slice(0,i)+`<span class="nfchip" style="${nfSwatch(f)}" dir="auto">${esc(f.n)}</span>`+h.slice(i)}}catch(e){}return h}}
/* archived notes are not on Today or in a day's notes */
{hookFn('renderDayNotes',()=>renderDayNotes,f=>{renderDayNotes=f},'post',function(el){try{if(!el)return;el.querySelectorAll('.ncard[data-note]').forEach(c=>{const n=NOTES().find(x=>x.id===c.dataset.note);if(n&&n.arc)c.remove()})}catch(e){}})}
/* dragging a note card (the existing reorder drag) onto a folder card or a path segment moves it there */
window.addEventListener('pointermove',e=>{const dg=document.querySelector('#notesGrid .ncard.ndrag');if(!dg){if(NF.hov){NF.hov.classList.remove('nfover');NF.hov=null}return}const el=document.elementFromPoint(e.clientX,e.clientY),tg=el&&el.closest('#nfGrid .nfcard,#nfBar button[data-nfgo]');if(tg!==NF.hov){if(NF.hov)NF.hov.classList.remove('nfover');NF.hov=tg;if(tg)tg.classList.add('nfover')}},{passive:true});
{const _o=notesDropOrder;notesDropOrder=function(root,d){const h=NF.hov;NF.hov=null;if(h){h.classList.remove('nfover');const id=d.c.dataset.note,to=h.dataset.nf!=null?h.dataset.nf:(h.dataset.nfgo||null);setTimeout(()=>nfMoveNotes([id],to),0)}return _o(root,d)}}
/* folders drag onto folders (PC) */
function nfDropTg(e){return e.target&&e.target.closest?e.target.closest('#nfGrid .nfcard,#nfBar button[data-nfgo]'):null}
function nfDragClr(){$$('.nfover').forEach(x=>x.classList.remove('nfover'))}
document.addEventListener('dragstart',e=>{const c=e.target&&e.target.closest&&e.target.closest('#nfGrid .nfcard');if(!c)return;NF.dragF=c.dataset.nf;try{e.dataTransfer.setData('text/plain','nf:'+c.dataset.nf);e.dataTransfer.effectAllowed='move'}catch(x){}});
document.addEventListener('dragover',e=>{if(!NF.dragF)return;const tg=nfDropTg(e);nfDragClr();if(tg&&tg.dataset.nf!==NF.dragF){e.preventDefault();tg.classList.add('nfover')}});
document.addEventListener('drop',e=>{if(!NF.dragF)return;const tg=nfDropTg(e),id=NF.dragF;NF.dragF=null;nfDragClr();if(!tg||tg.dataset.nf===id)return;e.preventDefault();nfMoveFolder(id,tg.dataset.nf!=null?tg.dataset.nf:(tg.dataset.nfgo||null))});
document.addEventListener('dragend',()=>{NF.dragF=null;nfDragClr()});
/* right click on a note card: a small menu */
document.addEventListener('contextmenu',e=>{const c=e.target.closest&&e.target.closest('#notesGrid .ncard[data-note]');if(!c||document.querySelector('#notesGrid .ncard.ndrag'))return;const n=NOTES().find(x=>x.id===c.dataset.note);if(!n)return;e.preventDefault();
  const p=qPopAt(`<div class="aymh" dir="auto">${esc(n.title||t('notes.untitled'))}</div><button data-a="open">📝 ${t('nfd.open')}</button><button data-a="mv">📁 ${t('nfd.mvNote')}</button><button data-a="arc">🗄 ${t(n.arc?'nfd.unarc':'nfd.toArc')}</button>`,e.clientX,e.clientY,'aymenu');
  p.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{const a=b.dataset.a;closePP();if(a==='open')openNote(n.id);else if(a==='mv')nfPick(t('nfd.mvNote'),to=>nfMoveNotes([n.id],to),{cur:nfOf(n)});else nteArc(n.id,!n.arc)})});
function nteArc(id,on){const n=NOTES().find(x=>x.id===id);if(!n)return;const s=nfSnap();if(on)n.arc=Date.now();else delete n.arc;n.updated=Date.now();save();nfRefresh();nfUndo(s,t(on?'nfd.arcDone':'nfd.unarcDone'))}
/* Android back steps out of a notes folder */
{const _tb=window.thabatBack;window.thabatBack=function(){if(curView()==='boards'&&nbMode==='notes'&&(NF.cur||NF.arc)&&!$('.modal.on')&&!$('#ppPop')){nfGo(NF.arc?null:((nfGet(NF.cur)||{}).parent||null));return true}return _tb?_tb():false}}
/* a new note made inside a folder goes into it */
{hookFn('openNote',()=>openNote,f=>{openNote=f},'post',function(){try{if(NE&&NE._new&&!NE.fd&&curView()==='boards'&&nbMode==='notes'&&NF.cur){NE.fd=NF.cur;nteFdPaint()}}catch(e){}})}
/* closeNote rebuilt the record from a fixed list of fields; keep any other field the note had (folder, archive, lesson link…) */
const NTE_WL=new Set(['id','title','body','day','imgs','created','updated','ay','src','pin','auds','lock','ord']);
{const _cn=closeNote;closeNote=function(saveIt){const n=NE,r=_cn(saveIt);try{if(n&&saveIt){const rec=NOTES().find(x=>x.id===n.id);if(rec&&rec!==n){let ch=0;for(const k in n){if(k[0]==='_'||NTE_WL.has(k)||k in rec)continue;rec[k]=n[k];ch=1}if(!n.fd&&rec.fd){delete rec.fd;ch=1}if(!n.arc&&rec.arc){delete rec.arc;ch=1}if(ch)save()}}}catch(e){console.error(e)}return r}}
/* ---- editor: folder chip, «⋯» menu, highlight colours, word count, contents ---- */
function nteFdPaint(){const b=$('#nteFd');if(!b||!NE)return;const f=nfGet(NE.fd);b.innerHTML=f?`<span class="nfpdot" style="${nfSwatch(f)}"></span><span dir="auto">${esc(f.n)}</span>`:`📁 <span>${t('nfd.none')}</span>`;b.title=t('nfd.mvNote');try{uicPass&&uicPass(b)}catch(e){}}
const NTE_HL=[['','#f5d76e'],['g','#8fd9a8'],['b','#8cc0f5'],['r','#f39a9a'],['p','#c9a7f2']];
function nteHl(c){const ta=$('#neBody');if(!ta||ta.hidden)return;const v=ta.value,a=ta.selectionStart,b=ta.selectionEnd;if(a===b){toast(t('nte.selFirst'));return}const l='=='+(c?'{'+c+'}':''),nv=v.slice(0,a)+l+v.slice(a,b)+'=='+v.slice(b);ta.value=nv;ta.focus();ta.setSelectionRange(a+l.length,b+l.length);neRead();nteLive()}
function nteWords(s){return(String(s||'').replace(/thabat-book:[^)]*/g,'').replace(/[#*>=`\[\]{}()_~|-]/g,' ').match(/[\p{L}\p{N}]+/gu)||[]).length}
function nteHeads(s){const out=[];String(s||'').split('\n').forEach((l,i)=>{const m=l.match(/^(#{1,3}) (.*)$/);if(m&&m[2].trim())out.push({i,lv:m[1].length,t:m[2].trim()})});return out}
function nteLive(){if(!NE)return;const ta=$('#neBody'),body=ta&&!ta.hidden?ta.value:NE.body;const wc=$('#nteWc');if(wc){const w=nteWords(body);wc.textContent=w?t('nte.wc',w,Math.max(1,Math.round(w/200))):''}nteToc(body)}
function nteToc(body){const box=$('#nteToc'),nb=$('#noteBox');if(!box||!nb)return;const hs=nteHeads(body),side=hs.length>=2&&innerWidth/uiZoom()>=1180;nb.classList.toggle('nte-side',side);box.hidden=hs.length<2;if(box.hidden)return;
  const open=side||box.classList.contains('open');box.classList.toggle('side',side);
  box.innerHTML=`<button class="ntoch" id="nteTocH" aria-expanded="${open}">📑 ${t('nte.toc')} <small>(${hs.length})</small></button>${open?`<div class="ntocl">${hs.map((h,j)=>`<button data-ti="${j}" data-ln="${h.i}" class="lv${h.lv}" dir="auto">${esc(h.t)}</button>`).join('')}</div>`:''}`;
  $('#nteTocH').onclick=()=>{if(side)return;box.classList.toggle('open');nteToc(body)};
  box.querySelectorAll('[data-ti]').forEach(b=>b.onclick=()=>nteJump(+b.dataset.ti,+b.dataset.ln));if(side&&!nb._ntes){nb._ntes=1;nb.addEventListener('scroll',()=>{const b2=$('#nteToc');if(b2&&b2.classList.contains('side'))b2.style.top=(nb.scrollTop+20)+'px'},{passive:true})}if(side)box.style.top=(nb.scrollTop+20)+'px';else box.style.top=''}
function nteJump(j,ln){const pv=$('#nePrev'),ta=$('#neBody');if(pv&&!pv.hidden){const h=pv.querySelectorAll('.nh1,.nh2,.nh3')[j];if(h){h.scrollIntoView({block:'start',behavior:'smooth'});h.classList.add('ntflash');setTimeout(()=>h.classList.remove('ntflash'),1200)}return}
  if(!ta)return;const L_=ta.value.split('\n');let pos=0;for(let i=0;i<ln&&i<L_.length;i++)pos+=L_[i].length+1;
  const cs=getComputedStyle(ta),m=document.createElement('div');['fontFamily','fontSize','fontWeight','lineHeight','letterSpacing','paddingTop','paddingLeft','paddingRight','borderLeftWidth','borderRightWidth','direction','wordSpacing'].forEach(k=>m.style[k]=cs[k]);m.style.cssText+=`;position:absolute;visibility:hidden;white-space:pre-wrap;overflow-wrap:break-word;box-sizing:border-box;width:${ta.clientWidth}px`;m.textContent=ta.value.slice(0,pos)||' ';document.body.append(m);const y=m.scrollHeight;m.remove();
  ta.focus({preventScroll:true});ta.setSelectionRange(pos,pos+(L_[ln]||'').length);ta.scrollTop=Math.max(0,y-parseFloat(cs.paddingTop||0)-8);ta.scrollIntoView({block:'nearest'})}
function nteMenu(anchor){if(!NE)return;neRead();const n=NE,hs=nteHeads(n.body),r=anchor.getBoundingClientRect();
  const p=qPopAt(`<button data-a="fd">📁 ${t('nfd.mvNote')}</button><button data-a="bk">📖 ${t('nte.bkLink')}</button>${hs.length?`<button data-a="split">✂ ${t('nte.split')}</button>`:''}${n._new?'':`<button data-a="arc">🗄 ${t(n.arc?'nfd.unarc':'nfd.toArc')}</button>`}`,r.left+r.width/2,r.bottom+4,'aymenu');
  p.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{const a=b.dataset.a;closePP();
    if(a==='fd')nfPick(t('nfd.mvNote'),to=>{if(!NE)return;if(to)NE.fd=to;else delete NE.fd;nteFdPaint()},{cur:nfOf(NE)});
    else if(a==='bk')nteBkPick();else if(a==='split')nteSplit();
    else if(a==='arc'){const id=n.id,on=!n.arc;closeNote(true);nteArc(id,on)}})}
/* 78: split a note at its headings (the top heading level present); the original keeps the text before the first heading and a list of links */
function nteSplit(){if(!NE)return;neRead();const lines=NE.body.split('\n'),hs=nteHeads(NE.body);if(!hs.length){toast(t('nte.noH'));return}const top=Math.min(...hs.map(h=>h.lv)),cuts=hs.filter(h=>h.lv===top);
  const parts=cuts.map((h,j)=>({title:h.t,body:lines.slice(h.i+1,j+1<cuts.length?cuts[j+1].i:lines.length).join('\n').trim()}));if(!confirm(t('nte.splitQ',parts.length)))return;
  const oid=NE.id,old=NE.body,pre=lines.slice(0,cuts[0].i).join('\n').trim(),now=Date.now(),ids=[];
  parts.forEach((p,i)=>{const id=uid();ids.push(id);NOTES().push({id,title:p.title,body:p.body,day:NE.day||todayKey(),imgs:[],created:now+i,updated:now+i,...(NE.fd?{fd:NE.fd}:{}),...(NE.lock?{lock:1}:{})})});
  NE.body=(pre?pre+'\n\n':'')+parts.map(p=>'- [['+p.title+']]').join('\n');const nb=$('#neBody');if(nb)nb.value=NE.body;closeNote(true);
  toastAct(t('nte.splitDone',parts.length),t('lsh.undo'),()=>{S.notes=NOTES().filter(n=>!ids.includes(n.id));const o=NOTES().find(x=>x.id===oid);if(o){o.body=old;o.updated=Date.now()}save();notesChanged()})}
/* 84: a link to a page of a book */
function nteBkPick(){const L_=(()=>{try{return bkAll()}catch(e){return[]}})();if(!L_.length){toast(t('bkr.none'));return}const ta=$('#neBody'),at=ta&&!ta.hidden?ta.selectionStart:null;
  openInfo(t('nte.bkLink'),`<label class="nfbkl">${t('nte.bkBook')}<select class="in" id="nteBk">${L_.map(b=>`<option value="${esc(b.key)}">${esc(String(b.n||'').replace(/\.pdf$/i,''))}</option>`).join('')}</select></label><label class="nfbkl">${t('nte.bkPg')}<input class="in" id="ntePg" type="number" min="1" value="${(()=>{try{const r=(S.lib&&S.lib.bk||{})[L_[0].key];return r&&r.pg||1}catch(e){return 1}})()}"></label>`);
  const sel=$('#nteBk'),pg=$('#ntePg');sel.onchange=()=>{try{const r=(S.lib&&S.lib.bk||{})[sel.value];pg.value=r&&r.pg||1}catch(e){}};
  const ok=$('#infoX');ok.textContent=t('nte.bkIns');ok.onclick=()=>{const b=L_.find(x=>x.key===sel.value),n=Math.max(1,parseInt(pg.value)||1);$('#infoModal').classList.remove('on');if(!b||!NE)return;
    const lab=String(b.n||'').replace(/\.pdf$/i,'').replace(/[\[\]]/g,'')+' · '+t('nte.pgS')+' '+n,ins=`[📖 ${lab}](thabat-book:${b.key}#${n})`;
    if(ta&&!ta.hidden){const v=ta.value,a=at==null?v.length:at;ta.value=v.slice(0,a)+ins+v.slice(a);neRead();ta.focus();ta.setSelectionRange(a+ins.length,a+ins.length)}else{NE.body=String(NE.body||'').replace(/\s*$/,'')+'\n'+ins;try{neShowMode()}catch(e){}}nteLive()}}
async function nteBkOpen(key,pg){const b=(()=>{try{return bkAll().find(x=>x.key===key)}catch(e){return null}})();if(!b){toast(t('lb.off'));return}if(NE)closeNote(true);try{await bkOpen(b)}catch(e){console.error(e);return}
  let k=0;const go=()=>{if(BK.key&&BK.pages.length>=pg){bkGoPage(pg);return}if(++k<60)setTimeout(go,200)};go()}
document.addEventListener('click',e=>{const a=e.target.closest&&e.target.closest('a.nbk[data-bk]');if(!a)return;e.preventDefault();e.stopPropagation();nteBkOpen(a.dataset.bk,+a.dataset.pg||1)},true);
/* 85: ==highlight== and =={g}coloured highlight==; book links render as buttons */
{const _mi=mdInline;mdInline=function(x){x=String(x).replace(/\[([^\]\n]+)\]\(thabat-book:([\w:.\-]+)#(\d+)\)/g,(m,l,k,p)=>`<a class="nbk" data-bk="${k}" data-pg="${p}" href="#">${l}</a>`).replace(/==(?:\{([gbrp])\})?([^=\n]+?)==/g,(m,c,s)=>`<mark class="nhl${c?' nhl-'+c:''}">${s}</mark>`);return _mi(x)}}
{const _mp=mdPlain;mdPlain=function(b){return _mp(String(b||'').replace(/\[([^\]\n]+)\]\(thabat-book:[^)]*\)/g,'$1').replace(/==(?:\{[gbrp]\})?([^=\n]+?)==/g,'$1'))}}
{hookFn('renderNoteEd',()=>renderNoteEd,f=>{renderNoteEd=f},'post',function(){try{const n=NE,nb=$('#noteBox');if(!n||!nb)return;
  const hd=nb.querySelector('.nehead');if(hd&&!$('#nteFd')){hd.insertAdjacentHTML('beforeend','<button class="btn sm ghost ntefd" id="nteFd"></button>');$('#nteFd').onclick=()=>nfPick(t('nfd.mvNote'),to=>{if(!NE)return;if(to)NE.fd=to;else delete NE.fd;nteFdPaint()},{cur:nfOf(NE)});nteFdPaint()}
  const tb=nb.querySelector('.netb');if(tb&&!$('#nteHlB')){tb.insertAdjacentHTML('beforeend',`<button class="btn sm ghost" id="nteHlB" data-md="hl" title="${esc(t('nte.hl'))}" aria-label="${esc(t('nte.hl'))}"><span class="ntehl">ab</span></button><button class="btn sm ghost" id="nteMore" title="${esc(t('nfd.opts'))}" aria-label="${esc(t('nfd.opts'))}">⋯</button>`);
    $('#nteHlB').onclick=e=>{e.preventDefault();const r=$('#nteHlB').getBoundingClientRect();const p=qPopAt(`<div class="aymh">${t('nte.hl')}</div><div class="nfsw">${NTE_HL.map(([k,c])=>`<button data-h="${k}" style="--c:${c}" aria-label="${esc(t('nte.hl'))}"></button>`).join('')}</div>`,r.left+r.width/2,r.bottom+4,'aymenu');p.querySelectorAll('[data-h]').forEach(b=>{b.onmousedown=ev=>ev.preventDefault();b.onclick=()=>{closePP();nteHl(b.dataset.h)}})};
    $('#nteMore').onclick=e=>{e.preventDefault();nteMenu($('#nteMore'))}}
  const ft=nb.querySelector('.neft');if(ft&&!$('#nteWc'))ft.insertAdjacentHTML('beforebegin','<div class="ntewc" id="nteWc"></div>');
  if(!$('#nteToc')){const tl=nb.querySelector('.netools')||nb.querySelector('#neBody');if(tl)tl.insertAdjacentHTML('beforebegin','<div class="netoc" id="nteToc" hidden></div>')}
  const ta=$('#neBody');if(ta&&!ta._nte){ta._nte=1;let tm=0;ta.addEventListener('input',()=>{clearTimeout(tm);tm=setTimeout(nteLive,350)})}
  nteLive()}catch(e){console.error(e)}})}
{hookFn('neShowMode',()=>neShowMode,f=>{neShowMode=f},'post',function(){try{nteLive()}catch(e){}})}

