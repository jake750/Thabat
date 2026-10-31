/* ============ v3.148 UX list F, the library: lessons left and the percent on course cards (each can be hidden), the finish date on finished cards, customised cards first, «الدرس التالي» the one filled button, the next lesson after 5 s you can cancel, the page bar under book covers, pages left in the chapter, the light chosen per book, PDF shelf categories, thumb-sized lesson rows ============ */
const UX6={endAt:0,go:0,nt:0,sh:0};
function ux6Ar(){return(S.settings.lang||'ar')==='ar'}
/* «بقي 3 دروس»: Arabic counted forms */
function ux6LeftTx(n){if(!ux6Ar())return t('ux6.left',n);return n===1?'بقي درس واحد':n===2?'بقي درسان':n<=10?'بقي '+n+' دروس':'بقي '+n+' درسًا'}
function ux6PgTx(n){if(!ux6Ar())return n===1?t('ux6.pg1'):t('ux6.pgs',n);return n===1?'آخر صفحة في الفصل':n===2?'بقيت صفحتان على نهاية الفصل':n<=10?'بقيت '+n+' صفحات على نهاية الفصل':'بقيت '+n+' صفحة على نهاية الفصل'}
function ux6Opt(){const L_=LIBS();return{left:L_.cLeft!==false,pct:L_.cPct!==false}}
function ux6OptApply(){const v=$('#v-lib');if(!v)return;const o=ux6Opt();v.classList.toggle('ux6nl',!o.left);v.classList.toggle('ux6np',!o.pct)}
/* 71 + 74: a course card shows the lessons left beside the percent; a finished one shows 🏁 and the day it was finished */
function ux6CardList(kind,id){try{if(kind==='d'){const n=libFind(id);return n?libMedia(n):[]}return lshMedia(id)}catch(e){return[]}}
{const _c=lshCard;lshCard=function(kind,id,name,pr,...a){let h=_c(kind,id,name,pr,...a);try{
  if(pr&&pr.n&&pr.done<pr.n)h=h.replace('<span class="lbpb">',`<span class="ux6left">${esc(ux6LeftTx(pr.n-pr.done))}</span><span class="lbpb">`);
  else if(pr&&pr.n){const P=LIBS().prog,at=Math.max(0,...ux6CardList(kind,id).map(x=>(P[x.id]&&P[x.id].at)||0));
    h=h.replace(/<span class="lshok">[\s\S]*?<\/span>/,`<span class="lshok ux6fin">🏁 ${esc(at?t('ux6.finAt',gShort(new Date(at))):t('lsh.finished'))}</span>`);h=h.replace('class="lshc"','class="lshc ux6done"')}
  if(lshMeta(id).cover||lshMeta(id).stars)h=h.replace('class="lshc','class="lshc ux6own')}catch(e){}return h}}
/* 77: cards you gave a cover or a rating come first (the chosen order stays inside each part) */
{const _s=lshSort;lshSort=function(arr,prog,...x){const r=_s(arr,prog,...x)||arr;try{if((LIBS().sort||'recent')==='manual')return r;const own=o=>{const m=lshMeta(o&&o.id);return m.cover||m.stars?1:0};const s=r.map((o,i)=>[o,i]).sort((a,b)=>own(b[0])-own(a[0])||a[1]-b[1]).map(z=>z[0]);r.splice(0,r.length,...s)}catch(e){}return r}}
/* the options: a small menu beside the sort */
function ux6OptMenu(anchor){const o=ux6Opt(),p=lshMenu(anchor,`<div class="aymh">${t('ux6.cardT')}</div><button data-o="left">${o.left?'☑':'☐'} ${t('ux6.oLeft')}</button><button data-o="pct">${o.pct?'☑':'☐'} ${t('ux6.oPct')}</button>`);
  p.querySelectorAll('[data-o]').forEach(b=>b.onclick=()=>{const L_=LIBS();if(b.dataset.o==='left')L_.cLeft=!o.left?undefined:false;else L_.cPct=!o.pct?undefined:false;if(L_.cLeft===undefined)delete L_.cLeft;if(L_.cPct===undefined)delete L_.cPct;save();closePP();ux6OptApply()})}
