/* ============ 3.134 twelfth list E (board): text inside shapes at the top, middle or bottom, a column grid for frames, saved components for any board,
   a frames side panel, copy and paste a style (60, the see-through highlighter over pictures, already existed: the «hl» pen) ============ */
/* 12th-61: e.va = 't' | 'b' (middle when absent) — shapes and sticky notes; exports follow it too */
{const _c=wbNodeCls;wbNodeCls=function(e,...a){let r=_c(e,...a);if(e&&(e.va==='t'||e.va==='b'))r+=' va-'+e.va;return r}}
{const _tl=wbTextLayout;wbTextLayout=function(txt,X,Y,w,fs,lh,font,ta,vcenter,h,...a){if(WBVA.k&&vcenter&&h){const lines=wbLines(wbPlain(txt),w,font),k=WBVA.k;
  if(k==='t')return _tl(txt,X,Y,w,fs,lh,font,ta,false,h,...a);if(k==='b'){const off=Math.max(0,h-lines.length*lh);return _tl(txt,X,Y+off-fs*.15,w,fs,lh,font,ta,false,h,...a)}}return _tl(txt,X,Y,w,fs,lh,font,ta,vcenter,h,...a)}}
const WBVA={k:''};
/* the exports draw element by element: wbTextLayout learns the current element's va through wbGet(e,'ta') (called right before it for shapes) */
{const _g=wbGet;wbGet=function(e,k,...a){if(k==='ta'&&e)WBVA.k=(e.va==='t'||e.va==='b')&&(wbIsShape(e)||e.type==='sticky')?e.va:'';return _g(e,k,...a)}}
function wbVaSet(v){const sel=[...WB.sel].map(wbFind).filter(e=>e&&(wbIsShape(e)||e.type==='sticky'));if(!sel.length)return;wbSnap();sel.forEach(e=>{if(v==='m')delete e.va;else e.va=v});save();wbRender();wbSetSel(sel.map(e=>e.id))}

/* 12th-65: copy a style from one element and paste it on others (Ctrl+Alt+C / Ctrl+Alt+V) */
const WB_STY=['color','fc','fo','op','sw','fs','fw','fi','ff','ta','va','dash','rx','pr','hl'];
function wbStyCopy(){const e=[...WB.sel].map(wbFind).filter(Boolean)[0];if(!e)return;const o={};WB_STY.forEach(k=>{if(e[k]!==undefined)o[k]=e[k]});WB.sty={o,kind:wbKind(e)};toast(t('wbsty.copied'))}
function wbStyPaste(){const S_=WB.sty;if(!S_){toast(t('wbsty.none'));return}const sel=[...WB.sel].map(wbFind).filter(e=>e&&!e.lock);if(!sel.length)return;wbSnap();
  sel.forEach(e=>{const txt=e.type==='text'||e.type==='sticky'||wbIsShape(e)||e.type==='arrow';for(const k in S_.o){if(['fs','fw','fi','ff','ta'].includes(k)&&!txt)continue;if(['fc','fo','rx'].includes(k)&&!wbIsShape(e))continue;if(k==='va'&&!(wbIsShape(e)||e.type==='sticky'))continue;if(['pr','hl'].includes(k)&&e.type!=='stroke')continue;if(k==='sw'&&e.type==='image')continue;e[k]=S_.o[k]}});
  save();wbRender();wbSetSel(sel.map(e=>e.id));toast(t('wbsty.pasted',sel.length))}
document.addEventListener('keydown',e=>{if(curView()!=='boards'||!(e.ctrlKey||e.metaKey)||!e.altKey||e.target.closest('input,textarea,[contenteditable]'))return;const k=e.key.toLowerCase();if(k==='c'&&WB.sel.size){e.preventDefault();wbStyCopy()}else if(k==='v'&&WB.sel.size){e.preventDefault();wbStyPaste()}},true);

