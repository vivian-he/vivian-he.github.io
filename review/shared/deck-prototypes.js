// Deck slides are entry points into the single consumer prototype.
(()=>{const entry=state=>'/review/consumer-prototype/index.html?state='+state+'&embed=1';
window.DECK_PROTOTYPES=Object.fromEntries(Object.entries({intro:'opening',introPhone:'opening',home:'opening',suggest:'suggestions',search:'home',store:'merchantSearch',encounter:'store',item:'item',usi:'store',checkout:'cart',celebration:'processing',hub:'hub',notificationHub:'notification'}).map(([key,state])=>[key,entry(state)]));})();
