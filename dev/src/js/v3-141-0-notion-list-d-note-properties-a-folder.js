/* ============ v3.141.0: Notion list D — note properties, a folder as a table or a board, saved views, linked tasks progress, formulas ============ */
/* A notes folder may hold f.props=[{id,n,t,opts:[{id,n,c}],f}] (t: text num date select status check link tasks formula)
   and f.views=[{id,n,k:'table'|'board',sort:{p,d},flt:[{p,op,v}],grp}] with f.vw = the open view ('' = the usual cards).
   A note keeps its values in n.pv={propId:value}; «tasks» counts the tasks tied to the note (x.note); «formula» is read by ndbEval (no eval). */
const NDB={tk:null,tkAt:-1,drag:null};
const NDB_T=['text','num','date','select','status','check','link','tasks','formula'];
const NDB_C=['#8a8f98','#6f8fe0','#e0b43a','#5fae5a','#d77a61','#b07ad6','#4fb0a5','#d2648f'];
const NDB_I={text:'Aa',num:'#',date:'▦',select:'▾',status:'◉',check:'☑',link:'↗',tasks:'☑',formula:'ƒ'};
function ndbF(id){return id?nfGet(id):null}
function ndbProps(f){return (f&&f.props)||[]}
function ndbView(f){return f&&f.vw&&(f.views||[]).find(v=>v.id===f.vw)||null}
function ndbNoteF(n){return n&&n.fd?ndbF(n.fd):null}
function ndbIco(k){return `<span class="ndbic">${NDB_I[k]||''}</span>`}
function ndbStatusOpts(){return[{id:uid(),n:t('ndb.s1'),c:'#8a8f98'},{id:uid(),n:t('ndb.s2'),c:'#e0b43a'},{id:uid(),n:t('ndb.s3'),c:'#5fae5a'}]}
function ndbOpt(p,v){return (p.opts||[]).find(o=>o.id===v)}
/* 27: tasks tied to each note (the postponed originals are not counted), cached per save */
function ndbTasksMap(){if(NDB.tk&&NDB.tkAt===S._savedAt)return NDB.tk;const m={};for(const k in (S.days||{})){const d=S.days[k];((d&&d.tasks)||[]).forEach(x=>{if(!x||!x.note||x.pp)return;const r=m[x.note]||(m[x.note]={done:0,all:0,L:[]});r.all++;if(x.done)r.done++;r.L.push({k,x})})}NDB.tk=m;NDB.tkAt=S._savedAt;return m}
function ndbTk(n){return (n&&ndbTasksMap()[n.id])||{done:0,all:0,L:[]}}
function ndbRaw(n,p,depth){const v=(n.pv||{})[p.id];
  if(p.t==='tasks'){const r=ndbTk(n);return r.all?Math.round(r.done/r.all*100):0}
  if(p.t==='formula')return ndbEval(p.f||'',n,(depth||0)+1);
  if(p.t==='select'||p.t==='status'){const o=ndbOpt(p,v);return o?o.n:''}
  if(p.t==='num')return v===''||v==null?'':+v;
  if(p.t==='check')return !!v;
  return v==null?'':v}
function ndbFmt(r){if(r===true)return'✓';if(r===false)return'✕';if(r&&r.err)return'⚠';if(typeof r==='number')return isFinite(r)?String(Math.round(r*100)/100):'—';return String(r==null?'':r)}
function ndbShow(n,p){const v=(n.pv||{})[p.id];
  if(p.t==='tasks'){const r=ndbTk(n);if(!r.all)return'';const pc=Math.round(r.done/r.all*100);return `<span class="ndbtk"><i style="--p:${pc}%"></i><small>${r.done}/${r.all}</small></span>`}
  if(p.t==='select'||p.t==='status'){const o=ndbOpt(p,v);return o?`<span class="ndbpill" style="--c:${o.c||'#8a8f98'}">${esc(o.n)}</span>`:''}
  if(p.t==='check')return v?'<span class="ndbck">✓</span>':'';
  if(p.t==='date')return v?esc(gShort(keyToDate(v))):'';
  if(p.t==='link')return v?`<a class="ndblnk" data-ndbu="${esc(v)}" dir="ltr">${esc(String(v).replace(/^https?:\/\/(www\.)?/,'').slice(0,40))}</a>`:'';
  if(p.t==='formula'){const r=ndbRaw(n,p);return r===''?'':`<span class="ndbfv${r&&r.err?' err':''}">${esc(ndbFmt(r))}</span>`}
  if(p.t==='num')return v===''||v==null?'':esc(ndbFmt(+v));
  return esc(v||'')}

/* 28: formulas — {property}, numbers, "text", + − * / %, comparisons, && || !, and a few functions */
function ndbLex(s){const T=[];let i=0;while(i<s.length){const c=s[i];
  if(/\s/.test(c)){i++;continue}
  if(/[0-9.]/.test(c)){let j=i;while(j<s.length&&/[0-9.]/.test(s[j]))j++;T.push({t:'n',v:parseFloat(s.slice(i,j))});i=j;continue}
  if(c==='"'||c==='«'){const e=c==='"'?'"':'»',j=s.indexOf(e,i+1);if(j<0)throw 0;T.push({t:'s',v:s.slice(i+1,j)});i=j+1;continue}
  if(c==='{'){const j=s.indexOf('}',i);if(j<0)throw 0;T.push({t:'p',v:s.slice(i+1,j).trim()});i=j+1;continue}
  const two=s.slice(i,i+2);if(['>=','<=','==','!=','&&','||'].includes(two)){T.push({t:'o',v:two});i+=2;continue}
  if('+-*/%()<>,!='.includes(c)){T.push({t:'o',v:c==='='?'==':c});i++;continue}
  if(/[\p{L}_]/u.test(c)){let j=i;while(j<s.length&&/[\p{L}\p{N}_]/u.test(s[j]))j++;T.push({t:'i',v:s.slice(i,j)});i=j;continue}
  throw 0}return T}
