// Keep prototype interactions inside the phone. Slide changes belong to the deck controls.
function bindConsumerFlow(){
 const frame=document.querySelector('#consumer-walk iframe');if(!frame)return;
 function bind(doc){if(!doc||!doc.documentElement||doc.__consumerFlowBound)return;doc.__consumerFlowBound=true;
  doc.addEventListener('click',e=>{const b=e.target.closest('button,[role="button"],a');if(!b)return;const label=(b.textContent+' '+b.getAttribute('aria-label')).trim();
   if(/^Place order\b/i.test(label)&&doc.location.pathname.includes('/cart-checkout/')){e.preventDefault();e.stopImmediatePropagation();const url=new URL(doc.location.href);url.searchParams.set('screen','confirmation');doc.location.assign(url.href);return;}
  },true);
  function children(){doc.querySelectorAll('iframe').forEach(f=>{if(!f.dataset.consumerFlow){f.dataset.consumerFlow='1';f.addEventListener('load',()=>{try{bind(f.contentDocument)}catch{}})}try{bind(f.contentDocument)}catch{}})}children();new MutationObserver(children).observe(doc.documentElement,{childList:true,subtree:true});
 }
 if(!frame.dataset.consumerFlow){frame.dataset.consumerFlow='1';frame.addEventListener('load',()=>{bind(frame.contentDocument);scrollEncounter()})}bind(frame.contentDocument);
 scrollEncounter();
 function scrollEncounter(){/* Explicit autoplay recipe owns store scrolling. */}
}
