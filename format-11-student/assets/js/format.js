(function() {
	'use strict';

	/**
	 * AnimFolio — Format 11: Student Fresh
	 * Playful, staggered card entrance.
	 *
	 * Fails safe: cards are NEVER left hidden. If motion is reduced or
	 * IntersectionObserver is unavailable, cards stay visible; a timeout
	 * force-reveals anything the observer has not shown.
	 */

	var container = document.querySelector('.animfolio-container--format-11');
	if (!container) {
		return;
	}

	var cards = container.querySelectorAll('.animfolio-card');
	if (!cards.length) {
		return;
	}

	var reduceMotion = window.matchMedia &&
		window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	if (reduceMotion || ! ('IntersectionObserver' in window)) {
		return;
	}

	var reveal = function(el) {
		el.style.opacity = '1';
		el.style.transform = 'translateY(0) scale(1)';
	};

	var observer = new IntersectionObserver(function(entries) {
		entries.forEach(function(entry) {
			if (entry.isIntersecting) {
				reveal(entry.target);
				observer.unobserve(entry.target);
			}
		});
	}, { threshold: 0.15 });

	cards.forEach(function(card, i) {
		card.style.opacity = '0';
		card.style.transform = 'translateY(24px) scale(0.96)';
		card.style.transition = 'opacity 0.4s ease ' + (i % 3 * 0.1) + 's, transform 0.4s ease ' + (i % 3 * 0.1) + 's';
		observer.observe(card);
	});

	// Fail-safe: never leave a card hidden.
	window.setTimeout(function() {
		cards.forEach(function(card) {
			if (card.style.opacity !== '1') {
				reveal(card);
			}
		});
	}, 3000);
})();
