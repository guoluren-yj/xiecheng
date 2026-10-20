import request from 'utils/request';
import { SRM_SPC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

import { PrefixV2, Prefix } from '@/utils/globalVariable';

const organizationId = getCurrentOrganizationId();

/**
 * 核价 - 查询
 * @async
 * @returns Promise
 */
export async function queryCheckPrice(params = {}) {
  const { customizeUnitCode, otherQuery = {}, ...otherParams } = params;
  return request(`${PrefixV2}/${organizationId}/rfx/check/group/details`, {
    method: 'POST',
    query: {
      customizeUnitCode,
      permissionFilterFlag: params?.permissionFilterFlag || 0,
      ...(otherQuery || {}),
    },
    body: otherParams,
  });
}

/**
 * 核价 - 保存
 * @async
 * @returns Promise
 */
export async function saveCheckPrice(params = {}) {
  const { customizeUnitCode, ...otherParams } = params;
  return request(`${PrefixV2}/${organizationId}/rfx/check/save`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: otherParams,
  });
}

/**
 * 核价 - 清空
 * @async
 * @returns Promise
 */
export async function cleanCheckPrice(params = {}) {
  return request(`${PrefixV2}/${organizationId}/rfx/check/clean`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 核价 - 保存自动选用的数据
 * @async
 * @returns Promise
 */
export async function saveAutoData(params = {}) {
  return request(`${PrefixV2}/${organizationId}/rfx/check/recommend/save`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 核价 - 提交
 * @async
 * @returns Promise
 */
export async function submitCheckPrice(params = {}) {
  const { customizeUnitCode, ...otherParams } = params;
  return request(`${PrefixV2}/${organizationId}/rfx/check/submit`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: otherParams,
  });
}

/**
 * 核价 - 提交-通过补充物料
 * @async
 * @returns Promise
 */
export async function submitCheckPriceByItem(params = {}) {
  const { customizeUnitCode, ...otherParams } = params;
  return request(`${PrefixV2}/${organizationId}/rfx/check/items/edit/submit`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: otherParams,
  });
}

/**
 * 获取用户记忆
 * @param {*} params config
 * @returns []
 */
export function fetchNewCheckPriceUserMemory(params = {}) {
  return request(`${Prefix}/${organizationId}/user-config/batch`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 保存用户记忆
 */
export async function saveNewCheckPriceUserMemory(params) {
  return request(`${Prefix}/${organizationId}/user-config`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 核价-导出
 */
export function exportCheckPriceData(params) {
  return request(`${Prefix}/${organizationId}/rfx/check/export`, {
    method: 'GET',
    query: params,
    responseType: 'text',
  });
}

/**
 * 核价- 核价总金额和选用供应商
 */
export function querySyncData(params) {
  return request(`${PrefixV2}/${organizationId}/rfx/check/recommend/info`, {
    method: 'POST',
    body: params,
    query: { permissionFilterFlag: params?.permissionFilterFlag || 0 },
  });
}

/**
 * 查询价格服务涨跌幅/最低价/最新价
 * @async
 * @param {Object} params - 查询参数
 * @param {Object} [params.quotationDetail] - 报价信息
 * @returns {Promise} - fetch promise
 */
export async function queryPriceInfo(params = {}) {
  const { quotationDetail } = params;
  return request(`${SRM_SPC}/v1/${organizationId}/price-lib-services/convert-price`, {
    method: 'POST',
    body: quotationDetail,
  });
}

/**
 * 核价-导出
 */
export function fetchAttachmentCount(params) {
  return request(`${PrefixV2}/${organizationId}/rfx/check/files/count`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 核价-根据汇率编辑保存
 */
export function fetchExchangeRate(params) {
  return request(`${PrefixV2}/${organizationId}/rfx/check/auto-save`, {
    method: 'POST',
    body: params,
  });
}
