import {
  CONTENTS_CLASS,
  ROW_SELECTOR,
  SECTION_CLASS,
  SECTION_COLLAPSED_CLASS,
} from './constants.js';
import { setTextContent } from './dom.js';

const collapsedSections = new Set();
let rowOrderCounter = 0;
const rowOrders = new WeakMap();

export function renderRowSections(rows, { getRowSortInfo, getEtaTime, scheduleEnhance }) {
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
      scheduleEnhance,
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

  function getRowSections(sortedRows) {
    const sections = [
      { type: 'arrived', label: 'Arrived', rows: [] },
      { type: 'active', label: 'In progress', rows: [] },
    ];

    for (const row of sortedRows) {
      if (getRowSortInfo(row).arrived) {
        sections[0].rows.push(row);
      } else {
        sections[1].rows.push(row);
      }
    }

    return sections.filter((section) => section.rows.length);
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

function getSectionDivider(parent, type, label, count, collapsed, scheduleEnhance) {
  let divider = parent.querySelector(`:scope > .${SECTION_CLASS}[data-section="${type}"]`);

  if (!divider) {
    divider = document.createElement('div');
    divider.className = SECTION_CLASS;
    divider.dataset.section = type;
    divider.tabIndex = 0;
    divider.setAttribute('role', 'button');
    divider.addEventListener('click', () => toggleSection(type, scheduleEnhance));
    divider.addEventListener('keydown', (event) => {
      if (![' ', 'Enter'].includes(event.key)) return;

      event.preventDefault();
      toggleSection(type, scheduleEnhance);
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

function toggleSection(type, scheduleEnhance) {
  if (collapsedSections.has(type)) {
    collapsedSections.delete(type);
  } else {
    collapsedSections.add(type);
  }

  scheduleEnhance();
}

function getRowBucket(sortInfo) {
  if (sortInfo.arrived) return 0;
  return sortInfo.eventCount > 0 ? 1 : 2;
}

function getRowOrder(row) {
  if (!rowOrders.has(row)) rowOrders.set(row, rowOrderCounter++);
  return rowOrders.get(row);
}
