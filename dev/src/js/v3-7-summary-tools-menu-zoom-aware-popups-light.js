/* ============ v3.7: summary tools menu, zoom-aware popups, light glass for phones ============ */
/* popups: positions are in zoomed CSS px when the interface size setting is not 100% */
const uiZoom=()=>parseFloat(document.body.style.zoom)||1;
ppFit=function(p,x,y){if(!p||!p.isConnected)return;const z=uiZoom(),W=innerWidth/z,H=innerHeight/z;x/=z;y/=z;p.style.maxHeight='';const w=p.offsetWidth;let h=p.offsetHeight;
  if(h>H-16){p.style.maxHeight=(H-16)+'px';p.style.overflowY='auto';h=H-16}
  let top=y+16;if(top+h>H-8){top=y-h-16;if(top<8)top=Math.max(8,H-h-8)}
  p.style.left=Math.max(8,Math.min(W-w-8,x-w/2))+'px';p.style.top=top+'px'};
/* summary: one «tools» button opens a grouped menu; each tool says what it does */
const BT_GROUPS=[['share',['stBtn','frBtn','bPdf']],['review',['rvBtn','mrBtn']],['goals',['bdBtn','glBtn','ygBtn']],['ibada',['pmBtn','hhBtn']]];
const BT_INFO={stBtn:'bt.st',frBtn:'bt.fr',bPdf:'bt.pdf',rvBtn:'bt.rv',mrBtn:'bt.mr',bdBtn:'bt.bd',glBtn:'bt.gl',ygBtn:'bt.yg',pmBtn:'bt.pm',hhBtn:'bt.hh'};
function btPanel(){const ctl=$('#v-brief .bctl');if(!ctl)return null;let tb=$('#btTools');
  if(!tb){ctl.insertAdjacentHTML('afterbegin',`<button class="btn sm" id="btTools" aria-expanded="false"><span>🧰 ${t('bt.t')}</span><i class="btchev">▾</i></button><div class="btpanel card" id="btPanel" hidden>${[...BT_GROUPS.map(g=>g[0]),'more'].map(g=>`<div class="btgrp" data-g="${g}"><b>${t('bt.g.'+g)}</b><div class="btlist"></div></div>`).join('')}</div>`);
    tb=$('#btTools');tb.onclick=e=>{e.stopPropagation();btToggle()};document.body.append($('#btPanel'))}
  return $('#btPanel')}
function btSort(){const ctl=$('#v-brief .bctl'),P=btPanel();if(!ctl||!P)return;
  [...ctl.querySelectorAll(':scope>button:not(#btTools)'),...P.querySelectorAll('.btlist>button')].forEach(b=>{const g=(BT_GROUPS.find(x=>x[1].includes(b.id))||['more'])[0],list=P.querySelector(`.btgrp[data-g="${g}"] .btlist`);
    if(b.parentElement!==list)list.append(b);if(!b.dataset.btd){b.dataset.btd=1;b.classList.add('btitem');if(b.id==='stBtn'&&b.textContent.trim()==='📸')b.insertAdjacentHTML('beforeend',' '+esc(t('st3.t')));const k=BT_INFO[b.id];if(k)b.insertAdjacentHTML('beforeend',`<small>${esc(t(k))}</small>`)}});
  const ord=id=>{for(const [,ids] of BT_GROUPS){const i=ids.indexOf(id);if(i>=0)return i}return 99};
  P.querySelectorAll('.btlist').forEach(l=>{[...l.children].sort((a,b)=>ord(a.id)-ord(b.id)).forEach(x=>l.append(x))});
  P.querySelectorAll('.btgrp').forEach(g=>g.hidden=!g.querySelector('.btlist>button'))}
