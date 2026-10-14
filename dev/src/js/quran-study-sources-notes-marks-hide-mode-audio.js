/* ============ quran study: sources, notes, marks, hide mode, audio, search ============ */
const TFS_SRC=[['baghawi','ar-tafsir-al-baghawi'],['saadi','ar-tafsir-as-saadi'],['muyassar','ar-tafsir-muyassar'],['jalalayn','ar-tafsir-al-jalalayn'],['ibnkathir','ar-tafsir-ibn-kathir'],['gharib','al-muyassar-fi-al-gharib']];
const tfsSlug=k=>(TFS_SRC.find(x=>x[0]===k)||TFS_SRC[0])[1];
function tfsName(k){return t('tfs.'+k)}
/* ---- ayah index from the Hafs pack ---- */
let QIX=null;
async function qIndex(){if(QIX)return QIX;await qLoadPack('hafs');const B=QB.hafs,map={},list=[];
  for(let p=1;p<=604;p++){const g=B.pages[p];if(!g)continue;for(const x of g.ay){const k=x.s+':'+x.a;let o=map[k];if(!o){o=map[k]={s:x.s,a:x.a,p,w:[]};list.push(o)}o.w.push(...x.w)}}
  list.forEach(o=>{o.raw=o.w.join(' ');const n=qNorm(o.raw);o.n1=n[0];o.n2=n[1]});QIX={map,list};return QIX}
function qPageOf(s,a){if(QIX&&QIX.map[s+':'+a])return QIX.map[s+':'+a].p;const B=QB.hafs;if(!B)return QS[s-1][2];for(let p=QS[s-1][2];p<=604;p++){if(B.pages[p].ay.some(x=>x.s===s&&x.a===a))return p}return QS[s-1][2]}
function qPageAyat(p){const B=QB.hafs;if(!B||!B.pages[p])return[];const seen=new Set();return B.pages[p].ay.filter(x=>{const k=x.s+':'+x.a;if(seen.has(k))return false;seen.add(k);return true}).map(x=>[x.s,x.a])}
/* normalisation for search: two variants (dagger alef dropped / as alef) */
function qNorm(s){const base=String(s).replace(/[٠-٩۰-۹]+/g,' ').replace(/[ؐ-ًؚ-ٟۖ-ۭـࣰ-ࣿ]/g,'').replace(/[ٱأإآ]/g,'ا').replace(/ى/g,'ي').replace(/ؤ/g,'و').replace(/ئ/g,'ي').replace(/ة/g,'ه').replace(/ـ/g,'').replace(/[^ء-يٰ\s]/g,' ').replace(/\s+/g,' ').trim();
  return[base.replace(/ٰ/g,''),base.replace(/ٰ/g,'ا')]}
/* ---- marks & notes decorations ---- */
const QMK={hifz:'#35c07a',rev:'#f2a93b',fav:'#e0567a',tdb:'#4a90e2'};
function qMarks(){return S.quran.marks||(S.quran.marks={})}
function qApplyMarks(root){const M=qMarks(),N=new Set(NOTES().filter(n=>n.ay).map(n=>n.ay)),rev=qRev;(root||document).querySelectorAll('#spread span[data-k]').forEach(sp=>{const k=sp.dataset.k,m=M[k];
  sp.className=(m?'mk mk-'+m:'')+(N.has(k)?' hn':'')+(rev.has(k)?' rev':'')})}
function qMarkPop(s,a,x,y){const k=s+':'+a,cur=qMarks()[k];const p=qPopAt(`<div class="aymh">${t('q.markT')}</div>${Object.keys(QMK).map(m=>`<button data-m="${m}" class="${cur===m?'on':''}"><i class="mkdot" style="background:${QMK[m]}"></i>${t('q.mk.'+m)}</button>`).join('')}${cur?`<button data-m="">✕ ${t('q.mkDel')}</button>`:''}`,x,y,'aymenu');
  p.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{closePP();const m=b.dataset.m;if(m)qMarks()[k]=m;else delete qMarks()[k];save();qApplyMarks();renderQStudy()})}
