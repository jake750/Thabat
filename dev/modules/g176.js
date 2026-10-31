/* ============ v3.149 UX list G, first run and settings: what the device already tells (time zone, language, a guessed country and method, each with «غيّر»), today's real prayer times as soon as the place is known, «اختر لونك» with a live Today, categories from ready chips, one sentence on top of each settings group, red only inside the danger zone, switch state in words on phones, what each area holds before switching it off, the age of the last backup ============ */
const UX7={};
const TZ_CC={'Africa/Tunis':'TN','Africa/Algiers':'DZ','Africa/Casablanca':'MA','Africa/El_Aaiun':'MA','Africa/Tripoli':'LY','Africa/Cairo':'EG','Africa/Khartoum':'SD','Africa/Nouakchott':'MR','Asia/Damascus':'SY','Asia/Beirut':'LB','Asia/Amman':'JO','Asia/Gaza':'PS','Asia/Hebron':'PS','Asia/Jerusalem':'PS','Asia/Baghdad':'IQ','Asia/Riyadh':'SA','Asia/Aden':'YE','Asia/Dubai':'AE','Asia/Qatar':'QA','Asia/Bahrain':'BH','Asia/Muscat':'OM','Asia/Kuwait':'KW','Europe/Istanbul':'TR','Asia/Karachi':'PK','Asia/Kolkata':'IN','Asia/Calcutta':'IN','Asia/Dhaka':'BD','Asia/Jakarta':'ID','Asia/Kuala_Lumpur':'MY','Asia/Singapore':'SG','Asia/Tehran':'IR','Europe/Paris':'FR','Europe/London':'GB','Europe/Berlin':'DE','Europe/Brussels':'BE','Europe/Amsterdam':'NL','Europe/Rome':'IT','Europe/Madrid':'ES','Europe/Stockholm':'SE','America/New_York':'US','America/Chicago':'US','America/Denver':'US','America/Los_Angeles':'US','America/Toronto':'CA','Australia/Sydney':'AU'};
function su7Tz(){try{return Intl.DateTimeFormat().resolvedOptions().timeZone||''}catch(e){return''}}
function su7GuessCc(){const z=su7Tz();if(TZ_CC[z])return TZ_CC[z];const m=String(navigator.language||'').match(/-([A-Z]{2})$/i);return m?m[1].toUpperCase():''}
function su7CcName(cc){if(!cc)return t('ux7.unknown');try{return new Intl.DisplayNames([LANG],{type:'region'}).of(cc)||cc}catch(e){return cc}}
function su7Method(){return SU.mUser||CC_METHOD[SU.cc||SU.gcc]||'mwl'}
/* 81: the start step shows what the device already tells */
function su7DevCard(){if(SU.gcc===undefined)SU.gcc=su7GuessCc();const M=METHODS[su7Method()]||METHODS.mwl,ch=k=>`<button class="link su7ch" data-su7="${k}">${t('ux7.change')}</button>`;
  return`<div class="su7dev"><small class="su7h">${t('ux7.devH')}</small>
    <div class="su7r"><span>${t('ux7.tz')}</span><b dir="ltr">${esc(su7Tz()||'—')}</b></div>
    <div class="su7r"><span>${t('ux7.lang')}</span><b>${LANG==='ar'?'العربية':'English'}</b>${ch('lang')}</div>
    <div class="su7r"><span>${t('ux7.cc')}</span><b dir="auto">${esc(su7CcName(SU.gcc))}</b>${ch('cc')}</div>
    <div class="su7r"><span>${t('ux7.method')}</span><b dir="auto">${esc(M[LANG]||M.en)}</b>${ch('m')}</div></div>`}
