/* ============ v3.96.0: group 8 part 1 — 135 a 30-day challenge, 191 settings search with synonyms, 193 the mushaf for screen readers ============ */
/* 135 · S.ch30=[{id,n,start,len,done:{date:1},cat,min}] (synced). A day counts when you tick it, or by itself when a category is chosen
   and that day's minutes in it reach the target. Today shows one chip per running challenge; the window draws the day grid. */
if(!SY_SIMPLE.includes('ch30'))SY_SIMPLE.push('ch30');
function CH30(){return S.ch30||(S.ch30=[])}
function c30Cat(id){const c=(S.settings.categories||[]).find(x=>x.id===id);return c?catName(c):id}
function c30Days(c){const s=keyToDate(c.start);return Array.from({length:c.len},(_,i)=>{const d=new Date(s);d.setDate(s.getDate()+i);return dKey(d)})}
function c30Auto(c,k){if(!c.cat||!c.min)return false;try{const by=rollBy(totals(k).by)||{};return(by[c.cat]||0)>=c.min*6e4}catch(e){return false}}
function c30Done(c,k){return!!(c.done&&c.done[k])||c30Auto(c,k)}
function c30Stat(c){const ds=c30Days(c),tk=todayKey();let n=0,run=0,best=0;ds.forEach(k=>{if(k>tk)return;if(c30Done(c,k)){n++;run++;best=Math.max(best,run)}else if(k<tk)run=0});
  const i=ds.indexOf(tk);return{n,best,run,day:i<0?(tk<ds[0]?0:c.len+1):i+1,over:tk>ds[ds.length-1],ds}}
function c30Open(id){const L_=CH30(),c=id&&L_.find(x=>x.id===id);if(!c){c30List();return}const st=c30Stat(c),tk=todayKey();
  const cells=st.ds.map((k,i)=>{const d=c30Done(c,k),au=!(c.done&&c.done[k])&&d,fut=k>tk;return`<button class="c30c ${d?'on':''} ${au?'auto':''} ${fut?'fut':''} ${k===tk?'today':''}" data-c30="${k}" ${fut?'disabled':''} title="${esc(gShort(keyToDate(k)))}">${i+1}</button>`}).join('');
  openInfo(esc(c.n),`<div class="c30"><div class="c30top"><b>${esc(t('c30.prog',st.n,c.len))}</b><span>${esc(st.over?t('c30.over'):st.day?t('c30.day',st.day,c.len):t('c30.soon',gShort(keyToDate(c.start))))}</span><span>${esc(t('c30.run',st.run,st.best))}</span></div>
    <div class="minibar"><i style="width:${(st.n/c.len*100).toFixed(1)}%"></i></div><div class="c30g">${cells}</div>
    ${c.cat?`<p class="muted">${esc(t('c30.autoS',c30Cat(c.cat),c.min))}</p>`:''}<p class="muted">${esc(t('c30.tap'))}</p>
    <div class="row" style="justify-content:flex-start"><button class="btn sm ghost" data-c30a="list">${esc(t('c30.all'))}</button><button class="btn sm ghost dng" data-c30a="del">${esc(t('c30.del'))}</button></div></div>`);
  $$('[data-c30]').forEach(b=>b.onclick=()=>{const k=b.dataset.c30;c.done=c.done||{};if(c.done[k])delete c.done[k];else c.done[k]=1;save();c30Open(c.id);try{renderToday()}catch(e){}});
  $('[data-c30a="list"]').onclick=()=>c30List();
  $('[data-c30a="del"]').onclick=()=>{const i=L_.indexOf(c),snap=JSON.stringify(c);L_.splice(i,1);save();c30List();try{renderToday()}catch(e){}toastAct(t('c30.deleted'),t('undo'),()=>{L_.splice(i,0,JSON.parse(snap));save();try{renderToday()}catch(e){}})}}
