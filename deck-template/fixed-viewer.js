/* Shared, fixed-size presentation viewer. The slide document stays mounted. */
(() => {
  const config = window.DeckViewerConfig || {};
  const $ = selector => document.querySelector(selector);

  function init() {
    const frame = $('#deck-content');
    const wrap = $('#deck-frame-wrap');
    const workspace = $('#workspace');
    const outline = $('#outline');
    const nav = outline?.querySelector('nav');
    const toggle = $('#toggle');
    const previous = $('#prev');
    const next = $('#next');
    const autoplay = $('#deck-autoplay-toggle');
    if (!frame || !wrap || !workspace || !nav || !config.deckId) return;

    document.body.classList.add('deck-fixed-viewer', 'presentation-mode');
    document.body.dataset.deckId = config.deckId;
    window.DeckTemplate?.mountShell({deckId:config.deckId});
    if(config.hideBack)document.querySelector('.presentation-back')?.remove();

    let slides = [];
    let current = 0;
    let loaded = false;
    let updateFrame = 0;

    function fit() {
      const edge = matchMedia('(max-width: 760px)').matches ? 12 : 32;
      const width = Math.max(0, workspace.clientWidth - edge * 2);
      const height = Math.max(0, workspace.clientHeight - 72 - 48);
      const scale = Math.min(width / 1200, height / 675);
      wrap.style.setProperty('--deck-scale', String(Math.max(0, scale)));
    }
    function scheduleFit() {
      cancelAnimationFrame(updateFrame);
      updateFrame = requestAnimationFrame(fit);
    }
    new ResizeObserver(scheduleFit).observe(workspace);
    window.addEventListener('resize', scheduleFit);
    new MutationObserver(scheduleFit).observe(document.body, {attributes:true,attributeFilter:['class']});

    function setOutline(open) {
      document.body.classList.toggle('no-outline', !open);
      toggle?.setAttribute('aria-expanded', String(open));
      scheduleFit();
    }
    setOutline(innerWidth > 760);
    toggle?.addEventListener('click', () => setOutline(document.body.classList.contains('no-outline')));

    function indexFromURL() {
      const url = new URL(location.href);
      const byId = slides.findIndex(slide => String(slide.id) === url.searchParams.get('slide'));
      if (byId >= 0) return byId;
      const ordinal = Number.parseInt(url.hash.slice(1), 10);
      return Number.isFinite(ordinal) ? Math.max(0, Math.min(slides.length - 1, ordinal - 1)) : 0;
    }
    function send(message) {
      if (loaded) frame.contentWindow?.postMessage(message, location.origin);
    }
    function update(index, {tellChild = true, updateURL = true} = {}) {
      if (!slides.length) return;
      current = Math.max(0, Math.min(slides.length - 1, index));
      const slide = slides[current];
      window.DeckTemplateConfig.reviewContext=()=>({deck:slide.deck||config.deckId,slide:slide.sourceId||slide.id});
      nav.querySelectorAll('button[data-index]').forEach(button => {
        const active = Number(button.dataset.index) === current;
        button.classList.toggle('active', active);
        button.setAttribute('aria-current', active ? 'step' : 'false');
      });
      previous.disabled = current === 0;
      next.disabled = current === slides.length - 1;
      if (updateURL) {
        const url = new URL(location.href);
        url.searchParams.set('slide', String(slide.id));
        url.hash = String(current + 1);
        history.replaceState(null, '', url);
      }
      if (tellChild) send({type:'deck-canvas-go', slide:slide.id, index:current});
      document.dispatchEvent(new Event('deck-slide-change'));
    }
    function go(index) {
      update(index);
      if (innerWidth <= 760) setOutline(false);
    }
    previous?.addEventListener('click', () => go(current - 1));
    next?.addEventListener('click', () => go(current + 1));
    nav.addEventListener('click', event => {
      const button = event.target.closest('button[data-index]');
      if (button) go(Number(button.dataset.index));
    });
    autoplay?.addEventListener('click', () => send({type:'deck-canvas-autoplay'}));

    document.addEventListener('keydown', event => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey ||
          event.target.closest('input,textarea,select,[contenteditable="true"]')) return;
      // Up and Down are handled by DeckTemplate.mountShell.
      const forward = ['ArrowRight', 'PageDown'].includes(event.key) ||
        (event.key === ' ' && !event.target.closest('button,a'));
      const backward = ['ArrowLeft', 'PageUp'].includes(event.key);
      if (forward || backward || event.key === 'Home' || event.key === 'End') {
        event.preventDefault();
        go(forward ? current + 1 : backward ? current - 1 : event.key === 'Home' ? 0 : slides.length - 1);
      } else if (event.key === 'Escape') setOutline(false);
    });

    window.addEventListener('message', event => {
      if (event.origin !== location.origin || event.source !== frame.contentWindow) return;
      const data = event.data;
      if (data?.type !== 'deck-canvas-state') return;
      loaded = true;
      const byId = slides.findIndex(slide => String(slide.id) === String(data.slide));
      const index = byId >= 0 ? byId : Number.isInteger(data.index) ? data.index : -1;
      if (index >= 0 && index < slides.length) update(index, {tellChild:false});
      if (typeof data.autoplayEnabled === 'boolean' && autoplay) {
        autoplay.setAttribute('aria-pressed', String(data.autoplayEnabled));
        autoplay.textContent = data.autoplayEnabled
          ? window.DeckTemplate?.labels.autoplayOn || 'Turn Prototype Autoplay Off'
          : window.DeckTemplate?.labels.autoplayOff || 'Turn Prototype Autoplay On';
      }
    });
    window.addEventListener('hashchange', () => update(indexFromURL()));
    window.addEventListener('popstate', () => update(indexFromURL()));
    frame.addEventListener('load', () => {
      loaded = true;
      if (slides.length) send({type:'deck-canvas-go',slide:slides[current].id,index:current});
    });

    async function load() {
      try {
        const response = await fetch(config.manifest || '/deck-template/slide-manifest.json');
        if (!response.ok) throw new Error(`Slide list failed to load (${response.status})`);
        const manifest = await response.json();
        slides = config.compose ? window.DeckMasterSlides(manifest) : manifest[config.deckId];
        if (!Array.isArray(slides) || !slides.length) throw new Error('No slides found for this deck');
        nav.innerHTML = window.DeckTemplate.outlineMarkup(slides, 0, {includeHeading:false});
        const count = $('#outline-count');
        if (count) count.textContent = `${slides.length} slides`;
        current = indexFromURL();
        update(current, {tellChild:false});
        const url = new URL(config.content || 'content.html', location.href);
        url.searchParams.set('canvas', '1');
        url.searchParams.set('slide', String(slides[current].id));
        url.hash = String(current + 1);
        frame.src = url.href;
        scheduleFit();
      } catch (error) {
        nav.textContent = error.message;
      }
    }
    scheduleFit();
    load();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();
