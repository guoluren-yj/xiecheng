import request from 'utils/request';
import { SRM_MALL } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { filterNullGetUrl } from './config';

const organizationId = getCurrentOrganizationId();

// 商品详情信息
export function getProductDetail(data) {
  const { backPath, productId, companyId, agreementLineId, ...other } = data;
  const detailUrl = agreementLineId
    ? `${SRM_MALL}/v1/${organizationId}/product/${productId}/for-agreement?agreementLineId=${agreementLineId}`
    : `${SRM_MALL}/v1/${organizationId}/product/${productId}?companyId=${companyId}`;
  if (agreementLineId) {
    return request(detailUrl, {
      method: 'GET',
      query: {
        ...other,
        companyId,
        purchaseType: 'COMPANY',
      },
    });
  } else {
    return request(detailUrl, {
      swal: false,
    });
  }
}

// 获取评论列表
export function fetchComments(productId, data) {
  const queryUrl = `${SRM_MALL}/v1/product-assessments/query-product-assessment?productId=${productId}`;
  return request(queryUrl, {
    method: 'GET',
    query: data,
  });
}

export function queryAddress(params) {
  const url = `${SRM_MALL}/v1/${organizationId}/addresss/default-address`;
  return request(url, {
    method: 'GET',
    query: params,
  });
}

export function queryStock(queryParams, bodyParams) {
  const { companyId } = queryParams;
  const url = `${SRM_MALL}/v1/batch-obtain-stock/batch`;
  const queryUrl = filterNullGetUrl(url, { companyId, ...queryParams });
  return request(queryUrl, {
    method: 'POST',
    body: JSON.stringify(bodyParams),
  });
}

export function queryPay(queryParams, bodyParams) {
  const { companyId } = queryParams;
  const url = `${SRM_MALL}/v1/ec-products/getIsCode`;
  const queryUrl = filterNullGetUrl(url, { companyId, ...queryParams });
  return request(queryUrl, {
    method: 'POST',
    body: JSON.stringify(bodyParams),
  });
}

export function addCollect(params) {
  const { companyId, purchaseType } = params;
  const newParams = [
    {
      ...params,
      companyId,
      purchaseType,
      tenantId: organizationId,
    },
  ];
  const url = `${SRM_MALL}/v1/${organizationId}/product-favorites`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(newParams),
  });
}

export function addCartService(params) {
  const { companyId, userId: ownerId } = params;
  const newParams = { companyId, ownerId, ...params };
  const url = `${SRM_MALL}/v1/${organizationId}/shopping-carts`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(newParams),
  });
}

export function fetchParityProduct(params) {
  const url = `${SRM_MALL}/v1/${organizationId}/ec-products/price-compare`;
  return request(url, {
    method: 'GET',
    query: params,
  });
}

/**
 *
 * @param params
 * {ecProductId=1
 * ecCategoryId=5834}
 * scec-25409
 */
export function fetchEcMoreProduct(params) {
  const url = `${SRM_MALL}/v1/${organizationId}/ec-products/recommendation`;
  return request(url, {
    method: 'GET',
    query: params,
  });
}

/**
 *
 * @param params
 * Long tenantId,
 * Long productId,
 * Long catalogId
 */
export function fetchMoreProduct(params) {
  const url = `${SRM_MALL}/v1/${organizationId}/product/recommendation`;
  return request(url, {
    method: 'GET',
    query: params,
  });
}

/**
 *
 * @param params
 * Long tenantId,
 * Long productId,
 * Long catalogId
 */
export function fetchPriceChange(params) {
  const { productId, type } = params;
  const url = `${SRM_MALL}/v1/${organizationId}/price-changes/${productId}/${type}`;
  return request(url, {
    method: 'GET',
    query: params,
  });
}
