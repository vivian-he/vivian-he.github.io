(() => {
  const portalUrl='/review/merchant-portal/prototypes/koji-customer-reviews/insights/?item=ratings-reviews&reviews-brand=doordash&reviews-mealbox=mealbox-only&ia-study=b&ia-layout=table&presentation=clean&reviews-chrome=off&drawer=closed';
  const $=s=>document.querySelector(s);
  const email=$('#email'),portal=$('#portal'),frame=portal.querySelector('iframe'),emailFrame=$('#email-source'),back=$('#back'),zoom=$('#zoom'),address=$('#address'),scroller=$('#email-scroll'),focusButton=$('#focus-email');
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const deckEmail=new URLSearchParams(location.search).get('deck')==='1';document.body.classList.toggle('deck-email',deckEmail);
  let generation=0,portalFocused=false,portalObserver;
  const restore=document.createElement('button');restore.className='return-chrome';restore.textContent='Show Gmail';restore.setAttribute('aria-label','Show Gmail chrome');document.body.append(restore);
  const state=view=>{document.documentElement.dataset.reportView=view;window.dispatchEvent(new CustomEvent('merchant-report-state',{detail:{view}}));};
  function stop(){generation++;document.documentElement.dataset.reportPlaying='false';}
  function size(){
    if(portal.hidden)return;
    let scale=portal.clientWidth/1440,x=0,y=0;
    if(portalFocused){
      const table=portalDocument()?.querySelector('[aria-label="$12 Meal Box items"], [aria-label="$12 Meal Boxes"]');
      if(table){const r=table.getBoundingClientRect();scale=Math.min(portal.clientWidth*.92/r.width,1.65);x=(portal.clientWidth-r.width*scale)/2-r.left*scale;y=28-r.top*scale;}
      else{scale*=1.22;x=-280*scale;y=-185*scale;}
    }
    portal.style.setProperty('--portal-scale',scale);portal.style.setProperty('--portal-x',x+'px');portal.style.setProperty('--portal-y',y+'px');
  }
  function preparePortal(){
    const doc=portalDocument();if(!doc?.head)return;
    if(!doc.querySelector('#report-presentation-style')){const style=doc.createElement('style');style.id='report-presentation-style';style.textContent='[aria-label="Show prototype controls"]{display:none!important}';doc.head.append(style);}
    if(!portalObserver){portalObserver=new MutationObserver(()=>{if(!portal.hidden&&!portalFocused)size();});portalObserver.observe(doc.body,{childList:true,subtree:true});}
    size();
  }
  frame.addEventListener('load',preparePortal);
  function prepareEmail(){
    const doc=emailFrame.contentDocument;
    if(!doc)return;
    const measure=()=>{const view=doc.defaultView;const bottom=Math.max(0,...Array.from(doc.body.children).map(el=>el.getBoundingClientRect().bottom+(view?.scrollY||0)+(parseFloat(view.getComputedStyle(el).marginBottom)||0)));emailFrame.style.height=(Math.ceil(bottom+(parseFloat(view.getComputedStyle(doc.body).paddingBottom)||0))||doc.body.scrollHeight)+'px';};
    measure();
    doc.fonts?.ready.then(measure);
    for(const image of doc.images)image.addEventListener('load',measure,{once:true});
    new ResizeObserver(measure).observe(doc.body);
    doc.addEventListener('click',event=>{
      const link=event.target.closest('a[href]');
      if(!link)return;
      if(link.getAttribute('href')==='{{FULL_REPORT_URL}}'){
        event.preventDefault();stop();showPortal();
      }else if(new URL(link.href).origin!==location.origin){
        event.preventDefault();
      }
    },true);
  }
  emailFrame.addEventListener('load',prepareEmail);
  // Keep deck callouts attached to their actual email sections as it scrolls.
  function sendDeckMarkers(){
    if(!deckEmail||parent===window)return;
    const doc=emailFrame.contentDocument,fr=emailFrame.getBoundingClientRect(),clip=scroller.getBoundingClientRect();
    const targets=[['A person to contact',doc?.querySelector('.report-context')],['Show program value',doc?.querySelector('.metrics')],['A practical next step',[...(doc?.querySelectorAll('h3')||[])].find(x=>x.textContent.includes('Keep vegetable'))]];
    const markers=portal.hidden?targets.filter(([,el])=>el).map(([label,el])=>{const r=el.getBoundingClientRect();const y=fr.top+r.top+r.height/2;return{label,x:fr.left+r.left+r.width*.65,y,visible:y>clip.top+8&&y<clip.bottom-8}}):[];
    const origin=document.referrer?new URL(document.referrer).origin:location.origin;
    parent.postMessage({type:'merchant-email-markers',markers},origin);
  }
  let markerQueued=false;const scheduleMarkers=()=>{if(!markerQueued){markerQueued=true;requestAnimationFrame(()=>{markerQueued=false;sendDeckMarkers()})}};
  scroller.addEventListener('scroll',scheduleMarkers,{passive:true});
  emailFrame.addEventListener('load',()=>{scheduleMarkers();emailFrame.contentDocument?.fonts?.ready.then(scheduleMarkers)});
  window.addEventListener('resize',scheduleMarkers);window.addEventListener('merchant-report-state',scheduleMarkers);

  new ResizeObserver(size).observe(portal);
  function focusEmail(value=true){document.body.classList.toggle('email-focus',Boolean(value));focusButton.textContent=value?'Show Gmail':'Focus email';state(value?'email-focus':'email');return value;}
  function reset(){stop();portal.hidden=true;email.hidden=false;back.hidden=zoom.hidden=true;focusButton.hidden=false;address.textContent='mail.google.com';portalFocused=false;portal.classList.remove('focus');focusEmail(false);scroller.scrollTop=0;const ps=portalScrollElement();if(ps)ps.scrollTop=0;}
  function showPortal(){
    focusEmail(false);email.hidden=true;portal.hidden=false;back.hidden=false;zoom.hidden=true;focusButton.hidden=true;address.textContent='merchant.doordash.com · Ratings & reviews';portalFocused=false;portal.classList.remove('focus');state('portal');
    if(!frame.getAttribute('src'))frame.src=portalUrl;else preparePortal();size();
  }
  function focusTable(value=true){if(portal.hidden)showPortal();portalFocused=Boolean(value);portal.classList.toggle('focus',portalFocused);zoom.textContent=portalFocused?'Full portal':'Zoom table';preparePortal();size();state(portalFocused?'table-focus':'portal');return portalFocused;}
  function portalDocument(){try{return frame.contentDocument;}catch{return null;}}
  function portalScrollElement(){const doc=portalDocument();return doc?.querySelector('.template-unified-document')||doc?.scrollingElement;}
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
  async function playPortal(){stop();const run=generation;showPortal();document.documentElement.dataset.reportPlaying='true';for(let i=0;i<30&&!portalDocument()?.querySelector('h1');i++){if(!await wait(200,run))return;}if(!await wait(1500,run))return;await scrollPortal({by:390,duration:2200});document.documentElement.dataset.reportPlaying='false';}
  $('#open').onclick=()=>{stop();showPortal();};back.onclick=reset;focusButton.onclick=()=>{stop();focusEmail(!document.body.classList.contains('email-focus'));};restore.onclick=()=>{stop();focusEmail(false);};zoom.onclick=()=>{stop();focusTable(!portalFocused);};
  window.merchantReport={reset,focusEmail,scrollEmail,showPortal,focusTable,scrollPortal,playEmail,playPortal,stop};
  window.addEventListener('message',event=>{if(event.origin!==location.origin||event.source!==parent||event.data?.type!=='merchant-report')return;const {action,options}=event.data;if(Object.hasOwn(window.merchantReport,action))window.merchantReport[action](options);});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
  state('email');
  // No autoplay timers run by default. The parent deck owns presentation playback.
  const recipe=new URLSearchParams(location.search).get('autoplay');
  if(recipe==='email')playEmail();else if(recipe==='portal')playPortal();
})();
