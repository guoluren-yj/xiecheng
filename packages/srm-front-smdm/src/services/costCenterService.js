/**
 * service - 期间定义(租户级)
 * @date: 2018-7-12
 * @version: 0.0.1
 * @author: WH <heng.wei@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { SRM_MDM } from '_utils/config';
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';
/**
 * 请求API前缀
 * @type {string}
 */
const prefix = `${SRM_MDM}/v1`;

const organizationId = getCurrentOrganizationId();

/**
 * 租户级会计期查询
 * @async
 * @function searchHeader
 * @param {object} params - 查询条件
 * @param {!number} params.tenantId - 租户Id
 * @param {?string} params.periodSetName - 会计期名称
 * @param {?string} params.periodSetCode - 会计期编码
 * @param {!object} params.page - 分页参数
 * @returns {object} fetch Promise
 */
export async function searchHeader(params) {
  const param = parseParameters(params);
  return request(`${prefix}/${organizationId}/cost-centers`, {
    method: 'GET',
    query: { ...param },
  });
}
/**
 * 平台级期间查询
 * @async
 * @function searchLine
 * @param {Object} params - 查询条件
 * @param {!number} params.tenantId - 租户Id
 * @param {?string} params.periodName - 期间
 * @param {?string} params.periodYear - 年
 * @param {?string} params.periodSetCode - 会计期编码
 * @param {!object} params.page - 分页参数
 * @returns {Object} fetch Promise
 */
export async function searchLine(params) {
  const param = parseParameters(params);
  return request(`${prefix}/${param.tenantId}/period-sets/periods`, {
    method: 'GET',
    query: param,
  });
}
/**
 * 会计期保存
 * @async
 * @function savePeriodHeader
 * @param {Object} params - 请求参数
 * @param {!number} params.tenantId - 租户Id
 * @param {Object[]} param.saveData - 保存数据列表
 * @param {?number} param.saveData[].periodSetId - 会计期Id
 * @param {!string} param.saveData[].periodSetCode - 会计期编码
 * @param {!string} param.saveData[].periodSetName - 会计期名称
 * @param {?number} [param.saveData[].enabledFlag = 1] - 启用标记
 * @param {?number} param.saveData[].periodTotalCount - 期间总数
 * @param {?string} param.saveData[].refPeriodSetId - 引用期间Id
 * @param {?number} [param.saveData[].tenantId = 0] - 租户Id
 * @param {?number} param.saveData[].objectVersionNumber - 版本号
 * @returns {Object} fetch Promise
 */
export async function savePeriodHeader(params) {
  const { customizeUnitCode, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/cost-centers/cost-center/batch-save`, {
    method: 'POST',
    body: [...otherParams.saveData],
    query: { customizeUnitCode },
  });
}
/**
 * 期间总是查询
 * @async
 * @function searchPeriodRule
 * @param {Object} params - 查询参数
 * @param {!number} params.tenantId - 租户Id
 * @param {!number} params.periodSetId - 会计期id
 * @returns {Object} fetch Promise
 */
export async function searchPeriodRule(params) {
  return request(`${prefix}/${params.tenantId}/period-sets/${params.periodSetId}/periods`, {
    method: 'GET',
  });
}

/**
 * 引用云级数据
 * @async
 * @function searchRef
 * @param {Object} params - 查询参数
 * @param {!number} params.tenantId - 租户Id
 * @returns {Object} fetch Promise
 */
export async function searchRef(params) {
  return request(`${prefix}/${params.tenantId}/period-sets/ref`, {
    method: 'POST',
  });
}
/**
 * 期间维护保存
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
export async function savePeriod(params) {
  return request(`${prefix}/${params.tenantId}/period-sets/${params.periodSetId}/periods`, {
    method: 'POST',
    body: [...params.data],
  });
}
