import { GM_addStyle } from '$';
import darkCss from './dark.user.css?raw';

export function applyDarkTheme() {
  GM_addStyle(darkCss);
}
