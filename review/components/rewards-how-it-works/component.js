const artworkUrl = new URL('./how-it-works.svg', import.meta.url);
const stylesUrl = new URL('./component.css', import.meta.url);

class RewardsHowItWorks extends HTMLElement {
  constructor() {
    super();

    const root = this.attachShadow({ mode: 'open' });
    const styles = document.createElement('link');
    styles.rel = 'stylesheet';
    styles.href = stylesUrl.href;

    const image = document.createElement('img');
    image.src = artworkUrl.href;
    image.width = 375;
    image.height = 190;
    image.alt = 'How it works: Link your cards and claim an offer. Pay in store with a linked card. DoorDash credits are deposited back.';
    image.decoding = 'async';

    root.append(styles, image);
  }
}

if (!customElements.get('rewards-how-it-works')) {
  customElements.define('rewards-how-it-works', RewardsHowItWorks);
}
