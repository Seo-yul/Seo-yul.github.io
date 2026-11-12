/* The road and the walker.
   The road is a curve through the start sign and every stop's door. The walker stands on the road
   at the point level with 60% of the viewport height, so scrolling (or a nav jump) walks it along. */
(function (Site) {
  var STEP = 6;            /* road sampling interval, px */
  var VIEW_AT = 0.6;       /* the walker follows this fraction of the viewport height */
  var LAMP_GAP = 300;
  var world = document.querySelector('.world');
  var route = world && world.querySelector('.route');
  var walker = world && world.querySelector('.walker');
  var lamps = world && world.querySelector('.lamps');
  var tpl = document.getElementById('lamp-tpl');
  var start = world && world.querySelector('.start');
  var stops = Array.prototype.slice.call(document.querySelectorAll('.stop'));
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var table = [], total = 0, doors = [];
  var cur = null, raf = null, walkTimer = null, facingLeft = false;

  /* Centre of an element in .world coordinates */
  function spot(el, wr) {
    var r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2 - wr.left, y: r.top + r.height / 2 - wr.top };
  }

  /* Vertical S-curves between points; y only ever grows, so every height maps to one road point */
  function curve(pts) {
    var d = 'M' + pts[0].x.toFixed(1) + ' ' + pts[0].y.toFixed(1);
    for (var i = 1; i < pts.length; i++) {
      var a = pts[i - 1], b = pts[i], k = (b.y - a.y) / 2;
      d += 'C' + a.x.toFixed(1) + ' ' + (a.y + k).toFixed(1) + ' ' + b.x.toFixed(1) + ' ' + (b.y - k).toFixed(1) +
        ' ' + b.x.toFixed(1) + ' ' + b.y.toFixed(1);
    }
    return d;
  }

  function sample(path) {
    total = path.getTotalLength();
    table = [];
    for (var l = 0; l < total; l += STEP) {
      var p = path.getPointAtLength(l);
      table.push([l, p.x, p.y]);
    }
    var e = path.getPointAtLength(total);
    table.push([total, e.x, e.y]);
  }

  /* Road length at a given height (binary search over the samples) */
  function lenAtY(y) {
    if (!table.length) return 0;
    if (y <= table[0][2]) return 0;
    var last = table[table.length - 1];
    if (y >= last[2]) return last[0];
    var lo = 0, hi = table.length - 1;
    while (hi - lo > 1) {
      var mid = (lo + hi) >> 1;
      if (table[mid][2] < y) lo = mid; else hi = mid;
    }
    var a = table[lo], b = table[hi], t = b[2] === a[2] ? 0 : (y - a[2]) / (b[2] - a[2]);
    return a[0] + (b[0] - a[0]) * t;
  }

  function pointAt(len) {
    len = Math.max(0, Math.min(total, len));
    var i = Math.min(table.length - 2, Math.floor(len / STEP));
    var a = table[i], b = table[i + 1], t = b[0] === a[0] ? 0 : (len - a[0]) / (b[0] - a[0]);
    return { x: a[1] + (b[1] - a[1]) * t, y: a[2] + (b[2] - a[2]) * t };
  }

  function placeLamps() {
    lamps.textContent = '';
    if (!tpl || window.innerWidth < 1024) return;
    var side = 1;
    for (var l = 220; l < total - 120; l += LAMP_GAP) {
      /* keep clear of the doors, where the road touches the drawings */
      if (doors.some(function (d) { return Math.abs(d.len - l) < 110; })) continue;
      var p = pointAt(l), q = pointAt(l + 4);
      var dx = q.x - p.x, dy = q.y - p.y, m = Math.sqrt(dx * dx + dy * dy) || 1;
      var el = tpl.content.firstElementChild.cloneNode(true);
      el.style.left = (p.x - (dy / m) * 36 * side).toFixed(1) + 'px';
      el.style.top = (p.y + (dx / m) * 36 * side).toFixed(1) + 'px';
      lamps.appendChild(el);
      side = -side;
    }
  }

  function build() {
    var wr = world.getBoundingClientRect();
    var pts = [spot(start, wr)];
    doors = [];
    stops.forEach(function (s) {
      var door = s.querySelector('.stop__door');
      if (!door) return;
      var p = spot(door, wr);
      pts.push(p);
      doors.push({ stop: s, y: p.y });
    });
    var d = curve(pts);
    Array.prototype.forEach.call(route.querySelectorAll('path'), function (p) { p.setAttribute('d', d); });
    sample(route.querySelector('path'));
    doors.forEach(function (dr) { dr.len = lenAtY(dr.y); });
    placeLamps();
    cur = null;
    update();
  }

  function walking(on) {
    if (on) {
      walker.classList.add('is-walking');
      clearTimeout(walkTimer);
      walkTimer = setTimeout(function () { walker.classList.remove('is-walking'); }, 140);
    }
  }

  function place(len, moving) {
    var p = pointAt(len);
    walker.style.transform = 'translate3d(' + p.x.toFixed(1) + 'px,' + p.y.toFixed(1) + 'px,0)';
    if (moving) {
      var ahead = pointAt(len + (moving > 0 ? 10 : -10));
      if (Math.abs(ahead.x - p.x) > 2) facingLeft = ahead.x < p.x;
      walker.classList.toggle('is-left', facingLeft);
      walking(true);
    }
    doors.forEach(function (d) { d.stop.classList.toggle('is-here', Math.abs(d.len - len) < 40); });
  }

  function update() {
    raf = null;
    if (!table.length) return;
    var wr = world.getBoundingClientRect();
    var target = lenAtY(window.innerHeight * VIEW_AT - wr.top);
    if (cur === null || reduced) {
      cur = target;
      place(cur, 0);
      return;
    }
    var diff = target - cur;
    if (Math.abs(diff) < 0.5) { cur = target; place(cur, 0); return; }
    cur += diff * 0.14;
    place(cur, diff);
    raf = requestAnimationFrame(update);
  }

  function schedule() { if (!raf) raf = requestAnimationFrame(update); }

  /* Each stop's drawing pops in the first time it comes into view */
  function reveal() {
    if (!('IntersectionObserver' in window) || reduced) {
      stops.forEach(function (s) { s.classList.add('is-visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.15 });
    stops.forEach(function (s) { io.observe(s); });
  }

  Site.town = {
    ready: false,
    init: function () {
      if (!world || !route || !walker || !start) return;
      reveal();
      build();
      walker.classList.add('is-ready');
      window.addEventListener('scroll', schedule, { passive: true });
      /* Rebuild the road when the layout changes (resize, fonts, language) */
      var t = null;
      var rebuild = function () { clearTimeout(t); t = setTimeout(build, 120); };
      if ('ResizeObserver' in window) new ResizeObserver(rebuild).observe(world);
      else window.addEventListener('resize', rebuild);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(rebuild);
      if (Site.i18n) Site.i18n.onChange(rebuild);
      Site.town.ready = true;
    },
    rebuild: build
  };
})(window.Site);
