/* ============ 3.104 import tasks from Todoist (CSV), TickTick (backup CSV) and Google Tasks (Takeout Tasks.json) ============ */
/* Files only (no account sign-in). Each task gets a fixed id imp-<hash of source|list|title|due> so importing the same file again adds nothing.
   A task with a date goes to that day (an overdue one to today), one without a date to today or to «this week»; done tasks are skipped by default. */
function impCsv(txt){const rows=[];let row=[],f='',q=false;txt=txt.replace(/^﻿/,'');for(let i=0;i<txt.length;i++){const c=txt[i];
  if(q){if(c==='"'){if(txt[i+1]==='"'){f+='"';i++}else q=false}else f+=c;continue}
  if(c==='"')q=true;else if(c===','){row.push(f);f=''}else if(c==='\n'||c==='\r'){if(c==='\r'&&txt[i+1]==='\n')i++;row.push(f);rows.push(row);row=[];f=''}else f+=c}
  if(f||row.length){row.push(f);rows.push(row)}return rows.filter(r=>r.some(x=>x!==''))}
function impDate(s){s=String(s||'').trim();if(!s)return null;let m=s.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/);
  if(m)return{k:`${m[1]}-${m[2]}-${m[3]}`,at:m[4]&&!(m[4]==='00'&&m[5]==='00'&&/Z|\+0000/.test(s))?`${m[4]}:${m[5]}`:''};
  const d=new Date(s);if(isNaN(d))return null;const hm=/\d{1,2}:\d{2}/.test(s)?`${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`:'';return{k:dKey(d),at:hm}}
