/* Shared scroll chrome; original controls retain their original actions. */
(()=>{
 function watch(scroller,update){update();scroller.addEventListener('scroll',update,{passive:true})}
 function sync(){
  document.querySelectorAll('.gx-search').forEach(root=>{
   if(root.dataset.stickyReady)return;
   const row=root.querySelector('.gxs-search-row'),tabs=root.querySelector('.gxs-tabs'),chips=root.querySelector('.gxs-chip-row');if(!row||!tabs||!chips)return;
   root.dataset.stickyReady='true';const scroller=root.parentElement;scroller.tabIndex=0;scroller.setAttribute('aria-label','Search results');
   const measure=()=>{root.style.setProperty('--sticky-tabs-top',(59+row.offsetHeight)+'px');root.style.setProperty('--sticky-filters-top',(59+row.offsetHeight+tabs.offsetHeight)+'px')};measure();const sizing=new ResizeObserver(measure);sizing.observe(row);sizing.observe(tabs);
   watch(scroller,()=>root.classList.toggle('is-scrolled',scroller.scrollTop>2));
  });

  document.querySelectorAll('.mbt-root').forEach(root=>{
   if(root.querySelector('.shared-hub-sticky'))return;
   const scroller=root.querySelector('.mbt-scroll'),back=root.querySelector('.mbt-hero__back');if(!scroller||!back)return;scroller.tabIndex=0;scroller.setAttribute('aria-label','Meal Box selection');
   const bar=document.createElement('header');bar.className='shared-hub-sticky';bar.setAttribute('aria-label','Meal Box header');
   const button=back.cloneNode(true);button.className='';button.setAttribute('aria-label','Back');button.onclick=()=>back.click();bar.append(button);
   const title=document.createElement('strong');title.textContent='$12 Meal Box';bar.append(title);root.append(bar);
   watch(scroller,()=>{const on=scroller.scrollTop>115;bar.classList.toggle('is-scrolled',on);bar.inert=!on;bar.setAttribute('aria-hidden',String(!on))});
  });
 }
 let pending=false;const start=()=>{sync();new MutationObserver(()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;sync()})}).observe(document.body,{childList:true,subtree:true})};
 if(document.body)start();else document.addEventListener('DOMContentLoaded',start,{once:true});
})();
