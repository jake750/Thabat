/* ============ v3.31: khatm du'a options after a completed khatma, search the Quran by root (Quranic Arabic Corpus), a note when recitation plays over a scanned mushaf ============ */
/* ---------- du'a after completing the Quran ---------- */
/* No du'a is fixed for the khatm in the Sunnah; Anas ibn Malik gathered his family and made du'a (ad-Darimi). The options are shown with what is known of each.
   A: Quranic du'as, their text taken from the verified Hafs text in the app. B: the hadith of Ibn Mas'ud (Ahmad 3712, Ibn Hibban 972). C and D: circulated texts, marked as such.
   E: his own text, S.quran.myDua (synced). */
const KD_C=`اللَّهُمَّ ارْحَمْنِي بِالقُرْآنِ، وَاجْعَلْهُ لِي إِمَامًا وَنُورًا وَهُدًى وَرَحْمَةً.
اللَّهُمَّ ذَكِّرْنِي مِنْهُ مَا نَسِيتُ، وَعَلِّمْنِي مِنْهُ مَا جَهِلْتُ، وَارْزُقْنِي تِلَاوَتَهُ آنَاءَ اللَّيْلِ وَأَطْرَافَ النَّهَارِ، وَاجْعَلْهُ لِي حُجَّةً يَا رَبَّ العَالَمِينَ.`;
const KD_D=KD_C+`
اللَّهُمَّ أَصْلِحْ لِي دِينِي الَّذِي هُوَ عِصْمَةُ أَمْرِي، وَأَصْلِحْ لِي دُنْيَايَ الَّتِي فِيهَا مَعَاشِي، وَأَصْلِحْ لِي آخِرَتِي الَّتِي فِيهَا مَعَادِي، وَاجْعَلِ الحَيَاةَ زِيَادَةً لِي فِي كُلِّ خَيْرٍ، وَاجْعَلِ المَوْتَ رَاحَةً لِي مِنْ كُلِّ شَرٍّ.
اللَّهُمَّ اجْعَلْ خَيْرَ عُمْرِي آخِرَهُ، وَخَيْرَ عَمَلِي خَوَاتِمَهُ، وَخَيْرَ أَيَّامِي يَوْمَ أَلْقَاكَ فِيهِ.
اللَّهُمَّ إِنِّي أَسْأَلُكَ عِيشَةً هَنِيَّةً، وَمِيتَةً سَوِيَّةً، وَمَرَدًّا غَيْرَ مُخْزٍ وَلَا فَاضِحٍ.
اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ المَسْأَلَةِ، وَخَيْرَ الدُّعَاءِ، وَخَيْرَ النَّجَاحِ، وَخَيْرَ العِلْمِ، وَخَيْرَ العَمَلِ، وَخَيْرَ الثَّوَابِ، وَخَيْرَ الحَيَاةِ، وَخَيْرَ المَمَاتِ، وَثَبِّتْنِي، وَثَقِّلْ مَوَازِينِي، وَحَقِّقْ إِيمَانِي، وَارْفَعْ دَرَجَتِي، وَتَقَبَّلْ صَلَاتِي، وَاغْفِرْ خَطِيئَاتِي، وَأَسْأَلُكَ العُلَا مِنَ الجَنَّةِ.
اللَّهُمَّ إِنِّي أَسْأَلُكَ مُوجِبَاتِ رَحْمَتِكَ، وَعَزَائِمَ مَغْفِرَتِكَ، وَالسَّلَامَةَ مِنْ كُلِّ إِثْمٍ، وَالغَنِيمَةَ مِنْ كُلِّ بِرٍّ، وَالفَوْزَ بِالجَنَّةِ، وَالنَّجَاةَ مِنَ النَّارِ.
اللَّهُمَّ أَحْسِنْ عَاقِبَتَنَا فِي الأُمُورِ كُلِّهَا، وَأَجِرْنَا مِنْ خِزْيِ الدُّنْيَا وَعَذَابِ الآخِرَةِ.
اللَّهُمَّ اقْسِمْ لَنَا مِنْ خَشْيَتِكَ مَا تَحُولُ بِهِ بَيْنَنَا وَبَيْنَ مَعْصِيَتِكَ، وَمِنْ طَاعَتِكَ مَا تُبَلِّغُنَا بِهَا جَنَّتَكَ، وَمِنَ اليَقِينِ مَا تُهَوِّنُ بِهِ عَلَيْنَا مَصَائِبَ الدُّنْيَا، وَمَتِّعْنَا بِأَسْمَاعِنَا وَأَبْصَارِنَا وَقُوَّتِنَا مَا أَحْيَيْتَنَا، وَاجْعَلْهُ الوَارِثَ مِنَّا، وَاجْعَلْ ثَأْرَنَا عَلَى مَنْ ظَلَمَنَا، وَانْصُرْنَا عَلَى مَنْ عَادَانَا، وَلَا تَجْعَلْ مُصِيبَتَنَا فِي دِينِنَا، وَلَا تَجْعَلِ الدُّنْيَا أَكْبَرَ هَمِّنَا وَلَا مَبْلَغَ عِلْمِنَا، وَلَا تُسَلِّطْ عَلَيْنَا مَنْ لَا يَرْحَمُنَا.
اللَّهُمَّ لَا تَدَعْ لَنَا ذَنْبًا إِلَّا غَفَرْتَهُ، وَلَا هَمًّا إِلَّا فَرَّجْتَهُ، وَلَا دَيْنًا إِلَّا قَضَيْتَهُ، وَلَا حَاجَةً مِنْ حَوَائِجِ الدُّنْيَا وَالآخِرَةِ إِلَّا قَضَيْتَهَا يَا أَرْحَمَ الرَّاحِمِينَ.
رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ، وَصَلَّى اللهُ عَلَى سَيِّدِنَا وَنَبِيِّنَا مُحَمَّدٍ وَعَلَى آلِهِ وَأَصْحَابِهِ الأَخْيَارِ وَسَلَّمَ تَسْلِيمًا كَثِيرًا.`;
const KD_B=`اللَّهُمَّ إِنِّي عَبْدُكَ، ابْنُ عَبْدِكَ، ابْنُ أَمَتِكَ، نَاصِيَتِي بِيَدِكَ، مَاضٍ فِيَّ حُكْمُكَ، عَدْلٌ فِيَّ قَضَاؤُكَ، أَسْأَلُكَ بِكُلِّ اسْمٍ هُوَ لَكَ سَمَّيْتَ بِهِ نَفْسَكَ، أَوْ عَلَّمْتَهُ أَحَدًا مِنْ خَلْقِكَ، أَوْ أَنْزَلْتَهُ فِي كِتَابِكَ، أَوِ اسْتَأْثَرْتَ بِهِ فِي عِلْمِ الغَيْبِ عِنْدَكَ، أَنْ تَجْعَلَ القُرْآنَ رَبِيعَ قَلْبِي، وَنُورَ صَدْرِي، وَجِلَاءَ حُزْنِي، وَذَهَابَ هَمِّي.`;
const KD_A=[[2,127],[2,201],[3,8],[2,286]];
async function khatmDua(){try{await qLoadPack('hafs')}catch(e){}const Q=S.quran,own=(Q.myDua||'').trim();
  const ay=KD_A.map(([s,a])=>{let w=String(qAyahText(s,a,'hafs')||'').split(' ').filter(x=>x&&!/[٠-٩﴿﴾]/.test(x));const i=w.findIndex(x=>qNorm(x)[0].startsWith('ربنا'));const cut=i>0;if(i>0)w=w.slice(i);const tx=w.join(' ');return tx?`<p class="kdq" dir="rtl">﴿${cut?'… ':''}${esc(tx)}﴾ <small>[${esc(qSurahName(s))} ${a}]</small></p>`:''}).join('');
  const sec=(k,open,title,src,body)=>`<details class="kds"${open?' open':''}><summary><b>${title}</b><small>${src}</small></summary><div class="kdb">${body}</div></details>`;
  const para=x=>x.split('\n').map(l=>`<p dir="rtl">${esc(l)}</p>`).join('');
  openInfo('🤲 '+t('kd.t'),`<p class="kdin">${t('kd.intro')}</p>
    ${sec('a',true,t('kd.a'),t('kd.aS'),ay)}
    ${sec('b',false,t('kd.b'),t('kd.bS'),para(KD_B))}
    ${sec('c',false,t('kd.c'),t('kd.cS'),para(KD_C))}
    ${sec('d',false,t('kd.d'),t('kd.dS'),para(KD_D))}
    ${sec('e',!!own,t('kd.e'),t('kd.eS'),`<textarea class="in kdta" id="kdOwn" dir="auto" rows="4" placeholder="${esc(t('kd.ePh'))}">${esc(own)}</textarea><button class="btn sm" id="kdSave">${t('kd.save')}</button>`)}`);
  const sv=$('#kdSave');if(sv)sv.onclick=()=>{S.quran.myDua=$('#kdOwn').value.trim();save();toast(t('kd.saved'))}}
{const _au=alertUser;alertUser=function(title,...a){const r=_au(title,...a);try{if(title===t('q.khatmaDone'))setTimeout(khatmDua,1200)}catch(e){}return r}}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#qsDua');if(b)khatmDua()});
/* ---------- search by root (data: Quranic Arabic Corpus 0.4, derived index in QROOT_GZ) ---------- */
let QROOT=null;
async function qRootIdx(){if(QROOT)return QROOT;const bin=Uint8Array.from(atob(await qRootLoad()),c=>c.charCodeAt(0));const ds=new Blob([bin]).stream().pipeThrough(new DecompressionStream('gzip'));const raw=JSON.parse(await new Response(ds).text());
  const roots=Object.keys(raw).map(r=>{const ay=raw[r].split(';').map(x=>{const[s,a,w]=x.split('.');return{s:parseInt(s,36),a:parseInt(a,36),w:w.split('+').map(z=>parseInt(z,36))}});return{r,k:qRootKey(r),ay,n:ay.reduce((t,x)=>t+x.w.length,0)}});
  QROOT={roots,by:new Map(roots.map(o=>[o.r,o]))};return QROOT}
