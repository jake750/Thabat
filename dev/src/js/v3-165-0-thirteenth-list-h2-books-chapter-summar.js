/* ============ v3.165.0 thirteenth list H2: books — chapter summaries, every highlight with its text, export to a note, a year of pages, finished this year, rating on finishing, search history, notes marked on their pages, bottom crop, the last page per device ============ */
const BH2={kind:()=>(MOB.matches||ANDROID)?'ph':'pc',nm:null};
function bh2R(key){const st=BKS();return st[key||BK.key]||(st[key||BK.key]={})}
function bh2Title(key){const r=BKS()[key]||{},b=bkAll().find(x=>x.key===key);return String((key===BK.key&&BK.title)||r.t||(b&&b.n)||key).replace(/\.pdf$/i,'')}
/* 184: a summary for each chapter, in the outline window */
{const _o=bkxOutline;bkxOutline=async function(...a){const r=await _o(...a);try{bh2OlPaint()}catch(e){console.error(e)}return r}}
function bh2OlPaint(){const p=$('#bkPanel');if(!p)return;const R=bh2R(),C=R.chs||{};p.querySelectorAll('.bkoli[data-oi]').forEach(b=>{const i=b.dataset.oi;if(b.parentElement.classList.contains('bh2ow'))return;const w=document.createElement('div');w.className='bh2ow';b.before(w);w.append(b);
  w.insertAdjacentHTML('beforeend',`<button class="bh2oe" data-bh2e="${i}" title="${esc(t('bh2.chsE'))}" aria-label="${esc(t('bh2.chsE'))}">✎</button>${C[i]?`<p class="bh2os" dir="auto">${esc(C[i])}</p>`:''}`)});
  p.querySelectorAll('[data-bh2e]').forEach(b=>b.onclick=e=>{e.stopPropagation();const i=b.dataset.bh2e,R2=bh2R(),cur=(R2.chs||{})[i]||'';const tl=(b.previousElementSibling&&b.previousElementSibling.firstChild&&b.previousElementSibling.firstChild.textContent)||'';
    const v=prompt(t('bh2.chsAsk',tl),cur);if(v===null)return;R2.chs=R2.chs||{};if(v.trim())R2.chs[i]=v.trim().slice(0,1200);else delete R2.chs[i];save();const w=b.parentElement,old=w.querySelector('.bh2os');if(old)old.remove();if(R2.chs[i])w.insertAdjacentHTML('beforeend',`<p class="bh2os" dir="auto">${esc(R2.chs[i])}</p>`)})}
/* 185: the text under each highlight, from the page's text layer (or its OCR) */
const BH2TC={};
function bh2Mul(m,n){return[m[0]*n[0]+m[2]*n[1],m[1]*n[0]+m[3]*n[1],m[0]*n[2]+m[2]*n[3],m[1]*n[2]+m[3]*n[3],m[0]*n[4]+m[2]*n[5]+m[4],m[1]*n[4]+m[3]*n[5]+m[5]]}
async function bh2HlText(n,box){if(!BK.doc)return'';const k=BK.key+':'+n;let T=BH2TC[k];if(!T){try{const pg=await BK.doc.getPage(n),vp=pg.getViewport({scale:1}),tc=await pg.getTextContent();T={w:vp.width,h:vp.height,it:tc.items.filter(i=>i.str&&i.str.trim()&&i.transform).map(i=>{const tr=bh2Mul(vp.transform,i.transform),fh=Math.hypot(tr[2],tr[3])||10,x=tr[4],y=tr[5]-fh*.8,w=i.width*vp.scale||fh*i.str.length*.5;return{s:i.str,x:x/vp.width,y:y/vp.height,w:w/vp.width,h:fh/vp.height}})};BH2TC[k]=T}catch(e){T={it:[]};BH2TC[k]=T}}
  const [bx,by,bw,bh]=box,hit=T.it.filter(i=>{const cx=i.x+i.w/2,cy=i.y+i.h/2;return cy>=by-.004&&cy<=by+bh+.004&&i.x+i.w>bx&&i.x<bx+bw&&(cx>=bx-.02&&cx<=bx+bw+.02||i.w>bw)});
  if(!hit.length)return'';const lines=[];hit.sort((a,b)=>a.y-b.y).forEach(i=>{const l=lines.find(L_=>Math.abs(L_.y-i.y)<i.h*.5);if(l)l.a.push(i);else lines.push({y:i.y,a:[i]})});
  const rtl=BK.dir==='rtl';return lines.map(l=>l.a.sort((a,b)=>rtl?b.x-a.x:a.x-b.x).map(i=>i.s).join(' ').replace(/\s+/g,' ').trim()).join(' ').normalize('NFKC').trim()}
