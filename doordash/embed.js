// Keep the canonical deck and its persistent review database on the existing host.
// This entry point presents it at the portfolio URL without a duplicate deck.
const target = new URL('https://vivian-deck-review-20261018.vyang44.chatgpt.site/review/case-studies/');
target.search = location.search;
target.hash = location.hash;
document.querySelector('#deck').src = target.href;
