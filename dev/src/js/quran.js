/* ============ quran ============ */
const ICON_BOOK='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 5h6a4 4 0 0 1 4 4v11a3 3 0 0 0-3-3H2zM22 5h-6a4 4 0 0 0-4 4v11a3 3 0 0 1 3-3h7z"/></svg>';
/* Madani 604-page layout (same page breaks in the KFGQPC Hafs/Qalun/Warsh/al-Susi mushafs). Sources: quran.com API + KFGQPC data */
const QS=[["الفاتحة","Al-Fatihah",1,1],["البقرة","Al-Baqarah",2,49],["آل عمران","Ali 'Imran",50,76],["النساء","An-Nisa",77,106],["المائدة","Al-Ma'idah",106,127],["الأنعام","Al-An'am",128,150],["الأعراف","Al-A'raf",151,176],["الأنفال","Al-Anfal",177,186],["التوبة","At-Tawbah",187,207],["يونس","Yunus",208,221],["هود","Hud",221,235],["يوسف","Yusuf",235,248],["الرعد","Ar-Ra'd",249,255],["إبراهيم","Ibrahim",255,261],["الحجر","Al-Hijr",262,267],["النحل","An-Nahl",267,281],["الإسراء","Al-Isra",282,293],["الكهف","Al-Kahf",293,304],["مريم","Maryam",305,312],["طه","Taha",312,321],["الأنبياء","Al-Anbya",322,331],["الحج","Al-Hajj",332,341],["المؤمنون","Al-Mu'minun",342,349],["النور","An-Nur",350,359],["الفرقان","Al-Furqan",359,366],["الشعراء","Ash-Shu'ara",367,376],["النمل","An-Naml",377,385],["القصص","Al-Qasas",385,396],["العنكبوت","Al-'Ankabut",396,404],["الروم","Ar-Rum",404,410],["لقمان","Luqman",411,414],["السجدة","As-Sajdah",415,417],["الأحزاب","Al-Ahzab",418,427],["سبأ","Saba",428,434],["فاطر","Fatir",434,440],["يس","Ya-Sin",440,445],["الصافات","As-Saffat",446,452],["ص","Sad",453,458],["الزمر","Az-Zumar",458,467],["غافر","Ghafir",467,476],["فصلت","Fussilat",477,482],["الشورى","Ash-Shuraa",483,489],["الزخرف","Az-Zukhruf",489,495],["الدخان","Ad-Dukhan",496,498],["الجاثية","Al-Jathiyah",499,502],["الأحقاف","Al-Ahqaf",502,506],["محمد","Muhammad",507,510],["الفتح","Al-Fath",511,515],["الحجرات","Al-Hujurat",515,517],["ق","Qaf",518,520],["الذاريات","Adh-Dhariyat",520,523],["الطور","At-Tur",523,525],["النجم","An-Najm",526,528],["القمر","Al-Qamar",528,531],["الرحمن","Ar-Rahman",531,534],["الواقعة","Al-Waqi'ah",534,537],["الحديد","Al-Hadid",537,541],["المجادلة","Al-Mujadila",542,545],["الحشر","Al-Hashr",545,548],["الممتحنة","Al-Mumtahanah",549,551],["الصف","As-Saf",551,552],["الجمعة","Al-Jumu'ah",553,554],["المنافقون","Al-Munafiqun",554,555],["التغابن","At-Taghabun",556,557],["الطلاق","At-Talaq",558,559],["التحريم","At-Tahrim",560,561],["الملك","Al-Mulk",562,564],["القلم","Al-Qalam",564,566],["الحاقة","Al-Haqqah",566,568],["المعارج","Al-Ma'arij",568,570],["نوح","Nuh",570,571],["الجن","Al-Jinn",572,573],["المزمل","Al-Muzzammil",574,575],["المدثر","Al-Muddaththir",575,577],["القيامة","Al-Qiyamah",577,578],["الإنسان","Al-Insan",578,580],["المرسلات","Al-Mursalat",580,581],["النبأ","An-Naba",582,583],["النازعات","An-Nazi'at",583,584],["عبس","'Abasa",585,586],["التكوير","At-Takwir",586,586],["الانفطار","Al-Infitar",587,587],["المطففين","Al-Mutaffifin",587,589],["الانشقاق","Al-Inshiqaq",589,590],["البروج","Al-Buruj",590,590],["الطارق","At-Tariq",591,591],["الأعلى","Al-A'la",591,592],["الغاشية","Al-Ghashiyah",592,593],["الفجر","Al-Fajr",593,594],["البلد","Al-Balad",594,595],["الشمس","Ash-Shams",595,595],["الليل","Al-Layl",595,596],["الضحى","Ad-Duhaa",596,596],["الشرح","Ash-Sharh",596,597],["التين","At-Tin",597,597],["العلق","Al-'Alaq",597,598],["القدر","Al-Qadr",598,598],["البينة","Al-Bayyinah",598,599],["الزلزلة","Az-Zalzalah",599,599],["العاديات","Al-'Adiyat",599,600],["القارعة","Al-Qari'ah",600,600],["التكاثر","At-Takathur",600,600],["العصر","Al-'Asr",601,601],["الهمزة","Al-Humazah",601,601],["الفيل","Al-Fil",601,601],["قريش","Quraysh",602,602],["الماعون","Al-Ma'un",602,602],["الكوثر","Al-Kawthar",602,602],["الكافرون","Al-Kafirun",603,603],["النصر","An-Nasr",603,603],["المسد","Al-Masad",603,603],["الإخلاص","Al-Ikhlas",604,604],["الفلق","Al-Falaq",604,604],["الناس","An-Nas",604,604]]; /* [arabic, english, startPage, endPage] */
const QJ=[1, 22, 42, 62, 82, 102, 121, 142, 162, 182, 201, 222, 242, 262, 282, 302, 322, 342, 362, 382, 402, 422, 442, 462, 482, 502, 522, 542, 562, 582], QJE=[21, 41, 61, 81, 101, 121, 141, 161, 181, 201, 221, 241, 261, 281, 301, 321, 341, 361, 381, 401, 421, 441, 461, 481, 502, 521, 541, 561, 581, 604], QR=[1, 5, 7, 9, 11, 14, 17, 19, 22, 24, 27, 29, 32, 34, 37, 39, 42, 44, 46, 49, 51, 54, 56, 59, 62, 64, 67, 69, 72, 74, 77, 79, 82, 84, 87, 89, 92, 94, 97, 100, 102, 104, 106, 109, 112, 114, 117, 119, 121, 124, 126, 129, 132, 134, 137, 140, 142, 144, 146, 148, 151, 154, 156, 158, 162, 164, 167, 170, 173, 175, 177, 179, 182, 184, 187, 189, 192, 194, 196, 199, 201, 204, 206, 209, 212, 214, 217, 219, 222, 224, 226, 228, 231, 233, 236, 238, 242, 244, 247, 249, 252, 254, 256, 259, 262, 264, 267, 270, 272, 275, 277, 280, 282, 284, 287, 289, 292, 295, 297, 299, 302, 304, 306, 309, 312, 315, 317, 319, 322, 324, 326, 329, 332, 334, 336, 339, 342, 344, 347, 350, 352, 354, 356, 359, 362, 364, 367, 369, 371, 374, 377, 379, 382, 384, 386, 389, 392, 394, 396, 399, 402, 404, 407, 410, 413, 415, 418, 420, 422, 425, 426, 429, 431, 433, 436, 439, 442, 444, 446, 449, 451, 454, 456, 459, 462, 464, 467, 469, 472, 474, 477, 479, 482, 484, 486, 488, 491, 493, 496, 499, 502, 505, 507, 510, 513, 515, 517, 519, 522, 524, 526, 529, 531, 534, 536, 539, 542, 544, 547, 550, 553, 554, 558, 560, 562, 564, 566, 569, 572, 575, 577, 579, 582, 585, 587, 589, 591, 594, 596, 599]; /* juz starts, juz ends, rub' al-hizb starts (240) */
const QCDN='https://cdn.jsdelivr.net/gh/thetruetruth/quran-data-kfgqpc@281dbbe8eed1370daa5a023b6cd81655cbfd6473/';
const RIWAYAT={
  hafs:{ar:'حفص عن عاصم',en:'Hafs ʿan ʿAsim',kind:'text',dir:'hafs',data:'hafsData_v18.json',font:'hafs.18.woff2'},
  qaloon:{ar:'قالون عن نافع المدني',en:'Qalun ʿan Nafiʿ',kind:'text',dir:'qaloon',data:'QaloonData_v10.json',font:'qaloon.10.woff2'},
  warsh:{ar:'ورش عن نافع المدني',en:'Warsh ʿan Nafiʿ',kind:'text',dir:'warsh',data:'warshData_v10.json',font:'warsh.10.woff2'},
  soosi:{ar:'السوسي عن أبي عمرو',en:'al-Susi ʿan Abi ʿAmr',kind:'text',dir:'soosi',data:'SoosiData09.json',font:'soosi.9.woff2'},
  khalaf:{ar:'خلف عن حمزة (صور)',en:'Khalaf ʿan Hamza (scans)',kind:'img',cache:true,local:'mushaf/khalaf/',ext:'.jpg',remote:p=>'https://archive.org/download/20201025_20201025_0144/page/n'+(p-1)+'_w1000.jpg'},
  qaloontj:{ar:'قالون — مصحف ملوّن بالتجويد (صور)',en:'Qalun — tajweed-coloured mushaf (scans)',kind:'img',local:'mushaf/qaloon-tj/',ext:'.png',cache:true,transparent:true,remote:p=>'https://archive.org/download/quran_qaloon/images_1260.zip/width_1260%2Fpage'+String(p).padStart(3,'0')+'.png'},
  hafsimg:{ar:'حفص — صور مصحف المدينة',en:'Hafs — Madinah mushaf scans',kind:'img',local:'mushaf/hafs-img/',ext:'.png',remote:p=>'https://android.quran.com/data/width_1024/page'+String(p).padStart(3,'0')+'.png',transparent:true}
};
const riwName=r=>(RIWAYAT[r]||RIWAYAT.hafs)[LANG];
var qRiwOptions;
const pad3=p=>String(p).padStart(3,'0');

