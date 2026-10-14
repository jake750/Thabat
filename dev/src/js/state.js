/* ============ state ============ */
const KEY='thabat.v1';
const DEF={
  settings:{lang:'ar',mode:'dark',color:'yellow',style:'glass',accent:null,water:null,goalHours:8,dayStart:3,carry:false,sound:true,hijriAdj:0,
    categories:[{id:'study',name:'دراسة',color:'#3d8bff'},{id:'course',name:'دورات',color:'#dc4d8c'},{id:'gym',name:'تمرين',color:'#249b4b'},{id:'work',name:'عمل',color:'#9466e8'},{id:'quran',name:'قرآن',color:'#eb6834'},{id:'q-hifz',name:'حفظ',color:'#eb6834',parent:'quran'},{id:'q-review',name:'مراجعة',color:'#eb6834',parent:'quran'},{id:'q-wird',name:'ورد',color:'#eb6834',parent:'quran'},{id:'q-tilawa',name:'تلاوة عشوائية',color:'#eb6834',parent:'quran'}],
    prayer:{source:'mosque',enabled:true,remind:15,atTime:false,pause:true,city:'tunis',lat:36.8065,lng:10.1815,fajr:18,isha:18,asr:1,offsets:{fajr:0,dhuhr:0,asr:0,maghrib:0,isha:0}}},
  days:{},
  timer:{mode:'idle',cat:'study',start:null,brkStart:null,brkDur:null,brkAlerted:false},
  boards:[{id:'b1',name:'ملاحظات',els:[],view:{x:40,y:40,z:1}}],
  activeBoard:'b1',adhkar:{},
  quran:{page:0,start:1,riwaya:'hafs',div:'juz',kStart:null,khatmas:[],wird:20,review:5,memorized:[],reviewPtr:0,view:1,dark:true,rem:{read:{on:true,prayer:'fajr',after:20},hifz:{on:true,prayer:'asr',after:30}}},
  notified:{},lastDay:null,migr:0
};
let S;
const ANDROID=!!window.ThabatAndroid;if(ANDROID)document.documentElement.classList.add('android');const MAC=!ANDROID&&/Macintosh|Mac OS X/.test(navigator.userAgent)&&!(navigator.maxTouchPoints>1);if(MAC)document.documentElement.classList.add('mac');
const MOB=matchMedia('(max-width:700px)');
const FIRST_RUN=!localStorage.getItem(KEY);const APP_VER='3.49.0';let PRE_UPD=null;try{const ov=localStorage.getItem('thabat.ver');if(!FIRST_RUN&&ov!==APP_VER)PRE_UPD={from:ov||'2.4',raw:localStorage.getItem(KEY)}}catch(e){}try{S=(window.__THABAT_BOOT&&window.__THABAT_BOOT.o)||JSON.parse(localStorage.getItem(KEY))}catch(e){}
S=deepMerge(structuredClone(DEF),S||{});
function deepMerge(a,b){for(const k in b){if(b[k]&&typeof b[k]==='object'&&!Array.isArray(b[k])&&a[k]&&typeof a[k]==='object'&&!Array.isArray(a[k]))deepMerge(a[k],b[k]);else a[k]=b[k]}return a}
if(S.settings.theme){const MAP={midnight:['dark','yellow'],amoled:['black','yellow'],paper:['light','yellow'],nord:['dark','lightblue'],dracula:['dark','purple'],forest:['dark','green'],mocha:['dark','pink'],ember:['dark','orange']};const m=MAP[S.settings.theme]||MAP.midnight;S.settings.mode=m[0];S.settings.color=m[1];delete S.settings.theme}
if((S.migr||0)<2){const OLD={study:'#7aa2f7',course:'#bb9af7',gym:'#9ece6a',work:'#e0af68'},NEW={study:'#3d8bff',course:'#dc4d8c',gym:'#249b4b',work:'#9466e8'};
  S.settings.categories.forEach(c=>{if(OLD[c.id]&&c.color.toLowerCase()===OLD[c.id])c.color=NEW[c.id]});S.migr=Math.max(S.migr||0,2)}
if((S.migr||0)<4){if(S.settings.style==='minimal')S.settings.style='glass';S.migr=4}
if((S.migr||0)<5){if(!S.settings.categories.some(c=>c.id==='quran'))S.settings.categories.push({id:'quran',name:'قرآن',color:'#eb6834'},{id:'q-hifz',name:'حفظ',color:'#eb6834',parent:'quran'},{id:'q-review',name:'مراجعة',color:'#eb6834',parent:'quran'},{id:'q-wird',name:'ورد',color:'#eb6834',parent:'quran'},{id:'q-tilawa',name:'تلاوة عشوائية',color:'#eb6834',parent:'quran'});S.migr=5}
if((S.migr||0)<6){S.settings.carry=false;S.migr=6}
LANG=S.settings.lang||'ar';
let saveT;
let lsT=null;function flushSave(){clearTimeout(lsT);lsT=null;try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
window.thabatFlush=flushSave;document.addEventListener('visibilitychange',()=>{if(document.hidden&&lsT)flushSave()});window.addEventListener('pagehide',()=>{if(lsT)flushSave()});
function save(){clearTimeout(lsT);lsT=setTimeout(flushSave,350);clearTimeout(saveT);saveT=setTimeout(folderBackup,4000);if(window.syncTouched)syncTouched()}

