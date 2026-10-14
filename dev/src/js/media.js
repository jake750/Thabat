/* ============ media ============ */
let mSel={type:'podcast',how:'listen'};
function renderMediaForm(){
  $('#mType').innerHTML=MTYPES.map(x=>`<button class="chip ${mSel.type===x?'on':''}" data-t="${x}">${t('type.'+x)}</button>`).join('');
  $('#mHow').innerHTML=MHOW.map(x=>`<button class="chip ${mSel.how===x?'on':''}" data-h="${x}">${MICON[x].replace('<svg','<svg style="width:14px;height:14px"')}${t('how.'+x)}</button>`).join('');
  $$('#mType .chip').forEach(b=>b.onclick=e=>{e.preventDefault();mSel.type=b.dataset.t;mSel.how=TYPE_HOW[mSel.type];if(mSel.type==='lesson')$('#mCat').value=S.settings.categories.some(c=>c.id==='course')?'course':$('#mCat').value;renderMediaForm()});
  $$('#mHow .chip').forEach(b=>b.onclick=e=>{e.preventDefault();mSel.how=b.dataset.h;renderMediaForm()});}
$('#mediaAddBtn').onclick=()=>{mFormReset();const p=$('#mediaPop');p.classList.toggle('on');if(p.classList.contains('on')){$('#mDate').value=todayKey();$('#mDate').max=todayKey();$('#mStat').textContent='';renderMediaForm();$('#mUrl').focus()}};
$('#mCancel').onclick=()=>{$('#mediaPop').classList.remove('on');mFormReset();dayModalDone()};
let mEdit=null;
function mFormReset(){mEdit=null;lastFullDur=0;$('#mGo').textContent=t('add');['mTitle','mH','mM','mUrl','mFrom','mTo'].forEach(i=>$('#'+i).value='');$('#mCount').checked=false;$('#mStat').textContent=''}
function openMediaEdit(k,id){const d=day(k),m=d.media.find(x=>x.id===id);if(!m)return;
  const inModal=curView()!=='today'||k!==todayKey();
  if(inModal){openDayAdd(k,'media');$('#dmT').textContent=t('media.editT')+' — '+gStr(keyToDate(k))}
  else{$('#mediaPop').classList.add('on');$('#mediaPop').scrollIntoView({block:'nearest',behavior:'smooth'})}
  mEdit={k,id};mSel.type=m.type;mSel.how=m.how;renderMediaForm();
  $('#mUrl').value=m.url||'';$('#mTitle').value=m.title;$('#mH').value=Math.floor(m.minutes/60)||'';$('#mM').value=m.minutes%60;$('#mDate').value=k;$('#mDate').max=todayKey();$('#mFrom').value=m.to!=null?fmtTC(m.from||0):'';$('#mTo').value=m.to!=null?fmtTC(m.to):'';
  const ls=d.sessions.find(x=>x.mediaId===id);$('#mCount').checked=!!ls;if(ls)$('#mCat').value=ls.cat;$('#mStat').textContent='';$('#mGo').textContent=t('media.saveEdit');$('#mTitle').focus()}
