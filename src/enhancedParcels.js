import {
  GM_addStyle,
  GM_getValue,
  GM_registerMenuCommand,
  GM_setValue,
  GM_unregisterMenuCommand,
} from '$';
import enhancedParcelsCss from './enhancedParcels.css?raw';

const STORAGE_KEY = 'inex_enhanced_parcels_enabled';
const FILTER_STORAGE_KEY = 'parcels_filter_open';
const CACHE_STORAGE_KEY = 'inex_enhanced_parcels_data_v2';
const ROOT_CLASS = 'inex-enhanced-parcels';
const HIDDEN_CLASS = 'inex-enhanced-hidden';
const CONTENTS_CLASS = 'inex-enhanced-parcels__contents';
const SECTION_CLASS = 'inex-enhanced-parcels__section';
const SECTION_COLLAPSED_CLASS = 'inex-enhanced-parcels__row--section-collapsed';
const SIDE_CLASS = 'inex-enhanced-parcels__side';
const ACTIONS_CLASS = 'inex-enhanced-parcels__actions';
const TRACKING_CODE_ATTRIBUTE = 'data-inex-tracking-code';
const DESCRIPTION_ATTRIBUTE = 'data-inex-description';
const ORIGIN_ATTRIBUTE = 'data-inex-origin';
const DETAIL_USER_FIELD_ATTRIBUTE = 'data-inex-user-detail-hidden';
const TAKEOUT_STATUS = '5';
const TAKEOUT_RE = /^(?:Takeout|Taken\s*Out|გატანილი|Забрано|Выдано)$/i;
const ARRIVED_RE = /^(?:Arrived|ჩამოსულ(?:ია|ი)?|Прибыл|Прибыло)$/i;
const BATUMI_RE = /batumi|ბათუმ|батуми/i;
const USER_DETAIL_LABEL_RE =
  /^(?:User|Customer|Receiver Client|Subuser|Trustee|მომხმარებელი|მიმღები მომხმარებელი|ქვემომხმარებელი|მინდობილი პირი)(?:\s*[/|]\s*(?:User|Customer|Receiver Client|Subuser|Trustee|მომხმარებელი|მიმღები მომხმარებელი|ქვემომხმარებელი|მინდობილი პირი))*:?$/i;
const SYSTEM_USER_RE =
  /^(?:System|System user|Current user|სისტემა|სისტემური მომხმარებელი|მიმდინარე მომხმარებელი)$/i;
const ROW_SELECTOR =
  'div[class*="cursor-pointer"][class*="bg-additional-background-2"][class*="p-4"][class*="lg:flex-row"]';
const GROUP_SELECTOR = 'div[class*="mt-2"][class*="px-2.5"]';
const API_BASE = 'https://inex.ge/api/v1';
const DATA_TTL = 5 * 60_000;
const EVENT_FETCH_CONCURRENCY = 6;
const OBSERVED_ATTRIBUTES = ['class', 'style', 'disabled', 'aria-disabled', 'data-state', 'hidden'];

let menuCommandId;
let observer;
let trimRaf;
let parcelDataPromise;
let parcelDataFetchedAt = 0;
let parcelInfoByTracking = new Map();
let rowOrderCounter = 0;
const rowOrders = new WeakMap();
const collapsedSections = new Set();

