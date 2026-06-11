import { GM_addStyle } from '$';
import { getCountryFromText } from './countries.js';

const COUNTRY_DEFAULTS = {
  CN: { currency: 'CNY', origin: 'taobao.com' },
  US: { currency: 'USD', origin: 'amazon.com' },
  UK: { currency: 'GBP' },
  GB: { currency: 'GBP' },
  TR: { currency: 'TRY' },
  DE: { currency: 'EUR' },
  GR: { currency: 'EUR' },
  IT: { currency: 'EUR' },
  ES: { currency: 'EUR' },
  CY: { currency: 'EUR' },
  PL: { currency: 'PLN' },
  GE: { currency: 'GEL' },
};

const CURRENCY_PATTERNS = {
  CNY: /cny|yuan|renminbi|rmb|¥|იუან|юан|юань|ჩინ/i,
  USD: /usd|dollar|\$|აშშ|американ/i,
  EUR: /eur|euro|€/i,
  GBP: /gbp|pound|£|sterling/i,
  TRY: /try|lira|₺|ლირ|лир/i,
  PLN: /pln|zloty|zł|ზლოტ|злот/i,
  GEL: /gel|lari|₾|ლარ|лари/i,
};

const AI_DECLARATION_RE = /\bai\b.*declar|declar.*\bai\b|ai-declaration|ხელოვნურ|искусствен/i;
const UPLOAD_INVOICE_RE =
  /upload invoice|invoice upload|ატვირთეთ ინვოისი|ინვოისის ატვირთვა|загруз.*инвойс|загруз.*счет/i;
const GENERATE_INVOICE_RE = /generate|გენერირება|დამუშავება|сгенер|обработ/i;
const AI_INVOICE_FLOW_RE =
  /\bai\b|ai declaration|processing invoice|process invoice|generate|ხელოვნურ|გენერირება|დამუშავება|искусствен|обработ|сгенер/i;
const MANUAL_INVOICE_RE = /by hand|manual|manually|ხელით|ручн/i;
const DECLARATION_FORM_RE =
  /sender origin|origin site|total amount|item cost|quantity|category|currency|გამომგზავნ|ჯამური|რაოდენობა|კატეგორია|ვალუტა|ღირებულება|отправител|общая стоимость|колич|категор|валют|стоимость|цена/i;
const DECLARATION_CLICK_RE = /declaration|declare\b|დეკლარ|деклар/i;
const CATEGORY_RE = /category|კატეგორია|категор/i;
const CURRENCY_RE = /currency|ვალუტა|валют/i;
const QUANTITY_RE = /quantity|რაოდენობა|колич/i;
const TOTAL_AMOUNT_RE = /order total amount|total amount|ჯამური|общая/i;
const ITEM_COST_RE = /item cost|cost|ღირებულება|стоимость|цена/i;
const SENDER_ORIGIN_RE = /sender origin|origin site|website|საიტი|გამომგზავნ|отправител|сайт/i;
const OTHER_RE = /other|uncertain|unknown|სხვა|გაურკვეველი|უცნობი|другое|прочее|неизвест/i;
const REMEMBERED_COUNTRY_TTL = 10_000;
const HIDDEN_AI_ATTRIBUTE = 'data-inex-ai-hidden';
const CATEGORY_STYLE = `
.custom-select[data-inex-category-label] {
  position: relative;
}

.custom-select[data-inex-category-label] input {
  background: transparent !important;
  color: transparent !important;
  -webkit-text-fill-color: transparent !important;
}

.custom-select[data-inex-category-label]::after {
  content: attr(data-inex-category-label);
  position: absolute;
  right: 2.5rem;
  bottom: 0.45rem;
  left: 1rem;
  overflow: hidden;
  color: var(--inex-category-label-color, currentColor);
  font-size: 0.875rem;
  line-height: 1.25rem;
  text-overflow: ellipsis;
  white-space: nowrap;
  pointer-events: none;
}
`;

