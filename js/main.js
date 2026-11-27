document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('year').textContent = new Date().getFullYear();

  // Nav border on scroll
  const nav = document.getElementById('nav');
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 10);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Close mobile menu after clicking a link
  const menu = document.getElementById('menu');
  menu.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      if (menu.classList.contains('show')) bootstrap.Collapse.getOrCreateInstance(menu).hide();
    });
  });

  // "Test run" card in the hero
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const items = document.querySelectorAll('.run-list li');
  const runtime = document.getElementById('runtime');
  if (reduce) {
    items.forEach(li => li.classList.add('show'));
    runtime.textContent = '1.84';
  } else {
    items.forEach((li, i) => setTimeout(() => {
      li.classList.add('show');
      runtime.textContent = ((i + 1) * 0.31).toFixed(2);
    }, 400 + i * 280));
  }

  // Reveal on scroll
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
});
