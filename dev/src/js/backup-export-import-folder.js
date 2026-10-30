/* ============ backup: export / import / folder ============ */
$('#exportBtn').onclick=()=>{if(ANDROID){saveBytes('thabat-backup-'+todayKey()+'.json','application/json',new TextEncoder().encode(JSON.stringify(S)));return}const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(S,null,1)],{type:'application/json'}));a.download='thabat-backup-'+todayKey()+'.json';a.click()};
$('#importIn').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{const d=JSON.parse(await f.text());if(!d.days)throw 0;if(confirm(t('toast.importQ'))){S=deepMerge(structuredClone(DEF),d);LANG=S.settings.lang||'ar';save();applyTheme();applyI18n();renderAll();toast(t('toast.imported'))}}catch(err){toast(t('toast.badFile'))}e.target.value=''};
let dirHandle=null;
function idb(){return new Promise((res,rej)=>{const r=indexedDB.open('thabat',1);r.onupgradeneeded=()=>r.result.createObjectStore('kv');r.onsuccess=()=>res(r.result);r.onerror=rej})}
async function idbSet(k,v){const db=await idb();return new Promise(r=>{const tx=db.transaction('kv','readwrite');tx.objectStore('kv').put(v,k);tx.oncomplete=r})}
async function idbGet(k){const db=await idb();return new Promise(r=>{const q=db.transaction('kv').objectStore('kv').get(k);q.onsuccess=()=>r(q.result);q.onerror=()=>r(null)})}
/* 3.143: on Windows the helper writes the backup folder itself, so Chrome's folder permission (dropped at every restart) is not needed.
   bkhHandle() looks like a directory handle to the code below and in weeklyBackup(); the helper keeps the folder path (chosen once). */
const BKHL={last:{}};
function bkhName(s){return typeof s==='string'&&s.length>0&&s.length<=120&&!/[\\/:*?"<>|]/.test(s)&&s!=='.'&&s!=='..'&&!/\.$/.test(s)}
function bkhB64(u){let s='';for(let i=0;i<u.length;i+=8192)s+=String.fromCharCode.apply(null,u.subarray(i,i+8192));return btoa(s)}
async function bkhCall(r,a){const x=await fetch(HELPER+r+(a?'?'+a:''));if(!x.ok)throw new Error('bkh '+x.status);return x.json()}
function bkhHandle(path){const mk=sub=>({kind:'directory',bkh:1,name:sub||String(path).split(/[\/]/).filter(Boolean).pop()||String(path),
  async queryPermission(){return'granted'},async requestPermission(){return'granted'},
  async getDirectoryHandle(n){if(sub||!bkhName(n))throw new Error('bkh dir');return mk(n)},
  async getFileHandle(n){if(!bkhName(n))throw new Error('bkh name');return{kind:'file',name:n,async createWritable(){const parts=[];return{async write(d){parts.push(String(d))},async close(){
    const txt=parts.join(''),key=(sub||'')+'/'+n;if(BKHL.last[key]===txt)return;
    const u=new TextEncoder().encode(txt),CH=60000,c=Math.max(1,Math.ceil(u.length/CH));
    for(let i=0;i<c;i++)await bkhCall('/bkput','n='+encodeURIComponent(n)+'&sub='+encodeURIComponent(sub||'')+'&i='+i+'&c='+c+'&d='+encodeURIComponent(bkhB64(u.subarray(i*CH,(i+1)*CH))));
    BKHL.last[key]=txt}}}}},
  async*entries(){const r=await bkhCall('/bkls','sub='+encodeURIComponent(sub||''));for(const n of r.names||[])yield[n,{kind:'file',name:n}]},
  async removeEntry(n){await bkhCall('/bkrm','sub='+encodeURIComponent(sub||'')+'&n='+encodeURIComponent(n))}});return mk('')}
/* uses the helper's folder when it has one; false = no helper (Mac, phone, old helper) or no folder chosen yet */
async function bkhInit(){if(MAC||ANDROID)return false;try{const r=await bkhCall('/bkdir');if(!r.path)return false;dirHandle=bkhHandle(r.path);$('#permBanner').classList.remove('on');return true}catch(e){return false}}
/* the Windows folder dialog through the helper: true = chosen, 'cancel', false = use the browser's own picker */
async function bkhPick(){if(MAC||ANDROID)return false;try{await bkhCall('/bkdir');const p=await bkhCall('/libpick');if(!p.path)return'cancel';const r=await bkhCall('/bkdir','set='+encodeURIComponent(p.path));if(!r.path)return false;dirHandle=bkhHandle(r.path);BKHL.last={};$('#permBanner').classList.remove('on');return true}catch(e){return false}}
$('#pickFolder').onclick=async()=>{const hp=await bkhPick();if(hp==='cancel')return;if(hp){await folderBackup(true);toast(t('toast.folderSet',dirHandle.name));renderSettings();return}
  if(!window.showDirectoryPicker){toast(t('toast.folderOnly'));return}try{dirHandle=await window.showDirectoryPicker({mode:'readwrite',id:'thabat'});await idbSet('dir',dirHandle);await folderBackup(true);toast(t('toast.folderSet',dirHandle.name));renderSettings()}catch(e){}};
$('#regrant').onclick=async()=>{const hp=await bkhPick();if(hp==='cancel')return;if(hp){folderBackup(true);toast(t('toast.folderOk'));renderSettings();return}try{if(await dirHandle.requestPermission({mode:'readwrite'})==='granted'){$('#permBanner').classList.remove('on');folderBackup(true);toast(t('toast.folderOk'))}}catch(e){}};
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
(async()=>{try{await new Promise(r=>setTimeout(r,0));if(await bkhInit())return;if(!MAC&&!ANDROID)setTimeout(async()=>{if(await bkhInit())renderSettings()},6000);const h=await idbGet('dir');if(h){dirHandle=h;if(await h.queryPermission({mode:'readwrite'})!=='granted')$('#permBanner').classList.add('on');}}catch(e){}})();
window.addEventListener('beforeunload',()=>{try{flushSave()}catch(e){}});


