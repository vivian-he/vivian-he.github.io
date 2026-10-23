/* Same-origin bridge: the viewer owns chrome, this document owns the fixed slide. */
(() => {
  if(new URLSearchParams(location.search).get('canvas')!=='1')return;
  document.body.classList.add('deck-canvas-content','presentation-mode','no-outline');
  const isRewards=document.body.dataset.deckId==='in-store-rewards';
  let lastState='';
  let autoplay, pendingAutoplay=null;
  function setAutoplay(enabled){
    if(!autoplay){pendingAutoplay=enabled;return;}
    if(window.DeckAutoplay?.requestEnabled){window.DeckAutoplay.requestEnabled(enabled);return;}
    if((autoplay.getAttribute('aria-pressed')==='true')!==enabled)autoplay.click();
  }
  function publish(){
    const url=new URL(location.href),slide=url.searchParams.get('slide'),index=Math.max(0,(parseInt(url.hash.slice(1))||1)-1);
    const state={type:'deck-canvas-state',slide,index};
    if(autoplay)state.autoplayEnabled=autoplay.getAttribute('aria-pressed')==='true';
    const key=JSON.stringify(state);if(key===lastState)return;lastState=key;parent.postMessage(state,location.origin);
  }
  const observer=new MutationObserver(publish);
  const outline=document.querySelector('#outline');if(outline)observer.observe(outline,{childList:true,subtree:true,attributes:true,attributeFilter:['class','aria-current']});
  function bindAutoplay(){
    autoplay=document.querySelector('#deck-autoplay-toggle');
    if(!autoplay)return false;
    observer.observe(autoplay,{attributes:true,attributeFilter:['aria-pressed']});
    if(pendingAutoplay!==null){const desired=pendingAutoplay;pendingAutoplay=null;setAutoplay(desired);}
    publish();
    return true;
  }
  if(!bindAutoplay()){
    const readiness=new MutationObserver(()=>{if(bindAutoplay())readiness.disconnect();});
    readiness.observe(document.body,{childList:true,subtree:true});
  }
  addEventListener('message',event=>{
    if(event.origin!==location.origin||event.source!==parent)return;
    if(event.data?.type==='deck-canvas-go'){
      const url=new URL(location.href);
      if(url.searchParams.get('slide')!==String(event.data.slide)){
        const button=document.querySelector(`#outline button[data-index="${Number(event.data.index)}"]`);button?.click();
      }
      publish();
    }else if(event.data?.type==='deck-canvas-autoplay'){
      if(autoplay)autoplay.click();
      else pendingAutoplay=!(pendingAutoplay??(new URLSearchParams(location.search).get('autoplay')!=='0'));
    }
    else if(event.data?.type==='deck-canvas-autoplay-set'&&typeof event.data.enabled==='boolean')setAutoplay(event.data.enabled);
    else if(event.data?.type==='deck-canvas-visibility'){
      if(!event.data.visible){if(typeof stopMedia==='function')stopMedia();window.DeckAutoplay?.pause();}
      else if(autoplay?.getAttribute('aria-pressed')==='true'){
        if(typeof send==='function')send('play');else window.DeckAutoplay?.replay();
      }
    }
  });
  if(new URLSearchParams(location.search).get('master')==='1'){
    addEventListener('keydown',event=>{
      if(event.target.closest('input,textarea,select,[contenteditable="true"]'))return;
      const forward=['ArrowRight','ArrowDown','PageDown',' '].includes(event.key),backward=['ArrowLeft','ArrowUp','PageUp'].includes(event.key);
      if(!forward&&!backward&&!['Home','End'].includes(event.key))return;
      event.preventDefault();event.stopImmediatePropagation();
      parent.postMessage({type:'deck-canvas-step',delta:forward?1:backward?-1:0,edge:event.key==='Home'?'first':event.key==='End'?'last':null},location.origin);
    },true);
  }
  addEventListener('hashchange',publish);publish();
})();
