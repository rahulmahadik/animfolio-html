/**
 * Timeline Draw Module
 *
 * SVG stroke-dashoffset line drawing animation triggered by scroll.
 *
 * @package AnimFolio
 * @author     Rahul Mahadik
 * @since   1.0.0
 */
(function () {
	'use strict';

	var AF = window.animfolio;
	if (!AF) return;

	AF.registerModule('timeline-draw', {
		init: function () {
			var lines = document.querySelectorAll('.animfolio-timeline__line path, .animfolio-timeline__line line, [data-animfolio-draw]');

			lines.forEach(function (el) {
				var length = el.getTotalLength ? el.getTotalLength() : 0;
				if (!length) return;

				el.style.strokeDasharray = length;
				el.style.strokeDashoffset = length;
				el.style.transition = 'stroke-dashoffset 1.5s ease';
			});

			if (!('IntersectionObserver' in window)) return;

			var observer = new IntersectionObserver(
				function (entries) {
					entries.forEach(function (entry) {
						if (entry.isIntersecting) {
							entry.target.style.strokeDashoffset = '0';
							observer.unobserve(entry.target);
						}
					});
				},
				{ threshold: 0.2 }
			);

			lines.forEach(function (el) {
				observer.observe(el);
			});
		},

		destroy: function () {},
	});
})();
