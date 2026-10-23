/* ============ 3.107 tenth list A: move a day's tasks to any day, «first/last weekday of the month» repeats, clean duplicated tasks, nearby mosques on a map ============ */
/* 10th-2: undone tasks of a day go to a day you choose. From today or a past day they are copied and the original keeps its «postponed» mark
   (as «الكل إلى الغد» does); from a future day they simply move. */
function dmvMove(from,to,ids){if(!to||to===from)return 0;const src=day(from),dst=day(to),tk=todayKey();let n=0;
  for(const id of ids){const o=src.tasks.find(q=>q.id===id);if(!o||o.done)continue;
    if(from>tk){src.tasks=src.tasks.filter(q=>q!==o);dst.tasks.push(o);n++;continue}
    if((o.pp||[]).some(q=>q.k===to))continue;const c={id:uid(),text:o.text,done:false,created:Date.now(),from,fromId:id};['after','at','est','pri','note','lib','bk'].forEach(f=>{if(o[f]!=null)c[f]=o[f]});
    dst.tasks.push(c);(o.pp=o.pp||[]).push({k:to,id:c.id});n++}
  if(n){save();try{renderTasks()}catch(e){}try{if(curView()==='cal'){renderCal()}}catch(e){}toast(t('dmv.done',n,gStr(keyToDate(to))))}return n}
function dmvOpen(from){from=from||todayKey();const L_=(S.days[from]&&S.days[from].tasks||[]).filter(x=>!x.done&&!(S.settings.mulk!==false&&/^mulk-/.test(x.id)));if(!L_.length){toast(t('dmv.none'));return}
  const base=keyToDate(todayKey()),q=[1,2,7].map(n=>dKey(addDays(base,n)));
  openInfo(t('dmv.t'),`<div class="dmv"><p class="muted">${esc(t('dmv.sub',L_.length,gStr(keyToDate(from))))}</p><div class="row dmvq">${q.map((k,i)=>`<button class="btn sm" data-dmv="${k}">${esc(t(['dmv.tm','dmv.after2','dmv.week'][i]))}<small>${esc(gShort(keyToDate(k)))}</small></button>`).join('')}</div>
    <div class="row dmvd"><input type="date" class="in" id="dmvD" value="${q[0]}"><button class="btn pri" id="dmvGo">${esc(t('dmv.go'))}</button></div></div>`);
  const go=k=>{dmvMove(from,k,L_.map(x=>x.id));$$('.modal.on').forEach(m=>m.classList.remove('on'))};
  $$('#infoBox [data-dmv]').forEach(b=>b.onclick=()=>go(b.dataset.dmv));$('#dmvGo').onclick=()=>{const v=$('#dmvD').value;if(/^\d{4}-\d{2}-\d{2}$/.test(v))go(v)}}
{hookFn('uxTmBtn',()=>uxTmBtn,f=>{uxTmBtn=f},'post',function(){try{const b=$('#uxTmAll');if(!b)return;let c=$('#dmvBtn');if(!c){b.insertAdjacentHTML('afterend',`<button class="btn sm ghost uxtmall" id="dmvBtn" title="${esc(t('dmv.t'))}" aria-label="${esc(t('dmv.t'))}">📅</button>`);c=$('#dmvBtn');c.onclick=()=>dmvOpen(todayKey())}c.hidden=b.hidden}catch(e){}})}
/* the calendar day panel: the same for any day that has undone tasks */
{hookFn('renderDetail',()=>renderDetail,f=>{renderDetail=f},'post',function(k){try{const det=$('#detail');if(!det||det.querySelector('.dmvrow'))return;const n=(S.days[k]&&S.days[k].tasks||[]).filter(x=>!x.done).length;if(!n)return;
  const tk=det.querySelector('.dtask');const host=tk&&tk.closest('.sec');if(!host)return;host.insertAdjacentHTML('beforeend',`<div class="dmvrow"><button class="btn sm ghost" data-dmvk="${k}">📅 ${esc(t('dmv.btn',n))}</button></div>`);
  host.querySelector('[data-dmvk]').onclick=()=>dmvOpen(k)}catch(e){}})}
{const _cc=cmdCommands;cmdCommands=function(...a){const L_=_cc(...a);try{L_.push({icon:'📅',label:t('dmv.t'),run:()=>dmvOpen(todayKey()),kw:'move tasks day انقل المهام يوم'})}catch(e){}return L_}}