/* 12th-63: components — S.wbComp=[{id,n,els}] saved from a selection, inserted into any board from «＋» */
try{if(Array.isArray(SY_SIMPLE)&&!SY_SIMPLE.includes('wbComp'))SY_SIMPLE.push('wbComp')}catch(e){}
function wbCompSave(){if(!WB.sel.size)return;const els=wbClone(wbCopySet(),0,0);const n=(prompt(t('wbcmp.name'),t('wbcmp.def',(S.wbComp||[]).length+1))||'').trim();if(!n)return;(S.wbComp||(S.wbComp=[])).push({id:uid(),n:n.slice(0,40),els,at:Date.now()});save();toast(t('wbcmp.saved'))}
function wbCompUse(id){const c=(S.wbComp||[]).find(x=>x.id===id);if(!c)return;WB.pasteN=0;wbPaste(JSON.stringify(c.els))}
function wbCompManage(){const L_=S.wbComp||[];openInfo(esc(t('wbcmp.mine')),L_.length?`<div class="wbl">${L_.map(x=>`<div class="wblr" data-cp="${x.id}"><b dir="auto">${esc(x.n)}</b><small>${x.els.length}</small><button class="btn sm" data-a="use">${esc(t('wbcmp.use'))}</button><button class="btn sm ghost" data-a="ren">✎</button><button class="btn sm ghost" data-a="del" aria-label="${esc(t('del'))}">✕</button></div>`).join('')}</div>`:`<p class="muted">${esc(t('wbcmp.none'))}</p>`);
  $$('#infoBox [data-cp] [data-a]').forEach(b=>b.onclick=()=>{const x=L_.find(q=>q.id===b.closest('[data-cp]').dataset.cp);if(!x)return;const a=b.dataset.a;if(a==='use'){$$('.modal.on').forEach(m=>m.classList.remove('on'));wbCompUse(x.id);return}
    if(a==='del'){const i=L_.indexOf(x);L_.splice(i,1);save();wbCompManage();toastAct(t('sdy.del'),t('undo'),()=>{L_.splice(i,0,x);save()});return}const n=(prompt(t('wbcmp.name'),x.n)||'').trim();if(n){x.n=n.slice(0,40);save()}wbCompManage()})}

/* 12th-62: a column grid on frames — board().colg={on,n,g} (columns, gutter %); drawn as a layer inside each frame */
function wbColg(){const b=board();return Object.assign({on:false,n:12,g:2},b.colg||{})}
function wbColgPaint(){const G=wbColg();wbfFrames().map(f=>WB.nodes&&WB.nodes[f.id]).filter(Boolean).forEach(n=>{let i=n.querySelector(':scope>.wbcolg');if(!G.on){i&&i.remove();return}if(!i){i=document.createElement('i');i.className='wbcolg';n.prepend(i)}i.style.setProperty('--n',G.n);i.style.setProperty('--g',G.g+'%')})}
{hookFn('wbRender',()=>wbRender,f=>{wbRender=f},'post',function(){try{wbColgPaint()}catch(e){}})}
{hookFn('wbRefresh',()=>wbRefresh,f=>{wbRefresh=f},'post',function(){try{wbColgPaint()}catch(e){}})}
function wbColgMenu(btn){const G=wbColg(),b=board(),set=o=>{b.colg=Object.assign(wbColg(),o);save();wbColgPaint();wbColgMenu(btn)};
  wbMenu(btn,[[`${G.on?'☑':'☐'} ${esc(t('wbcg.on'))}`,()=>set({on:!G.on})],null,...[4,6,8,12,16].map(n=>[`${G.n===n?'● ':''}${esc(t('wbcg.n',n))}`,()=>set({n,on:true})]),null,...[[1,'s'],[2,'m'],[4,'l']].map(([g,k])=>[`${G.g===g?'● ':''}${esc(t('wbcg.g'+k))}`,()=>set({g,on:true})])])}

