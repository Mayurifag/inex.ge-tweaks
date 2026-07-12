// ==UserScript==
// @name         inex.ge tweaks
// @namespace    https://github.com/Mayurifag/inex.ge-tweaks
// @version      0.1.14
// @description  Userscript tweaks for inex.ge.
// @icon         data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCI+PHBhdGggZD0iTTMyIDQgTDU4IDE3IFY0NyBMMzIgNjAgTDYgNDcgVjE3IFogTTYgMTcgTDMyIDMwIEw1OCAxNyBNMzIgMzAgVjYwIiBmaWxsPSJub25lIiBzdHJva2U9IiMwMDY2Y2MiIHN0cm9rZS13aWR0aD0iMyIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==
// @downloadURL  https://github.com/Mayurifag/inex.ge-tweaks/raw/refs/heads/dist/inex.ge-tweaks.user.js
// @updateURL    https://github.com/Mayurifag/inex.ge-tweaks/raw/refs/heads/dist/inex.ge-tweaks.user.js
// @match        https://inex.ge/*
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @grant        GM_setValue
// @grant        GM_unregisterMenuCommand
// @run-at       document-start
// @noframes
// ==/UserScript==
(function(){"use strict";var e=`inex-address-page`,t=[`class`,`style`,`hidden`,`aria-selected`,`data-state`],n=`/api/v1/front/tariffs/1/list/1/countries`,r,i,a=!1,o,s=new Map,c=!1;function l(){te(),d(),u(()=>{f(),d()}),window.addEventListener(`popstate`,d)}function u(e){if(document.body){e();return}document.addEventListener(`DOMContentLoaded`,e,{once:!0})}function ee(){return/^\/(?:en|ka|ru)\/profile\/(?:addresses|foreign-addresses)\/?$/.test(window.location.pathname)}function d(){let t=ee();document.documentElement.classList.toggle(e,t),document.body?.classList.toggle(e,t),t&&ne()}function f(){r||!document.body||(r=new MutationObserver(ne),r.observe(document.body,{childList:!0,characterData:!0,subtree:!0,attributes:!0,attributeFilter:t}))}function te(){if(!a){a=!0;for(let e of[`pushState`,`replaceState`]){let t=window.history[e];window.history[e]=function(...e){let n=t.apply(this,e);return window.dispatchEvent(new Event(`inex-address-location-change`)),n}}window.addEventListener(`inex-address-location-change`,d)}}function ne(){!document.documentElement.classList.contains(e)||i||(i=requestAnimationFrame(()=>{i=void 0,re()}))}function re(){ce();for(let e of document.querySelectorAll(`[class*="border-b-2"][class*="cursor-pointer"]`)){let t=ae(e);e.classList.add(`inex-address-tab`),e.classList.toggle(`inex-address-tab--active`,ie(e)),t&&(e.dataset.inexCountry=t),oe(e,s.get(t))}}function ie(e){return e.getAttribute(`aria-selected`)===`true`||e.classList.contains(`text-secondary-base`)||e.classList.contains(`border-b-secondary-base`)}function ae(e){return e.querySelector(`img[src*="/country-flags/"]`)?.src.match(/\/([A-Z]{2})\.svg$/)?.[1]||``}function oe(e,t){se(e);let n=e.querySelector(`:scope > .inex-address-tab-price`);if(!t){n?.remove();return}n||(n=document.createElement(`span`),n.className=`inex-address-tab-price`,e.append(n)),n.textContent=t}function se(e){if(e.querySelector(`:scope > .inex-address-tab-label`))return;let t=[...e.childNodes].find(e=>e.nodeType===Node.TEXT_NODE&&e.nodeValue.trim());if(!t)return;let n=document.createElement(`span`);n.className=`inex-address-tab-label`,n.textContent=t.nodeValue.trim(),t.replaceWith(n)}function ce(){c||o||(o=fetch(n,{headers:le()}).then(e=>e.ok?e.json():null).then(e=>{s=ue(e),c=!0,requestAnimationFrame(re)}).catch(()=>{c=!0}).finally(()=>{o=void 0}))}function le(){let e=localStorage.getItem(`accessToken`)||sessionStorage.getItem(`session_accessToken`),t=localStorage.getItem(`tokenType`)||sessionStorage.getItem(`session_tokenType`)||`Bearer`;return e?{Authorization:`${t} ${e}`,"Accept-Language":`ka`}:{}}function ue(e){return new Map((e?.data||[]).map(e=>[e.attributes?.code,de(e.relationships?.shipmentTypes?.data||[])]).filter(([e,t])=>e&&t))}function de(e){return e.map(e=>{let t=e.attributes?.shipmentType,n=e.relationships?.ranges?.data?.[0]?.attributes,r=e.relationships?.currency?.data?.attributes?.currencySymbol||``,i=t===1?`✈️`:t===4?`🚐`:``;return!i||!n?.tariff?``:`${i} ${fe(n.tariff)}${r}`}).filter(Boolean).join(` / `)}function fe(e){return Number(e).toLocaleString(`en`,{maximumFractionDigits:2})}var pe=typeof GM_addStyle<`u`?GM_addStyle:void 0,me=typeof GM_getValue<`u`?GM_getValue:void 0,he=typeof GM_registerMenuCommand<`u`?GM_registerMenuCommand:void 0,ge=typeof GM_setValue<`u`?GM_setValue:void 0,_e=typeof GM_unregisterMenuCommand<`u`?GM_unregisterMenuCommand:void 0,ve=`:root {
    --inex-bg: #191b29;
    --inex-surface: #222537;
    --inex-surface-2: #2b2f45;
    --inex-surface-3: #363b57;
    --inex-text: #f8f8f2;
    --inex-muted: #d8d5f2;
    --inex-dim: #a8adc9;
    --inex-border: #484d6c;
    --inex-border-soft: #3a3f5a;
    --inex-red: #ff6e6e;
    --inex-cyan: #8be9fd;
    --inex-green: #50fa7b;
    --inex-yellow: #f1fa8c;
    --inex-pink: #ff79c6;
    --inex-purple: #bd93f9;
    --inex-menu-bg: var(--inex-surface);
    --inex-menu-hover: var(--inex-surface-3);
    --inex-menu-text: #f8f8f2;
    --inex-logo: #f8f8f2;
    --inex-logo-filter: brightness(0) invert(1);
    --inex-red-soft: #512d3f;
    --inex-red-soft-light: #41263e;
    --inex-red-soft-dark: #663852;
    --inex-blue-soft: #243f55;
    --inex-green-soft: #254b33;
    --inex-yellow-soft: #49452b;
    --inex-primary-light: #fffefa;
    --inex-primary-dark: #dedbed;
    --inex-secondary-light: #ff8a8a;
    --inex-secondary-dark: #ff5f5f;
    --inex-disabled: #858aa9;
    --inex-white: #fff;
    --inex-components-hover: #4e536a;
    --inex-components-pressed: #606584;
    --inex-op-primary-light: rgb(255 255 255 / 8%);
    --inex-op-primary-base: rgb(255 255 255 / 13%);
    --inex-op-primary-dark: rgb(255 255 255 / 20%);
    --inex-shadow: rgb(0 0 0 / 32%);
    --inex-header-bg: rgb(34 37 55 / 92%);
    --inex-red-text: #ff8a8a;
    --inex-dim-text: #dde1f5;
    --inex-tab-bg: #25293d;
    --inex-tab-active-bg: #3a2a43;
    --inex-tab-hover-bg: #30354e;
    --inex-transparent: transparent;
    --color-primary-base: var(--inex-text) !important;
    --color-primary-light: var(--inex-primary-light) !important;
    --color-primary-dark: var(--inex-primary-dark) !important;
    --color-secondary-base: var(--inex-red) !important;
    --color-secondary-light: var(--inex-secondary-light) !important;
    --color-secondary-dark: var(--inex-secondary-dark) !important;
    --color-text-icons-primary: var(--inex-text) !important;
    --color-text-icons-secondary: var(--inex-muted) !important;
    --color-text-icons-placeholder: var(--inex-dim) !important;
    --color-text-icons-disabled: var(--inex-disabled) !important;
    --color-text-icons-white: var(--inex-white) !important;
    --color-additional-background-1: var(--inex-bg) !important;
    --color-additional-background-2: var(--inex-surface) !important;
    --color-additional-background-additional: var(--inex-surface-2) !important;
    --color-additional-background-black: var(--inex-bg) !important;
    --color-additional-background-bonus: var(--inex-yellow-soft) !important;
    --color-additional-background-white: var(--inex-surface) !important;
    --color-additional-components-primary: var(--inex-border) !important;
    --color-additional-components-hover: var(--inex-components-hover) !important;
    --color-additional-components-pressed: var(--inex-components-pressed) !important;
    --color-divider-primary: var(--inex-border-soft) !important;
    --color-op-primary-light: var(--inex-op-primary-light) !important;
    --color-op-primary-base: var(--inex-op-primary-base) !important;
    --color-op-primary-dark: var(--inex-op-primary-dark) !important;
    --color-op-secondary-light: var(--inex-red-soft-light) !important;
    --color-op-secondary-base: var(--inex-red-soft) !important;
    --color-op-secondary-dark: var(--inex-red-soft-dark) !important;
  }

  *,
  ::before,
  ::after {
    border-color: var(--inex-border) !important;
  }

  html,
  body {
    color-scheme: dark;
    background: var(--inex-bg) !important;
    color: var(--inex-text) !important;
  }

  body,
  #root,
  main,
  section,
  footer,
  [class*='from-white'],
  [class*='from-blue-50'],
  [class*='to-blue-100'],
  [class*='to-[#fff'],
  [class*='via-[#fef'],
  [class*='bg-gradient-to-b'],
  [class*='bg-gradient-to-br'] {
    background-color: var(--inex-bg) !important;
    color: var(--inex-text) !important;
  }

  input,
  textarea,
  select,
  button {
    color: inherit;
  }

  input,
  textarea,
  select,
  [role='combobox'] {
    background-color: var(--inex-surface) !important;
    color: var(--inex-text) !important;
    border-color: var(--inex-border) !important;
    transition-property: color, border-color, box-shadow !important;
  }

  input::placeholder,
  textarea::placeholder {
    color: var(--inex-dim) !important;
  }

  a:not([class*='bg-primary-base']),
  [class*='text-icons-text-primary'],
  [class*='text-gray-900'],
  [class*='text-gray-800'],
  [class*='text-gray-700'],
  [class*='text-black'] {
    color: var(--inex-text) !important;
  }

  [class*='text-icons-text-secondary'],
  [class*='text-gray-600'],
  [class*='text-gray-500'],
  [class*='text-neutral-600'],
  [class*='text-slate-600'],
  [class*='text-slate-500'] {
    color: var(--inex-muted) !important;
  }

  [class*='text-icons-text-placeholder'],
  [class*='text-icons-text-disabled'],
  [class*='text-gray-400'] {
    color: var(--inex-dim) !important;
  }

  .bg-white,
  [class*='bg-white'],
  [class*='bg-white/'],
  [class*='bg-additional-background-white'],
  [class*='bg-additional-background-2'],
  [class*='bg-gray-50'],
  [class*='bg-[#F8F9FA]'],
  [class*='bg-[#EEF0F3]'],
  [class*='bg-[#F2F2F2]'],
  [class*='bg-[#D9D9D9]'],
  [class*='bg-[rgba(255,255,255,0.5'],
  [class*='bg-[#f2f2f2]'] {
    background-color: var(--inex-surface) !important;
    color: var(--inex-text) !important;
    transition-property: color, border-color, box-shadow, opacity, transform !important;
  }

  [class*='bg-gray-100'],
  [class*='bg-gray-200'],
  [class*='bg-gray-300'],
  [class*='bg-gray-400'],
  [class*='bg-additional-components-primary'],
  [class*='bg-additional-components-disable'] {
    background-color: var(--inex-surface-2) !important;
    color: var(--inex-text) !important;
    transition-property: color, border-color, box-shadow, opacity, transform !important;
  }

  [class*='border-gray-'],
  [class*='border-divider-primary'],
  [class*='border-additional-components'],
  [class*='divide-gray-'] {
    border-color: var(--inex-border) !important;
  }

  [class*='shadow'],
  [class*='ring-gray-'] {
    box-shadow: 0 14px 40px var(--inex-shadow) !important;
  }

  [class*='bg-primary-base'],
  [class*='bg-secondary-base'] {
    background-color: var(--inex-red) !important;
    color: var(--inex-white) !important;
  }

  [class*='bg-primary-light'],
  [class*='bg-primary-dark'] {
    background-color: var(--inex-surface-3) !important;
    color: var(--inex-text) !important;
  }

  [class*='bg-primary-op-light'],
  [class*='bg-secondary-op-base'],
  [class*='bg-error-op-base'],
  [class*='bg-error-op-light'],
  [class*='bg-red-50'],
  [class*='bg-red-100'] {
    background-color: var(--inex-red-soft) !important;
  }

  [class*='bg-informative-op-light'],
  [class*='bg-[#eff6ff]'] {
    background-color: var(--inex-blue-soft) !important;
  }

  [class*='bg-success-op'],
  [class*='bg-green-50'],
  [class*='bg-green-100'],
  [class*='bg-[#E6F7EE]'],
  [class*='bg-[rgba(229,242,232'],
  [class*='bg-[rgba(230,247,238'],
  [class*='bg-[rgba(242,250,246'] {
    background-color: var(--inex-green-soft) !important;
  }

  [class*='bg-yellow-50'],
  [class*='bg-yellow-100'],
  [class*='bg-amber-50'],
  [class*='bg-amber-100'],
  [class*='bg-[#9da1b3]'],
  [class*='bg-additional-background-bonus'],
  [class*='bg-[#FFF4DB]'],
  [class*='bg-[#FFF7E6]'],
  [class*='bg-[rgba(211,167,132'],
  [class*='bg-[rgba(255,251,233'],
  [class*='bg-[rgba(255,173,1'] {
    background-color: var(--inex-yellow-soft) !important;
  }

  .rounded-full.h-full {
    background-color: var(--inex-surface-3) !important;
  }

  [class*='h-1.5'][class*='w-1.5'][class*='flex-shrink-0'][class*='rounded-full'],
  [class*='h-5'][class*='w-5'][class*='flex-shrink-0'][class*='rounded-full'] {
    background-color: var(--inex-surface-3) !important;
  }

  [class*='backdrop-blur'] {
    background: var(--inex-surface-2) !important;
    color: var(--inex-text) !important;
  }

  [class*='text-secondary-'],
  [class*='text-error-'],
  [class*='text-red-'],
  [class*='text-[#D71920]'] {
    color: var(--inex-red-text) !important;
  }

  [class*='text-blue-'] {
    color: var(--inex-cyan) !important;
  }

  [class*='text-green-'],
  [class*='text-success-'] {
    color: var(--inex-green) !important;
  }

  [class*='text-yellow-'],
  [class*='text-amber-'],
  [class*='text-warning-'] {
    color: var(--inex-yellow) !important;
  }

  main
    :where(img, video, [style*='background-image']):not(
      :where(
        [src*='logo' i],
        [src*='qr' i],
        [src*='barcode' i],
        [src*='captcha' i],
        [alt*='logo' i],
        [alt*='qr' i],
        [alt*='barcode' i],
        [alt*='captcha' i],
        [class*='leaflet']
      )
    ) {
    filter: brightness(0.88) contrast(1.05);
  }

  .leaflet-container {
    background-color: var(--inex-surface-2) !important;
  }

  .leaflet-tile {
    filter: brightness(0.7) contrast(1.15) saturate(0.8) !important;
  }

  .leaflet-control-zoom a {
    background-color: var(--inex-surface) !important;
    color: var(--inex-text) !important;
    border-color: var(--inex-border) !important;
  }

  header,
  [class*='fixed'][class*='top-0'] {
    background-color: var(--inex-header-bg) !important;
    backdrop-filter: blur(14px);
  }

  header img,
  header a[href$='/ka/'] img,
  header a[href$='/en/'] img,
  img[src$='/inex-logo.svg'],
  img[src$='/inex-logo-mobile.svg'] {
    filter: var(--inex-logo-filter) !important;
  }

  header svg,
  header svg * {
    color: var(--inex-logo) !important;
    stroke: currentcolor !important;
  }

  a[href$='/en/'] > svg path[fill='#0C1220'],
  a[href$='/ka/'] > svg path[fill='#0C1220'] {
    fill: var(--inex-logo) !important;
  }

  button svg path[fill='#000'],
  button svg path[fill='#000000'],
  button svg path[fill='#34383C'],
  button svg path[fill='black'] {
    fill: var(--inex-text) !important;
  }

  [class*='nsm7Bb-HzV7m-LgbsSe'] {
    background: var(--inex-surface) !important;
    color: var(--inex-text) !important;
    border-color: var(--inex-border) !important;
    transition: none !important;
  }

  [class*='nsm7Bb-HzV7m-LgbsSe'] * {
    color: var(--inex-text) !important;
  }

  [class*='bg-popover'],
  [class*='group-hover:visible'],
  [class*='fixed'][class*='translate-x-full'],
  [class*='fixed'][class*='translate-x-0'] {
    background-color: var(--inex-menu-bg) !important;
    color: var(--inex-menu-text) !important;
    border-color: var(--inex-border) !important;
  }

  [class*='bg-popover'] *,
  [class*='group-hover:visible'] *,
  [class*='fixed'][class*='translate-x-full'] *,
  [class*='fixed'][class*='translate-x-0'] * {
    color: var(--inex-menu-text) !important;
  }

  [class*='bg-popover'] a:hover,
  [class*='group-hover:visible'] a:hover,
  [class*='fixed'][class*='translate-x-full'] a:hover,
  [class*='fixed'][class*='translate-x-0'] a:hover {
    background-color: var(--inex-menu-hover) !important;
  }

  footer {
    border-top: 1px solid var(--inex-border-soft) !important;
  }

  footer img[alt='Facebook'],
  footer img[alt='YouTube'] {
    filter: brightness(0) invert(1) !important;
    opacity: 0.85;
  }

  table,
  thead,
  tbody,
  tr,
  td,
  th {
    background-color: var(--inex-transparent) !important;
    color: var(--inex-text) !important;
  }

  [class*='rounded-2xl'],
  [class*='rounded-3xl'],
  [class*='rounded-xl'],
  [class*='rounded-lg'],
  [class*='rounded-md'] {
    border-color: var(--inex-border) !important;
  }

  [class*='bg-gradient-to-r'],
  [class*='bg-gradient-to-b'],
  [class*='bg-gradient-to-br'],
  [class*='bg-[linear-gradient'] {
    background: linear-gradient(135deg, var(--inex-surface-2), var(--inex-surface) 42%) !important;
  }

  [class*='swiper-pagination-bullet'] {
    background-color: var(--inex-muted) !important;
  }

  [class*='swiper-pagination-bullet-active'] {
    background-color: var(--inex-red) !important;
  }

  .border-b-secondary-base {
    border-bottom-color: var(--inex-red) !important;
  }

  [class*='fixed'][class*='inset-0']
    [class*='border-b-2'][class*='cursor-pointer'][class*='w-full'] {
    margin-inline: 2px;
    background: var(--inex-tab-bg) !important;
    color: var(--inex-muted) !important;
    border: 1px solid var(--inex-border-soft) !important;
    border-bottom: 2px solid var(--inex-border) !important;
    border-radius: 0.5rem 0.5rem 0 0;
    box-shadow: none !important;
  }

  [class*='fixed'][class*='inset-0']
    [class*='border-b-2'][class*='cursor-pointer'][class*='w-full']:hover {
    background: var(--inex-tab-hover-bg) !important;
    color: var(--inex-text) !important;
    border-bottom-color: var(--inex-red-text) !important;
  }

  [class*='fixed'][class*='inset-0']
    [class*='border-b-2'][class*='cursor-pointer'][class*='w-full'].border-b-secondary-base.text-secondary-base {
    background: var(--inex-tab-active-bg) !important;
    color: var(--inex-red-text) !important;
    border-color: var(--inex-border) !important;
    border-bottom-color: var(--inex-red) !important;
  }

  [class*='fixed'][class*='inset-0']
    [class*='border-b-2'][class*='cursor-pointer'][class*='w-full']
    * {
    color: inherit !important;
  }

  .min-w-0.flex-1
    > .mb-6
    > .grid:has(a[href*='/profile/balance-transactions']):has(
      a[href*='/profile/bonus-transactions']
    ) {
    display: none !important;
  }

  .swiper [class*='border-b-2'][class*='cursor-pointer'] {
    border-radius: 0.5rem 0.5rem 0 0;
    transition:
      background-color 120ms ease,
      border-color 120ms ease,
      color 120ms ease;
  }

  .swiper [class*='border-b-2'][class*='cursor-pointer']:hover {
    background: var(--inex-tab-hover-bg) !important;
    color: var(--inex-text) !important;
    border-bottom-color: var(--inex-red-text) !important;
  }

  [role='switch'][data-state='checked'] {
    background-color: var(--inex-green-soft) !important;
    box-shadow: 0 0 0 1px var(--inex-border-soft) !important;
  }

  .inex-address-page .inex-address-tab {
    display: grid !important;
    grid-template-columns: auto max-content !important;
    gap: 2px 10px !important;
    align-items: center !important;
    background: var(--inex-tab-bg) !important;
    color: var(--inex-muted) !important;
    border-color: var(--inex-border-soft) !important;
  }

  .inex-address-page .inex-address-tab > :first-child {
    grid-column: 1;
    grid-row: 1 / span 2;
  }

  .inex-address-page .inex-address-tab-label {
    grid-column: 2;
    grid-row: 1;
    line-height: 1.1;
  }

  .inex-address-page .inex-address-tab-price {
    grid-column: 2;
    grid-row: 2;
    color: var(--inex-dim) !important;
    font-size: 11px !important;
    font-weight: 500 !important;
    line-height: 1.1;
    white-space: nowrap;
  }

  .inex-address-page .inex-address-tab:hover {
    background: var(--inex-tab-hover-bg) !important;
    color: var(--inex-text) !important;
  }

  .inex-address-page .inex-address-tab--active {
    background: var(--inex-tab-active-bg) !important;
    color: var(--inex-red-text) !important;
    border-bottom-color: var(--inex-red) !important;
    box-shadow: inset 0 -2px 0 var(--inex-red) !important;
  }

  .inex-address-page .inex-address-tab--active .inex-address-tab-price {
    color: var(--inex-secondary-light) !important;
  }

  [class*='text-[#D9D9D9]'] {
    color: var(--inex-dim-text) !important;
  }

  [class*='auth-swiper'],
  [class*='dashboard-linear-gradient'] {
    background: linear-gradient(180deg, var(--inex-surface-2), var(--inex-bg) 34%) !important;
  }

  [class*='PhoneInputCountry'],
  [class*='PhoneInputInput'] {
    background-color: var(--inex-surface) !important;
    color: var(--inex-text) !important;
  }`;function ye(){pe(ve)}var be=[[`US`,/(?:^|[^a-z])(?:us|usa)(?:$|[^a-z])|america|united states|აშშ|ამერიკა|сша|америк/i],[`UK`,/(?:^|[^a-z])(?:uk|gb)(?:$|[^a-z])|britain|united kingdom|დიდი ბრიტანეთი|британ/i],[`CN`,/(?:^|[^a-z])cn(?:$|[^a-z])|china|ჩინეთი|китай/i],[`TR`,/(?:^|[^a-z])tr(?:$|[^a-z])|turkey|თურქეთი|турци/i],[`DE`,/(?:^|[^a-z])de(?:$|[^a-z])|germany|გერმანია|герман/i],[`GR`,/(?:^|[^a-z])gr(?:$|[^a-z])|greece|საბერძნეთი|греци/i],[`IT`,/(?:^|[^a-z])it(?:$|[^a-z])|italy|იტალია|итали/i],[`ES`,/(?:^|[^a-z])es(?:$|[^a-z])|spain|ესპანეთი|испан/i],[`PL`,/(?:^|[^a-z])pl(?:$|[^a-z])|poland|პოლონეთი|польш/i],[`CY`,/(?:^|[^a-z])cy(?:$|[^a-z])|cyprus|კვიპროსი|кипр/i],[`GE`,/(?:^|[^a-z])ge(?:$|[^a-z])|georgia|საქართველო|грузи/i]];function p(e){for(let[t,n]of be)if(n.test(e))return t;return``}var xe={CN:{currency:`CNY`,origin:`taobao.com`},US:{currency:`USD`,origin:`amazon.com`},UK:{currency:`GBP`},GB:{currency:`GBP`},TR:{currency:`TRY`},DE:{currency:`EUR`},GR:{currency:`EUR`},IT:{currency:`EUR`},ES:{currency:`EUR`},CY:{currency:`EUR`},PL:{currency:`PLN`},GE:{currency:`GEL`}},Se={CNY:/cny|yuan|renminbi|rmb|¥|იუან|юан|юань|ჩინ/i,USD:/usd|dollar|\$|აშშ|американ/i,EUR:/eur|euro|€/i,GBP:/gbp|pound|£|sterling/i,TRY:/try|lira|₺|ლირ|лир/i,PLN:/pln|zloty|zł|ზლოტ|злот/i,GEL:/gel|lari|₾|ლარ|лари/i},Ce=/\bai\b.*declar|declar.*\bai\b|ai-declaration|ხელოვნურ|искусствен/i,we=/upload invoice|invoice upload|ატვირთეთ ინვოისი|ინვოისის ატვირთვა|загруз.*инвойс|загруз.*счет/i,Te=/generate|გენერირება|დამუშავება|сгенер|обработ/i,Ee=/\bai\b|ai declaration|processing invoice|process invoice|generate|ხელოვნურ|გენერირება|დამუშავება|искусствен|обработ|сгенер/i,m=/by hand|manual|manually|ხელით|ручн/i,De=/sender origin|origin site|total amount|item cost|quantity|category|currency|გამომგზავნ|ჯამური|რაოდენობა|კატეგორია|ვალუტა|ღირებულება|отправител|общая стоимость|колич|категор|валют|стоимость|цена/i,Oe=/declaration|declare\b|დეკლარ|деклар/i,ke=/category|კატეგორია|категор/i,Ae=/currency|ვალუტა|валют/i,je=/quantity|რაოდენობა|колич/i,h=/order total amount|total amount|ჯამური|общая/i,Me=/item cost|cost|ღირებულება|стоимость|цена/i,Ne=/sender origin|origin site|website|საიტი|გამომგზავნ|отправител|сайт/i,Pe=/other|uncertain|unknown|სხვა|გაურკვეველი|უცნობი|другое|прочее|неизвест/i,Fe=1e4,Ie=`data-inex-ai-hidden`,Le=`
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
`,g,Re,ze=!1,_,Be=``,Ve=0,He=!1,v,Ue=!1,We=0,Ge=new WeakSet,y=new WeakSet,Ke=new WeakMap,qe=new Map([[`გაურკვეველი კატეგორია`,`Unknown category`]]);function Je(){et(),Qe(),st(),Ye(()=>{Ze(),b()})}function Ye(e){if(document.body){e();return}document.addEventListener(`DOMContentLoaded`,e,{once:!0})}function Xe(){return/^\/(?:en|ka|ru)\/profile\/parcels\/?$/.test(window.location.pathname)}function Ze(){g||!document.body||(g=new MutationObserver(b),g.observe(document.body,{childList:!0,subtree:!0}))}function b(){Re||=setTimeout(()=>{Re=void 0,$e()},50)}function Qe(){document.addEventListener(`click`,e=>{let t=(e.target instanceof Element?e.target:null)?.closest(`button, a, [role="button"], [class*="cursor-pointer"]`);if(!(t instanceof HTMLElement))return;let n=w(t.textContent||``);if(Xe()&&Ee.test(n)&&!m.test(n)){e.preventDefault(),e.stopImmediatePropagation(),mt(pt());return}Xe()&&Oe.test(n)&&(Rt(t),b())},!0)}function $e(){if(!Xe())return;let e=pt();mt(e),gt(e);let t=_t(e);if(!t||(dt(t),tt(),it(t),ot(),vt(t),bt(t),Et(t,ke,Pe,`other`,!0),ft()))return;let n=xe[zt(t)]||{};yt(t,n.origin),Et(t,Ae,Mt(n.currency),n.currency)}function et(){ze||(ze=!0,pe(Le))}function tt(){return _||(_=fetch(`/api/v1/front/cabinet/hs-categories`,{headers:nt()}).then(e=>e.ok?e.json():null).then(e=>{for(let t of e?.data||[]){let e=t.attributes||{},n=w(e.originalTextEn||``);if(n)for(let t of[e.originalTextKa,e.originalText]){let e=w(t||``);e&&qe.set(e,n)}}b()}).catch(()=>{}),_)}function nt(){let e=localStorage.getItem(`accessToken`)||sessionStorage.getItem(`session_accessToken`),t=localStorage.getItem(`tokenType`)||sessionStorage.getItem(`session_tokenType`)||`Bearer`,n={"accept-language":`ka`,"author-type":localStorage.getItem(`chosenUserType`)||`User`};if(e){let r=rt(e);n.authorization=`${t} ${e}`,r&&(n[`author-id`]=r)}return n}function rt(e){try{let t=e.split(`.`)[1]||``,n=t.replace(/-/g,`+`).replace(/_/g,`/`).padEnd(Math.ceil(t.length/4)*4,`=`);return JSON.parse(atob(n)).sub||``}catch{return``}}function it(e){for(let t of kt(e,ke))at(t)}function at(e){let t=e?.querySelector(`input`);if(!(e instanceof HTMLElement)||!(t instanceof HTMLInputElement))return;let n=S(t),r=qe.get(n);if(!r){e.removeAttribute(`data-inex-category-label`);return}e.dataset.inexCategoryLabel=r,e.style.removeProperty(`--inex-category-label-color`)}function ot(){for(let e of document.querySelectorAll(`li span`)){if(!(e instanceof HTMLElement)||!C(e))continue;let t=e.dataset.inexCategoryOriginal||w(e.textContent||``),n=qe.get(t);n&&(e.dataset.inexCategoryOriginal=t,e.title=t,w(e.textContent||``)!==n&&(e.textContent=n))}}function st(){He||(He=!0,document.addEventListener(`pointerdown`,ut,!0),document.addEventListener(`keydown`,ut,!0),document.addEventListener(`input`,ct,!0),document.addEventListener(`input`,ut,!0),document.addEventListener(`click`,lt,!0))}function ct(e){if(e.isTrusted===!1)return;let t=e.target instanceof Element?e.target:null,n=t?.closest(`form`);!n||!De.test(w(n.textContent||``))||[...x(n,je),...x(n,Me)].includes(t)&&St(n)}function lt(e){e.isTrusted===!1||!v?.isConnected||(b(),setTimeout(b,300))}function ut(e){if(e.isTrusted===!1)return;let t=(e.target instanceof Element?e.target:null)?.closest(`form`);t&&De.test(w(t.textContent||``))&&(v=t,Ue=!0,We=Date.now(),b(),setTimeout(b,300))}function dt(e){e!==v&&(v=e,Ue=Date.now()-We<5e3)}function ft(){return Ue||Date.now()-We<5e3}function pt(){let e=document.getElementById(`modal-root`);return e&&w(e.textContent||``)?e:document.body}function mt(e){for(let t of Lt(e)){let e=w(t.textContent||``);!Ce.test(e)&&!Ee.test(e)||m.test(e)||t.remove()}for(let t of[...e.querySelectorAll(`*`)]){if(t.children.length||!(t instanceof HTMLElement)||ht(t))continue;let e=w(t.textContent||``);t.getAttribute(Ie)!==e&&(!Ce.test(e)&&!Ee.test(e)||m.test(e)||(t.style.setProperty(`display`,`none`,`important`),t.setAttribute(`aria-hidden`,`true`),t.setAttribute(Ie,e)))}}function ht(e){return e.matches(`input, textarea, select, option, [contenteditable="true"]`)}function gt(e){let t=w(e.textContent||``),n=Lt(e);if(!(we.test(t)||n.some(e=>{let t=w(e.textContent||``);return m.test(t)||Te.test(t)}))||_t(e))return;for(let e of n)Te.test(w(e.textContent||``))&&(e.style.setProperty(`display`,`none`,`important`),e.setAttribute(`aria-hidden`,`true`));let r=n.find(e=>m.test(e.textContent||``)&&C(e));r&&!Ge.has(r)&&(Ge.add(r),r.click())}function _t(e){return[...e.querySelectorAll(`form`)].find(e=>De.test(w(e.textContent||``)))}function vt(e){for(let t of x(e,je))y.has(t)||(y.add(t),It(t)&&Ft(t,`1`))}function yt(e,t){if(!t)return;let n=x(e,Ne)[0];!n||y.has(n)||(y.add(n),!S(n)&&Ft(n,t))}function bt(e){xt(e),St(e)}function xt(e){let t=x(e,h)[0],n=t&&Ct(t);n&&(n.style.setProperty(`display`,`none`,`important`),n.setAttribute(`aria-hidden`,`true`))}function St(e){let t=x(e,h)[0];if(!t)return;let n=x(e,Me).reduce((t,n,r)=>{let i=x(e,je)[r],a=wt(S(n));return Number.isFinite(a)?t+a*(wt(S(i))||1):t},0);if(!n)return;let r=Tt(n);S(t)!==r&&Ft(t,r)}function Ct(e){let t=e.parentElement;for(;t&&t!==e.form&&t!==document.body;){let e=w(t.textContent||``),n=t.querySelectorAll(`input, textarea, .custom-select`).length;if(h.test(e)&&n<=1)return t;t=t.parentElement}return e.parentElement}function wt(e){let t=w(e).replace(`,`,`.`);return t?Number(t):NaN}function Tt(e){return(Math.round(e*100)/100).toFixed(2).replace(/\.00$/,``).replace(/(\.\d)0$/,`$1`)}function Et(e,t,n){if(n)for(let r of kt(e,t))Dt(r,n)}function Dt(e,t){let n=S(e.querySelector(`input`)),r=!!e.parentElement?.querySelector(`[class*="text-error"]`);if(ft()||n&&t.test(n)&&!r)return;let i=Ke.get(e)||0;if(i>=6)return;Ke.set(e,i+1);let a=e.firstElementChild;a instanceof HTMLElement&&(a.click(),setTimeout(()=>Ot(e,t),120))}function Ot(e,t){if(!e.isConnected||ft())return;let n=At(t);if(!n){b();return}n.click()}function kt(e,t){return[...e.querySelectorAll(`.custom-select`)].filter(e=>t.test(w(e.textContent||``)))}function At(e){return[...document.querySelectorAll(`button, [role="option"], [cmdk-item], [data-value], li, div`)].filter(C).filter(t=>e.test(jt(t))).sort((e,t)=>jt(e).length-jt(t).length)[0]}function jt(e){return w([e.textContent,e.getAttribute(`data-value`),e.getAttribute(`value`)].filter(Boolean).join(` `))}function Mt(e){if(!e)return null;let t=Se[e];return RegExp(t?`^\\s*(?:${e}|${t.source})\\s*$`:`^\\s*${e}\\s*$`,`i`)}function x(e,t){let n=new Set;for(let r of e.querySelectorAll(`input, textarea`)){let e=Nt(r);t.test(e)&&n.add(r)}return[...n]}function Nt(e){let t=e.getAttribute(`id`),n=t?e.ownerDocument.querySelector(`label[for="${Ut(t)}"]`):null;return w([e.getAttribute(`name`),e.getAttribute(`placeholder`),e.getAttribute(`aria-label`),n?.textContent,Pt(e)].filter(Boolean).join(` `))}function Pt(e){let t=e.parentElement;for(;t&&t!==e.form&&t!==document.body;){let e=w(t.textContent||``),n=t.querySelectorAll(`input, textarea, .custom-select`).length;if(e&&n<=1&&e.length<=160)return e;t=t.parentElement}return``}function Ft(e,t){if(!(e instanceof HTMLInputElement||e instanceof HTMLTextAreaElement))return;let n=e instanceof HTMLTextAreaElement?HTMLTextAreaElement.prototype:HTMLInputElement.prototype,r=Object.getOwnPropertyDescriptor(n,`value`)?.set;r?r.call(e,t):e.value=t,e.dispatchEvent(new Event(`input`,{bubbles:!0})),e.dispatchEvent(new Event(`change`,{bubbles:!0}))}function S(e){return e instanceof HTMLInputElement||e instanceof HTMLTextAreaElement?w(e.value||``):``}function It(e){return/^\s*(?:0+)?\s*$/.test(S(e))}function Lt(e){return[...e.querySelectorAll(`button, a, [role="button"]`)].filter(e=>e instanceof HTMLElement)}function Rt(e){let t=e.closest(`[data-inex-origin]`);Be=Ht(t)||p(t?.textContent||``),Ve=Date.now()}function zt(e){return Bt()||p(e.closest(`[role="dialog"]`)?.textContent||``)||Vt()||``}function Bt(){return Date.now()-Ve<=Fe?Be:``}function Vt(){let e=new Set([...document.querySelectorAll(`[data-inex-origin]`)].filter(C).map(e=>Ht(e)||p(e.textContent||``)).filter(Boolean));return e.size===1?[...e][0]:``}function Ht(e){try{let t=JSON.parse(e?.getAttribute(`data-inex-origin`)||`{}`);return t.countryCode||p(t.countryName||``)}catch{return``}}function C(e){if(!(e instanceof HTMLElement))return!1;let t=getComputedStyle(e),n=e.getBoundingClientRect();return t.display!==`none`&&t.visibility!==`hidden`&&n.width>0&&n.height>0}function w(e){return e.replace(/\s+/g,` `).trim()}function Ut(e){return window.CSS?.escape?CSS.escape(e):e.replace(/[^a-zA-Z0-9_-]/g,`\\$&`)}var Wt=new Map([[`მთავარი`,`Home`],[`სიახლეები`,`News`],[`სერვისები`,`Services`],[`საკურიერო`,`Courier`],[`რეისები`,`Flights`],[`ოფისები`,`Offices`],[`მეტი`,`More`],[`ფასები`,`Prices`],[`კონტაქტი`,`Contact`],[`FAQ`,`FAQ`],[`ხშირად დასმული კითხვები`,`Frequently Asked Questions`],[`რეგისტრაცია`,`Register`],[`შესვლა`,`Log In`],[`Google-ით შესვლა`,`Sign in with Google`],[`გაქვს ანგარიში?`,`Already have an account?`],[`არ გაქვთ ანგარიში?`,`Do not have an account?`],[`ქარ`,`EN`],[`ქართულად`,`English`],[`საიტი ფუნქციონირებს სატესტო რეჟიმში`,`The site is operating in test mode`],[`საინფორმაციო ცენტრი:`,`Information center:`],[`ელ. ფოსტა`,`Email`],[`ოფისების ნახვა`,`View offices`],[`გამოგვყევით`,`Follow us`],[`@ ყველა უფლება დაცულია "INEX GROUP" მიერ`,`@ All rights reserved by "INEX GROUP"`],[`კონფიდენციალურობის პოლიტიკა`,`Privacy Policy`],[`წესები და პირობები`,`Terms and Conditions`],[`პერსონალურ მონაცემთა დაცვა`,`Personal Data Protection`],[`ონლაინ ამანათები`,`Online Parcels`],[`პერსონალური ამანათები`,`Personal Parcels`],[`შიდა გადაზიდვები`,`Domestic Shipping`],[`შიდა გზავნილები`,`Domestic Parcels`],[`კომერციული ტვირთები`,`Commercial Cargo`],[`საკურიერო სერვისი`,`Courier Service`],[`საკურიერო მომსახურება`,`Courier Service`],[`დაზღვევა`,`Insurance`],[`ბონუსები`,`Bonuses`],[`ბონუს ქულები`,`Bonus Points`],[`გატანის წერტილები`,`Pickup Points`],[`სრული ინფორმაცია`,`Full Information`],[`ამანათების დეკლარირების ინსტრუქცია`,`Parcel Declaration Instructions`],[`ამანათის დეკლარირების განახლებული ფორმა განახლებულ ვებგვერდზე ამანათის დეკლარირების პროცესი შეიცვალა. ამანათის დეკლარაცია ახლა ივსება ამანათის დამატების ეტაპზე. დეკლარირებისას შეგიძლიათ ატვირთოთ...`,`The parcel declaration form has been updated. On the new website, declaration is completed while adding a parcel. You can upload documents during declaration...`],[`მისამართი 8 ქვეყანაში ონლაინ ამანათებისთვის`,`Addresses in 8 countries for online parcels`],[`გამოიწერე და მიიღე ონლაინ ამანათები საქართველოს ნებისმიერ წერტილში მსოფლიოს 8 ქვეყნიდან`,`Order and receive online parcels anywhere in Georgia from 8 countries`],[`ინექსის ლოკაციები მთელ საქართველოში`,`Inex locations across Georgia`],[`მიიღე ამანათები 40-ზე მეტ ქალაქში, დამატებითი გადასახადის გარეშე`,`Receive parcels in more than 40 cities with no extra fee`],[`დააგროვე ბონუს ქულები და მიიღე ონლაინ ამანათები უფასოდ`,`Collect bonus points and receive online parcels for free`],[`გააგზავნე და მიიღე პირადი ამანათები მსოფლიოს სხვადასხვა ქვეყნიდან. ჩვენ უზრუნველვყოფთ შენი გზავნილების სწრაფ და უსაფრთხო ტრანსპორტირებას საქართველოში და საქართველოდან საზღვარგარეთ.`,`Send and receive personal parcels from different countries. We provide fast and secure transport to Georgia and from Georgia abroad.`],[`დააზღვიე გამოწერილი ამანათი. ზარალი სრულად ანაზღაურდება ამანათის დაკარგის ან დაზიანების შემთხვევაში`,`Insure your ordered parcel. Loss is fully reimbursed if the parcel is lost or damaged.`],[`სტანდარტული`,`Standard`],[`პირდაპირი გამოწერა`,`Direct Ordering`],[`პირდაპირი გამოწერები`,`Direct Orders`],[`აკრძალული ნივთები`,`Prohibited Items`],[`ჩვენ შესახებ`,`About Us`],[`საბაჟო წესები`,`Customs Rules`],[`საბაჟო პროცედურები`,`Customs Procedures`],[`ოფისები და ლოკაციები`,`Offices and Locations`],[`ამერიკა`,`USA`],[`აშშ:`,`USA:`],[`დიდი ბრიტანეთი`,`United Kingdom`],[`ბრიტანეთი`,`United Kingdom`],[`დიდი ბრიტანეთი:`,`United Kingdom:`],[`ჩინეთი`,`China`],[`ჩინეთი:`,`China:`],[`საბერძნეთი`,`Greece`],[`საბერძნეთი:`,`Greece:`],[`ესპანეთი`,`Spain`],[`ესპანეთი:`,`Spain:`],[`გერმანია`,`Germany`],[`გერმანია:`,`Germany:`],[`თურქეთი`,`Turkey`],[`თურქეთი:`,`Turkey:`],[`კვიპროსი`,`Cyprus`],[`კვიპროსი:`,`Cyprus:`],[`იტალია`,`Italy`],[`იტალია:`,`Italy:`],[`საფრანგეთი`,`France`],[`პორტუგალია`,`Portugal`],[`დანია`,`Denmark`],[`შვედეთი`,`Sweden`],[`ავსტრია`,`Austria`],[`ნიდერლანდები`,`Netherlands`],[`ბელგია`,`Belgium`],[`შვეიცარია`,`Switzerland`],[`ლიტვა`,`Lithuania`],[`ისრაელი`,`Israel`],[`პოლონეთი`,`Poland`],[`საქართველო`,`Georgia`],[`საჰაერო`,`Air`],[`სახმელეთო`,`Ground`],[`საზღვაო გადაზიდვა: 1 კგ — $4.5`,`Sea shipping: 1 kg — $4.5`],[`საჰაერო გადაზიდვა: 1 კგ — $10.5`,`Air shipping: 1 kg — $10.5`],[`გამოგზავნა`,`Sent`],[`ჩამოსვლა`,`Arrival`],[`პერსონალურ მონაცემთა დაცვის ოფიცერი`,`Personal Data Protection Officer`],[`თანხმობა მარკეტინგული შეტყობინებების მიღებაზე`,`Consent to receive marketing messages`],[`პირადი ნომერი`,`Personal ID`],[`6-ნიშნა კოდი`,`6-digit code`],[`ფილიალები საქართველოს მასშტაბით`,`Branches across Georgia`],[`ინექს გრუპი საშუალებას გაძლევთ გამოიწეროთ სასურველი ნივთი ნებისმიერი`,`Inex Group lets you order the item you want from any store`],[`ახალი მისამართის დამატება`,`Add New Address`],[`ამანათები`,`Parcels`],[`დეშბორდი`,`Dashboard`],[`მენიუ`,`Menu`],[`ამანათის დამატება`,`Add Parcel`],[`ბალანსის შევსება`,`Top Up Balance`],[`ქვემომხმარებლის დამატება`,`Add Subuser`],[`საფორთი`,`Support`],[`პროფილიდან გასვლა`,`Log out`],[`საბაჟო დეკლარაციები`,`Customs Declarations`],[`გადახდები`,`Payments`],[`ტრანზაქციები`,`Transactions`],[`ინვოისები`,`Invoices`],[`მისამართები უცხოეთში`,`Foreign Addresses`],[`ფილიალები`,`Pickup Locations`],[`ბოქსით გატანა`,`Takeout from boxes`],[`დამატებითი სერვისები`,`Additional Services`],[`კალკულატორი`,`Calculator`],[`ფასები & ტარიფები`,`Prices & Tariffs`],[`პარამეტრები`,`Parameters`],[`საკურიერო პარამეტრები`,`Courier Parameters`],[`მონაცემები`,`Data`],[`შეტყობინებები`,`Notifications`],[`ქვემომხმარებლები`,`Subusers`],[`მინდობილი პირები`,`Trustees`],[`მომხმარებელი`,`User`],[`მიმღები მომხმარებელი`,`Receiver Client`],[`ქვემომხმარებელი`,`Subuser`],[`მინდობილი პირი`,`Trustee`],[`ჩამოტანის მეთოდი`,`Delivery Method`],[`მიწოდების მეთოდი`,`Delivery Method`],[`მიტანის მეთოდი`,`Delivery Method`],[`ჩაბარების მეთოდი`,`Delivery Method`],[`გატანის მეთოდი`,`Pickup Method`],[`ფილიალიდან გატანა`,`Pickup from branch`],[`ფილიალში გატანა`,`Pickup at branch`],[`სერვისცენტრიდან გატანა`,`Pickup from service center`],[`ბოქსიდან გატანა`,`Takeout from box`],[`დახლიდან გატანა`,`Takeout from counter`],[`ბარკოდით გატანა`,`Takeout using barcode`],[`მისამართზე მიწოდება`,`Delivery to address`],[`კურიერით მიწოდება`,`Courier delivery`],[`ანგარიშზე წვდომა`,`Account Access`],[`იურიდიული დოკუმენტები`,`Legal Documents`],[`ბარათები`,`Cards`],[`ავტომატურად`,`Automatically`],[`ავტომატურად გამოჩნდება`,`Appears automatically`],[`აღარ გჭირდებათ`,`No longer needed`],[`გამორიცხავს შეცდომებს`,`Eliminates mistakes`],[`ნაბიჯი 1 — მისამართის შერჩევა:`,`Step 1 — Select an address:`],[`ნაბიჯი 2 — პერსონალური მონაცემების დადასტურება:`,`Step 2 — Confirm personal data:`],[`ნაბიჯი 3 — ბარათის მონაცემების შეყვანა:`,`Step 3 — Enter card details:`],[`აირჩიეთ სასურველი ნივთი და დააჭირეთ ღილაკს ქვედა მარჯვენა კუთხეში`,`Choose the desired item and press the button in the lower-right corner`],[`აირჩიეთ გადახდის მეთოდი და შეავსეთ ბარათის 16-ნიშნა კოდი, ბარათის მფლობელის სახელი და მოქმედების ვადა`,`Choose a payment method and enter the 16-digit card number, cardholder name, and expiry date`],[`იმ აპლიკაციაში ან საიტზე, საიდანაც გამოიწერეთ`,`In the app or website where you placed the order`],[`გენერირდება უშუალოდ გამყიდველის მიერ`,`Generated directly by the seller`],[`10 ქვეყნიდან`,`From 10 countries`],[`15 ქვეყნიდან`,`From 15 countries`],[`5%-მდე`,`Up to 5%`],[`რა არის ბონუს სისტემა და როგორ დავზოგო თანხა?`,`What is the bonus system and how can I save money?`],[`პერსონალური ამანათები საქართველოდან უცხოეთში`,`Personal parcels from Georgia abroad`],[`პერსონალური ამანათები უცხოეთიდან საქართველოში`,`Personal parcels from abroad to Georgia`],[`როგორ დავამატო მისამართი და შევიძინო ნივთი Pinduoduo-ზე?`,`How do I add an address and buy an item on Pinduoduo?`],[`როგორ დავრეგისტრირდე Pinduoduo-ზე?`,`How do I register on Pinduoduo?`],[`შესაძლებელია თუ არა ამანათის სახლში მიღება?`,`Is home delivery available?`],[`რომელი ფილიალიდან შევძლებ ამანათის გატანას?`,`Which branch can I pick up my parcel from?`],[`როგორ გავიგო ტრანსპორტირების ღირებულება?`,`How do I find out the shipping cost?`],[`სად ვნახავ ჩემი ამანათის თრექინგ კოდს?`,`Where can I find my parcel tracking code?`],[`რას ნიშნავს პირდაპირი გადაზიდვა და რით განსხვავდება სტანდარტული გამოწერისგან?`,`What does direct shipping mean and how is it different from standard ordering?`],[`ინექს გრუპი ინტეგრირებულია`,`Inex Group is integrated`],[`„მთავარ ფილიალად"`,`as the "main branch"`],[`როგორ გამოვიყენო დაგროვილი ბონუს ქულები?`,`How do I use accumulated bonus points?`],[`როგორ იანგარიშება ტრანსპორტირების ღირებულება?`,`How is shipping cost calculated?`],[`როგორ ითვლება ამანათების ჩინეთიდან ტრანსპორტირება?`,`How is parcel shipping from China calculated?`],[`რა ნივთების გამოგზავნაა აკრძალული?`,`Which items are prohibited?`],[`სად ვნახო აკრძალული ნივთების სრული და დეტალური სია?`,`Where can I find the full detailed prohibited-items list?`],[`აკრძალული ნივთების სრული სია`,`Full list of prohibited items`],[`აკრძალული ნივთების სია იხილეთ აქ`,`See the prohibited-items list here`],[`რა ინფორმაციაა საჭირო მიმღების შესახებ?`,`What recipient information is required?`],[`სახელი, გვარი და მოქმედი ტელეფონის ნომერი`,`First name, last name, and active phone number`],[`რა პროცესს გადის ამანათი გამოგზავნიდან მიღებამდე?`,`What process does a parcel go through from shipping to pickup?`],[`უნიკალური თრექინგ კოდი`,`Unique tracking code`],[`SMS შეტყობინებას`,`SMS notification`],[`სად არის შესაძლებელი ამანათის მიღება?`,`Where can I receive a parcel?`],[`ინექს გრუპის სერვის-ცენტრებიდან`,`From Inex Group service centers`],[`თვითმომსახურების ლოქერებიდან`,`From self-service lockers`],[`იხილეთ აქ`,`See here`],[`ფასებზე ინფორმაცია იხილეთ აქ`,`See pricing information here`],[`სად შემიძლია ვნახო ინფორმაცია ტრანსპორტირების ტარიფების შესახებ?`,`Where can I find shipping tariff information?`],[`მჭირდება თუ არა ამანათის დეკლარირება ინექს გრუპის საიტზე?`,`Do I need to declare a parcel on the Inex Group site?`],[`ამანათების დეკლარირება საჭირო არ არის`,`Parcel declaration is not required`],[`როდის და რა ვადებში იგზავნება ონლაინ გამოწერილი ამანათები?`,`When and how quickly are online orders shipped?`],[`რა დღეებში იგზავნება ამანათები საქართველოდან საზღვარგარეთ?`,`On which days are parcels sent from Georgia abroad?`],[`საქართველოდან ამანათების ექსპორტი ხორციელდება შემდეგი განრიგით:`,`Parcels from Georgia are exported on this schedule:`],[`ევროპის მიმართულებით`,`To Europe`],[`დიდი ბრიტანეთის მიმართულებით:`,`To the United Kingdom:`],[`ყოველ ოთხშაბათს`,`Every Wednesday`],[`ყოველ ორშაბათს`,`Every Monday`],[`ყოველ ხუთშაბათს`,`Every Thursday`],[`ხდება თუ არა ჩინეთიდან გამოგზავნილი ტვირთის გადაფუთვა ყოველთვის?`,`Is cargo from China always repacked?`],[`საზღვაო გადაზიდვების შემთხვევაში ტვირთის გადაფუთვა არ ხორციელდება`,`Cargo is not repacked for sea shipping`],[`გადაფუთვას ან კონსოლიდირებას`,`Repacking or consolidation`],[`რეალური წონით`,`By actual weight`],[`საკურიერო სერვისი ფარავს მთელ საქართველოს`,`Courier service covers all of Georgia`],[`რა ხდება, თუ ნივთი დაზიანებული ჩამოვიდა?`,`What happens if an item arrives damaged?`],[`აუცილებელია პრობლემის დაფიქსირება ამანათის გატანის მომენტშივე`,`The issue must be reported when picking up the parcel`],[`გამყიდველთან პრეტენზიის წარდგენის`,`Filing a claim with the seller`],[`პირადობის მოწმობა ან პასპორტი`,`ID card or passport`],[`ნებისმიერ დროს ამანათის გამოგზავნამდე`,`Any time before the parcel is shipped`],[`საბერძნეთიდან გამომწერების საყურადღებოდ!`,`Attention customers ordering from Greece!`],[`საბერძნეთის Massimo Dutti-დან გამომწერებისთვის: მისამართის (Address 1) ველში მიუთითეთ MENANDRU 55. სხვა ფორმატის შემთხვევაში გამოწერა ვერ განხორციელდება. გმადლობთ თანამშრომლობისთვის!`,`For customers ordering from Massimo Dutti Greece: enter MENANDRU 55 in the Address 1 field. Orders cannot be placed with another format. Thank you for your cooperation!`],[`სიახლე! ყოველდღიური რეისები ამერიკიდან!`,`New! Daily flights from the USA!`],[`ინექსმა ამერიკიდან ყოველდღიური რეისებით ამანათების ტრანსპორტირება დაიწყო. გაითვალისწინეთ: ამანათები ამერიკიდან მხოლოდ რეალური წონით იგზავნება.`,`Inex has started transporting parcels from the USA with daily flights. Note: parcels from the USA are shipped by actual weight only.`],[`ყოველკვირეული სახმელეთო რეისები ჩინეთიდან`,`Weekly ground shipments from China`],[`გაგზავნეთ ამანათები საქართველოს მასშტაბით!`,`Send parcels across Georgia!`],[`ინფორმაცია აკრძალული ნივთების შესახებ`,`Information About Prohibited Items`],[`სითხის შემცველი, ფეთქებადსაშიში და აალებადი პროდუქცია (მათ შორის სუნამოები) აკრძალულია საჰაერო მიმართულებებიდან. სუნამოების ჩამოტანა შესაძლებელია მხოლოდ გერმანიის, ესპანეთის, საბერძნეთის, იტალიის ან თურქეთის მისამართებით (სახმელეთო გზა).`,`Products containing liquids, explosive materials, and flammable goods, including perfumes, are prohibited by air. Perfumes can only be shipped from Germany, Spain, Greece, Italy, or Turkey by ground transport.`],[`გამოიყენეთ ინექსის AI ამანათის დეკლარიებისთვის ან შეავსეთ დეკლარაცია მანუალურად.`,`Use Inex AI for parcel declarations or fill in the declaration manually.`],[`სწრაფი და თანამედროვე გზა ამანათის მისაღებად`,`A fast and modern way to receive your parcel`],[`ინექსს დაემატა უკონტაქტო გატანის ბოქსი — გაიტანეთ ამანათი სწრაფად და მარტივად, ოპერატორისა და რიგის გარეშე. ბოქსები ხელმისაწვდომია თბილისში, რუსთავსა და ბათუმში. საჭიროა ტრანსპორტირების წინასწარ გადახდა და შტრიხკოდის გენერირება.`,`Inex added contactless pickup boxes. Pick up your parcel quickly and easily without an operator or queue. Boxes are available in Tbilisi, Rustavi, and Batumi. Prepayment for shipping and barcode generation are required.`],[`ინექსის სერვიებს უკონტაქტო გატანის ბოქსი დაემატა. გაიტანეთ ნივთები ოპერატორის დახმარების გარეშე. გაიტანეთ ამანათი სწრაფად, მარტივად და უკონტაქტოდ — ოპერატორის, რიგებისა და დამატებითი დოკუმენტების წა...`,`Contactless pickup boxes have been added to Inex services. Pick up items without operator assistance. Pick up your parcel quickly, easily, and contactlessly - without an operator, queues, or additional documents...`],[`19 აგვისტო 2025`,`August 19, 2025`],[`სიახლე! ამანათები ესპანეთიდან!`,`New! Parcels from Spain!`],[`30%-იანი ფასდაკლება Trendyol-იდან გამოწერისას!`,`30% discount when ordering from Trendyol!`],[`ყოველდღე 08:00–19:00`,`Every day 08:00-19:00`],[`ყოველდღე 09:00–20:00`,`Every day 09:00-20:00`],[`ორშ–შაბ 09:30–18:30 (კვირა დასვენება)`,`Mon-Sat 09:30-18:30 (Sunday closed)`],[`ორშ–პარ 09:00–17:00, შაბ 09:00–13:00`,`Mon-Fri 09:00-17:00, Sat 09:00-13:00`],[`ორშ–პარ 10:00–18:00, შაბ 10:00–17:00, კვირა 11:00–17:00`,`Mon-Fri 10:00-18:00, Sat 10:00-17:00, Sunday 11:00-17:00`],[`ორშ–შაბ 09:00–19:00, კვირა 09:00–18:00`,`Mon-Sat 09:00-19:00, Sunday 09:00-18:00`],[`ყოველდღე 12:00–20:00`,`Every day 12:00-20:00`],[`ორშ–პარ 09:00–18:00 (შაბათ–კვირა დასვენება)`,`Mon-Fri 09:00-18:00 (weekends closed)`],[`ორშ–შაბ 09:30–18:00 (კვირა დასვენება)`,`Mon-Sat 09:30-18:00 (Sunday closed)`],[`რა განრიგით მუშაობს საბერძნეთის, კვიპროსისა და თურქეთის ოფისები?`,`What schedule do the Greece, Cyprus, and Turkey offices work?`],[`როდის მუშაობს ევროპის ქვეყნების ოფისები?`,`When are the European offices open?`],[`როგორია აშშ-ისა და ჩინეთის საწყობების სამუშაო განრიგი?`,`What are the working hours of the USA and China warehouses?`],[`სად შემიძლია ამანათის მიღება დამატებითი გადასახადის გარეშე?`,`Where can I receive a parcel with no extra fee?`],[`მთელი ქვეყნის მასშტაბით ამანათის გატანა შესაძლებელი.`,`Parcel pickup is available across the country at`],[`მთელი ქვეყნის მასშტაბით`,`Across the country`],[`ამანათის გატანა`,`parcel pickup`],[`შესაძლებელი.`,`is available.`],[`ჩვენს რეგიონალურ ოფისებში`,`our regional offices`],[`დამატებითი გადასახადის გარეშეა`,`with no extra fee`],[`რა არის ბონუს ქულების სისტემა?`,`What is the bonus points system?`],[`ტრანსპორტირების საფასურის გადახდისას, თანხის გიბრუნდებათ ბონუს ქულების სახით. დაგროვებული ქულებით შეგიძლიათ .`,`When paying for transportation, part of the amount is returned to you as bonus points. With accumulated points you can`],[`ტრანსპორტირების საფასურის გადახდისას, თანხის`,`When paying for transportation, part of the amount`],[`გიბრუნდებათ ბონუს ქულების სახით. დაგროვებული ქულებით შეგიძლიათ`,`is returned to you as bonus points. With accumulated points you can`],[`მომდევნო ამანათების ტრანსპორტირების ღირებულება დაფაროთ`,`cover future parcel shipping costs.`],[`რა დოკუმენტია საჭირო ამანათის მისაღებად?`,`What document is needed to receive a parcel?`],[`საქართველოში ამანათის გატანისას მიმღები ვალდებულია თან იქონიოს . გზავნილის მიღება შესაძლებელია ნებისმიერ ქალაქსა და რაიონულ ცენტრში .`,`When picking up a parcel in Georgia, the recipient must have an ID document. The shipment can be received in any city or district center at`],[`საქართველოში ამანათის გატანისას მიმღები ვალდებულია თან იქონიოს`,`When picking up a parcel in Georgia, the recipient must have`],[`. გზავნილის მიღება შესაძლებელია ნებისმიერ ქალაქსა და რაიონულ ცენტრში`,`. The shipment can be received in any city or district center`],[`ჩვენს ლოკაციებზე`,`our locations`],[`როგორ გავიგებ, რომ ამანათი უკვე ჩამოვიდა?`,`How will I know that the parcel has arrived?`],[`როგორც კი ამანათი დანიშნულების ადგილზე ჩამოვა, მიმღებს გაეგზავნება მითითებულ ნომერზე.`,`As soon as the parcel arrives at its destination, the recipient will receive a message at the specified number.`],[`როგორც კი ამანათი დანიშნულების ადგილზე ჩამოვა, მიმღებს გაეგზავნება`,`As soon as the parcel arrives at the destination, the recipient will receive`],[`მითითებულ ნომერზე.`,`at the specified number.`],[`მოკლე ტექსტური შეტყობინება (SMS)`,`SMS notification`],[`როგორ გავიგო, სად იმყოფება ჩემი ამანათი?`,`How can I find out where my parcel is?`],[`ჩაბარებისას ამანათს ენიჭება . მისი საშუალებით შეგიძლიათ გადაამოწმოთ გზავნილის მდებარეობა და სტატუსი .`,`When the parcel is handed over, it is assigned a unique tracking code. You can use it to check the shipment location and status on`],[`ჩაბარებისას ამანათს ენიჭება`,`When handed over, the parcel is assigned`],[`. მისი საშუალებით შეგიძლიათ გადაამოწმოთ გზავნილის მდებარეობა და სტატუსი`,`. With it you can check the shipment location and status`],[`ჩვენს ვებ-გვერდზე`,`our website`],[`რა ინფორმაციაა საჭირო ამანათის გამოსაგზავნად?`,`What information is needed to send a parcel?`],[`რა უპირატესობა აქვს 10 ქვეყნის მისამართზე წვდომას?`,`What advantage does access to addresses in 10 countries provide?`],[`ეს გაძლევთ საშუალებას აირჩიოთ ის ქვეყანა, სადაც ან სადაც სასურველ მაღაზიას აქვს.`,`This lets you choose the country where shipping is cheaper or where the desired store has`],[`ეს გაძლევთ საშუალებას აირჩიოთ ის ქვეყანა, სადაც`,`This lets you choose the country where`],[`ან სადაც სასურველ მაღაზიას`,`or where the desired store`],[`აქვს.`,`has.`],[`შიდა ტრანსპორტირება (Shipping) უფრო იაფია`,`domestic shipping is cheaper`],[`უფრო სწრაფი მიწოდების სერვისი`,`a faster delivery service.`],[`როგორ ითვლება ტრანსპორტირების ღირებულება?`,`How is the shipping cost calculated?`],[`ფასი იანგარიშება მხოლოდ .`,`The price is calculated only by`],[`ფასი იანგარიშება მხოლოდ`,`The price is calculated only by`],[`აშშ, ევროპა, თურქეთი:`,`USA, Europe, Turkey:`],[`ფასი იანგარიშება რეალურსა და მოცულობით წონას შორის . საჰაერო გზით გამოგზავნისას, შესაძლებლობის შემთხვევაში, ვახდენთ მოცულობის შესამცირებლად.`,`The price is calculated by the greater of actual and volumetric weight. For air shipments, when possible, we repack to reduce volume.`],[`ფასი იანგარიშება რეალურსა და მოცულობით წონას შორის`,`The price is calculated by the greater of actual and volumetric weight`],[`. საჰაერო გზით გამოგზავნისას, შესაძლებლობის შემთხვევაში, ვახდენთ`,`. For air shipments, when possible, we repack`],[`მოცულობის შესამცირებლად.`,`to reduce volume.`],[`უდიდესით`,`the greater value`],[`გადაფუთვას`,`repacking`],[`რომელ ქვეყნებში მექნება პირადი საფოსტო მისამართი?`,`In which countries will I have a personal mailing address?`],[`თქვენ შეძლებთ ნივთების გამოწერას შემდეგი ქვეყნებიდან:`,`You can order items from the following countries:`],[`აშშ, ჩინეთი, დიდი ბრიტანეთი, გერმანია, იტალია, ესპანეთი, საბერძნეთი, პოლონეთი, თურქეთი და კვიპროსი.`,`USA, China, United Kingdom, Germany, Italy, Spain, Greece, Poland, Turkey, and Cyprus.`],[`როგორ გამოვიწერო ნივთი ინექს გრუპის დახმარებით?`,`How can I order an item with Inex Group's help?`],[`რეგისტრაციის შემდეგ თქვენ გენიჭებათ`,`After registration you receive`],[`პირადი მისამართები 10 ქვეყანაში`,`personal addresses in 10 countries`],[`. ონლაინ მაღაზიაში ნივთის ყიდვისას, "Shipping Address"-ის ველში მიუთითებთ შესაბამისი ქვეყნის ჩვენს მისამართს. ასევე, შეგიძლიათ ისარგებლოთ`,`. When buying an item in an online store, enter our address for the selected country in the Shipping Address field. You can also use`],[`გამოწერაში დახმარების უფასო სერვისით`,`the free ordering assistance service`],[`როგორ შემიძლია ამანათის ტრანსპორტირების თანხის გადახდა?`,`How can I pay the parcel shipping fee?`],[`პლასტიკური ბარათით ჩვენი საიტის საშუალებით - საკომისიო 0%`,`By card through our website - 0% commission`],[`ნაღდი ანგარიშსწორებით ჩვენს ოფისებში ამანათის გატანისას - საკომისიო 0%`,`In cash at our offices when picking up the parcel - 0% commission`],[`პლასტიკური ბარათით ინექს გრუპის ოფისებში (გარდა აგენტებისა) ამანათის გატანისას (დეტალური ინფორმაცია`,`By card at Inex Group offices, except agents, when picking up the parcel (details on the`],[`ოფისების გვერდზე`,`offices page`],[`აღწერაში)`,`description)`],[`საკუთარი ბალანსიდან ჩვენს საიტზე საკმარისი თანხის არსებობის შემთხვევაში`,`From your balance on our website if you have sufficient funds`],[`ბონუს ქულებით`,`With bonus points`],[`საკმარისი რაოდენობის შემთხვევაში ჩვენი საიტიდან`,`from our website if you have enough points`],[`საბანკო გადარიცხვით ნებისმიერი ბანკიდან ჩვენს ანგარიშზე ტერაბანკში: - GE92KS0000000360205169; შპს ინექს გრუპი. ამანათის გასატანად საჭიროა ქვითარი ბანკიდან და პირადობის მოწმობა ან პასპორტი`,`By bank transfer from any bank to our account at TeraBank: GE92KS0000000360205169; Inex Group LLC. To pick up the parcel, you need a bank receipt and an ID card or passport`],[`Space-ს მობილური აპლიკაციიდან`,`From the Space mobile app`],[`ამანათის ჩაბარებისას აუცილებელია მიუთითოთ მიმღების , რათა შეუფერხებლად მოხდეს მისი იდენტიფიცირება.`,`When handing over a parcel, you must provide the recipient details so identification can be completed smoothly.`],[`ამანათის ჩაბარებისას აუცილებელია მიუთითოთ მიმღების`,`When handing over a parcel, you must provide the recipient's`],[`, რათა შეუფერხებლად მოხდეს მისი იდენტიფიცირება.`,`, so they can be identified without issues.`],[`სახელი, გვარი და მოქმედი მობილური ტელეფონის ნომერი`,`first name, last name, and active mobile phone number`],[`როგორ უნდა ჩავაბარო ამანათი გამოსაგზავნად?`,`How should I hand over a parcel for shipment?`],[`ამანათი უნდა მიიტანოთ მითითებულ მისამართებზე. ასევე, შეგიძლიათ ისარგებლოთ , რისთვისაც წინასწარ უნდა დაგვიკავშირდეთ.`,`The parcel must be brought to the listed addresses. You can also use courier service, for which you should contact us in advance.`],[`ამანათი უნდა მიიტანოთ`,`The parcel should be brought to`],[`მითითებულ მისამართებზე. ასევე, შეგიძლიათ ისარგებლოთ`,`the listed addresses. You can also use`],[`, რისთვისაც წინასწარ უნდა დაგვიკავშირდეთ.`,`, for which you should contact us in advance.`],[`ჩვენი პარტნიორების ოფისებში`,`our partners' offices`],[`საკურიერო მომსახურებით`,`courier service`],[`რომელი ქვეყნებიდან შემიძლია პერსონალური ამანათის მიღება?`,`From which countries can I receive a personal parcel?`],[`გზავნილების მიღება შესაძლებელია ავსტრია, ბელგია, გერმანია, დიდი ბრიტანეთი, ესპანეთი, თურქეთი, ისრაელი, იტალია, კვიპროსი, ნიდერლანდები, საბერძნეთი, საფრანგეთი, პორტუგალია, დანია და შვედეთი.`,`Shipments can be received from Austria, Belgium, Germany, the United Kingdom, Spain, Turkey, Israel, Italy, Cyprus, the Netherlands, Greece, France, Portugal, Denmark, and Sweden.`],[`გზავნილების მიღება შესაძლებელია`,`Shipments can be received from`],[`ავსტრია, ბელგია, გერმანია, დიდი ბრიტანეთი, ესპანეთი, თურქეთი, ისრაელი, იტალია, კვიპროსი, ნიდერლანდები, საბერძნეთი, საფრანგეთი, პორტუგალია, დანია და შვედეთი.`,`Austria, Belgium, Germany, the United Kingdom, Spain, Turkey, Israel, Italy, Cyprus, the Netherlands, Greece, France, Portugal, Denmark, and Sweden.`],[`15 ქვეყნიდან:`,`from 15 countries:`],[`რა სიხშირით სრულდება შიდა რეისები?`,`How often are domestic trips made?`],[`შიდა გადაზიდვები ხორციელდება`,`Domestic shipping is carried out`],[`ყოველდღიურად`,`daily`],[`, რაც საშუალებას გვაძლევს ამანათები`,`, which lets us deliver parcels`],[`უმოკლეს ვადებში`,`as quickly as possible`],[`მივაწოდოთ ადრესატებს მთელი ქვეყნის მასშტაბით.`,`to recipients across Georgia.`],[`როგორ იანგარიშება ტრანსპორტირების ფასი?`,`How is the shipping price calculated?`],[`შიდა გადაზიდვებისას ფასი გამოითვლება მხოლოდ`,`For domestic shipping, the price is calculated only by`],[`რეალური წონის`,`actual weight`],[`მიხედვით. მოცულობითი წონის გათვალისწინება არ ხდება, რაც მომსახურებას`,`. Volumetric weight is not considered, making the service`],[`უფრო ხელმისაწვდომს`,`more affordable`],[`ხდის.`,`.`],[`რა დრო სჭირდება შიდა გადაზიდვას და რა არის ტარიფი?`,`How long does domestic shipping take and what is the tariff?`],[`ტრანსპორტირება`,`Shipping`],[`1-დან 4 დღემდე`,`1 to 4 days`],[`გრძელდება. მოქმედებს ორი ტიპის ტარიფი:`,`takes. Two tariff types apply:`],[`სპეციალური`,`Special`],[`— 1.2 ₾/კგ (მინიმალური 6₾) — ონლაინ ამანათების მომხმარებლებისთვის`,`- 1.2 GEL/kg (minimum 6 GEL) - for online parcel users`],[`— 1.5 ₾/კგ (მინიმალური 7₾)`,`- 1.5 GEL/kg (minimum 7 GEL)`],[`რომელ დღეებში შემიძლია ამანათების გატანა?`,`On which days can I pick up parcels?`],[`ჩვენი სერვის-ცენტრების`,`Most of our service centers`],[`უმრავლესობა მუშაობს ყოველდღე`,`work every day`],[`. თითოეული ფილიალის დეტალური სამუშაო საათების სანახავად ეწვიეთ:`,`. For detailed branch working hours, visit:`],[`ფილიალების სამუშაო საათები`,`Branch Working Hours`],[`სად შემიძლია ამანათის მიღება, თუ ჩემს ქალაქში ინექსის ოფისი არ არის?`,`Where can I receive a parcel if there is no Inex office in my city?`],[`იმ ქალაქებში, სადაც კომპანიას არ აქვს საკუთარი ოფისი, მომსახურებას`,`In cities where the company does not have its own office, service is provided by`],[`ჩვენი აგენტები`,`our agents`],[`უზრუნველყოფენ. ეს ქალაქებია: ახალციხე, გარდაბანი, დმანისი, დედოფლისწყარო, თეთრიწყარო, ლენტეხი, მარნეული, მესტია, სიღნაღი, ქარელი, წალენჯიხა, წალკა, წნორი და ხარაგაული.`,`in Akhaltsikhe, Gardabani, Dmanisi, Dedoplistskaro, Tetritskaro, Lentekhi, Marneuli, Mestia, Sighnaghi, Kareli, Tsalenjikha, Tsalka, Tsnori, and Kharagauli.`],[`რა მიმართულებებით სრულდება შიდა გადაზიდვები?`,`Which destinations are covered by domestic shipping?`],[`გზავნილების გაგზავნა შესაძლებელია საქართველოს`,`Shipments can be sent to`],[`ნებისმიერ ქალაქსა და რაიონულ ცენტრში`,`any city and district center in Georgia`],[`, სადაც ინექს გრუპის სერვის-ცენტრებია წარმოდგენილი ან ჩვენი აგენტების ფილიალებში.`,`where Inex Group service centers or agent branches are available.`],[`თუ ერთ ამანათზე ჩავნიშნე საკურიერო სერვისი და სხვა ამანათები შემდეგ ჩამოვიდა, მოიცავს თუ არა სერვისი მათაც?`,`If I selected courier service for one parcel and other parcels arrived later, does the service include them too?`],[`არა`,`No`],[`, სერვისი ვრცელდება მხოლოდ იმ ამანათებზე, რომლებზეც`,`, the service applies only to parcels where`],[`თავიდანვე გააქტიურებულია`,`it was activated from the start`],[`საკურიერო მომსახურება. სხვა ამანათებისთვის სერვისი`,`courier service. For other parcels, the service`],[`ხელახლა`,`again`],[`უნდა მონიშნოთ მათ ჩასვლამდე.`,`must be selected before they arrive.`],[`შესაძლებელია თუ არა კურიერის მოსვლის კონკრეტული დროის შერჩევა?`,`Can I choose a specific time for the courier to arrive?`],[`ამჟამად, ამანათის მიღების`,`Currently, for parcel delivery`],[`კონკრეტული დროის მითითება შეუძლებელია`,`a specific time cannot be selected`],[`. კურიერი დაგიკავშირდებათ ამანათის ჩაბარებამდე.`,`. The courier will contact you before delivery.`],[`რამდენ ჩაბარების მცდელობას მოიცავს მიწოდების სერვისი?`,`How many delivery attempts does the delivery service include?`],[`საკურიერო მომსახურება მოიცავს ამანათის ჩაბარების`,`Courier service includes`],[`2 მცდელობას`,`2 delivery attempts`],[`. ჩაბარებამდე კურიერი უკავშირდება მიმღებს. თუ ორივე მცდელობის მიუხედავად ამანათი ვერ ჩაბარდა, ის`,`. Before delivery, the courier contacts the recipient. If both attempts fail, the parcel`],[`ბრუნდება ფილიალში`,`returns to the branch`],[`და საკურიერო მომსახურების თანხა`,`and the courier service fee`],[`არ ბრუნდება`,`is not refunded`],[`შესაძლებელია თუ არა სერვისის გაუქმება და თანხის დაბრუნება?`,`Can the service be cancelled and refunded?`],[`თუ საკურიერო მომსახურებით სარგებლობა აღარ გსურთ,`,`If you no longer want to use courier service,`],[`გააუქმეთ სერვისი ჩაბარების მცდელობამდე`,`cancel the service before a delivery attempt`],[`. ასეთ შემთხვევაში საკურიერო მომსახურების ღირებულება`,`. In that case, the courier service fee`],[`დაგიბრუნდებათ`,`will be refunded`],[`როგორ მოვიქცე, თუ ამანათი დაზიანებულია?`,`What should I do if the parcel is damaged?`],[`აუცილებელია ამანათის შეფუთვა შეამოწმოთ`,`You must check the parcel packaging`],[`კურიერის თანდასწრებით`,`in the courier's presence`],[`. გარეგანი დაზიანების აღმოჩენის შემთხვევაში,`,`. If external damage is found,`],[`პრეტენზია დააფიქსირეთ ადგილზევე`,`file the claim on the spot`],[`მიწოდება ხდება შენობასთან თუ საფასურში შედის სართულზე ატანა?`,`Is delivery made to the building, or does the fee include carrying it upstairs?`],[`კურიერს ამანათი მიაქვს მითითებულ`,`The courier takes the parcel to the specified`],[`შენობასთან`,`building`],[`. სართულზე ატანა მის ვალდებულებაში`,`. Carrying it upstairs`],[`არ შედის`,`is not included`],[`. გაბარიტული ან`,`. Tariffs for oversized or`],[`30 კგ-ზე მეტი`,`over 30 kg`],[`წონის ამანათების ტარიფი განიხილება ინდივიდუალურად.`,`parcels are reviewed individually.`],[`რა ვადებში ხდება ამანათის მიწოდება?`,`How quickly is a parcel delivered?`],[`ამანათის მიტანა ხდება სერვისის არჩევიდან და გადახდიდან მომდევნო`,`The parcel is delivered within the next`],[`ორი სამუშაო დღის`,`two business days`],[`განმავლობაში. კურიერი`,`after selecting and paying for the service. The courier`],[`წინასწარ უკავშირდება`,`contacts`],[`მიმღებს.`,`the recipient in advance.`],[`რომელი ლოკაციებისთვის მოქმედებს დამატებითი ტარიფი?`,`Which locations have an additional tariff?`],[`შემდეგ მისამართებზე მომსახურების საფასურს ემატება`,`An additional service fee is added for these addresses:`],[`5 ლარი`,`5 GEL`],[`: ოქროყანა, ლილო, წინუბანი, წყნეთი, წავკისი, ფონიჭალა და ზემო ფონიჭალა.`,`: Okrokana, Lilo, Tsinubani, Tskneti, Tsavkisi, Ponichala, and Zemo Ponichala.`],[`რა ღირს საკურიერო მომსახურება?`,`How much does courier service cost?`],[`სტანდარტული ტარიფია`,`The standard tariff is`],[`8 ლარი`,`8 GEL`],[`. თუ ერთ რეისზე თქვენს სახელზე რამდენიმე ამანათი ჩამოვიდა, იხდით მხოლოდ ერთი ამანათის საფასურს (8₾), ხოლო დანარჩენს კურიერი`,`. If several parcels arrive in your name on one flight, you pay only one parcel fee (8 GEL), and the courier brings the rest`],[`უფასოდ`,`for free`],[`მოგიტანთ.`,`to you.`],[`აუცილებელია ყველა ამანათზე იყოს მონიშნული საკურიერო სერვისი.`,`Courier service must be selected for every parcel.`],[`როგორ მოვიქცე პერსონალური გზავნილის შემთხვევაში?`,`What should I do for a personal shipment?`],[`პერსონალურ ამანათებზე კურიერის გამოსაძახებლად უნდა`,`To request a courier for personal parcels, you must`],[`დაუკავშირდეთ ქოლ-ცენტრს`,`contact the call center`],[`. მომსახურების საფასურს გადაიხდით`,`. You will pay the service fee`],[`ნივთის ჩაბარებისას კურიერთან`,`to the courier when the item is delivered`],[`როგორ მოვითხოვო კურიერი ონლაინ გამოწერილ ამანათზე?`,`How do I request a courier for an online order?`],[`სერვისის გააქტიურება შეგიძლიათ`,`You can activate the service`],[`პირად კაბინეტში`,`in your dashboard`],[`: ამანათის დეკლარირებისას ან ჩამოსული ამანათების პანელში, თრექინგ კოდის გასწვრივ არსებული`,`: while declaring the parcel or in the arrived parcels panel, using the`],[`„საკურიერო მომსახურების"`,`"Courier Service"`],[`ღილაკით.`,`button next to the tracking code.`],[`რომელ ქალაქებში მოქმედებს საკურიერო მომსახურება?`,`In which cities is courier service available?`],[`საკურიერო სერვისი მოქმედებს`,`Courier service is available in`],[`თბილისში, ბათუმში, ქუთაისსა და რუსთავში`,`Tbilisi, Batumi, Kutaisi, and Rustavi`],[`. მომსახურება ვრცელდება როგორც ონლაინ გამოწერილ, ისე პერსონალურ გზავნილებზე.`,`. The service applies to both online orders and personal shipments.`],[`რა ხდება, თუ ამანათის შიგთავსი დაზიანებულია, ხოლო გარეგნულად დაზიანება არ აღენიშნება?`,`What happens if a parcel's contents are damaged but there is no external damage?`],[`თუ ამანათის`,`If the parcel's`],[`გარეგნული მხარე არ არის დაზიანებული`,`external side is not damaged`],[`, კომპანია`,`, the company`],[`არ იღებს პასუხისმგებლობას`,`does not take responsibility`],[`შიგთავსის დაზიანებაზე.`,`for damage to the contents.`],[`შესაძლებელია თუ არა ბონუს ქულებით დაზღვევის საფასურის გადახდა?`,`Can the insurance fee be paid with bonus points?`],[`, ბონუს ქულების მეშვეობით დაზღვევის საფასურის გადახდა`,`, paying the insurance fee with bonus points`],[`შეუძლებელია`,`is not possible`],[`ანაზღაურდება თუ არა ნივთის ღირებულება ამანათის დაკარგვის შემთხვევაში?`,`Will the item value be reimbursed if the parcel is lost?`],[`დიახ`,`Yes`],[`, დაზღვეული ამანათის დაკარგვის შემთხვევაში, ინექს გრუპი`,`, if an insured parcel is lost, Inex Group`],[`სრულად აანაზღაურებს`,`fully reimburses`],[`დეკლარირებული ნივთის ღირებულებას.`,`the declared item value.`],[`შემიძლია თუ არა დავაზღვიო უკვე ჩამოსული ამანათი?`,`Can I insure a parcel that has already arrived?`],[`, დაზღვევის ჩართვა შესაძლებელია`,`, insurance can be enabled`],[`მხოლოდ გამოგზავნამდე`,`only before shipment`],[`. თუ ტრანსპორტირების საფასური უკვე გადახდილი გაქვთ, სერვისის გააქტიურება`,`. If the shipping fee has already been paid, activating the service`],[`რა დოკუმენტაციაა საჭირო ზარალის ასანაზღაურებლად?`,`What documentation is needed for damage reimbursement?`],[`დაზიანების აღმოჩენის შემთხვევაში, პრეტენზია უნდა დაფიქსირდეს`,`If damage is found, the claim must be filed`],[`ფილიალშივე, ამანათის გატანის მომენტში`,`at the branch when picking up the parcel`],[`გატანილ ამანათებზე პრეტენზიები აღარ განიხილება.`,`Claims for already picked-up parcels are no longer reviewed.`],[`როდის არ ანაზღაურდება დაზიანებული ამანათის ზარალი?`,`When is damage to a parcel not reimbursed?`],[`ზარალი არ ანაზღაურდება:`,`Damage is not reimbursed:`],[`თუ ამანათს`,`if the parcel`],[`არ აღენიშნება გარეგნული დაზიანება`,`has no external damage`],[`(დეფორმირებული ყუთი, ნახევი და ა.შ.)`,`(deformed box, tear, etc.)`],[`თუ ამანათი`,`if the parcel`],[`უცხოეთის საწყობში უკვე დაზიანებული`,`already arrived damaged at the foreign warehouse`],[`მივიდა`,`arrived`],[`როგორ ხდება დაზღვევის საფასურის გადახდა?`,`How is the insurance fee paid?`],[`დაზღვევის`,`The insurance`],[`10%-იანი მოსაკრებელი`,`10% fee`],[`ავტომატურად ემატება ტრანსპორტირების ინვოისს. მისი გადახდა ხდება`,`is automatically added to the shipping invoice. It is paid`],[`ამანათის მიღებისას`,`when receiving the parcel`],[`ან`,`or`],[`წინასწარ`,`in advance`],[`, ტრანსპორტირების საფასურთან ერთად.`,`, together with the shipping fee.`],[`რა შემთხვევაში ითვლება ამანათი დაზღვეულად?`,`When is a parcel considered insured?`],[`ამანათი დაზღვეულია მხოლოდ მაშინ, თუ`,`A parcel is insured only if`],[`პირად კაბინეტში მონიშნული გაქვთ დაზღვევის უჯრა`,`you have checked the insurance box in your dashboard`],[`და ამანათი არის`,`and the parcel is`],[`დეკლარირებული`,`declared`],[`როდის არის შესაძლებელი ამანათის დაზღვევა?`,`When can a parcel be insured?`],[`დაზღვევის გააქტიურება შესაძლებელია`,`Insurance can be enabled`],[`ამანათის უცხოეთის საწყობში მიღების მომენტიდან`,`from the moment the parcel is received at the foreign warehouse`],[`, მის საქართველოში`,`, until it is`],[`გამოგზავნამდე`,`sent to Georgia`],[`როგორ შემიძლია ინდივიდუალური ტარიფის მოთხოვნა?`,`How can I request an individual tariff?`],[`კომერციული გადაზიდვის სპეციფიკიდან გამომდინარე, ფასის დასადგენად შეგიძლიათ`,`Because commercial shipping varies, to determine the price you can`],[`დაგვიტოვოთ განაცხადი`,`leave us a request`],[`დაუკავშირდეთ ჩვენს დეპარტამენტს`,`contact our department`],[`. ჩვენი მენეჯერები შემოგთავაზებენ`,`. Our managers will offer`],[`თქვენს საჭიროებებზე მორგებულ პერსონალურ ტარიფს`,`a personal tariff tailored to your needs`],[`როგორ დავთვალო ტარიფი?`,`How do I calculate the tariff?`],[`ტარიფი ითვლება`,`The tariff is calculated`],[`ინდივიდუალურად`,`individually`],[`. დაგვიკავშირდით:`,`. Contact us:`],[`როგორ გავიგო ტვირთის სტატუსი?`,`How can I find out the cargo status?`],[`ინფორმაციას მიიღებთ`,`You will receive information`],[`ელ-ფოსტაზე`,`by email`],[`, ან შეგიძლიათ მოგვწეროთ:`,`, or you can write to us:`],[`შესაძლებელია კარიდან კარამდე მომსახურება?`,`Is door-to-door service available?`],[`დიახ, მოთხოვნის შემთხვევაში ვახორციელებთ ტვირთის`,`Yes, upon request we provide cargo`],[`აღებას და მიწოდებას კარიდან კარამდე`,`pickup and door-to-door delivery`],[`როგორ დავიბრუნო დღგ (VAT)?`,`How do I get VAT refunded?`],[`დღგ-ის დაბრუნებისთვის საჭიროა`,`VAT refund requires`],[`ექსპორტის დეკლარაციის გაფორმება`,`preparing an export declaration`],[`. პროცესი წინასწარ უნდა შეთანხმდეს როგორც ჩვენთან, ასევე მომწოდებელთან და ოფიციალურად დარეგისტრირდეს საბაჟოზე ტვირთის გაგზავნამდე ან გაგზავნისას. დეტალებისთვის დაგვიკავშირდით:`,`. The process must be agreed in advance with both us and the supplier and officially registered with customs before or during cargo shipment. For details, contact us:`],[`რა საბუთებია საჭირო?`,`What documents are required?`],[`ძირითადად საჭიროა:`,`Usually required:`],[`ინვოისი, შეფუთვის სია (Packing List) და ტრანსპორტირების ინვოისი`,`invoice, packing list, and shipping invoice`],[`. ზოგ შემთხვევაში შეიძლება`,`. In some cases,`],[`დამატებითი დოკუმენტებიც`,`additional documents`],[`დაგჭირდეთ.`,`may also be required.`],[`რას მოიცავს საბაჟო-საბროკერო მომსახურება?`,`What does customs brokerage service include?`],[`ჩვენი სპეციალისტები სრულად მართავენ ტვირთის`,`Our specialists fully manage the cargo`],[`საბაჟო გაფორმებისა და დეკლარირების`,`customs clearance and declaration`],[`პროცესს. მომსახურება მოიცავს:`,`process. The service includes:`],[`საჭირო დოკუმენტაციის მომზადებას, საბაჟო დეკლარაციის შევსებას, დასაბეგრი ღირებულების განსაზღვრასა`,`preparing required documentation, filling out the customs declaration, determining taxable value`],[`და, საჭიროების შემთხვევაში,`,`and, if needed,`],[`წარმომადგენლობას საბაჟო ორგანოებთან`,`representation with customs authorities`],[`როგორ განვაბაჟო ტვირთი თავად?`,`How can I clear cargo through customs myself?`],[`ტვირთის განბაჟება შესაძლებელია მომხმარებლის მიერ`,`Cargo can be cleared by the customer`],[`გაფორმების ეკონომიკურ ზონაში (GEZ)`,`in the Clearance Economic Zone (GEZ)`],[`. ამ შემთხვევაში, მომხმარებელი თავად აწარმოებს`,`. In this case, the customer handles`],[`საბუთების მომზადებას, დეკლარაციის შევსებასა და კომუნიკაციას საბაჟო ორგანოებთან`,`document preparation, declaration completion, and communication with customs authorities`],[`. ასევე შეგიძლიათ ისარგებლოთ ჩვენი`,`. You can also use our`],[`საბაჟო-საბროკერო მომსახურებით`,`customs brokerage service`],[`როგორ ხდება საბაჟო პროცედურების განხორციელება?`,`How are customs procedures handled?`],[`შეგიძლიათ ტვირთი`,`You can clear the cargo`],[`თავად განაბაჟოთ`,`yourself`],[`ან ისარგებლოთ`,`or use`],[`ჩვენი საბაჟო მომსახურებით`,`our customs service`],[`. ჩვენს სპეციალისტებს შეუძლიათ სრულად მართონ პროცესი`,`. Our specialists can fully manage the process`],[`მინდობილობის საფუძველზე`,`based on power of attorney`],[`რა ტიპის ტვირთების გადაზიდვას ახორციელებთ?`,`What types of cargo do you transport?`],[`თითქმის`,`Almost`],[`ყველა ტიპის კომერციულ ტვირთს`,`all types of commercial cargo`],[`, გარდა სახიფათო (ADR) და კანონით აკრძალული ნივთიერებებისა. ხელმისაწვდომია როგორც`,`, except hazardous (ADR) and legally prohibited substances. Both`],[`ნაკრები (LTL/LCL)`,`groupage (LTL/LCL)`],[`, ისე`,`and`],[`სრული (FTL/FCL)`,`full (FTL/FCL)`],[`ტვირთები.`,`cargo are available.`],[`შესაძლებელია თუ არა ჩინეთიდან ნაკრები ტვირთების ჩამოტანა?`,`Is groupage cargo from China available?`],[`დიახ, ჩვენ გთავაზობთ`,`Yes, we offer`],[`საზღვაო ნაკრები ტვირთების (LCL)`,`sea groupage cargo (LCL)`],[`ტრანსპორტირებას ჩინეთიდან საქართველოში, რაც საშუალებას გაძლევთ დაზოგოთ ხარჯები`,`transportation from China to Georgia, which lets you save costs`],[`მცირე მოცულობის ტვირთების`,`even for small-volume cargo`],[`შემთხვევაშიც კი.`,`.`],[`რომელი ქვეყნებიდან ხდება კომერციული ტვირთის ტრანსპორტირება?`,`From which countries is commercial cargo transported?`],[`სახმელეთო გადაზიდვები ძირითადად ხორციელდება`,`Ground shipments are mainly carried out`],[`იტალიიდან და საბერძნეთიდან`,`from Italy and Greece`],[`. ასევე შესაძლებელია საზღვაო ნაკრები ტვირთების ჩამოტანა`,`. Sea groupage cargo can also be brought`],[`ჩინეთიდან`,`from China`],[`აკრძალული ნივთების ვრცელი ჩამონათვალი, რომელიც დაყოფილია კატეგორიებად, შეგიძლიათ იხილოთ მითითებულ ბმულზე:`,`A detailed list of prohibited items, divided by category, is available at the provided link:`],[`დაგროვილი ქულები აისახება თქვენს „საფულეში". ამანათის გატანისას ან ონლაინ გადახდისას, შეგიძლიათ აირჩიოთ ბონუსებით გადახდა და ამით სრულად ან ნაწილობრივ დაფაროთ ტრანსპორტირების ღირებულება.`,`Accumulated points appear in your wallet. When picking up a parcel or paying online, you can choose payment with bonuses and fully or partially cover the shipping cost.`],[`ყოველ გადახდილ ტრანსპორტირებაზე, ინექს გრუპი ბონუს ქულების სახით გიბრუნებთ გადახდილი თანხის`,`For every paid shipment, Inex Group returns part of the paid amount as bonus points`],[`. ეს ქულები გროვდება თქვენს პირად ანგარიშზე და მათი გამოყენება შეგიძლიათ მომდევნო ამანათების საფასურის გადასახდელად.`,`. These points accumulate in your account and can be used to pay for future parcels.`],[`გადაფუთვა ხდება მხოლოდ საჰაერო გზით გამოგზავნისას, თუ ნივთის შიგთავსი ამის შესაძლებლობას იძლევა. გაითვალისწინეთ, რომ`,`Repacking is done only for air shipments when the item contents allow it. Please note that`],[`ჩინეთიდან გამოწერილი ამანათები იანგარიშება რეალურსა და მოცულობით წონას შორის უდიდესით. თუ მოცულობითი წონა აღემატება რეალურს, ტარიფი დაითვლება მოცულობით. თუმცა, საჰაერო გადაზიდვისას, ჩვენ მაქსიმალურად ვცდილობთ ნივთების`,`Parcels ordered from China are calculated by the greater of actual and volumetric weight. If volumetric weight exceeds actual weight, the tariff is calculated by volume. For air shipping, however, we try as much as possible to`],[`, რათა მოცულობითი წონა შემცირდეს.`,`, so the volumetric weight is reduced.`],[`ამანათის ფასი დამოკიდებულია მის წონაზე და გამომგზავნ ქვეყანაზე. ქვეყნების უმეტესობიდან (აშშ, დიდი ბრიტანეთი, ესპანეთი, გერმანია, იტალია, საბერძნეთი, კვიპროსი, პოლონეთი და თურქეთი) ღირებულება ითვლება მხოლოდ`,`The parcel price depends on its weight and origin country. From most countries (USA, United Kingdom, Spain, Germany, Italy, Greece, Cyprus, Poland, and Turkey), the cost is calculated only by`],[`, რაც ნიშნავს, რომ არ იხდით ზედმეტს ამანათის ზომების (მოცულობის) გამო.`,`, which means you do not pay extra because of parcel dimensions (volume).`],[`(საბერძნეთი, იტალია, გერმანია, ესპანეთი და სხვა): კვირაში ერთხელ,`,`(Greece, Italy, Germany, Spain, and others): once a week,`],[`(სახმელეთო გზით)`,`(by ground)`],[`კვირაში ერთხელ,`,`once a week,`],[`(საჰაერო გზით)`,`(by air)`],[`როგორია პერსონალური ამანათების გამოგზავნის განრიგი საქართველოში?`,`What is the schedule for sending personal parcels to Georgia?`],[`ევროპიდან და ისრაელიდან პირადი გზავნილების გაგზავნა შესაძლებელია შემდეგ დღეებში:`,`Personal shipments from Europe and Israel can be sent on these days:`],[`კვირაში 2-ჯერ (სამშ., პარ.) — 5−10 დღე`,`Twice a week (Tue, Fri) - 5-10 days`],[`კვირაში ერთხელ (ორშაბათს) — 5−10 დღე`,`Once a week (Monday) - 5-10 days`],[`კვირაში ერთხელ (ხუთშაბათს) — 5−10 დღე`,`Once a week (Thursday) - 5-10 days`],[`კვირაში ერთხელ (ორშაბათს) — 10−14 დღე`,`Once a week (Monday) - 10-14 days`],[`კვირაში ერთხელ (ორშაბათს) — 8−10 დღე`,`Once a week (Monday) - 8-10 days`],[`კვირაში 2-ჯერ (ორშ., პარ.) — 5−7 დღე`,`Twice a week (Mon, Fri) - 5-7 days`],[`კვირაში ერთხელ — 5−7 დღე`,`Once a week - 5-7 days`],[`ისრაელი:`,`Israel:`],[`ყოველ პარასკევს — 14−21 დღე`,`Every Friday - 14-21 days`],[`ონლაინ ამანათების ტრანსპორტირება ხორციელდება შემდეგი განრიგით:`,`Online parcels are transported on this schedule:`],[`ყოველდღე — 5−10 დღე`,`Every day - 5-10 days`],[`საჰაერო კვირაში 3-ჯერ (სამშ., ხუთ., შაბ.) — 10−15 დღე; სახმელეთო/საზღვაო კვირაში ერთხელ (შაბ.) — 30−40 დღე`,`Air three times a week (Tue, Thu, Sat) - 10-15 days; ground/sea once a week (Sat) - 30-40 days`],[`რომელ ქვეყნებში შემიძლია პერსონალური ამანათის გაგზავნა საქართველოდან?`,`To which countries can I send a personal parcel from Georgia?`],[`საქართველოდან პერსონალური გზავნილების გაგზავნა შესაძლებელია შემდეგ ქვეყნებში: საბერძნეთი, კვიპროსი, იტალია, გერმანია, ნიდერლანდები, პორტუგალია, დანია და შვედეთი.`,`Personal shipments from Georgia can be sent to Greece, Cyprus, Italy, Germany, the Netherlands, Portugal, Denmark, and Sweden.`],[`საიდან შემიძლია პირადი გზავნილების მიღება?`,`Where can I receive personal shipments from?`],[`პირადი გზავნილების მიღება საქართველოში შესაძლებელია`,`Personal shipments can be received in Georgia from`],[`: ავსტრია, გერმანია, დიდი ბრიტანეთი, ესპანეთი, თურქეთი, ისრაელი, იტალია, საბერძნეთი, საფრანგეთი, ნიდერლანდები, ბელგია, კვიპროსი, შვედეთი, პორტუგალია და დანია.`,`: Austria, Germany, United Kingdom, Spain, Turkey, Israel, Italy, Greece, France, Netherlands, Belgium, Cyprus, Sweden, Portugal, and Denmark.`],[`რომელი ქვეყნებიდან შემიძლია ონლაინ ამანათების გამოწერა?`,`From which countries can I order online parcels?`],[`საქართველოს მიმართულებით ონლაინ ამანათების გამოწერა შესაძლებელია`,`Online parcels to Georgia can be ordered from`],[`: ამერიკა, დიდი ბრიტანეთი, გერმანია, საბერძნეთი, იტალია, პოლონეთი, ესპანეთი, ჩინეთი, თურქეთი და კვიპროსი.`,`: USA, United Kingdom, Germany, Greece, Italy, Poland, Spain, China, Turkey, and Cyprus.`],[`აირჩიეთ`,`Select`],[`ფორმაში`,`In the form`],[`მიუთითეთ სახელი, გვარი და ტელეფონის ნომერი`,`enter first name, last name, and phone number`],[`აირჩიეთ ქვეყანა —`,`Select a country -`],[`ჩაწერეთ სახელი და გვარი`,`Enter first and last name`],[`საქართველოს მოქალაქე: შეიყვანეთ`,`Georgian citizen: enter`],[`სხვა ქვეყნის მოქალაქე: აირჩიეთ „9 Digit Code" და შეიყვანეთ`,`Citizen of another country: select "9 Digit Code" and enter`],[`რეგისტრაციისთვის:`,`To register:`],[`გადმოწერეთ`,`Download`],[`აპლიკაცია`,`the app`],[`კოდი და შეიყვანეთ თქვენი ტელეფონის ნომერი`,`the code and enter your phone number`],[`შეიყვანეთ`,`Enter`],[`, რომელიც თქვენს ნომერზე მოვა — რეგისტრაცია დასრულებულია`,`, which will arrive on your number - registration is complete`],[`თუ ნივთი დაზიანებულია,`,`If the item is damaged,`],[`. ჩვენი გუნდი დაგეხმარებათ ხარვეზის იდენტიფიცირებაში და მოგაწვდით ინფორმაციას`,`. Our team will help identify the issue and provide information`],[`პროცედურების შესახებ.`,`about the procedures.`],[`დიახ, ჩვენი`,`Yes, our`],[`. ასევე შეგიძლიათ ისარგებლოთ`,`. You can also use`],[`Wolt, Bolt Food ან Glovo-ს`,`Wolt, Bolt Food, or Glovo`],[`მიტანის სერვისით იმ ქალაქებში, სადაც აღნიშნული კომპანიები ოპერირებენ.`,`delivery service in cities where these companies operate.`],[`ამანათი ჩამოვა ინექს გრუპის იმ ფილიალში, რომელიც მითითებული გაქვთ პირად პროფილში`,`The parcel will arrive at the Inex Group branch specified in your profile`],[`. სურვილის შემთხვევაში, ფილიალის შეცვლა შეგიძლიათ`,`. If desired, you can change the branch`],[`ტარიფები განსხვავდება პლატფორმისა და ტრანსპორტირების ტიპის მიხედვით:`,`Tariffs differ by platform and shipping type:`],[`1 კგ — $4`,`1 kg - $4`],[`სტუდენტური ტარიფი: 1 კგ — $3.5`,`Student tariff: 1 kg - $3.5`],[`თრექინგ კოდი`,`tracking code`],[`. მისი ნახვა შეგიძლიათ`,`. You can find it`],[`ნივთი (შეკვეთების ისტორიაში). ამანათი ასევე`,`item (in order history). The parcel also`],[`ინექს გრუპის პირად კაბინეტშიც.`,`appears in the Inex Group dashboard too.`],[`პარტნიორი პლატფორმებიდან (`,`When ordering directly from partner platforms (`],[`) პირდაპირი გამოწერის შემთხვევაში,`,`),`],[`. ინფორმაცია თქვენი შენაძენის შესახებ`,`. Information about your purchase`],[`აისახება ჩვენს სისტემაში.`,`appears in our system.`],[`პირდაპირი გადაზიდვისას`,`With direct shipping`],[`უცხოური მაღაზიის სისტემაში. თქვენ`,`in the foreign store system. You`],[`უცხოური საწყობის მისამართების ხელით კოპირება — პირდაპირ ირჩევთ ინექს გრუპს მაღაზიის მისამართების სიაში, რაც`,`do not manually copy foreign warehouse addresses - you select Inex Group directly from the store address list, which`],[`და ამარტივებს პროცესს.`,`and simplifies the process.`],[`როგორ გადავიხადო ამანათის საფასური ბონუსებით?`,`How do I pay the parcel fee with bonuses?`],[`ამანათის ტრანსპორტირების გადახდისას, სისტემა შემოგთავაზებთ არჩევანს — გადაიხადოთ თანხა`,`When paying for parcel shipping, the system will offer a choice - pay the amount`],[`ბარათით/საფულით`,`by card/wallet`],[`დაგროვებული ბონუს ქულებით`,`with accumulated bonus points`],[`აქვს თუ არა ბონუს ქულებს მოქმედების ვადა?`,`Do bonus points expire?`],[`ქულების მოქმედების ვადის შესახებ ინფორმაცია`,`Information about bonus point validity`],[`პერიოდულად ახლდება`,`is updated periodically`],[`. რეკომენდებულია მათი გამოყენება`,`. It is recommended to use them`],[`დაგროვებისთანავე`,`as soon as they accumulate`],[`სად ვნახო ინფორმაცია ჩემი ქულების შესახებ?`,`Where can I see information about my points?`],[`ბონუსების ბალანსის ნახვა შეგიძლიათ`,`You can view your bonus balance`],[`თქვენს პირად კაბინეტში`,`in your dashboard`],[`, სადაც დეტალურად არის ასახული დაგროვებული და გამოყენებული ქულების ისტორია.`,`, where the history of accumulated and used points is shown in detail.`],[`რაში შემიძლია გამოვიყენო დაგროვებული ქულები?`,`What can I use accumulated points for?`],[`დაგროვებული ბონუსებით შეგიძლიათ`,`With accumulated bonuses, you can`],[`სრულად ან ნაწილობრივ`,`fully or partially`],[`დაფაროთ მომდევნო ამანათების ტრანსპორტირების ღირებულება.`,`cover future parcel shipping costs.`],[`როგორ დავაგროვო ბონუს ქულები?`,`How do I accumulate bonus points?`],[`ქულები`,`Points`],[`ავტომატურად გერიცხებათ`,`are credited automatically`],[`ყოველ გადახდილ ამანათზე. რაც უფრო ხშირად სარგებლობთ ჩვენი მომსახურებით, მით მეტ ქულას`,`for every paid parcel. The more often you use our service, the more points`],[`აგროვებთ თქვენს პირად ანგარიშზე`,`you accumulate in your account`],[`რა არის ინექს გრუპის ბონუს სისტემა?`,`What is the Inex Group bonus system?`],[`ეს არის`,`This is`],[`ლოიალობის პროგრამა`,`a loyalty program`],[`, რომელიც საშუალებას გაძლევთ დაზოგოთ თანხა. ყოველი გადახდილი ტრანსპორტირებისას, საფასურის ნაწილი გიბრუნდებათ`,`, which lets you save money. For every paid shipment, part of the fee is returned to you`],[`ბონუს ქულების სახით`,`as bonus points`],[`საბურთალო`,`Saburtalo`],[`ვაკე-საბურთალო, მ. თამარაშვილის გამზ. N19`,`Vake-Saburtalo, M. Tamarashvili Ave. N19`],[`წერეთელი`,`Tsereteli`],[`წერეთლის გამზირი N57`,`Tsereteli Ave. N57`],[`გლდანი`,`Gldani`],[`ბიზნეს ცენტრი ბიემესი ხიზანიშვილის 23`,`BMS Business Center, Khizanishvili 23`],[`ისანი`,`Isani`],[`აწყურის 45`,`Atskuri 45`],[`დიდი დიღომი`,`Didi Dighomi`],[`მირიან მეფის 42`,`Mirian Mepe 42`],[`ვარკეთილი`,`Varketili`],[`საქართველოს ერთიანობისთვის მებრძოლთა ქუჩა 41`,`Fighters for Georgia Unity St. 41`],[`ზასტავა`,`Zastava`],[`კიკვიძის პარკის მიმდებარედ ირაკლი აბაშიძის გამზ. N10`,`Near Kikvidze Park, Irakli Abashidze Ave. N10`],[`ჰუალინგი`,`Hualing`],[`ჰუალინგ პლაზა, ჯ. ლეჟავას 22`,`Hualing Plaza, J. Lezhava 22`],[`ჭავჭავაძე`,`Chavchavadze`],[`ჭავჭავაძის N51`,`Chavchavadze N51`],[`ზუგდიდი`,`Zugdidi`],[`რუსთაველის N89`,`Rustaveli N89`],[`ჩემი ტარიფი`,`My Tariff`],[`დეკლარირება და განბაჟება`,`Declaration and Customs Clearance`],[`მნიშვნელოვანი შეტყობინებები დოკუმენტაციასა, ინვოისებსა და საბაჟო სტატუსებზე.`,`Important notifications about documentation, invoices, and customs statuses.`],[`საჭიროა ინვოისი განბაჟებისთვის`,`Invoice Required for Customs Clearance`],[`საბაჟო დეკლარაციის შეხსენება`,`Customs Declaration Reminder`],[`ჯარიმის გადახდის დამადასტურებელი დოკუმენტი არასწორია`,`Penalty Payment Confirmation Document Is Incorrect`],[`გადახდის დამადასტურებელი დოკუმენტი არასწორია`,`Payment Confirmation Document Is Incorrect`],[`ამანათმა გაიარა ყვითელ დერეფანში`,`Parcel Passed Through the Yellow Corridor`],[`დეკლარაცია გამოგეგზავნათ გადასახედად`,`Declaration Was Sent to You for Review`],[`გადახდის ქვითარი გაიგზავნა შემოსავლების სამსახურში`,`Payment Receipt Was Sent to the Revenue Service`],[`ამანათი გამოძახებულია შემოწმებაზე`,`Parcel Was Called for Inspection`],[`საბაჟო შემოწმება დასრულდა`,`Customs Inspection Completed`],[`ამანათი მზადების პროცესშია`,`Parcel Is Being Prepared`],[`საბაჟო დეკლარაცია დასრულებულია`,`Customs Declaration Completed`],[`გადახდის დამადასტურებელი საბუთი მიღებულია`,`Payment Confirmation Document Received`],[`დეკლარაციაზე უარის თქმა`,`Declaration Refusal`],[`თქვენს ამანათზე დაეკისრა ჯარიმა`,`A Penalty Was Applied to Your Parcel`],[`ჯარიმის გადახდა დადასტურებულია`,`Penalty Payment Confirmed`],[`დეკლარაცია წარმატებით დადასტურდა`,`Declaration Successfully Confirmed`],[`საბაჟო დეკლარაციის დახურვის მცდელობა`,`Customs Declaration Closure Attempt`],[`დაიწყო შიდა საბაჟო პროცედურები`,`Internal Customs Procedures Started`],[`დასრულდა შიდა საბაჟო პროცედურები`,`Internal Customs Procedures Completed`],[`დაიწყო საბაჟო პროცედურები`,`Customs Procedures Started`],[`საბაჟო პროცედურები დასრულდა`,`Customs Procedures Completed`],[`შეხსენება: ამანათი საჭიროებს დეკლარირებას`,`Reminder: Parcel Requires Declaration`],[`ამანათი განბაჟებას არ დაექვემდებარა`,`Parcel Was Not Subject to Customs Clearance`],[`ამანათი გაჩერდა საბაჟოზე (არასწორი დეკლარაცია)`,`Parcel Stopped at Customs (Incorrect Declaration)`],[`ამანათი გაჩერდა საბაჟოზე (დაუდეკლარირებელი)`,`Parcel Stopped at Customs (Undeclared)`],[`ამანათი გაჩერდა საბაჟოზე (შემოწმება)`,`Parcel Stopped at Customs (Inspection)`],[`ამანათი ექვემდებარება განბაჟებას`,`Parcel Is Subject to Customs Clearance`],[`არადეკლარირებული ამანათი გამოიგზავნა`,`Undeclared Parcel Was Shipped`],[`ამანათი განბაჟდა`,`Parcel Cleared Customs`],[`ამანათის მოძრაობა`,`Parcel Movement`],[`ამანათის გზა: უცხოეთის საწყობიდან საქართველოში ჩამოსვლამდე და ფილიალში განაწილებამდე.`,`Parcel path: from the foreign warehouse to arrival in Georgia and distribution to the branch.`],[`ამანათი შეიქმნა სისტემაში`,`Parcel Created in the System`],[`ამანათი მიღებულია საწყობში`,`Parcel Received at Warehouse`],[`ამანათი გამოიგზავნა საწყობიდან`,`Parcel Sent from Warehouse`],[`მოთხოვნილია ამანათის შეჩერება`,`Parcel Hold Requested`],[`ამანათი იგზავნება საბაჟოზე`,`Parcel Is Being Sent to Customs`],[`ამანათი გამოიგზავნა (რეისი)`,`Parcel Shipped (Flight)`],[`ამანათი სატრანზიტო ქვეყანაშია`,`Parcel Is in a Transit Country`],[`ამანათი ჩამოვიდა დანიშნულების ქვეყანაში`,`Parcel Arrived in Destination Country`],[`დაიწყო სატერმინალო პროცედურები`,`Terminal Procedures Started`],[`ამანათი დახარისხების ცენტრშია`,`Parcel Is at the Sorting Center`],[`ამანათი გატანის წერტილისკენ მიემართება`,`Parcel Is Heading to Pickup Point`],[`ამანათი საწყობშია და მზადდება მოსატანად`,`Parcel Is in Warehouse and Being Prepared for Delivery`],[`ამანათი მზად არის გასატანად`,`Parcel Is Ready for Pickup`],[`ამანათი გადამისამართდა`,`Parcel Was Redirected`],[`ამანათი საერთაშორისო გზაზეა`,`Parcel Is on the International Route`],[`პრობლემები და დაბრუნება`,`Issues and Returns`],[`არასტანდარტული სიტუაციები: მაღაზიაში დაბრუნება, დაზიანება, გაუქმება.`,`Non-standard situations: return to store, damage, cancellation.`],[`ამანათი უტილიზებულია`,`Parcel Was Disposed`],[`ამანათი უბრუნდება გამგზავნს`,`Parcel Is Returning to Sender`],[`გაუტანელი ამანათი გადაეცა სახელმწიფოს/გამგზავნს`,`Unclaimed Parcel Was Transferred to the State/Sender`],[`ამანათი დაიკარგა`,`Parcel Was Lost`],[`დაკარგული ამანათი ნაპოვნია`,`Lost Parcel Found`],[`ამანათი დაზიანდა`,`Parcel Was Damaged`],[`ამანათის სტატუსი განუსაზღვრელია`,`Parcel Status Is Undefined`],[`დაიწყო ამანათის დაბრუნების პროცედურა`,`Parcel Return Procedure Started`],[`საკურიერო და მიწოდება`,`Courier and Delivery`],[`შეტყობინებები, რომლებიც ეხება ამანათის სახლში მიტანას.`,`Notifications related to home parcel delivery.`],[`კურიერს მიაქვს ამანათი`,`Courier Is Delivering the Parcel`],[`ამანათი წარმატებით ჩაბარდა`,`Parcel Delivered Successfully`],[`ამანათის ჩაბარება ვერ მოხერხდა`,`Parcel Delivery Failed`],[`ფინანსები და საფულე`,`Finances and Wallet`],[`ინფორმაცია ტრანსპორტირების ღირებულებასა, ბალანსის შევსებასა და ხარჯებზე.`,`Information about shipping cost, balance top-up, and expenses.`],[`დაკარგული/დაზიანებული ამანათი: კომპენსაცია გაიცა`,`Lost/Damaged Parcel: Compensation Issued`],[`დაკარგული/დაზიანებული ამანათი: კომპენსაცია არ გაცემულა`,`Lost/Damaged Parcel: Compensation Not Issued`],[`სერვისი "გამოიწერე ჩემს მაგივრად" და უკუკავშირი`,`"Order for Me" Service and Feedback`],[`მივიღეთ თქვენი მოთხოვნა ამანათის გამოწერაზე`,`We Received Your Parcel Order Request`],[`გამოწერაზე დახმარების მოთხოვნა გაუქმდა`,`Order Assistance Request Was Cancelled`],[`თქვენი ამანათი გამოწერილია`,`Your Parcel Has Been Ordered`],[`გამოსაწერად გთხოვთ გადაიხადოთ თანხა საფულიდან`,`To Order, Please Pay from Wallet`],[`სხვა`,`Other`],[`სხვა შეტყობინებები`,`Other Notifications`],[`შეაფასეთ გატანის სერვისი`,`Rate the Pickup Service`],[`სატარიფო გეგმის ცვლილება`,`Tariff Plan Change`],[`უსაფრთხოების გაფრთხილება: პაროლი შეიცვალა`,`Security Alert: Password Changed`],[`მთავარ მომხარებლად დამატების მოთხოვნა უარყოფილია`,`Main User Add Request Rejected`],[`ქვემომხმარებლად დამატების მოთხოვნა უარყოფილია`,`Subuser Add Request Rejected`],[`რეგისტრაცია წარმატებით დასრულდა`,`Registration Completed Successfully`],[`მოთხოვნა ანგარიშზე წვდომის შესახებ`,`Account Access Request`],[`დაარეგისტრირეთ ანგარიში წვდომის მისაცემად`,`Register an Account to Grant Access`],[`წვდომის მოთხოვნა დადასტურდა`,`Access Request Confirmed`],[`თქვენ დაადასტურეთ წვდომა`,`You Confirmed Access`],[`თქვენი წვდომა ანგარიშზე გაუქმდა`,`Your Account Access Was Revoked`],[`მომხმარებლის წვდომა თქვენს ანგარიშზე გაუქმდა`,`User Access to Your Account Was Revoked`],[`მინდა მივიღო მარკეტინგული შეტყობინებები`,`I want to receive marketing messages`],[`გადაზიდვა არ არის`,`No shipment`],[`ამანათის გატანა შეგიძლიათ`,`You can pick up parcels`],[`და`,`and`],[`მთელი საქართველოს მასშტაბით. ფილიალების მისამართების, სამუშაო საათებისა და საკონტაქტო მონაცემების შესახებ დეტალური ინფორმაცია`,`across Georgia. Detailed information about branch addresses, working hours, and contact details`],[`ამანათს ჩაბარებისას ენიჭება`,`When handed over, the parcel is assigned`],[`, რომლის საშუალებითაც მიმღებს შეუძლია ნებისმიერ დროს გადაამოწმოს მისი ადგილმდებარეობა და სტატუსი. საქართველოში ჩამოსვლისა და ოფისში დახარისხების შემდეგ, მიმღები ავტომატურად მიიღებს`,`, which lets the recipient check its location and status at any time. After arrival in Georgia and sorting at the office, the recipient automatically receives`],[`უსაფრთხოების საერთაშორისო ნორმებისა და ავიაციის წესების თანახმად, არსებობს გარკვეული კატეგორიის ნივთები, რომელთა ტრანსპორტირებაც დაუშვებელია. აკრძალული ნივთების სრული და დეტალური სია შეგიძლიათ იხილოთ:`,`According to international safety standards and aviation rules, some item categories cannot be transported. The full detailed prohibited-items list is available at:`],[`ამანათის გამოსაგზავნად აუცილებელია მიუთითოთ მიმღების`,`To send a parcel, you must provide the recipient's`],[`. გაითვალისწინეთ, რომ საქართველოში ამანათის გატანისას მიმღები ვალდებულია თან იქონიოს`,`. Please note that when picking up a parcel in Georgia, the recipient must have`],[`ამანათების ტრანსპორტირების ღირებულებისა და ქვეყნების მიხედვით არსებული ფასების სანახავად გადადით ბმულზე:`,`To view parcel shipping costs and prices by country, open the link:`],[`რა დღეებში ხდება ამანათების ტრანსპორტირება საქართველოდან საზღვარგარეთ?`,`On which days are parcels transported from Georgia abroad?`],[`საქართველოდან ამანათების ტრანსპორტირება ხდება შემდეგი განრიგით:`,`Parcels from Georgia are transported on this schedule:`],[`ევროპის ქვეყნების მიმართულებით`,`To European countries`],[`(საბერძნეთი, კვიპროსი, იტალია, გერმანია, ნიდერლანდები, პორტუგალია, დანია, შვედეთი, ესპანეთი, ბელგია, საფრანგეთი, ავსტრია): სახმელეთო გზით, კვირაში ერთხელ —`,`(Greece, Cyprus, Italy, Germany, Netherlands, Portugal, Denmark, Sweden, Spain, Belgium, France, Austria): by ground, once a week -`],[`საჰაერო გზით, კვირაში ერთხელ —`,`by air, once a week -`],[`რომელი მიმართულებით არის შესაძლებელი პერსონალური ამანათების გაგზავნა საქართველოდან?`,`To which destinations can personal parcels be sent from Georgia?`],[`საქართველოდან პირადი ამანათების გაგზავნა შეგიძლიათ ევროპის შემდეგ ქვეყნებში:`,`You can send personal parcels from Georgia to these European countries:`],[`საბერძნეთი, კვიპროსი, იტალია, გერმანია, ნიდერლანდები, პორტუგალია, დანია, შვედეთი, ესპანეთი, ბელგია, საფრანგეთი, ავსტრია და დიდი ბრიტანეთი.`,`Greece, Cyprus, Italy, Germany, Netherlands, Portugal, Denmark, Sweden, Spain, Belgium, France, Austria, and the United Kingdom.`],[`რომელი ქვეყნებიდან არის შესაძლებელი პერსონალური ამანათების გამოგზავნა საქართველოში და როგორია გრაფიკი?`,`From which countries can personal parcels be sent to Georgia, and what is the schedule?`],[`პერსონალური გზავნილების მიღება საქართველოში შესაძლებელია`,`Personal shipments can be received in Georgia from`],[`საჰაერო გზით, ყოველ ოთხშაბათს`,`by air, every Wednesday`],[`კვირაში ორჯერ — ორშაბათს და პარასკევს`,`twice a week - Monday and Friday`],[`კვირაში ორჯერ, ყოველ მესამე დღეს`,`twice a week, every third day`],[`იტალია, გერმანია, ნიდერლანდები, ესპანეთი, ბელგია, საფრანგეთი, ავსტრია:`,`Italy, Germany, Netherlands, Spain, Belgium, France, Austria:`],[`ყოველ პარასკევს (ტრანსპორტირება: 14–21 დღე)`,`every Friday (shipping: 14-21 days)`],[`სიაში ასევეა:`,`The list also includes:`],[`კვიპროსი, შვედეთი და პორტუგალია`,`Cyprus, Sweden, and Portugal`],[`ოოოპს!`,`Oops!`],[`გვერდი რომელსაც ეძებდი არ არსებობს`,`The page you are looking for does not exist`],[`აქ მოცემულია რამდენიმე სასარგებლო ბმული:`,`Here are some useful links:`],[`კაბინეტი`,`Dashboard`]]),Gt=[[/(?<![\u10a0-\u10ff])მიმღები მომხმარებელი(?![\u10a0-\u10ff])/g,`Receiver Client`],[/(?<![\u10a0-\u10ff])ჩამოტანის მეთოდი(?![\u10a0-\u10ff])/g,`Delivery Method`],[/(?<![\u10a0-\u10ff])მიწოდების მეთოდი(?![\u10a0-\u10ff])/g,`Delivery Method`],[/(?<![\u10a0-\u10ff])მიტანის მეთოდი(?![\u10a0-\u10ff])/g,`Delivery Method`],[/(?<![\u10a0-\u10ff])ჩაბარების მეთოდი(?![\u10a0-\u10ff])/g,`Delivery Method`],[/(?<![\u10a0-\u10ff])გატანის მეთოდი(?![\u10a0-\u10ff])/g,`Pickup Method`],[/(?<![\u10a0-\u10ff])ფილიალიდან გატანა(?![\u10a0-\u10ff])/g,`Pickup from branch`],[/(?<![\u10a0-\u10ff])ფილიალში გატანა(?![\u10a0-\u10ff])/g,`Pickup at branch`],[/(?<![\u10a0-\u10ff])სერვისცენტრიდან გატანა(?![\u10a0-\u10ff])/g,`Pickup from service center`],[/(?<![\u10a0-\u10ff])ბოქსიდან გატანა(?![\u10a0-\u10ff])/g,`Takeout from box`],[/(?<![\u10a0-\u10ff])დახლიდან გატანა(?![\u10a0-\u10ff])/g,`Takeout from counter`],[/(?<![\u10a0-\u10ff])ბარკოდით გატანა(?![\u10a0-\u10ff])/g,`Takeout using barcode`],[/(?<![\u10a0-\u10ff])მისამართზე მიწოდება(?![\u10a0-\u10ff])/g,`Delivery to address`],[/(?<![\u10a0-\u10ff])კურიერით მიწოდება(?![\u10a0-\u10ff])/g,`Courier delivery`],[/(?<![\u10a0-\u10ff])იანვარი(?![\u10a0-\u10ff])/g,`January`],[/(?<![\u10a0-\u10ff])თებერვალი(?![\u10a0-\u10ff])/g,`February`],[/(?<![\u10a0-\u10ff])მარტი(?![\u10a0-\u10ff])/g,`March`],[/(?<![\u10a0-\u10ff])აპრილი(?![\u10a0-\u10ff])/g,`April`],[/(?<![\u10a0-\u10ff])მაისი(?![\u10a0-\u10ff])/g,`May`],[/(?<![\u10a0-\u10ff])ივნისი(?![\u10a0-\u10ff])/g,`June`],[/(?<![\u10a0-\u10ff])ივლისი(?![\u10a0-\u10ff])/g,`July`],[/(?<![\u10a0-\u10ff])აგვისტო(?![\u10a0-\u10ff])/g,`August`],[/(?<![\u10a0-\u10ff])სექტემბერი(?![\u10a0-\u10ff])/g,`September`],[/(?<![\u10a0-\u10ff])ოქტომბერი(?![\u10a0-\u10ff])/g,`October`],[/(?<![\u10a0-\u10ff])ნოემბერი(?![\u10a0-\u10ff])/g,`November`],[/(?<![\u10a0-\u10ff])დეკემბერი(?![\u10a0-\u10ff])/g,`December`]],Kt=/[\u10a0-\u10ff]/,qt=`inexEnglishLanguagePatched`,Jt=[`alt`,`aria-label`,`title`,`placeholder`],Yt=[...Jt,`href`],Xt,Zt=new Set;function Qt(e){return e.replace(/\s+/g,` `).trim()}function $t(e){let t=e;for(let[e,n]of Gt)t=t.replace(e,n);return t}function en(e){let t=new URL(e,location.href);return t.hostname!==location.hostname||!/^\/ka(?:\/|$)/.test(t.pathname)?null:(t.pathname=t.pathname.replace(/^\/ka(?=\/|$)/,`/en`),t.href)}function T(){let e=en(location.href);e&&location.replace(e)}function tn(){return/^\/en(?:\/|$)/.test(location.pathname)}function nn(){if(tn())for(let e of document.querySelectorAll(`input[name="segment-control"]`)){let t=e.closest(`[class*="rounded-full"][class*="bg-additional-components-primary"]`),n=[...t?.querySelectorAll(`input[name="segment-control"]`)||[]].map(e=>e.value);n.includes(`ka`)&&n.includes(`en`)&&n.includes(`ru`)&&(t.style.display=`none`)}}function rn(e){let t=Qt(e.nodeValue||``),n=Wt.get(t)??$t(t);n!==t&&(e.nodeValue=e.nodeValue.replace(e.nodeValue.trim(),n))}function an(e){for(let t of Jt){let n=e.getAttribute(t);if(!n||!Kt.test(n))continue;let r=Wt.get(Qt(n));r&&e.setAttribute(t,r)}if(e instanceof HTMLAnchorElement){let t=en(e.href);t&&(e.href=t)}}function on(e){if(e.nodeType===Node.TEXT_NODE){rn(e);return}if(!(e instanceof Element)||e.matches(`script, style, textarea`))return;an(e);for(let t of e.querySelectorAll(`a[href], [alt], [aria-label], [title], [placeholder]`))an(t);let t=document.createTreeWalker(e,NodeFilter.SHOW_TEXT,{acceptNode(e){return e.parentElement?.closest(`script, style, textarea`)||!Kt.test(e.nodeValue||``)?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT}});for(;t.nextNode();)rn(t.currentNode)}function sn(){Xt=void 0;for(let e of Zt)on(e);Zt.clear(),nn()}function E(e){Zt.add(e),!Xt&&(Xt=setTimeout(sn,50))}function cn(){new MutationObserver(e=>{for(let t of e){for(let e of t.addedNodes)E(e);t.type===`characterData`&&E(t.target),t.type===`attributes`&&E(t.target)}}).observe(document.documentElement,{childList:!0,subtree:!0,characterData:!0,attributes:!0,attributeFilter:Yt})}function ln(){document.addEventListener(`click`,e=>{if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;let t=e.target instanceof Element&&e.target.closest(`a[href]`);if(!(t instanceof HTMLAnchorElement)||t.target&&t.target!==`_self`)return;let n=en(t.href);n&&(e.preventDefault(),location.href=n)},!0)}function un(){if(!history[qt]){history[qt]=!0;for(let e of[`pushState`,`replaceState`]){let t=history[e];history[e]=function(...e){let n=t.apply(this,e);return T(),n}}addEventListener(`popstate`,T)}}function dn(){for(let e of[500,1500,3e3,6e3])setTimeout(()=>E(document.documentElement),e)}function fn(){T(),document.readyState===`loading`?document.addEventListener(`DOMContentLoaded`,()=>{on(document.documentElement),nn()},{once:!0}):(on(document.documentElement),nn()),cn(),ln(),un(),dn()}var pn=`html.inex-enhanced-parcels .inex-enhanced-parcels__panel,
html.inex-enhanced-parcels .inex-enhanced-parcels__page {
  gap: 8px !important;
}

html.inex-enhanced-parcels
  :is(.inex-enhanced-parcels__page-title, .inex-enhanced-parcels__tabs-wrap) {
  display: none !important;
}

html.inex-enhanced-parcels .inex-enhanced-parcels__page {
  padding-right: 0 !important;
  padding-left: 0 !important;
}

html.inex-enhanced-parcels .inex-enhanced-parcels__tabs-wrap {
  top: 0 !important;
  margin-bottom: 0 !important;
  background: var(--inex-transparent, transparent) !important;
}

html.inex-enhanced-parcels .inex-enhanced-parcels__tabs {
  gap: 6px !important;
  padding: 0 0 4px !important;
  background: var(--inex-transparent, transparent) !important;
}

html.inex-enhanced-parcels .inex-enhanced-parcels__tab {
  min-height: 28px !important;
  padding: 5px 9px !important;
  border-radius: 9px !important;
  gap: 5px !important;
}

html.inex-enhanced-parcels .inex-enhanced-parcels__scroll {
  max-height: calc(100vh - 108px) !important;
  border-radius: 12px !important;
  scrollbar-width: none;
}

html.inex-enhanced-parcels .inex-enhanced-parcels__scroll::-webkit-scrollbar {
  width: 0;
  height: 0;
}

html.inex-enhanced-parcels .inex-enhanced-parcels__panel {
  display: flex !important;
  flex-direction: column !important;
  gap: 5px !important;
  padding: 8px !important;
  border-radius: 12px !important;
}

html.inex-enhanced-parcels
  :is(
    .inex-enhanced-parcels__contents,
    .inex-enhanced-parcels__flight,
    .inex-enhanced-parcels__location,
    .inex-enhanced-parcels__rows
  ) {
  display: contents !important;
}

html.inex-enhanced-parcels
  :is(.inex-enhanced-parcels__flight-header, .inex-enhanced-parcels__location-header) {
  display: none !important;
}

html.inex-enhanced-parcels .inex-enhanced-parcels__panel-header {
  min-height: 0 !important;
}

html.inex-enhanced-parcels .inex-enhanced-parcels__section {
  display: flex !important;
  align-items: center !important;
  gap: 10px !important;
  min-height: 24px !important;
  margin: 9px 4px 2px !important;
  padding: 4px 6px !important;
  border-radius: 7px !important;
  color: var(--inex-muted, currentcolor) !important;
  cursor: pointer;
  font-size: 11px !important;
  font-weight: 500 !important;
  line-height: 1 !important;
  letter-spacing: 0.08em !important;
  text-transform: uppercase !important;
  user-select: none;
}

html.inex-enhanced-parcels .inex-enhanced-parcels__section:hover {
  background: var(--inex-op-primary-light, transparent) !important;
}

html.inex-enhanced-parcels .inex-enhanced-parcels__section::before {
  content: '-';
  display: inline-grid;
  place-items: center;
  width: 14px;
  height: 14px;
  border: 1px solid currentcolor;
  border-radius: 999px;
  font-size: 12px;
  line-height: 1;
  opacity: 0.8;
}

html.inex-enhanced-parcels .inex-enhanced-parcels__section[aria-expanded='false']::before {
  content: '+';
}

html.inex-enhanced-parcels .inex-enhanced-parcels__section::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--inex-border, currentcolor);
  opacity: 0.75;
}

html.inex-enhanced-parcels .inex-enhanced-parcels__account-shell {
  background: var(--inex-transparent, transparent) !important;
  box-shadow: none !important;
}

html.inex-enhanced-parcels .inex-enhanced-parcels__account-wrap {
  background: var(--inex-transparent, transparent) !important;
  color: var(--inex-muted, currentcolor) !important;
}

html.inex-enhanced-parcels .inex-enhanced-parcels__account-id {
  color: var(--inex-muted, currentcolor) !important;
  font-size: 12px !important;
  font-weight: 400 !important;
}

html.inex-enhanced-parcels .inex-enhanced-parcels__panel :is(h1, h2, h3, h4) {
  font-size: 18px !important;
  line-height: 1.2 !important;
}

html.inex-enhanced-parcels .inex-enhanced-parcels__flight {
  padding: 4px !important;
  border-radius: 12px !important;
}

html.inex-enhanced-parcels .inex-enhanced-parcels__flight-header {
  gap: 2px !important;
  padding: 0 4px !important;
}

html.inex-enhanced-parcels .inex-enhanced-parcels__location {
  gap: 4px !important;
  margin-top: 4px !important;
  padding-right: 0 !important;
  padding-left: 0 !important;
}

html.inex-enhanced-parcels .inex-enhanced-parcels__location-header {
  gap: 0 !important;
  min-height: 0 !important;
}

html.inex-enhanced-parcels .inex-enhanced-parcels__pickup {
  opacity: 0.72;
  font-size: 11px !important;
}

html.inex-enhanced-parcels .inex-enhanced-parcels__rows {
  gap: 3px !important;
}

html.inex-enhanced-parcels .inex-enhanced-parcels__row {
  display: grid !important;
  grid-template-columns: minmax(320px, 38%) minmax(460px, 1fr);
  gap: 5px 14px !important;
  align-items: center !important;
  min-height: 48px !important;
  padding: 8px 10px !important;
  border: 1px solid var(--inex-border-soft, currentcolor) !important;
  border-radius: 12px !important;
  background: linear-gradient(135deg, rgb(255 255 255 / 2%), rgb(255 255 255 / 0%)) !important;
  box-shadow: 0 8px 24px rgb(0 0 0 / 12%) !important;
  font-weight: 400 !important;
}

html.inex-enhanced-parcels .inex-enhanced-parcels__row * {
  font-weight: 400 !important;
}

html.inex-enhanced-parcels .inex-enhanced-parcels__row--pending {
  opacity: 0.78;
}

html.inex-enhanced-parcels .inex-enhanced-parcels__row--section-collapsed {
  display: none !important;
}

html.inex-enhanced-parcels .inex-enhanced-parcels__row-info {
  grid-column: 1;
  grid-row: 1;
  min-width: 0;
}

html.inex-enhanced-parcels .inex-enhanced-parcels__row-content {
  gap: 0 !important;
  padding-top: 0 !important;
}

html.inex-enhanced-parcels .inex-enhanced-parcels__row-body {
  gap: 1px !important;
}

html.inex-enhanced-parcels .inex-enhanced-parcels__tracking-line {
  display: flex !important;
  align-items: center !important;
  gap: 6px !important;
  min-width: 0;
}

html.inex-enhanced-parcels .inex-enhanced-parcels__origin {
  position: relative;
  flex-shrink: 0;
  min-width: 34px;
  padding: 2px 5px;
  border: 1px solid var(--inex-border-soft, currentcolor);
  border-radius: 999px;
  color: var(--inex-muted, currentcolor) !important;
  font-size: 11px !important;
  line-height: 1 !important;
  text-align: center;
  text-transform: uppercase;
  opacity: 0.78;
}

html.inex-enhanced-parcels .inex-enhanced-parcels__origin::after {
  content: attr(data-tooltip);
  position: absolute;
  top: calc(100% + 7px);
  left: 0;
  z-index: 2;
  max-width: 220px;
  padding: 6px 8px;
  border: 1px solid var(--inex-border-soft, currentcolor);
  border-radius: 8px;
  background: var(--inex-surface-3, #30344d);
  color: var(--inex-text, currentcolor);
  font-size: 11px;
  line-height: 1.2;
  opacity: 0;
  pointer-events: none;
  text-transform: none;
  transition: opacity 120ms ease;
  white-space: nowrap;
}

html.inex-enhanced-parcels .inex-enhanced-parcels__origin:hover::after {
  opacity: 1;
}

html.inex-enhanced-parcels .inex-enhanced-parcels__origin[data-tooltip='']::after {
  display: none;
}

html.inex-enhanced-parcels .inex-enhanced-parcels__origin[data-transport='air'] {
  border-color: var(--inex-blue-soft, currentcolor);
}

html.inex-enhanced-parcels .inex-enhanced-parcels__origin[data-transport='road'] {
  border-color: var(--inex-yellow-soft, currentcolor);
}

html.inex-enhanced-parcels .inex-enhanced-parcels__origin[data-transport='sea'] {
  border-color: var(--inex-cyan, currentcolor);
}

html.inex-enhanced-parcels .inex-enhanced-parcels__tracking {
  min-width: 0;
  color: var(--inex-text, currentcolor) !important;
  font-size: 15px !important;
  font-weight: 400 !important;
  line-height: 1.2 !important;
  letter-spacing: normal !important;
  direction: ltr !important;
  text-align: left !important;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

html.inex-enhanced-parcels .inex-enhanced-parcels__status-cell {
  grid-column: 1;
  display: flex !important;
  align-items: center !important;
  justify-content: flex-start !important;
  gap: 6px !important;
  width: 100%;
  min-width: 0;
  place-self: center start;
}

html.inex-enhanced-parcels .inex-enhanced-parcels__side {
  grid-column: 2;
  display: grid !important;
  grid-template-columns: minmax(240px, 1fr) max-content;
  gap: 8px !important;
  align-items: center !important;
  min-width: 0;
}

html.inex-enhanced-parcels .inex-enhanced-parcels__actions {
  grid-column: 2;
  display: flex !important;
  align-items: center !important;
  justify-content: flex-end !important;
  gap: 6px !important;
  min-width: max-content;
}

html.inex-enhanced-parcels .inex-enhanced-parcels__status {
  flex-shrink: 0;
  width: auto !important;
  height: auto !important;
  min-height: 0 !important;
  max-height: none !important;
  padding: 3px 7px !important;
  border: 1px solid var(--inex-border-soft, currentcolor) !important;
  border-radius: 7px !important;
  background: var(--inex-op-primary-light, transparent) !important;
  font-size: 10px !important;
  line-height: 1 !important;
  letter-spacing: 0.03em !important;
  text-transform: none !important;
  white-space: nowrap !important;
}

html.inex-enhanced-parcels .inex-enhanced-parcels__process {
  position: relative;
  min-width: 0;
  color: var(--inex-muted, currentcolor) !important;
  font-size: 12px !important;
  line-height: 1 !important;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

html.inex-enhanced-parcels .inex-enhanced-parcels__process::before {
  content: '•';
  margin-right: 6px;
  opacity: 0.55;
}

html.inex-enhanced-parcels .inex-enhanced-parcels__meta {
  gap: 2px 8px !important;
  margin-top: 1px !important;
}

html.inex-enhanced-parcels .inex-enhanced-parcels__meta * {
  font-size: 12px !important;
  line-height: 1.25 !important;
}

html.inex-enhanced-parcels .inex-enhanced-parcels__declaration {
  display: inline-flex !important;
  align-items: center !important;
  height: auto !important;
  min-height: 24px !important;
  padding: 0 !important;
  border-radius: 0 !important;
  background: var(--inex-transparent, transparent) !important;
  white-space: nowrap;
}

html.inex-enhanced-parcels .inex-enhanced-parcels__declaration > button {
  min-height: 26px !important;
  max-height: 26px !important;
  padding: 4px 9px !important;
  border-radius: 7px !important;
  background: var(--inex-op-primary-light, transparent) !important;
  color: var(--inex-muted, currentcolor) !important;
}

html.inex-enhanced-parcels
  .inex-enhanced-parcels__row:has(form)
  .inex-enhanced-parcels__declaration {
  display: none !important;
}

html.inex-enhanced-parcels .inex-enhanced-parcels__declaration * {
  font-size: 12px !important;
  line-height: 1 !important;
}

html.inex-enhanced-parcels .inex-enhanced-parcels__price {
  justify-content: flex-end !important;
  gap: 6px !important;
}

html.inex-enhanced-parcels :is(.inex-enhanced-parcels__weight, .inex-enhanced-parcels__amount) {
  padding: 3px 6px !important;
  border-radius: 7px !important;
}

html.inex-enhanced-parcels
  :is(.inex-enhanced-parcels__weight, .inex-enhanced-parcels__amount)
  span {
  font-size: 12px !important;
  line-height: 1 !important;
}

html.inex-enhanced-parcels .inex-enhanced-parcels__pay {
  min-height: 26px !important;
  max-height: 26px !important;
  padding: 4px 9px !important;
  border-radius: 7px !important;
  font-size: 13px !important;
}

html.inex-enhanced-parcels .inex-enhanced-parcels__paid {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 4px !important;
  min-width: 42px !important;
  min-height: 26px !important;
  max-height: 26px !important;
  padding: 4px 9px !important;
  border-radius: 7px !important;
  background: var(--inex-op-primary-light, transparent) !important;
  color: var(--inex-muted, currentcolor) !important;
  white-space: nowrap !important;
}

html.inex-enhanced-parcels .inex-enhanced-parcels__paid svg {
  width: 12px !important;
  height: 12px !important;
  flex-shrink: 0;
}

html.inex-enhanced-parcels :is(.inex-enhanced-parcels__pay, .inex-enhanced-parcels__paid) span,
html.inex-enhanced-parcels .inex-enhanced-parcels__paid {
  font-size: 13px !important;
  line-height: 1 !important;
}

@media (width >= 768px) {
  html.inex-enhanced-parcels .inex-enhanced-parcels__header {
    height: 48px !important;
    padding: 0 14px !important;
  }

  html.inex-enhanced-parcels .inex-enhanced-parcels__header svg[width='178'] {
    width: 112px !important;
    height: auto !important;
  }

  html.inex-enhanced-parcels .inex-enhanced-parcels__header [class*='h-10'][class*='w-10'] {
    width: 32px !important;
    height: 32px !important;
  }

  html.inex-enhanced-parcels .inex-enhanced-parcels__sidebar {
    top: 48px !important;
    width: 220px !important;
    height: calc(100vh - 48px) !important;
  }

  html.inex-enhanced-parcels .inex-enhanced-parcels__content {
    margin-top: 48px !important;
    margin-left: 220px !important;
    padding-top: 8px !important;
    padding-right: 16px !important;
    padding-left: 16px !important;
  }

  html.inex-enhanced-parcels .inex-enhanced-parcels__sidebar-link {
    padding: 6px 14px !important;
    gap: 8px !important;
  }

  html.inex-enhanced-parcels .inex-enhanced-parcels__sidebar-child-link {
    padding-top: 5px !important;
    padding-bottom: 5px !important;
    padding-left: 42px !important;
  }

  html.inex-enhanced-parcels .inex-enhanced-parcels__scroll {
    max-height: calc(100vh - 112px) !important;
  }
}

@media (width < 768px) {
  html.inex-enhanced-parcels .inex-enhanced-parcels__mobile-header {
    height: 44px !important;
    padding: 5px 8px !important;
  }

  html.inex-enhanced-parcels .inex-enhanced-parcels__mobile-header [class*='h-10'][class*='w-10'] {
    width: 32px !important;
    height: 32px !important;
  }

  html.inex-enhanced-parcels .inex-enhanced-parcels__row {
    grid-template-columns: 1fr;
  }

  html.inex-enhanced-parcels .inex-enhanced-parcels__side {
    grid-column: 1;
    grid-template-columns: 1fr;
  }

  html.inex-enhanced-parcels
    :is(
      .inex-enhanced-parcels__status-cell,
      .inex-enhanced-parcels__actions,
      .inex-enhanced-parcels__price,
      .inex-enhanced-parcels__declaration
    ) {
    grid-column: 1;
    grid-row: auto;
    justify-self: start;
  }
}

html.inex-enhanced-parcels .inex-enhanced-hidden.inex-enhanced-hidden {
  display: none !important;
}
`,mn=`inex_enhanced_parcels_enabled`,hn=`parcels_filter_open`,gn=`inex-enhanced-parcels`,D=`inex-enhanced-hidden`,_n=`inex-enhanced-parcels__contents`,O=`inex-enhanced-parcels__section`,vn=`inex-enhanced-parcels__row--section-collapsed`,yn=`inex-enhanced-parcels__side`,bn=`inex-enhanced-parcels__actions`,xn=`data-inex-tracking-code`,k=`data-inex-description`,Sn=`data-inex-origin`,Cn=`data-inex-user-detail-hidden`,wn=/^(?:Takeout|Taken\s*Out|გატანილი|Забрано|Выдано)$/i,Tn=/^(?:Arrived|ჩამოსულ(?:ია|ი)?|Прибыл|Прибыло)$/i,En=/batumi|ბათუმ|батуми/i,Dn=/^(?:User|Customer|Receiver Client|Subuser|Trustee|მომხმარებელი|მიმღები მომხმარებელი|ქვემომხმარებელი|მინდობილი პირი)(?:\s*[/|]\s*(?:User|Customer|Receiver Client|Subuser|Trustee|მომხმარებელი|მიმღები მომხმარებელი|ქვემომხმარებელი|მინდობილი პირი))*:?$/i,On=/^(?:System|System user|Current user|სისტემა|სისტემური მომხმარებელი|მიმდინარე მომხმარებელი)$/i,A=`div[class*="cursor-pointer"][class*="bg-additional-background-2"][class*="p-4"][class*="lg:flex-row"]`,kn=`div[class*="mt-2"][class*="px-2.5"]`,An=[`class`,`style`,`disabled`,`aria-disabled`,`data-state`,`hidden`],j=/add declaration|update declaration|upload invoice|ai declaration|by hand|დეკლარ|ინვოის|деклар|инвойс/i,jn=/declaration|declare\b|დეკლარ|деклар/i,Mn=/^(?:Not Declared|არ არის დეკლარირებული|Не декларировано)$/i,Nn=/details|processes|parcel content|additional information|დეტალ|პროცეს|ამანათ|детал|процесс|посыл/i;function Pn(e){if(document.body){e();return}document.addEventListener(`DOMContentLoaded`,e,{once:!0})}function Fn(e){return!!e.closest(`button, a, input, textarea, select, label, [role="button"], [role="link"], [contenteditable="true"]`)}function M(e){return e.replace(/\s+/g,` `).trim()}function N(e,t,n=document){return P(n,t,e)[0]||null}function P(e,t,n=`*`){return e?[...e.querySelectorAll(n)].filter(e=>{let n=e.getAttribute(`class`)||``;return t.every(e=>n.includes(e))}):[]}function F(e,t){return e?[...e.querySelectorAll(`*`)].filter(e=>t.test(e.textContent||``)):[]}function I(e,t){return e?.classList.add(`inex-enhanced-parcels__${t}`),e}function L(e,t){e.textContent!==t&&(e.textContent=t)}function In(e){return[...e?.children||[]].every(e=>e.classList.contains(D))}var R=new Set,z=new WeakMap,Ln=!1,Rn=!1,zn=!1,B=!1,V=!1,Bn=!1;function Vn({isParcelsPath:e,getRowDeclarationButton:t}){Rn||(Rn=!0,document.addEventListener(`click`,n=>{if(!e()||H())return;let r=n.target instanceof Element?n.target:null;if(!r||Fn(r))return;let i=r.closest(A),a=i&&t(i);a&&(n.preventDefault(),n.stopImmediatePropagation(),a.click())},!0))}function Hn(e){document.addEventListener(`keydown`,t=>{t.key!==`Escape`||!e()||!H()&&!qn()||(t.preventDefault(),t.stopImmediatePropagation(),location.reload())},!0)}function Un(){if(zn)return;zn=!0;let e=XMLHttpRequest.prototype.open,t=XMLHttpRequest.prototype.send;XMLHttpRequest.prototype.open=function(t,n,...r){return this.inexDeclarationSubmitUrl=er(n),e.call(this,t,n,...r)},XMLHttpRequest.prototype.send=function(...e){return Qn(this.inexDeclarationSubmitUrl)&&this.addEventListener(`loadend`,()=>{this.status>=200&&this.status<300&&$n()}),t.apply(this,e)}}function Wn({getRowDeclarationButton:e,refreshParcelDataSoon:t}){Ln||(Ln=!0,document.addEventListener(`click`,t=>{let n=(t.target instanceof Element?t.target:null)?.closest(`button, a, [role="button"], [class*="cursor-pointer"]`);if(n?.closest(`form`))return;let r=M(n?.textContent||``);if(jn.test(r)){if(!Bn){t.preventDefault(),t.stopImmediatePropagation(),Xn(n,e);return}B=!0}},!0),document.addEventListener(`submit`,e=>{e.target instanceof Element&&j.test(e.target.textContent||``)&&(Jn(),B=!1,V=!1,t())},!0))}function Gn(){return H()?(V=!0,!0):!1}function Kn(){return B&&V?(B=!1,V=!1,!1):B}function H(){let e=document.getElementById(`modal-root`)?.textContent||``;return j.test(e)?!0:[...document.querySelectorAll(`form`)].some(e=>j.test(e.textContent||``))}function qn(){return[...document.querySelectorAll(`div[class*="fixed"][class*="inset-0"]`)].some(e=>e instanceof HTMLElement&&e.getBoundingClientRect().height>0&&Nn.test(e.textContent||``))}function U(e,t){!e||!t||e.parentElement===t||(Zn(e),t.append(e))}function Jn(e=document){for(let t of[...R]){if(e!==document&&!e?.contains(t))continue;let n=z.get(t);if(R.delete(t),z.delete(t),!n?.parent?.isConnected||!t.isConnected)continue;let r=n.nextSibling?.parentNode===n.parent?n.nextSibling:null;(t.parentNode!==n.parent||t.nextSibling!==r)&&n.parent.insertBefore(t,r)}for(let t of e.querySelectorAll(`.${yn}, .${O}, .inex-enhanced-parcels__status-cell, .${bn}`))t.remove()}function Yn(){for(let e of[...R]){let t=z.get(e);e.isConnected&&t?.parent?.isConnected||(R.delete(e),z.delete(e))}}function Xn(e,t){let n=e?.closest(A);if(!n)return;Jn(n);let r=t(n);if(r){B=!0,Bn=!0;try{r.click()}finally{Bn=!1}}}function Zn(e){!e||z.has(e)||(z.set(e,{parent:e.parentNode,nextSibling:e.nextSibling}),R.add(e))}function Qn(e){return/\/front\/cabinet\/parcels\/\d+\/declare$/.test(e)}function $n(){setTimeout(()=>location.reload(),100)}function er(e){try{let t=new URL(e,location.href);return`${t.pathname}${t.search}`}catch{return e}}function tr(...e){let t={};for(let n of e)t.countryCode||=n?.countryCode||``,t.countryName||=n?.countryName||``,t.transportName||=n?.transportName||``,t.transportType||=n?.transportType||``;return t}function nr(...e){let t={};for(let n of e)t.countryCode||=n?.countryCode||``,t.countryName||=n?.countryName||``;return t}function rr(e){return!!(e?.countryCode||e?.countryName||e?.transportName||e?.transportType)}function ir(e){let t=lr(e),n=cr(ar(e));return t||n?[t,n].filter(Boolean).join(` `):{air:`Air`,road:`Road`,sea:`Sea`}[ar(e)]||e.transportName||``}function ar(e){let t=or(e?.transportType);if(t)return t;let n=e?.transportName||``;return/air|flight|plane/i.test(n)?`air`:/road|ground|land|truck|car/i.test(n)?`road`:/sea|ocean|ship/i.test(n)?`sea`:``}function or(e){return{1:`air`,4:`road`,air:`air`,road:`road`,sea:`sea`}[String(e||``).trim().toLowerCase()]||``}function sr(e){return[e.countryName,e.transportName].filter(Boolean).join(` · `)}function cr(e){return{air:`✈️`,road:`🚚`,sea:`🚢`}[e]||``}function lr(e){let t=ur(e?.countryCode||dr(e?.countryName));return/^[A-Z]{2}$/.test(t)?[...t].map(e=>String.fromCodePoint(127462+e.charCodeAt(0)-65)).join(``):``}function ur(e){if(!e)return``;let t=e.trim().toUpperCase();return t===`UK`?`GB`:t}function dr(e){return{USA:`US`,"United States":`US`,"United Kingdom":`GB`,China:`CN`,Turkey:`TR`,Germany:`DE`,Greece:`GR`,Italy:`IT`,Spain:`ES`,Poland:`PL`,Cyprus:`CY`,Georgia:`GE`}[e]||``}var fr=`https://inex.ge/api/v1`,pr=`inex_enhanced_parcels_data_v9`,mr=6,hr=new Set([`DistributionInPickupLocation`]);async function gr(e,t){let n=localStorage.getItem(`accessToken`)||sessionStorage.getItem(`session_accessToken`);if(!n)return null;let r={Authorization:`${localStorage.getItem(`tokenType`)||sessionStorage.getItem(`session_tokenType`)||`Bearer`} ${n}`,"Accept-Language":`en`},i=Cr(await xr(`${fr}/front/cabinet/parcels?perPage=100`,{headers:r}));return await Sr(i.filter(e=>e.status!==Number(t)),mr,async t=>{let n=e.get(t.tracking);try{let e=await Ar(t.id,r);t.latestEvent=e.latestEvent,t.eventCount=e.eventCount}catch{t.latestEvent=n?.latestEvent||null,t.eventCount=n?.eventCount||0}}),new Map(i.map(e=>{let t={...e,arrived:Mr(e),previewStatusText:Nr(e.latestEvent),processText:jr(e)};return[e.tracking,t]}))}function _r(){try{let e=JSON.parse(localStorage.getItem(pr));return!e?.fetchedAt||!Array.isArray(e.parcels)?null:{fetchedAt:e.fetchedAt,info:new Map(e.parcels.map(e=>[e.tracking,e]))}}catch{return null}}function vr(e){try{localStorage.setItem(pr,JSON.stringify({fetchedAt:Date.now(),parcels:[...e.values()]}))}catch{return}}function yr(){localStorage.removeItem(pr)}function br(e){if(!e)return null;let t=/^\d{4}-\d{2}-\d{2} /.test(e)?e.replace(` `,`T`):e,n=new Date(t);return Number.isNaN(n.getTime())?null:n}async function xr(e,t){let n=await fetch(e,t);if(!n.ok)throw Error(`Request failed: ${n.status}`);return n.json()}async function Sr(e,t,n){let r=0;await Promise.all(Array.from({length:Math.min(t,e.length)},async()=>{for(;r<e.length;)await n(e[r++])}))}function Cr(e){let t=[];for(let n of e?.data||[]){let e=n.attributes?.expectedArrivedDate,r=Tr(n);for(let i of[`deliveryLocations`,`locations`])for(let a of n.relationships?.[i]?.data||[]){let n=Tr(a);for(let i of a.relationships?.customers?.data||[])for(let a of i.relationships?.parcels?.data||[]){let i=Tr(a);t.push({id:a.id,status:Number(a.attributes?.status),tracking:a.relationships?.parcelTrackings?.data?.[0]?.attributes?.tracking,description:wr(a.attributes),expectedArrival:e,origin:tr(i,n,r)})}}}return t.filter(e=>e.tracking)}function wr(e){for(let t of[`description`,`comment`,`title`,`name`,`itemDescription`,`productName`]){let n=e?.[t];if(typeof n==`string`&&n.trim())return n.trim()}return``}function Tr(e){return tr(Er(e?.attributes),kr(e?.attributes))}function Er(e){let t=Dr(e?.name);return t?{countryCode:t,countryName:Or(t)}:{}}function Dr(e){return{CH:`CN`,CN:`CN`,GR:`GR`,TK:`TR`,TR:`TR`,US:`US`}[String(e||``).match(/^([A-Z]{2})(?:-|$)/)?.[1]]||``}function Or(e){return{CN:`China`,GR:`Greece`,TR:`Turkey`,US:`USA`}[e]||``}function kr(e){let t=or(e?.shipmentType);return t?{transportType:t,transportName:{air:`Air`,road:`Road`,sea:`Sea`}[t]}:{}}async function Ar(e,t){let n=await xr(`${fr}/front/cabinet/parcels/${e}/events`,{headers:t}),r=n?.data?.[0];return r?{latestEvent:{name:r.relationships?.logisticEvent?.data?.attributes?.name,type:r.relationships?.logisticEvent?.data?.attributes?.type,date:r.attributes?.eventHappenedAt},eventCount:n.data.length}:{latestEvent:null,eventCount:0}}function jr(e){let t=[],n=Fr(e.latestEvent?.date),r=Pr(e.expectedArrival);return n&&t.push(n),r&&t.push(`ETA ${r}`),t.join(` · `)}function Mr(e){return e.eventCount?hr.has(e.latestEvent?.type||e.latestEvent?.name):!1}function Nr(e){return{Received:`Warehouse`,Departure:`In transit`,Sent:`Sent`,Landed:`Landed`,DestinationTerminalProcessStarted:`Terminal`,DestinationTerminalProcessFinished:`Terminal done`,DestinationClearanceStarted:`Customs`,DestinationClearanceFinished:`Customs done`,DistributionInHub:`Hub`,DistributionInPickupLocation:`Pickup soon`}[e?.type||e?.name]||e?.name?.replace(/ Process /g,` `)||``}function Pr(e){let t=br(e);return t?new Intl.DateTimeFormat(`en`,{day:`numeric`,month:`short`}).format(t):``}function Fr(e){let t=br(e);return t?`${Ir(t)}, ${new Intl.DateTimeFormat(`en`,{hour:`2-digit`,hour12:!1,minute:`2-digit`}).format(t)}`:``}function Ir(e){let t=new Date;t.setHours(0,0,0,0);let n=new Date(e);n.setHours(0,0,0,0);let r=Math.round((t.getTime()-n.getTime())/864e5);return r===0?`Today`:r===1?`1 day ago`:r>1&&r<7?`${r} days ago`:new Intl.DateTimeFormat(`en`,{day:`numeric`,month:`short`}).format(e)}var W=new Set,Lr=0,Rr=new WeakMap;function zr(e,{getRowSortInfo:t,getEtaTime:n,scheduleEnhance:r}){let i=e[0]?.closest(`.inex-enhanced-parcels__panel`)||document.querySelector(`.inex-enhanced-parcels__panel`);if(!i)return;for(let t of e)i.contains(t)&&Vr(t,i);let a=c([...e].sort(l));Wr(i,a.map(e=>e.type));let o=10,s=i.querySelector(`:scope > .inex-enhanced-parcels__panel-header`);for(let e of a){let t=W.has(e.type),n=Ur(i,e.type,e.label,e.rows.length,t,r);Br(i,n,s),s=n,n.style.order=String(o++);for(let n of e.rows)n.style.order=String(o++),n.classList.toggle(vn,t),Hr(n,o++,t)}function c(e){let n=[{type:`arrived`,label:`Arrived`,rows:[]},{type:`active`,label:`In progress`,rows:[]}];for(let r of e)t(r).arrived?n[0].rows.push(r):n[1].rows.push(r);return n.filter(e=>e.rows.length)}function l(e,r){let i=t(e),a=t(r);return Kr(i)-Kr(a)||(i.arrived&&a.arrived?G(e)-G(r):a.eventCount-i.eventCount||n(i.info)-n(a.info)||G(e)-G(r))}}function Br(e,t,n){let r=n?.nextSibling||e.firstChild;r!==t&&e.insertBefore(t,r)}function Vr(e,t){let n=e.parentElement;for(;n&&n!==t;)n.classList.add(_n),n=n.parentElement}function Hr(e,t,n){let r=e.nextElementSibling;for(;r&&!r.matches?.(`div[class*="cursor-pointer"][class*="bg-additional-background-2"][class*="p-4"][class*="lg:flex-row"]`);)r.classList.contains(`inex-enhanced-parcels__section`)||(r.style.order=String(t),r.classList.toggle(vn,n)),r=r.nextElementSibling}function Ur(e,t,n,r,i,a){let o=e.querySelector(`:scope > .${O}[data-section="${t}"]`);return o||(o=document.createElement(`div`),o.className=O,o.dataset.section=t,o.tabIndex=0,o.setAttribute(`role`,`button`),o.addEventListener(`click`,()=>Gr(t,a)),o.addEventListener(`keydown`,e=>{[` `,`Enter`].includes(e.key)&&(e.preventDefault(),Gr(t,a))}),e.append(o)),L(o,`${n} · ${r}`),o.setAttribute(`aria-expanded`,String(!i)),o}function Wr(e,t){for(let n of document.querySelectorAll(`.${O}`))(n.parentElement!==e||!t.includes(n.dataset.section))&&n.remove()}function Gr(e,t){W.has(e)?W.delete(e):W.add(e),t()}function Kr(e){return e.arrived?0:e.eventCount>0?1:2}function G(e){return Rr.has(e)||Rr.set(e,Lr++),Rr.get(e)}var qr,Jr,Yr,K,q=0,J=new Map;function Xr(){pe(pn),$r(),ti(),Wn({getRowDeclarationButton:Y,refreshParcelDataSoon:li}),Vn({isParcelsPath:X,getRowDeclarationButton:Y}),Hn(X),Un(),Z(),Pn(()=>{ni(),Z()}),window.addEventListener(`popstate`,Z)}function Y(e){return[...e.querySelectorAll(`button, [role="button"]`)].find(e=>jn.test(M(e.textContent||``)))}function X(){return/^\/(?:en|ka|ru)\/profile\/parcels\/?$/.test(window.location.pathname)}function Zr(){return me(mn,!0)}function Qr(e){if(ge(mn,e),$r(),!e&&X()){location.reload();return}Z()}function Z(){let e=X()&&Zr();document.documentElement.classList.toggle(gn,e),document.body?.classList.toggle(gn,e),e&&(localStorage.setItem(hn,`false`),ei(),Q())}function $r(){qr&&_e(qr);let e=Zr();qr=he(`Enhanced parcels: ${e?`on`:`off`}`,()=>Qr(!e))}function ei(){let e=new URL(window.location.href);e.searchParams.get(`status`)===`5`&&(e.searchParams.delete(`status`),window.history.replaceState(window.history.state,``,`${e.pathname}${e.search}${e.hash}`))}function ti(){for(let e of[`pushState`,`replaceState`]){let t=window.history[e];t.inexEnhancedParcelsPatched||(window.history[e]=function(...e){let n=t.apply(this,e);return window.dispatchEvent(new Event(`inex-location-change`)),n},window.history[e].inexEnhancedParcelsPatched=!0)}window.addEventListener(`inex-location-change`,Z)}function ni(){Jr||!document.body||(Jr=new MutationObserver(e=>{e.every(ri)||H()&&e.every(ii)||Q()}),Jr.observe(document.body,{childList:!0,characterData:!0,subtree:!0,attributes:!0,attributeOldValue:!0,attributeFilter:An}))}function ri(e){return e.type!==`attributes`||!(e.target instanceof Element)?!1:e.attributeName===`class`?ai(e.oldValue,e.target.getAttribute(`class`)):e.attributeName===`style`?si(e.oldValue)===si(e.target.getAttribute(`style`)):!1}function ii(e){return!!(e.target instanceof Element?e.target:e.target.parentElement)?.closest(`form`)&&H()}function ai(e,t){let n=oi(e),r=oi(t);return n.length===r.length?n.every((e,t)=>e===r[t]):!1}function oi(e){return(e||``).split(/\s+/).filter(e=>e&&!e.startsWith(`inex-enhanced-`)).sort()}function si(e){let t=document.createElement(`div`),n=[];t.setAttribute(`style`,e||``);for(let e=0;e<t.style.length;e++){let r=t.style.item(e);r!==`order`&&n.push(`${r}:${t.style.getPropertyValue(r)}:${t.style.getPropertyPriority(r)}`)}return n.sort().join(`;`)}function Q(){!document.documentElement.classList.contains(`inex-enhanced-parcels`)||Yr||(Yr=requestAnimationFrame(()=>{Yr=void 0,ci()}))}function ci(){la(),!Gn()&&(Kn()||(ui(),di(),fi(),pi(),bi()))}function li(){setTimeout(()=>{yr(),J=new Map,q=0,la(),Q()},1500)}function ui(){let e=I(N(`div`,[`fixed`,`top-0`,`h-24`,`z-[10000]`]),`header`),t=I(N(`div`,[`sticky`,`top-0`,`h-16`,`md:hidden`]),`mobile-header`);I(N(`div`,[`fixed`,`top-24`,`w-72`]),`sidebar`),I(N(`div`,[`md:ml-72`,`md:mt-24`]),`content`),gi(e,t),_i(e),_i(t);for(let e of P(document,[`px-6`,`py-2.5`,`gap-x-3`]))I(e,`sidebar-link`);for(let e of P(document,[`pl-14`,`py-2`]))I(e,`sidebar-child-link`)}function di(){I(N(`div`,[`flex-col`,`gap-y-3`,`px-3`]),`page`);for(let e of F(document,/^Online Parcels$/))I(e,`page-title`);I(N(`div`,[`sticky`,`top-0`,`z-10`,`bg-white`]),`tabs-wrap`);let e=I(N(`div`,[`no-scrollbar`,`overflow-x-scroll`]),`tabs`);I(N(`div`,[`subtle-scrollbar`,`overflow-y-auto`]),`scroll`),I(I(N(`div`,[`rounded-lg`,`bg-additional-background-2`,`md:p-6`]),`panel`)?.firstElementChild,`panel-header`),document.querySelector(`[title="Toggle filters"]`)?.classList.add(D),document.querySelector(`form[class*="2xl:flex-row"]`)?.classList.add(D);for(let t of e?.children||[])I(t,`tab`),t.firstElementChild?.classList.add(D),t.classList.toggle(D,wn.test(t.textContent||``))}function fi(){for(let e of P(document,[`relative`,`rounded-[20px]`])){I(e,`flight`),I(e.firstElementChild,`flight-header`);for(let t of P(e,[`justify-between`,`py-2`]))t.classList.add(D);for(let t of P(e,[`-mx-1`,`rounded-full`]))t.classList.add(D);for(let t of P(e,[`border-t-1`]))t.classList.add(D)}for(let e of document.querySelectorAll(kn)){let t=e.firstElementChild,n=t?.children?.[0],r=t?.children?.[1];I(e,`location`),I(t,`location-header`),I(e.querySelector(`[class*="flex"][class*="flex-col"][class*="gap-y-1"]`),`rows`),n?.classList.add(D),I(r,`pickup`),r?.classList.toggle(D,En.test(r.textContent||``)),t?.classList.toggle(D,In(t))}}function pi(){Yn();let e=[...document.querySelectorAll(A)];for(let t of e){if(mi(t),I(t,`row`),t.classList.toggle(D,ra(t)),t.classList.contains(`inex-enhanced-hidden`))continue;let e=[...t.children].filter(e=>!e.classList.contains(`inex-enhanced-parcels__status-cell`)&&!e.classList.contains(`inex-enhanced-parcels__side`)),n=I(e[0],`row-info`),r=Ii(t),i=I(Bi(r)||Bi(t),`price`),a=I(Vi(r)||Vi(t)||e.find(Ui),`paid`),o=zi(r)||zi(t)||(e.length>2?e[1]:null);I(o,`declaration`),Ki(o),a=qi(a),t.classList.toggle(`inex-enhanced-parcels__row--declaration`,!!o),Ri(r,i,o,a),hi(n,t,r),ca(i),Ji(i,a);let s=Ai(t);t.classList.toggle(`inex-enhanced-parcels__row--active`,!s.arrived),t.classList.toggle(`inex-enhanced-parcels__row--arrived`,s.arrived),t.classList.toggle(`inex-enhanced-parcels__row--pending`,!s.arrived&&!s.eventCount)}let t=e.filter(e=>!e.classList.contains(D));Qi(t),zr(t,{getRowSortInfo:Ai,getEtaTime:Ni,scheduleEnhance:Q}),Oi(),ki()}function mi(e){let t=e.querySelector(`.inex-enhanced-parcels__row-info`);!t||t.parentElement===e||(t.classList.remove(`inex-enhanced-parcels__price`,D),e.prepend(t))}function hi(e,t,n){if(!e)return;N(`*`,[`h-10`,`w-10`,`rounded-full`],e)?.classList.add(D),I(e.firstElementChild,`row-content`);let r=I(N(`div`,[`flex-col`,`justify-center`],e),`row-body`),i=I(yi(e),`tracking`),a=I(N(`div`,[`rounded-full`,`tracking-1`],e),`status`),o=I(N(`div`,[`flex-wrap`],e),`meta`),s=Yi(i),c=s&&J.get(s);i?.parentElement&&I(i.parentElement,`tracking-line`);let l=Li(n,a);for(let e of r?.querySelectorAll(`div:empty`)||[])e.classList.add(D);vi(o);for(let e of o?.querySelectorAll(`a[href]`)||[])e.classList.add(D);for(let e of P(o,[`h-1`,`w-1`]))e.classList.add(D);for(let e of a?.querySelectorAll(`svg`)||[])e.classList.add(D);let u=ta(r,i,a);u&&(i?.setAttribute(k,u.text),u.element!==r&&u.element.classList.add(D));let ee=u?.text||c?.description||i?.getAttribute(`data-inex-description`)||``,d=c?c.origin:$(t);Fi(a,c);let f=na(a,c);Xi(i,s,ee),ea(t,d),Zi(i,d),l?.classList.toggle(D,f),a?.classList.toggle(D,f),Pi(l,a,c,f)}function gi(e,t){let n=e?.lastElementChild;n?.firstElementChild?.classList.add(D),n?.firstElementChild?.nextElementSibling?.classList.add(D),(t?.firstElementChild)?.children?.[1]?.classList.add(D)}function _i(e){for(let t of F(e,/^IG\d+$/)){let e=t.parentElement,n=e?.parentElement;t.previousElementSibling?.classList.add(D),t.classList.remove(D),e?.classList.remove(D),n?.classList.remove(D),I(t,`account-id`),I(e,`account-wrap`),I(n,`account-shell`)}}function vi(e){let t=e?.firstElementChild,n=t?.textContent?.trim()||``;/^(?:[\d.,]+\s*[₾$€¥£₺₽]|[₾$€¥£₺₽]\s*[\d.,]+)/.test(n)&&t.classList.add(D)}function yi(e){return N(`*`,[`[direction:ltr]`],e)||N(`*`,[`[direction:rtl]`],e)}function bi(){let e=Ti();for(let t of F(document,Dn)){let n=M(t.textContent||``).replace(/:$/,``),r=xi(t,n),i=wi(Si(t,r,n),e);r&&i?(r.classList.add(D),r.setAttribute(Cn,`true`)):r?.getAttribute(`data-inex-user-detail-hidden`)&&(r.classList.remove(D),r.removeAttribute(Cn))}}function xi(e,t){let n=e.closest(A),r=e.parentElement;for(;r&&r!==document.body&&r!==n;){let e=M(r.textContent||``);if(Ci(e,t)&&e.length<=180)return r;r=r.parentElement}return null}function Si(e,t,n){let r=M(e.nextElementSibling?.textContent||``);if(r)return r;if(M(e.parentElement?.textContent||``).replace(/:$/,``)===n){let t=M(e.parentElement?.nextElementSibling?.textContent||``);if(t)return t}return Ci(M(t?.textContent||``),n)}function Ci(e,t){let n=e.toLowerCase().indexOf(t.toLowerCase());return n<0?``:M(e.slice(n+t.length).replace(/^\s*[:：-]\s*/,``))}function wi(e,t){let n=M(e);return n?On.test(n)?!0:t.has(Di(n)):!1}function Ti(){let e=new Set;for(let t of F(document,/^IG\d+$/)){Ei(e,t.previousElementSibling?.textContent);let n=M(t.textContent||``);Ei(e,M(t.parentElement?.textContent||``).replace(n,``))}return e}function Ei(e,t){let n=Di(t||``);n&&e.add(n)}function Di(e){return M(e).replace(/\bIG\d+\b/gi,``).replace(/[^\w\u10a0-\u10ff]+/g,` `).toLowerCase().trim()}function Oi(){for(let e of document.querySelectorAll(kn)){let t=[...e.querySelectorAll(A)];e.classList.toggle(D,t.length>0&&t.every(e=>e.classList.contains(`inex-enhanced-hidden`)))}}function ki(){for(let e of document.querySelectorAll(`.inex-enhanced-parcels__flight`)){let t=[...e.querySelectorAll(A)];e.classList.toggle(D,t.length>0&&t.every(e=>e.classList.contains(`inex-enhanced-hidden`)))}}function Ai(e){let t=ji(e);return{info:t,arrived:na(e.querySelector(`.inex-enhanced-parcels__status`),t),eventCount:Mi(t)}}function ji(e){let t=Yi(e.querySelector(`.inex-enhanced-parcels__tracking`));return t?J.get(t):void 0}function Mi(e){let t=Number(e?.eventCount);return Number.isFinite(t)?t:+!!e?.latestEvent}function Ni(e){let t=br(e?.expectedArrival)?.getTime();return Number.isFinite(t)?t:1/0}function Pi(e,t,n,r){if(!e)return;let i=e.querySelector(`.inex-enhanced-parcels__process`);if(r||!n?.processText){i?.remove();return}i||(i=document.createElement(`span`),i.className=`inex-enhanced-parcels__process`,t?.after(i)),L(i,n.processText)}function Fi(e,t){!e||!t?.previewStatusText||L(e,t.previewStatusText)}function Ii(e){let t=e.querySelector(`:scope > .${yn}`);return t||(t=document.createElement(`span`),t.className=yn,e.append(t)),t}function Li(e,t){if(!e)return null;let n=e.querySelector(`:scope > .inex-enhanced-parcels__status-cell`);return n||(n=document.createElement(`span`),n.className=`inex-enhanced-parcels__status-cell`,e.prepend(n)),U(t,n),n}function Ri(e,t,n,r){let i=e.querySelector(`:scope > .${bn}`);return i||(i=document.createElement(`span`),i.className=bn,e.append(i)),U(n,i),U(t,i),U(r,i),i}function zi(e){return Gi(e).find(e=>Y(e)||Wi(e))}function Bi(e){return Gi(e).find(e=>Hi(e))}function Vi(e){for(let t of Gi(e)){if(Ui(t))return t;let e=F(t,/^(?:Paid|is paid|გადახდილია|оплачено)$/i).filter(Ui).at(-1);if(e)return e}}function Hi(e){return[...e.querySelectorAll(`button`)].some(e=>/^\s*Pay\s*$/i.test(e.textContent||``))||P(e,[`rounded-[10px]`]).length>=2}function Ui(e){return/^(?:Paid|is paid|გადახდილია|оплачено)$/i.test(M(e?.textContent||``))}function Wi(e){return Mn.test(M(e?.textContent||``))}function Gi(e){return[...e?.querySelector(`:scope > .inex-enhanced-parcels__actions`)?.children||[],...e?.children||[]]}function Ki(e){if(!e)return;e.classList.remove(`inex-enhanced-parcels__price`);let t=Y(e);if(t){for(let n of[...e.children])n!==t&&n.remove();L(t.querySelector(`span`)||t,`Needs Declaration`),t.setAttribute(`aria-label`,`Needs Declaration`),t.title=`Create declaration`}}function qi(e){if(!e)return null;let t=document.createElement(`span`);t.className=`inex-enhanced-parcels__paid`;let n=document.createElementNS(`http://www.w3.org/2000/svg`,`svg`);n.setAttribute(`viewBox`,`0 0 24 24`),n.setAttribute(`fill`,`none`),n.setAttribute(`stroke`,`currentColor`),n.setAttribute(`stroke-width`,`2`),n.setAttribute(`stroke-linecap`,`round`),n.setAttribute(`stroke-linejoin`,`round`);let r=document.createElementNS(`http://www.w3.org/2000/svg`,`path`);r.setAttribute(`d`,`M20 6 9 17l-5-5`),n.append(r);let i=document.createElement(`span`);return L(i,`Paid`),t.append(n,i),e.replaceWith(t),t}function Ji(e,t){if(!e||!t)return;let n=e.querySelector(`.inex-enhanced-parcels__amount`),r=M(n?.textContent||``);r&&(t.title=r,t.setAttribute(`aria-label`,`Paid - ${r}`),n.classList.add(D))}function Yi(e){if(!e)return``;let t=e.getAttribute(xn),n=e.textContent?.trim()||``,r=e.getAttribute(k);return t&&(!n||n===t||n===r)?t:(n&&(e.setAttribute(xn,n),e.removeAttribute(k)),n)}function Xi(e,t,n){if(!e)return;let r=n?sa(n):t;r&&e.textContent?.trim()!==r&&(e.textContent=r),n?e.setAttribute(k,r):e.removeAttribute(k),e.classList.remove(`inex-enhanced-parcels__tracking--description`),e.classList.remove(D)}function Zi(e,t){let n=e?.parentElement;if(!n)return;let r=n.querySelector(`.inex-enhanced-parcels__origin`);if(!rr(t)){r?.remove();return}r||(r=document.createElement(`span`),r.className=`inex-enhanced-parcels__origin`,e.before(r));let i=ar(t);L(r,ir(t)),r.title=sr(t),r.dataset.tooltip=sr(t),r.dataset.country=t.countryCode||``,r.dataset.transport=i}function Qi(e){for(let t of e){if(rr($(t)))continue;let e=$i(t);!e.countryCode&&!e.countryName||(ea(t,e),Zi(t.querySelector(`.inex-enhanced-parcels__tracking`),e))}}function $i(e){let t=e.closest(kn),n=t?[...t.querySelectorAll(A)]:[],r=n.indexOf(e);for(let e=1;e<n.length;e++){let t=n[r-e],i=n[r+e],a=nr($(t),$(i));if(a.countryCode||a.countryName)return a}return{}}function $(e){try{return JSON.parse(e?.getAttribute(`data-inex-origin`))||{}}catch{return{}}}function ea(e,t){if(e){if(!rr(t)){e.removeAttribute(Sn);return}e.setAttribute(Sn,JSON.stringify(t))}}function ta(e,t,n){if(!e)return null;let r=t?.parentElement,i=Yi(t),a=document.createTreeWalker(e,NodeFilter.SHOW_TEXT,{acceptNode(e){let t=M(e.nodeValue||``),a=e.parentElement;return!t||t===i||!a||a.closest(`.inex-enhanced-hidden`)||r?.contains(a)||n?.contains(a)||oa(t)?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT}});return a.nextNode()?{text:M(a.currentNode.nodeValue||``),element:a.currentNode.parentElement}:null}function na(e,t){return t&&typeof t.arrived==`boolean`?t.arrived:aa(e,Tn)}function ra(e){return!!(ji(e)?.status===5||aa(ia(e),wn))}function ia(e){return e.querySelector(`.inex-enhanced-parcels__status`)||N(`div`,[`rounded-full`,`tracking-1`],e)}function aa(e,t){return t.test(M(e?.textContent||``))}function oa(e){return/^(?:[\d.,]+\s*[₾$€¥£₺₽]|[₾$€¥£₺₽]\s*[\d.,]+)/.test(e)||/^(?:Paid|is paid|გადახდილია|оплачено)$/i.test(e)||/^[·•]$/.test(e)}function sa(e){let t=M(e).replace(/[_-]+/g,` `);return!/[a-z]/i.test(t)||t!==t.toUpperCase()?t:t.toLowerCase().replace(/\b[a-z]/g,e=>e.toUpperCase())}function ca(e){if(!e)return;e.classList.remove(`inex-enhanced-parcels__declaration`);let t=P(e,[`rounded-[10px]`]);I(t[0],`weight`),I(t[1],`amount`);for(let t of F(e,/^(?:Paid|is paid|გადახდილია|оплачено)$/i))t.classList.add(D);for(let t of e.querySelectorAll(`svg.lucide-check`))t.classList.add(D);for(let t of P(e,[`cursor-help`]))t.classList.add(D);for(let t of e.querySelectorAll(`button`))I(t,`pay`);let n=[...e.querySelectorAll(`button`)].some(e=>!e.classList.contains(D)),r=t.some(e=>!e.classList.contains(D));e.classList.toggle(D,!n&&!r)}function la(){let e=_r(),t=!1;!J.size&&e&&(J=e.info,q=e.fetchedAt,Q()),!(K||Date.now()-q<3e5)&&(K=gr(e?.info||new Map,`5`).then(e=>{e&&(J=e,q=Date.now(),vr(e),t=!0)}).catch(()=>{e&&(J=e.info,q=e.fetchedAt,t=!0)}).finally(()=>{K=void 0,t&&Q()}))}ye(),fn(),l(),Xr(),Je()})();