/* 73: the course page has one filled button, the next lesson, at the top */
function ux6Next(){const box=$('#libBox');if(!box)return;const o=String(LIB.open||'');
  box.querySelectorAll('.btn.pri:not(.lbcont):not(.ux6nx)').forEach(b=>{if(b.closest('.lshc,.lbcwi,.modal,#lselBar'))return;b.classList.remove('pri');b.classList.add('ux6sec')});
  const c=box.querySelector('.lbcont');if(c){const P=LIBS().prog,started=Object.keys(P).length&&c.textContent.indexOf(t('lb.cont'))>=0;if(started&&!c.dataset.ux6){c.dataset.ux6=1;const s=c.querySelector('span');c.innerHTML=`▶ ${esc(t('ux6.next'))}: `;if(s)c.append(s)}}
  if(o.startsWith('f:')&&!box.querySelector('.ux6nx')){const id=o.slice(2),list=lshMedia(id),pr=lshProg(list);if(!pr.next)return;const at=box.querySelector('.lshacts')||box.querySelector('.lshbar');if(!at)return;
    const nm=(lshMeta(pr.next.id).n)||libTitle(pr.next.n);at.insertAdjacentHTML('afterend',`<button class="btn pri lbcont ux6nx" data-ux6p="${esc(pr.next.id)}">▶ ${esc(pr.done?t('ux6.next'):t('lb.start'))}: <span dir="auto">${esc(nm)}</span></button>`);
    box.querySelector('.ux6nx').onclick=()=>{LIBX.ctx=id;libPlay(pr.next.id)}}}
/* 75: when a lesson ends, the next one waits 5 seconds on a card you can cancel */
document.addEventListener('ended',e=>{if(e.target&&e.target.id==='lvV')UX6.endAt=Date.now()},true);
function ux6NextCard(id){const ov=($('#lvV')&&$('#lvV').closest('.lbvw'))||$('#libPlayer');if(!ov)return false;ux6NextX();const it=libItem(id);if(!it)return false;const nm=(lshMeta(id).n)||libTitle(it.n||''),R=20,C=(2*Math.PI*R).toFixed(1);
  ov.insertAdjacentHTML('beforeend',`<div class="ux6nc" id="ux6Nc" role="dialog" aria-live="polite"><svg class="ux6ring" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="${R}"/><circle class="v" cx="24" cy="24" r="${R}" style="stroke-dasharray:${C};stroke-dashoffset:${C}"/><path d="M20 16l12 8-12 8z"/></svg><span class="ux6nct"><small>${esc(t('ux6.upNext'))}</small><b dir="auto">${esc(nm)}</b></span><button class="btn sm pri" id="ux6NcGo">${esc(t('ux6.playNow'))}</button><button class="btn sm ghost" id="ux6NcX">${esc(t('cancel'))}</button></div>`);
  const go=()=>{ux6NextX();UX6.go=1;libPlay(id)};$('#ux6NcGo').onclick=go;$('#ux6NcX').onclick=()=>ux6NextX();
  UX6.nt=setTimeout(()=>{if($('#ux6Nc')&&$('#libPlayer.on'))go();else ux6NextX()},5000);return true}
