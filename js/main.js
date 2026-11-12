/* Start the modules in order. Missing modules are skipped, and one failing module does not stop the rest */
(function (Site) {
  function call(mod, fn) {
    try {
      if (Site[mod] && typeof Site[mod][fn] === 'function') return Site[mod][fn]();
    } catch (e) {
      if (window.console) console.error(e);
    }
  }

  call('i18n', 'init');
  call('theme', 'init');
  call('nav', 'init');
  call('objects', 'init');
  call('town', 'init');
})(window.Site);
