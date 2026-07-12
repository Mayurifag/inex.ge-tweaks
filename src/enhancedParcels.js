import {
  GM_addStyle,
  GM_getValue,
  GM_registerMenuCommand,
  GM_setValue,
  GM_unregisterMenuCommand,
} from '$';
import enhancedParcelsCss from './enhancedParcels.css?raw';
import {
  ACTIONS_CLASS,
  ARRIVED_RE,
  BATUMI_RE,
  DECLARATION_ACTION_RE,
  DECLARATION_STATUS_RE,
  DESCRIPTION_ATTRIBUTE,
  DETAIL_USER_FIELD_ATTRIBUTE,
  FILTER_STORAGE_KEY,
  GROUP_SELECTOR,
  HIDDEN_CLASS,
  OBSERVED_ATTRIBUTES,
  ORIGIN_ATTRIBUTE,
  ROOT_CLASS,
  ROW_SELECTOR,
  SIDE_CLASS,
  STORAGE_KEY,
  SYSTEM_USER_RE,
  TAKEOUT_RE,
  TAKEOUT_STATUS,
  TRACKING_CODE_ATTRIBUTE,
  USER_DETAIL_LABEL_RE,
} from './enhancedParcels/constants.js';
import {
  bindDeclarationDomRestore,
  bindDeclarationEscapeDismiss,
  bindDeclarationRowClicks,
  bindDeclarationSubmitReload,
  enterDeclarationFormIfOpen,
  isDeclarationFormOpen,
  isDeclarationUiBlockingEnhancement,
  moveElement,
  pruneMovedElements,
} from './enhancedParcels/declarationDom.js';
import {
  add,
  areAllChildrenHidden,
  findAllByClasses,
  findAllByText,
  findByClasses,
  normalizeText,
  onReady,
  setTextContent,
} from './enhancedParcels/dom.js';
import {
  clearParcelDataCache,
  DATA_TTL,
  loadParcelData,
  parseDate,
  readParcelDataCache,
  writeParcelDataCache,
} from './enhancedParcels/parcelData.js';
import {
  getOriginLabel,
  getOriginTooltip,
  getOriginTransportType,
  hasOriginInfo,
  mergeCountryInfo,
} from './enhancedParcels/origin.js';
import { renderRowSections } from './enhancedParcels/rowSections.js';

let menuCommandId;
let observer;
let trimRaf;
let parcelDataPromise;
let parcelDataFetchedAt = 0;
let parcelInfoByTracking = new Map();

export function applyEnhancedParcels() {
  GM_addStyle(enhancedParcelsCss);
  registerMenuCommand();
  patchHistory();
  bindDeclarationDomRestore({ getRowDeclarationButton, refreshParcelDataSoon });
  bindDeclarationRowClicks({ isParcelsPath, getRowDeclarationButton });
  bindDeclarationEscapeDismiss(isParcelsPath);
  bindDeclarationSubmitReload();
  updateEnhancedParcels();
  onReady(() => {
    observeDom();
    updateEnhancedParcels();
  });
  window.addEventListener('popstate', updateEnhancedParcels);
}

function getRowDeclarationButton(row) {
  return [...row.querySelectorAll('button, [role="button"]')].find((button) =>
    DECLARATION_ACTION_RE.test(normalizeText(button.textContent || '')),
  );
}

function isParcelsPath() {
  return /^\/(?:en|ka|ru)\/profile\/parcels\/?$/.test(window.location.pathname);
}

function isEnabled() {
  return GM_getValue(STORAGE_KEY, true);
}

function setEnabled(value) {
  GM_setValue(STORAGE_KEY, value);
  registerMenuCommand();

  if (!value && isParcelsPath()) {
    location.reload();
    return;
  }

  updateEnhancedParcels();
}

function updateEnhancedParcels() {
  const active = isParcelsPath() && isEnabled();

  document.documentElement.classList.toggle(ROOT_CLASS, active);
  document.body?.classList.toggle(ROOT_CLASS, active);

  if (!active) return;

  localStorage.setItem(FILTER_STORAGE_KEY, 'false');
  removeTakeoutStatusFilter();
  scheduleEnhance();
}

function registerMenuCommand() {
  if (menuCommandId) GM_unregisterMenuCommand(menuCommandId);

  const enabled = isEnabled();
  menuCommandId = GM_registerMenuCommand(`Enhanced parcels: ${enabled ? 'on' : 'off'}`, () =>
    setEnabled(!enabled),
  );
}

