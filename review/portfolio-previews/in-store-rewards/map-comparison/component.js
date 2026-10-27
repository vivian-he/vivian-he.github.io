import {RewardsMapPlayer,REWARDS_SOURCE} from './scene-player.js';

const ROOT=new URL('./',import.meta.url);
const FRAMES=new URL('./audit-frames.json',ROOT);

class RewardsMapComparison extends HTMLElement {
  connectedCallback(){
    if(this.shadowRoot)return;
    this.afterAutoplay=this.hasAttribute('after-autoplay');this.manualAfter=this.getAttribute('playback')==='manual';this.hoverPlayback=['hover','manual'].includes(this.getAttribute('playback'));this.beforeHovered=false;this.afterHovered=false;this.frameIndex=0;this.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    const root=this.attachShadow({mode:'open'});
    root.innerHTML=`<link rel="stylesheet" href="${new URL('./component.css',ROOT)}"><div class="comparison" aria-label="Original and updated rewards map behavior"><figure><figcaption>Before</figcaption><div class="screen"><img class="before-frame" src="${new URL('./audit-frames/frame-000.webp',ROOT)}" alt="Original Going Out map audit recording with crowded pins and map movement"><img class="before-record-mask" src="${new URL('./audit-record-mask.webp',ROOT)}" alt="" aria-hidden="true"></div></figure><figure><figcaption>After</figcaption><div class="screen after-screen"><iframe class="scene-pending" title="Final V3 In-Store Rewards map and store cards" src="${REWARDS_SOURCE}"></iframe></div></figure></div><span class="status" role="status">Loading V3 map</span>`;
    this.root=root;this.screen=root.querySelector('.after-screen');this.frame=this.screen.querySelector('iframe');this.image=root.querySelector('.before-frame');this.status=root.querySelector('.status');
    this.player=this.makePlayer(this.frame,false);
    if(this.hoverPlayback){
      const before=root.querySelector('.screen');
      before.addEventListener('pointerenter',()=>{this.beforeHovered=true;this.dataset.beforePlaying='true';});
      before.addEventListener('pointerleave',()=>{this.beforeHovered=false;this.dataset.beforePlaying='false';});
      this.screen.addEventListener('pointerenter',()=>{if(this.manualAfter||this.afterAutoplay)return;this.afterHovered=true;this.manualPause=false;this.autoCycle=true;this.dataset.afterPlaying='true';if(this.player.complete)this.bufferedRestart();else if(!this.frame.classList.contains('scene-pending'))this.player.play();});
      this.screen.addEventListener('pointerleave',()=>{if(this.afterAutoplay)return;this.afterHovered=false;this.autoCycle=false;this.dataset.afterPlaying='false';this.player.pause();clearTimeout(this.loopTimer);});
      this.dataset.beforePlaying='false';this.dataset.afterPlaying='false';
    }
    this.frame.addEventListener('load',()=>this.playerFor(this.frame)?.attach());
    if(this.frame.contentDocument?.readyState==='complete'&&this.frame.contentDocument.URL!=='about:blank')this.player.attach();
    this.resizeObserver=new ResizeObserver(()=>this.measure());this.resizeObserver.observe(this.screen);
    this.observer=new IntersectionObserver(([entry])=>{
      const wasVisible=this.inView;this.inView=entry.isIntersecting;
      if(!this.inView){this.exited=true;this.autoCycle=false;this.player.pause();clearTimeout(this.loopTimer);this.setStatus('Paused offscreen');return;}
      if(!this.hoverPlayback&&this.exited&&!wasVisible&&(this.manualPause||this.player.complete)){this.manualPause=false;this.exited=false;this.autoCycle=!this.reduced;this.bufferedRestart();return;}
      this.exited=false;this.autoCycle=this.canPlayAfter();
      if(this.autoCycle&&!this.frame.classList.contains('scene-pending'))this.player.play();
    },{threshold:.35});this.observer.observe(this);
    this.onVisibility=()=>{if(document.hidden){this.autoCycle=false;this.player.pause();clearTimeout(this.loopTimer);this.setStatus('Paused in background');}else if(this.canPlayAfter()){this.autoCycle=true;if(this.player.complete)this.bufferedRestart();else if(!this.frame.classList.contains('scene-pending'))this.player.play();}};
    document.addEventListener('visibilitychange',this.onVisibility);
    fetch(FRAMES).then(r=>r.json()).then(frames=>{this.frames=frames;this.image.src=new URL(frames[0].src,ROOT).href;this.startFrames();}).catch(()=>this.setStatus('Original audit frames unavailable'));
    this.measure();
  }
  disconnectedCallback(){clearTimeout(this.loopTimer);clearTimeout(this.swapTimer);clearTimeout(this.frameTimer);this.player?.reset();this.pendingPlayer?.reset();this.observer?.disconnect();this.resizeObserver?.disconnect();document.removeEventListener('visibilitychange',this.onVisibility);}
  canPlayAfter(){return !this.manualAfter&&this.inView&&!document.hidden&&!this.manualPause&&!this.reduced&&(this.afterAutoplay||!this.hoverPlayback||this.afterHovered);}
  setStatus(message){this.status.textContent=message;}
  measure(){const width=this.screen?.clientWidth;if(!width)return;for(const frame of this.screen.querySelectorAll('iframe'))frame.style.transform=`scale(${width/393})`;}
  playerFor(frame){return frame===this.frame?this.player:frame===this.pendingFrame?this.pendingPlayer:null;}
  makePlayer(frame,pending){
    const player=new RewardsMapPlayer(frame,{
      onReady:()=>{if(pending)this.waitForSwap(frame,player);else this.waitForInitial(frame,player);},
      onPhase:phase=>{if(player===this.player)this.dataset.phase=phase;},
      onComplete:()=>{if(player!==this.player)return;this.setStatus('Complete');this.scheduleLoop();},
      onError:message=>{if(player===this.player)this.setStatus(message);},
      onManual:()=>{if(player!==this.player)return;this.manualPause=true;this.autoCycle=false;clearTimeout(this.loopTimer);if(this.pendingFrame){this.pendingFrame.remove();this.pendingPlayer?.reset();this.pendingFrame=null;this.pendingPlayer=null;}this.setStatus('Explore freely');}
    });return player;
  }
  scheduleLoop(){clearTimeout(this.loopTimer);if(this.canPlayAfter())this.loopTimer=setTimeout(()=>this.bufferedRestart(),1050);}
  waitForInitial(frame,player){
    let attempts=0;
    const check=()=>{
      if(!this.isConnected||frame!==this.frame)return;
      const doc=frame.contentDocument;
      if(doc?.querySelector('.pedregal-snap-sheet[data-snap="rest"]')&&doc.querySelectorAll('.go-pin').length>4){
        if(this.manualAfter){
          const clean=doc.createElement('style');clean.textContent='.dynamic-island,div[style*="width: 131px"][style*="height: 40px"]{visibility:hidden!important}html,body,body *{cursor:none!important}.deck-manual-pointer{position:fixed;z-index:2147483647;width:84px;height:84px;margin:-42px 0 0 -42px;border:1px solid #0003;border-radius:50%;background:#ffffff94;box-shadow:0 1px 7px #0004;pointer-events:none}.deck-manual-pointer[hidden]{display:none!important}';doc.head.append(clean);
          const cursor=doc.createElement('i');cursor.className='deck-manual-pointer';cursor.hidden=true;doc.body.append(cursor);doc.addEventListener('pointermove',e=>{cursor.hidden=false;cursor.style.left=e.clientX+'px';cursor.style.top=e.clientY+'px'});doc.addEventListener('pointerleave',()=>cursor.hidden=true);
        }
        frame.classList.remove('scene-pending');frame.classList.add('scene-on-top');this.dataset.phase='dashboard';
        this.swapTimer=setTimeout(()=>{if(this.canPlayAfter())player.play();},550);
      }else if(++attempts<180)this.swapTimer=setTimeout(check,100);
      else this.setStatus('V3 map unavailable');
    };check();
  }
  bufferedRestart(){
    if(this.pendingFrame||!this.canPlayAfter())return;
    const next=document.createElement('iframe');next.className='scene-pending';next.title='Final V3 In-Store Rewards map and store cards';
    this.pendingFrame=next;this.pendingPlayer=this.makePlayer(next,true);
    next.addEventListener('load',()=>this.playerFor(next)?.attach());
    this.screen.append(next);this.measure();next.src=REWARDS_SOURCE+'&loop='+Date.now();
  }
  waitForSwap(frame,player){
    let attempts=0;
    const check=()=>{
      if(!this.isConnected||frame!==this.pendingFrame)return;
      const doc=frame.contentDocument;
      if(doc?.querySelector('.pedregal-snap-sheet[data-snap="rest"]')&&doc.querySelectorAll('.go-pin').length>4){
        const previous=this.frame,oldPlayer=this.player;
        this.frame=frame;this.player=player;this.pendingFrame=null;this.pendingPlayer=null;
        frame.classList.remove('scene-pending');frame.classList.add('scene-on-top');
        this.dataset.phase='dashboard';if(!this.hoverPlayback)this.frameIndex=0;this.setStatus('Playing');
        setTimeout(()=>{previous.remove();oldPlayer.reset();},430);
        this.swapTimer=setTimeout(()=>{if(this.canPlayAfter())player.play();},500);
      }else if(++attempts<180)this.swapTimer=setTimeout(check,100);
      else{frame.remove();player.reset();this.pendingFrame=null;this.pendingPlayer=null;this.setStatus('V3 map unavailable');}
    };check();
  }
  startFrames(){if(this.frameTimer)return;const tick=()=>{if((this.hoverPlayback?this.beforeHovered:this.autoCycle)&&this.inView&&!document.hidden&&this.frames){this.frameIndex=(this.frameIndex+1)%this.frames.length;this.image.src=new URL(this.frames[this.frameIndex].src,ROOT).href;}this.frameTimer=setTimeout(tick,this.frames?.[this.frameIndex]?.duration||100);};this.frameTimer=setTimeout(tick,100);}
}
customElements.define('rewards-map-comparison',RewardsMapComparison);
