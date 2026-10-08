/* Presentation chrome for the working deck. ?mode=review restores the editing view. */
(() => {
  if (new URLSearchParams(location.search).get('mode') === 'review') return;

  function init() {
    const slide = document.querySelector('#slide');
    const outlineToggle = document.querySelector('#toggle');
    const autoplay = document.querySelector('#deck-autoplay-controls');
    const previous = document.querySelector('#prev');
    const next = document.querySelector('#next');
    if (!slide || !outlineToggle || !autoplay || !previous || !next) return;

    document.body.classList.add('presentation-mode', 'no-outline');
    const back=document.createElement('a');
    back.className='presentation-back';
    back.href='/variants/horizontal-portfolio/';
    back.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5m7-7-7 7 7 7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Back to portfolio</span>';
    document.body.append(back);

    const tools = document.createElement('div');
    tools.className = 'presentation-tools';
    tools.setAttribute('aria-label', 'Presentation controls');
    tools.append(outlineToggle, autoplay);
    document.body.append(tools);

    const replay = autoplay.querySelector('#deck-autoplay-replay');
    const status = autoplay.querySelector('#deck-autoplay-status');
    replay.classList.add('contextual-replay');
    replay.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5 3 10l6 5M4 10h9a6 6 0 1 1 0 12" transform="translate(0 -2)" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Replay prototype</span>';
    document.body.append(replay);
    let replaySlide='';
    const syncReplay = () => {
      const slideKey=new URL(location.href).searchParams.get('slide');
      const complete=status?.textContent.includes('Demo complete');
      replay.hidden=!complete || (replaySlide && replaySlide!==slideKey);
      if(!complete){replaySlide='';return;}
      if(replay.hidden)return;
      replaySlide=slideKey;
      const walk=document.querySelector('#consumer-walk:not([hidden])');
      const anchor=walk?.querySelector('.walk-heading h2') || slide.querySelector('.unified-expanded,.ops-detail-copy,.copy,.hub-heading');
      const fallback=walk?.querySelector('.walk-phone') || slide.querySelector('iframe');
      let rect=(anchor || fallback)?.getBoundingClientRect();
      if(walk && anchor){const range=document.createRange();range.selectNodeContents(anchor);rect=range.getBoundingClientRect();}
      if(!walk && rect && slide.querySelector('.unified-timeline'))rect={left:rect.left,width:rect.width,bottom:slide.querySelector('.unified-timeline').getBoundingClientRect().bottom};
      if(!rect){replay.hidden=true;return;}
      const width=replay.offsetWidth;
      const left=walk && innerWidth<=760 ? (innerWidth-width)/2 : rect.left;
      replay.style.left=Math.max(12,Math.min(innerWidth-width-12,left))+'px';
      replay.style.top=Math.min(innerHeight-replay.offsetHeight-12,rect.bottom+22)+'px';
    };
    syncReplay();
    if(status)new MutationObserver(syncReplay).observe(status, {childList:true,subtree:true,characterData:true});
    new MutationObserver(syncReplay).observe(document.querySelector('#workspace'),{childList:true,subtree:true});
    window.addEventListener('resize',syncReplay);
    window.addEventListener('scroll',syncReplay,{passive:true});
    new ResizeObserver(syncReplay).observe(document.querySelector('#workspace'));

    const navigation = document.createElement('nav');
    navigation.className = 'presentation-navigation';
    navigation.setAttribute('aria-label', 'Slide navigation');
    previous.setAttribute('aria-label', 'Previous slide');
    next.setAttribute('aria-label', 'Next slide');
    // Reuse the product icon paths from the local Prism/Picnic icon set.
    const arrow = path => `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="${path}"/></svg>`;
    previous.innerHTML = arrow('M9.789 3.793a1 1 0 1 1 1.414 1.414L5.41 11h15.586a1 1 0 0 1 0 2H5.41l5.793 5.793a1 1 0 0 1-1.414 1.414l-6.793-6.793a2 2 0 0 1 0-2.828z');
    next.innerHTML = arrow('M12.793 3.793a1 1 0 0 1 1.414 0L21 10.586a2 2 0 0 1 0 2.828l-6.793 6.793a1 1 0 1 1-1.414-1.414L18.586 13H3a1 1 0 1 1 0-2h15.586l-5.793-5.793a1 1 0 0 1 0-1.414');
    navigation.append(previous, next);
    document.body.append(navigation);
    document.addEventListener('keydown',event=>{
      if(!['ArrowLeft','ArrowRight','PageUp','PageDown','Home','End',' '].includes(event.key)||event.target.closest('input,textarea,select,[contenteditable="true"]'))return;
      if(navigation.contains(document.activeElement))document.activeElement.blur();
      document.body.classList.add('keyboard-navigation');
    },true);
    document.addEventListener('pointermove',()=>document.body.classList.remove('keyboard-navigation'),{passive:true});

    const syncOutline = () => outlineToggle.setAttribute('aria-expanded', String(!document.body.classList.contains('no-outline')));
    outlineToggle.setAttribute('aria-controls', 'outline');
    syncOutline();
    new MutationObserver(syncOutline).observe(document.body, {attributes:true, attributeFilter:['class']});

    const syncSurface = () => {
      document.body.dataset.presentationSurface = slide.matches('.mealbox-divider,.experience-divider,.mp-consumer-divider,.mp-merchant-divider') ? 'salmon' : 'paper';
    };
    syncSurface();
    new MutationObserver(syncSurface).observe(slide, {attributes:true, attributeFilter:['class']});
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();
