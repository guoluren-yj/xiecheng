import request from 'utils/request';
import { SRM_MDM } from '_utils/config';

/**
 * 查询租户汇率定义的数据
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 * @param {String} params.organizationId - 组织ID
 * @param {String} params.fromCurrencyCode - 币种代码
 * @param {String} params.fromCurrencyName - 币种名称
 * @param {String} params.toCurrencyCode - 兑换币种代码
 * @param {String} params.toCurrencyName - 兑换币种名称
 */
export async function fetchRateTenantData(params) {
  const { organizationId, ...other } = params;
  return request(`${SRM_MDM}/v1/${organizationId}/exchange-rates`, {
    method: 'GET',
    query: other,
  });
}

/**
 * 新增租户汇率定义
 * @param {Object} params - 参数
 * @param {String} params.organizationId - 组织ID
 * @param {String} params.enabledFlag - 启用标识
 * @param {String} params.startDate - 起始时间
 * @param {String} params.endDate - 结束时间
 * @param {String} params.fromCurrencyCode - 币种代码
 * @param {String} params.fromCurrencyName - 币种名称
 * @param {String} params.toCurrencyCode - 兑换币种代码
 * @param {String} params.toCurrencyName - 兑换币种名称
 * @param {String} params.rateTypeCode - 汇率类型代码
 * @param {String} params.rateTypeName - 汇率类型名称
 * @param {String} params.rate - 汇率值
 */
export async function createRateTenant(params) {
  const { customizeUnitCode, body } = params;
  return request(`${SRM_MDM}/v1/${params.organizationId}/exchange-rates`, {
    method: 'POST',
    body,
    query: { customizeUnitCode },
  });
}

/**
 * 更新租户汇率定义
 * @param {Object} params - 参数
 * @param {String} params.organizationId - 组织ID
 * @param {String} params.enabledFlag - 启用标识
 * @param {String} params.startDate - 起始时间
 * @param {String} params.endDate - 结束时间
 * @param {String} params.fromCurrencyCode - 币种代码
 * @param {String} params.fromCurrencyName - 币种名称
 * @param {String} params.toCurrencyCode - 兑换币种代码
 * @param {String} params.toCurrencyName - 兑换币种名称
 * @param {String} params.rateTypeCode - 汇率类型代码
 * @param {String} params.rateTypeName - 汇率类型名称
 * @param {String} params.rate - 汇率值
 */
export async function updateRateTenant(params) {
  const { customizeUnitCode, body } = params;
  return request(`${SRM_MDM}/v1/${params.organizationId}/exchange-rates`, {
    method: 'PUT',
    body,
    query: { customizeUnitCode },
  });
}
