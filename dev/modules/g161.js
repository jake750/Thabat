/* ============ v3.137.0: twelfth list H — print a note, today's goal in the tray icon, category colours follow the theme, pictures in «what's new», your journey with Thabat ============ */
/* 88: print the open note on a clean page (an iframe with its own small style sheet; the app's look stays out) */
async function nprPrint(){if(!NE)return;neRead();const n=NE,title=n.title||t('nwd.untitled'),dt=new Date(n.updated||n.at||Date.now());
  let imgs='';for(const id of (n.imgs||[]).slice(0,24)){try{const d=await nImg(id);if(d)imgs+=`<img src="${d}">`}catch(e){}}
  const fl=$('link[rel=stylesheet][href*="fonts.googleapis.com/css"]'),font=getComputedStyle(document.body).fontFamily,rtl=document.documentElement.dir==='rtl';
  const html=`<!doctype html><html dir="${rtl?'rtl':'ltr'}" lang="${LANG}"><head><meta charset="utf-8"><title>${esc(title)}</title>${fl?`<link rel="stylesheet" href="${esc(fl.href)}">`:''}<style>
@page{margin:18mm 16mm}*{box-sizing:border-box}body{font-family:${font};color:#111;background:#fff;font-size:12.5pt;line-height:1.75;margin:0}
h1{font-size:21pt;margin:0 0 2mm;line-height:1.35}.npm{color:#666;font-size:10pt;border-bottom:1px solid #ccc;padding-bottom:3mm;margin-bottom:6mm}
.nh1,.nh2,.nh3,.nh4{font-weight:700;margin:5mm 0 2mm;break-after:avoid}.nh1{font-size:17pt}.nh2{font-size:15pt}.nh3{font-size:13.5pt}.nh4{font-size:12.5pt}
blockquote{margin:3mm 0;padding:1mm 4mm;border-inline-start:3px solid #999;color:#333}mark{background:#fff2a8;color:inherit;padding:0 2px}
ul,ol{padding-inline-start:7mm;margin:2mm 0}li{margin:.6mm 0}ul.nchk{list-style:none;padding-inline-start:2mm}
input{accent-color:#333}code,pre{font-family:Consolas,monospace;font-size:10.5pt;background:#f3f3f3;border-radius:3px;padding:0 3px}pre{padding:3mm;white-space:pre-wrap}
table{border-collapse:collapse;margin:3mm 0;width:auto;max-width:100%}td,th{border:1px solid #bbb;padding:1.5mm 3mm;vertical-align:top}th{background:#f2f2f2}
a{color:#111;text-decoration:underline}svg{display:none}hr{border:0;border-top:1px solid #ccc;margin:5mm 0}
.imgs img{display:block;max-width:100%;max-height:120mm;margin:4mm auto;break-inside:avoid}.ftr{margin-top:8mm;color:#999;font-size:9pt;text-align:center}
</style></head><body><h1 dir="auto">${esc(title)}</h1><div class="npm">${esc(hStr(dt))} · ${esc(gStr(dt))}</div><div class="nb" dir="auto">${mdLite(n.body||'')}</div>${imgs?`<div class="imgs">${imgs}</div>`:''}<div class="ftr">${esc(t('app'))}</div></body></html>`;
  $('#nprFrame')?.remove();const f=document.createElement('iframe');f.id='nprFrame';f.setAttribute('aria-hidden','true');f.style.cssText='position:fixed;inset-inline-end:0;bottom:0;width:0;height:0;border:0;visibility:hidden';document.body.append(f);
  const d=f.contentDocument;d.open();d.write(html);d.close();
  const go=()=>{try{f.contentWindow.focus();f.contentWindow.print()}catch(e){toast(t('npr.fail'))}setTimeout(()=>f.remove(),1500)};
  const wait=[...d.images].filter(i=>!i.complete).map(i=>new Promise(r=>{i.onload=i.onerror=r}));Promise.race([Promise.all([...wait,d.fonts?d.fonts.ready:0]),new Promise(r=>setTimeout(r,2500))]).then(()=>setTimeout(go,120))}
{hookFn('nteMenu',()=>nteMenu,f=>{nteMenu=f},'post',function(){try{if(ANDROID)return;const p=$('#ppPop');if(!p||p.querySelector('[data-npr]'))return;const b=document.createElement('button');b.dataset.npr=1;b.innerHTML=`<svg class="uic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 9V3h10v6M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2M7 14h10v7H7z"/></svg> ${esc(t('npr.b'))}`;b.onclick=e=>{e.stopPropagation();closePP();nprPrint()};p.append(b)}catch(e){console.error(e)}})}

