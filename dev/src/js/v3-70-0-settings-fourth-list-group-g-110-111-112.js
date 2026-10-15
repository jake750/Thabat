/* ============ v3.70.0 settings (fourth list, group G: 110 111 112 114 115 116 118) ============ */
/* 111. a line of explanation under the settings that had none */
const SDESC=['ks.t','gs.t','set.mode','set.color','set.accent','set.water','set.fgAuto','set.cats','set.adhanVolume','set.fastMT','wt2.t','set.atTime','set.src','set.method','set.city','set.coords','set.riwaya','set.remRead','set.remHifz','adh.m','adh.e','set.io','set.sound'];
function sdescPaint(){document.querySelectorAll('#v-set .card .field').forEach(f=>{const lab=f.querySelector('label[data-i18n]');if(!lab||f.querySelector('small'))return;const k=lab.dataset.i18n;if(!SDESC.includes(k))return;const s=document.createElement('small');s.className='sdesc';s.textContent=t('sd.'+k.replace(/\./g,'_'));lab.after(s)})}

/* 110. «last changed» at the top of the settings list */
const SREC_K='thabat.setRecent';function srecList(){try{return JSON.parse(localStorage.getItem(SREC_K)||'[]')}catch(e){return[]}}
function srecMark(el){const f=el.closest('#v-set .field,#v-set .row');if(!f)return;const lab=f.querySelector('label[data-i18n]');if(!lab)return;const card=f.closest('.card:not(.sgsec)'),k=lab.dataset.i18n,g=card?sgAll().flat().find(x=>x.cards.includes(sgKey(card))):null;
  const L_=srecList().filter(x=>x.k!==k);L_.unshift({k,g:g&&g.k,at:Date.now()});try{localStorage.setItem(SREC_K,JSON.stringify(L_.slice(0,6)))}catch(e){}}
document.addEventListener('change',e=>{if(e.target.closest&&e.target.closest('#v-set'))srecMark(e.target)},true);
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#v-set .seg button,#v-set .tog,#v-set [role=switch],#v-set .switch');if(b)srecMark(b)},true);
function srecPaint(){const list=$('#sgList');if(!list)return;let c=$('#srecCard');const L_=srecList().filter(x=>x.g);if(!L_.length){if(c)c.remove();return}if(!c){c=document.createElement('div');c.id='srecCard';c.className='sgsec card srec';list.prepend(c)}
  c.innerHTML=`<div class="srech">${t('srec.t')}</div><div class="srecl">${L_.map(x=>`<button type="button" class="chip sm" data-k="${esc(x.k)}" data-g="${esc(x.g)}">${esc(t(x.k))}</button>`).join('')}</div>`;
  c.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{SG.cur=b.dataset.g;sgApply();$('main').scrollTop=0;setTimeout(()=>{const lab=$(`#v-set label[data-i18n="${CSS.escape(b.dataset.k)}"]`);const f=lab&&lab.closest('.field,.row');if(f){const card=f.closest('.card');if(card&&card.classList.contains('sga-open')===false){const adv=card.querySelector('.sgabtn');if(f.classList.contains('sga-x')&&adv)adv.click()}f.scrollIntoView({block:'center',behavior:'smooth'});f.classList.add('sflash');setTimeout(()=>f.classList.remove('sflash'),1600)}},120)})}

/* 115. the risky actions (restore a backup, import) sit together at the end of their card, in a marked area */
function dzPaint(){const card=[...document.querySelectorAll('#v-set .card:not(.sgsec)')].find(c=>c.querySelector('h3[data-i18n="set.backup"]'));if(!card||card.querySelector('.dzone'))return;
  const rest=[...card.querySelectorAll('button')].filter(b=>/^(استعادة|Restore)$/.test(b.textContent.trim()));let host=null;if(rest.length){host=rest[0].parentElement;while(host&&host!==card&&!rest.every(b=>host.contains(b)))host=host.parentElement;if(host===card)host=null}
  const io=card.querySelector('label[data-i18n="set.io"]');const ioRow=io&&io.closest('.field');if(!host&&!ioRow)return;
  const z=document.createElement('div');z.className='dzone';z.innerHTML=`<div class="dzh">⚠ ${t('dz.t')}</div><small class="dzs">${t('dz.s')}</small>`;card.append(z);if(ioRow)z.append(ioRow);if(host&&!host.contains(z))z.append(host)}

