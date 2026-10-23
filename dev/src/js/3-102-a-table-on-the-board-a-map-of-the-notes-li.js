/* ============ 3.102 a table on the board, a map of the notes' links, events over several days ============ */
/* 9th-24: board element {type:'table', x,y,w,h, cells:[[text]], fs, hd (first row is a heading)}; edited in a small grid window (double-click or the selection «⋯»);
   exports turn it into rectangles and text elements first, so PNG/SVG need no change */
function wbTblNew(){const c=wbViewCenter(),cells=[['','',''],['','',''],['','','']];wbAdd({id:uid(),type:'table',x:Math.round(c[0]-180),y:Math.round(c[1]-70),w:360,h:140,cells,fs:16,hd:1,color:'auto'});wbRender();setTimeout(()=>wbTblEdit(WB.sel.values().next().value),50)}
function wbTblHTML(e){const C=e.cells||[[]];return`<table class="wbtbl" style="font-size:${e.fs||16}px">${C.map((r,i)=>`<tr${i===0&&e.hd?' class="hd"':''}>${r.map(v=>`<td dir="auto">${esc(v||'')}</td>`).join('')}</tr>`).join('')}</table>`}
{const _h=wbNodeHTML;wbNodeHTML=function(e,...a){if(e&&e.type==='table')return wbTblHTML(e);return _h(e,...a)}}
{const _e=wbEdit;wbEdit=function(id,...a){const e=wbFind(id);if(e&&e.type==='table'){if(e.lock){toast(t('wb.isLocked'));return}wbTblEdit(id);return}return _e(id,...a)}}
function wbTblEdit(id){const e=wbFind(id);if(!e)return;const C=e.cells.map(r=>r.slice());
  const paint=()=>{const box=$('#wbtE');if(!box)return;box.innerHTML=`<div class="wbteg" style="grid-template-columns:repeat(${C[0].length},minmax(90px,1fr))">${C.map((r,i)=>r.map((v,j)=>`<input class="in${i===0&&e.hd?' hd':''}" dir="auto" data-r="${i}" data-c="${j}" value="${esc(v||'')}">`).join('')).join('')}</div>
    <div class="row wbtea"><button class="btn sm ghost" data-ta="r+">＋ ${esc(t('wbt.row'))}</button><button class="btn sm ghost" data-ta="r-" ${C.length<2?'disabled':''}>− ${esc(t('wbt.row'))}</button><button class="btn sm ghost" data-ta="c+">＋ ${esc(t('wbt.col'))}</button><button class="btn sm ghost" data-ta="c-" ${C[0].length<2?'disabled':''}>− ${esc(t('wbt.col'))}</button>
    <label class="chk"><input type="checkbox" id="wbtHd" ${e.hd?'checked':''}><span>${esc(t('wbt.hd'))}</span></label></div>
    <div class="row" style="justify-content:flex-end"><button class="btn sm pri" id="wbtOk">${esc(t('ev.save'))}</button></div>`;
    box.querySelectorAll('input[data-r]').forEach(x=>x.oninput=()=>{C[+x.dataset.r][+x.dataset.c]=x.value});
    box.querySelectorAll('[data-ta]').forEach(b=>b.onclick=()=>{const a=b.dataset.ta;if(a==='r+')C.push(C[0].map(()=>''));if(a==='r-'&&C.length>1)C.pop();if(a==='c+')C.forEach(r=>r.push(''));if(a==='c-'&&C[0].length>1)C.forEach(r=>r.pop());paint()});
    $('#wbtHd').onchange=x=>{e.hd=x.target.checked?1:0;paint()};
    $('#wbtOk').onclick=()=>{wbSnap();e.cells=C;const rows=C.length,fs=e.fs||16;e.h=Math.max(e.h,Math.round(rows*fs*2.1));save();wbRender();$$('.modal.on').forEach(m=>m.classList.remove('on'))}};
  openInfo(t('wbt.t'),`<div id="wbtE" class="wbte"></div>`);const b=$('#infoBox');if(b)b.classList.add('wbtbox');paint();setTimeout(()=>{const f=$('#wbtE input');if(f)f.focus()},60)}
{hookFn('openInfo',()=>openInfo,f=>{openInfo=f},'pre',function(){try{const b=$('#infoBox');if(b)b.classList.remove('wbtbox','ngrbox')}catch(e){}})}
/* exports: a table becomes cell rectangles + text elements of the same size */
function wbTblFlat(e){if(!e||e.type!=='table')return[e];const C=e.cells||[[]],R=C.length,K=C[0].length||1,cw=e.w/K,rh=e.h/R,fs=e.fs||16,out=[];
  out.push({id:e.id+'_b',type:'rect',x:e.x,y:e.y,w:e.w,h:e.h,sw:1.5,color:'auto',fo:0});
  for(let i=0;i<R;i++)for(let j=0;j<K;j++){const x=e.x+(document.documentElement.dir==='rtl'?(K-1-j):j)*cw,y=e.y+i*rh;
    out.push({id:e.id+'_c'+i+'_'+j,type:'rect',x,y,w:cw,h:rh,sw:1,color:'auto',fc:i===0&&e.hd?'accent':undefined,fo:i===0&&e.hd?.14:0});
    if(C[i][j])out.push({id:e.id+'_t'+i+'_'+j,type:'text',x:x+8,y:y+Math.max(4,(rh-fs*1.4)/2),w:cw-16,h:rh-8,fs,color:'auto',text:C[i][j],ta:'center'})}
  return out}
{const _f=wbExportPng;wbExportPng=function(els,...a){try{els=(els||wbExportSet()).flatMap(wbTblFlat)}catch(e){}return _f(els,...a)}}
{const _f=wbExportSvg;wbExportSvg=function(els,...a){try{els=(els||wbExportSet()).flatMap(wbTblFlat)}catch(e){}return _f(els,...a)}}
/* the «insert» menu */
{const _m=wbMenu;wbMenu=function(btn,items,...a){try{if(btn&&btn.id==='wbIns'&&!items.some(i=>i&&i.wbt))items=[...items,null,Object.assign(['▦ '+t('wbt.t'),wbTblNew],{wbt:1})]}catch(e){}return _m(btn,items,...a)}}