function ndbFn(fn,A,num){const dt=x=>{const m=String(x||'').match(/^(\d{4})-(\d\d)-(\d\d)/);return m?new Date(+m[1],m[2]-1,+m[3]):null};
  switch(fn){
    case'if':case'اذا':case'إذا':return A[0]&&!A[0].err?A[1]:A[2];
    case'round':{const p=Math.pow(10,num(A[1]||0));return Math.round(num(A[0])*p)/p}
    case'abs':return Math.abs(num(A[0]));
    case'min':return Math.min(...A.map(num));
    case'max':return Math.max(...A.map(num));
    case'sum':return A.reduce((s,x)=>s+num(x),0);
    case'today':return todayKey();
    case'days':{const d=dt(A[0]);if(!d)return'';const b=A[1]?dt(A[1]):keyToDate(todayKey());return b?Math.round((d-b)/864e5):''}
    case'len':return String(A[0]==null?'':A[0]).length;
    case'empty':return A[0]===''||A[0]==null||A[0]===false;
    default:throw 0}}
function ndbEval(src,n,depth){if((depth||0)>4)return{err:1};try{
  const s=String(src).replace(/،/g,',').replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)),T=ndbLex(s);let i=0;
  const isO=v=>T[i]&&T[i].t==='o'&&T[i].v===v,P=ndbProps(ndbNoteF(n));
  const num=x=>typeof x==='number'?x:x===true?1:(x===false||x==='')?0:+x;
  const strish=x=>typeof x==='string'&&x!==''&&isNaN(+x);
  const prim=()=>{const k=T[i++];if(!k)throw 0;if(k.t==='n'||k.t==='s')return k.v;
    if(k.t==='p'){const p=P.find(q=>q.n.trim().toLowerCase()===k.v.toLowerCase());if(!p)throw 0;const r=ndbRaw(n,p,depth);if(r&&r.err)throw 0;return r}
    if(k.t==='o'&&k.v==='('){const v=or();if(!isO(')'))throw 0;i++;return v}
    if(k.t==='i'){if(!isO('('))throw 0;i++;const A=[];if(!isO(')')){A.push(or());while(isO(',')){i++;A.push(or())}}if(!isO(')'))throw 0;i++;return ndbFn(k.v.toLowerCase(),A,num)}
    throw 0};
  const un=()=>{if(isO('-')){i++;return -num(un())}if(isO('!')){i++;return !un()}return prim()};
  const mul=()=>{let a=un();while(isO('*')||isO('/')||isO('%')){const o=T[i++].v,b=un();a=o==='*'?num(a)*num(b):o==='/'?num(a)/num(b):num(a)%num(b)}return a};
  const add=()=>{let a=mul();while(isO('+')||isO('-')){const o=T[i++].v,b=mul();a=o==='+'?(strish(a)||strish(b)?String(a)+String(b):num(a)+num(b)):num(a)-num(b)}return a};
  const cmp=()=>{let a=add();while(['>','<','>=','<=','==','!='].some(o=>isO(o))){const o=T[i++].v,b=add(),nu=typeof a==='number'||typeof b==='number',x=nu?num(a):String(a),y=nu?num(b):String(b);
    a=o==='>'?x>y:o==='<'?x<y:o==='>='?x>=y:o==='<='?x<=y:o==='=='?x==y:x!=y}return a};
  const and=()=>{let a=cmp();while(isO('&&')){i++;const b=cmp();a=!!a&&!!b}return a};
  const or=()=>{let a=and();while(isO('||')){i++;const b=and();a=!!a||!!b}return a};
  const r=or();if(i<T.length)throw 0;return r}catch(e){return{err:1}}}

/* editing one value (a small popup); n is the editor's NE or a copy of a stored note */
function ndbEdit(n,p,anchor,done){if(p.t==='tasks'||p.t==='formula')return;const r=anchor.getBoundingClientRect(),x=r.left+r.width/2,y=r.bottom+4,cur=(n.pv||{})[p.id];
  const set=v=>{n.pv=n.pv||{};if(v===''||v==null||v===false||(typeof v==='number'&&isNaN(v)))delete n.pv[p.id];else n.pv[p.id]=v;closePP();done&&done()};
  if(p.t==='check'){set(!cur);return}
  if(p.t==='select'||p.t==='status'){const pp=qPopAt(`<div class="aymh" dir="auto">${esc(p.n)}</div>${(p.opts||[]).map(o=>`<button data-o="${o.id}" class="${cur===o.id?'on':''}"><span class="ndbpill" style="--c:${o.c}">${esc(o.n)}</span></button>`).join('')}<button data-o="">✕ ${esc(t('ndb.clear'))}</button>`,x,y,'aymenu ndbmenu');
    pp.querySelectorAll('[data-o]').forEach(b=>b.onclick=()=>set(b.dataset.o));return}
  const ty=p.t==='num'?'number':p.t==='date'?'date':p.t==='link'?'url':'text';
  const pp=qPopAt(`<div class="aymh" dir="auto">${esc(p.n)}</div><input class="in" id="ndbIn" type="${ty}" data-native dir="auto" value="${esc(cur==null?'':String(cur))}"><div class="ndbpr"><button class="btn sm" id="ndbOk">${esc(t('ndb.ok'))}</button><button class="btn sm ghost" id="ndbClr">${esc(t('ndb.clear'))}</button></div>`,x,y,'aymenu ndbmenu');
  const inp=pp.querySelector('#ndbIn');setTimeout(()=>{try{inp.focus()}catch(e){}},40);
  const ok=()=>{let v=inp.value.trim();if(p.t==='num')v=v===''?'':+v;if(p.t==='link'&&v&&!/^https?:\/\//i.test(v))v='https://'+v;set(v)};
  pp.querySelector('#ndbOk').onclick=ok;pp.querySelector('#ndbClr').onclick=()=>set('');inp.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();ok()}}}
