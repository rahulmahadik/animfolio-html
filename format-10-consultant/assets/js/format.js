(function() {
	'use strict';

	/**
	 * AnimFolio — Format 10: Consultant Executive
	 * Staggered reveal for methodology steps.
	 *
	 * Fails safe: steps are NEVER left hidden. If motion is reduced or
	 * IntersectionObserver is unavailable, steps stay visible; a timeout
	 * force-reveals anything the observer has not shown.
	 */

	var container = document.querySelector('.animfolio-container--format-10');
	if (!container) {
		return;
	}

	var steps = container.querySelectorAll('.animfolio-methodology__step');
	if (!steps.length) {
		return;
	}

	var reduceMotion = window.matchMedia &&
		window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	if (reduceMotion || ! ('IntersectionObserver' in window)) {
		return;
	}

	var reveal = function(el) {
		el.style.opacity = '1';
		el.style.transform = 'translateY(0)';
	};

	var observer = new IntersectionObserver(function(entries) {
		entries.forEach(function(entry) {
			if (entry.isIntersecting) {
				reveal(entry.target);
				observer.unobserve(entry.target);
			}
		});
	}, { threshold: 0.2 });

	steps.forEach(function(step, i) {
		step.style.opacity = '0';
		step.style.transform = 'translateY(20px)';
		step.style.transition = 'opacity 0.5s ease ' + (i * 0.15) + 's, transform 0.5s ease ' + (i * 0.15) + 's';
		observer.observe(step);
	});

	// Fail-safe: never leave a step hidden.
	window.setTimeout(function() {
		steps.forEach(function(step) {
			if (step.style.opacity !== '1') {
				reveal(step);
			}
		});
	}, 3000);
})();
