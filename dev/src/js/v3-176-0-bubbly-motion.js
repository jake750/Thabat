/* ============ v3.176.0 his pick «ج · قوية» (2026-11-16): bubbly motion — the contents of a window or menu arrive one after another ============ */
/* The curves and shapes are in the CSS part (the 3.173 tokens now bounce, so every retimed rule and JS animation follows).
   apmOrigin runs exactly once when a window, menu or drop-down opens: that is the moment its children get the stagger class;
   it leaves after 0.8 s, so later repaints of an open menu do not animate again. */
function bubStagger(el){if(!el||!el.classList||apmRM())return;el.classList.add('bubst');clearTimeout(el._bubT);el._bubT=setTimeout(()=>el.classList.remove('bubst'),800)}
hookFn('apmOrigin',()=>apmOrigin,f=>{apmOrigin=f},'post',function(el){bubStagger(el)});
