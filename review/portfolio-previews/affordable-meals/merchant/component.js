/* Two current merchant screens, embedded from their preserved local sources. */
(() => {
  if (customElements.get('meal-merchant-story')) return;
  const base = '/review/portfolio-previews/affordable-meals/merchant/';
  const emailUrl = '/assets/project-current/affordable-meals/email/2026-10-23/final-email/index.html';
  // Match the source export's clean Meal Box view; suppress its prototype host controls in the embed.
  const portalUrl = '/review/merchant-portal/prototypes/koji-customer-reviews/insights/?item=ratings-reviews&reviews-brand=doordash&reviews-mealbox=mealbox-only&ia-study=b&ia-layout=table&presentation=clean&reviews-chrome=off&drawer=closed';

  class MealMerchantStory extends HTMLElement {
    connectedCallback() {
      if (this.shadowRoot) return;
      const shadow = this.attachShadow({mode:'open'});
      const styles = document.createElement('link');
      styles.rel = 'stylesheet';
      styles.href = base + 'component.css?v=final71';
      shadow.append(styles);
      const story = document.createElement('div');
      story.className = 'merchant-story';
      story.innerHTML = `
        <article class="merchant-screen" id="email-panel">
          <div class="screen-window"><div class="window-bar"><i></i><i></i><i></i><span>DoorDash for Merchants · $12 Meal Box report</span></div>
            <div class="email-client"><aside class="email-client-chrome" aria-label="Gmail controls"><div class="mail-client-brand"><svg class="gmail-logo" viewBox="0 0 24 18" aria-hidden="true"><path fill="#4285f4" d="M0 3v15h5V7z"/><path fill="#34a853" d="M19 7v11h5V3z"/><path fill="#ea4335" d="M0 3 5 0l7 6 7-6 5 3-12 9z"/><path fill="#c5221f" d="M0 3v4l5 4V0z"/><path fill="#fbbc04" d="M19 0v11l5-4V3z"/></svg><span>Gmail</span></div><div class="tools"><span title="Back to inbox"><svg class="ui-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="m10 5-7 7 7 7M3 12h18"/></svg></span><span title="Archive"><svg class="ui-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16v4H4zM5 9v12h14V9M9 13h6"/></svg></span><span title="Delete"><svg class="ui-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7M14 10v7"/></svg></span><i></i><span title="Mark unread"><svg class="ui-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="1"/><path d="m3 6 9 7 9-7"/></svg></span><span title="Snooze"><svg class="ui-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg></span><span class="more-tools">⋮</span><small>1 of 24</small></div></aside><div class="email-viewport"><div class="email-canvas"><iframe title="Final $12 Meal Box performance email" src="${emailUrl}"></iframe></div></div></div>
          </div>
        </article>
        <article class="merchant-screen" id="portal-panel">
          <div class="screen-window"><div class="window-bar"><i></i><i></i><i></i><span>Merchant Portal · Ratings &amp; reviews</span></div>
            <div class="portal-viewport"><div class="portal-canvas"><iframe title="Reviews v11 merchant portal, Contains Meal Box ratings and reviews" loading="lazy" src="${portalUrl}"></iframe></div></div>
          </div>
        </article>`;
      shadow.append(story);
      const emailFrame = shadow.querySelector('.email-viewport iframe');
      const portalFrame = shadow.querySelector('.portal-viewport iframe');
      const emailViewport = shadow.querySelector('.email-viewport');
      const emailCanvas = shadow.querySelector('.email-canvas');
      const portalViewport = shadow.querySelector('.portal-viewport');
      const portalCanvas = shadow.querySelector('.portal-canvas');
      const portalPanel = shadow.querySelector('#portal-panel');
      const measurePortal = () => {
        const doc = portalFrame.contentDocument;
        if (!doc) return false;
        const cards = Array.from(doc.querySelectorAll('.mxr-ov-review')).filter(card => card.getBoundingClientRect().height > 0);
        if (cards.length < 2) return false;
        const second = cards[1].getBoundingClientRect();
        const sourceCutoff = second.top + (doc.defaultView?.scrollY || 0) + second.height * .52;
        const scale = portalViewport.clientWidth / 1280;
        if (!scale) return false;
        const height = Math.ceil(sourceCutoff * scale);
        if (height > 0) portalViewport.style.setProperty('--portal-body-height', height + 'px');
        return true;
      };
      const size = () => {
        const compactEmail = emailViewport.clientWidth <= 550;
        emailFrame.style.width = (compactEmail ? emailViewport.clientWidth : 680) + 'px';
        const emailScale = compactEmail ? 1 : Math.min(1, emailViewport.clientWidth / 680);
        emailCanvas.style.setProperty('--email-scale', emailScale);
        emailCanvas.style.height = Math.ceil((Number(emailFrame.dataset.sourceHeight) || 3000) * emailScale) + 'px';
        const portalScale = portalViewport.clientWidth / 1280;
        portalCanvas.style.setProperty('--portal-scale', portalScale);
        portalCanvas.style.width = portalViewport.clientWidth + 'px';
        portalFrame.style.height = Math.max(1600, Math.ceil(portalViewport.clientHeight / portalScale)) + 'px';
        portalViewport.scrollLeft = 0;
        measurePortal();
      };
      const prepareEmail = () => {
        const doc = emailFrame.contentDocument;
        if (!doc?.body) return;
        const measure = () => {
          const view = doc.defaultView;
          const contentBottom = Math.max(0, ...Array.from(doc.body.children).map(el => el.getBoundingClientRect().bottom + (view?.scrollY || 0) + (parseFloat(view.getComputedStyle(el).marginBottom) || 0)));
          const height = Math.ceil(contentBottom + (parseFloat(view.getComputedStyle(doc.body).paddingBottom) || 0)) || doc.body.scrollHeight;
          emailFrame.dataset.sourceHeight = height;
          emailFrame.style.height = height + 'px';
          size();
        };
        measure();
        doc.fonts?.ready.then(measure);
        for (const image of doc.images) image.addEventListener('load', measure, {once:true});
        this._emailResize?.disconnect();
        this._emailResize = new ResizeObserver(measure);
        this._emailResize.observe(doc.body);
        doc.addEventListener('click', event => {
          const link = event.target.closest('a[href]');
          if (!link) return;
          if (link.getAttribute('href') === '{{FULL_REPORT_URL}}') {
            event.preventDefault();
            portalPanel.scrollIntoView({behavior:'smooth', block:'start'});
          } else if (new URL(link.href).origin !== location.origin) {
            event.preventDefault();
          }
        }, true);
      };
      emailFrame.addEventListener('load', prepareEmail);
      portalFrame.addEventListener('load', () => {
        size();
        const doc = portalFrame.contentDocument;
        if (!doc?.body) return;
        if (!measurePortal()) {
          this._portalObserver?.disconnect();
          this._portalObserver = new MutationObserver(() => {
            if (measurePortal()) this._portalObserver?.disconnect();
          });
          this._portalObserver.observe(doc.body, {childList:true, subtree:true});
        }
        doc.fonts?.ready.then(measurePortal);
        for (const image of doc.images) image.addEventListener('load', measurePortal, {once:true});
      });
      this._resize = new ResizeObserver(() => {
        if (story.clientWidth !== this._lastStoryWidth) {
          this._lastStoryWidth = story.clientWidth;
          size();
        }
      });
      this._resize.observe(story);
      size();
    }
    disconnectedCallback() { this._resize?.disconnect(); this._emailResize?.disconnect(); this._portalObserver?.disconnect(); }
  }
  customElements.define('meal-merchant-story', MealMerchantStory);
})();
