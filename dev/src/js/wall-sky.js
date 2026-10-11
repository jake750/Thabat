/* ============ wall & sky ============ */
const BRICK=15*6e4;
function rng(seed){let h=2166136261>>>0;for(const c of String(seed)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return()=>{h=(h+0x6D2B79F5)|0;let x=h;x=Math.imul(x^x>>>15,x|1);x^=x+Math.imul(x^x>>>7,x|61);return((x^x>>>14)>>>0)/4294967296}}
const clk=ts=>{const d=new Date(ts);return pad(d.getHours())+':'+pad(d.getMinutes())};
function timeline(k){const d=S.days[k],segs=[];if(d)[...d.sessions].sort((a,b)=>a.start-b.start).forEach(x=>{if(x.end>x.start)segs.push({cat:x.cat,ms:x.end-x.start,t0:x.start})});
  const T=S.timer;if(T.mode==='work'&&T.start){let st=T.start;const now=Date.now();while(st<now){const b=Math.min(now,dayBoundaryAfter(st));if(keyOf(st)===k)segs.push({cat:T.cat,ms:b-st,t0:st});st=b}}
  return segs}
/* stars: 1 per 15 min over goal (max 16 = 4h); moon phase mp 0..8 every 30 min after 4h (8 = full moon at +8h) */
function skyOf(tot,g){const oh=Math.max(0,tot-g)/36e5;return{oh,stars:Math.min(16,Math.floor(oh*4+1e-9)),mp:oh>=4?Math.min(8,Math.floor((oh-4)*2+1e-9)):-1}}
function wallRows(g){const total=Math.max(1,Math.round(g/BRICK)),rows=[];let used=0,r=0;
  while(used<total){const rem=Math.min(4,total-used),off=r%2===1;rows.push(off?[.5,...Array(rem-1).fill(1),.5]:Array(rem).fill(1));used+=rem;r++}return rows}
let wallLast=null;
function overBricks(){return!!S.settings.overBricks}
function wallHTML(k,g){const segs=timeline(k),g0=g;{const T_=segs.reduce((a,x)=>a+x.ms,0);if(overBricks()&&T_>g)g=Math.ceil(T_/BRICK)*BRICK}const rows=wallRows(g),dir=document.documentElement.dir==='rtl'?'left':'right';
  let pos=0,idx=0,fullN=0;const out=[];
  rows.forEach(pcs=>{let h='';pcs.forEach(w=>{const a=pos*BRICK,b=(pos+w)*BRICK,len=b-a;pos+=w;let cum=0;const stops=[],tip=[];
      for(const sg of segs){const s0=cum,s1=cum+sg.ms;cum=s1;const x0=Math.max(a,s0),x1=Math.min(b,s1);
        if(x1>x0){const c=catOf(sg.cat);stops.push(`${c.color} ${((x0-a)/len*100).toFixed(2)}% ${((x1-a)/len*100).toFixed(2)}%`);tip.push(catName(c)+' '+clk(sg.t0+(x0-s0))+'–'+clk(sg.t0+(x1-s0)))}}
      const f=Math.max(0,Math.min(1,(cum-a)/len));if(stops.length&&f<1)stops.push(`transparent ${(f*100).toFixed(2)}%`);
      const cls=f>=.9999?'full':f>0?'cur':'';if(cls==='full')fullN=idx+1;
      h+=`<i class="brick ${cls}${w<1?' half':''}${a>=g0?' xb':''}" data-i="${idx}" style="${stops.length?`background-image:linear-gradient(to ${dir},${stops.join(',')})`:''}" title="${esc(tip.length?tip.join('\n'):t('wall.empty',fmtHM(len)))}"></i>`;idx++});
    out.push(`<div class="wrow">${h}</div>`)});
  return{html:out.join(''),rows:rows.length,fullN}}
function renderWall(k,tot,g){const{html,rows,fullN}=wallHTML(k,g);
  const wl=$('#wall');wl.style.setProperty('--rows',rows);wl.innerHTML=html;
  if(wallLast&&wallLast.k===k&&fullN>wallLast.n)for(let i=wallLast.n;i<fullN;i++){const e=wl.querySelector(`[data-i="${i}"]`);if(e)e.classList.add('lay')}
  wallLast={k,n:fullN};wallGlow()}
const STAR_SVG='<svg viewBox="-10 -10 20 20"><path d="M0-10C1 -3 3-1 10 0 3 1 1 3 0 10-1 3-3 1-10 0-3-1-1-3 0-10Z"/></svg>';
function cresPath(f,R=20,c=22){if(f>=1)return`<circle cx="${c}" cy="${c}" r="${R}"/>`;const dx=2*R*f,xi=(c-dx/2).toFixed(2),h=Math.sqrt(R*R-dx*dx/4),y1=(c-h).toFixed(2),y2=(c+h).toFixed(2);return`<path d="M${xi} ${y1}A${R} ${R} 0 1 1 ${xi} ${y2}A${R} ${R} 0 0 0 ${xi} ${y1}Z"/>`}
function moonSVG(mp){const f=.14+.86*(mp/8);return`<svg viewBox="0 0 44 44"><circle cx="22" cy="22" r="20" opacity=".07"/>${cresPath(f)}</svg>`}
let skyLast=null;
function qGlow(k){const q=S.days[k]&&S.days[k].quran;if(!q)return 0;return(qWirdDone(q)?1:0)+(q.hifz?1:0)+(q.review?1:0)}
function wallGlow(){const w=$('#wall');if(!w)return;const n=qGlow(todayKey());[1,2,3].forEach(i=>w.classList.toggle('q'+i,n===i))}
function skyPts(k){const R=rng('sky'+k),pts=[];
  for(let i=0;i<16;i++){let best=null,bd=-1;for(let j=0;j<24;j++){const x=4+R()*88,y=8+R()*80;if((document.documentElement.dir==='rtl'?x<30:x>70)&&y<55)continue;const d=Math.min(99,...pts.map(q=>Math.hypot((q[0]-x)*2.6,q[1]-y)));if(d>bd){bd=d;best=[x,y]}}pts.push(best)}return pts}
function skyStarCss(k,i,pts){const R2=rng('st'+k+i),sz=(6+R2()*6).toFixed(1);return`left:${pts[i][0]}%;top:${pts[i][1]}%;--sz:${sz}px;--sd:${(18+R2()*26).toFixed(1)}s;--dr:${R2()<.5?'normal':'reverse'};--sa:${(.65+R2()*.35).toFixed(2)}`}
function sceneHTML(k,big){const{tot}=totals(k),g=goalMs(k),{stars,mp}=overBricks()?{stars:0,mp:-1}:skyOf(tot,g),w=wallHTML(k,g),pts=stars?skyPts(k):[],q=qGlow(k);let st='';for(let i=0;i<stars;i++)st+=`<i class="skyst" style="${skyStarCss(k,i,pts)}">${STAR_SVG}</i>`;
  return`<div class="gscene dscene${big?' big':''}${tot>g&&!overBricks()?' over':''}" data-k="${k}"><div class="sky"><div class="skystars">${st}</div><div class="moon${mp>=0?' on':''}${mp===8?' full':''}">${mp>=0?moonSVG(mp):''}</div></div><div class="wall${q?' q'+q:''}" style="--rows:${w.rows}">${w.html}</div></div>`}
function openDayScene(k){const{tot}=totals(k),g=goalMs(k),{stars,mp}=skyOf(tot,g),date=keyToDate(k);
  $('#ltBox').innerHTML=`<h2>${L().days[date.getDay()]} ${hStr(date)}</h2><div class="ltsub">${gStr(date)} · ${t('glass.of',fmtHM(tot),g/36e5)} · ${Math.floor(tot/g*100)}%</div>${sceneHTML(k,true)}<div class="dsline">${skyLine({s:stars,c:mp>=0&&mp<8?1:0,m:mp===8?1:0})}</div><div class="ltact"><button class="btn" id="dsX">${t('d.close')}</button></div>`;
  $('#ltModal').classList.add('on');$('#dsX').onclick=closeLt}
function renderSky(k,tot,g){const sc=$('#gscene'),{stars,mp}=overBricks()?{stars:0,mp:-1}:skyOf(tot,g),on=tot>g&&!overBricks();sc.classList.toggle('over',on);
  const box=$('#skyStars'),init=!skyLast||skyLast.k!==k||stars<skyLast.stars;if(init){box.innerHTML='';skyLast={k,stars:0,mp:-2}}
  if(stars>skyLast.stars){const pts=skyPts(k);
    for(let i=skyLast.stars;i<stars;i++){const e=document.createElement('i');e.className='skyst'+(init?'':' newst');e.style.cssText=skyStarCss(k,i,pts);e.innerHTML=STAR_SVG;box.append(e)}}
  const m=$('#moon');if(mp!==skyLast.mp){m.innerHTML=mp>=0?moonSVG(mp):'';m.classList.toggle('on',mp>=0);m.classList.toggle('full',mp===8);if(mp>=0&&skyLast.mp!==-2){m.classList.remove('grow');void m.offsetWidth;m.classList.add('grow')}}
  skyLast={k,stars,mp}}
/* counts over a set of day keys */
function skyCount(keys){const tk=todayKey(),r={s:0,c:0,m:0};for(const k of keys){if(k>tk||!S.days[k])continue;const {tot}=totals(k),q=skyOf(tot,goalMs(k));r.s+=q.stars;if(q.mp===8)r.m++;else if(q.mp>=0)r.c++}return r}
function yearKeys(y){const tk=todayKey();return Object.keys(S.days).filter(k=>k.startsWith(y+'-')&&k<=tk)}
const ICO_STAR=`<i class="ico st">${STAR_SVG}</i>`,ICO_CRES=`<i class="ico mo"><svg viewBox="0 0 44 44">${cresPath(.4)}</svg></i>`,ICO_MOON='<i class="ico mo"><svg viewBox="0 0 44 44"><circle cx="22" cy="22" r="20" fill="currentColor"/></svg></i>';
function skyLine(c){return`<span class="sk">${ICO_STAR}<b>${c.s}</b></span><span class="sk">${ICO_CRES}<b>${c.c}</b></span><span class="sk">${ICO_MOON}<b>${c.m}</b></span>`}
function placeCalSky(){const wrap=$('#calSkyWrap'),sky=$('#calSky');if(overBricks()&&sky){sky.innerHTML='';return}if(!wrap||!wrap.offsetParent)return;
  const W=wrap.clientWidth,H=wrap.clientHeight;if(!W||!H)return;const wr=wrap.getBoundingClientRect();
  const rects=$$('#cal .cell,#cal .dow').map(c=>{const r=c.getBoundingClientRect();return[r.left-wr.left,r.top-wr.top,r.right-wr.left,r.bottom-wr.top]});
  const y=calM.getFullYear(),m=calM.getMonth(),last=new Date(y,m+1,0).getDate(),tk=todayKey();
  const step=2,free={};const freeFor=sz=>{if(free[sz])return free[sz];const c=sz/2+1,pts=[];
    for(let yy=c;yy<=H-c;yy+=step)for(let xx=c;xx<=W-c;xx+=step){let ok=true;for(const r of rects){if(xx>r[0]-c&&xx<r[2]+c&&yy>r[1]-c&&yy<r[3]+c){ok=false;break}}if(ok)pts.push([xx,yy])}return free[sz]=pts};
  const taken=[];let h='';
  const put=(R,sz,k,cls,svg,tip)=>{const pts=freeFor(sz);for(let tr=0;tr<40&&pts.length;tr++){const q=pts[Math.floor(R()*pts.length)];if(taken.some(o=>Math.hypot(o[0]-q[0],o[1]-q[1])<(o[2]+sz)/2+2))continue;taken.push([q[0],q[1],sz]);
      h+=`<i class="${cls}" data-k="${k}" title="${esc(tip)}" style="left:${q[0]}px;top:${q[1]}px;--sz:${sz}px;--sd:${(20+R()*30).toFixed(1)}s;--dr:${R()<.5?'normal':'reverse'};--sa:${(.6+R()*.4).toFixed(2)}">${svg}</i>`;return}};
  for(let d=1;d<=last;d++){const k=dKey(new Date(y,m,d));if(k>tk||!S.days[k])continue;const {tot}=totals(k),q=skyOf(tot,goalMs(k));if(q.stars<1)continue;const R=rng('cal'+k),ds=gStr(keyToDate(k));
    if(q.mp>=0)put(R,q.mp===8?12:11,k,'csm'+(q.mp===8?' full':''),moonSVG(q.mp),t('sky.tip',ds,fmtHM(tot)));
    for(let i=0;i<q.stars;i++)put(R,+(5+R()*3).toFixed(1),k,'cst',STAR_SVG,t('sky.tip',ds,fmtHM(tot)))}
  sky.innerHTML=h;$$('#calSky [data-k]').forEach(e=>e.onclick=()=>{selKey=e.dataset.k;renderCal()})}
let calSkyRaf=0;new ResizeObserver(()=>{cancelAnimationFrame(calSkyRaf);calSkyRaf=requestAnimationFrame(placeCalSky)}).observe($('#calSkyWrap'));
function badge(txt){const b=$('#gbadge');b.textContent=txt;b.classList.remove('go');void b.offsetWidth;b.classList.add('go')}
function softNote(title,body,icon='🌙',ms=9000){const n=document.createElement('div');n.className='softnote';n.innerHTML=`<span class="ic">${icon}</span><div><b>${esc(title)}</b>${esc(body)}</div>`;n.onclick=()=>n.remove();document.body.append(n);setTimeout(()=>n.remove(),ms)}
function celebrate(title,body,bal){$('#celT').textContent=title;$('#celP').textContent=body;$('#celB').textContent=bal||'';const c=$('#celebrate');c.classList.remove('on');void c.offsetWidth;c.classList.add('on');chime(2);clearTimeout(celebrate._t);celebrate._t=setTimeout(()=>c.classList.remove('on'),4700)}
$('#celebrate').onclick=()=>$('#celebrate').classList.remove('on');
function milestones(k,oh,tot){const N=S.notified,st=S.settings;let fired=false;
  if(oh>=1&&!N['m1-'+k]){N['m1-'+k]=1;fired=true;badge('+1');chimeSoft(1319);toast(t('ms.1'))}
  if(oh>=2&&!N['m2-'+k]){N['m2-'+k]=1;fired=true;setTimeout(()=>{badge('★ +2');chimeSoft(1568)},oh>=1&&fired?900:0);toast(t('ms.2'))}
  if(oh>=4&&!N['m4-'+k]){N['m4-'+k]=1;fired=true;setTimeout(()=>celebrate(t('ms.4T'),t('ms.4B',fmtHM(tot)),st.balance!==false?t('bal.inCel'):''),600);if(st.balance!==false)N['bal-'+k]=1}
  const th=(st.balanceH||10)*36e5;if(st.balance!==false&&tot>=th&&!N['bal-'+k]){N['bal-'+k]=1;fired=true;setTimeout(()=>softNote(t('bal.T'),t('bal.B')),1200)}
  if(fired)save()}

