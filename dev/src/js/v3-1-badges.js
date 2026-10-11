/* ============ v3.1 badges ============ */
function BDG(){return S.badges||(S.badges={})}
function allDayKeys(){const ks=Object.keys(S.days).filter(k=>/^\d{4}-\d\d-\d\d$/.test(k)).sort();const tk=todayKey();if(!ks.length)return[];const out=[];let d=keyToDate(ks[0]);const end=keyToDate(tk);while(d<=end){out.push(dKey(d));d=addDays(d,1)}return out}
function bestRun(pred){let run=0,best=0;allDayKeys().forEach(k=>{if(pred(k)){run++;if(run>best)best=run}else if(k!==todayKey())run=0});return best}
function sumDays(f){return Object.keys(S.days).reduce((a,k)=>a+(+f(k,S.days[k])||0),0)}
const BADGES=[
 {id:'pray',ic:'🕌',g:'w',tiers:[7,30,100],v:()=>bestRun(k=>k>=plSince()&&PRAYERS.every(p=>plStatus(k,p)==='on')),u:'days'},
 {id:'fajr',ic:'🌅',g:'w',tiers:[7,30,100],v:()=>bestRun(k=>k>=plSince()&&plStatus(k,'fajr')==='on'),u:'days'},
 {id:'rawatib',ic:'🏡',g:'w',tiers:[100,1000,5000],v:()=>sumDays(k=>Object.keys(RAWATIB).reduce((a,p)=>a+snCount(k,p),0)),u:'rk'},
 {id:'adhkar',ic:'☀️',g:'w',tiers:[7,30,100],v:()=>bestRun(k=>{const a=(S.days[k]||{}).adh;return!!(a&&a.m&&a.e)}),u:'days'},
 {id:'fast',ic:'🌙',g:'w',tiers:[5,30,100],v:()=>sumDays((k,d)=>d.fast?1:0),u:'days'},
 {id:'qiyam',ic:'✨',g:'w',tiers:[7,30,100],v:()=>sumDays((k,d)=>d.qiyam&&d.qiyam.rk>0?1:0),u:'nights'},
 {id:'tasbih',ic:'📿',g:'w',tiers:[1000,10000,100000],v:()=>sumDays((k,d)=>Object.values(d.tsb||{}).reduce((a,b)=>a+b,0)),u:'times'},
 {id:'muhasaba',ic:'🤲',g:'w',tiers:[7,30,100],v:()=>sumDays((k,d)=>d.muhasaba?1:0),u:'nights'},
 {id:'wird',ic:'📖',g:'q',tiers:[7,30,100],v:()=>bestRun(k=>qWirdDone((S.days[k]||{}).quran)),u:'days'},
 {id:'khatma',ic:'🏁',g:'q',tiers:[1,3,10],v:()=>(S.quran.khatmas||[]).length,u:'khatmas'},
 {id:'hifz',ic:'🧠',g:'q',tiers:[20,100,604],v:()=>qMem().length,u:'pages'},
 {id:'review',ic:'🔁',g:'q',tiers:[7,30,100],v:()=>sumDays((k,d)=>d.quran&&d.quran.review?1:0),u:'days'},
 {id:'hours',ic:'⏱',g:'p',tiers:[100,500,1000],v:()=>sumDays((k,d)=>(d.sessions||[]).reduce((a,s)=>a+s.end-s.start,0))/36e5,u:'hours'},
 {id:'gold',ic:'⭐',g:'p',tiers:[10,50,200],v:()=>Object.keys(S.days).filter(k=>k<=todayKey()&&totals(k).tot>=goalMs(k)&&totals(k).tot>0).length,u:'days'},
 {id:'deep',ic:'🎯',g:'p',tiers:[10,50,200],v:()=>sumDays((k,d)=>(d.sessions||[]).filter(s=>s.deep).reduce((a,s)=>a+s.end-s.start,0))/36e5,u:'hours'},
 {id:'tasks',ic:'✅',g:'p',tiers:[100,500,2000],v:()=>sumDays((k,d)=>(d.tasks||[]).filter(x=>x.done).length),u:'tasks'},
 {id:'wreview',ic:'📝',g:'p',tiers:[4,12,52],v:()=>Object.keys(REV()).length,u:'weeks'},
 {id:'goals',ic:'🏆',g:'p',tiers:[1,5,20],v:()=>GOALS().filter(g=>{const [v,tg]=gProg(g);return v>=tg}).length,u:'goals'},
 {id:'learn',ic:'🎧',g:'c',tiers:[10,50,200],v:()=>sumDays((k,d)=>(d.media||[]).reduce((a,m)=>a+(+m.minutes||0),0))/60,u:'hours'},
 {id:'creative',ic:'🎨',g:'c',tiers:[7,30,100],v:()=>Object.keys(ST().ch).filter(k=>/^\d{4}-/.test(k)).length,u:'challenges'},
 {id:'cards',ic:'🗂',g:'c',tiers:[100,1000,5000],v:()=>sumDays((k,d)=>d.fc||0),u:'reviews'}];
