/**
 * Format 08: Product Manager Script
 *
 * Format-specific interactions: metric card trend indicators
 * and roadmap timeline progress.
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
		var container = document.querySelector('.animfolio-container--format-08');
		if (!container) return;

		// Animate metric card trend arrows based on data-trend attribute.
		var trends = container.querySelectorAll('.animfolio-stat__trend');
		trends.forEach(function (trend) {
			var value = parseFloat(trend.textContent);
			if (isNaN(value)) return;

			var arrow = value >= 0 ? '\u2191' : '\u2193';
			var color = value >= 0 ? 'var(--animfolio-secondary)' : '#ef4444';
			trend.style.color = color;
			trend.textContent = arrow + ' ' + Math.abs(value) + '%';
		});

		// Mark completed roadmap items based on data-status.
		var timelineItems = container.querySelectorAll('.animfolio-timeline__item');
		timelineItems.forEach(function (item) {
			var status = item.getAttribute('data-status');
			if (status === 'complete') {
				var dot = item.querySelector('.animfolio-timeline__dot');
				if (dot) {
					dot.style.background = 'var(--animfolio-secondary)';
					dot.style.boxShadow = '0 0 0 3px rgba(6, 182, 212, 0.2)';
				}
			}
		});
	});
})();
