/* Shared iOS keyboard presentation. Existing .key nodes and click handlers stay intact. */
(()=>{
 const glyphs={
  '☻':'<circle cx="12" cy="12" r="9.2"/><circle cx="8.6" cy="9.5" r=".8" fill="currentColor" stroke="none"/><circle cx="15.4" cy="9.5" r=".8" fill="currentColor" stroke="none"/><path d="M6.7 13.2h10.6c-.8 3-2.6 4.4-5.3 4.4s-4.5-1.4-5.3-4.4Z"/>',
  '⇧':'<path d="m12 3 9 9h-6v9H9v-9H3Z"/>',
  '⌫':'<path d="M9 5h11a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H9L2 12Z"/><path d="m11 9 6 6m0-6-6 6"/>'
 };
 function sync(){document.querySelectorAll('.keyboard').forEach(board=>{
  board.dataset.iosKeyboard=board.closest('#launcher')?'dark':'light';
  board.querySelectorAll('.key').forEach(key=>{
   if(key.dataset.iosKey)return;
   const text=key.textContent.trim();key.dataset.iosKey=text;
   if(glyphs[text]){
    key.classList.add('ios-icon-key');
    key.setAttribute('aria-label',{'☻':'Emoji','⇧':'Shift','⌫':'Delete'}[text]);
    key.innerHTML=(text==='☻'?'':'<span class="ios-key-original">'+text+'</span>')+'<svg aria-hidden="true" viewBox="0 0 24 24">'+glyphs[text]+'</svg>';
   }
  });
 });}
 window.SharedKeyboard={mount(host,onKey){
  let board=host.querySelector('.keyboard');
  if(!board){
   board=document.createElement('div');board.className='keyboard';
   board.innerHTML=['qwertyuiop','asdfghjkl','⇧zxcvbnm⌫'].map(row=>'<div class="keyrow">'+[...row].map(k=>'<button type="button" class="key '+('⇧⌫'.includes(k)?'wide':'')+'">'+k+'</button>').join('')+'</div>').join('')+'<div class="keyrow"><button type="button" class="key wide">123</button><button type="button" class="key wide">☻</button><button type="button" class="key space">space</button><button type="button" class="key blue">search</button></div><div class="keyboard-footer"><svg viewBox="0 0 28 28"><circle cx="14" cy="14" r="12"/><ellipse cx="14" cy="14" rx="5" ry="12"/><path d="M3 9h22M3 19h22"/></svg><svg viewBox="0 0 28 28"><rect x="10" y="2" width="8" height="15" rx="4"/><path d="M6 12v2a8 8 0 0 0 16 0v-2M14 22v4M9 26h10"/></svg></div>';
   host.append(board);board.addEventListener('pointerdown',event=>event.preventDefault());
   board.addEventListener('click',event=>{const key=event.target.closest('.key');if(key)board.keyboardOnKey?.(key.dataset.iosKey)});
  }
  board.keyboardOnKey=onKey;sync();
 }};
 sync();new MutationObserver(sync).observe(document.body,{childList:true,subtree:true});
})();
