(() => {
  const portalUrl='/prototypes/koji-customer-reviews/insights/?item=ratings-reviews&reviews-brand=doordash&reviews-scope=business&reviews-mealbox=mealbox-only&drawer=closed';
  const $=s=>document.querySelector(s);
  const email=$('#email'),portal=$('#portal'),frame=portal.querySelector('iframe'),back=$('#back'),zoom=$('#zoom'),address=$('#address'),scroller=$('#email-scroll'),focusButton=$('#focus-email');
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let generation=0,portalFocused=false,portalObserver;
  const restore=document.createElement('button');restore.className='return-chrome';restore.textContent='Show Gmail';restore.setAttribute('aria-label','Show Gmail chrome');document.body.append(restore);
  const state=view=>{document.documentElement.dataset.reportView=view;window.dispatchEvent(new CustomEvent('merchant-report-state',{detail:{view}}));};
  function stop(){generation++;document.documentElement.dataset.reportPlaying='false';}
  function size(){
    if(portal.hidden)return;
    let scale=portal.clientWidth/1440,x=0,y=0;
    if(portalFocused){
      const table=frame.contentDocument?.querySelector('[aria-label="$12 Meal Boxes"]');
      if(table){const r=table.getBoundingClientRect();scale=Math.min(portal.clientWidth*.92/r.width,1.65);x=(portal.clientWidth-r.width*scale)/2-r.left*scale;y=28-r.top*scale;}
      else{scale*=1.22;x=-280*scale;y=-185*scale;}
    }
    portal.style.setProperty('--portal-scale',scale);portal.style.setProperty('--portal-x',x+'px');portal.style.setProperty('--portal-y',y+'px');
  }
  function preparePortal(){
    const doc=frame.contentDocument;if(!doc?.head)return;
    if(!doc.querySelector('#report-presentation-style')){const style=doc.createElement('style');style.id='report-presentation-style';style.textContent='.mxr-host__bar{display:none!important}.mxr-host__frame{height:100vh!important}.mxr-host{height:100vh!important}';doc.head.append(style);}
    if(!portalObserver){portalObserver=new MutationObserver(()=>{if(!portal.hidden&&!portalFocused)size();});portalObserver.observe(doc.body,{childList:true,subtree:true});}
    size();
  }
  frame.addEventListener('load',preparePortal);
  new ResizeObserver(size).observe(portal);
  function focusEmail(value=true){document.body.classList.toggle('email-focus',Boolean(value));focusButton.textContent=value?'Show Gmail':'Focus email';state(value?'email-focus':'email');return value;}
  function reset(){stop();portal.hidden=true;email.hidden=false;back.hidden=zoom.hidden=true;focusButton.hidden=false;address.textContent='mail.google.com';portalFocused=false;portal.classList.remove('focus');focusEmail(false);scroller.scrollTop=0;const ps=portalScrollElement();if(ps)ps.scrollTop=0;}
  function showPortal(){
    focusEmail(false);email.hidden=true;portal.hidden=false;back.hidden=zoom.hidden=false;focusButton.hidden=true;address.textContent='merchant.doordash.com · Ratings & reviews';portalFocused=false;portal.classList.remove('focus');zoom.textContent='Zoom table';state('portal');
    if(!frame.getAttribute('src'))frame.src=portalUrl;else preparePortal();size();
  }
  function focusTable(value=true){if(portal.hidden)showPortal();portalFocused=Boolean(value);portal.classList.toggle('focus',portalFocused);zoom.textContent=portalFocused?'Full portal':'Zoom table';preparePortal();size();state(portalFocused?'table-focus':'portal');return portalFocused;}
  function portalScrollElement(){return frame.contentDocument?.querySelector('.template-unified-document')||frame.contentDocument?.scrollingElement;}
  function animateScroll(el,options={}){
    if(typeof options==='number')options={progress:options};if(!el)return Promise.resolve(false);
    const max=el.scrollHeight-el.clientHeight;const target=options.top??(options.progress!=null?max*Math.max(0,Math.min(1,options.progress)):Math.min(max,el.scrollTop+(options.by??500)));
    const start=el.scrollTop,duration=reduce?0:(options.duration??1600),begun=performance.now(),run=generation;
    return new Promise(resolve=>{function tick(now){if(run!==generation){resolve(false);return;}const t=duration?Math.min(1,(now-begun)/duration):1;const eased=t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;el.scrollTop=start+(target-start)*eased;if(t<1)requestAnimationFrame(tick);else resolve(true);}requestAnimationFrame(tick);});
  }
  const scrollEmail=options=>animateScroll(scroller,options);
  const scrollPortal=options=>animateScroll(portalScrollElement(),options);
  async function wait(ms,run){await new Promise(r=>setTimeout(r,reduce?Math.min(ms,100):ms));return run===generation;}
  async function playEmail(){reset();const run=generation;document.documentElement.dataset.reportPlaying='true';if(!await wait(1000,run))return;focusEmail();if(!await wait(1100,run))return;for(const progress of [.3,.63,1]){if(!await scrollEmail({progress,duration:1800}))return;if(!await wait(700,run))return;}document.documentElement.dataset.reportPlaying='false';}
  async function playPortal(){stop();const run=generation;showPortal();document.documentElement.dataset.reportPlaying='true';for(let i=0;i<30&&!frame.contentDocument?.querySelector('[aria-label="$12 Meal Boxes"]');i++){if(!await wait(200,run))return;}if(!await wait(1100,run))return;focusTable();if(!await wait(1400,run))return;await scrollPortal({by:480,duration:2200});document.documentElement.dataset.reportPlaying='false';}
  $('#open').onclick=()=>{stop();showPortal();};back.onclick=reset;focusButton.onclick=()=>{stop();focusEmail(!document.body.classList.contains('email-focus'));};restore.onclick=()=>{stop();focusEmail(false);};zoom.onclick=()=>{stop();focusTable(!portalFocused);};
  window.merchantReport={reset,focusEmail,scrollEmail,showPortal,focusTable,scrollPortal,playEmail,playPortal,stop};
  window.addEventListener('message',event=>{if(event.origin!==location.origin||event.source!==parent||event.data?.type!=='merchant-report')return;const {action,options}=event.data;if(Object.hasOwn(window.merchantReport,action))window.merchantReport[action](options);});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
  state('email');
  // No autoplay timers run by default. The parent deck owns presentation playback.
  const recipe=new URLSearchParams(location.search).get('autoplay');
  if(recipe==='email')playEmail();else if(recipe==='portal')playPortal();
})();