/* → [{src,list,title,note,done,due:{k,at}|null,pri:1|3|undefined,rep:bool,tags:[]}] */
function impParse(name,txt){const out=[];
  if(/^\s*[{[]/.test(txt)){const j=JSON.parse(txt);const lists=j.items||(Array.isArray(j)?j:[]);
    lists.forEach(L_=>(L_.items||[]).forEach(x=>{if(!x||!x.title)return;out.push({src:'gt',list:L_.title||'',title:String(x.title).trim(),note:x.notes||'',done:x.status==='completed',due:x.due?impDate(String(x.due).slice(0,10)):null})}));
    return{src:'gt',items:out}}
  const R=impCsv(txt);let h=R.findIndex(r=>r.includes('Title')&&(r.includes('List Name')||r.includes('Folder Name')));
  if(h>=0){const H=R[h],ix=k=>H.indexOf(k);R.slice(h+1).forEach(r=>{const g=k=>ix(k)>=0?r[ix(k)]||'':'';const title=g('Title').trim();if(!title)return;const p=+g('Priority');
      out.push({src:'tt',list:g('List Name'),title,note:g('Content'),done:/^[12]$/.test(g('Status')),due:impDate(g('Due Date')||g('Start Date')),pri:p>=5?1:p===1?3:undefined,rep:!!g('Repeat'),tags:g('Tags').split(/[,\s]+/).filter(Boolean)})});
    return{src:'tt',items:out}}
  h=R.findIndex(r=>r.includes('TYPE')&&r.includes('CONTENT'));
  if(h>=0){const H=R[h],ix=k=>H.indexOf(k),list=String(name||'').replace(/\.csv$/i,'').replace(/^Todoist[-_ ]?/i,'')||'Todoist';
    R.slice(h+1).forEach(r=>{const g=k=>ix(k)>=0?r[ix(k)]||'':'';if(g('TYPE')!=='task')return;let title=g('CONTENT').trim();if(!title)return;const tags=[];title=title.replace(/\s@([\p{L}\d_-]+)/gu,(m,a)=>{tags.push(a);return''}).trim();
      const p=+g('PRIORITY'),ds=g('DATE');out.push({src:'td',list,title,note:g('DESCRIPTION'),done:false,due:/^every|^كل/i.test(ds)?null:impDate(ds),rep:/^every/i.test(ds),pri:p===1?1:undefined,tags})});
    return{src:'td',items:out}}
  throw new Error('format')}
function impTag(s){return String(s||'').trim().replace(/\s+/g,'_').replace(/[#,.;:!?()[\]{}"'<>]/g,'')}
const IMPX={last:null};
function impRun(P_,opt){const tk=todayKey(),added=[];let wk=0;
  P_.items.filter(x=>(!opt.open||!x.done)&&opt.lists.has(x.list)).forEach(x=>{const id='imp-'+bkHash([x.src,x.list,x.title,x.due&&x.due.k||''].join('|'));
    const tags=[...(opt.tag&&x.list?[impTag(x.list)]:[]),...(x.tags||[]).map(impTag)].filter(Boolean),text=(x.title+(tags.length?' '+tags.map(t_=>'#'+t_).join(' '):'')).trim();
    let k=x.due?x.due.k:null;if(k&&k<tk)k=tk;
    if(!k&&opt.nodate==='week'){S.wkTasks=S.wkTasks||[];if(S.wkTasks.some(w=>w.id===id))return;S.wkTasks.push({id,text,wk:periodKeys('week',keyToDate(tk))[0],created:Date.now()});added.push({w:1,id});wk++;return}
    k=k||tk;const d=day(k);d.tasks=d.tasks||[];if(Object.values(S.days).some(dd=>(dd.tasks||[]).some(t_=>t_.id===id)))return;
    const t_={id,text,done:false,created:Date.now(),imp:x.src};if(x.due&&x.due.at)t_.at=x.due.at;if(x.pri)t_.pri=x.pri;d.tasks.push(t_);added.push({k,id})});
  IMPX.last=added;save();try{renderTasks();renderToday()}catch(e){}return added}
function impUndo(){const L_=IMPX.last||[];L_.forEach(a=>{if(a.w)S.wkTasks=(S.wkTasks||[]).filter(w=>w.id!==a.id);else{const d=S.days[a.k];if(d&&d.tasks)d.tasks=d.tasks.filter(t_=>t_.id!==a.id)}});IMPX.last=null;save();try{renderTasks();renderToday()}catch(e){}}
function impOpen(){openInfo(t('imp.t'),`<div id="impB" class="impb"><p class="muted">${esc(t('imp.sub'))}</p><ul class="imph"><li>${esc(t('imp.hTd'))}</li><li>${esc(t('imp.hTt'))}</li><li>${esc(t('imp.hGt'))}</li></ul><button class="btn pri" id="impPick">${esc(t('imp.pick'))}</button></div>`);
  $('#impPick').onclick=()=>{const inp=document.createElement('input');inp.type='file';inp.accept='.csv,.json,text/csv,application/json';inp.style.display='none';document.body.append(inp);
    inp.onchange=async()=>{const f=inp.files[0];inp.remove();if(!f)return;let P_;try{P_=impParse(f.name,await f.text())}catch(e){toast(t('imp.bad'));return}if(!P_.items.length){toast(t('imp.empty'));return}impPreview(P_)};inp.click()}}
function impPreview(P_){const lists=[...new Set(P_.items.map(x=>x.list))],opt={open:true,tag:true,nodate:'today',lists:new Set(lists)};
  const paint=()=>{const box=$('#impB');if(!box)return;const sel=P_.items.filter(x=>(!opt.open||!x.done)&&opt.lists.has(x.list)),dated=sel.filter(x=>x.due).length,rep=sel.filter(x=>x.rep).length;
    box.innerHTML=`<p><b>${esc(t('imp.src.'+P_.src))}</b> · ${esc(t('imp.found',P_.items.length,P_.items.filter(x=>x.done).length))}</p>
     ${lists.length>1||lists[0]?`<h4>${esc(t('imp.lists'))}</h4><div class="impls">${lists.map((l,i)=>`<label class="chk"><input type="checkbox" data-il="${i}" ${opt.lists.has(l)?'checked':''}><span dir="auto">${esc(l||t('imp.noList'))} <small class="muted">(${P_.items.filter(x=>x.list===l).length})</small></span></label>`).join('')}</div>`:''}
     <label class="chk"><input type="checkbox" id="impOpenOnly" ${opt.open?'checked':''}><span>${esc(t('imp.open'))}</span></label>
     <label class="chk"><input type="checkbox" id="impTagL" ${opt.tag?'checked':''}><span>${esc(t('imp.tag'))}</span></label>
     <div class="field"><div><label>${esc(t('imp.nodate'))}</label></div><select class="in" id="impNd"><option value="today" ${opt.nodate==='today'?'selected':''}>${esc(t('imp.toToday'))}</option><option value="week" ${opt.nodate==='week'?'selected':''}>${esc(t('imp.toWeek'))}</option></select></div>
     <p class="muted">${esc(t('imp.sum',sel.length,dated))}${rep?' '+esc(t('imp.rep',rep)):''}</p>
     <div class="row" style="justify-content:flex-end"><button class="btn pri" id="impGo" ${sel.length?'':'disabled'}>${esc(t('imp.go',sel.length))}</button></div>`;
    box.querySelectorAll('[data-il]').forEach(c=>c.onchange=()=>{const l=lists[+c.dataset.il];if(c.checked)opt.lists.add(l);else opt.lists.delete(l);paint()});
    $('#impOpenOnly').onchange=e=>{opt.open=e.target.checked;paint()};$('#impTagL').onchange=e=>{opt.tag=e.target.checked};$('#impNd').onchange=e=>{opt.nodate=e.target.value};
    $('#impGo').onclick=()=>{const a=impRun(P_,opt);$$('.modal.on').forEach(m=>m.classList.remove('on'));if(!a.length){toast(t('imp.none'));return}toastAct(t('imp.done',a.length),t('undo'),impUndo,12000)}};
  paint()}
{hookFn('renderSettings',()=>renderSettings,f=>{renderSettings=f},'post',function(){try{const r=$('#obsRow');if(!r||$('#impRow'))return;r.insertAdjacentHTML('afterend',`<div class="field" id="impRow"><div><label data-i18n="imp.t">${esc(t('imp.t'))}</label><small>${esc(t('imp.rowS'))}</small></div><button class="btn sm" id="impOpenB">${esc(t('obs2.open'))}</button></div>`);$('#impOpenB').onclick=impOpen}catch(e){console.error(e)}})}
{const _cc=cmdCommands;cmdCommands=function(...a){const L_=_cc(...a);try{L_.push({icon:'⬆',label:t('imp.t'),run:impOpen,kw:'import todoist ticktick google tasks csv استيراد المهام'})}catch(e){}return L_}}

