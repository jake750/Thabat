/* ============ 3.108 tenth list B: hifz strength per page, share a mushaf page as a picture, a guided hifz plan, the wird in minutes ============ */
/* 10th-17: S.quran.hstr = {page: 1 weak | 2 medium | 3 strong}; S.quran.mapStr colours the hifz map by it (an option, like «التكرار») */
function qhsGet(p){return+((S.quran.hstr||{})[p])||0}
function qhsSet(pages,v){const H=S.quran.hstr=S.quran.hstr||{};pages.forEach(p=>{if(v)H[p]=v;else delete H[p]});save()}
{hookFn('renderQMap',()=>renderQMap,f=>{renderQMap=f},'post',function(){try{const box=$('#qMap'),hm=$('#hmap');if(!box||!hm)return;const on=!!S.quran.mapStr,h3=box.querySelector('h3 span');
  if(h3&&!$('#qhsBtn')){h3.insertAdjacentHTML('beforeend',` <button class="btn sm ghost qmrb${on?' on':''}" id="qhsBtn" aria-pressed="${on}" title="${esc(t('qhs.tip'))}">💪 ${esc(t('qhs.btn'))}</button>`);
    $('#qhsBtn').onclick=()=>{S.quran.mapStr=!S.quran.mapStr;if(S.quran.mapStr)S.quran.mapRep=false;save();renderQMap()}}
  const sb=$('#qSelBar');if(sb&&!sb.querySelector('.qhsset')){sb.insertAdjacentHTML('beforeend',`<span class="qhsset">${[3,2,1].map(v=>`<button class="btn sm ghost" data-qhs="${v}"><i class="qhsk" data-hs="${v}"></i>${esc(t('qhs.v'+v))}</button>`).join('')}</span>`);
    sb.querySelectorAll('[data-qhs]').forEach(b=>b.onclick=()=>{const L_=[...qSel];if(!L_.length)return;qhsSet(L_,+b.dataset.qhs);toast(t('qhs.done',L_.length,t('qhs.v'+b.dataset.qhs)));renderQMap()})}
  hm.classList.toggle('hmstr',on);if(!on)return;
  hm.querySelectorAll('.hc[data-p]').forEach(c=>{const v=qhsGet(+c.dataset.p);if(v){c.dataset.hs=v;c.title+=' · '+t('qhs.v'+v)}else delete c.dataset.hs});
  const lg=box.querySelector('.hlegend');if(lg)lg.innerHTML=[3,2,1].map(v=>`<span><i class="qhsk" data-hs="${v}"></i>${esc(t('qhs.v'+v))}</span>`).join('')+`<span><i style="background:var(--accent)"></i>${esc(t('qhs.unset'))}</span>`}catch(e){console.error(e)}})}
/* the strength of the page(s) on screen, from the Quran «⋯» sheet */
function qhsOpen(){const ps=(typeof qVisPages==='function'?qVisPages():[S.quran.view||1]).filter(Boolean);
  openInfo(t('qhs.t'),`<div class="qhsw">${ps.map(p=>`<div class="qhsr"><b>${esc(t('q.pageS'))} ${p}</b><span>${[3,2,1,0].map(v=>`<button class="btn sm ${qhsGet(p)===v?'pri':'ghost'}" data-qp="${p}" data-qv="${v}">${v?`<i class="qhsk" data-hs="${v}"></i>`:''}${esc(t(v?'qhs.v'+v:'qhs.none'))}</button>`).join('')}</span></div>`).join('')}<p class="muted">${esc(t('qhs.sub'))}</p></div>`);
  $$('#infoBox [data-qp]').forEach(b=>b.onclick=()=>{qhsSet([+b.dataset.qp],+b.dataset.qv);qhsOpen();try{renderQMap()}catch(e){}})}

