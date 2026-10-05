// Loaded in <head> so the saved theme is applied before the page paints.
const THEME_STORAGE_KEY = 'theme';

function readSavedTheme() {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) === 'dark' ? 'dark' : 'light';
  } catch (error) {
    return 'light';
  }
}

function writeSavedTheme(theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (error) {
    return;
  }
}

document.documentElement.setAttribute('data-theme', readSavedTheme());
