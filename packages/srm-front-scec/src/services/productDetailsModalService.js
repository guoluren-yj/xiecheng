import request from 'utils/request';
import { SRM_SCEC } from '_utils/config';
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 * 集团商品查询列表
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function fetchGoodsList(params) {
  const param = parseParameters(params);
  return request(`${SRM_SCEC}/v1/${organizationId}/category-catalog-maps/check`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 公司商品查询列表
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function fetchCompanyGoodsList(params) {
  const param = parseParameters(params);
  return request(`${SRM_SCEC}/v1/${organizationId}/com-category-catalog-maps/check`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 平台商品查询列表
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function fetchEcGoodsList(params) {
  const param = parseParameters(params);
  return request(`${SRM_SCEC}/v1/platform-ecCategory-mapping/check`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 集团商品详情预览
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function fetchGoodsPreview(params) {
  const param = parseParameters(params);
  return request(
    `${SRM_SCEC}/v1/${organizationId}/category-catalog-maps/check/product-detail/${
      params.ecProductId
    }?platformCode=${params.ecPlatformCode}`,
    {
      method: 'GET',
      query: param,
    }
  );
}

/**
 * 公司商品详情预览
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function fetchCompanyGoodsPreview(params) {
  const param = parseParameters(params);
  return request(
    `${SRM_SCEC}/v1/${organizationId}/com-category-catalog-maps/check/product-detail/${
      params.companyId
    }/${params.ecProductId}?platformCode=${params.ecPlatformCode}`,
    {
      method: 'GET',
      query: param,
    }
  );
}

/**
 * 公司商品详情预览
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function fetchEcGoodsPreview(params) {
  const param = parseParameters(params);
  return request(
    `${SRM_SCEC}/v1/platform-ecCategory-mapping/check/product-detail/${
      params.ecProductId
    }?platformCode=${params.ecPlatformCode}`,
    {
      method: 'GET',
      query: param,
    }
  );
}
