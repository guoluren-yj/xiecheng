import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';

const tenantId = getCurrentOrganizationId();
// const commonPrompt = 'ssta.settleStrategy.model.settleStrategy';

/**
 * 引用策略级平台确定按钮
 * @param {*} params
 */
export async function updateDetermDine(params) {
  return request(`/ssta/v1/${tenantId}/settle-config/by-site`, {
    method: 'POST',
    body: params,
  });
}
/**
 * 创建采购账单
 * @param {*} params
 */
export async function createPurchase(params) {
  return request(`/ssta/v1/${tenantId}/bill-headers/purchaser`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 创建销售账单
 * @param {} params
 */
export async function createSupply(params) {
  return request(`/ssta/v1/${tenantId}/bill-headers/supplier`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 保存采购账单
 * @param {*} params
 */
export async function updatePurchase(params) {
  return request(`/ssta/v1/${tenantId}/bill-headers/purchaser`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 保存销售账单
 * @param {*} params
 */
export async function updateSupply(params) {
  return request(`/ssta/v1/${tenantId}/bill-headers/supplier`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 采购账单确认
 * @param {*} params
 */
export async function confirmPurchase(params) {
  return request(`/ssta/v1/${tenantId}/bill-headers/purchaser/confirm`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 采购账单退回
 * @param {*} params
 */
export async function returnPurchase(params) {
  return request(`/ssta/v1/${tenantId}/bill-headers/purchaser/return-back`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 采购账单取消
 * @param {*} params
 */
export async function cancelPurchase(params) {
  return request(`/ssta/v1/${tenantId}/bill-headers/purchaser/cancel`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 对账单行取消
 * @param {*} params
 */
export async function cancelPurchaseLines(params) {
  return request(`/ssta/v1/${tenantId}/bill-lines/purchaser/cancel`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 对账单行取消
 * @param {*} params
 */
export async function cancelSupplyLines(params) {
  return request(`/ssta/v1/${tenantId}/bill-lines/supplier/cancel`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 采购账单提交
 * @param {*} params
 */
export async function submitPurchase(params) {
  return request(`/ssta/v1/${tenantId}/bill-headers/purchaser/submit`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 销售账单确认
 * @param {*} params
 */
export async function confirmSupply(params) {
  return request(`/ssta/v1/${tenantId}/bill-headers/supplier/confirm`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 销售账单退回
 * @param {*} params
 */
export async function returnSupply(params) {
  return request(`/ssta/v1/${tenantId}/bill-headers/supplier/return-back`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 销售账单取消
 * @param {*} params
 */
export async function cancelSupply(params) {
  return request(`/ssta/v1/${tenantId}/bill-headers/supplier/cancel`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 销售账单提交
 * @param {*} params
 */
export async function submitSupply(params) {
  return request(`/ssta/v1/${tenantId}/bill-headers/supplier/submit`, {
    method: 'PUT',
    body: params,
  });
}

export async function removeSupply(params) {
  return request(`/ssta/v1/${tenantId}/settles/bill-remove`, {
    method: 'PUT',
    body: params,
  });
}

export async function cancelRemoveSupply(params) {
  return request(`/ssta/v1/${tenantId}/settles/bill-undo-remove`, {
    method: 'PUT',
    body: params,
  });
}

export async function deletePurchase(params) {
  return request(`/ssta/v1/${tenantId}/bill-headers/purchaser`, {
    method: 'DELETE',
    body: params,
  });
}

export async function deletePurchaseLine(params) {
  return request(`/ssta/v1/${tenantId}/bill-lines/purchaser`, {
    method: 'DELETE',
    body: params,
  });
}

export async function deleteSupply(params) {
  return request(`/ssta/v1/${tenantId}/bill-headers/supplier`, {
    method: 'DELETE',
    body: params,
  });
}

export async function deleteSupplyLine(params) {
  return request(`/ssta/v1/${tenantId}/bill-lines/supplier`, {
    method: 'DELETE',
    body: params,
  });
}

export async function addLines(params) {
  const { billHeaderId, data } = params;
  return request(`/ssta/v1/${tenantId}/bill-lines/${billHeaderId}`, {
    method: 'POST',
    body: data,
  });
}
