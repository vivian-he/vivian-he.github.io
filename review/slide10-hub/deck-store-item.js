/* Local deck adapter: stable demo hooks and a single vertical store scroll surface. */
(() => {
  if (new URLSearchParams(location.search).get('deckdemo') !== '1') return;
  const style=document.createElement('style');
  style.textContent=`
    #sec-featured .featured-grid__scroll{height:auto!important;max-height:none!important;overflow-y:hidden!important}
    #sec-featured .featured-grid__items{height:auto!important;max-height:none!important;overflow:visible!important;grid-template-rows:auto auto}
    #sec-featured .featured-card{height:auto!important;overflow:visible!important}
    #sec-featured,#sec-12-meals{scroll-margin-top:150px}
  `;
  document.head.append(style);
  function hooks(){
    document.querySelectorAll('#sec-deals-and-benefits .deal-banner').forEach(button=>{
      if(/meal box|\$12|full.size meals/i.test(button.textContent))button.dataset.demo='store-usi-open';
    });
    const featured=document.querySelector('#sec-featured');if(featured)featured.dataset.demo='store-most-ordered';
    const meals=document.querySelector('#sec-12-meals');if(meals)meals.dataset.demo='store-mealbox-menu';
    document.querySelectorAll('.mbx-usir-splash__close,.mbx-usi-splash__close,.mb-sheet__close').forEach(button=>button.dataset.demo='store-usi-close');
    document.querySelectorAll('.rxi-root .mb1l').forEach(button=>button.dataset.demo='item-explainer-open');
    document.querySelectorAll('.mbvp-root .mbvp-back,.mbvp-root .mbvp-cta--secondary,.gprs-root .gprs-btn').forEach(button=>button.dataset.demo='item-explainer-close');
    document.querySelectorAll('.rxi-atc').forEach(button=>button.dataset.demo='item-add-cart');
  }
  let queued=false;
  new MutationObserver(()=>{if(!queued){queued=true;requestAnimationFrame(()=>{queued=false;hooks();});}}).observe(document.body,{childList:true,subtree:true});
  hooks();
})();