function btToggle(on){const P=$('#btPanel'),tb=$('#btTools');if(!P||!tb)return;on=on==null?P.hidden:on;P.hidden=!on;tb.setAttribute('aria-expanded',on);tb.classList.toggle('on',on);if(!on)return;
  const z=uiZoom(),r=tb.getBoundingClientRect(),W=innerWidth/z,H=innerHeight/z,w=P.offsetWidth;let left=(document.documentElement.dir==='rtl'?r.right/z-w:r.left/z);left=Math.max(8,Math.min(W-w-8,left));
  let top=r.bottom/z+8;P.style.maxHeight=Math.max(200,H-top-12)+'px';P.style.left=left+'px';P.style.top=top+'px'}
document.addEventListener('mousedown',e=>{const P=$('#btPanel');if(P&&!P.hidden&&!P.contains(e.target)&&!e.target.closest('#btTools'))btToggle(false)},true);
document.addEventListener('touchstart',e=>{const P=$('#btPanel');if(P&&!P.hidden&&!P.contains(e.target)&&!e.target.closest('#btTools'))btToggle(false)},{capture:true,passive:true});
document.addEventListener('keydown',e=>{if(e.key==='Escape')btToggle(false)});
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#btPanel .btitem');if(b)setTimeout(()=>btToggle(false),0)},true);
{const _rb=renderBrief;renderBrief=function(){_rb();try{btSort()}catch(e){console.error(e)}}}
{const _sv=showView;showView=function(...a){try{btToggle(false)}catch(e){}return _sv(...a)}}
window.addEventListener('resize',()=>{const P=$('#btPanel');if(P&&!P.hidden)btToggle(true)});
/* light glass: on phones in automatic performance mode, keep the moving lights without live blur */
function lgApply(){const st=S.settings;document.documentElement.classList.toggle('lg',st.style==='glass'&&isLite()&&perfGet()==='auto')}
{const _at=applyTheme;applyTheme=function(...a){const r=_at(...a);try{lgApply()}catch(e){}return r}}
try{lgApply()}catch(e){}

