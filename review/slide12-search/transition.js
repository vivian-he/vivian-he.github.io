// Search lead-in from the Oct 6 recording; results remain the approved v4 Full UI.
const entry=document.querySelector('#entry'),query=document.querySelector('#query'),browse=document.querySelector('#browse'),auto=document.querySelector('#autocomplete'),panel=document.querySelector('#resultsPanel'),home=document.querySelector('#home'),loading=document.querySelector('#loading');
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const historyIcon='<svg viewBox="0 0 24 24"><path d="M4 5v5h5M4 10a8 8 0 1 1 1 8M12 7v6l3 2"/></svg>';
function categories(items){return '<div class="categories">'+items.map(([name,img])=>`<button class="category"><div>${img.startsWith('Type_')?`<img src="../slide10-hub/assets/${img}" alt="">`:`<span class="emoji">${img}</span>`}</div>${name}</button>`).join('')+'</div>'}
browse.innerHTML='<h2>Recent searches</h2>'+['NAYA','pad thai','Thai'].map(x=>`<button class="recent" data-query="${x}">${historyIcon}<span>${x}</span></button>`).join('');
auto.innerHTML='<button class="suggest" data-results><i class="magnify"></i><span>thai</span></button><button class="suggest" data-results data-demo-pad-thai><i class="reference-logo dish"></i><b>pad thai</b></button>'+[['Wang Lang','4.7','0.5 mi · Sponsored','Thai, Upscale Casual Dining, Noodles, Rice'],['Thai Terminal','4.7','1.7 mi','Thai, Casual Dining, Noodles, Curry'],['Thai Noodle House','4.4','1.3 mi','Thai, Fast Casual, Noodles, Rice'],['Thai72','4.7','3.0 mi','Thai, Noodle House, Curry, Wraps']].map(([n,r,d,c],i)=>`<button class="autocomplete-store" data-results><span class="reference-logo logo-${i}"></span><span><strong>${n}</strong><small class="rating-line"><b class="${i===2?'rating-muted':''}">${r} <svg class="rating-star" viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M8.911.588a1 1 0 0 0-1.822 0L5.373 4.384l-4.14.459a1 1 0 0 0-.564 1.733l3.08 2.805-.843 4.08a1 1 0 0 0 1.475 1.07L8 12.47l3.62 2.063a1 1 0 0 0 1.474-1.071l-.844-4.08 3.08-2.805a1 1 0 0 0-.563-1.733l-4.14-.459z"/></svg></b> · ${d}</small><small>${c}</small></span></button>`).join('')+'<button class="suggest" data-results><i class="magnify"></i><span>thai <b>food</b></span></button>';
document.querySelector('#keys').innerHTML=['qwertyuiop','asdfghjkl','⇧zxcvbnm⌫'].map(row=>'<div class="keyrow">'+[...row].map(k=>`<span class="key ${'⇧⌫'.includes(k)?'wide':''}">${k}</span>`).join('')+'</div>').join('')+'<div class="keyrow"><span class="key wide">123</span><span class="key wide">☻</span><span class="key space">space</span><span class="key blue">search</span></div>';
document.querySelector('.bones').innerHTML=Array.from({length:3},()=>'<div class="bone short"></div><div class="bone"></div><div class="bone photo"></div><div class="bone short"></div>').join('');
let timer,busy=false;
function update(){document.querySelector('#clear').hidden=!query.value.trim();clearTimeout(timer);timer=setTimeout(()=>{const typed=!!query.value.trim();browse.hidden=typed;auto.hidden=!typed;if(typed&&!reduced)auto.animate([{opacity:0},{opacity:1}],{duration:130})},140)}
query.onfocus=()=>entry.classList.add('typing');query.oninput=()=>{entry.classList.add('typing');update()};
document.querySelectorAll('[data-query]').forEach(b=>b.onclick=()=>{if(b.dataset.query==='NAYA'){location.assign('/review/slide13-merchant-search/index.html');return}query.value=b.dataset.query;entry.classList.add('typing');update()});
document.querySelectorAll('.category').forEach(b=>b.onclick=()=>{query.value='thai';entry.classList.add('typing');update()});
async function openResults(){if(busy||!query.value.trim())return;busy=true;query.blur();entry.classList.remove('typing');await entry.animate([{opacity:1},{opacity:0}],{duration:reduced?0:120,fill:'forwards'}).finished;entry.hidden=true;panel.inert=false;panel.removeAttribute('aria-hidden');loading.hidden=false;home.animate([{transform:'translateX(0)'},{transform:'translateX(-25%)'}],{duration:reduced?0:400,easing:'cubic-bezier(.2,.8,.2,1)',fill:'forwards'});await panel.animate([{transform:'translateX(100%)'},{transform:'translateX(0)'}],{duration:reduced?0:400,easing:'cubic-bezier(.2,.8,.2,1)',fill:'forwards'}).finished;await new Promise(r=>setTimeout(r,reduced?0:280));loading.hidden=true;busy=false}
document.querySelectorAll('[data-results]').forEach(b=>b.onclick=openResults);document.querySelector('#searchForm').onsubmit=e=>{e.preventDefault();openResults()};document.querySelector('#clear').onclick=()=>{query.value='';update()};document.querySelector('#close').onclick=()=>entry.hidden=true;
function reset(){entry.hidden=false;panel.inert=true;panel.setAttribute('aria-hidden','true');[entry,panel,home].forEach(el=>el.getAnimations().forEach(a=>a.cancel()));query.value='';entry.classList.remove('typing');update()}
document.querySelector('#search').addEventListener('load',()=>document.querySelector('#search').contentDocument?.addEventListener('click',e=>{const b=e.target.closest('button');if(/^Back(?: to search)?$/.test(b?.getAttribute('aria-label')||'')){e.preventDefault();e.stopImmediatePropagation();reset()}},true));
window.resetSearchDemo=reset;
// The visual keyboard also accepts taps during a presentation.
document.querySelector('#keys').addEventListener('click',e=>{const key=e.target.closest('.key');if(!key)return;const k=key.textContent;if(k==='search'){openResults();return}if(k==='⌫')query.value=query.value.slice(0,-1);else if(k==='space')query.value+=' ';else if(k.length===1&&/[a-z]/i.test(k))query.value+=k;entry.classList.add('typing');update()});