/* 112. PC: while the Look group is open, a live preview of the page sits beside the settings */
function lpvPaint(){const v=$('#v-set');if(!v)return;let a=$('#setLookPv');const on=SG.cur==='look'&&!MOB.matches&&innerWidth/(uiZoom()||1)>=1100;if(!on){if(a)a.remove();v.classList.remove('slpv');return}
  v.classList.add('slpv');if(!a){a=document.createElement('aside');a.id='setLookPv';a.className='slpvbox';v.append(a)}
  const s=tdaScore?tdaScore():{v:.6},nx=nextPrayer();a.innerHTML=`<div class="slpvh">${t('slpv.t')}</div><div class="card slpvc"><h3><span>${t('nav.today')}</span></h3><div class="slpvp"><b>${nx?t('pr.'+nx.k):''}</b><span>${nx?fmtT(nx.t):''}</span></div>
   <div class="slpvt"><i class="ck"></i><span>${t('lka.pvTask')}</span></div><div class="slpvt done"><i class="ck on">✓</i><span>${t('lka.pvDone')}</span></div><div class="row" style="gap:6px;margin-top:8px"><span class="btn sm pri">${t('lka.pvBtn')}</span><span class="chip sm on">${t('lka.pvChip')}</span></div></div><small class="muted">${t('slpv.s')}</small>`}

/* 114. ⚙ in a Today card's «⋯» opens the settings for that card */
const CARD_SET=[['.glasswrap','goal'],['#tasks','look','#tdlRow'],['#tDisp','goal'],['#pdlCard','look','#pdlvRow'],['#qCard','quran'],['.tdpr','prayer'],['#aydBox','quran'],['#summary','backup']];
function cardSetOf(c){for(const [sel,g,row] of CARD_SET){if(c.matches(sel)||c.querySelector(sel))return{g,row}}return null}
{const _cm=uxCardMenu;uxCardMenu=function(c,btn,...a){const r=_cm(c,btn,...a);try{const cs=cardSetOf(c),p=$('#ppPop');if(cs&&p&&!p.querySelector('[data-cset]')){p.insertAdjacentHTML('beforeend',`<button data-cset="1">⚙ ${t('cset.go')}</button>`);p.querySelector('[data-cset]').onclick=()=>{closePP();showView('set');SG.cur=cs.g;sgApply();$('main').scrollTop=0;if(cs.row)setTimeout(()=>{const el=$(cs.row);if(el){el.scrollIntoView({block:'center',behavior:'smooth'});el.classList.add('sflash');setTimeout(()=>el.classList.remove('sflash'),1600)}},150)}}}catch(e){}return r}}

/* 116. pause every alert for an hour, until tomorrow morning or a day (the adhan itself keeps its own setting) */
function alPaused(){return(+S.settings.pauseUntil||0)>Date.now()}
{const _au=alertUser;alertUser=function(title,body,...a){if(alPaused()&&!/أذان|adhan|🕌/i.test(String(title))){try{nclAdd(title,body)}catch(e){}return}return _au(title,body,...a)}}
/* Android: reminders inside the pause are left out of the native schedule (prayer times and the Fajr alarm stay) */
{hookFn('extraSched',()=>extraSched,f=>{extraSched=f},'post',function(out){try{if(!alPaused())return;const until=+S.settings.pauseUntil;for(let i=out.length-1;i>=0;i--){const x=out[i],keep=(x.id<120&&x.id%40<20)||(x.id>=5900&&x.id<5910);if(!keep&&x.t<until)out.splice(i,1)}}catch(e){}})}
function alPause(ms){S.settings.pauseUntil=ms?Date.now()+ms:0;save();try{andSchedLast=null;androidSchedule()}catch(e){}alPaint();toast(ms?t('alp.on',fmtT(S.settings.pauseUntil)):t('alp.off'))}
function alMenu(anchor){const r=anchor.getBoundingClientRect(),tm=new Date();tm.setDate(tm.getDate()+1);tm.setHours(7,0,0,0);
  const p=qPopAt(`<div class="aymh">🔕 ${t('alp.t')}</div>${alPaused()?`<button data-ms="0">🔔 ${t('alp.resume')}</button>`:''}<button data-ms="${36e5}">${t('alp.h1')}</button><button data-ms="${3*36e5}">${t('alp.h3')}</button><button data-ms="${tm-Date.now()}">${t('alp.morning')}</button><button data-ms="${864e5}">${t('alp.day')}</button>`,r.left+r.width/2,r.bottom-10,'aymenu');
  p.querySelectorAll('[data-ms]').forEach(b=>b.onclick=()=>{closePP();alPause(+b.dataset.ms)})}
