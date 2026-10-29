/* ============ v3.140.0: Notion list C — sub-pages, an icon per note, a synced piece of another note, duplicate, move a selection to another note, recently opened, a live task list ============ */
/* n.parent = the note it sits under (sub-pages are hidden from the notes grid unless searching, and listed under their parent); n.ic = a UIC_P icon key.
   «![[title]]» or «![[title#heading]]» alone on a line shows that note (or that section) as it is now; «{{tasks}}» / «{{tasks #tag}}» lists the real tasks. */
const NSB={rec:'thabat.nrecent',depth:0};
function nsbNote(id){return NOTES().find(n=>n.id===id)}
function nsbKids(id){return NOTES().filter(n=>n.parent===id&&!n.arc).sort((a,b)=>(a.created||0)-(b.created||0))}
function nsbUnder(id,anc){let n=nsbNote(id),g=0;while(n&&n.parent&&g++<30){if(n.parent===anc)return true;n=nsbNote(n.parent)}return false}
function nsbIco(n,sz){return n&&n.ic&&UIC_P[n.ic]?`<span class="nic" style="--ics:${sz||16}px">${uicSvg(n.ic,'')}</span>`:''}
/* the card: icon before the title, number of sub-pages */
{const _c=noteCard;noteCard=function(n,...a){let h=_c(n,...a);try{if(n.ic)h=h.replace('<b dir="auto">','<b dir="auto">'+nsbIco(n,15));const k=nsbKids(n.id).length;if(k)h=h.replace(/<\/small><\/div><\/button>$/,` · <span class="nsubc">${esc(t('nsb.kids',k))}</span></small></div></button>`);
  if(n.parent){const p=nsbNote(n.parent);if(p)h=h.replace('<div class="nbody">',`<div class="nbody"><span class="nsbp">↳ ${esc(p.title||t('notes.untitled'))}</span>`)}}catch(e){}return h}}
/* the notes grid: sub-pages stay under their parent unless a search is typed; the recently opened row on top */
function nrcList(){try{return JSON.parse(localStorage.getItem(NSB.rec)||'[]')}catch(e){return[]}}
{const _o=openNote;openNote=function(id,...a){try{if(id){const L_=nrcList().filter(x=>x!==id);L_.unshift(id);localStorage.setItem(NSB.rec,JSON.stringify(L_.slice(0,12)))}}catch(e){}return _o(id,...a)}}
{hookFn('renderNotes',()=>renderNotes,f=>{renderNotes=f},'post',function(){try{const w=$('#notesWrap');if(!w)return;const q=($('#nSearch')||{}).value||'',inArc=typeof NF!=='undefined'&&NF.arc;
  if(!q.trim())w.querySelectorAll('.ncard[data-note]').forEach(c=>{const n=nsbNote(c.dataset.note);if(n&&n.parent&&nsbNote(n.parent))c.remove()});
  w.querySelector('#nrcBar')?.remove();if(q.trim()||inArc||(typeof NF!=='undefined'&&NF.cur))return;const L_=nrcList().map(nsbNote).filter(n=>n&&!n.arc&&!(n.lock&&!notesUnlocked())).slice(0,8);if(!L_.length)return;
  const grid=$('#nfGrid')||w.firstElementChild;const bar=document.createElement('div');bar.id='nrcBar';bar.className='nrcbar';bar.innerHTML=`<small>${esc(t('nrc.t'))}</small>${L_.map(n=>`<button class="nrcc" data-nrc="${n.id}">${nsbIco(n,13)}<span dir="auto">${esc(n.title||mdPlain(n.body||'').slice(0,30)||t('notes.untitled'))}</span></button>`).join('')}`;
  if(grid&&grid.parentElement===w)grid.after(bar);else w.prepend(bar);bar.querySelectorAll('[data-nrc]').forEach(b=>b.onclick=()=>openNote(b.dataset.nrc))}catch(e){console.error(e)}})}

