const sourceRoot = new URL('./', import.meta.url);
const bannerUrl = new URL('../../../../references/rewards-dashboard-2026-10-23/how-it-works.svg', sourceRoot);
const mapOnHomeUrl = new URL('./map-on-home-composed.svg', sourceRoot);
const historicLandingUrl = new URL('../../../beyond-delivery/story-v2/assets/where-we-started/landing.png', sourceRoot);
const cssUrl = new URL('./component.css', sourceRoot);
cssUrl.search = 'v=final71';

function stylesheet() {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = cssUrl.href;
  return link;
}

class RewardsHowBanner extends HTMLElement {
  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });
    const art = document.createElement('div');
    art.className = 'how-banner-art';
    const img = document.createElement('img');
    img.className = 'how-banner';
    img.src = bannerUrl.href;
    img.width = 375;
    img.height = 190;
    img.alt = 'How it works: link your cards and claim an offer, pay in store with a linked card, then receive DoorDash credits.';
    img.decoding = 'async';
    art.append(img);
    root.append(stylesheet(), art);
  }
}

class RewardsEducationComparison extends HTMLElement {
  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });
    const pair = document.createElement('div');
    pair.className = 'education-pair';
    pair.innerHTML = `
      <div class="education-screen" role="img" aria-label="Map on Home study with the original map, older white location pins, and Home navigation">
        <img class="home-map-screen" width="375" height="812" alt="" decoding="async">
      </div>
      <div class="education-screen education-screen--going-out" role="img" aria-label="Original Going Out screen with its crowded map, old filters, and Going Out sheet">
        <img class="historical-screen" width="750" height="1624" alt="" decoding="async">
      </div>`;
    pair.querySelector('.home-map-screen').src = mapOnHomeUrl.href;
    pair.querySelector('.historical-screen').src = historicLandingUrl.href;
    root.append(stylesheet(), pair);
  }
}

if (!customElements.get('rewards-how-banner')) customElements.define('rewards-how-banner', RewardsHowBanner);
if (!customElements.get('rewards-education-comparison')) customElements.define('rewards-education-comparison', RewardsEducationComparison);
