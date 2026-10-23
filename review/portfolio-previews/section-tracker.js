/* Navigation observes real section geometry; oversized stories keep their natural scroll range. */
const sections=[...document.querySelectorAll('main > .story-section, .section-list > .story-section')];
if(sections.length){
 document.documentElement.classList.add('section-snap');
 const nav=document.createElement('nav');nav.className='section-dots';nav.setAttribute('aria-label','Case study sections');
 const links=sections.map((section,i)=>{const a=document.createElement('a');a.href='#'+section.id;a.setAttribute('aria-label',section.querySelector('h1,h2')?.textContent||'Section '+(i+1));a.title=a.getAttribute('aria-label');nav.append(a);return a});
 document.body.append(nav);
 const update=()=>{let index=0,best=Infinity;sections.forEach((s,i)=>{let r=s.getBoundingClientRect();let distance=r.top<=innerHeight*.45&&r.bottom>=innerHeight*.45?0:Math.abs(r.top-innerHeight*.25);if(distance<best){best=distance;index=i}});links.forEach((a,i)=>{if(i===index)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current')})};
 let settle;let wheelUntil=0;
 addEventListener('wheel',()=>{wheelUntil=performance.now()+180},{passive:true});
 addEventListener('scroll',()=>{update();clearTimeout(settle);settle=setTimeout(()=>{if(matchMedia('(prefers-reduced-motion: reduce)').matches||performance.now()>wheelUntil+200)return;const eligible=sections.map(s=>({s,r:s.getBoundingClientRect()})).filter(x=>x.r.height<=innerHeight*1.15);const nearest=eligible.sort((a,b)=>Math.abs(a.r.top)-Math.abs(b.r.top))[0];if(nearest&&Math.abs(nearest.r.top)<innerHeight*.30&&Math.abs(nearest.r.top)>2)nearest.s.scrollIntoView({behavior:'instant',block:'start'})},100)},{passive:true});addEventListener('resize',update);update();
}