/* 97: category colours follow the theme — the saved colour is kept; what is drawn is lifted in dark mode and deepened in light mode until it stands out from the background (contrast ≥ 3) */
const CTH={map:new Map(),key:'',mo:null};
function cthHex(h){h=String(h||'').trim().toLowerCase();let m=h.match(/^#([0-9a-f]{3})$/);if(m)return'#'+m[1].split('').map(c=>c+c).join('');m=h.match(/^#([0-9a-f]{6})$/);return m?h:null}
function cthRgb(h){return[1,3,5].map(i=>parseInt(h.slice(i,i+2),16))}
function cthLum(r){const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(r[0])+.7152*f(r[1])+.0722*f(r[2])}
function cthCon(a,b){const x=cthLum(a),y=cthLum(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05)}
function cthHsl(r){let[R,G,B]=r.map(v=>v/255);const mx=Math.max(R,G,B),mn=Math.min(R,G,B),l=(mx+mn)/2;let h=0,s=0;if(mx!==mn){const d=mx-mn;s=l>.5?d/(2-mx-mn):d/(mx+mn);h=mx===R?(G-B)/d+(G<B?6:0):mx===G?(B-R)/d+2:(R-G)/d+4;h/=6}return[h,s,l]}
function cthFromHsl(h,s,l){const f=(p,q,t_)=>{if(t_<0)t_+=1;if(t_>1)t_-=1;return t_<1/6?p+(q-p)*6*t_:t_<1/2?q:t_<2/3?p+(q-p)*(2/3-t_)*6:p};let r,g,b;if(!s)r=g=b=l;else{const q=l<.5?l*(1+s):l+s-l*s,p=2*l-q;r=f(p,q,h+1/3);g=f(p,q,h);b=f(p,q,h-1/3)}return'#'+[r,g,b].map(v=>Math.round(v*255).toString(16).padStart(2,'0')).join('')}
function cthAdj(hex,bg,light){const r=cthRgb(hex);if(cthCon(r,bg)>=3)return hex;let[h,s,l]=cthHsl(r);for(let i=0;i<40;i++){l=light?l-.02:l+.02;if(l<=.05||l>=.95)break;const x=cthFromHsl(h,s,l);if(cthCon(cthRgb(x),bg)>=3)return x}return cthFromHsl(h,s,Math.max(.05,Math.min(.95,l)))}
function cthOn(){return S.settings.catTheme!==false}
function cthBuild(){const light=document.documentElement.classList.contains('mode-light'),bgS=getComputedStyle(document.documentElement).getPropertyValue(light?'--bg':'--panel').trim(),bg=cthHex(bgS)||(light?'#ffffff':'#16171b');
  const cols=[...new Set((S.settings.categories||[]).map(c=>cthHex(c.color)).filter(Boolean))],key=(cthOn()?1:0)+light+bg+cols.join('');if(key===CTH.key)return false;CTH.key=key;CTH.map.clear();
  if(cthOn())cols.forEach(c=>{const a=cthAdj(c,cthRgb(cthHex(bg)),light);if(a!==c)CTH.map.set(c,a)});return true}
const CTH_RE=/#[0-9a-fA-F]{3,8}\b/g,CTH_SKIP='#bwrap,.nbody,#nePrev,#neBody,input,#catEdit,.lklogo';
function cthSwap(s){return s.replace(CTH_RE,m=>{const l=m.toLowerCase(),base=l.length>=7?l.slice(0,7):cthHex(l),rest=l.length>=7?l.slice(7):'';const a=base&&CTH.map.get(base);return a?a+rest:m})}
function cthEl(el){if(el.nodeType!==1||el.closest(CTH_SKIP))return;for(const at of['style','fill','stroke']){const k=at==='style'?'cthO':'cth'+at;const cur=el.getAttribute(at);if(cur==null)continue;const orig=el.dataset[k]??cur;const nv=cthSwap(orig);if(nv!==orig){if(el.dataset[k]==null)el.dataset[k]=orig;if(cur!==nv)el.setAttribute(at,nv)}else if(el.dataset[k]!=null){delete el.dataset[k];if(cur!==orig)el.setAttribute(at,orig)}}}
function cthPass(root){if(!CTH.map.size&&!(root||document).querySelector?.('[data-cth-o],[data-cthfill],[data-cthstroke]'))return;const r=root||document.body;if(r.nodeType!==1)return;if(r.matches('[style],[fill],[stroke]'))cthEl(r);r.querySelectorAll('[style],[fill],[stroke]').forEach(cthEl)}
function cthAll(){const ch=cthBuild();if(ch){document.querySelectorAll('[data-cth-o],[data-cthfill],[data-cthstroke]').forEach(cthEl);cthPass(document.body)}}
{const mo=new MutationObserver(ms=>{if(!CTH.map.size)return;for(const m of ms){if(m.type==='childList')m.addedNodes.forEach(n=>{if(n.nodeType===1)cthPass(n)});else if(m.type==='attributes'&&m.target.nodeType===1){const el=m.target,k=m.attributeName==='style'?'cthO':'cth'+m.attributeName;const cur=el.getAttribute(m.attributeName);if(el.dataset[k]!=null&&cur!==cthSwap(el.dataset[k]))delete el.dataset[k];cthEl(el)}}});
  CTH.mo=mo;mo.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['style','fill','stroke']})}
{hookFn('applyTheme',()=>applyTheme,f=>{applyTheme=f},'post',function(){try{setTimeout(cthAll,0)}catch(e){console.error(e)}})}
setTimeout(cthAll,300);
{hookFn('renderSettings',()=>renderSettings,f=>{renderSettings=f},'post',function(){try{const r=$('#thRow');if(!r||$('#cthRow'))return;
  r.insertAdjacentHTML('afterend',`<div class="field" id="cthRow"><div><label data-i18n="cth.t">${esc(t('cth.t'))}</label><small>${esc(t('cth.s'))}</small></div><button class="sw-toggle${S.settings.catTheme!==false?' on':''}" id="cthT" role="switch" aria-checked="${S.settings.catTheme!==false}"></button></div>`);
  $('#cthT').onclick=()=>{S.settings.catTheme=S.settings.catTheme===false?undefined:false;if(S.settings.catTheme===undefined)delete S.settings.catTheme;save();const on=S.settings.catTheme!==false;$('#cthT').classList.toggle('on',on);$('#cthT').setAttribute('aria-checked',on);CTH.key='';cthAll()}}catch(e){console.error(e)}})}

