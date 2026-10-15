/* ============ v3.72.0 the PC (fourth list, group I: 133–142 144 145) ============ */
const PC=()=>!MOB.matches&&!ANDROID;
/* 133. side panels change width by dragging their inner edge (details column, the player's list, the notes contents, the Quran note) */
const RSZ={tdc3W:[260,720],lpvW:[260,640],ntocW:[170,420],qnW:[300,760]};
function rszLoad(){try{const o=JSON.parse(localStorage.getItem('thabat.rsz')||'{}');for(const k in o)document.documentElement.style.setProperty('--'+k,o[k]+'px')}catch(e){}}
function rszSave(k,v){try{const o=JSON.parse(localStorage.getItem('thabat.rsz')||'{}');o[k]=v;localStorage.setItem('thabat.rsz',JSON.stringify(o))}catch(e){}}
function rszAttach(el,k){if(!PC()||!el||el.querySelector(':scope>.rszh'))return;const h=document.createElement('div');h.className='rszh';h.title=t('rsz.t');h.setAttribute('aria-hidden','true');el.append(h);
  h.onpointerdown=e=>{e.preventDefault();e.stopPropagation();const z=uiZoom()||1,r=el.getBoundingClientRect(),rtl=document.documentElement.dir==='rtl',[mn,mx]=RSZ[k];try{h.setPointerCapture(e.pointerId)}catch(x){}document.documentElement.classList.add('rszing');
    /* the handle sits on the panel's inner edge: in RTL panels on the left grow to the right */
    const startW=r.width/z,x0=e.clientX,side=(h.getBoundingClientRect().left-r.left)>r.width/2?1:-1;
    const mv=ev=>{const d=(ev.clientX-x0)/z*side;const w=Math.round(Math.max(mn,Math.min(mx,startW+d)));document.documentElement.style.setProperty('--'+k,w+'px')};
    const up=()=>{removeEventListener('pointermove',mv,true);removeEventListener('pointerup',up,true);removeEventListener('pointercancel',up,true);document.documentElement.classList.remove('rszing');const v=parseInt(getComputedStyle(document.documentElement).getPropertyValue('--'+k));if(v)rszSave(k,v);try{uxEvenCheck()}catch(x){}};
    addEventListener('pointermove',mv,true);addEventListener('pointerup',up,true);addEventListener('pointercancel',up,true)};
  h.ondblclick=()=>{document.documentElement.style.removeProperty('--'+k);rszSave(k,null)}}
function rszScan(){if(!PC())return;rszAttach($('#tdCol3'),'tdc3W');rszAttach($('.lpvside'),'lpvW');const toc=$('.netoc.side');if(toc)rszAttach(toc,'ntocW');rszAttach($('#qNoteSide'),'qnW')}
rszLoad();{let q=null;new MutationObserver(()=>{if(q)return;q=setTimeout(()=>{q=null;try{rszScan()}catch(e){}},300)}).observe(document.body,{childList:true,subtree:true})}

/* 134. the mushaf with a note beside it (PC) */
function qnOpen(){if(!PC())return;let p=$('#qNoteSide');if(p){qnClose();return}p=document.createElement('aside');p.id='qNoteSide';p.className='qnside';document.body.append(p);document.documentElement.classList.add('qnote');qnRender();rszScan()}
function qnClose(){const p=$('#qNoteSide');if(p){qnFlush();p.remove()}document.documentElement.classList.remove('qnote')}
const QN={id:localStorage.getItem('thabat.qnote')||null,t:null};
function qnRender(){const p=$('#qNoteSide');if(!p)return;const L_=NOTES().filter(n=>!n.lock&&!n.arc).sort((a,b)=>(b.updated||b.created||0)-(a.updated||a.created||0)).slice(0,25);if(QN.id&&!NOTES().some(n=>n.id===QN.id))QN.id=null;const n=QN.id&&NOTES().find(x=>x.id===QN.id);
  p.innerHTML=`<div class="qnh"><b>📝 ${t('qn.t')}</b><button class="btn sm ghost" id="qnX" aria-label="${esc(t('d.close'))}">✕</button></div><select class="in" id="qnSel"><option value="">${t('qn.pick')}</option><option value="+">＋ ${t('qn.new')}</option>${L_.map(x=>`<option value="${x.id}" ${x.id===QN.id?'selected':''}>${esc(x.title||t('qn.untitled'))}</option>`).join('')}</select>
   ${n?`<input class="in" id="qnTitle" dir="auto" value="${esc(n.title||'')}" placeholder="${esc(t('qn.titlePh'))}"><textarea class="in" id="qnBody" dir="auto" placeholder="${esc(t('qn.bodyPh'))}">${esc(n.body||'')}</textarea><div class="qnf"><small class="muted" id="qnSt"></small><button class="btn sm ghost" id="qnOpenFull">${t('qn.full')}</button></div>`:`<p class="muted">${t('qn.hint')}</p>`}`;
  $('#qnX').onclick=qnClose;$('#qnSel').onchange=e=>{qnFlush();const v=e.target.value;if(v==='+'){const nn={id:uid(),title:t('qn.newTitle',dayLabel(todayKey())),body:'',day:todayKey(),imgs:[],created:Date.now(),updated:Date.now()};S.notes=NOTES();S.notes.unshift(nn);save();QN.id=nn.id}else QN.id=v||null;localStorage.setItem('thabat.qnote',QN.id||'');qnRender()};
  if(n){const sv=()=>{clearTimeout(QN.t);$('#qnSt').textContent=t('qn.typing');QN.t=setTimeout(qnFlush,700)};$('#qnBody').oninput=sv;$('#qnTitle').oninput=sv;$('#qnOpenFull').onclick=()=>{qnFlush();openNote(n.id)}}}
