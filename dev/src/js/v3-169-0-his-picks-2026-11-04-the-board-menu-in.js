/* ============ v3.169.0 his picks 2026-11-04: the board «⋯» menu in sub-menus («أ»), own lists without a scrollbar ============ */
/* The board «⋯» menu had grown to ~30 rows from many wrappers. After all of them have built it (wbMenu runs innermost last),
   its rows are sorted by their label into five groups; the main menu shows search + the groups, and a group opens beside it
   (PC) or in its place with «رجوع» (phone). The original buttons are moved, so their handlers stay. */
const WBSM_G=[
  ['view','wbsm.view',['wb.minimap','wb.snap','wbg.dots','wbg.grid','wbg.lines','wb17.iso','wb17.rul','wb17.gs','wb17.gClr','wb16.ms','wbl.t','wbca.t','wb16.lp']],
  ['out','wbsm.out',['wb.png','wb.svg','wbg.png','wb.canvasOut','wb.canvasIn','wb.paste','wbt.save',/PDF/]],
  ['frm','wbsm.frm',['wb.present','wbfp.t','wbcg.t']],
  ['brd','wbsm.brd',['board.name','wb.clear','board.del']]
];
const WBSM={sub:null};
function wbsmLab(k){return String(t(k,'')).replace(/\(\s*\)|\{\d\}/g,'').replace(/[:·…]\s*$/,'').trim()}
function wbsmGroup(tx){
  if(tx.includes(wbsmLab('wbs.t')))return 'top';
  for(const g of WBSM_G)for(const k of g[2]){if(k instanceof RegExp?k.test(tx):(wbsmLab(k)&&tx.includes(wbsmLab(k))))return g[0]}
  return 'more'}
function wbsmMob(){return MOB.matches}
function wbsmBuild(p,btn){
  const bs=[...p.querySelectorAll(':scope>button[data-i]')];if(bs.length<9)return;
  const by={top:[],view:[],out:[],frm:[],brd:[],more:[]};bs.forEach(b=>by[wbsmGroup(b.textContent)].push(b));
  const grp=[...WBSM_G.map(g=>[g[0],t(g[1])]),['more',t('wbsm.more')]].filter(g=>by[g[0]].length);
  const store=document.createElement('div');store.hidden=true;store.className='wbsmstore';
  Object.keys(by).forEach(k=>by[k].forEach(b=>{b.dataset.wbsmg=k}));bs.forEach(b=>store.append(b));
  p.innerHTML='';p.classList.add('wbsm');p.append(store);
  const main=document.createElement('div');main.className='wbsmmain';p.append(main);
  const ico={view:'👁',out:'⬇',frm:'▦',brd:'✎',more:'⋯'};
  by.top.forEach(b=>main.append(b));
  if(by.top.length)main.insertAdjacentHTML('beforeend','<hr>');
  grp.forEach(([k,n])=>{const r=document.createElement('button');r.className='wbsmrow';r.dataset.wbsm=k;r.innerHTML=`<span>${ico[k]} ${esc(n)}</span><i class="wbsmar">${document.documentElement.dir==='rtl'?'‹':'›'}</i><em>${by[k].length}</em>`;main.append(r)});
  const open=k=>{wbsmClose(p);main.querySelectorAll('.wbsmrow').forEach(r=>r.classList.toggle('on',r.dataset.wbsm===k));
    const s=document.createElement('div');s.className='wbsmsub';s.dataset.k=k;
    if(wbsmMob()){s.innerHTML=`<button class="wbsmback">${document.documentElement.dir==='rtl'?'›':'‹'} ${esc(t('wbsm.back'))}</button><div class="wbsmh">${esc((grp.find(g=>g[0]===k)||[])[1]||'')}</div>`;main.hidden=true}
    by[k].forEach(b=>s.append(b));p.append(s);WBSM.sub=s;
    const bk=s.querySelector('.wbsmback');if(bk)bk.onclick=e=>{e.stopPropagation();wbsmClose(p);main.hidden=false;wbsmFit(p,btn)};
    if(wbsmMob())wbsmFit(p,btn);else wbsmPlace(p,s)};
  main.querySelectorAll('.wbsmrow').forEach(r=>{r.onclick=e=>{e.stopPropagation();if(WBSM.sub&&WBSM.sub.dataset.k===r.dataset.wbsm&&!wbsmMob()){wbsmClose(p);r.classList.remove('on');return}open(r.dataset.wbsm)};
    if(!wbsmMob())r.onmouseenter=()=>{clearTimeout(WBSM.ht);WBSM.ht=setTimeout(()=>{if(p.isConnected&&!(WBSM.sub&&WBSM.sub.dataset.k===r.dataset.wbsm))open(r.dataset.wbsm)},180)}});
  wbsmFit(p,btn)}
