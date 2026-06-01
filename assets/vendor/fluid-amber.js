/*!
 * fluid-amber — domain-warped simplex-noise WebGL background.
 * Source: radiant by Paul Bakaus — https://github.com/pbakaus/radiant (MIT, © 2025).
 * Adapted for Roxabi: targets a specific <canvas>, palette aligned to amber #f0b429.
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

    var vertSrc = 'attribute vec2 a_pos;void main(){gl_Position=vec4(a_pos,0.0,1.0);}';
    var fragSrc = [
      // highp where available — mediump overflows on the domain-warped coordinates
      // (large p · freq), producing Inf/NaN → an all-black render on some drivers.
      '#ifdef GL_FRAGMENT_PRECISION_HIGH',
      'precision highp float;',
      '#else',
      'precision mediump float;',
      '#endif',
      'uniform float u_time;uniform vec2 u_res;uniform float u_timeScale;uniform float u_ampDecay;uniform vec2 u_mouse;',
      'vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}',
      'vec2 mod289v2(vec2 x){return x-floor(x*(1.0/289.0))*289.0;}',
      'vec3 permute(vec3 x){return mod289(((x*34.0)+1.0)*x);}',
      'float snoise(vec2 v){',
      ' const vec4 C=vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);',
      ' vec2 i=floor(v+dot(v,C.yy));vec2 x0=v-i+dot(i,C.xx);vec2 i1;',
      ' i1=(x0.x>x0.y)?vec2(1.0,0.0):vec2(0.0,1.0);vec4 x12=x0.xyxy+C.xxzz;x12.xy-=i1;i=mod289v2(i);',
      ' vec3 p=permute(permute(i.y+vec3(0.0,i1.y,1.0))+i.x+vec3(0.0,i1.x,1.0));',
      ' vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0);m=m*m;m=m*m;',
      ' vec3 x=2.0*fract(p*C.www)-1.0;vec3 h=abs(x)-0.5;vec3 ox=floor(x+0.5);vec3 a0=x-ox;',
      ' m*=1.79284291400159-0.85373472095314*(a0*a0+h*h);vec3 g;',
      ' g.x=a0.x*x0.x+h.x*x0.y;g.yz=a0.yz*x12.xz+h.yz*x12.yw;return 130.0*dot(m,g);}',
      'float fbm(vec2 p,float t){float val=0.0;float amp=0.5;float freq=1.0;',
      ' for(int i=0;i<5;i++){val+=amp*snoise(p*freq+t*0.3);freq*=2.1;amp*=u_ampDecay;p+=vec2(1.7,9.2);}return val;}',
      'void main(){',
      ' vec2 p=(gl_FragCoord.xy-u_res*0.5)/min(u_res.x,u_res.y);float t=u_time*u_timeScale;',
      ' if(u_mouse.x>0.0){vec2 mN=(u_mouse-u_res*0.5)/min(u_res.x,u_res.y);vec2 d=p-mN;float dist=length(d);',
      '  float swirl=exp(-dist*dist*8.0)*0.4;float a=swirl*6.0;float ca=cos(a),sa=sin(a);p=mN+mat2(ca,-sa,sa,ca)*d;}',
      ' vec2 q=vec2(fbm(p+vec2(0.0,0.0),t),fbm(p+vec2(5.2,1.3),t));',
      ' vec2 r=vec2(fbm(p+4.0*q+vec2(1.7,9.2),t*1.2),fbm(p+4.0*q+vec2(8.3,2.8),t*1.2));',
      ' float f=fbm(p+3.5*r,t*0.8);',
      ' vec3 col=mix(vec3(0.051,0.066,0.090),vec3(0.20,0.15,0.06),clamp(f*f*2.0,0.0,1.0));', // base toward #0d1117
      ' col=mix(col,vec3(0.78,0.58,0.16),clamp(length(q)*0.5,0.0,1.0));',
      ' col=mix(col,vec3(0.941,0.706,0.161),clamp(length(r.x)*0.6,0.0,1.0));', // #f0b429
      ' float hl=smoothstep(0.5,1.2,f*f*3.0+length(r)*0.5);col+=vec3(0.18,0.12,0.04)*hl;',
      ' col=pow(col,vec3(1.1));gl_FragColor=vec4(col,1.0);}'
    ].join('\n');

    function compile(type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; }
    var prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, vertSrc));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fragSrc));
    gl.linkProgram(prog); gl.useProgram(prog);

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var aPos = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    var uTime = gl.getUniformLocation(prog, 'u_time'), uRes = gl.getUniformLocation(prog, 'u_res'),
        uTimeScale = gl.getUniformLocation(prog, 'u_timeScale'), uAmpDecay = gl.getUniformLocation(prog, 'u_ampDecay'),
        uMouse = gl.getUniformLocation(prog, 'u_mouse');
    var mouseX = -1, mouseY = -1, timeScale = 0.13, ampDecay = 0.46;
    var dpr = Math.min(window.devicePixelRatio || 1, 2), needsResize = true;

    function resize() {
      needsResize = false;
      var w = Math.round(canvas.clientWidth * dpr), h = Math.round(canvas.clientHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); gl.uniform2f(uRes, w, h); }
    }
    function render(now) {
      if (needsResize) resize();
      gl.uniform1f(uTime, prefersReduced ? 0.0 : now * 0.001);
      gl.uniform1f(uTimeScale, timeScale); gl.uniform1f(uAmpDecay, ampDecay); gl.uniform2f(uMouse, mouseX, mouseY);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      requestAnimationFrame(render);
    }
    window.addEventListener('resize', function () { needsResize = true; });
    canvas.addEventListener('mousemove', function (e) { var b = canvas.getBoundingClientRect(); mouseX = (e.clientX - b.left) * dpr; mouseY = (canvas.clientHeight - (e.clientY - b.top)) * dpr; });
    canvas.addEventListener('mouseleave', function () { mouseX = -1; mouseY = -1; });
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