function qMarksList(){const M=qMarks(),ks=Object.keys(M).map(k=>k.split(':').map(Number)).sort((x,y)=>x[0]-y[0]||x[1]-y[1]);
  $('#ltBox').innerHTML=`<h2>🎨 ${t('q.marksT')}</h2>${ks.length?Object.keys(QMK).map(m=>{const L_=ks.filter(([s,a])=>M[s+':'+a]===m);return L_.length?`<b class="wblh"><i class="mkdot" style="background:${QMK[m]}"></i> ${t('q.mk.'+m)} (${L_.length})</b><div class="wbpick">${L_.map(([s,a])=>`<button class="suitem" data-k="${s}:${a}"><b>${esc(qSurahName(s))} ${a}</b><small dir="rtl" class="qtxs">${esc((qAyahText(s,a,'hafs')||'').slice(0,90))}</small></button>`).join('')}</div>`:''}).join(''):`<div class="empty">${t('q.marksNone')}</div>`}<div class="ltact"><button class="btn ghost" id="qMkX">${t('d.close')}</button></div>`;
  $('#ltModal').classList.add('on');$('#qMkX').onclick=closeLt;$$('#ltBox [data-k]').forEach(b=>b.onclick=()=>{closeLt();const [s,a]=b.dataset.k.split(':').map(Number);qGoAyah(s,a)})}
function qGoAyah(s,a){const p=qPageOf(s,a);showView('quran');qShow(p);setTimeout(()=>qHl(s,a),350);setTimeout(()=>qHl(s,a),900)}
/* ---- tadabbur notes ---- */
function qAyahNote(s,a){const k=s+':'+a,n=NOTES().find(x=>x.ay===k);if(n){openNote(n.id);return}openNote(null,todayKey());NE.title=t('q.tdbTitle',qSurahName(s),a);NE.body=(qAyahText(s,a,'hafs')||'')+'\n\n';NE.ay=k;renderNoteEd()}
/* ---- whiteboard ayah card ---- */
function wbAddAyah(s,a,tfs){const b=board();wbMigrate(b);const v=b.view||{x:40,y:40,z:1},cx=(-v.x+500)/v.z,cy=(-v.y+300)/v.z,text=qAyahText(s,a,'hafs')||'',ex=tfs?String(tfs).replace(/\[\[[\s\S]*?\]\]/g,'').replace(/\s+/g,' ').trim().slice(0,420):'';
  const h=Math.round(80+Math.ceil(text.length/30)*34+(ex?Math.ceil(ex.length/42)*24+16:0));const e={id:uid(),type:'ayah',s,a,text,tfs:ex||undefined,src:tfs?TF.src:undefined,x:cx-170,y:cy-h/2,w:340,h};
  wbEls().push(wbNudge(e));save();if(curView()==='boards'&&nbMode==='boards')wbRender();toast(t('q.toBoardDone',boardName(b)))}
