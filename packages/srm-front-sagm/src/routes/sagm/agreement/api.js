import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SAGM, SRM_SMPC } from '_utils/config';

const organizationId = getCurrentOrganizationId(); // 租户ID

export async function fetchCategory(catalogId) {
  return request(
    `${SRM_SMPC}/v1/${organizationId}/catalog-mappings/catalog-ref-categories/${catalogId}`,
    {
      method: 'GET',
    }
  );
}

// 添加商品
export async function agmLineAddSku(params) {
  const { agreementLineId, skuList } = params;
  return request(`${SRM_SAGM}/v1/${organizationId}/agreement-details/${agreementLineId}`, {
    method: 'POST',
    body: skuList,
  });
}

// 移除商品
export async function agmLineDelSku(params) {
  return request(`${SRM_SAGM}/v1/${organizationId}/agreement-details`, {
    method: 'DELETE',
    body: params,
  });
}

// 更换商品
export async function agmLineUpdateSku(params) {
  return request(`${SRM_SAGM}/v1/${organizationId}/agreement-details/change`, {
    method: 'POST',
    body: params,
  });
}

// 创建商品
export async function agmLineCreateSku(params) {
  const { cid, agreementSkuDTO } = params;
  return request(`${SRM_SAGM}/v1/${organizationId}/agreement-lines/batch-create-skus/${cid}`, {
    method: 'POST',
    body: agreementSkuDTO,
    headers: {
      's-request-web': 'srm_web',
    },
  });
}