/* 89: today's goal in the helper's tray icon — the app sends worked and goal minutes; the helper writes «3 س 20 د من 6 س · 55%» under the next prayer and draws a progress bar under the icon */
const TGL={last:'',at:0,off:0};
async function tglPush(force){if(ANDROID||MAC||S._demo||S._slim)return;if(TGL.off&&Date.now()-TGL.off<30*6e4)return;const k=todayKey(),w=Math.round(totals(k).tot/6e4),g=Math.round(goalMs(k)/6e4),sig=k+'|'+w+'|'+g;
  if(!force&&sig===TGL.last&&Date.now()-TGL.at<5*6e4)return;try{const r=await fetch(HELPER+'/tray/goal?w='+w+'&g='+g+'&d='+k,{cache:'no-store'});if(r.ok){TGL.last=sig;TGL.at=Date.now();TGL.off=0}else if(r.status===404)TGL.off=Date.now()}catch(e){TGL.off=Date.now()}}
setInterval(()=>tglPush(),6e4);setTimeout(()=>tglPush(true),8000);
{let tm=null;hookFn('renderToday',()=>renderToday,f=>{renderToday=f},'post',function(){clearTimeout(tm);tm=setTimeout(()=>tglPush(),1500)})}

/* 100: your journey with Thabat — everything since the first recorded day */
function jrnStats(){const tk=todayKey(),ks=Object.keys(S.days||{}).filter(k=>k<=tk).sort();let first=null,act=0,ms=0,sn=0,td=0,pg=0,pr=0,fast=0,gold=0,run=0,best=0;
  ks.forEach(k=>{const d=S.days[k]||{};let tot=0;try{tot=totals(k).tot}catch(e){}const tasks=(d.tasks||[]).filter(x=>x.done).length;let p=0;try{p=qPgsOf(k).length||((d.quran&&d.quran.read)||0)}catch(e){}
    let ok=0;try{PRAYERS.forEach(q=>{const s=plStatus(k,q);if(s==='on'||s==='auto')ok++})}catch(e){}const any=tot>0||tasks||p||ok||d.fast;if(any&&!first)first=k;if(tot>0)act++;
    ms+=tot;sn+=(d.sessions||[]).length;td+=tasks;pg+=p;pr+=ok;if(d.fast)fast++;let gl=false;try{gl=tot>0&&tot>=goalMs(k)}catch(e){}if(gl){gold++;run++;best=Math.max(best,run)}else if(k<tk)run=0});
  const notes=(S.notes||[]).length,kh=((S.quran||{}).khatmas||[]).length,L=S.lib||{},bk=Object.values(L.bk||{}).filter(b=>b&&b.done).length,ls=Object.values(L.prog||{}).filter(p=>p&&p.done).length;
  const days=first?Math.round((keyToDate(tk)-keyToDate(first))/864e5)+1:0;return{first,days,act,h:ms/36e5,sn,td,notes,pg,kh,pr,fast,gold,best,bk,ls}}
