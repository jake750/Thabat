/* ============ v3.86.0: library group, part 2 — a «want to read» list, each recording resumes where it stopped and keeps its own speed ============ */
/* item 120: S.lib.bkWant = {bookKey: time} for books you have; S.lib.bkWantT = [{id,n,a,at}] for titles you do not have yet (both synced with S.lib) */
function bkwMap(){const L_=LIBS();return L_.bkWant||(L_.bkWant={})}
function bkwTitles(){const L_=LIBS();return L_.bkWantT||(L_.bkWantT=[])}
function bkwToggle(key){const W=bkwMap();if(W[key])delete W[key];else W[key]=Date.now();save();toast(t(W[key]?'bkw.on':'bkw.off'));renderLib()}
function bkwBooks(){const W=bkwMap(),st=BKS(),H=bkHid();return bkAll().filter(b=>W[b.key]&&!(st[b.key]||{}).done&&!H[b.key]).sort((a,b)=>W[b.key]-W[a.key])}
{const _m=bkMenu;bkMenu=function(anchor,key,...a){const r=_m(anchor,key,...a);try{const pp=$('#ppPop');if(pp&&!pp.querySelector('[data-bkw]')&&!(BKS()[key]||{}).done){const on=!!bkwMap()[key];
  pp.insertAdjacentHTML('beforeend',`<button data-bkw="1">${on?'📌 '+esc(t('bkw.remove')):'📌 '+esc(t('bkw.add'))}</button>`);pp.querySelector('[data-bkw]').onclick=()=>{closePP();bkwToggle(key)}}}catch(e){}return r}}
{const _h=bkShelfHTML;bkShelfHTML=function(...a){let h=_h(...a);try{const n=bkwBooks().length+bkwTitles().length,i=h.indexOf('<div class="bk2fs">');if(i<0)return h;const j=h.indexOf('</div>',i);
  const chip=`<button class="bk2f${BK2.filter==='want'?' on':''}" data-bkf="want">📌 ${esc(t('bkw.f',n?'('+n+')':''))}</button>`;h=h.slice(0,j)+chip+h.slice(j);
  if(BK2.filter!=='want')return h;const k=h.indexOf('</div>',i)+6,B=bkwBooks(),T=bkwTitles();
  return h.slice(0,k)+`<div class="bkwadd"><input class="in" id="bkwN" dir="auto" placeholder="${esc(t('bkw.ph'))}" aria-label="${esc(t('bkw.ph'))}"><input class="in" id="bkwA" dir="auto" placeholder="${esc(t('bkw.au'))}" aria-label="${esc(t('bkw.au'))}"><button class="btn sm pri" id="bkwGo">${esc(t('bkw.addT'))}</button></div>`+
    (B.length?`<div class="bkgrid">${B.map(b=>bkCard(b)).join('')}</div>`:'')+
    (T.length?`<div class="bkwl">${T.map(x=>`<div class="bkwr" data-bkwt="${esc(x.id)}"><span class="bkwi">📕</span><span><b dir="auto">${esc(x.n)}</b>${x.a?`<small dir="auto">${esc(x.a)}</small>`:''}</span><button class="btn sm ghost" data-bkwx="${esc(x.id)}" aria-label="${esc(t('bkw.del'))}" title="${esc(t('bkw.del'))}">✕</button></div>`).join('')}</div>`:'')+
    (!B.length&&!T.length?`<p class="muted lshhint">${esc(t('bkw.none'))}</p>`:'')}catch(e){console.error(e)}return h}}
{const _b=bkBind;bkBind=function(root,...a){const r=_b(root,...a);try{if(!root)return r;const go=root.querySelector('#bkwGo');
  if(go){const add=()=>{const n=$('#bkwN').value.trim();if(!n){$('#bkwN').focus();return}bkwTitles().unshift({id:uid(),n:n.slice(0,160),a:$('#bkwA').value.trim().slice(0,120),at:Date.now()});save();renderLib()};go.onclick=add;[$('#bkwN'),$('#bkwA')].forEach(x=>x&&(x.onkeydown=e=>{if(e.key==='Enter')add()}))}
  root.querySelectorAll('[data-bkwx]').forEach(b=>b.onclick=()=>{const T=bkwTitles(),i=T.findIndex(x=>x.id===b.dataset.bkwx);if(i<0)return;const it=T.splice(i,1)[0];save();renderLib();toastAct(t('bkw.deleted'),t('undo'),()=>{bkwTitles().splice(i,0,it);save();renderLib()})});
  const W=bkwMap();root.querySelectorAll('[data-book]').forEach(c=>{const on=!!W[c.dataset.book];let m=c.querySelector('.bkwm');if(on&&!m){c.insertAdjacentHTML('beforeend',`<span class="bkwm" title="${esc(t('bkw.f',''))}">📌</span>`)}else if(!on&&m)m.remove()})}catch(e){console.error(e)}return r}}
/* a book finished leaves the list */
{const _d=bkSetDone;bkSetDone=function(key,done,...a){const r=_d(key,done,...a);try{if(done&&bkwMap()[key]){delete bkwMap()[key];save()}}catch(e){}return r}}

/* items 122 and 123: each recording remembers where it stopped (r.pos, seconds) and its own speed (r.rate) */
const RCM={lock:0,last:0};
function rcmRec(){return RCL().find(x=>x.id===RCX.cur)}
{const _p=rcPlay;rcPlay=async function(id,...a){const el=rcAudio(),same=RCX.cur===id&&el.src;if(same)return _p(id,...a);
  RCM.lock=Date.now()+15000;const r0=RCL().find(x=>x.id===id);if(r0){RCX.rate=r0.rate||1}
  const res=await _p(id,...a);try{const r=RCL().find(x=>x.id===id);if(!r||RCX.cur!==id)return res;const go=()=>{try{const d=isFinite(el.duration)?el.duration:(r.dur||0);
      if(r.pos>2&&(!d||r.pos<d-Math.min(5,d*.1))){el.currentTime=r.pos;toast(t('rcm.resumed',fmtTC(r.pos)))}el.playbackRate=r.rate||RCX.rate||1;RCM.lock=Date.now()+600;RCM.last=Date.now();try{rcUI()}catch(e){}}catch(e){}};
    if(el.readyState>=1)go();else el.addEventListener('loadedmetadata',go,{once:true})}catch(e){}return res}}
{const a=rcAudio();a.addEventListener('timeupdate',()=>{const r=rcmRec();if(!r||Date.now()<RCM.lock||Date.now()-RCM.last<10000)return;RCM.last=Date.now();const p=Math.floor(a.currentTime||0);if(p!==r.pos){r.pos=p;save()}});
  a.addEventListener('pause',()=>{const r=rcmRec();if(!r||Date.now()<RCM.lock)return;const p=Math.floor(a.currentTime||0);if(p&&p!==r.pos){r.pos=p;save()}});
  a.addEventListener('ended',()=>{const r=rcmRec();if(r&&r.pos){delete r.pos;save()}});
  a.addEventListener('ratechange',()=>{if(Date.now()<RCM.lock)return;const r=rcmRec();if(!r)return;const v=Math.round(a.playbackRate*100)/100;if(v===1){if(r.rate){delete r.rate;save()}}else if(r.rate!==v){r.rate=v;save()}})}
