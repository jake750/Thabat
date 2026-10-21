/* ============ v3.79.0: memorisation mode — a manual repetition counter (his pick «أ»): this session / all time / today for the page, the whole surah, or a passage of ayat (option «ج») ============ */
/* S.quran.rpt = {p:{page:n}, s:{surahIdx:n}, r:{'s:a-b':n}} all-time totals (synced with S.quran); day(k).quran.rpt = the same per day;
   S.quran.rpS = the open session {at,p,s,r} (a new one each time the mode is switched on); S.quran.rpU = 'p'|'r' (unit), rpSeg = {s,a,b}, rpGoal = session target (0 = none) */
const QRP={pick:0,ed:false};
function qrpOn(){return!!(S.quran.rpS&&S.quran.rpS.on)}
function qrpTot(){const Q=S.quran;if(!Q.rpt)Q.rpt={p:{},s:{},r:{}};['p','s','r'].forEach(k=>{if(!Q.rpt[k])Q.rpt[k]={}});return Q.rpt}
function qrpDayO(k){const q=qDay(k||todayKey());if(!q.rpt)q.rpt={p:{},s:{},r:{}};['p','s','r'].forEach(x=>{if(!q.rpt[x])q.rpt[x]={}});return q.rpt}
function qrpGoal(){const g=S.quran.rpGoal;return g==null?10:Math.max(0,+g||0)}
function qrpPage(){const ps=qVisPages();return ps[Math.min(QRP.pick,ps.length-1)]||ps[0]||1}
function qrpSurahsOn(p){const out=[];for(let i=0;i<114;i++){if(QS[i][2]<=p&&QS[i][3]>=p)out.push(i);else if(QS[i][2]>p)break}return out.length?out:[qSurahIdx(p)]}
function qrpSName(i){return LANG==='ar'?QS[i][0]:QS[i][1]}
function qrpSeg(){const Q=S.quran;let g=Q.rpSeg;if(!g||QS[g.s]==null){const s=qSurahIdx(qrpPage());g=Q.rpSeg={s,a:1,b:Math.min(5,QAC[s])}}return g}
function qrpSegKey(g){return g.s+':'+g.a+'-'+g.b}
function qrpSegName(g){return qrpSName(g.s)+' '+(g.a===g.b?g.a:g.a+'–'+g.b)}
/* the unit being counted: kind ('p' page, 'r' passage), its key and its label */
function qrpUnit(){if(S.quran.rpU==='r'){const g=qrpSeg();return{k:'r',id:qrpSegKey(g),lb:qrpSegName(g)}}const p=qrpPage();return{k:'p',id:String(p),lb:t('q.pageS')+p}}
function qrpSurah(){const ss=qrpSurahsOn(qrpPage());if(S.quran.rpU==='r')return qrpSeg().s;return ss.includes(QRP.s)?QRP.s:ss[0]}
function qrpAdd(kind,id,d){const T=qrpTot(),D=qrpDayO(),Ss=S.quran.rpS;[T[kind],D[kind],Ss[kind]||(Ss[kind]={})].forEach(o=>{o[id]=Math.max(0,(o[id]||0)+d);if(!o[id])delete o[id]});save()}
function qrpPlus(d){if(!qrpOn())return;const u=qrpUnit();qrpAdd(u.k,u.id,d);if(d>0){vib(15);const n=S.quran.rpS[u.k][u.id]||0,g=qrpGoal();if(g&&n===g){vib([30,60,30]);toast(t('qrp.goalDone',u.lb,g))}}qrpPaint(true)}
function qrpPlusS(){if(!qrpOn())return;const s=qrpSurah();qrpAdd('s',String(s),1);vib(15);toast(t('qrp.sAdded',qrpSName(s),qrpTot().s[s]||0));qrpPaint(true)}
function qrpSet(on){const Q=S.quran;if(on){Q.rpS={on:1,at:Date.now(),p:{},s:{},r:{}};QRP.pick=0;QRP.ed=false}else if(Q.rpS){Q.rpS.on=0}save();qrpBtn();qrpPaint();toast(t(on?'qrp.onT':'qrp.offT'))}
function qrpBtn(){const b=$('#qrpBtn');if(!b)return;const on=qrpOn();b.classList.toggle('on',on);b.innerHTML='🧠<small>'+esc(t(on?'qrp.off':'qrp.btn'))+'</small>'}
function qrpEnsureBtn(){if($('#qrpBtn'))return;const h=$('#qHideBtn');if(!h)return;h.insertAdjacentHTML('afterend','<button class="btn sm ghost qbtool" id="qrpBtn" data-qbl="1"></button>');$('#qrpBtn').onclick=()=>qrpSet(!qrpOn());qrpBtn()}
function qrpPaint(keep){let el=$('#qrpBox');const show=qrpOn()&&curView()==='quran';if(!show){if(el)el.remove();return}
  const fs=document.documentElement.classList.contains('qfs'),at=$('#qjBar')||$('.qbar');
  if(!el){el=document.createElement('div');el.id='qrpBox';el.className='qrpbox card';el.addEventListener('click',qrpClick);el.addEventListener('change',qrpChange)}
  if(fs){if(el.parentElement!==document.body)document.body.append(el)}else if(at&&el.previousElementSibling!==at)at.after(el);
  el.classList.toggle('qrpfs',fs);
  const Q=S.quran,u=qrpUnit(),T=qrpTot(),D=qrpDayO(),Ss=Q.rpS,n=(Ss[u.k]||{})[u.id]||0,all=T[u.k][u.id]||0,today=D[u.k][u.id]||0,g=qrpGoal(),ps=qVisPages(),s=qrpSurah(),ss=qrpSurahsOn(qrpPage()),sN=T.s[s]||0,sS=(Ss.s||{})[s]||0;
  const seg=u.k==='r'?qrpSeg():null;
  el.innerHTML=`<div class="qrpr1"><span class="qrpseg" role="group"><button class="btn sm${u.k==='p'?' on':''}" data-qrp="up">${esc(t('qrp.uPage'))}</button><button class="btn sm${u.k==='r'?' on':''}" data-qrp="ur">${esc(t('qrp.uSeg'))}</button></span>`+
    (u.k==='p'&&ps.length>1?`<span class="qrpseg">${ps.map((p,i)=>`<button class="btn sm${p===qrpPage()?' on':''}" data-qrp="pk" data-i="${i}">${t('q.pageS')}${p}</button>`).join('')}</span>`:'')+
    (u.k==='r'?`<button class="btn sm ghost qrpsl" data-qrp="ed">${esc(qrpSegName(seg))} ✎</button>`:'')+
    `<span class="qrpsp"></span><button class="btn sm ghost" data-qrp="ed" aria-label="${esc(t('qrp.set'))}" title="${esc(t('qrp.set'))}">⚙</button><button class="btn sm ghost" data-qrp="x" aria-label="${esc(t('qrp.off'))}" title="${esc(t('qrp.off'))}">✕</button></div>`+
    (QRP.ed?`<div class="qrped">`+(u.k==='r'?`<label>${esc(t('qrp.surah'))}<select class="in" data-qrp="ss">${QS.map((x,i)=>`<option value="${i}"${i===seg.s?' selected':''}>${i+1}. ${esc(qrpSName(i))}</option>`).join('')}</select></label><label>${esc(t('qrp.from'))}<input class="in num" type="number" min="1" max="${QAC[seg.s]}" value="${seg.a}" data-qrp="sa"></label><label>${esc(t('qrp.to'))}<input class="in num" type="number" min="1" max="${QAC[seg.s]}" value="${seg.b}" data-qrp="sb"></label>`:'')+
      `<label>${esc(t('qrp.goal'))}<input class="in num" type="number" min="0" max="999" value="${g}" data-qrp="gl"></label></div>`:'')+
    `<div class="qrpr2"><button class="btn pri qrpplus" data-qrp="plus" aria-label="+1 ${esc(u.lb)}">+1</button><div class="qrpst"><div class="qrpl1"><b>${n}</b>${g?`<span class="qrpg"> / ${g}</span>`:''} <span>${esc(t('qrp.sess'))} · ${esc(u.lb)}</span></div>`+
    (g?`<div class="qrpbar${n>=g?' ok':''}"><i style="width:${Math.min(100,n/g*100).toFixed(1)}%"></i></div>`:'')+
    `<div class="qrpl2">${esc(t('qrp.all',all))} · ${esc(t('qrp.today',today))}</div></div><button class="btn sm ghost qrpmin" data-qrp="min" aria-label="−1" title="−1"${n?'':' disabled'}>−1</button></div>`+
    `<div class="qrpr3">`+(u.k==='p'&&ss.length>1?`<select class="in" data-qrp="sp" aria-label="${esc(t('qrp.surah'))}">${ss.map(i=>`<option value="${i}"${i===s?' selected':''}>${esc(qrpSName(i))}</option>`).join('')}</select>`:`<b>${esc(qrpSName(s))}</b>`)+
    `<span>${esc(t('qrp.sLine',sN,sS))}</span><button class="btn sm" data-qrp="ps">${esc(t('qrp.plusS'))}</button></div>`;
  if(keep){const b=el.querySelector('.qrpplus');if(b)b.classList.add('qrpbump')}}
