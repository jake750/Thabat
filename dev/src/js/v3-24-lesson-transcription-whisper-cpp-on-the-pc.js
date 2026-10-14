/* ============ v3.24: lesson transcription — whisper.cpp on the PC writes what was said with its times; the player shows it beside the video (tap a sentence to jump there), and the library search finds words inside lessons ============ */
const TRX={cache:{},poll:0,q:'',busy:false};
function trxOpt(){try{return Object.assign({m:'small',l:'auto'},JSON.parse(localStorage.getItem('thabat.trOpt')||'{}'))}catch(e){return{m:'small',l:'auto'}}}
function trxOptSet(o){try{localStorage.setItem('thabat.trOpt',JSON.stringify(o))}catch(e){}}
async function trxState(ids){try{const r=await libFetch(libU('/tr/state?ids='+ids.join(',')),5000);return r.ok?await r.json():null}catch(e){return null}}
async function trxGet(id){if(TRX.cache[id])return TRX.cache[id];try{const r=await libFetch(libU('/tr/get?id='+id),10000);if(!r.ok)return null;const j=await r.json();if(j&&j.segs)TRX.cache[id]=j;return j}catch(e){return null}}
const trxTC=ms=>fmtTC(Math.floor(ms/1000));
/* the tab in the player */
{hookFn('lpvBuild',()=>lpvBuild,f=>{lpvBuild=f},'post',function(...a){try{const tabs=$('#libPlayer .lpvtabs');if(tabs&&!tabs.querySelector('[data-tab="tr"]')){tabs.insertAdjacentHTML('beforeend',`<button data-tab="tr" role="tab">${t('trx.tab')}</button>`);tabs.querySelector('[data-tab="tr"]').onclick=()=>{LPV.tab='tr';lpvSide()}}}catch(e){console.error(e)}})}
{hookFn('lpvSide',()=>lpvSide,f=>{lpvSide=f},'post',function(...a){try{const b=$('#libPlayer .lpvtabs [data-tab="tr"]');if(b){b.textContent=t('trx.tab');b.classList.toggle('on',LPV.tab==='tr');b.setAttribute('aria-selected',LPV.tab==='tr')}if(LPV.tab==='tr')trxPaint();else clearTimeout(TRX.poll)}catch(e){console.error(e)}})}
async function trxPaint(){const body=$('#lpvBody'),it=LIB.cur;if(!body||!it||LPV.tab!=='tr')return;const id=it.id;clearTimeout(TRX.poll);
  if(!TRX.cache[id])body.innerHTML=`<p class="lpvempty">${t('trx.loading')}</p>`;
  const st=TRX.cache[id]?null:await trxState([id]);if(LPV.tab!=='tr'||!LIB.cur||LIB.cur.id!==id)return;
  if(TRX.cache[id]||(st&&st.items&&st.items[id]&&st.items[id].done)){const j=await trxGet(id);if(LPV.tab!=='tr'||!LIB.cur||LIB.cur.id!==id)return;if(j&&j.segs){trxShow(body,id,j);return}}
  if(!st){body.innerHTML=`<p class="lpvempty">${t('trx.off')}</p>`;return}
  const me=(st.items||{})[id]||{},s=me.st||{},inst=st.inst||{},ready=inst.exe&&inst.ff&&(inst.small||inst.medium);
  if(me.pos>=0||s.s==='run'||s.s==='audio'||s.s==='wait'){const msg=s.s==='run'?t('trx.run',s.p||0):s.s==='audio'?t('trx.audio'):me.pos>0?t('trx.wait',me.pos):t('trx.start');
    body.innerHTML=`<div class="trxbox"><div class="trxprog"><i style="width:${s.s==='run'?(s.p||0):s.s==='audio'?3:0}%"></i></div><p>${msg}</p><p class="trxsm">${t('trx.bg')}</p><button class="lpvadd" id="trxCancel">✕ ${t('trx.cancel')}</button></div>`;
    $('#trxCancel').onclick=async()=>{await libFetch(libU('/tr/cancel?id='+id),5000).catch(()=>{});trxPaint()};
    TRX.poll=setTimeout(trxPaint,3000);return}
  if(!ready){const loc=LIB.via==='pc';const ins=st.install||{};
    if(ins.s==='run'){body.innerHTML=`<div class="trxbox"><div class="trxprog"><i class="ind"></i></div><p>${t('trx.installing',ins.w==='medium'?'medium':ins.w==='small'?'small':'whisper')}</p></div>`;TRX.poll=setTimeout(trxPaint,4000);return}
    body.innerHTML=`<div class="trxbox"><p>${t('trx.need')}</p>${!inst.ff?`<p class="trxsm">${t('trx.noff')}</p>`:''}${loc?`<button class="lpvadd" id="trxInst">⤓ ${t('trx.install')}</button><p class="trxsm">${t('trx.size')}</p>`:`<p class="trxsm">${t('trx.onPc')}</p>`}${ins.s==='err'?`<p class="trxerr">${t('trx.instErr')}</p>`:''}</div>`;
    const b=$('#trxInst');if(b)b.onclick=async()=>{await libFetch(libU('/tr/install?m=small'),5000).catch(()=>{});trxPaint()};return}
  const o=trxOpt(),n=it.list.length;
  body.innerHTML=`<div class="trxbox"><p>${t('trx.intro')}</p>
    <div class="trxrow"><span>${t('trx.model')}</span><div class="trxseg">${['small','medium'].map(m=>`<button data-m="${m}" class="${o.m===m?'on':''}" ${inst[m]?'':'disabled'}>${t('trx.m.'+m)}</button>`).join('')}</div></div>
    ${!inst.medium&&LIB.via==='pc'?`<button class="trxlink" id="trxMed">⤓ ${t('trx.getMed')}</button>`:''}
    <div class="trxrow"><span>${t('trx.lang')}</span><select class="in" id="trxLang">${['auto','ar','en','fr'].map(l=>`<option value="${l}" ${o.l===l?'selected':''}>${t('trx.l.'+l)}</option>`).join('')}</select></div>
    <button class="lpvadd trxgo" id="trxOne">🗣 ${t('trx.one')}</button>${n>1?`<button class="lpvadd" id="trxAll">${t('trx.all',n)}</button>`:''}
    <p class="trxsm">${s.s==='err'?`<span class="trxerr">${t('trx.err')}</span> `:''}${t('trx.note')}</p></div>`;
  body.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{if(b.disabled)return;o.m=b.dataset.m;trxOptSet(o);body.querySelectorAll('[data-m]').forEach(x=>x.classList.toggle('on',x===b))});
  $('#trxLang').onchange=e=>{o.l=e.target.value;trxOptSet(o)};
  const md=$('#trxMed');if(md)md.onclick=async()=>{await libFetch(libU('/tr/install?m=medium'),5000).catch(()=>{});toast(t('trx.medStarted'))};
  const go=async ids=>{if(!(inst[o.m]))o.m=inst.small?'small':'medium';const r=await libFetch(libU(`/tr/start?ids=${ids.join(',')}&m=${o.m}&l=${o.l}`),8000).catch(()=>null);if(!r||!r.ok){toast(t('trx.off'));return}trxPaint()};
  $('#trxOne').onclick=()=>go([id]);const all=$('#trxAll');if(all)all.onclick=()=>go([id,...it.list.filter(x=>x.id!==id).map(x=>x.id)])}
