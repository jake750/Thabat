/* ============ v3.66.0 the look (fourth list, group C: 37 39–43 45–58) ============ */
/* S.settings.lk = {tscale, glass, shape, icw, motion, calFill, countUp, strike, calm, auC, auS, navS, hdLogo, div} */
const LK_D={tscale:true,glass:60,shape:'',icw:1.8,motion:'auto',calFill:'',countUp:true,strike:true,calm:false,auC:'multi',auS:'normal',navS:'float',hdLogo:true,div:'line'};
function LK(){return Object.assign({},LK_D,S.settings.lk||{})}
/* 54. themes taken from old mushafs: ivory paper, ink, gold — accents with their own surfaces */
Object.assign(COLORS,{ivory:{n:{ar:'عاجي (مصحف قديم)',en:'Ivory (old mushaf)'},d:'#d2b27a',l:'#8a6326',sh:38,msh:1},ink:{n:{ar:'حبر',en:'Ink'},d:'#8fb3d9',l:'#24507d',sh:214,msh:1},mgold:{n:{ar:'ذهب المصاحف',en:'Mushaf gold'},d:'#d9b64a',l:'#87690f',sh:150,msh:1}});
{const _sf=surfaces;surfaces=function(mode,h){const r=_sf(mode,h),c=S.settings&&S.settings.color;
  if(c==='ivory')return mode==='light'?{bg:'#efe4c9',panel:'#faf3e2',panel2:'#f1e6cc',line:'#dccba4',text:'#3b2c16',muted:'#7a6847'}:{bg:'#17130c',panel:'#211b12',panel2:'#2a2318',line:'#3a3121',text:'#efe2c6',muted:'#a99878'};
  if(c==='ink')return mode==='light'?{bg:'#eef1f5',panel:'#ffffff',panel2:'#e4e9f0',line:'#cfd7e2',text:'#14233a',muted:'#56657a'}:{bg:'#0b1220',panel:'#111a2c',panel2:'#162238',line:'#22304a',text:'#e3ebf7',muted:'#8a9ab3'};
  if(c==='mgold')return mode==='light'?{bg:'#f2eedc',panel:'#fbf8ec',panel2:'#ece6cc',line:'#d8cfa6',text:'#1d2a1f',muted:'#5d6a58'}:{bg:'#0c1410',panel:'#121d17',panel2:'#18261e',line:'#26382c',text:'#efe6c4',muted:'#a39f84'};
  return r}}

