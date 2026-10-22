/* ============ v3.90.1: no emoji anywhere (his request): the window title and the alert/notification texts drop theirs too ============ */
{const _a=alertUser;alertUser=function(title,body,...r){if(!document.documentElement.classList.contains('emoji')){title=uicStrip(title);body=uicStrip(body)}return _a(title,body,...r)}}
{hookFn('extraSched',()=>extraSched,f=>{extraSched=f},'post',function(out){try{if(document.documentElement.classList.contains('emoji'))return;out.forEach(x=>{if(x){x.title=uicStrip(x.title);x.body=uicStrip(x.body)}})}catch(e){}})}
{let busy=false;const fix=()=>{if(busy||document.documentElement.classList.contains('emoji'))return;const v=document.title,nv=uicStrip(v);if(nv!==v){busy=true;document.title=nv;busy=false}};
  const tt=document.querySelector('title');if(tt)new MutationObserver(fix).observe(tt,{childList:true,characterData:true,subtree:true});fix()}
new MutationObserver(ms=>{if(document.documentElement.classList.contains('emoji'))return;for(const m of ms){const e=m.target,a=m.attributeName,v=e.getAttribute(a);if(!v)continue;const nv=uicStrip(v);if(nv!==v)e.setAttribute(a,nv)}}).observe(document.body,{attributes:true,attributeFilter:['title','aria-label'],subtree:true});
/* tasks made by the app start with an emoji («🎬 درس اليوم…»): that leading emoji is shown as an icon (task text is otherwise left as written; the stored text is unchanged) */
function txLead(root){if(!root||root.nodeType!==1||document.documentElement.classList.contains('emoji'))return;const L_=root.matches('.tx')?[root]:[...root.querySelectorAll('.tx')];
  L_.forEach(el=>{if(el.isContentEditable||el.closest('[contenteditable="true"]'))return;const tn=el.firstChild;if(!tn||tn.nodeType!==3)return;const s=tn.data,m=s.match(UIC_TEST);if(!m||m.index>1||s.slice(0,m.index).trim())return;
    const key=UIC_E[m[1]]||UIC_E[m[0]];if(!key)return;tn.data=s.slice(m.index+m[0].length).replace(/^️/,'');el.insertBefore(uicNode(key,m[0]),tn)})}
new MutationObserver(ms=>{for(const m of ms)for(const n of m.addedNodes)if(n.nodeType===1)txLead(n)}).observe(document.body,{childList:true,subtree:true});try{txLead(document.body)}catch(e){}
/* everything already on the page when this module loads gets the new icons and the attribute pass */
try{uicPass(document.body)}catch(e){}
