/* ============ v3.8: phone Quran toolbar — one bar (position · riwaya · ⋯), a «go to» sheet and a tools sheet ============ */
const QB_NAV=['qDiv','qSurah','qJuz'],QB_LBL={qSearchBtn:'qx.search',qHlBtn:'hl.mode'};let QB_ORDER=null;
function qbSheet(id,title){let s=$('#'+id);if(!s){document.body.insertAdjacentHTML('beforeend',`<div class="qbsh" id="${id}" hidden><div class="qbshbox card"><div class="qbshh"><b>${esc(title)}</b><button class="btn sm ghost" data-x>✕</button></div><div class="qbshb"></div></div></div>`);s=$('#'+id);
  s.onclick=e=>{if(e.target===s||e.target.closest('[data-x]'))qbClose()}}return s}
function qbClose(){$$('.qbsh').forEach(s=>s.hidden=true)}
function qbOpen(id){qbClose();const s=$('#'+id);if(s)s.hidden=false}
function qbSummary(){const b=$('#qbPos');if(!b)return;const Q=S.quran,p=Math.max(1,Math.min(604,(MOB.matches?Q.pv:0)||Q.view||1));b.querySelector('span').textContent=`${qSurahAt(p).name} · ${t('qx.jz')}${qJuzAt(p)} · ${t('q.pageS')}${p}`}
function qbLayout(){const bar=$('.qbar');if(!bar)return;if(!QB_ORDER)QB_ORDER=[...bar.children];const mob=MOB.matches;
  if(!mob){if(!bar.classList.contains('qbc'))return;QB_ORDER.forEach(e=>bar.append(e));[...$$('#qbTools .qbshb>*')].forEach(e=>{if(!QB_ORDER.includes(e))bar.append(e)});const top=$('#qbTop');if(top)top.remove();bar.classList.remove('qbc');qbClose();return}
  const nav=qbSheet('qbNav',t('qx.nav')),tools=qbSheet('qbTools',t('qx.tools')),nb=nav.querySelector('.qbshb'),tb=tools.querySelector('.qbshb');bar.classList.add('qbc');
  let top=$('#qbTop');if(!top){bar.insertAdjacentHTML('afterbegin',`<div class="qbtop" id="qbTop"><button class="btn sm qbpos" id="qbPos"><span></span><i>▾</i></button><span class="qbriw"></span><button class="btn sm qbmore" id="qbMore" aria-label="${esc(t('qx.tools'))}">⋯</button></div>`);top=$('#qbTop');
    $('#qbPos').onclick=()=>qbOpen('qbNav');$('#qbMore').onclick=()=>qbOpen('qbTools')}
  const riw=$('#qRiw');if(riw&&riw.parentElement!==top.querySelector('.qbriw'))top.querySelector('.qbriw').append(riw);
  QB_NAV.forEach(id=>{const e=$('#'+id);if(e&&e.parentElement!==nb)nb.append(e)});const pg=$('#qPageIn');const lb=pg&&pg.closest('label');if(lb&&lb.parentElement!==nb)nb.append(lb);
  [...bar.children].forEach(e=>{if(e!==top&&e.tagName==='BUTTON')tb.append(e)});
  tb.querySelectorAll('button').forEach(b=>{if(b.dataset.qbl)return;b.dataset.qbl=1;b.classList.add('qbtool');const k=QB_LBL[b.id];if(k&&b.textContent.trim().length<=3)b.insertAdjacentHTML('beforeend',`<small>${esc(t(k))}</small>`)});
  qbSummary()}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#qbTools .qbtool');if(b)setTimeout(qbClose,0);if(e.target.closest&&e.target.closest('#qbNav select,#qbNav input'))return},true);
['change'].forEach(ev=>document.addEventListener(ev,e=>{if(e.target.closest&&e.target.closest('#qbNav')&&e.target.tagName==='SELECT')setTimeout(qbClose,50)},true));
document.addEventListener('keydown',e=>{if(e.key==='Escape')qbClose()});
{const _rq=renderQuran;renderQuran=function(){_rq();try{qbLayout();qbSummary()}catch(e){console.error(e)}}}
{const _qbu=qBarUpdate;qBarUpdate=function(...a){const r=_qbu(...a);try{qbSummary()}catch(e){}return r}}
MOB.addEventListener&&MOB.addEventListener('change',()=>{try{qbLayout()}catch(e){}});