function bdTier(b,v){let n=0;b.tiers.forEach((x,i)=>{if(v>=x)n=i+1});return n}
let BD_LAST=0;
function badgesCheck(quiet){const now=Date.now();if(!quiet&&now-BD_LAST<60e3)return;BD_LAST=now;const B=BDG(),won=[];
  BADGES.forEach(b=>{let v=0;try{v=b.v()}catch(e){}const tr=bdTier(b,v),old=(B[b.id]||{}).tier||0;if(tr>old){B[b.id]={tier:tr,at:now};won.push([b,tr])}});
  if(!won.length)return;save();if(quiet||!S.badgesInit){S.badgesInit=1;save();return}
  const [b,tr]=won[won.length-1];setTimeout(()=>{try{celebrate(b.ic+' '+t('bd.'+b.id),t('bd.won',t('bd.t'+tr)),t('bd.'+b.id+'D',b.tiers[tr-1]))}catch(e){toast('🏅 '+t('bd.'+b.id))}if(won.length>1)setTimeout(()=>toastAct(t('bd.more',won.length-1),t('bd.title'),openBadges,9000),4500)},600);renderBdBtn()}
function renderBdBtn(){const b=$('#bdBtn');if(!b)return;const n=Object.values(BDG()).filter(x=>x.tier).length;b.innerHTML=`🏅 <span>${t('bd.title')}</span>${n?` <b>${n}</b>`:''}`}
function openBadges(){renderBadges();$('#bdModal').classList.add('on')}
function renderBadges(){badgesCheck(true);const B=BDG(),groups=[['w','bd.gW'],['q','bd.gQ'],['p','bd.gP'],['c','bd.gC']],got=BADGES.reduce((a,b)=>a+((B[b.id]||{}).tier||0),0);
  $('#bdBox').innerHTML=`<div class="bdtop"><h2 style="font-size:21px">🏅 ${t('bd.title')}</h2><small>${t('bd.sum',got,BADGES.length*3)}</small></div>${groups.map(([g,l])=>`<h4 class="bdg">${t(l)}</h4><div class="bdgrid">${BADGES.filter(b=>b.g===g).map(b=>{let v=0;try{v=b.v()}catch(e){}const tr=(B[b.id]||{}).tier||0,next=b.tiers[Math.min(tr,2)],prev=tr?b.tiers[tr-1]:0,pc=tr>=3?100:Math.max(0,Math.min(100,(v-0)/next*100));
    return`<div class="bd t${tr}" title="${esc(t('bd.'+b.id+'D',next))}"><div class="bdic">${b.ic}</div><b>${t('bd.'+b.id)}</b><small>${tr?t('bd.t'+tr):t('bd.locked')}</small><div class="bdbar"><i style="width:${pc}%"></i></div><small class="bdv">${tr>=3?'✓ '+t('bd.max'):`${Math.floor(v)} / ${next} ${t('bd.u.'+b.u)}`}</small><p>${t('bd.'+b.id+'D',next)}</p></div>`}).join('')}</div>`).join('')}
   <div class="evact"><small class="muted" style="flex:1">${t('bd.note')}</small><button class="btn sm" id="bdX">${t('ok')}</button></div>`;$('#bdX').onclick=()=>$('#bdModal').classList.remove('on')}
$('#bdModal').onclick=e=>{if(e.target.id==='bdModal')$('#bdModal').classList.remove('on')};
$('#bdBtn').onclick=openBadges;
{const _rb7=renderBrief;renderBrief=function(){_rb7();renderBdBtn()}}
{const _cc4=cmdCommands;cmdCommands=function(){const c=(icon,label,run,kw)=>({icon,label,run,kw:kw||''});return _cc4().concat([c('🏅',t('bd.title'),openBadges,'badges achievements أوسمة')])}}
setInterval(()=>badgesCheck(),5*6e4);setTimeout(()=>{if(!S.badgesInit){badgesCheck(true);S.badgesInit=1;save()}else badgesCheck()},9000);
{const _pd4=prayDone;prayDone=function(){_pd4();setTimeout(()=>badgesCheck(),2500)}}
{const _ta4=timerAct;timerAct=function(a){_ta4(a);if(a==='stop')setTimeout(()=>badgesCheck(),2500)}}
renderBdBtn();

