/* ============ v3.30: finding your mosque without Mawaqit's search (it now needs a login): nearby mosques and search by name from OpenStreetMap, a Mawaqit page link for exact times, a second IP source for the location; Google Calendar: repeating events, time zones, cancelled dates, several calendars ============ */
/* ---------- mosques and location ---------- */
async function osmFetch(u,o,ms){const c=new AbortController(),tm=setTimeout(()=>c.abort(),ms||20000);try{const r=await fetch(u,Object.assign({},o||{},{signal:c.signal}));if(!r.ok)throw new Error('HTTP '+r.status);return await r.json()}finally{clearTimeout(tm)}}
function geoKm(a,b,c,d){const R=6371,r=x=>x*Math.PI/180,x=Math.sin(r(c-a)/2)**2+Math.cos(r(a))*Math.cos(r(c))*Math.sin(r(d-b)/2)**2;return 2*R*Math.asin(Math.sqrt(x))}
function osmDist(km){return km==null||!isFinite(km)?'':km<1?Math.round(km*1000)+' '+t('su.m'):km.toFixed(km<10?1:0)+' '+t('su.km')}
const OSM_HOSTS=['https://overpass-api.de/api/interpreter','https://overpass.kumi.systems/api/interpreter'];
async function osmQ(q){for(const h of OSM_HOSTS){try{return await osmFetch(h,{method:'POST',body:'data='+encodeURIComponent(q),headers:{'Content-Type':'application/x-www-form-urlencoded'}},22000)}catch(e){}}return null}
async function osmMosques(lat,lng){let last=null;for(const R of [3000,12000]){const j=await osmQ(`[out:json][timeout:20];nwr["amenity"="place_of_worship"]["religion"="muslim"](around:${R},${lat},${lng});out center 60;`);if(!j)return last;
    const L=(j.elements||[]).map(e=>{const c=e.center||{},la=e.lat!=null?e.lat:c.lat,lo=e.lon!=null?e.lon:c.lon,g=e.tags||{};return{osm:e.type[0]+e.id,name:g['name:'+LANG]||g.name||g['name:ar']||g['name:en']||'',loc:[g['addr:street'],g['addr:city']||g['addr:place']].filter(Boolean).join('، '),lat:la,lng:lo,d:geoKm(lat,lng,la,lo),mq:true}}).filter(m=>isFinite(m.lat)&&isFinite(m.lng));
    if(L.length)return L.sort((a,b)=>(!a.name-!b.name)||a.d-b.d).slice(0,25);last=[]}return last}
async function osmSearch(q){const c=SU.coords,vb=c?`&viewbox=${(+c[1]-1.5).toFixed(3)},${(+c[0]+1.5).toFixed(3)},${(+c[1]+1.5).toFixed(3)},${(+c[0]-1.5).toFixed(3)}`:'';
  const j=await osmFetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=12&accept-language=${LANG}&q=${encodeURIComponent(q)}${vb}`,null,15000);
  return(Array.isArray(j)?j:[]).map(x=>{const parts=String(x.display_name||'').replace(/[‎‏‪-‮]/g,'').split(',').map(s=>s.trim());const mq=x.type==='place_of_worship'||/مسجد|جامع|mosque|mosquée|masjid|moschee/i.test(x.display_name||'');
    return{osm:'n'+x.place_id,name:x.name||parts[0],loc:parts.slice(1,4).join('، '),lat:+x.lat,lng:+x.lon,cc:((x.address||{}).country_code||'').toUpperCase(),mq,d:c?geoKm(+c[0],+c[1],+x.lat,+x.lon):null}}).sort((a,b)=>(b.mq-a.mq))}
/* the location: the device first (as before), then two IP services */
suIpLocate=async function(){const tries=[async()=>{const j=await osmFetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?localityLanguage=${LANG}`,null,9000);return j&&isFinite(j.latitude)&&j.latitude!==0?{la:j.latitude,lo:j.longitude,cc:j.countryCode,pl:[j.city||j.locality,j.countryName]}:null},
    async()=>{const j=await osmFetch('https://ipwho.is/?lang='+(LANG==='ar'?'en':LANG),null,9000);return j&&j.success&&isFinite(j.latitude)?{la:j.latitude,lo:j.longitude,cc:j.country_code,pl:[j.city,j.country]}:null}];
  for(const f of tries){try{const r=await f();if(r){SU.coords=[r.la,r.lo];SU.cc=String(r.cc||'').toUpperCase();SU.place=r.pl.filter(Boolean).join('، ')+' '+t('su.approx');suMosques();return}}catch(e){}}SU.step='geoerr';renderSetup()};
