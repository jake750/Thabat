/* ============ v2.5: adhan options, dua, quiet mode, media log, notes order, overtime, battery, pre-update backup ============ */
var mFull=0,mFullFor='',mOldFull=0;
const DUA_AR='اللَّهُمَّ رَبَّ هَذِهِ الدَّعْوَةِ التَّامَّةِ، وَالصَّلَاةِ الْقَائِمَةِ، آتِ مُحَمَّدًا الْوَسِيلَةَ وَالْفَضِيلَةَ، وَابْعَثْهُ مَقَامًا مَحْمُودًا الَّذِي وَعَدْتَهُ';
function adhanCfg(){const P=S.settings.prayer;return{mode:P.adhanMode==='takbir'?'takbir':'full',vol:Math.max(5,Math.min(100,Math.round(+P.adhanVolume||100)))}}
function fajrName(){try{return localStorage.getItem('thabat.fajrAdhan')||''}catch(e){return''}}
let FAJR_URL=null;
async function fajrSrc(){if(!fajrName()||ANDROID)return null;if(FAJR_URL)return FAJR_URL;try{const b=await idbGet('adhan:fajr');if(b){FAJR_URL=URL.createObjectURL(b instanceof Blob?b:new Blob([b]));return FAJR_URL}}catch(e){}return null}
function showDua(){const box=$('#pDua');if(!box||!S.prayPop)return;const P=S.prayPop,d=day(P.dk||todayKey());
  $('#pDuaT').textContent=t('pray.duaT');$('#pDuaTx').textContent=DUA_AR;$('#pDuaSrc').textContent=t('pray.duaSrc');const en=$('#pDuaEn');en.hidden=LANG==='ar';en.textContent=LANG==='ar'?'':t('pray.duaEn');
  $('#pSal').innerHTML=esc(t('pray.sal'))+' <span class="saw">ﷺ</span>';const n=(d.salawat||{})[P.k]||0;$('#pSalN').textContent=n?'×'+n:'';box.hidden=false}
$('#pSal').onclick=()=>{const P=S.prayPop;if(!P)return;const d=day(P.dk||todayKey());d.salawat=d.salawat||{};d.salawat[P.k]=(d.salawat[P.k]||0)+1;save();vib(10);$('#pSalN').textContent='×'+d.salawat[P.k]};
function renderAdhanSet(){const P=S.settings.prayer,c=adhanCfg();
  $('#adhanModeSeg').innerHTML=[['full','set.adhanFull'],['takbir','set.adhanTakbir']].map(([k,l])=>`<button data-k="${k}" class="${c.mode===k?'on':''}">${t(l)}</button>`).join('');
  $$('#adhanModeSeg button').forEach(b=>b.onclick=()=>{P.adhanMode=b.dataset.k;save();renderAdhanSet();if(ANDROID)setTimeout(androidSchedule,0)});
  const vi=$('#adhanVolIn');vi.value=c.vol;$('#adhanVolV').textContent=c.vol+'%';vi.oninput=()=>{$('#adhanVolV').textContent=vi.value+'%';if(ADH&&!ADH.paused)ADH.volume=vi.value/100};vi.onchange=()=>{P.adhanVolume=+vi.value;save();if(ANDROID)setTimeout(androidSchedule,0)};
  const fn=fajrName();$('#fajrName').textContent=fn||t('set.fajrNone');$('#fajrName').style.color=fn?'':'var(--muted)';$('#fajrClr').hidden=!fn;$('#fajrTest').hidden=!fn||ANDROID;
  $('#fajrPick').onclick=()=>{$('#fajrFile').value='';$('#fajrFile').click()};
  $('#fajrFile').onchange=async e=>{const f=e.target.files&&e.target.files[0];if(!f)return;if(f.size>10*1024*1024){toast(t('set.fajrBig'));return}
    try{if(ANDROID){const b64=await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(String(r.result).split(',')[1]||'');r.onerror=rej;r.readAsDataURL(f)});if(!window.ThabatAndroid.saveAdhanFile||!window.ThabatAndroid.saveAdhanFile(b64))throw 0}
      else{await idbSet('adhan:fajr',f);if(FAJR_URL){URL.revokeObjectURL(FAJR_URL);FAJR_URL=null}}
      localStorage.setItem('thabat.fajrAdhan',f.name);toast(t('set.fajrSaved'));renderAdhanSet();if(ANDROID)setTimeout(androidSchedule,0)}catch(x){toast(t('set.fajrFail'))}};
  $('#fajrClr').onclick=async()=>{try{if(ANDROID)window.ThabatAndroid.saveAdhanFile&&window.ThabatAndroid.saveAdhanFile('');else await idbSet('adhan:fajr',null)}catch(e){}if(FAJR_URL){URL.revokeObjectURL(FAJR_URL);FAJR_URL=null}try{localStorage.removeItem('thabat.fajrAdhan')}catch(e){}renderAdhanSet();if(ANDROID)setTimeout(androidSchedule,0)};
  $('#fajrTest').onclick=()=>{if(ADH&&!ADH.paused){adhanStop();return}adhanPlay('fajr',true);toast(t('set.adhanTestStop'))};
  toggle($('#prayQuietT'),P.quiet!==false,v=>{P.quiet=v;if(ANDROID)setTimeout(androidSchedule,0)})}
