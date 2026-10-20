import request from 'utils/request';
import { getCurrentOrganizationId, getUserOrganizationId } from 'utils/utils';

import { SRM_SPC } from '_utils/config';
/**
 * 请求API前缀
 * @type {string}
 */
const organizationId = getCurrentOrganizationId();
const tenantId = getUserOrganizationId();

/**
 * 价格库-模板-平台-发布
 * @async
 * @function releasePriceLib
 */
export async function releasePriceLib(params) {
  return request(`${SRM_SPC}/v1/${organizationId}/price-lib-templates/platform`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 价格库-模板-平台-发布
 * @async
 * @function releasePriceLibOrg
 */
export async function releasePriceLibOrg(params) {
  return request(`${SRM_SPC}/v1/${organizationId}/price-lib-templates`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 价格库-模板-平台-启用/禁用
 * @async
 * @function enablePriceLib
 */
export async function enablePriceLib(params) {
  return request(`${SRM_SPC}/v1/${organizationId}/price-lib-templates/enabled/platform`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 价格库-模板-租户-启用/禁用
 * @async
 * @function enablePriceLibOrg
 */
export async function enablePriceLibOrg(params) {
  return request(`${SRM_SPC}/v1/${organizationId}/price-lib-templates/enabled`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 价格库-弹框-平台-保存
 * @async
 * @function savePriceLibDimension
 */
export async function savePriceLibDimension(params) {
  return request(`${SRM_SPC}/v1/${organizationId}/price-lib-tmpl-dims/platform`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 价格库-弹框-租户-保存
 * @async
 * @function savePriceLibDimension
 */
export async function savePriceLibDimensionOrg(params) {
  return request(`${SRM_SPC}/v1/${organizationId}/price-lib-tmpl-dims`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 价格库-租户-引用预置模板
 * @async
 * @function referenceTemplateOrg
 */
export async function referenceTemplateOrg(params) {
  return request(`${SRM_SPC}/v1/${organizationId}/price-lib-templates/quote/save`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 价格库-租户-重置维度
 * @async
 * @function resetDimensionOrg
 */
export async function resetDimensionOrg(params) {
  return request(`${SRM_SPC}/v1/${organizationId}/price-lib-tmpl-dims/reset`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 价格库-租户-启用禁用
 * @async
 * @function resetDimensionOrg
 */
export async function enabledDimensionOrg(params) {
  return request(`${SRM_SPC}/v1/${organizationId}/price-lib-tmpl-dims/enabled`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 价格库-平台-重置维度
 * @async
 * @function resetDimension
 */
export async function resetDimension(params) {
  return request(`${SRM_SPC}/v1/${organizationId}/price-lib-tmpl-dims/reset/platform`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 价格库 - 获取lov头配置
 * @async
 * @function fetchLovConfig
 */
export async function fetchLovConfig(params) {
  const url = `/hpfm/v1/${organizationId}/lov-view/info`;
  return request(url, {
    method: 'GET',
    query: { ...params, tenantId },
  });
}

/**
 * 价格库 - 查询所有目标字段值，做跨页勾选
 * @async
 * @function fetchAppointAllData
 */
export async function fetchAppointCheckedData(params) {
  const url = `${SRM_SPC}/v1/${organizationId}/price-lib-rule-ln-datas/list`;
  return request(url, {
    method: 'GET',
    query: params,
  });
}

/**
 * 价格库 - 保存目标字段值
 * @async
 * @function saveAppoint
 */
export async function saveAppoint(params) {
  const { data = [], ruleLineId } = params;
  const url = `${SRM_SPC}/v1/${organizationId}/price-lib-rule-ln-datas/introduce/${ruleLineId}`;
  return request(url, {
    method: 'POST',
    body: data,
  });
}

/**
 * 价格库 - 解锁 - 租户
 * @async
 * @param {Obejct} params - 参数对象
 */
export async function fetchUnlockPriceLibOrg(params) {
  const url = `${SRM_SPC}/v1/${organizationId}/price-lib-templates/unlock`;
  return request(url, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 价格库 - 编辑已发布版本数据
 * @async
 * @param {Obejct} params - 参数对象
 */
export async function editPriceLibOrg(params) {
  const url = `${SRM_SPC}/v1/${organizationId}/price-lib-templates`;
  return request(url, {
    method: 'POST',
    body: params,
  });
}

/**
 * 价格库 - 解锁 - 平台
 * @async
 * @param {Obejct} params - 参数对象
 */
export async function fetchUnlockPriceLib(params) {
  const url = `${SRM_SPC}/v1/${organizationId}/price-lib-templates/unlock/platform`;
  return request(url, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 价格库 - 查询维度编辑条件
 * @async
 * @function fetchConditionDataOrg
 */
export async function fetchConditionDataOrg(params) {
  const url = `${SRM_SPC}/v1/${organizationId}/price-lib-rule-headers`;
  return request(url, {
    method: 'GET',
    query: params,
  });
}

/**
 * 价格库 - 查询维度编辑条件
 * @async
 * @function fetchConditionData
 */
export async function fetchConditionData(params) {
  const url = `${SRM_SPC}/v1/${organizationId}/price-lib-rule-headers/platform`;
  return request(url, {
    method: 'GET',
    query: params,
  });
}

/**
 * 价格库 - 大保存维度编辑条件
 * @async
 * @function saveConditionDataOrg
 */
export async function saveConditionDataOrg(params) {
  const url = `${SRM_SPC}/v1/${organizationId}/price-lib-rule-headers`;
  return request(url, {
    headers: {
      's-request-web': 'srm_web',
    },
    method: 'POST',
    body: params,
  });
}

/**
 * 价格库 - 大保存维度编辑条件
 * @async
 * @function saveConditionData
 */
export async function saveConditionData(params) {
  const url = `${SRM_SPC}/v1/${organizationId}/price-lib-rule-headers/platform`;
  return request(url, {
    headers: {
      's-request-web': 'srm_web',
    },
    method: 'POST',
    body: params,
  });
}

/**
 * 价格库 - 小保存维度编辑条件
 * @async
 * @function saveCondition
 */
export async function saveCondition(params) {
  const url = `${SRM_SPC}/v1/${organizationId}/price-lib-rule-lines`;
  return request(url, {
    method: 'POST',
    body: params,
  });
}

/**
 * 价格库 - 删除维度条件
 * @async
 * @function saveConditionOrg
 */
export async function deleteConditionOrg(params) {
  const url = `${SRM_SPC}/v1/${organizationId}/price-lib-rule-lines`;
  return request(url, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 价格库 - 删除维度条件
 * @async
 * @function saveCondition
 */
export async function deleteCondition(params) {
  const url = `${SRM_SPC}/v1/${organizationId}/price-lib-rule-lines/platform`;
  return request(url, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 价格库 -租户- 查询值集参考编码描述
 * @async
 * @function fetchLovReferenceTipOrg
 */
export async function fetchLovReferenceTipOrg(params) {
  const url = `${SRM_SPC}/v1/${organizationId}/price-lib-tmpl-dims/view/config`;
  return request(url, {
    method: 'GET',
    query: params,
  });
}

/**
 * 价格库配置管理导入
 * @async
 * @function importPrice
 * @param {object} params - 参数
 * @returns {object} fetch Promise
 */
export async function importPrice(params) {
  const url = `${SRM_SPC}/v1/${organizationId}/price-lib-templates/import-price`;
  return request(url, {
    method: 'POST',
    body: params,
  });
}

/**
 * 价格库配置管理导入-头查询
 * @async
 * @function importPrice
 * @param {object} params - 参数
 * @returns {object} fetch Promise
 */
export async function queryImportHeaders(params) {
  const url = `${SRM_SPC}/v1/${organizationId}/price-template/header-import`;
  return request(url, {
    method: 'GET',
    body: params,
  });
}

/**
 * 价格库配置管理导出
 * @async
 * @function importPrice
 * @param {object} params - 参数
 * @returns {object} fetch Promise
 */
export async function exportPrice(params) {
  const url = `${SRM_SPC}/v1/${organizationId}/price-lib-templates/export-price`;
  return request(url, {
    method: 'POST',
    body: params,
    responseType: 'text',
  });
}

/**
 * 价格库 -平台- 查询值集参考编码描述
 * @async
 * @function fetchLovReferenceTip
 */
export async function fetchLovReferenceTip(params) {
  const url = `${SRM_SPC}/v1/${organizationId}/price-lib-tmpl-dims/view/config/platform`;
  return request(url, {
    method: 'GET',
    query: params,
  });
}

// 查询操作记录
export async function queryOperationRecord(queryParams) {
  const { url, method, params, ...rest } = queryParams;
  return request(url, {
    method,
    query: {
      page: 0,
      size: 0,
      ...params,
      ...rest,
    },
  });
}
