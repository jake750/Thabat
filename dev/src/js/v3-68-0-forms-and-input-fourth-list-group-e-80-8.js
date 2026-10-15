/* ============ v3.68.0 forms and input (fourth list, group E: 80 82 89 90 91 92) ============ */
/* 89. lengths in plain words: «45د», «ساعة ونصف», «1.5 ساعة», «ساعتين», «90 min» → minutes */
const DUR_W=[[/(?:^|\s)(?:لمدة\s+)?ساعة\s+و\s*نصف(?=\s|$)/,90],[/(?:^|\s)(?:لمدة\s+)?ساعة\s+و\s*ربع(?=\s|$)/,75],[/(?:^|\s)(?:لمدة\s+)?ساعة\s+إلا\s+ربع(?=\s|$)/,45],[/(?:^|\s)(?:لمدة\s+)?(?:نصف|نص)\s+ساعة(?=\s|$)/,30],[/(?:^|\s)(?:لمدة\s+)?ربع\s+ساعة(?=\s|$)/,15],[/(?:^|\s)(?:لمدة\s+)?ساعت(?:ين|ان)(?=\s|$)/,120],[/(?:^|\s)half an hour(?=\s|$)/i,30],[/(?:^|\s)an hour and a half(?=\s|$)/i,90]];
function durParse(raw){let s=' '+String(raw||'')+' ',min=0,m;const take=(re,v)=>{const x=s.match(re);if(!x)return false;s=s.replace(re,' ');min+=v(x);return true};
  for(const [re,v] of DUR_W)if(take(re,()=>v))break;
  if(!min){take(/(?:^|\s)(?:لمدة\s+)?(\d+(?:[.,]\d+)?)\s*(?:س|ساعة|ساعات|h|hr|hrs|hours?)(?=\s|$)/i,x=>Math.round(parseFloat(x[1].replace(',','.'))*60));
    take(/(?:^|\s)(?:و\s*)?(\d+)\s*(?:د|دق|دقيقة|دقائق|دقايق|m|min|mins|minutes?)(?=\s|$)/i,x=>+x[1])}
  return{min,text:s.replace(/\s+/g,' ').trim()}}
/* the task box: the length is taken out of the text and kept as the task's length */
{const _at=addTask;addTask=function(...a){const i=$('#taskIn');if(!i||!$('#ltOpts').hidden)return _at(...a);const D=durParse(i.value);if(!D.min||D.min>720||!D.text)return _at(...a);
  const before=new Set(Object.values(S.days).flatMap(d=>(d.tasks||[]).map(x=>x.id)));i.value=D.text;const r=_at(...a);
  Object.values(S.days).forEach(d=>(d.tasks||[]).forEach(x=>{if(!before.has(x.id)&&x.text===D.text)x.est=D.min}));save();try{renderTasks()}catch(e){}toast(t('frm.est',fmtHM(D.min*6e4)));return r}}
/* the preview line under the task box shows the length too */
document.addEventListener('input',e=>{if(e.target.id!=='taskIn')return;const D=durParse(e.target.value);let el=$('#frmDur');if(!D.min||!D.text){if(el)el.remove();return}if(!el){el=document.createElement('small');el.id='frmDur';el.className='frmdur';e.target.closest('.row,.field,div').after(el)}el.textContent='⏱ '+fmtHM(D.min*6e4)},true);
/* the length field under a task (3.64 details) takes words as well */
document.addEventListener('change',e=>{const i=e.target;if(!i.matches||!i.matches('#tasks li.tkxp [data-f="est"]'))return;const D=durParse(i.value);if(D.min&&!/^\d+$/.test(i.value.trim())){i.value=D.min}},true);

