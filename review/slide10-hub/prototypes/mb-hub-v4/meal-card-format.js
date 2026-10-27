/* Final Hub after-state meal tile format, scoped to this saved prototype route. */
(() => {
  const style = document.createElement('style');
  style.textContent = `
    html.meal-ref-format .mbt-root .mbt-sf__tile,
    html.meal-ref-format .mbt-root .mbt-uber__tile { display:flex; flex-direction:column; }
    html.meal-ref-format .mbt-root .meal-ref-price {
      display:inline-flex!important;align-items:flex-start;gap:0;margin-top:8px;
      color:#191919!important;font:700 18px/24px 'DD Norms',sans-serif!important;
      white-space:nowrap;
    }
    html.meal-ref-format .mbt-root .meal-ref-price::before,
    html.meal-ref-format .mbt-root .meal-ref-price::after {content:none!important}
    html.meal-ref-format .mbt-root .meal-ref-price>span {
      display:inline!important;position:static!important;transform:none!important;
      color:inherit!important;font:inherit!important;
    }
    html.meal-ref-format .mbt-root .meal-ref-price>.mbt-price__cents {
      font-size:14px!important;line-height:20px!important;margin-left:1px;
    }
    html.meal-ref-format .mbt-root .meal-ref-price>.mbt-price__sym {font-size:12px!important;line-height:18px!important}
    html.meal-ref-format .mbt-root .mbt-sf__name,
    html.meal-ref-format .mbt-root .mbt-uber__name {font:700 14px/20px 'DD Norms',sans-serif!important}
    html.meal-ref-format .mbt-root .mbt-sf .mbt-meta,
    html.meal-ref-format .mbt-root .mbt-uber .mbt-meta {font:500 12px/18px 'DD Norms',sans-serif!important;color:#606060}
    html.meal-ref-format .mbt-root .meal-ref-tag {
      display:table;align-self:flex-start;margin-top:6px;padding:2px 8px;
      border-radius:999px;background:#fff0ed;color:#eb1700;
      font:700 12px/16px 'DD Norms',sans-serif;white-space:nowrap;
    }
    html.meal-ref-format .mbt-root .mbt-sf__tile .mbt-sf__dish,
    html.meal-ref-format .mbt-root .mbt-uber__tile .mbt-uber__dish {
      display:-webkit-box!important;-webkit-box-orient:vertical;-webkit-line-clamp:2;
      overflow:hidden;margin-top:6px;min-height:36px;color:#606060!important;
      font:500 13px/18px 'DD Norms',sans-serif!important;
      white-space:normal!important;text-overflow:clip!important;
    }
  `;
  document.head.append(style);

  const isAfter = () => new URLSearchParams(location.search).get('world') === 'after'
    || document.documentElement.dataset.briefWorld === 'after';
  let focused=false;
  const format = () => {
    const after = isAfter();
    document.documentElement.classList.toggle('meal-ref-format', after);
    if (!after) return;
    document.querySelectorAll('.mbt-root .mbt-sf__tile, .mbt-root .mbt-uber__tile').forEach(tile => {
      const dish = tile.querySelector(':scope > .mbt-sf__dish, :scope > .mbt-uber__dish');
      const price = tile.querySelector(':scope > .mbt-price, :scope > .mbt-uber__price');
      if (!dish || !price) return;
      price.classList.add('meal-ref-price');
      // One real split price, including tiles whose saved source used a text node.
      if (!price.querySelector('.mbt-price__dollars')) {
        price.innerHTML='<span class="mbt-price__sym">$</span><span class="mbt-price__dollars">12</span><span class="mbt-price__cents">00</span>';
      }
      if (price.nextElementSibling !== dish && price.nextElementSibling?.className !== 'meal-ref-tag') {
        tile.insertBefore(price, dish);
      }
      let tag = tile.querySelector(':scope > .meal-ref-tag');
      if (!tag) {
        tag = document.createElement('span');
        tag.className = 'meal-ref-tag';
        tag.textContent = 'Meal Box';
        tile.insertBefore(tag, dish);
      } else if (tag.nextElementSibling !== dish) {
        tile.insertBefore(tag, dish);
      }
      if (price.nextElementSibling !== tag) tile.insertBefore(price, tag);
    });
    if(!focused&&new URLSearchParams(location.search).get('focus')==='storefirst'){
      const section=document.querySelector('#mbt-at-fastest'),scroll=document.querySelector('.mbt-scroll');
      if(section&&scroll){focused=true;requestAnimationFrame(()=>{scroll.scrollTop+=section.getBoundingClientRect().top-scroll.getBoundingClientRect().top-108;});}
    }
  };
  const observer = new MutationObserver(format);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  format();
})();