function jrnNum(v){return Math.round(v).toLocaleString(LANG==='ar'?'ar-u-nu-latn':'en')}
function jrnHTML(o,mini){const T=[['⏱',jrnNum(o.h),'jrn.h'],['☑',jrnNum(o.td),'jrn.td'],['📝',jrnNum(o.notes),'jrn.notes'],['📖',jrnNum(o.pg),'jrn.pg'],['🕌',jrnNum(o.pr),'jrn.pr'],['✦',jrnNum(o.gold),'jrn.gold'],['🔥',jrnNum(o.best),'jrn.best'],['🎯',jrnNum(o.sn),'jrn.sn'],['🌙',jrnNum(o.fast),'jrn.fast'],['🏁',jrnNum(o.kh),'jrn.kh'],['🎬',jrnNum(o.ls),'jrn.ls'],['📚',jrnNum(o.bk),'jrn.bk']];
  const list=mini?T.slice(0,4):T.filter((x,i)=>i<6||+String(x[1]).replace(/\D/g,'')>0);
  return`<div class="jrn${mini?' mini':''}">${o.first?`<div class="jrnhd"><b>${esc(t('jrn.since',hStr(keyToDate(o.first)),gStr(keyToDate(o.first))))}</b><small>${esc(t('jrn.days',jrnNum(o.days),jrnNum(o.act)))}</small></div>`:`<p class="crsub">${esc(t('jrn.none'))}</p>`}
    <div class="jrng">${list.map(([ic,v,k])=>`<div class="jrnt"><i>${ic}</i><b>${v}</b><small>${esc(t(k))}</small></div>`).join('')}</div></div>`}