function qRootKey(s){return String(s||'').replace(/[\sـًٌٍَُِّْٰ]/g,'').replace(/[أإآٱءؤئ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه')}
function qRootSpaced(r){return[...r].join(' ')}
const QRS={on:false,root:null};
{const _so=qSearchOpen;qSearchOpen=async function(...a){const r=await _so(...a);try{const inp=$('#qSrch');if(!inp||$('#qsMode'))return r;
  inp.insertAdjacentHTML('beforebegin',`<div class="qsmode" id="qsMode" role="tablist"><button data-m="w" class="${QRS.on?'':'on'}">${t('qr.word')}</button><button data-m="r" class="${QRS.on?'on':''}">${t('qr.root')}</button></div>`);
  $$('#qsMode [data-m]').forEach(b=>b.onclick=()=>{QRS.on=b.dataset.m==='r';$$('#qsMode [data-m]').forEach(x=>x.classList.toggle('on',x===b));inp.placeholder=QRS.on?t('qr.ph'):t('q.searchPh');inp.value='';inp.focus();qRootPaint('')});
  const oi=inp.oninput;inp.oninput=e=>{if(QRS.on){qRootPaint(inp.value);return}oi&&oi(e)};if(QRS.on){inp.placeholder=t('qr.ph');qRootPaint(inp.value)}}catch(e){console.error(e)}return r}}
async function qRootPaint(v){const box=$('#qSres');if(!box)return;QRS.root=null;let I;try{I=await qRootIdx()}catch(e){box.innerHTML=`<div class="empty">${t('qr.fail')}</div>`;return}
  const k=qRootKey(v),credit=`<p class="qrcred">${t('qr.cred')} <a href="#" id="qrLink">corpus.quran.com</a></p>`;
  if(!k){box.innerHTML=`<div class="empty">${t('qr.hint')}</div>`+credit;qRootBind();return}
  const exact=I.roots.filter(o=>o.k===k),near=I.roots.filter(o=>o.k!==k&&o.k.startsWith(k)).sort((a,b)=>b.n-a.n).slice(0,24);
  if(exact.length===1&&!near.length){qRootShow(exact[0]);return}
  const chips=[...exact,...near];box.innerHTML=chips.length?`<div class="qrchips">${chips.map(o=>`<button class="qrchip" data-r="${esc(o.r)}"><b>${esc(qRootSpaced(o.r))}</b><small>${o.n}</small></button>`).join('')}</div>`+credit:`<div class="empty">${t('qr.none')}</div>`+credit;
  qRootBind();box.querySelectorAll('[data-r]').forEach(b=>b.onclick=()=>qRootShow(I.by.get(b.dataset.r)))}
function qRootBind(){const l=$('#qrLink');if(l)l.onclick=e=>{e.preventDefault();openExt('https://corpus.quran.com')}}
async function qRootShow(o){const box=$('#qSres');if(!box||!o)return;QRS.root=o;try{await qIndex()}catch(e){}const rl=[...o.k];
  const hl=(word)=>{const n=qNorm(word)[0];let i=0;for(const c of n){if(c===rl[i])i++;if(i>=rl.length)break}return i>=Math.min(2,rl.length)};
  const rows=o.ay.slice(0,300).map(x=>{const q=QIX&&QIX.map[x.s+':'+x.a];if(!q)return'';const mk=new Set();x.w.forEach(w=>{for(const d of[0,-1,1,-2,2]){const i=w-1+d;if(i>=0&&i<q.w.length&&!mk.has(i)&&hl(q.w[i])){mk.add(i);break}}});const ws=q.w.map((w,i)=>mk.has(i)?`<mark>${esc(w)}</mark>`:esc(w)).join(' ');
    return`<button class="suitem qsr" data-k="${x.s}:${x.a}"><b>${esc(qSurahName(x.s))} ${x.a} <small>· ${t('q.page')} ${q.p}</small></b><span class="qtxs" dir="rtl">${ws}</span></button>`}).join('');
  box.innerHTML=`<div class="qscount"><button class="link" id="qrBack">‹ ${t('qr.back')}</button> ${t('qr.res',qRootSpaced(o.r),o.n,o.ay.length)}</div>${rows}<p class="qrcred">${t('qr.cred')} <a href="#" id="qrLink">corpus.quran.com</a></p>`;
  qRootBind();$('#qrBack').onclick=()=>qRootPaint($('#qSrch').value);box.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{closeLt();const[s,a]=b.dataset.k.split(':').map(Number);qGoAyah(s,a)});box.scrollTop=0}
/* ---------- recitation over a scanned mushaf: its pages follow the Hafs page numbers only roughly ---------- */
{const _pf=qPlayFrom;qPlayFrom=async function(...a){try{const R=RIWAYAT[S.quran.riwaya];if(R&&R.kind==='img'&&!QRS.scanTold){QRS.scanTold=1;toast(t('q54.scan'),7000)}}catch(e){}return _pf(...a)}}

