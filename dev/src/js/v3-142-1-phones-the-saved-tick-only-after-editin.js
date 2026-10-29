/* ============ v3.142.1: phones — the «saved» tick only after editing in a window; the time picker opens without the keyboard ============ */
/* 1. On phones the 3.69 «✓ حُفظ» pill followed every tap that saved (each dhikr, each mushaf page). A tap outside a window, sheet or editor
      no longer counts as «an edit you made» (the listener runs after the 3.69 one, so it clears SVD.act); typing still does.
   2. Opening the time/date picker takes the focus off any text field, so the phone keyboard closes; tapping the big hours or minutes
      in the time picker turns them into small number fields, and only then does the keyboard open. */
document.addEventListener('pointerdown',e=>{try{if(MOB.matches&&!(e.target.closest&&e.target.closest('.modal,#noteModal,.rpk,.tpk,.uxsheet,.pppop,#infoModal')))SVD.act=0}catch(x){}},true);
{const _o=tpkOpen;tpkOpen=function(i,...a){try{const ae=document.activeElement;if(ae&&ae!==document.body&&ae.matches&&ae.matches('input,textarea,[contenteditable]'))ae.blur();if(i&&i.blur)i.blur()}catch(e){}const r=_o(i,...a);try{tpkTypeBind()}catch(e){}return r}}
function tpkTypeBind(){const el=TPK.el,i=TPK.inp;if(!el||!i||i.type!=='time')return;const d=el.querySelector('.tpkd');if(!d)return;
  d.querySelectorAll('b').forEach((b,k)=>{b.classList.add('tpkb');b.setAttribute('role','button');b.tabIndex=0;b.title=t('tpk.type');b.onclick=e=>{e.stopPropagation();tpkTypeOpen(k)}})}
function tpkTypeOpen(k){const el=TPK.el,i=TPK.inp;if(!el||!i)return;const bs=el.querySelectorAll('.tpkd b');const b=bs[k];if(!b)return;
  const v=/^\d\d:\d\d/.test(i.value||'')?i.value.split(':')[k]:'';const f=document.createElement('input');f.type='text';f.className='tpkin';f.setAttribute('inputmode','numeric');f.setAttribute('enterkeyhint',k?'done':'next');f.maxLength=2;f.value=v;f.dataset.native='';f.setAttribute('aria-label',t(k?'tpk.mm':'tpk.hh'));
  b.replaceWith(f);f.focus();f.select();
  const commit=go=>{const n=parseInt(f.value,10),max=k?59:23;if(!isNaN(n)&&n>=0&&n<=max){const ok=/^\d\d:\d\d/.test(i.value||''),p=ok?i.value.split(':').map(Number):[new Date().getHours(),0];p[k]=n;tpkSet(tpkPad(p[0])+':'+tpkPad(p[1]))}
    const nb=document.createElement('b');f.replaceWith(nb);const ok2=/^\d\d:\d\d/.test(i.value||''),q=ok2?i.value.split(':'):['--','--'];el.querySelectorAll('.tpkd b').forEach((x,j)=>x.textContent=q[j]||'--');
    el.querySelectorAll('.tpkc').forEach(c=>{const cur=+(q[c.dataset.k==='h'?0:1]);c.querySelectorAll('.tpki').forEach(x=>x.classList.toggle('on',ok2&&+x.dataset.v===cur))});tpkScroll(true);tpkTypeBind();
    if(go===1&&k===0)tpkTypeOpen(1)};
  let done=false;const fin=go=>{if(done)return;done=true;el.removeEventListener('pointerdown',away,true);commit(go)};
  /* a tap elsewhere in the picker (a column, «now»…) first puts the typed number back, so the picker's own repaint finds both numbers */
  const away=ev=>{if(ev.target!==f)fin(0)};el.addEventListener('pointerdown',away,true);
  f.addEventListener('input',()=>{f.value=f.value.replace(/[^0-9٠-٩]/g,'').replace(/[٠-٩]/g,c=>'٠١٢٣٤٥٦٧٨٩'.indexOf(c));if(f.value.length>=2||(k===0&&+f.value>2)||(k===1&&+f.value>5))fin(1)});
  f.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();fin(1)}else if(e.key==='Escape'){e.preventDefault();e.stopPropagation();fin(0)}});
  f.addEventListener('blur',()=>setTimeout(()=>fin(0),0))}

