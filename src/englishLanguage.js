import { DYNAMIC_TRANSLATIONS, TRANSLATIONS } from './englishTranslations.js';

const GEORGIAN_TEXT = /[\u10a0-\u10ff]/;
const TRANSLATION_REGISTRY_KEY = 'inex.ge-tweaks.translationRegistry.v1';
const HISTORY_PATCHED_KEY = 'inexEnglishLanguagePatched';

const usedTranslations = new Set();
const missingTranslations = new Set();
let translationRegistry;
let auditTimer;
let auditPath;
let translationTimer;
const pendingTranslationRoots = new Set();

function currentTranslationPath() {
  return location.pathname.replace(/^\/(en|ka)(?=\/|$)/, '/:lang');
}

function loadTranslationRegistry() {
  if (translationRegistry) return translationRegistry;

  try {
    translationRegistry = JSON.parse(localStorage.getItem(TRANSLATION_REGISTRY_KEY)) || {};
  } catch {
    translationRegistry = {};
  }

  return translationRegistry;
}

function saveTranslationRegistry(registry) {
  localStorage.setItem(TRANSLATION_REGISTRY_KEY, JSON.stringify(registry));
}

function resetPageAuditIfNeeded() {
  const path = currentTranslationPath();

  if (auditPath === path) return;

  auditPath = path;
  usedTranslations.clear();
  missingTranslations.clear();
}

function recordTranslation(source, translation) {
  resetPageAuditIfNeeded();
  usedTranslations.add(source);

  const path = currentTranslationPath();
  const registry = loadTranslationRegistry();
  const entry = registry[source] || { translation, paths: [] };

  entry.translation = translation;
  entry.paths = [...new Set([...entry.paths, path])].sort();
  entry.lastSeenAt = new Date().toISOString();
  registry[source] = entry;
}

function recordMissingTranslation(source) {
  resetPageAuditIfNeeded();
  missingTranslations.add(source);
}

function scheduleTranslationAudit() {
  clearTimeout(auditTimer);
  auditTimer = setTimeout(reportTranslationAudit, 1200);
}

function reportTranslationAudit() {
  const path = currentTranslationPath();
  const registry = loadTranslationRegistry();

  saveTranslationRegistry(registry);

  const unusedTranslations = [];

  for (const [source, entry] of Object.entries(registry)) {
    if (!entry.paths?.includes(path)) continue;
    if (usedTranslations.has(source)) continue;

    unusedTranslations.push({
      source,
      translation: entry.translation,
      path,
      recordedPaths: entry.paths,
    });
  }

  if (unusedTranslations.length) {
    console.warn('[inex.ge tweaks] Translations were not used on this page anymore', {
      count: unusedTranslations.length,
      samples: unusedTranslations.slice(0, 20),
    });
  }

  if (missingTranslations.size) {
    console.warn('[inex.ge tweaks] Missing English translations', {
      path,
      count: missingTranslations.size,
      samples: [...missingTranslations].slice(0, 20),
    });
  }
}

function normalizeText(text) {
  return text.replace(/\s+/g, ' ').trim();
}

function translateDynamicText(text) {
  let translation = text;

  for (const [pattern, replacement] of DYNAMIC_TRANSLATIONS) {
    translation = translation.replace(pattern, replacement);
  }

  return translation;
}

function englishUrl(url) {
  const next = new URL(url, location.href);

  if (next.hostname !== location.hostname) return null;
  if (!next.pathname.startsWith('/ka/')) return null;

  next.pathname = next.pathname.replace(/^\/ka(?=\/)/, '/en');
  return next.href;
}

function redirectToEnglish() {
  const next = englishUrl(location.href);

  if (next) location.replace(next);
}

function isEnglishPage() {
  return /^\/en(?:\/|$)/.test(location.pathname);
}

function hideEnglishLanguageChooser() {
  if (!isEnglishPage()) return;

  for (const input of document.querySelectorAll('input[name="segment-control"]')) {
    const control = input.closest(
      '[class*="rounded-full"][class*="bg-additional-components-primary"]',
    );
    const values = [...(control?.querySelectorAll('input[name="segment-control"]') || [])].map(
      (item) => item.value,
    );

    if (values.includes('ka') && values.includes('en') && values.includes('ru')) {
      control.style.display = 'none';
    }
  }
}

