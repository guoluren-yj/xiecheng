/**
 * service - 价格库管理/价格库
 * @date: 2019-10-23
 * @version: 1.0.0
 * @author: jing.chen05@hand-china.com
 * @copyright Copyright (c) 2019, Hand
 */

import request from 'utils/request';
import { SRM_SSRC, SRM_PLATFORM } from '_utils/config';
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';
/**
 * 请求API前缀
 * @type {string}
 */
const prefix = `${SRM_SSRC}/v1`;
const tenantId = getCurrentOrganizationId();

/**
 * 价格库查询
 * @async
 * @function fetchPriceLibList
 * @param {object} params - 查询条件
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function fetchPriceLibList(params) {
  const { organizationId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}/${organizationId}/price-lib`, {
    method: 'GET',
    query: { ...param },
  });
}

/**
 * 价格库-历史价格明细查询
 * @async
 * @function fetchHistoryPriceDetail
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchHistoryPriceDetail(params) {
  const { organizationId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${SRM_SSRC}/v1/${organizationId}/price-lib-historys`, {
    method: 'GET',
    query: { ...param },
  });
}

/**
 *  价格库更新保存API
 * @async
 * @function updatePriceLib
 * @param {object} params - 参数
 * @returns {object} fetch Promise
 */
export async function updatePriceLib(params) {
  const { organizationId, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/price-lib/manual`, {
    method: 'POST',
    body: otherParams.libList,
  });
}

/**
 * 价格库查询
 * @async
 * @function fetchPriceLibDetail
 * @param {object} params - 查询条件
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function fetchPriceLibDetail(params) {
  const { organizationId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}/${organizationId}/price-lib/manual`, {
    method: 'GET',
    query: { ...param },
  });
}

/**
 * 物料价格信息-保存
 * @async
 * @function savePriceLib
 * @param {object} params - 参数
 * @returns {object} fetch Promise
 */
export async function savePriceLib(params) {
  const { organizationId, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/price-lib`, {
    method: 'POST',
    body: otherParams.newParameters,
  });
}

/**
 * 物料价格行 - 批量删除
 * @async
 * @function deletePriceLine
 * @param {object} params - 请求参数
 * @returns {object} fetch Promise
 */
export async function deletePriceLine(params) {
  return request(`${prefix}/${params.organizationId}/price-lib`, {
    method: 'DELETE',
    body: params.remoteDelete,
  });
}

/**
 * 物料价格行-发布
 * @async
 * @function releasePriceLib
 * @param {object} params - 参数
 * @returns {object} fetch Promise
 */
export async function releasePriceLib(params) {
  const { organizationId, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/price-lib/submit`, {
    method: 'POST',
    body: otherParams,
  });
}

/**
 * fetchLadderList
 * 获取阶梯价格API
 */
export async function fetchLadderList(params) {
  const { organizationId, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/ladder-price-libs`, {
    method: 'GET',
    query: { ...otherParams },
  });
}

/**
 * fetchLadderList
 * 获取阶梯价格API
 */
export async function fetchDetailLadderList(params) {
  const { organizationId, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/price-library-doc-lines/ladder-price-lib`, {
    method: 'GET',
    query: { ...otherParams },
  });
}

/**
 * 保存阶梯价格
 * @param {Array} params - 保存行信息列表
 */
export async function saveLadderList(params) {
  const { organizationId, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/ladder-price-libs`, {
    method: 'POST',
    body: otherParams.params,
  });
}

/**
 * 阶梯价格 - 批量删除
 * @async
 * @function deleteLadderQuot
 * @param {object} params - 请求参数
 * @returns {object} fetch Promise
 */
export async function deleteLadderQuot(params) {
  const { organizationId, priceLibraryId, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/ladder-price-libs`, {
    method: 'DELETE',
    body: otherParams.remoteDelete,
  });
}

/**
 * 查询配置中心配置
 * @param {String} settingCode - 查询设置项的 code
 */
export async function querySetting(payload) {
  return request(`${SRM_PLATFORM}/v1/${tenantId}/settings/batch`, {
    method: 'GET',
    query: payload,
  });
}

/**
 * 查询历史价格分析-相似物品最低一览表
 * @async
 * @function fetchHisSimilarItem
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchHisSimilarItem(params) {
  const { organizationId, ...others } = params;
  const param = parseParameters(others);
  return request(`${prefix}/${organizationId}/price-lib-historys/analysis/similar`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 查询历史价格分析-折线图表
 * @async
 * @function fetchPriceAnalysis
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchPriceAnalysis(params) {
  const { organizationId, ...others } = params;
  return request(`${prefix}/${organizationId}/price-lib-historys/analysis`, {
    method: 'GET',
    query: others,
  });
}

/**
 * 查询价格库变更查询的数据
 * @async
 * @function fetchPriceChange
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchPriceChange(params) {
  const { organizationId, ...others } = params;
  const otherParams = parseParameters(others);
  return request(`${prefix}/${organizationId}/price-library-docs`, {
    method: 'GET',
    query: { ...otherParams },
  });
}

/**
 * 查询价格库变更申请单号详情头信息
 * @async
 * @function fetchPriceChangeOrderDetail
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchPriceChangeOrderDetail(params) {
  const { organizationId, priceLibraryDocId } = params;
  return request(`${prefix}/${organizationId}/price-library-docs/detail/${priceLibraryDocId}`, {
    method: 'GET',
  });
}

/**
 * 查询申请单详情的行信息
 * @async
 * @function fetchDetailList
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchDetailList(params) {
  const { organizationId, priceLibraryDocId, ...others } = params;
  const otherParams = parseParameters(others);
  return request(`${prefix}/${organizationId}/price-library-doc-lines/${priceLibraryDocId}`, {
    method: 'GET',
    query: { ...otherParams },
  });
}

/**
 * 申请单详情 - 批量删除
 * @async
 * @function deletePriceLine
 * @param {object} params - 请求参数
 * @returns {object} fetch Promise
 */
export async function deleteDetailInfo(params) {
  return request(`${prefix}/${params.organizationId}/price-library-doc-lines/delete`, {
    method: 'DELETE',
    body: params.newParameters,
  });
}

/**
 * 申请单详情-发布
 * @async
 * @function releasePriceLib
 * @param {object} params - 参数
 * @returns {object} fetch Promise
 */
export async function releaseDetailInfo(params) {
  const { organizationId, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/price-library-docs/price-library/resubmit`, {
    method: 'POST',
    body: otherParams,
  });
}

/**
 * 申请单详情-保存
 * @async
 * @function savePriceLibDetail
 * @param {object} params - 参数
 * @returns {object} fetch Promise
 */
export async function savePriceLibDetail(params) {
  const { organizationId, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/price-library-docs/price-library/save`, {
    method: 'POST',
    body: otherParams.saveInfo,
  });
}

/**
 * 导入ERP
 * @async
 * @function importToErp
 * @param {object} params - 参数
 * @returns {object} fetch Promise
 */
export async function importToErp(params) {
  const { organizationId, ...otherParams } = params;
  return request(`${prefix}/${organizationId}/price-lib/import-erp`, {
    method: 'POST',
    body: otherParams.selectedRowKeys,
  });
}
