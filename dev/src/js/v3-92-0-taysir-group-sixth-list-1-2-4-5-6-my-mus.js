/* ============ v3.92.0: Taysir group (sixth list 1, 2, 4, 5, 6): «my mushafs», the page frame on phones, the appendix, two riwayat side by side ============ */
const TSM={q:[],qT:null,save:{}};
function tsKeysOf(r){return idbKeys().then(ks=>ks.filter(k=>String(k).startsWith('qimg:'+r+':')))}
/* 1 · «مصاحفي»: each Taysir mushaf on the PC and on this device */
async function tsMineOpen(){openInfo(t('tsm.t'),`<p class="muted">${esc(t('tsm.sub'))}</p><div id="tsmList" class="tsml"><div class="spin"></div></div>`);const b=$('#infoBox');if(b)b.classList.add('tsmbox');await tsMinePaint()}
async function tsMinePaint(){const box=$('#tsmList');if(!box)return;let st=null,why='';try{st=await tsList(true)}catch(e){why=e&&e.code||'off'}
  let ks=[];try{ks=await idbKeys()}catch(e){}const cnt={};ks.forEach(k=>{const m=/^qimg:(ts_[a-z0-9]+):/.exec(String(k));if(m)cnt[m[1]]=(cnt[m[1]]||0)+1});
  const pcHere=LIB.via==='pc';const need=st?TS18.filter(([id])=>!st[id]||st[id].s==='none'||st[id].s==='err').length:0;
  let h=st?`<div class="tsmtop"><span>${esc(t('tsm.onPc',TS18.filter(([id])=>st[id]&&st[id].s==='ok').length,TS18.length))}</span>${need?`<button class="btn sm" data-tsma="all">${esc(t('tsm.all',need))}</button>`:''}${TSM.q.length?`<span class="muted">${esc(t('tsm.queue',TSM.q.length))}</span>`:''}</div>`
    :`<div class="tsmtop warn">${esc(why==='old'?t('ts.old'):t('tsm.noPc'))}</div>`;
  h+=TS18.map(([id,ar,en,mb])=>{const r='ts_'+id,s=st&&st[id]||{s:st?'none':'?'},n=cnt[r]||0,sv=TSM.save[id];
    const pc=s.s==='ok'?`<span class="tsmok">${esc(t('tsm.pcOk',Math.round(s.n/1e6)))}</span>`:s.s==='run'?`<span>${esc(t('ts.run',s.len?Math.floor(s.got/s.len*100):0))}</span>`:s.s==='?'?'':`<span class="muted">${esc(t('tsm.pcNo',mb))}</span>`;
    const dev=sv?`<span>${esc(t('tsm.saving',sv.d,604))}</span>`:n?`<span class="${n>=604?'tsmok':''}">${esc(t('tsm.dev',n))}</span>`:`<span class="muted">${esc(t('tsm.devNo'))}</span>`;
    const btns=[`<button class="btn sm ghost" data-tsma="open" data-id="${id}">${esc(t('tsm.open'))}</button>`];
    if(st&&(s.s==='none'||s.s==='err'))btns.push(`<button class="btn sm" data-tsma="get" data-id="${id}">${esc(t('ts.get'))}</button>`);
    if(s.s==='ok'&&n<604&&!sv)btns.push(`<button class="btn sm" data-tsma="save" data-id="${id}">${esc(t('tsm.save'))}</button>`);
    if(sv)btns.push(`<button class="btn sm ghost" data-tsma="stop" data-id="${id}">${esc(t('tsm.stop'))}</button>`);
    if(n&&!sv)btns.push(`<button class="btn sm ghost dng" data-tsma="dropdev" data-id="${id}">${esc(t('tsm.dropDev'))}</button>`);
    if(s.s==='ok'&&pcHere)btns.push(`<button class="btn sm ghost dng" data-tsma="droppc" data-id="${id}">${esc(t('tsm.dropPc'))}</button>`);
    return`<div class="tsmr"><b dir="auto">${esc(LANG==='ar'?ar:en)}</b><div class="tsmst"><span>${esc(t('tsm.pc'))}</span>${pc}<span>${esc(t('tsm.here'))}</span>${dev}</div><div class="tsmb">${btns.join('')}</div></div>`}).join('');
  box.innerHTML=h;
  box.querySelectorAll('[data-tsma]').forEach(b=>b.onclick=()=>tsMineAct(b.dataset.tsma,b.dataset.id,b))}
