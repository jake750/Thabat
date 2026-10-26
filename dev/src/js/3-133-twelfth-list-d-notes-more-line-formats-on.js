/* ============ 3.133 twelfth list D (notes): more line formats on the bar, find inside the open note, a note as a Word file, copy for WhatsApp,
   tag statistics, the day's notes in the calendar day panel (52 manual order and 53 pin already existed) ============ */
/* 12th-50: «1.» numbered list, «❝» quote and «¶» plain line on the editor bar (they act on the line(s) under the cursor, like H and •) */
function nlnApply(kind){const ta=$('#neBody');if(!ta)return;const v=ta.value,a=ta.selectionStart,b=ta.selectionEnd,ls=v.lastIndexOf('\n',a-1)+1,le=(()=>{const i=v.indexOf('\n',Math.max(a,b-(b>a&&v[b-1]==='\n'?1:0)));return i<0?v.length:i})();
  const strip=s=>s.replace(/^(\s*)(#{1,6}\s+|[-*•]\s+\[[ xX]\]\s+|[-*•]\s+|\d+[.)]\s+|>\s?)/,'$1');let n=0;
  const out=v.slice(ls,le).split('\n').map(l=>{const s=strip(l);if(kind==='ol')return`${++n}. ${s}`;if(kind==='q')return`> ${s}`;return s}).join('\n');
  ta.value=v.slice(0,ls)+out+v.slice(le);ta.selectionStart=ls;ta.selectionEnd=ls+out.length;ta.focus();ta.dispatchEvent(new Event('input',{bubbles:true}))}
{hookFn('renderNoteEd',()=>renderNoteEd,f=>{renderNoteEd=f},'post',function(){try{const li=$('.netb [data-md="li"]');if(!li||$('.netb [data-nl]'))return;
  li.insertAdjacentHTML('afterend',[['ol','1.'],['q','❝'],['p','¶']].map(([k,l])=>`<button class="btn sm ghost" data-nl="${k}" title="${esc(t('nln.'+k))}">${l}</button>`).join(''));
  $$('.netb [data-nl]').forEach(b=>{b.onmousedown=e=>e.preventDefault();b.onclick=()=>nlnApply(b.dataset.nl)});
  const pv=$('#nePrev'),hide=pv&&!pv.hidden&&pv.offsetParent!==null;$$('.netb [data-nl]').forEach(b=>b.hidden=!!hide)}catch(e){}})}
{hookFn('neShowMode',()=>neShowMode,f=>{neShowMode=f},'post',function(){try{const md=$('.netb [data-md]');$$('.netb [data-nl]').forEach(b=>b.hidden=!!(md&&md.hidden))}catch(e){}})}

/* 12th-51: find in the open note — a bar over the editor (🔍 in the bar, Ctrl+F while the editor is open); edit mode selects the hit, view mode marks it */
const NFD={q:'',i:0,hits:[]};
function nfdOpen(){let bar=$('#nfdBar');const box=$('.notebox')||$('#neBody')?.closest('.box');if(!box)return;if(!bar){box.insertAdjacentHTML('afterbegin',`<div class="nfdbar" id="nfdBar"><input class="in" id="nfdIn" dir="auto" placeholder="${esc(t('nfnd.ph'))}"><small id="nfdN"></small><button class="btn sm ghost" data-f="-1" aria-label="${esc(t('nfnd.prev'))}">↑</button><button class="btn sm ghost" data-f="1" aria-label="${esc(t('nfnd.next'))}">↓</button><button class="btn sm ghost" data-f="x" aria-label="${esc(t('nfnd.x'))}">✕</button></div>`);bar=$('#nfdBar');
    $('#nfdIn').oninput=e=>{NFD.q=e.target.value;nfdRun(0)};$('#nfdIn').onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();nfdStep(e.shiftKey?-1:1)}else if(e.key==='Escape'){e.preventDefault();e.stopPropagation();nfdClose()}};
    bar.querySelectorAll('[data-f]').forEach(b=>{b.onmousedown=e=>e.preventDefault();b.onclick=()=>b.dataset.f==='x'?nfdClose():nfdStep(+b.dataset.f)})}
  const i=$('#nfdIn');const sel=$('#neBody')&&$('#neBody').value.slice($('#neBody').selectionStart,$('#neBody').selectionEnd);if(sel&&sel.length<60&&!sel.includes('\n'))i.value=sel;i.focus();i.select();NFD.q=i.value;if(NFD.q)nfdRun(0)}