/* 37 + 46 + 58: one pass over the app's own style rules — font sizes snap to five steps, corners of buttons/fields/cards to one radius each, dashed separators take the chosen style */
const LKP={orig:new Map(),done:false};
const LK_FSKIP=/qimg|\.ml\b|mushaf|\.aen|#tDisp|\.cell|calsky|\.msb|\.hmn|\.uic|svg|ayd|quran|#q[A-Z]|\.q[a-z]|bk|lpv|wb|board|#lv|\.tdaring|\.pez|kbd|\.fca|\.big|\.date-h|\.pgt|logo|\.wtx|\.tmr/i;
function lkSnap(px){if(px>=23.5)return px;if(px<11.75)return 11;if(px<13.25)return 12.5;if(px<15.5)return 14;if(px<19)return 17;return 21}
function lkPass(){const L_=LK();const rules=[];const walk=list=>{for(const r of list){if(r.cssRules&&!r.selectorText)walk(r.cssRules);else if(r.style&&r.selectorText)rules.push(r)}};
  for(const sh of document.styleSheets){try{if(sh.href)continue;walk(sh.cssRules)}catch(e){}}
  rules.forEach(r=>{const st=r.style;let o=LKP.orig.get(r);if(!o){o={fs:st.getPropertyValue('font-size'),fsp:st.getPropertyPriority('font-size'),br:st.getPropertyValue('border-radius'),brp:st.getPropertyPriority('border-radius'),bt:st.getPropertyValue('border-top'),btp:st.getPropertyPriority('border-top'),pt:st.getPropertyValue('padding-top'),bi:st.getPropertyValue('border-image')};LKP.orig.set(r,o)}
    const sel=r.selectorText;
    /* 37 */
    if(o.fs&&/^\d+(\.\d+)?px$/.test(o.fs)&&!LK_FSKIP.test(sel)){const v=parseFloat(o.fs),n=L_.tscale?lkSnap(v):v;st.setProperty('font-size',n+'px',o.fsp)}
    /* 46 */
    if(o.br&&/^\d+(\.\d+)?px$/.test(o.br)){const v=parseFloat(o.br);let n=v;if(/\.btn\b|\.in\b|button|input|select|textarea/.test(sel)&&v>=7&&v<=12)n=10;else if(/\.card\b|\.box\b|aydbox|\.tdhd|\.tdpr/.test(sel)&&v>=14&&v<=24)n=22;st.setProperty('border-radius',n+'px',o.brp)}
    /* 58 */
    if(o.bt&&/dashed/.test(o.bt)&&/^1px/.test(o.bt)){if(L_.div==='space'){st.setProperty('border-top','1px solid transparent',o.btp);st.removeProperty('border-image')}
      else if(L_.div==='orn'){st.setProperty('border-top','3px solid transparent',o.btp);st.setProperty('border-image','repeating-linear-gradient(90deg,var(--line) 0 7px,transparent 7px 10px,color-mix(in srgb,var(--accent) 70%,transparent) 10px 13px,transparent 13px 16px) 3')}
      else if(L_.div==='line'){st.setProperty('border-top',o.bt.replace('dashed','solid'),o.btp);st.removeProperty('border-image')}
      else{st.setProperty('border-top',o.bt,o.btp);st.removeProperty('border-image')}}});LKP.done=true}

/* the whole look: classes and variables on <html> */
function lkApply(){const L_=LK(),h=document.documentElement,r=h.style;
  h.classList.toggle('cs-flat',L_.shape==='flat');h.classList.toggle('cs-raised',L_.shape==='raised');h.classList.toggle('cs-line',L_.shape==='line');
  r.setProperty('--icw',L_.icw);r.setProperty('--gB',Math.round(6+L_.glass*.4)+'px');r.setProperty('--gBr',(.92-L_.glass*.0015).toFixed(3));
  const rm=L_.motion==='less'||(L_.motion==='auto'&&matchMedia('(prefers-reduced-motion: reduce)').matches);h.classList.toggle('rmotion',rm);
  if(L_.calFill)r.setProperty('--calFill',L_.calFill);else r.removeProperty('--calFill');h.classList.toggle('calfill',!!L_.calFill);
  h.classList.toggle('lkstrike',L_.strike);h.classList.toggle('au-acc',L_.auC==='accent');h.classList.toggle('au-off',L_.auC==='off');h.classList.toggle('au-slow',L_.auS==='slow');h.classList.toggle('au-still',L_.auS==='still');
  h.classList.toggle('nvs-edge',L_.navS==='edge');h.classList.toggle('nvs-clear',L_.navS==='clear');h.classList.toggle('hdlogo',L_.hdLogo);
  /* 53 calm: a less saturated accent and water */
  if(L_.calm){const a=getComputedStyle(h).getPropertyValue('--accent').trim();if(a&&!/color-mix/.test(a)){r.setProperty('--accent',`color-mix(in oklab,${a} 62%,#8a8a8a)`);const w=getComputedStyle(h).getPropertyValue('--water').trim();if(w)r.setProperty('--water',`color-mix(in oklab,${w} 62%,#8a8a8a)`)}}
  h.classList.toggle('calm',L_.calm);try{lkPass()}catch(e){console.error(e)}lkLogo()}
{hookFn('applyTheme',()=>applyTheme,f=>{applyTheme=f},'post',function(){try{lkApply()}catch(e){console.error(e)}})}

/* 51. category icons in their category's colour */
{const _ci=catIco;catIco=function(c){const s=_ci(c);if(!s)return s;const col=(c&&c.color)||((catRaw(c&&c.parent)||{}).color);return col?s.replace('class="catic"',`class="catic" style="color:${col}"`):s}}

