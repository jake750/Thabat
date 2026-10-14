/* ============ v2.9 notes: markdown, checklists, tags, links, voice, lock, templates ============ */
var nTag=null;
const TAG_RE=/(^|\s)#([\p{L}\p{N}_]+)/gu;
var noteTags;
var renderNTags;
function mdInline(x){return x.replace(/\*\*([^*]+)\*\*/g,'<b>$1</b>').replace(/(^|[\s(])_([^_]+)_(?=[\s).,،!?]|$)/g,'$1<i>$2</i>').replace(/`([^`]+)`/g,'<code>$1</code>')
  .replace(/\[\[([^\]]+)\]\]/g,(m,a)=>`<a class="nlink" data-nl="${a}">${a}</a>`).replace(/(https?:\/\/[^\s<]+)/g,'<a href="$1" target="_blank" rel="noopener">$1</a>').replace(TAG_RE,'$1<span class="ntag" data-tag="$2">#$2</span>')}
function mdLite(src){const L_=String(src||'').split('\n');let out='',kind=null;const close=()=>{if(kind){out+=kind==='ol'?'</ol>':'</ul>';kind=null}},open=k=>{if(kind!==k){close();out+=k==='ol'?'<ol>':`<ul${k==='chk'?' class="nchk"':''}>`;kind=k}};
  L_.forEach((ln,i)=>{let m;
    if(m=ln.match(/^\s*[-*] \[( |x|X)\]\s?(.*)$/)){open('chk');const on=m[1]!==' ';out+=`<li class="${on?'dn':''}"><input type="checkbox" data-ln="${i}" ${on?'checked':''}><span>${mdInline(esc(m[2]))}</span></li>`}
    else if(m=ln.match(/^\s*[-*•] (.*)$/)){open('ul');out+=`<li>${mdInline(esc(m[1]))}</li>`}
    else if(m=ln.match(/^\s*\d+[.)] (.*)$/)){open('ol');out+=`<li>${mdInline(esc(m[1]))}</li>`}
    else{close();if(m=ln.match(/^(#{1,3}) (.*)$/))out+=`<div class="nh${m[1].length}">${mdInline(esc(m[2]))}</div>`;else if(!ln.trim())out+='<div class="nbr"></div>';else out+=`<div>${mdInline(esc(ln))}</div>`}});
  close();return out}
function mdPlain(b){return String(b||'').replace(/^\s*[-*] \[[xX]\]\s?/gm,'☑ ').replace(/^\s*[-*] \[ \]\s?/gm,'☐ ').replace(/^#{1,3} /gm,'').replace(/\*\*([^*]+)\*\*/g,'$1').replace(/\[\[([^\]]+)\]\]/g,'$1')}
function chkCount(b){const a=String(b||'').match(/^\s*[-*] \[( |x|X)\]/gm)||[];return{n:a.length,d:a.filter(x=>/x/i.test(x)).length}}
function noteBadges(n){const c=chkCount(n.body),a=(n.auds||[]).length;return(c.n?` · ☑ ${c.d}/${c.n}`:'')+(a?` · 🎙 ${a}`:'')}
/* lock */
function notesUnlocked(){return Date.now()<(window._nUnlock||0)}
async function pinHash(p){const str='thabat-notes:'+p;try{if(crypto&&crypto.subtle){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(str));return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}}catch(e){}let h=5381;for(const c of str)h=((h<<5)+h+c.charCodeAt(0))|0;return'd'+(h>>>0).toString(16)}
function pinAsk(mode,done){const box=$('#pinBox');let first=null;
  const draw=(msg)=>{box.innerHTML=`<h2 style="font-size:18px">🔒 ${t(mode==='set'?(first?'pin.again':'pin.set'):'pin.enter')}</h2><p style="color:var(--muted);font-size:12.5px">${msg||t(mode==='set'?'pin.setSub':'pin.enterSub')}</p><input class="in" id="pinIn" type="password" inputmode="numeric" autocomplete="off" maxlength="12"><div class="evact">${mode==='check'?`<button class="btn sm ghost" id="pinForgot">${t('pin.forgot')}</button>`:''}<span style="flex:1"></span><button class="btn sm ghost" id="pinX">${t('ev.cancel')}</button><button class="btn sm pri" id="pinOk">${t('ok')}</button></div>`;
    const inp=$('#pinIn');setTimeout(()=>inp.focus(),50);inp.onkeydown=e=>{if(e.key==='Enter')$('#pinOk').click()};
    $('#pinX').onclick=()=>$('#pinModal').classList.remove('on');
    const fg=$('#pinForgot');if(fg)fg.onclick=()=>{if(!confirm(t('pin.resetQ')))return;delete S.notesPin;NOTES().forEach(n=>delete n.lock);save();$('#pinModal').classList.remove('on');toast(t('pin.resetDone'));notesChanged()};
    $('#pinOk').onclick=async()=>{const v=inp.value.trim();if(v.length<4){draw(t('pin.short'));return}
      if(mode==='set'){if(!first){first=v;draw();return}if(v!==first){first=null;draw(t('pin.mismatch'));return}S.notesPin=await pinHash(v);save();window._nUnlock=Date.now()+5*6e4;$('#pinModal').classList.remove('on');done&&done()}
      else{if(await pinHash(v)===S.notesPin){window._nUnlock=Date.now()+5*6e4;$('#pinModal').classList.remove('on');setTimeout(notesChanged,5*6e4+500);done&&done()}else draw(t('pin.wrong'))}}};
  draw();$('#pinModal').classList.add('on')}
{const _nc=noteCard;noteCard=function(n){if(n.lock&&!notesUnlocked())return`<button class="ncard nlocked" data-note="${n.id}"><div class="nbody"><b dir="auto">🔒 ${esc(n.title||t('notes.untitled'))}</b><small>${t('pin.lockedCard')}</small></div></button>`;return _nc(n)}}
{const _on=openNote;openNote=function(id,dayK){const n=id?NOTES().find(x=>x.id===id):null;if(n&&n.lock&&!notesUnlocked()){pinAsk('check',()=>{notesChanged();openNote(id,dayK)});return}_on(id,dayK);if(NE){NE._addedA=[];NE.auds=NE.auds||[];NE._view=!NE._new&&/^\s*([-*] \[[ xX]\]|#{1,3} )/m.test(NE.body||'');renderNoteEd()}}}
{const _cn=closeNote;closeNote=function(saveIt){if(!NE)return _cn(saveIt);neRecStop(true);if(!NE._view)neRead();const n=NE,orig=((NOTES().find(x=>x.id===n.id)||{}).auds||[]).map(a=>a.id),cur=(n.auds||[]).map(a=>a.id),added=n._addedA||[];_cn(saveIt);
  const kept=NOTES().some(x=>x.id===n.id);const drop=saveIt&&kept?orig.filter(id=>!cur.includes(id)):added;drop.forEach(id=>{try{idbSet('naud:'+id,null)}catch(e){}})}}
/* templates */
const NTPL=[{k:'outing',title:'خرجة مع ',body:'📍 المكان: \n👥 مع: \n✨ أحلى لحظة: \n'},{k:'scene',title:'المشهد ',body:'⏱ التوقيت: \n🎬 الوصف: \n🎨 الألوان والأسلوب: \n🔊 الصوت: \n- [ ] الستوريبورد\n- [ ] التحريك\n- [ ] المراجعة'},
 {k:'idea',title:'فكرة: ',body:'💡 الفكرة: \n🎯 الهدف: \n## الخطوات\n- [ ] '},{k:'lesson',title:'درس: ',body:'📚 المصدر: \n## أهم ما تعلّمت\n- \n## أطبّقه في\n- [ ] '},{k:'journal',title:'',body:'😊 شعوري اليوم: \n🙏 أحمد الله على: \n🌱 تعلّمت: \n'}];
function tplApply(T){neRead();if(!NE.title.trim())NE.title=T.k==='journal'?t('tpl.journal')+' '+gShort(keyToDate(NE.day)):(T.title||'');NE.body=NE.body.trim()?NE.body.replace(/\s*$/,'\n\n')+T.body:T.body;renderNoteEd();const ta=$('#neTitle');if(ta){ta.focus();ta.setSelectionRange(ta.value.length,ta.value.length)}}
/* editor extras */
let NREC=null;
function neRecStop(discard){if(!NREC)return;NREC.discard=!!discard;try{NREC.mr.stop()}catch(e){}}
function fmtSec(ms){const s=Math.round(ms/1000);return Math.floor(s/60)+':'+pad(s%60)}
async function neRecStart(){if(NREC){neRecStop();return}if(!navigator.mediaDevices||!window.MediaRecorder){toast(t('ne.recNo'));return}
  let st;try{st=await navigator.mediaDevices.getUserMedia({audio:true})}catch(e){toast(t('ne.recDenied'));return}
  const mime=['audio/webm;codecs=opus','audio/webm','audio/mp4','audio/ogg'].find(m=>MediaRecorder.isTypeSupported&&MediaRecorder.isTypeSupported(m))||'';const mr=new MediaRecorder(st,mime?{mimeType:mime}:{}),chunks=[],t0=Date.now();
  NREC={mr,t0,tm:setInterval(()=>{const b=$('#neRec');if(b)b.textContent='⏹ '+fmtSec(Date.now()-t0)},500)};const b=$('#neRec');if(b){b.classList.add('rec');b.textContent='⏹ 0:00'}
  mr.ondataavailable=e=>{if(e.data&&e.data.size)chunks.push(e.data)};
  mr.onstop=async()=>{clearInterval(NREC.tm);st.getTracks().forEach(x=>x.stop());const disc=NREC.discard,ms=Date.now()-t0;NREC=null;if(disc||!NE||!chunks.length)return;const blob=new Blob(chunks,{type:mr.mimeType||'audio/webm'}),id=uid();
    try{await idbSet('naud:'+id,blob)}catch(e){toast(t('toast.saveFail'));return}NE.auds=NE.auds||[];NE.auds.push({id,ms});NE._addedA=NE._addedA||[];NE._addedA.push(id);neRenderAuds();const rb=$('#neRec');if(rb){rb.classList.remove('rec');rb.textContent='🎙'}};
  mr.start(1000)}
async function neRenderAuds(){const box=$('#neAuds');if(!box||!NE)return;box.innerHTML=(NE.auds||[]).map((a,i)=>`<div class="neaud"><audio controls preload="metadata" data-aud="${a.id}"></audio><small>${fmtSec(a.ms||0)}</small><button class="btn sm ghost" data-adel="${i}" title="${esc(t('del'))}">✕</button></div>`).join('');
  for(const el of box.querySelectorAll('audio[data-aud]')){try{const b=await idbGet('naud:'+el.dataset.aud);if(b)el.src=URL.createObjectURL(b);else el.closest('.neaud').querySelector('small').textContent=t('lb.miss')}catch(e){}}
  box.querySelectorAll('[data-adel]').forEach(b=>b.onclick=()=>{NE.auds.splice(+b.dataset.adel,1);neRenderAuds()})}
function mdApply(k){const ta=$('#neBody');if(!ta)return;const v=ta.value,a=ta.selectionStart,b=ta.selectionEnd,ls=v.lastIndexOf('\n',a-1)+1;let nv,ca,cb;
  const pre=p=>{nv=v.slice(0,ls)+p+v.slice(ls);ca=a+p.length;cb=b+p.length},wrap=(l,r)=>{nv=v.slice(0,a)+l+v.slice(a,b)+r+v.slice(b);ca=a+l.length;cb=b+l.length};
  if(k==='h')pre('## ');else if(k==='li')pre('- ');else if(k==='chk')pre('- [ ] ');else if(k==='b')wrap('**','**');else if(k==='link')wrap('[[',']]');else if(k==='tag')wrap('#','');
  ta.value=nv;ta.focus();ta.setSelectionRange(ca,cb);neRead()}
function neShowMode(){const ta=$('#neBody'),pv=$('#nePrev');if(!ta||!pv)return;const v=!!NE._view;$$('#neMode button').forEach(b=>b.classList.toggle('on',(b.dataset.m==='view')===v));$$('.netb [data-md]').forEach(b=>b.hidden=v);
  ta.hidden=v;pv.hidden=!v;if(!v)return;pv.innerHTML=NE.body.trim()?mdLite(NE.body):`<div class="empty">${t('ne.emptyView')}</div>`;
  pv.querySelectorAll('input[data-ln]').forEach(c=>c.onchange=()=>{const L_=NE.body.split('\n'),i=+c.dataset.ln;L_[i]=L_[i].replace(/\[( |x|X)\]/,c.checked?'[x]':'[ ]');NE.body=L_.join('\n');ta.value=NE.body;neShowMode()});
  pv.querySelectorAll('[data-nl]').forEach(l=>l.onclick=()=>{const title=l.dataset.nl.trim(),tgt=NOTES().find(x=>(x.title||'').trim().toLowerCase()===title.toLowerCase());closeNote(true);if(tgt)openNote(tgt.id);else{openNote(null,todayKey());if(NE){NE.title=title;renderNoteEd()}}});
  pv.querySelectorAll('[data-tag]').forEach(x=>x.onclick=()=>{closeNote(true);showView('boards');nbMode='notes';renderBoardsView();$('#nSearch').value='#'+x.dataset.tag;renderNotes()})}
{hookFn('renderNoteEd',()=>renderNoteEd,f=>{renderNoteEd=f},'post',function(){try{neExtras()}catch(e){console.error(e)}})}
function neExtras(){const ta=$('#neBody');if(!ta||!NE)return;const n=NE;
  ta.insertAdjacentHTML('beforebegin',`<div class="netools"><div class="seg" id="neMode"><button data-m="edit">✏️ ${t('ne.edit')}</button><button data-m="view">👁 ${t('ne.view')}</button></div>
   <span class="netb">${[['h','H'],['b','B'],['li','•'],['chk','☑'],['link','[[ ]]'],['tag','#']].map(([k,l])=>`<button class="btn sm ghost" data-md="${k}" title="${esc(t('ne.md.'+k))}">${l}</button>`).join('')}<button class="btn sm ghost ${NREC?'rec':''}" id="neRec" title="${esc(t('ne.rec'))}">🎙</button><button class="btn sm ghost" id="neLock" title="${esc(t(n.lock?'ne.unlock':'ne.lock'))}">${n.lock?'🔒':'🔓'}</button><button class="btn sm ghost" id="neTplSave" title="${esc(t('ne.tplSave'))}">📑</button></span></div>`);
  ta.insertAdjacentHTML('afterend','<div class="neprev" id="nePrev" dir="auto" hidden></div><div class="neauds" id="neAuds"></div>');
  if(n._new){const U=S.noteTpls||[];$('#noteBox').insertAdjacentHTML('afterbegin',`<div class="netpl"><span>${t('tpl.lbl')}</span>${NTPL.map((x,i)=>`<span class="chip" data-tb="${i}">${t('tpl.'+x.k)}</span>`).join('')}${U.map(x=>`<span class="chip" data-tu="${x.id}">${esc(x.name)}<i data-tux="${x.id}">✕</i></span>`).join('')}</div>`);
    $$('#noteBox [data-tb]').forEach(c=>c.onclick=()=>tplApply(NTPL[+c.dataset.tb]));
    $$('#noteBox [data-tu]').forEach(c=>c.onclick=e=>{if(e.target.dataset.tux){S.noteTpls=(S.noteTpls||[]).filter(x=>x.id!==e.target.dataset.tux);save();neRead();renderNoteEd();return}const T=(S.noteTpls||[]).find(x=>x.id===c.dataset.tu);if(T)tplApply(T)})}
  $$('#neMode button').forEach(b=>b.onclick=()=>{if(!NE._view)neRead();NE._view=b.dataset.m==='view';neShowMode()});
  $$('.netb [data-md]').forEach(b=>b.onclick=()=>mdApply(b.dataset.md));
  $('#neRec').onclick=neRecStart;
  $('#neLock').onclick=()=>{neRead();if(NE.lock){NE.lock=0;renderNoteEd();return}const go=()=>{NE.lock=1;renderNoteEd();toast(t('pin.locked'))};if(!S.notesPin)pinAsk('set',go);else go()};
  $('#neTplSave').onclick=()=>{neRead();if(!NE.body.trim()&&!NE.title.trim()){toast(t('tpl.empty'));return}S.noteTpls=S.noteTpls||[];S.noteTpls.push({id:uid(),name:(NE.title.trim()||t('tpl.mine')).slice(0,24),title:NE.title,body:NE.body});save();toast(t('tpl.saved'))};
  ta.addEventListener('keydown',e=>{if(e.key!=='Enter'||e.shiftKey)return;const v=ta.value,a=ta.selectionStart,ls=v.lastIndexOf('\n',a-1)+1,line=v.slice(ls,a),m=line.match(/^(\s*)([-*•] \[[ xX]\] |[-*•] |(\d+)[.)] )/);if(!m)return;e.preventDefault();
    if(line.trim()===m[2].trim()){ta.value=v.slice(0,ls)+v.slice(a);ta.setSelectionRange(ls,ls);return}let p=m[2].replace(/\[[xX]\]/,'[ ]');if(m[3])p=(+m[3]+1)+m[2].slice(m[3].length);const ins='\n'+m[1]+p;ta.value=v.slice(0,a)+ins+v.slice(a);ta.setSelectionRange(a+ins.length,a+ins.length)});
  const del=$('#neDel');if(del){const old=del.onclick;del.onclick=()=>{const ids=(NE.auds||[]).map(a=>a.id);old();if(!NE)ids.forEach(id=>{try{idbSet('naud:'+id,null)}catch(e){}})}}
  neShowMode();neRenderAuds()}
