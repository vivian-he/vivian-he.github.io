/* Deck Template — shared presentation components for every case study. */
(() => {
  const labels={stop:'Stop autoplay',replay:'Replay prototype',autoplayOn:'Turn Prototype Autoplay Off',autoplayOff:'Turn Prototype Autoplay On',back:'Back to portfolio'};
  const icons={
    // Filled treatment of the local Picnic pause silhouette: two quiet solid bars.
    pause:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor"/><rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor"/></svg>',
    replay:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5 3 10l6 5M4 10h9a6 6 0 1 1 0 12" transform="translate(0 -2)" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    back:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5m7-7-7 7 7 7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    previous:'<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M9.789 3.793a1 1 0 1 1 1.414 1.414L5.41 11h15.586a1 1 0 0 1 0 2H5.41l5.793 5.793a1 1 0 0 1-1.414 1.414l-6.793-6.793a2 2 0 0 1 0-2.828z"/></svg>',
    next:'<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12.793 3.793a1 1 0 0 1 1.414 0L21 10.586a2 2 0 0 1 0 2.828l-6.793 6.793a1 1 0 0 1-1.414-1.414L18.586 13H3a1 1 0 1 1 0-2h15.586l-5.793-5.793a1 1 0 0 1 0-1.414"/></svg>'
  };
  const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  function playbackControls({replay,onStop,onReplay}={}){
    replay=replay||document.createElement('button');replay.type='button';replay.id='deck-autoplay-replay';replay.classList.add('contextual-replay');replay.innerHTML=icons.replay+'<span>'+labels.replay+'</span>';replay.hidden=true;if(onReplay)replay.onclick=onReplay;
    const playing=document.createElement('button');playing.type='button';playing.className='contextual-playing';playing.innerHTML=icons.pause+'<span>'+labels.stop+'</span>';playing.setAttribute('aria-label',labels.stop);playing.hidden=true;playing.onclick=onStop;
    return {playing,replay};
  }
  function playbackState(controls,state,available=true){controls.playing.hidden=!available||!['playing','loading'].includes(state);controls.replay.hidden=!available||!['paused','complete','ready'].includes(state);}
  function mountShell({toggle=document.querySelector('#toggle'),autoplay=document.querySelector('#deck-autoplay-controls'),previous=document.querySelector('#prev'),next=document.querySelector('#next'),backHref='/',deckId=window.DeckTemplateConfig?.deckId}={}){
    document.body.classList.add('deck-template');document.body.dataset.deckTemplate='Deck Template';if(deckId)document.body.dataset.deckId=deckId;
    let back=document.querySelector('.presentation-back');if(!back){back=document.createElement('a');back.className='presentation-back';document.body.append(back);}back.href=backHref;back.innerHTML=icons.back+'<span>'+labels.back+'</span>';
    let tools=document.querySelector('.presentation-tools');if(!tools){tools=document.createElement('div');tools.className='presentation-tools';document.body.append(tools);}tools.setAttribute('aria-label','Presentation controls');if(toggle)tools.append(toggle);if(autoplay)tools.append(autoplay);
    let navigation=document.querySelector('.presentation-navigation');if(!navigation){navigation=document.createElement('nav');navigation.className='presentation-navigation';document.body.append(navigation);}navigation.setAttribute('aria-label','Slide navigation');
    for(const [button,name,icon] of [[previous,'Previous slide',icons.previous],[next,'Next slide',icons.next]]){if(button){button.setAttribute('aria-label',name);button.innerHTML=icon;navigation.append(button);}}
    if(!document.body.dataset.deckOutlineKeys){
      document.body.dataset.deckOutlineKeys='true';
      document.addEventListener('keydown',event=>{
        if(!['ArrowUp','ArrowDown'].includes(event.key)||event.altKey||event.ctrlKey||event.metaKey||event.target.closest('input,textarea,select,[contenteditable="true"]'))return;
        event.preventDefault();event.stopPropagation();
        const button=event.key==='ArrowDown'?next:previous;
        if(!button||button.disabled)return;
        button.click();
        requestAnimationFrame(()=>{const active=document.querySelector('#outline button.active');if(active&&getComputedStyle(document.querySelector('#outline')).display!=='none'){active.focus({preventScroll:true});active.scrollIntoView({block:'nearest'});}});
      },true);
    }
    return {back,tools,navigation};
  }
  function outlineMarkup(entries,current,{includeHeading=true}={}){
    let last='';return(includeHeading?'<h1>Outline</h1><p>'+entries.length+' slides</p>':'')+entries.map((entry,index)=>{const group=(entry.group||'').trim(),groupKey=group.toLowerCase();const heading=groupKey!==last&&group?'<h2>'+escapeHTML(group)+'</h2>':'';last=groupKey;return heading+'<button data-slide="'+index+'" data-index="'+index+'" class="'+(index===current?'active':'')+'" aria-current="'+(index===current?'step':'false')+'"><span class="num">'+String(index+1).padStart(2,'0')+'</span><span>'+escapeHTML(entry.label)+'</span></button>';}).join('');
  }
  window.DeckTemplate=Object.freeze({name:'Deck Template',labels,icons,playbackControls,playbackState,mountShell,outlineMarkup});
})();