/* ---- page/structure helpers ---- */
function qSurahIdx(p){let i=0;for(let k=0;k<114;k++){if(QS[k][2]<=p)i=k;else break}return i}
function qSurahAt(p){const i=qSurahIdx(p);return{i,name:LANG==='ar'?QS[i][0]:QS[i][1],ar:QS[i][0],start:QS[i][2]}}
const qsName=s=>s.name;
function qPageSurahs(p){const st=[];QS.forEach((x,i)=>{if(x[2]===p)st.push(x[0])});return st.length?st:[QS[qSurahIdx(p)][0]]}
function qJuzAt(p){let j=1;QJ.forEach((st,i)=>{if(st<=p)j=i+1});return j}
/* athman: exact (from the mushaf's own markers) for Qalun & Warsh, otherwise half of each rub' */
function qAthman(){const r=S.quran.riwaya,P=window.QURAN_PACKS&&QURAN_PACKS[r];if(P&&P.athman&&P.athman.length===480)return P.athman;
  if(!qAthman._def){const o=[];for(let k=0;k<240;k++){const a=QR[k],b=k<239?Math.max(a,QR[k+1]-1):604;o.push([a,1],[Math.min(b,a+Math.ceil((b-a+1)/2)),1])}qAthman._def=o}return qAthman._def}
const qExactAthman=()=>{const P=window.QURAN_PACKS&&QURAN_PACKS[S.quran.riwaya];return!!(P&&P.athman)};
function qThumnIdx(p){const A=qAthman();let k=0;for(let i=0;i<480;i++){if(A[i][0]<=p)k=i;else break}return k}
function qHizbAt(p){return S.quran.div==='hizb'?Math.floor(qThumnIdx(p)/8)+1:(()=>{let h=1;for(let k=0;k<60;k++)if(QR[k*4]<=p)h=k+1;return h})()}
function qHizbStart(h){return S.quran.div==='hizb'?qAthman()[h*8][0]:QR[h*4]}
function qDivLabel(p){if(S.quran.div==='hizb'){const k=qThumnIdx(p);return`${t('q.hizb')} ${Math.floor(k/8)+1} · ${t('q.thumn')} ${k%8+1}`}return`${t('q.juz')} ${qJuzAt(p)} · ${t('q.hizb')} ${qHizbAt(p)}`}
function qDivLabelAr(p){if(S.quran.div==='hizb'){const k=qThumnIdx(p);return`الحزب ${Math.floor(k/8)+1} · الثمن ${k%8+1}`}return`الجزء ${qJuzAt(p)}`}
const endOf=(nb)=>nb?(nb[1]<=1?nb[0]-1:nb[0]):604;
function rubRange(r){const a=QR[r],b=r<239?Math.max(a,QR[r+1]-1):604;return[a,Math.max(a,b)]}
function qUnitList(u){const out=[],A=qAthman();
  if(u==='surah')QS.forEach((x,i)=>out.push({label:(i+1)+'. '+(LANG==='ar'?x[0]:x[1]),r:[x[2],x[3]]}));
  else if(u==='juz')QJ.forEach((st,i)=>out.push({label:t('q.juz')+' '+(i+1),r:[st,QJE[i]]}));
  else if(u==='hizb')for(let h=0;h<60;h++){let a,b;if(S.quran.div==='hizb'){a=A[h*8][0];b=endOf(A[h*8+8])}else{a=QR[h*4];b=h<59?QR[h*4+4]-1:604}out.push({label:t('q.hizb')+' '+(h+1),r:[a,Math.max(a,b)]})}
  else if(u==='rub')for(let r=0;r<240;r++)out.push({label:t('q.hizb')+' '+(Math.floor(r/4)+1)+' · '+t('q.rub')+' '+(r%4+1),r:rubRange(r)});
  else if(u==='thumn')for(let k=0;k<480;k++){const a=A[k][0],b=endOf(A[k+1]);out.push({label:t('q.hizb')+' '+(Math.floor(k/8)+1)+' · '+t('q.thumn')+' '+(k%8+1),r:[a,Math.max(a,b)]})}
  return out}