function su7Pick(k,btn){const row=btn.closest('.su7r');if(!row)return;
  if(k==='lang'){setLang(LANG==='ar'?'en':'ar');renderSetup();return}
  const opts=k==='cc'?Object.keys(CC_METHOD).map(c=>[c,su7CcName(c)]).sort((a,b)=>a[1].localeCompare(b[1])):Object.keys(METHODS).map(m=>[m,METHODS[m][LANG]||METHODS[m].en]);
  const cur=k==='cc'?SU.gcc:su7Method();row.querySelector('b').outerHTML=`<select class="in su7sel" aria-label="${esc(t(k==='cc'?'ux7.cc':'ux7.method'))}">${opts.map(([v,n])=>`<option value="${v}"${v===cur?' selected':''}>${esc(n)}</option>`).join('')}</select>`;btn.remove();
  const s=row.querySelector('select');s.onchange=()=>{if(k==='cc'){SU.gcc=s.value;SU.mUser=''}else SU.mUser=s.value;renderSetup()};s.focus()}
/* the location flow keeps the guessed country when it finds none, and the method you chose */
{const _m=suMosques;suMosques=function(...a){if(!SU.cc&&SU.gcc)SU.cc=SU.gcc;const p=_m(...a);try{if(SU.mUser&&SU.method!==SU.mUser){SU.method=SU.mUser;renderSetup()}}catch(e){}return p}}
/* 82: today's real times for the place, before the rest */
function su7Times(){if(!SU.coords)return null;const P=S.settings.prayer,bak=JSON.parse(JSON.stringify(P));
  try{P.source='calc';P.lat=+SU.coords[0];P.lng=+SU.coords[1];P.offsets={fajr:0,dhuhr:0,asr:0,maghrib:0,isha:0};applyMethod(SU.method||su7Method());return calcTimes(new Date())}catch(e){return null}finally{Object.keys(P).forEach(k=>delete P[k]);Object.assign(P,bak)}}
function su7TimesHTML(){const pt=su7Times();if(!pt)return'';const now=Date.now(),nx=PRAYERS.find(k=>pt[k]>now);
  return`<div class="su7pt"><small>${t('ux7.ptH')}</small><div class="su7ptr">${PRAYERS.map(k=>`<span class="${k===nx?'nx':''}"><b>${t('pr.'+k)}</b>${fmtT(pt[k])}</span>`).join('')}</div></div>`}
/* 83: «اختر لونك» with a live Today; 84: categories from ready chips */
const SU7_EXTRA=[['read','#14b8a6'],['family','#f59e0b'],['design','#ec4899'],['proj','#64748b']];
function su7Mock(){const pt=prayerTimes(new Date()),now=Date.now(),nx=PRAYERS.find(k=>pt[k]>now)||'fajr',left=Math.max(0,Math.round((pt[nx]-now)/6e4));
  return`<div class="su7mock" aria-hidden="true"><div class="su7mc"><small>${esc(t('ux7.mToday'))}</small><b>${esc(gShort(new Date()))}</b><span class="su7mbar"><i style="width:62%"></i></span><small>62%</small></div>
    <div class="su7mc"><small>${esc(t('ux7.mNext'))}</small><b>${t('pr.'+nx)} · ${fmtT(pt[nx])}</b><small>${left>=60?Math.floor(left/60)+':'+pad(left%60):left+' '+t('ux7.min')}</small></div>
    <div class="su7mc wide"><span class="su7mck on">✓</span><span>${esc(t('ux7.mTask1'))}</span><span class="su7mck">○</span><span>${esc(t('ux7.mTask2'))}</span><button class="btn sm pri" tabindex="-1">▶ ${esc(t('ux7.mStart'))}</button></div></div>`}
function su7ColorHTML(){const st=S.settings,keys=Object.keys(COLORS).filter(k=>COLORS[k]&&COLORS[k].n&&COLORS[k].d&&!['sys','custom'].includes(k)&&!COLORS[k].msh);
  return`<div class="su7steps">${su7Dots(1)}</div><h2>${t('ux7.colT')}</h2><p class="susub">${t('ux7.colS')}</p>${su7Mock()}
    <div class="su7sw" role="radiogroup" aria-label="${esc(t('ux7.colT'))}">${keys.map(k=>`<button class="su7c${st.color===k?' on':''}" data-su7c="${k}" role="radio" aria-checked="${st.color===k}" title="${esc(COLORS[k].n[LANG]||k)}" aria-label="${esc(COLORS[k].n[LANG]||k)}" style="--c:${COLORS[k].d}"></button>`).join('')}</div>
    <div class="su7md">${Object.keys(MODES).map(m=>`<button class="btn sm${st.mode===m?' on':''}" data-su7m="${m}">${esc(MODES[m][LANG]||m)}</button>`).join('')}</div>
    <div class="suopts"><button class="btn pri" data-su7go="cats">${t('ux7.next')}</button></div>`}
