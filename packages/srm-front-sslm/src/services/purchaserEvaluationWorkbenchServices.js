/**
 * @Author: 杨一昊 yihao.yang@going-link.com
 * @Date: 2023-01-30 14:10:42
 * @FilePath: /srm-front-sslm/src/services/purchaserEvaluationWorkbenchServices.js
 * @Copyright (c) 2023 by ZhenYun, All Rights Reserved.
 */
import request from 'utils/request';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import { SRM_SSLM } from '_utils/config';

const organizationId = getCurrentOrganizationId();
/**
 * 查询管理页签单据数量
 * @export
 * @returns
 */
export async function getManageCount() {
  return request(`${SRM_SSLM}/v1/${organizationId}/site-eval-headers/eval-report/count`, {
    method: 'POST',
  });
}

/**
 * 查询评分页签单据数量
 * @export
 * @returns
 */
export async function getScoreCount() {
  return request(`${SRM_SSLM}/v1/${organizationId}/site-eval-headers/eval-report/eval/count`, {
    method: 'POST',
  });
}

/**
 * 查询 供应商自评 单据数量
 * @export
 * @returns
 */
export async function getFeedbackCount() {
  return request(`${SRM_SSLM}/v1/${organizationId}/site-eval-headers/eval-report/feed-back/count`, {
    method: 'POST',
  });
}

/**
 * 查询 评估计划 单据数量
 * @export
 * @returns
 */
export async function getPlanCount() {
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-plan-lines/sale/count`, {
    method: 'POST',
  });
}

/**
 * @description: 批量删除
 * @param {*} params
 * @return {*}
 */
export async function handleBatchDeleteRecord({ params, customizeUnitCode }) {
  return request(`${SRM_SSLM}/v1/${organizationId}/site-eval-headers`, {
    method: 'DELETE',
    body: params,
    query: { customizeUnitCode },
  });
}

/**
 * @description: 批量废弃
 * @param {*} params
 * @return {*}
 */
export async function handleBatchDiscardRecord({ params, customizeUnitCode }) {
  return request(`${SRM_SSLM}/v1/${organizationId}/site-eval-headers/batch-discard`, {
    method: 'PUT',
    body: params,
    query: { customizeUnitCode },
  });
}

/**
 * 详情 --- 保存
 * @export
 * @returns
 */
export async function handleSaveAllDetail({ customizeUnitCode, wfParams = {}, ...params }) {
  return request(`${SRM_SSLM}/v1/${organizationId}/site-eval-headers/eval-report/create`, {
    method: 'POST',
    body: params,
    query: { customizeUnitCode, ...wfParams },
  });
}

/**
 * 详情 --- 头信息查询
 * @export
 * @returns
 */
export async function handleQueryHeader({ customizeUnitCode, evalHeaderId, tabPaneKey }) {
  const url = ['selfRatedEvaluated'].includes(tabPaneKey)
    ? `${SRM_SSLM}/v1/${organizationId}/site-eval-header-copy/eval-report/${evalHeaderId}`
    : `${SRM_SSLM}/v1/${organizationId}/site-eval-headers/eval-report/${evalHeaderId}`;
  return request(url, {
    method: 'GET',
    query: { customizeUnitCode },
  });
}

/**
 * 引用评估计划创建前置api - 查询当前计划的策略是否是最新的策略
 * @export
 * @returns
 */
export async function handleCheckIsNewStrategy(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-plan-lines/strategy-is-last`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 引用评估计划创建
 * @export
 * @returns
 */
export async function handleEvalPlanCreate(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-plan-lines/batch-create-site-eval`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 步骤条查询
 * @export
 * @returns
 */
export async function handleGetSteps() {
  return request(`${SRM_SSLM}/v1/${organizationId}/site-eval-headers/eval-report/stage`, {
    method: 'GET',
  });
}

/**
 * @description: 查询 评估 物料 / 品类
 * @param {*} params
 * @return {*}
 */
export async function handleQueryItemCategory(params) {
  const { evalHeaderId } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/site-eval-item-cates/${evalHeaderId}`, {
    method: 'GET',
  });
}

/**
 * 批量保存评分人
 * @param params
 * @returns {Promise<void>}
 */
