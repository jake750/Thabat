/* ============ v3.168.0 thirteenth list K: PC and data ============ */
const K14={own:false,dzT:0,wl:'',wsT:0,mb:0};
function k14Pc(){return !ANDROID&&!MOB.matches}
function k14Win(){return !ANDROID&&!MAC}

/* 236: the window remembers where it was and how big (Thabat.bat opens it there through the helper; the page itself also moves back, on Mac too) */
function k14AppWin(){try{return !window.locationbar.visible&&!document.documentElement.classList.contains('solo')}catch(e){return false}}
function k14WinNow(){const m=outerWidth>=screen.availWidth-2&&outerHeight>=screen.availHeight-2;return{x:Math.round(screenX),y:Math.round(screenY),w:Math.round(outerWidth),h:Math.round(outerHeight),m:m?1:0}}
function k14WinTick(){if(!k14Pc()||!k14AppWin()||document.hidden)return;const g=k14WinNow();if(g.w<400||g.h<300)return;const js=JSON.stringify(g);if(js===K14.wl)return;K14.wl=js;
  try{localStorage.setItem('thabat.win',js)}catch(e){}
  if(k14Win()){clearTimeout(K14.wsT);K14.wsT=setTimeout(()=>{fetch(HELPER+`/win?x=${g.x}&y=${g.y}&w=${g.w}&h=${g.h}&m=${g.m}`,{cache:'no-store'}).catch(()=>{})},1500)}}
function k14WinRestore(){if(!k14Pc()||!k14AppWin())return;let g=null;try{g=JSON.parse(localStorage.getItem('thabat.win')||'null')}catch(e){}if(!g||g.m)return;const n=k14WinNow();
  if(Math.abs(n.w-g.w)<40&&Math.abs(n.h-g.h)<40&&Math.abs(n.x-g.x)<40&&Math.abs(n.y-g.y)<40)return;
  try{if(g.w>=400&&g.h>=300&&g.w<=screen.availWidth+40&&g.h<=screen.availHeight+40)resizeTo(g.w,g.h)}catch(e){}
  try{if(g.x>-g.w+80&&g.y>-20)moveTo(g.x,g.y)}catch(e){}}
setTimeout(k14WinRestore,300);setInterval(k14WinTick,3000);addEventListener('resize',()=>{clearTimeout(K14.rsT);K14.rsT=setTimeout(k14WinTick,600)});

