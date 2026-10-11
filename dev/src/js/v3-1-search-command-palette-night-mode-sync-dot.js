/* ============ v3.1: search & command palette, night mode, sync dot, review image, wall image ============ */
const AR_NORM=s=>String(s||'').toLowerCase().replace(/[ً-ٰٟۖ-ۭـ]/g,'').replace(/[أإآٱ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي').replace(/ؤ/g,'و').replace(/ئ/g,'ي');
let CMD={items:[],i:0};
function cmdCommands(){const c=(icon,label,run,kw)=>({icon,label,run,kw:kw||''});return[
  c('☀',t('nav.today'),()=>showView('today'),'today home اليوم'),c('📖',t('nav.quran'),()=>showView('quran'),'quran mushaf مصحف'),c('📅',t('nav.cal'),()=>showView('cal'),'calendar'),c('📊',t('nav.brief'),()=>showView('brief'),'summary stats'),c('📝',t('nav.notes'),()=>{showView('boards');nbMode='notes';renderBoardsView()},'notes'),c('⚙',t('nav.set'),()=>showView('set'),'settings'),
  c('▶',S.timer.mode==='work'?t('btn.endSession'):t('btn.start'),()=>{showView('today');timerAct(S.timer.mode==='work'?'stop':'start')},'timer start stop مؤقت'),
  c('＋',t('notes.new'),()=>thabatOpen('note'),'note new ملاحظة'),c('📅',t('ev.new'),()=>openEv(null,todayKey()),'event حدث'),c('☑',t('cmd.task'),()=>{showView('today');setTimeout(()=>$('#taskIn').focus(),80)},'task مهمة'),
  c('☀',t('adh.m'),()=>{showView('today');openAdhkar('m')},'adhkar morning'),c('🌙',t('adh.e'),()=>{showView('today');openAdhkar('e')},'adhkar evening'),c('📿',t('adh.x'),()=>{showView('today');openAdhkar('x')},'adhkar sleep نوم'),
  c('🎧',t('mlog.title'),()=>{showView('today');$('#mediaLogBtn').click()},'media log podcast'),c('🎯',t('hz.btn'),()=>{showView('quran');openHz()},'hifz test'),c('📜',t('rv.btn'),()=>openReview('month'),'review'),c('⤓',t('wi.btn'),()=>wallImage(),'wall image'),
  c('🌗',t('cmd.theme'),()=>{S.settings.mode=S.settings.mode==='light'?'dark':'light';applyTheme();save()},'theme dark light'),...(SY.token?[c('⟳',t('sync.now'),()=>syncNow({force:true}),'sync')]:[])]}
function cmdSearch(q){const Q=AR_NORM(q.trim()),out=[];const hit=s=>{const x=AR_NORM(s);if(!Q)return 1;if(x.startsWith(Q))return 3;if(x.includes(' '+Q))return 2;return x.includes(Q)?1:0};
  cmdCommands().forEach(c=>{const h=hit(c.label+' '+c.kw);if(h)out.push({g:'cmd',sc:h+(Q?0:0),...c})});
  if(Q){NOTES().forEach(n=>{const lk=n.lock&&!notesUnlocked(),h=Math.max(hit(n.title)*2,lk?0:hit(n.body));if(h)out.push({g:'note',sc:h,icon:lk?'🔒':'📝',label:n.title||t('notes.untitled'),sub:gShort(keyToDate(n.day)),run:()=>{showView('boards');nbMode='notes';renderBoardsView();openNote(n.id)}})});
    const tk=todayKey();for(let i=0;i<30;i++){const k=dKey(addDays(keyToDate(tk),-i)),d=S.days[k];if(!d)continue;(d.tasks||[]).forEach(x=>{const h=hit(x.text);if(h)out.push({g:'task',sc:h,icon:x.done?'✅':'☐',label:x.text,sub:dayLabel(k),run:()=>{if(k===tk)showView('today');else{selKey=k;calM=new Date(keyToDate(k).getFullYear(),keyToDate(k).getMonth(),1);showView('cal')}}})})}
    EVS().forEach(e=>{const h=hit(e.title);if(h)out.push({g:'ev',sc:h,icon:'📅',label:e.title,sub:gShort(keyToDate(e.date))+(e.rep!=='none'?' 🔁':''),run:()=>openEv(e.id,e.date)})});
    mlogGroups().forEach(g=>{const h=hit(g.title);if(h)out.push({g:'media',sc:h,icon:'🎧',label:g.title,sub:fmtHM(g.min*6e4),run:()=>{showView('today');$('#mediaLogBtn').click();mlogQ=g.title;$('#mlogQ').value=g.title;renderMlog()}})});
    QS.forEach((x,i)=>{const h=Math.max(hit(x[0]),hit(x[1]));if(h)out.push({g:'surah',sc:h,icon:'📖',label:(i+1)+'. '+(LANG==='ar'?x[0]:x[1]),sub:t('q.pageS')+' '+x[2],run:()=>{showView('quran');qShow(x[2])}})})}
  const order={cmd:0,note:1,task:2,ev:3,media:4,surah:5};out.sort((a,b)=>(order[a.g]-order[b.g])||(b.sc-a.sc));const per={};return out.filter(x=>(per[x.g]=(per[x.g]||0)+1)<=(x.g==='cmd'?(Q?6:20):8))}
function cmdRender(){const q=$('#cmdIn').value;CMD.items=cmdSearch(q);if(CMD.i>=CMD.items.length)CMD.i=0;let last='';
  $('#cmdRes').innerHTML=CMD.items.length?CMD.items.map((x,i)=>{let h='';if(x.g!==last){last=x.g;h=`<div class="grp">${t('cmd.g.'+x.g)}</div>`}return h+`<div class="it ${i===CMD.i?'on':''}" data-i="${i}"><i>${x.icon}</i><span dir="auto">${esc(x.label)}</span>${x.sub?`<small>${esc(x.sub)}</small>`:''}</div>`}).join(''):`<div class="empty" style="padding:16px">${t('cmd.none')}</div>`;
  $$('#cmdRes .it').forEach(el=>{el.onclick=()=>cmdRun(+el.dataset.i);el.onmousemove=()=>{if(CMD.i!==+el.dataset.i){CMD.i=+el.dataset.i;$$('#cmdRes .it').forEach(z=>z.classList.toggle('on',z===el))}}})}
function cmdRun(i){const x=CMD.items[i];if(!x)return;cmdClose();setTimeout(()=>x.run(),30)}
function cmdOpen(){$('#cmdk').classList.add('on');const inp=$('#cmdIn');inp.value='';inp.placeholder=t('cmd.ph');$('#cmdHint').innerHTML=MOB.matches?'':`<span>↑↓ ${t('cmd.move')}</span><span>Enter ${t('cmd.open')}</span><span>Esc ${t('d.close')}</span><span>Ctrl+K</span>`;CMD.i=0;cmdRender();setTimeout(()=>inp.focus(),30)}
function cmdClose(){$('#cmdk').classList.remove('on')}
$('#cmdIn').oninput=()=>{CMD.i=0;cmdRender()};
$('#cmdIn').onkeydown=e=>{if(e.key==='ArrowDown'){e.preventDefault();CMD.i=Math.min(CMD.items.length-1,CMD.i+1);cmdRender();const el=$('#cmdRes .it.on');if(el)el.scrollIntoView({block:'nearest'})}else if(e.key==='ArrowUp'){e.preventDefault();CMD.i=Math.max(0,CMD.i-1);cmdRender();const el=$('#cmdRes .it.on');if(el)el.scrollIntoView({block:'nearest'})}else if(e.key==='Enter'){e.preventDefault();cmdRun(CMD.i)}else if(e.key==='Escape')cmdClose()};
$('#cmdk').onclick=e=>{if(e.target.id==='cmdk')cmdClose()};
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&(e.key==='k'||e.key==='K'||e.code==='KeyK')){e.preventDefault();if($('#cmdk').classList.contains('on'))cmdClose();else cmdOpen()}},true);
{const _sv=showView;showView=function(v){_sv(v);const g=$('#gsBtn');if(g)g.hidden=MOB.matches&&v!=='today'}}
(function(){const b=document.createElement('button');b.className='helpbtn gsbtn';b.id='gsBtn';b.textContent='🔍';b.title=t('cmd.ph')+' (Ctrl+K)';b.onclick=cmdOpen;document.body.append(b)})();
/* night mode after isha */
function nightMode(){return S.settings.night||'off'}
function nightApply(){const m=nightMode(),pt=prayerTimes(new Date()),now=Date.now();const on=m==='on'||(m==='auto'&&(now>=pt.isha+30*6e4||now<pt.fajr));document.documentElement.classList.toggle('nightred',on)}
setInterval(nightApply,6e4);setTimeout(nightApply,500);
/* sync status dot on the settings button */
function syDot(){const nb=$('.navbtn[data-v=set]');if(!nb)return;let d=nb.querySelector('.sydot2');if(!SY.token){if(d)d.remove();return}if(!d){d=document.createElement('i');d.className='sydot2';nb.append(d)}d.className='sydot2 '+(SY.state==='busy'?'busy':SY.state==='err'?'err':'');d.title=SY.state==='err'?SY.err||'':SY.last?t('sync.last',fmtT(SY.last)):''}
{const _rsy=renderSync;renderSync=function(){_rsy();syDot()}}setTimeout(syDot,1500);
setInterval(()=>{if(SY.token&&!document.hidden&&!syBusy)syncNow()},10*6e4);
/* canvas helpers */
function cvBase(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d'),cs=getComputedStyle(document.documentElement);const col=v=>cs.getPropertyValue(v).trim();return{c,x,bg:col('--bg')||'#0f1115',panel:col('--panel')||'#171a21',text:col('--text')||'#eee',muted:col('--muted')||'#999',accent:col('--accent')||'#fddb00',line:col('--line')||'#333'}}
function cvText(x,s,X,Y,font,color,align){x.font=font;x.fillStyle=color;x.textAlign=align||'right';x.direction=/[؀-ۿ]/.test(s)||document.documentElement.dir==='rtl'?'rtl':'ltr';x.fillText(s,X,Y)}
function cvRR(x,X,Y,w,h,r,fill){x.beginPath();x.roundRect?x.roundRect(X,Y,w,h,r):x.rect(X,Y,w,h);x.fillStyle=fill;x.fill()}
const FONT=w=>`${w} ${'"IBM Plex Sans Arabic",Tahoma,sans-serif'}`;
async function cvSave(c,name){const url=c.toDataURL('image/png');if(ANDROID){try{const r=window.ThabatAndroid.saveFile(name,'image/png',url.split(',')[1]);toast(r?t('lb.saved',r):t('toast.saveFail'))}catch(e){toast(t('toast.saveFail'))}return}const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove()}
/* wall image */
async function wallImage(){const k=todayKey();if(curView()!=='today'){showView('today');await sleepMs(200)}renderGlass();const wall=$('#wall');if(!wall)return;const W=1080,H=1350,P=cvBase(W,H),x=P.x,rtl=document.documentElement.dir==='rtl',R=rtl?W-70:70,al=rtl?'right':'left';
  x.fillStyle=P.bg;x.fillRect(0,0,W,H);cvRR(x,40,40,W-80,H-80,40,P.panel);
  const ld=logicalDate(Date.now());cvText(x,L().days[ld.getDay()]+' '+hStr(ld),R,130,FONT('700 46px'),P.text,al);cvText(x,gStr(ld),R,185,FONT('400 30px'),P.muted,al);
  const wb=wall.getBoundingClientRect(),sc=Math.min((W-180)/wb.width,560/Math.max(1,wb.height)),ox=(W-wb.width*sc)/2,oy=240;
  wall.querySelectorAll('.brick').forEach(el=>{const r=el.getBoundingClientRect(),X=ox+(r.left-wb.left)*sc,Y=oy+(r.top-wb.top)*sc,w=r.width*sc,h=r.height*sc;cvRR(x,X,Y,w,h,6,'rgba(128,128,128,.14)');
    const bi=el.style.backgroundImage||'';if(!bi)return;const toLeft=/to left/.test(bi),re=/(rgba?\([^)]*\)|#[0-9a-fA-F]{3,8}|transparent)\s+([\d.]+)%(?:\s+([\d.]+)%)?/g,st=[];let m;while(m=re.exec(bi)){st.push([m[1],+m[2]]);if(m[3]!=null)st.push([m[1],+m[3]])}x.save();x.beginPath();x.roundRect?x.roundRect(X,Y,w,h,6):x.rect(X,Y,w,h);x.clip();
    for(let i=0;i<st.length-1;i++){const [c1,p1]=st[i],[c2,p2]=st[i+1];if(c1!==c2||c1==='transparent'||/rgba\([^)]*,\s*0\)/.test(c1)||p2<=p1)continue;const a=p1/100,b=p2/100;x.fillStyle=c1;if(toLeft)x.fillRect(X+w*(1-b),Y,w*(b-a),h);else x.fillRect(X+w*a,Y,w*(b-a),h)}x.restore();if(el.classList.contains('xb')){x.strokeStyle='rgba(255,200,60,.6)';x.lineWidth=2;x.strokeRect(X+1,Y+1,w-2,h-2)}});
  const yb=oy+wb.height*sc+90,{tot,by}=totals(k),g=goalMs(k);cvText(x,Math.floor(tot/g*100)+'%',W/2,yb,FONT('800 96px'),P.text,'center');cvText(x,t('glass.of',fmtHM(tot),g/36e5),W/2,yb+60,FONT('400 30px'),P.muted,'center');
  let yy=yb+130;Object.entries(rollBy(by)).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]).slice(0,4).forEach(([id,ms])=>{const c=catOf(id);cvText(x,catName(c),R,yy,FONT('600 30px'),P.text,al);const bw=400,bx=rtl?220:W-220-bw;cvRR(x,bx,yy-20,bw,14,7,'rgba(128,128,128,.2)');cvRR(x,rtl?bx+bw-bw*Math.min(1,ms/g):bx,yy-20,bw*Math.min(1,ms/g),14,7,c.color);cvText(x,fmtHM(ms),rtl?bx-20:bx+bw+20,yy,FONT('400 26px'),P.muted,rtl?'right':'left');yy+=62});
  cvText(x,'ثبات · Thabat',W/2,H-80,FONT('700 28px'),P.accent,'center');await cvSave(P.c,'thabat-wall-'+k+'.png')}
