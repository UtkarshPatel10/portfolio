(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const body = document.body;
  document.getElementById('year').textContent = new Date().getFullYear();

  // Loader: counts to 100, then slides away and starts hero animation
  const loader = document.getElementById('loader');
  const count = document.getElementById('loaderCount');
  const start = () => { body.classList.remove('loading'); body.classList.add('ready'); };
  if (reduce || sessionStorageSafe('seen')) {
    loader.remove(); start();
  } else {
    body.classList.add('loading');
    let n = 0;
    const tick = setInterval(() => {
      n = Math.min(100, n + Math.ceil(Math.random() * 9));
      count.textContent = n;
      if (n >= 100) {
        clearInterval(tick);
        setTimeout(() => { loader.classList.add('done'); start(); setTimeout(() => loader.remove(), 900); }, 250);
        sessionStorageSafe('seen', '1');
      }
    }, 45);
  }
  function sessionStorageSafe(k, v) {
    try { return v ? sessionStorage.setItem(k, v) : sessionStorage.getItem(k); } catch (e) { return null; }
  }

  // Nav state + scroll progress + timeline fill
  const nav = document.getElementById('nav');
  const progress = document.getElementById('progress');
  const timeline = document.getElementById('timeline');
  const fill = document.getElementById('timelineFill');
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle('scrolled', y > 20);
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    const r = timeline.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (innerHeight * 0.6 - r.top) / r.height));
    fill.style.height = (p * 100) + '%';
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Close mobile menu on link click
  const menu = document.getElementById('menu');
  menu.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', () => {
    if (menu.classList.contains('show')) bootstrap.Collapse.getOrCreateInstance(menu).hide();
  }));

  // Reveal on scroll (staggered within a row)
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const sibs = [...e.target.parentElement.parentElement.querySelectorAll(':scope > * > .reveal, :scope > .reveal')];
      const i = Math.max(0, sibs.indexOf(e.target));
      e.target.style.transitionDelay = reduce ? '0s' : (i % 4) * 0.08 + 's';
      e.target.classList.add('in');
      io.unobserve(e.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // Count-up numbers
  const co = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target, target = +el.dataset.count;
      if (reduce) { el.textContent = target; return; }
      const t0 = performance.now();
      const step = t => {
        const k = Math.min(1, (t - t0) / 1400);
        el.textContent = Math.round(target * (1 - Math.pow(1 - k, 3)));
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      co.unobserve(el);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('[data-count]').forEach(el => co.observe(el));

  // Spotlight on project cards
  document.querySelectorAll('.project').forEach(card => {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--x', e.clientX - r.left + 'px');
      card.style.setProperty('--y', e.clientY - r.top + 'px');
    });
  });

  // Desktop only: custom cursor + magnetic buttons
  if (!reduce && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const cur = document.getElementById('cursor');
    let x = 0, y = 0, cx = 0, cy = 0;
    window.addEventListener('pointermove', e => { x = e.clientX; y = e.clientY; cur.classList.add('on'); });
    document.addEventListener('pointerleave', () => cur.classList.remove('on'));
    (function loop() {
      cx += (x - cx) * 0.18; cy += (y - cy) * 0.18;
      cur.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    })();
    document.querySelectorAll('a, button, .project').forEach(el => {
      el.addEventListener('pointerenter', () => cur.classList.add('hover'));
      el.addEventListener('pointerleave', () => cur.classList.remove('hover'));
    });
    document.querySelectorAll('.magnetic').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px, ${(e.clientY - r.top - r.height / 2) * 0.35}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
      el.style.transition = 'transform .35s cubic-bezier(.2,.7,.1,1), background .3s, color .3s, border-color .3s';
    });
  }
})();
