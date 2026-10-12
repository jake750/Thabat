/* ============ v3.31.1: macOS — install and update with one Terminal command (files fetched by curl carry no quarantine mark, so Gatekeeper does not block the launchers) ============ */
const MAC_CMD='curl -fsSL https://raw.githubusercontent.com/jake750/Thabat/main/dev/mac/install.sh | bash';
function macUpdHelp(L){openInfo('🍎 '+t('mac.t'),`<p>${t('mac.sub')}</p><ol class="machow"><li>${t('mac.s1')}</li><li>${t('mac.s2')}</li><li>${t('mac.s3')}</li></ol>
  <div class="maccmd"><code dir="ltr" id="macCmd">${esc(MAC_CMD)}</code><button class="btn sm pri" id="macCopy">📋 ${t('mac.copy')}</button></div><p class="muted">${t('mac.note')}</p>${L?`<button class="link" id="macZip">${t('mac.zip')}</button>`:''}`);
  $('#macCopy').onclick=async()=>{try{await navigator.clipboard.writeText(MAC_CMD);toast(t('mac.copied'))}catch(e){const r=document.createRange();r.selectNodeContents($('#macCmd'));const s=getSelection();s.removeAllRanges();s.addRange(r)}};
  const z=$('#macZip');if(z)z.onclick=()=>openExt(L.mac||L.page)}
{const _ua=updApply;updApply=async function(L,...a){if(MAC){macUpdHelp(L);return}return _ua(L,...a)}}

