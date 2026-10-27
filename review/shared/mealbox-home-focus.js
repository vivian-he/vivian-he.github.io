/* Presentation-only focus treatment for the shared Home screen. */
(()=>{
 if(new URLSearchParams(location.search).get('focus')!=='mealbox')return;
 const style=document.createElement('style');
 style.textContent=`
 .assistant-nudges-screen--home.mealbox-home-focus .assistant-nudges-feed > :not(.master-mealbox) {
   position:relative!important;
   background:transparent!important;border:0!important;box-shadow:none!important;
   border-radius:0!important;overflow:visible!important;pointer-events:none!important;
 }
 .assistant-nudges-screen--home.mealbox-home-focus .assistant-nudges-feed > :not(.master-mealbox) > * {
   visibility:hidden!important;
 }
 .mealbox-home-focus .assistant-nudges-feed > :not(.master-mealbox)::before,
 .mealbox-home-focus .assistant-nudges-feed > :not(.master-mealbox)::after {content:none!important}
 .assistant-nudges-screen--home.mealbox-home-focus .assistant-nudges-feed > :not(.master-mealbox) > .mealbox-context-placeholders {
   visibility:visible!important;display:flex!important;position:absolute!important;left:0!important;right:-16px!important;top:20px!important;height:170px!important;gap:12px!important;overflow:hidden!important;z-index:3!important;
 }
 .mealbox-context-placeholders > span {display:block!important;visibility:visible!important;flex:0 0 82%!important;height:170px!important;background:#f1f1f1!important;border-radius:16px!important;border:0!important;box-shadow:none!important}
 .assistant-nudges-screen--home.mealbox-home-focus .assistant-nudges-feed > :has(+ .master-mealbox) > .mealbox-context-placeholders {top:auto!important;bottom:16px!important}
 .assistant-nudges-screen--home.mealbox-home-focus .assistant-nudges-feed > .master-mealbox {
   position:relative;z-index:2;background:white;
 }
 .assistant-nudges-screen--home.mealbox-home-focus .assistant-nudges-feed > .spotlight,
 .assistant-nudges-screen--home.mealbox-home-focus .assistant-nudges-feed > [data-slide10-generic-suggestion] {
   display:none!important;
 }
 .assistant-nudges-screen--home.mealbox-home-focus [class*="loading"],
 .assistant-nudges-screen--home.mealbox-home-focus [class*="spinner"],
 .assistant-nudges-screen--home.mealbox-home-focus .shared-hub-skeleton {
   display:none!important;
 }
 `;
 document.head.append(style);
 let lastHost=null,queued=false;
 function center(){
  queued=false;
  const host=document.querySelector('.assistant-nudges-screen--home .master-mealbox');
  const screen=host?.closest('.assistant-nudges-screen--home');
  if(!host||!screen||host.getBoundingClientRect().height<100)return;
  screen.classList.add('mealbox-home-focus');
  for(const section of screen.querySelectorAll('.assistant-nudges-feed > :not(.master-mealbox)')){
   if(section.querySelector(':scope > .mealbox-context-placeholders'))continue;
   const rail=document.createElement('div');rail.className='mealbox-context-placeholders';rail.setAttribute('aria-hidden','true');rail.innerHTML='<span></span><span></span>';section.append(rail);
  }

  if(lastHost===host&&screen.dataset.mealboxFocusCentered==='true')return;
  lastHost=host;
  Promise.all([document.fonts.ready,...[...host.shadowRoot?.querySelectorAll('link[rel="stylesheet"]')||[]].map(link=>link.sheet?Promise.resolve():new Promise(resolve=>{link.addEventListener('load',resolve,{once:true});link.addEventListener('error',resolve,{once:true})}))]).then(()=>requestAnimationFrame(()=>{
   if(!host.isConnected)return;
   const upper=screen.querySelector('.shared-home-header')?.getBoundingClientRect().bottom||screen.getBoundingClientRect().top+120;
   const search=screen.querySelector('.search-pill')?.getBoundingClientRect().top;
   const lower=search&&search>upper+150?search:screen.getBoundingClientRect().bottom-80;
   const desired=upper+Math.max(12,(lower-upper-host.getBoundingClientRect().height)/2);
   screen.scrollTop+=host.getBoundingClientRect().top-desired;
   screen.dataset.mealboxFocusCentered='true';
  }));
 }
 const schedule=()=>{if(!queued){queued=true;requestAnimationFrame(center)}};
 new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
 window.addEventListener('load',schedule,{once:true});
 schedule();
})();
