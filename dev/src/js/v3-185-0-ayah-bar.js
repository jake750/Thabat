/* ============ v3.185 one bar for the selected ayah (his pick «ب», 2026-11-26) ============ */
/* Text pages and the tajweed Qalun pages both show one floating bar: the four mark colours, then copy, share, tafsir, «…».
   A colour is also a bookmark (S.quran.bms entry with mk:1, removed with the colour). «…» opens the menu of that same ayah,
   sorted into groups, with no list of the page's ayahs in between. Marks are painted on the tajweed Qalun pictures from the ayah bounds. */
UIC_P.share='<circle cx="18" cy="5.5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="18.5" r="2.5"/><path d="M8.2 10.8l7.6-4.1M8.2 13.2l7.6 4.1"/>';
UIC_P.dots='<circle cx="5" cy="12" r="1.1"/><circle cx="12" cy="12" r="1.1"/><circle cx="19" cy="12" r="1.1"/>';
let qAyMore=false,qAyCtx=null;
/* set or clear the mark of ayah s:a; p is the page it was chosen on (for the bookmark) */
function qSetMark(s,a,m,p){const k=s+':'+a,M=qMarks(),L=qbmList(),had=L.some(x=>x.s===s&&x.a===a);
  if(m){M[k]=m;if(!had){const r=S.quran.riwaya;p=p||qPageOf(s,a);L.unshift({id:uid(),n:`${qSurahName(s)} · ${t('q.ayahN',a)}`,r,p,an:qanOf(r,p),s,a,at:Date.now(),mk:1})}}
  else{delete M[k];for(let i=L.length-1;i>=0;i--)if(L[i].s===s&&L[i].a===a&&L[i].mk)L.splice(i,1)}
  save();qApplyMarks();try{renderQStudy()}catch(e){}try{qtjPaintMarks()}catch(e){}
  if(m&&!had)toast(t('ayg.saved'))}
function qAyDots(s,a,lab){const cur=qMarks()[s+':'+a];
  return`<span class="aydots" role="group" aria-label="${esc(t('q.markT'))}">${Object.keys(QMK).map(m=>`<button data-m="${m}" class="aydot${cur===m?' on':''}" style="--c:${QMK[m]}" aria-pressed="${cur===m}" aria-label="${esc(t('q.markT')+': '+t('q.mk.'+m))}" title="${esc(t('q.mk.'+m))}">${lab?`<span>${esc(t('q.mk.'+m))}</span>`:''}</button>`).join('')}</span>`}
function qAyDotsWire(root,s,a,p){root.querySelectorAll('.aydot').forEach(b=>b.onclick=e=>{e.stopPropagation();const m=b.dataset.m,on=qMarks()[s+':'+a]===m;qSetMark(s,a,on?'':m,p);
  root.querySelectorAll('.aydot').forEach(x=>{const y=!on&&x.dataset.m===m;x.classList.toggle('on',y);x.setAttribute('aria-pressed',y)})})}
