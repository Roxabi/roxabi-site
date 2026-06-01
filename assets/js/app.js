/* Roxabi — app.js: theme toggle, scroll-reveal, TOC scroll-spy, GitHub stars.
   Language is handled by separate localized URLs (/ = EN, /fr/ = FR), not JS.
   Progressive enhancement: with JS off, every page renders fully in its own language. */
(function () {
  'use strict';
  var root = document.documentElement;
  var LS_THEME = 'roxabi-theme';
  var GH = { owner: 'Roxabi', repo: 'roxabi-site' };

  /* ── Theme ──────────────────────────────────────────── */
  function applyTheme(t) {
    root.setAttribute('data-theme', t);
    var btn = document.querySelector('[data-theme-toggle]');
    if (btn) {
      btn.setAttribute('aria-label', t === 'light' ? 'Switch to dark theme' : 'Switch to light theme');
      var sun = btn.querySelector('.i-sun'), moon = btn.querySelector('.i-moon');
      // Show the CURRENT state: light → sun, dark → moon.
      if (sun && moon) { sun.style.display = t === 'light' ? 'block' : 'none'; moon.style.display = t === 'light' ? 'none' : 'block'; }
    }
    // Start the hero shader the first time we land on (or switch to) dark.
    if (t !== 'light' && window.FluidAmber) {
      var hero = document.getElementById('hero-bg');
      if (hero) window.FluidAmber.init(hero);
    }
  }
  function initTheme() {
    var saved = null;
    try { saved = localStorage.getItem(LS_THEME); } catch (e) {}
    applyTheme(saved || 'dark'); // marketing default = dark
    var btn = document.querySelector('[data-theme-toggle]');
    if (btn) btn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      applyTheme(next);
      try { localStorage.setItem(LS_THEME, next); } catch (e) {}
    });
  }

  /* ── Scroll reveal ──────────────────────────────────── */
  function initReveal() {
    var els = document.querySelectorAll('[data-reveal]');
    if (!('IntersectionObserver' in window) || !els.length) { els.forEach(function (el) { el.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -10% 0px' });
    els.forEach(function (el, i) { el.style.transitionDelay = (i % 4) * 60 + 'ms'; io.observe(el); });
  }

  /* ── TOC scroll-spy (highlight the visible section) ── */
  function initSpy() {
    var links = [].slice.call(document.querySelectorAll('.toc a[href^="#"]'));
    if (!links.length || !('IntersectionObserver' in window)) return;
    var targets = [];
    links.forEach(function (a) { var el = document.getElementById(a.getAttribute('href').slice(1)); if (el) targets.push(el); });
    function setActive(id) { links.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + id); }); }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) setActive(e.target.id); });
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });
    targets.forEach(function (t) { io.observe(t); });
  }

  /* ── GitHub stars (best-effort, cached 1h) ──────────── */
  function initStars() {
    var slots = document.querySelectorAll('[data-stars]');
    if (!slots.length) return;
    function paint(n) { slots.forEach(function (s) { s.textContent = n; }); }
    var cached = null;
    try { cached = JSON.parse(localStorage.getItem('roxabi-stars') || 'null'); } catch (e) {}
    if (cached && (Date.now() - cached.t) < 3600e3) { paint(cached.n); return; }
    fetch('https://api.github.com/repos/' + GH.owner + '/' + GH.repo)
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (d && typeof d.stargazers_count === 'number') {
          var n = d.stargazers_count >= 1000 ? (d.stargazers_count / 1000).toFixed(1) + 'k' : String(d.stargazers_count);
          paint(n);
          try { localStorage.setItem('roxabi-stars', JSON.stringify({ n: n, t: Date.now() })); } catch (e) {}
        }
      }).catch(function () {});
  }

  function start() { initTheme(); initReveal(); initSpy(); initStars(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
