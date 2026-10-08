// Shared Home vertical entry. Update its label/icon/destination here for every deck prototype.
(()=>{if(window.__mealboxHomeEntry)return;window.__mealboxHomeEntry=true;
const HUB='/review/slide10-hub/prototypes/mb-hub-v4/index.html?embed=1&world=after&bigimg=1&nodp=1&storefirst=1&allmeals=1';
// Picnic generated MealBoxLine24 — canonical Prism asset.
const icon='<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M11.995 5.995a1 1 0 0 1 .865.5h.009v.014c.08.144.126.31.126.486v.244c.89.21 1.485.642 1.786.913a.75.75 0 0 1 .231.567v.12a.82.82 0 0 1-.822.821c-.243 0-.473-.11-.663-.263-.292-.234-.8-.54-1.462-.54-.804 0-1.273.468-1.273 1.004 0 1.742 4.622.737 4.623 4.087 0 1.37-.865 2.47-2.42 2.824v.223a1 1 0 0 1-.126.486v.014h-.008a1 1 0 0 1-1.732 0h-.002v-.006a1 1 0 0 1-.132-.494v-.175a4.7 4.7 0 0 1-2.473-1.24.74.74 0 0 1-.21-.533v-.083c0-.45.366-.815.816-.815.247 0 .48.115.668.276.348.297 1.01.729 1.933.73 1.005 0 1.541-.537 1.541-1.207 0-1.742-4.622-.737-4.622-4.087 0-1.223.885-2.317 2.347-2.638v-.228c0-.18.048-.35.132-.495v-.005h.003a1 1 0 0 1 .865-.5"/><path fill-rule="evenodd" d="M9.874 1.388a3 3 0 0 1 4.242 0l1.313 1.314c.188.187.442.293.707.293h1.86a3 3 0 0 1 3 3v1.86a1 1 0 0 0 .294.707L22.6 9.874a3 3 0 0 1 0 4.242l-1.311 1.312a1 1 0 0 0-.293.707v1.86a3 3 0 0 1-3 3h-1.86c-.266 0-.52.105-.708.293L14.116 22.6a3 3 0 0 1-4.242 0L8.56 21.288a1 1 0 0 0-.707-.293H5.997a3 3 0 0 1-3-3v-1.857c0-.265-.106-.52-.293-.707l-1.316-1.315a3 3 0 0 1 0-4.242l1.316-1.316c.187-.187.293-.442.293-.707V5.995a3 3 0 0 1 3-3h1.856c.265 0 .52-.106.707-.293zm2.828 1.415a1 1 0 0 0-1.414 0L9.974 4.116a3 3 0 0 1-2.12.879H5.996a1 1 0 0 0-1 1V7.85c0 .796-.317 1.559-.88 2.121l-1.315 1.316a1 1 0 0 0 0 1.414l1.316 1.315c.562.563.879 1.326.879 2.122v1.856a1 1 0 0 0 1 1h1.856c.796 0 1.559.316 2.121.879l1.314 1.313a1 1 0 0 0 1.414 0l1.313-1.313a3 3 0 0 1 2.121-.88h1.86a1 1 0 0 0 1-1v-1.86a3 3 0 0 1 .88-2.12l1.311-1.312a1 1 0 0 0 0-1.414l-1.311-1.312a3 3 0 0 1-.88-2.12V5.994a1 1 0 0 0-1-1h-1.86a3 3 0 0 1-2.12-.879z" clip-rule="evenodd"/></svg>';
// A native v4 Back may render its bundled legacy Home. Hand it back to the
// canonical Home only when it is genuinely the visible surface, never under a store.
function retireVisibleLegacyHome(doc){
 const home=doc.querySelector('.gx-home > .pedregal-p1-host > .pedregal-p1');
 if(!home||doc.__retiringLegacyHome)return;
 const win=doc.defaultView, rect=home.getBoundingClientRect();
 if(rect.width<1||rect.height<1)return;
 for(let el=home;el;el=el.parentElement){const css=win.getComputedStyle(el);if(el.hidden||css.display==='none'||css.visibility==='hidden'||Number(css.opacity)===0)return;}
 const x=Math.max(0,Math.min(win.innerWidth-1,rect.left+rect.width/2));
 const y=Math.max(0,Math.min(win.innerHeight-1,rect.top+Math.min(rect.height/2,220)));
 if(!home.contains(doc.elementFromPoint(x,y)))return;
 let current=win,master=null;
 while(current!==current.parent){
  try{const frame=current.frameElement;if(frame){const r=frame.getBoundingClientRect(),css=current.parent.getComputedStyle(frame);if(frame.hidden||r.width<1||r.height<1||css.display==='none'||css.visibility==='hidden')return;const top=current.parent.document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);if(top!==frame)return;}
   current=current.parent;if(current.ConsumerFlow){master=current.ConsumerFlow;break;}
  }catch{return;}
 }
 doc.__retiringLegacyHome=true;
 if(master){master.navigate('home');const entry=win.frameElement?.getAttribute('src');if(entry&&!new URL(entry,doc.baseURI).searchParams.has('homebase')&&new URL(entry,doc.baseURI).searchParams.get('screen')!=='home')win.location.replace(new URL(entry,doc.baseURI).href);}
 else win.location.replace('/review/slide11-browse/app/index.html?embed=1&homebase=1');
}
function install(doc){if(!doc||!doc.documentElement||doc.__mealboxEntryBound)return;doc.__mealboxEntryBound=true;
 const shared=doc.createElement('script');shared.src='/review/shared/home-header.js?v=sticky-nav-2';doc.head.append(shared);
 const patch=()=>{retireVisibleLegacyHome(doc);doc.querySelectorAll('nav[aria-label="Verticals"],.pedregal-verticals').forEach(nav=>{if(nav.querySelector('[data-mealbox-entry]'))return;const first=[...nav.querySelectorAll('button')].find(b=>b.textContent.trim()==='Home');if(!first)return;const b=doc.createElement('button');b.type='button';b.className='pedregal-verticals__tab';b.dataset.mealboxEntry='true';b.style.cssText='flex:0 0 auto;min-width:96px;white-space:nowrap;color:#606060';b.innerHTML=icon+'<span class="pedregal-verticals__label">$12 Meal Box</span>';b.onclick=()=>doc.defaultView.location.assign(HUB);first.after(b)});doc.querySelectorAll('iframe').forEach(f=>{if(f.dataset.mealboxEntryBound)return;f.dataset.mealboxEntryBound='true';f.addEventListener('load',()=>{try{install(f.contentDocument)}catch{}});try{install(f.contentDocument)}catch{}})};
 doc.defaultView.addEventListener('load',patch,{once:true});doc.addEventListener('transitionend',patch);
 let pending=false;new MutationObserver(()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;patch()})}).observe(doc.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['class','style','hidden']});patch();}
install(document);
})();