suMosques=async function(retry){SU.step='mosques';SU.method=CC_METHOD[SU.cc]||'mwl';SU.loading=true;SU.noHelper=false;SU.mqErr='';SU.mosques=[];SU.osm=null;renderSetup();const at=SU.coords;
  const mw=(async()=>{if(MAC)return[];if(!ANDROID&&!await helperWait(retry?3000:5000))return[];try{const j=await mqGet(`https://mawaqit.net/api/2.0/mosque/search?lat=${at[0]}&lon=${at[1]}`);return(Array.isArray(j)?j:[]).sort((a,b)=>(a.proximity??9e9)-(b.proximity??9e9)).slice(0,12)}catch(e){return[]}})();
  const [a,o]=await Promise.all([mw,osmMosques(at[0],at[1]).catch(()=>null)]);if(SU.step!=='mosques'||SU.coords!==at)return;SU.mosques=a;SU.osm=o||[];SU.loading=false;if(!a.length&&!o)SU.mqErr=t('osm.netErr');renderSetup()};
suMqSearch=async function(q){SU.mq=q;if(!q)return;SU.mqErr='';SU.mqRes=[];SU.osmRes=null;SU.osmBusy=true;renderSetup();
  const mw=(async()=>{if(MAC)return[];if(!ANDROID&&!await helperWait(3000))return[];try{const j=await mqGet('https://mawaqit.net/api/2.0/mosque/search?word='+encodeURIComponent(q));return(Array.isArray(j)?j:[]).slice(0,15)}catch(e){return[]}})();
  const [a,o]=await Promise.all([mw,osmSearch(q).catch(()=>null)]);if(SU.mq!==q)return;SU.mqRes=a;SU.osmRes=o||[];SU.osmBusy=false;if(!a.length&&!(o&&o.length))SU.mqErr=o?t('osm.noneName'):t('su.netErr');renderSetup()};
function suPickOsm(m){if(!m)return;const P=S.settings.prayer;if(m.cc){SU.cc=m.cc;SU.method=CC_METHOD[m.cc]||SU.method}
  P.source='calc';P.city='custom';P.lat=+(+m.lat).toFixed(5);P.lng=+(+m.lng).toFixed(5);P.place=m.name||SU.place||'';P.osmMq={n:m.name||'',lat:P.lat,lng:P.lng,id:m.osm};delete P.mq;
  applyMethod(SU.method||CC_METHOD[SU.cc]||'mwl');P.offsets={fajr:0,dhuhr:0,asr:0,maghrib:0,isha:0};suFinish(t(m.mq===false?'osm.donePlace':'osm.done',m.name||t('osm.noName')))}
/* a Mawaqit page link: its yearly calendar and its place still load (only the search needs a login) */
function mwSlug(s){s=String(s||'').trim();const m=/mawaqit\.net\/(?:[a-z]{2}\/)?(?:m\/|w\/)?([A-Za-z0-9\-_.]+)/i.exec(s);if(m)return m[1];return/^[A-Za-z0-9\-_.]{3,}$/.test(s)?s:''}
async function suMwLink(v){const slug=mwSlug(v);if(!slug){SU.mwErr=t('mw.bad');renderSetup();return}SU.mwErr='';SU.mwBusy=true;SU.mwV=v;renderSetup();
  if(!ANDROID&&!await helperWait(4000)){SU.mwBusy=false;SU.mwErr=t('su.noHelper');renderSetup();return}
  try{const html=await mqGet('https://mawaqit.net/ar/'+slug,true),raw=mqCalFromHtml(html),la=+((/"latitude":\s*(-?[\d.]+)/.exec(html)||[])[1]),lo=+((/"longitude":\s*(-?[\d.]+)/.exec(html)||[])[1]);
    let name=(/"name":"((?:[^"\\]|\\.)*)"/.exec(html)||[])[1]||'';try{name=JSON.parse('"'+name+'"')}catch(e){}
    const c=isFinite(la)&&isFinite(lo)?[la,lo]:SU.coords;if(!raw||!c)throw new Error('page');SU.mwBusy=false;
    await suPickMosque({slug,uuid:'',name:name||slug,label:name||slug,localisation:'',latitude:c[0],longitude:c[1]})}
  catch(e){SU.mwBusy=false;SU.mwErr=t('mw.fail');renderSetup()}}