function qnFlush(){clearTimeout(QN.t);const n=QN.id&&NOTES().find(x=>x.id===QN.id),b=$('#qnBody'),ti=$('#qnTitle');if(!n||!b)return;if(n.body!==b.value||n.title!==ti.value){n.body=b.value;n.title=ti.value;n.updated=Date.now();save();try{notesChanged()}catch(e){}}const st=$('#qnSt');if(st)st.textContent=t('svd.ok')+' ✓'}
{const _sv=showView;showView=function(v,...a){if(v!=='quran'&&$('#qNoteSide'))qnClose();return _sv(v,...a)}}
{hookFn('renderQuran',()=>renderQuran,f=>{renderQuran=f},'post',function(){try{if(!PC())return;const qb=$('#qbTop');if(!qb||qb.querySelector('#qnBtn'))return;const b=document.createElement('button');b.id='qnBtn';b.className='btn sm ghost qbtool';b.type='button';b.title=t('qn.btn');b.setAttribute('aria-label',t('qn.btn'));b.textContent='📝';b.onclick=qnOpen;const fs=$('#qFsBtn');fs?fs.before(b):qb.append(b)}catch(e){}})}

/* 135. hold Alt to see the shortcut of each button */
function altHints(on){document.documentElement.classList.toggle('althint',on);if(!on)return;const ord=typeof ORDER!=='undefined'?ORDER:[];
  $$('nav .navbtn[data-v]').forEach(b=>{const i=ord.indexOf(b.dataset.v);if(i>=0&&i<9)b.dataset.kh=String(i+1)});const m=[['#gsBtn','Ctrl+K'],['#helpBtn','?'],['#taskIn','N'],['#qFsBtn','F'],['#navMiniB','']];m.forEach(([s,k])=>{const e=$(s);if(e&&k)e.dataset.kh=k})}
addEventListener('keydown',e=>{if(e.key==='Alt'&&!e.repeat&&PC())altHints(true)});addEventListener('keyup',e=>{if(e.key==='Alt')altHints(false)});addEventListener('blur',()=>altHints(false));

/* 136. note reading width: narrow, normal, wide (the button in the note editor) */
function ntwApply(){const v=S.settings.noteW||'';document.documentElement.classList.toggle('ntw-n',v==='n');document.documentElement.classList.toggle('ntw-w',v==='w');const b=$('#ntwBtn');if(b)b.title=t('ntw.'+(v||'m'))}
{hookFn('openNote',()=>openNote,f=>{openNote=f},'post',function(){try{if(MOB.matches)return;const m=$('#nteMore');if(!m||$('#ntwBtn'))return;m.insertAdjacentHTML('beforebegin',`<button class="btn sm ghost" id="ntwBtn" type="button" aria-label="${esc(t('ntw.t'))}">↔</button>`);$('#ntwBtn').onclick=e=>{e.preventDefault();const v=S.settings.noteW||'';S.settings.noteW=v===''?'w':v==='w'?'n':'';save();ntwApply();toast(t('ntw.'+(S.settings.noteW||'m')))};ntwApply()}catch(e){}})}
ntwApply();

