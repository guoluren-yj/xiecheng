/**
 * goodsPreviewService - 商品预览Service
 * @date: 2019年3月15日 16:24:21
 * @author: Jehu <zhihao.zeng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { SRM_SCEC, SRM_SCEI } from '_utils/config';
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId(); // 租户ID

/**
 * 查询商品详情
 * @export
 * @param {object} params
 * @returns
 */
export async function fetchProductPlatFormCode(param) {
  return request(`${SRM_SCEC}/v1/ec-products/queryPlatform`, {
    method: 'GET',
    query: param,
    responseType: 'text',
  });
}

/**
 * goodsPreview的查询商品详情
 * @export
 * @param {object} params
 * @returns
 */
export async function fetchProductDetail(params) {
  const { platformCode, companyId, ecProductId } = params;
  const ecUrl = companyId
    ? `${SRM_SCEI}/v1/${organizationId}/ec-products/${companyId}/${ecProductId}`
    : `${SRM_SCEI}/v1/ec-products/${ecProductId}`;
  const url =
    platformCode === 'CATA' ? `${SRM_SCEC}/v1/${organizationId}/product/${ecProductId}` : ecUrl;
  return request(url, {
    method: 'GET',
    query: { platformCode },
  });
}

/**
 * commonPreview的查询商品详情接口
 * @export
 * @param {object} params
 * @returns
 */
export async function fetchDetail(params) {
  const { platformCode, productId } = params;
  return request(`${SRM_SCEC}/v1/any-product/${productId}`, {
    method: 'GET',
    query: { platformCode },
  });
}

export async function fetchGroupProductDetail(params) {
  const param = parseParameters(params);
  const { ecClientId, ecProductId } = params;
  const url = `${SRM_SCEI}/v1/${organizationId}/${ecClientId}/ec-products/${ecProductId}`;
  return request(url, {
    method: 'GET',
    query: param,
  });
}
