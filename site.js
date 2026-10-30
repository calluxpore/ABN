// Album pages lift in as they reach the screen. Content is visible without script; this only adds the arrival.
(() => {
  const pages = document.querySelectorAll('.lift');
  if (!pages.length || !('IntersectionObserver' in window)) { pages.forEach((p) => p.classList.add('is-in')); return; }
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }, { rootMargin: '0px 0px -60px 0px' });
  pages.forEach((p) => io.observe(p));
  // a jump (a tab link, End) can pass a page between observer frames; anything above the screen's foot has been reached
  const sweep = () => pages.forEach((p) => { if (p.getBoundingClientRect().top < innerHeight) p.classList.add('is-in'); });
  addEventListener('scroll', () => requestAnimationFrame(sweep), { passive: true });
  addEventListener('load', sweep);
})();

// Respect reduced motion for the looping save-the-date teaser.
(() => {
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.querySelectorAll('video[autoplay]').forEach((v) => { v.removeAttribute('autoplay'); v.pause(); });
})();

// On the phone strip of tabs, bring the current project's tab into view.
(() => {
  const strip = document.querySelector('.case .tabs');
  const current = strip && strip.querySelector('[aria-current="page"]');
  if (!current || strip.scrollWidth <= strip.clientWidth) return;
  strip.scrollLeft = current.offsetLeft - strip.offsetLeft - 16;
})();

// Light and dark mode. The choice is remembered; until one is made, the device setting decides.
(() => {
  const btn = document.querySelector('[data-theme-toggle]');
  if (!btn) return;
  const root = document.documentElement;
  const meta = document.querySelector('meta[name="theme-color"]');
  const apply = (t) => {
    root.setAttribute('data-theme', t);
    btn.setAttribute('aria-pressed', String(t === 'dark'));
    if (meta) meta.setAttribute('content', t === 'dark' ? '#1f1d1b' : '#ddd3c4');
  };
  apply(root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');
  btn.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    apply(next);
    try { localStorage.setItem('me-portfolio-theme', next); } catch (e) {}
  });
  // follow the device while the visitor has not chosen
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    let saved = null;
    try { saved = localStorage.getItem('me-portfolio-theme'); } catch (err) {}
    if (saved !== 'dark' && saved !== 'light') apply(e.matches ? 'dark' : 'light');
  });
})();

// Pictures tilt in 3D toward the pointer, and the image inside drifts the other way for depth.
// Mouse and trackpad only, and never when the visitor asks for reduced motion.
(() => {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const MAX = 9; // degrees
  document.querySelectorAll('.held').forEach((card) => {
    if (card.closest('.peek') || card.querySelector('video')) return;
    card.classList.add('tilt');
    let frame = 0;
    card.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5; // -0.5 to 0.5
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.setProperty('--ry', `${(x * 2 * MAX).toFixed(2)}deg`);
        card.style.setProperty('--rx', `${(-y * 2 * MAX).toFixed(2)}deg`);
        card.style.setProperty('--px', (x * 2).toFixed(3));
        card.style.setProperty('--py', (y * 2).toFixed(3));
        card.classList.add('is-tilting');
      });
    });
    card.addEventListener('pointerleave', () => {
      cancelAnimationFrame(frame);
      card.classList.remove('is-tilting');
      ['--rx', '--ry', '--px', '--py'].forEach((p) => card.style.removeProperty(p));
    });
  });
})();