/* the floating bar; o = {p, box (screen rect of the ayah), x, y, txt: async () => text to copy, word} */
function qAyBar(s,a,o){const old=$('#qtjBar');if(old)old.remove();closePP();qAyCtx={s,a,p:o.p,word:o.word};
  const b=document.createElement('div');b.id='qtjBar';b.className='qtjbar aybar';b.setAttribute('role','toolbar');b.setAttribute('aria-label',`${qSurahName(s)} · ${t('q.ayahN',a)}`);
  const ib=(x,ic,l)=>`<button data-x="${x}" aria-label="${esc(l)}" title="${esc(l)}">${uicSvg(ic,'')}</button>`;
  b.innerHTML=`<span class="qtjh">${esc(qSurahName(s))} · ${a}</span>${qAyDots(s,a)}<i class="aysep" aria-hidden="true"></i>${ib('copy','clipboard',t('q.copyAyah'))}${(ANDROID||navigator.share)?ib('share','share',t('q.share')):''}${ib('tfs','book',t('q.tafsir'))}${ib('more','dots',t('qtj.more'))}`;
  document.body.append(b);qAyDotsWire(b,s,a,o.p);
  /* screen points → the page's own pixels (the interface zoom scales everything on the PC) */
  let {x,y,box}=o;const zu=uiZoom()||1,W_=innerWidth/zu,H_=innerHeight/zu;x/=zu;y/=zu;if(box)box={top:box.top/zu,bottom:box.bottom/zu,left:box.left/zu,right:box.right/zu};
  b.style.maxWidth=(W_-16)+'px';
  const w=b.offsetWidth,h=b.offsetHeight,cx=box?(box.left+box.right)/2:x;
  let top=(box?box.top:y)-h-10;if(top<8)top=(box?box.bottom:y)+10;if(top+h>H_-8)top=Math.max(8,y-h-16);
  b.style.left=Math.max(8,Math.min(W_-w-8,(box?Math.min(Math.max(x,box.left+w/2),box.right-w/2):cx)-w/2))+'px';b.style.top=top+'px';
  b.onclick=async e=>{const k=e.target.closest('[data-x]');if(!k)return;const X=k.dataset.x;qtjClear();
    if(X==='more'){qAyMore=true;try{qAyahMenu(s,a,o.x,o.y,o.word||'')}finally{qAyMore=false}return}
    if(X==='copy'){try{const tx=await o.txt();if(tx&&await qCopyText(tx))toast(t('q.copied'));else toast(t('toast.saveFail'))}catch(err){toast(t('toast.saveFail'))}}
    else if(X==='share'){try{const tx=await o.txt();if(!tx)return;if(ANDROID){try{window.ThabatAndroid.share(qSurahName(s)+' '+a,tx)}catch(err){}}else navigator.share({text:tx}).catch(()=>{})}catch(err){}}
    else if(X==='tfs'){if(TF.src==='gharib')TF.src=S.quran.tfsSrc&&S.quran.tfsSrc!=='gharib'?S.quran.tfsSrc:'baghawi';openTafsir(s,a)}};
  setTimeout(()=>document.addEventListener('pointerdown',qtjOut,true),0);
  requestAnimationFrame(()=>b.classList.add('on'))}
/* closing the bar also drops the text-page highlight (unless the ayah menu took over) */
{const _c=qtjClear;qtjClear=function(){_c();if(!$('#ppPop'))qHl()}}
/* tajweed Qalun: the bar replaces the 3.183 one (its «علامة» is now the colours) */
qtjBar=function(s,a,p,box,x,y){qAyBar(s,a,{p,box,x,y,txt:async()=>{const tx=await qtjText(s,a);return tx?`${tx}\n[${qSurahName(s)}: ${a} · ${t('qtj.qalun')}]`:''}})};
/* text pages: a click / long-press on a word (the caller passes the word) shows the bar; «…» and the page list open the menu */
{const _m=qAyahMenu;qAyahMenu=function(s,a,x,y,w){
  if(typeof w==='string'&&w&&!qAyMore){const r=S.quran.riwaya,k=s+':'+a;
    const hit=document.elementFromPoint(x,y),mp=(hit&&hit.closest&&hit.closest('.mp'))||null;
    const sp=[...(mp||document).querySelectorAll(`#spread span[data-k="${k}"]`)];
    if(sp.length){let bx=null;sp.forEach(e=>{const g=e.getBoundingClientRect();bx=bx?{top:Math.min(bx.top,g.top),bottom:Math.max(bx.bottom,g.bottom),left:Math.min(bx.left,g.left),right:Math.max(bx.right,g.right)}:{top:g.top,bottom:g.bottom,left:g.left,right:g.right}});
      const p=+((mp||sp[0].closest('.mp')||{dataset:{}}).dataset.p)||qPageOf(s,a);
      qAyBar(s,a,{p,box:bx,x,y,word:w,txt:async()=>{const tx=qAyahText(s,a,(RIWAYAT[r]||{}).kind==='text'?r:'hafs');return tx?`${tx}\n[${qSurahName(s)}: ${a}]`:''}});qHl(s,a);return}}
  const fromBar=qAyMore,ret=_m(s,a,x,y,w);try{qAyGroup(s,a,fromBar)}catch(e){}return ret}}
