(function() {
	'use strict';

	/**
	 * AnimFolio — Format 12: Creative Portfolio
	 * Horizontal scroll setup, parallax project images, bold statement reveals.
	 */

	var container = document.querySelector('.animfolio-container--format-12');
	if (!container) return;

	// Map vertical wheel to horizontal scroll.
	var hscrollSections = container.querySelectorAll('.animfolio-hscroll');
	hscrollSections.forEach(function(section) {
		section.addEventListener('wheel', function(e) {
			if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
				e.preventDefault();
				section.scrollLeft += e.deltaY;
			}
		}, { passive: false });
	});

	// Project image parallax on scroll
	var images = container.querySelectorAll('.animfolio-project-image');
	if (images.length) {
		var onScroll = function() {
			var scrollY = window.pageYOffset;
			images.forEach(function(img) {
				var rect = img.getBoundingClientRect();
				var offset = (rect.top - window.innerHeight / 2) * 0.05;
				img.style.transform = 'translateY(' + offset + 'px)';
			});
		};

		window.addEventListener('scroll', onScroll, { passive: true });
	}
})();
