/**
 * 精度相关接口
 */

import { isUndefined, isNumber } from 'lodash';
import { NumberField } from 'choerodon-ui/pro';
import { math } from 'choerodon-ui/dataset';
import request from 'utils/request';
import { SRM_SSRC } from '@/utils/config';
import { getCurrentOrganizationId, getCurrentUser } from 'utils/utils';

/**
 * 请求API前缀
 * @type {string}
 */
const prefix = `${SRM_SSRC}/v1`;

/**
 * 查询精度
 */
export async function queryPrecision(params) {
  const organizationId = getCurrentOrganizationId();
  const { currencyCodes = [], uomIds = [], financialCodes = [] } = params;
  return request(`${prefix}/${organizationId}/precision`, {
    method: 'GET',
    query: {
      currencyCodes,
      uomIds,
      financialCodes,
    },
  });
}

/**
 * 千位分隔符
 * @param {String} val - 需要千分位分割
 */
export function numberSeparatorRender(val, precision) {
  if (!val && val !== 0) return val;
  const locale = getCurrentUser()?.language?.replace('_', '-');
  const minimumFractionDigits =
    isUndefined(precision) || !isNumber(precision) ? math.dp(val) : precision;
  return NumberField.format(val, locale, {
    minimumFractionDigits,
    maximumFractionDigits: minimumFractionDigits,
  });
}
