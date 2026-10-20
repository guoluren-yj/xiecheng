import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';

const SRM_SMCT = '/smct';
const organizationId = getCurrentOrganizationId();

// 发布拼单
export function centralizePublish(templateId, params) {
  return request(`${SRM_SMCT}/v1/${organizationId}/centralized-templates/publish/${templateId}`, {
    method: 'POST',
    body: params,
  });
}

// 启用/禁用
export async function centralizeEnable(params) {
  const url = `${SRM_SMCT}/v1/${organizationId}/centralized-templates/enable`;
  return request(url, {
    method: 'POST',
    body: params,
  });
}

// 拼单明细
export async function fetchCentralize(templateId) {
  const url = `${SRM_SMCT}/v1/${organizationId}/centralized-templates/${templateId}`;
  return request(url, {
    method: 'GET',
  });
}

// 拼单保存
export async function centralizeSave(params) {
  const url = `${SRM_SMCT}/v1/${organizationId}/centralized-templates`;
  return request(url, {
    method: 'POST',
    body: params,
  });
}

// 发布校验接口
export function centralizeCheck(params) {
  return request(`${SRM_SMCT}/v1/${organizationId}/centralized-fixed-skus/check`, {
    method: 'GET',
    query: params,
  });
}

// 保存并发布
export function centralizeSavePublish(params) {
  return request(`${SRM_SMCT}/v1/${organizationId}/centralized-templates/save-publish`, {
    method: 'POST',
    body: params,
  });
}

// 添加商品
export function addCentralizeSku(params) {
  return request(`${SRM_SMCT}/v1/${organizationId}/centralized-fixed-skus`, {
    method: 'POST',
    body: params,
  });
}

// 取消拼单
export function centralizeCancelService(params) {
  return request(`${SRM_SMCT}/v1/${organizationId}/centralized-templates/cancel`, {
    method: 'POST',
    body: params,
  });
}

// 复制拼单
export function centralizeCopyService(templateId) {
  return request(`${SRM_SMCT}/v1/${organizationId}/centralized-templates/copy/${templateId}`, {
    method: 'POST',
  });
}

// 删除拼单
export function centralizeDeleteService(params) {
  return request(`${SRM_SMCT}/v1/${organizationId}/centralized-templates`, {
    method: 'DELETE',
    body: params,
  });
}

// 删除时校验商品
export function centralizeDeleteCheckService(params) {
  return request(`${SRM_SMCT}/v1/${organizationId}/centralized-fixed-skus/check-order`, {
    method: 'POST',
    body: params,
  });
}
