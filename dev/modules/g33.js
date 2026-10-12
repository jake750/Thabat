/* ============ v3.25: search inside books, and reading scanned pages (OCR on the PC with Tesseract); the text found is kept on this device per book ============ */
const BKX={key:null,txt:{},ocr:{},run:false,stop:false,scanned:null,q:''};
async function bkxLoad(){if(BKX.key===BK.key)return;BKX.key=BK.key;BKX.txt={};BKX.scanned=null;BKX.stop=true;BKX.run=false;BKX.ocr={};try{BKX.ocr=(await idbGet('ocr:'+BK.key))||{}}catch(e){}}
function bkxSaveOcr(){try{idbSet('ocr:'+BK.key,BKX.ocr)}catch(e){}}
/* the text of one page: its own text layer, else what OCR read */
/* a page's text in reading order: items grouped into lines by height, each line ordered by position in its direction (many Arabic PDFs store letters one by one, drawn right to left), gaps become spaces, and letter shapes (presentation forms) become plain letters */
function bkxText(tc){const its=tc.items.filter(i=>i.str!=null&&i.transform);const lines=[];
  its.forEach(i=>{const y=i.transform[5],h=Math.abs(i.transform[3])||Math.abs(i.height)||10;let L=lines.find(l=>Math.abs(l.y-y)<h*0.5);if(!L){L={y,h,a:[]};lines.push(L)}L.a.push(i)});
  lines.sort((a,b)=>b.y-a.y);
  return lines.map(L=>{const rtl=L.a.filter(i=>i.dir==='rtl').length>L.a.filter(i=>i.dir==='ltr').length;const a=L.a.slice().sort((p,q)=>rtl?q.transform[4]-p.transform[4]:p.transform[4]-q.transform[4]);let s='',prev=null;
    a.forEach(i=>{const x=i.transform[4],w=i.width||0;if(prev){const gap=rtl?prev.transform[4]-(x+w):x-(prev.transform[4]+(prev.width||0));if(gap>L.h*0.18&&!/\s$/.test(s)&&!/^\s/.test(i.str))s+=' '}s+=i.str;prev=i});
    return s}).join('\n').normalize('NFKC').replace(/[ \t]+/g,' ').trim()}
async function bkxPage(n){if(BKX.txt[n]==null){try{const pg=await BK.doc.getPage(n),tc=await pg.getTextContent();BKX.txt[n]=bkxText(tc)}catch(e){BKX.txt[n]=''}}
  return BKX.txt[n].length>15?BKX.txt[n]:(BKX.ocr[n]||BKX.txt[n]||'')}
async function bkxIsScanned(){if(BKX.scanned!=null)return BKX.scanned;const N=BK.pages.length;let chars=0,checked=0;for(let n=1;n<=Math.min(N,6);n++){await bkxPage(n);chars+=(BKX.txt[n]||'').length;checked++}BKX.scanned=checked>0&&chars/checked<20;return BKX.scanned}
async function bkxState(){if(!LIB.base){try{await libConnect()}catch(e){}}if(!LIB.base)return null;try{const r=await libFetch(libU('/ocr/state'),5000);return r.ok?await r.json():null}catch(e){return null}}
/* the panel: search box, results, and for scanned books the OCR controls */
async function bkxOpen(){await bkxLoad();const p=$('#bkPanel');p.innerHTML=`<div class="bkph"><b>🔍 ${t('bkx.t')}</b><button class="btn sm ghost" id="bkPx">✕</button></div>
  <div class="bkgo"><input class="in" id="bkxQ" type="search" dir="auto" placeholder="${esc(t('bkx.ph'))}" value="${esc(BKX.q)}"><button class="btn sm pri" id="bkxGo">${t('bkx.go')}</button></div>
  <div id="bkxRes"></div><div id="bkxOcr" class="bkxocr"></div><button class="bkpi" id="bkxCopy">📋 ${t('bkx.copy')}</button>`;p.hidden=false;
  $('#bkPx').onclick=()=>p.hidden=true;const q=$('#bkxQ');q.focus();$('#bkxGo').onclick=bkxSearch;q.onkeydown=e=>{if(e.key==='Enter')bkxSearch()};
  $('#bkxCopy').onclick=async()=>{const tx=await bkxPage(BK.cur||1);if(!tx){toast(t('bkx.noText'));return}try{await navigator.clipboard.writeText(tx);toast(t('bkx.copied'))}catch(e){}};
  bkxOcrBox()}
