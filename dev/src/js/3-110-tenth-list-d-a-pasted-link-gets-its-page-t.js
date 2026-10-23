/* ============ 3.110 tenth list D: a pasted link gets its page title, smart folders (saved searches), colours for tags, broken [[links]] ============ */
/* Markdown links [text](https://…) are now shown as links in notes (they were left as text) */
{const _m=mdInline;mdInline=function(x,...a){const L_=[];x=String(x).replace(/\[([^\]\n]{1,200})\]\((https?:\/\/[^\s)]+)\)/g,(m,tx,u)=>{L_.push([tx,u]);return'\u0001'+(L_.length-1)+'\u0001'});
  let r=_m(x,...a);return L_.length?r.replace(/\u0001(\d+)\u0001/g,(m,i)=>`<a class="nlk" href="${L_[+i][1]}" target="_blank" rel="noopener">${L_[+i][0]}</a>`):r}}
{const _p=mdPlain;mdPlain=function(x,...a){return _p(String(x||'').replace(/\[([^\]\n]{1,200})\]\((https?:\/\/[^\s)]+)\)/g,'$1'),...a)}}

/* 10th-46: pasting one web address into a note's text writes «[page title](address)»: media sites through noembed.com, other pages through the PC helper */
async function lttFetch(u){try{if(/youtu\.?be|vimeo\.com|soundcloud\.com|twitter\.com|x\.com|flickr\.com|tiktok\.com|instagram\.com|dailymotion\.com/i.test(u)){const r=await fetch('https://noembed.com/embed?url='+encodeURIComponent(u),{cache:'no-store'});if(r.ok){const j=await r.json();if(j&&j.title)return String(j.title)}}}catch(e){}
  if(!ANDROID&&!MAC){try{const c=new AbortController(),tm=setTimeout(()=>c.abort(),10000);const r=await fetch(HELPER+'/title?u='+encodeURIComponent(u),{cache:'no-store',signal:c.signal});clearTimeout(tm);if(r.ok){const j=await r.json();if(j&&j.t)return String(j.t)}}catch(e){}}return null}
document.addEventListener('paste',e=>{try{const ta=e.target;if(!ta||ta.id!=='neBody')return;const u=((e.clipboardData||window.clipboardData).getData('text')||'').trim();if(!/^https?:\/\/\S+$/.test(u)||u.length>800)return;
  const before=ta.value.slice(0,ta.selectionStart);if(/\]\($/.test(before))return;/* already inside a link */
  setTimeout(async()=>{const tt=await lttFetch(u);if(!tt)return;const v=ta.value,i=v.lastIndexOf(u);if(i<0||v.slice(Math.max(0,i-2),i)==='](')return;const clean=tt.replace(/[\[\]\n]/g,' ').trim();if(!clean)return;
    ta.value=v.slice(0,i)+`[${clean}](${u})`+v.slice(i+u.length);ta.dispatchEvent(new Event('input',{bubbles:true}));toast(t('ltt.ok'))},30)}catch(x){}},true);

/* 10th-48: smart folders — a saved search shown as a folder card at the top level of the notes: S.nsmart=[{id,n,q}] */
function nsmSave(){const q=($('#nSearch')||{}).value||'';if(!q.trim()){toast(t('nsm.empty'));return}const n=(prompt(t('nsm.name'),q.trim())||'').trim();if(!n)return;(S.nsmart=S.nsmart||[]).push({id:uid(),n:n.slice(0,60),q:q.trim()});save();renderNotes();toast(t('nsm.saved'))}
function nsmOpen(id){const f=(S.nsmart||[]).find(x=>x.id===id);if(!f)return;try{NF.cur=null;NF.arc=false}catch(e){}const q=$('#nSearch');if(q){q.value=f.q;renderNotes();q.focus()}}
{hookFn('renderNotes',()=>renderNotes,f=>{renderNotes=f},'post',function(){try{const grid=$('#nfGrid'),q=$('#nSearch');
  if(q&&!$('#nsmB')){q.insertAdjacentHTML('afterend',`<button class="btn sm ghost" id="nsmB" title="${esc(t('nsm.save'))}" aria-label="${esc(t('nsm.save'))}">🔖</button>`);$('#nsmB').onclick=nsmSave}
  const b=$('#nsmB');if(b)b.hidden=!(q&&q.value.trim());
  const L_=S.nsmart||[];if(!grid||!L_.length||(typeof NF!=='undefined'&&(NF.cur||NF.arc))||grid.querySelector('.nsmc'))return;
  grid.insertAdjacentHTML('afterbegin',L_.map(f=>`<div class="nsmc" data-nsm="${f.id}" role="button" tabindex="0"><span class="nsmi">🔍</span><b dir="auto">${esc(f.n)}</b><small dir="auto">${esc(f.q)}</small><button class="nsmx" data-nsmx="${f.id}" aria-label="${esc(t('del'))}">✕</button></div>`).join(''));
  grid.querySelectorAll('[data-nsm]').forEach(c=>c.onclick=e=>{const x=e.target.closest('[data-nsmx]');if(x){e.stopPropagation();const i=(S.nsmart||[]).findIndex(z=>z.id===x.dataset.nsmx);if(i<0)return;const [old]=S.nsmart.splice(i,1);save();renderNotes();toastAct(t('nsm.del'),t('undo'),()=>{S.nsmart.splice(i,0,old);save();renderNotes()},8000);return}nsmOpen(c.dataset.nsm)})}catch(e){console.error(e)}})}

