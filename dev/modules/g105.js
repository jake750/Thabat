/* ============ v3.88.0: notes, board, PC — notes search ignores diacritics and hamza forms, tables in notes, a weekly yt-dlp update, board links to a frame, folded groups ============ */
/* fifth-list 18: notes search folds diacritics, alef/hamza forms, taa marbuta and alef maqsura (lshNorm) and also ؤ ئ ء */
function nsNorm(x){return lshNorm(x).replace(/ؤ/g,'و').replace(/ئ/g,'ي').replace(/ء/g,'')}

/* old 94: GitHub-style tables in notes («/» → table already inserts one; they were shown as raw lines). Table lines are swapped for placeholder lines
   before mdLite runs, so the line numbers its checkboxes rely on stay the same, then the placeholders become the table. */
const NTB_SEP=/^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/;
function ntbCells(l){let s=l.trim();if(s.startsWith('|'))s=s.slice(1);if(s.endsWith('|'))s=s.slice(0,-1);return s.split('|').map(c=>c.trim())}
function ntbHTML(rows,al){const td=(c,i,h)=>`<${h?'th':'td'}${al[i]?` style="text-align:${al[i]}"`:''}>${mdInline(esc(c))}</${h?'th':'td'}>`,n=Math.max(...rows.map(r=>r.length));
  const pad=r=>{const o=r.slice();while(o.length<n)o.push('');return o};
  return`<div class="ntblw"><table class="ntbl"><thead><tr>${pad(rows[0]).map((c,i)=>td(c,i,1)).join('')}</tr></thead><tbody>${rows.slice(1).map(r=>`<tr>${pad(r).map((c,i)=>td(c,i,0)).join('')}</tr>`).join('')}</tbody></table></div>`}
{const _m=mdLite;mdLite=function(src,...a){const L_=String(src||'').split('\n'),T=[];
  for(let i=0;i<L_.length-1;i++){if(!/^\s*\|.*\|/.test(L_[i])||!NTB_SEP.test(L_[i+1])||!L_[i+1].includes('-'))continue;let j=i+2;while(j<L_.length&&/^\s*\|/.test(L_[j]))j++;
    const al=ntbCells(L_[i+1]).map(c=>/^:-+:$/.test(c)?'center':/^-+:$/.test(c)?(document.documentElement.dir==='rtl'?'left':'right'):/^:-+$/.test(c)?(document.documentElement.dir==='rtl'?'right':'left'):'');
    const rows=[ntbCells(L_[i]),...L_.slice(i+2,j).map(ntbCells)];T.push(ntbHTML(rows,al));L_[i]='⟦NTB'+(T.length-1)+'⟧';for(let k=i+1;k<j;k++)L_[k]='⟦NTB-⟧';i=j-1}
  let h=_m(T.length?L_.join('\n'):src,...a);if(!T.length)return h;
  return h.replace(/<div>⟦NTB-⟧<\/div>/g,'').replace(/<div>⟦NTB(\d+)⟧<\/div>/g,(m,n)=>T[+n])}}
{const _p=mdPlain;mdPlain=function(b,...a){return _p(String(b||'').split('\n').filter(l=>!NTB_SEP.test(l)||!l.includes('-')).map(l=>/^\s*\|.*\|\s*$/.test(l)?ntbCells(l).filter(Boolean).join(' · '):l).join('\n'),...a)}}

/* fifth-list 19: yt-dlp updated once a week in the background, only on a PC where it already worked (the update route installs it otherwise) */
{const _f=window.fetch;window.fetch=function(u,...a){const p=_f.call(this,u,...a);try{const s=String(u);if(s.startsWith(HELPER)&&/\/yt(list|job)\?/.test(s))p.then(r=>{if(r&&r.ok){try{localStorage.setItem('thabat.ytdlpOk','1')}catch(e){}}}).catch(()=>{})}catch(e){}return p}}
function ytuDue(){try{if(ANDROID||MAC||localStorage.getItem('thabat.ytdlpOk')!=='1')return false;return Date.now()-(+localStorage.getItem('thabat.ytdlpAt')||0)>7*864e5}catch(e){return false}}
async function ytuRun(){if(!ytuDue())return;if((AUJ.job&&AUJ.job.running)||(typeof YTC!=='undefined'&&YTC.run))return;if(!await helperOk())return;
  try{localStorage.setItem('thabat.ytdlpAt',String(Date.now()))}catch(e){}try{await fetch(HELPER+'/ytsetup?update=1',{cache:'no-store'})}catch(e){}}
setTimeout(()=>ytuRun().catch(()=>{}),90000);setInterval(()=>ytuRun().catch(()=>{}),6*36e5);

