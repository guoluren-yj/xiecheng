import { isArray, isString } from 'lodash';

function joinRegExp(regExps) {
  const t = [];
  for (let len = regExps.length, r = 0; r < len; r++) {
    const regExp = regExps[r];
    if (isString(regExp)) {
      t.push(regExp.replace(/([.*+?^=!:${}()|[\]/\\])/g, '\\$1'));
    } else if (regExp && regExp.source) {
      t.push(regExp.source);
    }
  }
  return new RegExp(t.join('|'), 'i');
}

export default function getRegexp(regExps) {
  return isArray(regExps) && regExps.length ? joinRegExp(regExps) : null;
}
