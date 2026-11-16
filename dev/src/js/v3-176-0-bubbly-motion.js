/* ============ v3.176.0 his pick «ج · قوية» (2026-11-16): bubbly motion — the contents of a window or menu arrive one after another ============ */
/* The curves and shapes are in the CSS part (the 3.173 tokens now bounce, so every retimed rule and JS animation follows).
   apmOrigin runs exactly once when a window, menu or drop-down opens: that is the moment its children get the stagger class;
   it leaves after 0.8 s, so later repaints of an open menu do not animate again. */
function bubStagger(el){if(!el||!el.classList||apmRM())return;el.classList.add('bubst');clearTimeout(el._bubT);el._bubT=setTimeout(()=>el.classList.remove('bubst'),800)}
hookFn('apmOrigin',()=>apmOrigin,f=>{apmOrigin=f},'post',function(el){bubStagger(el)});

/* ---- 3.176.1 (his note 2026-11-16 «moving from page to page is sudden; the buttons of Today have no motion when pressed») ----
   (1) pages: the page that opens arrives card by card (45 ms apart, the first eight, reading order) from the side of the tab you went to
       (from the right or left on the phone bar, mirrored in Arabic; from above or below on the PC rail), with a small fade and scale;
       the new tab's icon pops. Never on .view; a block that holds glass cards slides and scales without fading (a fading parent breaks their blur).
       A second tap in the middle finishes the first entrance at once.
   (2) presses: CSS :active alone showed nothing on a quick tap (phones apply it late, and many buttons are redrawn by their own click),
       so the squash is played by script on every button-like element: down at once, back with the snappy spring; a quick tap still dips
       fully first; a redrawn button (same id) gets the release on its new copy; a drag or scroll lets go without a bounce. */
const BPG={an:[],was:null};
function bubPage(v,was){
  const H=document.documentElement;if(!was||was===v||H.classList.contains('lite'))return;
  BPG.an.forEach(a=>{try{a.finish()}catch(e){}});BPG.an=[];
  const view=document.getElementById('v-'+v);if(!view)return;
  const rm=apmRM(),vh=innerHeight,nav=document.querySelector('.navpill');let horiz=true;
  if(nav){const r=nav.getBoundingClientRect();if(r.width&&r.height)horiz=r.width>=r.height}
  const fw=NAV_ORD.indexOf(v)>NAV_ORD.indexOf(was),d=fw?1:-1,rtl=getComputedStyle(H).direction==='rtl';
  const tr=horiz?((rtl?-d:d)*30)+'px 0px':'0px '+(d*22)+'px';
  let els=[...view.children].filter(c=>c.offsetWidth&&!/^(SCRIPT|STYLE)$/.test(c.tagName));
  if(!els.length&&!bubPage._r){bubPage._r=1;setTimeout(()=>{try{if(curView()===v)bubPage(v,was)}finally{bubPage._r=0}},40);return}
  const R=new Map();els=els.filter(c=>{const r=c.getBoundingClientRect();R.set(c,r);return r.bottom>0&&r.top<vh&&getComputedStyle(c).position!=='fixed'});
  const tall=(c,dp)=>{const r=R.get(c)||c.getBoundingClientRect();if(dp>3||r.height<=vh*.45)return[c];const k=[...c.children].filter(x=>{if(!x.offsetWidth||/^(SCRIPT|STYLE)$/.test(x.tagName))return false;const q=x.getBoundingClientRect();R.set(x,q);return q.bottom>0&&q.top<vh&&q.height>8});
    return k.length&&k.length<=8?k.flatMap(x=>tall(x,dp+1)):[c]};   /* taller than half the screen: comes in by its rows; a grid of many (month cells) stays one piece */
  els=els.flatMap(c=>tall(c,0)).filter(c=>getComputedStyle(c).position!=='fixed');
  els.sort((a,b)=>{const p=R.get(a),q=R.get(b);if(Math.abs(p.top-q.top)>24)return p.top-q.top;return rtl?q.right-p.right:p.left-q.left});
  els.forEach((c,i)=>{const a=rm?(c.querySelector('.card')?null:apmAnim(c,[{opacity:0},{opacity:1}],{duration:160,easing:'ease-out',fill:'backwards'}))
    :apmAnim(c,c.querySelector('.card')?[{translate:tr,scale:.96},{translate:'0px 0px',scale:1}]:[{opacity:0,translate:tr,scale:.96},{opacity:1,translate:'0px 0px',scale:1}],{duration:480,delay:Math.min(i,7)*45,fill:'backwards'});if(a)BPG.an.push(a)});
  const ic=!rm&&document.querySelector('.navbtn.on svg');if(ic){const a=apmAnim(ic,[{scale:.55},{scale:1}],{duration:560,easing:apmCurve('bouncy')});if(a)BPG.an.push(a)}}