async function tsMineAct(a,id,b){const r='ts_'+id;
  if(a==='open'){try{$$('.modal.on').forEach(m=>m.classList.remove('on'))}catch(e){}showView('quran');qSetRiwaya(r);return}
  if(a==='get'){tsMineQueue([id]);return}
  if(a==='all'){const st=await tsList(true).catch(()=>null);if(!st)return;tsMineQueue(TS18.map(x=>x[0]).filter(i=>!st[i]||st[i].s==='none'||st[i].s==='err'));return}
  if(a==='save'){tsSaveAll(id);return}
  if(a==='stop'){if(TSM.save[id])TSM.save[id].stop=1;return}
  if(a==='dropdev'){if(!confirm(t('tsm.dropDevQ')))return;const ks=await tsKeysOf(r);for(const k of ks)await idbDel(k);if(S.quran.dl)delete S.quran.dl[r];save();toast(t('tsm.dropped'));tsMinePaint();return}
  if(a==='droppc'){if(!confirm(t('tsm.dropPcQ')))return;try{await libFetch(libU('/tsr/del?id='+id),6000)}catch(e){}TSR.stAt=0;delete TSR.doc[id];tsMinePaint();return}}
/* «download them all»: the PC fetches at most three at a time, the rest wait here */
function tsMineQueue(ids){ids.forEach(i=>{if(!TSM.q.includes(i))TSM.q.push(i)});tsMinePump();if(!TSM.qT)TSM.qT=setInterval(tsMinePump,5000)}
async function tsMinePump(){let st;try{st=await tsList(true)}catch(e){return}
  TSM.q=TSM.q.filter(i=>!(st[i]&&(st[i].s==='ok')));let run=TS18.filter(([i])=>st[i]&&st[i].s==='run').length;
  for(const i of [...TSM.q]){if(run>=3)break;if(st[i]&&st[i].s==='run')continue;try{const r=await libFetch(libU('/tsr/get?id='+i),8000);if(r.ok){run++;TSM.q=TSM.q.filter(x=>x!==i)}}catch(e){}}
  if(!TSM.q.length&&!run){clearInterval(TSM.qT);TSM.qT=null}tsMinePaint()}
/* keep a whole mushaf on this device (the pages drawn from the PC copy, one after another) */
async function tsSaveAll(id){if(TSM.save[id])return;const r='ts_'+id,o=TSM.save[id]={d:0,stop:0,f:0};tsMinePaint();
  for(let p=1;p<=604&&!o.stop;p++){try{await tsCache(r,p)}catch(e){o.f++;if(o.f>5)break}o.d=p;if(p%8===0){const row=$$('#tsmList [data-tsma="stop"]').find(x=>x.dataset.id===id);if(row){const sp=row.closest('.tsmr').querySelector('.tsmst span:last-child');if(sp)sp.textContent=t('tsm.saving',p,604)}}}
  delete TSM.save[id];if(!o.stop&&o.f<=5){S.quran.dl=S.quran.dl||{};S.quran.dl[r]=1;save();toast(t('tsm.saved'))}else if(!o.stop)toast(t('ts.off'));tsMinePaint()}
