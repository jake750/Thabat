/* ============ 3.77.4 «I'll pray now» stops asking once the prayer is logged; phone toasts above the bottom bar ============ */
/* the «did you pray?» question (30 min after «سأصلّي الآن») is dropped as soon as that prayer has a status or a «prayed» time */
function plgDone(L_){const d=S.days[L_.dk]||{},s=plStatus(L_.dk,L_.k);return!!((d.prayed&&d.prayed[L_.k])||(s&&s!=='q'&&s!=='auto'))}
function plgClear(){if(!S.prayLater||!plgDone(S.prayLater))return false;S.prayLater=null;save();if(ANDROID){try{window.ThabatAndroid.cancelRemind&&window.ThabatAndroid.cancelRemind(8800)}catch(e){}}$('#plModal')?.classList.remove('on');return true}
{const _pa=prayLaterAsk;prayLaterAsk=function(...a){if(plgClear())return;return _pa(...a)}}
{hookFn('plSet',()=>plSet,f=>{plSet=f},'post',function(){try{plgClear()}catch(e){}})}
/* phones: the toasts sat on top of the floating nav bar; keep them just above it */
function tstLift(){const b=$('#toasts');if(!b)return;if(!MOB.matches){b.style.bottom='';return}const n=$('nav.side.flt .navpill')||$('nav.side');if(!n){b.style.bottom='';return}
  const r=n.getBoundingClientRect(),z=uiZoom()||1;const vis=r.height>0&&r.top<innerHeight&&!document.documentElement.classList.contains('navhide');
  b.style.bottom=vis?Math.max(20,Math.round((innerHeight-r.top)/z+8))+'px':''}
{const b=$('#toasts');if(b)new MutationObserver(tstLift).observe(b,{childList:true})}

