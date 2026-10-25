/* ============ 3.111 tenth list E (board): background dots/squares/lines, PNG with a transparent background, YouTube cards, three templates, comments on elements ============ */
/* 10th-55: board().bgp = 'dots' | 'grid' | 'lines' (none by default); drawn on #bwrap and kept in step with the view's zoom and offset */
function wbBgPaint(){const w=$('#bwrap');if(!w)return;const b=(typeof board==='function'&&board())||{},k=b.bgp||'',v=wbView();['dots','grid','lines'].forEach(x=>w.classList.toggle('wbbg-'+x,k===x));
  if(!k)return;w.style.setProperty('--wz',v.z);w.style.setProperty('--wx',v.x+'px');w.style.setProperty('--wy',v.y+'px')}
{hookFn('wbApplyView',()=>wbApplyView,f=>{wbApplyView=f},'post',function(){try{wbBgPaint()}catch(e){}})}
{hookFn('wbRender',()=>wbRender,f=>{wbRender=f},'post',function(){try{wbBgPaint();wbCmPaint()}catch(e){}})}
function wbBgSet(k){const b=board();if(k)b.bgp=k;else delete b.bgp;save();wbBgPaint()}
/* 10th-56: the PNG export with a transparent background (window.WB_TR while exporting) */
function wbPngTr(){window.WB_TR=1;Promise.resolve(wbExportPng()).finally(()=>{window.WB_TR=0})}

/* 10th-57: a YouTube video as a card (thumbnail, title, ▶): an app opened from a file cannot play YouTube inside it (YouTube refuses players without a web address), so ▶ opens the video */
async function wbYtNew(){const u=(prompt(t('wbv.ask'))||'').trim();if(!u)return;const id=ytId(u);if(!id){toast(t('wbv.bad'));return}const c=wbViewCenter();
  const e={id:uid(),type:'yt',vid:id,u:'https://www.youtube.com/watch?v='+id,tt:'',x:Math.round(c[0]-170),y:Math.round(c[1]-120),w:340,h:240};wbAdd(e);wbRender();
  try{const r=await fetch('https://noembed.com/embed?url='+encodeURIComponent(e.u));if(r.ok){const j=await r.json();if(j&&j.title){e.tt=String(j.title).slice(0,160);save();wbRender()}}}catch(x){}}
{const _h=wbNodeHTML;wbNodeHTML=function(e,...a){if(e&&e.type==='yt')return`<div class="wbyt"><div class="wbytp" style="background-image:url('https://i.ytimg.com/vi/${esc(e.vid)}/hqdefault.jpg')"><button class="wbytg" data-ytgo="${esc(e.u)}" aria-label="${esc(t('wbv.play'))}">▶</button></div><b dir="auto">${esc(e.tt||'YouTube')}</b></div>`;return _h(e,...a)}}
{const _e=wbEdit;wbEdit=function(id,...a){const e=wbFind(id);if(e&&e.type==='yt'){openExt(e.u);return}return _e(id,...a)}}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-ytgo]');if(!b)return;e.stopPropagation();e.preventDefault();openExt(b.dataset.ytgo)},true);
/* exports: a card becomes a rectangle with its title */
function wbYtFlat(e){return e&&e.type==='yt'?[{id:e.id+'_r',type:'rect',x:e.x,y:e.y,w:e.w,h:e.h,sw:1.5,color:'auto',fc:'#ff0000',fo:.12},{id:e.id+'_t',type:'text',x:e.x+12,y:e.y+e.h/2-14,w:e.w-24,h:30,fs:16,color:'auto',text:'▶ '+(e.tt||e.u),ta:'center'}]:[e]}
{const _f=wbExportPng;wbExportPng=function(els,...a){try{els=(els||wbExportSet()).flatMap(wbYtFlat)}catch(x){}return _f(els,...a)}}
{const _f=wbExportSvg;wbExportSvg=function(els,...a){try{els=(els||wbExportSet()).flatMap(wbYtFlat)}catch(x){}return _f(els,...a)}}

