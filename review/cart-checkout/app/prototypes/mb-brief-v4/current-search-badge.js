/* Old search: keep the Meal Box badge below the delivery-fee row. */
(()=>{
 const mount=()=>{
  const results=document.querySelector('[aria-label="Search results"]')||document;
  const cards=[...results.querySelectorAll('[role="button"]')].filter(card=>card.querySelector('[aria-label="Item photo gallery"]'));
  const last=cards.at(-1);if(!last)return;
  const fee=[...last.querySelectorAll('div')].find(el=>el.textContent.trim()==='$0 delivery fee'&&el.children.length===0);if(!fee)return;
  const feeRow=fee.parentElement?.parentElement?.parentElement;if(!feeRow)return;
  let badge=last.querySelector('[data-current-mealbox-badge]');
  if(!badge){badge=document.createElement('span');badge.dataset.currentMealboxBadge='';badge.textContent='$12 Meal Box';badge.style.cssText='display:inline-flex;align-items:center;align-self:flex-start;margin-top:4px;padding:2px 8px;border-radius:999px;background:#fff0ed;color:#d91400;font-family:"DD Norms UI",sans-serif;font-size:12px;font-weight:700;line-height:18px'}
  if(badge.previousElementSibling!==feeRow)feeRow.after(badge);
 };
 new MutationObserver(mount).observe(document.documentElement,{subtree:true,childList:true});mount();
})();
