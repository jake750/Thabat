/* ============ v3.19: the new library player — our own controls over the video, the course's lessons and your notes beside it, notes at a minute (saved in Notes), picture-in-picture, and «watch later» across courses ============ */
/* the old libPlay still does the work (progress, prev/next, speed, folder order); this rebuilds its face around the same <video> */
const LPV={tab:'les',hideT:0,wasPlaying:false,noteOpen:false};
/* «watch later»: S.lib.later = [{id,n,c,at}] (synced with the library) */
function lpvLater(){const L_=LIBS();return L_.later||(L_.later=[])}
function lpvLaterHas(id){return lpvLater().some(x=>x.id===id)}
function lpvLaterToggle(id,n,c){const L=lpvLater(),i=L.findIndex(x=>x.id===id);if(i>=0)L.splice(i,1);else L.push({id,n:n||'',c:c||'',at:Date.now()});save();toast(i>=0?t('lpv.laterOff'):t('lpv.laterOn'));return i<0}
function lpvLaterDel(id){const L=lpvLater(),i=L.findIndex(x=>x.id===id);if(i>=0){L.splice(i,1);save()}}
/* notes at a minute: one note per lesson in Notes (n.lib = lesson id), one line per moment: «- [12:04] text» */
const LPV_RE=/^\s*[-*]\s*\[(\d{1,2}:\d{2}(?::\d{2})?)\]\s?(.*)$/gm;
function lpvSec(ts){return ts.split(':').reduce((a,x)=>a*60+(+x),0)}
function lpvNoteOf(id){return NOTES().find(n=>n.lib===id)||null}
function lpvMarks(id){const n=lpvNoteOf(id);if(!n)return[];const out=[];let m;LPV_RE.lastIndex=0;while((m=LPV_RE.exec(n.body||''))){out.push({ts:m[1],s:lpvSec(m[1]),tx:m[2]})}return out.sort((a,b)=>a.s-b.s)}
function lpvAddNote(id,sec,text){const it=LIB.cur;let n=lpvNoteOf(id);
  if(!n){n={id:uid(),title:'🎬 '+(it&&it.id===id?libTitle(it.n):id),body:'#'+t('lpv.tag')+'\n',day:todayKey(),imgs:[],created:Date.now(),lib:id,libC:it&&it.id===id?it.course.n:''};NOTES().push(n)}
  n.body=String(n.body||'').replace(/\s*$/,'')+'\n- ['+fmtTC(sec)+'] '+text.replace(/\n+/g,' ').trim();n.updated=Date.now();save();try{renderNotes()}catch(e){}return n}
function lpvDelMark(id,ts,tx){const n=lpvNoteOf(id);if(!n)return;const lines=String(n.body||'').split('\n');const i=lines.findIndex(l=>{LPV_RE.lastIndex=0;const m=LPV_RE.exec(l);return m&&m[1]===ts&&m[2]===tx});if(i<0)return;lines.splice(i,1);n.body=lines.join('\n');n.updated=Date.now();save();try{renderNotes()}catch(e){}}
/* building the face */
function lpvIcon(k){const P={play:'<path d="M7 4v16l13-8z" fill="currentColor"/>',pause:'<path d="M7 4h4v16H7zM13 4h4v16h-4z" fill="currentColor"/>',prev:'<path d="M6 5v14M19 5L9 12l10 7z" fill="currentColor" stroke="currentColor" stroke-width="2"/>',next:'<path d="M18 5v14M5 5l10 7-10 7z" fill="currentColor" stroke="currentColor" stroke-width="2"/>',
  back:'<path d="M4 12a8 8 0 1 0 2.3-5.6M4 4v4h4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><text x="12" y="15.5" font-size="7.5" text-anchor="middle" fill="currentColor" font-family="sans-serif" font-weight="700">10</text>',
  fwd:'<path d="M20 12a8 8 0 1 1-2.3-5.6M20 4v4h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><text x="12" y="15.5" font-size="7.5" text-anchor="middle" fill="currentColor" font-family="sans-serif" font-weight="700">10</text>',
  vol:'<path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',mute:'<path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  pip:'<rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><rect x="12" y="11" width="7" height="6" rx="1" fill="currentColor"/>',full:'<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  unfull:'<path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'};return`<svg viewBox="0 0 24 24" aria-hidden="true">${P[k]}</svg>`}
