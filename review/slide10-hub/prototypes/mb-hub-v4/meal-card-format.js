/* Final Hub after-state meal tile format, scoped to this saved prototype route. */
(() => {
  const style = document.createElement('style');
  style.textContent = `
    html.meal-ref-format .mbt-root .mbt-sf__tile,
    html.meal-ref-format .mbt-root .mbt-uber__tile { display: flex; flex-direction: column; }
    html.meal-ref-format .mbt-root .mbt-sf__tile .meal-ref-price,
    html.meal-ref-format .mbt-root .mbt-uber__tile .meal-ref-price {
      display: block; margin-top: 14px; color: #191919 !important;
      font-size: 0 !important; line-height: 24px; font-weight: 700;
      white-space: nowrap;
    }
    html.meal-ref-format .mbt-root .meal-ref-price > span { display: none !important; }
    html.meal-ref-format .mbt-root .meal-ref-price::before { content: '$12'; font-size: 20px; }
    html.meal-ref-format .mbt-root .meal-ref-price::after {
      content: '00'; display: inline-block; position: relative; top: -7px;
      margin-left: 1px; font-size: 11px; line-height: 1;
    }
    html.meal-ref-format .mbt-root .meal-ref-tag {
      display: table; align-self: flex-start; margin-top: 9px; padding: 4px 12px;
      border-radius: 999px; background: #fff0ed; color: #eb1700;
      font: 700 13px/19px 'DD Norms', sans-serif; white-space: nowrap;
    }
    html.meal-ref-format .mbt-root .mbt-sf__tile .mbt-sf__dish,
    html.meal-ref-format .mbt-root .mbt-uber__tile .mbt-uber__dish {
      display: -webkit-box !important; -webkit-box-orient: vertical; -webkit-line-clamp: 2;
      overflow: hidden; margin-top: 7px; min-height: 42px; color: #606060 !important;
      font: 500 16px/21px 'DD Norms', sans-serif !important;
      white-space: normal !important; text-overflow: clip !important;
    }
  `;
  document.head.append(style);

  const isAfter = () => new URLSearchParams(location.search).get('world') === 'after'
    || document.documentElement.dataset.briefWorld === 'after';
  const format = () => {
    const after = isAfter();
    document.documentElement.classList.toggle('meal-ref-format', after);
    if (!after) return;
    document.querySelectorAll('.mbt-root .mbt-sf__tile, .mbt-root .mbt-uber__tile').forEach(tile => {
      const dish = tile.querySelector(':scope > .mbt-sf__dish, :scope > .mbt-uber__dish');
      const price = tile.querySelector(':scope > .mbt-price, :scope > .mbt-uber__price');
      if (!dish || !price) return;
      price.classList.add('meal-ref-price');
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
  };
  const observer = new MutationObserver(format);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  format();
})();
