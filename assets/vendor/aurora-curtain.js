/*!
 * aurora-curtain — vertical flowing curtain lines (WebGL background).
 * Source: radiant by Paul Bakaus — https://github.com/pbakaus/radiant (MIT, © 2025).
 * Adapted for Roxabi: targets a specific <canvas>, no drag interaction, no label.
 * Degrades gracefully: if WebGL is unavailable, the canvas stays transparent and
 * the page's flat --bg shows through. No effect on layout or content.
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
      'uniform float u_waveSpeed;',
      'uniform float u_lineCount;',
      'uniform float u_amplitude;',
      'uniform float u_rotation;',
      'uniform float u_dragAngle;',
      'uniform vec2 u_mouse;',
      '',
      '// ── Hash for noise ──',
      'float hash(vec2 p) {',
      '  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);',
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
      '#define S smoothstep',
      '',
      'mat2 rot2(float a) { float c=cos(a),s=sin(a); return mat2(c,-s,s,c); }',
      '',
      '// ── Single vertical curtain line ──',
      'vec3 curtainLine(vec2 uv, float speed, float freq, vec3 c, float t) {',
      '  // Sine displacement on x based on y position (vertical flow)',
      '  uv.x += S(1.0, 0.0, abs(uv.y)) * sin(t * speed + uv.y * freq) * 0.2;',
      '  float lw = 0.06 * S(0.2, 0.9, abs(uv.y));',
      '  float l = S(lw, 0.0, abs(uv.x) - 0.004);',
      '  // Edge fade top/bottom instead of left/right',
      '  float fade = S(1.0, 0.3, abs(uv.y));',
      '  return l * c * fade;',
      '}',
      '',
      'void main() {',
      '  vec2 uv = (gl_FragCoord.xy - 0.5 * u_res.xy) / u_res.y;',
      '  uv = rot2(u_dragAngle + u_rotation) * uv;',
      '  // Shift curtain to the right side of the canvas',
      '  uv.x -= 0.5;',
      '  // Mouse modifies amplitude & frequency + direct displacement',
      '  float mouseAmp = u_amplitude;',
      '  float mouseFreq = 1.0;',
      '  float mouseShift = 0.0;',
      '  if (u_mouse.x > 0.0) {',
      '    vec2 mUV = u_mouse / u_res;',
      '    mouseAmp *= 0.2 + mUV.y * 2.0;',
      '    mouseFreq = 0.3 + mUV.x * 1.5;',
      '    // Cursor pushes the curtain horizontally (stronger near center)',
      '    mouseShift = (mUV.x - 0.5) * 0.25;',
      '  }',
      '  float t = u_time * u_waveSpeed;',
      '  int lineCount = int(u_lineCount);',
      '',
      '  vec3 col = vec3(0.0);',
      '',
      '  for (int i = 0; i < 12; i++) {',
      '    if (i >= lineCount) break;',
      '    float fi = float(i);',
      '    float frac = fi / max(u_lineCount - 1.0, 1.0);',
      '',
      '    float speed = (0.6 + frac * 0.5) * mouseFreq;',
      '    float freq = (4.0 + frac * 2.0) * mouseAmp;',
      '',
      '    // Color: warm amber at base (bottom), cool teal at top',
      '    vec3 warmAmber = vec3(1.0, 0.75, 0.2);',
      '    vec3 darkGold  = vec3(0.75, 0.45, 0.05);',
      '    // Blend per-line from bright gold to dark gold (no teal)',
      '    vec3 lineCol = mix(warmAmber, darkGold, frac * 0.6) * (0.5 + frac * 0.5);',
      '',
      '    // Also blend per-pixel based on vertical position',
      '    float yBlend = S(-0.4, 0.5, uv.y);',
      '    vec3 pixelCol = mix(warmAmber, darkGold, yBlend * 0.6) * (0.4 + frac * 0.6);',
      '    lineCol = mix(lineCol, pixelCol, 0.6);',
      '',
      '    // Slow lateral drift',
      '    float drift = sin(t * 0.08 + fi * 1.3) * 0.03;',
      '',
      '    float nOff = noise(vec2(uv.y * 2.0 + fi * 3.7, t * 0.1 + fi)) * 0.015;',
      '',
      '    col += curtainLine(uv + vec2(nOff + drift + mouseShift, 0.0), speed, freq, lineCol, t);',
      '  }',
      '',
      '  // ── Vignette ──',
      '  float vig = 1.0 - dot(uv, uv) * 0.4;',
      '  col *= max(vig, 0.0);',
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
    var uWaveSpeed = gl.getUniformLocation(prog, 'u_waveSpeed');
    var uLineCount = gl.getUniformLocation(prog, 'u_lineCount');
    var uAmplitude = gl.getUniformLocation(prog, 'u_amplitude');
    var uRotation = gl.getUniformLocation(prog, 'u_rotation');
    var uDragAngle = gl.getUniformLocation(prog, 'u_dragAngle');
    var uMouse = gl.getUniformLocation(prog, 'u_mouse');

    var mouseXVal = -1.0, mouseYVal = -1.0;
    var mouseTargetX = -1.0, mouseTargetY = -1.0;
    var dragAngle = 0;
    var mouseDown = false, lastMX = 0;
    var waveSpeedVal = 0.35;
    var lineCountVal = 6.0;
    var amplitudeVal = 1.0;
    var rotationVal = 0.0;

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
    // churn, no mouse interaction. (Either entry point may reach here on dark.)
    if (prefersReduced) {
      resize();
      gl.uniform1f(uTime, 0.0);
      gl.uniform1f(uWaveSpeed, waveSpeedVal);
      gl.uniform1f(uLineCount, lineCountVal);
      gl.uniform1f(uAmplitude, amplitudeVal);
      gl.uniform1f(uRotation, rotationVal);
      gl.uniform1f(uDragAngle, 0.0);
      gl.uniform2f(uMouse, -1.0, -1.0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      return;
    }

    function render(now) {
      if (!running) { requestAnimationFrame(render); return; }
      if (needsResize) resize();
      // Smooth lerp current mouse toward target (0.06 = ~0.5s settle at 60fps)
      if (mouseTargetX >= 0) {
        if (mouseXVal < 0) { mouseXVal = mouseTargetX; mouseYVal = mouseTargetY; }
        mouseXVal += (mouseTargetX - mouseXVal) * 0.06;
        mouseYVal += (mouseTargetY - mouseYVal) * 0.06;
      } else {
        // Decay back to center when mouse leaves (neutral state)
        var cx = canvas.width * 0.5;
        var cy = canvas.height * 0.5;
        mouseXVal += (cx - mouseXVal) * 0.04;
        mouseYVal += (cy - mouseYVal) * 0.04;
      }
      gl.uniform1f(uTime, prefersReduced ? 0.0 : now * 0.001);
      gl.uniform1f(uWaveSpeed, waveSpeedVal);
      gl.uniform1f(uLineCount, lineCountVal);
      gl.uniform1f(uAmplitude, amplitudeVal);
      gl.uniform1f(uRotation, rotationVal);
      gl.uniform1f(uDragAngle, dragAngle);
      gl.uniform2f(uMouse, mouseXVal, mouseYVal);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      requestAnimationFrame(render);
    }

    window.addEventListener('resize', function () {
      needsResize = true;
    });

    // Attach events to the .hero parent so they fire even when the cursor is over
    // the .wrap content (which has z-index: 2 and sits above the canvas).
    var hero = canvas.closest('.hero');
    var tracker = hero || canvas;
    tracker.addEventListener('mousemove', function(e) {
      var b = canvas.getBoundingClientRect();
      mouseTargetX = (e.clientX - b.left) * dpr;
      mouseTargetY = (b.height - (e.clientY - b.top)) * dpr;
      if (mouseDown) { dragAngle += (e.clientX - lastMX) * 0.004; lastMX = e.clientX; }
    });
    tracker.addEventListener('mouseleave', function() {
      mouseTargetX = -1.0; mouseTargetY = -1.0; mouseDown = false;
    });
    tracker.addEventListener('mousedown', function(e) { mouseDown = true; lastMX = e.clientX; });
    tracker.addEventListener('mouseup', function() { mouseDown = false; });

    document.addEventListener('visibilitychange', function () {
      running = !document.hidden;
    });

    resize();
    requestAnimationFrame(render);
  }

  window.FluidAmber = { init: init };
  // Don't spin up WebGL in light mode (the shader is hidden there). app.js calls
  // init() when the theme switches to dark; the `started` guard makes that idempotent.
  document.addEventListener('DOMContentLoaded', function () {
    var c = document.getElementById('hero-bg');
    if (c && document.documentElement.getAttribute('data-theme') !== 'light') init(c);
  });
})();
