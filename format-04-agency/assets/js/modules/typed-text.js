/**
 * Typed Text Module
 *
 * Character-by-character typing effect with cursor. Zero dependencies.
 * Supports multiple phrases and looping.
 *
 * @package AnimFolio
 * @author     Rahul Mahadik
 * @since   1.0.0
 */
(function () {
	'use strict';

	var AF = window.animfolio;
	if (!AF) return;

	AF.registerModule('typed-text', {
		instances: [],

		init: function () {
			var self = this;
			var elements = document.querySelectorAll('.animfolio-hero__typed, [data-animfolio-typed]');

			elements.forEach(function (el) {
				self.instances.push(self.createTyper(el));
			});
		},

		createTyper: function (el) {
			var phrases = [];
			try {
				phrases = JSON.parse(el.getAttribute('data-animfolio-typed') || '[]');
			} catch (e) {
				phrases = el.textContent ? [el.textContent] : [];
			}

			if (!phrases.length) return null;

			var typeSpeed = 80;
			var deleteSpeed = 40;
			var pauseTime = 2000;
			var charIndex = 0;
			var phraseIndex = 0;
			var isDeleting = false;
			var timeoutId = null;

			el.textContent = '';
			el.classList.add('animfolio-typed-cursor');

			function tick() {
				var currentPhrase = phrases[phraseIndex];
				var display;

				if (isDeleting) {
					charIndex--;
					display = currentPhrase.substring(0, charIndex);
				} else {
					charIndex++;
					display = currentPhrase.substring(0, charIndex);
				}

				el.textContent = display;

				var delay;

				if (!isDeleting && charIndex === currentPhrase.length) {
					delay = pauseTime;
					isDeleting = true;
				} else if (isDeleting && charIndex === 0) {
					isDeleting = false;
					phraseIndex = (phraseIndex + 1) % phrases.length;
					delay = 500;
				} else {
					delay = isDeleting ? deleteSpeed : typeSpeed;
				}

				timeoutId = setTimeout(tick, delay);
			}

			tick();

			return {
				destroy: function () {
					if (timeoutId) clearTimeout(timeoutId);
				},
			};
		},

		destroy: function () {
			this.instances.forEach(function (inst) {
				if (inst && inst.destroy) inst.destroy();
			});
			this.instances = [];
		},
	});
})();
