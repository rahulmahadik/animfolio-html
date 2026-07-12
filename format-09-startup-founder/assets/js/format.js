(function() {
	'use strict';

	/**
	 * AnimFolio — Format 09: Startup Founder
	 * Gradient CTA hover effects, metric counter animations, device mockup parallax.
	 */

	var container = document.querySelector('.animfolio-container--format-09');
	if (!container) return;

	// Animate metric counters on scroll into view
	var metrics = container.querySelectorAll('.animfolio-metric-card__number');
	if (metrics.length && 'IntersectionObserver' in window) {
		var observer = new IntersectionObserver(function(entries) {
			entries.forEach(function(entry) {
				if (entry.isIntersecting) {
					observer.unobserve(entry.target);
				}
			});
		}, { threshold: 0.3 });

		metrics.forEach(function(el) {
			observer.observe(el);
		});
	}
})();
