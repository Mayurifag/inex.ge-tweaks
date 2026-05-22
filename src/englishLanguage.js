import { DYNAMIC_TRANSLATIONS, TRANSLATIONS } from './englishTranslations.js';

const GEORGIAN_TEXT = /[\u10a0-\u10ff]/;
const HISTORY_PATCHED_KEY = 'inexEnglishLanguagePatched';
const TRANSLATED_ATTRIBUTES = ['alt', 'aria-label', 'title', 'placeholder'];
const OBSERVED_ATTRIBUTES = [...TRANSLATED_ATTRIBUTES, 'href'];

let translationTimer;
const pendingTranslationRoots = new Set();

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
  if (!/^\/ka(?:\/|$)/.test(next.pathname)) return null;

  next.pathname = next.pathname.replace(/^\/ka(?=\/|$)/, '/en');
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
    node.nodeValue = node.nodeValue.replace(node.nodeValue.trim(), dynamicTranslation);
  }
}

function translateAttributes(element) {
  for (const attribute of TRANSLATED_ATTRIBUTES) {
    const value = element.getAttribute(attribute);
    if (!value || !GEORGIAN_TEXT.test(value)) continue;

    const translation = TRANSLATIONS.get(normalizeText(value));
    if (translation) element.setAttribute(attribute, translation);
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
      if (mutation.type === 'attributes') scheduleTranslateTree(mutation.target);
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: OBSERVED_ATTRIBUTES,
  });
}

function bindEnglishNavigation() {
  document.addEventListener(
    'click',
    (event) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const anchor = event.target instanceof Element && event.target.closest('a[href]');
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target && anchor.target !== '_self') return;

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
}

export function applyEnglishLanguage() {
  redirectToEnglish();

  if (document.readyState === 'loading') {
    document.addEventListener(
      'DOMContentLoaded',
      () => {
        translateTree(document.documentElement);
        hideEnglishLanguageChooser();
      },
      { once: true },
    );
  } else {
    translateTree(document.documentElement);
    hideEnglishLanguageChooser();
  }

  observeTranslations();
  bindEnglishNavigation();
  bindEnglishRouteChanges();
  bindLazyTranslationPasses();
}