function ndbSetNote(id,mut){const n=NOTES().find(x=>x.id===id);if(!n)return;mut(n);n.updated=Date.now();save();notesChanged()}

/* the note editor: a properties block under the title, and the linked tasks */
function ndbEdPaint(){const box=$('#noteBox');if(!box||!NE)return;box.querySelector('#ndbEd')?.remove();const head=box.querySelector('.nehead');if(!head)return;
  const f=ndbNoteF(NE),P=ndbProps(f),tk=NE._new?{all:0}:ndbTk(NE);if(!P.length&&!tk.all)return;
  const d=document.createElement('div');d.id='ndbEd';d.className='ndbed';
  d.innerHTML=P.map(p=>`<div class="ndber"><span class="ndbk">${ndbIco(p.t)}<span dir="auto">${esc(p.n)}</span></span><span class="ndbv${p.t==='tasks'||p.t==='formula'?' ro':''}" data-ndbe="${p.id}" tabindex="0" role="button">${ndbShow(NE,p)||`<span class="ndbmu">${esc(t(p.t==='tasks'?'ndb.tkNone':'ndb.empty'))}</span>`}</span></div>`).join('')
    +(tk.all&&!P.some(p=>p.t==='tasks')?`<div class="ndber"><span class="ndbk">${ndbIco('tasks')}<span>${esc(t('ndb.tTasks'))}</span></span><span class="ndbv" data-ndbe="_tk" tabindex="0" role="button">${ndbShow(NE,{t:'tasks'})}</span></div>`:'')
    +`<div class="ndbedf">${f?`<button type="button" class="btn sm ghost" id="ndbEdP">⚙ ${esc(t('ndb.props'))}</button>`:''}<button type="button" class="btn sm ghost" id="ndbEdT">＋ ${esc(t('ndb.addTask'))}</button></div>`;
  head.insertAdjacentElement('afterend',d);
  d.querySelectorAll('[data-ndbe]').forEach(el=>el.onclick=e=>{if(e.target.closest('a'))return;const id=el.dataset.ndbe,p=P.find(q=>q.id===id);if(id==='_tk'||(p&&p.t==='tasks')){ndbTkList(NE,el);return}if(!p||p.t==='formula')return;
    ndbEdit(NE,p,el,()=>{if(!NE._new){const n=NOTES().find(x=>x.id===NE.id);if(n){n.pv=JSON.parse(JSON.stringify(NE.pv||{}));n.updated=Date.now();save()}}ndbEdPaint()})});
  d.querySelectorAll('[data-ndbu]').forEach(a=>a.onclick=e=>{e.preventDefault();openExt(a.dataset.ndbu)});
  d.querySelector('#ndbEdP')?.addEventListener('click',()=>ndbPropsOpen(f));d.querySelector('#ndbEdT').onclick=()=>ndbAddTask()}
function ndbAddTask(){if(!NE)return;const v=(prompt(t('ndb.taskQ'))||'').trim();if(!v)return;const k=todayKey();day(k).tasks=day(k).tasks||[];day(k).tasks.push({id:uid(),text:v,done:false,created:Date.now(),note:NE.id});NDB.tk=null;save();toast(t('ndb.taskAdded'));ndbEdPaint();try{if(curView()==='today')renderTasks()}catch(e){}}
function ndbTkList(n,anchor){const r=ndbTk(n),b=anchor.getBoundingClientRect();if(!r.all){ndbAddTask();return}const td=todayKey();
  const pp=qPopAt(`<div class="aymh">${esc(t('ndb.tTasks'))} · ${r.done}/${r.all}</div>${r.L.sort((a,c)=>a.k<c.k?1:-1).slice(0,30).map(({k,x})=>`<label class="ndbtl${x.done?' dn':''}"><input type="checkbox" data-tl="${k}|${esc(x.id)}"${x.done?' checked':''}><span dir="auto">${esc(x.text)}</span>${k!==td?`<small>${esc(gShort(keyToDate(k)))}</small>`:''}</label>`).join('')}`,b.left+b.width/2,b.bottom+4,'aymenu ndbmenu');
  pp.querySelectorAll('[data-tl]').forEach(c=>c.onchange=()=>{const [k,id]=c.dataset.tl.split('|'),x=((S.days[k]||{}).tasks||[]).find(q=>String(q.id)===id);if(!x)return;x.done=c.checked;x.doneAt=x.done?Date.now():null;NDB.tk=null;save();c.closest('label').classList.toggle('dn',x.done);ndbEdPaint();try{if(curView()==='today')renderTasks()}catch(e){}})}
{hookFn('renderNoteEd',()=>renderNoteEd,f=>{renderNoteEd=f},'post',function(){try{ndbEdPaint()}catch(e){console.error(e)}})}
{hookFn('neShowMode',()=>neShowMode,f=>{neShowMode=f},'post',function(){try{ndbEdPaint()}catch(e){console.error(e)}})}

