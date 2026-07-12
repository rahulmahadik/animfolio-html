(function() {
	'use strict';

	/**
	 * AnimFolio — Format 14: Gamified Quest
	 * XP bar animations, achievement unlock effects, skill tree hover, Konami code easter egg.
	 */

	var container = document.querySelector('.animfolio-container--format-14');
	if (!container) return;

	var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	// Animate XP bars from 0% to their target width on scroll.
	var xpBars = container.querySelectorAll('.animfolio-rpg__xp-fill');
	if (xpBars.length && 'IntersectionObserver' in window) {
		var barObserver = new IntersectionObserver(function(entries) {
			entries.forEach(function(entry) {
				if (entry.isIntersecting) {
					var target = entry.target.dataset.width || '0%';
					entry.target.style.width = target;
					barObserver.unobserve(entry.target);
				}
			});
		}, { threshold: 0.3 });

		xpBars.forEach(function(bar) {
			// Capture the inline target width set by the template, then reset to 0.
			bar.dataset.width = bar.style.width || '0%';
			if (reduceMotion) {
				// Leave the bar at its target width.
				return;
			}
			bar.style.width = '0%';
			barObserver.observe(bar);
		});
	}

	// Achievement unlock on scroll: applies the @keyframes animfolio-unlock from style.css inline.
	var achievements = container.querySelectorAll('.animfolio-rpg__achievement--unlocked');
	if (achievements.length && !reduceMotion && 'IntersectionObserver' in window) {
		var achObserver = new IntersectionObserver(function(entries) {
			entries.forEach(function(entry) {
				if (entry.isIntersecting) {
					var card = entry.target;
					card.classList.add('animfolio-rpg__achievement--unlocking');
					card.style.animation = 'animfolio-unlock 0.6s cubic-bezier(0.22, 1, 0.36, 1) both';
					card.addEventListener('animationend', function onUnlock(e) {
						if (e.animationName === 'animfolio-unlock') {
							// Clear inline animation so the CSS glow-pulse can resume.
							card.style.animation = '';
							card.classList.remove('animfolio-rpg__achievement--unlocking');
							card.removeEventListener('animationend', onUnlock);
						}
					});
					achObserver.unobserve(card);
				}
			});
		}, { threshold: 0.4 });

		achievements.forEach(function(ach) {
			achObserver.observe(ach);
		});
	}

	// Konami code easter egg.
	var konamiSequence = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
	var konamiIndex = 0;

	document.addEventListener('keydown', function(e) {
		if (e.keyCode === konamiSequence[konamiIndex]) {
			konamiIndex++;
			if (konamiIndex === konamiSequence.length) {
				konamiIndex = 0;
				container.style.transition = 'filter 0.5s ease';
				container.style.filter = 'hue-rotate(90deg)';
				setTimeout(function() {
					container.style.filter = '';
				}, 3000);
			}
		} else {
			konamiIndex = 0;
		}
	});
})();