function wbsmClose(p){(p||document).querySelectorAll('.wbsmsub').forEach(s=>{const st=p&&p.querySelector('.wbsmstore');s.querySelectorAll('button[data-i]').forEach(b=>st&&st.append(b));s.remove()});WBSM.sub=null}
function wbsmFit(p,btn){p.style.maxHeight='';p.style.overflowY='';p.style.top='';p.style.bottom='';try{wbPopFit(p,btn,false)}catch(e){}
  if(!wbsmMob())p.style.overflow='visible'}
/* the group opens beside the main menu, on the side with room, kept inside the window (screen px ÷ the interface zoom) */
function wbsmPlace(p,s){const z=uiZoom()||1,W=innerWidth/z,H=innerHeight/z,pr=p.getBoundingClientRect(),L=pr.left/z,R=pr.right/z,T=pr.top/z;
  s.style.maxHeight=(H-16)+'px';const sw=s.offsetWidth,sh=Math.min(s.scrollHeight,H-16);
  const rtl=document.documentElement.dir==='rtl';let x=rtl?L-sw+4:R-4;if(x<8||x+sw>W-8)x=rtl?R-4:L-sw+4;x=Math.max(8,Math.min(W-sw-8,x));
  const row=p.querySelector('.wbsmrow.on'),ry=row?row.getBoundingClientRect().top/z:T;let y=Math.max(8,Math.min(H-sh-8,ry-6));
  s.style.left=(x-L)+'px';s.style.top=(y-T)+'px'}
{const _m=wbMenu;wbMenu=function(btn,items,...a){const r=_m(btn,items,...a);
  try{if(btn&&btn.id==='wbMore'&&S.settings.wbFlatMenu!==true){const p=$('#ppPop');if(p&&p.classList.contains('wbmenu'))wbsmBuild(p,btn)}}catch(e){console.error(e)}return r}}
/* his report 2026-11-04 «the scrollbar on the left of the list is ugly»: Thabat's own lists scroll without a bar, with soft fades at the edge that has more */
function rpkFade(l){if(!l)return;const top=l.scrollTop>2,bot=l.scrollTop+l.clientHeight<l.scrollHeight-2;l.classList.toggle('rpkft',top);l.classList.toggle('rpkfb',bot)}
document.addEventListener('scroll',e=>{const l=e.target;if(l&&l.classList&&l.classList.contains('rpkl'))rpkFade(l)},true);
{hookFn('rpkPaint',()=>rpkPaint,f=>{rpkPaint=f},'post',function(){const l=RPK.el&&RPK.el.querySelector('.rpkl');if(!l)return;if(!l._rpkf){l._rpkf=1;new ResizeObserver(()=>rpkFade(l)).observe(l)}rpkFade(l);setTimeout(()=>rpkFade(l),60)})}
/* his report 2026-11-04 «in the two-months view the months are not level»: the second month's title took ~50 px above its grid.
   The title now sits in the gap above, and the box is moved so both grids start at the same height. */
function cal2Level(){const b=$('#cal2Box'),c=$('#cal'),c2=b&&b.querySelector('.cal2');if(!b||!c2||!c||!S.settings.cal2||MOB.matches)return;
  const z=uiZoom()||1;b.style.marginTop='0px';const d=(c.getBoundingClientRect().top-c2.getBoundingClientRect().top)/z;if(Math.abs(d)>1)b.style.marginTop=Math.round(d)+'px'}
{hookFn('renderCal',()=>renderCal,f=>{renderCal=f},'post',function(){setTimeout(cal2Level,0);setTimeout(cal2Level,350)});addEventListener('resize',()=>{clearTimeout(window._c2l);window._c2l=setTimeout(cal2Level,120)})}