// Home first; opening search is triggered only by the Home search control.
entry.hidden=true;
function openSearch(){entry.getAnimations().forEach(a=>a.cancel());entry.hidden=false;entry.classList.add('typing');query.value='';query.focus({preventScroll:true});update();if(!reduced)entry.animate([{transform:'translateY(12%)',opacity:0},{transform:'translateY(0)',opacity:1}],{duration:360,easing:'cubic-bezier(.2,.8,.2,1)'});}
function bindHome(){const doc=home.contentDocument;if(!doc)return;doc.addEventListener('click',e=>{const b=e.target.closest('button');if(b&&/search/i.test(b.textContent+' '+b.getAttribute('aria-label'))){e.preventDefault();e.stopImmediatePropagation();openSearch()}},true)}
home.addEventListener('load',bindHome);if(home.contentDocument?.readyState==='complete')bindHome();

const resultsFrame=document.querySelector('#search');
function mountResultChrome(){installResultsChrome(resultsFrame,()=>{reset();query.value='pad thai';entry.classList.add('typing');update()})}
resultsFrame.addEventListener('load',mountResultChrome);if(resultsFrame.contentDocument?.readyState==='complete')mountResultChrome();

// Direct screen entry for the master flow map; default deck playback is unchanged.
const flowScreen=new URLSearchParams(location.search).get('flowScreen');
if(flowScreen==='cold'||flowScreen==='autocomplete'){
 openSearch();
 if(flowScreen==='autocomplete'){query.value='thai';update()}
}
if(flowScreen==='results'){query.value='pad thai';openResults()}

if(flowScreen==='loading'){
 query.value='pad thai';entry.hidden=true;panel.inert=false;panel.removeAttribute('aria-hidden');panel.style.transform='translateX(0)';loading.hidden=false;
 const freeze=document.createElement('style');freeze.textContent='*,*::before,*::after{animation-play-state:paused!important}';document.head.append(freeze);
}
