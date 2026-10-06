/* ============ v3.4: hifz levels, free review, khatma setup, media cards, phone-only UI ============ */
/* ---- hifz strength per page: solid (default) / mid / weak / lost, kept in S.quran.mlv ---- */
const MLV=['solid','mid','weak','lost'],MLV_C={solid:'var(--accent)',mid:'color-mix(in srgb,var(--accent) 45%,var(--panel2))',weak:'#f97316',lost:'#ef4444'},MLV_W={solid:0,mid:.7,weak:1.6,lost:3};
let mlvAddSel='solid';
function mlvOf(p){return(S.quran.mlv||{})[p]||'solid'}
function mlvSet(pages,lv,addMem){const Q=S.quran,o=Q.mlv||(Q.mlv={}),M=new Set(Q.memorized);
  pages.forEach(p=>{if(lv==='solid')delete o[p];else o[p]=lv;if(addMem)M.add(p)});Q.memorized=[...M]}
{const _w=qWeak;qWeak=function(p){const o=S.quran.mlv||{};if(o[p])return o[p]==='weak'||o[p]==='lost';return _w(p)}}
{const _sm=qSetMem;qSetMem=function(pages,on){if(!on&&S.quran.mlv)pages.forEach(p=>delete S.quran.mlv[p]);_sm(pages,on)}}
/* smart review: weaker pages come back sooner */
{const _rs=qReviewSuggest;qReviewSuggest=function(){if(!qSmart())return _rs();const M=qMem();if(!M.length)return[];const Q=S.quran,L_=Q.rvLast||{},tk=todayKey(),n=Math.min(Q.review,M.length);
  const sc=M.map(p=>{const last=L_[p],days=last?Math.max(0,daysBetween(last,tk)):60,h=hzStat(p),w=Math.max(0,h.bad-h.ok*0.5),lw=MLV_W[mlvOf(p)];return[p,days*(1+w*0.6+lw)+w*3]});
  sc.sort((a,b)=>b[1]-a[1]||a[0]-b[0]);return sc.slice(0,n).map(x=>x[0]).sort((a,b)=>a-b)}}
function mlvCounts(){const c={};qMem().forEach(p=>{const l=mlvOf(p);c[l]=(c[l]||0)+1});return c}
{const _rqm=renderQMap;renderQMap=function(){_rqm();const box=$('#qMap');if(!box)return;const o=S.quran.mlv||{},c=mlvCounts();
  $$('#qMap .hc[data-p]').forEach(el=>{const l=o[el.dataset.p];if(el.classList.contains('rv'))el.classList.add('lv-'+(l||'solid'));if(!l)return;el.classList.remove('weak');if(el.classList.contains('m'))el.classList.add('lv-'+l)});
  const lg=box.querySelector('.hlegend');if(lg)lg.innerHTML=MLV.map(l=>`<span><i style="background:${MLV_C[l]}"></i>${t('lv.'+l)}${c[l]?` <b>${c[l]}</b>`:''}</span>`).join('')+`<span><i style="box-shadow:inset 0 0 0 2px var(--ok)"></i>${t('q.lgRv')}</span><span><i style="outline:1.5px solid var(--text)"></i>${t('q.lgCur')}</span>`;
  const sm=$('#qSelMem');if(sm){sm.insertAdjacentHTML('afterend',`<span class="mlvpick"><small>${t('lv.t')}:</small>${MLV.map(l=>`<button class="mlvb" data-lv="${l}"><i style="background:${MLV_C[l]}"></i>${t('lv.'+l)}</button>`).join('')}</span><button class="btn sm" id="qSelRv">↻ ${t('q.selRv')}</button>`);
    $$('#qSelBar .mlvb').forEach(b=>b.onclick=()=>{const ps=[...qSel],l=b.dataset.lv;if(!ps.length)return;qSel.clear();mlvSet(ps,l,true);save();renderQAll();toast(t('lv.done',ps.length,t('lv.'+l)))});
    $('#qSelRv').onclick=()=>{const ps=[...qSel];if(!ps.length)return;qSel.clear();const q=qDay(todayKey());rvmApply([...(q.review&&q.rv?q.rv:[]),...ps],'')}}
  const ua=$('#qUAdd');if(ua){ua.insertAdjacentHTML('beforebegin',`<select class="in" id="qULv" title="${esc(t('lv.t'))}">${MLV.map(l=>`<option value="${l}" ${mlvAddSel===l?'selected':''}>${t('lv.'+l)}</option>`).join('')}</select>`);
    $('#qULv').onchange=e=>{mlvAddSel=e.target.value};
    ua.onclick=()=>{const u=qUnitList(qUnit)[+$('#qUnitV').value];if(!u)return;const ps=rangePages(u.r);mlvSet(ps,mlvAddSel,false);qSetMem(ps,true)}}
  const hh=box.querySelector('.hhint');if(ANDROID&&hh)hh.textContent=hh.textContent.replace(t('q.mapHint'),t('q.mapHintA'))}}
{const _bq=renderBriefQuran;renderBriefQuran=function(st){_bq(st);const box=$('#bQuran');if(!box||!qMem().length)return;const c=mlvCounts(),L_=MLV.filter(l=>c[l]);
  box.insertAdjacentHTML('beforeend',`<div class="mlvsum"><div class="mlvk">${t('lv.bar')}</div><div class="mlvbar">${L_.map(l=>`<i style="flex:${c[l]};background:${MLV_C[l]}" title="${esc(t('lv.'+l))} ${c[l]}"></i>`).join('')}</div><div class="mlvlg">${L_.map(l=>`<span><i style="background:${MLV_C[l]}"></i>${t('lv.'+l)} <b>${c[l]}</b></span>`).join('')}</div></div>`)}}