function removeTakeoutStatusFilter() {
  const url = new URL(window.location.href);
  if (url.searchParams.get('status') !== TAKEOUT_STATUS) return;

  url.searchParams.delete('status');
  window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
}

function patchHistory() {
  for (const method of ['pushState', 'replaceState']) {
    const original = window.history[method];
    if (original.inexEnhancedParcelsPatched) continue;

    window.history[method] = function patchedHistoryMethod(...args) {
      const result = original.apply(this, args);
      window.dispatchEvent(new Event('inex-location-change'));
      return result;
    };
    window.history[method].inexEnhancedParcelsPatched = true;
  }

  window.addEventListener('inex-location-change', updateEnhancedParcels);
}

function observeDom() {
  if (observer || !document.body) return;

  observer = new MutationObserver((mutations) => {
    if (mutations.every(isOwnAttributeMutation)) return;
    if (isDeclarationFormOpen() && mutations.every(isDeclarationFormMutation)) return;

    scheduleEnhance();
  });
  observer.observe(document.body, {
    childList: true,
    characterData: true,
    subtree: true,
    attributes: true,
    attributeOldValue: true,
    attributeFilter: OBSERVED_ATTRIBUTES,
  });
}

function isOwnAttributeMutation(mutation) {
  if (mutation.type !== 'attributes' || !(mutation.target instanceof Element)) return false;

  if (mutation.attributeName === 'class') {
    return areClassListsEqualWithoutOwn(mutation.oldValue, mutation.target.getAttribute('class'));
  }

  if (mutation.attributeName === 'style') {
    return (
      normalizeStyleWithoutOrder(mutation.oldValue) ===
      normalizeStyleWithoutOrder(mutation.target.getAttribute('style'))
    );
  }

  return false;
}

function isDeclarationFormMutation(mutation) {
  const target =
    mutation.target instanceof Element ? mutation.target : mutation.target.parentElement;
  return !!target?.closest('form') && isDeclarationFormOpen();
}

function areClassListsEqualWithoutOwn(a, b) {
  const classesA = getExternalClassList(a);
  const classesB = getExternalClassList(b);
  if (classesA.length !== classesB.length) return false;
  return classesA.every((className, index) => className === classesB[index]);
}

function getExternalClassList(value) {
  return (value || '')
    .split(/\s+/)
    .filter((className) => className && !className.startsWith('inex-enhanced-'))
    .sort();
}

function normalizeStyleWithoutOrder(value) {
  const element = document.createElement('div');
  const styles = [];

  element.setAttribute('style', value || '');
  for (let index = 0; index < element.style.length; index++) {
    const property = element.style.item(index);
    if (property === 'order') continue;

    styles.push(
      `${property}:${element.style.getPropertyValue(property)}:${element.style.getPropertyPriority(property)}`,
    );
  }

  return styles.sort().join(';');
}

function scheduleEnhance() {
  if (!document.documentElement.classList.contains(ROOT_CLASS) || trimRaf) return;

  trimRaf = requestAnimationFrame(() => {
    trimRaf = undefined;
    enhanceParcelsDom();
  });
}

function enhanceParcelsDom() {
  ensureParcelData();

  if (enterDeclarationFormIfOpen()) return;
  if (isDeclarationUiBlockingEnhancement()) return;

  enhanceChrome();
  enhanceTabsAndPanel();
  enhanceLocations();

  enhanceRows();
  enhanceParcelDetails();
}

function refreshParcelDataSoon() {
  setTimeout(() => {
    clearParcelDataCache();
    parcelInfoByTracking = new Map();
    parcelDataFetchedAt = 0;
    ensureParcelData();
    scheduleEnhance();
  }, 1500);
}

function enhanceChrome() {
  const header = add(findByClasses('div', ['fixed', 'top-0', 'h-24', 'z-[10000]']), 'header');
  const mobileHeader = add(
    findByClasses('div', ['sticky', 'top-0', 'h-16', 'md:hidden']),
    'mobile-header',
  );
  add(findByClasses('div', ['fixed', 'top-24', 'w-72']), 'sidebar');
  add(findByClasses('div', ['md:ml-72', 'md:mt-24']), 'content');
  hideNotifications(header, mobileHeader);
  hideAccountName(header);
  hideAccountName(mobileHeader);

  for (const link of findAllByClasses(document, ['px-6', 'py-2.5', 'gap-x-3'])) {
    add(link, 'sidebar-link');
  }
  for (const link of findAllByClasses(document, ['pl-14', 'py-2'])) {
    add(link, 'sidebar-child-link');
  }
}