/* 21: the folder's properties */
function ndbPropsOpen(f){if(!f)return;const P=JSON.parse(JSON.stringify(ndbProps(f)));
  const paint=()=>{const b=$('#ndbPB');if(!b)return;
    b.innerHTML=P.map((p,i)=>`<div class="ndbpe" data-i="${i}"><div class="ndbpe1"><input class="in" data-k="n" dir="auto" value="${esc(p.n)}" placeholder="${esc(t('ndb.pName'))}"><select class="in" data-k="t">${NDB_T.map(x=>`<option value="${x}"${x===p.t?' selected':''}>${esc(t('ndb.t.'+x))}</option>`).join('')}</select><button type="button" class="btn sm ghost" data-up="${i}" aria-label="↑">↑</button><button type="button" class="btn sm ghost" data-x="${i}" aria-label="✕">✕</button></div>`
      +(p.t==='select'||p.t==='status'?`<div class="ndbops">${(p.opts||[]).map((o,j)=>`<span class="ndbope"><button type="button" class="ndbsw" data-oc="${j}" style="--c:${o.c}" aria-label="${esc(t('ndb.color'))}"></button><input class="in" data-on="${j}" dir="auto" value="${esc(o.n)}"><button type="button" class="btn sm ghost" data-ox="${j}" aria-label="✕">✕</button></span>`).join('')}<button type="button" class="btn sm ghost" data-oa>＋ ${esc(t('ndb.opt'))}</button></div>`:'')
      +(p.t==='formula'?`<input class="in ndbfx" data-k="f" dir="auto" value="${esc(p.f||'')}" placeholder="${esc(t('ndb.fPh'))}"><small class="ndbfh">${esc(t('ndb.fHelp'))}</small>`:'')
      +(p.t==='tasks'?`<small class="ndbfh">${esc(t('ndb.tkHelp'))}</small>`:'')+`</div>`).join('')||`<small class="muted">${esc(t('ndb.noProps'))}</small>`;
    const pi=el=>P[+el.closest('[data-i]').dataset.i];
    b.querySelectorAll('[data-k]').forEach(el=>{const h=()=>{const p=pi(el),k=el.dataset.k;p[k]=el.value;if(k==='t'){if((p.t==='select'||p.t==='status')&&!(p.opts&&p.opts.length))p.opts=p.t==='status'?ndbStatusOpts():[{id:uid(),n:t('ndb.opt')+' 1',c:NDB_C[1]}];paint()}};if(el.tagName==='SELECT')el.onchange=h;else el.oninput=h});
    b.querySelectorAll('[data-on]').forEach(el=>el.oninput=()=>{pi(el).opts[+el.dataset.on].n=el.value});
    b.querySelectorAll('[data-oc]').forEach(el=>el.onclick=()=>{const o=pi(el).opts[+el.dataset.oc];o.c=NDB_C[(NDB_C.indexOf(o.c)+1)%NDB_C.length];el.style.setProperty('--c',o.c)});
    b.querySelectorAll('[data-ox]').forEach(el=>el.onclick=()=>{pi(el).opts.splice(+el.dataset.ox,1);paint()});
    b.querySelectorAll('[data-oa]').forEach(el=>el.onclick=()=>{const p=pi(el);p.opts=p.opts||[];p.opts.push({id:uid(),n:'',c:NDB_C[p.opts.length%NDB_C.length]});paint();const L_=b.querySelectorAll(`[data-i="${P.indexOf(p)}"] [data-on]`);L_[L_.length-1]?.focus()});
    b.querySelectorAll('[data-x]').forEach(el=>el.onclick=()=>{P.splice(+el.dataset.x,1);paint()});
    b.querySelectorAll('[data-up]').forEach(el=>el.onclick=()=>{const i=+el.dataset.up;if(i>0){[P[i-1],P[i]]=[P[i],P[i-1]];paint()}})};
  openInfo(esc(t('ndb.propsT',f.n)),`<div id="ndbPB" class="ndbpb"></div><div class="ndbpr"><button type="button" class="btn sm ghost" id="ndbPAdd">＋ ${esc(t('ndb.addProp'))}</button><span class="nfsp"></span><button type="button" class="btn sm" id="ndbPOk">${esc(t('ndb.save'))}</button></div>`);
  $('#infoBox')?.classList.add('ndbpbox');paint();
  $('#ndbPAdd').onclick=()=>{P.push({id:uid(),n:'',t:'text'});paint();const ins=$$('#ndbPB [data-k="n"]');ins[ins.length-1]?.focus()};
  $('#ndbPOk').onclick=()=>{const before=JSON.stringify(f.props||[]);
    f.props=P.filter(p=>String(p.n||'').trim()).map(p=>{p.n=p.n.trim();if(p.t==='select'||p.t==='status')p.opts=(p.opts||[]).filter(o=>String(o.n||'').trim());else delete p.opts;if(p.t!=='formula')delete p.f;return p});
    save();$('#infoModal').classList.remove('on');renderNotes();if(NE&&$('#noteModal.on'))ndbEdPaint();
    toastAct(t('ndb.saved'),t('undo'),()=>{f.props=JSON.parse(before);save();renderNotes()})}}
{hookFn('openInfo',()=>openInfo,f=>{openInfo=f},'pre',function(){try{$('#infoBox')?.classList.remove('ndbpbox')}catch(e){}})}

