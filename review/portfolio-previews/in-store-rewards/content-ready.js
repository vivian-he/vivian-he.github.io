// Honor a direct section link once the custom-element styles have laid out.
// Stop if the reader starts browsing; never pull them back during interaction.
const initialHash = location.hash;
if (initialHash) {
  let readerMoved = false;
  const moved = () => { readerMoved = true; };
  const inputs = ['wheel', 'touchstart', 'pointerdown', 'keydown'];
  inputs.forEach(type => window.addEventListener(type, moved, {once:true, passive:true}));
  Promise.all(['rewards-how-banner','rewards-education-comparison','rewards-dashboard-comparison','rewards-relevance-story','rewards-map-explorations','rewards-map-comparison'].map(tag => customElements.whenDefined(tag)))
    .then(async () => {
      const styles = [...document.querySelectorAll('rewards-how-banner,rewards-education-comparison,rewards-dashboard-comparison,rewards-relevance-story,rewards-map-explorations,rewards-map-comparison')]
        .flatMap(el => [...(el.shadowRoot?.querySelectorAll('link[rel="stylesheet"]') || [])]);
      styles.push(...document.querySelectorAll('link[rel="stylesheet"]'));
      await Promise.all(styles.map(link => link.sheet ? Promise.resolve() : new Promise(resolve => {
        link.addEventListener('load', resolve, {once:true});
        link.addEventListener('error', resolve, {once:true});
      })));
      await document.fonts.ready;
      // The expanded dashboard changes section height after its app has rendered.
      // Resolve later deep links after that measurement, without stealing user scroll.
      if (['#rewards-relevance','#rewards-map-first'].includes(initialHash)) {
        const comparison = document.querySelector('rewards-dashboard-comparison');
        const frame = comparison?.shadowRoot?.querySelector('iframe');
        if (frame) frame.loading = 'eager';
        if (comparison && !comparison.hasAttribute('data-ready')) await new Promise(resolve => {
          const observer = new MutationObserver(() => {
            if (comparison.hasAttribute('data-ready')) { observer.disconnect(); resolve(); }
          });
          observer.observe(comparison, {attributes:true, attributeFilter:['data-ready']});
          setTimeout(() => {observer.disconnect(); resolve();},12000);
        });
        await new Promise(resolve => setTimeout(resolve,300));
      }
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      if (!readerMoved && location.hash === initialHash) {
        document.getElementById(decodeURIComponent(initialHash.slice(1)))?.scrollIntoView({block:'start',behavior:'instant'});
      }
      inputs.forEach(type => window.removeEventListener(type, moved));
    });
}
