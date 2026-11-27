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
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle('scrolled', y > 20);
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
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

// Experience tabs with a "being written" reveal, and toolkit chip pop-in
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const tabs = [...document.querySelectorAll('.xp-tab')];
  let run = 0;
  const animate = async panel => {
    const id = ++run;
    const parts = panel.querySelectorAll('.xp-summary, .xp-hl, .xp-tools span, .xp-sub, .xp-proj');
    parts.forEach(el => el.classList.remove('on'));
    if (reduce) { parts.forEach(el => el.classList.add('on')); return; }
    const title = panel.querySelector('.xp-title');
    const text = title.dataset.t || (title.dataset.t = title.textContent);
    title.classList.add('caret'); title.textContent = '';
    for (let i = 1; i <= text.length; i++) { if (id !== run) break; title.textContent = text.slice(0, i); await sleep(26); }
    title.textContent = text; title.classList.remove('caret');
    for (const el of parts) { if (id !== run) { el.classList.add('on'); continue; } el.classList.add('on'); await sleep(el.matches('.xp-tools span') ? 45 : 90); }
  };
  const select = (tab, focus) => {
    tabs.forEach(t => { const on = t === tab; t.classList.toggle('active', on); t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1; });
    document.querySelectorAll('.xp-panel').forEach(p => { const on = p.id === tab.getAttribute('aria-controls'); p.hidden = !on; p.classList.toggle('active', on); if (on) animate(p); });
    if (focus) tab.focus();
  };
  tabs.forEach((t, i) => {
    t.tabIndex = i === 0 ? 0 : -1;
    t.addEventListener('click', () => select(t));
    t.addEventListener('keydown', e => {
      const k = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
      if (k) { e.preventDefault(); select(tabs[(i + k + tabs.length) % tabs.length], true); }
    });
  });
  const xp = document.querySelector('.xp');
  if (xp) {
    const o = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { o.disconnect(); animate(document.querySelector('.xp-panel.active')); } }), { threshold: 0.25 });
    o.observe(xp);
  }
  // Toolkit chips pop in per card
  const co = new IntersectionObserver(es => es.forEach(async e => {
    if (!e.isIntersecting) return; co.unobserve(e.target);
    for (const c of e.target.querySelectorAll('.chips span')) { c.classList.add('on'); if (!reduce) await sleep(40); }
  }), { threshold: 0.3 });
  document.querySelectorAll('.tk').forEach(c => co.observe(c));
})();

// Contact form: validation + AJAX send via FormSubmit, with email fallback
(() => {
  const form = document.getElementById('contactForm');
  if (!form) return;
  const status = document.getElementById('formStatus');
  const btn = form.querySelector('.btn-send');
  const checks = {
    fName: el => el.value.trim().length > 1,
    fEmail: el => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim()),
    fMsg: el => el.value.trim().length >= 10
  };
  const validate = id => {
    const el = document.getElementById(id), ok = checks[id](el);
    el.parentElement.classList.toggle('invalid', !ok);
    return ok;
  };
  Object.keys(checks).forEach(id => {
    const el = document.getElementById(id);
    el.addEventListener('blur', () => el.value && validate(id));
    el.addEventListener('input', () => el.parentElement.classList.contains('invalid') && validate(id));
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const ok = Object.keys(checks).map(validate).every(Boolean);
    if (!ok) { status.className = 'form-status bad'; status.textContent = 'Please fix the highlighted fields.'; return; }
    if (form._honey.value) return;
    btn.disabled = true; btn.classList.add('sending');
    btn.querySelector('.send-text').textContent = 'Sending…';
    status.className = 'form-status'; status.textContent = '';
    const data = Object.fromEntries(new FormData(form));
    try {
      const res = await fetch('https://formsubmit.co/ajax/utkarshpatel105@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data)
      });
      const out = await res.json().catch(() => ({}));
      if (!res.ok || out.success === 'false') throw new Error(out.message || 'Send failed');
      const first = data.name.trim().split(' ')[0];
      form.innerHTML = `<div class="form-done"><div class="tick">✓</div><h3>Thanks, ${first.replace(/[<>&"]/g, '')}!</h3><p>Your message is on its way. I'll get back to you within a day.</p></div>`;
    } catch (err) {
      btn.disabled = false; btn.classList.remove('sending');
      btn.querySelector('.send-text').textContent = 'Send message';
      const body = encodeURIComponent(`${data.message}\n\n— ${data.name}${data.company ? ', ' + data.company : ''} (${data.email})`);
      status.className = 'form-status bad';
      status.innerHTML = `Couldn't send right now. <a href="mailto:utkarshpatel105@gmail.com?subject=${encodeURIComponent(data.topic)}&body=${body}" style="text-decoration:underline">Send it by email instead</a>.`;
    }
  });
})();