/* 10th-20: share the scanned page on screen as a picture (with a line naming the surah, page and mushaf) */
async function qpgShare(p){const r=S.quran.riwaya,R=RIWAYAT[r]||{};p=p||S.quran.view||1;let src=null;
  try{const d=await idbGet('qimg:'+r+':'+p);if(d)src=typeof d==='string'?d:URL.createObjectURL(d)}catch(e){}
  if(!src){const im=[...document.querySelectorAll('#spread .qimg img')].find(i=>(+i.dataset.p||+(i.closest('.qpage')||{}).dataset?.p)===p)||document.querySelector('#spread .qimg img');if(im)src=im.currentSrc||im.src}
  if(!src){toast(t('qps.none'));return}
  const img=new Image();img.crossOrigin='anonymous';try{await new Promise((ok,no)=>{img.onload=ok;img.onerror=no;img.src=src})}catch(e){toast(t('qps.none'));return}
  const W=Math.min(1400,img.naturalWidth||1000),H=Math.round(W*(img.naturalHeight/img.naturalWidth)),bar=Math.round(W*.07),c=document.createElement('canvas');c.width=W;c.height=H+bar;const x=c.getContext('2d');
  x.fillStyle='#fbf7ee';x.fillRect(0,0,W,H+bar);x.drawImage(img,0,0,W,H);x.fillStyle='#1f2a24';x.fillRect(0,H,W,bar);x.fillStyle='#f3e7c4';x.font=`500 ${Math.round(bar*.42)}px "IBM Plex Sans Arabic",Tahoma,sans-serif`;x.textAlign='center';x.textBaseline='middle';x.direction='rtl';
  x.fillText(`${qSurahAt(p).name} · ${t('q.pageS')} ${p} · ${riwName(r)}`,W/2,H+bar/2);
  let b=null;try{b=await new Promise(ok=>c.toBlob(ok,'image/jpeg',.9))}catch(e){}if(!b){toast(t('qps.none'));return}
  const name=`${qSurahAt(p).name}-${p}.jpg`;if(!ANDROID&&navigator.canShare&&navigator.share){const f=new File([b],name,{type:'image/jpeg'});if(navigator.canShare({files:[f]})){navigator.share({files:[f]}).catch(()=>saveBytes(name,'image/jpeg',b));return}}saveBytes(name,'image/jpeg',b)}
function qpgShareMenu(){const ps=(typeof qVisPages==='function'?qVisPages():[S.quran.view||1]).filter(Boolean);if(ps.length<2)return qpgShare(ps[0]);
  openInfo(t('qps.t'),`<div class="row" style="gap:8px;flex-wrap:wrap">${ps.map(p=>`<button class="btn" data-qsp="${p}">${esc(t('q.pageS'))} ${p}</button>`).join('')}</div>`);$$('#infoBox [data-qsp]').forEach(b=>b.onclick=()=>{$$('.modal.on').forEach(m=>m.classList.remove('on'));qpgShare(+b.dataset.qsp)})}

/* 10th-23: a guided hifz plan. S.quran.hplan = {from, dir: 1 forward | -1 backward, to, lines a day, days:[weekdays], pos:{p,l}, log:{date:lines}, at}
   15 lines a page; a finished page is added to the memorised pages; the far review comes from the app's own review suggestion */
const HPL_LINES=15;
function hplPos(){const H=S.quran.hplan;return H&&H.pos||{p:H?H.from:1,l:0}}
function hplLeft(){const H=S.quran.hplan;if(!H)return 0;const pos=hplPos(),pages=Math.max(0,(H.to-pos.p)*H.dir)+1;return pages*HPL_LINES-pos.l}
function hplToday(){const H=S.quran.hplan,pos=hplPos();const parts=[];let left=H.lines,p=pos.p,l=pos.l;while(left>0&&(H.to-p)*H.dir>=0){const take=Math.min(left,HPL_LINES-l);parts.push({p,a:l+1,b:l+take});left-=take;l+=take;if(l>=HPL_LINES){l=0;p+=H.dir}}return parts}
function hplFinish(){const H=S.quran.hplan;const per=H.lines*((H.days||[0,1,2,3,4,5,6]).length/7)||1;return dKey(addDays(keyToDate(todayKey()),Math.ceil(hplLeft()/per)))}
function hplNear(){const H=S.quran.hplan,pos=hplPos(),out=[];for(let i=1;i<=5;i++){const p=pos.p-H.dir*i;if((p-H.from)*H.dir>=0)out.push(p)}return out.reverse()}
function hplDone(){const H=S.quran.hplan,tk=todayKey();if((H.log||{})[tk]){toast(t('hpl.already'));return}const parts=hplToday();if(!parts.length)return;
  const M=new Set(S.quran.memorized);parts.forEach(x=>{if(x.b>=HPL_LINES)M.add(x.p)});const last=parts[parts.length-1];H.pos=last.b>=HPL_LINES?{p:last.p+H.dir,l:0}:{p:last.p,l:last.b};
  S.quran.memorized=[...M];(H.log=H.log||{})[tk]=H.lines;try{const q=qDay(tk);if(!q.hifz){q.hifz=true;q.hifzPages=[...new Set([...(q.hifzPages||[]),...parts.map(x=>x.p)])]}}catch(e){}
  save();try{renderQAll()}catch(e){}if((H.to-H.pos.p)*H.dir<0)toast(t('hpl.fin'));else toast(t('hpl.ok'))}
