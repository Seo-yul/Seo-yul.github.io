/* Unfold each panel once when it enters the viewport (above the bottom 12%). Panels never fold back */
(function (Site) {
  var STAGGER_MS = 180, OPEN_MS = 900;
  var folds = Array.prototype.slice.call(document.querySelectorAll('.letter > .fold'));
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var io = null, queue = [], timer = null, started = false;

  function isOpen(f) { return f.classList.contains('is-open'); }

  function forget(f) {
    if (io) io.unobserve(f);
    var i = queue.indexOf(f);
    if (i !== -1) queue.splice(i, 1);
  }

  /* Unfold with animation */
  function open(f) {
    if (!f || isOpen(f)) return;
    forget(f);
    f.classList.add('is-open', 'is-moving');
    setTimeout(function () { f.classList.remove('is-moving'); }, OPEN_MS);
  }

  /* Open instantly, without animation */
  function openInstant(f) {
    if (!f || isOpen(f)) return;
    forget(f);
    f.classList.add('is-instant', 'is-open');
  }

  /* Panels entering together unfold one after another, 180ms apart */
  function pump() {
    if (timer) return;
    var next = queue.shift();
    while (next && isOpen(next)) next = queue.shift();
    if (!next) return;
    open(next);
    timer = setTimeout(function () { timer = null; pump(); }, STAGGER_MS);
  }

  function enqueue(f) {
    if (isOpen(f) || queue.indexOf(f) !== -1) return;
    queue.push(f);
    queue.sort(function (a, b) { return folds.indexOf(a) - folds.indexOf(b); });
    pump();
  }

  function openAll() { folds.forEach(openInstant); }

  /* Open the panels on the current screen instantly. Used under the intro overlay */
  function openInView() {
    var limit = window.innerHeight * 0.88;
    folds.forEach(function (f) { if (f.getBoundingClientRect().top < limit) openInstant(f); });
  }

  function openThrough(id) {
    var last = -1;
    folds.forEach(function (f, i) { if (f.id === id) last = i; });
    for (var i = 0; i <= last; i++) openInstant(folds[i]);
  }

  function start() {
    if (started) return;
    started = true;
    if (reduced || !('IntersectionObserver' in window)) { openAll(); return; }
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) enqueue(e.target); });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0 });
    folds.forEach(function (f) { if (!isOpen(f)) io.observe(f); });
  }

  Site.fold = {
    init: function () {
      openInstant(folds[0]);              /* the first panel starts open */
      if (reduced) openAll();
      /* Open a folded panel as soon as keyboard focus enters it */
      document.addEventListener('focusin', function (e) {
        var f = e.target && e.target.closest ? e.target.closest('.letter > .fold') : null;
        if (f) openInstant(f);
      });
    },
    start: start,
    open: open,
    openAll: openAll,
    openInView: openInView,
    openThrough: openThrough
  };
})(window.Site);
