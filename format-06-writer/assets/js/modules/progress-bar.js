/**
 * Progress Bar Module
 *
 * Scroll progress indicator at the top of the viewport.
 *
 * @package AnimFolio
 * @author     Rahul Mahadik
 * @since   1.0.0
 */
(function () {
	'use strict';

	var AF = window.animfolio;
	if (!AF) return;

	AF.registerModule('progress-bar', {
		bar: null,
		bound: null,

		init: function () {
			this.bar = document.querySelector('.animfolio-progress__bar');
			if (!this.bar) return;

			this.bound = this.onScroll.bind(this);
			window.addEventListener('scroll', this.bound, { passive: true });
			this.onScroll();
		},

		onScroll: function () {
			if (!this.bar) return;
			var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
			var docHeight = document.documentElement.scrollHeight - window.innerHeight;
			var progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

			this.bar.style.width = progress + '%';
		},

		destroy: function () {
			if (this.bound) {
				window.removeEventListener('scroll', this.bound);
			}
		},
	});
})();
