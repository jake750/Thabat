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
