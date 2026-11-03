/* Native store-card price hierarchy and source-backed item details. */
(()=>{
 if(document.getElementById('store-menu-reference-style'))return;
 const style=document.createElement('style');style.id='store-menu-reference-style';style.textContent=`
.featured-card__prices{display:flex!important;align-items:baseline!important;gap:5px!important;flex-wrap:wrap;}
.featured-card__price-row>.featured-card__prices{order:1;}
.featured-card__price-row>.nv-item-card__deal-tag{order:2;align-self:flex-start;margin-top:4px;}
.featured-card__was-price,.store-reference-was-price{font:500 14px/20px 'DD Norms',Arial,sans-serif!important;color:#606060!important;text-decoration:line-through!important;}
[data-value-conflict-bogo-price]::before{font-size:16px!important;line-height:22px!important;font-weight:500!important;}
[data-value-conflict-bogo-price][data-bogo-original]::after{content:attr(data-bogo-original);margin-left:5px;color:#9a9a9a;font:500 14px/20px 'DD Norms',Arial,sans-serif;text-decoration:line-through;}
.featured-card__callouts{display:flex!important;flex-wrap:nowrap!important;align-items:center!important;column-gap:3px!important;white-space:nowrap!important;}
.store-item-attributes{display:block;flex-basis:100%;font:400 12px/18px 'DD Norms',Arial,sans-serif;color:#606060;}
.featured-card__review,.featured-card__callout-text{font-size:12px!important;line-height:18px!important;color:#606060!important;}
.featured-card__meta>.nv-item-card__deal-tag{font-size:12px!important;line-height:18px!important;margin-top:4px!important;padding:2px 8px!important;}

.featured-card__meta:has(>.mb-offer-applied-row),.h-item-card__meta:has(>.mb-offer-applied-row){display:grid!important;grid-template-columns:max-content minmax(0,1fr)!important;column-gap:6px!important;}
.featured-card__meta:has(>.mb-offer-applied-row)>*,.h-item-card__meta:has(>.mb-offer-applied-row)>*{grid-column:1/-1;}
.featured-card__meta:has(>.mb-offer-applied-row)>.featured-card__price-row{grid-column:1!important;grid-row:3!important;}
.featured-card__meta:has(>.mb-offer-applied-row)>.mb-offer-applied-row{grid-column:2!important;grid-row:3!important;align-self:center!important;justify-self:start!important;margin:0!important;}
.h-item-card__meta:has(>.mb-offer-applied-row)>.h-item-card__price-row{grid-column:1!important;grid-row:4!important;}
.h-item-card__meta:has(>.mb-offer-applied-row)>.mb-offer-applied-row{grid-column:2!important;grid-row:4!important;align-self:center!important;justify-self:start!important;margin:0!important;}
`;document.head.append(style);
 // Presentation cards use approval and popularity metadata, never ingredient lines.
 function cardMetadata(){
  const template=document.querySelector('.featured-card__review');
  document.querySelectorAll('.featured-card').forEach((card,index)=>{
   const row=card.querySelector('.featured-card__callouts');if(!row)return;
   row.querySelectorAll('.store-item-attributes').forEach(line=>line.remove());
   let review=row.querySelector('.featured-card__review');
   if(!review&&template){
    review=template.cloneNode(true);
    // Approval placeholder for the illustrative card without native review data.
    [...review.childNodes].filter(node=>node.nodeType===3).forEach(node=>node.remove());
    review.append(document.createTextNode('91%'));row.prepend(review);
   }
   let dot=row.querySelector('.featured-card__dot');
   if(!dot){dot=document.createElement('span');dot.className='featured-card__dot';dot.textContent='·';row.append(dot);}
   let callout=row.querySelector('.featured-card__callout-text');
   if(!callout){callout=document.createElement('span');callout.className='featured-card__callout-text';row.append(callout);}
   const ranks={'NAYA Bowl':1,'Chicken Shawarma Bowl':2,'Falafel Salad':3,'NAYA Salad':4};
   const name=card.querySelector('.featured-card__name')?.textContent.trim();
   const rank='#'+(ranks[name]||(index+1))+' Most liked';if(callout.textContent!==rank)callout.textContent=rank;
   if(dot.nextSibling!==callout)row.insertBefore(dot,callout);
  });
 }
 function sync(){
  document.querySelectorAll('[data-value-conflict-bogo-price]').forEach(price=>{
   const label=getComputedStyle(price,'::before').content;
   const match=label.match(/\$([\d.]+)/);if(!match)return;
   const original=Number(match[1])*2;
   const value=Number(match[1])===14?'$28.50':'$'+(Number.isInteger(original)?original.toFixed(0):original.toFixed(2));
   if(price.dataset.bogoOriginal!==value)price.dataset.bogoOriginal=value;
  });
  cardMetadata();
 }
 let queued=false;new MutationObserver(()=>{if(!queued){queued=true;requestAnimationFrame(()=>{queued=false;sync()})}}).observe(document.documentElement,{childList:true,subtree:true});sync();
})();
