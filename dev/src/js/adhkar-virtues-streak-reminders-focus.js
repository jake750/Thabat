/* ============ adhkar: virtues, streak, reminders, focus ============ */
const ADH_FADL={
  0:['من قالها حين يصبح أُجير من الجن حتى يمسي، ومن قالها حين يمسي أُجير منهم حتى يصبح.','رواه النسائي في الكبرى والحاكم وصححه'],
  1:['«قل هو الله أحد والمعوذتين حين تمسي وحين تصبح ثلاث مرات تكفيك من كل شيء».','رواه أبو داود والترمذي'],
  2:['«قل هو الله أحد والمعوذتين حين تمسي وحين تصبح ثلاث مرات تكفيك من كل شيء».','رواه أبو داود والترمذي'],
  3:['«قل هو الله أحد والمعوذتين حين تمسي وحين تصبح ثلاث مرات تكفيك من كل شيء».','رواه أبو داود والترمذي'],
  6:['سيد الاستغفار: من قالها موقناً بها حين يمسي فمات من ليلته دخل الجنة، ومن قالها موقناً بها حين يصبح فمات من يومه دخل الجنة.','رواه البخاري'],
  7:['من قالها أربعاً أعتقه الله من النار.','رواه أبو داود، وفي إسناده ضعف'],
  8:['من قالها حين يصبح فقد أدّى شكر يومه، ومن قالها حين يمسي فقد أدّى شكر ليلته.','رواه أبو داود، وفي إسناده كلام'],
  10:['من قالها سبعاً كفاه الله ما أهمّه.','رواه أبو داود موقوفاً على أبي الدرداء'],
  11:['لم يكن النبي ﷺ يدع هؤلاء الدعوات حين يمسي وحين يصبح.','رواه أبو داود وابن ماجه'],
  12:['أمر النبي ﷺ أبا بكر أن يقولها إذا أصبح وإذا أمسى وإذا أخذ مضجعه.','رواه أبو داود والترمذي'],
  13:['من قالها ثلاث مرات لم يضرّه شيء.','رواه أبو داود والترمذي'],
  14:['من قالها ثلاثاً حين يصبح وحين يمسي كان حقاً على الله أن يرضيه يوم القيامة.','رواه أحمد وأبو داود'],
  15:['أوصى بها النبي ﷺ فاطمة رضي الله عنها أن تقولها إذا أصبحت وإذا أمست.','رواه النسائي في الكبرى والحاكم'],
  18:['من قالها مائة مرة لم يأتِ أحد يوم القيامة بأفضل مما جاء به إلا أحد قال مثل ما قال أو زاد عليه.','رواه مسلم'],
  19:['من قالها عشر مرات كان كمن أعتق أربعة أنفس من ولد إسماعيل.','متفق عليه'],
  20:['قالها النبي ﷺ لجويرية: «لو وُزنت بما قلتِ منذ اليوم لوزنتهن».','رواه مسلم'],
  21:['كان النبي ﷺ يقوله إذا صلّى الصبح.','رواه ابن ماجه'],
  22:['«يا أيها الناس توبوا إلى الله، فإني أتوب في اليوم إليه مائة مرة».','رواه مسلم'],
  23:['من قالها لم يضرّه شيء.','رواه مسلم'],
  24:['«من صلّى عليّ حين يصبح عشراً وحين يمسي عشراً أدركته شفاعتي يوم القيامة».','رواه الطبراني، وفي إسناده ضعف']};
function adhFadl(a){if(String(a.key||'').startsWith('x'))return null;if(a.custom){const c=(S.adhCustom||[]).find(x=>x.id===a.cid);return c&&c.fadl?[c.fadl,'']:null}return ADH_FADL[a.i]||null}
function adhStreak(){let d=keyToDate(todayKey()),n=0;if(adhLvl((S.days[todayKey()]||{}).adh)<3)d=addDays(d,-1);for(let i=0;i<4000;i++){const k=dKey(d);if(adhLvl((S.days[k]||{}).adh)===3){n++;d=addDays(d,-1)}else break}return n}
function adhBestStreak(){const ks=Object.keys(S.days).filter(k=>adhLvl(S.days[k].adh)===3).sort();let best=0,cur=0,prev=null;for(const k of ks){cur=prev&&dKey(addDays(keyToDate(prev),1))===k?cur+1:1;best=Math.max(best,cur);prev=k}return best}
function vib(ms){try{if(navigator.vibrate)navigator.vibrate(ms)}catch(e){}}
/* reminders */
function adhRemCfg(){return Object.assign({on:true,m:30,e:15},S.settings.adhRem||{})}
function checkAdhRem(){const R=adhRemCfg();if(!R.on||ANDROID)return;const now=Date.now(),pt=prayerTimes(new Date()),dk=dKey(new Date());
  [['m',pt.fajr+R.m*6e4],['e',pt.asr+R.e*6e4]].forEach(([k,at])=>{const key=dk+'adh-'+k;if(now>=at&&now<at+2*36e5&&!S.notified[key]){S.notified[key]=1;save();const p=adhProgress(k);
    if(p.total&&p.done<p.total&&!$('#adhSheet').classList.contains('on')){alertUser(t('adh.rem.'+k),t('adh.remB',p.total-p.done),k==='m'?ICON_SUN:ICON_MOON);const b=$('#mOk'),old=b.onclick,tx=b.textContent;b.textContent=t('adh.openNow');
      b.onclick=()=>{$('#modal').classList.remove('on');b.onclick=old;b.textContent=tx;openAdhkar(k)}}}})}
