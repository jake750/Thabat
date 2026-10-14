/* ============ v3.34: test mode word by word; 40 s grace after leaving the full-screen mushaf ============ */
/* test mode: a tap on a hidden word shows that word, a second tap hides it again; the ayah-end number shows or hides the whole ayah */
const QWR=new Set();
function qwrId(sp){const k=sp.dataset.k,pg=sp.closest('[data-p]'),box=pg||document;return (pg?pg.dataset.p:'')+':'+k+'#'+[...box.querySelectorAll(`span[data-k="${k}"]`)].indexOf(sp)}
function qwrPaint(){if(!S.quran.hide)return;document.querySelectorAll('#spread .ml span[data-k]').forEach(sp=>sp.classList.toggle('wrev',QWR.has(qwrId(sp))))}
function qwrDropAyah(k){[...QWR].forEach(x=>{if(x.split('#')[0].replace(/^\d*:/,'')===k)QWR.delete(x)})}
/* pages render later (and neighbours re-render): paint again whenever the spread changes */
{let pend=0;const mo=new MutationObserver(()=>{if(!S.quran.hide||!QWR.size||pend)return;pend=1;setTimeout(()=>{pend=0;qwrPaint()},0)});const m=$('#mushaf');if(m)mo.observe(m,{childList:true,subtree:true})}
{const _am=qApplyMarks;qApplyMarks=function(...a){const r=_am(...a);try{qwrPaint()}catch(e){}return r}}
{const _hs=qHideSet;qHideSet=function(on){QWR.clear();return _hs(on)}}
document.addEventListener('click',e=>{if(!S.quran.hide)return;const w=e.target.closest&&e.target.closest('#spread .ml span[data-k]');if(!w)return;
  if(window._ppGuard&&Date.now()<window._ppGuard)return;const sel=getSelection();if(sel&&!sel.isCollapsed&&sel.toString().trim())return;
  e.stopPropagation();e.preventDefault();const k=w.dataset.k;
  if(e.target.closest('.aen')){if(qRev.has(k))qRev.delete(k);else qRev.add(k);qwrDropAyah(k)}
  else if(qRev.has(k)){qRev.delete(k);qwrDropAyah(k)}
  else{const id=qwrId(w);if(QWR.has(id))QWR.delete(id);else QWR.add(id)}
  qApplyMarks();vib(10)},true);

/* full screen: leaving it waits 40 s before the reading session is saved, so changing the riwaya or the view and coming back keeps one session */
const QFG_MS=40000;let QFG_T=null;
function qfgLeft(){const q=S.qfsT;return q&&q.gr?Math.max(0,Math.ceil((q.gr-Date.now())/1000)):0}
function qfgPaint(){let el=$('#qfgPill');const q=S.qfsT;if(!q||!q.gr||document.documentElement.classList.contains('qfs')){if(el)el.remove();return}
  if(!el){document.body.insertAdjacentHTML('beforeend',`<div class="qfgpill" id="qfgPill" role="status"><span id="qfgTx"></span><button class="btn sm" id="qfgBack">${t('qfg.back')}</button><button class="btn sm ghost" id="qfgEnd">${t('qfg.end')}</button></div>`);el=$('#qfgPill');
    $('#qfgBack').onclick=()=>{if(curView()!=='quran')showView('quran');qFs(true)};$('#qfgEnd').onclick=()=>qftFinish(true)}
  $('#qfgTx').textContent='⏱ '+t('qfg.tx',qfgLeft(),fmtHM(qftTotal()))}
function qfgTick(){clearTimeout(QFG_T);const q=S.qfsT;if(!q||!q.gr)return qfgPaint();if(Date.now()>=q.gr){qftFinish(true);return}qfgPaint();QFG_T=setTimeout(qfgTick,1000)}
{const _fin=qftFinish;qftFinish=function(force){const q=S.qfsT;
  if(q&&force!==true&&!document.documentElement.classList.contains('qfs')){if(!q.gr){qftCut(Date.now());q.gr=Date.now()+QFG_MS;save()}if(Date.now()<q.gr){qfgTick();return}}
  clearTimeout(QFG_T);const r=_fin();const el=$('#qfgPill');if(el)el.remove();return r}}
{const _st=qftStart;qftStart=function(){const q=S.qfsT;if(q&&q.gr){delete q.gr;const n=Date.now();q.seg=n;q.last=n;clearTimeout(QFG_T);save();qfgPaint();qftUi();return}return _st()}}