const qUnits=()=>S.quran.div==='hizb'?['surah','hizb','thumn']:['surah','juz','hizb','rub','thumn'];
const rangePages=([a,b])=>{const o=[];for(let x=a;x<=b;x++)o.push(x);return o};

/* ---- khatma arithmetic (supports starting anywhere) ---- */
const qStart=()=>S.quran.start||1;
const qCovered=p=>p?((p-qStart()+604)%604)+1:0;
const qEndPage=()=>((qStart()-2+604)%604)+1;
const qNextPage=p=>p?(p%604)+1:qStart();

function qDay(k){const d=day(k);if(!d.quran)d.quran={read:0,wird:false,hifz:false,hifzNote:'',hifzPages:[],review:false,rv:null};return d.quran}
const qWirdDone=q=>!!q&&(q.wird||q.read>=S.quran.wird);
function qMem(){return [...new Set(S.quran.memorized)].sort((a,b)=>a-b)}
function qReviewSuggest(){const M=qMem();if(!M.length)return[];const n=Math.min(S.quran.review,M.length),p=S.quran.reviewPtr%M.length,out=[];for(let i=0;i<n;i++)out.push(M[(p+i)%M.length]);return out.sort((a,b)=>a-b)}
function rangesStr(pages){const a=[...new Set(pages)].sort((x,y)=>x-y),r=[];for(let i=0;i<a.length;i++){let j=i;while(j+1<a.length&&a[j+1]===a[j]+1)j++;r.push(j>i?a[i]+'–'+a[j]:''+a[i]);i=j}return r.join('، ')}
function surahsOf(pages){const n=[];pages.forEach(p=>{const x=qSurahAt(p).name;if(!n.includes(x))n.push(x)});return n.slice(0,2).join('، ')+(n.length>2?'…':'')}
function qSetPage(np){const Q=S.quran;np=Math.max(0,Math.min(604,np));const old=Q.page;if(np===old)return;const q=qDay(todayKey()),was=qWirdDone(q);
  const delta=qCovered(np)-qCovered(old);let count=true;if(!Q.kStart&&old===0)count=false;else if(delta>40)count=confirm(t('q.jumpQ',delta));
  if(count)q.read=Math.max(0,q.read+delta);
  Q.page=np;if(!Q.kStart)Q.kStart=todayKey();
  if(qCovered(np)===604&&qCovered(old)<604){Q.khatmas.push({start:Q.kStart,end:todayKey(),from:qStart(),riwaya:Q.riwaya});alertUser(t('q.khatmaDone'),t('q.khatmaDoneB'),ICON_BOOK)}
  else if(!was&&qWirdDone(q))chimeSoft(1175);
  save();renderQAll()}
function qToggle(kind){const q=qDay(todayKey()),Q=S.quran;
  if(kind==='wird'){q.wird=!qWirdDone(q)}
  else if(kind==='hifz'){q.hifz=!q.hifz}
  else if(kind==='review'){if(!qMem().length)return;if(!q.review){q.rv=qReviewSuggest();Q.reviewPtr+=q.rv.length;q.review=true;chimeSoft(1175)}else{Q.reviewPtr=Math.max(0,Q.reviewPtr-(q.rv?q.rv.length:0));q.review=false;q.rv=null}}
  save();renderQAll()}
function qSetMem(pages,on){const Q=S.quran,q=qDay(todayKey()),M=new Set(Q.memorized);let added=[];
  pages.forEach(p=>{if(on&&!M.has(p)){M.add(p);added.push(p)}if(!on)M.delete(p)});
  Q.memorized=[...M];
  if(on&&added.length){Q.tfsQ=[...new Set([...(Q.tfsQ||[]),...added])].sort((x,y)=>x-y)}
  if(on&&added.length&&added.length<=10){q.hifzPages=[...new Set([...(q.hifzPages||[]),...added])];q.hifz=true}
  if(!on)q.hifzPages=(q.hifzPages||[]).filter(p=>M.has(p));
  save();renderQAll()}
function qToggleMem(p){qSetMem([p],!S.quran.memorized.includes(p))}

/* ---- mushaf packs: local files (mushaf/<riwaya>.js) first, internet as fallback ---- */
window.QURAN_PACKS=window.QURAN_PACKS||{};
const QB={},QTL={};
function loadScript(src,ms=15000){return new Promise((res,rej)=>{const s=document.createElement('script');const tm=setTimeout(()=>{s.remove();rej('timeout')},ms);s.onload=()=>{clearTimeout(tm);res()};s.onerror=()=>{clearTimeout(tm);s.remove();rej('err')};s.src=src;document.head.append(s)})}
async function qPackFromCdn(r){const R=RIWAYAT[r];let pack=null;try{pack=await idbGet('qpack-'+r)}catch(e){}
  if(!pack){const raw=await fetchJ(QCDN+R.dir+'/data/'+R.data,90000);const res=await fetch(QCDN+R.dir+'/font/'+R.font);if(!res.ok)throw new Error('font');const buf=await res.arrayBuffer();
    const rows=raw.map(x=>{const ps=String(x.page).split(/[-–]/).map(Number);return[ps[0],ps[1]||0,x.sura_no||x.sora,x.aya_no,x.line_start,x.line_end,String(x.aya_text).replace(/‏/g,'').trim()]});
    pack={rows,fontBuf:buf};try{await idbSet('qpack-'+r,pack)}catch(e){}}
  return pack}
function qBuild(r){const P=QURAN_PACKS[r];const pages=Array.from({length:605},()=>({ay:[],ln:Array(16).fill(null)}));let bas='';
  P.rows.forEach(([p1,p2,s,a,ls,le,tx])=>{const w=tx.split(' ').filter(Boolean);
    if(s===27&&a===30){const i=tx.search(/بِسۡ?ْ?مِ?/);if(i>=0)bas=tx.slice(i).replace(/[\s ]*[٠-٩۰-۹]+[\s ]*$/,'').trim()}
    if(p2){const l1=16-ls,l2=le,k=Math.max(1,Math.min(w.length-1,Math.round(w.length*l1/(l1+l2))));pages[p1].ay.push({s,a,ls,le:15,w:w.slice(0,k)});pages[p2].ay.push({s,a,ls:1,le,w:w.slice(k),cont:1})}
    else pages[p1].ay.push({s,a,ls,le,w})});
  for(let p=1;p<=604;p++){const g=pages[p];g.ay.forEach(x=>{for(let l=x.ls;l<=x.le;l++)g.ln[l]='t'})}
  for(let p=1;p<=604;p++){pages[p].ay.forEach(x=>{if(x.a!==1||x.cont)return;const need=[];if(!(x.s===9||(x.s===1&&QFATIHA_B.includes(r))))need.push({k:'b'});need.push({k:'n',s:x.s});
    let pp=p,l=x.ls-1;need.forEach(h=>{while(true){if(l<1){pp--;l=15;if(pp<1)return}if(!pages[pp].ln[l]){pages[pp].ln[l]=h;l--;break}l--}})})}
  QB[r]={pages,bas,cache:{}}}