/* quiet time: from the adhan until "I prayed", other in-app alerts wait */
function prayQuiet(){return!!S.prayPop&&S.settings.prayer.quiet!==false}
let QQ=[];const _alertNow=alertUser;
alertUser=function(title,body,icon){if(prayQuiet()){QQ.push([title,body,icon]);return}return _alertNow(title,body,icon)};
function quietFlush(){if(ANDROID){try{window.ThabatAndroid.setQuiet&&window.ThabatAndroid.setQuiet('0')}catch(e){}}if(!QQ.length)return;const q=QQ;QQ=[];setTimeout(()=>{_alertNow(...q[q.length-1]);if(q.length>1)toast(t('pray.queued',q.length-1))},900)}
/* media log */
let mlogQ='';
function mlogGroups(){const G={};for(const dk in S.days){for(const m of (S.days[dk].media||[])){const key=m.url?mKey(m.url):'t:'+String(m.title||'').trim().toLowerCase();if(!key||key==='t:')continue;
  const g=G[key]||(G[key]={key,url:'',title:'',type:m.type,how:m.how,n:0,min:0,pos:0,full:0,last:0,lastDay:dk});g.n++;g.min+=m.minutes||0;if(m.to!=null)g.pos=Math.max(g.pos,m.to);if(m.full)g.full=Math.max(g.full,m.full);
  const at=m.at||keyToDate(dk).getTime();if(at>=g.last){g.last=at;g.lastDay=dk;g.title=m.title;g.type=m.type;g.how=m.how}if(m.url&&(!g.url||at>=g.last))g.url=m.url}}
  return Object.values(G).sort((a,b)=>b.last-a.last)}
function mContUrl(u,sec){sec=Math.floor(sec||0);try{const id=ytId(u);if(id)return'https://www.youtube.com/watch?v='+id+(sec?'&t='+sec+'s':'');const x=new URL(u);let hit=false;['t','start','time_continue','startTime'].forEach(p=>{if(x.searchParams.has(p)){x.searchParams.set(p,String(sec));hit=true}});if(!hit&&sec)x.hash='t='+sec;return x.toString()}catch(e){return u}}
function openExt(u){if(ANDROID){try{window.ThabatAndroid.openUrl(u);return}catch(e){}}window.open(u,'_blank','noopener')}
function renderMlog(){const all=mlogGroups(),q=mlogQ.trim().toLowerCase(),L_=q?all.filter(g=>(g.title+' '+g.url).toLowerCase().includes(q)):all,tot=all.reduce((a,g)=>a+g.min,0);
  $('#mlogSum').textContent=all.length?t('mlog.sum',all.length,fmtHM(tot*6e4)):'';
  $('#mlogBody').innerHTML=L_.length?L_.map((g,i)=>{const pc=g.full&&g.pos?Math.min(100,Math.round(g.pos/g.full*100)):null;
    return`<div class="mlrow"><span class="mic">${MICON[g.how]||MICON.watch}</span><div class="mlt"><b dir="auto" title="${esc(g.title)}">${esc(g.title||g.url)}</b><small>${t('type.'+g.type)} · ${t('mlog.times',g.n)} · ${fmtHM(g.min*6e4)} · ${gShort(keyToDate(g.lastDay))}</small>${g.pos?`${pc!=null?`<div class="mlbar"><i style="width:${pc}%"></i></div>`:''}<small>${t('mlog.reached')} <span dir="ltr">${fmtTC(g.pos)}${g.full?' / '+fmtTC(g.full):''}</span>${g.full?' · '+pc+'%':''}</small>`:''}</div>
    <div class="mlact">${g.url?`<button class="btn sm pri" data-cont="${i}">▶ ${g.pos?t('mlog.cont'):t('mlog.open')}</button><button class="btn sm ghost" data-log="${i}" title="${esc(t('mlog.logNew'))}">＋</button>`:''}</div></div>`}).join(''):`<div class="empty">${t(q?'notes.none':'mlog.empty')}</div>`;
  $$('#mlogBody [data-cont]').forEach(b=>b.onclick=()=>{const g=L_[+b.dataset.cont];openExt(mContUrl(g.url,g.pos))});
  $$('#mlogBody [data-log]').forEach(b=>b.onclick=()=>{const g=L_[+b.dataset.log];$('#mlogSheet').classList.remove('on');if(curView()!=='today')showView('today');const p=$('#mediaPop');if(!p.classList.contains('on'))$('#mediaAddBtn').click();$('#mUrl').value=g.url;doFetchLink();setTimeout(()=>p.scrollIntoView({block:'center',behavior:'smooth'}),60)})}
