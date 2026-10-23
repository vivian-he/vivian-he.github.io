class MealMarketComparison extends HTMLElement {
  connectedCallback() {
    if (this.shadowRoot) return;
    const root = this.attachShadow({ mode: 'open' });
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = '/review/portfolio-previews/affordable-meals/comparison/component.css?v=final71';
    root.append(stylesheet);

    // The bundled hub prototype contains these exact meal photos and dish names.
    const photoRoot = '/review/slide10-hub/assets/';
    const dishes = {
      pokeTuna: { merchant: 'Poke House', name: 'Spicy Tuna', rating: '4.5 ★ (1k+) · 21 min', photo: 'poke-house-spicy-tuna-CL5SHAx-.jpg' },
      pokeSalmon: { merchant: 'Poke House', name: 'Sunny Salmon®', rating: '4.5 ★ (1k+) · 21 min', photo: 'poke-house-sunny-salmon-x1IgKo_4.jpg' },
      riceChicken: { merchant: 'RICE Mediterranean Kitchen', name: 'Rice Chicken Meal', rating: '4.6 ★ (2k+) · 24 min', photo: 'rice-med-rice-chicken-meal-BIloHsUX.png' },
      riceBeef: { merchant: 'RICE Mediterranean Kitchen', name: 'Rice Beef Meal', rating: '4.6 ★ (2k+) · 24 min', photo: 'rice-med-rice-beef-meal-BKDfDpmy.png' },
      riceVeggie: { merchant: 'RICE Mediterranean Kitchen', name: 'Rice Veggie Meal', rating: '4.6 ★ (2k+) · 24 min', photo: 'rice-med-rice-veggie-meal-BZ8ZRX19.jpg' },
      valeBaja: { merchant: 'Vale Healthy Kitchen', name: 'Vale Essential Baja Bowl', rating: '4.4 ★ (3k+) · 26 min', photo: 'vale-healthy-vale-essential-baja-bowl-BOsEo34t.jpg' },
      pokeCaesar: { merchant: 'Poke House', name: 'The Caesar', rating: '4.5 ★ (1k+) · 21 min', photo: 'poke-house-the-caesar-xILloMJ7.jpg' },
      valeBurrito: { merchant: 'Vale Healthy Kitchen', name: 'Vale Essential Burrito', rating: '4.4 ★ (3k+) · 26 min', photo: 'vale-healthy-vale-essential-burrito-Bt8ky91f.jpg' },
      valeChicken: { merchant: 'Vale Healthy Kitchen', name: 'Vale Essential Chicken Bowl', rating: '4.4 ★ (3k+) · 26 min', photo: 'vale-healthy-vale-essential-chicken-bowl-CdyVmcBs.jpg' },
    };
    const mealPhoto = (dish) => `<div class="meal-photo"><img src="${photoRoot + dish.photo}" alt="${dish.name}" loading="lazy"><span class="add-icon" aria-hidden="true">+</span></div>`;
    const dashpassIcon = `<svg class="dashpass" viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M.373 4.004a.37.37 0 0 0-.207.078.4.4 0 0 0-.137.182.44.44 0 0 0 .076.44l7.692 8.253q.03.03.07.039a.14.14 0 0 0 .078-.003.15.15 0 0 0 .067-.045.2.2 0 0 0 .038-.073l.664-3.372a.15.15 0 0 1 .049-.091.13.13 0 0 1 .093-.033l2.703-.01a.83.83 0 0 0 .613-.243.96.96 0 0 0 .28-.634.84.84 0 0 0-.235-.553.72.72 0 0 0-.527-.22l-2.917.01a.27.27 0 0 1-.208-.089L7.303 6.285a.258.258 0 0 1-.055-.268.24.24 0 0 1 .085-.112.2.2 0 0 1 .13-.032h4.348c.322 0 .64.068.936.2s.566.325.794.57c.227.243.407.533.53.852a2.8 2.8 0 0 1 0 2.01 2.7 2.7 0 0 1-.53.853 2.4 2.4 0 0 1-.794.57 2.3 2.3 0 0 1-.936.2v.007h-1.727a.154.154 0 0 0-.148.128l-.311 1.54c-.02.101.05.197.147.197h2.153v-.002a3.9 3.9 0 0 0 1.49-.34c.508-.227.97-.558 1.358-.976.39-.418.698-.914.908-1.46a4.8 4.8 0 0 0 0-3.444 4.6 4.6 0 0 0-.727-1.253l-.05-.06a4.183 4.183 0 0 0-1.49-1.122c-.45-.201-.93-.315-1.416-.339L11.843 4h-.032z"></path></svg>`;
    const individualCard = (dish) => `<div class="meal-item">${mealPhoto(dish)}<div class="item-merchant">${dashpassIcon}${dish.merchant}</div><div class="item-rating">${dish.rating}</div><div class="item-name">${dish.name}</div><div class="item-price">$12.00</div></div>`;
    const merchantCard = (name, rating, members) => `<div class="merchant-item"><div class="merchant-head"><div class="merchant-name">${name}</div><div class="merchant-rating">${rating}</div><span class="merchant-arrow" aria-hidden="true">›</span></div><div class="merchant-meals">${members.map(dish => `<div class="grouped-meal">${mealPhoto(dish)}<div class="grouped-price" aria-label="$12.00">$12<sup>00</sup></div><div class="meal-box-tag">Meal Box</div><div class="grouped-name">${dish.name}</div></div>`).join('')}</div></div>`;

    const allMeals = '/references/meals-content-2026-10-23/all-meals-current-after.png';
    const excerpt = (side, region, label) => {
      const reframe = side === 'after' ? `<span class="merchant-reframe" aria-hidden="true"><img src="${allMeals}" alt=""></span>` : '';
      return `<div class="snippet snippet--all-meals snippet--${side} snippet--${region}"><img src="${allMeals}" alt="${label}" decoding="async" class="source-image">${reframe}</div>`;
    };

    const shell = document.createElement('div');
    shell.className = 'comparison';
    shell.innerHTML = `
      <div class="snippet-grid snippet-grid--carousel">
        <figure class="comparison-card"><figcaption>Before</figcaption><div class="snippet-sheet carousel-sheet"><h3>Fastest near you</h3><div class="native-carousel native-carousel--before" aria-label="Before: individual meal cards"><div class="carousel-page">${[dishes.riceChicken,dishes.riceBeef,dishes.riceVeggie].map(individualCard).join('')}</div><div class="carousel-page">${[dishes.pokeTuna,dishes.pokeSalmon,dishes.pokeCaesar].map(individualCard).join('')}</div><div class="carousel-page">${[dishes.valeBaja,dishes.valeChicken,dishes.valeBurrito].map(individualCard).join('')}</div></div></div></figure>
        <figure class="comparison-card"><figcaption>After</figcaption><div class="snippet-sheet carousel-sheet"><h3>Fastest near you</h3><div class="native-carousel native-carousel--after" aria-label="After: grouped merchant meal cards"><div class="carousel-page">${merchantCard('RICE Mediterranean Kitchen','4.6 ★ (2k+) · 24 min',[dishes.riceChicken,dishes.riceBeef])}</div><div class="carousel-page">${merchantCard('Poke House','4.5 ★ (1k+) · 21 min',[dishes.pokeTuna,dishes.pokeSalmon])}</div><div class="carousel-page">${merchantCard('Vale Healthy Kitchen','4.4 ★ (3k+) · 26 min',[dishes.valeBaja,dishes.valeChicken])}</div></div></div></figure>
      </div>
      <div class="snippet-grid snippet-grid--all-meals">
        <figure class="comparison-card"><figcaption>Before</figcaption><div class="snippet-sheet excerpt-sheet">${excerpt('before','tacos','Before: Santísimo Taco meals with repeated merchant names and complete prices')}${excerpt('before','sushi','Before: Pubbelly Sushi meals with repeated merchant names and complete prices')}</div></figure>
        <figure class="comparison-card"><figcaption>After</figcaption><div class="snippet-sheet excerpt-sheet">${excerpt('after','tacos','After: Santísimo Taco merchant section and complete meal prices')}${excerpt('after','sushi','After: Pubbelly Sushi merchant section and complete meal prices')}</div></figure>
      </div>`;
    root.append(shell);

    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const rails = [...root.querySelectorAll('.native-carousel')];
      const pages = rails.map(rail => [...rail.querySelectorAll('.carousel-page')]);
      rails.forEach((rail, index) => {
        const clone = pages[index][0].cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        rail.append(clone);
        pages[index].push(clone);
      });
      let step = 0;
      this._carouselTimer = window.setInterval(() => {
        step += 1;
        rails.forEach((rail, index) => {
          rail.scrollTo({ left: pages[index][step].offsetLeft - pages[index][0].offsetLeft, behavior: 'smooth' });
        });
        if (step === 3) {
          this._resetTimer = window.setTimeout(() => {
            rails.forEach(rail => { rail.style.scrollBehavior = 'auto'; rail.scrollLeft = 0; });
            requestAnimationFrame(() => rails.forEach(rail => { rail.style.scrollBehavior = ''; }));
            step = 0;
          }, 500);
        }
      }, 2600);
    }
  }
  disconnectedCallback() { window.clearInterval(this._carouselTimer); window.clearTimeout(this._resetTimer); }
}

if (!customElements.get('meal-market-comparison')) customElements.define('meal-market-comparison', MealMarketComparison);
