// Canonical consumer screen sources. Slide wrappers own transitions, never screen copies.
window.CONSUMER_SCREENS=Object.freeze({
 home:'/review/slide11-browse/app/index.html?embed=1&homebase=1&rev=shared-oct7',
 store:'/review/slide10-hub/prototypes/mb-brief-v4/index.html?embed=1&world=after&screen=store&storeexp=subtitle&deckdemo=1&rev=shared-oct7',
 item:'/review/slide10-hub/prototypes/mb-brief-v4/index.html?embed=1&world=after&screen=item&itemexp=o3&usiexp=c&deckdemo=1&rev=shared-oct7',
 cart:'/review/cart-checkout/app/prototypes/mb-brief-v4/index.html?embed=1&world=after&screen=cart',
 checkout:'/review/cart-checkout/app/prototypes/mb-brief-v4/index.html?embed=1&world=after&screen=checkout',
 processing:'/review/cart-checkout/app/prototypes/mb-brief-v4/index.html?embed=1&world=after&screen=confirmation',
 review:'/review/mealbox-review/index.html?rev=review-bottom-3&flowScreen=',
 hub:'/review/slide10-hub/prototypes/mb-hub-v4/index.html?embed=1&world=after&bigimg=1&nodp=1&storefirst=1&allmeals=1&rev=shared-oct7'
});
document.querySelectorAll('iframe[data-master-screen]').forEach(frame=>{
 const url=window.CONSUMER_SCREENS[frame.dataset.masterScreen];
 if(url)frame.src=url;
});
