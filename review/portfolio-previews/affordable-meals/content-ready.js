// Honor a direct section link once the custom-element styles have laid out.
// Stop if the reader starts browsing; never pull them back during interaction.
const initialHash = location.hash;
if (initialHash) {
  let readerMoved = false;
  const moved = () => { readerMoved = true; };
  const inputs = ['wheel', 'touchstart', 'pointerdown', 'keydown'];
  inputs.forEach(type => window.addEventListener(type, moved, {once:true, passive:true}));
  Promise.all(['meal-offering-art','meal-discovery-story','meal-market-comparison','meal-merchant-story'].map(tag => customElements.whenDefined(tag)))
    .then(async () => {
      const styles = [...document.querySelectorAll('meal-offering-art,meal-discovery-story,meal-market-comparison,meal-merchant-story')]
        .flatMap(el => [...(el.shadowRoot?.querySelectorAll('link[rel="stylesheet"]') || [])]);
      await Promise.all(styles.map(link => link.sheet ? Promise.resolve() : new Promise(resolve => {
        link.addEventListener('load', resolve, {once:true});
        link.addEventListener('error', resolve, {once:true});
      })));
      await document.fonts.ready;
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      if (!readerMoved && location.hash === initialHash) {
        document.getElementById(decodeURIComponent(initialHash.slice(1)))?.scrollIntoView({block:'start',behavior:'instant'});
      }
      inputs.forEach(type => window.removeEventListener(type, moved));
    });
}