/* 237, 251: the tray icon's «quick note to the inbox» and «sync now»; 250: the restart link is not a command */
{const _a=autoApply;autoApply=function(L_,...a){try{const rest=[];let ib=0;(L_||[]).forEach(x=>{if(!x)return;
    if(x.t==='inbox'){const s=String(x.text||'').trim().slice(0,2000);if(s){inboxAdd(s,true);ib++}}
    else if(x.t==='sync'){if(SY.token)setTimeout(()=>syncNow({force:true}),300);else toast(t('k14.noSync'))}
    else if(x.t==='open'&&/^thabat:\/\/helper\//i.test(String(x.u||'')))return;
    else rest.push(x)});
  if(ib)toast(t('k14.ibGot',ib));if(!rest.length)return;return _a(rest,...a)}catch(e){return _a(L_,...a)}}}

/* 242, 243: a picture dragged from a web page, or pasted on «Today», becomes a note holding that picture */
function k14IsImgUrl(u){return /^data:image\//i.test(u)||/^https?:\/\/\S+$/i.test(u)}
async function k14UrlBlob(u){if(/^data:image\//i.test(u)){return await (await fetch(u)).blob()}
  try{const r=await fetch(u,{mode:'cors',cache:'no-store'});if(r.ok){const b=await r.blob();if(/^image\//.test(b.type))return b}}catch(e){}
  if(k14Win()){try{const r=await fetch(HELPER+'/img?u='+encodeURIComponent(u),{cache:'no-store'});if(r.ok){const b=await r.blob();if(/^image\//.test(b.type)||b.size)return b}}catch(e){}}
  return null}
async function k14ImgNote(src,title,from){const now=Date.now(),id=uid(),tk=todayKey();let imgs=[],body='';
  try{const b=typeof src==='string'?await k14UrlBlob(src):src;if(b){const d=await shrinkImage(b,1800);const im=uid();await idbSet('nimg:'+im,d);try{nImgMem[im]=d}catch(e){}imgs=[im]}}catch(e){}
  if(typeof src==='string'&&/^https?:/i.test(src)){let host='';try{host=new URL(src).host}catch(e){}body=imgs.length?`[${host||src}](${src})`:`![](${src})\n[${host||src}](${src})`}
  else if(!imgs.length){toast(t('k14.imgFail'));return}
  const n={id,title:String(title||'').trim().slice(0,120)||t('k14.imgT',gShort(new Date())),body,imgs,created:now,updated:now,day:tk};
  try{if(curView()==='boards'&&NF.cur&&!NF.arc)n.fd=NF.cur}catch(e){}
  NOTES().push(n);save();try{notesChanged()}catch(e){}toast(t(from==='paste'?'k14.pasteOk':'k14.dropOk'));setTimeout(()=>openNote(id),120)}
function k14BrowserDrag(dt){if(!dt||K14.own)return false;const ty=[...(dt.types||[])];return ty.includes('text/uri-list')||ty.includes('text/html')}
function k14DropOk(tg){if(!tg||!tg.closest)return true;if(tg.closest('input,textarea,[contenteditable="true"],#bwrap,#noteModal,#v-lib,#bkReader,.modal.on'))return false;return true}
function k14DzHint(on){document.documentElement.classList.toggle('k14dz',!!on);let h=$('#k14Dz');if(on&&!h){h=document.createElement('div');h.id='k14Dz';h.className='k14dz';h.textContent=t('k14.dropHint');document.body.append(h)}}
document.addEventListener('dragstart',()=>{K14.own=true},true);document.addEventListener('dragend',()=>{K14.own=false},true);
addEventListener('dragover',e=>{if(!k14Pc()||!k14BrowserDrag(e.dataTransfer)||!k14DropOk(e.target))return;e.preventDefault();try{e.dataTransfer.dropEffect='copy'}catch(x){}k14DzHint(true);clearTimeout(K14.dzT);K14.dzT=setTimeout(()=>k14DzHint(false),350)},true);
addEventListener('drop',e=>{const dt=e.dataTransfer;if(!k14Pc()||!k14BrowserDrag(dt)||!k14DropOk(e.target))return;
  let file=null,url='',alt='';try{file=[...(dt.files||[])].find(f=>/^image\//.test(f.type))||null}catch(x){}
  const html=dt.getData('text/html')||'';if(html){try{const doc=new DOMParser().parseFromString(html,'text/html'),im=doc.querySelector('img[src]');if(im){url=im.getAttribute('src')||'';alt=im.getAttribute('alt')||im.getAttribute('title')||''}}catch(x){}}
  if(!url){const ul=(dt.getData('text/uri-list')||'').split(/\r?\n/).find(s=>s&&!s.startsWith('#'))||'';url=ul.trim()}
  if(!file&&!(url&&k14IsImgUrl(url)))return;
  if(!file&&!/\.(png|jpe?g|gif|webp|bmp|avif)(\?|#|$)/i.test(url)&&!html.includes('<img')&&!/^data:image/i.test(url))return;
  e.preventDefault();e.stopImmediatePropagation();k14DzHint(false);K14.own=false;k14ImgNote(file||url,alt,'drop')},true);
document.addEventListener('paste',e=>{try{if(curView()!=='today'||$('.modal.on'))return;const tg=e.target;if(tg&&(/INPUT|TEXTAREA|SELECT/.test(tg.tagName)||tg.isContentEditable))return;
  const it=[...((e.clipboardData||{}).items||[])].find(i=>i.kind==='file'&&/^image\//.test(i.type));if(!it)return;const f=it.getAsFile();if(!f)return;e.preventDefault();k14ImgNote(f,'','paste')}catch(x){}});

/* 247: the PC course «⋯» opens its folder in Explorer (Finder on a Mac) */
{const _lm=lshMenu;lshMenu=function(anchor,html,...a){const p=_lm(anchor,html,...a);try{if(anchor&&anchor.id==='lshPcM'&&p&&!p.querySelector('[data-k14of]')&&LIB.open&&LIB.via==='pc'){
  p.insertAdjacentHTML('beforeend',`<button data-k14of="1">📂 ${t(MAC?'k14.ofMac':'k14.of')}</button>`);p.querySelector('[data-k14of]').onclick=()=>{closePP();const id=LIB.open;libFetch(libU('/open?id='+encodeURIComponent(id))).then(r=>{if(!r||!r.ok)toast(t('k14.ofFail'))}).catch(()=>toast(t('k14.ofFail')))}}}catch(e){}return p}}

/* 250: restart the helper from Thabat, even when it does not answer */
function k14HelperCmd(){let p='';try{p=decodeURIComponent(location.pathname).replace(/^\/+/,'').replace(/\//g,'\\');p=p.replace(/[^\\]*$/,'')}catch(e){}return`powershell -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "${p}Thabat-Helper.ps1"`}
async function k14Ping(ms){const end=Date.now()+ms;while(Date.now()<end){if(await helperOk())return true;await new Promise(r=>setTimeout(r,700))}return false}
async function k14AssocCache(){try{const r=await helperCall('/assoc');if(r)localStorage.setItem('thabat.assocOn',r.on?'1':'0')}catch(e){}}
async function k14HelperRestart(){if(!k14Win())return;const b=$('#k14HrB');if(b)b.disabled=true;toast(t('k14.hrGo'));let ok=false;
  try{if(await helperOk()){await fetch(HELPER+'/restart',{cache:'no-store'}).catch(()=>{});await new Promise(r=>setTimeout(r,1500));ok=await k14Ping(10000)}
    else if(localStorage.getItem('thabat.assocOn')==='1'){const a=document.createElement('a');a.href='thabat://helper/start';a.style.display='none';document.body.append(a);a.click();a.remove();ok=await k14Ping(20000)}}catch(e){}
  if(b)b.disabled=false;
  if(ok){toast(t('k14.hrOk'));try{PCN_LAST='';pcnPush(true)}catch(e){}try{bkhInit()}catch(e){}k14HrPaint();return}
  const cmd=k14HelperCmd();openInfo('🔧 '+t('k14.hrT'),`<p>${t('k14.hrHow')}</p><ol class="k14ol"><li>${t('k14.hr1')}</li><li>${t('k14.hr2')}</li><li>${t('k14.hr3')}</li></ol><pre class="k14cmd" dir="ltr">${esc(cmd)}</pre><div class="row" style="gap:6px;flex-wrap:wrap"><button class="btn sm pri" id="k14HrCp">${t('k14.copy')}</button><button class="btn sm" id="k14HrAg">↻ ${t('k14.hrAgain')}</button></div>`);
  $('#k14HrCp').onclick=()=>{try{navigator.clipboard.writeText(cmd);toast(t('k14.copied'))}catch(e){}};$('#k14HrAg').onclick=async()=>{if(await k14Ping(2000)){closeInfo2();toast(t('k14.hrOk'));try{PCN_LAST='';pcnPush(true)}catch(e){}k14HrPaint()}else toast(t('k14.hrNo'))}}
async function k14HrPaint(){const s=$('#k14HrS');if(!s)return;const ok=await helperOk();if(!$('#k14HrS'))return;s.innerHTML=`<span class="srvd ${ok?'on':''}"></span>${t(ok?'k14.hrOn':'k14.hrOff')}`;if(ok)k14AssocCache()}
function k14HrRow(){if(!k14Win()||$('#k14HrRow'))return;const host=$('#appStRow')||($('#pcnT')&&$('#pcnT').closest('.field'));if(!host)return;
  host.insertAdjacentHTML('afterend',`<div class="field" id="k14HrRow"><div><label data-i18n="k14.hrL">${t('k14.hrL')}</label><small id="k14HrS" class="k14hrs">…</small></div><button class="btn sm" id="k14HrB">↻ ${t('k14.hrB')}</button></div>`);
  $('#k14HrB').onclick=k14HelperRestart;k14HrPaint()}
hookFn('renderSettings',()=>renderSettings,f=>{renderSettings=f},'post',function(){try{setTimeout(()=>{k14HrRow();k14MvRow()},80)}catch(e){}});
{const _s=srvOpen;srvOpen=async function(...a){const res=await _s(...a);try{const r=$('#srvRe');if(r&&k14Win()&&!$('#k14SrvRe')){r.insertAdjacentHTML('afterend',`<button class="btn sm ghost" id="k14SrvRe">🔧 ${t('k14.hrB')}</button>`);$('#k14SrvRe').onclick=()=>{closeInfo2();k14HelperRestart()}}}catch(e){}return res}}

/* 254: the restore list shows what is in a copy before restoring it (the same window as restoring a file), with its last day */
function k14Sz(n){return n>=1048576?(n/1048576).toFixed(1)+' MB':Math.max(1,Math.round(n/1024))+' KB'}
function k14RsPatch(d){try{const tb=$('#infoBox .rstab');if(!tb||!d||tb.querySelector('.k14last'))return;const lk=x=>Object.keys((x&&x.days)||{}).filter(k=>/^\d{4}-\d\d-\d\d$/.test(k)).sort().pop(),a={to:lk(d)},b={to:lk(S)},f=k=>k?`${hStr(keyToDate(k))}<br><small>${gStr(keyToDate(k))}</small>`:'—';
  tb.insertAdjacentHTML('beforeend',`<tr class="k14last"><td>${t('k14.last')}</td><td><b>${f(a.to)}</b></td><td>${f(b.to)}</td></tr>`)}catch(e){}}
async function k14Preview(js,label){const inp=$('#importIn');if(!inp||!inp.onchange)return;let d=null;try{d=JSON.parse(js)}catch(e){toast(t('toast.badFile'));return}
  await inp.onchange({target:{files:[new File([js],label||'thabat-backup.json',{type:'application/json'})],value:''}});k14RsPatch(d)}
{const inp=$('#importIn');if(inp&&inp.onchange){const o=inp.onchange;inp.onchange=async e=>{let d=null;try{const f=e.target.files&&e.target.files[0];if(f)d=JSON.parse(await f.text())}catch(x){}await o(e);k14RsPatch(d)}}}
hookFn('renderBkList',()=>renderBkList,f=>{renderBkList=f},'post',function(){try{const box=$('#bkList');if(!box)return;
  box.querySelectorAll('[data-bkr]').forEach(x=>x.onclick=async()=>{const js=await idbGet(x.dataset.bkr);if(!js){toast(t('toast.badFile'));return}const i=bkIdx().find(q=>q.id===x.dataset.bkr);k14Preview(js,i?gStr(new Date(i.t))+' '+clk(i.t):'')});
  box.querySelectorAll('.bkrow small').forEach(s=>{s.innerHTML=s.innerHTML.replace(/(\d+) KB/,(m,k)=>k14Sz(+k*1024))});
  k14BkFolder()}catch(e){}});
/* 255: the copies in the backup folder, each with its date and size */
async function k14BkFiles(){const out=[];if(!dirHandle)return out;const subs=['','نسخ أسبوعية','weekly'];
  if(dirHandle.bkh){for(const sub of subs){try{const r=await bkhCall('/bkls','sub='+encodeURIComponent(sub));for(const f of r.files||[])if(/^thabat-.*\.json$/.test(f.n))out.push({sub,n:f.n,s:f.s,m:f.m})}catch(e){}}return out}
  try{if(await dirHandle.queryPermission({mode:'readwrite'})!=='granted')return out}catch(e){return out}
  for(const sub of subs){try{const dir=sub?await dirHandle.getDirectoryHandle(sub):dirHandle;for await(const [n,h] of dir.entries()){if(h.kind!=='file'||!/^thabat-.*\.json$/.test(n))continue;const f=await h.getFile();out.push({sub,n,s:f.size,m:f.lastModified,h})}}catch(e){}}return out}
async function k14BkRead(f){if(f.h)return await (await f.h.getFile()).text();const r=await fetch(HELPER+'/bkget?sub='+encodeURIComponent(f.sub)+'&n='+encodeURIComponent(f.n),{cache:'no-store'});if(!r.ok)throw 0;return await r.text()}
async function k14BkFolder(){const box=$('#bkList');if(!box)return;let w=$('#k14BkF');const L_=(await k14BkFiles()).sort((a,b)=>b.m-a.m).slice(0,12);if(!$('#bkList'))return;
  if(!L_.length){if(w)w.remove();return}if(!w){box.insertAdjacentHTML('afterend','<div id="k14BkF" class="bklist k14bkf"></div>');w=$('#k14BkF')}
  w.innerHTML=`<h4 class="k14bkh">📁 ${t('k14.bkF')}</h4>`+L_.map((f,i)=>`<div class="bkrow"><span><b>${gStr(new Date(f.m))}</b> <small>${hStr(new Date(f.m))} · ${clk(f.m)} · ${k14Sz(f.s)} · <span dir="auto">${esc((f.sub?f.sub+'/':'')+f.n)}</span></small></span><span class="row"><button class="btn sm" data-k14bf="${i}">${t('bk.restore')}</button></span></div>`).join('');
  w.querySelectorAll('[data-k14bf]').forEach(b=>b.onclick=async()=>{const f=L_[+b.dataset.k14bf];try{toast(t('k14.reading'));const js=await k14BkRead(f);k14Preview(js,f.n+' · '+gStr(new Date(f.m)))}catch(e){toast(t('toast.badFile'))}})}

/* 263: moving Thabat to a new PC, step by step */
const K14MV=['o1','o2','o3','o4','n1','n2','n3','n4','n5'];
function k14MvCk(){try{return JSON.parse(localStorage.getItem('thabat.mvck')||'{}')}catch(e){return{}}}
function k14MvOpen(tab){tab=tab||'old';const ck=k14MvCk(),roots=(LIBS().roots||[]).map(r=>typeof r==='string'?r:(r&&(r.p||r.path||r.n))||'').filter(Boolean),books=(()=>{try{return bkLocal().length}catch(e){return 0}})();
  const st=(k,body)=>`<div class="k14st ${ck[k]?'done':''}"><label class="k14stl"><input type="checkbox" data-k14ck="${k}" ${ck[k]?'checked':''}><b>${t('k14.mv.'+k)}</b></label><div class="k14stb">${body||''}</div></div>`;
  const setup='https://github.com/jake750/Thabat/releases/latest/download/'+(MAC?'Thabat-Mac.zip':'Thabat-Setup.exe');
  const old=st('o1',`<small>${t('k14.mv.o1s')}</small><div class="row k14r"><button class="btn sm pri" data-k14a="exp">⤓ ${t('k14.mv.exp')}</button></div>`)
    +st('o2',`<small>${SY.token?t('k14.mv.o2on'):t('k14.mv.o2off')}</small><div class="row k14r">${SY.token?`<button class="btn sm" data-k14a="sync">☁ ${t('k14.mv.sync')}</button>`:''}${!MAC?`<button class="btn sm ghost" data-k14a="lan">📶 ${t('k14.mv.lan')}</button>`:''}</div>`)
    +st('o3',roots.length?`<small>${t('k14.mv.o3s')}</small><pre class="k14cmd" dir="ltr">${esc(roots.join('\n'))}</pre><div class="row k14r"><button class="btn sm" data-k14a="roots">${t('k14.copy')}</button></div>`:`<small>${t('k14.mv.o3n')}</small>`)
    +st('o4',`<small>${t('k14.mv.o4s',books)}</small>`);
  const neu=st('n1',`<small>${t(MAC?'k14.mv.n1m':'k14.mv.n1s')}</small><pre class="k14cmd" dir="ltr">${esc(MAC?MAC_CMD:setup)}</pre><div class="row k14r"><button class="btn sm" data-k14a="cplink">${t('k14.copy')}</button></div>`)
    +st('n2',`<small>${t('k14.mv.n2s')}</small><div class="row k14r"><button class="btn sm pri" data-k14a="imp">⤒ ${t('k14.mv.imp')}</button></div>`)
    +st('n3',`<small>${t('k14.mv.n3s')}</small><div class="row k14r"><button class="btn sm" data-k14a="lib">🎬 ${t('k14.mv.lib')}</button></div>`)
    +st('n4',`<small>${t('k14.mv.n4s')}</small><div class="row k14r"><button class="btn sm" data-k14a="dir">📁 ${t('k14.mv.dir')}</button></div>`)
    +st('n5',`<small>${t(MAC?'k14.mv.n5m':'k14.mv.n5s')}</small>`);
  const done=K14MV.filter(k=>ck[k]).length;
  openInfo('🚚 '+t('k14.mvT'),`<div class="k14mv"><p class="muted">${t('k14.mvSub')}</p><div class="k14tabs" role="tablist"><button role="tab" class="${tab==='old'?'on':''}" data-k14t="old">${t('k14.mvOld')}</button><button role="tab" class="${tab==='new'?'on':''}" data-k14t="new">${t('k14.mvNew')}</button></div>
    <div class="k14bar"><i style="width:${Math.round(done/K14MV.length*100)}%"></i></div>${tab==='old'?old:neu}<div class="row k14r"><button class="btn sm ghost" data-k14a="reset">↺ ${t('k14.mvReset')}</button></div></div>`);
  const box=$('#infoBox');box.classList.add('k14mvbox');
  box.querySelectorAll('[data-k14t]').forEach(b=>b.onclick=()=>k14MvOpen(b.dataset.k14t));
  box.querySelectorAll('[data-k14ck]').forEach(c=>c.onchange=()=>{const o=k14MvCk();if(c.checked)o[c.dataset.k14ck]=1;else delete o[c.dataset.k14ck];try{localStorage.setItem('thabat.mvck',JSON.stringify(o))}catch(e){}k14MvOpen(tab)});
  const mark=k=>{const o=k14MvCk();o[k]=1;try{localStorage.setItem('thabat.mvck',JSON.stringify(o))}catch(e){}};
  box.querySelectorAll('[data-k14a]').forEach(b=>b.onclick=async()=>{const a=b.dataset.k14a;
    if(a==='exp'){await saveBytes('thabat-backup-'+todayKey()+'.json','application/json',new TextEncoder().encode(JSON.stringify(S)));mark('o1');k14MvOpen(tab)}
    else if(a==='sync'){await syncNow({force:true});mark('o2');toast(t('k14.mv.synced'));k14MvOpen(tab)}
    else if(a==='lan'){closeInfo2();openLan()}
    else if(a==='roots'){try{await navigator.clipboard.writeText(roots.join('\n'));toast(t('k14.copied'))}catch(e){}mark('o3')}
    else if(a==='cplink'){try{await navigator.clipboard.writeText(MAC?MAC_CMD:setup);toast(t('k14.copied'))}catch(e){}}
    else if(a==='imp'){closeInfo2();$('#importIn').click()}
    else if(a==='lib'){closeInfo2();openLibSetup()}
    else if(a==='dir'){closeInfo2();showView('set');setTimeout(()=>{const p=$('#pickFolder');if(p)p.click()},400)}
    else if(a==='reset'){try{localStorage.removeItem('thabat.mvck')}catch(e){}k14MvOpen(tab)}})}
hookFn('openInfo',()=>openInfo,f=>{openInfo=f},'pre',function(){try{$('#infoBox').classList.remove('k14mvbox')}catch(e){}});
function k14MvRow(){if(ANDROID||$('#k14MvRow'))return;const host=$('#su6Row');if(!host)return;host.insertAdjacentHTML('afterend',`<div class="field" id="k14MvRow"><div><label data-i18n="k14.mvT">${t('k14.mvT')}</label><small>${t('k14.mvRow')}</small></div><button class="btn sm" id="k14MvB">🚚 ${t('k14.mvGo')}</button></div>`);$('#k14MvB').onclick=()=>k14MvOpen()}
{const _cc=cmdCommands;cmdCommands=function(...a){const L_=_cc(...a);try{if(!ANDROID)L_.push({icon:'🚚',label:t('k14.mvT'),run:()=>{k14MvOpen()},kw:'move new pc computer transfer نقل حاسوب جديد'});if(k14Win())L_.push({icon:'🔧',label:t('k14.hrB'),run:()=>{k14HelperRestart()},kw:'helper restart مساعد أعد تشغيل'})}catch(e){}return L_}}

/* 246: a PDF opened from Finder with Thabat.app waits beside the page (inbox/); the open window takes it within a few seconds */
function k14Js(src){return new Promise(r=>{const s=document.createElement('script');s.src=src+'?v='+Date.now();s.onload=()=>{s.remove();r(true)};s.onerror=()=>{s.remove();r(false)};document.head.append(s)})}
function k14B64(b){const bin=atob(b),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return u}
async function k14MacInb(){if(!MAC||K14.mb||document.hidden||location.protocol!=='file:')return;K14.mb=1;
  try{window.__THINB=null;if(!await k14Js('inbox/thabat-inbox.js'))return;const L_=Array.isArray(window.__THINB)?window.__THINB:[];if(!L_.length)return;
    let seen=[];try{seen=JSON.parse(localStorage.getItem('thabat.macInb')||'[]')}catch(e){}
    const now=Date.now()/1000,fresh=L_.filter(id=>/^\d{10}\d*$/.test(id)&&!seen.includes(id)&&now-(+id.slice(0,10))<1800);if(!fresh.length)return;
    seen=seen.concat(fresh).slice(-40);try{localStorage.setItem('thabat.macInb',JSON.stringify(seen))}catch(e){}
    for(const id of fresh){if(!await k14Js('inbox/thabat-pdf-'+id+'.js'))continue;const o=(window.__THPDF||{})[id];if(!o||!o.b)continue;delete window.__THPDF[id];
      try{const u=k14B64(o.b);await an8BkSave(u.buffer,o.n||'book.pdf',+o.s||u.byteLength,fresh.length===1)}catch(e){toast(t('bk.addFail'))}}}catch(e){}finally{K14.mb=0}}
if(MAC){setTimeout(k14MacInb,1500);setInterval(k14MacInb,4000)}
