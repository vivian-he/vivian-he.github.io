const homeFrame = document.getElementById('home-frame');
const goFrame = document.getElementById('go-frame');
const phone = document.querySelector('.phone');
const start = new URLSearchParams(location.search).get('start') === 'go' ? 'go' : 'home';
let active = start;
let resettingHome = false;

function isVisible(frame, layer) {
  const element = frame.contentDocument?.querySelector(`.goe2e-layer--${layer}`);
  return Boolean(element && !element.classList.contains('goe2e-layer--hidden'));
}

function resizeFrames() {
  const scale = phone.clientWidth / 393;
  for (const frame of [homeFrame, goFrame]) {
    frame.style.height = `${phone.clientHeight / scale}px`;
    frame.style.transform = `scale(${scale})`;
  }
}

function show(next, updateHistory = true) {
  if (active === next && homeFrame.hasAttribute('aria-hidden')) return;
  const enteringHub = next === 'go' && active === 'home';
  active = next;
  homeFrame.setAttribute('aria-hidden', String(next !== 'home'));
  goFrame.setAttribute('aria-hidden', String(next !== 'go'));
  for (const link of document.querySelectorAll('[data-start]')) {
    if (link.dataset.start === next) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
  if (enteringHub) enterHub();
  if (updateHistory) history.replaceState(null, '', `?start=${next}`);
  if (next === 'home' && isVisible(homeFrame, 'go')) {
    resettingHome = true;
    homeFrame.src = './home-dist/';
  }
}

function enterHub() {
  const doc = goFrame.contentDocument;
  if (!doc?.querySelector('.pedregal-snap-sheet')) {
    goFrame.addEventListener('load', enterHub, {once:true});
    return;
  }
  doc.querySelector('.oct-entry-skeleton')?.remove();
  const skeleton=doc.createElement('div');
  skeleton.className='oct-entry-skeleton';
  skeleton.setAttribute('aria-hidden','true');
  skeleton.innerHTML='<div class="oct-entry-map"></div><div class="oct-entry-sheet"><i></i><b></b><span></span><div class="oct-entry-chips"></div><div class="oct-entry-cards"></div></div>';
  doc.querySelector('.go-page')?.append(skeleton);
  doc.documentElement.classList.add('oct-hub-loading');
  setTimeout(() => {
    if(active !== 'go') {doc.documentElement.classList.remove('oct-hub-loading');skeleton.remove();return;}
    doc.documentElement.classList.remove('oct-hub-loading');
    doc.documentElement.classList.add('oct-hub-map-ready');
    skeleton.classList.add('oct-entry-map-visible');
    setTimeout(() => {
      doc.documentElement.classList.remove('oct-hub-map-ready');
      skeleton.remove();
      if(active === 'go') goFrame.contentWindow.dispatchEvent(new Event('oct-hub-enter'));
    }, 240);
  }, 220);
}

function installRewardsSheetDrag(doc) {
  const threshold = 8;
  const excluded = 'button, input, textarea, select, option, a, [contenteditable="true"]';
  let drag = null;
  let suppressedContent = null;

  doc.addEventListener('mousedown', event => {
    if (event.button !== 0 || event.target.closest(excluded)) return;
    const content = event.target.closest('.pedregal-snap-sheet__content');
    if (!content || content.closest('.pedregal-snap-sheet')?.dataset.snap !== 'open') return;
    drag = {content, startX: event.clientX, startY: event.clientY, lastY: event.clientY, active: false};
  }, true);

  doc.addEventListener('mousemove', event => {
    if (!drag) return;
    const distanceX = Math.abs(event.clientX - drag.startX);
    const distanceY = Math.abs(event.clientY - drag.startY);
    if (!drag.active) {
      if (Math.max(distanceX, distanceY) < threshold) return;
      if (distanceX >= distanceY) {
        drag = null; // Leave horizontal carousel drags to their existing handler.
        return;
      }
      drag.active = true;
      drag.content.classList.add('oct-rewards-dragging');
    }
    event.preventDefault();
    event.stopPropagation(); // Keep carousel mousemove handlers from taking a vertical drag.
    drag.content.scrollTop -= event.clientY - drag.lastY;
    drag.lastY = event.clientY;
  }, true);

  doc.addEventListener('mouseup', () => {
    if (!drag) return;
    drag.content.classList.remove('oct-rewards-dragging');
    if (drag.active) {
      suppressedContent = drag.content;
      doc.defaultView.setTimeout(() => { suppressedContent = null; }, 400);
    }
    drag = null;
  }, true);

  doc.addEventListener('click', event => {
    if (!suppressedContent?.contains(event.target)) return;
    suppressedContent = null;
    event.preventDefault();
    event.stopImmediatePropagation();
  }, true);

  doc.defaultView.addEventListener('blur', () => {
    drag?.content.classList.remove('oct-rewards-dragging');
    drag = null;
  });
}

function monitor(frame, check) {
  const onLoad = () => {
    const doc = frame.contentDocument;
    if (!doc?.body || doc.documentElement.dataset.goBaseOctMonitorWired) return;
    doc.documentElement.dataset.goBaseOctMonitorWired = 'true';
    const style = doc.createElement('style');
    style.textContent = 'body{padding:0!important;margin:0!important}.go-phone-chrome{padding:0!important;background:transparent!important;width:100%!important;height:100%!important;margin:0!important;border:0!important;border-radius:0!important;box-shadow:none!important}';
    if (frame === goFrame) {
      style.textContent += `
        .go-page .go-carousel-module:has(.go-popular-card) { padding-bottom: 32px !important; }
        .pedregal-snap-sheet[data-snap="open"] .pedregal-snap-sheet__content { cursor: grab; }
        .pedregal-snap-sheet__content.oct-rewards-dragging {
          cursor: grabbing; user-select: none; -webkit-user-select: none;
        }
      `;
      installRewardsSheetDrag(doc);
      window.installOctRewardsDashboard?.(doc);
    }
    doc.head.append(style);
    if (frame === homeFrame) resettingHome = false;
    frame.contentWindow.addEventListener('go-state-change', check);
    new MutationObserver(check).observe(doc.body, {subtree:true,attributes:true,attributeFilter:['class']});
    check();
  };
  frame.addEventListener('load', onLoad);
  // A cached iframe can finish before this parent script registers its load listener.
  if (frame.contentDocument?.URL !== 'about:blank' && frame.contentDocument?.readyState === 'complete') onLoad();
}

monitor(homeFrame, () => {
  if (active === 'home' && !resettingHome && isVisible(homeFrame, 'go')) show('go');
});
monitor(goFrame, () => {
  const doc = goFrame.contentDocument;
  if (!doc || doc.documentElement.dataset.goBaseOctBackWired) return;
  doc.documentElement.dataset.goBaseOctBackWired = 'true';
  doc.addEventListener('click', event => {
    if (!event.target.closest?.('button[aria-label="Go back"]')) return;
    event.preventDefault();
    event.stopPropagation();
    show('home');
  }, true);
});

for (const link of document.querySelectorAll('[data-start]')) {
  link.addEventListener('click', event => {
    event.preventDefault();
    show(link.dataset.start);
  });
}
new ResizeObserver(resizeFrames).observe(phone);
show(start, false);