/* 10th-58: templates — Ramadan plan, the year's goals tree, the hifz review map (coloured from your memorised pages) */
function wbTpl3(kind){const[cx,cy]=wbViewCenter(),add=[],rtl=document.documentElement.dir==='rtl',M=(i,n)=>rtl?n-1-i:i;
  const F=(x,y,w,h,title,color='accent')=>({id:uid(),type:'frame',x,y,w,h,title,color}),N=(x,y,w,h,text,c=0)=>({id:uid(),type:'sticky',x,y,w,h,text,color:NOTE_COLORS[c%NOTE_COLORS.length]}),T=(x,y,w,h,text,fs=22)=>({id:uid(),type:'text',x,y,w,h,text,fs,color:'auto'});
  if(kind==='ramadan'){const W=320,H=430,G=30,x0=cx-(3*W+2*G)/2,y0=cy-H/2;const hy=hNum(keyToDate(todayKey())).y+(hNum(keyToDate(todayKey())).m>9?1:0);
    add.push(T(x0,y0-70,3*W+2*G,40,t('wbp.rmT',hy),26));
    ['wbp.r1','wbp.r2','wbp.r3'].forEach((k,i)=>{const x=x0+M(i,3)*(W+G);add.push(F(x,y0,W,H,t(k),i===2?'#f59e0b':'accent'));
      ['wbp.rq','wbp.rt','wbp.rs','wbp.rd'].forEach((s,j)=>add.push(N(x+16+(j%2)*148,y0+54+Math.floor(j/2)*176,136,160,t(s),i*4+j)))})}
  if(kind==='goals'){const C=N(cx-120,cy-80,240,160,t('wbp.gC',hNum(keyToDate(todayKey())).y),3);add.push(C);const A=['wbp.g1','wbp.g2','wbp.g3','wbp.g4'],P=[[-1,-1],[1,-1],[-1,1],[1,1]];
    A.forEach((k,i)=>{const x=cx+P[i][0]*420-170,y=cy+P[i][1]*260-130,f=F(x,y,340,260,t(k));add.push(f);add.push(N(x+16,y+54,146,180,t('wbp.gS1'),i*2));add.push(N(x+178,y+54,146,180,t('wbp.gS2'),i*2+1));
      add.push({id:uid(),type:'arrow',from:C.id,to:f.id,x1:0,y1:0,x2:0,y2:0,color:'auto',sw:2})})}
  if(kind==='hifz'){const mem=new Set(qMem()),S0=60,G=10,cols=6,x0=cx-(cols*S0+(cols-1)*G)/2-60,y0=cy-(5*S0+4*G)/2;add.push(T(x0,y0-64,cols*(S0+G)+120,40,t('wbp.hT'),24));
    for(let j=1;j<=30;j++){const a=QJ[j-1],b=(QJ[j]||605)-1,n=b-a+1;let m=0;for(let p=a;p<=b;p++)if(mem.has(p))m++;const fr=m/n,col=fr>=.999?'#22c55e':fr>0?'#f59e0b':'#64748b';
      const i=j-1,x=x0+M(i%cols,cols)*(S0+G),y=y0+Math.floor(i/cols)*(S0+G);add.push({id:uid(),type:'rect',x,y,w:S0,h:S0,sw:1.5,color:col,fc:col,fo:fr>0?.35:.12,text:String(j),fs:18})}
    const lx=x0+cols*(S0+G)+30;[['#22c55e','wbp.h1'],['#f59e0b','wbp.h2'],['#64748b','wbp.h3']].forEach(([c,k],i)=>{add.push({id:uid(),type:'rect',x:lx,y:y0+i*52,w:30,h:30,sw:1.5,color:c,fc:c,fo:.35});add.push(T(lx+40,y0+i*52+2,200,30,t(k),16))});
    add.push(N(lx,y0+170,200,150,t('wbp.hN'),2))}
  if(!add.length)return;wbSnap();wbEls().push(...add);save();wbSetSel([]);wbRender();wbFit()}