/* 2 · phones: the page cut to its frame (the PDF has wide side margins for notes); «هامش التيسير» shows them again */
const TSF={box:new Map()};
async function tsFrame(blob,key){key+=MOB.matches?':m':':d';let bb=TSF.box.get(key);const bm=await createImageBitmap(blob);
  if(bb===undefined){const w=240,h=Math.round(bm.height*w/bm.width),c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(bm,0,0,w,h);
    const d=x.getImageData(0,0,w,h).data,bg=[d[(2*w+2)*4],d[(2*w+2)*4+1],d[(2*w+2)*4+2]],ink=(i)=>Math.abs(d[i]-bg[0])+Math.abs(d[i+1]-bg[1])+Math.abs(d[i+2]-bg[2])>90;
    const col=new Array(w).fill(0);for(let y=0;y<h;y++)for(let x0=0;x0<w;x0++)if(ink((y*w+x0)*4))col[x0]++;
    const fr=[];for(let x0=0;x0<w;x0++)if(col[x0]>h*.5)fr.push(x0);bb=null;
    if(fr.length>=2&&fr[fr.length-1]-fr[0]>w*.4){const a=fr[0],z=fr[fr.length-1];let y0=h,y1=0;for(let y=0;y<h;y++)for(let x0=a;x0<=z;x0++)if(ink((y*w+x0)*4)){if(y<y0)y0=y;if(y>y1)y1=y;break}
      const px=w*(MOB.matches?.02:.10),py=h*.015;/* PC: a band each side for the margin notes (3.97, his «so small») */bb=[Math.max(0,(a-px)/w),Math.max(0,(y0-py)/h),Math.min(1,(z+px)/w),Math.min(1,(y1+py)/h)]}
    TSF.box.set(key,bb)}
  if(!bb){bm.close&&bm.close();return null}
  const sx=bb[0]*bm.width,sy=bb[1]*bm.height,sw=(bb[2]-bb[0])*bm.width,sh=(bb[3]-bb[1])*bm.height,c=document.createElement('canvas');c.width=Math.round(sw);c.height=Math.round(sh);
  c.getContext('2d').drawImage(bm,sx,sy,sw,sh,0,0,c.width,c.height);bm.close&&bm.close();const out=await new Promise(z=>c.toBlob(z,'image/jpeg',.86));c.width=c.height=0;return out}
function tsCrop(){return!S.quran.tsMargin}
{const _l=qLoadImg;qLoadImg=function(im,p,r){const R=RIWAYAT[r];if(!R||!R.ts||!tsCrop())return _l(im,p,r);im.onerror=null;im.classList.add('tsp');
  tsCache(r,p).then(async b=>{let out=b;if(typeof b!=='string'){try{out=await tsFrame(b,r+':'+p)||b}catch(e){}}im.src=typeof out==='string'?out:URL.createObjectURL(out);im.classList.add('tsfr')}).catch(e=>tsFailBox(im,p,r,e&&e.code||'off'))}}
/* 4 · the mushaf's own appendix (the usul of the reading and the closing pages after page 604) */
async function tsAppendix(id){const R=RIWAYAT['ts_'+id];let doc;try{doc=await tsDoc(id)}catch(e){toast(t(e&&e.code==='none'?'tsa.none':'ts.off'));return}
  const a=(TSR.off[id]||0)+605,z=doc.numPages;if(a>z){toast(t('tsa.empty'));return}
  openInfo(t('tsa.t',riwName('ts_'+id)),`<div class="tsap">${Array.from({length:z-a+1},(_,i)=>`<div class="tsapg" data-n="${a+i}"><span>${i+605}</span></div>`).join('')}</div>`);const b=$('#infoBox');if(b)b.classList.add('tsabox');
  const io=new IntersectionObserver(es=>es.forEach(async en=>{if(!en.isIntersecting)return;const el=en.target;io.unobserve(el);
    try{const pg=await doc.getPage(+el.dataset.n),v=pg.getViewport({scale:1}),vp=pg.getViewport({scale:Math.min(2,900/v.width)}),c=document.createElement('canvas');c.width=vp.width;c.height=vp.height;
      await pg.render({canvasContext:c.getContext('2d'),viewport:vp}).promise;el.innerHTML='';el.append(c)}catch(e){}}),{rootMargin:'600px'});
  $$('.tsapg').forEach(el=>io.observe(el))}
