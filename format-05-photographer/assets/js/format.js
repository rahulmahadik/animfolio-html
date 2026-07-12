/**
 * Format 05: Photographer Minimal Script
 *
 * Format-specific interactions: simple lightbox for gallery images.
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
		var container = document.querySelector('.animfolio-container--format-05');
		if (!container) return;

		var lightbox = document.createElement('div');
		lightbox.className = 'animfolio-f05-lightbox';
		lightbox.innerHTML = '<img src="" alt="" />';
		container.appendChild(lightbox);

		var lbImg = lightbox.querySelector('img');

		var projects = container.querySelectorAll('.animfolio-project');
		projects.forEach(function (project) {
			project.addEventListener('click', function () {
				var img = project.querySelector('img.animfolio-project__image');
				if (!img) return;
				lbImg.src = img.src;
				lbImg.alt = img.alt;
				lightbox.classList.add('animfolio-f05-lightbox--active');
			});
		});

		lightbox.addEventListener('click', function () {
			lightbox.classList.remove('animfolio-f05-lightbox--active');
		});

		// Close on Escape.
		document.addEventListener('keydown', function (e) {
			if (e.key === 'Escape') {
				lightbox.classList.remove('animfolio-f05-lightbox--active');
			}
		});
	});
})();
