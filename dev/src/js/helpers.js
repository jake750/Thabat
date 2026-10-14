/* ============ helpers ============ */
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const uid=()=>Math.random().toString(36).slice(2,9)+Date.now().toString(36).slice(-4);
/* hooks: code that runs before/after a function, kept in flat lists instead of wrappers stacked one inside another.
   hookFn('name',()=>name,f=>{name=f},'pre'|'post',fn). Order is the order of registration (later 'pre' hooks run first,
   later 'post' hooks run last, exactly like nested wrappers). If something else replaced the function since, a new layer starts.
   hookFn.R[name] lists them for debugging; .prev holds an older layer. */
function hookFn(name,get,set,when,fn){const R=hookFn.R||(hookFn.R={});let H=R[name];
  if(!H||get()!==H.disp){const L={name,base:get(),pre:[],post:[],prev:H||null};
    L.disp=function(...a){for(const f of L.pre)f.apply(this,a);const r=L.base.apply(this,a);for(const f of L.post)f.apply(this,a);return r};
    R[name]=H=L;set(L.disp)}
  if(when==='pre')H.pre.unshift(fn);else H.post.push(fn)}
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const pad=n=>String(n).padStart(2,'0');
const ICON_TRASH='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/></svg>';
const ICON_MISBAHA=(()=>{let b='';for(let i=0;i<11;i++){const a=(120+i*30)*Math.PI/180;b+=`<circle cx="${(12+7*Math.cos(a)).toFixed(2)}" cy="${(10+7*Math.sin(a)).toFixed(2)}" r="1.55"/>`}return`<svg viewBox="0 0 24 24" fill="currentColor">${b}<circle cx="12" cy="19" r="1.9"/><path d="M12 20.5v2.6M12 21.6l-1.4 1.9M12 21.6l1.4 1.9" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" fill="none"/><path d="M15.5 16.1 12.9 18.3M8.5 16.1 11.1 18.3" stroke="currentColor" stroke-width=".9" fill="none"/></svg>`})();
const ICON_CHECK='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5 9-10"/></svg>';
const ICON_MOON='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
const ICON_SUN='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
const ICON_WALL='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M3 5h18v14H3zM3 9.7h18M3 14.3h18M9 5v4.7M15 5v4.7M6 9.7v4.6M12 9.7v4.6M18 9.7v4.6M9 14.3V19M15 14.3V19"/></svg>';const ICON_CUP='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 8h13v5a6 6 0 0 1-6 6h-1a6 6 0 0 1-6-6zM17 10h1.5a2.5 2.5 0 0 1 0 5H17M8 2v3M12 2v3"/></svg>';
const MICON={
  watch:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="3"/><path d="M10 9.5v5l4.5-2.5z" fill="currentColor"/></svg>',
  listen:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="14" width="5" height="7" rx="2"/><rect x="16" y="14" width="5" height="7" rx="2"/></svg>',
  read:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 5h6a4 4 0 0 1 4 4v11a3 3 0 0 0-3-3H2zM22 5h-6a4 4 0 0 0-4 4v11a3 3 0 0 1 3-3h7z"/></svg>'
};

