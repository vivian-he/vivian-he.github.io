/* Isolated slide19 scenario. Native store navigation remains manually controlled. */
(()=>{if(new URLSearchParams(location.search).get('storecase')!=='value-conflict')return;
let selected=null;
const style=document.createElement('style');
style.textContent=`
 [data-value-conflict-bogo-price]{color:#eb1700!important}
 [data-value-conflict-bogo-price]>*{display:none!important}
 [data-value-conflict-bogo-price]::before{content:'2 for $14';font-size:18px;line-height:22px;font-weight:700}
 .featured-card__meta>.nv-item-card__deal-tag{display:table;align-self:flex-start;margin-top:4px}
`;
document.head.append(style);
function formatOffer(){
 const card=document.querySelector('.featured-card');
 const badge=card?.querySelector('.nv-item-card__deal-tag');
 const row=card?.querySelector('.featured-card__price-row');
 if(badge&&row&&badge.parentElement===row)row.after(badge);
 const price=card?.querySelector('.sp-price');
 if(price&&!price.hasAttribute('data-value-conflict-bogo-price'))price.setAttribute('data-value-conflict-bogo-price','');
 document.querySelectorAll('.recently-ordered__deal-tag').forEach(tag=>{
  const price=tag.parentElement.querySelector('.sp-price');
  if(price&&!price.hasAttribute('data-value-conflict-bogo-price'))price.setAttribute('data-value-conflict-bogo-price','');
 });
}
function text(el,value){if(el&&el.textContent!==value)el.textContent=value}
document.addEventListener('click',e=>{
 const deal=e.target.closest('.deal-banner');if(deal?.textContent.includes('Buy 1, get 1')){document.querySelector('#sec-featured')?.scrollIntoView({behavior:'smooth',block:'start'});return}
 const card=e.target.closest('.featured-card');if(card){selected={name:card.querySelector('.featured-card__name')?.textContent,img:card.querySelector('img')?.src,price:card.querySelector('.sp-price__integer')?.textContent,bogo:card.textContent.includes('Buy 1, get 1'),meal:card.textContent.includes('Meal Box')}}
},true);
function sync(){formatOffer();const root=document.querySelector('.rxi-root');if(!root||!selected||root.dataset.valueCase===selected.name)return;root.dataset.valueCase=selected.name;
 text(root.querySelector('.rxi-name'),selected.name);text(root.querySelector('.rxi-nav-title'),selected.name);
 if(!selected.meal)text(root.querySelector('.rxi-desc'),selected.name==='NAYA Bowl'?'Build your bowl with your choice of grains, protein, and toppings.':'Fresh greens with your choice of toppings and dressing.');
 const img=root.querySelector('.rxi-hero img');if(img){img.src=selected.img;img.alt=selected.name}
 text(root.querySelector('.rxi-price__integer'),selected.price);text(root.querySelector('.rxi-price__decimal'),'00');
 const atc=root.querySelector('.rxi-atc');if(atc){const price=[...atc.querySelectorAll('span')].find(x=>/^\$/.test(x.textContent));text(price,'$'+selected.price+'.00')}
 if(!selected.meal)root.querySelectorAll('.mb1l,.rxi-promise,.rxi-price-line > .rxi-badge').forEach(x=>x.style.display='none');
 if(selected.bogo){root.querySelector('.rxi-price')?.setAttribute('data-value-conflict-bogo-price','');const badge=document.createElement('div');badge.textContent='Buy 1, get 1 free';badge.style.cssText='color:#c42510;background:#fff0ed;border-radius:999px;display:table;padding:4px 10px;font-weight:700;margin:8px 0';root.querySelector('.rxi-price-line')?.after(badge)}
}
let queued=false;new MutationObserver(()=>{if(!queued){queued=true;requestAnimationFrame(()=>{queued=false;sync()})}}).observe(document.documentElement,{childList:true,subtree:true});sync();
})();
