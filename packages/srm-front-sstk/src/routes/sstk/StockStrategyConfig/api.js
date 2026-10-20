import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
const SRM_STCK = '/stck';

export function fetchSubStrategy(params) {
  return request(`${SRM_STCK}/v1/${organizationId}/stock-strategy-headers/children-list`, {
    method: 'GET',
    query: params,
  });
}

// 库存策略保存
export function fetchSaveStrategy(params) {
  return request(`${SRM_STCK}/v1/${organizationId}/stock-strategy-headers/save-or-update`, {
    method: 'POST',
    body: params,
  });
}

// 库存策略发布
export function fetchPublishStrategy(params) {
  return request(`${SRM_STCK}/v1/${organizationId}/stock-strategy-headers/save-and-release`, {
    method: 'POST',
    body: params,
  });
}

// 库存策略取消发布
export function fetchCancelPublish(params) {
  return request(`${SRM_STCK}/v1/${organizationId}/stock-strategy-headers/cancel`, {
    method: 'POST',
    body: params,
  });
}

export function fetchLovFields(viewCode) {
  return request(`/hpfm/v1/${organizationId}/lov-view/info`, {
    method: 'GET',
    query: {viewCode},
  });
}
// 批次维度保存、更新
export function fetchSaveSDimension(params) {
  return request(`${SRM_STCK}/v1/${organizationId}/batch-dimensions/save-or-update`, {
    method: 'POST',
    body: params,
  });
}
// 批次维度明细
export function fetchDimensionDetail(dimensionId) {
  return request(`${SRM_STCK}/v1/${organizationId}/batch-dimensions/${dimensionId}`, {
    method: 'GET',
  });
}
// 批次维度启用禁用
export function enabledDimension(params) {
  return request(`${SRM_STCK}/v1/${organizationId}/batch-dimensions/enable`, {
    method: 'POST',
    body: params,
  });
}
// 库存策略明细
export function fetchStrategyDetail(strategyId) {
  return request(`${SRM_STCK}/v1/${organizationId}/stock-strategy-headers/${strategyId}`, {
    method: 'GET',
  });
}
// 库存策略下的物料信息
// export function fetchStrategyItem(strategyId) {
//   return request(`${SRM_STCK}/v1/${organizationId}/stock-strategy-items/strategy-item/${strategyId}`, {
//     method: 'GET',
//   });
// }

// 添加物料-穿梭框
export function fetchAddItem(params, strategyId) {
  return request(`${SRM_STCK}/v1/${organizationId}/stock-strategy-items/batch-save-item/${strategyId}`, {
    method: 'POST',
    body: params,
  });
}

// 移除物料-穿梭框
export function fetchRemoveItem(params) {
  return request(`${SRM_STCK}/v1/${organizationId}/stock-strategy-items/batch-delete`, {
    method: 'DELETE',
    body: params,
  });
}

// 删除批次维度
export function fetchBatchRemoveDimension(params) {
  return request(`${SRM_STCK}/v1/${organizationId}/stock-strategy-batchs/batch-delete`, {
    method: 'DELETE',
    body: params,
  });
}

// 策略解锁
export function fetchUnlock(params) {
  return request(`${SRM_STCK}/v1/${organizationId}/stock-strategy-headers/unlock`, {
    method: 'POST',
    body: params,
  });
}

// 维度变更校验
export function fetchValidateDimension(dimensionId) {
  return request(`${SRM_STCK}/v1/${organizationId}/stock-strategy-headers/used-check/${dimensionId}`, {
    method: 'GET',
  });
}