function c30List(){const L_=CH30(),tk=todayKey();const cats=(S.settings.categories||[]).filter(c=>!c.parent);
  openInfo(t('c30.t'),`<div class="c30">${L_.length?L_.map(c=>{const st=c30Stat(c);return`<button class="c30r" data-c30o="${c.id}"><b dir="auto">${esc(c.n)}</b><span>${esc(t('c30.prog',st.n,c.len))} · ${esc(st.over?t('c30.over'):st.day?t('c30.day',st.day,c.len):t('c30.soon',gShort(keyToDate(c.start))))}</span><i style="--p:${(st.n/c.len*100).toFixed(0)}%"></i></button>`}).join(''):`<p class="muted">${esc(t('c30.none'))}</p>`}
    <div class="c30new"><b>${esc(t('c30.new'))}</b><input class="in" id="c30N" dir="auto" placeholder="${esc(t('c30.ph'))}">
    <div class="c30f"><label>${esc(t('c30.len'))}<select class="in" id="c30L">${[7,14,21,30,40].map(n=>`<option value="${n}" ${n===30?'selected':''}>${n}</option>`).join('')}</select></label>
    <label>${esc(t('c30.start'))}<select class="in" id="c30S"><option value="0">${esc(t('c30.today'))}</option><option value="1">${esc(t('c30.tomorrow'))}</option></select></label>
    <label>${esc(t('c30.cat'))}<select class="in" id="c30C"><option value="">${esc(t('c30.manual'))}</option>${cats.map(c=>`<option value="${c.id}">${esc(catName(c))}</option>`).join('')}</select></label>
    <label>${esc(t('c30.min'))}<input class="in" id="c30M" type="number" min="5" max="600" value="30"></label></div>
    <button class="btn pri" id="c30Go">${esc(t('c30.go'))}</button></div></div>`);
  $$('[data-c30o]').forEach(b=>b.onclick=()=>c30Open(b.dataset.c30o));
  $('#c30Go').onclick=()=>{const n=$('#c30N').value.trim();if(!n){toast(t('c30.errN'));return}const d=new Date();d.setDate(d.getDate()+(+$('#c30S').value));
    const c={id:uid(),n,start:dKey(d),len:+$('#c30L').value||30,done:{},at:Date.now()};const cat=$('#c30C').value;if(cat){c.cat=cat;c.min=Math.max(5,+$('#c30M').value||30)}
    CH30().push(c);save();c30Open(c.id);try{renderToday()}catch(e){}}}
/* Today: a chip for each challenge running now (until 3 days after its end) */
{hookFn('renderTodayEv',()=>renderTodayEv,f=>{renderTodayEv=f},'post',function(){try{const box=$('#todayEv');if(!box)return;const tk=todayKey();
  CH30().forEach(c=>{const st=c30Stat(c),ds=st.ds;if(tk<ds[0]){if(ds[0]!==tk)return}const end=keyToDate(ds[ds.length-1]);end.setDate(end.getDate()+3);if(tk>dKey(end))return;
    const done=c30Done(c,tk);box.insertAdjacentHTML('beforeend',`<span class="evchip c30chip ${done?'ok':''}" data-c30chip="${c.id}" style="--c:#e0a23a"><i></i>${done?'✓ ':''}${esc(t('c30.chip',c.n,Math.min(st.day||0,c.len),c.len))}</span>`)});
  $$('[data-c30chip]').forEach(b=>b.onclick=()=>c30Open(b.dataset.c30chip))}catch(e){}})}
{const _cc=cmdCommands;cmdCommands=function(){const L_=_cc();L_.push({icon:'🏁',label:t('c30.t'),run:()=>c30List(),kw:'challenge 30 days تحدي ثلاثين يوم'});return L_}}
{hookFn('renderSettings',()=>renderSettings,f=>{renderSettings=f},'post',function(){try{const host=$('#adx9')||$('#hxRow');if(!host||$('#c30Row'))return;
  host.insertAdjacentHTML('afterend',`<div class="field" id="c30Row"><div><label data-i18n="c30.t">${esc(t('c30.t'))}</label><small>${esc(t('c30.sub'))}</small></div><button class="btn sm" id="c30Btn">${esc(t('c30.open'))}</button></div>`);
  $('#c30Btn').onclick=()=>c30List()}catch(e){}})}

/* 191 · settings search with synonyms: a word finds the settings named with any word of its group */
const SQ_SYN=[['الوضع الليلي','الداكن','مظلم','ليلي','الفاتح','النهاري','dark','night','light mode'],['اللون','الألوان','الثيم','السمة','المظهر','الشكل','theme','colour','color','look'],
  ['حجم الواجهة','حجم الخط','الخط','تكبير','تصغير','الحجم','font','size','zoom','scale'],['الأذان','المؤذن','الصلاة','الصلوات','مواقيت','أوقات الصلاة','adhan','azan','prayer'],
  ['تنبيه','التنبيهات','إشعار','الإشعارات','تذكير','منبه','notification','reminder','alert','alarm'],['النسخ الاحتياطي','نسخة احتياطية','استعادة','حفظ البيانات','backup','restore','export'],
  ['المزامنة','مزامنة','github','gist','sync'],['اللغة','العربية','الإنجليزية','language','english','arabic'],['القفل','قفل','كلمة السر','رمز','بصمة','lock','pin','password','fingerprint'],
  ['الماء','شرب','water','drink'],['النوم','نوم','sleep','bedtime'],['الرياضة','تمرين','sport','exercise','workout'],['المصحف','القرآن','الرواية','الروايات','الختمة','الورد','quran','mushaf','riwaya','khatma'],
  ['التقويم','الأحداث','المواعيد','google','calendar','events','ics'],['المكتبة','الدروس','الفيديو','الكتب','library','video','lessons','books'],['الهدف','الأهداف','ساعات العمل','goal','hours'],
  ['الفئات','الفئة','التصنيف','categories','category'],['الأداء','بطيء','سريع','البطارية','خفيف','performance','lite','battery','slow'],['الهجري','التاريخ','الشهر','hijri','date','month'],
  ['الصوت','مستوى الصوت','volume','sound'],['الويدجت','الأداة','الشاشة الرئيسية','widget','home screen'],['الموقع','المسجد','المدينة','location','mosque','mawaqit','city'],
  ['الصيام','صوم','رمضان','fasting','ramadan'],['الأذكار','الذكر','التسبيح','adhkar','dhikr'],['الحاسوب','الكمبيوتر','ويندوز','pc','windows','computer'],['الهاتف','الجوال','أندرويد','phone','android','mobile']];