/* editor: the icon button before the title, the path to the parent, and the sub-pages list under the text */
function nsbPaint(){const box=$('#noteBox');if(!box||!NE)return;const head=box.querySelector('.nehead');
  if(head&&!$('#nicB')){const b=document.createElement('button');b.type='button';b.id='nicB';b.className='btn sm ghost nicb';b.title=t('nic.t');b.setAttribute('aria-label',t('nic.t'));head.prepend(b);b.onclick=()=>nicPick(b)}
  const ib=$('#nicB');if(ib)ib.innerHTML=NE.ic&&UIC_P[NE.ic]?uicSvg(NE.ic,''):'<span class="nicph">＋</span>';
  box.querySelector('#nsbCrumb')?.remove();const p=NE.parent&&nsbNote(NE.parent);if(p&&head){const c=document.createElement('button');c.type='button';c.id='nsbCrumb';c.className='nsbcrumb';c.innerHTML=`‹ ${nsbIco(p,13)}<span dir="auto">${esc(p.title||t('notes.untitled'))}</span>`;c.onclick=()=>nsbGo(p.id);head.before(c)}
  box.querySelector('#nsubBox')?.remove();if(NE._new&&!NE.title)return;const ks=nsbKids(NE.id);const anchor=$('#nePrev')||$('#neBody');if(!anchor)return;
  const d=document.createElement('div');d.id='nsubBox';d.className='nsubbox';d.innerHTML=`<div class="nsubh"><b>${esc(t('nsb.t'))}</b><button type="button" class="btn sm ghost" id="nsbNew">＋ ${esc(t('nsb.new'))}</button></div>${ks.map(n=>`<button type="button" class="nsubr" data-nsb="${n.id}">${nsbIco(n,14)||'<span class="nsubd">▤</span>'}<span dir="auto">${esc(n.title||t('notes.untitled'))}</span>${nsbKids(n.id).length?`<small>${esc(t('nsb.kids',nsbKids(n.id).length))}</small>`:''}</button>`).join('')}`;
  if(!ks.length)d.classList.add('empty');anchor.parentElement.insertBefore(d,anchor.nextSibling);d.querySelector('#nsbNew').onclick=nsbNew;d.querySelectorAll('[data-nsb]').forEach(b=>b.onclick=()=>nsbGo(b.dataset.nsb))}
function nsbGo(id){if(!NE)return openNote(id);neRead();const keep=NE.title||NE.body;closeNote(!!keep);setTimeout(()=>openNote(id),60)}
function nsbNew(){if(!NE)return;neRead();if(!(NE.title||'').trim()&&!(NE.body||'').trim()){toast(t('nsb.needT'));return}const pid=NE.id;closeNote(true);setTimeout(()=>{openNote(null);if(NE){NE.parent=pid;NE.fd=(nsbNote(pid)||{}).fd;nsbPaint()}},60)}
{hookFn('renderNoteEd',()=>renderNoteEd,f=>{renderNoteEd=f},'post',function(){try{nsbPaint()}catch(e){console.error(e)}})}
{hookFn('neShowMode',()=>neShowMode,f=>{neShowMode=f},'post',function(){try{nsbPaint()}catch(e){console.error(e)}})}
/* closeNote keeps every field it does not know (3.41 NTE_WL wrapper), so parent and ic survive a save */
function nicPick(btn){const keys=[...new Set(CAT_ICONS.concat(['star','heart','flag','home','bag','check','calendar','clock','link','pin','folder','sun','moon','fire','gift','idea'].filter(k=>UIC_P[k])))].filter(k=>UIC_P[k]);
  openInfo(esc(t('nic.t')),`<div class="nicg">${keys.map(k=>`<button type="button" class="nicc${NE&&NE.ic===k?' on':''}" data-nic="${k}" title="${k}">${uicSvg(k,'')}</button>`).join('')}</div><button type="button" class="btn sm ghost" data-nic="">${esc(t('nic.none'))}</button>`);
  $$('#infoBox [data-nic]').forEach(b=>b.onclick=()=>{if(!NE)return;if(b.dataset.nic)NE.ic=b.dataset.nic;else delete NE.ic;$('#infoModal').classList.remove('on');nsbPaint()})}