/* 9th-26: a map of the notes' [[links]]: notes are dots (size = links), lines are links; drag to move, wheel/pinch to zoom, tap a dot to open the note */
function ngrData(all){const N=NOTES().filter(n=>!n.arc&&!(n.lock&&!notesUnlocked())),byT=new Map();N.forEach(n=>{const k=String(n.title||'').trim().toLowerCase();if(k&&!byT.has(k))byT.set(k,n)});
  const E=[],seen=new Set(),deg=new Map();N.forEach(n=>{for(const m of String(n.body||'').matchAll(/\[\[([^\]|#]+)/g)){const o=byT.get(m[1].trim().toLowerCase());if(!o||o.id===n.id)continue;const k=[n.id,o.id].sort().join('|');if(seen.has(k))continue;seen.add(k);E.push([n.id,o.id]);deg.set(n.id,(deg.get(n.id)||0)+1);deg.set(o.id,(deg.get(o.id)||0)+1)}});
  const V=N.filter(n=>all||deg.get(n.id));return{V,E,deg}}
function ngrLayout(V,E){const P=new Map(),n=V.length||1,R=Math.max(160,Math.sqrt(n)*70);V.forEach((v,i)=>{const a=i*2.399963;P.set(v.id,{x:Math.cos(a)*R*Math.sqrt(i/n),y:Math.sin(a)*R*Math.sqrt(i/n),vx:0,vy:0})});
  const k=60;for(let it=0;it<260;it++){const T=1-it/260;const A=[...P.values()];for(let i=0;i<A.length;i++)for(let j=i+1;j<A.length;j++){const p=A[i],q=A[j];let dx=p.x-q.x,dy=p.y-q.y,d2=dx*dx+dy*dy||.01;if(d2>250000)continue;const f=k*k/d2;p.vx+=dx*f*.02;p.vy+=dy*f*.02;q.vx-=dx*f*.02;q.vy-=dy*f*.02}
    E.forEach(([a,b])=>{const p=P.get(a),q=P.get(b);if(!p||!q)return;const dx=q.x-p.x,dy=q.y-p.y,d=Math.sqrt(dx*dx+dy*dy)||1,f=(d-k)*.04;p.vx+=dx/d*f;p.vy+=dy/d*f;q.vx-=dx/d*f;q.vy-=dy/d*f});
    A.forEach(p=>{p.vx-=p.x*.004;p.vy-=p.y*.004;const s=Math.sqrt(p.vx*p.vx+p.vy*p.vy),m=12*T+1;if(s>m){p.vx*=m/s;p.vy*=m/s}p.x+=p.vx;p.y+=p.vy;p.vx*=.6;p.vy*=.6})}
  return P}
function ngrOpen(all){const {V,E,deg}=ngrData(all);if(!V.length&&!all){toast(t('ngr.none'));if(NOTES().length)return ngrOpen(true);return}
  const P=ngrLayout(V,E),F=NFOLD(),colOf=n=>{const f=n.fd&&F.find(x=>x.id===n.fd);return f&&f.col||'var(--accent)'};let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;P.forEach(p=>{x0=Math.min(x0,p.x);y0=Math.min(y0,p.y);x1=Math.max(x1,p.x);y1=Math.max(y1,p.y)});
  const pad=60,vb=[x0-pad,y0-pad,(x1-x0)+2*pad||300,(y1-y0)+2*pad||300],top=new Set([...deg.entries()].sort((a,b)=>b[1]-a[1]).slice(0,24).map(x=>x[0]));
  const svg=`<svg class="ngrsvg" id="ngrSvg" viewBox="${vb.join(' ')}" role="img" aria-label="${esc(t('ngr.t'))}">${E.map(([a,b])=>{const p=P.get(a),q=P.get(b);return`<line x1="${p.x.toFixed(1)}" y1="${p.y.toFixed(1)}" x2="${q.x.toFixed(1)}" y2="${q.y.toFixed(1)}"/>`}).join('')}
    ${V.map(n=>{const p=P.get(n.id),r=5+Math.min(10,(deg.get(n.id)||0)*1.6);return`<g class="ngrn" data-n="${n.id}" transform="translate(${p.x.toFixed(1)},${p.y.toFixed(1)})"><circle r="${r}" style="fill:${colOf(n)}"/><title>${esc(n.title||t('notes.untitled'))}</title>${top.has(n.id)||V.length<=30?`<text y="${r+13}" text-anchor="middle">${esc(String(n.title||'').slice(0,28))}</text>`:''}</g>`}).join('')}</svg>`;
  openInfo(t('ngr.t'),`<div class="ngrw"><div class="row ngrbar"><small class="muted">${esc(t('ngr.sub',V.length,E.length))}</small><span style="flex:1"></span><button class="btn sm ghost" id="ngrAll">${esc(t(all?'ngr.linked':'ngr.all'))}</button></div>${svg}</div>`);
  const box=$('#infoBox');if(box)box.classList.add('ngrbox');$('#ngrAll').onclick=()=>ngrOpen(!all);
  const s=$('#ngrSvg');let v=vb.slice(),drag=null,moved=0;const set=()=>s.setAttribute('viewBox',v.join(' '));
  s.addEventListener('wheel',e=>{e.preventDefault();const r=s.getBoundingClientRect(),fx=(e.clientX-r.left)/r.width,fy=(e.clientY-r.top)/r.height,z=e.deltaY>0?1.15:1/1.15,nw=v[2]*z,nh=v[3]*z;v=[v[0]+(v[2]-nw)*fx,v[1]+(v[3]-nh)*fy,nw,nh];set()},{passive:false});
  const pts=new Map();let pinch=null;
  s.addEventListener('pointerdown',e=>{pts.set(e.pointerId,[e.clientX,e.clientY]);s.setPointerCapture(e.pointerId);moved=0;if(pts.size===1)drag={x:e.clientX,y:e.clientY,v:v.slice()};else if(pts.size===2){const [a,b]=[...pts.values()];pinch={d:Math.hypot(a[0]-b[0],a[1]-b[1]),v:v.slice()};drag=null}});
  s.addEventListener('pointermove',e=>{if(!pts.has(e.pointerId))return;pts.set(e.pointerId,[e.clientX,e.clientY]);const r=s.getBoundingClientRect();
    if(pinch&&pts.size===2){const [a,b]=[...pts.values()],d=Math.hypot(a[0]-b[0],a[1]-b[1])||1,z=pinch.d/d,nw=pinch.v[2]*z,nh=pinch.v[3]*z;v=[pinch.v[0]+(pinch.v[2]-nw)/2,pinch.v[1]+(pinch.v[3]-nh)/2,nw,nh];set();moved=99;return}
    if(!drag)return;const dx=(e.clientX-drag.x)/r.width*drag.v[2],dy=(e.clientY-drag.y)/r.height*drag.v[3];moved=Math.max(moved,Math.abs(e.clientX-drag.x)+Math.abs(e.clientY-drag.y));v=[drag.v[0]-dx,drag.v[1]-dy,drag.v[2],drag.v[3]];set()});
  const up=e=>{pts.delete(e.pointerId);if(pts.size<2)pinch=null;if(!pts.size){const g=e.target.closest&&e.target.closest('.ngrn');if(g&&moved<6){$$('.modal.on').forEach(m=>m.classList.remove('on'));openNote(g.dataset.n)}drag=null}};
  s.addEventListener('pointerup',up);s.addEventListener('pointercancel',up)}
{hookFn('renderNotes',()=>renderNotes,f=>{renderNotes=f},'post',function(){try{const imp=$('#nObsIn');if(!imp||$('#nGrB'))return;imp.insertAdjacentHTML('beforebegin',`<button class="btn sm ghost" id="nGrB">🔗 ${esc(t('ngr.t'))}</button>`);$('#nGrB').onclick=()=>ngrOpen(false)}catch(e){}})}
{const _cc=cmdCommands;cmdCommands=function(...a){const L_=_cc(...a);try{L_.push({icon:'🔗',label:t('ngr.t'),run:()=>ngrOpen(false),kw:'graph links notes map خريطة روابط الملاحظات'})}catch(e){}return L_}}

/* 9th-28: an event may last several days: e.d2 = its last day (only for events that do not repeat) */
{const _o=evOccurs;evOccurs=function(e,k){if(e&&e.d2&&(!e.rep||e.rep==='none'))return k>=e.date&&k<=e.d2;return _o(e,k)}}
{const _w=evWhen;evWhen=function(e,...a){const s=_w(e,...a);try{if(e&&e.d2&&(!e.rep||e.rep==='none'))return s+' · '+t('evm.until',gShort(keyToDate(e.d2)))}catch(x){}return s}}
{hookFn('renderEvEd',()=>renderEvEd,f=>{renderEvEd=f},'post',function(){try{const d=$('#evD');if(!d||$('#evD2'))return;const lab=d.closest('label');
  lab.insertAdjacentHTML('afterend',`<label><span>${esc(t('evm.to'))}</span><input class="in" type="date" id="evD2" value="${EVE.d2||''}"></label>`);
  const d2=$('#evD2'),rep=$('#evRep'),chk=()=>{const one=!rep||rep.value==='none';d2.disabled=!one;if(!one)d2.value='';d2.min=d.value||''};d.addEventListener('change',chk);if(rep)rep.addEventListener('change',chk);chk();
  const sv=$('#evSave'),o=sv.onclick;sv.onclick=()=>{const id=EVE.id,v=d2.value;o&&o();const e=EVS().find(x=>x.id===id);if(!e)return;if(v&&v>e.date&&(!e.rep||e.rep==='none'))e.d2=v;else delete e.d2;save();evRefresh()}}catch(e){console.error(e)}})}

