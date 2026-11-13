/* ============ v3.174.5 «يومك بكلمة» and «نيّة اليوم» ask inside the app instead of the browser's file:// prompt ============ */
function uiAsk(title,val,cb,o){o=o||{};openInfo(esc(title),`<input class="in uia-in" id="uiaIn" dir="auto" maxlength="${o.max||60}" value="${esc(val||'')}" placeholder="${esc(o.ph||'')}" autocomplete="off">`);
  const box=$('#infoBox');box.className='box infobox uiabox';const i=$('#uiaIn'),ok=$('#infoX');ok.textContent=t('pdl.save');ok.insertAdjacentHTML('beforebegin',`<button class="btn sm ghost" id="uiaX">${esc(t('lt.cancel'))}</button>`);
  const close=()=>$('#infoModal').classList.remove('on'),go=()=>{const v=i.value.trim();close();cb(v)};ok.onclick=go;$('#uiaX').onclick=close;i.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();go()}};setTimeout(()=>{i.focus();i.select()},60)}
moodWord=function(){const d=day(todayKey());uiAsk(t('mwd.q'),d.moodW||'',v=>{if(!v)return;d.moodW=v.slice(0,30);save();renderTodayEv();toast(t('mwd.ok'))},{max:30,ph:t('mwd.ph')})};
niyyaAsk=function(){const d=day(todayKey());uiAsk(t('ny.ask'),d.niyya||'',v=>{d.niyya=v;save();renderTodayEv();if(d.niyya)toast(t('ny.saved'))},{max:120,ph:t('ny.ph')})};
/* 3.174.7: his phone still showed the squeezed badge with the CSS rules in place, so the phone layout of the wall header is now set inline by script (a real line-break element, no ::after, no :has) */
function wallHdFit(){const g=$('#goalLbl'),h=g&&g.parentElement;if(!h)return;const ph=matchMedia('(max-width:700px)').matches;let br=h.querySelector(':scope>.wallbr');
  if(!br){br=document.createElement('i');br.className='wallbr';br.setAttribute('aria-hidden','true');h.appendChild(br)}
  const set=(el,o)=>{for(const k in o){if(ph)el.style.setProperty(k,o[k],'important');else el.style.removeProperty(k)}};
  set(h,{'flex-wrap':'wrap','justify-content':'flex-start','row-gap':'10px','column-gap':'8px'});
  set(br,{'display':'block','flex':'0 0 100%','width':'100%','height':'0','order':'3'});if(!ph)br.style.setProperty('display','none');
  [...h.children].forEach(c=>{if(c===br)return;
    if(c===g){set(c,{'order':'1','white-space':'nowrap','margin':'0','min-width':'0','max-width':'100%','overflow':'hidden','text-overflow':'ellipsis','flex':'0 1 auto'});
      const pill={'font-size':'12px','font-weight':'700','color':'var(--accent)','padding':'3px 10px','border-radius':'999px','border':'1px solid var(--accent)','line-height':'1.5'};for(const k in pill){if(ph&&g.textContent.trim())c.style.setProperty(k,pill[k],'important');else c.style.removeProperty(k)}return}
    if(c.classList.contains('uxcm')){set(c,{'order':'2','margin-inline-start':'auto'});return}
    if(c.tagName==='SPAN'&&!c.id){set(c,{'order':'0','white-space':'nowrap','flex':'0 0 auto'});return}
    set(c,{'order':'4','margin-inline-start':'0'})});
  if(!h._wmo){h._wmo=new MutationObserver(()=>{clearTimeout(h._wmt);h._wmt=setTimeout(wallHdFit,30)});h._wmo.observe(h,{childList:true})}}
hookFn('renderGlass',()=>renderGlass,f=>{renderGlass=f},'post',function(){try{wallHdFit()}catch(e){}});
addEventListener('resize',()=>{try{wallHdFit()}catch(e){}});
setTimeout(()=>{try{wallHdFit()}catch(e){}},0);
/* 3.174.8: the look sheet's preview no longer sticks over the controls on phones (also set inline, like the wall header) */
hookFn('lkOpen',()=>lkOpen,f=>{lkOpen=f},'post',function(){try{const pv=$('#lkPv');if(pv&&matchMedia('(max-width:700px)').matches){pv.style.setProperty('position','relative','important');pv.style.setProperty('top','auto','important')}}catch(e){}});
