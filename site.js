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
