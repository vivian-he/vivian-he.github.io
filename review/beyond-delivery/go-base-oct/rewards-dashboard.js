/* Rewards dashboard treatment. The credit-sandbox React runtime still owns
   its cards, claims, filters, and store navigation. */
(() => {
  const banner = '/references/rewards-dashboard-2026-10-23/how-it-works.svg';
  // The eight current Most popular entries are Ix.slice(8, 16) in the saved
  // credit-sandbox bundle. Values follow its Vk(coords) walking-time formula
  // with the default San Francisco user coordinate. See the source audit.
  const popularWalkMinutes = new Map([
    ['Bocado Peruvian Cuisine', 4],
    ['CURRY & KABAB INDIAN RESTAURANT', 4],
    ['Farmacy', 4],
    ['Hakashi Japanese Sushi Bar & Grill', 4],
    ['Fang', 4],
    ["Henry's Hunan Restaurant", 4],
    ['Lao Table', 5],
    ['Fogo de Chão', 5]
  ]);
  const css = `
    .go-page { --oct-rewards-section-space: 24px; }
    .go-page .oct-feed-content > .go-header { padding-bottom: 14px; }
    .go-page .oct-feed-content > .go-filter-row {
      padding-top: 10px;
      padding-bottom: 16px;
      min-height: 58px;
    }
    .go-page .go-deals-header,
    .go-page .go-benefits-header { padding-bottom: 0; }
    .go-page .go-deals,
    .go-page .go-carousel-module:has(.go-popular-card) { padding-bottom: var(--oct-rewards-section-space); }
    .go-page .go-section-header { padding-bottom: 8px; }
    .go-page .latest-national h2 { margin-bottom: 8px; }
    .go-page .latest-national {
      margin-bottom: 0;
      padding-bottom: 0 !important;
    }
    .go-page .go-benefits { padding-top: var(--oct-rewards-section-space); }
    .go-page .oct-how-it-works {
      display: grid;
      gap: var(--oct-rewards-section-space);
      width: calc(100% + 32px);
      margin: var(--oct-rewards-section-space) -16px 0;
    }
    .go-page .oct-how-it-works > div {
      position: relative;
      overflow: hidden;
      width: 100%;
    }
    .go-page .oct-how-it-works__heading { aspect-ratio: 375 / 20; }
    .go-page .oct-how-it-works__steps { aspect-ratio: 375 / 118; }
    .go-page .oct-how-it-works img {
      position: absolute;
      left: 0;
      display: block;
      width: 100%;
      height: auto;
    }
    .go-page .oct-how-it-works__heading img { top: 0; transform: translateY(-9.474%); }
    .go-page .oct-how-it-works__steps img { top: 0; transform: translateY(-29.474%); }
    .go-page :is(.go-benefits-grid, .go-deal-grid) {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: 0;
    }
    .go-page .go-deal-grid { padding-top: 4px; }
    .go-page :is(.go-benefits-card, .go-deal-grid-card) {
      position: relative;
      display: grid;
      width: 100%;
      grid-template-columns: 88px minmax(0, 1fr) 76px;
      align-items: center;
      column-gap: 10px;
      min-height: 104px;
      padding: 8px 0;
      border: 0;
    }
    .go-page :is(.go-benefits-card, .go-deal-grid-card) :is(.go-benefits-img-wrap, .go-popular-img-wrap) {
      position: static;
      grid-column: 1;
      width: 88px;
      height: 88px;
      aspect-ratio: auto;
      border-radius: 10px;
      overflow: visible;
    }
    .go-page :is(.go-benefits-card, .go-deal-grid-card) :is(.go-benefits-img, .go-popular-img) {
      width: 88px;
      height: 88px;
      border-radius: 10px;
      object-fit: cover;
    }
    .go-page :is(.go-benefits-card, .go-deal-grid-card) .go-lunch-info {
      grid-column: 2;
      min-width: 0;
      padding-top: 0;
    }
    .go-page :is(.go-benefits-card, .go-deal-grid-card) .go-lunch-name {
      overflow: visible;
      white-space: normal;
      line-height: 19px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .go-page :is(.go-benefits-card, .go-deal-grid-card) .go-lunch-meta,
    .go-page :is(.go-benefits-card, .go-deal-grid-card) .go-lunch-promo {
      flex-wrap: wrap;
      row-gap: 0;
    }
    .go-page :is(.go-benefits-card, .go-deal-grid-card) .go-lunch-meta { margin-top: 3px; }
    .go-page :is(.go-benefits-card, .go-deal-grid-card) .go-lunch-promo { margin-top: 4px; }
    .go-page :is(.go-benefits-card, .go-deal-grid-card) .go-lunch-promo-detail { white-space: nowrap; }
    .go-page :is(.go-benefits-card, .go-deal-grid-card) :is(.go-lunch-claim-btn, .go-popular-claim-btn) {
      position: absolute;
      right: 0;
      top: 50%;
      bottom: auto;
      transform: translateY(-50%);
      min-width: 76px;
      height: 32px;
      padding: 0 8px;
      white-space: nowrap;
    }
    @media (max-width: 350px) {
      .go-page :is(.go-benefits-card, .go-deal-grid-card) {
        grid-template-columns: 76px minmax(0, 1fr);
        column-gap: 10px;
        min-height: 118px;
      }
      .go-page :is(.go-benefits-card, .go-deal-grid-card) :is(.go-benefits-img-wrap, .go-popular-img-wrap, .go-benefits-img, .go-popular-img) { width: 76px; height: 76px; }
      .go-page :is(.go-benefits-card, .go-deal-grid-card) .go-lunch-info { padding-bottom: 30px; }
      .go-page :is(.go-benefits-card, .go-deal-grid-card) :is(.go-lunch-claim-btn, .go-popular-claim-btn) {
        right: 0;
        top: auto;
        bottom: 7px;
        transform: none;
      }
    }
  `;

  window.installOctRewardsDashboard = function install(doc) {
    if (!doc?.body || doc.documentElement.dataset.octRewardsDashboard) return;
    doc.documentElement.dataset.octRewardsDashboard = 'true';
    const style = doc.createElement('style');
    style.textContent = css;
    doc.head.append(style);

    let scheduled = false;
    const placeBanner = () => {
      const national = doc.querySelector('.go-page .latest-national');
      if (!national || national.querySelector('.oct-how-it-works')) return;
      const figure = doc.createElement('div');
      figure.className = 'oct-how-it-works';
      figure.setAttribute('role', 'img');
      figure.setAttribute('aria-label', 'How it works: link your cards and claim an offer, pay in store with a linked card, and receive DoorDash credits.');
      for (const part of ['heading', 'steps']) {
        const crop = doc.createElement('div');
        crop.className = `oct-how-it-works__${part}`;
        const img = doc.createElement('img');
        img.src = banner;
        img.alt = '';
        img.setAttribute('aria-hidden', 'true');
        img.width = 375;
        img.height = 190;
        crop.append(img);
        figure.append(crop);
      }
      national.append(figure);
    };
    const placePopularWalkTimes = () => {
      const params = new URLSearchParams(doc.defaultView.location.search);
      if ((params.get('city') ?? 'sf') !== 'sf' || params.has('near')) return;
      const sourceIcon = doc.querySelector('.go-page .go-deals .go-deal-card .go-deal-meta > svg:last-of-type');
      if (!sourceIcon) return;
      for (const card of doc.querySelectorAll('.go-page .go-carousel-module .go-popular-card:not(.go-deal-grid-card)')) {
        const name = card.querySelector('.go-lunch-name')?.textContent?.trim();
        const minutes = popularWalkMinutes.get(name);
        const meta = card.querySelector('.go-lunch-meta');
        if (!minutes || !meta || meta.querySelector('[data-oct-popular-walk]')) continue;
        const dot = doc.createElement('span');
        dot.textContent = ' ·';
        dot.setAttribute('aria-hidden', 'true');
        const icon = sourceIcon.cloneNode(true);
        icon.setAttribute('aria-hidden', 'true');
        const time = doc.createElement('span');
        time.dataset.octPopularWalk = 'true';
        time.textContent = `${minutes} min`;
        meta.append(dot, icon, time);
      }
    };
    const syncAdditions = () => {
      scheduled = false;
      placeBanner();
      placePopularWalkTimes();
    };
    const observer = new MutationObserver(() => {
      if (!scheduled) {
        scheduled = true;
        doc.defaultView.requestAnimationFrame(syncAdditions);
      }
    });
    observer.observe(doc.body, {childList: true, subtree: true});
    syncAdditions();

    // React swaps the feed after a chip click. Align the new list beneath the
    // sticky chips so a filter selected deep in the sheet starts at row one.
    doc.addEventListener('click', event => {
      if (!event.target.closest?.('.oct-feed-content > .go-filter-row .go-filter-pill-btn')) return;
      doc.defaultView.requestAnimationFrame(() => {
        doc.defaultView.requestAnimationFrame(() => {
          const scroller = doc.querySelector('.pedregal-snap-sheet__content');
          const filtered = doc.querySelector('.go-page .go-deal-grid');
          if (!scroller) return;
          if (!filtered) {
            scroller.scrollTo({top: 0, behavior: 'auto'});
            return;
          }
          const chips = doc.querySelector('.oct-feed-content > .go-filter-row');
          const target = scroller.scrollTop
            + filtered.getBoundingClientRect().top
            - scroller.getBoundingClientRect().top
            - (chips?.getBoundingClientRect().height ?? 0);
          scroller.scrollTo({top: Math.max(0, target), behavior: 'auto'});
        });
      });
    }, true);
  };
})();
