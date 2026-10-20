/**
 * @Author: 杨一昊 yihao.yang@going-link.com
 * @Date: 2023-01-03 11:41:10
 * @FilePath: /srm-front-sslm/src/services/evaluationStrategyServices.js
 * @Copyright (c) 2023 by ZhenYun, All Rights Reserved.
 */
import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SSLM } from '_utils/config';

const organizationId = getCurrentOrganizationId();

/**
 * 查询历史版本列表页
 * @export
 * @returns
 */
export async function handleQueryHistoryList({ strategyCode, ...rest }) {
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-plan-strategys/history/${strategyCode}`, {
    method: 'GET',
    query: rest,
  });
}

/**
 * @description: 评估策略 - 新建
 * @param {*} params
 * @return {*}
 */
export async function handleSaveDetail(params) {
  const { customizeUnitCode, ...rest } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-plan-strategys`, {
    method: 'POST',
    body: { ...rest, tenantId: organizationId },
    query: { customizeUnitCode },
  });
}

/**
 * @description: 评估策略 - 保存
 * @param {*} params
 * @return {*}
 */
export async function handleEditDetail(params) {
  const { customizeUnitCode, ...rest } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-plan-strategys`, {
    method: 'PUT',
    body: rest,
    query: { customizeUnitCode },
  });
}

/**
 * @description: 评估策略 - 复制
 * @param {*} params
 * @return {*}
 */
export async function handleCopyRecord(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-plan-strategys/copy`, {
    method: 'POST',
    body: { ...params },
  });
}

/**
 * @description: 评估策略 - 发布
 * @param {*} params
 * @return {*}
 */
export async function handlePublishDetail(params) {
  const { customizeUnitCode, ...rest } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-plan-strategys/release`, {
    method: 'POST',
    body: rest,
    query: { customizeUnitCode },
  });
}

/**
 * 启用/禁用 评估策略
 * @export
 * @returns
 */
export async function handleOperationEnabled(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-plan-strategys`, {
    method: 'GET',
    query: params,
  });
}
