/* Section links: mark the link of the stop in view */
(function (Site) {
  var OWNER = { 'project-apim': 'projects' };   /* the second project stop belongs to the Projects link */
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav a[href^="#"]'));
  var byId = {};
  links.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
  var current;

  function setCurrent(id) {
    var key = OWNER[id] || id;
    if (!byId[key]) key = null;
    if (key === current) return;
    current = key;
    links.forEach(function (a) {
      if (a === byId[key]) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  }

  Site.nav = {
    init: function () {
      links.forEach(function (a) {
        a.addEventListener('click', function () { setCurrent(a.getAttribute('href').slice(1)); });
      });
      if (!('IntersectionObserver' in window)) return;
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) setCurrent(e.target.id); });
      }, { rootMargin: '-45% 0px -50% 0px' });
      Array.prototype.forEach.call(document.querySelectorAll('.hero, .stop'), function (s) { io.observe(s); });
    },
    current: function () { return current; }
  };
})(window.Site);
