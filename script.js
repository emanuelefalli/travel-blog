// Mobile nav drawer
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
const navOverlay = document.querySelector('.nav-overlay');

function closeNav() {
  navLinks.classList.remove('open');
  navOverlay.classList.remove('open');
  navToggle.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

function openNav() {
  navLinks.classList.add('open');
  navOverlay.classList.add('open');
  navToggle.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}

if (navToggle && navLinks && navOverlay) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.contains('open') ? closeNav() : openNav();
  });
  navOverlay.addEventListener('click', closeNav);
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', closeNav));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('open')) closeNav();
  });
}

// Theme toggle - readSavedTheme / writeSavedTheme come from theme.js
const themeToggle = document.querySelector('.theme-toggle');
const root = document.documentElement;

const ICON_SUN = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/></svg>';
const ICON_MOON = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"/></svg>';

function applyTheme(theme) {
  root.setAttribute('data-theme', theme);
  if (!themeToggle) return;
  themeToggle.innerHTML = theme === 'dark' ? ICON_SUN : ICON_MOON;
  themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
}

applyTheme(readSavedTheme());

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const nextTheme = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    writeSavedTheme(nextTheme);
    applyTheme(nextTheme);
  });
}

// Pages restored from the back/forward cache skip script execution
window.addEventListener('pageshow', () => {
  applyTheme(readSavedTheme());
  if (navLinks) closeNav();
});

window.addEventListener('storage', (event) => {
  if (event.key !== THEME_STORAGE_KEY) return;
  applyTheme(readSavedTheme());
});

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

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

// Active nav link - article pages belong to the Trips section
function markActiveNavLink() {
  const currentFile = location.pathname.split('/').pop() || 'index.html';
  const activeFile = currentFile.startsWith('post-') ? 'trips.html' : currentFile;
  const activeLink = document.querySelector(`.nav-links a[href="${activeFile}"]`);
  if (!activeLink) return;
  activeLink.setAttribute('aria-current', 'page');
}

markActiveNavLink();

// Scroll-driven nav state, reading progress bar and hero parallax
const navBar = document.querySelector('.nav');
const heroImage = document.querySelector('.hero-image');
let navProgress = null;
let scrollFramePending = false;

if (navBar) {
  navProgress = document.createElement('div');
  navProgress.className = 'nav-progress';
  navBar.appendChild(navProgress);
}

function updateScrollState() {
  scrollFramePending = false;
  const scrollY = window.scrollY;
  const scrollRange = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollRange > 0 ? Math.min(scrollY / scrollRange, 1) : 0;

  if (navBar) {
    navBar.classList.toggle('is-scrolled', scrollY > 10);
    navProgress.style.setProperty('--scroll-progress', progress.toFixed(4));
  }

  if (heroImage && hasFinePointer && !prefersReducedMotion && scrollY < window.innerHeight) {
    heroImage.style.setProperty('--hero-shift', `${Math.round(scrollY * 0.35)}px`);
  }
}

window.addEventListener('scroll', () => {
  if (scrollFramePending) return;
  scrollFramePending = true;
  requestAnimationFrame(updateScrollState);
}, { passive: true });

updateScrollState();

// Trip counter - counts the cards in the grid next to the label
function updateTripCount() {
  const tripCountLabel = document.querySelector('[data-trip-count]');
  if (!tripCountLabel) return;

  const tripCount = document.querySelectorAll('.trip-grid .trip-card').length;
  tripCountLabel.textContent = `${tripCount} ${tripCount === 1 ? 'Journey' : 'Journeys'}`;
}

updateTripCount();

// Card tilt - follows the pointer on desktop only
const TILT_MAX_DEG = 6;

function attachCardTilt(cardImage) {
  cardImage.addEventListener('pointermove', (e) => {
    const rect = cardImage.getBoundingClientRect();
    const offsetX = (e.clientX - rect.left) / rect.width - 0.5;
    const offsetY = (e.clientY - rect.top) / rect.height - 0.5;
    cardImage.style.setProperty('--tilt-x', `${(-offsetY * TILT_MAX_DEG).toFixed(2)}deg`);
    cardImage.style.setProperty('--tilt-y', `${(offsetX * TILT_MAX_DEG).toFixed(2)}deg`);
  });

  cardImage.addEventListener('pointerleave', () => {
    cardImage.style.setProperty('--tilt-x', '0deg');
    cardImage.style.setProperty('--tilt-y', '0deg');
  });
}

if (hasFinePointer && !prefersReducedMotion) {
  document.querySelectorAll('.trip-card-image').forEach(attachCardTilt);
}

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
