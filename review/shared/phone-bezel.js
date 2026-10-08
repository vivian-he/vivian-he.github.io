// The presentation device owns system UI. Embedded app screens contain only app UI.
(()=>{
 const devices='.walk-phone,.one-p-phone,.prepared-phone,.homepage-phone,.motion-phone,.m-phone,.ops-demo.phone';
 const deviceStyles=document.createElement('link');deviceStyles.rel='stylesheet';deviceStyles.href='/review/shared/device-chrome.css?v=figma-2';document.head.append(deviceStyles);
 const systemUI='.status,.gxc-status-bar,.scroll-header__status-bar,.gxk-status-bar,.gxs-status-bar,.status-bar,.ios-status-bar,.p1-status-bar,.mbt-status,#fixed-phone-status,.lock-signals,.island,.dynamic-island,.home-indicator,.mbt-home-indicator,.ge-home-indicator,.pedregal-fab__home-indicator';
 const signals='<img class="device-signals" src="/review/shared/iphone-signals.svg" alt="" width="75.0473" height="13.084">';
 const observed=new WeakSet(),frames=new WeakSet(),syncers=new WeakMap();
 function clean(doc,phone){
  if(!doc?.head)return;if(observed.has(doc)){syncers.get(doc)?.();return;}
  observed.add(doc);
  const css=doc.createElement('style');const cleanTop=doc.createElement('link');cleanTop.rel='stylesheet';cleanTop.href='/review/shared/no-status-chrome.css';doc.head.append(cleanTop);
  css.textContent=systemUI+'{opacity:0!important;pointer-events:none!important}html{background:#fff!important}';doc.head.append(css);
  // Existing launcher code can request a light system UI without owning a second bar.
  doc.defaultView.setPhoneChromeTone=t=>{doc.documentElement.dataset.phoneTone=t;sync()};
  function visibleDocument(d){let w=d.defaultView;try{while(w.frameElement){const f=w.frameElement;if(f.hidden||f.closest('[hidden],[inert],[aria-hidden="true"]')||w.parent.getComputedStyle(f).visibility==='hidden'||w.parent.getComputedStyle(f).display==='none'||!f.getBoundingClientRect().width||!f.getBoundingClientRect().height)return false;w=w.parent}}catch{}return true}
  function sync(){
   if(!doc.defaultView||!doc.location||!doc.documentElement)return;
   doc.querySelectorAll('iframe').forEach(f=>attach(f,phone));
   if(!visibleDocument(doc))return;
   const lock=doc.querySelector('#lockscreen'),launcher=doc.querySelector('#launcher');
   const merchantNav=doc.querySelector('.assistant-nudges-store-top-nav');if(merchantNav&&merchantNav.getBoundingClientRect().width>0){phone.dataset.locked='false';phone.dataset.chromeTone=merchantNav.classList.contains('assistant-nudges-store-top-nav--scrolled')?'dark':'light';return}
   const home=doc.querySelector('.assistant-nudges-screen--home');if(home&&home.getBoundingClientRect().width>0){phone.dataset.locked='false';phone.dataset.chromeTone='dark';return}
   if(new URLSearchParams(doc.location.search).get('screen')==='confirmation'){phone.dataset.locked='false';phone.dataset.chromeTone='light';return}
   const store=doc.querySelector('.store-page');if(store&&store.getBoundingClientRect().width>0&&doc.defaultView.getComputedStyle(store).visibility!=='hidden'){phone.dataset.locked='false';phone.dataset.chromeTone=store.scrollTop>100?'dark':'light';if(!store.__toneWatch){store.__toneWatch=true;store.addEventListener('scroll',sync,{passive:true})}return}
   if(lock&&!lock.hidden){phone.dataset.locked='true';phone.dataset.chromeTone='light';return}
   if(launcher&&!launcher.hidden){phone.dataset.locked='false';phone.dataset.chromeTone='light';return}
   if(doc.documentElement.dataset.phoneTone){phone.dataset.chromeTone=doc.documentElement.dataset.phoneTone;return}
   if(!doc.querySelector('iframe:not([hidden])')){phone.dataset.locked='false';phone.dataset.chromeTone='dark';}
  }
  syncers.set(doc,sync);sync();new MutationObserver(sync).observe(doc.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','class','data-phone-tone','aria-hidden','style']});
 }
 function attach(frame,phone){if(!frames.has(frame)){frames.add(frame);frame.addEventListener('load',()=>{if(frame.parentElement===phone){phone.dataset.locked='false';phone.dataset.chromeTone='dark'}try{clean(frame.contentDocument,phone)}catch{}})}try{clean(frame.contentDocument,phone)}catch{}}
 function setup(){document.querySelectorAll(devices).forEach(phone=>{
  if(!phone.querySelector(':scope > .device-system-ui')){
   phone.classList.add('shared-system-phone');phone.dataset.chromeTone='dark';
   const edge=document.createElement('span');edge.className='phone-bezel-seal';edge.setAttribute('aria-hidden','true');phone.append(edge);
   const chrome=document.createElement('div');chrome.className='device-system-ui';chrome.setAttribute('aria-hidden','true');chrome.innerHTML='<div class="device-status"><b>9:41</b>'+signals+'</div><i class="device-island"></i><i class="device-home-bar"></i>';phone.append(chrome);
   new ResizeObserver(()=>chrome.style.setProperty('--device-scale',phone.clientWidth/393)).observe(phone);
  }
  phone.querySelectorAll(':scope > iframe').forEach(f=>attach(f,phone));
 })}
 let pending=false;new MutationObserver(()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;setup()})}).observe(document.body,{childList:true,subtree:true});setup();
})();
