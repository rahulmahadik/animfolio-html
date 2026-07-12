/**
 * Format 06: Writer Elegant Script
 *
 * Format-specific interactions: reading time estimates and drop cap detection.
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
		var container = document.querySelector('.animfolio-container--format-06');
		if (!container) return;

		// Calculate and display reading time for text-heavy sections.
		var textBlocks = container.querySelectorAll('.animfolio-about__text, .animfolio-project__description');
		var totalWords = 0;

		textBlocks.forEach(function (block) {
			var words = block.textContent.trim().split(/\s+/).length;
			totalWords += words;
		});

		var readingTime = Math.max(1, Math.ceil(totalWords / 200));
		var readingEls = container.querySelectorAll('.animfolio-f06-reading-time');
		readingEls.forEach(function (el) {
			el.textContent = readingTime + ' min read';
		});

		// Add drop cap class to first paragraph of about section.
		var aboutText = container.querySelector('.animfolio-section--about .animfolio-about__text');
		if (aboutText && aboutText.textContent.length > 50) {
			aboutText.classList.add('animfolio-f06-dropcap');
		}
	});
})();
