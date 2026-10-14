/* ============ v3.15: books — a PDF reader in the library (pdf.js 3.11 beside the app), books from the PC and books kept on this device ============ */
/* pdf.js is loaded only when a book opens. The worker script is loaded first, so pdf.js runs it on the page itself (workers do not start from file://).
   Device books: list in localStorage 'thabat.books' [{id,n,s,at}], bytes in IndexedDB 'book:<id>'. Reading state (synced): S.lib.bk[key] = {t,pg,n,at,bm:[],hl:{pg:[[x,y,w,h]]},nt:{pg:text}} */
let BK_LIB=null;const BK={key:null,doc:null,title:'',pages:[],scale:1,zoom:1,hl:false,night:false,io:null,cur:1,read:0,lastAct:0,tick:null,rendered:new Set()};
function bkLoadLib(){if(BK_LIB)return BK_LIB;const add=src=>new Promise((ok,no)=>{const s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=()=>no(new Error(src));document.head.append(s)});
  BK_LIB=add('pdfjs/pdf.worker.js').then(()=>add('pdfjs/pdf.js')).then(()=>{const L=window.pdfjsLib||window['pdfjs-dist/build/pdf'];if(!L)throw new Error('pdfjs');L.GlobalWorkerOptions.workerSrc='pdfjs/pdf.worker.js';return L}).catch(e=>{BK_LIB=null;throw e});return BK_LIB}
function BKS(){const L_=LIBS();L_.bk=L_.bk||{};return L_.bk}
function bkLocal(){try{return JSON.parse(localStorage.getItem('thabat.books')||'[]')}catch(e){return[]}}
function bkLocalSave(a){try{localStorage.setItem('thabat.books',JSON.stringify(a))}catch(e){}}
function bkHash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return(h>>>0).toString(36)}
function bkPcBooks(){const out=[];const walk=(n,path)=>(n.c||[]).forEach(k=>{if(k.k==='d')walk(k,path.concat(k.n));else if(k.k==='f'&&/\.pdf$/i.test(k.n))out.push({key:'p:'+k.id,id:k.id,n:k.n.replace(/\.pdf$/i,''),s:k.s,ch:path.join(' › ')})});(LIB.tree||[]).forEach(r=>walk(r,[]));return out}
function bkAll(){return[...bkLocal().map(b=>({key:'l:'+b.id,id:b.id,n:b.n,s:b.s,local:1})),...bkPcBooks()]}
var bkPct;
/* adding a book from this device */
function bkAdd(){const i=document.createElement('input');i.type='file';i.accept='application/pdf,.pdf';i.onchange=async()=>{const f=i.files[0];if(!f)return;if(!/\.pdf$/i.test(f.name)&&f.type!=='application/pdf'){toast(t('bk.notPdf'));return}
  try{const buf=await f.arrayBuffer(),id=bkHash(f.name+'|'+f.size),list=bkLocal();await idbSet('book:'+id,buf);if(!list.some(b=>b.id===id)){list.unshift({id,n:f.name.replace(/\.pdf$/i,''),s:f.size,at:Date.now()});bkLocalSave(list)}toast(t('bk.added'));renderLib()}catch(e){toast(t('bk.addFail'))}};i.click()}
async function bkKeep(b){toast(t('lb.dling'));try{const r=await libFetch(libU('/f?id='+b.id),300000);const buf=await r.arrayBuffer(),id=bkHash(b.n+'.pdf|'+b.s),list=bkLocal();await idbSet('book:'+id,buf);if(!list.some(x=>x.id===id)){list.unshift({id,n:b.n,s:b.s,at:Date.now(),from:b.key});bkLocalSave(list)}
  const st=BKS();if(st[b.key]&&!st['l:'+id])st['l:'+id]=JSON.parse(JSON.stringify(st[b.key]));save();toast(t('bk.kept'));renderLib()}catch(e){toast(t('lb.dlFail'))}}
