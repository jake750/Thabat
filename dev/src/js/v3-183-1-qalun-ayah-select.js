/* ============ v3.183 select an ayah on the tajweed Qalun pages (2026-11-25, Qalun mushaf plan, phases 2–4) ============ */
/* Thabat-QalunAyat.js beside the page (dev/data; loaded on first use, from GitHub if missing) holds, for each of the 604 tajweed pages, the bounds of every ayah: one box per line,
   in thousandths of the page, read from the page images (the ayah-end rings) and checked against the Kufi count of every surah (6236).
   The boxes of one line split it at the rings, so two ayahs never overlap. Pages use the Kufi count (the basmala of al-Fatiha is 1).
   Copied text is the KFGQPC Qalun text (mushaf/qaloon.js), split at the Kufi ends: QTJ.b[s] = the end word of each ayah in the
   surah's Qalun words. Al-Fatiha 1 is the basmala, whose Qalun words come from an-Naml 30. The Hafs text was used only to find the ends. */
let QTJ=null,QTJL=null,QTJW={};
function qtjOn(){return S.quran&&S.quran.riwaya==='qaloontj'}
function qtjLoad(){if(QTJ)return Promise.resolve(QTJ);if(QTJL)return QTJL;
  QTJL=(async()=>{for(const u of['Thabat-QalunAyat.js','https://cdn.jsdelivr.net/gh/jake750/Thabat@main/dev/data/Thabat-QalunAyat.js']){if(window.QTJ_AYAT)break;try{await loadScript(u)}catch(e){}}
    if(!window.QTJ_AYAT)throw new Error('qtj');QTJ=window.QTJ_AYAT;return QTJ})();
  QTJL.catch(()=>{QTJL=null});return QTJL}
/* the ayah under a point of a page image (fx, fy in thousandths of the image) */
function qtjAt(p,fx,fy){const L=QTJ&&QTJ.p[p];if(!L)return null;
  for(const A of L){const r=A[2];for(let i=0;i<r.length;i+=4)if(fx>=r[i]&&fx<=r[i+2]&&fy>=r[i+1]&&fy<=r[i+3])return A}return null}
/* where the picture sits inside the <img> box (object-fit: contain) */
function qtjBox(im){const w=im.clientWidth,h=im.clientHeight,nw=im.naturalWidth||1,nh=im.naturalHeight||1,k=Math.min(w/nw,h/nh),cw=nw*k,ch=nh*k;
  return{x:im.offsetLeft+(w-cw)/2,y:im.offsetTop+(h-ch)/2,w:cw,h:ch}}
/* Qalun words of a surah, split exactly as the build script splits them */
const QTJ_LET=/[ء-غف-يٱ]/;
async function qtjWords(s){if(QTJW[s])return QTJW[s];
  if(!QURAN_PACKS.qaloon){try{await loadScript('mushaf/qaloon.js')}catch(e){}}
  if(!QURAN_PACKS.qaloon)QURAN_PACKS.qaloon=await qPackFromCdn('qaloon');
  for(const r of QURAN_PACKS.qaloon.rows){const L=QTJW[r[2]]||(QTJW[r[2]]=[]);L.push(...r[6].split(/\s+/).filter(w=>QTJ_LET.test(w)))}
  return QTJW[s]}
async function qtjText(s,a){await qtjLoad();
  if(s===1&&a===1){const w=await qtjWords(27),e=QTJ.b[27][29];return w.slice(e-4,e).join(' ')}
  const w=await qtjWords(s),b=QTJ.b[s];if(!b||!b[a-1])return'';return w.slice(a>1?b[a-2]:0,b[a-1]).join(' ')}
function qtjClear(){$$('.qtjsel').forEach(x=>x.remove());const b=$('#qtjBar');if(b)b.remove();document.removeEventListener('pointerdown',qtjOut,true)}
function qtjOut(e){const b=$('#qtjBar');if(b&&b.contains(e.target))return;if(Date.now()<(window._ppGuard||0))return;qtjClear()}
/* draw the boxes of ayah s:a on every visible page image that has it */
function qtjDraw(s,a){$$('.qtjsel').forEach(x=>x.remove());let first=null;
  $$('#spread img[data-p]').forEach(im=>{const p=+im.dataset.p,L=QTJ.p[p];if(!L||!im.naturalWidth)return;const A=L.find(x=>x[0]===s&&x[1]===a);if(!A)return;
    const bx=qtjBox(im),r=A[2];let rs='';for(let i=0;i<r.length;i+=4)rs+=`<rect x="${r[i]}" y="${r[i+1]+3}" width="${r[i+2]-r[i]}" height="${r[i+3]-r[i+1]-6}" rx="6" ry="4"/>`;
    const sv=document.createElementNS('http://www.w3.org/2000/svg','svg');sv.setAttribute('class','qtjsel');sv.setAttribute('viewBox','0 0 1000 1000');sv.setAttribute('preserveAspectRatio','none');sv.setAttribute('aria-hidden','true');
    sv.style.cssText=`left:${bx.x}px;top:${bx.y}px;width:${bx.w}px;height:${bx.h}px`;sv.innerHTML=rs;im.after(sv);
    const g=im.getBoundingClientRect(),z=g.width/(im.clientWidth||g.width)||1;
    if(!first)first={top:g.top+(bx.y-im.offsetTop)*z+r[1]/1000*bx.h*z,bottom:g.top+(bx.y-im.offsetTop)*z+r[r.length-1]/1000*bx.h*z,left:g.left+(bx.x-im.offsetLeft)*z,right:g.left+(bx.x-im.offsetLeft+bx.w)*z}});
  return first}
