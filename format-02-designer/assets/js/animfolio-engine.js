/**
 * AnimFolio Animation Engine
 *
 * Main orchestrator that initializes modules, manages IntersectionObserver,
 * and coordinates all animation lifecycle events.
 *
 * @package AnimFolio
 * @author     Rahul Mahadik
 * @since   1.0.0
 */
(function () {
	'use strict';

	// Single global namespace.
	window.animfolio = window.animfolio || {
		version: '1.0.0',
		settings: {},
		modules: {},
		events: document.createElement('div'), // Simple event bus
	};

	const AF = window.animfolio;
	const settings = window.animfolioSettings || {};

	/**
	 * Check if reduced motion is preferred.
	 */
	function prefersReducedMotion() {
		return (
			settings.respectReducedMotion &&
			window.matchMedia('(prefers-reduced-motion: reduce)').matches
		);
	}

	/**
	 * Register a module.
	 */
	AF.registerModule = function (name, module) {
		AF.modules[name] = module;
	};

	/**
	 * Get a registered module.
	 */
	AF.getModule = function (name) {
		return AF.modules[name] || null;
	};

	/**
	 * Fire a custom event.
	 */
	AF.emit = function (eventName, detail) {
		const event = new CustomEvent('animfolio:' + eventName, {
			detail: detail || {},
			bubbles: true,
		});
		document.dispatchEvent(event);
	};

	/**
	 * Listen for a custom event.
	 */
	AF.on = function (eventName, callback) {
		document.addEventListener('animfolio:' + eventName, callback);
	};

	/**
	 * Reveal stagger items as a baseline.
	 *
	 * .animfolio-stagger__item starts at opacity:0 and is normally revealed by
	 * the stagger module. When that module isn't loaded (Stagger Animations
	 * disabled), on the reduced-motion path (modules never init), or when there
	 * is no IntersectionObserver, nothing would ever reveal these items and the
	 * content stays permanently invisible. This force-reveals them so the
	 * portfolio is never blank. Safe to call when the stagger module IS active —
	 * it self-skips, leaving the staggered animation untouched.
	 */
	AF.revealStaggerFallback = function () {
		if (AF.modules && AF.modules.stagger) {
			return;
		}
		document.querySelectorAll('.animfolio-stagger__item:not(.animfolio-visible)').forEach(function (el) {
			el.classList.add('animfolio-visible');
		});
	};

	/**
	 * Initialize the animation engine.
	 */
	AF.init = function () {
		if (prefersReducedMotion()) {
			// Mark all animatable elements as visible immediately.
			document.querySelectorAll('[data-animfolio-animate]').forEach(function (el) {
				el.classList.add('animfolio-visible');
				el.classList.add('animfolio-animate--none');
			});
			// Stagger module won't run on this path — reveal its items directly.
			document.querySelectorAll('.animfolio-stagger__item').forEach(function (el) {
				el.classList.add('animfolio-visible');
			});
			// Signal the inline head failsafe that the engine is alive (reveal already handled above).
			AF._initialized = true;
			AF.emit('init', { reducedMotion: true });
			return;
		}

		// Store settings.
		AF.settings = settings;

		// Set up IntersectionObserver for scroll-triggered animations.
		AF.setupObserver();

		// Initialize all registered modules.
		Object.keys(AF.modules).forEach(function (name) {
			var mod = AF.modules[name];
			if (typeof mod.init === 'function') {
				try {
					mod.init();
				} catch (e) {
					if (settings.debugMode) {
						console.error('[AnimFolio] Module "' + name + '" init error:', e);
					}
				}
			}
		});

		// Reveal stagger items if the stagger module isn't loaded.
		AF.revealStaggerFallback();

		// Signal the inline head failsafe that the engine initialized OK.
		AF._initialized = true;
		AF.emit('init', { reducedMotion: false });
	};

	/**
	 * Set up the main IntersectionObserver.
	 */
	AF._observers = AF._observers || [];

	AF.setupObserver = function () {
		// Disconnect any existing observers first (prevents leaks on refresh).
		AF._observers.forEach(function (obs) { obs.disconnect(); });
		AF._observers = [];

		if (!('IntersectionObserver' in window)) {
			// Fallback: show all elements.
			document.querySelectorAll('[data-animfolio-animate]').forEach(function (el) {
				el.classList.add('animfolio-visible');
			});
			document.querySelectorAll('.animfolio-stagger__item').forEach(function (el) {
				el.classList.add('animfolio-visible');
			});
			return;
		}

		// Shared reveal callback for every element; observer arg lets us unobserve one-shot elements.
		function onIntersect(entries, observer) {
			entries.forEach(function (entry) {
				if (!entry.isIntersecting) {
					return;
				}
				var target = entry.target;
				var delay = parseFloat(target.getAttribute('data-animfolio-delay')) || 0;
				var animationType = target.getAttribute('data-animfolio-animate');

				// Add the animation class.
				target.classList.add('animfolio-animate');
				target.classList.add('animfolio-animate--' + animationType);

				setTimeout(function () {
					target.classList.add('animfolio-visible');
				}, delay * 1000);

				// One-shot: stop observing after triggering.
				var once = target.getAttribute('data-animfolio-once');
				if (once !== 'false') {
					observer.unobserve(target);
				}
			});
		}

		// Group elements by threshold so we share one observer per distinct threshold, not one per element.
		var byThreshold = {};
		document.querySelectorAll('[data-animfolio-animate]').forEach(function (el) {
			var t = parseFloat(el.getAttribute('data-animfolio-threshold'));
			if (isNaN(t)) {
				t = 0.3;
			}
			t = Math.min(Math.max(t, 0), 1);
			var key = String(t);
			(byThreshold[key] = byThreshold[key] || []).push(el);
		});

		Object.keys(byThreshold).forEach(function (key) {
			var observer = new IntersectionObserver(onIntersect, { threshold: parseFloat(key) });
			byThreshold[key].forEach(function (el) {
				observer.observe(el);
			});
			AF._observers.push(observer);
		});
	};

	/**
	 * Destroy and clean up.
	 */
	AF.destroy = function () {
		// Disconnect all observers.
		AF._observers.forEach(function (obs) { obs.disconnect(); });
		AF._observers = [];

		Object.keys(AF.modules).forEach(function (name) {
			var mod = AF.modules[name];
			if (typeof mod.destroy === 'function') {
				mod.destroy();
			}
		});

		// Remove DOMContentLoaded listener if it hasn't fired yet.
		document.removeEventListener('DOMContentLoaded', AF.init);
	};

	/**
	 * Refresh (re-observe new elements).
	 */
	AF.refresh = function () {
		AF.setupObserver();
	};

	// Auto-init on DOM ready.
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', AF.init);
	} else {
		AF.init();
	}
})();
