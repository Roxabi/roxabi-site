/*!
 * thunder-sermon — dramatic lightning against a roiling storm sky (WebGL background).
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
      'uniform vec2 u_res;',
      'uniform float u_strikeInterval;',
      'uniform float u_flashIntensity;',
      'uniform vec2 u_mouse;',
      '',
      '#define PI 3.14159265359',
      '',
      '// ── Hash functions ──',
      'float hash(vec2 p) {',
      '  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);',
      '}',
      '',
      'float hash1(float n) {',
      '  return fract(sin(n) * 43758.5453123);',
      '}',
      '',
      '// ── Smooth value noise ──',
      'float noise(vec2 p) {',
      '  vec2 i = floor(p);',
      '  vec2 f = fract(p);',
      '  f = f * f * (3.0 - 2.0 * f);',
      '  float a = hash(i);',
      '  float b = hash(i + vec2(1.0, 0.0));',
      '  float c = hash(i + vec2(0.0, 1.0));',
      '  float d = hash(i + vec2(1.0, 1.0));',
      '  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);',
      '}',
      '',
      '// ── FBM ──',
      'float fbm(vec2 p, int octaves) {',
      '  float val = 0.0;',
      '  float amp = 0.5;',
      '  float freq = 1.0;',
      '  for (int i = 0; i < 7; i++) {',
      '    if (i >= octaves) break;',
      '    val += amp * noise(p * freq);',
      '    freq *= 2.03;',
      '    amp *= 0.5;',
      '    p += vec2(1.7, 9.2);',
      '  }',
      '  return val;',
      '}',
      '',
      '// ── Domain-warped storm clouds ──',
      'float stormClouds(vec2 p, float t) {',
      '  vec2 drift = vec2(t * 0.03, t * 0.015);',
      '  vec2 pp = p + drift;',
      '  vec2 q = vec2(',
      '    fbm(pp, 5),',
      '    fbm(pp + vec2(5.2, 1.3), 5)',
      '  );',
      '  vec2 r = vec2(',
      '    fbm(pp + 3.0 * q + vec2(1.7, 9.2) + t * 0.05, 6),',
      '    fbm(pp + 3.0 * q + vec2(8.3, 2.8) + t * 0.03, 6)',
      '  );',
      '  float f = fbm(pp + 2.5 * r, 7);',
      '  return f * 0.5 + length(q) * 0.3 + length(r) * 0.2;',
      '}',
      '',
      '// ── Point-to-segment distance ──',
      'float segDist(vec2 p, vec2 a, vec2 b) {',
      '  vec2 pa = p - a;',
      '  vec2 ba = b - a;',
      '  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);',
      '  return length(pa - ba * h);',
      '}',
      '',
      '// ── Lightning bolt: fractal jagged path with branches ──',
      'float lightningBolt(vec2 uv, float seed, float startX, float endX) {',
      '  float minD = 100.0;',
      '',
      '  float prevX = startX;',
      '  float prevY = -0.6;',
      '',
      '  for (int i = 1; i <= 14; i++) {',
      '    float fi = float(i);',
      '    float frac = fi / 14.0;',
      '',
      '    float jit = hash1(seed * 13.37 + fi * 7.91) * 2.0 - 1.0;',
      '    float jit2 = hash1(seed * 29.13 + fi * 3.17) * 2.0 - 1.0;',
      '    float disp = jit * 0.15 * (1.0 - frac * 0.4) + jit2 * 0.05;',
      '',
      '    float targetX = mix(startX, endX, frac);',
      '    float curX = targetX + disp;',
      '    float curY = mix(-0.6, 0.55, frac);',
      '',
      '    float d = segDist(uv, vec2(prevX, prevY), vec2(curX, curY));',
      '    minD = min(minD, d);',
      '',
      '    float roll = hash1(seed * 5.71 + fi * 11.3);',
      '    if (roll > 0.45 && i > 1 && i < 13) {',
      '      float side = (hash1(seed * 3.3 + fi * 9.1) > 0.5) ? 1.0 : -1.0;',
      '      float bLen = 0.08 + hash1(seed * 7.7 + fi * 2.3) * 0.12;',
      '      float bAng = 0.5 + hash1(seed * 2.2 + fi * 5.5) * 0.6;',
      '',
      '      float bpx = curX;',
      '      float bpy = curY;',
      '      for (int j = 1; j <= 5; j++) {',
      '        float fj = float(j);',
      '        float bj = hash1(seed * 17.1 + fi * 3.7 + fj * 11.9) * 2.0 - 1.0;',
      '        float bnx = bpx + side * bLen * 0.2 + bj * 0.025;',
      '        float bny = bpy + bLen * 0.2 * bAng;',
      '        float bd = segDist(uv, vec2(bpx, bpy), vec2(bnx, bny));',
      '        minD = min(minD, bd * 1.5);',
      '        bpx = bnx;',
      '        bpy = bny;',
      '      }',
      '',
      '      if (hash1(seed * 9.9 + fi * 4.1) > 0.55) {',
      '        float sbx = curX + side * bLen * 0.12;',
      '        float sby = curY + bLen * 0.12 * bAng;',
      '        for (int k = 1; k <= 3; k++) {',
      '          float fk = float(k);',
      '          float sbj = hash1(seed * 23.7 + fi * 7.3 + fk * 5.1) * 2.0 - 1.0;',
      '          float sbnx = sbx - side * 0.025 + sbj * 0.015;',
      '          float sbny = sby + 0.035;',
      '          float sbd = segDist(uv, vec2(sbx, sby), vec2(sbnx, sbny));',
      '          minD = min(minD, sbd * 2.2);',
      '          sbx = sbnx;',
      '          sby = sbny;',
      '        }',
      '      }',
      '    }',
      '',
      '    prevX = curX;',
      '    prevY = curY;',
      '  }',
      '',
      '  return minD;',
      '}',
      '',
      '// ── Get bolt parameters for a given index ──',
      'void boltParams(int idx, float interval, out float birth, out float seed, out float sx, out float ex) {',
      '  float fi = float(idx);',
      '  birth = fi * interval + hash1(fi * 17.31 + 42.0) * interval * 0.5;',
      '  seed = fi * 7.13 + 1.0;',
      '  sx = (hash1(fi * 13.37 + 100.0) - 0.5) * 0.8;',
      '  ex = sx + (hash1(fi * 9.91 + 200.0) - 0.5) * 0.35;',
      '}',
      '',
      'void main() {',
      '  vec2 uv = (gl_FragCoord.xy - u_res * 0.5) / min(u_res.x, u_res.y);',
      '  vec2 screenUV = gl_FragCoord.xy / u_res;',
      '  float t = u_time;',
      '',
      '  // Mouse as lightning strike target — track cursor on .hero',
      '  vec2 mouseTarget = vec2(0.0);',
      '  float mouseActive = 0.0;',
      '  if (u_mouse.x > 0.0) {',
      '    vec2 mUV = u_mouse / u_res;',
      '    mouseTarget = (mUV - 0.5) * vec2(u_res.x / u_res.y, 1.0);',
      '    mouseActive = 1.0;',
      '  }',
      '',
      '  // ── Storm sky (warm dark amber/brown, no blue) ──',
      '  vec3 skyTop = vec3(0.04, 0.025, 0.005);',
      '  vec3 skyMid = vec3(0.055, 0.032, 0.008);',
      '  vec3 skyBot = vec3(0.03, 0.018, 0.004);',
      '  vec3 sky = mix(skyTop, skyMid, smoothstep(0.0, 0.5, screenUV.y));',
      '  sky = mix(sky, skyBot, smoothstep(0.5, 1.0, screenUV.y));',
      '',
      '  // ── Storm clouds ──',
      '  float cloud1 = stormClouds(uv * 1.8, t);',
      '  float cloud2 = stormClouds(uv * 2.4 + vec2(3.7, 1.2), t * 1.1);',
      '  float cloudDensity = smoothstep(0.3, 0.75, cloud1) * 0.6 + smoothstep(0.35, 0.8, cloud2) * 0.4;',
      '',
      '  // Denser clouds in upper portion',
      '  float heightBias = smoothstep(0.85, 0.0, screenUV.y);',
      '  cloudDensity *= 0.4 + heightBias * 0.6;',
      '',
      '  // Amber-tinted cloud colors',
      '  vec3 cloudDark = vec3(0.04, 0.025, 0.005);',
      '  vec3 cloudMid = vec3(0.08, 0.05, 0.01);',
      '  vec3 cloudLight = vec3(0.13, 0.08, 0.02);',
      '  vec3 cloudColor = mix(cloudDark, cloudMid, smoothstep(0.1, 0.4, cloudDensity));',
      '  cloudColor = mix(cloudColor, cloudLight, smoothstep(0.4, 0.8, cloudDensity));',
      '',
      '  vec3 col = mix(sky, cloudColor, cloudDensity * 0.85);',
      '',
      '  // ── Lightning system ──',
      '  float interval = u_strikeInterval;',
      '  float totalFlash = 0.0;',
      '  vec3 boltLight = vec3(0.0);',
      '',
      '  float period = interval * 60.0;',
      '  float ct = mod(t, period);',
      '  int cycle = int(floor(ct / interval));',
      '',
      '  for (int i = -2; i <= 5; i++) {',
      '    int bi = cycle + i;',
      '    if (bi < 0) continue;',
      '',
      '    float birth, seed, sx, ex;',
      '    boltParams(bi, interval, birth, seed, sx, ex);',
      '',
      '    if (mouseActive > 0.5) {',
      '      ex = mix(ex, mouseTarget.x, 0.6);',
      '      sx = mix(sx, mouseTarget.x, 0.3);',
      '    }',
      '    float age = ct - birth;',
      '    if (age < -0.01 || age > 1.5) continue;',
      '    if (age < 0.0) age = 0.0;',
      '',
      '    // Flash lifecycle — toned down for subtle background use',
      '    float flash = 0.0;',
      '    if (age < 0.06) {',
      '      flash = 0.6;',
      '    } else if (age < 0.12) {',
      '      flash = 0.25 + 0.35 * smoothstep(0.12, 0.06, age);',
      '    } else if (age < 0.22) {',
      '      float rs = smoothstep(0.12, 0.16, age) * smoothstep(0.22, 0.16, age);',
      '      flash = 0.08 + rs * 0.35;',
      '    } else if (age < 0.7) {',
      '      flash = 0.08 * smoothstep(0.7, 0.22, age);',
      '    }',
      '',
      '    float boltVis = smoothstep(0.45, 0.0, age);',
      '',
      '    if (boltVis > 0.001) {',
      '      float d = lightningBolt(uv, seed, sx, ex);',
      '',
      '      // Outer atmospheric bloom — amber/deep gold',
      '      float outer = exp(-d * d / 0.012) * boltVis * flash;',
      '      boltLight += vec3(0.75, 0.45, 0.05) * outer * 0.5;',
      '',
      '      // Mid glow — warm amber',
      '      float mid = exp(-d * d / 0.003) * boltVis * flash;',
      '      boltLight += vec3(0.94, 0.71, 0.16) * mid * 0.85;',
      '',
      '      // Hot amber core',
      '      float core = exp(-d * d / 0.0004) * boltVis;',
      '      float coreI = flash;',
      '      if (age > 0.06 && age < 0.4) {',
      '        float flk = 0.5 + 0.5 * sin(age * 130.0 + seed * 10.0);',
      '        flk *= 0.5 + 0.5 * sin(age * 73.0 + seed * 7.0);',
      '        coreI *= 0.4 + flk * 0.6;',
      '      }',
      '      boltLight += vec3(0.98, 0.75, 0.14) * core * coreI * 2.2;',
      '',
      '      // Bright highlight center',
      '      float inner = exp(-d * d / 0.00006) * boltVis * flash;',
      '      boltLight += vec3(0.99, 0.90, 0.54) * inner * 3.0;',
      '    }',
      '',
      '    // Cloud illumination — amber tint',
      '    if (flash > 0.01) {',
      '      vec2 bc = vec2(sx, -0.1);',
      '      float dc = length(uv - bc);',
      '',
      '      // Wide area illumination',
      '      float illum = exp(-dc * dc / 0.45) * flash;',
      '      illum *= 0.25 + cloudDensity * 0.75;',
      '      vec3 illumCol = mix(vec3(0.12, 0.07, 0.01), vec3(0.28, 0.16, 0.03), cloudDensity);',
      '      col += illumCol * illum * 1.6;',
      '',
      '      // Close warm illumination',
      '      float close = exp(-dc * dc / 0.08) * flash;',
      '      col += vec3(0.22, 0.13, 0.02) * close * cloudDensity * 1.2;',
      '',
      '      // Ground illumination (bottom of screen)',
      '      float groundDist = length(uv - vec2(ex, 0.55));',
      '      float groundGlow = exp(-groundDist * groundDist / 0.1) * flash;',
      '      col += vec3(0.18, 0.10, 0.01) * groundGlow * 0.6;',
      '',
      '      totalFlash += flash * 0.5;',
      '    }',
      '',
      '    // Subtle chromatic warmth on fresh strikes (no blue channel shift)',
      '    if (age < 0.1) {',
      '      float shake = smoothstep(0.1, 0.0, age) * 0.2;',
      '      float sn = hash1(seed + floor(age * 60.0)) * 2.0 - 1.0;',
      '      col.r += sn * shake * 0.04;',
      '      col.g += sn * shake * 0.02;',
      '    }',
      '  }',
      '',
      '  col += boltLight;',
      '',
      '  // Global screen flash — very soft so it does not strobe text',
      '  totalFlash = min(totalFlash, 1.0);',
      '  col += vec3(0.14, 0.09, 0.01) * totalFlash * u_flashIntensity;',
      '',
      '  // ── Sheet lightning (distant cloud flashes, amber-tinted) ──',
      '  float st = t * 0.8;',
      '  for (int i = 0; i < 3; i++) {',
      '    float fi = float(i);',
      '    float ss = fi * 31.7 + 100.0;',
      '    float sc = hash1(ss + floor(st + fi * 0.37));',
      '    float sa = fract(st + fi * 0.37);',
      '',
      '    if (sc > 0.65) {',
      '      float sf = smoothstep(0.04, 0.0, sa) + smoothstep(0.12, 0.04, sa) * 0.35;',
      '      vec2 sp = vec2(',
      '        (hash1(ss + 1.0) - 0.5) * 1.4,',
      '        (hash1(ss + 2.0) - 0.5) * 0.5 - 0.15',
      '      );',
      '      float sd = length(uv - sp);',
      '      float sg = exp(-sd * sd / 0.2) * sf;',
      '      col += vec3(0.10, 0.06, 0.01) * sg * (0.5 + cloudDensity * 1.5);',
      '    }',
      '  }',
      '',
      '  // ── Rain (warm-tinted, subtle) ──',
      '  vec2 rainUV = gl_FragCoord.xy / min(u_res.x, u_res.y);',
      '  vec2 rc = vec2(rainUV.x + rainUV.y * 0.12, rainUV.y);',
      '  rc.y += t * 3.0;',
      '  rc.x += t * 0.35;',
      '',
      '  float rain = 0.0;',
      '  for (int i = 0; i < 3; i++) {',
      '    float fi = float(i);',
      '    float scale = 35.0 + fi * 20.0;',
      '    vec2 rv = rc * scale + vec2(fi * 7.3, fi * 11.1);',
      '    float ry = fract(rv.y);',
      '    float rx = floor(rv.x);',
      '    float rs = hash1(rx * 13.7 + fi * 31.0);',
      '    if (rs > 0.65) {',
      '      float streak = smoothstep(0.0, 0.008, ry) * smoothstep(0.12 + rs * 0.08, 0.008, ry);',
      '      rain += streak * (0.012 + fi * 0.004);',
      '    }',
      '  }',
      '  col += vec3(0.30, 0.22, 0.08) * rain * (0.2 + totalFlash * 1.8);',
      '',
      '  // ── Vignette (gentle, keeps edges dark) ──',
      '  float vd = length(uv);',
      '  float vig = 1.0 - smoothstep(0.3, 1.4, vd);',
      '  col *= 0.45 + vig * 0.55;',
      '',
      '  // ── Tone mapping ──',
      '  col = col / (1.0 + col);',
      '  col.r = pow(col.r, 1.02);',
      '  col.g = pow(col.g, 1.04);',
      '  col = max(col, vec3(0.0));',
      '',
      '  // Keep overall luminance low so hero text stays readable',
      '  col *= 0.75;',
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

    var uTime = gl.getUniformLocation(prog, 'u_time');
    var uRes = gl.getUniformLocation(prog, 'u_res');
    var uStrikeInterval = gl.getUniformLocation(prog, 'u_strikeInterval');
    var uFlashIntensity = gl.getUniformLocation(prog, 'u_flashIntensity');
    var uMouse = gl.getUniformLocation(prog, 'u_mouse');

    // Hardcoded subtle defaults: slower strikes, lower flash intensity
    var strikeIntervalVal = 3.5;
    var flashIntensityVal = 0.4;

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var needsResize = true;
    var running = true;
    var mouseXVal = -1.0, mouseYVal = -1.0;
    var mouseTargetX = -1.0, mouseTargetY = -1.0;

    function resize() {
      needsResize = false;
      var w = Math.round(canvas.clientWidth * dpr);
      var h = Math.round(canvas.clientHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
        gl.uniform2f(uRes, canvas.width, canvas.height);
      }
    }

    // Reduced motion: draw a single frozen frame and stop
    if (prefersReduced) {
      resize();
      gl.uniform1f(uTime, 0.0);
      gl.uniform1f(uStrikeInterval, strikeIntervalVal);
      gl.uniform1f(uFlashIntensity, flashIntensityVal);
      gl.uniform2f(uMouse, -1.0, -1.0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      return;
    }

    var startTime = performance.now() * 0.001;

    function render(now) {
      if (!running) { requestAnimationFrame(render); return; }
      if (needsResize) resize();
      // Smooth lerp mouse toward target
      if (mouseTargetX >= 0) {
        if (mouseXVal < 0) { mouseXVal = mouseTargetX; mouseYVal = mouseTargetY; }
        mouseXVal += (mouseTargetX - mouseXVal) * 0.06;
        mouseYVal += (mouseTargetY - mouseYVal) * 0.06;
      } else {
        mouseXVal = -1.0;
        mouseYVal = -1.0;
      }
      var elapsed = now * 0.001 - startTime;
      gl.uniform1f(uTime, elapsed);
      gl.uniform1f(uStrikeInterval, strikeIntervalVal);
      gl.uniform1f(uFlashIntensity, flashIntensityVal);
      gl.uniform2f(uMouse, mouseXVal, mouseYVal);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      requestAnimationFrame(render);
    }

    window.addEventListener('resize', function () {
      needsResize = true;
    });

    // Attach events to the .hero parent so they fire even when cursor is over
    // the .wrap content (which has z-index: 2 and sits above the canvas).
    var hero = canvas.closest('.hero');
    var tracker = hero || canvas;
    tracker.addEventListener('mousemove', function(e) {
      var b = canvas.getBoundingClientRect();
      mouseTargetX = (e.clientX - b.left) * dpr;
      mouseTargetY = (b.height - (e.clientY - b.top)) * dpr;
    });
    tracker.addEventListener('mouseleave', function() {
      mouseTargetX = -1.0; mouseTargetY = -1.0;
    });
    tracker.addEventListener('touchstart', function(e) {
      var touch = e.touches[0];
      var b = canvas.getBoundingClientRect();
      mouseTargetX = (touch.clientX - b.left) * dpr;
      mouseTargetY = (b.height - (touch.clientY - b.top)) * dpr;
    }, { passive: true });
    tracker.addEventListener('touchmove', function(e) {
      var touch = e.touches[0];
      var b = canvas.getBoundingClientRect();
      mouseTargetX = (touch.clientX - b.left) * dpr;
      mouseTargetY = (b.height - (touch.clientY - b.top)) * dpr;
    }, { passive: true });
    tracker.addEventListener('touchend', function() {
      mouseTargetX = -1.0; mouseTargetY = -1.0;
    });

    document.addEventListener('visibilitychange', function () {
      running = !document.hidden;
    });

    resize();
    requestAnimationFrame(render);
  }

  window.RadiantThunderSermon = { init: init };
  // Don't spin up WebGL in light mode (shader is hidden there). app.js may call
  // init() when theme switches to dark; the `started` guard makes it idempotent.
  document.addEventListener('DOMContentLoaded', function () {
    var c = document.getElementById('hero-bg');
    if (c && document.documentElement.getAttribute('data-theme') !== 'light') init(c);
  });
})();
