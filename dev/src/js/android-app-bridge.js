/* ============ Android app bridge ============ */
function thabatBack(){const on=id=>{const e=$(id);return e&&e.classList.contains('on')};
  if(on('#prayModal'))return true;
  if(typeof WB!=='undefined'&&WB.present){wbPresEnd();return true}
  if($('#ppPop')){closePP();return true}
  if(document.documentElement.classList.contains('qfs')){qFs(false);return true}
  if(on('#noteModal')){closeNote(true);return true}
  if(on('#setupModal')){if(!SU.first)closeSetup();return true}
  if(on('#qPlayer')){}
  if(on('#tfsSheet')){$('#tfsSheet').classList.remove('on');return true}
  if(on('#ltModal')){closeLt();return true}
  if(on('#modal')){$('#modal').classList.remove('on');return true}
  if(on('#dayModal')){$('#dayModal').classList.remove('on');try{dayModalDone()}catch(e){}return true}
  if(on('#adhSheet')){$('#adhSheet').classList.remove('on');return true}
  if(on('#celebrate')){$('#celebrate').classList.remove('on');return true}
  const pops=$$('.pop.on');if(pops.length){pops.forEach(x=>x.classList.remove('on'));return true}
  if(curView()!=='today'){showView('today');return true}
  return false}
window.thabatBack=thabatBack;
window.thabatResume=()=>{try{takeOpen();rollover();renderAll();checkPrayers();if(SY.token)syncNow()}catch(e){}};
let andSchedLast='';
function androidSchedule(){if(!ANDROID)return;try{const P=S.settings.prayer,Q=S.quran,out=[],now=Date.now();
    for(let d=0;d<3;d++){const date=new Date();date.setDate(date.getDate()+d);const pt=prayerTimes(date);
      PRAYERS.forEach((k,i)=>{const tt=pt[k],nm=t('pr.'+k);
        if(P.enabled)out.push({id:d*40+i*2+1,t:tt-P.remind*6e4,title:t('al.pre',nm,minW(P.remind)),body:t('al.preB',fmtT(tt))});
        if(P.pause!==false||P.atTime||adhanOn()||dndCfg().on)out.push({id:d*40+i*2+2,t:tt,title:t('al.at',nm),body:t('pray.body'),...(k!=='sunrise'&&dndCfg().on?{dnd:dndCfg().min}:{}),...(k!=='sunrise'?{pk:k,laterLbl:t('pl2.btn'),laterT:t('pl2.qT',nm),laterB:t('pl2.qB')}:{}),...(k!=='sunrise'&&P.quiet!==false?{quiet:1}:{}),...(adhanOn()&&k!=='sunrise'&&adhPK(k)!=='off'?{adhan:1,volStop:P.adhanVol===false?0:1,stopLbl:t('pray.stopAdhan'),mode:adhPK(k),vol:adhanCfg().vol,fajr:k==='fajr'&&fajrName()?1:0,duaT:t('pray.duaT'),duaB:DUA_AR}:{})})});
      if(Q.rem.read.on)out.push({id:d*40+20,t:pt[Q.rem.read.prayer]+Q.rem.read.after*6e4,title:t('q.remRead'),body:t('q.wird')});
      if(Q.rem.hifz.on)out.push({id:d*40+21,t:pt[Q.rem.hifz.prayer]+Q.rem.hifz.after*6e4,title:t('q.remHifz'),body:t('q.hifz')+' · '+t('q.review')});
      const AR_=adhRemCfg();if(AR_.on)[['m',pt.fajr+AR_.m*6e4,22],['e',pt.asr+AR_.e*6e4,23]].forEach(([k,at,id])=>{if(d===0){const p=adhProgress(k);if(p.total&&p.done>=p.total)return}out.push({id:d*40+id,t:at,title:t('adh.rem.'+k),body:t('adh.remB2'),open:'adhkar-'+k})})}
    extraSched(out,now);const list=out.filter(x=>x.t>now+5000),js=JSON.stringify(list);if(js===andSchedLast)return;andSchedLast=js;window.ThabatAndroid.schedule(js)}catch(e){}widgetPush()}
if(ANDROID){setTimeout(androidSchedule,1500);setInterval(androidSchedule,10*6e4);
  document.addEventListener('click',e=>{const a=e.target.closest&&e.target.closest('a[href^="http"]');if(a){e.preventDefault();try{window.ThabatAndroid.openUrl(a.href)}catch(x){}}},true)}


