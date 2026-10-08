// Shared geometry for consumer and merchant overview → focused journey transitions.
const CX_PHASES=['Discover','Explore','Try','Reinforce'];
window.captureJourney=()=>Object.fromEntries([...document.querySelectorAll('[data-journey-key]')].map(el=>[el.dataset.journeyKey,el.getBoundingClientRect().toJSON()]));
function journeyRail(focused=false){return '<ol class="story-rail '+(focused?'focused':'')+'">'+CX_PHASES.map((label,i)=>`<li data-journey-key="cx-${i}" class="${focused&&i===0?'is-focus':''}"><span class="rail-dot"></span><h3>${label}</h3></li>`).join('')+'</ol>'}
window.finishJourney=(s,before={})=>{
 if(s.walk==='home'&&window.introPhoneHold)s={...s,walk:'introPhone'};
 const root=document.querySelector('#slide');
 const phoneLabels={introPhone:['Meet consumers','where they are'],notificationHub:['Browse our','rich selection'],intro:['Meet consumers','where they are'],home:['33%','Openly browse'],suggest:['24% browses among','multiple stores'],search:['45%','Search generally'],store:['22% go to a','specific store'],encounter:['Encounter',' $12 Meal Box'],hub:['Browse every','meal'],usi:['The Meal Box','list'],item:['Understand','this meal'],checkout:['Reinforce','value'],celebration:['Value,','reinforced'],bundle:['Meals','to share'],closed:['Plan','for later']};
 if(s.layout==='consumer-walk'&&phoneLabels[s.walk]){
  const panel=document.querySelector('#consumer-walk'),heading=panel.querySelector('.walk-heading h2'),caption=panel.querySelector('.walk-caption');
  heading.innerHTML=phoneLabels[s.walk].map(line=>esc(line).replace(/^(\d+%)/,'<span class="phone-percentage">$1</span>')).join('<br>');caption.textContent='';
  panel.querySelector('.walk-entry-stat').hidden=true;
 }

 if(s.merchant==='process'){
  const rail=root.querySelector('.unified-timeline'),title=rail?.querySelector('h2');
  if(title){root.prepend(title);root.classList.add('story-merchant-overview');}
 }
 if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 document.querySelectorAll('[data-journey-key]').forEach(el=>{const prev=before?.[el.dataset.journeyKey];if(!prev)return;const now=el.getBoundingClientRect();el.animate([{transform:`translate(${prev.x-now.x}px,${prev.y-now.y}px) scale(${prev.width/now.width},${prev.height/now.height})`},{transform:'translate(0,0) scale(1)'}],{duration:850,easing:'cubic-bezier(.22,1,.36,1)'});el.style.transformOrigin='top left';});
};
const finishJourneyLayout=window.finishJourney;
window.finishJourney=(s,before)=>{finishJourneyLayout(s,before);if(s.layout==='consumer-walk')bindConsumerFlow()};
