(function() {
	'use strict';

	/**
	 * AnimFolio — Format 13: Minimalist Zen
	 * Subtle, gentle fade-in for sections on scroll.
	 *
	 * Fails safe: content is NEVER left hidden. If motion is reduced or
	 * IntersectionObserver is unavailable, sections stay fully visible. Even
	 * when the fade runs, a timeout force-reveals anything still hidden so the
	 * page can never appear blank if the observer never fires.
	 */

	var container = document.querySelector('.animfolio-container--format-13');
	if (!container) {
		return;
	}

	var sections = container.querySelectorAll('.animfolio-section');
	if (!sections.length) {
		return;
	}

	var reduceMotion = window.matchMedia &&
		window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	// No motion when reduced or unsupported: leave default visible state.
	if (reduceMotion || ! ('IntersectionObserver' in window)) {
		return;
	}

	var reveal = function(el) {
		el.style.opacity = '1';
		el.style.transform = 'none';
	};

	var observer = new IntersectionObserver(function(entries) {
		entries.forEach(function(entry) {
			if (entry.isIntersecting) {
				reveal(entry.target);
				observer.unobserve(entry.target);
			}
		});
	}, { threshold: 0.1, rootMargin: '0px 0px -8% 0px' });

	sections.forEach(function(section) {
		section.style.opacity = '0';
		section.style.transform = 'translateY(12px)';
		section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
		observer.observe(section);
	});

	// Fail-safe: after 3s, force-reveal anything the observer never showed.
	window.setTimeout(function() {
		sections.forEach(function(section) {
			if (section.style.opacity !== '1') {
				reveal(section);
			}
		});
	}, 3000);
})();
