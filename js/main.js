/* Start the modules in order. Missing modules are skipped, and one failing module does not stop the rest */
(function (Site) {
  function call(mod, fn) {
    try {
      if (Site[mod] && typeof Site[mod][fn] === 'function') return Site[mod][fn]();
    } catch (e) {
      if (window.console) console.error(e);
    }
  }

  function foldFromHash() {
    var id = '';
    try { id = decodeURIComponent(location.hash.slice(1)); } catch (e) { return null; }
    var el = id ? document.getElementById(id) : null;
    return el && el.classList.contains('fold') ? el : null;
  }

  call('i18n', 'init');
  call('theme', 'init');
  call('fold', 'init');
  call('tabs', 'init');
  call('objects', 'init');
  call('intro', 'init');

  /* Deep link (#section): open up to that panel and jump there */
  try {
    var target = foldFromHash();
    if (target) {
      if (Site.fold) Site.fold.openThrough(target.id);
      target.scrollIntoView({ block: 'start', behavior: 'instant' });
    }
  } catch (e) {
    if (window.console) console.error(e);
  }
  window.addEventListener('hashchange', function () {
    var f = foldFromHash();
    if (f && Site.fold) Site.fold.openThrough(f.id);
  });

  /* During the intro: open the panels on the first screen under the opaque overlay (so LCP is not delayed),
     and start unfolding on scroll after the intro ends */
  if (Site.intro && Site.intro.isPlaying()) {
    call('fold', 'openInView');
    Site.intro.onEnd(function () { call('fold', 'start'); });
  } else {
    call('fold', 'start');
  }
})(window.Site);
