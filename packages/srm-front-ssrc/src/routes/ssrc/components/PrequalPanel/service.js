import request from 'utils/request';

import { Prefix } from '@/utils/globalVariable';

/**
 * 查询采购方分组
 * @function - queryPurchasePrequalGroup
 * @param {!Object} params - 参数 eg: { organizationId, ... }
 * @returns promise
 */
export async function queryPurchaserPrequalGroups(params) {
  const { organizationId, ...otherParams } = params;
  return request(`${Prefix}/${organizationId}/prequal-group-headers/buyer/list`, {
    method: 'GET',
    query: otherParams,
  });
}

/**
 * 查询供应商分组
 * @function - querySupplierPrequalGroups
 * @param {!Object} params - 参数 eg: { organizationId, ... }
 * @returns promise
 */
export async function querySupplierPrequalGroups(params) {
  const { organizationId, ...otherParams } = params;
  return request(`${Prefix}/${organizationId}/prequal-group-headers/supplier/list`, {
    method: 'GET',
    query: otherParams,
  });
}
