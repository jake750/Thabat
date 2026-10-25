/* ============ 3.113 tenth list G: theme colours taken from a picture, a short tour of each page the first time it opens ============ */
/* 10th-79: thPic(cb) reads a picture and gives {acc, water, sh}: the main and second vivid hues (kept readable), the surface hue from the whole picture */
function thHsl(r,g,b){r/=255;g/=255;b/=255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2;let h=0,s=0;if(mx!==mn){const d=mx-mn;s=l>.5?d/(2-mx-mn):d/(mx+mn);h=mx===r?(g-b)/d+(g<b?6:0):mx===g?(b-r)/d+2:(r-g)/d+4;h*=60}return[h,s,l]}
function thHex(h,s,l){const k=n=>(n+h/30)%12,a=s*Math.min(l,1-l),f=n=>l-a*Math.max(-1,Math.min(k(n)-3,9-k(n),1));return'#'+[f(0),f(8),f(4)].map(x=>Math.round(x*255).toString(16).padStart(2,'0')).join('')}
function thPicAnalyse(img){const c=document.createElement('canvas'),W=72,H=Math.max(1,Math.round(72*img.naturalHeight/Math.max(1,img.naturalWidth)));c.width=W;c.height=H;const x=c.getContext('2d');x.drawImage(img,0,0,W,H);const d=x.getImageData(0,0,W,H).data;
  const bins=Array.from({length:36},()=>({w:0,s:0,l:0,n:0})),all=Array(36).fill(0);
  for(let i=0;i<d.length;i+=4){if(d[i+3]<128)continue;const[h,s,l]=thHsl(d[i],d[i+1],d[i+2]),bi=Math.floor(h/10)%36;if(s>.08&&l>.08&&l<.94)all[bi]+=s;if(s<.22||l<.24||l>.9)continue;const B=bins[bi],w=s*(1-Math.abs(l-.5));B.w+=w;B.s+=s;B.l+=l;B.n++}
  const order=bins.map((b,i)=>({...b,i})).filter(b=>b.n).sort((a,b)=>b.w-a.w);
  const col=b=>{const h=b.i*10+5,s=Math.max(.5,Math.min(.85,b.s/b.n)),l=Math.max(.52,Math.min(.66,b.l/b.n));return thHex(h,s,l)};
  const shBin=all.indexOf(Math.max(...all)),sh=all[shBin]>0?shBin*10+5:220;
  if(!order.length)return{acc:thHex(sh,.55,.6),sh};const a=order[0],b2=order.find(b=>{const dh=Math.abs(b.i-a.i)*10;return Math.min(dh,360-dh)>=40});
  return{acc:col(a),water:b2?col(b2):thHex((a.i*10+35)%360,.6,.6),sh}}
function thPic(cb){const inp=document.createElement('input');inp.type='file';inp.accept='image/*';inp.style.display='none';document.body.append(inp);
  inp.onchange=()=>{const f=inp.files[0];inp.remove();if(!f)return;const u=URL.createObjectURL(f),im=new Image();im.onload=()=>{try{const r=thPicAnalyse(im);cb(r);toast(t('thp.ok'))}catch(e){console.error(e);toast(t('thp.bad'))}URL.revokeObjectURL(u)};im.onerror=()=>{toast(t('thp.bad'));URL.revokeObjectURL(u)};im.src=u};inp.click()}

/* 10th-83: a short tour of a page the first time it is opened (localStorage['thabat.ptour'] = pages seen); also «جولة في هذه الصفحة» in Ctrl+K */
const PTOUR={today:[{sel:'#gscene,#wall',k:'ptr.td1'},{sel:'#taskIn',k:'ptr.td2'},{sel:'#pdlCard',k:'ptr.td3'}],
  quran:[{sel:'#qbPos',k:'ptr.q1'},{sel:'#qbMore',k:'ptr.q2'},{sel:'#spread',k:'ptr.q3'}],
  cal:[{sel:'#cal',k:'ptr.c1'},{sel:'#calWkBtn',k:'ptr.c2'},{sel:'#detail',k:'ptr.c3'}],
  notes:[{sel:'#nNew',k:'ptr.n1'},{sel:'#nSearch',k:'ptr.n2'},{sel:'#nfBar',k:'ptr.n3'}],
  lib:[{sel:'#lpath',k:'ptr.l1'},{sel:'#lselBtn',k:'ptr.l2'}],
  brief:[{sel:'#bSeg',k:'ptr.b1'},{sel:'#btTools',k:'ptr.b2'}],
  boards:[{sel:'#wbIns',k:'ptr.w1'},{sel:'#wbTpl',k:'ptr.w2'}]};
function ptrSeen(){try{return JSON.parse(localStorage['thabat.ptour']||'{}')}catch(e){return{}}}
function ptrMark(v){try{const s=ptrSeen();s[v]=1;localStorage['thabat.ptour']=JSON.stringify(s)}catch(e){}}
function ptrRun(v){const st=PTOUR[v||curView()];if(!st){toast(t('ptr.none'));return}ptrMark(v||curView());wntRun(st.map(s=>({sel:s.sel.split(',').find(q=>{const e=$(q);return e&&e.offsetParent!==null})||s.sel.split(',')[0],k:s.k})))}
/* people who already used Thabat before this version know their pages: mark them all once */
try{if(!localStorage['thabat.ptour']&&Object.keys(S.days||{}).length>3)localStorage['thabat.ptour']=JSON.stringify(Object.fromEntries(Object.keys(PTOUR).map(k=>[k,1])))}catch(e){}
{hookFn('showView',()=>showView,f=>{showView=f},'post',function(v){try{if(!PTOUR[v]||ptrSeen()[v]||S._demo||$('#setupModal.on'))return;
  setTimeout(()=>{if(curView()!==v||ptrSeen()[v]||$('.modal.on')||$('#wntOv'))return;ptrRun(v)},900)}catch(e){}})}
{const _cc=cmdCommands;cmdCommands=function(...a){const L_=_cc(...a);try{L_.push({icon:'🧭',label:t('ptr.cmd'),run:()=>ptrRun(curView()),kw:'tour guide page جولة دليل الصفحة'})}catch(e){}return L_}}