/* 49. a done task is struck through with a short line animation (only the one just ticked) */
const LKJ={id:null};document.addEventListener('click',e=>{const ck=e.target.closest&&e.target.closest('#tasks li.task:not(.done) .ck');if(ck){LKJ.id=ck.closest('li').dataset.id;LKJ.at=Date.now()}},true);
{hookFn('renderTasks',()=>renderTasks,f=>{renderTasks=f},'post',function(){if(!LKJ.id||Date.now()-LKJ.at>1500)return;const li=$(`#tasks li.task.done[data-id="${CSS.escape(LKJ.id)}"]`);LKJ.id=null;if(li){li.classList.add('lkjust');setTimeout(()=>li.classList.remove('lkjust'),900)}})}

/* 48. big numbers count up once when they come into view */
const LKC=new WeakMap();
function lkCount(el){if(!LK().countUp||document.documentElement.classList.contains('rmotion'))return;const tx=el.textContent,m=tx.match(/^(\D*?)(\d+)(\D*)$/);if(!m)return;const to=+m[2];if(!to||to>100000||LKC.get(el)===tx)return;LKC.set(el,tx);
  const t0=performance.now(),D=650,step=()=>{const p=Math.min(1,(performance.now()-t0)/D),v=Math.round(to*(1-Math.pow(1-p,3)));if(el.textContent!==m[1]+v+m[3]&&LKC.get(el)!==tx)return;el.textContent=m[1]+v+m[3];LKC.set(el,m[1]+v+m[3]);if(p<1)setTimeout(step,16);else LKC.set(el,tx)};step()}
function lkCountScan(root){if(!LK().countUp)return;(root||document).querySelectorAll('#glPct,#v-brief .tile b,#v-brief .crxt b,#v-brief .bnum,#v-brief .kpi b,#tdaRing span').forEach(el=>{if(el.offsetParent)lkCount(el)})}
{hookFn('renderBrief',()=>renderBrief,f=>{renderBrief=f},'post',function(){setTimeout(()=>lkCountScan($('#v-brief')),60)})}
{const _sv=showView;showView=function(v,...a){const r=_sv(v,...a);try{lkLogo()}catch(e){}if(v==='today'||v==='brief')setTimeout(()=>lkCountScan(),120);return r}}
{hookFn('applyI18n',()=>applyI18n,f=>{applyI18n=f},'post',function(){try{lkLogo()}catch(e){}})}
setTimeout(()=>{try{lkLogo()}catch(e){}},1500);

/* 57. phones: a small «ثبات» in the page title row, fading out once you scroll */
function lkLogo(){$$('.view>.pgt').forEach(h=>{if(h.querySelector('.lklogo'))return;const s=document.createElement('span');s.className='lklogo';s.setAttribute('aria-hidden','true');s.textContent=t('app');h.append(s)})}
{const m=$('main');if(m)m.addEventListener('scroll',()=>{document.documentElement.classList.toggle('lkscr',m.scrollTop>40)},{passive:true})}