/* ---- review: log what you actually reviewed, in any order ---- */
let RVM=null;
function rvmApply(pages,lv){const q=qDay(todayKey()),Q=S.quran,P=[...new Set(pages)].sort((a,b)=>a-b);if(!P.length)return;
  q.rv=P;q.review=true;q.rvMan=true;Q.rvLast=Q.rvLast||{};P.forEach(p=>Q.rvLast[p]=todayKey());
  if(lv)mlvSet(P,lv,true);save();chimeSoft(1175);renderQAll();toast(t('rvm.done',P.length))}
function openRvm(){const q=qDay(todayKey());RVM={pages:new Set(q.review&&q.rv?q.rv:[]),u:RVM?RVM.u:'surah',lv:''};$('#rvmModal').classList.add('on');renderRvm()}
function rvmClose(){$('#rvmModal').classList.remove('on')}
function renderRvm(){const R=RVM,units=[...qUnits(),'page'];if(!units.includes(R.u))R.u='surah';const P=[...R.pages].sort((a,b)=>a-b),rg=[];
  for(let i=0;i<P.length;i++){let j=i;while(j+1<P.length&&P[j+1]===P[j]+1)j++;rg.push([P[i],P[j]]);i=j}
  const uName=u=>t('q.unit'+u[0].toUpperCase()+u.slice(1));
  $('#rvmBox').innerHTML=`<h2>↻ ${t('rvm.t')}</h2><p class="rvmsub">${t('rvm.sub')}</p>
   <div class="rvmrow"><select class="in" id="rvmU">${units.map(u=>`<option value="${u}" ${R.u===u?'selected':''}>${uName(u)}</option>`).join('')}</select>${R.u==='page'?`<input class="in num" id="rvmA" type="number" min="1" max="604" placeholder="${esc(t('rvm.from'))}"><input class="in num" id="rvmB" type="number" min="1" max="604" placeholder="${esc(t('rvm.to'))}">`:`<select class="in" id="rvmV">${qUnitList(R.u).map((x,i)=>`<option value="${i}">${esc(x.label)}</option>`).join('')}</select>`}<button class="btn sm pri" id="rvmAdd">＋ ${t('rvm.add')}</button></div>
   ${qMem().length?`<button class="btn sm ghost rvmsug" id="rvmSug">✦ ${t('rvm.sug')}: ${t('q.pageS')} ${rangesStr(qReviewSuggest())}</button>`:''}
   <div class="rvmlist">${rg.length?rg.map(([a,b],i)=>`<span class="rvmchip">${t('q.pageS')} ${a===b?a:a+'–'+b} · ${esc(surahsOf(rangePages([a,b])))}<button class="link" data-x="${i}" aria-label="✕">✕</button></span>`).join(''):`<small class="muted">${t('rvm.empty')}</small>`}</div>
   ${P.length?`<div class="rvmn">${t('rvm.n',P.length)}</div>`:''}
   <div class="rvmlv"><small>${t('rvm.how')}</small><div class="rvmlvs">${MLV.map(l=>`<button class="mlvb ${R.lv===l?'on':''}" data-lv="${l}"><i style="background:${MLV_C[l]}"></i>${t('lv.'+l)}</button>`).join('')}</div></div>
   <div class="evact">${qDay(todayKey()).review?`<button class="btn sm ghost" id="rvmClr">${t('rvm.clear')}</button>`:''}<span style="flex:1"></span><button class="btn sm" id="rvmX">${t('cancel')}</button><button class="btn sm pri" id="rvmGo" ${P.length?'':'disabled'}>${t('rvm.save')}</button></div>`;
  $('#rvmU').onchange=e=>{R.u=e.target.value;renderRvm()};
  $('#rvmAdd').onclick=()=>{let ps=[];if(R.u==='page'){const a=+$('#rvmA').value,b=+$('#rvmB').value||a;if(!(a>=1&&a<=604&&b>=1&&b<=604))return;ps=rangePages([Math.min(a,b),Math.max(a,b)])}else{const u=qUnitList(R.u)[+$('#rvmV').value];if(u)ps=rangePages(u.r)}ps.forEach(p=>R.pages.add(p));renderRvm()};
  const sg=$('#rvmSug');if(sg)sg.onclick=()=>{qReviewSuggest().forEach(p=>R.pages.add(p));renderRvm()};
  $$('#rvmBox [data-x]').forEach(b=>b.onclick=()=>{const [a,c]=rg[+b.dataset.x];for(let p=a;p<=c;p++)R.pages.delete(p);renderRvm()});
  $$('#rvmBox .rvmlvs .mlvb').forEach(b=>b.onclick=()=>{R.lv=R.lv===b.dataset.lv?'':b.dataset.lv;renderRvm()});
  $('#rvmX').onclick=rvmClose;const cl=$('#rvmClr');if(cl)cl.onclick=()=>{rvmClose();if(qDay(todayKey()).review)qToggle('review')};
  $('#rvmGo').onclick=()=>{rvmClose();rvmApply([...R.pages],R.lv)}}
