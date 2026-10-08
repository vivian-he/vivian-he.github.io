const entry=document.querySelector('#entry'),storePanel=document.querySelector('#storePanel'),home=document.querySelector('#home'),query=document.querySelector('#query');
const suggestions=['<b>brookfield place</b> naya','naya <b>30th</b>','naya <b>rockefeller</b>','naya <b>51st</b>','naya <b>225 liberty</b>','naya <b>bryant park</b>','naya <b>grand central</b>','naya <b>moynihan train hall</b>'];
document.querySelector('#suggestions').innerHTML=suggestions.map(s=>`<button class="suggest"><i class="magnify"></i><span>${s}</span></button>`).join('');
document.querySelector('#keys').innerHTML=['qwertyuiop','asdfghjkl','⇧zxcvbnm⌫'].map(row=>'<div class="keyrow">'+[...row].map(k=>`<span class="key ${'⇧⌫'.includes(k)?'wide':''}">${k}</span>`).join('')+'</div>').join('')+'<div class="keyrow"><span class="key wide">123</span><span class="key wide">☻</span><span class="key space">space</span><span class="key blue">search</span></div>';
// Picnic smooth.medium spring: stiffness 290, damping 34, mass 1.
// Sample the critically-near-damped curve for this framework-free iframe adapter.
function springFrames(from,to){const k=290,c=34,w=Math.sqrt(k),z=c/(2*w);return Array.from({length:61},(_,i)=>{const t=i/60*.62,wd=w*Math.sqrt(1-z*z),p=1-Math.exp(-z*w*t)*(Math.cos(wd*t)+z*w/wd*Math.sin(wd*t));return {transform:`translateX(${from+(to-from)*(i===60?1:p)}%)`,offset:i/60}})}
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;let busy=false;
async function openStore(){if(busy)return;busy=true;query.blur();await entry.animate([{transform:'translateY(0)',opacity:1},{transform:'translateY(5%)',opacity:0}],{duration:reduced?0:100,easing:'ease-in',fill:'forwards'}).finished;entry.hidden=true;await new Promise(r=>setTimeout(r,reduced?0:30));storePanel.inert=false;storePanel.removeAttribute("aria-hidden");home.animate(springFrames(0,-25),{duration:reduced?0:560,fill:'forwards'});await storePanel.animate(springFrames(100,0),{duration:reduced?0:560,fill:'forwards'}).finished;busy=false;}
function reset(){if(busy)return;storePanel.inert=true;storePanel.setAttribute("aria-hidden","true");entry.hidden=false;[entry,home,storePanel].forEach(el=>el.getAnimations().forEach(a=>a.cancel()));query.value='naya';document.querySelector('#result').hidden=false;}
document.querySelector('#result').onclick=openStore;document.querySelectorAll('.suggest').forEach(b=>b.onclick=openStore);document.querySelector('#searchForm').onsubmit=e=>{e.preventDefault();openStore()};document.querySelector('#clear').onclick=()=>{query.value='';document.querySelector('#result').hidden=true};query.oninput=()=>document.querySelector('#result').hidden=!query.value.trim();document.querySelector('#close').onclick=()=>entry.hidden=true;

// Reuse the store's own Back button, without a second overlaid control.
document.querySelector('#store').addEventListener('load',()=>{
 const doc=document.querySelector('#store').contentDocument;
 doc?.addEventListener('click',e=>{const b=e.target.closest('button');if(b?.getAttribute('aria-label')==='Back'){e.preventDefault();e.stopImmediatePropagation();reset()}},true);
});

function syncQuery(){const typed=!!query.value.trim();document.querySelector('#clear').hidden=!typed;document.querySelector('#result').hidden=!typed;document.querySelector('#suggestions').hidden=!typed}
query.addEventListener('input',syncQuery);document.querySelector('#clear').addEventListener('click',syncQuery);
function bindHomeSearch(){const doc=home.contentDocument;if(!doc||doc.__merchantSearchBound)return;doc.__merchantSearchBound=true;doc.addEventListener('click',e=>{const b=e.target.closest('button');if(b&&/search/i.test(b.textContent+' '+b.getAttribute('aria-label'))){e.preventDefault();e.stopImmediatePropagation();reset();syncQuery()}},true)}
home.addEventListener('load',bindHomeSearch);bindHomeSearch();syncQuery();
document.querySelector('#keys').addEventListener('click',e=>{const k=e.target.closest('.key')?.textContent;if(!k)return;if(k==='search'){if(query.value.trim())openStore();return}if(k==='⌫')query.value=query.value.slice(0,-1);else if(k==='space')query.value+=' ';else if(/^[a-z]$/.test(k))query.value+=k;syncQuery()});
