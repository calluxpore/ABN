/**
 * Subtle 3D tilt and holographic shine for cards on hover.
 * Uses the CSS `rotate` property so it stacks with the existing hover lift
 * (which uses `transform`) instead of replacing it.
 */

(function () {
  'use strict';

  if (!window.matchMedia) return;

  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const SELECTOR = 'main article';
  const MAX_TILT = 4;         // degrees at the card edge
  const PERSPECTIVE = 1000;   // px
  const FOLLOW = 12;          // smoothing rate, 1/s

  const style = document.createElement('style');
  style.textContent = `
    .tilt-shine {
      position: absolute;
      inset: 0;
      z-index: 2;
      border-radius: inherit;
      pointer-events: none;
      opacity: 0;
      transition: opacity 350ms ease;
      mix-blend-mode: soft-light;
      background:
        radial-gradient(circle at var(--tilt-gx, 50%) var(--tilt-gy, 50%), rgba(255, 255, 255, 0.55), rgba(255, 255, 255, 0) 55%),
        linear-gradient(115deg, rgba(255, 255, 255, 0) 30%, rgba(255, 120, 190, 0.22) 42%, rgba(120, 210, 255, 0.22) 50%, rgba(255, 225, 130, 0.22) 58%, rgba(255, 255, 255, 0) 70%);
      background-size: 100% 100%, 260% 260%;
      background-position: 0 0, var(--tilt-hx, 50%) var(--tilt-hy, 50%);
    }
    .tilt-active > .tilt-shine { opacity: 1; }
  `;
  document.head.appendChild(style);

  const states = new Map(); // card -> { cur, tgt }
  let active = null;
  let rafId = null;
  let last = 0;

  function prepare(card) {
    if (!card.querySelector(':scope > .tilt-shine')) {
      const shine = document.createElement('span');
      shine.className = 'tilt-shine';
      shine.setAttribute('aria-hidden', 'true');
      card.appendChild(shine);
    }
    if (getComputedStyle(card).position === 'static') card.style.position = 'relative';

    // Perspective on the parent, centred on this card, so grids with many cards don't distort
    const parent = card.parentElement;
    if (parent) {
      const r = card.getBoundingClientRect();
      const p = parent.getBoundingClientRect();
      parent.style.perspective = PERSPECTIVE + 'px';
      parent.style.perspectiveOrigin = (r.left - p.left + r.width / 2) + 'px ' + (r.top - p.top + r.height / 2) + 'px';
    }

    if (!states.has(card)) {
      states.set(card, {
        cur: { rx: 0, ry: 0, gx: 50, gy: 50, hx: 50, hy: 50 },
        tgt: { rx: 0, ry: 0, gx: 50, gy: 50, hx: 50, hy: 50 }
      });
    }
    return states.get(card);
  }

  function aim(card, x, y) {
    const s = states.get(card);
    const r = card.getBoundingClientRect();
    if (!s || !r.width || !r.height) return;
    const px = Math.min(Math.max((x - r.left) / r.width, 0), 1);
    const py = Math.min(Math.max((y - r.top) / r.height, 0), 1);
    s.tgt.ry = (px - 0.5) * 2 * MAX_TILT;
    s.tgt.rx = -(py - 0.5) * 2 * MAX_TILT;
    s.tgt.gx = px * 100;
    s.tgt.gy = py * 100;
    s.tgt.hx = 50 + (px - 0.5) * 70;
    s.tgt.hy = 50 + (py - 0.5) * 70;
  }

  function enter(card, x, y) {
    prepare(card);
    card.classList.add('tilt-active');
    aim(card, x, y);
    run();
  }

  function leave(card) {
    const s = states.get(card);
    card.classList.remove('tilt-active');
    if (s) Object.assign(s.tgt, { rx: 0, ry: 0, gx: 50, gy: 50, hx: 50, hy: 50 });
    run();
  }

  function run() {
    if (rafId) return;
    last = performance.now();
    rafId = requestAnimationFrame(frame);
  }

  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    const k = 1 - Math.exp(-FOLLOW * dt);

    for (const [card, s] of states) {
      const c = s.cur;
      const t = s.tgt;
      for (const key in c) c[key] += (t[key] - c[key]) * k;

      const angle = Math.hypot(c.rx, c.ry);
      const settled = card !== active && angle < 0.02 && Math.abs(c.gx - 50) < 0.5 && Math.abs(c.gy - 50) < 0.5;
      if (settled) {
        card.style.rotate = '';
        states.delete(card);
        continue;
      }
      // Rotation about the (rx, ry, 0) axis equals a small rotateX + rotateY tilt
      card.style.rotate = angle < 0.001 ? '' : (c.rx / angle).toFixed(4) + ' ' + (c.ry / angle).toFixed(4) + ' 0 ' + angle.toFixed(3) + 'deg';
      card.style.setProperty('--tilt-gx', c.gx.toFixed(1) + '%');
      card.style.setProperty('--tilt-gy', c.gy.toFixed(1) + '%');
      card.style.setProperty('--tilt-hx', c.hx.toFixed(1) + '%');
      card.style.setProperty('--tilt-hy', c.hy.toFixed(1) + '%');
    }

    rafId = states.size ? requestAnimationFrame(frame) : null;
  }

  function enabled(e) {
    return finePointer.matches && !reducedMotion.matches && (!e || e.pointerType === 'mouse' || e.pointerType === 'pen');
  }

  document.addEventListener('pointermove', (e) => {
    if (!enabled(e)) {
      if (active) { leave(active); active = null; }
      return;
    }
    const card = e.target instanceof Element ? e.target.closest(SELECTOR) : null;
    if (card !== active) {
      if (active) leave(active);
      active = card;
      if (card) enter(card, e.clientX, e.clientY);
    } else if (card) {
      aim(card, e.clientX, e.clientY);
      run();
    }
  }, { passive: true });

  function release() {
    if (active) { leave(active); active = null; }
  }
  document.documentElement.addEventListener('mouseleave', release);
  window.addEventListener('blur', release);
})();
