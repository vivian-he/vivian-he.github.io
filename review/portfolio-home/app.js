// Product covers are captured from the canonical local prototypes.
// The enclosing project links own pointer and keyboard input.

for(const card of document.querySelectorAll('.project-card')){card.addEventListener('pointermove',event=>{const r=card.getBoundingClientRect();card.style.setProperty('--light-x',`${((event.clientX-r.left)/r.width)*100}%`);card.style.setProperty('--light-y',`${((event.clientY-r.top)/r.height)*100}%`)});card.addEventListener('pointerleave',()=>{card.style.removeProperty('--light-x');card.style.removeProperty('--light-y')})}