function jrnOpen(){openInfo('🧭 '+esc(t('jrn.t')),jrnHTML(jrnStats(),false)+`<small class="muted jrnft">${esc(t('jrn.ft'))}</small>`);$('#infoBox').classList.add('jrnbox')}
{hookFn('openInfo',()=>openInfo,f=>{openInfo=f},'pre',function(){$('#infoBox')?.classList.remove('jrnbox')})}
{hookFn('renderSettings',()=>renderSettings,f=>{renderSettings=f},'post',function(){try{const r=$('#verRow');if(!r||$('#jrnRow'))return;r.insertAdjacentHTML('afterend',`<div class="field" id="jrnRow"><div><label data-i18n="jrn.t">${esc(t('jrn.t'))}</label><small>${esc(t('jrn.s'))}</small></div><button class="btn sm" id="jrnB">${esc(t('jrn.open'))}</button></div>`);$('#jrnB').onclick=jrnOpen}catch(e){console.error(e)}})}
{const _cc=cmdCommands;cmdCommands=function(){const c=(icon,label,run,kw)=>({icon,label,run,kw:kw||''});return _cc().concat([c('🧭',t('jrn.t'),jrnOpen,'journey رحلتك منذ بدأت stats')])}}

/* 98: «what's new» shows pictures of the new features — small live pictures drawn from your own data (WNP[version] = [{k:caption key, f:()=>html}]) */
const WNP={};
function wnpVer(){const key=CHANGES[APP_VER];return Object.keys(WNP).find(v=>CHANGES[v]===key)}
function wnpHTML(v){const L_=(WNP[v]||[]).map(p=>{let h='';try{h=p.f()}catch(e){return''}return h?`<figure class="wnpf"><div class="wnpic" aria-hidden="true">${h}</div><figcaption>${esc(t(p.k))}</figcaption></figure>`:''}).join('');return L_?`<div class="wnp">${L_}</div>`:''}
{hookFn('openWhatsNew',()=>openWhatsNew,f=>{openWhatsNew=f},'post',function(){try{const v=wnpVer(),b=$('#infoBox .infob');if(!v||!b||b.querySelector('.wnp'))return;b.insertAdjacentHTML('afterbegin',wnpHTML(v))}catch(e){console.error(e)}})}
WNP['3.137.0']=[
  {k:'wnp.jrn',f:()=>jrnHTML(jrnStats(),true)},
  {k:'wnp.cth',f:()=>{const cs=topCats().slice(0,4);if(!cs.length)return'';const row=(light)=>{const bg=light?'#f6f4ee':'#16171b';return`<div class="wnpcm" style="background:${bg};color:${light?'#222':'#eee'}">${cs.map(c=>{const h=cthHex(c.color)||'#888888',a=S.settings.catTheme===false?h:cthAdj(h,cthRgb(bg),light);return`<span><i data-cth-x style="background:${a}"></i>${esc(c.name)}</span>`}).join('')}</div>`};return row(false)+row(true)}},
  {k:'wnp.tray',f:()=>{if(ANDROID||MAC)return'';const k=todayKey(),w=totals(k).tot/6e4,g=goalMs(k)/6e4,p=g?Math.min(100,Math.round(w/g*100)):0,fm=m=>{m=Math.round(m);const h=Math.floor(m/60),r=m%60;return h&&r?t('tgl.hm',h,r):h?t('tgl.h',h):t('tgl.m',r)};return`<div class="wnptr"><div class="tip"><b>${esc(t('app'))}</b><span>${esc(fm(w)+' '+t('tgl.of')+' '+fm(g)+' · '+p+'%')}</span></div><div class="ico"><b>ث</b><i style="--p:${p}%"></i></div></div>`}},
  {k:'wnp.npr',f:()=>{if(ANDROID)return'';const n=(S.notes||[]).filter(x=>!x.arc&&!x.lock).sort((a,b)=>(b.updated||0)-(a.updated||0))[0];const tt=n?(n.title||t('nwd.untitled')):t('npr.sample'),body=n?mdPlain(n.body||'').slice(0,160):'';return`<div class="wnppg"><b dir="auto">${esc(tt)}</b><small>${esc(hStr(new Date()))}</small><p dir="auto">${esc(body)}</p><i></i><i></i><i></i></div>`}}];