async function qLoadPack(r){if(QB[r])return QB[r];if(QTL[r])return QTL[r];
  QTL[r]=(async()=>{if(!QURAN_PACKS[r]){try{await loadScript('mushaf/'+r+'.js')}catch(e){}}
    if(!QURAN_PACKS[r])QURAN_PACKS[r]=await qPackFromCdn(r);
    const P=QURAN_PACKS[r];const src=P.fontBuf||('url(data:font/woff2;base64,'+P.font+')');const ff=new FontFace('Q_'+r,src);await ff.load();document.fonts.add(ff);
    qBuild(r);return QB[r]})();
  try{return await QTL[r]}catch(e){delete QTL[r];throw e}}
function qSetRiwaya(r){if(!RIWAYAT[r])return;S.quran.riwaya=r;save();if(curView()==='quran')renderQuran();if(curView()==='set')renderSettings();renderQCard()}

/* ---- 15-line layout: every text line is filled edge to edge, using the ayah line ranges of the printed mushaf ---- */
let qCtx=null;
function qMeasure(r,w){const B=QB[r];if(!qCtx){qCtx=document.createElement('canvas').getContext('2d')}qCtx.font=`100px "Q_${r}"`;const c=B.wcache||(B.wcache={});return c[w]??(c[w]=qCtx.measureText(w).width)}
function qLayout(r,p){const B=QB[r];if(B.cache[p])return B.cache[p];const g=B.pages[p];const sp=qMeasure(r,' ')*0.6;
  const tl=[];for(let l=1;l<=15;l++)if(g.ln[l]==='t')tl.push(l);const n=tl.length;
  const W=[],A=[],WK=[];g.ay.forEach((x,ai)=>{const st=W.length;x.w.forEach(w=>{W.push(w);WK.push(x.s+':'+x.a)});A.push({st,en:W.length,ls:x.ls,le:x.le})});const N=W.length;
  const pre=[0];W.forEach(w=>pre.push(pre[pre.length-1]+qMeasure(r,w)));
  const width=(a,b)=>pre[b]-pre[a]+Math.max(0,b-a-1)*sp;const T=width(0,N);const tgt=n?(pre[N]+Math.max(0,N-n)*sp)/n:0;
  /* allowed cut range after each text line, from the printed mushaf's ayah line ranges */
  const lo=[],hi=[];tl.forEach((L,j)=>{let l_=0,h_=N;A.forEach(x=>{if(x.le<=L)l_=Math.max(l_,x.en);if(x.ls>L)h_=Math.min(h_,x.st);if(x.ls<=L)l_=Math.max(l_,x.st+1);if(x.ls<=L&&x.le>L){const later=tl.filter(q=>q>L&&q<=x.le).length;h_=Math.min(h_,x.en-later)}});if(j===n-1){l_=N;h_=N}lo.push(l_);hi.push(Math.max(l_,h_))});
  const cost=(a,b)=>{const d=width(a,b)-tgt;return d>0?3*d*d:d*d};
  let prev=new Map([[0,{c:0,path:[]}]]);
  for(let j=0;j<n;j++){const cur=new Map();for(const [a,v] of prev){for(let c=Math.max(lo[j],a+1);c<=hi[j];c++){const cc=v.c+cost(a,c);const o=cur.get(c);if(!o||cc<o.c)cur.set(c,{c:cc,path:v.path.concat(c)})}}
    if(!cur.size){for(const [a,v] of prev){const c=Math.max(a+1,Math.min(N,lo[j]));cur.set(c,{c:v.c+cost(a,c),path:v.path.concat(c)})}}prev=cur}
  let best=null;for(const v of prev.values())if(!best||v.c<best.c)best=v;const cuts=best?best.path:[];
  const lines={};let a=0;let maxNat=tgt;tl.forEach((L,j)=>{const b=cuts[j]??N;lines[L]={w:W.slice(a,b),k:WK.slice(a,b),nat:width(a,b)};maxNat=Math.max(maxNat,width(a,b));a=b});
  return B.cache[p]={lines,maxNat,short:p<=2,sp}}
function qTextPageHTML(p,r){return`<div class="mp" data-p="${p}" data-r="${r}"></div>`}
function qRenderMP(el){const r=el.dataset.r,p=+el.dataset.p,B=QB[r];if(!B)return;const box=el.parentElement;const Wb=box.clientWidth,Hb=box.clientHeight;if(!Wb||!Hb)return;
  const Lh=Hb/15,lay=qLayout(r,p),g=B.pages[p];let fs=Math.min(Wb*0.955/(lay.maxNat/100),Lh*0.6);const lineW=lay.short?Wb:Math.min(Wb,lay.maxNat*fs/100*1.04);
  let h='';for(let l=1;l<=15;l++){const t_=g.ln[l];
    if(t_==='t'){const L=lay.lines[l];h+=`<div class="ml ${lay.short?'c':''}" style="gap:${lay.sp/100}em">${L.w.map((w,i)=>{const m=w.match(/^([\s\S]*?)([\s\u00a0]*[\u0660-\u0669\u06F0-\u06F9]+)$/);return`<span data-k="${L.k[i]}">${m?esc(m[1])+'<i class="aen">'+esc(m[2])+'</i>':esc(w)}</span>`}).join('')}</div>`}
    else if(t_&&t_.k==='n')h+=`<div class="ml sn"><span class="snb">سورة ${esc(QS[t_.s-1][0])}</span></div>`;
    else if(t_&&t_.k==='b')h+=`<div class="ml c">${esc(B.bas)}</div>`;
    else if(!lay.short)h+=`<div class="ml"></div>`}
  el.style.cssText=`font-family:'Q_${r}';font-size:${fs}px;--lh:${Lh}px;width:${lineW}px;${lay.short?'justify-content:center':''}`;el.innerHTML=h}

/* ---- checklist & cards ---- */
/* copying from the mushaf: words are flex items, so rebuild clean text */
function qCopyWord(w){return w.replace(/[ \s]*([٠-٩۰-۹]+)\s*$/,' ﴿$1﴾').replace(/ /g,' ').trim()}
document.addEventListener('copy',e=>{const sel=getSelection();if(!sel||!sel.rangeCount||sel.isCollapsed)return;const rg=sel.getRangeAt(0);
  const lines=[...document.querySelectorAll('.ml')].filter(l=>rg.intersectsNode(l));if(!lines.length)return;
  const out=[];let cur=[];const flush=()=>{if(cur.length){out.push(cur.join(' '));cur=[]}};
  lines.forEach(l=>{const ws=l.querySelectorAll(':scope>span:not(.snb)');
    if(l.classList.contains('sn')||!ws.length){const tx=l.textContent.trim();if(tx){flush();out.push(tx)}return}
    ws.forEach(sp=>{if(rg.intersectsNode(sp)){const w=qCopyWord(sp.textContent);if(w)cur.push(w)}})});
  flush();const text=out.join('\n').replace(/[ \t]+/g,' ').trim();if(!text)return;
  e.clipboardData.setData('text/plain',text);e.preventDefault()});
