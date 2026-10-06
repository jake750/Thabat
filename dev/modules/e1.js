/* ============ v3.3: more riwayat + mushaf from your own scans ============ */
Object.assign(RIWAYAT,{
  doori:{ar:'الدوري عن أبي عمرو البصري',en:'al-Duri ʿan Abi ʿAmr',kind:'text',dir:'doori',data:'DooriData_v09.json',font:'doori.9.woff2'},
  bazzi:{ar:'البزّي عن ابن كثير المكي',en:'al-Bazzi ʿan Ibn Kathir',kind:'text',dir:'bazzi',data:'BazziData_v07.json',font:'bazzi.7.woff2'},
  qumbul:{ar:'قنبل عن ابن كثير المكي',en:'Qunbul ʿan Ibn Kathir',kind:'text',dir:'qumbul',data:'QumbulData_v07.json',font:'qumbul.7.woff2'},
  shouba:{ar:'شعبة عن عاصم الكوفي',en:'Shuʿba ʿan ʿAsim',kind:'text',dir:'shouba',data:'ShoubaData08.json',font:'shouba.8.woff2'}});
/* riwayat whose Fatiha counts the basmala as its first ayah */
const QFATIHA_B=['hafs','bazzi','qumbul','shouba'];
/* the 20 canonical riwayat; the ones without a verified digital text can be added from the reader's own scans */
const RIW20=[['qaloon','قالون عن نافع','Qalun ʿan Nafiʿ'],['warsh','ورش عن نافع','Warsh ʿan Nafiʿ'],['bazzi','البزّي عن ابن كثير','al-Bazzi'],['qumbul','قنبل عن ابن كثير','Qunbul'],['doori','الدوري عن أبي عمرو','al-Duri ʿan Abi ʿAmr'],['soosi','السوسي عن أبي عمرو','al-Susi'],
  ['hisham','هشام عن ابن عامر','Hisham ʿan Ibn ʿAmir'],['dhakwan','ابن ذكوان عن ابن عامر','Ibn Dhakwan ʿan Ibn ʿAmir'],['shouba','شعبة عن عاصم','Shuʿba ʿan ʿAsim'],['hafs','حفص عن عاصم','Hafs ʿan ʿAsim'],['khalaf','خلف عن حمزة','Khalaf ʿan Hamza'],['khallad','خلّاد عن حمزة','Khallad ʿan Hamza'],
  ['harith','أبو الحارث عن الكسائي','Abu al-Harith ʿan al-Kisaʾi'],['doorik','الدوري عن الكسائي','al-Duri ʿan al-Kisaʾi'],['wardan','ابن وردان عن أبي جعفر','Ibn Wardan ʿan Abi Jaʿfar'],['jammaz','ابن جمّاز عن أبي جعفر','Ibn Jammaz ʿan Abi Jaʿfar'],
  ['ruways','رُوَيس عن يعقوب','Ruways ʿan Yaʿqub'],['rawh','رَوح عن يعقوب','Rawh ʿan Yaʿqub'],['ishaq','إسحاق عن خلف العاشر','Ishaq ʿan Khalaf al-ʿAshir'],['idris','إدريس عن خلف العاشر','Idris ʿan Khalaf al-ʿAshir']];
function customRiw(c){return{ar:c.ar+' (صورك)',en:c.en+' (your scans)',kind:'img',cache:true,custom:true,pages:c.pages,local:'mushaf/_custom_/',ext:'.none',remote:()=>'data:,',transparent:false}}
function customLoad(){(S.quran.custom||[]).forEach(c=>{RIWAYAT[c.id]=customRiw(c)})}
customLoad();
async function idbDel(k){const db=await idb();return new Promise(r=>{const tx=db.transaction('kv','readwrite');tx.objectStore('kv').delete(k);tx.oncomplete=r;tx.onerror=r})}
/* grouped riwaya picker: text riwayat, scans, your own scans */
qRiwOptions=function(){const g=(lab,ks)=>ks.length?`<optgroup label="${esc(lab)}">${ks.map(k=>`<option value="${k}">${esc(riwName(k))}</option>`).join('')}</optgroup>`:'';const K=Object.keys(RIWAYAT);
  return g(t('rw.text'),K.filter(k=>RIWAYAT[k].kind==='text'))+g(t('rw.img'),K.filter(k=>RIWAYAT[k].kind==='img'&&!RIWAYAT[k].custom))+g(t('rw.mine'),K.filter(k=>RIWAYAT[k].custom))};
