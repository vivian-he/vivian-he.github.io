/* Adapts existing Picnic listing metadata without replacing cards or handlers. */
(()=>{
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
 function sync(){
  syncRatings();
  document.querySelectorAll('.assistant-nudges-meal-box-card__price,.sp-price,.mbt-price,.mbx-price,.gxs-mb-price,.rxi-price,.menu-item-price,.msx6-price,.mbvp-rail-card__price,.pedregal-item-modal__price,.pedregal-item-carousel__price,.gxs-store__pill-price > span').forEach(el=>{
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
 [250,800,1600].forEach(ms=>setTimeout(syncRatings,ms));}
 if(document.body)start();else document.addEventListener('DOMContentLoaded',start,{once:true});
})();
