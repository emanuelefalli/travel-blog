const root = document.documentElement;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Mobile nav drawer
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
const navOverlay = document.querySelector('.nav-overlay');

function closeNav() {
  navLinks.classList.remove('open');
  navOverlay.classList.remove('open');
  navToggle.setAttribute('aria-expanded', 'false');
  navToggle.setAttribute('aria-label', 'Open menu');
  document.body.style.overflow = '';
}

function openNav() {
  navLinks.classList.add('open');
  navOverlay.classList.add('open');
  navToggle.setAttribute('aria-expanded', 'true');
  navToggle.setAttribute('aria-label', 'Close menu');
  document.body.style.overflow = 'hidden';
}

if (navToggle && navLinks && navOverlay) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.contains('open') ? closeNav() : openNav();
  });
  navOverlay.addEventListener('click', closeNav);
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', closeNav));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('open')) {
      closeNav();
      navToggle.focus();
    }
  });
}

// Theme toggle - readSavedTheme / writeSavedTheme come from theme.js
const themeToggle = document.querySelector('.theme-toggle');

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
    themeToggle.classList.add('has-switched');
    applyTheme(nextTheme);
  });
}

// Pages restored from the back/forward cache skip script execution
window.addEventListener('pageshow', () => {
  applyTheme(readSavedTheme());
  if (navLinks) closeNav();
  clearPhotoTransitionNames();
});

window.addEventListener('storage', (event) => {
  if (event.key !== THEME_STORAGE_KEY) return;
  applyTheme(readSavedTheme());
});

// Progressive image loading - images fade in once loaded; a failed load still
// reveals its placeholder instead of leaving an invisible hole
document.querySelectorAll('img[loading="lazy"]').forEach(img => {
  const markLoaded = () => img.classList.add('loaded');
  if (img.complete) {
    markLoaded();
  } else {
    img.addEventListener('load', markLoaded, { once: true });
    img.addEventListener('error', markLoaded, { once: true });
  }
});

// Trip cards arrive as a list: one short stagger per batch that enters together
const revealTargets = document.querySelectorAll('.trip-card');

