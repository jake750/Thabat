/* ============ v3.5: highlighter for scanned mushafs + pages read in full screen ============ */
/* ---- highlights on scanned pages: bands {a,b,c} stored per riwaya:page (old single-line marks are numbers) ---- */
const QHL_C={hl:'#facc15',hifz:QMK.hifz,rev:QMK.rev,fav:QMK.fav,tdb:QMK.tdb},QHL={on:false,c:'hl',drag:null};
const qhlName=c=>c==='hl'?t('hl.hl'):t('q.mk.'+c);
function qhlNorm(m){return typeof m==='number'?{a:Math.max(0,m-.028),b:Math.min(1,m+.028),c:'hl'}:m}
function qhlIsImg(){const R=RIWAYAT[S.quran.riwaya];return!!R&&R.kind==='img'}
qMarksDraw=function(){if(!qhlIsImg())return;const M=QLMK(),rw=S.quran.riwaya;$$('#spread img[data-p]').forEach(im=>{const p=+im.dataset.p,box=im.parentElement,k=rw+':'+p;box.querySelectorAll('.qmark,.qhlb').forEach(x=>x.remove());box.style.position='relative';
  (M[k]||[]).map(qhlNorm).forEach((m,i)=>{const b=document.createElement('i');b.className='qhlb';b.style.cssText=`top:${m.a*100}%;height:${Math.max(.8,(m.b-m.a)*100)}%;--hc:${QHL_C[m.c]||QHL_C.hl}`;
    b.onclick=e=>{if(QHL.on)return;e.stopPropagation();qhlMenu(k,i,e.clientX,e.clientY)};box.append(b)})})};
function qhlMenu(k,i,x,y){const L_=QLMK()[k];if(!L_||!L_[i])return;const cur=qhlNorm(L_[i]).c;
  const p=qPopAt(`<div class="aymh">🖍 ${t('q.markT')}</div>${Object.keys(QHL_C).map(c=>`<button data-c="${c}" class="${cur===c?'on':''}"><i class="mkdot" style="background:${QHL_C[c]}"></i>${qhlName(c)}</button>`).join('')}<button data-c="">✕ ${t('hl.del')}</button>`,x,y,'aymenu');
  p.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{closePP();const c=b.dataset.c,M=QLMK();if(c){M[k][i]=Object.assign(qhlNorm(M[k][i]),{c})}else{M[k].splice(i,1);if(!M[k].length)delete M[k]}save();qMarksDraw()})}
function qhlBar(){let bar=$('#qHlBar');if(!QHL.on){if(bar)bar.remove();return}
  if(!bar){$('#mushaf').insertAdjacentHTML('beforeend','<div class="qhlbar" id="qHlBar"></div>');bar=$('#qHlBar')}
  bar.innerHTML=`<small>${t('hl.hint')}</small><span class="qhlcs">${Object.keys(QHL_C).map(c=>`<button class="qhlc ${QHL.c===c?'on':''}" data-c="${c}" title="${esc(qhlName(c))}" style="--hc:${QHL_C[c]}"></button>`).join('')}</span><button class="btn sm pri" id="qHlDone">${t('hl.done')}</button>`;
  bar.querySelectorAll('[data-c]').forEach(b=>b.onclick=e=>{e.stopPropagation();QHL.c=b.dataset.c;qhlBar()});$('#qHlDone').onclick=e=>{e.stopPropagation();qhlToggle(false)}}
