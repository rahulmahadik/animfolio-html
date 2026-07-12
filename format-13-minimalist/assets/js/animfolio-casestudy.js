/**
 * AnimFolio Case Study Modal
 *
 * Each project that has a long-form case study renders a "View Case Study"
 * button and a hidden .animfolio-project__casestudy container holding the
 * case-study HTML. Clicking the button opens a single shared, accessible modal
 * (role="dialog", aria-modal) that displays the project's title and case-study
 * HTML. Supports ESC to close, click-backdrop to close, focus management
 * (focus the dialog on open, restore focus on close) and a simple focus trap.
 *
 * @package AnimFolio
 * @author     Rahul Mahadik
 * @since   1.0.0
 */
(function () {
	'use strict';

	// Translate via wp.i18n when present (script enqueued with wp-i18n + wp_set_script_translations).
	var __ = ( window.wp && window.wp.i18n && window.wp.i18n.__ ) ? window.wp.i18n.__ : function ( s ) { return s; };

	function initCaseStudy() {
		var buttons = document.querySelectorAll('[data-animfolio-casestudy]');
		if (!buttons.length) {
			return;
		}

		var overlay = null;
		var panel = null;
		var titleEl = null;
		var bodyEl = null;
		var closeBtn = null;
		var lastFocused = null;

		function getFocusable() {
			if (!panel) {
				return [];
			}
			var selector = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
			return Array.prototype.slice.call(panel.querySelectorAll(selector)).filter(function (el) {
				return el.offsetParent !== null || el === closeBtn;
			});
		}

		function onKeydown(e) {
			if (!overlay || overlay.style.display !== 'flex') {
				return;
			}
			if (e.key === 'Escape') {
				e.preventDefault();
				close();
				return;
			}
			if (e.key === 'Tab') {
				var focusable = getFocusable();
				if (!focusable.length) {
					e.preventDefault();
					panel.focus();
					return;
				}
				var first = focusable[0];
				var last = focusable[focusable.length - 1];
				if (e.shiftKey && document.activeElement === first) {
					e.preventDefault();
					last.focus();
				} else if (!e.shiftKey && document.activeElement === last) {
					e.preventDefault();
					first.focus();
				}
			}
		}

		function createOverlay() {
			overlay = document.createElement('div');
			overlay.className = 'animfolio-casestudy-modal';
			overlay.innerHTML =
				'<div class="animfolio-casestudy-modal__panel" role="dialog" aria-modal="true" aria-labelledby="animfolio-casestudy-title" tabindex="-1">' +
					'<button class="animfolio-casestudy-modal__close" type="button">&times;</button>' +
					'<h2 class="animfolio-casestudy-modal__title" id="animfolio-casestudy-title"></h2>' +
					'<div class="animfolio-casestudy-modal__body"></div>' +
				'</div>';
			// Set aria-label via DOM API so a quote in the translation can't break out of the attribute.
			overlay.querySelector('.animfolio-casestudy-modal__close').setAttribute('aria-label', __('Close', 'animfolio'));

			document.body.appendChild(overlay);

			panel = overlay.querySelector('.animfolio-casestudy-modal__panel');
			titleEl = overlay.querySelector('.animfolio-casestudy-modal__title');
			bodyEl = overlay.querySelector('.animfolio-casestudy-modal__body');
			closeBtn = overlay.querySelector('.animfolio-casestudy-modal__close');

			closeBtn.addEventListener('click', close);
			overlay.addEventListener('click', function (e) {
				if (e.target === overlay) {
					close();
				}
			});
			document.addEventListener('keydown', onKeydown);
		}

		function open(title, html) {
			if (!overlay) {
				createOverlay();
			}
			lastFocused = document.activeElement;
			titleEl.textContent = title || '';
			titleEl.style.display = title ? '' : 'none';
			// Keep the dialog named even when the project has no title.
			if (title) {
				panel.setAttribute('aria-labelledby', 'animfolio-casestudy-title');
				panel.removeAttribute('aria-label');
			} else {
				panel.setAttribute('aria-label', __('Case study', 'animfolio'));
				panel.removeAttribute('aria-labelledby');
			}
			// `html` is the server-rendered case-study body already present in the page
			// (wp_kses_post-sanitized at output); re-parented into the modal. No
			// user/untrusted input reaches this sink.
			bodyEl.innerHTML = html;
			overlay.style.display = 'flex';
			document.body.style.overflow = 'hidden';
			panel.scrollTop = 0;
			panel.focus();
		}

		function close() {
			if (overlay) {
				overlay.style.display = 'none';
			}
			document.body.style.overflow = '';
			if (lastFocused && typeof lastFocused.focus === 'function') {
				lastFocused.focus();
			}
			lastFocused = null;
		}

		buttons.forEach(function (btn) {
			btn.addEventListener('click', function () {
				var card = btn.closest('.animfolio-project, .animfolio-card, article, figure') || btn.parentNode;
				var source = card ? card.querySelector('.animfolio-project__casestudy') : null;
				if (!source) {
					return;
				}
				var headingEl = card.querySelector('.animfolio-project__title, .animfolio-card__title, h3');
				var title = headingEl ? headingEl.textContent.trim() : '';
				open(title, source.innerHTML);
			});
		});
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initCaseStudy);
	} else {
		initCaseStudy();
	}
})();