/* 22 / 23 / 26: views of a folder — the usual cards, saved tables and boards with their sort and filter */
function ndbMatch(n,p,c){const sel=p.t==='select'||p.t==='status',r=p.id==='_t'?(n.title||''):ndbRaw(n,p),s=r&&r.err?'':String(r===true?'1':r===false?'':r),v=c.v==null?'':String(c.v);
  switch(c.op){
    case'is':return sel?(n.pv||{})[p.id]===c.v:lshNorm(s)===lshNorm(v);
    case'not':return sel?(n.pv||{})[p.id]!==c.v:lshNorm(s)!==lshNorm(v);
    case'has':return lshNorm(s).includes(lshNorm(v));
    case'empty':return s==='';case'full':return s!=='';
    case'gt':return s!==''&&(isNaN(+s)||isNaN(+v)?s>v:+s>+v);
    case'lt':return s!==''&&(isNaN(+s)||isNaN(+v)?s<v:+s<+v);
    default:return true}}
function ndbSortKey(n,p){if(p.t==='select'||p.t==='status'){const i=(p.opts||[]).findIndex(o=>o.id===(n.pv||{})[p.id]);return i<0?'':i}const r=ndbRaw(n,p);return r&&r.err?'':typeof r==='string'?r.toLowerCase():r===true?1:r===false?0:r}
function ndbRows(f,v){const P=ndbProps(f);let L_=sortNotes(NOTES().filter(n=>!n.arc&&n.fd===f.id&&!(n.parent&&NOTES().some(x=>x.id===n.parent))&&!(n.lock&&!notesUnlocked())));
  (v.flt||[]).forEach(c=>{const p=c.p==='_t'?{id:'_t',t:'text'}:P.find(q=>q.id===c.p);if(p)L_=L_.filter(n=>ndbMatch(n,p,c))});
  const s=v.sort;if(s&&s.p){const p=s.p==='_t'?null:P.find(q=>q.id===s.p);if(p||s.p==='_t'){const key=n=>p?ndbSortKey(n,p):(n.title||'').toLowerCase();
    L_=L_.slice().sort((a,b)=>{const x=key(a),y=key(b),e1=x===''||x==null,e2=y===''||y==null;if(e1!==e2)return e1?1:-1;return(x<y?-1:x>y?1:0)*(s.d<0?-1:1)})}}
  return L_}
function ndbTitle(n){return esc(n.title||mdPlain(n.body||'').slice(0,40)||t('notes.untitled'))}
function ndbTableHTML(f,v,L_){const P=ndbProps(f),s=v.sort||{};
  const th=(id,lab,ic)=>`<th data-ndbs="${id}" class="${s.p===id?'srt':''}" title="${esc(t('ndb.sortBy'))}">${ic||''}<span dir="auto">${esc(lab)}</span>${s.p===id?(s.d<0?' ↓':' ↑'):''}</th>`;
  return `<div class="ndbtw scrollx"><table class="ndbt"><thead><tr>${th('_t',t('ndb.title'))}${P.map(p=>th(p.id,p.n,ndbIco(p.t))).join('')}<th class="ndbpa"><button type="button" class="btn sm ghost" data-ndbpa aria-label="${esc(t('ndb.addProp'))}" title="${esc(t('ndb.addProp'))}">＋</button></th></tr></thead><tbody>`
    +L_.map(n=>`<tr><td class="ndbtt"><button type="button" class="ndbop" data-ndbo="${n.id}" dir="auto">${typeof nsbIco==='function'?nsbIco(n,14):''}${ndbTitle(n)}</button></td>${P.map(p=>`<td class="ndbc t-${p.t}" data-ndbc="${n.id}|${p.id}">${ndbShow(n,p)}</td>`).join('')}<td></td></tr>`).join('')
    +`</tbody></table></div>${L_.length?'':`<div class="empty">${esc(t('ndb.none'))}</div>`}<button type="button" class="btn sm ghost ndbnew" data-ndbnew="">＋ ${esc(t('ndb.newRow'))}</button>`}
