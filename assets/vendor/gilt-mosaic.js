/*!
 * gilt-mosaic — Byzantine golden mosaic wall catching candlelight (WebGL background).
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
      'uniform float u_lightSpeed;',
      'uniform float u_tileScale;',
      'uniform float u_animMode;',
      'uniform float u_waveSpeed;',
      'uniform float u_waveDelay;',
      'uniform float u_waveDir;',
      '',
      '#define PI 3.14159265359',
      '#define TAU 6.28318530718',
      '',
      '// ── Pseudo-random hash ──',
      'float hash(vec2 p) {',
      '  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);',
      '}',
      '',
      'vec2 hash2(vec2 p) {',
      '  return vec2(',
      '    fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453),',
      '    fract(sin(dot(p, vec2(269.5, 183.3))) * 43758.5453)',
      '  );',
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
      '// ── Tile grid with jitter ──',
      'vec4 tileGrid(vec2 p, float scale) {',
      '  vec2 sp = p * scale;',
      '  vec2 id = floor(sp);',
      '  vec2 f = fract(sp);',
      '  vec2 jitter = hash2(id) * 0.12 - 0.06;',
      '  f -= jitter;',
      '  return vec4(f, id);',
      '}',
      '',
      '// ── Per-tile normal (tilted surface) ──',
      'vec3 tileNormal(vec2 id) {',
      '  float h1 = hash(id * 1.731 + 17.3);',
      '  float h2 = hash(id * 2.419 + 31.7);',
      '  float tiltX = (h1 - 0.5) * 0.35;',
      '  float tiltY = (h2 - 0.5) * 0.35;',
      '  return normalize(vec3(tiltX, tiltY, 1.0));',
      '}',
      '',
      '// ── Grout detection ──',
      'float groutMask(vec2 f, float groutWidth) {',
      '  vec2 edge = smoothstep(vec2(0.0), vec2(groutWidth), f) *',
      '              smoothstep(vec2(0.0), vec2(groutWidth), vec2(1.0) - f);',
      '  return edge.x * edge.y;',
      '}',
      '',
      '// ── Surface micro-roughness within a tile ──',
      'float tileRoughness(vec2 f, vec2 id) {',
      '  float n1 = noise(f * 8.0 + id * 3.7);',
      '  float n2 = noise(f * 16.0 + id * 7.1 + 50.0);',
      '  return n1 * 0.6 + n2 * 0.4;',
      '}',
      '',
      '// ── Wave flip: configurable direction, speed, delay ──',
      'vec2 waveFlip(vec2 tileCenter, float rawTime, vec2 aspect) {',
      '  float sweepDur = u_waveSpeed;',
      '  float cycleDur = sweepDur + u_waveDelay;',
      '  float cycleT = mod(rawTime, cycleDur);',
      '  float waveCount = floor(rawTime / cycleDur);',
      '  float isOddWave = mod(waveCount, 2.0);',
      '  float sweepRaw = clamp(cycleT / sweepDur, 0.0, 1.0);',
      '  float sweep = sweepRaw * sweepRaw * (3.0 - 2.0 * sweepRaw);',
      '  float dir = floor(u_waveDir + 0.5);',
      '  float axisLen = aspect.x;',
      '  float tilePos = tileCenter.x;',
      '  if (dir == 1.0) { tilePos = aspect.x - tileCenter.x; }',
      '  else if (dir == 2.0) { tilePos = 1.0 - tileCenter.y; axisLen = 1.0; }',
      '  else if (dir == 3.0) { tilePos = tileCenter.y; axisLen = 1.0; }',
      '  float waveX = sweep * (axisLen + 0.6) - 0.3;',
      '  float tileRand = hash(tileCenter * 31.7 + vec2(17.3, 59.1));',
      '  float stagger = tileRand * 0.06;',
      '  float dist = tilePos - waveX + stagger;',
      '  float flipProgress = smoothstep(0.5, -0.3, dist);',
      '  float flipAngle = (isOddWave + flipProgress) * PI;',
      '  float inTransition = smoothstep(0.6, 0.0, abs(dist + 0.1));',
      '  return vec2(flipAngle, inTransition);',
      '}',
      '',
      'void main() {',
      '  vec2 uv = gl_FragCoord.xy / u_res;',
      '  vec2 aspect = vec2(u_res.x / u_res.y, 1.0);',
      '  vec2 p = uv * aspect;',
      '  float t = u_time * u_lightSpeed;',
      '',
      '  // ── Tile grid ──',
      '  float scale = 18.0 * u_tileScale;',
      '  vec4 tile = tileGrid(p, scale);',
      '  vec2 f = tile.xy;',
      '  vec2 id = tile.zw;',
      '',
      '  // ── Grout ──',
      '  float groutW = 0.06;',
      '  float tMask = groutMask(f, groutW);',
      '',
      '  // ── Per-tile properties ──',
      '  float tileHash = hash(id);',
      '  float tileHash2 = hash(id + 200.0);',
      '  float tileHash3 = hash(id + 400.0);',
      '  vec3 N = tileNormal(id);',
      '',
      '  float roughness = tileRoughness(f, id);',
      '  N = normalize(N + vec3(',
      '    (roughness - 0.5) * 0.12,',
      '    (noise(f * 12.0 + id * 5.3) - 0.5) * 0.12,',
      '    0.0',
      '  ));',
      '',
      '  // ── Wave flip animation with 3D perspective ──',
      '  vec2 tileCenter = (id + 0.5) / scale;',
      '  vec2 flipData = waveFlip(tileCenter, u_time, aspect);',
      '  float flipAngle = flipData.x * u_animMode;',
      '  float inTransition = flipData.y * u_animMode;',
      '',
      '  float cosFlip = cos(flipAngle);',
      '  float abscos = abs(cosFlip);',
      '  float dir = floor(u_waveDir + 0.5);',
      '  bool flipVertical = (dir == 2.0 || dir == 3.0);',
      '',
      '  if (flipVertical) {',
      '    f.y = (f.y - 0.5) / max(abscos, 0.04) + 0.5;',
      '  } else {',
      '    f.x = (f.x - 0.5) / max(abscos, 0.04) + 0.5;',
      '  }',
      '  float inBounds = step(0.0, f.x) * step(f.x, 1.0) * step(0.0, f.y) * step(f.y, 1.0);',
      '  tMask *= inBounds;',
      '',
      '  float isBack = step(cosFlip, 0.0);',
      '',
      '  float sinFlip = sin(flipAngle);',
      '  vec3 flippedN;',
      '  if (flipVertical) {',
      '    flippedN = vec3(N.x, N.y * cosFlip + N.z * sinFlip, -N.y * sinFlip + N.z * cosFlip);',
      '  } else {',
      '    flippedN = vec3(N.x * cosFlip + N.z * sinFlip, N.y, -N.x * sinFlip + N.z * cosFlip);',
      '  }',
      '  N = normalize(mix(N, flippedN, u_animMode));',
      '',
      '  if (isBack > 0.5) {',
      '    vec3 backN = tileNormal(id + 500.0);',
      '    float backRough = tileRoughness(f, id + 500.0);',
      '    backN = normalize(backN + vec3(',
      '      (backRough - 0.5) * 0.15,',
      '      (noise(f * 14.0 + id * 3.7) - 0.5) * 0.15,',
      '      0.0',
      '    ));',
      '    N = backN;',
      '    roughness = backRough;',
      '  }',
      '',
      '  // ── Moving light sources ──',
      '  vec3 light1Pos = vec3(',
      '    aspect.x * 0.5 + sin(t * 0.7) * aspect.x * 0.4,',
      '    0.5 + cos(t * 0.53) * 0.4,',
      '    0.8 + sin(t * 0.31) * 0.15',
      '  );',
      '  vec3 light2Pos = vec3(',
      '    aspect.x * 0.5 + cos(t * 0.43 + 2.0) * aspect.x * 0.35,',
      '    0.5 + sin(t * 0.37 + 1.5) * 0.35,',
      '    0.7 + cos(t * 0.29) * 0.1',
      '  );',
      '  vec3 light3Pos = vec3(',
      '    aspect.x * 0.5 + sin(t * 0.19 + 4.0) * aspect.x * 0.25,',
      '    0.5 + cos(t * 0.23 + 3.0) * 0.25,',
      '    1.2',
      '  );',
      '',
      '  // ── Per-tile specular calculation ──',
      '  vec3 tileWorldPos = vec3(p, 0.0);',
      '  vec3 viewDir = normalize(vec3(aspect.x * 0.5, 0.5, 1.5) - tileWorldPos);',
      '',
      '  vec3 L1 = normalize(light1Pos - tileWorldPos);',
      '  vec3 H1 = normalize(L1 + viewDir);',
      '  float NdotH1 = max(dot(N, H1), 0.0);',
      '  float spec1 = pow(NdotH1, 80.0 + tileHash * 60.0);',
      '  float diff1 = max(dot(N, L1), 0.0);',
      '',
      '  vec3 L2 = normalize(light2Pos - tileWorldPos);',
      '  vec3 H2 = normalize(L2 + viewDir);',
      '  float NdotH2 = max(dot(N, H2), 0.0);',
      '  float spec2 = pow(NdotH2, 60.0 + tileHash2 * 80.0);',
      '  float diff2 = max(dot(N, L2), 0.0);',
      '',
      '  vec3 L3 = normalize(light3Pos - tileWorldPos);',
      '  vec3 H3 = normalize(L3 + viewDir);',
      '  float NdotH3 = max(dot(N, H3), 0.0);',
      '  float spec3 = pow(NdotH3, 30.0 + tileHash3 * 20.0);',
      '  float diff3 = max(dot(N, L3), 0.0);',
      '',
      '  // Combined specular — scaled back slightly for background subtlety',
      '  float specTotal = spec1 * 0.9 + spec2 * 0.7 + spec3 * 0.3;',
      '  float diffTotal = diff1 * 0.4 + diff2 * 0.28 + diff3 * 0.2;',
      '',
      '  // ── Slow breathing / pulsing ──',
      '  float breathe = 1.0 + sin(t * 0.6) * 0.08 + sin(t * 0.37 + 1.0) * 0.05;',
      '  specTotal *= breathe;',
      '  diffTotal *= breathe;',
      '',
      '  // ── Wave flip: 3D shading ──',
      '  float flipFlash = isBack * smoothstep(0.3, 0.7, inTransition);',
      '  float flipGlow = inTransition * inTransition * 0.3;',
      '',
      '  // ── Per-tile shimmer ──',
      '  float shimmerPhase = tileHash * TAU + t * (0.8 + tileHash2 * 1.5);',
      '  float shimmer = pow(max(sin(shimmerPhase), 0.0), 16.0);',
      '  float shimmer2Phase = tileHash3 * TAU + t * (0.5 + tileHash * 0.7) + 2.0;',
      '  float shimmer2 = pow(max(sin(shimmer2Phase), 0.0), 24.0);',
      '  float shimmerBlend = 1.0 - u_animMode;',
      '  float shimmerTotal = (shimmer * 0.6 + shimmer2 * 0.4) * shimmerBlend;',
      '',
      '  // ── Roxabi amber palette ──',
      '  vec3 groutColor = vec3(0.04, 0.03, 0.01);',
      '  vec3 darkGold   = vec3(0.75, 0.45, 0.05);',
      '  vec3 medGold    = vec3(0.94, 0.71, 0.16);',
      '  vec3 brightGold = vec3(0.98, 0.75, 0.14);',
      '  vec3 flashGold  = vec3(0.99, 0.90, 0.54);',
      '  vec3 hotGold    = vec3(1.0,  0.96, 0.75);',
      '',
      '  // ── Per-tile base color variation ──',
      '  float baseVar = tileHash;',
      '  vec3 tileBase = mix(vec3(0.12, 0.08, 0.02), darkGold, smoothstep(0.0, 0.5, baseVar));',
      '  tileBase = mix(tileBase, medGold, smoothstep(0.5, 0.85, baseVar));',
      '  tileBase *= 0.9 + tileHash2 * 0.2;',
      '',
      '  // ── Build tile color with lighting ──',
      '  vec3 tileColor = tileBase;',
      '  tileColor += tileBase * diffTotal * 0.5;',
      '',
      '  vec3 specColor = mix(brightGold, flashGold, smoothstep(0.0, 0.5, specTotal));',
      '  specColor = mix(specColor, hotGold, smoothstep(0.5, 1.0, specTotal));',
      '  tileColor += specColor * specTotal * 1.1;',
      '',
      '  vec3 shimmerColor = mix(flashGold, hotGold, shimmerTotal);',
      '  tileColor += shimmerColor * shimmerTotal * 0.55;',
      '',
      '  // ── Wave flip: depth shading ──',
      '  float flipShade = mix(1.0, abscos * 0.7 + 0.3, inTransition);',
      '  tileColor *= flipShade;',
      '  tileColor = mix(tileColor, tileColor * vec3(1.2, 1.05, 0.85), isBack * 0.6);',
      '  float edgeOnGlow = pow(1.0 - abscos, 4.0) * inTransition;',
      '  tileColor += medGold * edgeOnGlow * 0.2 * u_animMode;',
      '',
      '  // ── Micro-facet sparkle ──',
      '  float microSpec = pow(roughness, 4.0) * specTotal * 3.0;',
      '  tileColor += flashGold * microSpec * 0.22;',
      '',
      '  // ── Edge highlighting ──',
      '  float edgeDist = min(min(f.x, 1.0 - f.x), min(f.y, 1.0 - f.y));',
      '  float edgeHighlight = smoothstep(0.15, 0.05, edgeDist);',
      '  tileColor += brightGold * edgeHighlight * (diffTotal + specTotal * 0.5) * 0.12;',
      '',
      '  // ── Composite: tile or grout ──',
      '  vec3 col = mix(groutColor, tileColor, tMask);',
      '',
      '  // ── Subtle grout depth ──',
      '  float groutDepth = 1.0 - tMask;',
      '  col -= vec3(0.01, 0.008, 0.003) * groutDepth * (1.0 - smoothstep(0.0, 0.03, edgeDist));',
      '',
      '  // ── Global warm glow pools ──',
      '  float glow1 = smoothstep(0.7, 0.0, length(p - light1Pos.xy));',
      '  float glow2 = smoothstep(0.6, 0.0, length(p - light2Pos.xy));',
      '  col += medGold * glow1 * 0.045;',
      '  col += medGold * glow2 * 0.03;',
      '',
      '  // ── Vignette for depth and focus ──',
      '  vec2 vigUv = uv * 2.0 - 1.0;',
      '  float vig = 1.0 - dot(vigUv, vigUv) * 0.4;',
      '  vig = max(vig, 0.0);',
      '  vig = smoothstep(0.0, 1.0, vig);',
      '  col *= 0.45 + vig * 0.55;',
      '',
      '  // ── Tone mapping (ACES-like) ──',
      '  col = col * (2.51 * col + 0.03) / (col * (2.43 * col + 0.59) + 0.14);',
      '',
      '  // ── Warmth push — amber gamma ──',
      '  col = pow(max(col, vec3(0.0)), vec3(0.95, 1.0, 1.1));',
      '',
      '  // ── Overall brightness pull-back for background role ──',
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

    var uTime       = gl.getUniformLocation(prog, 'u_time');
    var uRes        = gl.getUniformLocation(prog, 'u_res');
    var uLightSpeed = gl.getUniformLocation(prog, 'u_lightSpeed');
    var uTileScale  = gl.getUniformLocation(prog, 'u_tileScale');
    var uAnimMode   = gl.getUniformLocation(prog, 'u_animMode');
    var uWaveSpeed  = gl.getUniformLocation(prog, 'u_waveSpeed');
    var uWaveDelay  = gl.getUniformLocation(prog, 'u_waveDelay');
    var uWaveDir    = gl.getUniformLocation(prog, 'u_waveDir');

    var lightSpeedVal = 0.4;
    var tileScaleVal  = 1.0;
    var animModeVal   = 1.0;
    var waveSpeedVal  = 4.0;
    var waveDelayVal  = 1.5;
    var waveDirVal    = 0.0;

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var needsResize = true;
    var running = true;

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

    // Reduced motion: draw a single frozen frame and stop — no rAF loop, no GPU
    // churn, no mouse interaction.
    if (prefersReduced) {
      resize();
      gl.uniform1f(uTime, 0.0);
      gl.uniform1f(uLightSpeed, lightSpeedVal);
      gl.uniform1f(uTileScale, tileScaleVal);
      gl.uniform1f(uAnimMode, animModeVal);
      gl.uniform1f(uWaveSpeed, waveSpeedVal);
      gl.uniform1f(uWaveDelay, waveDelayVal);
      gl.uniform1f(uWaveDir, waveDirVal);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      return;
    }

    function render(now) {
      if (!running) { requestAnimationFrame(render); return; }
      if (needsResize) resize();
      gl.uniform1f(uTime, now * 0.001);
      gl.uniform1f(uLightSpeed, lightSpeedVal);
      gl.uniform1f(uTileScale, tileScaleVal);
      gl.uniform1f(uAnimMode, animModeVal);
      gl.uniform1f(uWaveSpeed, waveSpeedVal);
      gl.uniform1f(uWaveDelay, waveDelayVal);
      gl.uniform1f(uWaveDir, waveDirVal);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      requestAnimationFrame(render);
    }

    window.addEventListener('resize', function () {
      needsResize = true;
    });

    document.addEventListener('visibilitychange', function () {
      running = !document.hidden;
    });

    resize();
    requestAnimationFrame(render);
  }

  window.RadiantGiltMosaic = { init: init };
  // Don't spin up WebGL in light mode (the shader is hidden there). app.js calls
  // init() when the theme switches to dark; the `started` guard makes that idempotent.
  document.addEventListener('DOMContentLoaded', function () {
    var c = document.getElementById('hero-bg');
    if (c && document.documentElement.getAttribute('data-theme') !== 'light') init(c);
  });
})();
