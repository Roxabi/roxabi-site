/*!
 * woven-radiance — African textile-inspired geometric weave (WebGL background).
 * Source: radiant by Paul Bakaus — https://github.com/pbakaus/radiant (MIT, © 2025).
 * Adapted for Roxabi: amber recolor, targets #hero-bg, subtle background,
 * reduced-motion frozen frame, graceful degrade.
 */
(function () {
  'use strict';
  var started = false;
  function init(canvas) {
    if (!canvas || started) return;
    var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var gl = canvas.getContext('webgl', { alpha: true, antialias: false, preserveDrawingBuffer: false });
    if (!gl) return;
    started = true;

    var vertSrc = [
      'attribute vec2 a_pos;',
      'void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }'
    ].join('\n');

    var fragSrc = [
      'precision highp float;',
      'uniform float u_time;',
      'uniform vec2  u_res;',
      'uniform vec2  u_mouse;',
      '',
      '// ── Hash / noise utilities ──',
      'float hash(float n) { return fract(sin(n * 127.1 + 311.7) * 43758.5453); }',
      'float hash2(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }',
      '',
      'float noise2(vec2 p) {',
      '  vec2 i = floor(p); vec2 f = fract(p);',
      '  f = f * f * (3.0 - 2.0 * f);',
      '  return mix(mix(hash2(i), hash2(i + vec2(1.0,0.0)), f.x),',
      '             mix(hash2(i + vec2(0.0,1.0)), hash2(i + vec2(1.0,1.0)), f.x), f.y);',
      '}',
      '',
      '#define S smoothstep',
      '',
      '// ── Amber palette ──',
      '// amber vec3(0.94,0.71,0.16)  bright vec3(0.98,0.75,0.14)',
      '// highlight vec3(0.99,0.90,0.54)  deep gold vec3(0.75,0.45,0.05)  bg vec3(0.04)',
      '',
      '// Returns an amber colour for a given thread index + is_vertical flag.',
      '// All hues are warm amber/gold; only luminance varies.',
      'vec3 threadColor(float idx, bool vert, float t) {',
      '  float seed = vert ? idx * 7.3 + 13.7 : idx * 11.1 + 29.3;',
      '  // Two adjacent amber tones for this thread',
      '  float r0 = hash(seed);',
      '  float r1 = hash(seed + 100.0);',
      '  // Slowly oscillate between them',
      '  float phase = t * 0.03 + idx * 0.3 + (vert ? 5.0 : 0.0);',
      '  float blend = 0.5 + 0.5 * sin(phase);',
      '  // Amber range: map [0,1] random to luminance scale within family',
      '  float lum0 = 0.40 + r0 * 0.55;   // 0.40 – 0.95',
      '  float lum1 = 0.40 + r1 * 0.55;',
      '  float lum  = mix(lum0, lum1, blend);',
      '  // Amber tint: keep hue ratio constant (warm gold)',
      '  return vec3(0.97, 0.72, 0.18) * lum;',
      '}',
      '',
      '// ── Weave pattern: continuous over/under value in [0,1] ──',
      '// 5 pattern modes blended smoothly over time.',
      '// Returns >0.5 when vertical thread is "on top".',
      'float weavePattern(float hIdx, float vIdx, float t) {',
      '  float blockH = floor(hIdx / 8.0);',
      '  float blockV = floor(vIdx / 8.0);',
      '  float localH = mod(hIdx, 8.0);',
      '  float localV = mod(vIdx, 8.0);',
      '',
      '  float patSeed = blockH * 37.0 + blockV * 71.0;',
      '  float base  = floor(hash(patSeed)         * 5.0);',
      '  float next  = mod(base + 1.0, 5.0);',
      '',
      '  float evolve = t * 0.0125 + blockH * 2.3 + blockV * 3.7;',
      '  float rawB   = 0.5 + 0.5 * sin(evolve);',
      '  float bfac   = rawB * rawB * rawB * (rawB * (rawB * 6.0 - 15.0) + 10.0); // smootherstep',
      '',
      '  // Evaluate pattern[base] and pattern[next], then blend',
      '  float v0, v1;',
      '',
      '  // Plain (0)',
      '  float plain = sin((localH + localV) * 3.14159);',
      '  // Twill (1)',
      '  float twill = sin((localH + localV) * 1.5708);',
      '  // Satin (2)',
      '  float satin = sin((localH * 2.0 + localV) * 1.5708);',
      '  // Basket (3)',
      '  float basket = sin(floor(localH / 2.0) * 3.14159 + floor(localV / 2.0) * 3.14159);',
      '  // Herringbone (4)',
      '  float diag = sin((localH + localV) * 1.5708);',
      '  float flip = (sin(localH * 0.7854) > 0.0) ? 1.0 : -1.0;',
      '  float herring = diag * flip;',
      '',
      '  float pats[5];',
      '  // GLSL 1.00 does not support array initialisation; assign individually',
      '  pats[0] = plain;',
      '  pats[1] = twill;',
      '  pats[2] = satin;',
      '  pats[3] = basket;',
      '  pats[4] = herring;',
      '',
      '  v0 = pats[int(base)];',
      '  v1 = pats[int(next)];',
      '',
      '  float blended = mix(v0, v1, bfac);',
      '  // Map [-1,1] -> [0,1] with soft edge',
      '  return S(-0.3, 0.3, blended);',
      '}',
      '',
      'void main() {',
      '  // Normalised UV, origin = centre, height-normalised',
      '  vec2 uv = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;',
      '',
      '  // Thread grid parameters',
      '  float CELL  = 0.038;  // thread width + gap (world units)',
      '  float TGAP  = 0.003;  // gap between threads',
      '  float TWID  = CELL - TGAP;',
      '',
      '  // Slow pan offset for drift',
      '  float panX = sin(u_time * 0.02 * 0.5) * CELL * 0.5;',
      '  float panY = cos(u_time * 0.015 * 0.5) * CELL * 0.3;',
      '',
      '  // Grid indices (continuous)',
      '  float gridX = (uv.x + panX + 0.5) / CELL;',
      '  float gridY = (uv.y + panY + 0.5) / CELL;',
      '',
      '  float colIdx = floor(gridX);',
      '  float rowIdx = floor(gridY);',
      '  float lcx = fract(gridX);   // local x within cell [0,1]',
      '  float lcy = fract(gridY);   // local y within cell [0,1]',
      '',
      '  // Normalised thread extent within cell',
      '  float tFrac = TWID / CELL;  // fraction of cell occupied by thread',
      '',
      '  // Is this pixel inside the horizontal or vertical thread area?',
      '  bool inH = lcy < tFrac;',
      '  bool inV = lcx < tFrac;',
      '',
      '  if (!inH && !inV) {',
      '    // Gap pixel — near-black',
      '    gl_FragColor = vec4(vec3(0.04), 1.0);',
      '    return;',
      '  }',
      '',
      '  // Slow breath on thread width',
      '  float breathH = 1.0 + sin(u_time * 0.2 + rowIdx * 0.5) * 0.03;',
      '  float breathV = 1.0 + sin(u_time * 0.2 + colIdx * 0.5 + 3.0) * 0.03;',
      '',
      '  // Over/under continuous value (>0.5 = vertical on top)',
      '  float vOnTop = weavePattern(rowIdx, colIdx, u_time);',
      '',
      '  // Thread colours',
      '  vec3 hCol = threadColor(rowIdx, false, u_time);',
      '  vec3 vCol = threadColor(colIdx, true,  u_time);',
      '',
      '  vec3 col = vec3(0.04);',
      '',
      '  if (inH && inV) {',
      '    // Crossing: blend by over/under',
      '    float lightMod = mix(0.75, 1.12, vOnTop);',
      '    col = mix(hCol * mix(0.75, 1.12, 1.0 - vOnTop),',
      '              vCol * lightMod, vOnTop);',
      '    // Soft highlight at crossing centre',
      '    float cx = abs(lcx - tFrac * 0.5) / (tFrac * 0.5);',
      '    float cy = abs(lcy - tFrac * 0.5) / (tFrac * 0.5);',
      '    float hl = (1.0 - S(0.3, 0.9, max(cx, cy))) * 0.08 * vOnTop;',
      '    col += vec3(0.99, 0.90, 0.54) * hl;',
      '  } else if (inH) {',
      '    float lightMod = mix(0.75, 1.12, 1.0 - vOnTop);',
      '    col = hCol * lightMod * breathH;',
      '    // Subtle grain line',
      '    float gy = fract(lcy * 4.0);',
      '    col += vec3(1.0, 0.95, 0.85) * 0.015 * S(0.45, 0.55, gy);',
      '    // Leading edge highlight',
      '    float edgeH = S(tFrac, 0.0, lcy) * 0.07 * (1.0 - vOnTop);',
      '    col += vec3(0.99, 0.90, 0.54) * edgeH;',
      '  } else {',
      '    // inV',
      '    float lightMod = mix(0.75, 1.12, vOnTop);',
      '    col = vCol * lightMod * breathV;',
      '    // Subtle grain line',
      '    float gx = fract(lcx * 4.0);',
      '    col += vec3(1.0, 0.95, 0.85) * 0.015 * S(0.45, 0.55, gx);',
      '    // Leading edge highlight',
      '    float edgeV = S(tFrac, 0.0, lcx) * 0.07 * vOnTop;',
      '    col += vec3(0.99, 0.90, 0.54) * edgeV;',
      '  }',
      '',
      '  // ── Warm glow overlay (slow moving, very subtle) ──',
      '  vec2 glowUV = uv;',
      '  vec2 glowCentre = vec2(',
      '    sin(u_time * 0.04) * 0.08,',
      '    cos(u_time * 0.03) * 0.06',
      '  );',
      '  float glowDist = length(glowUV - glowCentre);',
      '  float pulse = 0.025 + sin(u_time * 0.075) * 0.008;',
      '  float glow  = pulse * S(0.6, 0.0, glowDist);',
      '  col += vec3(1.0, 0.78, 0.25) * glow;',
      '',
      '  // ── Gentle vignette ──',
      '  float vig = 1.0 - dot(uv, uv) * 0.55;',
      '  col *= max(vig, 0.0);',
      '',
      '  // ── Overall brightness pull-down (background role) ──',
      '  col *= 0.72;',
      '',
      '  gl_FragColor = vec4(col, 1.0);',
      '}'
    ].join('\n');

    function compile(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(s));
      }
      return s;
    }

    var prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, vertSrc));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fragSrc));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(prog));
    }
    gl.useProgram(prog);

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var aPos = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    var uTime  = gl.getUniformLocation(prog, 'u_time');
    var uRes   = gl.getUniformLocation(prog, 'u_res');
    var uMouse = gl.getUniformLocation(prog, 'u_mouse');

    var mouseXVal = -1.0, mouseYVal = -1.0;
    var mouseTargetX = -1.0, mouseTargetY = -1.0;

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var needsResize = true;
    var running = true;

    function resize() {
      needsResize = false;
      var w = Math.round(canvas.clientWidth * dpr);
      var h = Math.round(canvas.clientHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width  = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
        gl.uniform2f(uRes, canvas.width, canvas.height);
      }
    }

    // Reduced motion: single frozen frame, no rAF loop.
    if (prefersReduced) {
      resize();
      gl.uniform1f(uTime, 0.0);
      gl.uniform2f(uMouse, -1.0, -1.0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      return;
    }

    function render(now) {
      if (!running) { requestAnimationFrame(render); return; }
      if (needsResize) resize();

      // Smooth lerp mouse toward target
      if (mouseTargetX >= 0) {
        if (mouseXVal < 0) { mouseXVal = mouseTargetX; mouseYVal = mouseTargetY; }
        mouseXVal += (mouseTargetX - mouseXVal) * 0.06;
        mouseYVal += (mouseTargetY - mouseYVal) * 0.06;
      } else {
        var cx = canvas.width  * 0.5;
        var cy = canvas.height * 0.5;
        mouseXVal += (cx - mouseXVal) * 0.04;
        mouseYVal += (cy - mouseYVal) * 0.04;
      }

      gl.uniform1f(uTime,  now * 0.001);
      gl.uniform2f(uMouse, mouseXVal, mouseYVal);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      requestAnimationFrame(render);
    }

    window.addEventListener('resize', function () { needsResize = true; });

    // Track mouse on .hero parent so it works even when copy sits above canvas.
    var hero    = canvas.closest('.hero');
    var tracker = hero || canvas;
    tracker.addEventListener('mousemove', function (e) {
      var b = canvas.getBoundingClientRect();
      mouseTargetX = (e.clientX - b.left) * dpr;
      mouseTargetY = (b.height - (e.clientY - b.top)) * dpr;
    });
    tracker.addEventListener('mouseleave', function () {
      mouseTargetX = -1.0; mouseTargetY = -1.0;
    });

    document.addEventListener('visibilitychange', function () {
      running = !document.hidden;
    });

    resize();
    requestAnimationFrame(render);
  }

  window.RadiantWovenRadiance = { init: init };
  // Only init on dark theme; app.js may call init() again on theme switch (idempotent).
  document.addEventListener('DOMContentLoaded', function () {
    var c = document.getElementById('hero-bg');
    if (c && document.documentElement.getAttribute('data-theme') !== 'light') init(c);
  });
})();
