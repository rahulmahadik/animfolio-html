/**
 * Parallax Module
 *
 * Scroll-based translateY on background elements. Uses transform only (GPU).
 *
 * @package AnimFolio
 * @author     Rahul Mahadik
 * @since   1.0.0
 */
(function () {
	'use strict';

	var AF = window.animfolio;
	if (!AF) return;

	AF.registerModule('parallax', {
		elements: [],
		rafId: null,
		bound: null,

		init: function () {
			this.elements = document.querySelectorAll('.animfolio-parallax, [data-animfolio-parallax]');
			if (!this.elements.length) return;

			this.bound = this.onScroll.bind(this);
			window.addEventListener('scroll', this.bound, { passive: true });
			this.onScroll();
		},

		onScroll: function () {
			var self = this;
			if (this.rafId) return;

			this.rafId = requestAnimationFrame(function () {
				var scrollY = window.pageYOffset;

				self.elements.forEach(function (el) {
					var speed = parseFloat(el.getAttribute('data-animfolio-parallax')) || 0.3;
					var rect = el.getBoundingClientRect();
					var offset = (rect.top + scrollY - window.innerHeight / 2) * speed;

					el.style.transform = 'translate3d(0, ' + offset + 'px, 0)';
				});

				self.rafId = null;
			});
		},

		destroy: function () {
			if (this.bound) {
				window.removeEventListener('scroll', this.bound);
			}
			if (this.rafId) {
				cancelAnimationFrame(this.rafId);
			}
		},
	});
})();
