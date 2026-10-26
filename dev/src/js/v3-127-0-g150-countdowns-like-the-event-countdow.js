/* ============ v3.127.0 (g150): countdowns, like the «Event Countdown» app he pointed to ============ */
/* S.cdn=[{id,n,d:'YYYY-MM-DD',tm:'HH:MM'|'',col,rep:'none'|'year'|'hyear',hm,hd,ev,pin,at}] (synced). A picture stays on this device
   (IDB cdnimg:<id>). Window cdnOpen (calendar tools «العدّ التنازلي», Ctrl+K, Today chips), live every second while it is open;
   a yearly one moves to its next date (Gregorian, or Hijri by hNum); a past one-off counts up («منذ»). Pinned ones show on Today. */
const CDN_COLS=['#f5c400','#ef4444','#ec4899','#8b5cf6','#3b82f6','#14b8a6','#22c55e','#f97316','#64748b'];
const CDN={tick:0,img:{}};
function CDNS(){return S.cdn||(S.cdn=[])}
try{if(Array.isArray(SY_SIMPLE)&&!SY_SIMPLE.includes('cdn'))SY_SIMPLE.push('cdn')}catch(e){}
function cdnAt(k,tm){const d=keyToDate(k);const [h,m]=(tm||'0:0').split(':').map(Number);d.setHours(h||0,m||0,0,0);return d.getTime()}
function cdnTarget(c){const now=Date.now();let k=c.d;
  if(c.rep==='year'){const [y,mo,da]=c.d.split('-').map(Number);let yy=new Date().getFullYear();for(let i=0;i<3;i++,yy++){k=yy+'-'+String(mo).padStart(2,'0')+'-'+String(da).padStart(2,'0');if(cdnAt(k,c.tm)>=now-864e5&&cdnAt(k,c.tm)>=now||(!c.tm&&k===todayKey()))break}}
  else if(c.rep==='hyear'&&c.hm){let d=keyToDate(todayKey());for(let i=0;i<400;i++){const h=hNum(d);if(h.m===c.hm&&h.d===c.hd&&(cdnAt(dKey(d),c.tm)>=now||(!c.tm&&dKey(d)===todayKey()))){k=dKey(d);break}d=addDays(d,1)}}
  return {k,ms:cdnAt(k,c.tm)}}
function cdnParts(ms){const s=Math.max(0,Math.floor(Math.abs(ms)/1000));return [Math.floor(s/86400),Math.floor(s%86400/3600),Math.floor(s%3600/60),s%60]}
function cdnDays(c){const T=cdnTarget(c);const a=keyToDate(todayKey()),b=keyToDate(T.k);return Math.round((b-a)/864e5)}
function cdnShort(c){const n=cdnDays(c);return n===0?t('cdn.today'):n>0?t('cdn.left',n):t('cdn.ago',-n)}
function cdnWhen(c){const T=cdnTarget(c),d=keyToDate(T.k);return gStr?gStr(d)+(c.tm?' · '+c.tm:'')+' · '+hStr(d):T.k}
function cdnCard(c){const T=cdnTarget(c),dif=T.ms-Date.now(),past=dif<0,p=cdnParts(dif),img=CDN.img[c.id];
  const box=(v,u)=>`<span class="cdnu"><b>${v}</b><small>${esc(t(u))}</small></span>`;
  return `<div class="cdnc${past?' past':''}" data-cdn="${c.id}" style="--cc:${c.col||CDN_COLS[0]}${img?`;--ci:url('${img}')`:''}"><div class="cdnct"><b dir="auto">${esc(c.n)}</b><small>${esc(cdnWhen(c))}${c.rep!=='none'?' · '+esc(t('cdn.r.'+c.rep)):''}</small></div>
    <div class="cdnnum" data-cdt="${c.id}">${past&&c.rep==='none'?`<span class="cdnago">${esc(t('cdn.since'))}</span>`:''}${box(p[0],'cdn.u.d')}${box(p[1],'cdn.u.h')}${box(p[2],'cdn.u.m')}${box(p[3],'cdn.u.s')}</div>
    <div class="cdnca"><button type="button" class="btn sm ghost" data-cdp="${c.id}">${esc(t(c.pin?'cdn.unpin':'cdn.pin'))}</button><button type="button" class="btn sm ghost" data-cde="${c.id}" aria-label="${esc(t('cdn.edit'))}">✎</button><button type="button" class="btn sm ghost" data-cdx="${c.id}" aria-label="${esc(t('cdn.del'))}">✕</button></div></div>`}
