/**
 * Minimal Modernist Geometric Background Canvas
 * Designed for Anadhya Badri Narayan's Portfolio
 * "Design that says less, and means more."
 */

(function () {
  'use strict';

  function initGeometricCanvas() {
    let canvas = document.getElementById('bg-canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'bg-canvas';
      document.body.insertBefore(canvas, document.body.firstChild);
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!ctx.roundRect) {
      ctx.roundRect = function (x, y, w, h, radii) {
        let r = typeof radii === 'number' ? radii : (Array.isArray(radii) ? radii[0] : 0);
        r = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
        this.beginPath();
        this.moveTo(x + r, y);
        this.arcTo(x + w, y, x + w, y + h, r);
        this.arcTo(x + w, y + h, x, y + h, r);
        this.arcTo(x, y + h, x, y, r);
        this.arcTo(x, y, x + w, y, r);
        this.closePath();
        return this;
      };
    }

    let width = 0;
    let height = 0;
    let dpr = 1;
    let animId = null;
    let lastTime = performance.now();

    // PlayStation Color Palettes (Triangle = Green, Square = Pink, Circle = Red, Cross = Blue)
    const PALETTES = {
      light: {
        triangle: [60, 175, 125], // PS Green
        square: [230, 80, 135],   // PS Pink
        circle: [232, 72, 72],    // PS Red
        cross: [52, 132, 235],    // PS Blue
        stroke: [38, 36, 33]
      },
      dark: {
        triangle: [85, 215, 155], // PS Neon Green
        square: [248, 115, 170],  // PS Neon Pink
        circle: [248, 98, 98],    // PS Neon Red
        cross: [85, 168, 255],    // PS Neon Blue
        stroke: [237, 233, 226]
      }
    };

    // Color transition interpolation
    let currentThemeMode = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    let themeTransition = currentThemeMode === 'dark' ? 1 : 0; // 0 = light, 1 = dark
    let targetThemeTransition = themeTransition;

    function getInterpolatedColor(colorKey, alpha) {
      const cLight = PALETTES.light[colorKey] || PALETTES.light.mint;
      const cDark = PALETTES.dark[colorKey] || PALETTES.dark.mint;
      const t = themeTransition;
      const r = Math.round(cLight[0] + (cDark[0] - cLight[0]) * t);
      const g = Math.round(cLight[1] + (cDark[1] - cLight[1]) * t);
      const b = Math.round(cLight[2] + (cDark[2] - cLight[2]) * t);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    // Update Theme Observer
    const themeObserver = new MutationObserver(() => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      targetThemeTransition = isDark ? 1 : 0;
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
    }

    // Mouse & Scroll Parallax & Repulsion State
    const mouse = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
      clientX: -9999,
      clientY: -9999,
      active: false
    };
    let scrollY = window.pageYOffset || 0;
    let targetScrollY = scrollY;

    function onPointerMove(clientX, clientY) {
      if (typeof clientX !== 'number' || typeof clientY !== 'number') return;
      mouse.clientX = clientX;
      mouse.clientY = clientY;
      mouse.targetX = (clientX / Math.max(1, width) - 0.5) * 2; // -1 to 1
      mouse.targetY = (clientY / Math.max(1, height) - 0.5) * 2; // -1 to 1
      mouse.active = true;
    }

    // Track mouse & touch with capture to guarantee receiving all events
    const opts = { passive: true, capture: true };
    window.addEventListener('pointermove', (e) => onPointerMove(e.clientX, e.clientY), opts);
    document.addEventListener('pointermove', (e) => onPointerMove(e.clientX, e.clientY), opts);
    window.addEventListener('mousemove', (e) => onPointerMove(e.clientX, e.clientY), opts);
    document.addEventListener('mousemove', (e) => onPointerMove(e.clientX, e.clientY), opts);

    document.addEventListener('mouseleave', () => {
      mouse.active = false;
      mouse.clientX = -9999;
      mouse.clientY = -9999;
    });

    window.addEventListener('blur', () => {
      mouse.active = false;
    });

    window.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches.length > 0) {
        onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, opts);

    window.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches.length > 0) {
        onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, opts);

    window.addEventListener('touchend', () => {
      mouse.active = false;
    });

    window.addEventListener('scroll', () => {
      targetScrollY = window.pageYOffset || document.documentElement.scrollTop;
    }, { passive: true });

    window.addEventListener('resize', resize);
    resize();

    // Geometric Element Definitions
    const colorKeys = ['mint', 'blush', 'lav', 'powder', 'cream'];

    class GeometricElement {
      constructor(type, relX, relY, config = {}) {
        this.type = type;
        this.relX = relX; // 0 to 1
        this.relY = relY; // 0 to 1
        this.x = relX * width;
        this.y = relY * height;
        this.size = config.size || 80;
        this.colorKey = config.colorKey || colorKeys[Math.floor(Math.random() * colorKeys.length)];
        this.fillAlpha = config.fillAlpha !== undefined ? config.fillAlpha : 0.22;
        this.strokeAlpha = config.strokeAlpha !== undefined ? config.strokeAlpha : 0.18;
        this.depth = config.depth || 0.5; // parallax depth factor (0.2 to 1.2)
        
        // Motion dynamics
        this.vx = (config.vx !== undefined ? config.vx : (Math.random() - 0.5) * 0.12);
        this.vy = (config.vy !== undefined ? config.vy : (Math.random() - 0.5) * 0.12);
        this.rotation = config.rotation || Math.random() * Math.PI * 2;
        this.baseVRot = config.vRot !== undefined ? config.vRot : (Math.random() - 0.5) * 0.003;
        this.vRot = this.baseVRot;
        
        // Sine wobble
        this.wobblePhase = Math.random() * Math.PI * 2;
        this.wobbleSpeed = 0.0008 + Math.random() * 0.001;
        this.wobbleRadius = 15 + Math.random() * 25;
        
        // Pulse
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.pulseSpeed = 0.001 + Math.random() * 0.0015;

        // Interactive mouse & peer repulsion physics state
        this.repelX = 0;
        this.repelY = 0;
        this.repelVx = 0;
        this.repelVy = 0;
        this.targetPeerRepelX = 0;
        this.targetPeerRepelY = 0;
        this.currentX = 0;
        this.currentY = 0;

        // Custom properties per type
        this.prop1 = config.prop1 || 0;
        this.prop2 = config.prop2 || 0;
      }

      computePosition(mouseState, scrollOffset) {
        const wobbleX = Math.cos(this.wobblePhase) * this.wobbleRadius;
        const wobbleY = Math.sin(this.wobblePhase * 1.3) * this.wobbleRadius;
        const baseX = this.x + wobbleX + (mouseState.x * this.depth * 35);
        const baseY = this.y + wobbleY + (mouseState.y * this.depth * 25) - (scrollOffset * this.depth * 0.15);
        this.currentX = baseX + this.repelX;
        this.currentY = baseY + this.repelY;
        this.targetPeerRepelX = 0;
        this.targetPeerRepelY = 0;
      }

      update(dt, mouseState, scrollOffset) {
        this.wobblePhase += this.wobbleSpeed * dt;
        this.pulsePhase += this.pulseSpeed * dt;
        this.rotation += this.vRot * (dt / 16.67);

        // Slow ambient drift
        this.x += this.vx * (dt / 16.67);
        this.y += this.vy * (dt / 16.67);

        // Soft velocity damping to maintain calm, elegant slow motion
        const speed = Math.hypot(this.vx, this.vy);
        const maxSpeed = 0.14;
        if (speed > maxSpeed) {
          this.vx = (this.vx / speed) * maxSpeed;
          this.vy = (this.vy / speed) * maxSpeed;
        }

        // Screen boundary wrapping
        const pad = this.size + 160;
        if (this.x < -pad) this.x = width + pad;
        if (this.x > width + pad) this.x = -pad;
        if (this.y < -pad) this.y = height + pad;
        if (this.y > height + pad) this.y = -pad;

        // Interactive magnetic repulsion when mouse cursor is near
        let targetMouseRepelX = 0;
        let targetMouseRepelY = 0;

        if (mouseState.active) {
          const dx = this.currentX - mouseState.clientX;
          const dy = this.currentY - mouseState.clientY;
          const dist = Math.hypot(dx, dy);
          const repelRadius = Math.max(220, this.size * 1.6);

          if (dist < repelRadius) {
            const safeDist = Math.max(dist, 1);
            const norm = 1 - (dist / repelRadius); // 1 at cursor, 0 at boundary
            const pushFactor = Math.pow(norm, 1.2);
            const maxPush = Math.max(100, this.size * 0.95);
            const push = pushFactor * maxPush;

            const nx = dx / safeDist;
            const ny = dy / safeDist;

            targetMouseRepelX = nx * push;
            targetMouseRepelY = ny * push;

            // Angular reaction from cursor
            this.vRot += (nx * (dy / safeDist) - ny * (dx / safeDist)) * pushFactor * 0.001;
          }
        }

        // Combine mouse repulsion and peer mutual repulsion
        const targetTotalRepelX = targetMouseRepelX + this.targetPeerRepelX;
        const targetTotalRepelY = targetMouseRepelY + this.targetPeerRepelY;

        // Responsive spring-damper towards combined displacement
        const spring = 0.12;
        const damping = 0.80;
        this.repelVx += (targetTotalRepelX - this.repelX) * spring;
        this.repelVy += (targetTotalRepelY - this.repelY) * spring;
        this.repelVx *= damping;
        this.repelVy *= damping;

        this.repelX += this.repelVx * (dt / 16.67);
        this.repelY += this.repelVy * (dt / 16.67);

        // Smoothly return rotation velocity to base speed
        this.vRot += (this.baseVRot - this.vRot) * 0.025;
      }

      draw(ctx, mouseOffsetX, mouseOffsetY, scrollOffset) {
        // Base coordinate with wobble, parallax & repulsion offset
        const wobbleX = Math.cos(this.wobblePhase) * this.wobbleRadius;
        const wobbleY = Math.sin(this.wobblePhase * 1.3) * this.wobbleRadius;
        
        const px = this.x + wobbleX + (mouseOffsetX * this.depth * 35) + this.repelX;
        const py = this.y + wobbleY + (mouseOffsetY * this.depth * 25) - (scrollOffset * this.depth * 0.15) + this.repelY;

        // Pulse scale
        const scale = 1 + Math.sin(this.pulsePhase) * 0.06;

        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(this.rotation);
        ctx.scale(scale, scale);

        const strokeColor = getInterpolatedColor(this.colorKey, this.strokeAlpha);
        const lineWidth = Math.max(2.2, this.size * 0.038);

        switch (this.type) {
          case 'triangle':
            this.drawTriangle(ctx, strokeColor, lineWidth);
            break;
          case 'square':
            this.drawSquare(ctx, strokeColor, lineWidth);
            break;
          case 'circle':
            this.drawCircle(ctx, strokeColor, lineWidth);
            break;
          case 'cross':
            this.drawCross(ctx, strokeColor, lineWidth);
            break;
        }

        ctx.restore();
      }

      drawTriangle(ctx, stroke, lineWidth) {
        const r = this.size * 0.54;
        ctx.beginPath();
        // Equilateral triangle pointing up
        ctx.moveTo(0, -r);
        ctx.lineTo(r * 0.866, r * 0.5);
        ctx.lineTo(-r * 0.866, r * 0.5);
        ctx.closePath();
        ctx.strokeStyle = stroke;
        ctx.lineWidth = lineWidth;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.stroke();
      }

      drawSquare(ctx, stroke, lineWidth) {
        const s = this.size * 0.42;
        ctx.beginPath();
        ctx.roundRect(-s, -s, s * 2, s * 2, 5);
        ctx.strokeStyle = stroke;
        ctx.lineWidth = lineWidth;
        ctx.lineJoin = 'round';
        ctx.stroke();
      }

      drawCircle(ctx, stroke, lineWidth) {
        const r = this.size * 0.46;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.strokeStyle = stroke;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
      }

      drawCross(ctx, stroke, lineWidth) {
        const d = this.size * 0.40;
        ctx.beginPath();
        ctx.moveTo(-d, -d);
        ctx.lineTo(d, d);
        ctx.moveTo(-d, d);
        ctx.lineTo(d, -d);
        ctx.strokeStyle = stroke;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.stroke();
      }
    }

    // Curated layout of hollow PlayStation shapes across the canvas
    const elements = [
      // Top left
      new GeometricElement('triangle', 0.12, 0.18, {
        size: 95,
        colorKey: 'triangle',
        strokeAlpha: 0.46,
        depth: 0.4,
        vx: 0.03,
        vy: -0.02,
        vRot: 0.001
      }),
      new GeometricElement('cross', 0.08, 0.45, {
        size: 80,
        colorKey: 'cross',
        strokeAlpha: 0.44,
        depth: 0.8,
        vx: 0.02,
        vy: 0.03,
        vRot: -0.0015
      }),

      // Top right
      new GeometricElement('circle', 0.86, 0.16, {
        size: 100,
        colorKey: 'circle',
        strokeAlpha: 0.46,
        depth: 0.45,
        vx: -0.03,
        vy: 0.02,
        vRot: 0.0008
      }),
      new GeometricElement('square', 0.78, 0.38, {
        size: 85,
        colorKey: 'square',
        strokeAlpha: 0.44,
        depth: 0.7,
        vx: -0.02,
        vy: -0.03,
        vRot: 0.0012
      }),

      // Center area (calm background)
      new GeometricElement('triangle', 0.45, 0.26, {
        size: 80,
        colorKey: 'triangle',
        strokeAlpha: 0.38,
        depth: 0.35,
        vx: 0.02,
        vy: 0.02,
        vRot: -0.001
      }),
      new GeometricElement('cross', 0.62, 0.48, {
        size: 90,
        colorKey: 'cross',
        strokeAlpha: 0.42,
        depth: 0.5,
        vx: 0.03,
        vy: -0.02,
        vRot: 0.0014
      }),

      // Mid left
      new GeometricElement('square', 0.22, 0.65, {
        size: 90,
        colorKey: 'square',
        strokeAlpha: 0.44,
        depth: 0.55,
        vx: 0.02,
        vy: -0.03,
        vRot: -0.0012
      }),

      // Mid / lower right
      new GeometricElement('circle', 0.84, 0.68, {
        size: 95,
        colorKey: 'circle',
        strokeAlpha: 0.44,
        depth: 0.6,
        vx: -0.03,
        vy: 0.02,
        vRot: 0.001
      }),
      new GeometricElement('triangle', 0.68, 0.82, {
        size: 85,
        colorKey: 'triangle',
        strokeAlpha: 0.40,
        depth: 0.75,
        vx: 0.02,
        vy: 0.03,
        vRot: -0.0015
      }),

      // Bottom left / footer
      new GeometricElement('cross', 0.15, 0.86, {
        size: 85,
        colorKey: 'cross',
        strokeAlpha: 0.42,
        depth: 0.5,
        vx: 0.03,
        vy: 0.02,
        vRot: 0.0012
      }),
      new GeometricElement('circle', 0.38, 0.88, {
        size: 100,
        colorKey: 'circle',
        strokeAlpha: 0.44,
        depth: 0.4,
        vx: -0.02,
        vy: -0.02,
        vRot: -0.0008
      }),
      new GeometricElement('square', 0.52, 0.72, {
        size: 80,
        colorKey: 'square',
        strokeAlpha: 0.40,
        depth: 0.5,
        vx: -0.02,
        vy: 0.03,
        vRot: 0.0015
      })
    ];

    // Main Animation Loop
    function render(currentTime) {
      animId = requestAnimationFrame(render);

      const dt = Math.min(currentTime - lastTime, 64); // clamp for tab switching
      lastTime = currentTime;

      // Smooth theme color transition
      if (Math.abs(themeTransition - targetThemeTransition) > 0.001) {
        themeTransition += (targetThemeTransition - themeTransition) * 0.08;
      } else {
        themeTransition = targetThemeTransition;
      }

      // Smooth mouse interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      // Smooth scroll interpolation
      scrollY += (targetScrollY - scrollY) * 0.1;

      // Clear Canvas
      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      // 1. Precompute current rendered positions for all elements
      for (let i = 0; i < elements.length; i++) {
        elements[i].computePosition(mouse, scrollY);
      }

      // 2. Pairwise mutual repulsion pass (prevent clutter and keep elements away from each other)
      for (let i = 0; i < elements.length; i++) {
        const elA = elements[i];
        for (let j = i + 1; j < elements.length; j++) {
          const elB = elements[j];

          const dx = elA.currentX - elB.currentX;
          const dy = elA.currentY - elB.currentY;
          const dist = Math.hypot(dx, dy);

          // Generous comfort spacing based on both elements' sizes
          const minDist = (elA.size + elB.size) * 0.70 + 80;

          if (dist < minDist && dist > 0.01) {
            const safeDist = Math.max(dist, 1);
            const nx = dx / safeDist;
            const ny = dy / safeDist;
            const overlap = minDist - dist;
            const norm = overlap / minDist; // 0 to 1

            // Dynamic steering on drift velocity
            const steer = norm * 0.015;
            elA.vx += nx * steer;
            elA.vy += ny * steer;
            elB.vx -= nx * steer;
            elB.vy -= ny * steer;

            // Elastic separation force to immediately prevent visual clutter
            const push = Math.pow(norm, 1.3) * 85;
            elA.targetPeerRepelX += nx * push;
            elA.targetPeerRepelY += ny * push;
            elB.targetPeerRepelX -= nx * push;
            elB.targetPeerRepelY -= ny * push;

            // Subtle angular diversion
            elA.vRot += (nx * ny) * 0.0003;
            elB.vRot -= (nx * ny) * 0.0003;
          }
        }
      }

      // 3. Update physics and draw elements
      for (let i = 0; i < elements.length; i++) {
        const el = elements[i];
        el.update(dt, mouse, scrollY);
        el.draw(ctx, mouse.x, mouse.y, scrollY);
      }

      ctx.restore();
    }

    window.__bgCanvas = { mouse, elements };
    animId = requestAnimationFrame(render);

    // Handle tab visibility to save power when inactive
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (animId) cancelAnimationFrame(animId);
      } else {
        lastTime = performance.now();
        animId = requestAnimationFrame(render);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGeometricCanvas);
  } else {
    initGeometricCanvas();
  }
})();