export async function batchSaveGrader(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/site-eval-line-resps/batchCreate`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 评分人保存
 * @async
 * @param {Object} params - 查询参数
 */
export async function saveScorer(params) {
  const { evalLineId, tableValues } = params;
  return request(
    `${SRM_SSLM}/v1/${organizationId}/site-eval-line-resps/eval-report/${evalLineId}`,
    {
      method: 'POST',
      body: tableValues,
    }
  );
}

/**
 * 详情 --- 执行评分
 * @export
 * @returns
 */
export async function handleSExecutiveScore({ customizeUnitCode, evalHeaderId, ...params }) {
  return request(
    `${SRM_SSLM}/v1/${organizationId}/site-eval-headers/eval-report/${evalHeaderId}/evaluate`,
    {
      method: 'POST',
      body: { ...params, evalHeaderId },
      query: { customizeUnitCode },
    }
  );
}

/**
 * 评分详情 - 保存
 * @async
 * @param {Object} params - 查询参数
 */
export async function saveFillingScore(params) {
  const { customizeUnitCode = '', ...others } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/site-eval-line-resps/preservation`, {
    method: 'PUT',
    body: others,
    query: { customizeUnitCode },
  });
}

/**
 * 评分详情-提交
 * @async
 * @param {Object} params - 查询参数
 */
export async function submitFillingScore(params) {
  const { customizeUnitCode = '', ...others } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/site-eval-line-resps`, {
    method: 'PUT',
    body: others,
    query: { customizeUnitCode },
  });
}

// 判断权重是否相同
export async function weightSameJudge(params) {
  const { evalHeaderId, customizeUnitCode, ...body } = params;
  return request(
    `${SRM_SSLM}/v1/${organizationId}/site-eval-line-resps/current-user-weight-is-same/${evalHeaderId}/post`,
    {
      method: 'POST',
      query: { customizeUnitCode },
      body,
    }
  );
}

// 转交评分人
export async function transmitScorer(params) {
  const { evalHeaderId, ...body } = params;
  return request(
    `${SRM_SSLM}/v1/${organizationId}/site-eval-line-resps/batch-save-transform/${evalHeaderId}`,
    {
      method: 'POST',
      body,
    }
  );
}

// 放弃评分
export async function batchCancel(params) {
  const { evalHeaderId, ...body } = params;
  return request(
    `${SRM_SSLM}/v1/${organizationId}/site-eval-line-resps/batchCancel/${evalHeaderId}`,
    {
      method: 'POST',
      body,
    }
  );
}

/**
 * 提交审批
 * @async
 * @param {Object} params - 查询参数
 */
export async function submitApproval(params) {
  const { evalHeaderId, customizeUnitCode, ...body } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/site-eval-headers/submit/${evalHeaderId}`, {
    method: 'POST',
    body,
    query: { customizeUnitCode },
  });
}

/**
 * 汇总统计
 * @async
 * @param {Object} params - 查询参数
 */
export async function summaryStatistics(params) {
  const { evalHeaderId } = params;
  return request(
    `${SRM_SSLM}/v1/${organizationId}/site-eval-headers/${evalHeaderId}/final-collect`,
    {
      method: 'POST',
    }
  );
}

/**
 * 发布接口
 * @param params
 * @returns {Promise<void>}
 */
export async function publishReport(params) {
  const { customizeUnitCode = '', ...others } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/site-eval-headers/releaseSiteEval`, {
    method: 'POST',
    body: others,
    query: { customizeUnitCode },
  });
}

/**
 * 执行自评
 * @param params
 * @returns {Promise<void>}
 */
export async function submitFeedback(params) {
  const { customizeUnitCode = '', ...others } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/site-eval-headers/feedbackSiteEval`, {
    method: 'POST',
    body: others,
    query: { customizeUnitCode },
  });
}

/**
 * 退回自评
 * @async
 * @param {Object} params - 查询参数
 */