function enhanceTabsAndPanel() {
  add(findByClasses('div', ['flex-col', 'gap-y-3', 'px-3']), 'page');
  for (const title of findAllByText(document, /^Online Parcels$/)) add(title, 'page-title');
  add(findByClasses('div', ['sticky', 'top-0', 'z-10', 'bg-white']), 'tabs-wrap');
  const tabs = add(findByClasses('div', ['no-scrollbar', 'overflow-x-scroll']), 'tabs');
  add(findByClasses('div', ['subtle-scrollbar', 'overflow-y-auto']), 'scroll');
  const panel = add(
    findByClasses('div', ['rounded-lg', 'bg-additional-background-2', 'md:p-6']),
    'panel',
  );
  add(panel?.firstElementChild, 'panel-header');

  document.querySelector('[title="Toggle filters"]')?.classList.add(HIDDEN_CLASS);
  document.querySelector('form[class*="2xl:flex-row"]')?.classList.add(HIDDEN_CLASS);

  for (const tab of tabs?.children || []) {
    add(tab, 'tab');
    tab.firstElementChild?.classList.add(HIDDEN_CLASS);
    tab.classList.toggle(HIDDEN_CLASS, TAKEOUT_RE.test(tab.textContent || ''));
  }
}

function enhanceLocations() {
  for (const flight of findAllByClasses(document, ['relative', 'rounded-[20px]'])) {
    add(flight, 'flight');
    add(flight.firstElementChild, 'flight-header');
    for (const noisy of findAllByClasses(flight, ['justify-between', 'py-2'])) {
      noisy.classList.add(HIDDEN_CLASS);
    }
    for (const noisy of findAllByClasses(flight, ['-mx-1', 'rounded-full'])) {
      noisy.classList.add(HIDDEN_CLASS);
    }
    for (const noisy of findAllByClasses(flight, ['border-t-1'])) {
      noisy.classList.add(HIDDEN_CLASS);
    }
  }

  for (const group of document.querySelectorAll(GROUP_SELECTOR)) {
    const header = group.firstElementChild;
    const person = header?.children?.[0];
    const pickup = header?.children?.[1];

    add(group, 'location');
    add(header, 'location-header');
    add(group.querySelector('[class*="flex"][class*="flex-col"][class*="gap-y-1"]'), 'rows');

    person?.classList.add(HIDDEN_CLASS);
    add(pickup, 'pickup');
    pickup?.classList.toggle(HIDDEN_CLASS, BATUMI_RE.test(pickup.textContent || ''));
    header?.classList.toggle(HIDDEN_CLASS, areAllChildrenHidden(header));
  }
}

function enhanceRows() {
  pruneMovedElements();

  const rows = [...document.querySelectorAll(ROW_SELECTOR)];

  for (const row of rows) {
    restoreMisplacedRowInfo(row);
    add(row, 'row');
    row.classList.toggle(HIDDEN_CLASS, isTakeoutRow(row));
    if (row.classList.contains(HIDDEN_CLASS)) continue;

    const children = [...row.children].filter(
      (child) =>
        !child.classList.contains('inex-enhanced-parcels__status-cell') &&
        !child.classList.contains(SIDE_CLASS),
    );
    const info = add(children[0], 'row-info');
    const side = ensureSideCell(row);
    const price = add(getRowPriceElement(side) || getRowPriceElement(row), 'price');
    let paid = add(
      getRowPaidElement(side) || getRowPaidElement(row) || children.find(isPaidElement),
      'paid',
    );
    const declaration =
      getRowDeclarationElement(side) ||
      getRowDeclarationElement(row) ||
      (children.length > 2 ? children[1] : null);

    add(declaration, 'declaration');
    normalizeDeclarationControl(declaration);
    paid = normalizePaidControl(paid);
    row.classList.toggle('inex-enhanced-parcels__row--declaration', !!declaration);
    ensureActionsCell(side, price, declaration, paid);
    enhanceInfo(info, row, side);
    enhancePrice(price);
    movePaidPriceToTooltip(price, paid);

    const sortInfo = getRowSortInfo(row);
    row.classList.toggle('inex-enhanced-parcels__row--active', !sortInfo.arrived);
    row.classList.toggle('inex-enhanced-parcels__row--arrived', sortInfo.arrived);
    row.classList.toggle(
      'inex-enhanced-parcels__row--pending',
      !sortInfo.arrived && !sortInfo.eventCount,
    );
  }

  const visibleRows = rows.filter((row) => !row.classList.contains(HIDDEN_CLASS));

  inferMissingOrigins(visibleRows);
  renderRowSections(visibleRows, { getRowSortInfo, getEtaTime, scheduleEnhance });

  hideEmptyGroups();
  hideEmptyFlights();
}

