const leafUrl = new URL('../../assets/portfolio-home/leaf-v3-dimensional.webp', import.meta.url).href;

class PortfolioLeaf extends HTMLElement {
  connectedCallback() {
    if (this.shadowRoot) return;

    this.setAttribute('aria-hidden', 'true');
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = `
      <style>
        :host {
          --leaf-size: clamp(145px, 12vw, 164px);
          --leaf-rest-top: calc(var(--leaf-size) * -.24);
          --leaf-rest-right: 8%;
          position: absolute;
          inset: 0;
          display: block;
          z-index: 5;
          overflow: visible;
          pointer-events: none;
          contain: layout style;
        }
        .leaf, .shadow {
          position: absolute;
          pointer-events: none;
          will-change: transform, opacity;
        }
        .leaf {
          width: var(--leaf-size);
          height: auto;
          top: var(--leaf-rest-top);
          right: var(--leaf-rest-right);
          opacity: 0;
          transform: translate3d(48px, -210px, 0) rotateZ(12deg) rotateY(-12deg) rotateX(35deg) scale(.9);
          transform-origin: 50% 52%;
          filter: drop-shadow(0 1px 1px rgb(71 62 42 / .08));
        }
        .shadow {
          top: -2px;
          right: calc(var(--leaf-rest-right) + var(--leaf-size) * .18);
          width: calc(var(--leaf-size) * .64);
          height: 6px;
          border-radius: 50%;
          background: rgb(71 68 51 / .20);
          filter: blur(16px);
          opacity: 0;
          transform: scale(2.2);
        }
        :host(.is-falling) .leaf {
          animation: leaf-fall 2s linear both;
        }
        :host(.is-falling) .shadow {
          animation: shadow-settle 2s linear both;
        }
        @keyframes leaf-fall {
          0%   { opacity: 0; transform: translate3d(48px,-210px,0) rotateZ(12deg) rotateY(-12deg) rotateX(35deg) scale(.9); }
          7%   { opacity: 1; }
          20%  { transform: translate3d(25px,-203px,0) rotateZ(-8deg) rotateY(11deg) rotateX(22deg) scale(.93); }
          40%  { transform: translate3d(-17px,-175px,0) rotateZ(9deg) rotateY(-10deg) rotateX(39deg) scale(.95); }
          60%  { transform: translate3d(21px,-128px,0) rotateZ(-7deg) rotateY(9deg) rotateX(18deg) scale(.97); }
          78%  { transform: translate3d(-8px,-65px,0) rotateZ(6deg) rotateY(-7deg) rotateX(26deg) scale(.99); }
          92%  { transform: translate3d(3px,-7px,0) rotateZ(-4deg) rotateY(-5deg) rotateX(12deg) scale(1); animation-timing-function: ease-out; }
          100% { opacity: 1; transform: translate3d(0,0,0) rotateZ(-3deg) rotateY(-4deg) rotateX(10deg) scale(1); }
        }
        @keyframes shadow-settle {
          0%, 60% { opacity: 0; transform: scale(2.2); filter: blur(16px); }
          78% { opacity: .06; transform: scale(1.8); filter: blur(13px); }
          92% { opacity: .17; transform: scale(1.3); filter: blur(8px); }
          100% { opacity: .46; transform: scale(1); filter: blur(3px); }
        }
        @media (max-width: 640px) {
          :host {
            --leaf-size: clamp(125px, 34vw, 145px);
            --leaf-rest-top: calc(var(--leaf-size) * -.24);
            --leaf-rest-right: 5%;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .leaf { opacity: 1; transform: rotateZ(-3deg) rotateY(-4deg) rotateX(10deg); }
          .shadow { opacity: .46; transform: none; filter: blur(3px); }
          :host(.is-falling) .leaf,
          :host(.is-falling) .shadow { animation: none; }
        }
      </style>
      <span class="shadow"></span>
      <img class="leaf" src="${leafUrl}" alt="" decoding="async" draggable="false" />
    `;

    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!('IntersectionObserver' in window)) {
      requestAnimationFrame(() => this.classList.add('is-falling'));
      return;
    }
    this.observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      this.observer.disconnect();
      this.observer = null;
      this.classList.add('is-falling');
    }, { threshold: 0.15 });
    this.observer.observe(this.parentElement || this);
  }

  disconnectedCallback() {
    this.observer?.disconnect();
    this.observer = null;
  }
}

customElements.define('portfolio-leaf', PortfolioLeaf);
