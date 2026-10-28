(() => {
  const root = document.documentElement;
  root.classList.add('js');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const nodes = [...document.querySelectorAll('.node')];
  const altEl = document.getElementById('alt');
  const hint = document.querySelector('.hint');
  const quote = document.querySelector('.statement');
  const stops = [0, 12, 100, 400]; // km at Home, About, Interests (Karman line), Contact (ISS orbit)

  // Split the About statement into words so they can light up on scroll.
  quote.innerHTML = quote.textContent.trim().split(/\s+/).map(w => `<span class="w">${w}</span>`).join(' ');
  const words = [...quote.children];

  let max = 1, at = [], target = 0, cur = 0, running = false;

  const kick = () => { if (!running) { running = true; requestAnimationFrame(tick); } };
  const read = () => { target = Math.min(1, scrollY / max); kick(); };
  const measure = () => {
    max = Math.max(1, root.scrollHeight - innerHeight);
    at = nodes.map(n => document.querySelector(n.getAttribute('href')).offsetTop / max);
    nodes.forEach((n, i) => { n.style.top = (at[i] * 100) + '%'; });
    read();
  };

  function tick() {
    // Ease toward the real scroll position: this is what makes everything feel smooth.
    cur = reduce ? target : cur + (target - cur) * 0.1;
    if (Math.abs(target - cur) < 0.0005) cur = target;

    const h = Math.min(1, cur * max / innerHeight);
    root.style.setProperty('--p', cur.toFixed(4));
    root.style.setProperty('--h', h.toFixed(4));

    let i = 0;
    at.forEach((a, k) => { if (cur >= a) i = k; });
    let km = stops[i];
    if (i < stops.length - 1 && at[i + 1] > at[i]) km += (stops[i + 1] - stops[i]) * (cur - at[i]) / (at[i + 1] - at[i]);
    altEl.textContent = Math.round(km);

    nodes.forEach((n, k) => n.classList.toggle('lit', cur >= at[k] - 0.002));
    hint.classList.toggle('gone', cur * max > 40);

    const r = quote.getBoundingClientRect();
    const prog = Math.min(1, Math.max(0, (innerHeight * 0.8 - r.top) / (innerHeight * 0.45)));
    words.forEach((w, k) => w.classList.toggle('on', k < prog * words.length));

    if (cur !== target) requestAnimationFrame(tick); else running = false;
  }

  // Interest rows draw their divider line and slide in once.
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: 0.4 });
  document.querySelectorAll('.list li').forEach(li => io.observe(li));

  addEventListener('scroll', read, { passive: true });
  addEventListener('resize', measure);
  addEventListener('load', measure);
  if (document.fonts) document.fonts.ready.then(measure);
  measure();
})();