function thabatOpen(w){if(!w)return;if(w==='timer'){showView('today');if(S.timer.mode==='idle')timerAct('start');return}if(w==='note'){showView('boards');nbMode='notes';renderBoardsView();openNote(null,todayKey());return}if(w==='quran'){showView('quran');return}if(w==='search'){cmdOpen();return}if(w==='adhkar'){showView('today');openAdhkar();return}if(w==='cal'){selKey=todayKey();showView('cal');return}if(w.startsWith('adhkar')){const k=w.split('-')[1];showView('today');openAdhkar(k==='m'||k==='e'||k==='d'?k:undefined)}}
window.thabatOpen=thabatOpen;
function takeOpen(){if(!ANDROID)return;try{if(window.ThabatAndroid.takeOpen){const o=window.ThabatAndroid.takeOpen();if(o)setTimeout(()=>thabatOpen(o),300)}}catch(e){}}
/* focus (one at a time) */
let adhFI=null;
function adhFocusNext(items,st,from){const n=items.length;for(let j=1;j<=n;j++){const i=(from+j)%n,a=items[i];if((st[a.key]||0)<a.n)return i}return -1}
function renderAdhFocus(anim){const k=adhK,st=adhState(k),items=adhItems(k),p=adhProgress(k);
  $$('#adhSeg button').forEach(b=>b.classList.toggle('on',b.dataset.k===k));{const xb=$('#adhSeg [data-k=x]');if(xb)xb.hidden=!adhExtraOn()}$('#adhProg').textContent=t('adh.prog',p.done,p.total);$('#adhBar').style.width=(p.total?p.done/p.total*100:0)+'%';
  const L=$('#adhList');if(!items.length){L.innerHTML=`<div class="empty">${t(k==='d'?'adh.emptyD':'adh.emptyP')}</div>`;return}
  if(adhFI==null||adhFI>=items.length){const f=items.findIndex(a=>(st[a.key]||0)<a.n);adhFI=f<0?0:f}
  const a=items[adhFI],c=st[a.key]||0,done=c>=a.n,f=adhFadl(a),C=326.7,all=p.total&&p.done===p.total;
  L.innerHTML=`<div class="adhf ${done?'done':''} ${anim||''}" id="adhF">${all?`<div class="alldone">${t('adh.allDone')}</div>`:''}
    <div class="afpos">${adhFI+1} / ${items.length}${a.src?' · '+esc(a.src):''}</div>
    <div class="aftx" dir="rtl" lang="ar">${esc(a.text)}</div>
    ${f?`<div class="affadl" dir="rtl">✦ ${esc(f[0])}${f[1]?` <small>— ${esc(f[1])}</small>`:''}</div>`:''}
    <div class="afring"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="52" class="bg"/><circle cx="60" cy="60" r="52" class="fg" id="afArc" style="stroke-dasharray:${C};stroke-dashoffset:${C*(1-Math.min(1,c/a.n))}"/></svg><b id="afCnt">${done?'✓':a.n-c}</b></div>
    <div class="afhint">${t(done?'adh.fDone':'adh.tapHint')}</div>
    <div class="afnav"><button class="btn sm ghost" data-nv="-1">‹ ${t('prev')}</button><button class="btn sm ghost" data-undo>${t('adh.undo')}</button><button class="btn sm ghost" data-nv="1">${t('next')} ›</button></div></div>`;
  const F=$('#adhF'),rtl=document.documentElement.dir==='rtl';let sx=0,sy=0,down=false;
  const go=d=>{adhFI=(adhFI+d+items.length)%items.length;renderAdhFocus(d>0?'sl':'sr')};
  F.querySelectorAll('[data-nv]').forEach(b=>b.onclick=e=>{e.stopPropagation();go(+b.dataset.nv)});
  F.querySelector('[data-undo]').onclick=e=>{e.stopPropagation();st[a.key]=0;adhRecord();save();renderAdhBtn();renderAdhFocus()};
  F.onpointerdown=e=>{if(e.target.closest('button'))return;down=true;sx=e.clientX;sy=e.clientY};
  F.onpointerup=e=>{if(!down)return;down=false;const dx=e.clientX-sx,dy=e.clientY-sy;if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)*1.3){go((dx<0)!==rtl?1:-1);return}if(Math.abs(dy)>30)return;adhFocusTap()}}
function adhFocusTap(){const k=adhK,st=adhState(k),items=adhItems(k),a=items[adhFI];if(!a)return;const c=st[a.key]||0;if(c>=a.n){const nx=adhFocusNext(items,st,adhFI);if(nx>=0){adhFI=nx;renderAdhFocus('sl')}return}
  st[a.key]=c+1;const done=st[a.key]>=a.n,C=326.7;$('#afArc').style.strokeDashoffset=C*(1-Math.min(1,st[a.key]/a.n));$('#afCnt').textContent=done?'✓':a.n-st[a.key];
  const F=$('#adhF');F.classList.remove('pulse');void F.offsetWidth;F.classList.add('pulse');
  if(!done){vib(12);save();return}
  vib([30,40,60]);chimeSoft(1175);adhRecord();save();renderAdhBtn();if(curView()==='cal')renderCal();F.classList.add('done');
  setTimeout(()=>{if(!$('#adhSheet').classList.contains('on')||!S.adhFocus)return;const nx=adhFocusNext(items,st,adhFI);if(nx>=0){adhFI=nx;renderAdhFocus('sl')}else renderAdhFocus()},550)}
document.addEventListener('keydown',e=>{if(!S.adhFocus||!$('#adhSheet').classList.contains('on')||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;const rtl=document.documentElement.dir==='rtl';
  if(e.key===' '||e.key==='Enter'){e.preventDefault();adhFocusTap()}else if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();const items=adhItems(adhK);adhFI=(adhFI+((e.key==='ArrowLeft')===rtl?1:-1)+items.length)%items.length;renderAdhFocus()}});
