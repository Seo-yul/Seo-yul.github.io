/* Day and night. The head script picks the first theme; this switches it and remembers the choice */
(function (Site) {
  var root = document.documentElement;

  function get() { return root.getAttribute('data-theme') === 'night' ? 'night' : 'day'; }

  /* Illustrations that come as a day and a night image swap their source */
  function swapArt(theme) {
    Array.prototype.forEach.call(document.querySelectorAll('[data-night]'), function (el) {
      var src = el.getAttribute(theme === 'night' ? 'data-night' : 'data-day');
      var attr = el.tagName.toLowerCase() === 'img' ? 'src' : 'href';
      if (src && el.getAttribute(attr) !== src) el.setAttribute(attr, src);
    });
  }

  function set(theme) {
    theme = theme === 'night' ? 'night' : 'day';
    root.setAttribute('data-theme', theme);
    swapArt(theme);
    try { localStorage.setItem('theme', theme); } catch (e) { /* still switch even if it cannot be saved */ }
  }

  Site.theme = {
    init: function () {
      var btn = document.getElementById('theme-toggle');
      if (btn) btn.addEventListener('click', function () { set(get() === 'day' ? 'night' : 'day'); });
      if (get() === 'night') swapArt('night');
    },
    set: set,
    get: get
  };
})(window.Site);
