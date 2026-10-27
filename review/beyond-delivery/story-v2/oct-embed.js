/* Drives the real October assembly. No reconstructed product screens. */
(() => {
  const query = new URLSearchParams(location.search);
  const flow = ['store','sheet','claim','filtered-claim','map','feed','manual','celebration'].includes(query.get('flow')) ? query.get('flow') : 'store';
  const frame = document.querySelector('#prototype');
  const dots=new Map();
  let playing = query.get('autoplay') === '1', generation = 0, running = false, ready = false;
  const status = value => {document.documentElement.dataset.playbackStatus=value;parent.postMessage({type:'deck-autoplay-status', status:value, flow}, location.origin);};
  const signal = () => parent.postMessage({type:'deck-autoplay-ready',flow}, location.origin);
  const rootDoc = () => frame.contentDocument;
  const home = () => rootDoc()?.querySelector('#home-frame')?.contentDocument;
  const go = () => rootDoc()?.querySelector('#go-frame')?.contentDocument;
  const docFor = () => ['store','sheet'].includes(flow) ? home() : go();
  const visible = el => {if(!el||!el.getClientRects().length||getComputedStyle(el).visibility==='hidden'||Number(getComputedStyle(el).opacity)===0||el.closest('.goe2e-layer--hidden'))return false;const r=el.getBoundingClientRect();return r.right>0&&r.left<el.ownerDocument.documentElement.clientWidth&&r.bottom>0&&r.top<el.ownerDocument.documentElement.clientHeight;};
  const byText = (doc, text, selector='button,[role="button"]') => [...(doc?.querySelectorAll(selector) || [])].find(el => visible(el) && el.textContent.trim().replace(/\s+/g,' ').toLowerCase().includes(text.toLowerCase()));
  const delay = async (ms, token) => { let remaining=ms; while(remaining>0){if(token!==generation)throw new Error('reset');await new Promise(r=>setTimeout(r,100));if(playing)remaining-=100;} };
  const waitFor = async (getter, token, limit=15000) => {for(let t=0;t<limit;t+=100){if(token!==generation)throw new Error('reset');const value=getter();if(value)return value;await new Promise(r=>setTimeout(r,100));}throw new Error('Prototype still loading');};
  function install(doc){
    if(!doc || doc.documentElement.dataset.deckOctWired)return;
    doc.documentElement.dataset.deckOctWired='true';
    const css=doc.createElement('style');css.textContent="/* Functional tap marker, matched to references/iphone-tap-dot.png. */\n.deck-autoplay-touch,.phone-tap-cursor {\n  position:fixed;\n  z-index:2147483647;\n  width:84px;\n  height:84px;\n  box-sizing:border-box;\n  margin:-42px 0 0 -42px;\n  border:1px solid rgba(0,0,0,.12);\n  border-radius:50%;\n  background:rgba(255,255,255,.58);\n  box-shadow:0 1px 7px rgba(0,0,0,.22);\n  pointer-events:none;\n}\n.phone-tap-cursor[hidden]{display:none!important}\n.phone-pointer-active,.phone-pointer-active *{cursor:none!important}\n.deck-autoplay-running .phone-tap-cursor{display:none!important}\n.deck-pointer-layer{position:fixed;z-index:2147483646;overflow:hidden;pointer-events:none;border-radius:20px}\n.deck-pointer-layer .deck-autoplay-touch{position:absolute;animation:none!important;opacity:1!important;display:block!important}\n";doc.head.append(css);
    const script=doc.createElement('script');script.src='/review/mailbox-story/runtime/review/shared/touch-interactions.js';doc.head.append(script);
    for(const type of ['pointerdown','touchstart','wheel','keydown'])doc.addEventListener(type,e=>{if(e.isTrusted&&playing){playing=false;clearDots();status('Paused · explore freely');}},{capture:true,passive:true});
  }
  function clearDots(){for(const [doc,dot] of dots){dot.hidden=true;doc.documentElement.classList.remove('deck-autoplay-running');}}
  function halo(el){
    if(!el)return;const doc=el.ownerDocument;install(doc);let dot=dots.get(doc);
    if(!dot){dot=doc.createElement('i');dot.className='deck-autoplay-touch';dot.setAttribute('aria-hidden','true');Object.assign(dot.style,{left:'220px',top:'600px',transition:'left 400ms cubic-bezier(.25,.1,.25,1),top 400ms cubic-bezier(.25,.1,.25,1)'});doc.body.append(dot);dots.set(doc,dot);}
    dot.hidden=false;doc.documentElement.classList.add('deck-autoplay-running');const r=el.getBoundingClientRect();dot.style.left=(r.left+r.width/2)+'px';dot.style.top=(r.top+r.height/2)+'px';return dot;
  }
  async function circle(el,token){
    const dot=halo(el),r=el.getBoundingClientRect();await delay(500,token);
    dot.style.transition='left 100ms linear,top 100ms linear';
    for(let step=0;step<=16;step++){
      const angle=step/16*Math.PI*2;
      dot.style.left=(r.left+r.width/2+Math.min(r.width/2,42)*Math.cos(angle))+'px';
      dot.style.top=(r.top+r.height/2+14*Math.sin(angle))+'px';
      await delay(100,token);
    }
    dot.style.transition='left 400ms cubic-bezier(.25,.1,.25,1),top 400ms cubic-bezier(.25,.1,.25,1)';
  }
  async function tap(getter,token,hold=2200){const el=await waitFor(getter,token);const dot=halo(el);await delay(600,token);if(!matchMedia('(prefers-reduced-motion: reduce)').matches)dot.animate([{transform:'scale(1)'},{transform:'scale(.9)'},{transform:'scale(1)'}],{duration:180});await delay(180,token);el.click();await delay(hold,token);}
  function scrollTo(el){
    if(!el)return;let parent=el.parentElement;while(parent&&!(parent.scrollHeight>parent.clientHeight+10&&/auto|scroll/.test(getComputedStyle(parent).overflowY)))parent=parent.parentElement;
    if(parent){const e=el.getBoundingClientRect(),p=parent.getBoundingClientRect();parent.scrollTo({top:parent.scrollTop+e.top-p.top-100,behavior:'smooth'});}
  }
  function dragSheet(doc,down){const grab=doc.querySelector('.pedregal-snap-sheet__grabber');if(!grab)return;const r=grab.getBoundingClientRect(),win=doc.defaultView,y=r.top+10;grab.dispatchEvent(new win.MouseEvent('mousedown',{bubbles:true,clientX:180,clientY:y}));doc.dispatchEvent(new win.MouseEvent('mousemove',{bubbles:true,clientX:180,clientY:y+(down?650:-650)}));doc.dispatchEvent(new win.MouseEvent('mouseup',{bubbles:true,clientX:180,clientY:y+(down?650:-650)}));}
  async function gesture(el,dx,dy,token,pointer=false){
    const doc=el.ownerDocument,win=doc.defaultView,r=el.getBoundingClientRect();
    const x=r.left+r.width/2,y=r.top+r.height/2,dot=halo(el);
    await delay(600,token);
    const send=(target,type,px,py)=>target.dispatchEvent(pointer?new win.PointerEvent(type,{bubbles:true,clientX:px,clientY:py,pointerId:1,pointerType:'mouse',buttons:type==='pointerup'?0:1}):new win.MouseEvent(type,{bubbles:true,clientX:px,clientY:py,buttons:type==='mouseup'?0:1}));
    send(el,pointer?'pointerdown':'mousedown',x,y);
    dot.style.transition='left 100ms linear,top 100ms linear';
    for(let i=1;i<=12;i++){const px=x+dx*i/12,py=y+dy*i/12;dot.style.left=px+'px';dot.style.top=py+'px';send(pointer?win:doc,pointer?'pointermove':'mousemove',px,py);await delay(100,token);}
    send(pointer?win:doc,pointer?'pointerup':'mouseup',x+dx,y+dy);
    dot.style.transition='left 400ms ease,top 400ms ease';await delay(1200,token);
  }
  function tappablePin(doc,exclude){return [...doc.querySelectorAll('.go-pin')].filter(el=>visible(el)&&el!==exclude).find(el=>{const r=el.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2,hit=doc.elementFromPoint(x,y);return y>110&&y<doc.documentElement.clientHeight*.62&&hit&&(hit===el||el.contains(hit));});}
  async function sequence(token){
    await waitFor(activeScreen,token,25000);install(docFor());
    await delay(1800,token);
    if(flow==='manual'){playing=false;status('Explore freely');return;}
    if(flow==='celebration'){const doc=go();doc.defaultView.dispatchEvent(new doc.defaultView.CustomEvent('go-notification-trigger',{detail:{id:'earned-under-limit-celebration'}}));await delay(2300,token);await tap(()=>doc.querySelector('button[aria-label^="$6 DoorDash credit"]'),token,3500);return;}
    if(flow==='store'){
      const doc=home();
      const heading=[...doc.querySelectorAll('*')].find(el=>el.childElementCount===0&&el.textContent.trim()==='Your past orders');
      if(!heading)throw new Error('Past orders unavailable');
      let section=heading.parentElement;
      while(section&&section.querySelectorAll('img').length<2)section=section.parentElement;
      if(!section)throw new Error('Past orders unavailable');
      const images=section.querySelectorAll('img');let card=images[1]?.parentElement;
      while(card&&card.parentElement&&!/auto|scroll/.test(getComputedStyle(card.parentElement).overflowX))card=card.parentElement;
      if(!card||!card.parentElement)throw new Error('In-store card unavailable');
      const rail=card.parentElement;rail.scrollTo({left:Math.max(0,card.offsetLeft-rail.offsetLeft-18),behavior:'smooth'});await delay(1800,token);
      const badge=[...card.querySelectorAll('*')].find(el=>el.childElementCount===0&&/\$10.*back/i.test(el.textContent));
      await circle(badge||card,token);
      await tap(()=>card,token,2200);
      doc.defaultView.postMessage({type:'storepage-usi:reset'},location.origin);
      await waitFor(()=>{const overlay=doc.querySelector('[data-store-overlay]');return overlay&&Math.abs(overlay.getBoundingClientRect().left)<2&&doc.querySelector('[data-tour="go-usi-deal"]');},token);
      doc.defaultView.postMessage({type:'storepage-usi:scroll-to-deal'},location.origin);await delay(1800,token);
      const switcher=await waitFor(()=>[...doc.querySelectorAll('.oct-fulfillment__segment')].find(el=>/In-store|Going Out/i.test(el.textContent)),token);
      scrollTo(switcher);await delay(1600,token);
      await circle(switcher,token);
      await tap(()=>switcher,token,2800);
    }else if(flow==='sheet'){
      await tap(()=>home()?.querySelector('[data-tour="going-out-tab"]')||byText(home(),'In-Store Rewards','button,[role="button"]')||home()?.querySelector('[aria-label*="In-Store"]'),token,3000);
      const doc=await waitFor(()=>go()?.querySelector('.pedregal-snap-sheet')&&go(),token);install(doc);await waitFor(()=>doc.querySelector('.pedregal-snap-sheet[data-snap="open"]'),token);
      await delay(1800,token);
    }else if(flow==='claim'||flow==='filtered-claim'){
      const doc=go();doc.defaultView.dispatchEvent(new Event('oct-hub-enter'));await delay(1200,token);
      if(flow==='filtered-claim'){
        await tap(()=>byText(doc,'Open now','.go-filter-pill-btn'),token,2000);
        await tap(()=>byText(doc,'Italian','.go-filter-pill-btn'),token,2400);
        await waitFor(()=>doc.querySelector('.go-deal-grid[aria-busy="false"]'),token);
        await tap(()=>doc.querySelector('.go-deal-grid .go-popular-claim-btn'),token,3000);
      }else{
        const deal=await waitFor(()=>doc.querySelector('.go-deals .go-deal-card'),token);scrollTo(deal);await delay(1800,token);
        await tap(()=>deal.querySelector('.go-deal-claim'),token,3000);
      }
      await tap(()=>byText(doc,'View detail'),token,3000);
      const rewards=await waitFor(()=>doc.querySelector('.go-store-overlay--open .go-store-section'),token);
      let scroller=rewards.parentElement;
      while(scroller&&!(scroller.scrollHeight>scroller.clientHeight+10&&/auto|scroll/.test(getComputedStyle(scroller).overflowY)))scroller=scroller.parentElement;
      if(scroller){const r=rewards.getBoundingClientRect(),p=scroller.getBoundingClientRect();scroller.scrollTo({top:scroller.scrollTop+r.top-p.top-Math.max(80,(scroller.clientHeight-r.height)/2),behavior:'smooth'});}
      clearDots();
      await delay(3500,token);
      if(scroller){
        const sections=[...doc.querySelectorAll('.go-store-overlay--open .go-store-section')].slice(1);
        for(const section of sections){
          await delay(100,token);
          const r=section.getBoundingClientRect(),p=scroller.getBoundingClientRect();
          scroller.scrollTo({top:Math.min(scroller.scrollHeight-scroller.clientHeight,scroller.scrollTop+r.top-p.top-100),behavior:'smooth'});
          await delay(3000,token);
        }
        scroller.scrollTo({top:scroller.scrollHeight-scroller.clientHeight,behavior:'smooth'});
      }
      await delay(1600,token);
    }else if(flow==='feed'||flow==='filtered-claim'){
      const doc=go();
      const content=doc.querySelector('.pedregal-snap-sheet__content');
      content.scrollTo({top:240,behavior:'smooth'});await delay(1800,token);
      await tap(()=>byText(doc,'Open now','.go-filter-pill-btn'),token,2000);
      await tap(()=>byText(doc,'Italian','.go-filter-pill-btn'),token,2400);
    }else{
      const doc=go();
      await gesture(await waitFor(()=>doc.querySelector('.pedregal-snap-sheet__grabber'),token),0,520,token);
      const first=await waitFor(()=>tappablePin(doc),token);await tap(()=>first,token,2200);
      await tap(()=>[...doc.querySelectorAll('button[aria-label="Close store preview"]')].find(visible),token,1200);
      await tap(()=>tappablePin(doc,first),token,2200);
      const map=doc.querySelector('.maplibregl-canvas,.mapboxgl-canvas'),win=doc.defaultView;
      const dot=halo(map);dot.style.left='195px';dot.style.top='240px';await delay(600,token);
      map.dispatchEvent(new win.MouseEvent('dblclick',{bubbles:true,cancelable:true,clientX:195,clientY:240}));await delay(2000,token);
      const pager=await waitFor(()=>doc.querySelector('.map-preview-pager__viewport'),token);
      await gesture(pager,-180,0,token,true);
      // Consume the carousel's post-drag click guard on its empty viewport.
      pager.click();
      await tap(()=>doc.querySelector('.map-preview-pager__slide--active button[aria-label="Next photo"]'),token,2200);
    }
  }
  function showInitialPointer(){const doc=docFor();const dot=halo(doc.body);dot.style.transition='none';dot.style.left='310px';dot.style.top=Math.min(620,doc.documentElement.clientHeight-100)+'px';requestAnimationFrame(()=>dot.style.transition='left 400ms ease,top 400ms ease');}
  async function run(){if(!ready||running)return;showInitialPointer();running=true;const token=generation;status('Playing');try{await sequence(token);if(token===generation){playing=false;clearDots();status(flow==='manual'?'Explore freely':'Complete · replay or explore');}}catch(err){if(token===generation){playing=false;clearDots();status(err.message==='reset'?'Ready':`Paused · ${err.message}`);}}finally{if(token===generation)running=false;}}
  function activeScreen(){
    const doc=rootDoc();
    if(!doc?.querySelector('.phone'))return null;
    if(flow==='store'||flow==='sheet'){
      if(doc.querySelector('#home-frame')?.getAttribute('aria-hidden')!=='false')return null;
      const screen=home();
      if(!screen||screen.URL==='about:blank')return null;
      if(flow==='sheet')return screen.querySelector('[data-tour="going-out-tab"]')||byText(screen,'In-Store Rewards')||screen.querySelector('[aria-label*="In-Store"]');
      return [...screen.querySelectorAll('*')].find(el=>el.childElementCount===0&&el.textContent.trim()==='Your past orders');
    }
    if(doc.querySelector('#go-frame')?.getAttribute('aria-hidden')!=='false')return null;
    const screen=go();
    return screen?.URL!=='about:blank'&&screen?.querySelector('.go-page .pedregal-snap-sheet');
  }
  async function prepare(token,previousDoc){
    try{
      const doc=await waitFor(()=>{const current=rootDoc();return current!==previousDoc&&current?.URL!=='about:blank'&&current?.head&&current?.querySelector('.phone')&&current;},token,25000);
      const css=doc.createElement('style');css.textContent='html,body{padding:0!important;margin:0!important;width:100%!important;height:100%!important;overflow:hidden!important}body,main{display:block!important;min-height:0!important}main{padding:0!important;margin:0!important}.intro{display:none!important}.phone{width:100%!important;height:100vh!important;margin:0!important;border:0!important;border-radius:0!important;box-shadow:none!important;transform:none!important}';if(query.get('deckchrome')==='clean')css.textContent+='.phone:after{display:none!important}';doc.head.append(css);frame.contentWindow.dispatchEvent(new Event('resize'));
      await waitFor(activeScreen,token,25000);
      if(flow==='claim'||flow==='feed'||flow==='filtered-claim'){
        go().defaultView.dispatchEvent(new Event('oct-hub-enter'));
        if(flow==='feed'||flow==='filtered-claim'){
          const win=go().defaultView;
          await new Promise(resolve=>win.requestAnimationFrame(()=>win.requestAnimationFrame(resolve)));
          if(token!==generation)throw new Error('reset');
          dragSheet(go(),false);
          await waitFor(()=>go()?.querySelector('.pedregal-snap-sheet[data-snap="open"]'),token,25000);
        }
      }
      if(token!==generation)throw new Error('reset');
      if(['restaurant','home'].includes(query.get('contextual'))){
        const screen=home();
        if(query.get('deckchrome')==='clean'){
          const style=screen.createElement('style');style.textContent='.dynamic-island,div[style*="width: 131px"][style*="height: 40px"],.home-indicator,.reorder-sheet-home-indicator,[data-deck-home-bar]{display:none!important}';screen.head.append(style);
          for(const node of screen.querySelectorAll('div')){const cs=screen.defaultView.getComputedStyle(node);if(cs.height==='5px'&&['134px','140px'].includes(cs.width)&&cs.position==='absolute')node.dataset.deckHomeBar='true';}
          const text=[...screen.querySelectorAll('*')].find(el=>!el.childElementCount&&el.textContent.trim()==='Search DoorDash');
          let footer=text;while(footer&&footer.parentElement){const cs=screen.defaultView.getComputedStyle(footer);if(cs.position==='absolute'&&cs.bottom==='0px'&&cs.zIndex==='100')break;footer=footer.parentElement;}
        }
        const heading=[...screen.querySelectorAll('*')].find(el=>el.childElementCount===0&&el.textContent.trim()==='Your past orders');
        let section=heading?.parentElement;
        while(section&&section.querySelectorAll('img').length<2)section=section.parentElement;
        let card=section?.querySelectorAll('img')[1]?.parentElement;
        while(card&&card.parentElement&&!/auto|scroll/.test(screen.defaultView.getComputedStyle(card.parentElement).overflowX))card=card.parentElement;
        if(card?.parentElement){
          const rail=card.parentElement;rail.scrollLeft=Math.max(0,card.offsetLeft-rail.offsetLeft-18);
          if(query.get('contextual')==='restaurant'){
            card.click();
            await waitFor(()=>screen.querySelector('[data-tour="go-usi-deal"]'),token,15000);
            screen.defaultView.postMessage({type:'storepage-usi:scroll-to-deal'},location.origin);
          }
        }
      }
      install(docFor());
      if(playing)showInitialPointer();
      frame.style.visibility='visible';ready=true;status('Ready');signal();if(playing)run();
    }catch(e){if(token===generation)status('Loading prototype');}
  }
  function load(){const previousDoc=rootDoc();ready=false;frame.style.visibility='hidden';frame.src=`../go-base-oct/?start=${['store','sheet'].includes(flow)?'home':'go'}&runtime=sheet25`;prepare(generation,previousDoc);}
  addEventListener('message',event=>{if(event.origin!==location.origin||event.source!==parent)return;const message=event.data;if(message?.type!=='deck-autoplay')return;if(query.get('contextual')==='restaurant'&&query.get('autoplay')==='0'&&message.action!=='pause')return;if(message.action==='pause'){playing=false;clearDots();status('Paused');}else if(message.action==='reset'){generation++;running=false;playing=true;clearDots();dots.clear();load();}else if(message.action==='play'){playing=true;status('Playing');run();}});
  load();
})();
