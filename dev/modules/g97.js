/* ============ v3.82.0: dialogs fit the window at any interface size; Gregorian month names to choose; the shooting star in the calendar sky ============ */
/* month names: Maghrebi stays the default; the Levantine and Mashriqi lists are options (Arabic only) */
const GMN={mg:['جانفي','فيفري','مارس','أفريل','ماي','جوان','جويلية','أوت','سبتمبر','أكتوبر','نوفمبر','ديسمبر'],
  ms:['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'],
  lv:['كانون الثاني','شباط','آذار','نيسان','أيار','حزيران','تموز','آب','أيلول','تشرين الأول','تشرين الثاني','كانون الأول']};
function gmnApply(){try{LOC.ar.months=(GMN[S.settings.gMon]||GMN.mg).slice()}catch(e){}}
gmnApply();
{hookFn('renderSettings',()=>renderSettings,f=>{renderSettings=f},'post',function(){try{let r=$('#gmnRow');
  if(!r){const a=$('#digField');if(!a)return;a.insertAdjacentHTML('afterend',`<div class="field" id="gmnRow" style="padding:12px 0 0"><div><label data-i18n="gmn.t">${t('gmn.t')}</label><small>${t('gmn.s')}</small></div><select class="in" id="gmnIn" aria-label="${esc(t('gmn.t'))}">${['mg','ms','lv'].map(k=>`<option value="${k}">${esc(t('gmn.'+k))}</option>`).join('')}</select></div>`);r=$('#gmnRow');
    $('#gmnIn').onchange=e=>{S.settings.gMon=e.target.value==='mg'?undefined:e.target.value;gmnApply();save();try{renderAll()}catch(x){}}}
  r.hidden=LANG!=='ar';$('#gmnIn').value=S.settings.gMon||'mg'}catch(e){console.error(e)}})}

/* the shooting star: a day of 16 hours or more (MET_MS, as on the wall) gets one beside its stars, in a free spot of the calendar sky */
function cmtPlace(){const wrap=$('#calSkyWrap'),sky=$('#calSky');if(!wrap||!sky||!wrap.offsetParent||overBricks())return;sky.querySelectorAll('.cmet').forEach(e=>e.remove());
  const y=calM.getFullYear(),m=calM.getMonth(),last=new Date(y,m+1,0).getDate(),tk=todayKey(),days=[];
  for(let d=1;d<=last;d++){const k=dKey(new Date(y,m,d));if(k>tk||!S.days[k])continue;const tot=totals(k).tot;if(tot>=MET_MS)days.push({k,tot})}
  if(!days.length)return;
  const W=wrap.clientWidth,H=wrap.clientHeight,wr=wrap.getBoundingClientRect(),z=uiZoom(),forb=[],pad=(b,p)=>forb.push([(b.left-wr.left)/z-p,(b.top-wr.top)/z-p,(b.right-wr.left)/z+p,(b.bottom-wr.top)/z+p]);
  $$('#cal .dow').forEach(e=>pad(e.getBoundingClientRect(),1));
  if(MOB.matches)$$('#cal .cell').forEach(cell=>{const tw=document.createTreeWalker(cell,NodeFilter.SHOW_TEXT);let n;while((n=tw.nextNode())){if(!n.textContent.trim())continue;const r=document.createRange();r.selectNodeContents(n);for(const b of r.getClientRects())if(b.width)pad(b,3)}
    cell.querySelectorAll('svg,img').forEach(e=>{const b=e.getBoundingClientRect();if(b.width)pad(b,3)})});
  else $$('#cal .cell').forEach(c=>pad(c.getBoundingClientRect(),1));
  const taken=[...sky.children].map(e=>{const b=e.getBoundingClientRect();return[(b.left+b.right)/2/z-wr.left/z,(b.top+b.bottom)/2/z-wr.top/z]});
  const hw=11,hh=4,P=[];for(let yy=hh+2;yy<=H-hh-2;yy+=2)for(let x=hw+2;x<=W-hw-2;x+=2)if(!forb.some(r=>x+hw>r[0]&&x-hw<r[2]&&yy+hh>r[1]&&yy-hh<r[3]))P.push([x,yy]);
  if(!P.length)return;const R=rng('calmet'+y+'-'+m);let h='';
  for(const it of days){let best=null,bd=-Infinity;for(let i=0;i<48;i++){const q=P[Math.floor(R()*P.length)];let d=Infinity;for(const o of taken){const v=Math.hypot(o[0]-q[0],o[1]-q[1]);if(v<d)d=v}if(d>bd){bd=d;best=q}}
    if(!best||bd<10)continue;taken.push(best);
    h+=`<i class="cmet" data-k="${it.k}" title="${esc(t('cmt.tip',gStr(keyToDate(it.k)),fmtHM(it.tot)))}" style="left:${best[0]}px;top:${best[1]}px;--md:${(1.5+R()*5).toFixed(1)}s"></i>`}
  if(!h)return;sky.insertAdjacentHTML('beforeend',h);sky.querySelectorAll('.cmet').forEach(e=>e.onclick=()=>{selKey=e.dataset.k;renderCal()})}
{hookFn('placeCalSky',()=>placeCalSky,f=>{placeCalSky=f},'post',function(){try{cmtPlace()}catch(e){console.error(e)}})}