function qrpClick(e){const b=e.target.closest('[data-qrp]');if(!b||b.tagName==='SELECT'||b.tagName==='INPUT')return;const a=b.dataset.qrp,Q=S.quran;
  if(a==='plus')qrpPlus(1);else if(a==='min')qrpPlus(-1);else if(a==='ps')qrpPlusS();else if(a==='x')qrpSet(false);
  else if(a==='up'){Q.rpU='p';save();qrpPaint()}else if(a==='ur'){Q.rpU='r';if(!Q.rpSeg)QRP.ed=true;qrpSeg();save();qrpPaint()}
  else if(a==='pk'){QRP.pick=+b.dataset.i||0;qrpPaint()}else if(a==='ed'){QRP.ed=!QRP.ed;qrpPaint()}}
function qrpChange(e){const x=e.target,a=x.dataset&&x.dataset.qrp;if(!a)return;const Q=S.quran,g=qrpSeg();
  if(a==='gl')Q.rpGoal=Math.max(0,Math.min(999,Math.round(+x.value||0)));
  else if(a==='sp')QRP.s=+x.value;
  else if(a==='ss'){const s=+x.value;Q.rpSeg={s,a:1,b:Math.min(5,QAC[s])}}
  else if(a==='sa'||a==='sb'){const m=QAC[g.s];let v=Math.max(1,Math.min(m,Math.round(+x.value||1)));if(a==='sa'){g.a=v;if(g.b<v)g.b=v}else{g.b=v;if(g.a>v)g.a=v}}
  save();qrpPaint()}
