/**
 * ecCompanyProductQueryService - 公司电商商品查询 - service
 * @date: 2019-6-27
 * @author LH <heng.liu@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { SRM_SCEC } from '_utils/config';
import { HZERO_PLATFORM } from 'utils/config';
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 * 当前公司值集查询
 * @async
 * @function fetchCurrentCompanyValue
 * @returns {object} fetch Promise
 */
export async function fetchCurrentCompanyValue(params) {
  return request(`${HZERO_PLATFORM}/v1/lovs/data`, {
    method: 'GET',
    query: { ...params },
  });
}

/**
 * 商品查询列表
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function fetchGoodsList(params) {
  const param = parseParameters(params);
  return request(`${SRM_SCEC}/v1/${organizationId}/ec-product/company-list`, {
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
    `${SRM_SCEC}/v1/${organizationId}/ec-products/${params.companyId}/${
      params.ecProductId
    }?platformCode=${params.ecPlatformCode}`,
    {
      method: 'GET',
      query: param,
    }
  );
}