/* add a mushaf from your own page images */
function openCustomMushaf(){const have=new Set(Object.keys(RIWAYAT).filter(k=>RIWAYAT[k].kind==='text'||k==='khalaf'));
  const opts=RIW20.map(([id,ar,en])=>`<option value="${id}" ${have.has(id)?'disabled':''}>${esc(LANG==='ar'?ar:en)}${have.has(id)?' ✓':''}</option>`).join('');
  const mine=(S.quran.custom||[]).map(c=>`<div class="cmrow"><span>${esc(LANG==='ar'?c.ar:c.en)} · ${c.pages} ${t('q.pageS')}</span><button class="btn sm ghost" data-cmdel="${c.id}">${t('del')}</button></div>`).join('');
  openInfo('📖 '+t('cm.t'),`<p class="muted" style="margin:0 0 10px">${t('cm.sub')}</p>${mine?`<div class="cmlist">${mine}</div>`:''}
   <div class="field"><div><label>${t('cm.riw')}</label></div><select class="in" id="cmRiw">${opts}<option value="_other">${t('cm.other')}</option></select></div>
   <div class="field" id="cmOtherF" hidden><div><label>${t('cm.name')}</label></div><input class="in" id="cmOther" dir="auto"></div>
   <div class="field"><div><label>${t('cm.files')}</label><small>${t('cm.filesSub')}</small></div><input type="file" id="cmFiles" accept="image/*" multiple></div>
   <div class="row" style="justify-content:flex-end;margin-top:10px"><span id="cmSt" class="muted" style="margin-inline-end:auto"></span><button class="btn" id="cmGo">${t('cm.add')}</button></div>`);
  const fr=RIW20.find(x=>!have.has(x[0]));if(fr)$('#cmRiw').value=fr[0];
  $('#cmRiw').onchange=()=>{$('#cmOtherF').hidden=$('#cmRiw').value!=='_other'};
  $$('[data-cmdel]').forEach(b=>b.onclick=async()=>{const id=b.dataset.cmdel,c=(S.quran.custom||[]).find(x=>x.id===id);if(!c)return;S.quran.custom=S.quran.custom.filter(x=>x.id!==id);delete RIWAYAT[id];if(S.quran.riwaya===id)S.quran.riwaya='hafs';save();
    for(let p=1;p<=c.pages;p++){try{await idbDel(qImgKey(id,p))}catch(e){}}toast(t('cm.deleted'));openCustomMushaf();if(curView()==='quran')renderQuran()});
  $('#cmGo').onclick=async()=>{const fs=[...$('#cmFiles').files].sort((a,b)=>a.name.localeCompare(b.name,undefined,{numeric:true}));if(!fs.length){toast(t('cm.none'));return}
    const sel=$('#cmRiw').value,base=RIW20.find(x=>x[0]===sel);let ar,en;if(sel==='_other'){ar=en=($('#cmOther').value||'').trim();if(!ar){toast(t('cm.name'));return}}else{ar=base[1];en=base[2]}
    const id='cu_'+(sel==='_other'?uid():sel);$('#cmGo').disabled=true;
    for(let i=0;i<fs.length;i++){await idbSet(qImgKey(id,i+1),fs[i]);if(i%10===0)$('#cmSt').textContent=t('cm.prog',i+1,fs.length)}
    S.quran.custom=(S.quran.custom||[]).filter(x=>x.id!==id);S.quran.custom.push({id,ar,en,pages:fs.length});customLoad();S.quran.riwaya=id;S.quran.view=1;S.quran.pv=1;save();
    $('#modal').classList.remove('on');$$('.modal.on').forEach(m=>m.classList.remove('on'));toast(t('cm.done',fs.length));showView('quran');renderQuran()}}
{const b=$('#cmBtn');if(b)b.onclick=openCustomMushaf}
{const _qli2=qLoadImg;qLoadImg=function(im,p,r){const R=RIWAYAT[r];if(R&&R.custom&&p>R.pages){const d=document.createElement('div');d.className='fail';d.textContent=t('cm.end',R.pages);im.replaceWith(d);return}_qli2(im,p,r)}}
{const _qda=qDownloadAll;qDownloadAll=function(){const R=RIWAYAT[S.quran.riwaya];if(R&&R.custom)return;return _qda()}}
