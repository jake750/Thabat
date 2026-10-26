/* ============ v3.128.0 (g151): the countdowns widget on the phone (shell 43, Widget9) ============ */
/* cdnPush sends the pinned countdowns (or all, when none is pinned) with their next target time; the widget works out the days
   itself, so it stays right between app opens. A tap on the widget opens the countdowns window (open=cdn). */
const CDNW={last:''};
function cdnPush(){if(!ANDROID||andV()<13)return;try{const all=CDNS(),L_=(all.some(c=>c.pin)?all.filter(c=>c.pin):all).map(c=>({c,T:cdnTarget(c)}));
  L_.sort((a,b)=>a.T.ms-b.T.ms);
  const o={items:L_.slice(0,6).map(({c,T})=>({n:c.n,ms:T.ms,col:c.col||CDN_COLS[0],w:gStr(keyToDate(T.k))+(c.tm?' · '+c.tm:'')})),lbl:{d:t('cdn.u.d'),today:t('cdn.today'),ago:t('cdn.since'),empty:t('cdn.wEmpty')}};
  const js=JSON.stringify(o);if(js===CDNW.last)return;CDNW.last=js;window.ThabatAndroid.cdnWidget(js)}catch(e){}}
{hookFn('renderToday',()=>renderToday,f=>{renderToday=f},'post',function(){try{cdnPush()}catch(e){}})}
setInterval(()=>{try{cdnPush()}catch(e){}},300000);
{const _to=thabatOpen;thabatOpen=function(w,...a){if(w==='cdn'){showView('today');setTimeout(()=>cdnOpen(),150);return}return _to(w,...a)};window.thabatOpen=thabatOpen}
