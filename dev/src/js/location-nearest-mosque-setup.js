/* ============ location & nearest mosque setup ============ */
const HELPER='http://127.0.0.1:47813';
const sleepMs=ms=>new Promise(r=>setTimeout(r,ms));
async function helperOk(){if(ANDROID)return true;try{const c=new AbortController(),tm=setTimeout(()=>c.abort(),1500);const r=await fetch(HELPER+'/ping',{cache:'no-store',signal:c.signal});clearTimeout(tm);return r.ok}catch(e){return false}}
async function helperWait(ms){const t0=Date.now();do{if(await helperOk())return true;await sleepMs(600)}while(Date.now()-t0<ms);return false}
async function mqGet(url,text){const r=ANDROID?await fetch(url,{cache:'no-store'}):await fetch(HELPER+'/mq?u='+encodeURIComponent(url),{cache:'no-store'});if(!r.ok)throw new Error('HTTP '+r.status);return text?r.text():r.json()}
const METHODS={mwl:{ar:'رابطة العالم الإسلامي',en:'Muslim World League',f:18,i:17},tn:{ar:'تونس',en:'Tunisia',f:18,i:18},dz:{ar:'الجزائر',en:'Algeria',f:18,i:17},ma:{ar:'المغرب',en:'Morocco',f:19,i:17},eg:{ar:'الهيئة المصرية العامة للمساحة',en:'Egyptian General Authority',f:19.5,i:17.5},mk:{ar:'أم القرى (مكة)',en:'Umm al-Qura (Makkah)',f:18.5,im:90},gulf:{ar:'الخليج',en:'Gulf region',f:19.5,im:90},kw:{ar:'الكويت',en:'Kuwait',f:18,i:17.5},tr:{ar:'تركيا (ديانت)',en:'Turkey (Diyanet)',f:18,i:17},ka:{ar:'كراتشي',en:'Karachi',f:18,i:18,asr:2},sg:{ar:'جنوب شرق آسيا',en:'Southeast Asia',f:20,i:18},isna:{ar:'أمريكا الشمالية (ISNA)',en:'North America (ISNA)',f:15,i:15},fr:{ar:'فرنسا (UOIF)',en:'France (UOIF)',f:12,i:12}};
const CC_METHOD={TN:'tn',DZ:'dz',MA:'ma',LY:'eg',EG:'eg',SD:'eg',SY:'eg',LB:'eg',JO:'eg',PS:'eg',IQ:'eg',SA:'mk',YE:'mk',AE:'gulf',QA:'gulf',BH:'gulf',OM:'gulf',KW:'kw',TR:'tr',PK:'ka',IN:'ka',BD:'ka',AF:'ka',MY:'sg',SG:'sg',ID:'sg',BN:'sg',US:'isna',CA:'isna',FR:'fr'};
function applyMethod(key){const M=METHODS[key]||METHODS.mwl,P=S.settings.prayer;P.method=METHODS[key]?key:'mwl';P.fajr=M.f;P.isha=M.i||18;P.ishaMin=M.im||0;P.asr=M.asr||1}
function locLabel(){const P=S.settings.prayer;if(P.source==='mosque')return t('src.mosque');if(P.source==='mawaqit'&&P.mq)return P.mq.name+(P.mq.loc?' — '+P.mq.loc:'');return (P.place||(Number(P.lat).toFixed(3)+', '+Number(P.lng).toFixed(3)))+(P.method&&METHODS[P.method]?' · '+METHODS[P.method][LANG]:'')}
function extractConf(html){const i=html.indexOf('confData');if(i<0)return null;const j=html.indexOf('{',i);if(j<0)return null;let d=0,inS=false,es=false;
  for(let k=j;k<html.length;k++){const c=html[k];if(inS){if(es)es=false;else if(c==='\\')es=true;else if(c==='"')inS=false;continue}
    if(c==='"')inS=true;else if(c==='{')d++;else if(c==='}'){d--;if(!d){try{return JSON.parse(html.slice(j,k+1))}catch(e){return null}}}}return null}
function matchJSON(html,from,open,close){let d=0,inS=false,es=false;for(let k=from;k<html.length;k++){const c=html[k];if(inS){if(es)es=false;else if(c==='\\')es=true;else if(c==='"')inS=false;continue}
    if(c==='"')inS=true;else if(c===open)d++;else if(c===close){d--;if(!d){try{return JSON.parse(html.slice(from,k+1))}catch(e){return null}}}}return null}
