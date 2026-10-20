import { isTenantRoleLevel, getCurrentOrganizationId } from 'utils/utils';

export function uuid() {
  const s = [];
  const hexDigits = '0123456789abcdef';
  for (let i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = '4'; // bits 12-15 of the time_hi_and_version field to 0010
  // eslint-disable-next-line no-bitwise
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = '-'; // eslint-disable-line

  const uuid1 = s.join('');
  return uuid1;
}

// 判断是否是租户，返回租户id
export function lowcodeOrganizationURL({ route = 'swbh', isSite = false, haveGrade = 'v1' } = {}) {
  const orgStr = isSite || isTenantRoleLevel() ? `${getCurrentOrganizationId()}` : '';
  return `${(window.__lowcodeUrlRoute || {})[route] || route}${haveGrade ? `/${haveGrade}` : ''}${
    orgStr ? `/${orgStr}` : ''
  }`;
}
/**
 * 判断是否是json数据
 * @param {String} str
 */
export function isJSON(str) {
  if (typeof str === 'string') {
    try {
      const obj = JSON.parse(str);
      if (typeof obj === 'object' && obj) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      return false;
    }
  }
}