async function bh2HlAll(){const r=bh2R(),out=[];const pages=Object.keys(r.hl||{}).map(Number).sort((a,b)=>a-b);for(const n of pages){for(const [i,box] of (r.hl[n]||[]).entries()){out.push({n,i,c:box[4]||0,tx:await bh2HlText(n,box)})}}return out}
async function bh2HlOpen(){const p=$('#bkPanel');if(!p)return;p.innerHTML=`<div class="bkph"><b>🖍 ${t('bh2.hlT')}</b><button class="btn sm ghost" id="bkPx">✕</button></div><p class="muted" style="padding:8px">${t('bh2.reading')}</p>`;p.hidden=false;$('#bkPx').onclick=()=>p.hidden=true;
  const L_=await bh2HlAll(),r=bh2R(),nts=Object.keys(r.nt||{}).length;if(p.hidden)return;
  p.innerHTML=`<div class="bkph"><b>🖍 ${t('bh2.hlT')} (${L_.length})</b><button class="btn sm ghost" id="bkPx">✕</button></div>${L_.length||nts?`<button class="bkpi bh2exp" id="bh2Exp">📝 ${t('bh2.exp')}</button>`:''}
    ${L_.length?`<div class="bh2hl">${L_.map(x=>`<button class="bkpi bh2hi hc${x.c}" data-go="${x.n}"><b>${t('q.pageS')}${x.n}</b><small dir="auto">${x.tx?esc(x.tx.slice(0,300)):`<i>${t('bh2.noTx')}</i>`}</small></button>`).join('')}</div>`:`<p class="muted" style="padding:8px">${t('bh2.hl0')}</p>`}`;
  $('#bkPx').onclick=()=>p.hidden=true;p.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>{bkGoPage(+b.dataset.go);if(MOB.matches)p.hidden=true});const e=$('#bh2Exp');if(e)e.onclick=()=>bh2Export(L_)}
/* 186: highlights and page notes into one note, ordered by page; exporting again updates the same note */
async function bh2Export(L_){L_=L_||await bh2HlAll();const key=BK.key,r=bh2R(),tl=bh2Title(key),pages=[...new Set([...L_.map(x=>x.n),...Object.keys(r.nt||{}).map(Number)])].sort((a,b)=>a-b);
  if(!pages.length){toast(t('bh2.hl0'));return}
  let body=`[📖 ${tl}](thabat-book:${key}#1)\n`;pages.forEach(n=>{body+=`\n## ${t('bh2.pg',n)}\n[↗ ${t('bh2.open')}](thabat-book:${key}#${n})\n`;L_.filter(x=>x.n===n).forEach(x=>{body+=x.tx?`> ${x.tx}\n`:`> ${t('bh2.noTx')}\n`});if(r.nt&&r.nt[n])body+=`\n${r.nt[n]}\n`});
  let n=NOTES().find(z=>z.bkx===key&&!z.arc);const now=Date.now();if(n){n.body=body;n.updated=now}else{n={id:uid(),title:t('bh2.nTitle',tl),body,created:now,updated:now,day:todayKey(),bkx:key};NOTES().unshift(n)}
  save();if(typeof notesChanged==='function')try{notesChanged()}catch(e){}toastAct(t('bh2.expd',pages.length),t('bh2.openN'),()=>{try{bkClose()}catch(e){}showView('boards');setTimeout(()=>openNote(n.id),80)})}