$('#mGo').onclick=()=>{const title=$('#mTitle').value.trim();const mins=(+$('#mH').value||0)*60+(+$('#mM').value||0);
  if(!title){toast(t('media.needTitle'));return}if(!(mins>0)){toast(t('toast.needDur'));return}
  const k=$('#mDate').value||todayKey(),dur=mins*6e4,counted=$('#mCount').checked;let id=uid(),at=Date.now();const editing=!!mEdit;
  if(mEdit){const src=day(mEdit.k),old=src.media.find(x=>x.id===mEdit.id);if(old){id=old.id;at=old.at;mOldFull=old.full||0}src.media=src.media.filter(x=>x.id!==mEdit.id);src.sessions=src.sessions.filter(x=>x.mediaId!==mEdit.id)}
  const url=$('#mUrl').value.trim();const fr=parseTC($('#mFrom').value),to=parseTC($('#mTo').value);day(k).media.push({id,type:mSel.type,how:mSel.how,title,minutes:mins,at,counted,url:/^https?:\/\//.test(url)?url:'',from:to!=null?(fr||0):null,to:to!=null?to:null,...(mFull&&mFullFor===url?{full:mFull}:(editing&&mOldFull?{full:mOldFull}:{}))});mOldFull=0;day(k).media.sort((a,b)=>a.at-b.at);
  if(counted){const start=startOf(k,'',dur);day(k).sessions.push({id:uid(),cat:$('#mCat').value,start,end:start+dur,manual:true,note:title,mediaId:id});day(k).sessions.sort((a,b)=>a.start-b.start)}
  save();mFormReset();$('#mediaPop').classList.remove('on');
  renderMedia();renderGlass();renderLog();dayModalDone();if(curView()==='cal')renderCal();if(editing){toast(t('media.saved'));return}toast(k!==todayKey()?t('toast.addedTo',fmtHM(dur),gStr(keyToDate(k))):t('toast.added',fmtHM(dur)))};
$('#mTitle').onkeydown=e=>{if(e.key==='Enter')$('#mGo').click()};

/* ---- link auto-fill ---- */
function fetchJ(u,ms=8000){const c=new AbortController();const tm=setTimeout(()=>c.abort(),ms);return fetch(u,{signal:c.signal}).then(r=>{clearTimeout(tm);if(!r.ok)throw new Error(r.status);return r.json()})}
const ytId=u=>{const m=u.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/|v\/))([\w-]{11})/);return m&&m[1]};
function ytStart(u){try{const x=new URL(u);let v=x.searchParams.get('t')||x.searchParams.get('start')||x.searchParams.get('time_continue')||x.searchParams.get('startTime')||'';if(!v&&x.hash)v=(x.hash.match(/t=([\dhms:.]+)/)||[])[1]||'';if(!v)return 0;if(/^\d+(\.\d+)?$/.test(v))return Math.round(+v);if(/:/.test(v))return parseTC(v)||0;const g=(re)=>+((v.match(re)||[])[1]||0);return g(/(\d+)h/)*3600+g(/(\d+)m/)*60+g(/(\d+)s/)}catch(e){return 0}}
let invCache=null;
async function invInstances(){if(invCache)return invCache;try{const c=JSON.parse(localStorage.getItem('thabat.inv')||'null');if(c&&Date.now()-c.at<864e5)return invCache=c.list}catch(e){}
  try{const l=await fetchJ('https://api.invidious.io/instances.json?sort_by=health',6000);invCache=l.filter(([h,i])=>i.type==='https'&&i.api&&i.cors).map(([h])=>h).slice(0,6);try{localStorage.setItem('thabat.inv',JSON.stringify({at:Date.now(),list:invCache}))}catch(e){}}catch(e){invCache=[]}return invCache}
function isoDur(s){const m=String(s).match(/P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);return m?(+(m[1]||0))*86400+(+(m[2]||0))*3600+(+(m[3]||0))*60+(+(m[4]||0)):0}
async function ytApi(id){const key=(S.settings.ytKey||'').trim();if(!key)throw 0;const j=await fetchJ('https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet&id='+id+'&key='+encodeURIComponent(key),8000);const it=j.items&&j.items[0];if(!it)throw 0;return{d:isoDur(it.contentDetails.duration),title:it.snippet.title}}
async function ytDuration(id){try{return await ytApi(id)}catch(e){}const hosts=['invidious.f5.si',...(await invInstances())].filter((h,i,a)=>a.indexOf(h)===i);
  const c=['https://api.piped.private.coffee/streams/'+id,...hosts.map(h=>'https://'+h+'/api/v1/videos/'+id+'?fields=title,lengthSeconds')];
  return Promise.any(c.map(u=>fetchJ(u,6500).then(j=>{const d=+(j.duration||j.lengthSeconds);if(!d)throw 0;return{d,title:j.title}})))}