function ndbGrpP(f,v){const P=ndbProps(f);return P.find(p=>p.id===v.grp&&(p.t==='select'||p.t==='status'))||P.find(p=>p.t==='status')||P.find(p=>p.t==='select')||null}
function ndbBoardHTML(f,v,L_){const gp=ndbGrpP(f,v);if(!gp)return `<div class="ndbnog"><p>${esc(t('ndb.noGrp'))}</p><button type="button" class="btn sm" id="ndbMkSt">＋ ${esc(t('ndb.mkStatus'))}</button></div>`;
  const P=ndbProps(f).filter(p=>p.id!==gp.id).slice(0,3),val=n=>{const x=(n.pv||{})[gp.id];return ndbOpt(gp,x)?x:''};
  const cols=[...(gp.opts||[]),{id:'',n:t('ndb.noVal'),c:'#8a8f98'}];
  return `<div class="ndbb scrollx">${cols.map(o=>{const its=L_.filter(n=>val(n)===o.id);if(!o.id&&!its.length)return'';
    return `<div class="ndbcol" data-ndbcol="${o.id}"><div class="ndbch"><span class="ndbpill" style="--c:${o.c}">${esc(o.n)}</span><small>${its.length}</small></div><div class="ndbcl">${its.map(n=>`<div class="ndbcard" draggable="${MOB.matches?'false':'true'}" data-ndbo="${n.id}" tabindex="0" role="button"><b dir="auto">${typeof nsbIco==='function'?nsbIco(n,13):''}${ndbTitle(n)}</b>${P.map(p=>{const h=ndbShow(n,p);return h?`<span class="ndbcf"><small dir="auto">${esc(p.n)}</small>${h}</span>`:''}).join('')}<button type="button" class="ndbmv" data-ndbmv="${n.id}" aria-label="${esc(t('ndb.move'))}" title="${esc(t('ndb.move'))}">⇄</button></div>`).join('')}</div><button type="button" class="ndbadd" data-ndbnew="${o.id}" aria-label="${esc(t('ndb.newRow'))}">＋</button></div>`}).join('')}</div>`}
function ndbSetGrp(f,v,id,val){const gp=ndbGrpP(f,v);if(!gp)return;ndbSetNote(id,n=>{n.pv=n.pv||{};if(val)n.pv[gp.id]=val;else delete n.pv[gp.id]})}
function ndbNew(f,v,gv){openNote(null);if(!NE)return;NE.fd=f.id;try{nteFdPaint()}catch(e){}const gp=v.k==='board'?ndbGrpP(f,v):null;if(gp&&gv){NE.pv={[gp.id]:gv}}ndbEdPaint()}
function ndbMoveMenu(f,v,id,anchor){const gp=ndbGrpP(f,v);if(!gp)return;const r=anchor.getBoundingClientRect(),cur=((NOTES().find(x=>x.id===id)||{}).pv||{})[gp.id]||'';
  const pp=qPopAt(`<div class="aymh" dir="auto">${esc(gp.n)}</div>${(gp.opts||[]).map(o=>`<button data-o="${o.id}" class="${cur===o.id?'on':''}"><span class="ndbpill" style="--c:${o.c}">${esc(o.n)}</span></button>`).join('')}<button data-o="">${esc(t('ndb.noVal'))}</button>`,r.left+r.width/2,r.bottom+4,'aymenu ndbmenu');
  pp.querySelectorAll('[data-o]').forEach(b=>b.onclick=()=>{closePP();ndbSetGrp(f,v,id,b.dataset.o)})}
function ndbBind(box,f,v){
  box.querySelectorAll('[data-ndbo]').forEach(b=>b.addEventListener('click',e=>{if(e.target.closest('[data-ndbmv],a'))return;openNote(b.dataset.ndbo)}));
  box.querySelectorAll('.ndbcard').forEach(c=>c.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();openNote(c.dataset.ndbo)}});
  box.querySelectorAll('[data-ndbs]').forEach(h=>h.onclick=()=>{const p=h.dataset.ndbs;v.sort=v.sort&&v.sort.p===p?(v.sort.d>0?{p,d:-1}:null):{p,d:1};save();renderNotes()});
  box.querySelectorAll('[data-ndbc]').forEach(c=>c.onclick=e=>{if(e.target.closest('a'))return;const [nid,pid]=c.dataset.ndbc.split('|'),p=ndbProps(f).find(q=>q.id===pid),n=NOTES().find(x=>x.id===nid);if(!p||!n)return;
    if(p.t==='tasks'){ndbTkList(n,c);return}const cp={pv:Object.assign({},n.pv||{})};ndbEdit(cp,p,c,()=>ndbSetNote(nid,x=>{x.pv=cp.pv}))});
  box.querySelectorAll('[data-ndbnew]').forEach(b=>b.onclick=()=>ndbNew(f,v,b.dataset.ndbnew));
  box.querySelectorAll('[data-ndbmv]').forEach(b=>b.onclick=e=>{e.stopPropagation();ndbMoveMenu(f,v,b.dataset.ndbmv,b)});
  box.querySelectorAll('[data-ndbpa]').forEach(b=>b.onclick=()=>ndbPropsOpen(f));
  box.querySelectorAll('[data-ndbu]').forEach(a=>a.onclick=e=>{e.preventDefault();e.stopPropagation();openExt(a.dataset.ndbu)});
  const mk=box.querySelector('#ndbMkSt');if(mk)mk.onclick=()=>{f.props=f.props||[];const p={id:uid(),n:t('ndb.status'),t:'status',opts:ndbStatusOpts()};f.props.push(p);v.grp=p.id;save();renderNotes()};
  box.querySelectorAll('.ndbcard[draggable="true"]').forEach(c=>{c.ondragstart=e=>{NDB.drag=c.dataset.ndbo;try{e.dataTransfer.setData('text/plain','ndb:'+NDB.drag);e.dataTransfer.effectAllowed='move'}catch(x){}c.classList.add('ndbdg')};
    c.ondragend=()=>{NDB.drag=null;c.classList.remove('ndbdg');box.querySelectorAll('.ndbov').forEach(x=>x.classList.remove('ndbov'))}});
  box.querySelectorAll('.ndbcol').forEach(col=>{col.ondragover=e=>{if(!NDB.drag)return;e.preventDefault();col.classList.add('ndbov')};col.ondragleave=e=>{if(!col.contains(e.relatedTarget))col.classList.remove('ndbov')};
    col.ondrop=e=>{if(!NDB.drag)return;e.preventDefault();e.stopPropagation();const id=NDB.drag;NDB.drag=null;ndbSetGrp(f,v,id,col.dataset.ndbcol)}})}
