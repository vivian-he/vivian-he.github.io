const base = new URL('./', import.meta.url);
const css = new URL('./component.css', base);
css.search = 'v=final71';
const reviewFlow = new URL('../../../beyond-delivery/story-v2/after-embed.html?flow=review&loop=1', base);
const forYouFlow = new URL('../../../beyond-delivery/story-v2/after-embed.html?flow=for-you&loop=1', base);
const sourceMedia = new URL('../../../beyond-delivery/story-v2/assets/slide-25-figma/', base);

function addStyles() {
  if (document.querySelector('link[data-rewards-future]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = css.href;
  link.dataset.rewardsFuture = '';
  document.head.append(link);
}

const escapeHTML = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');

class RewardsRelevanceStory extends HTMLElement {
  connectedCallback() {
    if (this.mounted) return;
    this.mounted = true;
    addStyles();
    this.classList.add('rewards-future', 'rewards-future--relevance');
    const feedbackURL=new URL(reviewFlow);if(this.getAttribute('review-start')==='notification')feedbackURL.searchParams.set('start','notification');
    const items = [
      { label: 'Feedback collection', url: feedbackURL },
      { label: 'Personalized suggestions', url: forYouFlow }
    ];
    this.innerHTML = `<div class="rewards-future__grid rewards-future__grid--pair">${items.map(item => `
      <figure class="rewards-future__figure">
        <div class="rewards-future__phone deck-device-surface">
          <div class="rewards-future__screen"><iframe title="${escapeHTML(item.label)} original interactive prototype" data-src="${item.url.href}" loading="lazy" allow="autoplay"></iframe></div>
          <span class="rewards-future__island" aria-hidden="true"></span>
        </div>
        <figcaption><strong>${item.label}</strong></figcaption>
      </figure>`).join('')}</div>`;
    this.frames = [...this.querySelectorAll('iframe')];
    this.visible = new Set();
    this.manualPaused = new WeakSet();
    this.observer = new IntersectionObserver(entries => entries.forEach(entry => {
      const frame = entry.target;
      if (entry.isIntersecting) {
        this.visible.add(frame);
        if (!frame.src) frame.src = frame.dataset.src;
        else if (frame.dataset.ready === 'true' && !document.hidden && !this.manualPaused.has(frame)) this.message(frame, 'play');
      } else {
        this.visible.delete(frame);
        this.manualPaused.delete(frame);
        this.message(frame, 'pause');
      }
    }), { threshold: .35 });
    this.frames.forEach(frame => {
      this.observer.observe(frame);
      frame.addEventListener('load', () => { frame.dataset.ready = ''; this.fit(frame); });
    });
    this.resizer = new ResizeObserver(() => this.frames.forEach(frame => this.fit(frame)));
    this.resizer.observe(this);
    this.onMessage = event => {
      if (event.origin !== location.origin) return;
      const frame = this.frames.find(item => item.contentWindow === event.source);
      if (!frame) return;
      if (event.data?.type === 'deck-autoplay-ready') {
        frame.dataset.ready = 'true';
        if (this.visible.has(frame) && !document.hidden && !this.manualPaused.has(frame)) this.message(frame, 'play');
      }
      if (event.data?.type === 'deck-autoplay-status' && /^Paused · explore freely/i.test(event.data.status || '')) this.manualPaused.add(frame);
    };
    window.addEventListener('message', this.onMessage);
    this.onVisibility = () => this.frames.forEach(frame => {
      if (document.hidden) this.message(frame, 'pause');
      else if (this.visible.has(frame) && frame.dataset.ready === 'true' && !this.manualPaused.has(frame)) this.message(frame, 'play');
    });
    document.addEventListener('visibilitychange', this.onVisibility);
  }
  fit(frame) {
    const viewport = frame.parentElement;
    if (viewport) frame.style.transform = `scale(${viewport.clientWidth / 393})`;
  }
  message(frame, action) { if (frame?.src) frame.contentWindow?.postMessage({ type: 'deck-autoplay', action }, location.origin); }
  disconnectedCallback() {
    this.observer?.disconnect();
    this.resizer?.disconnect();
    document.removeEventListener('visibilitychange', this.onVisibility);
    window.removeEventListener('message', this.onMessage);
    this.frames?.forEach(frame => this.message(frame, 'pause'));
  }
}

const concepts = [
  { label: 'Contextual maps', path: '44-435/model-a-contextual-maps.mp4', poster: '44-435/poster.jpg' },
  { label: 'Map / list toggle', path: '44-453/model-b-map-list-toggle.mp4', poster: '44-453/poster.jpg' },
  { label: 'Visually Browse', path: '44-513/matcha-map.mp4', poster: '44-513/poster.jpg' },
  { label: 'On Route', path: '44-559/en-route.mp4', poster: '44-559/poster.jpg' }
];

class RewardsMapExplorations extends HTMLElement {
  connectedCallback() {
    if (this.mounted) return;
    this.mounted = true;
    addStyles();
    this.classList.add('rewards-future', 'rewards-future--maps');
    this.innerHTML = `<div class="rewards-future__grid rewards-future__grid--maps">${concepts.map(item => `
      <figure class="rewards-future__figure">
        <div class="rewards-future__video-phone deck-device-surface">
          <video muted loop playsinline preload="none" poster="${new URL(item.poster, sourceMedia).href}" data-src="${new URL(item.path, sourceMedia).href}" aria-label="${escapeHTML(item.label)} concept animation"></video>
        </div>
        <figcaption><strong>${item.label}</strong></figcaption>
      </figure>`).join('')}</div>`;
    this.videos = [...this.querySelectorAll('video')];
    this.visible = new Set();
    this.observer = new IntersectionObserver(entries => entries.forEach(entry => {
      const video = entry.target;
      if (entry.isIntersecting) {
        this.visible.add(video);
        if (!video.src) video.src = video.dataset.src;
        if (!document.hidden) video.play().catch(() => {});
      } else {
        this.visible.delete(video);
        video.pause();
      }
    }), { threshold: .35 });
    this.videos.forEach(video => {
      this.observer.observe(video);
      video.addEventListener('loadeddata', () => {
        if (this.visible.has(video) && !document.hidden) video.play().catch(() => {});
      });
    });
    this.onVisibility = () => this.videos.forEach(video => {
      if (document.hidden) video.pause();
      else if (this.visible.has(video)) video.play().catch(() => {});
    });
    document.addEventListener('visibilitychange', this.onVisibility);
  }
  disconnectedCallback() {
    this.observer?.disconnect();
    document.removeEventListener('visibilitychange', this.onVisibility);
    this.videos?.forEach(video => video.pause());
  }
}

if (!customElements.get('rewards-relevance-story')) customElements.define('rewards-relevance-story', RewardsRelevanceStory);
if (!customElements.get('rewards-map-explorations')) customElements.define('rewards-map-explorations', RewardsMapExplorations);
