/* ============ 3.106 «share to Thabat» on Android (shell 41, bridge 11): text, links and pictures from other apps become a task or a note ============ */
const andShare=()=>{try{return ANDROID&&andV()>=11&&!!window.ThabatAndroid.takeShare}catch(e){return false}};
function shrCheck(){if(!andShare())return;let s='';try{s=window.ThabatAndroid.takeShare()||''}catch(e){}if(!s)return;let o;try{o=JSON.parse(s)}catch(e){return}if(o&&(o.text||o.subject||(o.imgs||[]).length))shrOpen(o)}
function shrParts(o){const text=String(o.text||'').trim(),sub=String(o.subject||'').trim(),url=(text.match(/https?:\/\/\S+/)||[])[0]||'',first=(text.replace(url,'').trim().split('\n')[0]||'').trim();
  const title=(sub||first||(url?url.replace(/^https?:\/\/(www\.)?/,'').split(/[/?#]/)[0]:'')||t('shr2.pic')).slice(0,120);return{text,sub,url,title}}
async function shrNote(o,into){const P_=shrParts(o),ids=[];for(const d of (o.imgs||[]).slice(0,4)){try{const id=uid();await idbSet('nimg:'+id,d);nImgMem[id]=d;ids.push(id)}catch(e){}}
  const body=[P_.sub&&P_.text&&!P_.text.startsWith(P_.sub)?P_.text:P_.text].filter(Boolean).join('\n');
  if(into){const n=NOTES().find(x=>x.id===into);if(!n)return;n.body=(String(n.body||'').replace(/\s+$/,'')+'\n\n'+(P_.sub&&P_.sub!==body?P_.sub+'\n':'')+body).trim();n.imgs=(n.imgs||[]).concat(ids);n.updated=Date.now();save();try{notesChanged()}catch(e){}toast(t('shr2.added',n.title||t('notes.untitled')));return}
  const now=Date.now(),n={id:uid(),title:P_.title,body,imgs:ids,created:now,updated:now,day:todayKey(),shr:1};NOTES().push(n);save();try{notesChanged()}catch(e){}toastAct(t('shr2.noteOk'),t('obs2.open'),()=>openNote(n.id),8000)}
function shrTask(o,k){const P_=shrParts(o),text=((P_.sub&&P_.url?P_.sub+' '+P_.url:P_.text||P_.sub)||'').replace(/\s+/g,' ').trim().slice(0,500);if(!text)return;const d=day(k);d.tasks=d.tasks||[];d.tasks.push({id:uid(),text,done:false,created:Date.now(),shr:1});save();try{renderTasks();renderToday()}catch(e){}toast(t(k===todayKey()?'shr2.taskOk':'shr2.taskTom'))}
function shrOpen(o){const P_=shrParts(o),imgs=(o.imgs||[]).slice(0,4),recent=NOTES().filter(n=>!n.arc&&!n.lock).sort((a,b)=>(b.updated||0)-(a.updated||0)).slice(0,6);
  openInfo(t('shr2.t'),`<div class="shr2"><div class="shr2p">${imgs.length?`<div class="shr2i">${imgs.map(d=>`<img src="${d}" alt="">`).join('')}</div>`:''}${P_.sub?`<b dir="auto">${esc(P_.sub)}</b>`:''}${P_.text?`<p dir="auto">${esc(P_.text.slice(0,600))}</p>`:''}</div>
    <div class="shr2a">${P_.text||P_.sub?`<button class="btn pri" data-sh="today">${esc(t('shr2.today'))}</button><button class="btn" data-sh="tom">${esc(t('shr2.tom'))}</button>`:''}<button class="btn" data-sh="note">${esc(t('shr2.note'))}</button></div>
    ${recent.length?`<h4>${esc(t('shr2.into'))}</h4><div class="shr2n">${recent.map(n=>`<button class="btn sm ghost" data-shn="${n.id}" dir="auto">${esc((n.title||t('notes.untitled')).slice(0,40))}</button>`).join('')}</div>`:''}</div>`);
  const b=$('#infoBox');if(b)b.classList.add('shr2box');const close=()=>$$('.modal.on').forEach(m=>m.classList.remove('on'));
  b.querySelectorAll('[data-sh]').forEach(x=>x.onclick=async()=>{const a=x.dataset.sh;close();if(a==='today')shrTask(o,todayKey());else if(a==='tom')shrTask(o,dKey(addDays(keyToDate(todayKey()),1)));else await shrNote(o)});
  b.querySelectorAll('[data-shn]').forEach(x=>x.onclick=async()=>{close();await shrNote(o,x.dataset.shn)})}
{hookFn('openInfo',()=>openInfo,f=>{openInfo=f},'pre',function(){try{const b=$('#infoBox');if(b)b.classList.remove('shr2box')}catch(e){}})}
{const _r=window.thabatResume;window.thabatResume=function(...a){let r;try{r=_r&&_r.apply(this,a)}catch(e){}setTimeout(shrCheck,350);return r}}
setTimeout(shrCheck,1500);