function ux6NextX(){clearTimeout(UX6.nt);UX6.nt=0;const c=$('#ux6Nc');if(c)c.remove()}
{const _lp=libPlay;libPlay=function(id,...a){try{if(!UX6.go&&UX6.endAt&&Date.now()-UX6.endAt<3000&&$('#libPlayer.on')&&LIB.cur&&LIB.cur.id!==id){UX6.endAt=0;if(ux6NextCard(id))return}}catch(e){}UX6.go=0;ux6NextX();return _lp(id,...a)}}
{const _lc=libClose;libClose=function(...a){ux6NextX();return _lc(...a)}}
/* 76: the page you reached as a thin bar under the cover */
{const _c=bkCard;bkCard=function(b,...a){let h=_c(b,...a);try{const pct=bkPct(b.key)||0;h=h.replace(/(<span class="bkcv[^"]*">)/,`$1<span class="ux6bb"><i style="width:${pct}%"></i></span>`).replace('class="bkc','class="bkc ux6bk')}catch(e){}return h}}
/* 72: pages left to the end of the chapter, from the book's outline */
function ux6ChPaint(){const pg=$('#bkPg');if(!pg)return;let el=$('#ux6Ch');const r=BKS()[BK.key]||{},ch=(r.ch||[]).filter(n=>n>0).sort((a,b)=>a-b),N=(BK.pages&&BK.pages.length)||r.n||0,cur=BK.cur||1;
  if(ch.length<2||!N){if(el)el.remove();return}const nx=ch.find(p=>p>cur),left=(nx||N+1)-cur;
  if(!el){pg.insertAdjacentHTML('afterend','<small id="ux6Ch" class="ux6ch"></small>');el=$('#ux6Ch')}el.textContent=ux6PgTx(left);el.classList.toggle('near',left<=3)}
{hookFn('bkTrack',()=>bkTrack,f=>{bkTrack=f},'post',function(){try{ux6ChPaint()}catch(e){}})}
/* 80: each book keeps its own light (day / paper / night / amber) */
{const _b=bkBuild;bkBuild=async function(...a){try{const r=BKS()[BK.key];if(r&&typeof r.ni==='string')BK.night=r.ni}catch(e){}const x=await _b(...a);try{ux6ChPaint()}catch(e){}return x}}
document.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('#bkNi,[data-amb]'))setTimeout(()=>{try{const r=BK.key&&BKS()[BK.key];if(r){r.ni=BK.night||'';save()}}catch(e){}},40)},true);
/* (d) PDF shelf categories: books, lessons, other, and your own */
const UX6C=[['b','📚','ux6.cB'],['l','🎬','ux6.cL'],['o','📎','ux6.cO']];
function ux6Cats(){const L_=LIBS();return L_.bkCats||(L_.bkCats=[])}
function ux6CatMap(){const L_=LIBS();return L_.bkCat||(L_.bkCat={})}
function ux6LessonPdfs(){const k=LIB.tree,c=UX6._lp;if(c&&c.k===k)return c.s;const s=new Set();const walk=n=>{const kids=n.c||[];const hasM=kids.some(x=>x.k==='v'||x.k==='a');kids.forEach(x=>{if(x.k==='d')walk(x);else if(hasM&&x.k==='f')s.add('p:'+x.id)})};(LIB.tree||[]).forEach(walk);UX6._lp={k,s};return s}
function ux6Cat(b){const m=ux6CatMap()[b.key];if(m&&(UX6C.some(c=>c[0]===m)||ux6Cats().some(c=>c.id===m)))return m;return!b.local&&ux6LessonPdfs().has(b.key)?'l':'b'}
function ux6CatName(id){const c=UX6C.find(x=>x[0]===id);if(c)return c[1]+' '+t(c[2]);const u=ux6Cats().find(x=>x.id===id);return u?'🏷 '+u.n:''}
function ux6CatSel(){let c='';try{c=localStorage.getItem('thabat.bkcat')||''}catch(e){}if(c&&!UX6C.some(x=>x[0]===c)&&!ux6Cats().some(x=>x.id===c))c='';return c}
{const _a=bkAll;bkAll=function(...x){const r=_a(...x);if(!UX6.sh)return r;const c=ux6CatSel();return c?r.filter(b=>ux6Cat(b)===c):r}}
{const _h=bkShelfHTML;bkShelfHTML=function(...x){const all=bkAll();UX6.sh=1;let h;try{h=_h(...x)}finally{UX6.sh=0}
  try{if(all.length){const H=bkHid(),vis=all.filter(b=>!H[b.key]),n={};vis.forEach(b=>{const c=ux6Cat(b);n[c]=(n[c]||0)+1});const cur=ux6CatSel();
    const chip=(id,label,cnt)=>`<button class="bk2f ux6cf${cur===id?' on':''}" data-ux6c="${id}"${id&&!UX6C.some(c=>c[0]===id)?' data-ux6u="1"':''}>${label}${cnt!=null?` <small>${cnt}</small>`:''}</button>`;
    const row=`<div class="bk2fs ux6cats" role="group" aria-label="${esc(t('ux6.catsT'))}">${chip('',t('ux6.cAll2'),vis.length)}${UX6C.map(c=>chip(c[0],c[1]+' '+t(c[2]),n[c[0]]||0)).join('')}${ux6Cats().map(c=>chip(c.id,'🏷 '+esc(c.n),n[c.id]||0)).join('')}<button class="bk2f ux6cadd" data-ux6add="1" title="${esc(t('ux6.cNew'))}" aria-label="${esc(t('ux6.cNew'))}">＋</button></div>`;
    const i=h.indexOf('<div class="bk2fs">');if(i>=0)h=h.slice(0,i)+row+h.slice(i)}}catch(e){console.error(e)}return h}}
function ux6CatNew(then){const n=(prompt(t('ux6.cNewQ'))||'').trim().slice(0,30);if(!n)return;const id='c'+Date.now().toString(36);ux6Cats().push({id,n});save();if(then)then(id);else renderLib()}
function ux6CatEdit(anchor,id){const c=ux6Cats().find(x=>x.id===id);if(!c)return;const p=lshMenu(anchor,`<div class="aymh" dir="auto">🏷 ${esc(c.n)}</div><button data-a="ren">✏ ${t('ux6.cRen')}</button><button data-a="del" class="dng">🗑 ${t('ux6.cDel')}</button>`);
  p.querySelector('[data-a="ren"]').onclick=()=>{closePP();const n=(prompt(t('ux6.cNewQ'),c.n)||'').trim().slice(0,30);if(n){c.n=n;save();renderLib()}};
  p.querySelector('[data-a="del"]').onclick=()=>{closePP();const L_=LIBS(),bak={cats:JSON.parse(JSON.stringify(ux6Cats())),map:JSON.parse(JSON.stringify(ux6CatMap()))};L_.bkCats=ux6Cats().filter(x=>x.id!==id);const M=ux6CatMap();Object.keys(M).forEach(k=>{if(M[k]===id)delete M[k]});save();renderLib();
    toastAct(t('ux6.cDeleted'),t('lsh.undo'),()=>{L_.bkCats=bak.cats;L_.bkCat=bak.map;save();renderLib()},6000)}}
function ux6CatPick(anchor,key){const cur=ux6Cat(bkAll().find(b=>b.key===key)||{key}),all=[...UX6C.map(c=>c[0]),...ux6Cats().map(c=>c.id)];
  const p=lshMenu(anchor,`<div class="aymh">${t('ux6.catsT')}</div>${all.map(id=>`<button data-c="${id}">${cur===id?'✓ ':''}${esc(ux6CatName(id))}</button>`).join('')}<button data-c="+">＋ ${t('ux6.cNew')}</button>`);
  const set=id=>{ux6CatMap()[key]=id;save();renderLib();toast(t('ux6.cSet',ux6CatName(id)))};
  p.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{closePP();if(b.dataset.c==='+')ux6CatNew(set);else set(b.dataset.c)})}
{hookFn('bkMenu',()=>bkMenu,f=>{bkMenu=f},'post',function(anchor,key){try{const p=$('#ppPop');if(!p||p.querySelector('[data-ux6cat]'))return;const b=bkAll().find(x=>x.key===key);if(!b)return;
  const after=p.querySelector('[data-a="prog"]');const html=`<button data-ux6cat="1">🗂 ${esc(t('ux6.catIs',ux6CatName(ux6Cat(b))))}</button>`;if(after)after.insertAdjacentHTML('afterend',html);else p.insertAdjacentHTML('beforeend',html);
  p.querySelector('[data-ux6cat]').onclick=()=>{closePP();ux6CatPick(anchor,key)}}catch(e){}})}
