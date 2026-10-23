/* Closing sequence. Program metrics retain their original cohorts and source periods in notes. */
function renderClosing(s) {
  const root = document.querySelector('#slide');
  if (s.id === 'slide-25') {
    root.className = 'closing-results';
    root.innerHTML = `
      <section class="closing-title"><h2 data-deck-type="h3">More value<br>on both sides</h2></section>
      <section class="results-groups">
        <article class="result-pair">
          <div><strong data-deck-type="percentage">+2.3<span data-percentage-sign>%</span></strong><p data-deck-type="big-subtitle">Consumer order-rate<br>lift</p></div>
          <div><strong data-deck-type="percentage">~45<span data-percentage-sign>%</span></strong><p data-deck-type="big-subtitle">Consumer Meal Box orders<br>incremental</p></div>
        </article>
        <article class="result-pair">
          <div><strong data-deck-type="percentage">4,667</strong><p data-deck-type="big-subtitle">Merchant activations<br>in Q3</p></div>
          <div><strong data-deck-type="percentage">71<span data-percentage-sign>%</span></strong><p data-deck-type="big-subtitle">Merchant activation rate<br>vs. 65% goal</p></div>
        </article>
      </section>`;
    return;
  }
  if (s.id === 'slide-27') {
    root.className = 'closing-hub';
    root.innerHTML = `<section class="hub-heading"><h2 data-deck-type="h3">Test our three affordable meal formats in one hub</h2></section><section class="hub-screen-row">${[
      ['lunch', 'Lunch'], ['breakfast', 'Breakfast'], ['kitchen', 'DoorDash Kitchen']
    ].map(([mode, label]) => `<figure><div class="hub-device"><iframe data-autoplay="off" title="Affordability hub: ${label}" src="../hub-next/index.html?view=${mode}&v=kitchen24b"></iframe></div><figcaption data-deck-type="small-subtitle">${label}</figcaption></figure>`).join('')}</section>`;
    root.querySelectorAll('.hub-device').forEach(el => {
      new ResizeObserver(() => el.style.setProperty('--hub-scale', el.clientWidth / 426)).observe(el);
      // Keep the frame visible even when a cached iframe loads before a listener attaches.
      el.classList.add('ready');
    });
    return;
  }
  if (s.id === 'closing-thanks') {
    root.className = 'closing-thanks closing-photos';
    root.innerHTML = `<section class="wrap-copy"><small>THANK YOU</small><h2 data-deck-type="h3">Continuing to create<br>more value for customers<br>and more opportunity<br>for merchants</h2></section><section class="wrap-photos" aria-label="Merchant activation visits">${[1, 2].map(n => `<figure tabindex="0"><img src="assets/closing/merchant-visit-0${n}.jpeg" alt="Team visiting a merchant in store"><figcaption data-deck-type="small-subtitle">Merchant activation · In store</figcaption></figure>`).join('')}</section>`;
  }
}
