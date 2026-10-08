/* Shared app and hub arrival motion for every consumer entry point. */
(()=>{
 const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
 const ease='cubic-bezier(.22,.75,.2,1)';
 function playSplash(surface,origin){
  surface.hidden=false;
  const logo=surface.querySelector('img');
  Object.assign(logo.style,{position:'absolute',top:'40%',left:'calc(50% - 62px)',width:'124px'});
  const options={duration:reduced()?0:650,easing:ease,fill:'forwards'};
  let clip='inset(32% 28% round 48px)',logoStart='scale(.44)';
  if(origin){
   const box=surface.getBoundingClientRect(),from=origin.getBoundingClientRect();
   const sx=surface.offsetWidth/box.width,sy=surface.offsetHeight/box.height;
   const x=(from.left-box.left)*sx,y=(from.top-box.top)*sy,w=from.width*sx,h=from.height*sy;
   clip=`inset(${y}px ${surface.offsetWidth-x-w}px ${surface.offsetHeight-y-h}px ${x}px round 19px)`;
   const logoHeight=logo.getBoundingClientRect().height*sy;
   logoStart=`translate(${x+w/2-surface.offsetWidth/2}px,${y+h/2-(surface.offsetHeight*.4+logoHeight/2)}px) scale(.42)`;
  }
  const animations=[surface.animate([{clipPath:clip,opacity:1},{clipPath:'inset(0% 0% round 35px)',opacity:1,offset:.94},{clipPath:'inset(-1px round 35px)',opacity:1}],options),logo.animate([{transform:logoStart},{transform:'translate(0,0) scale(1)'}],options)];
  return {animations,finished:Promise.all(animations.map(a=>a.finished))};
 }
 function playHubPush(surface){
  surface.hidden=false;
  return surface.animate([{transform:'translateX(100%)'},{transform:'translateX(0)'}],{duration:reduced()?0:300,easing:ease});
 }
 function createHubSkeleton(){
  if(!document.querySelector('#shared-hub-skeleton-style')){
   const style=document.createElement('style');style.id='shared-hub-skeleton-style';style.textContent=`.shared-hub-skeleton{position:absolute;inset:0;z-index:20;box-sizing:border-box;padding:78px 16px 24px;background:white;overflow:hidden;pointer-events:none}.shared-hub-skeleton[hidden]{display:none}.shared-hub-skeleton .shs-heading{width:230px;height:34px;margin-bottom:14px;border-radius:8px}.shared-hub-skeleton .shs-sub{width:310px;height:18px;border-radius:6px}.shared-hub-skeleton .shs-chips{display:flex;gap:8px;margin:28px 0}.shared-hub-skeleton .shs-chips i{width:102px;height:36px;border-radius:22px;flex-shrink:0}.shared-hub-skeleton .shs-cards{display:flex;gap:14px;margin-bottom:32px}.shared-hub-skeleton .shs-cards i{height:215px;width:220px;border-radius:16px;flex-shrink:0}.shared-hub-skeleton .shs-heading.small{width:140px;height:26px}.shared-hub-skeleton i,.shared-hub-skeleton .shs-heading,.shared-hub-skeleton .shs-sub{display:block;background:linear-gradient(105deg,#eee 25%,#fafafa 45%,#eee 65%);background-size:250% 100%;animation:shared-hub-shine 1.1s linear infinite}@keyframes shared-hub-shine{from{background-position:100% 0}to{background-position:0 0}}@media(prefers-reduced-motion:reduce){.shared-hub-skeleton *{animation:none!important}}`;document.head.append(style);
  }
  const surface=document.createElement('section');surface.className='shared-hub-skeleton';surface.setAttribute('role','status');surface.setAttribute('aria-label','Loading Meal Box selection');surface.innerHTML='<div class="shs-heading"></div><div class="shs-sub"></div><div class="shs-chips"><i></i><i></i><i></i></div><div class="shs-cards"><i></i><i></i></div><div class="shs-heading small"></div><div class="shs-cards"><i></i><i></i></div>';return surface;
 }
 window.ConsumerMotion={playSplash,playHubPush,createHubSkeleton};
})();
