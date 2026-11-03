/* Saved before scenario: the original hub outside operating hours. */
(()=>{
 if(new URLSearchParams(location.search).get('availability')!=='closed')return;
 document.documentElement.classList.add('mealbox-closed-hours','new-mealbox-hub');
 const style=document.createElement('style');style.textContent=`
 .mealbox-closed-hours .mbt-scroll{display:flex;flex-direction:column;height:100svh!important;padding-bottom:0!important;overflow:hidden!important}
 .mealbox-closed-hours .mbt-scroll>:is(.mbt-hero,.mbt-title,.mbt-chips){flex-shrink:0}
 .mealbox-closed-hours .mbt-scroll>:not(.mbt-hero):not(.mbt-title):not(.mbt-chips):not(.closed-hours-empty){display:none!important}
 .mealbox-closed-hours .closed-hours-empty{flex:1;min-height:220px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:26px;padding:24px 20px 64px;box-sizing:border-box;background:white}
 .mealbox-closed-hours .closed-hours-empty img{display:block;width:128px;height:150px;object-fit:contain}
 .mealbox-closed-hours .closed-hours-empty p{margin:0;color:#191919;text-align:center;font:500 17px/24px 'DD Norms',sans-serif}
 .mealbox-closed-hours :is(.shared-hub-search,.shared-search-dock,.shared-search-scrim,#shared-search-dock,.sp-fab,.sp-fab__backdrop,.mbt-search,.mbt-search-dock){display:none!important}
 `;document.head.append(style);
 const mount=()=>{const title=document.querySelector('.mbt-title h1'),sub=document.querySelector('.mbt-title p');if(title&&title.textContent!=='$12 meal boxes')title.textContent='$12 meal boxes';if(sub){const text=[...sub.childNodes].find(n=>n.nodeType===Node.TEXT_NODE);if(text&&text.textContent!=='From top-rated restaurants. ')text.textContent='From top-rated restaurants. ';}const scroll=document.querySelector('.mbt-scroll');if(!scroll||scroll.querySelector('.closed-hours-empty'))return;const section=document.createElement('section');section.className='closed-hours-empty';section.setAttribute('aria-label','No stores available');section.innerHTML='<img src="/assets/mealbox-closed-hours/empty-illustration.svg" alt=""><p>No stores available</p>';scroll.append(section)};
 new MutationObserver(mount).observe(document.documentElement,{childList:true,subtree:true});mount();
})();
