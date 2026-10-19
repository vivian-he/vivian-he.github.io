// Keep the canonical deck and its persistent review database on the existing host.
// This entry point presents it at the portfolio URL without a duplicate deck.
const review = new URLSearchParams(location.search).get('feedback') === '1';
const target = new URL('https://vivian-deck-review-20261018.vyang44.chatgpt.site/review/' + (review ? 'for-chris/' : 'case-studies/'));
target.search = location.search;
target.hash = location.hash;
document.querySelector('#deck').src = target.href;
