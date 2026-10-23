/* ============ 3.101 the phone switches between two mushafs on the same page; highlight colours in books ============ */
/* 9th-6: on phones the «compare» choice (S.quran.tsCmp, side by side on the PC) is the second mushaf of a ↔ button in the Quran bar:
   one tap shows the same page in the other mushaf (two scanned mushafs keep the page number exactly) */
function tsw2Swap(){const Q=S.quran,b=Q.tsCmp;if(!b||!RIWAYAT[b]||b===Q.riwaya)return;const a=Q.riwaya,p=Q.view||1,img=(RIWAYAT[a]||{}).kind==='img'&&RIWAYAT[b].kind==='img';
  Q.tsCmp=a;qSetRiwaya(b);if(img){try{QAN.pend=null}catch(e){}qShow(p)}toast(riwName(b))}
function tsw2Paint(){const top=$('#qbTop');if(!top)return;let b=$('#tsw2B');const Q=S.quran,on=MOB.matches&&Q.tsCmp&&RIWAYAT[Q.tsCmp]&&Q.tsCmp!==Q.riwaya;
  if(!on){if(b)b.remove();return}
  if(!b){const r=top.querySelector('.qbriw');(r||top.firstElementChild).insertAdjacentHTML('afterend',`<button class="btn sm ghost tsw2" id="tsw2B">↔</button>`);b=$('#tsw2B');b.onclick=e=>{e.stopPropagation();tsw2Swap()};uicPass(b)}
  b.title=b.ariaLabel=t('tsw2.b',riwName(Q.tsCmp))}
{hookFn('renderQuran',()=>renderQuran,f=>{renderQuran=f},'post',function(){try{tsw2Paint()}catch(e){}})}
{hookFn('qbLayout',()=>qbLayout,f=>{qbLayout=f},'post',function(){try{tsw2Paint()}catch(e){}})}
/* the choice itself: the same «compare» item, also on phones, with its own explanation there */
{hookFn('tsBtns',()=>tsBtns,f=>{tsBtns=f},'post',function(){try{const e=$('#tscBtn');if(e&&MOB.matches)e.hidden=(RIWAYAT[S.quran.riwaya]||{}).kind!=='img'}catch(x){}})}
{hookFn('tsCmpMenu',()=>tsCmpMenu,f=>{tsCmpMenu=f},'post',function(){try{if(!MOB.matches)return;const b=$('#infoBox');const p=b&&b.querySelector('p.muted');if(p)p.textContent=t('tsw2.sub');
  b.querySelectorAll('[data-tsc]').forEach(x=>{const o=x.onclick;x.onclick=()=>{o&&o();setTimeout(()=>{tsw2Paint();if(S.quran.tsCmp)toast(t('tsw2.set'))},80)}});
  const off=b.querySelector('[data-tsc=""]');if(off)off.textContent=t('tsw2.off')}catch(e){}})}

/* 9th-10: book highlights in four colours; the colour is the 5th number of a highlight box (0 yellow, 1 green, 2 blue, 3 pink), older boxes stay yellow */
const BKHC=['#ffd600','#3cc85a','#4696ff','#ff5aaa'];
function bkHlcGet(){try{return Math.max(0,Math.min(3,+(localStorage.getItem('thabat.bkHlc')||0)))}catch(e){return 0}}
function bkHlC(box){const c=bkHlcGet();if(c)box.push(c);return box}
function bkHlPaint(n){const el=BK.pages&&BK.pages[n-1],r=BKS()[BK.key];if(!el||!r)return;const L_=r.hl[n]||[];el.querySelectorAll('.bkhl i[data-i]').forEach(i=>{const h=L_[+i.dataset.i];const c=h&&h[4]||0;i.className=c?'hc'+c:''})}
{hookFn('bkDrawHl',()=>bkDrawHl,f=>{bkDrawHl=f},'post',function(n){try{bkHlPaint(n)}catch(e){}})}
{hookFn('bkHlBar',()=>bkHlBar,f=>{bkHlBar=f},'post',function(){try{const b=$('#bk3Hl');if(!b||b.querySelector('.bkhcs'))return;const cur=bkHlcGet();
  b.querySelector('span').insertAdjacentHTML('afterend',`<span class="bkhcs" role="radiogroup" aria-label="${esc(t('bkc.t'))}">${BKHC.map((c,i)=>`<button class="bkhc ${i===cur?'on':''}" data-hc="${i}" role="radio" aria-checked="${i===cur}" aria-label="${esc(t('bkc.c'+i))}" title="${esc(t('bkc.c'+i))}" style="--hc:${c}"></button>`).join('')}</span>`);
  b.querySelectorAll('[data-hc]').forEach(x=>x.onclick=()=>{try{localStorage.setItem('thabat.bkHlc',x.dataset.hc)}catch(e){}b.querySelectorAll('[data-hc]').forEach(y=>{const on=y===x;y.classList.toggle('on',on);y.setAttribute('aria-checked',on)});const v=$('#bkV');if(v)v.dataset.hc=x.dataset.hc})
  const v=$('#bkV');if(v)v.dataset.hc=cur}catch(e){console.error(e)}})}
