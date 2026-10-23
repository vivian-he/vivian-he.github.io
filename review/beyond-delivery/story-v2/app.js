/* Rewards content and prototype adapters on the Affordable Meals presentation shell. */
const $=s=>document.querySelector(s);
const esc=v=>String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const query=new URLSearchParams(location.search), review=query.get('mode')==='review';
const PREFERENCE='rewards-prototype-autoplay';
// Retain up to three live phone scenes; navigating the deck must not reboot a prototype.
const phoneScenes=new Map();
let slides=[],current=0,resizeObserver,autoplayEnabled=true,playback='idle',manuallyStopped=false,manuallyStarted=false;
if(query.get('autoplay')!=='1')try{autoplayEnabled=query.get('autoplay')==='0'?false:sessionStorage.getItem(PREFERENCE)!=='off';}catch{}
const labels=['DashPass In-store rewards','Membership context','Claim, pay, earn','Where we started','My role','Discovery Gaps','What didn’t work','Consumer mental model','How do I know?','Familiar restaurants','Benefits home','Why should I care?','Familiarity & relevance','How does it work?','Timely education','Where can I use this?','Browse the options','Celebrate the reward','A personal next visit','Results','Map-first directions','Map use cases','Thank you'];
const chapters=[{start:0,title:'Context & scope'},{start:5,title:'Problem & approach'},{start:8,title:'Consumer experience'},{start:19,title:'Learning & vision'}];
const demoURL=src=>{const url=new URL(src,location.href);url.searchParams.set('autoplay','0');url.searchParams.set('deckRuntime','sheet25');return url.href;};
const shouldPlay=()=>!document.hidden&&!manuallyStopped&&(autoplayEnabled||manuallyStarted);
const send=action=>$('#slide .phone iframe')?.contentWindow.postMessage({type:'deck-autoplay',action},location.origin);
function playbackState(state){playback=state;syncPlayback();}
function syncPlayback(){
 const s=slides[current];if(!s)return;
 const available=!!(s.autoplay||s.phoneVideo),playing=['playing','loading'].includes(playback);
 $('#deck-autoplay-toggle').setAttribute('aria-pressed',String(autoplayEnabled));
 $('#deck-autoplay-toggle').textContent=autoplayEnabled?window.DeckTemplate.labels.autoplayOn:window.DeckTemplate.labels.autoplayOff;
 const context=$('#slide .contextual-playing'),replay=$('#slide .contextual-replay');
 if(context&&replay)window.DeckTemplate.playbackState({playing:context,replay},playback,available);
 $('#deck-autoplay-status').textContent=available?({loading:'Preparing prototype',playing:'Prototype auto-playing',paused:'Paused · Replay',complete:'Demo complete',ready:'Ready · Replay'}[playback]||''):'';
}
function stopCurrent(){manuallyStopped=true;send('pause');$('#slide .media-phone video')?.pause();playbackState('paused');}
function replayCurrent(){manuallyStopped=false;manuallyStarted=true;playbackState('loading');const video=$('#slide .media-phone video');if(video){video.currentTime=0;video.play().then(()=>playbackState('playing')).catch(()=>playbackState('paused'));}else send('reset');}
function toggleAutoplay(){autoplayEnabled=!autoplayEnabled;try{sessionStorage.setItem(PREFERENCE,autoplayEnabled?'on':'off');}catch{}if(!autoplayEnabled)stopCurrent();else{manuallyStopped=false;const video=$('#slide .media-phone video');if(video)video.play().then(()=>playbackState('playing')).catch(()=>playbackState('paused'));else if(slides[current].autoplay){playbackState('loading');send('play');}}syncPlayback();}
function stopMedia(){send('pause');document.querySelectorAll('#slide video').forEach(video=>video.pause());}
function renderOutline(){
 $('#outline nav').innerHTML=window.DeckTemplate.outlineMarkup(slides.map((s,i)=>({label:labels[Number(s.id)-1]||s.title.replaceAll('\n',' '),group:[...chapters].reverse().find(ch=>Number(s.id)-1>=ch.start)?.title||''})),current,{includeHeading:false});
 $('#outline nav').querySelectorAll('button').forEach(b=>b.onclick=()=>{go(+b.dataset.index);if(innerWidth<=760)setOutline(false);});
 $('#outline-count').textContent=slides.length+' slides';
}
function setOutline(open){document.body.classList.toggle('no-outline',!open);$('#toggle').setAttribute('aria-expanded',String(open));}
const paragraphs=t=>esc(t).replaceAll('\n','<br>');
function panel(p){return '<figure class="asset-panel">'+(p.image?'<img src="'+esc(p.image)+'" alt="'+esc(p.label)+'">':'<div class="capture"><strong>'+esc(p.placeholder||'Original screen')+'</strong></div>')+'<figcaption data-deck-type="small-subtitle">'+esc(p.label)+(p.reason?'<span class="panel-reason">'+esc(p.reason)+'</span>':'')+(p.status?'<small>'+esc(p.status)+'</small>':'')+'</figcaption></figure>'}
function cleanStatus(s){return s.cleanStatus?'<div class="media-status" aria-hidden="true"><b>9:41</b><i class="media-island"></i><span class="media-signals"><svg viewBox="0 0 48 20"><path d="M1 18V13h4v5zm7 0V9h4v9zm7 0V5h4v13zm7 0V1h4v17z"/><path d="M30 6q8-8 16 0l-2 2q-6-6-12 0zm4 4q4-4 8 0l-2 2q-2-2-4 0zm3 4h2v3h-2z"/></svg><i class="media-battery"></i></span></div>':'';}
function visual(s){
 if(s.resultGroups&&query.get('master')==='1'){
  const draft=[['88%','Claim rate<br>increase'],['24%','Active order<br>rate'],['34%','First-time user<br>conversion'],['51%','Returning user<br>conversion']];
  return '<div class="results-groups master-result-grid">'+[0,2].map(start=>'<article class="result-pair">'+draft.slice(start,start+2).map(([value,label])=>'<div><strong data-deck-type="percentage">'+value.replace('%','<span data-percentage-sign>%</span>')+'</strong><p data-deck-type="big-subtitle">'+label+'</p></div>').join('')+'</article>').join('')+'<small class="result-draft-note" data-deck-type="small-subtitle">Draft figures · confirm before sharing.</small></div>';
 }
 if(s.resultGroups)return '<div class="results-groups">'+s.resultGroups.map(g=>'<article><h3 data-deck-type="point-title">'+esc(g.title)+'</h3><div class="result-pair">'+g.stats.map(x=>'<div><strong data-deck-type="'+(/\d/.test(x.value)?'percentage':'small-subtitle')+'">'+esc(x.value).replace('%','<span data-percentage-sign>%</span>')+'</strong><p data-deck-type="big-subtitle">'+esc(x.label)+'<em data-deck-type="small-subtitle">'+esc(x.detail)+'</em></p></div>').join('')+'</div></article>').join('')+'</div>';
 if(s.phoneVideo)return '<div class="phone media-phone"><video src="'+esc(s.phoneVideo)+'" poster="assets/dashpass-membership-source.png" muted playsinline preload="auto" aria-label="DashPass benefits"></video>'+cleanStatus(s)+'</div>';
 if(s.videos)return '<div class="future-video-grid" style="--columns:'+s.videos.length+'">'+s.videos.map(v=>'<figure><button class="concept-screen" aria-label="Play '+esc(v.label)+'" aria-pressed="false"><video src="'+esc(v.src)+'" muted loop playsinline preload="metadata" aria-label="'+esc(v.label)+'"></video><img class="concept-poster" src="'+esc(v.poster)+'" alt="'+esc(v.label)+' preview">'+(v.island?'<i class="concept-island" aria-hidden="true"></i>':'')+'</button><figcaption><strong>'+esc(v.label)+'</strong>'+(v.description?'<span>'+esc(v.description)+'</span>':'')+'</figcaption></figure>').join('')+'</div>';
 if(s.phoneImage)return '<div class="phone media-phone"><img src="'+esc(s.image)+'" alt="'+esc(s.title)+'">'+cleanStatus(s)+'</div>';
 if(s.blankPhone)return '<div class="phone blank-phone" aria-label="Benefits home asset placeholder"></div>';
 if(s.sheetDetails)return '<div class="sheet-annotated"><div class="annotated-capture"><img src="assets/go-sheet-top-source.png" alt="Go Base October sheet"><i style="top:17%;height:7%" data-number="1"></i><i style="top:34%;height:16%" data-number="2"></i><i style="top:53%;height:24%" data-number="3"></i><i style="top:81%;height:18%" data-number="4"></i></div><ol><li><b>1</b> A DashPass benefit</li><li><b>2</b> Daily deals</li><li><b>3</b> Trending places</li><li><b>4</b> National favorites</li></ol></div>';

 if(s.contextItems)return '<ol class="context-list">'+s.contextItems.map((text,i)=>'<li><span>'+String(i+1)+'</span><strong>'+esc(text)+'</strong></li>').join('')+'</ol>';
 if(s.demo)return '<div class="phone"><iframe title="'+esc(s.title.replaceAll('\n',' '))+' interactive prototype" src="'+esc(demoURL(s.demo))+'"></iframe></div>'+(s.callouts?'<div class="callouts">'+s.callouts.map(x=>'<span>'+esc(x)+'</span>').join('')+'</div>':'')+(s.label?'<span class="source-label">'+esc(s.label)+'</span>':'');
 if(s.panels)return '<div class="visual-grid" style="--columns:'+s.panels.length+'">'+s.panels.map(panel).join('')+'</div>';
 if(s.concepts)return '<div class="future-grid" style="--columns:'+s.concepts.length+'">'+s.concepts.map(p=>'<article class="concept"><a href="'+esc(p.url)+'" target="_blank" rel="noopener"><img src="'+esc(p.image)+'" alt="'+esc(p.label)+'"></a><h3>'+esc(p.label)+'</h3></article>').join('')+'</div>'+(s.label?'<span class="source-label">'+esc(s.label)+'</span>':'');
 if(s.image&&s.crop)return '<div class="image-crop"><img src="'+esc(s.image)+'" alt="AI for You recommendation carousel"></div>'+(s.label?'<span class="source-label">'+esc(s.label)+'</span>':'');
 if(s.image)return '<img class="asset" src="'+esc(s.image)+'" alt="'+esc(s.title.replaceAll('\n',' '))+'">'+(s.label?'<span class="source-label">'+esc(s.label)+'</span>':'');
 if(s.steps)return '<div class="steps">'+s.steps.map((c,i)=>'<article class="step"><span>'+(i+1)+'</span><h3>'+esc(c.title)+'</h3>'+(c.body?'<p>'+esc(c.body)+'</p>':'')+'</article>').join('')+'</div>';
 if(s.cards)return '<div class="cards" style="--columns:'+s.cards.length+'">'+s.cards.map((c,i)=>'<article class="card"><small>'+(i+1)+'</small><h3>'+esc(c.title)+'</h3>'+(c.body?'<p>'+esc(c.body)+'</p>':'')+'</article>').join('')+'</div>'+(s.label?'<span class="source-label">'+esc(s.label)+'</span>':'');
 if(s.placeholder)return '<div class="capture"><strong>'+esc(s.placeholder)+'</strong><small>Asset to add</small></div>';
 return '';
}

