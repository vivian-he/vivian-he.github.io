/* Condensed discovery story. Canonical prototype routes remain the screen source. */
(() => {
  if (customElements.get('meal-discovery-story')) return;

  const base = '/review/portfolio-previews/affordable-meals/discovery/';
  const prototype = '/review/consumer-prototype/index.html?embed=1&state=';
  const wait = (ms, signal) => new Promise((resolve, reject) => {
    if (signal.aborted) return reject(new DOMException('Stopped', 'AbortError'));
    const timer = setTimeout(resolve, ms);
    signal.addEventListener('abort', () => { clearTimeout(timer); reject(new DOMException('Stopped', 'AbortError')); }, {once:true});
  });
  const moments = [
    {
      lines: ['24% browses among', 'multiple stores'],
      walk: 'suggest',
      state: 'suggestions',
      title: 'Browse suggestions prototype'
    },
    {
      lines: ['45%', 'Search generally'],
      walk: 'search',
      state: 'home',
      title: 'Cuisine and dish search prototype'
    },
    {
      lines: ['22% go to a', 'specific store'],
      walk: 'store',
      state: 'merchantSearch',
      title: 'NAYA restaurant search and Meal Box store journey'
    }
  ];

  class MealDiscoveryStory extends HTMLElement {
    connectedCallback() {
      if (this.shadowRoot) {
        this.shadowRoot.querySelectorAll('.discovery-phone').forEach(phone => this._resize?.observe(phone));
        this.shadowRoot.querySelectorAll('.discovery-moment').forEach(moment => this._observer?.observe(moment));
        document.addEventListener('visibilitychange',this._visibility);
        window.addEventListener('message',this._message);
        return;
      }
      if (!document.querySelector('link[data-meal-device-tokens]') &&
          !document.querySelector('link[href$="/deck-template/device-surface.css"]')) {
        const tokens = document.createElement('link');
        tokens.rel = 'stylesheet';
        tokens.href = '/deck-template/device-surface.css';
        tokens.dataset.mealDeviceTokens = '';
        document.head.append(tokens);
      }
      const shadow = this.attachShadow({mode: 'open'});
      const surface = document.createElement('link');
      surface.rel = 'stylesheet';
      surface.href = '/deck-template/device-surface.css';
      const styles = document.createElement('link');
      styles.rel = 'stylesheet';
      styles.href = base + 'component.css?v=final71';
      const pointerStyles = document.createElement('link');
      pointerStyles.rel = 'stylesheet';
      pointerStyles.href = '/review/shared/phone-pointer.css?v=pointer44-3';
      shadow.append(surface, pointerStyles, styles);

      const story = document.createElement('div');
      story.className = 'discovery-story deck-device-canvas';
      story.setAttribute('aria-label', 'Three ways to discover a $12 Meal Box');
      moments.forEach(({lines, walk, state, title}, index) => {
        const moment = document.createElement('article');
        moment.className = 'discovery-moment';
        moment.dataset.state = state;
        moment.dataset.walk = walk;
        const copy = document.createElement('div');
        copy.className = 'moment-copy';
        const heading = document.createElement('h2');
        heading.innerHTML = lines.map(line => line.replace(/^(\d+%)/, '<span class="phone-percentage">$1</span>')).join('<br>');
        copy.append(heading);
        const phone = document.createElement('div');
        phone.className = 'discovery-phone deck-device-surface';
        const viewport = document.createElement('div');
        viewport.className = 'phone-viewport';
        const frame = document.createElement('iframe');
        frame.title = title;
        frame.loading = index === 0 ? 'eager' : 'lazy';
        frame.referrerPolicy = 'same-origin';
        frame.setAttribute('allow', 'autoplay');
        frame.dataset.src = prototype + encodeURIComponent(state);
        const chrome = document.createElement('div');
        chrome.className = 'device-system-ui';
        chrome.setAttribute('aria-hidden', 'true');
        chrome.innerHTML = '<div class="device-status"><b>9:41</b><img class="device-signals" src="/review/shared/iphone-signals.svg" alt="" width="75.0473" height="13.084"></div><i class="device-island"></i>';
        viewport.append(frame, chrome);
        phone.append(viewport);
        const pointer = document.createElement('span');
        pointer.className = 'deck-autoplay-touch demo-pointer';
        pointer.setAttribute('aria-hidden', 'true');
        phone.append(pointer);
        moment.append(phone, copy);
        story.append(moment);
      });
      shadow.append(story);

      const resize = new ResizeObserver(entries => {
        for (const entry of entries) {
          const phone = entry.target;
          const viewport = phone.querySelector('.phone-viewport');
          const scale = viewport.clientWidth / 393;
          viewport.style.setProperty('--phone-scale', scale);
          phone.style.setProperty('--phone-scale', scale);
        }
      });
      story.querySelectorAll('.discovery-phone').forEach(phone => resize.observe(phone));
      this._resize = resize;

      this._ratios=new Map(); this._played=new WeakSet(); this._manual=new WeakSet(); this._boundDocs=new WeakSet();
      this._flows=fetch('/review/shared/autoplay-flows.json?v=20261018-home-carousel')
        .then(response=>response.ok?response.json():Promise.reject(Error('Original autoplay recipes unavailable')))
        .then(data=>data.flows);
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry=>this._ratios.set(entry.target,entry.intersectionRatio));
        this._activate();
      }, {threshold:[0,.2,.4,.6,.8,1]});
      story.querySelectorAll('.discovery-moment').forEach(moment => observer.observe(moment));
      this._observer = observer;
      this._visibility=()=>{if(document.hidden){this._stop();this._active=null;}else this._activate();};
      document.addEventListener('visibilitychange',this._visibility);
      this._message=event=>{
        if(event.origin!==location.origin||event.data?.type!=='consumer:state')return;
        const third=this.shadowRoot.querySelector('[data-walk="store"]');
        if(event.source===third?.querySelector('iframe')?.contentWindow&&event.data.state==='store')
          third.querySelector('.moment-copy h2').innerHTML='Encounter<br> $12 Meal Box';
      };
      window.addEventListener('message',this._message);
    }

    _stop() {
      this._controller?.abort(); this._controller=null;
      this._active?.querySelector('.demo-pointer')?.classList.remove('visible');
    }
    _activate() {
      if(document.hidden||!this.isConnected)return;
      const visible=[...this._ratios].sort((a,b)=>b[1]-a[1]);
      const next=visible[0]?.[1]>=.35?visible[0][0]:null;
      if(next===this._active)return;
      this._stop();this._active=next;
      if(!next)return;
      const frame=next.querySelector('iframe');
      frame.src=frame.dataset.src;
      this._played.add(next);
      if(next.dataset.walk==='store')next.querySelector('.moment-copy h2').innerHTML='22% go to a<br>specific store'.replace('22%','<span class="phone-percentage">22%</span>');
      const controller=new AbortController();this._controller=controller;
      this._play(next,controller.signal).catch(error=>{
        if(error.name!=='AbortError')console.info('[Meal discovery autoplay]',error.message);
      });
    }
    _documents(frame) {
      const docs=[];
      const visit=doc=>{
        if(!doc?.documentElement||docs.includes(doc))return;
        docs.push(doc);
        doc.querySelectorAll('iframe').forEach(f=>{try{visit(f.contentDocument)}catch{}});
      };
      try{visit(frame.contentDocument)}catch{}
      return docs;
    }
    _bindManual(scene) {
      for(const doc of this._documents(scene.querySelector('iframe'))){
        if(this._boundDocs.has(doc))continue;
        this._boundDocs.add(doc);
        for(const type of ['pointerdown','keydown','touchstart'])doc.addEventListener(type,event=>{
          if(!event.isTrusted)return;
          this._manual.add(scene);if(scene===this._active)this._stop();
        },{capture:true,passive:true});
      }
    }
    async _target(scene,step,signal) {
      for(let n=0;n<80;n++){
        if(signal.aborted)throw new DOMException('Stopped','AbortError');
        this._bindManual(scene);
        for(const doc of this._documents(scene.querySelector('iframe'))){
          if(step.document&&!doc.location.href.includes(step.document))continue;
          const el=[...doc.querySelectorAll(step.selector)].find(item=>{
            if(item.disabled)return false;
            if(step.text&&!new RegExp(step.text,'i').test(item.textContent+' '+item.getAttribute('aria-label')))return false;
            const r=item.getBoundingClientRect();return r.width>0&&r.height>0;
          });
          if(el)return el;
        }
        await wait(150,signal);
      }
      throw Error('Source control unavailable: '+step.selector);
    }
    _point(scene,element) {
      const frame=scene.querySelector('iframe'),phone=scene.querySelector('.discovery-phone');
      const r=element.getBoundingClientRect();let x=r.left+r.width/2,y=r.top+r.height/2,w=element.ownerDocument.defaultView;
      while(w!==frame.contentWindow){
        const child=w.frameElement;if(!child)break;
        const b=child.getBoundingClientRect();x=b.left+x*b.width/(child.clientWidth||b.width);y=b.top+y*b.height/(child.clientHeight||b.height);
        w=child.ownerDocument.defaultView;
      }
      const scale=phone.clientWidth/393;return{x:x*scale,y:y*scale};
    }
    async _step(scene,step,signal) {
      await wait(step.action==='hold'?(step.delay??1400):(step.delay??1400)*.68,signal);
      if(step.action==='hold')return;
      const element=await this._target(scene,step,signal);
      if(step.action==='scrollTo'){
        element.scrollIntoView({block:'center',inline:'nearest',behavior:'smooth'});
        await wait(650,signal);return;
      }
      if(step.action==='scrollHorizontal'){
        element.scrollBy({left:step.amount||160,behavior:'smooth'});
        await wait(650,signal);return;
      }
      element.scrollIntoView({block:'nearest',inline:'nearest',behavior:'instant'});
      await wait(100,signal);
      const pointer=scene.querySelector('.demo-pointer'),point=this._point(scene,element);
      pointer.style.left=point.x+'px';pointer.style.top=point.y+'px';pointer.classList.add('visible');
      await wait(400,signal);
      if(step.action==='input'){
        const win=element.ownerDocument.defaultView;
        const setter=Object.getOwnPropertyDescriptor(win.HTMLInputElement.prototype,'value').set;
        const value=String(step.value);
        for(let i=1;i<=value.length;i++){
          setter.call(element,value.slice(0,i));element.dispatchEvent(new win.Event('input',{bubbles:true}));
          await wait(70,signal);
        }
        element.dispatchEvent(new win.Event('change',{bubbles:true}));
      }else element.click();
      pointer.classList.remove('visible');
    }
    async _play(scene,signal) {
      const flows=await this._flows;
      const run=async walk=>{
        const flow=flows.find(recipe=>recipe.walk?.includes(walk));
        if(!flow)throw Error('Original '+walk+' recipe unavailable');
        for(const step of flow.steps){
          if(signal.aborted||document.hidden||scene!==this._active)throw new DOMException('Stopped','AbortError');
          await this._step(scene,step,signal);
        }
      };
      await run(scene.dataset.walk);
      if(scene.dataset.walk==='store'){
        scene.querySelector('.moment-copy h2').innerHTML='Encounter<br> $12 Meal Box';
        await run('encounter');
      }
    }

    disconnectedCallback() {
      this._stop();
      this._resize?.disconnect();
      this._observer?.disconnect();
      document.removeEventListener('visibilitychange',this._visibility);
      window.removeEventListener('message',this._message);
    }
  }
  customElements.define('meal-discovery-story', MealDiscoveryStory);
})();
