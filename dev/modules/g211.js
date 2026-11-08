/* ============ v3.173.2 his screenshots 2026-11-08: prayer times in a narrow card, the away-from-device form and sleep periods on phones, sleep in hours and minutes ============ */
/* habits counted in hours read «7س 30د», not «7.5س» (the chip under the date, e.g. sleep) */
function hbHrs(x){return fmtHM(Math.round((+x||0)*60)*6e4)}
{const _hc=hbChips;hbChips=function(){const k=todayKey(),out=_hc();if(!out)return out;const box=document.createElement('div');box.innerHTML=out;
  box.querySelectorAll('.hbchip[data-hb]').forEach(el=>{const h=HB().find(x=>x.id===el.dataset.hb);if(!h||h.type!=='hours'||h.cat)return;const v=hbVal(h.id);if(v==null)return;
    const done=hbDone(h,k),txt=' '+hbHrs(v)+(h.goal&&!done?' / '+hbHrs(h.goal):''),last=el.lastChild;
    if(last&&last.nodeType===3){const old=' '+v+(h.goal&&!done?'/'+h.goal:'')+hbUnit(h);if(last.data.endsWith(old))last.data=last.data.slice(0,-old.length)+txt}});
  return box.innerHTML}}
