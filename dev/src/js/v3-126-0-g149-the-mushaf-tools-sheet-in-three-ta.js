/* ============ v3.126.0 (g149): the mushaf tools sheet in three tabs (his pick «أ»): reading · memorising · tools ============ */
/* The buttons stay where they are (other modules move and show/hide them); a tab only hides the ones of the other tabs.
   A button not listed here (a later feature) goes to «tools». The last tab is kept on this device. */
const QTB_R=['qbGoTo','qbmBtn','qGoMine','qTfsBtn','qSearchBtn','qDark','qListenBtn','qHlBtn'];
const QTB_H=['qHideBtn','qHideAll','qrpBtn','hplTool','qhsTool'];
function qtbOf(id){return QTB_R.includes(id)?'r':QTB_H.includes(id)?'h':'t'}
function qtbCur(){try{return localStorage['thabat.qtab']||'r'}catch(e){return 'r'}}
function qtbApply(){const box=$('#qbTools .qbshbox'),grid=box&&box.querySelector('.qbshb');if(!grid)return;
  let bar=box.querySelector('#qtbBar');
  if(!bar){bar=document.createElement('div');bar.id='qtbBar';bar.className='qtbbar';bar.setAttribute('role','tablist');
    bar.innerHTML=['r','h','t'].map(k=>`<button type="button" role="tab" data-qtb="${k}">${esc(t('qtb.'+k))}</button>`).join('');
    grid.before(bar);bar.onclick=e=>{const b=e.target.closest('[data-qtb]');if(!b)return;try{localStorage['thabat.qtab']=b.dataset.qtb}catch(x){}qtbApply();try{qbPlace('qbTools')}catch(x){}}}
  const cur=qtbCur();
  bar.querySelectorAll('[data-qtb]').forEach(b=>{const on=b.dataset.qtb===cur;b.classList.toggle('on',on);b.setAttribute('aria-selected',on)});
  [...grid.children].forEach(b=>{if(b.tagName!=='BUTTON')return;b.classList.toggle('qtboff',qtbOf(b.id)!==cur)});
  /* a tab with nothing to show (all its buttons hidden for this riwaya) says so */
  let em=grid.querySelector('.qtbe');const any=[...grid.children].some(b=>b.tagName==='BUTTON'&&!b.hidden&&!b.classList.contains('qtboff'));
  if(!any){if(!em){em=document.createElement('div');em.className='qtbe';grid.append(em)}em.textContent=t('qtb.none')}else if(em)em.remove()}
{hookFn('qbOpen',()=>qbOpen,f=>{qbOpen=f},'post',function(id){if(id==='qbTools')try{qtbApply()}catch(e){}})}

