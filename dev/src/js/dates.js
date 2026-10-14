/* ============ dates ============ */
const DAYMS=864e5;
function dKey(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())}
function logicalDate(ts){return new Date(ts-S.settings.dayStart*36e5)}
function keyOf(ts){return dKey(logicalDate(ts))}
function todayKey(){return keyOf(Date.now())}
function keyToDate(k){const [y,m,d]=k.split('-').map(Number);return new Date(y,m-1,d)}
function addDays(d,n){const x=new Date(d);x.setDate(x.getDate()+n);return x}
function dayBoundaryAfter(ts){const ld=logicalDate(ts);return new Date(ld.getFullYear(),ld.getMonth(),ld.getDate()+1,S.settings.dayStart).getTime()}
function day(k){if(!S.days[k])S.days[k]={tasks:[],summary:'',sessions:[],media:[],goal:wdGoal(k)};if(!S.days[k].media)S.days[k].media=[];return S.days[k]}
const HF={};
function hFmt(){if(!HF[LANG]){const loc=LANG==='ar'?'ar':'en';try{HF[LANG]=new Intl.DateTimeFormat(loc+'-u-ca-islamic-umalqura-nu-latn',{day:'numeric',month:'long',year:'numeric'})}catch(e){HF[LANG]=new Intl.DateTimeFormat(loc+'-u-ca-islamic-nu-latn',{day:'numeric',month:'long',year:'numeric'})}}return HF[LANG]}
function hijri(date){const d=new Date(date);d.setDate(d.getDate()+S.settings.hijriAdj);d.setHours(12);const p=hFmt().formatToParts(d);const g=x=>(p.find(q=>q.type===x)||{}).value||'';return{day:+g('day').replace(/\D/g,''),month:g('month'),year:g('year').replace(/\D/g,'')}}
function hStr(date){const h=hijri(date);return h.day+' '+h.month+' '+h.year+' '+t('hijriSuffix')}
function gStr(date){return date.getDate()+' '+L().months[date.getMonth()]+' '+date.getFullYear()}
function gShort(date){return date.getDate()+' '+L().months[date.getMonth()]}
function fmtHM(ms){const m=Math.round(ms/6e4);const h=Math.floor(m/60),mm=m%60;const H=t('u.h'),M=t('u.m');return h?(mm?h+H+' '+mm+M:h+H):mm+M}
function fmtClock(ms){ms=Math.max(0,ms);const s=Math.floor(ms/1000);return pad(Math.floor(s/3600))+':'+pad(Math.floor(s/60)%60)+':'+pad(s%60)}
const fnum=x=>String(Math.round(x*100)/100);
function fmtT(ts){const d=new Date(ts);return pad(d.getHours())+':'+pad(d.getMinutes())}
const minW=m=>LANG==='ar'?m+' '+(m>=3&&m<=10?'دقائق':'دقيقة'):m+' min';

