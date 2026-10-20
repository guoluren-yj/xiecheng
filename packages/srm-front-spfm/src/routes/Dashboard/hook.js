import { getCurrentLanguage } from 'utils/utils';
import { isNumber } from 'lodash';

/**
 * 展示分隔符
 */
export function formatAumont(aumont, useGrouping = true) {
  if (isNumber(aumont)) {
    const language = getCurrentLanguage().split('_').join('-');
    const options = { useGrouping };
    return aumont.toLocaleString(language, options);
  }
  return aumont;
}
