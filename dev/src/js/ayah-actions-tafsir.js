/* ============ ayah actions & tafsir ============ */
const TFS={};window.TAFSIR_CB=(name,s,arr)=>{(TFS[name]=TFS[name]||{})[s]=arr};
async function tfsGet(s,src){src=src||TF.src||'baghawi';const B=TFS[src]||(TFS[src]={});if(B[s])return B[s];
  try{await new Promise((res,rej)=>{const sc=document.createElement('script');sc.src='tafsir/'+src+'/'+String(s).padStart(3,'0')+'.js';sc.onload=res;sc.onerror=rej;document.head.append(sc)})}catch(e){}
  if(B[s])return B[s];
  try{const c=await idbGet('tfs:'+src+':'+s);if(c){B[s]=c;return c}}catch(e){}
  const r=await fetch('https://raw.githubusercontent.com/spa5k/tafsir_api/main/tafsir/'+tfsSlug(src)+'/'+s+'.json');if(!r.ok)throw new Error('net');const d=await r.json(),raw=[];d.forEach(x=>raw[x.ayah-1]=x.text);const arr=[];let f=0;for(let j=0;j<raw.length;j++){if(j&&raw[j]&&raw[j]===raw[j-1])arr.push(f+1);else{f=j;arr.push(raw[j]||'')}}B[s]=arr;try{idbSet('tfs:'+src+':'+s,arr)}catch(e){}return arr}
function qSurahName(s){return QS[s-1]?(LANG==='ar'?QS[s-1][0]:QS[s-1][1]):''}
function qAyahText(s,a,r){const B=QB[r]||QB.hafs;if(!B)return'';const w=[];for(let p=QS[s-1][2];p<=604;p++){const g=B.pages[p];if(!g)continue;let past=false;for(const x of g.ay){if(x.s===s&&x.a===a)w.push(...x.w);if(x.s>s||(x.s===s&&x.a>a))past=true}if(past)break}
  if(!w.length)return'';w[w.length-1]=qCopyWord(w[w.length-1]);return w.join(' ').replace(/ /g,' ').replace(/\s+/g,' ').trim()}
async function qCopyText(tx){try{await navigator.clipboard.writeText(tx);return true}catch(e){try{const ta=document.createElement('textarea');ta.value=tx;ta.style.cssText='position:fixed;opacity:0;top:0';document.body.append(ta);ta.select();const ok=document.execCommand('copy');ta.remove();return ok}catch(x){return false}}}
function qHl(s,a){$$('.ahl').forEach(x=>x.classList.remove('ahl'));if(s)$$(`#spread span[data-k="${s}:${a}"]`).forEach(x=>x.classList.add('ahl'))}
function qPopAt(html,x,y,cls){closePP();const p=document.createElement('div');p.className='pppop '+(cls||'');p.id='ppPop';p.innerHTML=html;document.body.append(p);
  const w=p.offsetWidth,h=p.offsetHeight;let left=Math.max(8,Math.min(innerWidth-w-8,x-w/2)),top=y+16;if(top+h>innerHeight-8)top=Math.max(8,y-h-16);p.style.left=left+'px';p.style.top=top+'px';
  setTimeout(()=>{document.addEventListener('mousedown',ppOut,true);document.addEventListener('touchstart',ppOutT,{capture:true,once:true})},0);return p}
