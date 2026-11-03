/* Four separate intro slides, adapted from Vivian's original Figma references. */
(()=>{
 const base='/assets/about-me-2026-10-29/';
 const style=document.createElement('style');style.id='about-me-styles';style.textContent=`
 .intro-screen{width:1200px;height:675px;color:#283943;font-family:DeckNorms,Arial,sans-serif}.intro-screen p{font-family:DeckNorms,Arial,sans-serif;font-weight:400}
 .intro-screen figure{margin:0;overflow:hidden;background:#e7e7e7}
 .intro-screen img{display:block;width:100%;height:100%;object-fit:cover}
 .intro-greeting{display:grid;grid-template-columns:510px 392px;gap:94px;align-items:center;padding:65px 102px}
 .intro-greeting h1{font:700 58px/1.13 DeckNorms,Arial,sans-serif;letter-spacing:-2px;white-space:pre-line;margin:0 0 30px}
 .intro-greeting p{font-size:20px;color:#767d85;margin:0;line-height:1.4}
 .intro-greeting p.intro-education{font-size:20px;margin-top:14px}
 .intro-greeting figure{height:543px;border-radius:23px;box-shadow:none}
 .intro-greeting figure img{object-position:50% 50%}
 .intro-personal{display:grid;grid-template-columns:repeat(3,1fr);gap:28px;padding:65px 0}
 .intro-personal figure{border-radius:23px;box-shadow:none}
 .intro-personal .hiking img{object-position:48% 50%}
 .intro-personal .chicken img{object-position:50% 50%}
 .intro-personal .drawing img{object-position:50% 50%}
 .intro-career{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:65px 68px}
 .intro-career-row{display:flex;align-items:center;justify-content:space-between;width:100%;gap:44px}
 .intro-career-row figure{width:160px;height:160px;flex:none;border-radius:50%;background:transparent;filter:drop-shadow(2px 6px 6px #00000022);overflow:visible}
 .intro-career-row figure img{object-fit:contain}
 .intro-career-row .oculus{border-radius:50%;background:#000;overflow:hidden}
 .intro-career-row .oculus img{object-fit:contain}
 .intro-career-row .doordash{overflow:hidden}
 .intro-career-row .doordash img{transform:scale(1.08)}
 .intro-career-row .airbnb{overflow:hidden}
 .intro-career-row .airbnb img{object-fit:cover;transform:scale(1.09)}
 .intro-career-row .cisco img{transform:scale(1.15)}
 .intro-career-education{margin-top:70px;text-align:center;color:#858b92;display:flex;flex-direction:column;gap:10px}
 .intro-career-education p{margin:0;font-size:17px;line-height:1.5}
 .intro-art{position:relative;display:grid;grid-template-columns:32% 33% 35%;grid-template-rows:49% 51%;gap:0;background:#ddd}
 .intro-art .art-top{grid-column:1 / 4}
 .intro-art .art-top img{object-position:50% 45%}
 .intro-art .art-drawing img{object-position:50% 38%}
 .intro-art .art-paper img{object-position:50% 35%}
 .intro-art h1{position:absolute;left:84px;bottom:50px;color:#fff;font:700 32px/1.2 DeckNorms,Arial,sans-serif;letter-spacing:-.5px;margin:0;text-shadow:0 2px 12px #0009}
 .intro-sr{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;white-space:nowrap!important;border:0!important}

 .intro-greeting.intro-companies h1{font-family:var(--deck-type-family,DeckNorms,Arial,sans-serif);font-size:var(--deck-h3-size,30px);font-weight:var(--deck-h3-weight,500);line-height:var(--deck-h3-line,1.2);letter-spacing:var(--deck-h3-tracking,-.02em)}
 `;document.head.append(style);
 const esc=s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
 const photo=(file,alt,cls='')=>`<figure class="${cls}"><img src="${base+file}" alt="${alt}"></figure>`;
 window.VivianAboutMe={render(s,editable=false){const edit=editable?' contenteditable="true"':'';
 if(s.introScreen==='personal')return `<div class="intro-screen intro-personal"><h1 class="intro-sr">${esc(s.title)}</h1>${photo('hiking.png','Vivian hiking in the mountains','hiking')}${photo('chicken.png','A fluffy white chicken outdoors','chicken')}${photo('family-lighting-v3.png','Three people together in a wooden pavilion','family')}</div>`;
 if(s.introScreen==='career')return `<div class="intro-screen intro-career"><h1 class="intro-sr">${esc(s.title)}</h1><div class="intro-career-row" aria-label="Career background">${photo('cisco.svg','Cisco','cisco')}${photo('airbnb.png','Airbnb','airbnb')}${photo('messenger.png','Messenger','messenger')}${photo('oculus.png','Oculus','oculus')}${photo('doordash.png','DoorDash','doordash')}</div><div class="intro-career-education"><p>Carnegie Mellon · HCI &amp; Information Systems</p><p>Columbia Business School · Executive MBA candidate</p></div></div>`;
 if(s.introScreen==='art')return `<div class="intro-screen intro-art">${photo('art-sculpture.png','Folded paper sculpture with ink artwork','art-top')}${photo('art-painting.png','Painting from Vivian’s portfolio','art-painting')}${photo('art-drawing.png','Charcoal drawing from Vivian’s portfolio','art-drawing')}${photo('art-paper.png','Paper artwork from Vivian’s portfolio','art-paper')}<h1 data-copy="title"${edit}>${esc(s.title)}</h1></div>`;
 if(s.introScreen==='work')return `<div class="intro-screen intro-greeting intro-companies"><div><h1 data-deck-type="h3" data-copy="title"${edit}>${esc(s.title)}</h1><p data-copy="subtitle"${edit}>${esc(s.subtitle)}</p><p style="font-size:18px;margin-top:28px">Airbnb · Meta · DoorDash <span style="color:#f65359">· Airbnb?</span></p></div>${photo('airbnb-vivian-polished.png','Vivian working at Airbnb')}</div>`;
 return `<div class="intro-screen intro-greeting"><div><h1 data-copy="title"${edit}>${esc(s.title)}</h1><p data-copy="subtitle"${edit}>${esc(s.subtitle)}</p>${s.education?`<p class="intro-education">${esc(s.education)}</p>`:''}</div>${s.introScreen==='work'?photo('airbnb-vivian-polished.png','Vivian working at Airbnb'):photo('desert-vivian.jpg','Vivian standing among desert dunes')}</div>`;
 }};
})();