/* 189: pages read each day (day.bkpg, every book) in a year map */
function bh2N(k){const d=S.days[k];if(!d||!d.bkpg)return 0;return Object.values(d.bkpg).reduce((s,a)=>s+(a?a.length:0),0)}
function bh2Lv(n){return!n?0:n<5?1:n<15?2:n<30?3:4}
function bh2YearOpen(end){const today=logicalDate(Date.now());end=end||today;if(end>today)end=today;const start=addDays(end,-364-end.getDay()),cells=[],months=[];let tot=0,days=0,best=0,run=0,lastM=-1;
  for(let d=new Date(start),i=0;d<=end;d=addDays(d,1),i++){const k=dKey(d),n=bh2N(k);tot+=n;if(n){days++;run++;if(run>best)best=run}else run=0;if(d.getDate()<=7&&d.getDay()===0&&d.getMonth()!==lastM){lastM=d.getMonth();months.push([Math.floor(i/7),L().months[d.getMonth()]])}
    cells.push(`<i class="l${bh2Lv(n)}" title="${esc(gStr(d)+' · '+t('bh2.pages',n))}"></i>`)}
  const cols=Math.ceil(cells.length/7),canNext=dKey(end)!==dKey(today);
  openInfo('📅 '+esc(t('bh2.yrT')),`<div class="qygnav"><button class="btn sm ghost" data-bh2y="-1" aria-label="${esc(t('qyg.prev'))}">‹</button><b>${gShort(start)} ${start.getFullYear()} – ${gShort(end)} ${end.getFullYear()}</b><button class="btn sm ghost" data-bh2y="1" aria-label="${esc(t('qyg.next'))}"${canNext?'':' disabled'}>›</button></div>
    <div class="qygst"><span><b>${tot}</b>${esc(t('bh2.sPages'))}</span><span><b>${days}</b>${esc(t('qyg.sDays'))}</span><span><b>${best}</b>${esc(t('qyg.sBest'))}</span><span><b>${days?Math.round(tot/days):0}</b>${esc(t('bh2.sAvg'))}</span></div>
    <div class="qygsc"><div class="qygm" style="--c:${cols}">${months.map(([c,n])=>`<span style="grid-column:${c+1}">${esc(n)}</span>`).join('')}</div><div class="qygg" style="--c:${cols}">${cells.join('')}</div></div>
    <div class="qyglg"><span>${esc(t('qyg.less'))}</span><i class="l0"></i><i class="l1"></i><i class="l2"></i><i class="l3"></i><i class="l4"></i><span>${esc(t('qyg.more'))}</span><small>${esc(t('bh2.lvl'))}</small></div>`);
  const box=$('#infoBox');box.classList.add('qygbox');const sc=box.querySelector('.qygsc');if(sc)sc.scrollLeft=document.documentElement.dir==='rtl'?-sc.scrollWidth:sc.scrollWidth;
  box.querySelectorAll('[data-bh2y]').forEach(b=>b.onclick=()=>bh2YearOpen(addDays(end,365*+b.dataset.bh2y)))}
/* 190: finished this year, with covers */
function bh2Year(){const y=new Date().getFullYear(),st=BKS();return bkAll().filter(b=>{const r=st[b.key];return r&&r.done&&new Date(r.done).getFullYear()===y}).sort((a,b)=>st[b.key].done-st[a.key].done)}
function bh2Stars(n){return n?'★'.repeat(n)+'☆'.repeat(5-n):''}
{hookFn('renderLib',()=>renderLib,f=>{renderLib=f},'post',function(){try{if(LIB.open)return;const fs=$('#libBox .bk2fs');if(!fs)return;
  if(!fs.querySelector('#bh2YrB')){fs.insertAdjacentHTML('beforeend',`<button class="chip" id="bh2YrB" title="${esc(t('bh2.yrT'))}">📅 ${t('bh2.yrB')}</button>`);$('#bh2YrB').onclick=()=>bh2YearOpen()}
  const Y=bh2Year();if(Y.length&&!$('#bh2Fin')){fs.insertAdjacentHTML('beforebegin',`<div id="bh2Fin" class="bh2fin"><h4 class="lbfh">🏁 ${t('bh2.finT',Y.length,new Date().getFullYear())}</h4><div class="bh2fr">${Y.map(b=>{const r=BKS()[b.key];return`<button class="bh2fb" data-bh2b="${esc(b.key)}" title="${esc(bh2Title(b.key))}"><span class="bh2fc" data-bh2c="${esc(b.key)}"><b dir="auto">${esc(bh2Title(b.key).slice(0,40))}</b></span><small>${r.rate?`<span class="bh2st">${bh2Stars(r.rate)}</span>`:esc(gShort(new Date(r.done)))}</small></button>`}).join('')}</div></div>`);
    $$('#bh2Fin [data-bh2c]').forEach(async c=>{const u=await bkCovGet(c.dataset.bh2c);if(u)c.insertAdjacentHTML('afterbegin',`<img src="${u}" alt="">`)});
    $$('#bh2Fin [data-bh2b]').forEach(b=>b.onclick=()=>{const bk=bkAll().find(z=>z.key===b.dataset.bh2b);if(bk)bh2RateOpen(bk.key,true);})}
  /* stars on cards */
  $$('#libBox [data-book]').forEach(c=>{const r=BKS()[c.dataset.book];if(r&&r.rate&&!c.querySelector('.bh2st')){const b=c.querySelector('b');if(b)b.insertAdjacentHTML('afterend',`<span class="bh2st bh2cs">${bh2Stars(r.rate)}</span>`)}})}catch(e){console.error(e)}})}
