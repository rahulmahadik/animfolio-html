/**
 * Smooth Scroll + Front-end UI Bindings
 *
 * Owns the always-needed portfolio UI behaviours that must work on EVERY render
 * path — including when animations are disabled, in css-only mode, on the
 * reduced-motion path (where the engine never calls module init()), and when the
 * "smooth scroll" setting is off:
 *
 *   - Programmatic anchor scrolling (smooth or instant, honouring the fixed-nav
 *     offset so anchored sections aren't hidden under the sticky nav).
 *   - Mobile nav hamburger toggle (open/close, outside-click, Escape).
 *   - Active nav-link highlighting on scroll.
 *   - Testimonials carousel active-dot tracking.
 *   - Back-to-top button.
 *
 * Because these must run even when the engine short-circuits (reduced motion) or
 * never inits a module, this file self-binds on DOM ready instead of relying on
 * the engine's module lifecycle. It still registers a module shell so
 * AF.destroy()/refresh() keep working.
 *
 * @package AnimFolio
 * @author     Rahul Mahadik
 * @since   1.0.0
 */
(function () {
	'use strict';

	var AF = window.animfolio;
	var settings = window.animfolioSettings || {};
	var handlers = [];
	var bound = false;

	/**
	 * Whether motion should be reduced (user setting + OS preference).
	 */
	function prefersReducedMotion() {
		return (
			settings.respectReducedMotion &&
			window.matchMedia &&
			window.matchMedia('(prefers-reduced-motion: reduce)').matches
		);
	}

	/**
	 * Whether anchor/scroll motion should animate smoothly. Off when the user
	 * disabled smooth scrolling, chose the "natural" scroll behaviour, or prefers
	 * reduced motion.
	 */
	function smoothEnabled() {
		if (prefersReducedMotion()) {
			return false;
		}
		if (settings.smoothScroll === false) {
			return false;
		}
		if (settings.scrollBehavior === 'natural') {
			return false;
		}
		return true;
	}

	/**
	 * Pixel offset to subtract when scrolling to an anchor, so the target sits
	 * below the sticky nav (and the WP admin bar) instead of behind it. Measured
	 * live from the rendered nav so it tracks responsive height changes.
	 */
	function navOffset() {
		var offset = 0;
		var nav = document.querySelector('.animfolio-nav--sticky');
		if (nav) {
			var rect = nav.getBoundingClientRect();
			// Only count the bar when it's actually pinned to the top.
			if (rect.top <= 1) {
				offset += rect.height;
			}
		}
		var adminBar = document.getElementById('wpadminbar');
		if (adminBar && getComputedStyle(adminBar).position === 'fixed') {
			offset += adminBar.getBoundingClientRect().height;
		}
		return offset;
	}

	/**
	 * Scroll the document so an element sits just below the fixed nav, smoothly
	 * or instantly per the current settings.
	 */
	function scrollToTarget(target) {
		var top = target.getBoundingClientRect().top + window.pageYOffset - navOffset() - 8;
		if (top < 0) {
			top = 0;
		}
		try {
			window.scrollTo({ top: top, behavior: smoothEnabled() ? 'smooth' : 'auto' });
		} catch (e) {
			// Older browsers: object form unsupported — fall back to instant.
			window.scrollTo(0, top);
		}
	}

	/**
	 * Keep the document's scroll-padding-top in sync with the live nav height so
	 * native hash navigation (and CSS smooth scrolling) also clears the nav.
	 */
	function syncScrollPadding() {
		var offset = navOffset();
		document.documentElement.style.scrollPaddingTop = offset ? offset + 16 + 'px' : '';
	}

	/**
	 * Reflect the smooth-scroll setting onto <html> so the CSS scroll-behavior
	 * rule (base.css) is gated by the user's choice and reduced-motion. This makes
	 * mouse-wheel/keyboard/native-hash scrolling smooth without any JS handler.
	 */
	function applySmoothClass() {
		document.documentElement.classList.toggle('animfolio-smooth-scroll', smoothEnabled());
	}

	function track(target, event, handler, opts) {
		target.addEventListener(event, handler, opts);
		handlers.push({ target: target, event: event, handler: handler });
	}

	/**
	 * Bind every UI behaviour. Idempotent — runs once regardless of how it is
	 * triggered (self-init on DOM ready, or the engine calling init()).
	 */
	function bind() {
		if (bound) {
			return;
		}
		bound = true;

		applySmoothClass();
		syncScrollPadding();

		// Anchor links within the portfolio (nav + in-page links).
		document.querySelectorAll('.animfolio-nav__link, .animfolio-container a[href^="#"]').forEach(function (link) {
			track(link, 'click', function (e) {
				var href = link.getAttribute('href');
				if (!href || href.charAt(0) !== '#' || href.length < 2) {
					return;
				}

				var target = document.getElementById(href.substring(1));
				if (!target) {
					return;
				}

				e.preventDefault();

				// Update the hash without the browser's own (offset-ignoring) jump.
				if (window.history && window.history.replaceState) {
					window.history.replaceState(null, '', href);
				}

				scrollToTarget(target);
			});
		});

		// Mobile nav hamburger toggle.
		var navToggle = document.querySelector('.animfolio-nav__toggle');
		if (navToggle) {
			track(navToggle, 'click', function () {
				var expanded = navToggle.getAttribute('aria-expanded') === 'true';
				navToggle.setAttribute('aria-expanded', expanded ? 'false' : 'true');
			});

			// Close the open mobile nav when a link is clicked.
			document.querySelectorAll('.animfolio-nav__link').forEach(function (link) {
				track(link, 'click', function () {
					navToggle.setAttribute('aria-expanded', 'false');
				});
			});

			// Close the open mobile nav when tapping outside it.
			var navList = document.getElementById('animfolio-nav-menu');
			track(document, 'click', function (e) {
				if (navToggle.getAttribute('aria-expanded') !== 'true') {
					return;
				}
				if (navToggle.contains(e.target)) {
					return;
				}
				if (navList && navList.contains(e.target)) {
					return;
				}
				navToggle.setAttribute('aria-expanded', 'false');
			});

			// Close on Escape and return focus to the toggle.
			track(document, 'keydown', function (e) {
				if ((e.key === 'Escape' || e.key === 'Esc') && navToggle.getAttribute('aria-expanded') === 'true') {
					navToggle.setAttribute('aria-expanded', 'false');
					navToggle.focus();
				}
			});
		}

		// Active nav-link highlighting on scroll.
		var sections = document.querySelectorAll('.animfolio-section');
		var navLinks = document.querySelectorAll('.animfolio-nav__link');
		if (sections.length && navLinks.length) {
			var onScrollNav = function () {
				var scrollPos = window.pageYOffset + navOffset() + 100;
				sections.forEach(function (section) {
					var top = section.offsetTop;
					var height = section.offsetHeight;
					var id = section.getAttribute('id');
					if (scrollPos >= top && scrollPos < top + height) {
						navLinks.forEach(function (link) {
							link.classList.remove('animfolio-nav__link--active');
							if (link.getAttribute('href') === '#' + id) {
								link.classList.add('animfolio-nav__link--active');
							}
						});
					}
				});
			};
			track(window, 'scroll', onScrollNav, { passive: true });
			onScrollNav();
		}

		// Testimonials carousel — update active dot on scroll.
		var carouselTrack = document.querySelector('.animfolio-testimonials-carousel__track');
		if (carouselTrack) {
			var dots = document.querySelectorAll('.animfolio-testimonials-carousel__dot');
			track(carouselTrack, 'scroll', function () {
				var scrollLeft = carouselTrack.scrollLeft;
				var slideWidth = carouselTrack.offsetWidth;
				// Cap to the last dot so momentum/elastic over-scroll never leaves
				// every dot inactive.
				var activeIndex = Math.min(dots.length - 1, Math.round(scrollLeft / slideWidth));
				dots.forEach(function (dot, i) {
					dot.classList.toggle('animfolio-testimonials-carousel__dot--active', i === activeIndex);
				});
			}, { passive: true });
		}

		// Back to top button.
		var backToTop = document.querySelector('.animfolio-back-to-top');
		if (backToTop) {
			track(backToTop, 'click', function () {
				try {
					window.scrollTo({ top: 0, behavior: smoothEnabled() ? 'smooth' : 'auto' });
				} catch (e) {
					window.scrollTo(0, 0);
				}
			});

			var onScroll = function () {
				if (window.pageYOffset > 300) {
					backToTop.classList.add('animfolio-back-to-top--visible');
				} else {
					backToTop.classList.remove('animfolio-back-to-top--visible');
				}
			};
			track(window, 'scroll', onScroll, { passive: true });
			onScroll();
		}

		// Re-measure the nav offset on resize/orientation change.
		track(window, 'resize', syncScrollPadding, { passive: true });

		// Re-evaluate smooth scrolling on live OS reduced-motion changes.
		if (window.matchMedia) {
			var mq = window.matchMedia('(prefers-reduced-motion: reduce)');
			var onMqChange = function () {
				applySmoothClass();
			};
			if (mq.addEventListener) {
				mq.addEventListener('change', onMqChange);
			} else if (mq.addListener) {
				mq.addListener(onMqChange);
			}
		}
	}

	function unbind() {
		handlers.forEach(function (h) {
			h.target.removeEventListener(h.event, h.handler);
		});
		handlers = [];
		bound = false;
	}

	// Register a module shell so AF.destroy()/refresh() integrate; init() is a no-op once self-bound.
	if (AF && typeof AF.registerModule === 'function') {
		AF.registerModule('smooth-scroll', {
			init: bind,
			destroy: unbind,
		});
	}

	// Self-init on DOM ready, independent of the engine lifecycle.
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', bind);
	} else {
		bind();
	}
})();
