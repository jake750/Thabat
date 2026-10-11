/* ============ prayer times ============ */
/* Ezzamzmia mosque, Menzel Gabes — yearly calendar from mawaqit.net (month|day;fajr,shuruq,dhuhr,asr,maghrib,isha) */
const MQ_RAW='__MQ_RAW__';
const MQ=MQ_RAW.split('|').map(m=>m.split(';').map(d=>d.split(',')));
let MQ2=null,MQ2src='';
function mqTable(){const P=S.settings.prayer;if(!P.mqCal)return null;if(MQ2src!==P.mqCal){MQ2=P.mqCal.split('|').map(m=>m.split(';').map(d=>d.split(',')));MQ2src=P.mqCal}return MQ2}
function tableTimes(T2,date){const P=S.settings.prayer,y=date.getFullYear(),mo=date.getMonth(),dd=date.getDate(),M=T2[mo];const row=M[Math.min(dd,M.length)-1];const base=new Date(y,mo,dd).getTime(),out={};
  ['fajr','sunrise','dhuhr','asr','maghrib','isha'].forEach((k,i)=>{const [h,m]=String(row[i]||'0:0').split(':').map(Number);out[k]=base+((h*60+m)+(P.offsets[k]||0))*6e4});return out}
function prayerTimes(date){
  const P=S.settings.prayer;
  if(P.source==='mawaqit'){const T2=mqTable();if(!T2){const c=calcTimes(date),o=P.mqOff||{};for(const k in c)c[k]+=(o[k]||0)*6e4;return c}return tableTimes(T2,date)}
  if(P.source==='mosque'){const y=date.getFullYear(),mo=date.getMonth(),dd=date.getDate();const row=MQ[mo][Math.min(dd,MQ[mo].length)-1];const base=new Date(y,mo,dd).getTime();const out={};
    ['fajr','sunrise','dhuhr','asr','maghrib','isha'].forEach((k,i)=>{const [h,m]=row[i].split(':').map(Number);out[k]=base+((h*60+m)+(P.offsets[k]||0))*6e4});return out}
  return calcTimes(date)}
const rad=d=>d*Math.PI/180, deg=r=>r*180/Math.PI;
const fixA=a=>{a=a-360*Math.floor(a/360);return a<0?a+360:a}, fixH=h=>{h=h-24*Math.floor(h/24);return h<0?h+24:h};
function julian(y,m,d){if(m<=2){y--;m+=12}const A=Math.floor(y/100),B=2-A+Math.floor(A/4);return Math.floor(365.25*(y+4716))+Math.floor(30.6001*(m+1))+d+B-1524.5}
function sunPos(jd){const D=jd-2451545,g=fixA(357.529+0.98560028*D),q=fixA(280.459+0.98564736*D),Lg=fixA(q+1.915*Math.sin(rad(g))+0.020*Math.sin(rad(2*g))),e=23.439-0.00000036*D;
  const RA=fixH(deg(Math.atan2(Math.cos(rad(e))*Math.sin(rad(Lg)),Math.cos(rad(Lg))))/15);return{decl:deg(Math.asin(Math.sin(rad(e))*Math.sin(rad(Lg)))),eqt:q/15-RA}}
function calcTimes(date){
  const P=S.settings.prayer,lat=+P.lat,lng=+P.lng,y=date.getFullYear(),m=date.getMonth()+1,d=date.getDate();
  const tz=-new Date(y,m-1,d,12).getTimezoneOffset()/60;
  const jd=julian(y,m,d)-lng/(15*24);
  const mid=x=>fixH(12-sunPos(jd+x).eqt);
  const ang=(a,x,ccw)=>{const dec=sunPos(jd+x).decl;const v=(-Math.sin(rad(a))-Math.sin(rad(dec))*Math.sin(rad(lat)))/(Math.cos(rad(dec))*Math.cos(rad(lat)));const T=deg(Math.acos(Math.max(-1,Math.min(1,v))))/15;return mid(x)+(ccw?-T:T)};
  const asr=(f,x)=>{const dec=sunPos(jd+x).decl;const a=-deg(Math.atan(1/(f+Math.tan(rad(Math.abs(lat-dec))))));return ang(a,x)};
  const raw={fajr:ang(P.fajr,5/24,true),sunrise:ang(0.833,6/24,true),dhuhr:mid(12/24),asr:asr(P.asr,13/24),maghrib:ang(0.833,18/24),isha:ang(P.isha,18/24)};if(P.ishaMin>0)raw.isha=raw.maghrib+P.ishaMin/60;
  const out={};const base=new Date(y,m-1,d).getTime();
  for(const k in raw){const h=raw[k]+tz-lng/15+(P.offsets[k]||0)/60;out[k]=base+Math.round(h*60)*6e4}
  return out;
}

