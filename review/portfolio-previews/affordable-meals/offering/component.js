class MealOfferingArt extends HTMLElement {
  connectedCallback() {
    if (this.shadowRoot) return;

    const root = this.attachShadow({ mode: 'open' });
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = '/review/portfolio-previews/affordable-meals/offering/component.css?v=final71';
    root.append(stylesheet);

    const bowls = [
      { file: 'bowl-2.png', viewBox: '1251 659 1931 2102', width: 3162, height: 2988, label: 'Saucy meal bowl with rice' },
      { file: 'bowl-1.png', viewBox: '816 804 1999 2190', width: 3661, height: 2988, label: 'Colorful rice bowl with vegetables and egg' },
      { file: 'bowl-3.png', viewBox: '172 9 1999 2162', width: 2446, height: 2446, label: 'Pasta bowl with broccoli' }
    ];
    const stage = document.createElement('div');
    stage.className = 'bowls';
    for (const [index, bowl] of bowls.entries()) {
      const figure = document.createElement('figure');
      figure.className = `bowl bowl-${index}`;
      figure.innerHTML = `<svg viewBox="${bowl.viewBox}" role="img" aria-label="${bowl.label}"><image href="/review/affordable-story/assets/bowls/${bowl.file}" width="${bowl.width}" height="${bowl.height}" /></svg>`;
      stage.append(figure);
    }
    root.append(stage);
  }
}

if (!customElements.get('meal-offering-art')) {
  customElements.define('meal-offering-art', MealOfferingArt);
}