function lpvBuild(id){const ov=$('#libPlayer'),v=$('#lvV'),it=LIB.cur;if(!ov||!v||!it||it.id!==id)return;const L_=LIBS();
  ov.classList.add('lpv');v.removeAttribute('controls');const vw=ov.querySelector('.lbvw'),pc=ov.querySelector('.lbpc'),top=ov.querySelector('.lbpt');
  const canPip=!!(document.pictureInPictureEnabled&&v.requestPictureInPicture)&&!ANDROID;
  vw.insertAdjacentHTML('beforeend',`<button class="lpvbig" id="lpvBig" aria-label="${esc(t('lpv.play'))}">${lpvIcon('play')}</button><div class="lpvhint" id="lpvHint"></div>
    <div class="lpvctl" id="lpvCtl" dir="ltr"><div class="lpvtl" id="lpvTl"><span class="lpvbuf"></span><span class="lpvplayed"></span><span class="lpvmarks"></span><span class="lpvknob"></span><span class="lpvtip" hidden></span></div>
      <div class="lpvrow"><button data-c="prev" title="${esc(t('lpv.prev'))}" aria-label="${esc(t('lpv.prev'))}">${lpvIcon('prev')}</button><button data-c="b10" title="−10 (J)" aria-label="−10">${lpvIcon('back')}</button><button data-c="pp" class="lpvpp" title="${esc(t('lpv.play'))} (K)" aria-label="${esc(t('lpv.play'))}">${lpvIcon('play')}</button><button data-c="f10" title="+10 (L)" aria-label="+10">${lpvIcon('fwd')}</button><button data-c="next" title="${esc(t('lpv.next'))}" aria-label="${esc(t('lpv.next'))}">${lpvIcon('next')}</button>
        <span class="lpvtime" id="lpvTime">0:00 / 0:00</span><span class="lpvsp"></span>
        <button data-c="spd" class="lpvspd" id="lpvSpd" title="${esc(t('lpv.speed'))} ([ ])">${L_.speed||1}×</button><button data-c="mute" class="lpvpc" title="${esc(t('lpv.mute'))} (M)" aria-label="${esc(t('lpv.mute'))}">${lpvIcon('vol')}</button><input type="range" class="lpvvol lpvpc" id="lpvVol" min="0" max="1" step="0.05" value="${v.volume}" aria-label="${esc(t('lpv.vol'))}">
        ${canPip?`<button data-c="pip" title="${esc(t('lpv.pip'))} (P)" aria-label="${esc(t('lpv.pip'))}">${lpvIcon('pip')}</button>`:''}<button data-c="full" title="${esc(t('lpv.full'))} (F)" aria-label="${esc(t('lpv.full'))}">${lpvIcon('full')}</button></div></div>
    <div class="lpvspm" id="lpvSpm" hidden>${[0.75,1,1.25,1.5,1.75,2,2.5,3].map(x=>`<button data-sp2="${x}">${x}×</button>`).join('')}</div>`);
  /* the column: video, then title and actions; the side: lessons, notes, later */
  const col=document.createElement('div');col.className='lpvcol';const main=document.createElement('div');main.className='lpvmain';vw.before(main);main.append(col);col.append(vw);
  col.insertAdjacentHTML('beforeend',`<div class="lpvinfo"><div class="lpvttl"><b dir="auto" id="lpvT"></b><small dir="auto" id="lpvC"></small></div>
    <div class="lpvacts"><button class="lpva" id="lpvNoteB">📝 <span>${t('lpv.noteAt')}</span> <i dir="ltr" id="lpvNow">0:00</i></button><button class="lpva" id="lpvLaterB"></button><button class="lpva" id="lpvDoneB"></button></div></div>`);
  main.insertAdjacentHTML('beforeend',`<aside class="lpvside"><div class="lpvtabs" role="tablist"><button data-tab="les" role="tab"></button><button data-tab="notes" role="tab"></button><button data-tab="later" role="tab"></button></div><div class="lpvbody" id="lpvBody"></div></aside>`);
  if(pc)pc.hidden=true;
  const ttl=$('#lpvT'),cc=$('#lpvC');ttl.textContent=libTitle(it.n);cc.textContent=it.course.n+(it.ch?' · '+it.ch:'');
  /* controls */
  const C=k=>ov.querySelector(`[data-c="${k}"]`);
  const sync=()=>{if(!v.isConnected||!ov.contains(v))return;const p=v.paused;C('pp').innerHTML=lpvIcon(p?'play':'pause');$('#lpvBig').hidden=!p;ov.classList.toggle('lpvpaused',p);const d=isFinite(v.duration)?v.duration:0,c=v.currentTime||0;$('#lpvTime').textContent=fmtTC(c)+' / '+fmtTC(d);$('#lpvNow').textContent=fmtTC(c);
    const pct=d?c/d*100:0;ov.querySelector('.lpvplayed').style.width=pct+'%';ov.querySelector('.lpvknob').style.left=pct+'%';let b=0;try{for(let i=0;i<v.buffered.length;i++)if(v.buffered.start(i)<=c+1)b=Math.max(b,v.buffered.end(i))}catch(e){}ov.querySelector('.lpvbuf').style.width=(d?b/d*100:0)+'%'};
  ['play','pause','timeupdate','progress','loadedmetadata','durationchange','seeked'].forEach(ev=>v.addEventListener(ev,sync));
  v.addEventListener('ratechange',()=>{if(v.isConnected&&$('#lpvSpd'))$('#lpvSpd').textContent=(+v.playbackRate.toFixed(2))+'×'});
  v.addEventListener('volumechange',()=>{if(!v.isConnected||!C('mute'))return;C('mute').innerHTML=lpvIcon(v.muted||!v.volume?'mute':'vol');$('#lpvVol').value=v.muted?0:v.volume});
  v.addEventListener('loadedmetadata',lpvMarksPaint);v.addEventListener('durationchange',lpvMarksPaint);
  v.addEventListener('ended',()=>lpvLaterDel(id));
  const toggle=()=>{v.paused?v.play().catch(()=>{}):v.pause()};
  C('pp').onclick=toggle;$('#lpvBig').onclick=toggle;
  C('b10').onclick=()=>{v.currentTime=Math.max(0,v.currentTime-10);lpvFlash('−10')};C('f10').onclick=()=>{v.currentTime=Math.min(v.duration||1e9,v.currentTime+10);lpvFlash('+10')};
  const op=$('#lvPrev'),on=$('#lvNext');C('prev').disabled=!op||op.disabled;C('next').disabled=!on||on.disabled;C('prev').onclick=()=>op&&op.click();C('next').onclick=()=>on&&on.click();
  C('mute').onclick=()=>{v.muted=!v.muted};$('#lpvVol').oninput=e=>{v.volume=+e.target.value;v.muted=!v.volume};
  const spm=$('#lpvSpm');C('spd').onclick=e=>{e.stopPropagation();spm.hidden=!spm.hidden;spm.querySelectorAll('[data-sp2]').forEach(b=>b.classList.toggle('on',+b.dataset.sp2===v.playbackRate))};
  spm.querySelectorAll('[data-sp2]').forEach(b=>b.onclick=()=>{lpvSpeed(+b.dataset.sp2);spm.hidden=true});
  if(C('pip'))C('pip').onclick=()=>lpvPip();
  C('full').onclick=()=>lpvFull();
  /* the timeline: click or drag to seek; on PC a time tip follows the pointer */
  const tl=$('#lpvTl'),tip=tl.querySelector('.lpvtip'),at=e=>{const r=tl.getBoundingClientRect();return Math.max(0,Math.min(1,(e.clientX-r.left)/r.width))};
  tl.onpointerdown=e=>{if(!v.duration||!isFinite(v.duration))return;tl.setPointerCapture(e.pointerId);tl.classList.add('drag');const mv=ev=>{v.currentTime=at(ev)*v.duration;sync()};mv(e);tl.onpointermove=ev=>{mv(ev);lpvTip(ev)};tl.onpointerup=tl.onpointercancel=()=>{tl.classList.remove('drag');tl.onpointermove=lpvTip;tl.onpointerup=null}};
  const lpvTip=e=>{if(!v.duration||!isFinite(v.duration)||e.pointerType==='touch'&&!tl.classList.contains('drag'))return;const f=at(e);tip.hidden=false;tip.style.left=f*100+'%';tip.textContent=fmtTC(f*v.duration)};tl.onpointermove=lpvTip;tl.onpointerleave=()=>{tip.hidden=true};
  /* the picture: click = play/pause (PC); a tap shows the controls (phone); double tap on a side = ±10 */
  let lastTap=0;vw.addEventListener('click',e=>{if(e.target.closest('.lpvctl,.lpvbig,.lpvspm'))return;spm.hidden=true;const now=Date.now(),r=vw.getBoundingClientRect(),x=(e.clientX-r.left)/r.width;
    if(matchMedia('(pointer:coarse)').matches){if(now-lastTap<300&&(x<.35||x>.65)){(x<.35?C('b10'):C('f10')).click();lastTap=0;return}lastTap=now;lpvWake();return}toggle()});
  vw.addEventListener('dblclick',e=>{if(e.target.closest('.lpvctl'))return;if(!matchMedia('(pointer:coarse)').matches){toggle();lpvFull()}});
  ov.addEventListener('pointermove',lpvWake);
  /* actions under the video */
  $('#lpvNoteB').onclick=()=>lpvNoteStart();
  const paintLater=()=>{const h=lpvLaterHas(id);$('#lpvLaterB').innerHTML=h?`✓ <span>${t('lpv.inLater')}</span>`:`🕒 <span>${t('lpv.later')}</span>`;$('#lpvLaterB').classList.toggle('on',h)};
  $('#lpvLaterB').onclick=()=>{lpvLaterToggle(id,libTitle(it.n),it.course.n);paintLater();lpvSide()};paintLater();
  const od=$('#lvDone'),paintDone=()=>{const d=!!(LIBS().prog[id]||{}).done;$('#lpvDoneB').innerHTML=d?`✓ <span>${t('lb.watched')}</span>`:`○ <span>${t('lsh.notYet')}</span>`;$('#lpvDoneB').classList.toggle('on',d)};
  $('#lpvDoneB').onclick=()=>{od&&od.click();paintDone();lpvSide()};paintDone();v.addEventListener('ended',()=>setTimeout(paintDone,50));
  /* top bar: the title moves under the video; the ⛶ there becomes our full screen */
  const fs=$('#lvFs');if(fs){fs.onclick=()=>lpvFull()}
  ov.querySelectorAll('.lpvtabs [data-tab]').forEach(b=>b.onclick=()=>{LPV.tab=b.dataset.tab;lpvSide()});
  LPV.noteOpen=false;sync();lpvSide();lpvMarksPaint();lpvWake()}