if ('IntersectionObserver' in window && revealTargets.length) {
  const revealObserver = new IntersectionObserver((entries) => {
    let batchIndex = 0;
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.style.setProperty('--reveal-i', Math.min(batchIndex++, 3));
      entry.target.classList.add('is-in');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealTargets.forEach(card => {
    card.classList.add('reveal');
    revealObserver.observe(card);
  });
}

// Active nav link - article pages belong to the Trips section
function markActiveNavLink() {
  const currentFile = location.pathname.split('/').pop() || 'index.html';
  const activeFile = currentFile.startsWith('post-') ? 'trips.html' : currentFile;
  const activeLink = document.querySelector(`.nav-links a[href="${activeFile}"]`);
  if (!activeLink) return;
  activeLink.setAttribute('aria-current', 'page');
}

markActiveNavLink();

// Scroll state: nav shadow everywhere, reading progress on stories only
const navBar = document.querySelector('.nav');
const isStory = Boolean(document.querySelector('.article-body'));
let navProgress = null;
let scrollFramePending = false;

if (navBar && isStory) {
  navProgress = document.createElement('div');
  navProgress.className = 'nav-progress';
  navBar.appendChild(navProgress);
}

function updateScrollState() {
  scrollFramePending = false;
  const scrollY = window.scrollY;
  if (!navBar) return;
  navBar.classList.toggle('is-scrolled', scrollY > 10);

  if (navProgress) {
    const scrollRange = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollRange > 0 ? Math.min(scrollY / scrollRange, 1) : 0;
    navProgress.style.setProperty('--scroll-progress', progress.toFixed(4));
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
  tripCountLabel.textContent = `${tripCount} ${tripCount === 1 ? 'journey' : 'journeys'}`;
}

updateTripCount();

// Page transitions - the photo you click grows into the story's opening photo.
// Cross-document View Transitions; browsers without support just navigate.
const PHOTO_TRANSITION_NAME = 'trip-photo';

function clearPhotoTransitionNames() {
  document.querySelectorAll('.trip-card-image img, .hero-image').forEach(img => {
    img.style.viewTransitionName = '';
  });
}

function photoForLink(link) {
  return link.classList.contains('hero-link')
    ? link.querySelector('.hero-image')
    : link.querySelector('.trip-card-image img');
}

if (!prefersReducedMotion) {
  document.querySelectorAll('a.trip-card, a.hero-link').forEach(link => {
    link.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      clearPhotoTransitionNames();
      const photo = photoForLink(link);
      if (photo) photo.style.viewTransitionName = PHOTO_TRANSITION_NAME;
    });
  });

  // Coming back from a story: the story photo shrinks back into its card
  window.addEventListener('pagereveal', (e) => {
    if (!e.viewTransition || !window.navigation || !navigation.activation) return;
    const fromEntry = navigation.activation.from;
    if (!fromEntry || !fromEntry.url) return;
    const fromFile = new URL(fromEntry.url).pathname.split('/').pop();
    if (!fromFile.startsWith('post-')) return;

    const link = document.querySelector(`a.hero-link[href="${fromFile}"]`) ||
      document.querySelector(`a.trip-card[href="${fromFile}"]`);
    const photo = link && photoForLink(link);
    if (!photo) return;

    // The card animates as a whole, so show it right away
    const card = photo.closest('.reveal');
    if (card) card.classList.add('is-in');
    photo.style.viewTransitionName = PHOTO_TRANSITION_NAME;
    e.viewTransition.finished.finally(() => {
      photo.style.viewTransitionName = '';
    });
  });
}

// Lightbox - opens story photos fullscreen with prev/next navigation.
// Two stacked layers cross-fade (new in while old out), so flipping never
// passes through an empty frame. Photos are reachable by keyboard; focus moves
// into the dialog and back out.
const articleImages = Array.from(document.querySelectorAll('.article-body img'));
let lightboxIndex = 0;
let lightboxEl = null;
let lightboxLayers = [];
let currentLayer = 0;
let swapToken = 0;
let lastFocused = null;

const ICON_CLOSE = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
const ICON_PREV = '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>';
const ICON_NEXT = '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>';

function buildLightbox() {
  if (lightboxEl) return;

  lightboxEl = document.createElement('div');
  lightboxEl.className = 'lightbox';
  lightboxEl.setAttribute('role', 'dialog');
  lightboxEl.setAttribute('aria-modal', 'true');
  lightboxEl.setAttribute('aria-label', 'Photo viewer');
  lightboxEl.innerHTML = `
    <button type="button" class="lightbox-close" aria-label="Close">${ICON_CLOSE}</button>
    <button type="button" class="lightbox-nav lightbox-prev" aria-label="Previous photo">${ICON_PREV}</button>
    <div class="lightbox-stage">
      <img class="lightbox-layer is-current" alt="" sizes="92vw">
      <img class="lightbox-layer" alt="" sizes="92vw" aria-hidden="true">
    </div>
    <button type="button" class="lightbox-nav lightbox-next" aria-label="Next photo">${ICON_NEXT}</button>
    <div class="lightbox-counter" aria-live="polite"></div>
  `;
  document.body.appendChild(lightboxEl);
  lightboxLayers = Array.from(lightboxEl.querySelectorAll('.lightbox-layer'));

  lightboxEl.addEventListener('click', (e) => {
    if (e.target === lightboxEl || e.target.classList.contains('lightbox-stage')) closeLightbox();
  });
  lightboxEl.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
  lightboxEl.querySelector('.lightbox-prev').addEventListener('click', (e) => {
    e.stopPropagation();
    showImage(lightboxIndex - 1, true);
  });
  lightboxEl.querySelector('.lightbox-next').addEventListener('click', (e) => {
    e.stopPropagation();
    showImage(lightboxIndex + 1, true);
  });
}

function openLightbox(index) {
  buildLightbox();
  lastFocused = document.activeElement;
  showImage(index, false);
  // Commit the closed state first so the fade-in runs, even on the first open
  void lightboxEl.offsetWidth;
  lightboxEl.classList.add('open');
  document.body.style.overflow = 'hidden';
  lightboxEl.querySelector('.lightbox-close').focus({ preventScroll: true });
}

function closeLightbox() {
  if (!lightboxEl || !lightboxEl.classList.contains('open')) return;
  lightboxEl.classList.remove('open');
  document.body.style.overflow = '';
  if (lastFocused) lastFocused.focus({ preventScroll: true });
}

function loadInto(layer, sourceImage) {
  layer.srcset = sourceImage.srcset;
  layer.src = sourceImage.currentSrc || sourceImage.src;
  layer.alt = sourceImage.alt;
  return layer.decode ? layer.decode().catch(() => {}) : Promise.resolve();
}

function updateCounter() {
  lightboxEl.querySelector('.lightbox-counter').textContent = `${lightboxIndex + 1} / ${articleImages.length}`;
}

function showImage(index, crossfade) {
  const total = articleImages.length;
  lightboxIndex = (index + total) % total;
  const sourceImage = articleImages[lightboxIndex];
  const token = ++swapToken;

  if (!crossfade) {
    // Opening: fill the current layer directly; the dialog's own fade covers it
    const layer = lightboxLayers[currentLayer];
    lightboxLayers[1 - currentLayer].removeAttribute('src');
    lightboxLayers[1 - currentLayer].removeAttribute('srcset');
    loadInto(layer, sourceImage);
    updateCounter();
    return;
  }

  // Flipping: decode the next photo off-screen, so no visible layer changes
  // until the swap. A newer press supersedes this one.
  const loader = new Image();
  loader.sizes = '92vw';
  loader.srcset = sourceImage.srcset;
  loader.src = sourceImage.currentSrc || sourceImage.src;
  const decoded = loader.decode ? loader.decode().catch(() => {}) : Promise.resolve();

  decoded.then(() => {
    if (token !== swapToken) return;
    const outgoing = lightboxLayers[currentLayer];
    const incoming = lightboxLayers[1 - currentLayer];

    // A press during a fade: settle the layers instantly (outgoing fully shown
    // on top, incoming hidden) so the photo underneath changes unseen
    outgoing.style.transition = incoming.style.transition = 'none';
    outgoing.style.opacity = '1';
    incoming.style.opacity = '0';
    loadInto(incoming, sourceImage);
    void incoming.offsetWidth;
    outgoing.style.transition = incoming.style.transition = '';
    outgoing.style.opacity = incoming.style.opacity = '';

    currentLayer = 1 - currentLayer;
    incoming.classList.add('is-current');
    incoming.removeAttribute('aria-hidden');
    outgoing.classList.remove('is-current');
    outgoing.setAttribute('aria-hidden', 'true');
    updateCounter();
  });
}

articleImages.forEach((img, i) => {
  img.setAttribute('tabindex', '0');
  img.setAttribute('role', 'button');
  img.setAttribute('aria-label', `View photo ${i + 1} of ${articleImages.length} fullscreen`);
  img.addEventListener('click', () => openLightbox(i));
  img.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openLightbox(i);
    }
  });
});

document.addEventListener('keydown', (e) => {
  if (!lightboxEl || !lightboxEl.classList.contains('open')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') showImage(lightboxIndex - 1, true);
  if (e.key === 'ArrowRight') showImage(lightboxIndex + 1, true);

  // Keep focus inside the dialog
  if (e.key === 'Tab') {
    const buttons = Array.from(lightboxEl.querySelectorAll('button'));
    const first = buttons[0];
    const last = buttons[buttons.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
});