function hplForm(){const H=S.quran.hplan||{from:S.quran.view||1,dir:1,to:604,lines:7,days:[0,1,2,3,4,5,6]};
  openInfo(t('hpl.t'),`<div class="hplf"><p class="muted">${esc(t('hpl.sub'))}</p>
    <label>${esc(t('hpl.from'))}<input class="in" type="number" min="1" max="604" id="hplFrom" value="${H.from}"></label>
    <label>${esc(t('hpl.dir'))}<select class="in" id="hplDir"><option value="1" ${H.dir===1?'selected':''}>${esc(t('hpl.fwd'))}</option><option value="-1" ${H.dir===-1?'selected':''}>${esc(t('hpl.back'))}</option></select></label>
    <label>${esc(t('hpl.to'))}<input class="in" type="number" min="1" max="604" id="hplTo" value="${H.to}"></label>
    <label>${esc(t('hpl.lines'))}<select class="in" id="hplLines">${[3,5,7,10,15,20,30].map(n=>`<option value="${n}" ${H.lines===n?'selected':''}>${esc(t('hpl.ln',n))}</option>`).join('')}</select></label>
    <div><span class="muted">${esc(t('hpl.days'))}</span><div class="row hpld">${L().days.map((d,i)=>`<label class="chk"><input type="checkbox" data-hd="${i}" ${(H.days||[]).includes(i)?'checked':''}><span>${esc(d)}</span></label>`).join('')}</div></div>
    <div class="row" style="justify-content:flex-end"><button class="btn pri" id="hplSave">${esc(t('hpl.save'))}</button></div></div>`);
  $('#hplDir').onchange=e=>{if(+e.target.value===-1&&+$('#hplTo').value>=+$('#hplFrom').value)$('#hplTo').value=1;if(+e.target.value===1&&+$('#hplTo').value<=+$('#hplFrom').value)$('#hplTo').value=604};
  $('#hplSave').onclick=()=>{const from=Math.max(1,Math.min(604,+$('#hplFrom').value||1)),dir=+$('#hplDir').value,to=Math.max(1,Math.min(604,+$('#hplTo').value||(dir>0?604:1))),days=$$('#infoBox [data-hd]').filter(c=>c.checked).map(c=>+c.dataset.hd);
    if((to-from)*dir<0){toast(t('hpl.badRange'));return}const old=S.quran.hplan,keep=old&&old.from===from&&old.dir===dir;
    S.quran.hplan={from,dir,to,lines:+$('#hplLines').value,days:days.length?days:[0,1,2,3,4,5,6],pos:keep?old.pos:{p:from,l:0},log:keep?old.log||{}:{},at:keep?old.at:Date.now()};save();hplOpen()}}
function hplOpen(){const H=S.quran.hplan;if(!H)return hplForm();const parts=hplToday(),tk=todayKey(),done=!!(H.log||{})[tk],today=(H.days||[]).includes(keyToDate(tk).getDay());
  const total=(Math.abs(H.to-H.from)+1)*HPL_LINES,left=hplLeft(),pct=Math.round((total-left)/total*100),fin=hplFinish(),near=hplNear(),far=(typeof qReviewSuggest==='function'?qReviewSuggest():[]).filter(p=>!near.includes(p)).slice(0,5);
  const part=x=>x.a===1&&x.b===HPL_LINES?t('hpl.page',x.p):t('hpl.part',x.p,x.a,x.b);
  openInfo(t('hpl.t'),`<div class="hplw"><div class="hplbar"><i style="width:${pct}%"></i></div><p>${esc(t('hpl.prog',pct,gStr(keyToDate(fin))))}</p>
    ${parts.length?`<div class="hplt"><b>${esc(t(done?'hpl.doneT':today?'hpl.todayT':'hpl.restT'))}</b><div>${parts.map(x=>`<button class="btn sm ghost" data-hgo="${x.p}">${esc(part(x))}</button>`).join('')}</div>${done?'':`<button class="btn pri" id="hplDo">✓ ${esc(t('hpl.do'))}</button>`}</div>`:`<p>${esc(t('hpl.fin'))}</p>`}
    ${near.length?`<div class="hplt"><b>${esc(t('hpl.near'))}</b><div>${near.map(p=>`<button class="btn sm ghost" data-hgo="${p}">${esc(t('hpl.page',p))}</button>`).join('')}</div></div>`:''}
    ${far.length?`<div class="hplt"><b>${esc(t('hpl.far'))}</b><div>${far.map(p=>`<button class="btn sm ghost" data-hgo="${p}">${esc(t('hpl.page',p))}</button>`).join('')}</div></div>`:''}
    <div class="row hpla"><button class="btn sm ghost" id="hplEd">✎ ${esc(t('hpl.edit'))}</button><button class="btn sm ghost dng" id="hplStop">${esc(t('hpl.stop'))}</button></div></div>`);
  const b=$('#infoBox');if(b)b.classList.add('hplbox');
  $$('#infoBox [data-hgo]').forEach(x=>x.onclick=()=>{$$('.modal.on').forEach(m=>m.classList.remove('on'));showView('quran');qShow(+x.dataset.hgo)});
  const d=$('#hplDo');if(d)d.onclick=()=>{hplDone();hplOpen()};$('#hplEd').onclick=hplForm;$('#hplStop').onclick=()=>{if(!confirm(t('hpl.stopQ')))return;delete S.quran.hplan;save();$$('.modal.on').forEach(m=>m.classList.remove('on'))}}
{hookFn('openInfo',()=>openInfo,f=>{openInfo=f},'pre',function(){try{const b=$('#infoBox');if(b)b.classList.remove('hplbox')}catch(e){}})}
/* a Today chip while today's portion is not done */
{hookFn('renderTodayEv',()=>renderTodayEv,f=>{renderTodayEv=f},'post',function(){try{const H=S.quran.hplan,box=$('#todayEv');if(!H||!box||box.querySelector('[data-hplc]'))return;const tk=todayKey();if((H.log||{})[tk]||!(H.days||[]).includes(keyToDate(tk).getDay()))return;
  const p=hplToday()[0];if(!p)return;box.insertAdjacentHTML('beforeend',`<span class="evchip" data-hplc style="--c:#14b8a6"><i></i>🧠 ${esc(t('hpl.chip',p.p))}</span>`);box.querySelector('[data-hplc]').onclick=hplOpen}catch(e){}})}

