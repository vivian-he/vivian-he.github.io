(() => {
  if (customElements.get('meal-home-cover')) return;
  const base = '/review/portfolio-previews/affordable-meals/home-cover/';
  class MealHomeCover extends HTMLElement {
    connectedCallback() {
      if (this.shadowRoot) return;
      if (!document.querySelector('link[href$="/deck-template/device-surface.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/deck-template/device-surface.css';
        document.head.append(link);
      }
      const shadow = this.attachShadow({mode: 'open'});
      shadow.innerHTML = `
        <link rel="stylesheet" href="/deck-template/device-surface.css">
        <link rel="stylesheet" href="${base}component.css?v=chrome72">
        <figure class="cover" aria-label="DoorDash Home with the $12 full size meals carousel">
          <div class="phone deck-device-surface">
            <div class="screen"><iframe title="DoorDash Home, $12 full size meals carousel" src="${base}native-embed.html" loading="eager"></iframe></div>
          </div>
        </figure>`;
      const phone = shadow.querySelector('.phone');
      const frame = shadow.querySelector('iframe');
      frame.style.opacity='0';
      const ready=()=>{let tries=0;const timer=setInterval(()=>{if(frame.contentDocument?.documentElement.dataset.ready==='true'){frame.style.opacity='1';clearInterval(timer)}else if(++tries>180)clearInterval(timer)},100)};
      frame.addEventListener('load',ready);ready();
      this._resize = new ResizeObserver(() => {
        const screen = shadow.querySelector('.screen');
        frame.style.transform = `scale(${screen.clientWidth / 393})`;
      });
      this._resize.observe(phone);
    }
    disconnectedCallback() { this._resize?.disconnect(); }
  }
  customElements.define('meal-home-cover', MealHomeCover);
})();
