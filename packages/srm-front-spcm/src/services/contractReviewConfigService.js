/*
 * @Date: 2025-03-28 10:28:35 合同审查配置
 * @Author: CDJ
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import request from 'utils/request';
import { SRM_SPCM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

// 创建审查点
export async function createReviewPoint(params) {
  const { customizeUnitCode = '', data = {} } = params;
  return request(`${SRM_SPCM}/v1/${organizationId}/check-point-types/create`, {
    method: 'POST',
    body: data,
    query: { customizeUnitCode },
  });
}

// 更新审查点
export async function updateReviewPoint(params) {
  const { customizeUnitCode = '', data = {} } = params;
  return request(`${SRM_SPCM}/v1/${organizationId}/check-point-types/update`, {
    method: 'POST',
    body: data,
    query: { customizeUnitCode },
  });
}

// 启用审查点
export async function enableReviewPoint(params) {
  const { reviewPointId = '' } = params;
  return request(`${SRM_SPCM}/v1/${organizationId}/check-point-types/${reviewPointId}/enable`, {
    method: 'POST',
  });
}

// 禁用审查点
export async function disableReviewPoint(params) {
  const { reviewPointId = '' } = params;
  return request(`${SRM_SPCM}/v1/${organizationId}/check-point-types/${reviewPointId}/disable`, {
    method: 'POST',
  });
}

// 复制审查点
export async function copyReviewPoint(params) {
  const { reviewPointId = '' } = params;
  return request(`${SRM_SPCM}/v1/${organizationId}/check-point-types/${reviewPointId}/copy`, {
    method: 'POST',
  });
}

// 创建审查模版
export async function createReviewTemplate(params) {
  const { customizeUnitCode = '', data = {} } = params;
  return request(`${SRM_SPCM}/v1/${organizationId}/check-template-headers/create`, {
    method: 'POST',
    body: data,
    query: { customizeUnitCode },
  });
}

// 更新审查模版
export async function updateReviewTemplate(params) {
  const { customizeUnitCode = '', data = {} } = params;
  return request(`${SRM_SPCM}/v1/${organizationId}/check-template-headers/update`, {
    method: 'PUT',
    body: data,
    query: { customizeUnitCode },
  });
}

// 发布审查模版
export async function publishReviewTemplate(params) {
  const { customizeUnitCode = '', data = {} } = params;
  return request(`${SRM_SPCM}/v1/${organizationId}/check-template-headers/publish`, {
    method: 'POST',
    body: data,
    query: { customizeUnitCode },
  });
}
// 保存审查模版行数据
export async function saveReviewTemplateLineInfo(params) {
  const { customizeUnitCode = '', data = [] } = params;
  return request(`${SRM_SPCM}/v1/${organizationId}/check-template-lines/update`, {
    method: 'POST',
    body: data,
    query: { customizeUnitCode },
  });
}

// 解锁已发布的审查模版
export async function unlockReviewTemplate(params) {
  return request(`${SRM_SPCM}/v1/${organizationId}/check-template-headers/edit`, {
    method: 'DELETE',
    body: params,
  });
}

// 复制审查模版
export async function copyReviewTemplate(params) {
  return request(`${SRM_SPCM}/v1/${organizationId}/check-template-headers/copy`, {
    method: 'POST',
    body: params,
  });
}

// 启用/禁用审查模版
export async function enableOrDisableReviewTemplate(params) {
  return request(`${SRM_SPCM}/v1/${organizationId}/check-template-headers/enable`, {
    method: 'POST',
    body: params,
  });
}

// 查询审查模版历史版本
export async function fetchReviewTemplateHistory(params) {
  return request(`${SRM_SPCM}/v1/${organizationId}/check-template-headers/history`, {
    method: 'GET',
    query: params,
  });
}