function qhlToggle(on){QHL.on=on==null?!QHL.on:on;if(QHL.on&&!qhlIsImg())QHL.on=false;$('#mushaf').classList.toggle('qhl-on',QHL.on);$$('#qHlBtn,#qFsHl').forEach(b=>b.classList.toggle('on',QHL.on));qhlBar()}
function qhlBtns(){const img=qhlIsImg();let b=$('#qHlBtn');if(!b){$('#qDark').insertAdjacentHTML('beforebegin',`<button class="btn sm ghost" id="qHlBtn" title="${esc(t('hl.mode'))}">🖍</button>`);b=$('#qHlBtn');b.onclick=()=>qhlToggle()}
  let f=$('#qFsHl');if(!f){$('#qFsDark').insertAdjacentHTML('beforebegin',`<button class="btn sm" id="qFsHl" title="${esc(t('hl.mode'))}">🖍</button>`);f=$('#qFsHl');f.onclick=e=>{e.stopPropagation();qhlToggle()}}
  b.hidden=f.hidden=!img;if(!img&&QHL.on)qhlToggle(false)}
{const _rq=renderQuran;renderQuran=function(){_rq();try{qhlBtns();$('#mushaf').classList.toggle('qhl-on',QHL.on);qhlBar()}catch(e){console.error(e)}}}
{const inPage=e=>QHL.on&&e.target&&e.target.closest&&e.target.closest('#spread')&&!e.target.closest('#qHlBar');
  const imgAt=(x,y)=>[...$$('#spread img[data-p]')].find(im=>{const r=im.getBoundingClientRect();return r.width>0&&x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom});
  const fy=(im,y)=>{const r=im.getBoundingClientRect();return Math.max(0,Math.min(1,(y-r.top)/r.height))};
  window.addEventListener('pointerdown',e=>{if(!inPage(e))return;const im=imgAt(e.clientX,e.clientY);e.preventDefault();e.stopImmediatePropagation();if(!im)return;
    const y0=fy(im,e.clientY),pv=document.createElement('i');pv.className='qhlb pv';pv.style.setProperty('--hc',QHL_C[QHL.c]);im.parentElement.style.position='relative';im.parentElement.append(pv);QHL.drag={im,y0,y1:y0,pv};
    const draw=()=>{const d=QHL.drag,a=Math.min(d.y0,d.y1),b=Math.max(d.y0,d.y1);pv.style.top=(a*100)+'%';pv.style.height=Math.max(1,(b-a)*100)+'%'};draw();QHL.drag.draw=draw},true);
  window.addEventListener('pointermove',e=>{const d=QHL.drag;if(!d)return;e.preventDefault();e.stopImmediatePropagation();d.y1=fy(d.im,e.clientY);d.draw()},true);
  const end=e=>{const d=QHL.drag;if(!d)return;QHL.drag=null;e.stopImmediatePropagation();d.pv.remove();let a=Math.min(d.y0,d.y1),b=Math.max(d.y0,d.y1);
    if(b-a<.015){a=Math.max(0,d.y0-.028);b=Math.min(1,d.y0+.028)}const k=S.quran.riwaya+':'+(+d.im.dataset.p),M=QLMK();(M[k]=M[k]||[]).push({a:Math.round(a*1000)/1000,b:Math.round(b*1000)/1000,c:QHL.c});save();qMarksDraw()};
  window.addEventListener('pointerup',end,true);window.addEventListener('pointercancel',end,true);
  ['touchstart','touchmove','touchend','mousedown','mouseup','click','dblclick','contextmenu'].forEach(ev=>window.addEventListener(ev,e=>{if(!inPage(e))return;if(ev==='touchmove'||ev==='contextmenu')e.preventDefault();e.stopImmediatePropagation()},{capture:true,passive:false}))}
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&QHL.on)qhlToggle(false)});
/* the marks list also shows highlighted scanned pages of the current riwaya */
{const _ml=qMarksList;qMarksList=function(){_ml();const M=QLMK(),rw=S.quran.riwaya,ps=Object.keys(M).filter(k=>k.startsWith(rw+':')).map(k=>+k.split(':')[1]).sort((a,b)=>a-b);if(!ps.length)return;
  const act=$('#ltBox .ltact');if(!act)return;const em=$('#ltBox .empty');if(em)em.remove();
  act.insertAdjacentHTML('beforebegin',`<b class="wblh">🖍 ${t('hl.list')} (${ps.length})</b><div class="wbpick">${ps.map(p=>`<button class="suitem" data-hp="${p}"><b>${t('q.pageS')} ${p} · ${esc(qSurahAt(p).name)}</b><small>${(M[rw+':'+p]||[]).map(qhlNorm).map(m=>`<i class="mkdot" style="background:${QHL_C[m.c]||QHL_C.hl}"></i>`).join(' ')}</small></button>`).join('')}</div>`);
  $$('#ltBox [data-hp]').forEach(b=>b.onclick=()=>{closeLt();showView('quran');qShow(+b.dataset.hp)})}}

/* ---- full screen: 40 s on a page marks it read; each day keeps the list of pages read ---- */
const QRD={key:'',t0:0,done:false},QRD_MS=40000;
function qVisPages(){const Q=S.quran,v=Q.view||1,one=MOB.matches||document.documentElement.classList.contains('qfs-one');return one?[Math.max(1,Math.min(604,Q.pv||v))]:[v,v+1].filter(p=>p>=1&&p<=604)}
function qPgsOf(k){const d=S.days[k];return(d&&d.quran&&d.quran.pgs)||[]}
function qReadMark(pages){const q=qDay(todayKey());q.pgs=q.pgs||[];const nw=pages.filter(p=>!q.pgs.includes(p)).sort((a,b)=>a-b);if(!nw.length)return;
  q.pgs=[...q.pgs,...nw].sort((a,b)=>a-b);const Q=S.quran;let moved=false;
  nw.forEach(p=>{if(qCovered(Q.page)<604&&qNextPage(Q.page)===p){qSetPage(p);moved=true}});if(!moved)save();qrdUi()}
function qrdUi(){const el=$('#qRdSt');if(!el)return;const g=qPgsOf(todayKey()),ps=qVisPages(),ok=ps.every(p=>g.includes(p));
  el.hidden=false;el.classList.toggle('ok',ok);if(ok){el.textContent='✓ '+t('rd.read');return}const left=Math.max(0,Math.ceil((QRD_MS-(Date.now()-QRD.t0))/1000));el.textContent=QRD.key?'📖 '+left+'s':''}
{const pg=$('#qFsPg');if(pg&&!$('#qRdSt'))pg.insertAdjacentHTML('afterend','<span class="qfspg qrdst" id="qRdSt" hidden></span>')}
setInterval(()=>{const fs=document.documentElement.classList.contains('qfs');if(!fs||document.hidden||curView()!=='quran'||S.settings.qRead40===false){QRD.key='';return}
  const ps=qVisPages(),k=ps.join(',');if(k!==QRD.key){QRD.key=k;QRD.t0=Date.now();QRD.done=false}
  else if(!QRD.done&&Date.now()-QRD.t0>=QRD_MS){QRD.done=true;qReadMark(ps)}qrdUi()},1000);
function qPgsLine(k){const g=qPgsOf(k);return g.length?t('rd.line',rangesStr(g),g.length):''}
{const _rqs=renderQSide;renderQSide=function(){_rqs();try{const b=$('#qToday'),l=qPgsLine(todayKey());if(b&&l&&!b.querySelector('.qrdl'))b.insertAdjacentHTML('beforeend',`<div class="qrdl">📖 ${l}</div>`)}catch(e){}}}
{const _rd=renderDetail;renderDetail=function(k){_rd(k);try{const l=qPgsLine(k),mb=$('#detail .minibar');if(l&&mb)mb.insertAdjacentHTML('afterend',`<div class="sec qrdsec"><b>📖 ${t('rd.day')}</b><div class="qrdl">${l}</div></div>`)}catch(e){}}}
