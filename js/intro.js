/* Envelope intro: plays once per session on the first visit. Any click or key skips it */
(function (Site) {
  var LEAVE_AT = 2750, END_AT = 3150, SKIP_END_MS = 400;
  var root = document.documentElement;
  var intro = document.getElementById('intro');
  if (!intro) return;
  var stage = intro.querySelector('.intro__stage');
  var desk = document.querySelector('.desk');
  var controls = document.querySelector('.controls');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var state = 'idle';            /* idle | playing | leaving */
  var timers = [], listeners = [], focusHero = false;

  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }

  function toTop() { window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); }

  /* Keep the page behind out of reach, keyboard included, while playing */
  function setInert(on) {
    [desk, controls].forEach(function (el) { if (el) el.inert = on; });
  }

  /* Fit the stage to the screen; it shrinks on phones */
  function fitStage() {
    var s = Math.min(1.6, (window.innerHeight - 40) / 330, (window.innerWidth - 32) / 320);
    stage.style.setProperty('--intro-scale', Math.max(0.6, s).toFixed(3));
  }

  function play() {
    if (state !== 'idle') return;
    if (reduced) { toTop(); return; }        /* reduced motion: only scroll to the top */
    focusHero = document.activeElement && document.activeElement.id === 'replay';
    state = 'playing';
    fitStage();
    root.classList.remove('intro-pending', 'intro-leaving');
    root.classList.add('intro-playing');
    setInert(true);
    intro.hidden = false;
    intro.classList.remove('is-playing', 'is-done', 'is-leaving');
    void intro.offsetWidth;                 /* restart the animations from the beginning */
    intro.classList.add('is-playing');
    toTop();
    later(leave, LEAVE_AT);
    later(finish, END_AT);
  }

  function leave() {
    if (state !== 'playing') return;
    state = 'leaving';
    intro.classList.add('is-leaving');
    root.classList.add('intro-leaving');
  }

  function skip() {
    if (state !== 'playing') return;
    clearTimers();
    intro.classList.add('is-done');
    leave();
    later(finish, SKIP_END_MS);
  }

  function finish() {
    clearTimers();
    state = 'idle';
    intro.hidden = true;
    intro.classList.remove('is-playing', 'is-done', 'is-leaving');
    root.classList.remove('intro-pending', 'intro-playing', 'intro-leaving');
    setInert(false);
    toTop();
    try { sessionStorage.setItem('introSeen', '1'); } catch (e) { /* if it cannot be saved, the intro plays again next time */ }
    if (focusHero) {
      var h = document.getElementById('hero-name');
      if (h) h.focus({ preventScroll: true });
    }
    listeners.forEach(function (fn) { fn(); });
  }

  Site.intro = {
    init: function () {
      intro.addEventListener('pointerdown', skip);
      var skipBtn = intro.querySelector('.intro__skip');
      if (skipBtn) skipBtn.addEventListener('click', skip);
      document.addEventListener('keydown', function () { if (state === 'playing') skip(); });
      var replay = document.getElementById('replay');
      if (replay) replay.addEventListener('click', play);
      if (root.classList.contains('intro-pending')) play();
    },
    play: play,
    skip: skip,
    isPlaying: function () { return state !== 'idle'; },
    onEnd: function (fn) { listeners.push(fn); }
  };
})(window.Site);
