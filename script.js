// ---- LINK CONFIG (замени значения, когда бот будет готов) ----
const LINKS = {
  consult:    'https://t.me/vasilina_pavlovich7',
  individual: 'https://t.me/vasilina_pavlovich7',
  course:     'https://t.me/vasilina_pavlovich7',
  business:   'https://t.me/vasilina_pavlovich7',
  guide:      'https://t.me/vasilina_pavlovich7'
};
document.querySelectorAll('[data-cta]').forEach(el=>{
  const key=el.dataset.cta;
  if(LINKS[key])el.href=LINKS[key];
});

function toggleMenu(){document.getElementById('mobileMenu').classList.toggle('open')}
function closeMenu(){document.getElementById('mobileMenu').classList.remove('open')}
function toggleAcc(h){const b=h.nextElementSibling;const c=h.querySelector('.acc-chevron');const open=b.style.maxHeight&&b.style.maxHeight!=='0px';b.style.maxHeight=open?'0px':(b.scrollHeight+'px');c.classList.toggle('open',!open)}
function toggleFaq(q){const a=q.nextElementSibling;const c=q.querySelector('.faq-chevron');const open=a.style.maxHeight&&a.style.maxHeight!=='0px';a.style.maxHeight=open?'0px':(a.scrollHeight+'px');c.classList.toggle('open',!open)}

// Intersection Observer
const io=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')})},{threshold:0.05,rootMargin:'0px 0px 0px 0px'});
document.querySelectorAll('.fade-up,.chat-card').forEach(el=>io.observe(el));

// Hero pills stagger
setTimeout(()=>{document.getElementById('p1')&&document.getElementById('p1').classList.add('visible')},400);
setTimeout(()=>{document.getElementById('p2')&&document.getElementById('p2').classList.add('visible')},650);
setTimeout(()=>{document.getElementById('p3')&&document.getElementById('p3').classList.add('visible')},900);

// Notifications
setTimeout(()=>{document.getElementById('n1')&&document.getElementById('n1').classList.add('visible')},1200);
setTimeout(()=>{document.getElementById('n2')&&document.getElementById('n2').classList.add('visible')},1800);
setTimeout(()=>{document.getElementById('n3')&&document.getElementById('n3').classList.add('visible')},2400);

// ---- CONFETTI HELPER ----
function launchConfetti(canvasId, cardEl) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  canvas.width = cardEl.offsetWidth;
  canvas.height = cardEl.offsetHeight;
  const ctx = canvas.getContext('2d');
  const particles = [];
  const colors = ['#22c55e','#3b82f6','#f59e0b','#ec4899','#a855f7','#10b981'];
  for (let i = 0; i < 38; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: canvas.height + 10,
      vx: (Math.random() - 0.5) * 4,
      vy: -(Math.random() * 6 + 3),
      size: Math.random() * 7 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
      rot: Math.random() * 360,
      rspeed: (Math.random()-0.5)*8
    });
  }
  let frame = 0;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.18; p.alpha -= 0.016; p.rot += p.rspeed;
      if (p.alpha <= 0) return;
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot * Math.PI / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size * 0.5);
      ctx.restore();
    });
    frame++;
    if (frame < 90) requestAnimationFrame(draw);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  draw();
}

// Counters handled sequentially below

// ---- PIXEL FACES ----
document.querySelectorAll('.pixel-face').forEach(el => {
  const initials = el.dataset.initials || '??';
  const color = el.dataset.color || '#22c55e';
  el.style.background = color + '22';
  el.style.border = '3px solid ' + color;
  el.innerHTML = '<span style="color:' + color + ';font-size:24px;font-weight:800">' + initials + '</span>';
  // Pixel art overlay dots
  const dots = document.createElement('div');
  dots.style.cssText = 'position:absolute;inset:0;pointer-events:none;opacity:0.12';
  // just subtle pixelation effect via box-shadow isn't worth it; keep clean
  el.style.position = 'relative';
});

// ---- REVIEW CARDS SCROLL ----
function scrollReviews(dir) {
  const track = document.getElementById('reviewsTrack');
  if (!track) return;
  track.scrollBy({ left: dir * 460, behavior: 'smooth' });
}

