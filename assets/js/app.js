/* Roxabi — app.js: theme toggle, scroll-reveal, TOC scroll-spy, GitHub stars.
   Language is handled by separate localized URLs (/ = EN, /fr/ = FR), not JS.
   Progressive enhancement: with JS off, every page renders fully in its own language. */
(function () {
  'use strict';
  var root = document.documentElement;
  var LS_THEME = 'roxabi-theme';
  var GH = { owner: 'Roxabi', repo: 'roxabi-factory' };

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
    if (t !== 'light' && window.FluidAmber && !(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) {
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
    // Stagger reveals within each section (reset per section, capped) so a long
    // page doesn't accumulate an ever-growing delay.
    var sec = null, n = 0;
    els.forEach(function (el) {
      var s = el.closest('section') || el.parentNode;
      if (s !== sec) { sec = s; n = 0; }
      el.style.transitionDelay = Math.min(n, 5) * 60 + 'ms';
      n++;
      io.observe(el);
    });
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

  /* ── Docs tag filter (progressive: JS-off shows every card) ── */
  function initDocFilter() {
    var bar = document.querySelector('.doc-filter');
    var cards = [].slice.call(document.querySelectorAll('.doc-card[data-tags]'));
    if (!bar || !cards.length) return;
    bar.hidden = false; // only reveal once JS can drive it
    var btns = [].slice.call(bar.querySelectorAll('.tag-filter'));
    function apply(filter) {
      cards.forEach(function (c) {
        var tags = (c.getAttribute('data-tags') || '').split(/\s+/);
        c.hidden = filter !== 'all' && tags.indexOf(filter) === -1;
      });
      btns.forEach(function (b) { b.classList.toggle('is-active', b.getAttribute('data-filter') === filter); });
    }
    btns.forEach(function (b) { b.addEventListener('click', function () { apply(b.getAttribute('data-filter')); }); });
    // Activate a filter from the URL hash (e.g. /documentation/#cortex from a tag chip).
    var hash = (location.hash || '').replace('#', '');
    if (hash && btns.some(function (b) { return b.getAttribute('data-filter') === hash; })) apply(hash);
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

  /* ── Hero iso hub: depth-sorted dataflow scene ──────────
     Fixed z-stack (back→front): grid · top cubes · top particles · core ·
     bottom particles · bottom cubes · labels. Top streams pass behind the
     core; bottom streams emerge from behind their cube and stop at the core edge. */
  function initIso() {
    var svg = document.getElementById('iso');
    if (!svg) return;
    var SVGNS = 'http://www.w3.org/2000/svg';
    var CX = 270, CY = 196, GCX = 270, GCY = 250, TW = 30, TH = 15;
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    var R = 150, CORE_S = 1.7, DOTS_PER_EDGE = 3, DOT_R = 3, BASE_SPEED = 0.0024, BOT_STOP_DIST = 40;

    var defs =
      '<defs>' +
      '<radialGradient id="fbCore" cx="50%" cy="50%" r="50%">' +
      '<stop offset="0%" stop-color="#fde68a"/><stop offset="35%" stop-color="#fbbf24"/>' +
      '<stop offset="100%" stop-color="#f0b429" stop-opacity="0.25"/></radialGradient>' +
      '<filter id="fbBloom" x="-80%" y="-80%" width="260%" height="260%">' +
      '<feGaussianBlur stdDeviation="2.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
      '<radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">' +
      '<stop offset="0%" stop-color="#f0b429" stop-opacity="0.35"/><stop offset="70%" stop-color="#f0b429" stop-opacity="0"/></radialGradient>' +
      '</defs>';

    function iso(gx, gy) { return [GCX + (gx - gy) * TW, GCY + (gx + gy) * TH]; }
    function byY(a, b) { return a.y - b.y; }

    var grid = '';
    for (var g = -5; g <= 5; g++) {
      var a1 = iso(g, -5), a2 = iso(g, 5), b1 = iso(-5, g), b2 = iso(5, g);
      var cls = (g === 0) ? 'grid-line accent' : 'grid-line';
      grid += '<line class="' + cls + '" x1="' + a1[0] + '" y1="' + a1[1] + '" x2="' + a2[0] + '" y2="' + a2[1] + '"/>';
      grid += '<line class="' + cls + '" x1="' + b1[0] + '" y1="' + b1[1] + '" x2="' + b2[0] + '" y2="' + b2[1] + '"/>';
    }

    var names = ['llmCLI', 'voiceCLI', 'imageCLI', 'cortex', 'intel', 'idna'];
    var mods = names.map(function (n, k) {
      var a = (-90 + k * 60) * Math.PI / 180;
      return { x: CX + R * Math.cos(a), y: CY + R * 0.5 * Math.sin(a), s: 1.0, label: n };
    });
    var core = { x: CX, y: CY, s: CORE_S, core: true };
    var topMods = mods.filter(function (m) { return m.y < CY; });
    var botMods = mods.filter(function (m) { return m.y >= CY; });

    var links = '';
    mods.forEach(function (m) {
      links += '<path class="link" d="M' + CX + ',' + CY + ' L' + m.x.toFixed(1) + ',' + m.y.toFixed(1) + '"/>';
    });

    function cube(o) {
      var t = 'translate(' + o.x.toFixed(1) + ',' + o.y.toFixed(1) + ') scale(' + o.s + ') translate(-32,-32)';
      var id = o.core ? ' id="isoCore"' : '';
      var s = '<g' + id + ' transform="' + t + '">';
      if (o.core) s += '<ellipse cx="32" cy="34" rx="30" ry="20" fill="url(#coreGlow)"/>';
      s += '<polygon points="12,22 32,32 32,52 12,42" fill="#11161d"/>';
      s += '<polygon points="52,22 52,42 32,52 32,32" fill="#171e27"/>';
      s += '<polygon points="32,12 52,22 32,32 12,22" fill="#1c2431"/>';
      if (o.core) {
        s += '<ellipse cx="32" cy="22" rx="9" ry="5" fill="url(#fbCore)" filter="url(#fbBloom)" opacity="0.9"/>';
        s += '<polygon points="32,16 44,22 32,28 20,22" fill="url(#fbCore)" stroke="#fbbf24" stroke-width="0.8" filter="url(#fbBloom)"/>';
      } else {
        s += '<circle cx="32" cy="22" r="2" fill="#f0b429" opacity="0.8"/>';
      }
      return s + '</g>';   // no amber edge outline — cube reads via its three face shades
    }

    var topCubes = topMods.slice().sort(byY).map(cube).join('');
    var botCubes = botMods.slice().sort(byY).map(cube).join('');

    var labels = '';
    mods.forEach(function (m) {
      labels += '<text class="mlabel" x="' + m.x.toFixed(1) + '" y="' + (m.y + 34).toFixed(1) + '" text-anchor="middle">' + m.label + '</text>';
    });
    labels += '<text class="clabel" x="' + CX + '" y="' + (CY + 44) + '" text-anchor="middle">roxabi-factory</text>';

    svg.innerHTML =
      defs +
      '<g aria-hidden="true">' + grid + links + '</g>' +
      '<g aria-hidden="true">' + topCubes + '</g>' +
      '<g id="zTopP" aria-hidden="true"></g>' +
      '<g aria-hidden="true">' + cube(core) + '</g>' +
      '<g id="zBotP" aria-hidden="true"></g>' +
      '<g aria-hidden="true">' + botCubes + '</g>' +
      '<g aria-hidden="true">' + labels + '</g>';

    var topP = svg.querySelector('#zTopP'), botP = svg.querySelector('#zBotP');

    var particles = [];
    mods.forEach(function (mod, idx) {
      var bottom = mod.y >= CY, layer = bottom ? botP : topP;
      var D = Math.sqrt((mod.x - CX) * (mod.x - CX) + (mod.y - CY) * (mod.y - CY));
      var tStop = bottom ? Math.max(0.3, Math.min(0.92, 1 - BOT_STOP_DIST / D)) : 1;
      for (var j = 0; j < DOTS_PER_EDGE; j++) {
        var c = document.createElementNS(SVGNS, 'circle');
        c.setAttribute('r', DOT_R); c.setAttribute('fill', '#f0b429');
        layer.appendChild(c);
        particles.push({ mod: mod, bottom: bottom, tStop: tStop, t: (j / DOTS_PER_EDGE) * tStop,
                         speed: BASE_SPEED + j * 0.0004 + idx * 0.0001, el: c });
      }
    });

    function place(p, t) {
      p.el.setAttribute('cx', (p.mod.x + (CX - p.mod.x) * t).toFixed(1));
      p.el.setAttribute('cy', (p.mod.y + (CY - p.mod.y) * t).toFixed(1));
    }

    var coreEl = svg.querySelector('#isoCore'), baseT = coreEl.getAttribute('transform');

    if (reduce) {
      particles.forEach(function (p, i) {
        var t = p.bottom ? p.tStop * (0.45 + 0.2 * (i % 3)) : (0.4 + 0.2 * (i % 3));
        place(p, t); p.el.setAttribute('opacity', '0.72');
      });
      return;
    }

    var running = true, raf = 0;
    function frame(now) {
      if (!running) return;
      var dy = Math.sin(now / 900) * 4;
      coreEl.setAttribute('transform', baseT + ' translate(0,' + dy.toFixed(2) + ')');
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.t += p.speed; if (p.t >= p.tStop) p.t -= p.tStop;
        place(p, p.t);
        var u = p.t / p.tStop;
        var alpha = p.bottom
          ? 0.9 * Math.min(u * 5, 1) * Math.min((1 - u) * 6, 1)
          : 0.9 * Math.min(u * 6, 1);
        p.el.setAttribute('opacity', alpha.toFixed(2));
      }
      raf = requestAnimationFrame(frame);
    }
    document.addEventListener('visibilitychange', function () {
      running = !document.hidden && !reduce;
      if (running) raf = requestAnimationFrame(frame);
    });
    raf = requestAnimationFrame(frame);
  }

  function start() { initTheme(); initReveal(); initSpy(); initDocFilter(); initStars(); initIso(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
