/* Compose live source decks inside the shared fixed slide canvas. */
(() => {
 const entries=new Map(),intro=document.querySelector('#intro'),host=document.querySelector('#source-decks');
 const sources={'in-store-rewards':'/review/beyond-delivery/story-v2/content.html','affordable-meals':'/review/affordable-story/content.html'};
 let slides=[],current=0,active=null,enabled=true,advanceTimer;
 const advanceQuestions=new Set(['9','12','14','16']);
 function scheduleAdvance(){
  clearTimeout(advanceTimer);const s=slides[current];
  if(!enabled||document.hidden||s?.deck!=='in-store-rewards'||!advanceQuestions.has(s.sourceId))return;
  const expected=current;advanceTimer=setTimeout(()=>{if(enabled&&!document.hidden&&current===expected)go(current+1);},1300);
 }
 document.addEventListener('visibilitychange',()=>{clearTimeout(advanceTimer);if(!document.hidden)scheduleAdvance();});
 function state(){const s=slides[current];if(s)parent.postMessage({type:'deck-canvas-state',slide:s.id,index:current,autoplayEnabled:enabled},location.origin);}
 function send(entry,message){entry?.frame.contentWindow?.postMessage(message,location.origin);}
 function introSlide(s){
  intro.className=s.id==='prototype-note'?'prototype-note':'';
  if(s.id==='prototype-note')intro.innerHTML='<button class="note-stop" type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor"/><rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor"/></svg><span>Stop autoplay</span></button><h2 data-deck-type="h3">All prototypes are interactive</h2><p data-deck-type="big-subtitle">Stop autoplay to interact.</p>';
  else intro.innerHTML='<h1 data-deck-type="h1">DoorDash<br>Case Studies</h1><nav class="case-links" aria-label="Case studies"><a href="?slide=rewards-1#3" data-deck="in-store-rewards"><span data-deck-type="point-numbers">1</span><span class="case-label" data-deck-type="point-title">In-Store Rewards</span></a><a href="?slide=meals-slide-1#24" data-deck="affordable-meals"><span data-deck-type="point-numbers">2</span><span class="case-label" data-deck-type="point-title">Affordable Meals</span></a></nav>';
 }
 function go(index){
  if(!slides.length)return;
  clearTimeout(advanceTimer);const previousDeck=active;
  current=Math.max(0,Math.min(slides.length-1,index));const s=slides[current];
  for(const [deck,entry] of entries){entry.frame.hidden=deck!==s.deck;if(deck!==s.deck)send(entry,{type:'deck-canvas-visibility',visible:false});}
  active=s.deck||null;intro.hidden=s.kind!=='intro';
  if(s.kind==='intro')introSlide(s);
  else{
   let entry=entries.get(s.deck);
   if(!entry){
    const frame=document.createElement('iframe');frame.title=s.deck==='in-store-rewards'?'In-Store Rewards source deck':'Affordable Meals source deck';
    entry={frame,ready:false,pending:s.sourceIndex};entries.set(s.deck,entry);
    const url=new URL(sources[s.deck],location.origin);url.searchParams.set('canvas','1');url.searchParams.set('master','1');url.searchParams.set('revision','autoplay28');url.searchParams.set('autoplay',enabled?'1':'0');url.searchParams.set('slide',s.sourceId);url.hash=String(s.sourceIndex+1);frame.src=url.href;host.append(frame);
   }
   entry.frame.hidden=false;entry.pending=s.sourceIndex;
   if(entry.ready){send(entry,{type:'deck-canvas-autoplay-set',enabled});send(entry,{type:'deck-canvas-go',slide:s.sourceId,index:s.sourceIndex});if(previousDeck!==s.deck)send(entry,{type:'deck-canvas-visibility',visible:true});}
  }
  const url=new URL(location.href);url.searchParams.set('slide',s.id);url.hash=String(current+1);history.replaceState(null,'',url);state();scheduleAdvance();
 }
 intro.addEventListener('click',event=>{if(event.target.closest('.note-stop')){enabled=false;for(const entry of entries.values())send(entry,{type:'deck-canvas-autoplay-set',enabled:false});clearTimeout(advanceTimer);state();return;}const link=event.target.closest('a[data-deck]');if(!link)return;event.preventDefault();go(slides.findIndex(s=>s.deck===link.dataset.deck));});
 addEventListener('message',event=>{
  if(event.origin!==location.origin)return;
  if(event.source===parent){
   if(event.data?.type==='deck-canvas-go')go(event.data.index);
   else if(event.data?.type==='deck-canvas-autoplay'){if(active)send(entries.get(active),event.data);else{enabled=!enabled;state();scheduleAdvance();}}
   return;
  }
  const match=[...entries].find(([,entry])=>entry.frame.contentWindow===event.source);
  if(!match)return;
  if(event.data?.type==='deck-canvas-step'){if(match[0]===active)go(event.data.edge==='first'?0:event.data.edge==='last'?slides.length-1:current+Number(event.data.delta||0));return;}
  if(event.data?.type!=='deck-canvas-state')return;
  const [deck,entry]=match;const firstReady=!entry.ready;entry.ready=true;
  if(firstReady&&event.data.autoplayEnabled!==enabled){entry.awaitingAutoplay=enabled;send(entry,{type:'deck-canvas-autoplay-set',enabled});}
  if(deck!==active)return;
  if(entry.pending!==null&&Number(event.data.index)!==entry.pending){const s=slides[current];send(entry,{type:'deck-canvas-go',slide:s.sourceId,index:s.sourceIndex});return;}
  entry.pending=null;
  const index=slides.findIndex(s=>s.deck===deck&&s.sourceId===String(event.data.slide));
  if(index<0)return;
  current=index;
  if(entry.awaitingAutoplay!==undefined){if(event.data.autoplayEnabled===entry.awaitingAutoplay)entry.awaitingAutoplay=undefined;}
  else if(!firstReady&&typeof event.data.autoplayEnabled==='boolean'&&enabled!==event.data.autoplayEnabled){enabled=event.data.autoplayEnabled;scheduleAdvance();}
  const url=new URL(location.href);url.searchParams.set('slide',slides[current].id);url.hash=String(current+1);history.replaceState(null,'',url);state();scheduleAdvance();
 });
 document.addEventListener('keydown',event=>{
  if(event.target.closest('input,textarea,select,[contenteditable="true"]'))return;
  if(['ArrowRight','ArrowDown','PageDown',' '].includes(event.key)){event.preventDefault();go(current+1);}
  else if(['ArrowLeft','ArrowUp','PageUp'].includes(event.key)){event.preventDefault();go(current-1);}
 });
 fetch('/deck-template/slide-manifest.json?v=1').then(r=>r.json()).then(manifest=>{
  slides=window.DeckMasterSlides(manifest);const id=new URL(location.href).searchParams.get('slide');const index=slides.findIndex(s=>s.id===id);go(index>=0?index:0);
 }).catch(()=>{intro.innerHTML='<h2>Unable to load case studies.</h2>';});
})();
