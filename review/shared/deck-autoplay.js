/* Deck-only demonstration controller. Source prototypes remain independently editable. */
(() => {
  if (window.DeckAutoplay) return;
  const ROOT = '/review/shared/';
  const MEALS_DECK = /^\/review\/affordable-story\/(?:index\.html)?$/.test(location.pathname);
  const PREFERENCE_KEY = 'affordable-meals-deck-autoplay';
  let enabled = false, controller, flows = [], lastKey = '', pausedKey = '', status, toggle, replay;
  const bound = new WeakSet(), styled = new WeakSet(), activeDocs = new Set(), originalURLs = new WeakMap();
  const pointers = new Map();
  const abort = () => new DOMException('Autoplay stopped', 'AbortError');
  function stop(keepPointer = false) {
    controller?.abort(); controller = null;
    activeDocs.forEach(doc => { doc.documentElement.classList.remove('deck-autoplay-running'); if(!keepPointer)doc.querySelectorAll('.deck-autoplay-touch').forEach(el => el.remove()); });activeDocs.clear();
    if(!keepPointer){pointers.forEach(p=>p.layer.remove());pointers.clear();}
  }
  function wait(ms, signal) {
    return new Promise((resolve, reject) => {
      if (signal.aborted) return reject(abort());
      const cancel = () => { clearTimeout(timer); reject(abort()); };
      const timer = setTimeout(() => { signal.removeEventListener('abort', cancel); resolve(); }, ms);
      signal.addEventListener('abort', cancel, {once:true});
    });
  }
  function visible(el) {
    if (!el?.isConnected || el.closest('[hidden],[inert],[aria-hidden="true"]')) return false;
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return false;
    for (let p = el; p; p = p.parentElement) {
      const style = p.ownerDocument.defaultView.getComputedStyle(p);
      if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) return false;
    }
    return true;
  }
  function frameVisible(frame) {
    if (!visible(frame)) return false;
    const r = frame.getBoundingClientRect(), win = frame.ownerDocument.defaultView;
    return r.bottom > 0 && r.right > 0 && r.top < win.innerHeight && r.left < win.innerWidth;
  }
  function manual(event) {
    if (!event.isTrusted || event.target.closest?.('#deck-autoplay-controls,#deck-autoplay-replay')) return;
    if (!enabled) return;
    pausedKey = contextKey(); stop(); status.textContent = 'Paused · manual control';
  }
  function setupDocument(doc) {
    if (!bound.has(doc)) {
      bound.add(doc);
      ['pointerdown','keydown','wheel','touchstart'].forEach(type => doc.addEventListener(type, manual, {capture:true, passive:true}));
    }
    if (!styled.has(doc)) {
      styled.add(doc); const link = doc.createElement('link'); link.rel = 'stylesheet'; link.href = ROOT + 'deck-autoplay.css'; doc.head?.append(link);
      const pointer=doc.createElement('link');pointer.rel='stylesheet';pointer.href=ROOT+'phone-pointer.css';doc.head?.append(pointer);
    }
    if (enabled && controller && !controller.signal.aborted) {doc.documentElement.classList.add('deck-autoplay-running'); activeDocs.add(doc);}
  }
  function documents(frame) {
    const result = [];
    function visit(doc) {
      if (!doc?.documentElement) return;
      setupDocument(doc); result.push(doc);
      doc.querySelectorAll('iframe').forEach(child => {if (frameVisible(child)) {try {visit(child.contentDocument);} catch { /* External demos are excluded. */ }}});
    }
    try { if (frameVisible(frame)) visit(frame.contentDocument); } catch { /* Same-origin only. */ }
    return result;
  }
  function contextKey() {
    const walk = document.querySelector('#consumer-walk');
    return (new URL(location.href).searchParams.get('slide') || location.hash) + ':' + (walk && visible(walk) ? walk.dataset.step : '');
  }
  function frames() { return [...document.querySelectorAll('#consumer-walk iframe,#slide iframe')].filter(frameVisible); }
  function check(signal, key, frame) {
    if (signal.aborted || !enabled || contextKey() !== key || !frameVisible(frame) || document.hidden) throw abort();
  }
  async function target(frame, step, signal, key) {
    const deadline = performance.now() + (step.timeout || 10000);
    while (performance.now() < deadline) {
      check(signal,key,frame);
      for (const doc of documents(frame)) {
        if (step.document && !doc.location.href.includes(step.document)) continue;
        const matches = [...doc.querySelectorAll(step.selector)].filter(el => visible(el) && !el.disabled && el.getAttribute('aria-disabled') !== 'true');
        const el = matches.find(el => !step.text || new RegExp(step.text,'i').test((el.textContent || '').trim() + ' ' + (el.getAttribute('aria-label') || '')));
        if (el) return el;
      }
      await wait(150,signal);
    }
    throw new Error('Waiting for ' + step.selector);
  }
  function isWebsiteFrame(frame){
    return flowFor(frame)?.pointer==='arrow' || /\/meal-box-local\/|\/merchant-report\//.test(frame.getAttribute('src')||'') || !!frame.closest('.mp-enrollment-screen,.report-prototype');
  }
  function pointer(frame){
    let p=pointers.get(frame);const r=frame.getBoundingClientRect();
    const website=isWebsiteFrame(frame);
    if(!p){const layer=document.createElement('div'),dot=document.createElement('i');layer.className='deck-pointer-layer';layer.setAttribute('aria-hidden','true');dot.className='deck-autoplay-touch';layer.append(dot);document.body.append(layer);p={layer,dot,x:r.width*.58,y:r.height*.72};pointers.set(frame,p);}
    p.dot.classList.toggle('deck-autoplay-arrow',website);
    Object.assign(p.layer.style,{left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px'});
    const size=website?24:84*r.width/(frame.clientWidth||393);
    Object.assign(p.dot.style,{width:size+'px',height:(website?32:size)+'px',margin:website?'0':`-${size/2}px 0 0 -${size/2}px`,left:p.x+'px',top:p.y+'px'});return p;
  }
  function pointFor(frame,el){
    const r=el.getBoundingClientRect();let x=r.left+r.width/2,y=r.top+r.height/2,w=el.ownerDocument.defaultView;
    while(w!==window){const f=w.frameElement;if(!f)break;const b=f.getBoundingClientRect();x=b.left+x*b.width/(f.clientWidth||b.width);y=b.top+y*b.height/(f.clientHeight||b.height);w=f.ownerDocument.defaultView;}
    const b=frame.getBoundingClientRect();return {x:Math.max(25,Math.min(b.width-25,x-b.left)),y:Math.max(25,Math.min(b.height-25,y-b.top))};
  }
  async function move(frame,to,signal,duration=400){
    const p=pointer(frame),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    const a=p.dot.animate([{left:p.x+'px',top:p.y+'px'},{left:to.x+'px',top:to.y+'px'}],{duration:reduced?0:duration,easing:'cubic-bezier(.25,.1,.25,1)',fill:'forwards'});
    const cancel=()=>a.cancel();signal.addEventListener('abort',cancel,{once:true});
    try{await wait(reduced?0:duration,signal);p.x=to.x;p.y=to.y;p.dot.style.left=p.x+'px';p.dot.style.top=p.y+'px';}finally{a.cancel();signal.removeEventListener('abort',cancel);}
  }
  async function exitFrame(frame,signal){
    const p=pointer(frame),r=frame.getBoundingClientRect();
    const size=p.dot.getBoundingClientRect().width;
    const x=p.x<r.width/2?-size:r.width+size;
    await move(frame,{x,y:p.y},signal,650);
    p.layer.classList.add('is-complete');
  }
  async function touch(frame,el,signal){
    await move(frame,pointFor(frame,el),signal);
    const p=pointer(frame),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    const a=p.dot.animate([{transform:'scale(1)'},{transform:'scale(.9)'},{transform:'scale(1)'}],{duration:reduced?0:180});
    try{await wait(reduced?0:180,signal)}finally{a.cancel()}
  }
  async function swipe(frame,signal,horizontal,perform,reverse=false){
    const r=frame.getBoundingClientRect(),direction=reverse?-1:1;
    const start={x:r.width*(horizontal?.78:.65),y:r.height*(horizontal?.54:.73)};
    await move(frame,start,signal);perform();
    await move(frame,{x:start.x-(horizontal?r.width*.5*direction:0),y:start.y-(horizontal?0:r.height*.38*direction)},signal,650);
  }
  async function action(frame, step, signal, key) {
    // Keep explicit reading holds; trim idle gaps between gestures.
    await wait(step.action === 'hold' ? (step.delay ?? 1400) : (step.delay ?? 1400)*.68,signal); check(signal,key,frame);
    if (step.action === 'hold') return;
    if (step.action === 'scrollPage') {
      const docs = documents(frame), doc = docs.find(d => !step.document || d.location.href.includes(step.document));
      if (!doc) throw new Error('Local document unavailable');
      const scroller = isWebsiteFrame(frame) ? doc.scrollingElement : ([...doc.querySelectorAll('body,div,main,section')].find(el => el.clientHeight > 150 && el.scrollHeight > el.clientHeight + 100 && /auto|scroll/.test(doc.defaultView.getComputedStyle(el).overflowY)) || doc.scrollingElement);
      const before = scroller.scrollTop;
      const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      const cancelScroll = () => scroller.scrollTo({top:scroller.scrollTop,behavior:'instant'});
      signal.addEventListener('abort',cancelScroll,{once:true});
      try {
        if(isWebsiteFrame(frame)){
          const r=frame.getBoundingClientRect();
          await move(frame,{x:r.width*.72,y:r.height*.58},signal);
          scroller.scrollBy({top:step.amount || 320,behavior:reduced ? 'instant' : 'smooth'});
          await wait(reduced?0:850,signal);
        } else await swipe(frame,signal,false,()=>scroller.scrollBy({top:step.amount || 320,behavior:reduced ? 'instant' : 'smooth'}),(step.amount||320)<0);
      }
      finally {signal.removeEventListener('abort',cancelScroll);}
      if (Math.abs(scroller.scrollTop - before) < 1) throw new Error('No scroll movement in ' + (step.document || 'preview'));
      return;
    }
    const el = await target(frame,step,signal,key);
    if(step.action==='scrollTo'||step.action==='scrollHorizontal'||step.action==='scrollEnd'||step.action==='scrollElement'){
      const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
      const perform=()=>{if(step.action==='scrollElement')el.scrollBy({top:step.amount||320,behavior:reduced?'instant':'smooth'});
      else if(step.action==='scrollEnd')el.scrollTo({top:el.scrollHeight,behavior:reduced?'instant':'smooth'});
      else if(step.action==='scrollTo')el.scrollIntoView({block:'center',inline:'nearest',behavior:reduced?'instant':'smooth'});
      else el.scrollBy({left:step.amount||160,behavior:reduced?'instant':'smooth'});};
      if(isWebsiteFrame(frame)){await move(frame,pointFor(frame,el),signal);perform();}
      else await swipe(frame,signal,step.action==='scrollHorizontal',perform,step.action==='scrollTo'&&el.getBoundingClientRect().top<0);
      await wait(reduced?0:180,signal);check(signal,key,frame);return;
    }
    el.scrollIntoView({block:'nearest',inline:'nearest',behavior:'instant'});
    await wait(80,signal); check(signal,key,frame);
    await touch(frame,el,signal); check(signal,key,frame);
    if (step.action === 'input') {
      const win = el.ownerDocument.defaultView;
      const setter = Object.getOwnPropertyDescriptor(win.HTMLInputElement.prototype,'value').set;
      const text = String(step.value);
      const values = matchMedia('(prefers-reduced-motion: reduce)').matches ? [text] : [...text].map((_,index) => text.slice(0,index+1));
      for (const value of values) {
        check(signal,key,frame); setter.call(el,value);
        el.dispatchEvent(new win.Event('input',{bubbles:true}));
        if (values.length > 1) await wait(70,signal);
      }
      el.dispatchEvent(new win.Event('change',{bubbles:true}));
    } else el.click();
  }
  function flowFor(frame) {
    if(frame.dataset.autoplay==='off')return undefined;
    const walk = frame.closest('#consumer-walk')?.dataset.step;
    return flows.find(flow => flow.walk?.includes(walk)) || flows.find(flow => flow.path && frame.src.includes(flow.path));
  }
  async function runFrame(frame, flow, signal, key) {
    // Use this current, visible demo in place. Slide changes cancel old actions.
    let entry = originalURLs.get(frame);
    // The master iframe can navigate in place, leaving its src on an older
    // slide. Replay must use the authored entry for the current slide.
    const walk=frame.closest('#consumer-walk')?.dataset.step;
    const authoredURL=window.DECK_PROTOTYPES?.[walk] || frame.getAttribute('src');
    if (!entry || entry.key !== key) {entry = {key,url:authoredURL};originalURLs.set(frame,entry);}
    const initialURL = entry.url;
    if (!initialURL || new URL(initialURL,location.href).origin !== location.origin) return;
    const preserve=flow.preserveState||frame.dataset.preserveAutoplay===frame.closest("#consumer-walk")?.dataset.step;
    // Slide navigation already selected the live screen. Never reload it just
    // because autoplay was enabled: that causes a blank flash and loses state.
    if(!preserve){const master=frame.contentWindow?.ConsumerFlow;const state=new URL(initialURL,location.href).searchParams.get('state');if(master&&state&&master.state!==state)master.navigate(state);}
    delete frame.dataset.preserveAutoplay;
    pointer(frame).layer.classList.remove('is-complete');
    await wait(1000,signal);
    for (const step of flow.steps) {
      try {await action(frame,step,signal,key);} catch (error) {
        if (error.name === 'AbortError') throw error;
        if (!step.optional) throw new Error(flow.name + ' · ' + error.message);
      }
    }
    check(signal,key,frame);
    await exitFrame(frame,signal);
  }
  async function start(key) {
    stop(true); if (!enabled || pausedKey === key || document.hidden) return;
    pointers.forEach((p,frame)=>{if(!frameVisible(frame)){p.layer.remove();pointers.delete(frame)}});
    controller = new AbortController(); const signal = controller.signal;
    status.textContent = 'Preparing demo…'; status.removeAttribute('title');
    try {
      await wait(700,signal);
      const jobs = frames().map(frame => ({frame,flow:flowFor(frame)})).filter(job => job.flow);
      if (!jobs.length) {stop();status.textContent = 'Static slide · no scripted demo';return;}
      status.textContent = 'Playing · touch to take over';
      const results = await Promise.allSettled(jobs.map(({frame,flow}) => runFrame(frame,flow,signal,key)));
      if (signal.aborted || key !== contextKey()) return;
      const failure = results.find(result => result.status === 'rejected' && result.reason.name !== 'AbortError');
      status.textContent = failure ? 'Paused · demo control unavailable' : 'Demo complete · Replay';
      if (failure) {status.title = failure.reason.message; console.info('[Deck autoplay]',failure.reason.message);}
      stop(!failure);
    } catch (error) {if (error.name !== 'AbortError') {status.textContent = 'Autoplay unavailable';stop();}}
  }
  function setEnabled(value) {
    enabled = !!value; pausedKey = ''; toggle.setAttribute('aria-pressed',String(enabled));toggle.textContent = enabled ? 'Turn Prototype Autoplay Off' : 'Turn Prototype Autoplay On';
    replay.hidden = !enabled;
    if (enabled) start(contextKey());else {stop();status.textContent = 'Manual';}
  }
  async function init() {
    const css = document.createElement('link');css.rel='stylesheet';css.href=ROOT+'deck-autoplay.css';document.head.append(css);
    const pointerCSS=document.createElement('link');pointerCSS.rel='stylesheet';pointerCSS.href=ROOT+'phone-pointer.css';document.head.append(pointerCSS);
    window.addEventListener('resize',()=>pointers.forEach((p,frame)=>pointer(frame)));
    const controls = document.createElement('div');controls.id='deck-autoplay-controls';controls.innerHTML='<button type="button" id="deck-autoplay-toggle" aria-pressed="false">Autoplay off</button><button type="button" id="deck-autoplay-replay" hidden>Replay</button><span id="deck-autoplay-status" role="status">Manual</span>';
    (document.querySelector('#workspace > header') || document.body).append(controls);
    toggle=controls.querySelector('#deck-autoplay-toggle');replay=controls.querySelector('#deck-autoplay-replay');status=controls.querySelector('#deck-autoplay-status');
    toggle.onclick=()=>{setEnabled(!enabled);if(MEALS_DECK)try{sessionStorage.setItem(PREFERENCE_KEY,enabled?'on':'off');}catch{}};replay.onclick=()=>{
      stop();pausedKey='';
      frames().forEach(frame=>{if(!flowFor(frame))return;const walk=frame.closest('#consumer-walk')?.dataset.step;const entry=window.DECK_PROTOTYPES?.[walk] || originalURLs.get(frame)?.url || frame.getAttribute('src');if(entry)frame.src=entry;});
      start(contextKey());
    };
    document.addEventListener('pointerdown',manual,true);document.addEventListener('keydown',manual,true);document.addEventListener('wheel',manual,{capture:true,passive:true});
    try {const response=await fetch(ROOT+'autoplay-flows.json');if(!response.ok)throw Error('Flows missing');flows=(await response.json()).flows;} catch {status.textContent='Autoplay unavailable';toggle.disabled=true;return;}
    lastKey=contextKey();
    setInterval(()=>{
      const key=contextKey();
      if(key!==lastKey){lastKey=key;pausedKey='';if(enabled)start(key);}
      if(enabled&&controller)frames().forEach(documents);
    },150);
    document.addEventListener('visibilitychange',()=>{if(document.hidden){stop();if(enabled){pausedKey=contextKey();status.textContent='Paused · tab hidden';}}});
    if(MEALS_DECK){let choice;try{choice=sessionStorage.getItem(PREFERENCE_KEY);}catch{}setEnabled(choice!=='off');}
  }
  window.DeckAutoplay={setEnabled, pause:()=>{pausedKey=contextKey();stop();if(status)status.textContent='Paused';}, replay:()=>{pausedKey='';if(enabled)start(contextKey());}, get enabled(){return enabled;}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
