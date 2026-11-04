/* ============ v3.170.2 (his report 2026-11-04): colour codes such as #fb923c are not tags ============ */
function hexTagNo(tg){const s=String(tg||'').replace(/^#/,'').split('/')[0];return /^(?=[0-9a-f]*\d)(?:[0-9a-f]{6}|[0-9a-f]{8})$/i.test(s)||/^(?=[0-9a-f]*\d)(?=[0-9a-f]*[a-f])[0-9a-f]{3}$/i.test(s)}
{const _f=noteTags;noteTags=function(...a){const r=_f.apply(this,a);return Array.isArray(r)?r.filter(t=>!hexTagNo(t)):r}}
{const _f=tk13Tags;tk13Tags=function(...a){const r=_f.apply(this,a);return Array.isArray(r)?r.filter(t=>!hexTagNo(t)):r}}

