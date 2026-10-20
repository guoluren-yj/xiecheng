/**
 * LedgerAccount  客户配置表
 * @date: 2020-07-17
 * @author: gzq <zhiqiang.guo@hand-china.com>
 * @version: 0.1.0
 * @copyright Copyright (c) 2020, Hand
 */

import request from 'utils/request';
import { SRM_PLATFORM, SRM_INTERFACE } from '_utils/config';
import { parseParameters } from 'utils/utils';
/**
 * 请求API前缀
 * @type {string}
 */
const prefix = `${SRM_PLATFORM}/v1`;

/**
 * 查询
 * @async
 * @function searchHeader
 * @param {object} params - 查询条件
 * @param {!number} params.tenantId - 租户Id
 * @param {?string} params.periodSetName - 会计期名称
 * @param {?string} params.periodSetCode - 会计期编码
 * @param {!object} params.page - 分页参数
 * @returns {object} fetch Promise
 */
export async function fetchList(params) {
  const param = parseParameters(params);
  return request(`${prefix}/cust-service-configs`, {
    method: 'GET',
    query: { ...param },
  });
}

/**
 * 保存
 * @async
 * @function savePeriod
 * @param {Object} params - 保存参数
 * @param {!number} params.periodSetId - 会计期id
 * @param {!number} params.tenantId - 租户Id
 * @param {Object[]} param.data - 保存数据列表
 * @param {!number} param.data[].periodSetId - 会计期id
 * @param {!string} param.data[].periodName - 期间名称
 * @param {!string} param.data[].orderSeq - 序号
 * @param {?number} param.data[].periodId- 期间Id
 * @param {?number} [param.data[].enabledFlag = 1]  - 启用标记
 * @param {?number} param.data[].periodQuarter - 季度
 * @param {?string} param.data[].periodYear - 年
 * @param {?string} param.data[].endDate - 截止时间
 * @param {?string} param.data[].startDate - 起始时间
 * @returns {Object} fetch Promise
 */
export async function fetchSave(params) {
  return request(`${prefix}/cust-service-configs`, {
    method: 'POST',
    body: params,
  });
}

export async function fetchSync(params) {
  return request(`${SRM_INTERFACE}/v1/yqy-user-exp`, {
    method: 'POST',
    body: params,
  });
}
