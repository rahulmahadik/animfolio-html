/**
 * Format 07: Data Scientist Script
 *
 * Format-specific interactions: notebook cell numbering and
 * inline chart iframe lazy-loading.
 *
 * @package AnimFolio
 * @author     Rahul Mahadik
 * @since   1.0.0
 */
(function () {
	'use strict';

	var AF = window.animfolio;
	if (!AF) return;

	AF.on('init', function () {
		var container = document.querySelector('.animfolio-container--format-07');
		if (!container) return;

		// Auto-number notebook cell badges.
		var cellBadges = container.querySelectorAll('.animfolio-f07-cell-badge');
		cellBadges.forEach(function (badge, i) {
			badge.textContent = String(i + 1);
		});

		// Lazy-load chart iframes when they scroll into view.
		var iframes = container.querySelectorAll('iframe[data-src]');
		if ('IntersectionObserver' in window && iframes.length) {
			var observer = new IntersectionObserver(function (entries) {
				entries.forEach(function (entry) {
					if (entry.isIntersecting) {
						var iframe = entry.target;
						iframe.src = iframe.getAttribute('data-src');
						iframe.removeAttribute('data-src');
						observer.unobserve(iframe);
					}
				});
			}, { rootMargin: '200px' });

			iframes.forEach(function (iframe) {
				observer.observe(iframe);
			});
		}
	});
})();