/* 10th-49: colours for tags (S.tagCol={tag:colour}); used on #tags in notes and in the tasks' tag bar */
const TAGC=['#ef4444','#f59e0b','#eab308','#22c55e','#14b8a6','#3b82f6','#8b5cf6','#ec4899','#64748b'];
function tagAll(){const s=new Set();NOTES().forEach(n=>{try{noteTags(n).forEach(x=>s.add(String(x).replace(/^#/,'')))}catch(e){}});Object.values(S.days).forEach(d=>(d.tasks||[]).forEach(x=>{try{ctxOf(x.text).filter(c=>c[0]==='#').forEach(c=>s.add(c.slice(1)))}catch(e){}}));return[...s].sort((a,b)=>a.localeCompare(b))}
function tagCss(){let st=$('#tagColCss');if(!st){st=document.createElement('style');st.id='tagColCss';document.head.append(st)}const C=S.tagCol||{};
  st.textContent=Object.entries(C).map(([k,c])=>{const s=String(k).replace(/["\\]/g,'');return`.ntag[data-tag="${s}" i],[data-tagc="${s}"]{--tgc:${c};color:${c};background:color-mix(in srgb,${c} 16%,transparent);border-color:color-mix(in srgb,${c} 45%,transparent)}`}).join('\n')}
function tagBarPaint(){const bar=$('#ctxBar');if(!bar)return;bar.querySelectorAll('button,.chip,span').forEach(b=>{const m=(b.textContent||'').trim().match(/^#([\p{L}\p{N}_\-/]+)/u);if(m)b.dataset.tagc=m[1];else delete b.dataset.tagc})}
function tagColOpen(){const L_=tagAll(),C=S.tagCol||{};
  openInfo(t('tgc.t'),L_.length?`<div class="tgcw">${L_.map(tg=>`<div class="tgcr"><span class="ntag" data-tag="${esc(tg)}">#${esc(tg)}</span><span class="tgcs">${TAGC.map(c=>`<button class="tgcd ${C[tg]===c?'on':''}" data-tgk="${esc(tg)}" data-tgc="${c}" style="background:${c}" aria-label="${c}"></button>`).join('')}<button class="btn sm ghost" data-tgk="${esc(tg)}" data-tgc="">${esc(t('tgc.none'))}</button></span></div>`).join('')}</div>`:`<p class="muted">${esc(t('tgc.empty'))}</p>`);
  $$('#infoBox [data-tgk]').forEach(b=>b.onclick=()=>{const C2=S.tagCol=S.tagCol||{};if(b.dataset.tgc)C2[b.dataset.tgk]=b.dataset.tgc;else delete C2[b.dataset.tgk];save();tagCss();tagColOpen()})}
tagCss();
{hookFn('renderTasks',()=>renderTasks,f=>{renderTasks=f},'post',function(){try{tagBarPaint()}catch(e){}})}

/* 10th-52: [[links]] whose note does not exist (any more): list them, open the note that has them, or create the missing note */
function nblScan(){const T=new Set(NOTES().filter(n=>!n.arc).map(n=>String(n.title||'').trim().toLowerCase()).filter(Boolean)),out=[];
  NOTES().filter(n=>!n.arc&&!(n.lock&&!notesUnlocked())).forEach(n=>{const miss=[...new Set([...String(n.body||'').matchAll(/\[\[([^\]|#]+)/g)].map(m=>m[1].trim()).filter(x=>x&&!T.has(x.toLowerCase())))];if(miss.length)out.push({n,miss})});return out}
function nblOpen(){const L_=nblScan(),cnt=L_.reduce((s,x)=>s+x.miss.length,0);
  openInfo(t('nbl.t'),cnt?`<div class="nblw"><p class="muted">${esc(t('nbl.sub',cnt,L_.length))}</p>${L_.map(x=>`<div class="nblr"><button class="btn sm ghost" data-nbo="${x.n.id}" dir="auto">📝 ${esc(x.n.title||t('notes.untitled'))}</button><span>${x.miss.map(m=>`<button class="btn sm" data-nbc="${esc(m)}" title="${esc(t('nbl.create'))}" dir="auto">＋ [[${esc(m)}]]</button>`).join('')}</span></div>`).join('')}</div>`:`<p class="muted">${esc(t('nbl.none'))}</p>`);
  $$('#infoBox [data-nbo]').forEach(b=>b.onclick=()=>{$$('.modal.on').forEach(m=>m.classList.remove('on'));openNote(b.dataset.nbo)});
  $$('#infoBox [data-nbc]').forEach(b=>b.onclick=()=>{const now=Date.now(),n={id:uid(),title:b.dataset.nbc,body:'',imgs:[],created:now,updated:now,day:todayKey()};NOTES().push(n);save();try{notesChanged()}catch(e){}toast(t('nbl.made',n.title));nblOpen()})}
{hookFn('renderNotes',()=>renderNotes,f=>{renderNotes=f},'post',function(){try{const imp=$('#nObsIn');if(!imp||$('#nblB'))return;imp.insertAdjacentHTML('beforebegin',`<button class="btn sm ghost" id="nblB">🔗 ${esc(t('nbl.t'))}</button><button class="btn sm ghost" id="tgcB">🏷 ${esc(t('tgc.t'))}</button>`);$('#nblB').onclick=nblOpen;$('#tgcB').onclick=tagColOpen}catch(e){}})}
{const _cc=cmdCommands;cmdCommands=function(...a){const L_=_cc(...a);try{L_.push({icon:'🔗',label:t('nbl.t'),run:nblOpen,kw:'broken links notes روابط مكسورة'},{icon:'🏷',label:t('tgc.t'),run:tagColOpen,kw:'tag colours ألوان الوسوم'})}catch(e){}return L_}}

