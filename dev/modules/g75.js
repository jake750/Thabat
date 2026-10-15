/* ============ v3.63.0 Today on the PC: move cards by dragging (the others make room), balanced «three columns» layout ============ */
/* the columns that take cards: «cards» on a wide window = the two stacks + #uxCol3; «three columns» = the two stacks (the third is the details column) */
function tmvMode(){const h=document.documentElement;if(MOB.matches)return null;const v=tdl();if(v==='cards'&&h.classList.contains('wide3')&&$('#uxCol3'))return'cards';if(v==='cols'&&h.classList.contains('tdl-colsw'))return'cols';return null}
function tmvCols(m){m=m||tmvMode();if(!m)return null;const s=uxStacks();if(s.length<2)return null;return m==='cards'?[s[0],s[1],$('#uxCol3')]:[s[0],s[1]]}
function tmvCards(cols){return cols.flatMap(c=>[...c.children].filter(x=>x.classList.contains('card')))}
/* a card is known by its own id or the first id inside it (cardKey falls back to its index, which changes once cards move) */
function tmvKey(c){return c.id||(c.querySelector('[id]')||{}).id||cardKey(c)}
function tmvSaved(m){const P=S.settings.tdPlace;return P&&P[m]&&Array.isArray(P[m])?P[m]:null}
/* put the cards where the owner placed them; cards he never placed go to the shortest column */
function tmvApply(){const m=tmvMode(),cols=tmvCols(m);if(!cols)return;const P=tmvSaved(m);
  cols.forEach(s=>s.querySelectorAll(':scope>.card').forEach(c=>{if(c.dataset.uxp==null){c.dataset.uxp=uxStacks().indexOf(s);c.dataset.uxi=[...s.children].indexOf(c)}}));
  if(!P){if(m==='cols')tmvBalance(cols);return}
  const all=tmvCards(cols),by=new Map(all.map(c=>[tmvKey(c),c])),used=new Set();
  P.forEach((keys,i)=>{const col=cols[i];if(!col)return;keys.forEach(k=>{const c=by.get(k);if(c&&!used.has(c)){used.add(c);col.append(c)}})});
  all.filter(c=>!used.has(c)).forEach(c=>{let i=0;cols.forEach((s,j)=>{if(s.offsetHeight<cols[i].offsetHeight)i=j});cols[i].append(c)});
  all.forEach(c=>{c.style.order=''})}
/* «three columns» without a saved arrangement: the wall heads column 1, the tasks column 2, the rest tallest-first into the shorter one */
function tmvBalance(cols){const [a,b]=cols,all=tmvCards(cols);const wall=$('#v-today .glasswrap'),tasks=$('#tasks')&&$('#tasks').closest('.card');
  const rest=all.filter(c=>c!==wall&&c!==tasks),hs=new Map(rest.map(c=>[c,c.offsetHeight]));if(wall&&all.includes(wall))a.prepend(wall);if(tasks&&all.includes(tasks))b.prepend(tasks);
  const tmp=document.createDocumentFragment();rest.forEach(c=>tmp.append(c));const H=[a.offsetHeight,b.offsetHeight],gap=14;
  rest.sort((x,y)=>hs.get(y)-hs.get(x)).forEach(c=>{if(c.classList.contains('hhide')){a.append(c);return}const i=H[0]<=H[1]?0:1;cols[i].append(c);H[i]+=hs.get(c)+gap})}
function tmvAuto(){const m=tmvMode();if(S.settings.tdPlace){delete S.settings.tdPlace.cards;delete S.settings.tdPlace.cols}save();
  if(m==='cards')uxRebalance();else if(m==='cols')tmvBalance(tmvCols(m));try{homeApply()}catch(e){}toast(t('tmv.autoOk'))}
