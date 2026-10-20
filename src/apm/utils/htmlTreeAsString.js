import { isString } from 'lodash';

const UNKNOWN_PATH = '<unknown>';

function _htmlElementAsString(element) {
  if (!element || !element.tagName) {
    return '';
  }
  const list = [];
  list.push(element.tagName.toLowerCase());
  if (element.id) {
    list.push('#' + element.id);
  }
  const { className } = element;
  if (className && isString(className)) {
    const clses = className.split(/\s+/);
    for (let u = 0, length = clses.length; u < length; u++) {
      list.push(`.${clses[u]}`);
    }
  }
  const a = ['type', 'name', 'title', 'alt'];
  for (let u = 0, length = a.length; u < length; u++) {
    const n = a[u];
    const r = element.getAttribute(n);
    if (r) {
      list.push(`[${n}="${r}"]`);
    }
  }
  return list.join('');
}

export default function htmlTreeAsString(element) {
  try {
    const path = [];
    let currentElement = element;
    let levels = 0;
    let totalSize = 0;
    const splitSize = ' > '.length;
    let htmlStr;
    while (currentElement && levels++ < 5) {
      htmlStr = _htmlElementAsString(currentElement);
      if ('html' === htmlStr || (levels > 1 && 80 <= totalSize + path.length * splitSize + htmlStr.length)) {
        break;
      }
      path.push(htmlStr);
      totalSize += htmlStr.length;
      currentElement = currentElement.parentNode;
    }
    return path.reverse().join(' > ');
  } catch (e) {
    return UNKNOWN_PATH;
  }
}
