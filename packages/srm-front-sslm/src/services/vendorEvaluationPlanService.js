/**
 * @Author: 杨一昊 yihao.yang@going-link.com
 * @Date: 2022-12-06 21:31:07
 * @FilePath: /srm-front-sslm/src/services/vendorEvaluationPlanService.js
 * @Copyright (c) 2022 by ZhenYun, All Rights Reserved.
 */
import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SSLM } from '_utils/config';

const organizationId = getCurrentOrganizationId();

/**
 * 查询供应商管控维度配置
 * @export
 * @returns
 */
export async function getUserDefaultMsg() {
  return request(`${SRM_SSLM}/v1/${organizationId}/sample-send-reqs/getUserAndUserMasterUnit`, {
    method: 'GET',
  });
}

/**
 * @description: 整单-评估计划 批量删除
 * @param {*} params
 * @return {*}
 */
export async function handleBatchDeleteRecord(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-plan-headers`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * @description: 评估计划详情 - 新建/保存
 * @param {*} params
 * @return {*}
 */
export async function handleSaveDetail(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-plan-headers`, {
    method: 'POST',
    body: params,
    query: { customizeUnitCode: params.customizeUnitCode },
  });
}

/**
 * @description: 评估计划详情 - 发布
 * @param {*} params
 * @return {*}
 */
export async function handlePublishDetail(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-plan-headers/submitApprove`, {
    method: 'POST',
    body: params,
    query: { customizeUnitCode: params.customizeUnitCode },
  });
}

/**
 * @description: 评估计划详情 - 批量创建评估报告
 * @param {*} params
 * @return {*}
 */
export async function handleCreateEvaluationReport(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-plan-lines/batch-create-site-eval`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 查询整单页签单据数量
 * @export
 * @returns
 */
export async function getWholeCount() {
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-plan-headers/count`, {
    method: 'POST',
  });
}

/**
 * 查询明细页签单据数量
 * @export
 * @returns
 */
export async function getDetailCount() {
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-plan-lines/count`, {
    method: 'POST',
  });
}

/**
 * 评估计划行取消
 * @export
 * @returns
 */
export async function handleCancelLineRecord(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-plan-lines/cancel`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 评估计划头取消
 * @export
 * @returns
 */
export async function handleCancelRecord(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-plan-headers/cancel`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 复制
 * @export
 * @returns
 */
export async function dealCopy(params) {
  const { evalPlanHeaderId } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-plan-headers/copy/${evalPlanHeaderId}`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 变更
 * @export
 * @returns
 */
export async function dealChange(params) {
  const { evalPlanHeaderId } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-plan-headers/change/${evalPlanHeaderId}`, {
    method: 'POST',
    body: params,
  });
}
