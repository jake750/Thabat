/* ============ v3.2.5: creator credit (jake750_) and a firmer bottom-bar lift on Android ============ */
const CREDIT_NAME='jake750_';
function creditHTML(big){return`<span class="credit${big?' big':''}" dir="ltr"><i class="crlogo" aria-hidden="true"></i><span>created by <b>${CREDIT_NAME}</b></span></span>`}
function ensureCredit(){try{
  const av=$('#aboutV');if(av){const row=av.closest('.field');let cr=$('#creditRow');
    if(!cr||!cr.textContent.includes(CREDIT_NAME)||!cr.querySelector('.crlogo')){if(cr)cr.remove();row.insertAdjacentHTML('beforebegin',`<div class="field" id="creditRow"><div>${creditHTML(true)}<small><span dir="ltr">© ${new Date().getFullYear()} ${CREDIT_NAME}</span> — ${t("cr.rights")}</small></div></div>`)}}
  const sv=$('#v-set');if(sv){let f=$('#creditFoot');if(!f||!f.textContent.includes(CREDIT_NAME)){if(f)f.remove();sv.insertAdjacentHTML('beforeend',`<div class="creditfoot" id="creditFoot">${creditHTML()}</div>`)}}
}catch(e){}}
{const _rs19=renderSettings;renderSettings=function(){_rs19();ensureCredit()}}
setTimeout(ensureCredit,800);setInterval(()=>{if(curView()==='set')ensureCredit()},15000);
/* Android bottom bar: default lift (adjustable in Settings) + live diagnostics */
if(ANDROID&&S.settings.andOff===undefined){S.settings.andOff=32;save()}
andOffApply();
{const _r44=renderV44Set;renderV44Set=function(){_r44();const se=$('#andOffSel');if(!se)return;let d=$('#andDiag');if(!d){se.closest('.field').querySelector('div').insertAdjacentHTML('beforeend','<small id="andDiag" dir="ltr" style="opacity:.6"></small>');d=$('#andDiag')}
  const N=window.ANDNAV||{};d.textContent=`h ${innerHeight} · web ${N.webh??'-'} · nav ${N.nb??'-'} · fix ${N.fix??'-'} · +${+S.settings.andOff||0}`}}
