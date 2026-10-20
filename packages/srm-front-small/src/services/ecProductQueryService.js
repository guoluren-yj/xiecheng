/**
 * ecProductQueryService - 集团电商商品查询 - service
 * @date: 2019-6-27
 * @author LH <heng.liu@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';
import { SRM_MALL } from '_utils/config';

const organizationId = getCurrentOrganizationId();
// const SRM_MALL = '/smal';
/**
 * 商品查询列表
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function fetchGoodsList(params) {
  const param = parseParameters(params);
  return request(`${SRM_MALL}/v1/${organizationId}/ec-product/company-list`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 商品详情预览
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function fetchGoodsPreview(params) {
  const param = parseParameters(params);
  return request(
    `${SRM_MALL}/v1/${organizationId}/ec-products/${params.companyId}/${params.ecProductId}`,
    {
      method: 'GET',
      query: param,
    }
  );
}
