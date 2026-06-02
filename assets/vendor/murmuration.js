/*!
 * murmuration — Canvas2D boids/flocking simulation (background effect).
 * Source: radiant by Paul Bakaus — https://github.com/pbakaus/radiant (MIT, © 2025).
 * Adapted for Roxabi: amber recolor, fewer/calmer boids, targets #hero-bg, subtle
 * background, reduced-motion frozen frame, graceful degrade.
 */
(function () {
  'use strict';

  var started = false;

  function init(canvas) {
    if (!canvas || started) return;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;
    started = true;

    var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ── Roxabi amber palette ──
    // Boid colors: amber / bright-gold / highlight
    // Background: near-black transparent trail fade (no opaque sky fill)
    var COL_DIM    = 'rgba(191, 138, 31, 0.55)';   // deep gold, dim boids
    var COL_BRIGHT = 'rgba(240, 180, 41, 0.80)';   // amber #f0b429, bright boids
    var TRAIL_FILL = 'rgba(10, 10, 10, 0.10)';     // near-black trail fade, subtle

    // ── Tuned for subtle background: modest flock, gentle motion ──
    var BASE_COUNT        = 420;   // original 2500 → calmer background
    var MAX_SPEED         = 160;   // original 240 → slower
    var MIN_SPEED         = 55;    // original 80  → slower
    var SEPARATION_RADIUS = 14;
    var NEIGHBOR_RADIUS   = 50;
    var SEPARATION_WEIGHT = 350;
    var ALIGNMENT_WEIGHT  = 5.0;
    var COHESION_WEIGHT   = 0.3;
    var WIND_SCALE        = 0.0003;
    var WIND_STRENGTH     = 80;    // original 120 → calmer
    var CELL_SIZE         = 55;
    var GRID_CAPACITY     = 40;
    var TRAIL_ALPHA       = 0.10;  // slightly stronger fade for clarity at low count
    var IMPULSE_INTERVAL_MIN = 7000;
    var IMPULSE_INTERVAL_MAX = 12000;
    var IMPULSE_SPEED     = 200;   // original 300 → calmer
    var IMPULSE_STRENGTH  = 90;    // original 140 → calmer
    var IMPULSE_FALLOFF   = 0.5;

    // ── State ──
    var W, H, dpr;
    var running = true;
    var time = 0;
    var lastTime = 0;
    var frameCount = 0;

    // Particle arrays (SoA)
    var px, py, pvx, pvy, psize, pbright;
    var pcount = 0;

    // Spatial grid
    var gridData, gridCount;
    var gridCols, gridRows, gridTotal;

    // Pre-rendered glow sprite (offscreen canvas)
    var glowCanvas, glowCtx;
    var glowSize = 60;

    // Wandering attractor
    var attractX, attractY;

    // Impulse waves
    var impulses = [];
    var nextImpulseTime = 0;

    // ── Value noise (wind field) ──
    var noiseSeed = Math.random() * 65536;
    function hashN(x, y) {
      var n = Math.sin(x * 127.1 + y * 311.7 + noiseSeed) * 43758.5453;
      return n - Math.floor(n);
    }
    function smoothNoise(x, y) {
      var ix = Math.floor(x), iy = Math.floor(y);
      var fx = x - ix, fy = y - iy;
      fx = fx * fx * (3 - 2 * fx);
      fy = fy * fy * (3 - 2 * fy);
      var a = hashN(ix, iy), b = hashN(ix + 1, iy);
      var c = hashN(ix, iy + 1), d = hashN(ix + 1, iy + 1);
      return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
    }
    function fbmNoise(x, y) {
      return smoothNoise(x, y) * 0.65 +
             smoothNoise(x * 2.1, y * 2.1) * 0.25 +
             smoothNoise(x * 4.3, y * 4.3) * 0.10;
    }

    // ── Glow sprite (offscreen canvas) ──
    function createGlowSprite() {
      glowCanvas = document.createElement('canvas');
      glowCanvas.width  = glowSize * 2;
      glowCanvas.height = glowSize * 2;
      glowCtx = glowCanvas.getContext('2d');
      var g = glowCtx.createRadialGradient(glowSize, glowSize, 0, glowSize, glowSize, glowSize);
      g.addColorStop(0,   'rgba(240, 180, 41, 1)');    // amber core
      g.addColorStop(0.3, 'rgba(240, 180, 41, 0.4)');
      g.addColorStop(1,   'rgba(240, 180, 41, 0)');
      glowCtx.fillStyle = g;
      glowCtx.fillRect(0, 0, glowSize * 2, glowSize * 2);
    }

    // ── Impulse system ──
    function scheduleImpulse() {
      nextImpulseTime = time + IMPULSE_INTERVAL_MIN +
        Math.random() * (IMPULSE_INTERVAL_MAX - IMPULSE_INTERVAL_MIN);
    }
    function spawnImpulse() {
      var edge = Math.random() * 4 | 0;
      var ox, oy, dx, dy;
      if      (edge === 0) { ox = -50;     oy = Math.random() * H; dx = 1;  dy = (Math.random() - 0.5) * 0.5; }
      else if (edge === 1) { ox = W + 50;  oy = Math.random() * H; dx = -1; dy = (Math.random() - 0.5) * 0.5; }
      else if (edge === 2) { ox = Math.random() * W; oy = -50;     dx = (Math.random() - 0.5) * 0.5; dy = 1;  }
      else                 { ox = Math.random() * W; oy = H + 50;  dx = (Math.random() - 0.5) * 0.5; dy = -1; }
      var len = Math.sqrt(dx * dx + dy * dy);
      dx /= len; dy /= len;
      impulses.push({ ox: ox, oy: oy, dx: dx, dy: dy, born: time, front: 0 });
      scheduleImpulse();
    }

    // ── Resize / DPR ──
    function allocateGrid() {
      gridCols  = Math.ceil(W / CELL_SIZE) + 2;
      gridRows  = Math.ceil(H / CELL_SIZE) + 2;
      gridTotal = gridCols * gridRows;
      gridCount = new Int32Array(gridTotal);
      gridData  = new Int32Array(gridTotal * GRID_CAPACITY);
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width  = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      allocateGrid();
    }

    // ── Particle init ──
    function initParticles() {
      pcount = BASE_COUNT;

      px      = new Float32Array(pcount);
      py      = new Float32Array(pcount);
      pvx     = new Float32Array(pcount);
      pvy     = new Float32Array(pcount);
      psize   = new Float32Array(pcount);
      pbright = new Float32Array(pcount);

      var nc = 2 + (Math.random() * 2 | 0);
      var cxArr = [], cyArr = [];
      var baseCX = W * 0.35 + Math.random() * W * 0.3;
      var baseCY = H * 0.35 + Math.random() * H * 0.3;
      for (var c = 0; c < nc; c++) {
        cxArr.push(baseCX + (Math.random() - 0.5) * 200);
        cyArr.push(baseCY + (Math.random() - 0.5) * 150);
      }

      for (var i = 0; i < pcount; i++) {
        var ci  = i % nc;
        var ang = Math.random() * 6.2832;
        var spread = 20 + Math.random() * 100;
        px[i] = cxArr[ci] + Math.cos(ang) * spread;
        py[i] = cyArr[ci] + Math.sin(ang) * spread;
        var dir = Math.random() * 6.2832;
        var spd = MIN_SPEED + Math.random() * (MAX_SPEED - MIN_SPEED) * 0.35;
        pvx[i] = Math.cos(dir) * spd;
        pvy[i] = Math.sin(dir) * spd;
        psize[i]   = 1.0 + Math.random() * 0.7;
        pbright[i] = 0.45 + Math.random() * 0.55;
      }
    }

    // ── Spatial grid build ──
    function buildGrid() {
      for (var i = 0; i < gridTotal; i++) gridCount[i] = 0;
      for (var i = 0; i < pcount; i++) {
        var col = ((px[i] / CELL_SIZE) | 0) + 1;
        var row = ((py[i] / CELL_SIZE) | 0) + 1;
        if (col < 0) col = 0; if (col >= gridCols) col = gridCols - 1;
        if (row < 0) row = 0; if (row >= gridRows) row = gridRows - 1;
        var cell = row * gridCols + col;
        var cnt  = gridCount[cell];
        if (cnt < GRID_CAPACITY) {
          gridData[cell * GRID_CAPACITY + cnt] = i;
          gridCount[cell] = cnt + 1;
        }
      }
    }

    // ── Update ──
    function updateParticles(dt) {
      var cohW   = COHESION_WEIGHT;
      var nR2    = NEIGHBOR_RADIUS * NEIGHBOR_RADIUS;
      var sR2    = SEPARATION_RADIUS * SEPARATION_RADIUS;
      var windT  = time * 0.00007;
      buildGrid();

      var flockCX = 0, flockCY = 0;
      for (var i = 0; i < pcount; i++) { flockCX += px[i]; flockCY += py[i]; }
      flockCX /= pcount; flockCY /= pcount;

      var at = time * 0.00015;
      attractX = W * 0.1 + smoothNoise(at, 3.7) * W * 0.8;
      attractY = H * 0.1 + smoothNoise(7.1, at) * H * 0.8;

      var diag = Math.sqrt(W * W + H * H) * 1.3;
      for (var imp = impulses.length - 1; imp >= 0; imp--) {
        impulses[imp].front += IMPULSE_SPEED * dt;
        if (impulses[imp].front > diag) impulses.splice(imp, 1);
      }

      var maxDim = Math.max(W, H);

      for (var i = 0; i < pcount; i++) {
        var x = px[i], y = py[i];
        var vx = pvx[i], vy = pvy[i];
        var col = ((x / CELL_SIZE) | 0) + 1;
        var row = ((y / CELL_SIZE) | 0) + 1;
        if (col < 1) col = 1; if (col >= gridCols - 1) col = gridCols - 2;
        if (row < 1) row = 1; if (row >= gridRows - 1) row = gridRows - 2;

        var sepX = 0, sepY = 0, sepN = 0;
        var aliX = 0, aliY = 0, aliN = 0;
        var cohX = 0, cohY = 0, cohN = 0;

        for (var dc = -1; dc <= 1; dc++) {
          for (var dr = -1; dr <= 1; dr++) {
            var cell = (row + dr) * gridCols + (col + dc);
            var cnt  = gridCount[cell];
            var base = cell * GRID_CAPACITY;
            for (var k = 0; k < cnt; k++) {
              var j = gridData[base + k];
              if (j === i) continue;
              var ddx = px[j] - x, ddy = py[j] - y;
              var d2  = ddx * ddx + ddy * ddy;
              if (d2 < sR2 && d2 > 0.1) {
                var invD2 = 1.0 / d2;
                sepX -= ddx * invD2; sepY -= ddy * invD2; sepN++;
              }
              if (d2 < nR2) {
                aliX += pvx[j]; aliY += pvy[j]; aliN++;
                cohX += px[j];  cohY += py[j];  cohN++;
              }
            }
          }
        }

        var ax = 0, ay = 0;

        if (sepN > 0) { ax += sepX * SEPARATION_WEIGHT; ay += sepY * SEPARATION_WEIGHT; }
        if (aliN > 0) {
          var invAli = 1.0 / aliN;
          ax += (aliX * invAli - vx) * ALIGNMENT_WEIGHT;
          ay += (aliY * invAli - vy) * ALIGNMENT_WEIGHT;
        }
        if (cohN > 0) {
          var invCoh = 1.0 / cohN;
          ax += (cohX * invCoh - x) * cohW * 0.5;
          ay += (cohY * invCoh - y) * cohW * 0.5;
        }

        // Global cohesion (anti-fragmentation)
        var toFCX = flockCX - x, toFCY = flockCY - y;
        var fcDist = Math.sqrt(toFCX * toFCX + toFCY * toFCY);
        if (fcDist > 120) {
          var normDist = (fcDist - 120) / maxDim;
          var fcStr = normDist * 40 * cohW;
          ax += toFCX / fcDist * fcStr; ay += toFCY / fcDist * fcStr;
        }

        // Wandering attractor
        var toAX = attractX - x, toAY = attractY - y;
        var aDist = Math.sqrt(toAX * toAX + toAY * toAY);
        if (aDist > 10) {
          var aStr = 20 + Math.min(aDist * 0.05, 30);
          ax += toAX / aDist * aStr; ay += toAY / aDist * aStr;
        }

        // Wind (spatially varying, global sweep)
        var globalAngle = smoothNoise(windT * 15, 0) * 6.2832;
        var localVar    = fbmNoise(x * WIND_SCALE, y * WIND_SCALE + windT * 3) * 1.5 - 0.75;
        var windAngle   = globalAngle + localVar;
        ax += Math.cos(windAngle) * WIND_STRENGTH;
        ay += Math.sin(windAngle) * WIND_STRENGTH;

        // Impulse waves
        for (var imp = 0; imp < impulses.length; imp++) {
          var w    = impulses[imp];
          var rx   = x - w.ox, ry = y - w.oy;
          var proj = rx * w.dx + ry * w.dy;
          var dist = Math.abs(proj - w.front);
          var ww   = 150;
          if (dist < ww && proj > -20) {
            var inf   = 1 - dist / ww; inf *= inf;
            var age   = (time - w.born) * 0.001;
            var decay = Math.exp(-age * IMPULSE_FALLOFF);
            ax += w.dx * IMPULSE_STRENGTH * inf * decay;
            ay += w.dy * IMPULSE_STRENGTH * inf * decay;
          }
        }

        // Boundary steering
        var margin = 100;
        if (x < margin)     ax += (margin - x) * 1.5;
        else if (x > W - margin) ax -= (x - W + margin) * 1.5;
        if (y < margin)     ay += (margin - y) * 1.5;
        else if (y > H - margin) ay -= (y - H + margin) * 1.5;

        // Integrate
        vx += ax * dt; vy += ay * dt;
        var spd = Math.sqrt(vx * vx + vy * vy);
        if (spd > MAX_SPEED) {
          var inv = MAX_SPEED / spd; vx *= inv; vy *= inv;
        } else if (spd < MIN_SPEED && spd > 0.1) {
          var inv = MIN_SPEED / spd; vx *= inv; vy *= inv;
        }
        x += vx * dt; y += vy * dt;

        if (x < -80)      x += W + 160;
        else if (x > W + 80) x -= W + 160;
        if (y < -80)      y += H + 160;
        else if (y > H + 80) y -= H + 160;

        px[i] = x; py[i] = y; pvx[i] = vx; pvy[i] = vy;
      }
    }

    // ── Render ──
    function render() {
      // Trail fade: near-black semi-transparent fill (no opaque sky)
      ctx.fillStyle = TRAIL_FILL;
      ctx.fillRect(-1, -1, W + 2, H + 2);

      // Density glow pass (every 3rd frame)
      if (frameCount % 3 === 0) {
        for (var cell = 0; cell < gridTotal; cell++) {
          var cnt = gridCount[cell];
          if (cnt > 10) {
            var gcx = 0, gcy = 0;
            var base = cell * GRID_CAPACITY;
            for (var k = 0; k < cnt; k++) {
              var idx = gridData[base + k];
              gcx += px[idx]; gcy += py[idx];
            }
            gcx /= cnt; gcy /= cnt;
            var density = Math.min(cnt / 25, 1);
            var sz = (20 + density * 40) / glowSize;
            ctx.globalAlpha = density * 0.025;
            ctx.drawImage(glowCanvas,
              gcx - glowSize * sz, gcy - glowSize * sz,
              glowSize * 2 * sz,   glowSize * 2 * sz);
          }
        }
        ctx.globalAlpha = 1;
      }

      // Draw all boids as velocity-direction lines (two brightness layers)
      var invMax   = 1.0 / MAX_SPEED;
      var spd100   = 100;

      ctx.lineCap = 'round';

      // Dim layer
      ctx.strokeStyle = COL_DIM;
      ctx.lineWidth   = 1.0;
      ctx.beginPath();
      for (var i = 0; i < pcount; i++) {
        if (pbright[i] >= 0.72) continue;
        var vx = pvx[i], vy = pvy[i];
        var spd2 = vx * vx + vy * vy;
        if (spd2 < spd100) continue;
        var spd = Math.sqrt(spd2);
        var tailLen = spd * invMax * 4.0;
        var inv = 1 / spd;
        ctx.moveTo(px[i] - vx * inv * tailLen, py[i] - vy * inv * tailLen);
        ctx.lineTo(px[i] + vx * inv * tailLen * 0.3, py[i] + vy * inv * tailLen * 0.3);
      }
      ctx.stroke();

      // Bright layer
      ctx.strokeStyle = COL_BRIGHT;
      ctx.lineWidth   = 1.3;
      ctx.beginPath();
      for (var i = 0; i < pcount; i++) {
        if (pbright[i] < 0.72) continue;
        var vx = pvx[i], vy = pvy[i];
        var spd2 = vx * vx + vy * vy;
        if (spd2 < spd100) continue;
        var spd = Math.sqrt(spd2);
        var tailLen = spd * invMax * 4.0;
        var inv = 1 / spd;
        ctx.moveTo(px[i] - vx * inv * tailLen, py[i] - vy * inv * tailLen);
        ctx.lineTo(px[i] + vx * inv * tailLen * 0.3, py[i] + vy * inv * tailLen * 0.3);
      }
      ctx.stroke();
    }

    // ── Reduced-motion: single frozen frame, then stop ──
    function renderStaticFrame() {
      ctx.clearRect(0, 0, W, H);
      // Draw boids at their initial positions with no trails
      ctx.lineCap    = 'round';
      ctx.strokeStyle = COL_DIM;
      ctx.lineWidth   = 1.0;
      ctx.globalAlpha = 0.35;
      ctx.beginPath();
      for (var i = 0; i < pcount; i++) {
        if (pbright[i] >= 0.72) continue;
        var vx = pvx[i], vy = pvy[i];
        var spd = Math.sqrt(vx * vx + vy * vy);
        if (spd < 1) continue;
        var tailLen = 3.5;
        var inv = 1 / spd;
        ctx.moveTo(px[i] - vx * inv * tailLen, py[i] - vy * inv * tailLen);
        ctx.lineTo(px[i], py[i]);
      }
      ctx.stroke();
      ctx.strokeStyle = COL_BRIGHT;
      ctx.lineWidth   = 1.2;
      ctx.beginPath();
      for (var i = 0; i < pcount; i++) {
        if (pbright[i] < 0.72) continue;
        var vx = pvx[i], vy = pvy[i];
        var spd = Math.sqrt(vx * vx + vy * vy);
        if (spd < 1) continue;
        var tailLen = 3.5;
        var inv = 1 / spd;
        ctx.moveTo(px[i] - vx * inv * tailLen, py[i] - vy * inv * tailLen);
        ctx.lineTo(px[i], py[i]);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // ── Main loop ──
    function loop(ts) {
      if (!running) { requestAnimationFrame(loop); return; }

      if (lastTime === 0) lastTime = ts;
      var rawDt = (ts - lastTime) * 0.001;
      lastTime  = ts;
      var dt    = rawDt < 0.05 ? rawDt : 0.05;
      if (dt <= 0) dt = 0.016;
      time += dt * 1000;
      frameCount++;

      if (time > nextImpulseTime) spawnImpulse();

      updateParticles(dt);
      render();
      requestAnimationFrame(loop);
    }

    // ── Bootstrap ──
    createGlowSprite();
    resize();
    attractX = W * 0.5;
    attractY = H * 0.5;
    initParticles();
    scheduleImpulse();

    if (prefersReduced) {
      renderStaticFrame();
      return; // no rAF — frozen single frame
    }

    // Resize handler: re-measure, rebuild grid, scale particle positions
    window.addEventListener('resize', function () {
      var oldW = W, oldH = H;
      resize();
      if (oldW > 0 && oldH > 0) {
        var sx = W / oldW, sy = H / oldH;
        for (var i = 0; i < pcount; i++) { px[i] *= sx; py[i] *= sy; }
      }
    });

    // Visibility: pause when tab hidden, resume when visible
    document.addEventListener('visibilitychange', function () {
      running = !document.hidden;
      if (running) lastTime = 0;
    });

    lastTime = 0;
    requestAnimationFrame(loop);
  }

  window.RadiantMurmuration = { init: init };

  // Auto-init #hero-bg unless light theme (matches aurora-curtain.js convention)
  document.addEventListener('DOMContentLoaded', function () {
    var c = document.getElementById('hero-bg');
    if (c && document.documentElement.getAttribute('data-theme') !== 'light') init(c);
  });
})();
