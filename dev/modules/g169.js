/* ============ v3.142.2: phones — the note editor's head and tool row (his screenshot 2026-10-30) ============ */
/* The title had 105 px beside the date; now (CSS) icon + title share the first row, the date is centred on its own row.
   The tool row had 21 buttons (two ☑ and two picture icons, no words): on phones only H, B, •, ☑, ⇄ and ⋯ stay, and «أدوات» opens
   a list of the others with their names. The buttons themselves are untouched (only hidden), so every handler keeps working. */
const NTBK=['h','b','li','chk','ntvB','nteMore'];
function ntbKey(b){return b.id||b.dataset.md||''}
function ntbTidy(){const tb=$('#noteBox .netb');if(!tb)return;const mob=MOB.matches;tb.classList.toggle('ntbmob',mob);
  const btns=[...tb.querySelectorAll(':scope > button, :scope > * > button')].filter(b=>b.id!=='ntbMoreB'&&b.id!=='neTplSave');
  btns.forEach(b=>b.classList.toggle('ntbx',mob&&!NTBK.includes(ntbKey(b))));
  let m=$('#ntbMoreB');if(!mob){m?.remove();return}
  if(!m){m=document.createElement('button');m.type='button';m.id='ntbMoreB';m.className='btn sm ghost ntbmore';m.innerHTML=`<span>${esc(t('ntb2.more'))}</span><i aria-hidden="true">▾</i>`;m.setAttribute('aria-haspopup','menu');tb.append(m);m.addEventListener('pointerdown',e=>e.preventDefault());m.onclick=()=>ntbMenu(m)}
  else tb.append(m);
  m.hidden=!tb.querySelector('.ntbx:not([hidden])')}
function ntbMenu(anchor){const tb=$('#noteBox .netb');if(!tb)return;const L_=[...tb.querySelectorAll('.ntbx')].filter(b=>!b.hidden&&getComputedStyle(b).visibility!=='hidden'&&!(b.style.display==='none'));
  const r=anchor.getBoundingClientRect();
  const p=qPopAt(`<div class="aymh">${esc(t('ntb2.more'))}</div>${L_.map((b,i)=>`<button type="button" data-i="${i}"><span class="ntbmi">${b.innerHTML}</span><span dir="auto">${esc((b.title||b.getAttribute('aria-label')||b.textContent||'').split(/\(|،| — /)[0].trim())}</span></button>`).join('')}`,r.left+r.width/2,r.bottom+4,'aymenu ntbmenu');
  p.querySelectorAll('[data-i]').forEach(x=>{x.addEventListener('pointerdown',e=>e.preventDefault());x.onclick=()=>{const b=L_[+x.dataset.i];closePP();if(b)b.click()}})}
/* some buttons (the cover) are added a moment later, so the row is tidied again */
{hookFn('renderNoteEd',()=>renderNoteEd,f=>{renderNoteEd=f},'post',function(){try{ntbTidy();setTimeout(ntbTidy,80)}catch(e){console.error(e)}})}
{hookFn('neShowMode',()=>neShowMode,f=>{neShowMode=f},'post',function(){try{ntbTidy();setTimeout(ntbTidy,80)}catch(e){console.error(e)}})}
/* phones: a new event no longer puts the cursor in its title by itself (that opened the keyboard over the time lists);
   the keyboard opens only when a field — or the picker's hours/minutes — is tapped */
const EVKB={at:0,tap:0};
{hookFn('openEv',()=>openEv,f=>{openEv=f},'pre',function(){EVKB.at=Date.now()})}
document.addEventListener('pointerdown',e=>{if(e.target&&e.target.closest&&e.target.closest('#evModal input,#evModal textarea'))EVKB.tap=Date.now()},true);
document.addEventListener('focusin',e=>{try{if(!MOB.matches||e.target.id!=='evT')return;const n=Date.now();if(n-EVKB.at<1500&&n-EVKB.tap>800)e.target.blur()}catch(x){}},true);
{hookFn('openEv',()=>openEv,f=>{openEv=f},'post',function(){setTimeout(()=>{try{const x=$('#evT');if(MOB.matches&&x&&document.activeElement===x&&Date.now()-EVKB.tap>800)x.blur()}catch(e){}},150)})}
/* note templates are off for now (his request 2026-10-30: review alternatives one by one later): the chip row on a new note,
   «📑 save as a template», «my templates» in the note «⋯». Saved templates (S.noteTpls) stay in the data. */
{const _cc=cmdCommands;cmdCommands=function(){return _cc().filter(c=>!/ntplOpen|tplApply/.test(String(c.run)))}}
MOB.addEventListener&&MOB.addEventListener('change',()=>{try{if($('#noteModal.on'))ntbTidy()}catch(e){}});