function mediaDur(u,isV){return new Promise((res,rej)=>{const m=document.createElement(isV?'video':'audio');m.preload='metadata';const tm=setTimeout(()=>rej(),12000);m.onloadedmetadata=()=>{clearTimeout(tm);isFinite(m.duration)?res(m.duration):rej()};m.onerror=()=>{clearTimeout(tm);rej()};m.src=u})}
async function resolveLink(u){let url;try{url=new URL(u)}catch(e){throw 'bad'}const host=url.hostname.replace(/^www\.|^m\./,'');const out={title:null,dur:null,how:null,type:null,start:0};
  const id=ytId(u);out.start=ytStart(u);
  if(id){out.how='watch';const [o,d]=await Promise.allSettled([fetchJ('https://www.youtube.com/oembed?format=json&url='+encodeURIComponent('https://www.youtube.com/watch?v='+id)),ytDuration(id)]);
    if(o.status==='fulfilled')out.title=o.value.title;if(d.status==='fulfilled'){out.dur=d.value.d;out.title=out.title||d.value.title}}
  else if(/(^|\.)vimeo\.com$/.test(host)){const j=await fetchJ('https://vimeo.com/api/oembed.json?url='+encodeURIComponent(u));out.title=j.title;out.dur=j.duration||null;out.how='watch'}
  else if(/\.(mp3|m4a|aac|ogg|oga|wav|opus|flac|mp4|webm|mov|m4v)$/i.test(url.pathname)){const isV=/\.(mp4|webm|mov|m4v)$/i.test(url.pathname);out.how=isV?'watch':'listen';try{out.dur=await mediaDur(u,isV)}catch(e){}out.title=decodeURIComponent(url.pathname.split('/').pop()).replace(/\.[^.]+$/,'').replace(/[_-]+/g,' ')}
  else{try{const j=await fetchJ('https://noembed.com/embed?url='+encodeURIComponent(u),7000);if(j.title)out.title=j.title;if(j.duration)out.dur=j.duration}catch(e){}
    if(/soundcloud|spotify|podcasts\.apple|anchor\.fm|castbox|podbean|overcast|pocketcasts|podcasts\.google|audible/.test(host)){out.how='listen';out.type=/audible/.test(host)?'book':'podcast'}}
  out.gotTitle=!!out.title;
  if(!out.title){const seg=decodeURIComponent(url.pathname.split('/').filter(Boolean).pop()||'').replace(/[-_]+/g,' ');out.title=host+(seg?' — '+seg:'')}
  if(!out.type&&out.gotTitle&&/podcast|بودكاست|episode|حلقة/i.test(out.title))out.type='podcast';
  if(!out.type&&out.gotTitle&&/درس|الدرس|دورة|شرح|تعلم|lesson|tutorial|course|class/i.test(out.title))out.type='lesson';
  if(!out.type&&id)out.type=mSel.type==='podcast'?'video':mSel.type;
  return out}
