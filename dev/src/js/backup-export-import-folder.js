/* ============ backup: export / import / folder ============ */
$('#exportBtn').onclick=()=>{if(ANDROID){saveBytes('thabat-backup-'+todayKey()+'.json','application/json',new TextEncoder().encode(JSON.stringify(S)));return}const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(S,null,1)],{type:'application/json'}));a.download='thabat-backup-'+todayKey()+'.json';a.click()};
$('#importIn').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{const d=JSON.parse(await f.text());if(!d.days)throw 0;if(confirm(t('toast.importQ'))){S=deepMerge(structuredClone(DEF),d);LANG=S.settings.lang||'ar';save();applyTheme();applyI18n();renderAll();toast(t('toast.imported'))}}catch(err){toast(t('toast.badFile'))}e.target.value=''};
let dirHandle=null;
function idb(){return new Promise((res,rej)=>{const r=indexedDB.open('thabat',1);r.onupgradeneeded=()=>r.result.createObjectStore('kv');r.onsuccess=()=>res(r.result);r.onerror=rej})}
async function idbSet(k,v){const db=await idb();return new Promise(r=>{const tx=db.transaction('kv','readwrite');tx.objectStore('kv').put(v,k);tx.oncomplete=r})}
async function idbGet(k){const db=await idb();return new Promise(r=>{const q=db.transaction('kv').objectStore('kv').get(k);q.onsuccess=()=>r(q.result);q.onerror=()=>r(null)})}
$('#pickFolder').onclick=async()=>{if(!window.showDirectoryPicker){toast(t('toast.folderOnly'));return}try{dirHandle=await window.showDirectoryPicker({mode:'readwrite',id:'thabat'});await idbSet('dir',dirHandle);await folderBackup(true);toast(t('toast.folderSet',dirHandle.name));renderSettings()}catch(e){}};
$('#regrant').onclick=async()=>{try{if(await dirHandle.requestPermission({mode:'readwrite'})==='granted'){$('#permBanner').classList.remove('on');folderBackup(true);toast(t('toast.folderOk'))}}catch(e){}};
function dayMarkdown(k){const d=S.days[k];if(!d)return'';const date=keyToDate(k),{tot,by}=totals(k);
  let s=`# ${L().days[date.getDay()]} ${hStr(date)}\n${gStr(date)}\n\n${t('md.prod')}: ${fmtHM(tot)} / ${goalMs(k)/36e5}${t('u.h')} (${Math.floor(tot/goalMs(k)*100)}%)\n`;
  for(const c in by)s+=`- ${catName(catOf(c))}: ${fmtHM(by[c])}\n`;
  d.sessions.filter(x=>x.note&&!x.mediaId).forEach(x=>s+=`  • ${catName(catOf(x.cat))} — ${x.note} (${fmtHM(x.end-x.start)})\n`);
  if((d.media||[]).length){s+=`\n## ${t('media.title')}\n`;d.media.forEach(m=>s+=`- ${t('type.'+m.type)} · ${t('how.'+m.how)}: ${m.title} (${fmtHM(m.minutes*6e4)})\n`)}
  if(d.quran){const qq=d.quran;s+=`\n## ${t('d.quran')}\n- ${t('d.qRead',qq.read,S.quran.wird)} ${qWirdDone(qq)?'✓':''}\n`;if(qq.hifz)s+=`- ${t('d.qHifz')} ✓ ${qq.hifzPages&&qq.hifzPages.length?rangesStr(qq.hifzPages):''} ${qq.hifzNote||''}\n`;if(qq.review)s+=`- ${t('d.qReview')} ✓ ${qq.rv?rangesStr(qq.rv):''}\n`}
  s+=`\n## ${d.summary&&d.summary.trim()?t('d.sum'):t('d.doneOnly')}\n`;
  if(d.summary&&d.summary.trim())s+=d.summary+'\n\n## '+t('md.tasks')+'\n';
  d.tasks.forEach(x=>s+=`- [${x.done?'x':' '}] ${x.text}\n`);return s}
async function folderBackup(force){if(!dirHandle)return;try{if(await dirHandle.queryPermission({mode:'readwrite'})!=='granted'){$('#permBanner').classList.add('on');return}
  const w=async(dir,name,txt)=>{const fh=await dir.getFileHandle(name,{create:true});const ws=await fh.createWritable();await ws.write(txt);await ws.close()};
  await w(dirHandle,'thabat-backup.json',JSON.stringify(S,null,1));
  const days=await dirHandle.getDirectoryHandle('الأيام',{create:true});const k=todayKey();
  await w(days,k+'.md',dayMarkdown(k));
  const y=dKey(new Date(keyToDate(k).getTime()-DAYMS));if(S.days[y]&&force)await w(days,y+'.md',dayMarkdown(y));
}catch(e){console.warn(e)}}
(async()=>{try{const h=await idbGet('dir');if(h){dirHandle=h;if(await h.queryPermission({mode:'readwrite'})!=='granted')$('#permBanner').classList.add('on');}}catch(e){}})();
window.addEventListener('beforeunload',()=>{try{flushSave()}catch(e){}});