function go(i){
 stopMedia();resizeObserver?.disconnect();window.scrollTo({top:0,left:0,behavior:'instant'});
 current=Math.max(0,Math.min(slides.length-1,i));const s=slides[current];manuallyStopped=false;manuallyStarted=false;playback='idle';
 const previous=$('#slide');
 if(previous.dataset.liveScene){previous.hidden=true;previous.querySelector('.contextual-replay')?.removeAttribute('id');previous.removeAttribute('id');}else previous.remove();
 let scene=phoneScenes.get(s.id),reused=!!scene;
 if(!scene){scene=document.createElement('main');scene.setAttribute('aria-live','polite');$('#workspace header').after(scene);if(s.demo){scene.dataset.liveScene=s.id;phoneScenes.set(s.id,scene);}}
 else{phoneScenes.delete(s.id);phoneScenes.set(s.id,scene);}
 scene.id='slide';scene.hidden=false;const replayButton=scene.querySelector('.contextual-replay');if(replayButton)replayButton.id='deck-autoplay-replay';
 // Bound memory while keeping the most recently used device scenes ready.
 while(phoneScenes.size>3){const [oldId,oldScene]=phoneScenes.entries().next().value;oldScene.remove();phoneScenes.delete(oldId);}

 const url=new URL(location.href);url.searchParams.set('slide',s.id);url.hash=String(current+1);history.replaceState(null,'',url);
 renderOutline();const reviewURL=new URL(location.href);if(review)reviewURL.searchParams.delete('mode');else reviewURL.searchParams.set('mode','review');$('#review-link').href=reviewURL.href;const commentsURL=new URL(location.href);commentsURL.port=query.get('feedback')==='1'?'8002':'8004';commentsURL.searchParams.delete('mode');if(query.get('feedback')==='1'){commentsURL.searchParams.delete('feedback');$('#comments-link').textContent='Presentation version';}else commentsURL.searchParams.set('feedback','1');$('#comments-link').href=commentsURL.href;$('#slide').className=s.layout+(s.resultGroups&&query.get('master')==='1'?' master-results':'');
 if(!reused){
 $('#slide').innerHTML='<section class="copy"><div class="eyebrow">'+esc(s.chapter)+'</div><h1>'+paragraphs(s.title)+'</h1>'+(s.body?'<p class="body">'+paragraphs(s.body)+'</p>':'')+'</section><section class="stage">'+visual(s)+'</section>';
 const typeRole=s.id==='1'?'h2':s.layout.split(' ').some(name=>['meal-phone','meal-transition'].includes(name))?'phone-title':'h3';
 $('#slide .copy h1').dataset.deckType=typeRole;
 $('#slide .eyebrow')?.remove();
 if(s.id==='1'){
  $('#slide').innerHTML='<section class="copy"><h1 data-deck-type="h2"><span class="rewards-brand"><img src="assets/dashpass-purple.svg" alt="">DashPass</span><br>In-store rewards</h1><p class="body" data-deck-type="big-subtitle">'+paragraphs(s.body)+'</p></section>';
 }else if(s.layout==='deck-numbered'){
  const points=s.id==='6'?s.cards:(s.contextItems||[]).map(title=>({title}));
  $('#slide').innerHTML=window.DeckLayouts.numberedPoints({title:s.title.replaceAll('\n',' '),points});
 }
 $('#slide .copy .body')?.setAttribute('data-deck-type','small-subtitle');
 if(s.id==='1')$('#slide .body').dataset.deckType='big-subtitle';
 $('#slide').querySelectorAll('.asset-panel figcaption,.future-video-grid figcaption,.concept h3').forEach(el=>el.dataset.deckType='small-subtitle');

 if(s.persistentPrompt){const prompt=document.createElement('div');prompt.className='persistent-prompt';prompt.dataset.deckType='phone-title';prompt.textContent=s.persistentPrompt;$('#slide').append(prompt);}
 const mediaAvailable=!!(s.autoplay||s.phoneVideo);
 if(mediaAvailable){
  const controls=document.createElement('div');controls.className='playback-anchor';
  const buttons=window.DeckTemplate.playbackControls({onStop:stopCurrent,onReplay:replayCurrent});
  controls.append(buttons.playing,buttons.replay);$('#slide .copy').append(controls);
  playback=autoplayEnabled?'loading':'ready';
 }
 const galleryButtons=[...$('#slide').querySelectorAll('.concept-screen')];
 galleryButtons.forEach(button=>{
  const video=button.querySelector('video');
  const stop=()=>{video.pause();button.classList.remove('playing');button.setAttribute('aria-pressed','false');};
  const play=()=>{galleryButtons.filter(other=>other!==button).forEach(other=>{other.querySelector('video').pause();other.classList.remove('playing');other.setAttribute('aria-pressed','false');});video.currentTime=0;button.classList.add('playing');button.setAttribute('aria-pressed','true');video.play().catch(stop);};
  button.addEventListener('mouseenter',()=>{if(matchMedia('(hover:hover)').matches)play();});button.addEventListener('mouseleave',stop);
  button.addEventListener('focus',()=>{if(button.matches(':focus-visible'))play();});button.addEventListener('blur',stop);
  button.addEventListener('click',()=>video.paused?play():stop());
 });
 }
 if(reused)playback=autoplayEnabled?'loading':'ready';
 $('#notes').innerHTML='<h3>Presenter / evidence note</h3><p>'+esc(s.notes)+'</p>';
 $('#count').textContent=(current+1)+' / '+slides.length;$('#prev').disabled=!current;$('#next').disabled=current===slides.length-1;
 const phone=$('#slide .phone'),frame=$('#slide .phone iframe');
 if(phone&&frame){const resize=()=>{const scale=phone.clientWidth/393;frame.style.height=phone.clientHeight/scale+'px';frame.style.transform='scale('+scale+')';};resizeObserver=new ResizeObserver(resize);resizeObserver.observe(phone);resize();
  if(!frame.dataset.deckBound){frame.dataset.deckBound='true';frame.dataset.loadCount='0';frame.addEventListener('load',()=>{frame.dataset.loadCount=String(Number(frame.dataset.loadCount)+1);if(frame.closest('#slide'))send(shouldPlay()?'play':'pause');else frame.contentWindow.postMessage({type:'deck-autoplay',action:'pause'},location.origin);});}
  if(reused)send(shouldPlay()?'play':'pause');
 }
 const video=$('#slide .media-phone video');
 if(video){video.addEventListener('ended',()=>playbackState('complete'));if(autoplayEnabled)video.play().then(()=>playbackState('playing')).catch(()=>playbackState('paused'));}
 syncPlayback();document.title='In-Store Rewards · '+(current+1);
}
$('#prev').onclick=()=>go(current-1);$('#next').onclick=()=>go(current+1);
$('#toggle').onclick=()=>setOutline(document.body.classList.contains('no-outline'));
$('#notesToggle').onclick=()=>$('#notes').hidden=!$('#notes').hidden;
$('#deck-autoplay-toggle').onclick=toggleAutoplay;
document.addEventListener('keydown',e=>{
 if(e.target.closest('input,textarea,select,[contenteditable="true"]'))return;
 const next=['ArrowRight','PageDown'].includes(e.key)||(e.key===' '&&!e.target.closest('button,a'));
 if(next){e.preventDefault();go(current+1);}else if(['ArrowLeft','PageUp'].includes(e.key)){e.preventDefault();go(current-1);}else if(e.key==='Home'){e.preventDefault();go(0);}else if(e.key==='End'){e.preventDefault();go(slides.length-1);}else if(e.key==='Escape'){setOutline(false);}
 if(next||['ArrowLeft','PageUp','Home','End'].includes(e.key)){document.body.classList.add('keyboard-navigation');if(document.activeElement?.closest('.presentation-navigation'))document.activeElement.blur();}
});
document.addEventListener('pointermove',()=>document.body.classList.remove('keyboard-navigation'),{passive:true});
document.addEventListener('visibilitychange',()=>{if(document.hidden){stopMedia();if(['playing','loading'].includes(playback)){manuallyStopped=true;playbackState('paused');}}});
window.addEventListener('message',e=>{
 if(e.origin!==location.origin||e.source!==$('#slide .phone iframe')?.contentWindow)return;
 if(e.data?.type==='deck-autoplay-ready'){send(shouldPlay()?'play':'pause');}
 if(e.data?.type==='deck-autoplay-status'){
  const status=e.data.status||'';
  if(/^(Playing)/i.test(status))playbackState(manuallyStopped?'paused':'playing');
  else if(/^Complete/i.test(status))playbackState('complete');
  else if(/^Paused/i.test(status))playbackState('paused');
  else if(/^Loading/i.test(status))playbackState(!shouldPlay()?'ready':'loading');
 }
});
window.addEventListener('hashchange',()=>{const n=parseInt(location.hash.slice(1));if(n&&n-1!==current)go(n-1);});
window.DeckTemplate.mountShell({backHref:'http://127.0.0.1:8001/'});
document.body.classList.add(review?'review-mode':'presentation-mode');
setOutline(innerWidth>760);
$('#review-link').href=(()=>{const url=new URL(location.href);if(review){url.searchParams.delete('mode');$('#review-link').textContent='Presentation view';}else url.searchParams.set('mode','review');return url.href;})();
fetch('slides.json?v=rewards-type17').then(r=>r.json()).then(data=>{slides=data;const id=query.get('slide');const found=slides.findIndex(s=>s.id===id);go(found>=0?found:Math.max(0,(parseInt(location.hash.slice(1))||1)-1));}).catch(e=>$('#slide').textContent='Unable to load slides: '+e.message);