let observer;
let helperTimer;
let categoryStylesInjected = false;
let categoryTranslationsLoading;
let lastCountryCode = '';
let lastCountryRememberedAt = 0;
let userInteractionBound = false;
let activeDeclarationForm;
let userInteractedWithActiveForm = false;
let lastDeclarationFormInteractionAt = 0;
const clickedManualButtons = new WeakSet();
const defaultedFields = new WeakSet();
const selectAttempts = new WeakMap();
const categoryTranslations = new Map([['გაურკვეველი კატეგორია', 'Unknown category']]);

export function applyDeclarationHelper() {
  injectCategoryStyles();
  bindDeclarationClicks();
  bindDeclarationUserInteractions();
  onReady(() => {
    observeDeclarationDom();
    scheduleDeclarationHelper();
  });
}

function onReady(callback) {
  if (document.body) {
    callback();
    return;
  }

  document.addEventListener('DOMContentLoaded', callback, { once: true });
}

function isParcelsPath() {
  return /^\/(?:en|ka|ru)\/profile\/parcels\/?$/.test(window.location.pathname);
}

function observeDeclarationDom() {
  if (observer || !document.body) return;

  observer = new MutationObserver(scheduleDeclarationHelper);
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

function scheduleDeclarationHelper() {
  if (helperTimer) return;

  helperTimer = setTimeout(() => {
    helperTimer = undefined;
    enhanceDeclarationSetup();
  }, 50);
}

function bindDeclarationClicks() {
  document.addEventListener(
    'click',
    (event) => {
      const target = event.target instanceof Element ? event.target : null;
      const control = target?.closest('button, a, [role="button"], [class*="cursor-pointer"]');
      if (!(control instanceof HTMLElement)) return;

      const text = normalizeText(control.textContent || '');
      if (isParcelsPath() && AI_INVOICE_FLOW_RE.test(text) && !MANUAL_INVOICE_RE.test(text)) {
        event.preventDefault();
        event.stopImmediatePropagation();
        hideAiDeclarationButtons(getDeclarationRoot());
        return;
      }

      if (isParcelsPath() && DECLARATION_CLICK_RE.test(text)) {
        rememberCountryFrom(control);
        scheduleDeclarationHelper();
      }
    },
    true,
  );
}

function enhanceDeclarationSetup() {
  if (!isParcelsPath()) return;

  const root = getDeclarationRoot();

  hideAiDeclarationButtons(root);
  clickManualInvoice(root);

  const form = getDeclarationForm(root);
  if (!form) return;
  setActiveDeclarationForm(form);
  loadCategoryTranslations();
  translateCategorySelects(form);
  translateVisibleCategoryOptions();
  fillQuantityDefaults(form);
  syncAmountFields(form);
  defaultCustomSelect(form, CATEGORY_RE, OTHER_RE, 'other', true);
  if (shouldLeaveFormAlone()) return;

  const countryCode = detectCountryCode(form);
  const defaults = COUNTRY_DEFAULTS[countryCode] || {};

  fillSenderOrigin(form, defaults.origin);
  defaultCustomSelect(
    form,
    CURRENCY_RE,
    getCurrencyOptionPattern(defaults.currency),
    defaults.currency,
  );
}

function injectCategoryStyles() {
  if (categoryStylesInjected) return;

  categoryStylesInjected = true;
  GM_addStyle(CATEGORY_STYLE);
}

function loadCategoryTranslations() {
  if (categoryTranslationsLoading) return categoryTranslationsLoading;

  categoryTranslationsLoading = fetch('/api/v1/front/cabinet/hs-categories', {
    headers: getCategoryHeaders(),
  })
    .then((response) => (response.ok ? response.json() : null))
    .then((payload) => {
      for (const item of payload?.data || []) {
        const attributes = item.attributes || {};
        const translation = normalizeText(attributes.originalTextEn || '');
        if (!translation) continue;

        for (const original of [attributes.originalTextKa, attributes.originalText]) {
          const key = normalizeText(original || '');
          if (key) categoryTranslations.set(key, translation);
        }
      }
      scheduleDeclarationHelper();
    })
    .catch(() => {});

  return categoryTranslationsLoading;
}

function getCategoryHeaders() {
  const token =
    localStorage.getItem('accessToken') || sessionStorage.getItem('session_accessToken');
  const tokenType =
    localStorage.getItem('tokenType') || sessionStorage.getItem('session_tokenType') || 'Bearer';
  const headers = {
    'accept-language': 'ka',
    'author-type': localStorage.getItem('chosenUserType') || 'User',
  };

  if (token) {
    const authorId = getJwtSubject(token);
    headers.authorization = `${tokenType} ${token}`;
    if (authorId) headers['author-id'] = authorId;
  }

  return headers;
}

function getJwtSubject(token) {
  try {
    const payload = token.split('.')[1] || '';
    const base64 = payload
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .padEnd(Math.ceil(payload.length / 4) * 4, '=');
    return JSON.parse(atob(base64)).sub || '';
  } catch {
    return '';
  }
}

function translateCategorySelects(form) {
  for (const select of findCustomSelects(form, CATEGORY_RE)) translateCategorySelect(select);
}

function translateCategorySelect(select) {
  const input = select?.querySelector('input');
  if (!(select instanceof HTMLElement) || !(input instanceof HTMLInputElement)) return;

  const original = getFieldValue(input);
  const translation = categoryTranslations.get(original);
  if (!translation) {
    select.removeAttribute('data-inex-category-label');
    return;
  }

  select.dataset.inexCategoryLabel = translation;
  select.style.removeProperty('--inex-category-label-color');
}

function translateVisibleCategoryOptions() {
  for (const option of document.querySelectorAll('li span')) {
    if (!(option instanceof HTMLElement) || !isVisible(option)) continue;

    const original = option.dataset.inexCategoryOriginal || normalizeText(option.textContent || '');
    const translation = categoryTranslations.get(original);
    if (!translation) continue;

    option.dataset.inexCategoryOriginal = original;
    option.title = original;
    if (normalizeText(option.textContent || '') !== translation) option.textContent = translation;
  }
}

function bindDeclarationUserInteractions() {
  if (userInteractionBound) return;

  userInteractionBound = true;
  document.addEventListener('pointerdown', markDeclarationUserInteraction, true);
  document.addEventListener('keydown', markDeclarationUserInteraction, true);
  document.addEventListener('input', syncTotalFromItemInput, true);
  document.addEventListener('input', markDeclarationUserInteraction, true);
  document.addEventListener('click', syncActiveDeclarationFormAfterClick, true);
}

function syncTotalFromItemInput(event) {
  if (event.isTrusted === false) return;

  const target = event.target instanceof Element ? event.target : null;
  const form = target?.closest('form');
  if (!form || !DECLARATION_FORM_RE.test(normalizeText(form.textContent || ''))) return;

  const itemFields = [
    ...getFieldsByLabel(form, QUANTITY_RE),
    ...getFieldsByLabel(form, ITEM_COST_RE),
  ];
  if (itemFields.includes(target)) syncTotalFromItems(form);
}

function syncActiveDeclarationFormAfterClick(event) {
  if (event.isTrusted === false || !activeDeclarationForm?.isConnected) return;

  scheduleDeclarationHelper();
  setTimeout(scheduleDeclarationHelper, 300);
}

function markDeclarationUserInteraction(event) {
  if (event.isTrusted === false) return;

  const target = event.target instanceof Element ? event.target : null;
  const form = target?.closest('form');
  if (!form) return;
  if (!DECLARATION_FORM_RE.test(normalizeText(form.textContent || ''))) return;

  activeDeclarationForm = form;
  userInteractedWithActiveForm = true;
  lastDeclarationFormInteractionAt = Date.now();
  scheduleDeclarationHelper();
  setTimeout(scheduleDeclarationHelper, 300);
}

function setActiveDeclarationForm(form) {
  if (form === activeDeclarationForm) return;

  activeDeclarationForm = form;
  userInteractedWithActiveForm = Date.now() - lastDeclarationFormInteractionAt < 5000;
}

function shouldLeaveFormAlone() {
  return userInteractedWithActiveForm || Date.now() - lastDeclarationFormInteractionAt < 5000;
}

function getDeclarationRoot() {
  const modalRoot = document.getElementById('modal-root');
  if (modalRoot && normalizeText(modalRoot.textContent || '')) return modalRoot;

  return document.body;
}

function hideAiDeclarationButtons(root) {
  for (const button of getButtons(root)) {
    const text = normalizeText(button.textContent || '');
    if (!AI_DECLARATION_RE.test(text) && !AI_INVOICE_FLOW_RE.test(text)) continue;
    if (MANUAL_INVOICE_RE.test(text)) continue;

    button.remove();
  }

  for (const element of [...root.querySelectorAll('*')]) {
    if (element.children.length || !(element instanceof HTMLElement)) continue;
    if (isFormControl(element)) continue;

    const text = normalizeText(element.textContent || '');
    if (element.getAttribute(HIDDEN_AI_ATTRIBUTE) === text) continue;
    if (!AI_DECLARATION_RE.test(text) && !AI_INVOICE_FLOW_RE.test(text)) continue;
    if (MANUAL_INVOICE_RE.test(text)) continue;

    element.style.setProperty('display', 'none', 'important');
    element.setAttribute('aria-hidden', 'true');
    element.setAttribute(HIDDEN_AI_ATTRIBUTE, text);
  }
}

function isFormControl(element) {
  return element.matches('input, textarea, select, option, [contenteditable="true"]');
}

function clickManualInvoice(root) {
  const modalText = normalizeText(root.textContent || '');
  const buttons = getButtons(root);
  const hasInvoiceFlow =
    UPLOAD_INVOICE_RE.test(modalText) ||
    buttons.some((button) => {
      const text = normalizeText(button.textContent || '');
      return MANUAL_INVOICE_RE.test(text) || GENERATE_INVOICE_RE.test(text);
    });
  if (!hasInvoiceFlow || getDeclarationForm(root)) return;

  for (const button of buttons) {
    if (!GENERATE_INVOICE_RE.test(normalizeText(button.textContent || ''))) continue;

    button.style.setProperty('display', 'none', 'important');
    button.setAttribute('aria-hidden', 'true');
  }

  const manualButton = buttons.find(
    (button) => MANUAL_INVOICE_RE.test(button.textContent || '') && isVisible(button),
  );
  if (manualButton && !clickedManualButtons.has(manualButton)) {
    clickedManualButtons.add(manualButton);
    manualButton.click();
  }
}

function getDeclarationForm(root) {
  return [...root.querySelectorAll('form')].find((form) =>
    DECLARATION_FORM_RE.test(normalizeText(form.textContent || '')),
  );
}

function fillQuantityDefaults(form) {
  for (const input of getFieldsByLabel(form, QUANTITY_RE)) {
    if (defaultedFields.has(input)) continue;

    defaultedFields.add(input);
    if (!isBlankOrZero(input)) continue;

    setFieldValue(input, '1');
  }
}

function fillSenderOrigin(form, origin) {
  if (!origin) return;

  const input = getFieldsByLabel(form, SENDER_ORIGIN_RE)[0];
  if (!input || defaultedFields.has(input)) return;

  defaultedFields.add(input);
  if (getFieldValue(input)) return;

  setFieldValue(input, origin);
}

function syncAmountFields(form) {
  hideTotalAmountField(form);
  syncTotalFromItems(form);
}

function hideTotalAmountField(form) {
  const total = getFieldsByLabel(form, TOTAL_AMOUNT_RE)[0];
  const wrapper = total && getFieldWrapper(total);
  if (!wrapper) return;

  wrapper.style.setProperty('display', 'none', 'important');
  wrapper.setAttribute('aria-hidden', 'true');
}

function syncTotalFromItems(form) {
  const total = getFieldsByLabel(form, TOTAL_AMOUNT_RE)[0];
  if (!total) return;

  const sum = getFieldsByLabel(form, ITEM_COST_RE).reduce((result, itemCost, index) => {
    const quantity = getFieldsByLabel(form, QUANTITY_RE)[index];
    const cost = parseAmount(getFieldValue(itemCost));
    if (!Number.isFinite(cost)) return result;

    return result + cost * (parseAmount(getFieldValue(quantity)) || 1);
  }, 0);

  if (!sum) return;

  const totalValue = formatAmount(sum);
  if (getFieldValue(total) === totalValue) return;

  setFieldValue(total, totalValue);
}

function getFieldWrapper(field) {
  let current = field.parentElement;

  while (current && current !== field.form && current !== document.body) {
    const text = normalizeText(current.textContent || '');
    const fieldCount = current.querySelectorAll('input, textarea, .custom-select').length;
    if (TOTAL_AMOUNT_RE.test(text) && fieldCount <= 1) return current;
    current = current.parentElement;
  }

  return field.parentElement;
}

function parseAmount(value) {
  const normalized = normalizeText(value).replace(',', '.');
  if (!normalized) return NaN;

  return Number(normalized);
}

function formatAmount(value) {
  return (Math.round(value * 100) / 100)
    .toFixed(2)
    .replace(/\.00$/, '')
    .replace(/(\.\d)0$/, '$1');
}

function defaultCustomSelect(form, labelPattern, optionPattern) {
  if (!optionPattern) return;

  for (const select of findCustomSelects(form, labelPattern)) {
    defaultSingleCustomSelect(select, optionPattern);
  }
}

function defaultSingleCustomSelect(select, optionPattern) {
  const input = select.querySelector('input');
  const currentValue = getFieldValue(input);
  const hasError = !!select.parentElement?.querySelector('[class*="text-error"]');
  if (shouldLeaveFormAlone()) return;
  if (currentValue && optionPattern.test(currentValue) && !hasError) return;

  const attempts = selectAttempts.get(select) || 0;
  if (attempts >= 6) return;

  selectAttempts.set(select, attempts + 1);
  const trigger = select.firstElementChild;
  if (!(trigger instanceof HTMLElement)) return;

  trigger.click();
  setTimeout(() => clickSelectOption(select, optionPattern), 120);
}

function clickSelectOption(select, optionPattern) {
  if (!select.isConnected || shouldLeaveFormAlone()) return;

  const option = getVisibleSelectOption(optionPattern);
  if (!option) {
    scheduleDeclarationHelper();
    return;
  }

  option.click();
}

function findCustomSelects(form, labelPattern) {
  return [...form.querySelectorAll('.custom-select')].filter((select) =>
    labelPattern.test(normalizeText(select.textContent || '')),
  );
}

function getVisibleSelectOption(optionPattern) {
  return [
    ...document.querySelectorAll('button, [role="option"], [cmdk-item], [data-value], li, div'),
  ]
    .filter(isVisible)
    .filter((element) => optionPattern.test(getOptionText(element)))
    .sort((a, b) => getOptionText(a).length - getOptionText(b).length)[0];
}

function getOptionText(element) {
  return normalizeText(
    [element.textContent, element.getAttribute('data-value'), element.getAttribute('value')]
      .filter(Boolean)
      .join(' '),
  );
}

function getCurrencyOptionPattern(currency) {
  if (!currency) return null;

  const knownPattern = CURRENCY_PATTERNS[currency];
  return knownPattern
    ? new RegExp(`^\\s*(?:${currency}|${knownPattern.source})\\s*$`, 'i')
    : new RegExp(`^\\s*${currency}\\s*$`, 'i');
}

function getFieldsByLabel(root, labelPattern) {
  const fields = new Set();

  for (const field of root.querySelectorAll('input, textarea')) {
    const text = getFieldContextText(field);
    if (labelPattern.test(text)) fields.add(field);
  }

  return [...fields];
}

function getFieldContextText(field) {
  const id = field.getAttribute('id');
  const label = id ? field.ownerDocument.querySelector(`label[for="${cssEscape(id)}"]`) : null;
  return normalizeText(
    [
      field.getAttribute('name'),
      field.getAttribute('placeholder'),
      field.getAttribute('aria-label'),
      label?.textContent,
      getNearestFieldContext(field),
    ]
      .filter(Boolean)
      .join(' '),
  );
}

function getNearestFieldContext(field) {
  let current = field.parentElement;

  while (current && current !== field.form && current !== document.body) {
    const text = normalizeText(current.textContent || '');
    const fieldCount = current.querySelectorAll('input, textarea, .custom-select').length;
    if (text && fieldCount <= 1 && text.length <= 160) return text;
    current = current.parentElement;
  }

  return '';
}

function setFieldValue(field, value) {
  if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement)) return;

  const prototype =
    field instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
  if (setter) {
    setter.call(field, value);
  } else {
    field.value = value;
  }

  field.dispatchEvent(new Event('input', { bubbles: true }));
  field.dispatchEvent(new Event('change', { bubbles: true }));
}

