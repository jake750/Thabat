/* ============ v3.73.0 page interfaces (fourth list, group J: 147 149 151 154 155 156 159–163 165 166 167 169 170) ============ */
/* ---- Quran ---- */
/* 147. a thin bar above the mushaf: where you are inside the current juz' */
function qjBar(){const v=$('#v-quran');if(!v||typeof QJ==='undefined'||!QJ.length)return;const p=+S.quran.page||1,j=qJuzAt(p),a=QJ[j-1]||1,b=(QJ[j]||((typeof qPagesN==='function'&&qPagesN())||604)+1)-1,pc=Math.max(0,Math.min(1,(p-a+1)/(b-a+1)));
  let el=$('#qjBar');if(!el){el=document.createElement('div');el.id='qjBar';el.className='qjbar';el.innerHTML='<i><b></b></i><span></span>';}{const qb=$('#qbTop'),bar=qb&&qb.closest('.qbar');if(bar&&bar.nextElementSibling!==el)bar.after(el);else if(!bar&&!el.parentNode){const w=v.querySelector('.qwrap');if(!w)return;w.prepend(el)}}
  el.querySelector('i>b').style.width=(pc*100).toFixed(1)+'%';el.querySelector('span').textContent=t('qj.l',j,p-a+1,b-a+1);el.title=t('qj.t',j,Math.round(pc*100))}
{hookFn('renderQuran',()=>renderQuran,f=>{renderQuran=f},'post',function(){try{qjBar()}catch(e){}})}
setInterval(()=>{try{if(curView()==='quran'&&!document.hidden)qjBar()}catch(e){}},4000);
/* 149. while you read (not full screen), the tool bars step aside; a tap on the page brings them back */
{let y0=0,acc=0;const m=$('main');if(m)m.addEventListener('scroll',()=>{if(curView()!=='quran'||document.documentElement.classList.contains('qfs'))return;const y=m.scrollTop,dy=y-y0;y0=y;acc=(Math.sign(acc)===Math.sign(dy))?acc+dy:dy;
  if(acc>60&&y>120)document.documentElement.classList.add('qread');else if(acc<-40||y<80)document.documentElement.classList.remove('qread')},{passive:true});
  document.addEventListener('click',e=>{if(curView()!=='quran'||!document.documentElement.classList.contains('qread'))return;if(e.target.closest('#mushaf')&&!e.target.closest('button,a,[data-k],.aen'))document.documentElement.classList.remove('qread')},true);
  {const _sv=showView;showView=function(...a){document.documentElement.classList.remove('qread');return _sv(...a)}}}

/* ---- Calendar ---- */
/* 151. PC: the day panel stays in view, scrolls by itself and slides in when you pick a day; 154. a legend of what the colours mean */
{hookFn('renderDetail',()=>renderDetail,f=>{renderDetail=f},'post',function(k){try{const d=$('#detail');if(!d)return;if(!MOB.matches&&d.dataset.k!==k){d.classList.remove('dslide');void d.offsetWidth;d.classList.add('dslide')}d.dataset.k=k}catch(e){}})}
function cal4Legend(){const c=$('#cal');if(!c)return;let l=$('#calLeg');if(!l){l=document.createElement('div');l.id='calLeg';l.className='calleg';(c.parentElement===$('.calwrap')?c:c).after(l)}
  l.innerHTML=`<span><i class="lf"></i>${t('clg.fill')}</span><span><i class="lg"></i>${t('clg.gold')}</span><span><i class="lm"></i>${t('clg.msb')}</span><span><i class="lq"></i>${t('clg.q')}</span><span><i class="le"></i>${t('clg.ev')}</span><span><i class="lt"></i>${t('clg.today')}</span>`}
{hookFn('renderCal',()=>renderCal,f=>{renderCal=f},'post',function(){try{cal4Legend()}catch(e){}})}