function mqCalFromHtml(html){const conf=extractConf(html);let raw=conf&&calToRaw(conf.calendar);if(raw)return raw;
  let i=html.indexOf('"calendar"');while(i>=0&&!raw){const j=html.indexOf('[',i);if(j>=0&&j-i<20){raw=calToRaw(matchJSON(html,j,'[',']'))}i=html.indexOf('"calendar"',i+10)}return raw||null}
function calToRaw(cal){if(!Array.isArray(cal)||cal.length!==12)return null;const months=[];
  for(const m of cal){if(!m||typeof m!=='object')return null;const keys=Array.isArray(m)?m.map((_,i)=>i):Object.keys(m).map(Number).filter(n=>n>0).sort((a,b)=>a-b);const rows=[];
    for(const d of keys){const r=m[d];if(!Array.isArray(r)||r.length<6||!r.slice(0,6).every(x=>/^\d{1,2}:\d{2}$/.test(String(x))))return null;rows.push(r.slice(0,6).join(','))}
    if(rows.length<28)return null;months.push(rows.join(';'))}return months.join('|')}
let SU={};
function openSetup(first){SU={step:'start',first:!!first};$('#setupModal').classList.add('on');renderSetup()}
function closeSetup(){$('#setupModal').classList.remove('on');if(typeof maybeTour==='function')maybeTour()}
$('#setupModal').onclick=e=>{if(e.target.id==='setupModal'&&!SU.first)closeSetup()};
function distTxt(m){const d=m.proximity;return d==null?'':d<1000?Math.round(d)+' '+t('su.m'):(d/1000).toFixed(d<10000?1:0)+' '+t('su.km')}
function renderSetup(){const b=$('#setupBox');let h='';
  const back=`<button class="link subk" data-go="start">‹ ${t('su.back')}</button>`;
  if(SU.step==='start'){h=`<div class="suic">${ICON_MOSQUE}</div><h2>${t(SU.first?'su.welcome':'su.title')}</h2><p>${t('su.intro')}</p>
      <div class="suopts"><button class="btn pri" data-go="locate">📍 ${t('su.auto')}</button><button class="btn" data-go="manual">✍️ ${t('su.manual')}</button></div>
      <small class="sunote">${t('su.privacy')}</small>${SU.first?`<button class="link" data-go="skip">${t('su.skip')}</button>`:`<button class="link" data-go="close">${t('lt.cancel')}</button>`}`}
  else if(SU.step==='locating'){h=`<div class="suspin"></div><p>${t('su.locating')}</p>`}
  else if(SU.step==='manual'){h=`${back}<h2>${t('su.manualT')}</h2>
      <label class="sul">${t('su.city')}</label><div class="surow"><input class="in" id="suCity" dir="auto" placeholder="${esc(t('su.cityPh'))}" value="${esc(SU.q||'')}"><button class="btn pri" id="suCityGo">${t('su.search')}</button></div>
      <div class="sulist" id="suCities">${(SU.cities||[]).map((c,i)=>`<button class="suitem" data-city="${i}"><b>${esc(c.name)}</b><small>${esc([c.admin1,c.country].filter(Boolean).join('، '))}</small></button>`).join('')}${SU.cityErr?`<div class="suerr">${esc(SU.cityErr)}</div>`:''}</div>
      <label class="sul">${t('su.byName')}</label><div class="surow"><input class="in" id="suMq" dir="auto" placeholder="${esc(t('su.mqPh'))}" value="${esc(SU.mq||'')}"><button class="btn" id="suMqGo">${t('su.search')}</button></div>
      <div class="sulist">${(SU.mqRes||[]).map((m,i)=>mqItem(m,i,'mqr')).join('')}${SU.mqErr?`<div class="suerr">${SU.mqErr}</div>`:''}</div>`}
  else if(SU.step==='mosques'){const M=METHODS[SU.method]||METHODS.mwl;h=`${back}<h2>${esc(SU.place||t('su.yourLoc'))}</h2><p class="susub">${t('su.pick')}</p>
      <div class="sulist tall">${SU.loading?`<div class="suspin sm"></div><small class="sunote">${t('su.searching')}</small>`:''}
      ${(SU.mosques||[]).map((m,i)=>mqItem(m,i,'mq')).join('')}
      ${!SU.loading&&SU.noHelper?`<div class="suwarn">${t('su.noHelper')}<button class="btn sm" data-go="retry">${t('su.retry')}</button></div>`:''}
      ${!SU.loading&&SU.mqErr?`<div class="suerr">${SU.mqErr}</div>`:''}
      ${!SU.loading&&!SU.noHelper&&!SU.mqErr&&SU.mosques&&!SU.mosques.length?`<div class="suwarn">${t('su.none')}</div>`:''}
      <button class="suitem calc" data-go="calc"><b>🧭 ${t('su.useCalc')}</b><small>${t('su.calcSub',M[LANG])}</small></button></div>`}
  else if(SU.step==='saving'){h=`<div class="suspin"></div><p>${t('su.saving')}</p>`}
  else if(SU.step==='done'){h=`<div class="suic ok">✓</div><h2>${t('su.doneT')}</h2><p>${esc(SU.doneMsg||'')}</p><div class="suprev">${suPreview()}</div><button class="btn pri" data-go="close">${t('ok')}</button>`}
  else if(SU.step==='geoerr'){h=`${back}<div class="suic warn">!</div><h2>${t('su.geoErrT')}</h2><p>${t('su.geoErr')}</p><div class="suopts"><button class="btn pri" data-go="manual">✍️ ${t('su.manual')}</button><button class="btn" data-go="locate">${t('su.retry')}</button></div>`}
  b.innerHTML=h;
  b.querySelectorAll('[data-go]').forEach(x=>x.onclick=()=>suGo(x.dataset.go));
  b.querySelectorAll('[data-mq]').forEach(x=>x.onclick=()=>suPickMosque(SU.mosques[+x.dataset.mq]));
  b.querySelectorAll('[data-mqr]').forEach(x=>x.onclick=()=>suPickMosque(SU.mqRes[+x.dataset.mqr]));
  b.querySelectorAll('[data-city]').forEach(x=>x.onclick=()=>{const c=SU.cities[+x.dataset.city];SU.coords=[c.latitude,c.longitude];SU.cc=(c.country_code||'').toUpperCase();SU.place=[c.name,c.country].filter(Boolean).join('، ');suMosques()});
  const ci=$('#suCity');if(ci){const go=()=>suCitySearch(ci.value.trim());$('#suCityGo').onclick=go;ci.onkeydown=e=>{if(e.key==='Enter')go()};if(!SU.cities)ci.focus()}
  const mi=$('#suMq');if(mi){const go=()=>suMqSearch(mi.value.trim());$('#suMqGo').onclick=go;mi.onkeydown=e=>{if(e.key==='Enter')go()}}}
