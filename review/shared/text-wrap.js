/* Keep the last two words together without changing copy or inline markup. */
(()=>{
  const selector='#slide :is(h1,h2,h3,p,li,figcaption,.visual-label,.artifact-label,.callout-label,.deck-callout-caption,.context-build-line,.bottom-phrases>span,.impact-block>span,.concept-pro,.concept-con,.support-points strong,.support-points li>span),.page-shell :is(h1,h2,h3,p)';
  const style=document.createElement('style');
  style.textContent='#slide :is(h1,h2,h3),.page-shell :is(h1,h2,h3){text-wrap:balance}#slide :is(p,li,figcaption),.page-shell p{text-wrap:pretty}';
  document.head.append(style);
  function tidy(el){
    if(el.closest('[contenteditable=true]')||el.querySelector('input,textarea,iframe'))return;
    const text=el.textContent,words=[...text.matchAll(/\S+/gu)];
    if(words.length<2)return;
    const before=words.at(-2),last=words.at(-1),start=before.index+before[0].length,end=last.index;
    if(start===end||!/[\t\n\r ]/u.test(text.slice(start,end)))return;
    // Avoid making a pair wider than its column (e.g. a narrow metric label).
    const canvas=tidy.canvas||(tidy.canvas=document.createElement('canvas'));
    const ctx=canvas.getContext('2d'),css=getComputedStyle(el);ctx.font=css.font||`${css.fontWeight} ${css.fontSize} ${css.fontFamily}`;
    const pair=before[0]+' '+last[0];
    const available=el.clientWidth-parseFloat(css.paddingLeft)-parseFloat(css.paddingRight);
    if(ctx.measureText(pair).width+Math.max(0,parseFloat(css.letterSpacing)||0)*pair.length>available)return;
    const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);let offset=0,node;
    while(node=walker.nextNode()){
      const value=node.data,from=Math.max(0,start-offset),to=Math.min(value.length,end-offset);
      if(from<to)node.data=value.slice(0,from)+value.slice(from,to).replace(/[\t\n\r ]/gu,'\u00a0')+value.slice(to);
      offset+=value.length;
    }
    // Hyphens can otherwise break inside the penultimate word despite the tied space.
    const hyphens=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);
    while(node=hyphens.nextNode())node.data=node.data.replace(/-(?!\u2060)(?=[^\s]*\u00a0\S+\s*$)/gu,'-\u2060');
    // A manual break directly before the last word should not strand it either.
    let position=0;const scan=document.createTreeWalker(el,NodeFilter.SHOW_ALL);const breaks=[];
    while(node=scan.nextNode()){if(node.nodeType===Node.TEXT_NODE)position+=node.data.length;else if(node.nodeName==='BR'&&position>=start&&position<=end)breaks.push(node)}
    for(const br of breaks)br.replaceWith(document.createTextNode('\u00a0'));
  }
  let scheduled=false;
  function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;document.querySelectorAll(selector).forEach(tidy)})}
  new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true,characterData:true});
  window.addEventListener('resize',schedule);document.fonts?.ready.then(schedule);schedule();
})();
