/* ============ v3.91.0: the twenty riwayat of the ten readers as scanned mushafs (Islamweb, on the Internet Archive) ============ */
/* each item was checked by the riwaya title printed on its own pages (pages 2 and 604) and has 604 pages: image n(p-1) = page p.
   the item named «إسحاق الوراق» (assha84458458458458) holds the Idris mushaf, so Ishaq comes from 20230515_20230515_1148. */
function iwIiif(item){return p=>'https://iiif.archive.org/iiif/'+item+'$'+(p-1)+'/full/1000,/0/default.jpg'}
const IW20={hafs:'3333333333333333567890-',shouba:'575766666666666555555555555555',warsh:'67666666666666666699',qaloon:'333333333356----0',
  bazzi:'7878666666666666666665',qumbul:'685888888888888888555555',doori:'547450000000000000',soosi:'33444444444444444323',
  hisham:'quran_20150330777777777777777777',dhakwan:'45678888888888888888876',khalaf:'khala__an__hamzah',khallad:'khalaad-an35686565655368353568335686-hamza',
  harith:'aby__alharet56856865835368535683536586h__alkesaey',doorik:'aldoory___alkesaey___pdf',wardan:'bn94694-wrdan-an-ja3fr',jammaz:'bn-j3483568586maz-an-ja3fr',
  ruways:'rowais----an---ya3qoop',rawh:'rooh---an--ya3qoop',ishaq:'20230515_20230515_1148',idris:'adrees4zzar6945794794699'};
RIW20.forEach(([id,ar,en])=>{const item=IW20[id];if(!item)return;
  RIWAYAT['iw_'+id]={ar:ar+' · إسلام ويب',en:en+' · Islamweb',kind:'img',iw:1,cache:true,local:'mushaf/iw-'+id+'/',ext:'.jpg',
    remote:p=>'https://archive.org/download/'+item+'/page/n'+(p-1)+'_w1000.jpg',fetchUrl:iwIiif(item)}});
/* the archive's page images cannot be read by fetch (no CORS), so a copy for this device is taken from its IIIF server, which allows it; the old Khalaf scans too */
RIWAYAT.khalaf.fetchUrl=iwIiif('20201025_20201025_0144');
qRiwOptions=function(){const g=(lab,ks)=>ks.length?`<optgroup label="${esc(lab)}">${ks.map(k=>`<option value="${k}">${esc(riwName(k))}</option>`).join('')}</optgroup>`:'';const K=Object.keys(RIWAYAT);
  return g(t('rw.text'),K.filter(k=>RIWAYAT[k].kind==='text'))+g(t('iw.grp'),K.filter(k=>RIWAYAT[k].iw))+g(t('rw.img'),K.filter(k=>RIWAYAT[k].kind==='img'&&!RIWAYAT[k].custom&&!RIWAYAT[k].iw))+g(t('rw.mine'),K.filter(k=>RIWAYAT[k].custom))};
/* the first time one of them opens: where the pages come from and what the colours mean */
{hookFn('qSetRiwaya',()=>qSetRiwaya,f=>{qSetRiwaya=f},'post',function(r){try{if(RIWAYAT[r]&&RIWAYAT[r].iw&&!localStorage.getItem('thabat.iwTold')){localStorage.setItem('thabat.iwTold','1');openInfo(t('iw.t'),`<p>${esc(t('iw.p1'))}</p><p>${esc(t('iw.p2'))}</p><p class="muted">${esc(t('iw.p3'))}</p>`)}}catch(e){}})}
/* every riwaya now has a mushaf, so the «your own scans» chooser marks them as present */
{const _o=openCustomMushaf;openCustomMushaf=function(...a){const r=_o.apply(this,a);try{$$('#infoBox option[value], .modal.on option[value]').forEach(o=>{if(IW20[o.value]&&!o.disabled&&!/✓$/.test(o.textContent)){o.textContent+=' · '+t('iw.has')}})}catch(e){}return r}}
try{const q=$('#qRiw');if(q){q.innerHTML=qRiwOptions();q.value=S.quran.riwaya}}catch(e){}

