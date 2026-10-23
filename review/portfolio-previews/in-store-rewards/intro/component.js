import {RewardsMapPlayer,REWARDS_SOURCE} from '../map-comparison/scene-player.js';

class RewardsIntroScene extends HTMLElement {
  connectedCallback(){
    if(this._mounted)return;this._mounted=true;
    this.innerHTML=`<div class="rewards-intro deck-device-canvas"><div class="rewards-intro__phone deck-device-surface"><div class="rewards-intro__screen"><iframe class="rewards-intro__frame scene-pending" title="Final V3 In-Store Rewards interactive map" src="${REWARDS_SOURCE}"></iframe></div><span class="rewards-intro__island" aria-hidden="true"></span></div><span class="rewards-intro__status" role="status">Loading prototype</span></div>`;
    this.screen=this.querySelector('.rewards-intro__screen');this.status=this.querySelector('.rewards-intro__status');this.frame=this.screen.querySelector('iframe');
    this.player=this.makePlayer(this.frame,false);
    this.frame.addEventListener('load',()=>this.playerFor(this.frame)?.attach());
    if(this.frame.contentDocument?.readyState==='complete'&&this.frame.contentDocument.URL!=='about:blank')this.player.attach();
    this.observer=new IntersectionObserver(([entry])=>{
      const wasVisible=this.inView;this.inView=entry.isIntersecting;
      if(!this.inView){this.exited=true;this.player.pause();clearTimeout(this.loopTimer);this.setStatus('Paused offscreen');return;}
      if(this.exited&&(!wasVisible)&&(this.manualPause||this.player.complete)){this.manualPause=false;this.exited=false;this.bufferedRestart();return;}
      this.exited=false;if(!this.player.reduced&&!this.manualPause&&!this.frame.classList.contains('scene-pending'))this.player.play();
    },{threshold:.35});this.observer.observe(this);
    this.onVisibility=()=>{if(document.hidden){this.player.pause();clearTimeout(this.loopTimer);this.setStatus('Paused in background');}else if(this.inView&&!this.manualPause&&!this.player.reduced){if(this.player.complete)this.bufferedRestart();else if(!this.frame.classList.contains('scene-pending'))this.player.play();}};
    document.addEventListener('visibilitychange',this.onVisibility);
  }
  disconnectedCallback(){clearTimeout(this.loopTimer);clearTimeout(this.swapTimer);this.player?.reset();this.pendingPlayer?.reset();this.observer?.disconnect();document.removeEventListener('visibilitychange',this.onVisibility);}
  setStatus(message){this.status.textContent=message;}
  playerFor(frame){return frame===this.frame?this.player:frame===this.pendingFrame?this.pendingPlayer:null;}
  makePlayer(frame,pending){
    const player=new RewardsMapPlayer(frame,{
      onReady:()=>{if(pending)this.waitForSwap(frame,player);else this.waitForInitial(frame,player);},
      onPhase:phase=>{if(player===this.player)this.dataset.phase=phase;},
      onComplete:()=>{if(player!==this.player)return;this.setStatus('Complete');this.scheduleLoop();},
      onError:message=>{if(player===this.player)this.setStatus(message);},
      onManual:()=>{if(player!==this.player)return;this.manualPause=true;clearTimeout(this.loopTimer);if(this.pendingFrame){this.pendingFrame.remove();this.pendingPlayer?.reset();this.pendingFrame=null;this.pendingPlayer=null;}this.setStatus('Explore freely');}
    });return player;
  }
  scheduleLoop(){clearTimeout(this.loopTimer);if(this.inView&&!document.hidden&&!this.manualPause&&!this.player.reduced)this.loopTimer=setTimeout(()=>this.bufferedRestart(),1050);}
  waitForInitial(frame,player){
    let attempts=0;
    const check=()=>{
      if(!this.isConnected||frame!==this.frame)return;
      const doc=frame.contentDocument;
      if(doc?.querySelector('.pedregal-snap-sheet[data-snap="rest"]')&&doc.querySelectorAll('.go-pin').length>4){
        frame.classList.remove('scene-pending');frame.classList.add('scene-on-top');this.dataset.phase='dashboard';
        this.swapTimer=setTimeout(()=>{if(this.inView&&!document.hidden&&!this.manualPause&&!player.reduced)player.play();},550);
      }else if(++attempts<180)this.swapTimer=setTimeout(check,100);
      else this.setStatus('V3 map unavailable');
    };check();
  }
  bufferedRestart(){
    if(this.pendingFrame||!this.inView||document.hidden||this.player.reduced||this.manualPause)return;
    const next=document.createElement('iframe');next.className='rewards-intro__frame scene-pending';next.title='Final V3 In-Store Rewards interactive map';
    this.pendingFrame=next;this.pendingPlayer=this.makePlayer(next,true);
    next.addEventListener('load',()=>this.playerFor(next)?.attach());
    this.screen.append(next);next.src=REWARDS_SOURCE+'&loop='+Date.now();
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
        this.dataset.phase='dashboard';this.setStatus('Playing');
        setTimeout(()=>{previous.remove();oldPlayer.reset();},430);
        this.swapTimer=setTimeout(()=>{if(this.inView&&!document.hidden&&!this.manualPause&&!player.reduced)player.play();},500);
      }else if(++attempts<180)this.swapTimer=setTimeout(check,100);
      else{frame.remove();player.reset();this.pendingFrame=null;this.pendingPlayer=null;this.setStatus('V3 map unavailable');}
    };check();
  }
}
customElements.define('rewards-intro-scene',RewardsIntroScene);
