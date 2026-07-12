(function () {
	'use strict';

	// Translation helper — wp.i18n when available, else the literal string.
	var __ = (window.wp && window.wp.i18n && window.wp.i18n.__)
		? window.wp.i18n.__
		: function (s) { return s; };

	/**
	 * AnimFolio — Format 15: CLI Terminal
	 *
	 * Interactive terminal emulator. On load only the boot sequence, banner,
	 * and a blinking-cursor input line are visible. Users type commands
	 * (help, about, experience, skills, projects, contact, all, clear) to
	 * reveal sections with a character-by-character typing animation.
	 *
	 * Features:
	 * - Command input with prompt styling
	 * - Typing animation (requestAnimationFrame, configurable speed)
	 * - Auto-scroll to bottom on new output
	 * - Up-arrow command history recall
	 * - Tab completion for command names
	 * - Mobile: clickable command buttons below input
	 *
	 * Zero external dependencies. Works with the HTML produced by template.php.
	 */

	/* ------------------------------------------------------------------ */
	/*  Constants / configuration                                          */
	/* ------------------------------------------------------------------ */

	var TYPING_SPEED_MS = 8;          // ms per character (lower = faster)
	var BOOT_LINE_DELAY_MS = 80;      // stagger between boot lines

	// Built-in commands that always exist; section commands are discovered at runtime (parseSections).
	var BUILTIN_COMMANDS = ['help', 'send-message', 'clear', 'all'];
	var COMMANDS = BUILTIN_COMMANDS.slice();

	// Command name -> auto-run command text from template.php, used to label prompt echoes.
	// Seeded with the curated six; other sections are added at runtime (parseSections).
	var CMD_MATCH = {
		about:      'cat about.txt',
		experience: 'ls experience/',
		skills:     'skills --format=bar',
		projects:   'ls projects/',
		stats:      'cat metrics.txt',
		contact:    'contact --info'
	};

	// Curated help descriptions for the known commands. Discovered (generic)
	// section commands fall back to "Show <name>" in showHelp().
	var CMD_HELP = {
		about:      __('Display bio and personal info', 'animfolio'),
		experience: __('List work experience', 'animfolio'),
		skills:     __('Show skills with proficiency bars', 'animfolio'),
		projects:   __('Browse portfolio projects', 'animfolio'),
		stats:      __('Show key metrics', 'animfolio'),
		contact:    __('Display contact information', 'animfolio')
	};

	/* ------------------------------------------------------------------ */
	/*  DOM references                                                     */
	/* ------------------------------------------------------------------ */

	var terminal = document.getElementById('animfolio-terminal');
	if (!terminal) return;

	var body = document.getElementById('animfolio-cli-output');
	if (!body) return;

	// Reduced motion: show all content immediately, no hiding or typing.
	var reduceMotion = window.matchMedia &&
		window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	// data-cli-interactive="0" (cli_terminal_interactive off): show every section up-front.
	var interactiveOff = terminal.getAttribute('data-cli-interactive') === '0';
	var showAll = reduceMotion || interactiveOff;

	/* ------------------------------------------------------------------ */
	/*  Build the prompt HTML from the persona username                    */
	/* ------------------------------------------------------------------ */

	// Persona name + host come from data attributes so the prompt matches the auto-run prompts.
	function escapeHTML(str) {
		var div = document.createElement('div');
		div.appendChild(document.createTextNode(str));
		return div.innerHTML;
	}

	var promptUser = terminal.getAttribute('data-cli-user') || 'user';
	var promptHost = terminal.getAttribute('data-cli-host') || 'portfolio';
	var promptHTML =
		'<span class="animfolio-cli__user">' + escapeHTML(promptUser) + '@' + escapeHTML(promptHost) + '</span>' +
		':<span class="animfolio-cli__path">~</span>' +
		'<span class="animfolio-cli__dollar">$</span>';

	/* ------------------------------------------------------------------ */
	/*  Parse existing sections from the DOM                               */
	/* ------------------------------------------------------------------ */

	// Group nodes by the data-cli-cmd attribute template.php tags each one with.
	var sectionGroups = {};  // command-name -> [array of DOM nodes belonging to that section]
	var sectionOrder  = [];  // command names in document order

	(function parseSections() {
		var children = Array.prototype.slice.call(body.children);
		children.forEach(function (node) {
			if (!node.getAttribute) return;
			var cmd = node.getAttribute('data-cli-cmd');
			if (!cmd) return;
			if (!sectionGroups[cmd]) {
				sectionGroups[cmd] = [];
				sectionOrder.push(cmd);
			}
			sectionGroups[cmd].push(node);
		});
	})();

	// Register every discovered section command; section commands first, built-ins last.
	sectionOrder.forEach(function (cmd) {
		if (!CMD_MATCH[cmd]) {
			CMD_MATCH[cmd] = 'cat ' + cmd + '.txt';
		}
	});
	COMMANDS = sectionOrder.slice().concat(BUILTIN_COMMANDS);

	/* ------------------------------------------------------------------ */
	/*  Hide all section content initially                                 */
	/* ------------------------------------------------------------------ */

	Object.keys(sectionGroups).forEach(function (cmd) {
		sectionGroups[cmd].forEach(function (node) {
			node.setAttribute('data-animfolio-section', cmd);
			// showAll (reduced-motion or interactive-off): leave sections visible.
			if (!showAll) {
				node.style.display = 'none';
			}
		});
	});

	// Also hide the old static cursor/input line
	var oldInputLine = body.querySelector('.animfolio-cli__input-line');
	if (oldInputLine) oldInputLine.style.display = 'none';

	/* ------------------------------------------------------------------ */
	/*  Boot sequence: stagger-reveal system lines + banner                */
	/* ------------------------------------------------------------------ */

	(function bootSequence() {
		var bootNodes = [];
		var children = Array.prototype.slice.call(body.children);
		for (var i = 0; i < children.length; i++) {
			var node = children[i];
			if (node.getAttribute && node.getAttribute('data-animfolio-section')) break;
			if (node === oldInputLine) continue;
			if (node.style.display === 'none') continue;
			bootNodes.push(node);
		}
		bootNodes.forEach(function (node, idx) {
			node.style.opacity = '0';
			node.style.transition = 'opacity 0.15s ease';
			setTimeout(function () {
				node.style.opacity = '1';
			}, idx * BOOT_LINE_DELAY_MS);
		});
	})();

	/* ------------------------------------------------------------------ */
	/*  Create interactive input line                                      */
	/* ------------------------------------------------------------------ */

	// A <form> (not a plain div) so the mobile keyboard's Enter / "Go" key reliably
	// submits — mobile browsers frequently don't fire a usable keydown 'Enter', which
	// is why typing a command (and the send-message steps) appeared dead on phones.
	// The submit handler below dispatches the command.
	var inputLine = document.createElement('form');
	inputLine.className = 'animfolio-cli__line animfolio-cli__input-line animfolio-cli__input-interactive';
	inputLine.setAttribute('autocomplete', 'off');
	inputLine.setAttribute('action', '');
	inputLine.innerHTML = promptHTML + ' ';

	var inputField = document.createElement('input');
	inputField.type = 'text';
	inputField.className = 'animfolio-cli__input-field';
	inputField.setAttribute('autocomplete', 'off');
	inputField.setAttribute('autocorrect', 'off');
	inputField.setAttribute('autocapitalize', 'off');
	inputField.setAttribute('spellcheck', 'false');
	inputField.setAttribute('enterkeyhint', 'go'); // labels the mobile keyboard's submit key
	inputField.setAttribute('aria-label', __('Terminal command input', 'animfolio'));

	// Visual styling lives in style.css (.animfolio-cli__input-field) so the
	// colors track the --animfolio-* tokens / scheme toggle.

	inputLine.appendChild(inputField);
	body.appendChild(inputLine);

	/* ------------------------------------------------------------------ */
	/*  Mobile command buttons                                             */
	/* ------------------------------------------------------------------ */

	var mobileBar = document.createElement('div');
	mobileBar.className = 'animfolio-cli__mobile-commands';
	// Layout-only inline styles; colors/border live in style.css so they track
	// the --animfolio-* tokens / scheme toggle.
	mobileBar.style.cssText = [
		'display: none',
		'flex-wrap: wrap',
		'gap: 6px',
		'padding: 12px 0 4px',
		'margin-top: 8px'
	].join(';');

	COMMANDS.forEach(function (cmd) {
		var btn = document.createElement('button');
		btn.type = 'button';
		btn.textContent = cmd;
		btn.className = 'animfolio-cli__mobile-btn';
		// Layout-only inline styles; colors handled by style.css (incl. :hover).
		btn.style.cssText = [
			'font-family: inherit',
			'font-size: 0.8rem',
			'padding: 4px 10px',
			'border-radius: 3px',
			'cursor: pointer',
			'transition: background 0.15s, border-color 0.15s'
		].join(';');
		btn.addEventListener('click', function () {
			executeCommand(cmd);
		});
		mobileBar.appendChild(btn);
	});

	body.appendChild(mobileBar);

	// Show mobile buttons on narrow screens
	function checkMobile() {
		mobileBar.style.display = window.innerWidth <= 768 ? 'flex' : 'none';
	}
	checkMobile();
	window.addEventListener('resize', checkMobile);

	/* ------------------------------------------------------------------ */
	/*  Auto-type on load                                                  */
	/* ------------------------------------------------------------------ */

	(function autoTypeSections() {
		// showAll: sections already visible, skip the typing reveal.
		if (showAll) {
			moveInputToBottom();
			inputField.focus();
			return;
		}
		// Start the auto-type right after the boot stagger finishes.
		var bootCount = 0;
		var kids = Array.prototype.slice.call(body.children);
		for (var i = 0; i < kids.length; i++) {
			if (kids[i].getAttribute && kids[i].getAttribute('data-animfolio-section')) {
				break;
			}
			bootCount++;
		}
		var startDelay = bootCount * BOOT_LINE_DELAY_MS + 350;

		setTimeout(function () {
			// Interactive mode: type a short welcome instead of dumping every section.
			// Sections stay hidden until a command reveals them (still in the DOM for no-JS / SEO).
			var introBlock = createOutputBlock(
				'<div style="color:#a0a0a0;line-height:1.7;">' +
				'<span style="color:#00FF41;">Interactive terminal.</span> Type a command to explore — try ' +
				'<span style="color:#FFD700;">about</span>, <span style="color:#FFD700;">skills</span>, ' +
				'<span style="color:#FFD700;">projects</span> or <span style="color:#FFD700;">contact</span>.<br>' +
				'Type <span style="color:#00FF41;">help</span> for all commands, or ' +
				'<span style="color:#00FF41;">all</span> to show everything at once.' +
				'</div>'
			);
			body.insertBefore(introBlock, inputLine);
			body.insertBefore(document.createElement('br'), inputLine);
			moveInputToBottom();
			queueTypingReveal([ introBlock ], function () {
				moveInputToBottom();
				inputField.focus();
			});
		}, startDelay);
	})();

	/* ------------------------------------------------------------------ */
	/*  Focus management                                                   */
	/* ------------------------------------------------------------------ */

	// Focus the input when clicking anywhere in the terminal body
	body.addEventListener('click', function (e) {
		if (e.target.tagName !== 'A' && e.target.tagName !== 'BUTTON' && e.target.tagName !== 'INPUT') {
			inputField.focus();
		}
	});

	// Auto-focus on load after boot sequence finishes
	setTimeout(function () {
		inputField.focus();
	}, 600);

	/* ------------------------------------------------------------------ */
	/*  Command history                                                    */
	/* ------------------------------------------------------------------ */

	var cmdHistory = [];
	var historyIndex = -1;

	/* ------------------------------------------------------------------ */
	/*  Auto-scroll helper                                                 */
	/* ------------------------------------------------------------------ */

	// Auto-follow the output into view ONLY until the visitor scrolls; the moment
	// they do (wheel or touch), stop — the terminal must never fight or block the
	// page scroll. Re-enabled when a command is run (so its output is shown).
	var autoScroll = true;
	['wheel', 'touchmove'].forEach(function (ev) {
		window.addEventListener(ev, function () { autoScroll = false; }, { passive: true });
	});

	function scrollToBottom() {
		if (!autoScroll || !inputLine) return;
		var rect = inputLine.getBoundingClientRect();
		if (rect.bottom > window.innerHeight) {
			inputLine.scrollIntoView({ block: 'end' }); // instant, never smooth
		}
	}

	/* ------------------------------------------------------------------ */
	/*  Typing animation                                                   */
	/* ------------------------------------------------------------------ */

	var typingQueue = [];
	var isTyping = false;

	/**
	 * Reveal a DOM node's content with a typing animation.
	 * For element nodes we iterate through text nodes within,
	 * revealing characters one at a time.
	 *
	 * @param {HTMLElement} node    The node to animate.
	 * @param {Function}    done    Callback when animation is finished.
	 */
	function typeRevealNode(node, done) {
		node.style.display = '';

		// <br> or empty nodes: just show and finish.
		if (node.nodeName === 'BR' || !node.innerHTML || !node.innerHTML.trim()) {
			done();
			return;
		}

		var fullHTML = node.innerHTML;

		// Long content (e.g. a big achievements / certifications list from a LinkedIn
		// import) would "type" character-by-character for far too long and never seem
		// to stop — reveal it instantly instead.
		if (fullHTML.length > 700) {
			node.style.visibility = 'visible';
			scrollToBottom();
			done();
			return;
		}

		node.innerHTML = '';
		node.style.visibility = 'visible';

		var tempPre = document.createElement('span');
		tempPre.style.cssText = 'white-space: pre-wrap;';
		node.appendChild(tempPre);

		// Stream the raw HTML characters; the browser re-parses innerHTML as we set it.
		var chars = fullHTML;
		var len = chars.length;
		var pos = 0;
		var inTag = false;
		var startTime = null;

		function step(timestamp) {
			if (!startTime) startTime = timestamp;

			var elapsed = timestamp - startTime;
			var targetPos = Math.min(len, Math.floor(elapsed / TYPING_SPEED_MS));

			// Fast-forward through HTML tags (don't animate inside < >).
			while (pos < targetPos && pos < len) {
				if (chars[pos] === '<') inTag = true;
				if (inTag) {
					while (pos < len && chars[pos] !== '>') pos++;
					if (pos < len) pos++; // skip the '>'
					inTag = false;
					continue;
				}
				pos++;
			}

			// If we stopped inside a tag, advance to close it.
			if (inTag) {
				while (pos < len && chars[pos] !== '>') pos++;
				if (pos < len) pos++;
				inTag = false;
			}

			node.innerHTML = chars.substring(0, pos);
			scrollToBottom();

			if (pos < len) {
				requestAnimationFrame(step);
			} else {
				node.innerHTML = fullHTML;
				scrollToBottom();
				done();
			}
		}

		requestAnimationFrame(step);
	}

	/**
	 * Queue a set of nodes to be revealed in order with typing animation.
	 *
	 * @param {Array}    nodes     Array of DOM nodes.
	 * @param {Function} callback  Called when all nodes are done.
	 */
	function queueTypingReveal(nodes, callback) {
		typingQueue.push({ nodes: nodes, index: 0, callback: callback });
		if (!isTyping) processQueue();
	}

	function processQueue() {
		if (typingQueue.length === 0) {
			isTyping = false;
			return;
		}
		isTyping = true;
		var task = typingQueue[0];
		if (task.index >= task.nodes.length) {
			typingQueue.shift();
			if (task.callback) task.callback();
			processQueue();
			return;
		}
		var node = task.nodes[task.index];
		task.index++;
		typeRevealNode(node, function () {
			processQueue();
		});
	}

	/* ------------------------------------------------------------------ */
	/*  Add output to the terminal (prompt echo + section reveal)          */
	/* ------------------------------------------------------------------ */

	/**
	 * Create a prompt line showing the command the user typed.
	 *
	 * @param {string} cmdText  The command text to display.
	 * @return {HTMLElement}
	 */
	function createPromptEcho(cmdText) {
		var line = document.createElement('div');
		line.className = 'animfolio-cli__line';
		line.innerHTML = promptHTML + ' <span class="animfolio-cli__cmd">' + escapeHTML(cmdText) + '</span>';
		return line;
	}

	/**
	 * Insert a raw text output block.
	 *
	 * @param {string} html  HTML content for the output.
	 * @return {HTMLElement}
	 */
	function createOutputBlock(html) {
		var block = document.createElement('div');
		block.className = 'animfolio-cli__output';
		block.innerHTML = html;
		block.style.display = 'none';
		return block;
	}

	/**
	 * Move the input line and mobile bar back to the bottom.
	 */
	function moveInputToBottom() {
		body.appendChild(inputLine);
		body.appendChild(mobileBar);
		scrollToBottom();
	}

	/* ------------------------------------------------------------------ */
	/*  Reveal a section by command name                                    */
	/* ------------------------------------------------------------------ */

	function revealSection(cmdName) {
		var nodes = sectionGroups[cmdName];
		if (!nodes || nodes.length === 0) {
			// Section not available
			var errBlock = createOutputBlock(
				'<span style="color:#FF5F56;">' + __('Error: section', 'animfolio') + ' "' + escapeHTML(cmdName) + '" ' + __('not found or empty.', 'animfolio') + '</span>'
			);
			body.insertBefore(errBlock, inputLine);
			errBlock.style.display = '';
			moveInputToBottom();
			return;
		}

		// Move section nodes right before the input line, preserving order.
		nodes.forEach(function (node) {
			body.insertBefore(node, inputLine);
		});

		var spacer = document.createElement('br');
		body.insertBefore(spacer, inputLine);

		moveInputToBottom();

		queueTypingReveal(nodes, function () {
			scrollToBottom();
		});
	}

	/* ------------------------------------------------------------------ */
	/*  Help output                                                        */
	/* ------------------------------------------------------------------ */

	function showHelp() {
		function helpRow(name, desc, accent) {
			return '<tr><td style="padding:2px 16px 2px 0;color:' + (accent || '#00FF41') +
				';font-weight:600;">' + escapeHTML(name) +
				'</td><td style="color:#a0a0a0;">' + escapeHTML(desc) + '</td></tr>';
		}

		// Title-case a section command for a generic "Show <name>" description.
		function titleize(name) {
			return name.charAt(0).toUpperCase() + name.slice(1).replace(/[-_]/g, ' ');
		}

		var rows = [];
		rows.push(helpRow('help', __('Show this help message', 'animfolio')));

		// Section commands, in document order — curated description when known,
		// otherwise a generic "Show <name>" so every rendered section is listed.
		sectionOrder.forEach(function (cmd) {
			rows.push(helpRow(cmd, CMD_HELP[cmd] || (__('Show', 'animfolio') + ' ' + titleize(cmd))));
		});

		rows.push(helpRow('send-message', __('Send a message (interactive form)', 'animfolio'), '#FFD700'));
		rows.push(helpRow('all', __('Show all sections', 'animfolio')));
		rows.push(helpRow('clear', __('Clear the terminal', 'animfolio')));

		var helpHTML = [
			'<div style="margin-bottom:8px;"><strong style="color:#FFD700;">' + __('Available commands:', 'animfolio') + '</strong></div>',
			'<table style="border-collapse:collapse;">',
			rows.join(''),
			'</table>'
		].join('');

		var block = createOutputBlock(helpHTML);
		body.insertBefore(block, inputLine);
		var spacer = document.createElement('br');
		body.insertBefore(spacer, inputLine);
		moveInputToBottom();
		queueTypingReveal([block], function () {
			scrollToBottom();
		});
	}

	/* ------------------------------------------------------------------ */
	/*  Clear terminal                                                     */
	/* ------------------------------------------------------------------ */

	function clearTerminal() {
		// Remove everything except boot lines, inputLine, and mobileBar
		var children = Array.prototype.slice.call(body.children);
		var bootDone = false;

		children.forEach(function (node) {
			if (node === inputLine || node === mobileBar) return;

			// Section node: re-hide and leave it for later re-reveal.
			if (node.getAttribute && node.getAttribute('data-animfolio-section')) {
				node.style.display = 'none';
				return;
			}

			// Keep boot sequence nodes; boot ends at the first non-boot element.
			if (!bootDone) {
				if (node.classList && (node.classList.contains('animfolio-cli__line--system') || node.classList.contains('animfolio-cli__line--banner'))) {
					return;
				}
				// The title/subtitle line and <br> after banner are boot-adjacent.
				if (node.nodeName === 'BR') return;
				if (node.classList && node.classList.contains('animfolio-cli__line') && !node.querySelector('.animfolio-cli__cmd')) {
					return;
				}
				bootDone = true;
			}

			if (node.getAttribute && node.getAttribute('data-animfolio-section')) {
				node.style.display = 'none';
			} else {
				// Dynamically added nodes (prompt echos, help blocks, spacers) — remove.
				body.removeChild(node);
			}
		});

		// Reset contact form state if active.
		contactFormActive = false;
		contactStep = 0;

		// Abort any in-progress typing animation.
		typingQueue = [];
		isTyping = false;

		moveInputToBottom();
		scrollToBottom();
	}

	/* ------------------------------------------------------------------ */
	/*  Execute a command                                                   */
	/* ------------------------------------------------------------------ */

	function executeCommand(cmdRaw) {
		// Running a command means the visitor wants to see its output — resume
		// auto-follow (it may have been turned off by an earlier manual scroll).
		autoScroll = true;
		// While the contact form is active, route input to the form, not the dispatcher.
		if (contactFormActive) {
			var answer = cmdRaw;
			inputField.value = '';
			handleContactInput(answer);
			inputField.focus();
			return;
		}

		var cmd = cmdRaw.trim().toLowerCase();
		if (!cmd) return;

		cmdHistory.push(cmd);
		historyIndex = cmdHistory.length;

		inputField.value = '';

		// Echo the command as a prompt line.
		var echo = createPromptEcho(cmd);
		body.insertBefore(echo, inputLine);

		if (cmd === 'help') {
			showHelp();
		} else if (cmd === 'clear') {
			clearTerminal();
		} else if (cmd === 'all') {
			// Each group has its own prompt line; don't create a separate echo (avoids duplicates).
			var allNodes = [];
			sectionOrder.forEach(function (name) {
				if (sectionGroups[name] && sectionGroups[name].length > 0) {
					sectionGroups[name].forEach(function (node) {
						body.insertBefore(node, inputLine);
						allNodes.push(node);
					});
				}
			});
			moveInputToBottom();
			queueTypingReveal(allNodes, function () {
				scrollToBottom();
			});
		} else if (cmd === 'send-message' || cmd === 'msg' || cmd === 'mail') {
			startContactForm();
		} else if (CMD_MATCH[cmd]) {
			revealSection(cmd);
		} else {
			// Unknown command
			var errBlock = createOutputBlock(
				'<span style="color:#FF5F56;">' + __('Command not found:', 'animfolio') + ' ' + escapeHTML(cmd) + '</span><br>' +
				'<span style="color:#a0a0a0;">' + __('Type', 'animfolio') + ' <span style="color:#00FF41;">help</span> ' + __('for available commands.', 'animfolio') + '</span>'
			);
			body.insertBefore(errBlock, inputLine);
			errBlock.style.display = '';
			var spacer = document.createElement('br');
			body.insertBefore(spacer, inputLine);
			moveInputToBottom();
		}

		inputField.focus();
	}

	/* ------------------------------------------------------------------ */
	/*  Keyboard handling                                                  */
	/* ------------------------------------------------------------------ */

	// Submit (Enter, or the mobile keyboard's "Go"/"Send") — run the typed command.
	// Handling the FORM submit (not just keydown 'Enter') is what makes this work on
	// mobile, where keydown 'Enter' is frequently never fired — that was the bug.
	inputLine.addEventListener('submit', function (e) {
		e.preventDefault();
		executeCommand(inputField.value);
	});

	inputField.addEventListener('keydown', function (e) {
		// Up arrow — previous command in history
		if (e.key === 'ArrowUp') {
			e.preventDefault();
			if (cmdHistory.length > 0) {
				historyIndex = Math.max(0, historyIndex - 1);
				inputField.value = cmdHistory[historyIndex] || '';
				// Move cursor to end
				setTimeout(function () {
					inputField.selectionStart = inputField.selectionEnd = inputField.value.length;
				}, 0);
			}
			return;
		}

		// Down arrow — next command in history
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			if (historyIndex < cmdHistory.length - 1) {
				historyIndex++;
				inputField.value = cmdHistory[historyIndex] || '';
			} else {
				historyIndex = cmdHistory.length;
				inputField.value = '';
			}
			return;
		}

		// Tab — auto-complete command names
		if (e.key === 'Tab') {
			e.preventDefault();
			var current = inputField.value.trim().toLowerCase();
			if (!current) return;

			var matches = COMMANDS.filter(function (c) {
				return c.indexOf(current) === 0;
			});

			if (matches.length === 1) {
				inputField.value = matches[0];
			} else if (matches.length > 1) {
				// Find common prefix among matches
				var prefix = matches[0];
				for (var i = 1; i < matches.length; i++) {
					while (matches[i].indexOf(prefix) !== 0) {
						prefix = prefix.substring(0, prefix.length - 1);
					}
				}
				inputField.value = prefix;

				// Show possible completions as output
				var compBlock = createOutputBlock(
					'<span style="color:#a0a0a0;">Possible completions: </span>' +
					matches.map(function (m) {
						return '<span style="color:#00FF41;">' + escapeHTML(m) + '</span>';
					}).join('  ')
				);
				body.insertBefore(compBlock, inputLine);
				compBlock.style.display = '';
				moveInputToBottom();
			}
			return;
		}
	});

	/* ------------------------------------------------------------------ */
	/*  Interactive contact form (send-message command)                     */
	/* ------------------------------------------------------------------ */

	var contactFormActive = false;
	var contactStep = 0;
	var contactData = { name: '', email: '', message: '' };
	var contactToken = '';
	var contactStartTs = 0;

	function startContactForm() {
		contactFormActive = true;
		contactStep = 0;
		contactData = { name: '', email: '', message: '' };

		// Capture the form-open time (used as the fallback time-check timestamp when
		// the server token isn't available) so a multi-step human submit reads as
		// >3s elapsed, mirroring the standard form which timestamps at load.
		contactStartTs = Math.floor(Date.now() / 1000);

		// Fetch a server-signed anti-spam token at form open, so the elapsed time to
		// finish typing is measured server-side (a direct API POST can't forge it).
		contactToken = '';
		// static export: no server anti-spam token needed (FormSubmit.co)

		var intro = createOutputBlock(
			'<span style="color:#FFD700;">--- ' + __('Send a Message', 'animfolio') + ' ---</span><br>' +
			'<span style="color:#a0a0a0;">' + __('Fill in the fields below. Type your answer and press Enter.', 'animfolio') + '</span><br>' +
			'<span style="color:#a0a0a0;">' + __('Type', 'animfolio') + ' <span style="color:#FF5F56;">cancel</span> ' + __('to abort.', 'animfolio') + '</span><br><br>' +
			'<span style="color:#00FF41;">' + __('Name', 'animfolio') + '</span> <span style="color:#a0a0a0;">' + __('(required):', 'animfolio') + '</span>'
		);
		intro.style.display = '';
		body.insertBefore(intro, inputLine);
		moveInputToBottom();
		scrollToBottom();

		// Override the input handler temporarily
		if (inputField) {
			inputField.placeholder = __('Your name...', 'animfolio');
		}
	}

	function handleContactInput(value) {
		if (value.toLowerCase() === 'cancel') {
			contactFormActive = false;
			contactStep = 0;
			var cancelMsg = createOutputBlock('<span style="color:#FF5F56;">' + __('Message cancelled.', 'animfolio') + '</span>');
			cancelMsg.style.display = '';
			body.insertBefore(cancelMsg, inputLine);
			body.insertBefore(document.createElement('br'), inputLine);
			moveInputToBottom();
			scrollToBottom();
			if (inputField) inputField.placeholder = '';
			return;
		}

		if (contactStep === 0) {
			// Name
			if (!value.trim()) {
				var err = createOutputBlock('<span style="color:#FF5F56;">' + __('Name is required. Try again:', 'animfolio') + '</span>');
				err.style.display = '';
				body.insertBefore(err, inputLine);
				moveInputToBottom();
				scrollToBottom();
				return;
			}
			contactData.name = value.trim();
			var echoName = createOutputBlock(
				'<span style="color:#a0a0a0;">' + __('Name:', 'animfolio') + '</span> <span style="color:#fff;">' + escapeHTML(value.trim()) + '</span><br><br>' +
				'<span style="color:#00FF41;">' + __('Email', 'animfolio') + '</span> <span style="color:#a0a0a0;">' + __('(required):', 'animfolio') + '</span>'
			);
			echoName.style.display = '';
			body.insertBefore(echoName, inputLine);
			contactStep = 1;
			if (inputField) inputField.placeholder = __('your@email.com', 'animfolio');
		} else if (contactStep === 1) {
			// Email
			var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(value.trim())) {
				var errEmail = createOutputBlock('<span style="color:#FF5F56;">' + __('Invalid email. Try again:', 'animfolio') + '</span>');
				errEmail.style.display = '';
				body.insertBefore(errEmail, inputLine);
				moveInputToBottom();
				scrollToBottom();
				return;
			}
			contactData.email = value.trim();
			var echoEmail = createOutputBlock(
				'<span style="color:#a0a0a0;">' + __('Email:', 'animfolio') + '</span> <span style="color:#fff;">' + escapeHTML(value.trim()) + '</span><br><br>' +
				'<span style="color:#00FF41;">' + __('Message', 'animfolio') + '</span> <span style="color:#a0a0a0;">' + __('(required, press Enter to send):', 'animfolio') + '</span>'
			);
			echoEmail.style.display = '';
			body.insertBefore(echoEmail, inputLine);
			contactStep = 2;
			if (inputField) inputField.placeholder = __('Your message...', 'animfolio');
		} else if (contactStep === 2) {
			// Message
			if (!value.trim()) {
				var errMsg = createOutputBlock('<span style="color:#FF5F56;">' + __('Message cannot be empty. Try again:', 'animfolio') + '</span>');
				errMsg.style.display = '';
				body.insertBefore(errMsg, inputLine);
				moveInputToBottom();
				scrollToBottom();
				return;
			}
			contactData.message = value.trim();

			var sending = createOutputBlock(
				'<span style="color:#a0a0a0;">' + __('Message:', 'animfolio') + '</span> <span style="color:#fff;">' + escapeHTML(value.trim()) + '</span><br><br>' +
				'<span style="color:#FFD700;">' + __('Sending message...', 'animfolio') + '</span>'
			);
			sending.style.display = '';
			body.insertBefore(sending, inputLine);
			moveInputToBottom();
			scrollToBottom();

			// Static export: send via FormSubmit.co (no backend). Set window.ANIMFOLIO_CONTACT_EMAIL.
			var afEmail = (window.ANIMFOLIO_CONTACT_EMAIL || '').trim();
			var afData = new FormData();
			afData.append('name', contactData.name);
			afData.append('email', contactData.email);
			afData.append('message', contactData.message);
			afData.append('_subject', 'CLI Terminal Contact');
			afData.append('_captcha', 'false');
			afData.append('_template', 'table');

			(afEmail && afEmail.indexOf('@') > -1
				? fetch('https://formsubmit.co/ajax/' + encodeURIComponent(afEmail), { method: 'POST', headers: { Accept: 'application/json' }, body: afData })
				: Promise.reject(new Error('no email configured')))
			.then(function (res) { if (!res.ok) { throw new Error('HTTP ' + res.status); } return res.json(); })
			.then(function (result) {
				var resultMsg;
				if (result.success) {
					resultMsg = createOutputBlock(
						'<span style="color:#00FF41;">✓ ' + __('Message sent successfully!', 'animfolio') + '</span><br>' +
						'<span style="color:#a0a0a0;">' + __('Thank you', 'animfolio') + ', ' + escapeHTML(contactData.name) + '. ' + __('I\'ll get back to you soon.', 'animfolio') + '</span>'
					);
				} else {
					resultMsg = createOutputBlock(
						'<span style="color:#FF5F56;">✗ ' + __('Failed to send:', 'animfolio') + ' ' + escapeHTML(result.message || __('Unknown error', 'animfolio')) + '</span>'
					);
				}
				resultMsg.style.display = '';
				body.insertBefore(resultMsg, inputLine);
				body.insertBefore(document.createElement('br'), inputLine);
				moveInputToBottom();
				scrollToBottom();
			})
			.catch(function () {
				var errNet = createOutputBlock('<span style="color:#FF5F56;">✗ Network error. Please try again.</span>');
				errNet.style.display = '';
				body.insertBefore(errNet, inputLine);
				body.insertBefore(document.createElement('br'), inputLine);
				moveInputToBottom();
				scrollToBottom();
			});

			contactFormActive = false;
			contactStep = 0;
			if (inputField) inputField.placeholder = '';
		}

		moveInputToBottom();
		scrollToBottom();
	}

})();
