import '/deck-template/callout.js';

const ROOT = new URL('./', import.meta.url);
const CSS = new URL('./component.css', ROOT);
CSS.search = 'v=final71';
const BEFORE = new URL('../../../../references/rewards-preview-content-2026-10-23/old-dashboard.svg', ROOT);
const AFTER = new URL('../../../beyond-delivery/go-base-oct/dist/prototypes/nate-clinton/going-out/q2/credit-sandbox/?embed=1&view=go&header=isr&au=0&v=spacing-6', ROOT);
const ADAPTER = new URL('../../../beyond-delivery/go-base-oct/rewards-dashboard.js', ROOT);

let adapterPromise;
function loadAdapter() {
  if (window.installOctRewardsDashboard) return Promise.resolve();
  if (!adapterPromise) adapterPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = ADAPTER.href;
    script.onload = resolve;
    script.onerror = reject;
    document.head.append(script);
  });
  return adapterPromise;
}

const callouts = [
  ['Your benefits', '.oct-benefit-eyebrow'],
  ['Browse cuisines', '.go-filter-row'],
  ['Big rewards first', '.go-deals .go-deal-card:first-child'],
  ['Familiar names', '.latest-national h2'],
  ['Recognize stores', '.go-benefits-card .go-lunch-name'],
  ['Claim clearly', '.go-benefits-card:nth-child(2) .go-lunch-claim-btn'],
  ['Highlight credits', '.go-benefits-card:nth-child(3) .go-lunch-promo-tag']
];

class RewardsDashboardComparison extends HTMLElement {
  connectedCallback() {
    if (this.shadowRoot) return;
    const root = this.attachShadow({ mode: 'open' });
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = CSS.href;
    root.innerHTML = `
      <div class="comparison" aria-label="Before and after rewards dashboard comparison">
        <figure class="screen-example screen-example--before">
          <figcaption>Before</figcaption>
          <div class="screen-surface"><img class="before-image" width="375" height="793" alt="Original in-store rewards dashboard supplied by Vivian"></div>
        </figure>
        <figure class="screen-example screen-example--after">
          <figcaption>After</figcaption>
          <div class="after-anchor deck-callout-anchor">
            <div class="screen-surface after-surface"><iframe title="Final V3 In-Store Rewards dashboard, expanded through three All in-store rewards rows" loading="lazy"></iframe></div>
            <svg class="dashboard-leaders" aria-hidden="true"></svg>
          </div>
        </figure>
      </div>`;
    root.prepend(link);
    root.querySelector('.before-image').src = BEFORE.href;
    this.frame = root.querySelector('iframe');
    this.anchor = root.querySelector('.after-anchor');
    this.surface = root.querySelector('.after-surface');
    this.leaders = root.querySelector('.dashboard-leaders');
    this.frame.addEventListener('load', () => this.prepareFrame());
    this.frame.src = AFTER.href;
    this.resizeObserver = new ResizeObserver(() => this.measure());
    this.resizeObserver.observe(this.surface);
  }

  disconnectedCallback() { this.resizeObserver?.disconnect(); this.mutationObserver?.disconnect(); this.mapVisibilityObserver?.disconnect(); }

  refreshNativeMap() {
    const win = this.frame?.contentWindow;
    if (!win || !this.isConnected) return;
    // MapLibre listens for the window resize event and resizes its WebGL
    // drawing buffer to the adapted, phone-sized map container.
    win.requestAnimationFrame(() => win.requestAnimationFrame(() => win.dispatchEvent(new win.Event('resize'))));
  }

