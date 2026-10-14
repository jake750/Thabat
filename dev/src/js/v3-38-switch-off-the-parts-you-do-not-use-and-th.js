/* ============ v3.38: «أقسام ثبات» — switch off the parts you do not use, and they leave the menus ============ */
/* S.settings.areasOff = {key:true}. Each part lists where it shows (CSS selectors hidden by html.aoff-<key>), its Ctrl+K commands
   (matched on the command's keywords) and, for the library, the page in the nav and its automatic «lesson of the day» tasks.
   Nothing is deleted: switching a part on again brings everything back as it was. */
const AREAS=[
  {k:'lib',i:'🎬',sel:['.navbtn[data-v="lib"]','#bLearn'],cmd:/library|recitation/i,view:'lib'},
  {k:'boards',i:'🧩',sel:['#nbSeg [data-k="boards"]']},
  {k:'studio',i:'🎨',sel:['#nbSeg [data-k="studio"]','#v-set .field:has(#stChipT)'],cmd:/studio|flashcards|challenge/i},
  {k:'goals',i:'🎯',sel:['#glBtn','#ygBtn','#v-set .field:has(#pjManage)','#v-set .field:has(#billT)','#v-set .field:has(#estT)','#v-set .field:has(#pjDueBtn)'],cmd:/^goals|projects/i},
  {k:'media',i:'🎧',sel:['#v-today .card:has(#mfToday)','#v-brief .card:has(#mfBrief)'],cmd:/media log/i},
  {k:'health',i:'💪',sel:['#hhBtn']},
  {k:'inbox',i:'💡',sel:['#inbBtn'],cmd:/inbox/i},
  {k:'badges',i:'🏅',sel:['#bdBtn'],cmd:/badges/i},
  {k:'letters',i:'✉',sel:[],cmd:/letter/i},
  {k:'wextra',i:'🕋',sel:['#worshipTools [data-w="1"]','#worshipTools [data-w="2"]','#worshipTools [data-w="4"]','#worshipTools [data-w="5"]'],cmd:/qada|zakat|group khatma|year harvest/i},
];
function areasOff(){return S.settings.areasOff||(S.settings.areasOff={})}
function areaOff(k){return !!areasOff()[k]}
function areasCSS(){let el=$('#areasCss');if(!el){el=document.createElement('style');el.id='areasCss';document.head.append(el)}
  el.textContent=AREAS.filter(a=>a.sel.length).map(a=>`html.aoff-${a.k} :is(${a.sel.join(',')}){display:none!important}`).join('\n')}
function areasApply(){const h=document.documentElement;AREAS.forEach(a=>h.classList.toggle('aoff-'+a.k,areaOff(a.k)));
  const v=typeof curView==='function'?curView():null;const a=AREAS.find(x=>x.view&&x.view===v);if(a&&areaOff(a.k))showView('today')}
/* Ctrl+K leaves out the commands of a part that is off */
{const _cc=cmdCommands;cmdCommands=function(...a){const L_=_cc(...a);const off=AREAS.filter(x=>x.cmd&&areaOff(x.k));return off.length?L_.filter(c=>!off.some(x=>x.cmd.test(String(c.kw||'')))):L_}}
/* the library off: no automatic «lesson of the day» task */
{const _el=ensureLod;ensureLod=function(...a){if(areaOff('lib'))return;return _el(...a)}}
function openAreas(){const O=areasOff();
  openInfo('🧩 '+t('ar.t'),`<p class="muted" style="margin:0 0 10px">${t('ar.sub')}</p><div class="arlist">${AREAS.map(a=>`<div class="arrow"><span class="aric">${a.i}</span><div class="artx"><b>${t('ar.'+a.k)}</b><small>${t('ar.'+a.k+'S')}</small></div><button class="sw-toggle ${O[a.k]?'':'on'}" data-ar="${a.k}" aria-pressed="${!O[a.k]}" aria-label="${esc(t('ar.'+a.k))}"></button></div>`).join('')}</div><p class="muted" style="margin:10px 0 0;font-size:12px">${t('ar.note')}</p>`);
  $$('#infoBox [data-ar]').forEach(b=>b.onclick=()=>{const k=b.dataset.ar,on=!b.classList.contains('on');if(on)delete O[k];else O[k]=true;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on);save();areasApply();try{renderAll()}catch(e){}})}
/* where to find it: a row in Settings → Look after «simple mode», and a command */
function areasRow(){const f=$('#simpleT')&&$('#simpleT').closest('.field');if(!f||$('#areasBtn'))return;
  f.insertAdjacentHTML('afterend',`<div class="field"><div><label>${t('ar.t')}</label><small>${t('ar.row')}</small></div><button class="btn sm" id="areasBtn">${t('ar.open')}</button></div>`);$('#areasBtn').onclick=openAreas}
{hookFn('renderSettings',()=>renderSettings,f=>{renderSettings=f},'post',function(){try{areasRow()}catch(e){}})}
{const _cc=cmdCommands;cmdCommands=function(...a){const L_=_cc(...a);L_.push({icon:'🧩',label:t('ar.t'),run:()=>openAreas(),kw:'sections parts features أقسام ميزات'});return L_}}
areasCSS();areasApply();setTimeout(()=>{try{areasRow()}catch(e){}},500);

