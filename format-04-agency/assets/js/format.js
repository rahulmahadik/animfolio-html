/**
 * Format 04: Agency Bold Script
 *
 * Format-specific interactions: section numbering and scroll-based
 * color block transitions.
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
		// Auto-number section titles.
		var titles = document.querySelectorAll(
			'.animfolio-container--format-04 .animfolio-section__title'
		);

		titles.forEach(function (title, i) {
			var num = String(i + 1).padStart(2, '0');
			title.setAttribute('data-number', num + '.');
		});

		// Grayscale-to-color on team member photos when scrolled into view.
		var photos = document.querySelectorAll(
			'.animfolio-container--format-04 .animfolio-f04-team__photo'
		);

		if ('IntersectionObserver' in window && photos.length) {
			var observer = new IntersectionObserver(function (entries) {
				entries.forEach(function (entry) {
					if (entry.isIntersecting) {
						entry.target.style.filter = 'grayscale(0)';
						observer.unobserve(entry.target);
					}
				});
			}, { threshold: 0.5 });

			photos.forEach(function (photo) {
				observer.observe(photo);
			});
		}
	});
})();