function ppOutT(e){if(Date.now()<(window._ppGuard||0))return;const p=$('#ppPop');if(p&&!p.contains(e.target))closePP()}
function qAyahMenu(s,a,x,y,word){const r=S.quran.riwaya,R=RIWAYAT[r]||RIWAYAT.hafs,k=s+':'+a,hasN=NOTES().some(n=>n.ay===k),mk=qMarks()[k];
  const p=qPopAt(`<div class="aymh"><b>${esc(qSurahName(s))}</b> · ${t('q.ayahN',a)}</div><div class="aygrid">
    <button data-x="tfs">📖 ${t('q.tafsir')}</button><button data-x="gh">🔤 ${t('q.meanings')}</button>
    <button data-x="play">▶ ${t('q.listen')}</button><button data-x="copy">📋 ${t('q.copyAyah')}</button>
    <button data-x="note">${hasN?'📝 '+t('q.tdbOpen'):t('q.tdb')}</button><button data-x="mark">${mk?`<i class="mkdot" style="background:${QMK[mk]}"></i>`:'🎨'} ${t('q.markT')}</button>
    <button data-x="board">${t('q.toBoard')}</button>${(ANDROID||navigator.share)?`<button data-x="share">↗ ${t('q.share')}</button>`:''}<button data-x="rng">🔁 ${t('rg.btn')}</button><button data-x="sn">📒 ${t('sn2.btn')}</button><button data-x="hzat">📍 ${t('hz3.here')}</button>${qTopicsOn()?`<button data-x="topic">🏷 ${t('tp.btn')}</button>`:''}</div>`,x,y,'aymenu');qHl(s,a);
  const txt=()=>{const tx=qAyahText(s,a,R.kind==='text'?r:'hafs');return tx?`${tx}\n[${qSurahName(s)}: ${a}]`:''};
  const on=(k2,f)=>{const b=p.querySelector(`[data-x=${k2}]`);if(b)b.onclick=()=>{closePP();f()}};on('hzat',()=>{S.quran.hifzAt=s+':'+a;save();toast(t('hz3.saved',qSurahName(s),a));try{renderQSide()}catch(e){}});
  on('copy',async()=>{const tx=txt();if(tx&&await qCopyText(tx))toast(t('q.copied'));else toast(t('toast.saveFail'))});
  on('tfs',()=>{if(TF.src==='gharib')TF.src=S.quran.tfsSrc&&S.quran.tfsSrc!=='gharib'?S.quran.tfsSrc:'baghawi';openTafsir(s,a)});
  on('gh',()=>{TF.word=word||'';TF.src='gharib';openTafsir(s,a)});
  on('play',()=>qPlayFrom(s,a));on('note',()=>qAyahNote(s,a));on('board',()=>wbAddAyah(s,a));
  const mb=p.querySelector('[data-x=mark]');mb.onclick=()=>qMarkPop(s,a,x,y);
  on('share',()=>{const tx=txt();if(ANDROID){try{window.ThabatAndroid.share(qSurahName(s)+' '+a,tx)}catch(e){}}else navigator.share({text:tx}).catch(()=>{})})}
async function qPageAyahMenu(pg,x,y){const pop=qPopAt(`<div class="aymh">${t('q.pageAyahs',pg)}</div><div class="aylist"><div class="spin" style="margin:12px auto"></div></div>`,x,y,'aymenu aypage');
  try{await qLoadPack('hafs')}catch(e){pop.querySelector('.aylist').innerHTML=`<small>${t('q.loadFail','')}</small>`;return}
  const g=QB.hafs.pages[pg],seen=new Set(),list=g.ay.filter(v=>{const k=v.s+':'+v.a;if(seen.has(k))return false;seen.add(k);return true});
  const L_=pop.querySelector('.aylist');if(!L_)return;L_.innerHTML=list.map(v=>`<button data-k="${v.s}:${v.a}"><span class="ayn">${v.a}</span><span dir="rtl">${esc(v.w.slice(0,6).join(' '))}…</span></button>`).join('');
  L_.querySelectorAll('[data-k]').forEach(b=>b.onclick=e=>{const [s,a]=b.dataset.k.split(':').map(Number);qAyahMenu(s,a,x,y)})}
/* tafsir sheet */
let TF={s:1,a:1,n:0,from:1,to:1,src:'baghawi',word:''};
function tfsRes(arr,a){const v=arr[a-1],from=typeof v==='number'?v:a;let to=from;while(to<arr.length&&arr[to]===from)to++;return{from,to,text:arr[from-1]||''}}
function tfsFmt(tx,src){const L_=String(tx||'').split(/\n+/).filter(l=>l.trim());
  return L_.map(l=>`<p${src==='gharib'?' class="gh"':''}>`+esc(l).replace(/\[\[([\s\S]*?)\]\]/g,'<span class="tfn" title="$1">[*]<span>$1</span></span>').replace(/﴿([^﴾]*)﴾/g,'<q class="tfq">﴿$1﴾</q>').replace(/\{([^{}]{2,120})\}/g,'<q class="tfq">{$1}</q>')+'</p>').join('')}
