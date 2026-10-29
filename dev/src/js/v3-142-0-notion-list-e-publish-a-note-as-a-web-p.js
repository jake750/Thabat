/* ============ v3.142.0: Notion list E — publish a note as a web page, comments on parts of a note, save a whole article from a link ============ */
/* 30 n.pub={id,u,at}: a public gist «index.html» made with the sync token (ghFetch), shown through gist.githack.com.
   31 n.cm=[{id,q,t,at,done}]: q = the commented words, found again in the reading view by their text.
   32 narSave: the helper's /page (PC) or the r.jina.ai reader (phone, Mac, or when the PC cannot read it) → a note in Markdown. */
const NCM={t:0,sel:'',rsel:''};

/* ---- 30: publish ---- */
const NPB_CSS=`:root{color-scheme:light dark;--bg:#fbfaf7;--tx:#1b1b1b;--mu:#6b6b6b;--ln:#e3e0d8;--ac:#b8892a}@media(prefers-color-scheme:dark){:root{--bg:#16171b;--tx:#e9e7e2;--mu:#9a9890;--ln:#2c2d33;--ac:#e0b43a}}*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--tx);font-family:"IBM Plex Sans Arabic",system-ui,sans-serif;font-size:17px;line-height:1.85}main{max-width:760px;margin:0 auto;padding:40px 18px 60px}h1{font-size:30px;line-height:1.35;margin:0 0 6px}.m{color:var(--mu);font-size:14px;margin:0 0 26px;padding-bottom:16px;border-bottom:1px solid var(--ln)}article{overflow-wrap:anywhere}article img{max-width:100%;height:auto;border-radius:10px;display:block;margin:12px 0}a{color:var(--ac)}blockquote,.nq{margin:12px 0;padding:6px 14px;border-inline-start:3px solid var(--ac);color:var(--mu)}pre,code{font-family:ui-monospace,Consolas,monospace;font-size:14px}pre{background:color-mix(in srgb,var(--tx) 6%,transparent);padding:12px;border-radius:10px;overflow:auto;direction:ltr;text-align:left}table{border-collapse:collapse;width:100%;margin:12px 0;font-size:15px}td,th{border:1px solid var(--ln);padding:6px 10px;text-align:start}mark{background:color-mix(in srgb,#f5d76e 55%,transparent);color:inherit;border-radius:3px;padding:0 2px}details{margin:8px 0}summary{cursor:pointer;font-weight:600}hr{border:0;border-top:1px solid var(--ln);margin:22px 0}ul,ol{padding-inline-start:1.4em}.nh1{font-size:24px;font-weight:700;margin:22px 0 6px}.nh2{font-size:20px;font-weight:700;margin:18px 0 6px}.nh3,.nh4{font-size:17px;font-weight:700;margin:14px 0 4px}input[type=checkbox]{margin-inline-end:6px}.im{margin-top:20px}footer{margin-top:40px;padding-top:14px;border-top:1px solid var(--ln);color:var(--mu);font-size:13px}`;
function npbUrl(p){return `https://gist.githack.com/${encodeURIComponent(p.u||'')}/${encodeURIComponent(p.id)}/raw/index.html`}
function npbShrink(d){return new Promise(res=>{const im=new Image();im.onload=()=>{try{const k=Math.min(1,900/Math.max(im.naturalWidth,im.naturalHeight)),c=document.createElement('canvas');c.width=Math.max(1,Math.round(im.naturalWidth*k));c.height=Math.max(1,Math.round(im.naturalHeight*k));const g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,c.width,c.height);g.drawImage(im,0,0,c.width,c.height);res(c.toDataURL('image/jpeg',.78))}catch(e){res(null)}};im.onerror=()=>res(null);im.src=d})}
async function npbHTML(n){const box=document.createElement('div');box.innerHTML=mdLite(n.body||'');
  box.querySelectorAll('button,.ndh,.nltk,script,[contenteditable]').forEach(e=>e.remove());
  box.querySelectorAll('input').forEach(c=>{if(c.type==='checkbox')c.setAttribute('disabled','');else c.remove()});
  box.querySelectorAll('[data-lnk]:not(a)').forEach(e=>{const u=e.dataset.lnk,a=document.createElement('a');a.href=u;a.textContent=((e.querySelector('.nlt')||{}).textContent||'').trim()||u;e.replaceWith(a)});
  box.querySelectorAll('a').forEach(a=>{const h=a.getAttribute('href')||a.dataset.lnk||'';if(/^https?:\/\//i.test(h)){a.setAttribute('href',h);a.setAttribute('target','_blank');a.setAttribute('rel','noopener')}else{const s=document.createElement('span');s.textContent=a.textContent;a.replaceWith(s)}});
  let size=0;const put=async id=>{const d=await nImg(id).catch(()=>null),s=d?await npbShrink(d):null;if(s&&size+s.length<1.2e6){size+=s.length;return s}return null};
  for(const img of box.querySelectorAll('img[data-nimg]')){const s=await put(img.dataset.nimg);if(s){img.src=s;img.alt=''}else img.remove()}
  let extra='';for(const id of (n.imgs||[]).slice(0,12)){if(String(n.body||'').includes('![[img:'+id+']]'))continue;const s=await put(id);if(s)extra+=`<img src="${s}" alt="">`}
  box.querySelectorAll('*').forEach(e=>[...e.attributes].forEach(at=>{if(/^on/i.test(at.name)||at.name.startsWith('data-')||at.name==='role'||at.name==='tabindex')e.removeAttribute(at.name)}));
  const title=n.title||t('notes.untitled'),rtl=/[؀-ۿ]/.test(title+String(n.body||'').slice(0,600)),dt=new Date(n.updated||n.created||Date.now());
  return `<!doctype html><html lang="${rtl?'ar':'en'}" dir="${rtl?'rtl':'ltr'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;600;700&display=swap"><style>${NPB_CSS}</style></head><body><main><h1 dir="auto">${esc(title)}</h1><p class="m">${esc(hStr(dt))} · ${esc(gStr(dt))}</p><article dir="auto">${box.innerHTML}${extra?`<div class="im">${extra}</div>`:''}</article><footer>${esc(t('npb.foot'))}</footer></main></body></html>`}
function npbStore(){if(!NE||NE._new)return;const n=NOTES().find(x=>x.id===NE.id);if(!n)return;if(NE.pub)n.pub=JSON.parse(JSON.stringify(NE.pub));else delete n.pub;save()}
async function npbPublish(){if(!NE)return;try{neRead()}catch(e){}const n=NE,st=$('#npbSt');if(st)st.textContent=t('npb.busy');
  try{const html=await npbHTML(n),desc='Thabat · '+(n.title||t('notes.untitled')).slice(0,80),files={'index.html':{content:html}};let g=null;
    if(n.pub&&n.pub.id){try{g=await ghFetch('/gists/'+n.pub.id,{method:'PATCH',body:JSON.stringify({description:desc,files})})}catch(e){if(!/404/.test(String(e&&e.message)))throw e}}
    if(!g)g=await ghFetch('/gists',{method:'POST',body:JSON.stringify({description:desc,public:true,files})});
    n.pub={id:g.id,u:(g.owner&&g.owner.login)||(n.pub&&n.pub.u)||'',at:Date.now()};npbStore();npbOpen();toast(t('npb.done'))}
  catch(e){if(st)st.textContent='';toast(t(String(e&&e.message)==='auth'?'npb.auth':'npb.fail'))}}
async function npbStop(){if(!NE||!NE.pub)return;if(!confirm(t('npb.stopQ')))return;try{await ghFetch('/gists/'+NE.pub.id,{method:'DELETE'})}catch(e){if(!/404/.test(String(e&&e.message))){toast(t('npb.fail'));return}}delete NE.pub;npbStore();$('#infoModal').classList.remove('on');toast(t('npb.stopped'))}
function npbOpen(){if(!NE)return;try{neRead()}catch(e){}if(!String(NE.title||'').trim()&&!String(NE.body||'').trim()){toast(t('npb.empty'));return}
  const p=NE.pub,tok=!!(typeof SY!=='undefined'&&SY&&SY.token),url=p?npbUrl(p):'';
  openInfo(esc(t('npb.t')),p?`<p class="npbu"><a href="#" id="npbLink" dir="ltr">${esc(url)}</a></p><div class="ndbpr"><button type="button" class="btn sm pri" id="npbCopy">${esc(t('npb.copy'))}</button><button type="button" class="btn sm ghost" id="npbOpenL">↗ ${esc(t('npb.open'))}</button><button type="button" class="btn sm ghost" id="npbUp"${tok?'':' disabled'}>↻ ${esc(t('npb.update'))}</button><button type="button" class="btn sm ghost nfdanger" id="npbDel"${tok?'':' disabled'}>✕ ${esc(t('npb.stop'))}</button></div><p class="muted npbn">${esc(t('npb.at',gShort(new Date(p.at))))} ${esc(t('npb.cache'))}</p><div id="npbSt" class="muted"></div>`
    :`<p>${esc(t('npb.ask'))}</p>${tok?'':`<p class="muted">${esc(t('npb.noTok'))}</p>`}<div class="ndbpr"><button type="button" class="btn sm pri" id="npbGo"${tok?'':' disabled'}>↗ ${esc(t('npb.go'))}</button></div><div id="npbSt" class="muted"></div>`);
  const L_=$('#npbLink');if(L_)L_.onclick=e=>{e.preventDefault();openExt(url)};$('#npbOpenL')?.addEventListener('click',()=>openExt(url));
  $('#npbCopy')?.addEventListener('click',()=>{try{navigator.clipboard.writeText(url).then(()=>toast(t('npb.copied')),()=>toast(url))}catch(e){toast(url)}});
  $('#npbGo')?.addEventListener('click',npbPublish);$('#npbUp')?.addEventListener('click',npbPublish);$('#npbDel')?.addEventListener('click',npbStop)}

/* ---- 31: comments ---- */
function ncmList(n){return (n&&n.cm)||[]}
function ncmStore(){if(!NE||NE._new)return;const n=NOTES().find(x=>x.id===NE.id);if(!n)return;const L_=JSON.parse(JSON.stringify(NE.cm||[]));if(L_.length)n.cm=L_;else delete n.cm;save()}
function ncmAdd(q){q=String(q||'').trim();if(!NE)return;if(q.length<2){toast(t('ncm.sel'));return}const tx=(prompt(t('ncm.q'),'')||'').trim();if(!tx)return;
  NE.cm=NE.cm||[];NE.cm.push({id:uid(),q:q.slice(0,300),t:tx.slice(0,2000),at:Date.now()});ncmStore();ncmPaint();toast(t('ncm.added'))}
function ncmPlain(q){let s=String(q||'');try{s=mdPlain(s)}catch(e){}return s.split('\n').map(x=>x.trim()).find(Boolean)||''}
function ncmMarks(pv){pv.querySelectorAll('mark.ncmk').forEach(m=>m.replaceWith(...m.childNodes));
  /* the words may cross bold/italic/links: find them in the joined text, then wrap each text node's share in its own mark */
  ncmList(NE).filter(c=>!c.done).forEach(c=>{const q0=ncmPlain(c.q);if(!q0)return;const tries=[q0,q0.slice(0,40),q0.slice(0,20)].filter((s,i,a)=>s.length>=2&&a.indexOf(s)===i);
    const N=[],w=document.createTreeWalker(pv,NodeFilter.SHOW_TEXT);let nd,full='';while((nd=w.nextNode())){if(nd.parentElement.closest('mark.ncmk,button,.ndh'))continue;N.push({nd,a:full.length});full+=nd.textContent}
    for(const q of tries){const i=full.indexOf(q);if(i<0)continue;const e=i+q.length;
      N.filter(x=>x.a<e&&x.a+x.nd.textContent.length>i).forEach(x=>{const s=Math.max(0,i-x.a),f=Math.min(x.nd.textContent.length,e-x.a);if(f<=s)return;const r=document.createRange();r.setStart(x.nd,s);r.setEnd(x.nd,f);const m=document.createElement('mark');m.className='ncmk';m.dataset.cm=c.id;m.title=c.t;try{r.surroundContents(m)}catch(er){}});break}})}
function ncmPaint(){const box=$('#noteBox');if(!box||!NE)return;box.querySelector('#ncmBar')?.remove();const L_=ncmList(NE),open=L_.filter(c=>!c.done);
  if(L_.length){const at=box.querySelector('#ndbEd')||box.querySelector('.nehead');if(at){const b=document.createElement('button');b.type='button';b.id='ncmBar';b.className='ncmbar';b.innerHTML=`<span class="ncmi">❝</span><span>${esc(t('ncm.n',open.length))}</span>${L_.length>open.length?`<small>${esc(t('ncm.doneN',L_.length-open.length))}</small>`:''}`;b.onclick=ncmOpen;at.insertAdjacentElement('afterend',b)}}
  const pv=$('#nePrev');if(pv&&NE._view)ncmMarks(pv)}
function ncmPop(id,anchor){const c=ncmList(NE).find(x=>x.id===id);if(!c)return;const r=anchor.getBoundingClientRect();
  const pp=qPopAt(`<div class="ncmq" dir="auto">«${esc(c.q.slice(0,140))}»</div><div class="ncmt" dir="auto">${esc(c.t)}</div><small class="muted">${esc(gShort(new Date(c.at)))}</small><div class="ndbpr"><button class="btn sm" data-a="done">✓ ${esc(t('ncm.done'))}</button><button class="btn sm ghost" data-a="ed">✎ ${esc(t('ncm.edit'))}</button><button class="btn sm ghost" data-a="del">✕ ${esc(t('ncm.del'))}</button></div>`,r.left+r.width/2,r.bottom+4,'aymenu ncmpop');
  pp.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{closePP();ncmAct(id,b.dataset.a)})}
function ncmAct(id,a){if(!NE)return;const L_=NE.cm||[],c=L_.find(x=>x.id===id);if(!c)return;
  if(a==='done')c.done=c.done?0:Date.now();
  else if(a==='ed'){const s=(prompt(t('ncm.q'),c.t)||'').trim();if(!s)return;c.t=s.slice(0,2000)}
  else if(a==='del'){const i=L_.indexOf(c);L_.splice(i,1);toastAct(t('ncm.deleted'),t('undo'),()=>{if(!NE)return;(NE.cm=NE.cm||[]).splice(i,0,c);ncmStore();ncmPaint();ncmListPaint()})}
  ncmStore();ncmPaint();ncmListPaint()}
function ncmOpen(){openInfo(esc(t('ncm.t')),`<div id="ncmL" class="ncml"></div>`);ncmListPaint()}
function ncmListPaint(){const b=$('#ncmL');if(!b||!NE)return;const L_=ncmList(NE).slice().sort((a,c)=>(!!a.done-!!c.done)||(c.at-a.at));
  b.innerHTML=L_.map(c=>`<div class="ncmr${c.done?' dn':''}"><div class="ncmq" dir="auto">«${esc(c.q.slice(0,160))}»</div><div class="ncmt" dir="auto">${esc(c.t)}</div><div class="ncmf"><small>${esc(gShort(new Date(c.at)))}</small><span class="nfsp"></span><button type="button" class="btn sm ghost" data-g="${c.id}">${esc(t('ncm.go'))}</button><button type="button" class="btn sm ghost" data-d="${c.id}" title="${esc(t('ncm.done'))}">${c.done?'↺':'✓'}</button><button type="button" class="btn sm ghost" data-x="${c.id}" aria-label="${esc(t('ncm.del'))}">✕</button></div></div>`).join('')||`<small class="muted">${esc(t('ncm.none'))}</small>`;
  b.querySelectorAll('[data-d]').forEach(x=>x.onclick=()=>ncmAct(x.dataset.d,'done'));b.querySelectorAll('[data-x]').forEach(x=>x.onclick=()=>ncmAct(x.dataset.x,'del'));
  b.querySelectorAll('[data-g]').forEach(x=>x.onclick=()=>{$('#infoModal').classList.remove('on');ncmGo(x.dataset.g)})}
function ncmGo(id){const c=ncmList(NE).find(x=>x.id===id);if(!c)return;const pv=$('#nePrev'),m=NE._view&&pv&&pv.querySelector(`mark.ncmk[data-cm="${id}"]`);
  if(m){m.scrollIntoView({block:'center',behavior:'smooth'});m.classList.add('ncmfl');setTimeout(()=>m.classList.remove('ncmfl'),1600);return}
  const ta=$('#neBody');if(ta&&!NE._view){const i=ta.value.indexOf(c.q);if(i>=0){ta.focus();ta.setSelectionRange(i,i+c.q.length);try{const y=taCaret(ta,i).y;ta.scrollTop=Math.max(0,y-ta.clientHeight/3)}catch(e){}return}}
  toast(t('ncm.lost'))}
/* reading view: a small «comment» button under a selection */
function ncmFab(){let b=$('#ncmFab');const sel=getSelection(),pv=$('#nePrev'),txt=sel?sel.toString().trim():'';
  const ok=txt.length>1&&pv&&NE&&NE._view&&$('#noteModal.on')&&pv.contains(sel.anchorNode)&&pv.contains(sel.focusNode);if(!ok){b?.remove();return}
  NCM.sel=txt;const r=sel.getRangeAt(0).getBoundingClientRect(),z=uiZoom()||1;
  if(!b){b=document.createElement('button');b.type='button';b.id='ncmFab';b.className='ncmfab';b.innerHTML=`❝ ${esc(t('ncm.add'))}`;document.body.append(b);b.addEventListener('mousedown',e=>e.preventDefault());b.onclick=()=>{const s=NCM.sel;b.remove();ncmAdd(s)}}
  b.style.left=Math.max(60,Math.min(innerWidth/z-60,(r.left+r.width/2)/z))+'px';b.style.top=Math.min(innerHeight/z-56,r.bottom/z+10)+'px'}
document.addEventListener('selectionchange',()=>{clearTimeout(NCM.t);NCM.t=setTimeout(()=>{try{ncmFab()}catch(e){}},200)});
document.addEventListener('click',e=>{const m=e.target.closest&&e.target.closest('#nePrev mark.ncmk');if(!m)return;if(String(getSelection()||'').trim())return;e.preventDefault();e.stopPropagation();ncmPop(m.dataset.cm,m)},true);
{hookFn('renderNoteEd',()=>renderNoteEd,f=>{renderNoteEd=f},'post',function(){try{ncmPaint()}catch(e){console.error(e)}})}
{hookFn('neShowMode',()=>neShowMode,f=>{neShowMode=f},'post',function(){try{ncmPaint();$('#ncmFab')?.remove()}catch(e){console.error(e)}})}
{hookFn('closeNote',()=>closeNote,f=>{closeNote=f},'post',function(){try{$('#ncmFab')?.remove()}catch(e){}})}
/* edit mode: a button on the formatting bar */
{hookFn('fmtBar',()=>fmtBar,f=>{fmtBar=f},'post',function(){try{const bar=$('#fmtBar');if(!bar||bar.querySelector('[data-ncm]'))return;const b=document.createElement('button');b.type='button';b.dataset.ncm=1;b.textContent='❝+';b.title=t('ncm.add');b.setAttribute('aria-label',t('ncm.add'));
  b.addEventListener('mousedown',e=>e.preventDefault());b.onclick=()=>{const ta=$('#neBody');if(!ta)return;const q=ta.value.slice(ta.selectionStart,ta.selectionEnd);bar.remove();ncmAdd(q)};bar.append(b)}catch(e){}})}
/* the note «⋯»: comment on the selection, the comments, publish */
{hookFn('nteMenu',()=>nteMenu,f=>{nteMenu=f},'pre',function(){try{const sel=getSelection(),pv=$('#nePrev');NCM.rsel=sel&&pv&&pv.contains(sel.anchorNode)?sel.toString().trim():''}catch(e){NCM.rsel=''}})}
{hookFn('nteMenu',()=>nteMenu,f=>{nteMenu=f},'post',function(){try{const p=$('#ppPop');if(!p||p.querySelector('[data-npbm]')||!NE)return;const add=(ic,lab,fn)=>{const b=document.createElement('button');b.dataset.npbm=1;b.innerHTML=`${ic} ${esc(lab)}`;b.onclick=e=>{e.stopPropagation();closePP();fn()};p.append(b)};
  const ta=$('#neBody'),selT=NCM.rsel||(NE._selB>NE._selA&&ta?ta.value.slice(NE._selA,NE._selB):'');
  if(selT.trim().length>1)add('❝',t('ncm.add'),()=>ncmAdd(selT));
  if(ncmList(NE).length)add('❝',t('ncm.t')+' ('+ncmList(NE).filter(c=>!c.done).length+')',ncmOpen);
  add('↗',t(NE.pub?'npb.page':'npb.go'),npbOpen)}catch(e){console.error(e)}})}

/* ---- 32: save a whole article ---- */
function narMd(root,base){const abs=u=>{try{return new URL(u,base).href}catch(e){return''}},out=[];let nimg=0;
  const inl=el=>{let s='';el.childNodes.forEach(c=>{if(c.nodeType===3){s+=c.textContent.replace(/\s+/g,' ');return}if(c.nodeType!==1)return;const tg=c.tagName;
    if(tg==='BR')s+='\n';
    else if(tg==='A'){const h=abs(c.getAttribute('href')||''),tx=inl(c).trim();s+=tx&&/^https?:/.test(h)?`[${tx.replace(/[\[\]]/g,'')}](${h})`:tx}
    else if(tg==='STRONG'||tg==='B'){const tx=inl(c).trim();s+=tx?`**${tx}**`:''}
    else if(tg==='EM'||tg==='I'){const tx=inl(c).trim();s+=tx?`*${tx}*`:''}
    else if(tg==='CODE')s+='`'+c.textContent+'`';
    else if(tg!=='IMG')s+=inl(c)});return s};
  const img=im=>{const s=abs(im.getAttribute('src')||im.getAttribute('data-src')||'');if(/^https:\/\//.test(s)&&!/\.svg(\?|$)/i.test(s)&&nimg<20){nimg++;out.push(`![](${s})`)}};
  const BLK='p,div,section,article,main,h1,h2,h3,h4,h5,h6,ul,ol,blockquote,pre,table,figure,img,hr';
  const blk=el=>{el.childNodes.forEach(c=>{if(c.nodeType===3){const tx=c.textContent.replace(/\s+/g,' ').trim();if(tx)out.push(tx);return}if(c.nodeType!==1)return;const tg=c.tagName;
    if(/^H[1-6]$/.test(tg)){const tx=inl(c).trim();if(tx)out.push('#'.repeat(Math.min(4,Math.max(2,+tg[1])))+' '+tx.replace(/\n/g,' '));return}
    if(tg==='P'){const tx=inl(c).trim();if(tx)out.push(tx);c.querySelectorAll('img').forEach(img);return}
    if(tg==='UL'||tg==='OL'){let i=1;const L_=[];c.querySelectorAll(':scope>li').forEach(li=>{const tx=inl(li).trim().replace(/\n+/g,' ');if(tx)L_.push((tg==='OL'?(i++)+'. ':'- ')+tx)});if(L_.length)out.push(L_.join('\n'));return}
    if(tg==='BLOCKQUOTE'){const tx=inl(c).trim();if(tx)out.push(tx.split('\n').map(l=>'> '+l).join('\n'));return}
    if(tg==='PRE'){out.push('```\n'+c.textContent.replace(/\n+$/,'')+'\n```');return}
    if(tg==='IMG'){img(c);return}
    if(tg==='FIGURE'){c.querySelectorAll('img').forEach(img);const cap=c.querySelector('figcaption');if(cap){const tx=inl(cap).trim();if(tx)out.push('*'+tx+'*')}return}
    if(tg==='TABLE'){const rows=[...c.querySelectorAll('tr')].slice(0,80).map(tr=>[...tr.children].map(td=>inl(td).trim().replace(/\|/g,'/').replace(/\n/g,' ')));if(rows.length&&rows[0].length){const w=Math.max(...rows.map(r=>r.length)),f=r=>'| '+Array.from({length:w},(_,i)=>r[i]||'').join(' | ')+' |';out.push([f(rows[0]),'|'+Array(w).fill('---').join('|')+'|',...rows.slice(1).map(f)].join('\n'))}return}
    if(tg==='HR'){out.push('---');return}
    if(!c.querySelector(BLK)){const tx=inl(c).trim();if(tx)out.push(tx);return}
    blk(c)})};
  blk(root);return out.join('\n\n').replace(/\n{3,}/g,'\n\n').trim()}
function narExtract(html,base){const d=new DOMParser().parseFromString(html,'text/html'),meta=s=>(d.querySelector(s)||{}).getAttribute?.('content')||'';
  const title=(meta('meta[property="og:title"]')||d.title||'').replace(/\s+/g,' ').trim();
  d.querySelectorAll('script,style,noscript,iframe,svg,form,nav,header,footer,aside,button,input,select,textarea,template,[role=navigation],[role=banner],[role=contentinfo],[aria-hidden=true],[hidden],.share,.social,.comments,#comments,.related,.advert,.ads,.ad').forEach(e=>e.remove());
  let root=null,best=0;d.querySelectorAll('article,main,[role=main]').forEach(c=>{const n=c.textContent.trim().length;if(n>best){best=n;root=c}});
  if(!root||best<400){const sc=new Map();d.querySelectorAll('p').forEach(p=>{const L_=p.textContent.trim().length;if(L_<40)return;const a=p.parentElement,b=a&&a.parentElement;if(a)sc.set(a,(sc.get(a)||0)+L_);if(b)sc.set(b,(sc.get(b)||0)+L_/2)});let m=0;sc.forEach((v,k)=>{if(v>m){m=v;root=k}})}
  return{title,md:narMd(root||d.body,base)}}
async function narFetch(u){let r=null;
  if(!ANDROID&&!MAC){try{const x=await fetch(HELPER+'/page?u='+encodeURIComponent(u),{cache:'no-store'});if(x.ok){const j=await x.json();if(j&&j.html){const e=narExtract(j.html,j.url||u);if(e.md.length>150)r=e}}}catch(e){}}
  if(!r){try{const x=await fetch('https://r.jina.ai/'+u);if(x.ok){const tx=await x.text(),tt=(tx.match(/^Title:\s*(.+)$/m)||[])[1]||'',i=tx.indexOf('Markdown Content:'),md=(i>=0?tx.slice(i+17):tx).trim().replace(/^!\[[^\]]*\]\((https:\/\/[^\s)]+)[^)]*\)\s*$/gm,'![]($1)');if(md.length>100)r={title:tt.trim(),md}}}catch(e){}}
  return r}
async function narSave(u){u=String(u||'').trim();if(!/^https?:\/\/[^\s/]+\.[^\s]+/i.test(u)){toast(t('nar.bad'));return}const st=$('#narSt'),go=$('#narGo');if(st)st.textContent=t('nar.busy');if(go)go.disabled=true;
  const r=await narFetch(u);if(go)go.disabled=false;if(!r){if(st)st.textContent='';toast(t('nar.fail'));return}
  const md=r.md.length>200000?r.md.slice(0,200000)+'\n\n…':r.md,now=Date.now(),n={id:uid(),title:(r.title||u).slice(0,200),body:u+'\n\n'+md,day:todayKey(),imgs:[],created:now,updated:now,src:u};
  if(curView()==='boards'&&typeof NF!=='undefined'&&NF.cur&&!NF.arc)n.fd=NF.cur;
  NOTES().push(n);save();try{notesChanged()}catch(e){}$('#infoModal').classList.remove('on');toast(t('nar.done'));setTimeout(()=>openNote(n.id),80);return n}
function narOpen(pre){openInfo(esc(t('nar.t')),`<p class="muted">${esc(t('nar.sub'))}</p><div class="row" style="gap:6px"><input class="in" id="narIn" type="url" dir="ltr" placeholder="https://…" style="flex:1;min-width:0" value="${esc(pre||'')}"><button type="button" class="btn pri" id="narGo">${esc(t('nar.go'))}</button></div><small class="muted narv">${esc(t('nar.via'))}</small><div id="narSt" class="muted"></div>`);
  const go=()=>narSave($('#narIn').value);$('#narGo').onclick=go;$('#narIn').onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();go()}};setTimeout(()=>{try{$('#narIn').focus()}catch(e){}},60)}
