/* One navigation owner. All entries resolve to the same authored screen sources.
   Frames are retained on Back so feed position, selections and insertions survive. */
(()=>{
 const S=window.CONSUMER_SCREENS, q=new URLSearchParams(location.search), host=document.querySelector('#screens');
 const routes={appSplash:'/review/slide9-opening/index.html?embed=1&previewPhase=splash',homeLoading:'/review/slide9-opening/index.html?embed=1&previewPhase=loading',searchLoading:'/review/slide12-search/index.html?flowScreen=loading',hubLoading:'/review/notification-hub/index.html?previewPhase=loading',notificationSplash:'/review/notification-hub/index.html?previewPhase=splash',opening:'/review/slide9-opening/index.html?embed=1&rev=faster-15',home:S.home,suggestions:S.home.replace('homebase=1','homebase=0'),suggestion:S.home.replace('homebase=1','homebase=0')+'&flowScreen=suggestion',search:'/review/slide12-search/index.html?flowScreen=cold',autocomplete:'/review/slide12-search/index.html?flowScreen=autocomplete',results:'/review/slide12-search/index.html?flowScreen=results',merchantSearch:'/review/slide13-merchant-search/index.html',store:S.store,item:S.item,hub:S.hub,cart:S.cart,checkout:S.checkout,processing:S.processing,notification:'/review/notification-hub/index.html',tracking:S.review+'tracking',review:S.review+'form',guidance:S.review+'guidance',camera:S.review+'camera',photo:S.review+'preview',thanks:S.review+'thanks'};
 const frames=new Map(), stack=[];let active=null;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 function announce(state){document.documentElement.dataset.state=state;const u=new URL(location.href);u.searchParams.set('state',state);history.replaceState(null,'',u);}
 function show(state,{back=false,animate=true}={}){
  if(!routes[state])return;if(active?.state===state)return;
  const previous=active;
  let f=frames.get(state);
  if(!f){f=document.createElement('iframe');f.title='Master screen · '+state;f.dataset.masterState=state;f.src=routes[state];f.hidden=true;frames.set(state,f);host.append(f);f.addEventListener('load',()=>bind(f.contentDocument));}
  if(previous&&!back)stack.push(previous);
  active={state,frame:f};announce(state);document.querySelector('#tracking-next')?.remove();
  let hubOverlay=null,hubBeat=null;
  if(state==='hub'&&previous&&!back&&animate&&window.ConsumerMotion){
   hubOverlay=window.ConsumerMotion.createHubSkeleton();hubOverlay.style.zIndex='8';host.append(hubOverlay);
   hubBeat=window.ConsumerMotion.playHubPush(hubOverlay).finished.then(()=>new Promise(r=>setTimeout(r,reduced?0:450)));
  }
  const reveal=async()=>{if(hubBeat)await hubBeat;if(active?.frame!==f){hubOverlay?.remove();return}f.hidden=false;f.style.zIndex='2';if(previous&&previous.frame!==f){if(animate&&!reduced&&!hubOverlay){f.animate([{transform:`translateX(${back?'-20%':'100%'})`,opacity:back?.8:1},{transform:'translateX(0)',opacity:1}],{duration:back?280:380,easing:'cubic-bezier(.22,.75,.2,1)'}).finished.then(()=>{if(active?.frame===f)previous.frame.hidden=true})}else previous.frame.hidden=true;previous.frame.style.zIndex='1';}bind(f.contentDocument);if(hubOverlay){await hubOverlay.animate([{opacity:1},{opacity:0}],{duration:reduced?0:180}).finished;hubOverlay.remove()}};
  if(f.contentDocument?.readyState==='complete'&&f.contentDocument.location.href!=='about:blank')reveal();else f.addEventListener('load',reveal,{once:true});
 }
 function back(){const previous=stack.pop();if(!previous){show('home',{back:true});return}show(previous.state,{back:true});}
 function navigate(state){show(state)}
 function bind(doc){if(!doc?.documentElement||doc.__masterBound)return;doc.__masterBound=true;
  const clean=()=>{if(!doc.head||doc.querySelector('#master-status-clean'))return;const style=doc.createElement('style');style.id='master-status-clean';style.textContent='.status,.gxc-status-bar,.scroll-header__status-bar,.gxk-status-bar,.gxs-status-bar,.status-bar,.ios-status-bar,.p1-status-bar,.mbt-status,#fixed-phone-status,.lock-signals,.island,.dynamic-island,.home-indicator,.mbt-home-indicator,.ge-home-indicator{visibility:hidden!important}';doc.head.append(style)};clean();doc.addEventListener('DOMContentLoaded',clean,{once:true});
  doc.defaultView.addEventListener('consumer:navigate',e=>show(e.detail.state));
  doc.addEventListener('click',e=>{
   const b=e.target.closest('button,a,[role="button"],.search-pill,.mbl-row,.gxs-mb-card,.mbt-card,.h-item-card,.featured-card,.sp-item-card,.mb-row,.nv-item-card,.gxs-store-card');if(!b)return;
   const label=(b.textContent+' '+(b.getAttribute('aria-label')||'')).trim(), path=doc.location.pathname;
   let destination=null;
   if(path.includes('mealbox-review')&&['home','dismiss-review'].includes(b.dataset.action)){const target=b.dataset.action==='dismiss-review'?'tracking':'home';e.preventDefault();e.stopImmediatePropagation();stack.length=0;show(target,{back:true,animate:false});parent.postMessage({type:'consumer:state',state:target},location.origin);return}
   else if(b.matches('[data-mealbox-entry]')||/See all.*Meal Boxes/i.test(label))destination='hub';
   else if(b.matches('.rxi-atc')||b.dataset.demo==='item-add-cart')destination='cart';
   else if(/^Place order\b/i.test(label)&&b.dataset.demoCheckoutAction!=='continue')destination='processing';
   else if(path.includes('cart-checkout')&&/^Continue(?: to checkout| checkout)?$/i.test(label))destination='checkout';
   else if(b.matches('.mbl-row,.gxs-mb-card,.mbt-card,.h-item-card,.featured-card,.sp-item-card,.mb-row,.nv-item-card')&&!b.closest('.rxi-root'))destination='item';
   else if(b.id==='result'&&path.includes('merchant-search'))destination='store';
   else if(b.dataset.query==='NAYA')destination='merchantSearch';
   else if(path.includes('slide11-browse')&&(b.closest('.search-pill')||/Search DoorDash/i.test(label)))destination='search';
   else if(path.includes('mb-brief-v4')&&doc.querySelector('.gxs-root')&&b.closest('.gxs-store-card'))destination='store';
   if(destination){e.preventDefault();e.stopImmediatePropagation();show(destination);parent.postMessage({type:'consumer:state',state:destination},location.origin);return}
   if((b.getAttribute('aria-label')==='Back'||(active?.state==='item'&&b.getAttribute('aria-label')==='Close')||b.id==='close')&&['store','item','hub','cart','checkout','search','merchantSearch'].includes(active?.state)&&!b.closest('.mbvp-root,.mb-sheet,.mbx-usir-splash,.mbx-usi-splash')){e.preventDefault();e.stopImmediatePropagation();back();}
  },true);
  doc.addEventListener('input',e=>{if(e.target.id==='query'&&/^naya$/i.test(e.target.value)&&doc.location.pathname.includes('slide12-search'))show('merchantSearch')});
  function children(){doc.querySelectorAll('iframe').forEach(f=>{if(!f.__masterWatch){f.__masterWatch=true;f.addEventListener('load',()=>bind(f.contentDocument))}try{bind(f.contentDocument)}catch{}})}children();new MutationObserver(children).observe(doc.documentElement,{subtree:true,childList:true});
 }
 window.ConsumerFlow={navigate,back,bind,get state(){return active?.state},routes};
 window.addEventListener('message',e=>{if(e.origin!==location.origin)return;if(e.data?.type==='consumer:entry')show(e.data.state,{animate:false});});
 show(q.get('state')||'opening',{animate:false});
})();
