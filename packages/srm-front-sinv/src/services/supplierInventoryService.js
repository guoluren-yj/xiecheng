import { SRM_SPUC } from '_utils/config';
import request from 'utils/request';
import { getUserOrganizationId, filterNullValueObject, parseParameters } from 'utils/utils';

const organizationId = getUserOrganizationId();

/**
 * 查询供应商库存列表的数据
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 */
export async function querySupplierInventoryList(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/sstk-item-storage/purchaser/page`, {
    method: 'GET',
    query: parseParameters(params),
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
export async function querySupplierInventoryInputList(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/sstk-item-storage-records/purchaser/list`, {
    method: 'GET',
    query: parseParameters(params),
  });
}
