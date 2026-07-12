/**
 * AnimFolio QR Code Renderer
 *
 * Uses qrcode-generator library for real scannable QR codes.
 * Falls back to a placeholder pattern if library not loaded.
 *
 * @package AnimFolio
 * @author     Rahul Mahadik
 * @since   1.0.0
 */
(function () {
	'use strict';

	// QR library is namespaced as window.animfolioQrcode; fall back to a bare global just in case.
	var qrlib = window.animfolioQrcode || window.qrcode || null;

	document.querySelectorAll('[data-animfolio-qr]').forEach(function (container) {
		var vcardData = container.getAttribute('data-animfolio-vcard');
		if (!vcardData) return;

		var decoded;
		try {
			// Decode the base64 vCard text from the data attribute. This plain text is
			// only fed to the QR generator (canvas) below — never to innerHTML or eval —
			// so this atob() is transport decoding, not code execution.
			decoded = atob(vcardData);
		} catch (e) {
			return;
		}

		var codeContainer = container.querySelector('.animfolio-qr__code');
		if (!codeContainer) return;

		// Render QR code using qrcode-generator if available.
		if (qrlib) {
			renderRealQR(codeContainer, decoded);
		} else {
			renderFallbackQR(codeContainer, decoded);
		}

		// Handle click-to-reveal mode.
		var trigger = container.querySelector('.animfolio-qr__trigger');
		if (trigger) {
			codeContainer.style.display = 'none';
			var download = container.querySelector('.animfolio-qr__download');
			if (download) download.style.display = 'none';

			trigger.addEventListener('click', function () {
				codeContainer.style.display = 'flex';
				if (download) download.style.display = 'inline';
				trigger.style.display = 'none';
			});
		}
	});

	/**
	 * Render a real scannable QR code using qrcode-generator.
	 */
	function renderRealQR(container, data) {
		try {
			// Error correction level: M (15% recovery) for normal, H (30%) for logo overlay.
			var qr = qrlib(0, 'M');
			qr.addData(data);
			qr.make();

			var size = parseInt(container.style.width, 10) || 220;
			var modules = qr.getModuleCount();

			// Fractional cell size fills the full requested size; render at DPR to stay crisp on HiDPI.
			var dpr = window.devicePixelRatio || 1;
			var cellSize = size / modules;

			var canvas = document.createElement('canvas');
			canvas.width = Math.round(size * dpr);
			canvas.height = Math.round(size * dpr);
			// CSS size stays at the logical size; the backing store is scaled up.
			canvas.style.width = size + 'px';
			canvas.style.height = size + 'px';

			var ctx = canvas.getContext('2d');
			if (!ctx) return;

			ctx.scale(dpr, dpr);

			// White background.
			ctx.fillStyle = '#ffffff';
			ctx.fillRect(0, 0, size, size);

			// Draw QR modules, snapping cell edges to whole device pixels to avoid hairline gaps.
			ctx.fillStyle = '#000000';
			for (var row = 0; row < modules; row++) {
				for (var col = 0; col < modules; col++) {
					if (qr.isDark(row, col)) {
						var x = Math.round(col * cellSize * dpr) / dpr;
						var y = Math.round(row * cellSize * dpr) / dpr;
						var w = Math.round((col + 1) * cellSize * dpr) / dpr - x;
						var h = Math.round((row + 1) * cellSize * dpr) / dpr - y;
						ctx.fillRect(x, y, w, h);
					}
				}
			}

			container.appendChild(canvas);
		} catch (e) {
			// Fall back to placeholder.
			renderFallbackQR(container, data);
		}
	}

	/**
	 * Fallback: render a visual placeholder (not scannable).
	 */
	function renderFallbackQR(container, data) {
		var canvas = document.createElement('canvas');
		var size = parseInt(container.style.width, 10) || 220;
		canvas.width = size;
		canvas.height = size;

		var ctx = canvas.getContext('2d');
		if (!ctx) return;

		ctx.fillStyle = '#ffffff';
		ctx.fillRect(0, 0, size, size);

		ctx.fillStyle = '#000000';
		var moduleSize = Math.floor(size / 33);
		var hash = simpleHash(data);

		for (var row = 0; row < 33; row++) {
			for (var col = 0; col < 33; col++) {
				if (isFinderPattern(row, col) || isFinderPattern(row, col - 26) || isFinderPattern(row - 26, col)) {
					ctx.fillRect(col * moduleSize, row * moduleSize, moduleSize, moduleSize);
					continue;
				}
				if ((hash + row * 33 + col) % 3 === 0) {
					ctx.fillRect(col * moduleSize, row * moduleSize, moduleSize, moduleSize);
				}
			}
		}

		container.appendChild(canvas);
	}

	function isFinderPattern(row, col) {
		if (row < 0 || col < 0 || row > 6 || col > 6) return false;
		if (row === 0 || row === 6 || col === 0 || col === 6) return true;
		if (row >= 2 && row <= 4 && col >= 2 && col <= 4) return true;
		return false;
	}

	function simpleHash(str) {
		var hash = 0;
		for (var i = 0; i < str.length; i++) {
			hash = (hash << 5) - hash + str.charCodeAt(i);
			hash |= 0;
		}
		return Math.abs(hash);
	}
})();
