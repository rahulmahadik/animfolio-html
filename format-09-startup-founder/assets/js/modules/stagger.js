/**
 * Stagger Module
 *
 * Staggered reveal for child elements in a container.
 * Adds incremental transition-delay to children.
 *
 * @package AnimFolio
 * @author     Rahul Mahadik
 * @since   1.0.0
 */
(function () {
	'use strict';

	var AF = window.animfolio;
	if (!AF) return;

	AF.registerModule('stagger', {
		observer: null,

		init: function () {
			if (!('IntersectionObserver' in window)) return;

			var groups = document.querySelectorAll('.animfolio-stagger, [data-animfolio-stagger]');
			var self = this;

			self.observer = new IntersectionObserver(
				function (entries) {
					entries.forEach(function (entry) {
						if (entry.isIntersecting) {
							var parent = entry.target;
							var staggerDelay = parseFloat(parent.getAttribute('data-animfolio-stagger')) || 0.1;
							var children = parent.querySelectorAll('.animfolio-stagger__item');

							// Fallback: if no explicitly marked items, use direct children.
							if (!children.length) {
								children = parent.children;
							}

							Array.prototype.forEach.call(children, function (child, index) {
								child.style.transitionDelay = (index * staggerDelay) + 's';
								child.classList.add('animfolio-visible');
							});

							self.observer.unobserve(parent);
						}
					});
				},
				{ threshold: 0.1 }
			);

			groups.forEach(function (group) {
				self.observer.observe(group);
			});
		},

		destroy: function () {
			if (this.observer) {
				this.observer.disconnect();
				this.observer = null;
			}
		},
	});
})();