$('#wallImg').title=t('wi.btn');$('#wallImg').onclick=()=>wallImage();
/* month / year review card */
let RV={mode:'month'};
function reviewStats(mode){const now=keyToDate(todayKey()),keys=mode==='year'?Array.from({length:366},(_,i)=>dKey(addDays(new Date(now.getFullYear(),0,1),i))).filter(k=>k.startsWith(now.getFullYear()+'-')&&k<=todayKey()):periodKeys('month',now).filter(k=>k<=todayKey());
  const st=periodStats(keys);let best=null;st.days.forEach(d=>{if(!best||d.tot>best.tot)best=d});const ks=keys.filter(k=>k>=plSince());let pOk=0,pN=0;ks.forEach(k=>PRAYERS.forEach(p=>{const s=plStatus(k,p);if(s){pN++;if(s==='on'||s==='auto')pOk++}}));
  const adhD=keys.filter(k=>S.days[k]&&adhAllDone(S.days[k].adh)).length,fasts=keys.filter(k=>S.days[k]&&S.days[k].fast).length,notes=NOTES().filter(n=>keys.includes(n.day)).length,kh=S.quran.khatmas.filter(x=>keys.includes(x.end)).length;
  const top=Object.entries(rollBy(st.by)).sort((a,b)=>b[1]-a[1]).slice(0,3),mediaMs=st.media.reduce((a,m)=>a+m.minutes*6e4,0),xb=overStats(keys).bricks;
  return{keys,st,best,pct:pN?Math.round(pOk/pN*100):null,adhD,fasts,notes,kh,top,mediaMs,xb,label:mode==='year'?String(now.getFullYear()):L().months[now.getMonth()]+' '+now.getFullYear()}}
