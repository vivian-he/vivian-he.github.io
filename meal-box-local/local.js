document.querySelectorAll('form').forEach(form=>{form.id='signup';form.addEventListener('submit',e=>{e.preventDefault();alert('This is a local preview. No information was submitted.');});});
document.querySelectorAll('a').forEach(a=>{if(/Sign Up Now|Talk to sales/.test(a.textContent))a.href='#signup';});
document.querySelectorAll('.faq-section button').forEach(b=>{b.setAttribute('aria-expanded','false');b.addEventListener('click',()=>{const p=b.nextElementSibling;const open=b.getAttribute('aria-expanded')!=='true';b.setAttribute('aria-expanded',String(open));p.style.display=open?'block':'none';p.style.maxHeight=open?'none':'0px';});});
const benefits=Array.from(document.querySelectorAll('[data-component="accordion-item"]'));
function activate(h){benefits.forEach(x=>{x.style.opacity=x===h?'1':'0.4';const p=x.nextElementSibling;if(p){p.style.height=x===h?'auto':'0px';p.style.opacity=x===h?'1':'0';}});}
benefits.forEach(h=>{h.style.cursor='pointer';h.tabIndex=0;h.addEventListener('click',()=>activate(h));h.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();activate(h);}});});if(benefits[0])activate(benefits[0]);
document.querySelectorAll('#header-cta').forEach(b=>b.addEventListener('click',()=>document.getElementById('signup').scrollIntoView({behavior:'smooth'})));