function qChecklist(withNote){const q=qDay(todayKey()),Q=S.quran,wd=qWirdDone(q),mem=qMem().length,sug=q.review&&q.rv?q.rv:qReviewSuggest();
  const hsub=(q.hifzPages&&q.hifzPages.length)?t('q.hifzPages',rangesStr(q.hifzPages)):(q.hifzNote?esc(q.hifzNote):t('q.hifzHint'));
  return `<div class="qchk ${wd?'done':''}" data-qk="wird"><button class="qck">${ICON_CHECK}</button><div class="lb"><b>${t('q.wird')}</b><small>${t('q.wirdSub',q.read,Q.wird)}</small></div>${qCovered(Q.page)<604?`<button class="btn sm" data-qa="p1">${t('q.plus1')}</button>`:''}</div>
  <div class="qchk ${q.hifz?'done':''}" data-qk="hifz"><button class="qck">${ICON_CHECK}</button><div class="lb"><b>${t('q.hifz')}</b><small title="${esc(hsub)}">${hsub}</small></div></div>
  ${withNote?`<input class="in" id="qHifzNote" style="width:100%;margin:2px 0 6px" dir="auto" placeholder="${esc(t('q.hifzNotePh'))}" value="${esc(q.hifzNote||'')}">`:''}
  <div class="qchk ${q.review?'done':''} ${mem?'':'dis'}" data-qk="review"><button class="qck">${ICON_CHECK}</button><div class="lb"><b>${t('q.review')}</b><small>${mem?t('q.reviewSub',rangesStr(sug))+' · '+surahsOf(sug):t('q.noMem')}</small></div></div>`}
function bindQ(root){root.querySelectorAll('.qchk .qck').forEach(b=>b.onclick=()=>qToggle(b.closest('.qchk').dataset.qk));
  root.querySelectorAll('[data-qa=p1]').forEach(b=>b.onclick=()=>qSetPage(qNextPage(S.quran.page)));
  const n=root.querySelector('#qHifzNote');if(n)n.onchange=()=>{const q=qDay(todayKey());q.hifzNote=n.value.trim();if(q.hifzNote)q.hifz=true;save();renderQAll()}}
function renderQCard(){wallGlow();const Q=S.quran,p=Q.page,c=qCovered(p),pct=Math.floor(c/604*1000)/10,s=p?qSurahAt(p):null;
  $('#qCard').innerHTML=`<h3><span>${t('q.title')}</span><button class="btn sm" id="qOpenBtn">${t('q.open')}</button></h3>
  <div class="qprog"><div class="minibar"><i style="width:${c/604*100}%"></i></div><div class="qpt"><span>${t('q.khatma')} <b>${pct}%</b></span><span>${p?`${t('q.pageS')} ${p} · ${esc(s.name)}`:t('q.notStartedS')}</span></div></div>
  <div style="margin-top:8px">${qChecklist(false)}</div>`;
  bindQ($('#qCard'));$('#qOpenBtn').onclick=()=>{qShowSilent(S.quran.page||qStart());showView('quran')}}
function qShowSilent(p){p=Math.max(1,Math.min(604,p));S.quran.view=p%2?p:p-1;S.quran.pv=p}
function qStep(d){const Q=S.quran;if($('#spread .strack'))qSlideGo(d);else if(MOB.matches)qShow((Q.pv||Q.view||1)+d);else qShow((Q.view||1)+2*d)}
function qShow(p){qShowSilent(p);save();renderQuran()}

/* ---- mushaf ---- */
function qPageEl(p,side){if(p>604)return`<div class="qpage ${side} blank"><div class="qimg"></div></div>`;const Q=S.quran,mem=Q.memorized.includes(p),R=RIWAYAT[Q.riwaya]||RIWAYAT.hafs;
  let inner;
  if(R.kind==='text'){inner=QB[Q.riwaya]?qTextPageHTML(p,Q.riwaya):`<div class="qload"><div class="spin"></div>${esc(t('q.loading',riwName(Q.riwaya))).replace('\n','<br>')}</div>`}
  else inner=`<img data-p="${p}" class="${R.transparent?'':'scan'}" alt="">`;
  return`<div class="qpage ${side}">${Q.page===p?'<div class="ribbon"></div>':''}<div class="qh"><span>${esc(qPageSurahs(p).join(' · '))}</span><span>${qDivLabelAr(p)}</span></div><div class="qimg">${inner}</div>
  <div class="qf"><button class="qbtn ${Q.page===p?'on':''}" dir="auto" data-bm="${p}">🔖 ${t('q.here')}</button><span class="qn">${p}</span><button class="qbtn ${mem?'on':''}" dir="auto" data-mem="${p}">${mem?'✓ ':''}${t('q.memorized')}</button></div></div>`}
function qDivSelect(v){const Q=S.quran;
  if(Q.div==='hizb'){$('#qJuz').innerHTML=Array.from({length:60},(_,h)=>`<option value="${qHizbStart(h)}">${t('q.hizb')} ${h+1}</option>`).join('');$('#qJuz').value=qHizbStart(qHizbAt(v)-1)}
  else{$('#qJuz').innerHTML=QJ.map((st,i)=>`<option value="${st}">${t('q.juz')} ${i+1}</option>`).join('');$('#qJuz').value=QJ[qJuzAt(v)-1]}}
function renderQuran(){const Q=S.quran,v=Q.view||1,R=RIWAYAT[Q.riwaya]||RIWAYAT.hafs;
  if(R.kind==='text'&&!QB[Q.riwaya]&&!qRenderQuran._w){qRenderQuran._w=1}
  $('#qRiw').innerHTML=qRiwOptions();$('#qRiw').value=Q.riwaya;
  $('#qDiv').innerHTML=`<option value="juz">${t('q.divJuz')}</option><option value="hizb">${t('q.divHizb')}</option>`;$('#qDiv').value=Q.div;
  $('#qSurah').innerHTML=QS.map((x,i)=>`<option value="${x[2]}">${i+1}. ${esc(LANG==='ar'?x[0]:x[1])}</option>`).join('');
  qBarUpdate();
  const one=MOB.matches||document.documentElement.classList.contains('qfs-one'),pv=Math.max(1,Math.min(604,Q.pv||v));
  $('#qDark').textContent=Q.dark?t('q.light'):t('q.dark');$('#qFsDark').textContent=Q.dark?'☀':'☾';$('#qFsBtn').textContent='⛶ '+t('q.fs');$('#mushaf').classList.toggle('dark',!!Q.dark);
  $('#qPrevP').title=t('q.prevP');$('#qNextP').title=t('q.nextP');$('#qPrevP').disabled=one?pv<=1:v<=1;$('#qNextP').disabled=one?pv>=604:v>=603;
  $('#spread').innerHTML=one?`<div class="strack">${[pv+1,pv,pv-1].map(p=>qSlide(p)).join('')}</div>`:qPageEl(v,'r')+qPageEl(v+1,'l');$('#spread').classList.toggle('one',one);
  if(R.kind==='text'&&!QB[Q.riwaya])qLoadPack(Q.riwaya).then(()=>{if(curView()==='quran'&&S.quran.riwaya===Q.riwaya)renderQuran()}).catch(()=>{$$('#spread .qload').forEach(el=>{el.innerHTML=esc(t('q.loadFail',riwName(Q.riwaya))).replace('\n','<br>')+`<br><button class="qbtn" style="margin-top:10px">${t('q.retry')}</button>`;el.querySelector('button').onclick=()=>renderQuran()})});
  else qHydrate($('#spread'));
  $('#mushaf').classList.toggle('hidetest',!!Q.hide);qToolbarState();renderQSide()}
