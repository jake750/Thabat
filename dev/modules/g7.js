/* ---- «your day between the prayers» bar for any day in the calendar panel; labels of close prayers no longer overlap ---- */
function dtlLabels(box){const ps=box&&box.querySelectorAll('.pts span');if(!ps||!ps.length)return;const L_=[...ps].map(s=>({s,r:s.getBoundingClientRect()})).sort((a,b)=>a.r.left-b.r.left);let lo=false;
  for(let i=1;i<L_.length;i++){const p=L_[i-1],c=L_[i];if(!p.s.classList.contains('lo')&&c.r.left<p.r.right+4){c.s.classList.add('lo');lo=true}}box.classList.toggle('dtl2',lo)}
{const _r=renderDayTL;renderDayTL=function(){_r();try{dtlLabels($('#dayTL'))}catch(e){}}}
function dayTLFor(k,box){const real=$('#dayTL'),tk=todayKey;if(real)real.id='dayTL__real';box.id='dayTL';try{todayKey=()=>k;renderDayTL()}catch(e){console.error(e)}finally{todayKey=tk;box.removeAttribute('id');if(real)real.id='dayTL'}}
{const _rd=renderDetail;renderDetail=function(k){_rd(k);try{if(k>todayKey())return;const mb=$('#detail .minibar');if(!mb)return;const b=document.createElement('div');b.className='dtl dtlcal';mb.after(b);dayTLFor(k,b)}catch(e){console.error(e)}}}
