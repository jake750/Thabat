/* ============ v3.39: settings on two levels — each large card shows its main rows, the rest under «خيارات متقدّمة» ============ */
/* A row is known by the i18n key of its label; a row without one goes with the row before it (its second line). Only cards with more
   than 8 rows are split. Searching shows every row, and anything that scrolls to a hidden row opens that card's advanced part first. */
const SGA_MAIN={
  'set.look':['set.style','set.mode','set.color','set.zoom','set.perf','set.simple','nv.t','tdc.l','set.night'],
  'set.goalCats':['set.goal','set.goalWd','set.cats','set.dayStart','set.pomo','pomo.work','ics.s','hb.t','set.carry'],
  'set.prayer':['set.loc','set.src','set.method','set.city','set.coords','set.angles','set.offs','set.remind','set.adhan','set.adhanMode','set.adhanVolume','set.prayPause','set.jumua','set.fastWhite'],
  'set.quran':['set.riwaya','set.div','set.wird','set.review','set.remRead','set.remHifz','cm.t','mlk.l'],
  'hh3.set':['mv3.s','ey3.s','sl3.s','ml3.s','hl3.t','wx3.s'],
  'set.backup':['','set.io','set.folder','bk.title','trs.l','set.notif'],
};
function sgaOpen(){try{return JSON.parse(localStorage.getItem('thabat.sgAdv')||'{}')}catch(e){return{}}}
function sgaSetOpen(k,on){const o=sgaOpen();if(on)o[k]=1;else delete o[k];try{localStorage.setItem('thabat.sgAdv',JSON.stringify(o))}catch(e){}}
function sgaRowKey(f){const l=f.querySelector('label[data-i18n],:scope>div>[data-i18n]');return l?l.dataset.i18n:null}
function sgaMark(c){const k=sgKey(c),main=SGA_MAIN[k];if(!main)return;const rows=[...c.children].filter(x=>x.matches('.field,.icsbox'));if(rows.length<=8)return;
  let prev=true,n=0;rows.forEach((f,i)=>{const rk=sgaRowKey(f);const isMain=rk===null?(i===0?main.includes(''):prev):main.includes(rk);prev=isMain;f.classList.toggle('sga-x',!isMain);if(!isMain)n++});
  let b=c.querySelector(':scope>.sgabtn');if(!b){c.insertAdjacentHTML('beforeend','<button class="btn sm ghost sgabtn"></button>');b=c.querySelector(':scope>.sgabtn');b.onclick=()=>{const on=!c.classList.contains('sga-on');sgaSetOpen(k,on);sgaPaint(c,n)}}
  b.dataset.n=n;sgaPaint(c,n,true)}
function sgaPaint(c,n,init){const k=sgKey(c);const on=init?!!sgaOpen()[k]:!c.classList.contains('sga-on');c.classList.toggle('sga-on',on);const b=c.querySelector(':scope>.sgabtn');if(b)b.textContent=on?t('sga.less'):t('sga.more',n||b.dataset.n)}
function sgaAll(){setCards().forEach(c=>{try{sgaMark(c)}catch(e){}});const q=$('#setQ');if(q&&!q.dataset.sga){q.dataset.sga=1;const f=()=>document.documentElement.classList.toggle('sgq',!!q.value.trim());q.addEventListener('input',f);f()}}
{hookFn('renderSettings',()=>renderSettings,f=>{renderSettings=f},'post',function(){sgaAll()})}
/* anything that scrolls to a hidden row (search results, «open this setting» links) opens the card's advanced part */
{const _siv=Element.prototype.scrollIntoView;Element.prototype.scrollIntoView=function(...a){try{const f=this.closest&&this.closest('#v-set .sga-x'),c=f&&f.closest('.card');if(c&&!c.classList.contains('sga-on')){sgaSetOpen(sgKey(c),true);sgaPaint(c,0,true)}}catch(e){}return _siv.apply(this,a)}}
setTimeout(()=>{try{sgaAll()}catch(e){}},600);

