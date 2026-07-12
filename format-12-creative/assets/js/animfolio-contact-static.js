/**
 * AnimFolio static contact form — posts to FormSubmit.co (no backend needed).
 *
 * SETUP (one time):
 *   1. In your page, set:  window.ANIMFOLIO_CONTACT_EMAIL = "you@example.com";
 *   2. Open the page, send one test message. FormSubmit emails you a confirmation link.
 *   3. Click that link once. After that, every message lands in your inbox. Free, no signup.
 *
 * Mirrors the plugin's exact DOM behavior (validation, error/success classes) so the
 * bundled contact CSS styles it identically.
 */
(function () {
  'use strict';
  var EMAIL = (window.ANIMFOLIO_CONTACT_EMAIL || '').trim();

  document.querySelectorAll('.animfolio-form').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var errs = validate(form);
      if (errs.length) { showErrors(form, errs); return; }
      var hp = form.querySelector('[name="animfolio_hp"]');
      if (hp && hp.value) { return; } // honeypot: silently drop bots
      if (!EMAIL || EMAIL.indexOf('@') < 0) {
        showFormError(form, 'This demo has no contact email set yet. Set window.ANIMFOLIO_CONTACT_EMAIL in the page — see the README.');
        return;
      }
      var btn = form.querySelector('.animfolio-form__submit');
      if (btn) { btn.classList.add('animfolio-form__submit--loading'); btn.disabled = true; }

      var fd = new FormData();
      fd.append('name', val(form, 'name'));
      fd.append('email', val(form, 'email'));
      fd.append('message', val(form, 'message'));
      fd.append('_subject', 'New portfolio message from ' + (val(form, 'name') || 'your site'));
      fd.append('_captcha', 'false');
      fd.append('_template', 'table');

      fetch('https://formsubmit.co/ajax/' + encodeURIComponent(EMAIL), { method: 'POST', headers: { Accept: 'application/json' }, body: fd })
        .then(function (r) { return r.json().catch(function () { return null; }).then(function (b) { return { ok: r.ok, body: b }; }); })
        .then(function (res) {
          if (btn) { btn.classList.remove('animfolio-form__submit--loading'); btn.disabled = false; }
          var b = res.body || {};
          if (res.ok && (b.success === true || b.success === 'true')) {
            var s = form.querySelector('.animfolio-form__success');
            if (s) { s.classList.add('animfolio-form__success--visible'); setTimeout(function () { s.classList.remove('animfolio-form__success--visible'); }, 6000); }
            form.reset();
          } else {
            showFormError(form, (b && b.message) || 'Something went wrong. Please try again.');
          }
        })
        .catch(function () {
          if (btn) { btn.classList.remove('animfolio-form__submit--loading'); btn.disabled = false; }
          showFormError(form, 'Network error. You can email ' + EMAIL + ' directly.');
        });
    });
  });

  function val(form, name) { var el = form.querySelector('[name="' + name + '"]'); return el ? el.value.trim() : ''; }

  function validate(form) {
    var errors = [];
    if (!val(form, 'name')) errors.push({ field: 'name', message: 'Name is required.' });
    var em = val(form, 'email');
    if (!em) errors.push({ field: 'email', message: 'Email is required.' });
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) errors.push({ field: 'email', message: 'Please enter a valid email.' });
    if (!val(form, 'message')) errors.push({ field: 'message', message: 'Message is required.' });
    return errors;
  }
  function showErrors(form, errors) {
    form.querySelectorAll('.animfolio-form__group--error').forEach(function (g) { g.classList.remove('animfolio-form__group--error'); });
    errors.forEach(function (err) {
      var f = form.querySelector('[name="' + err.field + '"]'); if (!f) return;
      var p = f.closest('.animfolio-form__group'); if (!p) return;
      p.classList.add('animfolio-form__group--error');
      var el = p.querySelector('.animfolio-form__error'); if (el) el.textContent = err.message;
    });
  }
  function showFormError(form, message) {
    var c = form.querySelector('.animfolio-form__global-error');
    if (!c) { c = document.createElement('div'); c.className = 'animfolio-form__global-error'; c.style.cssText = 'padding:12px;margin-bottom:16px;border-radius:6px;background:rgba(239,68,68,0.1);color:var(--animfolio-error);border:1px solid rgba(239,68,68,0.2);'; form.prepend(c); }
    c.textContent = message;
  }
})();