export async function handleBack(params) {
  const { customizeUnitCode = '', evalHeaderId, ...others } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/site-eval-headers/${evalHeaderId}/back`, {
    method: 'POST',
    body: {
      ...others,
      evalHeaderId,
    },
    query: { customizeUnitCode },
  });
}

/**
 * 退回评分
 */
export async function handleBackScore(params) {
  return request(
    `${SRM_SSLM}/v1/${organizationId}/site-eval-headers/processEvalScoreBack/${params.evalHeaderId}`,
    {
      method: 'POST',
      body: filterNullValueObject(params),
    }
  );
}

/**
 * 详情页-删除
 * @async
 * @param {Object} params - 查询参数
 */
export async function detailDelete(params) {
  const { evalHeaderId } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/site-eval-headers/${evalHeaderId}`, {
    method: 'DELETE',
  });
}

/**
 * 详情-作废
 * @async
 * @param {Object} params - 查询参数
 */
export async function detailInvalid(params) {
  const { evalHeaderId } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/site-eval-headers/${evalHeaderId}`, {
    method: 'PUT',
  });
}

// 采购方评估---复制
export async function dealCopy(params) {
  const { evalHeaderId, ...rest } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/site-eval-headers/copy/${evalHeaderId}`, {
    method: 'POST',
    body: rest,
  });
}

/**
 * 保存 - 供应商自评
 * @param params
 * @returns {Promise<void>}
 */
export async function saveFeedBackInfo(params) {
  const { customizeUnitCode, ...others } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/site-eval-headers/updateSiteEvalHeader`, {
    method: 'POST',
    body: others,
    query: { customizeUnitCode },
  });
}

/**
 * 供应商自评提交接口
 * @param params
 * @returns {Promise<void>}
 */
export async function submitFeedBack(params) {
  const { customizeUnitCode, ...others } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/site-eval-headers/feedbackedSiteEval`, {
    method: 'POST',
    body: others,
    query: { customizeUnitCode },
  });
}

/**
 * 删除附件缓存
 * @param params
 * @returns {Promise<void>}
 */
export async function handleRemoveAtt(params) {
  const { evalHeaderId, removeCatch } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/site-eval-att-lns/${evalHeaderId}`, {
    method: 'DELETE',
    body: removeCatch,
  });
}

/**
 * 供应商自评提交接口
 * @param params
 * @returns {Promise<void>}
 */
export async function handleQueryAttList(params) {
  const { evalHeaderId } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/site-eval-att-lns/history/${evalHeaderId}`, {
    method: 'GET',
  });
}

// 查询权限集
export async function getPermission(data) {
  return request(`/iam/hzero/v1/menus/check-permissions`, {
    method: 'POST',
    body: data,
  });
}

// 获取整改单据
export async function getRectificationItems(reformContent) {
  return request(
    `${SRM_SSLM}/v1/${organizationId}/site-eval-headers/eval-report/create_problem_headers`,
    {
      method: 'POST',
      body: reformContent,
    }
  );
}

// 评估信息保存接口
export async function saveAssessmentInfo(siteEvalLineList) {
  return request(`${SRM_SSLM}/v1/${organizationId}/site-eval-lines/eval-report-line/update`, {
    method: 'POST',
    body: siteEvalLineList,
  });
}

// 雷达图数据查询
export async function featchChartData(params) {
  const { evalHeaderId, ...query } = params;
  return request(
    `${SRM_SSLM}/v1/${organizationId}/site-eval-lines/supplier-indicator-score/${evalHeaderId}`,
    {
      method: 'GET',
      query,
    }
  );
}

// 列表发布评估
export async function batchRelease(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/site-eval-headers/eval-report/release`, {
    method: 'POST',
    body: params,
  });
}

// 列表-导出评估报告附件
export async function batchExportAttachment(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/site-eval-headers/eval-report/batch-download`, {
    method: 'POST',
    body: params,
  });
}

// 详情-导出评估报告附件
export async function exportAttachment(params) {
  return request(
    `${SRM_SSLM}/v1/${organizationId}/site-eval-headers/eval-report/single-download/${params.evalHeaderId}`,
    {
      method: 'POST',
      body: params,
    }
  );
}

// 取消-评估行
export async function cancelPlanLines(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-plan-lines/change/cancel`, {
    method: 'POST',
    body: params,
  });
}

// 删除指标
export async function deleteIndicator(params) {
  const { evalHeaderId, selectedRows } = params;
  return request(
    `${SRM_SSLM}/v1/${organizationId}/site-eval-lines/deleteSiteEvalLineByIds/${evalHeaderId}`,
    {
      method: 'POST',
      body: selectedRows,
    }
  );
}