/* 191: a rating and a review when a book is finished (and from the book «⋯») */
function bh2RateOpen(key,view){const r=bh2R(key);let st=r.rate||0;openInfo('🏁 '+esc(bh2Title(key)),`<p class="crsub">${r.done?t('bh2.finOn',esc(gShort(new Date(r.done))+' '+new Date(r.done).getFullYear())):''}</p><div class="bh2rs" role="radiogroup" aria-label="${esc(t('bh2.rate'))}">${[1,2,3,4,5].map(i=>`<button class="bh2r${i<=st?' on':''}" data-bh2r="${i}" aria-label="${i}">★</button>`).join('')}</div><textarea class="in" id="bh2Rv" rows="4" dir="auto" style="width:100%;box-sizing:border-box" placeholder="${esc(t('bh2.revPh'))}">${esc(r.rev||'')}</textarea>${view?`<button class="btn sm" id="bh2Op" style="margin-top:8px">📖 ${t('bh2.openB')}</button>`:''}`);
  const paint=()=>$$('#infoBox [data-bh2r]').forEach(b=>b.classList.toggle('on',+b.dataset.bh2r<=st));$$('#infoBox [data-bh2r]').forEach(b=>b.onclick=()=>{st=+b.dataset.bh2r===st?0:+b.dataset.bh2r;paint()});
  const op=$('#bh2Op');if(op)op.onclick=()=>{$('#infoModal').classList.remove('on');const bk=bkAll().find(z=>z.key===key);if(bk)bkOpen(bk)};
  const ok=$('#infoX');ok.textContent=t('pdl.save');ok.onclick=()=>{const v=$('#bh2Rv').value.trim();if(st)r.rate=st;else delete r.rate;if(v)r.rev=v.slice(0,3000);else delete r.rev;save();$('#infoModal').classList.remove('on');if(curView()==='lib'&&!BK.doc)renderLib();toast(t('bh2.saved'))}}
{const _d=bkSetDone;bkSetDone=function(key,on,...a){const r=_d(key,on,...a);try{if(on)setTimeout(()=>bh2RateOpen(key),350)}catch(e){}return r}}
{const _m=bkMenu;bkMenu=function(anchor,key,...a){const r=_m(anchor,key,...a);try{const p=$('#ppPop');if(p&&!p.querySelector('[data-bh2m]')){p.insertAdjacentHTML('beforeend',`<button data-bh2m="1">★ ${t('bh2.rateB')}</button>`);p.querySelector('[data-bh2m]').onclick=()=>{closePP();bh2RateOpen(key)}}}catch(e){}return r}}
/* 192: recent searches inside a book */
function bh2Sh(){const L_=LIBS();return L_.bkSh||(L_.bkSh=[])}
{const _s=bkxSearch;bkxSearch=async function(...a){const q=(($('#bkxQ')||{}).value||'').trim();if(q.length>=2){const H=bh2Sh(),i=H.indexOf(q);if(i>=0)H.splice(i,1);H.unshift(q);H.length=Math.min(H.length,8);save();bh2ShPaint()}return _s(...a)}}
{const _o=bkxOpen;bkxOpen=async function(...a){const r=await _o(...a);try{bh2ShPaint()}catch(e){}return r}}
function bh2ShPaint(){const res=$('#bkxRes');if(!res)return;let b=$('#bh2Sh');const H=bh2Sh();if(!H.length){if(b)b.remove();return}if(!b){res.insertAdjacentHTML('beforebegin','<div class="bh2sh" id="bh2Sh"></div>');b=$('#bh2Sh')}
  b.innerHTML=`<small>${t('bh2.recent')}</small>`+H.map((q,i)=>`<button class="chip" data-bh2q="${i}" dir="auto">${esc(q)}</button>`).join('')+`<button class="bh2shx" id="bh2ShX" title="${esc(t('bh2.shX'))}" aria-label="${esc(t('bh2.shX'))}">✕</button>`;
  b.querySelectorAll('[data-bh2q]').forEach(c=>c.onclick=()=>{$('#bkxQ').value=H[+c.dataset.bh2q];bkxSearch()});$('#bh2ShX').onclick=()=>{LIBS().bkSh=[];save();bh2ShPaint()}}