function cdnSorted(){return CDNS().slice().sort((a,b)=>{const x=cdnTarget(a).ms-Date.now(),y=cdnTarget(b).ms-Date.now();if((x<0)!==(y<0))return x<0?1:-1;return x<0?y-x:x-y})}
async function cdnLoadImgs(){for(const c of CDNS())if(CDN.img[c.id]===undefined){try{CDN.img[c.id]=(await idbGet('cdnimg:'+c.id))||''}catch(e){CDN.img[c.id]=''}}}
async function cdnOpen(){await cdnLoadImgs();const L_=cdnSorted();
  openInfo(t('cdn.t'),`<div class="cdnbar"><button type="button" class="btn pri" id="cdnAdd">＋ ${esc(t('cdn.add'))}</button></div>${L_.length?`<div class="cdng">${L_.map(cdnCard).join('')}</div>`:`<div class="empty">${esc(t('cdn.none'))}</div>`}`);
  const box=$('#infoBox');box.classList.add('cdnbox');$('#cdnAdd').onclick=()=>cdnForm(null);
  box.querySelectorAll('[data-cdp]').forEach(b=>b.onclick=()=>{const c=CDNS().find(x=>x.id===b.dataset.cdp);if(!c)return;c.pin=!c.pin;save();renderToday();cdnOpen()});
  box.querySelectorAll('[data-cde]').forEach(b=>b.onclick=()=>cdnForm(b.dataset.cde));
  box.querySelectorAll('[data-cdx]').forEach(b=>b.onclick=()=>{const i=CDNS().findIndex(x=>x.id===b.dataset.cdx);if(i<0)return;const [c]=S.cdn.splice(i,1);save();renderToday();cdnOpen();toastAct(t('cdn.deleted'),t('undo'),()=>{S.cdn.splice(i,0,c);save();renderToday();cdnOpen()})});
  clearInterval(CDN.tick);CDN.tick=setInterval(()=>{const b=$('#infoBox');if(!b||!b.classList.contains('cdnbox')||!b.closest('.modal.on')){clearInterval(CDN.tick);return}
    b.querySelectorAll('[data-cdt]').forEach(el=>{const c=CDNS().find(x=>x.id===el.dataset.cdt);if(!c)return;const p=cdnParts(cdnTarget(c).ms-Date.now());el.querySelectorAll('.cdnu b').forEach((x,i)=>{const v=String(p[i]);if(x.textContent!==v)x.textContent=v})})},1000)}
function cdnForm(id,pre){const c=id?CDNS().find(x=>x.id===id):Object.assign({n:'',d:dKey(addDays(keyToDate(todayKey()),7)),tm:'',col:CDN_COLS[0],rep:'none'},pre||{});if(!c)return;let col=c.col,file=null,dropImg=false;
  openInfo(t(id?'cdn.edit':'cdn.add'),`<div class="cdnf"><label>${esc(t('cdn.f.n'))}<input class="in" id="cdnN" maxlength="60" value="${esc(c.n)}" placeholder="${esc(t('cdn.f.nph'))}"></label>
    <div class="cdnf2"><label>${esc(t('cdn.f.d'))}<input class="in" type="date" id="cdnD" value="${c.d}"></label><label>${esc(t('cdn.f.tm'))}<input class="in" type="time" id="cdnTm" value="${c.tm||''}"></label></div>
    <label>${esc(t('cdn.f.rep'))}<select class="in" id="cdnRep"><option value="none">${esc(t('cdn.r.none'))}</option><option value="year">${esc(t('cdn.r.year'))}</option><option value="hyear">${esc(t('cdn.r.hyear'))}</option></select></label>
    <div><small>${esc(t('cdn.f.col'))}</small><div class="cdncols">${CDN_COLS.map(x=>`<button type="button" data-cdc="${x}" style="--c:${x}" class="${x===col?'on':''}" aria-label="${x}"></button>`).join('')}</div></div>
    <div class="cdnimgrow"><button type="button" class="btn ghost" id="cdnPic">${esc(t('cdn.f.pic'))}</button>${id&&CDN.img[id]?`<button type="button" class="btn ghost" id="cdnPicX">${esc(t('cdn.f.picX'))}</button>`:''}<small id="cdnPicN"></small></div>
    <div class="cdnfa"><button type="button" class="btn ghost" id="cdnBack">${esc(t('ev.cancel'))}</button><button type="button" class="btn pri" id="cdnSave">${esc(t('ev.save'))}</button></div></div>`);
  const box=$('#infoBox');box.classList.add('cdnbox');$('#cdnRep').value=c.rep||'none';
  box.querySelectorAll('[data-cdc]').forEach(b=>b.onclick=()=>{col=b.dataset.cdc;box.querySelectorAll('[data-cdc]').forEach(x=>x.classList.toggle('on',x===b))});
  $('#cdnPic').onclick=()=>{const f=document.createElement('input');f.type='file';f.accept='image/*';f.style.display='none';document.body.append(f);f.onchange=()=>{file=f.files[0]||null;dropImg=false;$('#cdnPicN').textContent=file?file.name:'';f.remove()};f.click()};
  if($('#cdnPicX'))$('#cdnPicX').onclick=()=>{dropImg=true;file=null;$('#cdnPicN').textContent=t('cdn.f.picGone')};
  $('#cdnBack').onclick=()=>cdnOpen();
  $('#cdnSave').onclick=async()=>{const n=$('#cdnN').value.trim(),d=$('#cdnD').value;if(!n||!/^\d{4}-\d\d-\d\d$/.test(d)){toast(t('cdn.f.need'));return}
    const o=id?c:{id:uid(),at:Date.now(),pin:true};Object.assign(o,{n,d,tm:$('#cdnTm').value||'',col,rep:$('#cdnRep').value});if(pre&&pre.ev)o.ev=pre.ev;
    if(o.rep==='hyear'){const h=hNum(keyToDate(d));o.hm=h.m;o.hd=h.d}else{delete o.hm;delete o.hd}
    if(!id)CDNS().push(o);
    try{if(file){const u=await shrinkImage(file,1000,.8);const s=typeof u==='string'?u:(u&&u.url)||'';if(s){await idbSet('cdnimg:'+o.id,s);CDN.img[o.id]=s}}else if(dropImg){await idbSet('cdnimg:'+o.id,'');CDN.img[o.id]=''}}catch(e){}
    save();renderToday();toast(t('cdn.saved'));cdnOpen()}}
