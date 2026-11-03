// Isolated review version: new Home runtime, original restaurant carousel only.
(async()=>{
 const data=await fetch(new URL('./current-home-carousel.json',document.currentScript.src)).then(r=>{if(!r.ok)throw Error('Carousel unavailable');return r.json()});
 const mount=()=>document.querySelectorAll('.master-mealbox').forEach(host=>{
  if(host.dataset.currentCarousel==='ready')return;
  host.dataset.currentCarousel='ready';
  // Shadow styles retain the original card anatomy without restyling the new feed.
  const root=host.shadowRoot||host.attachShadow({mode:'open'});
  root.innerHTML='<link rel="stylesheet" href="/review/shared/listing-typography.css?v=metadata-exact-2">'+data.styles.map(src=>`<link rel="stylesheet" href="${src}">`).join('')+'<style>:host{display:block;width:100%;padding-top:0!important;margin-top:0!important;margin-bottom:28px!important;font-family:"DD Norms",Arial,sans-serif;color:#191919}section.mbx-section{width:100%!important;height:auto!important;margin:0!important;padding-top:4px!important;padding-bottom:0!important}.section-header{width:100%!important;padding-left:0!important;padding-right:0!important}.mbx-esr__scroll{width:calc(100% + 16px)!important;max-width:none!important;padding-left:0!important;padding-right:16px!important}.section-header>button{width:32px!important;height:32px!important}.section-header>button{background:transparent!important;border:0!important}.section-header>button svg{width:24px!important;height:24px!important}.listing-store-name{font:800 16px/22px "DD Norms UI",sans-serif!important}.listing-meta{font:500 14px/20px "DD Norms UI",sans-serif!important}.listing-carousel-title{font:800 20px/24px "DD Norms UI",sans-serif!important}.mbx-esr-card__meta svg{margin-left:3px!important;margin-right:3px!important;flex-shrink:0!important}.mbx-esr-card__meta{width:auto!important;height:auto!important;min-height:20px!important}.mbx-esr-card__meta-rest{white-space:nowrap!important;flex-shrink:0!important}*{box-sizing:border-box}button[aria-pressed="true"] svg{color:#eb1700;fill:#eb1700}</style>'+data.html;
  host.replaceChildren();root.querySelectorAll('.mbx-esr-card__name').forEach(e=>e.classList.add('listing-store-name'));root.querySelectorAll('.mbx-esr-card__meta,.mbx-esr-card__meta *').forEach(e=>e.classList.add('listing-meta'));root.querySelectorAll('.module-section-title').forEach(e=>e.classList.add('listing-carousel-title'));

  root.querySelectorAll('.mbx-esr-card__meta-rest').forEach(e=>{e.textContent=e.textContent.replace(/(·\s*\d+)\s*$/,'$1 min')});
  const navigate=state=>window.dispatchEvent(new CustomEvent('consumer:navigate',{detail:{state}}));
  root.addEventListener('click',e=>{
   const target=e.target.closest('button,[role="button"]');if(!target)return;
   e.preventDefault();e.stopPropagation();
   if(target.getAttribute('aria-label')==='Save for later'){
    const saved=target.getAttribute('aria-pressed')!=='true';target.setAttribute('aria-pressed',String(saved));return;
   }
   navigate('hub');
  });
  root.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches('.mbx-esr-card')){e.preventDefault();navigate('hub')}});
  const rail=root.querySelector('.mbx-esr__scroll');let drag=null,dragged=false;
  rail.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.button!==0)return;drag={x:e.clientX,left:rail.scrollLeft};dragged=false});
  rail.addEventListener('pointermove',e=>{if(!drag)return;const distance=e.clientX-drag.x;if(Math.abs(distance)>5){dragged=true;rail.scrollLeft=drag.left-distance;e.preventDefault()}});
  window.addEventListener('pointerup',()=>{drag=null});
  root.addEventListener('click',e=>{if(dragged){e.stopImmediatePropagation();e.preventDefault();dragged=false}},true);
 });
 const observer=new MutationObserver(mount);observer.observe(document.documentElement,{subtree:true,childList:true});mount();
})().catch(error=>console.error('Current Home carousel:',error));