/* 10th-5: repeat on «the first / second / third / fourth / last <weekday> of the month»: rule {rule:'mwd', n:1..4|-1, wd:0..6} */
function mwdHit(n,wd,k){const d=keyToDate(k);if(d.getDay()!==wd)return false;if(n>0)return Math.ceil(d.getDate()/7)===n;const last=new Date(d.getFullYear(),d.getMonth()+1,0).getDate();return d.getDate()+7>last}
{const _m=rcMatch;rcMatch=function(r,k){if(r.rule!=='mwd')return _m(r,k);if(r.start&&k<r.start)return false;return mwdHit(+r.n,+r.wd,k)}}
{const _d=rcDesc;rcDesc=function(r){return r.rule==='mwd'?t('mwd2.desc',t('mwd2.n'+(+r.n>0?r.n:'L')),LANG==='ar'?L().days[+r.wd].replace(/^ال/,''):L().days[+r.wd]):_d(r)}}
{const rb=$('#rcBtn');if(rb){const _oc=rb.onclick;rb.onclick=e=>{_oc&&_oc(e);setTimeout(()=>{const p=$('#ppPop'),txt=$('#taskIn').value.trim();if(!p||!txt||p.querySelector('#mwdN'))return;const anchor=p.querySelector('.rcaft')||p.querySelector('.rcnw')||p.querySelector('[data-r="monthly"]');if(!anchor)return;
  const wd=keyToDate(todayKey()).getDay();
  anchor.insertAdjacentHTML('afterend',`<div class="rcaft mwdrow"><span>🔁 ${esc(t('mwd2.l'))}</span><select class="in" id="mwdN">${[1,2,3,4,-1].map(n=>`<option value="${n}">${esc(t('mwd2.n'+(n>0?n:'L')))}</option>`).join('')}</select><select class="in" id="mwdW">${L().days.map((d,i)=>`<option value="${i}" ${i===wd?'selected':''}>${esc(d)}</option>`).join('')}</select><button class="btn sm" id="mwdGo">${t('add')}</button></div>`);
  p.querySelectorAll('#mwdN,#mwdW').forEach(s=>s.onclick=ev=>ev.stopPropagation());
  $('#mwdGo').onclick=()=>{const rule={id:uid(),text:txt,start:todayKey(),rule:'mwd',n:+$('#mwdN').value,wd:+$('#mwdW').value};RC().push(rule);$('#taskIn').value='';closePP();ensureRecur();save();renderTasks();toast(t('rc.saved',rcDesc(rule)))}},80)}}}

/* 10th-8: data health → the same task written twice on the same day (same text, same time); keeps a done copy over an undone one, then the first */
function dupNorm(s){return String(s||'').replace(/\s+/g,' ').trim().toLowerCase()}
function dupScan(){const out=[];for(const k of Object.keys(S.days).sort()){const L_=S.days[k].tasks;if(!L_||L_.length<2)continue;const g=new Map();
    L_.forEach(x=>{const key=dupNorm(x.text)+'|'+(x.at||'');if(!dupNorm(x.text))return;(g.get(key)||g.set(key,[]).get(key)).push(x)});
    g.forEach(arr=>{if(arr.length<2)return;const keep=arr.find(x=>x.done)||arr[0];out.push({k,text:keep.text,drop:arr.filter(x=>x!==keep).map(x=>x.id)})})}return out}