function alPaint(){const b=$('#nclBtn');if(b)b.classList.toggle('paused',alPaused());const row=$('#alRow');if(row)row.querySelector('small').textContent=alPaused()?t('alp.until',fmtT(S.settings.pauseUntil)):t('alp.s')}
{const _no=nclOpen;nclOpen=function(...a){const r=_no(...a);try{const box=$('#infoBox .infob')||$('#infoBox');if(box&&!box.querySelector('#alBtn')){box.insertAdjacentHTML('afterbegin',`<div class="row" style="margin-bottom:8px"><button class="btn sm" id="alBtn">🔕 ${alPaused()?t('alp.until',fmtT(S.settings.pauseUntil)):t('alp.t')}</button></div>`);$('#alBtn').onclick=e=>alMenu(e.currentTarget)}}catch(e){}return r}}
setInterval(()=>{try{alPaint();if(S.settings.pauseUntil&&!alPaused()&&+S.settings.pauseUntil){S.settings.pauseUntil=0;save();try{androidSchedule()}catch(e){}}}catch(e){}},60000);

/* 118. a question you keep answering «yes» to: after the second time, «don't ask again» */
const ASK_SOFT=['q.jumpQ','wkp.doneQ','wb.markDone','lt.wdQ','lfg.p90Q','nte.splitQ','qrc.sendQ','imz.q','adh.hideQ'];
{const _cf=window.confirm;window.confirm=function(msg){const m=String(msg||'');let key=null;try{key=ASK_SOFT.find(k=>udoRe(k).test(m))}catch(e){}if(!key)return _cf.call(window,msg);
  const A=S.settings.askSkip||(S.settings.askSkip={});if(A[key])return true;const r=_cf.call(window,msg);if(r){const C=ASK.cnt;C[key]=(C[key]||0)+1;if(C[key]>=2)setTimeout(()=>toastAct(t('ask.never'),t('ask.ok'),()=>{A[key]=1;save();toast(t('ask.done'))},7000),60)}return r}}
const ASK={cnt:{}};

/* the settings rows for 116 and a way back for 118 */
{hookFn('renderSettings',()=>renderSettings,f=>{renderSettings=f},'post',function(){try{sdescPaint();dzPaint();
  if(!$('#alRow')){const a=$('#notifBtn');const row=a&&a.closest('.field');if(row){row.insertAdjacentHTML('afterend',`<div class="field" id="alRow"><div><label data-i18n="alp.t">${t('alp.t')}</label><small>${t('alp.s')}</small></div><button class="btn sm" id="alSetBtn">🔕 ${t('alp.choose')}</button></div>`);$('#alSetBtn').onclick=e=>alMenu(e.currentTarget);alPaint()}}
  if(!$('#askRow')&&Object.keys(S.settings.askSkip||{}).length){const a=$('#alRow');if(a){a.insertAdjacentHTML('afterend',`<div class="field" id="askRow"><div><label data-i18n="ask.row">${t('ask.row')}</label><small>${t('ask.rowS',Object.keys(S.settings.askSkip).length)}</small></div><button class="btn sm ghost" id="askReset">${t('ask.reset')}</button></div>`);$('#askReset').onclick=()=>{S.settings.askSkip={};save();$('#askRow').remove();toast(t('ask.resetOk'))}}}
  try{['alp.t'].forEach(k=>{const L_=SGA_MAIN['set.backup'];if(L_&&!L_.includes(k))L_.push(k)})}catch(e){}}catch(e){console.error(e)}})}
{hookFn('sgApply',()=>sgApply,f=>{sgApply=f},'post',function(){try{srecPaint();lpvPaint()}catch(e){}})}
{hookFn('applyTheme',()=>applyTheme,f=>{applyTheme=f},'post',function(){try{if($('#setLookPv'))lpvPaint()}catch(e){}})}
addEventListener('resize',()=>{try{lpvPaint()}catch(e){}});
{const _cc=cmdCommands;cmdCommands=function(){const L_=_cc();L_.push({icon:'🔕',label:t('alp.t'),run:()=>{const b=$('#nclBtn')||document.body;alMenu(b)},kw:'pause mute alerts notifications quiet أوقف التنبيهات إسكات'});return L_}}

