/* ============ 3.171: more languages — choosing one loads its file first; settings and the first run list every language ============ */
{const _s=setLang;setLang=function(l,...a){const me=this;if(!l)return;try{localStorage.setItem('thabat.lang',l)}catch(e){}
  if(lngApply(l))return _s.call(me,l,...a);
  return lngLoad(l).then(ok=>{if(ok&&lngApply(l))return _s.call(me,l,...a);toast(t('lng.fail'))})}}
function lngList(){return LANGS.filter(x=>x.c==='ar'||x.c==='en'||x.pct>0)}
function lngName(c){const x=LANGS.find(o=>o.c===c);return x?x.n:c}
function lngOpts(cur){return lngList().map(x=>`<option value="${x.c}"${x.c===cur?' selected':''}>${esc(x.n)}${x.c!=='ar'&&x.c!=='en'&&x.pct<100?' · '+x.pct+'%':''}</option>`).join('')}
const LNG_HELP='https://github.com/jake750/Thabat/blob/main/dev/i18n/README.md';
function lngSetPaint(){const s=$('#langIn');if(!s)return;if(s.dataset.lng!=='1'){s.innerHTML=lngOpts(LANG);s.dataset.lng='1'}s.value=LANG;
  if(!$('#lngHelp')){const f=s.closest('.field');if(f)f.insertAdjacentHTML('afterend',`<p class="muted lnghelp" id="lngHelp"><button class="link" type="button" id="lngHelpB">${esc(t('lng.help'))}</button> <small>${esc(t('lng.helpSub'))}</small></p>`);
    const b=$('#lngHelpB');if(b)b.onclick=()=>{try{openExt(LNG_HELP)}catch(e){window.open(LNG_HELP,'_blank')}}}}
hookFn('renderSettings',()=>renderSettings,f=>{renderSettings=f},'post',function(){try{lngSetPaint()}catch(e){}});
try{lngSetPaint()}catch(e){}
