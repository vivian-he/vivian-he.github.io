/* Phone demos do not simulate desktop hover or pointer-pressed styling.
   Tap handlers, selected states, focus accessibility and screen motion remain. */
(()=>{
 const pointerState= /:(?:hover|active)\b/;
 function clean(sheet){
  let rules;try{rules=sheet.cssRules}catch{return}
  for(let i=rules.length-1;i>=0;i--){const rule=rules[i];
   if(rule.selectorText&&pointerState.test(rule.selectorText)){
    const selectors=[];let start=0,depth=0;for(let j=0;j<rule.selectorText.length;j++){const c=rule.selectorText[j];if(c==='('||c==='[')depth++;if(c===')'||c===']')depth--;if(c===','&&!depth){selectors.push(rule.selectorText.slice(start,j));start=j+1}}selectors.push(rule.selectorText.slice(start));
    const kept=selectors.filter(selector=>!pointerState.test(selector));
    if(kept.length)rule.selectorText=kept.join(',');else sheet.deleteRule(i);
   }else if(rule.cssRules)clean(rule);
   else if(rule.styleSheet)clean(rule.styleSheet);
  }
 }
 let pending=false;function run(){pending=false;Array.from(document.styleSheets).forEach(clean)}
 function schedule(){if(!pending){pending=true;requestAnimationFrame(run)}}
 document.addEventListener('load',e=>{if(e.target.tagName==='LINK')schedule()},true);
 new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
 run();
})();

// Keep the reference dot inside the phone document; never intercept a click.
(()=>{
 const css=document.createElement('link');css.rel='stylesheet';css.href='/review/shared/phone-pointer.css';document.head.append(css);
 const dot=document.createElement('i');dot.className='phone-tap-cursor';dot.hidden=true;dot.setAttribute('aria-hidden','true');
 const mount=()=>document.body.append(dot);
 if(document.body)mount();else document.addEventListener('DOMContentLoaded',mount,{once:true});
 const hide=()=>{dot.hidden=true;document.documentElement.classList.remove('phone-pointer-active')};
 function position(e){
  if(e.pointerType!=='mouse'||document.documentElement.classList.contains('deck-autoplay-running'))return;
  dot.hidden=false;dot.style.left=e.clientX+'px';dot.style.top=e.clientY+'px';document.documentElement.classList.add('phone-pointer-active');
 }
 document.addEventListener('pointermove',position,{passive:true});
 document.addEventListener('pointerdown',e=>{
  position(e);if(dot.hidden||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  dot.getAnimations().forEach(a=>a.cancel());dot.animate([{transform:'scale(1)'},{transform:'scale(.82)'},{transform:'scale(1)'}],{duration:260});
 },{passive:true});
 document.documentElement.addEventListener('pointerleave',hide);
 document.addEventListener('keydown',hide);window.addEventListener('blur',hide);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)hide()});
})();