function su7Dots(n){return[1,2].map(i=>`<i class="${i<=n?'on':''}"></i>`).join('')}
function su7CatsHTML(){const top=(S.settings.categories||[]).filter(c=>!c.parent),sel=UX7.sel||(UX7.sel=new Set(['quran']));
  const chips=[...top.map(c=>[c.id,c.name,c.color]),...SU7_EXTRA.filter(([k])=>!top.some(c=>c.id==='x-'+k)).map(([k,col])=>['x-'+k,t('ux7.c.'+k),col])];
  return`<div class="su7steps">${su7Dots(2)}</div><h2>${t('ux7.catT')}</h2><p class="susub">${t('ux7.catS')}</p>
    <div class="su7cats">${chips.map(([id,n,col])=>`<button class="su7cat${sel.has(id)?' on':''}" data-su7k="${esc(id)}" data-n="${esc(n)}" data-col="${esc(col||'')}" aria-pressed="${sel.has(id)}" style="--c:${esc(col||'var(--accent)')}"><i></i>${esc(n)}</button>`).join('')}</div>
    <small class="sunote">${t('ux7.catN',sel.size)}</small>
    <div class="suopts"><button class="btn pri" data-su7go="fin"${sel.size?'':' disabled'}>${t('ux7.done')}</button><button class="btn ghost" data-su7go="keep">${t('ux7.keepAll')}</button></div>`}
function su7CatsApply(){const sel=UX7.sel;if(!sel||!sel.size)return;const C=S.settings.categories||(S.settings.categories=[]);
  const used=new Set();Object.values(S.days||{}).forEach(d=>(d.sessions||[]).forEach(s=>{if(s.cat)used.add(s.cat)}));
  const topOf=id=>{const c=C.find(x=>x.id===id);return c&&c.parent?c.parent:id};
  const keep=C.filter(c=>sel.has(topOf(c.id))||used.has(c.id)||used.has(topOf(c.id)));
  [...sel].filter(id=>id.startsWith('x-')&&!keep.some(c=>c.id===id)).forEach(id=>{const b=document.querySelector(`[data-su7k="${CSS.escape(id)}"]`);keep.push({id,name:b?b.dataset.n:id.slice(2),color:b&&b.dataset.col||'#64748b'})});
  S.settings.categories=keep;save();try{renderCatChips&&renderCatChips()}catch(e){}}
{const _g=suGo;suGo=function(g,...a){if(g==='close'&&SU.first&&SU.step==='done'&&!UX7.done){SU.step='color';renderSetup();return}return _g(g,...a)}}
/* the steps of the setup window */
{hookFn('renderSetup',()=>renderSetup,f=>{renderSetup=f},'post',function(){try{const b=$('#setupBox');if(!b)return;
  if(SU.step==='start'&&!b.querySelector('.su7dev')){const o=b.querySelector('.suopts');if(o)o.insertAdjacentHTML('beforebegin',su7DevCard());b.querySelectorAll('[data-su7]').forEach(x=>x.onclick=()=>su7Pick(x.dataset.su7,x))}
  if(SU.step==='mosques'&&SU.coords&&!b.querySelector('.su7pt')){const s=b.querySelector('.susub');if(s)s.insertAdjacentHTML('beforebegin',su7TimesHTML())}
  if(SU.step==='color'||SU.step==='cats'){b.innerHTML=SU.step==='color'?su7ColorHTML():su7CatsHTML();
    b.querySelectorAll('[data-su7c]').forEach(x=>x.onclick=()=>{S.settings.color=x.dataset.su7c;applyTheme();save();renderSetup()});
    b.querySelectorAll('[data-su7m]').forEach(x=>x.onclick=()=>{S.settings.mode=x.dataset.su7m;applyTheme();save();renderSetup()});
    b.querySelectorAll('[data-su7k]').forEach(x=>x.onclick=()=>{const s=UX7.sel,k=x.dataset.su7k;if(s.has(k))s.delete(k);else s.add(k);renderSetup()});
    b.querySelectorAll('[data-su7go]').forEach(x=>x.onclick=()=>{const g=x.dataset.su7go;if(g==='cats'){SU.step='cats';renderSetup();return}if(g==='fin')su7CatsApply();UX7.done=1;closeSetup();try{renderAll()}catch(e){}})}}catch(e){console.error(e)}})}
