import { SRM_SPUC } from '_utils/config';
import request from 'utils/request';
import { getCurrentOrganizationId, filterNullValueObject, parseParameters } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 * 查询供应商库存列表的数据
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 */
export async function queryMyInventoryList(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/sstk-item-storage/supplier/page`, {
    method: 'GET',
    query: parseParameters(params),
  });
}

/**
 * 保存库存
 * @async
 * @function saveInventory
 * @param {!number} organizationId - 组织ID
 * @returns {object} fetch Promise
 */
export async function saveInventory(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/sstk-item-storage`, {
    method: 'POST',
    body: params.data,
    query: {
      customizeUnitCode: params.customizeUnitCode,
    },
  });
}

/**
 * 库存行删除
 * @async
 * @function deleteInventory
 * @param {!number} organizationId - 组织ID
 * @param {object} data - 数据
 * @returns {object} fetch Promise
 */
export async function deleteInventory(data) {
  return request(`${SRM_SPUC}/v1/${organizationId}/sstk-item-storage`, {
    method: 'DELETE',
    body: data,
  });
}

/**
 * 查询操作记录列表
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 */
export async function fetchOperationList(params) {
  const query = filterNullValueObject(parseParameters(params));
  const { itemStorageId, ...otherQuery } = query;
  return request(
    `${SRM_SPUC}/v1/${organizationId}/sstk-item-storage-records/list/page/${itemStorageId}`,
    {
      method: 'GET',
      query: otherQuery,
    }
  );
}

/**
 * 查询占用数量列表
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 */
export async function fetchOccupancyList(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/sstk-item-storage/order/page`, {
    method: 'GET',
    query: parseParameters(params),
  });
}

/**
 * 查询供应商库存记录列表的数据
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 */
export async function queryMyInventoryInputList(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/sstk-item-storage-records/supplier/list`, {
    method: 'GET',
    query: parseParameters(params),
  });
}