var bkRemove;
/* the reader */
var bkOpen;
async function bkBuild(ov,startPg){const doc=BK.doc,p1=await doc.getPage(1),vp=p1.getViewport({scale:1}),ratio=vp.height/vp.width;BK.ratio=ratio;
  ov.innerHTML=`<div class="bkbar"><button class="lbx" id="bkX" aria-label="✕">✕</button><span class="bkt"><b dir="auto">${esc(BK.title)}</b><small id="bkPg"></small></span>
    <button class="bkb" id="bkZo" aria-label="−">−</button><button class="bkb" id="bkZi" aria-label="+">+</button><button class="bkb${BK.night?' on':''}" id="bkNi" title="${esc(bkNiNext())}">${bkNiIcon()}</button><button class="bkb" id="bkHl" title="${esc(t('bk.hl'))}">🖍</button><button class="bkb" id="bkBm" title="${esc(t('bk.bm'))}">🔖</button><button class="bkb" id="bkNt" title="${esc(t('bk.note'))}">📝</button><button class="bkb" id="bkLs" title="${esc(t('bk.list'))}">☰</button></div>
    <div class="bkv${BK.night?' '+BK.night:''}" id="bkV"><div class="bkps" id="bkPs">${Array.from({length:doc.numPages},(_,i)=>`<div class="bkp" data-p="${i+1}"><canvas></canvas><div class="bkhl"></div><span class="bkpn">${i+1}</span></div>`).join('')}</div></div>
    <div class="bkpanel" id="bkPanel" hidden></div>`;
  BK.pages=[...ov.querySelectorAll('.bkp')];bkLayout();
  const v=$('#bkV');BK.io&&BK.io.disconnect();BK.io=new IntersectionObserver(es=>es.forEach(e=>{const p=+e.target.dataset.p;if(e.isIntersecting)bkRender(p);else bkFree(p)}),{root:v,rootMargin:'1200px 0px'});BK.pages.forEach(p=>BK.io.observe(p));
  BK.pages.forEach(p=>bkDrawHl(+p.dataset.p));
  let tm=null;v.addEventListener('scroll',()=>{BK.lastAct=Date.now();clearTimeout(tm);tm=setTimeout(bkTrack,120)},{passive:true});
  const go=()=>{const el=BK.pages[Math.max(0,Math.min(BK.pages.length,startPg)-1)];if(el)v.scrollTop=el.offsetTop-8;bkTrack()};requestAnimationFrame(go);setTimeout(go,60);
  $('#bkX').onclick=bkClose;$('#bkZi').onclick=()=>bkZoom(1.2);$('#bkZo').onclick=()=>bkZoom(1/1.2);
  /* reading light: normal → night (dark page, light text) → warm (sepia) */
  /* 3.25.1: the same light cycle as the mushaf: day → paper → night; the button shows the next one */
  $('#bkNi').onclick=()=>{const order=['','sepia','night'];BK.night=order[(order.indexOf(BK.night)+1)%3];LIBS().bkNight=BK.night;save();v.classList.remove('night','sepia');if(BK.night)v.classList.add(BK.night);const b=$('#bkNi');b.classList.toggle('on',!!BK.night);b.textContent=bkNiIcon();b.title=bkNiNext();toast(t(BK.night==='night'?'sp.dark':BK.night==='sepia'?'sp.sepia':'sp.light'))};
  $('#bkHl').onclick=()=>{BK.hl=!BK.hl;$('#bkHl').classList.toggle('on',BK.hl);v.classList.toggle('hlmode',BK.hl);if(BK.hl)toast(t('bk.hlTip'))};
  $('#bkBm').onclick=()=>{const r=BKS()[BK.key],i=r.bm.indexOf(BK.cur);if(i<0)r.bm.push(BK.cur);else r.bm.splice(i,1);r.bm.sort((a,b)=>a-b);save();bkTrack();toast(i<0?t('bk.bmAdded',BK.cur):t('bk.bmRemoved'))};
  $('#bkNt').onclick=()=>{const r=BKS()[BK.key],cur=r.nt[BK.cur]||'',v2=prompt(t('bk.notePh',BK.cur),cur);if(v2==null)return;if(v2.trim())r.nt[BK.cur]=v2.trim();else delete r.nt[BK.cur];save();bkTrack()};
  $('#bkLs').onclick=bkPanel;bkHlBind(v)}
