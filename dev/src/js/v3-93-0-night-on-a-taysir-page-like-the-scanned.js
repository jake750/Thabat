/* ============ v3.93.0: night on a Taysir page like the scanned Qalun mushaf (his report: the inverted cream page looked brown and dirty) ============ */
/* The Qalun scans are transparent, so at night only their ink is turned light on the mushaf's own dark paper. A Taysir page is drawn
   on an opaque cream background; at night (only for showing — the kept copy is unchanged) the cream is taken out («colour to alpha»
   against the page colour, faint paper texture dropped), then the page gets the same filter as the Qalun scans. */
async function tsAlpha(blob){const bm=await createImageBitmap(blob),c=document.createElement('canvas');c.width=bm.width;c.height=bm.height;
  const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(bm,0,0);bm.close&&bm.close();const im=x.getImageData(0,0,c.width,c.height),d=im.data,w=c.width,h=c.height;
  /* the paper colour: the brightest of a few samples near the corners and edges */
  const pts=[[4,4],[w-5,4],[4,h-5],[w-5,h-5],[w>>1,4],[w>>1,h-5],[4,h>>1],[w-5,h>>1]];let b=[0,0,0],bs=-1;
  pts.forEach(([px,py])=>{const i=(py*w+px)*4,s=d[i]+d[i+1]+d[i+2];if(s>bs){bs=s;b=[d[i],d[i+1],d[i+2]]}});
  /* ink = darker than the paper, or much more coloured than it (red/blue words, the frame); the paper's faint marbling is neither */
  const Lb=.3*b[0]+.59*b[1]+.11*b[2],cb=Math.max(...b)-Math.min(...b),T=.3;
  for(let i=0;i<d.length;i+=4){const r=d[i],g=d[i+1],bl=d[i+2],L=.3*r+.59*g+.11*bl,ch=Math.max(r,g,bl)-Math.min(r,g,bl);
    const a=Math.max((Lb-L)/Lb,(ch-cb)/110);if(a<=T){d[i+3]=0;continue}d[i+3]=Math.round(Math.min(1,(a-T)/.4)*255)}
  x.putImageData(im,0,0);const out=await new Promise(z=>c.toBlob(z,'image/png'));c.width=c.height=0;return out}
{const _l=qLoadImg;qLoadImg=function(im,p,r){const R=RIWAYAT[r];if(!R||!R.ts||!S.quran.dark)return _l(im,p,r);im.onerror=null;im.classList.add('tsp','tsa');
  tsCache(r,p).then(async b=>{let out=b;if(typeof b!=='string'){if(tsCrop()){try{out=await tsFrame(b,r+':'+p)||b}catch(e){}if(out!==b)im.classList.add('tsfr')}try{out=await tsAlpha(out)}catch(e){}}
    im.src=typeof out==='string'?out:URL.createObjectURL(out)}).catch(e=>tsFailBox(im,p,r,e&&e.code||'off'))}}

