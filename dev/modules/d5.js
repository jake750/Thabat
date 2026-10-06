/* ============ v3.3 release: store build flag, support e-mail, small fixes ============ */
/* the Google Play build sets this to true: no downloading audio from YouTube/SoundCloud there */
const THABAT_PLAY=false;
if(THABAT_PLAY)document.documentElement.classList.add('play');
/* where bug reports are sent (leave empty to let the user pick) */
const SUPPORT_EMAIL='';
{const _ob=openBug;openBug=function(){_ob();const b=$('#bugMail');if(b&&SUPPORT_EMAIL){b.onclick=()=>{const txt=($('#bugTx').value.trim()||'—')+'\n\n----\n'+bugInfo();const u='mailto:'+SUPPORT_EMAIL+'?subject='+encodeURIComponent('Thabat '+APP_VER+' — '+t('bug.t'))+'&body='+encodeURIComponent(txt.slice(0,1800));if(ANDROID)window.ThabatAndroid.openUrl(u);else location.href=u}}}}
/* the calendar legend button shows a Latin question mark in English */
{const _rc=renderCal;renderCal=function(){_rc();const b=$('#calLeg');if(b)b.textContent=LANG==='ar'?'؟':'?'}}
/* PC: size the app to the height that is really visible (Edge app windows can report more than they show) */
function pcFit(){if(ANDROID)return;const vv=window.visualViewport,h=Math.min(window.innerHeight,vv?Math.round(vv.height):1e9,document.documentElement.clientHeight||1e9);if(h>200)document.documentElement.style.setProperty('--pch',h+'px')}
window.addEventListener('resize',pcFit);if(window.visualViewport)visualViewport.addEventListener('resize',pcFit);setTimeout(pcFit,0);setTimeout(pcFit,800);
