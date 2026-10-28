/* ============ v3.138.0: Notion list A — the reading view shows quotes, #### and ---; code blocks, foldable lists, pictures in the text, move a paragraph, «turn into», text colours ============ */
/* Blocks are swapped for placeholder lines before the older renderer runs (as the tables of 3.88 are), so the line numbers its checkboxes rely on stay right.
   Syntax kept plain Markdown where one exists: ``` code ```, > quote, ---, ####, ![](url); Thabat's own: «▸ title» + indented lines = a foldable list,
   ![[img:<id>]] = one of the note's pictures in place, {{r|text}} = coloured text, «{{bg:r}} » at the start of a line = a coloured line (r o y g b p k). */
const NCOLS=['r','o','y','g','b','p','k'];
function nimgTag(id){return`<img class="nimgin" data-nimg="${esc(id)}" alt="">`}
{const _m=mdLite;mdLite=function(src,...a){const L_=String(src||'').split('\n'),B=[];
  const put=(i,j,html)=>{B.push(html);L_[i]='⟦NBX'+(B.length-1)+'⟧';for(let k=i+1;k<=j;k++)L_[k]='⟦NBX-⟧'};
  const sub=(lines,off)=>{const s=lines.join('\n');if(!s.trim())return'';return mdLite(s).replace(/data-(ln|l|l2)="(\d+)"/g,(q,k,n)=>`data-${k}="${+n+off}"`)};
  for(let i=0;i<L_.length;i++){const l=L_[i];let m;
    if(m=l.match(/^\s*```\s*([\w+#.-]*)\s*$/)){let j=i+1;while(j<L_.length&&!/^\s*```\s*$/.test(L_[j]))j++;const e=Math.min(j,L_.length-1);
      put(i,e,`<div class="ncode" data-l="${i}" data-l2="${e}">${m[1]?`<span class="ncdl">${esc(m[1])}</span>`:''}<button type="button" class="ncopy" data-ncopy>${esc(t('ncb.copy'))}</button><pre dir="ltr"><code>${esc(L_.slice(i+1,j).join('\n'))}</code></pre></div>`);i=e;continue}
    if(m=l.match(/^▸\s?(.*)$/)){let j=i+1;while(j<L_.length&&(/^(\t| {2,})\S/.test(L_[j])||(!L_[j].trim()&&j+1<L_.length&&/^(\t| {2,})\S/.test(L_[j+1]))))j++;
      const inner=sub(L_.slice(i+1,j).map(x=>x.replace(/^(\t| {2})/,'')),i+1);
      put(i,j-1,`<details class="ntgl" data-l="${i}" data-l2="${j-1}"><summary>${mdInline(esc(m[1]||''))}</summary><div class="ntglb">${inner||`<small class="muted">${esc(t('ntv.empty'))}</small>`}</div></details>`);i=j-1;continue}
    if(/^\s*>/.test(l)){let j=i;while(j<L_.length&&/^\s*>/.test(L_[j]))j++;
      put(i,j-1,`<blockquote class="nq" dir="auto" data-l="${i}" data-l2="${j-1}">${L_.slice(i,j).map(x=>mdInline(esc(x.replace(/^\s*>\s?/,'').replace(/^\[!\w+\][+-]?\s*/,'')))).join('<br>')}</blockquote>`);i=j-1;continue}
    if(/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(l)){put(i,i,`<hr class="nhr" data-l="${i}">`);continue}
    if(m=l.match(/^####\s+(.*)$/)){put(i,i,`<div class="nh4" data-l="${i}">${mdInline(esc(m[1]))}</div>`);continue}
    if(m=l.match(/^\s*!\[\[img:([\w-]{1,40})\]\]\s*$/)){put(i,i,`<div class="nimgw" data-l="${i}">${nimgTag(m[1])}</div>`);continue}
    if(m=l.match(/^\s*!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)\s*$/)){put(i,i,`<div class="nimgw" data-l="${i}"><img class="nimgin" src="${esc(m[2])}" alt="${esc(m[1])}" loading="lazy" referrerpolicy="no-referrer"></div>`);continue}
    if(m=l.match(/^\{\{bg:([roygbpk])\}\}\s?(.*)$/)){put(i,i,`<div class="nbg nbg-${m[1]}" data-l="${i}">${sub([m[2]],i)||'&nbsp;'}</div>`);continue}}
  if(!B.length)return _m(src,...a);
  return _m(L_.join('\n'),...a).replace(/<div[^>]*>⟦NBX-⟧<\/div>/g,'').replace(/<div[^>]*>⟦NBX(\d+)⟧<\/div>/g,(q,n)=>B[+n])}}
{const _i=mdInline;mdInline=function(x,...a){let h=_i(x,...a);
  return h.replace(/~~([^~]+)~~/g,'<s>$1</s>').replace(/(^|[\s(>])\*([^*\s](?:[^*]*[^*\s])?)\*(?=[\s).,،!?<]|$)/g,'$1<i>$2</i>')
    .replace(/\{\{([roygbpk])\|([^}]+)\}\}/g,'<span class="ntc ntc-$1">$2</span>')}}
{const _p=mdPlain;mdPlain=function(b,...a){const s=String(b||'').split('\n').filter(l=>!/^\s*```/.test(l)&&!/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(l)&&!/^\s*!\[\[img:[\w-]+\]\]\s*$/.test(l))
  .map(l=>l.replace(/^\{\{bg:[roygbpk]\}\}\s?/,'').replace(/^▸\s?/,'').replace(/^\s*>\s?/,'').replace(/^####\s+/,'').replace(/^\s*!\[([^\]]*)\]\([^)]*\)\s*$/,'$1')
    .replace(/\{\{[roygbpk]\|([^}]+)\}\}/g,'$1').replace(/~~([^~]+)~~/g,'$1')).join('\n');return _p(s,...a)}}

/* copy a code block */
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-ncopy]');if(!b)return;e.preventDefault();e.stopPropagation();const c=b.parentElement.querySelector('code');if(!c)return;
  const done=()=>{b.textContent=t('ncb.done');setTimeout(()=>{b.textContent=t('ncb.copy')},1400)};try{navigator.clipboard.writeText(c.textContent).then(done,()=>{toast(t('ncb.fail'))})}catch(x){}},true);

/* 4: pictures inside the text — «ضعها في النص» on each picture of the editor, and pictures added while the cursor is in the text go where it is */
const NIM={pos:null,pend:null};
async function nimgFill(root){if(!root)return;for(const img of root.querySelectorAll('img[data-nimg]:not([src])')){const id=img.dataset.nimg;try{const d=await nImg(id);if(d)img.src=d;else img.replaceWith(Object.assign(document.createElement('small'),{className:'muted',textContent:t('nim.miss')}))}catch(e){}}}
function nimIns(ids,at){const ta=$('#neBody');if(!ta||!NE||!ids.length)return;const v=ta.value;let p=at==null?ta.selectionStart:at;p=Math.max(0,Math.min(v.length,p));
  const ls=v.lastIndexOf('\n',p-1)+1,le=v.indexOf('\n',p),lineEnd=le<0?v.length:le,blank=!v.slice(ls,lineEnd).trim();
  const ins=ids.map(id=>'![[img:'+id+']]').join('\n');ta.focus();if(blank)ta.setSelectionRange(ls,lineEnd);else ta.setSelectionRange(lineEnd,lineEnd);
  document.execCommand('insertText',false,(blank?'':'\n')+ins+(blank?'':'\n'));ta.dispatchEvent(new Event('input',{bubbles:true}))}
document.addEventListener('focusout',e=>{if(e.target&&e.target.id==='neBody')NIM.pos=e.target.selectionStart},true);
document.addEventListener('change',e=>{if(e.target&&e.target.id==='neFile'&&NE&&!NE._view&&NIM.pend!=null){NIM.at=NIM.pend;NIM.before=(NE.imgs||[]).slice()}},true);
{hookFn('renderNoteEd',()=>renderNoteEd,f=>{renderNoteEd=f},'post',function(){try{
  if(NIM.at!=null&&NE&&NIM.before){const nw=(NE.imgs||[]).filter(id=>!NIM.before.includes(id));if(nw.length){const at=NIM.at;NIM.at=null;NIM.before=null;NIM.pend=null;setTimeout(()=>nimIns(nw,at),30)}}
  const used=new Set((String((NE&&NE.body)||'').match(/!\[\[img:([\w-]+)\]\]/g)||[]).map(x=>x.slice(7,-2)));
  $$('#neImgs .neimg').forEach(el=>{const id=(NE.imgs||[])[+el.dataset.i];if(!id||el.querySelector('.nimb'))return;const act=el.querySelector('.neact');if(!act)return;
    const b=document.createElement('button');b.type='button';b.className='nimb';b.title=t(used.has(id)?'nim.inT':'nim.in');b.textContent=used.has(id)?'✓':'↳';b.onclick=e=>{e.preventDefault();e.stopPropagation();if(used.has(id)){toast(t('nim.inT'));return}nimIns([id],NIM.pos)};act.prepend(b)})}catch(e){console.error(e)}})}
{hookFn('neShowMode',()=>neShowMode,f=>{neShowMode=f},'post',function(){try{const pv=$('#nePrev');if(!pv||pv.hidden)return;nimgFill(pv);
  pv.querySelectorAll('img[data-nimg]').forEach(img=>img.onclick=()=>{const i=(NE.imgs||[]).indexOf(img.dataset.nimg);if(i>=0)lbOpen(NE.imgs.slice(),i,NE.title)});ndhBind(pv)}catch(e){console.error(e)}})}

/* 7: move a paragraph — Alt+↑/↓ in the editor moves the lines under the cursor; in the reading view a ⠿ handle drags a block (a line, a list item, a quote, a code block, a foldable list) */
function nMoveLines(a,b,to){if(!NE)return false;const ta=$('#neBody');const L_=(ta?ta.value:NE.body).split('\n');if(a<0||b>=L_.length||to>=a&&to<=b+1)return false;
  const blk=L_.splice(a,b-a+1);const t2=to>b?to-blk.length:to;L_.splice(t2,0,...blk);NE.body=L_.join('\n');if(ta)ta.value=NE.body;return t2}
document.addEventListener('keydown',e=>{const ta=e.target;if(!ta||ta.id!=='neBody'||!e.altKey||e.ctrlKey||e.metaKey||(e.key!=='ArrowUp'&&e.key!=='ArrowDown'))return;e.preventDefault();
  const v=ta.value,s=ta.selectionStart,en=ta.selectionEnd,a=v.slice(0,s).split('\n').length-1,b=v.slice(0,Math.max(s,en-(en>s&&v[en-1]==='\n'?1:0))).split('\n').length-1,L_=v.split('\n');
  const up=e.key==='ArrowUp';if(up&&a===0||!up&&b>=L_.length-1)return;const st=s-(v.lastIndexOf('\n',s-1)+1);
  const t2=nMoveLines(a,b,up?a-1:b+2);if(t2===false)return;const nv=ta.value.split('\n');let off=0;for(let k=0;k<t2;k++)off+=nv[k].length+1;let endOff=off;for(let k=t2;k<=t2+(b-a);k++)endOff+=nv[k].length+(k<t2+(b-a)?1:0);
  ta.setSelectionRange(off+Math.min(st,nv[t2].length),s===en?off+Math.min(st,nv[t2].length):endOff);ta.dispatchEvent(new Event('input',{bubbles:true}))},true);
function ndhBind(pv){const blocks=[...pv.querySelectorAll('[data-l]')].filter(el=>!el.parentElement.closest('.ncode')&&el.tagName!=='INPUT');
  blocks.forEach(el=>{if(el.querySelector(':scope>.ndh'))return;const h=document.createElement('span');h.className='ndh';h.textContent='⠿';h.title=t('ndh.t');h.setAttribute('aria-hidden','true');el.prepend(h);
    h.onpointerdown=e=>{e.preventDefault();e.stopPropagation();const a=+el.dataset.l,b=+(el.dataset.l2||el.dataset.l);let line=null,to=null;el.classList.add('ndhsrc');h.setPointerCapture(e.pointerId);
      const mv=ev=>{const z=uiZoom()||1,tg=document.elementFromPoint(ev.clientX,ev.clientY),bl=tg&&tg.closest&&tg.closest('#nePrev [data-l]');if(!bl||bl===el||el.contains(bl))return;const r=bl.getBoundingClientRect(),below=ev.clientY>r.top+r.height/2;
        to=below?+(bl.dataset.l2||bl.dataset.l)+1:+bl.dataset.l;if(!line){line=document.createElement('div');line.className='ndhline';document.body.append(line)}const pr=pv.getBoundingClientRect();line.style.cssText=`top:${(below?r.bottom:r.top)/z-1}px;left:${pr.left/z}px;width:${pr.width/z}px`};
      const up=()=>{h.removeEventListener('pointermove',mv);h.removeEventListener('pointerup',up);h.removeEventListener('pointercancel',up);el.classList.remove('ndhsrc');if(line)line.remove();
        if(to!=null&&nMoveLines(a,b,to)!==false)neShowMode()};
      h.addEventListener('pointermove',mv);h.addEventListener('pointerup',up);h.addEventListener('pointercancel',up)}})}

/* 8: «turn into» — the lines under the cursor become text, a heading, a list, a task, a quote, a foldable list or a code block */
const NTV=[['p',''],['h1','# '],['h2','## '],['h3','### '],['ul','- '],['ol','1. '],['todo','- [ ] '],['q','> '],['tgl','▸ '],['code',null]];
function ntvStrip(l){return l.replace(/^\{\{bg:[roygbpk]\}\}\s?/,'').replace(/^(#{1,4}\s+|\s*[-*•]\s+\[[ xX]\]\s?|\s*[-*•]\s+|\s*\d+[.)]\s+|\s*>\s?|▸\s?)/,'')}
function ntvApply(k){const ta=$('#neBody');if(!ta)return;const v=ta.value,s=ta.selectionStart,en=ta.selectionEnd,ls=v.lastIndexOf('\n',s-1)+1;let le=v.indexOf('\n',Math.max(s,en-(en>s&&v[en-1]==='\n'?1:0)));if(le<0)le=v.length;
  const lines=v.slice(ls,le).split('\n'),row=NTV.find(x=>x[0]===k);let out;
  if(k==='code')out='```\n'+lines.join('\n')+'\n```';else if(k==='ol')out=lines.map((l,i)=>(i+1)+'. '+ntvStrip(l)).join('\n');else if(k==='tgl')out='▸ '+ntvStrip(lines[0])+(lines.length>1?'\n'+lines.slice(1).map(l=>'  '+l).join('\n'):'');else out=lines.map(l=>row[1]+ntvStrip(l)).join('\n');
  ta.focus();ta.setSelectionRange(ls,le);document.execCommand('insertText',false,out);ta.dispatchEvent(new Event('input',{bubbles:true}))}
function ntvOpen(btn){const r=btn.getBoundingClientRect(),z=uiZoom()||1;const p=qPopAt(`<div class="aymh">${esc(t('ntv.t'))}</div>${NTV.map(([k])=>`<button data-k="${k}">${esc(t('ntv.'+k))}</button>`).join('')}`,r.left+r.width/2,r.bottom+4,'aymenu');
  p.querySelectorAll('[data-k]').forEach(b=>b.onmousedown=e=>{e.preventDefault();closePP();ntvApply(b.dataset.k)})}
/* 9: colours — text colour and line background from the selection bar */
function ncolOpen(btn){const r=btn.getBoundingClientRect(),z=uiZoom()||1;const sw=(k,bg)=>`<button type="button" class="ncsw ${bg?'nbg nbg-'+k:'ntc ntc-'+k}" data-c="${bg?'bg:':''}${k}" title="${esc(t('ncl2.'+k))}">${bg?'':'A'}</button>`;
  const p=qPopAt(`<div class="aymh">${esc(t('fm.col'))}</div><div class="ncswr"><small>${esc(t('ncl2.tx'))}</small>${NCOLS.map(k=>sw(k,0)).join('')}</div><div class="ncswr"><small>${esc(t('ncl2.bg'))}</small>${NCOLS.map(k=>sw(k,1)).join('')}</div><button data-c="x">${esc(t('ncl2.clear'))}</button>`,r.left+r.width/2,r.bottom+4,'aymenu ncolm');
  p.querySelectorAll('[data-c]').forEach(b=>b.onmousedown=e=>{e.preventDefault();closePP();const ta=$('#neBody');if(!ta)return;const v=ta.value,s=ta.selectionStart,en=ta.selectionEnd,c=b.dataset.c;let a=s,z2=en,out;
    if(c==='x'){a=v.lastIndexOf('\n',s-1)+1;z2=v.indexOf('\n',Math.max(s,en-1));if(z2<0)z2=v.length;out=v.slice(a,z2).replace(/^\{\{bg:[roygbpk]\}\}\s?/gm,'').replace(/\{\{[roygbpk]\|([^}]+)\}\}/g,'$1')}
    else if(c.startsWith('bg:')){a=v.lastIndexOf('\n',s-1)+1;z2=v.indexOf('\n',Math.max(s,en-1));if(z2<0)z2=v.length;out=v.slice(a,z2).split('\n').map(l=>'{{'+c+'}} '+l.replace(/^\{\{bg:[roygbpk]\}\}\s?/,'')).join('\n')}
    else{if(en<=s)return;out='{{'+c+'|'+v.slice(s,en).replace(/\n/g,' ')+'}}'}
    ta.focus();ta.setSelectionRange(a,z2);document.execCommand('insertText',false,out);ta.dispatchEvent(new Event('input',{bubbles:true}))})}
FMT.push(['s','~~','~~','S']);
{hookFn('fmtBar',()=>fmtBar,f=>{fmtBar=f},'post',function(){try{const bar=$('#fmtBar');if(!bar||bar.querySelector('[data-ncol]'))return;const b=document.createElement('button');b.type='button';b.dataset.ncol=1;b.title=t('fm.col');b.innerHTML='<span class="ncoli"></span>';
  b.onmousedown=e=>{e.preventDefault();ncolOpen(b);bar.remove()};bar.append(b);const tb=document.createElement('button');tb.type='button';tb.dataset.ntv=1;tb.title=t('ntv.t');tb.textContent='⇄';tb.onmousedown=e=>{e.preventDefault();ntvOpen(tb);bar.remove()};bar.append(tb)}catch(e){console.error(e)}})}
/* the editor's toolbar gets «⇄ حوّل إلى» too (works on the line under the cursor, no selection needed) */
{hookFn('renderNoteEd',()=>renderNoteEd,f=>{renderNoteEd=f},'post',function(){try{const tb=$('.netb');if(!tb||$('#ntvB'))return;const b=document.createElement('button');b.type='button';b.className='btn sm ghost';b.id='ntvB';b.title=t('ntv.t');b.setAttribute('aria-label',t('ntv.t'));b.textContent='⇄';b.dataset.md=1;
  b.onmousedown=e=>e.preventDefault();b.onclick=()=>ntvOpen(b);tb.append(b)}catch(e){console.error(e)}})}
/* «/» menu: code block, foldable list, a picture here */
SLASH.splice(SLASH.findIndex(x=>x[0]==='hr')+1,0,['code','```\n\n```'],['tgl','▸ '],['img',()=>{const ta=$('#neBody');NIM.pend=ta?ta.selectionStart:null;setTimeout(()=>{const f=$('#neFile');if(f)f.click()},30);return''}]);

/* his pick «ب» (2026-10-29): on a wide PC the hifz map leaves the side column and sits under the mushaf at full width, so no empty space is left under the mushaf */
const QMP={home:null};
function qmapPlace(){const mp=$('#qMap'),w=$('#v-quran .qwrap');if(!mp||!w)return;const wide=!MOB.matches&&innerWidth/(uiZoom()||1)>=1000&&!document.documentElement.classList.contains('qfs');
  if(wide){if(mp.parentElement!==w){QMP.home={p:mp.parentElement,n:mp.nextElementSibling};w.append(mp);mp.classList.add('qmapw')}}
  else if(QMP.home&&mp.parentElement===w){const h=QMP.home;h.p.insertBefore(mp,h.n&&h.n.parentElement===h.p?h.n:null);mp.classList.remove('qmapw')}}
{hookFn('renderQuran',()=>renderQuran,f=>{renderQuran=f},'post',function(){try{qmapPlace()}catch(e){console.error(e)}})}
addEventListener('resize',()=>{clearTimeout(QMP.t);QMP.t=setTimeout(()=>{try{qmapPlace()}catch(e){}},200)});

/* pictures for «what's new» (3.137 WNP) */
WNP['3.138.0']=[{k:'wnp.blk',f:()=>`<div class="nb" dir="auto" style="font-size:11.5px;line-height:1.5">${mdLite(t('wnp.blkSrc'))}</div>`},
  {k:'wnp.qmp',f:()=>MOB.matches?'':`<svg viewBox="0 0 220 130" width="100%" aria-hidden="true"><rect x="70" y="6" width="144" height="74" rx="5" fill="color-mix(in srgb,var(--accent) 22%,transparent)" stroke="var(--accent)"/><rect x="6" y="6" width="56" height="74" rx="5" fill="none" stroke="var(--line)"/><rect x="6" y="88" width="208" height="36" rx="5" fill="none" stroke="var(--muted)"/></svg>`}];

