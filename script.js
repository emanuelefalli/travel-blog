// Theme toggle - persists choice in localStorage
const themeToggle = document.querySelector('.theme-toggle');
const root = document.documentElement;

const savedTheme = localStorage.getItem('theme') || 'light';
root.setAttribute('data-theme', savedTheme);
updateToggleIcon(savedTheme);

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const current = root.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    updateToggleIcon(next);
  });
}

function updateToggleIcon(theme) {
  if (!themeToggle) return;
  themeToggle.textContent = theme === 'dark' ? '☀' : '☾';
  themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
}

// Progressive image loading - fades images in once they finish loading
const lazyImages = document.querySelectorAll('img[loading="lazy"]');

lazyImages.forEach(img => {
  if (img.complete) {
    img.classList.add('loaded');
  } else {
    img.addEventListener('load', () => img.classList.add('loaded'));
  }
});

// Subtle scroll reveal for trip cards
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.trip-card').forEach(card => {
  card.style.opacity = '0';
  card.style.transform = 'translateY(20px)';
  card.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
  observer.observe(card);
});

// Lightbox - opens article images fullscreen with prev/next navigation
const articleImages = Array.from(document.querySelectorAll('.article-body img'));
let lightboxIndex = 0;
let lightboxEl = null;

function buildLightbox() {
  if (lightboxEl) return;

  lightboxEl = document.createElement('div');
  lightboxEl.className = 'lightbox';
  lightboxEl.innerHTML = `
    <button class="lightbox-close" aria-label="Close">×</button>
    <button class="lightbox-nav lightbox-prev" aria-label="Previous">‹</button>
    <img alt="">
    <button class="lightbox-nav lightbox-next" aria-label="Next">›</button>
    <div class="lightbox-counter"></div>
  `;
  document.body.appendChild(lightboxEl);

  lightboxEl.addEventListener('click', (e) => {
    if (e.target === lightboxEl) closeLightbox();
  });
  lightboxEl.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
  lightboxEl.querySelector('.lightbox-prev').addEventListener('click', (e) => {
    e.stopPropagation();
    showImage(lightboxIndex - 1);
  });
  lightboxEl.querySelector('.lightbox-next').addEventListener('click', (e) => {
    e.stopPropagation();
    showImage(lightboxIndex + 1);
  });
}

function openLightbox(index) {
  buildLightbox();
  showImage(index);
  lightboxEl.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  if (!lightboxEl) return;
  lightboxEl.classList.remove('open');
  document.body.style.overflow = '';
}

function showImage(index) {
  const total = articleImages.length;
  lightboxIndex = (index + total) % total;
  const src = articleImages[lightboxIndex].src;
  const alt = articleImages[lightboxIndex].alt;
  lightboxEl.querySelector('img').src = src;
  lightboxEl.querySelector('img').alt = alt;
  lightboxEl.querySelector('.lightbox-counter').textContent = `${lightboxIndex + 1} / ${total}`;
}

articleImages.forEach((img, i) => {
  img.addEventListener('click', () => openLightbox(i));
});

document.addEventListener('keydown', (e) => {
  if (!lightboxEl || !lightboxEl.classList.contains('open')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') showImage(lightboxIndex - 1);
  if (e.key === 'ArrowRight') showImage(lightboxIndex + 1);
});