async function bkxSearch(){const q=($('#bkxQ').value||'').trim();BKX.q=q;const box=$('#bkxRes');if(!box)return;if(q.length<2){box.innerHTML='';return}
  const nq=lshNorm(q),N=BK.pages.length,hits=[];box.innerHTML=`<p class="muted bkxm">${t('bkx.searching')}</p>`;const key=BK.key;
  for(let n=1;n<=N;n++){if(BK.key!==key||BKX.q!==q)return;const tx=await bkxPage(n);if(!tx)continue;const nt=lshNorm(tx);let i=nt.indexOf(nq);if(i<0)continue;
    /* the normalised text has the same length as the original except for removed marks: show a window around the match from the normalised text */
    const M=lshNormMap(tx),o0=M.map[i],o1=M.map[Math.min(M.map.length-1,i+nq.length-1)]+1,a=Math.max(0,o0-40),b=Math.min(tx.length,o1+60);hits.push({n,s:(a?'…':'')+tx.slice(a,b).replace(/\s+/g,' ')+(b<tx.length?'…':'')});if(hits.length>=150)break;
    if(n%25===0)box.innerHTML=`<p class="muted bkxm">${t('bkx.searching')} ${n}/${N}</p>`}
  const sc=await bkxIsScanned(),ocrN=Object.keys(BKX.ocr).length;
  box.innerHTML=hits.length?`<p class="muted bkxm">${t('bkx.hits',hits.length)}</p>${hits.map(h=>`<button class="bkpi" data-go="${h.n}"><b>${t('q.pageS')}${h.n}</b><small dir="auto">${esc(h.s)}</small></button>`).join('')}`:`<p class="muted bkxm">${sc&&ocrN<N?t('bkx.noneScanned'):t('bkx.none')}</p>`;
  box.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>{const el=BK.pages[+b.dataset.go-1];if(el){$('#bkV').scrollTop=el.offsetTop-8;if(MOB.matches)$('#bkPanel').hidden=true}})}
async function bkxOcrBox(){const box=$('#bkxOcr');if(!box)return;const sc=await bkxIsScanned(),N=BK.pages.length,done=Object.keys(BKX.ocr).length;
  if(!sc&&!done){box.innerHTML='';return}
  if(BKX.run){box.innerHTML=`<p>${t('bkx.ocrRun',done,N)}</p><div class="trxprog lite"><i style="width:${Math.round(done/N*100)}%"></i></div><button class="btn sm ghost" id="bkxStop">${t('bkx.stop')}</button>`;$('#bkxStop').onclick=()=>{BKX.stop=true};return}
  const st=await bkxState();if(!$('#bkxOcr'))return;
  if(!st){box.innerHTML=`<p class="muted">${t('bkx.ocrNeedPc')}</p>`;return}
  if(!st.inst){const ins=st.install||{};box.innerHTML=ins.s==='run'?`<p>${t('bkx.ocrInstalling')}</p>`:`<p>${t('bkx.ocrNeed')}</p>${LIB.via==='pc'?`<button class="btn sm" id="bkxInst">⤓ ${t('bkx.ocrInstall')}</button><p class="muted">${t('bkx.ocrSize')}</p>`:`<p class="muted">${t('trx.onPc')}</p>`}${ins.s==='err'?`<p class="trxerr">${t('trx.instErr')}</p>`:''}`;
    const b=$('#bkxInst');if(b)b.onclick=async()=>{await libFetch(libU('/ocr/install'),5000).catch(()=>{});bkxOcrBox()};if(ins.s==='run')setTimeout(bkxOcrBox,5000);return}
  const L=localStorage.getItem('thabat.ocrLang')||'ara+eng';
  if(done>=N){box.innerHTML=`<p>✓ ${t('bkx.ocrAll',N)}</p>`;return}
  box.innerHTML=`<p>${done?t('bkx.ocrPart',done,N):t('bkx.ocrIntro')}</p><div class="bkxrow"><select class="in" id="bkxLang">${['ara+eng','ara','eng'].map(l=>`<option value="${l}" ${L===l?'selected':''}>${t('bkx.l.'+l.replace('+','_'))}</option>`).join('')}</select><button class="btn sm pri" id="bkxRun">${done?t('bkx.ocrGoOn'):t('bkx.ocrGo',N)}</button></div><p class="muted">${t('bkx.ocrNote')}</p>`;
  $('#bkxLang').onchange=e=>{try{localStorage.setItem('thabat.ocrLang',e.target.value)}catch(_){}};$('#bkxRun').onclick=()=>bkxOcrRun($('#bkxLang').value)}