/* ---- Notes ---- */
/* 155. type «/» at the start of a line in a note for a menu of blocks */
const SLASH=[['h1','# '],['h2','## '],['ul','- '],['todo','- [ ] '],['quote','> '],['table','| | |\n|---|---|\n| | |\n'],['hr','---\n'],['date',()=>gStr(new Date())+' · '+hStr(new Date())+' '],['bk',null]];
function slashOpen(ta){const v=ta.value,pos=ta.selectionStart,ls=v.lastIndexOf('\n',pos-1)+1;if(v.slice(ls,pos)!=='/')return;const xy=taCaret(ta,pos);const z=uiZoom()||1;
  const p=qPopAt(`<div class="aymh">${t('slc.t')}</div>${SLASH.filter(([k])=>k!=='bk'||typeof nteBkLink==='function').map(([k],i)=>`<button data-k="${k}" class="${i?'':'on'}">${t('slc.'+k)}</button>`).join('')}`,xy.x/z,xy.y/z+8,'aymenu slashm');
  const items=()=>[...p.querySelectorAll('[data-k]')];let i=0;const mark=()=>items().forEach((b,j)=>b.classList.toggle('on',j===i));
  const go=k=>{closePP();ta.removeEventListener('keydown',kd,true);const row=SLASH.find(x=>x[0]===k);ta.focus();ta.setSelectionRange(pos-1,pos);if(k==='bk'){document.execCommand('insertText',false,'');try{nteBkLink()}catch(e){}return}const ins=typeof row[1]==='function'?row[1]():row[1];document.execCommand('insertText',false,ins);ta.dispatchEvent(new Event('input',{bubbles:true}))};
  const kd=e=>{if(!$('#ppPop')){ta.removeEventListener('keydown',kd,true);return}if(e.key==='ArrowDown'){e.preventDefault();i=Math.min(items().length-1,i+1);mark()}else if(e.key==='ArrowUp'){e.preventDefault();i=Math.max(0,i-1);mark()}else if(e.key==='Enter'){e.preventDefault();go(items()[i].dataset.k)}else if(e.key==='Escape'||e.key===' '||e.key==='Backspace'){closePP();ta.removeEventListener('keydown',kd,true)}};
  ta.addEventListener('keydown',kd,true);items().forEach(b=>b.onmousedown=e=>{e.preventDefault();go(b.dataset.k)})}
/* caret position inside a textarea (mirror div) */
function taCaret(ta,pos){const cs=getComputedStyle(ta),d=document.createElement('div');['fontFamily','fontSize','fontWeight','lineHeight','letterSpacing','padding','border','boxSizing','whiteSpace','wordWrap','direction','textAlign'].forEach(k=>d.style[k]=cs[k]);d.style.position='fixed';d.style.visibility='hidden';d.style.whiteSpace='pre-wrap';d.style.width=ta.clientWidth+'px';d.style.top='0';d.style.left='-9999px';
  d.textContent=ta.value.slice(0,pos);const s=document.createElement('span');s.textContent='​';d.append(s);document.body.append(d);const r=ta.getBoundingClientRect(),z=uiZoom()||1;const y=r.top+(s.offsetTop-ta.scrollTop+parseFloat(cs.lineHeight||'20'))*z,x=r.left+Math.min(ta.clientWidth,s.offsetLeft)*z;d.remove();return{x,y}}