/* 137. the window's title bar takes the page colour (Chrome/Edge app windows read theme-color) */
function tcPaint(){let m=document.querySelector('meta[name="theme-color"]');if(!m){m=document.createElement('meta');m.name='theme-color';document.head.append(m)}const c=getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();if(c)m.content=barHex(c)}
{hookFn('applyTheme',()=>applyTheme,f=>{applyTheme=f},'post',function(){try{tcPaint()}catch(e){}})}setTimeout(tcPaint,300);

/* 138. a small month calendar as a Today card on wide PC screens */
function mcalRender(){const g=$('#v-today .grid');if(!g)return;const wide=PC()&&innerWidth/(uiZoom()||1)>=1450&&S.settings.miniCal!==false;let c=$('#miniCal');if(!wide){if(c)c.remove();return}
  if(!c){c=document.createElement('div');c.id='miniCal';c.className='card minical';const st=uxStacks()[1]||g.querySelector('.stack');if(!st)return;st.append(c);c.dataset.uxp=uxStacks().indexOf(st);c.dataset.uxi=999}
  const now=keyToDate(todayKey()),y=now.getFullYear(),mo=now.getMonth(),first=new Date(y,mo,1),days=new Date(y,mo+1,0).getDate(),wk=L().sdays||['S','M','T','W','T','F','S'];const off=first.getDay(),tk=todayKey();
  let cells='';for(let i=0;i<off;i++)cells+='<i></i>';for(let d=1;d<=days;d++){const k=dKey(new Date(y,mo,d)),D=S.days[k],ev=evsOn(k).length,p=D?Math.min(1,(totals(k).tot||0)/goalMs(k)):0;cells+=`<button type="button" class="mcd ${k===tk?'now':''} ${k<tk&&p>=1?'gold':''}" data-k="${k}" style="--p:${p.toFixed(2)}">${d}${ev?'<b></b>':''}</button>`}
  c.innerHTML=`<h3><span>${esc(gStr(first).replace(/^\d+\s*/,''))}</span></h3><div class="mcw">${wk.map(w=>`<span>${esc(String(w).slice(0,2))}</span>`).join('')}</div><div class="mcg">${cells}</div>`;
  c.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{showView('cal');setTimeout(()=>{try{renderDetail(b.dataset.k)}catch(e){}},120)})}
{hookFn('renderToday',()=>renderToday,f=>{renderToday=f},'post',function(){try{mcalRender()}catch(e){}})}
addEventListener('resize',()=>{clearTimeout(mcalRender.t);mcalRender.t=setTimeout(()=>{try{mcalRender()}catch(e){}},300)});

