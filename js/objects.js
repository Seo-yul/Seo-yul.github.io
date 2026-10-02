/* Pick-up: bring the clicked stamp, name tag or seal to the center, flip it to show the details, and put it back on close */
(function (Site) {
  var LIFT_MS = 500, FLIP_MS = 600, MAX_W = 380, MIN_H = 240, EDGE = 16;
  var root = document.documentElement;
  var dlg = document.getElementById('obj-dialog');
  if (!dlg || typeof dlg.showModal !== 'function') return;
  var lift = dlg.querySelector('.obj-lift');
  var flip = dlg.querySelector('.obj-flip');
  var front = dlg.querySelector('.obj-face--front');
  var back = dlg.querySelector('.obj-face--back');
  var closeBtn = dlg.querySelector('.obj-close');
  var out = {
    kicker: back.querySelector('.obj-kicker'),
    title: back.querySelector('.obj-title'),
    meta: back.querySelector('.obj-meta'),
    desc: back.querySelector('.obj-desc'),
    img: back.querySelector('.obj-img')
  };
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var state = 'closed';          /* closed | opening | open | closing */
  var btn = null, pendingClose = false, timers = [];

  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }
  function t(key) { return key ? Site.i18n.t(key) : null; }

  /* Fill the back in the current language */
  function fill() {
    var d = btn.dataset;
    out.kicker.textContent = t(d.kicker) || '';
    out.title.textContent = t(d.title) || '';
    out.meta.textContent = t(d.meta) || '';
    var desc = t(d.desc);
    out.desc.textContent = desc || '';
    out.desc.hidden = !desc;
    if (d.img) {
      out.img.src = d.img;
      out.img.alt = d.imgAlt || '';
      out.img.hidden = false;
    } else {
      out.img.removeAttribute('src');
      out.img.alt = '';
      out.img.hidden = true;
    }
  }

  function place(r) {
    lift.style.left = r.left + 'px';
    lift.style.top = r.top + 'px';
    lift.style.width = r.width + 'px';
    lift.style.height = r.height + 'px';
  }

  /* Centered card: up to 380px wide, as tall as the back content (call while is-measuring) */
  function target() {
    var vw = dlg.clientWidth, vh = dlg.clientHeight;
    var w = Math.min(MAX_W, vw - EDGE * 2);
    lift.style.width = w + 'px';
    lift.style.height = '10px';
    var h = Math.min(Math.max(MIN_H, back.scrollHeight), vh - EDGE * 2);
    return { left: (vw - w) / 2, top: (vh - h) / 2, width: w, height: h };
  }

  function open(b) {
    if (state !== 'closed' || !b) return;
    btn = b;
    state = 'opening';
    pendingClose = false;
    var start = b.getBoundingClientRect();
    fill();
    var clone = document.createElement('div');
    clone.className = b.className.replace(/\bobj\b/, '').trim() + ' obj-clone';
    clone.innerHTML = b.innerHTML;
    front.appendChild(clone);
    dlg.classList.add('is-measuring');
    if (reduced) dlg.classList.add('is-instant');
    root.classList.add('obj-open');
    dlg.showModal();
    closeBtn.focus({ preventScroll: true });   /* focus the close button */
    var end = target();
    var s = Math.min(3, Math.min(end.width / start.width, end.height / start.height) * 0.7);
    b.classList.add('is-lifted');
    if (reduced) {
      place(end);
      clone.style.setProperty('--s', s.toFixed(3));
      flip.classList.add('is-flipped');
      dlg.classList.add('is-shown');
      dlg.classList.remove('is-measuring');
      state = 'open';
      return;
    }
    place(start);
    void lift.offsetWidth;               /* commit the start position so the move animates */
    dlg.classList.remove('is-measuring');
    dlg.classList.add('is-shown');
    place(end);
    clone.style.setProperty('--s', s.toFixed(3));
    later(function () {
      flip.classList.add('is-flipped');
      later(function () {
        state = 'open';
        if (pendingClose) close();
      }, FLIP_MS);
    }, LIFT_MS);
  }

  function close() {
    if (state === 'opening') { pendingClose = true; return; }
    if (state !== 'open') return;
    state = 'closing';
    if (reduced) { finishClose(); return; }
    flip.classList.remove('is-flipped');
    var clone = front.firstElementChild;
    if (clone) clone.style.setProperty('--s', '1');
    later(function () {
      dlg.classList.remove('is-shown');
      place(btn.getBoundingClientRect());
      later(finishClose, LIFT_MS + 20);
    }, FLIP_MS - 40);
  }

  function reset() {
    clearTimers();
    state = 'closed';
    pendingClose = false;
    flip.classList.remove('is-flipped');
    dlg.classList.remove('is-shown', 'is-instant', 'is-measuring');
    front.innerHTML = '';
    root.classList.remove('obj-open');
    if (btn) btn.classList.remove('is-lifted');
    btn = null;
  }

  function finishClose() {
    var b = btn;
    if (dlg.open) dlg.close();
    reset();
    if (b) b.focus({ preventScroll: true });
  }

  /* Re-center the card when the window is resized */
  function recenter() {
    if (state !== 'open') return;
    var vw = dlg.clientWidth, vh = dlg.clientHeight;
    var w = Math.min(MAX_W, vw - EDGE * 2);
    var h = Math.min(parseFloat(lift.style.height), vh - EDGE * 2);
    place({ left: (vw - w) / 2, top: (vh - h) / 2, width: w, height: h });
  }

  /* Update an open card when the language changes, and grow it if the text got longer */
  function refill() {
    if (!btn) return;
    fill();
    if (state === 'open' && back.scrollHeight > back.clientHeight) {
      var vh = dlg.clientHeight;
      var h = Math.min(back.scrollHeight, vh - EDGE * 2);
      lift.style.height = h + 'px';
      lift.style.top = (vh - h) / 2 + 'px';
    }
  }

  Site.objects = {
    init: function () {
      Array.prototype.forEach.call(document.querySelectorAll('.obj'), function (b) {
        b.addEventListener('click', function () { open(b); });
      });
      /* Esc: replace the instant close with the animated one */
      dlg.addEventListener('cancel', function (e) { e.preventDefault(); close(); });
      /* The browser may force-close (e.g. repeated Esc): clean up right away.
         The close event arrives later, so ignore it if already cleaned up or reopened */
      dlg.addEventListener('close', function () {
        if (state === 'closed' || dlg.open) return;
        var b = btn;
        reset();
        if (b) b.focus({ preventScroll: true });
      });
      /* Close on outside click or the × button; outside clicks while opening are ignored */
      dlg.addEventListener('click', function (e) {
        if (state !== 'open') return;
        if (e.target.closest('.obj-close') || !e.target.closest('.obj-face--back')) close();
      });
      window.addEventListener('resize', recenter);
      Site.i18n.onChange(refill);
    },
    open: open,
    close: close,
    isOpen: function () { return state !== 'closed'; }
  };
})(window.Site);