document.addEventListener('input',e=>{const ta=e.target;if(ta.id!=='neBody'||e.inputType!=='insertText'||e.data!=='/')return;setTimeout(()=>slashOpen(ta),0)},true);
/* 156. select text in a note: a small floating bar for bold, italic, highlight, heading, quote, link */
const FMT=[['b','**','**','B'],['i','_','_','I'],['hl','==','==','ab'],['h','## ','','H'],['q','> ','','❝'],['ln','[','](https://)','🔗']];
function fmtBar(ta){let bar=$('#fmtBar');const a=ta.selectionStart,b=ta.selectionEnd;if(b-a<1||document.activeElement!==ta){if(bar)bar.remove();return}
  if(!bar){bar=document.createElement('div');bar.id='fmtBar';bar.className='fmtbar';bar.innerHTML=FMT.map(([k,,,l])=>`<button type="button" data-f="${k}" title="${esc(t('fm.'+k))}">${l}</button>`).join('');document.body.append(bar);
    bar.querySelectorAll('[data-f]').forEach(x=>x.onmousedown=e=>{e.preventDefault();const f=FMT.find(q=>q[0]===x.dataset.f),ta2=$('#neBody'),s=ta2.selectionStart,en=ta2.selectionEnd,sel=ta2.value.slice(s,en);let out;if(f[0]==='h'||f[0]==='q'){out=sel.split('\n').map(l=>f[1]+l).join('\n')}else out=f[1]+sel+f[2];ta2.focus();ta2.setSelectionRange(s,en);document.execCommand('insertText',false,out);ta2.dispatchEvent(new Event('input',{bubbles:true}));bar.remove()})}
  const xy=taCaret(ta,a),z=uiZoom()||1;bar.style.left=Math.max(8,xy.x/z-60)+'px';bar.style.top=Math.max(8,xy.y/z-(parseFloat(getComputedStyle(ta).lineHeight)||22)-46)+'px'}
['mouseup','keyup','select'].forEach(ev=>document.addEventListener(ev,e=>{if(e.target&&e.target.id==='neBody')setTimeout(()=>fmtBar(e.target),10)},true));
document.addEventListener('mousedown',e=>{if(!e.target.closest||(!e.target.closest('#fmtBar')&&e.target.id!=='neBody')){const b=$('#fmtBar');if(b)b.remove()}},true);
/* 159. a cover picture at the top of a note */
function ncvPaint(){const nb=$('#noteModal.on .notebox')||$('#noteModal.on .box');if(!nb||typeof NE==='undefined'||!NE)return;let h=nb.querySelector('#nteCov');
  if(!NE.cov){if(h)h.remove();}else{if(!h){h=document.createElement('div');h.id='nteCov';h.className='ntecov';const g=nb.querySelector('.uxgrab');(g||nb.firstChild)&&(g?g.after(h):nb.prepend(h))}idbGet('nimg:'+NE.cov).then(u=>{if(u&&h.isConnected)h.style.backgroundImage=`url("${u}")`}).catch(()=>{})}
  const m=$('#nteMore');if(m&&!$('#nteCovB')){m.insertAdjacentHTML('beforebegin',`<button class="btn sm ghost" id="nteCovB" type="button" title="${esc(t('ncv.t'))}" aria-label="${esc(t('ncv.t'))}">🖼</button>`);$('#nteCovB').onclick=e=>{e.preventDefault();ncvMenu(e.currentTarget)}}}
function ncvMenu(btn){const r=btn.getBoundingClientRect(),z=uiZoom()||1;const p=qPopAt(`<div class="aymh">🖼 ${t('ncv.t')}</div><button data-a="pick">${t('ncv.pick')}</button>${(NE.imgs||[]).length?`<button data-a="first">${t('ncv.first')}</button>`:''}${NE.cov?`<button data-a="rm">${t('ncv.rm')}</button>`:''}`,r.left/z+r.width/z/2,r.bottom/z,'aymenu');
  p.querySelectorAll('[data-a]').forEach(b=>b.onclick=async()=>{closePP();const a=b.dataset.a;if(a==='rm'){delete NE.cov;ncvPaint();return}if(a==='first'){NE.cov=NE.imgs[0];ncvPaint();return}
    const i=document.createElement('input');i.type='file';i.accept='image/*';i.onchange=async()=>{const f=i.files[0];if(!f)return;try{const u=await shrinkImage(f,1400,.8);const id='cov'+uid();await idbSet('nimg:'+id,u);NE.cov=id;(NE._added=NE._added||[]);ncvPaint()}catch(e){toast(t('ncv.fail'))}};document.body.append(i);i.click();setTimeout(()=>i.remove(),60000)})}
{hookFn('openNote',()=>openNote,f=>{openNote=f},'post',function(){try{ncvPaint()}catch(e){}})}
/* the card in the notes grid uses the cover when there is one */
{hookFn('renderNotes',()=>renderNotes,f=>{renderNotes=f},'post',function(){try{$$('.ncard[data-note]').forEach(c=>{const n=NOTES().find(x=>x.id===c.dataset.note);if(!n||!n.cov||c.dataset.cov)return;c.dataset.cov='1';idbGet('nimg:'+n.cov).then(u=>{if(!u)return;let im=c.querySelector('img');if(im)im.src=u;else c.insertAdjacentHTML('afterbegin',`<img class="ncov" src="${u}" alt="">`)}).catch(()=>{})})}catch(e){}})}

