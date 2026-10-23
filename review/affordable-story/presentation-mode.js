/* Presentation chrome for the working deck. ?mode=review restores the editing view. */
(() => {
  if (new URLSearchParams(location.search).get('mode') === 'review') return;

  let initialized=false;
  function init() {
    if(initialized)return;
    const slide = document.querySelector('#slide');
    const outlineToggle = document.querySelector('#toggle');
    const autoplay = document.querySelector('#deck-autoplay-controls');
    const previous = document.querySelector('#prev');
    const next = document.querySelector('#next');
    if (!window.DeckTemplate || !slide || !outlineToggle || !autoplay || !previous || !next) return;

    initialized=true;
    document.body.classList.add('presentation-mode');
    document.body.classList.remove('no-outline');
    const shell=window.DeckTemplate.mountShell({toggle:outlineToggle,autoplay,previous,next,backHref:'/'});
    const status=autoplay.querySelector('#deck-autoplay-status');
    const controls=window.DeckTemplate.playbackControls({replay:autoplay.querySelector('#deck-autoplay-replay'),onStop:()=>window.DeckAutoplay?.stopCurrent()});
    const {replay,playing}=controls;
    document.body.append(replay,playing);
    let replaySlide='';
    const syncReplay = () => {
      const slideKey=new URL(location.href).searchParams.get('slide');
      const complete=/Demo complete|Paused · Replay/.test(status?.textContent||'');
      const isPlaying=/^Playing/.test(status?.textContent||'');
      window.DeckTemplate.playbackState(controls,isPlaying?'playing':complete?'complete':'idle');
      if(replaySlide && replaySlide!==slideKey)replay.hidden=true;
      if(!complete)replaySlide='';
      if(!complete&&!isPlaying)return;
      if(complete&&replay.hidden)return;
      if(complete)replaySlide=slideKey;
      const walk=document.querySelector('#consumer-walk:not([hidden])');
      const qualityVisual=slide.matches('.mp-details') && new URL(location.href).searchParams.get('slide')==='merchant-quality'
        ? slide.querySelector('.unified-visual:has(.quality-photo-wall)') : null;
      const anchor=walk?.querySelector('.walk-heading h2') || slide.querySelector('.unified-expanded,.ops-detail-copy,.copy,.hub-heading');
      const fallback=walk?.querySelector('.walk-phone') || slide.querySelector('iframe');
      let rect=(qualityVisual || anchor || fallback)?.getBoundingClientRect();
      if(walk && anchor){const range=document.createRange();range.selectNodeContents(anchor);rect=range.getBoundingClientRect();}
      if(!walk && !qualityVisual && rect && slide.querySelector('.unified-timeline'))rect={left:rect.left,width:rect.width,bottom:slide.querySelector('.unified-timeline').getBoundingClientRect().bottom};
      if(!rect){replay.hidden=playing.hidden=true;return;}
      const control=complete?replay:playing;
      const width=control.offsetWidth;
      // Both states use the same photo-wall anchor, independent of their label widths.
      const left=qualityVisual ? rect.right-width-16 : walk && innerWidth<=760 ? (innerWidth-width)/2 : rect.left;
      control.style.left=Math.max(12,Math.min(innerWidth-width-12,left))+'px';
      control.style.top=qualityVisual
        ? Math.max(12,Math.min(innerHeight-control.offsetHeight-12,rect.top+16))+'px'
        : Math.min(innerHeight-control.offsetHeight-12,rect.bottom+8)+'px';
    };
    syncReplay();
    if(status)new MutationObserver(syncReplay).observe(status, {childList:true,subtree:true,characterData:true});
    new MutationObserver(syncReplay).observe(document.querySelector('#workspace'),{childList:true,subtree:true});
    window.addEventListener('resize',syncReplay);
    window.addEventListener('scroll',syncReplay,{passive:true});
    new ResizeObserver(syncReplay).observe(document.querySelector('#workspace'));

    const {navigation}=shell;
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

  init();
  if(!initialized){const readiness=new MutationObserver(()=>{init();if(initialized)readiness.disconnect();});readiness.observe(document.body,{childList:true,subtree:true});document.addEventListener('DOMContentLoaded',init,{once:true});}
})();