export function applyEnhancedParcels() {
  GM_addStyle(enhancedParcelsCss);
  registerMenuCommand();
  patchHistory();
  updateEnhancedParcels();
  onReady(() => {
    observeDom();
    updateEnhancedParcels();
  });
  window.addEventListener('popstate', updateEnhancedParcels);
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
  enhanceChrome();
  enhanceTabsAndPanel();
  enhanceLocations();
  enhanceRows();
  enhanceParcelDetails();
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
  const rows = [...document.querySelectorAll(ROW_SELECTOR)];

  for (const row of rows) {
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
    const price = add(
      side.querySelector('.inex-enhanced-parcels__price') || children.at(-1),
      'price',
    );
    const declaration =
      side.querySelector('.inex-enhanced-parcels__declaration') ||
      (children.length > 2 ? children[1] : null);

    add(declaration, 'declaration');
    row.classList.toggle('inex-enhanced-parcels__row--declaration', !!declaration);
    ensureActionsCell(side, price, declaration);
    enhanceInfo(info, row, side);
    enhancePrice(price);

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
  renderRowSections(visibleRows);

  hideEmptyGroups();
  hideEmptyFlights();
}

function enhanceInfo(info, row, side) {
  if (!info) return;

  findByClasses('*', ['h-10', 'w-10', 'rounded-full'], info)?.classList.add(HIDDEN_CLASS);
  add(info.firstElementChild, 'row-content');
  const body = add(findByClasses('div', ['flex-col', 'justify-center'], info), 'row-body');
  const tracking = add(findByClasses('*', ['[direction:rtl]'], info), 'tracking');
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
    parcelInfo?.description || tracking?.getAttribute(DESCRIPTION_ATTRIBUTE) || '';
  const origin = mergeOriginInfo(
    parcelInfo?.origin,
    getStoredOriginInfo(row),
    getDomOriginInfo(row),
  );
  const arrived = isArrivedRow(status);

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

function renderRowSections(rows) {
  const panel =
    rows[0]?.closest('.inex-enhanced-parcels__panel') ||
    document.querySelector('.inex-enhanced-parcels__panel');
  if (!panel) return;

  for (const row of rows) {
    if (panel.contains(row)) flattenRowAncestors(row, panel);
  }

  const sections = getRowSections([...rows].sort(compareRows));
  removeUnusedSectionDividers(
    panel,
    sections.map((section) => section.type),
  );

  let order = 10;
  let dividerAnchor = panel.querySelector(':scope > .inex-enhanced-parcels__panel-header');
  for (const section of sections) {
    const collapsed = collapsedSections.has(section.type);
    const divider = getSectionDivider(
      panel,
      section.type,
      section.label,
      section.rows.length,
      collapsed,
    );

    placeSectionDivider(panel, divider, dividerAnchor);
    dividerAnchor = divider;
    divider.style.order = String(order++);
    for (const row of section.rows) {
      row.style.order = String(order++);
      row.classList.toggle(SECTION_COLLAPSED_CLASS, collapsed);
      orderRowDetails(row, order++, collapsed);
    }
  }
}

function placeSectionDivider(parent, divider, anchor) {
  const nextSibling = anchor?.nextSibling || parent.firstChild;
  if (nextSibling !== divider) parent.insertBefore(divider, nextSibling);
}

function flattenRowAncestors(row, root) {
  let element = row.parentElement;

  while (element && element !== root) {
    element.classList.add(CONTENTS_CLASS);
    element = element.parentElement;
  }
}

function orderRowDetails(row, order, collapsed) {
  let element = row.nextElementSibling;

  while (element && !element.matches?.(ROW_SELECTOR)) {
    if (!element.classList.contains(SECTION_CLASS)) {
      element.style.order = String(order);
      element.classList.toggle(SECTION_COLLAPSED_CLASS, collapsed);
    }
    element = element.nextElementSibling;
  }
}

function getRowSections(rows) {
  const sections = [
    { type: 'arrived', label: 'Arrived', rows: [] },
    { type: 'active', label: 'In progress', rows: [] },
  ];

  for (const row of rows) {
    if (getRowSortInfo(row).arrived) {
      sections[0].rows.push(row);
    } else {
      sections[1].rows.push(row);
    }
  }

  return sections.filter((section) => section.rows.length);
}

function getSectionDivider(parent, type, label, count, collapsed) {
  let divider = parent.querySelector(`:scope > .${SECTION_CLASS}[data-section="${type}"]`);

  if (!divider) {
    divider = document.createElement('div');
    divider.className = SECTION_CLASS;
    divider.dataset.section = type;
    divider.tabIndex = 0;
    divider.setAttribute('role', 'button');
    divider.addEventListener('click', () => toggleSection(type));
    divider.addEventListener('keydown', (event) => {
      if (![' ', 'Enter'].includes(event.key)) return;

      event.preventDefault();
      toggleSection(type);
    });
    parent.append(divider);
  }

  setTextContent(divider, `${label} · ${count}`);
  divider.setAttribute('aria-expanded', String(!collapsed));
  return divider;
}

function removeUnusedSectionDividers(parent, types) {
  for (const divider of document.querySelectorAll(`.${SECTION_CLASS}`)) {
    if (divider.parentElement !== parent || !types.includes(divider.dataset.section)) {
      divider.remove();
    }
  }
}

function toggleSection(type) {
  if (collapsedSections.has(type)) {
    collapsedSections.delete(type);
  } else {
    collapsedSections.add(type);
  }

  scheduleEnhance();
}

function compareRows(a, b) {
  const sortA = getRowSortInfo(a);
  const sortB = getRowSortInfo(b);

  const bucketDiff = getRowBucket(sortA) - getRowBucket(sortB);
  if (bucketDiff) return bucketDiff;

  if (sortA.arrived && sortB.arrived) return getRowOrder(a) - getRowOrder(b);

  const processDiff = sortB.eventCount - sortA.eventCount;
  if (processDiff) return processDiff;

  const etaDiff = getEtaTime(sortA.info) - getEtaTime(sortB.info);
  if (etaDiff) return etaDiff;

  return getRowOrder(a) - getRowOrder(b);
}

function getRowBucket(sortInfo) {
  if (sortInfo.arrived) return 0;
  return sortInfo.eventCount > 0 ? 1 : 2;
}

function getRowSortInfo(row) {
  const info = getRowParcelInfo(row);
  const status = row.querySelector('.inex-enhanced-parcels__status');
  const arrived = isArrivedRow(status);
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

function getRowOrder(row) {
  if (!rowOrders.has(row)) rowOrders.set(row, rowOrderCounter++);
  return rowOrders.get(row);
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

  if (status && status.parentElement !== cell) cell.append(status);
  return cell;
}

function ensureActionsCell(side, price, declaration) {
  let actions = side.querySelector(`:scope > .${ACTIONS_CLASS}`);
  if (!actions) {
    actions = document.createElement('span');
    actions.className = ACTIONS_CLASS;
    side.append(actions);
  }

  if (declaration && declaration.parentElement !== actions) actions.append(declaration);
  if (price && price.parentElement !== actions) actions.append(price);
  return actions;
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
  if (!origin?.countryName && !origin?.transportName) {
    indicator?.remove();
    return;
  }

  if (!indicator) {
    indicator = document.createElement('span');
    indicator.className = 'inex-enhanced-parcels__origin';
    tracking.before(indicator);
  }

  setTextContent(indicator, getOriginLabel(origin));
  indicator.title = getOriginTooltip(origin);
  indicator.dataset.tooltip = getOriginTooltip(origin);
  indicator.dataset.transport = origin.transportType || '';
}

function inferMissingOrigins(rows) {
  for (const row of rows) {
    if (hasOriginInfo(getStoredOriginInfo(row))) continue;

    const origin = getSiblingOriginInfo(row);
    if (!hasOriginInfo(origin)) continue;

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
    const origin = mergeOriginInfo(getStoredOriginInfo(before), getStoredOriginInfo(after));
    if (hasOriginInfo(origin)) return origin;
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
  if (!row || !hasOriginInfo(origin)) return;

  row.setAttribute(ORIGIN_ATTRIBUTE, JSON.stringify(origin));
}

function hasOriginInfo(origin) {
  return Boolean(origin?.countryName || origin?.transportName);
}

function getOriginLabel(origin) {
  if (origin.countryCode) return origin.countryCode;
  if (origin.countryName) return origin.countryName.slice(0, 2);

  const labels = { air: 'Air', road: 'Road', sea: 'Sea' };
  return labels[origin.transportType] || origin.transportName || '';
}

function getOriginTooltip(origin) {
  return [origin.countryName, origin.transportName].filter(Boolean).join(' · ');
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

function isArrivedRow(status) {
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

function normalizeText(text) {
  return text.replace(/\s+/g, ' ').trim();
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

  const badges = findAllByClasses(price, ['rounded-[10px]']);
  add(badges[0], 'weight');
  add(badges[1], 'amount');

  for (const paid of findAllByClasses(price, ['bg-green-50'])) paid.classList.add(HIDDEN_CLASS);
  for (const paid of findAllByText(price, /^(?:Paid|is paid|გადახდილია|оплачено)$/i)) {
    paid.classList.add(HIDDEN_CLASS);
  }
  for (const tooltip of findAllByClasses(price, ['cursor-help']))
    tooltip.classList.add(HIDDEN_CLASS);
  for (const button of price.querySelectorAll('button')) add(button, 'pay');

  const hasVisibleButton = [...price.querySelectorAll('button')].some(
    (button) => !button.classList.contains(HIDDEN_CLASS),
  );
  const hasVisibleBadge = badges.some((badge) => !badge.classList.contains(HIDDEN_CLASS));
  price.classList.toggle(HIDDEN_CLASS, !hasVisibleButton && !hasVisibleBadge);
}

function findByClasses(tag, parts, root = document) {
  return findAllByClasses(root, parts, tag)[0] || null;
}

function findAllByClasses(root, parts, tag = '*') {
  if (!root) return [];
  return [...root.querySelectorAll(tag)].filter((element) => {
    const className = element.getAttribute('class') || '';
    return parts.every((part) => className.includes(part));
  });
}

function findAllByText(root, pattern) {
  if (!root) return [];
  return [...root.querySelectorAll('*')].filter((element) =>
    pattern.test(element.textContent || ''),
  );
}

function add(element, name) {
  element?.classList.add(`inex-enhanced-parcels__${name}`);
  return element;
}

function setTextContent(element, value) {
  if (element.textContent !== value) element.textContent = value;
}

function areAllChildrenHidden(element) {
  return [...(element?.children || [])].every((child) => child.classList.contains(HIDDEN_CLASS));
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

  parcelDataPromise = loadParcelData(cached?.info || new Map())
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

async function loadParcelData(cachedInfo) {
  const token =
    localStorage.getItem('accessToken') || sessionStorage.getItem('session_accessToken');
  if (!token) return null;

  const tokenType =
    localStorage.getItem('tokenType') || sessionStorage.getItem('session_tokenType') || 'Bearer';
  const headers = { Authorization: `${tokenType} ${token}`, 'Accept-Language': 'en' };
  const list = await fetchJson(`${API_BASE}/front/cabinet/parcels?perPage=100`, { headers });
  const parcels = flattenParcels(list);
  const activeParcels = parcels.filter((parcel) => parcel.status !== Number(TAKEOUT_STATUS));

  await mapWithConcurrency(activeParcels, EVENT_FETCH_CONCURRENCY, async (parcel) => {
    const cached = cachedInfo.get(parcel.tracking);
    try {
      const events = await fetchParcelEvents(parcel.id, headers);
      parcel.latestEvent = events.latestEvent;
      parcel.eventCount = events.eventCount;
    } catch {
      parcel.latestEvent = cached?.latestEvent || null;
      parcel.eventCount = cached?.eventCount || 0;
    }
  });

  return new Map(
    parcels.map((parcel) => {
      const next = {
        ...parcel,
        processText: getProcessText(parcel),
      };
      return [parcel.tracking, next];
    }),
  );
}

function readParcelDataCache() {
  try {
    const cache = JSON.parse(localStorage.getItem(CACHE_STORAGE_KEY));
    if (!cache?.fetchedAt || !Array.isArray(cache.parcels)) return null;

    return {
      fetchedAt: cache.fetchedAt,
      info: new Map(cache.parcels.map((parcel) => [parcel.tracking, parcel])),
    };
  } catch {
    return null;
  }
}

function writeParcelDataCache(info) {
  try {
    localStorage.setItem(
      CACHE_STORAGE_KEY,
      JSON.stringify({ fetchedAt: Date.now(), parcels: [...info.values()] }),
    );
  } catch {
    return;
  }
}

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return response.json();
}

async function mapWithConcurrency(items, limit, callback) {
  let index = 0;

  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (index < items.length) {
        const currentIndex = index++;
        await callback(items[currentIndex]);
      }
    }),
  );
}

function flattenParcels(list) {
  const parcels = [];

  for (const flight of list?.data || []) {
    const expectedArrival = flight.attributes?.expectedArrivedDate;
    const flightOrigin = getOriginInfo(flight);
    for (const locationType of ['deliveryLocations', 'locations']) {
      for (const location of flight.relationships?.[locationType]?.data || []) {
        const locationOrigin = getOriginInfo(location);
        for (const customer of location.relationships?.customers?.data || []) {
          for (const parcel of customer.relationships?.parcels?.data || []) {
            parcels.push({
              id: parcel.id,
              status: Number(parcel.attributes?.status),
              tracking: parcel.relationships?.parcelTrackings?.data?.[0]?.attributes?.tracking,
              description: getParcelDescription(parcel.attributes),
              expectedArrival,
              origin: mergeOriginInfo(locationOrigin, flightOrigin),
            });
          }
        }
      }
    }
  }

  return parcels.filter((parcel) => parcel.tracking);
}

function getParcelDescription(attributes) {
  for (const key of ['description', 'comment', 'title', 'name', 'itemDescription', 'productName']) {
    const value = attributes?.[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }

  return '';
}

function mergeOriginInfo(...items) {
  const origin = {};

  for (const item of items) {
    origin.countryCode ||= item?.countryCode || '';
    origin.countryName ||= item?.countryName || '';
    origin.transportName ||= item?.transportName || '';
    origin.transportType ||= item?.transportType || '';
  }

  return origin;
}

function getDomOriginInfo(row) {
  const values = [];
  collectContainerOriginValues(row?.closest(GROUP_SELECTOR), row, values);
  collectContainerOriginValues(row?.closest('.inex-enhanced-parcels__flight'), row, values);
  return mergeOriginInfo(getCountryInfo(values), getTransportInfo(values));
}

function collectContainerOriginValues(container, row, values) {
  if (!container) return;

  collectElementOriginValues(container.firstElementChild, values);
  for (const child of container.children) {
    if (child.contains(row)) continue;
    collectElementOriginValues(child, values);
  }
}

function collectElementOriginValues(element, values) {
  const text = normalizeText(element?.textContent || '');
  if (text) values.push(text);
}

function getOriginInfo(item) {
  const values = getOriginValues(item).map(String);

  return mergeOriginInfo(getCountryInfo(values), getTransportInfo(values));
}

function getOriginValues(item) {
  const values = [];
  collectOriginValues(item?.attributes, values);
  for (const relation of Object.values(item?.relationships || {})) {
    const data = Array.isArray(relation?.data) ? relation.data : [relation?.data];
    for (const entry of data) collectOriginValues(entry?.attributes, values);
  }
  return values;
}

function collectOriginValues(source, values) {
  if (!source || typeof source !== 'object') return;

  for (const [key, value] of Object.entries(source)) {
    if (value == null || typeof value === 'object') continue;
    if (
      /country|origin|from|warehouse|direction|transport|shipping|delivery|type|code|name/i.test(
        key,
      )
    ) {
      values.push(value);
    }
  }
}

function getCountryInfo(values) {
  const countries = [
    [
      'US',
      'USA',
      /(?:^|[^a-z])(?:us|usa)(?:$|[^a-z])|america|united states|აშშ|ამერიკა|сша|америк/i,
    ],
    [
      'UK',
      'United Kingdom',
      /(?:^|[^a-z])(?:uk|gb)(?:$|[^a-z])|britain|united kingdom|დიდი ბრიტანეთი|британ/i,
    ],
    ['CN', 'China', /(?:^|[^a-z])cn(?:$|[^a-z])|china|ჩინეთი|китай/i],
    ['TR', 'Turkey', /(?:^|[^a-z])tr(?:$|[^a-z])|turkey|თურქეთი|турци/i],
    ['DE', 'Germany', /(?:^|[^a-z])de(?:$|[^a-z])|germany|გერმანია|герман/i],
    ['GR', 'Greece', /(?:^|[^a-z])gr(?:$|[^a-z])|greece|საბერძნეთი|греци/i],
    ['IT', 'Italy', /(?:^|[^a-z])it(?:$|[^a-z])|italy|იტალია|итали/i],
    ['ES', 'Spain', /(?:^|[^a-z])es(?:$|[^a-z])|spain|ესპანეთი|испан/i],
    ['PL', 'Poland', /(?:^|[^a-z])pl(?:$|[^a-z])|poland|პოლონეთი|польш/i],
    ['CY', 'Cyprus', /(?:^|[^a-z])cy(?:$|[^a-z])|cyprus|კვიპროსი|кипр/i],
    ['GE', 'Georgia', /(?:^|[^a-z])ge(?:$|[^a-z])|georgia|საქართველო|грузи/i],
  ];

  for (const value of values) {
    for (const [countryCode, countryName, pattern] of countries) {
      if (pattern.test(value)) return { countryCode, countryName };
    }
  }

  return {};
}

function getTransportInfo(values) {
  const transports = [
    ['air', 'Air', /air|flight|plane|avia|საჰაერო|авиа|самолет/i],
    ['road', 'Road', /road|ground|land|truck|car|სახმელეთო|авто|назем/i],
    ['sea', 'Sea', /sea|ocean|ship|საზღვაო|море|морск/i],
  ];

  for (const value of values) {
    for (const [transportType, transportName, pattern] of transports) {
      if (pattern.test(value)) return { transportType, transportName };
    }
  }

  return {};
}

async function fetchParcelEvents(parcelId, headers) {
  const events = await fetchJson(`${API_BASE}/front/cabinet/parcels/${parcelId}/events`, {
    headers,
  });
  const event = events?.data?.[0];
  if (!event) return { latestEvent: null, eventCount: 0 };

  return {
    latestEvent: {
      name: event.relationships?.logisticEvent?.data?.attributes?.name,
      type: event.relationships?.logisticEvent?.data?.attributes?.type,
      date: event.attributes?.eventHappenedAt,
    },
    eventCount: events.data.length,
  };
}

function getProcessText(parcel) {
  const parts = [];
  const eventName = getEventLabel(parcel.latestEvent);
  const eventDate = formatDate(parcel.latestEvent?.date);
  const eta = formatDate(parcel.expectedArrival);

  if (eventName) parts.push(eventName);
  if (eventDate) parts.push(eventDate);
  if (eta) parts.push(`ETA ${eta}`);

  return parts.join(' · ');
}

function getEventLabel(event) {
  const type = event?.type || event?.name;
  const labels = {
    Received: 'Warehouse',
    Departure: 'In transit',
    Sent: 'Sent',
    Landed: 'Landed',
    DestinationTerminalProcessStarted: 'Terminal',
    DestinationTerminalProcessFinished: 'Terminal done',
    DestinationClearanceStarted: 'Customs',
    DestinationClearanceFinished: 'Customs done',
    DistributionInHub: 'Hub',
    DistributionInPickupLocation: 'Pickup soon',
  };

  return labels[type] || event?.name?.replace(/ Process /g, ' ') || '';
}

function formatDate(value) {
  const date = parseDate(value);
  if (!date) return '';

  return new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short' }).format(date);
}

function parseDate(value) {
  if (!value) return null;

  const normalized = /^\d{4}-\d{2}-\d{2} /.test(value) ? value.replace(' ', 'T') : value;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return null;

  return date;
}
