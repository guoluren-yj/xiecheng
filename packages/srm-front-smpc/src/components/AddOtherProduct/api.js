import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

export function fetchProductPriceService(params) {
  return request(`/sagm/v1/${organizationId}/agreement/ec/product/price`, {
    method: 'POST',
    body: params,
  });
}

export function fetchSkuStockService(params) {
  return request(`/smpc/v1/${organizationId}/sku-stocks/batch-get-stock`, {
    method: 'POST',
    body: params,
  });
}

export function addPriceComparisonService(params) {
  return request(`/smpc/v1/${organizationId}/pur-skus/srm/add-price-comparison`, {
    method: 'POST',
    body: params,
  });
}

export function addressDetailService(params) {
  return request(`/smal/v1/${organizationId}/addresss/detail`, {
    method: 'POST',
    body: params,
  });
}
