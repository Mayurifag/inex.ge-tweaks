import { HIDDEN_CLASS } from './constants.js';

export function onReady(callback) {
  if (document.body) {
    callback();
    return;
  }

  document.addEventListener('DOMContentLoaded', callback, { once: true });
}

export function isInteractiveTarget(target) {
  return !!target.closest(
    'button, a, input, textarea, select, label, [role="button"], [role="link"], [contenteditable="true"]',
  );
}

export function normalizeText(text) {
  return text.replace(/\s+/g, ' ').trim();
}

export function findByClasses(tag, parts, root = document) {
  return findAllByClasses(root, parts, tag)[0] || null;
}

export function findAllByClasses(root, parts, tag = '*') {
  if (!root) return [];

  return [...root.querySelectorAll(tag)].filter((element) => {
    const className = element.getAttribute('class') || '';
    return parts.every((part) => className.includes(part));
  });
}

export function findAllByText(root, pattern) {
  if (!root) return [];

  return [...root.querySelectorAll('*')].filter((element) =>
    pattern.test(element.textContent || ''),
  );
}

export function add(element, name) {
  element?.classList.add(`inex-enhanced-parcels__${name}`);
  return element;
}

export function setTextContent(element, value) {
  if (element.textContent !== value) element.textContent = value;
}

export function areAllChildrenHidden(element) {
  return [...(element?.children || [])].every((child) => child.classList.contains(HIDDEN_CLASS));
}