function dupOpen(){const D=dupScan(),n=D.reduce((s,x)=>s+x.drop.length,0);
  openInfo(t('dup.t'),n?`<div class="dupb"><p>${esc(t('dup.found',n,new Set(D.map(x=>x.k)).size))}</p><div class="dupl">${D.slice(0,40).map(x=>`<div><small>${esc(gShort(keyToDate(x.k)))}</small> <span dir="auto">${esc(x.text.slice(0,70))}</span> <b>×${x.drop.length+1}</b></div>`).join('')}${D.length>40?`<div class="muted">…</div>`:''}</div>
    <div class="row" style="justify-content:flex-end"><button class="btn pri" id="dupGo">${esc(t('dup.go',n))}</button></div></div>`:`<p class="muted">${esc(t('dup.none'))}</p>`);
  const b=$('#dupGo');if(!b)return;b.onclick=()=>{const keep={};D.forEach(x=>{keep[x.k]=keep[x.k]||S.days[x.k].tasks.slice();const dr=new Set(x.drop);S.days[x.k].tasks=S.days[x.k].tasks.filter(q=>!dr.has(q.id))});
    save();try{renderTasks()}catch(e){}$$('.modal.on').forEach(m=>m.classList.remove('on'));toastAct(t('dup.done',n),t('undo'),()=>{Object.keys(keep).forEach(k=>{S.days[k].tasks=keep[k]});save();try{renderTasks()}catch(e){}},12000)}}
{hookFn('renderSettings',()=>renderSettings,f=>{renderSettings=f},'post',function(){try{const z=$('#imzBtn');if(!z||$('#dupBtn'))return;z.insertAdjacentHTML('afterend',`<button class="btn sm ghost" id="dupBtn">🧹 ${esc(t('dup.t'))}</button>`);$('#dupBtn').onclick=dupOpen}catch(e){}})}
{const _cc=cmdCommands;cmdCommands=function(...a){const L_=_cc(...a);try{L_.push({icon:'🧹',label:t('dup.t'),run:dupOpen,kw:'duplicate tasks clean مكرر تنظيف المهام'})}catch(e){}return L_}}