/* the ayah menu in groups: colours on top, then understand / memorise / share and more */
const QAYG=[['ayg.und',['tfs','gh','note','topic']],['ayg.hifz',['hzat','rng','play']],['ayg.more',['card','board','sn','copy','share']]];
function qAyGroup(s,a,fromBar){const p=$('#ppPop'),g=p&&p.querySelector('.aygrid');if(!g||p.classList.contains('aygrp'))return;p.classList.add('aygrp');
  const B={},rest=[];[...g.children].forEach(b=>{let x=b.dataset.x;if(!x&&b.textContent.includes(t('ac.btn')))x=b.dataset.x='card';if(x)B[x]=b;else rest.push(b)});
  /* one picture: the share card (it follows the riwaya); the older plain picture goes. On the Qalun pictures it would show Hafs text, so neither. */
  ['mark','img'].forEach(x=>{if(B[x]){B[x].remove();delete B[x]}});
  if(typeof qtjOn==='function'&&qtjOn()&&B.card){B.card.remove();delete B.card}
  if(fromBar)['copy','share'].forEach(x=>{if(B[x]){B[x].remove();delete B[x]}});
  if(B.share)B.share.innerHTML=uicSvg('share','')+' '+esc(t('q.share'));
  const pg=qAyCtx&&qAyCtx.s===s&&qAyCtx.a===a?qAyCtx.p:0;
  let h=qAyDots(s,a,true);const used=new Set();
  const frag=document.createElement('div');frag.className='aygwrap';frag.innerHTML=h;
  QAYG.forEach(([lab,xs],i)=>{const items=xs.map(x=>B[x]).filter(Boolean);xs.forEach(x=>used.add(x));if(i===QAYG.length-1){Object.keys(B).forEach(x=>{if(!used.has(x))items.push(B[x])});items.push(...rest)}
    if(!items.length)return;const hd=document.createElement('div');hd.className='aygh';hd.textContent=t(lab);const gr=document.createElement('div');gr.className='aygrid';items.forEach(b=>gr.append(b));frag.append(hd,gr)});
  g.replaceWith(frag);qAyDotsWire(frag,s,a,pg);
  /* the menu grew: keep it on screen */
  const R=p.getBoundingClientRect();if(R.bottom>innerHeight-8)p.style.top=Math.max(8,innerHeight-8-R.height)+'px'}
/* marks on the tajweed Qalun pictures */
function qtjPaintMarks(){$$('.qtjmk').forEach(x=>x.remove());if(!qtjOn())return;const M=qMarks();if(!Object.keys(M).length)return;
  if(!QTJ){qtjLoad().then(()=>{if(QTJ)qtjPaintMarks()}).catch(()=>{});return}
  $$('#spread img[data-p]').forEach(im=>{if(!im.naturalWidth){if(!im._qmk){im._qmk=1;im.addEventListener('load',()=>{im._qmk=0;qtjPaintMarks()},{once:true})}return}
    const L=QTJ.p[+im.dataset.p];if(!L)return;let rs='';
    for(const A of L){const m=M[A[0]+':'+A[1]];if(!m||!QMK[m])continue;const r=A[2];for(let i=0;i<r.length;i+=4)rs+=`<rect fill="${QMK[m]}" x="${r[i]}" y="${r[i+1]+3}" width="${r[i+2]-r[i]}" height="${r[i+3]-r[i+1]-6}" rx="6" ry="4"/>`}
    if(!rs)return;const bx=qtjBox(im),sv=document.createElementNS('http://www.w3.org/2000/svg','svg');sv.setAttribute('class','qtjmk');sv.setAttribute('viewBox','0 0 1000 1000');sv.setAttribute('preserveAspectRatio','none');sv.setAttribute('aria-hidden','true');
    sv.style.cssText=`left:${bx.x}px;top:${bx.y}px;width:${bx.w}px;height:${bx.h}px`;sv.innerHTML=rs;im.after(sv)})}
hookFn('renderQuran',()=>renderQuran,f=>{renderQuran=f},'post',function(){setTimeout(()=>{try{qtjPaintMarks()}catch(e){}},0)});
{const _qsc=qSlideCommit;qSlideCommit=function(d){_qsc(d);setTimeout(()=>{try{qtjPaintMarks()}catch(e){}},0)}}
{let T_;addEventListener('resize',()=>{clearTimeout(T_);T_=setTimeout(()=>{try{qtjPaintMarks()}catch(e){}},150)})}
/* a coloured bookmark shows its colour in the bookmarks list */
hookFn('qbmOpen',()=>qbmOpen,f=>{qbmOpen=f},'post',function(){try{const M=qMarks();$$('#infoBox .qbmr[data-qbm]').forEach(r=>{const b=qbmList().find(x=>x.id===r.dataset.qbm);const m=b&&b.s&&M[b.s+':'+b.a];
  if(m&&QMK[m]){const g=r.querySelector('.qbmgo b');if(g&&!g.querySelector('.mkdot'))g.insertAdjacentHTML('afterbegin',`<i class="mkdot" style="background:${QMK[m]}"></i> `)}})}catch(e){}});
