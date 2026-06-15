/*!
 * kinetic-grid — spring-physics deforming grid mesh (Canvas2D background).
 * Source: radiant by Paul Bakaus — https://github.com/pbakaus/radiant (MIT, © 2025).
 * Adapted for Roxabi: amber recolor, targets #hero-bg, subtle background,
 * reduced-motion frozen frame, graceful WebGL/2D degrade.
 */
(function () {
  'use strict';
  var started = false;

  function init(canvas) {
    if (!canvas || started) return;

    var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var ctx = canvas.getContext('2d');
    if (!ctx) return;
    started = true;

    // ── Tunable parameters (toned down vs original for background use) ──
    var IMPULSE_RATE     = 0.55;   // slightly slower than original 0.7
    var SPRING_TENSION   = 1.0;
    var IMPULSE_STRENGTH = 0.7;    // reduced to keep it calm behind copy

    // ── Grid dimensions ──
    var COLS        = 40;
    var ROWS        = 25;
    var DAMPING     = 0.978;
    var RETURN_FORCE = 0.003;
    var SPRING_K_BASE = 0.12;

    // ── Node storage (flat arrays for performance) ──
    var nodeCount = COLS * ROWS;
    var posX  = new Float32Array(nodeCount);
    var posY  = new Float32Array(nodeCount);
    var velX  = new Float32Array(nodeCount);
    var velY  = new Float32Array(nodeCount);
    var restX = new Float32Array(nodeCount);
    var restY = new Float32Array(nodeCount);

    // ── Spring storage: [indexA, indexB, restLength, …] ──
    var springs = [];

    // ── Impulse flash effects ──
    var flashes = [];

    // ── Timing ──
    var lastTime        = 0;
    var timeSinceImpulse = 0;
    var impulseInterval  = 1.0 / IMPULSE_RATE;

    // ── Layout helpers ──
    var spacingX = 0;
    var spacingY = 0;
    var marginX  = 0;
    var marginY  = 0;

    // ── Screen flash state ──
    var screenFlash = 0;

    // ── Running flag (paused when tab hidden) ──
    var running = true;

    // ── Logical canvas size (CSS pixels) ──
    var W = 0;
    var H = 0;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);

    // ── rAF handle for cleanup ──
    var rafId = 0;

    function idx(col, row) {
      return row * COLS + col;
    }

    function buildGrid() {
      marginX  = W * 0.06;
      marginY  = H * 0.06;
      spacingX = (W - marginX * 2) / (COLS - 1);
      spacingY = (H - marginY * 2) / (ROWS - 1);

      for (var r = 0; r < ROWS; r++) {
        for (var c = 0; c < COLS; c++) {
          var i = idx(c, r);
          var x = marginX + c * spacingX;
          var y = marginY + r * spacingY;
          restX[i] = x;
          restY[i] = y;
          posX[i]  = x;
          posY[i]  = y;
          velX[i]  = 0;
          velY[i]  = 0;
        }
      }

      springs = [];
      for (var r = 0; r < ROWS; r++) {
        for (var c = 0; c < COLS; c++) {
          var i = idx(c, r);
          if (c < COLS - 1) springs.push(i, idx(c + 1, r), spacingX);
          if (r < ROWS - 1) springs.push(i, idx(c, r + 1), spacingY);
        }
      }
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W   = canvas.clientWidth;
      H   = canvas.clientHeight;
      canvas.width  = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildGrid();
    }

    window.addEventListener('resize', resize);
    resize();

    // ── Amber palette color from spring tension ──
    // Maps [0..1] tension → warm amber/gold on near-black, all hues in amber family.
    // Resting: very dark near-black gold
    // Low:     deep gold (bf8a1f range)
    // Mid:     accent amber (f0b429 range)
    // High:    bright gold (fbbf24 range)
    // Extreme: highlight (fde68a range), near-white warm
    function tensionColor(tension) {
      var t = tension < 0 ? 0 : (tension > 1 ? 1 : tension);
      var r, g, b, a;

      if (t < 0.1) {
        // Resting — near-black with faint amber tint
        var f = t / 0.1;
        r = 22 + f * 20;   // ~22..42
        g = 14 + f * 14;   // ~14..28
        b = 2  + f * 2;    //  ~2..4
        a = 0.20 + f * 0.10;
      } else if (t < 0.3) {
        // Low — deep gold (#bf8a1f range: 191,138,31)
        var f = (t - 0.1) / 0.2;
        r = 42  + f * 149; // 42..191
        g = 28  + f * 110; // 28..138
        b = 4   + f * 27;  //  4..31
        a = 0.30 + f * 0.20;
      } else if (t < 0.55) {
        // Medium — accent amber (#f0b429: 240,180,41)
        var f = (t - 0.3) / 0.25;
        r = 191 + f * 49;  // 191..240
        g = 138 + f * 42;  // 138..180
        b = 31  + f * 10;  //  31..41
        a = 0.50 + f * 0.20;
      } else if (t < 0.8) {
        // High — bright gold (#fbbf24: 251,191,36)
        var f = (t - 0.55) / 0.25;
        r = 240 + f * 11;  // 240..251
        g = 180 + f * 11;  // 180..191
        b = 41  + f * (36 - 41); // 41..36 (slight dip, warm)
        a = 0.70 + f * 0.15;
      } else {
        // Extreme — highlight (#fde68a: 253,230,138), near-white gold
        var f = (t - 0.8) / 0.2;
        r = 251 + f * 2;   // 251..253
        g = 191 + f * 39;  // 191..230
        b = 36  + f * 102; //  36..138
        a = 0.85 + f * 0.15;
      }

      return {
        r: Math.round(r < 0 ? 0 : (r > 255 ? 255 : r)),
        g: Math.round(g < 0 ? 0 : (g > 255 ? 255 : g)),
        b: Math.round(b < 0 ? 0 : (b > 255 ? 255 : b)),
        a: a
      };
    }

    // ── Inject impulse from a random edge ──
    function injectSingleImpulse(edge, strength) {
      var regionSize = 4 + Math.floor(Math.random() * 6);
      var startNode, flashX, flashY;

      if (edge === 0) {
        startNode = Math.floor(Math.random() * Math.max(1, COLS - regionSize));
        flashX = marginX + (startNode + regionSize * 0.5) * spacingX;
        flashY = marginY;
        for (var c = startNode; c < startNode + regionSize && c < COLS; c++) {
          var i = idx(c, 0);
          var falloff = 1 - Math.abs(c - startNode - regionSize * 0.5) / (regionSize * 0.5);
          velY[i] += strength * falloff * falloff;
        }
      } else if (edge === 1) {
        startNode = Math.floor(Math.random() * Math.max(1, ROWS - regionSize));
        flashX = marginX + (COLS - 1) * spacingX;
        flashY = marginY + (startNode + regionSize * 0.5) * spacingY;
        for (var r = startNode; r < startNode + regionSize && r < ROWS; r++) {
          var i = idx(COLS - 1, r);
          var falloff = 1 - Math.abs(r - startNode - regionSize * 0.5) / (regionSize * 0.5);
          velX[i] -= strength * falloff * falloff;
        }
      } else if (edge === 2) {
        startNode = Math.floor(Math.random() * Math.max(1, COLS - regionSize));
        flashX = marginX + (startNode + regionSize * 0.5) * spacingX;
        flashY = marginY + (ROWS - 1) * spacingY;
        for (var c = startNode; c < startNode + regionSize && c < COLS; c++) {
          var i = idx(c, ROWS - 1);
          var falloff = 1 - Math.abs(c - startNode - regionSize * 0.5) / (regionSize * 0.5);
          velY[i] -= strength * falloff * falloff;
        }
      } else {
        startNode = Math.floor(Math.random() * Math.max(1, ROWS - regionSize));
        flashX = marginX;
        flashY = marginY + (startNode + regionSize * 0.5) * spacingY;
        for (var r = startNode; r < startNode + regionSize && r < ROWS; r++) {
          var i = idx(0, r);
          var falloff = 1 - Math.abs(r - startNode - regionSize * 0.5) / (regionSize * 0.5);
          velX[i] += strength * falloff * falloff;
        }
      }

      flashes.push({ x: flashX, y: flashY, life: 1.0, ring: 1.0 });
    }

    function injectImpulse() {
      var baseStrength = (16 + Math.random() * 10) * IMPULSE_STRENGTH; // calmer than original 22..36
      var edge = Math.floor(Math.random() * 4);
      injectSingleImpulse(edge, baseStrength);
      screenFlash = 0.025; // subtler than original 0.04
    }

    // ── Physics step ──
    function simulate() {
      var springK     = SPRING_K_BASE * SPRING_TENSION;
      var springCount = springs.length / 3;

      for (var s = 0; s < springCount; s++) {
        var s3 = s * 3;
        var a = springs[s3];
        var b = springs[s3 + 1];
        var restLen = springs[s3 + 2];

        var dx = posX[b] - posX[a];
        var dy = posY[b] - posY[a];
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 0.001) continue;

        var stretch = dist - restLen;
        var force   = springK * stretch / dist;
        var fx = dx * force;
        var fy = dy * force;

        velX[a] += fx;
        velY[a] += fy;
        velX[b] -= fx;
        velY[b] -= fy;
      }

      for (var i = 0; i < nodeCount; i++) {
        velX[i] += (restX[i] - posX[i]) * RETURN_FORCE;
        velY[i] += (restY[i] - posY[i]) * RETURN_FORCE;
        velX[i] *= DAMPING;
        velY[i] *= DAMPING;
        posX[i] += velX[i];
        posY[i] += velY[i];
      }
    }

    // ── Draw one frame (used for both static and animated paths) ──
    function drawFrame(time, dt, isStatic) {
      if (!isStatic) {
        // Impulse scheduling
        timeSinceImpulse += dt;
        impulseInterval = 1.8 / IMPULSE_RATE;
        if (timeSinceImpulse >= impulseInterval) {
          injectImpulse();
          timeSinceImpulse -= impulseInterval;
          timeSinceImpulse -= Math.random() * impulseInterval * 0.3;
        }
        simulate();
      }

      // Trail persistence — slightly more opaque fill for subtlety
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(10, 8, 6, 0.40)';
      ctx.fillRect(0, 0, W, H);

      // Screen flash overlay (amber, brief brightness bump on impulse)
      if (!isStatic && screenFlash > 0.001) {
        ctx.fillStyle = 'rgba(240, 180, 41, ' + screenFlash.toFixed(4) + ')';
        ctx.fillRect(0, 0, W, H);
        screenFlash *= 0.85;
      }

      var avgSpacing  = (spacingX + spacingY) * 0.5;
      var tensionScale = 1.0 / (avgSpacing * 0.35);

      // Slow, gentle breathe — reduced amplitude for background role
      var breathe = 0.88 + 0.12 * Math.sin(time * 0.7);

      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round';

      var springCount = springs.length / 3;

      // ── Layer 1: Soft wide glow pass (neon tube bloom) ──
      for (var s = 0; s < springCount; s++) {
        var s3 = s * 3;
        var a = springs[s3];
        var b = springs[s3 + 1];
        var restLen = springs[s3 + 2];

        var ax = posX[a], ay = posY[a];
        var bx = posX[b], by = posY[b];

        var dx = bx - ax;
        var dy = by - ay;
        var dist = Math.sqrt(dx * dx + dy * dy);
        var stretch = Math.abs(dist - restLen);
        var tension = stretch * tensionScale;

        var col = tensionColor(tension);

        // Reduced base glow alpha (background subtlety)
        var baseGlowAlpha = (0.028 + tension * 0.13) * breathe;
        if (baseGlowAlpha > 0.005) {
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(bx, by);
          ctx.strokeStyle = 'rgba(' + col.r + ',' + col.g + ',' + col.b + ',' + baseGlowAlpha.toFixed(4) + ')';
          ctx.lineWidth = 3.0 + tension * 6;
          ctx.stroke();
        }
      }

      // ── Layer 2: Sharp core connection lines ──
      for (var s = 0; s < springCount; s++) {
        var s3 = s * 3;
        var a = springs[s3];
        var b = springs[s3 + 1];
        var restLen = springs[s3 + 2];

        var ax = posX[a], ay = posY[a];
        var bx = posX[b], by = posY[b];

        var dx = bx - ax;
        var dy = by - ay;
        var dist = Math.sqrt(dx * dx + dy * dy);
        var stretch = Math.abs(dist - restLen);
        var tension = stretch * tensionScale;

        var col = tensionColor(tension);

        // Core alpha: slightly dimmer for background use
        var coreAlpha = (0.08 + tension * 0.50) * breathe;
        if (coreAlpha > 1) coreAlpha = 1;

        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.strokeStyle = 'rgba(' + col.r + ',' + col.g + ',' + col.b + ',' + coreAlpha.toFixed(4) + ')';
        ctx.lineWidth = 0.5 + tension * 1.4;
        ctx.stroke();
      }

      // ── Layer 3: Node points + wavefront bloom ──
      var velocityThreshold = 3.0;
      for (var i = 0; i < nodeCount; i++) {
        var vx = velX[i];
        var vy = velY[i];
        var speed = Math.sqrt(vx * vx + vy * vy);
        var brightness = speed * 0.18; // slightly toned down

        if (brightness < 0.02) continue;
        if (brightness > 1) brightness = 1;

        // Node color: amber family only — dim gold to bright highlight
        var nr, ng, nb;
        if (brightness < 0.25) {
          var nf = brightness / 0.25;
          nr = 80  + nf * 111; // 80..191  (deep gold range)
          ng = 50  + nf * 88;  // 50..138
          nb = 5   + nf * 26;  //  5..31
        } else if (brightness < 0.6) {
          var nf = (brightness - 0.25) / 0.35;
          nr = 191 + nf * 60;  // 191..251 (accent amber → bright)
          ng = 138 + nf * 53;  // 138..191
          nb = 31  + nf * 5;   //  31..36
        } else {
          var nf = (brightness - 0.6) / 0.4;
          nr = 251 + nf * 2;   // 251..253 (highlight range)
          ng = 191 + nf * 39;  // 191..230
          nb = 36  + nf * 102; //  36..138
        }

        var nodeAlpha  = 0.10 + brightness * 0.65;
        var nodeRadius = 0.7  + brightness * 1.8;

        // Wavefront bloom (amber halo, reduced intensity for background)
        if (speed > velocityThreshold) {
          var bloomIntensity = (speed - velocityThreshold) / 15.0;
          if (bloomIntensity > 1) bloomIntensity = 1;

          // Outer halo — deep gold / accent amber
          var haloRadius = 3 + bloomIntensity * 10;
          var haloAlpha  = bloomIntensity * 0.25;
          var haloR = Math.round(191 + bloomIntensity * 49); // 191..240
          var haloG = Math.round(138 + bloomIntensity * 42); // 138..180
          var haloB = Math.round(31  + bloomIntensity * 10); //  31..41

          ctx.beginPath();
          ctx.arc(posX[i], posY[i], haloRadius, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(' + haloR + ',' + haloG + ',' + haloB + ',' + haloAlpha.toFixed(3) + ')';
          ctx.fill();

          // Bright warm center
          var coreBloomRadius = 1.5 + bloomIntensity * 3;
          var coreBloomAlpha  = bloomIntensity * 0.50;
          ctx.beginPath();
          ctx.arc(posX[i], posY[i], coreBloomRadius, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(253, 230, 138, ' + coreBloomAlpha.toFixed(3) + ')';
          ctx.fill();
        }

        // Normal node dot
        ctx.beginPath();
        ctx.arc(posX[i], posY[i], nodeRadius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + Math.round(nr) + ',' + Math.round(ng) + ',' + Math.round(nb) + ',' + nodeAlpha.toFixed(3) + ')';
        ctx.fill();
      }

      // ── Layer 4: Impulse flashes (amber radial glow + ring) ──
      for (var fi = flashes.length - 1; fi >= 0; fi--) {
        var flash = flashes[fi];
        if (!isStatic) {
          flash.life -= dt * 2.0;
          if (flash.ring !== undefined) flash.ring -= dt * 1.8;
        }
        if (flash.life <= 0) {
          flashes.splice(fi, 1);
          continue;
        }

        var fl = flash.life;

        // Radial glow — amber/gold tones only
        var flashRadius = (1 - fl) * 100 + 20;
        var flashAlpha  = fl * fl * 0.65; // subtler than original 0.8

        var grad = ctx.createRadialGradient(flash.x, flash.y, 0, flash.x, flash.y, flashRadius);
        grad.addColorStop(0,   'rgba(253, 230, 138, ' + flashAlpha.toFixed(3) + ')');        // highlight
        grad.addColorStop(0.2, 'rgba(240, 180,  41, ' + (flashAlpha * 0.55).toFixed(3) + ')'); // accent amber
        grad.addColorStop(0.5, 'rgba(191, 138,  31, ' + (flashAlpha * 0.22).toFixed(3) + ')'); // deep gold
        grad.addColorStop(1,   'rgba(80,   50,   5, 0)');

        ctx.beginPath();
        ctx.arc(flash.x, flash.y, flashRadius, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Expanding ring — amber
        if (flash.ring !== undefined && flash.ring > 0) {
          var ringProgress = 1 - flash.ring;
          var ringRadius   = 15 + ringProgress * 120;
          var ringAlpha    = flash.ring * flash.ring * 0.40;
          ctx.beginPath();
          ctx.arc(flash.x, flash.y, ringRadius, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(240, 180, 41, ' + ringAlpha.toFixed(3) + ')';
          ctx.lineWidth   = 1.8 * flash.ring;
          ctx.stroke();
        }
      }

      // Reset composite mode
      ctx.globalCompositeOperation = 'source-over';

      // ── Vignette — near-black amber shadow at edges ──
      var vcx = W * 0.5;
      var vcy = H * 0.5;
      var maxDim = Math.max(W, H);
      var vignette = ctx.createRadialGradient(vcx, vcy, maxDim * 0.25, vcx, vcy, maxDim * 0.72);
      vignette.addColorStop(0, 'rgba(10, 8, 6, 0)');
      vignette.addColorStop(1, 'rgba(10, 8, 6, 0.65)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, W, H);
    }

    // ── Initial clear ──
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, W, H);

    // ── Reduced motion: one static frame, then stop ──
    if (prefersReduced) {
      injectImpulse();
      simulate();
      drawFrame(0, 0, true);
      return;
    }

    // Fire an initial impulse so the grid is alive from frame one
    injectImpulse();

    // ── Animated render loop ──
    function render(now) {
      if (!running) {
        rafId = requestAnimationFrame(render);
        return;
      }

      var time = now * 0.001;
      var dt = lastTime === 0 ? 0.016 : (time - lastTime);
      if (dt > 0.1) dt = 0.016;
      lastTime = time;

      drawFrame(time, dt, false);

      rafId = requestAnimationFrame(render);
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        running = false;
      } else {
        running = true;
        lastTime = 0;
      }
    });

    rafId = requestAnimationFrame(render);
  }

  window.RadiantKineticGrid = { init: init };
  // Don't run in light mode — the grid carries its own near-black backdrop, which
  // would bleed dark over the light hero. app.js calls init() on switch to dark;
  // the `started` guard keeps that idempotent.
  document.addEventListener('DOMContentLoaded', function () {
    var c = document.getElementById('hero-bg');
    if (c && document.documentElement.getAttribute('data-theme') !== 'light') init(c);
  });
})();
