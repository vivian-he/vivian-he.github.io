(()=>{
// Canonical consumer screen sources. Slide wrappers own transitions, never screen copies.
const after=Object.freeze({
 feedback:'/review/mealbox-review/index.html?rev=review-bottom-3&flowScreen=form',
 browse:'/review/consumer-prototype/index.html?state=suggestions&embed=1',
 searchResults:'/review/slide12-search/index.html?flowScreen=results&autoplay=0&rev=search-type-exact-3',
 home:'/review/slide11-browse/app/index.html?embed=1&homebase=1&rev=metadata-exact-2',
 store:'/review/slide10-hub/prototypes/mb-brief-v4/index.html?embed=1&world=after&screen=store&storeexp=subtitle&deckdemo=1&rev=metadata-exact-2',
 item:'/review/slide10-hub/prototypes/mb-brief-v4/index.html?embed=1&world=after&screen=item&itemexp=o3&usiexp=c&deckdemo=1&rev=metadata-exact-2',
 cart:'/review/cart-checkout/app/prototypes/mb-brief-v4/index.html?embed=1&world=after&screen=cart',
 checkout:'/review/cart-checkout/app/prototypes/mb-brief-v4/index.html?embed=1&world=after&screen=checkout',
 processing:'/review/cart-checkout/app/prototypes/mb-brief-v4/index.html?embed=1&world=after&screen=confirmation',
 review:'/review/mealbox-review/index.html?rev=review-bottom-3&flowScreen=',
 hub:'/review/slide10-hub/prototypes/mb-hub-v4/index.html?embed=1&world=after&bigimg=1&nodp=1&storefirst=1&allmeals=1&rev=metadata-exact-2'
});
// Explicit world wins; otherwise infer the saved old surface or containing flow.
function experienceWorld(){let w=window;while(true){try{const q=new URLSearchParams(w.location.search),explicit=q.get('world');if(explicit==='before'||explicit==='after')return explicit;if(/current-home\.html|mb-hub-sept|home-before\.html/.test(w.location.pathname))return 'before';if(w===w.parent)break;w=w.parent}catch{break}}return 'after'}
const before=Object.freeze(Object.fromEntries(Object.entries(after).map(([key,value])=>{const u=new URL(value,location.origin);u.searchParams.set('world','before');if(key==='home')u.pathname='/review/slide11-browse/app/current-home.html';if(key==='hub'){u.pathname='/review/slide10-hub/prototypes/mb-hub-sept/index.html';['bigimg','nodp','storefirst','allmeals'].forEach(k=>u.searchParams.delete(k))}return [key,u.pathname+u.search]})));
window.CONSUMER_SCREEN_SETS=Object.freeze({before,after});
window.CONSUMER_SCENARIOS=Object.freeze({after:Object.freeze({hubClosed:'/review/slide10-hub/prototypes/mb-hub-v4/index.html?embed=1&world=after&bigimg=1&nodp=1&storefirst=1&allmeals=1&availability=closed'}),before:Object.freeze({hubClosed:'/review/slide10-hub/prototypes/mb-hub-sept/index.html?embed=1&world=before&availability=closed&scenario=20261029'})});
window.CONSUMER_EXPERIENCE=experienceWorld();
window.CONSUMER_SCREENS=window.CONSUMER_SCREEN_SETS[window.CONSUMER_EXPERIENCE];
document.querySelectorAll('iframe[data-master-screen]').forEach(frame=>{
 const url=window.CONSUMER_SCREENS[frame.dataset.masterScreen];
 if(url)frame.src=url;
});

})();