/* 39. the look sheet: every choice with a live preview; nothing changes until «Apply» */
function lkOpen(){const st=S.settings,P={color:st.color||'yellow',mode:st.mode||'dark',style:st.style||'minimal',lk:LK()};
  const seg=(k,opts,cur)=>`<div class="seg lkseg" data-k="${k}">${opts.map(([v,l])=>`<button type="button" data-v="${v}" class="${String(cur)===String(v)?'on':''}">${l}</button>`).join('')}</div>`;
  const row=(lab,ctl)=>`<div class="lkrow"><span>${lab}</span>${ctl}</div>`;const T=k=>t('lka.'+k);
  openInfo('🎨 '+T('t'),`<div class="lkwrap"><div class="lkpv" id="lkPv"><div class="lkpvbg"><div class="card"><h3><span>${T('pvT')}</span></h3><div class="lkpvtask"><i class="ck"></i><span>${T('pvTask')}</span><small>17:30</small></div><div class="lkpvtask done"><i class="ck on">✓</i><span>${T('pvDone')}</span></div><div class="lkpvn"><b>68%</b><span>${T('pvWall')}</span></div><div class="row" style="gap:6px"><span class="lkpvbtn">${T('pvBtn')}</span><span class="lkpvchip">${T('pvChip')}</span></div><hr></div></div></div>
   <div class="lkctl">
    <div class="lkh">${T('gTheme')}</div>
    <div class="lkcols">${Object.keys(COLORS).filter(k=>COLORS[k].n).map(k=>{const C=COLORS[k];return`<button type="button" class="lkc ${P.color===k?'on':''}" data-c="${k}" title="${esc(C.n[LANG]||C.n.ar)}" style="--c:${C.d}"></button>`}).join('')}</div>
    ${row(T('mode'),seg('mode',Object.keys(MODES).map(k=>[k,MODES[k][LANG]||MODES[k].ar]),P.mode))}
    ${row(T('style'),seg('style',Object.keys(STYLES).map(k=>[k,STYLES[k][LANG]||STYLES[k].ar]),P.style))}
    ${row(T('calm'),seg('calm',[[false,T('off')],[true,T('on')]],P.lk.calm))}
    <div class="lkh">${T('gShape')}</div>
    ${row(T('shape'),seg('shape',[['',T('shDef')],['flat',T('shFlat')],['line',T('shLine')],['raised',T('shRaised')]],P.lk.shape))}
    ${row(T('glass'),`<input type="range" min="0" max="100" step="5" data-k="glass" value="${P.lk.glass}">`)}
    ${row(T('icw'),seg('icw',[[1.4,T('thin')],[1.8,T('normal')],[2.3,T('bold')]],P.lk.icw))}
    ${row(T('tscale'),seg('tscale',[[true,T('on')],[false,T('off')]],P.lk.tscale))}
    ${row(T('div'),seg('div',[['line',T('dLine')],['orn',T('dOrn')],['space',T('dSpace')],['dash',T('dDash')]],P.lk.div))}
    ${row(T('navS'),seg('navS',[['float',T('nFloat')],['edge',T('nEdge')],['clear',T('nClear')]],P.lk.navS))}
    <div class="lkh">${T('gMotion')}</div>
    ${row(T('motion'),seg('motion',[['auto',T('mAuto')],['less',T('mLess')],['full',T('mFull')]],P.lk.motion))}
    ${row(T('auC'),seg('auC',[['multi',T('auMulti')],['accent',T('auAcc')],['off',T('off')]],P.lk.auC))}
    ${row(T('auS'),seg('auS',[['normal',T('normal')],['slow',T('slow')],['still',T('still')]],P.lk.auS))}
    ${row(T('countUp'),seg('countUp',[[true,T('on')],[false,T('off')]],P.lk.countUp))}
    ${row(T('strike'),seg('strike',[[true,T('on')],[false,T('off')]],P.lk.strike))}
    ${row(T('hdLogo'),seg('hdLogo',[[true,T('on')],[false,T('off')]],P.lk.hdLogo))}
    <div class="lkh">${T('gCal')}</div>
    <div class="lkcols">${['',...['#3fd98a','#e8b64c','#4fcbff','#ab7dff','#ff72b8']].map(c=>`<button type="button" class="lkc lkcf ${P.lk.calFill===c?'on':''}" data-cf="${c}" style="--c:${c||'var(--water)'}" title="${c?c:esc(T('cfDef'))}">${c?'':'↺'}</button>`).join('')}</div>
   </div></div>
   <div class="row lkact"><button class="btn" id="lkApply">${T('apply')}</button><button class="btn ghost" id="lkCancel">${t('cancel')}</button><button class="btn ghost sm" id="lkReset">${T('reset')}</button></div>`);
  const box=$('#infoBox');if(box)box.classList.add('lkbox');
  const pv=()=>lkPreview(P);
  $$('.lkcols [data-c]').forEach(b=>b.onclick=()=>{P.color=b.dataset.c;$$('.lkcols [data-c]').forEach(x=>x.classList.toggle('on',x===b));pv()});
  $$('.lkcols [data-cf]').forEach(b=>b.onclick=()=>{P.lk.calFill=b.dataset.cf;$$('.lkcols [data-cf]').forEach(x=>x.classList.toggle('on',x===b));pv()});
  $$('.lkseg').forEach(sg=>sg.querySelectorAll('[data-v]').forEach(b=>b.onclick=()=>{const k=sg.dataset.k;let v=b.dataset.v;if(v==='true')v=true;else if(v==='false')v=false;else if(k==='icw')v=+v;
    if(k==='mode'||k==='style')P[k]=v;else P.lk[k]=v;sg.querySelectorAll('[data-v]').forEach(x=>x.classList.toggle('on',x===b));pv()}));
  $$('.lkrow input[type=range]').forEach(i=>i.oninput=()=>{P.lk[i.dataset.k]=+i.value;pv()});
  $('#lkApply').onclick=()=>{st.color=P.color;st.mode=P.mode;st.style=P.style;st.lk=Object.assign({},P.lk);save();applyTheme();try{applyLook2()}catch(e){}try{renderSettings()}catch(e){}document.querySelectorAll('.modal.on').forEach(m=>{if(m.querySelector('#lkPv'))m.classList.remove('on')});toast(T('ok'))};
  $('#lkCancel').onclick=()=>{document.querySelectorAll('.modal.on').forEach(m=>{if(m.querySelector('#lkPv'))m.classList.remove('on')})};
  $('#lkReset').onclick=()=>{P.lk=Object.assign({},LK_D);delete st.lk;lkOpen()};pv()}
