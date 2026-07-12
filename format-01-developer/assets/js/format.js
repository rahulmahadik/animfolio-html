/**
 * Format 01: Developer Classic Script
 *
 * Format-specific interactions: contribution heatmap, code block styling.
 *
 * @package AnimFolio
 * @author     Rahul Mahadik
 * @since   1.0.0
 */
(function () {
	'use strict';

	var AF = window.animfolio;
	if (!AF) return;

	// Generate contribution heatmap for skills section.
	AF.on('init', function () {
		var heatmapContainers = document.querySelectorAll('.animfolio-f01-heatmap');

		heatmapContainers.forEach(function (container) {
			if (container.children.length > 0) return; // Already populated.

			// Generate 364 cells (52 weeks x 7 days).
			for (var i = 0; i < 364; i++) {
				var cell = document.createElement('div');
				cell.className = 'animfolio-f01-heatmap__cell';

				// Pseudo-random level based on position.
				var rand = Math.sin(i * 0.1) * 0.5 + 0.5;
				if (rand > 0.85) {
					cell.classList.add('animfolio-f01-heatmap__cell--l4');
				} else if (rand > 0.65) {
					cell.classList.add('animfolio-f01-heatmap__cell--l3');
				} else if (rand > 0.4) {
					cell.classList.add('animfolio-f01-heatmap__cell--l2');
				} else if (rand > 0.2) {
					cell.classList.add('animfolio-f01-heatmap__cell--l1');
				}

				container.appendChild(cell);
			}
		});
	});
})();
