import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SMPC } from 'srm-front-boot/lib/utils/config';

const organizationId = getCurrentOrganizationId();

/**
 *查询分类
 *
 */
// export async function fetchTypeTree() {
//   return request(`/smpc/v1/category/getTreeWithThreeList`, {
//     method: 'GET',
//   });
// }

// 保存
export async function fetchSaveApply(params) {
  return request(`${SRM_SMPC}/v1/${organizationId}/sku-shelve-apply-headers/create`, {
    method: 'POST',
    body: params,
  });
}

// 提交
export async function fetchSubmitApply(params) {
  return request(`${SRM_SMPC}/v1/${organizationId}/sku-shelve-apply-headers/submit`, {
    method: 'POST',
    body: params,
  });
}

// 删除
export async function fetchDeleteApply(params) {
  return request(`${SRM_SMPC}/v1/${organizationId}/sku-shelve-apply-headers`, {
    method: 'DELETE',
    body: params,
  });
}

// 带出默认供应商
export async function fetchDefaultSupplier(params) {
  return request(`${SRM_SMPC}/v1/${organizationId}/sup-skus/supplier-info`, {
    method: 'GET',
    query: params,
  });
}

// 申请行保存
export async function fetchSaveApplyLine(params) {
  return request(`${SRM_SMPC}/v1/${organizationId}/sku-shelve-apply-lines`, {
    method: 'POST',
    body: params,
  });
}

// 申请行删除 || 批量
export async function fetchDeleteApplyLine(params) {
  return request(`${SRM_SMPC}/v1/${organizationId}/sku-shelve-apply-lines`, {
    method: 'DELETE',
    body: params,
  });
}

// 取消申请
export async function fetchCancelApply(params) {
  return request(`${SRM_SMPC}/v1/${organizationId}/sku-shelve-apply-headers/cancel`, {
    method: 'POST',
    body: params,
  });
}

// 查询上下架批量审批工作流
export async function fetchBatchShelfWorkflowApprove(batchId, sourceFrom) {
  return request(
    `${
      sourceFrom === 'CATA' ? SRM_SMPC : '/smec'
    }/v1/${organizationId}/sku-approve-batchs/batch-detail/${batchId}`,
    {
      method: 'GET',
    }
  );
}

// 查询上下架批量审批工作流商品信息
export async function fetchShelfWorkflowSkuInfo(skuId) {
  return request(`${SRM_SMPC}/v1/${organizationId}/skus/sku-preview/${skuId}`, {
    method: 'GET',
  });
}