function osmListHTML(L,attr){if(!L||!L.length)return'';return`<div class="sush">🗺 ${t(attr==='osm'?'osm.h':'osm.hs')}</div>`+L.map((m,i)=>`<button class="suitem" data-${attr}="${i}"><b dir="auto">${m.mq===false?'📍 ':''}${esc(m.name||t('osm.noName'))}</b>${m.loc?`<small dir="auto">${esc(m.loc)}</small>`:''}${m.d!=null?`<span class="sumeta">${osmDist(m.d)}</span>`:''}</button>`).join('')}
function mwLinkHTML(){if(MAC)return'';return`<details class="sumw"${SU.mwErr||SU.mwBusy?' open':''}><summary>🔗 ${t('mw.h')}</summary><p class="sunote">${t('mw.sub')}</p><div class="surow"><input class="in" id="suMw" dir="ltr" placeholder="https://mawaqit.net/ar/…" value="${esc(SU.mwV||'')}"><button class="btn" id="suMwGo" ${SU.mwBusy?'disabled':''}>${SU.mwBusy?'…':t('mw.use')}</button></div>${SU.mwErr?`<div class="suerr">${esc(SU.mwErr)}</div>`:''}</details>`}
{const _rs=renderSetup;renderSetup=function(...a){const r=_rs(...a);try{const b=$('#setupBox');if(!b)return r;
  if(SU.step==='mosques'){const calc=b.querySelector('.suitem.calc');if(calc){if(SU.osm&&SU.osm.length)b.querySelectorAll('.suwarn').forEach(w=>w.remove());
      if(!SU.loading&&SU.osm&&!SU.osm.length&&!(SU.mosques||[]).length&&!b.querySelector('.suwarn'))calc.insertAdjacentHTML('beforebegin',`<div class="suwarn">${t('osm.none')}</div>`);
      calc.insertAdjacentHTML('beforebegin',osmListHTML(SU.osm,'osm'));calc.insertAdjacentHTML('afterend',mwLinkHTML())}}
  else if(SU.step==='manual'){const lists=b.querySelectorAll('.sulist'),last=lists[lists.length-1];if(last){if(SU.osmBusy)last.insertAdjacentHTML('beforeend',`<div class="suspin sm"></div>`);last.insertAdjacentHTML('beforeend',osmListHTML(SU.osmRes,'osmr'));last.insertAdjacentHTML('afterend',mwLinkHTML())}}
  b.querySelectorAll('[data-osm]').forEach(x=>x.onclick=()=>suPickOsm(SU.osm[+x.dataset.osm]));
  b.querySelectorAll('[data-osmr]').forEach(x=>x.onclick=()=>suPickOsm(SU.osmRes[+x.dataset.osmr]));
  const mg=$('#suMwGo');if(mg){const go=()=>suMwLink($('#suMw').value);mg.onclick=go;$('#suMw').onkeydown=e=>{if(e.key==='Enter')go()}}}catch(e){console.error(e)}return r}}
