/**
 * operateRecordService - 电商平台-操作记录 - service
 * @date: 2019-2-14
 * @author: dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { SRM_SCEC } from '_utils/config';
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 * 商品操作记录
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function fetchOperateRecord(params) {
  const param = parseParameters(params);
  return request(`${SRM_SCEC}/v1/${organizationId}/product/history/${params.productId}`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 商品分享操作记录
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function fetchShareOperateRecord(params) {
  const param = parseParameters(params);
  return request(`${SRM_SCEC}/v1/${organizationId}/list-product-share-record`, {
    method: 'GET',
    query: param,
  });
}
