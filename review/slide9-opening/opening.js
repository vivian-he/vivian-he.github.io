// One replaceable Home destination; the launcher never copies private phone content.
const frame=document.querySelector('#home'),launcher=document.querySelector('#launcher'),splash=document.querySelector('#splash'),shimmer=document.querySelector('#shimmer');
if(new URLSearchParams(location.search).has('embed'))document.documentElement.classList.add('embed');
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let timers=[],running=false,openingAnimations=[];
const later=(fn,ms)=>timers.push(setTimeout(fn,ms));
const rows=['qwertyuiop','asdfghjkl','⇧zxcvbnm⌫'];
document.querySelector('#keys').innerHTML=rows.map(row=>'<div class="keyrow">'+[...row].map(k=>`<span class="key ${'⇧⌫'.includes(k)?'wide':''}">${k}</span>`).join('')+'</div>').join('')+'<div class="keyrow"><span class="key wide">123</span><span class="key emoji">☻</span><span class="key space">space</span><span class="key blue">→</span></div>';
document.querySelector('.bones').innerHTML=Array.from({length:5},()=>'<div class="bone-title"></div><div class="bone-row"><div class="bone-card"></div><div class="bone-card"></div></div>').join('');
function reset(){const panel=document.querySelector("#hub-push");if(panel)panel.hidden=true;openingAnimations.forEach(a=>a.cancel());openingAnimations=[];timers.forEach(clearTimeout);timers=[];running=false;window.setPhoneChromeTone?.('light');launcher.hidden=false;splash.hidden=true;shimmer.hidden=true;frame.style.visibility='hidden';frame.contentDocument?.querySelector('.assistant-nudges-screen--home')?.scrollTo(0,0);}
function openApp(){
 if(running)return;running=true;
 expandApp();
}
function expandApp(){
 // The centered app card and its logo grow together, preserving rounded corners.
 splash.hidden=false;
 const shared=window.ConsumerMotion.playSplash(splash);
 const motion=shared.animations[0];
 openingAnimations=shared.animations;
 window.setPhoneChromeTone?.('light');
 motion.finished.then(()=>{launcher.hidden=true;window.setPhoneChromeTone?.('dark');motion.cancel();}).catch(()=>{});
 later(()=>{splash.hidden=true;shimmer.hidden=false},700);
 later(()=>{shimmer.hidden=true;frame.style.visibility='visible';if(!reduced)frame.animate([{opacity:0},{opacity:1}],{duration:200});frame.contentDocument?.querySelector('.assistant-nudges-screen--home')?.scrollTo(0,0)},1500)
}
document.querySelector('#launch').onclick=openApp;document.querySelector('#replay').onclick=reset;document.querySelector('#jump').onclick=()=>{if(!running){openApp();later(jump,1600)}else jump()};function jump(){const d=frame.contentDocument,rail=d?.querySelector('.mbl-rail'),scroller=d?.querySelector('.assistant-nudges-screen--home');if(rail&&scroller)scroller.scrollTo({top:scroller.scrollTop+rail.parentElement.getBoundingClientRect().top-110,behavior:reduced?'instant':'smooth'})}
frame.addEventListener('load',()=>frame.contentDocument?.querySelector('.assistant-nudges-screen--home')?.scrollTo(0,0));reset();
// Preserve Home and its exact scroll position beneath a native-style hub push.
const UPDATED_HUB=window.CONSUMER_SCREENS.hub;
const hubPanel=document.createElement('section');hubPanel.id='hub-push';hubPanel.hidden=true;
const hubFrame=document.createElement('iframe');hubFrame.title='Meal Box hub';hubFrame.id='hub-frame';hubPanel.append(hubFrame);document.querySelector('#device').append(hubPanel);
let hubBusy=false;
async function showHub(){
 if(hubBusy||!hubPanel.hidden)return;hubBusy=true;
 const loading=window.ConsumerMotion.createHubSkeleton();loading.style.zIndex='6';document.querySelector('#device').append(loading);
 const ready=new Promise(resolve=>{hubFrame.onload=()=>{
  const d=hubFrame.contentDocument;
  d?.addEventListener('click',e=>{const b=e.target.closest('button,a');if(b?.getAttribute('aria-label')==='Back'){e.preventDefault();e.stopImmediatePropagation();closeHub();}},true);
  resolve();
 };});
 hubFrame.src=UPDATED_HUB;
 await window.ConsumerMotion.playHubPush(loading).finished;
 await Promise.all([ready,new Promise(resolve=>setTimeout(resolve,reduced?0:450))]);
 hubPanel.hidden=false;loading.remove();hubBusy=false;
}

function closeHub(){if(hubBusy)return;hubBusy=true;hubPanel.animate([{transform:'translateX(0)'},{transform:'translateX(100%)'}],{duration:reduced?0:320,easing:'cubic-bezier(.4,0,.2,1)'}).finished.then(()=>{hubPanel.hidden=true;hubBusy=false;});}
frame.addEventListener('load',()=>{
 const doc=frame.contentDocument;if(!doc)return;
 doc.addEventListener('click',event=>{
  const button=event.target.closest('button,[role="button"],a');if(!button)return;
  const label=button.textContent.trim();
  if(button.matches('[data-mealbox-entry]')||/See all.*Meal Boxes/i.test(label)||label==='$12 full size meals'){
   event.preventDefault();event.stopImmediatePropagation();showHub();
  }
 },true);
});

// Inspect actual transition states without running their timers.
const previewPhase=new URLSearchParams(location.search).get('previewPhase');
if(previewPhase==='splash'||previewPhase==='loading'){
 reset();running=true;launcher.hidden=true;splash.hidden=previewPhase!=='splash';shimmer.hidden=previewPhase!=='loading';
 document.documentElement.classList.add('static-phase');window.setPhoneChromeTone?.('dark');
}

// Loading uses the actual mounted Home search component, including its Prism icons.
function syncLoadingSearch(){
 const doc=frame.contentDocument,source=doc?.querySelector('.search-pill'),dock=document.querySelector('#shimmer .searchdock');
 if(!source||!dock)return;
 const clone=source.cloneNode(true),originals=[source,...source.querySelectorAll('*')],copies=[clone,...clone.querySelectorAll('*')];
 originals.forEach((node,i)=>{const style=doc.defaultView.getComputedStyle(node);for(const name of style)copies[i].style.setProperty(name,style.getPropertyValue(name));});
 clone.style.width='100%';clone.style.height='50px';clone.style.margin='0';clone.style.transform='none';
 clone.style.pointerEvents='none';dock.replaceChildren(clone);dock.dataset.ready='true';
 for(const face of doc.fonts){try{document.fonts.add(face)}catch{}}
}
frame.addEventListener('load',()=>{syncLoadingSearch();const doc=frame.contentDocument;if(doc)new MutationObserver(syncLoadingSearch).observe(doc.body,{childList:true,subtree:true});});
if(frame.contentDocument?.readyState==='complete')syncLoadingSearch();