var bkLayout;
var bkZoom;
var bkRender;
var bkFree;
var bkTrack;
/* highlights: drag a box over the lines; tap a highlight in highlight mode to remove it */
function bkDrawHl(n){const el=BK.pages[n-1],r=BKS()[BK.key];if(!el||!r)return;const box=el.querySelector('.bkhl');box.innerHTML=(r.hl[n]||[]).map((h,i)=>`<i data-i="${i}" style="left:${h[0]*100}%;top:${h[1]*100}%;width:${h[2]*100}%;height:${h[3]*100}%"></i>`).join('')}
function bkHlBind(v){let d=null;
  v.addEventListener('pointerdown',e=>{if(!BK.hl)return;const pe=e.target.closest('.bkp');if(!pe)return;const hi=e.target.closest('.bkhl i');if(hi){const n=+pe.dataset.p,r=BKS()[BK.key];r.hl[n].splice(+hi.dataset.i,1);if(!r.hl[n].length)delete r.hl[n];save();bkDrawHl(n);return}
    const rc=pe.getBoundingClientRect();d={pe,rc,x0:(e.clientX-rc.left)/rc.width,y0:(e.clientY-rc.top)/rc.height,el:document.createElement('i')};d.el.className='draft';pe.querySelector('.bkhl').append(d.el);pe.setPointerCapture&&pe.setPointerCapture(e.pointerId);e.preventDefault()});
  v.addEventListener('pointermove',e=>{if(!d)return;const x=(e.clientX-d.rc.left)/d.rc.width,y=(e.clientY-d.rc.top)/d.rc.height,a=Math.min(d.x0,x),b=Math.min(d.y0,y);Object.assign(d.el.style,{left:a*100+'%',top:b*100+'%',width:Math.abs(x-d.x0)*100+'%',height:Math.max(.012,Math.abs(y-d.y0))*100+'%'});d.box=[a,b,Math.abs(x-d.x0),Math.max(.012,Math.abs(y-d.y0))]});
  const end=()=>{if(!d)return;const n=+d.pe.dataset.p,r=BKS()[BK.key];if(d.box&&d.box[2]>.01){(r.hl[n]=r.hl[n]||[]).push(d.box.map(z=>Math.round(z*1000)/1000));save()}d.el.remove();bkDrawHl(n);d=null};
  v.addEventListener('pointerup',end);v.addEventListener('pointercancel',end)}
/* bookmarks, notes and highlights of this book; go to a page */
function bkPanel(){const p=$('#bkPanel');if(!p.hidden){p.hidden=true;return}const r=BKS()[BK.key],pages=[...new Set([...r.bm,...Object.keys(r.nt).map(Number),...Object.keys(r.hl).map(Number)])].sort((a,b)=>a-b);
  p.innerHTML=`<div class="bkph"><b>${t('bk.list')}</b><button class="btn sm ghost" id="bkPx">✕</button></div><div class="bkgo"><input class="in" id="bkGoIn" type="number" min="1" max="${BK.pages.length}" placeholder="${esc(t('bk.goto'))}"><button class="btn sm pri" id="bkGo">${t('bk.go')}</button></div>
    ${pages.length?pages.map(n=>`<button class="bkpi" data-go="${n}"><b>${t('q.pageS')}${n}</b>${r.bm.includes(n)?' 🔖':''}${r.hl[n]?' 🖍'+r.hl[n].length:''}${r.nt[n]?`<small dir="auto">${esc(r.nt[n])}</small>`:''}</button>`).join(''):`<p class="muted" style="padding:8px">${t('bk.none')}</p>`}`;p.hidden=false;
  $('#bkPx').onclick=()=>p.hidden=true;const go=n=>{const el=BK.pages[n-1];if(el){$('#bkV').scrollTop=el.offsetTop-8;p.hidden=true}};
  $('#bkGo').onclick=()=>go(+$('#bkGoIn').value||1);$('#bkGoIn').onkeydown=e=>{if(e.key==='Enter')go(+e.target.value||1)};p.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>go(+b.dataset.go))}