function lpvFlash(txt){const h=$('#lpvHint');if(!h)return;h.textContent=txt;h.classList.remove('on');void h.offsetWidth;h.classList.add('on')}
function lpvSpeed(x){const v=$('#lvV');if(!v)return;x=Math.max(.5,Math.min(3,Math.round(x*100)/100));v.playbackRate=x;LIBS().speed=x;save();lpvFlash(x+'×');const ob=$(`#libPlayer [data-sp="${x}"]`);$$('#libPlayer [data-sp]').forEach(z=>z.classList.toggle('on',z===ob))}
function lpvWake(){const ov=$('#libPlayer');if(!ov)return;ov.classList.remove('lpvidle');clearTimeout(LPV.hideT);LPV.hideT=setTimeout(()=>{const v=$('#lvV');if(v&&!v.paused&&!$('#lpvTl.drag')&&$('#lpvSpm')&&$('#lpvSpm').hidden)ov.classList.add('lpvidle')},2600)}
function lpvFull(){const ov=$('#libPlayer');if(!ov)return;const on=!ov.classList.contains('max');
  if(on&&!ANDROID&&ov.requestFullscreen&&!document.fullscreenElement)ov.requestFullscreen().catch(()=>{});else if(!on&&document.fullscreenElement)document.exitFullscreen().catch(()=>{});
  ov.classList.toggle('max',on);const b=ov.querySelector('[data-c="full"]');if(b)b.innerHTML=lpvIcon(on?'unfull':'full');lpvWake()}