function parseTC(v){v=String(v||'').trim().replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d));if(!v)return null;if(/^\d+(\.\d+)?$/.test(v))return Math.round(+v*60);const p=v.split(/[:：.]/).map(Number);if(p.some(isNaN))return null;return p.length===3?p[0]*3600+p[1]*60+p[2]:p.length===2?p[0]*60+p[1]:null}
function fmtTC(sec){sec=Math.round(sec);const h=Math.floor(sec/3600),m=Math.floor(sec%3600/60),x=sec%60;return h?h+':'+pad(m)+':'+pad(x):m+':'+pad(x)}
function rangeToDur(){const a=parseTC($('#mFrom').value)||0,b=parseTC($('#mTo').value);if(b!=null&&b>a){fillDur(b-a);const st=$('#mStat');st.className='full lstat ok';st.textContent=t('media.rangeDur',fmtHM((b-a)*1e3))}}
$('#mFrom').addEventListener('input',rangeToDur);$('#mTo').addEventListener('input',rangeToDur);
function fillDur(sec){const m=Math.max(1,Math.round(sec/60));$('#mH').value=Math.floor(m/60)||'';$('#mM').value=m%60}
let linkBusy=false,lastFullDur=0;
/* the same episode/video across days: YouTube id, or the URL without time/tracking params */
function mKey(u){try{const id=ytId(u);if(id)return'yt:'+id;const x=new URL(u);['t','start','time_continue','startTime','si','feature','utm_source','utm_medium','utm_campaign','utm_content','fbclid','igshid'].forEach(p=>x.searchParams.delete(p));x.hash='';return(x.hostname.replace(/^www\.|^m\./,'')+x.pathname.replace(/\/$/,'')+x.search).toLowerCase()}catch(e){return''}}
function mPrevPos(u){const k=mKey(u);if(!k)return 0;let best=0;for(const dk in S.days){for(const m of (S.days[dk].media||[])){if(mEdit&&m.id===mEdit.id)continue;if(m.url&&m.to!=null&&mKey(m.url)===k)best=Math.max(best,m.to)}}return best}
async function doFetchLink(){const u=$('#mUrl').value.trim();if(!u||linkBusy)return;const st=$('#mStat');st.className='full lstat';st.textContent=t('media.fetching');linkBusy=true;$('#mFetch').disabled=true;
  try{const r=await resolveLink(u);mFull=r.dur||0;mFullFor=u;if(r.type)mSel.type=r.type;if(r.how)mSel.how=r.how;renderMediaForm();$('#mTitle').value=r.title||'';
    const prev=mPrevPos(u);
    if(prev>0&&(!r.start||r.start>prev)){$('#mFrom').value=fmtTC(prev);if(r.start){$('#mTo').value=fmtTC(r.start);fillDur(r.start-prev);st.className='full lstat ok';st.textContent=t('media.resumed',fmtTC(prev),fmtTC(r.start),fmtHM((r.start-prev)*1e3))}else{$('#mTo').value='';st.className='full lstat ok';st.textContent=t('media.resumedNoEnd',fmtTC(prev));$('#mTo').focus()}}
    else if(r.start){$('#mFrom').value='0:00';$('#mTo').value=fmtTC(r.start);fillDur(r.start);if(prev>0){}st.className='full lstat ok';st.textContent=r.dur?t('media.gotStart',fmtHM(r.start*1e3),fmtHM(r.dur*1e3)):t('media.gotStartOnly',fmtHM(r.start*1e3))}
    else if(r.dur){fillDur(r.dur);lastFullDur=r.dur;st.className='full lstat ok';st.textContent=t('media.gotFull',fmtHM(r.dur*1e3))}
    else{st.className='full lstat '+(r.gotTitle?'':'err');st.textContent=r.gotTitle?(ytId(u)&&!S.settings.ytKey?t('media.noDurYt'):t('media.noDur')):t('media.fail');(r.gotTitle?$('#mTo'):$('#mTitle')).focus()}}
  catch(e){st.className='full lstat err';st.textContent=e==='bad'?t('media.badUrl'):t('media.fail');
    if(e!=='bad'){const s0=ytStart(u),prev=mPrevPos(u);if(s0&&s0>prev){$('#mFrom').value=fmtTC(prev);$('#mTo').value=fmtTC(s0);fillDur(s0-prev);st.className='full lstat ok';st.textContent=prev?t('media.resumed',fmtTC(prev),fmtTC(s0),fmtHM((s0-prev)*1e3)):t('media.rangeDur',fmtHM(s0*1e3))}else if(prev){$('#mFrom').value=fmtTC(prev)}}}
  linkBusy=false;$('#mFetch').disabled=false}
$('#mFetch').onclick=doFetchLink;
$('#mUrl').addEventListener('paste',()=>setTimeout(doFetchLink,50));
$('#mUrl').onkeydown=e=>{if(e.key==='Enter')doFetchLink()};
function mediaLine(m){return`<li class="mitem"><span class="mic">${MICON[m.how]||MICON.watch}</span><span class="mt"><b dir="auto">${m.url?`<a href="${esc(m.url)}" target="_blank" rel="noopener">${esc(m.title)}</a>`:esc(m.title)}</b><span>${t('type.'+m.type)} · ${t('how.'+m.how)}${m.to!=null?` · <span dir="ltr">${fmtTC(m.from||0)} → ${fmtTC(m.to)}</span>`:''}</span></span><span class="md">${fmtHM(m.minutes*6e4)}</span><button class="edit" data-id="${m.id}" title="${t('edit')}">✎</button><button class="del" data-id="${m.id}">✕</button></li>`}
function renderMedia(){const d=day(todayKey());
  $('#mediaList').innerHTML=d.media.length?[...d.media].reverse().map(mediaLine).join(''):`<div class="empty">${t('media.empty')}</div>`;
  $$('#mediaList .edit').forEach(b=>b.onclick=()=>openMediaEdit(todayKey(),b.dataset.id));
  $$('#mediaList .del').forEach(b=>b.onclick=()=>{d.media=d.media.filter(x=>x.id!==b.dataset.id);d.sessions=d.sessions.filter(s=>s.mediaId!==b.dataset.id);save();renderMedia();renderGlass();renderLog()});}

