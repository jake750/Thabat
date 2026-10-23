/* ============ 3.103 the theme editor: own accent and water colours, the page hue, the font; saved themes and theme files ============ */
/* S.settings.th2 = {acc, accL (light-mode accent, else derived), water, sh (page hue 0–360), font}; it is the colour «custom» (COLORS.custom),
   chosen like any other colour. Saved themes S.themes=[{id,n,...th2}] (synced). A theme file = {thabatTheme:1,n,acc,accL,water,sh,font}. */
const THF={plex:['IBM Plex Sans Arabic',''],kufi:['Noto Kufi Arabic','Noto+Kufi+Arabic:wght@400;600;700'],tajawal:['Tajawal','Tajawal:wght@400;500;700'],cairo:['Cairo','Cairo:wght@400;600;700'],almarai:['Almarai','Almarai:wght@400;700'],amiri:['Amiri','Amiri:wght@400;700'],system:['','']};
function thHexMix(h,k){const m=String(h||'').match(/^#?([0-9a-f]{6})$/i);if(!m)return h;const n=parseInt(m[1],16),f=c=>Math.round(c*(1-k));return'#'+[n>>16&255,n>>8&255,n&255].map(c=>f(c).toString(16).padStart(2,'0')).join('')}
function thApplyCustom(){const T=S.settings.th2;if(!T||!T.acc){delete COLORS.custom;return}COLORS.custom={n:{ar:'ألواني',en:'My colours'},d:T.acc,l:T.accL||thHexMix(T.acc,.35),sh:+T.sh||0}}
{hookFn('applyTheme',()=>applyTheme,f=>{applyTheme=f},'pre',function(){try{thApplyCustom();const st=S.settings;if(st.color==='custom'&&st.th2){if(st.th2.water)st.water=st.th2.water}}catch(e){}})}
{hookFn('applyTheme',()=>applyTheme,f=>{applyTheme=f},'post',function(){try{thFont()}catch(e){}})}
function thFont(){const st=S.settings,k=st.color==='custom'&&st.th2&&st.th2.font||'',F=THF[k],r=document.documentElement;
  if(!k||k==='plex'||!F){r.style.removeProperty('font-family');return}
  if(k==='system'){r.style.fontFamily='"Segoe UI",Tahoma,system-ui,sans-serif';return}
  if(F[1]&&!document.getElementById('thfL-'+k)){const l=document.createElement('link');l.id='thfL-'+k;l.rel='stylesheet';l.href='https://fonts.googleapis.com/css2?family='+F[1]+'&display=swap';document.head.append(l)}
  r.style.fontFamily=`"${F[0]}","IBM Plex Sans Arabic",Tahoma,sans-serif`}
thApplyCustom();
function thCur(){const st=S.settings,C=COLORS[st.color]||COLORS.yellow,T=st.th2||{};return{acc:T.acc||st.accent||C.d,accL:T.accL||'',water:T.water||(typeof st.water==='string'&&st.water)||'',sh:T.sh!=null?+T.sh:C.sh,font:T.font||'plex'}}
function thOpen(){let thDone=false;const before={color:S.settings.color,th2:S.settings.th2?Object.assign({},S.settings.th2):undefined,accent:S.settings.accent,water:S.settings.water};let T=thCur();
  const live=()=>{S.settings.th2=Object.assign({},T);S.settings.color='custom';delete S.settings.accent;applyTheme()};
  const paint=()=>{const box=$('#thE');if(!box)return;const L_=S.themes||[];
    box.innerHTML=`<p class="muted">${esc(t('th.sub'))}</p>
     <div class="field"><div><label>${esc(t('th.acc'))}</label><small>${esc(t('th.accS'))}</small></div><input type="color" class="thcol" data-k="acc" value="${T.acc}"></div>
     <div class="field"><div><label>${esc(t('th.accL'))}</label><small>${esc(t('th.accLS'))}</small></div><span class="row" style="gap:6px"><input type="color" class="thcol" data-k="accL" value="${T.accL||thHexMix(T.acc,.35)}">${T.accL?`<button class="btn sm ghost" data-th="accLx">${esc(t('th.auto'))}</button>`:''}</span></div>
     <div class="field"><div><label>${esc(t('th.water'))}</label><small>${esc(t('th.waterS'))}</small></div><span class="row" style="gap:6px"><input type="color" class="thcol" data-k="water" value="${T.water||T.acc}">${T.water?`<button class="btn sm ghost" data-th="waterx">${esc(t('th.same'))}</button>`:''}</span></div>
     <div class="field thsh"><div><label>${esc(t('th.sh'))}</label><small>${esc(t('th.shS'))}</small></div><input type="range" min="0" max="359" step="1" id="thSh" value="${T.sh}" style="--thh:${T.sh}"></div>
     <div class="field"><div><label>${esc(t('th.font'))}</label><small>${esc(t('th.fontS'))}</small></div><select class="in" id="thFont">${Object.keys(THF).map(k=>`<option value="${k}" ${T.font===k?'selected':''}>${esc(t('th.f.'+k))}</option>`).join('')}</select></div>
     <div class="row thact"><button class="btn pri" data-th="ok">${esc(t('th.use'))}</button><button class="btn ghost" data-th="cancel">${esc(t('ev.cancel'))}</button><span style="flex:1"></span><button class="btn sm ghost" data-th="save">＋ ${esc(t('th.save'))}</button><button class="btn sm ghost" data-th="exp">⬇ ${esc(t('th.exp'))}</button><button class="btn sm ghost" data-th="imp">⬆ ${esc(t('th.imp'))}</button></div>
     ${L_.length?`<h4>${esc(t('th.mine'))}</h4><div class="thl">${L_.map(x=>`<div class="thr"><i style="background:${x.acc}"></i><i style="background:${x.water||x.acc}"></i><i style="background:hsl(${+x.sh||0} 16% 12%)"></i><b dir="auto">${esc(x.n)}</b><button class="btn sm" data-thu="${x.id}">${esc(t('th.apply'))}</button><button class="btn sm ghost" data-thx="${x.id}" aria-label="${esc(t('del'))}">✕</button></div>`).join('')}</div>`:''}
     ${S.settings.color==='custom'||before.color==='custom'?`<button class="btn sm ghost dng" data-th="off">${esc(t('th.off'))}</button>`:''}`;
    box.querySelectorAll('.thcol').forEach(x=>x.oninput=()=>{T[x.dataset.k]=x.value;live()});
    $('#thSh').oninput=e=>{T.sh=+e.target.value;e.target.style.setProperty('--thh',T.sh);live()};$('#thFont').onchange=e=>{T.font=e.target.value;live()};
    box.querySelectorAll('[data-th]').forEach(b=>b.onclick=()=>{const a=b.dataset.th;
      if(a==='accLx'){delete T.accL;live();paint()}if(a==='waterx'){delete T.water;live();paint()}
      if(a==='ok'){thDone=true;live();save();if(curView()==='set')renderSettings();$$('.modal.on').forEach(m=>m.classList.remove('on'));toast(t('th.done'))}
      if(a==='cancel'){thDone=true;Object.assign(S.settings,{color:before.color,accent:before.accent,water:before.water});if(before.th2)S.settings.th2=before.th2;else delete S.settings.th2;if(before.accent===undefined)delete S.settings.accent;applyTheme();$$('.modal.on').forEach(m=>m.classList.remove('on'))}
      if(a==='off'){thDone=true;delete S.settings.th2;S.settings.color='yellow';S.settings.water='';thApplyCustom();applyTheme();save();if(curView()==='set')renderSettings();$$('.modal.on').forEach(m=>m.classList.remove('on'))}
      if(a==='save'){const n=(prompt(t('th.name'),t('th.defName'))||'').trim();if(!n)return;(S.themes=S.themes||[]).push(Object.assign({id:uid(),n},T));save();paint()}
      if(a==='exp'){const d=Object.assign({thabatTheme:1,n:t('th.defName')},T);saveBytes('ثبات-ألوان.json','application/json',new TextEncoder().encode(JSON.stringify(d,null,1)))}
      if(a==='imp'){const inp=document.createElement('input');inp.type='file';inp.accept='.json,application/json';inp.style.display='none';document.body.append(inp);inp.onchange=async()=>{try{const f=inp.files[0];const d=JSON.parse(await f.text());if(!d||!d.thabatTheme||!/^#[0-9a-f]{6}$/i.test(d.acc))throw 0;
          T={acc:d.acc,accL:/^#[0-9a-f]{6}$/i.test(d.accL||'')?d.accL:undefined,water:/^#[0-9a-f]{6}$/i.test(d.water||'')?d.water:undefined,sh:Math.max(0,Math.min(359,+d.sh||0)),font:THF[d.font]?d.font:'plex'};Object.keys(T).forEach(k=>T[k]===undefined&&delete T[k]);
          (S.themes=S.themes||[]).push(Object.assign({id:uid(),n:String(d.n||t('th.defName')).slice(0,40)},T));save();live();paint();toast(t('th.imported'))}catch(e){toast(t('th.bad'))}inp.remove()};inp.click()}});
    box.querySelectorAll('[data-thu]').forEach(b=>b.onclick=()=>{const x=(S.themes||[]).find(q=>q.id===b.dataset.thu);if(!x)return;T={acc:x.acc,accL:x.accL,water:x.water,sh:x.sh,font:x.font||'plex'};Object.keys(T).forEach(k=>T[k]===undefined&&delete T[k]);live();paint()});
    box.querySelectorAll('[data-thx]').forEach(b=>b.onclick=()=>{S.themes=(S.themes||[]).filter(q=>q.id!==b.dataset.thx);save();paint()})};
  openInfo(t('th.t'),`<div id="thE" class="the"></div>`);const b=$('#infoBox');if(b)b.classList.add('thbox');paint();
  /* closed another way (Esc, outside, the handle): put the old colours back */
  const mod=b&&b.closest('.modal');if(mod){const mo=new MutationObserver(()=>{if(mod.classList.contains('on')&&$('#thE'))return;mo.disconnect();if(thDone)return;Object.assign(S.settings,{color:before.color,water:before.water});if(before.accent===undefined)delete S.settings.accent;else S.settings.accent=before.accent;if(before.th2)S.settings.th2=before.th2;else delete S.settings.th2;applyTheme()});mo.observe(mod,{attributes:true,attributeFilter:['class']});mo.observe(b,{childList:true})}}
{hookFn('openInfo',()=>openInfo,f=>{openInfo=f},'pre',function(){try{const b=$('#infoBox');if(b)b.classList.remove('thbox')}catch(e){}})}
{hookFn('renderSettings',()=>renderSettings,f=>{renderSettings=f},'post',function(){try{const r=$('#lkRow');if(!r||$('#thRow'))return;r.insertAdjacentHTML('afterend',`<div class="field" id="thRow"><div><label data-i18n="th.t">${esc(t('th.t'))}</label><small>${esc(t('th.rowS'))}</small></div><button class="btn sm" id="thOpenB">${esc(t('obs2.open'))}</button></div>`);$('#thOpenB').onclick=thOpen;try{SGA_MAIN['set.look']&&!SGA_MAIN['set.look'].includes('th.t')&&SGA_MAIN['set.look'].push('th.t')}catch(e){}}catch(e){console.error(e)}})}
{const _cc=cmdCommands;cmdCommands=function(...a){const L_=_cc(...a);try{L_.push({icon:'🎨',label:t('th.t'),run:thOpen,kw:'theme colours colors font editor محرر الألوان الخط سمة'})}catch(e){}return L_}}
try{if(Array.isArray(SY_SIMPLE)&&!SY_SIMPLE.includes('themes'))SY_SIMPLE.push('themes')}catch(e){}