$('#mediaLogBtn').onclick=()=>{mlogQ='';$('#mlogQ').value='';$('#mlogSheet').classList.add('on');renderMlog()};
$('#mlogQ').oninput=e=>{mlogQ=e.target.value;renderMlog()};
$('#mlogClose').onclick=()=>$('#mlogSheet').classList.remove('on');$('#mlogSheet').onclick=e=>{if(e.target.id==='mlogSheet')$('#mlogSheet').classList.remove('on')};
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('#mlogSheet').classList.contains('on'))$('#mlogSheet').classList.remove('on')});
/* notes: drag to reorder (long-press on the phone) */
function notesDrag(root){if(root._dg)return;root._dg=1;let D=null;
  const start=()=>{if(!D||D.on)return;D.on=true;vib(15);const c=D.c,r=c.getBoundingClientRect();D.dx=D.x-r.left;D.dy=D.y-r.top;D.ph=document.createElement('div');D.ph.className='ncard nph';D.ph.style.height=r.height+'px';c.after(D.ph);c.classList.add('ndrag');c.style.cssText=`position:fixed;left:${r.left}px;top:${r.top}px;width:${r.width}px;z-index:80;pointer-events:none;margin:0`};
  root.addEventListener('pointerdown',e=>{if(e.button>0)return;const c=e.target.closest('.ncard[data-note]');if(!c||e.target.closest('[data-pin],[data-zoom]')||($('#nSearch').value||'').trim())return;const touch=e.pointerType!=='mouse';D={c,x:e.clientX,y:e.clientY,on:false,touch,t:touch?setTimeout(start,380):null}});
  window.addEventListener('pointermove',e=>{if(!D)return;if(!D.on){if(Math.hypot(e.clientX-D.x,e.clientY-D.y)>8){if(D.touch){clearTimeout(D.t);D=null;return}start()}else return}
    D.c.style.left=(e.clientX-D.dx)+'px';D.c.style.top=(e.clientY-D.dy)+'px';
    const el=document.elementFromPoint(e.clientX,e.clientY),o=el&&el.closest('#notesGrid .ncard[data-note]');if(o&&o!==D.c){const r=o.getBoundingClientRect();o[e.clientY<r.top+r.height/2?'before':'after'](D.ph)}else if(!o){const col=el&&el.closest('#notesGrid .ncol');if(col&&D.ph.parentNode!==col)col.append(D.ph)}});
  root.addEventListener('touchmove',e=>{if(D&&D.on)e.preventDefault()},{passive:false});
  root.addEventListener('contextmenu',e=>{if(D)e.preventDefault()});
  const end=()=>{if(!D)return;clearTimeout(D.t);const d=D;D=null;if(!d.on)return;const ids=notesDropOrder(root,d);d.ph.replaceWith(d.c);d.c.style.cssText='';d.c.classList.remove('ndrag');window._ndragAt=Date.now();
    const base=Date.now();ids.forEach((id,i)=>{const n=NOTES().find(x=>x.id===id);if(n)n.ord=base-i*1000});
    let i=ids.length;for(const n of sortNotes(NOTES().filter(n=>!ids.includes(n.id))))n.ord=base-(i++)*1000;save();setTimeout(()=>{renderNotes();renderDayNotes($('#todayNotes'),todayKey())},0)};
  window.addEventListener('pointerup',end);window.addEventListener('pointercancel',end)}
