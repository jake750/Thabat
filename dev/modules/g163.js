/* ============ v3.139.0: Notion list B — a link alone on its line is a card (title, description, picture); YouTube, map and book-page links are shown inside the note; «@غدًا» becomes a date that opens that day ============ */
/* Link facts are kept in S.lnkMeta (synced, ≤300) so the phone shows what the PC fetched: the helper's /meta on Windows, noembed.com for media sites. */
SY_SIMPLE.push('lnkMeta');
const LNK={busy:new Set(),fail:{}};
function lnkHost(u){try{return new URL(u).hostname.replace(/^www\./,'')}catch(e){return u}}
function lnkYt(u){const m=String(u).match(/(?:youtube\.com\/(?:watch\?(?:[^#]*&)?v=|shorts\/|live\/|embed\/)|youtu\.be\/)([\w-]{11})/);return m?m[1]:null}
function lnkMap(u){let m=String(u).match(/@(-?\d{1,2}\.\d+),(-?\d{1,3}\.\d+)/)||String(u).match(/[?&](?:q|query|ll)=(-?\d{1,2}\.\d+),\s*(-?\d{1,3}\.\d+)/)||String(u).match(/[?&]mlat=(-?\d{1,2}\.\d+)&mlon=(-?\d{1,3}\.\d+)/)||String(u).match(/#map=\d+\/(-?\d{1,2}\.\d+)\/(-?\d{1,3}\.\d+)/)||String(u).match(/^geo:(-?\d{1,2}\.\d+),(-?\d{1,3}\.\d+)/);
  if(!m)return null;if(!/google\.[a-z.]+\/maps|maps\.app|goo\.gl\/maps|openstreetmap\.org|^geo:/.test(u))return null;const la=+m[1],lo=+m[2];return Math.abs(la)<=90&&Math.abs(lo)<=180?{la,lo}:null}
async function lnkFetch(u){if(LNK.busy.has(u))return null;if(LNK.fail[u]&&Date.now()-LNK.fail[u]<6*36e5)return null;LNK.busy.add(u);let out=null;
  try{if(/youtu\.?be|vimeo\.com|soundcloud\.com|twitter\.com|x\.com|flickr\.com|tiktok\.com|instagram\.com|dailymotion/.test(u)){const r=await fetch('https://noembed.com/embed?url='+encodeURIComponent(u));if(r.ok){const j=await r.json();if(j&&j.title)out={t:j.title,d:j.author_name||'',img:j.thumbnail_url||''}}}
    if(!out&&!ANDROID&&!MAC){const r=await fetch(HELPER+'/meta?u='+encodeURIComponent(u),{cache:'no-store'});if(r.ok){const j=await r.json();if(j&&(j.t||j.d))out={t:j.t||'',d:j.d||'',img:j.img||''}}}}catch(e){}
  LNK.busy.delete(u);if(!out){LNK.fail[u]=Date.now();return null}
  const M=S.lnkMeta||(S.lnkMeta={});M[u]=Object.assign(out,{at:Date.now()});const ks=Object.keys(M);if(ks.length>300)ks.sort((a,b)=>(M[a].at||0)-(M[b].at||0)).slice(0,ks.length-300).forEach(k=>delete M[k]);save();return out}
function lnkCard(u,txt){const yt=lnkYt(u),mp=lnkMap(u);
  if(yt)return`<div class="nemb nyt" data-lnk="${esc(u)}"><button type="button" class="nytp" data-open="${esc(u)}"><img src="https://i.ytimg.com/vi/${yt}/hqdefault.jpg" alt="" loading="lazy" referrerpolicy="no-referrer"><span class="nytb" aria-hidden="true">▶</span></button><b class="nlt" dir="auto">${esc(txt||'')}</b><small>YouTube</small></div>`;
  if(mp)return`<div class="nemb nmap" data-lnk="${esc(u)}"><div class="nmapm" data-la="${mp.la}" data-lo="${mp.lo}" role="img" aria-label="${esc(t('nlk.map'))}"></div><button type="button" class="nmapo" data-open="${esc(u)}">${esc(t('nlk.openMap'))}</button></div>`;
  return`<a class="nlcard" data-lnk="${esc(u)}" href="${esc(u)}" target="_blank" rel="noopener"><span class="nlci" hidden><img alt="" loading="lazy" referrerpolicy="no-referrer"></span><span class="nlcb"><b class="nlt" dir="auto">${esc(txt||lnkHost(u))}</b><small class="nld" dir="auto"></small><small class="nlh">${esc(lnkHost(u))}</small></span></a>`}
function lnkBook(key,pg,txt){return`<button type="button" class="nemb nbkc" data-bkk="${esc(key)}" data-bkp="${pg}"><span class="nbkcv"><img alt="" hidden></span><span><b dir="auto">${esc(txt||t('nlk.book'))}</b><small>${esc(t('nlk.page',pg))}</small></span></button>`}
{const _m=mdLite;mdLite=function(src,...a){const L_=String(src||'').split('\n'),B=[];let inCode=false;
  for(let i=0;i<L_.length;i++){const l=L_[i];if(/^\s*```/.test(l)){inCode=!inCode;continue}if(inCode)continue;let m,u=null,tx='';
    if(m=l.match(/^\s*\[([^\]]*)\]\(thabat-book:([^#)\s]+)#(\d+)\)\s*$/)){B.push(lnkBook(m[2],+m[3],m[1].replace(/^📖\s*/,'').replace(/\s*·.*$/,'')));L_[i]='⟦NLK'+(B.length-1)+'⟧';continue}
    if(m=l.match(/^\s*\[([^\]]*)\]\(((?:https?:\/\/|geo:)[^\s)]+)\)\s*$/)){u=m[2];tx=m[1]}else if(m=l.match(/^\s*<?((?:https?:\/\/|geo:)[^\s<>]+)>?\s*$/))u=m[1];
    if(!u)continue;B.push(lnkCard(u,tx||((S.lnkMeta||{})[u]||{}).t||''));L_[i]='⟦NLK'+(B.length-1)+'⟧'}
  if(!B.length)return _m(src,...a);
  return _m(L_.join('\n'),...a).replace(/<div[^>]*>⟦NLK(\d+)⟧<\/div>/g,(q,n)=>B[+n])}}
{const _p=mdPlain;mdPlain=function(b,...a){return _p(String(b||'').replace(/^\s*\[([^\]]*)\]\(thabat-book:[^)]*\)\s*$/gm,'$1').replace(/^\s*\[([^\]]+)\]\(https?:\/\/[^)]*\)\s*$/gm,'$1'),...a)}}
async function lnkPaint(root){if(!root)return;
  for(const c of root.querySelectorAll('[data-lnk]:not(.nmap)')){const u=c.dataset.lnk;let M=(S.lnkMeta||{})[u];
    const fill=M=>{if(!M)return;const tt=c.querySelector('.nlt');if(tt&&M.t&&(!tt.textContent||tt.textContent===lnkHost(u)))tt.textContent=M.t;const dd=c.querySelector('.nld');if(dd&&M.d)dd.textContent=M.d;
      const im=c.querySelector('.nlci img');if(im&&M.img&&!im.src){im.src=M.img;im.onload=()=>im.parentElement.hidden=false;im.onerror=()=>im.parentElement.remove()}};
    fill(M);if(!M||Date.now()-(M.at||0)>30*864e5)lnkFetch(u).then(fill)}
  const maps=[...root.querySelectorAll('.nmapm:not(.on)')];if(maps.length){try{const Lf=await mqmLoad();for(const el of maps){if(!el.isConnected||el.classList.contains('on'))continue;el.classList.add('on');const la=+el.dataset.la,lo=+el.dataset.lo;
    const map=Lf.map(el,{zoomControl:false,attributionControl:true,scrollWheelZoom:false,zoomAnimation:false,fadeAnimation:false,markerZoomAnimation:false}).setView([la,lo],15);Lf.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap'}).addTo(map);
    Lf.circleMarker([la,lo],{radius:8,color:'#fff',weight:2,fillColor:'#e5484d',fillOpacity:1}).addTo(map);[200,700].forEach(ms=>setTimeout(()=>{try{map.invalidateSize()}catch(e){}},ms))}}catch(e){maps.forEach(el=>el.textContent=t('mqm.noNet'))}}
  for(const b of root.querySelectorAll('[data-bkk]')){const im=b.querySelector('img');try{const d=await idbGet('bcov:'+b.dataset.bkk);if(d&&im){im.src=d;im.hidden=false}}catch(e){}}}
document.addEventListener('click',e=>{const o=e.target.closest&&e.target.closest('#nePrev [data-open],.nbody [data-open]');if(o){e.preventDefault();e.stopPropagation();openExt(o.dataset.open);return}
  const b=e.target.closest&&e.target.closest('#nePrev [data-bkk]');if(b){e.preventDefault();e.stopPropagation();try{nteBkOpen(b.dataset.bkk,+b.dataset.bkp)}catch(x){}}},true);

/* 11: dates — «@اليوم», «@غدًا», «@أمس», «@الخميس», «@15/11» become «@2026-11-15» as soon as a space follows; shown as a chip that opens that day, and the note is listed in that day's panel */
const DMW={'اليوم':0,'today':0,'غدا':1,'غدًا':1,'غداً':1,'غدوة':1,'tomorrow':1,'أمس':-1,'امس':-1,'البارحة':-1,'yesterday':-1};
const DMD=[['الأحد','احد','sunday'],['الإثنين','الاثنين','اثنين','monday'],['الثلاثاء','ثلاثاء','tuesday'],['الأربعاء','الاربعاء','اربعاء','wednesday'],['الخميس','خميس','thursday'],['الجمعة','جمعة','friday'],['السبت','سبت','saturday']];
function dmKey(w){w=String(w).toLowerCase();const d=new Date(),k0=keyToDate(todayKey());if(w in DMW){k0.setDate(k0.getDate()+DMW[w]);return dKey(k0)}
  const wd=DMD.findIndex(a=>a.includes(w));if(wd>=0){let n=(wd-k0.getDay()+7)%7||7;k0.setDate(k0.getDate()+n);return dKey(k0)}
  let m=w.match(/^(\d{1,2})[\/.-](\d{1,2})(?:[\/.-](\d{4}))?$/);if(m){const dd=+m[1],mm=+m[2],yy=m[3]?+m[3]:d.getFullYear();if(mm<1||mm>12||dd<1||dd>31)return null;const x=new Date(yy,mm-1,dd);if(x.getMonth()!==mm-1)return null;return dKey(x)}
  return null}
document.addEventListener('input',e=>{const ta=e.target;if(!ta||ta.id!=='neBody'||e.inputType!=='insertText'||(e.data!==' '&&e.data!=='\n'))return;const p=ta.selectionStart,v=ta.value,before=v.slice(0,p-1);
  const m=before.match(/(^|[\s(])@([^\s@]{1,12})$/);if(!m)return;const k=dmKey(m[2]);if(!k)return;const s=p-1-m[2].length;setTimeout(()=>{if(ta.value.slice(s,p-1)!==m[2])return;ta.setSelectionRange(s,p-1);document.execCommand('insertText',false,k);ta.setSelectionRange(s+k.length+1,s+k.length+1)},0)},true);
function dmLabel(k){const d=keyToDate(k),td=todayKey();const diff=Math.round((d-keyToDate(td))/864e5);const rel=diff===0?t('dm.today'):diff===1?t('dm.tom'):diff===-1?t('dm.yest'):'';return(rel?rel+' · ':'')+L().sdays[d.getDay()]+' '+gShort(d)}
{const _i=mdInline;mdInline=function(x,...a){let h=_i(x,...a);return h.replace(/(^|[\s(>])@(\d{4}-\d{2}-\d{2})(?![\d-])/g,(q,pre,k)=>{const d=keyToDate(k);if(isNaN(d))return q;return`${pre}<a class="ndate${k===todayKey()?' tdy':''}" data-day="${k}" title="${esc(hStr(d))}">${esc(dmLabel(k))}</a>`})}}
document.addEventListener('click',e=>{const a=e.target.closest&&e.target.closest('a.ndate[data-day]');if(!a)return;e.preventDefault();e.stopPropagation();try{thLink('thabat://day/'+a.dataset.day)}catch(x){}},true);
{const _d=dayNotes;dayNotes=function(k,...a){const r=_d(k,...a),ids=new Set(r.map(n=>n.id));NOTES().forEach(n=>{if(!ids.has(n.id)&&!n.arc&&!(n.lock&&!notesUnlocked())&&String(n.body||'').includes('@'+k))r.push(n)});return r.slice(0,16)}}
{const _p=mdPlain;mdPlain=function(b,...a){return _p(String(b||'').replace(/@(\d{4}-\d{2}-\d{2})(?![\d-])/g,(q,k)=>{const d=keyToDate(k);return isNaN(d)?q:gShort(d)}),...a)}}

{hookFn('neShowMode',()=>neShowMode,f=>{neShowMode=f},'post',function(){try{const pv=$('#nePrev');if(pv&&!pv.hidden)lnkPaint(pv)}catch(e){console.error(e)}})}

WNP['3.139.0']=[{k:'wnp.lnk',f:()=>`<a class="nlcard" style="pointer-events:none"><span class="nlcb"><b class="nlt">${esc(t('wnp.lnkT'))}</b><small class="nld">${esc(t('wnp.lnkD'))}</small><small class="nlh">github.com</small></span></a>`},
  {k:'wnp.dm',f:()=>`<div dir="auto" style="font-size:13px">${mdInline(esc(t('wnp.dmSrc',dKey(new Date(Date.now()+864e5)))))}</div>`}];