function qRenderQuran(){}
function qSlide(p){return`<div class="sslide" data-p="${p}">${p>=1&&p<=604?qPageEl(p,'r one'):''}</div>`}
function qBarUpdate(){const Q=S.quran,v=Q.view||1,one=MOB.matches||document.documentElement.classList.contains('qfs-one'),pv=Math.max(1,Math.min(604,Q.pv||v)),cur=one?pv:v;
  $('#qSurah').value=QS[qSurahIdx(cur)][2];qDivSelect(cur);$('#qPageIn').value=cur;$('#qFsPg')&&($('#qFsPg').textContent=cur)}
function qHydrate(root){const Q=S.quran,R=RIWAYAT[Q.riwaya]||RIWAYAT.hafs;
  if(R.kind==='text'){if(QB[Q.riwaya])requestAnimationFrame(()=>{root.querySelectorAll('.mp').forEach(qRenderMP);qApplyMarks()})}
  else root.querySelectorAll('img[data-p]').forEach(im=>qLoadImg(im,+im.dataset.p,Q.riwaya));
  root.querySelectorAll('[data-bm]').forEach(b=>b.onclick=()=>qSetPage(+b.dataset.bm));
  root.querySelectorAll('[data-mem]').forEach(b=>b.onclick=()=>qToggleMem(+b.dataset.mem))}
/* images: local folder → saved copy on this device → internet (and keep a copy) */
const qImgKey=(r,p)=>'qimg:'+r+':'+p;
function qImgFail(im,p){const d=document.createElement('div');d.className='fail';d.dir=LANG==='ar'?'rtl':'ltr';d.innerHTML=esc(t('q.fail',p)).replace('\n','<br>');im.replaceWith(d)}
function qLoadImg(im,p,r){const R=RIWAYAT[r];let step=0;
  const next=async()=>{step++;
    if(step===1){im.src=R.local+pad3(p)+R.ext;return}
    if(step===2){if(R.cache){try{const b=await idbGet(qImgKey(r,p));if(b){im.src=typeof b==='string'?b:URL.createObjectURL(b);return}}catch(e){}}step++}
    if(step===3){im.src=R.remote(p);im.onload=()=>{im.onload=null;if(R.cache)qCacheImg(r,p)};return}
    qImgFail(im,p)};
  im.onerror=next;next()}
async function qCacheImg(r,p){try{if(await idbGet(qImgKey(r,p)))return;const res=await fetch(RIWAYAT[r].remote(p));if(!res.ok)return;await idbSet(qImgKey(r,p),await res.blob());return true}catch(e){return false}}
let qDl=null;
async function qDownloadAll(){const r=S.quran.riwaya,R=RIWAYAT[r];if(!R||R.kind!=='img'||qDl)return;qDl={r,done:0,fail:0};renderQSide();
  for(let p=1;p<=604&&qDl;p++){let ok=true;try{if(!await idbGet(qImgKey(r,p))){ok=await qCacheImg(r,p)}}catch(e){ok=false}if(!ok)qDl.fail++;qDl.done=p;if(p%4===0||p===604){const el=$('#qDlSt');if(el)el.textContent=t('q.dlProg',p,604)}}
  const f=qDl&&qDl.fail;qDl=null;S.quran.dl=S.quran.dl||{};if(!f)S.quran.dl[r]=1;save();renderQSide();toast(f?t('q.dlFail',f):t('q.dlDone'))}
/* fullscreen reading */
function qFs(on){const h=document.documentElement;h.classList.toggle('qfs',on);h.classList.toggle('qfs-one',on&&MOB.matches);
  if(ANDROID){try{window.ThabatAndroid.setFullscreen(on)}catch(e){}}
  else{try{if(on&&!document.fullscreenElement)document.documentElement.requestFullscreen().catch(()=>{});if(!on&&document.fullscreenElement)document.exitFullscreen().catch(()=>{})}catch(e){}}
  $('#qFsUi').classList.remove('show');renderQuran()}
document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement&&document.documentElement.classList.contains('qfs')&&!ANDROID)qFs(false)});
/* smooth page swipe (single page view) */
function qSlideGo(dir){const Q=S.quran,tr=$('#spread .strack');const cur=Q.pv||Q.view||1;
  if(!tr){qShow(cur+dir);return}if((dir>0&&cur>=604)||(dir<0&&cur<=1)){tr.style.transition='transform .25s';tr.style.transform='translate3d(-33.3333%,0,0)';return}
  tr.style.transition='transform .3s cubic-bezier(.2,.8,.2,1)';tr.style.transform=`translate3d(${dir>0?'0%':'-66.6667%'},0,0)`;clearTimeout(qSlideGo._t);qSlideGo._t=setTimeout(()=>qSlideCommit(dir),300)}
function qSlideCommit(dir){const Q=S.quran,tr=$('#spread .strack');if(!tr)return;const np=Math.max(1,Math.min(604,(Q.pv||Q.view||1)+dir));Q.pv=np;Q.view=np%2?np:np-1;save();
  const tmp=document.createElement('div');
  if(dir>0){tr.lastElementChild.remove();tmp.innerHTML=qSlide(np+1);tr.prepend(tmp.firstElementChild)}else{tr.firstElementChild.remove();tmp.innerHTML=qSlide(np-1);tr.append(tmp.firstElementChild)}
  tr.style.transition='none';tr.style.transform='translate3d(-33.3333%,0,0)';void tr.offsetWidth;
  qHydrate(dir>0?tr.firstElementChild:tr.lastElementChild);
  const one=true;$('#qPrevP').disabled=np<=1;$('#qNextP').disabled=np>=604;qBarUpdate();clearTimeout(qSlideCommit._s);qSlideCommit._s=setTimeout(()=>{(window.requestIdleCallback||(f=>setTimeout(f,0)))(()=>renderQSide(),{timeout:1500})},500);qPrefetch(np,dir)}
let qRT;window.addEventListener('resize',()=>{clearTimeout(qRT);qRT=setTimeout(()=>{if(curView()==='quran')$$('#spread .mp').forEach(qRenderMP)},120)});

/* ---- side: khatma / today / memorization map ---- */
let qSel=new Set(),qAnchor=null,qDrag=null,qStartOpen=false,qUnit='surah';
function qStartLabel(){const st=qStart();const si=QS.findIndex(x=>x[2]===st);if(si>=0)return`${LANG==='ar'?QS[si][0]:QS[si][1]} (${t('q.pageS')} ${st})`;return`${qDivLabel(st)} (${t('q.pageS')} ${st})`}
function qDlBlock(){const r=S.quran.riwaya,R=RIWAYAT[r];if(!R||R.kind!=='img')return'';const done=S.quran.dl&&S.quran.dl[r];
  return`<div class="qdl"><small>${done?t('q.dlHave'):t('q.dlSub')}</small>${qDl?`<small id="qDlSt">${t('q.dlProg',qDl.done,604)}</small><button class="btn sm ghost" id="qDlStop">${t('lt.cancel')}</button>`:done?'':`<button class="btn sm" id="qDlGo">⭳ ${t('q.dl')}</button>`}</div>`}
