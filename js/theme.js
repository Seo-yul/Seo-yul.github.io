/* Theme switching, star canvas and warp. Star drawing is carried over from the old site; the warp is shortened to 0.9s */
(function (Site) {
  var STAR_COUNT = 500, STAR_LAYERS = 3, WARP_MS = 900;
  var root = document.documentElement;
  var canvas = document.getElementById('star-canvas');
  var ctx = canvas && canvas.getContext ? canvas.getContext('2d') : null;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var current = root.getAttribute('data-theme') === 'universe' ? 'universe' : 'light';
  var stars = [], w = 0, h = 0, scrollY = 0;
  var running = false, timer = null, raf = null;
  var warping = false, warpStart = 0;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  function createStars() {
    stars = [];
    for (var i = 0; i < STAR_COUNT; i++) {
      var layer = Math.floor(Math.random() * STAR_LAYERS);
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.5 + 0.3 + layer * 0.3,
        layer: layer,
        speed: 0.02 + layer * 0.015,
        twinkle: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.01 + Math.random() * 0.03,
        baseAlpha: 0.4 + Math.random() * 0.6
      });
    }
  }

  function draw(now) {
    var warpFactor = 0;
    if (warping) {
      var p = (now - warpStart) / WARP_MS;
      if (p >= 1) warping = false;
      else warpFactor = Math.sin(p * Math.PI);
    }
    ctx.clearRect(0, 0, w, h);
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      if (!reduced) s.twinkle += s.twinkleSpeed;
      var alpha = s.baseAlpha * (0.6 + 0.4 * Math.sin(s.twinkle));
      var y = ((s.y + scrollY * s.speed) % h + h) % h;
      ctx.beginPath();
      if (warpFactor > 0.02) {
        var stretch = warpFactor * 15 * (s.layer + 1);
        ctx.moveTo(s.x, y - stretch);
        ctx.lineTo(s.x + s.r * 0.5, y);
        ctx.lineTo(s.x, y + s.r);
        ctx.lineTo(s.x - s.r * 0.5, y);
        ctx.closePath();
        ctx.fillStyle = 'rgba(150, 190, 255, ' + alpha + ')';
      } else {
        ctx.arc(s.x, y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, ' + alpha + ')';
      }
      ctx.fill();
      if (s.r > 1.2) {
        ctx.beginPath();
        ctx.arc(s.x, y, s.r * 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(59, 130, 246, ' + alpha * 0.08 + ')';
        ctx.fill();
      }
    }
  }

  function loop() {
    timer = raf = null;
    if (!running) return;
    draw(performance.now());
    if (reduced) return;          /* reduced motion: draw once */
    if (warping) raf = requestAnimationFrame(loop);
    else timer = setTimeout(loop, 100);
  }

  function halt() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    if (timer) clearTimeout(timer);
    raf = timer = null;
  }

  function start(warp) {
    if (!ctx) return;
    halt();
    resize();
    createStars();
    warping = !!warp && !reduced;
    warpStart = performance.now();
    running = true;
    loop();
  }

  function stop() {
    halt();
    warping = false;
    if (ctx) ctx.clearRect(0, 0, w, h);
  }

  function set(theme, opts) {
    current = theme === 'universe' ? 'universe' : 'light';
    root.setAttribute('data-theme', current);
    try { localStorage.setItem('theme', current); } catch (e) { /* still switch even if it cannot be saved */ }
    if (current === 'universe') start(!(opts && opts.warp === false));
    else stop();
  }

  Site.theme = {
    init: function () {
      var btn = document.getElementById('theme-toggle');
      if (btn) btn.addEventListener('click', function () { set(current === 'light' ? 'universe' : 'light'); });
      window.addEventListener('scroll', function () { scrollY = window.pageYOffset; }, { passive: true });
      var resizeTimer = null;
      window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
          if (current !== 'universe' || !ctx) return;
          resize();
          createStars();
          if (reduced) draw(performance.now());
        }, 150);
      });
      /* Pause the stars while the tab is hidden */
      document.addEventListener('visibilitychange', function () {
        if (current !== 'universe' || !ctx) return;
        if (document.hidden) halt();
        else if (!running) { running = true; loop(); }
      });
      /* On first load, show the stars without the warp */
      if (current === 'universe') start(false);
    },
    set: set,
    get: function () { return current; },
    isRunning: function () { return running; },
    isWarping: function () { return warping && performance.now() - warpStart < WARP_MS; }
  };
})(window.Site);
