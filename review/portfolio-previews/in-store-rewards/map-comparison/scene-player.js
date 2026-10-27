import '/review/beyond-delivery/go-base-oct/rewards-dashboard.js?v=round61-spacing';

export const REWARDS_SOURCE = '/review/beyond-delivery/go-base-oct/dist/prototypes/nate-clinton/going-out/q2/credit-sandbox/?embed=1&view=go&header=isr&au=0';

/* One choreography for the intro and the Before/After map scene. Every state
   change goes through controls owned by the embedded final V3 runtime. */
export class RewardsMapPlayer {
  constructor(frame, hooks = {}) {
    this.frame = frame;
    this.hooks = hooks;
    this.generation = 0;
    this.playing = false;
    this.running = false;
    this.ready = false;
    this.complete = false;
    this.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  attach() {
    const doc = this.frame.contentDocument;
    if (!doc?.body || doc.documentElement.dataset.rewardsStoryAttached) return;
    doc.documentElement.dataset.rewardsStoryAttached='true';
    this.doc = doc;
    window.installOctRewardsDashboard?.(doc);
    const pointerCSS=doc.createElement('link');
    pointerCSS.rel='stylesheet';
    pointerCSS.href='/review/shared/phone-pointer.css';
    doc.head.append(pointerCSS);
    const style = doc.createElement('style');
    style.textContent = `
      html,body{margin:0!important;padding:0!important;width:393px!important;height:852px!important;overflow:hidden!important}
      .go-phone-chrome{width:393px!important;height:852px!important;margin:0!important;padding:0!important;border:0!important;border-radius:0!important;box-shadow:none!important;background:transparent!important}
      .pedregal-snap-sheet{--snap-open-top:255px!important}
      .pedregal-snap-sheet--snapping{transition-duration:.18s,.18s!important}
      .rewards-story-pointer{opacity:0;will-change:left,top,transform}
      .rewards-story-pointer.is-visible{opacity:1}
      .rewards-story-card-recede .map-preview-pager{translate:0 62%;transition:translate .7s cubic-bezier(.22,1,.36,1)}
      @media(prefers-reduced-motion:reduce){.rewards-story-card-recede .map-preview-pager{transition:none}}
    `;
    doc.head.append(style);
    doc.defaultView.requestAnimationFrame(()=>doc.defaultView.requestAnimationFrame(()=>doc.defaultView.dispatchEvent(new doc.defaultView.Event('resize'))));
    this.pointer = doc.createElement('i');
    this.pointer.className = 'deck-autoplay-touch rewards-story-pointer';
    this.pointer.setAttribute('aria-hidden','true');
    this.pointer.style.left = '310px'; this.pointer.style.top = '625px';
    doc.body.append(this.pointer);
    for (const type of ['pointerdown','touchstart','wheel','keydown']) doc.addEventListener(type, event => {
      if (!event.isTrusted) return;
      doc.documentElement.classList.remove('rewards-story-card-recede');
      this.pause();
      this.hooks.onManual?.();
    }, {capture:true,passive:true});
    this.ready = true;
    this.hooks.onReady?.();
  }
  reset() {
    this.generation++;
    this.playing = false;
    this.running = false;
    this.ready = false;
    this.complete = false;
    this.doc = null;
    this.pointer = null;
  }
  pause() { this.playing = false; this.pointer?.classList.remove('is-visible'); }
  play() {
    if (!this.ready || this.complete || this.playing) return;
    this.playing = true;
    this.pointer?.classList.add('is-visible');
    if (!this.running) this.sequence(++this.generation);
  }
  async wait(ms, token) {
    let elapsed = 0;
    while (elapsed < ms) {
      if (token !== this.generation) throw Error('reset');
      await new Promise(resolve => setTimeout(resolve, 16));
      if (this.playing) elapsed += 16;
    }
  }
  async until(getter, token, limit = 14000) {
    for (let elapsed = 0; elapsed < limit; elapsed += 80) {
      if (token !== this.generation) throw Error('reset');
      const found = getter(); if (found) return found;
      await new Promise(resolve => setTimeout(resolve, 80));
    }
    throw Error('Final V3 control unavailable');
  }
  center(el) {
    const r = el.getBoundingClientRect();
    return [Math.max(42,Math.min(351,r.left+r.width/2)),Math.max(42,Math.min(810,r.top+r.height/2))];
  }
  point(x,y) { if (this.pointer) { this.pointer.style.left=x+'px'; this.pointer.style.top=y+'px'; } }
  async glide(x,y,duration,token,onStep,ease=t=>1-Math.pow(1-t,3)) {
    const fromX=parseFloat(this.pointer.style.left),fromY=parseFloat(this.pointer.style.top);
    const steps=Math.max(1,Math.round(duration/16));
    for(let i=1;i<=steps;i++) {
      if(token!==this.generation)throw Error('reset');
      const t=i/steps,e=ease(t),px=fromX+(x-fromX)*e,py=fromY+(y-fromY)*e;
      this.point(px,py); onStep?.(px,py);
      await this.wait(16,token);
    }
  }
  async target(el,token) { const [x,y]=this.center(el); await this.glide(x,y,420,token); return [x,y]; }
  pulse() { if(this.reduced||!this.pointer)return;this.pointer.animate([{transform:'scale(1)'},{transform:'scale(.87)'},{transform:'scale(1)'}],{duration:250}); }
  phase(name) { this.hooks.onPhase?.(name); }
  dragSheet(token) {
    const grab=this.doc.querySelector('.pedregal-snap-sheet__grabber');
    if(!grab)throw Error('Native sheet grabber unavailable');
    return this.dragSheetFrom(grab,token);
  }
  async dragSheetFrom(grab,token) {
    const doc=this.doc,win=doc.defaultView,[x,y]=await this.target(grab,token);
    const releaseY=Math.min(800,y+330);
    grab.dispatchEvent(new win.MouseEvent('mousedown',{bubbles:true,clientX:x,clientY:y,buttons:1}));
    await this.glide(x,releaseY,280,token,(px,py)=>doc.dispatchEvent(new win.MouseEvent('mousemove',{bubbles:true,clientX:px,clientY:py,buttons:1})),t=>t*t);
    doc.dispatchEvent(new win.MouseEvent('mouseup',{bubbles:true,clientX:x,clientY:releaseY,buttons:0}));
  }
  markerDistance() {
    const pins=[...this.doc.querySelectorAll('.go-pin')].slice(0,2);
    if(pins.length<2)return 0;
    const a=pins[0].getBoundingClientRect(),b=pins[1].getBoundingClientRect();
    return Math.hypot(a.left-b.left,a.top-b.top);
  }
  async zoom(inward,token) {
    const canvas=this.doc.querySelector('.go-map-container .maplibregl-canvas');
    if(!canvas)throw Error('Native map canvas unavailable');
    const [x,y]=[196,224];await this.glide(x,y,420,token);this.pulse();
    canvas.dispatchEvent(new this.doc.defaultView.MouseEvent('dblclick',{bubbles:true,cancelable:true,clientX:x,clientY:y,shiftKey:!inward}));
    await this.wait(1150,token);
  }
  visiblePin() {
    const doc=this.doc,sheetTop=doc.querySelector('.pedregal-snap-sheet')?.getBoundingClientRect().top||600;
    return [...doc.querySelectorAll('.go-pin')].find(pin=>{const r=pin.getBoundingClientRect(),s=doc.defaultView.getComputedStyle(pin);return s.opacity!=='0'&&r.left>8&&r.right<385&&r.top>110&&r.bottom<sheetTop-8;});
  }
  activeCard() { return this.doc.querySelector('.map-preview-pager__slide--active .oct-map-card__name')?.textContent?.trim(); }
  async swipe(token) {
    const pager=await this.until(()=>this.doc.querySelector('.map-preview-pager__viewport'),token),win=this.doc.defaultView,r=pager.getBoundingClientRect();
    const x=r.left+r.width*.75,y=r.top+r.height*.55,finish=x-210;
    await this.glide(x,y,410,token);
    pager.dispatchEvent(new win.PointerEvent('pointerdown',{bubbles:true,pointerId:1,pointerType:'mouse',clientX:x,clientY:y,buttons:1}));
    await this.glide(finish,y,620,token,(px,py)=>win.dispatchEvent(new win.PointerEvent('pointermove',{bubbles:true,pointerId:1,pointerType:'mouse',clientX:px,clientY:py,buttons:1})));
    win.dispatchEvent(new win.PointerEvent('pointerup',{bubbles:true,pointerId:1,pointerType:'mouse',clientX:finish,clientY:y,buttons:0}));
    await this.wait(480,token);
  }
  async sequence(token) {
    this.running=true;
    try {
      const doc=this.doc;
      await this.until(()=>doc.querySelector('.pedregal-snap-sheet[data-snap="rest"]')&&doc.querySelectorAll('.go-pin').length>4,token,22000);
      this.phase('dashboard');await this.wait(900,token);
      this.phase('lowering-sheet');await this.dragSheet(token);
      await this.until(()=>doc.querySelector('.pedregal-snap-sheet[data-snap="collapsed"]'),token);
      await this.wait(650,token);
      this.phase('map');const pin=await this.until(()=>this.visiblePin(),token);
      await this.target(pin,token);this.pulse();pin.click();
      await this.until(()=>this.activeCard(),token);this.phase('first-card');await this.wait(900,token);
      for(let i=0;i<2;i++) {const name=this.activeCard();this.phase(i?'second-swipe':'first-swipe');await this.swipe(token);await this.until(()=>this.activeCard()&&this.activeCard()!==name,token,4500);await this.wait(550,token);}
      this.phase('zooming-in');const before=this.markerDistance();await this.zoom(true,token);const zoomed=this.markerDistance();if(before>0&&zoomed<=before*1.04)throw Error('Native zoom in did not move pins');
      this.phase('zooming-out');await this.zoom(false,token);const receded=this.markerDistance();if(zoomed>0&&receded>=zoomed*.96)throw Error('Native zoom out did not recede pins');
      doc.documentElement.classList.add('rewards-story-card-recede');
      this.phase('wide-map');await this.wait(750,token);
      this.complete=true;this.playing=false;this.pointer?.classList.remove('is-visible');this.phase('complete');this.hooks.onComplete?.();
    } catch(error) { if(token===this.generation) {this.playing=false;this.pointer?.classList.remove('is-visible');this.hooks.onError?.(error.message);} }
    finally {if(token===this.generation)this.running=false;}
  }
}
