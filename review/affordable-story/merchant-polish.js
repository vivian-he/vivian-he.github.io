/* Concise merchant narrative. Sources remain in slide notes and the impact ledger. */
function renderMerchantPolish(s){
 const root=document.querySelector('#slide');
 window.marketScaleCleanup?.();
 if(!['consumer-divider','merchant-divider','merchant-process','merchant-scale','closing-thanks'].includes(s.id))return false;
 window.opsCleanup?.();
 root.className='merchant-polished mp-'+s.id;
 if(s.id==='consumer-divider'||s.id==='merchant-divider'){root.classList.add('experience-divider');root.innerHTML=s.id==='consumer-divider'?'<h2>Now, let’s define<br>the consumer experience</h2>':'<h2>The Merchant Experience</h2>';}
 if(s.id==='merchant-process')root.innerHTML='<section class="mp-heading"><h2>How We Work<br>with Merchants</h2></section><section class="mp-process">'+[['01','Find, pitch & enroll','Partner with restaurants. Build the meals. Get them live.'],['02','Check quality','Collect evidence. Assess meals. Follow up.'],['03','Report & support','Share results. Recommend the next step.']].map(([n,t,p])=>'<article><span>'+n+'</span><div><h3>'+t+'</h3><p>'+p+'</p></div></article>').join('')+'</section>';
 if(s.id==='merchant-scale'){
  root.innerHTML='<section class="mp-heading"><h2>As we scale to more markets,<br>how do we scale our work?</h2></section><section class="mp-scale"><div class="mp-market-count" aria-label="From 7 to 28 markets"><span aria-hidden="true">7</span><i aria-hidden="true">→</i><strong aria-hidden="true">7</strong><span class="mp-market-unit" aria-hidden="true">markets</span></div><div class="mp-reps"><strong>~165</strong><p>pre-sales reps<br>supporting expansion</p></div></section>';
  const count=root.querySelector('.mp-market-count strong');let frame=0,start=null;
  window.marketScaleCleanup=()=>cancelAnimationFrame(frame);
  function tick(time){if(!count.isConnected)return;start??=time;const progress=Math.min((time-start)/1500,1);count.textContent=String(Math.round(7+21*(1-Math.pow(1-progress,3))));if(progress<1)frame=requestAnimationFrame(tick);}
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)count.textContent='28';else frame=requestAnimationFrame(tick);
 }
 if(s.id==='closing-thanks')root.innerHTML='<section class="mp-close-copy"><div class="mp-close-brand">DoorDash <img src="assets/closing/mb-12-seal-flat.svg" alt="$12"> Meal Boxes</div><h2>More value for customers<br>More opportunity for merchants</h2></section><section class="mp-close-photos" aria-label="Merchant activation visits">'+[[2,'Merchant Report and Feedback: Wow Tikka'],[1,'Merchant Activation: Dirty Water Pizza']].map(([n,caption])=>'<figure tabindex="0"><img src="assets/closing/merchant-visit-0'+n+'.jpeg" alt="'+caption+'"><figcaption>'+caption+'</figcaption></figure>').join('')+'</section>';
 return true;
}
function polishMerchantDetails(s){
 if(!['merchant-enroll','merchant-quality','merchant-report'].includes(s.id))return;
 const root=document.querySelector('#slide'),expanded=root.querySelector('.unified-expanded');
 if(!expanded)return;
 root.classList.add('mp-details');
 if(s.id==='merchant-enroll'){const demo=root.querySelector('.ops-demo');if(demo){demo.className='mp-enrollment-screen';demo.innerHTML='<div class="mp-enrollment-browser"><div class="mp-browser-tabs"><div class="mp-window-controls" aria-hidden="true"><i></i><i></i><i></i></div><div class="mp-browser-tab"><span class="mp-tab-icon">D</span>DoorDash for Merchants <span aria-hidden="true">×</span></div></div><div class="mp-enrollment-toolbar"><span class="mp-browser-nav" aria-hidden="true">← &nbsp; → &nbsp; ↻</span><div class="mp-address-bar"><span aria-hidden="true">⌘</span> DoorDash for Merchants</div><span class="mp-browser-menu" aria-hidden="true">⋮</span></div><div class="mp-enrollment-viewport"><iframe src="/meal-box-local/" title="Merchant self-enrollment prototype" loading="eager"></iframe></div></div>';}}
 const data={
 'merchant-enroll':{title:'Make enrollment easier',steps:['Move beyond manual outreach with automated enrollment and self-serve meal setup.'],metric:'250',suffix:' hours',label:'Illustrative savings per 1,000 enrollments',note:'',count:250},
 'merchant-quality':{title:'See quality at scale',steps:['With 22,000 SKUs created historically, manual taste tests alone cannot cover every meal.','Use customer photos and AI-assisted review to help teams vet quality and focus follow-up.'],metric:'1,442',label:'customer review submissions in the past two weeks',note:'',count:1442},
 'merchant-report':{title:'Report and Support',steps:['Automate routine performance reviews instead of relying on one-to-one conversations with every merchant.','Give post-sales reps more time for targeted support and follow-up.'],metric:'~200',label:'merchants per post-sales rep, per sub-market',note:''}
 }[s.id];
 root.querySelector('.unified-step.expanded h3').textContent=data.title;
 expanded.innerHTML='<ol>'+data.steps.map(x=>'<li>'+x+'</li>').join('')+'</ol><div class="unified-metric"><strong aria-label="'+data.metric+(data.suffix||'')+'"><span class="metric-count">'+data.metric+'</span>'+(data.suffix||'')+'</strong><p>'+data.label+'</p><small>'+data.note+'</small></div>';
 if(data.count&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
  const counter=expanded.querySelector('.metric-count');let start=null;
  function tick(time){if(!counter.isConnected)return;start??=time;const progress=Math.min((time-start)/1600,1);counter.textContent=Math.round(data.count*(1-Math.pow(1-progress,3))).toLocaleString('en-US');if(progress<1)requestAnimationFrame(tick);}
  counter.textContent='0';requestAnimationFrame(tick);
 }
}
