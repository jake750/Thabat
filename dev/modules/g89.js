/* ============ 3.77 prayer menu that stays open; alone / congregation / mosque ============ */
/* day.jama[k]: 1 = in congregation, 2 = in the mosque (a mosque prayer is also a congregation, so jmHas() still counts it) */
const PRX={on:false,dk:null,k:null,c:null};
function prxKind(dk,k){const d=S.days[dk],v=d&&d.jama&&d.jama[k];return v?(+v===2?2:1):0}
function prxSetKind(dk,k,v){const d=day(dk);d.jama=d.jama||{};if(v)d.jama[k]=v;else delete d.jama[k];
  /* his request (3.62): praying in congregation means it was prayed on time */
  if(v&&plStatus(dk,k)!=='on')plSet(dk,k,'on');else save()}
function prxStatus(dk,k){const d=S.days[dk],L_=(d&&d.prayLog)||{};return L_[k]||plStatus(dk,k)||''}
function prxIco(n){return`<svg class="prxi" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${UIC_P[n]||''}</svg>`}
function prxHTML(dk,k){const st=prxStatus(dk,k),kind=prxKind(dk,k),lw=((S.days[dk]||{}).lateWhy||{})[k],mx=RAWATIB[k],sn=snCount(dk,k);
  const seg=(a)=>`<div class="prxseg">${a.join('')}</div>`;
  let h=`<div class="aymh prxh"><b>${t('pr.'+k)}</b><button class="prxx" data-prx="done" aria-label="${esc(t('prx.done'))}">✕</button></div>`;
  h+=`<small class="prxl">${t('prx.st')}</small>`+seg(['on','late','miss'].map(v=>`<button data-prs="${v}" class="${st===v||(v==='on'&&st==='auto')?'on s-'+v:''}">${PLICON[v]} ${t('pl.'+v)}</button>`));
  if(st==='late')h+=`<div class="prxwhy">${LATE_WHY.map(w=>`<button data-prw="${w}" class="${lw===w?'on':''}">${t('lw.'+w)}</button>`).join('')}</div>`;
  h+=`<small class="prxl">${t('prx.how')}</small>`+seg([[0,'user','prx.alone'],[1,'users','prx.jm'],[2,'mosque','prx.msq']].map(([v,ic,l])=>`<button data-prk="${v}" class="${kind===v?'on k'+v:''}">${prxIco(ic)}<span>${t(l)}</span></button>`));
  if(mx){h+=`<small class="prxl">${t('sn.lbl')} <span>(${t('sn.'+k)})</span></small>`;
    if(mx<=2)h+=`<button class="prxck ${sn?'on':''}" data-prn="${sn?0:mx}"><i>${sn?'✓':''}</i>${t('prx.snDid')}</button>`;
    else{const o=[];for(let i=0;i<=mx;i+=2)o.push(i);h+=seg(o.map(n=>`<button data-prn="${n}" class="${sn===n?'on':''}">${n?n:t('sn.none')}</button>`))}}
  h+=`<div class="prxft"><button class="btn sm pri" data-prx="done">${t('prx.done')}</button><button class="btn sm ghost" data-prx="clear">↺ ${t('pl.clear')}</button></div>`;
  return h}
function prxPaint(){const p=$('#ppPop');if(!p||!PRX.on)return;p.innerHTML=prxHTML(PRX.dk,PRX.k);uicPass(p)}
function prxClose(){PRX.on=false;closePP();document.removeEventListener('keydown',prxKey,true)}
function prxKey(e){if(e.key==='Escape'&&PRX.on){e.stopPropagation();prxClose()}}
function prxAfter(){renderPrayers();try{if(curView()==='brief')renderBrief()}catch(e){}prxPaint();
  /* the touch listener that closes the menu runs once; a tap inside used it up */
  document.removeEventListener('touchstart',ppOutT,true);setTimeout(()=>document.addEventListener('touchstart',ppOutT,{capture:true,once:true}),0)}
function prxOpen(c){const k=c.dataset.pk,dk=todayKey(),r=c.getBoundingClientRect();
  PRX.on=true;PRX.dk=dk;PRX.k=k;
  const p=qPopAt(prxHTML(dk,k),r.left+r.width/2,r.bottom-8,'aymenu prxpop');PRX.on=true;
  document.addEventListener('keydown',prxKey,true);
  p.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||!p.contains(b))return;e.stopPropagation();const{dk,k}=PRX;
    if(b.dataset.prx==='done'){prxClose();return}
    if(b.dataset.prx==='clear'){plSet(dk,k,'');prxSetKind(dk,k,0);snSet(dk,k,0);prxAfter();return}
    if(b.dataset.prs!=null){const v=b.dataset.prs;plSet(dk,k,prxStatus(dk,k)===v?'':v);
      /* late or missed cannot stay «in congregation» */
      if(v!=='on'&&prxKind(dk,k)&&prxStatus(dk,k)===v){const d=day(dk);delete d.jama[k];save()}
      prxAfter();return}
    if(b.dataset.prw){const d=day(dk);d.lateWhy=d.lateWhy||{};if(d.lateWhy[k]===b.dataset.prw)delete d.lateWhy[k];else d.lateWhy[k]=b.dataset.prw;save();prxAfter();return}
    if(b.dataset.prk!=null){const v=+b.dataset.prk;prxSetKind(dk,k,v);if(v)toast(t(v===2?'prx.tMsq':'prx.tJm'));prxAfter();return}
    if(b.dataset.prn!=null){snSet(dk,k,+b.dataset.prn);prxAfter();return}});
  return p}
/* the reason question opened its own menu over this one; inside the menu the reasons are a row */
{const _la=lateAsk;lateAsk=function(...a){if(PRX.on)return;return _la(...a)}}
{hookFn('closePP',()=>closePP,f=>{closePP=f},'pre',function(){if(PRX.on){PRX.on=false;document.removeEventListener('keydown',prxKey,true)}})}
function prxMarks(){$$('#prayers [data-pk]').forEach(c=>{const kind=prxKind(todayKey(),c.dataset.pk);c.classList.remove('jm3');c.classList.toggle('prxj',kind===1);c.classList.toggle('prxm',kind===2);
  let s=c.querySelector('.prxb');if(!kind){if(s)s.remove();return}if(!s){s=document.createElement('span');s.className='prxb';c.append(s)}
  s.innerHTML=prxIco(kind===2?'mosque':'users');s.title=t(kind===2?'prx.msq':'prx.jm')})}
{hookFn('bindPrayChips',()=>bindPrayChips,f=>{bindPrayChips=f},'post',function(){$$('#prayers [data-pk]').forEach(c=>{c.onclick=()=>prxOpen(c)});prxMarks()})}
/* the old toggle stays for anything else that calls it: it now means «in congregation» */
jmToggle=function(dk,k){prxSetKind(dk,k,prxKind(dk,k)?0:1)};
try{renderPrayers()}catch(e){}
