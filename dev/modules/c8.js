/* ============ v3.2.4: smooth mushaf pages, odd/even edge marks, full-screen reading time, bottom-bar offset ============ */
/* odd page → two small lines on the right edge, even page → on the left edge (single-page view) */
{const _qpe=qPageEl;qPageEl=function(p,side){const h=_qpe(p,side);if(!/\bone\b/.test(side||'')||!(p>=1&&p<=604))return h;const i=h.indexOf('>');return h.slice(0,i+1)+`<i class="qedge ${p%2?'r':'l'}" aria-hidden="true"></i>`+h.slice(i+1)}}
/* two-page view: slide the spread in instead of an instant swap */
{const _qst=qStep;qStep=function(d){const one=!!$('#spread .strack');_qst(d);if(one)return;const sp=$('#spread');if(!sp||!sp.animate)return;try{sp.animate([{opacity:.35,transform:`translate3d(${d>0?-36:36}px,0,0)`},{opacity:1,transform:'none'}],{duration:260,easing:'cubic-bezier(.2,.8,.2,1)'})}catch(e){}}}
/* decode neighbouring page images ahead of time so the slide never stutters */
{const _qli=qLoadImg;qLoadImg=function(im,p,r){im.decoding='async';im.addEventListener('load',()=>{try{im.decode&&im.decode().catch(()=>{})}catch(e){}},{once:true});_qli(im,p,r)}}
/* reading time in full screen → today's productivity as Quran */
const QFT_IDLE=5*6e4;
function qftCat(){if(catRaw('quran'))return'quran';const cs=S.settings.categories,c=cs.find(x=>!x.parent&&/قرآن|quran/i.test(x.name||''));if(c)return c.id;cs.push({id:'quran',name:LANG==='ar'?'قرآن':'Quran',color:'#eb6834'});return'quran'}
function qftStart(){if(S.settings.qfsTime===false)return;const n=Date.now();S.qfsT={iv:[],seg:n,last:n};save();qftUi()}
function qftCut(now){const q=S.qfsT;if(!q||!q.seg)return;const end=Math.min(now,q.last+QFT_IDLE);if(end-q.seg>=1000)q.iv.push([q.seg,end]);q.seg=null}
function qftAct(){const q=S.qfsT;if(!q)return;const n=Date.now();if(q.seg&&n-q.last>QFT_IDLE)qftCut(n);if(!q.seg)q.seg=n;q.last=n}
function qftTotal(){const q=S.qfsT;if(!q)return 0;let s=q.iv.reduce((a,x)=>a+x[1]-x[0],0);if(q.seg)s+=Math.min(Date.now(),q.last+QFT_IDLE)-q.seg;return Math.max(0,s)}
function qftFinish(){const q=S.qfsT;if(!q)return;qftCut(Date.now());S.qfsT=null;const tot=q.iv.reduce((a,x)=>a+x[1]-x[0],0);
  if(tot<6e4){save();return}if(S.timer&&S.timer.mode==='work'){save();toast(t('qft.skip'));return}
  const cat=qftCat();q.iv.forEach(([s,e])=>addSession(cat,s,e,{src:'mushaf'}));save();try{renderGlass();renderLog()}catch(e){}try{renderToday()}catch(e){}toast(t('qft.saved',fmtHM(tot)))}
function qftUi(){const el=$('#qFsTm');if(!el)return;const on=!!S.qfsT;el.hidden=!on;if(on){const m=Math.floor(qftTotal()/6e4);el.textContent='⏱ '+(m<1?'<1':fmtHM(m*6e4))}}
{const _qfs=qFs;qFs=function(on){const h=document.documentElement,was=h.classList.contains('qfs');_qfs(on);if(on&&!was)qftStart();else if(!on&&was)qftFinish()}}
{let lastA=0;const act=()=>{if(!S.qfsT||!document.documentElement.classList.contains('qfs'))return;const n=Date.now();if(n-lastA<4000)return;lastA=n;qftAct()};['touchstart','keydown','wheel','pointerdown'].forEach(ev=>document.addEventListener(ev,act,{passive:true,capture:true})) }
document.addEventListener('visibilitychange',()=>{if(!S.qfsT)return;if(document.hidden){qftCut(Date.now());save()}else if(document.documentElement.classList.contains('qfs'))qftAct()});
setInterval(()=>{if(!S.qfsT)return;if(!document.documentElement.classList.contains('qfs')){qftFinish();return}save();qftUi()},30000);
setTimeout(()=>{if(S.qfsT&&!document.documentElement.classList.contains('qfs'))qftFinish()},3000);
{const fu=$('#qFsUi'),pg=$('#qFsPg');if(fu&&pg&&!$('#qFsTm'))pg.insertAdjacentHTML('afterend','<span class="qfspg qfstm" id="qFsTm" hidden></span>')}
{const _qfu=qFs;qFs=function(on){_qfu(on);qftUi()}}
/* Android: optional manual lift of the bottom bar */
function andOffApply(){document.documentElement.style.setProperty('--andman',(+S.settings.andOff||0)+'px')}
andOffApply();
function renderV44Set(){const st=S.settings,se=$('#andOffSel');if(se){se.innerHTML=[0,12,24,36,48,64].map(v=>`<option value="${v}" ${(+st.andOff||0)===v?'selected':''}>${v?'+'+v:t('and.auto')}</option>`).join('');se.onchange=()=>{st.andOff=+se.value;save();andOffApply()}}
  const qt=$('#qftT');if(qt)toggle(qt,st.qfsTime!==false,v=>{st.qfsTime=v})}
{const _rs18=renderSettings;renderSettings=function(){_rs18();try{renderV44Set()}catch(e){console.error(e)}}}
