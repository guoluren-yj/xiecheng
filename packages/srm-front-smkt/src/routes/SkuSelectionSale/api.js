import { getCurrentOrganizationId } from 'utils/utils';
import request from 'utils/request';
// import { SRM_SMKT } from '_utils/config';

const SRM_SMKT = '/smkt';

const organizationId = getCurrentOrganizationId();
// 商品上架
export function batchSkuShelf(params) {
  return request(`${SRM_SMKT}/v1/${organizationId}/skus/batch-shelve`, {
    method: 'POST',
    body: params,
  });
}
// 商品下架
export function batchSkuUnShelf(params) {
  return request(`${SRM_SMKT}/v1/${organizationId}/skus/batch-unshelve`, {
    method: 'POST',
    body: params,
  });
}