function renderQSide(){const Q=S.quran,p=Q.page,c=qCovered(p),pct=Math.floor(c/604*1000)/10,s=p?qSurahAt(p):null,done=Q.khatmas.length,q=qDay(todayKey());
  const rem=604-c,days=Math.ceil(rem/Math.max(1,Q.wird)),eta=t('q.eta',Q.wird,days,gShort(addDays(logicalDate(Date.now()),days)));
  const stUnits=Q.div==='hizb'?['surah','hizb','thumn','page']:['surah','juz','hizb','page'];
  $('#qKhatma').innerHTML=`<h3><span>${t('q.khatmaN',done+1)}</span><span>${done?t('q.done',done):''}</span></h3>
   <div class="khat"><div class="ring" style="--p:${c/604*100}"><div><b>${pct}%</b><span>${c} / 604</span></div></div><div class="info">${p?`${t('q.reached')}<br><b>${esc(s.name)}</b><small>${t('q.page')} ${p} · ${qDivLabel(p)}</small>`:`<small>${t('q.notStarted')}</small>`}${p&&c<604?`<small>${eta}</small>`:''}</div></div>
   <div class="kstart">${t('q.startFrom')}: <b>${esc(qStartLabel())}</b> <button class="link" id="qStEd">${t('q.change')}</button></div>
   <div class="kbox ${qStartOpen?'on':''}" id="qStBox"><select class="in" id="qStU">${stUnits.map(u=>`<option value="${u}">${t('q.unit'+u[0].toUpperCase()+u.slice(1))}</option>`).join('')}</select><select class="in" id="qStV" style="flex:1"></select><input class="in num" id="qStP" type="number" min="1" max="604" style="display:none"><button class="btn sm pri" id="qStSave">${t('q.save')}</button></div>
   ${qDlBlock()}<div class="row" style="justify-content:flex-start;margin-top:14px">${c<604?`<button class="btn sm" id="qK1">${t('q.plus1')}</button>${qWirdDone(q)?'':`<button class="btn sm" id="qKW">${t('q.plusW')}</button>`}`:`<button class="btn sm pri" id="qNewK">${t('q.newK')}</button>`}</div>`;
  const k1=$('#qK1');renderQStudy();if(k1)k1.onclick=()=>qSetPage(qNextPage(Q.page));
  const dg=$('#qDlGo');if(dg)dg.onclick=()=>qDownloadAll();const ds=$('#qDlStop');if(ds)ds.onclick=()=>{qDl=null;renderQSide()};
  const kw=$('#qKW');if(kw)kw.onclick=()=>{const qq=qDay(todayKey());const n=Math.max(1,Q.wird-qq.read);const target=Math.min(604,qCovered(Q.page)+n);qSetPage(((qStart()-1+target-1)%604)+1)};
  const nk=$('#qNewK');if(nk)nk.onclick=()=>{Q.page=0;Q.kStart=todayKey();Q.view=qStart()%2?qStart():qStart()-1;save();renderQAll()};
  const fillSt=()=>{const u=$('#qStU').value;$('#qStP').style.display=u==='page'?'':'none';$('#qStV').style.display=u==='page'?'none':'';
    if(u==='page'){$('#qStP').value=qStart();return}
    const list=qUnitList(u).map(x=>[x.r[0],x.label]);
    $('#qStV').innerHTML=list.map(([pg,l],i)=>`<option value="${pg}">${esc(l)}</option>`).join('');const hit=list.find(x=>x[0]===qStart());$('#qStV').value=hit?hit[0]:list[0][0]};
  $('#qStEd').onclick=()=>{qStartOpen=!qStartOpen;$('#qStBox').classList.toggle('on',qStartOpen)};
  $('#qStU').onchange=fillSt;fillSt();
  $('#qStSave').onclick=()=>{const u=$('#qStU').value;const v=u==='page'?+$('#qStP').value:+$('#qStV').value;if(!(v>=1&&v<=604))return;
    const wasCov=qCovered(Q.page);Q.start=v;if(!Q.kStart||wasCov===0){Q.page=0}qStartOpen=false;Q.view=v%2?v:v-1;save();renderQAll()};
  $('#qToday').innerHTML=`<h3><span>${t('q.today')}</span><span>${t('q.wirdSub',q.read,Q.wird)}</span></h3>${qChecklist(true)}`;bindQ($('#qToday'));
  renderQMap()}
function qMapRows(){const rows=[];if(S.quran.div==='hizb'){const A=qAthman();for(let h=0;h<60;h++){const a=h?Math.max(rows[h-1][2]+1,A[h*8][0]):1,b=h<59?Math.max(a,A[h*8+8][0]-1):604;rows.push([h+1,a,b])}}
  else for(let j=0;j<30;j++)rows.push([j+1,QJ[j],j<29?QJ[j+1]-1:604]);return rows}