function lkPreview(P){const el=$('#lkPv');if(!el)return;const C=COLORS[P.color]||COLORS.yellow;const ss=S.settings.color;S.settings.color=P.color;const sf=surfaces(P.mode,C.sh);S.settings.color=ss;
  for(const k in sf)el.style.setProperty('--'+k,sf[k]);let acc=P.mode==='light'?C.l:C.d;if(P.lk.calm)acc=`color-mix(in oklab,${acc} 62%,#8a8a8a)`;el.style.setProperty('--accent',acc);el.style.setProperty('--onAccent',lum(P.mode==='light'?C.l:C.d)>0.33?'#0b0e13':'#ffffff');
  el.style.setProperty('--icw',P.lk.icw);el.style.setProperty('--gB',Math.round(6+P.lk.glass*.4)+'px');
  el.className='lkpv cs-'+(P.lk.shape||'def')+(P.style==='glass'?' pv-glass':'')+' dv-'+P.lk.div+(P.mode==='light'?' pv-light':'');
  el.querySelector('.lkpvn b').style.fontSize=P.lk.tscale?'21px':'22px'}
/* settings row (Look) and Ctrl+K */
{hookFn('renderSettings',()=>renderSettings,f=>{renderSettings=f},'post',function(){try{if($('#lkRow'))return;const a=$('#styleSeg');const row=a&&(a.closest('.field')||a.closest('.row'));if(!row)return;
  row.insertAdjacentHTML('afterend',`<div class="field" id="lkRow"><div><label data-i18n="lka.t">${t('lka.t')}</label><small>${t('lka.sub')}</small></div><button class="btn sm" id="lkBtn">🎨 ${t('lka.open')}</button></div>`);$('#lkBtn').onclick=lkOpen;
  try{(SGA_MAIN['set.look']=SGA_MAIN['set.look']||[]).includes('lka.t')||SGA_MAIN['set.look'].push('lka.t')}catch(e){}}catch(e){console.error(e)}})}
{const _cc=cmdCommands;cmdCommands=function(){const L_=_cc();L_.push({icon:'🎨',label:t('lka.t'),run:()=>{showView('set');lkOpen()},kw:'look theme appearance colours font icons motion مظهر ألوان ثيم خطوط أيقونات حركة'});return L_}}
DYK.push({k:'look',run:()=>lkOpen()});
{hookFn('openInfo',()=>openInfo,f=>{openInfo=f},'pre',function(){const b=$('#infoBox');if(b)b.classList.remove('lkbox','pebox')})}
setTimeout(()=>{try{lkApply()}catch(e){}},200);

