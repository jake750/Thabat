/* ============ v3.84.0: the library on the phone — keep a whole course at once, download on Wi-Fi only, remove a lesson after watching it, sizes per course ============ */
/* Device options (this device only, never synced): localStorage['thabat.dkOpt'] = {wifi:1, auto:1}. Kept lessons now also record their course (c, cn). */
const DKQ={run:false,stop:false,ids:[],i:0,n:0,cn:'',wait:false};
function dkqOpt(){try{return JSON.parse(localStorage.getItem('thabat.dkOpt')||'{}')||{}}catch(e){return{}}}
function dkqOptSet(k,v){const o=dkqOpt();if(v)o[k]=1;else delete o[k];try{localStorage.setItem('thabat.dkOpt',JSON.stringify(o))}catch(e){}}
/* «cellular» only when the browser says so; a PC or a browser that does not tell counts as allowed */
function dkqCell(){const c=navigator.connection;return!!(c&&c.type==='cellular')}
function dkqBlocked(){return!!dkqOpt().wifi&&dkqCell()}
/* every download from the PC respects «Wi-Fi only» */
{const _f=dkFetch;dkFetch=async function(...a){if(dkqBlocked()){toast(t('dkq.cell'));return null}return _f(...a)}}
/* a kept lesson remembers its course, for the sizes per course */
{const _k=dkKeepLesson;dkKeepLesson=async function(id,...a){const it=libItem(id);const r=await _k(id,...a);try{const m=dkMeta();if(m[id]&&it&&it.course){m[id].c=it.course.id;m[id].cn=it.course.n;dkMetaSet(m)}}catch(e){}return r}}
function dkqCourseOf(id,x){if(x&&x.c)return{c:x.c,cn:x.cn||''};const it=LIB.tree&&libItem(id);if(it&&it.course)return{c:it.course.id,cn:it.course.n};return{c:'?',cn:''}}

/* item 11: keep a whole PC course on this device, one lesson after the other */
function dkqLeft(cid){const node=lupNode(cid);if(!node)return[];const m=dkMeta();return libMedia(node).filter(x=>(x.k==='v'||x.k==='a')&&!m[x.id])}
async function dkqCourse(cid){if(DKQ.run||DK.job){toast(t('dk.busy'));return}const node=lupNode(cid);if(!node)return;const left=dkqLeft(cid);if(!left.length){toast(t('dkq.all'));return}
  if(!LIB.base){toast(t('lb.off'));return}if(dkqBlocked()){toast(t('dkq.cell'));return}
  const need=left.reduce((s,x)=>s+(x.s||0),0);try{const e=await navigator.storage.estimate();if(need&&e&&e.quota&&e.quota-e.usage<need*1.05){toast(t('dk.space',dkMB(need),dkMB(e.quota-e.usage)));return}}catch(e){}
  Object.assign(DKQ,{run:true,stop:false,wait:false,ids:left.map(x=>x.id),i:0,n:left.length,cn:libTitle(node.n),cid});
  let ok=0;try{for(;DKQ.i<DKQ.ids.length;DKQ.i++){if(DKQ.stop)break;if(dkqBlocked()){DKQ.wait=true;toast(t('dkq.paused'));break}
      const id=DKQ.ids[DKQ.i],it=libItem(id);if(!it||dkMeta()[id]){continue}
      const b=await dkqOne(id,it);if(!b){if(!DKQ.stop&&!dkqBlocked())toast(t('dkq.stopped',ok,DKQ.n));break}ok++}}
  finally{const done=DKQ.i>=DKQ.ids.length;DKQ.run=false;if(done){toast(t('dkq.done',DKQ.cn,ok));DKQ.wait=false}try{renderLib()}catch(e){}}}
async function dkqOne(id,it){const name=`(${DKQ.i+1}/${DKQ.n}) ${libTitle(it.n)}`;const b=await dkFetch(libU('/f?id='+encodeURIComponent(id)),name,it.s);if(!b)return null;
  try{await idbSet('lkeep:'+id,b)}catch(e){toast(t('dk.space',dkMB(b.size),'?'));return null}
  const m=dkMeta();m[id]={n:it.n,s:b.size,at:Date.now(),k:it.k,c:it.course&&it.course.id,cn:it.course&&it.course.n};dkMetaSet(m);
  try{const btn=$('#dkBtn span');if(btn)btn.textContent=Object.keys(m).length}catch(e){}return b}
/* the pill's «cancel» also stops the rest of the course */
document.addEventListener('click',e=>{if(DKQ.run&&e.target.closest&&e.target.closest('#dkX'))DKQ.stop=true},true);
/* paused because the phone left Wi-Fi: carry on once it is back on Wi-Fi */
try{navigator.connection&&navigator.connection.addEventListener('change',()=>{if(DKQ.wait&&!DKQ.run&&!dkqCell()&&DKQ.cid){const left=dkqLeft(DKQ.cid);if(left.length){toast(t('dkq.resume'));dkqCourse(DKQ.cid)}}})}catch(e){}
/* the PC course «⋯» gets «keep the whole course on this device» (or «the rest», or «remove it from this device») */
{const _lm=lshMenu;lshMenu=function(anchor,html,...a){const p=_lm(anchor,html,...a);try{if(anchor&&anchor.id==='lshPcM'&&p&&!p.querySelector('[data-dkq]')&&LIB.open&&dkHere()&&lupNode(LIB.open)){const cid=LIB.open,left=dkqLeft(cid),all=libMedia(lupNode(cid)).filter(x=>x.k==='v'||x.k==='a'),kept=all.length-left.length,sz=left.reduce((s,x)=>s+(x.s||0),0);
    p.insertAdjacentHTML('beforeend',`<div class="aymh"></div>`+(left.length?`<button data-dkq="keep">⬇ ${esc(t(kept?'dkq.keepRest':'dkq.keep',left.length))}${sz?' · '+dkMB(sz):''}</button>`:'')+(kept?`<button data-dkq="drop">📱 ${esc(t('dkq.drop',kept))}</button>`:''));
    p.querySelectorAll('[data-dkq]').forEach(b=>b.onclick=()=>{closePP();if(b.dataset.dkq==='keep')dkqCourse(cid);else dkqDropCourse(cid)})}}catch(e){console.error(e)}return p}}