document.addEventListener('fullscreenchange',()=>{const ov=$('#libPlayer');if(ov&&ov.classList.contains('lpv')&&!document.fullscreenElement&&ov.classList.contains('max')){ov.classList.remove('max');const b=ov.querySelector('[data-c="full"]');if(b)b.innerHTML=lpvIcon('full')}});
/* picture-in-picture: the player steps aside so you can use Thabat; closing the little window brings it back */
async function lpvPip(){const v=$('#lvV'),ov=$('#libPlayer');if(!v)return;try{if(document.pictureInPictureElement){await document.exitPictureInPicture();return}await v.requestPictureInPicture();ov.classList.add('lpvpip');document.documentElement.classList.remove('lbpl-on');
  v.addEventListener('leavepictureinpicture',()=>{ov.classList.remove('lpvpip');if(ov.classList.contains('on'))document.documentElement.classList.add('lbpl-on')},{once:true})}catch(e){toast(t('lpv.pipNo'))}}
/* notes: the inline box pauses the video and keeps the minute */
function lpvNoteStart(){const v=$('#lvV'),it=LIB.cur;if(!v||!it)return;LPV.wasPlaying=!v.paused;v.pause();LPV.noteAt=v.currentTime;LPV.noteOpen=true;LPV.tab='notes';lpvSide();const i=$('#lpvNoteIn');if(i){i.focus();if(MOB.matches)i.scrollIntoView({block:'center'})}}
function lpvNoteSave(){const i=$('#lpvNoteIn'),it=LIB.cur,v=$('#lvV');if(!i||!it)return;const tx=i.value.trim();LPV.noteOpen=false;if(tx){lpvAddNote(it.id,LPV.noteAt||0,tx);toast(t('lpv.noteSaved'))}lpvSide();lpvMarksPaint();if(LPV.wasPlaying&&v)v.play().catch(()=>{})}
function lpvMarksPaint(){const box=$('#libPlayer .lpvmarks'),v=$('#lvV'),it=LIB.cur;if(!box||!v||!it)return;const d=v.duration||0;
  box.innerHTML=d&&isFinite(d)?lpvMarks(it.id).filter(m=>m.s<=d).map(m=>`<i style="left:${m.s/d*100}%" title="${esc(m.ts+' · '+m.tx)}" data-ms="${m.s}"></i>`).join(''):'';
  box.querySelectorAll('[data-ms]').forEach(x=>x.onpointerdown=e=>{e.stopPropagation();v.currentTime=+x.dataset.ms})}
