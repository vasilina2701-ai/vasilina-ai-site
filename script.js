function toggleMenu(){document.getElementById('mobileMenu').classList.toggle('open')}
function closeMenu(){document.getElementById('mobileMenu').classList.remove('open')}
function toggleAcc(h){const b=h.nextElementSibling;const c=h.querySelector('.acc-chevron');const open=b.style.maxHeight&&b.style.maxHeight!=='0px';b.style.maxHeight=open?'0px':(b.scrollHeight+'px');c.classList.toggle('open',!open)}
function toggleFaq(q){const a=q.nextElementSibling;const c=q.querySelector('.faq-chevron');const open=a.style.maxHeight&&a.style.maxHeight!=='0px';a.style.maxHeight=open?'0px':(a.scrollHeight+'px');c.classList.toggle('open',!open)}

// Intersection Observer
const io=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')})},{threshold:0.12});
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

// ---- SEQUENTIAL COUNTERS (one by one) ----
// Override: fire counter 0 → wait finish → fire counter 1 → wait → fire counter 2
(function(){
  const counters = document.querySelectorAll('.counter');
  if (!counters.length) return;
  
  function animateCounter(el, onDone) {
    const target = +el.dataset.target;
    const suffix = el.dataset.suffix || '';
    const cardEl = el.closest('.stat-item');
    const confId = cardEl ? cardEl.querySelector('.confetti-canvas')?.id : null;
    let current = 0;
    const steps = 55;
    const duration = 1600;
    const increment = target / steps;
    const interval = duration / steps;
    const t = setInterval(() => {
      current += increment;
      if (current >= target) {
        el.textContent = target + suffix;
        clearInterval(t);
        if (confId && cardEl) setTimeout(() => { launchConfetti(confId, cardEl); }, 80);
        if (onDone) setTimeout(onDone, 900);
      } else {
        el.textContent = Math.floor(current) + suffix;
      }
    }, interval);
  }
  
  let seqStarted = false;
  const seqIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting && !seqStarted) {
        seqStarted = true;
        // Fire in sequence
        animateCounter(counters[0], () => {
          if (counters[1]) animateCounter(counters[1], () => {
            if (counters[2]) animateCounter(counters[2], null);
          });
        });
        seqIO.disconnect();
      }
    });
  }, { threshold: 0.4 });
  
  if (counters[0]) seqIO.observe(counters[0].closest('.stats') || counters[0]);
})();