/* 10th-59: comments on any element: e.cm=[{id,t,at}]; a small count badge opens them */
function wbCmPaint(){if(!WB||!WB.nodes)return;wbEls().forEach(e=>{const n=WB.nodes[e.id];if(!n)return;let b=n.querySelector(':scope>.wbcm');const c=(e.cm||[]).filter(x=>!x.done).length;if(!c){if(b)b.remove();return}
  if(!b){n.insertAdjacentHTML('beforeend',`<button class="wbcm" data-wbcm="${e.id}"></button>`);b=n.querySelector(':scope>.wbcm')}b.textContent='💬 '+c;try{uicPass(b)}catch(x){}})}
{hookFn('wbRefresh',()=>wbRefresh,f=>{wbRefresh=f},'post',function(){try{wbCmPaint()}catch(e){}})}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-wbcm]');if(!b)return;e.stopPropagation();e.preventDefault();wbCmOpen(b.dataset.wbcm)},true);
function wbCmOpen(id){const e=wbFind(id);if(!e)return;const L_=e.cm||[];
  openInfo(t('wbc2.t'),`<div class="wbcmw">${L_.length?L_.map(c=>`<div class="wbcmr"><p dir="auto">${esc(c.t)}</p><small>${esc(gShort(new Date(c.at)))} ${new Date(c.at).toLocaleTimeString(LANG==='ar'?'ar':'en',{hour:'2-digit',minute:'2-digit'})}</small><button class="btn sm ghost" data-wcx="${c.id}" aria-label="${esc(t('del'))}">✕</button></div>`).join(''):`<p class="muted">${esc(t('wbc2.none'))}</p>`}
    <div class="row wbcmn"><textarea class="in" id="wbcmIn" dir="auto" rows="2" placeholder="${esc(t('wbc2.ph'))}"></textarea><button class="btn pri" id="wbcmGo">${esc(t('wbc2.add'))}</button></div></div>`);
  const go=()=>{const v=$('#wbcmIn').value.trim();if(!v)return;(e.cm=e.cm||[]).push({id:uid(),t:v.slice(0,2000),at:Date.now()});save();wbCmPaint();wbCmOpen(id)};$('#wbcmGo').onclick=go;$('#wbcmIn').onkeydown=ev=>{if(ev.key==='Enter'&&(ev.ctrlKey||ev.metaKey))go()};
  $$('#infoBox [data-wcx]').forEach(b=>b.onclick=()=>{e.cm=(e.cm||[]).filter(c=>c.id!==b.dataset.wcx);if(!e.cm.length)delete e.cm;save();wbCmPaint();wbCmOpen(id)});setTimeout(()=>{const i=$('#wbcmIn');if(i)i.focus()},60)}

/* the menus: insert (YouTube), templates (three new), «⋯» (background, transparent PNG), and the selection «⋯» (comment) */
{const _m=wbMenu;wbMenu=function(btn,items,...a){try{
  if(btn&&btn.id==='wbIns'&&!items.some(i=>i&&i.wbv))items=[...items,Object.assign(['▶ '+t('wbv.t'),wbYtNew],{wbv:1})];
  if(btn&&btn.id==='wbTpl'&&!items.some(i=>i&&i.wbp))items=[...items,null,Object.assign(['🌙 '+t('wbp.ram'),()=>wbTpl3('ramadan')],{wbp:1}),['🌳 '+t('wbp.goals'),()=>wbTpl3('goals')],['📖 '+t('wbp.hifz'),()=>wbTpl3('hifz')]];
  if(btn&&btn.id==='wbMore'&&!items.some(i=>i&&i.wbg)){const cur=(board()||{}).bgp||'';items=[...items,null,Object.assign([(cur==='dots'?'✓ ':'')+'⠿ '+t('wbg.dots'),()=>wbBgSet(cur==='dots'?'':'dots')],{wbg:1}),[(cur==='grid'?'✓ ':'')+'▦ '+t('wbg.grid'),()=>wbBgSet(cur==='grid'?'':'grid')],[(cur==='lines'?'✓ ':'')+'☰ '+t('wbg.lines'),()=>wbBgSet(cur==='lines'?'':'lines')],null,['⬇ '+t('wbg.png'),wbPngTr]]}
  if(btn&&btn.dataset&&btn.dataset.a==='more'&&!items.some(i=>i&&i.wbc2)){const sel=[...WB.sel];if(sel.length===1)items=[Object.assign(['💬 '+t('wbc2.t'),()=>wbCmOpen(sel[0])],{wbc2:1}),...items]}
  }catch(e){}return _m(btn,items,...a)}}
