/* ============ v3.152 hifz map details panel: the space beside the map shows the juz' (or hizb) under the pointer or the one you picked ============ */
const QMD={pin:null,hov:null};
function qmdRows(){try{return qMapRows()}catch(e){return[]}}
function qmdRowOf(p){const r=qmdRows();for(let i=0;i<r.length;i++)if(p>=r[i][1]&&p<=r[i][2])return i;return 0}
function qmdAgo(k){const d=daysBetween(k,todayKey());return d<=0?t('qmd.today'):d===1?t('qmd.yday'):t('qmd.ago',d)}
function qmdHTML(i){const R=qmdRows()[i];if(!R)return'';const [n,a,b]=R,Q=S.quran,M=new Set(qMem()),last=Q.rvLast||{},rp=(Q.rpt&&Q.rpt.p)||{};
  let rv;try{const q=qDay(todayKey());rv=new Set(q.review&&q.rv?q.rv:qReviewSuggest())}catch(e){rv=new Set()}
  const all=b-a+1,mem=[],c={solid:0,mid:0,weak:0,lost:0},due=[];let newest='',oldest=null,reps=0;
  for(let p=a;p<=b;p++){reps+=+rp[p]||0;if(!M.has(p))continue;mem.push(p);c[mlvOf(p)]++;if(rv.has(p))due.push(p);
    const l=last[p];if(l&&l>newest)newest=l;if(!oldest||(l||'')<(oldest[1]||''))oldest=[p,l||'']}
  const sur=[...new Set(Array.from({length:all},(_,k)=>qSurahAt(a+k).name))],surT=sur.length>3?sur.slice(0,2).join('، ')+' … '+sur[sur.length-1]:sur.join('، ');
  const pct=Math.round(mem.length/all*100),pg=p=>`<button class="qmdpg" data-qmdgo="${p}">${t('q.pageS')} ${p}</button>`;
  const ttl=t(Q.div==='hizb'?'qmd.hizb':'qmd.juz',n);
  let h=`<div class="qmdh"><b>${ttl}</b><small>${t('q.pageS')} ${a}–${b}</small></div><div class="qmds">${esc(surT)}</div>
   <div class="qmdbar"><i style="width:${pct}%"></i></div><div class="qmdk">${t('qmd.mem',mem.length,all)}</div>`;
  if(mem.length){h+=`<div class="qmdlv">${MLV.map(l=>`<span${c[l]?'':' class="z"'}><i style="background:${MLV_C[l]}"></i>${t('lv.'+l)} <b>${c[l]}</b></span>`).join('')}</div>`;
    h+=`<div class="qmdr"><span>${t('q.lgRv')}</span><div>${due.length?due.slice(0,6).map(pg).join('')+(due.length>6?` <small>+${due.length-6}</small>`:''):`<small>${t('qmd.none')}</small>`}</div></div>`;
    h+=`<div class="qmdr"><span>${t('qmd.last')}</span><div>${newest?qmdAgo(newest):`<small>${t('qmd.never')}</small>`}</div></div>`;
    if(oldest)h+=`<div class="qmdr"><span>${t('qmd.oldest')}</span><div>${pg(oldest[0])} <small>${oldest[1]?qmdAgo(oldest[1]):t('qmd.never')}</small></div></div>`;
    const wk=mem.filter(p=>{const l=mlvOf(p);return l==='weak'||l==='lost'});
    if(wk.length)h+=`<div class="qmdr"><span>${t('qmd.weak')}</span><div>${wk.slice(0,6).map(pg).join('')}${wk.length>6?` <small>+${wk.length-6}</small>`:''}</div></div>`}
  else h+=`<div class="qmde">${t('qmd.empty')}</div>`;
  if(reps)h+=`<div class="qmdr"><span>${t('qmd.reps')}</span><div><b>${reps}</b></div></div>`;
  h+=`<div class="qmdact"><button class="btn sm" data-qmdgo="${a}">${t('qmd.open')}</button><button class="btn sm ghost" id="qmdSel">${t('qmd.sel')}</button></div>
   <div class="qmdhint">${t(QMD.pin!=null?'qmd.pinned':'qmd.hint')}</div>`;
  return h}
function qmdPaint(){const p=$('#qmdP');if(!p)return;const i=QMD.hov!=null?QMD.hov:QMD.pin!=null?QMD.pin:qmdRowOf(S.quran.page);
  if(p.dataset.i===String(i)&&p.dataset.k===String(S._savedAt)+(QMD.pin!=null))return;p.dataset.i=i;p.dataset.k=String(S._savedAt)+(QMD.pin!=null);
  p.innerHTML=qmdHTML(i);const R=qmdRows()[i];
  $$('#hmap .hrow').forEach((r,k)=>r.classList.toggle('qmdon',k===i));
  const sb=$('#qmdSel');if(sb&&R)sb.onclick=()=>{for(let x=R[1];x<=R[2];x++)qSel.add(x);renderQMap()}}
{hookFn('renderQMap',()=>renderQMap,f=>{renderQMap=f},'post',function(){try{const hm=$('#hmap');if(!hm||hm.parentElement.classList.contains('qmdw'))return;
  const w=document.createElement('div');w.className='qmdw';hm.before(w);w.append(hm);w.insertAdjacentHTML('beforeend','<aside class="qmdp" id="qmdP" aria-live="polite"></aside>');
  const rowI=e=>{const r=e.target.closest&&e.target.closest('.hrow');return r?[...hm.querySelectorAll('.hrow')].indexOf(r):-1};
  hm.addEventListener('mouseover',e=>{const i=rowI(e);if(i>=0&&i!==QMD.hov){QMD.hov=i;qmdPaint()}});
  hm.addEventListener('mouseleave',()=>{QMD.hov=null;qmdPaint()});
  hm.addEventListener('click',e=>{if(!e.target.closest('.jl'))return;const i=rowI(e);QMD.pin=QMD.pin===i?null:i;QMD.hov=null;qmdPaint()});
  $('#qmdP').addEventListener('click',e=>{const g=e.target.closest('[data-qmdgo]');if(g){qShow(+g.dataset.qmdgo);const m=$('#mushaf');if(m)m.scrollIntoView({behavior:'smooth',block:'start'})}});
  qmdPaint()}catch(e){console.error(e)}})}

