/* ============ v3.7: summary tools menu, zoom-aware popups, light glass for phones ============ */
/* popups: positions are in zoomed CSS px when the interface size setting is not 100% */
const uiZoom=()=>parseFloat(document.body.style.zoom)||1;
ppFit=function(p,x,y){if(!p||!p.isConnected)return;const z=uiZoom(),W=innerWidth/z,H=innerHeight/z;x/=z;y/=z;p.style.maxHeight='';const w=p.offsetWidth;let h=p.offsetHeight;
  if(h>H-16){p.style.maxHeight=(H-16)+'px';p.style.overflowY='auto';h=H-16}
  let top=y+16;if(top+h>H-8){top=y-h-16;if(top<8)top=Math.max(8,H-h-8)}
  p.style.left=Math.max(8,Math.min(W-w-8,x-w/2))+'px';p.style.top=top+'px'};
/* summary: one «tools» button opens a grouped menu; each tool says what it does */
const BT_GROUPS=[['share',['stBtn','frBtn','bPdf']],['review',['rvBtn','mrBtn']],['goals',['bdBtn','glBtn','ygBtn']],['ibada',['pmBtn','hhBtn']]];
const BT_INFO={stBtn:'bt.st',frBtn:'bt.fr',bPdf:'bt.pdf',rvBtn:'bt.rv',mrBtn:'bt.mr',bdBtn:'bt.bd',glBtn:'bt.gl',ygBtn:'bt.yg',pmBtn:'bt.pm',hhBtn:'bt.hh'};
function btPanel(){const ctl=$('#v-brief .bctl');if(!ctl)return null;let tb=$('#btTools');
  if(!tb){ctl.insertAdjacentHTML('afterbegin',`<button class="btn sm" id="btTools" aria-expanded="false"><span>🧰 ${t('bt.t')}</span><i class="btchev">▾</i></button><div class="btpanel card" id="btPanel" hidden>${[...BT_GROUPS.map(g=>g[0]),'more'].map(g=>`<div class="btgrp" data-g="${g}"><b>${t('bt.g.'+g)}</b><div class="btlist"></div></div>`).join('')}</div>`);
    tb=$('#btTools');tb.onclick=e=>{e.stopPropagation();btToggle()};document.body.append($('#btPanel'))}
  return $('#btPanel')}
function btSort(){const ctl=$('#v-brief .bctl'),P=btPanel();if(!ctl||!P)return;
  [...ctl.querySelectorAll(':scope>button:not(#btTools)'),...P.querySelectorAll('.btlist>button')].forEach(b=>{const g=(BT_GROUPS.find(x=>x[1].includes(b.id))||['more'])[0],list=P.querySelector(`.btgrp[data-g="${g}"] .btlist`);
    if(b.parentElement!==list)list.append(b);if(!b.dataset.btd){b.dataset.btd=1;b.classList.add('btitem');if(b.id==='stBtn'&&b.textContent.trim()==='📸')b.insertAdjacentHTML('beforeend',' '+esc(t('st3.t')));const k=BT_INFO[b.id];if(k)b.insertAdjacentHTML('beforeend',`<small>${esc(t(k))}</small>`)}});
  const ord=id=>{for(const [,ids] of BT_GROUPS){const i=ids.indexOf(id);if(i>=0)return i}return 99};
  P.querySelectorAll('.btlist').forEach(l=>{[...l.children].sort((a,b)=>ord(a.id)-ord(b.id)).forEach(x=>l.append(x))});
  P.querySelectorAll('.btgrp').forEach(g=>g.hidden=!g.querySelector('.btlist>button'))}
function btToggle(on){const P=$('#btPanel'),tb=$('#btTools');if(!P||!tb)return;on=on==null?P.hidden:on;P.hidden=!on;tb.setAttribute('aria-expanded',on);tb.classList.toggle('on',on);if(!on)return;
  const z=uiZoom(),r=tb.getBoundingClientRect(),W=innerWidth/z,H=innerHeight/z,w=P.offsetWidth;let left=(document.documentElement.dir==='rtl'?r.right/z-w:r.left/z);left=Math.max(8,Math.min(W-w-8,left));
  let top=r.bottom/z+8;P.style.maxHeight=Math.max(200,H-top-12)+'px';P.style.left=left+'px';P.style.top=top+'px'}
document.addEventListener('mousedown',e=>{const P=$('#btPanel');if(P&&!P.hidden&&!P.contains(e.target)&&!e.target.closest('#btTools'))btToggle(false)},true);
document.addEventListener('touchstart',e=>{const P=$('#btPanel');if(P&&!P.hidden&&!P.contains(e.target)&&!e.target.closest('#btTools'))btToggle(false)},{capture:true,passive:true});
document.addEventListener('keydown',e=>{if(e.key==='Escape')btToggle(false)});
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#btPanel .btitem');if(b)setTimeout(()=>btToggle(false),0)},true);
{const _rb=renderBrief;renderBrief=function(){_rb();try{btSort()}catch(e){console.error(e)}}}
{const _sv=showView;showView=function(...a){try{btToggle(false)}catch(e){}return _sv(...a)}}
window.addEventListener('resize',()=>{const P=$('#btPanel');if(P&&!P.hidden)btToggle(true)});
/* light glass: on phones in automatic performance mode, keep the moving lights without live blur */
function lgApply(){const st=S.settings;document.documentElement.classList.toggle('lg',st.style==='glass'&&isLite()&&perfGet()==='auto')}
{const _at=applyTheme;applyTheme=function(...a){const r=_at(...a);try{lgApply()}catch(e){}return r}}
try{lgApply()}catch(e){}
/* the interface size setting zooms the body; keep the app exactly as tall as the window */
function uizSync(){document.documentElement.style.setProperty('--uiz',uiZoom())}
{const _at2=applyTheme;applyTheme=function(...a){const r=_at2(...a);try{uizSync()}catch(e){}return r}}
{const _al=applyLook2;applyLook2=function(...a){const r=_al(...a);try{uizSync();pcFit()}catch(e){}return r}}
try{uizSync()}catch(e){}
