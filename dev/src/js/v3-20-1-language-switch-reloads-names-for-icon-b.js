/* ============ v3.20.1: language switch reloads; names for icon buttons and lists (screen readers) ============ */
{const _sl=setLang;setLang=function(l,...a){const old=LANG,r=_sl(l,...a);if(old!==l&&!document.querySelector('#setupModal.on')){try{flushSave()}catch(e){}setTimeout(()=>location.reload(),80)}return r}}
function a11yPass2(){try{
  document.querySelectorAll('.ck').forEach(b=>{const cur=b.getAttribute('aria-label')||'';if(cur.replace(/[^\p{L}\p{N}]/gu,'').length>1)return;const row=b.closest('.task,.titem,li,.tk,[data-id]');const tx=row?(row.querySelector('.tt,.txt,.ttext,b,span')||row).textContent.trim().slice(0,80):'';b.setAttribute('aria-label',t('a11y.ck',tx))});
  document.querySelectorAll('.qck').forEach(b=>{const p=b.closest('.qchk'),lb=p&&p.querySelector('.lb b');const tx=(lb||p||b).textContent.trim().slice(0,80);if(b.getAttribute('aria-label')===t('a11y.qck',tx))return;b.setAttribute('aria-label',t('a11y.qck',tx))});
  [['qRiw','a11y.riw'],['qTarget','a11y.target'],['qUnit','a11y.unit'],['lshSort','a11y.sort']].forEach(([id,k])=>{const e=document.getElementById(id);if(e&&!e.getAttribute('aria-label'))e.setAttribute('aria-label',t(k))});
  document.querySelectorAll('button:not([aria-label]):not([title])').forEach(b=>{if(b.textContent.trim())return;const k=b.dataset&&(b.dataset.tip||b.dataset.label);if(k)b.setAttribute('aria-label',k)})}catch(e){}}
{let T=0;new MutationObserver(()=>{clearTimeout(T);T=setTimeout(a11yPass2,400)}).observe(document.body,{childList:true,subtree:true})}
setTimeout(a11yPass2,1500);
/* the Summary «🧰 Tools» menu is built once: keep its texts in the current language */
{hookFn('btPanel',()=>btPanel,f=>{btPanel=f},'post',function(...a){try{const tb=$('#btTools');if(tb){const sp=tb.querySelector('span');if(sp)sp.textContent='🧰 '+t('bt.t');$$('#btPanel .btgrp').forEach(g=>{const b=g.querySelector(':scope > b');if(b)b.textContent=t('bt.g.'+g.dataset.g)});Object.entries(BT_INFO).forEach(([id,k])=>{const s=document.querySelector('#btPanel #'+id+' > small');if(s)s.textContent=t(k)})}}catch(e){}})}

