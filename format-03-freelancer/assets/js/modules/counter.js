/**
 * Counter Module
 *
 * Animated number counting via requestAnimationFrame.
 * Supports suffix, easing, duration, and comma formatting.
 *
 * @package AnimFolio
 * @author     Rahul Mahadik
 * @since   1.0.0
 */
(function () {
	'use strict';

	var AF = window.animfolio;
	if (!AF) return;

	AF.registerModule('counter', {
		init: function () {
			var counters = document.querySelectorAll('[data-animfolio-counter]');
			if (!counters.length) return;

			// No IO: leave the server-rendered final number in place (also the reduced-motion path).
			if (!('IntersectionObserver' in window)) return;

			var observer = new IntersectionObserver(
				function (entries) {
					entries.forEach(function (entry) {
						if (entry.isIntersecting) {
							animateCounter(entry.target);
							observer.unobserve(entry.target);
						}
					});
				},
				{ threshold: 0.25 }
			);

			counters.forEach(function (el) {
				// Reset to zero so the count-up is visible (markup ships the final value for no-JS).
				resetCounter(el);
				observer.observe(el);
			});

			// Failsafe: after the page settles, finalize any counter that never crossed the threshold
			// (so one left at the reset 0 doesn't show a wrong number).
			var failsafe = function () {
				counters.forEach(function (el) {
					if (!el.afCounterAnimated) {
						observer.unobserve(el);
						animateCounter(el);
					}
				});
			};
			if (document.readyState === 'complete') {
				setTimeout(failsafe, 3000);
			} else {
				window.addEventListener('load', function () { setTimeout(failsafe, 3000); }, { once: true });
			}
		},

		destroy: function () {},
	});

	function resetCounter(el) {
		var suffix = el.getAttribute('data-animfolio-suffix') || '';
		var prefix = el.getAttribute('data-animfolio-prefix') || '';
		var decimals = parseInt(el.getAttribute('data-animfolio-decimals'), 10) || 0;
		el.textContent = prefix + (0).toFixed(decimals) + suffix;
	}

	function animateCounter(el) {
		// Run once per element (observer and failsafe may both call this).
		if (el.afCounterAnimated) return;
		el.afCounterAnimated = true;

		var target = parseFloat(el.getAttribute('data-animfolio-counter')) || 0;
		var duration = parseFloat(el.getAttribute('data-animfolio-duration')) || 2000;
		var suffix = el.getAttribute('data-animfolio-suffix') || '';
		var prefix = el.getAttribute('data-animfolio-prefix') || '';
		var decimals = parseInt(el.getAttribute('data-animfolio-decimals'), 10) || 0;
		var start = 0;
		var startTime = null;

		function easeOutCubic(t) {
			return 1 - Math.pow(1 - t, 3);
		}

		function formatNumber(num) {
			var fixed = num.toFixed(decimals);
			// Add comma formatting.
			var parts = fixed.split('.');
			parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
			return parts.join('.');
		}

		function animate(timestamp) {
			if (!startTime) startTime = timestamp;
			var progress = Math.min((timestamp - startTime) / duration, 1);
			var easedProgress = easeOutCubic(progress);
			var current = start + (target - start) * easedProgress;

			el.textContent = prefix + formatNumber(current) + suffix;

			if (progress < 1) {
				requestAnimationFrame(animate);
			} else {
				AF.emit('animation:complete', { element: el, type: 'counter' });
			}
		}

		requestAnimationFrame(animate);
	}
})();