/* 6 · PC: two riwayat side by side — page p of this mushaf, and the same page of another */
const tsCmpOn=()=>{const Q=S.quran;return!!(Q.tsCmp&&RIWAYAT[Q.tsCmp]&&RIWAYAT[Q.tsCmp].kind==='img'&&(RIWAYAT[Q.riwaya]||{}).kind==='img'&&Q.tsCmp!==Q.riwaya&&!MOB.matches&&!document.documentElement.classList.contains('qfs-one'))};
{hookFn('renderQuran',()=>renderQuran,f=>{renderQuran=f},'post',function(){try{if(!tsCmpOn())return;const Q=S.quran,p=Q.view||1,sp=$('#spread');if(!sp||sp.classList.contains('one'))return;
  const l=sp.querySelector('.qpage.l');if(!l)return;
  l.outerHTML=`<div class="qpage l tscmp"><div class="qh"><span>${esc(riwName(Q.tsCmp))}</span><button class="qbtn" id="tscX">${esc(t('tsc.off'))}</button></div><div class="qimg"><img data-cp="${p}" class="scan" alt=""></div><div class="qf"><span class="qn">${p}</span></div></div>`;
  const im=sp.querySelector('img[data-cp]');qLoadImg(im,p,Q.tsCmp);$('#tscX').onclick=()=>{delete S.quran.tsCmp;save();renderQuran()}}catch(e){console.error(e)}})}
{const _s=qShowSilent;qShowSilent=function(p){if(!tsCmpOn())return _s(p);p=Math.max(1,Math.min(604,p));S.quran.view=p;S.quran.pv=p}}
{const _st=qStep;qStep=function(d){if(!tsCmpOn())return _st(d);qShow((S.quran.view||1)+d)}}
function tsCmpMenu(anchor){const Q=S.quran,ks=Object.keys(RIWAYAT).filter(k=>RIWAYAT[k].kind==='img'&&k!==Q.riwaya&&!RIWAYAT[k].custom);
  openInfo(t('tsc.t'),`<p class="muted">${esc(t('tsc.sub'))}</p><div class="tscl">${ks.map(k=>`<button class="btn sm ${Q.tsCmp===k?'pri':'ghost'}" data-tsc="${k}">${esc(riwName(k))}</button>`).join('')}</div>${Q.tsCmp?`<button class="btn sm ghost dng" data-tsc="">${esc(t('tsc.off'))}</button>`:''}`);
  $$('[data-tsc]').forEach(b=>b.onclick=()=>{const v=b.dataset.tsc;if(v)S.quran.tsCmp=v;else delete S.quran.tsCmp;save();try{$$('.modal.on').forEach(m=>m.classList.remove('on'))}catch(e){}renderQuran()})}
/* the «⋯» sheet: my mushafs (always), and for a Taysir mushaf its appendix, the margins (phones) and side by side (PC) */
{hookFn('qbLayout',()=>qbLayout,f=>{qbLayout=f},'post',function(){try{const tb=$('#qbTools .qbshb');if(!tb||$('#tsmBtn'))return;const g=$('#qbmBtn')||$('#qbGoTo');
  const h=`<button class="btn sm ghost qbtool" id="tsmBtn" data-qbl="1">📚<small>${esc(t('tsm.t'))}</small></button><button class="btn sm ghost qbtool" id="tsaBtn" data-qbl="1">📑<small>${esc(t('tsa.b'))}</small></button><button class="btn sm ghost qbtool" id="tshBtn" data-qbl="1">✂<small>${esc(t('tsh.b'))}</small></button><button class="btn sm ghost qbtool" id="tscBtn" data-qbl="1">↔<small>${esc(t('tsc.b'))}</small></button>`;
  if(g)g.insertAdjacentHTML('afterend',h);else tb.insertAdjacentHTML('afterbegin',h);
  $('#tsmBtn').onclick=()=>setTimeout(tsMineOpen,20);$('#tsaBtn').onclick=()=>{const R=RIWAYAT[S.quran.riwaya];if(R&&R.ts)setTimeout(()=>tsAppendix(R.ts),20)};
  $('#tshBtn').onclick=()=>{S.quran.tsMargin=!S.quran.tsMargin;save();renderQuran();toast(t(S.quran.tsMargin?'tsh.on':'tsh.off'))};$('#tscBtn').onclick=()=>setTimeout(tsCmpMenu,20);tsBtns()}catch(e){console.error(e)}})}
function tsBtns(){const R=RIWAYAT[S.quran.riwaya]||{},ts=!!R.ts;const s=(id,v)=>{const e=$(id);if(e)e.hidden=!v};s('#tsaBtn',ts);s('#tshBtn',ts);s('#tscBtn',R.kind==='img'&&!MOB.matches);
  const h=$('#tshBtn small');if(h)h.textContent=t(S.quran.tsMargin?'tsh.hide':'tsh.b')}
{hookFn('renderQuran',()=>renderQuran,f=>{renderQuran=f},'post',function(){try{tsBtns()}catch(e){}})}
{const _cc=cmdCommands;cmdCommands=function(){const L_=_cc();L_.push({icon:'📚',label:t('tsm.t'),run:()=>{showView('quran');tsMineOpen()},kw:'taysir mushaf qiraat تيسير مصاحف قراءات'});return L_}}

