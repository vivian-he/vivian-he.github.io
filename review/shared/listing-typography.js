/* Adapts existing Picnic listing metadata without replacing cards or handlers. */
(()=>{
 if(window.__listingTypographyInstalled)return;window.__listingTypographyInstalled=true;
 document.documentElement.classList.toggle('new-mealbox-hub',location.pathname.includes('/mb-hub-v4/')||(location.pathname.includes('/mb-hub-sept/')&&new URLSearchParams(location.search).get('availability')==='closed'));
 document.documentElement.classList.toggle('hub-outside-hours',location.pathname.includes('/mb-hub-v4/')&&new URLSearchParams(location.search).get('availability')==='closed');
 const metadata=/^(?:\d(?:\.\d)?|\([\d.,]+k?\+?\)|·|[\d.–-]+\s*(?:mi|min)|Opens\b.*|\$[\d.,]+\s*delivery fee|Free delivery)$/i;
 const ratingRoots='.home-store-metadata,.gxs-store,.gxs-mb-card__meta,.mbt-meta,.store-card-rating,.store-header__badge--rating,.sh3-left__rating,.psc__rating-row';
 function syncRatings(){
  document.querySelectorAll(ratingRoots).forEach(root=>{
   const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const nodes=[];let node;
   while(node=walker.nextNode())if(!node.parentElement.closest('.listing-item-price,.listing-rating-number'))nodes.push(node);
   for(const text of nodes){
    const match=text.textContent.match(/^\s*([0-5]\.\d)(?=\s|★|$)/);if(!match)continue;
    // Rating-specific roots only: never touch menu prices, totals or counts.
    if(/^\s*(?:mi|min)\b/.test(text.textContent.slice(match[0].length)))continue;
    const value=Number(match[1]);const parent=text.parentElement;if(parent.closest('.gxs-store__photo-wrap'))continue;
    const number=document.createElement('span');number.className='listing-rating-number';number.dataset.ratingHigh=String(value>=4.7);number.textContent=match[1];
    const rest=text.textContent.slice(match[0].length);text.replaceWith(number,document.createTextNode(rest));
    let group=number.parentElement;let star=null;
    for(let i=0;i<3&&group&&root.contains(group);i++,group=group.parentElement){
     star=group.querySelector('svg');if(star){star.classList.add('listing-rating-star');star.dataset.ratingHigh=String(value>=4.7);break;}
    }
    // The plain-text after-state carousel also shares the same rating treatment.
    if(!star&&number.nextSibling?.nodeType===Node.TEXT_NODE&&/^\s*★/.test(number.nextSibling.textContent)){
     const restNode=number.nextSibling;const glyph=document.createElement('span');glyph.className='listing-rating-star';glyph.dataset.ratingHigh=String(value>=4.7);glyph.textContent='★';restNode.textContent=restNode.textContent.replace(/^\s*★/,'');number.after(glyph);
    }
   }
  });
 }
 function normalizeStars(){
  const path="M8.911.588a1 1 0 0 0-1.822 0L5.373 4.384l-4.14.459a1 1 0 0 0-.564 1.733l3.08 2.805-.843 4.08a1 1 0 0 0 1.475 1.07L8 12.47l3.62 2.063a1 1 0 0 0 1.474-1.071l-.844-4.08 3.08-2.805a1 1 0 0 0-.563-1.733l-4.14-.459z";
  document.querySelectorAll('.listing-rating-star,.deck-prism-star').forEach(original=>{
   let icon=original;
   if(original.tagName.toLowerCase()==='svg'&&!original.classList.contains('listing-rating-star'))original.classList.add('listing-rating-star');
   if(original.tagName.toLowerCase()!=='svg'){
    icon=document.createElementNS('http://www.w3.org/2000/svg','svg');icon.setAttribute('class','listing-rating-star');icon.dataset.ratingHigh=original.dataset.ratingHigh||'false';original.replaceWith(icon);
   }
   if(icon.getAttribute('viewBox')!=='0 0 16 16')icon.setAttribute('viewBox','0 0 16 16');
   if(icon.getAttribute('width')!=='12')icon.setAttribute('width','12');
   if(icon.getAttribute('height')!=='12')icon.setAttribute('height','12');
   if(icon.getAttribute('aria-hidden')!=='true')icon.setAttribute('aria-hidden','true');
   if(icon.querySelector('path')?.getAttribute('d')!==path)icon.innerHTML='<path fill="currentColor" d="'+path+'"></path>';
  });
 }
 function syncHubPrices(){
  if(!document.documentElement.classList.contains('new-mealbox-hub'))return;
  document.querySelectorAll('.mbt-price,.mbt-uber__price').forEach(price=>{
   if(price.querySelector('.mbt-price__dollars'))return;
   const match=price.textContent.trim().match(/^\$(\d+)(?:\.(\d{2}))?$/);if(!match)return;
   price.classList.add('hub-sup-price');price.setAttribute('aria-label','$'+match[1]+'.'+(match[2]||'00'));
   price.innerHTML='<span class="mbt-price__sym">$</span><span class="mbt-price__dollars">'+match[1]+'</span><span class="mbt-price__cents">'+(match[2]||'00')+'</span>';
  });
 }
 function syncHubCardSizes(){
  if(!document.documentElement.classList.contains('new-mealbox-hub'))return;
  const photo=document.querySelector('.mbt-sf__photo');if(!photo)return;
  const width=photo.getBoundingClientRect().width;if(!width)return;
  const root=document.documentElement.style,size=width+'px',radius=getComputedStyle(photo).borderRadius;
  if(root.getPropertyValue('--hub-group-item-size')!==size)root.setProperty('--hub-group-item-size',size);
  if(root.getPropertyValue('--hub-group-item-radius')!==radius)root.setProperty('--hub-group-item-radius',radius);
 }
 function sync(){
  syncHubCardSizes();
  syncHubPrices();
  syncRatings();
  normalizeStars();

  // Tag semantic text rather than generated Picnic class names.
  document.querySelectorAll('.home-store-metadata').forEach(meta=>{
   const content=meta.parentElement,header=content?.firstElementChild;
   if(header&&!header.classList.contains('home-store-metadata'))header.querySelectorAll('[dir="auto"]').forEach(el=>el.classList.add('listing-store-name'));
  });
  document.querySelectorAll('.gxs-store [dir="auto"]').forEach(el=>{
   if(el.closest('.gxs-store__photo-wrap,.gxs-store__badges,.listing-meta,.listing-delivery'))return;
   const style=getComputedStyle(el);
   if(style.fontSize==='16px'&&Number(style.fontWeight)>=700)el.classList.add('listing-store-name');
  });
  document.querySelectorAll('.assistant-nudges-feed [dir="auto"],.assistant-nudges-feed .module-section-title').forEach(el=>{
   if(el.closest('.home-store-metadata'))return;
   if(getComputedStyle(el).fontSize==='20px'&&Number(getComputedStyle(el).fontWeight)>=700)el.classList.add('listing-carousel-title');
  });

  document.querySelectorAll('.assistant-nudges-meal-box-card__price,.sp-price,.mbt-price,.mbt-uber__price,.mbx-price,.gxs-mb-price,.rxi-price,.menu-item-price,.msx6-price,.mbvp-rail-card__price,.pedregal-item-modal__price,.pedregal-item-carousel__price,.gxs-store__pill-price > span').forEach(el=>{
   const integer=el.querySelector('.assistant-nudges-meal-box-card__price-dollars,.sp-price__integer,.mbt-price__dollars,.mbx-price__integer,.gxs-mb-price__int,.rxi-price__integer,.mbvp-rail-card__price-dollars');
   const cents=el.querySelector('.assistant-nudges-meal-box-card__price-cents,.sp-price__decimal,.mbt-price__cents,.mbx-price__decimal,.gxs-mb-price__sup:last-child,.rxi-price__decimal,.mbvp-rail-card__price-cents');
   const value=integer?Number(integer.textContent.trim())+Number((cents?.textContent||'0').replace(/[^0-9]/g,''))/100:Number(el.textContent.replace(/[$,\s]/g,''));
   if(!Number.isFinite(value))return;
   el.classList.add('listing-item-price');el.dataset.mealboxPrice=String(value===12);
  });
  document.querySelectorAll('.gxs-store [dir="auto"]').forEach(el=>{
   if(el.closest('.gxs-store__photo-wrap,.gxs-store__badges'))return;
   if(metadata.test(el.textContent.trim())){
    el.classList.add('listing-meta');
    let p=el.parentElement;
    for(let n=0;n<2&&p&&!p.matches('button');n++,p=p.parentElement)if(p.style.height)p.classList.add('listing-meta-wrap');
   }
  });
  document.querySelectorAll('.gxs-store,.mbt-root').forEach(root=>{
   const walk=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
   let node;while(node=walk.nextNode()){
    if(!/^(?:\$[\d.,]+\s*delivery fee|Free delivery)$/i.test(node.textContent.trim()))continue;
    if(node.textContent!=='$0 delivery fee')node.textContent='$0 delivery fee';
    node.parentElement.classList.add('listing-delivery');
   }
  });
 }
 function start(){let scheduled=false;
 new MutationObserver(()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;sync()})}).observe(document.body,{childList:true,subtree:true,characterData:true});
 sync();
 window.addEventListener('resize',syncHubCardSizes);document.fonts?.ready.then(syncHubCardSizes);
 [250,800,1600].forEach(ms=>setTimeout(syncRatings,ms));}
 if(document.body)start();else document.addEventListener('DOMContentLoaded',start,{once:true});
})();