/* 193: notes that link to a page show a mark on that page; link a note from the reader */
function bh2NoteMap(){const key=BK.key,re=new RegExp('thabat-book:'+key.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'#(\\d+)','g'),M={};NOTES().forEach(n=>{if(n.arc||n.bkx===key)return;String(n.body||'').replace(re,(m,p)=>{p=+p;(M[p]=M[p]||[]).includes(n.id)||M[p].push(n.id);return m})});BH2.nm={key,M};return M}
function bh2Marks(n){const el=BK.pages&&BK.pages[n-1];if(!el)return;if(!BH2.nm||BH2.nm.key!==BK.key)bh2NoteMap();const ids=BH2.nm.M[n]||[];let m=el.querySelector('.bh2nm');if(!ids.length){if(m)m.remove();return}
  if(!m){el.insertAdjacentHTML('beforeend',`<button class="bh2nm" data-bh2p="${n}"></button>`);m=el.querySelector('.bh2nm')}m.innerHTML=`📝 ${ids.length>1?ids.length:''}`;m.title=ids.map(id=>(NOTES().find(z=>z.id===id)||{}).title||'').join(' · ');m.setAttribute('aria-label',t('bh2.nmL',ids.length));
  m.onclick=e=>{e.stopPropagation();const L_=BH2.nm.M[n]||[];if(L_.length===1)bh2GoNote(L_[0]);else{const r=m.getBoundingClientRect();qPopAt(L_.map(id=>`<button data-bh2n="${id}" dir="auto">${esc((NOTES().find(z=>z.id===id)||{}).title||t('notes.untitled'))}</button>`).join(''),r.left+r.width/2,r.bottom,'aymenu lshmenu');$$('#ppPop [data-bh2n]').forEach(b=>b.onclick=()=>{closePP();bh2GoNote(b.dataset.bh2n)})}}}
function bh2GoNote(id){try{bkClose()}catch(e){}showView('boards');setTimeout(()=>openNote(id),80)}
function bh2MarkAll(){(BK.pages||[]).forEach((el,i)=>{if(el.querySelector('canvas'))bh2Marks(i+1)})}
function bh2LinkNote(){const key=BK.key,n=BK.cur||1,line=`[📖 ${bh2Title(key)} · ${t('q.pageS')}${n}](thabat-book:${key}#${n})`;
  nnPick(t('bh2.lnkT',n),id=>{let note;if(id==='+'){const now=Date.now();note={id:uid(),title:t('bh2.lnkNew',bh2Title(key),n),body:line+'\n',created:now,updated:now,day:todayKey()};NOTES().unshift(note)}else{note=NOTES().find(z=>z.id===id);if(!note)return;note.body=String(note.body||'').replace(/\s*$/,'')+'\n\n'+line+'\n';note.updated=Date.now()}
    save();$('#infoModal').classList.remove('on');BH2.nm=null;bh2Marks(n);toast(t('bh2.lnkd'))},{newOk:true})}
