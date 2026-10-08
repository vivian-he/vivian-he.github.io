(()=>{
 const path='M9.789 3.793a1 1 0 1 1 1.414 1.414L5.41 11h15.586a1 1 0 0 1 0 2H5.41l5.793 5.793a1 1 0 0 1-1.414 1.414l-6.793-6.793a2 2 0 0 1 0-2.828z';
 const selector='button[aria-label="Back"],.gxk-nav-header button:first-child,.gxc-nav button:first-child,.shared-hub-sticky>button:first-child';
 const excluded='.gx-search,.gxs-search-row,.search-entry,.rxi-root,#entry,#results-search-dock,.naya-search';
 function sync(){
  document.querySelectorAll(selector).forEach(button=>{
   if(button.closest(excluded)||button.getAttribute('aria-label')==='Close')return;
   let svg=button.querySelector('svg');
   if(svg?.dataset.sharedPrismBack)return;
   const next=document.createElementNS('http://www.w3.org/2000/svg','svg');
   next.setAttribute('viewBox','0 0 24 24');next.setAttribute('width','24');next.setAttribute('height','24');next.setAttribute('fill','none');next.setAttribute('aria-hidden','true');next.dataset.sharedPrismBack='';
   const p=document.createElementNS(next.namespaceURI,'path');p.setAttribute('fill','currentColor');p.setAttribute('d',path);next.append(p);
   if(svg)svg.replaceWith(next);else if(!button.textContent.trim())button.append(next);else return;
   button.dataset.sharedBackIcon='';
   if(!button.hasAttribute('aria-label'))button.setAttribute('aria-label','Back');
  });
 }
 let queued=false;new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;sync()})}).observe(document.documentElement,{childList:true,subtree:true});
 sync();
})();
