/* One caption component for slide media, including nested preview components. */
(()=>{
 const docs=new WeakSet(),roots=new WeakSet(),frames=new WeakSet();
 function install(doc){
  if(!doc?.defaultView||docs.has(doc))return;docs.add(doc);const win=doc.defaultView;
  if(!win.customElements.get('deck-screen-caption'))win.customElements.define('deck-screen-caption',class extends win.HTMLElement{
   constructor(){super();this.attachShadow({mode:'open'}).innerHTML='<style>:host{display:block;font:400 14px/1.35 DeckNorms,Arial,sans-serif;color:#737980;letter-spacing:0;text-align:center}::slotted(*){font:inherit!important;color:inherit!important}</style><slot></slot>'}
  });
  scan(doc);
 }
 function scan(root){
  if(!root?.querySelectorAll)return;
  if(!roots.has(root)){roots.add(root);new MutationObserver(()=>scan(root)).observe(root,{childList:true,subtree:true})}
  for(const label of root.querySelectorAll('figcaption,.map-option>h3')){
   if(label.querySelector('deck-screen-caption'))continue;
   const cap=label.ownerDocument.createElement('deck-screen-caption');while(label.firstChild)cap.append(label.firstChild);label.append(cap);
   label.style.fontWeight='400';
  }
  for(const el of root.querySelectorAll('rewards-dashboard-comparison,rewards-map-comparison,rewards-intro-scene,meal-discovery-story,meal-home-cover'))if(el.shadowRoot&&!el.matches('deck-screen-caption'))scan(el.shadowRoot);
  for(const frame of root.querySelectorAll('iframe')){if(!frames.has(frame)){frames.add(frame);frame.addEventListener('load',()=>{try{install(frame.contentDocument)}catch{}})}try{install(frame.contentDocument)}catch{}}
 }
 install(document);if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>scan(document),{once:true});
})();
