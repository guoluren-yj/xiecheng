/**
 * productShelvesService - 电商商品上下架 - service
 * @date: 2019-12-25
 * @author: lx <xia.li@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { SRM_SCEC } from '_utils/config';
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';

// const SRM_SCEC = '/scec-25496';
const organizationId = getCurrentOrganizationId();

/**
 * 商品列表查询
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function fetchShelvesList(params) {
  const param = parseParameters(params);
  return request(`${SRM_SCEC}/v1/${organizationId}/ec-products/tnt-shelf-list`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 商品批量上架/下架
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function batchPutaway(params) {
  const url =
    params[0].tntShelfFlag === 0
      ? `${SRM_SCEC}/v1/${organizationId}/ec-products/tnt-shelf`
      : `${SRM_SCEC}/v1/${organizationId}/ec-products/tnt-un-shelf`;
  return request(url, {
    method: 'POST',
    body: params,
  });
}

export async function fetchCompanyId(params) {
  return request(`${SRM_SCEC}/v1/${organizationId}/banner/companyId`, {
    method: 'GET',
    query: { ecClientId: params.ecClientId },
  });
}