function nfdClose(){$('#nfdBar')?.remove();nfdUnmark();NFD.q='';NFD.hits=[]}
function nfdUnmark(){$$('#nePrev mark.nfdm').forEach(m=>{const tx=document.createTextNode(m.textContent);m.replaceWith(tx);tx.parentNode&&tx.parentNode.normalize()})}
function nfdView(){const pv=$('#nePrev');return!!(pv&&!pv.hidden&&pv.offsetParent!==null)}
function nfdRun(i){nfdUnmark();const q=NFD.q.trim(),nq=lshNorm(q);NFD.hits=[];if(!q){$('#nfdN').textContent='';return}
  if(nfdView()){const tw=document.createTreeWalker($('#nePrev'),NodeFilter.SHOW_TEXT),nodes=[];while(tw.nextNode())nodes.push(tw.currentNode);
    nodes.forEach(nd=>{const s=nd.nodeValue,low=s.toLowerCase(),ql=q.toLowerCase();let at=0,j,parts=[];while((j=low.indexOf(ql,at))>=0){parts.push([j,j+q.length]);at=j+q.length}if(!parts.length)return;
      const frag=document.createDocumentFragment();let p0=0;parts.forEach(([a,b])=>{frag.append(s.slice(p0,a));const m=document.createElement('mark');m.className='nfdm';m.textContent=s.slice(a,b);frag.append(m);NFD.hits.push(m);p0=b});frag.append(s.slice(p0));nd.replaceWith(frag)})}
  else{const v=$('#neBody').value,low=v.toLowerCase(),ql=q.toLowerCase();let at=0,j;while((j=low.indexOf(ql,at))>=0){NFD.hits.push(j);at=j+q.length}void nq}
  NFD.i=Math.min(i,Math.max(0,NFD.hits.length-1));nfdShow()}
function nfdStep(d){if(!NFD.hits.length){nfdRun(0);return}NFD.i=(NFD.i+d+NFD.hits.length)%NFD.hits.length;nfdShow()}
function nfdShow(){const n=NFD.hits.length,c=$('#nfdN');if(c)c.textContent=n?`${NFD.i+1}/${n}`:t('nfnd.none');$('#nfdIn')?.classList.toggle('nfdno',!n&&!!NFD.q);if(!n)return;const h=NFD.hits[NFD.i];
  if(typeof h==='number'){const ta=$('#neBody'),q=NFD.q.trim();ta.focus({preventScroll:true});ta.setSelectionRange(h,h+q.length);const line=ta.value.slice(0,h).split('\n').length-1,lh=parseFloat(getComputedStyle(ta).lineHeight)||22;
    let y;try{y=typeof taCaret==='function'?taCaret(ta,h).top:line*lh}catch(e){y=line*lh}ta.scrollTop=Math.max(0,y-ta.clientHeight/3);setTimeout(()=>$('#nfdIn')?.focus({preventScroll:true}),0)}
  else{NFD.hits.forEach(m=>m.classList.remove('on'));h.classList.add('on');h.scrollIntoView({block:'center',behavior:'smooth'})}}
document.addEventListener('keydown',e=>{if(!(e.ctrlKey||e.metaKey)||e.key.toLowerCase()!=='f'||e.shiftKey||e.altKey)return;if(!NE||!$('#neBody'))return;const m=$('#neBody').closest('.modal');if(m&&!m.classList.contains('on'))return;e.preventDefault();e.stopPropagation();nfdOpen()},true);
{hookFn('renderNoteEd',()=>renderNoteEd,f=>{renderNoteEd=f},'post',function(){try{NFD.hits=[];const bar=$('.netb');if(bar&&!$('#nfdB')){const sp=bar.querySelector('#neRec');(sp||bar.lastElementChild).insertAdjacentHTML('beforebegin',`<button class="btn sm ghost" id="nfdB" title="${esc(t('nfnd.t'))} (Ctrl+F)">🔍</button>`);$('#nfdB').onclick=nfdOpen}
  if($('#nfdBar')&&NFD.q)setTimeout(()=>nfdRun(NFD.i),30)}catch(e){}})}
{hookFn('neShowMode',()=>neShowMode,f=>{neShowMode=f},'post',function(){try{if($('#nfdBar')&&NFD.q)setTimeout(()=>nfdRun(0),30)}catch(e){}})}
{hookFn('closeNote',()=>closeNote,f=>{closeNote=f},'pre',function(){try{nfdClose()}catch(e){}})}

