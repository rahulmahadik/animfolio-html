/**
 * Format 03: Freelancer Pro Script
 *
 * Format-specific interactions: testimonial auto-rotation and CTA pulse.
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
		// Auto-rotate testimonials every 5 seconds.
		var testimonials = document.querySelectorAll(
			'.animfolio-container--format-03 .animfolio-testimonial'
		);

		if (testimonials.length <= 1) return;

		var current = 0;
		testimonials.forEach(function (t, i) {
			if (i !== 0) t.style.display = 'none';
		});

		setInterval(function () {
			testimonials[current].style.display = 'none';
			current = (current + 1) % testimonials.length;
			testimonials[current].style.display = '';
		}, 5000);
	});
})();
