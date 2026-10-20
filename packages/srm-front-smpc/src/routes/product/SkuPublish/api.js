import request from 'utils/request';
import { SRM_MALL } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 *  批量提交
 */
export async function batchSubmit(params) {
  const url = `/smpc/v1/${organizationId}/skus/batch-spu-publish`;
  return request(url, {
    method: 'POST',
    body: params,
  });
}

/**
 *  基础数据导出
 */
export async function handleBaseInfoExport(params) {
  return request(`${SRM_MALL}/v1/${organizationId}/category/export`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 生效-失效
 */
export async function changeSkuStatus(params) {
  return request(`/smpc/v1/${organizationId}/skus/change-sku-status`, {
    method: 'POST',
    body: params,
  });
}