  async prepareFrame() {
    const doc = this.frame.contentDocument;
    if (!doc) return;
    try { await loadAdapter(); } catch { this.setAttribute('data-error', 'adapter'); return; }
    const ready = () => doc.querySelector('.oct-feed-content .go-benefits-card:nth-child(4)');
    if (!ready()) {
      const observer = new MutationObserver(() => {
        if (ready()) { observer.disconnect(); this.prepareFrame(); }
      });
      observer.observe(doc.body, { childList: true, subtree: true });
      return;
    }
    window.installOctRewardsDashboard(doc);
    const page = doc.querySelector('.go-page');
    const sheet = doc.querySelector('.pedregal-snap-sheet');
    if (!page || !sheet) return;
    if (!page.style.getPropertyValue('--rewards-comparison-native-top')) {
      // Preserve the React screen's own resting sheet position above the feed.
      const nativeTop = sheet.getBoundingClientRect().top - page.getBoundingClientRect().top;
      // Keep the phone's opening map visible even if the outer preview iframe
      // is taller than the original phone viewport during first render.
      page.style.setProperty('--rewards-comparison-native-top', `${Math.min(320, Math.max(180, Math.round(nativeTop)))}px`);
    }
    if (!doc.getElementById('rewards-comparison-expanded')) {
      const style = doc.createElement('style');
      style.id = 'rewards-comparison-expanded';
      style.textContent = `
        html, body, #root { width:393px!important; min-width:393px!important; height:auto!important; min-height:0!important; overflow:visible!important; }
        body { padding:0!important; margin:0!important; background:#fff!important; }
        .go-phone-chrome { width:393px!important; height:auto!important; min-height:0!important; margin:0!important; padding:0!important; border:0!important; border-radius:0!important; box-shadow:none!important; background:#fff!important; overflow:visible!important; }
        .goe2e-root, .goe2e-layer--go, .go-frame { position:relative!important; width:393px!important; height:auto!important; min-height:0!important; overflow:visible!important; }
        .go-page { position:relative!important; top:auto!important; left:auto!important; width:393px!important; height:auto!important; min-height:0!important; padding-top:var(--rewards-comparison-native-top)!important; overflow:visible!important; }
        .go-page > .go-map-container { top:0!important; bottom:auto!important; width:393px!important; height:875px!important; }
        .pedregal-snap-sheet { position:relative!important; top:auto!important; left:auto!important; right:auto!important; bottom:auto!important; transform:none!important; width:393px!important; height:auto!important; max-height:none!important; border-radius:0!important; box-shadow:none!important; overflow:visible!important; }
        .pedregal-snap-sheet__content { height:auto!important; max-height:none!important; overflow:visible!important; }
        .go-filter-row { position:relative!important; top:auto!important; }
      `;
      doc.head.append(style);
    }
    this.setAttribute('data-ready', '');
    this.measure();
    this.refreshNativeMap();
    this.mapVisibilityObserver?.disconnect();
    this.mapVisibilityObserver = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) this.refreshNativeMap();
    }, {threshold:0.01});
    this.mapVisibilityObserver.observe(this.surface);
    this.mutationObserver?.disconnect();
    this.mutationObserver = new MutationObserver(() => this.measure());
    this.mutationObserver.observe(doc.querySelector('.oct-feed-content'), {childList:true, subtree:true});
    doc.fonts?.ready.then(() => this.measure());
  }

  measure() {
    if (!this.frame?.contentDocument || !this.hasAttribute('data-ready')) return;
    const doc = this.frame.contentDocument;
    const feed = doc.querySelector('.oct-feed-content');
    const fourth = doc.querySelector('.go-benefits-card:nth-child(4)');
    if (!feed || !fourth) return;
    const screen = doc.querySelector('.go-page')?.getBoundingClientRect();
    if (!screen) return;
    const fullHeight = Math.ceil(fourth.getBoundingClientRect().top - screen.top);
    if (fullHeight < 900) return;
    const width = this.surface.clientWidth;
    const scale = width / 393;
    this.frame.style.height = `${fullHeight}px`;
    this.frame.style.transform = `scale(${scale})`;
    this.surface.style.height = `${Math.round(fullHeight * scale)}px`;
    const positions = callouts.map(([label, selector]) => {
      const target = doc.querySelector(selector);
      if (!target) return {label, target: null};
      const rect = target.getBoundingClientRect();
      return {label, target: {
        x: (rect.left + rect.width / 2 - screen.left) * scale,
        y: (rect.top + rect.height / 2 - screen.top) * scale
      }};
    });
    const nodes = positions.map(({label, target}, index) => {
      let node = this.anchor.querySelector(`[data-callout="${index}"]`);
      if (!node) {
        node = document.createElement('deck-callout');
        node.className = 'dashboard-callout';
        node.dataset.callout = String(index);
        node.setAttribute('side', 'right');
        node.setAttribute('label', label);
        this.anchor.append(node);
      }
      node.hidden = !target;
      return node;
    });
    let previousBottom = -Infinity;
    positions.forEach(({target}, index) => {
      if (!target) return;
      const node = nodes[index];
      const halfHeight = node.getBoundingClientRect().height / 2;
      const labelCenter = target.y;
      node.style.setProperty('--deck-callout-y', `${labelCenter}px`);
      previousBottom = labelCenter + halfHeight;
    });
    const anchorRect = this.anchor.getBoundingClientRect();
    const lines = positions.flatMap(({target}, index) => {
      if (!target) return [];
      const caption = nodes[index].querySelector('.deck-callout-caption');
      const captionRect = caption.getBoundingClientRect();
      const x2 = captionRect.left - anchorRect.left - 5;
      const y2 = captionRect.top + captionRect.height / 2 - anchorRect.top;
      return [{x1:width + 7, y1:target.y, x2, y2:target.y}];
    });
    const leaderWidth = Math.ceil(Math.max(width, ...lines.map(line => line.x2 + 2)));
    this.leaders.setAttribute('width', String(leaderWidth));
    this.leaders.setAttribute('height', String(Math.round(fullHeight * scale)));
    this.leaders.setAttribute('viewBox', `0 0 ${leaderWidth} ${Math.round(fullHeight * scale)}`);
    this.leaders.replaceChildren(...lines.map(({x1,y1,x2,y2}) => {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', String(x1));
      line.setAttribute('y1', String(y1));
      line.setAttribute('x2', String(x2));
      line.setAttribute('y2', String(y2));
      return line;
    }));
  }
}

if (!customElements.get('rewards-dashboard-comparison')) customElements.define('rewards-dashboard-comparison', RewardsDashboardComparison);