function renderQMap(){const Q=S.quran,p=Q.page,q=qDay(todayKey()),M=new Set(Q.memorized),rv=new Set(q.review&&q.rv?q.rv:qReviewSuggest());
  let rows='';qMapRows().forEach(([n,a,b])=>{let cells='';for(let x=a;x<=b;x++)cells+=`<button class="hc ${M.has(x)?(rv.has(x)?'rv':'m'):''} ${x===p?'cur':''} ${qSel.has(x)?'sel':''}" data-p="${x}" title="${t('q.pageS')} ${x} · ${esc(qSurahAt(x).name)}"></button>`;rows+=`<div class="hrow"><span class="jl">${n}</span>${cells}</div>`});
  const units=qUnits();if(!units.includes(qUnit))qUnit='surah';
  $('#qMap').innerHTML=`<h3><span>${t('q.map')} <small style="font-weight:400">(${Q.div==='hizb'?t('q.byHizb'):t('q.byJuz')})</small></span><span>${t('q.mapSub',M.size,Math.round(M.size/604*1000)/10)}</span></h3><div class="hmap ${Q.div==='hizb'?'hz':''}" id="hmap">${rows}</div>
   <div class="hlegend"><span><i style="background:var(--accent)"></i>${t('q.lgMem')}</span><span><i style="background:var(--ok)"></i>${t('q.lgRv')}</span><span><i style="outline:1.5px solid var(--text)"></i>${t('q.lgCur')}</span></div>
   <div class="hselbar ${qSel.size?'on':''}" id="qSelBar"><b id="qSelN">${t('q.selN',qSel.size)}</b><button class="btn sm pri" id="qSelMem">${t('q.selMem')}</button><button class="btn sm" id="qSelUn">${t('q.selUnmem')}</button><button class="btn sm ghost" id="qSelClr">${t('q.selClear')}</button></div>
   <div class="hform"><select class="in" id="qUnit" style="flex:0 0 auto">${units.map(u=>`<option value="${u}" ${qUnit===u?'selected':''}>${t('q.unit'+u[0].toUpperCase()+u.slice(1))}</option>`).join('')}</select><select class="in" id="qUnitV"></select></div>
   <div class="hform"><button class="btn sm" id="qUSel">${t('q.select')}</button><button class="btn sm pri" id="qUAdd">${t('q.add')}</button><button class="btn sm ghost" id="qURem">${t('q.remove')}</button></div>
   <div class="hhint">${t('q.mapHint')}${qUnit==='thumn'&&!qExactAthman()?' · '+t('q.thumnNote'):''}</div>`;
  const list=qUnitList(qUnit);$('#qUnitV').innerHTML=list.map((x,i)=>`<option value="${i}">${esc(x.label)}</option>`).join('');
  $('#qUnit').onchange=e=>{qUnit=e.target.value;renderQMap()};
  const cur=()=>rangePages(list[+$('#qUnitV').value].r);
  $('#qUSel').onclick=()=>{cur().forEach(x=>qSel.add(x));renderQMap()};
  $('#qUAdd').onclick=()=>qSetMem(cur(),true);$('#qURem').onclick=()=>qSetMem(cur(),false);
  $('#qSelMem').onclick=()=>{const ps=[...qSel];qSel.clear();qSetMem(ps,true)};
  $('#qSelUn').onclick=()=>{const ps=[...qSel];qSel.clear();qSetMem(ps,false)};
  $('#qSelClr').onclick=()=>{qSel.clear();renderQMap()};
  const hm=$('#hmap');
  const upd=()=>{$('#qSelBar').classList.toggle('on',qSel.size>0);$('#qSelN').textContent=t('q.selN',qSel.size)};
  const setCell=(el,on)=>{const x=+el.dataset.p;if(on)qSel.add(x);else qSel.delete(x);el.classList.toggle('sel',on)};
  hm.onpointerdown=e=>{const el=e.target.closest('.hc');if(!el)return;e.preventDefault();const x=+el.dataset.p;
    if(e.shiftKey&&qAnchor){const [a,b]=[Math.min(qAnchor,x),Math.max(qAnchor,x)];for(let y=a;y<=b;y++){qSel.add(y);const c=hm.querySelector(`.hc[data-p="${y}"]`);if(c)c.classList.add('sel')}upd();return}
    qDrag=!qSel.has(x);setCell(el,qDrag);qAnchor=x;upd()};
  hm.onpointerover=e=>{if(qDrag===null)return;const el=e.target.closest('.hc');if(el){setCell(el,qDrag);upd()}};
  hm.ondblclick=e=>{const el=e.target.closest('.hc');if(el){qSel.delete(+el.dataset.p);qShow(+el.dataset.p)}};}
window.addEventListener('pointerup',()=>{qDrag=null});
function renderQAll(){renderQCard();if(curView()==='quran')renderQuran()}
function qSetDiv(d){S.quran.div=d;qSel.clear();save();renderQAll();if(curView()==='set')renderSettings()}
$('#qFsBtn').onclick=()=>qFs(true);$('#qFsX').onclick=e=>{e.stopPropagation();qFs(false)};$('#qFsDark').onclick=e=>{e.stopPropagation();$('#qDark').click()};
$('#qPrevP').onclick=()=>qStep(-1);
$('#qNextP').onclick=()=>qStep(1);
{const m=$('#mushaf');let dg=null;
  m.addEventListener('touchstart',e=>{const tr=$('#spread .strack'),t0=e.touches[0];dg={x:t0.clientX,y:t0.clientY,t:Date.now(),dx:0,lock:null,tr,w:$('#spread').clientWidth||1};if(tr)tr.style.transition='none'},{passive:true});
  m.addEventListener('touchmove',e=>{if(!dg)return;const t0=e.touches[0],dx=t0.clientX-dg.x,dy=t0.clientY-dg.y;
    if(dg.lock===null&&(Math.abs(dx)>7||Math.abs(dy)>7))dg.lock=Math.abs(dx)>Math.abs(dy)*1.2?'x':'y';
    if(dg.lock!=='x'||!dg.tr)return;e.preventDefault();const cur=S.quran.pv||S.quran.view||1;let d=dx;if((cur>=604&&d>0)||(cur<=1&&d<0))d*=.25;dg.dx=d;dg.tr.style.transform=`translate3d(calc(-33.3333% + ${d}px),0,0)`},{passive:false});
  m.addEventListener('touchend',e=>{if(!dg)return;const g=dg;dg=null;if(g.lock!=='x')return;const dt=Date.now()-g.t;
    if(!g.tr){const dx=e.changedTouches[0].clientX-g.x;if(Math.abs(dx)>60&&dt<800)qStep(dx>0?1:-1);return}
    const v=Math.abs(g.dx)/Math.max(1,dt);let dir=0;if(g.dx>g.w*.2||(g.dx>25&&v>.35))dir=1;else if(g.dx<-g.w*.2||(g.dx<-25&&v>.35))dir=-1;
    if(dir)qSlideGo(dir);else{g.tr.style.transition='transform .25s cubic-bezier(.2,.8,.2,1)';g.tr.style.transform='translate3d(-33.3333%,0,0)'}},{passive:true});
  m.addEventListener('click',e=>{if(!document.documentElement.classList.contains('qfs'))return;if(e.target.closest('button,a,.qbtn'))return;$('#qFsUi').classList.toggle('show')})}
MOB.addEventListener&&MOB.addEventListener('change',()=>{if(curView()==='quran')renderQuran()});
MOB.addEventListener&&MOB.addEventListener('change',()=>{if(curView()==='quran')renderQuran()});
$('#qRiw').onchange=e=>qSetRiwaya(e.target.value);
$('#qDiv').onchange=e=>qSetDiv(e.target.value);
$('#qSurah').onchange=e=>qShow(+e.target.value);
$('#qJuz').onchange=e=>qShow(+e.target.value);
$('#qPageIn').onchange=e=>qShow(+e.target.value||1);
$('#qGoMine').onclick=()=>qShow(S.quran.page||qStart());
$('#qDark').onclick=()=>{S.quran.dark=!S.quran.dark;save();renderQuran()};
document.addEventListener('keydown',e=>{if(curView()!=='quran'||/INPUT|SELECT|TEXTAREA/.test(e.target.tagName))return;if(e.key==='ArrowLeft')qStep(1);if(e.key==='ArrowRight')qStep(-1)});
function checkQuran(){const Q=S.quran,now=Date.now(),pt=prayerTimes(new Date()),dk=dKey(new Date()),q=qDay(todayKey());
  const r=Q.rem.read;if(r.on){const at=pt[r.prayer]+r.after*6e4,key=dk+'q-read';if(now>=at&&now<at+36e5&&!S.notified[key]){S.notified[key]=1;save();if(!qWirdDone(q))alertUser(t('q.remRead'),t('q.remReadB',Math.max(0,Q.wird-q.read)),ICON_BOOK)}}
  const h=Q.rem.hifz;if(h.on){const at=pt[h.prayer]+h.after*6e4,key=dk+'q-hifz';if(now>=at&&now<at+36e5&&!S.notified[key]){S.notified[key]=1;save();const left=[];if(!q.hifz)left.push(t('q.hifz'));if(qMem().length&&!q.review)left.push(t('q.review'));if(left.length)alertUser(t('q.remHifz'),t('q.remHifzB',left.join(t('q.and'))),ICON_BOOK)}}}