/* binding after each render */
{hookFn('renderLib',()=>renderLib,f=>{renderLib=f},'post',function(){try{ux6OptApply();ux6Next();const box=$('#libBox');if(!box)return;
  box.querySelectorAll('[data-ux6c]').forEach(b=>{b.onclick=()=>{try{localStorage.setItem('thabat.bkcat',b.dataset.ux6c)}catch(e){}LIBX.allBooks=0;renderLib()};if(b.dataset.ux6u){const f=e=>{e.preventDefault();ux6CatEdit(b,b.dataset.ux6c)};b.oncontextmenu=f;let tm;b.addEventListener('touchstart',()=>{tm=setTimeout(()=>{b._lp=1;ux6CatEdit(b,b.dataset.ux6c)},480)},{passive:true});b.addEventListener('touchend',()=>clearTimeout(tm),{passive:true})}});
  const add=box.querySelector('[data-ux6add]');if(add)add.onclick=()=>ux6CatNew(id=>{try{localStorage.setItem('thabat.bkcat',id)}catch(e){}renderLib()});
  const tl=box.querySelector('.lshtools');if(tl&&!tl.querySelector('#ux6OptB')){tl.insertAdjacentHTML('beforeend',`<button class="btn sm ghost" id="ux6OptB" title="${esc(t('ux6.cardT'))}" aria-label="${esc(t('ux6.cardT'))}">⚙ ${esc(t('ux6.cardB'))}</button>`);$('#ux6OptB').onclick=e=>ux6OptMenu(e.currentTarget)}}catch(e){console.error(e)}})}