async function reviewImage(mode){const R=reviewStats(mode),W=1080,H=1350,P=cvBase(W,H),x=P.x,rtl=document.documentElement.dir==='rtl',X=rtl?W-90:90,al=rtl?'right':'left';
  x.fillStyle=P.bg;x.fillRect(0,0,W,H);cvRR(x,40,40,W-80,H-80,40,P.panel);
  cvText(x,t(mode==='year'?'rv.titleY':'rv.titleM',R.label),X,140,FONT('800 52px'),P.text,al);cvText(x,mode==='year'?'':hRange(keyToDate(R.keys[0]),keyToDate(R.keys[R.keys.length-1])),X,195,FONT('400 28px'),P.muted,al);
  const tiles=[[fmtHM(R.st.tot),t('brief.total')],[fmtHM(R.st.elapsed?R.st.tot/R.st.elapsed:0),t('brief.avg')],['✦ '+R.st.gold,t('brief.gold')],[String(R.st.bestRun),t('rv.run')],[R.pct!=null?R.pct+'%':'—',t('bp.title')],[String(R.adhD),t('rv.adh')],[String(R.st.q.read),t('rv.pages')+(R.kh?' · '+t('rv.kh',R.kh):'')],[fmtHM(R.mediaMs),t('rv.media')],[String(R.notes),t('rv.notes')]];
  const cw=(W-180-40)/3,ch=170;tiles.forEach(([v,l],i)=>{const col=i%3,row=Math.floor(i/3),tx=rtl?W-90-(col+1)*cw-col*20:90+col*(cw+20),ty=250+row*(ch+20);cvRR(x,tx,ty,cw,ch,24,'rgba(128,128,128,.10)');cvText(x,v,tx+cw/2,ty+88,FONT('800 46px'),P.text,'center');cvText(x,l,tx+cw/2,ty+135,FONT('400 24px'),P.muted,'center')});
  let y=250+3*(ch+20)+50;cvText(x,t('rv.top'),X,y,FONT('700 30px'),P.accent,al);y+=50;const mx=R.top.length?R.top[0][1]:1;
  R.top.forEach(([id,ms])=>{const c=catOf(id);cvText(x,catName(c),X,y,FONT('600 30px'),P.text,al);const bw=420,bx=rtl?220:W-220-bw;cvRR(x,bx,y-20,bw,16,8,'rgba(128,128,128,.2)');const fw=bw*ms/mx;cvRR(x,rtl?bx+bw-fw:bx,y-20,fw,16,8,c.color);cvText(x,fmtHM(ms),rtl?bx-20:bx+bw+20,y,FONT('400 24px'),P.muted,rtl?'right':'left');y+=58});
  if(R.best&&R.best.tot>0){y+=10;cvText(x,t('rv.best',L().days[keyToDate(R.best.k).getDay()]+' '+gShort(keyToDate(R.best.k)),fmtHM(R.best.tot)),X,y,FONT('400 28px'),P.text,al);y+=48}
  const extra=[R.fasts?'🌙 '+t('rv.fasts',R.fasts):'',R.xb?'🧱 '+t('rv.xb',R.xb):''].filter(Boolean).join('   ');if(extra)cvText(x,extra,X,y,FONT('400 28px'),P.muted,al);
  cvText(x,'ثبات · Thabat',W/2,H-80,FONT('700 28px'),P.accent,'center');return P.c}
