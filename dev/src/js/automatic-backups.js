/* ============ automatic backups ============ */
function bkIdx(){try{return JSON.parse(localStorage.getItem('thabat.bkidx')||'[]')}catch(e){return[]}}
async function autoBackup(force){try{const idx=bkIdx(),now=Date.now();if(!force&&idx[0]&&now-idx[0].t<7*864e5)return;const js=JSON.stringify(S),id='bk:'+now;await idbSet(id,js);
  idx.unshift({id,t:now,size:js.length,n:Object.keys(S.days).length});while(idx.length>8){const o=idx.pop();try{await idbSet(o.id,null)}catch(e){}}localStorage.setItem('thabat.bkidx',JSON.stringify(idx));
  if(ANDROID){try{window.ThabatAndroid.saveFile('thabat-auto-backup-'+todayKey()+'.json','application/json',btoa(unescape(encodeURIComponent(js))))}catch(e){}}
  if(force)toast(t('bk.done'));renderBkList()}catch(e){if(force)toast(t('toast.saveFail'))}}
function renderBkList(){const box=$('#bkList');if(!box)return;const idx=bkIdx();
  box.innerHTML=idx.length?idx.map(b=>`<div class="bkrow"><span><b>${gStr(new Date(b.t))}</b>${b.upd?` <span class="bkupd">${t('bk.updTag',b.upd)}</span>`:''} <small>${clk(b.t)} · ${Math.max(1,Math.round(b.size/1024))} KB · ${t('bk.days',b.n)}</small></span><span class="row"><button class="btn sm" data-bkr="${b.id}">${t('bk.restore')}</button><button class="btn sm ghost" data-bkd="${b.id}">⤓</button></span></div>`).join(''):`<div class="empty" style="padding:8px 0">${t('bk.none')}</div>`;
  box.querySelectorAll('[data-bkr]').forEach(x=>x.onclick=async()=>{const js=await idbGet(x.dataset.bkr);if(!js){toast(t('toast.badFile'));return}if(!confirm(t('bk.restoreQ')))return;
    await autoBackup(true);const d=JSON.parse(js);S=deepMerge(structuredClone(DEF),d);LANG=S.settings.lang||'ar';save();applyTheme();applyI18n();renderAll();toast(t('toast.imported'))});
  box.querySelectorAll('[data-bkd]').forEach(x=>x.onclick=async()=>{const js=await idbGet(x.dataset.bkd);if(js)saveBytes('thabat-backup-'+dKey(new Date(+x.dataset.bkd.slice(3)))+'.json','application/json',new TextEncoder().encode(js))})}
