import { getCurrentOrganizationId } from 'utils/utils';
import { filterNullGetUrl } from '@/routes/CommomPreview/config';
import request from 'utils/request';
import { SRM_MALL } from '_utils/config';

const organizationId = getCurrentOrganizationId();
// 商品详情信息
export function getProductDetail(data) {
  const { sourceFrom, productId, companyId, agreementLineId, isNew = false, ...other } = data;
  const _sourceFrom = sourceFrom || 'CATA';
  const fetchMaps = [
    {
      url: `${SRM_MALL}/v1/${organizationId}/product/${productId}/for-agreement-new?agreementLineId=${agreementLineId}`,
      params: { ...other, companyId, purchaseType: 'COMPANY' },
    },
    {
      url: `${SRM_MALL}/v1/${organizationId}/product/${productId}/for-agreement?agreementLineId=${agreementLineId}`,
      params: { ...other, companyId, purchaseType: 'COMPANY' },
    },
    {
      url: `${SRM_MALL}/v1/${organizationId}/product/${productId}`,
    },
    {
      url: `${SRM_MALL}/v1/${organizationId}/product/${productId}`,
    },
  ];

  const fetchInd = _sourceFrom === 'CATA' ? (agreementLineId ? (isNew ? 0 : 1) : 2) : 3;

  const { url, params = {} } = fetchMaps[fetchInd];
  return request(url, {
    method: 'GET',
    query: params,
  });
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
