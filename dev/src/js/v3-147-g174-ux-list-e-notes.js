/* ============ v3.147 g174: UX list E — notes ============ */
const UX5={};
/* 61. a note without a title takes its first line */
function ux5FirstLine(body){const l=String(body||'').split('\n').map(x=>x.trim()).find(x=>x&&!/^(-{3,}|```|\|)/.test(x));if(!l)return'';let s=mdPlain(l).replace(/^[#>\s\-*•☐☑\[\]xX0-9.)]+/,'').trim();if(s.length>60)s=s.slice(0,58).replace(/\s+\S*$/,'')+'…';return s}
{hookFn('closeNote',()=>closeNote,f=>{closeNote=f},'pre',function(saveIt){try{if(!saveIt||!NE)return;const a=$('#neTitle'),b=$('#neBody');if(a&&!a.value.trim()&&b&&b.value.trim()){const s=ux5FirstLine(b.value);if(s)a.value=s}}catch(e){console.error(e)}})}
function ux5TitlePh(){const a=$('#neTitle'),b=$('#neBody');if(!a||!b)return;if(!a.dataset.ph0)a.dataset.ph0=a.placeholder;const s=!a.value.trim()&&ux5FirstLine(b.value);a.placeholder=s||a.dataset.ph0;a.classList.toggle('ux5auto',!!s)}
document.addEventListener('input',e=>{if(e.target&&(e.target.id==='neBody'||e.target.id==='neTitle'))ux5TitlePh()},true);

/* 62. a new note in a folder takes the folder's colour and the tag most of its notes share */
function ux5NearBg(c){const cv=document.createElement('canvas').getContext('2d');const rgb=x=>{cv.fillStyle='#000';cv.fillStyle=x;const h=cv.fillStyle;if(h[0]!=='#')return null;return[1,3,5].map(i=>parseInt(h.slice(i,i+2),16))};const a=rgb(c);if(!a)return null;
  const hue=([r,g,b])=>{const mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn;if(!d)return -1;let h=mx===r?((g-b)/d)%6:mx===g?(b-r)/d+2:(r-g)/d+4;return(h*60+360)%360};const ha=hue(a);let best=null,bd=1e9;
  NBG.filter(Boolean).forEach(x=>{const hb=hue(rgb(x));const d=ha<0||hb<0?(ha===hb?0:400):Math.min(Math.abs(ha-hb),360-Math.abs(ha-hb));if(d<bd){bd=d;best=x}});return best}
function ux5FolderTag(fid){const ns=NOTES().filter(n=>!n.arc&&n.fd===fid);if(ns.length<2)return null;const c={};ns.forEach(n=>new Set(noteTags(n)).forEach(t=>c[t]=(c[t]||0)+1));let best=null,bn=0;for(const k in c)if(c[k]>bn){bn=c[k];best=k}return bn*2>ns.length?best:null}
{hookFn('openNote',()=>openNote,f=>{openNote=f},'post',function(){try{if(!NE||!NE._new||!NE.fd||NE._ux5)return;NE._ux5=1;const f=nfGet(NE.fd);if(!f)return;
  if(f.col&&!NE.bg){const bg=ux5NearBg(f.col);if(bg){NE.bg=bg;const box=$('#noteBox');if(box)box.style.setProperty('--nbg',bg)}}
  const tg=ux5FolderTag(f.id);if(tg&&!(NE.body||'').includes('#'+tg)){NE.body='#'+tg+'\n'+(NE.body||'');const b=$('#neBody');if(b){b.value=NE.body;b.dispatchEvent(new Event('input'))}}}catch(e){console.error(e)}})}

/* 69. on the PC an existing note opens with the caret at the end of its text */
function ux5Caret(){if(!NE||NE._new||NE._view||NE._ux5c||MOB.matches||NE.lock)return;setTimeout(()=>{const b=$('#neBody');if(!b||b.offsetParent===null||!NE||NE._view||NE._ux5c)return;NE._ux5c=1;const L_=b.value.length;b.focus({preventScroll:true});b.setSelectionRange(L_,L_);b.scrollTop=b.scrollHeight},90)}
{hookFn('openNote',()=>openNote,f=>{openNote=f},'post',function(){try{ux5Caret()}catch(e){}})}

/* 70. edit and read are two clear tabs (Ctrl+E switches) */
window.addEventListener('keydown',e=>{if(!NE||!(e.ctrlKey||e.metaKey)||e.altKey||e.shiftKey||e.key.toLowerCase()!=='e'||!$('#noteModal.on'))return;const b=$('#neMode button:not(.on)');if(b){e.preventDefault();b.click()}},true);
function ux5Tabs(){const m=$('#neMode');if(!m||m.dataset.ux5)return;m.dataset.ux5=1;m.classList.add('ux5tabs');m.setAttribute('role','tablist');m.querySelectorAll('button').forEach(b=>{b.setAttribute('role','tab');b.title=t(b.dataset.m==='view'?'ux5.readK':'ux5.editK')})}
function ux5TabSel(){$$('#neMode button').forEach(b=>b.setAttribute('aria-selected',b.classList.contains('on')?'true':'false'))}

/* 65. a reading progress line on long notes */
function ux5Scroller(){const b=$('#noteBox');let p=b;while(p&&p!==document.body){const cs=getComputedStyle(p);if(/(auto|scroll)/.test(cs.overflowY)&&p.scrollHeight>p.clientHeight+4)return p;p=p.parentElement}return null}
function ux5Prog(){const box=$('#noteBox');if(!box||!NE)return;let bar=$('#ux5Pg');const pv=$('#nePrev'),ta=$('#neBody');const view=!!NE._view;
  let el=view?ux5Scroller():ta,f=0,long=false;if(el){const max=el.scrollHeight-el.clientHeight;long=el.scrollHeight>el.clientHeight*1.5&&max>200;f=max>0?el.scrollTop/max:0}
  if(!long){if(bar)bar.hidden=true;return}
  if(!bar){bar=document.createElement('div');bar.id='ux5Pg';bar.className='ux5pg';bar.innerHTML='<i></i>';box.prepend(bar)}bar.hidden=false;bar.firstChild.style.transform=`scaleX(${Math.max(0,Math.min(1,f)).toFixed(3)})`}
document.addEventListener('scroll',e=>{if(NE&&e.target&&e.target.closest&&e.target.closest('#noteModal'))requestAnimationFrame(ux5Prog)},true);
document.addEventListener('input',e=>{if(e.target&&e.target.id==='neBody')requestAnimationFrame(ux5Prog)},true);

/* 63. phones: the tool row rides on top of the keyboard while writing */
function ux5Kb(){const tl=$('#noteBox .netools'),ta=$('#neBody');if(!tl)return;const vv=window.visualViewport;
  const on=MOB.matches&&vv&&document.activeElement===ta&&(innerHeight-vv.height)>120;
  if(!on){if(tl.classList.contains('ux5kb')){tl.classList.remove('ux5kb');tl.style.top='';const s=$('#ux5KbSp');if(s)s.remove()}return}
  const z=uiZoom()||1;if(!tl.classList.contains('ux5kb')){const sp=document.createElement('div');sp.id='ux5KbSp';sp.style.height=tl.offsetHeight+'px';tl.before(sp);tl.classList.add('ux5kb')}
  tl.style.top=((vv.offsetTop+vv.height)/z-tl.offsetHeight)+'px'}
if(window.visualViewport){visualViewport.addEventListener('resize',ux5Kb);visualViewport.addEventListener('scroll',ux5Kb)}
document.addEventListener('focusin',()=>setTimeout(ux5Kb,60));document.addEventListener('focusout',()=>setTimeout(ux5Kb,120));
/* the line being typed stays above the raised tool row too */
{const _k=kbKeep;kbKeep=function(...a){const r=_k(...a);try{const tl=$('#noteBox .netools.ux5kb'),ta=$('#neBody');if(tl&&document.activeElement===ta){const y=kbCaretY(ta),top=tl.getBoundingClientRect().top;if(y!=null&&y>top-12){const s=typeof kbScroller==='function'?kbScroller(ta):null;if(s)s.scrollTop+=y-top+28;else ta.scrollTop+=y-top+28}}}catch(e){}return r}}

{hookFn('renderNoteEd',()=>renderNoteEd,f=>{renderNoteEd=f},'post',function(){try{ux5Tabs();ux5TabSel();ux5TitlePh();setTimeout(ux5Prog,60)}catch(e){console.error(e)}})}
{hookFn('neShowMode',()=>neShowMode,f=>{neShowMode=f},'post',function(){try{ux5TabSel();ux5Caret();setTimeout(ux5Prog,60)}catch(e){}})}

/* 64. a card without a picture shows its first heading big */
{const _nc=noteCard;noteCard=function(n){let h=_nc(n);try{h=h.replace(/ · ☑ \d+\/\d+/,'');if(!(n.imgs||[]).length&&!n.cov&&!(n.lock&&!notesUnlocked())){const m=String(n.body||'').match(/^#{1,3}\s+(.+)$/m);if(m){const tx=mdPlain(m[1]).trim();if(tx&&tx!==String(n.title||'').trim()){const i=h.indexOf('<div class="nbody">');if(i>0)h=h.slice(0,i)+`<div class="ux5hd" dir="auto">${esc(tx.slice(0,70))}</div>`+h.slice(i)}}}}catch(e){}return h}}

/* 66. the checklist count becomes a ring; 67. folder cards show their latest note; 68. an empty search offers a new note */
function ux5Ago(ms){const k=dKey(new Date(ms)),td=todayKey();if(k===td)return t('ux5.today');const d=Math.round((keyToDate(td)-keyToDate(k))/864e5);if(d===1)return t('ux5.yest');if(d<30)return t('ux5.days',d);return gShort(keyToDate(k))}
function ux5Last(fid){const ids=new Set([fid]);let grew=true;while(grew){grew=false;NFOLD().forEach(f=>{if(f.parent&&ids.has(f.parent)&&!ids.has(f.id)){ids.add(f.id);grew=true}})}let mx=0;NOTES().forEach(n=>{if(!n.arc&&n.fd&&ids.has(n.fd))mx=Math.max(mx,n.updated||n.created||0)});return mx}
function ux5Cards(){
  $$('#notesGrid .ncck').forEach(c=>{if(c.dataset.ux5)return;const m=c.textContent.match(/(\d+)\s*\/\s*(\d+)/);if(!m)return;const dn=+m[1],all=+m[2],f=all?dn/all:0,R=7,C=2*Math.PI*R;c.dataset.ux5=1;c.classList.add('ux5ring');
    c.innerHTML=`<svg viewBox="0 0 18 18" width="18" height="18" aria-hidden="true"><circle cx="9" cy="9" r="${R}" fill="none" stroke="currentColor" stroke-opacity=".22" stroke-width="2.4"/><circle cx="9" cy="9" r="${R}" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="${(C*f).toFixed(2)} ${C.toFixed(2)}" transform="rotate(-90 9 9)"/></svg><b>${dn}/${all}</b>`});
  $$('#nfGrid .nfcard[data-nf]').forEach(c=>{const sm=c.querySelector('.nfmeta small');if(!sm||sm.querySelector('.ux5ld'))return;const mx=ux5Last(c.dataset.nf);if(mx)sm.insertAdjacentHTML('beforeend',`<span class="ux5ld"> · ${esc(t('ux5.last',ux5Ago(mx)))}</span>`)});
  const q=($('#nSearch')&&$('#nSearch').value||'').trim(),g=$('#notesGrid');const old=$('#ux5New');if(old)old.remove();
  if(q&&g&&!q.startsWith('#')&&!NOTES().some(n=>!n.arc&&String(n.title||'').trim().toLowerCase()===q.toLowerCase())){const empty=!g.querySelector('.ncard');
    const b=document.createElement('button');b.id='ux5New';b.type='button';b.className='btn '+(empty?'pri':'ghost')+' ux5new';b.innerHTML=`＋ ${esc(t('ux5.mk'))} «<span dir="auto">${esc(q.slice(0,60))}</span>»`;
    b.onclick=()=>{const fd=typeof NF!=='undefined'&&NF.cur&&!NF.arc?NF.cur:null;openNote(null,todayKey());if(!NE)return;if(fd&&!NE.fd){NE.fd=fd;try{nteFdPaint()}catch(e){}}NE.title=q;const a=$('#neTitle');if(a)a.value=q;const bd=$('#neBody');if(bd)setTimeout(()=>bd.focus(),60)};
    if(empty){const e=g.querySelector('.empty');(e||g).after(b)}else g.after(b)}}
{hookFn('renderNotes',()=>renderNotes,f=>{renderNotes=f},'post',function(){try{ux5Cards()}catch(e){console.error(e)}})}