/* ---- hide (recitation test) mode ---- */
const qRev=new Set();
function qHideSet(on){S.quran.hide=!!on;qRev.clear();save();$('#mushaf').classList.toggle('hidetest',!!on);qApplyMarks();qToolbarState();if(on)toast(t('q.hideOn'))}
function qToolbarState(){const on=!!S.quran.hide;$('#qHideBtn').classList.toggle('on',on);$('#qHideBtn').textContent=on?t('q.hideOff'):t('q.hideBtn');$('#qHideAll').hidden=!on}
/* ---- audio ---- */
const RECITERS=[['Husary_Muallim_128kbps','r.husaryM'],['Husary_128kbps','r.husary'],['Minshawy_Murattal_128kbps','r.minshawi'],['Alafasy_128kbps','r.alafasy'],['Abdul_Basit_Murattal_192kbps','r.basit'],['Maher_AlMuaiqly_64kbps','r.maher'],['Yasser_Ad-Dussary_128kbps','r.yasser'],['Abdurrahmaan_As-Sudais_192kbps','r.sudais'],['Saood_ash-Shuraym_128kbps','r.shuraym'],['Ghamadi_40kbps','r.ghamdi'],['Hudhaify_128kbps','r.hudhaify'],['warsh/warsh_ibrahim_aldosary_128kbps','r.wIbrahim'],['warsh/warsh_yassin_al_jazaery_64kbps','r.wYassin']];
const QA={q:[],i:0,rep:0,el:null,playing:false};
function qAud(){return S.quran.aud||(S.quran.aud={r:'Husary_Muallim_128kbps',rep:1,scope:'page'})}
const qAyUrl=(s,a)=>`https://everyayah.com/data/${qAud().r}/${String(s).padStart(3,'0')}${String(a).padStart(3,'0')}.mp3`;
async function qPlayFrom(s,a,scope){try{await qIndex()}catch(e){toast(t('q.tfsFail'));return}const A=qAud();if(scope)A.scope=scope;const L_=QIX.list,i0=L_.findIndex(o=>o.s===s&&o.a===a);if(i0<0)return;let q=[];
  if(A.scope==='ayah')q=[L_[i0]];else if(A.scope==='page')q=L_.filter((o,i)=>i>=i0&&o.p===L_[i0].p);else q=L_.filter((o,i)=>i>=i0&&o.s===s);
  QA.q=q.map(o=>[o.s,o.a,o.p]);QA.i=0;QA.rep=0;$('#qPlayer').hidden=false;qPlayCur()}
function qPlayCur(){const it=QA.q[QA.i];if(!it){qStop(true);return}const [s,a,p]=it;if(!QA.el){QA.el=new Audio();QA.el.onended=qNextAud;QA.el.onerror=()=>{toast(t('q.audErr'));qStop()}}
  qSrc(s,a).then(u=>{if(QA.q[QA.i]!==it)return;QA.el.src=u;QA.el.play().then(()=>{QA.playing=true;qPlayerUI()}).catch(()=>{QA.playing=false;qPlayerUI()})});
  const Q=S.quran,cur=MOB.matches?(Q.pv||Q.view):(Q.view||1);const vis=MOB.matches?[cur]:[cur,cur+1];if(!vis.includes(p))qShow(p);setTimeout(()=>qHl(s,a),vis.includes(p)?0:450);
  const nx=QA.q[QA.i+1];if(nx){if(!audHas(qAud().r,nx[0])){const pre=new Audio();pre.preload='auto';pre.src=qAyUrl(nx[0],nx[1])}}qPlayerUI()}
