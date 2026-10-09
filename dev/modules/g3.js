/* ============ v3.6.2: pages read count toward the wird, show inside the day's Quran info; phone calendar sky ============ */
/* every newly read page counts toward today's wird; the khatma still only moves when the page is the next one */
qReadMark=function(pages){const q=qDay(todayKey());q.pgs=q.pgs||[];const nw=pages.filter(p=>!q.pgs.includes(p)).sort((a,b)=>a-b);if(!nw.length)return;
  q.pgs=[...q.pgs,...nw].sort((a,b)=>a-b);const Q=S.quran,was=qWirdDone(q);
  nw.forEach(p=>{if(qCovered(Q.page)<604&&qNextPage(Q.page)===p)qSetPage(p);else q.read=(q.read||0)+1});
  if(!was&&qWirdDone(q))chimeSoft(1175);save();renderQAll();qrdUi()};
/* the calendar day panel: pages read sit inside the day's Quran section */
{const _rd=renderDetail;renderDetail=function(k){_rd(k);try{const sec=$('#detail .qrdsec');if(!sec)return;const l=qPgsLine(k);const qs=[...$$('#detail .sec')].find(s=>{const b=s.querySelector(':scope>b');return b&&b.textContent.trim()===t('d.quran')});
  if(qs){const ul=qs.querySelector('ul');if(ul){ul.insertAdjacentHTML('beforeend',`<li>📖 ${t('rd.day')} <span class="end">${l}</span></li>`);sec.remove()}}}catch(e){console.error(e)}}}
/* phone calendar: stars and moon sit on the edges of their own day, so the crescent and the moon fit */
{const _pcs=placeCalSky;placeCalSky=function(){if(!MOB.matches)return _pcs();const wrap=$('#calSkyWrap'),sky=$('#calSky');if(!sky)return;if(overBricks()){sky.innerHTML='';return}if(!wrap||!wrap.offsetParent)return;
  const W=wrap.clientWidth,H=wrap.clientHeight;if(!W||!H)return;const wr=wrap.getBoundingClientRect(),INS=7,step=2,tk=todayKey(),y=calM.getFullYear(),m=calM.getMonth(),last=new Date(y,m+1,0).getDate();
  const box=el=>{const r=el.getBoundingClientRect();return[r.left-wr.left,r.top-wr.top,r.right-wr.left,r.bottom-wr.top]};
  const solid=[...$$('#cal .dow').map(box),...$$('#cal .cell').map(c=>{const b=box(c);return[b[0]+INS,b[1]+INS,b[2]-INS,b[3]-INS]})];
  const okAt=(x,yy,c)=>x>=c&&x<=W-c&&yy>=c&&yy<=H-c&&!solid.some(r=>x>r[0]-c&&x<r[2]+c&&yy>r[1]-c&&yy<r[3]+c);
  const taken=[];let h='';
  const put=(R,cr,sz,k,cls,svg,tip)=>{const c=sz/2,pts=[];for(let yy=cr[1]-10;yy<=cr[3]+10;yy+=step)for(let x=cr[0]-10;x<=cr[2]+10;x+=step)if(okAt(x,yy,c*.5))pts.push([x,yy]);
    for(let tr=0;tr<60&&pts.length;tr++){const q=pts[Math.floor(R()*pts.length)];if(taken.some(o=>Math.hypot(o[0]-q[0],o[1]-q[1])<(o[2]+sz)/2+1))continue;taken.push([q[0],q[1],sz]);
      h+=`<i class="${cls}" data-k="${k}" title="${esc(tip)}" style="left:${q[0]}px;top:${q[1]}px;--sz:${sz}px;--sd:${(20+R()*30).toFixed(1)}s;--dr:${R()<.5?'normal':'reverse'};--sa:${(.7+R()*.3).toFixed(2)}">${svg}</i>`;return}};
  for(let d=1;d<=last;d++){const k=dKey(new Date(y,m,d));if(k>tk||!S.days[k])continue;const {tot}=totals(k),q=skyOf(tot,goalMs(k));if(q.stars<1)continue;const cell=$(`#cal .cell[data-k="${k}"]`);if(!cell)continue;
    const cr=box(cell),R=rng('calm'+k),tip=t('sky.tip',gStr(keyToDate(k)),fmtHM(tot));
    if(q.mp>=0)put(R,cr,q.mp===8?13:12,k,'csm'+(q.mp===8?' full':''),moonSVG(q.mp),tip);
    for(let i=0;i<q.stars;i++)put(R,cr,+(5+R()*2.5).toFixed(1),k,'cst',STAR_SVG,tip)}
  sky.innerHTML=h;$$('#calSky [data-k]').forEach(e=>e.onclick=()=>{selKey=e.dataset.k;renderCal()})}}