/* 194: cut the bottom of the page (footnotes, page furniture) — per book */
const BH2_CUT=[0,.08,.12,.18];
function bh2Cut(n){const el=BK.pages&&BK.pages[n-1];if(!el)return;const c=el.querySelector('canvas'),hl=el.querySelector('.bkhl'),cut=bh2R().cutB||0,on=cut&&!BK.hl;
  [c,hl].forEach(x=>{if(x)x.style.clipPath=on?`inset(0 0 ${(cut*100).toFixed(1)}% 0)`:''});el.classList.toggle('bh2cut',!!on);el.style.marginBottom=on&&bkMode()!=='flip'&&el.offsetHeight?(-Math.round(el.offsetHeight*cut))+'px':''}
{hookFn('bkxApply',()=>bkxApply,f=>{bkxApply=f},'post',function(n){try{bh2Cut(n);bh2Marks(n)}catch(e){}})}
/* 195: the last page on each kind of device, and «continue from the phone / PC» */
{hookFn('bkTrack',()=>bkTrack,f=>{bkTrack=f},'post',function(){try{if(!BK.key||!BK.cur)return;const r=bh2R(),k=BH2.kind();r.dev=r.dev||{};const d=r.dev[k];if(!d||d.pg!==BK.cur){r.dev[k]={pg:BK.cur,at:Date.now()}}}catch(e){}})}
function bh2Other(){const r=bh2R(),k=BH2.kind(),o=k==='pc'?'ph':'pc',d=(r.dev||{})[o],me=(r.dev||{})[k];if(!d||!d.pg)return null;if(d.pg===BK.cur)return null;if(me&&me.at>d.at)return null;return{k:o,pg:d.pg,at:d.at}}
{const _o=bkOpen;bkOpen=async function(...a){const before=(()=>{try{const b=a[0];return b&&BKS()[b.key]&&JSON.parse(JSON.stringify((BKS()[b.key]||{}).dev||{}))}catch(e){return null}})();const r=await _o(...a);
  try{BH2.nm=null;setTimeout(()=>{try{const R=bh2R();if(before)R.dev=Object.assign({},before,{[BH2.kind()]:(before||{})[BH2.kind()]});const o=bh2Other();if(o)toastAct(t(o.k==='ph'?'bh2.fromPh':'bh2.fromPc',o.pg),t('bh2.go'),()=>bkGoPage(o.pg))}catch(e){}bh2MarkAll()},1200)}catch(e){}return r}}
/* the reader «⋯» */
{hookFn('bkReaderMenu',()=>bkReaderMenu,f=>{bkReaderMenu=f},'post',function(){try{const p=$('#ppPop');if(!p||p.querySelector('[data-bh2a]'))return;const r=bh2R(),cut=r.cutB||0,i=BH2_CUT.indexOf(cut),nx=BH2_CUT[(i+1)%BH2_CUT.length],o=bh2Other();
  p.insertAdjacentHTML('beforeend',`<button data-bh2a="hl">🖍 ${t('bh2.hlT')}</button><button data-bh2a="exp">📝 ${t('bh2.exp')}</button><button data-bh2a="lnk">🔗 ${t('bh2.lnkB')}</button><button data-bh2a="cut">✂ ${nx?t('bh2.cutB',Math.round(nx*100)):t('bh2.cutX')}</button><button data-bh2a="yr">📅 ${t('bh2.yrT')}</button>${o?`<button data-bh2a="dev">↪ ${t(o.k==='ph'?'bh2.fromPh':'bh2.fromPc',o.pg)}</button>`:''}`);
  p.querySelectorAll('[data-bh2a]').forEach(b=>b.onclick=()=>{closePP();const a=b.dataset.bh2a;if(a==='hl')bh2HlOpen();else if(a==='exp')bh2Export();else if(a==='lnk')bh2LinkNote();else if(a==='yr')bh2YearOpen();else if(a==='dev'&&o)bkGoPage(o.pg);
    else if(a==='cut'){const R=bh2R();if(nx)R.cutB=nx;else delete R.cutB;save();(BK.pages||[]).forEach((el,j)=>bh2Cut(j+1));toast(nx?t('bh2.cutOn',Math.round(nx*100)):t('bh2.cutOff'))}})}catch(e){console.error(e)}})}

