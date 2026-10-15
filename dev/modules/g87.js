/* ============ v3.75.0 other items (fourth list, group L: 188 190 197 198 199) ============ */
/* 199. Android widgets take the theme's colours (shell 39, bridge 9) */
function wthPush(){if(!ANDROID||andV()<9)return;try{const cs=getComputedStyle(document.documentElement),g=k=>barHex(cs.getPropertyValue(k).trim()||'#000');const panel=g('--panel').slice(1);
  const js=JSON.stringify({acc:g('--accent'),bg:'#F0'+panel,text:g('--text'),muted:g('--muted'),on:g('--onAccent')});if(wthPush.last===js)return;wthPush.last=js;window.ThabatAndroid.widgetTheme(js)}catch(e){}}
if(ANDROID){{hookFn('applyTheme',()=>applyTheme,f=>{applyTheme=f},'post',function(){setTimeout(wthPush,120)})}setTimeout(wthPush,2500)}

/* 188. morning adhkar: a reminder when they are not done by the time of Duha (sunrise + 15 min) */
function admAt(D){const pt=prayerTimes(D);return pt&&pt.sunrise?pt.sunrise+15*6e4:null}
function admDone(){try{const p=adhProgress('m');return p.total&&p.done>=p.total}catch(e){return false}}
{hookFn('extraSched',()=>extraSched,f=>{extraSched=f},'post',function(out,now){try{if(S.settings.admRem===false)return;for(let d=0;d<2;d++){const D=new Date();D.setDate(D.getDate()+d);const at=admAt(D);if(!at||at<now)continue;if(d===0&&admDone())continue;out.push({id:9460+d,t:at,title:t('adm.t'),body:t('adm.b')})}}catch(e){}})}
setInterval(()=>{try{if(ANDROID||S.settings.admRem===false)return;const at=admAt(new Date()),n=Date.now(),k=todayKey();if(!at||n<at||n>at+30*6e4||admDone())return;const A=S.admFired||(S.admFired={});if(A[k])return;A[k]=1;save();alertUser('📿 '+t('adm.t'),t('adm.b'))}catch(e){}},60000);

/* 190. optional: yesterday's unfinished tasks move to today by themselves (once a day; automatic tasks are left out) */
function carryRun(){if(!S.settings.autoCarry)return;const k=todayKey(),d=day(k);if(d.carried)return;const yk=dKey(addDays(keyToDate(k),-1)),y=S.days[yk];d.carried=1;if(!y||!y.tasks){save();return}
  let n=0;y.tasks.forEach(o=>{if(o.done||o.dismissed||o.auto||o.recurId||/^(mulk|ptpl|lod|exam)-/.test(o.id)||(o.pp||[]).some(q=>q.k===k))return;const c={id:uid(),text:o.text,done:false,created:Date.now(),from:yk,fromId:o.id};['after','est','pri','note','lib','bk'].forEach(f=>{if(o[f]!=null)c[f]=o[f]});d.tasks.push(c);(o.pp=o.pp||[]).push({k,id:c.id});n++});
  save();if(n){try{renderTasks()}catch(e){}toast(t('acr.done',n))}}
{hookFn('renderToday',()=>renderToday,f=>{renderToday=f},'pre',function(){try{carryRun()}catch(e){}})}

/* settings rows: the morning adhkar reminder (adhkar settings) and the automatic carry (Look → Today) */
{hookFn('renderSettings',()=>renderSettings,f=>{renderSettings=f},'post',function(){try{
  if(!$('#acrRow')){const a=$('#pdlvRow');if(a){a.insertAdjacentHTML('afterend',`<div class="field" id="acrRow"><div><label data-i18n="acr.t">${t('acr.t')}</label><small>${t('acr.s')}</small></div><button class="tog ${S.settings.autoCarry?'on':''}" id="acrT" role="switch" aria-checked="${!!S.settings.autoCarry}"></button></div>`);$('#acrT').onclick=e=>{S.settings.autoCarry=!S.settings.autoCarry;save();e.currentTarget.classList.toggle('on',!!S.settings.autoCarry);e.currentTarget.setAttribute('aria-checked',!!S.settings.autoCarry);if(S.settings.autoCarry){delete day(todayKey()).carried;carryRun()}}}}
  if(!$('#admRow')){const lab=$('#v-set label[data-i18n="adh.m"]');const a=lab&&lab.closest('.field');if(a){a.insertAdjacentHTML('afterend',`<div class="field" id="admRow"><div><label data-i18n="adm.row">${t('adm.row')}</label><small>${t('adm.rowS')}</small></div><button class="tog ${S.settings.admRem!==false?'on':''}" id="admT" role="switch" aria-checked="${S.settings.admRem!==false}"></button></div>`);$('#admT').onclick=e=>{S.settings.admRem=S.settings.admRem===false;save();e.currentTarget.classList.toggle('on',S.settings.admRem!==false);e.currentTarget.setAttribute('aria-checked',S.settings.admRem!==false);try{andSchedLast=null;androidSchedule()}catch(x){}}}}
  try{const L_=SGA_MAIN['set.look'];if(L_&&!L_.includes('acr.t'))L_.push('acr.t')}catch(e){}}catch(e){console.error(e)}})}
