export function stripUserStyle(css) {
  if (css.startsWith('export default ')) {
    css = JSON.parse(css.slice('export default '.length).replace(/;$/, ''));
  }

  return css
    .replace(/\/\*\s*==UserStyle==[\s\S]*?==\/UserStyle==\s*\*\//, '')
    .replace(/@-moz-document[^{]+\{/, '')
    .replace(/}\s*$/, '')
    .trim();
}