function restoreMisplacedRowInfo(row) {
  const info = row.querySelector('.inex-enhanced-parcels__row-info');
  if (!info || info.parentElement === row) return;

  info.classList.remove('inex-enhanced-parcels__price', HIDDEN_CLASS);
  row.prepend(info);
}

function enhanceInfo(info, row, side) {
  if (!info) return;

  findByClasses('*', ['h-10', 'w-10', 'rounded-full'], info)?.classList.add(HIDDEN_CLASS);
  add(info.firstElementChild, 'row-content');
  const body = add(findByClasses('div', ['flex-col', 'justify-center'], info), 'row-body');
  const tracking = add(getTrackingElement(info), 'tracking');
  const status = add(findByClasses('div', ['rounded-full', 'tracking-1'], info), 'status');
  const meta = add(findByClasses('div', ['flex-wrap'], info), 'meta');
  const trackingCode = getTrackingCode(tracking);
  const parcelInfo = trackingCode && parcelInfoByTracking.get(trackingCode);

  if (tracking?.parentElement) add(tracking.parentElement, 'tracking-line');
  const statusCell = ensureStatusCell(side, status);

  for (const empty of body?.querySelectorAll('div:empty') || []) empty.classList.add(HIDDEN_CLASS);
  hidePaidItemCost(meta);
  for (const website of meta?.querySelectorAll('a[href]') || [])
    website.classList.add(HIDDEN_CLASS);
  for (const dot of findAllByClasses(meta, ['h-1', 'w-1'])) dot.classList.add(HIDDEN_CLASS);
  for (const icon of status?.querySelectorAll('svg') || []) icon.classList.add(HIDDEN_CLASS);

  const descriptionSource = getDescriptionSource(body, tracking, status);
  if (descriptionSource) {
    tracking?.setAttribute(DESCRIPTION_ATTRIBUTE, descriptionSource.text);
    if (descriptionSource.element !== body) descriptionSource.element.classList.add(HIDDEN_CLASS);
  }

  const description =
    descriptionSource?.text ||
    parcelInfo?.description ||
    tracking?.getAttribute(DESCRIPTION_ATTRIBUTE) ||
    '';
  const origin = parcelInfo ? parcelInfo.origin : getStoredOriginInfo(row);
  updateStatusDisplay(status, parcelInfo);
  const arrived = isArrivedRow(status, parcelInfo);

  updateTrackingDisplay(tracking, trackingCode, description);
  storeOriginInfo(row, origin);
  updateOriginIndicator(tracking, origin);
  statusCell?.classList.toggle(HIDDEN_CLASS, arrived);
  status?.classList.toggle(HIDDEN_CLASS, arrived);
  updateProcessLine(statusCell, status, parcelInfo, arrived);
}

function hideNotifications(header, mobileHeader) {
  const desktopActions = header?.lastElementChild;
  desktopActions?.firstElementChild?.classList.add(HIDDEN_CLASS);
  desktopActions?.firstElementChild?.nextElementSibling?.classList.add(HIDDEN_CLASS);

  const mobileActions = mobileHeader?.firstElementChild;
  mobileActions?.children?.[1]?.classList.add(HIDDEN_CLASS);
}

function hideAccountName(root) {
  for (const account of findAllByText(root, /^IG\d+$/)) {
    const textWrap = account.parentElement;
    const shell = textWrap?.parentElement;

    account.previousElementSibling?.classList.add(HIDDEN_CLASS);
    account.classList.remove(HIDDEN_CLASS);
    textWrap?.classList.remove(HIDDEN_CLASS);
    shell?.classList.remove(HIDDEN_CLASS);
    add(account, 'account-id');
    add(textWrap, 'account-wrap');
    add(shell, 'account-shell');
  }
}