/* ---- Library ---- */
/* 160. card size in the library: small, medium, large */
function ldensApply(){const v=S.lib&&S.lib.dens||'';const h=document.documentElement;h.classList.toggle('ld-s',v==='s');h.classList.toggle('ld-l',v==='l')}
{hookFn('renderLib',()=>renderLib,f=>{renderLib=f},'post',function(){try{const p=$('#lpath');if(!p||p.querySelector('#ldensB'))return;p.insertAdjacentHTML('beforeend',`<span class="seg ldens" id="ldensB" title="${esc(t('ldn.t'))}">${['s','','l'].map(k=>`<button type="button" data-d="${k}" class="${((S.lib&&S.lib.dens)||'')===k?'on':''}" aria-label="${esc(t('ldn.'+(k||'m')))}">${k==='s'?'▪':k==='l'?'■':'◼'}</button>`).join('')}</span>`);
  p.querySelectorAll('#ldensB [data-d]').forEach(b=>b.onclick=()=>{S.lib=S.lib||{};S.lib.dens=b.dataset.d;try{libSave()}catch(e){save()}ldensApply();p.querySelectorAll('#ldensB [data-d]').forEach(x=>x.classList.toggle('on',x===b))})}catch(e){}})}
ldensApply();
/* 162. PC: hovering a lesson for a moment plays a few silent seconds of it */
{let tm=null,cur=null,box=null;const stop=()=>{clearTimeout(tm);tm=null;cur=null;if(box){const v=box.querySelector('video');if(v){v.pause();v.removeAttribute('src');v.load()}box.remove();box=null}};
  document.addEventListener('mouseover',e=>{if(MOB.matches||ANDROID)return;const el=e.target.closest&&e.target.closest('#v-lib [data-play]');if(!el||el===cur)return;stop();cur=el;const id=el.dataset.play;if(!id||/^(au|bk):/.test(id))return;
    tm=setTimeout(()=>{if(cur!==el||!el.isConnected||typeof libU!=='function')return;const r=el.getBoundingClientRect(),z=uiZoom()||1;box=document.createElement('div');box.className='lprev';box.innerHTML=`<video muted playsinline preload="metadata"></video>`;document.body.append(box);const v=box.querySelector('video');
      let x=(r.left+r.width/2)/z-120,y=r.top/z-150;if(y<8)y=r.bottom/z+8;box.style.left=Math.max(8,Math.min(innerWidth/z-248,x))+'px';box.style.top=y+'px';
      v.src=libU('/f?id='+id);v.addEventListener('loadedmetadata',()=>{try{v.currentTime=Math.min(v.duration*0.2,90);v.play().catch(()=>{});setTimeout(()=>{if(box&&box.contains(v))v.currentTime=Math.min(v.duration*0.5,240)},5000)}catch(x){}},{once:true});v.onerror=stop},700)},true);
  document.addEventListener('mouseout',e=>{if(cur&&(!e.relatedTarget||!cur.contains(e.relatedTarget)))stop()},true);document.addEventListener('mousedown',stop,true)}

