import { setupLaptopLoop } from './laptop-loop.js';

const rail = document.querySelector('.rail');
const cards = [...rail.children];
const prev = document.querySelector('#prev');
const next = document.querySelector('#next');
const position = document.querySelector('#position');

function cardStep() {
  return cards[0].offsetWidth + parseFloat(getComputedStyle(rail).gap);
}

function update() {
  prev.disabled = rail.scrollLeft < 5;
  next.disabled = rail.scrollLeft >= rail.scrollWidth - rail.clientWidth - 5;
  const index = Math.round(rail.scrollLeft / cardStep());
  position.textContent = `${String(index + 1).padStart(2, '0')} — ${String(cards.length).padStart(2, '0')}`;
}

function move(direction) {
  rail.scrollBy({ left: direction * cardStep() });
}

prev.addEventListener('click', () => move(-1));
next.addEventListener('click', () => move(1));
rail.addEventListener('scroll', update, { passive: true });
window.addEventListener('resize', update);
rail.addEventListener('keydown', event => {
  if (event.target === rail && ['ArrowLeft', 'ArrowRight'].includes(event.key)) {
    event.preventDefault();
    move(event.key === 'ArrowRight' ? 1 : -1);
  }
});

const dialog = document.querySelector('dialog');
document.querySelectorAll('.case-study').forEach(button => {
  button.addEventListener('click', () => {
    if(button.dataset.enlarge==='workflow'){
      dialog.classList.add('workflow-modal');
      dialog.setAttribute('aria-labelledby','detail-title');
      document.querySelector('#detail-title').textContent='My AI workflow';
      dialog.querySelector('.ai-workflow-grid')?.remove();
      dialog.append(document.querySelector('.card.workflow .ai-workflow-grid').cloneNode(true));
      dialog.showModal();return;
    }
    if (button.dataset.href) {
      if(button.closest('.card.vr,.card.messenger')){window.open(button.dataset.href,'_blank','noopener,noreferrer');return;}
      window.location.href = button.dataset.href;
      return;
    }
    document.querySelector('#detail-title').textContent = button.dataset.project;
    dialog.showModal();
  });
});
document.querySelector('.close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
});

update();

// Native phone/laptop coordinates preserve the deck's screen proportions.
document.querySelectorAll('.portfolio-phone,.laptop-display').forEach(device=>{
  const nativeWidth=device.classList.contains('laptop-display')?1440:393;
  new ResizeObserver(()=>{
    const css=getComputedStyle(device);
    const borderX=parseFloat(css.borderLeftWidth)+parseFloat(css.borderRightWidth);
    const borderY=parseFloat(css.borderTopWidth)+parseFloat(css.borderBottomWidth);
    const innerWidth=parseFloat(css.width)-(css.boxSizing==='border-box'?borderX:0);
    const scale=innerWidth/nativeWidth;
    device.style.setProperty('--preview-scale',scale);
    // The 393×852 ratio belongs to the screen, not the screen plus its bezel.
    // Applying it to the border box leaves an exposed strip below the iframe.
    if(device.querySelector('#meals-phone'))device.style.height=(852*scale+(css.boxSizing==='border-box'?borderY:0))+'px';
  }).observe(device);
});

const reduced=matchMedia('(prefers-reduced-motion: reduce)');
document.querySelectorAll('.card.meals,.card.going').forEach(card=>{
  let playing=false,visible=false,timer=null;
  const phone=card.querySelector('#meals-phone'),merchant=card.querySelector('#merchant-preview');
  const laptop=merchant?setupLaptopLoop(merchant):null;
  const states=['home','hub','item','cart'];let stateIndex=0;
  function phoneStep(){
    if(!playing)return;
    const flow=phone?.contentWindow?.ConsumerFlow;
    if(flow){flow.navigate(states[stateIndex]);stateIndex=(stateIndex+1)%states.length;}
    timer=setTimeout(phoneStep,flow?4000:200);
  }
  function pause(){playing=false;clearTimeout(timer);card.querySelectorAll('video').forEach(v=>v.pause());laptop?.pause();}
  function play(){
    if(playing||reduced.matches)return;playing=true;
    card.querySelectorAll('video').forEach(v=>v.play().catch(()=>{}));
    if(phone)phoneStep();
    laptop?.play();
  }
  function sync(){if(visible&&!document.hidden&&!reduced.matches)play();else pause();}
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:.1}).observe(card);
  document.addEventListener('visibilitychange',sync);
  reduced.addEventListener('change',sync);
});
