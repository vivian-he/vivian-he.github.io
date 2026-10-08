// Deck-level navigation: prototypes keep their own UI; interactions advance narrative beats.
function consumerGo(id){const index=SLIDES.findIndex(s=>s.id===id);if(index>=0){current=index;render();}}
function bindConsumerFlow(){
 const frame=document.querySelector('#consumer-walk iframe');if(!frame)return;
 function bind(doc){if(!doc||!doc.documentElement||doc.__consumerFlowBound)return;doc.__consumerFlowBound=true;
  doc.addEventListener('click',e=>{const b=e.target.closest('button,[role="button"],a,.mb-row,.h-item-card,.featured-card,.sp-item-card,.nv-item-card');if(!b)return;const step=SLIDES[current]?.walk,label=(b.textContent+' '+b.getAttribute('aria-label')).trim();
   if(/^Place order\b/i.test(label)&&doc.location.pathname.includes('/cart-checkout/')){e.preventDefault();e.stopImmediatePropagation();const url=new URL(doc.location.href);url.searchParams.set('screen','confirmation');doc.location.assign(url.href);return;}
   // Item sheets can be reached inside any discovery phone, not just the item slide.
   const itemAdd=b.matches('.rxi-atc')||(b.closest('.rxi-root')&&/add.*(?:cart|order)/i.test(label));
   if((step==='item'||itemAdd)&&/add.*(?:cart|order)/i.test(label)&&!b.disabled&&b.getAttribute('aria-disabled')!=='true'){e.preventDefault();e.stopImmediatePropagation();consumerGo('slide-15');}
   if(['encounter','store'].includes(step)&&b.closest('.h-item-card,.featured-card,.sp-item-card,.mb-row,.nv-item-card')){e.preventDefault();e.stopImmediatePropagation();consumerGo('slide-14');}
  },true);
  function children(){doc.querySelectorAll('iframe').forEach(f=>{if(!f.dataset.consumerFlow){f.dataset.consumerFlow='1';f.addEventListener('load',()=>{try{bind(f.contentDocument)}catch{}})}try{bind(f.contentDocument)}catch{}})}children();new MutationObserver(children).observe(doc.documentElement,{childList:true,subtree:true});
 }
 if(!frame.dataset.consumerFlow){frame.dataset.consumerFlow='1';frame.addEventListener('load',()=>{bind(frame.contentDocument);scrollEncounter()})}bind(frame.contentDocument);
 scrollEncounter();
 function scrollEncounter(){/* Explicit autoplay recipe owns store scrolling. */}
}

window.addEventListener('message',e=>{if(e.origin!==location.origin||e.data?.type!=='consumer:state')return;const step=SLIDES[current]?.walk;if(e.data.state==='cart'&&step==='item')consumerGo('slide-15');if(e.data.state==='item'&&['encounter','store'].includes(step))consumerGo('slide-14');});
