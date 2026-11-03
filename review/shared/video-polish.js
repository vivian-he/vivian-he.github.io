(()=>{
 const bound=new WeakSet();
 function scan(){
  for(const video of document.querySelectorAll('#slide video[data-hover-play]')){
   if(bound.has(video))continue;bound.add(video);video.autoplay=false;video.pause();
   const screen=video.closest('.map-option-media');if(!screen)continue;screen.tabIndex=0;
   const play=()=>{for(const other of document.querySelectorAll('video[data-hover-play]'))if(other!==video)other.pause();video.play().catch(()=>{})};
   const pause=()=>video.pause();screen.addEventListener('mouseenter',play);screen.addEventListener('mouseleave',pause);screen.addEventListener('focus',play);screen.addEventListener('blur',pause);
  }
  for(const video of document.querySelectorAll('video[data-hover-play]'))if(!video.closest('#slide'))video.pause();
 }
 const stage=document.getElementById('slide');if(stage)new MutationObserver(scan).observe(stage,{childList:true});scan();
 document.addEventListener('visibilitychange',()=>{if(document.hidden)for(const video of document.querySelectorAll('video[data-hover-play]'))video.pause()});
})();