/* ---- Summary ---- */
/* 163. exact numbers on any bar of the daily chart (hover on the PC, tap on the phone) */
function brColsTips(){const cols=$$('#bPlot .col[data-i]');if(!cols.length)return;const keys=periodKeys(bMode,bAnchor);cols.forEach(c=>{const k=keys[+c.dataset.i];if(!k)return;const {tot,by}=totals(k),top=rollBy(by);const parts=topCats().filter(x=>(top[x.id]||0)>=6e4).map(x=>kidName(x)+' '+fmtHM(top[x.id]));c.title=dayLabel(k)+' · '+fmtHM(tot)+(parts.length?'\n'+parts.join(' · '):'')});}
document.addEventListener('click',e=>{if(!MOB.matches)return;const c=e.target.closest&&e.target.closest('#bPlot .col[data-i]');if(!c)return;const s=c.title||c.dataset.tt;if(s)toast(s.replace('\n',' — '))},true);
/* 165. the daily chart as bars, a line or a pie of categories */
function brChartPaint(){const card=$('#bPlot')&&$('#bPlot').closest('.card');if(!card)return;const kind=S.settings.brChart||'bar',h3=card.querySelector('h3');
  if(h3&&!h3.querySelector('#brKind')){h3.insertAdjacentHTML('beforeend',`<span class="seg brkind" id="brKind">${[['bar','▮'],['line','⟋'],['pie','◔']].map(([k,l])=>`<button type="button" data-k="${k}" title="${esc(t('bk3.'+k))}">${l}</button>`).join('')}</span>`);h3.querySelectorAll('#brKind [data-k]').forEach(b=>b.onclick=()=>{S.settings.brChart=b.dataset.k;save();brChartPaint()})}
  card.querySelectorAll('#brKind [data-k]').forEach(b=>b.classList.toggle('on',b.dataset.k===kind));card.classList.toggle('brk-line',kind==='line');card.classList.toggle('brk-pie',kind==='pie');
  card.querySelectorAll('.brline,.brpie').forEach(x=>x.remove());const keys=periodKeys(bMode,bAnchor);
  if(kind==='line'){const plot=$('#bPlot');const max=parseFloat(($('#bY span:last-child')||{}).textContent)||10;const vals=keys.map(k=>totals(k).tot/36e5),n=vals.length,W=100,H=100;const pts=vals.map((v,i)=>[(i+.5)/n*W,H-Math.min(1,v/max)*H]);
    const rtl=document.documentElement.dir==='rtl';const P=pts.map(([x,y])=>[rtl?W-x:x,y]);plot.insertAdjacentHTML('beforeend',`<svg class="brline" viewBox="0 0 100 100" preserveAspectRatio="none"><polyline points="${P.map(p=>p.join(',')).join(' ')}" fill="none" stroke="var(--accent)" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linejoin="round"/>${P.map(([x,y],i)=>`<circle cx="${x}" cy="${y}" r="1.6" fill="var(--accent)"><title>${esc(dayLabel(keys[i]))} · ${fmtHM(vals[i]*36e5)}</title></circle>`).join('')}</svg>`)}
  if(kind==='pie'){const by={};keys.forEach(k=>{const r=rollBy(totals(k).by);for(const id in r)by[id]=(by[id]||0)+r[id]});const cats=topCats().map(c=>({c,v:by[c.id]||0})).filter(o=>o.v>0).sort((a,b)=>b.v-a.v),tot=cats.reduce((s,o)=>s+o.v,0)||1;let a0=0;
    const arc=(a,b)=>{const p=(x)=>[50+40*Math.cos(2*Math.PI*x-Math.PI/2),50+40*Math.sin(2*Math.PI*x-Math.PI/2)];const [x1,y1]=p(a),[x2,y2]=p(b);return`M50 50 L${x1} ${y1} A40 40 0 ${b-a>.5?1:0} 1 ${x2} ${y2}Z`};
    const svg=cats.map(o=>{const a=a0,b=a0+o.v/tot;a0=b;return`<path d="${arc(a,Math.min(b,a+.9999))}" fill="${o.c.color}"><title>${esc(kidName(o.c))} · ${fmtHM(o.v)}</title></path>`}).join('');
    card.querySelector('.chart').insertAdjacentHTML('afterend',`<div class="brpie"><svg viewBox="0 0 100 100">${svg}<circle cx="50" cy="50" r="22" fill="var(--panel)"/></svg><div class="brpl">${cats.map(o=>`<span><i style="background:${o.c.color}"></i>${esc(kidName(o.c))}<b>${fmtHM(o.v)}</b><small>${Math.round(o.v/tot*100)}%</small></span>`).join('')||`<span class="muted">${t('tda.wallNone')}</span>`}</div></div>`)}}