async function dkqDropCourse(c){const m=dkMeta(),ids=Object.keys(m).filter(id=>dkqCourseOf(id,m[id]).c===c);if(!ids.length)return;const sz=ids.reduce((s,id)=>s+(m[id].s||0),0);
  if(!confirm(t('dkq.dropQ',ids.length,dkMB(sz))))return;for(const id of ids){await idbSet('lkeep:'+id,null)}const m2=dkMeta();ids.forEach(id=>delete m2[id]);dkMetaSet(m2);toast(t('dkq.dropped',ids.length,dkMB(sz)));try{renderLib()}catch(e){}}

/* item 13 (an option): a kept lesson leaves this device once it is marked watched (it stays on the PC) */
async function dkqAutoDrop(){if(!dkqOpt().auto)return;const m=dkMeta(),P=LIBS().prog,cur=LIB.cur&&LIB.cur.id;const ids=Object.keys(m).filter(id=>P[id]&&P[id].done&&id!==cur);if(!ids.length)return;
  for(const id of ids)await idbSet('lkeep:'+id,null);const m2=dkMeta();ids.forEach(id=>delete m2[id]);dkMetaSet(m2);toast(t('dkq.autoDone',ids.length));try{renderLib()}catch(e){}}
{const _s=libSave;libSave=function(...a){const r=_s(...a);try{if(dkqOpt().auto)setTimeout(()=>dkqAutoDrop().catch(()=>{}),800)}catch(e){}return r}}
/* the player closing is when the lesson that just ended can go */
{hookFn('renderLib',()=>renderLib,f=>{renderLib=f},'post',function(){try{if(dkqOpt().auto&&!LIB.cur)dkqAutoDrop().catch(()=>{})}catch(e){}})}

/* item 14: «on this device» — lessons grouped by course with each course's size and «remove this course», and the two device options */
{const _o=dkOpen;dkOpen=async function(...a){await _o(...a);try{const box=$('#infoBox .dkbox');if(!box)return;const m=dkMeta(),ent=Object.entries(m);const o=dkqOpt();
  box.querySelector('.dkst').insertAdjacentHTML('afterend',`<div class="dkqopt"><label class="dkqo"><span><b>${esc(t('dkq.wifiT'))}</b><small>${esc(t('dkq.wifiS'))}</small></span><button class="sw-toggle ${o.wifi?'on':''}" data-dko="wifi" role="switch" aria-checked="${!!o.wifi}"></button></label><label class="dkqo"><span><b>${esc(t('dkq.autoT'))}</b><small>${esc(t('dkq.autoS'))}</small></span><button class="sw-toggle ${o.auto?'on':''}" data-dko="auto" role="switch" aria-checked="${!!o.auto}"></button></label></div>`);
  box.querySelectorAll('[data-dko]').forEach(b=>b.onclick=e=>{e.preventDefault();const k=b.dataset.dko,v=!dkqOpt()[k];dkqOptSet(k,v);b.classList.toggle('on',v);b.setAttribute('aria-checked',v);if(k==='auto'&&v)dkqAutoDrop().then(()=>{if($('#infoBox .dkbox'))dkOpen()}).catch(()=>{})});
  if(!ent.length)return;const G=new Map();ent.forEach(([id,x])=>{const{c,cn}=dkqCourseOf(id,x);if(!G.has(c))G.set(c,{cn,ids:[],s:0});const g=G.get(c);g.ids.push([id,x]);g.s+=x.s||0;if(!g.cn&&cn)g.cn=cn});
  const h4=[...box.querySelectorAll('h4')].find(h=>h.textContent.includes(t('dk.lessons')));if(!h4)return;
  let el=h4.nextElementSibling;while(el&&el.classList.contains('dkrow')){const nx=el.nextElementSibling;el.remove();el=nx}
  const groups=[...G.entries()].sort((a,b)=>b[1].s-a[1].s);
  h4.insertAdjacentHTML('afterend',groups.map(([c,g])=>`<details class="dkqg"${groups.length===1?' open':''}><summary><span dir="auto">${esc(g.cn?libTitle(g.cn):t('dkq.other'))}</span><small>${g.ids.length} · ${dkMB(g.s)}</small><button class="btn sm ghost" data-dkqc="${esc(c)}">${esc(t('dkq.dropC'))}</button></summary>`+
    g.ids.sort((a,b)=>b[1].at-a[1].at).map(([id,x])=>`<div class="dkrow"><span dir="auto">${esc(libTitle(x.n))}</span><small>${x.s?dkMB(x.s):''}</small><button class="btn sm ghost" data-dkx="l:${esc(id)}" aria-label="${esc(t('dk.drop'))}">✕</button></div>`).join('')+`</details>`).join(''));
  box.querySelectorAll('[data-dkqc]').forEach(b=>b.onclick=async e=>{e.preventDefault();e.stopPropagation();await dkqDropCourse(b.dataset.dkqc);dkOpen()})}catch(e){console.error(e)}}}
