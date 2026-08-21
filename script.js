const burger = document.getElementById('burger');
const nav = document.getElementById('main-nav');
const header = document.getElementById('site-header');

function setMenu(open) {
  nav.classList.toggle('open', open);
  burger.classList.toggle('active', open);
  burger.setAttribute('aria-expanded', String(open));
  burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
  document.body.classList.toggle('menu-open', open);
}

burger?.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
window.addEventListener('keydown', event => {
  if (event.key === 'Escape') setMenu(false);
});

function updateHeader() {
  header?.classList.toggle('scrolled', window.scrollY > 20);
}
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

document.getElementById('year').textContent = new Date().getFullYear();

const observer = 'IntersectionObserver' in window
  ? new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 })
  : null;

document.querySelectorAll('.reveal').forEach(element => {
  if (observer) observer.observe(element);
  else element.classList.add('visible');
});

// Transport slider — native scroll snap for fluid touch/swipe on mobile.
const transportTrack = document.getElementById('transport-track');
const transportSlides = transportTrack ? [...transportTrack.querySelectorAll('.transport-slide')] : [];
const transportPrev = document.getElementById('transport-prev');
const transportNext = document.getElementById('transport-next');
const transportDots = document.getElementById('transport-dots');
const transportCurrent = document.getElementById('transport-current');
const transportTotal = document.getElementById('transport-total');
let transportIndex = 0;
let transportScrollTimer;

if (transportTrack && transportSlides.length) {
  if (transportTotal) transportTotal.textContent = String(transportSlides.length).padStart(2, '0');

  const dots = transportSlides.map((slide, index) => {
    const button = document.createElement('button');
    button.className = `transport-dot${index === 0 ? ' active' : ''}`;
    button.type = 'button';
    button.setAttribute('aria-label', `Voir ${slide.dataset.label || `l'image ${index + 1}`}`);
    button.addEventListener('click', () => goToTransport(index));
    transportDots?.appendChild(button);
    return button;
  });

  function updateTransportUI(index) {
    transportIndex = Math.max(0, Math.min(index, transportSlides.length - 1));
    if (transportCurrent) transportCurrent.textContent = String(transportIndex + 1).padStart(2, '0');
    dots.forEach((dot, i) => dot.classList.toggle('active', i === transportIndex));
  }

  function goToTransport(index) {
    const normalized = (index + transportSlides.length) % transportSlides.length;
    transportTrack.scrollTo({ left: transportSlides[normalized].offsetLeft, behavior: 'smooth' });
    updateTransportUI(normalized);
  }

  transportPrev?.addEventListener('click', () => goToTransport(transportIndex - 1));
  transportNext?.addEventListener('click', () => goToTransport(transportIndex + 1));

  transportTrack.addEventListener('scroll', () => {
    window.clearTimeout(transportScrollTimer);
    transportScrollTimer = window.setTimeout(() => {
      const left = transportTrack.scrollLeft;
      let nearest = 0;
      let distance = Infinity;
      transportSlides.forEach((slide, index) => {
        const delta = Math.abs(slide.offsetLeft - left);
        if (delta < distance) {
          distance = delta;
          nearest = index;
        }
      });
      updateTransportUI(nearest);
    }, 60);
  }, { passive: true });

  transportTrack.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') goToTransport(transportIndex - 1);
    if (event.key === 'ArrowRight') goToTransport(transportIndex + 1);
  });
}
