/* The master references source slides; case-study content is never duplicated. */
window.DeckMasterSlides=manifest=>[
 {id:'case-studies',label:'DoorDash Case Studies',group:'Introduction',kind:'intro'},
 {id:'prototype-note',label:'Interactive prototypes',group:'Introduction',kind:'intro'},
 ...['in-store-rewards','affordable-meals'].flatMap(deck=>(manifest[deck]||[]).map((slide,sourceIndex)=>({...slide,sourceIndex})).filter(slide=>!(deck==='in-store-rewards'&&slide.id==='23')).map((slide)=>({...slide,id:(deck==='in-store-rewards'?'rewards-':'meals-')+slide.id,sourceId:slide.id,sourceIndex:slide.sourceIndex,deck,group:(deck==='in-store-rewards'?'1 · In-Store Rewards':'2 · Affordable Meals')+' / '+slide.group})))
];
