/**
 * goodsPreviewService - 商品预览Service
 * @date: 2019年3月15日 16:24:21
 * @author: Jehu <zhihao.zeng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { SRM_SCEI, SRM_MALL } from '_utils/config';
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId(); // 租户ID

/**
 * 查询商品详情
 * @export
 * @param {object} params
 * @returns
 */
export async function fetchProductDetail(params) {
  const param = parseParameters(params);
  const { companyId, platformCode, ecProductId } = params;
  const ecUrl = companyId
    ? `${SRM_SCEI}/v1/${organizationId}/ec-products/${companyId}/${ecProductId}`
    : `${SRM_SCEI}/v1/ec-products/${ecProductId}`;
  const url =
    platformCode === 'CATA' ? `${SRM_MALL}/v1/${organizationId}/product/${ecProductId}` : ecUrl;
  return request(url, {
    method: 'GET',
    query: param,
  });
}