function ndbViewAdd(f,anchor){const r=anchor.getBoundingClientRect();const pp=qPopAt(`<button data-k="table">▦ ${esc(t('ndb.table'))}</button><button data-k="board">▥ ${esc(t('ndb.board'))}</button>`,r.left+r.width/2,r.bottom+4,'aymenu ndbmenu');
  pp.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{closePP();const k=b.dataset.k,v={id:uid(),n:t(k==='board'?'ndb.board':'ndb.table'),k};f.views=f.views||[];f.views.push(v);const gp=k==='board'?ndbGrpP(f,v):null;if(gp)v.grp=gp.id;f.vw=v.id;save();renderNotes()})}
function ndbViewMenu(f,id,anchor){const v=(f.views||[]).find(x=>x.id===id);if(!v)return;const r=anchor.getBoundingClientRect(),G=ndbProps(f).filter(p=>p.t==='select'||p.t==='status'),gp=ndbGrpP(f,v);
  const pp=qPopAt(`<div class="aymh" dir="auto">${esc(v.n)}</div><button data-a="ren">✎ ${esc(t('ndb.rename'))}</button><button data-a="k">${v.k==='board'?'▦ '+esc(t('ndb.table')):'▥ '+esc(t('ndb.board'))}</button>${v.k==='board'&&G.length>1?G.map(q=>`<button data-g="${q.id}" class="${gp===q?'on':''}">${esc(t('ndb.grp'))}: <span dir="auto">${esc(q.n)}</span></button>`).join(''):''}<button data-a="flt">≡ ${esc(t('ndb.flt'))}${v.flt&&v.flt.length?' ('+v.flt.length+')':''}</button>${v.sort?`<button data-a="sx">↕ ${esc(t('ndb.sortX'))}</button>`:''}<button data-a="del" class="nfdanger">✕ ${esc(t('ndb.del'))}</button>`,r.left+r.width/2,r.bottom+4,'aymenu ndbmenu');
  pp.querySelectorAll('[data-g]').forEach(b=>b.onclick=()=>{closePP();v.grp=b.dataset.g;save();renderNotes()});
  pp.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{closePP();const a=b.dataset.a;
    if(a==='ren'){const s=(prompt(t('ndb.vName'),v.n)||'').trim();if(s){v.n=s;save();renderNotes()}return}
    if(a==='k'){v.k=v.k==='board'?'table':'board';if(v.k==='board'&&!v.grp){const g=ndbGrpP(f,v);if(g)v.grp=g.id}save();renderNotes();return}
    if(a==='flt'){ndbFltOpen(f,v);return}
    if(a==='sx'){v.sort=null;save();renderNotes();return}
    if(a==='del'){const before=JSON.stringify(f.views||[]);f.views=(f.views||[]).filter(x=>x!==v);f.vw='';save();renderNotes();toastAct(t('ndb.deleted'),t('undo'),()=>{f.views=JSON.parse(before);f.vw=v.id;save();renderNotes()})}})}
function ndbFltOpen(f,v){const P=[{id:'_t',n:t('ndb.title'),t:'text'}].concat(ndbProps(f).filter(p=>p.t!=='tasks'||true));let rows=(v.flt||[]).map(c=>Object.assign({},c));if(!rows.length)rows.push({p:'_t',op:'has',v:''});
  const OPS=['is','not','has','empty','full','gt','lt'];
  const paint=()=>{const b=$('#ndbFB');if(!b)return;b.innerHTML=rows.map((c,i)=>{const p=P.find(x=>x.id===c.p)||P[0],sel=p.t==='select'||p.t==='status';if(sel&&!c.v&&(p.opts||[])[0])c.v=p.opts[0].id;
      return `<div class="ndbfr" data-i="${i}"><select class="in" data-k="p">${P.map(x=>`<option value="${x.id}"${x.id===p.id?' selected':''}>${esc(x.n)}</option>`).join('')}</select><select class="in" data-k="op">${OPS.map(o=>`<option value="${o}"${o===c.op?' selected':''}>${esc(t('ndb.op.'+o))}</option>`).join('')}</select>${c.op==='empty'||c.op==='full'?'':sel?`<select class="in" data-k="v">${(p.opts||[]).map(o=>`<option value="${o.id}"${o.id===c.v?' selected':''}>${esc(o.n)}</option>`).join('')}</select>`:`<input class="in" data-k="v" dir="auto" value="${esc(c.v||'')}">`}<button type="button" class="btn sm ghost" data-x="${i}" aria-label="✕">✕</button></div>`}).join('');
    b.querySelectorAll('[data-k]').forEach(el=>{const h=()=>{const c=rows[+el.closest('[data-i]').dataset.i];c[el.dataset.k]=el.value;if(el.dataset.k==='p'){c.v='';paint()}else if(el.dataset.k==='op')paint()};if(el.tagName==='SELECT')el.onchange=h;else el.oninput=h});
    b.querySelectorAll('[data-x]').forEach(x=>x.onclick=()=>{rows.splice(+x.dataset.x,1);paint()})};
  openInfo(esc(t('ndb.flt')+' · '+v.n),`<div id="ndbFB" class="ndbfb"></div><div class="ndbpr"><button type="button" class="btn sm ghost" id="ndbFAdd">＋ ${esc(t('ndb.cond'))}</button><span class="nfsp"></span><button type="button" class="btn sm" id="ndbFOk">${esc(t('ndb.ok'))}</button></div>`);
  $('#infoBox')?.classList.add('ndbpbox');paint();
  $('#ndbFAdd').onclick=()=>{rows.push({p:'_t',op:'has',v:''});paint()};
  $('#ndbFOk').onclick=()=>{v.flt=rows.filter(c=>c.op==='empty'||c.op==='full'||String(c.v||'').trim());save();$('#infoModal').classList.remove('on');renderNotes()}}
