(function () {
  'use strict';

  function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>"']/g, character => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[character]);
  }

  function numberedPoints({ title = '', points = [] } = {}) {
    if (!Array.isArray(points)) {
      throw new TypeError('DeckLayouts.numberedPoints: points must be an array');
    }

    const articles = points.map((point, index) => {
      const item = point ?? {};
      const body = item.body == null || item.body === ''
        ? ''
        : `<p data-deck-type="small-subtitle">${escapeHTML(item.body)}</p>`;

      return `<article class="deck-numbered-point"><span class="deck-numbered-number" data-deck-type="point-numbers">${index + 1}</span><div class="deck-numbered-copy"><h3 data-deck-type="point-title">${escapeHTML(item.title)}</h3>${body}</div></article>`;
    }).join('');

    const heading = escapeHTML(title).replace(/\r\n?|\n/g, '<br>');
    return `<section class="deck-numbered-title"><h2 data-deck-type="h3">${heading}</h2></section><section class="deck-numbered-points" aria-label="Numbered points">${articles}</section>`;
  }

  window.DeckLayouts = Object.assign(window.DeckLayouts || {}, { numberedPoints });
})();
