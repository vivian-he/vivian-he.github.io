const lock=document.querySelector('#lockscreen'),opening=document.querySelector('#app-opening'),hub=document.querySelector('#hub'),notice=document.querySelector('#notification');
const shimmer=window.ConsumerMotion.createHubSkeleton();shimmer.id='hub-shimmer';shimmer.hidden=true;document.body.append(shimmer);
let busy=false;
const reduced=()=>matchMedia('(prefers-reduced-motion:reduce)').matches;
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
// Start the whoosh when the lock screen is actually visible, not while its
// retained master/deck iframe is still hidden and loading other screens.
let arrival;
const arrivalObserver=new IntersectionObserver(entries=>{
 for(const entry of entries){
  if(entry.isIntersecting&&!busy&&!lock.hidden){
   arrival?.cancel();
   arrival=notice.animate([{transform:'translateY(110px)',opacity:0},{transform:'translateY(-4px)',opacity:1,offset:.82},{transform:'translateY(0)',opacity:1}],{duration:reduced()?0:620,delay:reduced()?0:180,easing:'cubic-bezier(.16,.84,.3,1)',fill:'both'});
  }else if(!entry.isIntersecting){arrival?.cancel();}
 }
});
arrivalObserver.observe(notice);
notice.onclick=async()=>{
 if(busy)return;busy=true;notice.disabled=true;document.body.dataset.notificationPhase='opening';
 opening.hidden=false;
 const splashMotion=window.ConsumerMotion.playSplash(opening);
 await splashMotion.finished;
 lock.hidden=true;opening.hidden=true;splashMotion.animations.forEach(a=>a.cancel());
 document.body.dataset.notificationPhase='loading';
 await window.ConsumerMotion.playHubPush(shimmer).finished;
 await Promise.all([pause(reduced()?0:450),waitForHub()]);
 cleanHubChrome();hub.inert=false;document.body.classList.add('hub-open');
 shimmer.hidden=true;document.body.dataset.notificationPhase='hub';

};
async function waitForHub(){
 const start=Date.now();while(Date.now()-start<15000){try{if(hub.contentDocument?.querySelector('#root')?.children.length)return}catch{}await pause(100)}
}
function cleanHubChrome(){
 const doc=hub.contentDocument;if(!doc)return;
 if(!doc.querySelector('#notification-hub-chrome')){const style=doc.createElement('style');style.id='notification-hub-chrome';style.textContent='.mbt-status{visibility:hidden!important}';doc.head.append(style)}
 // Add semantic targets for presentation playback without changing the hub UI.
 const heading=doc.querySelector('#mbt-at-allmeals');
 if(heading)heading.dataset.demoAllMeals='true';
 const rail=doc.querySelector('.mbt-rail');
 if(rail)rail.dataset.demoHubRail='true';
}
hub.addEventListener('load',cleanHubChrome);if(hub.contentDocument?.readyState==='complete')cleanHubChrome();

const previewPhase=new URLSearchParams(location.search).get('previewPhase');
if(previewPhase==='loading'||previewPhase==='splash'){
 busy=true;lock.hidden=true;opening.hidden=previewPhase!=='splash';shimmer.hidden=previewPhase!=='loading';
 document.body.dataset.notificationPhase=previewPhase;window.setPhoneChromeTone?.('dark');
 const freeze=document.createElement('style');freeze.textContent='*,*::before,*::after{animation-play-state:paused!important}';document.head.append(freeze);
}