/* when leaving «three columns», cards moved between its two stacks go back to where they came from */
function tmvHome(){const S0=uxStacks();if(S0.length<2||$('#uxCol3'))return;S0.flatMap(s=>[...s.children]).forEach(c=>{const s=S0[+c.dataset.uxp];if(s&&c.parentNode!==s)s.append(c)});
  S0.forEach(s=>[...s.children].sort((x,y)=>(+x.dataset.uxi||0)-(+y.dataset.uxi||0)).forEach(c=>s.append(c)))}
{hookFn('uxBalance',()=>uxBalance,f=>{uxBalance=f},'post',function(){try{if(tmvSaved('cards'))tmvApply()}catch(e){}})}
{const _e=uxEvenCheck;uxEvenCheck=function(...a){if(tmvSaved('cards'))return;return _e(...a)}}
{hookFn('homeApply',()=>homeApply,f=>{homeApply=f},'post',function(){try{const m=tmvMode();if(m&&tmvSaved(m))tmvCards(tmvCols(m)).forEach(c=>{c.style.order=''})}catch(e){}})}
{const TMV_L={v:null};hookFn('tdlApply',()=>tdlApply,f=>{tdlApply=f},'post',function(){try{const v=tdl();if(TMV_L.v==='cols'&&v!=='cols')tmvHome();TMV_L.v=v;if(v==='cols'){if($('#uxCol3'))uxUnbalance();tdsRender();setTimeout(tmvApply,60)}tmvGrips()}catch(e){}})}
/* «three columns»: keep the two card columns even after Today redraws (like the cards layout) */
function tmvEven(){if(tmvMode()!=='cols'||tmvSaved('cols')||TMV.d)return;const a=document.activeElement;if(a&&a.closest&&a.closest('#v-today .grid')&&(/INPUT|TEXTAREA/.test(a.tagName)||a.isContentEditable))return;
  const hs=tmvCols().map(s=>s.offsetHeight);if(Math.abs(hs[0]-hs[1])>260&&Date.now()-(tmvEven.at||0)>4000){tmvEven.at=Date.now();tmvBalance(tmvCols())}}
{hookFn('renderToday',()=>renderToday,f=>{renderToday=f},'post',function(){clearTimeout(tmvEven.t);tmvEven.t=setTimeout(()=>{try{if(tmvMode()==='cols'&&tmvSaved('cols'))tmvApply();tmvEven();tmvGrips()}catch(e){}},750)})}
setTimeout(()=>{try{if(tmvMode()==='cols')tmvApply();tmvGrips()}catch(e){}},2600);
addEventListener('resize',()=>{clearTimeout(tmvGrips.rt);tmvGrips.rt=setTimeout(()=>{try{tmvGrips();if(tmvMode()==='cols')tmvApply()}catch(e){}},400)});

/* ---- dragging: hold the ⠿ on top of a card (or its title area) and move it; the other cards slide out of the way ---- */
const TMV={d:null};
function tmvGrips(){const cols=tmvCols();document.documentElement.classList.toggle('tmv-on',!!cols);if(!cols)return;
  tmvCards(cols).forEach(c=>{if(c.querySelector(':scope>.tmvgrip'))return;const g=document.createElement('button');g.type='button';g.className='tmvgrip';g.title=t('tmv.grip');g.setAttribute('aria-label',t('tmv.grip'));g.innerHTML='<svg viewBox="0 0 24 10" aria-hidden="true"><circle cx="6" cy="3" r="1.6"/><circle cx="12" cy="3" r="1.6"/><circle cx="18" cy="3" r="1.6"/><circle cx="6" cy="8" r="1.6"/><circle cx="12" cy="8" r="1.6"/><circle cx="18" cy="8" r="1.6"/></svg>';c.prepend(g)})}
function tmvTarget(cols,x,y,me){let best=null,bd=1e9;cols.forEach(col=>{const r=col.getBoundingClientRect();const d=x<r.left?r.left-x:x>r.right?x-r.right:0;if(d<bd){bd=d;best=col}});
  const kids=[...best.children].filter(c=>c!==me&&c.classList.contains('card')&&c.offsetParent!==null);const nx=kids.find(c=>{const r=c.getBoundingClientRect();return r.top+r.height/2>y});return{col:best,before:nx||null}}
function tmvFlip(cols,fn){const els=tmvCards(cols).filter(c=>c!==TMV.d.card),z=uiZoom()||1,r0=new Map(els.map(c=>[c,c.getBoundingClientRect()]));fn();
  els.forEach(c=>{const a=r0.get(c),b=c.getBoundingClientRect(),dx=(a.left-b.left)/z,dy=(a.top-b.top)/z;if(Math.abs(dx)<1&&Math.abs(dy)<1)return;try{c.animate([{transform:`translate(${dx}px,${dy}px)`},{transform:'none'}],{duration:200,easing:'cubic-bezier(.2,.7,.3,1)'})}catch(e){}})}
