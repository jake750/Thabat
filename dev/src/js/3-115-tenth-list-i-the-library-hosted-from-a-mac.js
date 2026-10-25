/* ============ 3.115 tenth list I: the library hosted from a Mac (thabat-library.py + Thabat-Library.command in the Mac zip) ============ */
/* the Mac server answers /cfg like the PC one, so libConnect already finds it; the settings window shows its folders and the pairing code, or how to start it */
async function libMacUp(){if(!MAC)return false;try{await libConnect();return !!LIB.base&&LIB.via==='pc'}catch(e){return false}}
{const _o=openLibSetup;openLibSetup=async function(...a){const r=await _o(...a);try{if(!MAC)return r;const box=$('#infoBox');if(!box)return r;const pk=$('#lbPick');if(pk)pk.remove();const pa=$('#lbPath');if(pa)pa.placeholder='~/Courses';
  if(!(LIB.base&&LIB.via==='pc')&&!$('#lbmHow'))box.querySelector('h4')?.insertAdjacentHTML('beforebegin',`<div id="lbmHow" class="lbmhow"><b>💻 ${esc(t('lbm.t'))}</b><p>${esc(t('lbm.how'))}</p></div>`)}catch(e){console.error(e)}return r}}