/* a note chooser (search + list); o.skip = ids to leave out, o.newOk = offer «a new note» */
function nnPick(title,cb,o){o=o||{};const all=NOTES().filter(n=>!n.arc&&!(n.lock&&!notesUnlocked())&&!(o.skip||[]).includes(n.id)).sort((a,b)=>(b.updated||b.created||0)-(a.updated||a.created||0));
  openInfo(esc(title),`<input class="in" id="nnpQ" placeholder="${esc(t('nnp.q'))}" dir="auto"><div class="nnpl" id="nnpL"></div>`);const L_=$('#nnpL'),Q=$('#nnpQ');
  const paint=()=>{const q=lshNorm(Q.value||'');const hits=all.filter(n=>!q||lshNorm(n.title||'').includes(q)||lshNorm(n.body||'').includes(q)).slice(0,40);
    L_.innerHTML=(o.newOk?`<button type="button" class="nnpr nnpnew" data-nnp="+">＋ ${esc(t('nnp.new'))}</button>`:'')+hits.map(n=>`<button type="button" class="nnpr" data-nnp="${n.id}">${nsbIco(n,14)}<span dir="auto">${esc(n.title||mdPlain(n.body||'').slice(0,40)||t('notes.untitled'))}</span><small>${gShort(keyToDate(n.day))}</small></button>`).join('')||`<small class="muted">${esc(t('nnp.none'))}</small>`;
    L_.querySelectorAll('[data-nnp]').forEach(b=>b.onclick=()=>{$('#infoModal').classList.remove('on');cb(b.dataset.nnp)})};
  Q.oninput=paint;paint();setTimeout(()=>Q.focus(),60)}
/* 15: duplicate — a new note with the same text, folder, icon and its own copies of the pictures */
async function nsbDup(){if(!NE)return;neRead();const src=JSON.parse(JSON.stringify(NE));const n=Object.assign({},src,{id:uid(),title:(src.title||t('notes.untitled'))+' '+t('ndp.suf'),created:Date.now(),updated:Date.now()});['_new','_orig','_added','_view','_fold','pin','ord','obs','ntn','lock'].forEach(k=>delete n[k]);
  const map={},imgs=[];for(const id of (src.imgs||[])){try{const d=await nImg(id);if(!d)continue;const nid=uid();await idbSet('nimg:'+nid,d);map[id]=nid;imgs.push(nid)}catch(e){}}n.imgs=imgs;n.body=String(n.body||'').replace(/!\[\[img:([\w-]+)\]\]/g,(q,id)=>map[id]?'![[img:'+map[id]+']]':q);if(n.cov&&map[n.cov])n.cov=map[n.cov];else delete n.cov;
  closeNote(true);NOTES().push(n);save();notesChanged();toast(t('ndp.done'));setTimeout(()=>openNote(n.id),80)}
