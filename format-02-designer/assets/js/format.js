/**
 * Format 02: Designer Showcase Script
 *
 * Format-specific interactions: hover image reveal and bento grid behavior.
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
		// Image reveal on project card hover — clip-path wipe effect.
		var projects = document.querySelectorAll(
			'.animfolio-container--format-02 .animfolio-project'
		);

		projects.forEach(function (project) {
			var overlay = project.querySelector('.animfolio-project__overlay');
			if (!overlay) return;

			project.addEventListener('mouseenter', function () {
				overlay.style.clipPath = 'inset(0 0 0 0)';
			});

			project.addEventListener('mouseleave', function () {
				overlay.style.clipPath = 'inset(0 100% 0 0)';
			});
		});
	});
})();
