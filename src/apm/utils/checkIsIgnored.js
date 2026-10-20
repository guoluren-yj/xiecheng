import getRegexp from './getRegexp';

export default function checkIsIgnored(regExps, str) {
  const regexp = getRegexp(regExps || []);
  return !!regexp && regexp.test(str);
}