/* 12th-54: the open note as a Word file (.docx: headings, lists, checkboxes, quotes, **bold**, right-to-left paragraphs for Arabic) */
function docxEsc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
function docxRuns(s,rtl){const out=[];s=s.replace(/\[\[([^\]|#]+)(?:[#|][^\]]*)?\]\]/g,'$1').replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g,'$1 ($2)').replace(/==(?:[gbrp]\|)?([^=]+)==/g,'$1');
  s.split(/(\*\*[^*]+\*\*)/).forEach(p=>{if(!p)return;const b=/^\*\*[^*]+\*\*$/.test(p),tx=b?p.slice(2,-2):p;out.push(`<w:r><w:rPr>${b?'<w:b/><w:bCs/>':''}${rtl?'<w:rtl/>':''}</w:rPr><w:t xml:space="preserve">${docxEsc(tx)}</w:t></w:r>`)});return out.join('')}
function docxPara(line){const ar=/[؀-ۿ]/.test(line);let st='',pre='',m;
  if((m=line.match(/^(#{1,3})\s+(.*)$/))){st='Heading'+m[1].length;line=m[2]}else if((m=line.match(/^\s*[-*•]\s+\[([ xX])\]\s+(.*)$/))){pre=(m[1]===' '?'☐ ':'☑ ');line=m[2]}
  else if((m=line.match(/^\s*[-*•]\s+(.*)$/))){pre='• ';line=m[1]}else if((m=line.match(/^>\s?(.*)$/))){st='Quote';line=m[1]}
  return`<w:p><w:pPr>${st?`<w:pStyle w:val="${st}"/>`:''}${ar?'<w:bidi/><w:jc w:val="right"/>':''}</w:pPr>${docxRuns(pre+line,ar)}</w:p>`}
function docxMake(title,body){const enc=new TextEncoder(),lines=String(body||'').split('\n');
  const doc=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${docxPara('# '+(title||t('nwd.untitled')))}${lines.map(l=>/^\s*\|?\s*:?-{3,}/.test(l)?'':docxPara(l)).join('')}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" w:header="708" w:footer="708" w:gutter="0"/></w:sectPr></w:body></w:document>`;
  const sty=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Arial"/><w:sz w:val="24"/><w:szCs w:val="26"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="120" w:line="300" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>
<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style>${[1,2,3].map(n=>`<w:style w:type="paragraph" w:styleId="Heading${n}"><w:name w:val="heading ${n}"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:pPr><w:keepNext/><w:spacing w:before="240" w:after="120"/><w:outlineLvl w:val="${n-1}"/></w:pPr><w:rPr><w:b/><w:bCs/><w:sz w:val="${[36,30,26][n-1]}"/><w:szCs w:val="${[38,32,28][n-1]}"/></w:rPr></w:style>`).join('')}<w:style w:type="paragraph" w:styleId="Quote"><w:name w:val="Quote"/><w:basedOn w:val="Normal"/><w:pPr><w:ind w:left="567" w:right="567"/></w:pPr><w:rPr><w:i/><w:color w:val="555555"/></w:rPr></w:style></w:styles>`;
  const ct=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>`;
  const rels=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`;
  const drels=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`;
  return makeZip([{name:'[Content_Types].xml',data:enc.encode(ct)},{name:'_rels/.rels',data:enc.encode(rels)},{name:'word/document.xml',data:enc.encode(doc)},{name:'word/_rels/document.xml.rels',data:enc.encode(drels)},{name:'word/styles.xml',data:enc.encode(sty)}])}
async function nwdExport(){if(!NE)return;neRead();const n=NE,nm=(n.title||t('nwd.untitled')).replace(/[\\/:*?"<>|]+/g,'_').slice(0,80);await saveBytes(nm+'.docx','application/vnd.openxmlformats-officedocument.wordprocessingml.document',docxMake(n.title,n.body))}
/* 12th-56: copy for WhatsApp — *bold*, _italic_, ~strike~, headings in bold, links as «text (address)» */
function waText(title,body){let s=String(body||'').replace(/\r/g,'');
  s=s.replace(/^#{1,6}\s+(.+)$/gm,'\u0001$1\u0001').replace(/\*\*([^*\n]+)\*\*/g,'\u0001$1\u0001').replace(/\*([^*\n]+)\*/g,'_$1_').replace(/\u0001/g,'*').replace(/~~([^~\n]+)~~/g,'~$1~')
    .replace(/==(?:[gbrp]\|)?([^=\n]+)==/g,'$1').replace(/\[\[([^\]|#]+)(?:[#|][^\]]*)?\]\]/g,'$1').replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g,'$1 ($2)')
    .replace(/^\s*[-*]\s+\[ \]\s+/gm,'☐ ').replace(/^\s*[-*]\s+\[[xX]\]\s+/gm,'☑ ').replace(/^\s*[-*]\s+/gm,'• ').replace(/^>\s?/gm,'> ').replace(/\n{3,}/g,'\n\n').trim();
  return(title?`*${title.trim()}*\n\n`:'')+s}
function nwaCopy(){if(!NE)return;neRead();copyTxt(waText(NE.title,NE.body));toast(t('nwa.done'))}
{hookFn('nteMenu',()=>nteMenu,f=>{nteMenu=f},'post',function(){try{const p=$('#ppPop');if(!p||p.querySelector('[data-n12]'))return;const add=(ic,lab,fn)=>{const b=document.createElement('button');b.dataset.n12=1;b.innerHTML=`${ic} ${esc(lab)}`;b.onclick=e=>{e.stopPropagation();closePP();fn()};p.append(b)};
  add('📄',t('nwd.b'),nwdExport);add('💬',t('nwa.b'),nwaCopy)}catch(e){console.error(e)}})}

/* 12th-57: tag statistics — notes per tag and the last time each was used; a tap filters the notes by it */
function tgsOpen(){const M=new Map();NOTES().filter(n=>!n.arc).forEach(n=>{noteTags(n).forEach(tg=>{const o=M.get(tg)||{n:0,at:0};o.n++;o.at=Math.max(o.at,n.updated||n.created||0);M.set(tg,o)})});
  const L_=[...M.entries()].sort((a,b)=>b[1].n-a[1].n||b[1].at-a[1].at),mx=L_.length?L_[0][1].n:1,ago=ms=>{const d=Math.floor((Date.now()-ms)/864e5);return d<1?t('tgs.today'):t('tgs.ago',d)};
  openInfo('🏷 '+esc(t('tgs.t')),L_.length?`<small class="muted">${esc(t('tgs.sub',L_.length))}</small><div class="tgsl">${L_.map(([tg,o])=>`<button class="tgsr" data-tg="${esc(tg)}"><span dir="auto" class="ntag" data-tag="${esc(tg)}">#${esc(tg)}</span><i style="--w:${Math.round(o.n/mx*100)}%"></i><b>${o.n}</b><small>${esc(ago(o.at))}</small></button>`).join('')}</div>`:`<div class="empty">${esc(t('tgs.none'))}</div>`);
  $('#infoBox').classList.add('sdybox');$$('#infoBox [data-tg]').forEach(b=>b.onclick=()=>{$$('.modal.on').forEach(m=>m.classList.remove('on'));showView('boards');setTimeout(()=>{const s=$('#nSearch');if(s){s.value='#'+b.dataset.tg;s.dispatchEvent(new Event('input',{bubbles:true}))}},120)})}
{hookFn('renderNotes',()=>renderNotes,f=>{renderNotes=f},'post',function(){try{const b=$('#tgcB');if(!b||$('#tgsB'))return;b.insertAdjacentHTML('afterend',`<button class="btn sm ghost" id="tgsB">📊 ${esc(t('tgs.b'))}</button>`);$('#tgsB').onclick=tgsOpen}catch(e){}})}

/* 12th-58: notes written or edited on a day, in the calendar day panel */
function dayNotes(k){return NOTES().filter(n=>!n.arc&&!(n.lock&&!notesUnlocked())&&(n.day===k||(n.created&&dKey(new Date(n.created))===k)||(n.updated&&dKey(new Date(n.updated))===k))).sort((a,b)=>(b.updated||0)-(a.updated||0)).slice(0,12)}
{hookFn('renderDetail',()=>renderDetail,f=>{renderDetail=f},'post',function(k){try{k=k||selKey;const box=$('#detail');if(!box||!k)return;box.querySelector('.dnts')?.remove();const L_=dayNotes(k);if(!L_.length)return;
  box.insertAdjacentHTML('beforeend',`<div class="dnts"><h4>📝 ${esc(t('dnt.t'))} <small>${L_.length}</small></h4>${L_.map(n=>`<button class="dntr" data-dnt="${n.id}"><b dir="auto">${esc(n.title||mdPlain(n.body||'').slice(0,50)||t('nwd.untitled'))}</b><small dir="auto">${esc(mdPlain(n.body||'').replace(/\s+/g,' ').slice(0,90))}</small></button>`).join('')}</div>`);
  box.querySelectorAll('[data-dnt]').forEach(b=>b.onclick=()=>openNote(b.dataset.dnt))}catch(e){console.error(e)}})}
{const _cc=cmdCommands;cmdCommands=function(){const c=(icon,label,run,kw)=>({icon,label,run,kw:kw||''});return _cc().concat([c('📊',t('tgs.t'),tgsOpen,'tags stats إحصاء الوسوم')])}}