/* entry points: the notes «⋯», Ctrl+K, and each read-later item */
NX_MORE.push(['narB','nar.t']);
{hookFn('renderNotes',()=>renderNotes,f=>{renderNotes=f},'post',function(){try{const tl=$('#nTools');if(!tl||$('#narB'))return;tl.insertAdjacentHTML('beforeend',`<button class="btn sm ghost nxhid" id="narB">⤓ ${esc(t('nar.t'))}</button>`);$('#narB').onclick=()=>narOpen()}catch(e){}})}
{const _cc=cmdCommands;cmdCommands=function(){const c=(icon,label,run,kw)=>({icon,label,run,kw:kw||''});return _cc().concat([c('⤓',t('nar.t'),()=>narOpen(),'article save link web مقال رابط صفحة')])}}
{hookFn('rlPaint',()=>rlPaint,f=>{rlPaint=f},'post',function(){try{$$('#rlBox [data-rl]').forEach(row=>{if(row.querySelector('.narrl'))return;const nb=row.querySelector('[data-a="note"]');if(!nb)return;const b=document.createElement('button');b.type='button';b.className='btn sm ghost narrl';b.textContent='⤓';b.title=t('nar.rl');b.setAttribute('aria-label',t('nar.rl'));
  b.onclick=async()=>{const x=(S.rlater||[]).find(q=>q.id===row.dataset.rl);if(!x)return;b.disabled=true;toast(t('nar.busy'));const r=await narFetch(x.u);b.disabled=false;if(!r){toast(t('nar.fail'));return}const now=Date.now(),n={id:uid(),title:(r.title||x.t||x.u).slice(0,200),body:x.u+'\n\n'+(r.md.length>200000?r.md.slice(0,200000)+'\n\n…':r.md),day:todayKey(),imgs:[],created:now,updated:now,src:x.u};NOTES().push(n);x.done=true;x.rd=now;save();try{notesChanged()}catch(e){}rlPaint();toast(t('nar.done'))};nb.after(b)})}catch(e){}})}

WNP['3.142.0']=[{k:'wnp.npb',f:()=>`<div class="ncmr" style="margin:0"><div class="ncmq">«${esc(t('wnp.npbQ'))}»</div><div class="ncmt">${esc(t('wnp.npbC'))}</div></div>`}];

