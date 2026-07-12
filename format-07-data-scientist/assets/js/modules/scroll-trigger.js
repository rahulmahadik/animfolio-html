/**
 * Scroll Trigger Module
 *
 * IntersectionObserver wrapper for scroll-based animations.
 * Triggers CSS class addition on scroll. One-shot by default.
 *
 * @package AnimFolio
 * @author     Rahul Mahadik
 * @since   1.0.0
 */
(function () {
	'use strict';

	var AF = window.animfolio;
	if (!AF) return;

	AF.registerModule('scroll-trigger', {
		observers: [],

		init: function () {
			if (!('IntersectionObserver' in window)) return;

			var self = this;
			var sections = document.querySelectorAll('.animfolio-section');

			sections.forEach(function (section) {
				var observer = new IntersectionObserver(
					function (entries) {
						entries.forEach(function (entry) {
							if (entry.isIntersecting) {
								entry.target.classList.add('animfolio-section--visible');
								AF.emit('section:enter', {
									section: entry.target,
									type: entry.target.getAttribute('data-animfolio-section'),
								});
							} else {
								entry.target.classList.remove('animfolio-section--visible');
								AF.emit('section:leave', {
									section: entry.target,
									type: entry.target.getAttribute('data-animfolio-section'),
								});
							}
						});
					},
					{ threshold: 0.1 }
				);

				observer.observe(section);
				self.observers.push(observer);
			});
		},

		destroy: function () {
			this.observers.forEach(function (obs) {
				obs.disconnect();
			});
			this.observers = [];
		},
	});
})();
