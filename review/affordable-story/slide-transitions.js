/* Restrained presentation motion; demo resets stay owned by the slide renderer. */
(() => {
  let timer, veil, lastIndex = -1, generation = 0;
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const phone = () => document.querySelector('#consumer-walk:not([hidden]) .walk-phone');
  function positionVeil() {
    const bounds = phone()?.getBoundingClientRect();
    if (!bounds || !veil) return;
    Object.assign(veil.style, {left:bounds.left+'px',top:bounds.top+'px',width:bounds.width+'px',height:bounds.height+'px'});
  }
  window.transitionDeckSlide = (index, paint) => {
    const previous = lastIndex, changed = previous !== index, token = ++generation;
    clearTimeout(timer);
    veil?.remove(); veil = null;
    const resetBeat = changed && previous >= 0 && (
      ([9,10,11,12].includes(index) && [9,10,11,12].includes(previous)) ||
      (Math.min(previous,index) === 15 && Math.max(previous,index) === 16));
    const finish = () => {
      if (token !== generation) return;
      lastIndex = index;
      paint();
      if (changed && previous >= 0 && !reduced()) {
        const surface = document.querySelector('#slide');
        // Consumer captions already have their own continuity animation.
        if (getComputedStyle(surface).display !== 'none') {
          surface.getAnimations().forEach(animation => animation.cancel());
          surface.animate([{opacity:0,translate:'0 8px'},{opacity:1,translate:'0 0'}],
            {duration:380,easing:'cubic-bezier(.22,1,.36,1)'});
        }
      }
      if (!veil) return;
      positionVeil();
      const currentVeil = veil;
      const frame = phone()?.querySelector('iframe');
      let revealed = false;
      const reveal = () => {
        if (revealed || token !== generation) return;
        revealed = true;
        setTimeout(() => {
          if (token !== generation) return;
          const animation = currentVeil.animate([{opacity:1},{opacity:0}],{duration:300,easing:'ease-out',fill:'forwards'});
          animation.onfinish = () => {currentVeil.remove();if(veil===currentVeil)veil=null;};
        },180);
      };
      frame?.addEventListener('load',reveal,{once:true});
      setTimeout(reveal,700); // Also handles already-loaded local entry screens.
    };
    if (!resetBeat || reduced() || !phone()) {finish();return;}
    window.DeckAutoplay?.pause();
    veil = document.createElement('div');
    veil.className = 'deck-reset-veil';
    veil.setAttribute('aria-hidden','true');
    Object.assign(veil.style,{position:'fixed',zIndex:2147483646,background:'#111',borderRadius:getComputedStyle(phone()).borderRadius,pointerEvents:'none'});
    document.body.append(veil);positionVeil();
    veil.animate([{opacity:0},{opacity:1}],{duration:140,easing:'ease-in',fill:'forwards'});
    timer = setTimeout(finish,140);
  };
  window.addEventListener('resize',positionVeil);
})();