function hidePaidItemCost(meta) {
  const price = meta?.firstElementChild;
  const text = price?.textContent?.trim() || '';
  if (/^(?:[\d.,]+\s*[₾$€¥£₺₽]|[₾$€¥£₺₽]\s*[\d.,]+)/.test(text)) {
    price.classList.add(HIDDEN_CLASS);
  }
}

function getTrackingElement(info) {
  return (
    findByClasses('*', ['[direction:ltr]'], info) || findByClasses('*', ['[direction:rtl]'], info)
  );
}

function enhanceParcelDetails() {
  const currentUserNames = getCurrentUserNames();

  for (const label of findAllByText(document, USER_DETAIL_LABEL_RE)) {
    const labelText = normalizeText(label.textContent || '').replace(/:$/, '');
    const field = getDetailField(label, labelText);
    const value = getDetailFieldValue(label, field, labelText);
    const redundant = isRedundantUserValue(value, currentUserNames);

    if (field && redundant) {
      field.classList.add(HIDDEN_CLASS);
      field.setAttribute(DETAIL_USER_FIELD_ATTRIBUTE, 'true');
    } else if (field?.getAttribute(DETAIL_USER_FIELD_ATTRIBUTE)) {
      field.classList.remove(HIDDEN_CLASS);
      field.removeAttribute(DETAIL_USER_FIELD_ATTRIBUTE);
    }
  }
}

function getDetailField(label, labelText) {
  const parcelRow = label.closest(ROW_SELECTOR);
  let field = label.parentElement;

  while (field && field !== document.body && field !== parcelRow) {
    const text = normalizeText(field.textContent || '');
    const value = getValueAfterLabel(text, labelText);
    if (value && text.length <= 180) return field;
    field = field.parentElement;
  }

  return null;
}

function getDetailFieldValue(label, field, labelText) {
  const siblingValue = normalizeText(label.nextElementSibling?.textContent || '');
  if (siblingValue) return siblingValue;

  if (normalizeText(label.parentElement?.textContent || '').replace(/:$/, '') === labelText) {
    const parentSiblingValue = normalizeText(
      label.parentElement?.nextElementSibling?.textContent || '',
    );
    if (parentSiblingValue) return parentSiblingValue;
  }

  return getValueAfterLabel(normalizeText(field?.textContent || ''), labelText);
}

function getValueAfterLabel(text, label) {
  const index = text.toLowerCase().indexOf(label.toLowerCase());
  if (index < 0) return '';

  return normalizeText(text.slice(index + label.length).replace(/^\s*[:：-]\s*/, ''));
}

function isRedundantUserValue(value, currentUserNames) {
  const text = normalizeText(value);
  if (!text) return false;
  if (SYSTEM_USER_RE.test(text)) return true;
  return currentUserNames.has(normalizePersonName(text));
}

function getCurrentUserNames() {
  const names = new Set();

  for (const account of findAllByText(document, /^IG\d+$/)) {
    addCurrentUserName(names, account.previousElementSibling?.textContent);

    const accountId = normalizeText(account.textContent || '');
    const accountText = normalizeText(account.parentElement?.textContent || '').replace(
      accountId,
      '',
    );
    addCurrentUserName(names, accountText);
  }

  return names;
}

function addCurrentUserName(names, value) {
  const name = normalizePersonName(value || '');
  if (name) names.add(name);
}

function normalizePersonName(value) {
  return normalizeText(value)
    .replace(/\bIG\d+\b/gi, '')
    .replace(/[^\w\u10a0-\u10ff]+/g, ' ')
    .toLowerCase()
    .trim();
}

function hideEmptyGroups() {
  for (const group of document.querySelectorAll(GROUP_SELECTOR)) {
    const rows = [...group.querySelectorAll(ROW_SELECTOR)];
    group.classList.toggle(
      HIDDEN_CLASS,
      rows.length > 0 && rows.every((row) => row.classList.contains(HIDDEN_CLASS)),
    );
  }
}

function hideEmptyFlights() {
  for (const flight of document.querySelectorAll('.inex-enhanced-parcels__flight')) {
    const rows = [...flight.querySelectorAll(ROW_SELECTOR)];
    flight.classList.toggle(
      HIDDEN_CLASS,
      rows.length > 0 && rows.every((row) => row.classList.contains(HIDDEN_CLASS)),
    );
  }
}