/* 167. ▲▼ against the previous period beside the other numbers */
function brCmp(){const tiles=$$('#bTiles .tile');if(tiles.length<4)return;const keys=periodKeys(bMode,bAnchor),prevA=bMode==='week'?addDays(bAnchor,-7):brPrevAnchor(bAnchor),st=periodStats(keys),pv=periodStats(periodKeys(bMode,prevA));
  const add=(tile,a,b,fmt)=>{if(!tile||tile.querySelector('.cmpd')||!(b>0))return;const pc=Math.round((a-b)/b*100);if(!isFinite(pc))return;tile.querySelector('.v').insertAdjacentHTML('beforeend',`<span class="cmpd ${pc>=0?'up':'dn'}" title="${esc(t('cmv.prev',fmt(b)))}">${pc>=0?'▲':'▼'}${Math.abs(pc)}%</span>`)};
  const avg=s=>s.elapsed?s.tot/s.elapsed:0;add(tiles[1],avg(st),avg(pv),v=>fmtHM(v));add(tiles[2],st.goalDays,pv.goalDays,v=>fnum(v));add(tiles[3],st.gold,pv.gold,v=>String(v));const tt=[...tiles].find(x=>x.querySelector('.k')&&x.querySelector('.k').textContent===t('brief.tasks'));if(tt)add(tt,st.tasksDone,pv.tasksDone,v=>String(v))}
