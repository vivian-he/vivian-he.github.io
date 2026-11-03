/* Keep complete photo rows visible from the top to the bottom of the display. */
(()=>{
 let layer,queued=false;
 const style=document.createElement('style');style.textContent=`
 body:has(#review-photo-bleed) #viewport{z-index:1;background:transparent!important}
 body:has(#review-photo-bleed) #slide{background:transparent!important}
 body:has(#review-photo-bleed) .review-photo-wall{visibility:hidden!important}
 #review-photo-bleed{position:fixed;top:0;right:0;bottom:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));z-index:0;pointer-events:none;overflow:hidden}
 #review-photo-bleed figure{margin:0;min-height:0;overflow:hidden;background:#e7e9ed}
 #review-photo-bleed img{display:block;width:100%;height:100%;object-fit:cover;opacity:.5}
 `;document.head.append(style);
 function sync(){queued=false;const wall=document.querySelector('#slide .review-photo-wall');if(!wall){layer?.remove();layer=null;return}const photos=[...wall.querySelectorAll('img')];if(!photos.length)return;
  if(!layer){layer=document.createElement('div');layer.id='review-photo-bleed';layer.setAttribute('aria-hidden','true');document.body.prepend(layer)}
  const key=photos.map(e=>e.src).join('|');if(layer.dataset.photos!==key){layer.dataset.photos=key;layer.replaceChildren(...photos.map(photo=>{const f=document.createElement('figure'),img=document.createElement('img');img.src=photo.src;img.alt='';f.append(img);return f}))}
  const scale=document.querySelector('#slide').getBoundingClientRect().width/1200,rows=Math.ceil(photos.length/4),gap=10*scale,tile=(innerHeight-gap*(rows-1))/rows,width=4*tile+gap*3;layer.style.left='max(0px, calc(100% - '+width+'px))';layer.style.gridTemplateRows=`repeat(${rows},minmax(0,1fr))`;layer.style.gap=gap+'px';for(const f of layer.children)f.style.borderRadius=(12*scale)+'px';
 }
 function schedule(){if(!queued){queued=true;requestAnimationFrame(()=>requestAnimationFrame(sync))}}
 const stage=document.querySelector('#slide');if(stage)new MutationObserver(schedule).observe(stage,{childList:true,subtree:true});window.addEventListener('resize',schedule);schedule();
})();
