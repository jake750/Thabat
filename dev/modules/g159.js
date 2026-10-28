/* ============ v3.136.1: the notes tools added since 3.97 live in the «⋯» menu, not in the toolbar row ============ */
NX_MORE.push(['nObsLive','nx3.obsL'],['nGrB','nx3.gr'],['rlB','nx3.rl'],['nblB','nx3.bl'],['tgcB','nx3.tgc'],['tgsB','nx3.tgs'],['ntnB','nx3.ntn']);
function nxTidy(){NX_MORE.forEach(([id])=>{const b=$('#'+id);if(b)b.classList.add('nxhid')})}
{hookFn('renderNotes',()=>renderNotes,f=>{renderNotes=f},'post',function(){try{nxTidy()}catch(e){console.error(e)}})}
try{nxTidy()}catch(e){}