/* page after page: drawn large in memory, sent to the PC, the text kept; it resumes where it stopped */
async function bkxOcrRun(lang){if(BKX.run)return;BKX.run=true;BKX.stop=false;const key=BK.key,N=BK.pages.length;bkxOcrBox();let fails=0;
  try{for(let n=1;n<=N;n++){if(BKX.stop||BK.key!==key||!BK.doc)break;if(BKX.ocr[n]!=null)continue;await bkxPage(n);if((BKX.txt[n]||'').length>15){BKX.ocr[n]=BKX.txt[n];continue}
      try{const pg=await BK.doc.getPage(n),vp1=pg.getViewport({scale:1}),sc=Math.min(3,2200/vp1.width),vp=pg.getViewport({scale:sc}),c=document.createElement('canvas');c.width=Math.floor(vp.width);c.height=Math.floor(vp.height);const cx=c.getContext('2d',{alpha:false});cx.fillStyle='#fff';cx.fillRect(0,0,c.width,c.height);
        await pg.render({canvasContext:cx,viewport:vp}).promise;const blob=await new Promise(r=>c.toBlob(r,'image/png'));c.width=c.height=0;
        const r=await libFetch(libU('/ocr?l='+encodeURIComponent(lang)),120000,{method:'POST',body:blob});if(!r.ok)throw new Error('ocr');const j=await r.json();BKX.ocr[n]=String(j.text||'').trim();fails=0}
      catch(e){if(++fails>=3){toast(t('bkx.ocrFail'));break}continue}
      if(n%3===0)bkxSaveOcr();bkxOcrBox()}}
  finally{BKX.run=false;if(BK.key===key){bkxSaveOcr();bkxOcrBox();if(Object.keys(BKX.ocr).length>=N)toast(t('bkx.ocrDone'))}}}
/* the button in the reader's bar */
{const _b=bkBuild;bkBuild=async function(...a){const r=await _b(...a);try{const ls=$('#bkLs');if(ls&&!$('#bkSr')){ls.insertAdjacentHTML('beforebegin',`<button class="bkb" id="bkSr" title="${esc(t('bkx.t'))}" aria-label="${esc(t('bkx.t'))}">🔍</button>`);$('#bkSr').onclick=()=>{const p=$('#bkPanel');if(!p.hidden&&p.querySelector('#bkxQ')){p.hidden=true;return}bkxOpen()}}}catch(e){console.error(e)}return r}}
{const _c=bkClose;bkClose=function(...a){BKX.stop=true;return _c(...a)}}
document.addEventListener('keydown',e=>{if(BK.doc&&$('#bkReader.on')&&(e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='f'){e.preventDefault();e.stopPropagation();bkxOpen()}},true);