$('#rvmModal').onclick=e=>{if(e.target.id==='rvmModal')rvmClose()};
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('#rvmModal').classList.contains('on'))rvmClose()});
{const _qt=qToggle;qToggle=function(k){const q=qDay(todayKey());if(k==='review'&&q.review&&q.rvMan){q.review=false;q.rv=null;q.rvMan=false;save();renderQAll();return}_qt(k)}}
{const _qc=qChecklist;qChecklist=function(w){const q=qDay(todayKey());let h=_qc(w);
  if(!qMem().length){h=h.replace(/(class="qchk[^"]*?) dis"/,'$1"');if(q.review&&q.rv)h=h.replace(t('q.noMem'),t('q.reviewSub',rangesStr(q.rv))+' · '+esc(surahsOf(q.rv)));else h=h.replace(t('q.noMem'),t('rvm.hint'))}
  const i=h.lastIndexOf('</div>');return h.slice(0,i)+`<button class="btn sm ghost rvmb" data-qa="rvm" title="${esc(t('rvm.t'))}">✎ ${t('rvm.btn')}</button>`+h.slice(i)}}
{const _bq=bindQ;bindQ=function(root){_bq(root);root.querySelectorAll('[data-qa=rvm]').forEach(b=>b.onclick=e=>{e.stopPropagation();openRvm()});
  const r=root.querySelector('.qchk[data-qk=review] .qck');if(r&&!qMem().length&&!qDay(todayKey()).review)r.onclick=()=>openRvm()}}

/* ---- khatma: say where it started and where you are, the date is optional ---- */
function kxDateStr(k){const d=keyToDate(k),h=hijri(d);return`${h.day} ${h.month} · ${gShort(d)}`}
{const _sp=qSetPage;qSetPage=function(np){const Q=S.quran,n=Q.khatmas.length,nd=Q.kNoDate;_sp(np);if(Q.khatmas.length>n){if(nd)Q.khatmas[Q.khatmas.length-1].start=null;Q.kNoDate=false;save()}}}
{const _rqs=renderQSide;renderQSide=function(){_rqs();const Q=S.quran,box=$('#qStBox'),sv=$('#qStSave');if(!box||!sv||box.querySelector('.kxrow'))return;
  const ed=$('#qStEd');if(ed&&Q.kStart&&Q.page)ed.insertAdjacentHTML('beforebegin',`<span class="kxb">· ${t('kx.began')}: <b>${Q.kNoDate?t('kx.unkD'):esc(kxDateStr(Q.kStart))}</b></span>`);
  sv.insertAdjacentHTML('beforebegin',`<div class="kxrow kxhint">${t('kx.hint')}</div><label class="kxrow"><span>${t('kx.cur')}</span><input class="in num" id="kxCur" type="number" min="1" max="604" value="${Q.page||''}" placeholder="—"></label><div class="kxrow"><span>${t('kx.date')}</span><input class="in" id="kxDate" type="date" max="${todayKey()}" value="${Q.kNoDate?'':(Q.kStart||'')}" ${Q.kNoDate?'disabled':''}><label class="kxck"><input type="checkbox" id="kxNo" ${Q.kNoDate?'checked':''}> ${t('kx.unk')}</label></div>`);
  $('#kxNo').onchange=e=>{$('#kxDate').disabled=e.target.checked};
  const o=sv.onclick;sv.onclick=()=>{const cur=+$('#kxCur').value||0,no=$('#kxNo').checked,dt=$('#kxDate').value;o();
    if(cur>=1&&cur<=604){Q.page=cur;Q.pv=cur;Q.view=cur%2?cur:cur-1}
    if(no){Q.kNoDate=true;if(!Q.kStart)Q.kStart=todayKey()}else if(dt){Q.kStart=dt;Q.kNoDate=false}
    if(Q.page&&!Q.kStart)Q.kStart=todayKey();Q.wirdCalc=null;qStartOpen=false;save();renderQAll()};
  const nk=$('#qNewK');if(nk)nk.addEventListener('click',()=>{S.quran.kNoDate=false;save()})}}

/* ---- summary: what you watched or listened to, as cards with YouTube thumbnails ---- */
let vcAll=false;
function vcGroups(keys){const G={};keys.forEach(k=>{((S.days[k]||{}).media||[]).forEach(m=>{const key=m.url?mKey(m.url):'t:'+String(m.title||'').trim().toLowerCase();
  const g=G[key]||(G[key]={url:'',title:m.title,how:m.how,type:m.type,min:0,n:0,full:0,pos:0,last:0,k});g.n++;g.min+=m.minutes||0;if(m.full)g.full=Math.max(g.full,m.full);if(m.to!=null)g.pos=Math.max(g.pos,m.to);
  const at=m.at||keyToDate(k).getTime();if(at>=g.last){g.last=at;g.k=k;g.title=m.title||g.title;g.how=m.how;g.type=m.type;if(m.url)g.url=m.url}else if(!g.url&&m.url)g.url=m.url})});
  return Object.values(G).sort((a,b)=>b.last-a.last)}
function vcCard(g,i){const id=g.url&&ytId(g.url),len=g.full||g.min*60,seen=g.pos||g.min*60,pc=g.full?Math.min(100,Math.round(seen/g.full*100)):0,d=keyToDate(g.k),h=hijri(d);
  return`<div class="vcard" role="button" tabindex="0" data-i="${i}" title="${esc(g.title||g.url||'')}"><div class="vth"><span class="vph">${MICON[g.how]||MICON.watch}<small>${t('type.'+g.type)}</small></span>${id?`<img src="https://i.ytimg.com/vi/${id}/mqdefault.jpg" alt="" loading="lazy" onerror="this.remove()">`:''}<span class="vhow">${MICON[g.how]||MICON.watch}</span>${len?`<span class="vdur">${fmtTC(len)}</span>`:''}${pc?`<span class="vprog"><i style="width:${pc}%"></i></span>`:''}</div>
   <div class="vtt" dir="auto">${esc(g.title||g.url||'')}</div><div class="vmeta">${t('how.'+g.how)} ${fmtHM(g.min*6e4)}${g.n>1?' · '+t('mlog.times',g.n):''}</div><div class="vmeta">${h.day} ${h.month} · ${gShort(d)}</div></div>`}
{const _rb=renderBrief;renderBrief=function(){_rb();const box=$('#bMedia'),ul=box&&box.querySelector('.bml');if(!ul)return;
  const G=vcGroups(periodKeys(bMode,bAnchor)),lim=innerWidth<700?6:12,shown=vcAll?G:G.slice(0,lim);
  box.querySelectorAll('.bml ~ .empty').forEach(e=>e.remove());
  ul.outerHTML=`<div class="vcg">${shown.map(vcCard).join('')}</div>${G.length>lim?`<button class="btn sm ghost vcmore" id="vcMore">${vcAll?t('vc.less'):t('vc.more',G.length-lim)}</button>`:''}`;
  $$('#bMedia .vcard').forEach(c=>{const g=shown[+c.dataset.i],go=()=>{if(g.url)openExt(mContUrl(g.url,g.pos));else{showView('today');$('#mediaLogBtn').click()}};c.onclick=go;c.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go()}}});
  const mb=$('#vcMore');if(mb)mb.onclick=()=>{vcAll=!vcAll;renderBrief()}}}

/* ---- phone: hide what only works on the computer ---- */
if(ANDROID){for(let i=TIPS.length-1;i>=0;i--)if(['tip.keys','tip.cmd'].includes(TIPS[i][1]))TIPS.splice(i,1);if(S.tipCur!=null&&S.tipCur>=TIPS.length)S.tipCur=null}