/* 139. a file dropped on any other page: choose where it goes (note, device book, board) */
async function dfBook(f){const _ce=document.createElement;let cap=null;document.createElement=function(tag,...a){const el=_ce.call(document,tag,...a);if(!cap&&String(tag).toLowerCase()==='input')cap=el;return el};try{showView('lib');bkAdd()}finally{document.createElement=_ce}if(cap){const dt=new DataTransfer();dt.items.add(f);cap.files=dt.files;if(cap.onchange)await cap.onchange();else cap.dispatchEvent(new Event('change'))}}
function dfNote(fs){thabatOpen('note');setTimeout(()=>{const inp=$('#neFile');if(!inp)return;const dt=new DataTransfer();fs.forEach(f=>dt.items.add(f));inp.files=dt.files;inp.dispatchEvent(new Event('change',{bubbles:true}))},250)}
document.addEventListener('dragover',e=>{if(!PC()||!e.dataTransfer||![...e.dataTransfer.types].includes('Files'))return;const v=curView();if(v==='today'||v==='lib'||$('#bwrap')&&$('#bwrap').offsetParent)return;e.preventDefault();document.documentElement.classList.add('dfany')});
document.addEventListener('dragleave',e=>{if(!e.relatedTarget)document.documentElement.classList.remove('dfany')});
document.addEventListener('drop',e=>{document.documentElement.classList.remove('dfany');if(!PC()||e.defaultPrevented)return;const fs=[...(e.dataTransfer&&e.dataTransfer.files||[])];if(!fs.length)return;const v=curView();if(v==='today'||v==='lib')return;e.preventDefault();
  const imgs=fs.filter(f=>/^image\//.test(f.type)),pdfs=fs.filter(f=>/\.pdf$/i.test(f.name)||f.type==='application/pdf');const z=uiZoom()||1;
  const p=qPopAt(`<div class="aymh">📥 ${esc(fs.length>1?t('dfa.n',fs.length):fs[0].name)}</div>${imgs.length?`<button data-k="note">📝 ${t('dfa.toNote')}</button>`:''}${imgs.length&&typeof wbAddImages==='function'?`<button data-k="board">🧩 ${t('dfa.toBoard')}</button>`:''}${pdfs.length?`<button data-k="book">📖 ${t('dfa.toBook')}</button>`:''}${!imgs.length&&!pdfs.length?`<div class="muted" style="padding:6px 10px">${t('dfa.none')}</div>`:''}`,e.clientX/z,e.clientY/z,'aymenu');
  p.querySelectorAll('[data-k]').forEach(b=>b.onclick=async()=>{closePP();const k=b.dataset.k;if(k==='note')dfNote(imgs);else if(k==='book'){for(const f of pdfs)await dfBook(f)}else if(k==='board'){showView('boards');try{nbMode='boards';renderBoardsView()}catch(x){}setTimeout(()=>{try{const w=$('#bwrap'),r=w.getBoundingClientRect();wbAddImages(imgs,wbToWorld(r.left+r.width/2,r.top+r.height/2))}catch(x){toast(t('dfa.boardFail'))}},400)}})});

/* 140. four columns on very wide screens (cards layout, ≥ 2400 px effective) */
function wide4Check(){const c3=$('#uxCol3');const on=!!c3&&PC()&&tdl()==='cards'&&innerWidth/(uiZoom()||1)>=2400;let c4=$('#uxCol4');document.documentElement.classList.toggle('wide4',on);
  if(!on){if(c4){[...c4.children].forEach(c=>c3?c3.append(c):null);c4.remove()}return}
  if(!c4){c4=document.createElement('div');c4.className='stack uxcol3';c4.id='uxCol4';c3.after(c4)}if(tmvSaved('cards'))return;
  const sm0=$('#summary')&&$('#summary').closest('.card');if(sm0&&sm0.parentElement!==c4)c4.append(sm0);
  const cols=[...uxStacks().slice(0,2),c3,c4],rest=cols.flatMap(s=>[...s.children]).filter(c=>c.classList.contains('card')&&!c.classList.contains('uxanchor')&&!c.classList.contains('hhide')&&c.id!=='summary'&&!(c.querySelector&&c.querySelector('#summary'))&&c.offsetParent),hs=new Map(rest.map(c=>[c,c.offsetHeight]));
  rest.forEach(c=>c.remove());const H=cols.map(s=>s.offsetHeight),gap=14;rest.sort((x,y)=>hs.get(y)-hs.get(x)).forEach(c=>{let i=0;H.forEach((h,j)=>{if(h<H[i])i=j});cols[i]===c4&&sm0?c4.insertBefore(c,sm0):cols[i].append(c);H[i]+=hs.get(c)+gap})}
{const _us=uxStacks;uxStacks=function(){return _us().filter(s=>s.id!=='uxCol4')}}
{hookFn('uxBalance',()=>uxBalance,f=>{uxBalance=f},'post',function(){try{wide4Check()}catch(e){}})}
{hookFn('uxWide',()=>uxWide,f=>{uxWide=f},'post',function(){try{const want=!!$('#uxCol3')&&PC()&&tdl()==='cards'&&innerWidth/(uiZoom()||1)>=2400;if(!!$('#uxCol4')!==want)uxRebalance()}catch(e){}})}
{hookFn('uxUnbalance',()=>uxUnbalance,f=>{uxUnbalance=f},'pre',function(){try{const c4=$('#uxCol4'),c3=$('#uxCol3');if(c4){[...c4.children].forEach(c=>c3&&c3.append(c));c4.remove()}document.documentElement.classList.remove('wide4')}catch(e){}})}
addEventListener('resize',()=>{clearTimeout(wide4Check.t);wide4Check.t=setTimeout(()=>{try{if(!!$('#uxCol4')!==(innerWidth/(uiZoom()||1)>=2400))uxRebalance()}catch(e){}},400)});
{const _tc=tmvCols;tmvCols=function(m){const r=_tc(m);if(r&&(m||tmvMode())==='cards'&&$('#uxCol4'))r.push($('#uxCol4'));return r}}

/* 141. one tooltip style everywhere instead of the browser's (after a short pause) */
{let tip=null,tm=null,cur=null;const hide=()=>{clearTimeout(tm);tm=null;cur=null;if(tip)tip.classList.remove('on')};
  document.addEventListener('mouseover',e=>{if(!PC()||S.settings.nativeTips)return;const el=e.target.closest&&e.target.closest('[title],[data-tt]');if(!el||el===cur)return;if(el.closest('svg')&&el.tagName.toLowerCase()!=='svg'&&!el.closest('button'))return;
    const tx=el.getAttribute('title');if(tx){el.dataset.tt=tx;el.removeAttribute('title');if(!el.getAttribute('aria-label')&&!el.textContent.trim())el.setAttribute('aria-label',tx)}const s=el.dataset.tt;if(!s)return;hide();cur=el;
    tm=setTimeout(()=>{if(cur!==el||!el.isConnected)return;if(!tip){tip=document.createElement('div');tip.className='ttip';tip.setAttribute('role','tooltip');document.body.append(tip)}tip.textContent=s;const z=uiZoom()||1,r=el.getBoundingClientRect();tip.classList.add('on');
      const w=tip.offsetWidth,h=tip.offsetHeight;let x=(r.left+r.width/2)/z-w/2,y=r.bottom/z+8;if(y+h>innerHeight/z-6)y=r.top/z-h-8;x=Math.max(6,Math.min(innerWidth/z-w-6,x));tip.style.left=x+'px';tip.style.top=y+'px'},450)},true);
  document.addEventListener('mouseout',e=>{if(cur&&(!e.relatedTarget||!cur.contains(e.relatedTarget)))hide()},true);['mousedown','keydown','wheel','scroll'].forEach(ev=>document.addEventListener(ev,hide,{capture:true,passive:true}))}

/* 142. the mouse wheel scrolls horizontal strips (chips, course rows) */
document.addEventListener('wheel',e=>{if(!PC()||e.ctrlKey||e.shiftKey||Math.abs(e.deltaX)>Math.abs(e.deltaY))return;let s=e.target;while(s&&s!==document.body){if(s.scrollWidth>s.clientWidth+4){const st=getComputedStyle(s);if(/(auto|scroll)/.test(st.overflowX)&&!/(auto|scroll)/.test(st.overflowY)&&s.scrollHeight<=s.clientHeight+4){const before=s.scrollLeft;s.scrollLeft+=e.deltaY*(document.documentElement.dir==='rtl'?-1:1);if(s.scrollLeft!==before){e.preventDefault()}return}}s=s.parentElement}},{passive:false});

/* 144. right-click on selected text: make it a task, add it to a note, copy */
document.addEventListener('contextmenu',e=>{if(!PC())return;const sel=String(getSelection&&getSelection()||'').trim();if(!sel||sel.length>1500)return;const tg=e.target;if(tg.closest('input,textarea,[contenteditable],#bwrap,.qimg'))return;e.preventDefault();const z=uiZoom()||1;
  const p=qPopAt(`<div class="aymh">${esc(sel.slice(0,40))}${sel.length>40?'…':''}</div><button data-a="task">☑ ${t('ctxm.task')}</button><button data-a="note">📝 ${t('ctxm.note')}</button><button data-a="copy">⧉ ${t('ctxm.copy')}</button>`,e.clientX/z,e.clientY/z,'aymenu');
  p.querySelector('[data-a="task"]').onclick=()=>{closePP();day(todayKey()).tasks.push({id:uid(),text:sel.replace(/\s+/g,' ').slice(0,300),done:false,created:Date.now()});save();try{renderTasks()}catch(x){}toast(t('ctxm.taskOk'))};
  p.querySelector('[data-a="copy"]').onclick=()=>{closePP();try{navigator.clipboard.writeText(sel)}catch(x){}toast(t('ctxm.copied'))};
  p.querySelector('[data-a="note"]').onclick=()=>{closePP();const L_=NOTES().filter(n=>!n.lock&&!n.arc).sort((a,b)=>(b.updated||b.created||0)-(a.updated||a.created||0)).slice(0,8);const p2=qPopAt(`<div class="aymh">📝 ${t('ctxm.which')}</div><button data-n="+">＋ ${t('qn.new')}</button>${L_.map(n=>`<button data-n="${n.id}">${esc(n.title||t('qn.untitled'))}</button>`).join('')}`,e.clientX/z,e.clientY/z,'aymenu');
    p2.querySelectorAll('[data-n]').forEach(b=>b.onclick=()=>{closePP();const q='> '+sel.replace(/\n/g,'\n> ');if(b.dataset.n==='+'){const nn={id:uid(),title:sel.slice(0,40),body:q,day:todayKey(),imgs:[],created:Date.now(),updated:Date.now()};S.notes=NOTES();S.notes.unshift(nn)}else{const n=NOTES().find(x=>x.id===b.dataset.n);if(!n)return;n.body=(n.body?n.body.replace(/\s*$/,'')+'\n\n':'')+q;n.updated=Date.now()}save();try{notesChanged()}catch(x){}toast(t('ctxm.noteOk'))})}},true);