async function openTafsir(s,a){if(!TF.src||!TFS_SRC.some(x=>x[0]===TF.src))TF.src=S.quran.tfsSrc||'baghawi';TF.s=s;TF.a=a;$('#tfsSheet').classList.add('on');await renderTafsir()}
async function renderTafsir(){const {s,a,src}=TF,body=$('#tfsBody');$('#tfsT').textContent=`${qSurahName(s)} · ${t('q.ayahN',a)}`;$('#tfsSub').textContent=tfsName(src);
  $('#tfsSeg').innerHTML=TFS_SRC.map(([k])=>`<button data-s="${k}" class="${k===src?'on':''}">${tfsName(k)}</button>`).join('');
  $$('#tfsSeg button').forEach(b=>b.onclick=()=>{TF.src=b.dataset.s;if(TF.src!=='gharib'){S.quran.tfsSrc=TF.src;save()}TF.a=TF.from||TF.a;renderTafsir()});
  body.style.fontSize=(S.tfsFs||17)+'px';body.innerHTML=`<div class="qload"><div class="spin"></div>${t('q.tfsLoading')}</div>`;
  let arr;try{arr=await tfsGet(s,src)}catch(e){body.innerHTML=`<div class="empty">${t('q.tfsFail')}</div>`;return}
  if(TF.s!==s||TF.a!==a||TF.src!==src)return;TF.n=arr.length;const G=tfsRes(arr,a);TF.from=G.from;TF.to=G.to;
  if(G.to>G.from)$('#tfsT').textContent=`${qSurahName(s)} · ${t('q.ayahsN',G.from,G.to)}`;
  try{if(!QB.hafs)await qLoadPack('hafs')}catch(e){}
  const ats=[];for(let i=G.from;i<=G.to;i++){const x=qAyahText(s,i,'hafs');if(x)ats.push(x)}
  body.innerHTML=`${ats.length?`<div class="tfsay" dir="rtl">${esc(ats.join(' '))}</div>`:''}<div class="tfstx ${src}" dir="rtl">${tfsFmt(G.text,src)||`<div class="empty">${t('q.tfsNone')}</div>`}</div><div class="tfsfoot">${t('tfs.src.'+src)}</div>`;
  body.scrollTop=0;$('#tfsPrev').disabled=s===1&&G.from===1;$('#tfsNext').disabled=s===114&&G.to>=TF.n;
  body.querySelectorAll('.tfn').forEach(n=>n.onclick=()=>n.classList.toggle('open'));
  if(src==='gharib'&&TF.word){const w=qNorm(TF.word)[0].replace(/\s+/g,'');if(w.length>1){const hit=[...body.querySelectorAll('p.gh')].find(pp=>{const q=pp.querySelector('.tfq');if(!q)return false;const n=qNorm(q.textContent)[0].replace(/\s+/g,'');return n&&(n.includes(w)||w.includes(n))});if(hit){hit.classList.add('hit');setTimeout(()=>hit.scrollIntoView({block:'center',behavior:'smooth'}),60)}}TF.word=''}
  if(src!=='gharib')qTfsTrack()}
async function tfsStep(d){let s=TF.s,a=d>0?TF.to+1:TF.from-1;if(a<1){if(s===1)return;s--;const arr=await tfsGet(s,TF.src).catch(()=>null);a=arr?arr.length:1}else if(TF.n&&a>TF.n){if(s===114)return;s++;a=1}TF.s=s;TF.a=a;renderTafsir()}
function tfsCopy(){const s=TF.s,arr=(TFS[TF.src]||{})[s];if(!arr)return;const G=tfsRes(arr,TF.a);const tx=`${qSurahName(s)} ${G.from}${G.to>G.from?'–'+G.to:''} — ${tfsName(TF.src)}\n\n`+String(G.text).replace(/\[\[[\s\S]*?\]\]/g,'').replace(/[ \t]+/g,' ');qCopyText(tx).then(ok=>toast(t(ok?'q.copied':'toast.saveFail')))}
function tfsFont(d){S.tfsFs=Math.max(13,Math.min(28,(S.tfsFs||17)+d));save();$('#tfsBody').style.fontSize=S.tfsFs+'px'}
$('#tfsClose').onclick=()=>$('#tfsSheet').classList.remove('on');$('#tfsSheet').onclick=e=>{if(e.target.id==='tfsSheet')$('#tfsSheet').classList.remove('on')};
$('#tfsPrev').onclick=()=>tfsStep(-1);$('#tfsNext').onclick=()=>tfsStep(1);$('#tfsCopy').onclick=tfsCopy;$('#tfsAm').onclick=()=>tfsFont(-1);$('#tfsAp').onclick=()=>tfsFont(1);
$('#tfsNote').onclick=()=>{$('#tfsSheet').classList.remove('on');qAyahNote(TF.s,TF.from)};
$('#tfsBoard').onclick=()=>{const arr=(TFS[TF.src]||{})[TF.s];wbAddAyah(TF.s,TF.from,arr?tfsRes(arr,TF.from).text:'')};
$('#tfsPlay').onclick=()=>qPlayFrom(TF.s,TF.from,'ayah');
document.addEventListener('keydown',e=>{if(!$('#tfsSheet').classList.contains('on'))return;const rtl=document.documentElement.dir==='rtl';if(e.key==='Escape')$('#tfsSheet').classList.remove('on');
  else if(e.key==='ArrowLeft'){e.preventDefault();tfsStep(rtl?1:-1)}else if(e.key==='ArrowRight'){e.preventDefault();tfsStep(rtl?-1:1)}});
