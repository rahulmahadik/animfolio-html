/**
 * AnimFolio Lightbox
 *
 * Simple image lightbox for project/gallery images.
 * Click image to open fullscreen overlay with prev/next navigation.
 *
 * @package AnimFolio
 * @author     Rahul Mahadik
 * @since   1.0.0
 */
(function () {
	'use strict';

	function initLightbox() {
	var overlay = null;
	var imgEl = null;
	var captionEl = null;
	var exifEl = null;
	var images = [];
	var currentIndex = 0;
	var lastFocus = null;
	// Translate via wp.i18n when present (enqueued with wp-i18n + wp_set_script_translations); plain fallback otherwise.
	var __ = ( window.wp && window.wp.i18n && window.wp.i18n.__ ) ? window.wp.i18n.__ : function ( s ) { return s; };

	// Collect all project images; .animfolio-project__image is the <img> itself or a wrapper.
	document.querySelectorAll('.animfolio-project__image').forEach(function (el) {
		var img = el.tagName === 'IMG' ? el : el.querySelector('img');
		if (!img) return;
		// Index into `images` (placeholders are skipped, so not the querySelectorAll index).
		var index = images.length;
		el.style.cursor = 'pointer';
		el.setAttribute('data-lightbox-index', index);
		// Make the trigger keyboard- and screen-reader-operable.
		el.setAttribute('tabindex', '0');
		el.setAttribute('role', 'button');
		el.setAttribute('aria-label', (img.alt || __('Image', 'animfolio')) + ' — ' + __('open lightbox', 'animfolio'));
		var parent = el.closest('.animfolio-project') || el.closest('.animfolio-card');
		var titleEl = parent ? parent.querySelector('.animfolio-project__title, .animfolio-card__title') : null;
		// Optional EXIF/camera summary (photographer format), falling back to data-caption.
		var exif = el.getAttribute('data-exif') || el.getAttribute('data-caption') || '';
		images.push({
			src: img.src,
			alt: img.alt || '',
			title: titleEl ? titleEl.textContent : '',
			exif: exif
		});

		el.addEventListener('click', function () {
			open(parseInt(this.getAttribute('data-lightbox-index'), 10), this);
		});
		el.addEventListener('keydown', function (e) {
			if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
				e.preventDefault();
				open(parseInt(this.getAttribute('data-lightbox-index'), 10), this);
			}
		});
	});

	if (images.length === 0) return;

	function createOverlay() {
		overlay = document.createElement('div');
		overlay.className = 'animfolio-lightbox';
		overlay.setAttribute('role', 'dialog');
		overlay.setAttribute('aria-modal', 'true');
		overlay.setAttribute('aria-label', __('Image viewer', 'animfolio'));
		overlay.innerHTML =
			'<button class="animfolio-lightbox__close">&times;</button>' +
			'<button class="animfolio-lightbox__prev">&lsaquo;</button>' +
			'<button class="animfolio-lightbox__next">&rsaquo;</button>' +
			'<div class="animfolio-lightbox__content">' +
				'<img class="animfolio-lightbox__img" src="" alt="" />' +
				'<div class="animfolio-lightbox__caption"></div>' +
				'<div class="animfolio-lightbox__exif"></div>' +
			'</div>' +
			'<div class="animfolio-lightbox__counter"></div>';
		// Set aria-labels via DOM API so a quote in the translation can't break out of the attribute.
		overlay.querySelector('.animfolio-lightbox__close').setAttribute('aria-label', __('Close', 'animfolio'));
		overlay.querySelector('.animfolio-lightbox__prev').setAttribute('aria-label', __('Previous', 'animfolio'));
		overlay.querySelector('.animfolio-lightbox__next').setAttribute('aria-label', __('Next', 'animfolio'));

		document.body.appendChild(overlay);

		imgEl = overlay.querySelector('.animfolio-lightbox__img');
		captionEl = overlay.querySelector('.animfolio-lightbox__caption');
		exifEl = overlay.querySelector('.animfolio-lightbox__exif');

		overlay.querySelector('.animfolio-lightbox__close').addEventListener('click', close);
		overlay.querySelector('.animfolio-lightbox__prev').addEventListener('click', prev);
		overlay.querySelector('.animfolio-lightbox__next').addEventListener('click', next);

		// Hide prev/next if only 1 image.
		if (images.length <= 1) {
			overlay.querySelector('.animfolio-lightbox__prev').style.display = 'none';
			overlay.querySelector('.animfolio-lightbox__next').style.display = 'none';
			overlay.querySelector('.animfolio-lightbox__counter').style.display = 'none';
		}
		overlay.addEventListener('click', function (e) {
			if (e.target === overlay) close();
		});

		document.addEventListener('keydown', function (e) {
			if (!overlay || overlay.style.display !== 'flex') return;
			if (e.key === 'Escape') close();
			if (e.key === 'ArrowLeft') prev();
			if (e.key === 'ArrowRight') next();
		});
	}

	function open(index, trigger) {
		if (!overlay) createOverlay();
		lastFocus = trigger || document.activeElement;
		currentIndex = index;
		show();
		overlay.style.display = 'flex';
		document.body.style.overflow = 'hidden';
		// Move focus into the dialog for keyboard/screen-reader users.
		var closeBtn = overlay.querySelector('.animfolio-lightbox__close');
		if (closeBtn) closeBtn.focus();
	}

	function close() {
		if (overlay) overlay.style.display = 'none';
		document.body.style.overflow = '';
		// Restore focus to the trigger that opened the lightbox.
		if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
		lastFocus = null;
	}

	function prev() {
		currentIndex = (currentIndex - 1 + images.length) % images.length;
		show();
	}

	function next() {
		currentIndex = (currentIndex + 1) % images.length;
		show();
	}

	function show() {
		var img = images[currentIndex];
		imgEl.src = img.src;
		imgEl.alt = img.alt;
		captionEl.textContent = img.title;
		if (exifEl) {
			exifEl.textContent = img.exif || '';
			exifEl.style.display = img.exif ? '' : 'none';
		}
		overlay.querySelector('.animfolio-lightbox__counter').textContent =
			(currentIndex + 1) + ' / ' + images.length;
	}
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initLightbox);
	} else {
		initLightbox();
	}
})();
