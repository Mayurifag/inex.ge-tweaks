import {
  ACTIONS_CLASS,
  DECLARATION_ACTION_RE,
  DECLARATION_MODAL_RE,
  PARCEL_DETAILS_MODAL_RE,
  ROW_SELECTOR,
  SECTION_CLASS,
  SIDE_CLASS,
} from './constants.js';
import { isInteractiveTarget, normalizeText } from './dom.js';

const movedElements = new Set();
const originalPositions = new WeakMap();
let declarationRestoreBound = false;
let declarationRowClicksBound = false;
let declarationSubmitReloadBound = false;
let declarationUiOpen = false;
let declarationFormSeen = false;
let replayingDeclarationClick = false;

export function bindDeclarationRowClicks({ isParcelsPath, getRowDeclarationButton }) {
  if (declarationRowClicksBound) return;

  declarationRowClicksBound = true;
  document.addEventListener(
    'click',
    (event) => {
      if (!isParcelsPath() || isDeclarationFormOpen()) return;

      const target = event.target instanceof Element ? event.target : null;
      if (!target || isInteractiveTarget(target)) return;

      const row = target.closest(ROW_SELECTOR);
      const button = row && getRowDeclarationButton(row);
      if (!button) return;

      event.preventDefault();
      event.stopImmediatePropagation();
      button.click();
    },
    true,
  );
}

export function bindDeclarationEscapeDismiss(isParcelsPath) {
  document.addEventListener(
    'keydown',
    (event) => {
      if (
        event.key !== 'Escape' ||
        !isParcelsPath() ||
        (!isDeclarationFormOpen() && !isParcelDetailsModalOpen())
      ) {
        return;
      }

      event.preventDefault();
      event.stopImmediatePropagation();
      location.reload();
    },
    true,
  );
}

export function bindDeclarationSubmitReload() {
  if (declarationSubmitReloadBound) return;

  declarationSubmitReloadBound = true;
  const nativeOpen = XMLHttpRequest.prototype.open;
  const nativeSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function openWithDeclarationSubmitReload(method, url, ...rest) {
    this.inexDeclarationSubmitUrl = getRequestPath(url);
    return nativeOpen.call(this, method, url, ...rest);
  };

  XMLHttpRequest.prototype.send = function sendWithDeclarationSubmitReload(...args) {
    if (isDeclarationSubmitUrl(this.inexDeclarationSubmitUrl)) {
      this.addEventListener('loadend', () => {
        const ok = this.status >= 200 && this.status < 300;
        if (ok) reloadParcelsAfterDeclaration();
      });
    }

    return nativeSend.apply(this, args);
  };
}

export function bindDeclarationDomRestore({ getRowDeclarationButton, refreshParcelDataSoon }) {
  if (declarationRestoreBound) return;

  declarationRestoreBound = true;
  document.addEventListener(
    'click',
    (event) => {
      const target = event.target instanceof Element ? event.target : null;
      const control = target?.closest('button, a, [role="button"], [class*="cursor-pointer"]');
      if (control?.closest('form')) return;

      const text = normalizeText(control?.textContent || '');
      if (DECLARATION_ACTION_RE.test(text)) {
        if (!replayingDeclarationClick) {
          event.preventDefault();
          event.stopImmediatePropagation();
          openDeclarationFromRestoredRow(control, getRowDeclarationButton);
          return;
        }

        declarationUiOpen = true;
      }
    },
    true,
  );
  document.addEventListener(
    'submit',
    (event) => {
      if (
        event.target instanceof Element &&
        DECLARATION_MODAL_RE.test(event.target.textContent || '')
      ) {
        restoreMovedParcelDom();
        declarationUiOpen = false;
        declarationFormSeen = false;
        refreshParcelDataSoon();
      }
    },
    true,
  );
}

export function enterDeclarationFormIfOpen() {
  if (!isDeclarationFormOpen()) return false;

  declarationFormSeen = true;
  return true;
}

export function isDeclarationUiBlockingEnhancement() {
  if (declarationUiOpen && declarationFormSeen) {
    declarationUiOpen = false;
    declarationFormSeen = false;
    return false;
  }

  return declarationUiOpen;
}

export function isDeclarationFormOpen() {
  const modalText = document.getElementById('modal-root')?.textContent || '';
  if (DECLARATION_MODAL_RE.test(modalText)) return true;

  return [...document.querySelectorAll('form')].some((form) =>
    DECLARATION_MODAL_RE.test(form.textContent || ''),
  );
}

export function isParcelDetailsModalOpen() {
  return [...document.querySelectorAll('div[class*="fixed"][class*="inset-0"]')].some(
    (element) =>
      element instanceof HTMLElement &&
      element.getBoundingClientRect().height > 0 &&
      PARCEL_DETAILS_MODAL_RE.test(element.textContent || ''),
  );
}

export function moveElement(element, parent) {
  if (!element || !parent || element.parentElement === parent) return;

  rememberMovedElement(element);
  parent.append(element);
}

export function restoreMovedParcelDom(scope = document) {
  for (const element of [...movedElements]) {
    if (scope !== document && !scope?.contains(element)) continue;

    const position = originalPositions.get(element);
    movedElements.delete(element);
    originalPositions.delete(element);
    if (!position?.parent?.isConnected || !element.isConnected) continue;

    const nextSibling =
      position.nextSibling?.parentNode === position.parent ? position.nextSibling : null;
    if (element.parentNode !== position.parent || element.nextSibling !== nextSibling) {
      position.parent.insertBefore(element, nextSibling);
    }
  }

  for (const element of scope.querySelectorAll(
    `.${SIDE_CLASS}, .${SECTION_CLASS}, .inex-enhanced-parcels__status-cell, .${ACTIONS_CLASS}`,
  )) {
    element.remove();
  }
}

export function pruneMovedElements() {
  for (const element of [...movedElements]) {
    const position = originalPositions.get(element);
    if (element.isConnected && position?.parent?.isConnected) continue;

    movedElements.delete(element);
    originalPositions.delete(element);
  }
}

function openDeclarationFromRestoredRow(control, getRowDeclarationButton) {
  const row = control?.closest(ROW_SELECTOR);
  if (!row) return;

  restoreMovedParcelDom(row);

  const button = getRowDeclarationButton(row);
  if (!button) return;

  declarationUiOpen = true;
  replayingDeclarationClick = true;
  try {
    button.click();
  } finally {
    replayingDeclarationClick = false;
  }
}

function rememberMovedElement(element) {
  if (!element || originalPositions.has(element)) return;

  originalPositions.set(element, {
    parent: element.parentNode,
    nextSibling: element.nextSibling,
  });
  movedElements.add(element);
}

function isDeclarationSubmitUrl(url) {
  return /\/front\/cabinet\/parcels\/\d+\/declare$/.test(url);
}

function reloadParcelsAfterDeclaration() {
  setTimeout(() => location.reload(), 100);
}

function getRequestPath(value) {
  try {
    const url = new URL(value, location.href);
    return `${url.pathname}${url.search}`;
  } catch {
    return value;
  }
}