/* word/page interaction: click on PC, long-press on phone; in hide mode a tap reveals the ayah */
{const sp=$('#spread');let lp=null;const touchy=()=>matchMedia('(hover:none)').matches;
  const target=el=>{const w=el.closest&&el.closest('.ml span[data-k]');if(w)return{w};const qi=el.closest&&el.closest('.qimg');if(qi&&!qi.querySelector('.mp,.qload')&&!el.closest('button')){const b=qi.closest('.qpage')&&qi.closest('.qpage').querySelector('[data-bm]');if(b)return{pg:+b.dataset.bm}}return null};
  const fire=(tg,x,y)=>{if(tg.w){const [s,a]=tg.w.dataset.k.split(':').map(Number);qAyahMenu(s,a,x,y,tg.w.textContent)}else qPageAyahMenu(tg.pg,x,y)};
  sp.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse')return;const tg=target(e.target);if(!tg)return;const x=e.clientX,y=e.clientY;if(lp)clearTimeout(lp.t);
    lp={x,y,fired:false,t:setTimeout(()=>{lp.fired=true;window._ppGuard=Infinity;vib(18);fire(tg,x,y)},480)}});
  sp.addEventListener('pointermove',e=>{if(lp&&!lp.fired&&Math.hypot(e.clientX-lp.x,e.clientY-lp.y)>10){clearTimeout(lp.t);lp=null}});
  ['pointerup','pointercancel'].forEach(ev=>sp.addEventListener(ev,()=>{if(lp&&lp.fired)window._ppGuard=Date.now()+600;if(lp&&!lp.fired){clearTimeout(lp.t);lp=null}}));
  sp.addEventListener('contextmenu',e=>{if(target(e.target)&&(touchy()||lp))e.preventDefault()});
  sp.addEventListener('click',e=>{if(lp&&lp.fired){lp=null;e.stopPropagation();return}const tg=target(e.target);if(!tg)return;
    if(S.quran.hide&&tg.w&&!qRev.has(tg.w.dataset.k)){e.stopPropagation();const k=tg.w.dataset.k;qRev.add(k);$$(`#spread span[data-k="${k}"]`).forEach(x=>x.classList.add('rev'));vib(10);return}
    if(touchy())return;const sel=getSelection();if(sel&&!sel.isCollapsed&&sel.toString().trim())return;e.stopPropagation();fire(tg,e.clientX,e.clientY)})}
$('#qTfsBtn').onclick=e=>{const L_=S.quran.tfsLast,btn=e.currentTarget;wbMenu(btn,[['📖 '+t('q.tfsPage'),()=>qTfsForPage(S.quran.pv||S.quran.view||1)],...(L_?[['↩ '+t('q.tfsCont',qSurahName(L_.s),L_.a),()=>{TF.src=L_.src||TF.src;openTafsir(L_.s,L_.a)}]]:[])])};
$('#qHideBtn').onclick=()=>qHideSet(!S.quran.hide);$('#qHideAll').onclick=()=>{const all=[...new Set($$('#spread span[data-k]').map(x=>x.dataset.k))];const allRev=all.every(k=>qRev.has(k));if(allRev){qRev.clear()}else all.forEach(k=>qRev.add(k));qApplyMarks()};
$('#qListenBtn').onclick=async()=>{try{await qLoadPack('hafs')}catch(e){}const f=qPageAyat(S.quran.pv||S.quran.view||1)[0];if(f)qPlayFrom(f[0],f[1])};
$('#qSearchBtn').onclick=qSearchOpen;