function lpvSide(){const ov=$('#libPlayer'),body=$('#lpvBody'),it=LIB.cur;if(!ov||!body||!it)return;const P=LIBS().prog,marks=lpvMarks(it.id),later=lpvLater();
  ov.querySelectorAll('.lpvtabs [data-tab]').forEach(b=>{const k=b.dataset.tab;b.classList.toggle('on',k===LPV.tab);b.setAttribute('aria-selected',k===LPV.tab);b.textContent=k==='les'?t('lpv.les',it.list.length):k==='notes'?t('lpv.notes',marks.length):t('lpv.laterT',later.length)});
  if(LPV.tab==='les'){let ch=null;body.innerHTML=`<div class="lpvles">${it.list.map((x,i)=>{const p0=P[x.id]||{},p=isFinite(p0.d)?p0:{...p0,d:0},pct=p.d?Math.min(100,p.p/p.d*100):0,h=x.ch!==ch?(ch=x.ch,x.ch?`<div class="lpvch" dir="auto">${esc(x.ch)}</div>`:''):'';
      return h+`<button class="lpvli ${x.id===it.id?'cur':''} ${p.done?'done':''}" data-go="${x.id}"><span class="lpvdot">${p.done?'✓':x.id===it.id?'▶':i+1}</span><span class="lpvlt"><b dir="auto">${esc(lrnName(x.id)||libTitle(x.n))}</b>${p.d?`<small>${fmtTC(p.d)}${!p.done&&pct>2?' · '+Math.round(pct)+'%':''}</small>`:''}</span>${lpvLaterHas(x.id)?'<em title="'+esc(t('lpv.inLater'))+'">🕒</em>':''}</button>`}).join('')}</div>`;
    const cur=body.querySelector('.lpvli.cur');if(cur&&!MOB.matches)cur.scrollIntoView({block:'nearest'})}
  else if(LPV.tab==='notes'){const n=lpvNoteOf(it.id);
    body.innerHTML=`<div class="lpvnotes">${LPV.noteOpen?`<div class="lpvnew"><span class="lpvts" dir="ltr">${fmtTC(LPV.noteAt||0)}</span><textarea class="in" id="lpvNoteIn" rows="2" dir="auto" placeholder="${esc(t('lpv.notePh'))}"></textarea><div class="lpvnb"><button class="btn sm ghost" id="lpvNoteX">${t('lt.cancel')}</button><button class="btn sm pri" id="lpvNoteOk">${t('ev.save')}</button></div></div>`
      :`<button class="lpvadd" id="lpvNoteNew">📝 ${t('lpv.noteAt')} <i dir="ltr">${fmtTC(($('#lvV')||{}).currentTime||0)}</i></button>`}
      ${marks.map(m=>`<div class="lpvn" data-s="${m.s}"><button class="lpvts" dir="ltr" data-seek="${m.s}">▶ ${m.ts}</button><span dir="auto">${esc(m.tx)}</span><button class="lpvnx" data-del="${esc(m.ts)}" data-tx="${esc(m.tx)}" aria-label="✕">✕</button></div>`).join('')||(LPV.noteOpen?'':`<p class="lpvempty">${t('lpv.noNotes')}</p>`)}
      ${n?`<button class="lpvopen" id="lpvOpenN">↗ ${t('lpv.openNote')}</button>`:''}</div>`;
    const nn=$('#lpvNoteNew');if(nn)nn.onclick=lpvNoteStart;const ok=$('#lpvNoteOk');if(ok){ok.onclick=lpvNoteSave;$('#lpvNoteX').onclick=()=>{LPV.noteOpen=false;lpvSide();const v=$('#lvV');if(LPV.wasPlaying&&v)v.play().catch(()=>{})};
      $('#lpvNoteIn').onkeydown=e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();lpvNoteSave()}else if(e.key==='Escape'){e.preventDefault();e.stopPropagation();$('#lpvNoteX').click()}}}
    body.querySelectorAll('[data-seek]').forEach(b=>b.onclick=()=>{const v=$('#lvV');if(v){v.currentTime=+b.dataset.seek;v.play().catch(()=>{})}});
    body.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{lpvDelMark(it.id,b.dataset.del,b.dataset.tx);lpvSide();lpvMarksPaint()});
    const on=$('#lpvOpenN');if(on)on.onclick=()=>{const nid=n.id;libClose();showView('notes');setTimeout(()=>openNote(nid),60)}}
  else{body.innerHTML=`<div class="lpvlater">${later.length?later.map(x=>{const f=libItem(x.id),nm=f?libTitle(f.n):x.n,cn=f?f.course.n:x.c,p=P[x.id]||{};return`<div class="lpvlr ${x.id===it.id?'cur':''}"><button class="lpvlrp" data-go="${x.id}"><b dir="auto">${esc(nm)}</b><small dir="auto">${esc(cn)}${p.d&&!p.done?' · '+Math.round(Math.min(100,p.p/p.d*100))+'%':''}</small></button><button class="lpvnx" data-lx="${x.id}" aria-label="✕">✕</button></div>`}).join(''):`<p class="lpvempty">${t('lpv.noLater')}</p>`}</div>`;
    body.querySelectorAll('[data-lx]').forEach(b=>b.onclick=()=>{lpvLaterDel(b.dataset.lx);lpvSide();const lb=$('#lpvLaterB');if(lb&&b.dataset.lx===it.id){lb.classList.remove('on');lb.innerHTML=`🕒 <span>${t('lpv.later')}</span>`}})}
  body.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>{const v=$('#lvV');if(b.dataset.go===it.id)return;if(v)libSave(v,true);libPlay(b.dataset.go)})}
{const _lp=libPlay;libPlay=function(id,...a){const r=_lp(id,...a);try{lpvBuild(id)}catch(e){console.error(e)}return r}}
{const _lc=libClose;libClose=function(){try{if(document.pictureInPictureElement)document.exitPictureInPicture().catch(()=>{})}catch(e){}const ov=$('#libPlayer');if(ov)ov.classList.remove('lpv','lpvpip','lpvidle','lpvpaused');LPV.noteOpen=false;clearTimeout(LPV.hideT);return _lc()}}
/* keys while the player is open (the old handler keeps Esc, space and the arrows); on window so it runs before the old capture handler on document */
window.addEventListener('keydown',e=>{const ov=$('#libPlayer');if(!ov||!ov.classList.contains('on')||!ov.classList.contains('lpv'))return;const v=$('#lvV');if(!v||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)||e.ctrlKey||e.metaKey||e.altKey)return;
  if(e.key==='Escape'&&ov.classList.contains('max')){e.preventDefault();e.stopImmediatePropagation();lpvFull();return}
  const k=e.key.toLowerCase(),C=c=>ov.querySelector(`[data-c="${c}"]`),act={k:()=>C('pp').click(),j:()=>C('b10').click(),l:()=>C('f10').click(),f:()=>lpvFull(),m:()=>C('mute').click(),n:()=>lpvNoteStart(),p:()=>C('pip')&&C('pip').click(),'[':()=>lpvSpeed(v.playbackRate-.25),']':()=>lpvSpeed(v.playbackRate+.25)}[k];
  if(act){e.preventDefault();e.stopPropagation();act();lpvWake()}else if(e.key==='ArrowUp'||e.key==='ArrowDown'){e.preventDefault();v.volume=Math.max(0,Math.min(1,v.volume+(e.key==='ArrowUp'?.1:-.1)));v.muted=false;lpvFlash(Math.round(v.volume*100)+'%')}},true);
