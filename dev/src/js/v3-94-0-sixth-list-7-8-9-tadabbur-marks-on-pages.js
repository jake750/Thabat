/* ============ v3.94.0: sixth list 7, 8, 9 — tadabbur marks on pages, the test strip on scanned pages, search inside all books ============ */
/* 7 · a note knows the mushaf pages it was written for (n.qp); those pages get a mark under them and on the hifz map */
function tdbNotes(p){return NOTES().filter(n=>!n.arc&&Array.isArray(n.qp)&&n.qp.includes(p)).sort((a,b)=>(b.updated||0)-(a.updated||0))}
function tdbPages(){const s=new Set();NOTES().forEach(n=>{if(!n.arc&&Array.isArray(n.qp))n.qp.forEach(p=>s.add(p))});return s}
function tdbCur(){const Q=S.quran,one=MOB.matches||document.documentElement.classList.contains('qfs-one');return Math.max(1,Math.min(604,one?(Q.pv||Q.view||1):(Q.view||1)))}
/* the note for this page: the newest one tied to it, else a new «تدبّر · surah · p» note */
function tdbOpen(p){p=p||tdbCur();const ex=tdbNotes(p)[0];if(ex){openNote(ex.id);return}
  const n={id:uid(),title:t('tdb.title',qSurahAt(p).name,p),body:'',imgs:[],created:Date.now(),updated:Date.now(),qp:[p]};NOTES().push(n);save();openNote(n.id)}
/* the PC side note (3.72) ties itself to the pages on screen when you write in it */
{const _f=qnFlush;qnFlush=function(...a){const id=QN.id,n0=id&&NOTES().find(x=>x.id===id),u0=n0&&n0.updated;const r=_f(...a);try{const n=id&&NOTES().find(x=>x.id===id);
  if(n&&n.updated!==u0&&curView()==='quran'){const v=S.quran.view||1,ps=MOB.matches?[tdbCur()]:[v,v+1].filter(x=>x<=604);n.qp=[...new Set([...(n.qp||[]),...ps])];save();tdbPaint()}}catch(e){}return r}}
function tdbPaint(){const set=tdbPages();$$('#spread .qpage').forEach(pg=>{const b=pg.querySelector('[data-bm]');if(!b)return;const p=+b.dataset.bm,f=pg.querySelector('.qf');if(!f)return;
  let m=f.querySelector('.qtdb');if(set.has(p)){if(!m){f.insertAdjacentHTML('beforeend',`<button class="qbtn qtdb" data-tdb="${p}" title="${esc(t('tdb.open'))}">📝</button>`);m=f.querySelector('.qtdb');m.onclick=e=>{e.stopPropagation();tdbOpen(p)}}}else if(m)m.remove()});
  $$('.hc[data-p]').forEach(c=>c.classList.toggle('tdbh',set.has(+c.dataset.p)))}
{hookFn('renderQuran',()=>renderQuran,f=>{renderQuran=f},'post',function(){try{tdbPaint()}catch(e){}})}
{hookFn('renderQMap',()=>renderQMap,f=>{renderQMap=f},'post',function(){try{tdbPaint()}catch(e){}})}
/* 8 · test mode on scanned and Taysir pages: a cover over the page; drag its edge down, or tap it to uncover the next line */
const QCV={p:{},one:1/15};
function qcvPaint(){const Q=S.quran,R=RIWAYAT[Q.riwaya]||{};$$('#spread .qcov').forEach(c=>c.remove());if(!Q.hide||R.kind!=='img')return;
  $$('#spread .qpage').forEach(pg=>{const b=pg.querySelector('[data-bm]'),box=pg.querySelector('.qimg');if(!b||!box||!box.querySelector('img'))return;const p=+b.dataset.bm,f=QCV.p[p]||0;
    box.insertAdjacentHTML('beforeend',`<div class="qcov" data-cp="${p}" style="top:${(f*100).toFixed(2)}%"><i class="qcovh"></i><span>${esc(t('qcv.hint'))}</span></div>`)});
  $$('#spread .qcov').forEach(qcvBind)}
