/* ============ brief: adhkar heatmap & report ============ */
function renderBriefAdh(keys){const box=$('#bAdh');if(!box)return;const tk=todayKey(),lv=k=>adhLvl((S.days[k]||{}).adh),past=keys.filter(k=>k<tk||(k===tk&&lv(k)===3));
  const full=past.filter(k=>lv(k)===3).length,pct=past.length?Math.round(full/past.length*100):0;
  const mc={m:0,e:0,d:0};past.forEach(k=>{const a=(S.days[k]||{}).adh;if(!a){mc.m++;mc.e++;return}['m','e','d'].forEach(p=>{if(a[p]===false)mc[p]++})});
  const mx=Math.max(mc.m,mc.e,mc.d),miss=mx>0?[['m','e','d'].find(p=>mc[p]===mx),0]:null;
  const avg=p=>{const ts=past.map(k=>((S.days[k]||{}).adhT||{})[p]).filter(Boolean).map(ms=>{const d=new Date(ms);return d.getHours()*60+d.getMinutes()});if(!ts.length)return'—';const m=Math.round(ts.reduce((a,b)=>a+b,0)/ts.length);return pad(Math.floor(m/60))+':'+pad(m%60)};
  const tile=(v,l)=>`<div class="atile"><b>${v}</b><span>${l}</span></div>`;
  let h=`<div class="atiles">${tile(pct+'%',t(bMode==='week'?'ab.fullW':'ab.fullM'))}${tile(adhStreak(),t('ab.streak'))}${tile(adhBestStreak(),t('ab.best'))}${tile(miss&&miss[1]<1?t('adh.'+miss[0]):'—',t('ab.miss'))}${tile(avg('m'),t('ab.avgM'))}${tile(avg('e'),t('ab.avgE'))}</div>`;
  /* heatmap: 26 weeks */
  const W=Math.max(8,Math.min(26,Math.floor(((box.clientWidth||600)-40)/16))),end=keyToDate(tk),mon=addDays(end,-((end.getDay()+6)%7)),start=addDays(mon,-(W-1)*7);let cells='';
  for(let w=0;w<W;w++)for(let d=0;d<7;d++){const dt=addDays(start,w*7+d),k=dKey(dt),fut=k>tk,l=fut?-1:lv(k);cells+=`<i class="hm l${l}" title="${esc(gStr(dt))}${fut?'':' · '+t(l?'adh.lvl'+l:'ab.none')}"></i>`}
  h+=`<div class="hmwrap"><div class="hmdays">${[1,3,5].map(i=>`<span style="grid-row:${i+1}">${L().days[(i+1)%7].slice(0,3)}</span>`).join('')}</div><div class="ahmap">${cells}</div></div><div class="hmleg"><span>${t('ab.less')}</span><i class="hm l0"></i><i class="hm l1"></i><i class="hm l2"></i><i class="hm l3"></i><span>${t('ab.more')}</span></div>`;
  box.innerHTML=h}
