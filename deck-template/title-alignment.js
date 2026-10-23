(() => {
 let scheduled=null;
 function align(){
  const slide=document.querySelector('#slide');if(!slide||!slide.getClientRects().length)return;
  const slots=slide.querySelectorAll(':scope>.copy,:scope>.deck-numbered-title,:scope>.mp-heading,:scope>.closing-title,:scope>.hub-heading,:scope>.op-collaboration-copy,:scope>.unified-timeline,:scope.op-problem>section:first-child,:scope.op-ambition>section:first-child,:scope.op-consumer-scope>section:first-child');
  for(const slot of slots){
   const title=slot.querySelector('[data-deck-type="h3"]');
   if(!title||slide.matches('.meal-phone,.meal-transition,.thank-you'))continue;
   slot.classList.add('deck-title-slot');slot.style.setProperty('--deck-title-shift-x','0px');slot.style.setProperty('--deck-title-shift-y','0px');
   const box=title.getBoundingClientRect();
   slot.style.setProperty('--deck-title-shift-x',(innerWidth*.07-box.left)+'px');
   slot.style.setProperty('--deck-title-shift-y',(innerHeight*.5-box.top-box.height/2)+'px');
  }
 }
 const schedule=()=>{if(scheduled!==null)return;scheduled=requestAnimationFrame(()=>{scheduled=null;align();});};
 const workspace=document.querySelector('#workspace');if(workspace)new MutationObserver(schedule).observe(workspace,{childList:true,subtree:true});
 addEventListener('resize',schedule);document.fonts?.ready.then(schedule);schedule();
})();
