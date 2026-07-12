/* Minimal wp.* shim so plugin scripts that call wp.i18n / wp.hooks run standalone (English pass-through, no translation machinery). */
window.wp = window.wp || {};
wp.i18n = wp.i18n || { __: function (s) { return s; }, _x: function (s) { return s; }, _n: function (s, p, n) { return n === 1 ? s : p; }, sprintf: function (f) { var a = arguments, i = 1; return String(f).replace(/%[sd]/g, function () { return a[i++]; }); }, setLocaleData: function () {} };
wp.hooks = wp.hooks || { addFilter: function () {}, removeFilter: function () {}, applyFilters: function (n, v) { return v; }, addAction: function () {}, doAction: function () {} };