/* 86: one sentence on top of each settings group */
function sg7Paint(){const bar=$('#sgBar');if(!bar)return;let p=$('#sg7d');const on=!bar.hidden&&SG.cur;if(!on){if(p)p.remove();return}
  const k='ux7.sg.'+SG.cur,tx=t(k);if(!tx||tx===k){if(p)p.remove();return}if(!p){bar.insertAdjacentHTML('afterend','<p class="sg7d" id="sg7d"></p>');p=$('#sg7d')}p.textContent=tx}
{hookFn('sgApply',()=>sgApply,f=>{sgApply=f},'post',function(){try{sg7Paint()}catch(e){}})}
/* 87: red only inside «منطقة الحذر»; elsewhere a destructive button looks plain and asks as before */
function dz7Paint(){const v=$('#v-set');if(!v)return;v.querySelectorAll('.btn.danger,.btn.dng,button.dng').forEach(b=>{if(!b.closest('.dzone'))b.classList.add('dz7out')});
  const dz=v.querySelector('.dzone');if(dz&&!dz.querySelector('.dz7h'))dz.insertAdjacentHTML('afterbegin',`<div class="dz7h">⚠ ${t('ux7.dz')}</div>`)}
/* 88: switch state in words on phones */
function sw7Words(){const r=document.documentElement.style;r.setProperty('--sw7on',JSON.stringify(t('ux7.on')));r.setProperty('--sw7off',JSON.stringify(t('ux7.off')))}
{hookFn('renderSettings',()=>renderSettings,f=>{renderSettings=f},'post',function(){try{sw7Words();dz7Paint();bk7Paint();sg7Paint()}catch(e){console.error(e)}})}
/* 89: each area says what it holds before you switch it off */
function ar7Has(k){const n=(a)=>Array.isArray(a)?a.length:a&&typeof a==='object'?Object.keys(a).length:0,P=[];
  try{if(k==='lib'){const l=n(LIBS().prog),b=bkAll().length;if(l)P.push([l,'درس']);if(b)P.push([b,'كتاب'])}
    else if(k==='boards'){const b=n(S.boards);if(b)P.push([b,'لوح'])}
    else if(k==='goals'){const g=n(S.goals)+n(S.projects);if(g)P.push([g,'هدف'])}
    else if(k==='media'){let m=0;Object.values(S.days||{}).forEach(d=>m+=n(d.media));if(m)P.push([m,'عنصر'])}
    else if(k==='inbox'){const i=n(S.inbox);if(i)P.push([i,'فكرة'])}
    else if(k==='badges'){const b=n(S.badges);if(b)P.push([b,'وسام'])}
    else if(k==='letters'){const l=n(S.letters);if(l)P.push([l,'رسالة'])}
    else if(k==='health'){let h=0;Object.values(S.days||{}).forEach(d=>{if(d.sleep3||(d.sport3&&d.sport3.length))h++});if(h)P.push([h,'يوم'])}
    else if(k==='studio'){const s=S.studio;const c=s?n(s.items||s.works||s.cards||s):0;if(c)P.push([c,'عنصر'])}
    else if(k==='wextra'){const q=n(S.qada&&S.qada.log||S.qada);if(q)P.push([q,'سجل'])}}catch(e){}
  return P.map(([c,w])=>ux7Cnt(c,w)).join(' · ')}
