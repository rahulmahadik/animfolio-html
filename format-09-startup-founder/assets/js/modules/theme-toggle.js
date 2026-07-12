/**
 * Theme Toggle Module
 *
 * Dark/light/auto colour scheme handling. Saves the user's explicit choice to
 * localStorage. For the 'auto' scheme it resolves the OS prefers-color-scheme to
 * an explicit dark/light class so the rest of the CSS (which keys off the
 * --dark / --light classes and [data-animfolio-scheme] attribute) renders
 * correctly even when the visible toggle button is disabled.
 *
 * Self-initialises on DOM ready, independent of the engine's module lifecycle,
 * so the 'auto' scheme still resolves on the reduced-motion path (where the
 * engine never calls module init()) and with animations disabled.
 *
 * @package AnimFolio
 * @author     Rahul Mahadik
 * @since   1.0.0
 */
(function () {
	'use strict';

	var AF = window.animfolio;
	var STORAGE_KEY = 'animfolio_theme';
	var bound = false;

	function setScheme(container, scheme) {
		container.setAttribute('data-animfolio-scheme', scheme);
		container.classList.remove('animfolio-container--dark', 'animfolio-container--light');
		container.classList.add('animfolio-container--' + scheme);

		// Sync <body> to the new scheme; it's the container's parent so it can't inherit the flipped vars.
		try {
			var cs = window.getComputedStyle(container);
			var bg = cs.getPropertyValue('--animfolio-bg').trim();
			var fg = cs.getPropertyValue('--animfolio-text').trim();
			if (bg) {
				document.body.style.backgroundColor = bg;
			}
			if (fg) {
				document.body.style.color = fg;
			}
		} catch (e) {
			// getComputedStyle unavailable — body keeps its inline render-time scheme.
		}

		if (AF && typeof AF.emit === 'function') {
			AF.emit('theme:change', { scheme: scheme });
		}
	}

	function systemPrefersDark() {
		return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
	}

	function bind() {
		if (bound) {
			return;
		}
		bound = true;

		var container = document.querySelector('.animfolio-container');
		if (!container) {
			return;
		}

		// The scheme the site was rendered with (before any user override).
		var rendered = container.getAttribute('data-animfolio-scheme') || 'dark';

		// Restore an explicit saved preference; otherwise follow the OS for the 'auto' scheme.
		var saved = null;
		try {
			saved = localStorage.getItem(STORAGE_KEY);
		} catch (e) {
			saved = null;
		}

		if (saved === 'dark' || saved === 'light') {
			setScheme(container, saved);
		} else if (rendered === 'auto') {
			setScheme(container, systemPrefersDark() ? 'dark' : 'light');
		}

		// Bind toggle buttons; a click sets an explicit persisted preference that wins over 'auto'.
		document.querySelectorAll('.animfolio-theme-toggle').forEach(function (btn) {
			btn.addEventListener('click', function () {
				var current = container.getAttribute('data-animfolio-scheme') || 'dark';
				var next = current === 'dark' ? 'light' : 'dark';
				setScheme(container, next);
				try {
					localStorage.setItem(STORAGE_KEY, next);
				} catch (e) {
					// Storage unavailable — scheme still applies for this page view.
				}
			});
		});

		// Follow live OS preference changes while in 'auto' with no saved override.
		if (window.matchMedia) {
			var mq = window.matchMedia('(prefers-color-scheme: dark)');
			var onChange = function (e) {
				var stored = null;
				try {
					stored = localStorage.getItem(STORAGE_KEY);
				} catch (err) {
					stored = null;
				}
				if (!stored && rendered === 'auto') {
					setScheme(container, e.matches ? 'dark' : 'light');
				}
			};
			if (mq.addEventListener) {
				mq.addEventListener('change', onChange);
			} else if (mq.addListener) {
				mq.addListener(onChange);
			}
		}
	}

	// Register a module shell so engine destroy()/refresh() integrate; init() is idempotent.
	if (AF && typeof AF.registerModule === 'function') {
		AF.registerModule('theme-toggle', {
			init: bind,
			destroy: function () {},
		});
	}

	// Self-init on DOM ready, independent of the engine lifecycle.
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', bind);
	} else {
		bind();
	}
})();
