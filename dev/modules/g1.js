/* ============ v3.6: calmer layout — floating nav, page titles, Today header, grouped settings ============ */
/* ---- nav: the pages sit in a floating pill; settings is its own round button ---- */
{const nav=$('nav.side');if(nav&&!nav.querySelector('.navpill')){nav.classList.add('flt');const pill=document.createElement('div');pill.className='navpill card';const set=nav.querySelector('.navbtn[data-v=set]');
  nav.querySelectorAll('.navbtn').forEach(b=>{if(b!==set)pill.append(b)});const logo=nav.querySelector('.logo');if(logo)logo.after(pill);else nav.prepend(pill);
  if(set){set.classList.add('navset','card');const sp=set.querySelector('span');if(sp)set.title=sp.textContent}}}
/* ---- a small title at the top of every page ---- */
const PGT={today:'nav.today',quran:'nav.quran',cal:'nav.cal',brief:'nav.brief',boards:'nav.boards',set:'nav.set'};
function pgtEnsure(){for(const v in PGT){const sec=$('#v-'+v);if(!sec)continue;let h=sec.querySelector(':scope>.pgt');if(!h){h=document.createElement('h1');h.className='pgt';sec.prepend(h)}h.textContent=t(PGT[v]);if(sec.firstElementChild!==h)sec.prepend(h)}
  const ns=$('nav.side .navset');if(ns)ns.title=t('nav.set')}