function tmvScroller(el){let s=el;while(s&&s!==document.body&&s!==document.documentElement){const o=getComputedStyle(s).overflowY;if(/(auto|scroll)/.test(o)&&s.scrollHeight>s.clientHeight+4)return s;s=s.parentElement}return document.scrollingElement}
function tmvStart(card,e){const cols=tmvCols();if(!cols)return;const z=uiZoom()||1,r=card.getBoundingClientRect();
  const gh=card.cloneNode(true);gh.querySelectorAll('[id]').forEach(n=>n.removeAttribute('id'));gh.removeAttribute('id');gh.classList.add('tmvghost');gh.style.width=(r.width/z)+'px';gh.style.height=(r.height/z)+'px';
  gh.style.left=(r.left/z)+'px';gh.style.top=(r.top/z)+'px';document.body.append(gh);card.classList.add('tmvhole');document.documentElement.classList.add('tmv-drag');
  TMV.d={card,cols,gh,ox:e.clientX-r.left,oy:e.clientY-r.top,x:e.clientX,y:e.clientY,sc:tmvScroller(card.parentElement),from:card.parentElement,next:card.nextElementSibling};
  TMV.d.iv=setInterval(()=>{const d=TMV.d;if(!d)return;const H=innerHeight,edge=70;let v=0;if(d.y<edge)v=-(edge-d.y)/3;else if(d.y>H-edge)v=(d.y-(H-edge))/3;if(v){d.sc.scrollBy(0,v);tmvMove(d.x,d.y)}},16)}
function tmvMove(x,y){const d=TMV.d;if(!d)return;d.x=x;d.y=y;const z=uiZoom()||1;d.gh.style.left=((x-d.ox)/z)+'px';d.gh.style.top=((y-d.oy)/z)+'px';
  const tg=tmvTarget(d.cols,x,y,d.card);if(tg.col===d.card.parentElement&&(tg.before===d.card.nextElementSibling||tg.before===d.card))return;
  tmvFlip(d.cols,()=>{tg.before?tg.col.insertBefore(d.card,tg.before):tg.col.append(d.card)})}
function tmvEnd(cancel){const d=TMV.d;if(!d)return;clearInterval(d.iv);TMV.d=null;d.gh.remove();d.card.classList.remove('tmvhole');document.documentElement.classList.remove('tmv-drag');
  if(cancel){d.next&&d.next.parentNode===d.from?d.from.insertBefore(d.card,d.next):d.from.append(d.card);return}
  const m=tmvMode();if(!m)return;const P=S.settings.tdPlace||(S.settings.tdPlace={});P[m]=d.cols.map(col=>[...col.children].filter(c=>c.classList.contains('card')).map(tmvKey));
  tmvCards(d.cols).forEach(c=>{c.style.order=''});save();try{d.card.animate([{transform:'scale(1.02)'},{transform:'none'}],{duration:180})}catch(e){}
  if(!tmvEnd.told||Date.now()-tmvEnd.told>60000){tmvEnd.told=Date.now();toastAct(t('tmv.saved'),t('tmv.auto'),tmvAuto,6000)}}
document.addEventListener('pointerdown',e=>{if(e.button!==0||TMV.d)return;const cols=tmvCols();if(!cols)return;const card=e.target.closest('.card');if(!card||!cols.includes(card.parentElement))return;
  const onGrip=!!e.target.closest('.tmvgrip');if(!onGrip){if(e.target.closest('button,input,textarea,select,a,label,[contenteditable],.task,li,canvas,svg,[draggable="true"],.chip'))return;const r=card.getBoundingClientRect(),z=uiZoom()||1;if(e.clientY-r.top>52*z)return}
  const sx=e.clientX,sy=e.clientY;let on=false;
  const off=()=>{removeEventListener('pointermove',mv,true);removeEventListener('pointerup',up,true);removeEventListener('pointercancel',up,true);removeEventListener('keydown',kd,true)};
  const mv=ev=>{if(!on){if(Math.hypot(ev.clientX-sx,ev.clientY-sy)<6)return;on=true;try{getSelection().removeAllRanges()}catch(x){}tmvStart(card,{clientX:sx,clientY:sy})}ev.preventDefault();tmvMove(ev.clientX,ev.clientY)};
  const up=ev=>{off();if(on){tmvEnd(ev.type==='pointercancel');const sw=c=>{c.stopPropagation();c.preventDefault();removeEventListener('click',sw,true)};addEventListener('click',sw,true);setTimeout(()=>removeEventListener('click',sw,true),50)}};
  const kd=ev=>{if(ev.key==='Escape'&&on){ev.preventDefault();off();tmvEnd(true)}};
  addEventListener('pointermove',mv,true);addEventListener('pointerup',up,true);addEventListener('pointercancel',up,true);addEventListener('keydown',kd,true)},true);
/* Ctrl+K: back to the automatic arrangement */
{const _cc=cmdCommands;cmdCommands=function(){const L_=_cc();L_.push({icon:'⊞',label:t('tmv.auto'),run:()=>{showView('today');tmvAuto()},kw:'arrange cards auto balance توزيع ترتيب البطاقات'});return L_}}
