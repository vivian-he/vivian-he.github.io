// Presentation-only result chrome; the approved Full UI cards remain owned by v4.
function installResultsChrome(frame, onSearch) {
 const doc=frame.contentDocument;if(!doc?.body)return;
 const style=doc.createElement('style');style.textContent=`
 .gxs-search-row:has(.gxs-search-pill--filled){position:relative;height:50px;padding:0 12px}
 .gxs-search-pill--filled{visibility:hidden;box-shadow:none!important}
 .deck-query-title{position:absolute;left:54px;right:54px;text-align:center;font:500 17px/22px 'DD Norms',sans-serif;letter-spacing:0;pointer-events:none;color:#191919}
 #deck-search-dock{position:fixed;z-index:2147483647;bottom:22px;left:16px;right:16px;height:50px;display:flex;align-items:center;gap:12px;padding:0 12px 0 16px;background:white;border:1px solid #dedede;border-radius:28px;box-shadow:0 5px 20px #0002;font:700 16px 'DD Norms',sans-serif;color:#191919;cursor:pointer}
 #deck-search-dock svg{width:22px;height:22px;flex-shrink:0}
 #deck-search-dock .dock-query{flex:1;text-align:left}
 #deck-search-dock .dock-ask{display:flex;align-items:center;gap:6px;border-radius:22px;padding:7px 13px;background:#f1f1f1}
 /* Tabs leave 12px above the filters; the chip row supplies 12px below. */
 .gxs-chip-row + .gxs-results > .gxs-store:first-child{padding-top:0!important}
 .gxs-results{padding-bottom:0!important}
 .gxs-results:last-child{padding-bottom:100px!important}
 .gxs-mb-card__meta .deck-prism-star{display:inline-block;width:16px;height:16px;flex:0 0 16px;vertical-align:-2px;color:#606060}
 .gxs-mb-section{scroll-margin-top:16px}
 `;doc.head.append(style);
 // Exact Prism StarFill16 geometry from the local Picnic source snapshot.
 function syncStars(){doc.querySelectorAll('.gxs-mb-card__meta').forEach(meta=>{
  [...meta.childNodes].filter(node=>node.nodeType===3&&node.textContent.includes('★')).forEach(node=>{
   const fragments=node.textContent.split('★'),replacement=doc.createDocumentFragment();
   fragments.forEach((text,index)=>{if(index){const svg=doc.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('class','deck-prism-star');svg.setAttribute('viewBox','0 0 16 16');svg.setAttribute('aria-hidden','true');svg.innerHTML='<path fill="currentColor" d="M8.911.588a1 1 0 0 0-1.822 0L5.373 4.384l-4.14.459a1 1 0 0 0-.564 1.733l3.08 2.805-.843 4.08a1 1 0 0 0 1.475 1.07L8 12.47l3.62 2.063a1 1 0 0 0 1.474-1.071l-.844-4.08 3.08-2.805a1 1 0 0 0-.563-1.733l-4.14-.459z"/>';replacement.append(svg);}replacement.append(doc.createTextNode(text));});node.replaceWith(replacement);
  });
 });}
 function syncLoadingHeader(){
  const container=document.querySelector('#loading');if(!container)return;
  const source=doc.querySelector('.gx-search');if(!source?.querySelector('.deck-query-title'))return;
  let header=container.querySelector('.loading-exact-header');if(!header){header=document.createElement('div');header.className='loading-exact-header';container.querySelector('.loading-title')?.remove();container.prepend(header)}
  const pieces=['.gxs-status-bar','.gxs-search-row','.gxs-tabs','.gxs-chip-row'].map(sel=>source.querySelector(sel)).filter(Boolean);
  const fragment=document.createDocumentFragment();
  pieces.forEach(original=>{const clone=original.cloneNode(true);const originals=[original,...original.querySelectorAll('*')],copies=[clone,...clone.querySelectorAll('*')];originals.forEach((node,i)=>{const style=doc.defaultView.getComputedStyle(node);for(const name of style)copies[i].style.setProperty(name,style.getPropertyValue(name));});Object.assign(clone.style,{position:'relative',top:'auto',left:'auto',right:'auto',width:'100%',margin:'0',transform:'none'});clone.querySelectorAll('button').forEach(button=>{if(/Back/.test(button.getAttribute('aria-label')||''))button.onclick=onSearch});fragment.append(clone)});
  header.replaceChildren(fragment);for(const face of doc.fonts){try{document.fonts.add(face)}catch{}}
 }
 function sync(){syncStars();const row=doc.querySelector('.gxs-search-pill--filled')?.parentElement;let dock=doc.querySelector('#deck-search-dock');if(!row){if(dock)dock.hidden=true;const outer=document.querySelector('#results-search-dock');if(outer)outer.hidden=true;return}if(!row.querySelector('.deck-query-title')){const title=doc.createElement('span');title.className='deck-query-title';title.textContent='"pad thai"';row.append(title)}if(!dock){dock=doc.createElement('button');dock.id='deck-search-dock';dock.setAttribute('aria-label','Edit search: pad thai');dock.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="10" cy="10" r="7"/><path d="m15 15 6 6"/></svg><span class="dock-query">pad thai</span><span class="dock-ask"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z"/></svg>Ask</span>';dock.onclick=onSearch;doc.body.append(dock);const outer=document.createElement('button');outer.id='results-search-dock';outer.innerHTML=dock.innerHTML;outer.setAttribute('aria-label','Edit search: pad thai');outer.onclick=onSearch;if(!document.querySelector('#results-search-dock'))document.querySelector('#resultsPanel').append(outer)}dock.style.display='none';const outer=document.querySelector('#results-search-dock');if(outer)outer.hidden=false;syncLoadingHeader();}
 let queued=false;const observer=new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;sync()})});observer.observe(doc.body,{childList:true,subtree:true});sync();[200,700].forEach(ms=>setTimeout(syncLoadingHeader,ms));
}
