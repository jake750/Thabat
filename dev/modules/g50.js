/* ============ v3.40: share Thabat — the one-file Windows setup, the Mac command and the APK, ready to send ============ */
const SHARE_L={win:'https://github.com/jake750/Thabat/releases/latest/download/Thabat-Setup.exe',apk:'https://github.com/jake750/Thabat/releases/latest/download/Thabat.apk',page:'https://github.com/jake750/Thabat/releases/latest'};
function shareText(){return [t('sh.msg'),'',t('sh.win')+': '+SHARE_L.win,t('sh.winNote'),'',t('sh.mac')+':',MAC_CMD,'',t('sh.and')+': '+SHARE_L.apk].join('\n')}
async function shCopy(txt){try{await navigator.clipboard.writeText(txt);toast(t('mac.copied'));return true}catch(e){return false}}
function openShare(){
  const row=(ic,k,body,btn)=>`<div class="shrow"><b>${ic} ${t(k)}</b>${body}${btn||''}</div>`;
  openInfo('📤 '+t('sh.t'),`<p class="muted" style="margin:0 0 10px">${t('sh.sub')}</p>`+
    row('💻','sh.win',`<p class="muted">${t('sh.winNote')}</p><div class="maccmd"><code dir="ltr">${esc(SHARE_L.win)}</code><button class="btn sm" data-sh="win">📋 ${t('mac.copy')}</button></div>`)+
    row('🍎','sh.mac',`<p class="muted">${t('sh.macNote')}</p><div class="maccmd"><code dir="ltr">${esc(MAC_CMD)}</code><button class="btn sm" data-sh="mac">📋 ${t('mac.copy')}</button></div>`)+
    row('📱','sh.and',`<div class="maccmd"><code dir="ltr">${esc(SHARE_L.apk)}</code><button class="btn sm" data-sh="apk">📋 ${t('mac.copy')}</button></div>`)+
    `<div class="row" style="justify-content:flex-start;gap:8px;margin-top:10px"><button class="btn sm pri" id="shAll">📋 ${t('sh.all')}</button>${navigator.share?`<button class="btn sm" id="shSend">📤 ${t('sh.send')}</button>`:''}</div>`);
  const T_={win:SHARE_L.win,mac:MAC_CMD,apk:SHARE_L.apk};
  $$('#infoBox [data-sh]').forEach(b=>b.onclick=()=>shCopy(T_[b.dataset.sh]));
  $('#shAll').onclick=()=>shCopy(shareText());
  const s=$('#shSend');if(s)s.onclick=()=>{try{navigator.share({title:'ثبات · Thabat',text:shareText()})}catch(e){}}}
/* in Settings → About, after the creator line */
function shareRow(){const a=$('#aboutV')&&$('#aboutV').closest('.field');if(!a||$('#shareBtn'))return;
  a.insertAdjacentHTML('afterend',`<div class="field"><div><label>${t('sh.t')}</label><small>${t('sh.row')}</small></div><button class="btn sm" id="shareBtn">📤 ${t('sh.open')}</button></div>`);$('#shareBtn').onclick=openShare}
{hookFn('renderSettings',()=>renderSettings,f=>{renderSettings=f},'post',function(){try{shareRow()}catch(e){}})}
{const _cc=cmdCommands;cmdCommands=function(...a){const L_=_cc(...a);L_.push({icon:'📤',label:t('sh.t'),run:()=>openShare(),kw:'share install download شارك تثبيت تحميل'});return L_}}
setTimeout(()=>{try{shareRow()}catch(e){}},700);
