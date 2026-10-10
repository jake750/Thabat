
/* ---- notes: backlinks («notes that point here»), nested tags, share as image or PDF ---- */
function noteBacklinks(n){if(!n||!n.title)return[];const T=n.title.trim().toLowerCase();return NOTES().filter(x=>x.id!==n.id&&!(x.lock&&!notesUnlocked())&&String(x.body||'').toLowerCase().includes('[['+T+']]'))}
noteTags=function(n){if(n.lock&&!notesUnlocked())return[];const out=new Set();for(const m of String((n.title||'')+'\n'+(n.body||'')).matchAll(/(^|\s)#([\p{L}\p{N}_]+(?:\/[\p{L}\p{N}_]+)*)/gu)){const parts=m[2].split('/');for(let i=1;i<=parts.length;i++)out.add(parts.slice(0,i).join('/'))}return[...out]};
function noteCanvas(n){const W=1080,P=72,cv=document.createElement('canvas'),g=cv.getContext('2d'),rtl=/[؀-ۿ]/.test((n.title||'')+(n.body||''))||document.documentElement.dir==='rtl',font=getComputedStyle(document.body).fontFamily;
  const wrap=(txt,size,bold)=>{g.font=`${bold?700:400} ${size}px ${font}`;const out=[];String(txt||'').split('\n').forEach(par=>{if(!par.trim()){out.push('');return}let line='';par.split(/\s+/).forEach(w=>{const tr=line?line+' '+w:w;if(g.measureText(tr).width>W-2*P&&line){out.push(line);line=w}else line=tr});out.push(line)});return out};
  const tl=wrap(n.title,52,true),bl=wrap(n.body,32,false),H=Math.min(12000,P*2+tl.length*70+(tl.length?30:0)+bl.length*50+90);cv.width=W;cv.height=H;
  const css=getComputedStyle(document.documentElement);g.fillStyle=css.getPropertyValue('--bg').trim()||'#111';g.fillRect(0,0,W,H);g.fillStyle=css.getPropertyValue('--accent').trim()||'#fddb00';g.fillRect(0,0,W,10);
  g.direction=rtl?'rtl':'ltr';g.textAlign=rtl?'right':'left';const x=rtl?W-P:P;let y=P+40;g.fillStyle=css.getPropertyValue('--text').trim()||'#fff';
  g.font=`700 52px ${font}`;tl.forEach(l=>{g.fillText(l,x,y);y+=70});if(tl.length)y+=30;g.font=`400 32px ${font}`;g.fillStyle=css.getPropertyValue('--text').trim()||'#eee';bl.forEach(l=>{if(y<H-90)g.fillText(l,x,y);y+=50});
  g.font=`400 24px ${font}`;g.fillStyle=css.getPropertyValue('--muted').trim()||'#999';g.textAlign=rtl?'left':'right';g.fillText(t('app')+' · '+gShort(keyToDate(n.day||todayKey())),rtl?P:W-P,H-40);return cv}
function noteShare(n,kind){const cv=noteCanvas(n),name=safeName((n.title||t('notes.untitled')).slice(0,40));
  if(kind==='png')cv.toBlob(b=>saveBytes(name+'.png','image/png',b),'image/png');
  else{const W=595,H=Math.round(cv.height*W/cv.width);saveBytes(name+'.pdf','application/pdf',new Blob([jpegPdf(cv.toDataURL('image/jpeg',.92),cv.width,cv.height,W,H)],{type:'application/pdf'}))}}
{const _r=renderNoteEd;renderNoteEd=function(...a){const r=_r(...a);try{const n=NE,ft=$('#noteBox .neft');if(!n||!ft)return r;
  if(!n._new){const sb=document.createElement('button');sb.className='btn ghost';sb.textContent='↗ '+t('ns.share');sb.onclick=()=>{const rc=sb.getBoundingClientRect();const p=qPopAt(`<button data-k="png">🖼 ${t('ns.png')}</button><button data-k="pdf">📄 ${t('ns.pdf')}</button>`,rc.left+rc.width/2,rc.top-10,'aymenu');p.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{closePP();const cur=Object.assign({},n,{title:($('#neTitle')||{}).value||n.title,body:($('#neBody')||{}).value||n.body});noteShare(cur,b.dataset.k)})};const sp=ft.querySelector('.nesp');if(sp)sp.before(sb)}
  const bl=noteBacklinks(n);if(bl.length){ft.insertAdjacentHTML('beforebegin',`<div class="nebl"><small>🔗 ${t('nb.t',bl.length)}</small>${bl.map(x=>`<button data-bl="${x.id}" dir="auto">${esc(x.title||t('notes.untitled'))}</button>`).join('')}</div>`);$$('#noteBox [data-bl]').forEach(b=>b.onclick=()=>{const id=b.dataset.bl;closeNote(true);setTimeout(()=>openNote(id),60)})}}catch(e){console.error(e)}return r}}

/* ---- Quran: an ayah as a picture to share ---- */
async function ayahCard(s,a){try{const r=S.quran.riwaya,R=RIWAYAT[r]||RIWAYAT.hafs,rr=R.kind==='text'?r:'hafs';await qLoadPack(rr);const tx=qAyahText(s,a,rr);if(!tx){toast(t('ac.none'));return}
  try{await document.fonts.load(`48px Q_${rr}`)}catch(e){}const W=1080,P=90,cv=document.createElement('canvas'),g=cv.getContext('2d');const ff=`'Q_${rr}'`;let size=tx.length>420?40:tx.length>220?48:58;
  const lines=()=>{g.font=`${size}px ${ff}`;const out=[];let line='';tx.split(/\s+/).forEach(w=>{const tr=line?line+' '+w:w;if(g.measureText(tr).width>W-2*P&&line){out.push(line);line=w}else line=tr});if(line)out.push(line);return out};
  let L_=lines();while(L_.length*size*1.9>1300&&size>30){size-=4;L_=lines()}const lh=size*1.9,H=Math.max(1080,P*2+L_.length*lh+200);cv.width=W;cv.height=H;
  const grd=g.createLinearGradient(0,0,0,H);grd.addColorStop(0,'#0f1115');grd.addColorStop(1,'#1b1d24');g.fillStyle=grd;g.fillRect(0,0,W,H);g.strokeStyle='rgba(253,219,0,.55)';g.lineWidth=3;g.strokeRect(40,40,W-80,H-80);
  g.direction='rtl';g.textAlign='center';g.fillStyle='#f5f1e6';g.font=`${size}px ${ff}`;let y=(H-L_.length*lh)/2+size*.7-40;L_.forEach(l=>{g.fillText(l,W/2,y);y+=lh});
  g.font=`500 34px ${getComputedStyle(document.body).fontFamily}`;g.fillStyle='#fddb00';g.fillText(`﴿ ${qSurahName(s)} · ${a} ﴾`,W/2,H-150);if(rr!=='hafs'){const Rn=RIWAYAT[rr];g.font=`400 26px ${getComputedStyle(document.body).fontFamily}`;g.fillStyle='rgba(253,219,0,.75)';g.fillText(t('ac.riw',Rn[LANG]||Rn.ar),W/2,H-112)}g.font=`400 24px ${getComputedStyle(document.body).fontFamily}`;g.fillStyle='rgba(255,255,255,.45)';g.fillText(t('app'),W/2,H-70);
  cv.toBlob(b=>saveBytes(safeName(qSurahName(s)+' '+a)+'.png','image/png',b),'image/png')}catch(e){console.error(e);toast(t('toast.saveFail'))}}
{const _am=qAyahMenu;qAyahMenu=function(s,a,x,y,w){const r=_am(s,a,x,y,w);try{const grid=$('#ppPop .aygrid');if(grid){const b=document.createElement('button');b.textContent='🖼 '+t('ac.btn');b.onclick=()=>{closePP();ayahCard(s,a)};grid.append(b)}}catch(e){}return r}}

/* ---- calendar: an agenda of the next 14 days ---- */
function openAgenda(){const tk=todayKey(),rows=[];for(let i=0;i<14;i++){const k=dKey(addDays(keyToDate(tk),i)),d=S.days[k],ev=evsOn(k),tks=d?d.tasks.filter(x=>!x.done):[],due=(typeof pjDue==='function'?pjDue():[]).filter(x=>x.p&&x.p.due===k);
  if(!ev.length&&!tks.length&&!due.length)continue;const dt=keyToDate(k);rows.push(`<div class="agd"><div class="agh"><b>${i===0?t('ev.today'):i===1?t('ev.tomorrow'):L().days[dt.getDay()]}</b><span>${hStr(dt)} · ${gShort(dt)}</span></div>${ev.map(e=>`<div class="agi ev" data-ev="${e.id}" data-k="${k}"><i style="background:${e.color||'var(--accent)'}"></i>${e.time?`<b>${esc(e.time)}</b>`:''}<span dir="auto">${esc(e.title)}</span></div>`).join('')}${tks.map(x=>`<div class="agi"><i></i>${x.after?`<b>🕌 ${t('pr.'+x.after)}</b>`:''}<span dir="auto">${esc(x.text)}</span></div>`).join('')}${due.map(p=>`<div class="agi"><i style="background:#ef4444"></i><b>⏳</b><span dir="auto">${esc(p.p.name||'')}</span></div>`).join('')}</div>`)}
  openInfo('📋 '+t('ag.t'),rows.length?`<div class="agl">${rows.join('')}</div>`:`<div class="empty">${t('ag.none')}</div>`);$$('#infoBox .agi.ev').forEach(el=>el.onclick=()=>{$('#infoModal').classList.remove('on');openEv(el.dataset.ev,el.dataset.k)})}

/* ---- calendar layers: show or hide events, the productivity fill, stars and moons, fasting marks ---- */
function calLayers(){const L_=S.settings.calLayers||{},v=$('#v-cal');if(!v)return;['ev','fill','sky','fast'].forEach(k=>v.classList.toggle('cl-no-'+k,L_[k]===false))}
function calTools(){const head=$('#v-cal .calhead');if(!head||$('#calTools3'))return;const row=head.querySelector('.row')||head;const w=document.createElement('span');w.id='calTools3';w.className='caltools3';
  w.innerHTML=`<button class="btn sm ghost" id="agBtn">📋 ${t('ag.btn')}</button><button class="btn sm ghost" id="clBtn" title="${esc(t('cl.t'))}">🗂</button>`;row.append(w);
  $('#agBtn').onclick=openAgenda;$('#clBtn').onclick=e=>{const L_=S.settings.calLayers||(S.settings.calLayers={}),r=e.currentTarget.getBoundingClientRect();const p=qPopAt(`<div class="aymh">🗂 ${t('cl.t')}</div>${['ev','fill','sky','fast'].map(k=>`<button data-l="${k}">${L_[k]===false?'☐':'☑'} ${t('cl.'+k)}</button>`).join('')}`,r.left+r.width/2,r.bottom-8,'aymenu');
    p.querySelectorAll('[data-l]').forEach(b=>b.onclick=ev=>{ev.stopPropagation();const k=b.dataset.l;L_[k]=L_[k]===false;save();calLayers();b.textContent=(L_[k]===false?'☐ ':'☑ ')+t('cl.'+k)})}}

/* ---- calendar: drag an event from the day panel onto another day (PC) ---- */
{const _rd=renderDetail;renderDetail=function(k){_rd(k);try{$$('#detail .evli[data-ev]').forEach(el=>{el.draggable=true;el.title=t('evd.tip');el.ondragstart=e=>{e.dataTransfer.setData('text/plain','ev:'+el.dataset.ev+':'+k);el.classList.add('drag')};el.ondragend=()=>el.classList.remove('drag')})}catch(e){}}}
{const _rc=renderCal;renderCal=function(...a){const r=_rc(...a);try{calTools();calLayers();$$('#cal .cell[data-k]').forEach(c=>{if(c._evd)return;c._evd=1;c.addEventListener('drop',e=>{const d=e.dataTransfer.getData('text/plain');if(!d||!d.startsWith('ev:'))return;e.preventDefault();e.stopImmediatePropagation();c.classList.remove('dropon');
  const [,id,from]=d.split(':'),ev=EVS().find(x=>x.id===id),to=c.dataset.k;if(!ev||from===to)return;const old=ev.date,delta=Math.round((keyToDate(to)-keyToDate(from))/864e5);ev.date=dKey(addDays(keyToDate(ev.date),delta));save();selKey=to;renderCal();renderDetail(to);
  toastAct(t('evd.moved',dayLabel(to)),t('undo'),()=>{ev.date=old;save();renderCal();renderDetail(selKey)})},true)})}catch(e){console.error(e)}return r}}

/* ---- PC: drop a file or text on Today ---- */
(()=>{const v=$('#v-today');if(!v)return;let over=0;
  v.addEventListener('dragover',e=>{if(!e.dataTransfer||![...e.dataTransfer.types].includes('Files'))return;e.preventDefault();v.classList.add('dropfile')});
  v.addEventListener('dragleave',e=>{if(!v.contains(e.relatedTarget))v.classList.remove('dropfile')});
  v.addEventListener('drop',async e=>{const fs=[...(e.dataTransfer&&e.dataTransfer.files||[])];v.classList.remove('dropfile');if(!fs.length)return;e.preventDefault();
    const imgs=fs.filter(f=>/^image\//.test(f.type)),txts=fs.filter(f=>/\.(txt|md|markdown)$/i.test(f.name)||/^text\//.test(f.type));
    if(imgs.length){thabatOpen('note');setTimeout(()=>{const inp=$('#neFile');if(!inp)return;const dt=new DataTransfer();imgs.forEach(f=>dt.items.add(f));inp.files=dt.files;inp.dispatchEvent(new Event('change',{bubbles:true}))},250);return}
    if(txts.length){const tx=await txts[0].text(),lines=tx.split(/\r?\n/).map(s=>s.replace(/^\s*(?:[-*•]|\d+[.)]|\[[ xX]\])\s*/,'').trim()).filter(Boolean);
      const rc={left:innerWidth/2,top:innerHeight/3};const p=qPopAt(`<div class="aymh">📄 ${esc(txts[0].name)}</div><button data-k="note">📝 ${t('df.note')}</button>${lines.length>1&&lines.length<=60?`<button data-k="tasks">☑ ${t('df.tasks',lines.length)}</button>`:''}`,rc.left,rc.top,'aymenu');
      p.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{closePP();if(b.dataset.k==='tasks'){const d=day(todayKey());lines.forEach(l=>d.tasks.push({id:uid(),text:l,done:false,created:Date.now()}));save();renderTasks();toast(t('ps3.added',lines.length))}else{thabatOpen('note');setTimeout(()=>{if(!NE)return;NE.title=txts[0].name.replace(/\.[^.]+$/,'');NE.body=tx;renderNoteEd()},150)}})}})})();

{const _cc=cmdCommands;cmdCommands=function(){const L_=_cc();L_.push({icon:'📋',label:t('ag.t'),run:()=>{showView('cal');openAgenda()},kw:'agenda upcoming جدول الاعمال القادمة'});return L_}}
try{if(curView()==='cal')renderCal()}catch(e){}