// Auto-scroll reviews
(function(){
  let paused = false;
  const track = document.getElementById('reviewsTrack');
  if (!track) return;
  track.addEventListener('mouseenter', () => paused = true);
  track.addEventListener('mouseleave', () => paused = false);
  setInterval(() => {
    if (paused) return;
    const maxScroll = track.scrollWidth - track.clientWidth;
    if (track.scrollLeft >= maxScroll - 10) {
      track.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      track.scrollBy({ left: 460, behavior: 'smooth' });
    }
  }, 3200);
})();

// ---- SKILLS SLIDER (INFINITE) ----
(function(){
  const track = document.getElementById('skillsTrack');
  const overflow = document.getElementById('skillsOverflow');
  const dotsEl = document.getElementById('skillsDots');
  const prevBtn = document.getElementById('skillsPrev');
  const nextBtn = document.getElementById('skillsNext');
  if (!track || !overflow) return;

  const gap = 20;
  let perPage = 2;
  let iPage = 1; // internal page, 1 = first real page (after pre-buffer)
  let busy = false;

  function origCards() {
    return [...track.querySelectorAll('.skills-card:not(.skills-card-clone)')];
  }

  function logPages() {
    return Math.ceil(origCards().length / perPage);
  }

  function cardW() {
    if (perPage === 1) return overflow.offsetWidth;
    return (overflow.offsetWidth - gap * (perPage - 1)) / perPage;
  }

  function buildClones() {
    track.querySelectorAll('.skills-card-clone').forEach(c => c.remove());
    const orig = origCards();
    const lp = logPages();
    // post-buffer: clone first perPage original cards, append at end
    orig.slice(0, perPage).forEach(c => {
      const cl = c.cloneNode(true);
      cl.classList.add('skills-card-clone');
      track.appendChild(cl);
    });
    // pre-buffer: clone last page original cards, insert before first original (reversed for correct order)
    const lastStart = (lp - 1) * perPage;
    [...orig.slice(lastStart)].reverse().forEach(c => {
      const cl = c.cloneNode(true);
      cl.classList.add('skills-card-clone');
      track.insertBefore(cl, orig[0]);
    });
  }

  function setWidths() {
    const w = cardW();
    track.querySelectorAll('.skills-card').forEach(c => c.style.width = w + 'px');
  }

  function calcOffset(p) {
    return p * perPage * (cardW() + gap);
  }

  function moveTo(p, animate) {
    track.style.transition = animate
      ? 'transform 0.45s cubic-bezier(0.25,0.46,0.45,0.94)'
      : 'none';
    track.style.transform = 'translateX(-' + calcOffset(p) + 'px)';
  }

  function activeDot() {
    return (iPage - 1 + logPages()) % logPages();
  }

  function renderDots() {
    const lp = logPages();
    const active = activeDot();
    dotsEl.innerHTML = '';
    for (let i = 0; i < lp; i++) {
      const d = document.createElement('button');
      d.className = 'skills-dot' + (i === active ? ' active' : '');
      d.setAttribute('aria-label', 'Страница ' + (i + 1));
      d.addEventListener('click', () => {
        if (busy) return;
        iPage = i + 1;
        moveTo(iPage, true);
        renderDots();
      });
      dotsEl.appendChild(d);
    }
    // arrows always enabled (infinite)
    prevBtn.disabled = false;
    nextBtn.disabled = false;
  }

  function next() {
    if (busy) return;
    busy = true;
    iPage++;
    moveTo(iPage, true);
    renderDots();
  }

  function prev() {
    if (busy) return;
    busy = true;
    iPage--;
    moveTo(iPage, true);
    renderDots();
  }

  track.addEventListener('transitionend', e => {
    if (e.propertyName !== 'transform') return;
    const lp = logPages();
    if (iPage >= lp + 1) {
      iPage = 1;
      moveTo(iPage, false);
      renderDots();
    } else if (iPage <= 0) {
      iPage = lp;
      moveTo(iPage, false);
      renderDots();
    }
    busy = false;
  });

  function init() {
    perPage = window.innerWidth >= 768 ? 3 : 1;
    buildClones();
    setWidths();
    iPage = 1;
    moveTo(iPage, false);
    renderDots();
  }

  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(init, 120);
  });

  init();
})();