/* ---------- Google Calendar and other iCal calendars ---------- */
/* S.settings.icsList = [{u, n, c}] (the old single S.settings.icsUrl moves into it); events of every calendar in S.icsEv as before */
function icsList(){const st=S.settings;if(!Array.isArray(st.icsList)){st.icsList=[];if(st.icsUrl&&st.icsUrl.trim())st.icsList.push({u:st.icsUrl.trim(),n:'Google',c:'#64748b'})}return st.icsList}
function icsNormUrl(u){u=String(u||'').trim();if(/^webcals?:\/\//i.test(u))u='https://'+u.replace(/^webcals?:\/\//i,'');return u}
function icsTzOff(tz,ms){try{const f=icsTzOff.c[tz]||(icsTzOff.c[tz]=new Intl.DateTimeFormat('en-US',{timeZone:tz,hourCycle:'h23',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'}));const p={};f.formatToParts(new Date(ms)).forEach(x=>p[x.type]=x.value);return(Date.UTC(+p.year,p.month-1,+p.day,+p.hour%24,+p.minute,+p.second)-ms)/6e4}catch(e){return null}}
icsTzOff.c={};
function icsTime(pr){if(!pr)return null;const v=String(pr.v||'').trim();let m=/^(\d{4})(\d\d)(\d\d)$/.exec(v);if(m)return{d:new Date(+m[1],m[2]-1,+m[3]),all:true};
  m=/^(\d{4})(\d\d)(\d\d)T(\d\d)(\d\d)(\d\d)?(Z?)$/.exec(v);if(!m)return null;const Y=+m[1],Mo=m[2]-1,D=+m[3],h=+m[4],mi=+m[5],s=+(m[6]||0);
  if(m[7])return{d:new Date(Date.UTC(Y,Mo,D,h,mi,s)),all:false};
  const tz=(/TZID=("?)([^;:"]+)\1/.exec(pr.p||'')||[])[2];if(tz){const g=Date.UTC(Y,Mo,D,h,mi,s),o1=icsTzOff(tz,g);if(o1!=null){let ms=g-o1*6e4;const o2=icsTzOff(tz,ms);if(o2!=null&&o2!==o1)ms=g-o2*6e4;return{d:new Date(ms),all:false}}}
  return{d:new Date(Y,Mo,D,h,mi,s),all:false}}
function icsDur(v){const m=/^([+-])?P(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/.exec(String(v||'').trim());if(!m)return 0;return(m[1]==='-'?-1:1)*((+m[2]||0)*6048e5+(+m[3]||0)*864e5+(+m[4]||0)*36e5+(+m[5]||0)*6e4+(+m[6]||0)*1e3)}
function icsKey(d,all){return dKey(d)+(all?'':'T'+pad(d.getHours())+pad(d.getMinutes()))}
function icsProps(b){const P={};b.split(/\r?\n/).forEach(l=>{const m=/^([A-Za-z-]+)((?:;[^:]*)?):(.*)$/.exec(l);if(!m)return;const k=m[1].toUpperCase();(P[k]=P[k]||[]).push({p:m[2]||'',v:m[3]})});return P}
function icsTxt(v){return String(v||'').replace(/\\n/gi,' ').replace(/\\([,;\\])/g,'$1').replace(/\s+/g,' ').trim()}
const ICS_WD={SU:0,MO:1,TU:2,WE:3,TH:4,FR:5,SA:6};
/* the dates of a repeating event from its first date to the end of the window (FREQ, INTERVAL, COUNT, UNTIL, BYDAY with 2MO / -1FR, BYMONTHDAY, BYMONTH) */
function icsExpand(st,rr,W1,W0){const R={};rr.split(';').forEach(x=>{const [k,v]=x.split('=');if(k&&v)R[k.toUpperCase()]=v});const F=R.FREQ,I=Math.max(1,+R.INTERVAL||1),C=+R.COUNT||0,U=R.UNTIL?icsTime({p:'',v:R.UNTIL}):null,end=U?(U.all?addDays(U.d,1):new Date(U.d.getTime()+1)):null;
  const s=st.d,H=s.getHours(),Mi=s.getMinutes(),out=[];const BD=(R.BYDAY||'').split(',').filter(Boolean).map(x=>{const m=/^([+-]?\d+)?([A-Z]{2})$/.exec(x);return m?{n:m[1]?+m[1]:0,w:ICS_WD[m[2]]}:null}).filter(Boolean);
  const BMD=(R.BYMONTHDAY||'').split(',').filter(Boolean).map(Number),BM=(R.BYMONTH||'').split(',').filter(Boolean).map(x=>+x-1);
  const mk=(y,m,d)=>new Date(y,m,d,H,Mi);let n=0,guard=0;
  const push=d=>{if(d<s)return true;if(end&&d>=end)return false;if(d>W1)return false;if(C&&n>=C)return false;n++;out.push(d);return true};
  const nth=(y,m,w,k)=>{if(k>0){const f=new Date(y,m,1).getDay();const d=1+((w-f+7)%7)+(k-1)*7;return d<=new Date(y,m+1,0).getDate()?d:0}const L=new Date(y,m+1,0).getDate(),l=new Date(y,m,L).getDay();const d=L-((l-w+7)%7)+(k+1)*7;return d>=1?d:0};
  const monthDays=(y,m)=>{const L=new Date(y,m+1,0).getDate();let ds=[];if(BMD.length)ds=BMD.map(x=>x<0?L+1+x:x).filter(x=>x>=1&&x<=L);if(BD.length){const fromBD=[];BD.forEach(b=>{if(b.n)fromBD.push(nth(y,m,b.w,b.n));else for(let d=1;d<=L;d++)if(new Date(y,m,d).getDay()===b.w)fromBD.push(d)});ds=BMD.length?ds.filter(x=>fromBD.includes(x)):fromBD.filter(Boolean)}if(!BMD.length&&!BD.length)ds=[s.getDate()].filter(x=>x<=L);return[...new Set(ds)].sort((a,b)=>a-b)};
  if(F==='DAILY'){let d0=new Date(s);if(!C&&W0&&W0>s){const k=Math.floor((W0-s)/864e5/I);if(k>0)d0=addDays(d0,k*I)}for(let d=d0;guard++<4000;d=addDays(d,I)){const x=mk(d.getFullYear(),d.getMonth(),d.getDate());if(BM.length&&!BM.includes(x.getMonth()))continue;if(BD.length&&!BD.some(b=>b.w===x.getDay()))continue;if(!push(x))break}}
  else if(F==='WEEKLY'){const days=BD.length?BD.map(b=>b.w):[s.getDay()],ws=addDays(new Date(s.getFullYear(),s.getMonth(),s.getDate()),-((s.getDay()+6)%7));let stop=false;
    for(let w=0;!stop&&guard++<1500;w+=I){const base=addDays(ws,w*7);const wk=days.map(x=>addDays(base,(x+6)%7)).sort((a,b)=>a-b);for(const d of wk){const x=mk(d.getFullYear(),d.getMonth(),d.getDate());if(BM.length&&!BM.includes(x.getMonth()))continue;if(!push(x)){stop=true;break}}}}
  else if(F==='MONTHLY'){let stop=false;for(let k=0;!stop&&guard++<600;k+=I){const y=s.getFullYear()+Math.floor((s.getMonth()+k)/12),m=(s.getMonth()+k)%12;if(BM.length&&!BM.includes(m))continue;for(const d of monthDays(y,m)){if(!push(mk(y,m,d))){stop=true;break}}}}
  else if(F==='YEARLY'){let stop=false;for(let k=0;!stop&&guard++<200;k+=I){const y=s.getFullYear()+k;for(const m of(BM.length?BM:[s.getMonth()])){const ds=(BMD.length||BD.length)?monthDays(y,m):[s.getDate()];for(const d of ds){if(d>new Date(y,m+1,0).getDate())continue;if(!push(mk(y,m,d))){stop=true;break}}if(stop)break}}}
  else push(new Date(s));return out}
function icsParse2(txt,cal,ci){const today=keyToDate(todayKey()),W0=addDays(today,-60),W1=addDays(today,400),un=String(txt||'').replace(/\r?\n[ \t]/g,'');
  const blocks=un.split('BEGIN:VEVENT').slice(1).map(b=>b.split('END:VEVENT')[0]),master={},over={},out=[];let seq=0;
  blocks.forEach(b=>{const P=icsProps(b),g=k=>(P[k]||[])[0],uid=(g('UID')||{}).v||('x'+(seq++)),stv=(g('STATUS')||{}).v||'';
    const ev={P,uid,ds:g('DTSTART'),de:g('DTEND'),du:g('DURATION'),sum:icsTxt((g('SUMMARY')||{}).v)||t('ics.noTitle'),loc:icsTxt((g('LOCATION')||{}).v),rr:(g('RRULE')||{}).v||'',cancel:/CANCELLED/i.test(stv)};if(!ev.ds)return;
    const rid=g('RECURRENCE-ID');if(rid){const x=icsTime(rid);if(x)(over[uid]=over[uid]||{})[icsKey(x.d,x.all)]=ev;return}master[uid]=ev});
  const emit=(ev,st,dur)=>{if(ev.cancel)return;const title=ev.sum,col=cal.c||'#64748b';
    if(st.all){const days=Math.max(1,Math.round(dur/864e5));for(let i=0;i<Math.min(days,62);i++){const d=addDays(st.d,i);if(d<W0||d>W1)continue;out.push({id:`ics:${ci}:${out.length}`,title,date:dKey(d),time:'',end:'',color:col,rep:'none',ics:1,cal:cal.n||'',loc:ev.loc})}return}
    if(st.d<W0||st.d>W1)return;const e=new Date(st.d.getTime()+Math.max(0,dur));out.push({id:`ics:${ci}:${out.length}`,title,date:dKey(st.d),time:pad(st.d.getHours())+':'+pad(st.d.getMinutes()),end:dur>0&&dKey(e)===dKey(st.d)?pad(e.getHours())+':'+pad(e.getMinutes()):'',color:col,rep:'none',ics:1,cal:cal.n||'',loc:ev.loc})};
  const durOf=(ev,st)=>{const en=ev.de?icsTime(ev.de):null;return en?en.d-st.d:ev.du?icsDur(ev.du.v):(st.all?864e5:0)};
  Object.values(master).forEach(ev=>{const st=icsTime(ev.ds);if(!st)return;const dur=durOf(ev,st),ex=new Set();
    (ev.P.EXDATE||[]).forEach(x=>String(x.v).split(',').forEach(v=>{const y=icsTime({p:x.p,v});if(y)ex.add(icsKey(y.d,y.all))}));
    const starts=ev.rr?icsExpand(st,ev.rr,W1,W0):[st.d],ov=over[ev.uid]||{};
    starts.forEach(d=>{const k=icsKey(d,st.all);if(ex.has(k))return;const o=ov[k];if(o){delete ov[k];const os=icsTime(o.ds);if(os)emit(o,os,durOf(o,os));return}emit(ev,{d,all:st.all},dur)});
    Object.values(ov).forEach(o=>{const os=icsTime(o.ds);if(os)emit(o,os,durOf(o,os))});delete over[ev.uid]});
  Object.values(over).forEach(ov=>Object.values(ov).forEach(o=>{const os=icsTime(o.ds);if(os)emit(o,os,durOf(o,os))}));
  return out.sort((a,b)=>a.date.localeCompare(b.date)||String(a.time).localeCompare(String(b.time)))}
icsSync=async function(force){const L=icsList();if(!L.length){if(S.icsEv&&S.icsEv.length){S.icsEv=[];save()}return}if(!force&&S.icsAt&&Date.now()-S.icsAt<6*36e5)return;
  const all=[],err={};let okN=0;
  for(let i=0;i<L.length;i++){const c=L[i],u=icsNormUrl(c.u);try{const r=await fetch(ANDROID?u:HELPER+'/ics?u='+encodeURIComponent(u),{cache:'no-store'});if(!r.ok)throw new Error('HTTP '+r.status);const tx=await r.text();if(!/BEGIN:VCALENDAR/i.test(tx))throw new Error('notics');const ev=icsParse2(tx,c,i);all.push(...ev);c.nEv=ev.length;okN++;delete c.err}catch(e){err[i]=1;c.err=String(e.message||e).slice(0,40);(S.icsEv||[]).filter(x=>String(x.id).startsWith('ics:'+i+':')).forEach(x=>all.push(x))}}
  S.icsEv=all.slice(0,4000);if(okN)S.icsAt=Date.now();save();try{renderTodayEv()}catch(e){}if(curView()==='cal')try{renderCal()}catch(e){}icsBoxPaint();
  if(force){const nE=Object.keys(err).length;toast(nE&&!okN?t(ANDROID?'ics.fail':'ics.failP'):nE?t('ics.part',okN,L.length):t('ics.ok',all.length))}};
/* the settings: a list of calendars, add / remove / colour, and how to get Google's secret link */
const ICS_COLS=['#64748b','#2563eb','#16a34a','#d97706','#dc2626','#9333ea','#0891b2'];
function icsBoxPaint(){const box=$('#icsBox');if(!box)return;const L=icsList();
  box.innerHTML=`${L.map((c,i)=>`<div class="icsrow"><button class="icsdot" data-icc="${i}" style="background:${esc(c.c||'#64748b')}" title="${esc(t('ics.color'))}" aria-label="${esc(t('ics.color'))}"></button><span class="icsn"><b dir="auto">${esc(c.n||'—')}</b><small dir="ltr">${esc(icsNormUrl(c.u).replace(/^https:\/\//,'').slice(0,46))}…</small>${c.err?`<em class="icserr">⚠ ${t('ics.err')}</em>`:c.nEv!=null?`<em>${t('ics.nEv',c.nEv)}</em>`:''}</span><button class="lshm" data-icx="${i}" aria-label="✕" title="${esc(t('ics.rm'))}">✕</button></div>`).join('')}
    <div class="icsadd"><input class="in" id="icsN" dir="auto" placeholder="${esc(t('ics.nPh'))}"><input class="in" id="icsU" dir="ltr" placeholder="https://calendar.google.com/calendar/ical/…/basic.ics"><button class="btn sm pri" id="icsA">＋ ${t('ics.add')}</button></div>
    <div class="icsmeta"><button class="link" id="icsHow">❓ ${t('ics.how')}</button>${S.icsAt?`<small class="muted">${t('ics.last',new Date(S.icsAt).toLocaleString(LANG==='ar'?'ar':'en',{dateStyle:'short',timeStyle:'short'}))}</small>`:''}</div>`;
  box.querySelectorAll('[data-icx]').forEach(b=>b.onclick=()=>{const i=+b.dataset.icx;if(!confirm(t('ics.rmQ',L[i].n||'')))return;L.splice(i,1);S.settings.icsUrl='';S.icsEv=(S.icsEv||[]).filter(e=>!String(e.id).startsWith('ics:'+i+':'));save();icsBoxPaint();icsSync(true)});
  box.querySelectorAll('[data-icc]').forEach(b=>b.onclick=()=>{const c=L[+b.dataset.icc],k=(ICS_COLS.indexOf(c.c)+1)%ICS_COLS.length;c.c=ICS_COLS[k];(S.icsEv||[]).forEach(e=>{if(String(e.id).startsWith('ics:'+b.dataset.icc+':'))e.color=c.c});save();icsBoxPaint();try{renderTodayEv()}catch(e){}});
  $('#icsA').onclick=()=>{const u=icsNormUrl($('#icsU').value);if(!/^https:\/\/\S+$/i.test(u)){toast(t('ics.badUrl'));$('#icsU').focus();return}if(/calendar\.google\.com\/calendar\/(u\/\d\/)?r(\/|$)|\/embed\?/i.test(u)){toast(t('ics.notIcal'));return}
    if(L.some(c=>icsNormUrl(c.u)===u)){toast(t('ics.dup'));return}L.push({u,n:$('#icsN').value.trim()||('📅 '+(L.length+1)),c:ICS_COLS[(L.length+1)%ICS_COLS.length]});save();icsBoxPaint();icsSync(true)};
  $('#icsHow').onclick=icsHow}
function icsHow(){openInfo('📅 '+t('ics.howT'),`<ol class="icshow">${[1,2,3,4,5].map(i=>`<li>${t('ics.h'+i)}</li>`).join('')}</ol><p class="muted">${t('ics.hNote')}</p><button class="btn sm" id="icsGo">↗ ${t('ics.open')}</button>`);const g=$('#icsGo');if(g)g.onclick=()=>openExt('https://calendar.google.com/calendar/r/settings')}
{const _r=renderV41Set;renderV41Set=function(...a){const r=_r(...a);try{const iu=$('#icsUrl');if(iu){const f=iu.closest('.field');iu.hidden=true;if(f&&!$('#icsBox'))f.insertAdjacentHTML('afterend',`<div id="icsBox" class="icsbox"></div>`);$('#icsNow').onclick=()=>icsSync(true)}icsBoxPaint()}catch(e){console.error(e)}return r}}