function getRowSortInfo(row) {
  const info = getRowParcelInfo(row);
  const status = row.querySelector('.inex-enhanced-parcels__status');
  const arrived = isArrivedRow(status, info);
  const eventCount = getEventCount(info);

  return {
    info,
    arrived,
    eventCount,
  };
}

function getRowParcelInfo(row) {
  const tracking = getTrackingCode(row.querySelector('.inex-enhanced-parcels__tracking'));
  return tracking ? parcelInfoByTracking.get(tracking) : undefined;
}

function getEventCount(info) {
  const count = Number(info?.eventCount);
  if (Number.isFinite(count)) return count;
  return info?.latestEvent ? 1 : 0;
}

function getEtaTime(info) {
  const time = parseDate(info?.expectedArrival)?.getTime();
  return Number.isFinite(time) ? time : Number.POSITIVE_INFINITY;
}

function updateProcessLine(statusCell, status, info, arrived) {
  if (!statusCell) return;

  let process = statusCell.querySelector('.inex-enhanced-parcels__process');

  if (arrived || !info?.processText) {
    process?.remove();
    return;
  }

  if (!process) {
    process = document.createElement('span');
    process.className = 'inex-enhanced-parcels__process';
    status?.after(process);
  }

  setTextContent(process, info.processText);
}

function updateStatusDisplay(status, info) {
  if (!status || !info?.previewStatusText) return;
  setTextContent(status, info.previewStatusText);
}

function ensureSideCell(row) {
  let side = row.querySelector(`:scope > .${SIDE_CLASS}`);
  if (!side) {
    side = document.createElement('span');
    side.className = SIDE_CLASS;
    row.append(side);
  }

  return side;
}

function ensureStatusCell(side, status) {
  if (!side) return null;

  let cell = side.querySelector(':scope > .inex-enhanced-parcels__status-cell');
  if (!cell) {
    cell = document.createElement('span');
    cell.className = 'inex-enhanced-parcels__status-cell';
    side.prepend(cell);
  }

  moveElement(status, cell);
  return cell;
}

function ensureActionsCell(side, price, declaration, paid) {
  let actions = side.querySelector(`:scope > .${ACTIONS_CLASS}`);
  if (!actions) {
    actions = document.createElement('span');
    actions.className = ACTIONS_CLASS;
    side.append(actions);
  }

  moveElement(declaration, actions);
  moveElement(price, actions);
  moveElement(paid, actions);
  return actions;
}

function getRowDeclarationElement(root) {
  return getRowActionCandidates(root).find(
    (element) => getRowDeclarationButton(element) || isDeclarationStatusElement(element),
  );
}

function getRowPriceElement(root) {
  return getRowActionCandidates(root).find((element) => isPriceElement(element));
}

function getRowPaidElement(root) {
  for (const candidate of getRowActionCandidates(root)) {
    if (isPaidElement(candidate)) return candidate;
    const paid = findAllByText(candidate, /^(?:Paid|is paid|გადახდილია|оплачено)$/i)
      .filter(isPaidElement)
      .at(-1);
    if (paid) return paid;
  }

  return undefined;
}

function isPriceElement(element) {
  return (
    [...element.querySelectorAll('button')].some((button) =>
      /^\s*Pay\s*$/i.test(button.textContent || ''),
    ) || findAllByClasses(element, ['rounded-[10px]']).length >= 2
  );
}

function isPaidElement(element) {
  return /^(?:Paid|is paid|გადახდილია|оплачено)$/i.test(normalizeText(element?.textContent || ''));
}

function isDeclarationStatusElement(element) {
  return DECLARATION_STATUS_RE.test(normalizeText(element?.textContent || ''));
}

function getRowActionCandidates(root) {
  const actions = root?.querySelector(`:scope > .${ACTIONS_CLASS}`);
  return [...(actions?.children || []), ...(root?.children || [])];
}

function normalizeDeclarationControl(declaration) {
  if (!declaration) return;

  declaration.classList.remove('inex-enhanced-parcels__price');
  const button = getRowDeclarationButton(declaration);
  if (!button) return;

  for (const child of [...declaration.children]) {
    if (child !== button) child.remove();
  }

  setTextContent(button.querySelector('span') || button, 'Needs Declaration');
  button.setAttribute('aria-label', 'Needs Declaration');
  button.title = 'Create declaration';
}