// ---- SOCIAL PROOF CAROUSEL ----
(function(){
  const track = document.getElementById('spTrack');
  const overflow = document.getElementById('spOverflow');
  const prevBtn = document.getElementById('spPrev');
  const nextBtn = document.getElementById('spNext');
  if (!track || !overflow) return;

  const gap = 20;
  let perPage = 2;
  let iPage = 1;
  let busy = false;

  function origCards() {
    return [...track.querySelectorAll('.sp-card:not(.sp-card-clone)')];
  }

  function logPages() {
    return Math.ceil(origCards().length / perPage);
  }

  function cardW() {
    if (perPage === 1) return overflow.offsetWidth;
    return (overflow.offsetWidth - gap * (perPage - 1)) / perPage;
  }

  function buildClones() {
    track.querySelectorAll('.sp-card-clone').forEach(c => c.remove());
    const orig = origCards();
    const lp = logPages();
    orig.slice(0, perPage).forEach(c => {
      const cl = c.cloneNode(true);
      cl.classList.add('sp-card-clone');
      track.appendChild(cl);
    });
    const lastStart = (lp - 1) * perPage;
    [...orig.slice(lastStart)].reverse().forEach(c => {
      const cl = c.cloneNode(true);
      cl.classList.add('sp-card-clone');
      track.insertBefore(cl, orig[0]);
    });
  }

  function setWidths() {
    const w = cardW();
    track.querySelectorAll('.sp-card').forEach(c => c.style.width = w + 'px');
  }

  function calcOffset(p) {
    return p * perPage * (cardW() + gap);
  }

  function moveTo(p, animate) {
    track.style.transition = animate
      ? 'transform 0.45s cubic-bezier(0.25,0.46,0.45,0.94)'
      : 'none';
    track.style.transform = 'translateX(-' + calcOffset(p) + 'px)';
  }

  track.addEventListener('transitionend', e => {
    if (e.propertyName !== 'transform') return;
    const lp = logPages();
    if (iPage >= lp + 1) { iPage = 1; moveTo(iPage, false); }
    else if (iPage <= 0) { iPage = lp; moveTo(iPage, false); }
    busy = false;
  });

  function next() {
    if (busy) return;
    busy = true;
    iPage++;
    moveTo(iPage, true);
  }

  function prev() {
    if (busy) return;
    busy = true;
    iPage--;
    moveTo(iPage, true);
  }

  let touchStartX = 0;
  overflow.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  overflow.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) diff > 0 ? next() : prev();
  }, { passive: true });

  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(init, 120);
  });

  function init() {
    perPage = window.innerWidth >= 768 ? 2 : 1;
    buildClones();
    setWidths();
    iPage = 1;
    moveTo(iPage, false);
  }

  init();
})();

// ---- SIMULTANEOUS COUNTERS ----
(function(){
  const counters = document.querySelectorAll('.counter');
  if (!counters.length) return;

  function animateCounter(el) {
    const target = +el.dataset.target;
    const suffix = el.dataset.suffix || '';
    const cardEl = el.closest('.stat-item');
    const confId = cardEl ? cardEl.querySelector('.confetti-canvas')?.id : null;
    let current = 0;
    const duration = 1200;
    const steps = 60;
    const increment = target / steps;
    const interval = duration / steps;
    const t = setInterval(() => {
      current += increment;
      if (current >= target) {
        el.textContent = target + suffix;
        clearInterval(t);
        if (confId && cardEl) setTimeout(() => { launchConfetti(confId, cardEl); }, 80);
      } else {
        el.textContent = Math.floor(current) + suffix;
      }
    }, interval);
  }

  let started = false;
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting && !started) {
        started = true;
        counters.forEach(c => animateCounter(c));
        io.disconnect();
      }
    });
  }, { threshold: 0.4 });

  if (counters[0]) io.observe(counters[0].closest('.stats') || counters[0]);
})();