/* 12th-64: the frames in a side panel — tap one to go to it; the open panel follows renames and new frames */
const WBFP={on:false};
function wbfpPaint(){const w=$('#bwrap');if(!w)return;let p=$('#wbfPanel');if(!WBFP.on){p&&p.remove();w.classList.remove('wbfpon');return}
  if(!p){w.insertAdjacentHTML('beforeend',`<aside class="wbfp" id="wbfPanel"><div class="wbfph"><b>${esc(t('wbfp.t'))}</b><button class="btn sm ghost" data-x aria-label="${esc(t('nfnd.x'))}">✕</button></div><div class="wbfpl"></div></aside>`);p=$('#wbfPanel');p.querySelector('[data-x]').onclick=()=>{WBFP.on=false;wbfpPaint()};
    ['pointerdown','wheel','touchstart'].forEach(ev=>p.addEventListener(ev,e=>e.stopPropagation(),{passive:true}))}
  w.classList.add('wbfpon');const F=wbfFrames().slice().sort((a,b)=>a.y-b.y||a.x-b.x),l=p.querySelector('.wbfpl');
  l.innerHTML=F.length?F.map((f,i)=>`<button class="wbfpr${WB.sel.has(f.id)?' on':''}" data-f="${f.id}"><small>${i+1}</small><span dir="auto">${esc(wbfName?wbfName(f):(f.title||t('wb.frame')))}</span></button>`).join(''):`<p class="muted">${esc(t('wbfp.none'))}</p>`;
  l.querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>{const f=wbFind(b.dataset.f);if(!f)return;wbCenterOn(f.id);wbSetSel([f.id]);wbfpPaint()})}
{hookFn('wbRender',()=>wbRender,f=>{wbRender=f},'post',function(){try{if(WBFP.on)wbfpPaint()}catch(e){}})}

/* menus: selection «⋯» gets vertical alignment, style copy/paste and «save as component»; «＋» lists the components; board «⋯» the column grid and frames panel */
{const _m=wbMenu;wbMenu=function(btn,items,...a){try{
  if(btn&&btn.dataset&&btn.dataset.a==='more'&&!items.some(i=>i&&i.wb12)){const sel=[...WB.sel].map(wbFind).filter(Boolean),tx=sel.some(e=>wbIsShape(e)||e.type==='sticky');const add=[];
    if(tx)add.push(['⬆ '+t('wbva.t'),()=>wbVaSet('t')],['↕ '+t('wbva.m'),()=>wbVaSet('m')],['⬇ '+t('wbva.b'),()=>wbVaSet('b')],null);
    if(sel.length)add.push(Object.assign(['🖌 '+t('wbsty.copy'),wbStyCopy],{wb12:1}));if(WB.sty&&sel.length)add.push(['🖌 '+t('wbsty.paste'),wbStyPaste]);if(sel.length)add.push(['🧩 '+t('wbcmp.save'),wbCompSave]);
    if(add.length)items=[...items,null,...add]}
  if(btn&&btn.id==='wbIns'&&!items.some(i=>i&&i.wbc2)){const L_=S.wbComp||[];if(L_.length)items=[...items,null,...L_.slice(-8).map((x,i)=>Object.assign(['🧩 '+esc(x.n),()=>wbCompUse(x.id)],i?{}:{wbc2:1})),['⚙ '+t('wbcmp.mine'),wbCompManage]]}
  if(btn&&btn.id==='wbMore'&&!items.some(i=>i&&i.wbfp)){items=[Object.assign(['▦ '+t('wbfp.t')+(wbfFrames().length?` (${wbfFrames().length})`:''),()=>{WBFP.on=!WBFP.on;wbfpPaint()}],{wbfp:1}),['▥ '+t('wbcg.t'),()=>setTimeout(()=>wbColgMenu(btn),0)],...items]}
  }catch(e){console.error(e)}return _m(btn,items,...a)}}
