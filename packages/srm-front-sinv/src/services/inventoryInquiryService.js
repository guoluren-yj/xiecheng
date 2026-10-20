import { SRM_SPUC } from '_utils/config';
import request from 'utils/request';
import { getCurrentOrganizationId, parseParameters } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 * 查询采购方库存汇总
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 */
export async function queryInventoryInquiryList(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/sstk/item-outsource-storage/purchaser/page`, {
    method: 'GET',
    query: parseParameters(params),
  });
}

/**
 * 查询供应商库存汇总
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 */
export async function queryInventoryInquiryVendorList(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/sstk/item-outsource-storage/supplier/page`, {
    method: 'GET',
    query: parseParameters(params),
  });
}
