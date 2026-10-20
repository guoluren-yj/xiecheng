import { getCurrentOrganizationId } from 'utils/utils';
import request from 'utils/request';
// import { SRM_MALL } from '_utils/config';

const SRM_SMPC = '/smpc';

const organizationId = getCurrentOrganizationId();
// 商品详情信息
export function getProductDetail(data) {
  const { productId } = data;
  const fetchMaps = [
    {
      url: `${SRM_SMPC}/v1/${organizationId}/skus/sku-preview/${productId}`,
    },
  ];

  const { url, params = {} } = fetchMaps[0];
  return request(url, {
    method: 'GET',
    query: params,
  });
}