function getFieldValue(field) {
  return field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement
    ? normalizeText(field.value || '')
    : '';
}

function isBlankOrZero(field) {
  return /^\s*(?:0+)?\s*$/.test(getFieldValue(field));
}

function getButtons(root) {
  return [...root.querySelectorAll('button, a, [role="button"]')].filter(
    (button) => button instanceof HTMLElement,
  );
}

function rememberCountryFrom(control) {
  const row = control.closest('[data-inex-origin]');
  const code = getCountryFromOriginAttribute(row) || getCountryFromText(row?.textContent || '');
  lastCountryCode = code;
  lastCountryRememberedAt = Date.now();
}

function detectCountryCode(form) {
  return (
    getRememberedCountryCode() ||
    getCountryFromText(form.closest('[role="dialog"]')?.textContent || '') ||
    getOnlyVisibleOriginCountry() ||
    ''
  );
}

function getRememberedCountryCode() {
  return Date.now() - lastCountryRememberedAt <= REMEMBERED_COUNTRY_TTL ? lastCountryCode : '';
}

function getOnlyVisibleOriginCountry() {
  const codes = new Set(
    [...document.querySelectorAll('[data-inex-origin]')]
      .filter(isVisible)
      .map(
        (element) =>
          getCountryFromOriginAttribute(element) || getCountryFromText(element.textContent || ''),
      )
      .filter(Boolean),
  );

  return codes.size === 1 ? [...codes][0] : '';
}

function getCountryFromOriginAttribute(element) {
  try {
    const origin = JSON.parse(element?.getAttribute('data-inex-origin') || '{}');
    return origin.countryCode || getCountryFromText(origin.countryName || '');
  } catch {
    return '';
  }
}

function isVisible(element) {
  if (!(element instanceof HTMLElement)) return false;

  const style = getComputedStyle(element);
  const rect = element.getBoundingClientRect();
  return (
    style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0
  );
}

function normalizeText(text) {
  return text.replace(/\s+/g, ' ').trim();
}

function cssEscape(value) {
  if (window.CSS?.escape) return CSS.escape(value);

  return value.replace(/[^a-zA-Z0-9_-]/g, '\\$&');
}