/* 10th-25: the wird in minutes: S.quran.wirdU='min', S.quran.wirdM minutes; read from the day's sessions of the «quran» category */
const QWM=new WeakMap();
function qWirdMinOf(q){let k=QWM.get(q);if(!k){for(const x of Object.keys(S.days)){if(S.days[x].quran===q){k=x;QWM.set(q,k);break}}}if(!k)return 0;try{return Math.round(((rollBy(totals(k).by)||{}).quran||0)/6e4)}catch(e){return 0}}
function qWirdSub(q){return S.quran.wirdU==='min'?t('wm.sub',qWirdMinOf(q),+S.quran.wirdM||20):t('q.wirdSub',q.read,S.quran.wird)}
{hookFn('renderSettings',()=>renderSettings,f=>{renderSettings=f},'post',function(){try{const w=$('#qWirdIn');if(!w||$('#wmU'))return;const Q=S.quran,f=w.closest('.field')||w.parentElement;
  f.insertAdjacentHTML('afterend',`<div class="field" id="wmRow"><div><label data-i18n="wm.l">${esc(t('wm.l'))}</label><small>${esc(t('wm.s'))}</small></div><span class="row" style="gap:6px"><select class="in" id="wmU"><option value="p">${esc(t('wm.p'))}</option><option value="min" ${Q.wirdU==='min'?'selected':''}>${esc(t('wm.m'))}</option></select><input class="in num" type="number" min="5" max="600" step="5" id="wmM" value="${+Q.wirdM||20}" style="width:80px" ${Q.wirdU==='min'?'':'hidden'}></span></div>`);
  $('#wmU').onchange=e=>{Q.wirdU=e.target.value==='min'?'min':undefined;if(!Q.wirdU)delete Q.wirdU;$('#wmM').hidden=!Q.wirdU;save();try{renderQAll()}catch(x){}};
  $('#wmM').onchange=e=>{Q.wirdM=Math.max(5,Math.min(600,+e.target.value||20));save();try{renderQAll()}catch(x){}}}catch(e){console.error(e)}})}

/* the Quran «⋯» sheet: strength, share the page, the hifz plan */
{hookFn('qbLayout',()=>qbLayout,f=>{qbLayout=f},'post',function(){try{const tb=$('#qbTools .qbshb');if(!tb||$('#qhsTool'))return;
  tb.insertAdjacentHTML('beforeend',`<button class="btn sm ghost qbtool" id="hplTool" data-qbl="1">🧭<small>${esc(t('hpl.t'))}</small></button><button class="btn sm ghost qbtool" id="qhsTool" data-qbl="1">💪<small>${esc(t('qhs.t'))}</small></button><button class="btn sm ghost qbtool" id="qpsTool" data-qbl="1">📤<small>${esc(t('qps.t'))}</small></button>`);
  $('#hplTool').onclick=()=>setTimeout(hplOpen,20);$('#qhsTool').onclick=()=>setTimeout(qhsOpen,20);$('#qpsTool').onclick=()=>setTimeout(qpgShareMenu,20);qpsBtn()}catch(e){console.error(e)}})}
function qpsBtn(){const b=$('#qpsTool');if(b)b.hidden=(RIWAYAT[S.quran.riwaya]||{}).kind!=='img'}
{hookFn('renderQuran',()=>renderQuran,f=>{renderQuran=f},'post',function(){try{qpsBtn()}catch(e){}})}
{const _cc=cmdCommands;cmdCommands=function(...a){const L_=_cc(...a);try{L_.push({icon:'🧭',label:t('hpl.t'),run:hplOpen,kw:'hifz plan memorise خطة الحفظ'})}catch(e){}return L_}}