function qNextAud(){const A=qAud();QA.rep++;if(QA.rep<(A.rep||1)){QA.el.currentTime=0;QA.el.play();qPlayerUI();return}QA.rep=0;QA.i++;if(QA.i>=QA.q.length){if(A.loop){QA.i=0}else{qStop(true);return}}qPlayCur()}
function qStop(done){if(QA.el){QA.el.pause()}QA.playing=false;qPlayerUI();if(done){qHl();toast(t('q.audDone'))}}
function qPlayerUI(){const b=$('#qPlayer');if(!b||b.hidden)return;const A=qAud(),it=QA.q[QA.i];
  b.innerHTML=`<button class="qpb" data-p="prev" title="${t('q.prevAyah')}">⏮</button><button class="qpb big" data-p="tog">${QA.playing?'⏸':'▶'}</button><button class="qpb" data-p="next" title="${t('q.nextAyah')}">⏭</button>
   <span class="qpinfo">${it?`${esc(qSurahName(it[0]))} ${it[1]}${(A.rep||1)>1?` · ${QA.rep+1}/${A.rep}`:''}`:''}</span>
   <select class="in" id="qpRec">${RECITERS.map(([f,k])=>`<option value="${f}" ${A.r===f?'selected':''}>${t(k)}</option>`).join('')}</select>
   <select class="in" id="qpScope">${['ayah','page','surah'].map(s=>`<option value="${s}" ${A.scope===s?'selected':''}>${t('q.sc.'+s)}</option>`).join('')}</select>
   <select class="in" id="qpRep" title="${t('q.repT')}">${[1,2,3,5,7,10,20].map(n=>`<option value="${n}" ${(A.rep||1)===n?'selected':''}>🔁 ×${n}</option>`).join('')}</select>
   <select class="in" id="qpRate" title="${t('q.rate')}">${[0.75,1,1.25,1.5,1.75,2].map(n=>`<option value="${n}" ${(A.rate||1)===n?'selected':''}>${n}×</option>`).join('')}</select><button class="qpb sm ${A.cmp?'on':''}" data-p="cmp" title="${esc(t('cmp.t'))}">⇄${A.cmp?' '+esc(t((RECITERS.find(x=>x[0]===A.cmp)||[0,''])[1])).split(' ')[0]:''}</button>${qDlBtn(it)}<button class="qpb ${A.loop?'on':''}" data-p="loop" title="${t('q.loopT')}">∞</button><button class="qpb" data-p="x" title="${t('d.close')}">✕</button>`;
  b.querySelectorAll('[data-p]').forEach(x=>x.onclick=()=>{const p=x.dataset.p;if(p==='tog'){if(QA.playing){QA.el.pause();QA.playing=false;qPlayerUI()}else if(QA.el&&QA.el.src){QA.el.play().then(()=>{QA.playing=true;qPlayerUI()})}else{const pg=S.quran.pv||S.quran.view||1;const f=qPageAyat(pg)[0];if(f)qPlayFrom(f[0],f[1])}}
    if(p==='next'&&QA.q.length){QA.rep=0;QA.i=Math.min(QA.q.length-1,QA.i+1);qPlayCur()}if(p==='prev'&&QA.q.length){QA.rep=0;QA.i=Math.max(0,QA.i-1);qPlayCur()}
    if(p==='cmp'){qCmpPick(x);return}if(p==='dl'){if(it&&!audHas(qAud().r,it[0])&&!AUDJOB)audDownload(it[0]);else openAudDl()}if(p==='loop'){A.loop=!A.loop;save();qPlayerUI()}if(p==='x'){qStop();$('#qPlayer').hidden=true;qHl()}});
  $('#qpRec').onchange=e=>{A.r=e.target.value;save();if(QA.q.length){QA.rep=0;qPlayCur()}};$('#qpScope').onchange=e=>{A.scope=e.target.value;save();const it2=QA.q[QA.i];if(it2)qPlayFrom(it2[0],it2[1])};$('#qpRep').onchange=e=>{A.rep=+e.target.value;save();qPlayerUI()}}
/* ---- search ---- */
async function qSearchOpen(){$('#ltBox').innerHTML=`<h2>🔍 ${t('q.searchT')}</h2><input class="in" id="qSrch" dir="rtl" placeholder="${t('q.searchPh')}" style="width:100%;margin:6px 0 10px"><div class="qsres" id="qSres"><div class="empty">${t('q.searchHint')}</div></div><div class="ltact"><button class="btn ghost" id="qSX">${t('d.close')}</button></div>`;
  $('#ltModal').classList.add('on');$('#qSX').onclick=closeLt;const inp=$('#qSrch');inp.focus();try{await qIndex()}catch(e){$('#qSres').innerHTML=`<div class="empty">${t('q.tfsFail')}</div>`;return}
  let tm;inp.oninput=()=>{clearTimeout(tm);tm=setTimeout(()=>qSearchRun(inp.value),160)};if(inp.value)qSearchRun(inp.value)}
function qSearchRun(v){const box=$('#qSres');if(!box)return;const q=qNorm(v)[0];if(q.length<2){box.innerHTML=`<div class="empty">${t('q.searchHint')}</div>`;return}
  const hits=QIX.list.filter(o=>o.n1.includes(q)||o.n2.includes(q));
  box.innerHTML=`<div class="qscount">${t('q.searchN',hits.length)}</div>`+hits.slice(0,150).map(o=>`<button class="suitem qsr" data-k="${o.s}:${o.a}"><b>${esc(qSurahName(o.s))} ${o.a} <small>· ${t('q.page')} ${o.p}</small></b><span class="qtxs" dir="rtl">${esc(o.raw.length>180?o.raw.slice(0,180)+'…':o.raw)}</span></button>`).join('');
  box.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{closeLt();const [s,a]=b.dataset.k.split(':').map(Number);qGoAyah(s,a)})}