document.addEventListener('click',e=>{const m=$('#lpvSpm');if(m&&!m.hidden&&!e.target.closest('#lpvSpm,[data-c="spd"]'))m.hidden=true});
/* «watch later» from the library: in each lesson's «⋯», and a row on the library home */
{const _im=lshItemMenu;lshItemMenu=function(anchor,ref,inF){const r=_im(anchor,ref,inF);try{const p=$('#ppPop');if(p&&ref&&ref.t==='m'){const h=lpvLaterHas(ref.id);p.insertAdjacentHTML('afterbegin',`<button data-lpl="1">${h?'✓ '+t('lpv.inLater'):'🕒 '+t('lpv.later')}</button>`);p.querySelector('[data-lpl]').onclick=()=>{closePP();const f=libItem(ref.id);lpvLaterToggle(ref.id,f?libTitle(f.n):'',f?f.course.n:'');renderLib()}}}catch(e){console.error(e)}return r}}
{const _t=lshTop;lshTop=function(){const h=_t(),L=lpvLater();if(!L.length)return h;const P=LIBS().prog;
  const row=`<div class="lshh"><h4 class="lbfh">🕒 ${t('lpv.laterH')}</h4></div><div class="lbcw lpvlaterrow">${L.map(x=>{const f=libItem(x.id),p=P[x.id]||{};return`<div class="lbcwi lpvlc" data-play="${x.id}" role="button" tabindex="0"><b dir="auto">${esc(f?libTitle(f.n):x.n)}</b><small dir="auto">${esc(f?f.course.n:x.c)}</small><span class="lbpb"><i style="width:${p.d?Math.min(100,p.p/p.d*100):0}%"></i></span><span class="lpvlcx" data-lrm="${x.id}" role="button" aria-label="✕">✕</span></div>`}).join('')}</div>`;
  const i=h.indexOf('<div class="lshh"><h4 class="lbfh">🗂');return i<0?row+h:h.slice(0,i)+row+h.slice(i)}}
{const _rl=renderLib;renderLib=function(){const r=_rl();try{$$('#v-lib [data-lrm]').forEach(x=>x.onclick=e=>{e.stopPropagation();lpvLaterDel(x.dataset.lrm);renderLib()})}catch(e){}return r}}
/* in Notes: a lesson's note shows its moments as buttons that open the player there */
{const _rne=renderNoteEd;renderNoteEd=function(...a){const r=_rne(...a);try{const n=NE;if(n&&n.lib){const hd=$('#noteBox .nehead');const ms=[];let m;LPV_RE.lastIndex=0;while((m=LPV_RE.exec(n.body||'')))ms.push({ts:m[1],s:lpvSec(m[1]),tx:m[2]});
    if(hd&&!$('#lpvStrip'))hd.insertAdjacentHTML('afterend',`<div class="lpvstrip" id="lpvStrip"><span>🎬 ${esc(n.libC||'')}</span>${ms.map(x=>`<button class="btn sm ghost" data-ls="${x.s}" title="${esc(x.tx)}">▶ <span dir="ltr">${x.ts}</span></button>`).join('')}<button class="btn sm" data-ls="-1">▶ ${t('lpv.openLesson')}</button></div>`);
    $$('#lpvStrip [data-ls]').forEach(b=>b.onclick=()=>lpvOpenAt(n.lib,+b.dataset.ls))}}catch(e){console.error(e)}return r}}
function lpvOpenAt(id,sec){if(!LIB.base){toast(t('lb.off'));return}$('#noteModal').classList.remove('on');showView('lib');libPlay(id);if(sec>=0){const v=$('#lvV');if(v)v.addEventListener('loadedmetadata',()=>{v.currentTime=sec},{once:true})}}