/* the floating bar above the ayah: copy, share, bookmark, tafsir, and «more» for the older page menu */
function qtjBar(s,a,p,box,x,y){const old=$('#qtjBar');if(old)old.remove();closePP();
  const b=document.createElement('div');b.id='qtjBar';b.className='qtjbar';b.setAttribute('role','toolbar');b.setAttribute('aria-label',`${qSurahName(s)} · ${t('q.ayahN',a)}`);
  b.innerHTML=`<span class="qtjh">${esc(qSurahName(s))} · ${a}</span><button data-x="copy">📋 ${t('q.copyAyah')}</button>${(ANDROID||navigator.share)?`<button data-x="share">↗ ${t('q.share')}</button>`:''}<button data-x="bm">🔖 ${t('qtj.bm')}</button><button data-x="tfs">📖 ${t('q.tafsir')}</button><button data-x="more" aria-label="${esc(t('qtj.more'))}" title="${esc(t('qtj.more'))}">⋯</button>`;
  document.body.append(b);
  /* screen points → the page's own pixels (the interface zoom scales everything on the PC) */
  const zu=uiZoom()||1,W_=innerWidth/zu,H_=innerHeight/zu;x/=zu;y/=zu;if(box)box={top:box.top/zu,bottom:box.bottom/zu,left:box.left/zu,right:box.right/zu};
  b.style.maxWidth=(W_-16)+'px';
  const w=b.offsetWidth,h=b.offsetHeight,cx=box?(box.left+box.right)/2:x;
  let top=(box?box.top:y)-h-10;if(top<8)top=(box?box.bottom:y)+10;if(top+h>H_-8)top=Math.max(8,y-h-16);
  b.style.left=Math.max(8,Math.min(W_-w-8,(box?Math.min(Math.max(x,box.left+w/2),box.right-w/2):cx)-w/2))+'px';b.style.top=top+'px';
  const txt=async()=>{const tx=await qtjText(s,a);return tx?`${tx}\n[${qSurahName(s)}: ${a} · ${t('qtj.qalun')}]`:''};
  b.onclick=async e=>{const k=e.target.closest('[data-x]');if(!k)return;const X=k.dataset.x;
    if(X==='more'){qtjClear();qtjPageMenu(p,x*zu,y*zu);return}
    qtjClear();
    if(X==='copy'){try{const tx=await txt();if(tx&&await qCopyText(tx))toast(t('q.copied'));else toast(t('toast.saveFail'))}catch(err){toast(t('toast.saveFail'))}}
    else if(X==='share'){try{const tx=await txt();if(!tx)return;if(ANDROID){try{window.ThabatAndroid.share(qSurahName(s)+' '+a,tx)}catch(err){}}else navigator.share({text:tx}).catch(()=>{})}catch(err){}}
    else if(X==='bm'){const r=S.quran.riwaya;qbmList().unshift({id:uid(),n:`${qSurahName(s)} · ${t('q.ayahN',a)}`,r,p,an:qanOf(r,p),s,a,at:Date.now()});save();toast(t('qbm.added'))}
    else if(X==='tfs'){if(TF.src==='gharib')TF.src=S.quran.tfsSrc&&S.quran.tfsSrc!=='gharib'?S.quran.tfsSrc:'baghawi';openTafsir(s,a)}};
  setTimeout(()=>document.addEventListener('pointerdown',qtjOut,true),0);
  requestAnimationFrame(()=>b.classList.add('on'))}
/* a click (PC) or long-press (phone) on a tajweed page selects the ayah under it; outside the ayahs (surah frames, basmala) the old page menu opens */
let qtjPageMenu=qPageAyahMenu;
qPageAyahMenu=async function(pg,x,y){if(!qtjOn())return qtjPageMenu(pg,x,y);
  const im=[...$$('#spread img[data-p]')].find(i=>{const g=i.getBoundingClientRect();return +i.dataset.p===pg&&g.width>0&&g.left<=x&&g.right>=x&&g.top<=y&&g.bottom>=y});
  if(!im||!im.naturalWidth)return qtjPageMenu(pg,x,y);
  try{await qtjLoad()}catch(e){return qtjPageMenu(pg,x,y)}
  const g=im.getBoundingClientRect(),z=g.width/(im.clientWidth||g.width)||1,bx=qtjBox(im),fx=((x-g.left)/z-(bx.x-im.offsetLeft))/bx.w*1000,fy=((y-g.top)/z-(bx.y-im.offsetTop))/bx.h*1000;
  const A=qtjAt(pg,fx,fy);if(!A)return qtjPageMenu(pg,x,y);
  const box=qtjDraw(A[0],A[1]);qtjBar(A[0],A[1],pg,box,x,y)};
hookFn('renderQuran',()=>renderQuran,f=>{renderQuran=f},'pre',function(){qtjClear()});
{const _qsc=qSlideCommit;qSlideCommit=function(d){qtjClear();_qsc(d)}}
addEventListener('resize',()=>qtjClear());
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('#qtjBar'))qtjClear()});
/* a bookmark made on an ayah reopens at that ayah with it selected */
{const _go=qbmGo;qbmGo=function(id){_go(id);const b=qbmList().find(x=>x.id===id);if(!b||!b.s||!qtjOn())return;
  setTimeout(()=>qtjLoad().then(()=>{const box=qtjDraw(b.s,b.a);if(box)qtjBar(b.s,b.a,b.p,box,(box.left+box.right)/2,box.top)}).catch(()=>{}),450)}}