/* ---- study card: tafsir wird, hifz queue, marks ---- */
function qTfsDay(){const d=day(todayKey());return d.tfsK||(d.tfsK=[])}
function renderQStudy(){const box=$('#qStudy');if(!box)return;const Q=S.quran,goal=Q.tfsGoal||10,got=qTfsDay().length,L_=Q.tfsLast,queue=(Q.tfsQ||[]).filter(p=>Q.memorized.includes(p)),nm=Object.keys(qMarks()).length;
  box.innerHTML=`<h3><span>📖 ${t('q.studyT')}</span></h3>
   <div class="qst"><div class="qstl"><span>${t('q.tfsWird')}</span><b>${Math.min(got,999)} / ${goal}</b></div><div class="minibar"><i style="width:${Math.min(100,got/goal*100)}%"></i></div></div>
   <div class="row" style="flex-wrap:wrap;gap:6px;margin-top:10px">${L_?`<button class="btn sm pri" id="qsCont">↩ ${t('q.tfsCont',qSurahName(L_.s),L_.a)}</button>`:''}<button class="btn sm" id="qsPage">📖 ${t('q.tfsPage')}</button><button class="btn sm ghost" id="qsGoal">🎯 ${t('q.tfsGoalBtn')}</button></div>
   ${queue.length?`<div class="qsq"><div><b>📚 ${t('q.hifzTfs')}</b><small>${t('q.hifzTfsSub',queue[0],queue.length)}</small></div><div class="row"><button class="btn sm" id="qsQGo">${t('q.read')}</button><button class="btn sm ghost" id="qsQDone">✓</button></div></div>`:''}
   <div class="row" style="margin-top:10px;gap:6px;flex-wrap:wrap"><button class="btn sm ghost" id="qsMarks">🎨 ${t('q.marksT')} (${nm})</button><button class="btn sm ghost" id="qsSearch">🔍 ${t('q.searchT')}</button><button class="btn sm ghost" id="qsDua">🤲 ${t('kd.t')}</button></div>`;
  const c=$('#qsCont');if(c)c.onclick=()=>{TF.src=L_.src||TF.src;openTafsir(L_.s,L_.a)};
  $('#qsPage').onclick=()=>qTfsForPage(S.quran.pv||S.quran.view||1);$('#qsMarks').onclick=qMarksList;$('#qsSearch').onclick=qSearchOpen;
  $('#qsGoal').onclick=()=>{const v=prompt(t('q.tfsGoalQ'),goal);if(v&&+v>0){Q.tfsGoal=Math.round(+v);save();renderQStudy()}};
  const qg=$('#qsQGo');if(qg)qg.onclick=()=>qTfsForPage(queue[0]);const qd=$('#qsQDone');if(qd)qd.onclick=()=>{Q.tfsQ=(Q.tfsQ||[]).filter(p=>p!==queue[0]);save();renderQStudy()}}
async function qTfsForPage(p){try{await qLoadPack('hafs')}catch(e){}const f=qPageAyat(p)[0];if(f)openTafsir(f[0],f[1])}
function qTfsTrack(){const Q=S.quran,k=TF.s+':'+TF.from,d=qTfsDay();Q.tfsLast={s:TF.s,a:TF.from,src:TF.src};if(!d.includes(k)){for(let a=TF.from;a<=TF.to;a++){const kk=TF.s+':'+a;if(!d.includes(kk))d.push(kk)}}
  if(Q.tfsQ&&Q.tfsQ.length&&QB.hafs){Q.tfsQ=Q.tfsQ.filter(p=>{const ay=qPageAyat(p),last=ay[ay.length-1];return!(last&&last[0]===TF.s&&TF.to>=last[1]&&TF.from<=last[1])})}save();renderQStudy()}