async function openReview(mode){RV.mode=mode||RV.mode;$('#rvModal').classList.add('on');const c=await reviewImage(RV.mode);
  $('#rvBox').innerHTML=`<h2 style="font-size:18px">📜 ${t('rv.btn')}</h2><div class="seg" id="rvSeg" style="margin-top:8px">${['month','year'].map(m=>`<button data-k="${m}" class="${RV.mode===m?'on':''}">${t('rv.'+m)}</button>`).join('')}</div><img id="rvImg" src="${c.toDataURL('image/png')}" alt=""><div class="evact"><span style="flex:1"></span><button class="btn sm ghost" id="rvX">${t('ok')}</button><button class="btn sm pri" id="rvDl">⬇ ${t('rv.save')}</button></div>`;
  $$('#rvSeg button').forEach(b=>b.onclick=()=>openReview(b.dataset.k));$('#rvX').onclick=()=>$('#rvModal').classList.remove('on');$('#rvDl').onclick=()=>cvSave(c,`thabat-review-${RV.mode}-${todayKey()}.png`)}
$('#rvModal').onclick=e=>{if(e.target.id==='rvModal')$('#rvModal').classList.remove('on')};
$('#rvBtn').textContent='📜 '+t('rv.btn');$('#rvBtn').onclick=()=>openReview(bMode==='week'?'month':'month');
function renderV31Set(){const m=nightMode();$('#nightSeg').innerHTML=[['off','set.night.off'],['auto','set.night.auto'],['on','set.night.on']].map(([k,l])=>`<button data-k="${k}" class="${m===k?'on':''}">${t(l)}</button>`).join('');$$('#nightSeg button').forEach(b=>b.onclick=()=>{S.settings.night=b.dataset.k;save();nightApply();renderV31Set()})}
{const _rs5=renderSettings;renderSettings=function(){_rs5();try{renderV31Set()}catch(e){}}}