function translateNodeText(node) {
  const value = normalizeText(node.nodeValue || '');
  const translation = TRANSLATIONS.get(value);
  const dynamicTranslation = translation ?? translateDynamicText(value);

  if (dynamicTranslation !== value) {
    recordTranslation(value, dynamicTranslation);
    node.nodeValue = node.nodeValue.replace(node.nodeValue.trim(), dynamicTranslation);
  } else if (GEORGIAN_TEXT.test(value)) {
    recordMissingTranslation(value);
  }
}

function translateAttributes(element) {
  for (const attribute of ['alt', 'aria-label', 'title', 'placeholder']) {
    const value = element.getAttribute(attribute);
    if (!value || !GEORGIAN_TEXT.test(value)) continue;

    const translation = TRANSLATIONS.get(normalizeText(value));
    if (translation) {
      recordTranslation(normalizeText(value), translation);
      element.setAttribute(attribute, translation);
    } else {
      recordMissingTranslation(normalizeText(value));
    }
  }

  if (element instanceof HTMLAnchorElement) {
    const href = englishUrl(element.href);
    if (href) element.href = href;
  }
}

function translateTree(root) {
  if (root.nodeType === Node.TEXT_NODE) {
    translateNodeText(root);
    return;
  }

  if (!(root instanceof Element)) return;
  if (root.matches('script, style, textarea')) return;

  translateAttributes(root);

  for (const element of root.querySelectorAll(
    'a[href], [alt], [aria-label], [title], [placeholder]',
  )) {
    translateAttributes(element);
  }

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (parent?.closest('script, style, textarea')) return NodeFilter.FILTER_REJECT;
      if (!GEORGIAN_TEXT.test(node.nodeValue || '')) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  while (walker.nextNode()) {
    translateNodeText(walker.currentNode);
  }
}

function flushPendingTranslations() {
  translationTimer = undefined;

  for (const node of pendingTranslationRoots) translateTree(node);
  pendingTranslationRoots.clear();
  hideEnglishLanguageChooser();
  scheduleTranslationAudit();
}

function scheduleTranslateTree(node) {
  pendingTranslationRoots.add(node);

  if (translationTimer) return;

  translationTimer = setTimeout(flushPendingTranslations, 50);
}

function observeTranslations() {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) scheduleTranslateTree(node);
      if (mutation.type === 'characterData') scheduleTranslateTree(mutation.target);
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true,
  });
}

function bindEnglishNavigation() {
  document.addEventListener(
    'click',
    (event) => {
      const anchor = event.target instanceof Element && event.target.closest('a[href]');
      if (!(anchor instanceof HTMLAnchorElement)) return;

      const href = englishUrl(anchor.href);
      if (!href) return;

      event.preventDefault();
      location.href = href;
    },
    true,
  );
}

function bindEnglishRouteChanges() {
  if (history[HISTORY_PATCHED_KEY]) return;

  history[HISTORY_PATCHED_KEY] = true;

  for (const method of ['pushState', 'replaceState']) {
    const original = history[method];

    history[method] = function patchedEnglishHistoryMethod(...args) {
      const result = original.apply(this, args);
      redirectToEnglish();
      return result;
    };
  }

  addEventListener('popstate', redirectToEnglish);
}

function bindLazyTranslationPasses() {
  for (const delay of [500, 1500, 3000, 6000]) {
    setTimeout(() => scheduleTranslateTree(document.documentElement), delay);
  }

  addEventListener('scroll', () => scheduleTranslateTree(document.documentElement), {
    passive: true,
  });
}

export function applyEnglishLanguage() {
  redirectToEnglish();
  resetPageAuditIfNeeded();

  if (document.readyState === 'loading') {
    document.addEventListener(
      'DOMContentLoaded',
      () => {
        translateTree(document.documentElement);
        hideEnglishLanguageChooser();
        scheduleTranslationAudit();
      },
      { once: true },
    );
  } else {
    translateTree(document.documentElement);
    hideEnglishLanguageChooser();
    scheduleTranslationAudit();
  }

  observeTranslations();
  bindEnglishNavigation();
  bindEnglishRouteChanges();
  bindLazyTranslationPasses();
}