/* ---- Today header: date card | next-prayer card, then the ayah of the day as its own card ---- */
function tdLayout(){const hd=$('#v-today .tdhd'),pr=$('#v-today .tdpr'),nl=$('#nextLine'),ps=$('#prayers');if(!hd||!pr)return;hd.classList.add('card');pr.classList.add('card');if(nl&&ps&&nl.nextElementSibling!==ps)pr.insertBefore(nl,ps);const ay=$('#aydBox');if(ay)ay.classList.add('card')}
/* ---- settings: a grouped list; a group opens its own cards ---- */
const SG_ICON={gen:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',look:'<circle cx="12" cy="12" r="9"/><path d="M12 3v18" /><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor"/>',
  prayer:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',quran:'<path d="M2 5h6a4 4 0 0 1 4 4v11a3 3 0 0 0-3-3H2zM22 5h-6a4 4 0 0 0-4 4v11a3 3 0 0 1 3-3h7z"/>',adh:'<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',
  goal:'<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M10 2h4"/>',health:'<path d="M20.8 5.6a5 5 0 0 0-7.1 0L12 7.3l-1.7-1.7a5 5 0 0 0-7.1 7.1L12 21.5l8.8-8.8a5 5 0 0 0 0-7.1z"/>',priv:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  backup:'<path d="M7 18a5 5 0 0 1-.6-10A6 6 0 0 1 18 9a4.5 4.5 0 0 1-.5 9z"/><path d="M12 12v6M9.5 14.5 12 12l2.5 2.5"/>',about:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',more:'<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>'};
const SETG=[[{k:'gen',c:'#8e8e93',cards:['set.lang','set.hijri']},{k:'look',c:'#6366f1',cards:['set.look']}],
  [{k:'prayer',c:'#22c55e',cards:['set.prayer']},{k:'adh',c:'#a855f7',cards:['set.adh']},{k:'quran',c:'#14b8a6',cards:['set.quran']}],
  [{k:'goal',c:'#ef4444',cards:['set.goalCats']},{k:'health',c:'#ec4899',cards:['hh3.set']}],
  [{k:'priv',c:'#3b82f6',cards:['set.privT']},{k:'backup',c:'#f59e0b',cards:['set.backup']},{k:'about',c:'#64748b',cards:['ab.t']}]];
const SG={cur:null};
setCards=function(){return $$('#v-set .card:not(.sgsec)')};
const sgKey=c=>{const h=c.querySelector('h3');return h?(h.dataset.i18n||h.textContent.trim()):''};
function sgAll(){const known=new Set(SETG.flat().flatMap(g=>g.cards)),extra=setCards().map(sgKey).filter(k=>k&&!known.has(k));return extra.length?[...SETG,[{k:'more',c:'#94a3b8',cards:extra}]]:SETG}
function sgCards(g){return setCards().filter(c=>g.cards.includes(sgKey(c)))}
function sgTitle(g){return g.k==='gen'?t('sg.gen'):g.k==='more'?t('sg.more'):(()=>{const c=sgCards(g)[0],h=c&&c.querySelector('h3');return h?h.textContent.replace('▾','').trim():g.k})()}
function sgSub(g){const L_=[];sgCards(g).forEach(c=>c.querySelectorAll('.field label').forEach(l=>{const s=l.textContent.trim();if(s&&L_.length<3&&!L_.includes(s))L_.push(s)}));return L_.join(LANG==='ar'?'، ':', ')}
function sgRender(){const v=$('#v-set'),set=v&&v.querySelector('.set');if(!set)return;let list=$('#sgList');if(!list){set.insertAdjacentHTML('beforebegin','<div class="sgl" id="sgList"></div><div class="sgbar" id="sgBar" hidden><button class="btn sm ghost" id="sgBack"></button><b></b></div>');list=$('#sgList');$('#sgBack').onclick=()=>{SG.cur=null;sgApply();$('main').scrollTop=0}}
  $('#sgBack').textContent=(document.documentElement.dir==='rtl'?'› ':'‹ ')+t('nav.set');
  list.innerHTML=sgAll().map(sec=>`<div class="sgsec card">${sec.filter(g=>sgCards(g).length).map(g=>`<button class="sgrow" data-g="${g.k}"><span class="sgic" style="--c:${g.c}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${SG_ICON[g.k]}</svg></span><span class="sgt"><b>${esc(sgTitle(g))}</b><small>${esc(sgSub(g))}</small></span><span class="sgch">‹</span></button>`).join('')}</div>`).join('');
  list.querySelectorAll('.sgsec').forEach(s=>{if(!s.children.length)s.remove()});
  list.querySelectorAll('[data-g]').forEach(b=>b.onclick=()=>{SG.cur=b.dataset.g;sgApply();$('main').scrollTop=0});sgApply()}
function sgApply(){const v=$('#v-set'),list=$('#sgList'),bar=$('#sgBar');if(!v||!list)return;const q=(($('#setQ')||{}).value||'').trim(),G=SG.cur&&sgAll().flat().find(g=>g.k===SG.cur),mode=q?'search':G?'group':'list';
  v.dataset.sg=mode;list.hidden=mode!=='list';bar.hidden=mode!=='group';if(G)bar.querySelector('b').textContent=sgTitle(G);
  setCards().forEach(c=>{const off=mode==='list'||(mode==='group'&&!G.cards.includes(sgKey(c)));c.classList.toggle('sgoff',off);if(mode==='group'&&!off)c.classList.remove('fold')})}
{const _a=applySetFold;applySetFold=function(){_a();try{sgApply()}catch(e){}}}
{const _r=renderSettings;renderSettings=function(){_r();try{sgRender()}catch(e){console.error(e)}}}
/* anything that scrolls to a setting opens its group first */
{const _siv=Element.prototype.scrollIntoView;Element.prototype.scrollIntoView=function(...a){try{const c=this.closest&&this.closest('#v-set .card:not(.sgsec)');if(c&&c.classList.contains('sgoff')){const k=sgKey(c),g=sgAll().flat().find(x=>x.cards.includes(k));if(g){SG.cur=g.k;sgApply()}}}catch(e){}return _siv.apply(this,a)}}
{const _sv=showView;showView=function(n,...a){const was=curView();if(n==='set'&&was!=='set')SG.cur=null;const r=_sv(n,...a);try{pgtEnsure();if(n==='today')tdLayout();if(n==='set')sgApply()}catch(e){console.error(e)}return r}}
{const _ai=applyI18n;applyI18n=function(){_ai();try{pgtEnsure()}catch(e){}}}
{const _rt=renderToday;renderToday=function(){_rt();try{tdLayout()}catch(e){}}}
try{pgtEnsure();tdLayout()}catch(e){console.error(e)}