/* Today: one chip per pinned countdown */
{hookFn('renderTodayEv',()=>renderTodayEv,f=>{renderTodayEv=f},'post',function(){try{const box=$('#todayEv');if(!box)return;box.querySelectorAll('[data-cdnc]').forEach(e=>e.remove());
  CDNS().filter(c=>c.pin).forEach(c=>{if(c.rep==='none'&&cdnDays(c)<-3)return;box.insertAdjacentHTML('beforeend',`<span class="evchip" data-cdnc="${c.id}" style="--c:${c.col||CDN_COLS[0]}"><i></i>⏳ ${esc(c.n)} · ${esc(cdnShort(c))}</span>`)});
  box.querySelectorAll('[data-cdnc]').forEach(e=>e.onclick=cdnOpen)}catch(e){}})}
/* calendar tools button and the event editor */
function cdnBtn(){const tb=$('#calTools3');if(!tb||$('#cdnBtn'))return;tb.insertAdjacentHTML('beforeend',`<button class="btn sm ghost" id="cdnBtn" title="${esc(t('cdn.t'))}">⏳ <span>${esc(t('cdn.b'))}</span></button>`);$('#cdnBtn').onclick=cdnOpen}
{hookFn('renderCal',()=>renderCal,f=>{renderCal=f},'post',function(){try{if(typeof CAL2!=='undefined'&&CAL2.busy)return;cdnBtn()}catch(e){}})}
{hookFn('renderEvEd',()=>renderEvEd,f=>{renderEvEd=f},'post',function(){try{const e=typeof EVE!=='undefined'&&EVE;if(!e||e._new||$('#cdnEvB'))return;const act=$('#evCopyB')||$('#evDel');if(!act)return;
  act.insertAdjacentHTML('beforebegin',`<button type="button" class="btn ghost" id="cdnEvB">⏳ ${esc(t('cdn.fromEv'))}</button>`);
  $('#cdnEvB').onclick=()=>{const ex=CDNS().find(x=>x.ev===e.id);$('#evModal').classList.remove('on');if(ex){cdnOpen();return}cdnForm(null,{n:e.title||'',d:e.date,tm:e.time||'',col:e.color||CDN_COLS[0],rep:e.rep==='yearly'?'year':e.rep==='hyearly'?'hyear':'none',ev:e.id})}}catch(x){}})}
{const _cc=cmdCommands;cmdCommands=function(...a){const L_=_cc(...a);try{L_.push({icon:'⏳',label:t('cdn.t'),run:cdnOpen,kw:'countdown timer event عد تنازلي العد التنازلي مناسبة'})}catch(e){}return L_}}