function normalizePaidControl(paid) {
  if (!paid) return null;

  const wrapper = document.createElement('span');
  wrapper.className = 'inex-enhanced-parcels__paid';

  const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  icon.setAttribute('viewBox', '0 0 24 24');
  icon.setAttribute('fill', 'none');
  icon.setAttribute('stroke', 'currentColor');
  icon.setAttribute('stroke-width', '2');
  icon.setAttribute('stroke-linecap', 'round');
  icon.setAttribute('stroke-linejoin', 'round');

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'M20 6 9 17l-5-5');
  icon.append(path);

  const label = document.createElement('span');
  setTextContent(label, 'Paid');

  wrapper.append(icon, label);
  paid.replaceWith(wrapper);
  return wrapper;
}

function movePaidPriceToTooltip(price, paid) {
  if (!price || !paid) return;

  const amount = price.querySelector('.inex-enhanced-parcels__amount');
  const amountText = normalizeText(amount?.textContent || '');
  if (!amountText) return;

  paid.title = amountText;
  paid.setAttribute('aria-label', `Paid - ${amountText}`);
  amount.classList.add(HIDDEN_CLASS);
}

function getTrackingCode(tracking) {
  if (!tracking) return '';

  const saved = tracking.getAttribute(TRACKING_CODE_ATTRIBUTE);
  const value = tracking.textContent?.trim() || '';
  const description = tracking.getAttribute(DESCRIPTION_ATTRIBUTE);

  if (saved && (!value || value === saved || value === description)) return saved;

  if (value) {
    tracking.setAttribute(TRACKING_CODE_ATTRIBUTE, value);
    tracking.removeAttribute(DESCRIPTION_ATTRIBUTE);
  }
  return value;
}

function updateTrackingDisplay(tracking, trackingCode, description) {
  if (!tracking) return;

  const text = description ? prettifyPackageName(description) : trackingCode;
  if (text && tracking.textContent?.trim() !== text) tracking.textContent = text;
  if (description) {
    tracking.setAttribute(DESCRIPTION_ATTRIBUTE, text);
  } else {
    tracking.removeAttribute(DESCRIPTION_ATTRIBUTE);
  }
  tracking.classList.remove('inex-enhanced-parcels__tracking--description');
  tracking.classList.remove(HIDDEN_CLASS);
}

function updateOriginIndicator(tracking, origin) {
  const line = tracking?.parentElement;
  if (!line) return;

  let indicator = line.querySelector('.inex-enhanced-parcels__origin');
  if (!hasOriginInfo(origin)) {
    indicator?.remove();
    return;
  }

  if (!indicator) {
    indicator = document.createElement('span');
    indicator.className = 'inex-enhanced-parcels__origin';
    tracking.before(indicator);
  }

  const transportType = getOriginTransportType(origin);

  setTextContent(indicator, getOriginLabel(origin));
  indicator.title = getOriginTooltip(origin);
  indicator.dataset.tooltip = getOriginTooltip(origin);
  indicator.dataset.country = origin.countryCode || '';
  indicator.dataset.transport = transportType;
}

function inferMissingOrigins(rows) {
  for (const row of rows) {
    const stored = getStoredOriginInfo(row);
    if (hasOriginInfo(stored)) continue;

    const origin = getSiblingOriginInfo(row);
    if (!origin.countryCode && !origin.countryName) continue;

    storeOriginInfo(row, origin);
    updateOriginIndicator(row.querySelector('.inex-enhanced-parcels__tracking'), origin);
  }
}

function getSiblingOriginInfo(row) {
  const group = row.closest(GROUP_SELECTOR);
  const candidates = group ? [...group.querySelectorAll(ROW_SELECTOR)] : [];
  const index = candidates.indexOf(row);

  for (let distance = 1; distance < candidates.length; distance++) {
    const before = candidates[index - distance];
    const after = candidates[index + distance];
    const origin = mergeCountryInfo(getStoredOriginInfo(before), getStoredOriginInfo(after));
    if (origin.countryCode || origin.countryName) return origin;
  }

  return {};
}

function getStoredOriginInfo(row) {
  try {
    return JSON.parse(row?.getAttribute(ORIGIN_ATTRIBUTE)) || {};
  } catch {
    return {};
  }
}

function storeOriginInfo(row, origin) {
  if (!row) return;

  if (!hasOriginInfo(origin)) {
    row.removeAttribute(ORIGIN_ATTRIBUTE);
    return;
  }

  row.setAttribute(ORIGIN_ATTRIBUTE, JSON.stringify(origin));
}