function mqItem(m,i,attr){const tm=Array.isArray(m.times)?m.times:[];return`<button class="suitem" data-${attr}="${i}"><b dir="auto">${esc(m.name||m.label||'')}</b><small dir="auto">${esc(m.localisation||'')}</small><span class="sumeta">${distTxt(m)}${tm.length>=6?` · ${t('pr.fajr')} ${tm[0]} · ${t('pr.dhuhr')} ${tm[2]} · ${t('pr.maghrib')} ${tm[4]}`:''}</span></button>`}
function suPreview(){const pt=prayerTimes(new Date());return PRAYERS.map(k=>`<span><b>${t('pr.'+k)}</b>${fmtT(pt[k])}</span>`).join('')}
function suGo(g){if(g==='close'){closeSetup();return}
  if(g==='skip'){S.setupDone=true;save();closeSetup();return}
  if(g==='start'){SU.step='start';renderSetup();return}
  if(g==='manual'){SU.step='manual';renderSetup();return}
  if(g==='locate'){suLocate();return}
  if(g==='retry'){suMosques(true);return}
  if(g==='calc'){suPickCalc();return}}
function suLocate(){SU.step='locating';renderSetup();
  if(!navigator.geolocation){suIpLocate();return}
  navigator.geolocation.getCurrentPosition(async pos=>{SU.coords=[pos.coords.latitude,pos.coords.longitude];SU.place='';SU.cc='';
      try{const r=await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${SU.coords[0]}&longitude=${SU.coords[1]}&localityLanguage=${LANG}`);const j=await r.json();SU.cc=(j.countryCode||'').toUpperCase();SU.place=[j.city||j.locality,j.countryName].filter(Boolean).join('، ')}catch(e){}
      suMosques()},
    ()=>suIpLocate(),{enableHighAccuracy:false,timeout:15000,maximumAge:10*6e4})}
async function suIpLocate(){try{const r=await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?localityLanguage=${LANG}`);const j=await r.json();if(j&&isFinite(j.latitude)&&j.latitude!==0){SU.coords=[j.latitude,j.longitude];SU.cc=(j.countryCode||'').toUpperCase();SU.place=[j.city||j.locality,j.countryName].filter(Boolean).join('، ')+' '+t('su.approx');suMosques();return}}catch(e){}SU.step='geoerr';renderSetup()}
async function suCitySearch(q){SU.q=q;if(!q)return;SU.cityErr='';try{const r=await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=8&language=${LANG}&format=json`);const j=await r.json();SU.cities=j.results||[];if(!SU.cities.length)SU.cityErr=t('su.noCity')}catch(e){SU.cities=[];SU.cityErr=t('su.netErr')}renderSetup()}
async function suMqSearch(q){SU.mq=q;if(!q)return;SU.mqErr='';SU.mqRes=[];renderSetup();
  if(!await helperWait(4000)){SU.mqErr=t('su.noHelper');renderSetup();return}
  try{const j=await mqGet('https://mawaqit.net/api/2.0/mosque/search?word='+encodeURIComponent(q));SU.mqRes=(Array.isArray(j)?j:[]).slice(0,15);if(!SU.mqRes.length)SU.mqErr=t('su.none')}catch(e){SU.mqErr=t('su.netErr')}renderSetup()}
async function suMosques(retry){SU.step='mosques';SU.method=CC_METHOD[SU.cc]||'mwl';SU.loading=true;SU.noHelper=false;SU.mqErr='';SU.mosques=[];renderSetup();
  const ok=await helperWait(retry?3000:7000);
  if(!ok){SU.noHelper=true;SU.loading=false;renderSetup();return}
  try{const j=await mqGet(`https://mawaqit.net/api/2.0/mosque/search?lat=${SU.coords[0]}&lon=${SU.coords[1]}`);SU.mosques=(Array.isArray(j)?j:[]).sort((a,b)=>(a.proximity??9e9)-(b.proximity??9e9)).slice(0,12)}catch(e){SU.mqErr=t('su.netErr')}
  SU.loading=false;renderSetup()}
function suPickCalc(){const P=S.settings.prayer;P.source='calc';P.city='custom';P.lat=+(+SU.coords[0]).toFixed(4);P.lng=+(+SU.coords[1]).toFixed(4);P.place=SU.place||'';applyMethod(SU.method||'mwl');P.offsets={fajr:0,dhuhr:0,asr:0,maghrib:0,isha:0};
  suFinish(t('su.doneCalc',locLabel()))}
async function suPickMosque(m){if(!m)return;const P=S.settings.prayer;SU.step='saving';renderSetup();
  P.mq={uuid:m.uuid,slug:m.slug,name:m.name||m.label,loc:m.localisation||'',lat:m.latitude,lng:m.longitude};P.lat=+m.latitude;P.lng=+m.longitude;P.city='custom';P.place=P.mq.name;
  applyMethod(CC_METHOD[SU.cc]||SU.method||'mwl');P.offsets={fajr:0,dhuhr:0,asr:0,maghrib:0,isha:0};P.mqCal='';P.mqOff={};
  if(Array.isArray(m.times)&&m.times.length>=6){const ct=calcTimes(new Date()),keys=['fajr','sunrise','dhuhr','asr','maghrib','isha'],base=new Date();base.setHours(0,0,0,0);
    keys.forEach((k,i)=>{const [h,mi]=String(m.times[i]).split(':').map(Number);if(!isNaN(h))P.mqOff[k]=Math.round((base.getTime()+(h*60+mi)*6e4-ct[k])/6e4)})}
  let full=false;try{const raw=mqCalFromHtml(await mqGet('https://mawaqit.net/ar/'+m.slug,true));if(raw){P.mqCal=raw;P.mqYear=new Date().getFullYear();full=true}}catch(e){}
  P.source='mawaqit';suFinish(full?t('su.doneMq',P.mq.name):t('su.doneMqPart',P.mq.name))}
function suFinish(msg){S.setupDone=true;save();SU.step='done';SU.doneMsg=msg;renderSetup();renderPrayers();renderAdhBtn();if(curView()==='set')renderSettings();S.notified={...S.notified}}
/* refresh a mosque calendar once a year when the helper is running */
(async()=>{const P=S.settings.prayer;if(P.source!=='mawaqit'||!P.mq||(P.mqCal&&P.mqYear===new Date().getFullYear()))return;await sleepMs(4000);if(!await helperWait(3000))return;
  try{const raw=mqCalFromHtml(await mqGet('https://mawaqit.net/ar/'+P.mq.slug,true));if(raw){P.mqCal=raw;P.mqYear=new Date().getFullYear();save();renderPrayers()}}catch(e){}})();
if(FIRST_RUN&&!S.setupDone)setTimeout(()=>openSetup(true),700);