function trxShow(body,id,j){const segs=j.segs;
  body.innerHTML=`<div class="trxtop"><input class="in" id="trxQ" type="search" dir="auto" placeholder="🔍 ${esc(t('trx.find'))}" value="${esc(TRX.q)}"><button class="lpvnx" id="trxMore" aria-label="⋯">⋯</button></div><div class="trxlist" id="trxList">${segs.map((s,i)=>`<button class="trxs" data-i="${i}" data-f="${s[0]}"><span class="trxt" dir="ltr">${trxTC(s[0])}</span><span class="trxx" dir="auto">${esc(s[2])}</span></button>`).join('')}</div>`;
  const list=$('#trxList'),v=$('#lvV');
  list.onclick=e=>{const b=e.target.closest('.trxs');if(!b||!v)return;v.currentTime=(+b.dataset.f)/1000;v.play().catch(()=>{})};
  const filt=()=>{const q=lshNorm(TRX.q=$('#trxQ').value.trim());list.querySelectorAll('.trxs').forEach(b=>{b.hidden=!!q&&!lshNorm(b.querySelector('.trxx').textContent).includes(q)})};$('#trxQ').oninput=filt;filt();
  $('#trxMore').onclick=e=>{const p=lshMenu(e.currentTarget,`<button data-a="copy">📋 ${t('trx.copy')}</button><button data-a="note">📝 ${t('trx.toNote')}</button><button data-a="redo">↻ ${t('trx.redo')}</button>`);
    p.querySelector('[data-a="copy"]').onclick=()=>{closePP();const txt=segs.map(s=>`[${trxTC(s[0])}] ${s[2]}`).join('\n');try{navigator.clipboard.writeText(txt);toast(t('trx.copied'))}catch(_){}};
    p.querySelector('[data-a="note"]').onclick=()=>{closePP();const it=LIB.cur;if(!it)return;const n=lpvNoteOf(id)||(()=>{const x={id:uid(),title:'🎬 '+(lrnName(id)||libTitle(it.n)),body:'#'+t('lpv.tag')+'\n',day:todayKey(),imgs:[],created:Date.now(),lib:id,libC:it.course.n};NOTES().push(x);return x})();n.body+=`\n## ${t('trx.tab')}\n`+segs.map(s=>`- [${trxTC(s[0])}] ${s[2]}`).join('\n')+'\n';n.updated=Date.now();save();toast(t('trx.noted'))};
    p.querySelector('[data-a="redo"]').onclick=async()=>{closePP();await libFetch(libU('/tr/del?id='+id),5000).catch(()=>{});delete TRX.cache[id];trxPaint()}};
  trxFollow()}