/* the interface size setting zooms the body; keep the app exactly as tall as the window */
function uizSync(){document.documentElement.style.setProperty('--uiz',uiZoom())}
{const _at2=applyTheme;applyTheme=function(...a){const r=_at2(...a);try{uizSync()}catch(e){}return r}}
{const _al=applyLook2;applyLook2=function(...a){const r=_al(...a);try{uizSync();pcFit()}catch(e){}return r}}
try{uizSync()}catch(e){}
/* Android: the old automatic +32px bottom lift is not needed where the native insets are measured */
function andLiftMigrate(){const N=window.ANDNAV;if(!ANDROID||S.migrAnd0||+S.settings.andOff!==32||!N)return false;if(!((+N.nb||0)>0||(+N.fix||0)>0))return false;S.settings.andOff=0;S.migrAnd0=1;save();andOffApply();return true}
if(ANDROID){let n=0;const iv=setInterval(()=>{if(andLiftMigrate()||++n>20)clearInterval(iv)},1500)}
/* ---- phone calendar sky: stars and moons spread evenly over the whole calendar, never on a day's number, percentage or icons ---- */
{const _pcs=placeCalSky;placeCalSky=function(){if(!MOB.matches)return _pcs();const wrap=$('#calSkyWrap'),sky=$('#calSky');if(!sky)return;if(overBricks()){sky.innerHTML='';return}if(!wrap||!wrap.offsetParent)return;
  const W=wrap.clientWidth,H=wrap.clientHeight;if(!W||!H)return;const wr=wrap.getBoundingClientRect(),tk=todayKey(),y=calM.getFullYear(),m=calM.getMonth(),last=new Date(y,m+1,0).getDate();
  const forb=[],pad=(b,p)=>forb.push([b.left-wr.left-p,b.top-wr.top-p,b.right-wr.left+p,b.bottom-wr.top+p]);
  $$('#cal .dow').forEach(e=>pad(e.getBoundingClientRect(),1));
  $$('#cal .cell').forEach(cell=>{const tw=document.createTreeWalker(cell,NodeFilter.SHOW_TEXT);let n;while((n=tw.nextNode())){if(!n.textContent.trim())continue;const r=document.createRange();r.selectNodeContents(n);for(const b of r.getClientRects())if(b.width)pad(b,3)}
    cell.querySelectorAll('svg,img').forEach(e=>{const b=e.getBoundingClientRect();if(b.width)pad(b,3)})});
  const pools={},pool=c=>{if(pools[c])return pools[c];const P=[];for(let yy=c;yy<=H-c;yy+=4)for(let x=c;x<=W-c;x+=4)if(!forb.some(r=>x>r[0]-c&&x<r[2]+c&&yy>r[1]-c&&yy<r[3]+c))P.push([x,yy]);return pools[c]=P};
  const items=[];for(let d=1;d<=last;d++){const k=dKey(new Date(y,m,d));if(k>tk||!S.days[k])continue;const {tot}=totals(k),q=skyOf(tot,goalMs(k));if(q.stars<1)continue;const tip=t('sky.tip',gStr(keyToDate(k)),fmtHM(tot));
    if(q.mp>=0)items.push({k,tip,moon:true,mp:q.mp,sz:q.mp===8?13:12});for(let i=0;i<q.stars;i++)items.push({k,tip,sz:5+((d*7+i*13)%6)/2.4})}
  items.sort((a,b)=>(b.moon?1:0)-(a.moon?1:0));
  const R=rng('calsky'+y+'-'+m),taken=[];let h='';
  for(const it of items){const P=pool(Math.ceil(it.sz/2)+1);if(!P.length)continue;let best=null,bd=-Infinity;
    for(let i=0;i<32;i++){const q=P[Math.floor(R()*P.length)];let d=Infinity;for(const o of taken){const v=Math.hypot(o[0]-q[0],o[1]-q[1])-(o[2]+it.sz)/2;if(v<d)d=v}if(d===Infinity)d=R()*1e3;if(d>bd){bd=d;best=q}}
    if(!best)continue;taken.push([best[0],best[1],it.sz]);const cls=it.moon?'csm'+(it.mp===8?' full':''):'cst',svg=it.moon?moonSVG(it.mp):STAR_SVG;
    h+=`<i class="${cls}" data-k="${it.k}" title="${esc(it.tip)}" style="left:${best[0]}px;top:${best[1]}px;--sz:${it.sz.toFixed(1)}px;--sd:${(20+R()*30).toFixed(1)}s;--dr:${R()<.5?'normal':'reverse'};--sa:${(.7+R()*.3).toFixed(2)}">${svg}</i>`}
  sky.innerHTML=h;$$('#calSky [data-k]').forEach(e=>e.onclick=()=>{selKey=e.dataset.k;renderCal()})}}

/* ---- «your day between the prayers» bar for any day in the calendar panel; labels of close prayers no longer overlap ---- */
function dtlLabels(box){const ps=box&&box.querySelectorAll('.pts span');if(!ps||!ps.length)return;const L_=[...ps].map(s=>({s,r:s.getBoundingClientRect()})).sort((a,b)=>a.r.left-b.r.left);let lo=false;
  for(let i=1;i<L_.length;i++){const p=L_[i-1],c=L_[i];if(!p.s.classList.contains('lo')&&c.r.left<p.r.right+4){c.s.classList.add('lo');lo=true}}box.classList.toggle('dtl2',lo)}
{const _r=renderDayTL;renderDayTL=function(){_r();try{dtlLabels($('#dayTL'))}catch(e){}}}
function dayTLFor(k,box){const real=$('#dayTL'),tk=todayKey;if(real)real.id='dayTL__real';box.id='dayTL';try{todayKey=()=>k;renderDayTL()}catch(e){console.error(e)}finally{todayKey=tk;box.removeAttribute('id');if(real)real.id='dayTL'}}
{const _rd=renderDetail;renderDetail=function(k){_rd(k);try{if(k>todayKey())return;const mb=$('#detail .minibar');if(!mb)return;const b=document.createElement('div');b.className='dtl dtlcal';mb.after(b);dayTLFor(k,b)}catch(e){console.error(e)}}}