/* after each Quran render or page change, and when switching pages of the app */
{hookFn('renderQuran',()=>renderQuran,f=>{renderQuran=f},'post',function(){try{qrpEnsureBtn();qrpBtn();qrpPaint()}catch(e){console.error(e)}})}
{hookFn('qBarUpdate',()=>qBarUpdate,f=>{qBarUpdate=f},'post',function(){try{if(qrpOn())qrpPaint()}catch(e){}})}
{hookFn('showView',()=>showView,f=>{showView=f},'post',function(){try{qrpPaint()}catch(e){}})}
{let fs0=null;new MutationObserver(()=>{const fs=document.documentElement.classList.contains('qfs');if(fs===fs0)return;fs0=fs;try{if(qrpOn())qrpPaint()}catch(e){}}).observe(document.documentElement,{attributes:true,attributeFilter:['class']})}
/* a session left open more than 8 hours starts again on the next open */
try{const s=S.quran&&S.quran.rpS;if(s&&s.on&&Date.now()-s.at>8*36e5)S.quran.rpS={on:1,at:Date.now(),p:{},s:{},r:{}}}catch(e){}
/* keyboard on PC: «+» or «=» counts one more while the mode is on (not while typing) */
document.addEventListener('keydown',e=>{if(!qrpOn()||curView()!=='quran'||e.ctrlKey||e.metaKey||e.altKey)return;const tg=e.target;if(tg&&(tg.isContentEditable||/INPUT|TEXTAREA|SELECT/.test(tg.tagName)))return;if(e.key==='+'||e.key==='='){e.preventDefault();qrpPlus(1)}});

