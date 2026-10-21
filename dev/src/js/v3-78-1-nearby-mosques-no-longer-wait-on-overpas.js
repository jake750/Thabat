/* ============ v3.78.1: nearby mosques no longer wait on Overpass alone (its servers were all failing): Overpass mirrors in parallel, Nominatim and Photon at the same time, merged by distance ============ */
const MQX_RE=/مسجد|جامع|مصلى|مصلّى|mosque|mosquée|mosquee|masjid|masjed|mescit|cami|moschee|moskee|mezquita/i;
const MQX_OVP=['https://overpass-api.de/api/interpreter','https://lz4.overpass-api.de/api/interpreter','https://z.overpass-api.de/api/interpreter','https://overpass.private.coffee/api/interpreter','https://overpass.kumi.systems/api/interpreter'];
function mqxAny(ps){return new Promise(res=>{let n=ps.length;if(!n)res(null);ps.forEach(p=>p.then(v=>{if(v)res(v);else if(!--n)res(null)},()=>{if(!--n)res(null)}))})}
async function mqxOverpass(lat,lng,R){const q=`[out:json][timeout:15];nwr["amenity"="place_of_worship"]["religion"="muslim"](around:${R},${lat},${lng});out center 60;`;
  const j=await mqxAny(MQX_OVP.map(h=>osmFetch(h,{method:'POST',body:'data='+encodeURIComponent(q),headers:{'Content-Type':'application/x-www-form-urlencoded'}},12000)));if(!j)return null;
  return(j.elements||[]).map(e=>{const c=e.center||{},la=e.lat!=null?e.lat:c.lat,lo=e.lon!=null?e.lon:c.lon,g=e.tags||{};return{osm:e.type[0]+e.id,name:g['name:'+LANG]||g.name||g['name:ar']||g['name:en']||'',loc:[g['addr:street'],g['addr:city']||g['addr:place']].filter(Boolean).join('، '),lat:la,lng:lo,mq:true}})}
async function mqxNominatim(lat,lng,d){const vb=`${(lng-d).toFixed(4)},${(lat+d).toFixed(4)},${(lng+d).toFixed(4)},${(lat-d).toFixed(4)}`;
  const one=w=>osmFetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=40&bounded=1&accept-language=${LANG}&viewbox=${vb}&q=${encodeURIComponent(w)}`,null,12000).catch(()=>null);
  const rs=await Promise.all(['مسجد','جامع','mosque'].map(one));if(rs.every(r=>!r))return null;
  return rs.flat().filter(Boolean).filter(x=>x.type==='place_of_worship'||MQX_RE.test(x.name||'')).map(x=>{const a=x.address||{};return{osm:String(x.osm_type||'n')[0]+x.osm_id,name:x.name||'',loc:[a.road,a.city||a.town||a.village||a.suburb].filter(Boolean).join('، '),lat:+x.lat,lng:+x.lon,mq:true}})}
async function mqxPhoton(lat,lng){const j=await osmFetch(`https://photon.komoot.io/api/?q=mosque&lat=${lat}&lon=${lng}&limit=40&osm_tag=amenity:place_of_worship`,null,12000).catch(()=>null);if(!j)return null;
  return(j.features||[]).map(f=>{const p=f.properties||{},c=(f.geometry||{}).coordinates||[];return{osm:String(p.osm_type||'N')[0].toLowerCase()+p.osm_id,name:p.name||'',loc:[p.street,p.city||p.district].filter(Boolean).join('، '),lat:+c[1],lng:+c[0],mq:true,_ph:1}}).filter(m=>MQX_RE.test(m.name||''))}
osmMosques=async function(lat,lng){const ov=mqxOverpass(lat,lng,12000).catch(()=>null);const [n,p]=await Promise.all([mqxNominatim(lat,lng,.11).catch(()=>null),mqxPhoton(lat,lng).catch(()=>null)]);
  const o=(n&&n.length)||(p&&p.length)?await Promise.race([ov,sleepMs(2500).then(()=>null)]):await ov;/* Overpass adds what the others miss, but no longer holds the list */
  if(!o&&!n&&!p)return null;const out=[],seen=new Set();
  for(const m of [...(o||[]),...(n||[]),...(p||[])]){if(!isFinite(m.lat)||!isFinite(m.lng)||seen.has(m.osm))continue;m.d=geoKm(lat,lng,m.lat,m.lng);if(m.d>12)continue;
    if(out.some(x=>geoKm(x.lat,x.lng,m.lat,m.lng)<.04&&(!m.name||!x.name||lshNorm(x.name)===lshNorm(m.name))))continue;seen.add(m.osm);delete m._ph;out.push(m)}
  return out.sort((a,b)=>(!a.name-!b.name)||a.d-b.d).slice(0,25)};

