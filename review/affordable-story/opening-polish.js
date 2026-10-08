/* Opening story: intentionally short, evidence-safe copy and one shared type system. */
function renderOpeningPolish(s) {
  if (s.id === 'mealbox-deep-dive') return false;
  const layouts = {
    'slide-1': ['op-cover', `<section class="op-cover-title"><h1>Introduce affordable<br>meals to <span class="op-inline-brand"><img src="../slide9-opening/doordash.svg" alt="">DoorDash</span></h1><p class="op-cover-role">Design lead and only designer for this 0-&gt;1 initiative<br>across end-to-end consumer and merchant experiences</p></section>`],
    'slide-2': ['op-split op-problem', `<section><p class="op-label">The problem</p><h2>Affordability limits<br>how often people<br>use DoorDash</h2></section><section class="op-context-stats"><article><h3>55<span>%</span></h3><p>of churned customers wanted<br>more affordable options.</p></article><article><h3>~40<span>%</span></h3><p>cited meals under $15<br>as a top reason to return.</p></article></section>`],
    'slide-3': ['op-split op-ambition', `<section><p class="op-label">The ambition</p><h2>Make affordability<br>an everyday habit</h2></section><section class="op-list"><article><div><h3>Sustainable value</h3><p>Lower prices that work beyond promotions.</p><p class="op-proof"><strong>$2.03M</strong> in promo spend. <strong>~20 months</strong><br>projected payback in one win-back campaign.</p></div></article><article><div><h3>More eating occasions</h3><p>From breakfast and snacks to late nights.</p><p class="op-proof"><strong>44%</strong> of 1P Basics volume came from<br>early morning or late night.</p></div></article></section>`],
    'initiatives': ['op-split op-bets', `<section><p class="op-label">In parallel</p><h2>Three bets<br>we’re testing</h2></section><section class="op-bet-stack"><article><span class="op-number">01</span><div><h3>Restaurant Meal Boxes</h3><p>Full-size $12 meals, created with restaurant partners.</p></div></article><article><span class="op-number">02</span><div><h3>1P meals</h3><p>DoorDash-created meals designed for everyday value.</p></div></article><article><span class="op-number">03</span><div><h3>Prepared meals</h3><p>Chef-made meals to heat and enjoy later.</p></div></article></section>`],
    'mealbox-deep-dive': ['op-chapter', `<p class="op-label">Deep dive / Restaurant partners</p><section><span class="op-price">$12</span><h2>Restaurant<br>Meal Boxes</h2></section><p class="op-chapter-foot">Full-size meals. Everyday value.</p>`],
    'mealbox-intro': ['op-collaboration', `<section class="op-collaboration-copy"><p class="op-label">What is a Meal Box?</p><h2>We work with top merchants to create high-quality, balanced $12 Meal Boxes.</h2><p class="op-support">Designed to bring merchants new customers,<br>more orders, and higher take-home earnings.</p></section><figure class="op-merchant-photo"><img src="${DECK_ASSETS.merchantCollaboration}" alt="Restaurant team working together to plan meals"></figure>`],
    'slide-7': ['op-split op-consumer-scope', `<section><h2>High-level<br>consumer journey</h2></section><section class="op-list"><article><span class="op-number">01</span><h3>Discover and explore</h3></article><article><span class="op-number">02</span><h3>Understand and try</h3></article><article><span class="op-number">03</span><h3>Reinforce value</h3></article></section>`]
  };
  const selected = layouts[s.id];
  if (!selected) return false;
  const slide = document.querySelector('#slide');
  slide.className = `opening-polish ${selected[0]}`;
  slide.innerHTML = selected[1];
  return true;
}