function getDescriptionSource(body, tracking, status) {
  if (!body) return null;

  const trackingLine = tracking?.parentElement;
  const trackingCode = getTrackingCode(tracking);
  const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const text = normalizeText(node.nodeValue || '');
      const parent = node.parentElement;
      if (!text || text === trackingCode || !parent) return NodeFilter.FILTER_REJECT;
      if (parent.closest(`.${HIDDEN_CLASS}`)) return NodeFilter.FILTER_REJECT;
      if (trackingLine?.contains(parent) || status?.contains(parent))
        return NodeFilter.FILTER_REJECT;
      if (isDescriptionNoise(text)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  if (!walker.nextNode()) return null;

  return {
    text: normalizeText(walker.currentNode.nodeValue || ''),
    element: walker.currentNode.parentElement,
  };
}

function isArrivedRow(status, info) {
  if (info && typeof info.arrived === 'boolean') return info.arrived;
  return matchesStatusText(status, ARRIVED_RE);
}

function isTakeoutRow(row) {
  const info = getRowParcelInfo(row);
  return Boolean(
    info?.status === Number(TAKEOUT_STATUS) || matchesStatusText(getRowStatus(row), TAKEOUT_RE),
  );
}

function getRowStatus(row) {
  return (
    row.querySelector('.inex-enhanced-parcels__status') ||
    findByClasses('div', ['rounded-full', 'tracking-1'], row)
  );
}

function matchesStatusText(element, pattern) {
  return pattern.test(normalizeText(element?.textContent || ''));
}

function isDescriptionNoise(text) {
  return (
    /^(?:[\d.,]+\s*[₾$€¥£₺₽]|[₾$€¥£₺₽]\s*[\d.,]+)/.test(text) ||
    /^(?:Paid|is paid|გადახდილია|оплачено)$/i.test(text) ||
    /^[·•]$/.test(text)
  );
}

function prettifyPackageName(value) {
  const text = normalizeText(value).replace(/[_-]+/g, ' ');
  if (!/[a-z]/i.test(text) || text !== text.toUpperCase()) return text;

  return text.toLowerCase().replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
}

function enhancePrice(price) {
  if (!price) return;

  price.classList.remove('inex-enhanced-parcels__declaration');
  const badges = findAllByClasses(price, ['rounded-[10px]']);
  add(badges[0], 'weight');
  add(badges[1], 'amount');

  for (const paid of findAllByText(price, /^(?:Paid|is paid|გადახდილია|оплачено)$/i)) {
    paid.classList.add(HIDDEN_CLASS);
  }
  for (const icon of price.querySelectorAll('svg.lucide-check')) icon.classList.add(HIDDEN_CLASS);
  for (const tooltip of findAllByClasses(price, ['cursor-help']))
    tooltip.classList.add(HIDDEN_CLASS);
  for (const button of price.querySelectorAll('button')) add(button, 'pay');

  const hasVisibleButton = [...price.querySelectorAll('button')].some(
    (button) => !button.classList.contains(HIDDEN_CLASS),
  );
  const hasVisibleBadge = badges.some((badge) => !badge.classList.contains(HIDDEN_CLASS));
  price.classList.toggle(HIDDEN_CLASS, !hasVisibleButton && !hasVisibleBadge);
}

function ensureParcelData() {
  const cached = readParcelDataCache();
  let shouldReschedule = false;

  if (!parcelInfoByTracking.size && cached) {
    parcelInfoByTracking = cached.info;
    parcelDataFetchedAt = cached.fetchedAt;
    scheduleEnhance();
  }

  if (parcelDataPromise || Date.now() - parcelDataFetchedAt < DATA_TTL) return;

  parcelDataPromise = loadParcelData(cached?.info || new Map(), TAKEOUT_STATUS)
    .then((info) => {
      if (!info) return;

      parcelInfoByTracking = info;
      parcelDataFetchedAt = Date.now();
      writeParcelDataCache(info);
      shouldReschedule = true;
    })
    .catch(() => {
      if (!cached) return;

      parcelInfoByTracking = cached.info;
      parcelDataFetchedAt = cached.fetchedAt;
      shouldReschedule = true;
    })
    .finally(() => {
      parcelDataPromise = undefined;
      if (shouldReschedule) scheduleEnhance();
    });
}