/* 16: move the selected lines to another note (or a new one); one undo for both notes */
function nsbMoveSel(){if(!NE)return;const ta=$('#neBody');neRead();const a=NE._selA,b=NE._selB;if(a==null||b==null||b<=a){toast(t('nmv.sel'));return}const txt=NE.body.slice(a,b);
  nnPick(t('nmv.t'),to=>{const before=JSON.stringify(NOTES()),srcId=NE.id,rest=NE.body.slice(0,a)+NE.body.slice(b);let tgt;
    if(to==='+'){tgt={id:uid(),title:(txt.split('\n').find(l=>l.trim())||'').replace(/^#+\s*/,'').slice(0,60),body:txt.trim(),day:todayKey(),imgs:[],created:Date.now(),updated:Date.now(),fd:NE.fd};NOTES().push(tgt)}
    else{tgt=nsbNote(to);if(!tgt)return;tgt.body=(tgt.body||'').replace(/\s+$/,'')+'\n\n'+txt.trim();tgt.updated=Date.now()}
    NE.body=rest;if(ta)ta.value=rest;closeNote(true);save();notesChanged();
    toastAct(t('nmv.done',tgt.title||t('notes.untitled')),t('undo'),()=>{const old=JSON.parse(before);const arr=NOTES();arr.splice(0,arr.length,...old);save();notesChanged()});setTimeout(()=>openNote(srcId),80)},{skip:[NE.id],newOk:true})}
/* sub-page placement from the menu */
function nsbPlace(){if(!NE)return;neRead();const me=NE.id;nnPick(t('nsb.under'),to=>{if(to===me||nsbUnder(to,me)){toast(t('nsb.loop'));return}if(!NE)return;NE.parent=to;nsbPaint();toast(t('nsb.moved'))},{skip:[me].concat(NOTES().filter(n=>nsbUnder(n.id,me)).map(n=>n.id))})}
{hookFn('nteMenu',()=>nteMenu,f=>{nteMenu=f},'pre',function(){try{const ta=$('#neBody');if(NE&&ta){NE._selA=ta.selectionStart;NE._selB=ta.selectionEnd}}catch(e){}})}
{hookFn('nteMenu',()=>nteMenu,f=>{nteMenu=f},'post',function(){try{const p=$('#ppPop');if(!p||p.querySelector('[data-nsbm]'))return;const add=(ic,lab,fn)=>{const b=document.createElement('button');b.dataset.nsbm=1;b.innerHTML=`${ic} ${esc(lab)}`;b.onclick=e=>{e.stopPropagation();closePP();fn()};p.append(b)};
  add('▤',t('nsb.new'),nsbNew);add('↳',NE&&NE.parent?t('nsb.under2'):t('nsb.under'),nsbPlace);if(NE&&NE.parent)add('↑',t('nsb.out'),()=>{delete NE.parent;nsbPaint();toast(t('nsb.outD'))});
  add('◇',t('nic.t'),()=>nicPick($('#nicB')||p));add('⧉',t('ndp.b'),nsbDup);if(NE&&NE._selB>NE._selA)add('⇢',t('nmv.b'),nsbMoveSel)}catch(e){console.error(e)}})}

/* 14 + 19 in the reading view */
function nsyncSection(body,h){if(!h)return body;const L_=String(body||'').split('\n'),hn=lshNorm(h);let s=-1,lv=0;
  for(let i=0;i<L_.length;i++){const m=L_[i].match(/^(#{1,4})\s+(.*)$/);if(m&&lshNorm(m[2])===hn){s=i;lv=m[1].length;break}}if(s<0)return null;let e=L_.length;
  for(let i=s+1;i<L_.length;i++){const m=L_[i].match(/^(#{1,4})\s+/);if(m&&m[1].length<=lv){e=i;break}}return L_.slice(s,e).join('\n')}
function ltkTasks(tag){const out=[],td=todayKey(),d0=keyToDate(td),tg=tag?lshNorm(tag.replace(/^#/,'')):'';
  for(let o=-14;o<=14;o++){const d=new Date(d0);d.setDate(d.getDate()+o);const k=dKey(d),day=S.days&&S.days[k];if(!day||!day.tasks)continue;
    day.tasks.forEach(x=>{if(!x||!x.text||x.pp)return;if(x.done&&k!==td)return;if(tg&&!(lshNorm(x.text).includes('#'+tg)))return;out.push({k,x})})}
  /* today first, then the late ones (newest first), then the coming ones */
  const rk=k=>k===td?0:k<td?1:2;out.sort((a,b)=>rk(a.k)-rk(b.k)||(rk(a.k)===1?(a.k<b.k?1:a.k>b.k?-1:0):(a.k<b.k?-1:a.k>b.k?1:0)));
  return out.slice(0,40)}
function ltkHTML(tag){const L_=ltkTasks(tag),td=todayKey();return`<div class="nltk"><div class="nltkh"><b>${esc(t('ltk.t'))}</b>${tag?`<span class="ntag">${esc(tag.startsWith('#')?tag:'#'+tag)}</span>`:''}</div>${L_.length?L_.map(({k,x})=>`<label class="nltkr${x.done?' dn':''}"><input type="checkbox" data-ltk="${k}|${esc(x.id)}"${x.done?' checked':''}><span dir="auto">${mdInline(esc(x.text))}</span>${k!==td?`<small class="${k<td?'late':''}">${esc(gShort(keyToDate(k)))}</small>`:''}</label>`).join(''):`<small class="muted">${esc(t('ltk.none'))}</small>`}</div>`}
{const _m=mdLite;mdLite=function(src,...a){const L_=String(src||'').split('\n'),B=[];let inCode=false;
  for(let i=0;i<L_.length;i++){const l=L_[i];if(/^\s*```/.test(l)){inCode=!inCode;continue}if(inCode)continue;let m;
    if(m=l.match(/^\s*\{\{\s*(?:tasks|مهام)\s*(#[^\s}]+)?\s*\}\}\s*$/i)){B.push(ltkHTML(m[1]||''));L_[i]='⟦NSY'+(B.length-1)+'⟧';continue}
    if(m=l.match(/^\s*!\[\[([^\]|#]+?)(?:#([^\]|]+))?(?:\|[^\]]*)?\]\]\s*$/)){const nm=m[1].trim();if(/^img:/.test(nm)||/\.(png|jpe?g|gif|webp|bmp|svg|pdf)$/i.test(nm))continue;
      const n=NOTES().find(x=>!x.arc&&(x.title||'').trim().toLowerCase()===nm.toLowerCase());let inner;
      if(!n)inner=`<small class="muted">${esc(t('nsy.miss'))}</small>`;else if(n.lock&&!notesUnlocked())inner=`<small class="muted">${esc(t('pin.lockedCard'))}</small>`;else if(NSB.depth>=2)inner=`<small class="muted">…</small>`;
      else{const part=nsyncSection(n.body,m[2]);if(part==null)inner=`<small class="muted">${esc(t('nsy.noH',m[2]))}</small>`;else{NSB.depth++;try{inner=mdLite(part)}finally{NSB.depth--}inner=inner.replace(/\sdata-ln="\d+"/g,' disabled').replace(/\sdata-l2?="\d+"/g,'')}}
      B.push(`<div class="nsync"><a class="nlink nsynch" data-nl="${esc(nm)}">↻ ${n?nsbIco(n,13):''}${esc(nm)}${m[2]?' › '+esc(m[2]):''}</a><div class="nsyncb">${inner}</div></div>`);L_[i]='⟦NSY'+(B.length-1)+'⟧'}}
  if(!B.length)return _m(src,...a);return _m(L_.join('\n'),...a).replace(/<div[^>]*>⟦NSY(\d+)⟧<\/div>/g,(q,n)=>B[+n])}}
{const _p=mdPlain;mdPlain=function(b,...a){return _p(String(b||'').replace(/^\s*\{\{\s*(?:tasks|مهام)[^}]*\}\}\s*$/gmi,'').replace(/^\s*!\[\[(?!img:)([^\]|#]+)(?:#([^\]|]+))?[^\]]*\]\]\s*$/gm,(q,n,h)=>'↻ '+n+(h?' › '+h:'')),...a)}}
document.addEventListener('change',e=>{const c=e.target;if(!c||!c.matches||!c.matches('input[data-ltk]'))return;const [k,id]=c.dataset.ltk.split('|');const x=((S.days[k]||{}).tasks||[]).find(q=>String(q.id)===id);if(!x)return;
  x.done=c.checked;x.doneAt=x.done?Date.now():null;save();try{if(curView()==='today')renderTasks()}catch(er){}c.closest('label')?.classList.toggle('dn',x.done);if(x.done&&typeof chimeSoft==='function')chimeSoft()},true);
SLASH.splice(SLASH.findIndex(x=>x[0]==='img')+1,0,['ltk','{{tasks}}'],['nsy','![[']);

WNP['3.140.0']=[{k:'wnp.nsb',f:()=>`<div class="nsubbox" style="margin:0"><div class="nsubh"><b>${esc(t('nsb.t'))}</b></div><button type="button" class="nsubr"><span class="nsubd">▤</span><span>${esc(t('wnp.nsbA'))}</span></button><button type="button" class="nsubr"><span class="nsubd">▤</span><span>${esc(t('wnp.nsbB'))}</span></button></div>`},
  {k:'wnp.ltk',f:()=>ltkHTML('')}];