function sqAlts(q){const Q=AR_NORM(q).trim();if(!Q)return[Q];const out=new Set([Q]);SQ_SYN.forEach(g=>{const N=g.map(AR_NORM);if(N.some(w=>w.includes(Q)||(Q.length>=3&&Q.includes(w))))N.forEach(w=>out.add(w))});return[...out]}
setSearch=function(){const raw=(($('#setQ')||{}).value||'').trim(),A=raw?sqAlts(raw):[],has=x=>A.some(a=>a&&x.includes(a));
  setCards().forEach(c=>{let any=false;const h=c.querySelector('h3');const hit0=!!raw&&h&&has(AR_NORM(h.textContent));c.querySelectorAll('.field').forEach(f=>{const m=!raw||hit0||has(AR_NORM(f.textContent));f.classList.toggle('sqhide',!m);if(m)any=true});c.hidden=!!raw&&!any&&!hit0});applySetFold()};
{hookFn('renderSettings',()=>renderSettings,f=>{renderSettings=f},'post',function(){try{const q=$('#setQ');if(q)q.oninput=setSearch}catch(e){}})}
{const _c=cmdSetHits;cmdSetHits=function(q){const r=_c(q);try{const seen=new Set(r.map(x=>x.label));sqAlts(q).slice(1).forEach(a=>{_c(a).forEach(x=>{if(!seen.has(x.label)){seen.add(x.label);x.sc=Math.max(0,(x.sc||1)-1);r.push(x)}})})}catch(e){}return r}}

/* 193 · the mushaf for screen readers: each page is named (page, surah, juz'), surah titles are headings, every ayah number is read as «آية n»,
   scanned pages get an alt text with their surahs, the page bar buttons have names, and a page change is announced */
function qa11yPaint(){const sp=$('#spread');if(!sp)return;sp.setAttribute('aria-label',t('qa11.mushaf'));
  sp.querySelectorAll('.qpage').forEach(pg=>{const b=pg.querySelector('[data-bm]');if(!b)return;const p=+b.dataset.bm,name=t('qa11.page',p,qPageSurahs(p).join('، '),qJuzAt(p));
    pg.setAttribute('role','region');pg.setAttribute('aria-label',name);const im=pg.querySelector('.qimg img');if(im)im.alt=name;
    pg.querySelectorAll('.snb').forEach(h=>{h.setAttribute('role','heading');h.setAttribute('aria-level','3')});
    pg.querySelectorAll('.aen').forEach(e=>{if(e.getAttribute('aria-label'))return;const n=String(e.textContent).replace(/[٠-٩]/g,d=>d.charCodeAt(0)-1632).replace(/[۰-۹]/g,d=>d.charCodeAt(0)-1776).replace(/\D/g,'');if(n)e.setAttribute('aria-label',t('qa11.ayah',n))});
    pg.querySelectorAll('.mp').forEach(m=>m.setAttribute('lang','ar'))});
  [['#qPrevP','q.prevP'],['#qNextP','q.nextP']].forEach(([s,k])=>{const e=$(s);if(e&&!e.getAttribute('aria-label'))e.setAttribute('aria-label',t(k))});
  let lv=$('#qLive');if(!lv){lv=document.createElement('div');lv.id='qLive';lv.className='srlive';lv.setAttribute('aria-live','polite');document.body.append(lv)}
  const Q=S.quran,one=MOB.matches||document.documentElement.classList.contains('qfs-one'),cur=one?(Q.pv||Q.view||1):(Q.view||1);if(QA11.last!==cur&&curView()==='quran'){QA11.last=cur;lv.textContent=t('qa11.page',cur,qPageSurahs(cur).join('، '),qJuzAt(cur))}}
const QA11={last:0};
{hookFn('renderQuran',()=>renderQuran,f=>{renderQuran=f},'post',function(){try{qa11yPaint()}catch(e){}})}
/* text pages are drawn after the page (requestAnimationFrame): name their ayat once they are there */
{const _r=qRenderMP;qRenderMP=function(el,...a){const r=_r(el,...a);try{setTimeout(qa11yPaint,0)}catch(e){}return r}}

/* 160 · Mac: the launcher itself now offers the update (Thabat.command, 3.96); the «update now» window says so first */
{const _m=macUpdHelp;macUpdHelp=function(...a){const r=_m(...a);try{const b=$('#infoBox .machow');if(b&&!$('#macAuto'))b.insertAdjacentHTML('beforebegin',`<p id="macAuto" class="tsmtop">${esc(t('mac.auto'))}</p>`)}catch(e){}return r}}
