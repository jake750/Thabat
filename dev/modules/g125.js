/* ============ 3.105 automation through the helper (other PC programs add tasks and notes, start/stop the timer) and the tray icon ============ */
/* The helper keeps a queue (/auto/task|note|timer from Thabat-Auto.ps1 or its tray menu; auto.json until taken); Thabat takes it every 5 s
   while it is open on a Windows PC. Nothing here works on Android or the Mac. */
const AUTO={busy:false,fail:0,next:0};
function autoOn(){return!ANDROID&&!MAC&&!S._demo&&!S._slim}
async function autoTake(){if(!autoOn()||AUTO.busy||Date.now()<AUTO.next)return;AUTO.busy=true;
  try{const c=new AbortController(),tm=setTimeout(()=>c.abort(),2000);const r=await fetch(HELPER+'/auto/take',{cache:'no-store',signal:c.signal});clearTimeout(tm);
    if(!r.ok){AUTO.next=Date.now()+(r.status===404?6e5:6e4);return}AUTO.fail=0;const L_=await r.json();if(Array.isArray(L_)&&L_.length)autoApply(L_)}
  catch(e){AUTO.fail++;AUTO.next=Date.now()+Math.min(6e5,15e3*AUTO.fail)}finally{AUTO.busy=false}}
function autoApply(L_){const tk=todayKey(),msg=[];let notes=0;
  for(const x of L_){if(!x||!x.t)continue;
    if(x.t==='task'){const text=String(x.text||'').trim().slice(0,500);if(!text)continue;const k=/^\d{4}-\d{2}-\d{2}$/.test(x.day||'')&&x.day>=tk?x.day:tk,d=day(k);d.tasks=d.tasks||[];
      const t_={id:uid(),text,done:false,created:+x.ts||Date.now(),auto2:1};if(PRAYERS.includes(x.after))t_.after=x.after;if(/^\d{2}:\d{2}$/.test(x.at||''))t_.at=x.at;d.tasks.push(t_);msg.push(t('auto.gotTask',text.slice(0,40)))}
    else if(x.t==='note'){const title=String(x.title||'').trim().slice(0,200),body=String(x.body||'');if(!title&&!body)continue;const now=Date.now();
      NOTES().push({id:uid(),title,body,imgs:[],created:+x.ts||now,updated:now,day:tk});notes++;msg.push(t('auto.gotNote',(title||body).slice(0,40)))}
    else if(x.t==='timer'){const T=S.timer;if(x.a==='start'&&T.mode!=='work'){try{if(x.cat&&topCats().some(c=>c.id===x.cat))T.cat=x.cat}catch(e){}timerAct('start');msg.push(t('auto.gotStart'))}
      else if(x.a==='stop'&&T.mode==='work'){timerAct('stop');msg.push(t('auto.gotStop'))}}}
  if(!msg.length)return;save();try{renderTasks()}catch(e){}try{if(curView()==='today')renderToday()}catch(e){}if(notes)try{notesChanged()}catch(e){}
  toast(msg.length>1?t('auto.got',msg.length)+' · '+msg[0]:msg[0])}
setInterval(autoTake,5000);setTimeout(autoTake,4000);
/* settings (Windows PC): the tray icon switch and how other programs talk to Thabat */
async function autoTrayState(){try{const r=await fetch(HELPER+'/tray',{cache:'no-store'});if(!r.ok)return null;return await r.json()}catch(e){return null}}
function autoHelp(){const ex=['thabat-auto task "اتصل بأحمد" -After asr','thabat-auto task "تسليم المشروع" -Day 2026-11-02 -At 10:00','thabat-auto note "فكرة" "نص الملاحظة"','thabat-auto timer start','thabat-auto timer stop'];
  openInfo(t('auto.t'),`<div class="autoh"><p>${esc(t('auto.sub'))}</p><p class="muted">${esc(t('auto.where'))}</p>${ex.map(c=>`<div class="autoc"><code dir="ltr">${esc(c)}</code><button class="btn sm ghost" data-ac="${esc(c)}">${esc(t('auto.copy'))}</button></div>`).join('')}<p class="muted">${esc(t('auto.safe'))}</p></div>`);
  $$('#infoBox [data-ac]').forEach(b=>b.onclick=()=>{try{navigator.clipboard.writeText(b.dataset.ac);toast(t('auto.copied'))}catch(e){}})}
{hookFn('renderSettings',()=>renderSettings,f=>{renderSettings=f},'post',function(){try{if(ANDROID||MAC)return;const r=$('#appStRow');if(!r||$('#trayRow'))return;
  r.insertAdjacentHTML('afterend',`<div class="field" id="trayRow" hidden><div><label data-i18n="auto.tray">${esc(t('auto.tray'))}</label><small>${esc(t('auto.trayS'))}</small></div><button class="sw-toggle" id="trayT" role="switch"></button></div>
    <div class="field" id="autoRow"><div><label data-i18n="auto.t">${esc(t('auto.t'))}</label><small>${esc(t('auto.rowS'))}</small></div><button class="btn sm" id="autoHB">${esc(t('auto.how'))}</button></div>`);
  $('#autoHB').onclick=autoHelp;
  autoTrayState().then(s=>{const row=$('#trayRow'),b=$('#trayT');if(!row||!b||!s)return;row.hidden=false;const paint=on=>{b.classList.toggle('on',on);b.setAttribute('aria-checked',on)};paint(!!s.on);
    b.onclick=async()=>{const on=!b.classList.contains('on');paint(on);try{await fetch(HELPER+'/tray?on='+(on?1:0),{cache:'no-store'})}catch(e){toast(t('auto.noHelper'))}}})}catch(e){console.error(e)}})}
