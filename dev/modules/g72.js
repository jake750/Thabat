/* ============ v3.62 even columns on wide Today, the day line under the details panel, prayed in the mosque = on time ============ */
/* keep the three columns even after Today redraws (only when they differ a lot, never while typing inside Today) */
function uxEvenCheck(){if(tdl()!=='cards'||!$('#uxCol3')||!document.documentElement.classList.contains('wide3'))return;const a=document.activeElement;if(a&&a.closest&&a.closest('#v-today .grid')&&/INPUT|TEXTAREA/.test(a.tagName)||a&&a.isContentEditable)return;
  const hs=[...uxStacks(),$('#uxCol3')].map(s=>s.offsetHeight);if(Math.max(...hs)-Math.min(...hs)>320&&Date.now()-(uxEvenCheck.at||0)>4000){uxEvenCheck.at=Date.now();try{uxRebalance()}catch(e){}}}
{hookFn('renderToday',()=>renderToday,f=>{renderToday=f},'post',function(){clearTimeout(uxEvenCheck.t);uxEvenCheck.t=setTimeout(uxEvenCheck,700)})}
setTimeout(uxEvenCheck,2500);
/* prayed in congregation in the mosque → logged on time as well */
{hookFn('jmToggle',()=>jmToggle,f=>{jmToggle=f},'post',function(dk,k){try{if(jmHas(dk,k)){const d=day(dk);if(!d.prayLog||d.prayLog[k]!=='on'){plSet(dk,k,'on');setTimeout(()=>toast(t('jm4.on')),900)}}}catch(e){}})}