/* notes masonry: no gaps, but read row by row (1 2 3 / 4 5 6) */
function notesCols(root){const W=root.clientWidth||root.getBoundingClientRect().width||0;if(MOB.matches)return W<300?1:2;return Math.max(1,Math.min(4,Math.floor((W+14)/(230+14))))}
function notesMasonry(root){if(!root)return;const cards=[...root.querySelectorAll('.ncard[data-note]')];if(!cards.length){root._n=0;return}
  cards.forEach((c,i)=>{if(c.dataset.i==null)c.dataset.i=i});cards.sort((a,b)=>a.dataset.i-b.dataset.i);
  const n=notesCols(root),cols=Array.from({length:n},()=>{const d=document.createElement('div');d.className='ncol';return d});cards.forEach((c,i)=>cols[i%n].append(c));root.replaceChildren(...cols);root._n=n;
  if(!root._ro&&window.ResizeObserver){root._ro=new ResizeObserver(()=>{if(root._n&&notesCols(root)!==root._n)notesMasonry(root)});root._ro.observe(root)}}
function notesDropOrder(root,d){const all=[...root.querySelectorAll('.ncard[data-note]')].sort((a,b)=>a.dataset.i-b.dataset.i).map(x=>x.dataset.note),me=d.c.dataset.note,rest=all.filter(x=>x!==me);
  const col=d.ph.parentNode,cols=[...root.querySelectorAll(':scope>.ncol')],ci=cols.indexOf(col);if(ci<0)return all;
  let r=0;for(const x of col.children){if(x===d.ph)break;if(x!==d.c&&x.matches('.ncard[data-note]'))r++}
  rest.splice(Math.min(rest.length,r*cols.length+ci),0,me);return rest}

/* overtime bricks in the summary */
function overStats(keys){const by={};let ms=0;for(const k of keys){const g=goalMs(k);let cum=0;for(const s of timeline(k)){const a=Math.max(cum,g),b=cum+s.ms;if(b>a){by[s.cat]=(by[s.cat]||0)+(b-a);ms+=b-a}cum=b}}return{bricks:Math.floor(ms/BRICK),by,ms}}
function bricksTile(keys){const o=overStats(keys),cats=Object.entries(o.by).filter(([,ms])=>ms>=BRICK).sort((a,b)=>b[1]-a[1]);
  return`<div class="tile"><div class="k">${t('brief.xb')}</div><div class="v">🧱 ${o.bricks}<small> · ${fmtHM(o.ms)}</small></div><div class="s xbby">${cats.length?cats.map(([id,ms])=>`<span title="${esc(catName(catOf(id)))}"><i style="background:${catOf(id).color}"></i>${Math.floor(ms/BRICK)}</span>`).join(''):t('brief.xbNone')}</div></div>`}
/* lighter look when the battery is low or power saver is on */
function battAuto(){try{return localStorage.getItem('thabat.perfBatt')!=='0'}catch(e){return true}}
function setLowP(v){if(v!==(window.LOWP_===true)){window.LOWP_=v;applyTheme();if(curView()==='set')renderSettings()}}
function powerCheck(){if(!battAuto()){setLowP(false);return}
  if(ANDROID){try{if(!window.ThabatAndroid.power)return;const p=JSON.parse(window.ThabatAndroid.power()||'{}');setLowP(!!p.saver||(p.lvl>=0&&p.lvl<=20&&!p.plug))}catch(e){}return}
  if(navigator.getBattery)navigator.getBattery().then(b=>{const u=()=>{if(battAuto())setLowP(!b.charging&&b.level<=.2)};if(!b._th){b._th=1;b.addEventListener('levelchange',u);b.addEventListener('chargingchange',u)}u()}).catch(()=>{})}
powerCheck();setInterval(powerCheck,3*6e4);document.addEventListener('visibilitychange',()=>{if(!document.hidden)powerCheck()});
/* a backup of the data as it was before this version first ran */
(async()=>{try{if(PRE_UPD&&PRE_UPD.raw){const now=Date.now(),id='bk:'+now;await idbSet(id,PRE_UPD.raw);const idx=bkIdx();let n=0;try{n=Object.keys(JSON.parse(PRE_UPD.raw).days||{}).length}catch(e){}
    idx.unshift({id,t:now,size:PRE_UPD.raw.length,n,upd:PRE_UPD.from});while(idx.length>8){const o=idx.pop();try{await idbSet(o.id,null)}catch(e){}}localStorage.setItem('thabat.bkidx',JSON.stringify(idx));
    if(ANDROID){try{window.ThabatAndroid.saveFile('thabat-before-'+APP_VER+'-'+todayKey()+'.json','application/json',btoa(unescape(encodeURIComponent(PRE_UPD.raw))))}catch(e){}}
    setTimeout(()=>toast(t('bk.preUpd',APP_VER)),1500);PRE_UPD=null}localStorage.setItem('thabat.ver',APP_VER)}catch(e){}})();

