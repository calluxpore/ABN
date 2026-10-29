// Small amount of script: section entrances, the monogram card, and pausing the looping teaser.

// Reveal once when a section enters the viewport. Never replays, never leaves content hidden.
(() => {
  const targets = document.querySelectorAll('[data-reveal], [data-open]');
  if (!targets.length) return;
  const show = (el) => el.classList.add('is-in');
  if (!('IntersectionObserver' in window)) { targets.forEach(show); return; }
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      show(entry.target);
      io.unobserve(entry.target);
    }
  }, { rootMargin: '0px 0px -40px 0px', threshold: 0 });
  targets.forEach((el) => io.observe(el));
  // a jump (a link to #contact, End, a fast fling) can skip past a section between observer frames:
  // anything that is now above the bottom of the screen has been reached, so show it
  let queued = false;
  const sweep = () => {
    queued = false;
    targets.forEach((el) => { if (!el.classList.contains('is-in') && el.getBoundingClientRect().top < innerHeight) show(el); });
  };
  window.addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(sweep); } }, { passive: true });
  window.addEventListener('load', () => setTimeout(sweep, 2500));
})();

// The monogram card: two names in, two initials set the way a couple's monogram is drawn,
// and the email to Anadhya is written with them.
(() => {
  const form = document.querySelector('[data-monogram]');
  if (!form) return;
  const [one, two] = form.querySelectorAll('input');
  const letters = form.querySelector('.monogram__letters');
  const a = letters.querySelector('.a');
  const b = letters.querySelector('.b');
  const names = form.querySelector('.monogram__names');
  const ask = form.querySelector('[data-ask]');
  const initial = (value, fallback) => (value.trim().match(/\p{L}/u) || [fallback])[0].toUpperCase();
  const name = (input) => input.value.trim() || input.placeholder;

  const render = () => {
    const first = initial(one.value, initial(one.placeholder, 'A'));
    const second = initial(two.value, initial(two.placeholder, 'B'));
    if (a.textContent !== first || b.textContent !== second) {
      a.textContent = first;
      b.textContent = second;
      letters.classList.remove('is-new');
      void letters.offsetWidth;
      letters.classList.add('is-new');
    }
    names.textContent = `${name(one)} & ${name(two)}`;
    const subject = `A monogram for ${first} & ${second}`;
    const body = `Hi Anadhya,\n\nWe would love a monogram for ${name(one)} & ${name(two)}.\n\nThe occasion:\nThe date:\nWhere it is:\n\nThank you!`;
    ask.href = `mailto:anadhya94@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };
  form.addEventListener('input', render);
  form.addEventListener('submit', (e) => { e.preventDefault(); window.location.href = ask.href; });
  render();
})();

// Pause and play the looping teaser plate.
(() => {
  document.querySelectorAll('[data-pause]').forEach((btn) => {
    const video = document.getElementById(btn.getAttribute('aria-controls'));
    if (!video) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => {
      const paused = video.paused;
      btn.setAttribute('aria-label', paused ? 'Play the teaser' : 'Pause the teaser');
      btn.innerHTML = paused
        ? '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 1.5v13l11-6.5z" fill="currentColor"/></svg>'
        : '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 1.5h3.5v13H3zM9.5 1.5H13v13H9.5z" fill="currentColor"/></svg>';
    };
    if (reduce.matches) video.pause();
    btn.addEventListener('click', () => { video.paused ? video.play() : video.pause(); });
    video.addEventListener('play', sync);
    video.addEventListener('pause', sync);
    sync();
  });
})();