/* the sentence being said is highlighted and kept in view */
function trxFollow(){const v=$('#lvV');if(!v||v._trx)return;v._trx=1;v.addEventListener('timeupdate',()=>{if(LPV.tab!=='tr')return;const list=$('#trxList');if(!list)return;const ms=v.currentTime*1000,bs=list.querySelectorAll('.trxs');let cur=null;
  for(const b of bs){if(+b.dataset.f<=ms)cur=b;else break}
  const was=list.querySelector('.trxs.on');if(was!==cur){if(was)was.classList.remove('on');if(cur){cur.classList.add('on');if(!list.matches(':hover')&&!TRX.q){const r=cur.getBoundingClientRect(),R=list.getBoundingClientRect();if(r.top<R.top||r.bottom>R.bottom)list.scrollTop+=r.top-R.top-R.height/3}}}})}
/* words are compared without diacritics, tatweel or the different alef / taa marbuta / alef maqsura forms */
/* the same normalisation, remembering where each kept character came from (to show the original text around a match) */
function lshNormMap(x){x=String(x||'');const map=[];let n='';for(let i=0;i<x.length;i++){const c=lshNorm(x[i]);if(!c)continue;for(const ch of c){n+=ch;map.push(i)}}return{n,map}}
function lshNorm(x){return String(x||'').replace(/[ً-ٰٟـ]/g,'').replace(/[آأإٱ]/g,'ا').replace(/ة/g,'ه').replace(/[ىیي]/g,'ي').replace(/[ھہ]/g,'ه').replace(/ک/g,'ك').toLowerCase()}
/* library search: what was said in the lessons */
{const _ls=lshSearch;lshSearch=function(q,...a){const h=_ls(q,...a);if(!LIB.base||q.length<2)return h;clearTimeout(TRX.st);TRX.st=setTimeout(()=>trxHits(q),350);return h+`<div id="trxHits"></div>`}}
async function trxHits(q){let j=null;try{const r=await libFetch(libU('/tr/search?q='+encodeURIComponent(q)),8000);if(r.ok)j=await r.json()}catch(e){}const box=$('#trxHits');if(!box||!j||!(j.hits||[]).length||(LIBX.q||'').trim()!==q)return;
  box.innerHTML=`<h4 class="lbfh">🗣 ${t('trx.said')}</h4><div class="trxhits">${j.hits.map(h=>{const n=libFind(h.id);return n?`<button class="trxh" data-id="${h.id}" data-f="${h.f}"><b dir="auto">${esc(lrnName(h.id)||libTitle(n.n))}</b><span><i dir="ltr">${trxTC(h.f)}</i> <span dir="auto">${esc(h.x)}</span></span></button>`:''}).join('')}</div>`;
  const hint=$('#lshBody > .lshhint');if(hint)hint.remove();
  box.querySelectorAll('.trxh').forEach(b=>b.onclick=()=>lpvOpenAt(b.dataset.id,(+b.dataset.f)/1000))}

