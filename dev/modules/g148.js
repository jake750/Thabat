/* ============ v3.126.0 (g148): long adhkar fit the focus screen, no network messages in the full-screen mushaf ============ */
/* A long dhikr (Ayat al-Kursi, the last ayat of al-Baqarah…) in focus mode was taller than #adhList at a larger interface size:
   adfFit shrinks the text step by step (down to 14 px), then the ring and the virtue line, until the whole card fits. */
function adfFit(){const L=$('#adhList'),F=$('#adhF');if(!L||!F||!L.clientHeight)return;
  const tx=F.querySelector('.aftx'),fd=F.querySelector('.affadl'),rg=F.querySelector('.afring');if(!tx)return;
  tx.style.fontSize='';tx.style.lineHeight='';if(fd)fd.style.fontSize='';if(rg)rg.style.width=rg.style.height='';F.style.gap='';
  const fits=()=>F.scrollHeight<=L.clientHeight+1;if(fits())return;
  let fs=parseFloat(getComputedStyle(tx).fontSize)||20;F.style.gap='12px';
  while(!fits()&&fs>14){fs-=1;tx.style.fontSize=fs+'px';tx.style.lineHeight=fs<17?'1.8':'1.95'}
  if(!fits()&&rg){rg.style.width=rg.style.height='86px'}
  if(!fits()&&fd)fd.style.fontSize='11.5px'}
{hookFn('renderAdhFocus',()=>renderAdhFocus,f=>{renderAdhFocus=f},'post',function(){try{adfFit()}catch(e){}})}
addEventListener('resize',()=>{if(S.adhFocus&&$('#adhSheet.on'))adfFit()});
/* the offline banner and network toasts stay away while the mushaf is full screen; they come back when it closes */
function qfsQuiet(){return document.documentElement.classList.contains('qfs')}
{const _t=toast;toast=function(m,...a){if(qfsQuiet()&&typeof m==='string'&&(m.indexOf(t('net.off'))>=0||m.indexOf(t('net.fail'))>=0||m.indexOf(t('ux.on'))>=0))return;return _t.call(this,m,...a)}}
/* the note cards' own meta line (date · pictures · ☑ n/m) and the lock mark sit inside .nbody, which the icon pass skips as user text:
   draw their emoji as icons here */
function uicMeta(root){(root||document).querySelectorAll('.ncard .nbody>small,.ncard.nlocked .nbody>b').forEach(el=>{
  const w=document.createTreeWalker(el,NodeFilter.SHOW_TEXT),L_=[];let n;while(n=w.nextNode())if(UIC_TEST.test(n.data))L_.push(n);
  L_.forEach(tn=>{const fr=document.createDocumentFragment();let last=0;const s=tn.data;s.replace(new RegExp(UIC_RE.source,'gu'),(m,...a)=>{const i=a[a.length-2];const k=m.replace(/️/g,'');const nm=UIC_E[k]||UIC_E[m];if(!nm)return m;fr.append(s.slice(last,i),uicNode(nm,k));last=i+m.length;return m});if(!last)return;fr.append(s.slice(last));tn.replaceWith(fr)})})}
{hookFn('renderNotes',()=>renderNotes,f=>{renderNotes=f},'post',function(){if(!document.documentElement.classList.contains('emoji'))try{uicMeta($('#notesWrap'))}catch(e){}})}