/* 80 82 90 91 92: one pass over new fields */
const SRCH_SEL='input[type=search],#nSearch,#setQ,#qSrch,#wbPickQ,#cmdIn,#bkxQ,#trxQ,#lshQ,#lshPQ,#auQ,#arcQ,#lnkQ,input[placeholder*="بحث"],input[placeholder*="ابحث"],input[placeholder*="Search"]';
const URL_SEL='#icsUrl,#mUrl,#updUrl,input[id*="Url"],input[id*="url"],input[placeholder^="http"]';
function frmFix(root){(root.querySelectorAll?root:document).querySelectorAll('input:not([data-frm])').forEach(i=>{const tp=(i.getAttribute('type')||'text').toLowerCase();if(tp==='number'&&MOB.matches&&i.offsetParent===null)return;i.dataset.frm='1';
  /* 92 */
  if(tp==='number'){if(!i.inputMode)i.inputMode=(+i.step&&+i.step%1)||String(i.step||'').includes('.')?'decimal':'numeric'}
  else if(i.matches(URL_SEL)){if(tp==='text')i.type='url';i.inputMode='url';i.autocapitalize='off';i.spellcheck=false}
  if(i.matches(SRCH_SEL)){i.enterKeyHint='search';frmSearch(i)}else if(i.id==='taskIn'||i.id==='tmrIn')i.enterKeyHint='done';
  /* 80 */
  if(tp==='date')frmHijri(i);
  /* 82 */
  if(tp==='number'&&MOB.matches&&!i.closest('.lkrow,.tkxp')&&!i.readOnly&&i.offsetParent!==null)frmStep(i)})}
function frmSearch(i){if(i.id==='cmdIn')return;
  const x=document.createElement('button');x.type='button';x.className='srchx';x.textContent='✕';x.setAttribute('aria-label',t('frm.clear'));i.after(x);i.classList.add('has-srchx');const upd=()=>x.classList.toggle('has',!!i.value);upd();
  i.addEventListener('input',upd);x.onclick=()=>{i.value='';i.dispatchEvent(new Event('input',{bubbles:true}));i.dispatchEvent(new Event('change',{bubbles:true}));upd();i.focus()};
  /* 90: the last searches as suggestions */
  const key='thabat.srch.'+(i.id||i.placeholder||'x').slice(0,40);let dl=null;const list=()=>{try{return JSON.parse(localStorage.getItem(key)||'[]')}catch(e){return[]}};
  const fill=()=>{const L_=list();if(!L_.length)return;if(!dl){dl=document.createElement('datalist');dl.id='dl'+Math.random().toString(36).slice(2,8);document.body.append(dl);i.setAttribute('list',dl.id)}dl.innerHTML=L_.map(v=>`<option value="${esc(v)}">`).join('')};
  const keep=()=>{const v=i.value.trim();if(v.length<2)return;const L_=list().filter(x=>x!==v);L_.unshift(v);try{localStorage.setItem(key,JSON.stringify(L_.slice(0,6)))}catch(e){}};
  i.addEventListener('focus',fill);i.addEventListener('change',keep);i.addEventListener('keydown',e=>{if(e.key==='Enter')keep()});i.addEventListener('blur',keep)}
function frmHijri(i){if(i.nextElementSibling&&i.nextElementSibling.classList.contains('hdl'))return;const s=document.createElement('small');s.className='hdl';i.after(s);
  const upd=()=>{if(!i.value){s.textContent='';return}try{s.textContent=hStr(keyToDate(i.value))}catch(e){s.textContent=''}};upd();i.addEventListener('input',upd);i.addEventListener('change',upd);
  new MutationObserver(upd).observe(i,{attributes:true,attributeFilter:['value']});setTimeout(upd,50)}
function frmStep(i){const mk=(d,txt)=>{const b=document.createElement('button');b.type='button';b.className='nsb';b.textContent=txt;b.setAttribute('aria-label',txt);
  b.onclick=()=>{const st=+i.step||1,mn=i.min!==''?+i.min:-Infinity,mx=i.max!==''?+i.max:Infinity,v=(+i.value||0)+d*st;i.value=Math.min(mx,Math.max(mn,Math.round(v*1000)/1000));i.dispatchEvent(new Event('input',{bubbles:true}));i.dispatchEvent(new Event('change',{bubbles:true}))};return b};
  i.classList.add('nstepi');i.before(mk(-1,'−'));i.after(mk(1,'+'))}
{let q=null;new MutationObserver(ms=>{if(q)return;q=setTimeout(()=>{q=null;try{frmFix(document)}catch(e){}},250)}).observe(document.body,{childList:true,subtree:true})}
setTimeout(()=>{try{frmFix(document)}catch(e){}},800);

