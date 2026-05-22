export function stripUserStyle(css) {
  if (css.startsWith('export default ')) {
    css = JSON.parse(css.slice('export default '.length).replace(/;$/, ''));
  }

  return minifyCss(
    css
      .replace(/\/\*\s*==UserStyle==[\s\S]*?==\/UserStyle==\s*\*\//, '')
      .replace(/@-moz-document[^{]+\{/, '')
      .replace(/}\s*$/, '')
      .trim(),
  );
}

function minifyCss(css) {
  let out = '';
  let quote = '';
  let space = false;
  for (const ch of css) {
    if (quote) {
      out += ch;
      if (ch === quote) quote = '';
    } else if (ch === '"' || ch === "'") {
      if (space && out) out += ' ';
      out += ch;
      quote = ch;
      space = false;
    } else if (/\s/.test(ch)) {
      space = true;
    } else {
      if (space && out && !'{}:;,>'.includes(ch)) out += ' ';
      out += ch;
      space = false;
    }
  }
  return out.replace(/\s*([{}:;,>])\s*/g, '$1').replace(/;}+/g, '}');
}