const UX7W={'درس':['درس','درسان','دروس','درسًا',0,'lesson'],'كتاب':['كتاب','كتابان','كتب','كتابًا',0,'book'],'لوح':['لوح','لوحان','ألواح','لوحًا',0,'board'],'هدف':['هدف','هدفان','أهداف','هدفًا',0,'goal'],'عنصر':['عنصر','عنصران','عناصر','عنصرًا',0,'item'],'فكرة':['فكرة','فكرتان','أفكار','فكرة',1,'idea'],'وسام':['وسام','وسامان','أوسمة','وسامًا',0,'badge'],'رسالة':['رسالة','رسالتان','رسائل','رسالة',1,'letter'],'يوم':['يوم','يومان','أيام','يومًا',0,'day'],'سجل':['سجل','سجلان','سجلات','سجلًّا',0,'entry']};
function ux7Cnt(n,w){const F=UX7W[w];if(!F)return n+' '+w;if(LANG!=='ar')return n+' '+F[5]+(n===1?'':'s');return n===1?F[0]+(F[4]?' واحدة':' واحد'):n===2?F[1]:n%100>=3&&n%100<=10?n+' '+F[2]:n+' '+F[3]}
{hookFn('openAreas',()=>openAreas,f=>{openAreas=f},'post',function(){try{$$('#infoBox [data-ar]').forEach(b=>{const k=b.dataset.ar,row=b.closest('.arrow'),tx=row&&row.querySelector('.artx');if(!tx||tx.querySelector('.ar7h'))return;const h=ar7Has(k);if(h)tx.insertAdjacentHTML('beforeend',`<small class="ar7h">${esc(t('ux7.has',h))}</small>`)})}catch(e){}})}
/* 90: how old the last backup is: green within a day, amber after 7 days */
{const _f=folderBackup;folderBackup=async function(...a){const r=await _f(...a);try{if(dirHandle&&await dirHandle.queryPermission({mode:'readwrite'})==='granted')localStorage.setItem('thabat.bkLast',String(Date.now()))}catch(e){}return r}}
{const _w=weeklyBackup;weeklyBackup=async function(...a){const r=await _w(...a);try{if(r===true)localStorage.setItem('thabat.bkLast',String(Date.now()))}catch(e){}return r}}
function bk7Last(){let x=0;try{x=+localStorage.getItem('thabat.bkLast')||0}catch(e){}const i=bkIdx()[0];if(i&&i.t>x)x=i.t;return x}
function bk7HTML(){const at=bk7Last();if(!at)return`<div class="bk7age none">${t('ux7.bkNone')}</div>`;const d=Math.floor((Date.now()-at)/864e5),cls=d<1?'ok':d>7?'old':'';
  const ago=d<1?t('ux7.bkToday'):d===1?t('ux7.bkYest'):t('ux7.bkDays',d);return`<div class="bk7age ${cls}" title="${esc(new Date(at).toLocaleString())}">${esc(t('ux7.bkLast',ago))}</div>`}
function bk7Paint(){const card=[...document.querySelectorAll('#v-set .card:not(.sgsec)')].find(c=>c.querySelector('h3[data-i18n="set.backup"]'));if(!card)return;const old=card.querySelector('.bk7age');if(old)old.remove();const h=card.querySelector('h3');if(h)h.insertAdjacentHTML('afterend',bk7HTML())}
{hookFn('openHealth',()=>openHealth,f=>{openHealth=f},'post',function(){let n=0;const go=()=>{const b=$('#infoBox h2');if(b&&!$('#infoBox .hlsize'))return n++<40&&setTimeout(go,150);if(b&&!$('#infoBox .bk7age'))b.insertAdjacentHTML('afterend',bk7HTML())};setTimeout(go,100)})}
try{sw7Words()}catch(e){}
