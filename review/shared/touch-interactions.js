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
 if(document.documentElement)new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
 run();
})();

// A clipped, in-screen pointer avoids the browser cursor fallback at iframe edges.
(()=>{function init(){
 const root=document.documentElement;if(!root)return;if(root.dataset.phonePointerVersion==='consistent-16')return;
 root.dataset.phonePointerVersion='consistent-16';root.setAttribute('data-phone-tap-pointer','');
 document.getElementById('stable-phone-tap-pointer')?.remove();document.querySelector('.deck-edge-tap-pointer')?.remove();
 const svg="<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"100\" height=\"100\" viewBox=\"0 0 100 100\"><defs><filter id=\"s\" x=\"-25%\" y=\"-25%\" width=\"150%\" height=\"150%\"><feGaussianBlur stdDeviation=\"3.5\"/><feOffset dy=\"1\"/></filter><mask id=\"outside\" maskUnits=\"userSpaceOnUse\" x=\"0\" y=\"0\" width=\"100\" height=\"100\"><rect width=\"100\" height=\"100\" fill=\"white\"/><circle cx=\"50\" cy=\"50\" r=\"41.5\" fill=\"black\"/></mask></defs><g mask=\"url(#outside)\"><circle cx=\"50\" cy=\"50\" r=\"41.5\" fill=\"black\" fill-opacity=\".22\" filter=\"url(#s)\"/></g><circle cx=\"50\" cy=\"50\" r=\"41.5\" fill=\"white\" fill-opacity=\".58\"/></svg>";
 const style=document.createElement('style');style.id='stable-phone-tap-pointer';
 style.textContent='html:root[data-phone-tap-pointer][data-phone-tap-pointer],html:root[data-phone-tap-pointer][data-phone-tap-pointer] body,html:root[data-phone-tap-pointer][data-phone-tap-pointer] body *,html:root[data-phone-tap-pointer][data-phone-tap-pointer] body *::before,html:root[data-phone-tap-pointer][data-phone-tap-pointer] body *::after{cursor:none!important}.phone-tap-cursor,.deck-manual-pointer,.deck-autoplay-touch,.deck-flow-touch,.rewards-story-pointer{display:none!important}.deck-edge-tap-pointer{position:fixed!important;display:block;z-index:2147483647!important;width:100px!important;height:100px!important;margin:0!important;transform:translate(-50%,-50%)!important;background:url("data:image/svg+xml,'+encodeURIComponent(svg)+'") center/100% 100% no-repeat!important;border:0!important;box-shadow:none!important;pointer-events:none!important}.deck-edge-tap-pointer[hidden]{display:none!important}.dynamic-island,div[style*="width: 131px"][style*="height: 40px"]{visibility:hidden!important}';document.head.append(style);
 const dot=document.createElement('i');dot.className='deck-edge-tap-pointer';dot.hidden=true;dot.setAttribute('aria-hidden','true');document.body.append(dot);
 let inside=false;const notifyParent=()=>{if(window.parent!==window)window.parent.postMessage({type:'deck-pointer-inside-child'},location.origin)};window.addEventListener('message',e=>{if(e.origin===location.origin&&e.data?.type==='deck-pointer-inside-child'){dot.hidden=true;notifyParent()}});const move=e=>{if(e.target.closest?.('iframe')||e.composedPath().some(n=>n.tagName==='IFRAME')){dot.hidden=true;return}if(!inside){inside=true;notifyParent()}dot.hidden=false;dot.style.left=e.clientX+'px';dot.style.top=e.clientY+'px'};
 document.addEventListener('pointermove',move,{capture:true,passive:true});document.addEventListener('pointerover',move,{capture:true,passive:true});
 root.addEventListener('pointerleave',()=>{dot.hidden=true;inside=false});document.addEventListener('pointerout',e=>{if(!e.relatedTarget||e.relatedTarget.tagName==='IFRAME'||e.target.tagName==='IFRAME')dot.hidden=true},true);window.addEventListener('blur',()=>dot.hidden=true);
 const seen=new WeakSet();function scan(node){if(node.shadowRoot)watch(node.shadowRoot);for(const e of node.querySelectorAll?.('*')||[])if(e.shadowRoot)watch(e.shadowRoot)}function watch(shadow){if(seen.has(shadow))return;seen.add(shadow);shadow.querySelector('style[data-stable-phone-pointer]')?.remove();const st=document.createElement('style');st.dataset.stablePhonePointer='';st.textContent=':host,:host *,:host *::before,:host *::after{cursor:none!important}.phone-tap-cursor,.deck-manual-pointer,.deck-autoplay-touch,.deck-flow-touch{display:none!important}';shadow.append(st);scan(shadow);new MutationObserver(rs=>{for(const r of rs)for(const n of r.addedNodes)if(n.nodeType===1)scan(n)}).observe(shadow,{childList:true,subtree:true})}scan(root);
}
 if(document.body)init();else document.addEventListener('DOMContentLoaded',init,{once:true});
})();