/* reading time: counted while the book is open, the app is in front and you scrolled within the last two minutes; logged like watch time */
function bkTick(){if(!BK.doc||document.hidden)return;if(Date.now()-BK.lastAct<12e4)BK.read+=15}
function bkLog(){const sec=BK.read;BK.read=0;if(!BK.key||sec<60)return;const d=day(todayKey()),mins=Math.round(sec/60),ex=d.media.find(m=>m.lib==='bk:'+BK.key);
  if(ex){ex.minutes+=mins;ex.at=Date.now()}else d.media.push({id:uid(),type:'book',how:'read',title:BK.title,minutes:mins,at:Date.now(),counted:false,url:'',from:null,to:null,lib:'bk:'+BK.key});save();try{renderMedia()}catch(e){}}
function bkClose(){bkTrack();bkLog();clearInterval(BK.tick);BK.io&&BK.io.disconnect();if(BK.doc){try{BK.doc.destroy()}catch(e){}}Object.assign(BK,{doc:null,key:null,pages:[],rendered:new Set()});const ov=$('#bkReader');if(ov){ov.classList.remove('on');ov.innerHTML=''}document.documentElement.classList.remove('bkr-on');save();if(curView()==='lib')renderLib()}
addEventListener('resize',()=>{if(BK.doc){BK.rendered.forEach(p=>bkFree(p,true));bkLayout();bkTrack();const v=$('#bkV'),el=BK.pages[BK.cur-1];if(v&&el)v.scrollTop=el.offsetTop-8;BK.pages.forEach(p=>{const r=p.getBoundingClientRect();if(r.bottom>-1200&&r.top<innerHeight+1200)bkRender(+p.dataset.p)})}});
document.addEventListener('keydown',e=>{if(!BK.doc||/INPUT|TEXTAREA/.test(e.target.tagName))return;const v=$('#bkV');if(e.key==='Escape'){e.preventDefault();bkClose()}else if(e.key==='PageDown'||e.key===' '){e.preventDefault();v.scrollTop+=v.clientHeight*.9}else if(e.key==='PageUp'){e.preventDefault();v.scrollTop-=v.clientHeight*.9}},true);
addEventListener('pagehide',()=>{if(BK.doc){bkTrack();bkLog()}});
/* Android back closes the reader and the video player */
{const _tb=window.thabatBack;window.thabatBack=function(){if($('#bkReader.on')){if(!$('#bkPanel').hidden){$('#bkPanel').hidden=true;return true}bkClose();return true}if($('#libPlayer.on')){libClose();return true}return _tb?_tb():false}}
/* the library home: a «books» shelf; PDF files on a course page get «read» */
var bkShelfHTML;
var bkBind;
{const _top=lshTop;lshTop=function(){const h=_top(),i=h.indexOf('<div class="lshh"><h4 class="lbfh">💻');const books=bkShelfHTML();return i<0?h+books:h.slice(0,i)+books+h.slice(i)}}
{const _bb=lshBindBody;lshBindBody=function(b){_bb(b);try{bkBind(b)}catch(e){console.error(e)}}}
/* «read» on PDF files: the PC course page and the search results */
{const _rl=renderLib;renderLib=function(){_rl();try{$$('#libBox .lbf').forEach(row=>{const nm=(row.querySelector('span')||{}).firstChild;const name=nm&&nm.textContent||'';if(!/\.pdf$/i.test(name)||row.querySelector('[data-rd]'))return;const b=bkPcBooks().find(x=>x.n+'.pdf'===name||x.n===name.replace(/\.pdf$/i,''));if(!b)return;row.insertAdjacentHTML('beforeend',`<button class="btn sm pri" data-rd="${esc(b.key)}">📖 ${t('bk.read')}</button>`);row.querySelector('[data-rd]').onclick=()=>bkOpen(b)})}catch(e){console.error(e)}}}