hookFn('showView',()=>showView,f=>{showView=f},'pre',function(){try{BPG.was=curView()}catch(e){BPG.was=null}});
hookFn('showView',()=>showView,f=>{showView=f},'post',function(v){try{bubPage(v,BPG.was)}catch(e){}});

const BUB_PRESS='button,.btn,.chip,[role=button],.qck,.suitem,.navbtn,.link,.tt,.mcd,.pdl-add,.sadd,.tkm,.tkxb,.tmx,.del';
const BUB_SKIP='.ck,.tmvgrip,.sw-toggle,input,select,textarea,[draggable=true],.bworld,.pp,[disabled],.mdx0';
const BP={el:null,a:null,t:0,x:0,y:0};
function bubSq(e){const r=e.getBoundingClientRect(),z=r.width*r.height;return z<2600?.86:r.width>260||r.height>90?.97:.92}
function bubCur(e){const s=parseFloat(getComputedStyle(e).scale);return isFinite(s)?s:1}
function bubRelease(e,quick,from){const s=e._bubS||.92;const kf=quick?[{scale:from,easing:'cubic-bezier(.2,0,.4,1)'},{scale:s,offset:.13,easing:apmCurve('snappy')},{scale:1}]:[{scale:from},{scale:1}];
  return apmAnim(e,kf,quick?{duration:620,easing:'linear'}:{duration:520,easing:apmCurve('snappy')})}
function bubPressEnd(moved){const e=BP.el;if(!e)return;BP.el=null;const from=bubCur(e);if(BP.a)try{BP.a.cancel()}catch(x){}BP.a=null;
  if(moved){apmAnim(e,[{scale:from},{scale:1}],{duration:220,easing:apmCurve('out')});return}
  const quick=performance.now()-BP.t<120;bubRelease(e,quick,from);
  if(e.id){const id=e.id,chk=()=>{if(e.isConnected)return;const n=document.getElementById(id);if(n&&!n._bubR){n._bubS=e._bubS;n._bubR=1;bubRelease(n,quick,quick?1:e._bubS);setTimeout(()=>{n._bubR=0},700)}};setTimeout(chk,0);setTimeout(chk,80)}}
document.addEventListener('pointerdown',ev=>{if(ev.button!==0||apmRM())return;const t=ev.target;if(!t||!t.closest)return;const e=t.closest(BUB_PRESS);if(!e||e.closest(BUB_SKIP))return;
  if(BP.el)bubPressEnd(true);e._bubS=bubSq(e);BP.el=e;BP.t=performance.now();BP.x=ev.clientX;BP.y=ev.clientY;
  BP.a=apmAnim(e,[{scale:bubCur(e)},{scale:e._bubS}],{duration:90,easing:'cubic-bezier(.2,0,.4,1)',fill:'forwards'})},true);
addEventListener('pointerup',()=>bubPressEnd(false),true);
addEventListener('pointercancel',()=>bubPressEnd(true),true);
addEventListener('pointermove',ev=>{if(BP.el&&Math.hypot(ev.clientX-BP.x,ev.clientY-BP.y)>10)bubPressEnd(true)},{capture:true,passive:true});
document.documentElement.classList.add('bjs');
