/* Scoped presentation adapter for the real inline suggestion prototype.
   Keeps original React store/refinement handlers and insertion timing intact. */
(()=>{
 const style=document.createElement('style');
 style.textContent='.assistant-nudges-feed .spotlight{display:none!important}[data-slide10-generic-suggestion]{display:none!important}';
 document.head.append(style);
 let initialized=false,queued=false;
 function sync(){
  const screen=document.querySelector('.assistant-nudges-screen--home');
  if(!screen)return;
  document.querySelectorAll('.search-pill').forEach(el=>{el.setAttribute('role','button');el.setAttribute('aria-label','Search DoorDash');el.tabIndex=0;});
  for(const [cuisine,index] of [['Sushi',0],['Tacos',1],['Burgers',3],['Pho',4]]){
   const section=screen.querySelector(`[data-carousel-title="${cuisine}"][data-feed-carousel-index="${index}"]`);
   if(!section)continue;
   const key=({Sushi:'sushi',Tacos:'taco',Burgers:'burger',Pho:'pho'})[cuisine];
   section.dataset.demoCuisine=key;
   const card=[...section.querySelectorAll('[role="button"],button')].find(el=>el.getBoundingClientRect().width>100&&el.textContent.trim().length>12);
   if(card)card.dataset.demoStore=key;
  }
  for(const dock of document.querySelectorAll('.assistant-nudges-promo-dock')){
   if(dock.textContent.includes('Suggest something for me'))dock.dataset.slide10GenericSuggestion='true';
   else delete dock.dataset.slide10GenericSuggestion;
  }
  for(const pill of document.querySelectorAll('.assistant-nudges-refinement-pill')){
   if(pill.textContent.trim()==='Sushi for $12')pill.dataset.demoRefinement='sushi';
   if(/^Burgers? for \$12$/.test(pill.textContent.trim()))pill.dataset.demoRefinement='burger';
   if(pill.textContent.trim()==='Pho for $12')pill.dataset.demoRefinement='pho';
   if(['Tacos for $12','Taco for $12'].includes(pill.textContent.trim())){
    pill.dataset.demoRefinement='taco';
    // Display singular copy while the original closure still selects Tacos data.
    if(pill.textContent.trim()==='Tacos for $12')pill.textContent='Taco for $12';
   }
  }
  for(const slot of document.querySelectorAll('[data-inline-carousel-slot-index]')){
   const index=slot.getAttribute('data-inline-carousel-slot-index');
   if(['0','1','3','4'].includes(index))slot.dataset.demoInsertion=({'0':'sushi','1':'taco','3':'burger','4':'pho'})[index];
  }
  if(!initialized){
   const burger=screen.querySelector('[data-carousel-title="Burgers"]');
   if(burger&&burger.getBoundingClientRect().height>0){
    initialized=true;
    // Begin the browse demo at Burgers. Never reset on store return/insertion.
    if(new URLSearchParams(location.search).get('homebase')!=='1')screen.scrollTo({top:screen.scrollTop+burger.getBoundingClientRect().top-screen.getBoundingClientRect().top-180,behavior:'instant'});
    document.documentElement.dataset.suggestionDemoReady='true';
   }
  }
 }
 new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;sync()})}).observe(document.documentElement,{childList:true,subtree:true});
 window.addEventListener('load',sync,{once:true});sync();
 function search(event){
  const pill=event.target.closest('.search-pill');
  if(!pill || pill.hasAttribute('data-search-inactive') || (event.type==='keydown'&&!['Enter',' '].includes(event.key)))return;
  event.preventDefault();event.stopImmediatePropagation();
  window.dispatchEvent(new CustomEvent('consumer:navigate',{detail:{state:'search'}}));
 }
 document.addEventListener('click',search,true);
 document.addEventListener('keydown',search,true);
})();

// Direct entry to the suggestion state for the master screen map.
if(new URLSearchParams(location.search).get('flowScreen')==='suggestion'){
 const waitFor=selector=>new Promise((resolve,reject)=>{const start=Date.now();const timer=setInterval(()=>{const el=document.querySelector(selector);if(el){clearInterval(timer);resolve(el)}else if(Date.now()-start>12000){clearInterval(timer);reject(new Error('Screen unavailable: '+selector))}},100)});
 (async()=>{const card=await waitFor('[data-demo-store="sushi"]');card.click();const back=await waitFor('.assistant-nudges-store-top-nav button[aria-label="Back"]');setTimeout(()=>back.click(),500)})().catch(console.warn);
}

window.addEventListener('consumer:navigate',e=>{let w=window;while(w!==w.parent){w=w.parent;if(w.ConsumerFlow)return}location.assign('/review/consumer-prototype/?state='+e.detail.state)});