function qcvSet(c,f){const p=+c.dataset.cp;f=Math.max(0,Math.min(1,f));QCV.p[p]=f;c.style.top=(f*100).toFixed(2)+'%';c.classList.toggle('gone',f>=.995)}
function qcvBind(c){let st=null;const box=c.parentElement;
  c.addEventListener('pointerdown',e=>{st={y:e.clientY,f:QCV.p[+c.dataset.cp]||0,h:box.getBoundingClientRect().height,mv:false};c.setPointerCapture(e.pointerId);e.stopPropagation()});
  c.addEventListener('pointermove',e=>{if(!st)return;const dy=e.clientY-st.y;if(Math.abs(dy)>6)st.mv=true;if(st.mv)qcvSet(c,st.f+dy/st.h);e.stopPropagation()});
  c.addEventListener('pointerup',e=>{if(st&&!st.mv)qcvSet(c,(QCV.p[+c.dataset.cp]||0)+QCV.one);st=null;e.stopPropagation()});
  c.addEventListener('click',e=>e.stopPropagation(),true);c.addEventListener('touchstart',e=>e.stopPropagation(),{passive:true})}
{hookFn('renderQuran',()=>renderQuran,f=>{renderQuran=f},'post',function(){try{const v=S.quran.view;if(QCV.v!==v){QCV.v=v;QCV.p={}}qcvPaint()}catch(e){}})}
/* 9 · search inside every book: each book's text is read once into IDB bktx:<key> (pages); scanned pages use their OCR text */
const BKF={idx:null,run:null};
async function bkfLoad(){if(BKF.idx)return BKF.idx;const idx={};try{const ks=(await idbKeys()).filter(k=>String(k).startsWith('bktx:'));for(const k of ks){const v=await idbGet(k);if(v&&v.t)idx[String(k).slice(5)]=v}}catch(e){}BKF.idx=idx;return idx}
async function bkfBuild(onp){if(BKF.run)return;const books=bkAll(),idx=await bkfLoad(),todo=books.filter(b=>!idx[b.key]||(b.s&&idx[b.key].s!==b.s));if(!todo.length){toast(t('bkf.ready'));return}
  BKF.run={i:0,n:todo.length,stop:0};const L=await bkLoadLib();
  for(const b of todo){if(BKF.run.stop)break;BKF.run.i++;BKF.run.b=b.n;onp&&onp();
    try{const doc=await L.getDocument(bkDocOpts(await bkSource(b,L))).promise,tx=[];let ocr={};try{ocr=(await idbGet('ocr:'+b.key))||{}}catch(e){}
      for(let n=1;n<=doc.numPages;n++){if(BKF.run.stop)break;let s='';try{s=bkxText(await (await doc.getPage(n)).getTextContent())}catch(e){}if(s.replace(/\s/g,'').length<20&&ocr[n])s=ocr[n];tx.push(s);if(n%10===0){BKF.run.pg=n+'/'+doc.numPages;onp&&onp()}}
      try{doc.destroy()}catch(e){}if(!BKF.run.stop){const v={n:b.n,s:b.s||0,t:tx,at:Date.now()};idx[b.key]=v;await idbSet('bktx:'+b.key,v)}}catch(e){}}
  BKF.run=null;onp&&onp();toast(t('bkf.done'))}
function bkfFind(q){const s=lshNorm(q).trim(),out=[];if(s.length<2||!BKF.idx)return out;
  for(const [key,v] of Object.entries(BKF.idx)){for(let i=0;i<v.t.length;i++){const m=lshNormMap(v.t[i]),j=m.n.indexOf(s);if(j<0)continue;
    const a=m.map[Math.max(0,j-40)]||0,z=m.map[Math.min(m.map.length-1,j+s.length+60)]||v.t[i].length;out.push({key,n:v.n,pg:i+1,sn:v.t[i].slice(a,z+1).replace(/\s+/g,' ')});if(out.length>=80)return out}}return out}
async function bkfHits(q){const box=$('#bkfHits');if(!box)return;await bkfLoad();const books=bkAll(),have=books.filter(b=>BKF.idx[b.key]).length,H=bkfFind(q);
  const bar=books.length?`<div class="bkfbar"><span>${esc(t('bkf.idx',have,books.length))}</span>${BKF.run?`<span>${esc(t('bkf.run',BKF.run.i,BKF.run.n,BKF.run.b||'',BKF.run.pg||''))}</span><button class="btn sm ghost" data-bkf="stop">${esc(t('tsm.stop'))}</button>`:have<books.length?`<button class="btn sm" data-bkf="build">${esc(t('bkf.build',books.length-have))}</button>`:''}</div>`:'';
  box.innerHTML=(H.length||bar)?`<div class="bkfh"><h4>📖 ${esc(t('bkf.t',H.length))}</h4>${bar}${H.map(x=>`<button class="bkfr" data-bkfk="${esc(x.key)}" data-bkfp="${x.pg}"><b dir="auto">${esc(x.n)} · ${esc(t('bkf.pg',x.pg))}</b><small dir="auto">${esc(x.sn)}</small></button>`).join('')}</div>`:'';
  const go=box.querySelector('[data-bkf="build"]');if(go)go.onclick=()=>bkfBuild(()=>{if($('#bkfHits'))bkfHits(q)});const st=box.querySelector('[data-bkf="stop"]');if(st)st.onclick=()=>{if(BKF.run)BKF.run.stop=1};
  box.querySelectorAll('[data-bkfk]').forEach(b=>b.onclick=()=>nteBkOpen(b.dataset.bkfk,+b.dataset.bkfp))}
{const _ls=lshSearch;lshSearch=function(q,...a){const h=_ls(q,...a);if(q.length<2)return h;clearTimeout(BKF.t);BKF.t=setTimeout(()=>bkfHits(q),300);return h+`<div id="bkfHits"></div>`}}
/* the «⋯» sheet: «تدبّر هذه الصفحة» */
{hookFn('qbLayout',()=>qbLayout,f=>{qbLayout=f},'post',function(){try{const tb=$('#qbTools .qbshb');if(!tb||$('#tdbBtn'))return;const g=$('#qbmBtn')||$('#qbGoTo');
  const h=`<button class="btn sm ghost qbtool" id="tdbBtn" data-qbl="1">📝<small>${esc(t('tdb.b'))}</small></button>`;if(g)g.insertAdjacentHTML('afterend',h);else tb.insertAdjacentHTML('afterbegin',h);
  $('#tdbBtn').onclick=()=>setTimeout(()=>tdbOpen(),20)}catch(e){console.error(e)}})}

