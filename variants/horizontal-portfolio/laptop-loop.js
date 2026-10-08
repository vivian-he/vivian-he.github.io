// Cycles the existing merchant work inside the horizontal portfolio's laptop.
// The portal screenshot is an authentic capture of the local V11 prototype;
// its live bootstrap and stylesheet are currently absent from this checkout.
const VIEWS = [
  {
    src: '../../review/merchant-report/?autoplay=email',
    title: 'Merchant performance email preview',
  },
  {
    src: '../../meal-box-local/',
    title: 'Meal Box merchant signup page preview',
  },
  {
    screenshot: new URL('../../review/merchant-report/portal-clean-proof.jpg', import.meta.url).href,
    title: 'Merchant ratings and reviews portal preview',
  },
];

const DWELL_MS = 8000;

export function setupLaptopLoop(frame) {
  if (!(frame instanceof HTMLIFrameElement)) {
    throw new TypeError('setupLaptopLoop requires an iframe');
  }

  let playing = false;
  let index = 0;
  let timer = null;
  let pendingLoad = null;
  let generation = 0;
  let loadedIndex = -1;

  function clearPending() {
    clearTimeout(timer);
    timer = null;
    if (pendingLoad) frame.removeEventListener('load', pendingLoad);
    pendingLoad = null;
  }

  function stopEmbeddedMotion() {
    try {
      frame.contentWindow?.merchantReport?.stop();
    } catch {
      // The image and any future external view have no same-origin API.
    }
  }

  function scheduleNext(run) {
    if (!playing || run !== generation) return;
    timer = setTimeout(() => {
      if (!playing || run !== generation) return;
      index = (index + 1) % VIEWS.length;
      show(index);
    }, DWELL_MS);
  }

  function show(nextIndex) {
    clearPending();
    stopEmbeddedMotion();
    const run = ++generation;
    const view = VIEWS[nextIndex];
    loadedIndex = -1;
    frame.title = view.title;
    pendingLoad = () => {
      frame.removeEventListener('load', pendingLoad);
      pendingLoad = null;
      loadedIndex = nextIndex;
      scheduleNext(run);
    };
    frame.addEventListener('load', pendingLoad, { once: true });
    if (view.screenshot) {
      frame.srcdoc = `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{width:100%;height:100%;margin:0;background:#fff}img{display:block;width:100%;height:100%;object-fit:contain}</style></head><body><img src="${view.screenshot}" alt="Merchant ratings and reviews portal"></body></html>`;
    } else {
      frame.src = view.src;
      frame.removeAttribute('srcdoc');
    }
  }

  function play() {
    if (playing) return;
    playing = true;
    if (loadedIndex === index) {
      scheduleNext(generation);
    } else {
      show(index);
    }
  }

  function pause() {
    if (!playing) return;
    playing = false;
    generation++;
    clearPending();
    stopEmbeddedMotion();
  }

  return { play, pause };
}
