/**
 * Subtle 3D tilt and holographic shine for cards on hover.
 * Uses the CSS `rotate` property so it stacks with the existing hover lift
 * (which uses `transform`) instead of replacing it.
 *
 * Light mode: a white glare can't brighten white cards, so depth comes from a
 * moving shadow plus a faint shade on the far side. Dark mode keeps the glow.
 */

(function () {
  'use strict';

  if (!window.matchMedia) return;

  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const SELECTOR = 'main article, main [data-tilt]';
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
      /* Light mode: normal blending so glare, sheen and shade stay visible on white */
      mix-blend-mode: normal;
      background:
        radial-gradient(circle at var(--tilt-gx, 50%) var(--tilt-gy, 50%), rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0) 38%),
        linear-gradient(115deg, rgba(255, 255, 255, 0) 30%, rgba(255, 110, 180, 0.09) 42%, rgba(90, 190, 255, 0.09) 50%, rgba(255, 200, 90, 0.09) 58%, rgba(255, 255, 255, 0) 70%),
        radial-gradient(circle at var(--tilt-sx, 50%) var(--tilt-sy, 50%), rgba(38, 36, 33, 0.09), rgba(38, 36, 33, 0) 70%);
      background-size: 100% 100%, 260% 260%, 100% 100%;
      background-position: 0 0, var(--tilt-hx, 50%) var(--tilt-hy, 50%), 0 0;
    }
    html[data-theme="dark"] .tilt-shine {
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

  const REST = { rx: 0, ry: 0, gx: 50, gy: 50, hx: 50, hy: 50, lift: 0 };

  function isDark() {
    return document.documentElement.getAttribute('data-theme') === 'dark';
  }

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
      states.set(card, { cur: Object.assign({}, REST), tgt: Object.assign({}, REST) });
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
    s.tgt.lift = 1;
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
    if (s) Object.assign(s.tgt, REST);
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
    const dark = isDark();

    for (const [card, s] of states) {
      const c = s.cur;
      const t = s.tgt;
      for (const key in c) c[key] += (t[key] - c[key]) * k;

      const angle = Math.hypot(c.rx, c.ry);
      const settled = card !== active && angle < 0.02 && c.lift < 0.01;
      if (settled) {
        card.style.rotate = '';
        card.style.boxShadow = '';
        states.delete(card);
        continue;
      }

      // Rotation about the (rx, ry, 0) axis equals a small rotateX + rotateY tilt
      card.style.rotate = angle < 0.001 ? '' : (c.rx / angle).toFixed(4) + ' ' + (c.ry / angle).toFixed(4) + ' 0 ' + angle.toFixed(3) + 'deg';

      // Shadow falls away from the raised edge; stronger in light mode where it carries the depth
      const sx = -c.ry * 2.2;
      const sy = c.rx * 2.2 + 14 * c.lift;
      const alpha = (dark ? 0.45 : 0.16) * c.lift;
      const soft = (dark ? 0.3 : 0.08) * c.lift;
      card.style.boxShadow =
        sx.toFixed(1) + 'px ' + sy.toFixed(1) + 'px ' + (34 * c.lift + 6).toFixed(0) + 'px -10px rgba(' + (dark ? '0, 0, 0' : '38, 36, 33') + ', ' + alpha.toFixed(3) + '), ' +
        '0 2px 6px rgba(' + (dark ? '0, 0, 0' : '38, 36, 33') + ', ' + soft.toFixed(3) + ')';

      card.style.setProperty('--tilt-gx', c.gx.toFixed(1) + '%');
      card.style.setProperty('--tilt-gy', c.gy.toFixed(1) + '%');
      card.style.setProperty('--tilt-sx', (100 - c.gx).toFixed(1) + '%');
      card.style.setProperty('--tilt-sy', (100 - c.gy).toFixed(1) + '%');
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