function ndbBarPaint(){const w=$('#notesWrap'),g=$('#notesGrid');if(!w||!g)return;w.querySelector('#ndbBar')?.remove();w.querySelector('#ndbBox')?.remove();g.hidden=false;
  const q=(($('#nSearch')||{}).value||'').trim(),f=ndbF(NF.cur);if(!f||NF.arc||q||(typeof nTag!=='undefined'&&nTag))return;
  const V=f.views||[],cur=ndbView(f),np=ndbProps(f).length,bar=document.createElement('div');bar.id='ndbBar';bar.className='ndbbar';
  bar.innerHTML=`<div class="ndbvs scrollx"><button type="button" class="ndbvc${cur?'':' on'}" data-ndbv="">▤ ${esc(t('ndb.cards'))}</button>${V.map(x=>`<button type="button" class="ndbvc${cur&&cur.id===x.id?' on':''}" data-ndbv="${x.id}">${x.k==='board'?'▥':'▦'} <span dir="auto">${esc(x.n)}</span>${cur&&cur.id===x.id?`<i class="ndbvm" data-ndbvm="${x.id}" role="button" aria-label="${esc(t('ndb.vOpts'))}">⋯</i>`:''}</button>`).join('')}<button type="button" class="ndbvc ndbvadd" id="ndbVAdd">＋ ${esc(t('ndb.view'))}</button></div><button type="button" class="btn sm ghost" id="ndbPBtn">⚙ ${esc(t('ndb.props'))}${np?' ('+np+')':''}</button>`;
  g.before(bar);
  bar.querySelectorAll('[data-ndbv]').forEach(b=>b.onclick=e=>{const m=e.target.closest('[data-ndbvm]');if(m){e.stopPropagation();ndbViewMenu(f,m.dataset.ndbvm,m);return}f.vw=b.dataset.ndbv||'';save();renderNotes()});
  bar.querySelector('#ndbVAdd').onclick=e=>ndbViewAdd(f,e.currentTarget);bar.querySelector('#ndbPBtn').onclick=()=>ndbPropsOpen(f);
  if(!cur)return;g.hidden=true;const box=document.createElement('div');box.id='ndbBox';box.className='ndbbox';g.after(box);const L_=ndbRows(f,cur);
  box.innerHTML=(cur.flt&&cur.flt.length?`<div class="ndbfl">≡ ${esc(t('ndb.fltOn',cur.flt.length))}<button type="button" class="btn sm ghost" data-ndbfe>${esc(t('ndb.edit'))}</button><button type="button" class="btn sm ghost" data-ndbfx aria-label="✕">✕</button></div>`:'')+(cur.k==='board'?ndbBoardHTML(f,cur,L_):ndbTableHTML(f,cur,L_));
  box.querySelector('[data-ndbfx]')?.addEventListener('click',()=>{cur.flt=[];save();renderNotes()});box.querySelector('[data-ndbfe]')?.addEventListener('click',()=>ndbFltOpen(f,cur));ndbBind(box,f,cur)}
{hookFn('renderNotes',()=>renderNotes,f=>{renderNotes=f},'post',function(){try{ndbBarPaint()}catch(e){console.error(e)}})}
/* the usual cards show up to three filled properties */
{const _c=noteCard;noteCard=function(n,...a){let h=_c(n,...a);try{const P=ndbProps(ndbNoteF(n)).slice(0,6),ch=P.map(p=>{const s=ndbShow(n,p);return s?`<span class="ndbcpi">${s}</span>`:''}).filter(Boolean).slice(0,3);if(ch.length)h=h.replace(/<\/div><\/button>$/,`<div class="ndbcp">${ch.join('')}</div></div></button>`)}catch(e){}return h}}

WNP['3.141.0']=[{k:'wnp.ndb',f:()=>`<table class="ndbt" style="font-size:12px"><thead><tr><th>${esc(t('ndb.title'))}</th><th>${esc(t('ndb.status'))}</th><th>${esc(t('ndb.tTasks'))}</th></tr></thead><tbody><tr><td>${esc(t('wnp.ndbA'))}</td><td><span class="ndbpill" style="--c:#e0b43a">${esc(t('ndb.s2'))}</span></td><td><span class="ndbtk"><i style="--p:60%"></i><small>3/5</small></span></td></tr><tr><td>${esc(t('wnp.ndbB'))}</td><td><span class="ndbpill" style="--c:#5fae5a">${esc(t('ndb.s3'))}</span></td><td><span class="ndbtk"><i style="--p:100%"></i><small>4/4</small></span></td></tr></tbody></table>`}];

