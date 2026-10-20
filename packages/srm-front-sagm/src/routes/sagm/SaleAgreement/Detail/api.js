import request from 'utils/request';
import { getCurrentOrganizationId, parseParameters } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

// 保存
export function saveAgreement(params) {
  return request(`/sagm/v1/${organizationId}/sale-agreement-headers`, {
    method: 'POST',
    body: params,
  });
}

// 发布
export function effectAgreement(params) {
  return request(`/sagm/v1/${organizationId}/sale-agreement-headers/published`, {
    method: 'POST',
    body: params,
  });
}

// 取消发布
export function expireAgreement(params) {
  return request(`/sagm/v1/${organizationId}/sale-agreement-headers/cancel`, {
    method: 'POST',
    body: params,
  });
}

// 查询
export function fetchAgreementDetail(params) {
  return request(`/sagm/v1/${organizationId}/sale-agreement-headers`, {
    method: 'GET',
    query: params,
  });
}

// 删除
export function deleteAgreement(params) {
  return request(`/sagm/v1/${organizationId}/sale-agreement-headers`, {
    method: 'DELETE',
    body: params,
  });
}

// 查询价格策略行
export function fetchSalePriceStrategy(params) {
  return request(`/sagm/v1/${organizationId}/sale-price-strategy-lines`, {
    method: 'GET',
    query: parseParameters(params),
  });
}

// 查询最大优先级
export function fetchMaxPriority(params) {
  return request(
    `/sagm/v1/${organizationId}/sale-price-strategy-lines/${params.agreementHeaderId}`,
    {
      method: 'GET',
    }
  );
}

// 删除价格策略行
export function deleteSalePriceStrategy(params) {
  return request(`/sagm/v1/${organizationId}/sale-price-strategy-lines`, {
    method: 'DELETE',
    body: params,
  });
}

// 执行价格策略行
export function executeStrategy(params) {
  return request(`/sagm/v1/${organizationId}/sale-price-strategy-lines/execute`, {
    method: 'POST',
    body: params,
  });
}

// 还原价格策略行
export function restoreStrategy(params) {
  return request(`/sagm/v1/${organizationId}/sale-price-strategy-lines/restore`, {
    method: 'POST',
    body: params,
  });
}

// 保存权限集
export function savePermissionList(params) {
  return request(`/sagm/v1/${organizationId}/authority-lists`, {
    method: 'POST',
    body: params,
  });
}

// 查询权限集
export function fetchPermissionList(params) {
  return request(`/sagm/v1/${organizationId}/authority-lists`, {
    method: 'GET',
    query: parseParameters(params),
  });
}

// 加入商品映射
export function joinAssignSku(params) {
  return request(`/sagm/v1/${organizationId}/auth-sku-details`, {
    method: 'POST',
    body: params,
  });
}

// 删除商品映射
export function deleteAssignSku(params) {
  return request(`/sagm/v1/${organizationId}/auth-sku-details`, {
    method: 'DELETE',
    body: params,
  });
}

// 销售协议行状态变更
export function updateSaleLine(params) {
  const { suffix, saleLines } = params;
  return request(`/sagm/v1/${organizationId}/sale-agreement-lines/${suffix}`, {
    method: 'POST',
    body: saleLines,
  });
}
