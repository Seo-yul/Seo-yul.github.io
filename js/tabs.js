/* Index tabs: open up to the target panel before jumping, and mark the tab of the panel in view */
(function (Site) {
  var OWNER = { 'project-apim': 'projects' };   /* the second project panel belongs to the Projects tab */
  var links = Array.prototype.slice.call(document.querySelectorAll('.tabs a[href^="#"]'));
  var byId = {};
  links.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
  var current = null;

  function tabFor(id) {
    var key = OWNER[id] || id;
    return byId[key] ? key : null;
  }

  function setCurrent(id) {
    var key = tabFor(id);
    if (key === current) return;
    current = key;
    links.forEach(function (a) {
      if (a === byId[key]) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  }

  function goTo(id) {
    var el = document.getElementById(id);
    if (!el) return;
    if (Site.fold) Site.fold.openThrough(id);
    setCurrent(id);
    el.scrollIntoView({ block: 'start' });
    if (history.replaceState) history.replaceState(null, '', '#' + id);
  }

  Site.tabs = {
    init: function () {
      /* Leave scrolling and the URL to the browser; just open the panels first */
      links.forEach(function (a) {
        a.addEventListener('click', function () {
          var id = a.getAttribute('href').slice(1);
          if (Site.fold) Site.fold.openThrough(id);
          setCurrent(id);
        });
      });
      if (!('IntersectionObserver' in window)) return;
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) setCurrent(e.target.id); });
      }, { rootMargin: '-40% 0px -55% 0px' });
      Array.prototype.forEach.call(document.querySelectorAll('.letter > .fold'), function (f) { io.observe(f); });
    },
    goTo: goTo,
    current: function () { return current; }
  };
})(window.Site);
