/**
 * Minimal Modernist Geometric Background Canvas
 * Designed for Anadhya Badri Narayan's Portfolio
 * "Design that says less, and means more."
 *
 * All motion is measured in seconds, so shapes move the same on 60Hz, 120Hz
 * and throttled displays.
 */

(function () {
  'use strict';

  const TAU = Math.PI * 2;
  const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
  // Frame-rate independent smoothing: fraction of a gap closed after dt seconds
  const ease = (rate, dt) => 1 - Math.exp(-rate * dt);
  // Turn angle a toward b by fraction t along the shortest arc
  const lerpAngle = (a, b, t) => a + (((((b - a) % TAU) + TAU + Math.PI) % TAU) - Math.PI) * t;

  // Theme colour palettes (RGB tuples for smooth interpolation)
  const PALETTES = {
    light: {
      mint: [207, 232, 219],
      blush: [246, 218, 223],
      lav: [223, 217, 243],
      powder: [213, 228, 241],
      cream: [243, 233, 216],
      stroke: [38, 36, 33]
    },
    dark: {
      mint: [169, 211, 194],
      blush: [231, 190, 197],
      lav: [196, 187, 228],
      powder: [178, 203, 224],
      cream: [225, 207, 174],
      stroke: [237, 233, 226]
    }
  };

  const CONFIG = {
    maxStep: 0.05,          // s, longest simulated frame (avoids jumps after stalls)
    maxSpeed: 170,          // px/s
    settle: 1.6,            // 1/s, how quickly pushes calm back to the cruising drift
    wanderTurn: 0.35,       // rad/s, how much the drifting path curves
    edgeZone: 120,          // px, soft wall thickness
    edgeStiffness: 2.5,     // px/s² per px inside the soft wall
    pointerRadius: 170,     // px
    pointerStrength: 900,   // px/s² right at the cursor
    shapeRepel: 360,        // px/s² between shapes that get close
    scrollKick: 0.3,        // how strongly scrolling nudges shapes (scaled by depth)
    parallax: 14,           // px of cursor parallax at depth 1
    fadeIn: 0.9,            // s
    minScale: 0.62,         // smallest shape scale on narrow screens
    compactWidth: 700       // px, below this shapes are drawn a little lighter
  };

  // speed in px/s, [light, dark] alpha pairs
  const SHAPE_DEFS = [
    { type: 'circle', size: 110, colorKey: 'mint', fill: [0.52, 0.25], stroke: [0.35, 0.28], depth: 0.35, speed: 7.2 },
    { type: 'square', size: 78, colorKey: 'lav', fill: [0.48, 0.22], stroke: [0.35, 0.28], depth: 0.40, speed: 6.6, corner: 8 },
    { type: 'plus', size: 36, colorKey: 'stroke', fill: [0, 0], stroke: [0.45, 0.30], depth: 0.45, speed: 7.8 }
  ];

  function initGeometricCanvas() {
    let canvas = document.getElementById('bg-canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'bg-canvas';
      canvas.setAttribute('aria-hidden', 'true');
      document.body.insertBefore(canvas, document.body.firstChild);
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!ctx.roundRect) {
      // Adds to the current path, like the native method
      ctx.roundRect = function (x, y, w, h, radius) {
        const r = Math.min(typeof radius === 'number' ? radius : 0, Math.abs(w) / 2, Math.abs(h) / 2);
        this.moveTo(x + r, y);
        this.arcTo(x + w, y, x + w, y + h, r);
        this.arcTo(x + w, y + h, x, y + h, r);
        this.arcTo(x, y + h, x, y, r);
        this.arcTo(x, y, x + w, y, r);
        this.closePath();
      };
    }

    const root = document.documentElement;
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const shapes = [];

    let width = 0;
    let height = 0;
    let dpr = 1;
    let scale = 1;
    let compact = false;
    let animId = null;
    let lastTime = 0;
    let age = 0;
    let lastScrollY = window.scrollY || 0;
    let scrollVel = 0;

    // ---------- Theme ----------
    let themeT = root.getAttribute('data-theme') === 'dark' ? 1 : 0;
    let themeTarget = themeT;

    function rgba(key, alphaLight, alphaDark) {
      const a = PALETTES.light[key];
      const b = PALETTES.dark[key];
      const t = themeT;
      return 'rgba(' +
        Math.round(a[0] + (b[0] - a[0]) * t) + ', ' +
        Math.round(a[1] + (b[1] - a[1]) * t) + ', ' +
        Math.round(a[2] + (b[2] - a[2]) * t) + ', ' +
        (alphaLight + (alphaDark - alphaLight) * t).toFixed(3) + ')';
    }

    new MutationObserver(() => {
      themeTarget = root.getAttribute('data-theme') === 'dark' ? 1 : 0;
      if (motionQuery.matches) {
        themeT = themeTarget;
        drawFrame();
      }
    }).observe(root, { attributes: true, attributeFilter: ['data-theme'] });

    // ---------- Pointer ----------
    const pointer = { x: -9999, y: -9999, vx: 0, vy: 0, t: 0, nx: 0, ny: 0, px: 0, py: 0, active: false };

    function onPointer(e) {
      const x = e.clientX;
      const y = e.clientY;
      if (typeof x !== 'number' || typeof y !== 'number') return;
      if (pointer.active) {
        const dtEvent = Math.max((e.timeStamp - pointer.t) / 1000, 0.004);
        pointer.vx += ((x - pointer.x) / dtEvent - pointer.vx) * 0.4;
        pointer.vy += ((y - pointer.y) / dtEvent - pointer.vy) * 0.4;
      } else {
        pointer.vx = 0;
        pointer.vy = 0;
      }
      pointer.x = x;
      pointer.y = y;
      pointer.t = e.timeStamp;
      pointer.active = true;
      pointer.nx = (x / Math.max(1, width) - 0.5) * 2;
      pointer.ny = (y / Math.max(1, height) - 0.5) * 2;
    }

    function releasePointer() {
      pointer.active = false;
      pointer.vx = 0;
      pointer.vy = 0;
      pointer.nx = 0; // parallax eases back to centre
      pointer.ny = 0;
    }

    const listen = { passive: true, capture: true };
    window.addEventListener('pointermove', onPointer, listen);
    window.addEventListener('pointerdown', onPointer, listen);
    window.addEventListener('pointerup', (e) => { if (e.pointerType !== 'mouse') releasePointer(); }, listen);
    window.addEventListener('pointercancel', releasePointer, listen); // touch turned into a scroll
    root.addEventListener('mouseleave', releasePointer);
    window.addEventListener('blur', releasePointer);

    // ---------- Shapes ----------
    class Shape {
      constructor(def, x, y) {
        this.type = def.type;
        this.colorKey = def.colorKey;
        this.fill = def.fill;
        this.stroke = def.stroke;
        this.depth = def.depth;
        this.speed = def.speed;
        this.corner = def.corner || 0;
        this.baseSize = def.size;
        this.size = def.size * scale;

        this.x = x;
        this.y = y;
        this.heading = Math.random() * TAU;
        this.vx = Math.cos(this.heading) * this.speed;
        this.vy = Math.sin(this.heading) * this.speed;
        this.ax = 0;
        this.ay = 0;

        this.rotation = Math.random() * TAU;
        this.baseSpin = (Math.random() - 0.5) * 0.04; // rad/s
        this.spin = this.baseSpin;

        this.wanderPhase = Math.random() * TAU;
        this.wanderRate = 0.15 + Math.random() * 0.15;
        this.wobblePhase = Math.random() * TAU;
        this.wobbleSpeed = 0.4 + Math.random() * 0.4;
        this.wobbleRadius = 4 + Math.random() * 4;
        this.pulsePhase = Math.random() * TAU;
        this.pulseSpeed = 0.8 + Math.random() * 0.6;

        // Rendered position (physics position + wobble + parallax); used for drawing AND interaction
        this.rx = x;
        this.ry = y;
      }

      locate() {
        this.rx = this.x + Math.cos(this.wobblePhase) * this.wobbleRadius + pointer.px * this.depth * CONFIG.parallax;
        this.ry = this.y + Math.sin(this.wobblePhase * 1.3) * this.wobbleRadius + pointer.py * this.depth * CONFIG.parallax;
      }

      keepInside() {
        const r = this.size * 0.5 + 8;
        if (width > 2 * r) this.x = clamp(this.x, r, width - r);
        if (height > 2 * r) this.y = clamp(this.y, r, height - r);
      }

      update(dt) {
        this.wobblePhase += this.wobbleSpeed * dt;
        this.pulsePhase += this.pulseSpeed * dt;
        this.wanderPhase += this.wanderRate * dt;

        // 1. Calm drift along a slowly curving path
        this.heading += Math.sin(this.wanderPhase) * CONFIG.wanderTurn * dt;

        // 2. Soft walls: a gentle spring plus steering back toward the middle
        const r = this.size * 0.5 + 8;
        const zone = CONFIG.edgeZone * scale;
        const left = zone - (this.x - r);
        const right = zone - (width - r - this.x);
        const top = zone - (this.y - r);
        const bottom = zone - (height - r - this.y);
        if (left > 0) this.ax += left * CONFIG.edgeStiffness;
        if (right > 0) this.ax -= right * CONFIG.edgeStiffness;
        if (top > 0) this.ay += top * CONFIG.edgeStiffness;
        if (bottom > 0) this.ay -= bottom * CONFIG.edgeStiffness;
        const depthIn = Math.max(left, right, top, bottom, 0) / zone;
        if (depthIn > 0) {
          const toCentre = Math.atan2(height / 2 - this.y, width / 2 - this.x);
          this.heading = lerpAngle(this.heading, toCentre, ease(2.5, dt) * Math.min(depthIn, 1));
        }

        // 3. Cursor: a soft repulsion field, stronger when the cursor moves quickly
        if (pointer.active) {
          const dx = this.rx - pointer.x;
          const dy = this.ry - pointer.y;
          const d = Math.hypot(dx, dy);
          const radius = Math.max(CONFIG.pointerRadius * scale, this.size * 1.6);
          if (d < radius && d > 0.001) {
            const nx = dx / d;
            const ny = dy / d;
            const n = 1 - d / radius;
            const boost = 1 + Math.min(Math.hypot(pointer.vx, pointer.vy) / 900, 1);
            const push = CONFIG.pointerStrength * n * n * boost;
            this.ax += nx * push;
            this.ay += ny * push;
            // A cursor brushing past sets the shape turning in that direction
            this.spin += (nx * pointer.vy - ny * pointer.vx) * n * 0.004 * dt;
            // Never let the cursor pass straight through the middle of a shape
            const core = this.size * 0.6;
            if (d < core) {
              const k = (core - d) * ease(10, dt);
              this.x += nx * k;
              this.y += ny * k;
            }
          }
        }

        // 4. Integrate; pushes settle back toward the cruising velocity
        this.vx += this.ax * dt;
        this.vy += this.ay * dt;
        this.ax = 0;
        this.ay = 0;
        const settle = ease(CONFIG.settle, dt);
        this.vx += (Math.cos(this.heading) * this.speed - this.vx) * settle;
        this.vy += (Math.sin(this.heading) * this.speed - this.vy) * settle;
        const speed = Math.hypot(this.vx, this.vy);
        if (speed > CONFIG.maxSpeed) {
          this.vx *= CONFIG.maxSpeed / speed;
          this.vy *= CONFIG.maxSpeed / speed;
        }
        this.x += this.vx * dt;
        this.y += this.vy * dt;

        // Hard stop at the very edge (only reached after a strong flick)
        if (this.x < r) { this.x = r; this.vx = Math.abs(this.vx) * 0.4; }
        if (this.x > width - r) { this.x = width - r; this.vx = -Math.abs(this.vx) * 0.4; }
        if (this.y < r) { this.y = r; this.vy = Math.abs(this.vy) * 0.4; }
        if (this.y > height - r) { this.y = height - r; this.vy = -Math.abs(this.vy) * 0.4; }

        // 5. Spin eases back to its slow base rotation
        this.spin += (this.baseSpin - this.spin) * ease(0.8, dt);
        this.spin = clamp(this.spin, -2.5, 2.5);
        this.rotation += this.spin * dt;
      }
    }

    // ---------- Layout ----------
    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      scale = clamp(width / 1280, CONFIG.minScale, 1);
      compact = width < CONFIG.compactWidth;
      for (const s of shapes) {
        s.size = s.baseSize * scale;
        s.keepInside();
      }
      if (motionQuery.matches) drawFrame();
    }

    let resizeQueued = false;
    window.addEventListener('resize', () => {
      if (resizeQueued) return;
      resizeQueued = true;
      requestAnimationFrame(() => {
        resizeQueued = false;
        resize();
      });
    });

    // Area around the hero header where shapes first appear
    function heroBounds() {
      const header = document.querySelector('header');
      let top = 40;
      let bottom = Math.min(height * 0.72, 560);
      let left = 40;
      let right = width - 40;
      if (header) {
        const rect = header.getBoundingClientRect();
        top = Math.max(30, rect.top);
        bottom = Math.min(height - 30, Math.max(top + 280, rect.bottom + 10));
        left = Math.max(30, rect.left - 20);
        right = Math.min(width - 30, Math.max(rect.right + 60, width - 40));
      }
      if (bottom <= top + 150) bottom = Math.min(height - 30, top + 320);
      if (right <= left + 150) { left = 40; right = width - 40; }
      return { left, right, top, bottom };
    }

    // Random point in the hero area, as far as possible from already placed shapes
    function spawnPoint(size) {
      const b = heroBounds();
      const half = size / 2 + 15;
      const minX = clamp(b.left + half, half, width - half);
      const maxX = clamp(b.right - half, minX, width - half);
      const minY = clamp(b.top + half, half, height - half);
      const maxY = clamp(b.bottom - half, minY, height - half);
      let best = { x: (minX + maxX) / 2, y: (minY + maxY) / 2 };
      let bestGap = -Infinity;
      for (let i = 0; i < 30; i++) {
        const x = minX + Math.random() * (maxX - minX);
        const y = minY + Math.random() * (maxY - minY);
        let gap = Infinity;
        for (const s of shapes) gap = Math.min(gap, Math.hypot(x - s.x, y - s.y) - (s.size + size) / 2);
        if (gap > bestGap) { best = { x, y }; bestGap = gap; }
        if (gap >= 60) break;
      }
      return best;
    }

    resize();
    for (const def of SHAPE_DEFS) {
      const p = spawnPoint(def.size * scale);
      const shape = new Shape(def, p.x, p.y);
      shape.keepInside();
      shapes.push(shape);
    }

    // ---------- Simulation ----------
    function step(dt) {
      age += dt;
      themeT += (themeTarget - themeT) * ease(5, dt);

      const follow = ease(3, dt);
      pointer.px += (pointer.nx - pointer.px) * follow;
      pointer.py += (pointer.ny - pointer.py) * follow;
      const fade = ease(6, dt);
      pointer.vx -= pointer.vx * fade;
      pointer.vy -= pointer.vy * fade;

      // Scrolling gives shapes a small nudge in the direction the page moves
      const scrollY = window.scrollY || 0;
      if (dt > 0) scrollVel += ((scrollY - lastScrollY) / dt - scrollVel) * ease(12, dt);
      lastScrollY = scrollY;
      const kick = clamp(scrollVel, -4000, 4000) * CONFIG.scrollKick;

      for (const s of shapes) {
        s.locate();
        s.ay -= kick * s.depth;
      }

      // Shapes keep a comfortable distance from each other
      for (let i = 0; i < shapes.length; i++) {
        const a = shapes[i];
        for (let j = i + 1; j < shapes.length; j++) {
          const b = shapes[j];
          const dx = a.rx - b.rx;
          const dy = a.ry - b.ry;
          const d = Math.hypot(dx, dy);
          const field = (a.size + b.size) * 0.95 + 60 * scale;
          if (d >= field || d < 0.001) continue;

          const nx = dx / d;
          const ny = dy / d;
          const n = 1 - d / field;
          const push = CONFIG.shapeRepel * n * n;
          a.ax += nx * push;
          a.ay += ny * push;
          b.ax -= nx * push;
          b.ay -= ny * push;

          // Steer apart so the cruising drift does not keep pulling them together
          const turn = ease(1.5, dt) * n;
          a.heading = lerpAngle(a.heading, Math.atan2(ny, nx), turn);
          b.heading = lerpAngle(b.heading, Math.atan2(-ny, -nx), turn);

          // Overlapping: separate and trade momentum along the contact normal
          const touch = (a.size + b.size) * 0.52;
          if (d < touch) {
            const sep = (touch - d) * 0.5;
            a.x += nx * sep;
            a.y += ny * sep;
            b.x -= nx * sep;
            b.y -= ny * sep;
            const approach = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
            if (approach < 0) {
              const impulse = -approach * 0.8; // (1 + restitution 0.6) / 2
              a.vx += nx * impulse;
              a.vy += ny * impulse;
              b.vx -= nx * impulse;
              b.vy -= ny * impulse;
            }
          }
        }
      }

      for (const s of shapes) s.update(dt);
    }

    // ---------- Drawing ----------
    function drawFrame() {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const reveal = motionQuery.matches ? 1 : clamp(age / CONFIG.fadeIn, 0, 1);
      ctx.globalAlpha = 1 - Math.pow(1 - reveal, 3); // ease-out fade in
      const fillMul = compact ? 0.7 : 1;
      const strokeMul = compact ? 0.8 : 1;

      for (const s of shapes) {
        s.locate();
        const size = s.size * (1 + Math.sin(s.pulsePhase) * 0.03);
        const half = size / 2;

        ctx.save();
        ctx.translate(s.rx, s.ry);
        ctx.rotate(s.rotation);
        ctx.beginPath();

        if (s.type === 'plus') {
          ctx.moveTo(-half, 0);
          ctx.lineTo(half, 0);
          ctx.moveTo(0, -half);
          ctx.lineTo(0, half);
          ctx.lineWidth = 2;
          ctx.lineCap = 'round';
        } else {
          if (s.type === 'circle') ctx.arc(0, 0, half, 0, TAU);
          else ctx.roundRect(-half, -half, size, size, s.corner * scale);
          ctx.fillStyle = rgba(s.colorKey, s.fill[0] * fillMul, s.fill[1] * fillMul);
          ctx.fill();
          ctx.lineWidth = 1.4;
        }

        ctx.strokeStyle = rgba('stroke', s.stroke[0] * strokeMul, s.stroke[1] * strokeMul);
        ctx.stroke();
        ctx.restore();
      }

      ctx.globalAlpha = 1;
    }

    // ---------- Loop control ----------
    function frame(now) {
      animId = requestAnimationFrame(frame);
      const dt = clamp((now - lastTime) / 1000, 0, CONFIG.maxStep);
      lastTime = now;
      step(dt);
      drawFrame();
    }

    // Always cancel before starting so only one loop can run
    function start() {
      stop();
      lastTime = performance.now();
      lastScrollY = window.scrollY || 0;
      scrollVel = 0;
      animId = requestAnimationFrame(frame);
    }

    function stop() {
      if (animId) cancelAnimationFrame(animId);
      animId = null;
    }

    window.__bgCanvas = { mouse: pointer, elements: shapes };

    if (motionQuery.matches) {
      drawFrame(); // single static frame, no loop
    } else {
      start();
    }

    const onMotionChange = (e) => {
      if (e.matches) {
        stop();
        drawFrame();
      } else {
        start();
      }
    };
    if (motionQuery.addEventListener) motionQuery.addEventListener('change', onMotionChange);
    else if (motionQuery.addListener) motionQuery.addListener(onMotionChange);

    // Pause while the tab is hidden to save power
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop();
      else if (!motionQuery.matches) start();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGeometricCanvas);
  } else {
    initGeometricCanvas();
  }
})();
