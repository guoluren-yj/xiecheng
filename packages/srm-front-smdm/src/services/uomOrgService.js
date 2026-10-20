/**
 * service - 单位定义
 * @date: 2018-7-6
 * @version: 0.0.1
 * @author: WH <heng.wei@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { SRM_MDM } from '_utils/config';
import { parseParameters } from 'utils/utils';

// const SRM_MDM = `/smdm-12695`;
/**
 * 请求API前缀
 * @type {string}
 */
const prefix = `${SRM_MDM}/v1`;

/**
 * 查询租户级计量单位
 * @async
 * @function search
 * @param {object} params - 查询条件
 * @param {!number} params.tenantId - 租户Id
 * @param {?string} params.uomName - 计量单位名称
 * @param {?string} params.uomCode - 计量单位编码
 * @param {!object} params.page - 分页参数
 * @returns {object} fetch Promise
 */
export async function search(params) {
  return request(`${prefix}/${params.tenantId}/uom`, {
    method: 'GET',
    query: parseParameters(params),
  });
}

/**
 * 保存租户级计量单位
 * @async
 * @function save
 * @param {Object} params - 请求参数
 * @param {Object[]} params.saveData - 待保存的数据列表
 * @param {!number} params.tenantId - 租户Id
 * @param {?string} params.saveData[].uomId - 计量单位ID
 * @param {!string} params.saveData[].uomCode - 计量单位编码
 * @param {!string} params.saveData[].uomCode - 计量单位名称
 * @param {?string} params.saveData[].uomTypeCode - 计量单位类型编码
 * @param {!number} params.saveData[].tenantId - 租户Id
 * @param {number} [params.saveData[].enabledFlag = 1] - 启用标记
 * @returns {object} fetch Promise
 */
export async function save(params) {
  const { customizeUnitCode } = params;
  return request(`${prefix}/${params.tenantId}/uom`, {
    method: 'POST',
    body: [...params.saveData],
    query: { customizeUnitCode },
  });
}

/**
 * 引用平台级计量单位
 * @async
 * @function fetchRefUom
 * @param {Object} params - 请求参数
 * @param {!number} params.tenantId - 租户Id
 * @returns {object} fetch Promise
 */
export async function fetchRefUom(params) {
  return request(`${prefix}/${params.tenantId}/uom/extends`, {
    method: 'POST',
  });
}
