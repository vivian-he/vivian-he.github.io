(() => {
  if (new URLSearchParams(location.search).get('feedback') !== '1'&&!window.DeckTemplateConfig?.feedbackDefault) return;

  const config = window.DeckTemplateConfig || {};
  const deck = config.deckId || document.body?.dataset.deckId;
  if (!deck) return;
  const storagePrefix = ({'affordable-meals':'affordable','in-store-rewards':'rewards'})[deck] || deck;
  const storageKey = suffix => `${storagePrefix}-review-${suffix}`;
  const endpoint = '/api/review-comments';
  const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const reviewDeck=()=>config.reviewContext?.().deck||deck;
  const reviewKey=()=>reviewDeck()+':'+slideId();
  const slideId = () => config.reviewContext?.().slide||new URL(location.href).searchParams.get('slide') || (deck === 'in-store-rewards' ? '1' : window.SLIDES?.[0]?.id || 'slide-1');
  const slideTitle = () => (typeof config.slideTitle === 'function' ? config.slideTitle() : null) || document.querySelector('#outline button.active span:last-child')?.textContent || document.querySelector('#slide h1')?.textContent || document.querySelector('#slide .headline')?.textContent || 'Current slide';
  let activeSlide = '';
  let loadSequence = 0;
  let ownerKey = sessionStorage.getItem(storageKey('owner-key')) || '';
  let pendingResolve = null;

  function init() {
    document.body.dataset.deckId = deck;
    document.body.classList.add('feedback-mode');
    const launch = document.createElement('button');
    launch.type = 'button';
    launch.className = 'feedback-launch';
    launch.textContent = 'Open comments';
    launch.setAttribute('aria-controls', 'feedback-panel');
    launch.setAttribute('aria-expanded', 'true');
    document.body.append(launch);

    const panel = document.createElement('aside');
    panel.id = 'feedback-panel';
    panel.className = 'feedback-panel';
    panel.setAttribute('aria-label', 'Slide comments');
    panel.innerHTML = `
      <header class="feedback-head"><div><span class="feedback-eyebrow">FEEDBACK VERSION</span><h2>Comments</h2></div><button class="feedback-close" type="button" aria-label="Close comments">×</button></header>
      <p class="feedback-slide"></p>
      <div class="feedback-list" aria-live="polite"></div>
      <form class="feedback-owner" hidden><label for="feedback-owner-key">Vivian’s owner key</label><input id="feedback-owner-key" type="password" autocomplete="off" required minlength="16"><button type="submit">Unlock resolution</button></form>
      <form class="feedback-form"><label for="feedback-name">Your name (optional)</label><input id="feedback-name" name="author" autocomplete="name" maxlength="80"><label for="feedback-body">Comment on this slide</label><textarea id="feedback-body" name="body" rows="4" maxlength="2000" required placeholder="What should Vivian revisit?"></textarea><button type="submit">Post comment</button><p class="feedback-message" role="status"></p></form>
      <p class="feedback-foot">Comments stay with this slide after refresh. Only Vivian can resolve them.</p>`;
    document.body.append(panel);

    const toggle = open => {
      document.body.classList.toggle('feedback-closed', !open);
      launch.setAttribute('aria-expanded', String(open));
      if (open) refresh();
    };
    launch.onclick = () => toggle(document.body.classList.contains('feedback-closed'));
    panel.querySelector('.feedback-close').onclick = () => toggle(false);
    if (matchMedia('(max-width: 760px)').matches) toggle(false);

    const nameInput = panel.querySelector('#feedback-name');
    nameInput.value = localStorage.getItem(storageKey('name')) || '';
    nameInput.addEventListener('change', () => localStorage.setItem(storageKey('name'), nameInput.value.trim()));
    panel.querySelector('.feedback-form').addEventListener('submit', async event => {
      event.preventDefault();
      const form = event.currentTarget;
      const message = panel.querySelector('.feedback-message');
      const author = nameInput.value.trim();
      const body = form.elements.body.value.trim();
      if (!body) return;
      form.querySelector('button[type="submit"]').disabled = true;
      message.textContent = 'Posting…';
      try {
        const result = await request(endpoint, {method:'POST', body:JSON.stringify({deck:reviewDeck(), slide:slideId(), author:author || 'Anonymous', body})});
        if (!result.comment) throw new Error('Comment was not saved.');
        localStorage.setItem(storageKey('name'), author);
        form.elements.body.value = '';
        message.textContent = 'Comment saved.';
        await refresh(true);
      } catch (error) {
        message.textContent = error.message;
      } finally {
        form.querySelector('button[type="submit"]').disabled = false;
      }
    });
    const resolveButton = async button => {
      if (!button) return;
      if (!ownerKey && !config.hostedReview) {
        pendingResolve = button;
        panel.querySelector('.feedback-owner').hidden = false;
        panel.querySelector('#feedback-owner-key').focus();
        return;
      }
      button.disabled = true;
      try {
        await request(`${endpoint}/${encodeURIComponent(button.dataset.resolve)}/resolve`, {
          method:'POST',
          headers:{'X-Review-Owner-Key':ownerKey},
          body:JSON.stringify({resolved:button.dataset.state !== 'resolved'})
        });
        await refresh(true);
      } catch (error) {
        if (/owner|unauthorized|forbidden|key/i.test(error.message)) {
          ownerKey = '';
          sessionStorage.removeItem(storageKey('owner-key'));
        }
        panel.querySelector('.feedback-message').textContent = error.message;
        button.disabled = false;
      }
    };
    panel.querySelector('.feedback-list').addEventListener('click', event => {
      resolveButton(event.target.closest('button[data-resolve]'));
    });
    panel.querySelector('.feedback-owner').addEventListener('submit', event => {
      event.preventDefault();
      const form = event.currentTarget;
      ownerKey = form.querySelector('input').value.trim();
      sessionStorage.setItem(storageKey('owner-key'), ownerKey);
      form.querySelector('input').value = '';
      form.hidden = true;
      resolveButton(pendingResolve);
      pendingResolve = null;
    });
    const watch = new MutationObserver(() => {
      panel.querySelector('.feedback-slide').textContent=slideTitle();
      if (reviewKey() !== activeSlide) refresh();
    });
    const watched=document.querySelector('#slide')||document.querySelector('#outline');
    if(watched)watch.observe(watched,{childList:true,subtree:true,attributes:true,attributeFilter:['class','aria-current']});
    document.addEventListener('deck-slide-change',()=>{panel.querySelector('.feedback-slide').textContent=slideTitle();refresh();});
    window.addEventListener('hashchange', refresh);
    window.addEventListener('popstate', refresh);
    refresh();
  }

  async function request(url, options = {}) {
    const response = await fetch(url, {...options, headers:{'Content-Type':'application/json', ...options.headers}});
    let data;
    try { data = await response.json(); } catch { throw new Error('Comment server is unavailable. Open the local review-server link.'); }
    if (!response.ok) throw new Error(data.error || `Comment request failed (${response.status}).`);
    return data;
  }

  async function refresh(force = false) {
    const panel = document.querySelector('#feedback-panel');
    if (!panel) return;
    const id = slideId();
    if (!force && reviewKey() === activeSlide) return;
    activeSlide = reviewKey();
    const sequence = ++loadSequence;
    panel.querySelector('.feedback-slide').textContent = slideTitle();
    const list = panel.querySelector('.feedback-list');
    list.innerHTML = '<p class="feedback-empty">Loading comments…</p>';
    try {
      const result = await request(`${endpoint}?deck=${encodeURIComponent(reviewDeck())}&slide=${encodeURIComponent(id)}`);
      if (sequence !== loadSequence) return;
      const comments = result.comments || [];
      list.innerHTML = comments.length ? comments.map(comment => {
        const resolved = comment.status === 'resolved' || comment.resolved === true;
        const date = new Date(comment.createdAt || comment.created_at || Date.now()).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'});
        return `<article class="feedback-comment${resolved?' is-resolved':''}"><div class="feedback-comment-meta"><strong>${escapeHTML(comment.author)}</strong><time>${escapeHTML(date)}</time></div><p>${escapeHTML(comment.body)}</p><div class="feedback-comment-actions"><span>${resolved?'Resolved':'Open'}</span><button type="button" data-resolve="${escapeHTML(comment.id)}" data-state="${resolved?'resolved':'open'}">${resolved?'Reopen':'Resolve'}</button></div></article>`;
      }).join('') : '<p class="feedback-empty">No comments on this slide yet.</p>';
    } catch (error) {
      if (sequence !== loadSequence) return;
      list.innerHTML = `<p class="feedback-error">${escapeHTML(error.message)}</p>`;
    }
  }

  if(document.readyState!=='loading')init();
  else document.addEventListener('DOMContentLoaded',init,{once:true});
})();