/* old 101: a board element may link to a frame of the same board; in a presentation the link jumps to that frame */
function wbfFrames(){return wbEls().filter(e=>e.type==='frame')}
function wbfName(f){return(f&&String(f.title||'').trim())||t('wbf.frame')}
{const _d=wbLinkDlg;wbLinkDlg=function(...a){const r=_d(...a);try{const box=$('#ltBox'),fr=wbfFrames(),s=[...WB.sel];if(!box||!fr.length)return r;const hb=box.querySelector('.wblh');if(!hb)return r;
  hb.insertAdjacentHTML('beforebegin',`<b class="wblh">${esc(t('wbf.linkFrame'))}</b><div class="wbpick">${fr.filter(f=>!s.includes(f.id)).map((f,i)=>`<button class="suitem" data-wbf="${f.id}"><b>🖼 ${esc(wbfName(f))}</b></button>`).join('')}</div>`);
  box.querySelectorAll('[data-wbf]').forEach(b=>b.onclick=()=>{const els=s.map(wbFind).filter(Boolean);wbSnap();els.forEach(e=>{e.link={t:'frame',id:b.dataset.wbf}});save();closeLt();wbRefresh(els.map(e=>e.id));toast(t('wb.linkDone'))})}catch(e){console.error(e)}return r}}
{const _l=wbLinkLabel;wbLinkLabel=function(l,...a){if(l&&l.t==='frame')return'🖼 '+wbfName(wbFind(l.id));return _l(l,...a)}}
{const _f=wbFollow;wbFollow=function(e,...a){const l=e&&e.link;if(!l||l.t!=='frame')return _f(e,...a);const f=wbFind(l.id);if(!f){toast(t('wb.linkGone'));return}
  const P=WB.present;if(P){const i=P.list.indexOf(f.id);if(i>=0){wbPresGo(i);return}}
  const r=$('#bwrap').getBoundingClientRect(),v=wbView();if(!(r.width>40&&r.height>40&&f.w>0&&f.h>0))return;const z=Math.max(.05,Math.min(4,Math.min(r.width/f.w,r.height/f.h)*.9));v.z=z;v.x=(r.width-f.w*z)/2-f.x*z;v.y=(r.height-f.h*z)/2-f.y*z;
  const w=$('#bworld');w.classList.add('anim');clearTimeout(w._t);w._t=setTimeout(()=>w.classList.remove('anim'),700);wbApplyView();save()}}

/* old 102: a group can be folded: its members hide and a small chip stands in for it (click to unfold); board().gfold = {gid:1} */
function wbcFolds(){const b=board();return b.gfold||(b.gfold={})}
function wbcHidden(e){return!!(e&&e.gid&&(board().gfold||{})[e.gid])}
function wbcFold(g,on){wbSnap();const F=wbcFolds();if(on)F[g]=1;else delete F[g];save();if(on)wbSetSel([]);wbcPaint()}
function wbcPaint(){const w=$('#bworld');if(!w)return;w.querySelectorAll('.wbcchip').forEach(c=>c.remove());const F=board().gfold||{},by={};
  wbEls().forEach(e=>{const n=WB.nodes[e.id];const h=wbcHidden(e);if(n)n.classList.toggle('wbcoff',h);if(h)(by[e.gid]=by[e.gid]||[]).push(e)});
  Object.keys(by).forEach(g=>{if(!F[g])return;const els=by[g],q=wbBounds(els),lb=els.map(e=>String(e.title||e.text||'').trim()).find(Boolean)||t('wbc.group');
    const c=document.createElement('button');c.className='wbcchip';c.dataset.g=g;c.style.cssText=`left:${q.a}px;top:${q.b}px`;c.title=t('wbc.unfold');c.textContent=`▸ ${lb.slice(0,40)} (${els.length})`;
    c.addEventListener('pointerdown',ev=>ev.stopPropagation());c.addEventListener('click',ev=>{ev.stopPropagation();wbcFold(g,false)});w.append(c)})}
{const _s=wbSelMenu;wbSelMenu=function(btn,...a){const sel=[...WB.sel].map(wbFind).filter(Boolean),g=sel.length>1&&sel[0].gid&&sel.every(e=>e.gid===sel[0].gid)?sel[0].gid:null;if(!g)return _s(btn,...a);
  const _m=wbMenu;wbMenu=function(b,it,...r){wbMenu=_m;if(Array.isArray(it))it.unshift(['▸ '+t('wbc.fold'),()=>wbcFold(g,true)],null);return _m(b,it,...r)};try{return _s(btn,...a)}finally{wbMenu=_m}}}
/* folded members cannot be selected (so they cannot be moved or deleted by a marquee or Ctrl+A) */
{hookFn('wbSetSel',()=>wbSetSel,f=>{wbSetSel=f},'post',function(){try{let ch=false;for(const id of [...WB.sel]){if(wbcHidden(wbFind(id))){WB.sel.delete(id);ch=true;const n=WB.nodes[id];if(n)n.classList.remove('sel')}}if(ch)wbToolbar()}catch(e){}})}
{hookFn('wbRender',()=>wbRender,f=>{wbRender=f},'post',function(){try{wbcPaint()}catch(e){}})}
{hookFn('wbRefresh',()=>wbRefresh,f=>{wbRefresh=f},'post',function(){try{if(board().gfold&&Object.keys(board().gfold).length)wbcPaint()}catch(e){}})}