/* 166. «the week as a story»: the week's numbers as slides you swipe or tap through */
function storyOpen(){const keys=periodKeys('week',bMode==='week'?bAnchor:keyToDate(todayKey())).filter(k=>k<=todayKey()),pv=periodKeys('week',addDays(keyToDate(keys[0]),-7)),st=periodStats(keys),sp=periodStats(pv);
  const top=rollBy(st.by),cats=topCats().map(c=>({c,v:top[c.id]||0})).filter(o=>o.v>0).sort((a,b)=>b.v-a.v);let best=null;keys.forEach(k=>{const v=totals(k).tot;if(!best||v>best.v)best={k,v}});
  let on=0,due=0;keys.forEach(k=>PDL_P.forEach(p=>{const s=plStatus(k,p);if(s){due++;if(s==='on')on++}}));const pages=keys.reduce((s,k)=>s+(((S.days[k]||{}).quran||{}).pgs||[]).length,0);
  const pc=sp.tot?Math.round((st.tot-sp.tot)/sp.tot*100):null;
  const SL=[[ '⏱',t('sty.focus'),fmtHM(st.tot),pc==null?'':t('sty.vs',(pc>=0?'▲ ':'▼ ')+Math.abs(pc)+'%')],
    best&&best.v?['🏅',t('sty.best'),esc(dayLabel(best.k)),fmtHM(best.v)]:null,
    cats[0]?['🎯',t('sty.top'),esc(kidName(cats[0].c)),t('sty.share',Math.round(cats[0].v/(st.tot||1)*100))]:null,
    due?['🕌',t('sty.pray'),on+' / '+due,t('sty.prayS')]:null,
    pages?['📖',t('sty.q'),String(pages),t('sty.qS')]:null,
    ['☑',t('sty.tasks'),String(st.tasksDone),t('brief.tasksSub',st.tasksAll)],
    ['✦',t('sty.gold'),String(st.gold),t('brief.bestRun',st.bestRun)]].filter(Boolean);
  let i=0,tm=null;const ov=document.createElement('div');ov.className='story';ov.innerHTML=`<div class="stybars">${SL.map(()=>'<i><b></b></i>').join('')}</div><button class="styx" aria-label="${esc(t('d.close'))}">✕</button><div class="styc"></div><div class="styhit l"></div><div class="styhit r"></div>`;document.body.append(ov);
  const show=()=>{const s=SL[i];ov.querySelector('.styc').innerHTML=`<div class="styi">${s[0]}</div><div class="styk">${s[1]}</div><div class="styv">${s[2]}</div><div class="stys">${s[3]||''}</div>`;ov.querySelectorAll('.stybars i').forEach((b,j)=>{b.classList.toggle('done',j<i);b.classList.toggle('now',j===i)});const bb=ov.querySelectorAll('.stybars i')[i].querySelector('b');bb.style.animation='none';void bb.offsetWidth;bb.style.animation='';clearTimeout(tm);tm=setTimeout(()=>step(1),5000)};
  const close=()=>{clearTimeout(tm);ov.remove();removeEventListener('keydown',kd,true)};const step=d=>{i+=d;if(i>=SL.length){close();return}if(i<0)i=0;show()};const rtl=document.documentElement.dir==='rtl';
  const kd=e=>{if(e.key==='Escape')close();else if(e.key==='ArrowLeft')step(rtl?1:-1);else if(e.key==='ArrowRight')step(rtl?-1:1)};addEventListener('keydown',kd,true);
  ov.querySelector('.styx').onclick=close;ov.querySelector('.styhit.l').onclick=()=>step(rtl?1:-1);ov.querySelector('.styhit.r').onclick=()=>step(rtl?-1:1);let sx=null;ov.addEventListener('touchstart',e=>{sx=e.touches[0].clientX},{passive:true});ov.addEventListener('touchend',e=>{if(sx==null)return;const dx=e.changedTouches[0].clientX-sx;if(Math.abs(dx)>50)step((dx<0)!==rtl?1:-1);sx=null},{passive:true});show()}
{hookFn('renderBrief',()=>renderBrief,f=>{renderBrief=f},'post',function(){try{brColsTips();brChartPaint();brCmp();const h=$('#bTtl');const row=h&&h.parentElement;if(row&&!$('#styBtn')){const b=document.createElement('button');b.id='styBtn';b.type='button';b.className='btn sm ghost';b.textContent='📖 '+t('sty.btn');b.onclick=storyOpen;row.append(b)}}catch(e){console.error(e)}})}

/* ---- Timer and board ---- */
/* 169. the timer takes the colour of the running category */
function tcolPaint(){const card=$('#tDisp')&&$('#tDisp').closest('.card');if(!card||!S.timer)return;const c=typeof catOf==='function'?catOf(S.timer.cat):null,col=c&&c.color;if(col)card.style.setProperty('--tcol',col);card.classList.toggle('trun',S.timer.mode==='work'||!!S.timer.start)}
setInterval(()=>{try{if(curView()==='today'&&!document.hidden)tcolPaint()}catch(e){}},1500);document.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('#catChips,#v-today'))setTimeout(()=>{try{tcolPaint()}catch(x){}},60)},true);
/* 170. PC: the selection's properties dock at the side of the board instead of floating at the bottom */
{hookFn('wbToolbar',()=>wbToolbar,f=>{wbToolbar=f},'post',function(){try{const w=$('#bwrap'),tb=$('#btbar');if(!w||!tb)return;const old=w.querySelector(':scope>.wbdock');if(old)old.remove();if(MOB.matches||innerWidth/(uiZoom()||1)<1100)return;const s=tb.querySelector('.wbs');if(!s||!s.children.length)return;
  const d=document.createElement('div');d.className='wbdock';d.innerHTML=`<div class="wbdh">${t('wbd.t')}</div>`;d.append(s);['pointerdown','mousedown','click','wheel'].forEach(ev=>d.addEventListener(ev,e=>e.stopPropagation()));w.append(d)}catch(e){}})}
