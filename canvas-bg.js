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

    // Theme Color Palettes (RGB tuples for smooth interpolation)
    const PALETTES = {
      light: {
        mint: [207, 232, 219],
        blush: [246, 218, 223],
        lav: [223, 217, 243],
        powder: [213, 228, 241],
        cream: [243, 233, 216],
        stroke: [38, 36, 33],
        accent: [75, 70, 64]
      },
      dark: {
        mint: [169, 211, 194],
        blush: [231, 190, 197],
        lav: [196, 187, 228],
        powder: [178, 203, 224],
        cream: [225, 207, 174],
        stroke: [237, 233, 226],
        accent: [210, 205, 198]
      }
    };

    // Color transition interpolation
    let currentThemeMode = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    let themeTransition = currentThemeMode === 'dark' ? 1 : 0; // 0 = light, 1 = dark
    let targetThemeTransition = themeTransition;

    function getInterpolatedColor(colorKey, alphaLight, alphaDark) {
      const cLight = PALETTES.light[colorKey] || PALETTES.light.mint;
      const cDark = PALETTES.dark[colorKey] || PALETTES.dark.mint;
      const t = themeTransition;
      const r = Math.round(cLight[0] + (cDark[0] - cLight[0]) * t);
      const g = Math.round(cLight[1] + (cDark[1] - cLight[1]) * t);
      const b = Math.round(cLight[2] + (cDark[2] - cLight[2]) * t);
      const aL = typeof alphaLight === 'number' ? alphaLight : 0.35;
      const aD = typeof alphaDark === 'number' ? alphaDark : aL;
      const a = (aL + (aD - aL) * t).toFixed(3);
      return `rgba(${r}, ${g}, ${b}, ${a})`;
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
    let lastMouseX = -9999;
    let lastMouseY = -9999;
    let mouseSpeed = 0;

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
      if (lastMouseX !== -9999) {
        const mdx = clientX - lastMouseX;
        const mdy = clientY - lastMouseY;
        mouseSpeed = Math.hypot(mdx, mdy);
      }
      lastMouseX = clientX;
      lastMouseY = clientY;
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
      constructor(type, posX, posY, config = {}) {
        this.type = type;
        this.size = config.size || 80;
        // Accept absolute coordinates (e.g. from hero random position) or relative proportions
        if (typeof posX === 'number') {
          this.x = posX > 1 ? posX : posX * (width || window.innerWidth || 1200);
        } else {
          this.x = (width || window.innerWidth || 1200) * 0.5;
        }
        if (typeof posY === 'number') {
          this.y = posY > 1 ? posY : posY * (height || window.innerHeight || 800);
        } else {
          this.y = (height || window.innerHeight || 800) * 0.3;
        }

        this.colorKey = config.colorKey || colorKeys[Math.floor(Math.random() * colorKeys.length)];
        this.fillAlphaLight = config.fillAlphaLight !== undefined ? config.fillAlphaLight : (config.fillAlpha !== undefined ? config.fillAlpha : 0.45);
        this.fillAlphaDark = config.fillAlphaDark !== undefined ? config.fillAlphaDark : (config.fillAlpha !== undefined ? config.fillAlpha : 0.22);
        this.strokeAlphaLight = config.strokeAlphaLight !== undefined ? config.strokeAlphaLight : (config.strokeAlpha !== undefined ? config.strokeAlpha : 0.35);
        this.strokeAlphaDark = config.strokeAlphaDark !== undefined ? config.strokeAlphaDark : (config.strokeAlpha !== undefined ? config.strokeAlpha : 0.25);
        this.depth = config.depth || 0.4;
        
        // Base slow ambient velocity (calm, elegant, minimal motion when idle)
        this.baseSpeed = config.baseSpeed !== undefined ? config.baseSpeed : 0.12;
        const initialAngle = config.angle !== undefined ? config.angle : Math.random() * Math.PI * 2;
        this.vx = Math.cos(initialAngle) * this.baseSpeed;
        this.vy = Math.sin(initialAngle) * this.baseSpeed;
        
        this.rotation = config.rotation || Math.random() * Math.PI * 2;
        this.baseVRot = config.vRot !== undefined ? config.vRot : (Math.random() - 0.5) * 0.0008;
        this.vRot = this.baseVRot;

        // Gentle organic sine wobble & pulse (subtle amplitude so drift feels smooth and slow)
        this.wobblePhase = Math.random() * Math.PI * 2;
        this.wobbleSpeed = 0.0004 + Math.random() * 0.0004;
        this.wobbleRadius = 4 + Math.random() * 4;
        
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.pulseSpeed = 0.0008 + Math.random() * 0.0006;

        // Visual position coordinates
        this.currentX = this.x;
        this.currentY = this.y;

        // Custom properties per type
        this.prop1 = config.prop1 || 0;
        this.prop2 = config.prop2 || 0;
      }

      computePosition(mouseState) {
        const wobbleX = Math.cos(this.wobblePhase) * this.wobbleRadius;
        const wobbleY = Math.sin(this.wobblePhase * 1.3) * this.wobbleRadius;
        const parallaxX = mouseState.x * this.depth * 10;
        const parallaxY = mouseState.y * this.depth * 10;
        this.currentX = this.x + wobbleX + parallaxX;
        this.currentY = this.y + wobbleY + parallaxY;
      }

      update(dt, mouseState, mouseSpeed) {
        const timeFactor = Math.min(dt / 16.67, 3);
        this.wobblePhase += this.wobbleSpeed * dt;
        this.pulsePhase += this.pulseSpeed * dt;
        this.rotation += this.vRot * timeFactor;

        // 1. Mouse Repulsion: upon mouse movement/proximity, gently repel and guide anywhere on canvas
        if (mouseState.active && mouseState.clientX > -1000) {
          const dx = this.currentX - mouseState.clientX;
          const dy = this.currentY - mouseState.clientY;
          const dist = Math.hypot(dx, dy);
          // Intuitive repulsion zone scaled to shape size
          const repelRadius = Math.max(160, this.size * 1.6);

          if (dist < repelRadius && dist > 0.01) {
            const safeDist = Math.max(dist, 1);
            const nx = dx / safeDist;
            const ny = dy / safeDist;

            // Proximity factor: 1 at cursor center, 0 at outer perimeter
            const norm = 1 - (dist / repelRadius);
            
            // Repulsion responds smoothly to cursor motion and proximity
            const motionFactor = 1 + Math.min((mouseSpeed || 0) * 0.06, 1.0);
            const pushAccel = Math.pow(norm, 1.3) * 0.42 * motionFactor * timeFactor;
            this.vx += nx * pushAccel;
            this.vy += ny * pushAccel;

            // Soft core separation to prevent cursor from passing right through
            const coreRadius = this.size * 0.65;
            if (dist < coreRadius) {
              const directPush = (coreRadius - dist) * 0.14 * timeFactor;
              this.x += nx * directPush;
              this.y += ny * directPush;
            }

            // Gentle rotational deflection from repulsion
            this.vRot += (nx * (dy / safeDist) - ny * (dx / safeDist)) * norm * 0.0006 * timeFactor;
          }
        }

        // 2. Boundary Repulsion & Crisp Bounce: boundaries actively repel shapes and provide energetic bounce
        const pad = this.size * 0.5 + 8;
        const boundaryZone = Math.max(140, this.size * 1.6);

        // --- Left Boundary ---
        if (this.x < boundaryZone) {
          const norm = Math.max(0, 1 - (this.x / boundaryZone));
          // Strong inward repulsion from wall
          const repelForce = Math.pow(norm, 1.1) * 1.4 * timeFactor;
          this.vx += repelForce;
          
          // Energetic bounce if reaching edge
          if (this.x <= pad) {
            this.x = pad;
            this.vx = Math.max(Math.abs(this.vx) * 1.2 + 0.6, 1.4);
            this.vRot += (Math.random() - 0.5) * 0.006;
          }
        }

        // --- Right Boundary ---
        const distRight = width - this.x;
        if (distRight < boundaryZone) {
          const norm = Math.max(0, 1 - (distRight / boundaryZone));
          const repelForce = Math.pow(norm, 1.1) * 1.4 * timeFactor;
          this.vx -= repelForce;
          
          if (this.x >= width - pad) {
            this.x = width - pad;
            this.vx = -Math.max(Math.abs(this.vx) * 1.2 + 0.6, 1.4);
            this.vRot += (Math.random() - 0.5) * 0.006;
          }
        }

        // --- Top Boundary ---
        if (this.y < boundaryZone) {
          const norm = Math.max(0, 1 - (this.y / boundaryZone));
          const repelForce = Math.pow(norm, 1.1) * 1.4 * timeFactor;
          this.vy += repelForce;
          
          if (this.y <= pad) {
            this.y = pad;
            this.vy = Math.max(Math.abs(this.vy) * 1.2 + 0.6, 1.4);
            this.vRot += (Math.random() - 0.5) * 0.006;
          }
        }

        // --- Bottom Boundary ---
        const distBottom = height - this.y;
        if (distBottom < boundaryZone) {
          const norm = Math.max(0, 1 - (distBottom / boundaryZone));
          const repelForce = Math.pow(norm, 1.1) * 1.4 * timeFactor;
          this.vy -= repelForce;
          
          if (this.y >= height - pad) {
            this.y = height - pad;
            this.vy = -Math.max(Math.abs(this.vy) * 1.2 + 0.6, 1.4);
            this.vRot += (Math.random() - 0.5) * 0.006;
          }
        }

        // 3. Velocity damping: speeds stay smooth and fluidly ease back to calm drift
        const currentSpeed = Math.hypot(this.vx, this.vy);
        const maxSpeed = 3.0; // Responsive cap allowing bouncy impulses
        if (currentSpeed > maxSpeed) {
          this.vx = (this.vx / currentSpeed) * maxSpeed;
          this.vy = (this.vy / currentSpeed) * maxSpeed;
        }

        if (currentSpeed > this.baseSpeed) {
          // Smooth fluid deceleration back to gentle drift
          const friction = Math.pow(0.972, timeFactor);
          this.vx *= friction;
          this.vy *= friction;
        } else if (currentSpeed < 0.03) {
          // Keep gently drifting, never freeze completely
          const angle = Math.random() * Math.PI * 2;
          this.vx = Math.cos(angle) * this.baseSpeed;
          this.vy = Math.sin(angle) * this.baseSpeed;
        }

        // 4. Update canvas position freely across entire viewport
        this.x += this.vx * timeFactor;
        this.y += this.vy * timeFactor;

        // Ensure within bounds
        this.x = Math.max(pad, Math.min(width - pad, this.x));
        this.y = Math.max(pad, Math.min(height - pad, this.y));

        // Restore rotation velocity smoothly to baseline
        this.vRot += (this.baseVRot - this.vRot) * 0.02 * timeFactor;
      }

      draw(ctx, mouseOffsetX, mouseOffsetY) {
        const wobbleX = Math.cos(this.wobblePhase) * this.wobbleRadius;
        const wobbleY = Math.sin(this.wobblePhase * 1.3) * this.wobbleRadius;
        const parallaxX = mouseOffsetX * this.depth * 15;
        const parallaxY = mouseOffsetY * this.depth * 15;
        
        const px = this.x + wobbleX + parallaxX;
        const py = this.y + wobbleY + parallaxY;

        // Clean uniform scale preserving pure geometric shape with zero distortion
        const scale = 1 + Math.sin(this.pulsePhase) * 0.03;

        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(this.rotation);
        ctx.scale(scale, scale);

        const fillColor = getInterpolatedColor(this.colorKey, this.fillAlphaLight, this.fillAlphaDark);
        const strokeColor = getInterpolatedColor('stroke', this.strokeAlphaLight, this.strokeAlphaDark);

        switch (this.type) {
          case 'circle':
            this.drawCircle(ctx, fillColor, strokeColor);
            break;
          case 'square':
            this.drawSquare(ctx, fillColor, strokeColor);
            break;
          case 'plus':
          case 'cross':
          case 'swissCross':
            this.drawPlus(ctx, strokeColor);
            break;
        }

        ctx.restore();
      }

      drawCircle(ctx, fill, stroke) {
        const r = this.size * 0.5;
        // Soft minimal filled circle
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fillStyle = fill;
        ctx.fill();

        // Distinct border stroke
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.strokeStyle = stroke;
        ctx.lineWidth = 1.4;
        ctx.stroke();
      }

      drawSquare(ctx, fill, stroke) {
        const s = this.size;
        const half = s * 0.5;
        const r = this.prop1 !== undefined ? this.prop1 : 6;
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(-half, -half, s, s, r);
        } else {
          ctx.rect(-half, -half, s, s);
        }
        ctx.fillStyle = fill;
        ctx.fill();

        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(-half, -half, s, s, r);
        } else {
          ctx.rect(-half, -half, s, s);
        }
        ctx.strokeStyle = stroke;
        ctx.lineWidth = 1.4;
        ctx.stroke();
      }

      drawPlus(ctx, stroke) {
        const arm = this.size * 0.5;
        const thick = 2.0;

        ctx.strokeStyle = stroke;
        ctx.lineWidth = thick;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(-arm, 0);
        ctx.lineTo(arm, 0);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, -arm);
        ctx.lineTo(0, arm);
        ctx.stroke();
      }
    }

    // Calculate hero section boundaries within the viewport
    function getHeroBounds() {
      const header = document.querySelector('header');
      const w = width || window.innerWidth || 1200;
      const h = height || window.innerHeight || 800;
      let top = 40;
      let bottom = Math.min(h * 0.72, 560);
      let left = 40;
      let right = w - 40;

      if (header) {
        const rect = header.getBoundingClientRect();
        // The canvas is fixed, so rect.top and rect.bottom give screen coordinates
        top = Math.max(30, rect.top);
        bottom = Math.min(h - 30, Math.max(top + 280, rect.bottom + 10));
        left = Math.max(30, rect.left - 20);
        right = Math.min(w - 30, Math.max(rect.right + 60, w - 40));
      }

      if (bottom <= top + 150) {
        bottom = Math.min(h - 30, top + 320);
      }
      if (right <= left + 150) {
        left = 40;
        right = w - 40;
      }

      return { left, right, top, bottom };
    }

    // Pick a well-spaced random coordinate strictly within the hero section
    function getRandomHeroPosition(size, placedElements = []) {
      const bounds = getHeroBounds();
      const half = size * 0.5;
      const minX = Math.max(half + 15, bounds.left + half);
      const maxX = Math.min((width || window.innerWidth || 1200) - half - 15, bounds.right - half);
      const minY = Math.max(half + 15, bounds.top + half);
      const maxY = Math.min((height || window.innerHeight || 800) - half - 15, bounds.bottom - half);

      const safeMinX = Math.min(minX, maxX);
      const safeMaxX = Math.max(minX, maxX);
      const safeMinY = Math.min(minY, maxY);
      const safeMaxY = Math.max(minY, maxY);

      let bestX = safeMinX + Math.random() * (safeMaxX - safeMinX);
      let bestY = safeMinY + Math.random() * (safeMaxY - safeMinY);
      let maxMinDist = -1;

      // Try multiple random attempts to ensure good initial distribution
      for (let attempt = 0; attempt < 30; attempt++) {
        const candidateX = safeMinX + Math.random() * (safeMaxX - safeMinX);
        const candidateY = safeMinY + Math.random() * (safeMaxY - safeMinY);

        if (placedElements.length === 0) {
          bestX = candidateX;
          bestY = candidateY;
          break;
        }

        let minDist = Infinity;
        for (let i = 0; i < placedElements.length; i++) {
          const el = placedElements[i];
          const d = Math.hypot(candidateX - el.x, candidateY - el.y);
          if (d < minDist) minDist = d;
        }

        const preferredSpacing = (size + 80) * 0.75;
        if (minDist >= preferredSpacing) {
          bestX = candidateX;
          bestY = candidateY;
          break;
        }

        if (minDist > maxMinDist) {
          maxMinDist = minDist;
          bestX = candidateX;
          bestY = candidateY;
        }
      }

      return { x: bestX, y: bestY };
    }

    // Background geometric elements: floating circle, square, and plus
    // Default initial placement is randomly inside the hero section only
    const elements = [];

    // 1. Clean background circle
    const circlePos = getRandomHeroPosition(110, elements);
    const circleEl = new GeometricElement('circle', circlePos.x, circlePos.y, {
      size: 110,
      colorKey: 'mint',
      fillAlphaLight: 0.52,
      fillAlphaDark: 0.25,
      strokeAlphaLight: 0.35,
      strokeAlphaDark: 0.28,
      depth: 0.35,
      baseSpeed: 0.12,
      angle: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 0.0006
    });
    elements.push(circleEl);

    // 2. Clean floating square
    const squarePos = getRandomHeroPosition(78, elements);
    const squareEl = new GeometricElement('square', squarePos.x, squarePos.y, {
      size: 78,
      colorKey: 'lav',
      fillAlphaLight: 0.48,
      fillAlphaDark: 0.22,
      strokeAlphaLight: 0.35,
      strokeAlphaDark: 0.28,
      depth: 0.40,
      baseSpeed: 0.11,
      angle: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 0.0006,
      prop1: 8
    });
    elements.push(squareEl);

    // 3. Clean plus shape
    const plusPos = getRandomHeroPosition(36, elements);
    const plusEl = new GeometricElement('plus', plusPos.x, plusPos.y, {
      size: 36,
      colorKey: 'stroke',
      strokeAlphaLight: 0.45,
      strokeAlphaDark: 0.30,
      depth: 0.45,
      baseSpeed: 0.13,
      angle: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 0.0008
    });
    elements.push(plusEl);

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

      // Decay mouse movement momentum
      mouseSpeed *= 0.88;

      // Smooth scroll interpolation
      scrollY += (targetScrollY - scrollY) * 0.1;

      // Clear Canvas
      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      // 1. Precompute current rendered positions for all elements
      for (let i = 0; i < elements.length; i++) {
        elements[i].computePosition(mouse);
      }

      // 2. Active Shape-to-Shape Repulsion (objects actively repel each other when near without changing shape)
      for (let i = 0; i < elements.length; i++) {
        const elA = elements[i];
        for (let j = i + 1; j < elements.length; j++) {
          const elB = elements[j];

          const dx = elA.currentX - elB.currentX;
          const dy = elA.currentY - elB.currentY;
          const dist = Math.hypot(dx, dy);

          // Generous mutual repulsion field so shapes actively steer and repel away from each other
          const repelDist = (elA.size + elB.size) * 0.95 + 60;

          if (dist < repelDist && dist > 0.01) {
            const safeDist = Math.max(dist, 1);
            const nx = dx / safeDist;
            const ny = dy / safeDist;

            // Proportional repulsion force
            const norm = 1 - (dist / repelDist);
            const repelPush = Math.pow(norm, 1.3) * 0.70;

            elA.vx += nx * repelPush;
            elA.vy += ny * repelPush;
            elB.vx -= nx * repelPush;
            elB.vy -= ny * repelPush;

            // Core proximity extra repulsion
            const coreDist = (elA.size + elB.size) * 0.65;
            if (dist < coreDist) {
              const coreNorm = 1 - (dist / coreDist);
              const corePush = Math.pow(coreNorm, 1.2) * 0.85;
              elA.vx += nx * corePush;
              elA.vy += ny * corePush;
              elB.vx -= nx * corePush;
              elB.vy -= ny * corePush;

              // Physical separation to guarantee shapes never overlap
              const minAllowed = (elA.size + elB.size) * 0.52;
              if (dist < minAllowed) {
                const sep = (minAllowed - dist) * 0.5;
                elA.x += nx * sep;
                elA.y += ny * sep;
                elB.x -= nx * sep;
                elB.y -= ny * sep;

                // Elastic velocity rebound
                const rvx = elA.vx - elB.vx;
                const rvy = elA.vy - elB.vy;
                const velAlongNormal = rvx * nx + rvy * ny;
                if (velAlongNormal < 0) {
                  const bounceImpulse = -velAlongNormal * 0.85;
                  elA.vx += nx * bounceImpulse;
                  elA.vy += ny * bounceImpulse;
                  elB.vx -= nx * bounceImpulse;
                  elB.vy -= ny * bounceImpulse;
                }
              }
            }

            // Gentle angular diversion without deforming geometry
            elA.vRot += (nx * ny) * 0.0001;
            elB.vRot -= (nx * ny) * 0.0001;
          }
        }
      }

      // 3. Update physics and draw elements
      for (let i = 0; i < elements.length; i++) {
        const el = elements[i];
        el.update(dt, mouse, mouseSpeed);
        el.draw(ctx, mouse.x, mouse.y);
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