/* 10th-16: nearby mosques on a real map (OpenStreetMap tiles through Leaflet, loaded the first time from cdnjs); viewing only — choosing a mosque for the prayer times stays in the setup */
const MQM={L:null,lf:null};
function mqmDist(d){return isFinite(d)?(d<1?t('mqm.m',Math.round(d*1000)):t('mqm.km',d.toFixed(1))):''}
function mqmLoad(){if(MQM.lf)return Promise.resolve(MQM.lf);if(MQM.L)return MQM.L;MQM.L=new Promise((ok,no)=>{const c=document.createElement('link');c.rel='stylesheet';c.href='https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';document.head.append(c);
  const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';s.onload=()=>{/* Leaflet sets window.L; the app has its own L(): give it back at once */try{MQM.lf=window.L.noConflict()}catch(e){MQM.lf=window.L}ok(MQM.lf)};s.onerror=()=>{MQM.L=null;no(new Error('leaflet'))};document.head.append(s)});return MQM.L}
async function mqmOpen(){const P=S.settings.prayer||{};let lat=+P.lat,lng=+P.lng;
  openInfo(t('mqm.t'),`<div class="mqmw"><div class="mqmst muted" id="mqmSt">${esc(t('mqm.loading'))}</div><div id="mqmMap" class="mqmmap"></div><div id="mqmList" class="mqml"></div></div>`);const box=$('#infoBox');if(box)box.classList.add('mqmbox');
  if(!isFinite(lat)||!isFinite(lng)||(!lat&&!lng)){try{const p=await new Promise((ok,no)=>navigator.geolocation.getCurrentPosition(ok,no,{timeout:9000}));lat=p.coords.latitude;lng=p.coords.longitude}catch(e){$('#mqmSt').textContent=t('mqm.noLoc');return}}
  let Lf;try{Lf=await mqmLoad()}catch(e){$('#mqmSt').textContent=t('mqm.noNet');return}if(!$('#mqmMap'))return;
  const map=Lf.map('mqmMap',{zoomControl:true,attributionControl:true,zoomAnimation:false,fadeAnimation:false,markerZoomAnimation:false}).setView([lat,lng],14);Lf.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap'}).addTo(map);
  Lf.circleMarker([lat,lng],{radius:7,color:'#fff',weight:2,fillColor:'#3b82f6',fillOpacity:1}).addTo(map).bindTooltip(t('mqm.you'));
  /* the window is still opening when the map is made: measure again whenever its box changes */
  try{const el=$('#mqmMap'),ro=new ResizeObserver(()=>{if(!el.isConnected){ro.disconnect();return}map.invalidateSize()});ro.observe(el)}catch(e){}[250,700,1400].forEach(ms=>setTimeout(()=>{try{map.invalidateSize()}catch(e){}},ms));
  let L_=[];try{L_=(await osmMosques(lat,lng))||[]}catch(e){}if(!$('#mqmMap'))return;
  if(!L_.length){$('#mqmSt').textContent=t('mqm.none');return}$('#mqmSt').textContent=t('mqm.found',L_.length);
  const icon=Lf.divIcon({className:'mqmpin',html:'<i></i>',iconSize:[22,22],iconAnchor:[11,11]}),mk=[];
  L_.forEach((m,i)=>{const nm=m.name||t('osm.noName'),km=mqmDist(m.d);
    const go=`https://www.openstreetmap.org/directions?from=${lat},${lng}&to=${m.lat},${m.lng}`;
    const p=Lf.marker([m.lat,m.lng],{icon}).addTo(map).bindPopup(`<b dir="auto">${esc(nm)}</b><br><small>${esc(km)}${m.loc?' · '+esc(m.loc):''}</small><br><a href="#" data-mqgo="${i}">${esc(t('mqm.route'))}</a>`);mk.push(p);
    p.on('popupopen',ev=>{const a=ev.popup.getElement().querySelector('[data-mqgo]');if(a)a.onclick=e=>{e.preventDefault();openExt(go)}})});
  try{map.fitBounds(Lf.featureGroup(mk).getBounds().extend([lat,lng]),{padding:[24,24],maxZoom:16})}catch(e){}
  $('#mqmList').innerHTML=L_.slice(0,12).map((m,i)=>`<button class="btn sm ghost" data-mqi="${i}"><span dir="auto">${esc(m.name||t('osm.noName'))}</span><small>${mqmDist(m.d)}</small></button>`).join('');
  $$('#mqmList [data-mqi]').forEach(b=>b.onclick=()=>{const i=+b.dataset.mqi;map.setView([L_[i].lat,L_[i].lng],17);mk[i].openPopup()})}
{hookFn('openInfo',()=>openInfo,f=>{openInfo=f},'pre',function(){try{const b=$('#infoBox');if(b)b.classList.remove('mqmbox')}catch(e){}})}
{const _cc=cmdCommands;cmdCommands=function(...a){const L_=_cc(...a);try{L_.push({icon:'🕌',label:t('mqm.t'),run:mqmOpen,kw:'mosques map nearby المساجد القريبة خريطة'})}catch(e){}return L_}}
{hookFn('renderSettings',()=>renderSettings,f=>{renderSettings=f},'post',function(){try{const r=$('#jum2Row');if(!r||$('#mqmRow'))return;r.insertAdjacentHTML('afterend',`<div class="field" id="mqmRow"><div><label data-i18n="mqm.t">${esc(t('mqm.t'))}</label><small>${esc(t('mqm.rowS'))}</small></div><button class="btn sm" id="mqmB">${esc(t('obs2.open'))}</button></div>`);$('#mqmB').onclick=mqmOpen}catch(e){}})}
